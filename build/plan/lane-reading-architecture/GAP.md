# From today's reading to the confirmed architecture (READING-ARCHITECTURE, deliverable 6)

**Status** · Written by READING-ARCHITECTURE #2, 2026-10-23, after Bob's K4831 confirmed all ten answers of `FOR-BOB.md`: architecture D built in stages, with C as the fallback, plus the nine companion answers. The lane decides nothing. Each entry below is a plan entry for BOB to place in T51 (`build/plan/current.md`, "BOB's acts", the reading architecture). Its order, size, job split, model and START text are BOB's. Each held cause is mapped to an entry in §7. Inputs: `OPTIONS.md` (S1–S9, §3.4 option D, §5.2 the stages), `PLATFORM.md` (P-M ids), `CHALLENGES.md` (C1–C17, obligations Ob1–Ob17), `REQUIREMENTS.md` (RR-, CF-, GP- ids), fix round 8 (`build/plan/archive/fix-round-8-T51.md` §2 and §8, on `tranche/T51`), SHEET #1's defects S-1–S-41 (`envelope-sheets-T51.md` §3.3) and DOCS #1's X1–X36 (`envelope-docs-T51-s2.md` §2.2).

---

## 0. How to read it

**Entries.** Each entry is `GAP-<stage>.<n>`. It has:
- **Owner** (a `modules.json` id; *new* marks a module this plan adds) and **providers**;
- **Change**: what is built, rewritten or retired;
- **After**: the entries or measurements it waits on;
- **Test**: the failing-first test at the platform's shape (S9), which a job writes before the change;
- **Serves**: the obligations, classes, K4831 answers and requirements it meets.

Requirement wording is BOB's (P17). Where an entry changes what a module promises, the module's `build/requirements/<module>.md` changes with it in the same entry.

**Stages** (OPTIONS §5.2, K4831 (1)):
- **0:** live measurements.
- **1:** the shared shape, on today's carrier.
- **2:** the Workflows carrier, with the light kinds in Workers.
- **3:** the container readers, one kind at a time, each after parity and a live probe.

Stage 1 can start while Stage 0 runs. It needs only the measurements marked on its entries.

**One proposal for BOB that this gap rests on.** The alpha ships with today's limits, stated to members, and the standard is met by the beta (K4831 (3)). Stage 3 then replaces the JavaScript readers for the heavy kinds. Two consequences follow:
- **Within the alpha's limits:** Stage 1 makes the heavy-kind JavaScript readers correct, safe and honest (the shared contract, declared-size checks, the confirmed defects that lose or misstate content). It does not rewrite them to reach the standard's sizes, which would be work that Stage 3 throws away.
- **Light kinds** (text, CSV and TSV, HTML, JSON, XML) stay in Workers for good, so Stage 1 brings them fully to the standard.

**If the fallback C is taken** (P-M17 fails, §6), the heavy readers' rewrite to the standard's sizes becomes Stage 3's work instead. GAP-6.1 lists it.

---

## 1. Bob's answers (K4831) and the entries that carry them

| K4831 | Answer | Entries |
|---|---|---|
| (1) | D, staged; C the fallback | all; fallback §6 |
| (2) | Container line accepted; a cap BOB sets; the monthly figure reported | GAP-3.1 (cap), GAP-0.4 (cost reconciliation), GAP-3.8 (report) |
| (3) | Alpha with its current limits, each stated with size and limit, never shown as read; standard by the beta | GAP-1.2 (`READ_BOUNDS` carries both), GAP-1.10 (the sentence), GAP-3.2–3.6 (the standard reached) |
| (4) | Refused above either limit, reason stated; archives 500 MB uploaded, 2 GB unpacked, each file within its kind | GAP-1.2, GAP-1.4 (plan step), GAP-3.4 |
| (5) | No promised time; progress, an "about" estimate when measurable, a notice at finish or stop | GAP-1.10 |
| (6) | Alpha: reading does not wait for the scan, said plainly; with signatures, a found threat's text leaves search; beta: "needs a password", nothing typed | GAP-1.11, GAP-3.9 |
| (7) | Every part read and searchable, each result marked with its kind; Excel dates typed as dates, the number kept | GAP-1.9, GAP-3.6 |
| (8) | Protective limits inside the standard as a class: BOB sets each, a file over one stated with its figure, the list reported | GAP-1.2 (table), GAP-1.3 (checks), GAP-3.8 (report) |
| (9) | TAR, GZ, 7z with the archive work; OCR in the languages Oakland's public bodies publish in, Spanish first; not RAR; licences checked before use | GAP-3.0, GAP-3.4, GAP-3.5 |
| (10) | Sheet preview "show more" (UX-DESIGN screen); safe view 500 pages stated; "as a visitor saw it" said exactly; illegible pages upright, under 1/5 no text, under 4/5 partly legible; analysis workbooks held whole, up to 250,000 cells | GAP-1.12 |

---

## 2. Stage 0: measure first (Ob17)

These are BOB's acts on a throwaway Worker on the pinned account `20b533579290b9b93168345edd3b7f72`, never on the team's live copy (K4733). Each result is recorded in `PLATFORM.md` against its P-M id and read before the entries that wait on it.

