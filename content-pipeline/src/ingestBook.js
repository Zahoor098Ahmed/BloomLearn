import AdmZip from "adm-zip";
import * as cheerio from "cheerio";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { downloadBuffer } from "./api.js";

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
}

function joinEpubPath(baseDir, relPath) {
  return path.posix.normalize(path.posix.join(baseDir, relPath));
}

/**
 * Download one book's EPUB and turn it into { book, pages: [{page, text, images}] }
 * plus the cropped-per-page images on disk, per the spec's intermediate format.
 */
export async function ingestBook(meta, outDir) {
  await mkdir(outDir, { recursive: true });
  const imagesDir = path.join(outDir, "images");
  await mkdir(imagesDir, { recursive: true });

  // the epub-generator endpoint builds the file on demand and is occasionally
  // flaky/truncated under quick repeat requests — retry before giving up
  let zip;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const epubBuf = await downloadBuffer(meta.epubUrl);
      zip = new AdmZip(epubBuf);
      await writeFile(path.join(outDir, "book.epub"), epubBuf);
      break;
    } catch (e) {
      lastErr = e;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  if (!zip) throw new Error(`could not fetch/open EPUB after 3 tries: ${lastErr?.message}`);

  const containerXml = zip.readAsText("META-INF/container.xml");
  const $container = cheerio.load(containerXml, { xmlMode: true });
  const opfPath = $container("rootfile").attr("full-path");
  if (!opfPath) throw new Error(`${meta.title}: no OPF path in container.xml`);
  const opfDir = path.posix.dirname(opfPath);

  const opfXml = zip.readAsText(opfPath);
  const $opf = cheerio.load(opfXml, { xmlMode: true });

  const manifest = {}; // id -> { href, mediaType }
  $opf("manifest > item").each((_, el) => {
    const $el = $opf(el);
    manifest[$el.attr("id")] = { href: $el.attr("href"), mediaType: $el.attr("media-type") };
  });
  const spineIds = [];
  $opf("spine > itemref").each((_, el) => spineIds.push($opf(el).attr("idref")));

  const pages = [];
  let imgCounter = 0;

  for (let i = 0; i < spineIds.length; i++) {
    const item = manifest[spineIds[i]];
    if (!item) continue;
    const fullPath = joinEpubPath(opfDir, item.href);
    const entry = zip.getEntry(fullPath);
    if (!entry) continue;
    const html = entry.getData().toString("utf8");
    const $page = cheerio.load(html);
    $page("script, style").remove();
    const text = $page("body")
      .text()
      .replace(/<!\[CDATA\[|\]\]>|\]>/g, " ") // some GDL exports leave raw CDATA markers in the text node
      .replace(/\s+/g, " ")
      .trim();

    const pageImages = [];
    $page("img").each((_, img) => {
      const src = $page(img).attr("src");
      if (!src) return;
      const imgPath = joinEpubPath(path.posix.dirname(fullPath), src);
      const imgEntry = zip.getEntry(imgPath);
      if (!imgEntry) return;
      imgCounter++;
      const ext = path.posix.extname(imgPath) || ".png";
      const outName = `page${i + 1}_img${pageImages.length + 1}${ext}`;
      zip.getEntries(); // no-op, keeps adm-zip's lazy index warm
      pageImages.push(outName);
      writeFile(path.join(imagesDir, outName), imgEntry.getData()).catch(() => {});
    });

    if (text || pageImages.length) {
      // "Page 4" / "4" with no real sentence -> nothing for a human to check
      // against; flag it so the review step doesn't have to guess why there's
      // no phrase candidate for a page that clearly has an image.
      const looksEmpty = !/[a-z]{3,}/i.test(text.replace(/^page\s*\d+$/i, ""));
      pages.push({ page: i + 1, text, images: pageImages, needsReview: looksEmpty });
    }
  }

  const extracted = {
    book: meta.title,
    bookId: meta.id,
    slug: meta.slug,
    language: meta.language,
    license: meta.license,
    level: meta.level,
    sourceUrl: meta.sourceUrl,
    licenseRef: `GDL:${meta.license}`,
    pages,
  };
  await writeFile(path.join(outDir, "extracted.json"), JSON.stringify(extracted, null, 2));
  await writeFile(path.join(outDir, "meta.json"), JSON.stringify(meta, null, 2));
  return extracted;
}

async function main() {
  const batchPath = arg("batch");
  if (!batchPath) throw new Error("usage: node ingestBook.js --batch <batch.json>");
  const batch = JSON.parse(await readFile(batchPath, "utf8"));
  const rootOut = path.dirname(batchPath);
  for (const meta of batch.books) {
    const outDir = path.join(rootOut, meta.slug);
    console.log(`Ingesting: ${meta.title} -> ${outDir}`);
    try {
      const extracted = await ingestBook(meta, outDir);
      console.log(`  ${extracted.pages.length} pages, ${extracted.pages.reduce((n, p) => n + p.images.length, 0)} images`);
    } catch (e) {
      console.error(`  FAILED: ${e.message}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(1); });
