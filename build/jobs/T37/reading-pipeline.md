# reading-pipeline (T37)

**Status** · session_01NrApu29PkaxgKV2pTicqhV · depth 2 · COMPLETE · handled B1

## Work

**Reading (mechanics §17, N739).** The START measured 354 KB. My own measure of the set: requirements 23 KB, code and tests under my paths 357 KB (code 90 KB; tests and the legacy-path suites the rest; the `d460` fixture, 209 KB, is not part of the set). Over 300 KB: trimmed nothing, no split. Read whole myself: `build/requirements/reading-pipeline.md`; layer 4's row of `build/layers.md`; `emitted.test.mjs` (the test the entry changes); `emittedFieldsOf` (`index.mjs`:845–869) and its call (:1119); the three legacy-path suites I changed (`d606-perpage-ocr`, `tier2-wire`, `system/pdf-worker-binding`); and office-readers R11's amended clause on `paras` (`build/requirements/office-readers.md`:127–149), which R28 cites. My entry changes no used service, so I read none of their requirements. A worker of mine read the rest whole: all three source files, `fixture.mjs`, every other test under `test/m/reading-pipeline/`, and `tier-pagewise.probe.mjs`. Its summary (about 3 KB) cites file and line for: every place an emitted text's `tables`, `cells` or `sheets` is touched (only `emittedFieldsOf` builds `cells`, by reference, :851–869; `decodeView`, the tier merges, `containerExtentOf` and `textUnitsFor` never copy or filter a cell); that no other path gives a `.docx` reading `cells`; and the other tests that touch `cells` (`pieces.test.mjs`:226–232). The summary left out nothing that mattered.

**T37-9 applied (R28, N758).** The code already carries each cell list as emitted, so a `.docx` cell's `paras` reaches `reading.cells` unaltered, including a vertically merged cell's. No source change was needed. Red 13 is fixed: `emitted.test.mjs`'s hand-written docx cell now has `paras`, matching the real entry. A new test reads a vertically merged table through the real docx entry and `read`. The merged cell's `paras` name the paragraphs of every row it spans (`[4, 7]`). A cell with two paragraphs names both (`[9, 10]`). Each cell's `paras` join, in order, to exactly its `value`, and they survive the wire.

**My own reds fixed** (red before this job, not on rule 6's list or in the red census, which ran `test/m` only): `test/d606-perpage-ocr.test.mjs`, `test/tier2-wire.test.mjs` and `test/system/pdf-worker-binding.test.mjs`. All three sent the retired shared member key in the address (`CREDENTIAL_IN_ADDRESS`, then `MEMBER_TOKEN_RETIRED`). Each now enrols a member, signs in and sends the session in the Authorization header, as capture's job did (6b3d30bc77). Their assertions are unchanged.

## Completion

**Entries applied:** T37-9, all of it. Nothing deferred.

**Found in other modules** (for BOB):
- `extraction`: `emittedFieldsOf` (R28) is exported but not in R23's list of re-read pieces. If extraction's re-read is to carry `cells` (now with `paras`), it must call `emittedFieldsOf`. Worth checking against extraction R70 and R31–R35 when T37-45 runs.
- `retrieval` (T37-13): a cell's `paras` can name a paragraph that has no `doc-para` text unit. That happens when the paragraph is whitespace only (R15 needs a glyph) or when the 512 KiB wire bound drops the unit. Retrieval should find paragraphs by `paras` without assuming every ordinal has a unit.
- My change made no generated artifact stale. Only tests changed.

**Tests run:**
- My `tests` paths (`test/m/reading-pipeline/` and the three legacy-path suites): 96 tests, 96 pass, 0 fail. `tier-pagewise.probe.mjs` exits 0.
- No layer tests: `build/manifest.md` names none.
- No service I provide changed, so no user modules were run.

**Checks** (from civicos-process):
- `format: 136 modules, 135 requirements files; 0 failures`
- `architecture: 25 product files, 76 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 28 of 28 live requirement ids named by a test; 0 failures`
- `ownership: 5 files changed by reading-pipeline between tranche/T37 and HEAD; 0 failures`

**R28's mark** "*(not yet met: T37)*" can be struck: it is met.

Size (session_01NrApu29PkaxgKV2pTicqhV): test runs 14, module lines 1452

## J1 · COMPLETE

T37-9 applied (R28: a .docx cell's paras carried as emitted; red 13 fixed; new test on a vertically merged table). Code already passed cell lists through by reference, so only tests changed. Also fixed my three legacy-path suites (d606, tier2-wire, pdf-worker-binding), red on the retired member key in the address. 96/96; format, architecture, coverage 28/28, ownership 0 failures. Two notes for other modules are in the record (extraction's re-read and emittedFieldsOf; retrieval and paras without a unit). R28's mark can be struck.
