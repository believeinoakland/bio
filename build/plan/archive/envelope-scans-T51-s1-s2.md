> **Split K5021.** Archived whole, unchanged, from `build/plan/envelope-scans-T51.md` (finished: a family plan whose architecture K4798 (1) round 9 took up; no live document names its §1 or §2). Contains §1 (the architecture) and §2 (the state of the code). The rest: the head, §0, §3: `envelope-scans-T51.md`; §4, §5, §6, §7: `envelope-scans-T51-s4-s7.md`.

## 1. The architecture: how a scan or an image flows (K4798 (1))

### 1.1 One flow, by stage, with the module and the requirement each stage serves

The numbers are requirement ids in the module's own file under `build/requirements/`. "K" ids are Bob's rulings. A stage with "none" is a stage no requirement states.

| # | Stage | Module and entry (file:line) | What it does for a scan or image | Requirement it serves |
|---|---|---|---|---|
| 1 | **Door: upload** | capture `uploadCapture` (`capture/index.mjs:682-858`); screen `screens-intake/capture.mjs:506-507` (`accept="image/*,video/*,audio/*,application/pdf,..."`, `capture="environment"`) | One file input (the phone camera is `capture=environment`); no custom drag/drop; the server takes **any** bytes up to 256 MiB in 8 MiB parts, hashing as they stream; keeps part buffers to 32 MiB then puts the whole, else hands the keep to the ledger. `accept` is a client hint only. | capture R86 (the upload as bytes); **no requirement states the types taken, any pixel bound, or what the door says about an unread image** (G) |
| 2 | **Door: web capture** | acquisition `acquire` (`capture/ops.mjs:154-171`, `acquisition/index.mjs:1273-1585`) | An image URL is just a body: type from the response header, 8 MiB parts, over 8 MiB declared or 10 s parked as ledger kind `fetch`. Images **inside** a page are subresources (`subresources.mjs:51-55`: 400 bodies, 8 MiB each, 64 MiB), stored as evidence objects and never detected, read or marked; the rendered arm collects bodies by CDP (`browserrender.mjs:204-248`) and **takes no screenshot** (`browserrender.mjs:48`). | capture-sources R8/R9/R25 (subresource caps); nothing for the content of an image |
| 3 | **Profile** | `acquisition.profileOf` (`acquisition/index.mjs:1928, 1942`), format registry (`bio-plane/src/formats.mjs:263-304`) | Magic bytes only: `FF D8 FF` = jpeg, the 8-byte PNG signature = png; both "certain". GIF, WebP, TIFF, HEIC, BMP, anything else = `undetermined`. Detection order is registration order, so `%PDF-` or `<html` anywhere in a JPEG's first KiB makes it a PDF or a web page (D, **ran**). | format-registry R23 (12 entries); R2 of reading-pipeline (bytes over the recorded profile) |
| 4 | **File safety** | file-safety (`file-safety/index.mjs:234-257`, `formats.mjs:35-82`); file-scanner `/scan` (`clamav.mjs:68-123`) | Queued on every receipt. Classifies by magic: PNG, JPEG, `GIF8`, WebP = `image`; TIFF, HEIC/AVIF, BMP, JP2, ICO, PSD = `unknown`. Reads the first 1 MiB, never decodes. Grades; queues ClamAV (daily). Images get `NO_SAFE_VIEW`; a PDF gets a 150-dpi JPEG-per-page safe view (500 pages, `limits.mjs:17`). **Runs beside reading, not before it**: no reading module imports file-safety. | file-safety R6 (image low by source), R11, R14; file-scanner R1-R3, R16; none for gating reading |
| 5 | **Intake read decision** | control-plane `tooBigToReadInline` (`control-plane/index.mjs:733-747`), `readUploaded` (`:2729-2760`) | A PDF over 2 MiB, any other file over 3 MiB, or any file with under 8 s of the 25 s door left is not read in the request but owed to the ledger (`pendSha`, kind `reading`). **The rule is by bytes; the cost of a scan is pages.** A scan or image under the line is read inside the member's request, OCR included, with no clock. | control-plane R120, R123, R125; K4354 |
| 6 | **Bytes** | reading-pipeline `bytesOf` (`reading-pipeline/index.mjs:2281-2316`) | Loads the whole object into the plane: ceiling 24 MiB `WHOLE_READ_MAX` (`:51`), 20 MiB for assembling parts (`:47`); over it a size statement only, `final`. **A picture is loaded in full though the picture entry reads 3-8 signature bytes and the OCR member re-reads the object from R2 itself** (D). | reading-pipeline R2, R36, R37 |
| 7 | **Route** | `readInner` (`:2326`); picture entry `pictureEntry` (`formats.mjs:274-300`); `pdf` entry | A JPEG/PNG is one page 0 with marker `no_text_layer`, tier 2 never asked (`:117-127`). An image-only PDF: every page `no_text_layer`. A mixed PDF: text pages kept; `no_text_layer` and `image_content_unread` (folio) pages routed to OCR; `image_content_undetermined` and `image_unread` route **nothing** (`:212-215`); one `encrypted` marker routes nothing (`:218-227`). Anything else (GIF, WebP, TIFF, BMP, HEIC): `final` failed reading, no OCR call (`:2724-2728`). | reading-pipeline R3, R4, R9, R40 |
| 8 | **Pixels** | pdf-pixels: `renderPageToPixels` (`pdf-worker/src/pagepixels.mjs:345`) for a PDF page; `renderPictureToPixels` (`picturepixels.mjs:438`) for a JPEG/PNG file | A PDF page: exactly one image per page; routes DCT passthrough or decoded (`:443-461, :687`), CCITT G3-1D/G4 (`:466-516`), JBIG2 (`:520-557`), JPX (`:565-597`), raw 1-bit/8-bit grey/RGB (`:600-631`); upright by `/Rotate`. A picture file: header bound, strip-wise JPEG decode while reducing to a 4096 px long edge, EXIF orientation (JPEG only), optional `prepare` (level, deskew, enlarge; R44). **Not in pdf-worker**: the pixel code is bundled into ocr-worker and into the plane Durable Object (A §0). | pdf-pixels R13-R26, R42-R44; image-codecs R1-R11 |
| 9 | **Codecs** | `pdf-worker/src/{dctdecode,ccittdecode,jbig2decode,jpxdecode,pngdecode,mq}.mjs` | Pixel-exact decoders against independent references (libjpeg-turbo, jbig2dec, OpenJPEG, libtiff, Pillow/PngSuite). Baseline/extended-sequential Huffman 8-bit JPEG only; PNG all legal depths, non-interlaced; no TIFF, GIF, WebP, HEIC decoder anywhere. | image-codecs R1-R7, R10, R11 |
| 10 | **OCR** | ocr-worker `handleTranscribe` (`ocr-worker/src/member.mjs:251-284`) via the plane's `askMemberPerPage` (`reading-pipeline/index.mjs:357-401`) | The plane POSTs `{capture_sha, store, pages}`; the member reads the object from R2, renders **one** page, refuses a frame over 61.3 MB RGBA **after** the render (`member.mjs:116-126`), runs tesseract-wasm 0.11.0 with `tessdata_fast/eng`, answers line-grain regions with rectangles and confidence; a picture also carries `legibility` (refused under 0.2). Up to 24 calls per `read` (`reading-pipeline/index.mjs:354`), each loading the whole object from R2. | ocr-worker R1-R10, R23-R25; reading-pipeline R4, R37 |
| 11 | **Merge and store** | `tier3Extend` (`:540-675`), `mergeTier3Text` (`:255-321`), `textUnitsFor` (`:905`); extraction `writeReading` (`extraction/index.mjs:1087`), `indexUnits` (`:1315`) | One text unit per page: extent `{kind:"pdf-page", page, rect:null}` — **also for a JPEG/PNG** (page 0). The OCR regions (rectangles, confidences, frame geometry) are checked, then dropped. Chain `pixels -> ocr(engine, version)` at grade `C`. `capture_text` rows (128 KiB each, 4,096 units and 2 MiB a piece), FTS triggers, `capture_text_state`. | reading-pipeline R15, R35; extraction R22, R96, R97 |
| 12 | **Owe and continue** | `owe({kind:"ocr"})` (`reading-pipeline/index.mjs:2703-2710`); extraction `readHeld` (`extraction/index.mjs:759-854`), `#continueOcr` (`:903-917`); plane ledger (`plane/pending.mjs`) | A read that hits its 24-call cap records `ocr_left` and calls the `owe` hook if given. The ledger turns an owed reading into an `ocr` row (heavy kind, one per tick, back-off 15 s to 1 h, never given up). `#continueOcr` goes through `pdfStructure`, **PDF only**. | reading-pipeline R37; extraction R35, R82; plane R77 |
| 13 | **Interpret** | `op=pagetranscribe` (`extraction/index.mjs:2369-2513`), `plane/transcribe.mjs` | The only AI reading of image content; a member's act, never automatic: at most 8 pages, a picture made grey at a 1568 px long edge, a PNG over 5 MiB refused. The words are "the AI's reading", `undetermined` until attested. | extraction R71-R75; plane R36 |
| 14 | **Say and search** | `readingFor` (`extraction/index.mjs:1436`), `#completenessOf` (`:1520`), `#unreadOf` (`:1540`), Document screen (`screens-inquiry/document.mjs:229-231, 541-570`) | `op=reading` pages the units (1 MiB, R93), states `completeness`, `unread_pages`; `op=search` over `capture_text_fts`. The screen corrects an API "whole" when `unread_pages` is non-empty; it hides the OCR press for a picture and offers `pagetranscribe`. | extraction R22, R90-R93; K4571 |

