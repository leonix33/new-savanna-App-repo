import { Router } from 'express';
import { runSchedulerNow } from '../controllers/schedulerController.js';
import { requireRole } from '../middleware/auth.js';

export const schedulerRoutes = Router();

schedulerRoutes.post('/run', requireRole('admin'), runSchedulerNow);
