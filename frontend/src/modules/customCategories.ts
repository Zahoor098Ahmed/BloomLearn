import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CustomCategory, CustomWord, TileSize, LanguageCode } from "../types";
import { starterLabel, wordLabel } from "./i18n";
import { getPictogramUrl } from "./aacPictograms";

// English anchors for the seed content, so re-translation can map back.
const SEED_WORD_EN: Record<string, string[]> = {
  Core: ["I", "you", "want", "more", "stop", "go", "like", "help", "yes", "no"],
  Food: ["water", "milk", "juice", "apple", "banana", "bread", "cookie", "rice", "chicken", "snack"],
  Feelings: ["happy", "sad", "angry", "scared", "tired", "hurt", "sick", "excited", "calm", "love"],
  People: ["mom", "dad", "me", "teacher", "friend", "baby", "doctor", "grandma", "grandpa", "sister"],
  Actions: ["eat", "drink", "play", "sleep", "read", "walk", "run", "sit", "wash", "open"],
};

/** Set before the first ensureCategoriesLoaded() so the starter board seeds in the chosen language. */
let seedLang: LanguageCode = "en-US";
export function setSeedLanguage(lang: LanguageCode) {
  seedLang = lang;
}

const KEY = "kiddocare_custom_categories";
const BACKUP_VERSION = 2;

const FOLDER_COLORS = ["#2f6d62", "#4a7fe6", "#c98a3d", "#8a6bc9", "#5c9a58", "#c96b6b"];

let cache: CustomCategory[] = [];
let loaded = false;

/** Bring older records up to the current shape without recreating anything. */
function migrate(list: CustomCategory[]): CustomCategory[] {
  return list.map((c, i) => ({
    ...c,
    color: c.color ?? FOLDER_COLORS[i % FOLDER_COLORS.length],
    icon: c.icon ?? "📁",
    hidden: c.hidden ?? false,
    parentCategoryId: c.parentCategoryId ?? null,
    order: typeof c.order === "number" ? c.order : i,
    source: c.source ?? "manual",
    words: (c.words ?? []).map((w, wi) => ({
      ...w,
      imageUri: w.imageUri || getPictogramUrl(w.label) || undefined,
      size: w.size ?? "md",
      useTextToSpeech: w.useTextToSpeech ?? !w.audioUri,
      order: typeof w.order === "number" ? w.order : wi,
    })),
  }));
}

export async function ensureCategoriesLoaded(): Promise<void> {
  if (loaded) return;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = migrate(raw ? (JSON.parse(raw) as CustomCategory[]) : []);
  } catch {
    cache = [];
  }
  loaded = true;
  if (cache.length === 0) {
    seedStarterBoard();
  } else {
    ensureAllStandardCategories();
    retranslateSeedBoard(seedLang);
    refreshSayItForMeImages();
  }
}

/**
 * One-time repair for installs that seeded the "Say It For Me" board before
 * its per-sentence pictogram map existed (they got the generic word-split
 * fallback image, e.g. every card showing the same "want"/"help" hand icon).
 * Recomputes each word's image from its English source text and only writes
 * if it actually changed, so it's cheap to call on every load.
 */
function refreshSayItForMeImages() {
  const enWords = STARTER.find((s) => s.name === "Say It For Me")?.words.map(([label]) => label);
  if (!enWords) return;
  const cat = cache.find((c) => (FOLDER_EN_BY_LANG[c.name.toLowerCase()] ?? c.name) === "Say It For Me");
  if (!cat) return;
  let changed = false;
  cat.words.forEach((w, i) => {
    const en = enWords[i];
    const correctUri = en ? getPictogramUrl(en) : null;
    if (correctUri && w.imageUri !== correctUri) {
      w.imageUri = correctUri;
      changed = true;
    }
  });
  if (changed) {
    cache = [...cache];
    persist();
  }
}

// --- starter board -------------------------------------------------------

