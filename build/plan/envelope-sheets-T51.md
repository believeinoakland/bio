# Spreadsheets and tables read over their whole envelope: the architecture, the state of the code, the cause families, the bounds, the corpus (K4798, K4785 (1)-(3))

**Status** · DRAFT for BOB, written by SHEET #1 (`session_01C8u1NQNVty8dLtj76kn125`) on `prep/account3-sheets`, from `origin/tranche/T51` at 5ac9380e00. This is a plan: no code and no requirement was changed. Nothing was run against biosmoke8 or any live site; no secret was read or printed; no safety check refused anything. Planned under K4798 (Bob: "research to the point of understanding the overall architecture and state of the code for other major data types - image scans, spreadsheets, etc."), K4785 (the PDF treatment this copies), K4571 (never a silent partial read), K4630 (large files are read, never failed), K4632 and K4636 (adding is not interpreting; every document read whole, structured data interpreted selectively), K4628 (the beta's file standard: spreadsheets 50 MB or about 1M rows, read whole, searchable to the last line, citable), K4426 (the four fields), K1881 (a bound that changes what a member may do is Bob's) and P17. The model is `build/plan/pdf-envelope-T51.md` on `origin/prep/account3-pdf`; its headings are kept so the two read side by side.

**Read whole for this plan.** I read these myself: K4785, K4798 (`rulings.md`); K4571, K4630, K4632, K4636, K4628 (`rulings-active.md`); `fix-round-7-T51.md` §0; `requirements/csv-reader.md`, `sheet-worker.md`, `workbooks.md`; `modules.json` for the nine modules; and, in source, the lines named in §2 and §3 that I checked again (`csv-reader/index.mjs:270, 478, 508, 748-753`; `calculations/tables.mjs:268-272`; `odf.mjs:228`; `extraction/index.mjs:100`; `reading-pipeline/index.mjs:40-61, 1385-1397`; `calculations/index.mjs:506-516`; `screens-intake/capture.mjs:507`).

Seven helpers (sonnet, medium) read the rest in shares, each over 150 KB or many files. Each wrote a findings file; every claim in it carries file:line and is marked **code** (read at the line), **ran** (a probe, read-only, outside the repository) or **hypothesis**. Where this plan states a fact from a share it gives the share letter. Their files are at `/tmp/claude-0/-home-user-bio/32fa5071-2f16-5681-8576-dafac2cc235c/scratchpad/out/`, named A to G (scratch only; this file is the deliverable).
- **A. csv-reader and xlsx:** `csv-reader/index.mjs` (all), `csv.mjs`, `formats-xlsx.mjs` (all), the `ooxml` bounds, the requirements `csv-reader.md`, `office-readers.md`, `ooxml.md`, the csv and office-readers tests, plus about 14 probes (node 26).
- **B. ODS and sheet-worker:** `odf.mjs` (all 2,431 lines), `odf-reader.md`, `sheet-worker.md`, all of `sheet-worker/` (its 34 node tests re-run: pass), the odf tests, plus 4 probes.
- **C. workbooks, calculations, money:** the four requirements, `workbooks/*.mjs`, `calculations/{tables,patterns,application,schema}.mjs` and `index.mjs` whole, the money ingest, plus 4 probes.
- **D. the spine:** `file-safety`, `reading-pipeline`, `extraction`, upload and capture, the ledger (`plane/pending.mjs`), plus 8 probes.
- **E. the older causes:** every cause entry of the T51 fix rounds 4b, 5, 6 and the round 7 pointers, with the diagnoses and audits they cite.
- **F. the newer causes and the walks:** `fix-round-7-T51.md`, its reviews, `rewalk7-found.md`, the walk records of re-walk 7, 6, 5, 4, the first re-walk, the live and build walks, the coverage map, plus 11 probes (among them the reproduction of re-walk 7's comma CSV).
- **G. tests, the harness and the platform's shape:** `plane/shape/`, `test-support`, `runtime-limits`, plane R77, R84, R85, R93, every sheet or table fixture in the repository, and two real runs of the shape probe (`xlsx`, `csvmax`).

**Not read by anyone, and so not claimed:** `diagnosis-R6-idle.md` beyond its first 4.5 KB; the two round 7 reviews of G83 and G84 (keyword scan only: they are about placement and start-up); the bodies of the PDF-only causes. Nothing was run in workerd: every probe is plain node, so bytes, rows, calls and heap are exact indicators and times are not (R-CLOCK). Where a finding depends on workerd it says **hypothesis**, and §6 puts the L run first.

Evidence words, as in the PDF plan: **code**, **ran**, **hypothesis**.

---

## 0. In short

**Why spreadsheets "work, then fail again later".** Three reasons, the same three as the PDF's.
1. **No stated envelope.** Not one requirement of the nine modules states the largest spreadsheet that is read, in bytes, rows, columns or cell length, and the five numbers that do exist disagree: CSV 17 MiB (`csv-reader/index.mjs:270`), the workbook add 20 MiB and 50,000 cells (`workbooks/index.mjs:42-44`), the safe view 20 MiB (`file-safety/index.mjs:72`), any entry 24 MiB (`reading-pipeline/index.mjs:51`), xlsx 32 MiB of declared XML (`ooxml.mjs:191`). Bob's standard is 50 MB or about 1M rows (K4628). **No bound in the code reaches it** (D, G).
2. **Each fix was proved on the walker's file and on one entry path.** The 17 MiB CSV was the walker's file through G37, G40, G41, G48, G68, G79 and G82; each fix passed that file; the next shape found the next unstated bound. Seven of the causes were fixed on one path only (§1 of E: G15, G41, G43, E5/G41-f2, 4b-F7, G48, G64), and each sibling path was found by the next walk.
3. **The tests feed the readers their own builders' kind of file**: an ASCII, LF, comma CSV of four to six columns; an xlsx of three inline-string cells a row; an ODS of a few hundred cells. Every shape the member brings that differs (a Windows-1252 CSV, curly quotes, a stray quote, a Google Sheet, a merged cell, a header at every window join) is untested, and **several are broken today** (§3.3).

**The failure classes** (§3.1) are K4785's six, plus the extra ones the causes forced: SILENT (a partial read not stated), IDENT (one file known by the wrong key), FORMAT (not recognised as a sheet), PATH (a fix on one entry path only), SEAM (a producer and a consumer disagree on a shape), METER (a measurement that cannot see), SCHED (the alarm's behaviour) and STALE.

**The state of the code, in one line each (§2).** CSV is the most mature reader (windowed, held cells, yield, a proven piece-invariant record walk) but its text is lossy and its edges are untested; XLSX is bounded by declared XML, not by rows, and is re-parsed whole at every tick; **ODS is a second-class reader** (no held cells, no ranged read, no yield, one string, a cap of 262,144 carrying cells, and a reading that is deleted when it passes 1 MiB); `workbooks` is a whole-grid copy in SQL; tables are built from the reading's presentation text on one path and from the bytes on another, and the two disagree.

**The three findings that matter most (all reproduced; §3.3).**
1. **Re-walk 7's comma CSV is a certain cause and round 7's G64 diagnosis was wrong about the file (F, ran).** The reading cuts a CSV over 128 KiB into blocks and repeats the header line at the head of each (reading-pipeline R41, `index.mjs:1385-1409`); `declareTable` builds the table from the document's joined unit text (`calculations/index.mjs:506-515`; content R46), and drops only the first header line (`tables.mjs:268-272`). Reproduced on the walker's 324,100-byte, 18,098-row file: 18,100 rows, two undetermined cells at rows 7,317 and 14,636, sha `321789dd`, against `c0f8687a` for the bytes. The tab copy "FIXED" proved nothing: a `.tsv` is read as plain text and never takes this path.
2. **Any ODS over about 6,400 to 6,800 cells has its reading replaced by a statement and no text index (B, D, E, F, ran).** The ODS entry ignores `inlineCellsMax` (`odf.mjs:2202`); about 164 bytes a cell; at 1 MiB the writer deletes the reading, units and all (`extraction/index.mjs:1096-1101`). A Google Sheet is captured as ODS (`drive.mjs:76`). Round 6 chose it and round 7 called it "by design" (`fix-round-7-T51.md:322`); it contradicts K4571, K4630 and K4636. DOCX table cells (about 9,000) have the same cliff.
3. **A CSV in UTF-8 loses every cell holding a capital accent, a curly quote, a dash, a CJK character or an emoji (A, ran).** The reader decodes the body with a `TextDecoder("latin1")`, which is windows-1252 (`csv-reader/index.mjs:508`), then rebuilds the bytes by `charCodeAt` into a `Uint8Array` (`:751`), which truncates; a UTF-8 sequence with a continuation byte in 0x80-0x9F comes back wrong and the cell is `null` with a false `invalid_utf8`. Measured loss: capital Latin-1 letters 26 %, general punctuation 45 %, CJK 62 %, emoji 100 %. No test has a curly quote.

**Defects found by this review that are not yet causes (§3.3, 41 items).** Most urgent after the three above: a stray `"` mid-field swallows the rest of the file into one cell with nothing flagged (A, F, ran); a reading tick of XLSX or ODS re-reads and re-parses the whole workbook every tick (D, ran); a transient failure on a later tick ends the read for good, half indexed (D, hypothesis from code); a size refusal of a CSV between 17 and 24 MiB or an XLSX over 32 MiB is worded "1 undecodable region(s)" and drops the size and the bound (D, ran); an ODS of 20 MB content is never read and nothing is owed (F; cause unknown, memory the likeliest, B); a CSV declared `application/vnd.ms-excel` or `application/octet-stream`, a `.tsv` and a `.xls` are not read as sheets (D, F, ran).

**The unstated bounds (§4)** are the ones today's code depends on that no requirement states: rows, columns, cell length, cells per sheet, sheets per workbook, formulas listed, the undetermined list, the declared XML a spreadsheet may carry, the zip entries and ratio on the reader path, the cell JSON a table or workbook holds, what a tick may do (bytes handed to an entry, longest synchronous stretch), the time to whole, CPU per tick (`bio-plane/wrangler.jsonc:175` sets none), the encodings, the delimiters and the number of lines that decide them. Twenty-eight (E-1 to E-28) are listed with a recommendation.

**Bob's** (§4.3). Eight decisions change what a member may do, each with a recommendation: **B-1** the byte and the row bound of a spreadsheet; **B-2** the shape limits (columns, cell length, sheets); **B-3** a time-to-whole promise; **B-4** workbooks of more than 50,000 cells; **B-5** `.xls`; **B-6** the preview of a large sheet; **B-7** dates and percentages as the member sees them; **B-8** windows-1252 and other older encodings. Everything else is BOB's (P17), recorded once in `rulings.md`.

**The corpus** (§5) has 72 generated files over the corners and their combinations, plus 16 seeded variations at every round end, from one seeded generator that knows the truth of every row. Each goes through the real entry path at the platform's shape (upload or capture, ticks to whole, the last row found by search and read back as cells, a table declared from it, money ingested from it) and is judged against one list of sixteen invariants (§5.3). The nine modules' own tests own the unit halves; the plane owns the shape runs. Nothing like it exists: the largest sheet any test reads through the plane is 17.0 MiB (289k rows) or a 200,000-row xlsx; there is no generator with a truth file; the CSV generator is copied in six places (G).

---

## 1. The architecture: how a spreadsheet or table flows from upload to a cell a member can search and cite

### 1.1 The kinds, and what reads each

| Kind | Reaches the reading as | Reader (module, path) | Held cells / ranged read | Largest read whole today |
|---|---|---|---|---|
| CSV (comma, `;`, tab, `|` found by signature) | `text/csv` declared (or `.csv` name when none declared); never from bytes (csv-reader R2) | csv-reader `csvEntry` (`csv-reader/index.mjs:945-1000`) | yes: R17 held cells, R18 `cellsIn`, R19 windows, R20 yield | 17 MiB body (R6, `:270`) |
| TSV / other delimited text | `text/tab-separated-values`, `text/plain`, `.tsv` | **none as a sheet**: plain text, one paragraph unit a line (D, ran) | no | 24 MiB (`WHOLE_READ_MAX`) as text |
| XLSX | ZIP + `xl/workbook.xml` by bytes (office-readers R2/R5) | office-readers `xlsxEntry` (`formats-xlsx.mjs`) | yes: R36 held cells, R37 `cellsIn` | 32 MiB of declared XML (`ooxml.mjs:191`); whole mode to 20 MiB |
| XLS (legacy OLE) | accepted by the picker (`screens-intake/capture.mjs:507`); `ole` to file-safety (`formats.mjs:72`) | **none** | n/a | never |
| ODS (and every Google Sheet, captured as ODS) | ZIP + `mimetype` first and stored (odf-reader R1/R2) | odf-reader `odsEntry` (`odf.mjs:1475-1883, 2187-2208`) | **no**: no `inlineCellsMax`, no `cellsIn`, no yield, no pieces (R48) | 20 MiB of `content.xml` and 262,144 carrying cells (R45), but about 6,800 cells before the reading is deleted |
| DOCX tables | paragraph units plus `tables[].cells` | office-readers `docxEntry` (`docx.mjs:1017`) | **no** held arm | about 9,000 table cells |
| HTML tables | visible text; each cell its own paragraph unit | reading-pipeline `blockTag` (`index.mjs:995-1200`) | n/a | as text |
| PDF tables | page text only | pdf-reader | none | as text |
| PPTX tables | shape text | office-readers `pptxEntry` | none | as text |

### 1.2 The flow, module by module, with the requirement each step serves

Numbers in brackets are this plan's step ids; "R" is the module's own requirement; "K" is a ruling. File:line is where the step lives.

**[1] Upload or capture: the bytes are held** (capture R86, R92, R93, R103, R107; acquisition R10, R11, R17, R96, R105; control-plane R123, R125; K4562; K4628)
- Upload: `captureupload` streams the body to `uploadCapture` (`capture/index.mjs:682-858`); parts of exactly 8 MiB (`UPLOAD_PART`, `:103`) each under its own digest in the evidence store (R2, content-addressed); a whole is kept in the request to `MULTIPART_KEEP_MAX` 32 MiB (`acquisition/index.mjs:368`, "CHOSEN, not measured"), past it by the ledger kind `keep`. Ceiling `CAPTURE_MAX` 256 MiB (`acquisition/index.mjs:359`). (D)
- Web capture: `acquire` through the host governor; a body over `LARGE_FETCH_BYTES` 8 MiB or slow (10 s) is parked as ledger kind `fetch` (`acquisition/index.mjs:398-399`, R105). A Google Sheet is fetched as an ODS export (`drive.mjs:76-77`). Only the server's header gives CSV its type here. (D)
- **Is it a sheet?** `profileOf` (`acquisition/index.mjs:1895-1950`) passes only a text type to `detectFormat` (`:1928`); `textTypeOf` names `.txt`, `.md`, `.csv` when none is declared (`:146-156`), valid UTF-8, no NUL, at most 8 MiB. A multipart xlsx is `undetermined` at intake and re-detected from the bytes at read time (reading-pipeline R2, `index.mjs:2385-2386`). **Three paths made this decision one at a time** (E5, G41-f2, R107). (D, E)

