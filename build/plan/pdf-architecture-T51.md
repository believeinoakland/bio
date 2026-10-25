# PDF architecture, state of the code and corrections (K4798; completes `pdf-envelope-T51.md`)

> **Split K5021.** This file is part 1; the rest of it was moved whole, unchanged, to: §2 (state of the code) and §3 (corrections, with the recipe file at §3.3): `pdf-architecture-T51-s2-s3.md`. A reference "pdf-architecture-T51.md §n" finds §n in the part named here.

**Status** · DRAFT for BOB, written by a completing worker (sonnet, medium) for BOB #269 on `tranche/T51` (head `5821734aaa`, K4803, when I began; BOB has committed K4804-K4807 since, and none of those commits touched code or requirements: `git diff --stat 5821734aaa HEAD -- bio-plane pdf-worker ocr-worker build/requirements` is empty). No code, requirement or other file was changed; nothing was committed; no live site was contacted. It supplies the two parts PDF #1's report `build/plan/pdf-envelope-T51.md` lacks under K4798 (the architecture, and the state of the code) and the corrections K4803 asked for (the E4 memory sum, and a reproduction recipe for each "ran" defect the report cites only to its lost scratch). Read against the report's headings: the cause review is its §1, the envelope its §2, the corpus its §3; this file adds **§1 Architecture**, **§2 State of the code** and **§3 Corrections**.

**What I read.** Whole: the report (502 lines); `build/requirements/` `pdf-reader.md`, `reading-pipeline.md`, `pdf-pixels.md`, `image-codecs.md`, `ocr-worker.md`, `pdf-worker.md`, `extraction.md`, `file-safety.md`, `capture.md`; K4798, K4785 and K4803 in `rulings.md`; `build/modules.json` for the nine modules. Code, at the lines cited: `bio-plane/src/pdfstructure.mjs` (functions and lines throughout, the structure, stream, page, range and title code in full), `reading-pipeline/index.mjs` (`read` through `readInner`, `bytesOf`, `tier2Escalate`, `tier3Extend`, `askMemberPerPage`, the range code), `extraction/index.mjs` (`read`, `readHeld`, `#continueText`, `#continueOcr`, `pdfStructure`, `pageTranscribe`, `projectPromotion`), `extraction/ops.mjs`, `plane/pending.mjs`, `plane/door.mjs`, `plane/transcribe.mjs`, `control-plane/index.mjs` (the upload, acquire, promote, follow and press code), `capture/index.mjs` (`uploadCapture`), `capture/ops.mjs`, `acquisition/index.mjs` (the PDF-relevant parts), `screens-intake/capture.mjs` (`promoteDocument`), `file-safety/{index,formats}.mjs` (grade and structure check), `pdf-worker/src/{index,pagepixels,picturepixels,ccittdecode,pngdecode,jpxdecode}.mjs` and `ocr-worker/src/{index,member}.mjs`.

**No helpers.** K4803 asks for helpers (sonnet, medium) for shares over about 150 KB. This session has no subagent tool, so I read the shares myself, one module at a time; the largest were `pdfstructure.mjs` (221 KB), `extraction/index.mjs` (193 KB) and `reading-pipeline/index.mjs` (183 KB). I read the functions on the PDF paths whole and the rest by the function index and by grep; where a statement rests on a grep and not a reading it says "grep". Evidence words are the report's: **ran** (I ran it in node, with the real reader), **code** (read at the line cited), **hypothesis** (read, not run). Line numbers are those of the head named above.

**Scratch.** `/tmp/claude-0/-home-user-bio/6aed1ffe-00b3-5ed4-a2b8-c4bfc75648b8/scratchpad/pdf-arch/` holds the build files. It is not the record: every recipe the report needs is printed whole in §3.3, so it survives the container.

---

## 0. In short

