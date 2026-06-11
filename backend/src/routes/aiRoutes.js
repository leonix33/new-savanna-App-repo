import { Router } from 'express';
import {
  captionImage,
  captionVideo,
  generateContent,
  generateSchema,
  upload
} from '../controllers/aiController.js';
import { requireMinimumRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const aiRoutes = Router();

aiRoutes.use(requireMinimumRole('editor'));
aiRoutes.post('/generate', validate(generateSchema), generateContent);
aiRoutes.post('/caption/image', upload.single('media'), captionImage);
aiRoutes.post('/caption/video', upload.single('media'), captionVideo);