### 1.2 The flow by type (what each type meets)

| Type | Door | Profile | File safety | Route | Pixels | OCR | Stored as | Ends how today |
|---|---|---|---|---|---|---|---|---|
| **JPEG** baseline, 8-bit, 1/3 comps | any | `jpeg` certain | image, low (high if over 1 MiB, S13) | picture entry, 1 page | picture route: header bound, strip-wise decode, EXIF turn | 1 call, `prepare:true`, legibility | 1 unit, `pdf-page` p0 | read, or `PICTURE_NOT_LEGIBLE`, or refused (reason dropped, S11) |
| **JPEG** progressive / CMYK / arithmetic / 12-bit | any | `jpeg` certain | image | picture entry | refused `UNSUPPORTED_JPEG_PROCESS` / `UNSUPPORTED_SAMPLES` | none | `final` failed reading, text "declined (PAGE_NOT_RENDERABLE)" (S11) | **unread, member told nothing actionable** |
| **PNG** 8/16-bit, palette, alpha | any | `png` certain | image, low | picture entry | whole decode, frame ≤ 4096 × 3072 × 3 samples | 1 call | 1 unit | read; interlaced refused (S11) |
| **TIFF**, single or multi-page | any | `undetermined` | `unknown` -> `format_unchecked`, deeper check `incomplete` for ever (S13) | none | **no decoder** | none | `final`, "non-textual or too large" | **unread, wrong sentence (S3)** |
| **GIF**, **WebP** | any | `undetermined` | image, low | none | none | none | as TIFF | as TIFF; image-cover can strip them for a published case |
| **HEIC / AVIF** | iOS may convert to JPEG (**hyp**) | `undetermined` | `unknown` | none | none | none | as TIFF | as TIFF |
| **BMP, SVG, JP2, ICO, PSD** | any | `undetermined` | `unknown` / svg | none | none (JPX only inside PDFs) | none | as TIFF | as TIFF |
| **Image-only PDF** (CCITT, JBIG2, JPX, DCT, raw) | any | `pdf` | PDF: read whole ≤ 20 MiB, safe view | every page `no_text_layer` | per page, one image only | one call a page, 24 a request | one unit a page | all pages by ticks if the ledger owes; **else only the first 24** (S1) |
| **Mixed PDF** | any | `pdf` | as above | text pages kept; unread-image/folio pages OCR'd | as above | as above | text units + OCR units | folio page refused by the real member (S10); a picture of a table under a text title counted as read (S21) |
| **Images on a web page** | address | HTML | each is a subresource | none | none | none | bytes only | **unread and unmarked (S15)** |

