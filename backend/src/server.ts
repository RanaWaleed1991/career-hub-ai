import express from 'express';
import { env } from './config/env.js';
import { corsMiddleware } from './middleware/cors.js';
import geminiRoutes from './routes/gemini.js';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' })); // Increased limit for resume uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/gemini', geminiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${env.PORT}`);
  console.log(`📡 CORS enabled for: ${env.FRONTEND_URL}`);
  console.log(`🔑 Gemini API key configured: ${env.GEMINI_API_KEY ? '✓' : '✗'}`);
});
