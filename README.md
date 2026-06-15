# Savannah BBQ Growth Engine

Enterprise rebuild of the original Streamlit MVP as a mono-service Node.js application:

- Express API with MongoDB/Mongoose
- Vue 3 + Vite frontend in `frontend/`, served by Express from `backend/` in production
- JWT auth with `admin`, `editor`, and `viewer` roles
- AI generation, queue scheduling, comment automation, analytics, and social setup checks
- Render-ready single web service deployment

## Project Layout

```text
.
├── frontend/          # Vue 3 + Vite app
├── backend/           # Express API and static SPA server
├── Dockerfile         # Single production app image
├── docker-compose.yml # App + MongoDB for one-command local run
└── render.yaml        # Single Render web service
```

## One-Command Run With Docker

```bash
docker compose up --build
```

Open `http://localhost:5100`. The app container serves the built Vue frontend and the Express API as one service. MongoDB runs as a second local container for development.

The first admin is created automatically when MongoDB is empty:

```text
admin@savannahbbq.local
ChangeMe123!
```

## Local Setup Without Docker

1. Install dependencies:

```bash
npm install
```

2. Create local environment:

```bash
cp .env.example .env
```

3. Set at minimum:

```bash
MONGODB_URI=your_mongodb_atlas_or_local_uri
JWT_ACCESS_SECRET=a_long_random_secret
JWT_REFRESH_SECRET=another_long_random_secret
ADMIN_EMAIL=admin@savannahbbq.local
ADMIN_PASSWORD=ChangeMe123!
```

4. Seed the first admin manually, or let the backend create it on first startup when the database is empty:

```bash
npm run seed:admin
```

5. Start development:

```bash
npm run dev
```

The Vue app runs on `http://localhost:5173` and proxies `/api` to Express on `http://localhost:5100`. This is still a single command for development.

## Production / Render

This repo is designed for a single Render web service. Render runs:

```bash
npm install && npm run build
npm start
```

Express serves `frontend/dist` and all API routes from the same process. Use MongoDB Atlas for `MONGODB_URI`.

Required Render environment variables:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `OPENAI_API_KEY` (optional for demo generation, required for live AI output)
- `OPENAI_TEXT_MODEL`
- `OPENAI_VISION_MODEL`
- `FACEBOOK_APP_ID` (optional app tracking/configuration)
- `FACEBOOK_APP_SECRET` (optional app tracking/configuration)
- `FACEBOOK_PAGE_ID` (required for Facebook comment import and Page publishing)
- `FACEBOOK_PAGE_ACCESS_TOKEN` (required for Facebook comment import and Page publishing)
- `FACEBOOK_GRAPH_VERSION` (defaults to `v20.0`)
- `FACEBOOK_PUBLISH_ENABLED` (must be `true` before any real Facebook publish)

Safety flags should stay false until real social writes are implemented:

```bash
AUTO_PUBLISH_MODE=false
LIVE_FACEBOOK_MODE=false
LIVE_SOCIAL_PUBLISHING=false
FACEBOOK_PUBLISH_ENABLED=false
```

## Facebook Page Publishing

Facebook Page feed publishing is implemented behind an explicit safety flag. By default, the app keeps the existing simulation behavior and does not publish to Facebook.

Required Facebook variables:

```bash
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_PAGE_ID=your_facebook_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
FACEBOOK_GRAPH_VERSION=v20.0
FACEBOOK_PUBLISH_ENABLED=false
```

The backend also supports `META_APP_ID`, `META_APP_SECRET`, `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`, and `META_GRAPH_VERSION` as backwards-compatible aliases, but `FACEBOOK_*` values are preferred when both are set.

Never commit real Facebook access tokens or app secrets. Store production values only in Render environment variables or local untracked `.env` files.

Render setup:

1. Open the Render service.
2. Go to **Environment**.
3. Add the Facebook variables above.
4. Keep `FACEBOOK_PUBLISH_ENABLED=false` while testing simulation mode.
5. Save changes and redeploy.

Safe test endpoint:

```bash
POST /api/integrations/facebook/test-post
```

Only admins can call this endpoint. When `FACEBOOK_PUBLISH_ENABLED=false`, it returns a simulated response and does not call Meta. When `FACEBOOK_PUBLISH_ENABLED=true`, it posts the provided text to:

```text
POST /{FACEBOOK_PAGE_ID}/feed
```

The app resolves that Page id from `FACEBOOK_PAGE_ID` first, then `META_PAGE_ID` as a fallback. Access tokens are never logged.

To test safely:

1. First test with `FACEBOOK_PUBLISH_ENABLED=false` and confirm the simulated response.
2. Confirm `FACEBOOK_PAGE_ID` points to the correct Page.
3. Confirm the Page Access Token has permission to publish Page content.
4. Set `FACEBOOK_PUBLISH_ENABLED=true`.
5. Call the admin test endpoint with a harmless test message.
6. Set `FACEBOOK_PUBLISH_ENABLED=false` again if you want to disable real posting.

Scheduler behavior:

- Due queue items continue to simulate publishing by default.
- When `FACEBOOK_PUBLISH_ENABLED=true`, due queue items with platform `Facebook` are published to the configured Page.
- Successful live publishes save the returned Facebook post id on the publishing log.
- Failed live publishes mark the queue item as `failed` and save the error message.

## Features

- AI generator: campaigns, reels, hooks, hashtags, replies, promos, events, catering, email copy
- Menu & Specials Lab and Weekly Planner
- Content Queue with schedule date/time/timezone and simulated publishing logs
- Comment Automation with manual/demo ingestion, read-only Meta fetch, classification, draft, approve, and simulate
- Analytics dashboard for generations, queue statuses, publishes, comments, and review needs
- Social setup readiness page for Meta, Instagram, TikTok, and safety switches
- Admin user management

## Checks

```bash
npm run lint
npm run test
npm run build
```

## Notes

Facebook Page feed publishing exists behind `FACEBOOK_PUBLISH_ENABLED`. Instagram/TikTok writes and live comment replies remain disabled until implemented and reviewed separately.
