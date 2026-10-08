# extraction (T36)

**Status** · session_01VgbqiWA5e3MLeiVgTNS9KZ · depth 2 · WAITING ON BOB (J1) · handled B0

## Work

**Read** · BOB's START measured the reading set at 602 KB, over 300 KB, so per (3): read whole myself `build/requirements/extraction.md`, layer 4's row of `build/layers.md`, the plan's "Rules at the opening" and entries T36-13 and T36-13a, K2092, the code my entry changes (`bio-plane/src/extraction/index.mjs`, the read, writer, history, `readingOf` and N26 parts) and the tests it changes (`read.test.mjs`, `n26.test.mjs`, `fixture.mjs`'s docx helpers), and the used services named: `office-readers` R11 (docx `tables[].cells`), R16, R28; `reading-pipeline` R28 and its `emittedFieldsOf` on the tranche tip. A worker read whole the rest of the module (`extractrun.mjs`, `checks.mjs`, `drift.mjs`, `filemembership.mjs`, `ops.mjs`, `schema.mjs`) and every other test file, and wrote a summary of about 1,400 words, each statement citing file and line: no code there reads, strips or re-serializes a reading's fields (the reading is stored and kept as whole JSON, `schema.mjs`:23, :322); the one existing `cells` assertion is `pdfstructure.test.mjs`:308 (a pdf re-read carries no `cells`), which still passes. Nothing it left out mattered.

**Applied** · T36-13 (N724, its share; K1972, K2092): R70.
- The read, writer and `readingOf` already carry a reading's fields unchanged (the reading is stored as its JSON), so R70's path needs no code here once `reading-pipeline` composes `cells` (its R28, T36-13a).
- `n26MigratedReading` (R66, the suggestion's ask): a reading carrying `cells` has each `table <n+1>` key moved to `tables[old].new`, its cells' `doc-table` sources moved with it, the cells of a table N26 no longer reads dropped, the keys listed in N26's table order; cells are not counted in `migrated.n26.moved` (they are not references the reading names); `null`, `{}` and an absent `cells` stay as stored.
- New `bio-plane/test/m/extraction/r70.test.mjs`, five tests naming R70: from `.docx` bytes holding a table of dates and amounts (and a second table) through `read`, `writeReading` and `readingOf` (and `readingFor`), asserting the cells field for field as the docx entry emits them; `{}` for a body with no tables, a stored `null`, and a pre-R70 reading with no `cells`, kept distinct (R45); R23's history keeping the pre-cells reading and the new one by digest; N26's pure migration and its run through the store moving `cells` keys.

**Merged** · B2 (CHANGE): `tranche/T36` @ 1e305d401c (reading-pipeline T36-13a, R28's `.docx` cells; K2106) merged into this branch; the R70 read-path tests now run against the real R28. Before it, the three read-path tests had been checked against a local, uncommitted stand-in for R28's docx share, since removed.

**Deferred** · none. **Found elsewhere** · none.

**Tests** · `node --test bio-plane/test/m/extraction/`: tests 132, pass 132, fail 0. As a user of reading-pipeline's R28, its own tests: `node --test bio-plane/test/m/reading-pipeline/`: tests 92, pass 92, fail 0. Layer tests: none (manifest).

**Checks** · `format.mjs`: 135 modules, 134 requirements files; 0 failures. `architecture.mjs extraction`: 28 product files, 105 relative imports; 0 failures. `coverage.mjs extraction`: 46 of 46 live requirement ids named by a test; 0 failures. `ownership.mjs extraction tranche/T36`: 3 files changed; 0 failures. The requirement's `*(not yet met: T36)*` markers on R70 and on the T36 suggestion are BOB's to clear at merge.

**P6** · 2,741 lines in the module's source files, under about 4,000.

Size (session_01VgbqiWA5e3MLeiVgTNS9KZ): test runs 7, module lines 2741

## J1 · REPORT

T36-13 applied, pending T36-13a: R70 needs no code in the read, writer or readingOf (the reading is stored and answered as its JSON); n26MigratedReading now moves a reading's cells keys by tables[old].new (cells sources moved, not counted in moved; null/{} kept). New r70.test.mjs (5 tests naming R70). Extraction tests 129/132: the 3 read-path R70 tests fail until reading-pipeline R28's docx share merges; with a local uncommitted stand-in for it, 132/132. Checks: format, architecture, coverage (46/46), ownership: 0 failures. Waiting for your CHANGE to merge tranche/T36. Record: build/jobs/T36/extraction.md.
