# content (T33)

**Status** · session_0163Apu7btH1Rwvt1F7kyCNq · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

**Where the typed cells and the office metadata are held (R46's sheet arm, R52, R53): neither place holds them.**

Measured on `job/T33/content` (tranche/T33 merged at 1cb3158218):
- The readers emit them: `formats-xlsx.mjs`/`csv.mjs`/`odf.mjs` give each sheet `cells` (office-readers R30, odf-reader R46); `docx.mjs`/`pptx.mjs`/`formats-xlsx.mjs` give a top-level `metadata` (office-readers R31).
- `reading-pipeline` drops both: `readingFromWire` composes the reading from `entities`, `facts`, the chain and the basis; `containerExtentOf` keeps each sheet's `{name, rows, cols, usedRows, usedCols}` only; `textUnitsFor` makes one `sheet-range` unit per sheet (the whole used range, its text only). So `extraction.readingOf(sha).reading` (R30) and `unitsOf(sha)` (R36) hold neither, and nothing else persists them.
- So R46's `sheet-cell`/`sheet-range` arm, R52 and R53 have nothing to read. Adding storage here is ruled out by the entry (P6: wiring only) and my Suggestions.

**My best reading (for you to rule):** `reading-pipeline` (its job T33-23 is running) adds two keys to the reading it composes: `metadata`, the entry's object as emitted (or null), and `cells`, `{<sheet name>: <that sheet's cells list, or null>}` for a workbook (absent otherwise). `extraction` persists the reading unchanged (R19) and `readingOf` returns it in `reading` (R30), so no extraction code changes. `content` reads `readingOf(sha).reading.cells[sheet]` and `.metadata`, synchronously, as R46/R52/R53 state. Cost to weigh: the reading also rides `data/provenance.json`; R30's cells are bounded by the entries' size guard (over it, `null`), but a large workbook's cells would enlarge every reading row and the bundle file. The alternative, re-reading the stored bytes through the format entry inside `content`, would make R46/R52/R53 async and duplicate the reader path, so I do not propose it.

**Meanwhile:** I am coding R52/R53/R46's sheet arm against that shape (one private reader, so a different ruled shape changes one function), with tests on a stand-in extraction; and R54 (`declareTable`) now. The R46/R52/R53 tests against real readings wait on your answer.

## J2 · COMPLETE

**T33-24 applied** (C:A-5; K1448; K1505 (11); B2/K1556's shape), commit 2c1e07b185 on `job/T33/content`. Wiring only: module 3,533 → 3,683 lines (P6 guard held).
- **R52** `cellsAt(contentId)`: the typed cells of a held `sheet-cell`/`sheet-range` row inside its extent, field for field as the reader states them, row then column order; `{cells: null, reason, why}` for not held, stale, another kind, or no typed cells held for that sheet (never `[]` for what was not read). The rule is pure (`typedCellsAt`, `notice.mjs`); one private reader (`#officeOf`) reads `readingOf(sha).reading.cells[sheet]` and `.metadata`, so a different storage shape changes one function.
- **R53** `officeMetadataOf(captureSha)`: `{capture_sha, metadata: {author, lastModifiedBy, created, modified, source}}` as the file writes them, or `{metadata: null, reason}` (`never_read`, `not_office`, `none_held`).
- **R46** sheet arm: `heldTextAt` (the one rule) gives a cell's stored value, a range's values one per line; a cell not held, or held with an undetermined value, is null; with no typed cells for the sheet it falls back to the units rule unchanged.
- **R31** (found, fixed in my module): with R46's arm, a sheet passage's cited text would have met the newer capture's tab-joined unit text and graded an unchanged sheet as affected. `gradeAcross` now compares cells with cells where both readings hold them (A / C / NOT_FOUND, a cleared cell in a held sheet NOT_FOUND), else units with units. `markStale`'s grade (no cells in `unitsBefore`) stays on units.
- **R54** the four tables declared through `declareTable` (purge clear on `bundle_id`, sight bundle, the rest `declarePurge`'s defaults: expunge none, export admin-only, derive stored, version_chain false); a refusal throws (wiring defect). Confirmed against `declarePurge`'s call: same four tables (R39, K73).
- **Answer shapes** (my technical choice, P17): R52 and R53 answer an object whose `cells`/`metadata` is null with `reason` and `why`, so a caller always has the reason.

**Deferred:** none in my module. R46/R52/R53 are tested on cells from the real CSV reader and hand-stated xlsx cells through a stand-in extraction; the tests over real readings wait on your CHANGE once reading-pipeline R28 is on `tranche/T33` (B2).

**Found in another module:** none beyond J1 (ruled K1556).

**Final `uses`:** unchanged; new imports only from `text-chain` (`rangeCorners`, `a1ToRowCol`) and, in tests, `office-readers`' `csv.mjs`.

**Tests and checks:**
- `node --test bio-plane/test/m/content/`: tests 122, pass 122, fail 0 (new `office.test.mjs` R52 ×3, R53, R46, R31; R54 in `mint.test.mjs`).
- The 22 modules that use content (their `tests`, plus `test/system/migrate-released.test.mjs`), on my tree and on the unchanged base: the same failure set, all named in B1 (affordances R2 R3 R7 R12; case-authoring R30; case-disclosures R21; control-plane R26; filings R9, R30). Nothing new.
- `format`: 0 failures. `architecture content`: 22 files, 0 failures. `coverage content`: 54 of 54 live ids named, 0 failures. `ownership content tranche/T33`: 5 files, 0 failures.

Size (session_0163Apu7btH1Rwvt1F7kyCNq): test runs 9, module lines 3683

## J3 · COMPLETE

**B3 applied.** `tranche/T33` merged (63b0c1373d, reading-pipeline R28 in). R46, R52, R53 and R31's sheet arm are now tested over **real readings**: a workbook assembled in `test/m/content/realread.mjs` (a stored zip: shared strings, a stored decimal `0.10`, a formula `B1+B2` with cached `999`, an empty cell, a second sheet, core properties), read by the real xlsx entry through the real `reading-pipeline.read`, and handed to content as extraction's `readingOf` answers it (extraction persists the reading unchanged, its R19/R30). Only the persisting table is stood in. A hand-stated reading remains only for what the pipeline no longer writes: a reading stored before R28 (no `cells`/`metadata`) and a sheet over the guard (`cells: null`). R53 runs on a real xlsx with and without `docProps/core.xml`, a real CSV (`none_held`: the registry counts csv as a parts-walking container, R42, and csv states no metadata, office-readers R31) and a real HTML capture (`not_office`). New: a reader-undetermined cell (a shared-string index the table lacks) has no text (R46). No module source changed in B3; commits 68f5258d9b, plus one dropping the jurisdiction view from the helper.

**One check needs you (modules.json is yours):** `architecture content` fails once: `test/m/content/realread.mjs` imports `reading-pipeline` (`read`), which content's `uses` does not declare. It is the edge B3 asks for (real readings through the real pipeline); reading-pipeline is earlier in layer 4, so P4 holds. Please add `reading-pipeline` to content's `uses` (test-only need), or say if you want the tests to take the reading another way.

**Tests and checks:**
- `node --test bio-plane/test/m/content/`: tests 123, pass 123, fail 0 (`office.test.mjs`: R52 ×3, R46 ×2, R53, R31).
- The 22 using modules: not re-run in B3, because no provided service changed since J2's run (same failure set as base, all named in B1).
- `format`: 0 failures. `architecture content`: 1 failure, above. `coverage content`: 54 of 54, 0 failures. `ownership content tranche/T33`: 6 files, 0 failures.

**Final `uses`:** content's, plus `reading-pipeline` for its tests (above).

Size (session_0163Apu7btH1Rwvt1F7kyCNq): test runs 14, module lines 3683
