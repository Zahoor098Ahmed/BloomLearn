# Open-License Book Content Sources

Replaces the Oxford pipeline plan for now — Oxford Learner's Bookshelf is
reading-access only and its permission terms don't cover AI/automated
extraction. The sources below are Creative Commons licensed and explicitly
permit extraction, adaptation, and reuse (including by automated/AI tools),
so the same extraction pipeline scoped in `oxford-content-pipeline.md`
(text/image extraction → phrase generation → Admin review → `PhraseMatch`
publish) can run on this content instead.

**Rule:** only ingest a source into the automated pipeline when both hold:
1. A confirmed, explicit license permitting extraction/reuse/derivatives
   (CC BY, CC BY-SA) — not just "free to read."
2. If the app is or may become commercial, no NonCommercial (NC) restriction
   — or separate commercial permission from the rights holder.

Log the license type per book in `bookSource.licenseRef` (same field used for
the Oxford entries) so the library stays auditable as it grows. License
permission doesn't guarantee extraction accuracy — every auto-extracted entry
still goes through the Admin review screen before publishing.

## Country research: Pakistan, India, Saudi Arabia

- **Pakistan** — eLearn.Punjab (PITB) is publicly described as "open content"
  but has no confirmed public API and no clearly published license terms;
  Taleemabad's open-license/API status is unconfirmed. **No confirmed
  CC-licensed, API-accessible Pakistani source found.** Treat like Oxford:
  don't run through automated extraction until written permission covering
  reuse (not just reading) is obtained.
- **India** — DIKSHA (NCERT/Govt of India) runs on MIT-licensed open-source
  software, but the *content* is restrictively licensed: NCERT textbooks are
  **CC BY-NC-ND** (NonCommercial + NoDerivatives — blocks the extraction/
  cropping this pipeline does outright); other DIKSHA resources are
  **CC BY-NC-SA** (reuse allowed, non-commercial only, share-alike). NROER is
  similarly CC BY-SA/NC-ND. **Do not ingest CC BY-NC-ND (NCERT) content** —
  extraction counts as a derivative work, which that license forbids. Any NC
  content is unsafe once/if the app is commercial, without separate
  permission.
- **Saudi Arabia** — Madrasati and Noor are login-restricted internal
  Ministry of Education systems, structurally like Oxford (reading access
  only). **No confirmed public CC-licensed source found.** Needs a specific
  written agreement with the Ministry or a publisher before reuse.

**Only GDL currently satisfies both conditions** from the research done so
far. Pakistani, Saudi, and NCERT-specific Indian content stay out of the
automated pipeline until individually confirmed in writing.

## Primary source: Global Digital Library (GDL)

- Site: digitallibrary.io · License: CC BY, openly licensed for use,
  adaptation and translation · Coverage: thousands of early-grade reading
  books in dozens of languages (useful for future Urdu/regional support).
- Repo: `github.com/GlobalDigitalLibraryio/book-api` — "API for fetching
  books from the Global Digital Library."

### API verification status (checked before building against it)

Tried to confirm current endpoints before wiring the pipeline to them, per
the plan's own instruction that API details may have drifted:

- The `book-api` repo's README has no endpoint list, base URL, auth, or
  example request/response — just the one-line description above.
- The historical public API hosts (`api.digitallibrary.io`,
  `gdl-api.digitallibrary.io`) **don't resolve (DNS failure)** from here —
  the API has likely moved or is no longer public at those addresses.
- `digitallibrary.io` itself is a JS-rendered single-page app; its book
  catalogue and search results load via client-side calls this tool can't
  execute, so the current live API base couldn't be observed that way either.
- The site's footer does link to `/about/developer/`, which is the right
  place to find the current endpoint — but its content is also behind the
  same JS rendering.

**Net result: could not confirm a working public API endpoint from this
session.** Before step 2 (API integration) starts, someone needs to either:
  - open `digitallibrary.io/about/developer/` in an actual browser and copy
    the current base URL / auth notes, or
  - open a network tab while browsing digitallibrary.io and note the XHR/
    fetch calls it makes, or
  - open an issue / check recent commits on the `book-api` repo for a
    working example.

**Fallback that works today without any of that:** GDL books can be read and
downloaded directly from digitallibrary.io per book (same as StoryWeaver
below) — usable as manual File Ingestion input immediately, API or not.

## Secondary source: StoryWeaver (Pratham Books)

- Site: storyweaver.org.in · Source open on GitHub (`PrathamBooks/sw-core`,
  `sw-web`, `sw-docker`) but no confirmed public content-fetching API.
- Read-online and bulk-download supported directly from the site.
- License is CC, but **varies per story** — verify per book before ingesting.
- Use: download PDFs/EPUBs per book via the site's own download feature, feed
  those files into the existing extraction pipeline (Step 1: File Ingestion) —
  same path as any direct-download source.

## Other sources (direct download only, no confirmed API)

| Source | URL | Notes |
|---|---|---|
| Bloom Library (SIL International) | bloomlibrary.org | Open-license early readers, downloadable PDF/EPUB |
| African Storybook Project | africanstorybook.org | CC-licensed, built for translation/adaptation |
| Book Dash | bookdash.org | Fully open-source model, source files openly available |
| Free Kids Books | freekidsbooks.org | Aggregator of CC-licensed children's/educational books, multiple publishers |

## Updated pipeline notes

- Same architecture as before (text/image extraction, phrase generation,
  Admin review, `PhraseMatch` publish) — only the input source changes, and
  AI/automated extraction is actually permitted on this content.
- Every auto-extracted entry still goes through Admin review before
  publishing — license permission doesn't prevent OCR errors or bad crops.
- Tag every entry with source platform, book title, and specific license type.

## Delivery order

1. ~~Review the GDL `book-api` repo for current endpoints/auth/format~~ — done
   above; **inconclusive**, needs a live-browser check to actually confirm.
2. Build the GDL API integration into File Ingestion — **blocked** until (1)
   is resolved, OR start with the direct-download fallback (works now) and
   swap in the API later.
3. Run 5–10 GDL books through the full pipeline end-to-end (extraction →
   phrase generation → Admin review → publish) to validate the approach.
4. Add StoryWeaver + the other direct-download sources as a secondary
   ingestion path.
5. Confirm license metadata is captured and stored per entry throughout.

## Blocked on

- Confirming GDL's current live API base URL / auth (or deciding to start
  with direct-download only and add the API later).
- Which languages/levels to prioritize first from GDL's catalogue (default:
  English, early-grade level, unless told otherwise).
