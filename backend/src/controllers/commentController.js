import { z } from 'zod';
import { Comment } from '../models/Comment.js';
import {
  approveCommentReply,
  classifyComment,
  draftCommentReply,
  fetchFacebookComments,
  isFacebookReadConfigured,
  seedDemoComments,
  simulateCommentReply
} from '../services/commentService.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createCommentSchema = z.object({
  body: z.object({
    sourcePost: z.string().optional(),
    commenterName: z.string().default('Manual Entry'),
    commentText: z.string().min(1),
    facebookPostId: z.string().optional(),
    facebookCommentId: z.string().optional()
  })
});

export const approveSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({ replyText: z.string().min(1).optional() })
});

async function findComment(id) {
  const comment = await Comment.findById(id);
  if (!comment) throw new ApiError(404, 'Comment not found');
  return comment;
}

export const getCommentStatus = asyncHandler(async (_req, res) => {
  res.json({
    facebookReadConfigured: isFacebookReadConfigured(),
    liveRepliesEnabled: false,
    demoMode: !isFacebookReadConfigured()
  });
});

export const listComments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.classification) filter.classification = req.query.classification;
  const comments = await Comment.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json({ comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const comment = await Comment.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ comment });
});

export const classifyCommentById = asyncHandler(async (req, res) => {
  const comment = await classifyComment(await findComment(req.params.id));
  res.json({ comment });
});

export const draftReplyById = asyncHandler(async (req, res) => {
  const comment = await draftCommentReply(await findComment(req.params.id));
  res.json({ comment });
});

export const approveReplyById = asyncHandler(async (req, res) => {
  const comment = await approveCommentReply(await findComment(req.params.id), req.body.replyText);
  res.json({ comment });
});

export const simulateReplyById = asyncHandler(async (req, res) => {
  const comment = await simulateCommentReply(await findComment(req.params.id), req.user.id);
  res.json({ comment });
});

export const fetchFromFacebook = asyncHandler(async (req, res) => {
  const comments = await fetchFacebookComments(req.user.id);
  res.json({ imported: comments.length, comments });
});

export const addDemoComments = asyncHandler(async (req, res) => {
  const comments = await seedDemoComments(req.user.id);
  res.status(201).json({ comments });
});
