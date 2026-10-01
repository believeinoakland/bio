# progressions (T19)

**Status** · session_01XeKXwUVQ7NTKCEh2MZSm9w · depth 2 · COMPLETE · handled B1

## Completion (PROGRESSIONS #6)

**Entries applied** (`build/plan/current.md` L5 progressions, kept; `draft-T19.md` L5; B1):
- **Rule 1:** `src/progressions/checks.mjs` reads `NO_BASIS` (C-33.40) and `NO_CITATION` (C-33.41) from record-grammar's `SHARED_ACT_CHECKS` (`src/record-grammar/index.mjs`, K765), not the catalogue's `ACT_SHAPE_CHECKS`. Its header and `refusal`'s comment say so. `define.test.mjs` and `exceptions.test.mjs` are re-pointed the same way. Define's R28 arm no longer asserts what the catalogue holds. It now asserts that `SHARED_ACT_CHECKS` holds exactly `NO_BASIS` and `NO_CITATION` with C-33.40 and C-33.41, and that neither is a row of this module's. `index.mjs`' header comment (line 11) is re-worded. No progressions file, product or test, imports `bio-checks.mjs`. No answer changes: the rows are the same objects' numbers and translations.
- **N433:** the four rows (C-100.11, C-100.14, C-100.18, C-100.21) are held unchanged.
- **R36:** `Progressions.COUNT_KEYS` and `counts(hid)` cover all seven figures R36 names, in this order: `progressionDefs`, `progressionStages`, `progressionDefVersions`, `progressionStageVersions`, `progressionInstances`, `progressionExceptions`, `proposalDispositions`. `progressionInstances` and `progressionExceptions` are keyed on `bundle_id` with `COALESCE`, as the store's `n(t, "bundle_id")` took them; the other five count every row. The figures are registered once per storage in `progressionsOf` through `record.registerCounts("progressions", …)`. A record without the seam is left alone, and a refusal throws, as content and capture do. `counts` is synchronous and writes nothing.

**Decision (mine, within R36):** B1 lists five figures; R36, the contract, lists seven. Its two bundle-keyed ones (`progressionInstances`, `progressionExceptions`) are the store's lines 1069 and 1072. I registered all seven.

**Rs met, with their tests (for BOB to strike):**
- R36: `figures.test.mjs`, "R36: the seven figures are registered once at start …" and "R36: with no hid each figure is its table's whole row count …".
- Rule 1 (no `bio-checks.mjs` import) and R28's shared rows: `define.test.mjs` "R27 R28: …", "R4 R23: …"; `exceptions.test.mjs` "R14: refusals in order …".

**Deferred:** nothing new. R32 stays deferred (K102), as before.

**Found in other modules (REPORT):**
1. **legacy-store (L10):** `store.mjs` `#counts` lines 1056–1080 report the same seven keys (`progressionDefs`, `progressionStages`, `progressionDefVersions`, `progressionStageVersions`, `progressionInstances`, `progressionExceptions`, `proposalDispositions`). Its job deletes them. Until then, the `...recordOf(this.ctx).counts(hid)` spread at :1204 gives identical values.
2. **modules.json / requirements (BOB's):** progressions no longer imports `legacy-checks` at all. Its `uses` edge to `legacy-checks` can go. The requirement's Private Uses line ("`legacy-checks`: the rows of R1, R14 and R21 until they move here") is stale and should name `record-grammar`'s `SHARED_ACT_CHECKS` for `NO_BASIS` and `NO_CITATION`. R28's "stay where the other acts reach them" still reads true.
3. **Generated artifact staled:** `bio-plane/dist/bio-plane.bundled.mjs` (input `src/progressions/*`), for the layer close's regeneration.

**Tests and checks:**
- `node --test bio-plane/test/m/progressions/`: tests 47, pass 46, fail 0, todo 1 (R32). At the start: 45 tests, 44 pass.
- Modules that read the figures or use progressions, on this branch and on its base (my changes stashed): record-core 90/0, control-plane stats 1/0, intent 50/1, queue-producers 14/32, connections 96/0, basis-versions 109/0, provenance audit-figures 7/0, instance-setup 80/4, `test/stats-disclosure` 1/0, run-productions 36/0. These are identical with and without my change, so the failures are the base's and none is added.
- `format`: 87 modules, 0 failures. `architecture progressions`: 10 product files, 0 failures. `coverage progressions`: 36 of 36 live ids. `ownership progressions tranche/T19`: legacy-store 0/0, legacy-checks 0/0, 0 failures.

Size (session_01XeKXwUVQ7NTKCEh2MZSm9w): test runs 4, module lines 1660
