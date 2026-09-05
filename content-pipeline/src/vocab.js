// Small early-reader keyword lists for rule-based phrase extraction (spec
// step 3: "doesn't need to be a heavy NLP model for early-reader text").

export const NOUNS = new Set([
  "cat", "dog", "bird", "fish", "rabbit", "duck", "hen", "cow", "goat", "sheep",
  "boy", "girl", "man", "woman", "baby", "mother", "father", "sister", "brother",
  "friend", "teacher", "family",
  "house", "school", "door", "window", "tree", "flower", "garden", "farm",
  "sun", "moon", "star", "sky", "rain", "river", "hill", "mountain",
  "table", "chair", "bed", "book", "ball", "cup", "plate", "bag", "box",
  "car", "bus", "boat", "road", "market", "shop", "village", "town",
  "apple", "banana", "mango", "rice", "bread", "milk", "water", "food",
  "hand", "head", "eye", "leg", "foot",
]);

export const PREPOSITIONS = new Set([
  "on", "under", "in", "inside", "above", "below", "behind", "in front of",
  "next to", "beside", "near", "between", "over", "into", "onto", "up", "down",
]);

// "is/are/was/were" deliberately excluded — true but not a useful AAC phrase
export const VERBS = new Set([
  "runs", "ran", "jumps", "jumped", "walks", "walked",
  "sits", "sat", "sleeps", "slept", "eats", "ate", "plays", "played", "opens",
  "opened", "closes", "closed", "goes", "went", "sees", "saw", "looks", "looked",
  "smiles", "smiled", "cries", "cried", "laughs", "laughed", "reads", "read",
  "sings", "sang", "flies", "flew", "swims", "swam", "climbs", "climbed",
  "helps", "helped", "gives", "gave", "takes", "took",
]);

const STOP = new Set(["the", "a", "an", "and", "to", "of", "it", "he", "she", "they", "his", "her", "their", "with", "at"]);

export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

export { STOP };
