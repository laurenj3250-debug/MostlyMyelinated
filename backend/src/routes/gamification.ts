import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { getUserStats } from '../services/gamification';
import { getAllBadges, getBadgeDefinitions } from '../services/badges';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/gamification/stats
 * Get comprehensive user stats for dopamine display
 */
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const stats = await getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * GET /api/gamification/level-progress
 * Get current level and XP progress
 */
router.get('/level-progress', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        xp: true,
        xpToNextLevel: true,
        title: true,
        totalXpEarned: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const progress = (user.xp / user.xpToNextLevel) * 100;

    res.json({
      level: user.level,
      xp: user.xp,
      xpToNextLevel: user.xpToNextLevel,
      title: user.title,
      totalXpEarned: user.totalXpEarned,
      progress,
    });
  } catch (error) {
    console.error('Get level progress error:', error);
    res.status(500).json({ error: 'Failed to get level progress' });
  }
});

/**
 * GET /api/gamification/badges
 * Get all badges (earned and unearned)
 */
router.get('/badges', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const badges = await getAllBadges(userId);
    res.json(badges);
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

/**
 * GET /api/gamification/badge-definitions
 * Get all possible badge definitions
 */
router.get('/badge-definitions', async (req: AuthRequest, res) => {
  try {
    const definitions = getBadgeDefinitions();
    res.json(definitions);
  } catch (error) {
    console.error('Get badge definitions error:', error);
    res.status(500).json({ error: 'Failed to get badge definitions' });
  }
});

/**
 * GET /api/gamification/combo
 * Get current combo status
 */
router.get('/combo', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentCombo: true,
        highestCombo: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      current: user.currentCombo,
      highest: user.highestCombo,
    });
  } catch (error) {
    console.error('Get combo error:', error);
    res.status(500).json({ error: 'Failed to get combo' });
  }
});

/**
 * GET /api/gamification/streak
 * Get current streak status
 */
router.get('/streak', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        lastStudyDate: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      streak: user.streak,
      lastStudyDate: user.lastStudyDate,
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ error: 'Failed to get streak' });
  }
});

/**
 * GET /api/gamification/session-stats
 * Get session-specific stats (today's performance)
 */
router.get('/session-stats', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's reviews
    const todaysReviews = await prisma.review.findMany({
      where: {
        userId,
        reviewedAt: { gte: today },
      },
      orderBy: { reviewedAt: 'asc' },
    });

    const totalReviews = todaysReviews.length;
    const totalXP = todaysReviews.reduce((sum, r) => sum + r.xpEarned, 0);
    const failedReviews = todaysReviews.filter((r) => r.rating === 0).length;
    const perfectReviews = todaysReviews.filter((r) => r.rating === 3).length;
    const highestCombo = Math.max(...todaysReviews.map((r) => r.comboAtReview), 0);

    const accuracy = totalReviews > 0
      ? ((totalReviews - failedReviews) / totalReviews) * 100
      : 0;

    const isPerfectSession = totalReviews > 0 && failedReviews === 0;

    res.json({
      totalReviews,
      totalXP,
      failedReviews,
      perfectReviews,
      highestCombo,
      accuracy,
      isPerfectSession,
    });
  } catch (error) {
    console.error('Get session stats error:', error);
    res.status(500).json({ error: 'Failed to get session stats' });
  }
});

export default router;
