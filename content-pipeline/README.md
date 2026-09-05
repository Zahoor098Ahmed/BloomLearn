# KiddoCare Content Pipeline

Standalone Node tool (not part of the Expo app) that turns CC-licensed
early-reader books from the **Global Digital Library (GDL)** into draft
`PhraseMatch`-style vocabulary entries — word/phrase + cropped image + spoken
label + book/level/license tag — for a human to review before anything
reaches the child-facing app.

See `../docs/gdl-api-findings.md` for how the API was confirmed, and
`../docs/open-license-content-sources.md` for the source/licensing plan this
implements.

## Why GDL only, for now

GDL content is CC BY — extraction/adaptation is explicitly permitted. Oxford
Learner's Bookshelf, Pakistani/Saudi curriculum platforms, and NCERT
(CC BY-NC-ND) content are **not** run through this pipeline (see the docs
above for why).

## Setup

```
cd content-pipeline
npm install
```

## Usage

```
# 1. Fetch a batch of book metadata from the API (no download yet)
node src/fetchBooks.js --lang en --count 10 --out content-source/gdl/batch.json

# 2. Download + extract each book's EPUB (text + images per page)
node src/ingestBook.js --batch content-source/gdl/batch.json

# 3. Do 1+2 and also generate draft phrase/image candidates in one go
node src/run.js --lang en --count 10
```

`run.js` is the one to use end-to-end. Output:

```
content-source/gdl/<book-slug>/
  meta.json          # title, license, level, source URL, licenseRef
  book.epub          # the downloaded source file
  extracted.json     # { book, pages: [{ page, text, images: [...] }] }
  images/            # extracted page images, named page<N>_img<M>.<ext>
draft-entries.json    # every book's candidate PhraseMatch entries, UNREVIEWED
```

**`draft-entries.json` is a draft, not published content.** Nothing in it
should reach the child-facing app until a human has approved it — see
"What's still missing" below.

## What each step actually does

1. **`fetchBooks.js`** — calls the confirmed GDL API
   (`content.digitallibrary.io/wp-json/content-api/v1/books/:lang`), paginates,
   and writes out each book's id, title, description, language, per-book
   `license` (e.g. `CC-BY-4.0`), `topic`/level, and `epubUrl`.
2. **`ingestBook.js`** — downloads the EPUB from `epubUrl`, unzips it (EPUB is
   a zip of XHTML + images), reads `META-INF/container.xml` → the OPF
   manifest → the spine (reading order), then per spine item: strips the
   XHTML to plain text and copies any `<img>` it references into `images/`,
   producing the `{ book, pages: [...] }` intermediate JSON from the spec.
3. **`extractPhrases.js`** (used by `run.js`) — rule-based candidate
   extraction per page: known-vocabulary nouns, prepositions/spatial words,
   simple verbs, straight from a small early-reader word list
   (`src/vocab.js`) — plus trigger-phrase variations ("cat", "the cat", "a
   cat"). Pairs each candidate with the image(s) on that page. This is
   intentionally simple keyword matching, not an NLP model, per the spec.

## What's still missing (needs a decision, not just code)

**KiddoCare's existing app has no Admin screen and no `PhraseMatch` system —**
that part of the brief assumed infrastructure this codebase doesn't have yet
(checked: no `Admin`/`Edit` screen, nothing named `PhraseMatch` anywhere in
`frontend/src`). Two honest options once draft entries exist:

- Build a minimal **Admin review screen** in the app (new screen, new
  approve/edit/reject flow, new storage for the approved library) — a real
  scope of work, not a small addition.
- Review `draft-entries.json` by hand/spreadsheet for the first batch, decide
  the format for "approved" entries, and only then design where they live in
  the app (a new `imageLibrary`-style module, most likely, given the app
  already has [[scene-builder-standard]]'s ARASAAC-based library).

Nothing here auto-publishes anywhere the child sees it — that is by design.
