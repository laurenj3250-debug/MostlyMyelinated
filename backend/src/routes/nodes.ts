import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
  calculateNodeStrength,
  updateNodeStrength,
  getNodesWithStrength,
} from '../services/nodeStrength';
import { parseBulkNodes } from '../services/bulkNodeParser';
import { previewBulkImport, executeBulkCreate, BulkCreateInput, BulkMergeInput } from '../services/bulkNodeService';

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
            Card: {
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

// Quick update node name (for inline editing)
router.patch('/:id/name', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Valid name is required' });
    }

    const result = await prisma.node.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: {
        name: name.trim(),
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const updatedNode = await prisma.node.findUnique({
      where: { id },
      select: { id: true, name: true, updatedAt: true },
    });

    res.json(updatedNode);
  } catch (error) {
    console.error('Update node name error:', error);
    res.status(500).json({ error: 'Failed to update node name' });
  }
});

// Update node parent (with circular reference validation)
router.patch('/:id/parent', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { parentId } = req.body;

    // Verify node ownership
    const node = await prisma.node.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // If setting a parent, verify it exists and check for circular references
    if (parentId) {
      const parent = await prisma.node.findFirst({
        where: { id: parentId, userId: req.user!.id },
      });

      if (!parent) {
        return res.status(404).json({ error: 'Parent node not found' });
      }

      // Check for circular reference
      const wouldCreateCircle = await checkCircularReference(id, parentId, req.user!.id);
      if (wouldCreateCircle) {
        return res.status(400).json({
          error: 'Cannot create circular reference: parent is a descendant of this node',
        });
      }
    }

    // Update parent
    const updatedNode = await prisma.node.update({
      where: { id },
      data: { parentId: parentId || null },
      include: {
        parent: {
          select: { id: true, name: true },
        },
      },
    });

    res.json(updatedNode);
  } catch (error) {
    console.error('Update node parent error:', error);
    res.status(500).json({ error: 'Failed to update node parent' });
  }
});

