# bundler (T23)

**Status** · session_01NUc9jtCVoKc7BZNT8zXv6u · depth 2 · COMPLETE · handled B2

## Work

**Entry applied: N482 (K1020, K1113).** `bio-plane/test/system/deploybindings.test.mjs`, "D-54's live arms": the two source-text assertions retired (the reason comment before `"limits"` in `wrangler.jsonc`, and `SUBRESOURCE_CAP = 400` read from `subresources.mjs`' source), with a dated RETIRED note in the form of T22's, naming subresources R35 and plane R13 as where the properties are now stated (plane R13's test lands in L11, K1113). The behavioural arm (the real config's ceiling derived by `deriveLimits` as 10000) stays. The header's D-54 negative-control record (A) now says the reason arm retired; the T22 note's "D-54 arm (B) below" corrected to "the header's D-54 arm (B)" (the header is above). No requirement of mine changes; no product code changed; no bundle input touched (the test file is no member's input), so no generated artifact is stale.

**Read whole:** `roles/JOB.md`; bundler's requirements; subresources R35 and plane R13; the layer 1 contract; the plan's bundler and fold 2 entries; `deploybindings.test.mjs`, and the code it drives, `scripts/derive-bindings.mjs` and `scripts/jsonc.mjs`. The module's other scripts and tests were not changed by this entry and were not re-read.

**Deferred:** none. **Found in other modules:** none.

## Proof

- `node --test bio-plane/test/system/deploybindings.test.mjs bio-plane/test/system/fleetbundles.test.mjs`: tests 2, pass 2, fail 0, skipped 0 (deploybindings: 37 passed, 0 failed; fleetbundles: no SKIP).
- `node --test bio-plane/test/m/bundler/`: tests 45, pass 45, fail 0.
- `node --test bio-plane/test/m/`: tests 5008, pass 4992, fail 4, todo 12. The four are accepted by name: control-plane R36 `inbox-door` (red 9), membership R83 `module-order.test.mjs`, R79 `t9-notice-sight-bounds.test.mjs`, promotion R39/R45/R46 `registry.test.mjs` (red 2).
- Checks: format `87 modules, 85 requirements files; 0 failures`; architecture `19 product files, 45 relative imports (8 naming no tracked file, not judged); 0 failures`; coverage `1 modules, 23 of 23 live requirement ids named by a test; 0 failures`; ownership `1 files changed by bundler between tranche/T23 and HEAD; 0 failures`.

**After B2 (subresources merged, K1116), `tranche/T23` merged (c0aa0ef99e), re-run:** proof tests 2, pass 2, fail 0, skipped 0 (deploybindings 37/0); `test/m/bundler/` 45/45; `test/m/subresources/` 36/36 (R35's interface test present); `test/m/` tests 5009, pass 4993, fail 4 (the same four, accepted by name), todo 12. Checks: format `87 modules, 86 requirements files; 0 failures`; architecture `0 failures`; coverage `23 of 23 live requirement ids named by a test; 0 failures`; ownership `2 files changed by bundler between tranche/T23 and HEAD; 0 failures`.

Size (session_01NUc9jtCVoKc7BZNT8zXv6u): test runs 10, module lines 13

## J1 · REPORT

N482 applied and pushed (456bf4498e): deploybindings' two D-54 source-text arms retired with a dated RETIRED note naming subresources R35 and plane R13; the deriveLimits arm stays. Proof green (deploybindings 37/0, fleetbundles no SKIP; bundler 45/45); test/m 4992 pass, 4 fail, all accepted by name (red 9 control-plane R36; red 2 membership R83/R79, promotion registry). All four checks 0 failures. No bundle input touched; no generated artifact stale. Waiting on your word that subresources has merged; then I merge tranche/T23, re-run, and post COMPLETE.
