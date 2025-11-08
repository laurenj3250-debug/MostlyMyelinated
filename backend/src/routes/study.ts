import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
  getWeightedReviewSession,
  getStudyStats,
} from '../services/studySession';

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
