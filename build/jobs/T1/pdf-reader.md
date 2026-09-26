# pdf-reader · T1 job record

**Status** · COMPLETE, 2026-09-26. Job for `pdf-reader`, tranche T1, started by BOB #38. N9 was answered by BOB #40 (K28) and merged from `tranche/T1` @ `d3a6d2e4`. All four entries are applied. Two questions remain open (below); both are built on my best readings, and an answer that differs is a small change.

## QUESTION to BOB (2026-09-26)

**Q1 · R26's figures.** R26 leaves the image-share threshold and the glyph floor UNDETERMINED "until D-627's own measurement is run". That measurement exists: M-178, on the snapshot branch at `land/worker/D-627` @ `056d3092` (`docs/development/measurements/M-178.md`). It ran over the FY23-25 budget book and M-174's other two documents: 1,788 pages, 307 of them painting an image. It found 17 image-only pages with at most 4 glyphs and image shares from 0.1897 to 0.6542. Every other page that paints an image shows at least 22 glyphs, and no page falls between. This job cannot re-run it: the corpus is in the instance's store, not in the repository.
*My best reading, which I am building:* adopt M-178's figures.
- A page that paints an image, is not already `no_text_layer`, shows at most **4** glyphs and has an image share of at least **0.18** gets `image_content_unread`.
- The same kind of page gets `image_content_undetermined` when it shows **5–21** glyphs, when its share is above 0 and under 0.18, or when its page box is unreadable.
- A page that shows **22** or more glyphs gets no marker.
- Both markers carry `image_share` and `glyphs`.

Please either state these figures in R26 or give others.

**Q2 · R25, where the trailing-byte count goes.** R25 says a Flate stream with trailing junk still decodes, "with the trailing-byte count recorded", but does not say where. R2's `notes` list is closed.
*My best reading, which I am building:*
- The count goes in `notes` as `flate_trailing_bytes:<n>`, once per stream, and R2's list gains that note.
- The page-level marker R25 asks for is `{page, reason:"content_stream_undecodable", font:null, codes:"", count:0}`.
- A page whose `/Contents` reference resolves to nothing gets `reason:"content_stream_unresolvable"`, so that a missing stream is not read as a blank page either (R27).

## For BOB: N9, the proposed named services

What `pdf-worker` reads today through private fields (found in `pdf-worker/src/pagepixels.mjs` and `imagecrop.mjs`):

| private read | where | what it is for |
| --- | --- | --- |
| `for (const [num, v] of doc.objects)` stamping `v.map.__objnum` | `pagepixels.mjs` `loadPdf` | part of the open sequence copied from `extractPdfStructure`. Nothing in either module reads `__objnum` back: the stamp is dead. |
| `doc._pageOrder.length` | `pagepixels.mjs` `renderPageToPixels`, `imagecrop.mjs` | the page count, already public as `.pageCount` (R19) |
| `doc.dictOf({t:"ref", n: doc._pageOrder[i]})` | `pagepixels.mjs` `analyzePage` | the resolved dict of page `i` |
| placement `._stream` | `imagecrop.mjs` | the image XObject's stream, to decode it |
| placement `._ctm` | `imagecrop.mjs` | the composed CTM, to decide whether the image is upright |

I propose four named services. With them, `.objects`, `._pageOrder` and the `_stream`/`_ctm` properties become private, and R18-R19's text about the two fields reading as interface is dropped.

