# KiddoCare (React Native + Expo)

A React Native app built with Expo, TypeScript, and function components. Converted from an earlier Figma Make React + Vite web scaffold — same screens and logic, rebuilt with React Native primitives (`View`/`Text`/`Pressable`/`StyleSheet`) instead of DOM/Tailwind.

## Repo layout

The app lives in **`frontend/`**. Run every command (`npm`, `npx expo`, `npx eas-cli`, `tsc`) from inside `frontend/`. All paths below are relative to `frontend/`. A `backend/` folder is planned but does not exist yet.

## Development

- `cd frontend`, then `npm install` and `npm start` (or `npm run android` / `npm run ios` / `npm run web`) to launch the Expo dev server.
- Requires the Expo Go app (or a dev build) to preview. Native modules (audio, haptics, secure-store, image-picker) only work in a dev build / the EAS APK, not Expo Go.

## Project Structure

- `index.ts` - Registers the root component with Expo
- `App.tsx` - Screen router (simple state-based navigation, no navigation library)
- `app.json` - Expo app config (name, permissions, plugins)
- `src/theme.ts` - Color palette and spacing constants (replaces the old CSS custom properties)
- `src/types.ts` - Shared domain types (child profiles, diagnoses, content tags, settings)
- `src/context/SettingsContext.tsx` - App settings (language, accessibility) persisted via AsyncStorage
- `src/modules/storage.ts` - AsyncStorage-backed child/settings persistence (in-memory cache + async writes)
- `src/modules/tts.ts` - Text-to-speech via `expo-speech`
- `src/modules/faceEngine.ts` - Cosine-similarity face-embedding matching (embedding capture happens in the screens via `expo-camera`)
- `src/modules/i18n.ts` / `src/modules/contentFilter.ts` - Translations and content filtering (unchanged pure logic)
- `src/components/` - `Mascot` (react-native-svg), `ScreenWrapper`, `BigButton`, `Card`
- `src/screens/` - One file per app screen

## Dependencies

- Runtime: Expo SDK 52, React Native 0.76, React 18
- Camera: `expo-camera`
- Speech: `expo-speech`
- Storage: `@react-native-async-storage/async-storage`
- Graphics: `react-native-svg`, `expo-linear-gradient`

## Styling

No Tailwind/CSS here — use `StyleSheet.create` and the shared color tokens in `src/theme.ts`. Prefer the `BigButton` and `Card` components over ad-hoc styled `Pressable`/`View` for consistency with the existing screens.

## Code quality

- Use double quotes for strings containing apostrophes, or escape them in single-quoted strings.
- Ensure JSX tags are closed and braces are balanced.
- Export screen/component modules as default exports.
