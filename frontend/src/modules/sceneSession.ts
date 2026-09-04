/**
 * Voice-controlled scene builder — additive scene state.
 *
 * The whole spoken sentence is parsed together (never word-by-word), then merged
 * into a running scene of items. Existing items stay where they are; new items
 * are added; state commands ("open the cat's eyes", "the girl is crying") update
 * an item in place. Nothing is deleted unless the speaker says "start over".
 *
 *   "table"                        -> a table
 *   "book behind the table"        -> table stays, book added behind it
 *   "book to the right of the table" -> book added on the table's right
 *   "open the cat's eyes"          -> the existing cat's eyes open
 *   "a girl is crying"             -> a girl with a crying expression
 *
 * Rendering is done by <SceneStage> from these items — offline, free, no keys.
 */

import { parseSceneGraph, SUBJECTS, REFERENCES, ACTIONS, colorHex } from "./sentenceScene";
import type { SceneSize } from "../types";

// Islamic education assets (respectful — objects, places and prayer poses only;
// never any depiction of Prophets or sacred figures).
export const RELIGION_GLYPHS: Record<string, string> = {
  mosque: "🕌", masjid: "🕌", minaret: "🕌", kaaba: "🕋", "prayer mat": "🟫",
  "prayer rug": "🟫", "prayer beads": "📿", tasbih: "📿", misbaha: "📿",
  crescent: "🌙", "crescent moon": "🌙", "star and crescent": "☪️", lantern: "🏮",
  fanoos: "🏮", dates: "🫓", "date fruit": "🫓", quran: "📗", koran: "📗",
  "holy quran": "📗", "islamic pattern": "🔷", "geometric pattern": "🔷",
  compass: "🧭", "prayer clock": "🕐",
};

// A few everyday objects the shared vocabulary doesn't carry yet.
const EXTRA_GLYPHS: Record<string, string> = {
  laptop: "💻", computer: "💻", tv: "📺", television: "📺", lamp: "💡",
  clock: "🕐", plate: "🍽️", spoon: "🥄", fork: "🍴", pillow: "🛏️",
  mirror: "🪞", plant: "🪴", pot: "🍲", pan: "🍳", guitar: "🎸", drum: "🥁",
  computermouse: "🖱️", keyboard: "⌨️", camera: "📷", clockwall: "🕰️",
};

const GLYPHS: Record<string, string> = { ...REFERENCES, ...SUBJECTS, ...EXTRA_GLYPHS, ...RELIGION_GLYPHS };

const REFERENCE_TYPES = new Set([...Object.keys(REFERENCES), ...Object.keys(EXTRA_GLYPHS)]);

export type Rel = "behind" | "in front of" | "left" | "right" | "above" | "below" | "on" | "inside" | "center";

export interface SceneItem {
  id: string;
  type: string;
  glyph: string;
  color: string | null;
  colorHex: string | null;
  size: SceneSize;
  count: number;
  action: string | null; // running / crying / praying …
  eyes: "open" | "closed" | null;
  relation: Rel | null; // how this item relates to the first item ("under", "behind"…)
  reference: string | null; // the item it is placed relative to
  x: number; // 0..1 centre, fraction of stage width
  y: number; // 0..1 centre, fraction of stage height
  behind: boolean; // drawn before the others (depth)
}

export interface SceneSession {
  seed: number;
  items: SceneItem[];
  anatomy: boolean;
  anatomyParts: string[];
  lastHeard: string;
  note: string | null;
}

// unambiguous — naming one always means the human-body diagram
const ORGAN_WORDS = new Set([
  "kidney", "kidneys", "heart", "liver", "lung", "lungs", "brain", "stomach",
  "intestine", "intestines", "bladder", "skeleton", "bone", "bones", "muscle",
  "muscles", "skull", "spine", "ribs", "rib", "pancreas", "spleen", "torso",
]);
// ambiguous ("open the cat's eyes") — only the body diagram when the scene is
// already about the body, or the phrase says so, or nothing else is on screen
const BODY_WORDS = new Set([
  "head", "hair", "eye", "eyes", "ear", "ears", "nose", "mouth", "neck",
  "shoulder", "shoulders", "chest", "arm", "arms", "elbow", "hand", "hands",
  "finger", "fingers", "tummy", "hip", "hips", "leg", "legs", "knee", "knees",
  "foot", "feet", "toe", "toes", "back",
]);
const ANATOMY = new Set([...ORGAN_WORDS, ...BODY_WORDS]);
// the standard set drawn for "internal organs" / "all the organs"
const ORGAN_SET = ["brain", "lung", "heart", "liver", "stomach", "pancreas", "kidney", "intestine", "bladder"];