- **GAP-0.1 · The door and storage.**
  - *Measures:* P-M1 (the body cap on the team's zone, which decides direct-to-R2 upload for 100 MB and 500 MB), P-M3 (R2 range latency; presigned multipart with per-part signing, PG16).
  - *Gates:* GAP-1.5.
- **GAP-0.2 · The isolate.**
  - *Measures:* P-M2 (a–e: 128 MB with buffers; the deployed plane's idle; a readers-only bundle's idle, WN5; whether objects of one class share an isolate), P-M5 and P-M6 (the CPU cut, the clock), P-M9 (SQLite landing cost per 1 MB batch), P-M10 and P-M11 (a binding callee's memory; 32 invocations).
  - *Gates:* the `cpu_ms` setting in GAP-1.4 (S-35), batch sizes in GAP-1.6, and Stage 1's interim memory figures.
- **GAP-0.3 · Workflows.**
  - *Measures:* P-M14 (5,000 no-op steps; 1 MiB and 1 MiB + 1 results; a deploy over a running step; resume unpoked; 50 parallel steps), P-M16 (a step's memory), P-M15 (concurrency), P-M4 (a deploy over a running alarm, for what stays on the alarm).
  - *Gates:* Stage 2.
- **GAP-0.4 · Containers and cost.**
  - *Measures:* P-M17 (cold start from sleep and from never run; R2 to container by outbound handler, S3 API and FUSE for a 100 MB object; a running call across a deploy, default and `immediate` rollouts; SIGTERM to SIGKILL; a week idle for host restarts; idle-awake cost at `standard-1` and `standard-4`; the timeout across an object restart), P-M24 (cost counters reconciled after each stage).
  - *Gates:* Stage 3. A failure triggers §6.

---

## 3. Stage 1: the shared shape on today's carrier

The order inside this stage: the harness first, so that every later entry is seen failing first; then bounds, identity and the job table; then units, progress and the readers; then the screens, safety and the smaller answers.

- **GAP-1.1 · The harness at the platform's shape (S9).**
  - *Owner:* `test-support`. *Providers:* `runtime-limits`, `plane` tests.
  - *Change:*
    - Real alarm semantics: a null `getAlarm()` in a run, a spent alarm that stays set, 6 retries.
    - The Workflows harness with a poke-after-restart helper, used from Stage 2.
    - A capped child under raw workerd for the heap, plus a byte ledger in product code for backing stores, with one cap convention (retire `128 - N` against `128 + 39 - N`, S-38).
    - The 2 MB value shim in every suite.
    - Kill, restart and store-failure injection (`restartAt`, `killPage`, `storeFailAt`, `objectGoneAt`).
    - A per-tick peak sampler that samples inside the tick (S-39).
    - Bars on counts, never on wall time (X30, S-39).
    - A seeded generated corpus per kind at the alpha's limits and at the standard's sizes, with a truth token per page, row and member, boundary cases either side of each limit, built on demand. It runs through the real entry paths: upload, multipart, `acquire`, pull, doorbell, archive member.
    - The family reports' corpora (PDF A1–E9, SCAN A–F, SHEET, DOCS) as named cases.
    - `npm test` with the platform-sqlite preload (S-40).
    - The reading modules list `test-support` in `uses` (S-41).
  - *Test:* the harness's own tests, plus the corpus truth function checked against an independent reader.
  - *Serves:* Ob15, Ob16, Ob17; C13, C15; RR-M1–M5.
- **GAP-1.2 · `READ_BOUNDS`, one table (S6).**
  - *Owner:* `reading-pipeline`. Every module that keeps a ceiling quotes it: `acquisition`, `capture`, `control-plane`, `file-safety`, `file-scanner`, `doc-clean`, `image-cover`, `workbooks`, `calculations`, `pdf-worker`, `ocr-worker`, `csv-reader`, `ooxml`, `odf-reader`, `office-readers`, `pdf-reader`.
  - *Change:* one table per kind, with three columns:
    - **standard:** Bob's K4628 figures. A file is refused above either limit (K4831 (4)). Archives: 500 MB as uploaded and 2 GB unpacked, each member within its kind.
    - **alpha:** today's figure where it is lower, each with its member sentence (K4831 (3)).
    - **protective:** limits set by BOB at or beyond what ordinary programs produce (K4831 (8)): 16,384 columns, 32,767 characters a cell (longer cells kept to 1 MiB and stated per cell), 1,000 sheets, 10,000 members, depth 3, ratio 1,100, a pixels-a-page limit, a decompressed-stream limit (N4), a `bfrange` expansion limit (N10), a page-content limit (N11), and an entries limit on any zip (S-21, X21).

    The nine byte ceilings a PDF meets (F-7) and the ceilings of S-9, X24 and X36 become this table's alpha column or are retired. `CAPTURE_MAX` and `ARCHIVE_TOTAL_MAX` are restated against it (X24).
  - *Test:* every module's ceiling is read from the table (a grep test), and a boundary case either side of each limit is in the corpus.
  - *Serves:* Ob8; C7, C12; RR-D1–D6; CF-1–CF-11, CF-39.
- **GAP-1.3 · Declared sizes checked before any allocation, on every route.**
  - *Owner:* `pdf-pixels`, `image-codecs`, `image-cover`, `ooxml`, `odf-reader`, `pdf-reader`, `ocr-worker`.
  - *Change:* each declared dimension, entry size, decompressed length, object count and nesting is checked against GAP-1.2 before a byte is allocated. A breach is a stated refusal with its figure, a deterministic failure, never `transient`. This covers:
    - N12: DCT, CCITT, JBIG2 and raw routes.
    - S6: the JPX precinct bomb.
    - S7: image-cover buffers.
    - X7: the office ratio check.
    - N4: the Flate decompression limit on the uncapped native path, including file-safety's grade.
    - N10: the `bfrange` limit.
    - S16: the OCR frame check before render.

    This is security, needed whatever the carrier.
  - *Test:* SCAN D7–D9 and D12, PDF A8 and B5, DOCS X7's 123 KB file; each under a capped child, refused stated, peak bounded.
  - *Serves:* Ob2; C1, C2; Fw §15.
- **GAP-1.4 · The READ JOB table and one registrar (S1).**
  - *Owner:* `plane` (`keeps_pending` becomes the job table for reading kinds). *Providers:* `extraction` (the registrar), `acquisition`, `capture`, `store-door`, `doorbell`, `control-plane` (promote, press, `readheld`), `reading-pipeline`.
  - *Change:* every way in writes one job row keyed by whole sha and kind, in the filing transaction, before the answer. The row carries the bound verdict, state, cursor, counters (written, skipped, owed, failed with cause), per-unit attempt stamps, `started_at`, `last_progress_at`, rate, the carrier reference and the reader version.
    - Registration is idempotent. "Read it" raises the job's priority.
    - A failed registration is retried once on a fresh stub and then stated, never swallowed (G98).
    - No member request reads more than a first look: head and tail ranges and the declared size. No OCR, unpack, whole parse or large fetch in a request (G97, G122, N16, S-23).
    - A plan step reads declared pages or rows and refuses above either limit with its figure (K4831 (4)).
    - Job kinds on the same table: fetch, unpack, ocr, scan, safe view, grade, ingest. Pending renders are held durably (X34).
    - Every archive door registers an unpack job, so an uploaded ZIP is opened (X3).
    - `limits.cpu_ms` is set from GAP-0.2's figure (S-35).
    - The `owe` hook that only tests call is retired (F-2).
  - *After:* GAP-1.1, GAP-1.2.
  - *Test:* each way in, with a kill between the put and the transaction, finds one job row and no inline read. The 1.9 MB scan answers in under 2 s with its OCR owed (G97's test). The 1 MB ODS that unpacks to 20 MB answers at once (G122's test).
  - *Serves:* Ob3, Ob6; C4, C6; RR-G1, RR-G2, RR-A2, RR-A6, RR-A10–A12, RR-D3, RR-L3; K4354, K4562.
- **GAP-1.5 · One identity (S2) and the upload path to R2.**
  - *Owner:* `capture`. *Providers:* `acquisition`, `provenance`, `record-core`, `content`, `retrieval`, `file-safety`, `extraction`, `store-door`.
  - *Change:*
    - The whole sha is the only key; part shas are below R2 multipart. `readRange(sha, offset, length)` hides the parts.
    - A multipart upload's document digest is the whole's (X35). A part shared by two documents resolves by whole sha (N20).
    - A migration of part-keyed rows already in live records is BOB's to schedule.
    - If GAP-0.1 shows the zone caps the body, the browser uploads straight to R2 by presigned multipart. The Worker signs, then registers on completion.
  - *After:* GAP-0.1 for the upload half.
  - *Test:* a 100 MB multipart upload: one sha, one job, citation and safety lookups by that sha. The migration replays on a copy of a record holding part rows.
  - *Serves:* Ob10; C9; RR-A2, RR-A12, RR-H6, RR-J2.
- **GAP-1.6 · Units land in batches; completeness is one fact (S4).**
  - *Owner:* `extraction`. *Providers:* `record-core`, `retrieval`, `retrieval-browse`, `content`, `text-chain`, `reading-pipeline`.
  - *Change:*
    - A reading is a header row plus unit rows, landed in about 1 MB batches, each batch its own transaction, idempotent by (job, batch).
    - A unit over 128 Ki characters is chunked into consecutive units, never cut (N15, X14).
    - The index grows to the last line. Per-piece caps no longer cut units (X15), and a reading over 1 MiB is never replaced by a statement without units (N22, X1, S-1).
    - Completeness is computed only from the job's counters, so "whole" is never said with pages unread (S2, S21, X29).
    - CSV blocks do not repeat the header as data, and held text is read from extents (G100, S-3a, S-13, S-24).
    - Units of a sheet carry row numbers and empty cells (S-12).
    - A stored PDF reading carries the whole file's metadata, page boxes, images and counts, not the first range's (N3).
    - CO R46 allows citing from landed units ("searched so far").
    - A migration of existing readings is BOB's to schedule.
  - *After:* GAP-1.4; batch size from GAP-0.2 (P-M9).
  - *Test:*
    - PDF A1 (N3) and A10 (N15).
    - DOCS X1 (a 61 KB DOCX table).
    - SCAN C1 and C8 (S2).
    - SHEET S-3's 18,100 rows (G100).
    - A 300,009-character line found at its last word.
  - *Serves:* Ob9, Ob11, Ob12; C3, C11, C12; RR-F2, RR-F7, RR-H1–H3, RR-H7, RR-I1, RR-I5, RR-J1, RR-J6; K4571.
- **GAP-1.7 · Progress only forward; failures classified; the poison rule (S5).**
  - *Owner:* `extraction`. *Providers:* `plane`, `scheduler`, `reading-pipeline`.
  - *Change:*
    - The step wrapper asserts `next > cursor || terminal`. An encrypted PDF read in pieces ends stated "needs a password" (G102, K4831 (6)).
    - Failures are deterministic, transient or resource. A transient failure at any tick is retried, never written as an end (N14, S-7, X13).
    - A per-unit attempt stamp is written before the reader runs. A unit that kills its reader three times is stated for that unit alone (`PAGE_KILLED_READER`), after one retry at half the budget; the read goes on (CF-18). "Three interruptions end the whole read" is retired.
    - The OCR remainder of a standalone image is a job like a PDF's (S4).
    - A transient store error during unpack never leaves a member `not_filed` for good (X20).
    - The `undetermined` list is bounded, with a count beyond it (S-22).
  - *Test:* store failure at tick 2 (SHEET S-7, DOCS X13). A page that kills its reader three times leaves the rest read (PDF A6). An encrypted ranged PDF (PDF C15, G102's test). An image's OCR continued after a restart (SCAN A1, E7).
  - *Serves:* Ob4, Ob5; C5; RR-G2–G4, RR-F7; CF-18; K4630.
- **GAP-1.8 · The reader contract, and the readers within the alpha (S3).**
  - *Owner:* `reading-pipeline`. *Providers:* `format-registry`, `csv-reader`, `pdf-reader`, `pdf-worker`, `ocr-worker`, `office-readers`, `ooxml`, `odf-reader`, `pdf-pixels`, `image-codecs`.
  - *Change:* one contract, `plan(source)` and `read(source, cursor, budget)` over `{size, readRange}`. A whole read is a one-piece range, so the three read modes are retired. Step cost is bounded by bytes decoded plus objects walked.
    - **(a) Detection** from range reads of head and tail, never a 1 KiB prefix. Images are asked before PDF and HTML, and office files above 8 MiB are recognised by their tail (S14, S-10, X5, X18, X32; CF-28).
    - **(b) Light kinds brought to the standard** (they stay in Workers):
      - Text, CSV and TSV, JSON and XML are read in byte windows with a carry, to 50 MB and 1M rows (S-9).
      - CSV is fixed: cells decoded without the cp1252 transport (S-4), a stray quote bounded (S-5), the dialect decided per window with stated disagreements (S-6), empty cells keep their column (S-3b).
      - `cellsIn` reads from stored access points, never from byte 0 (S-20).
      - HTML is read by a streaming cleaner: tables keep rows and columns, link lists are kept, and nothing deep is quadratic (S-34, X31).
      - Encodings, BOB's under K4628 (FOR-BOB "not asked"): UTF-8, UTF-16 with or without BOM, and the declared or detected legacy charset (windows-1252, ISO-8859-x). The assumed encoding is shown on the document's page, and a disagreeing window is stated (X9; SHEET §4.2 E-17, B-8). This reverses BOB #32's refusal, recorded as a ruling with Bob told.
    - **(c) Heavy kinds made correct within the alpha** (they leave in Stage 3):
      - PDF ranges become the only path, and `PdfDoc` and `XrefReader` agree on `/Encrypt` (N9).
      - The confirmed parser defects are fixed: N5 (incremental update), N6 (`/Root`), N7 (a fake object), N8 (a leaf with no `/Type`), N21 (a truncated file stated), plus N10's mixed codespaces and sign flip.
      - pdf-worker checks its envelope before any parse and asks for the range only (F-1, CF-35).
      - `allowTextPage` is passed (N13, F-3).
      - ocr-worker gets a top-level guard (N23). The OCR member reads its page, not the whole object per call (S16, the member half of F-5), and calls the engine's orientation detection (S9, K4831 (10)).
      - The tier-1 OCR pass no longer re-parses the whole file per page (F-5's pass half).
      - The four wrong-pixel routes state `undetermined` in place of wrong pixels (S12).
      - ODS gets held cells and row windows (G99, S-2), and merged ODS cells keep their columns (S-18).
      - Office text readers stop throwing on an out-of-range character reference (X12, S-21), and have time bounds against quadratic scans (X6).
      - The ZIP central directory is read in physical order with an entries limit (X4).
      - Classification is a budgeted step (X25, X22's quadratic patterns).
    - **(d) Point reads** (`cellsOf`, `cropOf`) answer from precomputed rows (access points, page boxes and image placements) within 2 s, never from a cold container (OPTIONS §2.3).
  - *After:* GAP-1.3, GAP-1.4, GAP-1.6.
  - *Test:* the corpus at each light kind's standard size, through every entry path. The confirmed PDF reds (`red.mjs N5…N21`). SHEET A–G files. DOCS X4–X6 and X12. SCAN B1–B2 and D6. Each red first.
  - *Serves:* Ob1, Ob2, Ob13, Ob16; C1–C3, C8, C10; RR-E1–E13, RR-F1–F4, RR-C2, RR-C3, RR-D5.
- **GAP-1.9 · Every part of a document, marked with its kind (K4831 (7)).**
  - *Owner:* `office-readers`. *Providers:* `ooxml`, `odf-reader`, `reading-pipeline`, `retrieval`, `content`.
  - *Change:*
    - Footnotes, endnotes, headers, footers, comments, tracked deletions, text boxes, speaker notes and slide-master text are read as units, each marked with its kind (X11, CF-21, RR-E11). Search returns them by default with the kind shown, and a citation names the kind.
    - ODS annotations become their own units, not part of the cell value (S-19).
    - XLSX `styles.xml` number formats type date cells as dates, with the original serial kept beside (S-11, K4831 (7) second half; reverses office R30's ruling, recorded).
    - On the container path, Stage 3 carries the same unit kinds (GAP-3.6).
  - *Test:* DOCS C4/C5 files (a footnote's dollar figure found and cited as a footnote); SHEET S-11 (2024-05-01 found in XLSX, ODS and CSV alike).
  - *Serves:* K4628 point 2, K4636; RR-E11.
- **GAP-1.10 · What the member sees comes from the job row (S7; K4831 (3), (5)).**
  - *Owner:* `screens-intake`. *Providers:* `control-plane` (`op=reading`, `owedwork`), `notice-producers`, `queue-producers`, `retrieval`, `content`, `screens-inquiry`.
  - *Change:*
    - The states: queued, being fetched, being read N of M, read in part and why, refused with its limit, finished. A notice is sent at finish or stop.
    - An "about" estimate appears only after enough units to measure; no promised time.
    - "Searched so far" is shown on partial readings (DEC-418).
    - The alpha-limit sentence names the file's size and the limit, and never says "read" (K4831 (3)). A refusal carries its size and limit (S-8, CF-10; the door's 413 included). A refusal's reason reaches the member (S11).
    - A kind with no reader is named ("RTF is not read yet"), not "non-textual or too large" (S3, X10, X28).
    - No act is offered that is a no-op (S3).
    - `readingOf` no longer marks a failed or owed reading as read (S18 (e)).
    - "Read it now" is shown only where it can succeed (Ob9).
    - The words are the design stream's: DEC-98 and DEC-417–419, plus new rows through one HANDOFF to UX-DESIGN.
  - *Test:* a screen-level walk of each state from the corpus; the alpha-limit sentence for a 30 MB CSV; an RTF named.
  - *Serves:* Ob9; C11; RR-L1–L7, RR-I1, RR-I2, RR-J6; GP-32, GP-35, GP-37–39; K4571.
- **GAP-1.11 · Safety beside reading (S8; K4831 (6)).**
  - *Owner:* `file-safety`. *Providers:* `file-scanner`, `acquisition`, `scheduler`, `doc-clean`.
  - *Change:*
    - Scan, grade and safe view are their own job kinds, and reading never waits on them. The document page says so plainly.
    - "Encrypted" and "unscannable" are their own states, never `clean`, and an encrypted original is not opened as safe (X16, X32's encrypted members).
    - The grade comes from the range-read structure check of GAP-1.8 (a), not from 1 KiB or the size: images are graded by source, not size, and a TIFF, HEIC or BMP deeper check is not left `incomplete` (S13, X18).
    - The scanner's and renderer's calls are bounded (G92). Render output is read as a stream with a limit (X17), and a failed render is retried when the renderer recovers (X19).
    - doc-clean writes ZIP64 and an entries limit (X21).
    - When the scanner has signatures, a found threat's text leaves search. This waits on the scanner (FR-SCAN) and is GAP-3.9.
  - *Test:* an encrypted ZIP, DOCX and PDF: not `clean`, original not opened. SCAN F1–F8. DOCS X17's 1,875-page render, bounded.
  - *Serves:* Ob14; C16; RR-B1–B4; K4831 (6).
- **GAP-1.12 · The smaller screen answers (K4831 (10)).**
  - (a) A sheet preview's "show more" paging by `next_row`: a HANDOFF to UX-DESIGN for the screen, then `file-safety` for the paging (SHEET B-6, E-26).
  - (b) The safe view keeps 500 pages and says so (DOCS Q3; `file-safety`, words).
  - (c) "As a visitor saw it" is said exactly (first load, not scrolled, banners not dismissed, no frames). A failed render is charged its real time and the day's account is shown (X23, DOCS Q7; `capture-sources`, `acquisition`, words).
  - (d) Illegible pages: turned upright (with GAP-1.8 (c)). Under 1/5 legible, no text is stored and the page is stated. Under 4/5, the text is kept and marked partly legible, for photos and PDF pages alike (S9, S17's asymmetry, B-S6; `ocr-worker`, `reading-pipeline`).
  - (e) Analysis workbooks are held whole, with only the cells a binding or citation touches interpreted, up to 250,000 cells (the recompute engine's bound, stated in workbooks and sheet-worker requirements). `addWorkbook` stops throwing on a cell with no reference, and counts what it drops (SHEET B-4, E-22, S-26, S-32; `workbooks`, `sheet-worker` requirements).
  - *Test:* each with its corpus or screen case.

---

## 4. Stage 2: the Workflows carrier, light kinds first

- **GAP-2.1 · The `reading-flow` Worker and the step contract.**
  - *Owner:* *new* `reading-flow` (a fleet member through `bundler`). *Providers:* `plane` (a `workflows` binding), `reading-pipeline`, `extraction`, `installer`.
  - *Change:*
    - One Workflow instance per job, its id the team and whole sha, so a second `create` is the same job.
    - Each step reads one bounded piece through the GAP-1.8 contract, writes its attempt stamp, lands its batch in Store by RPC idempotently by (job, step), and returns under 1 MiB, asserted by the step itself.
    - A deterministic failure returns `{unit_failed, cause}`; only transient and resource failures throw. Nothing with side effects sits outside a step (WF12).
    - The job row records the reader version. A release keeps the step contract compatible across one version.
    - The installer deploys the Worker and its binding (K3447).
  - *After:* GAP-0.3, and Stage 1's GAP-1.4 to GAP-1.8.
  - *Test:* under Miniflare, completed steps run once and the in-flight step at most twice across a restart, with the poke helper. The 1 MiB rule is red at 1 MiB + 1. The corpus's light kinds read through steps at the standard's sizes.
  - *Serves:* Ob4, Ob5; C5, C14 (parse off Store's thread), C1.
- **GAP-2.2 · The light kinds move to steps; the ledger's reading arm retires.**
  - *Owner:* `reading-pipeline`. *Providers:* `plane`, `scheduler`, `extraction`.
  - *Change:* text, CSV and TSV, HTML, JSON and XML read in steps; then the heavy kinds' JavaScript readers also run behind steps until Stage 3 replaces them. Each step owns its own piece, so two PDFs owed at once no longer alternate in one slot (N19). Once the corpus passes through steps, the reading arm of `keeps_pending`, `PENDING_INTERRUPTED_MAX`, and the reading consumers' arms in the scheduler are retired. The scheduler keeps its other consumers.
  - *Test:* the whole corpus through steps; a plane release during a read does not interrupt it.
  - *Serves:* C5, C14; G117's cause (reading's parse on Store's thread) removed.
- **GAP-2.3 · The second clock (K4566).**
  - *Owner:* `scheduler`.
  - *Change:* the existing `*/5` cron finds job rows with no progress for N minutes and re-creates the instance by id. It is a poke, never a reader. N is BOB's, after P-M14 shows whether unpoked resume happens.
  - *Test:* a stalled instance poked and resumed in the harness.
  - *Serves:* C5.
- **GAP-2.4 · OCR fan-out in Workers (interim, until GAP-3.5).**
  - *Owner:* `reading-flow`. *Provider:* `ocr-worker`.
  - *Change:* OCR steps of 5 to 10 pages run in parallel to a width BOB sets after P-M11 and P-M14.
  - *Test:* a 300-page scan at width W reads every page once.
  - *Serves:* the time a member waits on a scan.

---

## 5. Stage 3: the container readers, one kind at a time

Each kind follows the same gate. It is proven on the generated corpus at the standard's sizes, on a parity corpus against the JavaScript reader (with the evidentiary rules: no character guessed, unmapped codes named, per-page tier and image flags, RR-E2, RR-E3), and on a live probe. Only then does it replace the JavaScript reader, and only then does that reader's source leave the plane. The order below is the lane's suggestion; the order is BOB's.

- **GAP-3.0 · Licences, before any tool is used (K4831 (9)).**
  - *Owner:* BOB's act.
  - *Change:* each candidate's licence is checked and recorded once in `build/rulings.md`: poppler (GPL), MuPDF (AGPL), PDFium, libvips, libarchive, 7-Zip (p7zip; not unRAR), Tesseract with its `eng` and `spa` models, LibreOffice. A copyleft tool is used only as a separate program in the image, with its source offer kept, or replaced by a permissive alternative.
  - *Gates:* GAP-3.1.
- **GAP-3.1 · `reader-container`: the image, its object and the call.**
  - *Owner:* *new* `reader-container` (fleet member). *Providers:* `bundler`, `installer`, the `container-images.yml` workflow.
  - *Change:*
    - Two images, built and published digest-pinned to `docker.io/civicsmith/<image>` by the existing workflow (file-scanner R10, N1242, K3805): `reader-core` (PDF tools, Tesseract with `eng` and `spa`, libvips, libarchive or 7-Zip, streaming OOXML, ODF and sheet parsers, a small HTTP server) and `reader-office` (LibreOffice, legacy formats only).
    - The call is `POST /read {job, kind, source, range, budget}` and returns `{units, cursor, counts, causes}` under 512 KiB, or an R2 reference.
    - The file is copied once to the instance disk and read locally, unless P-M17 shows a better route.
    - Each call is under about 5 minutes, cancelled when its connection aborts, and its landing is idempotent.
    - The inactivity timeout is set after `start()` and again in the constructor (CT15). Scheduling uses `schedule()` (CT17).
    - No internet. One job's bytes per instance.
    - `max_instances` is the container cap, set by BOB and reported (K4831 (2)).
  - *After:* GAP-0.4, GAP-3.0, Stage 2.
  - *Test:* the image's own corpus under Docker at the instance type's limits (`--memory 4g --cpus 0.5`); the step-to-container contract against a fake container in Miniflare; the object-to-container wiring under `wrangler dev`; then the live probe.
  - *Serves:* C1, C2, C10, C17.
- **GAP-3.2 · PDF text and structure in the container.**
  - *Owner:* `reading-pipeline` (as client). *Providers:* `reader-container`, `extraction`.
  - *Change:* text and structure come from a native extractor, wrapped to report unmapped codes and per-page glyph counts, so that "no character guessed" holds. Pages with no decodable text are rendered for OCR (N18). The standard's 100 MB or 5,000 pages are reached. Simple-font encodings are handled by the tool (N17). Pages too large for the JavaScript reader (N11) become ordinary pages.
  - *Retires after parity:* `pdf-reader`'s parser (keeping only what `file-safety` imports until GAP-3.7), and `pdf-worker`'s tier 2.
  - *Test:* PDF corpus A–E (64 files) and the 100 MB / 5,000-page case; parity against GAP-1.8's fixed JavaScript reader.
  - *Serves:* RR-E2, RR-E3; C1, C2, C10.
- **GAP-3.3 · Images.**
  - *Owner:* `reading-pipeline`. *Providers:* `reader-container`, `ocr-worker`.
  - *Change:* libvips decodes JPEG (progressive and CMYK included), PNG, TIFF, HEIC, GIF (first frame), WebP and BMP to OCR-ready frames under the pixel limit, at the standard's 50 MB. Images are turned upright (K4831 (10)).
  - *Retires after parity:* `pdf-pixels` and `image-codecs` decoders on the reading path, and `pdf-worker`'s JPX.
  - *Test:* SCAN A2–A14, D7–D14, B1–B2.
  - *Serves:* K4628 point 1 (the six image types), RR-E6; S3, S12 closed.
- **GAP-3.4 · Archives (K4831 (4), (9)).**
  - *Owner:* `acquisition` (unpack). *Providers:* `reader-container`, `format-registry`.
  - *Change:* ZIP, TAR, GZ and 7z are listed and unpacked as streams. Each member goes to R2 multipart as its own capture with its own job. 500 MB as uploaded and 2 GB unpacked, each member within its kind, depth 3, ratio 1,100, 10,000 members. Encrypted members are stated as encrypted. RAR is refused by name.
  - *Retires after parity:* the JavaScript archive listing and inflate on the reading path (`ooxml`'s archive half keeps detection and the safety lists).
  - *Test:* the DOCS archive corpus (X4's shuffled 10,000 entries), a 500 MB ZIP, TAR and 7z, a 2 GB-unpacked boundary, a nested depth-4 case refused stated.
  - *Serves:* RR-E13, RR-A11; X3, X4, X20.
- **GAP-3.5 · OCR in the container, and its languages (K4831 (9)).**
  - *Owner:* `reading-pipeline`. *Providers:* `reader-container`, `ocr-worker`.
  - *Change:* native Tesseract, with pages fanned out across steps and instances up to the cap. Languages are those Oakland's public bodies publish in, Spanish first: `spa` beside `eng`, the language chosen per page by the engine's script and language detection, and stated. Each further language is BOB's to add and report.
  - *Retires after parity:* `ocr-worker` and the wasm engine.
  - *Test:* SCAN corpus; a 5,000-page sparse scan for the count, with a full run at the round's end; Spanish pages read in Spanish.
  - *Serves:* RR-E4, RR-E5; CF-20; C14 for OCR.
- **GAP-3.6 · Office and legacy formats.**
  - *Owner:* `office-readers` (as client). *Providers:* `reader-container`, `ooxml`, `odf-reader`.
  - *Change:* DOCX, PPTX, XLSX, ODT, ODP and ODS are read by streaming parsers in the container, with every part marked by kind and dates typed (the GAP-1.9 rules), to the standard's 100 MB and 50 MB / 1M rows. The cursor carries a deflate access point, and shared strings are spilled to scratch with an index. LibreOffice reads .doc, .xls, .ppt and RTF, converted then read by the same parsers. .eml and .msg are read: the body decoded, and attachments as members with their own jobs. A spreadsheet shares the sheet answers of K4831 (4): refused above 50 MB or 1,048,576 rows, with its figure.
  - *Retires after parity:* the heavy-kind parts of `office-readers`, `ooxml` (keeping detection and the safety lists) and `odf-reader`.
  - *Test:* SHEET corpus A–G at 50 MB and 1M rows; DOCS corpus; the legacy files of N1266; parity on S-15–S-19's cases.
  - *Serves:* K4628 point 1 (.doc, .xls, RTF, .eml, .msg, PowerPoint); RR-E7–E12; S-9, S-14, X2, X6, X8, X10.
- **GAP-3.7 · The grade on the same reader.**
  - *Owner:* `file-safety`. *Provider:* `reader-container`.
  - *Change:* the structure check becomes a `grade` job kind in the reader container, so `file-safety` stops importing the JavaScript readers. Then the plane's bundle drops them (the 30.18 of 32 MiB, K2547 noted).
  - *Test:* SCAN F1–F8 and DOCS X18 by the container grade.
- **GAP-3.8 · Report to Bob (K4831 (2), (8)).**
  - *Owner:* BOB's act.
  - *Change:* the container cap and the monthly container figure from P-M24, plus the list of protective limits set in GAP-1.2, reported to Bob in plain words after the first heavy kind runs live.
- **GAP-3.9 · A found threat's text leaves search (K4831 (6), second half).**
  - *Owner:* `file-safety`. *Providers:* `retrieval`, `file-scanner`.
  - *Change:* when the scanner has signatures, a `found` verdict hides that document's units from search and says so on its page.
  - *After:* the scanner's signatures (FR-SCAN), outside this gap.

---

## 6. If the fallback C is taken (K4831 (1))

The trigger is P-M17 showing containers unreliable or slow to start, or a parity failure for a kind. In either case, for the kinds affected:

- **GAP-6.1:** the Stage 1 heavy readers are rewritten to the standard's sizes in Workers steps: PDF by ranges and object windows, xlsx and ODS by access points and the shared-strings spill, archives by directory ranges, images by strips.
- **GAP-6.2:** JavaScript readers are written for the K4628 kinds the platform still lacks (.doc, .xls, RTF, .eml, .msg, TIFF, HEIC, WebP, GIF).
- **GAP-6.3:** OCR stays `ocr-worker` with GAP-2.4's fan-out.

For one kind failing parity, only that kind keeps its JavaScript reader behind the same step. Stages 0 to 2 are unchanged.

---

## 7. The existing reading causes, mapped

There are three dispositions:
- **Absorbed:** the entry named fixes the cause, and the cause's failing-first test becomes that entry's test.
- **Kept:** fixed as written, in the fix round K4831 asks BOB to open. The code survives the architecture, so the fix is needed whatever comes later.
- **Dropped:** the code is retired by a later stage. The case enters the parity corpus, and no fix is made beyond what GAP-1.8 (c) lists for the alpha.

### 7.1 Fix round 8's held causes (K4812)

| Cause | Disposition | Why |
|---|---|---|
| G91 serial firing, no bound | **Kept** (with K4811 (5)'s budget and rotation) | The scheduler carries reading until GAP-2.2, and its other consumers after that |
| G92 file-safety's calls unbounded | **Kept**; also GAP-1.11 | Safety jobs stay on the scheduler |
| G93 `heal` has no caller | **Kept** | The scheduler survives (K4565) |
| G94 `watchdog_seen` and `running_since` | **Kept** | Operators' view of the scheduler |
| G95 `stale` misses a stall of completed firings | **Kept** | Ditto. GAP-2.3 adds the reading's own clock |
| G96 OCR remainder owed to nobody | **Absorbed**, GAP-1.4 | One registrar |
| G97 inline pass makes OCR calls | **Absorbed**, GAP-1.4 | No heavy work in a request |
| G98 failed registration swallowed | **Absorbed**, GAP-1.4 | |
| G99 ODS held cells | **Absorbed**, GAP-1.8 (c); then GAP-3.6 | |
| G100 CSV blocks repeat the header | **Absorbed**, GAP-1.6 | CSV stays in Workers |
| G102 encrypted ranged PDF never finishes | **Absorbed**, GAP-1.7 | |
| G117 screens slow during ticks | **Absorbed**, GAP-2.2 (cause removed); measured by GAP-1.1's lag meter until then | |
| G122 inline gate counts stored bytes | **Absorbed**, GAP-1.4 | |

### 7.2 Fix round 8 §8: SCAN #1 and PDF (K4809, K4803)

| Item | Disposition |
|---|---|
| S2 "whole" with pages unread | Absorbed, GAP-1.6 |
| S3 image types with no path, wrong sentence | Absorbed, GAP-1.10 (sentence, no no-op act); GAP-3.3 (read) |
| S4 no OCR continuation for an image | Absorbed, GAP-1.7 |
| S6 JPX object bomb | Absorbed, GAP-1.3; dropped with `pdf-worker` at GAP-3.3 |
| S7 image-cover buffers | Absorbed, GAP-1.3 (image-cover stays) |
| S9 sideways picture | Absorbed, GAP-1.8 (c) and GAP-1.12 (d); GAP-3.3 |
| S11 refusal reason lost | Absorbed, GAP-1.10 |
| S12 four wrong-pixel routes | Absorbed, GAP-1.8 (c) (stated, not wrong); dropped at GAP-3.3 |
| S13 file-safety grading of images | Absorbed, GAP-1.11 |
| S14 detection order | Absorbed, GAP-1.8 (a) |
| S15 web pictures never read; keep decodes before keeping | Kept (`capture-sources`: keep before decoding). Reading web pictures: GAP-1.4 (each kept picture a capture with a job) and GAP-3.3 |
| S16 OCR member's bounds | Absorbed, GAP-1.3 and GAP-1.8 (c); dropped at GAP-3.5 |
| S18 (e) `readingOf` read:true | Absorbed, GAP-1.10 |
| S21 unread picture in a text page | Absorbed, GAP-1.6 |
| S22 codec tests not run by `npm test` | Kept (`image-codecs`, tests only) |
| S17, S23, S25 (judged not causes) | S17's line rectangles: a requirement for BOB at GAP-3.5; S23 wording (`later-ux.md`); S25 is a diagnosis on corpus E3 at GAP-1.6 |
| N3 stored PDF is the first range's | Absorbed, GAP-1.6 |
| N4 Flate uncapped | Absorbed, GAP-1.3 |
| N5, N6, N7, N8, N21 parser defects | Absorbed, GAP-1.8 (c); dropped with the parser at GAP-3.2 |
| N9 (with F-4) direct `/Encrypt` | Absorbed, GAP-1.8 (c) |
| N10 `bfrange` and codespaces | Absorbed, GAP-1.3 (limit) and GAP-1.8 (c) |
| N11 one page held whole | Absorbed, GAP-1.2 (page-content limit, stated) for the alpha; GAP-3.2 |
| N12 decoders allocate before bounds | Absorbed, GAP-1.3 |
| N13 / F-3 `allowTextPage` | Absorbed, GAP-1.8 (c) |
| N14 transient at tick ≥ 2 ends the read | Absorbed, GAP-1.7 |
| N15 page over 128 Ki cut | Absorbed, GAP-1.6 |
| N16 whole parse in a member's request | Absorbed, GAP-1.4 |
| N17 no simple-font encodings | Absorbed, GAP-3.2 (alpha: tier 2 still reads them, slowly; F-1 fixed) |
| N18 no rasteriser | Absorbed, GAP-3.2 |
| N19 two PDFs alternate one slot | Absorbed, GAP-2.2 |
| N20 shared part `NO_HOME` | Absorbed, GAP-1.5 |
| N22 reading over 1 MiB stored final, no units | Absorbed, GAP-1.6 |
| N23 ocr-worker has no guard | Absorbed, GAP-1.8 (c); dropped at GAP-3.5 |
| N24 empty-password scan not OCR'd | Absorbed, GAP-3.2 (the tool opens an empty-password file); alpha: stated |
| F-1 pdf-worker parses before its envelope check | Absorbed, GAP-1.8 (c) |
| F-2 no production `owe` | = G96, GAP-1.4 |
| F-5 OCR cost per page is the file's | Absorbed, GAP-1.8 (c) (both halves) |
| F-6 the reader bundled three times | Not a defect. Resolved by GAP-3.2, GAP-3.3 and GAP-3.7 |
| F-7 nine byte ceilings | Absorbed, GAP-1.2 |
| N1 / N2 (merged) | = G102 / G96 |

### 7.3 SHEET #1 (S-1 to S-41)

| Items | Disposition |
|---|---|
| S-1 cells inline over 1 MiB deleted | Absorbed, GAP-1.6 |
| S-2 ODS of about 20 MB never read | = G99 and G122: GAP-1.8 (c), GAP-1.4 |
| S-3 table from CSV wrong four ways | (a) GAP-1.6; (b) GAP-1.8 (b); (c, d) G101's job (going ahead in fix round 8, `calculations`), kept |
| S-4, S-5, S-6 CSV encoding, quote, dialect | Absorbed, GAP-1.8 (b) |
| S-7 transient later tick ends the read | Absorbed, GAP-1.7 |
| S-8 size refusal drops its figures | Absorbed, GAP-1.10 |
| S-9 no bound reaches 50 MB / 1M rows | Absorbed: GAP-1.8 (b) for CSV and TSV; GAP-3.6 for workbooks |
| S-10 format identity by declared type | Absorbed, GAP-1.8 (a) |
| S-11 three renderings of a date | Absorbed, GAP-1.9 |
| S-12 search gives a block | Absorbed, GAP-1.6 |
| S-13 wide sheets | Absorbed, GAP-1.6 and GAP-1.2 (16,384 columns); the A1 shape past ZZZ kept (`text-chain`, `canonicalRange`) |
| S-14 each tick re-parses the object | Absorbed, GAP-1.8 (b) for CSV; GAP-3.6 for workbooks (alpha: stated limits) |
| S-15, S-16, S-17, S-19 XLSX and ODS quirks | Dropped at GAP-3.6, each a parity case. S-19's annotation is absorbed, GAP-1.9 |
| S-18 ODS covered cells shift values | Absorbed, GAP-1.8 (c) (wrong data within the alpha) |
| S-20 `cellsIn` quadratic | Absorbed, GAP-1.8 (b) and (d) |
| S-21 zip entry and ratio checks on the reader path | Absorbed, GAP-1.3 and GAP-1.8 (c) |
| S-22 `undetermined` unbounded | Absorbed, GAP-1.7 |
| S-23 no-cursor door read cuts a sheet | Absorbed, GAP-1.4 (no door read) |
| S-24 first-row marker proves nothing | Absorbed, GAP-1.1 |
| S-25 to S-31 tables, workbooks, money | Kept, outside reading (interpretation: `calculations`, `workbooks`, `calc-grammar`). BOB places them as their own causes. S-26 and S-32 are absorbed, GAP-1.12 (e) |
| S-33 G70's pace | Absorbed, GAP-2.2 (off the reading path); G91 kept |
| S-34 HTML tables | Absorbed, GAP-1.8 (b) |
| S-35 no `cpu_ms` | Absorbed, GAP-1.4 after GAP-0.2 |
| S-36 range citation never walked | Absorbed, GAP-1.1 (entry paths) and the round's walk |
| S-37 stale requirement text | Absorbed: each entry's requirement edit |
| S-38 to S-41 test infrastructure | Absorbed, GAP-1.1 |

### 7.4 DOCS #1 (X1 to X36)

| Items | Disposition |
|---|---|
| X1 DOCX table reading replaced by a statement | Absorbed, GAP-1.6 |
| X2 office bound counts declared bytes | Absorbed, GAP-1.2 and GAP-1.3 (alpha); GAP-3.6 |
| X3 uploaded ZIP never opened | Absorbed, GAP-1.4; GAP-3.4 |
| X4 archive listing unbounded | Absorbed, GAP-1.8 (c); GAP-3.4 |
| X5 office over 8 MiB `undetermined` | Absorbed, GAP-1.8 (a) |
| X6 quadratic scans on tiny input | Absorbed, GAP-1.8 (c) (time bounds); dropped at GAP-3.6 |
| X7 no ratio check on the office path | Absorbed, GAP-1.3 |
| X8 each tick re-parses | Absorbed, GAP-1.8 (b) for HTML; GAP-3.6 for office |
| X9 no encoding read | Absorbed, GAP-1.8 (b) |
| X10 RTF, email, DOC unread | Absorbed, GAP-1.10 (named, alpha); GAP-3.6 (read) |
| X11 parts not indexed, "whole" said | Absorbed, GAP-1.9 |
| X12 "never throws" false | Absorbed, GAP-1.8 (c) |
| X13 failure at tick ≥ 2 | = N14, GAP-1.7 |
| X14 page over 128 Ki cut | = N15, GAP-1.6 |
| X15 per-piece index caps | Absorbed, GAP-1.6 |
| X16 scanner says clean of encrypted | Absorbed, GAP-1.11 |
| X17 render output unbounded | Absorbed, GAP-1.11; GAP-1.12 (b) |
| X18 file-safety not a gate; kind from 1 KiB | Absorbed, GAP-1.11 and GAP-1.8 (a) (the gate question answered by K4831 (6)) |
| X19 failed safe view permanent | Absorbed, GAP-1.11 |
| X20 only ZIP; transient `not_filed` for good | Absorbed, GAP-3.4 and GAP-1.7 |
| X21 doc-clean 16-bit entry count | Absorbed, GAP-1.11 |
| X22 profiling quadratic | Kept (`docprofile`, `doctypes`: the patterns made linear), budgeted as a step in GAP-1.8 (c) |
| X23 visitor-view render charge | Absorbed, GAP-1.12 (c) |
| X24 `CAPTURE_MAX` twice the object | Absorbed, GAP-1.2 |
| X25 `doctypeFor` unbounded | Absorbed, GAP-1.8 (c) |
| X26 the ledger's clock | Retired with the ledger's reading arm, GAP-2.2; instruments in GAP-1.1 |
| X27 text-chain merge, 0-based pages, O(n²) | Kept (`text-chain`) |
| X28 wrong member sentence | Absorbed, GAP-1.10 |
| X29 audits' silent partial reads | Absorbed, GAP-1.6 and GAP-1.10, each audit row a corpus case |
| X30 wall-time bars | Absorbed, GAP-1.1 |
| X31 HTML quadratic, link lists dropped | Absorbed, GAP-1.8 (b) |
| X32 magic only above 8 MiB; templates refused; encrypted members | Absorbed, GAP-1.8 (a) and GAP-1.11 |
| X33 quiet-window rule; raw CDP text; hidden slides | Kept (`capture-sources`; the CDP text is G110, going ahead); hidden slides a parity case at GAP-3.6 |
| X34 `PENDING_RENDERS` lost on restart | Absorbed, GAP-1.4 |
| X35 multipart first part's digest | Absorbed, GAP-1.5 |
| X36 four ceilings judge one file | Absorbed, GAP-1.2 |

### 7.5 The fix round for the kept causes

K4831 asks BOB to open a fix round for the held causes. Under this mapping, that round holds only the **kept** rows:
- G91 to G95, with the budget, bound and threshold already ruled in K4807 and K4811;
- S15's keep before decoding;
- S22's test script;
- X22's profiling patterns;
- X27's text-chain items;
- X33's quiet-window rule.

Each is in code that survives D. Every **absorbed** row is fixed by its GAP entry, so it gets no separate job: its four fields and failing-first test go into that entry's START. Every **dropped** row joins the parity corpus.

---

## 8. Requirement changes the gap implies (BOB's wording, P17)

- **`reading-pipeline`:** `READ_BOUNDS` (GAP-1.2), the reader contract (GAP-1.8), encodings, and the light kinds at the standard.
- **`plane`:** the job table (GAP-1.4), `cpu_ms`, and the object's total memory, not "above idle". RR-F1 is restated to state the total (OPTIONS WN6).
- **`extraction`:** units, completeness and the poison rule. DEC-417's "three interruptions" sentence is retired, which is a HANDOFF to UX-DESIGN.
- **`office-readers` R30:** dates typed, reversed by K4831 (7).
- **`csv-reader` R6 and R7:** limits and encodings (S-37).
- **`file-safety`:** gating per K4831 (6), encrypted and unscannable states, and the safe view at 500 pages stated.
- **`workbooks` and `sheet-worker`:** 250,000 cells (GAP-1.12 (e)).
- **New modules:** requirements for `reading-flow` and `reader-container`.
- **`ocr-worker`:** languages (GAP-3.5).
- **`acquisition`:** archive limits and formats (GAP-3.4).
- **Retirements:** each retired module or part is removed from `modules.json` in the entry that retires it, with its tests moved to the parity corpus.
