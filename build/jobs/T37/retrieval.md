# retrieval (T37)

**Status** · session_01GcZxMNZie3rRdrQdhpMdzC · depth 2 · WAITING ON BOB (J1) · handled B1

## Work

**Reading set.** Measured over 300 KB (START: 823 KB), so START's case (3). Read whole myself: `build/requirements/retrieval.md`; layer 5's row of `build/layers.md`; the code and tests the entry changes (`src/retrieval/findin.mjs`, `test/m/retrieval/t36.test.mjs`); the used services the change reads: office-readers R11 (the cells' `paras`), reading-pipeline R28 and R15 (carried as emitted; whitespace-only paragraphs no unit), content R6 and `extentRelation` with its cell relations (`content/extent.mjs`); plan entry T37-13, K2118, K2122, K2197. Probed a real `.docx` read (extraction's `read`) to confirm `paras` are the `doc-para` units' `para` ordinals and a merged cell's paragraphs are apart in reading order. One worker of mine read in full every other file of the module's code and tests (index, checks, fields, frontier, levels, projection, schema; 20 test files and the fixture) and wrote a 6 KB summary citing file and line: how `Finder` is built and called (`index.mjs`:178, :1515–1552), every test over doc tables, cells and `recorded`, the fixture helpers, nothing else depending on `paragraphsOf` or the removed `lines`, and four flaws in `findIn` (below). Nothing it left out mattered to this entry.

**T37-13 applied (R74, N758).** `paragraphsOf` (`findin.mjs`, end) now takes the paragraph units named by the `paras` of each cell a date or amount column took; line matching (the run search and its text fallback) and `#columns`' `lines` are removed. An ordinal naming no `doc-para` unit is passed over (K2197); a cell with no `paras` (a pre-N758 reading) names no paragraph, its paragraphs matched as ordinary ones, the column result unchanged (J1, K2202, no legacy arm). Tests (`t37.test.mjs`): a vertically merged table (a merged cell outside the columns, its paragraphs apart in reading order, and a body paragraph whose text equals a column cell found; a merged cell inside a taken column); an ordinal with no unit, whitespace-only and dropped by the wire bound, plus the pre-N758 case. Both fail on the old code. The nested-table comment in `t36.test.mjs` re-worded (it described the removed fallback).

**N759 test (R73).** A fact recorded at one cell of a found column is named on the column's result, relation `narrower`, through content's real `extentRelation`: a sheet (`sheet-cell` B3 in range B2:B4; the range itself `same`; another column's and another sheet's cell not named) and a `.docx` table (cell B2 of table 0 `narrower`, the table `same`, a cell of table 1 not named). Passes on the old retrieval code, as expected: the change was content's (T37-10).

**Flaws fixed in my own module (found by my worker), each tested and failing on the old code:**
- R73/DEC-98: `people` said "Nothing here" when entities could not be read (`entitiesFor()` null, or `namingIn` refused): now each read capture is in `not_read` with why.
- R75: `FIND_MATCHERS[lang]` was not an own-property lookup, so a reading language `constructor` or `toString` threw: now `Object.hasOwn`, such a language has no set (`not_read`).
- R73/DEC-98: `requirements` over a reading holding typed cells but no text unit said "Nothing here" without reading anything: now `not_read` ("no text").

**Deferred (minor, my module, not this entry's; for a later retrieval job):** a `{selection}` scope's refusal carries no `code` field (`index.mjs`:1583); `whole` is false for any cursor, even one before the first sha (:1547), so "Nothing here" is withheld there (never falsely said); a capture held by two bundles is searched for `term` only through its lowest visible bundle (:1570), which the gate already admits.

**Found in another module (for BOB; not reported as a REPORT, judged not to need one):** `extraction`'s N26 migration (`n26MigratedReading.moveCells`, `extraction/index.mjs`:213–224) moves `doc-table` sources but not `paras` ordinals; it only matters if a reading carrying `paras` were ever migrated from pre-N26 numbering, which its age makes impossible in practice.

**Tests and checks.**
- retrieval: `node --test bio-plane/test/m/retrieval/` · tests 168, pass 168, fail 0.
- users of `findIn` (its answers changed only by the flaw fixes): answers 44/0, citation 78/0.
- Layer tests: none named in `build/manifest.md`.
- `format: 136 modules, 135 requirements files; 0 failures` · `architecture: 30 product files, 122 relative imports (0 naming no tracked file, not judged); 0 failures` · `coverage: 1 modules, 77 of 77 live requirement ids named by a test; 0 failures` · `ownership: 4 files changed by retrieval between tranche/T37 and HEAD; 0 failures`.

P6: 3,474 lines (3,492 at the opening), under 4,000.

Size (session_01GcZxMNZie3rRdrQdhpMdzC): test runs 11, module lines 3474

## J1 · QUESTION

R74 (T37-13): a `.docx` reading stored before N758 (T36's office-readers emitted `cells` without `paras`) reaches `findIn` until the capture is re-read. My best reading, on which I carry on: line matching is removed entirely, as R74 says ("never by matching cell lines in order"); a cell carrying no `paras` array names no paragraph, so its paragraphs are matched as paragraphs like any other (a pre-N758 reading's table column may then also show its cells' amounts or dates as paragraph items beside the one column result, until re-read). The column result itself is unchanged. If you would rather keep T36's line matching for a cell without `paras` (a legacy arm, about 20 lines), say so and I will keep it for that case only.