const STARTER: { name: string; icon: string; color?: string; words: [string, string][] }[] = [
  {
    name: "Schools",
    icon: "🏫",
    color: "#2f6d62",
    words: [
      ["School", "🏫"],
      ["Teacher", "👩‍🏫"],
      ["Class", "🧑‍🤝‍🧑"],
      ["Chair", "🪑"],
      ["Desk", "🛋️"],
      ["Recess", "🛝"],
      ["Crayons", "🖍️"],
      ["Blocks", "🧱"],
      ["Fire Drill", "🚨"],
      ["Bulletin Board", "📌"],
      ["Pencil Sharpener", "✏️"],
      ["Slide", "🛝"],
      ["Swing", "🪵"],
      ["Sensory Table", "🌊"],
      ["Pens", "🖊️"],
      ["Coloured Pencils", "🎨"],
      ["Bookshelf", "📚"],
      ["Cafeteria", "🍽️"],
      ["Main Hall", "🏛️"],
      ["Reception", "🛎️"],
      ["School Store", "🏪"],
      ["Counting", "🖐️"],
      ["Book", "📖"],
      ["Learn", "💡"],
      ["Numbers", "🔢"],
      ["Flash Cards", "🃏"],
      ["Crafts", "✂️"],
    ],
  },
  {
    name: "Sentences",
    icon: "💬",
    color: "#4a7fe6",
    words: [
      ["I Need Help", "🙋"],
      ["In", "📦"],
      ["I Want", "🤲"],
      ["I Feel", "💭"],
      ["Can I Have", "🙏"],
      ["Look At This", "👀"],
      ["More Please", "➕"],
      ["Stop Please", "🛑"],
      ["Go To", "🚶"],
      ["Thank You", "🙏"],
      ["Yes", "✅"],
      ["No", "❌"],
      ["I Am", "🧒"],
      ["Where Is", "🔍"],
      ["What Is That", "❓"],
      ["I Like", "👍"],
      ["I Don't Like", "👎"],
      ["All Done", "🏁"],
    ],
  },
  {
    name: "Say It For Me",
    icon: "🗨️",
    color: "#d9534f",
    words: [
      ["I want to eat", "🍽️"],
      ["I want to drink", "🥤"],
      ["I need the bathroom", "🚻"],
      ["I am happy", "😊"],
      ["I am sad", "😢"],
      ["I am in pain", "😣"],
      ["I want to play", "🎈"],
      ["I am sleepy", "😴"],
      ["I need help", "🙋"],
      ["I want to go outside", "🌳"],
      ["I love you", "❤️"],
      ["I am hungry", "🍎"],
      ["I am thirsty", "💧"],
      ["Thank you very much", "🙏"],
      ["Please help me", "🙏"],
      ["I don't feel well", "🤒"],
      ["I want my mom", "👩"],
      ["I want my dad", "👨"],
      ["Can we go home", "🏠"],
      ["I am scared", "😨"],
    ],
  },
  {
    name: "Tools",
    icon: "🔧",
    color: "#4A4A4A",
    words: [
      ["Hammer", "🔨"],
      ["Scissors", "✂️"],
      ["Glue", "🧴"],
      ["Pencil", "✏️"],
      ["Ruler", "📏"],
      ["Calculator", "🔢"],
      ["Tape", "🩹"],
      ["Eraser", "🧽"],
      ["Sharpener", "✏️"],
      ["Paperclip", "📎"],
      ["Backpack", "🎒"],
      ["Notebook", "📓"],
      ["Folder", "📁"],
      ["Tablet", "📱"],
      ["Paintbrush", "🖌️"],
      ["Clock", "⏰"],
    ],
  },
  {
    name: "Emotion",
    icon: "🙂",
    color: "#c98a3d",
    words: [
      ["Happy", "😀"],
      ["Sad", "😢"],
      ["Angry", "😠"],
      ["Excited", "🤩"],
      ["Tired", "😴"],
      ["Scared", "😨"],
      ["Calm", "😌"],
      ["Proud", "😎"],
      ["Silly", "🤪"],
      ["Frustrated", "😤"],
      ["Loved", "🥰"],
      ["Sick", "🤢"],
      ["Surprised", "😲"],
      ["Confused", "🤔"],
      ["Shy", "🙈"],
      ["Hurt", "🤕"],
    ],
  },
  {
    name: "Attributes",
    icon: "🟢🔵",
    color: "#5c9a58",
    words: [
      ["Big", "🐘"],
      ["Small", "🐜"],
      ["Hot", "🔥"],
      ["Cold", "❄️"],
      ["Fast", "⚡"],
      ["Slow", "🐢"],
      ["Good", "👍"],
      ["Bad", "👎"],
      ["Clean", "✨"],
      ["Dirty", "💩"],
      ["Loud", "📢"],
      ["Quiet", "🤫"],
      ["Soft", "🧸"],
      ["Hard", "🪨"],
      ["Open", "🚪"],
      ["Closed", "🔒"],
      ["Up", "⬆️"],
      ["Down", "⬇️"],
      ["In", "📥"],
      ["Out", "📤"],
      ["Same", "🟰"],
      ["Different", "🔀"],
    ],
  },
  {
    name: "Sports",
    icon: "⚽",
    color: "#c96b6b",
    words: [
      ["Soccer", "⚽"],
      ["Basketball", "🏀"],
      ["Running", "🏃"],
      ["Swimming", "🏊"],
      ["Baseball", "⚾"],
      ["Tennis", "🎾"],
      ["Jump Rope", "🪢"],
      ["Dancing", "💃"],
      ["Playground", "🛝"],
      ["Catch", "⚾"],
      ["Ride Bike", "🚲"],
      ["Gymnastics", "🤸"],
      ["Skateboard", "🛹"],
      ["Yoga", "🧘"],
    ],
  },
  {
    name: "Hygiene",
    icon: "🛁",
    color: "#8a6bc9",
    words: [
      ["Wash Hands", "🧼"],
      ["Brush Teeth", "🪥"],
      ["Toilet", "🚽"],
      ["Shower", "🚿"],
      ["Comb Hair", "🪮"],
      ["Wash Face", "🧖"],
      ["Blow Nose", "🤧"],
      ["Put On Clothes", "👕"],
      ["Drink Water", "💧"],
      ["Sleep", "🛏️"],
      ["Clean Up", "🧹"],
      ["Bandage", "🩹"],
    ],
  },
  {
    name: "Music",
    icon: "🎸",
    color: "#d46cae",
    words: [
      ["Sing", "🎤"],
      ["Dance", "💃"],
      ["Guitar", "🎸"],
      ["Piano", "🎹"],
      ["Drums", "🥁"],
      ["Listen", "👂"],
      ["Song", "🎵"],
      ["Music", "🎶"],
      ["Loud", "🔊"],
      ["Quiet", "🔉"],
      ["Fast", "⏩"],
      ["Slow", "⏪"],
      ["Bell", "🔔"],
      ["Trumpet", "🎺"],
      ["Violin", "🎻"],
      ["Headphones", "🎧"],
    ],
  },
  {
    name: "Core",
    icon: "💬",
    color: "#3a86ff",
    words: [
      ["I", "☝️"], ["You", "👉"], ["Want", "🙏"], ["More", "➕"], ["Stop", "✋"],
      ["Go", "🚶"], ["Like", "❤️"], ["Help", "🆘"], ["Yes", "✅"], ["No", "❌"],
      ["Please", "🤲"], ["Thank You", "🙏"], ["Look", "👀"], ["Come", "👋"], ["Here", "📍"], ["Where", "❓"],
    ],
  },
  {
    name: "Food",
    icon: "🍎",
    color: "#c98a3d",
    words: [
      ["Water", "💧"], ["Milk", "🥛"], ["Juice", "🧃"], ["Apple", "🍎"], ["Banana", "🍌"],
      ["Bread", "🍞"], ["Cookie", "🍪"], ["Rice", "🍚"], ["Chicken", "🍗"], ["Snack", "🥨"],
      ["Pizza", "🍕"], ["Sandwich", "🥪"], ["Fries", "🍟"], ["Fruit", "🍓"],
    ],
  },
];

