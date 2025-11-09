import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * MAXIMUM DOPAMINE XP AND LEVELING SYSTEM
 */

// XP awards based on review rating
export const XP_AWARDS = {
  AGAIN: 5,     // 0 = Again
  HARD: 10,     // 1 = Hard
  GOOD: 20,     // 2 = Good
  EASY: 30,     // 3 = Easy
};

// Bonus XP awards
export const XP_BONUSES = {
  FIRST_REVIEW_OF_DAY: 50,
  TEN_IN_A_ROW: 100,
  PERFECT_SESSION: 200,
};

// Combo multipliers
export const COMBO_MULTIPLIERS = {
  3: 2,   // 3+ combo = 2x XP
  5: 3,   // 5+ combo = 3x XP
  10: 4,  // 10+ combo = 4x XP
  20: 5,  // 20+ combo = 5x XP
};

// Neuro-themed level titles
export const LEVEL_TITLES: { [key: number]: string } = {
  1: 'Comatose Newbie',
  5: 'Barely Conscious',
  10: 'Sluggish Pupillary Response',
  15: 'Vestibulo-Ocular Reflexes Intact',
  20: 'Ambulatory But Ataxic',
  25: 'Mild Proprioceptive Deficits',
  30: 'BAR (Bright, Alert, Responsive)',
  35: 'Hyperesthetic',
  40: 'Hyperreflexic',
  50: 'Crossed Extensor Reflex Master',
  75: 'Schiff-Sherrington Phenomenon',
  100: 'Ascending Reticular Activating System God',
};

/**
 * Calculate XP required for next level (exponential growth)
 */
export function calculateXPForNextLevel(level: number): number {
  return Math.floor(100 * level * 1.5);
}

/**
 * Get title for current level
 */
export function getTitleForLevel(level: number): string {
  // Find the highest title level that's <= current level
  const titleLevels = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);

  for (const titleLevel of titleLevels) {
    if (level >= titleLevel) {
      return LEVEL_TITLES[titleLevel];
    }
  }

  return LEVEL_TITLES[1]; // Fallback to level 1 title
}

/**
 * Get combo multiplier based on current combo count
 */
export function getComboMultiplier(combo: number): number {
  if (combo >= 20) return COMBO_MULTIPLIERS[20];
  if (combo >= 10) return COMBO_MULTIPLIERS[10];
  if (combo >= 5) return COMBO_MULTIPLIERS[5];
  if (combo >= 3) return COMBO_MULTIPLIERS[3];
  return 1; // No multiplier below 3 combo
}

/**
 * Calculate XP earned for a review
 */
export function calculateXPEarned(
  rating: number,
  combo: number,
  isFirstReviewToday: boolean
): {
  baseXP: number;
  multiplier: number;
  bonusXP: number;
  totalXP: number;
} {
  // Base XP from rating
  let baseXP = 0;
  switch (rating) {
    case 0:
      baseXP = XP_AWARDS.AGAIN;
      break;
    case 1:
      baseXP = XP_AWARDS.HARD;
      break;
    case 2:
      baseXP = XP_AWARDS.GOOD;
      break;
    case 3:
      baseXP = XP_AWARDS.EASY;
      break;
  }

  // Apply combo multiplier
  const multiplier = getComboMultiplier(combo);
  const multipliedXP = baseXP * multiplier;

  // Add bonuses
  let bonusXP = 0;
  if (isFirstReviewToday) {
    bonusXP += XP_BONUSES.FIRST_REVIEW_OF_DAY;
  }

  const totalXP = multipliedXP + bonusXP;

  return {
    baseXP,
    multiplier,
    bonusXP,
    totalXP,
  };
}

/**
 * Update user combo (increment or reset)
 */
export async function updateCombo(
  userId: string,
  rating: number
): Promise<{ newCombo: number; comboBroken: boolean }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  let newCombo = user.currentCombo;
  let comboBroken = false;

  if (rating === 0) {
    // Again = break combo
    comboBroken = user.currentCombo > 0;
    newCombo = 0;
  } else {
    // Hard, Good, Easy = continue combo
    newCombo = user.currentCombo + 1;
  }

  // Update highest combo if needed
  const highestCombo = Math.max(user.highestCombo, newCombo);

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentCombo: newCombo,
      highestCombo,
    },
  });

  return { newCombo, comboBroken };
}

/**
 * Award XP and handle level ups
 */
