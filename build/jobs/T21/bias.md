# bias (T21)

**Status** · session_01KciRDbs7ix9Xrdx5bdg4Yp · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1, `build/plan/current.md` T21 layer 5)
- **N458** "record" for "bundle" in text members read: `checks.mjs` C-26.1's two messages ("a bias record carries its statements …", "ids are stable and unique within a record"); `index.mjs` `op=biasadopt`'s missing-id detail ("names the bias record being adopted: pass bundleId=<BIAS-...>", the argument kept), `biasInhale`'s C-26.8 detail and its `proposes` sentence. Re-scanned every string in my paths: interface names kept (N71: `bundle_id`, `bundleId=`, `bundle.md` in C-26.1's repair, `bundle_sha`, the rank's `kind: "bundle"`, SQL). No test pinned the old words, so none re-keyed.
- **N469** notes naming a file T20 deleted as live: `checks.mjs`:86 (the suite pinning R31) now names R31's test in `test/m/bias/checks.test.mjs`; :103 (`test/bias.test.mjs`) names R6's test there, which holds the same over-strictness sentence; :470 (`check-refusal-codes.mjs` as a live floor) re-worded to provenance of SK-1's rule; `schema.mjs`:34 (`hygiene.test.mjs`) names R30's test in `test/m/bias/adopt-manifest.test.mjs`, which proves both purge arms. :202 (`repair-reachability.test.mjs`) is provenance ("found by"): kept, made past tense and marked deleted. :445 ("the UI harness went red") is provenance of an event: kept.
- **Own-module flaws fixed** (step 4): notes naming the retired legacy store as live, re-pointed to what holds today: `index.mjs` header and `biasOps`' note (the plane's op map, `src/plane/store.mjs`, spreads the ops in); `checks.mjs`:111 (C-26.8 fires in `biasInhale`, not "the store"); `schema.mjs` header (the plane's boot creates the tables through `migrate()`, R45, not the deleted `schema.mjs` splice).

**Deferred** None. R26 stays `test.todo` (deferred by K102, unchanged).

**Found in other modules / generated artifacts staled** (REPORT J2): a change under `bio-plane/src/` stales the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`, BOB regenerates). The old strings also appear in `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs` and `newgroup/dist/newgroup.bundled.mjs` (embedded release copies; not regenerated, per B1).

**Tests and checks**
- `node --test test/m/bias/` (in `bio-plane/`): tests 56, pass 55, fail 0, todo 1 (R26).
- No layer tests are named in `build/manifest.md`. No service I provide changed.
- `node checks/format.mjs`: 86 modules, 84 requirements files; 0 failures.
- `node checks/architecture.mjs … bias`: 11 product files, 38 relative imports; 0 failures.
- `node checks/coverage.mjs … bias`: 46 of 46 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … bias tranche/T21`: 4 files changed by bias; 0 failures.

Size (session_01KciRDbs7ix9Xrdx5bdg4Yp): test runs 1, module lines 1814
