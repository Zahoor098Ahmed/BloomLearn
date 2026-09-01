import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CustomCategory, CustomWord } from "../types";

const KEY = "kiddocare_custom_categories";
const BACKUP_VERSION = 1;

let cache: CustomCategory[] = [];
let loaded = false;

export async function ensureCategoriesLoaded(): Promise<void> {
  if (loaded) return;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as CustomCategory[]) : [];
  } catch {
    cache = [];
  }
  loaded = true;
}

function persist(): void {
  AsyncStorage.setItem(KEY, JSON.stringify(cache)).catch(() => {});
}

export function listCategories(): CustomCategory[] {
  return [...cache].sort((a, b) => b.updatedAt - a.updatedAt);
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
  const cat: CustomCategory = {
    id: uid("cat"),
    name: input.name.trim() || "Untitled",
    createdAt: now,
    updatedAt: now,
    source: input.source,
    grouping: sorted.length > 12 ? "alpha-range" : "none",
    words: sorted.map((w, i) => ({
      id: uid("w"),
      label: w.label.trim(),
      phrase: w.phrase.trim() || w.label.trim(),
      emoji: w.emoji || "🔹",
      imageUri: w.imageUri,
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
  patch: Partial<Pick<CustomWord, "label" | "phrase" | "emoji" | "imageUri">>,
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

export function addWord(catId: string, word: { label: string; phrase: string; emoji: string }) {
  return mutate(catId, (c) => {
    c.words.push({
      id: uid("w"),
      label: word.label.trim(),
      phrase: word.phrase.trim() || word.label.trim(),
      emoji: word.emoji || "🔹",
      order: c.words.length,
    });
  });
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
