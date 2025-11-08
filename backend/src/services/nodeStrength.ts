import { PrismaClient } from '@prisma/client';
import { NodeStrengthLabel } from '../types';

const prisma = new PrismaClient();

interface ReviewGrade {
  grade: number; // 0, 0.4, or 1.0
  reviewedAt: Date;
}

/**
 * Algorithm 1: NodeStrength Calculation
 *
 * Calculates the "strength" of a node based on recent review performance
 * across all cards associated with that node.
 *
 * Returns a score from 0-100:
 * - 0-20: Brain-dead ⚫
 * - 20-40: LMN tetraplegic 🟥
 * - 40-60: Non-ambulatory ataxic 🔴
 * - 60-75: Ambulatory ataxic 🟠
 * - 75-85: Mild paresis 🟡
 * - 85-95: BAR, subtle deficits 🟢
 * - 95-100: Hyperreflexic professor 💠
 */
export async function calculateNodeStrength(nodeId: string): Promise<number> {
  // Get all cards for this node with their reviews
  const cards = await prisma.card.findMany({
    where: { nodeId },
    include: {
      reviews: {
        orderBy: { reviewedAt: 'desc' },
        take: 30, // Look at last 30 reviews per card
      },
    },
  });

  if (cards.length === 0) return 0;

  // Collect all recent reviews across all cards
  const allReviews: ReviewGrade[] = [];
  cards.forEach((card) => {
    card.reviews.forEach((review) => {
      allReviews.push({
        grade: review.grade,
        reviewedAt: review.reviewedAt,
      });
    });
  });

  if (allReviews.length === 0) return 0;

  // Sort by date (most recent first)
  allReviews.sort((a, b) => b.reviewedAt.getTime() - a.reviewedAt.getTime());

  // Take last N reviews (e.g., 20-30)
  const recentReviews = allReviews.slice(0, 30);

  // Calculate weighted average (more recent = higher weight)
  let weightedSum = 0;
  let weightSum = 0;

  recentReviews.forEach((review, index) => {
    // Exponential decay: recent reviews weighted more heavily
    const weight = Math.exp(-index / 10); // Decay factor
    weightedSum += review.grade * weight;
    weightSum += weight;
  });

  const strength = (weightedSum / weightSum) * 100;

  return Math.round(strength);
}

/**
 * Update the node's stored strength value
 */
export async function updateNodeStrength(nodeId: string): Promise<number> {
  const strength = await calculateNodeStrength(nodeId);

  await prisma.node.update({
    where: { id: nodeId },
    data: {
      nodeStrength: strength,
      lastReviewed: new Date(),
    },
  });

  return strength;
}

/**
 * Get the label, color, and emoji for a given strength
 */
export function getNodeLabel(strength: number): NodeStrengthLabel {
  if (strength < 20)
    return { label: 'Brain-dead', color: 'black', emoji: '⚫', strength };
  if (strength < 40)
    return {
      label: 'LMN tetraplegic',
      color: 'darkred',
      emoji: '🟥',
      strength,
    };
  if (strength < 60)
    return {
      label: 'Non-ambulatory ataxic',
      color: 'red',
      emoji: '🔴',
      strength,
    };
  if (strength < 75)
    return {
      label: 'Ambulatory ataxic',
      color: 'orange',
      emoji: '🟠',
      strength,
    };
  if (strength < 85)
    return { label: 'Mild paresis', color: 'yellow', emoji: '🟡', strength };
  if (strength < 95)
    return {
      label: 'BAR, subtle deficits',
      color: 'green',
      emoji: '🟢',
      strength,
    };
  return {
    label: 'Hyperreflexic professor',
    color: 'blue',
    emoji: '💠',
    strength,
  };
}

/**
 * Get all nodes with their strength labels
 */
export async function getNodesWithStrength(userId: string) {
  const nodes = await prisma.node.findMany({
    where: { userId },
    orderBy: { nodeStrength: 'asc' }, // Weakest first
    include: {
      _count: {
        select: { cards: true, facts: true },
      },
    },
  });

  return nodes.map((node) => ({
    ...node,
    strengthLabel: getNodeLabel(node.nodeStrength),
  }));
}