// Built-in folder names (starter board + bulk-build seed lists), by language.
const FOLDER_NAMES: Partial<Record<LanguageCode, Record<string, string>>> = {
  "ar-SA": {
    Core: "أساسي", Food: "طعام", Feelings: "مشاعر", People: "أشخاص", Actions: "أفعال",
    Schools: "مدرسة", Sentences: "جمل", Tools: "أدوات", Emotion: "مشاعر", Attributes: "صفات",
    Sports: "رياضة", Hygiene: "نظافة", Music: "موسيقى", "Say It For Me": "قلها لي",
    "My Words": "كلماتي", "New Folder": "مجلد جديد",
    Animals: "حيوانات", Fruits: "فواكه", Vegetables: "خضروات", Colors: "ألوان", Shapes: "أشكال",
    Vehicles: "مركبات", "Body Parts": "أجزاء الجسم", Clothes: "ملابس", Weather: "الطقس", Family: "العائلة",
    Jobs: "وظائف", Instruments: "آلات موسيقية", "School Supplies": "أدوات مدرسية",
    Furniture: "أثاث", Feelings2: "مشاعر", "Days of the Week": "أيام الأسبوع", Months: "الشهور", Numbers: "أرقام", Letters: "حروف",
  },
  "ur-PK": {
    Core: "بنیادی", Food: "کھانا", Feelings: "احساسات", People: "لوگ", Actions: "کام",
    Schools: "اسکول", Sentences: "جملے", Tools: "اوزار", Emotion: "جذبات", Attributes: "خصوصیات",
    Sports: "کھیل", Hygiene: "صفائی", Music: "موسیقی", "Say It For Me": "میرے لیے کہو",
    "My Words": "میرے الفاظ", "New Folder": "نیا فولڈر",
    Animals: "جانور", Fruits: "پھل", Vegetables: "سبزیاں", Colors: "رنگ", Shapes: "شکلیں",
    Vehicles: "گاڑیاں", "Body Parts": "جسم کے حصے", Clothes: "کپڑے", Weather: "موسم", Family: "خاندان",
    Jobs: "پیشے", "School Supplies": "اسکول کا سامان", "Days of the Week": "ہفتے کے دن", Months: "مہینے",
  },
};
function folderName(en: string) {
  return FOLDER_NAMES[seedLang]?.[en] ?? en;
}

