import type { SceneGraph, SceneEntity, SceneSize, SentenceScene } from "../types";

/**
 * On-device sentence analysis for the Hybrid Smart Sentence-to-Scene engine.
 *
 * Rule-based, offline, instant. It extracts a scene graph — a subject entity
 * (thing + colour + size + count + action), a spatial relation, and a
 * reference entity — plus a confidence score. The Picture Talk screen renders
 * the graph instantly with layered SVG; when confidence is low or the teacher
 * asks, a free AI image (Pollinations) fills the gap.
 */

// --- vocabulary --------------------------------------------------------

export const COLORS = ["black", "white", "brown", "grey", "gray", "red", "orange", "yellow", "green", "blue", "purple", "pink", "golden", "silver"];

const COLOR_HEX: Record<string, string> = {
  black: "#3a3a3a", white: "#f4f4f2", brown: "#8a5a2b", grey: "#9aa0a6", gray: "#9aa0a6",
  red: "#d64545", orange: "#e08a3c", yellow: "#e9c33c", green: "#4f9d5d", blue: "#4a7fe6",
  purple: "#8a6bc9", pink: "#e58ab0", golden: "#d9a441", silver: "#b9bfc6",
};

export const PREPOSITIONS = [
  "in front of", "on top of", "next to", "close to", "far from",
  "under", "underneath", "below", "beneath", "on", "above", "over",
  "behind", "beside", "near", "inside", "in", "between",
];

const PREP_CANON: Record<string, string> = {
  under: "under", underneath: "under", below: "under", beneath: "under",
  on: "on", "on top of": "on", above: "above", over: "above",
  beside: "beside", "next to": "beside", near: "beside", "close to": "beside", "far from": "beside",
  behind: "behind", "in front of": "in front of",
  inside: "inside", in: "inside", between: "between",
};

/** Things that can be the subject (moved / coloured / counted). */
export const SUBJECTS: Record<string, string> = {
  cat: "🐱", kitten: "🐱", dog: "🐶", puppy: "🐶", bird: "🐦", fish: "🐟", rabbit: "🐰", bunny: "🐰",
  frog: "🐸", bear: "🐻", lion: "🦁", tiger: "🐯", elephant: "🐘", monkey: "🐵", horse: "🐴", cow: "🐮",
  pig: "🐷", sheep: "🐑", duck: "🦆", chicken: "🐔", mouse: "🐭", snake: "🐍", turtle: "🐢", butterfly: "🦋",
  bee: "🐝", spider: "🕷️", ant: "🐜", owl: "🦉", penguin: "🐧",
  boy: "👦", girl: "👧", man: "👨", woman: "👩", baby: "👶", mother: "👩", mom: "👩", father: "👨", dad: "👨",
  teacher: "🧑‍🏫", doctor: "🧑‍⚕️", child: "🧒",
  ball: "⚽", cup: "🥤", book: "📖", pencil: "✏️", bag: "🎒", box: "📦", apple: "🍎", banana: "🍌",
  orange: "🍊", cake: "🍰", bottle: "🍼", key: "🔑", phone: "📱", hat: "🧢", shoe: "👟", flower: "🌼",
  leaf: "🍃", star: "⭐", moon: "🌙", sun: "☀️", cloud: "☁️", kite: "🪁", umbrella: "☂️", balloon: "🎈",
  car: "🚗", bus: "🚌", bike: "🚲", bicycle: "🚲", train: "🚆", boat: "⛵", plane: "✈️", rocket: "🚀",
};

/** Things a subject is positioned relative to. */
export const REFERENCES: Record<string, string> = {
  table: "🪑", desk: "🪑", chair: "🪑", stool: "🪑", bed: "🛏️", sofa: "🛋️", couch: "🛋️",
  box: "📦", basket: "🧺", bucket: "🪣", bowl: "🥣", cup: "🥤", jar: "🫙", bag: "🎒",
  tree: "🌳", bush: "🌳", plant: "🪴", flower: "🌼", rock: "🪨", hill: "⛰️", mountain: "⛰️",
  house: "🏠", school: "🏫", door: "🚪", window: "🪟", wall: "🧱", fence: "🚧", roof: "🏠",
  car: "🚗", bus: "🚌", boat: "⛵", road: "🛣️", bridge: "🌉", mat: "🟫", rug: "🟫", blanket: "🟫",
  shelf: "🗄️", cupboard: "🗄️", fridge: "🧊", ladder: "🪜", umbrella: "☂️", cave: "🕳️",
};

