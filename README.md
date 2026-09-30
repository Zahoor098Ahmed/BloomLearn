# BloomLearn

Speak (or type) a sentence and see it as a picture. In "Picture Talk" the
spoken sentence is turned into text, understood on the device, and drawn as a
scene; you can also make a full AI picture of it. The app also has a Home page, a
Progress tab that grows as the child uses the app (levels, streak, positions,
colours, words, badges), Settings with a parent passcode lock and privacy
controls, a privacy policy and a Help page. Languages: English and Arabic.

Monorepo layout:

```
.
├── frontend/     React Native + Expo app
│   ├── App.tsx           router: Welcome → Home / Talk / Progress tabs; Settings, Help, Privacy
│   ├── app.json          Expo config (EAS projectId lives here)
│   ├── eas.json          EAS Build profiles
│   ├── assets/bookVocab/ offline book pictures
│   └── src/
│       ├── screens/      Welcome, Home, Picture Talk, Progress, Settings, Help, Privacy
│       ├── components/   SceneStage, SceneComposer, TabBar, Logo, PinGate
│       ├── modules/      voice, audio, tts, scene engine, image library, AI
│       └── context/      SettingsContext
├── backend/      Express API: proxies OpenAI (image gen + Whisper) and the
│                 /scene image engine so keys never ship in the app
├── content-pipeline/  builds the offline book-picture vocabulary
└── AGENTS.md / CLAUDE.md  project instructions
```

## Working on the backend

```bash
cd backend
cp .env.example .env      # fill in OPENAI_API_KEY and APP_TOKEN
npm install
npm run dev               # http://localhost:8787
```

### Connecting the two — `.env` only

The app talks to the backend when **`frontend/.env`** has:

```ini
EXPO_PUBLIC_AI_PROXY_URL=http://<lan-ip>:8787   # or the deployed URL
EXPO_PUBLIC_AI_PROXY_TOKEN=<same as APP_TOKEN in backend/.env>
```

The OpenAI key lives only in `backend/.env`. Both `.env` files are
git-ignored; `.env.example` in each folder is the template. See
`frontend/.env.example` for the optional Pollinations and Groq keys.

All of these can also be entered in the app under **Settings → AI & voice
engines** (saved on the device; they override the build-time values). On a
phone, voice-to-text needs an OpenAI key or the backend.

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

The instant scene and the offline picture library work without internet.
Internet is used for picture lookups (ARASAAC / OpenSymbols) and the
optional AI picture feature.
