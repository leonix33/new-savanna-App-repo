import axios from 'axios';
import { URLSearchParams } from 'node:url';
import { env, isConfigured } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/apiError.js';

export function getFacebookPublishConfig() {
  return {
    appId: env.FACEBOOK_APP_ID || env.META_APP_ID,
    appSecret: env.FACEBOOK_APP_SECRET || env.META_APP_SECRET,
    pageId: env.FACEBOOK_PAGE_ID || env.META_PAGE_ID,
    pageAccessToken: env.FACEBOOK_PAGE_ACCESS_TOKEN || env.META_PAGE_ACCESS_TOKEN,
    graphVersion: env.FACEBOOK_GRAPH_VERSION || env.META_GRAPH_VERSION
  };
}

export function isFacebookPublishEnabled() {
  return env.FACEBOOK_PUBLISH_ENABLED === true;
}

export function isFacebookPublishConfigured() {
  const config = getFacebookPublishConfig();
  return isConfigured(config.pageId) && isConfigured(config.pageAccessToken);
}

export function buildFacebookMessage(item) {
  const base = item.caption || item.content;
  const hashtags = item.hashtags?.length ? `\n\n${item.hashtags.join(' ')}` : '';
  return `${base}${hashtags}`.trim();
}

export async function publishFacebookTextPost(message) {
  if (!isFacebookPublishEnabled()) {
    logger.info('Facebook publishing disabled; returning simulated publish response');
    return {
      simulated: true,
      provider: 'facebook',
      message: 'Facebook publishing is disabled. Simulated publish complete.'
    };
  }

  if (!isFacebookPublishConfigured()) {
    throw new ApiError(500, 'Facebook publishing is enabled but Facebook page credentials are not configured');
  }

  const config = getFacebookPublishConfig();
  const url = `https://graph.facebook.com/${config.graphVersion}/${config.pageId}/feed`;
  const body = new URLSearchParams({
    message,
    access_token: config.pageAccessToken
  });
  logger.info({ pageId: config.pageId }, 'Publishing text post to Facebook Page');

  const response = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  logger.info({ facebookPostId: response.data?.id }, 'Facebook Page post published');
  return {
    simulated: false,
    provider: 'facebook',
    facebookPostId: response.data?.id
  };
}

export async function publishQueueItemToFacebook(item) {
  return publishFacebookTextPost(buildFacebookMessage(item));
}