### 1.3 What each module in the family owns, and what it does not

- **image-codecs** (layer 1): pure decoders; knows nothing of PDF or place. R1-R7, R10, R11.
- **pdf-pixels** (layer 1): a PDF page or a picture file as upright PNG pixels; the refusal vocabulary. R13-R26, R42-R44. Its files live in `pdf-worker/src/` but are bundled into **ocr-worker and the plane**, not into pdf-worker.
- **ocr-worker** (layer 1): the engine and the contract; reads R2 itself; writes nothing. R1-R25.
- **image-cover** (layer 1): a publication-safety module. `coverAreas` (faces, plates) for `case-carriage`; `stripMetadata` for `doc-clean`. Handles JPEG/PNG (cover) and JPEG, PNG, GIF, WebP, JP2/J2K (strip). **Nothing in the read path calls it.** Its bounds are in §4 because its memory is the plane's memory.
- **reading-pipeline** (layer 4): routes, tiers 2-4, the OCR loop, the merge. R2-R9, R15, R35-R41.
- **extraction** (layer 4): stores the reading; owns the OCR continuation and the AI act; says completeness. R22, R35, R71-R75, R82, R90-R97.
- **file-safety** and **file-scanner**: classify and scan; they do not decode and do not gate.
- **capture** and **capture-sources**: the door; bytes only.

