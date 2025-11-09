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

// Get achievement progress
router.get('/achievements', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get all nodes to calculate achievement progress
    const allNodes = await prisma.node.findMany({
      where: { userId },
      select: { nodeStrength: true },
    });

    // Calculate achievement progress
    const totalNodes = allNodes.length;
    const cordCompetent = allNodes.filter(n => n.nodeStrength >= 70).length;
    const brainStemBoss = allNodes.filter(n => n.nodeStrength >= 85).length;
    const hyperreflexicHero = allNodes.filter(n => n.nodeStrength >= 95).length;

    // Get streak from stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const reviewsOnDay = await prisma.review.count({
        where: {
          userId,
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

    // Get total cards reviewed
    const totalReviewed = await prisma.review.count({
      where: { userId },
    });

    const achievements = [
      {
        id: 'cord-competent',
        title: 'Cord Competent',
        description: 'Get 70%+ nodes to ≥70% strength',
        icon: '🧠',
        current: cordCompetent,
        target: Math.ceil(totalNodes * 0.7),
        percentage: totalNodes > 0 ? Math.round((cordCompetent / (totalNodes * 0.7)) * 100) : 0,
      },
      {
        id: 'brain-stem-boss',
        title: 'Brain Stem Boss',
        description: 'Get 50%+ nodes to ≥85% strength',
        icon: '💪',
        current: brainStemBoss,
        target: Math.ceil(totalNodes * 0.5),
        percentage: totalNodes > 0 ? Math.round((brainStemBoss / (totalNodes * 0.5)) * 100) : 0,
      },
      {
        id: 'hyperreflexic-hero',
        title: 'Hyperreflexic Hero',
        description: 'Get 25%+ nodes to ≥95% strength',
        icon: '💠',
        current: hyperreflexicHero,
        target: Math.ceil(totalNodes * 0.25),
        percentage: totalNodes > 0 ? Math.round((hyperreflexicHero / (totalNodes * 0.25)) * 100) : 0,
      },
      {
        id: 'review-streak',
        title: 'Review Streak',
        description: 'Study every day without missing',
        icon: '🔥',
        current: streak,
        target: 30,
        percentage: Math.min(Math.round((streak / 30) * 100), 100),
      },
      {
        id: 'card-master',
        title: 'Card Master',
        description: 'Review cards to build knowledge',
        icon: '🎓',
        current: totalReviewed,
        target: 1000,
        percentage: Math.min(Math.round((totalReviewed / 1000) * 100), 100),
      },
    ];

    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

// Get hardest cards for drilling (from specific node)
router.get('/drill-hardest/:nodeId', async (req: AuthRequest, res) => {
  try {
    const { nodeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    // Verify ownership
    const node = await prisma.node.findFirst({
      where: { id: nodeId, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Get all cards from this node
    const cards = await prisma.card.findMany({
      where: {
        nodeId,
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
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          take: 5,
          select: {
            rating: true,
            reviewedAt: true,
          },
        },
      },
    });

    // Sort cards by difficulty (hardest first)
    const sortedCards = cards.sort((a, b) => {
      // Priority 1: Recent "Again" ratings (rating 0)
      const aRecentAgain = a.reviews.filter(r => r.rating === 0).length;
      const bRecentAgain = b.reviews.filter(r => r.rating === 0).length;
      if (aRecentAgain !== bRecentAgain) return bRecentAgain - aRecentAgain;

      // Priority 2: Lowest stability (FSRS data)
      const aStability = (a.fsrsData as any)?.stability || 0;
      const bStability = (b.fsrsData as any)?.stability || 0;
      if (aStability !== bStability) return aStability - bStability;

      // Priority 3: Most lapses
      const aLapses = (a.fsrsData as any)?.lapses || 0;
      const bLapses = (b.fsrsData as any)?.lapses || 0;
      return bLapses - aLapses;
    });

    // Take top N hardest cards
    const hardestCards = sortedCards.slice(0, limit).map(card => ({
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
      cards: hardestCards,
      count: hardestCards.length,
      nodeName: node.name,
    });
  } catch (error) {
    console.error('Get drill hardest error:', error);
    res.status(500).json({ error: 'Failed to get hardest cards' });
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
