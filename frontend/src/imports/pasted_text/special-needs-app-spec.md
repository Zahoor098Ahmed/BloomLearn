# KiddoCare — Special Needs Children App
### Full Project Specification, Design Theme & Development Guide

---

## 1. Core Concept

A **reusable Face Recognition + Profile Matching Engine** that is built once and reused across multiple apps (Autism, Down Syndrome, Speech Therapy, etc.). Every time a child taps the app icon, the front camera silently scans their face, matches it on-device against saved profiles, and shows only the content their doctor has approved — tailored to their age and diagnosis.

If two or three children share one device (common in many households), each child gets their own **safe, personalized experience** with no manual login required.

---

## 2. Why This Approach Works

| Reason | Detail |
|--------|--------|
| **Accessibility** | Children with autism or Down syndrome cannot navigate login menus — face scan is the simplest possible interaction (just pick up the phone) |
| **Clinical control** | Doctors/therapists decide which content each child sees; parents enforce it; the child has no way to bypass it |
| **Privacy by design** | All face data stays on-device, encrypted — never uploaded to any server; fully child-safety compliant |
| **Reusability** | One engine, many apps — only content and theme change per app, not the recognition logic |

---

## 3. System Architecture

```
App Icon Tap
     │
     ▼
Front Camera Auto-Scan  (1–2 s, silent, no button)
     │
     ▼
On-Device Face Match  (MobileFaceNet embeddings, cosine similarity)
     │
  ┌──┴──┐
  ▼     ▼
Match  No Match
  │       │
  ▼       ▼
Load    Parent Setup
Profile  Screen
  │
  ▼
Filtered Content Feed
(age + doctor-approved tags only)
```

### Core Modules (all reusable)

| Module | Purpose |
|--------|---------|
| `faceEngine` | Silent capture + on-device embedding + cosine match |
| `storage` | Local encrypted profile DB (AsyncStorage / localStorage) |
| `contentFilter` | Returns only allowed content for a given profile |
| `i18n` | Central translation file; add one entry → available everywhere |
| `SettingsContext` | Font size, contrast, sound, motion, language — app-wide |

---

## 4. Screens

### Child-facing

| Screen | Purpose |
|--------|---------|
| **Face Scan** | Silent auto-capture on launch; finds match or routes to Parent Setup |
| **Content Home** | Age + tag filtered content grid; quick-access to all 4 shortcut screens |
| **Visual Daily Schedule** | Day's routine as tappable picture cards with times (critical for autism/predictability) |
| **AAC Communication Board** | Picture-button grid (Needs / Feelings / People / Actions / Food) that speaks words aloud; chainable into sentences (for non-verbal children) |
| **Rewards / Stars / Badges** | Positive reinforcement; stars accumulate; badges unlock at thresholds |
| **Calm-Down / Sensory Break** | Guided breathing circle animation with voice narration; no flash, no sudden movement (for autism, ADHD, SPD) |

### Parent / Guardian

| Screen | Purpose |
|--------|---------|
| **Language Selection** | First-launch language/country picker; RTL languages auto-flip layout |
| **Parent Setup Hub** | Enroll new child, view/manage all profiles, access Doctor Panel and Settings |
| **Enroll Child** | 3-angle face capture + name + age + multi-select diagnosis |
| **All Children (Parent Hub)** | View enrolled profiles, see star counts, remove children |
| **Accessibility Settings** | Font size (4 levels) · High contrast · Sound on/off · Reduce motion · Language |

### Doctor / Therapist

| Screen | Purpose |
|--------|---------|
| **Doctor Panel** | Per-child toggle of every content tag; only enabled tags are ever served to that child |

---

## 5. Diagnosis Types Supported

The system supports **multiple diagnoses per child** (e.g., Autism + Non-verbal):

| Code | Label |
|------|-------|
| `autism` | Autism (ASD) |
| `down-syndrome` | Down Syndrome |
| `speech-delay` | Speech / Language Delay |
| `adhd` | ADHD |
| `hearing-impairment` | Hearing Impairment |
| `visual-impairment` | Visual Impairment |
| `dyslexia` | Dyslexia / Learning Disability |
| `cerebral-palsy` | Cerebral Palsy / Motor Difficulty |
| `intellectual-disability` | Intellectual Disability |
| `sensory-processing` | Sensory Processing Disorder |
| `non-verbal` | Non-verbal |
| `general` | General Special Needs |