// reverse map: any localised folder name → its English anchor
const FOLDER_EN_BY_LANG: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const lang of Object.keys(FOLDER_NAMES) as LanguageCode[]) {
    for (const [en, local] of Object.entries(FOLDER_NAMES[lang] ?? {})) m[local.toLowerCase()] = en;
  }
  for (const en of Object.keys(FOLDER_NAMES["ar-SA"] ?? {})) m[en.toLowerCase()] = en;
  return m;
})();

/**
 * Re-translate the built-in vocabulary (starter board + bulk-generated
 * categories, PLUS the individual words inside any user-created category)
 * into the given language. Words come from a fixed dictionary, so a
 * caregiver's own genuinely custom word (not in the dictionary) is left
 * untouched — only text that matches a known AAC word/phrase translates.
 * Call this whenever the language changes.
 */
export function retranslateSeedBoard(lang: LanguageCode) {
  let changed = false;
  for (const cat of cache) {
    const isSeedFamily = ["seed", "generated", "list", "voice"].includes(cat.source);

    // folder name — only rename folders we generated ourselves; a caregiver's
    // own custom folder name (e.g. "Zahoor's Favorites") is left alone.
    if (isSeedFamily) {
      const enName = FOLDER_EN_BY_LANG[cat.name.toLowerCase()] ?? cat.name;
      const newName = FOLDER_NAMES[lang]?.[enName] ?? (lang === "en-US" ? enName : cat.name);
      if (newName !== cat.name) {
        cat.name = newName;
        changed = true;
      }
    }

    // words — always attempt translation. Seed folders map by position for
    // perfect accuracy; any other category (including a "manual" folder
    // built via quick-start templates, pasted lists, or voice-add) falls
    // back to dictionary lookup, which is a safe no-op for genuinely
    // custom text that isn't recognized AAC vocabulary.
    const enName2 = isSeedFamily ? (FOLDER_EN_BY_LANG[cat.name.toLowerCase()] ?? cat.name) : null;
    const enWords = enName2 ? SEED_WORD_EN[enName2] : undefined;
    cat.words.forEach((w, i) => {
      const en = enWords?.[i];
      const localized = en ? starterLabel(en, lang) : wordLabel(w.label, lang);
      if (localized && localized !== w.label) {
        w.label = localized;
        w.phrase = localized;
        changed = true;
      }
    });
  }
  if (changed) {
    cache = [...cache];
    persist();
  }
}

