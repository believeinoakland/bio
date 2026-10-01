# bias (T20)

**Status** · session_019fYYaznWEvSJmjoUKHDhz9 · depth 2 · WORKING · handled B0

## Completion

**Entry applied** (B1, K881): `test/m/bias/promotion.test.mjs`' R23 order test no longer registers a listener as the retired `legacy-store`: it registers `tasks` (layer 11, between `scheduler` and `queue` in membership's `MODULE_ORDER`) and expects `["ai-runs", "scheduler", "tasks", "queue"]`, the same proof of R23's order. Re-scan of `test/m/bias/` for retired ids (`legacy-checks`, `legacy-store`, `legacy-index`) found two more, both re-pointed to real modules with the same meaning: `adopt-manifest.test.mjs`' R23 op test registers its arming listener as `queue` (an unregistered module there; the test asserts only that the op awaits the notice); `world.mjs` registers promotion's three facts under the modules that provide them in the product (`producingGroup` instance-setup, `citedBy` connections, `caseMember` publication). Tests only; no product code changed; no requirement changed. No old suite deleted (K619).

**Deferred:** none. **Found in other modules:** none. **Generated artifacts:** none moved.

**Tests and checks**
- `node --test test/m/bias/` (in `bio-plane/`): tests 56, pass 55, fail 0, todo 1 (R26, deferred by K102).
- No layer tests are named in `build/manifest.md`.
- `checks/format.mjs`: format: 84 modules, 82 requirements files; 0 failures
- `checks/architecture.mjs bias`: architecture: 11 product files, 38 relative imports (0 naming no tracked file, not judged); 0 failures
- `checks/coverage.mjs bias`: coverage: 1 modules, 46 of 46 live requirement ids named by a test; 0 failures
- `checks/ownership.mjs bias tranche/T20`: see below, run after the commit.

Size (session_019fYYaznWEvSJmjoUKHDhz9): test runs 2, module lines 6
