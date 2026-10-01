# capture (T18)

**Status** · session_01F2hRC49z1gH7T1KRC7gwwg · depth 2 · COMPLETE · handled B4

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

## J4 · COMPLETE

**Entries applied** (layer 3, capture; `current.md` capture bullet, B1–B4, K655, K656, K659):
- **The split's deletion (K617, K649 (1), K624 (1)).** `capture/acquire.mjs` is a re-export of `acquisition` only (its 14 names), for `ratification/ops.mjs`, `monitoring/index.mjs`, `test/m/capture-requests/drain.test.mjs` and `test/m/monitoring/tick.test.mjs`; capture's next job deletes it. `capture/index.mjs` and `ops.mjs` import `acquisition` (R73: `acquire`, `archiveLookup`, `profileOf`, `profileView`, `governedFetch`, `governedCall`, the grade note). `acquire.test.mjs` deleted (its Rs are acquisition's); the live capture Rs it alone named are now proved in `act.test.mjs`: R73 (same answer as acquisition's act over this store, what it learns landing in capture's tables), R55 (the compute measurement), R38 (no place named; profiling only through the instance's view).
- **N409 (K609, R65).** `PULL_WITHIN_FAILED` answers one fixed sentence (`PULL_WITHIN_FAILED_DETAIL`), never what was thrown.
- **N418 (K650, R74).** Every write goes through `record-core.transact` (`#tx`; the storage's `transactionSync` only for a Capture built with no record): all 23 writers, the doorbell's two former `transactionSync` calls included. Tested by a sweep of every writer's statements, by atomicity under a failing statement, and by `afterCommit` held until the (caller's) commit.
- **C-2.7 (K585 (3)).** `capture/grammar.mjs` (`checkInformationExtension`, `INFO_ENUMS`, `CONTENT_HASH_RE`, `MONITOR_FREQ`, copied whole) registered in `captureOf` through `record.registerGrammar("capture", {ids: ["C-2.7"]})`; identical findings to the catalogue's arm through `checkBundle` with `record.grammars()` and through `auditPass` (K655 (3): no promotion edge). The catalogue's arm stays until inquiry's face passes grammars (T19).
- **✱ C-85.** `KNOCK_CHECKS` moved into `capture/checks.mjs` with its reasoning; the catalogue's copy deleted (146 lines); `doorbell.mjs` and `index.mjs` read the module's table.
- **The legacy-index map's §4.4 plain move (K649 (7)).** `capturePublicOp` (knock alone, public) and `captureOp` (links, capture, archivelookup, acquire; acquire handing its answer to the door's `readAcquired`, extraction's `acquireReadingOp`); `src/index.mjs` rewired (§12.2). Proved by unit tests and a whole-plane Miniflare test (`plane.test.mjs`).
- **Converts:** `cap13-reuse-pages` (R24), `cap14-reused-from` (R25, with the additive-column migration), `d522-unattended-render` (R39, R40), `subresources` (the `capturelimit`, `siteassets`, `sitechrome` routes: R23, R24, R25) in `converts.test.mjs`.

**Rows `awaiting stamp` (T19):** C-85.1–.5 moved (rows and `where`s unchanged); C-2.7 registered by capture.

**Deferred:** nothing of this module. `KNOCK_CHECKS` is deliberately not frozen (R52's negative control removes a row).

**Found in other modules** (J3): control-plane's R36 test asserts the thrown message capture no longer carries (its fix: assert `PULL_WITHIN_FAILED_DETAIL`; `pull.mjs`' `promoteOrFault` comment stale); plane and agent-worker bundles stale; the DEC-49 guard harvests the catalogue only (C-85 reads unregistered there; `nc-d508`, `nc-d513`, `d470` census at the release); monitoring may re-point `MONITOR_FREQ` to capture's export.

**Tests and checks:**
- `node --test test/m/capture/*.test.mjs`: tests 89, pass 89, fail 0.
- `node --test "test/m/**/*.test.mjs"` whole (after the deletion): tests 3412, pass 3389, fail 1, todo 22; the one failure is control-plane's R36 above (J3). The three module-order failures of J3 are gone on the tranche.
- `format`: 82 modules, 77 requirements files; 0 failures.
- `architecture capture`: 18 product files, 67 relative imports; 0 failures.
- `coverage capture`: 47 of 47 live requirement ids named by a test; 0 failures.
- `ownership capture tranche/T18`: 15 files changed; legacy-index 10 added, 23 removed; legacy-checks 0 added, 146 removed; legacy-store 0; 0 failures. The 10 added lines are `src/index.mjs`:39–40 (the two imports), :316 (`capturePublicOp`) and :620–626 (the `captureOp` block handing the stamps and `readAcquired`).

Size (session_01F2hRC49z1gH7T1KRC7gwwg): test runs 16, module lines 2964
