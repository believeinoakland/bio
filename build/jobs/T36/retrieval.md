# retrieval (T36)

**Status** · session_013mwNsG3YAtaUow5u9nrCBL · depth 2 · COMPLETE · handled B4

## Work

**Read** · BOB's START measured the reading set at 752 KB, over 300 KB, so per (3): I read these whole myself: `build/requirements/retrieval.md`; layer 5's row of `build/layers.md`; the plan's "Rules at the opening", entry T36-18 and the L5 entries it depends on; K2092 and the rulings it cites (K1941, K1972, K1991, K2063, with K2112, K31, K1468, K1865). The code my entry changes: `findin.mjs` whole, and `index.mjs` 1–420 and 1080–1708 (imports, registrations, selections, the content axis, `findIn`, the factory and routes). The tests it changes: `findin.test.mjs`, `selections.test.mjs`, `fixture.mjs`. The used services named: events R49 (as amended by K2114), standards R49, money R24, people R36, content R6 (with its `extentRelation` and `canonicalExtent` code), extraction R70, office-readers R11 and R16 (with `docx.mjs`'s `tableCells` and `docxText`), reading-pipeline R28 and `textUnitsFor`, and membership R81 and R83. A worker read whole the rest of the module (`index.mjs` 420–1080, `checks`, `fields`, `frontier`, `levels`, `projection`, `schema`) and every other test file. It wrote a summary of about 2,300 words, each statement citing file and line. It found:
- no other caller of `findIn`, `Finder` or the selection reads inside the module;
- the exact-key-set tests on the route list (`projection.test.mjs`:265) and on the table list (`projection.test.mjs`:194, 217; `t33.test.mjs`:262), which this job leaves alone (no new op, no new table);
- `SELECTION_CHECKS`' `where` naming `selectionResolve` (`checks.mjs`:55, :85), unchanged, since `selectionRead` is not an op and mints no new code;
- `relations()`' view creation as the one write on a read path (`index.mjs`:353–374, R68's own).

Nothing it left out mattered.

**Applied** · T36-18:
- **R73 `recorded`.** Every `findIn` match carries `recorded`. The items come from `events`, `standards`, `money` and `people`'s `recordedBy`, then each R76 read, in `MODULE_ORDER`; each read is called once per capture read, with `{captureSha, limit: 500, viewer}`. Items are kept where `content.extentRelation(match's extent or its table.extent, item extent)` is `same`, `narrower` or `wider`, each with `module, record, kind, field, extent, relation, by, at, withdrawn`. A truncated read sets `recorded_truncated`. The answer gains `recorded_read` and `recorded_not_read` (J1 (2), as B3 ruled), with the line `{module: null, why: "no later module's records were read: none registered"}` while nothing is registered. The reads are reached on the first find: in the plane every module is made at boot before retrieval, `plane/store.mjs`:167–195, on the same `ctx`. `recorders` may be handed in, as `entities` is.
- **R73's `{selection}` scope** reads through `selectionRead`.
- **R74 (N724).** A `.docx` table held in the reading's `cells` (keys whose cells all name one `doc-table`) is a held table. Its date or amount column is one item `{kind, table: {capture_sha, extent: {kind: "doc-table", table}, column, rows}, words: header, …}`. The paragraphs of that column's cells are not matched again (J1 (4)), and the other cells' paragraphs are matched as paragraphs. The run of a table's paragraphs cannot be located when its cells' lines are not one run of units in reading order: a nested table (its paragraphs fall between the outer cells', tested) or a vertically merged cell whose continuation holds text (`docx.mjs`:582 appends it to the first cell). There, a paragraph whose whole text is one of the column's lines is left out (N758). A whole-number `text` cell under a header naming a currency counts as an amount (B3). A `doc-table` unit, the older form, is skipped when the reading holds that table's cells. A sheet is read as before, through the shared column reader.
- **R76** `registerRecordedBy(module, fn)` goes through `listenerRefusal`, the four names held already. A read that throws, refuses, answers a promise (rejection caught, never awaited, J1 (1)) or answers another shape is in `recorded_not_read` with why.
- **R77** `selectionRead({handle, viewer, owner})`: `selectionResolve`'s answer at `report` (one shared `#selectionAnswer`), with no sweep, no touch and `expires` the selection's own. An expired unswept handle answers `NO_SUCH_SELECTION` and is left. It never throws: arguments that are not an object, and a selection that cannot be read, answer as not held.
- **B2** (K2114): `tranche/T36` merged at 983ac4c04e. An item's `extent` as an object or a canonical string is read alike, and refusals are named by `code`.

