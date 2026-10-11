<!-- DRAFT for BOB, uncommitted, 2026-10-11, written on tranche/T42's checkout (T42-30, plane's transcriber, not merged yet). -->
# Draft: N853b, photographed pages (a picture file read as one picture page)

## 1. What happens today to a picture file, step by step

1. **Upload.** `uploadCapture` profiles with no content type (`capture/index.mjs`:1169), so the format comes from the bytes (`acquisition/index.mjs`:1351). No image entry is registered (`formats.mjs`:151–280), so the profile says `undetermined`.
2. **Reading, at promotion.** No entry (`reading-pipeline/index.mjs`:1129, :1158) and not text, so the last branch (:1298–1300) gives a failed reading, "not read as text", `page_count: null`. Extraction R19 still writes it as a `readings` row.
3. **`op=pagetranscribe`.** `reextractBasis` finds that row, so the capture is held (`extraction/index.mjs`:1296). The code always takes the `pdf` entry (:1567), which answers `NOT_A_PDF` (`pdfstructure.mjs`:3025). The member gets a **422 with no catalogue row** (:1572), not the `REEXTRACT_NOT_READ` that `draft-T43-cleanup.md` predicted.
4. **Rendering.** Plane R36 renders only with `renderPageToPixels` (`plane.md`:113), which refuses `NOT_A_PDF` (pdf-pixels R13). agent-worker takes only `image/png` up to 5 MiB (`transcribe.mjs`:62, :69; `ops.mjs`:91). Its R63 allows only pixels Civicsmith made, never the file's own bytes. **So neither a JPEG nor a PNG may be passed through as it is.**
5. **What exists.** image-codecs decodes baseline JPEG bit-exact with libjpeg (R1); progressive is refused. **No module decodes a general PNG** (`pngsamples.mjs` reads only what `pagepixels.mjs` writes). pdf-pixels has `encodePng8` (not exported) and `rotate8`. Nothing can shrink a picture.

**Size decides the design.** A 12-megapixel photo is 36.6 MB of RGB samples; its PNG is far over 5 MiB. It must be made smaller, not only re-encoded.

## 2. The smallest design that works, and the choices made

**(a) Formats.** format-registry gains `jpeg` and `png` entries (R29, R30), detected by magic bytes or exact content type, registered before `zip`. Their `structure` gives one page with no text and a `no_text_layer` marker, as a scanned PDF page has, and decodes nothing. HEIC (an HEVC decoder, patent-encumbered) and TIFF (rarely sent) stay `undetermined`.

**(b) The reading comes for free.** reading-pipeline R2 already reads any entry that has a `structure`:
- Tier 2 is skipped (every marker `no_text_layer`, R3). Tier 3's OCR member refuses (`PAGE_NOT_RENDERABLE`, ocr-worker R7 step 2), and R4 keeps the page unread with a note.
- The result: a failed reading, `page_count: 1`, `text_container: "jpeg"`, page 0 (the reading numbers from 0; page 1 to the member) unread, as an un-OCR'd scan PDF gives (so N862 reads it alike).
- **reading-pipeline needs no change** (`tier4Pages` is format-free). *Not taken:* making tier 3 skip pictures, a format branch outside the registry that would also block N853c.

**(c) Transcribing.** `pageTranscribe` stops hard-coding `pdf`:
- It detects the format from the stored bytes **now** (a pre-T43 photo was profiled `undetermined`), reads that entry, and uses the format as the chain's container.
- A format with no `structure` gets 200 `performed: false`: no new refusal row, no new words.

**(d) The picture sent to the AI.** pdf-pixels gains `renderPictureToPixels` (new `picturepixels.mjs`; `pagepixels.mjs` only exports `encodePng8`): decode (image-codecs R1, or the new PNG decoder R10), apply EXIF orientation, greyscale, integer box-reduce to a long edge of at most `maxEdge`, encode PNG. The plane falls back to it on `NOT_A_PDF`, so it needs no format branch.