---

## 6. Multi-Language & RTL Support

Languages included out of the box:

| Flag | Code | Script | RTL |
|------|------|--------|-----|
| 🇺🇸 | `en-US` | Latin | No |
| 🇸🇦 | `ar-SA` | Arabic | **Yes** |
| 🇵🇰 | `ur-PK` | Urdu | **Yes** |
| 🇮🇳 | `hi-IN` | Devanagari | No |
| 🇪🇸 | `es-ES` | Latin | No |
| 🇫🇷 | `fr-FR` | Latin | No |

**Adding a new language** = one entry in `src/modules/i18n.ts`. No other file changes required.

RTL languages automatically set `document.dir = "rtl"` on the root element, flipping the entire layout.

Voice narration (TTS) uses the language code directly (e.g., `ur-PK`, `ar-SA`) so the speech engine uses the correct accent and pronunciation.

---

## 7. Design System

### Color Palette (Pastel — sensory-safe)

| Role | Value | Usage |
|------|-------|-------|
| Background | `#fef9f0` | Page ground |
| Coral | `#ff8f6b` | Primary CTA buttons |
| Mint | `#6ed5a8` | Positive / confirm actions |
| Lavender | `#b8a9e8` | Settings, parent screens |
| Sky | `#87ceeb` | Schedule, calm screens |
| Sunshine | `#ffd93d` | Stars, rewards |
| Peach | `#ffc89a` | Card accents |
| Rose | `#ffb3ba` | Soft highlights |

**No neon. No flashing. No sudden pops.** All transitions are smooth (`0.2s–0.4s ease`). `prefers-reduced-motion` disables all animations.

### Typography

- **Display / Headings:** Baloo 2 (rounded, playful, child-friendly)
- **Body / Labels:** Nunito (rounded, excellent readability)
- Font size adjustable: Small (14px) → Medium (16px) → Large (20px) → X-Large (24px)

### Mascot

"Buddy" — a friendly SVG bear with 5 mood states (`happy`, `excited`, `calm`, `thinking`, `love`). Appears on every screen to guide the child. Gentle wiggle animation (disabled when `reduceMotion` is on).

### Accessibility Features

| Feature | Implementation |
|---------|---------------|
| Font size | CSS class on `<html>` (`font-size-small` … `font-size-xlarge`) |
| High contrast | CSS class on `<html>` overriding CSS variables |
| Sound on/off | Checked before every `speechSynthesis.speak()` call |
| Reduce motion | CSS `@media (prefers-reduced-motion)` + JS flag |
| RTL | `document.dir` set on language change |
| Large tap targets | All buttons `min-height: 64px` |

---

## 8. Face Recognition Engine

### How It Works (Production)

1. On app launch, `startCamera()` opens the front camera (`facingMode: 'user'`)
2. After ~2 seconds, `captureEmbedding()` draws a frame to a `64×64` canvas
3. In production: pixel data is passed to **MobileFaceNet** (via `react-native-fast-tflite`) → 128-dim float vector
4. `findMatch()` computes **cosine similarity** against all stored embeddings
5. If similarity ≥ 0.82 → match found; load profile and navigate to Content screen
6. If no match → navigate to Parent Setup

### Web Simulation (Current Build)

The browser build simulates the embedding by sampling pixel values from the captured frame, normalizing to a unit vector, and comparing with cosine similarity. The architecture, data flow, storage format, and comparison logic are **identical** to the production React Native version — only `captureEmbedding()` needs to be swapped for the TFLite call.

### Swapping In the Real Model (React Native)

```typescript
// src/modules/faceEngine.ts  — replace captureEmbedding() with:

import { useTensorflowModel } from 'react-native-fast-tflite';

export async function captureEmbedding(frame: Frame): Promise<number[]> {
  const model = useTensorflowModel(require('../assets/mobilefacenet.tflite'));
  const result = await model.run([frame]);     // returns Float32Array (128 values)
  return Array.from(result[0]);
}
```

