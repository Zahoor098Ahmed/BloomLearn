import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppSettings } from "../types";

const SETTINGS_KEY = "bloomlearn_settings";

const DEFAULT_SETTINGS: AppSettings = {
  language: "en-US",
  soundEnabled: true,
  autoSpeak: true,
  speechRate: 0.88,
  onboarded: false,
  saveHistory: true,
};

const SUPPORTED_LANGUAGES: AppSettings["language"][] = ["en-US", "ar-SA"];

export function defaultSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS };
}

let settingsCache: AppSettings = DEFAULT_SETTINGS;
let hydrated = false;

export async function hydrateStorage(): Promise<void> {
  try {
    const rawSettings = await AsyncStorage.getItem(SETTINGS_KEY);
    settingsCache = rawSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) } : DEFAULT_SETTINGS;
    // only English and Arabic are offered; anything else falls back to English
    if (!SUPPORTED_LANGUAGES.includes(settingsCache.language)) settingsCache = { ...settingsCache, language: "en-US" };
  } catch {
    settingsCache = DEFAULT_SETTINGS;
  }
  hydrated = true;
}

export function isHydrated(): boolean {
  return hydrated;
}

export function loadSettings(): AppSettings {
  return settingsCache;
}

export function saveSettings(settings: AppSettings): void {
  settingsCache = settings;
  AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
}
