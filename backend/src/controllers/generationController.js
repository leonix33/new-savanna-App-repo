import { z } from 'zod';
import { Generation } from '../models/Generation.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listGenerationSchema = z.object({
  query: z.object({
    task: z.string().optional(),
    platform: z.string().optional(),
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).default(25),
    page: z.coerce.number().min(1).default(1)
  })
});

export const listGenerations = asyncHandler(async (req, res) => {
  const { task, platform, search, limit, page } = req.query;
  const filter = {};
  if (task) filter.task = task;
  if (platform) filter.platform = platform;
  if (search) filter.$text = { $search: search };

  const [items, total] = await Promise.all([
    Generation.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Generation.countDocuments(filter)
  ]);

  res.json({ items, total, page, limit });
});

export const deleteGeneration = asyncHandler(async (req, res) => {
  await Generation.findByIdAndDelete(req.params.id);
  res.status(204).end();
});
