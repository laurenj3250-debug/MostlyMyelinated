import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
  extractFactsFromText,
  generateCardsWithAI,
  generateNodeSummary,
  suggestFactImprovements,
  extractNodesFromTextbook,
  extractNodesFromLargeTextbook,
  extractTextFromPDF,
} from '../services/aiService';
import { createInitialFSRSData } from '../services/fsrsScheduler';

const router = Router();
const prisma = new PrismaClient();

// Multer setup for file uploads
const MAX_PDF_SIZE_MB = parseInt(process.env.MAX_PDF_SIZE_MB || '50', 10);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_SIZE_MB * 1024 * 1024 },
});

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
      statement: fact.cleanedText,
      factType: fact.factType,
    });

    // Create cards in database
    const cards = await Promise.all(
      aiCards.map((card) =>
        prisma.card.create({
          data: {
            userId: req.user!.id,
            nodeId: fact.nodeId!,
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
      node.facts.map((f) => f.cleanedText)
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
    const improvement = await suggestFactImprovements(fact.cleanedText);

    res.json({
      success: true,
      original: fact.cleanedText,
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
            userId: req.user!.id,
            nodeId,
            originalText: f.statement,
            cleanedText: f.statement,
            factType: f.factType,
            confidence: 0.8,
          },
        })
      )
    );

    let totalCards = 0;

    // Optionally generate cards for each fact
    if (autoGenerateCards) {
      for (const fact of facts) {
        const aiCards = await generateCardsWithAI({
          statement: fact.cleanedText,
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

/**
 * Extract nodes from textbook content (PDF or text)
 * POST /api/ai/extract-nodes
 * Supports large PDFs with automatic chunking
 */
router.post('/extract-nodes', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    let text = '';
    let fileName = 'text-input';
    let fileSize = 0;

    // Extract text from PDF or use provided text
    if (req.file) {
      fileName = req.file.originalname;
      fileSize = req.file.size;

      // Check file size
      if (fileSize > MAX_PDF_SIZE_MB * 1024 * 1024) {
        return res.status(400).json({
          error: `PDF too large. Maximum size is ${MAX_PDF_SIZE_MB}MB. Try uploading one chapter at a time.`,
        });
      }

      try {
        text = await extractTextFromPDF(req.file.buffer);
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return res.status(400).json({
          error: 'Failed to parse PDF. Please ensure the file is a valid PDF document.',
        });
      }
    } else if (req.body.text) {
      text = req.body.text;
      fileSize = text.length;
    } else {
      return res.status(400).json({ error: 'Either file or text required' });
    }

    if (text.length < 100) {
      return res.status(400).json({ error: 'Text too short for meaningful extraction (minimum 100 characters)' });
    }

    // Calculate estimated chunks
    const CHUNK_SIZE = parseInt(process.env.AI_CHUNK_SIZE || '30000', 10);
    const estimatedChunks = Math.ceil(text.length / CHUNK_SIZE);

    console.log(`Processing "${fileName}" (${fileSize} bytes, ${text.length} chars, ~${estimatedChunks} chunks)`);

    let result;
    let chunksProcessed = 1;

    // Use large textbook processing if text is large
    if (text.length > CHUNK_SIZE) {
      console.log('Using large textbook processing with auto-chunking');

      // Note: For now we process synchronously. In future, consider:
      // 1. Server-sent events for real-time progress
      // 2. Job queue with status polling
      // 3. WebSocket connection
      result = await extractNodesFromLargeTextbook(text, (current, total, chunkNodes) => {
        console.log(`Progress: ${current}/${total} chunks (${chunkNodes} nodes in this chunk)`);
      });

      chunksProcessed = result.chunksProcessed;
    } else {
      console.log('Using standard single-chunk processing');
      result = await extractNodesFromTextbook(text);
    }

    res.json({
      success: true,
      nodes: result.nodes,
      count: result.nodes.length,
      previewText: text.slice(0, 500),
      metadata: {
        fileName,
        fileSize,
        textLength: text.length,
        chunksProcessed,
        estimatedChunks,
      },
    });
  } catch (error: any) {
    console.error('AI node extraction error:', error);

    // Better error messages based on error type
    if (error.message?.includes('rate limit')) {
      return res.status(429).json({
        error: 'AI rate limit reached. Please wait a moment and try again.',
      });
    }

    if (error.message?.includes('timeout')) {
      return res.status(504).json({
        error: 'Request timed out. Try processing a smaller section of the textbook.',
      });
    }

    res.status(500).json({
      error: 'Failed to extract nodes from textbook. Please try again or use a smaller text sample.',
    });
  }
});

/**
 * Import extracted nodes to database
 * POST /api/ai/import-nodes
 */
router.post('/import-nodes', async (req: AuthRequest, res) => {
  try {
    const { nodes, fileName } = req.body;

    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return res.status(400).json({ error: 'nodes array required' });
    }

    // Extract chapter name from filename (e.g., "Chapter 8.pdf" → "chapter-8")
    let chapterTag: string | undefined;
    if (fileName) {
      const match = fileName.match(/chapter\s*(\d+)/i);
      if (match) {
        chapterTag = `chapter-${match[1]}`;
      }
    }

    // Map to track created nodes
    const nodeMap = new Map<string, string>();
    const createdNodes = [];

    // Create nodes in order (parents first)
    for (const nodeData of nodes) {
      const parentId = nodeData.parentName ? nodeMap.get(nodeData.parentName) : undefined;

      // Add chapter tag to all nodes
      const tags = nodeData.suggestedTags || [];
      if (chapterTag && !tags.includes(chapterTag)) {
        tags.push(chapterTag);
      }

      const node = await prisma.node.create({
        data: {
          userId: req.user!.id,
          name: nodeData.name,
          summary: nodeData.summary,
          parentId,
          tags,
        },
      });

      nodeMap.set(nodeData.name, node.id);
      createdNodes.push(node);
    }

    res.json({
      success: true,
      nodesCreated: createdNodes.length,
      nodes: createdNodes,
      chapterTag,
    });
  } catch (error) {
    console.error('AI node import error:', error);
    res.status(500).json({ error: 'Failed to import nodes' });
  }
});

export default router;