const EXPRESSIONS: Record<string, string> = {
  crying: "crying", cry: "crying", sad: "crying", happy: "laughing",
  smiling: "laughing", smile: "laughing", laughing: "laughing", laugh: "laughing",
  sleeping: "sleeping", sleep: "sleeping", angry: "angry", scared: "scared",
};

let counter = 0;
const nextId = () => `it_${Date.now().toString(36)}_${(counter++).toString(36)}`;

export function newSession(): SceneSession {
  return {
    seed: Math.floor(Math.random() * 1_000_000),
    items: [],
    anatomy: false,
    anatomyParts: [],
    lastHeard: "",
    note: null,
  };
}

export function isReset(text: string): boolean {
  return /\b(start over|start again|new (picture|scene)|clear (it|the scene|everything)|reset|wipe)\b/i.test(text);
}

function norm(s: string): string {
  return ` ${s.toLowerCase().replace(/[.,!?;:"']/g, " ").replace(/\s+/g, " ").trim()} `;
}

/** left / right aren't in the shared preposition list — detect them here. */
function detectRel(text: string): Rel | null {
  const t = norm(text);
  if (/\b(to the left|left of|on the left)\b/.test(t)) return "left";
  if (/\b(to the right|right of|on the right)\b/.test(t)) return "right";
  if (/\bin front of\b/.test(t)) return "in front of";
  if (/\bbehind\b/.test(t)) return "behind";
  if (/\b(on top of|on)\b/.test(t)) return "on";
  if (/\b(above|over)\b/.test(t)) return "above";
  if (/\b(below|under|underneath|beneath)\b/.test(t)) return "below";
  if (/\b(inside|in the|into)\b/.test(t)) return "inside";
  if (/\b(between|middle|centre|center)\b/.test(t)) return "center";
  return null;
}

const REL_ALIAS: Record<string, Rel> = {
  under: "below", underneath: "below", beneath: "below", down: "below",
  "on top of": "on", onto: "on", atop: "on", over: "above", up: "above",
  "next to": "left", beside: "left", near: "left", "left of": "left", "right of": "right",
  "in front": "in front of", front: "in front of", ahead: "in front of",
  "back of": "behind", back: "behind", into: "inside", in: "inside",
  middle: "center", centre: "center", between: "center", with: "center",
};
function normRel(r: string | null | undefined): Rel | null {
  if (!r) return null;
  const k = r.toLowerCase().trim();
  if (k in OFFSET) return k as Rel;
  return REL_ALIAS[k] ?? null;
}

const OFFSET: Record<Rel, { dx: number; dy: number; behind: boolean }> = {
  behind: { dx: 0.1, dy: -0.16, behind: true },
  "in front of": { dx: 0, dy: 0.2, behind: false },
  left: { dx: -0.34, dy: 0, behind: false },
  right: { dx: 0.34, dy: 0, behind: false },
  above: { dx: 0, dy: -0.34, behind: false },
  below: { dx: 0, dy: 0.32, behind: false },
  on: { dx: 0, dy: -0.18, behind: false },
  inside: { dx: 0, dy: 0.0, behind: false },
  center: { dx: 0, dy: 0, behind: false },
};

function glyphFor(type: string): string {
  return GLYPHS[norm(type).trim()] ?? GLYPHS[type] ?? "🔹";
}

function makeItem(type: string, opts: Partial<SceneItem> = {}): SceneItem {
  return {
    id: nextId(),
    type,
    glyph: glyphFor(type),
    color: null,
    colorHex: null,
    size: "normal",
    count: 1,
    action: null,
    eyes: null,
    relation: null,
    reference: null,
    x: 0.5,
    y: 0.5,
    behind: false,
    ...opts,
  };
}

function findItem(items: SceneItem[], type: string): SceneItem | undefined {
  return items.find((i) => i.type === type);
}

const headWord = (s: string) => {
  const w = norm(s).trim().split(" ").filter(Boolean);
  return w[w.length - 1] ?? "";
};

/**
 * Resolve a reference to an existing item, tolerating a looser name: "chair"
 * matches an existing "office chair" so a pose command doesn't spawn a second,
 * generic chair.
 */