const SIZE_WORDS: Record<string, SceneSize> = {
  tiny: "tiny", "very small": "tiny", little: "small", small: "small",
  big: "big", large: "big", "very big": "huge", huge: "huge", giant: "huge", enormous: "huge",
};

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, several: 3, many: 5, some: 3, few: 2,
};

export const ACTIONS: Record<string, string> = {
  running: "🏃", walking: "🚶", sitting: "🪑", standing: "🧍", sleeping: "😴", eating: "🍽️",
  drinking: "🥤", jumping: "🤸", flying: "🕊️", swimming: "🏊", reading: "📖", playing: "🎈",
  crying: "😢", laughing: "😄", dancing: "💃", climbing: "🧗", hiding: "🫣", looking: "👀",
  writing: "✍️", drawing: "🎨", painting: "🖌️", singing: "🎤", listening: "👂", speaking: "🗣️",
  talking: "💬", shouting: "📢", washing: "🧼", brushing: "🪥", cleaning: "🧹", cooking: "🍳",
  helping: "🤝", hugging: "🫂", smiling: "😊", praying: "🤲", studying: "📚", learning: "💡",
  driving: "🚗", riding: "🚲", catching: "⚾", kicking: "⚽", clapping: "👏", waving: "👋",
  thinking: "💭", waiting: "⏳", cutting: "✂️", opening: "🚪", closing: "🔒",
};

export const ADVERBS: Record<string, string> = {
  quickly: "⚡", fast: "🏎️", rapidly: "⚡", swiftly: "💨", jaldi: "⚡",
  slowly: "🐢", slow: "🐢", aahista: "🐢",
  happily: "😄", joyfully: "🥳", cheerfully: "😊", khushi: "😄", khush: "😄",
  sadly: "😢", sorrowfully: "😭", udaas: "😢",
  loudly: "📢", noisily: "🔊", zor: "📢",
  quietly: "🤫", silently: "🔇", softly: "🪶", gently: "🤲",
  carefully: "👀", cautiously: "⚠️", dehan: "👀",
  wildly: "🌪️", bravely: "🦁", sweetly: "🍯", beautifully: "✨",
  calmly: "😌", peacefully: "🕊️", easily: "🟢", asani: "🟢",
  well: "👍", badly: "👎", together: "🧑‍🤝‍🧑", alone: "🧍", sath: "🧑‍🤝‍🧑", akela: "🧍",
  outside: "🌳", inside: "🏠", up: "⬆️", down: "⬇️", bahar: "🌳", andar: "🏠", upar: "⬆️", neeche: "⬇️",
  high: "🌤️", low: "🌱", far: "🔭", near: "📍", door: "🔭", qareeb: "📍",
  always: "🔄", never: "🚫", again: "🔁", now: "⏱️", soon: "⏳", abhi: "⏱️",
  angrily: "😠", gusse: "😠", excitedly: "🤩", josh: "🤩",
  nicely: "😊", politely: "🙏", brightly: "🌟", strongly: "💪", taqat: "💪",
  safely: "🛡️", warmly: "☀️", proudly: "🦚", shyly: "🙈",
  early: "🌅", late: "🌙", here: "📍", there: "👉", yahan: "📍", wahan: "👉",
  hard: "🔨", tightly: "🫂", freely: "🕊️",
  please: "🙏", thanks: "🤝", "thank you": "🤝", sorry: "🙇", "excuse me": "🙋",
  shukriya: "🤝", madad: "🤝", maaf: "🙇",
};

