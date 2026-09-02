import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChildProfile, AppSettings, ContentTag } from "../types";

const CHILDREN_KEY = "kiddocare_children";
const SETTINGS_KEY = "kiddocare_settings";
const USAGE_KEY = "kiddocare_usage";

const DEFAULT_SETTINGS: AppSettings = {
  language: "en-US",
  fontSize: "large",
  highContrast: false,
  soundEnabled: true,
  reduceMotion: false,
  languageSelected: false,
  hapticsEnabled: true,
  speechRate: 0.9,
  boardColumns: 3,
  kioskMode: false,
};

export const defaultTags: ContentTag[] = ["colors", "numbers", "shapes", "animals", "music", "stories", "art", "nature"];

export interface UsageData {
  /** Lifetime tap counts per word, used for the Vocabulary "most used words" ranking. */
  wordTotals: Record<string, number>;
  /** Word taps bucketed by day-of-week (0=Sun..6=Sat), rolling week-over-week. */
  wordsByDay: [number, number, number, number, number, number, number];
  /** Last recorded schedule-completion percentage per day-of-week. */
  scheduleByDay: [number, number, number, number, number, number, number];
  lastPlayedDate: string | null;
  gameStreak: number;
}

const DEFAULT_USAGE: UsageData = {
  wordTotals: {},
  wordsByDay: [0, 0, 0, 0, 0, 0, 0],
  scheduleByDay: [0, 0, 0, 0, 0, 0, 0],
  lastPlayedDate: null,
  gameStreak: 0,
};

let childrenCache: ChildProfile[] = [];
let settingsCache: AppSettings = DEFAULT_SETTINGS;
let usageCache: Record<string, UsageData> = {};
let hydrated = false;

export async function hydrateStorage(): Promise<void> {
  try {
    const [rawChildren, rawSettings, rawUsage] = await Promise.all([
      AsyncStorage.getItem(CHILDREN_KEY),
      AsyncStorage.getItem(SETTINGS_KEY),
      AsyncStorage.getItem(USAGE_KEY),
    ]);
    childrenCache = rawChildren ? JSON.parse(rawChildren) : [];
    settingsCache = rawSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) } : DEFAULT_SETTINGS;
    usageCache = rawUsage ? JSON.parse(rawUsage) : {};
  } catch {
    childrenCache = [];
    settingsCache = DEFAULT_SETTINGS;
    usageCache = {};
  }
  hydrated = true;
}

export function isHydrated(): boolean {
  return hydrated;
}

export function loadChildren(): ChildProfile[] {
  return childrenCache;
}

export function saveChildren(children: ChildProfile[]): void {
  childrenCache = children;
  AsyncStorage.setItem(CHILDREN_KEY, JSON.stringify(children)).catch(() => {});
}

export function addChild(child: ChildProfile): void {
  saveChildren([...childrenCache, child]);
}

export function updateChild(updated: ChildProfile): void {
  const idx = childrenCache.findIndex((c) => c.id === updated.id);
  if (idx < 0) return;
  const next = [...childrenCache];
  next[idx] = updated;
  saveChildren(next);
}

export function deleteChild(id: string): void {
  saveChildren(childrenCache.filter((c) => c.id !== id));
}

export function loadSettings(): AppSettings {
  return settingsCache;
}

export function saveSettings(settings: AppSettings): void {
  settingsCache = settings;
  AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
}

function saveUsage(): void {
  AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usageCache)).catch(() => {});
}

export function getUsage(childId: string): UsageData {
  return usageCache[childId] ?? DEFAULT_USAGE;
}

export function recordWordUsage(childId: string, word: string): void {
  const current = usageCache[childId] ?? { ...DEFAULT_USAGE, wordTotals: {}, wordsByDay: [...DEFAULT_USAGE.wordsByDay], scheduleByDay: [...DEFAULT_USAGE.scheduleByDay] };
  const day = new Date().getDay();
  const wordsByDay = [...current.wordsByDay] as UsageData["wordsByDay"];
  wordsByDay[day] += 1;
  usageCache[childId] = {
    ...current,
    wordTotals: { ...current.wordTotals, [word]: (current.wordTotals[word] ?? 0) + 1 },
    wordsByDay,
  };
  saveUsage();
}

export function recordScheduleAdherence(childId: string, percent: number): void {
  const current = usageCache[childId] ?? { ...DEFAULT_USAGE, wordTotals: {}, wordsByDay: [...DEFAULT_USAGE.wordsByDay], scheduleByDay: [...DEFAULT_USAGE.scheduleByDay] };
  const day = new Date().getDay();
  const scheduleByDay = [...current.scheduleByDay] as UsageData["scheduleByDay"];
  scheduleByDay[day] = Math.round(percent);
  usageCache[childId] = { ...current, scheduleByDay };
  saveUsage();
}

export function recordGamePlayed(childId: string): void {
  const current = usageCache[childId] ?? { ...DEFAULT_USAGE, wordTotals: {}, wordsByDay: [...DEFAULT_USAGE.wordsByDay], scheduleByDay: [...DEFAULT_USAGE.scheduleByDay] };
  const todayStr = new Date().toISOString().slice(0, 10);
  if (current.lastPlayedDate === todayStr) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = current.lastPlayedDate === yesterday.toISOString().slice(0, 10);

  usageCache[childId] = {
    ...current,
    lastPlayedDate: todayStr,
    gameStreak: wasYesterday ? current.gameStreak + 1 : 1,
  };
  saveUsage();
}