function findRef(items: SceneItem[], name: string): SceneItem | undefined {
  const n = norm(name).trim();
  if (!n) return undefined;
  return (
    items.find((i) => i.type === n) ||
    items.find((i) => i.type.endsWith(` ${n}`) || n.endsWith(` ${i.type}`)) ||
    items.find((i) => headWord(i.type) === headWord(n))
  );
}

function clamp(n: number): number {
  return Math.max(0.12, Math.min(0.88, n));
}

/**
 * Drop a duplicate that slipped in when one noun was referenced twice in a
 * sentence (e.g. "office chair" created, then a bare "chair" reference). Keeps
 * the more specific / earlier item; merges the other's state into it.
 */
function dedupe(items: SceneItem[]): SceneItem[] {
  const out: SceneItem[] = [];
  for (const it of items) {
    const twin = out.find(
      (o) =>
        o.type === it.type ||
        (headWord(o.type) === headWord(it.type) && Math.abs(o.x - it.x) < 0.18 && Math.abs(o.y - it.y) < 0.18),
    );
    if (twin) {
      // keep the more specific name, fill in any state the twin is missing
      if (it.type.length > twin.type.length) twin.type = it.type;
      twin.glyph = glyphFor(twin.type);
      twin.color ??= it.color;
      twin.colorHex ??= it.colorHex;
      twin.action ??= it.action;
      twin.eyes ??= it.eyes;
      if (it.count > twin.count) twin.count = it.count;
    } else {
      out.push(it);
    }
  }
  return out;
}

/** Merge one full utterance into the scene. */
export function applyUtterance(prev: SceneSession, text: string): SceneSession {
  const s = applyUtteranceRaw(prev, text);
  s.items = dedupe(s.items);
  return s;
}

