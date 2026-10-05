import AsyncStorage from "@react-native-async-storage/async-storage";
import { getKey } from "./apiKeys";

/**
 * AI picture generation and speech-to-text for Picture Talk.
 *
 * Pure `fetch` — no native module, so it works in every build. Requests go to
 * the BloomLearn backend when a backend URL is set in Settings (the OpenAI key
 * then stays on the server), otherwise straight to OpenAI with the key saved in
 * Settings (or the EXPO_PUBLIC_OPENAI_API_KEY build-time env var).
 *
 * Generated images are cached by prompt so repeat sentences are instant and
 * work offline afterwards.
 */

const IMG_STORE = "bloomlearn_ai_image_cache";

/** Resolve an endpoint + auth headers for a given OpenAI path. */
function endpointFor(path: string): { url: string; headers: Record<string, string> } {
  const proxyUrl = getKey("proxyUrl");
  if (proxyUrl) {
    const headers: Record<string, string> = {};
    const token = getKey("proxyToken");
    if (token) headers.Authorization = `Bearer ${token}`;
    return { url: `${proxyUrl.replace(/\/$/, "")}${path}`, headers };
  }
  return { url: `https://api.openai.com/v1${path}`, headers: { Authorization: `Bearer ${getKey("openai")}` } };
}

export const SENSORY_STYLE_GUIDE =
  "Flat matte children's book illustration. Single clear centred subject. " +
  "Plain white background, no scene clutter. Soft calm colours, gentle outlines. " +
  "No gloss, no reflections, no 3D shine, no text. Consistent simple style suitable " +
  "for a child with autism.";

let cache: Record<string, string> = {};
let cacheLoaded = false;

async function ensureCache() {
  if (cacheLoaded) return;
  try {
    const raw = await AsyncStorage.getItem(IMG_STORE);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  cacheLoaded = true;
}

/** Forget every cached AI picture. */
export async function clearAiCache(): Promise<void> {
  cache = {};
  cacheLoaded = true;
  try {
    await AsyncStorage.removeItem(IMG_STORE);
  } catch {
    /* ignore */
  }
}

/** true when AI pictures and speech-to-text can run (backend URL or OpenAI key). */
export function isAiConfigured(): boolean {
  return !!getKey("proxyUrl") || !!getKey("openai");
}

export interface TranscriptResult {
  text?: string;
  error?: string;
  /** true when speech-to-text simply isn't set up — the caller should fall back to the keyboard, not show an error. */
  unavailable?: boolean;
}

/**
 * Speech-to-text via OpenAI Whisper. Records are made with expo-audio (already
 * a working native dep); this is a plain multipart POST — no extra native code.
 */
export async function transcribeAudio(uri: string, langHint?: string): Promise<TranscriptResult> {
  if (!isAiConfigured()) {
    return { unavailable: true, error: "Voice typing isn't set up. Use the keyboard microphone for now." };
  }
  try {
    const form = new FormData();
    form.append("file", { uri, name: "speech.m4a", type: "audio/m4a" } as unknown as Blob);
    form.append("model", "whisper-1");
    if (langHint) form.append("language", langHint);
    form.append("prompt", "A short everyday sentence describing a picture, e.g. The black cat is under the table.");

    const { url, headers } = endpointFor("/audio/transcriptions");
    const res = await fetch(url, { method: "POST", headers, body: form });
    if (!res.ok) {
      // 503 = the backend has no OpenAI key -> not an error the user can fix; fall back to keyboard.
      if (res.status === 503) return { unavailable: true, error: "Voice typing isn't set up on the server. Use the keyboard microphone for now." };
      if (res.status === 401) return { error: "The OpenAI key was rejected. Check it in Settings." };
      if (res.status === 429) return { error: "OpenAI has no credit or hit a rate limit." };
      return { error: `Speech service error (${res.status}).` };
    }
    const json = (await res.json()) as { text?: string };
    const text = (json.text ?? "").trim().replace(/[.。!?]+$/, "");
    if (!text) return { error: "Didn't catch that — try again or type the word." };
    return { text };
  } catch {
    return { error: "Could not reach the speech service. Check the internet connection." };
  }
}

/**
 * Style for story problems ("Sara has 5 apples. She gives 2 apples to Ali."):
 * a warm scene with the characters, instead of one object on white.
 */
export const STORY_STYLE_GUIDE =
  "Warm hand-painted children's storybook illustration of this scene. Friendly, expressive children, " +
  "soft natural colours, simple outdoor garden background. Show exactly the number of objects the story says, " +
  "each one clearly visible and easy to count. No text, no numbers, no letters.";

export type ImageStyle = "card" | "story";

function promptFor(sentence: string, style: ImageStyle = "card"): string {
  return `${sentence.trim()}. ${style === "story" ? STORY_STYLE_GUIDE : SENSORY_STYLE_GUIDE}`;
}

function hashNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h >>> 0;
}
function hash(s: string): string {
  return String(hashNum(s));
}

export interface AiImageResult {
  dataUri?: string;
  error?: string;
  cached?: boolean;
}

/** Generate (or fetch from cache) an illustration for a sentence. */
export async function generateSentenceImage(
  sentence: string,
  force = false,
  style: ImageStyle = "card",
  rawPrompt?: string
): Promise<AiImageResult> {
  const clean = sentence.trim();
  if (!clean) return { error: "Type or say a sentence first." };

  await ensureCache();
  const effectivePrompt = rawPrompt || promptFor(clean, style);
  const key = hash(effectivePrompt);
  if (!force && cache[key]) return { dataUri: cache[key], cached: true };

  if (!isAiConfigured()) return { error: "AI is not connected yet. Add an OpenAI key to turn on real pictures." };

  try {
    const { url, headers } = endpointFor("/images/generations");
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      // "story" tells the BloomLearn server not to add its own plain-card style
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: effectivePrompt,
        style: rawPrompt || style === "story" ? "story" : "card",
        size: "1024x1024",
        n: 1,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      if (res.status === 401) return { error: "The OpenAI key was rejected. Check the key." };
      if (res.status === 429) return { error: "OpenAI rate limit or no credit on the key." };
      return { error: `Image service error (${res.status}). ${detail.slice(0, 120)}` };
    }

    const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
    const item = json.data?.[0];
    let dataUri: string | undefined;
    if (item?.b64_json) dataUri = `data:image/png;base64,${item.b64_json}`;
    else if (item?.url) dataUri = item.url;

    if (!dataUri) return { error: "The image service returned no picture." };

    cache[key] = dataUri;
    // Keep only the most recent entries so AsyncStorage stays small.
    const keys = Object.keys(cache);
    if (keys.length > 12) delete cache[keys[0]];
    AsyncStorage.setItem(IMG_STORE, JSON.stringify(cache)).catch(() => {});
    return { dataUri };
  } catch {
    return { error: "Could not reach the image service. Check the internet connection." };
  }
}

export async function cachedImageFor(sentence: string): Promise<string | undefined> {
  await ensureCache();
  return cache[hash(promptFor(sentence.trim()))];
}