Place `mobilefacenet.tflite` in `src/assets/`. All other modules (storage, contentFilter, i18n, SettingsContext) work unchanged.

---

## 9. Content Filtering Logic

Each `ContentItem` has:
- `tag: ContentTag` — must be in the child's `allowedTags` (set by doctor)
- `minAge` / `maxAge` — child's age must fall in this range

`filterContent(child)` returns only items satisfying **both** conditions. The doctor panel toggles tags per child; the content screen re-filters on every render.

---

## 10. Privacy & Safety

- ✅ Face embeddings stored **only in `localStorage` / `AsyncStorage`** — never in a network request
- ✅ No analytics, no tracking, no cloud storage of any biometric data
- ✅ Doctor-approved content filter cannot be bypassed from the child's screen
- ✅ Parent area is hidden (small unobtrusive "🔒 Parent / Doctor Area" link at the bottom of the face-scan screen)
- ✅ No camera frames are ever saved — only the derived embedding vector

---

## 11. Reusability Across Apps

To create a new app (e.g., `autism-learning-app`):

1. Copy these modules unchanged:
   - `src/modules/faceEngine.ts`
   - `src/modules/storage.ts`
   - `src/modules/i18n.ts`
   - `src/modules/tts.ts`
   - `src/context/SettingsContext.tsx`

2. Replace:
   - `src/modules/contentFilter.ts` → new `ALL_CONTENT` array for the new app
   - `src/index.css` → new theme colors
   - `src/components/Mascot.tsx` → new mascot character (optional)

3. Add new languages by adding one entry to the `T` object in `i18n.ts` — everything else picks it up automatically.

---

## 12. File Structure

```
src/
├── types.ts                     # All TypeScript types and constants
├── index.css                    # Tailwind v4 + Google Fonts + CSS variables
├── App.tsx                      # Screen router (state machine)
├── context/
│   └── SettingsContext.tsx      # Global settings (font, contrast, sound, lang)
├── modules/
│   ├── faceEngine.ts            # Camera capture + embedding + cosine match
│   ├── storage.ts               # localStorage CRUD for child profiles
│   ├── contentFilter.ts         # Age + tag filter; ALL_CONTENT catalogue
│   ├── i18n.ts                  # All translations + RTL detection
│   └── tts.ts                   # Web Speech API wrapper
├── components/
│   ├── Mascot.tsx               # SVG bear, 5 mood states
│   └── ScreenWrapper.tsx        # Pastel Memphis background wrapper
└── screens/
    ├── LanguageScreen.tsx       # First-launch language picker
    ├── FaceScanScreen.tsx       # Silent auto-scan with camera
    ├── ContentScreen.tsx        # Child's filtered content home
    ├── ParentSetupScreen.tsx    # Parent hub menu
    ├── EnrollChildScreen.tsx    # 3-step face enrollment + form
    ├── ParentHubScreen.tsx      # Manage all enrolled children
    ├── VisualScheduleScreen.tsx # Tappable daily schedule cards
    ├── AACBoardScreen.tsx       # Picture-to-speech AAC board
    ├── RewardsScreen.tsx        # Stars + badges
    ├── CalmDownScreen.tsx       # Guided breathing animation
    ├── AccessibilityScreen.tsx  # All accessibility settings
    └── DoctorPanelScreen.tsx    # Per-child content tag control
```

---

## 13. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 (web) · React Native + Expo (mobile) |
| Styling | Tailwind CSS v4 · CSS custom properties |
| Face ML | Simulated pixel embedding (web) · MobileFaceNet TFLite (mobile) |
| Storage | localStorage (web) · AsyncStorage (mobile) |
| Voice | Web Speech API (web) · expo-speech (mobile) |
| Fonts | Google Fonts — Baloo 2 + Nunito |
| Camera | getUserMedia (web) · react-native-vision-camera (mobile) |

---

## 14. Next Steps

1. **Client approval** — share this document for content and theme sign-off
2. **Core engine first** — face enrollment + recognition + profile matching (the base for all apps)
3. **Pilot app** — build the first full app (Autism or Speech Therapy) on top of the engine
4. **Subsequent apps** — reuse the engine; swap content + theme only

*Estimated reuse savings per additional app: 60–70% of development time.*
