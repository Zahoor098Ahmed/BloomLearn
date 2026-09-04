/**
 * Behaviour tests for the voice-controlled scene builder.
 * Run:  npm run test:scene
 *
 * These turn the five required behaviour categories into checks:
 *   1. single object            2. relational placement
 *   3. state command on an item 4. descriptive sentence -> scene
 *   5. additive (never delete)  + the "no dropped words" bug
 */

import { newSession, applyUtterance, applyOps, type SceneSession } from "./sceneSession";

let pass = 0;
let fail = 0;

function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    pass++;
    console.log(`  ok   ${name}`);
  } else {
    fail++;
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function say(session: SceneSession, ...phrases: string[]): SceneSession {
  let s = session;
  for (const p of phrases) s = applyUtterance(s, p);
  return s;
}

const types = (s: SceneSession) => s.items.map((i) => i.type);
const item = (s: SceneSession, type: string) => s.items.find((i) => i.type === type);

// 1. single object
{
  const s = say(newSession(), "table");
  check("1a  'table' -> one table", types(s).length === 1 && types(s)[0] === "table");
  const c = say(newSession(), "cat");
  check("1b  'cat' -> one cat", types(c).join() === "cat");
}

// 2. relational placement (full sentence, both objects kept)
{
  const s = say(newSession(), "table", "book behind the table");
  check("2a  book+table both present", types(s).sort().join() === "book,table");
  const tbl = item(s, "table")!;
  const book = item(s, "book")!;
  check("2b  table kept its place", Math.abs(tbl.x - 0.5) < 0.001);
  check("2c  book is behind (depth flag + higher up)", book.behind === true && book.y < tbl.y);

  const r = say(newSession(), "table", "book to the right of the table");
  check("2d  book to the right sits at greater x", item(r, "book")!.x > item(r, "table")!.x);
  check("2d2 relation is recorded on the item", item(r, "book")!.relation === "right" && item(r, "book")!.reference === "table");

  const l = say(newSession(), "laptop", "cat to the left of the laptop");
  check("2e  works for any objects (laptop/cat)", item(l, "cat")!.x < item(l, "laptop")!.x);
}

// 3. state command updates an existing object, no new object
{
  const s = say(newSession(), "cat", "open the cat's eyes");
  check("3a  still one cat", types(s).join() === "cat");
  check("3b  the cat's eyes are open", item(s, "cat")!.eyes === "open");
  const s2 = applyUtterance(s, "close the cat's eyes");
  check("3c  now closed, still one cat", item(s2, "cat")!.eyes === "closed" && s2.items.length === 1);
}

// 4. descriptive sentence -> scene
{
  const s = say(newSession(), "a girl is crying");
  check("4a  a girl exists", !!item(s, "girl"));
  check("4b  girl has a crying expression", item(s, "girl")!.action === "crying");
}

// 5. additive — new objects never delete existing ones
{
  const s = say(newSession(), "table", "cat on the table", "book behind the table", "a girl is crying");
  check("5a  four items accumulated", s.items.length === 4, `got ${types(s).join()}`);
  check("5b  the first object (table) is still there", !!item(s, "table"));
}

// bug: the whole sentence is parsed, first word not dropped
{
  const s = say(newSession(), "book behind the table");
  check("bug  single utterance keeps 'book' AND 'table'", types(s).sort().join() === "book,table");
}

// islamic education assets resolve to a glyph (not the unknown marker)
{
  const s = say(newSession(), "mosque", "prayer mat");
  check("islam  mosque + prayer mat both render", s.items.length === 2 && s.items.every((i) => i.glyph !== "❔"));
}

// agent ops (what the LLM route produces) apply the same way
{
  let s = applyOps(newSession(), [{ op: "add", type: "table" }]);
  s = applyOps(s, [{ op: "add", type: "cat", relation: "on", reference: "table", color: "blue" }]);
  check("ops  table + blue cat on it", types(s).sort().join() === "cat,table" && item(s, "cat")!.color === "blue");
  check("ops  cat sits above the table centre", item(s, "cat")!.y < item(s, "table")!.y);
  s = applyOps(s, [{ op: "update", type: "cat", eyes: "open" }]);
  check("ops  update opens the cat's eyes only", item(s, "cat")!.eyes === "open" && s.items.length === 2);
  s = applyOps(s, [{ op: "remove", type: "cat" }]);
  check("ops  remove drops just the cat", types(s).join() === "table");
  s = applyOps(s, [{ op: "reset" }]);
  check("ops  reset clears everything", s.items.length === 0);
}

// colour, variants and pose (the shapes the agent emits for the newer commands)
{
  let s = applyOps(newSession(), [{ op: "add", type: "cat" }]);
  s = applyOps(s, [{ op: "update", type: "cat", color: "green" }]);
  check("var  'make the cat green' updates colour, no new cat", s.items.length === 1 && item(s, "cat")!.color === "green");

  s = applyOps(s, [{ op: "add", type: "office chair" }]);
  check("var  'office chair' kept as its own type (not 'chair')", !!item(s, "office chair") && !item(s, "chair"));

  s = applyOps(s, [{ op: "add", type: "boy", action: "sitting", relation: "on", reference: "office chair" }]);
  const boy = item(s, "boy")!;
  check("var  'boy sit on office chair' -> pose + placed on the chair", boy.action === "sitting" && boy.reference === "office chair" && boy.y < item(s, "office chair")!.y);
}

// no duplicate object when a noun is referenced twice in one sentence
{
  // agent split it: add "office chair", then a boy whose reference is bare "chair"
  let s = applyOps(newSession(), [
    { op: "add", type: "office chair" },
    { op: "add", type: "boy", action: "sitting", relation: "on", reference: "chair" },
  ]);
  const chairs = s.items.filter((i) => i.type.includes("chair"));
  check("dup  only one chair, and it's the office chair", chairs.length === 1 && chairs[0].type === "office chair", `got ${s.items.map((i) => i.type).join()}`);

  s = applyOps(newSession(), [{ op: "add", type: "table" }, { op: "add", type: "cat", relation: "under", reference: "table" }]);
  check("dup  'cat under table' still one table", s.items.filter((i) => i.type === "table").length === 1);
}

// anatomy: one body, organs accumulate (never separate scattered pictures)
{
  let s = say(newSession(), "internal body parts");
  check("body  'internal body parts' enters body mode", s.anatomy && s.items.length === 0);
  s = say(s, "heart", "add lungs", "add the stomach");
  check("body  organs accumulate on the one body", s.anatomy && s.anatomyParts.includes("heart") && s.anatomyParts.includes("lung") && s.anatomyParts.includes("stomach"));
  s = say(s, "a cat");
  check("body  a real object leaves body mode", !s.anatomy && !!item(s, "cat"));

  // agent path
  let a = applyOps(newSession(), [{ op: "add", type: "heart" }, { op: "add", type: "lungs" }]);
  check("body  agent organ ops build the body too", a.anatomy && a.anatomyParts.length === 2 && a.items.length === 0);

  // outside body parts
  let b = say(newSession(), "human body parts", "head", "add an arm", "add a leg");
  check("body  outside parts (head/arm/leg) build the body", b.anatomy && b.anatomyParts.includes("head") && b.anatomyParts.includes("arm") && b.anatomyParts.includes("leg"));

  // "open the cat's eyes" must NOT trigger the body diagram
  let c = say(newSession(), "a cat", "open the cat's eyes");
  check("body  'open the cat's eyes' stays a cat command", !c.anatomy && item(c, "cat")?.eyes === "open");

  // "internal organs" (rule + agent) fills the standard organ set
  let d = say(newSession(), "internal organs");
  check("body  'internal organs' fills the standard set (rules)", d.anatomy && d.anatomyParts.length >= 8);
  let e = applyOps(newSession(), [{ op: "add", type: "organs" }]);
  check("body  agent 'organs' op fills the standard set", e.anatomy && e.anatomyParts.length >= 8 && e.anatomyParts.includes("heart"));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
