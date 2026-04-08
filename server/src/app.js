import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import { authMiddleware } from './middleware/auth.js';

export function createApp() {
  const app = express();
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  app.use(cors({ origin: clientOrigin, credentials: true }));
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
