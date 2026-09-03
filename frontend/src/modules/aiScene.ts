import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SceneGraph } from "../types";

// Scene images always go straight to Pollinations (free, no key, no CORS
// issues for <Image>). The backend proxy is not used here — a LAN proxy URL
// simply fails on the web build and on phones off that network.
const POLLINATIONS = "https://image.pollinations.ai/prompt";

/**
 * Free AI-image fallback for the Hybrid Smart Sentence-to-Scene engine.
 *
 * Uses Pollinations.ai — no API key, no sign-up. A stable seed is derived from
 * the sentence so the same sentence always returns the same picture (visual
 * consistency matters for autistic learners). The instant SVG composer stays
 * the always-there base; this only fills gaps the on-device engine can't draw.
 */

const STYLE =
  "flat matte children's book illustration, one clear centred subject, pure plain white background only, " +
  "bold simple outlines, no text, no watermark, consistent educational style";

/**
 * Turn the parsed scene graph into a precise prompt so the COLOUR lands on the
 * subject, not the background. "blue dog" -> a dog whose fur is blue, on white.
 */
function promptFromGraph(g: SceneGraph): string {
  const s = g.subject;
  if (!s) return cleanSentence(g.raw);
  const parts: string[] = [];
  const count = s.count > 1 ? `${s.count} ` : "a ";
  const size = s.size && s.size !== "normal" ? `${s.size} ` : "";
  parts.push(`${count}${size}${s.type}`);
  if (s.color) parts.push(`the ${s.type} is entirely ${s.color} coloured, ${s.color} ${s.type}`);
  if (s.action) parts.push(s.action);
  if (g.relation && g.reference) parts.push(`${g.relation} a ${g.reference.type}`);
  return parts.join(", ");
}

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
export function sceneImageUrl(sentence: string, graph?: SceneGraph): string {
  const clean = cleanSentence(sentence);
  const seed = hash(clean) % 1_000_000;
  const subject = graph ? promptFromGraph(graph) : clean;
  const prompt = encodeURIComponent(`${subject}. ${STYLE}`);
  return `${POLLINATIONS}/${prompt}?width=768&height=768&nologo=true&seed=${seed}&model=flux`;
}

/**
 * Build an image URL from an already-composed prompt and an explicit seed.
 * Used by the conversational scene builder, where the seed stays fixed for the
 * whole session so it is the same character while the pose / parts change.
 */
export function composeSceneUrl(prompt: string, seed: number): string {
  const p = encodeURIComponent(`${prompt.trim()}. ${STYLE}`);
  return `${POLLINATIONS}/${p}?width=768&height=768&nologo=true&seed=${seed % 1_000_000}&model=flux`;
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