**[2] file-safety: judged from its own bytes, in parallel with the reading** (file-safety R1, R6, R11, R12, R14, R21, R22, R32, R45, R51)
- Reads the first 1 MiB (`HEAD_MAX`), the whole of a ZIP or OLE up to `GRADE_READ_MAX` 20 MiB (`file-safety/index.mjs:72`), never past it. Its own format detection (`formats.mjs:62-82`) names `csv` from bytes (`looksDelimited`, `:49-57`: comma, tab, semicolon over 50 lines) **against csv-reader's rule that bytes never answer**.
- Active content (macros, Excel 4.0 macro sheets, ActiveX, OLE objects, embedded files, external links) is named from the entry's `structure()` and never run (R14, R32). Zip bomb: declared sizes summed before inflation, a lying size stops at declared+1, archive limits `ooxml.mjs:265-275`. Formula injection: nothing computes or follows a formula; no code writes a CSV; the XLSX export writes strings as `inlineStr`. (D, ran p4)
- **The safe view** of a spreadsheet is the first 1,000 cells of a sheet, 20 sheets, 5,000 cells in all, 512 KiB of cell JSON handed to the entry, and an ODS of at most 8 MiB declared (`formats.mjs:112-116`, R11 as amended by G44). Over what it can show it answers `PREVIEW_NOT_DRAWN` or `TOO_LARGE` with size and bound, never an empty table. XLS: `NO_SAFE_VIEW`. An upload is always graded `high` (`source_not_fetched`). (D)

**[3] Format detection for reading** (format-registry R10, R11, R14-R16, R23, R26; csv-reader R2)
Twelve entries in order: html, pdf, docx, xlsx, pptx, odt, ods, odp, csv, jpeg, png, zip (`formats.mjs:152-348`). Bytes outrank a declared type, except CSV, which has no bytes signature. **XLS has no entry**; a CSV declared `application/vnd.ms-excel` or `application/octet-stream` is "not read as text", `failure: final` (reading-pipeline `index.mjs:2725-2728`; D, F, ran). The dialect (`encoding`, `delimiter`) is read from the signature window (first 1 MiB, 50 complete lines) and recorded as `reading.dialect` (csv-reader R7; K1448).

