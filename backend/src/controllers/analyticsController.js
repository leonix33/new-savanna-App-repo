import { Comment } from '../models/Comment.js';
import { Generation } from '../models/Generation.js';
import { PublishingLog } from '../models/PublishingLog.js';
import { QueueItem } from '../models/QueueItem.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function groupCount(model, field) {
  const rows = await model.aggregate([{ $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((row) => [row._id || 'unknown', row.count]));
}

export const getAnalytics = asyncHandler(async (_req, res) => {
  const [
    generationCount,
    queueCount,
    publishedCount,
    commentCount,
    queueByStatus,
    commentsByClassification,
    commentsByStatus,
    recentPublishingLogs
  ] = await Promise.all([
    Generation.countDocuments(),
    QueueItem.countDocuments(),
    PublishingLog.countDocuments({ status: 'posted' }),
    Comment.countDocuments(),
    groupCount(QueueItem, 'status'),
    groupCount(Comment, 'classification'),
    groupCount(Comment, 'status'),
    PublishingLog.find().sort({ createdAt: -1 }).limit(10)
  ]);

  const needsReview = await Comment.countDocuments({
    $or: [
      { status: { $in: ['new', 'classified', 'reply_drafted', 'failed'] } },
      { classification: 'service_issue' }
    ]
  });

  res.json({
    totals: { generationCount, queueCount, publishedCount, commentCount, needsReview },
    queueByStatus,
    commentsByClassification,
    commentsByStatus,
    recentPublishingLogs
  });
});