function ensureAllStandardCategories() {
  let changed = false;
  const existingNames = new Set(cache.map((c) => c.name.toLowerCase()));
  const now = Date.now();

  STARTER.forEach((s, idx) => {
    const sName = s.name.toLowerCase();
    const localizedName = folderName(s.name).toLowerCase();
    if (!existingNames.has(sName) && !existingNames.has(localizedName)) {
      cache.push({
        id: uid("cat"),
        name: folderName(s.name),
        createdAt: now,
        updatedAt: now,
        source: "seed",
        grouping: "none",
        color: s.color || FOLDER_COLORS[idx % FOLDER_COLORS.length],
        icon: s.icon,
        parentCategoryId: null,
        order: cache.length,
        words: s.words.map(([label, emoji], wi) => {
          const localized = starterLabel(label, seedLang) || label;
          return {
            id: uid("w"),
            label: localized,
            phrase: localized,
            emoji,
            imageUri: getPictogramUrl(label) || undefined,
            useTextToSpeech: true,
            size: "md" as TileSize,
            order: wi,
          };
        }),
      });
      changed = true;
    }
  });

  if (changed) {
    persist();
  }
}

function seedStarterBoard() {
  const now = Date.now();
  cache = STARTER.map((s, i) => ({
    id: uid("cat"),
    name: folderName(s.name),
    createdAt: now,
    updatedAt: now,
    source: "seed",
    grouping: "none",
    color: s.color || FOLDER_COLORS[i % FOLDER_COLORS.length],
    icon: s.icon,
    parentCategoryId: null,
    order: i,
    words: s.words.map(([label, emoji], wi) => {
      const localized = starterLabel(label, seedLang) || label;
      return {
        id: uid("w"),
        label: localized,
        phrase: localized,
        emoji,
        imageUri: getPictogramUrl(label) || undefined,
        useTextToSpeech: true,
        size: "md" as TileSize,
        order: wi,
      };
    }),
  }));
  persist();
}

function persist(): void {
  AsyncStorage.setItem(KEY, JSON.stringify(cache)).catch(() => {});
}

export function listCategories(): CustomCategory[] {
  return [...cache].sort(byOrder);
}

export function getCategory(id: string): CustomCategory | undefined {
  return cache.find((c) => c.id === id);
}

