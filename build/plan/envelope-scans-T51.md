# Image scans and images read over their whole envelope: the architecture, the state of the code, the cause families, the bounds, the corpus (K4798)

**Status** · DRAFT for BOB, written by SCAN #1 on `prep/account3-scans` (from `origin/tranche/T51` at 5ac9380e00). This is a plan: no code and no requirement was changed. Nothing was run against biosmoke8 or any live site. Planned under K4798 (Bob: "research to the point of understanding the overall architecture and state of the code for other major data types - image scans, spreadsheets, etc."), K4785 ("a system that we have confidence will ALWAYS operate correctly within the bounds of the system requirements"), K4571 (never a silent partial read), K4630 (large files are read, never failed), K4636 (every document read and searchable), K4354 (2 s act, 15 s capture), K4426 (the four fields), K4787 (no load-dependent test; one core), K1881 (a bound that changes what a member may do is Bob's), P17, and `fix-round-7-T51.md` §0 (R-FOUR, R-SEAM/R-ONE, R-STOP, R-CLOCK, R-PROXY, R-QUIET).

**Read whole for this plan.** I read these myself: K4785 and K4798 in `rulings.md`; K4571, K4630 and K4636 in `rulings-active.md`; `fix-round-7-T51.md` §0 and `archive/fix-round-7-T51-s1-s5.md` §1; `requirements/image-codecs.md`, `pdf-pixels.md`, `image-cover.md` and `ocr-worker.md`; `walk-T51-rewalk7/A.md`; `modules.json`; and PDF #1's plan (`build/plan/pdf-envelope-T51.md` on `origin/prep/account3-pdf`), whose method and table form this plan follows. I re-read in source the load-bearing lines: `formats.mjs:303-304`, `extraction/index.mjs:683-692` and `:1520-1530`, `control-plane/index.mjs:733-747` and `:2754-2757`, `ocr-worker/src/member.mjs:116`, `file-safety/index.mjs:415-417`.

Nine helpers (sonnet, medium) read the rest in shares, each over 150 KB or spanning many files. Their reports are at `/tmp/claude-0/-home-user-bio/4673eafe-9857-5eb8-95cc-e52ff02bb323/scratchpad/k4798/`, named A to I:
- **A. codecs and pixels:** the requirements of image-codecs, pdf-pixels and pdf-worker; every file of `pdf-worker/src/`; 65 codec tests run; probes of header bombs on every route.
- **B. image-cover and the census:** image-cover whole, the picture entries of the format registry, and a census of every door and every image type.
- **C. ocr-worker:** its requirements, source and tests; five probes through the real member, renderers and tesseract; a 280-input mutation run.
- **D. reading-pipeline:** the requirements whole and `index.mjs` whole; seven probes.
- **E. extraction:** the requirements whole and the scan parts of `index.mjs`; nine probes.
- **F. file-safety and file-scanner:** both requirements whole, `index.mjs` whole; probes of the classifier.
- **G. capture:** the requirements and code at the door, `render.mjs`, `browserrender.mjs`; probes.
- **H. the causes, rounds 1-5:** every fix-round plan and every diagnosis that touches a scan.
- **I. the causes, rounds 6-7, and the walks:** `fix-round-6` and `-7`, every walk record and the re-walk 7 rows.

Evidence words, as in PDF #1's plan: **ran** means reproduced by a probe I or a helper wrote (node 26 with the repository's modules and the real tesseract engine; not workerd, so times are node times and memory is node RSS); **code** means read at the line cited; **hyp** means read from the code but not run, so the corpus must confirm it or drop it. A fact about the walks is labelled with its record and line.

---

## 0. In short

**The family is five things that share one weak joint.** A member can give Civicsmith a scan or an image in three ways: an upload (a file chosen, dropped or taken with the phone camera), an address captured from the web, or a page whose pictures come with it. What happens to it depends on its type:
- **JPEG and PNG are read** as one-page documents, by tesseract in the OCR member. **No other image type is read at any door** (TIFF, multi-page TIFF, GIF, WebP, HEIC, BMP, SVG, JPEG 2000). They are accepted without a word, stored whole, and end as a `final` reading saying "not read as text (non-textual or too large)" (`reading-pipeline/index.mjs:2724-2728`; **ran**, B, D, E, G). No decoder for any of them exists in the repository (A, B).
- **An image-only or mixed PDF** is read page by page: pdf-pixels decodes the one image on the page (CCITT, JBIG2, JPX, DCT, raw), the OCR member reads it, and the plane stores page-grain text. This is the path every walker's "scan" took.
- **Pictures on a web page** are kept as bytes and never read or marked (G).
- **image-cover** is not a reading module at all: it covers faces on a photo for a published case and strips metadata for `doc-clean` (B).

**Why "it works, then fails again later" is the same story as PDF's.** No requirement states the envelope of an image or scan read, and each fix proved one bar on the file the walker used. The walkers' scans are all one kind of file: a clean ImageMagick `convert` rendering of the walker's own English text, as 60 or 30 JPEG pages in a PDF, upright, one colour space, one codec (I §2). No walker ever uploaded a PNG, TIFF, GIF, WebP or HEIC file, a real camera photo, a scanner's CCITT or JBIG2 PDF, a mixed PDF with some scanned pages, a sideways page, or a page in another language. The tests feed each module its own builder's kind of input: 12-byte "JPEGs" in the reading and extraction tests, a JPEG of 20 header bytes in the AI-act tests, an 8-byte PNG signature in file-safety's tests, 16 × 16 Flate pages in the OCR-continuation tests (D, E, F).

**The failure classes** (§3.1) are the five Bob's K4785 names (memory at size, work per tick, OCR cadence and inline OCR time, state carried between ticks, the platform's shape) and the ones the code forces: BOMB (a header-declared size judged after the allocation), TYPE (a type with no path), SILENT, LIVE, PATH, ENC and PIECE. Three findings recur across almost every class:
- **No stated envelope.** For most causes "none stated it".
- **Fixed on the path the test used.** The E6 fix put the OCR continuation on the promote path; the upload path was left, and the same symptom came back as re-walk 7's scan30 (§3.2).
- **Measured outside the shape.** No OCR tick has ever been read with `own_ms` and `wait_ms`, `last_mem` is 0 or null, and the shape harness has no image document kind and no OCR member (G, I).

