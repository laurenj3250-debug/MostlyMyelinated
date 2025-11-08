import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest, REVIEW_GRADE_MAP } from '../types';
import { processReview, createInitialFSRSData } from '../services/fsrsScheduler';
import { updateNodeStrength } from '../services/nodeStrength';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get single card
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const card = await prisma.card.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            nodeStrength: true,
          },
        },
        fact: true,
      },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(card);
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Failed to get card' });
  }
});

// Create card manually (without fact)
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { nodeId, front, back, hint, cardType } = req.body;

    if (!nodeId || !front || !back) {
      return res.status(400).json({
        error: 'nodeId, front, and back are required',
      });
    }

    // Verify node ownership
    const node = await prisma.node.findFirst({
      where: { id: nodeId, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const card = await prisma.card.create({
      data: {
        userId: req.user!.id,
        nodeId,
        front,
        back,
        hint,
        cardType: cardType || 'basic',
        fsrsData: createInitialFSRSData(),
      },
    });

    res.json(card);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update card
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { front, back, hint, cardType } = req.body;

    const card = await prisma.card.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: {
        ...(front && { front }),
        ...(back && { back }),
        ...(hint !== undefined && { hint }),
        ...(cardType && { cardType }),
      },
    });

    if (card.count === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const updatedCard = await prisma.card.findUnique({ where: { id } });
    res.json(updatedCard);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete card
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.card.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Submit card review
router.post('/:id/review', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body; // 0 = Again, 1 = Hard, 2 = Good, 3 = Easy

    if (rating === undefined || rating < 0 || rating > 3) {
      return res.status(400).json({
        error: 'Rating must be 0 (Again), 1 (Hard), 2 (Good), or 3 (Easy)',
      });
    }

    // Get card
    const card = await prisma.card.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Process FSRS scheduling
    const { updatedFSRSData } = processReview(card.fsrsData as any, rating);

    // Map rating to grade (0, 0.4, or 1.0)
    const grade = REVIEW_GRADE_MAP[rating as keyof typeof REVIEW_GRADE_MAP];

    // Create review record
    const review = await prisma.review.create({
      data: {
        userId: req.user!.id,
        cardId: id,
        rating,
        grade,
      },
    });

    // Update card with new FSRS data
    await prisma.card.update({
      where: { id },
      data: {
        fsrsData: updatedFSRSData,
      },
    });

    // Update node strength asynchronously (don't wait for it)
    updateNodeStrength(card.nodeId).catch((err) =>
      console.error('Failed to update node strength:', err)
    );

    res.json({
      review,
      nextDue: updatedFSRSData.due,
      updatedCard: {
        ...card,
        fsrsData: updatedFSRSData,
      },
    });
  } catch (error) {
    console.error('Review card error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
