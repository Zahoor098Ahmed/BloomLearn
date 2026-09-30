import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseSceneGraph } from "./sentenceScene";

/**
 * Learning progress, built up as the child uses Picture Talk. Every settled
 * sentence is parsed on the device to count the things, colours and positions
 * it used. Stored only on this device.
 */

export const POSITIONS = ["under", "on", "above", "behind", "in front of", "beside", "inside"] as const;
export const LEARN_COLORS = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "black", "white"] as const;

export interface ProgressData {
  sentences: number;
  voiceSentences: number;
  aiPictures: number;
  /** "YYYY-MM-DD" -> sentences that day */
  byDay: Record<string, number>;
  /** things (cat, table…) -> times used */
  words: Record<string, number>;
  /** canonical position -> times used */
  positions: Record<string, number>;
  /** colour -> times used */
  colors: Record<string, number>;
}

const STORE = "bloomlearn_progress";

const EMPTY: ProgressData = { sentences: 0, voiceSentences: 0, aiPictures: 0, byDay: {}, words: {}, positions: {}, colors: {} };

let data: ProgressData = structuredCloneSafe(EMPTY);
let loaded = false;

function structuredCloneSafe(p: ProgressData): ProgressData {
  return JSON.parse(JSON.stringify(p));
}

async function ensureLoaded() {
  if (loaded) return;
  try {
    const raw = await AsyncStorage.getItem(STORE);
    data = raw ? { ...structuredCloneSafe(EMPTY), ...JSON.parse(raw) } : structuredCloneSafe(EMPTY);
  } catch {
    data = structuredCloneSafe(EMPTY);
  }
  loaded = true;
}

function persist() {
  AsyncStorage.setItem(STORE, JSON.stringify(data)).catch(() => {});
}

export function dayKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function bump(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

export async function getProgress(): Promise<ProgressData> {
  await ensureLoaded();
  return data;
}

/** Count one finished sentence and what it contained. */
export async function recordSentence(text: string, viaVoice: boolean): Promise<void> {
  const clean = text.trim();
  if (clean.length < 3) return;
  await ensureLoaded();
  data.sentences += 1;
  if (viaVoice) data.voiceSentences += 1;
  bump(data.byDay, dayKey());

  const g = parseSceneGraph(clean);
  if (g.subject) bump(data.words, g.subject.type);
  if (g.reference) bump(data.words, g.reference.type);
  if (g.relation && (POSITIONS as readonly string[]).includes(g.relation)) bump(data.positions, g.relation);
  const lower = ` ${clean.toLowerCase()} `;
  for (const c of LEARN_COLORS) if (lower.includes(` ${c} `)) bump(data.colors, c);
  persist();
}

export async function recordAiPicture(): Promise<void> {
  await ensureLoaded();
  data.aiPictures += 1;
  persist();
}

export async function clearProgress(): Promise<void> {
  data = structuredCloneSafe(EMPTY);
  loaded = true;
  try {
    await AsyncStorage.removeItem(STORE);
  } catch {
    /* ignore */
  }
}

/** Days in a row (ending today or yesterday) with at least one sentence. */
export function streak(p: ProgressData): number {
  const d = new Date();
  if (!p.byDay[dayKey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (p.byDay[dayKey(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Sentences for the last 7 days, oldest first. */
export function lastWeek(p: ProgressData): { key: string; date: Date; count: number }[] {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    out.push({ key, date: d, count: p.byDay[key] ?? 0 });
  }
  return out;
}

export function todayCount(p: ProgressData): number {
  return p.byDay[dayKey()] ?? 0;
}

/** One level per 10 sentences. */
export function level(p: ProgressData): { level: number; into: number; need: number } {
  return { level: Math.floor(p.sentences / 10) + 1, into: p.sentences % 10, need: 10 };
}

export interface Badge {
  id: string;
  emoji: string;
  earned: boolean;
}

export function badges(p: ProgressData): Badge[] {
  const s = streak(p);
  return [
    { id: "first", emoji: "🌱", earned: p.sentences >= 1 },
    { id: "ten", emoji: "💬", earned: p.sentences >= 10 },
    { id: "fifty", emoji: "📚", earned: p.sentences >= 50 },
    { id: "voice", emoji: "🎙️", earned: p.voiceSentences >= 5 },
    { id: "artist", emoji: "🎨", earned: p.aiPictures >= 1 },
    { id: "streak3", emoji: "🔥", earned: s >= 3 },
    { id: "positions", emoji: "🧭", earned: POSITIONS.every((x) => p.positions[x]) },
    { id: "colors", emoji: "🌈", earned: LEARN_COLORS.filter((c) => p.colors[c]).length >= 5 },
  ];
}
