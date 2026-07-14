import mongoose from 'mongoose';
import { env, isConfigured } from '../config/env.js';
import {
  getFacebookPublishConfig,
  isFacebookPublishConfigured,
  isFacebookPublishEnabled
} from './facebookService.js';

export async function buildHealthBase() {
  const facebookConfig = getFacebookPublishConfig();
  const mongoConnected = mongoose.connection.readyState === 1;
  const openaiConfigured = isConfigured(env.OPENAI_API_KEY);
  const facebookPageConfigured = isConfigured(facebookConfig.pageId);
  const facebookTokenConfigured = isConfigured(facebookConfig.pageAccessToken);

  return {
    ok: mongoConnected,
    service: 'savannah-bbq-growth-engine',
    environment: env.NODE_ENV,
    mongoConfigured: Boolean(env.MONGODB_URI),
    mongoConnected,
    openaiConfigured,
    openaiDemoMode: !openaiConfigured,
    openaiTextModel: env.OPENAI_TEXT_MODEL,
    openaiVisionModel: env.OPENAI_VISION_MODEL,
    adminConfigured: Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD),
    facebookPageConfigured,
    facebookTokenConfigured,
    facebookAppConfigured: isConfigured(facebookConfig.appId),
    facebookReadOnlyReady: facebookPageConfigured && facebookTokenConfigured,
    facebookPublishEnabled: isFacebookPublishEnabled(),
    facebookPublishReady: isFacebookPublishEnabled() && isFacebookPublishConfigured(),
    facebookGraphVersion: facebookConfig.graphVersion,
    instagramConfigured: isConfigured(env.INSTAGRAM_BUSINESS_ID),
    tiktokConfigured: isConfigured(env.TIKTOK_BUSINESS_ID),
    safety: {
      autoPublishMode: env.AUTO_PUBLISH_MODE,
      liveFacebookMode: env.LIVE_FACEBOOK_MODE,
      liveSocialPublishing: env.LIVE_SOCIAL_PUBLISHING,
      facebookPublishEnabled: env.FACEBOOK_PUBLISH_ENABLED
    },
    writesImplemented: {
      facebookText: true,
      instagram: false,
      tiktok: false,
      liveCommentReplies: false
    },
    time: new Date().toISOString()
  };
}
