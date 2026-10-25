# steps (T51)

**Status** · session_01UFKvJeZoUh7patpgPQr9b3 · depth 1 · WORKING · handled B3

## J1 · REPORT

Another module's finding, found while doing T51-220 (steps).

`bio-plane/src/investigation/checks.mjs:26` holds `INVESTIGATION_MEMBER_ONLY`'s translation as an inline sentence: "Only a member does this, in their own words and by their own choice. Nothing was written." That is the same text as the `refusal.STEP_MEMBER_ONLY` row, so the words check counts it as a copy of a words.json `en`.

Not changed here: investigation is another module, so its owner fixes it. The fix is the same as in steps (`word("refusal.INVESTIGATION_MEMBER_ONLY")`, the row exists in rows.mjs). Its own words-pass entry is the place for it.

Otherwise nothing found in another module that my change touches. The `notice-producers` sentence "a later arrival is steps' …; no outcome moves by itself." is the source of the test copy I removed from steps' follow.test.mjs; notice-producers itself is unchanged.

## J2 · COMPLETE

T51-220 · steps (words, K3949, K3957, K3962): done. Commit 7e2d9aa94d; merged tranche/T51 at 4dc161ba55 (no steps file changed by the merge).

**Entries applied (all 11 findings in build/plan/words-pass/steps.md):**
- inline, `checks.mjs:48` (copy): `translation` is `word("refusal.STEP_MEMBER_ONLY")`, the row holds the same sentence.
- inline, `index.mjs` 559, 562, 585, 995, 1116: `localize("steps.index.<slug>", en, vars)`, with `place_names_its_place`, `place_exactly_one_kind`, `by_when_shape`, `wait_shape`, `cost_shape`. The sentences are unchanged. Literal braces such as `{questions}` pass as their own vars, the way money/index.mjs does, because setup-words' placeholder rule would otherwise refuse them.
- plain, `index.mjs` 564, 703, 737, 846: `localize` as above, with `team_place_is_group`, `outcome_per_question`, `machine_no_outcome`, `team_place_fixed`. None is a diagnostic or wire string: each is a refusal's detail, so each is read through `localize`.
- testcopy, `test/m/steps/follow.test.mjs:64`: the assertion message no longer copies notice-producers' sentence ("the outcome stays where it was"). What the test checks is unchanged.

Nine new ids are `steps.index.*`, each one assigned once. Its `en` is the code wording, so no row of words.json changes.

**Deferred:** none.

**Other modules:** `investigation/checks.mjs:26` holds the same sentence as `refusal.STEP_MEMBER_ONLY` (REPORT J1 to BOB). No other module's file was touched.

**Tests and checks (on the merged tree, 4dc161ba55):**
- `node --test bio-plane/test/m/steps/`: `ℹ tests 46`, `ℹ pass 46`, `ℹ fail 0`. Baseline before the edit: 46 of 46 as well.
- `checks/format.mjs /home/user/bio`: `format: 176 modules, 175 requirements files; 0 failures`.
- `checks/architecture.mjs /home/user/bio steps`: `architecture: 14 product files, 43 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `checks/coverage.mjs /home/user/bio steps`: `coverage: 1 modules, 29 of 29 live requirement ids named by a test; 0 failures`.
- `checks/ownership.mjs /home/user/bio steps tranche/T51 job/T51/steps`: `ownership: 4 files changed by steps between tranche/T51 and job/T51/steps; 0 failures` (my 3 files and this record).
- `checks/run.mjs /home/user/bio` (product-wide): `words: ... 3357 failures`, all in other modules; zero words findings in steps (`inline`, `plain`, `testcopy`, `handlist`). The product-wide `coverage` failures (28) are in other modules; steps has none. `architecture` and `format` report 0 failures.
- `bio-plane/src/setup-words/build.mjs --check`: stale-rows note only. It names the nine new `steps.index.*` ids, as expected (rows.mjs is regenerated at layer close). No refusal names steps.

**Size (session_01WtREN7u96ssU34h4ftCLDF):** test runs 3, module lines 1713 (src/steps/*.mjs: index.mjs, schema.mjs, checks.mjs).

## J3 · COMPLETE

Fix round 10, Wave A batch 3 (steps): done. Commit is on job/T51/steps.

**Fixtures published** in `bio-plane/test/m/steps/fixtures.mjs` (new), each made by the real steps over the real record (`./fixture.mjs`) when called, never stored, each with a test in `fixtures.test.mjs` that calls it and checks the real answer (R4, R23; R1, R2, R4, R5, R9):
- `stepRead`: `{read, lookedRead, unknownAnswer, unseenAnswer, lookedStep, hiddenStep, ...}`. Note for notice-producers: steps has no `stepRead`; the real read is `step({step, viewer})` (R4). The fixture answers it for a visible step, an unknown id and an unseen step (both `NO_SUCH_STEP`, naming the id), and for a step whose look was answered later: `later_found[0].looked_at` is the look's own instant beside `at` (R23), and `laterFound({viewer}).found[0]` carries the same.
- `stepsWorld`: `{steps, world, acts, place, work, run, machine, principal, made, ended, product, notYourRun, noWork, seen, unseen, unknownStep, hiddenStep}`. `steps` is the real module on a world of its own with `registerRunHolder`, `step`, `stepCreate`, `stepEnd`, `recordProduct`, every act recorded in `acts`, and NO run holder yet: the user registers its own (once), as ai-runs does. The sample answers are from a second world where the assistant holds RUN-1 for Ann: `STEP_NOT_YOUR_RUN`, `STEP_NO_WORK`, `NO_SUCH_STEP`, a machine `stepEnd` (the system never judges an outcome, so none is passed) and `recordProduct`. Users re-point in their own jobs.

**Markers added:** no `fixtures-own`, no `fixtures-generic`. The `fixtures-contract`/`fixtures-run` rule does not apply (steps is the provider and runs earlier than its users in modules.json order only through ai-runs, capture-requests, notice-producers, which come later).

**Lines:** my lines in `checks/fixtures.mjs . steps --list` are at zero (the list reports 0 failures, 0 findings; the users' lines are theirs, re-pointed in their jobs). Left: none. Waiting/stay/Wave B lines: none of mine.

**Deferred:** none. **Other modules:** nothing found.

**Tests and checks:**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/steps/`: `ℹ tests 48`, `ℹ pass 48`, `ℹ fail 0` (46 before, +2).
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: `affected modules: 1 of 178; affected test files: 1 of 2747` (steps only; no user's file changed, so none else to run).
- format: `178 modules, 178 requirements files; 0 failures`. architecture: `14 product files, 43 relative imports ...; 0 failures`. coverage: `1 modules, 29 of 29 live requirement ids named by a test; 0 failures`. fixtures: `...; 0 failures`. words: `1 modules, 1878 string literals read ...; 0 failures`. ownership: `1 files changed by steps between tranche/T51 and HEAD; 0 failures` (before commit; the two test files are under steps' tests path).

Size (session_01UFKvJeZoUh7patpgPQr9b3): test runs 8, module lines 0 (src/steps unchanged; 2 new test files, 112 lines)
