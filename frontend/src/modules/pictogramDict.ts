import DICT from "./arasaacDict.json";

/**
 * The bundled ARASAAC word list (word -> pictogram id) and the lookup on it.
 * Pure — no device storage — so the scene tests and lesson audits can resolve
 * the exact picture a word gets, the same way the app does.
 */

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, " ")
    .replace(/\b(the|a|an|is|are|was|were|to|of|and)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ~14,800 everyday English words -> ARASAAC pictogram id, bundled with the app
// (280 KB of text, no images). Every word here resolves to a white-background
// picture with zero network round-trips for the lookup; the PNG is fetched and
// cached in the library only the first time it is shown.
const dict: Record<string, number> = DICT as Record<string, number>;
const DICT_SIZE = Object.keys(dict).length;

/** Kept for API compatibility; the dictionary is bundled, nothing to build. */
export async function buildDictionary(): Promise<number> {
  return DICT_SIZE;
}

export async function dictionaryWords(): Promise<number> {
  return DICT_SIZE;
}

// Child speech rarely matches a dictionary word exactly. This maps the common
// informal / baby words to the word ARASAAC actually indexes.
const SYNONYMS: Record<string, string> = {
  puppy: "dog", doggy: "dog", doggie: "dog", pup: "dog",
  kitty: "cat", kitten: "cat", kittie: "cat", pussycat: "cat",
  bunny: "rabbit", horsey: "horse", pony: "horse", piggy: "pig", ducky: "duck",
  birdie: "bird", cow: "cow", moo: "cow", teddy: "teddy bear",
  mom: "mother", mum: "mother", mommy: "mother", mama: "mother",
  dad: "father", daddy: "father", papa: "father",
  grandma: "grandmother", granny: "grandmother", nana: "grandmother",
  grandpa: "grandfather", nan: "grandmother",
  kid: "child", kids: "children", baba: "baby",
  tummy: "stomach", belly: "stomach", potty: "toilet", loo: "toilet",
  telly: "television", tv: "television", fridge: "refrigerator",
  choccy: "chocolate", sweets: "candy", sweetie: "candy", lolly: "lollipop",
  brekkie: "breakfast", veggies: "vegetables", spuds: "potato",
  auto: "car", motorcar: "car", lorry: "truck", plane: "airplane",
  aeroplane: "airplane", chopper: "helicopter", bike: "bicycle", cycle: "bicycle",
  choo: "train",
  jumper: "sweater", pants: "trousers", nappy: "diaper",
  specs: "glasses", brolly: "umbrella",
  poorly: "sick", ill: "sick", owie: "hurt", ouch: "hurt",
  scared: "afraid", cross: "angry", mad: "angry",
  nap: "sleep", snooze: "sleep",
  telephone: "phone", mobile: "phone", laptop: "computer", pc: "computer",
  footy: "football",
  doggo: "dog", birdy: "bird", fishy: "fish", froggy: "frog",
  larki: "girl", larka: "boy", bacha: "child", bache: "children",
  billi: "cat", billa: "cat", kutta: "dog", kuttay: "dog",
  pani: "water", doodh: "milk", roti: "bread", chawal: "rice",
  seb: "apple", kela: "banana", aam: "mango",
  gari: "car", kitab: "book", qalam: "pencil",
  ghar: "house", kursi: "chair", mez: "table",
  hathi: "elephant", sher: "lion", ghora: "horse",
  gaind: "ball", parinda: "bird", machli: "fish",
  suraj: "sun", chand: "moon", sitara: "star",
  darakht: "tree", phool: "flower",
  masjid: "mosque", madrasa: "school", basta: "backpack",
  joote: "shoes", kapre: "clothes",
  honeybee: "bee", woodpecker: "bird", sweater: "clothes", woollen: "clothes",
  silk: "clothes", wooden: "wood", concrete: "rock", aluminium: "metal",
  nylon: "rope", pan: "pot", glow: "lamp", voice: "mouth",
  sunset: "sun", sunlight: "sun", solar: "sun", asteroid: "rock",
  satellites: "star", doorbell: "bell", friction: "car", electric: "battery",
  magnetic: "magnet", electromagnet: "magnet", windpipe: "neck", alveoli: "lungs",
  gastric: "stomach", algae: "plant", nutrients: "food", saltwater: "sea",
  biomass: "tree", overfishing: "fish", pesticides: "plant", conserving: "water",
  hovercraft: "boat", pulling: "pull", pushing: "push",
};

/** Try a word, its singular, and common verb forms. */
function morphs(w: string): string[] {
  const out = [w];
  if (w.endsWith("ies") && w.length > 4) out.push(w.slice(0, -3) + "y");
  if (w.endsWith("es") && w.length > 3) out.push(w.slice(0, -2));
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) out.push(w.slice(0, -1));
  if (w.endsWith("ing") && w.length > 5) {
    out.push(w.slice(0, -3), w.slice(0, -3) + "e");
    if (w[w.length - 4] === w[w.length - 5]) out.push(w.slice(0, -4)); // running -> run
  }
  if (w.endsWith("ed") && w.length > 4) out.push(w.slice(0, -2), w.slice(0, -1));
  return [...new Set(out)];
}

/** Resolve one term to a pictogram id via the dictionary (exact, synonym, morph). */
function dictId(term: string): number | null {
  const t = norm(term);
  if (!t) return null;
  const tries = [t, SYNONYMS[t] ?? "", ...morphs(t)].filter(Boolean);
  for (const w of tries) {
    if (dict[w]) return dict[w];
    if (SYNONYMS[w] && dict[SYNONYMS[w]]) return dict[SYNONYMS[w]];
  }
  return null;
}

export function idUrl(id: number): string {
  return `https://static.arasaac.org/pictograms/${id}/${id}_500.png`;
}

export function dictUrl(term: string): string | null {
  const id = dictId(term);
  return id ? idUrl(id) : null;
}