export const EXTRA_ABWAAB: Record<string, string> = {
  // School & Classroom
  classroom: "🏫", student: "🧑‍🎓", blackboard: "📋", whiteboard: "📋",
  crayon: "🖍️", crayons: "🖍️", pen: "🖊️", pens: "🖊️", eraser: "🧽",
  sharpener: "✏️", ruler: "📏", scissors: "✂️", glue: "🧴", backpack: "🎒",
  notebook: "📓", paper: "📄", bookshelf: "📚", cafeteria: "🍽️",
  recess: "🛝", slide: "🛝", swing: "🪵", blocks: "🧱", "fire drill": "🚨",
  clock: "⏰", bell: "🔔", crafts: "✂️", "pencil sharpener": "✏️",
  "colored pencils": "🎨", "coloured pencils": "🎨",

  // Food & Kitchen
  water: "💧", milk: "🥛", juice: "🧃", tea: "🍵", apple: "🍎", banana: "🍌",
  orange: "🍊", bread: "🍞", cookie: "🍪", biscuit: "🍪", rice: "🍚",
  chicken: "🍗", meat: "🥩", egg: "🥚", pizza: "🍕", sandwich: "🥪",
  burger: "🍔", fries: "🍟", salad: "🥗", soup: "🥣", cake: "🍰",
  chocolate: "🍫", "ice cream": "🍦", candy: "🍬", fruit: "🍓",
  vegetable: "🥕", carrot: "🥕", potato: "🥔", tomato: "🍅", cheese: "🧀",
  plate: "🍽️", cup: "🥤", spoon: "🥄", fork: "🍴", glass: "🥛",

  // Emotions & Feelings
  happy: "😀", sad: "😢", angry: "😠", scared: "😨", excited: "🤩",
  tired: "😴", sleepy: "🥱", sick: "🤢", hurt: "🤕", calm: "😌",
  proud: "😎", silly: "🤪", frustrated: "😤", loved: "🥰",
  surprised: "😲", confused: "🤔", shy: "🙈", nervous: "😰", bored: "😑",

  // Home & Daily
  bed: "🛏️", table: "🪑", sofa: "🛋️", couch: "🛋️", lamp: "💡",
  light: "💡", door: "🚪", window: "🪟", mirror: "🪞", pillow: "🛏️",
  blanket: "🟫", tv: "📺", computer: "💻", laptop: "💻", phone: "📱",
  fridge: "🧊", kitchen: "🍳", bathroom: "🛁", toilet: "🚽", shower: "🚿",

  // Nature & Weather
  sun: "☀️", moon: "🌙", star: "⭐", cloud: "☁️", rain: "🌧️",
  snow: "❄️", rainbow: "🌈", tree: "🌳", flower: "🌸", grass: "🌱",
  river: "🌊", mountain: "⛰️", sea: "🌊", ocean: "🌊", forest: "🌲",

  // Clothes & Gear
  shirt: "👕", pants: "👖", dress: "👗", jacket: "🧥", coat: "🧥",
  shoes: "👟", socks: "🧦", hat: "🧢", cap: "🧢", glasses: "👓", watch: "⌚",

  // Animals
  horse: "🐴", cow: "🐮", sheep: "🐑", goat: "🐐", giraffe: "🦒",
  zebra: "🦓", camel: "🐪", dolphin: "🐬", whale: "🐋",

  // Adaab & Manners
  please: "🙏", thanks: "🤝", "thank you": "🤝", sorry: "🙇",
  hello: "👋", hi: "👋", goodbye: "👋", bye: "👋", salam: "🤝",
};

export const ALL_VOCAB_GLYPHS: Record<string, string> = {
  ...REFERENCES,
  ...SUBJECTS,
  ...ACTIONS,
  ...ADVERBS,
  ...EXTRA_ABWAAB,
};

export function findWordEmoji(text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase().trim();
  if (ALL_VOCAB_GLYPHS[lower]) return ALL_VOCAB_GLYPHS[lower];
  const words = lower.split(/[\s,·\-_]+/);
  for (const w of words) {
    if (ALL_VOCAB_GLYPHS[w]) return ALL_VOCAB_GLYPHS[w];
  }
  return null;
}

const ACTION_WORDS = Object.keys(ACTIONS).concat(
  ["run", "walk", "sit", "stand", "sleep", "eat", "drink", "jump", "fly", "swim", "read", "play", "cry", "laugh", "dance", "climb", "hide", "look", "write", "draw", "paint", "sing", "listen", "talk", "wash", "cook", "smile", "pray", "clean"],
);
const ACTION_STEM: Record<string, string> = {
  run: "running", walk: "walking", sit: "sitting", stand: "standing", sleep: "sleeping", eat: "eating",
  drink: "drinking", jump: "jumping", fly: "flying", swim: "swimming", read: "reading", play: "playing",
  cry: "crying", laugh: "laughing", dance: "dancing", climb: "climbing", hide: "hiding", look: "looking",
  write: "writing", draw: "drawing", paint: "painting", sing: "singing", listen: "listening", talk: "talking",
  wash: "washing", cook: "cooking", smile: "smiling", pray: "praying", clean: "cleaning",
};

