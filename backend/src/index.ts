import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import nodeRoutes from './routes/nodes';
import factRoutes from './routes/facts';
import cardRoutes from './routes/cards';
import studyRoutes from './routes/study';
import aiRoutes from './routes/ai';
import imageRoutes from './routes/images';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/facts', factRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/images', imageRoutes);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../public')));

// API root route (for debugging)
app.get('/api', (req, res) => {
  res.json({
    message: 'MostlyMyelinated API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      nodes: '/api/nodes',
      facts: '/api/facts',
      cards: '/api/cards',
      study: '/api/study',
      ai: '/api/ai',
      images: '/api/images',
    },
  });
});

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🧠 MostlyMyelinated API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
});

export default app;
