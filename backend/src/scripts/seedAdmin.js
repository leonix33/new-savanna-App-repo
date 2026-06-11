import { env } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../db/connect.js';
import { User } from '../models/User.js';

async function seed() {
  await connectDatabase();
  const existing = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    console.log(`Admin already exists: ${existing.email}`);
  } else {
    const user = new User({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      role: 'admin'
    });
    await user.setPassword(env.ADMIN_PASSWORD);
    await user.save();
    console.log(`Created admin: ${user.email}`);
  }

  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectDatabase();
  process.exit(1);
});
