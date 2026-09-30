import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Keys and endpoints for the optional online engines, editable in Settings.
 * A value saved in-app wins; otherwise the EXPO_PUBLIC_* build-time env var is
 * used. Everything is stored only on this device.
 */

export interface ApiKeys {
  /** OpenAI — sharper AI pictures + Whisper speech-to-text on phones. */
  openai: string;
  /** Groq — free LLM that understands free speech in Keep-talking mode. */
  groq: string;
  /** Pollinations — free AI drawing engine. */
  pollinations: string;
  /** BloomLearn backend base URL (holds the OpenAI key server-side). */
  proxyUrl: string;
  /** Shared secret for the backend (APP_TOKEN). */
  proxyToken: string;
}

export type ApiKeyName = keyof ApiKeys;

const STORE = "bloomlearn_api_keys";

const ENV: ApiKeys = {
  openai: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "",
  groq: process.env.EXPO_PUBLIC_GROQ_API_KEY ?? "",
  pollinations: process.env.EXPO_PUBLIC_POLLINATIONS_TOKEN ?? "",
  proxyUrl: process.env.EXPO_PUBLIC_AI_PROXY_URL ?? "",
  proxyToken: process.env.EXPO_PUBLIC_AI_PROXY_TOKEN ?? "",
};

const EMPTY: ApiKeys = { openai: "", groq: "", pollinations: "", proxyUrl: "", proxyToken: "" };

let saved: ApiKeys = { ...EMPTY };
let loaded = false;

export async function loadApiKeys(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORE);
    saved = raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    saved = { ...EMPTY };
  }
  loaded = true;
}

export function apiKeysLoaded(): boolean {
  return loaded;
}

/** The value in use: the in-app one if set, else the build-time one. */
export function getKey(name: ApiKeyName): string {
  return (saved[name] || ENV[name] || "").trim();
}

/** Only what the user typed in Settings (not the build-time fallback). */
export function getSavedKey(name: ApiKeyName): string {
  return saved[name];
}

/** true when the value comes from the build (.env), not from Settings. */
export function isFromBuild(name: ApiKeyName): boolean {
  return !saved[name] && !!ENV[name];
}

export async function setKey(name: ApiKeyName, value: string): Promise<void> {
  saved = { ...saved, [name]: value.trim() };
  try {
    await AsyncStorage.setItem(STORE, JSON.stringify(saved));
  } catch {
    /* ignore */
  }
}

export async function clearApiKeys(): Promise<void> {
  saved = { ...EMPTY };
  try {
    await AsyncStorage.removeItem(STORE);
  } catch {
    /* ignore */
  }
}

/** Show only the start and end of a secret, e.g. "sk-a…9xQ". */
export function maskKey(value: string): string {
  if (!value) return "";
  if (value.length <= 8) return "•".repeat(value.length);
  return `${value.slice(0, 4)}…${value.slice(-3)}`;
}