export function categoryWordCount(): number {
  return cache.reduce((s, c) => s + c.words.length, 0);
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function byLabel(a: CustomWord, b: CustomWord): number {
  return a.label.localeCompare(b.label, undefined, { sensitivity: "base" });
}

/** Create a new category from reviewed words in one batch write. */
export function createCategory(input: {
  name: string;
  source: CustomCategory["source"];
  words: { label: string; phrase: string; emoji: string; imageUri?: string }[];
}): CustomCategory {
  const now = Date.now();
  const sorted = [...input.words].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  const topCount = cache.filter((c) => !c.parentCategoryId).length;
  const cat: CustomCategory = {
    id: uid("cat"),
    name: input.name.trim() || "Untitled",
    createdAt: now,
    updatedAt: now,
    source: input.source,
    grouping: sorted.length > 12 ? "alpha-range" : "none",
    color: FOLDER_COLORS[topCount % FOLDER_COLORS.length],
    icon: "📁",
    parentCategoryId: null,
    order: topCount,
    words: sorted.map((w, i) => ({
      id: uid("w"),
      label: w.label.trim(),
      phrase: w.phrase.trim() || w.label.trim(),
      emoji: w.emoji || "🔹",
      imageUri: w.imageUri,
      useTextToSpeech: true,
      size: "md" as TileSize,
      order: i,
    })),
  };
  cache = [cat, ...cache];
  persist();
  return cat;
}

function mutate(id: string, fn: (c: CustomCategory) => void): CustomCategory | undefined {
  const cat = cache.find((c) => c.id === id);
  if (!cat) return undefined;
  fn(cat);
  cat.updatedAt = Date.now();
  cache = [...cache];
  persist();
  return cat;
}

export function renameCategory(id: string, name: string) {
  return mutate(id, (c) => {
    c.name = name.trim() || c.name;
  });
}

export function deleteCategory(id: string) {
  cache = cache.filter((c) => c.id !== id);
  persist();
}

export function setGrouping(id: string, grouping: CustomCategory["grouping"]) {
  return mutate(id, (c) => {
    c.grouping = grouping;
  });
}

export function updateWord(
  catId: string,
  wordId: string,
  patch: Partial<Pick<CustomWord, "label" | "phrase" | "emoji" | "imageUri" | "audioUri" | "useTextToSpeech" | "size">>,
) {
  return mutate(catId, (c) => {
    const w = c.words.find((x) => x.id === wordId);
    if (w) Object.assign(w, patch);
  });
}

export function removeWord(catId: string, wordId: string) {
  return mutate(catId, (c) => {
    c.words = c.words.filter((w) => w.id !== wordId).map((w, i) => ({ ...w, order: i }));
  });
}

export function addWord(
  catId: string,
  word: { label: string; phrase?: string; emoji?: string; imageUri?: string; audioUri?: string; useTextToSpeech?: boolean; size?: TileSize },
) {
  return mutate(catId, (c) => {
    c.words.push({
      id: uid("w"),
      label: word.label.trim(),
      phrase: (word.phrase ?? word.label).trim() || word.label.trim(),
      emoji: word.emoji || "🔹",
      imageUri: word.imageUri,
      audioUri: word.audioUri,
      useTextToSpeech: word.useTextToSpeech ?? !word.audioUri,
      size: word.size ?? "md",
      order: c.words.length,
    });
  });
}

// --- board helpers (folders) -------------------------------------------

function byOrder(a: CustomCategory, b: CustomCategory) {
  return (a.order ?? 0) - (b.order ?? 0);
}

export function topLevelCategories(): CustomCategory[] {
  return cache.filter((c) => !c.parentCategoryId).sort(byOrder);
}

export function childCategories(parentId: string): CustomCategory[] {
  return cache.filter((c) => c.parentCategoryId === parentId).sort(byOrder);
}

/** Same as topLevelCategories()/childCategories(), but with parent-hidden
 * folders removed — what the child-facing Talk board should actually render.
 * Parent-facing screens (My Categories, admin) keep using the un-filtered
 * versions above so a hidden folder can still be found and un-hidden. */
export function visibleTopLevelCategories(): CustomCategory[] {
  return topLevelCategories().filter((c) => !c.hidden);
}
export function visibleChildCategories(parentId: string): CustomCategory[] {
  return childCategories(parentId).filter((c) => !c.hidden);
}

export function createBlankCategory(input: {
  name: string;
  color?: string;
  icon?: string;
  parentCategoryId?: string | null;
}): CustomCategory {
  const now = Date.now();
  const siblings = cache.filter((c) => (c.parentCategoryId ?? null) === (input.parentCategoryId ?? null));
  const cat: CustomCategory = {
    id: uid("cat"),
    name: input.name.trim() || "New Category",
    createdAt: now,
    updatedAt: now,
    source: "manual",
    grouping: "none",
    color: input.color ?? FOLDER_COLORS[siblings.length % FOLDER_COLORS.length],
    icon: input.icon ?? "📁",
    parentCategoryId: input.parentCategoryId ?? null,
    order: siblings.length,
    words: [],
  };
  cache = [...cache, cat];
  persist();
  return cat;
}

export function updateCategoryMeta(id: string, patch: Partial<Pick<CustomCategory, "name" | "color" | "icon">>) {
  return mutate(id, (c) => Object.assign(c, patch));
}

/** Parent control: show/hide a whole folder on the child-facing Talk board. */
export function setCategoryHidden(id: string, hidden: boolean) {
  return mutate(id, (c) => {
    c.hidden = hidden;
  });
}

/** Delete a category and any sub-folders under it. */
export function deleteCategoryDeep(id: string) {
  const ids = new Set<string>([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of cache) {
      if (c.parentCategoryId && ids.has(c.parentCategoryId) && !ids.has(c.id)) {
        ids.add(c.id);
        grew = true;
      }
    }
  }
  cache = cache.filter((c) => !ids.has(c.id));
  persist();
}

export function reorderCategory(id: string, dir: "up" | "down") {
  const cat = cache.find((c) => c.id === id);
  if (!cat) return;
  const sibs = cache.filter((c) => (c.parentCategoryId ?? null) === (cat.parentCategoryId ?? null)).sort(byOrder);
  const idx = sibs.findIndex((c) => c.id === id);
  const swap = dir === "up" ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= sibs.length) return;
  [sibs[idx], sibs[swap]] = [sibs[swap], sibs[idx]];
  sibs.forEach((c, i) => (c.order = i));
  cache = [...cache];
  persist();
}

