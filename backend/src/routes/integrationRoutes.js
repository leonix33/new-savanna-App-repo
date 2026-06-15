import { Router } from 'express';
import {
  facebookTestPostSchema,
  testFacebookPost
} from '../controllers/integrationController.js';
import { requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const integrationRoutes = Router();

integrationRoutes.post(
  '/facebook/test-post',
  requireRole('admin'),
  validate(facebookTestPostSchema),
  testFacebookPost
);
