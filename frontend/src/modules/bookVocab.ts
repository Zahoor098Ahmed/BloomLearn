import { Image } from "react-native";
import { BOOK_VOCAB_ASSETS } from "./bookVocab.generated";

/**
 * Real picture-book vocabulary (Global Digital Library, CC BY / CC BY-SA),
 * extracted by content-pipeline/ and bundled into the app. Checked first, so
 * a word that matches a real book illustration shows THAT picture instead of
 * an ARASAAC pictogram or an AI drawing.
 *
 * NOTE: content-pipeline/README.md flags that KiddoCare has no Admin review
 * screen yet — these entries haven't had a human approval pass. Treat this as
 * a first real-time-lookup wire-up, not a finished, reviewed vocabulary.
 */

function norm(s: string): string {
  return s.toLowerCase().trim();
}

export interface BookVocabHit {
  uri: string;
  source: "book";
}

/** Look a single word up. Returns null if it isn't in the extracted set. */
export function lookupBookWord(word: string): BookVocabHit | null {
  const key = norm(word);
  const asset = BOOK_VOCAB_ASSETS[key];
  if (asset == null) return null;
  const uri = Image.resolveAssetSource(asset)?.uri;
  return uri ? { uri, source: "book" } : null;
}

/**
 * Look a phrase up, trying the whole phrase first then each significant word
 * — same idea as imageLibrary's candidate-key search, so "the cat" and "cat
 * sat on the mat" both have a chance of hitting a bundled book picture.
 */
export function lookupBookPhrase(phrase: string): BookVocabHit | null {
  const whole = lookupBookWord(phrase);
  if (whole) return whole;
  const words = norm(phrase)
    .replace(/[.,!?;:"']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  for (const w of words) {
    const hit = lookupBookWord(w);
    if (hit) return hit;
  }
  return null;
}

export function bookVocabSize(): number {
  return new Set(Object.values(BOOK_VOCAB_ASSETS)).size;
}
