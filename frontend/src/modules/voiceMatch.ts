/**
 * Phone speech-to-text mishears a word now and then ("the cat is on the
 * tablet"). When what was heard is clearly one of the open chapter's lesson
 * sentences with a near-miss word or two, use the lesson sentence instead.
 *
 * It never changes the words a lesson is about: a position (on / under…), a
 * colour, a number or a size has to be heard exactly, so "the cat is under
 * the table" is never turned into the lesson "the cat is on the table".
 */

const ARTICLES = new Set(["a", "an", "the"]);

// the lesson point words: these must match exactly, never be "corrected"
const KEY_WORDS = new Set([
  "on", "under", "underneath", "below", "beneath", "above", "over", "inside", "in", "behind", "front", "beside",
  "next", "near", "between", "top", "out", "outside",
  "red", "blue", "yellow", "green", "black", "white", "pink", "purple", "brown", "orange", "grey", "gray",
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "big", "small", "tiny", "huge", "little", "tall", "short", "long",
]);

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter((w) => w && !ARTICLES.has(w));
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** A rough "sounds like" spelling: bocks → box, ice → is, eyes → is. */
function sound(w: string): string {
  return w
    .replace(/^eye/, "i")
    .replace(/cks|ks|cs/g, "x")
    .replace(/ck/g, "k")
    .replace(/ph/g, "f")
    .replace(/ce$/, "s")
    .replace(/(.)\1/g, "$1");
}

/** 1 = same word, 0 = nothing in common — by spelling or by sound, whichever is closer. */
function similarity(a: string, b: string): number {
  const ratio = (x: string, y: string) => 1 - editDistance(x, y) / Math.max(x.length, y.length, 1);
  return Math.max(ratio(a, b), ratio(sound(a), sound(b)));
}

/** The lesson sentence the child most likely said, or null to keep what was heard. */
export function snapToLesson(heard: string, lessons: string[]): string | null {
  const h = words(heard);
  if (!h.length) return null;

  let best: { say: string; misses: number } | null = null;
  for (const say of lessons) {
    const c = words(say);
    if (c.length !== h.length) continue;
    let misses = 0;
    let ok = true;
    for (let i = 0; i < c.length && ok; i++) {
      if (h[i] === c[i]) continue;
      // a different lesson word means a different sentence, not a mishearing
      if (KEY_WORDS.has(c[i]) || similarity(h[i], c[i]) < 0.5) ok = false;
      else misses++;
    }
    if (!ok || misses > Math.max(1, Math.floor(c.length / 3))) continue;
    if (!best || misses < best.misses) best = { say, misses };
  }
  return best && best.misses > 0 ? best.say : null;
}
