# KiddoCare Backend (Express)

A thin API that keeps the OpenAI (and Pixabay) keys **off the device**. The
mobile app talks to this instead of calling OpenAI directly.

```
backend/
├── src/
│   ├── index.js              app entry + middleware wiring
│   ├── config.js             reads .env
│   ├── middleware/auth.js    "Authorization: Bearer <APP_TOKEN>" check
│   └── routes/
│       ├── health.js         GET  /health              (public)
│       ├── images.js         POST /images/generations  + GET /images/search
│       └── audio.js          POST /audio/transcriptions (Whisper)
├── .env.example
├── Dockerfile
└── package.json
```

## Run locally

```bash
cd backend
cp .env.example .env      # then fill in OPENAI_API_KEY and APP_TOKEN
npm install
npm run dev               # http://localhost:8787
```

Quick check:

```bash
curl http://localhost:8787/health
```

## Endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| GET  | `/health` | – | status JSON (no auth) |
| POST | `/images/generations` | `{ "prompt": "juice", "style": "word" }` | `{ data: [{ b64_json }] }` — same shape as OpenAI |
| GET  | `/images/search` | `?q=cat&source=arasaac` (or `pixabay`) | `{ hits: [{ id, thumb, full, source }] }` |
| POST | `/audio/transcriptions` | multipart: `file` (audio), optional `language` | `{ text: "juice" }` |

All except `/health` require `Authorization: Bearer <APP_TOKEN>` when `APP_TOKEN` is set.

## Point the app at it

In `frontend/src/modules/aiImage.ts` set:

```js
export const AI_PROXY_URL = "https://your-backend.example.com"; // base URL, no trailing path
export const AI_PROXY_TOKEN = "the same APP_TOKEN value";
```

With `AI_PROXY_URL` set, the app calls `<base>/images/generations` and
`<base>/audio/transcriptions` on this server and sends no OpenAI key of its own.

## Deploy

Any Node host works — Render, Railway, Fly.io, a VPS, or Docker:

```bash
docker build -t kiddocare-backend .
docker run -p 8787:8787 --env-file .env kiddocare-backend
```

Set a **hard spending limit** on the OpenAI key in the OpenAI dashboard.

## Not built yet (planned)

- `/backup/:deviceId` GET/PUT for cloud backup & restore of the board
- Rate limiting per device
- Usage logging / cost dashboard
