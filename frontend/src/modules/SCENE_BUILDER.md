# Voice-Controlled Scene Builder

Turn **"Keep-talking mode"** on in Picture Talk. You speak (or type) one thing at
a time; the whole sentence is parsed together and merged into a running scene.
Existing objects stay where they are — the scene keeps building.

Everything here is **offline and free** — no API keys. `<SceneStage>` renders the
scene from `View`/`Text` (open-source emoji glyphs). An optional **"Draw with
AI"** button turns the built scene into one illustration, but only when a free
Pollinations token is set (`EXPO_PUBLIC_POLLINATIONS_TOKEN`).

## Files

| File | Role |
|---|---|
| `sceneSession.ts` | Scene state + `applyUtterance()` — the parser/merger |
| `sentenceScene.ts` | Shared rule-based sentence parser (`parseSceneGraph`) reused for subject / colour / size / count / action / preposition |
| `../components/SceneStage.tsx` | Renders the additive scene, with depth ordering |
| `sceneSession.test.ts` | Behaviour tests — `npm run test:scene` |

## What each command does

| You say | What happens |
|---|---|
| `table` | A table is added. |
| `cat` | A cat is added (existing objects stay). |
| `book behind the table` | Table keeps its place; the book is added **behind** it (drawn first, slightly faded, higher up). |
| `book to the right of the table` | Book added on the table's **right** (`left of`, `to the left`, `on the right` all work). |
| `cat on the table` | Cat placed on top of the table. |
| `bird above the house` | Bird placed well above the house. |
| `ball under the chair` | Ball placed below the chair (`under`, `below`, `beneath`). |
| `open the cat's eyes` | The **existing** cat's `eyes` become `open` — no new object. |
| `close the cat's eyes` | Same cat, `eyes` → `closed`. |
| `a girl is crying` | A girl is added with a `crying` expression (subject + emotion both parsed). |
| `make it red` / `blue cat` | Sets the colour on the (new or existing) subject. |
| `two apples` | Count is parsed; the item renders repeated. |
| `mosque`, `prayer mat`, `Koran`, `crescent moon`, `prayer beads`, `lantern` | Islamic-education assets — places, objects and acts of worship only. No depiction of Prophets or sacred figures. |
| `kidney` → `add heart` → `add lungs` | Switches to a labelled human-anatomy diagram; parts accumulate. |
| `start over` / `new scene` / `reset` | Clears the scene. |

## Supported spatial relations

`behind`, `in front of`, `left` / `to the left of`, `right` / `to the right of`,
`above` / `over`, `below` / `under` / `underneath`, `on` / `on top of`,
`inside`, `between` / `centre`.

## Data model

```ts
SceneItem {
  id, type, glyph,
  color, colorHex,
  size: 'tiny'|'small'|'normal'|'big'|'huge',
  count,
  action: 'running' | 'crying' | 'praying' | ... | null,
  eyes: 'open' | 'closed' | null,
  x, y,          // 0..1 centre, fraction of the stage
  behind,        // drawn before the others (depth)
}

SceneSession { seed, items: SceneItem[], anatomy, anatomyParts[], lastHeard, note }
```

`applyUtterance(session, text)` returns a **new** session — it never mutates the
old one and never removes an item unless `isReset(text)` matched.

### Parse order inside `applyUtterance`

1. **Anatomy** words (`kidney`, `heart`, …) → labelled-diagram mode, parts accumulate.
2. **Eyes open / close** → update the named or last character's `eyes`.
3. **Expression / action** (`crying`, `sleeping`, `running`).
4. **Relation + reference** → make sure the reference exists (keep its position),
   then add/patch the subject at the offset for that relation.
5. **Plain subject / object** → add it, or patch it if that type already exists.
6. **Expression only, no subject** → apply to the last character.

## Speech-to-text

Live voice uses the browser **Web Speech API** (`voice.ts`) — only the **final**
transcript drives a command; interim results are shown but not merged until they
settle (600 ms debounce). On native builds without on-device STT the keyboard
microphone is used instead.

## Tests

```
npm run test:scene
```

Covers: single object, relational placement (for several object pairs), state
command on an existing object, descriptive sentence → scene, additive building,
the "no dropped words" bug, and the Islamic-asset glyphs.
