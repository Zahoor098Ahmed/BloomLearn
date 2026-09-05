# GDL API findings

Investigation of `github.com/GlobalDigitalLibraryio/book-api`, and the
working API that replaces it. Written so nobody repeats this from scratch.

## The `book-api` repo (Scala) — deprecated

Cloned and inspected the source directly (not just the README):

- **Real routes exist in code** — `src/main/scala/io/digitallibrary/bookapi/BookApiProperties.scala`
  defines `/book-api/v1/books`, `/book-api/v1/search`, `/book-api/v1/languages`,
  `/book-api/v1/levels`, `/book-api/v1/categories`, `/book-api/v1/translations`,
  `/book-api/v1/export`, mounted in `ScalatraBootstrap.scala`. `BooksController.scala`
  confirms `GET /`, `GET /:lang`, `GET /:lang/:id`, `GET /:lang/:id/chapters`, etc.
  So the paths assumed in earlier planning were structurally correct.
- **The actual hostname isn't in this repo** — it resolves via
  `io.digitallibrary.network.Domains.get(Environment)`, a class from a
  separate/private shared library not included here, so the production host
  can't be recovered from source alone.
- **Last commit: 2020-10-02.** Five years stale.
- **Open issue #194, "Document how to use book-api," opened April 2022, still
  unanswered** — confirms nobody has documented live usage since well after
  the last commit; no successor project is mentioned anywhere in the repo's
  open issues.
- The previously-assumed hosts `api.digitallibrary.io` and
  `gdl-api.digitallibrary.io` do not resolve (checked again during this pass).

**Conclusion: this service is abandoned.** Do not spend further time trying
to stand it up or guess its production host.

## The actual live API — confirmed working

GDL's current site (`digitallibrary.io`) runs on a different, WordPress-based
backend at **`content.digitallibrary.io`**, not the old Scala service:

```
Base:      https://content.digitallibrary.io/wp-json/content-api/v1
Books:     GET  /books/:lang                          e.g. /books/en
Search:    GET  /contentsearch?query=&language=        e.g. ?query=animals&language=en
Languages: GET  /languages
Topics:    GET  /topics
Topic menu:GET  /topic-menu?language=
Specific H5P: GET /h5p/:id
H5P by lang:  GET /wp-json/h5p-restapi-content/v1/lang/:lang
```

Verified live (this session): `books/en` returns 200 with real book JSON;
`contentsearch?query=cat&language=en` returns matches; each book entry
includes a per-book `license` (e.g. `CC-BY-4.0`, `CC-BY-SA-4.0`,
`CC-BY-NC-4.0` — **license varies by book, confirmed, not assumed**), a
`level`/`topic` tag, and an `epubUrl`
(`https://content.digitallibrary.io/wp-json/epub-generator/v1/book/:id`)
that returns a real `application/epub+zip` file — downloaded and opened
successfully (`adm-zip`, 42 entries) during this session.

No authentication needed for any of the above.

## Decision taken

**Path B (manual/API-hybrid), not blocked further on API archaeology**: built
`content-pipeline/` against the confirmed `content.digitallibrary.io` API
directly (Task 2's "if a working API can be identified, build against it" —
one was, once we stopped assuming the old book-api and found the real one).
No manual per-book download step was needed after all.

## First pipeline test run (Task 3 / step 3 of the brief)

`node src/run.js --lang en --count 8`, default license filter (CC BY /
CC BY-SA only — NC/ND excluded per `open-license-content-sources.md`):

| Book | License | Pages | Images | Draft entries |
|---|---|---|---|---|
| I Love My Mom | CC-BY-4.0 | 16 | 17 | 30 |
| I love my mom (dup./alt. edition) | CC-BY-SA-4.0 | 14 | 16 | 17 |
| The Lost Doll — with audio | CC-BY-SA-4.0 | 19 | 22 | 36 |
| Elders! | CC-BY-4.0 | 15 | 14 | 22 |
| Everyone Eats. | CC-BY-SA-4.0 | 17 | 20 | 17 |
| My home | CC-BY-SA-4.0 | 19 | 23 | 24 |
| Playground | CC-BY-SA-4.0 | 17 | 20 | 16 |
| I Love My Mom (static .epub, not generator) | CC-BY-4.0 | — | — | **failed** — zip wouldn't open even after 3 retries; skipped, doesn't block the batch |

**7 of 8 books ingested; 162 draft entries; one licensed-NC book
("Buibere the Hero", CC-BY-NC-4.0) was correctly excluded by the license
filter, not just skipped by luck.**

Issues found and fixed during this run (exactly what the Admin review step
in the brief is for):
- The `epub-generator` endpoint is built on demand and was intermittently
  truncated on quick repeat requests — fixed with a 3-attempt retry.
- Cover/title pages have no real sentence (`"]> Page 1"` artifacts from a raw
  CDATA marker, or just `"Page 4"`) — stripped the CDATA artifact and added a
  `needsReview: true` flag per page when there's no real text, so these don't
  silently produce nonsense entries or get missed.
- Auxiliary "is/are/was/were" were dropped from the verb list — true to the
  page text but not a useful AAC trigger phrase.
- One static (non-generator) `.epub` URL genuinely wouldn't open as a zip
  after retries — logged and skipped, doesn't stop the batch.

Output: `content-pipeline/content-source/gdl/draft-entries.json` (162
entries, all `status: "draft"`) plus each book's `meta.json` / `extracted.json`
/ `images/`. See `content-pipeline/README.md` for the format and for what
still needs deciding before anything here reaches the child-facing app (no
Admin/PhraseMatch screen exists in KiddoCare yet).
