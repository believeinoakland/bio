# scheduler (T11)

**Status** · session_01LjsX9MK5ewxBsUxpMLKmTd · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1; plan layer 10, N223, N224, K351)
- N223's consumers: R9 now registers `arm` with calibration's `onSubjectRegistered` (R18) and `onSignalRecorded` (R19), ai-runs' `onRunOpened` (R43) and capture-requests' `onRequestFiled` (R44), in `listenTo` and in `schedulerOf`'s wiring. Each arms outright (each act creates its consumer's work); the reconcile reads the owner's wake. The four owners are created by `legacy-store` (store.mjs 575, 584, 637) before `schedulerOf` (642), so reaching them eagerly takes none of their `deps`.
- N224's consumers: R10's rank was already handed to monitoring's `archiveTick(now, rank)` and `cadenceTick(now, rank)`, to capture-requests' `drain({…, rank})` and to bias's `biasDebtSweep(now, rank)` as `rank(items, now)`; nothing to change here. Tested (rank.test.mjs).

**Marks my work meets** (for BOB to strike): R9's "not yet met, for four producers" — the four now arm; R9's one remaining gap is entities R13 (below). R10's mark: met on the scheduler's side; its owners' ordering is met by capture-requests R12 and bias R33, and by monitoring R19/R20 once MONITORING #3's job lands.

**Tests.** The four R9 `test.todo`s are replaced by cases in the idle-instance test and in the registration and R17 tests. Two `test.todo`s remain, each naming its cause: R9 through entities' notice (entities R13's `onResolved` runs inside the resolving transaction; legacy-store arms after it), and R10's per-owner ordering (each owner's to test; monitoring's in its own T11 job).

**Deferred.** None of this module's own.

**Found in other modules** (REPORT): the plane's generated `bio-plane/dist/bio-plane.bundled.mjs` is stale by this change (not rebuilt, mechanics §14). `legacy-store`'s `op=calibrationsignal` answer `armed` is now true through calibration R19's notice; nothing else to change.

**Runs**
- `node --test bio-plane/test/m/scheduler/`: tests 48, pass 46, fail 0, todo 2.
- Providers used (their notices now carry the scheduler's listener in the plane): calibration 56 pass 0 fail; ai-runs 49 pass 0 fail; capture-requests 62 pass 0 fail.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … scheduler`: 0 failures. `checks/coverage.mjs … scheduler`: 20 of 20 live ids named, 0 failures. `checks/ownership.mjs … scheduler tranche/T11`: 0 failures.

Size (session_01LjsX9MK5ewxBsUxpMLKmTd): test runs 5, module lines 367
