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
    return { label: 'Mild paresis, compensating', color: 'yellow', emoji: '🟡', strength };
  if (strength < 95)
    return {
      label: 'BAR, subtle deficits only',
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
 * Generate a humorous roast message based on node strength
 */
export function generateRoast(nodeName: string, strength: number): string {
  const roastTemplates = {
    brainDead: [
      `${nodeName} – ${strength}%. This node is clinically deceased. Time for CPR (Cramming, Practice, Repetition).`,
      `${nodeName} at ${strength}%? Even a lissencephalic brain has more wrinkles than your knowledge here.`,
      `${nodeName} – ${strength}%. The only thing flatter than this score is an EEG reading.`,
    ],
    lmnTetraplegic: [
      `${nodeName} – ${strength}%. The lower motor neurons are filing a formal complaint.`,
      `${nodeName} at ${strength}%? Non-ambulatory in every sense. Get this to physical therapy ASAP.`,
      `${nodeName} – ${strength}%. Even C6-T2 would be embarrassed by this level of dysfunction.`,
    ],
    nonAmbulatoryAtaxic: [
      `${nodeName} – ${strength}%. The vestibular system is crying. The inner ears have given up.`,
      `${nodeName} at ${strength}%? Proprioception has left the building.`,
      `${nodeName} – ${strength}%. This node is stumbling worse than cerebellar abiotrophy.`,
    ],
    ambulatoryAtaxic: [
      `${nodeName} – ${strength}%. Functional but wobbly. Like a Wobbler on a good day.`,
      `${nodeName} at ${strength}%? You can get there, but you're definitely weaving.`,
      `${nodeName} – ${strength}%. The CSF absorption is questionable at best.`,
    ],
    mildParesis: [
      `${nodeName} – ${strength}%. Compensating nicely, but don't get cocky.`,
      `${nodeName} at ${strength}%? Almost there. The neurologic exam is almost normal.`,
      `${nodeName} – ${strength}%. Subtle deficits remain. Keep pushing.`,
    ],
    barSubtle: [
      `${nodeName} – ${strength}%. BAR with only subtle deficits. You're almost a textbook case.`,
      `${nodeName} at ${strength}%? Looking good! Just a few proprioceptive deficits.`,
      `${nodeName} – ${strength}%. The attending would approve. Mostly.`,
    ],
    hyperreflexic: [
      `${nodeName} – ${strength}%. You could teach this to De Lahunta and he'd take notes.`,
      `${nodeName} at ${strength}%? Hyperreflexic professor status achieved. UMN excellence.`,
      `${nodeName} – ${strength}%. This is cortical overlord territory. Well done.`,
    ],
  };

  let templates: string[];
  if (strength < 20) templates = roastTemplates.brainDead;
  else if (strength < 40) templates = roastTemplates.lmnTetraplegic;
  else if (strength < 60) templates = roastTemplates.nonAmbulatoryAtaxic;
  else if (strength < 75) templates = roastTemplates.ambulatoryAtaxic;
  else if (strength < 85) templates = roastTemplates.mildParesis;
  else if (strength < 95) templates = roastTemplates.barSubtle;
  else templates = roastTemplates.hyperreflexic;

  // Return a random roast from the appropriate category
  return templates[Math.floor(Math.random() * templates.length)];
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
