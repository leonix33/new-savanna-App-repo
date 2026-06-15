import { env, isConfigured } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSocialSetup = asyncHandler(async (_req, res) => {
  res.json({
    facebook: {
      pageConfigured: isConfigured(env.FACEBOOK_PAGE_ID),
      tokenConfigured: isConfigured(env.FACEBOOK_PAGE_ACCESS_TOKEN),
      graphVersion: env.FACEBOOK_GRAPH_VERSION,
      readOnlyFetchAvailable:
        isConfigured(env.FACEBOOK_PAGE_ID) && isConfigured(env.FACEBOOK_PAGE_ACCESS_TOKEN)
    },
    metaPublishing: {
      appConfigured: isConfigured(env.META_APP_ID),
      appSecretConfigured: isConfigured(env.META_APP_SECRET),
      pageConfigured: isConfigured(env.META_PAGE_ID),
      tokenConfigured: isConfigured(env.META_PAGE_ACCESS_TOKEN),
      graphVersion: env.META_GRAPH_VERSION,
      publishEnabled: env.FACEBOOK_PUBLISH_ENABLED,
      publishAvailable:
        env.FACEBOOK_PUBLISH_ENABLED &&
        isConfigured(env.META_PAGE_ID) &&
        isConfigured(env.META_PAGE_ACCESS_TOKEN)
    },
    instagram: { businessIdConfigured: isConfigured(env.INSTAGRAM_BUSINESS_ID) },
    tiktok: { businessIdConfigured: isConfigured(env.TIKTOK_BUSINESS_ID) },
    safety: {
      autoPublishMode: env.AUTO_PUBLISH_MODE,
      liveFacebookMode: env.LIVE_FACEBOOK_MODE,
      liveSocialPublishing: env.LIVE_SOCIAL_PUBLISHING,
      writesImplemented: false
    }
  });
});
