/**
 * Reads a spoken or typed sum ("5 apples - 3 apples", "two plus three",
 * "3 × 2 balls", "10 ÷ 2 candies") or a short story problem ("Sara has 5
 * apples. She gives 2 apples to Ali. How many apples are left?") so Picture
 * Talk can draw it as a counting picture instead of a scene. Returns null for
 * anything that is not a sum.
 */

export type MathOp = "+" | "-" | "×" | "÷";

export interface MathScene {
  a: number;
  b: number;
  op: MathOp;
  result: number;
  /** Singular object to draw, e.g. "apple". */
  object: string;
}

/** Largest number we still draw as single pictures (bigger ones show as numerals). */
export const MAX_DRAWN = 20;

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
};

// Longest phrases first so "take away" wins over "away".
const OPERATORS: [RegExp, MathOp][] = [
  [/\b(take away|taken away|subtract(?:ed)?|minus|less)\b/g, "-"],
  [/\b(plus|add(?:ed)?|and)\b/g, "+"],
  [/\b(times|multiplied by|groups of|lots of)\b/g, "×"],
  [/\b(divided by|shared (?:between|among|by)|split into)\b/g, "÷"],
];

const NUM = "(\\d+|" + Object.keys(NUMBER_WORDS).join("|") + ")";
const WORD = "([a-z]+)";
const SUM = new RegExp(`^${NUM}\\s*${WORD}?\\s*([-+×÷])\\s*${NUM}\\s*${WORD}?$`);

function toNumber(token: string): number {
  return /^\d+$/.test(token) ? parseInt(token, 10) : NUMBER_WORDS[token];
}

// Words whose singular ends in "ie" (cookie), not "y" (candy).
const IE_WORDS = new Set(["cookies", "movies", "pies", "brownies", "ties", "hoodies"]);

/** apples → apple, boxes → box, candies → candy, cookies → cookie, fish → fish. */
export function singular(word: string): string {
  if (/(ss|us|is|fish|sheep|deer)$/.test(word)) return word;
  if (IE_WORDS.has(word)) return word.slice(0, -1);
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (/(ches|shes|xes|zes|sses)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 2) return word.slice(0, -1);
  return word;
}

export function parseMath(text: string, fallbackObject = "apple"): MathScene | null {
  let t = ` ${text.toLowerCase()} `
    .replace(/[?!.,]/g, " ")
    .replace(/\s*(=|equals?|is equal to|makes)\s*.*$/, " ") // drop "= ?" / "equals 5"
    .replace(/\bwhat is\b|\bhow many is\b/g, " ")
    .replace(/[x*]/g, (m, i, s) => (/\d\s*$/.test(s.slice(0, i)) ? "×" : m)) // "3 x 2" but not words
    .replace(/[\/]/g, "÷")
    .replace(/[−–]/g, "-");
  for (const [re, op] of OPERATORS) t = t.replace(re, ` ${op} `);
  t = t.replace(/\s+/g, " ").trim();

  const m = t.match(SUM);
  if (!m) return null;
  const [, aTok, objA, op, bTok, objB] = m;
  const a = toNumber(aTok);
  const b = toNumber(bTok);
  if (a === undefined || b === undefined) return null;

  let result: number;
  switch (op as MathOp) {
    case "+":
      result = a + b;
      break;
    case "-":
      if (b > a) return null;
      result = a - b;
      break;
    case "×":
      result = a * b;
      break;
    case "÷":
      if (b === 0 || a % b !== 0) return null;
      result = a / b;
      break;
    default:
      return null;
  }

  const object = singular(objB || objA || fallbackObject);
  return { a, b, op: op as MathOp, result, object };
}

// --- story problems ---------------------------------------------------------

const NUM_WORD = `\\b(\\d+|${Object.keys(NUMBER_WORDS).join("|")})`;
const NUM_NOUN = new RegExp(`${NUM_WORD}\\s+(?:more\\s+|small\\s+|big\\s+|red\\s+|green\\s+)?([a-z]+)`, "g");
const NUM_AT_END = new RegExp(`${NUM_WORD}\\s*\\.`, "g");

// Words that are never the counted thing ("2 more", "3 of them", "5 in all").
const NOT_OBJECTS = new Set(["more", "of", "in", "and", "are", "is", "the", "each", "how", "what", "left", "friends", "friend", "children", "kids", "people"]);

