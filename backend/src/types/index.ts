import { Request } from 'express';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// FSRS card state
export interface FSRSData {
  due: string; // ISO date string
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number; // 0=New, 1=Learning, 2=Review, 3=Relearning
  last_review?: string;
}

// Card generation templates
export interface CardTemplate {
  front: string;
  back: string;
  cardType: 'basic' | 'reverse' | 'cloze' | 'image_occlusion';
  hint?: string;
}

// Fact types
export type FactType =
  | 'definition'
  | 'association'
  | 'localization'
  | 'comparison'
  | 'clinical'
  | 'simple';

// NodeStrength label
export interface NodeStrengthLabel {
  label: string;
  color: string;
  emoji: string;
  strength: number;
}

// Review grade mapping
export const REVIEW_GRADE_MAP = {
  0: 0,    // Again -> 0
  1: 0.4,  // Hard -> 0.4
  2: 1.0,  // Good -> 1.0
  3: 1.0,  // Easy -> 1.0
} as const;

// Study session card
export interface DueCard {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeStrength: number;
  front: string;
  back: string;
  hint?: string;
  cardType: string;
  fsrsData: FSRSData;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
