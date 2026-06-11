import mongoose from 'mongoose';

export const commentCategories = [
  'sales_question',
  'location_or_hours',
  'catering_lead',
  'positive_engagement',
  'service_issue',
  'general_engagement'
];

export const commentStatuses = [
  'new',
  'classified',
  'reply_drafted',
  'approved',
  'simulated_replied',
  'failed'
];

const commentSchema = new mongoose.Schema(
  {
    facebookPostId: String,
    facebookCommentId: { type: String, index: true },
    sourcePost: String,
    commenterName: { type: String, default: 'Facebook User' },
    commentText: { type: String, required: true },
    classification: { type: String, enum: commentCategories },
    suggestedReply: String,
    status: { type: String, enum: commentStatuses, default: 'new', index: true },
    lastReplyAttemptAt: Date,
    replyStatus: String,
    errorMessage: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

commentSchema.index(
  { facebookCommentId: 1 },
  { unique: true, partialFilterExpression: { facebookCommentId: { $type: 'string' } } }
);

export const Comment = mongoose.model('Comment', commentSchema);
