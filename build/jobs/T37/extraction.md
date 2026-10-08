# extraction (T37)

**Status** · session_01Afy7CyYbu7EgvpPingjWAQ · depth 2 · COMPLETE · handled B1

## Completion (T37-45)

**Applied.** T37-45 (clears red 12): `test/m/extraction/r70.test.mjs` re-pinned to the seven cell keys office-readers R11 emits (`paras` included), with each cell's `paras` pinned against the fixture's paragraphs (the empty C3's paragraph ¶10 is no cell's) and checked to be the paragraphs whose text the cell carries; the N26 `cell` helper (now `:120`) carries `paras`, and the R66 test asserts a migrated cell keeps its `paras` as stored. No code relies on `paras` (J1, my reading; not blocking). Also fixed in my module: a stale comment in `src/extraction/index.mjs`:1419 that said `cells` come only from a workbook.

**Deferred.** None. J1 (a) and (b) are wording points for BOB; if R66 should move a cell's `paras` by `paragraphs[old].new`, that is a code change in `moveCells` I would make on a CHANGE (no stored reading can hold both today).

**Reading set (B1's rule 3; over 300 KB).** Read whole myself: `build/requirements/extraction.md`; layer 4's row of `build/layers.md`; `r70.test.mjs`; office-readers R11's docx cell paragraph (the one used service the entry touches); K2118, K2173, the plan's T37-45 entry and red 12; `n26MigratedReading`'s walk and `moveCells` (`index.mjs`:150–230). A worker read the rest of the module's code and tests in full and wrote a summary of about 1,300 words, each statement citing file and line: no code validates, strips or reshapes a cell's keys (`writeReading` stores the JSON verbatim, `index.mjs`:680; `readingOf` answers it whole, :1017–1033; `n439MigratedReading` copies cells, :297–299); no other extraction test pins cell keys. Nothing it left out mattered; it found the stale comment fixed above.

**Elsewhere.** None found in another module. A reading re-read under T37-4's office-readers gains `paras`, so its digest differs and R23 keeps it as a new history entry (expected, R23).

**Tests and checks.** `node --test test/m/extraction/`: tests 132, pass 132, fail 0 (red 12 cleared; it was 131/1 before). No layer tests (manifest). No service changed. `format`: 136 modules, 135 requirements files; 0 failures. `architecture`: 28 product files, 105 relative imports; 0 failures. `coverage`: 46 of 46 live requirement ids named by a test; 0 failures. `ownership` (vs tranche/T37): 0 failures.

**B2 (K2195).** Merged `tranche/T37` (R70 now names `paras`, marked T37); the first R70 test's title names `paras` as the seventh key, and it already pins them field for field; R66 unchanged as answered. Re-run after the merge: extraction 132/0; format, architecture, coverage 46/46, ownership (3 files) 0 failures each.

Size (session_01Afy7CyYbu7EgvpPingjWAQ): test runs 5, module lines 2741

## J1 · QUESTION

T37-45. R70's text lists each cell as `{source, value, type, declared, cached, formula}` and also says the cells are carried "unaltered" as reading-pipeline R28 composes them. Since T37-4, office-readers R11 emits a seventh key, `paras`, and extraction's code already passes each cell through untouched (no code change needed: `read`, R19's writer and `readingOf` keep it; `n26MigratedReading`'s `moveCells` walks the list and leaves an integer array as stored).

My best reading, on which I am proceeding: the readings carry `paras` because they carry the cell unaltered; R70's six-key list is the shape office-readers R11 emitted then, not a limit. So the job is test-only: `r70.test.mjs`:47 pins the seven keys the real entry emits (and `paras` against the paragraphs the fixture's cells were read from), and `:110`'s `cell` helper carries `paras`. No code in extraction relies on `paras`.

Two points for you to decide, neither blocking the test:
(a) Should R70's wording name `paras` (e.g. "each cell as office-readers R11 emits it, `{source, value, type, declared, cached, formula, paras}`")? I recommend yes, BOB's wording, so the requirement and its test agree.
(b) R66's N26 migration moves `doc-para` references, but a cell's `paras` are bare ordinals and are not moved. No stored reading can hold both (N26 ran before N724, and `paras` came at T37-4), so I leave it and the test asserts `paras` kept as stored on a migrated reading. If you want R66 to state that, it is a one-clause change.

## J2 · COMPLETE

T37-45 complete (red 12 cleared): r70.test.mjs pins office-readers R11's seven cell keys, paras included, and the N26 cell helper carries paras; plus a stale cells comment fixed at index.mjs:1419. extraction 132/0; format, architecture, coverage (46/46), ownership (3 files) 0 failures. J1 (a)/(b) stay open as wording points, not blocking; record's Completion section has the reading-set statement and size line.
