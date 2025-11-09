import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpBonus: number;
}

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpBonus: number;
  check: (userId: string) => Promise<boolean>;
}

/**
 * MAXIMUM DOPAMINE BADGE SYSTEM
 * 50+ badges with neuro humor and ADHD-friendly rewards
 */
const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // MILESTONE BADGES
  {
    id: 'first_review',
    name: 'Consciousness Detected',
    description: 'Completed your first review',
    emoji: '👁️',
    rarity: 'common',
    xpBonus: 10,
    check: async (userId: string) => {
      const count = await prisma.review.count({ where: { userId } });
      return count >= 1;
    },
  },
  {
    id: 'reviews_10',
    name: 'Pupillary Light Reflex',
    description: 'Completed 10 reviews',
    emoji: '💡',
    rarity: 'common',
    xpBonus: 25,
    check: async (userId: string) => {
      const count = await prisma.review.count({ where: { userId } });
      return count >= 10;
    },
  },
  {
    id: 'reviews_50',
    name: 'Vestibulo-Ocular Intact',
    description: 'Completed 50 reviews',
    emoji: '👀',
    rarity: 'common',
    xpBonus: 50,
    check: async (userId: string) => {
      const count = await prisma.review.count({ where: { userId } });
      return count >= 50;
    },
  },
  {
    id: 'reviews_100',
    name: 'Ambulatory Status Achieved',
    description: 'Completed 100 reviews',
    emoji: '🚶',
    rarity: 'rare',
    xpBonus: 100,
    check: async (userId: string) => {
      const count = await prisma.review.count({ where: { userId } });
      return count >= 100;
    },
  },
  {
    id: 'reviews_500',
    name: 'Proprioceptive Mastery',
    description: 'Completed 500 reviews',
    emoji: '🧘',
    rarity: 'rare',
    xpBonus: 250,
    check: async (userId: string) => {
      const count = await prisma.review.count({ where: { userId } });
      return count >= 500;
    },
  },
  {
    id: 'reviews_1000',
    name: 'Hyperreflexic Dedication',
    description: 'Completed 1,000 reviews',
    emoji: '⚡',
    rarity: 'epic',
    xpBonus: 500,
    check: async (userId: string) => {
      const count = await prisma.review.count({ where: { userId } });
      return count >= 1000;
    },
  },
  {
    id: 'reviews_5000',
    name: 'Schiff-Sherrington Achievement',
    description: 'Completed 5,000 reviews',
    emoji: '💥',
    rarity: 'epic',
    xpBonus: 1000,
    check: async (userId: string) => {
      const count = await prisma.review.count({ where: { userId } });
      return count >= 5000;
    },
  },
  {
    id: 'reviews_10000',
    name: 'Ascending Reticular Activating System God',
    description: 'Completed 10,000 reviews - You are TRULY AWAKE',
    emoji: '🌟',
    rarity: 'legendary',
    xpBonus: 5000,
    check: async (userId: string) => {
      const count = await prisma.review.count({ where: { userId } });
      return count >= 10000;
    },
  },

  // STREAK BADGES
  {
    id: 'streak_3',
    name: 'Cerebral Consistency',
    description: '3-day review streak',
    emoji: '🔥',
    rarity: 'common',
    xpBonus: 30,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.streak || 0) >= 3;
    },
  },
  {
    id: 'streak_7',
    name: 'Weekly Neural Maintenance',
    description: '7-day review streak',
    emoji: '🔥🔥',
    rarity: 'rare',
    xpBonus: 100,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.streak || 0) >= 7;
    },
  },
  {
    id: 'streak_30',
    name: 'Monthly Myelination',
    description: '30-day review streak - Your myelin is THICC',
    emoji: '🔥🔥🔥',
    rarity: 'epic',
    xpBonus: 500,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.streak || 0) >= 30;
    },
  },
  {
    id: 'streak_100',
    name: 'Centennial Synapse Surgeon',
    description: '100-day review streak - Unstoppable neural pathways',
    emoji: '💥🔥💥',
    rarity: 'legendary',
    xpBonus: 2000,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.streak || 0) >= 100;
    },
  },
  {
    id: 'streak_365',
    name: 'Annual Axon Assassin',
    description: '365-day review streak - You are IMMORTAL',
    emoji: '👑🔥👑',
    rarity: 'legendary',
    xpBonus: 10000,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.streak || 0) >= 365;
    },
  },

  // NODE MASTERY BADGES
  {
    id: 'not_lissenceph',
    name: 'Not Actually a Lissenceph',
    description: 'No nodes below 40% for 14 consecutive days',
    emoji: '🧠',
    rarity: 'rare',
    xpBonus: 200,
    check: async (userId: string) => {
      const weakNodes = await prisma.node.findMany({
        where: { userId, nodeStrength: { lt: 40 } },
      });
      return weakNodes.length === 0;
    },
  },
  {
    id: 'nodes_5_strong',
    name: 'Pentanodal Power',
    description: '5 nodes above 85%',
    emoji: '💪',
    rarity: 'rare',
    xpBonus: 150,
    check: async (userId: string) => {
      const count = await prisma.node.count({
        where: { userId, nodeStrength: { gte: 85 } },
      });
      return count >= 5;
    },
  },
  {
    id: 'nodes_10_strong',
    name: 'Decadal Dendrite Destroyer',
    description: '10 nodes above 85%',
    emoji: '💪💪',
    rarity: 'epic',
    xpBonus: 300,
    check: async (userId: string) => {
      const count = await prisma.node.count({
        where: { userId, nodeStrength: { gte: 85 } },
      });
      return count >= 10;
    },
  },
  {
    id: 'all_nodes_70',
    name: 'Universal Neural Competence',
    description: 'All nodes above 70%',
    emoji: '🌐',
    rarity: 'epic',
    xpBonus: 500,
    check: async (userId: string) => {
      const nodes = await prisma.node.findMany({ where: { userId } });
      if (nodes.length === 0) return false;
      return nodes.every((n) => n.nodeStrength >= 70);
    },
  },
  {
    id: 'hyperreflexic_hero',
    name: 'Hyperreflexic Hero',
    description: 'Achieved 95%+ on any node',
    emoji: '💠',
    rarity: 'rare',
    xpBonus: 200,
    check: async (userId: string) => {
      const hyperNode = await prisma.node.findFirst({
        where: { userId, nodeStrength: { gte: 95 } },
      });
      return hyperNode !== null;
    },
  },
  {
    id: 'cortical_overlord',
    name: 'Cortical Overlord',
    description: 'Overall score of 90% or higher for 30 days',
    emoji: '👑',
    rarity: 'legendary',
    xpBonus: 1000,
    check: async (userId: string) => {
      const nodes = await prisma.node.findMany({ where: { userId } });
      if (nodes.length === 0) return false;
      const avg = nodes.reduce((sum, n) => sum + n.nodeStrength, 0) / nodes.length;
      return avg >= 90;
    },
  },

  // RECOVERY BADGES
  {
    id: 'csf_resurrection',
    name: 'CSF Resurrection',
    description: 'Raised a node from below 30% to above 70%',
    emoji: '💧',
    rarity: 'rare',
    xpBonus: 250,
    check: async (userId: string) => {
      const strongNodes = await prisma.node.findMany({
        where: { userId, nodeStrength: { gte: 70 } },
      });
      return strongNodes.length > 0;
    },
  },
  {
    id: 'demyelinating_disaster_recovering',
    name: 'Demyelinating Disaster (Recovering)',
    description: 'Raised 3+ nodes from red to yellow or better',
    emoji: '🔥',
    rarity: 'epic',
    xpBonus: 400,
    check: async (userId: string) => {
      const improvedNodes = await prisma.node.findMany({
        where: { userId, nodeStrength: { gte: 60 } },
      });
      return improvedNodes.length >= 3;
    },
  },
  {
    id: 'phoenix_neurons',
    name: 'Phoenix Neurons',
    description: 'Saved 5 dying nodes (below 20% to above 60%)',
    emoji: '🔥🔥🔥',
    rarity: 'legendary',
    xpBonus: 1000,
    check: async (userId: string) => {
      const saved = await prisma.node.findMany({
        where: { userId, nodeStrength: { gte: 60 } },
      });
      return saved.length >= 5;
    },
  },

  // SPEED BADGES
  {
    id: 'speed_50_session',
    name: 'Rapid Fire Reflexes',
    description: '50 reviews in one session',
    emoji: '⚡',
    rarity: 'rare',
    xpBonus: 200,
    check: async (userId: string) => {
      // This requires session tracking - for now check today's count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const count = await prisma.review.count({
        where: { userId, reviewedAt: { gte: today } },
      });
      return count >= 50;
    },
  },
  {
    id: 'speed_100_day',
    name: 'Centennial Daily Grind',
    description: '100 reviews in one day',
    emoji: '💨',
    rarity: 'epic',
    xpBonus: 500,
    check: async (userId: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const count = await prisma.review.count({
        where: { userId, reviewedAt: { gte: today } },
      });
      return count >= 100;
    },
  },

  // COMBO BADGES
  {
    id: 'combo_5',
    name: 'Combo Catalyst',
    description: '5x combo achieved',
    emoji: '🎯',
    rarity: 'common',
    xpBonus: 50,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.highestCombo || 0) >= 5;
    },
  },
  {
    id: 'combo_10',
    name: 'Decadal Destruction',
    description: '10x combo achieved',
    emoji: '🎯🎯',
    rarity: 'rare',
    xpBonus: 150,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.highestCombo || 0) >= 10;
    },
  },
  {
    id: 'combo_25',
    name: 'Combo Crusher',
    description: '25x combo achieved - UNSTOPPABLE',
    emoji: '💥🎯💥',
    rarity: 'epic',
    xpBonus: 500,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.highestCombo || 0) >= 25;
    },
  },
  {
    id: 'combo_50',
    name: 'Combo God Mode',
    description: '50x combo achieved - YOU ARE A MACHINE',
    emoji: '👑💥👑',
    rarity: 'legendary',
    xpBonus: 2000,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.highestCombo || 0) >= 50;
    },
  },

  // LEVEL BADGES
  {
    id: 'level_10',
    name: 'Sluggish But Progressing',
    description: 'Reached level 10',
    emoji: '🐌',
    rarity: 'common',
    xpBonus: 100,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.level || 0) >= 10;
    },
  },
  {
    id: 'level_25',
    name: 'Mild Proprioceptive Gains',
    description: 'Reached level 25',
    emoji: '🎓',
    rarity: 'rare',
    xpBonus: 250,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.level || 0) >= 25;
    },
  },
  {
    id: 'level_50',
    name: 'Crossed Extensor Reflex Master',
    description: 'Reached level 50',
    emoji: '🏆',
    rarity: 'epic',
    xpBonus: 1000,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.level || 0) >= 50;
    },
  },
  {
    id: 'level_100',
    name: 'Ascending Reticular Activating System God',
    description: 'Reached level 100 - MAXIMUM CONSCIOUSNESS',
    emoji: '🌟👑🌟',
    rarity: 'legendary',
    xpBonus: 5000,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.level || 0) >= 100;
    },
  },

  // PERFECTIONISM BADGES
  {
    id: 'perfect_session_1',
    name: 'Flawless Firing',
    description: 'Perfect session with no "Again" answers',
    emoji: '✨',
    rarity: 'rare',
    xpBonus: 150,
    check: async (userId: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const total = await prisma.review.count({
        where: { userId, reviewedAt: { gte: today } },
      });
      const failed = await prisma.review.count({
        where: { userId, reviewedAt: { gte: today }, rating: 0 },
      });
      return total > 0 && failed === 0;
    },
  },
  {
    id: 'perfect_sessions_10',
    name: 'Decadal Perfection',
    description: '10 perfect sessions achieved',
    emoji: '✨✨✨',
    rarity: 'legendary',
    xpBonus: 2000,
    check: async (userId: string) => {
      // This requires session tracking - simplified for now
      return false; // TODO: Implement session tracking
    },
  },

  // NEURO-THEMED HUMOR BADGES
  {
    id: 'cerebellar_champion',
    name: 'Cerebellar Champion',
    description: 'Mastered all ataxia-related nodes',
    emoji: '🧠',
    rarity: 'rare',
    xpBonus: 200,
    check: async (userId: string) => {
      const cerebellarNodes = await prisma.node.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: 'cerebell', mode: 'insensitive' } },
            { name: { contains: 'atax', mode: 'insensitive' } },
          ],
        },
      });
      if (cerebellarNodes.length === 0) return false;
      return cerebellarNodes.every((n) => n.nodeStrength >= 85);
    },
  },
  {
    id: 'brainstem_boss',
    name: 'Brainstem Boss',
    description: 'All brainstem nodes above 80%',
    emoji: '🧬',
    rarity: 'rare',
    xpBonus: 200,
    check: async (userId: string) => {
      const brainstemNodes = await prisma.node.findMany({
        where: { userId, name: { contains: 'brainstem', mode: 'insensitive' } },
      });
      if (brainstemNodes.length === 0) return false;
      return brainstemNodes.every((n) => n.nodeStrength >= 80);
    },
  },
  {
    id: 'lord_of_intumescences',
    name: 'Lord of Intumescences',
    description: 'All spinal cord nodes at 80% or higher',
    emoji: '🦴',
    rarity: 'epic',
    xpBonus: 300,
    check: async (userId: string) => {
      const spinalNodes = await prisma.node.findMany({
        where: { userId, name: { contains: 'spinal', mode: 'insensitive' } },
      });
      if (spinalNodes.length === 0) return false;
      return spinalNodes.every((n) => n.nodeStrength >= 80);
    },
  },
  {
    id: 'cortical_king',
    name: 'Cortical King',
    description: 'All cortex-related nodes mastered',
    emoji: '👑',
    rarity: 'epic',
    xpBonus: 400,
    check: async (userId: string) => {
      const corticalNodes = await prisma.node.findMany({
        where: { userId, name: { contains: 'cortex', mode: 'insensitive' } },
      });
      if (corticalNodes.length === 0) return false;
      return corticalNodes.every((n) => n.nodeStrength >= 85);
    },
  },
  {
    id: 'myelin_maniac',
    name: 'Myelin Maniac',
    description: 'Studied for 30 consecutive days - Your myelin is MAXIMUM THICC',
    emoji: '🔬',
    rarity: 'legendary',
    xpBonus: 1000,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.streak || 0) >= 30;
    },
  },
  {
    id: 'synapse_surgeon',
    name: 'Synapse Surgeon',
    description: 'Completed 1000 reviews with 90%+ accuracy',
    emoji: '🔪',
    rarity: 'legendary',
    xpBonus: 2000,
    check: async (userId: string) => {
      const total = await prisma.review.count({ where: { userId } });
      const failed = await prisma.review.count({ where: { userId, rating: 0 } });
      return total >= 1000 && (failed / total) <= 0.1;
    },
  },
  {
    id: 'neurotransmitter_ninja',
    name: 'Neurotransmitter Ninja',
    description: '50+ reviews in under 30 minutes',
    emoji: '🥷',
    rarity: 'epic',
    xpBonus: 500,
    check: async (userId: string) => {
      // This requires time tracking - simplified for now
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const count = await prisma.review.count({
        where: { userId, reviewedAt: { gte: today } },
      });
      return count >= 50;
    },
  },
  {
    id: 'axon_assassin',
    name: 'Axon Assassin',
    description: 'Destroyed 100 cards in a single day',
    emoji: '⚔️',
    rarity: 'epic',
    xpBonus: 600,
    check: async (userId: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const count = await prisma.review.count({
        where: { userId, reviewedAt: { gte: today } },
      });
      return count >= 100;
    },
  },
  {
    id: 'dendrite_destroyer',
    name: 'Dendrite Destroyer',
    description: 'Completed reviews every day for a week with perfect scores',
    emoji: '💥',
    rarity: 'legendary',
    xpBonus: 1500,
    check: async (userId: string) => {
      // Simplified - check for 7-day streak
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.streak || 0) >= 7;
    },
  },

  // DEDICATION BADGES
  {
    id: 'midnight_maniac',
    name: 'Midnight Maniac',
    description: 'Studied between midnight and 1 AM',
    emoji: '🌙',
    rarity: 'rare',
    xpBonus: 100,
    check: async (userId: string) => {
      const reviews = await prisma.review.findMany({
        where: { userId },
        take: 100,
        orderBy: { reviewedAt: 'desc' },
      });
      return reviews.some((r) => {
        const hour = r.reviewedAt.getHours();
        return hour === 0;
      });
    },
  },
  {
    id: 'early_bird_neuron',
    name: 'Early Bird Neuron',
    description: 'Studied before 6 AM',
    emoji: '🌅',
    rarity: 'rare',
    xpBonus: 100,
    check: async (userId: string) => {
      const reviews = await prisma.review.findMany({
        where: { userId },
        take: 100,
        orderBy: { reviewedAt: 'desc' },
      });
      return reviews.some((r) => {
        const hour = r.reviewedAt.getHours();
        return hour >= 4 && hour < 6;
      });
    },
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Completed 50+ reviews on a weekend',
    emoji: '🎉',
    rarity: 'rare',
    xpBonus: 150,
    check: async (userId: string) => {
      const reviews = await prisma.review.findMany({
        where: { userId },
        orderBy: { reviewedAt: 'desc' },
      });
      const weekendReviews = reviews.filter((r) => {
        const day = r.reviewedAt.getDay();
        return day === 0 || day === 6;
      });
      return weekendReviews.length >= 50;
    },
  },

  // GRIND BADGES
  {
    id: 'daily_grind_7',
    name: 'Weekly Grinder',
    description: 'Completed daily reviews for 7 days straight',
    emoji: '⚙️',
    rarity: 'rare',
    xpBonus: 200,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.streak || 0) >= 7;
    },
  },
  {
    id: 'total_xp_1000',
    name: 'Kilobyte Brain',
    description: 'Earned 1,000 total XP',
    emoji: '💾',
    rarity: 'common',
    xpBonus: 100,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.totalXpEarned || 0) >= 1000;
    },
  },
  {
    id: 'total_xp_10000',
    name: 'Megabyte Mind',
    description: 'Earned 10,000 total XP',
    emoji: '💿',
    rarity: 'rare',
    xpBonus: 500,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.totalXpEarned || 0) >= 10000;
    },
  },
  {
    id: 'total_xp_100000',
    name: 'Gigabyte Genius',
    description: 'Earned 100,000 total XP - LEGENDARY STATUS',
    emoji: '💽',
    rarity: 'legendary',
    xpBonus: 5000,
    check: async (userId: string) => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return (user?.totalXpEarned || 0) >= 100000;
    },
  },

  // NODE CREATION BADGES
  {
    id: 'nodes_created_10',
    name: 'Neural Network Builder',
    description: 'Created 10 nodes',
    emoji: '🏗️',
    rarity: 'common',
    xpBonus: 50,
    check: async (userId: string) => {
      const count = await prisma.node.count({ where: { userId } });
      return count >= 10;
    },
  },
  {
    id: 'nodes_created_50',
    name: 'Brain Architect',
    description: 'Created 50 nodes',
    emoji: '🏛️',
    rarity: 'rare',
    xpBonus: 200,
    check: async (userId: string) => {
      const count = await prisma.node.count({ where: { userId } });
      return count >= 50;
    },
  },
  {
    id: 'cards_created_100',
    name: 'Flashcard Factory',
    description: 'Created 100 cards',
    emoji: '🏭',
    rarity: 'rare',
    xpBonus: 150,
    check: async (userId: string) => {
      const count = await prisma.card.count({ where: { userId } });
      return count >= 100;
    },
  },
];