// Dismiss "new" badge for a node
router.post('/:id/dismiss-new', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.node.updateMany({
      where: {
        id,
        userId: req.user!.id,
      },
      data: {
        isDismissed: true,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json({ id, isDismissed: true });
  } catch (error) {
    console.error('Dismiss node error:', error);
    res.status(500).json({ error: 'Failed to dismiss node' });
  }
});

// Helper function to check for circular references
async function checkCircularReference(
  nodeId: string,
  newParentId: string,
  userId: string
): Promise<boolean> {
  const visited = new Set<string>();
  let currentId: string | null = newParentId;

  while (currentId) {
    // If we encounter the original node, we have a circle
    if (currentId === nodeId) {
      return true;
    }

    // Prevent infinite loops
    if (visited.has(currentId)) {
      break;
    }
    visited.add(currentId);

    // Get parent of current node
    const current: { parentId: string | null } | null = await prisma.node.findFirst({
      where: { id: currentId, userId },
      select: { parentId: true },
    });

    currentId = current?.parentId || null;
  }

  return false;
}

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

// ===== NODE RELATIONSHIPS =====

// Get all relationships for a node (both source and target)
router.get('/:id/relationships', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify node ownership
    const node = await prisma.node.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Get relationships where this node is the source or target
    const sourceRelationships = await prisma.nodeRelationship.findMany({
      where: { sourceNodeId: id },
      include: {
        targetNode: {
          select: {
            id: true,
            name: true,
            nodeStrength: true,
            module: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const targetRelationships = await prisma.nodeRelationship.findMany({
      where: { targetNodeId: id },
      include: {
        sourceNode: {
          select: {
            id: true,
            name: true,
            nodeStrength: true,
            module: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      outgoing: sourceRelationships,
      incoming: targetRelationships,
    });
  } catch (error) {
    console.error('Get relationships error:', error);
    res.status(500).json({ error: 'Failed to get relationships' });
  }
});

// Create a relationship from this node to another
router.post('/:id/relationships', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { targetNodeId, relationshipType, notes, strength } = req.body;

    // Validate required fields
    if (!targetNodeId || !relationshipType) {
      return res.status(400).json({
        error: 'targetNodeId and relationshipType are required'
      });
    }

    // Validate relationship type
    const validTypes = ['prerequisite', 'compare', 'part_of', 'related', 'pathway'];
    if (!validTypes.includes(relationshipType)) {
      return res.status(400).json({
        error: `relationshipType must be one of: ${validTypes.join(', ')}`
      });
    }

    // Verify source node ownership
    const sourceNode = await prisma.node.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!sourceNode) {
      return res.status(404).json({ error: 'Source node not found' });
    }

    // Verify target node exists and belongs to user
    const targetNode = await prisma.node.findFirst({
      where: { id: targetNodeId, userId: req.user!.id },
    });

    if (!targetNode) {
      return res.status(404).json({ error: 'Target node not found' });
    }

    // Prevent self-relationships
    if (id === targetNodeId) {
      return res.status(400).json({ error: 'Cannot create relationship to self' });
    }

    // Create relationship
    const relationship = await prisma.nodeRelationship.create({
      data: {
        sourceNodeId: id,
        targetNodeId,
        relationshipType,
        notes: notes || null,
        strength: strength || 5,
      },
      include: {
        sourceNode: {
          select: {
            id: true,
            name: true,
            nodeStrength: true,
            module: true,
          },
        },
        targetNode: {
          select: {
            id: true,
            name: true,
            nodeStrength: true,
            module: true,
          },
        },
      },
    });

    res.json(relationship);
  } catch (error) {
    console.error('Create relationship error:', error);
    res.status(500).json({ error: 'Failed to create relationship' });
  }
});

// Delete a relationship
router.delete('/relationships/:relationshipId', async (req: AuthRequest, res) => {
  try {
    const { relationshipId } = req.params;

    // Get relationship to verify ownership
    const relationship = await prisma.nodeRelationship.findUnique({
      where: { id: relationshipId },
      include: {
        sourceNode: {
          select: { userId: true },
        },
      },
    });

    if (!relationship) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    // Verify user owns the source node
    if (relationship.sourceNode.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete relationship
    await prisma.nodeRelationship.delete({
      where: { id: relationshipId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete relationship error:', error);
    res.status(500).json({ error: 'Failed to delete relationship' });
  }
});

// ===== NODE STEPS (Multi-step flows) =====

// Get all steps for a node
router.get('/:id/steps', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify node ownership
    const node = await prisma.node.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Get all steps ordered by stepNumber
    const steps = await prisma.nodeStep.findMany({
      where: { nodeId: id },
      orderBy: { stepNumber: 'asc' },
    });

    res.json({ steps, count: steps.length });
  } catch (error) {
    console.error('Get steps error:', error);
    res.status(500).json({ error: 'Failed to get steps' });
  }
});

// Create a new step for a node
router.post('/:id/steps', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { stepNumber, title, content, decisionPoint, nextSteps, imageUrl } = req.body;

    // Validate required fields
    if (!stepNumber || !title || !content) {
      return res.status(400).json({
        error: 'stepNumber, title, and content are required'
      });
    }

    // Verify node ownership
    const node = await prisma.node.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Create step
    const step = await prisma.nodeStep.create({
      data: {
        nodeId: id,
        stepNumber,
        title,
        content,
        decisionPoint: decisionPoint || false,
        nextSteps: nextSteps || null,
        imageUrl: imageUrl || null,
      },
    });

    res.json(step);
  } catch (error) {
    console.error('Create step error:', error);
    res.status(500).json({ error: 'Failed to create step' });
  }
});

// Update a step
router.patch('/steps/:stepId', async (req: AuthRequest, res) => {
  try {
    const { stepId } = req.params;
    const { stepNumber, title, content, decisionPoint, nextSteps, imageUrl } = req.body;

    // Get step to verify ownership
    const step = await prisma.nodeStep.findUnique({
      where: { id: stepId },
      include: {
        node: {
          select: { userId: true },
        },
      },
    });

    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    // Verify user owns the node
    if (step.node.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update step
    const updatedStep = await prisma.nodeStep.update({
      where: { id: stepId },
      data: {
        ...(stepNumber !== undefined && { stepNumber }),
        ...(title && { title }),
        ...(content && { content }),
        ...(decisionPoint !== undefined && { decisionPoint }),
        ...(nextSteps !== undefined && { nextSteps }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    res.json(updatedStep);
  } catch (error) {
    console.error('Update step error:', error);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

// Delete a step
router.delete('/steps/:stepId', async (req: AuthRequest, res) => {
  try {
    const { stepId } = req.params;

    // Get step to verify ownership
    const step = await prisma.nodeStep.findUnique({
      where: { id: stepId },
      include: {
        node: {
          select: { userId: true },
        },
      },
    });

    if (!step) {
      return res.status(404).json({ error: 'Step not found' });
    }

    // Verify user owns the node
    if (step.node.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete step
    await prisma.nodeStep.delete({
      where: { id: stepId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete step error:', error);
    res.status(500).json({ error: 'Failed to delete step' });
  }
});

// ============================================================================
// BULK IMPORT ENDPOINTS
// ============================================================================

/**
 * Preview bulk node import
 * Parses CSV/JSON and returns preview with duplicate detection
 */
router.post('/bulk-preview', async (req: AuthRequest, res) => {
  try {
    const { data } = req.body;

    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'data string is required' });
    }

    // Parse the input data (auto-detects CSV vs JSON)
    const parseResult = parseBulkNodes(data);

    if (!parseResult.success || parseResult.nodes.length === 0) {
      return res.status(400).json({
        error: 'Failed to parse data',
        details: parseResult.errors,
        format: parseResult.format,
      });
    }

    // Generate preview with duplicate detection
    const preview = await previewBulkImport(req.user!.id, parseResult.nodes);

    res.json({
      ...preview,
      parseErrors: parseResult.errors,
      format: parseResult.format,
    });
  } catch (error: any) {
    console.error('Bulk preview error:', error);
    res.status(500).json({
      error: 'Failed to generate preview',
      details: error.message,
    });
  }
});

/**
 * Execute bulk node creation
 * Creates nodes with transaction (all-or-nothing)
 */
router.post('/bulk-create', async (req: AuthRequest, res) => {
  try {
    const { nodes, merges = [], autoCreateParents = true } = req.body;

    if (!Array.isArray(nodes) || nodes.length === 0) {
      return res.status(400).json({ error: 'nodes array is required' });
    }

    // Validate node structure
    const validNodes: BulkCreateInput[] = [];
    for (const node of nodes) {
      if (!node.parent || !node.node) {
        continue; // Skip invalid nodes
      }

      validNodes.push({
        parent: String(node.parent).trim(),
        node: String(node.node).trim(),
        summary: node.summary ? String(node.summary).trim() : '',
        tags: Array.isArray(node.tags) ? node.tags : [],
        forceCreate: Boolean(node.forceCreate),
      });
    }

    // Validate merge structure
    const validMerges: BulkMergeInput[] = [];
    if (Array.isArray(merges)) {
      for (const merge of merges) {
        if (!merge.nodeId) {
          continue; // Skip invalid merges
        }

        validMerges.push({
          nodeId: String(merge.nodeId).trim(),
          summary: merge.summary ? String(merge.summary).trim() : undefined,
          tags: Array.isArray(merge.tags) ? merge.tags : undefined,
        });
      }
    }

    if (validNodes.length === 0 && validMerges.length === 0) {
      return res.status(400).json({ error: 'No valid nodes to create or merge' });
    }

    // Execute bulk create with transaction
    const result = await executeBulkCreate(
      req.user!.id,
      validNodes,
      validMerges,
      autoCreateParents
    );

    res.json(result);
  } catch (error: any) {
    console.error('Bulk create error:', error);
    res.status(500).json({
      error: 'Failed to create nodes',
      details: error.message,
    });
  }
});

// Delete all nodes for current user (for testing/reset)
router.delete('/bulk-delete-all', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Delete all nodes for this user (cascade will handle cards, reviews, etc.)
    const result = await prisma.node.deleteMany({
      where: { userId },
    });

    res.json({
      success: true,
      deletedCount: result.count,
      message: `Deleted ${result.count} nodes`,
    });
  } catch (error) {
    console.error('Bulk delete all error:', error);
    res.status(500).json({ error: 'Failed to delete all nodes' });
  }
});

export default router;
