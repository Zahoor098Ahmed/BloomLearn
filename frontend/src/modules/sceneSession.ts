/**
 * Conversational scene builder.
 *
 * You keep talking and the picture keeps updating:
 *
 *   "blue cat"        -> a blue cat
 *   "open eyes"       -> the same blue cat, eyes open
 *   "close eyes"      -> the same blue cat, eyes closed
 *   "red"             -> now a red cat, still eyes closed
 *   "kidney"          -> a labelled human kidney (anatomy mode)
 *   "heart"           -> kidney AND heart, one labelled diagram
 *   "eyes"            -> kidney, heart AND eyes
 *
 * Each utterance is merged into a running state; the seed stays fixed for the
 * session so it is the same character / same diagram while details change.
 * The prompt is regenerated and drawn by the free Pollinations engine.
 */

export interface SceneSession {
  seed: number;
  subjects: string[]; // ["cat"] normally; anatomy accumulates ["kidney","heart"]
  color: string | null;
  pose: string | null;
  eyes: string | null;
  mouth: string | null;
  extras: string[];
  anatomy: boolean;
  lastHeard: string;
}

const COLORS = [
  "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown",
  "black", "white", "grey", "gray", "gold", "silver",
];

const POSES: Record<string, string> = {
  sit: "sitting", sitting: "sitting", stand: "standing", standing: "standing",
  run: "running", running: "running", walk: "walking", walking: "walking",
  jump: "jumping", jumping: "jumping", fly: "flying", flying: "flying",
  sleep: "sleeping", sleeping: "sleeping", lie: "lying down", lying: "lying down",
  dance: "dancing", dancing: "dancing", swim: "swimming", swimming: "swimming",
  eat: "eating", eating: "eating", drink: "drinking", drinking: "drinking",
};

const ANATOMY = new Set([
  "kidney", "kidneys", "heart", "liver", "lung", "lungs", "brain", "stomach",
  "intestine", "intestines", "bladder", "skeleton", "bone", "bones", "muscle",
  "muscles", "skull", "spine", "ribs", "rib", "pancreas", "spleen", "artery",
  "vein", "nerve", "cell", "tooth", "teeth", "ear", "ears", "eye", "eyes",
  "tongue", "throat", "womb", "uterus",
]);

const STOP = new Set([
  "the", "a", "an", "is", "are", "was", "were", "to", "of", "and", "with",
  "please", "now", "make", "it", "its", "his", "her", "him", "she", "he",
  "that", "this", "them", "then", "show", "me", "i", "want", "can", "you",
]);

function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
}

export function newSession(): SceneSession {
  return {
    seed: Math.floor(Math.random() * 1_000_000),
    subjects: [],
    color: null,
    pose: null,
    eyes: null,
    mouth: null,
    extras: [],
    anatomy: false,
    lastHeard: "",
  };
}

/** Is the whole utterance asking to start again? */
export function isReset(text: string): boolean {
  return /\b(start over|start again|new picture|clear|reset|forget)\b/i.test(text);
}

