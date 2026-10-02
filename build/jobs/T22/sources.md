# sources (T22)

**Status** · session_017YEhAN64o2U9JwvDJtoKmG · depth 2 · WORKING · handled B1

SOURCES #7, T22 layer 3. Entries from BOB's B1 START (`build/plan/current.md` L3 sources, K1037). Tests only: no module code, requirement or generated artifact changed (module 837 lines before and after).

## Completion

**Applied** (capture's T22 folds, K1023, as CAPTURE #14's J2 named them)
- **Resolve reason** (capture R32, `RESOLVE_NO_REASON`, C-118.7). `test/m/sources/contract.test.mjs` (R15) and `source.test.mjs` (R1's refusals): each fixture discard now sends `reason: "not material for the group"`, so the discarded knock is still reached and each test's assertion is unchanged.
- **Instance limit** (capture R31, 10 knocks per instance in any 10 minutes). `source.test.mjs` (R1): the 50-knock loop that proves one keyed read per `sourceOf` advances the module's clock one 10-minute window before each knock. `secret.test.mjs` (R11's identical refusal): the clock advances one window before each of the 16 attempts, so capture's rate never answers in the refusal's place; the "an unknown entry" arm reaches `SECRET_NOT_RECOGNISED` again, and the byte-identical comparison and "a failure records nothing" stand as before. Chose advancing `now` over raising `perIpLimit`/`globalLimit` on the fixture's `knock`: the attempts in `secret.test` go through `knockAttempt`, which takes no limits, and the R11 rate tests keep counting real windows.
- **Negative controls.** Each of the four fixes reverted alone turns its own test red again (R15, R1 refusals, R1, R11: each 0 pass, 1 fail).
- **Re-scan** (N469, N471, N480): my paths and tests name no T20-deleted file, `tools/`, `legacy-tests` or the deleted plane `index.mjs`; the only `index.mjs` names are live modules' imports. Nothing to re-word.

**Deferred.** `secret.test.mjs`'s two R11 rate tests still say "12 in the window, the thirteenth refused" from when the per-source bound was larger; they pass (the attempt after 12 is `RATE_IP`) but no longer pin the bound's edge (capture's 5). Capture's own tests prove its edge (its R31); re-stating it here would tie these tests to capture's constants and to its sliding estimate's decay, so the wording is left for a later sources job to tighten if BOB wants it.

**Found in other modules.** None. Nothing staled: no generated artifact's input changed.

**Tests and checks**
- `node --test bio-plane/test/m/sources/`: 24 pass, 0 fail (4 fail before).
- Whole `bio-plane/test/m`: 4839 tests, 4818 pass, 2 fail, 19 todo. The two reds are the inherited ones BOB named: control-plane `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310. `row-census.test.mjs` is not red.
- `checks/format.mjs`: 85 modules, 84 requirements files, 0 failures. `checks/architecture.mjs bio sources`: 11 product files, 0 failures. `checks/coverage.mjs bio sources`: 15 of 15 live ids named, 0 failures. `checks/ownership.mjs bio sources tranche/T22`: 4 files, 0 failures.

Size (session_017YEhAN64o2U9JwvDJtoKmG): test runs 8, module lines 837
