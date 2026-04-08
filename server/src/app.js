import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import { authMiddleware } from './middleware/auth.js';

export function createApp() {
  const app = express();
  const clientOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://event-task-manager.netlify.app',
    process.env.CLIENT_ORIGIN
  ].filter(Boolean);
  
  app.use(cors({ origin: clientOrigins, credentials: true }));
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventsRoutes);

  app.get('/api/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
  });

  app.use('/api', (req, res) => {
    res.status(404).json({
      error: 'API route not found',
      code: 'ROUTE_NOT_FOUND',
      method: req.method,
      path: req.originalUrl,
    });
  });

  return app;
}
