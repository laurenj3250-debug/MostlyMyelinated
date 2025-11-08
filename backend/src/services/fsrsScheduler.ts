import { FSRS, Rating, createEmptyCard, type Card, type ReviewLog } from 'ts-fsrs';
import { FSRSData } from '../types';

// Initialize FSRS with default parameters
const fsrs = new FSRS({});

/**
 * Create initial FSRS data for a new card
 */
export function createInitialFSRSData(): FSRSData {
  const emptyCard = createEmptyCard();
  const now = new Date();

  return {
    due: now.toISOString(),
    stability: emptyCard.stability,
    difficulty: emptyCard.difficulty,
    elapsed_days: emptyCard.elapsed_days,
    scheduled_days: emptyCard.scheduled_days,
    reps: emptyCard.reps,
    lapses: emptyCard.lapses,
    state: emptyCard.state,
  };
}

/**
 * Convert FSRSData to ts-fsrs Card
 */
function fsrsDataToCard(data: FSRSData): Card {
  return {
    due: new Date(data.due),
    stability: data.stability,
    difficulty: data.difficulty,
    elapsed_days: data.elapsed_days,
    scheduled_days: data.scheduled_days,
    reps: data.reps,
    lapses: data.lapses,
    state: data.state,
    last_review: data.last_review ? new Date(data.last_review) : undefined,
  };
}

/**
 * Convert ts-fsrs Card to FSRSData
 */
function cardToFSRSData(card: Card): FSRSData {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review?.toISOString(),
  };
}

/**
 * Process a review and get updated card data
 *
 * @param currentFSRSData - Current FSRS data from database
 * @param rating - User rating (0=Again, 1=Hard, 2=Good, 3=Easy)
 * @returns Updated FSRS data and review log
 */
export function processReview(
  currentFSRSData: FSRSData,
  rating: 0 | 1 | 2 | 3
): {
  updatedFSRSData: FSRSData;
  reviewLog: ReviewLog;
} {
  const card = fsrsDataToCard(currentFSRSData);

  // Map rating to FSRS Rating enum
  const ratingMap: { [key: number]: Rating } = {
    0: Rating.Again,
    1: Rating.Hard,
    2: Rating.Good,
    3: Rating.Easy,
  };

  const fsrsRating = ratingMap[rating];

  // Schedule the card
  const schedulingResult = fsrs.repeat(card, new Date());
  const ratingKey = fsrsRating as keyof typeof schedulingResult;
  const nextCard = schedulingResult[ratingKey].card;
  const reviewLog = schedulingResult[ratingKey].log;

  return {
    updatedFSRSData: cardToFSRSData(nextCard),
    reviewLog,
  };
}

/**
 * Get next review intervals for all ratings (for preview)
 */
export function getNextIntervals(currentFSRSData: FSRSData): {
  again: string;
  hard: string;
  good: string;
  easy: string;
} {
  const card = fsrsDataToCard(currentFSRSData);
  const now = new Date();
  const schedulingResult = fsrs.repeat(card, now);

  return {
    again: schedulingResult[Rating.Again].card.due.toISOString(),
    hard: schedulingResult[Rating.Hard].card.due.toISOString(),
    good: schedulingResult[Rating.Good].card.due.toISOString(),
    easy: schedulingResult[Rating.Easy].card.due.toISOString(),
  };
}

/**
 * Check if a card is due for review
 */
export function isCardDue(fsrsData: FSRSData): boolean {
  const dueDate = new Date(fsrsData.due);
  return dueDate <= new Date();
}

/**
 * Get the number of days until the card is due
 */
export function getDaysUntilDue(fsrsData: FSRSData): number {
  const dueDate = new Date(fsrsData.due);
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
