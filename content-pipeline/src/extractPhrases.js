import { NOUNS, PREPOSITIONS, VERBS, STOP, tokenize } from "./vocab.js";

/** Trigger-phrase variations so speech recognition has a good chance of
 * matching how a child might actually say a word. */
function variations(word) {
  const out = new Set([word, `the ${word}`, `a ${word}`]);
  if (/^[aeiou]/.test(word)) out.add(`an ${word}`);
  return [...out];
}

/**
 * Rule-based candidate PhraseMatch entries from one page's text, paired with
 * that page's image(s). Draft only — every entry needs Admin review before
 * publishing (spec step 5).
 */
export function extractPageCandidates(page, book) {
  if (!page.images.length) return []; // nothing to pair a phrase with
  const tokens = tokenize(page.text);
  const found = new Set();
  const candidates = [];

  for (const t of tokens) {
    if (STOP.has(t)) continue;
    let kind = null;
    if (NOUNS.has(t)) kind = "noun";
    else if (PREPOSITIONS.has(t)) kind = "preposition";
    else if (VERBS.has(t)) kind = "verb";
    if (!kind || found.has(t)) continue;
    found.add(t);
    candidates.push({
      phrase: t,
      kind,
      triggers: variations(t),
      image: page.images[0], // step 4: page-level pairing; multi-image pages need the manual review pass
      imagePath: `${book.slug}/images/${page.images[0]}`, // relative to content-source/gdl/
      page: page.page,
      pageText: page.text,
      book: book.title,
      bookId: book.bookId,
      level: book.level,
      licenseRef: book.licenseRef,
      status: "draft", // draft -> approved | rejected, set by the Admin review step
    });
  }
  return candidates;
}

export function extractBookCandidates(extracted) {
  return extracted.pages.flatMap((p) => extractPageCandidates(p, extracted));
}
