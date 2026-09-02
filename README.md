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
├── AGENTS.md / CLAUDE.md  project instructions
└── (backend/)             not created yet — planned for the OpenAI key proxy + cloud sync
```

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
