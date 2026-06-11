import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { User } from '../models/User.js';

export async function ensureInitialAdmin() {
  const userCount = await User.countDocuments();
  if (userCount > 0) return;

  const admin = new User({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    role: 'admin'
  });
  await admin.setPassword(env.ADMIN_PASSWORD);
  await admin.save();
  logger.info({ email: admin.email }, 'Created initial admin user');
}
