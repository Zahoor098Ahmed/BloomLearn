import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
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
    const fields: Record<string, string> = {
      model: "whisper-1",
      prompt: "A short everyday sentence describing a picture, e.g. The black cat is under the table.",
    };
    if (langHint) fields.language = langHint;
    const { url, headers } = endpointFor("/audio/transcriptions");
    const { status, body } = await uploadRecording(url, headers, uri, fields);

    if (status < 200 || status >= 300) {
      // 503 = the backend has no OpenAI key -> not an error the user can fix; fall back to keyboard.
      if (status === 503) return { unavailable: true, error: "Voice typing isn't set up on the server. Use the keyboard microphone for now." };
      if (status === 401) return { error: "The OpenAI key was rejected. Check it in Settings." };
      if (status === 429) return { error: "OpenAI has no credit or hit a rate limit." };
      return { error: `Speech service error (${status}).` };
    }
    const json = JSON.parse(body || "{}") as { text?: string };
    const text = (json.text ?? "").trim().replace(/[.。!?]+$/, "");
    if (!text) return { error: "Didn't catch that — try again or type the word." };
    return { text };
  } catch (e) {
    const server = getKey("proxyUrl");
    if (!server) return { error: "Could not reach the speech service. Check the internet connection." };
    // "Network request failed" means either the server is unreachable or the
    // recording could not be uploaded — a quick health check tells them apart
    const alive = await serverAlive(server);
    console.warn(`[voice] upload failed (server ${alive ? "reachable" : "unreachable"}):`, e, uri);
    return {
      error: alive
        ? "The recording could not be sent. Please try again, or type the sentence."
        : `Could not reach the BloomLearn server (${server}). Is it running, and is this phone on the same Wi-Fi?`,
    };
  }
}

/**
 * Send the recorded clip as multipart/form-data. On phones the file is
 * streamed straight from disk by expo-file-system: Expo's fetch rejects React
 * Native's `{ uri, name, type }` FormData parts ("Unsupported FormDataPart
 * implementation"). The browser keeps the plain fetch + FormData path.
 */
async function uploadRecording(
  url: string,
  headers: Record<string, string>,
  uri: string,
  fields: Record<string, string>,
): Promise<{ status: number; body: string }> {
  if (Platform.OS !== "web") {
    const res = await FileSystem.uploadAsync(url, uri, {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "file",
      mimeType: "audio/m4a",
      parameters: fields,
      headers,
    });
    return { status: res.status, body: res.body };
  }
  const form = new FormData();
  form.append("file", await (await fetch(uri)).blob(), "speech.webm");
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  const res = await fetch(url, { method: "POST", headers, body: form });
  return { status: res.status, body: await res.text() };
}

async function serverAlive(base: string): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/health`, { signal: ctrl.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
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
