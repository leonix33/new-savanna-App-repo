import { DateTime } from 'luxon';
import { PublishingLog } from '../models/PublishingLog.js';
import { QueueItem } from '../models/QueueItem.js';

export function isDue(item, now = DateTime.utc()) {
  if (item.status !== 'scheduled' || !item.scheduledDate || !item.scheduledTime) return false;
  const scheduled = DateTime.fromISO(`${item.scheduledDate}T${item.scheduledTime}`, {
    zone: item.timezone || 'America/New_York'
  });
  return scheduled.isValid && scheduled <= now.setZone(scheduled.zone);
}

export async function simulatePublish(item, userId) {
  item.status = 'publishing';
  await item.save();

  item.status = 'posted';
  await item.save();

  const log = await PublishingLog.create({
    queueItem: item.id,
    platform: item.platform,
    status: 'posted',
    message: 'Simulated publish complete. Live social publishing is disabled.',
    createdBy: userId
  });

  return { item, log };
}

export async function runScheduler({ userId } = {}) {
  const candidates = await QueueItem.find({ status: 'scheduled' }).limit(200);
  const due = candidates.filter((item) => isDue(item));
  const results = [];

  for (const item of due) {
    try {
      results.push(await simulatePublish(item, userId));
    } catch (error) {
      item.status = 'failed';
      await item.save();
      await PublishingLog.create({
        queueItem: item.id,
        platform: item.platform,
        status: 'failed',
        message: 'Scheduler simulation failed',
        errorMessage: error.message,
        createdBy: userId
      });
    }
  }

  return { checked: candidates.length, published: results.length, results };
}
