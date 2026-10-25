# csv-reader (T51)

**Status** · session_01KK3V2itArCQimGgpgdg95M · depth 2 · COMPLETE · handled B12

## Completion

- **Entry applied:** the office-readers split, plan entry 15 of `fix-round-4b-T51.md` (K4507, K4521), option 1, by copy; no behaviour changed. Files made: `bio-plane/src/csv-reader/index.mjs` (865 lines: `csv.mjs` copied with its `formats-xlsx.mjs` import dropped, imports only `../ooxml.mjs` and `../setup-words/index.mjs`, plus the four builders `sheetCellRef`, `sheetRangeRef`, `columnLetters`, `usedSheetRange`); `bio-plane/test/m/csv-reader/` `entry`, `structure`, `text`, `typed-cells`, `large-text`, `builders-invariants` `.test.mjs` and the helpers `fixtures.mjs` (`enc`), `large.mjs` (`bigCsv`, `csvField`, `prng`, `randomText`, `MIB`), `large-worker.mjs`. office-readers' files and tests untouched.
- **For `build/modules.json` (BOB):** `"paths": ["bio-plane/src/csv-reader/"]`, `"tests": ["bio-plane/test/m/csv-reader/"]`.
- **Met ids:** R1–R15 (all 15), each named by at least one test: R1, R2, R3 (`entry`), R4 (`structure`), R5, R6, R7 (`text`), R8 (`typed-cells`), R9 (`large-text`), R10–R15 (`builders-invariants`).
- **Words:** the sentences keep their existing keys (`office-readers.csv.*`, `csv.notes.*`; K3930); none re-keyed. The words check reports no finding for csv-reader (inline 0, plain 0, missingkey 0, unkeyed 0) and the totals are unchanged from before (dev 268, unkeyed 1982).
- **Deferred:** none. **Found in other modules:** none.
- **Observation, not a deferral:** R8 says that over the size guard `cells` is `null`; the copied behaviour, and the office-readers test it came from, give `sheets: []` there (no sheet, so no `cells`). The test asserts that, unchanged; the requirement's wording is BOB's.
- **Ran:** `node --test --test-force-exit bio-plane/test/m/csv-reader/` 39 pass, 0 fail; `node --test --test-force-exit bio-plane/test/m/office-readers/` 126 pass, 0 fail (unchanged). The checks, run on a scratch checkout of this commit with only the two `build/modules.json` fields above entered (the real file still has them empty until BOB enters them): format 0 failures; architecture 0 failures (csv-reader imports ooxml and setup-words only); coverage 15 of 15 ids named, 0 failures; words 0 failures; ownership (`tranche/T51` to this commit) 11 files changed, 0 failures. Run on the real tree before BOB enters the paths, ownership and coverage report csv-reader's files and ids as unowned/unnamed, as expected.
- Size (session_01SKPjPu69D1xg5Pwz4djD8g): test runs 4, module lines 865

## J1 · COMPLETE

csv-reader COMPLETE. Files: bio-plane/src/csv-reader/index.mjs (865 lines), bio-plane/test/m/csv-reader/ (6 test files + 3 helpers). Enter in modules.json: paths ["bio-plane/src/csv-reader/"], tests ["bio-plane/test/m/csv-reader/"]. R1-R15 met. Tests: csv-reader 39 pass; office-readers 126 pass unchanged. Checks (scratch checkout with the two fields entered): format, architecture, coverage 15/15, words, ownership all 0 failures. No deferral, REPORT or question; one wording observation on R8 in my record. Size: test runs 4, module lines 865.

## Fix round 6, wave 2 (CSV-READER #2, session_01Wy8nnMT1rzDSVKrq9QgRXP): G15 `lineRows`

