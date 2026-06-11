import mongoose from 'mongoose';

const commentReplyLogSchema = new mongoose.Schema(
  {
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true, index: true },
    status: { type: String, required: true },
    replyText: String,
    message: String,
    errorMessage: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const CommentReplyLog = mongoose.model('CommentReplyLog', commentReplyLogSchema);
