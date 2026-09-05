# Licensed Oxford Book Content Ingestion Pipeline

Plan for turning licensed Oxford book files into `PhraseMatch` vocabulary
entries in KiddoCare's existing Admin/PhraseMatch system. **Not built yet** —
this is the spec + book list, saved for when the source files are available.

## Context

The app and Admin/Edit screen already exist — this is a content pipeline
added on top, not a rebuild. Goal: take the digital files (PDF/e-book/images)
of each licensed Oxford book and turn them into `PhraseMatch` entries
(word/phrase + image + spoken label + book/level tag), across multiple books,
with minimal manual re-typing.

## Licensing

Client has permission/licensing to use content from the Oxford Learner's
Bookshelf titles below. Keep a paper trail per book — e.g. a `LICENSES.md` or
a `bookSource.licenseRef` field on every entry — noting which license/
permission covers that book's content, since more books will be added over
time.

## Licensed books (client to confirm title/series/level)

The deeplinks are login-protected, so the exact title/series/level per code
couldn't be auto-retrieved. Client needs to log into her Oxford Learner's
Bookshelf account to confirm each row, and either export/download the files
she has permission for, or provide access so the team can retrieve them
through the proper channel.

| Book code | Deeplink | Title / Series / Level | License reference |
|---|---|---|---|
| OUPEF4ESS | https://www.oxfordlearnersbookshelf.com/deeplink/open-book/OUPEF4ESS | _TBD — client to confirm_ | _TBD_ |
| OUPH5ISS | https://www.oxfordlearnersbookshelf.com/deeplink/open-book/OUPH5ISS | _TBD — client to confirm_ | _TBD_ |
| OD2E2SBSAP | https://www.oxfordlearnersbookshelf.com/deeplink/open-book/OD2E2SBSAP | _TBD — client to confirm_ | _TBD_ |
| OUPS3ISBS | https://www.oxfordlearnersbookshelf.com/deeplink/open-book/OUPS3ISBS | _TBD — client to confirm_ | _TBD_ |
| OUPDIS03S | https://www.oxfordlearnersbookshelf.com/deeplink/open-book/OUPDIS03S | _TBD — client to confirm_ | _TBD_ |

## Pipeline steps

1. **File ingestion** — accept PDF / EPUB / page images per book; store under
   `/content-source/oxford/[book-name]/`; record title, series, level, license
   reference, date added.
2. **Content extraction** — text per page (`pdf-parse`/`pdfjs-dist` for PDF,
   `epub.js` for EPUB; Tesseract.js OCR fallback for scanned pages); images
   per page extracted and associated with page number + nearby text. Output an
   intermediate structured JSON per book:
   ```json
   {
     "book": "Oxford Reading Tree - Stage 1",
     "pages": [
       { "page": 4, "text": "The cat is on the mat.", "images": ["page4_img1.png"] }
     ]
   }
   ```
3. **Vocabulary/phrase extraction from text** — rule-based: key nouns,
   prepositions/spatial phrases, simple action verbs; generate trigger-phrase
   variations ("cat", "the cat", "a cat") for speech-recognition matching.
4. **Matching text to images** — pair each phrase with the image(s) on the
   same page; pages with multiple images/objects need the manual confirmation
   pass (step 5) rather than automated guessing.
5. **Admin review screen** (do not auto-publish) — list every auto-extracted
   entry (phrase, matched image, book/page source) with approve / edit text or
   trigger variations / swap-or-crop image / reject. Only approved entries
   reach the live `PhraseMatch` library the child-facing app uses.
6. **Book/level tagging** — every entry tagged with book title, series,
   level/stage, license reference; Admin can browse/filter by book.
7. **Repeatable per book** — steps 1–4 run independently per new book, then
   review (step 5) merges approved entries into the shared library, with no
   code changes needed for a new book.

## Technical notes

- Suggested libraries: `pdf-parse` or `pdfjs-dist` (PDF text), `pdf-lib` /
  `pdf-poppler` (PDF page images), Tesseract.js (OCR), `epub.js` (EPUB).
- Runs as a one-time content-processing tool (Node.js script / small internal
  tool), separate from the mobile app — its output (reviewed, approved
  `PhraseMatch` entries) syncs into the app's content backend.
- Keep extraction and review/approval clearly separated in code: extraction
  produces drafts, review produces published content. Never skip review in
  the pipeline logic itself.

## Delivery order

1. File ingestion + storage structure for book source files.
2. Text + image extraction per page (PDF/EPUB, OCR fallback for scanned pages).
3. Rule-based phrase/vocabulary extraction from page text.
4. Text-to-image association logic (page-level pairing).
5. Admin review screen (approve/edit/reject extracted entries).
6. Book/level tagging + book-filtered browse view in Admin.
7. Run the full pipeline on the first licensed book end-to-end, review and
   publish its entries, confirm they work in the child-facing voice-matching
   screen.
8. Confirm the pipeline re-runs cleanly for the next book with no code changes.

## Blocked on

- Client confirming title/series/level for each book code above.
- Client providing the actual digital files (PDF/EPUB/images) she has
  permission for, or account access to retrieve them.
- The license/permission document reference for each book.
