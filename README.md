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

Safety flags should stay false until real social writes are implemented:

```bash
AUTO_PUBLISH_MODE=false
LIVE_FACEBOOK_MODE=false
LIVE_SOCIAL_PUBLISHING=false
```

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

The app intentionally keeps social publishing simulate-only. Real Facebook/Instagram/TikTok writes and live comment replies should be added in a separate reviewed change behind the existing safety flags.