export async function awardXP(
  userId: string,
  xpAmount: number
): Promise<{
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  newTitle: string;
  newXP: number;
  xpToNextLevel: number;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  const oldLevel = user.level;
  let newXP = user.xp + xpAmount;
  let newLevel = user.level;
  let xpToNextLevel = user.xpToNextLevel;
  let leveledUp = false;

  // Check for level ups (can level up multiple times)
  while (newXP >= xpToNextLevel) {
    newXP -= xpToNextLevel;
    newLevel += 1;
    xpToNextLevel = calculateXPForNextLevel(newLevel);
    leveledUp = true;
  }

  const newTitle = getTitleForLevel(newLevel);

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      level: newLevel,
      xpToNextLevel,
      title: newTitle,
      totalXpEarned: { increment: xpAmount },
    },
  });

  return {
    leveledUp,
    oldLevel,
    newLevel,
    newTitle,
    newXP,
    xpToNextLevel,
  };
}

/**
 * Update daily streak
 */
export async function updateStreak(userId: string): Promise<{
  streak: number;
  isNewDay: boolean;
  streakBroken: boolean;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const lastStudyDate = user.lastStudyDate
    ? new Date(user.lastStudyDate)
    : null;

  let isNewDay = false;
  let streakBroken = false;
  let newStreak = user.streak;

  if (!lastStudyDate) {
    // First time studying
    newStreak = 1;
    isNewDay = true;
  } else {
    const lastStudyDay = new Date(lastStudyDate);
    lastStudyDay.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastStudyDay.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day, streak continues
      isNewDay = false;
    } else if (daysDiff === 1) {
      // Next day, increment streak
      newStreak = user.streak + 1;
      isNewDay = true;
    } else {
      // Missed a day, streak broken
      newStreak = 1;
      isNewDay = true;
      streakBroken = true;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: newStreak,
      lastStudyDate: now,
    },
  });

  return {
    streak: newStreak,
    isNewDay,
    streakBroken,
  };
}

/**
 * Check if this is the first review today
 */
export async function isFirstReviewToday(userId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviewsToday = await prisma.review.count({
    where: {
      userId,
      reviewedAt: { gte: today },
    },
  });

  return reviewsToday === 0;
}

/**
 * Get user stats
 */
export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);

  // Today's stats
  const reviewsToday = await prisma.review.count({
    where: { userId, reviewedAt: { gte: today } },
  });

  const xpToday = await prisma.review.aggregate({
    where: { userId, reviewedAt: { gte: today } },
    _sum: { xpEarned: true },
  });

  // This week's stats
  const reviewsThisWeek = await prisma.review.count({
    where: { userId, reviewedAt: { gte: weekStart } },
  });

  const xpThisWeek = await prisma.review.aggregate({
    where: { userId, reviewedAt: { gte: weekStart } },
    _sum: { xpEarned: true },
  });

  // All-time stats
  const totalReviews = await prisma.review.count({ where: { userId } });

  const totalCards = await prisma.card.count({ where: { userId } });

  const totalNodes = await prisma.node.count({ where: { userId } });

  // Due cards
  const dueCards = await prisma.card.count({
    where: {
      userId,
      // This is simplified - in reality we'd parse fsrsData.due
    },
  });

  return {
    user: {
      level: user.level,
      xp: user.xp,
      xpToNextLevel: user.xpToNextLevel,
      title: user.title,
      streak: user.streak,
      currentCombo: user.currentCombo,
      highestCombo: user.highestCombo,
      totalXpEarned: user.totalXpEarned,
    },
    today: {
      reviews: reviewsToday,
      xp: xpToday._sum.xpEarned || 0,
      goal: user.maxReviewsPerDay,
    },
    week: {
      reviews: reviewsThisWeek,
      xp: xpThisWeek._sum.xpEarned || 0,
      goal: user.maxReviewsPerDay * 7,
    },
    allTime: {
      reviews: totalReviews,
      xp: user.totalXpEarned,
      highestStreak: user.streak, // TODO: track separately
      cards: totalCards,
      nodes: totalNodes,
    },
    due: {
      cards: dueCards,
      new: 0, // TODO: track new cards
    },
  };
}

/**
 * Aggressive roast/celebration messages based on performance
 */