**B4** (K2122) · `tranche/T36` merged at b1c7c9279b, which brings events', standards', money's and people's `recordedBy`. A new test (`t36.test.mjs`, "R73 … through the four real recordedBy reads") runs over events' own test world, with standards, money and people made and migrated as the plane boots them and retrieval made over the same host. A dated fact recorded from a found passage, citing the match's capture and extent, is then named on that match by the same find: module `events`, its record, `dated_fact`, `extent`, relation `same`, the member, not withdrawn. All four reads answer (`recorded_read` the four), and a passage nobody recorded from carries `recorded: []`. J2 (a) is N759, (c) red 21 (B4).

**Deferred** · none. **Found elsewhere** (J2 REPORT):
- (a) `content`'s `extentRelation` evaluates neither `sheet-range` nor `doc-table` against their cells. A cell inside a range answers `disjoint`, two ranges `unreadable`, and a doc-table cell inside its table `unreadable`, against content R6 (`unreadable` only for a kind not in R1 or a missing coarse field). So a money fact recorded at one cell of a found column is not named on the column's result until content evaluates them.
- (b) N758: `office-readers`' cells do not name their paragraphs.
- (c) `answers`' `standingfind.test.mjs`:46 ("a refusal writes nothing") is red from this merge. Its `findWorld` stands in for the plane's boot with `w.retrieval.zone()` only, so the first find makes events, standards, money and people and their tables. With `w.retrieval.recordedReads();` beside `zone()` it passes 7/7 (checked on a scratch copy). That fixture is answers' (T36-23, L6).

**Tests** · After B4: `node --test bio-plane/test/m/retrieval/`: tests 162, pass 162, fail 0. answers, calculations, events, money, people and standards together: 338 pass, 1 fail, red 21 (answers `standingfind.test.mjs`:46). Before B4: retrieval tests 161, pass 161, fail 0. That includes the new `t36.test.mjs`, eight tests, each new arm named in its own test: R73 recorded ×3, R73/R76 not read, R76, R74 `.docx`, R77, R73/R77 selection scope. Users, mine against the base at fad9bc0616 over every test directory that names retrieval (54 modules): no new failure but (c). The others red on both are inherited reds 16 (progressions `order.test.mjs`) and 17 (op-declarations `t33`/`t35`). calculations 47/47 and answers 42/43 (c) re-run after the last change. Layer tests: none (manifest). The real four reads are not in the tranche yet; once each merges, its CHANGE gets a test through the real module.

**Checks** · `format.mjs`: 135 modules, 134 requirements files; 0 failures. `architecture.mjs retrieval`: 29 product files, 113 relative imports; 0 failures. `coverage.mjs retrieval`: 77 of 77 live requirement ids named by a test; 0 failures. `ownership.mjs retrieval tranche/T36`: 0 failures. The `*(not yet met: T36)*` markers on R73, R74, R76, R77 are BOB's to clear at merge.

**P6** · 3,484 lines in the module's source files (3,267 at the opening, +217), under about 4,000.

Size (session_013mwNsG3YAtaUow5u9nrCBL): test runs 27, module lines 3484

Size (session_013mwNsG3YAtaUow5u9nrCBL): test runs 33, module lines 3484

## J1 · QUESTION

Four readings I am building on (T36-18); answer only where you would have it otherwise.

