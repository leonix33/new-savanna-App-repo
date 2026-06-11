import { Router } from 'express';
import {
  addDemoComments,
  approveReplyById,
  approveSchema,
  classifyCommentById,
  createComment,
  createCommentSchema,
  draftReplyById,
  fetchFromFacebook,
  getCommentStatus,
  listComments,
  simulateReplyById
} from '../controllers/commentController.js';
import { requireMinimumRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const commentRoutes = Router();

commentRoutes.get('/status', getCommentStatus);
commentRoutes.get('/', listComments);
commentRoutes.post('/', requireMinimumRole('editor'), validate(createCommentSchema), createComment);
commentRoutes.post('/demo', requireMinimumRole('editor'), addDemoComments);
commentRoutes.post('/fetch-facebook', requireMinimumRole('editor'), fetchFromFacebook);
commentRoutes.post('/:id/classify', requireMinimumRole('editor'), classifyCommentById);
commentRoutes.post('/:id/draft-reply', requireMinimumRole('editor'), draftReplyById);
commentRoutes.post('/:id/approve', requireMinimumRole('editor'), validate(approveSchema), approveReplyById);
commentRoutes.post('/:id/simulate-reply', requireMinimumRole('editor'), simulateReplyById);
