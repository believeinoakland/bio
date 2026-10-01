# bundler (T22)

**Status** · session_014EDtgA8oD3Eyhq1jai3Z7j · depth 2 · RUNNING until 2026-10-02T00:07:55Z (node --test bio-plane/test/m/ (baseline, then after)) · handled B1

## Completion

**Entries applied** (B1, `build/plan/current.md` T22 layer 1, bundler):
- **(1) D5.** `bio-plane/test/system/deploybindings.test.mjs` imports `stripJsonc` from `../../scripts/jsonc.mjs` (R11, the module's one reader). **Deleted `bio-plane/test/jsonc.mjs`** (no other importer): BOB drops it from bundler's `tests` at the merge; until then `checks/format.mjs` reports exactly that one path.
- **(2) N469 re-scan** of my paths and the new suites. Re-worded: `fleetbundles.test.mjs`'s header marks arm 5(b), 5(c) and M0-152's two arms RETIRED with `tools/` and `scripts/coverage.mjs` in T20 (the driver already said so; the suite's header still read them as live); `fleetbundles.control.mjs`'s baseline label read "eighteen arms", now sixteen as its head says; `fleet-bundle.mjs`'s header named the gate as the only reader of the verification (bundles.mjs R21 and release-assemble.mjs R22 read it too) and argued "not in `tools/`" as live; `resolve-version.mjs` called fleet-bundle.mjs "FLEET's … never edited" (both are bundler's); `bundles.mjs` named `bundles.test.mjs` (retired) as live. Provenance notes ("taken from", RE-PINNED … legacy-tests …, "the old battery (`battery.mjs`, deleted in T20)", dated control runs) stay. `kickoffs/WORKER.md`, `DIST-NEXT.md`, `BATON.md` still exist (archived old process) and are named as history, so they stay.

**Improvements in my module:**
- `deploybindings.test.mjs`: its two assertions over `deploy.mjs`'s SOURCE TEXT (the upload metadata carrying `deriveLimits`; success refused on a read-back MISMATCH) are retired. R18's command-level tests in `test/m/bundler/release.test.mjs` assert the same at the interface (metadata `limits` equals `deriveLimits(cfg)`; MISMATCH exits 1 with `[LIMITS_MISMATCH]` and no rollout wait; UNDETERMINED never stated verified). Suite 41 → 39 assertions, by those two exactly.
- `release-assemble.mjs` `NO_ARTIFACT`'s remedy named `npm run build` in one member (the class N31 fixed in the guard); it now names `node bio-plane/scripts/bundles.mjs`. No requirement states the remedy text.

**Deferred:** none. **Not changed, reported:** `deploybindings.test.mjs`'s D-54 live arms read `bio-plane/wrangler.jsonc`'s comment text and `src/subresources.mjs`'s `SUBRESOURCE_CAP` source (another module's) — repository-data ratchets, not bundler's interface and stated by no requirement of mine; left as they are for BOB to place (J1).

**Generated artifacts:** none staled. No changed script is a bundle input (no committed manifest records any `scripts/` path); nothing regenerated.

**Other modules (REPORT J1):** capture `doorbell.test.mjs`:272 R56 is flaky. It asserts that `!f1.includes("198")` over a 16-hex keyed digest with a random key, which fails about 0.34% of runs (14/4096). It failed once in my after-run of `test/m` and passed 5 of 5 alone; nothing of bundler's is on that path.

**Tests and checks:**
- `node --test bio-plane/test/m/bundler/`: tests 45, pass 45, fail 0 (before and after)
- `node --test bio-plane/test/system/deploybindings.test.mjs bio-plane/test/system/fleetbundles.test.mjs` from the root: tests 2, pass 2; `deploybindings: 39 passed, 0 failed`; `fleetbundles: 98 pass, 0 fail`, no SKIP (pdf-worker, ocr-worker installed; agent-worker has no dependencies)
- `resolveversion.test.mjs`: 11 pass, 0 fail; `bundle.test.mjs`: livefire 19/19, verdict pass, exit 0
- `node test/fleetbundles.control.mjs baseline`: BASELINE 98 pass, 0 fail, exit 0
- `node --test bio-plane/test/m/`: baseline (tranche at 5b6422d6fc) tests 4815, pass 4793, fail 2 (membership R79, R83, accepted); after (1c868bb918) tests 4815, pass 4792, fail 3: the same two plus capture R56's chance collision above (5/5 green alone). No new red from this change.
- `node checks/format.mjs`: 85 modules, 84 requirements files; 1 failure: `bundler: tests entry bio-plane/test/jsonc.mjs names no file` (the deletion; BOB drops it at the merge)
- `node checks/architecture.mjs … bundler`: 19 product files, 45 relative imports (8 naming no tracked file, not judged); 0 failures
- `node checks/coverage.mjs … bundler`: 23 of 23 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … bundler tranche/T22`: 9 files changed; 0 failures

Size (session_014EDtgA8oD3Eyhq1jai3Z7j): test runs 9, module lines 5570
