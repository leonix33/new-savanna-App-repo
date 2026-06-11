import { z } from 'zod';
import { QueueItem, queueStatuses } from '../models/QueueItem.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { compactObject, extractHashtags } from '../utils/text.js';

export const createQueueItemSchema = z.object({
  body: z.object({
    platform: z.string().min(1),
    tone: z.string().optional(),
    content: z.string().min(1),
    caption: z.string().optional(),
    hashtags: z.array(z.string()).optional(),
    mediaType: z.enum(['text', 'image', 'video', 'media']).default('text'),
    mediaName: z.string().optional(),
    scheduledDate: z.string().optional(),
    scheduledTime: z.string().optional(),
    timezone: z.string().default('America/New_York'),
    sourceGeneration: z.string().optional()
  })
});

export const updateQueueItemSchema = z.object({
  params: z.object({ id: z.string() }),
  body: createQueueItemSchema.shape.body.partial().extend({
    status: z.enum(queueStatuses).optional()
  })
});

export const listQueueSchema = z.object({
  query: z.object({
    status: z.enum(queueStatuses).optional(),
    platform: z.string().optional(),
    limit: z.coerce.number().min(1).max(200).default(100)
  })
});

export const listQueueItems = asyncHandler(async (req, res) => {
  const filter = compactObject({ status: req.query.status, platform: req.query.platform });
  const items = await QueueItem.find(filter).sort({ createdAt: -1 }).limit(req.query.limit);
  res.json({ items });
});

export const createQueueItem = asyncHandler(async (req, res) => {
  const item = await QueueItem.create({
    ...req.body,
    caption: req.body.caption || req.body.content,
    hashtags: req.body.hashtags || extractHashtags(req.body.content),
    status: req.body.scheduledDate && req.body.scheduledTime ? 'scheduled' : 'queued',
    createdBy: req.user.id
  });
  res.status(201).json({ item });
});

export const updateQueueItem = asyncHandler(async (req, res) => {
  const updates = {
    ...req.body,
    updatedBy: req.user.id
  };
  if (req.body.content && !req.body.hashtags) updates.hashtags = extractHashtags(req.body.content);
  if (req.body.scheduledDate && req.body.scheduledTime && !req.body.status) updates.status = 'scheduled';

  const item = await QueueItem.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!item) throw new ApiError(404, 'Queue item not found');
  res.json({ item });
});

export const deleteQueueItem = asyncHandler(async (req, res) => {
  await QueueItem.findByIdAndDelete(req.params.id);
  res.status(204).end();
});
