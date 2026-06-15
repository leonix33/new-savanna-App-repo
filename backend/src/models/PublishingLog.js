import mongoose from 'mongoose';

const publishingLogSchema = new mongoose.Schema(
  {
    queueItem: { type: mongoose.Schema.Types.ObjectId, ref: 'QueueItem', index: true },
    platform: { type: String, required: true },
    status: { type: String, required: true },
    message: String,
    facebookPostId: String,
    errorMessage: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const PublishingLog = mongoose.model('PublishingLog', publishingLogSchema);
