# retrieval-browse (T51)

**Status** · session_01DZGdo16CETLocZnm2PWpbh · depth 2 · COMPLETE · handled B14

## Completion (T51-29)

**Entries applied.** `bio-plane/src/retrieval-browse/` built by copy from `retrieval` (K624; nothing of `retrieval` edited): `findin.mjs` and `browse.mjs` whole (R1-R3, R5-R11), `find.mjs` (`findIn`'s entry and its scope, R1), `marks.mjs` (`registerRecordedBy`, `registerBrowseMarks`, `recordedReads`, `entitiesFor`, R4, R11), `words.mjs` (the 15 keys), `index.mjs` (`retrievalBrowseOf(deps)`, R14). New: R8's `row` (N1238), R12 (`state` per item, `total`, `awaiting_review`), R13 (`awaiting_review` filter, `BROWSE_SCOPES`, `scopeMembers`), R14 (the seam, `HOST_READ_MISSING` for a host read not handed), R15-R18 (tested as invariants). "Awaiting review" is an `information` bundle in `collected`, confirmed against `record-grammar`'s `STATES` (`information`: collected, verified, retired): the mapping BOB's note and the requirements give holds, no different mapping to report. R12's `total` counts the set after `kinds`, `only` and `since`, before `after` and `limit`.

**For the `modules.json` row (BOB fills it, K1043).** `paths`: `["bio-plane/src/retrieval-browse/"]`. `tests`: `["bio-plane/test/m/retrieval-browse/"]`. `uses`: `["setup-words", "civil-time", "calc-grammar", "record-grammar", "record-core", "membership", "promotion", "provenance", "capture", "extraction", "content", "entities", "events", "standards", "money", "people", "query-language"]`. That is the map's fourteen plus **three the tests need and the map did not list** (all earlier than index 70, all already in `retrieval`'s own `uses`): `promotion` and `capture` (the fixture promotes bundles and creates capture's `links` table, as `retrieval`'s fixture does), `query-language` (the stand-in `planOf` is its `compile`). The tests also import `bio-plane/test/m/extraction/fixture.mjs` (the `.docx` reading, in `t36.test.mjs`; `extraction` is in `uses`). I ran the checks with that row in my working tree only; the committed `build/modules.json` is untouched.

**Tests** (`bio-plane/test/m/retrieval-browse/`, 1,923 lines): moved and re-pointed to `retrievalBrowseOf` with a fixture of the module's own and stand-in host reads: `browse.test.mjs` (R10, R11), `findin.test.mjs` (R1-R3), `t50.test.mjs` (R1, R5-R9, with a new R8 `row` test), `t37.test.mjs`, `t36.test.mjs` (its recorded arms, R4 and the `.docx` table), `words.test.mjs` (rewritten: `WORD_KEYS` equals `modules["retrieval-browse"].reads` of `words-reads.json`, green; every one of the 15 keys driven and read). New: `table.test.mjs` (R12, R13), `seam.test.mjs` (R14-R18). The `term` kind's tests stand alone (map doubt 9 resolved): the fixture's `planOf` is `query-language`'s `compile` over a one-row-per-bundle relation of its own carrying `fts_id`. What stays in `retrieval`'s tests for T51-42 (R90's delegation tests): `op=findin` and `op=browse` through `retrievalRoutes`; `selectionRead` itself (R77) and `findIn` over a real selection (this module's tests use a stand-in `selectionRead`, which covers its use of the read); the test through the four real `recordedBy` reads (`t36`'s last); `BROWSE_ID_CHUNK === SELECTION_ID_CHUNK`. R14's control ("with `retrieval` built over it, `op=findin` and `op=browse` answer exactly what the module answers") is T51-42's.

**Deferred.** None.

