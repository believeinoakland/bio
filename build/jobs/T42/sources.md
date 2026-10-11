# sources (T42)

**Status** · session_01SnzeWkLZjLCzHaakfd3erC · depth 2 · WORKING · handled B2

## J1 · QUESTION

**`uses` after the re-point: does sources keep `capture` for its tests?**

`src/sources/` will import only `doorbell` (and record-grammar, record-core, membership, provenance): no `capture` import is left in product code. But the test fixture still has to build a capture instance on the same storage and run its `migrate()`, for two reasons in doorbell's requirements: doorbell R25 reads its `env` from `captureOf(ctx).env`, and doorbell R13 records the pulling member as actor through `capture.recordCaptureActor`, which writes to capture R69's table. `architecture.mjs` judges test imports against `uses` too, so with `uses: [... "doorbell" ...]` and no `capture`, the fixture's import of capture fails the check.

My best reading, which I am building on: `uses` = record-grammar, record-core, membership, **capture, doorbell**, provenance. That is, `doorbell` is added and `capture` stays, used by the tests only (the fixture builds and migrates it); product code reaches the knocks only through doorbell. I am removing the other test import of capture (`invariants.test.mjs`' `captureOwns`) by reading record-core's `declaredTables()` instead.

The alternative is to drop `capture` and have the fixture never touch capture. That works only if `doorbellOf` makes and migrates capture's instance itself, which doorbell R25 does not say.

A wording point, not a question: sources R11 still says "in the same windows as knocks (`capture` R31)". By K2624 that would be `doorbell` R2. I am leaving the text alone, since it is BOB's.
