# plane (T32)

**Status** · session_01JL5ihXZTwMD225KhykMihR · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied.** N548 (K1416; plan L11): `STEP_ORDER` (`bio-plane/src/plane/store.mjs`) now inserts control-plane's promotion step before the first layer-11 module, named once as `FIRST_LAYER_11 = "wizard-scripts"` (`MODULE_ORDER` carries no layers and product code cannot read `build/` at run time), instead of before `affordances`. The step now ranks after every layer 1–10 module and before every later one (control-plane R42). Comments in `store.mjs` re-worded to match.

**Tests.** `test/m/plane/store.test.mjs`'s R2/R10 rank test now checks full compliance against `build/modules.json`: every module of layers 1–10 ranks before the step, every later module after it, the step sits directly before the first layer-11 module, and the order is otherwise `MODULE_ORDER`. The old test pinned only `affordances` and passed with `wizard-scripts` (layer 11) ranked before the step. The new test fails on the old code (`wizard-scripts (layer 11) ranks after the step`) and passes on the new. The promotion probe now also registers `wizard-scripts` and observes `scheduler, control-plane, wizard-scripts, affordances`.

**Deferred.** None.

**Found in other modules / for BOB.**
- plane's own requirements: R10's words "(the step at the rank `STEP_ORDER` gives the held step today, before `affordances`)" and R2's reference to that rank are stale against K1416/N548 (the step now precedes `wizard-scripts`). This is wording only; the code meets control-plane R42. BOB amends the requirement.
- control-plane: `bio-plane/test/m/control-plane/record.mjs`:57–61 holds its own copy of `STEP_ORDER` (before `affordances`), and `promotion-step.test.mjs`:32 asserts `affordances` follows the step. That is the plan's inherited red 6, control-plane's to fix in its L11 job (it fails today with or without this change; with control-plane's suite run on this branch: 158 pass, 1 fail, that test).

**Runs.** `node --test test/m/plane/ test/system/migrate-released.test.mjs` (in `bio-plane/`): 86 tests, 86 pass, 0 fail, 0 skipped. Users of the composition root whose fixtures construct `Store`: public-read 110 pass 0 fail; ratification 204 pass 0 fail; reevaluation 121 pass 0 fail; control-plane 158 pass 1 fail (inherited red 6, above). No layer tests named in the manifest.
Checks: `format: 98 modules, 97 requirements files; 0 failures`; `architecture: 32 product files, 277 relative imports (2 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 20 of 20 live requirement ids named by a test; 0 failures`; `ownership: 3 files changed by plane between tranche/T32 and HEAD; 0 failures`.

Size (session_01JL5ihXZTwMD225KhykMihR): test runs 9, module lines 35

## J1 · COMPLETE

N548 applied: STEP_ORDER (store.mjs) puts control-plane's step before the first layer-11 module (FIRST_LAYER_11 = wizard-scripts); plane's R2/R10 rank test now checks it against build/modules.json's layers in full (fails on the old code). plane 86/86, public-read, ratification, reevaluation green; control-plane 1 fail = inherited red 6 (its own record.mjs STEP_ORDER copy and promotion-step.test.mjs:32), its L11 job's. Four checks 0 failures. For BOB: plane R10's wording 'before affordances' is stale against K1416 (wording only). Record: build/jobs/T32/plane.md.

## B2 · CHANGE processed

B2 (from CONTROL-PLANE #21 J1) asks plane's own tests to pin plane's `STEP_ORDER`: the step after every layer 1–10 module and directly before the first layer-11 module read from `build/modules.json`. J1's change already does this (`test/m/plane/store.test.mjs`, the R2/R10 rank test, commit on this branch before J1), so no code changed. Re-ran: plane 86 tests, 86 pass, 0 fail, 0 skipped; format, architecture, coverage (20 of 20) and ownership (3 files) each 0 failures.

Size (session_01JL5ihXZTwMD225KhykMihR): test runs 10, module lines 35