/** Merge one spoken/typed phrase into the running scene. */
export function applyUtterance(prev: SceneSession, text: string): SceneSession {
  const s: SceneSession = { ...prev, extras: [...prev.extras], subjects: [...prev.subjects], lastHeard: text.trim() };
  const t = tokens(text);
  if (!t.length) return s;

  const has = (...w: string[]) => w.some((x) => t.includes(x));
  const add = has("add", "also", "another", "put", "give") || (t[0] === "and");

  // eyes open / closed  (works for a character or, in anatomy mode, is an organ)
  if (has("eyes", "eye")) {
    if (has("open", "opened")) s.eyes = "eyes wide open";
    else if (has("close", "closed", "shut", "closing")) s.eyes = "eyes closed";
  }
  if (has("wink", "winking")) s.eyes = "winking";

  // mouth / expression
  if (has("smile", "smiling", "happy")) s.mouth = "a big happy smile";
  else if (has("sad", "crying", "cry")) s.mouth = "a sad face";
  else if (has("angry", "cross")) s.mouth = "an angry face";
  else if (has("surprised", "shocked")) s.mouth = "a surprised face, mouth open";
  else if (has("tongue")) s.mouth = "tongue sticking out";

  // colour
  for (const c of COLORS) if (t.includes(c)) s.color = c === "gray" ? "grey" : c;

  // pose
  for (const k of Object.keys(POSES)) if (t.includes(k)) s.pose = POSES[k];

  // anatomy: any organ word switches to a labelled diagram and accumulates
  const organs = t.filter((w) => ANATOMY.has(w) && !["eye", "eyes"].includes(w));
  const wantsEyeOrgan = (has("eyes", "eye") && (s.anatomy || prev.subjects.some((x) => ANATOMY.has(x)))) && !has("open", "close", "closed", "shut", "opening", "closing");
  if (organs.length || wantsEyeOrgan) {
    s.anatomy = true;
    s.eyes = null;
    s.mouth = null;
    const parts = [...organs, ...(wantsEyeOrgan ? ["eyes"] : [])].map((w) =>
      w === "kidneys" ? "kidney" : w === "lungs" ? "lung" : w === "bones" ? "bone" : w === "muscles" ? "muscle" : w,
    );
    for (const p of parts) if (!s.subjects.includes(p)) s.subjects.push(p);
    return s;
  }

  // a plain subject noun (skip words we already consumed)
  const consumed = new Set([
    ...COLORS, "eyes", "eye", "open", "opened", "close", "closed", "shut", "closing",
    "smile", "smiling", "happy", "sad", "crying", "cry", "angry", "cross",
    "surprised", "shocked", "tongue", "wink", "winking", "add", "also", "another",
    "put", "give", ...Object.keys(POSES),
  ]);
  const nouns = t.filter((w) => !STOP.has(w) && !consumed.has(w) && w.length > 1);
  if (nouns.length) {
    if (s.anatomy && !add) {
      // leaving anatomy mode for a real subject
      s.anatomy = false;
      s.subjects = [nouns[0]];
    } else if (add) {
      for (const n of nouns) if (!s.subjects.includes(n)) s.subjects.push(n);
    } else {
      s.subjects = [nouns[0]];
    }
  }

  return s;
}

/** Build the image prompt for the current scene. */
export function sessionPrompt(s: SceneSession): string {
  if (s.anatomy) {
    const list = s.subjects.length ? s.subjects.join(" and the human ") : "body";
    return `a clear labelled anatomical diagram of the human ${list}, medical textbook illustration, accurate, clean labels with arrows`;
  }
  const subj = s.subjects[0] || "cat";
  const bits: string[] = [];
  bits.push(s.color ? `a ${s.color} ${subj}, the ${subj} is entirely ${s.color} coloured` : `a ${subj}`);
  if (s.pose) bits.push(s.pose);
  if (s.eyes) bits.push(`with ${s.eyes}`);
  if (s.mouth) bits.push(`with ${s.mouth}`);
  for (const e of s.extras) bits.push(e);
  if (s.subjects.length > 1) bits.push(`together with a ${s.subjects.slice(1).join(" and a ")}`);
  return bits.join(", ");
}

/** Short chips describing what the builder currently understands. */
export function sessionChips(s: SceneSession): string[] {
  if (s.anatomy) return ["human", ...s.subjects, "labelled diagram"];
  const c: string[] = [];
  if (s.color) c.push(s.color);
  if (s.subjects[0]) c.push(s.subjects[0]);
  if (s.subjects.length > 1) c.push(...s.subjects.slice(1).map((x) => `+ ${x}`));
  if (s.pose) c.push(s.pose);
  if (s.eyes) c.push(s.eyes);
  if (s.mouth) c.push(s.mouth);
  return c;
}
