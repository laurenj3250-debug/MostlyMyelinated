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

export default router;
