import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

/**
 * Internet image sources for the admin "add a picture" flow.
 *
 *  - ARASAAC  — free, no key, 30k+ AAC pictograms (clean, single subject,
 *               plain background). Best fit for a communication tile.
 *  - Pixabay  — free key required, real photos, safesearch on.
 *
 * Chosen images are downloaded into the app's document directory so the board
 * keeps working offline and the file ships in a backup.
 */

const PIXABAY_KEY_STORE = "kiddocare_pixabay_key";
const IMG_DIR = `${FileSystem.documentDirectory}tiles/`;

let pixabayKey: string | null = null;

export async function loadPixabayKey() {
  try {
    pixabayKey = await AsyncStorage.getItem(PIXABAY_KEY_STORE);
  } catch {
    pixabayKey = null;
  }
}
export async function setPixabayKey(key: string) {
  pixabayKey = key.trim() || null;
  try {
    if (pixabayKey) await AsyncStorage.setItem(PIXABAY_KEY_STORE, pixabayKey);
    else await AsyncStorage.removeItem(PIXABAY_KEY_STORE);
  } catch {
    /* ignore */
  }
}
export function hasPixabayKey() {
  return !!pixabayKey;
}

export type ImageSource = "arasaac" | "pixabay";

export interface ImageHit {
  id: string;
  thumb: string;
  full: string;
  source: ImageSource;
}

async function searchArasaac(term: string): Promise<ImageHit[]> {
  const q = encodeURIComponent(term.trim());
  const res = await fetch(`https://api.arasaac.org/api/pictograms/en/search/${q}`);
  if (!res.ok) return [];
  const json = (await res.json()) as { _id: number }[];
  return json.slice(0, 24).map((p) => ({
    id: `ara_${p._id}`,
    thumb: `https://static.arasaac.org/pictograms/${p._id}/${p._id}_300.png`,
    full: `https://static.arasaac.org/pictograms/${p._id}/${p._id}_500.png`,
    source: "arasaac" as const,
  }));
}

async function searchPixabay(term: string): Promise<ImageHit[]> {
  if (!pixabayKey) return [];
  const q = encodeURIComponent(term.trim());
  const res = await fetch(
    `https://pixabay.com/api/?key=${pixabayKey}&q=${q}&image_type=photo&safesearch=true&per_page=24&orientation=horizontal`,
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { hits?: { id: number; previewURL: string; webformatURL: string }[] };
  return (json.hits ?? []).map((h) => ({
    id: `pix_${h.id}`,
    thumb: h.previewURL,
    full: h.webformatURL,
    source: "pixabay" as const,
  }));
}

export async function searchImages(term: string, source: ImageSource): Promise<{ hits: ImageHit[]; error?: string }> {
  if (!term.trim()) return { hits: [] };
  try {
    if (source === "pixabay" && !pixabayKey) return { hits: [], error: "Add a free Pixabay API key in Settings first." };
    const hits = source === "arasaac" ? await searchArasaac(term) : await searchPixabay(term);
    if (hits.length === 0) return { hits: [], error: "No pictures found. Try a simpler word." };
    return { hits };
  } catch {
    return { hits: [], error: "Could not reach the image service. Check the internet connection." };
  }
}

/** Download a chosen image into permanent local storage; returns its file uri. */
export async function downloadTileImage(url: string, wordId: string): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(IMG_DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true });
    const ext = url.includes(".png") ? "png" : "jpg";
    const dest = `${IMG_DIR}${wordId}.${ext}`;
    await FileSystem.deleteAsync(dest, { idempotent: true });
    const { uri } = await FileSystem.downloadAsync(url, dest);
    return uri;
  } catch {
    return null;
  }
}

/** Persist an AI-generated image (data: URI or remote URL) into tile storage. */
export async function saveGeneratedImage(source: string, wordId: string): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(IMG_DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true });
    const dest = `${IMG_DIR}${wordId}.png`;
    await FileSystem.deleteAsync(dest, { idempotent: true });
    if (source.startsWith("data:")) {
      const base64 = source.split(",")[1] ?? "";
      await FileSystem.writeAsStringAsync(dest, base64, { encoding: FileSystem.EncodingType.Base64 });
    } else {
      await FileSystem.downloadAsync(source, dest);
    }
    return dest;
  } catch {
    return null;
  }
}

/** Copy a local picked/photographed image into permanent tile storage. */
export async function saveLocalTileImage(srcUri: string, wordId: string): Promise<string | null> {
  try {
    const info = await FileSystem.getInfoAsync(IMG_DIR);
    if (!info.exists) await FileSystem.makeDirectoryAsync(IMG_DIR, { intermediates: true });
    const ext = srcUri.split(".").pop()?.split("?")[0] || "jpg";
    const dest = `${IMG_DIR}${wordId}.${ext}`;
    await FileSystem.deleteAsync(dest, { idempotent: true });
    await FileSystem.copyAsync({ from: srcUri, to: dest });
    return dest;
  } catch {
    return null;
  }
}
