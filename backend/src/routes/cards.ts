import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest, REVIEW_GRADE_MAP } from '../types';
import { processReview, createInitialFSRSData } from '../services/fsrsScheduler';
import { updateNodeStrength } from '../services/nodeStrength';
import {
  calculateXPEarned,
  updateCombo,
  awardXP,
  updateStreak,
  isFirstReviewToday,
  getRandomRoast,
  getRandomCelebration,
} from '../services/gamification';
import { checkAndAwardBadges } from '../services/badges';

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

// Submit card review - MAXIMUM DOPAMINE EDITION
router.post('/:id/review', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body; // 0 = Again, 1 = Hard, 2 = Good, 3 = Easy

    if (rating === undefined || rating < 0 || rating > 3) {
      return res.status(400).json({
        error: 'Rating must be 0 (Again), 1 (Hard), 2 (Good), or 3 (Easy)',
      });
    }

    const userId = req.user!.id;

    // Get card with node info
    const card = await prisma.card.findFirst({
      where: { id, userId },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            nodeStrength: true,
          },
        },
      },
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Store old node strength and band
    const oldStrength = card.node.nodeStrength;
    const getStrengthBand = (strength: number): string => {
      if (strength < 20) return 'Brain-dead';
      if (strength < 40) return 'LMN tetraplegic';
      if (strength < 60) return 'Non-ambulatory ataxic';
      if (strength < 75) return 'Ambulatory ataxic';
      if (strength < 85) return 'Mild paresis';
      if (strength < 95) return 'BAR, subtle deficits';
      return 'Hyperreflexic professor';
    };
    const oldBand = getStrengthBand(oldStrength);

    // GAMIFICATION: Update streak
    const streakInfo = await updateStreak(userId);

    // GAMIFICATION: Check if first review today
    const firstReviewToday = await isFirstReviewToday(userId);

    // GAMIFICATION: Update combo
    const { newCombo, comboBroken } = await updateCombo(userId, rating);

    // GAMIFICATION: Calculate XP earned
    const xpInfo = calculateXPEarned(rating, newCombo, firstReviewToday);

    // Process FSRS scheduling
    const { updatedFSRSData } = processReview(card.fsrsData as any, rating);

    // Map rating to grade (0, 0.4, or 1.0)
    const grade = REVIEW_GRADE_MAP[rating as keyof typeof REVIEW_GRADE_MAP];

    // Create review record with gamification data
    const review = await prisma.review.create({
      data: {
        userId,
        cardId: id,
        rating,
        grade,
        xpEarned: xpInfo.totalXP,
        comboAtReview: newCombo,
      },
    });

    // Update card with new FSRS data
    await prisma.card.update({
      where: { id },
      data: { fsrsData: updatedFSRSData },
    });

    // GAMIFICATION: Award XP and check for level ups
    const levelInfo = await awardXP(userId, xpInfo.totalXP);

    // Update node strength and check for band drops
    const newStrength = await updateNodeStrength(card.nodeId);
    const newBand = getStrengthBand(newStrength);
    const strengthDropped = oldStrength > newStrength && oldBand !== newBand;

    // GAMIFICATION: Check for new badges
    const newBadges = await checkAndAwardBadges(userId);

    // GAMIFICATION: Generate celebration or roast messages
    const messages: string[] = [];

    if (rating === 0) {
      // Failed review
      messages.push(getRandomRoast('failedReview'));
    } else if (rating === 3) {
      // Easy answer
      messages.push(getRandomCelebration('easyAnswer'));
    }

    if (comboBroken) {
      messages.push(getRandomRoast('comboBroken'));
    } else if (newCombo >= 20) {
      messages.push(getRandomCelebration('combo20'));
    } else if (newCombo >= 10) {
      messages.push(getRandomCelebration('combo10'));
    } else if (newCombo >= 5) {
      messages.push(getRandomCelebration('combo5'));
    } else if (newCombo >= 3) {
      messages.push(getRandomCelebration('combo3'));
    }

    if (levelInfo.leveledUp) {
      messages.push(getRandomCelebration('levelUp'));
    }

    if (firstReviewToday) {
      messages.push(getRandomCelebration('firstReview'));
    }

    if (streakInfo.streakBroken) {
      messages.push(getRandomRoast('streakBroken'));
    }

    if (strengthDropped) {
      messages.push(getRandomRoast('strengthDrop'));
    }

    if (oldStrength < 40) {
      messages.push(getRandomRoast('weakNode'));
    }

    // Return ALL the dopamine data
    res.json({
      review,
      nextDue: updatedFSRSData.due,
      updatedCard: {
        ...card,
        fsrsData: updatedFSRSData,
      },
      // Node strength data
      nodeStrength: {
        old: oldStrength,
        new: newStrength,
        oldBand,
        newBand,
        strengthDropped,
        nodeName: card.node.name,
      },
      // XP and leveling data
      xp: {
        baseXP: xpInfo.baseXP,
        multiplier: xpInfo.multiplier,
        bonusXP: xpInfo.bonusXP,
        totalXP: xpInfo.totalXP,
        leveledUp: levelInfo.leveledUp,
        oldLevel: levelInfo.oldLevel,
        newLevel: levelInfo.newLevel,
        newTitle: levelInfo.newTitle,
        currentXP: levelInfo.newXP,
        xpToNextLevel: levelInfo.xpToNextLevel,
      },
      // Combo data
      combo: {
        current: newCombo,
        comboBroken,
        multiplier: xpInfo.multiplier,
      },
      // Streak data
      streak: {
        current: streakInfo.streak,
        isNewDay: streakInfo.isNewDay,
        streakBroken: streakInfo.streakBroken,
      },
      // Badge data
      badges: {
        newBadges,
        totalEarned: newBadges.length,
      },
      // Messages
      messages,
    });
  } catch (error) {
    console.error('Review card error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
