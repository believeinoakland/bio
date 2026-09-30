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
