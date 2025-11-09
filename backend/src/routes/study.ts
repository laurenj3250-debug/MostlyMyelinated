import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
  getWeightedReviewSession,
  getStudyStats,
} from '../services/studySession';
import { checkAndAwardBadges, getAllBadges } from '../services/badges';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get weighted study session
router.get('/session', async (req: AuthRequest, res) => {
  try {
    const maxCards = parseInt(req.query.max as string) || 80;

    const cards = await getWeightedReviewSession(req.user!.id, maxCards);

    res.json({
      cards,
      count: cards.length,
      maxCards,
    });
  } catch (error) {
    console.error('Get study session error:', error);
    res.status(500).json({ error: 'Failed to get study session' });
  }
});

// Get study statistics
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const stats = await getStudyStats(req.user!.id);

    // Get additional stats
    const totalNodes = await prisma.node.count({
      where: { userId: req.user!.id },
    });

    const totalFacts = await prisma.fact.count({
      where: { node: { userId: req.user!.id } },
    });

    const totalReviews = await prisma.review.count({
      where: { userId: req.user!.id },
    });

    // Get streak (days with reviews)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const reviewsOnDay = await prisma.review.count({
        where: {
          userId: req.user!.id,
          reviewedAt: {
            gte: checkDate,
            lt: nextDay,
          },
        },
      });

      if (reviewsOnDay > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({
      ...stats,
      totalNodes,
      totalFacts,
      totalReviews,
      streak,
    });
  } catch (error) {
    console.error('Get study stats error:', error);
    res.status(500).json({ error: 'Failed to get study stats' });
  }
});

// Get weak nodes study session (disaster mode)
router.get('/weak-nodes', async (req: AuthRequest, res) => {
  try {
    const maxCards = parseInt(req.query.max as string) || 50;
    const threshold = parseInt(req.query.threshold as string) || 60; // Nodes below this strength

    // Get all nodes below threshold
    const weakNodes = await prisma.node.findMany({
      where: {
        userId: req.user!.id,
        nodeStrength: { lt: threshold },
      },
      select: { id: true },
    });

    if (weakNodes.length === 0) {
      return res.json({
        cards: [],
        count: 0,
        maxCards,
        message: 'No weak nodes found! Everything is looking good.',
      });
    }

    const weakNodeIds = weakNodes.map(n => n.id);

    // Get due cards from weak nodes only
    const now = new Date();
    const dueCards = await prisma.card.findMany({
      where: {
        userId: req.user!.id,
        nodeId: { in: weakNodeIds },
      },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            nodeStrength: true,
          },
        },
      },
      take: maxCards,
      orderBy: [
        { node: { nodeStrength: 'asc' } }, // Weakest nodes first
      ],
    });

    const cards = dueCards.map((card) => ({
      id: card.id,
      nodeId: card.nodeId,
      nodeName: card.node.name,
      nodeStrength: card.node.nodeStrength,
      front: card.front,
      back: card.back,
      hint: card.hint,
      cardType: card.cardType,
      fsrsData: card.fsrsData,
    }));

    res.json({
      cards,
      count: cards.length,
      maxCards,
      weakNodesCount: weakNodes.length,
    });
  } catch (error) {
    console.error('Get weak nodes session error:', error);
    res.status(500).json({ error: 'Failed to get weak nodes session' });
  }
});

// Check and award badges
router.post('/check-badges', async (req: AuthRequest, res) => {
  try {
    const newBadges = await checkAndAwardBadges(req.user!.id);

    res.json({
      newBadges,
      count: newBadges.length,
    });
  } catch (error) {
    console.error('Check badges error:', error);
    res.status(500).json({ error: 'Failed to check badges' });
  }
});

// Get all badges for user
router.get('/badges', async (req: AuthRequest, res) => {
  try {
    const badges = await getAllBadges(req.user!.id);

    res.json({
      badges,
      earned: badges.filter(b => b.earned).length,
      total: badges.length,
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

// Get node progress over time
router.get('/progress/:nodeId', async (req: AuthRequest, res) => {
  try {
    const { nodeId } = req.params;

    // Verify ownership
    const node = await prisma.node.findFirst({
      where: { id: nodeId, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Get all reviews for cards in this node
    const reviews = await prisma.review.findMany({
      where: {
        card: { nodeId },
        userId: req.user!.id,
      },
      orderBy: { reviewedAt: 'asc' },
      select: {
        id: true,
        rating: true,
        grade: true,
        reviewedAt: true,
      },
    });

    // Calculate rolling strength over time
    const progressPoints: { date: string; strength: number }[] = [];

    if (reviews.length > 0) {
      let runningGrades: number[] = [];

      reviews.forEach((review) => {
        runningGrades.push(review.grade);

        // Keep only last 30 grades
        if (runningGrades.length > 30) {
          runningGrades = runningGrades.slice(-30);
        }

        // Calculate strength
        const avg =
          runningGrades.reduce((sum, g) => sum + g, 0) / runningGrades.length;
        const strength = Math.round(avg * 100);

        progressPoints.push({
          date: review.reviewedAt.toISOString(),
          strength,
        });
      });
    }

    res.json({
      node: {
        id: node.id,
        name: node.name,
        currentStrength: node.nodeStrength,
      },
      progress: progressPoints,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

export default router;
