import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import type { SceneGraph } from "../types";

/**
 * The learning picture library.
 *
 * Every picture the app finds (ARASAAC symbol search) or generates (AI) is
 * downloaded, stored on the device, and indexed by phrase + tags. So:
 *
 *   • "cat"                -> library (ARASAAC cat), saved
 *   • "blue cat"           -> library ("blue cat"), or AI once then saved
 *   • "cat sitting on the table" -> library if seen before, else AI -> saved
 *
 * Anything AI generates becomes part of the library, so the next time the
 * same sentence is spoken the picture comes from the library — instant and
 * offline. No pre-bundled 5,000 images: the library is seeded live from the
 * free ARASAAC set (30,000+ pictograms) and grows with use.
 */

const INDEX_KEY = "kiddocare_library_index";
const DIR = `${FileSystem.documentDirectory}library/`;

export type LibrarySource = "arasaac" | "ai" | "photo" | "manual";

export interface LibraryEntry {
  key: string;
  uri: string; // local file
  source: LibrarySource;
  tags: string[];
  savedAt: number;
}

let index: Record<string, LibraryEntry> = {};
let loaded = false;

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, " ")
    .replace(/\b(the|a|an|is|are|was|were|to|of|and)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

async function ensureLoaded() {
  if (loaded) return;
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    index = raw ? JSON.parse(raw) : {};
  } catch {
    index = {};
  }
  try {
    const info = await FileSystem.getInfoAsync(DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  } catch {
    /* ignore */
  }
  loaded = true;
}

function persist() {
  AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index)).catch(() => {});
}

// --- keys to try, most specific first ---------------------------------

function candidateKeys(phrase: string, graph?: SceneGraph): string[] {
  const keys: string[] = [];
  const p = norm(phrase);
  if (p) keys.push(p);
  if (graph?.subject) {
    const s = graph.subject.type;
    const c = graph.subject.color;
    if (graph.relation && graph.reference) keys.push(norm(`${c ?? ""} ${s} ${graph.relation} ${graph.reference.type}`));
    if (c) keys.push(norm(`${c} ${s}`));
    keys.push(norm(s));
  }
  return [...new Set(keys.filter(Boolean))];
}

// --- ARASAAC (the seed library) --------------------------------------

interface ArasaacItem { _id: number; keywords?: { keyword?: string }[] }

async function arasaacFirst(term: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.arasaac.org/api/pictograms/en/search/${encodeURIComponent(term)}`);
    if (!res.ok) return null;
    const json = (await res.json()) as ArasaacItem[];
    if (!Array.isArray(json) || !json.length) return null;
    const want = term.toLowerCase().trim();
    // Prefer a pictogram whose keyword is exactly the word ("table" must not
    // return "chair"), then a keyword that starts with it, else the first hit.
    const exact = json.find((it) => it.keywords?.some((k) => (k.keyword ?? "").toLowerCase().trim() === want));
    const starts = json.find((it) => it.keywords?.some((k) => (k.keyword ?? "").toLowerCase().trim().startsWith(want)));
    const id = (exact ?? starts ?? json[0])._id;
    return id ? `https://static.arasaac.org/pictograms/${id}/${id}_500.png` : null;
  } catch {
    return null;
  }
}

// --- public API -----------------------------------------------------

export interface LibraryHit {
  uri: string;
  source: LibrarySource;
  fromLibrary: boolean; // true = already saved locally
}

/**
 * Look a phrase up in the library. Returns a saved local picture if we have
 * one; otherwise tries the ARASAAC seed set for the best matching term,
 * saves it, and returns that. Returns null only when nothing matches — the
 * caller then shows the instant scene or offers AI.
 */
