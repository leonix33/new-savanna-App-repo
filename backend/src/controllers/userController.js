import { z } from 'zod';
import { roles, User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(roles).default('viewer')
  })
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.enum(roles).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8).optional()
  })
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users: users.map((user) => user.toSafeObject()) });
});

export const createUser = asyncHandler(async (req, res) => {
  const existing = await User.findOne({ email: req.body.email.toLowerCase() });
  if (existing) throw new ApiError(409, 'Email already exists');

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  });
  await user.setPassword(req.body.password);
  await user.save();
  res.status(201).json({ user: user.toSafeObject() });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  Object.assign(user, req.body);
  if (req.body.password) await user.setPassword(req.body.password);
  await user.save();

  res.json({ user: user.toSafeObject() });
});
