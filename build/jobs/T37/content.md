# content (T37)

**Status** · session_01NPBftQhCWzUZX1ASP6uBqi · depth 2 · WORKING · handled B1

## Work

**Reading set.** Measured over 300 KB (requirements 34 KB, code and tests about 243 KB before any used module's public part), so START's case (3): read whole myself `build/requirements/content.md`, layer 4's row of `build/layers.md`, the code and tests the entry changes (`src/content/extent.mjs`, `src/content/extent-core.mjs`, `test/m/content/grammar.test.mjs`' R6 tests, `seams.test.mjs`' R48 relation lines) and the used service the change reads (`text-chain`'s `a1ToRowCol`, `rangeCorners`, `canonicalRange`, `canonicalExtent`, R93–R97); plan entry T37-10 and K2122. One worker of mine read in full every other file of the module's code and tests (index, ops, checks, notice, schema; the 16 other test files) and wrote a 5 KB summary citing file and line: no caller of `extentRelation` inside the module, no assertion broken by the change but `seams.test.mjs:128` (which encoded the flaw), and one flaw in `notice.mjs` (below). Nothing it left out mattered to this entry.

**T37-10 applied (R6).** `extentRelation` (`src/content/extent.mjs`, the face; the core stays the catalogue's copy, R48) relates a sheet's extents (`sheet-cell`, `sheet-range`) as the cells they name on one sheet, and a `doc-table`'s cells within its table: a cell inside a range `narrower` (the range `wider`); two ranges `same`, `narrower`, `wider` or `disjoint` (a partial overlap is `disjoint`, as two rects); a cell and its one-cell range `same` (one place); a sheet with no cell (the whole sheet) holds every cell and range on it; a table cell inside its table `narrower`; another sheet or table `disjoint`; a missing sheet or table, or a cell or range present and unreadable, `unreadable` (the core read an unreadable `sheet-cell` cell as absent, so as the whole sheet: now never narrower). Tested through the interface, each case both ways (`grammar.test.mjs`, "R6: … by the cells they name (N759)"); `seams.test.mjs`' line that asserted the flaw (`doc-table` cell `unreadable`) now asserts `narrower`, with a missing-table arm kept `unreadable`.

**A flaw fixed in my own module (R30).** `extentBoundUnheld` (`src/content/notice.mjs`) treated a held sheet, slide or table LIST as the bound of a cell, shape or table cell, so the version notice and `passageAcross` answered `extent_in_newer_capture` for a cell whose grid (or a shape whose slide's shape count) the newer capture's record never held, against R30 ("holds only where the newer capture's context holds the bound tested"). It now asks `containerBoundUndetermined`'s inner levels (`sheet_grid`, `shape_count`, `table_grid`) and answers `bound_not_held`. Test: `notice.test.mjs` R30, eight arms (fails 1 on the old code, passes on the new).

**Found in another module.** `case-checker`'s generated `src/case-checker/program.mjs` bundles `content/extent.mjs` and is stale after this change: its R13 test fails (`program.mjs is stale`), 51/1; passes 52/0 without my change. Not written by me (mechanics §14); reported to BOB (J2).

Deferred: none.

**Tests and checks.**
- content: `node --test test/m/content/` · tests 132, pass 132, fail 0.
- Users of `extentRelation` (a changed service's users): retrieval 162/0, basis-versions 131/0, money 70/0, people 46/0, standards 72/0, events 61/0, citation 78/0, case-checker 51/1 (R13 stale `program.mjs` only, above).
- Layer tests: none named in `build/manifest.md`.
- `format: 136 modules, 135 requirements files; 0 failures` · `architecture: 25 product files, 75 relative imports (0 naming no tracked file, not judged); 0 failures` · `coverage: 1 modules, 55 of 55 live requirement ids named by a test; 0 failures` · `ownership: 6 files changed by content between tranche/T37 and HEAD; 0 failures`.

P6: 3,776 lines (3,719 at the opening), under 4,000.

Size (session_01NPBftQhCWzUZX1ASP6uBqi): test runs 9, module lines 3776

## J1 · REPORT

case-checker's generated src/case-checker/program.mjs bundles content/extent.mjs and is stale after T37-10 (extentRelation's cell relations): case-checker R13 fails 'program.mjs is stale' (51/1; 52/0 without my change). Regenerate with node bio-plane/src/case-checker/build-program.mjs at the merge; I did not write it (mechanics §14). Also fixed in my own module: notice.mjs extentBoundUnheld now bounds a cell, shape or table cell by its grid/shape count, not the list alone (R30); tested.