**Defects found by this review that are not yet causes** (§3.3, 26 items, S1-S26; nine of them reproduce PDF #1's N2, N12, N13, N14, N16, N23, N24 and are confirmed or extended here). The most urgent, all **ran**:
- **S1 (scan30, N2):** a scan under 2 MiB is OCR'd inside the member's upload, 24 calls with no clock (42.7 s against the 15 s bar), and the pages past 24 are owed to nobody. In pieces, 82 of 130 pages and 102 of 150 scanned pages of a mixed PDF stay unread, with the reading stating "whole" (S2).
- **S2:** `completeness` says "whole" for a scan with unread pages, on the API; only the Document screen corrects it.
- **S3:** TIFF, GIF, WebP, HEIC and BMP have no path; the sentence is wrong for them ("too large"); the screen offers "Read it now" and the AI act, both no-ops.
- **S5:** a hostile header declaring a huge image is judged **after** the allocation on four of the six PDF routes: an 8 KB CCITT stream declaring 60,000 × 60,000 returned `ok:true` after 7.3 s at 2.27 GB; a 330-byte JPEG burns 2.1 s; a valid 8000 × 8000 JPEG is accepted at 526 MB; a 97 KB Flate stream for 10,000 × 10,000 grey is accepted at 398 MB.
- **S6:** a 170-byte JPEG 2000 codestream with 2 × 2 precincts builds 629 MB (500²), 2 GB (1000²) or 7.7 GB (2000², 25 s) of objects before a packet byte is checked.
- **S7:** a 70-byte PNG declaring 30,000,000 × 1 allocates 572 MB in `coverAreas` (image-cover), before any data is read.
- **S8:** the OCR member has no top-level guard; a kill or a throw is a 5xx the plane counts `transient` and asks again about hourly for ever.
- **S9:** a sideways picture comes back `ok:true` with fluent garbage ("Surusas Aepson], Uo | yobpnq ...", legibility 0.25, above the 0.2 refusal line).
- **S12:** four routes give wrong pixels with `ok:true`: TIFF predictor 2 on an image, `/Decode [1 0]` on 8-bit grey (an inverted scan OCR'd as a negative), `/SMask` ignored, and JBIG2 rows invented past the data.
- **S13:** every image over 1 MiB is graded `high` ("unread") by file-safety (R6 says an image is low by source alone); and a hold or a ClamAV verdict gates nothing in reading.

**The unstated bounds** (§4) are the ones today's code depends on and no requirement states:
- **Types and bytes:** which image types are taken; the byte ceiling for an image (the door takes 256 MiB, the reading loads 24 MiB, so an image of 24-256 MiB is kept and permanently unread).
- **Pixels and ratios:** a declared-size bound on the CCITT, DCT, JBIG2 and raw routes; JPX's object count; the inflated size of an image stream; the OCR frame's bound is judged **after** the render; colour depth beyond 1 and 8 bits.
- **Time:** OCR time and CPU per page (stated only as a comment, 10.4 s against `cpu_ms` 30,000); OCR time per tick and per request (24 calls of "about 10 s"); the memory held between ticks.
- **Meaning:** the language (English only, said nowhere to the member); orientation; legibility for a scanned page (only for a picture); what an image's citation is (a `pdf-page` extent, line rectangles and confidences discarded).

**Two capabilities are absent:** a TIFF container reader, and a page rasteriser (PDF #1's N18).

**Bob's** (§4.3). Seven decisions change what a member may do or is told, each with a recommendation:
- **B-S1:** which image types are read (add TIFF first, then GIF; state WebP, HEIC and BMP as not read).
- **B-S2:** the byte ceiling for an image or scan (24 MiB, as PDF's B-1).
- **B-S3:** the longest scan read by OCR (1,000 pages, as PDF's B-5).
- **B-S4:** the languages read.
- **B-S5:** a time-to-whole promise for a scan.
- **B-S6:** a page whose OCR is illegible, sideways or in another language: read and marked, or refused and stated.
- **B-S7:** whether a safety hold or an unfinished scan gates the reading of an image.

Everything else is BOB's (P17), recorded once in `rulings.md`.

**The corpus** (§5) has 72 generated files over the corners and their combinations, plus 16 seeded variations at every round end, from one seeded generator that knows the truth of every page. Each goes through the real entry path at the platform's shape: upload, ticks to whole, the last line found by search, the reading paged to its end. Passing is judged against one list of invariants (SI1-SI14), by work counted, never by the object's clock. PDF #1's PDF generator is reused for scanned PDFs; its section D files are cross-referenced, not repeated.

---

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

## 3. The cause-family review (K4798 (3))

### 3.1 The failure classes, the causes in each, and the invariant each broke

The causes are T51's (G-, E-, F-, C-, L- ids) and the walker rows without an id. "Not yet causes" are this review's S-defects (§3.3).

| Class | What fails | Causes (T51) | The invariant each broke, or that none stated it |
|---|---|---|---|
| **MEM** memory at size | The object (128 MB, shared with the plane's idle) or the OCR member dies, or would, while an image is decoded, OCR'd or covered | C5a, E2, F10, G26 (text volumes; their lesson applies); R6-memory ("Scans are not the memory problem; their problem was the dead alarm": 100 JPEG-noise pages, 20 MB, peak 28 MB); not yet causes: S5, S6, S7, S15, S16 | E2/G26 broke pdf-reader R41 and reading-pipeline R36, measured outside the plane's idle. **No requirement bounds an image's memory** except image-codecs R4 (JPX), R10 (PNG), pdf-pixels R42 (the picture) and ocr-worker R7 step 4 (the frame, after the render). The 61.3 MB figure was measured on synthetic frames in an engine-only worker (CPDF-15), before the picture, `prepare` and PNG paths existed, and never re-measured for the full path (C). **No scan was ever put through the plane at its shape**: R6-shape's "Not covered" list names OCR pages, 60-page scans and PDFs over 24 MiB (H); `last_mem` is 0 or null (G69). |
| **BOMB** a declared size judged after the allocation (a MEM subclass) | A small file declares a huge image and the cost scales with the declaration | not yet a cause: S5 (CCITT, DCT, JBIG2, raw), S6 (JPX tier 2), S7 (PNG cover) | **None stated it.** PDF #1's N12 named it for a G4 stream; here it is confirmed by running on every route (§3.3, A). The OCR member counts a kill as a 5xx and is asked again, for ever (S8). |
| **WORK** work per tick or per request | A tick or act exceeds its bar, or holds the object's thread | G56, G67, G68, G82 (text/PDF); R7-reading R1 (scan ticks 29-31 s); not yet causes: S1, S16 | G56/G67: the 10 s bar is BOB's technical call and a test bar. G67 ruled "an OCR row over the bar because of its member's wait is reported to BOB, not sized down" (`fix-round-7:138`), and **no OCR tick was ever read with `own_ms`/`wait_ms` after it landed** (scan30 had no row, I). The decoders are single synchronous loops that never yield; `Date.now()` is frozen in workerd, so no deadline can be enforced inside them (R-CLOCK; A D9). Cost scales with the *declared* size (2-7 s of CPU from 330 bytes to 8 KB). |
| **INLINE** OCR time in the member's request | A scan or image is OCR'd inside the upload or the capture | C5a/P8, fix-5 2b, R6-capture C (12 MB text 29.3 s), rewalk7 scan30 (42.7 s) and ODS (42.9 s); G5, G79 | K4354 (2 s act, 15 s capture). G5 made the rule *bytes by format class* (PDF > 2 MiB, other > 3 MiB, `control-plane/index.mjs:733-747`); **the cost of a scan is pages, not bytes**, and the clock arm (8 s of the 25 s door, `:214, :2671`) is checked once at entry and never during the OCR. 24 calls at about 1.6 s each = the 39 s measured (G). `askMemberPerPage` has no per-call deadline (`reading-pipeline/index.mjs:357-361`). |
| **OCR** cadence | OCR stops at a page count, nothing continues it, or it takes too long | F9, E6, A-21, R6-2a, rewalk7 G67/G68 (the same symptom three times); G70 | F9 (4b): "OCR stops at 24 pages per request, rest waits for a manual re-read" -> D5 ledger kind `ocr` with a cursor. E6 (5): "24 of 60, 22 min with no further pages" -> `followEntries` pends an `ocr` row (`control-plane/index.mjs:2678-2687`). R6-2a: the alarm was dead. Re-walk 7: **30 pages, 24 read, `ocr_left` 6, nothing owed 90 minutes later** — the upload path again (S1). Violated every time: reading-pipeline R37 and K4571. **No requirement states a time bound per OCR tick.** At "about 10 s" a page (`extraction/index.mjs:2234`, a cost string, never measured live) one pass of 24 is up to 240 s. |
| **STATE** state carried between ticks | A counter, cursor or kept document goes wrong across ticks | E2 (attempt accounting), E6, F1 (never forgets), G68, G71; not yet causes: S1, S4, S19, S20, S25 | `ocr_left` is dead data (written, never read); `readHeld` returns `more:true` for the first piece *before* computing `owed` (`extraction/index.mjs:849-853`), so a multi-piece scan never gets an `ocr` row; a transient failure at tick 2 ends the read (`:881-885`, N14); an `ocr` row for a picture is ended as finished (`plane/pending.mjs:206-207`). **None stated that every owed page is owed on every path** (PDF #1's I9). |
| **SHAPE** the platform | Bars proven where they cannot be seen | G26, G37, G39, G67, G69, G70, G82; L26's floor; R6-shape | The shape harness has **no image document kind and no OCR member**; Miniflare enforces no 128 MB; `last_mem` is null by design; the OCR member's CPU is "10.4 s at 300 dpi against `cpu_ms` 30,000" in a comment (`ocr-worker/wrangler.jsonc:56-63`); the engine is created and destroyed per call and warm-isolate accumulation is unmeasured (C). |
| **TYPE** a type with no path | A file of a type the product takes is stored and never read | not a T51 cause; walkers never uploaded one | **None stated which image types are read.** K4630 ("Large files are read, never failed") and K4636 ("every document read and searchable") are Bob's rulings about size and completeness; for types, reading-pipeline R4 covers `jpeg` and `png` only, and the registry's own comment says HEIC and TIFF "stay undetermined" on purpose (`formats.mjs:269-272`). The consequence (accepted silently, stored, "non-textual or too large") is a decision nobody wrote down as a decision. |
| **ENC** encodings, colour, filters | A page is refused or read wrongly for its encoding | E11 (ASCII85), L26 (photo quality, 43% of words), C17/FC-14 (re-read for photos) | L26: pdf-pixels R44 (new) set a 90% floor, amended by K4316 to 52% on the hard page; the floor was measured on generated photos (182/182 and 134/182 = 74%), **real camera photos never walked** (I §2). **Today:** Indexed, ICCBased, CMYK, 4-bit, 16-bit raw and progressive/CMYK JPEG are refused (stated); TIFF predictor 2, `/Decode`, `/SMask` are silently wrong (S12). |
| **PIECE** piece boundaries | A cursor, window or piece skips | G13, G14, G15, G71, E6; not yet causes: S1 (pieces), S17, S25 | A mixed PDF read in pieces: OCR is 24 pages a piece and later pieces' pages are never revisited (**ran**: 102 of 150 scanned pages unread). Units of a later piece carry OCR text under a chain written for the first piece's range (`tier3SeedFrom`, `:436-463`; **hyp**, S25). |
| **SILENT** a silent partial read | The member is led to believe a document is read whole | G13, G14, E3, E6, scan30, F9, L26 ("the other 175 are silently missing") | K4571 each time. **Today:** `completeness` "whole" with 6 or 102 pages unread (S2); a picture refused for a reason the member is never told (S11); a sideways page stored as garbage (S9); a picture of a table inside a text page counted as read (S21); `says` claims pages the AI did not read (`extraction/index.mjs:2512`, **ran**). |
| **LIVE** liveness | A read that never finishes, or a kill retried for ever | F1, E2, F5, R6-2a (spent alarm), rewalk7 watchdog stall (551 s, `stale` false); not yet causes: S4, S8, S20 | plane R77 "never forgets" has no partner rule that every tick advances or that a kill is classified after a bound. The ledger's interrupted-run counter (3) counts deaths of the **plane's** isolate, not of the member's (D). |
| **PATH** one entry path fixed | The same defect left on the neighbouring path | E6 then scan30; C17 (photo re-read: screen only); E5/F6 (knock); C28 (screen only); N5 (stored-unread repair) | Never stated as a rule. The OCR continuation exists for PDFs (`pdfStructure`) and not for pictures; the AI act renders a picture, the OCR press does not; six sniffers disagree; `Extraction.read` passes no `owe` while `readHeld` does. |

### 3.2 The scan- and image-touching causes, one line each

"General" means the fix covers the class. "Exact" means it covers the walker's case. "Landed" is a grep of the current tree [H, I]; "live outcome" is the last walker row.

| Cause | Symptom (walker) | Class | Broke | Fix | Landed; live outcome |
|---|---|---|---|---|---|
| **F9** (4b audit) | "OCR stops at 24 pages per request, rest waits for a manual re-read" | OCR, SILENT, SHAPE | K4571; D5 "caps defer or state, never drop" | Ledger kind `ocr` with a cursor (general) | Landed (`extraction/index.mjs:849, :900-916`; `pending.mjs:172-207`); `pdf-worker` `DEFAULT_MAX_PDF_BYTES` 16 -> 64 MiB |
| **E6** (fix-5) | "24 of 60 ... 22 min with no further pages: OCR does NOT continue by cursor on its own"; "each press reads 24 pages and takes 38 s" | OCR, STATE, LIVE | extraction R82; K4571 | `followEntries` pends an `ocr` row when `held.owed` (**exact**: the promote path) | Landed (`control-plane/index.mjs:2678-2687`). **Recurred** as scan30 |
| **A-21 / R6-2a "A E6"** | "inline first 24 pages gone"; row `reading` owed attempts 0 | STATE, LIVE | none stated for alarm liveness | The scheduler heals itself (`#reconcile`, `watch`) | Landed; rewalk6: 60 of 60 by ticks, first pass 10-11 pages |
| **scan30 (rewalk7, no id)** | "a scan I made (30 pages, 1.9 MB): `captureupload` 42.7 s ST (`extractread` 39.3 s, OCR inline, over the 15 s bar). Reading ends at 24 pages ... `ocr_left {cursor 24, pages 6}` ... no ledger row owed, none kept, still unchanged 90 minutes later" (`walk-T51-rewalk7/A.md:21`) | INLINE, STATE, SILENT, PIECE | reading-pipeline R37; K4571; K4354 | **None planned; fix round 8 has no entry** | Not landed. The only scan cause still open [I] |
| **G67** | "scan60b 29,146-31,382 (three ticks, the scan pages)" (`rewalk6/A.md:21`) | OCR, WORK | the 10 s bar (K4670) | `started_at` at the row's start; `own_ms`, `wait_ms` | Landed (`pending.mjs:30-56`); **no OCR tick read with them since** |
| **G56** | first tick 11.7 s: pieces sized by pages | WORK, MEM | none stated | `PDF_RANGE_PAGES` 100, `PDF_RANGE_BYTES` 1.3 MB at the *average* bytes a page | Landed (`reading-pipeline/index.mjs:1262-1263`). "File bytes over-count a scan, whose image streams the walk does not inflate: that errs to smaller pieces" (`fix-round-6:486`); **the scan synth's first tick is "reported", and no figure was found** [I] |
| **G69** | "`last_mem` was 0 on every row" | MEM (unmeasurable) | G39 "last_mem on the first heavy row" | Write NULL | Landed; **a scan's 128 MB behaviour has no live measure** |
| **G79** | 10.3 MB PDF upload 22.8 s, "reading made inline at the upload: only 2 of 20 pages" | WORK, PIECE | K4354 | `putFromParts` primary; keep to the ledger | Landed (40 MB 12.2 s); a multi-part image/TIFF upload never tried |
| **G5 / G7** inline read rule | photo upload "about 4 s" (live information.md:12) | INLINE | R123/R125 | Rule by format class (3 MiB for non-PDF) | Landed for text; **no work term for scans or photos** |
| **L26 / C18 / FC-13** | "Photographed pages are read at 55% and 21% of their words (43% overall)" | ENC, SILENT | pdf-pixels R44 (new) | `prepare` (level, deskew, enlarge) before the engine | Landed (`member.mjs:94-100`; `picturepixels.mjs:254, :364, :415`); generated photos 100%/74%; **real camera photos never walked**; the 90% floor was amended to 52% on the hard page (K4316) |
| **C17 / FC-14** | "'Read this document again with OCR' answers `pdfstructure` 422: 'This file is not a PDF' for every photograph" | PATH | screens R96 | The screen stops offering `pdfstructure` for a picture; offers `pagetranscribe` | Landed (`document.mjs:534-566`); **hides S4 from members** |
| **N5** (fix-4) | "INFO-2026-0080 old unread photo: the page offers nothing to read it" | PATH, STATE | none stated | Op `readheld` repair for every record stored unread | Landed |
| **F6 / E5 / C28** (knock) | a knock's photo or PDF is never read | PATH, ENC | D3 "a reading follows every way a document enters" | `readHeld` after the pull; `textTypeOf` | Landed for text; photo knocks hit `profileOf` with `ct:null` too (**hyp**) |
| **E1** | "four uploads (10.3, 23.2, 26.5, 29.1 MB) all stored 'not read as text (multipart)', final" | ENC, PIECE, SILENT | reading-pipeline R2 | Format from held bytes | Landed (`acquisition/index.mjs:1938`) |
| **E3** | 41.5 MB: "No reading 25+ min" | SILENT, SHAPE | D5, K4571 | `READING_STATEMENT_MIN` exempts the size statement | Landed |
| **F4** | a failed reading made for a transient cause is final; "a scanned PDF read while the PDF member is down stays `tier3_candidate`" | PATH, LIVE | none stated | `FAILURE_TRANSIENT` marks | Landed (`reading-pipeline/index.mjs:52-55, :137`) |
| **E2 / C5a / F10 / G26 / R6-memory** | large text PDFs kill the object | MEM, WORK, STATE | pdf-reader R41, reading-pipeline R36 | Page ranges (G26), attempt accounting, one heavy row per tick | Landed. Not a scan, but **no scan-shaped input was ever run through the same harness** |
| **R6-screens A (i)** | "40 MB upload final at once, yet 'Nothing here' / OCR act drawn" | PIECE, SILENT | R37/D5 | `whole` row in the register | Landed |
| **F1 / F2 / F3** | a deferred reading abandoned after 5 tries; an upload over 32 MiB never made whole; multipart "not held" | STATE, LIVE, PIECE | K4571; D1; D6 | Never forgets; `keepLater`; the whole row | Landed |
| **E8 (render) / C19** | web pictures | SILENT | none stated | none for images (the "Finish it" path concerned the page, not its pictures) | no cause about the content of a captured picture ever existed |

**The recurrence chains** [H, I]:
1. **OCR stops at 24 pages:** F9 (ledger kind) -> E6 (`followEntries` on the promote path) -> A-21 (dead alarm) -> **scan30 (the inline upload path)**. Four tellings of one class.
2. **Inline work in the request:** C5a/P8 -> fix-5 2b -> R6-capture C -> **scan30 and the ODS**.
3. **A dead or stalled ledger:** F1 -> E2 -> the spent alarm -> the watchdog that says `stale: false` through a 551-second stall (G58/G70).
4. **A large file kills the object:** C5a -> F10 -> E2 -> R6-memory -> G26 -> R7-reading R1. Never run with a scan.
5. **Multipart not found / not read:** C5b -> F3 -> E1 -> R6-screens -> A-18. A TIFF scanner output or a phone burst would take this path.

### 3.3 Defects this review found that are not yet causes (for BOB to place, fix round 8)

Each has an owner module and a corpus file that shows it (§5). **ran** = reproduced by a probe; **code** = certain from the lines cited; **hyp** = to be confirmed by the corpus. S1 is re-walk 7's scan30 and should not wait.

| # | Defect | Class | Evidence | Owner (providers) | Corpus |
|---|---|---|---|---|---|
| **S1** | **OCR is read inside the upload, with no clock, and the pages past 24 are owed to nobody.** `tooBigToReadInline` defers a PDF only above 2 MiB and has no OCR term (`control-plane/index.mjs:733-747`); a 1.9 MB scan is read in the request with up to 24 sequential OCR calls and no deadline (`reading-pipeline/index.mjs:357-361`); `readUploaded` owes a reading only on `more` or `reading_pending` (`:2754-2757`), not on `ocr_left`; `Extraction.read` passes no `owe` and no `ocrInvocations` (`extraction/index.mjs:683-692`). In pieces, `readHeld` returns `more:true` before it computes `owed` (`:849-853`), so a multi-piece scan never gets an `ocr` row, and a later piece's answer does not carry `ocr_left` (`reading-pipeline/index.mjs:2649`). Bites when a piece holds more than 24 scanned pages (under about 54 KB a page: bilevel scans at 20-40 KB). An upload the member never files owes nothing (**hyp**). | INLINE, STATE, SILENT, PIECE, PATH | **ran** (130-page scan in pieces: 24 OCR calls in each of two pieces, 82 of 130 pages without OCR text; mixed PDF of 100 text + 150 scanned pages: 102 pages unread for ever, `readHeld(kind:"ocr")` answers `NO_PAGES_LEFT`) [D, E]; code [G]; the walk [I] | control-plane, extraction (reading-pipeline) | C1, C2, C3, C8, F1, F2 |
| **S2** | **`completeness: "whole"` for a scan with unread pages.** `#completenessOf` ignores `tier3_candidate`, `ocr_left` and `unread_pages` (`extraction/index.mjs:1520-1530`). The Document screen corrects it (`document.mjs:229-231`); the API, and anything that reads `unitsOf(...).state` (content, case-disclosures), does not. `words_total == words_read` because the unread pages' words cannot be counted. | SILENT, STATE | **ran** (30-page scan, 24 OCR'd: "whole", 6 unread; 250-page mixed: 102 unread, "whole") [E] | extraction | C1, C8 |
| **S3** | **TIFF (single and multi-page), GIF, WebP, HEIC/AVIF, BMP, SVG, JP2 have no path.** Accepted at the door with `ok:true`, profiled `undetermined`, a `final` failed reading "not read as text (non-textual or too large)" (`reading-pipeline/index.mjs:2724-2728`) — "too large" is wrong for them; no OCR call; `repairable:true` stated. The Document screen still offers "Read it now" and the AI act, both no-ops (`document.mjs:541-570`: `PICTURE_FORMAT` matches `jpe?g|png|gif|webp|tiff?|bmp|heic`). The upload screen offers `image/*`; the usual output of an office scanner is a multi-page TIFF. No decoder exists in the repository. | TYPE, SILENT, PATH | **ran** (gif, animated gif, webp, tif, multi-page tif, bmp, HEIC/AVIF bytes) [B, D, E, G] | reading-pipeline, format-registry, pdf-pixels (a TIFF container reader is a new capability) | A2-A9 |
| **S4** | **No OCR continuation for a standalone image.** `#continueOcr` calls the PDF-only `pdfStructure` (`extraction/index.mjs:2198-2203`). A JPEG whose first OCR failed transiently owes an `ocr` entry; `readHeld(kind:"ocr")` answers `UNREADABLE` with the member up and 0 calls made; the ledger ends the row as finished (`plane/pending.mjs:206-207`) while the picture stays unread. `op=pdfstructure&ocr=1` on a JPEG answers 422 `NOT_A_PDF`; the screen hides the press for pictures. A transient picture failure is retried only by a re-upload or "Read it now" (**hyp**: not every caller of `readheld` traced). | LIVE, PATH | **ran** [E] | extraction | A1, E7 |
| **S5** | **A header-declared size is judged after the allocation on the CCITT, DCT, JBIG2 and raw PDF routes** (PDF #1's N12, confirmed and extended). CCITT: an 8,000-byte stream of 0xFF declaring 60000 × 60000, K -1: `ok:true`, 7.3 s, **2,269 MB** maxRSS (rows from the declared `Rows`, `ccittdecode.mjs:122, :218-225`). DCT (`decodeDct` is always asked by ocr-worker and the plane): a 330-byte JPEG declaring 60000 × 60000 burns 2.1 s CPU before TRUNCATED (`dctdecode.mjs:623-648`); 30000 × 30000 reaches a 2.7 GB allocation (`:418`); a valid 8000 × 8000 RGB JPEG is accepted at **526 MB**. JBIG2: 16000 × 16000 with 20 bytes of data runs 4.0 s, +250 MB, then TRUNCATED (`jbig2decode.mjs:71, :815`). Raw/Flate: a 97 KB stream for 10000 × 10000 grey, `ok:true`, **398 MB** (`pdfstructure.mjs:818, :177-180`; the inflate is uncapped below 128 KiB and capped at the whole isolate above). The OCR member's own frame check (`member.mjs:116`) runs after all of this. Controls that hold (**ran**): the picture routes, PNG, JPX samples. The bundles hold the code in **both ocr-worker and the plane Durable Object**. | BOMB, MEM, WORK, LIVE | **ran** [A, D] | pdf-pixels (image-codecs), ocr-worker | D1-D6 |
| **S6** | **JPX tier-2 object bomb.** `decodeTile` (`jpxdecode.mjs:667`) builds precinct objects for every band and resolution (`addPrecincts`, `:641-663`; `packetOrder`, `:544-584`) before any packet byte is checked; the memory bound counts samples and line buffers only. A ~170-byte codestream: SIZ 500² -> 629 MB / 0.5 s, 1000² -> 2,042 MB / 2.4 s, 2000² -> 7,697 MB / 25 s; 1500² with 1 × 1 precincts died with V8 "heap out of memory" (uncatchable). COD layers is a u16, so the packet list multiplies too (**hyp**). | BOMB, MEM, LIVE | **ran** [A] | image-codecs | D7 |
| **S7** | **image-cover allocates by width alone and keeps a subarray per chunk.** `png.mjs:350, :364-366` sizes five row buffers by the width; a 70-byte PNG declaring 30,000,000 × 1 RGBA allocates **572 MB** before failing; 120,000,000 × 1 would be 2.4 GB. `stripMetadata` and the PNG cover keep a subarray per chunk or marker: 1,000,000 empty IDAT chunks (11.4 MB) added +147 MB (`strip`) / +289 MB (`cover`); 2,000,000 two-byte JPEG markers (3.8 MB) +297 MB. In the 128 MB plane isolate this is a kill (**hyp**; the allocation is **ran**); `case-carriage`'s try/catch cannot catch an isolate kill. Reached by a member's photo marked in a case and by an image embedded in an uploaded office document (`doc-clean`). | MEM, BOMB | **ran** [B] | image-cover | D8, D9 |
| **S8** | **The OCR member has no top-level guard, and a kill is retried for ever.** `handleTranscribe` wraps only the engine call (`member.mjs:140-146`); a throw from `render`, `renderPicture`, `pngToSamples`/`inflateZlib` or R2 is a 500, against R7 ("every finding a 200"). **ran** (D: a throwing renderer makes `fetch` reject, both renderers). The plane counts a 5xx or a throw `transient` and owed (`reading-pipeline/index.mjs:619-652`); the ledger never ends a row by count; its interrupted-run counter counts deaths of the **plane**, not of the member (`plane/pending.mjs`). An input that kills the member (S5, S6) is asked again at up to once an hour for ever, and a multi-call scan restarts from the front. 280 mutated inputs produced 0 throws (C), so the guard is unproven-harmful. Also: `wrangler.jsonc` lacks `workers_dev:false` (siblings have it) and every answer sends CORS `*` (`member.mjs:54`); whether the installer closes it is undetermined (**hyp**). | LIVE, SHAPE | **ran** [C, D] (PDF #1's N23) | ocr-worker, reading-pipeline | D12, D13, E10 |
| **S9** | **A sideways or upside-down picture is answered `ok:true` with garbage.** A sentence image turned 90 degrees as a PNG: text "Surusas Aepson], Uo | yobpnq ayy peaoidde ...", legibility 0.25 (above the 0.2 refusal line); turned 180: share 0.5. The engine's `getOrientation` exists (`tesslib.mjs:827`) and is never called. EXIF is the only turn, JPEG only; a PNG, or a JPEG without EXIF, is never turned (`picturepixels.mjs:459-461`). The garbage enters the record as regions with `basis:"engine"`. | SILENT, ENC | **ran** [C] | ocr-worker, pdf-pixels | B1, B2 |
| **S10** | **A folio page is routed to OCR and the real member refuses it** (PDF #1's N13, confirmed). `image_content_unread` pages are selected (`reading-pipeline/index.mjs:215`) and sent; the committed member renders with `decodeDct:true` and no `allowTextPage` (`member.mjs:101`) and answers `PAGE_NOT_RENDERABLE` with `PAGE_HAS_TEXT_LAYER`. D-635's append path (`:296-302`) is unreachable; each such PDF costs a useless `ocr` ledger round that loads and parses the whole PDF and ends `OCR_NO_PROGRESS`. | SILENT, WORK | **ran** against the committed member [D] | ocr-worker (pdf-pixels) | E6 |
| **S11** | **The reason a picture was refused never reaches the member.** `ocrTextFromMember` keeps only the top-level `reason` (`reading-pipeline/index.mjs:483-484`); the member's `refusal.render.reason` (`IMAGE_TOO_LARGE`, `TRUNCATED_IMAGE_DATA`, `UNSUPPORTED_JPEG_PROCESS`, `UNSUPPORTED_SAMPLES`, `UNSUPPORTED_FILTER`, `DECODE_FAILED`) is dropped. Progressive JPEG, CMYK JPEG, truncated files, a 100000 × 100000 PNG, over-bound pictures, a PNG bomb: all end `final` with "declined (PAGE_NOT_RENDERABLE)". A progressive JPEG is common from web exports and scanner apps. A GIF, WebP or TIFF reaches the member only if the plane sent it and is answered `PAGE_NOT_RENDERABLE`/`NOT_A_PDF`, which reads as a corrupt PDF (C). | ENC, SILENT | **ran** [C, D] | reading-pipeline (ocr-worker) | A10-A14 |
| **S12** | **Four routes give wrong pixels with `ok:true`.** (a) TIFF predictor 2 on an image Flate stream: `unpredict` returns the data unchanged (`pdfstructure.mjs:237-238`); an 8 × 4 grey ramp came back `0,7,7,7,...`. (b) `/Decode [1 0]` on 8-bit raw is never read (`pagepixels.mjs:619-628`): an inverted scan is OCR'd as a negative. `/SMask` and `/Mask` are not read (`:268-283`). (c) DCT passthrough validates nothing (`:445-460`): 7 bytes declaring 60000 × 60000 answered `passthrough-dct`; `cropImage` uses it by default (`imagecrop.mjs:356`). (d) JBIG2: `MqDecoder.byteIn` counts an overrun only when the marker's *second byte* is past the segment end (`mq.mjs:65-69`) but the terminator `FF AC` sits inside it, so a region taller than its data decodes with **200 invented rows** instead of TRUNCATED. (e) CCITT `/Columns` ≠ `/Width` is silent (`pagepixels.mjs:512-514`): `/Width 64 /Columns 128` -> 128 × 8. | ENC, SILENT | **ran** [A] | pdf-pixels, image-codecs | D11-D14 |
| **S13** | **file-safety.** (a) **Every image over 1 MiB is graded `high` ("unread")**: JPEG of 1,048,576 B -> low; 1,048,577 B, 3 MB, 25 MB -> high, opens only by the warned path ("own device, no macros") (`file-safety/index.mjs:415-417, :736-738`); R6 says an image is low by source alone. (b) TIFF/HEIC/BMP/JP2 are `unknown`; their deeper check is `incomplete` for ever (`:1569`). (c) Four classifiers disagree (file-safety, the registry, doc-clean, image-cover). (d) A file with `%PDF-1.x` in its first KiB is a PDF even if it starts `FF D8 FF` (`formats.mjs:65` runs before `isImage`), and is sent to `/render`. (e) The structure check returns `clean "image"` without opening it (`index.mjs:1568`), and that feeds R18's second-engine release. (f) `unknown LIMIT:ScanTime` counts as scanned for 7 days and loses its reason (`#writeNote` writes `reason` only, `:462-468`). (g) A scan batch has a count bound (200) and no byte bound; all targets are staged on the container disk before one `clamscan` (`clamav.mjs:93-109`). (h) The renderer caps pages (500) but not raster size per page (`renderer.mjs:141-146`; **hyp**, the probe was refused). (i) **A hold or ClamAV verdict gates nothing in reading, OCR or extraction**: no reading module imports file-safety; decoders run before the daily scan. | SHAPE, PATH, LIVE | a-d **ran**; e-g, i **code**; h **hyp** [F] | file-safety, file-scanner | F1-F8 |
| **S14** | **Detection order lets an image be taken for a PDF or web page.** HTML and PDF are asked before jpeg/png: a baseline JPEG whose COM segment says `%PDF-1.4`, or whose first KiB holds `<html`, detects as `pdf` or `html` and is lost to OCR (the pdf entry then refuses it `final`). The OCR member's own `isPicture` is signature-first and correct, so the inconsistency is in the plane. | ENC, PATH | **ran** [D] | format-registry | A15 |
| **S15** | **Pictures on web pages are kept as bytes and never read or marked.** No screenshot of a rendered page exists (`browserrender.mjs:48`). A page whose substance is an image yields HTML with `<img>` and no text of the image; `supportingOf` (`acquisition/index.mjs:1985`) counts kept and skipped only. `keepRenderBodies` decodes all bodies before keeping any (`render.mjs:337-347`): 64 MiB decoded + 85 MiB base64 against 128 MB (**hyp**; 40 × 1.5 MiB peaked at 82 MiB in node). | SILENT, MEM | code; **ran** (partial) [G] | capture-sources, capture, reading-pipeline | G1, G2 |
| **S16** | **OCR member bounds are late, unmeasured for the real path, and unguarded in time.** The frame check runs after the renderer decoded the page (a 4000 × 4000 PNG is decoded in 1.8 s and then refused); the prepared frame can exceed the 4096 edge (4096 × 3072 -> 4159 × 3157, 52.5 MB); 61.3 MB was measured in an engine-only worker before the picture, `prepare` and PNG buffers existed; the peak working set (R2 bytes + renderer decode + PNG + inflated raw + packed + RGBA + the wasm copy + tesseract's copy) is unmeasured; a new engine instance and a 4.1 MB model load on every call, wasm memory not shrinking until GC; there is no time or CPU bound in code (10.4 s measured at 300 dpi against 30 s, in a comment); the member re-loads the whole object from R2 on each of up to 24 calls; `image.dpi` is `null` for pictures and the engine is never told a resolution; `OCR_PSM` and `OCR_CONFIDENCE_FLOOR` are set nowhere in the repository and an invalid PSM is accepted silently. | MEM, WORK, SHAPE | **ran** (node) [C]; the workerd figures are **hyp** | ocr-worker | D9, D10 |
| **S17** | **What is kept of an OCR read is page-grain text only.** The regions (line rectangles, per-line confidence, the frame geometry, `pixels_sha256`) are checked and dropped (`reading-pipeline/index.mjs:314-318, :500-528`; the only `regions:` write is `textchain.mjs:1073`). A JPEG/PNG unit's extent is `{kind:"pdf-page", page:0, rect:null}`; `page_boxes` and `container_extent` are null. No requirement states an image's extent, whether regions are kept, or what a member cites. The legibility of a picture is checked (after OCR, discarding the work: `page-hard-blur.jpg` 3.9 s) but a PDF page of the same quality is accepted at any quality (`member.mjs:184`; R25 and its control test say so), and `OCR_CONFIDENCE_FLOOR` is null everywhere. | SILENT, PATH | **ran** [C, D, E] | reading-pipeline, ocr-worker, extraction | B3-B7 |
| **S18** | **The door.** (a) Recognition is signature-only: `FF D8 FF` + filler is `jpeg certain` (**ran**). (b) Bounds disagree and are unstated: the door takes 256 MiB, the whole exists only ≤ 32 MiB inline, above by the ledger, the reading loads ≤ 24 MiB, and the UI withholds OCR from a copy held in parts only (`capture/index.mjs:1713`): **an image of 24-256 MiB is kept and permanently unread**, `final`. (c) A single-part upload is read back twice (`head, put, get, get` at 3 and 8 MiB, **ran**; `capture/index.mjs:816-822` then `profileOf`). (d) `op=capture` PUT reads an unbounded body into memory (`capture/ops.mjs:83`). (e) The project-less upload line draws "Text: None: no page has text" for a failed or owed reading, because `readingOf` marks `read:true` for any reading object (`capture.mjs:941-948`), and the `picture` flag is the browser's declared type only (`:934`). (f) `capture/index.mjs`'s image tests use `new File(["photo bytes"], "x.jpg", {type:"image/jpeg"})`. | SHAPE, SILENT, MEM | a, c **ran**; b, d, e code [G] | capture, screens-intake | A16-A18, F1 |
| **S19** | **Rewrites and requests without a guard.** `pdfStructure` and `pageTranscribe` load the whole object with `ev.get(sha)` and no size check (`extraction/index.mjs:2194-2197, :2402-2404`; for a picture the AI path loads it a second time, `plane/transcribe.mjs`); neither compare-and-sets the rewrite (basis read at `:2186`, written at `:2313-2333` after up to 24 OCR calls, tier 2 and an object read); `readHeld` and `#continueText` do. `says` claims the pages asked, not the pages filled (`:2512`, **ran**: 20 asked, 8 filled, "read pages 1, 2, ..., 20"). The OCR re-read rewrites the whole index every pass (`#writeReread`, budget `Infinity`; 28-37 ms a pass at 400 pages in node, **hyp** in workerd). | STATE, SILENT, MEM | code; **ran** (`says`) [E] (PDF #1's N16) | extraction | E11 |
| **S20** | **A transient failure at tick 2 ends a piece read** (PDF #1's N14, confirmed). `#continueText` sets `more=0` for any answer with no boolean `more` (`extraction/index.mjs:881-885`). A scan read in pieces is affected the same way. | LIVE, SILENT | **ran** [E] | extraction | E7 |
| **S21** | **An unread picture inside a text page is not counted as unread.** `image_content_undetermined` and `image_unread` route nothing (`reading-pipeline/index.mjs:212-215`), so a page that is mostly a picture of a table under a text title is "read" at tier 1; `words_total == words_read`. The markers raise `text_undetermined` but not the unread count. | SILENT | code [D] | reading-pipeline | E5 |
| **S22** | **Hygiene.** Photo-ness in `case-carriage` is decided by declared type or extension, not bytes (`case-carriage/index.mjs:106, :733-737, :811`); the pdf-worker `test` script omits 65 codec tests; two EXIF parsers; `#unreadOf`'s stale comment; `pdf-worker`'s `pagepixels-worker.mjs` kept as a surface-looking file. | PATH | code [A, B] | case-carriage, pdf-worker | — |
| **S23** | **The words say photos are safe where they are not coverable.** `photo.reminder` ("anyone in it ... is obscured in the public copy", `screens-intake/capture.mjs:508, :531`) is promised for every photo; `coverAreas` handles baseline 8-bit JPEG and 8-bit non-interlaced PNG only. Progressive JPEG (very common), CMYK, 16-bit, interlaced PNG, GIF, WebP, HEIC, TIFF, BMP get a refused code and **no copy** (fail closed, case-carriage:981-983), so nothing unsafe is published — but the member learns at mark time. | SHAPE (words) | code [B] | image-cover, screens-intake | — |
| **S24** | **An encrypted scan is never OCR'd** (PDF #1's N24, confirmed by code): `needsTier3` and `tier3Pages` return nothing for any document carrying one `encrypted` marker (`reading-pipeline/index.mjs:218-227`); only tier 2 (text) decrypts. | ENC | code [D] | reading-pipeline, pdf-pixels | C11 (PDF plan) with scans |
| **S25** | **Later-piece OCR text sits under a chain that does not cover it.** `indexUnits` for pieces after the first uses the stored reading's `text_source`, written for the first range only (`extraction/index.mjs:884`; provenance `text_scope`, `reading-pipeline/index.mjs:2740-2741`); `tier3SeedFrom` (`:436-463`) then cannot keep pages no part names, so a continuation re-OCRs them. | STATE, PIECE | **hyp** (mechanism from the lines; not run) [D] | reading-pipeline, extraction | E3 |
| **S26** | **Cost of time to whole is unstated and unmeasured.** The OCR member is about 10 s a page (a cost string; 0.1-4 s measured on 0.3-0.4 MP crops in node; 10.4 s CPU at 300 dpi Letter in workerd), 24 pages a pass, 29-31 s a tick measured at rewalk 6; a ledger gap is up to 451-551 s (G70, STILL). A 1,000-page scan is therefore about 2.8 hours of OCR plus gaps (PDF #1's B-5 figure), and the member is told neither. | WORK, LIVE | measured in the walks [I]; node timings [C, D] | plane, reading-pipeline | F4 |

### 3.4 Why the tests kept missing them (the patterns)

These are PDF #1's P1-P11 as they hold for scans, plus three of the scan family's own [H, I].
- **P1, one kind of file moved bar by bar.** Every walked scan: ImageMagick `convert` of the walker's own text, English, upright, JPEG pages in a PDF, 30 or 60 pages, 1.9-6.0 MB (rewalk4-7). Every photograph: generated with a tilt, noise and blur (L26's floor); "Read 184 of 184 words" counts words returned, not words right (`rewalk/A.md:48`).
- **P2, a bound by count, not by work.** Bytes for inline reading (G5) against the cost in pages (scan30); a frame check after the render; the plane's 24 calls a request with no time.
- **P4, measured outside the shape.** The OCR member's 61.3 MB on synthetic frames in an engine-only worker; node RSS and node times in every scan test; Miniflare enforces no 128 MB; `last_mem` is null; the shape harness has no image kind (G).
- **P5, fixed on the path the test used.** E6 then scan30; C17 (the screen stops offering a press that fails for pictures, which hides S4).
- **P6, a fix's new state is moved by no test.** The `ocr` ledger kind has a PDF test (`r82.test.mjs:140-176`) and no picture test; `ocr_left` is read by nobody.
- **P8, two fields disagree.** `completeness` "whole" beside `ocr_left` 6; "Text: None: no page has text" beside a reading that owes OCR.
- **P9, ceilings disagree.** 256 MiB at the door, 32 MiB inline whole, 24 MiB read, 20 MiB assembled from parts, 3 MiB / 2 MiB inline, 5 MiB for the AI's PNG, 32 MiB for image-cover, 61.3 MB the frame, 1 MiB for file-safety's head.
- **S-P1, the builder's own input.** 12-byte "JPEGs" in `picture.test.mjs`; a 20-byte JPEG in t43/t44; an 8-byte PNG signature in file-safety; a DCT fixture that is "8 bytes of JPEG header, never decodable" (`convert-ocr.test.mjs`); the `ocrAnswer` helper with one region per page and `confidence:"none"`. The only real-entry-path tests that run the real member are `convert-ocr.test.mjs:126` and ocr-worker's own part B.
- **S-P2, an instrument that is not a test.** The pdf-worker codec suite is outside `npm test`; the pagepixels and DCT memory probes are probes, with no assertion.
- **S-P3, the contract between two modules has two test copies.** ocr-worker's R24/R25 suite uses a copy of the engine wrapper because the real file cannot load in node.

---

## 4. The envelope (K4798 (4))

### 4.1 How to read the table

Each row is one bound a scan or image read depends on:
- **Today** is the value in the code, with the file and line.
- **Stated** names the requirement that states it, or says "unstated".
- **Recommended** is the bound this plan proposes and what a file over it gets: always a named statement, `final`, nothing owed for ever, never silent (SI2, SI6).
- **Who:** "BOB's" means decided under P17, recorded once in `rulings.md` and reported to Bob as done. "**Bob's**" means it changes what a member may do or is told (K1881) and is put to him in §4.3. A protective limit against a hostile or broken file is BOB's.

Platform figures used: the object has 128 MB; the plane idles at about 50 MB since G39 (PDF #1, E: to be re-measured); value rows are at most 2,098,176 B; workerd freezes `Date.now()` in synchronous work (R-CLOCK); the OCR member has `cpu_ms` 30,000 (`ocr-worker/wrangler.jsonc:63`) and a 61.3 MB frame bound.

### 4.2 The bounds

| # | Bound | Today | Stated | Recommended | Who |
|---|---|---|---|---|---|
| **A. Types, bytes, pages** | | | | | |
| A1 | Image types read | JPEG baseline/extended-sequential 8-bit (1/3 comps), PNG non-interlaced; **nothing else** (S3) | reading-pipeline R4 (JPEG/PNG); the registry comment (`formats.mjs:269-272`) | Stated as a table in format-registry: **read** JPEG, PNG, and (B-S1) TIFF and GIF; **not read, stated by name** WebP, HEIC/AVIF, BMP, SVG, JP2. A file of a type not read gets the sentence "Civicsmith does not read <name> files; the original is kept" and **no no-op act** (S3) | **Bob's** (B-S1) |
| A2 | Bytes of an image or scan read | The door takes 256 MiB (`acquisition:359`); the whole exists ≤ 32 MiB inline (`MULTIPART_KEEP_MAX`); the reading loads ≤ 24 MiB (`WHOLE_READ_MAX`, `reading-pipeline:51`), 20 MiB from parts (`:47`); an image of 24-256 MiB is kept and permanently unread (S18) | reading-pipeline R37; extraction R84 names the constant | **24 MiB**, as PDF #1's A1, stated in pdf-pixels, ocr-worker and the member's words; over it, the size statement once, `final`; **and** the 24-256 MiB gap named in the door's answer, not only on the Document screen | **Bob's** (B-S2, with PDF's B-1) |
| A3 | Pages of a scan read by OCR | None; 24 a pass | unstated | **1,000** (PDF #1's D8/B-5): the first 1,000 read, the rest stated unread, never silent. Applies to a PDF and a multi-page TIFF alike | **Bob's** (B-S3) |
| A4 | Frames of a GIF; pages of a TIFF | n/a (no reader) | unstated | GIF: the first frame is read and the rest **stated** (`ANIMATED_IMAGE` is image-cover's word); TIFF: all pages up to A3's cap, each an IFD walked with a count bound (A8) | BOB's, with B-S1 |
| A5 | Pixels of a standalone picture, full frame | JPEG: `PICTURE_SOURCE_MAX` 16384 × 12288 × 3 = 603,979,776 **samples** (`picturepixels.mjs:56`, counts samples, not edges: 65535 × 9216 grey passes); reduced frame ≤ 4096 × 3072 × 3 (`:46`); PNG whole frame ≤ 37,748,736 samples from IHDR (`:463-466`) | pdf-pixels R42 | Unchanged, stated; add an **edge** bound (65,535 per edge) to the sample bound | BOB's |
| A6 | Declared size of an image **inside a PDF**, every route | **None** on DCT-decoded, CCITT, JBIG2 (below 2^28), raw (S5); JPX and PNG only for samples | R4 (JPX), R10 (PNG), R42 (picture) only | One bound for every route, judged from the dictionary and the codec header **before any allocation or inflate**: `width × height × components` of the *output* ≤ the working-set bound (61.3 MB today, image-codecs R4), else `IMAGE_TOO_LARGE` with the figures, a 200 `ok:false`, never a kill. A larger scanned page is **reduced** (the picture route's `reduce(k)`) with 300 dpi as the floor, as PDF #1's D2 | BOB's (protective); widening what is read through reduction is **Bob's** only if it changes the 300-dpi floor |
| A7 | Inflated size of an image stream | `INNER_DECODE_MAX` 128 MiB for raw ≥ 128 KiB; **unbounded** `inflateWhole` below (`pdfstructure.mjs:818-829, :177-180`) | unstated | Inflate with a cap of `rowBytes × height` (arithmetic before the inflate), never the whole isolate; the check at `pagepixels.mjs:608-614` already computes `need` — move the cap into the inflater | BOB's (protective) |
| A8 | Objects in an image container | JPX precincts/packets uncounted (S6); image-cover chunks/markers uncounted (S7); TIFF IFDs (n/a) | unstated | Counted before built: JPX precincts ≤ the working-set bound's worth (a number measured by D7); image-cover chunk/marker count ≤ 65,536 and **row stride ≤ 8 MiB** judged before the row buffers (S7); TIFF IFD count ≤ A3 | BOB's (protective) |
| **B. Colour, compression, orientation** | | | | | |
| B1 | Colour and sample kinds | Raw: 1-bit, 8-bit grey, 8-bit RGB; refused (stated): Indexed, ICCBased, CalRGB, Lab, Separation, CMYK, 4-bit, 16-bit raw; CMYK/YCCK JPEG; 4:1:1 JPEG; PNG all legal depths | pdf-pixels R24; image-codecs R1 | PDF #1's D4: ICCBased N=1/3 as grey/RGB, Indexed expanded, 16-bit reduced, CMYK naively converted; Lab/Separation stay refused, stated. Add `/Decode` on 8-bit raw, `/SMask`/`/Mask` composited or **stated** (S12) | BOB's |
| B2 | Compression | JPEG baseline/extended Huffman; **refused:** progressive, arithmetic, lossless, hierarchical, 12-bit, multi-scan, DNL; CCITT G3-1D, G4 (K>0 refused); JBIG2 (page-size and region features per `JBIG2_REFUSES`); JPX (no HTJ2K, palette, sYCC, subsampled, signed, >3 comps); LZW/RunLength before an image refused; interlaced PNG refused | image-codecs R1-R4, R10, R11; pdf-pixels R22-R25 | Stated once as the set; **progressive JPEG decoded** (the common web/scanner export, a decoder is bounded work, S11); the rest remain refused, **stated by the refusal's own reason to the member** (S11) | BOB's (decoding progressive widens what is read: told to Bob as done under P17) |
| B3 | Predictors and `/Decode` | PNG predictors ≥ 10 applied; **TIFF predictor 2 passed through** (S12) | unstated | Predictor 2 decoded (8-bit and 16-bit, 1-4 colours); an unknown predictor refused, never passed; `/Decode` honoured on every sample route | BOB's |
| B4 | Orientation | EXIF Orientation on a JPEG (R43); PDF `/Rotate`; **nothing for a PNG or an unlabelled JPEG** (S9) | pdf-pixels R21, R43 | The engine's orientation call is asked on every frame; a page found turned 90/180/270 is turned and OCR'd; a page the engine cannot orient is stated ("this page is sideways or too faint to read"), not stored as text | BOB's; the member-facing choice is **Bob's** (B-S6) |
| B5 | Dpi | `null` for pictures; never given to the engine (S16) | ocr-worker R8 lists it | Stated as unknown for pictures; `prepare` targets a line height (20 px) in place of a dpi | BOB's |
| **C. OCR: time, memory, quality, language** | | | | | |
| C1 | The OCR frame | 61,300,000 B RGBA, checked **after** the render and the PNG build (`member.mjs:116`) | ocr-worker R7 step 4 | Judged from the header **before** the render (A6); re-measured for the full path (bytes + render + PNG + inflated raw + packed + RGBA + wasm copy + model) in real workerd, two consecutive frames in one warm isolate, with the bound re-set to what the measurement admits; the prepared frame is judged before the engine, as today | BOB's (a measurement first, §6) |
| C2 | CPU per OCR page | 10.4 s at 300 dpi Letter against `cpu_ms` 30,000 (a comment); scales with text density and noise, not only pixels (**hyp**) | unstated | A dense-noisy page and the largest admitted frame measured under **20 s on one core** (K4787); no in-code timer is possible (R-CLOCK), so the bound is the frame size and a cap on regions returned (S16) | BOB's |
| C3 | OCR calls and time per request and per tick | 24 calls per `read` (`reading-pipeline:354`), each a page of "about 10 s"; **no deadline on a call** (`:357-361`); one tick can wait minutes on the member | reading-pipeline R4, R37 | **No OCR inside a member's request on any path** (K4354: the upload answers at once, the ledger reads). Per ledger tick: OCR pages bounded by the *member's wait* — at most **4 pages or 40 s of wait**, whichever comes first, after at least one page — and every page a tick leaves is owed on every path (SI1). A call has a deadline the plane can enforce (an `AbortSignal` timeout around the fetch; the fetch is I/O so the clock moves) | BOB's |
| C4 | Calls per request that load the object | The member reads the whole capture from R2 on each of up to 24 calls (`member.mjs:271-273`); the plane loads ≤ 24 MiB for a picture to do nothing (`bytesOf`, `:2377`) | unstated | The plane reads a 16-byte head for a picture entry; the member keeps one object read per page (acceptable) but states it | BOB's |
| C5 | Kill handling | A kill/throw = 5xx = `transient` and owed for ever (S8) | plane R77 (never forgets) | A top-level guard in the member (every throw -> a 200 `ok:false` with a named reason); a kill counts as an attempt; after **3** kills of one page that page is stated `PAGE_KILLED_READER` and the read goes on (PDF #1's E6) | BOB's |
| C6 | Languages | `eng` only (tessdata_fast 4.1 MB, `tessengine.mjs:46`); no language field on the wire; a non-English page is OCR'd by the English model, `ok:true`, no marker | ocr-worker R12 names the model | The limit **stated to the member** on every OCR'd document ("read as English"); adding languages (Spanish, Chinese, Vietnamese) is a product decision | **Bob's** (B-S4) |
| C7 | Legibility of a scanned page | Pictures only: share of words rated ≥ 0.6; < 0.2 refused, < 0.8 noted; **a PDF page: none**; `OCR_CONFIDENCE_FLOOR` null | ocr-worker R25 | The same measure for every OCR'd page (a PDF page, a picture): stored beside the text as `legibility {words, confident_words, share}`; the thresholds as today. What happens to an illegible page is **Bob's** (B-S6) | **Bob's** (B-S6) |
| C8 | What an OCR read keeps | Page-grain text; regions/confidence dropped; extent `pdf-page` p0 for a picture (S17) | none | Keep per page: legibility and engine, always (small); keep line rectangles in their own rows (not in the reading JSON) so a citation can show the region — a requirement for image-extents first | BOB's, unless it changes what a member may cite, then **Bob's** (told with the extent wording, K4269) |
| C9 | Engine instance | A new engine and a 4.1 MB model load per call (`tessengine.mjs:113-140`); accumulation across calls in a warm isolate unmeasured | unstated | Measured in C1's run; if memory rises, one instance per isolate with an explicit release, or a call count after which the member exits cleanly | BOB's (a measurement first) |
| **D. Safety, doors, memory beside the read** | | | | | |
| D1 | File safety on an image | Magic only, head 1 MiB; image over 1 MiB graded `high`; TIFF/HEIC `unknown`; verdict gates no read (S13) | file-safety R6, R11 | Image low by source at any size (R6 as written); TIFF/HEIC/BMP named `unread image type`, not `format_unchecked` for ever; the structure check says `not_examined`, never `clean` (S13e); one signature table for the family (S13c) | BOB's |
| D2 | A hold or scan result gating reading | None: decoders run before the daily scan | file-safety R16 leaves it open | A policy: until a decision, reading is **not** gated and the Document says nothing of it | **Bob's** (B-S7) |
| D3 | A scan batch | 200 targets, no byte budget, 900 s; `unknown LIMIT:*` counted scanned for 7 days (S13) | file-scanner R1, R16 | A byte budget per request (the container disk), `LIMIT:*` rescanned and its reason kept | BOB's |
| D4 | Web pictures | Bodies ≤ 400, 8 MiB each, 64 MiB; no screenshot; unread, unmarked (S15) | capture-sources R8, R9, R25 | State on the document "N pictures kept, not read" (a count and a size); a picture that is a scan of a page (dimensions ≥ 1000 px on an edge, grey/bilevel) is offered the same OCR as an upload; memory of `keepRenderBodies` decoded one body at a time | BOB's (words: a UX row, K4269) |
| D5 | image-cover (publication) | 32 MiB; 120 MP by product; row stride unbounded; chunk count unbounded (S7) | image-cover R3, R4 | A8's bounds; the photo promise (S23) worded to its coverable set, or progressive JPEG covered | BOB's; the promise is **Bob's** only if the words change what he approved (DEC-180) |
| **E. Liveness, state, load** | | | | | |
| E1 | Progress | No rule that an `ocr` tick advances (`NO_PAGES_LEFT` ends a row while pages are unread, S1); a picture's `ocr` row ends as finished (S4) | plane R77 | Every tick that answers `owed` advances the cursor or is `final` and stated (SI6); `ocr_left` read by the caller on every path | BOB's |
| E2 | State between ticks | The `openedPdf` slot is one global (PDF #1's N19); the OCR chain of a later piece (S25) | reading-pipeline R40 | Correctness never depends on the slot (SI9); the chain of a later piece names its pages | BOB's |
| E3 | Time to whole | Unbounded; 24 pages a pass, 29-31 s a tick, ledger gaps to 551 s (G70, STILL) | unstated | A promise in time: a 60-page scan whole in **15 minutes** and a 1,000-page one in **3 hours** on a quiet copy | **Bob's** (B-S5) |
| E4 | Everyday load (K4785: 5 at once) | One heavy row a tick, one slot | unstated | Measured with 5 scans at once (corpus F8), each screen within K4354 | BOB's (measure) |
| E5 | Concurrent OCR calls | The ledger runs one heavy row a tick; the member's isolate count unknown | unstated | Measured in C1's run | BOB's |

### 4.3 For Bob (K1881; each with an explanation, options and a recommendation, rendered when brought to him)

- **B-S1 Which kinds of image Civicsmith reads (A1, A4).**
  - **Today:** it reads photographs and scans saved as JPEG or PNG, and scanned PDFs. Any other image kind is accepted, kept whole, and then reported as "not read as text (non-textual or too large)", which is wrong ("too large") and unhelpful. The screen still offers "Read it now" and the assistant's reading for them, and both do nothing. The usual output of an office or library scanner is a multi-page TIFF; iPhones can save HEIC.
  - **Options:** (a) keep JPEG and PNG, and say plainly, by name, that the others are kept but not read; (b) (a) plus TIFF, single and multi-page; GIF (first frame); (c) (b) plus WebP and HEIC.
  - **Recommendation:** (b). TIFF is the scanner's format, and the codecs it uses (CCITT, Flate, JPEG) already exist in the repository; GIF is small. WebP and HEIC need new decoders (HEIC a large and patent-encumbered one); say so by name now and ask the member to save a JPEG, and revisit when a member asks.
- **B-S2 The largest image or scan read (A2).**
  - **Today:** the door takes up to 256 MiB; the reading loads up to 24 MiB. A scan of 24-256 MiB is kept and never read; the member sees this only on the Document page.
  - **Options:** (a) 24 MiB, stated at the door and in the member's words; (b) raise it; (c) read in pieces beyond it.
  - **Recommendation:** (a), as PDF's B-1; a TIFF at 600 dpi is 5-30 MB a page, so the page count (B-S3) is what decides what a member can do.
- **B-S3 The longest scan read by OCR (A3).**
  - **Options:** (a) 1,000 pages (about 2.8 hours of OCR at today's figures); (b) 300; (c) no limit.
  - **Recommendation:** (a), as PDF's B-5. Over it the first 1,000 are read and the member is told which pages are not.
- **B-S4 The languages read (C6).**
  - **Today:** only English. A Spanish, Chinese or Vietnamese page is read by the English model and comes back as plausible garbage with no warning.
  - **Options:** (a) state "read as English" on every OCR'd document; (b) add Spanish; (c) add the languages a group asks for.
  - **Recommendation:** (a) now (it is cheap and honest), (b) as the next product decision. Each language is a 4 MB model in the member and a language field on the wire.
- **B-S5 How long "being read" may last for a scan (E3).**
  - **Options:** (a) 15 minutes for 60 pages and 3 hours for 1,000, on a quiet copy; (b) tighter; (c) no promise.
  - **Recommendation:** (a), with the member told the expected time when a large scan starts (a UX row).
- **B-S6 A page that cannot be read well (B4, C7).** A page that is sideways, blurred, faint or in another language.
  - **Today:** a picture below 20 percent legible is refused, and a picture below 80 percent carries a note; a scanned PDF page is accepted at any quality, and a sideways picture at 25 percent legible is stored as text.
  - **Options:** (a) the same rule for pictures and scanned pages: turn the page upright first; then below 20 percent legible store nothing and say so, below 80 percent store it and say "only partly legible"; (b) store everything and mark the page; (c) keep today's.
  - **Recommendation:** (a). A garbage page in the record is worse than a stated gap (K4571).
- **B-S7 Does a safety hold stop an image from being read? (D2)**
  - **Today:** no. File safety grades and scans a file beside reading, never before it, and the daily virus scan can find something after the file was read and cited.
  - **Options:** (a) no gating (reading is in the plane's own sandbox); (b) wait for the scan before reading an image; (c) read, and hold the citation until the scan.
  - **Recommendation:** (a) for now, because the decoders are pure code in the plane and the original is not opened; state the policy in file-safety. This is a doctrine question: put it to Bob.

### 4.4 The invariants (the "always", stated once; each corpus file is judged against all of them)

The invariants name the module whose requirements carry them; BOB writes the wording into those requirements (§6). PDF #1's I1-I14 hold for scanned PDFs; these are the scan family's, with the ones it shares noted.
- **SI1 Every page once, and what is left is owed.** Every page of a scan is OCR'd exactly once or stated unread with a named reason; any page a cap leaves is owed on **every** path (upload, promote, press, ledger, `pagetranscribe`, `pdfstructure`); `ocr_left` is read by every caller. *(reading-pipeline R37, extraction R82; PDF #1's I9.)*
- **SI2 Never silent.** `completeness` is "whole" only when nothing is owed and no page is unread for a reason other than "has no text"; a type not read is named; a refusal's own reason reaches the member (S2, S3, S11). *(extraction R91, K4571.)*
- **SI3 Declared before allocated.** Every route judges the header's declared size before any allocation or inflate; a hostile header gets a named 200 refusal in under 1 s and the process stays flat (S5-S7). *(image-codecs, pdf-pixels, image-cover.)*
- **SI4 Memory.** The plane child at 128 MB with the held bytes inside it stays alive and within PDF #1's E4 budget; the OCR member's peak working set (C1) stays within its measured bound for every admitted frame. *(pdf-pixels, ocr-worker, plane.)*
- **SI5 Work.** No member request does OCR or a decode over its K4354 bar; every tick's OCR wait is within C3. *(control-plane, reading-pipeline, plane R93.)*
- **SI6 Progress and finiteness.** Every `ocr` tick that answers `owed` advances or is `final` and stated; a kill is an attempt; a page killed 3 times is stated; no row is "being read" after the last tick. *(plane R77, ocr-worker.)*
- **SI7 Search finds the last line.** A marker word on the last line of the last OCR'd page (and a first and a middle one) is found by `op=search` and is citable with its page. *(extraction R22, R90.)*
- **SI8 Truth.** A page that OCR reads contributes its words at the stated floor (≥ 90 percent on a clean page; the amended floor on a stated-hard one); a page below the legibility floor is stated and is not stored as text (S9, B-S6). *(ocr-worker R25.)*
- **SI9 State loss is harmless.** Restarting the object between any two ticks, or losing the open document, gives the same reading and units. *(reading-pipeline R40; PDF #1's I8.)*
- **SI10 Pieces equal whole.** The OCR text of a scan read in pieces equals the whole read's, and each piece's chain names its pages (S25). *(reading-pipeline R40.)*
- **SI11 Stored values bounded.** No stored value exceeds 1 MiB, and none exceeds the platform's value bound. *(extraction R96.)*
- **SI12 Same bytes, same answer.** Two runs of the same image give the same pixels (`pixels_sha256`) and the same units. *(pdf-pixels R40, image-codecs R8.)*
- **SI13 Honest acts.** No act is offered on a document that it cannot perform; a type not read says so by name once. *(screens-inquiry, extraction.)*
- **SI14 Contention.** While a scan's ticks run, cheap reads through the door wait under 500 ms at p95. *(plane R93; PDF #1's I13.)*

---

## 5. The corpus (K4798 (5))

### 5.1 How it is made

**One generator, seeded, that knows its own truth.** `imggen.mjs` under **test-support** (layer 1, beside PDF #1's `pdfgen.mjs`; BOB adds the path), no dependency on the network:
- **Pages.** Text lines are rasterised in node from a built-in bitmap font at a stated line height, so the generator needs no font file and the truth (the words) is exact. Each line carries `<seed>-p<page>-l<line>` and a word from a small vocabulary. Degradations are seeded and independent: tilt (±10°), 90/180/270 turns, uneven light, noise, blur, inversion, low contrast, colour, two columns, a table.
- **Encoders.** PNG (grey, RGB, palette, alpha, 1/8/16-bit, interlaced or not) and BMP and GIF (LZW) and TIFF (uncompressed, PackBits, Flate, LZW, G4, JPEG-in-TIFF; single and multi-page; II and MM; predictor 2) are written by the generator. Baseline and progressive JPEG (4:4:4, 4:2:2, 4:2:0, grey, CMYK, EXIF orientation 1-8) come from the committed Pillow/libjpeg generator (`make-picture-fixtures.py`) with its hashes; WebP and HEIC come from the same generator where an encoder exists and from committed tiny fixtures where it does not (no HEIC encoder was available here). CCITT G4, JBIG2 generic and JPX scan pages inside PDFs are produced by PDF #1's generator with its independent decoders (libtiff, jbig2dec, OpenJPEG).
- **Hostile files.** Declared-size files are patched headers (IHDR, SOF, SIZ, JBIG2 page info, PDF `/Width /Height`) over a few bytes of data; bombs are streamed zlib; chunk-count files are generated as bytes.
- **Truth file.** For each file: the page count, each page's words and orientation, the pages expected unread and the named reason, the expected statement for a refusal, and the markers on the first, middle and last lines.

**Two oracles, never the reader's own past output.** (1) The generator's truth. (2) An independent decoder for pixels: Pillow, libjpeg-turbo, libtiff, jbig2dec, OpenJPEG (the repository's own references); the OCR text is judged against the truth by the floor of SI8, not against a stored OCR output.

**The entry paths.**

| Path | What it runs | Owner |
|---|---|---|
| **R** the real path | PDF #1's shape harness (`test/m/plane/shape/harness.mjs`), made a suite runner, with two additions this plan needs: an **image document kind** (`imageDoc`, `scanDoc` beside `textDoc`, `pdfDoc`), and `members: "real"` binding the ocr-worker handler from its committed bundle over the same R2 stand-in. Upload by `captureOf(ctx).uploadCapture`, the capture screen's promotion, the door's `pendingadd`, the ledger's alarm driven tick by tick to the end, then `op=search` for the three markers, `op=reading` paged by `next`, and the Document screen's Next page to the last page. The child's old space is 128 MB with the held bytes inside it; faults `restartAt: n`, `storeFailAt: n`, `killPage: p` (the member dies on that page). Per tick it reports pages, OCR calls, bytes pulled, store calls, longest operator stretch; never a time from the object (R-CLOCK). The OCR wait is timed by the test, outside the object | **plane** (a new `scan-shape.test.mjs`, heavy, run alone) |
| **M** the module interface | Each module's own tests read the same generated files at their interface, so a failing-first test points at its module: image-codecs (decode against the oracle), pdf-pixels (`renderPageToPixels`, `renderPictureToPixels`, bounds), ocr-worker (the member over a page, in node with the real engine and under Miniflare), reading-pipeline (`read` in pieces with the real member), extraction (`readHeld` ticks, completeness, search), file-safety (classification, grade), capture (`uploadCapture` of the file), image-cover (cover, strip, hostile counts) | each module (column "Owner" below) |
| **W** workerd | The files that test the thread and the platform's behaviour: the OCR member's CPU and memory at the largest admitted frame, **two consecutive frames in one warm isolate** (C9), and the contention run (SI14). Memory is not asserted in Miniflare (it enforces none); the OCR member's memory is read by a **P** probe (read-only: a fixture OCR'd on biosmoke8 and the member's memory read back) at each redeploy, as K4785 (4) brings forward | plane, ocr-worker |

**Note on memory in the OCR member.** Local workerd enforces no 128 MB and node's RSS is not the isolate's bytes. The OCR member's peak is therefore **measured, not asserted, in node**, and **asserted on biosmoke8** by the P probe; the first job (§6) is that measurement.

**When it runs.**
- **At every round end,** whole, never only for the fix in hand (K4785 (3)), in its own container with nothing else (K4787 (3)), then again for the time-sensitive set on one core (`taskset -c 0`).
- **Seeded variations:** the 8 fixed seeds of §5.2 F plus 8 derived from the round's tranche commit. A red keeps its seed and spec in the run's record; the generator's shrinker (halve pages, drop axes one at a time) gives the smallest failing spec before the red is planned.
- **Live subset on biosmoke8 (K4785 (4)):** the smallest file of each family (marked **L**) is the subset. Choosing it is item (4)'s, not this plan's.

**What passing means.** A file passes when all of SI1-SI14 hold for it, or, for a refusal file, when SI2, SI3 and SI6 hold with exactly the statement its truth names and nothing else is read wrongly. "At the platform's shape" means: the plane in a 128 MB child with the bytes inside it; the OCR member at its stated frame bound; the CPU of one core; no timing taken from the object's clock (R-CLOCK); and the R-CLOCK exemption that the test, outside the object, times the OCR wait.

### 5.2 The files

Sizes are the file's bytes. "R" is the real path; every file also runs at its owner's interface (M). The first module named owns the failing-first test; plane owns R for all.

**A. Standalone image types** (each a one-page text page, English, upright, unless said)

| # | File (how made) | Path | Passes when | Owner |
|---|---|---|---|---|
| A1 **L** | Baseline JPEG, 4:2:0, 1700 × 2200, 300 KB | R | Read; the markers found by search; the unit is `pdf-page` p0 with legibility stored | reading-pipeline, ocr-worker |
| A2 **L** | Single-page TIFF (G4, 2550 × 3300, 1-bit) | R, M | Read (B-S1(b)); if B-S1 is (a), **stated by name** and no no-op act (S3) | reading-pipeline, pdf-pixels |
| A3 | Multi-page TIFF: 12 pages Flate grey, and 40 pages G4, II and MM, with and without predictor 2 | R, M | Every page once (SI1); a page-count over A3's cap stated; the last page's marker found | pdf-pixels, reading-pipeline |
| A4 | TIFF with JPEG-in-TIFF, LZW, PackBits, uncompressed, strips and tiles | M | Pixel-exact against libtiff | pdf-pixels |
| A5 | GIF, one frame; animated GIF of 10 frames | R, M | First frame read, the rest **stated** | reading-pipeline |
| A6 | WebP lossy and lossless | R | Read or stated by name, per B-S1 | format-registry |
| A7 | HEIC (committed tiny fixture); AVIF | R | Stated by name, per B-S1 | format-registry |
| A8 | BMP, SVG, JP2 file, ICO | R | Stated by name; none offered the no-op act (SI13) | format-registry, extraction |
| A9 | PNG: 8-bit grey, RGB, palette, 16-bit, alpha, interlaced; a 24 MiB PNG | R | Per B2 (interlaced refused with its own reason); the 24 MiB one read or stated per A2 | pdf-pixels |
| A10 **L** | Progressive JPEG; CMYK JPEG; arithmetic JPEG; 4:1:1 JPEG; 12-bit | R | Progressive read (B2); the others refused with **their own reason** shown to the member (S11) | pdf-pixels, reading-pipeline |
| A11 | Truncated JPEG at 2%, 50%, 99%; truncated PNG | R | Stated as truncated with the figure; no partial answer (image-cover's behaviour, extended) | pdf-pixels |
| A12 | JPEG with `%PDF-1.4` in a COM segment; with `<html` in EXIF; PNG with `%PDF-` in tEXt | R | Read as an image (S14) | format-registry |
| A13 | 12 MP and 48 MP phone JPEGs (EXIF 6 and 8), 4032 × 3024 | R, W | Read upright; the long edge reduced; CPU and memory recorded for C1 | pdf-pixels, ocr-worker |
| A14 | PNG at the frame bound: 4096 × 3072 RGB; one pixel over | R, W | At the bound read; over it `IMAGE_TOO_LARGE` from the header (C1) | pdf-pixels |
| A15 | A JPEG of 24 MiB; of 24 MiB + 1; of 100 MiB | R | 24 MiB read or stated per A2; over it stated **at the door**; nothing left "being read" (S18) | extraction, capture |
| A16 | 1 MiB, 1 MiB + 1, 3 MB, 25 MB JPEGs | M | file-safety grades all `low` (S13a) | file-safety |
| A17 | 256 MiB + 1 upload | R | Refused at the door with the figure | capture |
| A18 | A 3 MiB JPEG and a 1.9 MB scan PDF uploaded through the Add screen | R | The upload answers within K4354; nothing OCR'd in the request; the reading follows by the ledger (S1) | control-plane, extraction |

**B. Orientation, colour, quality, language** (one page each; the ten pages of a scan for the combinations)

| # | File | Path | Passes when | Owner |
|---|---|---|---|---|
| B1 **L** | The same page turned 90, 180, 270 as PNG; as JPEG without EXIF; as JPEG with EXIF 6; inside a PDF with and without `/Rotate` | R | Read upright at the SI8 floor, or stated; **never** `ok:true` garbage (S9) | ocr-worker, pdf-pixels |
| B2 | Upside-down scan in a mixed PDF | R | Same | reading-pipeline |
| B3 | Inverted (white on black); low contrast; stamped over | R | Read at the floor or stated | ocr-worker |
| B4 | Two columns; a table; a form with boxes | R | Words found; reading order recorded as engine order | ocr-worker |
| B5 | Colour scan, 24-bit; 1-bit 300 dpi; 8-bit grey 150 dpi | R | Read at the floor | pdf-pixels |
| B6 | 110 dpi, tilt 2.4°, noise and shade (L26's photos); the hard page (K4316's 52 percent) | R | At the stated floors | ocr-worker, pdf-pixels |
| B7 | Spanish, Vietnamese (diacritics), Chinese pages | R | Stated "read as English" (B-S4) and the English model's output marked; or read per a decision | ocr-worker, extraction |
| B8 | Blank page; noise; stripes (no words) | R | `NOTHING_TRANSCRIBED`; the page stated "no text"; not stored | ocr-worker |
| B9 | A page with a handwritten line; a faint photocopy | R | Legibility stored; below the floor stated | ocr-worker |

**C. Scanned PDFs** (PDF #1's D files are the base; these add the OCR cadence)

| # | File | Path | Passes when | Owner |
|---|---|---|---|---|
| C1 **L** | 30-page CCITT G4 scan, 1.9 MB (re-walk 7's scan30) | R | 30 of 30 by ticks; the upload within K4354; nothing left unowed (S1, SI1) | extraction, control-plane |
| C2 | 60-page DCT scan, 6 MB; 60-page, 2.6 MB | R | 60 of 60; the first pass within C3 | reading-pipeline |
| C3 | 130-page tiny-image scan, one piece holding > 24 scanned pages | R | 130 of 130; no page missed (S1: today 82 unread) | reading-pipeline, extraction |
| C4 | 100 text pages + 150 scanned pages, read in pieces | R | 250 of 250; `completeness` never "whole" before the last OCR (S2) | reading-pipeline, extraction |
| C5 | 300-page grey scan, 24 MiB | R | 300 of 300; SI4, SI6; the time recorded against B-S5 | plane |
| C6 | 1,000-page scan; 1,001-page scan | R | 1,000 read; 1,001: the first 1,000 read, the rest stated (B-S3) | reading-pipeline |
| C7 | A scan of 20 pages whose pages differ: DCT, CCITT, JBIG2 generic, JPX, Flate raw 1-bit, 8-bit | R, M | All read; pixel-exact against the independent decoders | pdf-pixels |
| C8 | A page in 8 horizontal strips; one with an inline image; two images on a page | M, R | Composited (PDF #1's D3) or stated `MULTIPLE_IMAGES_ON_PAGE` | pdf-pixels |
| C9 | A4 at 400 dpi; Letter at 600 dpi (1-bit); Tabloid at 300 dpi | R | Reduced and read (A6, PDF #1's D2) or stated `FRAME_OVER_BOUND` | ocr-worker, pdf-pixels |
| C10 | A folio page (3 glyphs + a full-page image); a page with a text header and a scanned body | R, M | The OCR words appended; the page not refused (S10) | ocr-worker, reading-pipeline |
| C11 | A picture of a table under a text title (a text page with one large image) | R | The image counted unread, or OCR'd by the crop route (S21) | reading-pipeline |
| C12 | Encrypted (empty password) scan; with a user password | R | Read, or `PASSWORD_REQUIRED` once (S24, PDF #1's B-4) | reading-pipeline |
| C13 | 25 scanned pages with `/Decode [1 0]` on 8-bit grey; TIFF predictor 2; `/SMask`; Indexed; ICCBased; 16-bit | M, R | Per B1 and B3; never `ok:true` with wrong pixels (S12) | pdf-pixels |

**D. Hostile and bound files** (each small; the point is the refusal and the flat process)

| # | File | Path | Passes when | Owner |
|---|---|---|---|---|
| D1 **L** | An 8 KB CCITT stream declaring 60000 × 60000, K -1 | R | `IMAGE_TOO_LARGE` from the dict, a 200; < 1 s; flat; **not retried** (S5, S8) | pdf-pixels, ocr-worker |
| D2 | A 330-byte JPEG declaring 60000 × 60000; a valid 8000 × 8000 RGB JPEG; 30000 × 30000 with one MCU row | R | Refused from the header / reduced; flat; no 2.7 GB allocation | pdf-pixels |
| D3 | A JBIG2 page 16000 × 16000 with 20 bytes of data; a region taller than its data ending `FF AC`; a pattern dictionary of 2^22 | M, R | TRUNCATED, no invented rows; flat (S5, S12) | image-codecs |
| D4 | A 97 KB Flate stream for 10000 × 10000 grey; a 100 MB zero bomb | M, R | Refused by the arithmetic check; inflate capped (A7) | pdf-pixels |
| D5 | PNG declaring 100000 × 100000; PNG bomb (700 MB of zeros under 100 × 100); IDAT claiming 1 × 1 | M, R | Refused in < 1 s (these hold today; kept as controls) | pdf-pixels |
| D6 | JPX SIZ 500², 1000², 2000² with 2 × 2 precincts, 10 bytes of data; 1500² with 1 × 1 | M | Refused before the object table (A8); flat (S6) | image-codecs |
| D7 | PNG 30,000,000 × 1 RGBA; 120,000,000 × 1; 1,000,000 empty IDAT; 2,000,000 `FF 01` markers | M | Refused before the buffers; flat (S7) | image-cover |
| D8 | An image in an uploaded DOCX that is D7; a marked photo that is D7 in a case | R | The cover/strip refuses; the isolate lives | image-cover, doc-clean |
| D9 | A frame exactly at 61.3 MB and one pixel over, through the real renderers; two consecutive frames at 52 MB in one warm isolate | W | At the bound read; over refused before the render; no accumulation (C1, C9) | ocr-worker |
| D10 | A dense noisy 300 dpi Letter page (CPU); the same at the largest admitted frame | W | Under C2's 20 s on one core | ocr-worker |
| D11 | A throw-inducing input for the member (a renderer that throws, an R2 that throws) | M | A 200 `ok:false` with a named reason; not a 500 (C5) | ocr-worker |
| D12 | A member that dies on page 150 of a 300-page scan | R | Page 150 stated after 3 kills; the read goes on (C5, SI6) | reading-pipeline, ocr-worker |
| D13 | `unknown LIMIT:ScanTime`; 200 targets of 200 MiB | M | Reason kept; batch bounded (D3 of §4.2) | file-safety, file-scanner |
| D14 | A TIFF with 100,000 IFDs; a TIFF whose IFD loops | M | Refused at the IFD cap (A8) | pdf-pixels |

**E. The system around the read**

| # | File or run | Path | Passes when | Owner |
|---|---|---|---|---|
| E1 | C1 with `restartAt` ticks 2, 7 and the last | R | SI9 | reading-pipeline |
| E2 | C3 with `storeFailAt` tick 2 | R | Retried; whole (S20) | extraction |
| E3 | A1 uploaded; the OCR down for three ticks, then up | R | Retried to the end, an `ocr` row that does not end at `UNREADABLE` (S4) | extraction |
| E4 | The OCR press and `pagetranscribe` on C5 and A3 | R | Neither loads the file inside the request (S19); each owes what it leaves | extraction |
| E5 | **Load:** five members upload C1, C3, A3, C5 and A13 within one minute | R, W | Each whole (SI1); SI14 throughout; the memory peak within SI4 | plane |
| E6 | The same scan filed in two projects; and two versions sharing part 1 | R | Each reads its own; no first-wins answer (PDF #1's N20) | extraction |
| E7 | A multipart upload (> 8 MiB) of a TIFF and of a JPEG | R | Whole made; read; the sentence names the type (S3, S18) | capture, reading-pipeline |
| E8 | A captured address that is an image URL; a web page with 40 images of 1.5 MiB; a web page that is one large image | R | The image read like an upload; the page states "40 pictures kept, not read" (S15); memory flat | capture-sources, capture |
| E9 | A project-less upload of a failed picture and of an owed scan | R | The line says "could not be read" / "being read", never "Text: None" (S18e) | screens-intake |
| E10 | A hold on an image while it is read (B-S7) | R | The documented policy holds | file-safety |
| E11 | Re-walk 7's scan30 as the walker made it, plus a real camera photo in each of JPEG, PNG, HEIC | live (L) | Per its truth | plane, walk |

**F. Seeded variations** (16 a round end: 8 fixed, 8 derived)

The fixed seeds 1-8 cover the joint space once, chosen so each axis value appears at least twice:

| Seed | Type and pages | Codec | Degradation | Size |
|---|---|---|---|---|
| 1 | JPEG, 1 page | baseline 4:2:0 | tilt 3° | 800 KB |
| 2 | PNG, 1 page | palette | inverted | 300 KB |
| 3 | TIFF, 40 pages | G4 | clean | 3 MB |
| 4 | TIFF, 12 pages | LZW + predictor 2 | noise, shade | 6 MB |
| 5 | PDF, 130 pages | JBIG2 | 90° turn on every 7th page | 1.5 MB |
| 6 | PDF, 60 pages | JPX | mixed with 40 text pages | 8 MB |
| 7 | PDF, 300 pages | DCT, mixed sizes | two columns, one huge page | 24 MiB |
| 8 | all axes drawn at random | | | |

The 8 derived seeds draw every axis from the envelope's distribution: pages log-uniform 1-1,000, size up to A2, the type, codec, orientation, colour and degradation by their weights. A derived seed whose draw falls outside the envelope is answered by the statement its truth names.

Passing means SI1-SI14 for each seed. On a red, the seed and its shrunk spec are recorded in the run's file (owner: plane, which runs them; the generator is test-support's).

### 5.3 What this costs to run (to be measured by the first run)

There are 72 files and 16 seeds. The heavy files are A13, A15, C3-C6, D9, D10, E5: about 12 runs of 2-30 minutes each in node, and longer on one core and with the real OCR engine (about 0.3-4 s a page in node, 10 s a page in workerd). The OCR floor (SI8) makes the corpus depend on tesseract's behaviour on a bitmap font; **the first job proves the generator's pages read at ≥ 90 percent through the engine** (a clean page does in the repository's fixtures; the generator's font is **hyp** until run). It is a round-end suite, not a per-job one: each job runs the M-path files of its own module (a few seconds each, a few with the real engine) plus the R files its fix touches. The first round-end run records the times, and BOB sets the split from them.

---

## 6. What this plan hands BOB (the order of work it implies; BOB's to place)

1. **Measure first (a session with workerd and biosmoke8 read-only):**
   - The OCR member's real CPU and memory in workerd: a clean Letter page at 300 dpi, a dense noisy one, the largest admitted frame (52-61 MB), two consecutive frames in one warm isolate (C1, C2, C9, D9, D10). The 61.3 MB bound is a 2026-09-10 measurement of synthetic frames.
   - The plane's idle on today's bundle (PDF #1's first job; E4 of its plan).
   - The OCR wait per page on the live copy, read with `own_ms` and `wait_ms` on a real `ocr` row (none exists since G67).
   - ClamAV 1.4.3 on a declared-huge PNG/TIFF (S13; `clamscan` is not available here).
   - Whether the installer leaves ocr-worker reachable on workers.dev (S8).
2. **Place S1 now.** It is re-walk 7's scan30, a silent partial read live today, with no plan and no fix-round-8 entry. S2, S4, S8, S11, S20 are small and share its files (control-plane, extraction, reading-pipeline, ocr-worker). Place S5, S6, S7 beside PDF #1's N12 (one cause: a size judged after the allocation, on every route). Place the rest of §3.3 as fix round 8 causes with R-FOUR's four fields; their failing-first tests are the corpus files named for each.
3. **Write the envelope into the requirements:**
   - image-codecs: A6, A7, A8 (JPX), B2, B3, and SI3, SI12.
   - pdf-pixels: A5, A6, B1, B3, B4, C8 and SI3, SI8.
   - ocr-worker: C1-C9, S8's guard, S16, and SI4, SI6, SI8.
   - image-cover: A8 (stride, count), D5, and SI3.
   - reading-pipeline: A1, C3, C5, E1, E2, S11, S21, S25, and SI1, SI2, SI9, SI10.
   - extraction: A2, S2, S4, S19, S20, and SI1, SI2, SI7, SI11.
   - file-safety and file-scanner: D1-D3 and S13.
   - capture, capture-sources, screens-intake: A2, D4, S15, S18, and SI13.
   - control-plane: C3 (no OCR in the request).
   - plane: the scan twin of R84 (the corpus, SI4, SI5, SI14); format-registry: the type table (A1, S14); test-support: the generator.
   - Each line names this plan and K4798.
4. **Bring §4.3 (B-S1 to B-S7) to Bob, rendered, in one page.** No job that depends on one of them starts before he answers. S1, S2, S5-S8, S11, S12 and the invariants do not wait on any of them. A1 and A4 wait on B-S1; A3 on B-S3; C6 on B-S4; E3 on B-S5; B4/C7 on B-S6; D2 on B-S7.
5. **Fix the cheap, certain, reachable-today items regardless of Bob's answers:** the `npm test` script of pdf-worker (S22); the stale comment; an `owe` passed from `Extraction.read` and a caller that reads `ocr_left`; the top-level guard; the refusal's own reason carried to the reading; the file-safety image grade.
6. **The corpus runs at the round end that closes fix round 8,** whole, and at every round end after; the live subset runs at each redeploy (K4785 (4)).

## 7. Not covered by this plan

- K4785 (4) and K4798's "live subset on biosmoke8": choosing it.
- The ClamAV and renderer behaviour on a hostile image (no `clamscan` or unrestricted `pdftoppm` here; S13 g/h are **hyp**).
- The email door: none exists in code (B); the doorbell's file path was not read.
- Google Drive photos: Drive file links are named and not harvested (`drive.mjs:197-205`).
- G70's cause (the time between ticks), which belongs to fix round 8 as its own cause and decides every many-tick scan.
- The UX words for the new statements (K4269, rows owed to the design stream).
- The spreadsheet, document and archive families (SHEET #1, DOCS #1).
- Handwriting recognition and layout analysis beyond the engine's line order: stated outside the envelope.
