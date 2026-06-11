import mongoose from 'mongoose';

export const queueStatuses = ['queued', 'scheduled', 'publishing', 'posted', 'failed'];
export const mediaTypes = ['text', 'image', 'video', 'media'];

const queueItemSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, index: true },
    tone: { type: String, default: 'Friendly' },
    content: { type: String, required: true },
    caption: String,
    hashtags: [String],
    mediaType: { type: String, enum: mediaTypes, default: 'text' },
    mediaName: String,
    status: { type: String, enum: queueStatuses, default: 'queued', index: true },
    scheduledDate: String,
    scheduledTime: String,
    timezone: { type: String, default: 'America/New_York' },
    sourceGeneration: { type: mongoose.Schema.Types.ObjectId, ref: 'Generation' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

queueItemSchema.index({ status: 1, scheduledDate: 1, scheduledTime: 1 });

export const QueueItem = mongoose.model('QueueItem', queueItemSchema);
