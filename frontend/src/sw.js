/* global Response, self */

import { clientsClaim } from 'workbox-core';
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request, url }) =>
    url.origin === self.location.origin &&
    !url.pathname.startsWith('/api/') &&
    ['font', 'image', 'script', 'style'].includes(request.destination),
  new CacheFirst({ cacheName: 'static-assets' })
);

setCatchHandler(async ({ request }) => {
  if (request.mode === 'navigate') {
    return (await matchPrecache('/offline.html')) || Response.error();
  }

  return Response.error();
});
