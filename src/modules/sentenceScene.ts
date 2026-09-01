import type { SentenceScene } from "../types";

/**
 * On-device sentence analysis for the Sentence Picture module.
 * Rule-based: recognises colours, a subject noun, a spatial preposition and a
 * reference object, plus a set of science-concept presets used in schoolwork.
 */

export const COLORS = ["black", "white", "brown", "grey", "gray", "red", "orange", "yellow", "green", "blue", "purple", "pink"];

const COLOR_HEX: Record<string, string> = {
  black: "#3a3a3a", white: "#f2f2f2", brown: "#8a5a2b", grey: "#9aa0a6", gray: "#9aa0a6",
  red: "#d64545", orange: "#e08a3c", yellow: "#e9c33c", green: "#4f9d5d", blue: "#4a7fe6",
  purple: "#8a6bc9", pink: "#e58ab0",
};

export const PREPOSITIONS = [
  "under", "below", "beneath", "on top of", "on", "above", "over", "beside", "next to", "near",
  "behind", "in front of", "inside", "in",
];

const PREP_CANON: Record<string, string> = {
  under: "under", below: "under", beneath: "under",
  on: "on", "on top of": "on", above: "above", over: "above",
  beside: "beside", "next to": "beside", near: "beside",
  behind: "behind", "in front of": "in front of",
  inside: "inside", in: "inside",
};

export const SUBJECTS: Record<string, string> = {
  cat: "🐱", dog: "🐶", bird: "🐦", fish: "🐟", rabbit: "🐰", frog: "🐸", bear: "🐻",
  ball: "⚽", cup: "🥤", book: "📖", box: "📦", apple: "🍎", car: "🚗", hat: "🧢", flower: "🌼",
};

export const REFERENCES: Record<string, string> = {
  table: "🪑", chair: "🪑", box: "📦", bed: "🛏️", tree: "🌳", house: "🏠", rug: "🟫", mat: "🟫",
  shelf: "🗄️", basket: "🧺", car: "🚗", wall: "🧱",
};

// --- Science-concept presets --------------------------------------------

export interface ConceptPreset {
  key: string;
  match: RegExp;
  title: string;
  caption: string;
  render: {
    kind: "plant" | "animals";
    seeds?: boolean;
    flowers?: boolean;
    backbone?: boolean;
    examples?: string[];
  };
}

export const CONCEPTS: ConceptPreset[] = [
  {
    key: "flowering-plants",
    match: /flowering plants?.*(have|with).*(seed|flower)/i,
    title: "Flowering plants have seeds and flowers",
    caption: "Both the flower and the seeds are clearly, separately visible.",
    render: { kind: "plant", seeds: true, flowers: true },
  },
  {
    key: "non-flowering-plants",
    match: /non[- ]?flowering plants?.*(do not|don't|no).*(seed|flower)/i,
    title: "Non-flowering plants do not have seeds and flowers",
    caption: "A green plant (fern / moss style) with no flower and no seeds shown.",
    render: { kind: "plant", seeds: false, flowers: false },
  },
  {
    key: "vertebrates",
    match: /vertebrates?.*(have|with).*(backbone|spine)/i,
    title: "Vertebrates have a backbone",
    caption: "Example animals shown with the backbone highlighted.",
    render: { kind: "animals", backbone: true, examples: ["🐕", "🐈", "🐟", "🦅"] },
  },
  {
    key: "invertebrates",
    match: /invertebrates?.*(do not|don't|no).*(backbone|spine)/i,
    title: "Invertebrates do not have a backbone",
    caption: "Example animals shown with no backbone.",
    render: { kind: "animals", backbone: false, examples: ["🐛", "🐌", "🦋", "🐙"] },
  },
];

export function colorHex(name: string | null): string | null {
  return name ? COLOR_HEX[name] ?? null : null;
}

export function canonicalPreposition(name: string | null): string | null {
  return name ? PREP_CANON[name] ?? name : null;
}

export function parseSentence(raw: string): SentenceScene {
  const text = ` ${raw.toLowerCase().replace(/[.,!?]/g, "")} `;

  const concept = CONCEPTS.find((c) => c.match.test(raw));
  const adjectives = COLORS.filter((c) => text.includes(` ${c} `));
  const color = adjectives[0] ?? null;

  let preposition: string | null = null;
  for (const p of [...PREPOSITIONS].sort((a, b) => b.length - a.length)) {
    if (text.includes(` ${p} `)) {
      preposition = p;
      break;
    }
  }

  let subject: string | null = null;
  for (const s of Object.keys(SUBJECTS)) {
    if (text.includes(` ${s} `) || text.includes(` ${s}s `)) {
      subject = s;
      break;
    }
  }

  let reference: string | null = null;
  if (preposition) {
    const after = text.split(` ${preposition} `)[1] ?? "";
    for (const r of Object.keys(REFERENCES)) {
      if (after.includes(r)) {
        reference = r;
        break;
      }
    }
  }
  if (!reference) {
    for (const r of Object.keys(REFERENCES)) {
      if (text.includes(` ${r} `) && r !== subject) {
        reference = r;
        break;
      }
    }
  }

  return { raw, adjectives, color, subject, preposition, reference, conceptKey: concept?.key ?? null };
}

export function conceptByKey(key: string | null): ConceptPreset | null {
  return key ? CONCEPTS.find((c) => c.key === key) ?? null : null;
}
