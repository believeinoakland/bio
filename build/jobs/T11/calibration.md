# calibration (T11)

**Status** · session_014Qef6d2cmQSeamSR91bGRi · depth 2 · COMPLETE · handled B1

CALIBRATION #3 (the first session of this job to start in T11).

## Completion

**Entries applied** (plan layer 4: N223, calibration's share).
- **R18 `onSubjectRegistered(module, fn)`** and **R19 `onSignalRecorded(module, fn)`**, worded on retrieval R52's pattern (K343). Registration goes through membership's `listenerRefusal` (R81: `LISTENER_MALFORMED`, `LISTENER_DECLARED`), one slot each, kept in `MODULE_ORDER` (R83), unknown modules last in registration order; R12's `onCalibration` now shares the one `#register` helper. After each successful `calibrationSubjectRegister` (R8) every listener is told once with `{engine, probe_id, next_probe}`; after each signal `calibrationSignalRecord` (R7) records, with `{engine, next_probe}` (null with no subject). Each listener gets its own copy of the notice and is awaited in turn; one that throws or rejects is isolated, so it changes neither the write, the answer nor a later listener's notice. A refused act tells no one.
- **Interface note (for `scheduler`, layer 10).** To await the listeners (the scheduler's `arm` is async), `calibrationSubjectRegister` and `calibrationSignalRecord` are now `async`, as retrieval's `selectionCreate` and progressions' `threadInstance` are. Their answers are unchanged; the legacy store's dispatcher already awaits every op (`await map[op]()`), so the ops are unaffected. `calibrationDue`, `calibrationWake`, `calibrationTick` (R9) and every other service stay synchronous. The scheduler registers `arm` with both notices in its `listenTo` (its R9, N223).

**Deferred.** None.

**For BOB to strike (the requirements file is not mine to write).** R18's and R19's `(not yet met: N223)` marks are met. The Status line's "Not yet met: R4 and R12 (N41), R5 (D-587, D-668), R8 (D-668), R10 and R11 (N41), R16 (K23)" is stale: each is met and tested at the interface (store.test.mjs names every one, all pass).

**Found in other modules and artifacts.**
- `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`): stale, since it takes `calibration/index.mjs`. Not rebuilt (mechanics §14).
- `scheduler`: its four R9 `test.todo`s for calibration's producers (`test/m/scheduler/producers.test.mjs`) become buildable once it registers with R18/R19; it is on the plan for layer 10. R7's answer field `armed` (true when a subject exists) is truthful once the scheduler registers; R7 does not word it.
- `test/calibration.control.mjs` (legacy-tests): its `changelog` anchor in `calibrationSignalRecord` is unchanged; nothing to re-anchor.

**Tests and checks** (on `job/T11/calibration`):
- `node --test bio-plane/test/m/calibration/`: tests 56, pass 56, fail 0, todo 0 (the new `notices.test.mjs`: 13 tests over R18/R19 and R7/R8; `store.test.mjs` awaits the two now-async services).
- Modules that use calibration: `extraction` 75/75, `scheduler` 46 pass, 0 fail, 6 todo; identical on the tranche's code.
- Legacy `bio-plane/test/calibration.test.mjs` (HTTP ops): 113 passed, 0 failed.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture calibration`: 8 product files, 21 relative imports; 0 failures. `coverage calibration`: 19 of 19 live requirement ids named by a test; 0 failures. `ownership calibration tranche/T11`: legacy-checks and legacy-store 0 added, 0 removed; 0 failures.

Size (session_014Qef6d2cmQSeamSR91bGRi): test runs 4, module lines 1095

## J1 · COMPLETE

Done: N223's calibration share. R18 onSubjectRegistered and R19 onSignalRecorded (retrieval R52's pattern): registered through membership listenerRefusal, run in MODULE_ORDER, each told once after the write with its own copy, awaited, a throwing or rejecting listener isolated; a refused act tells no one. calibrationSubjectRegister and calibrationSignalRecord are now async so scheduler's async arm is awaited (answers unchanged; the dispatcher already awaits ops; R9's services stay sync) - for scheduler's layer-10 job. calibration 56/56; extraction 75/75 and scheduler 46/0/6 todo, identical to the tranche; legacy calibration.test 113/0; format, architecture, coverage 19/19, ownership 0 failures. For you to strike: R18/R19's not-yet-met marks, and the Status line's stale not-yet-met list (R4, R5, R8, R10-R12, R16 are all met and tested). Stale, not rebuilt: bio-plane/dist/bio-plane.bundled.mjs. No catalogue row added or changed.