// --- science-concept presets -----------------------------------------

export interface ConceptPreset {
  key: string;
  match: RegExp;
  title: string;
  caption: string;
  render: { kind: "plant" | "animals"; seeds?: boolean; flowers?: boolean; backbone?: boolean; examples?: string[] };
}

export const CONCEPTS: ConceptPreset[] = [
  {
    key: "flowering-plants",
    match: /flowering plants?.*(have|with).*(seed|flower)/i,
    title: "Flowering plants have seeds and flowers",
    caption: "Both the flower and the seeds are clearly, separately visible.",
    render: { kind: "plant", seeds: true, flowers: true },
  },
  {
    key: "non-flowering-plants",
    match: /non[- ]?flowering plants?.*(do not|don't|no).*(seed|flower)/i,
    title: "Non-flowering plants do not have seeds and flowers",
    caption: "A green plant (fern / moss style) with no flower and no seeds shown.",
    render: { kind: "plant", seeds: false, flowers: false },
  },
  {
    key: "vertebrates",
    match: /vertebrates?.*(have|with).*(backbone|spine)/i,
    title: "Vertebrates have a backbone",
    caption: "Example animals shown with the backbone highlighted.",
    render: { kind: "animals", backbone: true, examples: ["🐕", "🐈", "🐟", "🦅"] },
  },
  {
    key: "invertebrates",
    match: /invertebrates?.*(do not|don't|no).*(backbone|spine)/i,
    title: "Invertebrates do not have a backbone",
    caption: "Example animals shown with no backbone.",
    render: { kind: "animals", backbone: false, examples: ["🐛", "🐌", "🦋", "🐙"] },
  },
];

// --- helpers ---------------------------------------------------------

export function colorHex(name: string | null): string | null {
  return name ? COLOR_HEX[name] ?? null : null;
}
export function canonicalPreposition(name: string | null): string | null {
  return name ? PREP_CANON[name] ?? name : null;
}
export function conceptByKey(key: string | null): ConceptPreset | null {
  return key ? CONCEPTS.find((c) => c.key === key) ?? null : null;
}

function singular(w: string): string {
  if (w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.endsWith("es") && (w.endsWith("ches") || w.endsWith("shes") || w.endsWith("xes"))) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

const PHONETIC_VARIANTS: Record<string, string> = {
  // Common child pronunciations and speech-to-text fuzzy variants
  cot: "cat", kat: "cat", ket: "cat", kitty: "cat",
  teble: "table", tabel: "table", tebbel: "table", tabe: "table",
  pensi: "pencil", pensel: "pencil", pensil: "pencil",
  appel: "apple", aple: "apple",
  cher: "chair", char: "chair",
  doggie: "dog", dag: "dog",
  bo: "ball", bawl: "ball",
  bok: "book", buk: "book",
  bocks: "box", boks: "box",
};

/** Find the first vocabulary key present in a token list, matching plurals and child speech variants too. */
function findIn(dict: Record<string, string>, tokens: string[], exclude?: string | null): string | null {
  for (const tok of tokens) {
    const s = singular(tok);
    if (dict[tok]) return tok === exclude ? null : tok;
    if (dict[s] && s !== exclude) return s;
    const v = PHONETIC_VARIANTS[tok] || PHONETIC_VARIANTS[s];
    if (v && dict[v] && v !== exclude) return v;
  }
  return null;
}

function detectSize(window: string): SceneSize {
  for (const [word, size] of Object.entries(SIZE_WORDS)) {
    if (window.includes(` ${word} `)) return size;
  }
  return "normal";
}
function detectColor(window: string): string | null {
  return COLORS.find((c) => window.includes(` ${c} `)) ?? null;
}
function detectCount(window: string): number {
  const digit = window.match(/\b([1-9])\b/);
  if (digit) return Math.min(5, Number(digit[1]));
  for (const [w, n] of Object.entries(NUMBER_WORDS)) {
    if (window.includes(` ${w} `)) return n;
  }
  // a bare plural implies "a few"
  return 1;
}
function detectAction(text: string): string | null {
  for (const a of ACTION_WORDS) {
    if (text.includes(` ${a} `) || text.includes(` ${a}s `)) return ACTION_STEM[a] ?? a;
  }
  return null;
}

function entity(type: string, glyph: string, window: string, text: string, pluralHint: boolean): SceneEntity {
  const color = detectColor(window);
  let count = detectCount(window);
  if (count === 1 && pluralHint) count = 3;
  return {
    type,
    glyph,
    color,
    colorHex: colorHex(color),
    size: detectSize(window),
    count: Math.max(1, Math.min(5, count)),
    action: detectAction(text),
  };
}

// --- main parse -----------------------------------------------------

export function parseSceneGraph(raw: string): SceneGraph {
  const clean = ` ${raw.toLowerCase().replace(/[.,!?;:"']/g, " ").replace(/\s+/g, " ").trim()} `;
  const tokens = clean.trim().split(" ").filter(Boolean);
  const concept = CONCEPTS.find((c) => c.match.test(raw));

  // relation (longest match wins)
  let relationRaw: string | null = null;
  for (const p of [...PREPOSITIONS].sort((a, b) => b.length - a.length)) {
    if (clean.includes(` ${p} `)) {
      relationRaw = p;
      break;
    }
  }
  const relation = canonicalPreposition(relationRaw);

  // split around the relation so each side gets its own attribute window
  let leftWin = clean;
  let rightWin = "";
  if (relationRaw) {
    const parts = clean.split(` ${relationRaw} `);
    leftWin = ` ${parts[0].trim()} `;
    rightWin = ` ${(parts.slice(1).join(` ${relationRaw} `)).trim()} `;
  }

  const subjectKey = findIn(ALL_VOCAB_GLYPHS, leftWin.trim().split(" ")) || findIn(SUBJECTS, leftWin.trim().split(" "));
  const refKey = relationRaw
    ? findIn(REFERENCES, rightWin.trim().split(" "), subjectKey)
    : findIn(REFERENCES, tokens, subjectKey);

  const subjectPlural = subjectKey ? leftWin.includes(` ${subjectKey}s `) : false;
  const refPlural = refKey ? rightWin.includes(` ${refKey}s `) : false;

  const STOP_NOUNS = new Set([
    "the", "a", "an", "is", "are", "was", "were", "to", "of", "and", "in", "on", "at",
    "with", "his", "her", "its", "this", "that", "some", "there", "then", "very",
    "please", "thanks", "thank", "you", "sorry", "excuse", "me", "hello", "hi", "bye",
    "what", "why", "how", "who", "when", "where", "can", "could", "will", "would",
    "i", "my", "we", "our", "he", "she", "it", "they", "them", "for", "from",
    "yes", "no", "not", "too", "also", "just", "now", "here",
  ]);

  let resolvedSubj = subjectKey;
  if (!resolvedSubj) {
    const words = leftWin.trim().split(" ").filter((w) => w.length > 2 && !STOP_NOUNS.has(w) && !COLORS.includes(w));
    if (words.length > 0) {
      resolvedSubj = words[words.length - 1];
    }
  }

  const subject: SceneEntity | null = resolvedSubj
    ? entity(
        resolvedSubj,
        ALL_VOCAB_GLYPHS[resolvedSubj] ?? SUBJECTS[resolvedSubj] ?? findWordEmoji(resolvedSubj) ?? "✨",
        leftWin,
        clean,
        subjectPlural,
      )
    : null;
  const reference: SceneEntity | null = refKey
    ? entity(refKey, REFERENCES[refKey], relationRaw ? rightWin : clean, clean, refPlural)
    : null;

  // confidence: reward the parts we actually resolved
  let confidence = 0;
  if (subject) confidence += 0.45;
  if (subject?.color) confidence += 0.1;
  if (relation) confidence += 0.15;
  if (reference) confidence += 0.25;
  if (concept) confidence = 1;
  if (subject?.action) confidence += 0.05;
  confidence = Math.min(1, confidence);

  return {
    raw,
    subject,
    relation: concept ? null : relation,
    reference: concept ? null : reference,
    conceptKey: concept?.key ?? null,
    confidence,
  };
}

/** Back-compat wrapper for the older SentenceScene shape. */
export function parseSentence(raw: string): SentenceScene {
  const g = parseSceneGraph(raw);
  return {
    raw,
    adjectives: g.subject?.color ? [g.subject.color] : [],
    color: g.subject?.color ?? null,
    subject: g.subject?.type ?? null,
    preposition: g.relation,
    reference: g.reference?.type ?? null,
    conceptKey: g.conceptKey,
  };
}
