import cron from 'node-cron';
import { logger } from '../config/logger.js';
import { runScheduler } from '../services/schedulerService.js';

let task;

export function startScheduler() {
  if (task) return task;
  task = cron.schedule('* * * * *', async () => {
    try {
      const result = await runScheduler();
      if (result.published > 0) logger.info({ result }, 'Scheduler simulated due posts');
    } catch (error) {
      logger.error({ error }, 'Scheduler run failed');
    }
  });
  return task;
}

export function stopScheduler() {
  task?.stop();
  task = undefined;
}
