import AsyncStorage from "@react-native-async-storage/async-storage";
import { AI_PROXY_URL } from "./aiImage";

/**
 * Free AI-image fallback for the Hybrid Smart Sentence-to-Scene engine.
 *
 * Uses Pollinations.ai — no API key, no sign-up. A stable seed is derived from
 * the sentence so the same sentence always returns the same picture (visual
 * consistency matters for autistic learners). The instant SVG composer stays
 * the always-there base; this only fills gaps the on-device engine can't draw.
 */

const STYLE =
  "flat matte children's book illustration, single clear centred subject, plain white background, " +
  "soft calm colours, bold simple outlines, no text, no watermark, consistent educational style";

const CACHE_KEY = "kiddocare_scene_ai_cache";
let cache: Record<string, string> = {};
let loaded = false;

async function ensureCache() {
  if (loaded) return;
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  loaded = true;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

function cleanSentence(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Build the image URL for a sentence. Returns instantly — no request is made
 * here; the URL is loaded by <Image> and cached by the OS.
 */
export function sceneImageUrl(sentence: string): string {
  const clean = cleanSentence(sentence);
  const seed = hash(clean) % 1_000_000;
  const prompt = encodeURIComponent(`${clean}. ${STYLE}`);
  // Optional self-hosted proxy can front Pollinations for rate-limit control.
  const base = AI_PROXY_URL ? `${AI_PROXY_URL.replace(/\/$/, "")}/scene` : "https://image.pollinations.ai/prompt";
  return `${base}/${prompt}?width=768&height=768&nologo=true&seed=${seed}&model=flux`;
}

export interface SavedScene {
  url: string;
  cached: boolean;
}

/** Return a cached local copy if we saved one before, else the live URL. */
export async function resolveSceneImage(sentence: string): Promise<SavedScene> {
  await ensureCache();
  const key = String(hash(cleanSentence(sentence)));
  if (cache[key]) return { url: cache[key], cached: true };
  return { url: sceneImageUrl(sentence), cached: false };
}

/** Download the generated image into permanent local storage for offline use. */
export async function saveSceneImage(sentence: string): Promise<string | null> {
  await ensureCache();
  const FileSystem = await import("expo-file-system/legacy");
  const key = String(hash(cleanSentence(sentence)));
  if (cache[key]) return cache[key];
  try {
    const dir = `${FileSystem.documentDirectory}scenes/`;
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const dest = `${dir}${key}.jpg`;
    const { uri } = await FileSystem.downloadAsync(sceneImageUrl(sentence), dest);
    cache[key] = uri;
    const keys = Object.keys(cache);
    if (keys.length > 30) delete cache[keys[0]];
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache)).catch(() => {});
    return uri;
  } catch {
    return null;
  }
}