1. **Sync reads.** `findIn` stays synchronous (answers' `standing.mjs`:148 and :320 call it without `await`). A recorder read (the four's or an R76 registration) that answers a promise is named in `recorded_not_read` with why ("answered a promise: this read is called in process and synchronously"), its rejection caught so it is never unhandled. That is how R76's "rejects" is met.
2. **`recorded_read` / `recorded_not_read` grain.** `recorded_read` lists a module only when its read answered for every capture the call read. A module that refused, threw or answered another shape for any capture has one entry `{module, why, captures}` in `recorded_not_read` (`why` from its first failure, `captures` how many failed); its items for the captures it did answer still appear in `recorded`. A module whose instance offers no `recordedBy` function (before its job merges, or in a store without it) is named there with "offers no recordedBy read".
3. **One call per capture, no extent.** Each read is called once per capture read with `{captureSha, limit: 500, viewer}` and no `extent`. Retrieval then relates each item to each match with `content.extentRelation(matchExtent, itemExtent)` and keeps `same`, `narrower` and `wider`, overwriting `relation`. A match with `extent: null` gets `recorded: []`. The four built-in names count as already registered, so `registerRecordedBy("events", …)` is refused `LISTENER_DECLARED`.
4. **`.docx` tables and their paragraphs (N724).** A `.docx`'s text units are `doc-para`, one per paragraph, including the paragraphs inside table cells (`reading-pipeline` `textUnitsFor`). The cells (`office-readers` R11) do not name their paragraphs. So, to keep R74's "never one item per row or cell", I locate each table's paragraphs as the contiguous run of units whose texts are the table's cell lines in order. Units in a column read as one date or amount result are not matched again; other cells' paragraphs are matched as paragraphs. Where the run cannot be located (vertically merged cells reorder lines), a unit whose whole text equals a line of such a column is left out. I will REPORT the gap (each cell could carry its paragraph ordinals) as a flaw in office-readers' share. Also: a `text` cell whose whole value is a plain number counts as an amount under a header naming a currency, as a `number` cell does (a Word cell is always `text`).

## J2 · REPORT

Found in other modules (detail in my record, 'Found elsewhere').
(a) content: extentRelation evaluates neither sheet-range nor doc-table against their cells. A cell inside a range answers disjoint, two ranges unreadable, and a doc-table cell inside its table unreadable, which falls short of content R6. Effect: a fact recorded at one cell of a found column is not named on the column's result (R73).
(b) N758 as B3 placed it: office-readers' cells do not name their paragraphs. Where a table's paragraphs are not one run in reading order (a nested table; a vertically merged cell whose continuation holds text, docx.mjs:582), retrieval leaves out a paragraph whose whole text is a line of a found column.
(c) answers: standingfind.test.mjs:46 ('a refusal writes nothing') turns red from my merge. Its findWorld stands in for the plane's boot with w.retrieval.zone() only, so the first find makes events, standards, money and people and their tables. The plane makes them at boot (plane/store.mjs:167-195). Adding w.retrieval.recordedReads(); beside zone() makes it 7/7 (checked on a scratch copy). That fixture is answers' (T36-23). I tried reaching the four when retrievalOf is made instead, but that broke calculations R13/R14: its fixture makes retrieval before money, so money took no deps. So I reverted it.

## J3 · COMPLETE

T36-18 complete on job/T36/retrieval (B2 merged at 983ac4c04e; B3 applied).
- R73: recorded, recorded_read, recorded_not_read; the selection scope reads through R77.
- R74: .docx tables as held tables, one item per date or amount column.
- R76: registerRecordedBy.
- R77: selectionRead, which writes nothing.
Tests: retrieval 161/161 (new t36.test.mjs, eight tests). Over every test directory that names retrieval, mine against the base: no new red but answers standingfind:46 (J2 (c)). Reds 16 and 17 are as inherited.
Checks: format, architecture, coverage (77/77), ownership: 0 failures. 3,484 lines.
The four real recordedBy reads are not in the tranche yet: send a CHANGE as each merges and I will test through it.
Record: build/jobs/T36/retrieval.md.

## J4 · COMPLETE · re B4

B4 applied: tranche/T36 @ b1c7c9279b merged. R73 is now tested through the four real recordedBy reads (t36.test.mjs, over events' world with standards, money and people made and migrated as at boot, retrieval on the same host). A dated fact recorded from a found passage is named on that match by the same find: events, the record, dated_fact, extent, same, the member. All four reads answer. Retrieval 162/162. answers, calculations, events, money, people and standards: 338/339, the one red being red 21. Checks: format, architecture, coverage (77/77), ownership: 0 failures. 3,484 lines. Record: build/jobs/T36/retrieval.md.
