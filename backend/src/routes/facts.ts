import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { generateCards, extractKeyTerms } from '../services/cardGenerator';
import { createInitialFSRSData } from '../services/fsrsScheduler';
import { parseFacts, findRelevantNodes } from '../services/parseFactsAgent';
import { generateEmbedding } from '../services/embeddingService';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Parse messy notes into facts and card variants (NEW ARCHITECTURE)
router.post('/parse', async (req: AuthRequest, res) => {
  try {
    const { notes, topic, imageUrls } = req.body;

    if (!notes || !Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({
        error: 'notes array is required and must not be empty',
      });
    }

    // Limit to 100 notes per request
    if (notes.length > 100) {
      return res.status(400).json({
        error: 'Maximum 100 notes per request',
      });
    }

    const userId = req.user!.id;

    // Get all user's nodes with embeddings for context
    // Note: This will fail until embeddings are added to nodes
    // For now, we'll work with empty nodes array or fetch without embeddings
    const userNodes = await prisma.node.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        summary: true,
        // embedding: true, // TODO: Add when embeddings column exists
      },
    });

    // For each note, find relevant nodes
    // TODO: Implement proper vector similarity search when pgvector is set up
    // For now, pass all nodes as context
    const contextNodes = userNodes.map(node => ({
      id: node.id,
      name: node.name,
      summary: node.summary || undefined,
      embedding: [], // TODO: Replace with actual embeddings
    }));

    // Parse the facts using AI
    const parsedFacts = await parseFacts(notes, contextNodes, topic);

    // Create facts and card variants in database
    const results = await Promise.all(
      parsedFacts.map(async (parsed) => {
        // Generate embedding for the cleaned fact
        let embedding;
        try {
          // TODO: Store embedding when pgvector is set up
          embedding = await generateEmbedding(parsed.cleaned);
        } catch (embErr) {
          console.warn('Failed to generate embedding:', embErr);
          embedding = null;
        }

        // Determine node assignment
        let assignedNodeId = null;
        const topMatch = parsed.nodeMatches[0];
        if (topMatch && topMatch.confidence > 0.85) {
          assignedNodeId = topMatch.id;
        }

        // Create the fact
        const fact = await prisma.fact.create({
          data: {
            userId,
            nodeId: assignedNodeId, // null = Unsorted
            originalText: parsed.original,
            cleanedText: parsed.cleaned,
            factType: parsed.factType,
            confidence: parsed.confidence,
          },
        });

        // Create card variants
        const cardVariants = await Promise.all(
          parsed.variants.map(variant =>
            prisma.cardVariant.create({
              data: {
                factId: fact.id,
                kind: variant.kind,
                front: variant.front,
                back: variant.back,
                confidence: variant.confidence,
                // FSRS defaults are set in schema
              },
            })
          )
        );

        return {
          original: parsed.original,
          cleaned: parsed.cleaned,
          factType: parsed.factType,
          confidence: parsed.confidence,
          nodeMatches: parsed.nodeMatches,
          newNodeProposal: parsed.newNodeProposal,
          variants: parsed.variants,
          factId: fact.id,
          variantIds: cardVariants.map(cv => cv.id),
        };
      })
    );

    res.json({
      parsed: results,
      count: results.length,
    });
  } catch (error: any) {
    console.error('Parse facts error:', error);
    res.status(500).json({
      error: 'Failed to parse facts',
      details: error.message,
    });
  }
});

// Create fact for a node
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { nodeId, statement, factType } = req.body;

    if (!nodeId || !statement || !factType) {
      return res.status(400).json({
        error: 'nodeId, statement, and factType are required',
      });
    }

    // Verify node ownership
    const node = await prisma.node.findFirst({
      where: { id: nodeId, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const fact = await prisma.fact.create({
      data: {
        userId: req.user!.id,
        nodeId,
        originalText: statement,
        cleanedText: statement,
        factType,
        confidence: 0.8,
      },
    });

    res.json(fact);
  } catch (error) {
    console.error('Create fact error:', error);
    res.status(500).json({ error: 'Failed to create fact' });
  }
});

// Update fact
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { statement, factType, keyTerms } = req.body;

    // Verify ownership via node
    const existingFact = await prisma.fact.findFirst({
      where: {
        id,
        node: { userId: req.user!.id },
      },
    });

    if (!existingFact) {
      return res.status(404).json({ error: 'Fact not found' });
    }

    const fact = await prisma.fact.update({
      where: { id },
      data: {
        ...(statement && { statement }),
        ...(factType && { factType }),
        ...(keyTerms && { keyTerms }),
      },
    });

    res.json(fact);
  } catch (error) {
    console.error('Update fact error:', error);
    res.status(500).json({ error: 'Failed to update fact' });
  }
});

// Delete fact
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify ownership via node
    const fact = await prisma.fact.findFirst({
      where: {
        id,
        node: { userId: req.user!.id },
      },
    });

    if (!fact) {
      return res.status(404).json({ error: 'Fact not found' });
    }

    await prisma.fact.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete fact error:', error);
    res.status(500).json({ error: 'Failed to delete fact' });
  }
});

// Preview cards from fact (without saving)
router.post('/:id/preview-cards', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Get fact and verify ownership
    const fact = await prisma.fact.findFirst({
      where: {
        id,
        node: { userId: req.user!.id },
      },
      include: {
        node: true,
      },
    });

    if (!fact) {
      return res.status(404).json({ error: 'Fact not found' });
    }

    // Generate card templates
    const templates = generateCards({
      statement: fact.cleanedText,
      factType: fact.factType as any,
      keyTerms: [],
    });

    res.json({
      fact,
      templates,
      count: templates.length,
    });
  } catch (error) {
    console.error('Preview cards error:', error);
    res.status(500).json({ error: 'Failed to preview cards' });
  }
});

// Generate cards from fact
router.post('/:id/generate-cards', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { cards: cardTemplates } = req.body; // Optional: allow custom cards

    // Get fact and verify ownership
    const fact = await prisma.fact.findFirst({
      where: {
        id,
        node: { userId: req.user!.id },
      },
      include: {
        node: true,
      },
    });

    if (!fact) {
      return res.status(404).json({ error: 'Fact not found' });
    }

    // Use provided templates or generate new ones
    const templates = cardTemplates || generateCards({
      statement: fact.cleanedText,
      factType: fact.factType as any,
      keyTerms: [],
    });

    // Create cards in database
    const cards = await Promise.all(
      templates.map((template: any) =>
        prisma.card.create({
          data: {
            userId: req.user!.id,
            nodeId: fact.nodeId!,
            factId: fact.id,
            front: template.front,
            back: template.back,
            hint: template.hint,
            cardType: template.cardType,
            fsrsData: createInitialFSRSData(),
          },
        })
      )
    );

    res.json({
      fact,
      cards,
      count: cards.length,
    });
  } catch (error) {
    console.error('Generate cards error:', error);
    res.status(500).json({ error: 'Failed to generate cards' });
  }
});

export default router;