---

## 2. The state of the code (K4798 (2))

Marks: **mature** (tested at its interface against an independent reference, and bounded); **fragile** (works on the tested shape, breaks off it); **duplicated**; **legacy**; **untested**. Sources: the share letter in brackets.

### 2.1 Mature

| Unit | Why mature |
|---|---|
| `dctdecode.mjs` (685 lines) on the picture route | Bit-exact against libjpeg-turbo over 16 + 39 fixtures; strip-wise (`:472`); header bound on the picture route [A] |
| `pngdecode.mjs` (317) | All PngSuite files against Pillow; bound before allocation (`:197-199`); interlaced and unknown critical chunks refused; an IDAT claiming 1 × 1 and inflating 200 MB is stopped (**ran**) [A] |
| `jbig2decode.mjs` happy path, `mq.mjs` (but S12) | 108 jbig2dec variants; every region type [A] |
| `jpxdecode.mjs` pixels | 127 OpenJPEG variants, 4 page fixtures; memory bound from the header for samples (`:85-98, :944-949`) — but S6 [A] |
| `picturepixels.mjs` (517) | Pillow-exact reduction; R44 floor tested through the engine [A] |
| `image-cover` formats and refusals | 61 fixtures, reference hashes, JPEG measured at 12 MP and 48 MP in workerd; 1 × 1 and 120 MP zero-bomb PNG fine (1.6 s, 14 MB) [B] |
| `ocr-worker/src/member.mjs`, `contract.mjs` | 259 assertions; every R7 step tested with a stand-in and, in part B, with the real renderer and engine under Miniflare [C] |
| `tier3Extend`, `askMemberPerPage`, `ocrTextFromMember`, `mergeTier3Text` | tested (convert-ocr, d606, r37) but with scripted members, or 16 × 16 images [D] |
| `readHeld` for text; the row guard `#statedTooLarge` | compare-and-set on the stored reading; confirms R96/R97 [E] |
| file-safety `#lookAt` memory | streams 1 MiB and cancels: a 25 MiB JPEG graded in 74 ms (**ran**) [F] |
| the ledger (`plane/pending.mjs`) | heavy kind one per tick, back-off to 1 h, `own_ms`/`wait_ms` landed (G67) [H, I] |

### 2.2 Fragile

