import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { listBooks } from "./api.js";

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "book";
}

// NonCommercial (NC) content is unsafe if the app is or becomes commercial;
// NoDerivatives (ND) blocks the extraction/cropping this pipeline does. Only
// CC BY and CC BY-SA are safe defaults — see docs/open-license-content-sources.md.
const SAFE_LICENSE = /^CC[- ]BY(?:[- ]SA)?[- ]?4\.0$/i;

export async function fetchBatch({ lang = "en", count = 10, allowNc = false } = {}) {
  const all = await listBooks(lang);
  // keep only books we can actually ingest: has an EPUB, a real license, and
  // (by default) no NC/ND restriction
  const usable = all.filter((b) => {
    if (!b.epubUrl || !b.license?.length) return false;
    const lic = b.license[0]?.name ?? "";
    return allowNc || SAFE_LICENSE.test(lic.replace(/\s+/g, "-"));
  });
  const batch = usable.slice(0, count).map((b) => ({
    id: b.postId,
    slug: slugify(b.post_name || b.title),
    title: b.title,
    description: b.description ?? "",
    language: b.language?.[0]?.name ?? lang,
    level: b.topic?.map((t) => t.name).join(", ") || null,
    license: b.license?.[0]?.name ?? "unknown",
    publisher: b.publisher ?? null,
    sourceUrl: b.postLink,
    epubUrl: b.epubUrl,
  }));
  return { fetchedAt: new Date().toISOString(), lang, requested: count, found: usable.length, books: batch };
}

async function main() {
  const lang = arg("lang", "en");
  const count = Number(arg("count", "10"));
  const out = arg("out", `content-source/gdl/batch-${lang}.json`);
  const allowNc = process.argv.includes("--allow-nc");
  const batch = await fetchBatch({ lang, count, allowNc });
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(batch, null, 2));
  console.log(`Found ${batch.found} usable books in "${lang}", wrote ${batch.books.length} to ${out}`);
  for (const b of batch.books) console.log(`  - [${b.license}] ${b.title} (${b.level ?? "no level tag"})`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(1); });
