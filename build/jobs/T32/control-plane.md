# control-plane (T32)

**Status** · session_012juXu9ukz4qbejbB2SqhAc · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** N548 (K1416; L11): R42's rank test no longer names `affordances`. `promotion-step.test.mjs` reads the module directly after the step from `build/modules.json` (the first module of layer 11 other than control-plane, today `wizard-scripts`) and also asserts the module directly before it is the last of layers 1–10. The suite's fixture (`record.mjs`), which mirrors the composition root's `STEP_ORDER` and is what the test reads, now places the step before that same module (exported as `FIRST_LATER`), as plane's N548 change will. `step.mjs`'s header comment re-worded to match (no behaviour change).

**Note on the plan's red 6.** The rank test reads the suite's own fixture order, not plane's `STEP_ORDER` (`src/plane/store.mjs`), so it is green on this branch now, before plane's merge. It therefore does not by itself prove plane's order: plane's N548 job should pin its own `STEP_ORDER` against `build/modules.json` in its tests (plane's R10). Reported to BOB.

**Deferred.** None. **Found in other modules.** plane: `STEP_ORDER` still splices before `affordances` (`store.mjs`:80–84), N548's plane half, already planned.

**Reading.** Requirements whole; plan entries (N548, L11, red 6); the R42 test, fixture and `step.mjs`; plane's `STEP_ORDER`. The change touches only R42's test fixture, so the other Uses' public parts were not re-read.

**Tests and checks.**
- `node --test test/m/control-plane/` (from `bio-plane/`): tests 159, pass 159, fail 0, skipped 0 (the R42 rank test red before the change: `wizard-scripts (layer 11) ranks after the step`).
- format: 98 modules, 97 requirements files; 0 failures. architecture: 45 product files, 253 relative imports; 0 failures. coverage: 36 of 36 live requirement ids named by a test; 0 failures. ownership: 0 failures (re-run after commit, below).

Size (session_012juXu9ukz4qbejbB2SqhAc): test runs 3, module lines 25