| Unit | file:line | Why |
|---|---|---|
| PDF-route DCT decode | `dctdecode.mjs:418, :623-648`; `pagepixels.mjs:687-701` | `out = new Uint8Array(W2*H2*nc)` on the first emitted strip, no dimension check; a truncated stream keeps walking 14 M MCUs (**ran**, S5) [A] |
| CCITT decode | `ccittdecode.mjs:81-89, :120-128, :218-225` | A string-based bit reader; rows from the declared `Rows`; no allocation bound (**ran**, S5) [A] |
| JBIG2 bitmaps | `jbig2decode.mjs:71, :815, :1008-1023` | Bound is 2^28 pixels *per bitmap* (268 MB at one byte each); overrun judged after decode; a pattern dictionary of 2^22 patterns costs 1.3 GB (**ran**, S5, S12) [A] |
| JPX tier 2 | `jpxdecode.mjs:641-663, :667` | Precinct objects built before any packet byte is checked (**ran**, S6) [A] |
| `unpredict` | `bio-plane/src/pdfstructure.mjs:237-238` | Returns the data unchanged for predictor < 10, "vanishingly rare" (**ran**, S12) [A] |
| `imageOf` / raw branch | `pagepixels.mjs:268-283, :605-631` | Reads colour space by name only; never `/Decode` on 8-bit, `/SMask`, `/Mask`, Indexed, ICCBased (**ran**, S12) [A] |
| DCT passthrough | `pagepixels.mjs:443-461` | Any stream starting `FFD8` with 4 bytes answers `ok:true`, `upright:true`, dimensions from the PDF's dict, no parse; `cropImage` uses this route by default [A] |
| the OCR member's frame check | `member.mjs:116-126` | After the renderer decoded the page; a 4000 × 4000 PNG is decoded in 1.8 s then refused (**ran**) [C] |
| the OCR member's guard | `member.mjs:140-146` | Only the engine call is wrapped; a throw from the renderer, the inflate or R2 is a 500 (S8) [C] |
| `Extraction.read` | `extraction/index.mjs:683-692` | Passes no `owe` and no `ocrInvocations`; `ocr_left` is written (`reading-pipeline/index.mjs:2706`) and read by nobody (grep) [D, E] |
| `#continueOcr` | `extraction/index.mjs:903-917` | PDF only; for a picture it answers `UNREADABLE` and the ledger ends the row (S4) [E] |
| `#completenessOf` | `extraction/index.mjs:1520-1530` | Looks only at the index's counts; ignores `tier3_candidate`, `ocr_left`, `unread_pages` (S2) [E] |
| `pdfStructure`, `pageTranscribe` | `extraction/index.mjs:2185-2202, :2390-2404` | Load the whole object with no size check; no compare-and-set on the rewrite (S19) [D, E] |
| `uploadCapture` for images | `capture/index.mjs:682-858` | Mature for bytes; **untested for any image**; recognition by magic only (S18) [G] |
| `png.mjs` (image-cover) | `:342, :350, :364-366` | Five row buffers sized by width alone, before data; guard is the product W × H ≤ 120 MP (**ran**, S7) [B] |
| `strip.mjs` (image-cover) | `:71, :105, :148` | A subarray per kept chunk or marker, no count bound (**ran**, S7) [B] |
| `readingOf` (upload line) | `screens-intake/capture.mjs:941-948` | Marks `read: true` for any reading object; never looks at `failure` or `ocr_left`; draws "Text: None: no page has text" (S18) [G] |
| the file-safety grade | `file-safety/index.mjs:415-417, :736-738` | An image over 1 MiB is `whole:false` and so `unread`, graded high (**ran**, S13) [F] |
| `keepRenderBodies` | `render.mjs:337-347` | Decodes every body before keeping any; 64 MiB decoded + 85 MiB base64 against 128 MB (**hyp**; 40 × 1.5 MiB peaked at 82 MiB in node) (S15) [G] |
| `openedPdf` slot | `reading-pipeline/index.mjs:1907` | A module global keyed by sha (PDF #1's N19, not re-measured for scans) [D] |

### 2.3 Duplicated

- **Six independent signature sniffers** for JPEG/PNG: format registry (`formats.mjs:303-304`), file-safety (`file-safety/formats.mjs:35-40`), ocr-worker `isPicture` (`contract.mjs:124-132`), pdf-pixels `sniff` (`picturepixels.mjs:74-80`), doc-clean (`doc-clean/images.mjs:32-52`), image-cover (`image-cover/index.mjs:40-42`). They differ: file-safety's GIF is `GIF8` only, strip's is `GIF87a/89a`; the registry knows neither [B, F].
- **Two EXIF orientation parsers** (`image-cover/jpeg.mjs:42`, `geometry.mjs:166` and `picturepixels.mjs:92-125`) with different tolerance: a photo they disagree on is OCR'd one way and covered another (**hyp**; no test compares them) [B].
- **Three PNG decoders or writers**: `pngdecode.mjs`, the writer in `pagepixels.mjs:772-835`, `ocr-worker/src/pngsamples.mjs` (which re-parses the PNG the renderer just built), plus image-cover's own CRC (`png.mjs:220`) [A, B, C].
- **Two index-cut implementations**: extraction's `indexUnits` bounds against reading-pipeline's `textUnitsFor` budget (the same cut written twice) [E].
- **Three OCR callers of one seam**: `read`'s own `tier3Extend` (`:2610`), `pdfStructure(ocr=1)` (PDF-hard-coded, `:2231`), and the transcribe op (format from bytes) [D].
- **Two image-test copies** of the OCR transcribeFrame: the node suite uses a copy of `tessengine.mjs`'s function (`ocr-worker/test/ocr-worker.test.mjs:714-727`) because the real file imports wasm modules node cannot load [C].

### 2.4 Legacy

- `pagepixels-worker.mjs`: a throwaway probe entry, not a surface [A].
- `bio-plane/test/ocr-measure-probe.mjs` (CPDF-9/14/15/16): a network-needing instrument of the 2026-08 findings; not run [C].
- `#continueOcr` is the PDF-era continuation; no picture path was ever written for it [E].
- The `#unreadOf` comment (`extraction/index.mjs:1534`) contradicts R91 and the code [E].
- `PRIOR_READING_COPY_MAX_BYTES` unused (PDF #1).

### 2.5 Untested

Nothing in the repository's tests does any of the following [A-G]:
- A real JPEG or PNG through `read` with the real OCR member (only ocr-worker's own suite and my probes).
- A GIF, WebP, TIFF, HEIC or BMP through any door.
- An image through `uploadCapture` -> `readUploaded` -> OCR -> ledger. The shape harness has no image document kind and no OCR member (`test/m/plane/shape/harness.mjs:56-62`).
- A header bomb on CCITT, the DCT PDF route, JBIG2 or raw. Only JPX, PNG and the picture routes have bound tests (`jpx.test.mjs:134-136, :186-195`, `pagepixels.test.mjs:605-634`).
- JPX tier-2 object count; hostile chunk counts in image-cover; a wide-and-flat PNG.
- A sideways or upside-down scan; a non-English page; a two-column page; an inverted page; a colour scan; a 1-bit 300 dpi scan through the real member.
- `/Decode` on 8-bit raw, `/SMask`, `/Mask`, predictor 2 on an image, `Columns` ≠ `Width`.
- A scan of more than 24 pages **in one piece** with `Extraction.read`'s real arguments; later-piece OCR in the index; a store failure at tick 2.
- An OCR member kill in the ledger loop; a throwing renderer in the member (my 280-input fuzz found 0 throws, so the missing guard is unproven-harmful, not proven-safe).
- Any RSS or CPU assertion; a frame exactly at and just over 61.3 MB through the real renderers; two consecutive big pages in one warm isolate.
- `pdf-worker/package.json`'s `test` script runs five files and **omits the 65 codec tests** (they pass when run directly, **ran**) [A].
- file-safety and file-scanner: no real image in any test (an 8-byte PNG signature plus filler); no `clamscan` here, so the file-scanner suite skips.

---