const DIVIDE = /\b(shares?|shared|divides?|divided|splits?)\b[^.]*\b(between|among|into)\b/;
const MULTIPLY = /\beach\b|\b(groups|bags|boxes|baskets|packs|rows|plates) of\b/;
const RECEIVE = /\b(gives?|gave) (her|him|them|me|us)\b/;
const TAKE_AWAY = /\b(gives?|gave|given|eats?|ate|eaten|loses?|lost|sells?|sold|drops?|dropped|breaks?|broke|broken|uses?|used|takes? away|took away|flies? away|flew away|runs? away|ran away|left|remains?|remaining|fewer)\b/;
const ADD = /\b(more|buys?|bought|gets?|got|finds?|found|receives?|received|picks?|picked|adds?|added|comes?|came|join|joins|joined|in all|altogether|total|together)\b/;

/**
 * Reads a short story problem with two numbers:
 *   "Sara has 5 apples. She gives 2 apples to Ali. How many apples are left?"  → 5 − 2
 *   "Ahmed has 3 balls. His father gives him 2 more balls."                     → 3 + 2
 *   "Fatima has 3 bags. Each bag has 2 oranges."                                → 3 × 2 oranges
 *   "Hamza shares 6 pencils equally between 2 friends."                         → 6 ÷ 2
 */
export function parseWordProblem(text: string): MathScene | null {
  const t = ` ${text.toLowerCase().replace(/[?!,;:"']/g, " ").replace(/\s+/g, " ")} `;
  const found: { n: number; noun: string | null }[] = [];
  for (const m of t.matchAll(NUM_NOUN)) {
    const noun = NOT_OBJECTS.has(m[2]) ? null : singular(m[2].replace(/\.$/, ""));
    found.push({ n: toNumber(m[1]), noun });
  }
  // a number at the very end of a sentence ("between 2.") has no noun after it
  for (const m of t.matchAll(NUM_AT_END)) {
    if (!found.some((f) => f.n === toNumber(m[1]))) found.push({ n: toNumber(m[1]), noun: null });
  }
  if (found.length !== 2) return null;
  const [first, second] = found;
  const a = first.n;
  const b = second.n;

  let op: MathOp;
  if (DIVIDE.test(t)) op = "÷";
  else if (MULTIPLY.test(t)) op = "×";
  else if (RECEIVE.test(t)) op = "+";
  else if (TAKE_AWAY.test(t)) op = "-";
  else if (ADD.test(t)) op = "+";
  else return null;

  let result: number;
  if (op === "+") result = a + b;
  else if (op === "-") {
    if (b > a) return null;
    result = a - b;
  } else if (op === "×") result = a * b;
  else {
    if (b === 0 || a % b !== 0) return null;
    result = a / b;
  }

  // × counts the things inside the groups ("2 oranges"); the rest count the first thing
  const object = (op === "×" ? second.noun ?? first.noun : first.noun ?? second.noun) ?? "apple";
  return { a, b, op, result, object };
}

/** "apple" → "apples" (or "apple" for one). */
function noun(n: number, word: string): string {
  if (n === 1 || /(fish|sheep|deer)$/.test(word)) return word;
  if (/(s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
}

function count(n: number, word: string): string {
  return `${n} ${noun(n, word)}`;
}

/**
 * A little story for a plain sum, so it can be drawn as a real scene:
 *   5 − 3 apples  → "A child has 5 apples and gives 3 apples to a friend."
 */
export function sumStory({ a, b, op, object }: MathScene): string {
  switch (op) {
    case "+":
      return `A child has ${count(a, object)} and a friend brings ${b} more ${noun(b, object)}.`;
    case "-":
      return `A child has ${count(a, object)} and gives ${count(b, object)} to a friend.`;
    case "×":
      return `There are ${a} baskets with ${count(b, object)} in each basket.`;
    case "÷":
      return `${count(a, object)} are shared equally between ${b} children.`;
  }
}

/** The story without its question, for drawing: "Sara has 5 apples. She gives 2 apples to Ali." */
export function storyWithoutQuestion(text: string): string {
  return text
    .split(/(?<=[.?!])\s+/)
    .filter((s) => !/\?|\b(how many|how much|what is|find)\b/i.test(s))
    .join(" ")
    .trim();
}
