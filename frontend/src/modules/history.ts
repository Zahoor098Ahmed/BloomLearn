import AsyncStorage from "@react-native-async-storage/async-storage";

/** Recently spoken or typed sentences, newest first. Stored on this device. */

export interface HistoryItem {
  text: string;
  at: number;
}

const STORE_PREFIX = "bloomlearn_history";
const MAX = 50;

let activeChildId: string | null = null;

function getStoreKey(): string {
  return activeChildId ? `${STORE_PREFIX}_${activeChildId}` : STORE_PREFIX;
}

export async function switchChildForHistory(childId: string | null): Promise<void> {
  activeChildId = childId;
  loaded = false;
  items = [];
  await ensureLoaded();
}

let items: HistoryItem[] = [];
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  try {
    const raw = await AsyncStorage.getItem(getStoreKey());
    items = raw ? JSON.parse(raw) : [];
  } catch {
    items = [];
  }
  loaded = true;
}

function persist() {
  AsyncStorage.setItem(getStoreKey(), JSON.stringify(items)).catch(() => {});
}

export async function getHistory(): Promise<HistoryItem[]> {
  await ensureLoaded();
  return items;
}

/** Add a sentence to the top; an earlier copy of the same sentence moves up. */
export async function addHistory(text: string): Promise<void> {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length < 2) return;
  await ensureLoaded();
  const lower = clean.toLowerCase();
  items = [{ text: clean, at: Date.now() }, ...items.filter((i) => i.text.toLowerCase() !== lower)].slice(0, MAX);
  persist();
}

export async function removeHistory(text: string): Promise<void> {
  await ensureLoaded();
  items = items.filter((i) => i.text !== text);
  persist();
}

export async function clearHistory(): Promise<void> {
  items = [];
  loaded = true;
  try {
    await AsyncStorage.removeItem(getStoreKey());
  } catch {
    /* ignore */
  }
}
