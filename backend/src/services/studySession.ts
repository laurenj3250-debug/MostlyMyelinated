import { PrismaClient } from '@prisma/client';
import { DueCard } from '../types';
import { isCardDue } from './fsrsScheduler';

const prisma = new PrismaClient();

/**
 * Algorithm 2: Weighted Review Selection
 *
 * Selects cards for review with bias toward weaker nodes.
 * Ensures variety across different nodes while prioritizing learning gaps.
 *
 * Allocation by NodeStrength band:
 * - 0-40 (Critical/Weak): 40% of cards
 * - 40-60 (Weak): 30% of cards
 * - 60-85 (Moderate): 20% of cards
 * - 85-100 (Strong): 10% of cards
 */
export async function getWeightedReviewSession(
  userId: string,
  maxCards: number = 80
): Promise<DueCard[]> {
  // 1. Get all due cards
  const now = new Date();

  // Note: Prisma doesn't support querying inside JSON fields easily,
  // so we'll fetch all cards and filter in memory for MVP
  // For production, consider a separate 'dueDate' column
  const allCards = await prisma.card.findMany({
    where: { userId },
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

  // Filter to only due cards
  const dueCards = allCards.filter((card) =>
    isCardDue(card.fsrsData as any)
  );

  if (dueCards.length === 0) return [];

  // 2. Group by node
  const cardsByNode = new Map<string, DueCard[]>();

  dueCards.forEach((card) => {
    const nodeId = card.node.id;
    if (!cardsByNode.has(nodeId)) {
      cardsByNode.set(nodeId, []);
    }

    cardsByNode.get(nodeId)!.push({
      id: card.id,
      nodeId: nodeId,
      nodeName: card.node.name,
      nodeStrength: card.node.nodeStrength,
      front: card.front,
      back: card.back,
      hint: card.hint || undefined,
      cardType: card.cardType,
      fsrsData: card.fsrsData as any,
    });
  });

  // 3. Allocate cards based on weakness bands
  const selected: DueCard[] = [];

  const bands = [
    { min: 0, max: 40, allocation: 0.4, label: 'Critical' },
    { min: 40, max: 60, allocation: 0.3, label: 'Weak' },
    { min: 60, max: 85, allocation: 0.2, label: 'Moderate' },
    { min: 85, max: 100, allocation: 0.1, label: 'Strong' },
  ];

  bands.forEach((band) => {
    const targetCount = Math.round(maxCards * band.allocation);

    // Get nodes in this band
    const nodesInBand = Array.from(cardsByNode.entries()).filter(
      ([_, cards]) => {
        const strength = cards[0].nodeStrength;
        return strength >= band.min && strength < band.max;
      }
    );

    // Sample cards from these nodes (round-robin for variety)
    let collected = 0;
    while (collected < targetCount && nodesInBand.length > 0) {
      // Round-robin through nodes to ensure variety
      nodesInBand.forEach(([nodeId, cards]) => {
        if (collected >= targetCount) return;
        if (cards.length > 0) {
          selected.push(cards.shift()!);
          collected++;
        }
      });

      // Remove nodes with no cards left
      const emptyIndices: number[] = [];
      nodesInBand.forEach(([nodeId, cards], index) => {
        if (cards.length === 0) emptyIndices.push(index);
      });
      // Remove in reverse order to avoid index shifting
      emptyIndices.reverse().forEach((index) => {
        nodesInBand.splice(index, 1);
      });
    }
  });

  // 4. If we haven't filled quota, pull from any remaining due cards
  if (selected.length < maxCards) {
    const selectedIds = new Set(selected.map((c) => c.id));
    const remaining = dueCards
      .filter((card) => !selectedIds.has(card.id))
      .slice(0, maxCards - selected.length)
      .map((card) => ({
        id: card.id,
        nodeId: card.node.id,
        nodeName: card.node.name,
        nodeStrength: card.node.nodeStrength,
        front: card.front,
        back: card.back,
        hint: card.hint || undefined,
        cardType: card.cardType,
        fsrsData: card.fsrsData as any,
      }));

    selected.push(...remaining);
  }

  // 5. Shuffle within bands for variety
  return shuffleArray(selected);
}

/**
 * Get study session statistics with daily caps
 */
export async function getStudyStats(userId: string) {
  const now = new Date();

  // Get user preferences for daily caps
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      maxReviewsPerDay: true,
      maxNewCardsPerDay: true,
    },
  });

  const maxReviewsPerDay = user?.maxReviewsPerDay || 100;
  const maxNewCardsPerDay = user?.maxNewCardsPerDay || 10;

  const allCards = await prisma.card.findMany({
    where: { userId },
    select: {
      id: true,
      fsrsData: true,
      nodeId: true,
    },
  });

  const dueCards = allCards.filter((card) => isCardDue(card.fsrsData as any));
  const newCards = allCards.filter((card) => {
    const fsrs = card.fsrsData as any;
    return fsrs.state === 0; // State 0 = New
  });

  const totalCards = allCards.length;
  const dueCount = dueCards.length;

  // Get unique nodes that have due cards
  const nodesWithDueCards = new Set(dueCards.map((c) => c.nodeId));

  // Get reviews today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const reviewsToday = await prisma.review.count({
    where: {
      userId,
      reviewedAt: { gte: todayStart },
    },
  });

  // Count new cards reviewed today
  const newCardsToday = await prisma.review.count({
    where: {
      userId,
      reviewedAt: { gte: todayStart },
      card: {
        fsrsData: {
          path: ['state'],
          equals: 0,
        },
      },
    },
  });

  const reviewsRemaining = Math.max(0, maxReviewsPerDay - reviewsToday);
  const newCardsRemaining = Math.max(0, maxNewCardsPerDay - newCardsToday);

  return {
    totalCards,
    dueCount,
    nodesWithDueCards: nodesWithDueCards.size,
    reviewsToday,
    newCardsToday,
    maxReviewsPerDay,
    maxNewCardsPerDay,
    reviewsRemaining,
    newCardsRemaining,
  };
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
