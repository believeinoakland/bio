# pdf-pixels — requirements

## Public

### Purpose

A PDF page, or an image a page places, as upright PNG pixels: page analysis, filter chains and routes,
rotation, PNG, and crop, with their declared refusal vocabularies (`REFUSALS`, `CROP_REFUSALS`). Tier 3
(`ocr-worker`) and `content` read through it. It writes nothing and holds no binding.

### Provides

**`renderPageToPixels(bytes, pageIndex, opts={}) → {ok:true, …} | {ok:false, reason, why, …}`** —
exported from `pagepixels.mjs`; the function `ocr-worker` imports directly (never over HTTP).
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
  decoded)}`. Its success `detail` also covers `jbig2` and `jpx` beside `ccitt` and `dct` (K54).
- **R21** `rotate_deg` and the rotation applied to the pixels are the page's `/Rotate`, an inheritable
  attribute: the page's own value, else the nearest `/Parent` ancestor's, else 0; normalised to 0/90/180/270.
  A `/Rotate` that is not a multiple of 90 answers `PAGE_UNREADABLE` (R15), never a guessed turn.
  `opts.rotate`, if given, is ignored — the page's value always wins.

**Decode rules**, shared by `renderPageToPixels` and `cropImage` (`decodeImage`):
- **R22** DCTDecode (the stream IS a JPEG), filter chain of length 1: by default passed through
  untouched — `route:"passthrough-dct"`, the publisher's own bytes, `upright` true only when the
  rotation is 0. With `opts.decodeDct` (only `renderPageToPixels` exposes this): decoded to an 8-bit PNG by
  `image-codecs`' JPEG decoder (its R1) — `route:"decoded-dct"`, rotated, `upright:true`, carrying `dct` detail and
  `pixels_sha256`. Refused `UNSUPPORTED_JPEG_PROCESS` (not baseline/extended-sequential Huffman, 8-bit);
  `UNSUPPORTED_SAMPLES` (a `/Decode` array on the image, a component count or sampling ratio the SOF
  marker does not support, or a `/ColorTransform` the file's own markers contradict); `TRUNCATED_IMAGE_
  DATA`; or `DECODE_FAILED`, as the bytes require. A filter chain with anything before `DCTDecode`
  answers `UNSUPPORTED_FILTER`.
- **R23** CCITTFaxDecode: decoded G3 (K=0) or G4 (K<0) by `image-codecs`' `ccittDecode` (its R2) to a 1-bit PNG, rotated exactly (a bit lands on a
  bit), `upright:true`, carrying `ccitt` detail and `pixels_sha256`. The filter immediately before it may
  only be `FlateDecode` (decoded first); any other predecessor, or mixed mode (K>0, refused because a
  stream with no EOL gives no way to read the per-row mode bit), answers `UNSUPPORTED_FILTER`. Fewer rows
  decoded than the image's declared height answers `TRUNCATED_IMAGE_DATA`; an unreadable stream answers
  `IMAGE_UNREADABLE`.
- **R24** No filter, or `FlateDecode` alone: 1-bit samples (an `/ImageMask` or 1-bpc grey) or 8-bit
  samples (grey or RGB) are copied/rotated to a PNG the same way, `upright:true`, carrying
  `pixels_sha256` on the 8-bit route. Any other colour-space/bit-depth combination (CMYK, 16-bit, …)
  answers `UNSUPPORTED_SAMPLES`; data short of the declared height answers `TRUNCATED_IMAGE_DATA`; a
  missing width/height or unreadable stream answers `IMAGE_UNREADABLE`. For an `/ImageMask`, a sample 0 paints and a sample 1 leaves the page unpainted under the default `/Decode` (PDF §8.9.6.2; K54).
- **R25** A `JBIG2Decode` image (with its `JBIG2Globals`) and a `JPXDecode` image are decoded by
  `image-codecs` (its R3, R4) to a PNG like R23 and R24, carrying `pixels_sha256`. A codec's refusal
  answers `UNSUPPORTED_FILTER`, naming the feature (for JBIG2, the segment type), or the `REFUSALS` reason
  this module maps that refusal key to; the mapping is total over `JBIG2_REFUSES` and `JPX_REFUSES`.
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

## Private

### Uses

- `pdf-reader`: `openPdf`, `PdfDoc` (`pageCount`, `pageDict`, `resolve`, `dictOf`, `streamRawBytes`,
  `streamDecoded`, `isEncrypted`), `pageShowsText(doc, pageMap)`, `pdfPageImages(doc, pageIndex)` and
  `imagePlacementSource(placement)`: named services only, never a private field (N9, K28).
- `image-codecs`: the JPEG, CCITT, JBIG2 and JPX decoders and their refusal sets (R1–R4, R7).

### Invariants

- **R39** Every `ok:false` answer's `reason` is a key of the declared `REFUSALS` (pixels) or
  `CROP_REFUSALS` (crop) object, and `why` is exactly that key's own text; a reason outside the set is a
  defect in this module, never a caller's to interpret.
- **R40** Pure per call: the same bytes and options always answer the same way; no clock, no randomness,
  no state carried between requests. A decode route (R22's `decodeDct`, R23, R25) is checked pixel-exact
  against an independent decoder's reference hash, never against this module's own prior output.
- **R41** No place is named in this module's code or in any refusal text; it holds no jurisdiction data.

### Satisfies

- `BIO_Content_Framework_v0_10.md` §16, "The non-text path, in three tiers": the pixel decode tier 3
  reads through, including D-585's `pageShowsText` rule.
- `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4 ("What a cited image resolves to") and §6: the
  crop as a derived rendition, and the pass-through/decoded-DCT routes.

### Suggestions

- `cropImage` has no production caller: only `bio-plane/test/d420-image-page.test.mjs` and
  `cpdf18-pdf-images.test.mjs` import it. `content` uses this module for it (K70).
- N34's JPX memory refusal is a `JPX_REFUSES` key in `image-codecs`; the job maps it to a `REFUSALS` reason (K70).
- The files stay in `pdf-worker/src/` (K70): a job runs this module's own tests by file, not `npm test`.

---

**Status** · Written by BOB #44, 2026-09-27, applying K70 (`build/extraction/pdf-worker-split.md` §3): R13–R34, R39 moved from `pdf-worker` unchanged in number; R22, R23, R25 and R40 reworded to cite `image-codecs`; R41 new (R38's rule for this module's code). Layer 1. R13–R40 met and tested in T2 as `pdf-worker`; R25's mapping clause and R41 are checked by this module's first job (T4-0b).
