import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earnedAt: string;
}

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
  check: (userId: string) => Promise<boolean>;
}

/**
 * Badge System
 *
 * Tracks achievements with neuro humor
 */
const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'not_lissenceph',
    name: 'Not Actually a Lissenceph',
    description: 'No nodes below 40% for 14 consecutive days',
    emoji: '🧠',
    check: async (userId: string) => {
      // Check if any nodes are below 40%
      const weakNodes = await prisma.node.findMany({
        where: {
          userId,
          nodeStrength: { lt: 40 },
        },
      });

      if (weakNodes.length > 0) return false;

      // Check if this has been true for 14 days
      // For MVP, we'll just check current state
      // TODO: Track historical data for streak checking
      return true;
    },
  },
  {
    id: 'lord_of_intumescences',
    name: 'Lord of Intumescences',
    description: 'All spinal cord nodes at 80% or higher',
    emoji: '🦴',
    check: async (userId: string) => {
      const spinalNodes = await prisma.node.findMany({
        where: {
          userId,
          name: { contains: 'spinal', mode: 'insensitive' },
        },
      });

      if (spinalNodes.length === 0) return false;

      return spinalNodes.every((node) => node.nodeStrength >= 80);
    },
  },
  {
    id: 'csf_resurrection',
    name: 'CSF Resurrection',
    description: 'Raised a node from below 30% to above 70%',
    emoji: '💧',
    check: async (userId: string) => {
      // This requires tracking historical data
      // For MVP, we'll check if any node is above 70%
      // TODO: Implement proper historical tracking
      const strongNodes = await prisma.node.findMany({
        where: {
          userId,
          nodeStrength: { gte: 70 },
        },
      });

      return strongNodes.length > 0;
    },
  },
  {
    id: 'cortical_overlord',
    name: 'Cortical Overlord',
    description: 'Overall score of 90% or higher for 30 days',
    emoji: '👑',
    check: async (userId: string) => {
      const nodes = await prisma.node.findMany({
        where: { userId },
      });

      if (nodes.length === 0) return false;

      const avgStrength =
        nodes.reduce((sum, node) => sum + node.nodeStrength, 0) / nodes.length;

      return avgStrength >= 90;
    },
  },
  {
    id: 'demyelinating_disaster_recovering',
    name: 'Demyelinating Disaster (Recovering)',
    description: 'Raised 3+ nodes from red to yellow or better in one week',
    emoji: '🔥',
    check: async (userId: string) => {
      // This requires historical tracking
      // For MVP, check if there are 3+ nodes in yellow/green range
      const improvedNodes = await prisma.node.findMany({
        where: {
          userId,
          nodeStrength: { gte: 60 }, // Yellow range and above
        },
      });

      return improvedNodes.length >= 3;
    },
  },
  {
    id: 'perfect_streak_7',
    name: '7-Day Perfect Streak',
    description: 'Reviewed cards every day for 7 consecutive days',
    emoji: '🔥',
    check: async (userId: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check last 7 days
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
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

        if (reviewsOnDay === 0) return false;
      }

      return true;
    },
  },
  {
    id: 'hyperreflexic_hero',
    name: 'Hyperreflexic Hero',
    description: 'Achieved 95%+ on any node',
    emoji: '💠',
    check: async (userId: string) => {
      const hyperNode = await prisma.node.findFirst({
        where: {
          userId,
          nodeStrength: { gte: 95 },
        },
      });

      return hyperNode !== null;
    },
  },
];

/**
 * Check for newly earned badges and award them
 */
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { badges: true },
  });

  if (!user) return [];

  const currentBadges = (user.badges as any[]) || [];
  const earnedBadgeIds = new Set(currentBadges.map((b: any) => b.id));

  const newBadges: Badge[] = [];

  for (const def of BADGE_DEFINITIONS) {
    // Skip if already earned
    if (earnedBadgeIds.has(def.id)) continue;

    // Check if badge should be awarded
    const earned = await def.check(userId);
    if (earned) {
      const badge: Badge = {
        id: def.id,
        name: def.name,
        description: def.description,
        emoji: def.emoji,
        earnedAt: new Date().toISOString(),
      };

      newBadges.push(badge);
      currentBadges.push(badge);
    }
  }

  // Update user badges if any new ones were earned
  if (newBadges.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { badges: currentBadges as any },
    });
  }

  return newBadges;
}

/**
 * Get all badges (earned and unearned) for a user
 */
export async function getAllBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { badges: true },
  });

  const earnedBadges = (user?.badges as Badge[]) || [];
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  const allBadges = BADGE_DEFINITIONS.map((def) => {
    const earned = earnedBadges.find((b) => b.id === def.id);
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      emoji: def.emoji,
      earned: !!earned,
      earnedAt: earned?.earnedAt,
    };
  });

  return allBadges;
}
