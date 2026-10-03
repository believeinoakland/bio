# BOB to plane (T32)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T32) L11, plane: N548 (K1416). `STEP_ORDER` (`bio-plane/src/plane/store.mjs`:80) inserts control-plane's promotion step before `affordances`; since N544 (membership, T32 L2) `wizard-scripts` precedes `affordances` in `MODULE_ORDER`, so the step now runs after `wizard-scripts`, against control-plane R42 (after every layer 1–10 module, before every later one). Insert it before the first layer-11 module (read the layers from what you already hold, or name `wizard-scripts`), so control-plane's `promotion-step.test.mjs` passes. control-plane merges first in this pair; you merge last in L11.
Inherited reds: the plan's 1 (coverage of T32 ids not yours), 3 (the UI's DEC-88 tests, Bob's).