function applyUtteranceRaw(prev: SceneSession, text: string): SceneSession {
  const s: SceneSession = {
    ...prev,
    items: prev.items.map((i) => ({ ...i })),
    anatomyParts: [...prev.anatomyParts],
    lastHeard: text.trim(),
    note: null,
  };
  const t = norm(text);
  const tokens = t.trim().split(" ").filter(Boolean);
  if (!tokens.length) return s;

  // 1. anatomy: one labelled human body, parts accumulate on it
  const sing = (w: string) => (w.endsWith("ss") || w.endsWith("eas") ? w : w.endsWith("s") ? w.slice(0, -1) : w);
  const wantsBody = /\b(internal body|body part|body parts|human body|the body|the organs?|inside the body|organs of)\b/.test(t);
  const wantsAll = /\b(all (the )?organs|every organ|internal organs)\b/.test(t);
  if (wantsAll) {
    s.anatomy = true;
    for (const o of ORGAN_SET) if (!s.anatomyParts.includes(o)) s.anatomyParts.push(o);
    s.note = `human body: all organs`;
    return s;
  }
  const hasRealItem = s.items.length > 0;
  const named = tokens.filter(
    (w) => ORGAN_WORDS.has(w) || (BODY_WORDS.has(w) && (s.anatomy || wantsBody || !hasRealItem)),
  );
  // don't hijack "open the cat's eyes" style commands
  const isEyeCommand = /\b(open|close|closed|shut)\b/.test(t) && /\beyes?\b/.test(t);
  if ((named.length && !isEyeCommand) || wantsBody) {
    s.anatomy = true;
    for (const o of named.map(sing)) if (!s.anatomyParts.includes(o)) s.anatomyParts.push(o);
    s.note = s.anatomyParts.length ? `human body: ${s.anatomyParts.join(" + ")}` : "human body — name the parts";
    return s;
  }
  if (s.anatomy && /\b(add|also)\b/.test(t) === false && parseSceneGraph(text).subject) {
    s.anatomy = false; // a real subject leaves anatomy mode
    s.anatomyParts = [];
  }

  const g = parseSceneGraph(text);

  // 2. eyes open / close — update an existing (or named) character in place
  const eyesOpen = /\b(open|opened)\b[^.]*\beyes?\b|\beyes?\b[^.]*\b(open|opened)\b/.test(t);
  const eyesClose = /\b(close|closed|shut)\b[^.]*\beyes?\b|\beyes?\b[^.]*\b(close|closed|shut)\b/.test(t);
  if (eyesOpen || eyesClose) {
    const targetType =
      g.subject?.type ||
      tokens.map((w) => w.replace(/'s$/, "")).find((w) => findItem(s.items, w)) ||
      s.items[s.items.length - 1]?.type;
    const target = targetType ? findItem(s.items, targetType) : undefined;
    if (target) {
      target.eyes = eyesOpen ? "open" : "closed";
      s.note = `${target.type}: eyes ${target.eyes}`;
      return s;
    }
    // no such character yet — fall through and create it below
  }

  // 3. expression / action word ("crying", "sleeping", "running")
  const exprWord = tokens.map((w) => EXPRESSIONS[w]).find(Boolean) ?? null;
  const actionWord = g.subject?.action ?? null;

  // 4. relational placement — needs a reference object
  const rel = detectRel(text);
  // the reference noun is whatever is named after the relation word
  const relWords = ["behind", "of", "on", "above", "over", "below", "under", "underneath", "beneath", "inside", "into", "front"];
  let afterRel = tokens;
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (relWords.includes(tokens[i])) {
      afterRel = tokens.slice(i + 1);
      break;
    }
  }
  const refType =
    g.reference?.type ||
    afterRel.find((w) => GLYPHS[w]) ||
    (rel ? tokens.slice(1).find((w) => REFERENCE_TYPES.has(w) || GLYPHS[w]) : undefined) ||
    null;

  if (rel && rel !== "center" && (refType || g.subject)) {
    const subjType = g.subject?.type ?? tokens.find((w) => SUBJECTS[w]) ?? tokens[0];
    const p = place(s, subjType ?? "", rel, refType); // creates the reference if missing
    const ref = refType ? findRef(s.items, refType) : undefined;
    if (subjType) {
      const patch: Partial<SceneItem> = {
        x: p.x,
        y: p.y,
        behind: p.behind,
        color: g.subject?.color ?? null,
        colorHex: colorHex(g.subject?.color ?? null),
        size: g.subject?.size ?? "normal",
        count: g.subject?.count ?? 1,
        action: actionWord,
        eyes: eyesOpen ? "open" : eyesClose ? "closed" : null,
        relation: rel,
        reference: ref?.type ?? refType ?? null,
      };
      const existing = findItem(s.items, subjType);
      if (existing) Object.assign(existing, patch);
      else s.items.push(makeItem(subjType, patch));
      s.note = `${subjType} ${rel} ${ref?.type ?? "centre"}`;
    }
    return s;
  }

  // 5. a plain subject / object — add it, or update it if already there
  const type =
    g.subject?.type ||
    g.reference?.type ||
    tokens.find((w) => GLYPHS[w]) ||
    tokens.filter((w) => w.length > 2)[0];
  if (type && GLYPHS[type]) {
    const color = g.subject?.color ?? null;
    const action = actionWord ?? exprWord ?? null;
    const eyes = eyesOpen ? "open" : eyesClose ? "closed" : null;
    const existing = findItem(s.items, type);
    if (existing) {
      // update in place — only change what was actually mentioned
      if (color) {
        existing.color = color;
        existing.colorHex = colorHex(color);
      }
      if (g.subject?.size && g.subject.size !== "normal") existing.size = g.subject.size;
      if (g.subject && g.subject.count > 1) existing.count = g.subject.count;
      if (action) existing.action = action;
      if (eyes) existing.eyes = eyes;
      s.note = `updated ${type}`;
    } else {
      const patch: Partial<SceneItem> = {
        color,
        colorHex: colorHex(color),
        size: g.subject?.size ?? "normal",
        count: g.subject?.count ?? 1,
        action,
        eyes,
      };
      const slot = s.items.length;
      s.items.push(
        makeItem(type, {
          ...patch,
          x: clamp(0.5 + (slot % 2 === 0 ? -0.16 : 0.16) * Math.ceil(slot / 2)),
          y: clamp(0.5 + (slot > 1 ? 0.12 : 0)),
        }),
      );
      s.note = `added ${type}`;
    }
    return s;
  }

  // 6. expression only, no subject named — apply to the last character
  if ((exprWord || eyesOpen || eyesClose) && s.items.length) {
    const last = s.items[s.items.length - 1];
    if (exprWord) last.action = exprWord;
    if (eyesOpen) last.eyes = "open";
    if (eyesClose) last.eyes = "closed";
    s.note = `${last.type}: ${exprWord ?? `eyes ${last.eyes}`}`;
    return s;
  }

  s.note = "not understood — try naming an object";
  return s;
}

// --- LLM "agent" operations -----------------------------------------
//
// When a Groq / OpenAI key is set, sceneAgent.ts turns free speech into these
// operations; applyOps() applies them to the scene. Same placement maths as the
// rule-based path, so both routes behave identically.

export type SceneOp =
  | { op: "reset" }
  | {
      op: "add";
      type: string;
      color?: string | null;
      count?: number;
      size?: SceneSize;
      action?: string | null;
      eyes?: "open" | "closed" | null;
      relation?: Rel | string | null;
      reference?: string | null;
    }
  | {
      op: "update";
      type: string;
      color?: string | null;
      count?: number;
      size?: SceneSize;
      action?: string | null;
      eyes?: "open" | "closed" | null;
    }
  | { op: "move"; type: string; relation: Rel | string; reference?: string | null }
  | { op: "remove"; type: string };

function place(s: SceneSession, type: string, relationRaw: Rel | string | null | undefined, reference: string | null | undefined) {
  const relation = normRel(relationRaw as string);
  if (!relation || relation === "center") return { x: clamp(0.5), y: clamp(0.5), behind: false };
  // a fresh reference sits low for "above/on" and high for "below/under" so the
  // subject has room; sideways relations keep it centred
  const refY = relation === "above" || relation === "on" ? 0.68 : relation === "below" ? 0.34 : 0.52;
  let ref = reference ? findRef(s.items, reference) : undefined;
  if (!ref && reference) {
    ref = makeItem(norm(reference).trim(), { x: 0.5, y: refY });
    s.items.push(ref);
  }
  const anchor = ref ?? { x: 0.5, y: refY };
  const off = OFFSET[relation];
  return { x: clamp(anchor.x + off.dx), y: clamp(anchor.y + off.dy), behind: off.behind };
}

export function applyOps(prev: SceneSession, ops: SceneOp[]): SceneSession {
  const s = applyOpsRaw(prev, ops);
  s.items = dedupe(s.items);
  return s;
}

function applyOpsRaw(prev: SceneSession, ops: SceneOp[]): SceneSession {
  let s: SceneSession = {
    ...prev,
    items: prev.items.map((i) => ({ ...i })),
    anatomyParts: [...prev.anatomyParts],
    note: null,
  };
  const done: string[] = [];
  for (const rawAny of ops) {
    if (!rawAny || typeof rawAny !== "object") continue;
    // tolerate the aliases small models produce
    const r = rawAny as Record<string, unknown>;
    const opName = String(r.op ?? r.action ?? r.operation ?? "").toLowerCase();
    const kind = /reset|clear/.test(opName)
      ? "reset"
      : /remov|delet|take/.test(opName)
        ? "remove"
        : /mov/.test(opName)
          ? "move"
          : /updat|modif|set|change/.test(opName)
            ? "update"
            : "add";
    const op = {
      ...r,
      op: kind,
      type: r.type ?? r.target ?? r.name ?? r.object ?? r.subject,
    } as SceneOp;
    if (op.op === "reset") {
      s = newSession();
      done.push("cleared");
      continue;
    }
    const type = "type" in op && op.type ? norm(op.type).trim() : "";
    if (!type) continue;

    // "organs" / "internal organs" / "body parts" with no specific part named
    if (/^(all |the )?(internal |human )?(organs?|body parts?|anatomy)$/.test(type) && op.op !== "remove") {
      s.anatomy = true;
      for (const o of ORGAN_SET) if (!s.anatomyParts.includes(o)) s.anatomyParts.push(o);
      done.push("body: all organs");
      continue;
    }

    // body-part words -> the labelled human body, parts accumulate on one figure
    const sing = (w: string) => (w.endsWith("ss") || w.endsWith("eas") ? w : w.endsWith("s") ? w.slice(0, -1) : w);
    const words = type.split(" ");
    const bodyOk = s.anatomy || !s.items.length || /\b(organ|body part|body parts|human|internal body)\b/.test(type);
    const part = words.find((w) => ORGAN_WORDS.has(w)) || (bodyOk ? words.find((w) => BODY_WORDS.has(w)) : undefined);
    if (part) {
      const p = sing(part);
      if (op.op === "remove") s.anatomyParts = s.anatomyParts.filter((x) => x !== p);
      else {
        s.anatomy = true;
        if (!s.anatomyParts.includes(p)) s.anatomyParts.push(p);
      }
      done.push(`body: ${s.anatomyParts.join(" + ")}`);
      continue;
    }
    // a real object leaves anatomy mode
    if (s.anatomy && op.op === "add") {
      s.anatomy = false;
      s.anatomyParts = [];
    }

    if (op.op === "remove") {
      s.items = s.items.filter((i) => i.type !== type);
      done.push(`removed ${type}`);
      continue;
    }
    if (op.op === "move") {
      const it = findItem(s.items, type);
      if (it) {
        const p = place(s, type, op.relation, op.reference);
        it.x = p.x;
        it.y = p.y;
        it.behind = p.behind;
        it.relation = normRel(op.relation);
        it.reference = op.reference ? norm(op.reference).trim() : null;
        done.push(`moved ${type}`);
      }
      continue;
    }

    const patch: Partial<SceneItem> = {};
    if ("color" in op && op.color) {
      patch.color = op.color;
      patch.colorHex = colorHex(op.color);
    }
    if ("count" in op && op.count) patch.count = Math.max(1, Math.min(5, op.count));
    if ("size" in op && op.size) patch.size = op.size;
    if ("action" in op && op.action) patch.action = op.action.replace(/^is /, "");
    if ("eyes" in op && (op.eyes === "open" || op.eyes === "closed")) patch.eyes = op.eyes;
    const rel = "relation" in op ? normRel(op.relation as string) : null;
    const ref = rel && "reference" in op && op.reference ? norm(op.reference).trim() : null;
    if (rel) {
      patch.relation = rel;
      patch.reference = ref;
    }

    const existing = findItem(s.items, type);
    if (op.op === "update" || existing) {
      if (existing) {
        Object.assign(existing, patch);
        if (rel) {
          const p = place(s, type, rel, ref);
          existing.x = p.x;
          existing.y = p.y;
          existing.behind = p.behind;
        }
        done.push(`updated ${type}`);
      }
      continue;
    }

    // add
    const p = rel
      ? place(s, type, rel, ref)
      : { x: clamp(0.5 + (s.items.length % 2 === 0 ? -0.16 : 0.16) * Math.ceil(s.items.length / 2)), y: clamp(0.5 + (s.items.length > 1 ? 0.12 : 0)), behind: false };
    s.items.push(makeItem(type, { ...patch, ...p }));
    done.push(`added ${type}`);
  }
  s.note = done.join(" · ") || null;
  return s;
}

/** Build a text prompt for the optional AI drawing. */
export function sessionPrompt(s: SceneSession): string {
  if (s.anatomy) {
    return `a clear labelled anatomical diagram of the human ${s.anatomyParts.join(" and ")}, medical textbook illustration, clean labels`;
  }
  if (!s.items.length) return "an empty white page";
  const main = s.items[0];
  const phrase = (i: SceneItem, first: boolean): string => {
    const noun = [
      i.count > 1 ? `${i.count}` : first ? "a" : "a",
      i.color,
      i.size !== "normal" ? i.size : "",
      i.type,
    ]
      .filter(Boolean)
      .join(" ");
    const st: string[] = [];
    if (i.action) st.push(i.action.endsWith("ing") ? i.action : `${i.action}`);
    if (i.eyes) st.push(`with its eyes ${i.eyes}`);
    if (!first) {
      const near = i.behind ? "behind" : "next to";
      st.push(`positioned ${near} the ${main.type}`);
    }
    return st.length ? `${noun} ${st.join(", ")}` : noun;
  };
  const desc = s.items.map((i, idx) => phrase(i, idx === 0)).join("; ");
  return `${desc}. A single wide scene, all objects visible together, soft flat children's book illustration, warm friendly colours, bold clean outlines, plain solid white background, no text, no labels`;
}

/**
 * The phrase to look up a library picture for one item. An action or expression
 * comes first so the pictogram shows it ("crying girl" -> the crying pictogram,
 * not a plain girl). Also used as the cache key, so the picture updates when the
 * state changes.
 */
export function searchPhrase(i: SceneItem): string {
  // With an action, show the real AAC verb pictogram ("crying", "running") — a
  // person doing that, no emoji. Otherwise the object itself, keeping any
  // compound noun ("office chair") so variants resolve.
  return i.action ? i.action : i.type;
}

export function sessionChips(s: SceneSession): string[] {
  if (s.anatomy) return ["human", ...s.anatomyParts, "labelled"];
  const out: string[] = [];
  for (const i of s.items) {
    let label = i.type;
    if (i.color) label = `${i.color} ${label}`;
    if (i.count > 1) label = `${i.count} ${label}`;
    if (i.eyes) label += ` · eyes ${i.eyes}`;
    if (i.action && ACTIONS[i.action]) label += ` · ${i.action}`;
    out.push(label);
  }
  return out;
}
