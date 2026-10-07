import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

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

const PRIVATE_IP = /^(10\.\d+|192\.168|172\.(1[6-9]|2\d|3[01]))\.\d+\.\d+$/;

/**
 * While developing, the backend runs on the same computer as the Expo dev
 * server. Wi-Fi hands that computer a new LAN IP now and then, which silently
 * breaks a hard-coded "http://192.168.1.9:8787". So a LAN backend URL follows
 * the dev server's current IP (port and path kept). Release builds and
 * public URLs are left untouched.
 */
function followDevHost(url: string): string {
  if (!__DEV__ || !url) return url;
  const devHost = (Constants.expoConfig?.hostUri ?? "").split(":")[0];
  if (!PRIVATE_IP.test(devHost)) return url; // tunnel / web / unknown: keep as is
  const m = url.match(/^(https?:\/\/)([^/:]+)(.*)$/);
  if (!m || !PRIVATE_IP.test(m[2])) return url;
  return `${m[1]}${devHost}${m[3]}`;
}

/** The value in use: the in-app one if set, else the build-time one. */
export function getKey(name: ApiKeyName): string {
  const value = (saved[name] || ENV[name] || "").trim();
  return name === "proxyUrl" ? followDevHost(value) : value;
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
