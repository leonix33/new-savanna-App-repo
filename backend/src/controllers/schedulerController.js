import { runScheduler } from '../services/schedulerService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const runSchedulerNow = asyncHandler(async (req, res) => {
  const result = await runScheduler({ userId: req.user.id });
  res.json(result);
});
