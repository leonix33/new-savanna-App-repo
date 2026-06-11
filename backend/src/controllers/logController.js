import { z } from 'zod';
import { CommentReplyLog } from '../models/CommentReplyLog.js';
import { PublishingLog } from '../models/PublishingLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const limitQuery = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(200).default(100)
  })
});

export const listLogSchema = limitQuery;

export const listPublishingLogs = asyncHandler(async (req, res) => {
  const logs = await PublishingLog.find()
    .populate('queueItem')
    .sort({ createdAt: -1 })
    .limit(req.query.limit);
  res.json({ logs });
});

export const listCommentReplyLogs = asyncHandler(async (req, res) => {
  const logs = await CommentReplyLog.find()
    .populate('comment')
    .sort({ createdAt: -1 })
    .limit(req.query.limit);
  res.json({ logs });
});
