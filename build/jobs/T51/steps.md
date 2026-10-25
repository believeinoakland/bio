# steps (T51)

**Status** · session_01UFKvJeZoUh7patpgPQr9b3 · depth 1 · WORKING · handled B2

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