**Architecture (§1).** A PDF reaches a reading by three read modes, not one:
- **Whole read, in the request** (`read` without a cursor): upload and web capture of a PDF up to 2 MiB; `op=pdfstructure`; `ocr=1` when not handed to the ledger; `pagetranscribe`; and every OCR pass of the ledger's `ocr` kind. All call `extractPdfStructure` (`pdfstructure.mjs:4308`) on the whole file.
- **Ranged pieces by the ledger** (`read` with a cursor, `openPdfRange`, `reading-pipeline/index.mjs:2521-2575`): the ledger's `reading` kind for a PDF over 2 MiB, one range of at most 100 pages or 1.3 MB a tick. This is the only path that ranges.
- **Three other readers of a PDF's bytes** outside the reading: file-safety grades and structure-checks a PDF with a full `extractPdfStructure` (`file-safety/formats.mjs:91`), acquisition reads a web-captured PDF's title with a second parser (`acquisition/index.mjs:1545`, `pdfTitle`), and `pagetranscribe`'s AI path renders pages in the plane (`plane/transcribe.mjs:64`).

So "a PDF" is parsed from its bytes by at least eight call sites, of which one is bounded by ranges. §1.4 lists them.

**State of the code (§2).** Nine tables. The mature parts are the bounded-memory object table, the link, image, box, active-content and title readers, and the codecs. The fragile parts are the revision and catalog semantics, the stream and page bounds, and everything that treats the first range as the whole reading. Findings new to this file (not in the report):
- **F-1** pdf-worker parses the whole file with tier 1 **before** it checks its own envelope (`pdf-worker/src/index.mjs:167` then `:170`), so tier 2 costs two whole parses plus pdf.js on every escalating tick (code).
- **F-2** `Extraction.read` passes no `owe`, and no production code passes one: the pipeline's `owe` hook (`reading-pipeline/index.mjs:2646`, `:2707`) is called by tests only. OCR is owed in production by a second mechanism, the `owed: true` answer of `readHeld` from `tier3_candidate` (`extraction/index.mjs:849`), and that answer is given only by a tick whose piece does not say `more` (`:851` returns `more` first; `#continueText` `:868-899` never answers `owed`). So a PDF read in several ranges is never handed to the ledger's `ocr` kind by its own ticks, and the OCR calls a range's cap leaves are dropped: this is the mechanism of N2 (a), by code (the report's N2 was run; I did not re-run it).
- **F-3** `allowTextPage` has no caller anywhere (`pagepixels.mjs:361` is the only use), so N13 is certain, not a hypothesis (grep).
- **F-4** `pdfTitle`'s `XrefReader` detects a direct `/Encrypt` (`pdfstructure.mjs:4138`) where `PdfDoc.isEncrypted` does not (`:1021`): the two parsers in one file disagree on the same fact (code, and N9 ran).
- **F-5** The ledger's `ocr` pass (`#continueOcr`, `extraction/index.mjs:903`) re-parses the whole file with tier 1 each pass, by calling `pdfStructure` (`:2161`); each OCR page then re-opens the whole PDF again in ocr-worker (`pagepixels.mjs:345` `loadPdf`, per call) after reading the whole object from R2 (`member.mjs` `handleTranscribe`). Per OCR page the cost is the file, not the page (code).
- **F-6** The reader's code is bundled three times (plane, pdf-worker, ocr-worker via pdf-pixels); `bio-plane/test/system/fleetbundles.test.mjs` guards that each bundle matches source (grep).
- **F-7** The byte ceilings a PDF meets are nine, not five (table in §1.5).

**Corrections (§3).**
- **E4 (§3.1).** The reviewer is right: on the report's own figures the sum is **122 MB**, not 118. 118 is the ceiling (128 less 10), not the sum; the sum is over it by 4 and leaves 6 free, not 10. The figures: idle 50, held bytes 24, open document 24, range 24.
- **Reproductions (§3.2).** Twelve defects tried, in node, with the real reader: **all twelve CONFIRMED** (N3, N4, N5, N6, N7, N8, N9, N10, N11, N15, N17, N21). Three of the report's figures differ from what I measure (N11, N21, N15's writer half), stated in §3.2. The recipe file is in §3.3.

---

## 1. Architecture

### 1.1 The nine modules and what each does for a PDF

