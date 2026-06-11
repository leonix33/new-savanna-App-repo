import { Router } from 'express';
import { listCommentReplyLogs, listLogSchema, listPublishingLogs } from '../controllers/logController.js';
import { validate } from '../middleware/validate.js';

export const logRoutes = Router();

logRoutes.get('/publishing', validate(listLogSchema), listPublishingLogs);
logRoutes.get('/comment-replies', validate(listLogSchema), listCommentReplyLogs);
