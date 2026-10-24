# PDF architecture, state of the code and corrections (K4798; completes `pdf-envelope-T51.md`)

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

## 2. State of the code

One table per module. **State** is one of: **mature** (carries its load, tested at its interface, no open defect found), **fragile** (works on the files tested, has a known or found defect, or a bound that is unstated), **duplicated** (the same work is done elsewhere by other code, §1.4), **legacy** (kept for an older shape; superseded or no longer reached), **untested** (no test found). A row may carry two. **Evidence** names the test file that covers the part, with its test count where I counted (`grep -c 'test('`), or says **none** (I grepped the module's tests and the neighbours for the part's name or the case) or **not opened** (the test exists by its name but I did not read it). Tests I could not run in this sandbox: the ones that fetch the govinfo volumes (`BUDGET-2024-APP`, 1,354 pages) need the network; the report's N2 and N1 recipes need a scripted OCR member and are not among the defects I was asked to re-run.

### 2.1 pdf-reader (`bio-plane/src/pdfstructure.mjs`, 4,598 lines, R1-R45)

| Part | File:line | State | Evidence |
|---|---|---|---|
| Object index: `scanTopLevel` (a byte scan for `N G obj`, sliced for R45), `ObjectTable` (typed rows, bounded caches) | `:707-738`, `:530-660`, caches `:493-498` | mature | `smallobjects.test.mjs` (3, 135k objects), `memory.test.mjs` (10, children at the object's heap), `pdfdoc.test.mjs` (23), `opened-range.test.mjs` (8) |
| Revision and catalog semantics: a later definition wins by file position (`put` `:573`); the first object stream defines an object (`loadObjectStreams` `:933`); the first `/Type /Catalog` is the root (`:970`); a page must say `/Type /Page` (`:979`); an object found inside any stream's bytes counts | `:573`, `:900-960`, `:963-1010` | **fragile** (N5, N6, N7, N8) | `structure.test.mjs` (13) and `pdfdoc.test.mjs` pin the lenient scan and the by-number fallback; **none** for a newer object stream, two catalogs, a fake `obj` in a stream, an untyped leaf. All four RED in §3.3 |
| Encryption: `isEncrypted` finds a `/Filter /Standard` with a numeric `/R` among objects; no decryption | `:1021-1034` | **fragile** (N9; no decrypt, so N1/N24) | `active.test.mjs:160` (indirect handler), `anchors`, `boxes`; **none** for a direct `/Encrypt`; RED. `pdfTitle` does see a direct one (`:4138`): the two disagree (F-4) |
| Stream decoding: `streamRawBytes` `:762`, `streamDecoded` `:796`, `inflate` (native, no cap) `:162`, `inflateWithTrailing` `:193`, checked inflater `:3628`/`:3741` above 128 KiB | `:162-235`, `:796-835`, `:3628-3752` | **fragile** (N4), **duplicated** (D6) | `ascii-filters.test.mjs` (6), `memory.test.mjs` with the real volumes; **none** for a bomb: RED |
| Filter set: Flate, ASCII85, ASCIIHex, PNG predictors; LZW and RunLength undecodable; TIFF predictor 2 passed through (`:238`) | `:62-139`, `:237-286` | mature as far as it goes; the narrow set is **legacy** by design (the test `ascii-filters.test.mjs:77-92` pins "undecodable", R22) | `ascii-filters.test.mjs` |
| Tokenizer and page text walk (`tokenizeContent`, `extractPageText`: text matrix, word gaps, TJ, forms to depth 8) | `:1457-1515`, `:2088-2677` | mature on Latin text with a ToUnicode; **fragile** at size (N11: the whole page is a string and a token array) | `text.test.mjs` (14), `textshown`, `d608-form-text` (not opened); N11 RED |
| Fonts and CMaps: `loadFont`, `parseToUnicodeCMap`, `parseBfrange`; only `/ToUnicode` decodes | `:1667-1760` | **fragile** (N10, N17: no `/Encoding`, mixed codespaces misread, unbounded `bfrange`, sign flip) | `text.test.mjs` (Type0 with and without a map `:109-125`); **none** for WinAnsi/MacRoman/Differences without ToUnicode, mixed codespace, a large range; N10 and N17 RED |
| Type3 widths and glyph space | `:1776-1815` | untested outside one file | `pdfstructure.test.mjs` only (12 tests; the one hit for `Type3`) |
| Images, boxes, active content, metadata: `pdfPageImages` `:2978`, `extractImages` `:3067`, `markImageContent` `:3173`, `markImagesUnread` `:3237`, `extractPageBoxes` `:3296`, `extractActive` `:3340`, `extractMetadata` `:3533` | as listed | mature | `images.test.mjs` (8), `boxes.test.mjs` (5), `active.test.mjs` (9), `metadata.test.mjs` (8) |
| Links and anchors | `:4339-4420`, helpers `:1124-1440` | mature | `anchors.test.mjs` (5) |
| Whole-read refusal (R42): the need-in-MB model, a sampled text share and character density | `:4190-4275`, `:4320-4336` | mature as a model; **fragile** as a bound (tuned to three volumes; applies to the whole path only) | `refusal.test.mjs` (7), `density.test.mjs` (3) |
| Ranges: `extractPdfRange` `:4468`, `openPdfRange` `:4499` (`yieldNow`), `readRange` `:4508` | `:4440-4560` | **fragile** (answers text only: N3; no yield inside the range: G82/G86; bytes-per-page average: N11) | `range.test.mjs` (4), `opened-range.test.mjs` (8); the 1,354-page volume needs the network |
| Title: `pdfTitle` over `XrefReader` (follows `/Prev`, `/XRefStm`, object streams), XMP | `:4134-4160`, `:3785-4090` | mature; **duplicated** parser (D5) | `title.test.mjs` (15) |
| Inline images: bytes read as operators by the text walk | `:1458-1463`, `:2244` | **fragile** (report A §3) | **none** (grep `inline` in `text.test.mjs`: no case with `(Z) Tj` inside `BI..EI`) |

### 2.2 reading-pipeline (`bio-plane/src/reading-pipeline/`, `index.mjs` 2,783 lines, R1-R44)

About 600 lines of `index.mjs` are the HTML furniture and text-window code (`:987-1260`, `:1630-1895`): not PDF, not covered here.

| Part | File:line | State | Evidence |
|---|---|---|---|
| `bytesOf`: whole object, else parts within 20 MiB; over 24 MiB stated from the size | `:2281-2319`, `:47`, `:51` | mature | `r37.test.mjs`, `read.test.mjs` |
| Whole-read branch (`entry.structure` → tier 2 → tier 3 → compose) | `:2576-2607` | mature | `read.test.mjs`, `convert-*.test.mjs`, `memory.test.mjs` (the three volumes at idle + 64 MB), `tier2-wire.test.mjs` |
| Ranged branch: `rangeCursorIn` `:1537`, open and `range` `:2521-2575`, `rangePieceAnswer` `:1548`, `PDF_RANGE_PAGES` / `PDF_RANGE_BYTES` `:1262-1263` | | **fragile** (N3 the reading is the first range's; N15 a page over 128 Ki carried whole; constants tuned to one volume, report P3) | `pdf-ranges.test.mjs`, `g56-range.test.mjs`, `r7-tick-work.test.mjs`; `pdf-pieces.test.mjs` (the real volume, network); **none** for pieces with `PDF_WORKER` or `OCR_WORKER` bound (grep: neither is set in those files) |
| The one open document: `openedPdf` and `HELD_OPEN` | `:1907-1908`, `:2373-2377`, `:2641`, `:2536` | **fragile**: module state in an isolate (restart loses it; two PDFs swap it, N19) | `r7-pdf-tick.test.mjs:37-81` (open once, one at a time, cursor refusals); **none** for a restart between ticks (I8) and for the cost of two PDFs alternating |
| `tier2Escalate` and `needsTier2` | `:138-165`, `:117` | mature as a merge; **fragile** as a cost (the member reads the whole file for any range; F-1) | `tier2-wire.test.mjs`, `convert-tiers.test.mjs`; **none** with a range |
| `tier3Extend`, `askMemberPerPage`, `mergeTier3Text`, `tier3SeedFrom` | `:540-698`, `:357-403`, `:255-331`, `:436-479` | mature as a merge (D-614 refusals, folio append, seeds); **fragile** at the budget (24 calls; the remainder owed only by a hook no production caller passes: F-2, N2) | `r37.test.mjs` (the hook, by hand), `convert-ocr.test.mjs`, `d606-perpage-ocr.test.mjs`; **none** for a later piece or the upload path |
| Tier 4 (`tier4Extend`, `tier4Pages`) | `:757-852`, `:708` | mature | `transcribe.test.mjs` |
| `readingFromWire`, `containerExtentOf`, `pageBoxesFrom`, `textCountsOf` | `:2029`, `:2090`, `:1997`, `:1982` | mature | `convert-extent.test.mjs`, `words.test.mjs` |
| Compose of the reading in a ranged first piece (title, boxes, images, glyph counts) | `:2548-2552`, `:2715-2718` | **fragile** (N3): `st.metadata`, `st.pageBoxes`, `st.images` are absent from a range answer | **none**; RED in §3.3 |
| Text units: `textUnitsFor` (whole) and `listPiece` + `rangePieceAnswer` (pieces) | `:905`, `:1512`, `:1548` | **duplicated** (two budget walks); a page over 128 Ki differs between them (N15) | `text-units.test.mjs`, `pieces.test.mjs`; N15 RED |
| The `owe` hook | `:2646`, `:2707` | **legacy** in effect (no production caller; F-2) | `r37.test.mjs:139-170` calls it by hand |
| Status comment of a stale idle figure | `pdf-pieces.test.mjs:3` ("the plane idles at 73-103 MB") | stale since G39 (50 MB) | |

### 2.3 extraction (`bio-plane/src/extraction/`, `index.mjs` 2,709 lines; `extractrun.mjs` 429, not on a PDF path)

| Part | File:line | State | Evidence |
|---|---|---|---|
| `read` (hands the pipeline the store, the view, the calibration) | `:683-692` | mature; passes no `owe`, no `ocrInvocations` (F-2) | `read.test.mjs`, `readcontract.test.mjs`; **none** that the upload path owes OCR past 24 |
| `readHeld`: the gates, the first tick, the write | `:759-855` | mature (a long function, 100 lines) | `r80`, `r81`, `r82` tests (12 in r82), `round5.test.mjs`, `round6.test.mjs` |
| `#continueText` (the ticks after the first) | `:868-899` | **fragile**: a failure at tick 2 or later has no `more` and ends the read (N14: `:881`); no `owed` answer (F-2) | `round6.test.mjs` (a scripted provider), `round6-pieces.test.mjs:124` (a **stub** `structure` entry returning 300 prebuilt pages: the list cursor, not the range path or the real reader); **none** with the real reader and ranges, **none** for a store failure at tick 3 |
| `#continueOcr` → `pdfStructure` | `:903-919` | **duplicated** (D4); whole file each pass (F-5) | `r82.test.mjs` |
| `pdfStructure` (`op=pdfstructure`, `ocr=1`) | `:2161-2307` | **legacy** shape (predates ranges); loads the whole object, no size check (N16); the R42 refusal applies | `m/extraction/pdfstructure.test.mjs` (10), `declared-ops.test.mjs`; **none** for size |
| `pageTranscribe` | `:2369-2520` | **duplicated** composition with `pdfStructure` (`:2236-2278` and `:2455-2497` build the same reading); whole object | `pagetranscribe.test.mjs`, `t43`-`t50.test.mjs` |
| `writeReading`, `indexUnits`, `pieceOf`, R96/R97 (1 MiB row, the stated reading) | `:1087`, `:1315`, `:456`, `:1184` | mature | `g38`, `g40`, `g41`, `store.test.mjs` |
| `readingFor`, `unitsOf`, `#completenessOf`, `#unreadOf` | `:1436`, `:1721`, `:1520`, `:1540` | mature (G38 paging at 1 MiB) | `g38.test.mjs`, `round6.test.mjs`, `r77`, `r78` |
| `projectPromotion` (a promoted reading is written as carried) | `:1048-1071` | mature | `store.test.mjs`, `testimony*.test.mjs` |
| Migrations (N26 `.docx`, N439 `.pptx`, `migrateRepairs` `:1982`, `migratePartReadings` `:2026`) | `:1876-2127` | **legacy** (R-OLD; "retired once run") | `n26`, `n439`, `g33` tests |
| `PRIOR_READING_COPY_MAX_BYTES` | `:103` | **legacy** (exported; used by `g41.test.mjs` only: grep) | |

### 2.4 pdf-pixels (`pdf-worker/src/{pagepixels,imagecrop,picturepixels,pagepixels-worker}.mjs`)

| Part | File:line | State | Evidence |
|---|---|---|---|
| `renderPageToPixels`: open, analyse, one image, decode, rotate, encode | `pagepixels.mjs:345-433` | mature routes; **fragile**: opens the whole PDF per call (`loadPdf` `:131`); `allowTextPage` has no caller (F-3, N13) | `pagepixels.test.mjs`; `pagepixels-corpus.probe.mjs` is a probe, not a suite test |
| `analyzePage`: images painted, text shown, vector marks | `:289-342` | mature | `pagepixels.test.mjs` |
| `decodeImage`: DCT, CCITT, JBIG2, JPX, raw/Flate | `:435-640` | **fragile**: dimensions from the header reach allocation on the DCT-decoded, CCITT, JBIG2 (below 2^28) and raw routes before a bound (N12, code) | `pagepixels.test.mjs`, `jbig2.test.mjs`, `jpx.test.mjs`; **none** for a lying header (hypothesis, not re-run) |
| Rotation, PNG encode, `normalisePacked` | `:721-905` | mature | `pagepixels.test.mjs` |
| Third page-content reader `pageContentText`; copies of `inheritedAttr`, `pageRotate` | `:185`, `:166`, `:177` | **duplicated** (D7, D8) | |
| `cropImage` | `imagecrop.mjs:69` | mature; the requirement's note "no production caller" (`pdf-pixels.md` Suggestions) is **stale**: `content/index.mjs:40` imports it and calls it at `:1397` | `imagecrop.test.mjs`, `m/content/crop.test.mjs` |
| `renderPictureToPixels` and the photo preparation (R42-R44) | `picturepixels.mjs:438-516`, `PICTURE_FRAME_MAX` `:46`, `PICTURE_SOURCE_MAX` `:56` | mature (newest code, pixel-exact against Pillow) | `picture.test.mjs` (reading-pipeline), `ocr-worker.test.mjs` (not opened) |
| Encrypted PDF → `ENCRYPTED` (R14) | `:348` | by design (N24: an empty-password scan is never OCR'd) | `pagepixels.test.mjs` |

### 2.5 image-codecs (`pdf-worker/src/{dctdecode,jpxdecode,jbig2decode,ccittdecode,pngdecode,mq}.mjs`)

| Part | File:line | State | Evidence |
|---|---|---|---|
| DCT baseline/extended, strip-wise `decodeBaselineJpegRows` | `dctdecode.mjs` (685) | mature (bit-exact with libjpeg); the full-frame output is allocated from the header (`:418`, N12) | `codecs/dct.test.mjs`, `invariants.test.mjs`, `dct-memory.probe.mjs` (probe) |
| JPX | `jpxdecode.mjs` (1,005) | mature; the only codec with a memory bound before allocation (`MEMORY_BOUND` 61.3 MB `:85`, `:947`) | `codecs/jpx.test.mjs`, `jpx-memory.probe.mjs` (probe) |
| JBIG2 | `jbig2decode.mjs` (1,070) | mature on generic, refinement, symbol, text; only a `w*h > 2^28` check `:71` | `codecs/jbig2.test.mjs` |
| CCITT G3/G4 | `ccittdecode.mjs` (243) | mature on the fixtures; rows and columns from the header with no bound (`:119-122`, N12) | `codecs/ccitt.test.mjs` |
| PNG | `pngdecode.mjs` (317) | mature (PngSuite, frame bound `:198`) | `codecs/png.test.mjs` |
| MQ coder | `mq.mjs` (109) | mature | `codecs/mq.test.mjs` |
| One bound for all: a stated "declared size before decode" | none | **untested** by absence: three codecs carry 61.3 MB (JPX, PNG, the OCR frame), the others none | none |

### 2.6 ocr-worker (`ocr-worker/src/`)

| Part | File:line | State | Evidence |
|---|---|---|---|
| `transcribeOnePage`: the R7 refusal order, regions, legibility | `member.mjs:82-237` | mature | `ocr-worker.test.mjs` (engine throw `:430`, the frame refusal) |
| `handleTranscribe`: validate, `get` the whole object, chunk, answer | `member.mjs:251-298` | **fragile**: no guard around `transcribeRequest`/`render`, so a throw outside the engine is a 500 that the plane counts as transient and asks again (N23, code); the whole object is read per page (F-5) | **none** for a throw in `render` |
| `render` without `allowTextPage` | `member.mjs:101` (`render(bytes, page, {decodeDct: true})`) | **fragile** (N13): a folio page is routed to OCR and then refused; D-635's append is unreachable | `pagepixels.test.mjs:119` tests the option; **none** that the member passes it |
| `chooseChunk`, `MAX_FRAME_BYTES` 61.3 MB, `REFUSALS` | `contract.mjs` | mature; the frame bound refuses A4 at 400 dpi and Letter at 600 (report D2) | `ocr-worker.test.mjs` |
| The engine: `tessengine.mjs` over the vendored `tesslib.mjs` (899) and `assets/` | `tessengine.mjs`, `tesslib.mjs` | vendored (**legacy** by nature: tesseract-wasm 0.11.0, tessdata_fast) | `engine_loaded` check; measured by CPDF-15 |
| Photo preparation and legibility (R24, R25) | `member.mjs:96-150` | mature, newest | `ocr-worker.test.mjs`, `picture.test.mjs` |

### 2.7 pdf-worker (`pdf-worker/src/index.mjs`, 218 lines)

| Part | File:line | State | Evidence |
|---|---|---|---|
| `handleStructure` | `:139-188` | **fragile** (F-1): whole `extractPdfStructure` at `:167`, then the envelope check at `:170`, then pdf.js on the whole file; no range; called per escalating tick | `structure.test.mjs` (R8 envelope, `:207-211`); `bio-plane/test/system/pdf-worker-binding.test.mjs`; `tier2-wire.test.mjs` |
| `tier2Text` (pdf.js, `unpdf` 1.8.0) | `:119-137` | **legacy** dependency, pinned; a page with empty text is marked `no_text_layer` (also a vector-only page) | `structure.test.mjs` |
| Envelope `DEFAULT_MAX_PDF_BYTES` 64 MiB | `:77` | measured (G34) at two corners; unreachable above about 75 MiB (tier 1 refuses first) | `envelope-memory.probe.mjs` (probe); `structure.test.mjs` |
| The namespace set (copy of the plane's) | `:102` | **duplicated** (also in ocr-worker `contract.mjs`) | `structure.test.mjs` reads the plane's set and requires equality |
| `Math.sumPrecise` polyfill | `:46-50` | **legacy** (node only) | |

### 2.8 file-safety (`bio-plane/src/file-safety/`, `index.mjs` 2,060 lines)

| Part | File:line | State | Evidence |
|---|---|---|---|
| Format by bytes: `formatOf` (`%PDF-` in the first 1024) | `formats.mjs:62-79` | mature; consistent with the other four readers of that window | `rows.test.mjs`, `intake.test.mjs` (not opened) |
| `readActive`: a PDF is a full `extractPdfStructure` | `formats.mjs:88-104` | **duplicated** whole read (D1e); N4 reaches it (a bomb in a 20 MiB PDF on the grade path) | `grade.test.mjs`, `deeper.test.mjs`; **none** with a large or hostile PDF |
| `#grade`, `#structureCheck`, `threatOf` | `index.mjs:686-760`, `:1548-1573` | mature | `grade.test.mjs`, `deeper.test.mjs`, `open.test.mjs` |
| `#look` / `#lookAt` / `#bytes`: a file above `GRADE_READ_MAX` is never loaded (20 MiB, graded high `unread`) | `:370-428`, `:72` | mature; the 20 vs 24 MiB disagreement (§1.5) | `fail-closed.test.mjs` (R51), `g44-large.test.mjs` (sheets) |
| Safe view of a PDF (a page-image PDF made by `FILE_SCANNER`) | `safeView` `:898-957`, `#render` `:958` | mature as a delegate; not code in this module | `view.test.mjs` |
| Queues, notes, holds, tools | `:234-680`, `:1264-1500` | not PDF-specific | many tests |

### 2.9 capture (`bio-plane/src/capture/`, `index.mjs` 3,405 lines)

| Part | File:line | State | Evidence |
|---|---|---|---|
| `uploadCapture`: stream, hash, 8 MiB parts, keep whole, receipt, document | `index.mjs:682-870` | mature (memory held to 32 MiB of part buffers while the file stays under `MULTIPART_KEEP_MAX`) | `upload.test.mjs`, `r103-t51.test.mjs`, `r7-upload-t51.test.mjs`, `r7-upload-plane.test.mjs` (plane), `g41b-t51.test.mjs` (profile from the head) |
| Forwarding `acquire` (timings, trace, the reading step, G27 retry) | `ops.mjs:154-248` | mature | `g27-t51.test.mjs`, `timings.test.mjs`, `trace.test.mjs`, `relays.test.mjs` |
| Reading a PDF | none | capture reads no PDF byte; it only hands the document to extraction | |
| Held captures, set-aside, seen-in, captured-for | `index.mjs` (the rest) | not PDF-specific | `held.test.mjs` and others |
| Ceiling disagreement: 256 MiB captured, 24 MiB read | `acquisition` R10 vs reading-pipeline `:51` | a stated gap, not a defect | |

---

## 3. Corrections

### 3.1 The memory arithmetic of the report's E4 row

**The row** (`pdf-envelope-T51.md` §2.2, E4): "plane idle (measured) + the held bytes (≤ A1) + the open document (≤ 24 MB of tables and caches, R44 bounded) + one range's working set (≤ 24 MB) **≤ 118 MB**, so 10 MB stay free." Proven "in a child capped at 128 less nothing (the bytes inside)".

**The figures the report itself gives.**

| Term | Figure | Where the report gives it |
|---|---|---|
| Plane idle | about 50 MB | §2.1 "the plane idles at about 50 MB since G39"; K4616: 86 to 50 MB, measured in raw workerd by bisecting the old-space cap |
| Held bytes | ≤ A1 = 24 MiB | E4 itself and A1 |
| Open document | ≤ 24 MB | E4 |
| One range's working set | ≤ 24 MB | E4 |
| The object | 128 MB | §2.1 |

**The sum.** 50 + 24 + 24 + 24 = **122 MB**. The reviewer's 122 is the sum of the report's four terms. The 118 is not a sum of them: it is the ceiling the row sets (128 less 10), and the four figures do not meet it. The row's claim "so 10 MB stay free" is wrong on its own figures: 128 − 122 = **6 MB** free, and the inequality "≤ 118" fails by **4 MB**.

**Which unit.** The repository measures the heap in MiB: the old-space cap is `--max-old-space-size`, the harness sets it with `capFor(heldMiB) = floor(OBJECT_MB − heldMiB)` and `OBJECT_MB = 128` (`bio-plane/test/m/plane/shape/harness.mjs:42-44`), and K4616's 50 is a cap bisected in the same flag. With all four terms in MiB the sum is 122 MiB of 128. If one reads the held bytes as 24 MiB = 25.17 MB beside 50, 24 and 24 taken as decimal MB, the sum is 123.2 MB, against 134.2 MB (128 MiB) free 11.0 MB, but that mixes units and is not the reading the harness uses. In the harness's own terms the budget is: the bytes are taken out of the cap (128 − 24 = 104), and idle + open document + range must fit in 104, which they do with 6 to spare (50 + 24 + 24 = 98).

**What would make 118 true.** Either the idle is 46 (not 50), or the open document and the range together are 44 (not 48), or the held bytes are 20. As written, to keep a 10 MB reserve, one term must give up 4 MB.

**Two further points the arithmetic hides.**
1. The last two terms are allowances, not measurements. pdf-reader R43 says a 100-page range "completes in a V8 old space of 25 MB beside its bytes", and that call opens the document itself, so the measured open document **plus** range is about 25 MB, not 48. On the measured figure the budget is 50 + 24 + 25 = 99 MB, which leaves 29 free. The 24 + 24 is a double count that happens to protect the budget; it is not a bound anything enforces.
2. "One range's working set ≤ 24 MB" is not a bound at all while a page is held whole (N11). On this machine a dense decoded page of 3 MB (35-byte operators, 436,904 characters) aborts node with "heap out of memory" at `--max-old-space-size=128`, and 1 and 2 MB complete (§3.2). That is node's heap, not workerd's, and a dense page is the worst case for the token array; but it shows the range term depends on the page, not on the pages-per-range the budget assumes.

**Verdict.** The reviewer is right: the report's E4 sum is 122, not 118, and 6 MB are free, not 10. The corpus's memory invariant (I4) should be stated as a measured peak against 128 − held bytes, as the harness does, and the 118 should be dropped or recomputed from a measured idle, open document and range.

### 3.2 The "ran" defects: a recipe for each, and what I confirmed

All twelve were tried in node v26.10.0 on this machine (4 cores, 16 GB), with the real reader (`bio-plane/src/pdfstructure.mjs`) and the repository's own PDF builders (`test/m/pdf-reader/pdf.mjs`, `indexed.mjs`) or the reading-pipeline fixture (`test/m/reading-pipeline/fixture.mjs`). The recipe file is §3.3; run `cd bio-plane && node red.mjs N5`. Each prints `RED` when the defect shows and `GREEN` when not. Times are wall time on one run; the memory figure is the process's RSS growth (the node process is not workerd, so it shows the work, not the isolate's headroom).

| # | The report's claim | Input and call (all in `red.mjs`) | Observed | Status |
|---|---|---|---|---|
| N3 | Every stored PDF reading loses `title`, `page_boxes`, `container_extent.images`, `text_glyphs`, `words_total` against a whole read | The 33-page `test/fixtures/legistar-agenda-1425405.pdf` stored in the fixture bucket; `read(document, {unitsBudget: Infinity})` against `read(document, {unitsBudget: 512 KiB, cursor: null, maxUnits: 4096})` (what `readHeld` asks, `extraction/index.mjs:831`) | The one-piece read (`more: false`, so the whole file was in its range) has `title` null (whole: "Agenda"), `text_glyphs` null (whole: 51,105), `words_total` null (whole: 8,994), `page_boxes` null, `container_extent.images` null with `images_why` set (whole: one image on page 0). Fields that differ: `words_total, title, page_boxes.boxes, page_boxes.of_page, container_extent.images, provenance.text_from, text_glyphs`. Mechanism: `readRange` returns `text` only (`pdfstructure.mjs:4508-4560`) and the pipeline reads `st.metadata`, `st.pageBoxes`, `st.images` off it (`reading-pipeline/index.mjs:2548-2552`, the ranged branch) | **CONFIRMED** |
| N4 | A Flate stream has no decompressed-size cap: 204 KB became 200 MB, +894 MB RSS | A 3-page PDF whose page 2 content is a Flate stream of 200 MiB of spaces (201 KB file); `extractPdfRange(bytes, {from: 0, count: 3})` | `ok: true`, no marker, page 2 empty, RSS +897 MB (first run +894 MB), 7.4 s. The cause: a stream under 128 KiB compressed goes straight to the native uncapped `inflate` (`:162`, `:796-835`); `INNER_DECODE_MAX` bounds only the checked path | **CONFIRMED** (report: 11 s; mine 7.4 s) |
| N5 | An incremental update that writes into an object stream reads the stale revision | A PDF with objects 1, 2, 100 in object stream 900 and a classic xref; a second revision (`/Prev`) with the page object 100 in a new object stream 901 and a new content stream 102 saying NEWTEXT; `extractPdfStructure` | Reads `["OLDTEXT"]`. The control, the same update with the page at top level, reads `NEWTEXT`. The cause: `loadObjectStreams` skips an object number already defined (`:933`) and visits object streams in file order, so the first stream wins | **CONFIRMED** (one ordering tried; the report says two) |
| N6 | The catalog is the first one in the file, not the trailer's `/Root` | Catalogs 1 and 3 (pages 2 and 4), trailer `/Root 3 0 R`, tree 4 has two pages | Reads one page, `FIRST`, not `SECOND-A, SECOND-B` (`:970` takes `nums(1, "Catalog")[0]`) | **CONFIRMED** |
| N7 | A fake `N G obj` inside a later stream overrides the real object silently | Real object 101 (the content), then an unfiltered XMP stream whose bytes contain `101 0 obj << /Length 0 >> stream endstream endobj` | Page text `[""]`, no marker: the fake definition replaced the real one (`scanTopLevel` finds a later `obj` anywhere, `:707-738`; `put` `:573` lets the later win) | **CONFIRMED** |
| N8 | A page without `/Type` is dropped | Kids 100, 102, 104; 102 has no `/Type` | Reads two pages, `ALPHA`, `CHARLIE` (`:979` requires `Type == Page`; no note) | **CONFIRMED** |
| N9 | A direct `/Encrypt` dictionary is not detected | A trailer with `/Encrypt << /Filter /Standard /V 1 /R 2 ... >>` inline; control: the same dictionary as an indirect object | Direct: no `encrypted` marker, ciphertext read as text; indirect: marker present. `isEncrypted` (`:1021`) looks at objects, not the trailer; `pdfTitle` does read the trailer (`:4138`) | **CONFIRMED** |
| N10 | `bfrange` expanded with no cap (16.7 M codes, 15 s); mixed codespaces misread; 4-byte codes at or above 0x80000000 sign-flip | Three Type0 fonts with ToUnicode maps: `<00000000> <00FFFFFF> <0041>` over a 4-byte codespace; codespaces `<00>-<7F>` and `<8140>-<9FFC>` with `<41>` and `<8140>` mapped, shown `<41814041>`; `<80000001>` mapped, shown `<80000001>` | (a) 16.0 s and RSS +1.1 GB for one range; (b) reads `"XX"` with `unmapped_code:81, 40` (wanted `XYX`: the first codespace's width is applied to all, `:1668-1673`); (c) marker `unmapped_code:-7fffffff` | **CONFIRMED** (all three parts) |
| N11 | One 30 MB page takes 20 s and about 400 MB, with no yield inside a range | A 3-page PDF whose page 2 is a Flate stream of 35-byte text operators, 30 MB decoded; `extractPdfRange(bytes, {from: 1, count: 1})`; smaller sizes under a 128 MB heap | 30 MB: 4.4 M characters in 8.3 s, RSS peak +1.5 GB (report: 20 s, about 400 MB; the figures differ by machine and by what is counted). Under `node --max-old-space-size=128`: 1 MB (146 k characters) and 2 MB (291 k) complete; **3 MB aborts** with "heap out of memory"; 5 and 10 MB abort. No yield inside `readRange`'s page loop (`:4533-4549`) | **CONFIRMED** (the shape; figures differ) |
| N15 | A page over 128 Ki characters is carried whole in pieces (against R41) and cut by extraction's writer | A 3-page PDF, page 2 with 1,000 lines of 299 characters; `read` whole against `read` with `cursor: null`; then the writer by code | Whole read: units of 9, **131,072** (`truncated: true`), 11 characters. One-piece read: 9, **280,999** (no `truncated`), 11. The writer's cut is by code only: `indexUnits` slices to `CAPTURE_TEXT_UNIT_CAP` and sets `truncated` (`extraction/index.mjs:1354-1361`), so the stored text is cut; I did not run the writer | **CONFIRMED** for the pipeline half (ran); the writer half is by code |
| N17 | Tier 1 has no simple-font encodings: a WinAnsi/MacRoman/Differences font with no ToUnicode is undetermined | A Type1 Helvetica with `/Encoding /WinAnsiEncoding`, no `/ToUnicode`, showing "Hello World"; a second page with TrueType + MacRoman + Differences | Text `""`, marker `no_tounicode/Helvetica/11` (and `no_tounicode/Arial/11`). That tier 2 then reads the whole file on every escalating tick is by code (F-1), not run | **CONFIRMED** (tier 1; the tier-2 cost is code) |
| N21 | A damaged or truncated file reads the pages it can find and states nothing | A 30-page PDF cut at 70 %; `extractPdfStructure`, and `read` whole and in pieces | `ok: true`, `pages: 20`, `notes: []`; one marker, `content_stream_unresolvable` on the page cut inside its stream; nothing says 10 pages are missing. Through `read`: `page_count` 20, 19 units, no `failure` (`found: false` here only because the fixture has no content type reader). The report says 22 of 30 with no marker; the count depends on the file's shape (here the cut fell inside page 20's stream), the finding holds | **CONFIRMED** (counts differ) |

Not tried (not in the list I was given): N1, N2, N12, N13 (now certain by grep, F-3), N14, N16, N18-N20, N22-N24. N1, N2 and N14 are "ran" in the report and cited to the same lost scratch; their recipes are owed.

### 3.3 The recipe file

Save it as `red.mjs` anywhere and run it with the working directory `bio-plane` (it imports the repository by that path and writes nothing).

```js
// red.mjs - one reproduction per defect of pdf-envelope-T51.md section 1.3. Run with cwd = bio-plane:
//   cd /home/user/bio/bio-plane && node red.mjs N5        (N3 N4 N5 N6 N7 N8 N9 N10 N11 N15 N17 N21)
// Every recipe prints RED when the defect shows, GREEN when it does not. Reads the repository only; writes nothing.
import { readFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
const B = process.cwd();
const rd = await import(`${B}/src/pdfstructure.mjs`);
const { build, doc, FONT_OBJS, FONTS } = await import(`${B}/test/m/pdf-reader/pdf.mjs`);
const { indexed } = await import(`${B}/test/m/pdf-reader/indexed.mjs`);
const T = (s) => `BT /F1 12 Tf 40 700 Td (${s}) Tj ET`;
const PAGE = (parent, c) => `<< /Type /Page /Parent ${parent} 0 R /MediaBox [0 0 600 800] /Resources << ${FONTS} >> /Contents ${c} 0 R >>`;
const CAT = (p) => `<< /Type /Catalog /Pages ${p} 0 R >>`;
const texts = async (bytes) => (await rd.extractPdfStructure(bytes)).text.pages.map((p) => p.text);
const verdict = (red, line) => console.log(red ? "RED  " : "GREEN", line);
const which = process.argv[2];

// reading-pipeline world (N3, N15): a stored PDF read whole and read as `readHeld` reads it (cursor: null, pieces)
async function pipeline(bytes) {
  const { read } = await import(`${B}/src/reading-pipeline/index.mjs`);
  const { bucket, evidenceStore, hold, doc: pdoc } = await import(`${B}/test/m/reading-pipeline/fixture.mjs`);
  const b = bucket(), d = await hold(b, bytes), document = pdoc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" });
  const ask = (x) => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", ...x });
  return { whole: await ask({ unitsBudget: Infinity }), piece: await ask({ unitsBudget: 512 * 1024, cursor: null, maxUnits: 4096 }) };
}

const cases = {
  async N3() { // every stored PDF reading is the first range's: title, boxes, images, glyph counts are lost
    const { whole, piece } = await pipeline(new Uint8Array(readFileSync(`${B}/test/fixtures/legistar-agenda-1425405.pdf`)));
    const lost = ["title", "text_glyphs", "words_total"].filter((k) => whole.reading[k] != null && piece.reading[k] == null);
    verdict(lost.length > 0 || piece.reading.page_boxes == null, `one-piece read (more=${piece.more}) lost ${lost} ; page_boxes ${JSON.stringify(piece.reading.page_boxes)} ; images ${JSON.stringify(piece.reading.container_extent?.images)}`);
  },
  async N4() { // a Flate stream has no decompressed-size cap (needs ~1 GB of RAM)
    const data = new Uint8Array(deflateSync(Buffer.alloc(200 * 1048576, 0x20), { level: 9 }));
    const bytes = doc([{ content: T("ok1") }, { content: { dict: "/Filter /FlateDecode", data } }, { content: T("ok3") }]);
    const rss0 = process.memoryUsage().rss;
    const r = await rd.extractPdfRange(bytes, { from: 0, count: 3 });
    const mb = (process.memoryUsage().rss - rss0) / 1048576;
    verdict(r.ok && mb > 400, `${(bytes.length / 1024).toFixed(0)} KB file inflated 200 MB, ok=${r.ok}, RSS +${mb.toFixed(0)} MB, no marker ${JSON.stringify(r.text.undetermined)}`);
  },
  async N5() { // an incremental update that rewrites a page into a NEW object stream is ignored
    const o1 = { 1: CAT(2), 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", 100: PAGE(2, 101), ...FONT_OBJS, 101: { data: T("OLDTEXT") } };
    const r1 = indexed(o1, { xref: "table", packed: [1, 2, 100], objStmNum: 900 });
    const v2 = indexed({ 100: PAGE(2, 102), 102: { data: T("NEWTEXT") } }, { xref: "table", packed: [100], objStmNum: 901, prev: r1 });
    const got = await texts(v2);
    verdict(got[0] !== "NEWTEXT", `revision 2 in a new object stream reads ${JSON.stringify(got)} (want NEWTEXT)`);
  },
  async N6() { // the catalog is the first /Type /Catalog, not the trailer's /Root
    const o = { 1: CAT(2), 3: CAT(4), ...FONT_OBJS, 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", 4: "<< /Type /Pages /Kids [102 0 R 104 0 R] /Count 2 >>",
      100: PAGE(2, 101), 101: { data: T("FIRST") }, 102: PAGE(4, 103), 103: { data: T("SECOND-A") }, 104: PAGE(4, 105), 105: { data: T("SECOND-B") } };
    const got = await texts(build(o, { trailer: "trailer\n<< /Root 3 0 R >>\n" }));
    verdict(got.length !== 2, `trailer /Root 3 0 R reads ${JSON.stringify(got)} (want SECOND-A, SECOND-B)`);
  },
  async N7() { // a fake "N G obj" inside a later unfiltered stream overrides the real object
    const o = { 1: CAT(2), ...FONT_OBJS, 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", 100: PAGE(2, 101), 101: { data: T("REALTEXT") },
      200: { dict: "/Type /Metadata /Subtype /XML", data: "<x>\n101 0 obj\n<< /Length 0 >>\nstream\n\nendstream\nendobj\n</x>" } };
    const got = await texts(build(o));
    verdict(got[0] !== "REALTEXT", `real object 101 then a fake 101 inside an XMP stream reads ${JSON.stringify(got)} (want REALTEXT)`);
  },
  async N8() { // a page leaf with no /Type is dropped while its siblings are read
    const leaf = (c) => `<< /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << ${FONTS} >> /Contents ${c} 0 R >>`;
    const o = { 1: CAT(2), ...FONT_OBJS, 2: "<< /Type /Pages /Kids [100 0 R 102 0 R 104 0 R] /Count 3 >>",
      100: PAGE(2, 101), 101: { data: T("ALPHA") }, 102: leaf(103), 103: { data: T("BRAVO") }, 104: PAGE(2, 105), 105: { data: T("CHARLIE") } };
    const got = await texts(build(o));
    verdict(got.length !== 3, `three kids, the middle one untyped, read ${JSON.stringify(got)}`);
  },
  async N9() { // a DIRECT /Encrypt dictionary in the trailer is not detected (an indirect one is)
    const o = { 1: CAT(2), ...FONT_OBJS, 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", 100: PAGE(2, 101), 101: { data: "\x01\x02CIPHERTEXT" } };
    const E = "<< /Filter /Standard /V 1 /R 2 /O (aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa) /U (bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb) /P -4 >>";
    const direct = await rd.extractPdfStructure(build(o, { trailer: `trailer\n<< /Root 1 0 R /Encrypt ${E} >>\n` }));
    const indirect = await rd.extractPdfStructure(build({ ...o, 300: E }, { trailer: "trailer\n<< /Root 1 0 R /Encrypt 300 0 R >>\n" }));
    const mark = (r) => r.text.undetermined.some((u) => u.reason === "encrypted");
    verdict(!mark(direct) && mark(indirect), `encrypted marker: direct /Encrypt ${mark(direct)}, indirect (control) ${mark(indirect)}`);
  },
  async N10() { // bfrange has no cap; mixed codespaces are misread; 4-byte codes at or above 0x80000000 sign-flip
    const font = { 10: "<< /Type /Font /Subtype /Type0 /BaseFont /X /Encoding /Identity-H /DescendantFonts [13 0 R] /ToUnicode 11 0 R >>",
      13: "<< /Type /Font /Subtype /CIDFontType2 /BaseFont /X /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 1000 >>" };
    const run = async (cmap, content) => {
      const o = { 1: CAT(2), 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", ...font, 11: { data: `/CIDInit /ProcSet findresource begin 1 ${cmap} end` },
        100: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 10 0 R >> >> /Contents 101 0 R >>", 101: { data: `BT /F1 12 Tf 40 700 Td ${content} Tj ET` } };
      const t0 = performance.now(), r = await rd.extractPdfStructure(build(o));
      return { ms: Math.round(performance.now() - t0), text: r.text.pages[0].text, u: r.text.undetermined.map((x) => `${x.reason}:${x.codes}`) };
    };
    const big = await run("begincodespacerange <00000000> <FFFFFFFF> endcodespacerange 1 beginbfrange <00000000> <00FFFFFF> <0041> endbfrange", "<00000041>");
    const mixed = await run("1 begincodespacerange <00> <7F> endcodespacerange 1 begincodespacerange <8140> <9FFC> endcodespacerange 2 beginbfchar <41> <0058> <8140> <0059> endbfchar", "<41814041>");
    const hi = await run("1 begincodespacerange <00000000> <FFFFFFFF> endcodespacerange 1 beginbfchar <80000001> <0058> endbfchar", "<80000001>");
    verdict(big.ms > 5000 || mixed.text !== "XYX" || hi.u.some((x) => x.includes("-")),
      `(a) bfrange 00000000-00FFFFFF: ${big.ms} ms ; (b) mixed codespace reads ${JSON.stringify(mixed.text)} ${mixed.u} (want XYX) ; (c) code 0x80000001 -> ${hi.u}`);
  },
  async N11() { // one page's content is held whole: a dense 3 MB decoded page needs more than a 128 MB heap
    const MB = Number(process.argv[3] ?? 3);
    const unit = T("word") + "\n";
    const data = new Uint8Array(deflateSync(Buffer.from(unit.repeat(Math.floor(MB * 1048576 / unit.length)), "latin1")));
    const bytes = doc([{ content: T("light") }, { content: { dict: "/Filter /FlateDecode", data } }, { content: T("light3") }]);
    const t0 = performance.now(), r = await rd.extractPdfRange(bytes, { from: 1, count: 1 });
    verdict(true, `${MB} MB decoded page: ${r.text.pages[0].text.length} chars in ${Math.round(performance.now() - t0)} ms, RSS ${(process.memoryUsage().rss / 1048576).toFixed(0)} MB`);
    console.log("      run it again as `node --max-old-space-size=128 red.mjs N11 3`: V8 aborts with 'heap out of memory' (RED); 1 and 2 MB complete.");
  },
  async N15() { // a page over 128 Ki characters: cut and flagged in a whole read, carried whole in pieces
    const line = (i) => `BT /F1 12 Tf 40 ${700 - (i % 60) * 10} Td (${"alpha beta gamma delta ".repeat(12).slice(0, 299)}${String(i).padStart(4, "0")}) Tj ET\n`;
    let c = ""; for (let i = 0; i < 1000; i++) c += line(i);
    const { whole, piece } = await pipeline(doc([{ content: T("small one") }, { content: c }, { content: T("small three") }]));
    const len = (o) => o.text_units.map((u) => u.text.length);
    verdict(len(whole)[1] !== len(piece)[1], `whole read unit chars ${len(whole)} (truncated=${whole.text_units[1].truncated}) ; one-piece read ${len(piece)} (truncated=${piece.text_units[1].truncated})`);
  },
  async N17() { // simple fonts with /Encoding but no /ToUnicode are undetermined in tier 1
    const o = { 1: CAT(2), 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", 10: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
      100: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 10 0 R >> >> /Contents 101 0 R >>", 101: { data: T("Hello World") } };
    const r = await rd.extractPdfStructure(build(o));
    verdict(r.text.pages[0].text === "", `Helvetica /WinAnsiEncoding, no ToUnicode: text ${JSON.stringify(r.text.pages[0].text)} ; ${JSON.stringify(r.text.undetermined.map((u) => `${u.reason}/${u.count}`))}`);
  },
  async N21() { // a file cut at 70 % reads the pages it can find and states nothing about the rest
    const full = doc(Array.from({ length: 30 }, (_, i) => ({ content: T(`PAGE${String(i + 1).padStart(2, "0")}`) })));
    const cut = full.subarray(0, Math.floor(full.length * 0.7));
    const r = await rd.extractPdfStructure(cut);
    const named = r.text.undetermined.map((u) => u.reason);
    verdict(r.ok && r.pages < 30 && !r.notes.length, `ok=${r.ok}, pages=${r.pages} of 30, notes=${JSON.stringify(r.notes)}, markers=${JSON.stringify(named)} (the 10 missing pages are named nowhere)`);
  },
};
if (!cases[which]) { console.log("usage: node red.mjs", Object.keys(cases).join(" ")); process.exit(2); }
await cases[which]();
```

### 3.4 Other corrections to the report and the requirements, found while reading

1. **N13 is certain, not a hypothesis.** `allowTextPage` is read at `pdf-worker/src/pagepixels.mjs:361` and passed by no caller in `bio-plane/src`, `pdf-worker/src` or `ocr-worker/src` (grep); `member.mjs:101` passes `{decodeDct: true}` only. The option is tested alone (`pagepixels.test.mjs:119`).
2. **N2 (a) has a sharper mechanism than the report gives.** The `owe` hook is passed by no production code (F-2), and the other mechanism, `owed: true`, is answered only by a read that does not say `more`, so no tick of a multi-range PDF hands the ledger an `ocr` row (§1.3 P5 step 9). The report's N2 was run; this is the code reading of why.
3. **`pdf-pixels.md` Suggestions** says `cropImage` "has no production caller". `content/index.mjs:40` imports it and calls it at `:1397`. The sentence is stale.
4. **`PRIOR_READING_COPY_MAX_BYTES`** (`extraction/index.mjs:103`) is not unused: `g41.test.mjs:11,182` read it. It has no production reader.
5. **`pdf-pieces.test.mjs:3`** still says "the plane idles at 73-103 MB". Since G39 the idle is about 50 MB (K4616). The test's cap `128 − file bytes` is unchanged by it.
6. **The report's tier-2 finding (E3, "the whole file each tick") is right and understated.** pdf-worker runs the whole tier-1 reader first (`index.mjs:167`), and only then compares the size with its envelope (`:170`), so a file over the envelope is still parsed whole once, and one under it is parsed twice (tier 1, then pdf.js) per call (F-1).
7. **The report's list of readers (D1) lacks three.** file-safety (`formats.mjs:91`, twice per grade and structure check), acquisition's title (`pdfTitle`) and `plane/transcribe.mjs` (the AI path loads the whole PDF in the plane, `:64` and the `ev.get` in `aiPath`). None is in the report's corpus or its bounds. A bomb (N4) reaches file-safety's grade up to 20 MiB.
8. **The ceilings (P9)** are nine, with the two object-stream caps (8 and 128 MiB) in one file (§1.5).
9. **N19's correctness is tested** (`r7-pdf-tick.test.mjs:59-80`: one document open at a time, the first read again from the store); its cost, and a restart between ticks, are not.
10. **`round6-pieces.test.mjs:124` is not a range test.** Its "300-page dense PDF" is a stub `structure` entry returning prebuilt pages (the list cursor). At the extraction level no test reads a PDF in ticks with the real reader and the range path; the first test that does is at reading-pipeline (`pdf-ranges.test.mjs`, `pdf-pieces.test.mjs`).

---

## 4. What this hands BOB

1. Treat F-1 (pdf-worker's double parse), F-2 (the OCR remainder of a multi-range PDF is owed by nobody) and F-3 (the dead option) as causes of fix round 8 beside N1-N24: F-2 is N2's cause; F-1 is E3's.
2. Replace the E4 row's 118 by the measured form (§3.1) and keep I4 as a measured peak against 128 minus the held bytes.
3. Place the three readers of §3.4 item 7 in the envelope: file-safety's grade (bounded at 20 MiB, reads the whole), acquisition's title, the AI path's render in the plane.
4. Use the recipe file as the "see it red" step of each job N3-N11, N15, N17, N21; each job turns its line GREEN.
