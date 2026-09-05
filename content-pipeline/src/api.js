// The confirmed live GDL API (WordPress REST, not the old Scala book-api —
// see ../../docs/gdl-api-findings.md for how this was found).
export const BASE = "https://content.digitallibrary.io/wp-json/content-api/v1";

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

/** One page of books in a language. GDL's own paging param, if any, is not
 * documented, so we ask for everything and slice client-side. */
export async function listBooks(lang = "en") {
  const json = await getJson(`${BASE}/books/${encodeURIComponent(lang)}`);
  return json.books ?? [];
}

export async function searchBooks(query, lang = "en") {
  const json = await getJson(`${BASE}/contentsearch?query=${encodeURIComponent(query)}&language=${encodeURIComponent(lang)}`);
  return json.books ?? [];
}

export async function listLanguages() {
  return getJson(`${BASE}/languages`);
}

export async function downloadBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}
