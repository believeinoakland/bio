# capture (T18)

**Status** · session_01F2hRC49z1gH7T1KRC7gwwg · depth 2 · WORKING · handled B3

## J1 · QUESTION

Two entries with no wording yet in `capture.md`; my best readings, which I am building on now:

1. **N409 (K609).** R65 as worded says a `within` throw answers `PULL_WITHIN_FAILED` (500) but not what its `detail` says, and my tests today assert the thrown message rides in it (`knocker.test.mjs`:559). Best reading: R65 gains "its `detail` is one fixed sentence, never the thrown message"; I test it under R65 and drop the old assertion.
2. **N418 (K650).** No capture R names it. Best reading: a new sentence (under R32's "one transaction" of record-core, carried in capture as, say, R74 or appended to R44): "every write this module makes goes through `record-core.transact` (its R32), so a write made inside a caller's `transact` joins it and rolls back with it, and `afterCommit` (its R66) holds what is called inside it". I am building it: every multi-row write and the doorbell's two `transactionSync` calls go through `this.core.transact` (falling back to the storage's `transactionSync` only when no record is handed in). Tell me the R id to name in the tests.

Also noted for your CHANGE: R37 and R47–R52 re-worded for C-85 in this module's table (I am moving `KNOCK_CHECKS` into `capture/checks.mjs` and deleting the catalogue's copy, ✱), and R37 for C-2.7 registered through `registerGrammar`. I will name the tests R37/R47–R52 as they stand.

## J2 · QUESTION

**Replaces J1** (same two points, plus a third).

Two entries with no wording yet in `capture.md`; my best readings, which I am building on now:

1. **N409 (K609).** R65 as worded says a `within` throw answers `PULL_WITHIN_FAILED` (500) but not what its `detail` says, and my tests today assert the thrown message rides in it (`knocker.test.mjs`:559). Best reading: R65 gains "its `detail` is one fixed sentence, never the thrown message"; I test it under R65 and drop the old assertion.
2. **N418 (K650).** No capture R names it. Best reading: a new sentence (under R32's "one transaction" of record-core, carried in capture as, say, R74 or appended to R44): "every write this module makes goes through `record-core.transact` (its R32), so a write made inside a caller's `transact` joins it and rolls back with it, and `afterCommit` (its R66) holds what is called inside it". I am building it: every multi-row write and the doorbell's two `transactionSync` calls go through `this.core.transact` (falling back to the storage's `transactionSync` only when no record is handed in). Tell me the R id to name in the tests.

4. Noted for your CHANGE: R37 and R47–R52 re-worded for C-85 in this module's table (I am moving `KNOCK_CHECKS` into `capture/checks.mjs` and deleting the catalogue's copy, ✱), and R37 for C-2.7 registered through `registerGrammar`. I will name the tests R37/R47–R52 as they stand.

3. **C-2.7's gate test.** The entry says "tested for identical findings at the gate and the audit". The gate is promotion's `runGate`, and `promotion` is not in capture's uses, so a test of mine importing it fails the architecture check. Best reading: I register in `captureOf` (once per storage, `record.registerGrammar("capture", {ids: ["C-2.7"], arm})`) and test (a) identical findings to the catalogue's built-in arm over a set of information bundles through `checkBundle` with `record.grammars()` (exactly what promotion R27's gate passes) and without, and (b) the same through `record.auditPass`. If you want the gate itself exercised, add `promotion` to capture's uses (a uses edge, yours) and I add the arm.

## J3 · REPORT

Everything but the split's deletion is built, tested and pushed (`job/T18/capture` @ c2a096736e); I wait for your CHANGE that acquisition has merged. Found for other modules:

1. **control-plane (L11), R36's test contradicts capture R65 as now worded (N409, K655).** `test/m/control-plane/doorbell.test.mjs`:477 asserts `first.detail` matches `/the promotion did not complete/`, i.e. that capture carries the message `pull.mjs`' `promoteOrFault` throws into its `PULL_WITHIN_FAILED` answer. R65 now says the detail is one fixed sentence, never the thrown message, so that one assertion fails (the rest of the test passes: nothing written, no message leaked). Fix is control-plane's: assert the fixed sentence (`capture`'s exported `PULL_WITHIN_FAILED_DETAIL`), and `promoteOrFault`'s comment ("capture carries the message into its answer") is stale. Until then `test/m` has this one red test from my change.
2. **Three red tests on `tranche/T18` itself, not from my change** (verified on a clean checkout of `origin/tranche/T18`): membership `module-order.test.mjs` (R83 MODULE_ORDER), `t9-notice-sight-bounds.test.mjs` (R79), promotion `registry.test.mjs` (R39/R45/R46): the pinned total order predates `acquisition` (and the other T18 modules) in `modules.json`.
3. **Stale generated artifacts (§14):** the plane bundle (`bio-checks.mjs`, `src/index.mjs`, `capture/` changed) and the agent-worker bundle (it takes `bio-checks.mjs`; C-85 left it). I rebuilt neither.
4. **The DEC-49 guard** (release only) harvests `*_CHECKS` from the catalogue alone: C-85 now reads unregistered there, as C-75 and C-35 do. Legacy suites naming the catalogue's `KNOCK_CHECKS` (`nc-d508.mjs`, `nc-d513.mjs`) and the `d470` catalogue census move with it (legacy-tests, at the release).
5. **monitoring (L10):** `MONITOR_FREQ` is now exported by capture (`capture/index.mjs`, frozen, same six words) for its re-point.
6. **Rows `awaiting stamp` (T19):** C-85.1–.5 moved to `capture/checks.mjs` `KNOCK_CHECKS` (✱, catalogue copy deleted; rows and `where`s unchanged); C-2.7 now registered by capture (`capture/grammar.mjs`), the catalogue's arm kept until inquiry's face passes grammars.

`test/m` whole: 3374 tests, 3348 pass, 4 fail (the four above), 22 todo.
