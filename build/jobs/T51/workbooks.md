# workbooks (T51)

**Status** · session_011euAAFYAD76GYT6xKMDMLz · depth 2 · WORKING · handled B3

## J1 · REPORT

Found in another module, for BOB (not fixed here: P9).

- `bio-plane/src/case-grammar/words.mjs:61` (plain) and `:94` (copy): "not recomputed here: a workbook this group's Civicsmith did not recompute..." / "...this team's Civicsmith did not reco...". The sentence is case-grammar's own member-read text. It copies the workbooks module's "not recomputed here" disclosure wording, so it belongs in case-grammar's job, which should read it by key. The workbooks module's own key for the same meaning is `workbooks.recomputed` (index.mjs:35-37).

Decision for the words pass (T51-264), so BOB can check it:

- The one `plain` finding, `bio-plane/src/workbooks/index.mjs:517`, was the second half of the grade-facts `rule` text returned by `readWorkbook` (R12). `readWorkbook` answers that to members, so I treated it as a sentence people read. It is now `localize("workbooks.index.k1447_grade_rule", <the full sentence, one literal>)`. The wording is unchanged. `rows.mjs` is stale for this id, which is expected until BOB regenerates it at L1's close.
- No test copies the rule's text. The R12 test asserts behaviour, not the sentence.

## J2 · COMPLETE

T51-264 (words pass, workbooks) is applied; nothing deferred.

Applied: the one `plain` finding, `bio-plane/src/workbooks/index.mjs:517`, the grade-facts rule text (R12), is now `localize("workbooks.index.k1447_grade_rule", ...)`. Wording unchanged. Import changed to `{ word, localize }`. Reasoning and the other-module findings are in the REPORT posted just before this entry.

Merged `tranche/T51` into the branch (`b6473c33ff`, no rebase); the merge brought no change to this module's paths, and the tests and checks were re-run after it.

Tests and checks:
- `node --test "test/m/workbooks/**/*.test.mjs"`: `tests 26`, `pass 26`, `fail 0`.
- `checks/format.mjs`: `175 modules, 174 requirements files; 0 failures`.
- `checks/architecture.mjs workbooks`: `15 product files, 55 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `checks/coverage.mjs workbooks`: `1 modules, 18 of 18 live requirement ids named by a test; 0 failures`.
- `checks/ownership.mjs ... tranche/T51 job/T51/workbooks`: `2 files changed by workbooks ...; 0 failures` (the module file and this record).
- `checks/run.mjs /home/user/bio`: the product-wide run is not clean (words `3775 failures`, coverage `30 failures`, all in other modules). No finding names `workbooks`; the two `case-grammar` lines are reported above.
- `setup-words/build.mjs --check`: the expected stale-rows note for `rows.mjs` (it lacks `workbooks.index.k1447_grade_rule`, which BOB regenerates at L1's close), and no refusal naming this module.

Size (session_01TeE3fNR4NDUXScqV2cLzgW): test runs 2, module lines 1589

## G44 · WORKBOOKS #5 (session_01BnkTWoC5GF8VJe3V4sMRF5) · fix round 6, B2 START

**Providers' state.** Merged on `tranche/T51` and used: office-readers' `xlsxEntry.text(bytes, {inlineCellsMax})` with `cells_held` (R36). Not needed by this entry: `cellsIn`, csv-reader, extraction. The other G44 jobs (file-safety, screens-intake, plane) are not merged; none is a provider of workbooks. Seam reds by name: none.

**What changed** (`bio-plane/src/workbooks/index.mjs`)
- :40-47 the three protective bounds, exported: `WORKBOOK_FILE_MAX_BYTES` 20 MiB (stored size), `WORKBOOK_CELLS_MAX_BYTES` 9 MiB (cell JSON), `WORKBOOK_CELLS_MAX` 50,000 cells.
- :62-72 `fileTooLarge` and `cellsTooLarge`: refusals `WORKBOOK_FILE_TOO_LARGE` {size, bound (MB strings, one decimal, decimal MB), size_bytes, bound_bytes, condition: `stored_size` | `declared_text`} and `WORKBOOK_TOO_LARGE` {cells, bound_cells, condition: `cell_bytes` | `cell_count`}; `detail` is `localize("refusal.<CODE>", en, vars)`, the figures as variables. The shell draws `refusal.<code>` with the whole refusal body as variables (`interface-shell/browser.mjs:166-168, 346-347`), so the figures reach the member's words with this module alone; the plane job proves it through the door.
- `#stored` (head only: the whole's, else the parts' total via `provenance.partsNamed`), `#tooLarge` (`COUNT(*)`, R-OLD), `addWorkbook` reordered and capped (`:~225-290`), and the gate in `inputsOf`, `recompute` (before the engine is asked), `lint`, `explainLint` (after `NO_NOTE`), `readWorkbook`.
- R1's order is now `NO_SHA`, `CAPTURE_NOT_HELD` (by the head), `NO_QUESTION`, `NO_PERIOD`, `NO_PROJECT`, `already`, then `WORKBOOK_FILE_TOO_LARGE` (stored size, before any byte loads), then the read: `WORKBOOK_FILE_TOO_LARGE` (the entry's guard marker, or a piecewise read: declared text over its whole-read bound, e.g. 26.2 MB), `WORKBOOK_TOO_LARGE`, `NOT_A_WORKBOOK`. A decision of mine: the piecewise condition is a file condition, so it is `WORKBOOK_FILE_TOO_LARGE` {condition: declared_text}, not a cell count.
- Tests pinned to the old order, updated: `add.test.mjs` R1 (the text-with-blank-question row is now `NO_QUESTION`; `NOT_A_WORKBOOK` asserted after the cheap refusals; the 21 MiB capture is now `WORKBOOK_FILE_TOO_LARGE` stored_size). Fixture: `head` returns `size`; `capture()` takes `parts`.
- Census: `addworkbook` accepted keys unchanged (K4208); nothing to declare.

