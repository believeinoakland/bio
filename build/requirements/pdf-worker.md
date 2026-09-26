# pdf-worker — requirements

## Public

### Purpose

The tier-2/tier-3-pixel member of the function-specific Worker fleet (I6): the dependency-laden PDF path
(`unpdf`/pdf.js, and this module's own image decoders) that cannot live in the plane's module graph
(MEASUREMENTS.md, 2026-07-31). It reads a captured PDF's bytes from its own R2 binding and returns the
record's own vocabulary — never a pdf.js object — for the plane and for `ocr-worker` to build on. It
writes nothing: no register row, no provenance, no capture, no task; a hop a caller can hand it is a hop
it never invents (D-112).

### Provides

**`POST /structure`** (service binding `PDF_WORKER`; path `/structure` or the empty path) — body
`{capture_sha, store}` → the I2 structure+text shape, or a named refusal.
- **R1** Before the body is read: when `env.CAPTURES.get` is not a function, answers 503
  `R2_NOT_CONFIGURED`.
- **R2** `capture_sha` is lower-cased, then must match 64 hex characters; a missing, non-string, wrong-
  length or non-hex value — including one from a body that failed to parse as JSON — answers 400
  `BAD_SHA`.
- **R3** `store` must be a string; anything else answers 400 `BAD_STORE` (checked before R4, so an
  absent `store` never reaches it).
- **R4** `store` must be exactly `"bio"` or `"scratch"`, case-sensitive; any other value, including a
  case variant, a well-formed but unlisted name, or `""`, answers 400 `NAMESPACE_UNKNOWN` carrying
  `asked` (the value, truncated to 80 chars) and `namespaces` (the two names, in order). This set is
  copied from, and tested equal to, the plane's own (D-478, D-456); it is not this member's to widen.
- **R5** Reads the capture from `CAPTURES` at the R2 key `${store}/captures/${sha}`, by `.get` only. A
  missing object answers 404 `NOT_FOUND` with `capture_sha` and `store`; nothing else is inferred about
  why.
- **R6** Runs `pdf-reader.extractPdfStructure` over the bytes. When it answers `ok:false` (not a PDF, or
  not bytes), that answer is returned verbatim at 422 and no tier-2 pass runs.
- **R7** Otherwise its `.text` is replaced by this member's own reading and `.tier` is set (1 or 2) by
  R8–R10; every other field `extractPdfStructure` produced is passed through unchanged, at 200.
- **R8** Over envelope: bytes larger than `MAX_PDF_BYTES` (env override, default 16,777,216) skip tier 2:
  `.text` becomes `{document:"", pages:[], undetermined:[{page:null, reason:"over_envelope", font:null,
  codes:"", count:0, bytes, limit}], counts:{chars:0, undetermined:1}}`, `.tier` is 1, and
  `"tier2_declined_over_envelope"` is appended to `.notes`.
- **R9** Tier 2, otherwise: `unpdf` extracts each page's text (pages kept separate). `.text.pages` is one
  `{page, text, undetermined}` per page; a page whose trimmed text is empty carries one
  `{page, reason:"no_text_layer", font:null, codes:"", count:0}` marker, in its own `undetermined` and in
  the document-level list. `.text.document` joins the non-empty pages' text with `"\n"`.
  `.text.counts` is `{chars: document.length, undetermined: undetermined.length}`. `.tier` is 2.
- **R10** Tier-2 failure: when the tier-2 pass throws, `.text` becomes `{document:"", pages:[],
  undetermined:[{page:null, reason:"tier2_extraction_error", font:null, codes:"", count:0}],
  counts:{chars:0, undetermined:1}}`, `.tier` is 1, and `"tier2_error:<message, first 80 chars>"` is
  appended to `.notes`; the R6 structure fields are kept, and nothing is invented.

**`GET /version`** → `{ok:true, name:"pdf-worker", version: env.VERSION || "0.0.0"}`, always 200, read
from the deployed Worker's own `VERSION` var — never a constant compiled into the bundle, so it answers
the build actually serving rather than the build that was meant to (D-108).
- **R11** As stated. Never throws.

**Any other request** (any path but `structure`/`""`/`version`, or the wrong method) — **R12** answers
404 `{ok:false, reason:"UNKNOWN", detail:"POST /structure or GET /version only"}`.

**`renderPageToPixels(bytes, pageIndex, opts={}) → {ok:true, …} | {ok:false, reason, why, …}`** —
exported from `pagepixels.mjs`; the one function `ocr-worker` imports directly (never over HTTP; this
member has no member-facing route for it).
- **R13** `bytes` must carry a `%PDF-` header in its first 1024 bytes, else `NOT_A_PDF`.
- **R14** An encrypted document answers `ENCRYPTED`.
- **R15** `pageIndex` outside `[0, pageCount)` answers `NO_SUCH_PAGE` with `pageCount`; a page object
  that cannot be read (in range) answers `PAGE_UNREADABLE`.
- **R16** A page that SHOWS text — `pdf-reader.pageShowsText`: a text-showing operator (`Tj`, `TJ`, `'`,
  `"`) runs in its content or in a Form XObject it draws; a bare `BT` is not text (D-585) — answers
  `PAGE_HAS_TEXT_LAYER` with `imageCount`, unless `opts.allowTextPage` is true.
- **R17** A page that paints no image (`pdf-reader.pdfPageImages`) answers `NO_IMAGE_ON_PAGE` when it also paints no vector mark
  (a fill, stroke or shading operator; a clip alone does not count), else `NOT_IMAGE_ONLY`.
- **R18** A page painting more than one image (counted from what it paints, `pdf-reader.pdfPageImages`,
  never from the image XObjects its `/Resources` lists) answers `MULTIPLE_IMAGES_ON_PAGE`, with every image's
  `{width, height, filters}`; images are never composited.
- **R19** The one remaining image is decoded per R22–R25; its own refusal, if any, is returned with
  `page` added.
- **R20** On success: `{ok:true, page, route, mediaType, bytes, width, height, upright, rotate_deg,
  source:{filters, colorSpace, bitsPerComponent, imageMask}, page_geometry:{mediaBoxPt, rotate, dpi},
  page_marks:{hasTextOps, hasVectorOps}, …(ccitt|dct detail when decoded), …(pixels_sha256 when
  decoded)}`.
- **R21** `rotate_deg` and the rotation applied to the pixels are the page's `/Rotate`, an inheritable
  attribute: the page's own value, else the nearest `/Parent` ancestor's, else 0; normalised to 0/90/180/270.
  A `/Rotate` that is not a multiple of 90 answers `PAGE_UNREADABLE` (R15), never a guessed turn.
  `opts.rotate`, if given, is ignored — the page's value always wins.

**Decode rules**, shared by `renderPageToPixels` and `cropImage` (`decodeImage`, private to this module):
- **R22** DCTDecode (the stream IS a JPEG), filter chain of length 1: by default passed through
  untouched — `route:"passthrough-dct"`, the publisher's own bytes, `upright` true only when the
  rotation is 0. With `opts.decodeDct` (only `renderPageToPixels` exposes this): decoded to an 8-bit PNG
  bit-exact with libjpeg (ISLOW IDCT, fancy chroma upsampling, fixed-point YCbCr, libjpeg's colour-
  transform rule) — `route:"decoded-dct"`, rotated, `upright:true`, carrying `dct` detail and
  `pixels_sha256`. Refused `UNSUPPORTED_JPEG_PROCESS` (not baseline/extended-sequential Huffman, 8-bit);
  `UNSUPPORTED_SAMPLES` (a `/Decode` array on the image, a component count or sampling ratio the SOF
  marker does not support, or a `/ColorTransform` the file's own markers contradict); `TRUNCATED_IMAGE_
  DATA`; or `DECODE_FAILED`, as the bytes require. A filter chain with anything before `DCTDecode`
  answers `UNSUPPORTED_FILTER`.
- **R23** CCITTFaxDecode: decoded G3 (K=0) or G4 (K<0) to a 1-bit PNG, rotated exactly (a bit lands on a
  bit), `upright:true`, carrying `ccitt` detail and `pixels_sha256`. The filter immediately before it may
  only be `FlateDecode` (decoded first); any other predecessor, or mixed mode (K>0, refused because a
  stream with no EOL gives no way to read the per-row mode bit), answers `UNSUPPORTED_FILTER`. Fewer rows
  decoded than the image's declared height answers `TRUNCATED_IMAGE_DATA`; an unreadable stream answers
  `IMAGE_UNREADABLE`.
- **R24** No filter, or `FlateDecode` alone: 1-bit samples (an `/ImageMask` or 1-bpc grey) or 8-bit
  samples (grey or RGB) are copied/rotated to a PNG the same way, `upright:true`, carrying
  `pixels_sha256` on the 8-bit route. Any other colour-space/bit-depth combination (CMYK, 16-bit, …)
  answers `UNSUPPORTED_SAMPLES`; data short of the declared height answers `TRUNCATED_IMAGE_DATA`; a
  missing width/height or unreadable stream answers `IMAGE_UNREADABLE`.
- **R25** *(not yet met: D-622)* A `JBIG2Decode` image (generic region, MMR and arithmetic coding, with
  `JBIG2Globals`) and a `JPXDecode` image are decoded to a PNG like R23 and R24, carrying `pixels_sha256`,
  pixel-exact against an independent reference decoder. What cannot be decoded answers `UNSUPPORTED_FILTER`,
  naming the feature. Today both filters answer `UNSUPPORTED_FILTER`.
- **R26** A route that DECODES samples (R23, R24, or R22 with `decodeDct`) carries `pixels_sha256`, a
  SHA-256 over the normalised packed/interleaved samples taken before any container is built; a
  pass-through route (R22 default) carries none, its bytes being the publisher's own and byte-stable by
  definition.

**`cropImage(bytes, extent) → {ok:true, derived:true, …} | {ok:false, derived:true, reason, why, …}`** —
exported from `imagecrop.mjs`. Fully built and tested; **no production caller reaches it today** — see
Status.
- **R27** `extent` must be `{kind:"image", page:<integer>, rect:[x0,y0,x1,y1]}`, four finite numbers, no
  `part`; else `NOT_AN_IMAGE_EXTENT` (wrong kind, or `page` not an integer, or `part` given) or
  `RECT_REQUIRED` (rect missing or malformed — a page alone names no one image to crop).
- **R28** `NOT_A_PDF`, `ENCRYPTED`, `NO_SUCH_PAGE` as R13/R14/R15.
- **R29** When the page's paint order cannot be walked, `PAGE_UNWALKABLE` carrying `pdf-reader.
  pdfPageImages`'s own `why`.
- **R30** The rect is matched, within 0.001 pt after normalising (`x0<x1`, `y0<y1`), against every image
  the page paints. No match: `NO_IMAGE_AT_RECT` with every rect the page did paint. More than one match:
  `AMBIGUOUS_RECT` with the count. A match that is an inline image: `INLINE_IMAGE`.
- **R31** The matched image is decoded per R22–R25 with rotation forced to 0 (a crop is never turned); a
  decode refusal answers `DECODE_REFUSED` naming the decoder's own `reason` and `why`.
- **R32** On success: `{ok:true, derived:true, rendition:"crop", why, of:{kind:"image", page, rect},
  capture_sha256, placement:{name, axis_aligned, filters}, route, mediaType, bytes, width, height,
  upright, file_sha256, pixels_sha256?}`. `capture_sha256` (of the whole capture) and `file_sha256` (of
  the returned crop bytes) are always present; `pixels_sha256` only on a decoded route.
- **R33** `upright` is `true` only when the placement's matrix is a plain positive scale-and-translate (no
  rotation, skew or flip) AND the decoder itself reports upright samples; otherwise `null` — never
  guessed.
- **R34** Never composites marks drawn over the image and never applies the placement's own rotation or
  flip: the crop is the image exactly as the file stores it (EXTRACTION-BREADTH §3.4).

**`SURFACE`** (exported constant) **and `fleet-member.json`** — read by the fleet-coverage instrument
(`bio-plane/scripts/coverage.mjs`, in `legacy-index`).
- **R35** `SURFACE` names exactly `structure` (`POST`) and `version` (`GET`), each `mutating:false` — this
  member asserts nothing (fleet rule 2).
- **R36** `fleet-member.json` names `entry` (`src/index.mjs`), `surface` (`"SURFACE"`), `testDir`
  (`"test"`), and the bundle recipe: `entry`, `outfile: dist/pdf-worker.bundled.mjs`,
  `manifest: dist/pdf-worker.bundle.json`.

## Private

### Uses

- `pdf-reader`: `extractPdfStructure(bytes)` for the I2 structure baseline; `openPdf`, `PdfDoc`
  (`pageCount`, `pageDict`, `resolve`, `dictOf`, `streamRawBytes`, `streamDecoded`, `isEncrypted`),
  `pageShowsText(doc, pageMap)`, `pdfPageImages(doc, pageIndex)` and `imagePlacementSource(placement)`
  for the page-image and text-marks readers — named services only, never a private field (N9, K28).

### Invariants

- **R37** Never writes. Holds no `STORE` (Durable Object) binding and no `PUBLISHED` binding; `CAPTURES`
  (R2) is the only data binding and is only ever `.get`, never `.put`, `.head` or `.delete`.
- **R38** No place is named in this module's code or in any refusal text; it holds no jurisdiction data
  (grepped 2026-09-25: none outside one comment citing an Oakland measurement as evidence).
- **R39** Every `ok:false` answer's `reason` is a key of the declared `REFUSALS` (pixels) or
  `CROP_REFUSALS` (crop) object, and `why` is exactly that key's own text; a reason outside the set is a
  defect in this module, never a caller's to interpret.
- **R40** Pure per call: the same bytes and options always answer the same way; no clock, no randomness,
  no state carried between requests. A decode route (R22's `decodeDct`, R23) is checked pixel-exact
  against an independent decoder, never against this module's own prior output.

### Satisfies

- `BIO_Content_Framework_v0_10.md` §16, "The non-text path, in three tiers" — this member IS tier 2
  (`/structure`'s text), and supplies the pixel decode tier 3 (`ocr-worker`) reads through, including
  D-585's `pageShowsText` rule and D-501/D-514's glyph-not-character comparison this member's page-level
  markers make possible.
- `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4 ("What a cited image resolves to") and §6 (D-320,
  the DCT decoder) — the crop as a derived rendition, and the pass-through/decoded-DCT routes.

### Suggestions

- `cropImage` has no production caller: only `bio-plane/test/d420-image-page.test.mjs` and
  `cpdf18-pdf-images.test.mjs` import it, driving it directly rather than through any plane op, and
  `content`'s `uses` in `modules.json` does not name `pdf-worker` even though EXTRACTION-BREADTH §3.4 is
  written for a viewer only a plane op could reach. Worth BOB's attention when `content` is extracted.
- `unpdf` (pdf.js) 1.8.0 is pinned; `Math.sumPrecise` is polyfilled only where the runtime lacks it
  (guards node, not workerd, where the native one runs — CPDF-5).
- `scripts/build.mjs` inlines `unpdf` and commits `dist/pdf-worker.bundled.mjs` plus its manifest; the
  guard that the two match source (FL-9) lives in `bio-plane/test/fleetbundles.test.mjs`, outside this
  module's own `test/`.

---

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code today: `pdf-worker/src/index.mjs`,
`pdf-worker/src/pagepixels.mjs`, `pdf-worker/src/dctdecode.mjs`, `pdf-worker/src/imagecrop.mjs`,
`pdf-worker/src/pagepixels-worker.mjs` (the last a workerd-only test entry point, not a requirement).
R21 reworded by BOB #40, 2026-09-26 (K27): it had stated the D-671 defect as the requirement. R17 and R18
count painted images (K27). R25 is not yet met: JBIG2- and JPX-filtered
images are refused rather than decoded, leaving 14 held pages unread by every tier (D-622, queued,
M-166).
