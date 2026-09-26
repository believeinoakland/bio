# pdf-reader · T1 job record

**Status** · Job for `pdf-reader`, tranche T1, started by BOB #38. Waiting on BOB: N9's proposed services below, to be added to `build/requirements/pdf-reader.md` on `tranche/T1`.

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
