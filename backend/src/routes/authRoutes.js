import { Router } from 'express';
import { env } from '../config/env.js';
import {
  getMe,
  loginLocalDevUser,
  loginSchema,
  loginUser,
  logoutUser,
  refreshSession
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), loginUser);
if (env.NODE_ENV !== 'production') {
  authRoutes.post('/dev-login', loginLocalDevUser);
}
authRoutes.post('/refresh', refreshSession);
authRoutes.post('/logout', requireAuth, logoutUser);
authRoutes.get('/me', requireAuth, getMe);
