import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
  extractFactsFromText,
  generateCardsWithAI,
  generateNodeSummary,
  suggestFactImprovements,
} from '../services/aiService';
import { createInitialFSRSData } from '../services/fsrsScheduler';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

/**
 * Extract facts from text using AI
 * POST /api/ai/extract-facts
 */
router.post('/extract-facts', async (req: AuthRequest, res) => {
  try {
    const { text, nodeId } = req.body;

    if (!text || !nodeId) {
      return res.status(400).json({ error: 'text and nodeId required' });
    }

    // Verify node ownership
    const node = await prisma.node.findFirst({
      where: { id: nodeId, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Extract facts using AI
    const extractedFacts = await extractFactsFromText(text);

    res.json({
      success: true,
      facts: extractedFacts,
      count: extractedFacts.length,
    });
  } catch (error) {
    console.error('AI fact extraction error:', error);
    res.status(500).json({ error: 'Failed to extract facts with AI' });
  }
});

/**
 * Generate cards from fact using AI (instead of templates)
 * POST /api/ai/generate-cards
 */
router.post('/generate-cards', async (req: AuthRequest, res) => {
  try {
    const { factId } = req.body;

    if (!factId) {
      return res.status(400).json({ error: 'factId required' });
    }

    // Get fact and verify ownership
    const fact = await prisma.fact.findFirst({
      where: {
        id: factId,
        node: { userId: req.user!.id },
      },
      include: { node: true },
    });

    if (!fact) {
      return res.status(404).json({ error: 'Fact not found' });
    }

    // Generate cards using AI
    const aiCards = await generateCardsWithAI({
      statement: fact.statement,
      factType: fact.factType,
    });

    // Create cards in database
    const cards = await Promise.all(
      aiCards.map((card) =>
        prisma.card.create({
          data: {
            userId: req.user!.id,
            nodeId: fact.nodeId,
            factId: fact.id,
            front: card.front,
            back: card.back,
            hint: card.hint,
            cardType: card.cardType,
            fsrsData: createInitialFSRSData(),
          },
        })
      )
    );

    res.json({
      success: true,
      cards,
      count: cards.length,
    });
  } catch (error) {
    console.error('AI card generation error:', error);
    res.status(500).json({ error: 'Failed to generate cards with AI' });
  }
});

/**
 * Generate summary for node using AI
 * POST /api/ai/generate-summary
 */
router.post('/generate-summary', async (req: AuthRequest, res) => {
  try {
    const { nodeId } = req.body;

    if (!nodeId) {
      return res.status(400).json({ error: 'nodeId required' });
    }

    // Get node with facts
    const node = await prisma.node.findFirst({
      where: { id: nodeId, userId: req.user!.id },
      include: { facts: true },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    if (node.facts.length === 0) {
      return res.status(400).json({ error: 'Node has no facts to summarize' });
    }

    // Generate summary using AI
    const summary = await generateNodeSummary(
      node.name,
      node.facts.map((f) => f.statement)
    );

    // Update node with summary
    await prisma.node.update({
      where: { id: nodeId },
      data: { summary },
    });

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('AI summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary with AI' });
  }
});

/**
 * Suggest improvements for a fact
 * POST /api/ai/improve-fact
 */
router.post('/improve-fact', async (req: AuthRequest, res) => {
  try {
    const { factId } = req.body;

    if (!factId) {
      return res.status(400).json({ error: 'factId required' });
    }

    // Get fact and verify ownership
    const fact = await prisma.fact.findFirst({
      where: {
        id: factId,
        node: { userId: req.user!.id },
      },
    });

    if (!fact) {
      return res.status(404).json({ error: 'Fact not found' });
    }

    // Get AI suggestions
    const improvement = await suggestFactImprovements(fact.statement);

    res.json({
      success: true,
      original: fact.statement,
      improved: improvement.improved,
      reasoning: improvement.reasoning,
    });
  } catch (error) {
    console.error('AI improvement error:', error);
    res.status(500).json({ error: 'Failed to get AI suggestions' });
  }
});

/**
 * Batch process: Extract facts and create them in node
 * POST /api/ai/batch-process
 */
router.post('/batch-process', async (req: AuthRequest, res) => {
  try {
    const { text, nodeId, autoGenerateCards } = req.body;

    if (!text || !nodeId) {
      return res.status(400).json({ error: 'text and nodeId required' });
    }

    // Verify node ownership
    const node = await prisma.node.findFirst({
      where: { id: nodeId, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Extract facts
    const extractedFacts = await extractFactsFromText(text);

    // Create facts in database
    const facts = await Promise.all(
      extractedFacts.map((f) =>
        prisma.fact.create({
          data: {
            nodeId,
            statement: f.statement,
            factType: f.factType,
            keyTerms: f.keyTerms,
          },
        })
      )
    );

    let totalCards = 0;

    // Optionally generate cards for each fact
    if (autoGenerateCards) {
      for (const fact of facts) {
        const aiCards = await generateCardsWithAI({
          statement: fact.statement,
          factType: fact.factType,
        });

        await Promise.all(
          aiCards.map((card) =>
            prisma.card.create({
              data: {
                userId: req.user!.id,
                nodeId,
                factId: fact.id,
                front: card.front,
                back: card.back,
                hint: card.hint,
                cardType: card.cardType,
                fsrsData: createInitialFSRSData(),
              },
            })
          )
        );

        totalCards += aiCards.length;
      }
    }

    res.json({
      success: true,
      factsCreated: facts.length,
      cardsCreated: totalCards,
      facts,
    });
  } catch (error) {
    console.error('AI batch process error:', error);
    res.status(500).json({ error: 'Failed to batch process with AI' });
  }
});

export default router;
