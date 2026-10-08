# bundler (T38)

**Status** · session_01UyPgDNZCNdqccnSPgPyQtP · depth 2 · WORKING · handled B0

## Completion

**Read whole** (mechanics §17, N739): `build/requirements/bundler.md`; the public parts of `signatures` and `test-support`; `build/layers.md`'s layer-1 contract and helper-module section; the plan's entry T38-1, its rules at the opening and K2218; every file of the module's `paths` and `tests`. BOB's START measured the set at 226 KB, under the 300 KB limit.

**Entry applied (T38-1; N787, K2218).** `system/fleetbundles.test.mjs`:232 re-pinned from the committed manifest it reads (`agent-worker/dist/agent-worker.bundle.json`, rebuilt by T37-17; its staleness arm green): 22 → 23 inputs, one arriving and none leaving, the member's own `src/signin.mjs` (R66/R67's sign-in relay, imported by its `index.mjs`), with a dated comment naming what arrived. The assertion passes; T37's red 20 (the plan's rule 6 item 5) clears with this merge.

**Improvement in my own module.** `m/bundler/bundler.test.mjs`'s R24 test on the real fleet still pinned agent-runner's image at `ghcr.io/believeinoakland/agent-runner`; the marker moved to `docker.io/civicos/agent-runner` at T37's close (K2258, K2259), so the module's tests were 90/1 on this tree before my change. Re-pointed with a dated comment, as `fleetbundles.test.mjs` was for file-scanner (K2176): 91/0. Nothing weakened: the same assertion, the marker's current value.

**Deferred:** none.

**Found in another module** (in a REPORT): `file-scanner/package.json`'s `version` and `file-scanner/wrangler.jsonc`'s `vars.VERSION` declare `0.79.0` while the authority `bio-plane/package.json` declares `0.81.0` (bundler R12). `system/resolveversion.test.mjs` ARM 7 (the live fleet agrees on one version) is red, 11 pass / 1 fail, and `release-assemble.mjs` and `deploy.mjs` would refuse `[VERSION_SKEW]` on this tree. Both files are file-scanner's (its T38-17 job is in L1); the edit is `0.79.0` → `0.81.0` at both sites. Not in the plan's rule 6 list.

**Tests and checks** (from the repository root, then from the process repository):
- `node --test bio-plane/test/m/bundler/` → 91 pass, 0 fail (90 / 1 before the R24 re-point).
- `node bio-plane/test/system/fleetbundles.test.mjs` → 129 pass, 0 fail, no SKIP (after `npm ci` in `agent-runner/` and `file-scanner/`; 117 / 0 with two SKIPs before).
- `deploybindings.test.mjs` → 37 passed, 0 failed; `bundle.test.mjs` → exit 0 (livefire 19/19); `resolveversion.test.mjs` → 11 pass, 1 fail (ARM 7, file-scanner's version, above); `node bio-plane/scripts/bundles.mjs --check` → every guarded bundle fresh.
- `format`: 0 failures; `architecture … bundler`: 0 failures; `coverage … bundler`: 30 of 30 live ids named, 0 failures; `ownership … bundler tranche/T38`: 0 failures (re-run after the commit).

Size (session_01UyPgDNZCNdqccnSPgPyQtP): test runs 8, module lines 8081