- **Cause (rule 1).** A sheet's `text` is the TAB-joined non-empty records, one line each (`index.mjs` `addRecord`, `if (vals.length) lines.push(...)`), so a line's index is not its row: empty records add no line and a quoted line break makes one record several lines. No field said which row a line came from; READING-PIPELINE #22 could not split a sheet into row-range units naming true rows.
- **Why the tests missed it (rule 2).** No requirement said a line must carry its row; the R5 test pinned the sheet's keys and text only. Gap fixed: the new proposed requirement R16 and its test file.
- **Changed.** `bio-plane/src/csv-reader/index.mjs`: `csvText` builds `lineRows` beside `lines` (one entry per `\n`-separated line of the record's text, all of that record's 1-based row; a row is the record's number, as `cells` and `usedRows` count it), emitted on `sheets[0].lineRows` for the whole-file and the streamed path (same `addRecord`); helper `countLineBreaks`. The size-guard answer has no sheet, so no `lineRows`. `text.test.mjs` R5: the exact-shape assertion now includes `lineRows: [1, 2, 3, 5]`.
- **Failing-first (rule 3), through the real entry `csvEntry.text`**, `bio-plane/test/m/csv-reader/line-rows.test.mjs`: (a) 122 records with empty lines, empty-field records and a quoted line break: `lineRows` equals the written rows, length = lines of `text`; (b) plain `a,b / c,d / e,f` gives `[1,2,3]`, an empty-only body `[]`; (c) a body over 20 MiB read in pieces (`cells: null`, `piecewise` present) with empty records and quoted line breaks: `lineRows` equals the written rows. **Red before the change** (all three: `lineRows` undefined, `TypeError`/`undefined` vs the expected arrays); **green after** (3 pass).
  - Note on the START's "streamed 1 MB CSV": the module streams only over the 20 MiB bound (R6, R9); a 1 MB body takes the whole-file path. Both paths are tested; (c) is a streamed body of just over 20 MiB.
- **Platform check (rule 4).** N.
- **Stored data (R-OLD).** Computed at read time; no stored data changed. A stored reading from before has no `lineRows` (absent = unknown, as the plan says).
- **Words.** No new sentence.
- **Census ops.** None owned; accepted keys unchanged.
- **Proposed requirement lines (BOB writes `build/requirements/csv-reader.md`).** **R16** (G15, K4579; amends R5, R8, R9) `text()`'s sheet carries `lineRows`: an array with one 1-based row number per line of `sheet.text` (lines split on `"\n"`), the same length as the lines, for the whole-file and the read-in-pieces paths alike. A row is the record's number as `cells` and `usedRows` count it; empty records add no line, and each line of a record whose quoted field holds a line break carries that record's row. `[]` when the text is empty. Where the size guard stops the read there is no sheet. Test: `line-rows.test.mjs`.
- **Ran.** `node --test --test-force-exit bio-plane/test/m/csv-reader/` 42 pass, 0 fail; `.../office-readers/` 104 pass, 0 fail (unchanged; it does not import csv-reader). `node build/plan/impact.mjs tranche/T51 HEAD` names 119 modules through shared tables; nothing imports `csv-reader/index.mjs` yet (a later OFFICE-READERS job delegates to it), so no user of the changed service exists to run. `checks/run.mjs`: format 0, architecture 0, coverage 6619 of 6619 ids named, words 0 failures with dev 268 / unkeyed 1982 unchanged, channels 0. `checks/ownership.mjs ... csv-reader tranche/T51 job/T51/csv-reader`: 4 files changed, 0 failures. (The coverage check does not yet list R16, which BOB adds with the requirement; my tests name "R16 (proposed)" in their titles.)
- Size (session_01Wy8nnMT1rzDSVKrq9QgRXP): test runs 8, module lines 884

## J2 · COMPLETE

csv-reader #2 COMPLETE, G15 lineRows. index.mjs csvText: sheets[0].lineRows, one 1-based row (record number, as cells/usedRows count it) per line of sheet.text; whole-file and streamed paths. Red-then-green through csvEntry.text: line-rows.test.mjs (3 tests: empty rows + quoted line break; plain and empty-only; >20 MiB streamed body) - all red before (lineRows undefined), green after. text.test.mjs R5 exact-shape assertion now includes lineRows. csv-reader 42 pass; office-readers 104 pass (unchanged). checks: format, architecture, coverage, words (268/1982 unchanged), ownership 0 failures. Nothing imports csv-reader yet, so no users to run. Proposed R16 text and note on the START's 'streamed 1 MB' (streaming is only over 20 MiB; both paths tested) in my record. No deferral, REPORT or question. Size: test runs 8, module lines 884.

## J3 · QUESTION

QUESTION (replaces none) — the largest CSV the plane reads whole is 17 MiB, not 20, and the START's "lower the bound, refuse at N+1" does not fit R6/R9 as written. Best reading below; I carry on with everything else.

MEASURED (plane/shape harness, csvDoc(N MiB), cap 167 - N, i.e. 128 + 39 - N; reading-pipeline's call patched in a scratch worktree only to pass {inlineCellsMax: 512 KiB}, so cells are held and no record list is kept; csv-reader as committed on my branch):
- survives: N = 4, 8, 12, 16, 17, 17.5. dies (SIGABRT, heap): 17.75, 18, 19, 19.9 (20,900,000 B), 21. At 24 MiB the plane's own hand-off gate (25,165,824 B) states the file and no entry runs.
- 19.9 MiB needs a cap of 156-160 here (147 given): about 10 MB short.
- csv-reader's own share is small and is not where it dies: a 20.9 MB body needs old space 47 MB in a bare node (16 idle) = 31 MB above idle (before this job: 53, and with records and every cell it was 14.9 MB per MB of file). Heap after the entry returns is idle 87.7 + 20.7 (text 19.5 + lineRows); the object dies in the stages after the entry (reading-pipeline's row-block units and classification copy the text), which are not this module's.
- So lowering MEASURED_CSV_TEXT_BOUND_BYTES alone changes nothing at the plane: R6/R9 read a body over the bound, up to ooxml's 32 MiB ceiling, in pieces (cells null), and that band dies in the plane the same way (21 MiB did) because the text is still held whole downstream.

OPTIONS
A. Change no bound; report the numbers (done here). The plane keeps dying on 17.75-24 MiB CSVs (read three times, then "the object stopped", plane R77) until reading-pipeline stops holding the text several times, which is its job's and N1267's.
B. (my recommendation for the alpha, K1881) Set MEASURED_CSV_TEXT_BOUND_BYTES to 17 MiB (17,825,792 B; half a MiB under the largest that fit) and make a body over it a STATED, final refusal with its size (the marker R6 already carries, `final: true`, metric body_bytes), up to the ceiling, instead of reading in pieces; the pieces band for csv (R9, F7) is dropped from csv-reader (its code and large-text test go; a 30 MB body is stated, not read). Needs R6 and R9 amended by you; the plane then states 17-24 MiB CSVs instead of dying, and a later round re-raises the figure when downstream holds the text once.
C. Keep the pieces band (R9) and lower the constant only so the marker names 17 MiB: no behaviour change, no protection.

I will not change the bound or R9 until you answer. Everything else of the entry (cap, cells_held, cellsIn, windowed walk, memory test) proceeds on the figures above; B is a small change afterwards (the constant, one branch, one test at 17 MiB + 1).

## Fix round 6, wave 6 (CSV-READER #3, session_015f6Az85H4GFawFsXC3ch9y): G41 `D1` held cells

- **Cause (rule 1).** `csvParts` kept every record (`walkRecords`, 14.9 MB per MB of file) and `csvText` made one object per cell (about 221 B in memory, 147 B as JSON), so a 1 MB CSV read stored 11.27 MB of cells and died of memory (`diagnosis-R6-g40.md` 3.2, `-g41.md` 1.1).
- **Why the tests missed it (rule 2).** Sheet tests used a few rows; the large tests were over the 20 MiB bound and asserted `cells` null; nothing measured a body at the object's cap. Gap fixed: `g41-held.test.mjs` (1 MB harness body through the entry) and `g41-memory.test.mjs` (an `--expose-gc` child at a 64 MB old space).
- **Changed (`bio-plane/src/csv-reader/index.mjs`).**
  - `csvParts`: a body over `SHEET_WINDOW_MIN_BYTES` (64 KiB, exported; records of a body that size are about 1 MB) keeps no records; UTF-16 validity found in windows (`validUtf16`); `forEachRecord` walks the held body in 1 MiB windows (or the kept list for a small body).
  - `csvText(parts, opts)`: `{inlineCellsMax}` (bytes, the caller's number, B5) lists cells only while the sheet's cells JSON is `<=` it (`listCell`), else `cells: null`, `cells_held: true`; no option lists every cell. Text built in 2,048-line chunks (`CSV_TEXT_CHUNK_LINES`): the 20.9 MB body's own peak fell from 53 to 47 MB cap in a bare node.
  - new optional slot `csvEntry.cellsIn(partsOrBytes, {sheet, fromRow, toRow, fromCol, toCol, maxCells})` (`csvCellsIn`); `typedCell` shared with `text`.
  - K4652 (B7): `MEASURED_CSV_TEXT_BOUND_BYTES` = 17 MiB (17,825,792); a body over it, up to ooxml's ceiling, is a stated final refusal (`why: over_size_bound`, size, `boundName: MEASURED_CSV_TEXT_BOUND_BYTES`, `metric: body_bytes`, `final: true`, plus `encoding` for UTF-16); over the ceiling `textPlan`'s guard as before. The pieces band (`piecewise`, `text_read_in_pieces`, the 10,000-listing of unreadable cells, `cells` null by stream) is removed with its tests.
- **Failing-first (rule 3), through `csvEntry.text/cellsIn/parts`.** Run against the entry as it was (HEAD at the START, scratch worktree): `g41-held` 10 of 11 red (cellsIn absent, cells listed, no `cells_held`; the control green), `g41-memory` red (SIGABRT at a 64 MB old space). Green with the change: 11 and 1. K4652's tests (bound 17 MiB; harness body of the bound read whole; +1 byte stated with size; 30 MB stated, not read) are in `large-text.test.mjs`.
- **Platform check (rule 4, L).** `plane/shape` harness, `csvDoc`, cap 167 − N (128 + 39 − N), reading-pipeline's call patched in a scratch worktree to pass `{inlineCellsMax: 512 KiB}` (not committed): survives N = 4, 8, 12, 16, 16.99, 17, 17.5 MiB; dies 17.75, 18, 19, 19.9 (needs cap 156-160), 21; 17.01 MiB is stated (units 0, the child lives); 24 MiB is the plane's own gate. Tick 1 of a 17 MiB body is 14.8 s here (this machine is 1.4 to 1.5 times slower than the job machines; `diagnosis-R6-g40.md` 2): the plane test's "every tick under 10 s" may need that read to be timed on its machine. A plane test of "the bound" must use a body of at most 17 MiB: `csvDoc(17 MiB)` is 17 MiB plus a row and is stated.
- **Measures.** Cell: 147 B of JSON, so 512 KiB holds 3,566 cells. csv-reader alone at 20.9 MB: lowest cap 47 MB in a bare node (idle 16): 31 MB. `cellsIn` rows 1-100: 27 ms; the last 100 rows of a 20.9 MB body (338,174 rows): 367 ms (4 MB: 73 ms), under K4354's 2 s, so no block cache is needed for csv.
- **Found in other modules.** reading-pipeline: `reading-pipeline/index.mjs` still reads `piecewise` from the csv answer and `text()` takes no option yet (G41 D2, its job); the object dies above 17.5 MiB in its row-block units and classification (the copies), N1267.
- **R-OLD.** Computed at read time; stored readings unchanged.  **Words.** No new sentence; words check unchanged (dev 268, unkeyed 1982).  **Census ops.** None owned.
- **Ran.** `node --import <copy of the shim> --test --test-force-exit bio-plane/test/m/csv-reader/` 55 pass, 0 fail (the shim copy from `job/T51/test-support`, kept outside the tree). Users: office-readers 105 pass, format-registry 43, workbooks 29; file-safety 89 pass, 1 fail (R24, red identically on the unchanged entry, accepted by name in plan section 4). `checks/run.mjs`: format 0, architecture 0, coverage 6674 of 6674, channels 0, words 0 failures; `ownership.mjs` 9 files, 0 failures.
- **Seam (K4647 numbering).** 1-based rows and columns, inclusive ranges, `next_row` the first row not returned and absent when the range is whole, `maxCells` counts in-extent cells; asserted at row 1 and the last row in `g41-held.test.mjs`. No seam test red by name.

### Proposed requirement lines (BOB writes `build/requirements/csv-reader.md`)

- **R6 amended** (K4652): the size guard compares the BODY's byte length (after any BOM) against `MEASURED_CSV_TEXT_BOUND_BYTES`, **17 MiB** (17,825,792), measured at the plane's real shape (17.5 MiB read, 17.75 not). Over it, up to ooxml's ceiling, `structure()` and `text()` carry the marker `{ok:false, text:"undetermined", why:"over_size_bound", size, bound, boundName:"MEASURED_CSV_TEXT_BOUND_BYTES", metric:"body_bytes", final:true}` (and `encoding` for a UTF-16 body) in `undetermined`, `sheets: []`; over the ceiling `textPlan`'s guard. The dialect still stands.
- **R9 replaced**: a body is never read in pieces: no `piecewise`, no `text_read_in_pieces`, no listing cap on unreadable cells. (Test: `large-text.test.mjs`.)
- **R17** (G41, K4636, K4642) Held cells. `text(partsOrBytes, opts)`: with `opts.inlineCellsMax` (bytes; reading-pipeline's number) the sheet lists `cells` only while their JSON is at most it; past it `cells` is `null` and the sheet carries `cells_held: true`; `lineRows`, `text`, `usedRows`, `counts.cells` are those of the whole read. Without the option every cell is listed and there is no marker; a sheet whose cells fit has no marker. Test: `g41-held.test.mjs`.
- **R18** Optional slot `cellsIn(partsOrBytes, {sheet, fromRow, toRow, fromCol, toCol, maxCells})` (async; `sheet` absent, `0` or `"csv"`): `{ok:true, cells, rows:{from,to}, next_row?}`, the typed cells of exactly those rows and columns in row then column order, each identical to `text()`'s (an unreadable field a cell with null value). It stops after `toRow`, or before the row that would pass `maxCells` (whole rows; a first row alone over `maxCells` is given whole): then `next_row` is that row and `rows.to` the row before. `toRow`/`toCol`/`maxCells` absent mean no limit. Never throws: `{ok:false, why}` with `no_such_sheet`, `bad_range`, `empty_body`, `decoder_unavailable:<enc>`, or the R6 marker. Call shape for reading-pipeline and extraction: `entry.cellsIn(bytes, {sheet: "csv", fromRow, toRow, maxCells})`, then continue from `next_row`. Test: `g41-held.test.mjs`.
- **R19** A body of any size up to the bound is read without a record list (walked in 1 MiB windows over 64 KiB, `SHEET_WINDOW_MIN_BYTES`), holding about its text: an 8 MiB body reads in a 64 MB old space (lowest surviving 33 MB). Test: `g41-memory.test.mjs`.
- **R16** wording: "read-in-pieces path" becomes "windowed path".

Size (session_015f6Az85H4GFawFsXC3ch9y): test runs 30, module lines 990

## J4 · COMPLETE

csv-reader #3 COMPLETE, G41 D1. Held cells (inlineCellsMax opt-in, cells_held), cellsIn slot, windowed walk with no record list, chunked text; bound 17 MiB with a stated final refusal above it and the pieces band dropped (K4652). Failing-first red then green (g41-held 10/11 red, g41-memory SIGABRT), plane/shape L: 16.99 MiB read whole at cap 150, 17.01 stated. csv-reader 55 pass; office-readers 105, format-registry 43, workbooks 29; file-safety R24 red on the unchanged entry too. Checks 0 failures. Proposed R6/R9/R16/R17/R18/R19 lines, measures and the tick-time note (14.8 s here) are in my record. Size: test runs 30, module lines 990.

## J5 · COMPLETE

COMPLETE · csv-reader · T51 fix round 7 · R20 (G82 share, as provider)

**Entry applied:** R20. `text(partsOrBytes, {inlineCellsMax, yieldNow})` awaits `yieldNow()` between its 1 MiB windows when `yieldNow` is a function (`bio-plane/src/csv-reader/index.mjs`: `forEachRecord` is now async and awaits it before each window after the first; `csvText` is async). Also awaited between the windows of the UTF-16 validity pass in `parts()` when `text()` is given bytes (that pass is a synchronous walk of the whole body otherwise). A `yieldNow` that is not a function is no yield; one that throws or rejects is ignored (R13: never throws). Without `yieldNow` the answer and behaviour are unchanged.

**Is `text()` already async?** Yes: the entry's `text` was `async` already, so its signature and every caller are unchanged. `cellsIn` also awaits the now-async `forEachRecord` with no `yieldNow` (it is async already). No caller needed a change; `git grep` shows `csvText`/`forEachRecord`/`validUtf16` are module-private.

**Tests** (`bio-plane/test/m/csv-reader/r20-yield.test.mjs`, five tests naming R20): (1) counts `yieldNow` calls on a 3.5 MiB body (>= 3; none for a one-window body; same count given `parts()`), red before the change; (2) equivalence, deep-equal with and without `yieldNow`, bytes and `parts()`, with and without `inlineCellsMax`, over: record, quoted newline, doubled quote and CRLF across the 1 MiB edge, 2-, 3- and 4-byte characters across it, BOM, rows over 300 KiB, an undetermined byte past the head, no final newline, UTF-16LE valid and invalid; also over the size guard, an empty body, non-bytes; non-function / throwing / rejecting `yieldNow`; (3) longest synchronous stretch on a 17 MiB body (test's own clock, taken inside `yieldNow` outside the module, R-CLOCK): 17 stretches, longest 42-72 ms over runs (total 470-690 ms for the read), asserted under 500 ms (the K4354 bar). On the old code (4) and (1)-(2) are red.

**Proposed wording for R20 (BOB writes):** add "also between the windows of the UTF-16 validity pass `parts()` makes for a windowed UTF-16 body, when `text()` is given bytes; a `yieldNow` that throws or rejects is ignored" and drop "(not yet met: T51)".

**Run:** csv-reader tests 60 pass 0 fail (`node --test bio-plane/test/m/csv-reader/*.test.mjs`); reading-pipeline 278 pass, calculations 104 pass, office-readers 115 pass, 0 fail, 0 skipped. Checks from the process repo: format 0 failures; architecture 0; coverage 20 of 20 ids named, 0; words 0; ownership 1 file changed by csv-reader, 0 failures (the new test file; the source file is the other change, ownership counted both as one path set per its output).

**Stale bundles (not regenerated, BOB at the round end):** `agent-worker` (csv-reader source changed; `fleetbundles.test.mjs` also reports `pdfstructure.mjs`, `promotion`, `record-grammar/bundle.mjs`, `site-profiles/handlers/client-rendered.mjs` stale from before this job), and the plane's `bio-plane.bundled.mjs` by the same route. Census ops: none owned.

**Deferred / found in other modules:** none. reading-pipeline (READING-PIPELINE #29) passes a timer-turn `yieldNow` to `text()` and runs its workerd contention test after this merges.

Size (session_01FDqgsYyKdawCypvN6ZABTN): test runs 14, module lines 1005

## J6 · REPORT

REPORT · csv-reader · T51 fix round 9 · ceilings and options this module keeps that READ_BOUNDS has no row for (START ruling 1; nothing waits on this)

For runtime-limits (BOB carries it): one listing cap that is a ceiling by its effect on what a member reads.
- kind `csv`, name `undetermined_listed` (what a sheet lists of its unreadable cells; `counts.undetermined` is the whole count): standard 200, alpha 200, protective 200 (requirement R9, G129f). Today `CSV_STREAMED_UNDETERMINED_MAX = 200` in `csv-reader/index.mjs`, marked "proposed; BOB records its row"; I will swap it for `boundOf("csv", "undetermined_listed")` when the row exists (one line and the quote test).

Working constants I keep that are not read ceilings (no row asked; tell me if you want one): the window of the read (1 MiB, R19), the size below which a body keeps a record list (64 KiB, R19), the records a window's delimiter decision examines (1,000, R7), the lookahead of windows that decided nothing (4), the lines of a text chunk (2,048). The window and the 1,000 records are the requirements' own figures.

Two optional arguments the entry takes, for BOB to name in R3/R5 or leave as test seams: `{windowBytes}` (a scaled window; the corpus smallest-case rule, R-FOUR (3)) and `{declared}` (a legacy charset the source declared; R7 "the declared or detected legacy charset"; the registry passes neither today). Both are the second argument of `parts`, `structure`, `text` and `dialect` (and in `cellsIn`'s query).

## J7 · COMPLETE

COMPLETE · csv-reader · T51 fix round 9 (CSV-READER #5) · G131a, G131b, G131c, G131d (text path), G131e (CSV half), G131i (CSV/TSV windows), G129f, G124e, G130b (owner of `isDelimitedText`), G124 quotes. Tranche merged through B11 (OOXML #4); the ooxml seam test is green.

**Entries applied** (module `bio-plane/src/csv-reader/index.mjs`; R2, R5-R9, R18, R21-R25):
- G131a: the byte transport was `TextDecoder("latin1")` (windows-1252: 0x92 became U+2019), so a UTF-8 field failed its decode. Now a bijective transport; UTF-8, windows-1252/declared legacy and UTF-16 (BOM or none) decode per window. The legacy guess is assumed and stated (`assumed`), never silent.
- G131b/R23: a quote opens only at the start of a field; an open quote at the end of the file is `unterminated_quote` with its row and bytes.
- G131c/R7/R24: encoding and delimiter decided per window (records, majority of up to 1,000), the file's by majority, `disagree` and `windows_disagree` stated, each window read under its own.
- G131d/R5: an empty field keeps its column (`P100\t\t100`).
- G131e/R18: pass 1 leaves access points (byte, row, CR flag); `cellsIn` resumes from the last before `fromRow`.
- G131i/R6/R9/R25: bounds through `boundOf` (50 MB, 1,048,576 records); windows with a carry; `counts.replaced` added.
- G129f: 200 listed, `counts.undetermined` whole. G124e/R22: 16,384-column refusal (`metric:"columns"`), cell kept to 1 MiB with `over_cell_bound`.
- G130b/R21: `isDelimitedText`; `detect` also answers `text/tab-separated-values`.

**Failing-first (R-FOUR (3))**, the old module on the cases, then the new (script run against both):
```
old  G131a {"undetermined":2,"cells":["a","b","1",null,"2",null]}      new  {"undetermined":0,"cells":[...,"it’s",...,"É Ñ 日本 😀"]}
old  G131b {"usedRows":100,"of":500}                                    new  {"usedRows":500}
old  G131c {"title":null,"crOnly":null,"firstLineOver1MiB":null,"utf16NoBom":"us-ascii"}   new  comma, semicolon, comma, utf-16le
old  G131d {"text":"id\tqty\tprice\nP100\t100"}                         new  "P100\t\t100"
old  G129f {"listed":1000}                                              new  listed 200, count 1000
old  G124e {"document":"read","usedCols":16385}                         new  refused, marker metric "columns"
old  G130b isDelimitedText undefined, detect(tsv) null                  new  function, "csv"
```
New test files, each red against the old module (windows 16 of 17 red, bounds 2 of 2, delimited and text red on import): `windows`, `delimited`, `bounds`, `standard-size`, `text` (rewritten), `ooxml-seam`.

**Platform check (L), capped child:** a 50 MiB read survives a 144 MB old space and not 128 MB (retained 59.6 MB after the read; the transient is the chunks plus their join). The isolate is 128 MB with the body's bytes inside it: that is a Stage-3 platform figure for BOB (R-GATE), not a change here. The corpus R set runs the full size.

**Tests:** csv-reader 95 pass 0 fail (every id R1-R25 named, coverage 25 of 25). Heavy files (standard-size, large-text, windows, r20-yield, g41-memory) run alone 5 times on all cores and 5 times on one core (`taskset -c 0`): 50 of 50 runs pass; R20 longest stretch 36-60 ms (bar 500). Users: format-registry 43, office-readers 115, calculations 114 pass. reading-pipeline 313 pass, 6 fail (see below). Checks from the process repository: format 0, architecture 0, coverage 25 of 25, ownership 0 (18 files), words (csv-reader) 0 (unkeyed 0).

**Found in other modules (for BOB):**
- reading-pipeline `g48-first-tick.test.mjs` controls csv-100k, csv-under-bound, csv-3m, csv-3m-small-budget record the old dialect: `encodingConfidence` certain -> likely (R7: us-ascii at likely only) and the delimiter signal "first 50 lines" -> "first N". They need re-recording by that job. Two other reading-pipeline reds have no csv path (R29 R23 text-recognition; R40 R36 BUDGET-2024-APP PDF); I did not examine them at baseline.
- calculations (job 31) reads `delimiterSignature(text)` (kept, same shape) and its table text now has the empty slots. reading-pipeline's G131b mirror (`:1732`) is job 27's. format-registry takes `isDelimitedText` (job's edge).
- Stale bundles (BOB regenerates): agent-worker and the plane's bundled artifacts that embed csv-reader source.

**Proposed requirement wording (BOB writes):** (1) R7 Uses: ooxml's `decodeText` is whole-bytes and cannot stream windows, so csv-reader keeps its own per-window decision and the seam test checks the two agree. (2) R5: `counts.replaced`; undetermined reasons `unterminated_quote {row, bytes}` and `over_cell_bound {length}`. (3) the entry's optional second argument `{windowBytes, declared}` (see the REPORT). (4) R8's "cells is null over the size guard" reads `sheets: []` (carried from #4's note). (5) drop the "(not yet met)" marks.

**Census ops owned:** none. **Deferred:** none. **R-PATH:** every path reaches this module through the one entry; the sibling-path doors are control-plane's seam (sections 12, 14).

Size (session_017pSg8G4No9aLcVtFV4dsxE): test runs 40, module lines 1294

## Fix round 10, batch 3 — CSV-READER #6 (session_017Uh2sTFUFdx4GLx1SnmNqp), cause R20

**Root (file:line):** `decideDelimiter`, `bio-plane/src/csv-reader/index.mjs:~395-410`: a delimiter counted as consistent only when one exact per-line count held on over half the lines; a file whose every row is ragged (three widths) has none, so the delimiter was null and the file read as one column.
**Change:** a delimiter is consistent when it occurs at least once on more than half the lines, whatever its count (R7 as amended); where several are consistent the one whose modal count holds on the most lines wins, still equal is `tied`. The "occurs on N of M lines" signal now reports lines where it occurs. No limit a member meets changes; Platform: N.
**Why the tests missed it:** `text.test.mjs` and `windows.test.mjs` made a ragged row one in 17 or 50; `sheetgen`'s `ragged` was used in no csv-reader test.
**Failing-first (red, then green):** `windows.test.mjs` "R7 a 3,000-row five-column CSV with a title block and ragged rows …": `generate({kind:"csv",seed:"rw9-B-5c",size:{rows:3000,cols:5},header:"title",ragged:true})` through `csvEntry.text`. Red before: `delimiter` null (actual null, expected 'comma'). Green after: comma, `usedCols` 5, `usedRows` 3003, the mark `rw9-B-5c-R3003-C1` at A3003 in a five-field row; controls ragged alone and title alone read as before.
**Existing test updated to the amended R7 (not weakened):** `text.test.mjs` "R7 dialect delimiter": `"a,b\n1,2,3\n"` is now comma (the comma is on every line; it was asserted null under the old exact-count rule), the "half is not a majority" and none-consistent assertions use `"a,b\nplain\n"`, and a new tie-break assertion (`"a,b;c;d\n1,2;3;4\n5;6;7\n"` is semicolon).
**Tests:** csv-reader 96 pass 0 fail. Users run: format-registry, calculations r7-delimiter, acquisition r12, office-readers (229 pass 0 fail); reading-pipeline and extraction (790 tests, 789 pass, 0 fail, one not counted as pass). `impact.mjs` names 119 modules through the shared table; the modules that call the changed service are those run.
**Checks:** format 0 failures; architecture 0; coverage 25 of 25; ownership 0.
**fixtures-own / fixtures-generic markers added:** none. **Deferred:** none. **Found in other modules:** none new. Stale bundles that embed csv-reader source: BOB regenerates (as in the earlier section).
Size (session_017Uh2sTFUFdx4GLx1SnmNqp): test runs 8, module lines 1304

## J8 · COMPLETE

R20 done (G4): decideDelimiter now counts a delimiter consistent when it occurs on the majority of lines, modal count breaking ties (index.mjs ~395-410). Failing-first windows.test.mjs R7 (title+ragged 3000x5) red (delimiter null) then green (comma, 5 cols, 3003 rows, mark at A3003). One old text.test.mjs R7 assertion (a,b/1,2,3 = null) updated to the amended R7. csv-reader 96/96; users (format-registry, calculations, acquisition, office-readers, reading-pipeline, extraction) 0 fail; checks format/architecture/coverage 25 of 25/ownership 0 failures. No markers, no deferrals. Platform N. Size (session_017Uh2sTFUFdx4GLx1SnmNqp): test runs 8, module lines 1304.

## Fix round 10, follow-up 11 — CSV-READER #7 (session_01KK3V2itArCQimGgpgdg95M), one-line file past the column bound

**Root (file:line):** `createRecordWalk`, `bio-plane/src/csv-reader/index.mjs` (`endRecord`, `info.cols`), and `csvParts`'s `onRecord` guard (~:807). R7 decides no delimiter for a body of fewer than two complete lines (`delimiter_undetermined_too_few_lines`), and an undetermined delimiter reads each record as ONE field, so `info.cols` was 1 for `c0,c1,...,c16384` and the R22 check (`info.cols > CSV_COLUMNS_MAX`) never fired. The same held for any record read under a null delimiter (a tie, no consistent delimiter).
**Change:** while no delimiter is decided, the walk also counts occurrences of each of the four candidate delimiters (comma, semicolon, tab, pipe) outside quotes and reports `info.wide`, the most fields the record would have under any one of them (`0` when a delimiter is decided). The guard judges `max(info.cols, info.wide)` and states the count and the limit in R6's marker with `metric:"columns"`. The dialect is untouched (R3, R7): the line is still read as one cell with `delimiter:null`; only the refusal uses the count. Commas inside a quoted field are not counted. Platform: N.
**Why the tests missed it:** every R22 test used a header plus a data line, so R7 decided a delimiter; none had a single line wider than the bound.
**Failing-first (red, then green):** `text.test.mjs` "R22 a body of ONE line …" through `csvEntry.text` and `csvEntry.structure`, for comma, semicolon, tab and pipe, with and without a final newline: 16,385 columns refused with `{size:16385, bound:16384, boundName:"SHEET_COLUMNS_MAX", metric:"columns"}`, `document` null, `sheets` []; 16,384 on one line read (no marker, one sheet); a 16,389-comma quoted field is one cell, not refused. Seen red before the change (the 16,385-column line was read, `usedCols` 1, only an `over_cell_bound`), green after. The many-line past-bound test and its 16,384 control are unchanged and pass.
**Tests:** csv-reader 97 pass 0 fail. Users: format-registry 59, office-readers 164, odf-reader 127, calculations 143, acquisition 356, reading-pipeline 437 (0 fail; the one not counted as pass was so before), extraction 381, all 0 fail. `impact.mjs` named 107 modules, driven by an unrelated `extraction` DECLARED_OPS difference between the tranche and this branch; I ran csv-reader's users, not those.
**Checks (absolute root):** format 0 failures; architecture 0; coverage 25 of 25; ownership 0; words 0; fixtures 0.
**fixtures-own / fixtures-generic markers added:** none. **Deferred:** none. **Found in other modules:** none. Stale bundles that embed csv-reader source: BOB regenerates.
**Note for BOB (R22 wording, optional):** R22 could say "while R7 decides no delimiter, the bound judges the most fields the record would have under comma, semicolon, tab or pipe".
Size (session_01KK3V2itArCQimGgpgdg95M): test runs 12, module lines 1314

## J9 · COMPLETE

Follow-up 11 done. Root: an undetermined delimiter (R7: fewer than 2 complete lines, or a tie) reads each record as one field, so info.cols was 1 and R22's guard never fired on a one-line 16,385-column file. Fix: the record walk also counts comma/semicolon/tab/pipe outside quotes while no delimiter is decided (info.wide); the guard judges max(cols, wide) and states the count and limit in the metric:columns marker. Dialect unchanged. Failing-first test text.test.mjs 'R22 a body of ONE line' (all four delimiters, with/without final newline, text and structure; 16,384 read; quoted commas not counted) seen red then green. csv-reader 97/97; users format-registry 59, office-readers 164, odf-reader 127, calculations 143, acquisition 356, reading-pipeline 437, extraction 381: 0 fail. Checks (absolute root): format, architecture, coverage 25/25, ownership, words, fixtures: 0 failures. fixtures markers added: none. Deferred: none. Platform N. Size (session_01KK3V2itArCQimGgpgdg95M): test runs 12, module lines 1314
