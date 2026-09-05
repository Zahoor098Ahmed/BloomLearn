import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchBatch } from "./fetchBooks.js";
import { ingestBook } from "./ingestBook.js";
import { extractBookCandidates } from "./extractPhrases.js";

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}

async function main() {
  const lang = arg("lang", "en");
  const count = Number(arg("count", "10"));
  const root = arg("out", "content-source/gdl");

  console.log(`Fetching up to ${count} "${lang}" books from GDL...`);
  const batch = await fetchBatch({ lang, count, allowNc: process.argv.includes("--allow-nc") });
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, `batch-${lang}.json`), JSON.stringify(batch, null, 2));
  console.log(`  ${batch.books.length} usable books (of ${batch.found} with a licence+EPUB)\n`);

  const allEntries = [];
  const results = [];
  for (const meta of batch.books) {
    const outDir = path.join(root, meta.slug);
    process.stdout.write(`Ingesting "${meta.title}" [${meta.license}]... `);
    try {
      const extracted = await ingestBook(meta, outDir);
      const entries = extractBookCandidates(extracted);
      allEntries.push(...entries);
      const nImages = extracted.pages.reduce((n, p) => n + p.images.length, 0);
      console.log(`${extracted.pages.length} pages, ${nImages} images, ${entries.length} draft entries`);
      results.push({ title: meta.title, ok: true, pages: extracted.pages.length, images: nImages, entries: entries.length });
    } catch (e) {
      console.log(`FAILED — ${e.message}`);
      results.push({ title: meta.title, ok: false, error: e.message });
    }
  }

  const draftPath = path.join(root, "draft-entries.json");
  await writeFile(draftPath, JSON.stringify(allEntries, null, 2));

  console.log(`\n${allEntries.length} draft PhraseMatch entries written to ${draftPath}`);
  console.log(`These are UNREVIEWED. Nothing here should reach the child-facing app`);
  console.log(`until each entry is approved (see content-pipeline/README.md, "What's still missing").`);
  console.log(`\nSummary:`);
  for (const r of results) {
    console.log(r.ok ? `  ok    ${r.title} — ${r.pages}p / ${r.images}img / ${r.entries} entries` : `  FAIL  ${r.title} — ${r.error}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
