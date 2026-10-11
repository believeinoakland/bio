# doorbell (T43)

**Status** · session_01SeTaW1cz4FqJ1wHpmaFkGf · depth 2 · COMPLETE · handled B1

## Record: first merge (T43-7; N851)

**Read.** B1 START; the reading set (540 KB with tests, under K2700's 600 KB). Read whole: `requirements/doorbell.md`; every file under `src/doorbell/` and `test/m/doorbell/`; plan T43 (rules, L3 entries); `draft-T43-cleanup.md` (§0, §N851, §N864, and the rest of it); K2607, K2609, K2680, K2689, K2700, K874; `layers.md`, layer 3's contract and its capture-split sections; capture's `checks.mjs` (rows' source). The Uses' public parts were read only for the services this job touches (capture's rows, `declareTables`, `captureOf`). No code outside those services changed.

**Entries applied.**
- R21 (N851, K2609): C-85.1–C-85.5 (`KNOCK_CHECKS`) and C-118.2, .3, .4, .7 (`DOORBELL_CHECKS`) are defined in `src/doorbell/checks.mjs` alone; nothing is imported from `../capture/checks.mjs`. Each row's `check`, `translation` and `where` are byte-identical to capture's today, checked by script with JSON equality. `KNOCK_CHECKS` is unfrozen (R9); `DOORBELL_CHECKS` and its rows are frozen, as before.
- `rows.test.mjs`: the "one row, not a copy" arm and the identity with capture's `KNOCK_CHECKS` are dropped. The test now pins each of the nine rows' code, number and translation literally, and asserts that no row or table is capture's object. That assertion holds now and after capture's delete. Comments and DEC-149 line labels are re-pointed in `doorbell.test.mjs`, `t35.test.mjs` (now `checks.mjs:96`, `:103`) and `fixture.mjs`.
- R25 (step 1): `instance.test.mjs` :46 and :53 expect `["doorbell", "exempt"]` (its own ownership). The `capture.declareTables()` call and the held arm stay in code (`index.mjs`:168, :170) until the CHANGE. The test is red by name, as plan rule 4 (5) accepts, until T43-8.

**Deferred.** None. The second step (N864: drop the call and the held arm; :48–53, :76–77) waits for BOB's CHANGE after capture's merge.

**Found in another module (REPORT).** answer-envelope: with the rows now this module's own objects, R7/R2's totality is red from this merge, not from T43-8's as rule 4 (9) says. The cause is that `CHECK_FAMILY_FILES` lacks `src/doorbell/checks.mjs` (`DOORBELL_CHECKS`, `KNOCK_CHECKS`): N851's answer-envelope R12, T43-14. Three tests are red: `families.test.mjs`, the T41 test (R10, R11, R7, R2), "CHECK_FAMILIES is total" (R2, R7) and the T37 case-carriage test (R7, R2). Each reports the two doorbell exports unreached. All three are green on `tranche/T43` without this change. Rule 4 (9)'s start needs moving to T43-7.

**Tests.**
- doorbell: 69 tests, 68 pass, 1 fail. The fail is R25's ownership arm, accepted under rule 4 (5).
- Users:
  - sources: 30 pass, 0 fail.
  - actions: 111 pass, 0 fail.
  - answer-envelope: 27 pass, 3 fail (above).
  - store-door: 44 pass, 0 fail.
  - control-plane: 223 pass, 0 fail.
  - plane (with `migrate-released`): 185 pass, 0 fail.

**Checks** (process repository):
- format: 147 modules, 0 failures.
- architecture doorbell: 14 product files, 0 failures.
- coverage doorbell: 25 of 25 ids, 0 failures.
- ownership doorbell `tranche/T43`: 7 files, 0 failures.

Size (session_01SeTaW1cz4FqJ1wHpmaFkGf): test runs 6, module lines 1140

## J1 · COMPLETE

First merge (T43-7, N851) done, pushed on job/T43/doorbell @ 626974aec1; record has the details.
R21: the nine rows are defined in src/doorbell/checks.mjs alone, values byte-identical to capture's. rows.test.mjs drops the identity arms and pins each row literally.
R25: instance.test.mjs :46/:53 expect [doorbell, exempt]. The call and the held arm stay in code. That test is red by name (rule 4 (5)).
REPORT: answer-envelope R7/R2 totality goes red at THIS merge, not at T43-8: CHECK_FAMILY_FILES lacks src/doorbell/checks.mjs (DOORBELL_CHECKS, KNOCK_CHECKS); that is T43-14. 3 tests in families.test.mjs (T41 families; 'CHECK_FAMILIES is total'; T37 case-carriage), all green on tranche/T43 without this change. Rule 4 (9)'s start wants moving to T43-7.
Users otherwise green: sources 30/0, actions 111/0, store-door 44/0, control-plane 223/0, plane 185/0. doorbell 68/1 (the accepted arm).
Checks: format, architecture, coverage (25/25) and ownership (7 files), each 0 failures. No file outside paths. Ready for the CHANGE after capture's merge.