**Found in other modules** (for BOB, none blocks):
1. *Sentences no key holds* (stay in source as the requirements say; a REPORT for the design lane, K3366). In `findin.mjs`: the `not_read` reasons "not extracted: no reading of this capture is held", "no text: this capture's reading holds no text to search", "no matcher for <language> yet" and "no matcher for this capture's language yet: neither its reading nor the active profiles state a language", "no text: ... typed cells but no text unit to read sentences from", "no text: ... no text unit to find a held name in", "not minutes or an agenda", the sheet note `NO_CELLS_WHY`, and "the read answered another shape than events R49's". In `browse.mjs` and `find.mjs`: every refusal `detail` (`VIEWER_MISSING`, `NO_SCOPE`, `SCOPE_UNKNOWN`, `CAPTURE_NOT_HELD`, `NO_SUCH_PROJECT`, `SCOPE_TOO_LARGE`, `NO_KINDS`, `KIND_UNKNOWN`, `NO_TERM`, `TERM_TOO_LONG`, `ONLY_UNKNOWN`, `NO_SINCE`, `BAD_SINCE`, the new `SCOPE_KEY_UNKNOWN` and `HOST_READ_MISSING`) and the `undetermined.why` sentences of the marks read. The count line and the state/scope labels of R12/R13 are the screen's keys (`screen.finder.*`), none held here.
2. *For T51-42 (retrieval):* its `index.mjs` must hand `retrievalBrowseOf` a `sql` and the five reads; the module memoises one instance per `sql` object (as `retrievalOf` does per host), so build it once in the constructor. `retrieval`'s `uses` may drop `civil-time` and `calc-grammar` only if nothing else imports them (its job greps).
3. *Generated artifacts:* none made stale (no plane code composes the new module until T51-42; the plane bundle regenerates at the layer close).

**Checks** (from `civicos-process`, with the row above in the working tree): `format` 174 modules, 172 requirements files, 0 failures; `architecture retrieval-browse` 15 product files, 66 relative imports, 0 failures (the full run: 0 failures); `coverage retrieval-browse` 18 of 18 live ids named by a test, 0 failures (the full run's 12 coverage failures are other modules', inherited: agent-harness, agent-runner, agent-steps, agent-worker, basis-versions, case-grammar, entities, explore, journey-check, people, progressions, retrieval); `ownership retrieval-browse tranche/T51 job/T51/retrieval-browse` 16 files changed, 0 failures. Tests: `node --test bio-plane/test/m/retrieval-browse/` 51 tests, 51 pass, 0 fail.

Size (session_016KXEuu4bL97DYXetKZYwhK): test runs 12, module lines 1363

## J1 · COMPLETE