*Options:* **A, chosen:** shrunk and grey. R63 is kept to the letter, and at a 1,568 px edge the PNG is at most about 1.8 MB, always under the cap. **B:** full size, almost always over the cap. **C:** pass-through, forbidden by R63 (Bob's, K1888); a PNG's text chunks would reach the model. Shrunk colour can still pass 5 MiB on a noisy photo.

**(e) Left out:** ocr-worker: unchanged; OCR over photos needs its own measurement (N853c). agent-worker: a wording fold only.

## 3. Requirement lines (the opening folds them; cite `(T43; N853b; K2611)`)

**format-registry (L1)**
- R23 amended: "…exactly twelve entries…: `html`, `pdf`, `docx`, `xlsx`, `pptx`, `odt`, `ods`, `odp`, `csv`, `jpeg`, `png` (R29, R30), `zip`…" *(not yet met: T43)*
- **R29** (T43; N853b; K2611) The built-in `jpeg` entry: `detect` answers `{format:"jpeg", confidence:"certain", signals}` when the bytes begin `FF D8 FF`; with no bytes, `likely` for a content type of exactly `image/jpeg`; otherwise `null`. `structure(bytes)` answers `{ok:true, pages:1, text:{document:"", pages:[{page:0, text:"", undetermined:[m]}], undetermined:[m], counts:{chars:0, undetermined:1}}}`, where `m` is `{page:0, reason:"no_text_layer", font:null, codes:"", count:0}`, and answers `{ok:false, container:"jpeg", reason:"NOT_A_JPEG"}` for bytes without the signature. It decodes nothing, and `parts` and `text` are `null`. *(not yet met: T43)*
- **R30** (T43; N853b; K2611) The built-in `png` entry, as R29: the signature `89 50 4E 47 0D 0A 1A 0A`, the content type `image/png`, and `NOT_A_PNG`. *(not yet met: T43)*

**image-codecs (L1)**
- Purpose: "…knows nothing of PDF, storage or place; PNG it reads as an input (R10) and writes none." 
- **R10** (T43; N853b; K2611) `decodePng(bytes) → Promise<samples>`, `PNG_REFUSES`, `PngRefusal` (`pngdecode.mjs`): colour types 0, 2, 3, 4, 6 at every legal depth, filters 0–4, IDAT inflated by `DecompressionStream("deflate")`, to 8-bit samples (alpha over white, 16-bit to its high byte, palette expanded). Interlaced, or a frame over the memory bound before allocation: `UNSUPPORTED` with a `PNG_REFUSES` key; damaged or short data under the codec's own codes. Pixel-exact against Pillow over PngSuite (R6). *(not yet met: T43)*
- R6 and R7 amended to name R10 and its reference.

**pdf-pixels (L1)**
- Purpose: "…a PDF page, an image a page places, **or a picture file (R42)**…"
- **R42** (T43; N853b; K2611) `renderPictureToPixels(bytes, pageIndex, {maxEdge, grey}) → {ok:true,…} | {ok:false, reason, why,…}` (`picturepixels.mjs`):
  Refusals: neither JPEG nor PNG `NOT_A_PICTURE`; `pageIndex` not 0 `NO_SUCH_PAGE` (`pageCount: 1`); `width × height × components` from the header over `PICTURE_FRAME_MAX` (exported, BOB's figure, measured at the job) `IMAGE_TOO_LARGE`, before any decode; codec refusals mapped as R22 and R25 map them, total over `PNG_REFUSES`. Then: decode, orient (R43), greyscale when `grey`, reduce by the smallest integer factor bringing the long edge to `maxEdge` or less (box average; partial edge boxes over the pixels present), encode an 8-bit PNG. Success: `{ok:true, page:0, route:"decoded-picture", mediaType:"image/png", bytes, width, height, upright:true, orientation, reduced_by, source:{format, width, height, comps}, pixels_sha256}`, pixel-exact against Pillow (`exif_transpose`, `convert("L")`, `reduce(k)`). *(not yet met: T43)*
- **R43** (T43; N853b) A JPEG's EXIF Orientation (APP1, tag 0x0112), values 1–8, is applied exactly, mirroring included. A missing or unreadable tag counts as 1. A PNG is never turned. *(not yet met: T43)*
- R39: the new reasons are keys of `REFUSALS`.

**extraction (L4)**, in the same job as N853a:
- R71 amended: "…the pages of a stored reading (a PDF's, or a picture file's one page, `format-registry` R29–R30)…"
- **R73** (T43; N853b; K2611; R71) `pageTranscribe` reads the capture's format as `format-registry.detectFormat(bytes, null)` answers it over the stored bytes, never the profile recorded at capture, and reads through that format's entry's `structure` as R71 reads `pdf`'s. The chain's container, `text_container` and provenance `container` are that format. A detected format with no `structure` answers `transcription: {performed:false, written:false, why}`, with `why` naming the format, and writes nothing. A picture promoted before T43 is transcribable with no re-read; R31 unchanged. *(not yet met: T43)*

**plane (L11)**
- R36 amended, appended: "(T43; N853b; K2611) A page `renderPageToPixels` answers `NOT_A_PDF` for is rendered by `pdf-pixels.renderPictureToPixels(bytes, page, {maxEdge: TRANSCRIBE_PICTURE_EDGE, grey: true})`. `TRANSCRIBE_PICTURE_EDGE` is exported, 1,568 px (BOB's figure, checked against the provider's documentation at the job's START). Its refusals leave the page unread, as the renderer's do." *(not yet met: T43)*

**agent-worker R63**, a fold only, already met: "(`decodeDct: true`, or its picture route, `plane` R36)".

**`modules.json`:**
- No new `uses` edge. pdf-pixels → image-codecs and extraction → format-registry exist already, and plane → pdf-pixels is added by T42's plane job (K2656).
- `paths` gain `pdf-worker/src/pngdecode.mjs` (image-codecs) and `picturepixels.mjs` (pdf-pixels); pdf-worker's and ocr-worker's bundles regenerate at L1's close.

**Merge order:** L1 format-registry → image-codecs → pdf-pixels (`modules.json` order; none of the three waits on another to merge); L4 extraction (after reading-pipeline's N853a); L11 plane (after T42-30).

**Tests:** each new line by its refusals with a negative control (K874); pdf-pixels: a 4032×3024 colour JPEG, Orientation 6, gives a portrait grey PNG of at most 1,568 px under 5 MiB; extraction end to end: an uploaded JPEG promoted, then a stub transcriber asked for page 0, the reading written with container `jpeg`; controls: a PDF scan answers byte for byte as before.

## 4. Questions

**Bob's: none blocks T43.** Report two as done: (1) a photo page goes to the AI, at the paying account's cost, because OCR cannot read photos yet; that is within D21's words, and N853c fixes it after a measurement. (2) iPhone HEIC is not read (an HEVC decoder is a licence and cost question, Bob's only if ever proposed; iOS browsers usually upload JPEG, which the job verifies).

**Design stream:** no key is required (N862's `transcribe.*` and `document.unread.pages` cover it). One NOTICE proposes `transcribe.picture.unprepared` and `capture.picture.unread` ("send a JPEG or PNG"), and asks whether `pagetranscribe` is offered beside a photo.

**BOB's, decided here:** JPEG and PNG only; grey, 1,568 px; `PICTURE_FRAME_MAX` measured; "no structure" answered `performed:false`; next entries N853c (OCR over photos) and N853d (progressive JPEG, TIFF); finding: the row-less 422 (`extraction/index.mjs`:1365, :1572).

## 5. Doable in T43?

**Yes, if adopted before L1's START.** About 650 lines; the PNG decoder (~300) is the only real build, and Pillow 12.3.0 is in the containers. Risks: decoding 12 MP inside the plane object (bounded by `PICTURE_FRAME_MAX`, measured); the plane share waits on T42-30. If that slips, L1 and L4 still land, and the AI path answers `NO_PAGE_RENDERED` until the plane's share lands.
