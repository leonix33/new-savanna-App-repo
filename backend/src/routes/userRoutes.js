import { Router } from 'express';
import {
  createUser,
  createUserSchema,
  listUsers,
  updateUser,
  updateUserSchema
} from '../controllers/userController.js';
import { requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const userRoutes = Router();

userRoutes.use(requireRole('admin'));
userRoutes.get('/', listUsers);
userRoutes.post('/', validate(createUserSchema), createUser);
userRoutes.patch('/:id', validate(updateUserSchema), updateUser);