export const ROAST_MESSAGES = {
  // Weak nodes (<40%)
  weakNode: [
    "This node's pupils are fixed and dilated 💀",
    'Flaccid paralysis of understanding detected',
    'More lesions than a distemper outbreak',
    'This node needs IMMEDIATE INTERVENTION',
    'Areflexic. Comatose. Basically dead.',
    'Your understanding is experiencing acute neurological decline',
    'This node has the strength of a wet noodle',
    'Brainstem reflexes absent. RIP.',
    'Lower motor neuron lesion confirmed',
    'Non-ambulatory tetraplegic status achieved',
  ],

  // Failed reviews (Again)
  failedReview: [
    'Wrong answer, no cookie 🍪',
    'That neuron did NOT fire',
    'Synapse failure detected',
    'Your myelin sheath is crumbling',
    'Reflexes: absent and ashamed',
    'That was painful to watch',
    'Even a lissencephalic could do better',
    'Your brain is experiencing technical difficulties',
    'Connection lost. Try again.',
    'Neurological exam: FAILED',
  ],

  // Combo broken
  comboBroken: [
    'COMBO BROKEN! 💔 Your neurons are weeping',
    'Streak ended. Your brain needs coffee.',
    'Synaptic transmission: INTERRUPTED',
    'The combo gods are disappointed',
    'You were so close to greatness...',
    'Neural pathway disrupted',
    'Connection terminated',
  ],

  // Streak broken
  streakBroken: [
    'Streak broken. Your neurons are SAD 😢',
    'Your myelin is demyelinating from neglect',
    'The brain atrophies when unused',
    'Neurons died while you were away',
    'Your synapses are gathering dust',
    'Absence makes the brain grow weaker',
  ],

  // Low node strength drop
  strengthDrop: [
    'Node strength dropping! Quick, review before it flatlines!',
    'This node is circling the drain',
    'Acute neurological emergency in progress',
    'Your knowledge is hemorrhaging',
    'Code blue! This node needs CPR!',
  ],
};

export const CELEBRATION_MESSAGES = {
  // Easy answer celebrations
  easyAnswer: [
    'HYPERREFLEXIC! 💪',
    'Schiff-Sherrington of success!',
    'Your myelin is THICC 🔥',
    'Crossed extensor reflex = PERFECT',
    'BAR status achieved!',
    'Neurons firing on all cylinders',
    'Synapse surgeon at work',
    'Brain: FULLY OPERATIONAL',
    'Cognitive function: MAXIMUM',
  ],

  // Combo celebrations
  combo3: [
    '3x COMBO! 🔥 Your neurons are warming up!',
    'Triple threat! Synapses synchronized!',
    '3x multiplier activated!',
  ],
  combo5: [
    '5x COMBO! 🔥🔥 Your brain is ON FIRE!',
    'Quintet of perfection!',
    '5x multiplier! The dopamine is REAL!',
  ],
  combo10: [
    '10x COMBO! 🔥🔥🔥 ASCENDING RETICULAR ACTIVATING SYSTEM ENGAGED!',
    'DECADAL DESTRUCTION! YOU ARE UNSTOPPABLE!',
    '10x multiplier! Your neurons are LEGENDARY!',
  ],
  combo20: [
    '20x MEGA COMBO! 💥💥💥 YOU ARE A MACHINE!',
    'TWENTY TIMES THE POWER! MAXIMUM CONSCIOUSNESS!',
    'The combo gods bow before you',
  ],

  // Level up
  levelUp: [
    'LEVEL UP! 🎉 Your brain just sprouted new dendrites 🧠',
    'NEW LEVEL UNLOCKED! Neuroplasticity in action!',
    'LEVEL INCREASED! Your myelin thickness is growing!',
    'YOU LEVELED UP! More neurons, more power!',
  ],

  // Perfect session
  perfectSession: [
    'PERFECT SESSION! Not a single "Again"! 🌟',
    'FLAWLESS VICTORY! Your brain is a well-oiled machine!',
    'PERFECTION ACHIEVED! Every synapse fired correctly!',
  ],

  // First review of day
  firstReview: [
    'First review of the day! +50 XP bonus! ☀️',
    'Early bird gets the dopamine! +50 XP!',
    'Daily grind initiated! +50 XP!',
  ],

  // Streak milestones
  streak7: [
    '7-DAY STREAK! 🔥 Your consistency is hyperreflexic!',
    'One week strong! The myelin is building!',
  ],
  streak30: [
    '30-DAY STREAK! 🔥🔥🔥 Your myelin is MAXIMUM THICC!',
    'One month! You are a neural powerhouse!',
  ],
  streak100: [
    '100-DAY STREAK! 💥🔥💥 YOU ARE IMMORTAL!',
    'Centennial achievement! Your neurons are LEGENDARY!',
  ],
};

/**
 * Get random roast message
 */
export function getRandomRoast(category: keyof typeof ROAST_MESSAGES): string {
  const messages = ROAST_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get random celebration message
 */
export function getRandomCelebration(
  category: keyof typeof CELEBRATION_MESSAGES
): string {
  const messages = CELEBRATION_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}
