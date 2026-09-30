/**
 * Checks for the sum reader behind Picture Talk's counting pictures.
 * Run:  npm run test:math
 */

import { parseMath, parseWordProblem, storyWithoutQuestion, sumStory } from "./mathScene";

let pass = 0;
let fail = 0;

function check(input: string, expected: string | null) {
  const m = parseMath(input);
  const got = m ? `${m.a}${m.op}${m.b}=${m.result} ${m.object}` : null;
  if (got === expected) {
    pass++;
    console.log(`  ok   ${input.padEnd(34)} -> ${got}`);
  } else {
    fail++;
    console.log(`  FAIL ${input.padEnd(34)} -> ${got} (expected ${expected})`);
  }
}

check("5 apples -3 apples", "5-3=2 apple");
check("5 apples - 3 apples", "5-3=2 apple");
check("2 + 3", "2+3=5 apple");
check("two plus three balls", "2+3=5 ball");
check("five minus two", "5-2=3 apple");
check("5 take away 2 cats", "5-2=3 cat");
check("1 + 1 = ?", "1+1=2 apple");
check("3 × 2 apples", "3×2=6 apple");
check("3 x 2 apples", "3×2=6 apple");
check("four times two stars", "4×2=8 star");
check("10 ÷ 2 candies", "10÷2=5 candy");
check("12 / 4 cookies", "12÷4=3 cookie");
check("2 boxes and 3 boxes", "2+3=5 box");
check("What is 4 + 1?", "4+1=5 apple");
// not sums
check("The cat is on the table", null);
check("3 - 5", null);
check("7 ÷ 2", null);
check("a cat and a dog", null);
check("Five apples", null);

function story(input: string, expected: string | null) {
  const m = parseWordProblem(input);
  const got = m ? `${m.a}${m.op}${m.b}=${m.result} ${m.object}` : null;
  if (got === expected) {
    pass++;
    console.log(`  ok   ${input.slice(0, 60).padEnd(60)} -> ${got}`);
  } else {
    fail++;
    console.log(`  FAIL ${input.slice(0, 60).padEnd(60)} -> ${got} (expected ${expected})`);
  }
}

console.log("\nstory problems");
story("Sara has 5 apples. She gives 2 apples to Ali. How many apples are left?", "5-2=3 apple");
story("sara have 5 apples 2 apples give ali how many apples remain", "5-2=3 apple");
story("Ahmed has 3 balls. His father gives him 2 more balls. How many balls does he have now?", "3+2=5 ball");
story("Ayesha has 4 cookies. She eats 1 cookie. How many cookies are left?", "4-1=3 cookie");
story("There are 2 birds on a tree. 3 more birds come. How many birds are there in all?", "2+3=5 bird");
story("Hamza has 6 pencils. He shares them equally between 2 friends. How many pencils does each friend get?", "6÷2=3 pencil");
story("Fatima has 3 bags. Each bag has 2 oranges. How many oranges are there?", "3×2=6 orange");
story("Bilal had 5 balloons. 2 balloons flew away. How many balloons are left?", "5-2=3 balloon");
// not story problems
story("Three red apples are in the basket", null);
story("The cat is on the table", null);
story("Two birds are flying above the tree", null);

console.log("\nstories made up for plain sums (for the real picture)");
for (const [input, expected] of [
  ["5 apples - 3 apples", "A child has 5 apples and gives 3 apples to a friend."],
  ["2 + 3 balls", "A child has 2 balls and a friend brings 3 more balls."],
  ["3 × 2 apples", "There are 3 baskets with 2 apples in each basket."],
  ["10 ÷ 2 candies", "10 candies are shared equally between 2 children."],
  ["3 fish + 2 fish", "A child has 3 fish and a friend brings 2 more fish."],
] as const) {
  const got = sumStory(parseMath(input)!);
  if (got === expected) {
    pass++;
    console.log(`  ok   ${input.padEnd(22)} -> ${got}`);
  } else {
    fail++;
    console.log(`  FAIL ${input.padEnd(22)} -> ${got} (expected ${expected})`);
  }
}

const s = storyWithoutQuestion("Sara has 5 apples. She gives 2 apples to Ali. How many apples are left?");
if (s === "Sara has 5 apples. She gives 2 apples to Ali.") {
  pass++;
  console.log(`  ok   story text for the picture: "${s}"`);
} else {
  fail++;
  console.log(`  FAIL story text for the picture: "${s}"`);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
