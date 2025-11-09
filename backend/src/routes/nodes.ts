import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
  calculateNodeStrength,
  updateNodeStrength,
  getNodesWithStrength,
} from '../services/nodeStrength';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

// Get all nodes for user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const nodes = await getNodesWithStrength(req.user!.id);
    res.json(nodes);
  } catch (error) {
    console.error('Get nodes error:', error);
    res.status(500).json({ error: 'Failed to get nodes' });
  }
});

// Get single node with details
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const node = await prisma.node.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        facts: {
          include: {
            cards: {
              select: {
                id: true,
                front: true,
                cardType: true,
              },
            },
          },
        },
        cards: {
          select: {
            id: true,
            front: true,
            back: true,
            cardType: true,
            fsrsData: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            nodeStrength: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        images: true,
      },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json(node);
  } catch (error) {
    console.error('Get node error:', error);
    res.status(500).json({ error: 'Failed to get node' });
  }
});

// Create new node
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, summary, parentId, tags } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const node = await prisma.node.create({
      data: {
        name,
        summary,
        parentId,
        tags: tags || [],
        userId: req.user!.id,
      },
    });

    res.json(node);
  } catch (error) {
    console.error('Create node error:', error);
    res.status(500).json({ error: 'Failed to create node' });
  }
});

// Update node
router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, summary, parentId, tags } = req.body;

    const node = await prisma.node.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: {
        ...(name && { name }),
        ...(summary !== undefined && { summary }),
        ...(parentId !== undefined && { parentId }),
        ...(tags && { tags }),
      },
    });

    if (node.count === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const updatedNode = await prisma.node.findUnique({ where: { id } });
    res.json(updatedNode);
  } catch (error) {
    console.error('Update node error:', error);
    res.status(500).json({ error: 'Failed to update node' });
  }
});

// Delete node
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.node.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete node error:', error);
    res.status(500).json({ error: 'Failed to delete node' });
  }
});

// Get node strength (recalculated)
router.get('/:id/strength', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const node = await prisma.node.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const strength = await updateNodeStrength(id);
    res.json({ strength });
  } catch (error) {
    console.error('Get strength error:', error);
    res.status(500).json({ error: 'Failed to calculate strength' });
  }
});

// Get node strength history (sparkline data)
router.get('/:id/strength-history', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days as string) || 7;

    // Verify ownership
    const node = await prisma.node.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Get all reviews for cards in this node over the past N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reviews = await prisma.review.findMany({
      where: {
        card: { nodeId: id },
        userId: req.user!.id,
        reviewedAt: { gte: startDate },
      },
      orderBy: { reviewedAt: 'asc' },
      select: {
        grade: true,
        reviewedAt: true,
      },
    });

    // Group reviews by day and calculate average strength
    const dayMap = new Map<string, { grades: number[]; date: Date }>();

    reviews.forEach((review) => {
      const dateKey = review.reviewedAt.toISOString().split('T')[0];
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, { grades: [], date: review.reviewedAt });
      }
      dayMap.get(dateKey)!.grades.push(review.grade);
    });

    // Calculate strength for each day
    const history = Array.from(dayMap.entries()).map(([dateKey, data]) => {
      const avgGrade = data.grades.reduce((sum, g) => sum + g, 0) / data.grades.length;
      const strength = Math.round(avgGrade * 100);
      return {
        date: dateKey,
        strength,
      };
    });

    // If no reviews, return current strength for today
    if (history.length === 0) {
      history.push({
        date: new Date().toISOString().split('T')[0],
        strength: node.nodeStrength,
      });
    }

    res.json({ history, currentStrength: node.nodeStrength });
  } catch (error) {
    console.error('Get strength history error:', error);
    res.status(500).json({ error: 'Failed to get strength history' });
  }
});

// Get critical nodes (weakest nodes for dashboard)
router.get('/critical', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 5;

    // Get weak nodes (< 40%)
    const weakNodes = await prisma.node.findMany({
      where: {
        userId,
        nodeStrength: { lt: 40 }
      },
      select: {
        id: true,
        name: true,
        nodeStrength: true,
        lastReviewed: true,
        _count: {
          select: { cards: true }
        }
      },
      orderBy: { nodeStrength: 'asc' },
      take: limit
    });

    // Get due cards count for each node
    const now = new Date();
    const criticalNodes = await Promise.all(
      weakNodes.map(async (node) => {
        const dueCards = await prisma.card.count({
          where: {
            nodeId: node.id,
            fsrsData: {
              path: ['due'],
              lte: now.toISOString()
            }
          }
        });

        // Get strength from 7 days ago (simplified: just check if it's declining)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentReviews = await prisma.review.count({
          where: {
            card: { nodeId: node.id },
            reviewedAt: { gte: sevenDaysAgo }
          }
        });

        // Simplified trend: if recent reviews exist and strength is low, it's declining
        const trendDirection = recentReviews > 0 && node.nodeStrength < 30 ? 'down' :
                              recentReviews > 5 && node.nodeStrength > 35 ? 'up' : 'stable';

        // Get status label
        const getStatusLabel = (strength: number): string => {
          if (strength < 20) return 'Brain-dead';
          if (strength < 40) return 'LMN tetraplegic';
          if (strength < 60) return 'Non-ambulatory ataxic';
          if (strength < 75) return 'Ambulatory ataxic';
          if (strength < 85) return 'Mild paresis';
          if (strength < 95) return 'BAR';
          return 'Hyperreflexic';
        };

        return {
          id: node.id,
          name: node.name,
          strength: Math.round(node.nodeStrength * 10) / 10,
          statusLabel: getStatusLabel(node.nodeStrength),
          dueCards,
          lastReviewed: node.lastReviewed?.toISOString() || null,
          trendDirection,
          totalCards: node._count.cards
        };
      })
    );

    // Get total node count
    const totalNodes = await prisma.node.count({ where: { userId } });

    res.json({
      nodes: criticalNodes,
      totalNodes
    });
  } catch (error) {
    console.error('Get critical nodes error:', error);
    res.status(500).json({ error: 'Failed to get critical nodes' });
  }
});

export default router;
