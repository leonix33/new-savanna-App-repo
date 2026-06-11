import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(configDir, '../..');
const repoRoot = path.resolve(backendRoot, '..');

dotenv.config({ path: [path.join(backendRoot, '.env'), path.join(repoRoot, '.env')] });

const boolString = z
  .string()
  .default('false')
  .transform((value) => value === 'true');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5100),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECURE: boolString,
  ADMIN_NAME: z.string().default('Savannah Admin'),
  ADMIN_EMAIL: z.string().email().default('admin@savannahbbq.local'),
  ADMIN_PASSWORD: z.string().default('ChangeMe123!'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_TEXT_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_VISION_MODEL: z.string().default('gpt-4o-mini'),
  FACEBOOK_PAGE_ID: z.string().optional(),
  FACEBOOK_PAGE_ACCESS_TOKEN: z.string().optional(),
  FACEBOOK_GRAPH_VERSION: z.string().default('v20.0'),
  INSTAGRAM_BUSINESS_ID: z.string().optional(),
  TIKTOK_BUSINESS_ID: z.string().optional(),
  AUTO_PUBLISH_MODE: boolString,
  LIVE_FACEBOOK_MODE: boolString,
  LIVE_SOCIAL_PUBLISHING: boolString,
  MAX_IMAGE_SIDE: z.coerce.number().default(1280),
  IMAGE_JPEG_QUALITY: z.coerce.number().default(80),
  MAX_VIDEO_SECONDS: z.coerce.number().default(30),
  MAX_VIDEO_UPLOAD_MB: z.coerce.number().default(50),
  VIDEO_FRAME_COUNT: z.coerce.number().default(4)
});

const testDefaults = {
  MONGODB_URI: 'mongodb://127.0.0.1:27017/savannah-test',
  JWT_ACCESS_SECRET: 'test_access_secret_12345',
  JWT_REFRESH_SECRET: 'test_refresh_secret_12345'
};

export const env = schema.parse(
  process.env.NODE_ENV === 'test' ? { ...testDefaults, ...process.env } : process.env
);

export const isConfigured = (value) =>
  Boolean(value) && !value.includes('your_') && !value.includes('paste_') && !value.endsWith('_here');
