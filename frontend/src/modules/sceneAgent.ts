/**
 * The "agent" brain for the voice scene builder.
 *
 * With a free Groq key (console.groq.com) or an OpenAI key, free speech is sent
 * to an LLM that returns structured scene-edit operations — so almost anything
 * the teacher or child says is understood, not just the built-in vocabulary.
 * Without a key the app falls back to the on-device rule parser (applyUtterance).
 *
 *   EXPO_PUBLIC_GROQ_API_KEY=gsk_...      (preferred — fast, generous free tier)
 *   EXPO_PUBLIC_OPENAI_API_KEY=sk-...     (also works)
 */

import type { SceneSession, SceneOp } from "./sceneSession";

const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? "";
const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "";

export const agentEnabled = !!GROQ_KEY || !!OPENAI_KEY;
export const agentName = GROQ_KEY ? "Groq" : OPENAI_KEY ? "OpenAI" : "on-device";

const SYSTEM = `You convert one short spoken phrase from a teacher or child into edit operations for a children's picture scene.
Reply with ONLY a JSON array of operations. No prose, no markdown fences.

Operation shapes (omit keys you don't need):
{"op":"add","type":"<singular common noun>","color":"<basic colour>","count":<1-5>,"size":"tiny|small|normal|big|huge","action":"<verb ending in -ing>","eyes":"open|closed","relation":"behind|in front of|left|right|above|below|on|inside","reference":"<noun to place near>"}
{"op":"update","type":"<noun already in the scene>", ...same attribute keys}
{"op":"move","type":"<noun in scene>","relation":"...","reference":"..."}
{"op":"remove","type":"<noun in scene>"}
{"op":"reset"}

Rules:
- Use exactly the key "op" and the key "type" (not "action:modify", not "target"/"name").
- Keep every existing object unless the phrase says to move, remove or reset it.
- NEVER invent an object the speaker did not say. If a phrase gives only a
  relation and a reference ("below the table", "now on the left"), it MOVES the
  object that was added most recently — emit {"op":"move","type":"<that object>",...}.
- Singular nouns. KEEP a meaningful compound noun as the type: "office chair",
  "dining table", "fire truck" (not just "chair"/"table").
- "sit on / stand next to / lie on" -> ONE op for the person with BOTH the
  action (sitting/standing/lying) and the relation. Do NOT also add the
  furniture separately — the relation creates it. Use the SAME wording for
  "reference" as the object's name ("office chair", not "chair").
- "make the cat green" / "the cat is green" on an existing object -> update, not add.

Examples:
"a girl is crying" -> [{"op":"add","type":"girl","action":"crying"}]
"green cat" -> [{"op":"add","type":"cat","color":"green"}]
"make the cat green" -> [{"op":"update","type":"cat","color":"green"}]
"open the cat's eyes" -> [{"op":"update","type":"cat","eyes":"open"}]
"book behind the table" -> [{"op":"add","type":"book","relation":"behind","reference":"table"}]
"office chair" -> [{"op":"add","type":"office chair"}]
"boy sit on the office chair" -> [{"op":"add","type":"boy","action":"sitting","relation":"on","reference":"office chair"}]
"move the ball to the left of the box" -> [{"op":"move","type":"ball","relation":"left","reference":"box"}]
"take away the dog" -> [{"op":"remove","type":"dog"}]
(scene: table, laptop) "below the table" -> [{"op":"move","type":"laptop","relation":"below","reference":"table"}]`;

function sceneSummary(s: SceneSession): string {
  if (s.anatomy) return `anatomy diagram with: ${s.anatomyParts.join(", ") || "nothing yet"}`;
  if (!s.items.length) return "(empty)";
  return s.items
    .map((i) => [i.count > 1 ? i.count : "", i.color, i.type].filter(Boolean).join(" "))
    .join("; ");
}

function extractArray(text: string): SceneOp[] | null {
  let t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const a = t.indexOf("[");
  const b = t.lastIndexOf("]");
  try {
    if (a >= 0 && b > a) {
      const arr = JSON.parse(t.slice(a, b + 1));
      return Array.isArray(arr) ? (arr as SceneOp[]) : null;
    }
    const obj = JSON.parse(t);
    const arr = Array.isArray(obj) ? obj : obj.ops ?? obj.operations;
    return Array.isArray(arr) ? (arr as SceneOp[]) : null;
  } catch {
    return null;
  }
}

async function groqChat(system: string, user: string, maxTokens = 400): Promise<string | null> {
  if (!agentEnabled) return null;
  const url = GROQ_KEY
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY || OPENAI_KEY}` },
      body: JSON.stringify({
        model: GROQ_KEY ? "openai/gpt-oss-20b" : "gpt-4o-mini",
        temperature: 0,
        max_tokens: maxTokens,
        reasoning_effort: "low",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

/**
 * Turn the current scene into one vivid image-generation prompt. Used to draw
 * the whole built scene as a single realistic picture.
 */
export async function describeScene(session: SceneSession): Promise<string | null> {
  if (session.anatomy) return null;
  const items = session.items
    .map((i) => [i.count > 1 ? i.count : "", i.color, i.size !== "normal" ? i.size : "", i.type, i.action, i.eyes ? `eyes ${i.eyes}` : "", i.behind ? "(in the background)" : ""].filter(Boolean).join(" "))
    .join("; ");
  const out = await groqChat(
    "You write ONE short image-generation prompt (max 45 words) for a warm, friendly children's picture. Describe every listed object, its colour, pose and where it sits relative to the others. End with: plain white background, soft flat illustration, no text. Reply with only the prompt.",
    `Objects: ${items}`,
    120,
  );
  return out ? out.trim().replace(/^["']|["']$/g, "") : null;
}

/** Ask the LLM for scene ops. Returns null on any failure so the caller falls back. */
export async function parseUtteranceLLM(utterance: string, session: SceneSession): Promise<SceneOp[] | null> {
  if (!agentEnabled) return null;
  const url = GROQ_KEY
    ? "https://api.groq.com/openai/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const body = {
    model: GROQ_KEY ? "openai/gpt-oss-20b" : "gpt-4o-mini",
    temperature: 0,
    max_tokens: 600,
    reasoning_effort: "low",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Scene now: ${sceneSummary(session)}\nPhrase: "${utterance}"\nJSON:` },
    ],
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY || OPENAI_KEY}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "";
    return extractArray(content);
  } catch {
    return null;
  }
}
