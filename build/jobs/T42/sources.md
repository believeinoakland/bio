# sources (T42)

**Status** · session_01SnzeWkLZjLCzHaakfd3erC · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

**`uses` after the re-point: does sources keep `capture` for its tests?**

`src/sources/` will import only `doorbell` (and record-grammar, record-core, membership, provenance): no `capture` import is left in product code. But the test fixture still has to build a capture instance on the same storage and run its `migrate()`, for two reasons in doorbell's requirements: doorbell R25 reads its `env` from `captureOf(ctx).env`, and doorbell R13 records the pulling member as actor through `capture.recordCaptureActor`, which writes to capture R69's table. `architecture.mjs` judges test imports against `uses` too, so with `uses: [... "doorbell" ...]` and no `capture`, the fixture's import of capture fails the check.

My best reading, which I am building on: `uses` = record-grammar, record-core, membership, **capture, doorbell**, provenance. That is, `doorbell` is added and `capture` stays, used by the tests only (the fixture builds and migrates it); product code reaches the knocks only through doorbell. I am removing the other test import of capture (`invariants.test.mjs`' `captureOwns`) by reading record-core's `declaredTables()` instead.

The alternative is to drop `capture` and have the fixture never touch capture. That works only if `doorbellOf` makes and migrates capture's instance itself, which doorbell R25 does not say.

A wording point, not a question: sources R11 still says "in the same windows as knocks (`capture` R31)". By K2624 that would be `doorbell` R2. I am leaving the text alone, since it is BOB's.

## J2 · COMPLETE

**T42-8 complete** at `job/T42/sources` (tranche/T42 @ e85480d00c merged; B3, K2630).

**Entries applied:**
- T42-8 (N826): sources reaches the knocks through `doorbell`. The factory takes `deps.doorbell ?? doorbellOf(ctx)` (lazily, on first use) in place of `deps.capture`, for `pulledKnocksOf`, `knocksOf`, `knockerDigestOf` and `knockAttempt`.
- No `capture` import is left in `src/sources/`. Comments cite doorbell's ids: R2, R3, R13, R14, R15, R17, R18.
- Tests and fixture are re-pointed (`capture-split.md` §6):
  - `fixture.mjs` builds and migrates capture, then `doorbellOf(host, {capture})`, and knocks, pulls and spies on the doorbell.
  - `contract.test.mjs`:30 and `source.test.mjs`:65 resolve through `w.bell`.
  - `secret.test.mjs` cites doorbell R2 and R17.
- `invariants.test.mjs` no longer imports capture's `captureOwns`. It tells another module's `source…` tables by record-core's `declaredTables()`.
- R11's wording (K2628) needed no code change.

**`uses` for BOB to write (K2628):** record-grammar, record-core, membership, capture, doorbell, provenance. `capture` is used by the test fixture only.

**Deferred:** none. **Found in other modules:** none.

**Reading set:** read whole, about 271 KB as measured at START (under 300 KB):
- `requirements/sources.md`;
- the public parts of record-grammar, record-core, membership, provenance and doorbell;
- `layers.md`, layer 3's contract and capture's second-split section;
- my plan entry and the plan's rules, K2607, `capture-split.md` §5–§6;
- the module's code and every test file.

**Tests and checks:**
- `node --test bio-plane/test/m/sources/`: tests 30, pass 30, fail 0. No layer tests are named in the manifest, and no service I provide changed.
- `format`: 147 modules, 146 requirements files; 0 failures.
- `architecture … sources`: 2 failures, both "imports doorbell, which sources does not declare in uses" (`index.mjs`, `fixture.mjs`). They clear with the `uses` edit above. With that edit made locally (not committed), the check gives 12 product files, 32 relative imports; 0 failures.
- `coverage … sources`: 19 of 19 live requirement ids named by a test; 0 failures.
- `ownership … sources tranche/T42`: 8 files changed; 0 failures.

Size (session_01SnzeWkLZjLCzHaakfd3erC): test runs 6, module lines 1010