| Module | Files (`modules.json`) | What it does on a PDF path | Requirement ids it serves |
|---|---|---|---|
| **capture** (L3) | `bio-plane/src/capture/` (`index.mjs` 3,405 lines) | Takes the member's upload (`uploadCapture` `:682`), stores it in 8 MiB parts and whole, records the receipt, builds the provenance document. Routes `acquire` to acquisition (`ops.mjs:154`, `:215`). Holds the register. Reads no PDF byte. | R86, R92, R93, R103, R107 (upload); R73 (acquire forwarded); R63 (absent object) |
| **file-safety** (L3) | `bio-plane/src/file-safety/` (`index.mjs` 2,060) | Grades a PDF's threat (`#grade` `:686`), runs the structure check (`#structureCheck` `:1548`) and builds its safe view, all from `extractPdfStructure`'s `active` list (`formats.mjs:91`). A reader of PDFs that is not part of the reading. | R6, R14, R51 (20 MiB `GRADE_READ_MAX`, `:72`), R11 |
| **reading-pipeline** (L4) | `bio-plane/src/reading-pipeline/` (`index.mjs` 2,783) | The tier ladder: chooses whole or ranged, calls tier 1 (pdf-reader), tier 2 (pdf-worker), tier 3 (ocr-worker), composes the reading and its text units. Keeps the one open document between ticks (`:1907`). | R2, R3, R4, R5, R6, R12, R14, R15, R17, R24, R35, R36, R37, R38, R40, R41, R42 |
| **extraction** (L4) | `extractrun.mjs`, `extraction/` (`index.mjs` 2,709) | Stores the reading and its text index (`writeReading` `:1087`, `indexUnits` `:1315`), reads a held capture in ticks (`readHeld` `:759`), serves `op=pdfstructure` / `ocr=1` (`pdfStructure` `:2161`) and `op=pagetranscribe` (`pageTranscribe` `:2369`). `extractrun.mjs` (429 lines) is the EXTRACT role's vocabulary and is on no PDF path. | R1, R19, R20, R22, R31-R35, R71, R80-R83, R88-R91, R93, R96, R97 |
| **pdf-reader** (L1) | `bio-plane/src/pdfstructure.mjs` (4,598 lines) | The one PDF parser: objects, streams, page tree, links, tier-1 text, images, boxes, active content, title, ranges. Pure. | R1-R45 |
| **pdf-worker** (L1) | `pdf-worker/` (`src/index.mjs` 218; also holds pdf-pixels and image-codecs files) | The tier-2 member: pdf.js text over the whole file. Also the home of the pixel and codec files. | R1-R12, R35-R41 |
| **pdf-pixels** (L1) | `pdf-worker/src/{pagepixels,imagecrop,picturepixels,pagepixels-worker}.mjs` (907, 128, 517, 44) | One page of a scan (or a picture file) as upright PNG pixels, through pdf-reader's `openPdf`. | R13-R34, R39-R44 |
| **image-codecs** (L1) | `pdf-worker/src/{dctdecode,jpxdecode,jbig2decode,ccittdecode,pngdecode,mq}.mjs` (685, 1005, 1070, 243, 317, 109) | JPEG, JPEG 2000, JBIG2, CCITT, PNG decoders, pixel-exact against reference decoders. | R1-R11 |
| **ocr-worker** (L1) | `ocr-worker/` (`src/member.mjs` 306, `index.mjs` 73, `tessengine.mjs` 148; `tesslib.mjs` 899 is the vendored engine) | The tier-3 member: one page per call, pdf-pixels then tesseract-wasm, line regions with rectangles. | R1-R25 |

