# ai-runs (T20)

**Status** · session_01KBFUpcYZcLfhNibsYY5TgB · depth 2 · COMPLETE · handled B0

## Completion

**Entry applied** (B1; K881; plan T20 layer 6): `test/m/ai-runs/hidden-notices.test.mjs`' R43 test no longer names `legacy-store`. The third listener is now `tasks`, which comes after `scheduler` in `MODULE_ORDER`. The test still registers the listeners out of order (`tasks`, `scheduler`, `monitoring`) and proves they are heard in the order `monitoring` < `scheduler` < `tasks`, so it means the same thing as before. **Re-scan** of `test/m/ai-runs/` for other retired ids (`legacy-store`, `legacy-checks`, `legacy-index`): four more places used `legacy-store` as a placeholder registrant. None of them failed, because no registration checks the module's name against `MODULE_ORDER`. Each now names a real module:
- `world.mjs`: promotion's facts are registered by the modules that register them in the plane (`producingGroup` by `instance-setup`, `citedBy` by `connections`, `caseMember` by `publication`).
- `producers.test.mjs`: the refused second registrations use `queue` (retrieval's hidden-run tail) and `run-productions` (contradiction's run gate).
- `scheduler.test.mjs`: the refused second wait source uses `agent-worker`.
- `hidden-notices.test.mjs` (R42, K333): a comment now says it is this module's own counts that read `ai_run_bounds` through the column form (R38).

The `legacy` mentions left in `converts.test.mjs` are not module ids: one is a path under the live module `legacy-tests`, the others describe data stored the old way. Tests only: no product code changed and no generated artifact moved. No suite was deleted (K619).

**Deferred:** none. **Found in another module:** none.

**Tests:** `node --test test/m/ai-runs/` (from `bio-plane/`): tests 56, pass 56, fail 0, skipped 0. `build/manifest.md` names no layer tests. No service changed, so no other module's tests apply.

**Checks** (from `civicos-process`):
- `format`: 84 modules, 82 requirements files; 0 failures
- `architecture`: 15 product files, 57 relative imports; 0 failures
- `coverage`: 38 of 38 live requirement ids named by a test; 0 failures
- `ownership` (against `tranche/T20`): 5 files changed by ai-runs; 0 failures

Size (session_01KBFUpcYZcLfhNibsYY5TgB): test runs 3, module lines 0 (tests: +12 −10)
