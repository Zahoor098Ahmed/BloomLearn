# Special Needs Children App (KiddoCare)

Monorepo layout:

```
.
├── frontend/     React Native + Expo app (all UI + on-device logic)
│   ├── App.tsx
│   ├── index.ts
│   ├── app.json          Expo config (EAS projectId lives here)
│   ├── eas.json          EAS Build profiles
│   ├── package.json
│   └── src/
│       ├── screens/      one file per screen
│       ├── components/   shared UI
│       ├── modules/      storage, tts, audio, haptics, passcode, AI, image search…
│       └── context/      SettingsContext
├── backend/           Express API — proxies OpenAI (image gen + Whisper) and
│   │                  image search so keys never ship in the app
│   ├── src/
│   │   ├── index.js
│   │   ├── config.js
│   │   ├── middleware/auth.js
│   │   └── routes/    health.js · images.js · audio.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
└── AGENTS.md / CLAUDE.md  project instructions
```

## Working on the backend

```bash
cd backend
cp .env.example .env      # fill in OPENAI_API_KEY and APP_TOKEN
npm install
npm run dev               # http://localhost:8787
```

Then point the app at it: in `frontend/src/modules/aiImage.ts` set
`AI_PROXY_URL` to the backend's base URL and `AI_PROXY_TOKEN` to the same
`APP_TOKEN`. See `backend/README.md` for the full endpoint list.

## Working on the frontend

```bash
cd frontend
npm install
npm start            # Expo dev server (use Expo Go or a dev build)
```

## Building the APK

```bash
cd frontend
npx eas-cli build --platform android --profile preview   # installable APK
npx eas-cli build --platform android --profile production # Play Store bundle
```

The app is offline-first. Internet is only used for optional image search
(ARASAAC / Pixabay) and the optional AI picture feature.
