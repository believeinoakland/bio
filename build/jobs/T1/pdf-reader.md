# pdf-reader · T1 job record

**Status** · Job for `pdf-reader`, tranche T1, started by BOB #38. N9 answered by BOB #40 (K28) and merged from `tranche/T1` @ `d3a6d2e4`. Working all entries; two questions open (below), carried on meanwhile on my best readings.

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

## Entries

Not yet applied: T1-3, D-591, D-627, N9. I continue once BOB has added the services to my requirements.