**openPdf(bytes) → Promise\<PdfDoc|null\>**
- Inputs: `bytes`, the assembled PDF.
- Output: a `PdfDoc` that has run `scanTopLevel`, `loadObjectStreams` and `buildPageIndex` (R8's lenient read), ready for every other method and service. `extractPdfStructure` opens its document the same way, so both modules read one document identically.
- Errors: `bytes` not a `Uint8Array`, or no `%PDF-` signature in the first 1024 bytes → `null`. Never throws.
- Replaces `pdf-worker`'s own `loadPdf` sequence and its iteration of `.objects`. The dead `__objnum` stamp is removed from `pdf-reader`.

**PdfDoc.pageCount** (already R19, restated as the only page count)
- Output: the number of pages in page order after `buildPageIndex`; `0` before it runs or when the document has no pages.
- Replaces `(doc._pageOrder || []).length`.

**PdfDoc.pageDict(pageIdx) → object|null**
- Inputs: `pageIdx`, a 0-based page index.
- Output: the resolved dict (`map`) of the page at that index in page order (R8).
- Errors: `pageIdx` not an integer, out of `[0, pageCount)`, or the page object unresolvable → `null`. Never throws.
- Replaces `doc.dictOf({ t:"ref", n: doc._pageOrder[i] })`. `pageShowsText(doc, pageMap)` takes its result unchanged.

**imagePlacementSource(placement) → { stream, ctm } | null**
- Inputs: `placement`, one element of the `images` array `pdfPageImages` returned.
- Output: `stream`, the image XObject's stream value (readable with `resolve`, `streamRawBytes`, `streamDecoded`), or `null` for an inline image; `ctm`, a fresh copy of the six-number composed CTM `[a,b,c,d,e,f]` the placement's `rect` was computed from (R16).
- Errors: anything not produced by `pdfPageImages` (including a copy of a placement) → `null`. Never throws.
- Behaviour: held in a `WeakMap` keyed by the placement rather than as hidden properties, so a placement's enumerable shape (R16) is unchanged and nothing can be read by a field name.
- Replaces `hit._stream` and `hit._ctm`.

What stays interface, unchanged: `resolve`, `dictOf`, `streamRawBytes`, `streamDecoded`, `isEncrypted` (R20-R23), `pageShowsText` (R15), `pdfPageImages` (R16-R17). `new PdfDoc(bytes)` and the three load methods stay exported for `openPdf`'s own use and tests, but `pdf-worker` needs only `openPdf`.

`pdf-worker`'s change (BOB carries it, N9 there): `loadPdf` becomes `openPdf`; `_pageOrder.length` becomes `pageCount`; the page lookup becomes `pageDict`; `_stream`/`_ctm` become `imagePlacementSource(hit)`.

## Completion (2026-09-26)

### Entries applied

- **N9.** New services, as K28 states them:
  - `openPdf(bytes)` (R30).
  - `PdfDoc.pageDict(pageIdx)` (R31).
  - `imagePlacementSource(placement)` (R32). It is held in a module-private `WeakMap`, so a placement's own enumerable fields are exactly R16's.
  - `pageCount` (R19), unchanged.

  Other changes:
  - `extractPdfStructure` and `pdfPageImages` now open and walk documents only through these services.
  - The dead `__objnum` stamp is removed.
  - The `_stream`/`_ctm` properties are gone.
  - `.objects` and `._pageOrder` keep their names and are private by contract. I did not rename them, so `pdf-worker`'s page reads keep working until it switches.
- **D-591 (R25).**
  - A zlib stream followed by trailing bytes now keeps its inflated output. The output is kept only when it is proven complete: its Adler-32 must appear in the input, and the prefix ending there must inflate to the same bytes. The proof does not depend on any runtime's error wording.
  - The count is noted once per stream as `flate_trailing_bytes:<n>` (Q2).
  - A page whose content stream will not decode carries `content_stream_undecodable`. A page whose `/Contents` resolves to no stream carries `content_stream_unresolvable`. Both are page-level markers with count 0, so neither reads as a blank page.
- **D-627 (R26).** I kept the built work at `land/worker/D-627` @ `056d3092` for `pdfstructure.mjs` only, adapted to `pageDict`. Its three thresholds are no longer exported. It emits `image_content_unread` and `image_content_undetermined`, both carrying `image_share` and `glyphs`, on M-178's figures (Q1).
  - Not kept: the built work's `index.mjs` routing, which belongs to legacy-index (see Reported).
  - Not kept: its fixture, a real budget-book excerpt. R29 wants hand-built fixtures.
- **T1-3.** `bio-plane/test/m/pdf-reader/` holds 48 tests in 4 files, plus `pdf.mjs`, a hand-built PDF writer. They name all 32 live ids and check them through the module's exports only.
- **Flaws fixed in my module along the way:**
  - `resolve` handed back the reference itself when a chain cycled past 64 hops. It now returns `null` (R20).
  - Object-stream parsing could throw; it now uses the safe parser (R19).
  - A page object that does not resolve now carries `page_unreadable` instead of reading as blank (R27).

### Deferred

Nothing is deferred. Two figures and one field name depend on BOB's answers: R26's thresholds (Q1) and the name and place of R25's count (Q2).

### Reported: other modules (against their requirements)

- **pdf-worker (N9).**
  - `imagecrop.mjs` still reads `hit._stream`/`hit._ctm`, which no longer exist. Every crop now refuses `INLINE_IMAGE`. This shows in the old battery's `cpdf18-pdf-images.test.mjs` as 4 failures, all crops, and 25 passes. The fix is to switch to `imagePlacementSource(hit)`.
  - `pagepixels.mjs` should switch `loadPdf` to `openPdf`, `_pageOrder.length` to `pageCount`, and the page lookup to `pageDict`. It still works today only because the private fields kept their names.
  - `pdf-worker`'s own tests pass on this branch: `pdf-worker` 67/67 and `pagepixels` 120/120, the same as before my change.
- **legacy-index.** D-627's routing half is not in this module. For `image_content_unread` to reach OCR, `needsTier3` in `bio-plane/src/index.mjs` must treat that marker as it treats `no_text_layer`. The built work at `056d3092` has that 14-line change.
- **legacy-tests.** `textshown.test.mjs` reads `doc._pageOrder`, which is now private; it should use `pageDict`. The `cpdf18` crop failures are listed under pdf-worker.
- **Generated artifacts made stale** (manifest §Generated artifacts; not written by me): `pdf-worker/dist/pdf-worker.bundled.mjs`, `ocr-worker/dist/ocr-worker.bundled.mjs` and `bio-plane/dist/bio-plane.bundled.mjs`, with their `.bundle.json` files. All three embed `pdfstructure.mjs`.

### Tests and checks run

- `node --test bio-plane/test/m/pdf-reader/`: tests 48, pass 48, fail 0.
- Layer tests: none are named in `build/manifest.md`.
- Users of the changed service, run against this branch:
  - `pdf-worker/test/pdf-worker.test.mjs`: 67 passed, 0 failed.
  - `pdf-worker/test/pagepixels.test.mjs`: 120 passed, 0 failed.
- The old battery's PDF tests, run for regressions: `pdfstructure` 170/0, `d608-form-text` 16/0, `producer-provenance` 58/0, `textshown` 34/0, `pdfstructure-op` 29/0, `tier-pagewise` 127/0, `capture-pagecount` 22/0, `cpdf18-pdf-images` 25 pass / 4 fail (the pdf-worker crops above).
- `checks/format.mjs`: 61 modules, 17 requirements files; 0 failures.
- `checks/architecture.mjs pdf-reader`: 6 product files, 11 relative imports; 0 failures.
- `checks/coverage.mjs pdf-reader`: 32 of 32 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs pdf-reader tranche/T1`: 7 files changed by pdf-reader; 0 failures.

### Metrics

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_01V8T49KLDauzP7JvxJMpQSz,job,pdf-reader,11616898,285766,134,77386,67,12,2731
```