Not among the nine but on the paths: `control-plane/index.mjs` (the door: sizes, deferral, follow; R105, R117, R120, R123, R125), `plane/pending.mjs` (the owed-work ledger and its alarm; plane R75, R77, R91, R92), `acquisition/index.mjs` (the web fetch, the profile, the title), `formats.mjs` (the `pdf` entry, `:178-209`), `plane/transcribe.mjs` (the AI path's page renderer) and `screens-intake/capture.mjs` (the Add screen).

### 1.2 The stages every path shares

| Stage | Function (file:line) | Requirement | Note |
|---|---|---|---|
| S1 Bytes in the store | `uploadCapture` `capture/index.mjs:682`; `acquire` `acquisition/index.mjs:898` (`acquireRun` `:914`); `keepWhole` `:468`, `keepPast` `:437` | capture R86, R103; acquisition R10 | Parts of 8 MiB, then the whole put once; past `MULTIPART_KEEP_MAX` (32 MiB, `:368`) by the ledger's `keep` row |
| S2 Profile and title | `profileOf` `acquisition/index.mjs:1895` (format by `detectFormat`, `formats.mjs:115`, the `pdf` entry `:178`); `pdfTitle` `pdfstructure.mjs:4134` called at `acquisition/index.mjs:1545` | acquisition R17, R98; pdf-reader R40 | A single-part file up to `ODF_DIGEST_MAX` (8 MiB, `:134`) is read back whole to detect its format; a title is read by a second parser |
| S3 Is it read now or owed? | `tooBigToReadInline` `control-plane/index.mjs:733`, `readingWontFit` `:2667`, constants `:213-223` | control-plane R120, R123, R125 | A PDF over 2 MiB, or under 8 s left of the 25 s bound, is owed |
| S4 Read bytes in | `bytesOf` `reading-pipeline/index.mjs:2281` | reading-pipeline R2, R37 | Over `WHOLE_READ_MAX` (24 MiB, `:51`) is stated from its size, never loaded; the whole object, else parts within 20 MiB |
| S5 Tier 1 | whole: `entry.structure` `:2579` = `extractPdfStructure` `pdfstructure.mjs:4308` (R42 refusal `:4207-4275`); ranged: `openPdfRange` `:4499` / `readRange` `:4508`, called at `reading-pipeline/index.mjs:2532-2535` | pdf-reader R8, R11-R17, R41-R45; reading-pipeline R40 | The only difference: the ranged answer carries no `metadata`, `pageBoxes`, `images` or `notes` (the mechanism of N3) |
| S6 Tier 2 | `tier2Escalate` `reading-pipeline/index.mjs:138`; member `handleStructure` `pdf-worker/src/index.mjs` (`:167` tier 1, `:170` envelope, `:179` `tier2Text`) | reading-pipeline R3; pdf-worker R6-R10 | Asked only when `needsTier2` (`:117`): markers outnumber glyphs and are not all scan markers. Whole file each time |
| S7 Tier 3 | `tier3Extend` `reading-pipeline/index.mjs:540`, `askMemberPerPage` `:357` (24 calls, `:354`); member `transcribeOnePage` `ocr-worker/src/member.mjs:82`; pixels `renderPageToPixels` `pagepixels.mjs:345`, `decodeImage` `:435` | reading-pipeline R4-R9, R37; ocr-worker R6-R9, R24; pdf-pixels R13-R26 | One page per call; the member reads the whole object and opens the whole PDF for that page |
| S8 Tier 4 (AI) | `tier4Extend` `reading-pipeline/index.mjs:757`; `renderAsked` `plane/transcribe.mjs:64` | reading-pipeline R29, R31; extraction R71 | Only at a member's act, only `pagetranscribe` |
| S9 Compose | `readingFromWire` `:2029`, `containerExtentOf` `:2090`, `rangePieceAnswer` `:1548`, `textUnitsFor` `:905`, `readingProvenance` (`readingprov.mjs`) | reading-pipeline R11-R15, R17, R18, R35 | One site per branch |
| S10 Store | `writeReading` `extraction/index.mjs:1087`, `indexUnits` `:1315`, `pieceOf` `:456`; `capture_text_state` | extraction R19, R22, R90, R96, R97 | The first piece writes the reading; later pieces add units (`append`) |
| S11 Owed work | `readHeld` `:759`, `#continueText` `:868`, `#continueOcr` `:903`; ledger `plane/pending.mjs` `readNow` `:206`, `owner` `:207-210` | extraction R80-R82, R90; plane R75, R77 | A tick that answers `more` or `owed` is run again at once |

### 1.3 Path by path

Each table lists the steps in order. "Req" is the requirement the step serves.

**P1. Upload (`captureupload`).**

| Step | Function | Req |
|---|---|---|
| 1 The raw body is streamed to capture | `control-plane/index.mjs:3075` (arm `captureupload`) → `uploadCapture` `capture/index.mjs:682` | capture R86 |
| 2 Hash as it arrives, hold in 8 MiB parts (`flush`), keep head (R107), put whole past one part (`keepWhole` `acquisition:468`; past 32 MiB `keepPast`/`keepLater`) | `capture/index.mjs:700-790` | capture R86, R103; acquisition R10 |
| 3 Receipt (`via: upload`), document, `profileOf` (format from the first KiB) | `capture/index.mjs:790-` ; `acquisition/index.mjs:1895` | capture R86, R92; acquisition R17 |
| 4 Does the reading fit the request? | `readUploaded` `control-plane/index.mjs:2729` → `readingWontFit` `:2667` (PDF over 2 MiB ⇒ owed) | control-plane R100, R120, R123 |
| 5a Fits: whole read | `acquireReadingOp` `extraction/ops.mjs:119` → store route `extractread` `extraction/index.mjs:2677` → `Extraction.read` `:683` (**no cursor, no `owe`, no `ocrInvocations`**) → `read` `reading-pipeline:2255` → `readInner` `:2326` → `bytesOf` `:2281` → `entry.structure` `:2579` → `tier2Escalate` `:2592` → `tier3Extend` `:2610` (24 OCR calls) → `readText` → `readingFromWire` | extraction R1; reading-pipeline R2-R6, R24, R37 |
| 5b Does not fit: owed | `pendSha` `:2658` → store route `pendingadd` → ledger row `reading` (P5) | control-plane R123; plane R75, R77 |
| 6 Answer carries the document with `reading` and `text_units` (≤ 512 KiB, `ACQUIRE_TEXT_UNITS_BUDGET` `:33`) for the Add screen's press (P4) | `withReading` (`extraction/ops.mjs`) | reading-pipeline R15 |

Bytes already held (`existed: true`): `readHeld(sha)` first (`control-plane:2631`), then 5a/5b as for a new upload.

**P2. Web capture (`acquire`).**

| Step | Function | Req |
|---|---|---|
| 1 The door's `acquire` arm, bounded 25 s | `control-plane/index.mjs:2538-2600`, `ACQUIRE_BOUND_MS` `:210` | control-plane R105 |
| 2 Forward to the store | `captureOp` `plane/door.mjs:94` → `acquireOp` `capture/ops.mjs:154` → store route `acquire` → `capture.acquire` → `acquisition.acquire` `acquisition/index.mjs:898` | capture R73; acquisition R1-R23 |
| 3 Fetch, hash, store parts, whole, receipt | `acquireRun` `:914` | acquisition R10, R11 |
| 4 Title: `pdfTitle` (a second parser, `XrefReader` `pdfstructure.mjs:3785`) | `acquisition/index.mjs:1545` | acquisition R98; pdf-reader R40 |
| 5 Format: `profileOf` reads the whole object back up to 8 MiB (`ODF_DIGEST_MAX`) | `:1895-1915` | acquisition R17 |
| 6 Read now or owed | `readAcquired` hook `plane/door.mjs:98-104` → `deferReading` = `readingWontFit` (`control-plane:2667`); owed ⇒ `{reading_pending: true}` | control-plane R120 |
| 7 Fits: as P1 step 5a | `acquireReadingOp` | extraction R1, R87 |
| 8 Held already: `readHeldAfterAcquire` | `control-plane:2766` | control-plane R117 |

**P3. `promote` (the door's side).** The op files the document as an information bundle; it reads no PDF byte itself.

| Step | Function | Req |
|---|---|---|
| 1 The op arm lists the documents the promotion stores with no reading (`unreadDocuments(b)`) | `control-plane/index.mjs:841`, called `:3335` | control-plane R123 |
| 2 The promotion step projects the reading carried in `data/provenance.json` | `projectPromotion` `extraction/index.mjs:1048` → `writeReading` `:1087` (a reading re-submitted is not written over a re-read, `#heldByReextraction` `:1073`) | extraction R20 |
| 3 After the op: each unread document is followed, first `READING_FOLLOWED_MAX` (16) in the request, the rest owed | `followEntries` `control-plane:2678`, call `:3868` | control-plane R123, R125 |
| 4 A document whose reading fits: `readHeld` (P5's first tick); else `pendSha` | `:2631`, `:2658` | extraction R80, R90 |

**P4. The Add screen's press.** The member's click that files what P1 or P2 answered.

| Step | Function | Req |
|---|---|---|
| 1 `promoteDocument` composes `bundle.md`, `data/provenance.json` (the document with its reading and units, dropped as `readingDropped` past 1 MiB − 64 KiB or when a unit is cut), `data/dataset.json`, the parts, the register | `screens-intake/capture.mjs:137-196` (`PROV_EMBED_MAX` `:169`) | screens-intake R1, R21; promotion `INLINE_MAX` |
| 2 Sends `promote` | `cs.call("promote")` `:196`; called from the address tab `:701` and the file tab (`:901-919`) | |
| 3 Shows `reading_pending` when the door says the reading follows | `:202`, `:645` | control-plane R57 |
| Then P3. | | |

**P5. The ledger's reading ticks.** One heavy row a tick; a tick answering `more` or `owed` runs again at once.

| Step | Function | Req |
|---|---|---|
| 1 Row `(sha, reading)` runs | `owner.reading = readNow` `plane/pending.mjs:206-211`, `run` `:276`; run counted before it happens (`started_at`) | plane R75, R77, R91, R92 |
| 2 `readHeld` gates: home (`homeOf`, `#homeOfParts` `:991`), sight, stored document, part → whole (`#wholeOfPart` `:976`), `#nowDetected` `:961`, held reading, size `#sizeOf` `:921`, whole object held | `extraction/index.mjs:759-855` | extraction R80-R88 |
| 3 First tick: `this.read(..., {budget: CAPTURE_TEXT_CAPTURE_BOUND, pieces: {cursor: null}})` | `:831` | extraction R90; reading-pipeline R40 |
| 4 Ranged branch: `rangeCursorIn` `:1537` → open (`openPdfRange` `:2532`, `yieldNow` R45) → `range({from, count: 100, maxBytes: 1.3 MB})` `:2535` (`PDF_RANGE_PAGES` `:1262`, `PDF_RANGE_BYTES` `:1263`) → `tier2Escalate` `:2554` → `tier3Extend` `:2610` → `rangePieceAnswer` `:1548` (cursor = next page) | reading-pipeline R40, R41 |
| 5 The reading is that of the first range (`provenance.text_scope`), later pieces are units alone | `:2641-2650` | reading-pipeline R40 |
| 6 `writeReading` with `more` (`pieceOf` `:456`); `capture_text_state` row; the ledger is told `more: true` | `:839-855` | extraction R90, R91, R96 |
| 7 Tick n: `#moreOf` `:857` → `#continueText` `:868` → `read(cursor)`; `heldCursor` (`:2373`) reads from the open document (`HELD_OPEN`, `:1908`) with no store read, else `bytesOf` and `openPdfRange` again | reading-pipeline R40 (G68) |
| 8 `indexUnits(..., {append: true, more})` `:1315`; repeats until `more: false` | extraction R22, R90 |
| 9 OCR owed: `readHeld` answers `owed: true` (`:849`) only for a read that does not say `more` (a PDF of one range); the ledger's `settle` (`plane/pending.mjs:176`) then writes the `ocr` row. A multi-range PDF's ticks answer `more` or nothing (`#continueText` `:868-899`), so no `ocr` row follows from them; the door's `followEntries` (`control-plane:2686`) and the press (`:2578`) write it | plane R77; extraction R82, R90 |
| 10 Row `(sha, ocr)`: `owner.ocr = readNow` → `readHeld({kind: "ocr"})` → `#continueOcr` `:903` → **`this.pdfStructure({ocr: "1"})`** (P7's body) → `#writeReread` `:2313` | plane R77; extraction R82, R35 |

**P6. `op=pdfstructure` (no `ocr`).** A member's or a daemon's read.

| Step | Function | Req |
|---|---|---|
| 1 Door: `EXTRACTION_OPS`, `extractionOp` → `pdfStructureOp` | `plane/door.mjs:107`, `extraction/ops.mjs:58` | extraction R31 |
| 2 Store route `pdfstructure` → `Extraction.pdfStructure` | `extraction/index.mjs:2679`, `:2161` | R31 |
| 3 **`ev.get(sha)` loads the whole object; no size check** | `:2194-2197` | (N16) |
| 4 `pdfEntry.structure(bytes)` = `extractPdfStructure` (whole; R42 refusal applies) | `:2202` | pdf-reader R42 |
| 5 `tier2Escalate` | `:2209` | reading-pipeline R3 |
| 6 `membershipBeside` (R52), `readingProvenance`; nothing written | `:2302-2304` | extraction R52 |

**P7. `ocr=1`.** Two entries.

| Step | Function | Req |
|---|---|---|
| 1 Press from a member session, with an OCR member bound and a stored reading that names pages unread (`tier3_candidate`): the door writes an `ocr` row and answers `{ocr_pending}` at once | `control-plane/index.mjs:2578-2586` | control-plane R125 |
| 2 Any other `ocr=1` (no OCR member, not a session, a daemon): in the request, `pdfStructure` with the refusals first (C-51.1-C-51.5: `:2169-2185`) | `extraction/index.mjs:2161` | extraction R32 |
| 3 Body: P6 steps 3-5, then `tier3Extend` with `seed: tier3SeedFrom(stored, units)` (so repeated passes reach the tail) | `:2231` | extraction R35; reading-pipeline R4-R7 |
| 4 `readingFromWire`, `#writeReread` `:2313` (`textUnitsFor(..., {budget: Infinity})` then `writeReading`, no `more`, no state row) | `:2279` | extraction R34 |
| 5 The ledger `ocr` row runs steps 2-4 through `#continueOcr` (P5 step 10) | | |

**P8. `pagetranscribe`.**

| Step | Function | Req |
|---|---|---|
| 1 Door: `pageTranscribeOp` | `extraction/ops.mjs:79`; `plane/door.mjs:111` | extraction R71 |
| 2 Refusals before a byte is read (agent, `contribute`, `deployable`, reading held, kept-away) | `pageTranscribe` `extraction/index.mjs:2369-2400` | R71, R72 |
| 3 **`ev.get(sha)` loads the whole object**; `detectFormat`; `entry.structure(bytes)` whole | `:2402-2415` | R73 |
| 4 `tier2Escalate`; `tier3Extend` seeded | `:2422-2430` | R30, R35 |
| 5 `tier4Extend` → registered transcriber → `aiPath` `plane/transcribe.mjs` → **`ev.get(sha)` again, in the plane** → `renderAsked` `:64` (pdf-pixels `renderPageToPixels(decodeDct)` per page, up to `TRANSCRIBE_PAGES_MAX`) → `AGENT_WORKER` | reading-pipeline R29, R31; plane R36 |
| 6 `#writeReread`; the answer says `transcribe.done` or why not | `:2498-2520` | R71 |

### 1.4 Where two paths do the same work by different code

| # | The work | The copies | Consequence |
|---|---|---|---|
| D1 | **Reading a whole PDF into I2 text** | (a) `readInner` whole branch `reading-pipeline:2579`; (b) `Extraction.pdfStructure` `extraction:2202`, which is also `#continueOcr`'s body `:903`; (c) `pageTranscribe` `:2415`; (d) `pdf-worker` `handleStructure` `:167`; (e) `file-safety` `readActive` `formats.mjs:91`, called from `#grade` `index.mjs:725` and `#structureCheck` `:1565`; (f) ranged: `readInner` `:2521-2575` only | Each opens the whole file. Only (f) is bounded by pages. A fix to one (the R42 refusal, a bound, a marker) is not a fix to the others; this is the PATH class of the report (§1.1) |
| D2 | **What the first piece carries** | whole: `entry.structure` answer (`title`, `pageBoxes`, `images`, `notes`); ranged: `readRange` answer `:4508` (`text` only) | N3: every stored PDF reading is the ranged one |
| D3 | **Owing the OCR pages a cap left** | `owe` hook (`reading-pipeline:2646`, `:2707`; passed only by tests) and `owed: true` / `tier3_candidate` (`extraction:849`, read by `settle` `plane/pending.mjs:168-177` and `followEntries` `control-plane:2686`) | Two mechanisms; production uses the second, which sees the first range alone (F-2, N2) |
| D4 | **The OCR continuation** | in a ranged tick `tier3Extend` runs in `readInner` (`:2610`, 24 calls per tick, no seed); in the ledger's `ocr` row `tier3Extend` runs inside `pdfStructure` (`extraction:2224`, seeded, whole file) | Two OCR drivers over the same pages, with different budgets and different state |
| D5 | **Parsing the xref / trailer / Info** | `PdfDoc` positionless scan (`scanTopLevel` `:707`, `infoDict` `:1049`, `isEncrypted` `:1021`) and `XrefReader` (`:3785`, `sections` `:3805`, `trailerValue` `:4086`) used for `pdfTitle` only | They pick the revision, the catalog and the Info differently and disagree on a direct `/Encrypt` (F-4). `XrefReader` already follows `/Prev`, `/XRefStm` and object streams (`packed` `:4000`): the B1 fix has a base |
| D6 | **Inflating** | native `DecompressionStream` (`inflate` `:162`, uncapped), the hand-written checked inflater (`inflateSync` `:3628` / `inflateChecked` `:3741`, capped at `INNER_DECODE_MAX` 128 MiB `:495`), `XrefReader.streamData` (`STREAM_MAX` 8 MiB `:3757`) | Three caps for one operation (N4); an object stream between 8 and 128 MiB is read by `PdfDoc` and refused by the title reader |
| D7 | **Reading a page's content stream** | `pageContent` `:1924`, `decodeContentStreams` `:2945`, pdf-pixels `pageContentText` `pagepixels.mjs:185` (a third copy, for `maskedContent`) | Three decoders of `/Contents`; unequal on `content_stream_undecodable` handling |
| D8 | **Inherited page attributes and the page box** | `inheritedAttr` `pdfstructure:3122`, `pageBox` `:3143`, `pdfPageBox` `:3282` and pdf-pixels `inheritedAttr` `pagepixels:166`, `pageRotate` `:177` | Copies of the same walk up `/Parent` |
| D9 | **Opening the PDF for one OCR page** | `renderPageToPixels` → `loadPdf` `pagepixels.mjs:131` per call; the member also `get`s the whole object per call (`member.mjs` `handleTranscribe`) | The cost of an OCR page is the file's size (F-5) |
| D10 | **Where a PDF's pages are rendered** | in ocr-worker (tier 3) and in the plane's own isolate for the AI path (`plane/transcribe.mjs:64`, `renderAsked`), where the whole PDF is loaded into the plane (P8 step 5) | The AI path puts the file into the plane's 128 MB beside everything else; no bound is stated for it |
| D11 | **The `pdf` entry's `text` slot** | `formats.mjs:205` `text: null`; `structure` is the only entry | A deliberate "do not fork" rule; the cost is that a range has no entry slot and is reached by import (`reading-pipeline:2532`) |

### 1.5 The ceilings a PDF meets (the report's P9, completed)

| Bound | Value | Where | Requirement |
|---|---|---|---|
| Inline PDF, in a request | 2 MiB | `control-plane/index.mjs:213` | control-plane R120 |
| Inline text / office | 3 MiB | `:219` | R125 |
| Parts assembled for a reading | 20 MiB | `control-plane:220`; `reading-pipeline:47` `MULTIPART_READ_MAX` | R123; reading-pipeline R37 |
| Tier 1 whole-read refusal (R42) | need 100 MB (about 3,500 dense pages at 24 MiB) | `pdfstructure.mjs:4207-4260` | pdf-reader R42 |
| Safe view / grade read | 20 MiB | `file-safety/index.mjs:72` | file-safety R51 |
| Reading ceiling (loaded) | 24 MiB | `reading-pipeline:51`; `control-plane:223` | reading-pipeline R37 |
| Whole kept by the module | 32 MiB | `acquisition/index.mjs:368` | capture R103 |
| Tier 2 | 64 MiB (default) | `pdf-worker/src/index.mjs:77` | pdf-worker R8 |
| Capture | 256 MiB | `acquisition` R10 | capture R86 |
| Format detection read-back | 8 MiB | `acquisition/index.mjs:134` | acquisition R17 |
| An object stream inflated | 128 MiB (`PdfDoc`) and 8 MiB (`XrefReader`) | `pdfstructure.mjs:495`, `:3757` | none |

---

## 4. What this hands BOB

1. Treat F-1 (pdf-worker's double parse), F-2 (the OCR remainder of a multi-range PDF is owed by nobody) and F-3 (the dead option) as causes of fix round 8 beside N1-N24: F-2 is N2's cause; F-1 is E3's.
2. Replace the E4 row's 118 by the measured form (§3.1) and keep I4 as a measured peak against 128 minus the held bytes.
3. Place the three readers of §3.4 item 7 in the envelope: file-safety's grade (bounded at 20 MiB, reads the whole), acquisition's title, the AI path's render in the plane.
4. Use the recipe file as the "see it red" step of each job N3-N11, N15, N17, N21; each job turns its line GREEN.