**[4] The reading: reading-pipeline `read`** (reading-pipeline R2, R10, R13, R15, R23, R28, R32-R35, R37, R40-R44; K4571, K4630, K4636)
- **Bytes** (`bytesOf`, `index.mjs:2281-2316`, R2/R37): a whole over `WHOLE_READ_MAX` 24 MiB is never loaded; the reading is `final` and says its size; a multipart capture is assembled only to `MULTIPART_READ_MAX` 20 MiB if no whole is held.
- **Entry call** (`:2570-2577`): `entry.parts(bytes)`, then `entry.text(parts, {inlineCellsMax: 512 KiB (R28, R44), yieldNow})`. The sheet answers `{name, rows, cols, usedRows, usedCols, range, text, lineRows, cells | null, cells_held, undetermined}`.
- **A unit** (R15, `allUnitsOf`, `:853-874`): one unit per sheet whose reader named its used range. The sheet's text is its rows as lines of tab-joined **non-empty** cells; **empty cells are dropped and row numbers are not in the text** (`csv-reader/index.mjs:842, 853`; `formats-xlsx.mjs:1054-1058`; `odf.mjs:1809-1819`). A unit over `CAPTURE_TEXT_UNIT_CAP` 128 Ki characters is, **in pieces mode (a cursor passed)**, carried as blocks of whole lines with the **header line repeated at the head of each block** and the extent `A{first}:{lastCol}{last}` from `lineRows` (R41, `:1385-1467`); with **no cursor** it is cut and flagged `truncated` (R15, `:905-931`).
- **Pieces** (R40, `:1239-1250`): a piece is the units that fit 2 MiB (each charged its UTF-8 bytes + 128) and 4,096 units, at least one. The cursor kinds are `t` (text window), `u` (a list of units of an entry's text: **xlsx, ods, docx, pptx**), `p` (PDF page) and `w` (a byte window, G68).
- **The tick, by kind** (D, ran):
  - *First tick of any sheet:* the whole object, `parts`, `text` over all of it, the units plan for the whole text, classification of the text (a 1.5 MiB sample for a sheet over 2 MiB, stated: `readtext.mjs:270-271`, G48), the provenance digest, the reading JSON.
  - *Later tick, CSV with a `w` cursor:* a ranged read of one 1 MiB window (+64 KiB slack, doubling to find a record boundary) and the first 1 MiB + 3 bytes again as the head for the dialect; at most 3.3 MB served a tick (ran). The cursor is made only for CSV, held whole, utf-8/us-ascii/undetermined, with `lineRows` (`:1749-1778`).
  - ***Later tick, XLSX or ODS: the whole object is read again, `parts` and `text` run over all of it again, the plan is rebuilt for the whole workbook, and the piece is cut at index `i`** (`:2570-2577, 2651-2670`). Ticks = unit text / 2 MiB; total work = ticks × a full parse (ran: each of two ticks served the whole file and cost 1.3 to 2.0 s at node speed for 19 to 25 MiB declared).

**[5] The ledger: ticks to whole** (plane R77, R91, R92, R94; `plane/pending.mjs:60-71, 142-202, 362-366`)
Row `(sha, kind=reading)`; one heavy row per alarm (`:365`); backoff 15 s doubling to one hour, for ever; a started row found by a later alarm is an interrupted run, the third ends it final "the reading did not finish; the object stopped" (`PENDING_INTERRUPTED_MAX` 3, `:63, 193-202`). The cursor lives in `capture_text_state` (`extraction/index.mjs:1402-1409`). **The door** defers a non-PDF over `READING_DEFER_TEXT_BYTES` 3 MiB to the ledger (`control-plane/index.mjs:217, 746`); over `READING_STATEMENT_MIN` 24 MiB the reading is only a statement.

**[6] Extraction: persistence and the index** (extraction R22, R36, R70, R82-R84, R90-R98; K4636)
- `writeReading` (`extraction/index.mjs:1087-1178`): the reading row (JSON at most `READING_ROW_MAX_BYTES` 1,048,576; **over it the whole reading is replaced by a stated final reading with no units and no references**, `:1096-1101, 1184-1203`, R96/R97), the history copy, `capture_text` one row per unit, `capture_text_fts` (FTS5 `unicode61`, `:580`), `capture_text_skipped` named gaps, `capture_text_state`.
- The index takes at most `CAPTURE_TEXT_CAPTURE_BOUND` 2 MiB and 4,096 units **each piece** (`:91-92, 1356`, R22 as amended by G13).
- "Whole" is `capture_text_state.state` = `whole` only when nothing is over bound, skipped, unaddressable or truncated and nothing more follows (`:1393-1399`); `words_read` against `words_total` states how much; `readingFor` answers `completeness`, `read_through`, `total` (R90, R91).
- `cellsOf` (`:1639-1697`, R98): cells made on demand from the reading where it lists the sheet, else (a sheet in `cells_held`) from the held bytes through `cellsInRange` to `entry.cellsIn`, at most 20,000 cells a call (`CELLS_RANGE_MAX`, `:106`), `next_row` for the rest. **ODS has no `cellsIn`.**

**[7] Search and citation** (content R46, R52; text-chain R64, R93; K4628)
A search hit is an indexed **unit**, i.e. a block of rows `A{r1}:{lastCol}{r2}` of up to 128 KiB (17,772 two-column rows in the first block: ran). The unit text has no row numbers and no empty cells, and `lineRows` is not stored (`reading-pipeline/index.mjs:2162-2185`), so the row a snippet came from is found only by `cellsOf` over the block and a text compare. A citation is a `sheet-cell` or `sheet-range` extent (`content/index.mjs:1292-1340`); a range cited is read by `cellsAt` from the reading or from the held bytes, with `cells_truncated` and `next_row`, never shortened. The A1 shape is 1 to 3 letters and rows to 9,999,999 (`textchain.mjs:1514-1518`).

**[8] Declaring a table; money ingest and interpretation** (calculations R1, R14, R18; money R1-R4, R31; K4632, K4636)
- **Declare** (`calculations/index.mjs:522`, a member's act): the source is one content id. A **sheet-range or cell** is read by `content.cellsAt` (typed cells, `:487-505`), at most 20,000 cells, and **a longer range is refused `SOURCE_NOT_READ` instead of paged** (`:490`). A **document or passage** extent is read as CSV text: `content.passageText` (the units joined by a line feed, content R46), else the raw capture decoded as UTF-8 only, loaded whole **before** the size gate (`:506-516`). Rows go through `tableBuilder` (`tables.mjs:232-291`): canonical RFC 4180 UTF-8 CSV, CRLF, comma, streaming SHA-256 as the table's identity; at most `TABLE_MAX_BYTES` 20 MiB or `TABLE_MAX_CELLS` 1,000,000 (`tables.mjs:14-15`). Stored three times: evidence store, `calc_tables`, `calc_table_bytes` in 512K-character chunks.
- **Read** (`readTable`, `:659-671`): builds every row object of the table for any page; `limit` trims the page, not the load.
- **Money ingest** (`:1740`): a member's act; named rows or all with a stated reason; at most `INGEST_ROWS_MAX` 100,000; over 10,000 rows a background ingest in slices of 20,000 rows and 2,000 facts (G45, G55, G63). `#judgeRow` parses the amount cell with `parseFigure` (`calc-grammar/figures.mjs:95`) and resolves payer, payee and fund.
- **Workbooks** (`workbooks/index.mjs:223-289`): `addWorkbook` takes the whole capture into memory, runs `xlsxEntry.text` with `inlineCellsMax` 9 MiB, refuses at 20 MiB, 9 MiB of cell JSON or **50,000 cells**, then **inserts one SQL row per cell**; every later act loads every stored cell. Recompute asks `sheet-worker` through the `SHEET_WORKER` binding (`plane/wiring.mjs:145-153`): XLSX only, at most 9,000,000 unzipped bytes and 250,000 cells, its own IronCalc parse; ODS, CSV and XLS are `NOT_A_WORKBOOK`. (B, C)

**[9] Tables inside other documents.** DOCX table cells are paragraph units plus an inline `cells` list with no held arm; HTML table cells are separate paragraph units with row and column lost; PDF and PPTX tables are text. Only XLSX, ODS and CSV have addressable cells; DOCX has `doc-table` extents. (D, G)

### 1.3 What the architecture is, stated once

**One property is carried by CSV and XLSX and denied to ODS and DOCX:** the cells are *held in the file and made on cite* (K4636). Everything else a member sees follows from it: whether the reading survives 1 MiB, whether the text index exists, whether a range can be cited. The architecture the standard needs is one contract for every sheet-like kind (§6.2): *a reader that is resumable by row, bounded in memory by a window, yields between windows, holds its cells in the file, and states what it left.* CSV and (in pieces mode) XLSX approach it; ODS does not; XLSX's later ticks defeat it.

---

## 2. The state of the code: mature, fragile, duplicated, legacy, untested (each with file:line)

### 2.1 Mature (specified, tested with negative controls, measured at a shape)
- **The CSV record walk is piece-invariant.** `createRecordWalk` (`csv-reader/index.mjs:446-498`) carries `inQuotes`, `quoteOpen`, `skipLF`, the open field and row across feeds; tested for arbitrary cut points, 400 random rounds over the alphabet `a b , " \r \n ;` (`large-text.test.mjs:102-122`) and at the 1 MiB window edge inside `""` and between CR and LF (`g41-held.test.mjs:114-156`). (A)
- **Held cells and `cellsIn` for CSV and XLSX** (csv-reader R17/R18, office-readers R36/R37): 8 MiB CSV in a 64 MB old space (`g41-memory.test.mjs`); a 200,000-row workbook in a 56 MB child (`office-readers/g41-held.test.mjs:254`); `plane/g41-shape.test.mjs` reads 4, 8, 12, 16 MiB, the 17 MiB-less-8 KiB CSV and a 200,000-row xlsx through the real plane in a child capped at `128 + 39 - N`. (A, G; ran: xlsx PASS 2 ticks, peak 114.6 MB at cap 163; csvmax PASS 9 ticks, peak 146.9 MB at cap 150.)
- **`lineRows`** (csv-reader R16, office-readers R11, odf-reader R19): one row number per text line, quoted line breaks carrying their record's row. (A, B)
- **ZIP container reading** (`ooxml.mjs:451-713`): central directory is the authority, ZIP64, declared size checked before inflation, inflate stopped at declared+1, CRC verified. A lying size is stated in 17 ms; 60,000 entries read in 256 ms. (A, ran)
- **The size-guard marker** (`ooxml.mjs:208-221`): `over_size_bound`, `final`, with size and bound, used by CSV, XLSX and ODF alike. (A)
- **The ODF repeat meter** (`odf.mjs:200-271`): hostile repeats bounded in units and in copied characters; empty runs cost nothing; 8 tests with values at both sides of the bound. (B)
- **The ingest** (G45, G55, G63): counts, slices, retries, pieces at exactly `INGEST_INLINE_MAX`, restart; and table evaluation of 1,000,000 cells in a 128 MB heap (`calculations/tables.test.mjs:68-93`). (C)
- **The ledger's owed-work discipline** (plane R77): never forgets, third interruption ends final and stated. (D)
- **The safe view's bounds** for XLSX, ODS and CSV (`file-safety/g44-large.test.mjs`): a cut stated, never an empty table. (D)
- **sheet-worker as a unit**: pinned engine, refusals in order, no state between calls; 34 of 34 node tests pass (B, ran).

### 2.2 Fragile (works on the shapes the tests chose)
| # | Where | What | Evidence |
|---|---|---|---|
| F1 | `csv-reader/index.mjs:508, 590, 624, 748-753` | UTF-8 transport through a windows-1252 decoder; a field whose UTF-8 has a continuation byte 0x80-0x9F (minus five) is rebuilt wrong and becomes `null` + false `invalid_utf8` | A, ran |
| F2 | `csv-reader/index.mjs:478` (and `reading-pipeline/index.mjs:1726-1738`) | a `"` opens quote mode anywhere in a field; `12" pipe` swallows the rest of the file; both walkers agree, so pieces equal whole and both are wrong | A, F, ran |
| F3 | `csv-reader/index.mjs:475, 487` | `field += c` builds a rope; one field costs about 31× its size in heap (1 MiB: 33 MB; 4 MiB: 125 MB; 8 MiB: 249 MB); no field cap | A, ran |
| F4 | `csv-reader/index.mjs:372-417` | delimiter decided over the first 50 complete lines of the first MiB; one quoted newline, one ragged row, a title line or CR-only endings gives "no consistent delimiter" and the file is read as **one column**; quote state reset per line | A, D, ran |
| F5 | `csv-reader/index.mjs:285, 346-352` | encoding decided over the first 1 MiB; a UTF-8 CSV whose first MiB is ASCII is `us-ascii, certain`, and later non-ASCII cells become null | D, ran |
| F6 | `csv-reader/index.mjs:359-361, 831-840` | a windows-1252 CSV (Excel's default "CSV") has `encoding: null`; every cell with a high byte is `null`, **absent from the text line and the index**; 600,000 undetermined objects in a 5 MB file; the list is unbounded (the named `CSV_STREAMED_UNDETERMINED_MAX` at `:801` is defined nowhere) | A, D, ran |
| F7 | `formats-xlsx.mjs:164, 603` | XML by regex; `elements(xml,"row")` materialises every row object before any row is handled; a new `RegExp` per element visit (`:166`); whole mode needs 96 MB at 485,000 one-cell rows and runs as one synchronous 1.0 to 1.5 s stretch; `yieldNow` is passed (`reading-pipeline/index.mjs:2573`) and ignored (0 occurrences in the file) | A, ran |
| F8 | `formats-xlsx.mjs:521-530` | the shared-string list is always held whole (office R37 says so); 385k strings (20.5 MiB) survive at 64 MB; never tested at scale | A, ran |
| F9 | `formats-xlsx.mjs:742-755, 838`; `file-safety/formats.mjs:90-96` | `structure()` has no cap on formula items (160,000 formulas: 20.3 MB of JSON, 96 MB cap); file-safety calls the whole `structure()` only to read `active` | A, ran |
| F10 | `odf.mjs:1475-1566, 1523` | whole-string regex scan, 2 to 3 passes (`walkSheet` in `text` and again in `structure`, `odsRangeUnits`); about 1.2 KB heap a cell; **every carrying cell costs at least one repeat unit**, so the "repeat bound" is in fact a cap of 262,144 carrying cells for the whole workbook, shared across sheets (`:244`); heap edge about 100k cells / 14 MB content.xml at 128 MB, 140k aborts | B, ran (node) |
| F11 | `reading-pipeline/index.mjs:2570-2577, 2651-2670` | XLSX/ODS/DOCX/PPTX later ticks re-read and re-parse the whole object | D, ran |
| F12 | `extraction/index.mjs:881-885` | a transient failure on a later tick comes back without `more`; `#continueText` writes `more=0, cursor=NULL` and answers `READING_HELD`, which the ledger settles as finished | D, hypothesis from code |
| F13 | `reading-pipeline/index.mjs:1385-1447` | the wide-header cases: a header of H characters costs H+1 in every block (12,000 columns × 300 rows: 10.5 MB file, 32.4 MB indexed); a header over the cap indexes no data row; `longRow` flags every block `truncated` for a long header alone | D, ran |
| F14 | `textchain.mjs:1514-1518` | A1 shape is 1 to 3 letters; a CSV or ODS of more than 18,278 columns has `canonicalRange === null`, every block has one address, only the first is stored | D, ran |
| F15 | `calculations/index.mjs:506-516` | the table from a document extent: header repeated at every block, empty cells dropped, quote/tab/newline damage; raw fallback loads the whole capture before the size gate and decodes UTF-8 only | C, F, ran |
| F16 | `calculations/index.mjs:490, 500` | sheet-range → table keeps neither the range's empty leading columns nor its blank rows; the declared header is never bound to the source's own first row | C, ran |
| F17 | `calculations/index.mjs:659-671`; `workbooks/index.mjs:166-182` | `readTable` is a whole-table materialiser (a `limit:1` on 150,000 rows builds 150,000 row objects); workbooks' sight check re-reads every bound table in full on every act | C, ran |
| F18 | `workbooks/index.mjs:245, 276-285` | `addWorkbook` interprets every cell at add (one SQL row each; contrary to K4632), throws `TypeError` on a `<c>` with no `r`, and silently drops unreadable and duplicate references with `ok: true` | C, ran |
| F19 | `extraction/index.mjs:1096-1101` | the 1 MiB reading-row guard deletes the whole reading (units, references) when cells are inline; its only protection is that XLSX and CSV hold their cells | D, E, ran |
| F20 | `sheet-worker/src/member.mjs:178, 272-274` | `inspect` outside the try; the R2 object loaded whole before any size test; `TIME_LIMIT` measured around the load only, unproven under workerd's frozen clock | B, code |

### 2.3 Duplicated (the same fact decided in several places)
1. **CSV record parsing, three ways with three rules:** `createRecordWalk` (tolerant, quote anywhere; `csv-reader/index.mjs:446`); `scanBoundaries` (byte-level, same rule; `reading-pipeline/index.mjs:1726-1738`); `csvScan`/`scanCsv` (strict RFC 4180, a quote inside an unquoted field is an error; `calculations/tables.mjs:39-99`). A file the reader reads is `SOURCE_NOT_READ` to the table declarer. (A, C)
2. **CSV or not: three sniffs.** csv-reader by declared type only (R2); file-safety `looksDelimited` by bytes (`formats.mjs:49-57`); `textTypeOf` by name (`acquisition/index.mjs:146-156`). The same bytes are `csv` to the safe view and "not read" to the reading when declared `application/vnd.ms-excel`. (A, D, F, ran)
3. **Delimiter signature, twice:** csv-reader R7 and `calculations/index.mjs:123, 311-313` (`delimiterWindow`, `1 << 20`). (A, C)
4. **A1 parsing, five times:** `workbooks/cells.mjs:24-28`, `calculations/index.mjs:494-496`, `extraction` `cellAddress` (`:58-66`, 4-letter columns), `content` `a1ToRowCol`, `formats-xlsx` `a1Corner`/`a1Col`; text-chain allows 3 letters, extraction 4. (C, D)
5. **The block cut, twice "line for line":** `sheetBlocks` (eager) and `sheetPlan` + `sheetBlockAt` (lazy) (`reading-pipeline/index.mjs:1385-1467`); they differ for an over-long header (the plan returns null). (D)
6. **`decodeXmlEntities` twice:** `formats-xlsx.mjs:141` guards `> 0x10FFFF`; `ooxml.mjs:722-730` does not and throws `RangeError`, so a `docProps/core.xml` with `&#x110000;` makes `xlsxEntry.text()` **and** `structure()` throw (ran) — against office-readers R21 and ooxml R25 "never throws". (A)
7. **Five cell caps:** `CELLS_RANGE_MAX` 20,000 (`extraction/index.mjs:106`), `CELLS_IN_MAX` 20,000 (`formats-xlsx.mjs:1130`), `SAFE_VIEW_CELLS_MAX` 1,000, `WORKBOOK_CELLS_MAX` 50,000, `MAX_CELLS` 250,000 (sheet-worker). Five "big file" byte bounds: 17, 20 (workbook), 20 (grade), 24, 32 MiB. (C, D)
8. **The CSV test generator, six copies:** the plane harness `csvChunks` (`plane/shape/harness.mjs:162-182`), csv-reader `g41.mjs:11` and `g41-memory-child.mjs:10-14`, extraction `g41.test.mjs:29-35`, content `g41-real.test.mjs:12-16`, plane `r7-contention-entry.mjs:20-26`, capture `g41b-t51.test.mjs:14-23`. (G)
9. **The table text copied twice** into `calc_table_bytes` (`calculations/index.mjs:590-592` and `2320-2322`); cell JSON held up to three times (reading ≤ 512 KiB, `workbook_cells` ≤ 9 MiB, table bytes in evidence and SQL). (C)
10. **`RATIO_DEFAULT`, `numText`, `figureOf`/`plainDecimal`** in `workbooks/export.mjs:18` and `cells.mjs` beside calc-grammar. (C)

### 2.4 Legacy (kept for a reason that has passed)
- csv-reader's header still describes COFF-6's figure "REUSED" and a piecewise `walkRecords` story; the live rule is `:258-269` (G41). csv-reader R6's first sentence says 20 MiB and its second 17 MiB, in one requirement. office-readers R12 says text is "refused" over 20 MiB; R35 supersedes it. office-readers R11 says "furthest CELL (not styled row)"; the code counts styled empty cells. sheet-worker's Size paragraph says the wasm is about 2.3 MB; it is 1,866,957 B (`contract.mjs:57`). reading-pipeline R41 says "Nothing is cut"; the code cuts a row over 128 Ki and flags it (`index.mjs:1403`). (A, B, D)
- `csv.mjs` is a one-line re-export kept "for K3268". `ODT_ROW/ODS_ROW/ODP_ROW` exported and unused. (A, B)
- Pre-G45 `calc_ingests` rows without `state`; calculations created before T34 with no `input_shas_json`; pre-G41 `calc_inputs.engine_json` NULL (`calculations/schema.mjs:247-251`; `index.mjs:405-411, 1516, 1945-1957`). (C)
- The old unit path without pieces still serves `op=acquire` (`reading-pipeline/index.mjs:905-931`) and cuts a sheet at 128 Ki. (D, E)
- `.xls` deliberately unread (`docs/development/OFFICE-FORMATS.md:284-298`) yet offered by the picker. (D)

### 2.5 Untested (no test found by name or grep; each is a corpus file in §5)
UTF-8 fields with the 0x80-0x9F bytes (curly quotes, É, CJK, emoji); a stray `"`; CR-only line ends; UTF-16 without a BOM; a quoted newline, a ragged row or a title line in the first 50 lines; a field over 1 MiB; a 1M-row CSV; more than 20,000 columns; a Latin-1 file of 100k+ cells; a UTF-8 CSV whose first non-ASCII byte is past 1 MiB; a CSV declared `application/vnd.ms-excel`; a `.tsv`; any xlsx with a large shared-strings part, shared formulas, merged cells, rows or cells with no `r`, a styled empty cell far down, a `<dimension>` far from the cells, 100+ sheets, an honest deflate bomb read through `xlsxEntry`, or a formula-dense sheet near 20 MiB; the real XLSX and ODS entries across more than one tick at scale (the piece tests use stubs: `pieces-formats.test.mjs:77`, `g48-cases.mjs:36-48`); an ODS read to the end by the ledger; covered table cells, cell annotations, `calcext:*`; a transient store failure on a later tick; a table declared from a document extent of more than one 128 KiB block (the calculations fixture's `unitsOf` is empty, so it always takes the bytes path: `calculations/fixture.mjs:198-201`; the seam test declares 120 rows: `t51-round7-seam.test.mjs:200`); `readTable` over a few MB; export above toy size; money amounts with a percent mark, a currency mark that disagrees with its column, a European separator; `addWorkbook` with a cell lacking `r`; the Document screen's "Next page" for a sheet; web capture of a sheet (the harness feeds `uploadCapture` only). (A, C, D, F, G)

---

## 3. The cause-family review (K4785 (1))

### 3.1 The failure classes, the causes in each, and the invariant broken

"None stated it" means: no requirement or ruling, before the cause, said the thing that was broken. That is the finding that recurs: **the first statement of the invariant came after the cause** in most rows.

| Class | What it means for a sheet | Causes (spreadsheet- or table-touching) | The invariant broken, and where it was stated |
|---|---|---|---|
| **MEM** memory at size | a reader or a consumer holds more than the object's 128 MB less its idle (about 78 MB) | 4b-F7, E2-roster, G37, G38, G39, G40, G41, G44, G46; and open: F3, F6, F10, F17, S-2, S-28 | csv-reader R19 (an 8 MiB body in 64 MB) and the "measured at the plane's shape" bounds, stated **after** G41; for ODS, the 20 MiB bound is documented as "what a reader may hold" but measured only for docx/xlsx/pptx/csv text (`ooxml.mjs:~168-185` has no ods row). None stated it before |
| **WORK** work per tick | a tick or an act does more than the bar (10 s a tick, K4670; 2 s an act, K4354) | G5, G37, G48, G55, G63, G68, G79, G82; open: F11 (xlsx/ods re-parse), F7 (1 to 1.5 s stretch), S-20 (`cellsIn` quadratic) | K4354 and K4670, both rulings; **no requirement of the nine modules states a per-tick bound**, and R-CLOCK forbids asserting compute time, so a counted bound is what a requirement must state (§4.4) |
| **ENC** delimiters and encodings | the file is not a comma, UTF-8, LF file | **G64** (the only delimiter cause), E5, G41-f2 (is it text); open: F1, F2, F4, F5, F6, S-6 | csv-reader R7 states the signature, not that a member's file in a common encoding is *read*. No cause before G64 put a foreign file through a real path; the one measured corpus is 166 CSVs from one city's portal (`csv-reader/index.mjs:61-62`). None stated it |
| **PIECE** piece boundaries | a block, window or unit boundary leaks into a consumer or loses data | G13/G14, **G15**, G40 (words across blocks), 4b-F2, **G64 as re-diagnosed** (the repeated header), 4b-F3 (a part digest for the whole); open: F2, F13, F14, S-13 | reading-pipeline R35 ("`words_read` … equal when the whole text was read"; violated G40, stated), R41 (stated the repeat as presentation; **the seam to content R46's join and calculations R1 was never stated**) |
| **STATE** state between ticks | what a tick leaves for the next | 4b-F2, G15 (cursor vs no cursor), G48 (first tick vs later), G68, G82, G70 (unnamed); open: F11, F12 | plane R77 (never forgets), reading-pipeline R40 ("read whole in pieces by a cursor"); R77 does not say a transient later failure is retried, and the code ends the read |
| **SHAPE** the platform's shape | the 2,098,176 B SQL value; 1 MiB stored; 128 MB; 8 MiB parts; workerd's frozen clock | G41, G43, G44 (answer 10.9 MB), G45, G46, G47; open: F19 (ODS/DOCX: S-1), F17 | **none stated it**: the value limit was a code comment at `record-core/schema.mjs:33-35`; R96 states the 1 MiB reading row since G41 |
| **SILENT** a partial read not stated | K4571 | G13/G14, G15/S2, G16, G43/B39, G44 (empty view), 4b-F7 (the word "undetermined"); open: F2 (stray quote), F6, S-8 (the cause hidden), S-26 (silent drops), S-2 (ODS never read, nothing owed) | K4571, then reading-pipeline R15 (names what the wire leaves out) — "no screen draws the skipped runs" (E). The silent cases found since are not in a requirement |
| **IDENT** one file known by the wrong key, or one workbook by three renderings | a part digest for a whole; a format key `undetermined`; the same sheet searched three ways | 4b-F3, G6, G12d, G41-f1, G64; open: S-11 (xlsx raw serial vs ods displayed vs csv field), S-12 (block not row) | R72 (a capture is found by its whole sha), stated after |
| **FORMAT** not recognised as a sheet | declared type or name is the only evidence for a CSV | E5, G41-f2, G41-f1, G76, G40 (word counts); open: S-10 (`application/vnd.ms-excel`, `.tsv`, `.xls`) | csv-reader's header calls it "a real gap" (`:55-58`); no requirement says every entry path applies one rule |
| **PATH** a fix on one entry path | the sibling path found by the next walk | **G15, G41, G43, E5→G41-f2, 4b-F7, G48, G64** | none stated that a fix holds on every path to the same fact |
| **SEAM** a producer and a consumer disagree on a shape | | **G64 re-diagnosed** (R41 ↔ content R46 ↔ calculations R1), G61 (ingest kinds ↔ queue catalogue), F16 | queue R11 stated the refusal not the cross-check; none for G64 |
| **METER** the measurement cannot see | | G67 (`last_ms`), G69 (`last_mem`: `process.memoryUsage()` is zeros in workerd); the harness's in-tick sampler (G §10 D2) | plane R77 states the fields; not that they be true |
| **SCHED** the alarm's behaviour | | G70 (a 17 MiB CSV took 19 minutes in one run and 64 s in another; the watchdog never reported a 9-minute stall; cause unnamed after two walks) | K4565/K4566 (the watchdog), not the pace |
| **STALE** an old stored reading | | G76's held old profiles; F-style: tables declared before G64 "re-declare" | R-OLD (stored-data fixes say "new data only" or repair) |

### 3.2 The named causes, one line each (spreadsheet or table; the full entries are in E and F)

| Cause | The member saw | Root cause (file:line) | Class | Invariant | Fix, and whether on one path only |
|---|---|---|---|---|---|
| **4b-F7** (`cause-office-size`) | a workbook, CSV or ODS over 20 MiB declared: no text, "undetermined", no size | `ooxml.mjs:141-156` `sizeGuard` refused above 20 MiB for five formats; streaming COFF-6 never built | MEM, SILENT-by-wording | none stated (4b D5: "read in bounded pieces"); K4630 later | pieces for XLSX/CSV/docx; **ODF left out on purpose; CSV's half undone by G41 (K4652)** — one path |
| **4b-F3 / R72** | any file over one 8 MiB part: lookups by the whole sha "not held" | the register holds parts only (`screens-intake/capture.mjs:134-139`) | IDENT | none; R72 after | a `whole` row; three callers still wrong in verification; workbook add of a multipart xlsx whose whole is not kept: "not driven" (hypothesis) |
| **4b-F2 / R103** | an upload over 32 MiB never made whole | `capture/index.mjs:718` `keepWhole` returns above `MULTIPART_KEEP_MAX` | STATE | none (R96 only for `acquire`) | `keepLater`; the upload arm lacked what `acquire` had — PATH |
| **E5** | a pulled `.csv` "was not read as text" | `doorbell/index.mjs:652` ignored the stored `media_type` | FORMAT | none | one helper `textTypeOf` for capture and doorbell; **multipart and `acquire` stayed separate** |
| **E2-roster** | the plane cannot read a 1,300-page PDF; the same code later killed a 1 MB CSV | roster detectors copy every line of the text (`roster-reader/lines.mjs:178`) | MEM | none (docprofile R38 after) | line-by-line detectors |
| **G5** | a 12 MB text read in the upload request (27.2 s) | `control-plane/index.mjs:733-748` deferred only PDFs over 2 MiB and anything over 20 MiB | WORK | K4354 | size rule by format (now 3 MiB); the `existed` path too — PATH (`acquire` vs `captureupload`) |
| **G6 / G12d** | "Nothing here" for a file over one part | a part's digest taken for the document (`capture/index.mjs:246`, `:1594`) | IDENT | none | `BARE_DIGEST` refusal (reading-pipeline R39) |
| **G13 / G14** | a 12 MB text, then every format, read in part without saying so | 2 MiB / 4,096 index bound and a 512 KiB wire (`extraction/index.mjs:91-92`) | PIECE, SILENT | K4571 (after the audit); R15 (stated, not drawn) | cursor and pieces for every format (R40); `completeness`; the control-plane test never paged |
| **G15 / S2** | "a 1 MB CSV is about 12 % searchable" | a sheet was one unit cut at 128 Ki (`reading-pipeline/index.mjs:871-896`) | SILENT, PIECE | K4571, K4628; **no requirement said a line must carry its row** | blocks with the header repeated, rows from `lineRows` (R41, csv-reader R16); **cursor mode only — the no-cursor door read still cuts and indexes `whole` with `truncated: 1`** (ran, E) — PATH |
| **G16 / S3-S5** | Search and Find-in: no "more", `cells_truncated` not drawn | `finder-states.mjs:97-160`, `find-in.mjs:166-221` | SILENT | K4571 | planned; merge not verified by E |
| **G37** | a 1 MB CSV died at the 127 MB cap | classification of the whole text, twice; roster detectors allocate per line: 129 MB of garbage over 1 MB | MEM, WORK | none (R42 after) | classify once per read; still died until G40/G41 |
| **G38** | `op=reading` of a 1 MB CSV answered 12,872,074 B for 8 units | `readingFor` bounded by units not bytes (`extraction/index.mjs:1273-1299`) | SHAPE | none | R94 `READING_KEY_BYTES` 262,144, byte-bounded pages |
| **G40** | the reading of a 1 MB CSV was 11.27 MB; `words_read > words_total` | the reading stringified four times; the repeated header counted twice | MEM, FORMAT | reading-pipeline R35 (**stated, violated**) | one `{json, digest}`; counts from the same units |
| **G41** (biggest) | the 1 MB CSV's read threw `SQLITE_TOOBIG`; nothing indexed | every typed cell made and stored (147 B each) into one value over 2,098,176 B | SHAPE, MEM | **none stated it** (a code comment) | cells held in the file (`inlineCellsMax`, `cellsIn`, `cells_held`), a 1 MiB reading-row guard, `cellsOf`; **opt-in; CSV and XLSX only; ODS, DOCX, PPTX left out; two callers left unopted → G44** — PATH |
| **G41-f1** | `cellsOf` made no cells when `capture_format` was `undetermined` | `cellsInRange` has no entry for `undetermined` | FORMAT, IDENT | none | take the format from the reading's `text_container`; `containerKindOf` (`content/index.mjs:1441`) still trusts `undetermined` |
| **G41-f2** | a multipart CSV stored `undetermined`, "no content type declared" | `uploadCapture` computed the text type only `if (!multipart)` | FORMAT, ENC | R92/R93 "within one part" | the first part's head judged by `textTypeOf` (R107); non-UTF-8 past the head is stated per cell |
| **G43 / B39** | a sheet refused at filing, then filed with a cut reading | `promoteDocument` wrote the whole door reading (20 MB), then embedded a truncated unit | SHAPE, SILENT | K4571 | `PROV_EMBED_MAX` and "drop and follow" at the screen (`screens-intake/capture.mjs:165-178`); the index unchanged; **two of the three `cut` arms can never fire** (`capture/ops.mjs:195` carries a count, not `text_units_skipped`) — PATH |
| **G44** | a 10 MiB-declared workbook (221,376 cells) killed `addWorkbook` and the safe view; an empty table drawn | `workbooks/index.mjs` loaded the capture whole, `text()` uncapped, one SQL row per cell, every act loads all cells | MEM, SILENT | K4571/K4630; file-safety R11 | bounds 20 MiB / 9 MiB / 50,000 cells; safe view by `cellsIn`, 1,000 cells; **the whole-grid design stays (N1267); ODS stated by bound only; 16 % of 269 corpus workbooks refused as workbooks** |
| **G45** | a money ingest of many rows threw | three `TEXT` columns of 2.7 MB | SHAPE | K4571/K4630 as doctrine | parts above `INGEST_INLINE_MAX` 524,288; 100,000 rows |
| **G46** | a followed portal CSV never snapshots | `JSON.stringify(ds.rows)` repeats every header key | SHAPE, MEM | none | pieces; **a dataset over 4 MiB is stated, not read** (`following/index.mjs:85`) |
| **G48** | the first tick of a 17 MiB CSV took 16 s against 10 s | the whole text classified through 17 types twice; units made twice | WORK | R-CLOCK, K4670 | classify a 1.5 MiB view of a sheet, stated; **sheets only** — PATH (the 12 MB plain text again, G88) |
| **G55** | an ingest takes 1.8 ms a row | `combine` per call (`entities/index.mjs:1220`) | WORK | K4354 | held views; background ingest over 10,000 rows |
| **G61** | after a money ingest the Queue refuses `NO_SUCH_KIND` | `ingest-done` minted, not catalogued (`notice-producers/index.mjs:161-164`) | SEAM | queue R11 stated the refusal, not the cross-check | three kinds + a cross-check test; FIXED (RW7) |
| **G63** | `moneyingest` of 18,101 rows answered in 4.1 s | cause unknown (cold cache); logging planned | WORK, STATE | K4354 | a started path that reads no table bytes over 10,000 rows; FIXED (0.50 s), cause never named |
| **G64** | a tab-delimited source "declared as one cell a line"; then 18,101 rows for 18,098 | **re-diagnosed (F, ran):** the first row was a comma CSV; the table is built from the *reading's* text, which repeats the header per block | ENC → **PIECE, SEAM, IDENT** | **none stated it** (calculations R1 does not say a table has exactly the source's data rows) | round 7 fixed only the delimiter; **the repeated header is unfixed (re-walk 7 STILL)** — PATH |
| **G68** | every reading tick re-opens the whole object | `bytesOf` and the entry decode the whole 17 MiB per tick (`reading-pipeline/index.mjs:2000, 2250`) | WORK, MEM | R40 | byte-window cursor `csvWindowTick` (`:1785-1890`); **CSV and text only; XLSX/ODS/DOCX/PPTX still whole each tick** — PATH |
| **G70** | a 17 MiB CSV took 19 min once and 64 s once | **unknown**; the planned per-alarm log was not readable | SCHED | none | none; open |
| **G74** | a CSV filed into a project the member is not in: "Nothing is here" | access, not read | IDENT | K4557 | FIXED (RW7); not spreadsheet-specific |
| **G76** | a CSV profiled "an application that builds its pages in the browser" | `client-rendered.mjs:55-62` `NO_PROSE` on any non-HTML text | FORMAT | none | fixed; old profiles need a migration (RW7 did not test an old record) |
| **G79** | the 17 MiB CSV upload took 14.7 s | parts written, read back, re-hashed (`capture/index.mjs:754, 763`) | WORK | K4354 | FIXED (7.6 s) |
| **G82 / G86** | the reading tick holds the object's one thread | no yield | WORK, STATE | R93; csv-reader R20 | `yieldNow` for CSV; **XLSX, ODS, DOCX have none**; R93's real-read cases are printed, not asserted (`r7-contention.test.mjs:78-92`) |

**Walk findings with no cause entry yet** (re-walk 7; F): (a) the ODS with a 20.4 MB `content.xml`: upload 42.9 s, never read, nothing owed, "Unread" an hour later (`rewalk7-found.md:20`; cause unknown, no logging planned); (b) the 60,000-cell ODS (297 KB) "too large to keep whole: 9.2 MB" (`RW6/B.md:27`), dismissed as "by design" at `fix-round-7-T51.md:322`; (c) the 17 MiB CSV Document page first mark 6.5 to 10.3 s (`RW7/A.md:39`; cause unknown).

### 3.3 Defects this review found that are not yet causes (for BOB to place, fix round 8)

Ranked by what a member would lose. **S-1 to S-8 lose or hide data today and are certain (ran).** The id is this plan's; the share letter says who found it.

**Data lost, hidden or wrong now**
1. **S-1 · ODS and DOCX cells inline: a reading over 1 MiB is deleted, with its text index (B, D, E, F, ran).** ODS entry `odf.mjs:2202` takes one argument and ignores `inlineCellsMax` and `yieldNow`; 163.9 B a cell (`p3`); 1 MiB at about 6,400 cells (B) to 6,800 (D); writer `extraction/index.mjs:1096-1101`; ran: 6,000 cells 1,003,177 B kept, 16,000 cells (an 80 KB file) 2,692,909 B stated and unindexed; the existing test `extraction/g41.test.mjs:142-159` asserts the cliff. DOCX: `docx.mjs:1017` ignores the option; about 9,000 table cells. Class SHAPE, PARITY. K4571, K4630, K4636, K4628. Every Google Sheet is an ODS.
2. **S-2 · An ODS of about 20 MB is never read and nothing is owed (B, F, D).** Cause unknown. Candidate (B, ran in node, hypothesis for workerd): 20.4 MB `content.xml` is under the 20 MiB guard (`ooxml.mjs:114`), the ODS entry holds the string, the decode and about 1.2 KB a cell (185,000 cells), exceeds 128 MB, the object is killed, "a read the object does not survive returns nothing and is retried into the same end" (`ooxml.mjs:~187-190`), no row and no failure is written. 140k cells (19.8 MB) aborts at a 128 MB heap in node. The preview refuses first by `SAFE_VIEW_ODS_DECLARED_MAX` 8 MiB; **the reading has no comparable gate**. Class MEM, SILENT. K4571, K4630.
3. **S-3 · A table from a CSV document is wrong four ways (F, ran).** (a) the header repeats at every block (G64 STILL): 18,100 rows, undetermined 2, sha `321789dd` against `c0f8687a`; (b) an empty cell shifts the row's values left (`P100,,100` → `["P100","100"]`) with only an "empty" count; (c) an empty cell in the first 50 lines makes the tab count inconsistent and the declaration is refused `SOURCE_NOT_READ` "one cell per line", blaming the member's separator for a file the reader read; (d) a quote, a tab or a line break inside a value is refused or splits a row. All through one seam: `calculations/index.mjs:506-515` ← content R46 `notice.mjs:123` ← R41 blocks ← csv-reader's tab-joined text. The bytes path and the typed-cell path (`cellsAt`) are correct. The fix is a choice of source.
4. **S-4 · UTF-8 CSV cells lost through the cp1252 transport (A, ran).** `csv-reader/index.mjs:508, 751`. Loss when the file claims `utf-8`: Latin-1 supplement 26 % (all of À-ß: É, Ñ, Ü), Latin Extended-A 39 %, Greek 35 %, Cyrillic 39 %, general punctuation 45 % (every curly quote, dash, ellipsis, euro), CJK 62 %, emoji 100 %. A 6.9 MiB file with `’` in 300,000 rows: 300,000 undetermined cells. "Zoë", "naïve", "Müller" survive. **Reported as a data loss, not a doctrine** (the reader's rule "stated, never guessed" is kept; this is a bug in the carrier). Workerd follows the WHATWG labels: hypothesis, to be run first (§6).
5. **S-5 · A stray `"` swallows the rest of the file (A, F, ran).** `csv-reader/index.mjs:478`; `12" pipe,1` → 62 rows of a ~500,000-row 6 MiB file, 496,000 lines in one cell, `undetermined: []`, `counts.cells` 185, dialect "comma, certain". The window scan mirrors the rule (`reading-pipeline/index.mjs:1732`), so the windowed read agrees. Combined with F3 it is a memory kill (6 MiB: 193 MB peak). No requirement or test states a stray-quote rule.
6. **S-6 · The dialect fails all or nothing (A, D, ran).** One quoted newline, ragged row, title line or CR-only ending in the first 50 lines → one column; UTF-16 without a BOM → `us-ascii` with NULs in the text and `undetermined: []`; a UTF-8 file whose first MiB is ASCII → `us-ascii, certain` (F5); a windows-1252 file → every cell with an accent absent from the text and the index (F6). A first line longer than 1 MiB → "too few lines" (hypothesis).
7. **S-7 · A transient failure on a later tick ends the read for good (D, hypothesis from code).** `extraction/index.mjs:881-885`; `reading-pipeline/index.mjs:2263-2268, 2369, 2720-2724`. One R2 hiccup leaves the file indexed to `read_through`, `state` `partial`, no more work. Conflicts with K4630. Not run (the scripted provider in `round6.test.mjs` was not read whole).
8. **S-8 · A size refusal drops its size and bound (D, ran).** A CSV of 17 to 24 MiB and an XLSX over 32 MiB declared: the entry's marker is in `undetermined[0].guard` and reaches the reading as "the text of this document is undetermined (1 undecodable region(s)); a reading over text nobody decoded would be an invented one". The member is told "undecodable", not "over 17 MiB". (18,069,786 B and 21,296,141 B CSV; 33 MiB xlsx, 236,709 rows.) K4630: "only a file above its bound is refused, stated with its size".

**The beta standard is unreachable (K4628)**
9. **S-9 · No bound reaches 50 MB or 1M rows (D, G, A, B, ran).** CSV 17 MiB (a 1M-row CSV passes only if rows average under about 17 bytes: 8.9 MB read in 5 ticks, last row `A988065:B1000001`; a 30 MB 1M-row file is refused, stated); any entry 24 MiB; XLSX 32 MiB of declared XML = about 120,000 Excel-shaped rows or 236,709 three-cell rows (a 1M-row, 3-cell, **14 MB file** is refused: 132 MB declared); ODS 262,144 cells; workbook add 50,000 cells; safe view 1,000 cells; tables 1,000,000 cells = 100,000 rows of ten; the spreadsheet-range → table path 20,000 cells (C). An acceptance corpus today would test the refusal text, not a read.
10. **S-10 · Format identity (D, F, ran).** A CSV declared `application/vnd.ms-excel` (what Windows browsers commonly send for `.csv`: hypothesis for the browser) or `application/octet-stream` is "not read as text", final, while file-safety classes the same bytes `csv` and draws the preview; `.tsv` is plain text (no cells, no `sheet-range`, no row citation) — so re-walk 7's "tab FIXED" went through the text reader; `.xls` is offered by the picker, never read or previewed (`NO_SAFE_VIEW`), with no spreadsheet-specific sentence. N1266 lists `.xls` and TSV.
11. **S-11 · Three renderings of one workbook (D).** XLSX text is the raw `<v>` (a date is a serial like 45123; styles.xml is never read: `formats-xlsx.mjs:662-680`); ODS text is the displayed paragraph (`odf.mjs:1813`); CSV is the field. `2024-05-01` is found in a CSV and an ODS and not in an XLSX.
12. **S-12 · Search gives a block, not a row (D).** Unit text has no row numbers and no empty cells; `lineRows` and the per-cell `undetermined` list are not stored (`reading-pipeline/index.mjs:2162-2185`; `extraction/schema.mjs:283-294`); column position is lost in the text for XLSX, ODS and CSV alike (A, B, C).
13. **S-13 · Wide sheets (D, ran).** F13, F14: a header repeated in every block (3.08× index at 12,000 columns); a header over the cap indexes no data row; every block flagged `truncated` for a long header; columns past ZZZ have `range: null` and all blocks collide.
14. **S-14 · Every later tick of XLSX/ODS/DOCX/PPTX re-parses the whole object (D, ran).** F11. Ticks × a full parse: for a workbook at the 32 MiB ceiling about 16 ticks × about 48 s (hypothesis from the 1.5 s/MiB comment at `control-plane/index.mjs:215`); the third interrupted run ends the read final (`pending.mjs:193-202`). No test runs a real XLSX or ODS entry across more than one tick at scale.

**Silent or wrong smaller things (A, B, C; all ran unless marked)**
15. **S-15** XLSX shared-formula dependents get `formula:""` (`formats-xlsx.mjs:614, 695`); counted in `counts.formulas`.
16. **S-16** A row or cell with no `r` gives `usedRows: 0`, `range: null` with cells present (`:622-624`); `workbooks` throws on it (S-26).
17. **S-17** Styled empty cells extend the used range (`<c r="A900000" s="3"/>` → 900,000 rows; `:621`) against office R11.
18. **S-18** Merged cells: XLSX never reads `mergeCells` (B2 and covered cells are separate cells; unstated); **ODS `table:covered-table-cell` is never iterated, so every cell right of a merge shifts one column left** (a cell at C1 reads as B1: `odf.mjs:1507`, B ran) — wrong citations.
19. **S-19** ODS cell annotations enter the cell's displayed value (`note text\n5`; `odf.mjs:1518`); `calcext:value-type` overrides `office:value-type` (`:336-340`), so an error cell is `type:null`; a typed-empty cell repeated 16,384 times is refused after 16 rows; the `over_repeat_bound` marker lacks `final` (`:254-257`) while the size guard's has it (`:687`); `ODF_REPEAT_EXPANSION_MAX`'s meter is shared across sheets.
20. **S-20** `cellsIn` is quadratic: CSV re-walks from byte 0 (172 ms for rows 699,998-700,000 of 8.9 MiB), XLSX inflates and CRC-checks the whole sheet part per call (0.2 to 0.5 s) (`csv-reader/index.mjs:912`; `formats-xlsx.mjs:1218`).
21. **S-21** `ooxml.mjs:722-730` throws on `&#x110000;` in `core.xml` (see 2.3 item 6); `readContainer` has no entry cap and `readPart` no ratio check on the reader path (60,000 entries read; an honest 19.4 MiB part from 58 KB reads in 1.5 s) — unstated for the readers.
22. **S-22** The CSV `undetermined` list is unbounded (800,000 entries, 101 MB heap at 8.6 MiB) (A, D).
23. **S-23** The no-cursor door read still cuts a sheet at 128 Ki and indexes it `whole` with `truncated: 1`, the last row not found (E, ran); two dead `cut` arms at `screens-intake/capture.mjs:173`.
24. **S-24** The cursor-less xlsx run's `FIRSTROWMARK` appears in all 18 index rows because the header repeats (G, ran): a first-row marker proves nothing.

**Tables, workbooks and money (C; ran)**
25. **S-25** The spreadsheet range → table path stops at 20,000 cells and refuses `SOURCE_NOT_READ` instead of following `next_row` (`calculations/index.mjs:490`; `g41-cells.test.mjs:152`); the 1,000,000-cell bound is reachable only through CSV text.
26. **S-26** `addWorkbook` throws on a `<c>` without `r` (`workbooks/index.mjs:280`), silently drops unreadable and duplicate references with `ok: true` and no count (`:281-282, 286-287`).
27. **S-27** Sheet-range → table: an empty leading column or blank rows shift values into the wrong columns and lose row identity; the original header row becomes a data row; a money fact's `source.row` is the canonical index, not the sheet row (`:493-501, 1728`).
28. **S-28** `readTable` loads the whole table for any page (150,000 row objects for `limit:1`); the sight check re-reads every bound table per act (`:166-182, 659`); a `declareTable` at 20 MiB holds the source text, builder chunks, bytes, decoded text, evidence copy and SQL binds at once and was run only to 17.2 MB at a 150-160 MB heap (not the object's cap).
29. **S-29** The raw-document fallback loads the whole capture before the size gate and decodes UTF-8 only (`calculations/index.mjs:508-516`).
30. **S-30** Money ingest: `12%` becomes amount 12 (`:1722`); a currency column overrides a mark in the cell (`:1719`); `1,234` is read as 1234 and `1.234` as 1.234 whatever the source's locale; xlsx dates arrive as serials and are undetermined cell by cell; no fiscal-year header parsing; `1.234,56`, `1 234,56`, `FY2025`, `—` refused.
31. **S-31** Work: `draw` ranks every row by SHA-256 in one tick (1,000,000 hashes on a 1M-row table, `calc-grammar/draw.mjs:19-27`), re-run on every read; `interval` is O(n²) BigInt; a table result near 2 MB would throw `SQLITE_TOOBIG` (hypothesis); `exportRecipe` has no bound, writes past column XFD, base64s the whole file.
32. **S-32** The workbook bound is 5× under the engine's (50,000 against 250,000 cells), so 200,000 cells of recompute capacity are unreachable; sheet-worker's values (9,000,000 B, 250,000 cells, 120,000 ms) are in no requirement; `ENGINE_MEASURE` strings are literals pinned to nothing (`workbooks/index.mjs:51-57`).

**Process and platform**
33. **S-33** G70: the pace of the background read (19 min against 64 s) is unnamed; at the slow rate a 50 MB CSV is hours; the watchdog never called it stale.
34. **S-34** Not a table: HTML tables are cells-as-paragraphs with row and column lost; an all-links table wrapped in a `div`/`section`/`li` could be dropped as furniture (`reading-pipeline/index.mjs:1079-1121`; hypothesis); PDF, PPTX tables are text.
35. **S-35** `bio-plane/wrangler.jsonc:175` sets no `cpu_ms` and no memory key; `sheet-worker` and `file-scanner` set 300,000.
36. **S-36** Range-cell citation, "bind cells" in a claim check, `addworkbook` through a screen: never walked in any round (coverage map R35/R36/R83); no walker has cited a range of cells and read the cited text.
37. **S-37** Stale requirement text (2.4) and `csv-reader.md` R6 states two bounds in one requirement.

**Test infrastructure (G; the "why the tests kept missing them")**
38. **S-38** Two memory conventions: `capFor(N) = 128 − N` (PDF runs) against `128 + 39 − N` (sheet runs, `g41.probe.mjs:12-18`; D = 39 derived from an ASCII bundle idling at 49 MB while the committed bundle needs 85, `diagnosis-R6-g40.md:7`).
39. **S-39** The harness's in-tick peak sampler is created and cleared on the next line (`harness.mjs:254-255`): `peakMB` is a tick-boundary reading. Pass bars are node wall time (`TICK_MS_MAX` 10,000, `FIRST_TICK_MS_MAX` 8,000; csv `r20-yield` `< 500 ms`) against K4787 and R-CLOCK. Search is asserted `total >= 1` only. No faults (`restartAt`, `storeFailAt`).
40. **S-40** `bio-plane/package.json:6` `npm test` runs without the platform-sqlite preload that `module-tests.mjs` adds.
41. **S-41** The committed real-file set has no `.ods`, `.xls`, `.tsv` and no spreadsheet over 232 KB; `csv-reader`, `office-readers` and `odf-reader` do not list `test-support` in `uses`; the whole suite's last run stopped at its 2-hour limit before reaching `plane`, where the shape tests are (K4792).

### 3.4 Why the tests kept missing them (patterns; each is a requirement to the corpus)

- **P1. The fixture is the reader's own builder's kind of file** (E, G): ASCII, LF, four to six columns, short rows, inline strings, tens of cells in an ODS. S-3, S-4, S-5, S-6, S-13, S-15 to S-19 live where no fixture goes.
- **P2. Tested at the module, not through the seam** (F): the calculations fixture mints the content row on a document whose `unitsOf` is empty (`calculations/fixture.mjs:198-201`), so `passageText` is always null and the table always comes from the bytes — the path production does not take. The G64 test passes on a path production never takes.
- **P3. Tested at the wrong size.** 120 rows when a block is 128 KiB; 6,000 ODS cells when the cliff is 6,400; a 4 MB table when the bound is 20 MiB; the reader alone in a 56 MB child when the plane's idle takes 49 to 85 MB.
- **P4. Measured outside the platform's shape**: node, not workerd (no suite file checks memory in a real object; local workerd enforces none: G27's lesson); wall time in place of counts (S-39).
- **P5. A fix proved on the walker's path** (PATH): seven times. Each fix needs the sibling paths named (upload, multipart, `acquire`, pull, doorbell, the no-cursor door read, the cursor read) and a test through each.
- **P6. A "by design" that was a deferral.** Round 6 deferred ODS and DOCX tables (`fix-round-6-T51.md:186, 204`); round 7 wrote "by design … not a defect" (`fix-round-7-T51.md:322`); K4628 and K4630 came between. A deferral whose ruling has been overtaken is a defect.
- **P7. A verification that went through a different reader.** Re-walk 7's tab file was read as plain text; its "FIXED" proved nothing about the CSV path (F).
- **P8. The stated bound replaced a crash and was never lifted to the standard** (E): 17 MiB CSV, 50,000-cell workbook, 4 MiB portal, 100,000-row ingest, 1 MiB reading row, 8 MiB ODS preview. Each is stated to the member by a code; each is below K4628.
- **P9. A cause named from how a walker printed a row** (F): G64 was labelled "a tab file" with the mechanism "certain" while the plan said it "could not reproduce the exact 18,101". The fix for the wrong file shipped.

---

## 4. The envelope (K4785 (2)): every bound a table read depends on

### 4.1 How to read the table
"Today" is the value in code with its name and file:line. "Stated" is the requirement that states it, or **unstated**. "Recommended" is the bound this plan proposes; where it changes what a member may do it is marked **Bob's** (K1881) and is brought to him in §4.3 with an explanation, options and a recommendation, rendered, not as source. Every other bound is BOB's (P17): recorded once in `rulings.md` and written into the requirement named. K4628's tiers are the target: the beta (B) is **spreadsheets 50 MB or about 1M rows**; this plan writes the figure once as **E-1** and every other row derives from it.

**What the platform fixes** (not recommendations): the object's 128 MB (idle 85 to 88 MB in the node child, 49 MB for an ASCII bundle in raw workerd; D = 39 in `g41.probe.mjs`); the SQL single value 2,098,176 B and the stored reading row 1 MiB (`READING_ROW_MAX_BYTES`); 8 MiB upload parts; workerd's frozen `Date.now()` (R-CLOCK); the 10 s tick bar (K4670, BOB); the 2 s act bar (K4354); `bio-plane/wrangler.jsonc:175` sets no `cpu_ms`, so the CPU a tick runs under is the account's default (30 s per `corpus-export.md:75`: hypothesis for the deployed value).

### 4.2 The bounds

**Bytes and rows**
| Id | Bound | Today | Stated | Recommended |
|---|---|---|---|---|
| E-1 | **File bytes of a spreadsheet read whole** | CSV body 17 MiB (`csv-reader/index.mjs:270`); any entry 24 MiB (`reading-pipeline/index.mjs:51`); multipart assembly 20 MiB (`:47`); workbook 20 MiB (`workbooks/index.mjs:42`); grade 20 MiB (`file-safety/index.mjs:72`); upload keep-whole 32 MiB (`acquisition/index.mjs:368`); capture 256 MiB (`:359`) | csv-reader R6, reading-pipeline R2/R37, workbooks R1, file-safety R51, acquisition R10: five numbers, no one table | **50 MB per K4628**, written as 50 MiB = 52,428,800 B unless Bob prefers 50,000,000; **one table of big-file bounds** in `reading-pipeline` R37, every other module quoting it. Reading a file past 24 MiB needs ranged reads of the held object (§6.2): the object never holds the file. **Bob's (B-1)** |
| E-2 | **Rows** | none for CSV (`rows: null` by design, csv-reader R5); XLSX grid 1,048,576 (`formats-xlsx.mjs:370-371`, office R22); ODS 262,144 carrying cells (`odf.mjs:228`) | R5, R22, R45 (each its own) | **1,048,576 rows for every kind** (the grid every spreadsheet program has) beside E-1; a file within E-1 but over E-2 is refused with its row count; a CSV is not otherwise row-bound. **Bob's (B-1)** |
| E-3 | **Columns** | CSV none (a 20,000-column probe read: A); XLSX 16,384; ODS none (20,000 empties tested); `canonicalRange` null past ZZZ = 18,278 (`textchain.mjs:1514-1518`) | R5 (CSV: none), R22 | **16,384 columns for every kind** (XFD), stated; over it the file is refused with its column count (stated). **Bob's (B-2)**; the alternative is to lift the A1 shape to 4 letters |
| E-4 | **Cell length** | none (CSV field: unbounded, 31× heap, `:475, 487`); xlsx one 21 MiB row stated `piece_unbounded` (`ooxml.mjs:196, 660-665`, office R35); unit 128 Ki chars (`reading-pipeline/index.mjs:43`) | office R35 for xlsx only | **32,767 characters** (a spreadsheet program's cell); a longer field is **kept up to 1 MiB in the file and stated per cell** as `over_cell_bound` with its size, the rest of the row read; never swallowed. Field accumulation by chunk slices, not `+= c` (memory ≤ 2× the field). **Bob's (B-2)** |
| E-5 | **Sheets per workbook** | none (3,000 in 0.6 s; 20,000 in 3.15 s, 35 MB: A); safe view 20 (`formats.mjs:113`) | unstated for the reading | **1,000** read, the roster of the rest stated with a count. **Bob's (B-2)** |
| E-6 | **Cells per sheet read** | XLSX/CSV: none beyond bytes; ODS 262,144 carrying cells for the whole workbook (`odf.mjs:228`) | odf R45 | none beyond E-1/E-2 for any kind once ODS is windowed (§6.2); ODS's expansion meter becomes **per sheet and counts only expansion of repeats**, not cells |
| E-7 | **Formula items listed** by `structure()` | none (160,000 → 20.3 MB JSON, 96 MB cap: A) | unstated | **listed up to 100,000 and the count whole** with `formulas_held: true`; file-safety asks for `active` only, not the whole structure (F9) |
| E-8 | **The undetermined list** | CSV unbounded (800,000 entries: A); tables 200 (`tables.mjs:17`); `CSV_STREAMED_UNDETERMINED_MAX` named, undefined (`csv-reader/index.mjs:801`) | csv-reader R9 (replaced): "no listing cap" | **200 listed, count whole, cell addresses recoverable by `cellsIn`** (R9 amended) |

**Declared XML, the zip, the reader's memory**
| Id | Bound | Today | Stated | Recommended |
|---|---|---|---|---|
| E-9 | **Declared sheet + shared-string XML an XLSX may carry** | 20 MiB whole, 32 MiB pieces, over: refused `final` (`ooxml.mjs:114, 191`, textPlan 208-221); a 1M-row 3-cell **14 MB** file declares 132 MB and is refused (A) | ooxml R35, office R12/R35 | a bound on **declared XML per part 512 MiB and total 1 GiB** (a 1M-row Excel-shaped sheet is about 275 MB: 54.7 MB per 200,000 rows), read in windows; both inflate-stopped at declared+1 and ratio-checked at 1,100 (§E-10). **Measured first (§6, job 8): the number is BOB's technical call**; it is not Bob's, because the member-visible bound is E-1/E-2 |
| E-10 | **Zip entries, total declared, member, ratio, depth on the reader path** | `ARCHIVE_ENTRIES_MAX` 10,000 (listArchive only); `ARCHIVE_TOTAL_MAX` and `MEMBER_MAX` 268,435,456; `ARCHIVE_RATIO_MAX` 1,100 (listArchive and stream only, **not `readPart`**); depth 3 (`ooxml.mjs:265-275`); 60,000 entries read in 256 ms (A) | ooxml R30 | state them for the **readers**: entries 10,000 and ratio 1,100 apply to `readContainer` and `readPart`; an honest deflate bomb is stated, not read |
| E-11 | **Reader memory** | CSV 17.5 MiB read, 17.75 not (csv-reader R6); an 8 MiB body in 64 MB (R19); XLSX whole 20 MiB declared needs 48 to 96 MB; ODS ≈ 1.2 KB a cell (B) | R19 for CSV only | **every reader retains at most 2× its window plus O(columns) between windows**, proved by the corpus in a child at the real cap (§5); held cells ≤ 512 KiB (R28/R44), reading row ≤ 1 MiB (R96), no stored value over 1 MiB |
| E-12 | **Shared strings** | held whole as one array of JS strings (`formats-xlsx.mjs:521-530`, office R37) | R37 says so | **stated with a bound**: ≤ 2,000,000 strings or 64 MiB declared, then a stated refusal that names it; or a ranged lookup (BOB's choice, §6.2) |

**Work, time, the tick**
| Id | Bound | Today | Stated | Recommended |
|---|---|---|---|---|
| E-13 | **Work per tick: bytes handed to an entry** | CSV later ticks ≤ 3.3 MB (`r7-tick-work.test.mjs` `LATER_TICK_BOUND` 5 MiB); **XLSX/ODS/DOCX/PPTX the whole object** every tick | test bar only | **later ticks hand an entry at most 5 MiB (a window + a head) for every kind**; stated in reading-pipeline R40; asserted by count (bytes served, entry calls), never by time |
| E-14 | **The longest synchronous stretch** | CSV yields between 1 MiB windows (R20, test bar 500 ms by the test's clock); XLSX whole mode 1.0 to 1.5 s with none; ODS none | csv-reader R20 | every sheet entry awaits `yieldNow` between windows; asserted as a **count of yields and a count of bytes between yields**, not milliseconds |
| E-15 | **Tick time** | 10 s a tick, first at most 8 s (`g41.probe.mjs:13-14`, K4670); `READING_BUDGET_MS` 8,000 (`control-plane/index.mjs:214`) | tests only | keep; BOB states in reading-pipeline R40 that the bar is on counts; add a `cpu_ms` to `bio-plane/wrangler.jsonc` after measuring the deployed value (S-35) |
| E-16 | **Time to whole** | a 17 MiB CSV: 7 min (RW6), 19 min and 64 s (RW7); G70 unnamed | unstated | the member is told **read-through of total** honestly (already: `read_through`, `total`); a promised time is **Bob's (B-3)** |

**Encodings and delimiters**
| Id | Bound | Today | Stated | Recommended |
|---|---|---|---|---|
| E-17 | **Encodings read** | BOM UTF-8/16LE/16BE; UTF-8 valid over the first 1 MiB; us-ascii; else `encoding: null`, high-byte cells `null` (`csv-reader/index.mjs:340-362`); UTF-16 without BOM → us-ascii; decoded only through the cp1252 carrier (S-4) | csv-reader R7 | **read:** UTF-8 (BOM or not), UTF-16 with or without BOM (found by the NUL pattern), **windows-1252/ISO-8859-1 when the file is not valid UTF-8 (decoded, with the encoding recorded `likely` and shown on the document page)**; **stated per cell, never guessed:** anything else. The decision window is the whole first window **and every later window validates** (a window that disagrees is stated, not dropped). The carrier uses `latin1` only as a byte pipe through a bijective map (`TextDecoder` on `iso-8859-1` is not bijective: use a code-unit map). Reverses BOB #32's refusal to decode windows-1252 (csv-reader header §2): **BOB's, and Bob's standard (K4628) is the reason; B-8 tells Bob** |
| E-18 | **Delimiters and the lines that decide them** | comma, `;`, tab, `|`, over the first 50 complete lines, quote state reset per line (`:285-295, 372-417`); anything else reads as one column, stated | csv-reader R7 | the same four; **decided over up to 1,000 lines or 1 MiB, by majority with the field count of the modal row**, quote state carried across lines; a ragged or title line is a row, not a refusal; **"one column" only when stated and the member can re-read with a named delimiter** (an act, later). The file is never read as one column silently |
| E-19 | **CSV identity** | declared `text/csv`, `application/csv`, `text/comma-separated-values` only (`:209-210`, R2) | R2 | **the sheet reader reads** `text/csv`, `text/tab-separated-values`, `text/plain` and `application/vnd.ms-excel` and `application/octet-stream` when the name is `.csv`, `.tsv`, `.tab` or `.txt` **and** the bytes are delimited text (the file-safety shape rule, one function, §6.2); `.tsv` is a sheet. Bytes still never *override* a binary format. Stated in csv-reader R2 and acquisition R17 |
| E-20 | **A quote inside an unquoted field** | opens quote mode (`:478`) | none | **a quote opens quote mode only at the start of a field (RFC 4180, Excel)**; a quote elsewhere is literal; an unterminated quote at the end of a record's window is **stated** (the field, its row and size) |
| E-21 | **XLS** | accepted by the picker, never read | N1266 lists it | **Bob's (B-5)** |

**Workbooks, tables, money, the preview**
| Id | Bound | Today | Stated | Recommended |
|---|---|---|---|---|
| E-22 | **Workbook add** | 20 MiB file, 9 MiB cell JSON, **50,000 cells** (`workbooks/index.mjs:42-44`); one SQL row per cell | workbooks R1/R2 (G44) | **hold the file, interpret ranges when bound or cited (K4632)**: no cell copy at add; the bound becomes the **recompute engine's** (250,000 cells, 9,000,000 B unzipped: `sheet-worker/src/contract.mjs:33-35`) stated in workbooks and sheet-worker R3/R14; 130,000-cell budget books can be workbooks. **Bob's (B-4)** |
| E-23 | **Table** | 20 MiB, 1,000,000 cells (`tables.mjs:14-15`); from a sheet range at most 20,000 cells (`calculations/index.mjs:490`) | calculations R1 | keep E-1's derivative: **20 MiB and 1,000,000 cells**; a range over 20,000 cells is **paged by `next_row` to the bound** (S-25); over it refused with the count; a table's rows are exactly the source's data rows with columns kept (§4.4 invariant J-13) |
| E-24 | **Ingest** | 100,000 rows; 10,000 inline; 20,000 per slice (`calculations/index.mjs:104-122`) | calculations R14 | keep; state that a *member lists rows in windows* above 100,000 |
| E-25 | **Cell interpretation in an ingest** | `parseFigure`: US separators only; percent dropped; currency from the column wins | calculations R14, calc-grammar | a table column declares its **locale and number format**; `12%` is a percent; a currency mark in the cell and a different column currency is a stated conflict; BOB's, in calculations R14 |
| E-26 | **The safe view** | 1,000 cells a sheet, 20 sheets, 5,000 cells, ODS 8 MiB declared, grade 20 MiB (`file-safety/formats.mjs:112-116`) | file-safety R11/R21/R51 | keep, **plus a "show more" that pages by `next_row`** (a screen, UX-DESIGN's). **Bob's (B-6)** |
| E-27 | **sheet-worker** | 9,000,000 B unzipped, 250,000 cells, 120,000 ms, cpu 300,000 ms (`contract.mjs:33-39`, `wrangler.jsonc:29`) | **values unstated** (R14: "fixed constants measured") | state the three values in R3/R14; move `inspect` and the R2 read inside the try; check `obj.size` before `arrayBuffer()` |
| E-28 | **Dates and percentages as read** | XLSX: raw `<v>` (a date is a serial; styles.xml never read, office R30 "by ruling"); ODS: displayed; CSV: field | office R30 | read `styles.xml` number formats and **type a cell a date** (value kept lexical) so a date is findable in all three kinds. It reverses a stated ruling: **Bob's (B-7)** |

### 4.3 For Bob (K1881; each with an explanation, options and a recommendation, rendered when brought to him)

Each is a bound or choice that changes what a member may do. The explanation is the part to render; the figures are this plan's.

- **B-1 · How big a spreadsheet CS reads, and whether the limit is bytes or rows.** *Explanation:* today a CSV over 17 MiB or a workbook of more than about 120,000 rows is not read; your standard (K4628) says 50 MB or about 1M rows, read whole, searchable to the last row. "50 MB **or** about 1M rows" can mean *whichever comes first* or *either is fine*. *Options:* (a) refuse above 50 MB or above 1,048,576 rows, whichever comes first, stated with the size; (b) refuse above 50 MB only, rows free; (c) refuse above 1,048,576 rows only. *Recommendation:* **(a)**, because a 50 MB file of 40 million narrow rows would take hours and cannot be cited row by row; the figure is one number in one table.
- **B-2 · Shape limits: columns, one cell's length, sheets in a workbook.** *Explanation:* nothing limits these now, and the first two make a file unreadable by accident (one 4 MiB cell takes 125 MB; a CSV with more than 18,278 columns collapses every block to one address). *Options:* (a) copy a spreadsheet program's limits (16,384 columns, 32,767 characters a cell) and a generous sheet count (1,000), each stated with the file's own figure when exceeded; (b) no limits, rely on memory; (c) tighter. *Recommendation:* **(a)**; a longer cell is kept to 1 MiB in the file and stated, not lost.
- **B-3 · Whether CS promises a time-to-whole for a large spreadsheet.** *Explanation:* a 17 MiB CSV has taken from 64 seconds to 19 minutes with nothing else running (G70, not yet understood); at 50 MB that spread is hours. *Options:* (a) no promise: the document page shows "read through X of Y" and an honest note; (b) a stated rate (for example: about a minute a 10 MB when the copy is quiet); (c) a promised maximum. *Recommendation:* **(a) now, and (b) after G70 is named and the corpus has measured the rate on the live copy.**
- **B-4 · Workbooks of more than 50,000 cells.** *Explanation:* a member can add an analysis workbook only up to 50,000 cells; the budget books in the public corpus have 130,000 to 143,000 cells, and 16 % of the 269 readable corpus workbooks are refused as workbooks (they stay readable as documents). Your K4632 says adding is not interpreting, so a bigger workbook can be held whole and only the cells a binding or citation touches are interpreted. *Options:* (a) keep 50,000 and say so on the page; (b) hold the file and interpret ranges, with the recompute engine's own bound (250,000 cells) as the new limit; (c) both, with (b) after the beta. *Recommendation:* **(b)**; it makes K4632 true of workbooks and removes G44's cause (a copy of every cell).
- **B-5 · `.xls` (the old Excel format).** *Explanation:* the Add screen offers `.xls`; CS takes the file and cannot read it ("not read as text"). Reading it needs a reader for the old binary format (substantial work); N1266 names it. *Options:* (a) refuse at the picker with a sentence that says to save as `.xlsx` or `.csv`; (b) take it and state plainly that it is kept and not read; (c) build the reader. *Recommendation:* **(a) now; (c) if the beta's real files include them** (the corpus will say: N1268).
- **B-6 · The preview of a large sheet.** *Explanation:* the preview shows the first 1,000 cells of a sheet and says so; there is no way to see more in the preview (the full sheet is searchable). *Options:* (a) keep; (b) add "show more" that pages. *Recommendation:* **(b)**, a screen for UX-DESIGN.
- **B-7 · Dates and percentages as members search them.** *Explanation:* in an Excel file a date is stored as a number like 45123 and CS shows and searches the number, so "2024-05-01" is found in a CSV and a Google Sheet and not in an Excel file. Reading the file's number formats fixes it but reverses a ruling that said a date implied only by a cell's style is not inferred (office-readers R30). *Options:* (a) keep the ruling and say so on the document page; (b) type such cells as dates and keep the original number beside them. *Recommendation:* **(b)**.
- **B-8 · Files saved by older Windows programs (windows-1252).** *Explanation:* Excel's default "CSV" is not UTF-8; CS reads such a file's numbers and drops every word with an accent (it is absent from search), stating a count. K4628 says every file a member is likely to hold is read. *Options:* (a) keep (never guess an encoding); (b) read it as windows-1252 when the file is not valid UTF-8, show the encoding on the page and let the member correct it. *Recommendation:* **(b)**; the page says what was assumed (nothing is silently guessed). This reverses BOB #32's design refusal, so it is recorded as a ruling, with Bob told.

### 4.4 The invariants (the "always"; stated once; each corpus file is judged against all of them)

The PDF plan's I1-I14, re-cut for a sheet. Each is a sentence for the module named; **a counted bound, never a time** (R-CLOCK). The corpus and §5.3 refer to them as J-n.

- **J-1 Every row once.** Each data row of the file is in exactly one indexed unit; the header line is the *first line of a block* and never a data row; every unit's extent contains exactly the rows it holds. (reading-pipeline R41, new text)
- **J-2 Progress.** A read finishes in at most ⌈unit text ÷ 2 MiB⌉ + 2 ticks; no tick ends with the cursor unmoved; a failure of any tick is retried, never ends the read as finished. (reading-pipeline R40; plane R77)
- **J-3 Never silent.** `completeness` is `whole` only when every row of the file is in the index; anything cut, held, skipped, undecodable or refused is stated with its **size, its bound and its cause in the cause's own words** (not "undecodable region"). (reading-pipeline R15/R35; extraction R90/R91; K4571, K4630)
- **J-4 Memory.** A reader's retained heap between windows is at most 2× its window plus O(columns); the whole read stays alive in a child at the platform's cap with the held bytes inside it. One cap convention for every format: **the platform's measured idle, written once** (S-38).
- **J-5 Work per tick, by count.** A later tick hands an entry at most 5 MiB; it hands the store at most 5 MiB of ranged reads; every window is followed by a yield; no stored value exceeds 1 MiB. (reading-pipeline R40, csv-reader R20, office R35, odf R-new)
- **J-6 Pieces equal whole.** The cells and the text of a windowed read equal a whole read's, and both equal the generator's truth, field for field. (The oracle is the generator, never the reader's past output: P7.)
- **J-7 A refusal is stated, final and finite.** Past a bound the answer is final, names the size and the bound, and no row remains "being read" after the last tick.
- **J-8 State loss is harmless.** A restart or a store failure between ticks (after any tick) neither loses a row nor ends the read: the read resumes or re-reads, once.
- **J-9 Every path owes what it leaves.** Upload (one part and multipart), the doorbell pull, address `acquire`, the daemon paths, and the no-cursor door read all end `whole` or owed; none ends `whole` with `truncated`.
- **J-10 Search finds the first, a middle and the last row,** by a mark placed in a non-header cell; the hit's extent contains the row; `cellsOf` of that extent contains the cell with the mark equal to the generator's.
- **J-11 Cells keep their place.** The cell at A1-style address *x* of a file is *x*, with empty cells, merged cells (the covered cells keep their columns), rows without `r`, and a styled empty cell not moving a value or the used range; text and cell views agree.
- **J-12 Stored values bounded.** No stored value and no reading row over 1 MiB; **a reading is never replaced by a statement while its text could be indexed** (the ODS cliff); a reading over the guard still has its units.
- **J-13 One table, one sha.** A table declared from the same data, whichever kind (CSV comma or semicolon or tab, XLSX, ODS), whichever path (sheet range, document extent, passage, bytes), whichever window cut, has the same rows, the same columns and the same sha; the header appears once; an empty cell keeps its column; a quote, a tab or a line break in a value is a value.
- **J-14 Money by truth.** An ingest of a generated table writes the facts the truth names, each fact's source row is the sheet row; a percent, a currency mark, a locale separator and a date are read as the table declares them, or stated.
- **J-15 Same data, same answer, in every kind.** A workbook and its CSV, TSV and ODS twin give the same cells and the same searchable words, dates included.
- **J-16 Contention.** While sheet ticks run, twelve cheap reads wait under 500 ms at p95 on workerd (R93), **asserted** for the real reads, not printed.
- **J-17 Encodings.** Every cell whose characters the file's encoding can represent is read: no valid UTF-8 character is `null`; a windows-1252 file is decoded with the encoding stated; an undecodable cell is counted, listed up to 200, and never shifts a column.

---

## 5. The corpus (K4785 (3)): generated files over the envelope's corners and their combinations

### 5.1 How it is made

**One seeded generator, `sheetgen.mjs`, with a truth.** It is a **test-support** path (layer 1, beside `make-zip.mjs` and the shape harness's `xlsx-gen.mjs`; BOB adds the path, and adds the edges `csv-reader`, `office-readers`, `odf-reader` → `test-support` that today are missing: G §2.5). It replaces the CSV generator copied in six places (2.3 item 8) and builds on the one good thing already there, the streaming zip writer `zipChunks` (`plane/shape/xlsx-gen.mjs:48-78`), which never holds the file.
- **Input:** a spec of axes: *kind* (csv, tsv, xlsx, ods, docx-table, html-table, xls), *rows*, *columns*, *target bytes*, *delimiter*, *encoding* (utf-8, utf-8 BOM, utf-16 LE/BE with and without a BOM, windows-1252), *line ending*, *quoting* (embedded doubled quote, quoted line break, stray quote, tab in a value), *cell types* (text, integer, decimal, percent, currency, date, formula, shared string), *empties* (leading, middle, last, whole row, whole column), *raggedness*, *header shape* (none, one, a title line, a header of N characters), *declared type and name*, *sheets*, *merged ranges*, *dimension*, *hostile* (deflate bomb, lying directory, no `r`, styled empty), *seed*.
- **Output:** the bytes (streamed to disk once, by spec hash, in `BIO_FIXTURE_CACHE`; large files are never committed) and a **truth**: a pure function `cell(r, c)` of the seed (so a 1,048,576-row truth is computed, not stored), the row and column counts, the **marks** (`<seed>-R<row>-C<col>`) at the first data row, a middle row and the last row, **in a non-header cell**, the cells expected undetermined and why, and, for a refusal, **the statement it must carry** (size, bound, cause).
- **Two oracles, never the reader's own past output (P7):** the generator's truth, and an independent reader: for CSV a small RFC 4180 parser inside the generator that shares no code with `csv-reader`; for XLSX `sheet-worker`'s own parse (IronCalc: cell count and formula values); for ODS none exists today, so the truth alone is the oracle and BOB decides whether the corpus container carries a converter (LibreOffice headless, if the container image has it: not checked here).

### 5.2 The entry paths a file goes through, and what passing means

The corpus never calls a reader alone for its verdict (that is the unit half, owned by each module's tests). The verdict is the **real path at the platform's shape**, the sheet twin of the PDF plan's path R:

| Path | What | Where it runs |
|---|---|---|
| **R** the real path | the shape harness (`plane/shape/harness.mjs`) made a suite runner for sheets: `feed` = `upload` (one part and multipart), `acquire` (a local stand-in origin serving the bytes with a header; a Google-Sheet-style ODS export), `pull` (the doorbell); the capture screen's promotion; the door's `pendingadd`; the ledger's alarm tick by tick **to whole**; then **`op=search` for the first, a middle and the last mark** and the hit's extent; **`cellsOf` of the last row and of a range crossing a block edge** equal to the truth; `op=reading` paged by `next`; the Document screen's "Next page"; `safeview`; **`tabledeclare` from the sheet range (paged), from the document extent and from a passage**; **`moneyingest` of named rows**; `workbookadd`; `workbookrecompute` for XLSX inside the engine's bound | node child, the real plane Store, `node:sqlite` under the platform shim (2,098,176 B), at the platform's cap (one convention, J-4) |
| **M** each module's interface | csv-reader, office-readers, odf-reader, ooxml, format-registry, reading-pipeline `read`, extraction `readHeld`, content `cellsAt`, calculations `declareTable`, workbooks, file-safety `safeView` over the real modules and a fake world | `node --test` per module, plus child processes at a cap where the module owns a memory bar |
| **W** workerd (Miniflare, real DO SQLite, real R2) | contention and the platform's behaviours: R93 for the real reads of a 12 MiB and a 17 MiB CSV and an ODS (**asserted**, today printed: `r7-contention.test.mjs:78-92`), and the SQL value limit; memory is *not* asserted there (local workerd enforces none: G27's lesson) | `plane/r7-contention*.mjs` generalised |
| **L** live | the smallest file of each family (marked **L** below) on biosmoke8 at each redeploy through the proxy only (R-PROXY), with the walker's real upload | `journey-check` rows |

The harness gains what the PDF twin gains (G §2.1): `members: "real"` (not stubs), `restartAt` (drop the object between ticks N and N+1), `storeFailAt` (a transient failure on tick N, J-8), per-tick **counts** (bytes the store served, bytes the entry was handed, yields, entry calls), and a document kind built from a generator spec with its truth. It also fixes S-38 and S-39: one cap, an in-tick sampler that is actually on, search asserted by **extent equals the truth's** (not `total >= 1`), and pass bars on counts.

**What passing means.** A file passes when, through R at the platform's shape, **all of J-1 to J-17 that apply hold** (§4.4). The ones that apply are marked in each family's row. A refusal file passes when J-3 and J-7 hold with **exactly the statement the truth names** (size, bound, cause; and not "undecodable"). A file is never judged by a time from the object's clock (R-CLOCK). The wall time the test takes outside the object is reported, and bars on it (10 s a tick, 8 s the first) are kept only as the existing K4670 reports, never as a pass condition.

### 5.3 The files

72 files in four families. **Today** is what happens now (so the first run is a red list, by design); **target** is what it must do after fix round 8. "L" marks the live subset. Owners are by the module's test path in `modules.json`.

**CSV and delimited text (36)** · unit owner `csv-reader`; the piece half `reading-pipeline`; the table half `calculations`; the shape runs `plane`

| Id | The file | Today (A, D, F) | Judged by |
|---|---|---|---|
| C01 **L** | 1 MB, 4 columns, quoted name and note, LF (the harness's own) | passes | J-1,2,3,5,6,10,11,12 |
| C02 | 9 MB, two parts (multipart upload) | passes | + J-9 |
| C03 | 17,825,790 B (the bound − 2) | passes (9 ticks, 3 MB headroom) | J-4 |
| C04 | exactly the E-1 bound (today 17 MiB; target 50 MiB), 1,048,576 rows | passes at 17 MiB; target unreachable | J-1..J-9 |
| C05 | bound + 1 | final, **worded "undecodable"** (S-8) | J-3, J-7 with the right statement |
| C06 | 24 MiB + 1 and a 30 MB, 1M-row, 30-byte-row file | stated with size | J-3, J-7 |
| C07 | 1,048,576 rows × 1 narrow column (about 6 MB) | passes | J-1..J-6 |
| C08 | 1,048,577 rows | unbounded today (E-2) | J-7: refused with the row count |
| C09 | 16,384 columns × 200 rows (about 3 MB) | one row over the unit cap; 3× index (S-13) | J-1, J-5, J-12 |
| C10 | 16,385 columns | collapses to one extent past ZZZ (S-13) | J-7 per E-3 |
| C11 | a header of 200 KiB (> the unit cap) × 1,000 rows | **no data row indexed** (S-13) | J-1, J-10 |
| C12 | one 1 MiB cell | ~31× heap | J-4, J-12 |
| C13 | one 4 MiB cell | 125 MB peak | J-4, J-7 (`over_cell_bound`, rest read) |
| C14 **L** | a stray `12" pipe` at row 100 of 500,000 rows | **262 rows read of 500,000, nothing flagged** (S-5) | J-1, J-3, J-6 |
| C15 | a quoted line break in every 3rd row, windows of 4,099, 40,000, 50,000, 70,001 bytes and the default | passes at U3 | J-1, J-6, J-11 (+ at R) |
| C16 | doubled quotes, tabs and commas inside values | passes as cells; **breaks the table** (S-3 d) | J-11, J-13 |
| C17 | empty cells: first column, middle, last, a whole empty row, a whole empty column; inside and after line 50 | text drops them; **table shifts or is refused** (S-3 b, c) | J-11, J-13 |
| C18 | ragged rows and a 5-line title preamble before the header | delimiter undetermined → **one column** (S-6) | J-11, J-3 |
| C19 | CRLF, CR-only, mixed | CR-only → one column (S-6) | J-1, J-11 |
| C20 | semicolon, decimal commas | unit only | J-1, J-13, J-14 |
| C21 | tab-delimited named `.csv` | unit only | J-1, J-13 |
| C22 | pipe | unit only | J-1, J-13 |
| C23 | `.tsv`, `text/tab-separated-values` | **plain text, no cells** (S-10) | J-10, J-11, J-13 |
| C24 | `.tsv`, `text/plain` | plain text | J-10, J-11 |
| C25 | UTF-8 with BOM | passes | J-17 |
| C26 | UTF-8 no BOM, first non-ASCII byte after 1 MiB | **later cells null** (F5) | J-17 |
| C27 **L** | UTF-8 with `’`, `É`, `Ñ`, CJK, an emoji, 300,000 rows | **300,000 null cells** (S-4) | J-17, J-10 |
| C28 | UTF-16 LE with BOM, 12 MB | whole each tick | J-5, J-17 |
| C29 | UTF-16 LE without BOM | read as us-ascii with NULs (S-6) | J-17 |
| C30 | UTF-16 BE with BOM | passes | J-17 |
| C31 **L** | windows-1252, 5 MB, 300,000 rows, 2 accented fields each | 600,000 undetermined, absent from the index (F6) | J-17 per B-8 |
| C32 **L** | the C01 bytes declared `application/vnd.ms-excel` | **not read** (S-10) | J-9, J-3 |
| C33 | the same declared `application/octet-stream` | not read | J-9 |
| C34 | no declared type, `.csv` name, multipart | passes (R107) | J-9 |
| C35 | formula-like cells (`=HYPERLINK`, `=cmd`, `+1`) | kept as text (ran) | J-11; file-safety: no active content |
| C36 | a data row equal to the header, mid-file, at a block head | the table drops only the first (S-3 a family) | J-1, J-13 |

**XLSX (20)** · unit owner `office-readers` (`ooxml` for the zip); the shape runs `plane`; recompute `sheet-worker`

| Id | The file | Today | Judged by |
|---|---|---|---|
| X01 | 200,000 rows × 3 inline strings (the harness's own, 3.2 MB) | passes (2 ticks, 114.6 MB at cap 163) | J-1..J-6, J-10 |
| X02 | shared-strings heavy: 385,000 strings, 20.5 MiB declared | 64 MB lowest cap (A) | J-4, J-5 |
| X03 **L** | Excel-shaped: 6 columns, shared strings, styles, dates as serials, percents, 120,000 rows | dates searched as serials (S-11) | J-1, J-15 |
| X04 | 32 MiB − 1 declared (today's ceiling) | pieces; whole each tick (S-14) | J-5 (later ticks ≤ 5 MiB), J-14 |
| X05 | 33 MiB declared (236,709 rows) | final, **"undecodable"** (S-8) | J-3, J-7 |
| X06 | 1,048,576 rows × 3 cells (14 MB file, 132 MB declared) | **refused** (S-9) | target: J-1..J-6 at E-9 |
| X07 | a 50 MB file (the target) | refused | target: all |
| X08 | 100 sheets of 100 rows | safe view only | J-1, J-11 |
| X09 | 1,001 sheets | none | J-7 per E-5 |
| X10 | `<dimension>` A1:XFD1048576 and cells at A1 and XFD1048576 | exact (A) | J-11 |
| X11 | a styled empty cell at row 900,000 | used range 900,000 (S-17) | J-11 |
| X12 | rows and cells with no `r` | `usedRows` 0, range null (S-16) | J-11 |
| X13 | shared and array formulas; a formula-dense sheet at 19 MiB declared | `formula:""` (S-15); 160k items (S-9 F9) | J-11, J-4 |
| X14 | merged cells with values to the right | unread, unstated (S-18) | J-11 |
| X15 | an honest deflate bomb (58 KB → 19.4 MiB part) | read in 1.5 s | J-4, J-7 |
| X16 | a lying central directory (200 MB real, 1 MiB declared) | `size_mismatch` in 17 ms (A) | J-7 |
| X17 | `docProps/core.xml` with `&#x110000;` | **throws** (S-21) | never-throws (office R21), J-3 |
| X18 | hyperlinks, an external link, a VBA project, an Excel 4.0 macro sheet | named, not run | file-safety R14 |
| X19 | an encrypted workbook (OLE container) | `ole`, `NO_SAFE_VIEW`, unchecked reading (hypothesis) | J-3: stated |
| X20 | a workbook for add / bind / recompute at 50,000, 130,000 and 250,001 cells | 50,001 refused | J-7, J-14; B-4 |

**ODS and Google Sheets (12)** · unit owner `odf-reader`; the shape runs `plane`; the Drive export `capture`/`acquisition`

| Id | The file | Today | Judged by |
|---|---|---|---|
| O01 **L** | 60,000 cells, 297 KB (re-walk 6) | **reading deleted**, no text index (S-1) | J-12, J-10 |
| O02 | 6,000 and 7,000 cells (either side of the cliff) | 6,000 kept, 7,000 deleted | J-12 |
| O03 | 100,000 cells, 14 MB `content.xml` | 124 MB at 128 (the edge) | J-4 |
| O04 | 140,000 cells, 19.8 MiB | aborts at 128 MB (node) | J-4 |
| O05 | 20.4 MB `content.xml`, 220,000 cells (re-walk 7) | **never read, nothing owed** (S-2) | J-2, J-3 |
| O06 | `content.xml` 20 MiB + 1 | final, size and bound | J-7 |
| O07 | 1,048,576 distinct rows | `over_repeat_bound` for any shape (B) | target: all |
| O08 | repeats: 1,048,000 collapsed empty rows; 16,384 typed-empty columns on every row | empty runs free; typed-empty refused after 16 rows (S-19) | J-7, J-11 |
| O09 | merged cells (`covered-table-cell`) | **shifts every cell to the right** (S-18) | J-11 |
| O10 | annotations and `calcext:value-type="error"` cells | note text in the value (S-19) | J-11 |
| O11 **L** | a Google-Sheet-style ODS via `feed: "acquire"`, three sheets | as O01 per size | J-9, J-11 |
| O12 | hidden and filtered rows and columns | passes (ranges) | J-11 |

**Other containers and tables inside documents (4)** · unit owners `office-readers` (docx), `reading-pipeline` (html), `pdf-reader`

| Id | The file | Today | Judged by |
|---|---|---|---|
| D01 | a DOCX with 9,000 and 12,000 table cells | **reading deleted** over 1 MiB (S-1) | J-12 |
| D02 | an HTML page with a 500 × 20 table (and an all-links table in a `div`) | each cell a paragraph, row and column lost (S-34) | J-3: stated as "table not kept as cells" |
| D03 **L** | a legacy `.xls` | not read, no sentence (S-10) | B-5 |
| D04 | a PDF with a ruled table | text only | J-3: stated |

**Table, workbook and money hand-off of the above** (not new files; each of C01, C15-C23, C27, C31, X03, X20, O01 and O09 is also taken to `tabledeclare` from the sheet range and from the document extent, `moneyingest` and, for xlsx, `workbookadd`): the **twins** are the point. C01 declared as a comma CSV, a semicolon CSV, a tab CSV, an XLSX and an ODS gives one table and one sha (J-13, J-15) — the check re-walk 7's walker made by hand and the plan's own test missed (F; P2).

### 5.4 Seeded variations
Beside the 72, **16 variations at every round end**: 8 fixed seeds and 8 derived from the round's number. Each draws the axes of §5.1 **within the envelope** (so a legal file) and, in a second draw, **just outside one bound** (so a refusal). Every failure is shrunk to the smallest spec that fails, printed as a spec so it is the next cause's reproduction; a variation that ever fails joins the 72 as a named file.

### 5.5 What this costs, and when it runs
**To be measured by the first run; not claimed.** The heavy files are C04, C05, C06, C28, C31, X04-X07, O03-O05, O07 (tens of MB, up to the 50 MB target); the plane's shape runs already read 17 MiB in nine ticks and a 200,000-row xlsx in two (ran: G), so the run is dominated by generation, search and the table and ingest hand-off. **Round end, whole, in its own container (K4787)**, then the time-sensitive set alone on one core (`taskset -c 0`); never only the fix in hand. The **L subset** (C01, C14, C27, C31, C32, X03, O01, O11, D03) runs on biosmoke8 at each redeploy, through the proxy only. The corpus is a different thing from N1268's fixed set of real public files, per type a small, a typical and a largest-allowed one, on the live copy each tranche: both are needed, and the generated files are what a real file's *failure* is reduced to.

### 5.6 Which module's tests own each part
| Part | Owner (tests path in `modules.json`) |
|---|---|
| the generator and its truth; the hostile zips | `test-support` (`make-zip.mjs` `zipBomb`/`nestedZip`, R14) |
| CSV unit: C03-C36 at U and M, windows at U3 | `csv-reader` (`bio-plane/test/m/csv-reader/`), `reading-pipeline` |
| XLSX unit: X02-X19 | `office-readers`, `ooxml` |
| ODS unit: O02-O12 | `odf-reader` |
| format identity: C32-C34, C23, D03 | `format-registry`, `acquisition`, `capture`, `file-safety` |
| the read, index, state, retries: J-1..J-3, J-5, J-8, J-9, J-12 | `reading-pipeline`, `extraction`, the ledger in `plane` |
| cells and citation: J-10, J-11 | `content`, `extraction` |
| table, money: J-13, J-14 | `calculations` |
| workbook, recompute: X20 | `workbooks`, `sheet-worker` |
| the real path R, memory, contention: J-4, J-16 | `plane` (`plane/shape/`, `r7-contention`) |
| the safe view | `file-safety` |

---

## 6. What this plan hands BOB (the order of work it implies; BOB's to place)

**0 · First, measure on workerd (L), because three findings were run only in node:** (a) S-4: does workerd's `TextDecoder("latin1")` follow the WHATWG label (windows-1252) as node does; (b) S-2: run the 20.4 MB ODS through the ledger on a quiet copy with a log of the tick's last word before the object stops, and the planned G70 per-alarm log; (c) the deployed `cpu_ms` and the object's real memory with an ODS of 100k and 140k cells. These decide which causes are certain.

**1 · Cause entries, data loss first** (each with its four fields, R-FOUR): S-4, S-3, S-1, S-5, S-8, S-7, S-2, S-6, in that order of certainty and loss. Six are certain (ran) today.

**2 · The architecture the standard needs** (BOB's, P17; recommended): **one reading contract for every sheet-like kind**, `window(cursor) → {rows (typed cells with their place), next cursor}`, bounded by a window, yielding between windows, holding its cells in the file and carrying its state **in the cursor** (a byte or row offset and the open counters), not re-parsing:
- CSV: exists (`csvWindowTick`, R40/R41); keep, with the walker fixed (E-20) and the carrier fixed (E-17).
- XLSX: the zip central directory and the sheet part inflated in windows with a row cursor; the shared-string index read by range or bounded (E-12); retire the `u` cursor for sheets.
- ODS: a streaming tokenizer over `content.xml` inflated in windows, the repeat counters in the cursor, held cells and `cellsIn`, per-sheet expansion (E-6).
- The reading-row guard (extraction R96) never replaces a reading that could be indexed (J-12).
- Tables are built from **cells** (`cellsAt`/`cellsIn`, paged) or from **bytes** through csv-reader, **never from the reading's presentation text** (J-13); content R46's join and reading-pipeline R41's header are *presentation*, and R41 says so.

**3 · Jobs (proposed grouping; owners by module)**
| Job | Covers | Owner modules |
|---|---|---|
| A. csv-reader | S-4, S-5, S-6, S-22, F3, E-4, E-8, E-17..E-20; the cellsIn index for paging (S-20) | csv-reader, reading-pipeline (`scanBoundaries`) |
| B. ODS | S-1, S-2, S-14 (ODS), S-18 (ODS), S-19; E-6; D01 (DOCX the same contract) | odf-reader, office-readers (docx), reading-pipeline, extraction |
| C. tables | S-3, S-25, S-27, S-29, S-28; J-13 | calculations, content (R46 note), reading-pipeline (R41 note) |
| D. XLSX | S-14, S-15..S-17, S-21; E-5, E-7, E-9, E-10, E-12 | office-readers, ooxml, reading-pipeline |
| E. ticks, state, identity | S-7, S-8, S-10, S-23, S-33; E-13..E-16, E-19 | reading-pipeline, extraction, acquisition, capture, plane |
| F. workbooks | S-26, S-32; E-22 (after B-4), E-27 | workbooks, sheet-worker |
| G. interpretation | S-30, E-25, E-28 (after B-7), S-11 | calculations, office-readers |
| H. index and search shape | S-12, S-13, F13, F14, S-34 | reading-pipeline, text-chain, extraction |
| I. harness and corpus | S-24, S-36, S-38..S-41; §5 | test-support, plane |
| J. requirements | the envelope into the requirements (below) | each module |

**4 · The envelope into the requirements, by module** (written where missing; K4785 (2)): csv-reader R5/R6/R7/R9 (and R6's two numbers made one) and new E-3, E-4, E-8, E-17 to E-20; office-readers R12 (stale), R11 (styled), R35-R37 and E-5, E-7, E-9, E-12; odf-reader R45, R48 and the windowed contract; ooxml R30 for the reader path (E-10); reading-pipeline R37 (**the one table of big-file bounds**), R40 (per-tick counts, E-13, E-14), R41 (header is presentation; "nothing is cut" corrected); extraction R96/R97 (never delete an indexable reading), R98; file-safety R11, R51 (and the CSV sniff made one function with csv-reader); acquisition R17 (the identity rule); workbooks R1/R2 (B-4); calculations R1 (a table's rows are the source's data rows), R14 (E-25); sheet-worker R3/R14 (values); plane R84 (the sheet twin extended: ODS, XLSX at the bound, encodings, restart) and `wrangler.jsonc` `cpu_ms`; test-support (the generator).

**5 · Bob's** (§4.3): B-1 to B-8, rendered, before jobs A (E-17), B and F touch what a member may do. B-1 and B-3 first: they size everything else.

**6 · After**: the corpus runs at every round end; the L subset at each redeploy; every defect a cause of the running fix round (P10, P19).

---

## 7. Not covered by this plan

- **PDF tables, scans and images, word-processing, presentation and web text, archives:** PDF #1, SCAN #1 and DOCS #1. This plan covers a DOCX or HTML *table* only where a table reaches the sheet path (S-1 D01, S-34).
- **The accuracy of the recompute engine,** CSV export (none exists: no code writes a CSV), and formula evaluation outside `sheet-worker`.
- **Encrypted or password-protected workbooks** (X19 is a corpus file; the reading's behaviour is a hypothesis: file-safety names OLE `ole` and `NO_SAFE_VIEW`).
- **Not read by any helper:** `diagnosis-R6-idle.md` past 4.5 KB; the two round 7 reviews of G83 and G84 (keyword scan); `round6.test.mjs` whole (S-7's scripted provider); the daemon paths (`capture-requests`, `monitoring`) for the "is it a sheet" decision (hypothesis that they follow `textTypeOf`); the live site (not contacted).
- **Workerd:** every probe ran in node 26; the numbers for heap and times are indicators, bytes/rows/calls are exact; §6 step 0 settles the three that depend on it.
- **This plan changes no requirement.** Where it says "stated in R-n", it means the requirement says it today; where it says "Recommended", the requirement does not yet.