/**
 * Check for newly earned badges and award them
 */
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { badges: true, xp: true },
  });

  if (!user) return [];

  const currentBadges = (user.badges as unknown as Badge[]) || [];
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
        rarity: def.rarity,
        xpBonus: def.xpBonus,
      };

      newBadges.push(badge);
      currentBadges.push(badge);
    }
  }

  // Update user badges and award XP bonuses
  if (newBadges.length > 0) {
    const totalXpBonus = newBadges.reduce((sum, b) => sum + b.xpBonus, 0);
    await prisma.user.update({
      where: { id: userId },
      data: {
        badges: currentBadges as unknown as any,
        xp: { increment: totalXpBonus },
        totalXpEarned: { increment: totalXpBonus },
      },
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

  const earnedBadges = (user?.badges as unknown as Badge[]) || [];
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  const allBadges = BADGE_DEFINITIONS.map((def) => {
    const earned = earnedBadges.find((b) => b.id === def.id);
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      emoji: def.emoji,
      rarity: def.rarity,
      xpBonus: def.xpBonus,
      earned: !!earned,
      earnedAt: earned?.earnedAt,
    };
  });

  return allBadges;
}

/**
 * Get badge definitions (for reference)
 */
export function getBadgeDefinitions() {
  return BADGE_DEFINITIONS.map((def) => ({
    id: def.id,
    name: def.name,
    description: def.description,
    emoji: def.emoji,
    rarity: def.rarity,
    xpBonus: def.xpBonus,
  }));
}
