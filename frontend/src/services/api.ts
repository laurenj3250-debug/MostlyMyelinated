import axios from 'axios';
import type {
  User,
  AuthResponse,
  Node,
  Fact,
  Card,
  StudySession,
  StudyStats,
  ReviewResponse,
} from '../types';

// Use relative path in production (same domain), localhost in dev
const API_URL = '/api';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const auth = {
  register: (email: string, password: string, name?: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, name }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  me: () => api.get<User>('/auth/me'),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Nodes API
export const nodes = {
  list: () => api.get<Node[]>('/nodes'),

  get: (id: string) => api.get<Node>(`/nodes/${id}`),

  create: (data: {
    name: string;
    summary?: string;
    parentId?: string;
    tags?: string[];
  }) => api.post<Node>('/nodes', data),

  update: (
    id: string,
    data: {
      name?: string;
      summary?: string;
      parentId?: string;
      tags?: string[];
    }
  ) => api.patch<Node>(`/nodes/${id}`, data),

  delete: (id: string) => api.delete(`/nodes/${id}`),

  getStrength: (id: string) => api.get<{ strength: number }>(`/nodes/${id}/strength`),

  getStrengthHistory: (id: string, days?: number) =>
    api.get<{ history: Array<{ date: string; strength: number }>; currentStrength: number }>(
      `/nodes/${id}/strength-history`,
      { params: { days } }
    ),

  getCritical: (limit?: number) =>
    api.get<{ nodes: any[]; totalNodes: number }>('/nodes/critical', {
      params: { limit }
    }),

  getAll: () => api.get<Node[]>('/nodes'),

  // Relationships
  getRelationships: (id: string) =>
    api.get<{
      outgoing: Array<{
        id: string;
        relationshipType: string;
        notes?: string;
        strength: number;
        targetNode: {
          id: string;
          name: string;
          nodeStrength: number;
          module?: string;
        };
      }>;
      incoming: Array<{
        id: string;
        relationshipType: string;
        notes?: string;
        strength: number;
        sourceNode: {
          id: string;
          name: string;
          nodeStrength: number;
          module?: string;
        };
      }>;
    }>(`/nodes/${id}/relationships`),

  createRelationship: (
    id: string,
    data: {
      targetNodeId: string;
      relationshipType: string;
      notes?: string;
      strength?: number;
    }
  ) => api.post(`/nodes/${id}/relationships`, data),

  deleteRelationship: (relationshipId: string) =>
    api.delete(`/nodes/relationships/${relationshipId}`),

  // Steps (multi-step flows)
  getSteps: (id: string) =>
    api.get<{
      steps: Array<{
        id: string;
        stepNumber: number;
        title: string;
        content: string;
        decisionPoint: boolean;
        nextSteps?: any;
        imageUrl?: string;
      }>;
      count: number;
    }>(`/nodes/${id}/steps`),

  createStep: (
    id: string,
    data: {
      stepNumber: number;
      title: string;
      content: string;
      decisionPoint?: boolean;
      nextSteps?: any;
      imageUrl?: string;
    }
  ) => api.post(`/nodes/${id}/steps`, data),

  updateStep: (
    stepId: string,
    data: {
      stepNumber?: number;
      title?: string;
      content?: string;
      decisionPoint?: boolean;
      nextSteps?: any;
      imageUrl?: string;
    }
  ) => api.patch(`/nodes/steps/${stepId}`, data),

  deleteStep: (stepId: string) =>
    api.delete(`/nodes/steps/${stepId}`),
};

// Facts API
export const facts = {
  parse: (data: {
    notes: string[];
    topic?: string;
    imageUrls?: string[];
  }) => api.post<{ parsed: any[]; count: number }>('/facts/parse', data),

  create: (data: {
    nodeId: string;
    statement: string;
    factType: string;
    keyTerms?: string[];
  }) => api.post<Fact>('/facts', data),

  update: (
    id: string,
    data: {
      statement?: string;
      factType?: string;
      keyTerms?: string[];
    }
  ) => api.patch<Fact>(`/facts/${id}`, data),

  delete: (id: string) => api.delete(`/facts/${id}`),

  previewCards: (id: string) =>
    api.post<{ fact: Fact; templates: any[]; count: number }>(
      `/facts/${id}/preview-cards`
    ),

  generateCards: (id: string, cards?: any[]) =>
    api.post<{ fact: Fact; cards: Card[]; count: number }>(
      `/facts/${id}/generate-cards`,
      { cards }
    ),
};

// Cards API
export const cards = {
  get: (id: string) => api.get<Card>(`/cards/${id}`),

  create: (data: {
    nodeId: string;
    front: string;
    back: string;
    hint?: string;
    cardType?: string;
  }) => api.post<Card>('/cards', data),

  update: (
    id: string,
    data: {
      front?: string;
      back?: string;
      hint?: string;
      cardType?: string;
    }
  ) => api.patch<Card>(`/cards/${id}`, data),

  delete: (id: string) => api.delete(`/cards/${id}`),

  review: (id: string, rating: number) =>
    api.post<ReviewResponse>(
      `/cards/${id}/review`,
      { rating }
    ),
};

// Study API
export const study = {
  getSession: (maxCards?: number) =>
    api.get<StudySession>('/study/session', {
      params: { max: maxCards },
    }),

  getWeakNodesSession: (maxCards?: number, threshold?: number) =>
    api.get<StudySession>('/study/weak-nodes', {
      params: { max: maxCards, threshold },
    }),

  getStats: () => api.get<StudyStats>('/study/stats'),

  getProgress: (nodeId: string) =>
    api.get(`/study/progress/${nodeId}`),

  checkBadges: () => api.post('/study/check-badges'),

  getBadges: () => api.get('/study/badges'),

  getAchievements: () => api.get<{ achievements: any[] }>('/study/achievements'),

  getDrillHardest: (nodeId: string, limit?: number) =>
    api.get<{ cards: any[]; count: number; nodeName: string }>(
      `/study/drill-hardest/${nodeId}`,
      { params: { limit } }
    ),

  getNeuroStatus: () =>
    api.get<{
      overallScore: number;
      statusLabel: string;
      nodeDistribution: any;
      dueCards: number;
      newCards: number;
      weakNodeCount: number;
      totalNodes: number;
    }>('/study/neuro-status'),

  getWeakDrill: (threshold?: number, limit?: number) =>
    api.get<{ cards: any[]; count: number; nodesFocused: any[] }>('/study/weak-drill', {
      params: { threshold, limit }
    }),

  getLevelProgress: () =>
    api.get<{ level: number; xp: number; xpToNextLevel: number; title: string; totalXpEarned: number; streak: number }>('/gamification/level-progress'),
};

// Images API
export const images = {
  uploadNodeImage: (nodeId: string, file: File, imageType?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (imageType) formData.append('imageType', imageType);

    return api.post(`/images/node/${nodeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadFactImage: (factId: string, file: File, imageType?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (imageType) formData.append('imageType', imageType);

    return api.post(`/images/fact/${factId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getNodeImages: (nodeId: string) =>
    api.get(`/images/node/${nodeId}`),

  getFactImages: (factId: string) =>
    api.get(`/images/fact/${factId}`),

  deleteNodeImage: (imageId: string) =>
    api.delete(`/images/node/${imageId}`),

  deleteFactImage: (imageId: string) =>
    api.delete(`/images/fact/${imageId}`),

  saveAnnotated: (imageId: string, annotationData: string) =>
    api.post(`/images/annotate/${imageId}`, { annotationData }),
};

export default api;
