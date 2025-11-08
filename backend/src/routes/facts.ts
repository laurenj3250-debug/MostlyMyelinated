import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { generateCards, extractKeyTerms } from '../services/cardGenerator';
import { createInitialFSRSData } from '../services/fsrsScheduler';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Create fact for a node
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { nodeId, statement, factType, keyTerms } = req.body;

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

    // Extract key terms if not provided
    const terms = keyTerms || extractKeyTerms(statement);

    const fact = await prisma.fact.create({
      data: {
        nodeId,
        statement,
        factType,
        keyTerms: terms,
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

// Generate cards from fact
router.post('/:id/generate-cards', async (req: AuthRequest, res) => {
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
      statement: fact.statement,
      factType: fact.factType as any,
      keyTerms: fact.keyTerms,
    });

    // Create cards in database
    const cards = await Promise.all(
      templates.map((template) =>
        prisma.card.create({
          data: {
            userId: req.user!.id,
            nodeId: fact.nodeId,
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
