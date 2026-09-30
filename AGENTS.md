# BloomLearn (React Native + Expo)

A React Native app built with Expo, TypeScript, and function components. The child or teacher speaks (or types) a sentence and BloomLearn shows it as a picture ("Picture Talk"). Around it: a welcome/language screen (English or Arabic), Home, Progress, Settings (parent lock + privacy), Help and a privacy policy.

## Repo layout

The app lives in **`frontend/`**. Run every command (`npm`, `npx expo`, `npx eas-cli`, `tsc`) from inside `frontend/`. All paths below are relative to `frontend/`.

**`backend/`** is a small Express (JavaScript, ESM) API that proxies OpenAI (image generation + Whisper speech-to-text) and the `/scene` image engine so keys never ship in the app. `cd backend && npm install && npm run dev`. The app uses it only when a backend URL is set (Settings, or `EXPO_PUBLIC_AI_PROXY_URL`) — otherwise it calls OpenAI directly with an in-app key, and the instant scene runs fully offline with neither.

**`content-pipeline/`** builds the offline book-picture vocabulary (`src/modules/bookVocab.generated.ts` + `assets/bookVocab/`).

## Development

- `cd frontend`, then `npm install` and `npm start` (or `npm run android` / `npm run ios` / `npm run web`) to launch the Expo dev server.
- `npm run typecheck`, `npm run test:scene` and `npm run test:math` check the code.
- Native audio recording only works in a dev build / the EAS APK, not Expo Go.

## Project Structure

- `index.ts` - Registers the root component with Expo
- `App.tsx` - State-based router: Welcome (first run) → tabs Home / Talk / Progress, plus Subject, Settings (behind the parent lock when a passcode is set), Help and Privacy. Picture Talk stays mounted so the scene survives tab switches; Android back steps back through screens
- `app.json` - Expo app config (name, permissions, plugins)
- `src/theme.ts` - Color palette and spacing constants
- `src/types.ts` - Shared types (settings, scene graph)
- `src/context/SettingsContext.tsx` - App settings (language — English or Arabic only, read-aloud, speech speed, history on/off, onboarding) persisted via AsyncStorage
- `src/screens/SentencePictureScreen.tsx` - Picture Talk: mic/text input, scene, AI picture
- `src/screens/WelcomeScreen.tsx` / `HomeScreen.tsx` / `ProgressScreen.tsx` / `SettingsScreen.tsx` / `HelpScreen.tsx` / `PrivacyScreen.tsx` - The other screens
- `src/components/TabBar.tsx` / `Logo.tsx` / `PinGate.tsx` - Shared chrome; PinGate is the parent passcode keypad
- `src/modules/apiKeys.ts` - OpenAI / Groq / Pollinations keys and backend URL, editable in Settings (falls back to `EXPO_PUBLIC_*` env vars)
- `src/modules/history.ts` - Recent sentences (only saved while "Save sentence history" is on)
- `src/modules/mathScene.ts` / `src/components/MathStage.tsx` - Sums ("5 apples - 3 apples", "3 × 2 apples", "10 ÷ 2 candies") are read by `parseMath`, and short story problems ("Sara has 5 apples. She gives 2 apples to Ali. How many are left?") by `parseWordProblem`; both are drawn as a counting picture instead of a scene. Every sum also gets a storybook-style AI picture (a story problem from its own story, a plain sum from `sumStory`) (`generateSentenceImage(…, "story")` / `composeStoryUrl`, backend `style: "story"`) when an engine is set up; the answer stays hidden in a chapter until "Show answer"
- `src/modules/curriculum.ts` - School content: English / Math / Science → Grade 1–5 → chapters → lessons (English sentences the picture engine can draw; only Grade 1 is filled, plus a Prepositions chapter in every English grade). Each subject has an `imageStyle` added to AI picture prompts
- `src/screens/SubjectScreen.tsx` - Grade picker + chapter list; a chapter opens Picture Talk in lesson mode (`lesson` prop)
- `src/modules/progress.ts` - Learning progress: sentences per day, streak, levels, positions/colours/words used, badges
- `src/modules/passcode.ts` - 4-digit parent passcode (SecureStore)
- `src/components/SceneStage.tsx` / `SceneComposer.tsx` - Draw the understood scene
- `src/modules/voice.ts` / `audio.ts` - Live speech recognition, with record + Whisper fallback
- `src/modules/sentenceScene.ts` / `sceneSession.ts` / `sceneAgent.ts` - Sentence → scene understanding (rule parser, optional LLM agent)
- `src/modules/imageLibrary.ts` / `aacPictograms.ts` / `bookVocab.ts` - Picture lookup and on-device library
- `src/modules/aiImage.ts` / `aiScene.ts` - AI picture generation (OpenAI / Pollinations)
- `src/modules/tts.ts` - Read aloud via `expo-speech`
- `src/modules/i18n.ts` - Translations

## Styling

No Tailwind/CSS here — use `StyleSheet.create` and the shared color tokens in `src/theme.ts`.

## Code quality

- Use double quotes for strings containing apostrophes, or escape them in single-quoted strings.
- Ensure JSX tags are closed and braces are balanced.
- Export screen/component modules as default exports.
