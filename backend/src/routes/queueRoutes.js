import { Router } from 'express';
import {
  createQueueItem,
  createQueueItemSchema,
  deleteQueueItem,
  listQueueItems,
  listQueueSchema,
  updateQueueItem,
  updateQueueItemSchema
} from '../controllers/queueController.js';
import { requireMinimumRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const queueRoutes = Router();

queueRoutes.get('/', validate(listQueueSchema), listQueueItems);
queueRoutes.post('/', requireMinimumRole('editor'), validate(createQueueItemSchema), createQueueItem);
queueRoutes.patch('/:id', requireMinimumRole('editor'), validate(updateQueueItemSchema), updateQueueItem);
queueRoutes.delete('/:id', requireMinimumRole('editor'), deleteQueueItem);
