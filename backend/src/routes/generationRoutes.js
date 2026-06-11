import { Router } from 'express';
import {
  deleteGeneration,
  listGenerationSchema,
  listGenerations
} from '../controllers/generationController.js';
import { requireMinimumRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const generationRoutes = Router();

generationRoutes.get('/', validate(listGenerationSchema), listGenerations);
generationRoutes.delete('/:id', requireMinimumRole('editor'), deleteGeneration);