**Failing-first.** `test/m/workbooks/g44-large.test.mjs` (8 tests, through `workbooksOps(...)` over `world()`, in capped children `g44-child.mjs`, shapes `g44-shapes.mjs`). Against the earlier source (same tests, bounds exported only): 6 red, 2 green; the two green are the control and the formula-heavy-at-the-bound case, which the old code survives below 99,000 cells (their purpose is the bound's margin, below). Against the new source: 8 pass. Cases: (a) 221,376 cells at the cap: old dies, new refuses stated with the count, no row; (b) control; (c) bound, bound+1 and exact bound; (d) formula-heavy; (e) 26.2 MB declared and a 41 MB capture; (f) cheap refusals and repeat read no cells (counter on `xlsxEntry.text`); (g) size before `bytesOf`, parts gated by total; (h) R-OLD: 120,000 stored cells, all five ops stated, no crash; (i) count versus byte condition.

**Measures** (child old space = 128 + 39 - 87.7 + idle 33.4 - file MB = about 112 at these file sizes; the object leaves 79 MB above idle; "lowest" is the lowest cap in a 2 MB scan at which add, read, lint, inputs, explain and recompute all answered):
| shape at the bound | cells | cell JSON | lowest surviving cap | above idle | margin on 79 |
|---|---|---|---|---|---|
| constants | 49,998 | 7.4 MiB | 76 | 42.7 | 1.85x |
| one-character cells | 50,000 | 7.2 MiB | 76 | 42.7 | 1.85x |
| 2 formulas a row | 49,998 | 7.5 MiB | 84 | 50.7 | 1.56x |
| 3 formulas a row | 50,000 | 7.5 MiB | 84 | 50.7 | 1.56x |
| 3 formulas a row, 185 B a cell (the NOFA shape) | 50,000 | 8.8 MiB | 88 | 54.7 | 1.44x |
Larger, for the choice: 56,000 cells of the NOFA shape (9.9 MiB) lowest 100 (1.18x); 60,000 formula-heavy 94-100. The failing op at the edge is `recompute` (the stub engine answers every formula cell) or `explainLint`. Each op's individual floor was not bisected; the first op to die is `recompute`/`explainLint` for formula-heavy and `readWorkbook` for constants. The refusal path: the 10 MiB-declared workbook's refusal and the 26.2 MB-declared file's both complete at the real-shape cap (end heap 64 MB over idle 33), so the size gate stays at 20 MiB. The bound was raised from the candidate 8 MiB to 9 MiB because the candidate refused the corpus's NOFA/Acq-Rehab/Sites-Inventory analysis workbooks (45,000-49,000 cells, 8.2-8.6 MiB) while the measure shows a 1.44x margin at 8.8 MiB. 56,000 cells (1.18x) was not taken.

**Corpus** (public bucket `cao-94612`, 270 `.xlsx` listed today, 161 MB; the rule run on each as the add runs it; 1 is not a zip): 225 held, 26 refused for cell JSON over 9 MiB, 1 for more than 50,000 cells, 17 for declared text over 20 MiB (the stop-data sheets). 44 of 269 readable (16%) would be refused; of the 118 with formulas, 13 (11%). Median 1,026 cells; p90 105,942. The refused are the large data sheets (stop data, use of force, the 2020-23 "Oakland" budget books at 130-143k cells), not the analysis workbooks. Eight copies of the 8.7-11 MiB housing-and-zoning and APR forms sit just above the bound. A larger-workbook design is N1267's.

**For BOB to report to Bob (K1881).** Bounds: stored file 20 MiB (21.0 MB), 9 MiB of cell JSON, 50,000 cells; the share above.

**Proposed requirement lines.** R1 amended: refuses, in order, `NO_SHA`; `CAPTURE_NOT_HELD` (by the evidence store's head); `NO_QUESTION`; `NO_PERIOD`; `NO_PROJECT`; a repeat answers `already: true`; then `WORKBOOK_FILE_TOO_LARGE` {size, bound} (a capture stored above 20 MiB, checked before its bytes load, a capture held in parts by its total; or a file whose text the reader will not hold), `NOT_A_WORKBOOK`, `WORKBOOK_TOO_LARGE` {cells, bound_cells} (more than 50,000 cells, or cells of more than 9 MiB as JSON); each states its figures and the condition, writes nothing. New: R2 and every read or act that loads a workbook's cells (`readWorkbook`, `inputsOf`, `lint`, `explainLint`, `recompute`) counts the stored cells first and, above 50,000, answers `WORKBOOK_TOO_LARGE`; the bound is set by measure so the largest workbook the add holds survives all of them. R19 unchanged. Rows owed to UX-DESIGN: `refusal.WORKBOOK_TOO_LARGE` ({cells}, {bound_cells}), `refusal.WORKBOOK_FILE_TOO_LARGE` ({size}, {bound} in MB); their `en` is in `index.mjs`.

**Not wired / noted.** `rows.mjs` is stale for the two ids (expected). Platform costs of 50,000 inserts in one transaction were not measured (node only). The words check's one failure is test-support's `platform-sqlite.mjs:44`, not mine. Inherited under the preload: `case-authoring` R17 fails with and without my change.

**Tests and checks.** `node --import ./test/platform-sqlite.mjs --test --test-force-exit "test/m/workbooks/*.test.mjs"` from `bio-plane/`: tests 37, pass 37, fail 0. Users (`affordances/t33`, `plane/t33`, `op-grades/owners`, `case-authoring`): 283 tests, 1 fail, the inherited R17 above. `checks/format`: 0 failures; `architecture workbooks`: 0 failures; `coverage workbooks`: 19 of 19 live ids named; `checks/run.mjs`: no finding in my files. Ownership: run after the commit (below).

Size (session_01BnkTWoC5GF8VJe3V4sMRF5): test runs 14, module lines 1667

## J3 · COMPLETE

G44 (workbooks, the add) is done; details in my record's section "G44 · WORKBOOKS #5".
Bounds to report to Bob (K1881): stored file 20 MiB; cell JSON 9 MiB; 50,000 cells. Measured at the real-shape cap (about 112 MB): the largest workbook under the bound survives add, read, lint, inputs, explain and recompute with margin 1.44x (formula-heavy, 185 B a cell) to 1.85x. The candidate 8 MiB was raised to 9 MiB because it refused the NOFA/Acq-Rehab/Sites-Inventory analysis workbooks (45-49k cells).
Corpus (270 .xlsx of bucket cao-94612): 44 of 269 readable refused (16%); of 118 with formulas, 13 (11%); the refused are the large data sheets.
Tests: workbooks 37/37; g44-large 8 tests (6 red on the earlier source, 8 green). Users: 282 of 283; the one red is case-authoring R17 under the platform-sqlite preload, same on the earlier source. Checks: format, architecture, coverage, ownership 0 failures.
Proposed requirement lines, rows owed to UX-DESIGN (refusal.WORKBOOK_TOO_LARGE, refusal.WORKBOOK_FILE_TOO_LARGE) and the R1 order amendment are in the record. Decision of mine: a file whose text is over the reader's whole-read bound is WORKBOOK_FILE_TOO_LARGE (condition declared_text). Plane job proves the refusal's variables reach the member's words through the door.

## J4 · REPORT

REPORT · WORKBOOKS #6 · rows I need in runtime-limits' `READ_BOUNDS` (R-FOUR rule 1; I do not edit read-bounds.mjs).
R1/R2/R20 read three bounds through `boundOf`; only the first has a row, and its alpha is still 50,000:
1. kind `workbook`, name `cells`: the alpha must be 250,000 (G137e merges with this job; K4831 (10)). Today `workbook.cells = row(250000, 50000, 250000)`, so `boundOf` answers 50,000.
2. NEW kind `workbook`, name `bytes` (the capture's stored size the add refuses above, today `WORKBOOK_FILE_MAX_BYTES`): standard 50 MB (K4845), alpha 20 MiB (20971520, today's), protective 50 MB, key `limit.workbook.bytes`.
3. NEW kind `workbook`, name `cells_json_bytes` (the cells' JSON the add lists, today `WORKBOOK_CELLS_MAX_BYTES`): 9437184 (9 MiB, today's) in all three columns, key `limit.workbook.cells_json_bytes`. I will report what the capped child shows at 250,000 cells and may ask to change it.
Until these merge I test with a local, uncommitted copy of those rows; nothing of read-bounds.mjs is in my diff.

## J5 · REPORT

REPORT · WORKBOOKS #6 · replaces the figure in my J4 for `workbook.cells_json_bytes` (the other two lines of J4 stand).
Measured in a capped child (capFor(N), 204 MB for a 2 MB file; fixture cursors lazy, as a Durable Object's): a 250,000-cell workbook is 36.8 to 44.9 MiB of cell JSON (40 B to 190 B a cell; the 250,000-cell shape of 17.2 MB declared text, the largest the 20 MiB declared-text bound lets in, is 44.9 MiB). With 9 MiB the bound refuses even a 130,000-cell workbook, so 250,000 cells can never be reached. The add, read, lint, inputs, explain and recompute of every 250,000-cell shape I built (constants, 1-character cells, 2 formulas a row, 3 long formulas a row) survive down to a cap of 140-180 MB, so the object has room for the JSON figure below.
Row asked: kind `workbook`, name `cells_json_bytes`, standard = alpha = protective = 67108864 (64 MiB), key `limit.workbook.cells_json_bytes`. The other two rows as in J4 (`workbook.cells` alpha 250000; `workbook.bytes` standard 50 MB, alpha and protective as the table's `bytes()` helper gives with 20 MiB).
Also learned: the reads of a held workbook now go by cursor and by position (a new index `workbook_cells_position`), so nothing loads every cell at once; I tell it in my record.
