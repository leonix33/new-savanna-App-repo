import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { aiRoutes } from './routes/aiRoutes.js';
import { analyticsRoutes } from './routes/analyticsRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { commentRoutes } from './routes/commentRoutes.js';
import { generationRoutes } from './routes/generationRoutes.js';
import { logRoutes } from './routes/logRoutes.js';
import { queueRoutes } from './routes/queueRoutes.js';
import { schedulerRoutes } from './routes/schedulerRoutes.js';
import { settingsRoutes } from './routes/settingsRoutes.js';
import { userRoutes } from './routes/userRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: env.NODE_ENV === 'production' ? undefined : env.CLIENT_ORIGIN,
      credentials: true
    })
  );
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 600 }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'savannah-bbq-growth-engine', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api', requireAuth);
  app.use('/api/users', userRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/generations', generationRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/logs', logRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/scheduler', schedulerRoutes);
  app.use('/api/settings', settingsRoutes);

  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