/** One-click A–Z sort for any category (existing or new). */
export function sortAlphabetical(id: string) {
  return mutate(id, (c) => {
    c.words = [...c.words].sort(byLabel).map((w, i) => ({ ...w, order: i }));
  });
}

export type MoveKind = "up" | "down" | "start" | "end";

export function moveWord(catId: string, wordId: string, kind: MoveKind) {
  return mutate(catId, (c) => {
    const idx = c.words.findIndex((w) => w.id === wordId);
    if (idx < 0) return;
    const arr = [...c.words];
    const [item] = arr.splice(idx, 1);
    if (kind === "up") arr.splice(Math.max(0, idx - 1), 0, item);
    else if (kind === "down") arr.splice(Math.min(arr.length, idx + 1), 0, item);
    else if (kind === "start") arr.unshift(item);
    else arr.push(item);
    c.words = arr.map((w, i) => ({ ...w, order: i }));
  });
}

/** Group ordered words into alphabetical ranges (A–E, F–J, ...). */
export function groupIntoAlphaRanges(words: CustomWord[], bucketSize = 5): { label: string; words: CustomWord[] }[] {
  const sorted = [...words].sort(byLabel);
  const buckets: { label: string; words: CustomWord[] }[] = [];
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  for (let i = 0; i < letters.length; i += bucketSize) {
    const from = letters[i];
    const to = letters[Math.min(letters.length - 1, i + bucketSize - 1)];
    const inRange = sorted.filter((w) => {
      const first = (w.label[0] || "#").toUpperCase();
      return first >= from && first <= to;
    });
    if (inRange.length) buckets.push({ label: from === to ? from : `${from}–${to}`, words: inRange });
  }
  const other = sorted.filter((w) => {
    const first = (w.label[0] || "#").toUpperCase();
    return first < "A" || first > "Z";
  });
  if (other.length) buckets.push({ label: "#", words: other });
  return buckets;
}

// --- board helpers (feature-additive) ------------------------------------

export const BOTTOM_CATEGORIES: { key: string; icon: string; label: string; enFallback: string; color: string }[] = [
  { key: "Tools", icon: "🔨", label: "Tools", enFallback: "Tools", color: "#4A4A4A" },
  { key: "Emotion", icon: "😀", label: "Emotion", enFallback: "Emotion", color: "#c98a3d" },
  { key: "Attributes", icon: "🟢🔵", label: "Attributes", enFallback: "Attributes", color: "#5c9a58" },
  { key: "Sentences", icon: "🙋", label: "Sentences", enFallback: "Sentences", color: "#4a7fe6" },
  { key: "Say It For Me", icon: "🗨️", label: "Say It For Me", enFallback: "Say It For Me", color: "#d9534f" },
  { key: "Schools", icon: "🏫", label: "Schools", enFallback: "Schools", color: "#2f6d62" },
  { key: "Sports", icon: "⚽", label: "Sports", enFallback: "Sports", color: "#c96b6b" },
  { key: "Hygiene", icon: "🛁", label: "Hygiene", enFallback: "Hygiene", color: "#8a6bc9" },
  { key: "Music", icon: "🎸", label: "Music", enFallback: "Music", color: "#d46cae" },
  { key: "Core", icon: "💬", label: "Core", enFallback: "Core", color: "#3a86ff" },
  { key: "Food", icon: "🍎", label: "Food", enFallback: "Food", color: "#e67e22" },
];

