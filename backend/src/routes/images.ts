import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import multer from 'multer';
import sharp from 'sharp';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// All routes require authentication
router.use(authenticateToken);

// Upload image for a node
router.post('/node/:nodeId', upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { nodeId } = req.params;
    const { imageType = 'base' } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Verify node ownership
    const node = await prisma.node.findFirst({
      where: { id: nodeId, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Process image with sharp (resize, compress)
    const processedImage = await sharp(req.file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Store image in database
    const image = await prisma.nodeImage.create({
      data: {
        nodeId,
        filename: req.file.originalname,
        url: `data:image/jpeg;base64,${processedImage.toString('base64')}`,
        imageType,
        imageData: processedImage,
      },
    });

    res.json({
      id: image.id,
      nodeId: image.nodeId,
      filename: image.filename,
      url: image.url,
      imageType: image.imageType,
      createdAt: image.createdAt,
    });
  } catch (error) {
    console.error('Upload node image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload image for a fact
router.post('/fact/:factId', upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { factId } = req.params;
    const { imageType = 'base' } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Verify fact ownership via node
    const fact = await prisma.fact.findFirst({
      where: {
        id: factId,
        node: { userId: req.user!.id },
      },
    });

    if (!fact) {
      return res.status(404).json({ error: 'Fact not found' });
    }

    // Process image with sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Store image in database
    const image = await prisma.factImage.create({
      data: {
        factId,
        filename: req.file.originalname,
        url: `data:image/jpeg;base64,${processedImage.toString('base64')}`,
        imageType,
        imageData: processedImage,
      },
    });

    res.json({
      id: image.id,
      factId: image.factId,
      filename: image.filename,
      url: image.url,
      imageType: image.imageType,
      createdAt: image.createdAt,
    });
  } catch (error) {
    console.error('Upload fact image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get images for a node
router.get('/node/:nodeId', async (req: AuthRequest, res) => {
  try {
    const { nodeId } = req.params;

    // Verify node ownership
    const node = await prisma.node.findFirst({
      where: { id: nodeId, userId: req.user!.id },
    });

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const images = await prisma.nodeImage.findMany({
      where: { nodeId },
      select: {
        id: true,
        nodeId: true,
        filename: true,
        url: true,
        imageType: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(images);
  } catch (error) {
    console.error('Get node images error:', error);
    res.status(500).json({ error: 'Failed to get images' });
  }
});

// Get images for a fact
router.get('/fact/:factId', async (req: AuthRequest, res) => {
  try {
    const { factId } = req.params;

    // Verify fact ownership via node
    const fact = await prisma.fact.findFirst({
      where: {
        id: factId,
        node: { userId: req.user!.id },
      },
    });

    if (!fact) {
      return res.status(404).json({ error: 'Fact not found' });
    }

    const images = await prisma.factImage.findMany({
      where: { factId },
      select: {
        id: true,
        factId: true,
        filename: true,
        url: true,
        imageType: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(images);
  } catch (error) {
    console.error('Get fact images error:', error);
    res.status(500).json({ error: 'Failed to get images' });
  }
});

// Delete node image
router.delete('/node/:imageId', async (req: AuthRequest, res) => {
  try {
    const { imageId } = req.params;

    // Verify ownership via node
    const image = await prisma.nodeImage.findFirst({
      where: {
        id: imageId,
        node: { userId: req.user!.id },
      },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await prisma.nodeImage.delete({ where: { id: imageId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete node image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Delete fact image
router.delete('/fact/:imageId', async (req: AuthRequest, res) => {
  try {
    const { imageId } = req.params;

    // Verify ownership via fact's node
    const image = await prisma.factImage.findFirst({
      where: {
        id: imageId,
        fact: {
          node: { userId: req.user!.id },
        },
      },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await prisma.factImage.delete({ where: { id: imageId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete fact image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Save annotated image
router.post('/annotate/:imageId', async (req: AuthRequest, res) => {
  try {
    const { imageId } = req.params;
    const { annotationData, imageType = 'annotated' } = req.body;

    // This can be either a NodeImage or FactImage
    // Try NodeImage first
    let nodeImage = await prisma.nodeImage.findFirst({
      where: {
        id: imageId,
        node: { userId: req.user!.id },
      },
    });

    if (nodeImage) {
      // Create new annotated version of node image
      const annotatedImage = await prisma.nodeImage.create({
        data: {
          nodeId: nodeImage.nodeId,
          filename: `annotated_${nodeImage.filename}`,
          url: annotationData, // Base64 data URL from canvas
          imageType: 'annotated',
        },
      });

      return res.json(annotatedImage);
    }

    // Try FactImage
    let factImage = await prisma.factImage.findFirst({
      where: {
        id: imageId,
        fact: {
          node: { userId: req.user!.id },
        },
      },
    });

    if (factImage) {
      // Create new annotated version of fact image
      const annotatedImage = await prisma.factImage.create({
        data: {
          factId: factImage.factId,
          filename: `annotated_${factImage.filename}`,
          url: annotationData, // Base64 data URL from canvas
          imageType: 'annotated',
        },
      });

      return res.json(annotatedImage);
    }

    return res.status(404).json({ error: 'Original image not found' });
  } catch (error) {
    console.error('Save annotated image error:', error);
    res.status(500).json({ error: 'Failed to save annotated image' });
  }
});

export default router;