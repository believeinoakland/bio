> **Split K5025.** Part of `envelope-sheets-T51.md`, split by section; contains §4 (the envelope) and §5 (the corpus). The rest: the head, §0, §3: `envelope-sheets-T51.md`; §1, §2: `archive/envelope-sheets-T51-s1.md` (archived whole); §6, §7: `archive/envelope-sheets-T51-s6.md` (archived whole).

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