export function bottomTabCategories(): { id: string | null; name: string; icon: string; color: string }[] {
  const top = topLevelCategories();
  const out: { id: string | null; name: string; icon: string; color: string }[] = [];
  for (const tab of BOTTOM_CATEGORIES) {
    const hit = top.find(
      (c) =>
        c.name.toLowerCase() === tab.key.toLowerCase() ||
        c.name.toLowerCase() === tab.label.toLowerCase() ||
        c.name.toLowerCase() === tab.enFallback.toLowerCase() ||
        c.name.toLowerCase() === folderName(tab.key).toLowerCase()
    );
    if (hit?.hidden) continue; // parent hid this folder from the child board
    if (hit) {
      out.push({ id: hit.id, name: hit.name, icon: hit.icon || tab.icon, color: hit.color || tab.color });
    } else {
      out.push({ id: null, name: tab.label, icon: tab.icon, color: tab.color });
    }
  }
  return out;
}

export function coreWords(): CustomWord[] {
  const coreCat = topLevelCategories().find((c) => (c.name || "").toLowerCase() === "core");
  if (!coreCat) return [];
  const priority = ["I", "you", "want", "more", "stop", "help", "yes", "no", "go", "like"];
  const sorted = [...coreCat.words].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const p = [...sorted].sort((a, b) => {
    const ai = priority.indexOf(a.label);
    const bi = priority.indexOf(b.label);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return p.slice(0, 7);
}

// --- Backup / export -------------------------------------------------------

export interface BackupFile {
  version: number;
  exportedAt: number;
  categoryCount: number;
  wordCount: number;
  imageCount: number;
  categories: CustomCategory[];
}

export function buildBackup(): BackupFile {
  const categories = [...cache];
  return {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    categoryCount: categories.length,
    wordCount: categories.reduce((s, c) => s + c.words.length, 0),
    imageCount: categories.reduce((s, c) => s + c.words.filter((w) => !!w.imageUri).length, 0),
    categories,
  };
}

export interface RestoreReport {
  ok: boolean;
  restoredCategories: number;
  restoredWords: number;
  restoredImages: number;
  issues: string[];
}

/** Restore from a backup object and self-check against its manifest. */
export function restoreBackup(data: unknown, mode: "replace" | "merge" = "replace"): RestoreReport {
  const issues: string[] = [];
  const file = data as Partial<BackupFile>;
  if (!file || !Array.isArray(file.categories)) {
    return { ok: false, restoredCategories: 0, restoredWords: 0, restoredImages: 0, issues: ["File is not a valid KiddoCare backup."] };
  }

  const incoming = file.categories.filter((c): c is CustomCategory => !!c && Array.isArray((c as CustomCategory).words));
  if (incoming.length !== file.categories.length) issues.push("Some categories were malformed and skipped.");

  cache = mode === "replace" ? incoming : mergeById(cache, incoming);
  loaded = true;
  persist();

  const restoredWords = cache.reduce((s, c) => s + c.words.length, 0);
  const restoredImages = cache.reduce((s, c) => s + c.words.filter((w) => !!w.imageUri).length, 0);

  if (typeof file.categoryCount === "number" && mode === "replace" && file.categoryCount !== cache.length) {
    issues.push(`Manifest expected ${file.categoryCount} categories but restored ${cache.length}.`);
  }
  if (typeof file.wordCount === "number" && mode === "replace" && file.wordCount !== restoredWords) {
    issues.push(`Manifest expected ${file.wordCount} words but restored ${restoredWords}.`);
  }
  if (typeof file.imageCount === "number" && mode === "replace" && file.imageCount !== restoredImages) {
    issues.push(`Manifest expected ${file.imageCount} images but restored ${restoredImages}.`);
  }

  return { ok: issues.length === 0, restoredCategories: cache.length, restoredWords, restoredImages, issues };
}

function mergeById(existing: CustomCategory[], incoming: CustomCategory[]): CustomCategory[] {
  const map = new Map(existing.map((c) => [c.id, c]));
  for (const c of incoming) map.set(c.id, c);
  return [...map.values()];
}