export async function lookupImage(phrase: string, graph?: SceneGraph): Promise<LibraryHit | null> {
  await ensureLoaded();
  const keys = candidateKeys(phrase, graph);

  // 1. already in the library?
  for (const k of keys) {
    if (index[k]) return { uri: index[k].uri, source: index[k].source, fromLibrary: true };
  }

  // ARASAAC pictograms are fixed-colour line art, so "blue dog" would come back
  // as a plain dog. When a colour is asked for, don't seed from ARASAAC — return
  // null so the caller uses AI (which draws a real blue dog) and saves it.
  if (graph?.subject?.color) return null;

  // 2. seed from ARASAAC — try the specific term, then just the subject
  const searchTerms = [
    graph?.subject?.type ?? null,
    keys[0] ?? null,
  ].filter((t): t is string => !!t);

  for (const term of searchTerms) {
    const remote = await arasaacFirst(term);
    if (remote) {
      const saved = await saveImage(keys[0] || term, remote, { source: "arasaac", tags: keys });
      if (saved) return { uri: saved.uri, source: "arasaac", fromLibrary: false };
    }
  }

  return null;
}

/** Download and index a picture. Used for ARASAAC seeds and for AI results. */
export async function saveImage(
  phrase: string,
  remoteOrLocalUri: string,
  opts: { source: LibrarySource; tags?: string[] },
): Promise<LibraryEntry | null> {
  await ensureLoaded();
  const key = norm(phrase);
  if (!key) return null;
  try {
    const ext = remoteOrLocalUri.includes(".png") || remoteOrLocalUri.startsWith("data:image/png") ? "png" : "jpg";
    const dest = `${DIR}${hash(key)}.${ext}`;

    if (remoteOrLocalUri.startsWith("data:")) {
      await FileSystem.writeAsStringAsync(dest, remoteOrLocalUri.split(",")[1] ?? "", { encoding: FileSystem.EncodingType.Base64 });
    } else if (remoteOrLocalUri.startsWith("file:")) {
      await FileSystem.copyAsync({ from: remoteOrLocalUri, to: dest });
    } else {
      await FileSystem.downloadAsync(remoteOrLocalUri, dest);
    }

    const entry: LibraryEntry = {
      key,
      uri: dest,
      source: opts.source,
      tags: [...new Set([key, ...(opts.tags ?? [])])],
      savedAt: Date.now(),
    };
    // index under the phrase and each tag (so "blue cat" also answers "cat")
    for (const t of entry.tags) if (!index[t]) index[t] = entry;
    index[key] = entry;

    // keep the library from growing without bound
    const keys = Object.keys(index);
    if (keys.length > 6000) delete index[keys[0]];

    persist();
    return entry;
  } catch {
    return null;
  }
}

/**
 * Fill the library from the curated seed list (see librarySeed.ts). Runs in the
 * background, throttled, and picks up where it left off — safe to call on every
 * app start. Each word is fetched once from ARASAAC and saved with a white
 * background, so later it comes straight from the local library.
 */
let prewarming = false;
export async function prewarmLibrary(max = 400): Promise<void> {
  if (prewarming) return;
  prewarming = true;
  await ensureLoaded();
  try {
    const { SEED_LIST } = await import("./librarySeed");
    let done = 0;
    for (const word of SEED_LIST) {
      if (done >= max) break;
      const k = norm(word);
      if (!k || index[k]) continue;
      const remote = await arasaacFirst(word);
      if (remote) {
        await saveImage(word, remote, { source: "arasaac", tags: [k] });
        done++;
        await new Promise((r) => setTimeout(r, 120)); // be gentle on the free API
      }
    }
  } catch {
    /* ignore — the library still seeds live on lookup */
  } finally {
    prewarming = false;
  }
}

export async function libraryCount(): Promise<number> {
  await ensureLoaded();
  return new Set(Object.values(index).map((e) => e.uri)).size;
}

export async function libraryEntries(): Promise<LibraryEntry[]> {
  await ensureLoaded();
  const seen = new Set<string>();
  const out: LibraryEntry[] = [];
  for (const e of Object.values(index)) {
    if (seen.has(e.uri)) continue;
    seen.add(e.uri);
    out.push(e);
  }
  return out.sort((a, b) => b.savedAt - a.savedAt);
}

export async function clearLibrary() {
  await ensureLoaded();
  try {
    await FileSystem.deleteAsync(DIR, { idempotent: true });
  } catch {
    /* ignore */
  }
  index = {};
  persist();
}
