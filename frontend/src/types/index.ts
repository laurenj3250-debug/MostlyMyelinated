// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Node types
export interface Node {
  id: string;
  userId: string;
  name: string;
  summary?: string;
  module?: string; // 'Spinal' | 'Brainstem' | 'Cerebrum' | 'CSF' | 'Clinical' | 'Other'
  mainImageUrl?: string;
  parentId?: string;
  tags: string[];
  nodeStrength: number;
  lastReviewed?: string;
  createdAt: string;
  updatedAt: string;
  strengthLabel?: {
    label: string;
    color: string;
    emoji: string;
    strength: number;
  };
  dueCount?: number;
  _count?: {
    cards: number;
    facts: number;
  };
  // Import tracking
  importBatchId?: string;
  importedAt?: Date | string;
  sourceFile?: string;
  isDismissed?: boolean;
}

// Fact types
export interface Fact {
  id: string;
  nodeId: string;
  statement: string;
  factType: string;
  keyTerms: string[];
  createdAt: string;
}

// Card types
export interface Card {
  id: string;
  userId: string;
  nodeId: string;
  factId?: string;
  front: string;
  back: string;
  hint?: string;
  cardType: string;
  fsrsData: {
    due: string;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    scheduled_days: number;
    reps: number;
    lapses: number;
    state: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  id: string;
  userId: string;
  cardId: string;
  rating: number;
  grade: number;
  reviewedAt: string;
}

export interface ReviewResponse {
  review: Review;
  nextDue: string;
  updatedCard: Card;
  strengthDropped?: boolean;
  nodeName?: string;
  oldBand?: string;
  newBand?: string;
}

// Study session types
export interface DueCard {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeStrength: number;
  front: string;
  back: string;
  hint?: string;
  cardType: string;
  fsrsData: Card['fsrsData'];
}

export interface StudySession {
  cards: DueCard[];
  count: number;
  maxCards: number;
}

export interface StudyStats {
  totalCards: number;
  dueCount: number;
  nodesWithDueCards: number;
  reviewsToday: number;
  totalNodes: number;
  totalFacts: number;
  totalReviews: number;
  streak: number;
}
