import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase } from './db/connect.js';
import { startScheduler } from './jobs/schedulerJob.js';
import { ensureInitialAdmin } from './services/bootstrapService.js';
import { createApp } from './app.js';

async function start() {
  await connectDatabase();
  await ensureInitialAdmin();
  const app = createApp();
  startScheduler();

  app.listen(env.PORT, () => {
    logger.info(`Savannah BBQ Growth Engine listening on ${env.PORT}`);
  });
}

start().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});