T51-29 retrieval-browse is complete on `job/T51/retrieval-browse` (record: "Completion (T51-29)"). R1-R18 met: R1-R11 by copy from retrieval R73-R76 and R80-R86 (no edit of retrieval), R8 with N1238's `row`, R12 and R13 (`state`, `total`, `awaiting_review`, the `awaiting_review` filter, `BROWSE_SCOPES`, `scopeMembers`), R14 the seam (`retrievalBrowseOf(deps)`, five host reads, `HOST_READ_MISSING`), R15-R18 invariants. "Awaiting review" = `information` in `collected`, confirmed against `STATES`; no different mapping.
Tests: `node --test bio-plane/test/m/retrieval-browse/` 51 pass, 0 fail; the words test is green (`WORD_KEYS` = `modules["retrieval-browse"].reads`). Checks: format, architecture, coverage (18 of 18 ids) and ownership (16 files) all 0 failures, run with the row below in my working tree only.
For the `modules.json` row (yours to fill, K1043): paths `["bio-plane/src/retrieval-browse/"]`; tests `["bio-plane/test/m/retrieval-browse/"]`; uses `["setup-words","civil-time","calc-grammar","record-grammar","record-core","membership","promotion","provenance","capture","extraction","content","entities","events","standards","money","people","query-language"]` — the map's fourteen plus promotion, capture and query-language, which the tests' fixture needs (all earlier than 70, all already in retrieval's uses).
For T51-42: the tests that stay in retrieval are `op=findin`/`op=browse` through `retrievalRoutes`, `selectionRead` and `findIn` over a real selection, the real-`recordedBy` test and `BROWSE_ID_CHUNK === SELECTION_ID_CHUNK`; R14's control is T51-42's. The sentences no key holds are listed in the record for the design lane (K3366). Nothing deferred; no generated artifact made stale.
Size (session_016KXEuu4bL97DYXetKZYwhK): test runs 12, module lines 1363

## Completion (T51-263, words)

**Entries applied.** The 25 `plain` findings in `build/plan/words-pass/retrieval-browse.md`, each judged a sentence a member reads (a refusal's `detail`, or a `not_read`, `undetermined` or `recorded_not_read` reason, all carried in an answer a member sees), so each is read through `localize('retrieval-browse.<file>.<slug>', en, vars)` where it is answered, with its `en` the sentence as it stood (no answer changes). Nineteen ids, one per distinct sentence (`browse.viewer_missing`, `browse.since_is_an_instant`, `browse.marks_not_registered`, `browse.marks_not_registered_list`, `browse.marks_another_shape` (three sites), `browse.marks_promise`, `browse.scope_viewer_missing`, `find.viewer_missing`, `find.scope_missing`, `find.term_missing`, `find.capture_not_held`, `find.project_not_held`, `findin.not_extracted` (four sites), `findin.no_text` (two), `findin.no_matcher_unstated`, `findin.no_text_typed_cells`, `findin.not_minutes_or_agenda`, `findin.no_text_unit_for_name`, `findin.no_cells_named`), plus `browse.new_since_needs_since` and `findin.read_another_shape`, which the check does not count (a punctuated sentence each) but R13 binds, so they are converted too. `NO_CELLS_WHY` is no longer a module constant: it is read at its one use in `placed`.

**Test copies.** Four test sentences (`findin.test.mjs`: the two `not extracted` reasons, `not minutes or an agenda`, `no text: ... to search`) now compare with the same `localize` call (the id and the `en` as literals at the call, exempt from the test-copy arm). Short regex fragments in the tests (`/no text/`, `/another shape/`, `/threw/`) are not sentences and are left.

**Judged not member-facing.** None. The module's developer `throw new Error` lines (the `WORD_KEYS` guard, the `deps.sql` fault) are programming faults, not answers a member reads. The eight matching-lexicon phrases stay unkeyed in source (the design's own `unkeyed` list for this module).

**Deferred.** None.

**For BOB (reports, none blocks):**
1. *Requirements text superseded (for BOB's file, not edited by this job).* `build/requirements/retrieval-browse.md` Suggestions, the cut, says the strings `findin.mjs` and `browse.mjs` hold "that no key holds ... stay as they are; each sentence no key holds is a REPORT to BOB". K3964 binds them now: they are `localize` reads. BOB may wish to restate that clause.
2. *Wording for the design lane (K3944).* `retrieval-browse.findin.read_another_shape` is "the read answered another shape than events R49's". A member reads it in `recorded_not_read`, and it names a requirement id. The en is kept exactly as it stood; a wording change is a word-table edit (K3810 (2)), and the design may want to reword it.
3. *Generated artifacts.* `bio-plane/src/setup-words/rows.mjs` is stale for the new ids: `setup-words/build.mjs --check` says so (a stale-rows note, as expected, not a refusal naming this module). BOB regenerates at the layer close. Nothing else stale.
4. *Other modules.* None found in this pass.

**Tests and checks** (from `civicos-process`, against `/home/user/bio`, after commit `3cfecfabab`):
- `node --test bio-plane/test/m/retrieval-browse/`: 51 tests, 51 pass, 0 fail.
- `node checks/words.mjs /home/user/bio retrieval-browse`: `inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0 ... 0 failures` (it was 25 failures plus 0 test copies before the job).
- `node checks/architecture.mjs /home/user/bio retrieval-browse`: `15 product files, 70 relative imports; 0 failures`.
- `node checks/coverage.mjs /home/user/bio retrieval-browse`: `18 of 18 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio retrieval-browse tranche/T51 job/T51/retrieval-browse`: `6 files changed by retrieval-browse; 0 failures` (five module files, plus the job record from `mail start`).
- `node checks/run.mjs /home/user/bio`: format `0 failures`; architecture `0 failures`; channels `0 failures`; coverage `30 failures`; words `3776 failures`. None of the failures names `retrieval-browse` (grepped). The coverage and words failures are other modules' (the words check's tree-wide failures are inherited from the other 173 modules, whose words pass is in their own jobs).
- `node bio-plane/src/setup-words/build.mjs --check`: stale-rows note only (see 3).

Size (session_01AFeyrJPobdYm3SJyPqCdRf): test runs 1, module lines 1365

## J2 · COMPLETE

Words pass (T51-263) complete on job/T51/retrieval-browse at d3e08f3414 (commit 3cfecfabab for the code). 25 plain findings converted to localize, plus two unflagged sentences (new_since refusal, read-shape reason) and four test copies. Module tests 51/51 pass; words, architecture, coverage and ownership 0 failures for this module. Full run.mjs shows no failure naming retrieval-browse. Report points (record, Completion T51-263): the requirements' cut clause is superseded (K3964); the read-shape en names 'events R49' and is for the design lane; rows.mjs is stale for the new ids (BOB regenerates at layer close). Co-author model line omitted from commits per the system rule on model identifiers.

## Completion again (B3, K4003)

Merged `tranche/T51` (fast-forward to `f89484903d`). `test/m/retrieval-browse/fixture.mjs`'s stand-in `selectionRead` refusal no longer copies retrieval's sentence (`retrieval.index.selection_readable_by_credential`, merged as a keyed read, K3986): its `detail` is now the neutral stand-in `"stand-in: not yours"`, which the fixture needs and no more. No product code changed for this.

Checks re-run: `node --test bio-plane/test/m/retrieval-browse/`: 51 tests, 51 pass, 0 fail. `checks/words.mjs /home/user/bio retrieval-browse`: 0 failures (testcopy 0). `checks/coverage.mjs ... retrieval-browse`: 18 of 18 live ids, 0 failures. `checks/architecture.mjs ... retrieval-browse`: 0 failures. `checks/ownership.mjs ... tranche/T51 job/T51/retrieval-browse`: 0 failures.

Size (session_01AFeyrJPobdYm3SJyPqCdRf): test runs 2, module lines 1365

## J3 · COMPLETE

B3 (K4003) done on job/T51/retrieval-browse. Fixture stand-in refusal is now a neutral string, not retrieval's sentence. Merged tranche/T51 (fast-forward). Tests 51/51; words, coverage, architecture, ownership 0 failures for retrieval-browse. Record: Completion again (B3). No product code changed.

## J4 · COMPLETE

CR-29 · retrieval-browse complete (B4, K4149).

**Entry applied.** `bio-plane/test/m/retrieval-browse/t36.test.mjs`: the recorded-not-read check for the read that answered another shape asserted `/another shape/` against `recorded_not_read[3].why`. It now asserts equality with `WORD("retrieval-browse.findin.read_another_shape")`, the reason's word-table text (the reason is `localize` on that key in `findin.mjs`). Test-only; no product code changed. Commit 3568b42416.

**Deferred.** None.

**Found in other modules.** None. The coverage failures in the full run (agent-harness R17, agent-runner R36 R37 R38 R40, installer-steps R26 R31, journey-check R19) are other modules'; none names retrieval-browse.

**Checks.**
- `node --test bio-plane/test/m/retrieval-browse/`: 51 tests, 51 pass, 0 fail.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; channels 0 failures; words 0 failures (retrieval-browse: inline 0, plain 0, testcopy 0, missingkey 0); coverage 4 failures, all other modules (above).
- `node checks/words.mjs /home/user/bio retrieval-browse`: 0 failures.
- `node checks/architecture.mjs /home/user/bio retrieval-browse`: 15 product files, 0 failures.
- `node checks/ownership.mjs /home/user/bio retrieval-browse tranche/T51 job/T51/retrieval-browse`: 1 file changed, 0 failures.
- Journey test not run (per BOB's note).

Size (session_01G1CAemApraurD9bkv8qb3W): test runs 1, module lines 1365

## Work (T51 G41, B5, RETRIEVAL-BROWSE #4)

**What changed.** `bio-plane/src/retrieval-browse/findin.mjs`: `#load` (:342-356) adds `cellsHeld`, the set of sheet names in the reading's `cells_held` (a malformed value names none); `gridOf` (:650-) answers null for a held sheet, so `money` and `dates` read its rendered text through the existing arm for a sheet with no typed cells (:373, unchanged) and `#sheetRows` finds no row; `placed` (:695-) names a held sheet's hit by its sheet and its unit's range, `row` from `rowNumberOf` (a row only for a one-row range, else `null`), `cells: null` and `cells_why` = `localize("retrieval-browse.findin.cells_held_why", ...)`. A sheet not in `cells_held` keeps its earlier why. `#load` still reads the table (K4642); nothing spills. Test fixture: `fixture.mjs` `world({evidence})` hands record-core an evidence bucket (test path, mine).

**Failing-first** (`test/m/retrieval-browse/g41-findin.test.mjs`, six tests). Seen red on the unchanged `findin.mjs`, green on the changed one: the block/one-row term test and the `money`/`dates` test (hand-written readings carrying `cells_held` as reading-pipeline R28 will emit it); controls green both ways (a sheet not named in `cells_held` keeps "holds no typed cells"; a malformed `cells_held` names nothing). The three tests through the op over the real extraction on the 1 MB CSV (`readHeld` into the same database; term `LASTROWMARK`, `money`, and the small-CSV control) are written; run under TEST-SUPPORT's preload (copied from `origin/job/T51/test-support`, not committed; the file is not on `tranche/T51`) the two big-file tests are RED at `readHeld` with `string or blob too big` (today's cause, the START's red), the small control is green. Without the preload they are red differently (the reading lists 72,392 cells, so `cells` is not null). They go green only when EXTRACTION #38 (with CSV-READER #3, READING-PIPELINE #26) emits `cells_held` and stores a small reading.

**Not done, and why: the providers are not on `tranche/T51`.** The START says extraction #38 and content #18 are merged; none of `job/T51/test-support`, `csv-reader`, `office-readers`, `reading-pipeline`, `extraction`, `content` is an ancestor of `tranche/T51` (checked at `0eecd0dbbd`), `cells_held` is nowhere in their source on the tranche, and `bio-plane/test/platform-sqlite.mjs` is absent. So my two real-path tests cannot be green yet. I post BLOCKED (cause: tests, waiting on the merge order's providers) and will merge `tranche/T51` again when BOB tells me they merged.

**Checks** (from `civicos-process`): `format` 0 failures; `architecture` 0; `coverage` 6674 of 6674 ids named, 0; `words` 18524 words, unkeyed 1982, the same as before my change (the new sentence is a `localize` stand-in); `ownership` 4 files changed by retrieval-browse, 0 failures. Suite `bio-plane/test/m/retrieval-browse/`: 61 tests, 59 pass, 2 fail (the two real-path big-file tests above, by name). Users: `retrieval`, `screens-daily` and `screens-inquiry` test files that name findin/findIn: 197 tests, all pass (the one listed failure was a JSON fixture picked up by my glob, not a test). `impact.mjs` names 80 modules; only `retrieval` (delegation) and `screens-daily` (reads `it.row`, `it.cells`) call this service, and the answer only gains `cells_why` on a held sheet's item.

**Row owed (stand-in).** `retrieval-browse.findin.cells_held_why`: "this sheet's text is read whole and searchable; its cells are interpreted for a range when the sheet is opened or cited, so no row of cells is named here" (design row owed, B485/B491).

**Not this round (N1272).** A column of a held sheet classified from every cell (`#columns` for `money` and `dates` over a held sheet) needs a cell index or an async find; find-in stays synchronous (K4639). A held sheet's `money` and `dates` therefore give cell-text hits from the rendered text, never a whole-column result.

**Requirement lines proposed (BOB writes them).**
- R8, replacing "Where the reading holds no typed cells for the sheet (over its reader's size guard), the match names `sheet` and the unit's range with `cells: null` and why": "A sheet the reading names in `cells_held` has no cell list: its text is indexed whole and searchable, and its cells are interpreted for a range when a member opens or cites it. A match found in it (any kind) names `sheet` and the unit's `sheet-range` with `cells: null` and `cells_why` saying so, and `row` only when that range is one row, else `row: null`; `money` and `dates` read its rendered text, not a column. Where the reading holds no typed cells and does not name the sheet in `cells_held`, `cells: null` and why as before. Test: a reading with `cells_held: ['data']` and a unit `A1:D500`: a term hit in it answers `cells: null`, the held-sheet why, `row: null`; in a unit `A501:D501`, `row: 501`. Control: a sheet not named in `cells_held` keeps its earlier why."
- R2 `money`/`dates`: add "over a sheet named in `cells_held` they are read from its rendered text, each hit carrying R8's `cells_why`."
- Uses (private): `extraction`'s reading field `cells_held` (reading-pipeline R28, as emitted).

Size (session_01DRhBLuRPVD8G3hWpq1rxBR): test runs 9, module lines 2025

## J5 · BLOCKED

BLOCKED (cause: tests; waits on providers, not a defect of mine). G41 code is done and pushed: findin.mjs reads the reading's cells_held; a held sheet has no list, term hits name sheet + unit range, cells null, held-sheet cells_why; money/dates read its text. Hand-reading tests red->green; module suite 59/61; format, architecture, coverage, words (unchanged 18524), ownership all 0 failures. The 2 tests through the op over the real extraction on the 1 MB CSV stay red: your START says extraction #38 and content #18 are merged, but none of test-support, csv-reader, office-readers, reading-pipeline, extraction, content is on tranche/T51 (0eecd0dbbd), cells_held is in none of their source there, and bio-plane/test/platform-sqlite.mjs is absent. Smallest thing I need: merge those providers (shim first, then csv-reader, office-readers, reading-pipeline, extraction) into tranche/T51 and tell me; I then merge tranche/T51, run the two tests under the shim and COMPLETE. Detail in my record.

## Completion (T51 G41, B10, RETRIEVAL-BROWSE #4)

Providers merged (CSV-READER, OFFICE-READERS, READING-PIPELINE, EXTRACTION); `tranche/T51` merged into this branch. Changes beyond the Work section above: `findin.mjs` `#term` gives a held sheet's term hit the words of the row (line) holding the term, not the head of the block's text (found by the real-path test: the hit's `words` were the first 500 characters of a 18,098-row unit).

**Failing-first, now all green.** `g41-findin.test.mjs`, six tests. Hand-reading tests: red on the old code, green. The 1 MB CSV through the op over the real extraction (`readHeld` into the same database): red under the shim before the providers (`string or blob too big` at `readHeld`; recorded above), green now: `term` LASTROWMARK finds the unit with its sheet and range, `cells: null`, held-sheet `cells_why`; `money` answers from the text; the small-CSV control lists cells and row.

**Suite and checks.** Under the shim (copy of test-support's `platform-sqlite.mjs`, outside the tree; the file is still not on the tranche): `bio-plane/test/m/retrieval-browse/` 61 tests, 61 pass. Users (retrieval, screens-daily, screens-inquiry files naming findin/findIn): 208 pass, 0 fail. `checks/run.mjs`: format, architecture, coverage (6684 of 6684), channels, words (18524, unkeyed 1982, unchanged) all 0 failures. `ownership`: 4 files, 0 failures. No seam test red.

**Row owed:** `retrieval-browse.findin.cells_held_why` (a `localize` stand-in; design row owed, B485/B491). **N1272:** a column of a held sheet classified from every cell is not done (needs a cell index or async find); find-in stays synchronous (K4639). **Requirement lines proposed:** as in the Work section above, plus for R8: a held sheet's term hit carries the words of the row holding the term.

Size (session_01DRhBLuRPVD8G3hWpq1rxBR): test runs 16, module lines 2030

## J6 · COMPLETE

COMPLETE (G41, retrieval-browse). Providers merged in; all six g41-findin tests green under the shim (61/61 module suite; users 208/208; format, architecture, coverage, words (unchanged 18524), ownership 0 failures). A held sheet has no cell list: term hits name sheet + range, cells null, held-sheet cells_why, row only for a one-row range, words of the row holding the term; money/dates read its text. No seam red. Row owed: retrieval-browse.findin.cells_held_why. N1272 noted. Requirement lines and Size line in my record. Note: platform-sqlite.mjs still not on tranche; ran under an outside copy.

## Completion (fix round 10, Wave A batch 1; B11)

**Causes done.**
- **R17a** (G3; walk C3). Root: `findin.mjs` `#term` built the item without the unit's part kind (the old `add({kind:"term", …})`); the item's `kind` is the result kind, so the part is `part` (the module's name, per diagnosis-R10-b-2 §R17a). Fix: `#partOf` (`findin.mjs`, beside `#textOf`) reads the unit's `capture_text.kind` (null where the column is absent or the unit was stored without one, never read as `body`); every term item, the sheet-row ones too, carries `part`. Tests missed it: `fixture.mjs` `unit()` inserted no `kind` and the schema text lacks the column the real insert writes (`extraction/index.mjs:1788`); the fixture now adds the column as `migrate()` does and `unit()` takes a `kind`. Failing-first `findin.test.mjs` "R17a…" (body, footnote, unit stored without): red before the fix (no `part`), green after. Platform N. `screens-daily` draws it; the word is UX-DESIGN's (no `screen.find-in.part.*` row yet; the key is `screens-daily`'s to choose).
- **R26 / R20** (G5). Root: `#load(c)` selected `capture_text.text` for every unit of every capture in the page for every kind, `term` included (`findin.mjs` `#load`). Fix: `find()` passes `withText` (any kind but `term`); a `term`-only find loads the unit list without text and `#textOf` reads one hit unit's text when its words are cut (R20). Tests missed it: no test counted what a find loads. Failing-first `r10-find-term-loads.test.mjs` (twelve units of 2 MiB, term in unit 1; `sql.exec` wrapped to count the text read): red before, "a term find read 23.3 MiB of stored text"; green after (at most 4 MiB, one item); control: `money` beside `term` reads every unit's text and the term items are identical. Platform P at the redeploy: `findin` on `INFO-2026-0110` right after a restart, `do-findin` 97 ms or better (diagnosis-R10-d §6); not run here (no live contact).

**Fixtures published** (`bio-plane/test/m/retrieval-browse/fixtures.mjs`, test `fixtures.test.mjs`): `browseViewerMissing` (the real `browse({})` refusal VIEWER_MISSING), `marksRegistrarDeclared` (the real second `registerBrowseMarks`, LISTENER_DECLARED). Their users (`notice-producers`, `following`) re-point in their jobs.

**Own fixture lines.** Done: FIX-L `fixture.mjs:175,176` carry `// fixtures-contract: retrieval selection-read`; both show `contract-no-run` until `retrieval`'s `fixtures-run: retrieval-browse selection-read` merges (waits for the `retrieval` job). Left, as the START says (FIX-E, providers entities, events, provenance, arriving as a CHANGE): `g41-findin.test.mjs:39`, `t36.test.mjs:139`, `t37.test.mjs:172`, `words.test.mjs:60`. No `fixtures-own` or `fixtures-generic` marker added.

**Requirement lines proposed (BOB writes them).** R17a: "A `term` item carries `part`, the part kind of the unit it lies in (`extraction` R107), null for a unit stored without one." Words for the part kind are the design's.

**Tests and checks.** `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/retrieval-browse/`: 66 tests, 66 pass, 0 fail. format 0 failures; architecture 17 files, 0 failures; coverage 20 of 20 ids, 0 failures; words 0 failures; fixtures: the six lines above (two contract-no-run, four FIX-E not in this job); ownership 0 failures. `impact.mjs origin/tranche/T51 HEAD`: affected modules 0 of 178 (no other module imports a changed file). Nothing found in other modules; no generated artifact made stale.

Size (session_01QPk5CHNKGRuomEEUu9w4Zn): test runs 7, module lines 1427

## J7 · COMPLETE · re B11

Fix round 10 Wave A batch 1 complete on job/T51/retrieval-browse (record: 'Completion (fix round 10, Wave A batch 1; B11)'). R17a: term items carry 'part' (the unit's part kind, null if stored without), failing-first red then green. R26/R20: a term find reads only hit units' text (23.3 MiB -> under 4 MiB), failing-first red then green; control green. Published fixtures.mjs: browseViewerMissing, marksRegistrarDeclared (with fixtures.test.mjs). FIX-L fixture.mjs:175,176 marked 'fixtures-contract: retrieval selection-read' (contract-no-run until retrieval's run merges). Left per START: 4 FIX-E lines (g41-findin:39, t36:139, t37:172, words:60). Tests 66/66 under the shim; format, architecture, coverage (20/20), words, ownership 0 failures; impact: 0 other modules. Proposed requirement line R17a in the record. Platform P check (do-findin 97 ms on INFO-2026-0110 after restart) is for the redeploy. Size (session_01QPk5CHNKGRuomEEUu9w4Zn): test runs 7, module lines 1427

## Completion (B12, K5067)

R17a's test now names R21 (R20's mark struck by BOB). `g41-findin.test.mjs` takes provenance's published `homeOfHomed` instead of its hand-built `homeOf` (stub line gone). Left, waiting on events and entities: `t36.test.mjs:139`, `t37.test.mjs:172`, `words.test.mjs:60`; `fixture.mjs:175,176` now `accepted(selection-read)`. Tests 66/66 under the shim; coverage 21 of 21; format 0 failures.

Size (session_01QPk5CHNKGRuomEEUu9w4Zn): test runs 3, module lines 1427

## J8 · COMPLETE · re B12

B12 done: R17a test renamed to R21; g41-findin.test.mjs re-pointed to provenance's homeOfHomed. Tests 66/66, coverage 21/21, format 0 failures; fixtures list: only t36:139, t37:172, words:60 left (events, entities). Size (session_01QPk5CHNKGRuomEEUu9w4Zn): test runs 3, module lines 1427

## Completion (follow-up 22, B13)

**Entries applied.** Follow-up 22 (test files only): `bio-plane/test/m/retrieval-browse/findin.test.mjs` gains a test under the marker `// fixtures-run: screens-daily findin-term-part`, titled R21 and R17a: a find over a held document whose term hit lies in a footnote part answers a term item with `part` `footnote`. It runs the real find-in code (the same world and `run` helper as the R21 test above it). No source changed: `bio-plane/src/retrieval-browse/` is untouched (1427 lines).

**Not found, reported to BOB.** The START puts screens-daily's hand-built answer at `bio-plane/test/m/screens-daily/find-in.test.mjs:278` with the marker `fixtures-contract: retrieval-browse findin-term-part`. On `origin/tranche/T51` and on the origin branches whose names carry screens-daily, nothing carries `findin-term-part`, and the file at line 278 has no such marker. So I could not compare the real answer with the hand-built one: the test uses R21's shape and the real code, and reports no difference. The fixtures check now lists my marker as `orphan-run` (`findin.test.mjs:407`) until screens-daily's marker merges. Once it does, the pair should read accepted; if it does not, the marker needs a BOB ruling.

**Fixtures.** `checks/fixtures.mjs /home/user/bio retrieval-browse --list` now: `contract screens-daily findin.test.mjs:407 fail [orphan-run]` (above); `fixture.mjs:175,176` accepted(selection-read); still left, waiting on events and entities (named in the earlier completions): `t36.test.mjs:139`, `t37.test.mjs:172`, `words.test.mjs:60`. No `fixtures-own` or `fixtures-generic` marker added.

**Tests and checks.** `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/retrieval-browse/*.test.mjs` (from the repository root): 67 tests, 67 pass, 0 fail (the two R21 tests green on the first run; the new test is the second). Checks from the process repository with the absolute root: format 0 failures (178 modules); architecture 0 failures (20 product files); coverage 0 failures (21 of 21 live ids named); words 0 failures (3291 literals); ownership 0 failures (1 file changed by retrieval-browse since tranche/T51, the test file). Root `npm ci` failed only because the repository has no root `package.json`; the tests run from the existing `bio-plane/node_modules`.

Size (session_016H9ARBfQmEpWFFdjSd6HHm): test runs 2, module lines 1427

## J9 · COMPLETE · re B13

Follow-up 22 done on job/T51/retrieval-browse (6ac1fd45c3). findin.test.mjs gains the test marked fixtures-run: screens-daily findin-term-part (R21, R17a): a footnote part's term hit answers part footnote, by the real find-in code. No source changed. Checks: format, architecture, coverage (21/21), words, ownership 0 failures; module tests 67/67. Not found: the screens-daily marker fixtures-contract: retrieval-browse findin-term-part (find-in.test.mjs:278) is on neither origin/tranche/T51 nor any origin branch I searched, so the comparison with its hand-built answer is not made; the check lists my marker as orphan-run until it merges. Left, waiting on events and entities: t36:139, t37:172, words:60. Full detail: build/jobs/T51/retrieval-browse.md, 'Completion (follow-up 22, B13)'. Size (session_016H9ARBfQmEpWFFdjSd6HHm): test runs 2, module lines 1427

## Completion (fix round 10, final pass; B14)

**Met:** R2's amended text (K5148; WALK-FINAL-08 D5): `matchRequirements` (`findin.mjs`) now cuts sentences with `sentencesOf`: a stop (`.` `!` `?` `;`) ends a sentence only before whitespace and a capital (a closing quote or bracket may come between) or at the end of the text; a `.` after a known abbreviation (Mr, Sec, No, Cal, Civ, v and the like) does not end one; a line break always does. So "Section 8.22.050 No landlord shall ..." is found whole from "Section", and "The Clerk shall publish it. The budget is $4.2 million." still gives one requirement sentence.

**Cause 1 (root cause, why missed).** Root cause: `findin.mjs` (was :200) `/[^.!?;\n]+[.!?;]?/g` cut at any stop. Missed because every requirement fixture was plain prose with a final stop only.
**Failing-first:** `findin.test.mjs:265` (R2, K5148), seen red on the old splitter (it answered `'050 No landlord shall increase the rent.'` for "Section 8.22.050 No landlord ..."), green on the new. A first draft of the fix looped forever at the end of the text (`"".includes` is true); caught by the module run, fixed (`findin.mjs` `sentencesOf`, the stop-run scan is bounded by the text length).
**Existing test changed to the amended R2:** `findin.test.mjs` R2 fixture "file; the fee must be paid!" became "file; The fee must be paid!" (a `;` before a lower-case word no longer ends a sentence under R2's text); the lower-case case is now asserted as one sentence in the new test.
**Other splitters:** grep `[^.!?;` across `bio-plane/src/` finds only this one (the generated `case-checker/program.mjs` holds none; `reading-pipeline/html.mjs:80` already requires whitespace after a stop and is a different purpose). Nothing to report.

**Tests and checks.** `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/retrieval-browse/*.test.mjs`: 68 tests, 68 pass, 0 fail (it did not exit by itself without `--test-force-exit` in the first, looping run; the final run is with it, its count equals the files' sum). format 0 failures; architecture 0 (20 files); coverage 0 (21 of 21 ids named); ownership 0 (3 files: source, test, record); the words check lists findings only in other modules (control-plane, host-governor). `checks/fixtures.mjs /home/user/bio retrieval-browse --list`: no new line; the earlier `orphan-run` is gone; left, as before and waiting on events and entities: `t36.test.mjs:139`, `t37.test.mjs:172`, `words.test.mjs:60`. No marker added. Impact: `findin.mjs` `matchRequirements` is an internal export; `retrieval` still holds its own copy until T51-42.

Size (session_01DZGdo16CETLocZnm2PWpbh): test runs 4, module lines 1449
