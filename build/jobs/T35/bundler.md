# bundler (T35)

**Status** · session_01PSRv1PEnzVenMM8dS21qae · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Best readings, carrying on with them; answer only to change one.
1. R27 "packages not marked dev": I list every non-dev lockfile entry, including the optional platform variants (the Agent SDK's darwin/arm64/musl packages) that `npm ci` skips on linux/amd64. The rule is the requirement's own; over-listing is conservative for R29. (Alternative: filter by the lock's os/cpu/libc against `image.platform`.)
2. R28 (c) declaration `bio-plane/scripts/third-party.json` also declares `@cloudflare/containers` 0.3.7 for agent-runner: a devDependency inlined into agent-runner's committed Worker bundle (K1799), which (a) misses; it is "code copied from a package and committed". `ocr-worker`'s `assets/eng.traineddata` (a model, no package ecosystem) is not listed.
3. R28 (a): a member with no lockfile and no declared dependencies is no source (not `unread`); one declaring dependencies with no lockfile is `unread`. A container member the release leaves out (R25, K1730) ships nothing and adds nothing.
4. R28 Cargo.lock: crates with no `source` (the root crate, and any local path crate) are left out; the rest are `crates.io`.

## J2 · QUESTION

Adds to J1 (J1 stands). R29 names a new command, `bio-plane/scripts/release-advisories.mjs`, and R28's declaration (its Suggestion) is `bio-plane/scripts/third-party.json`; neither is in bundler's `paths` in `build/modules.json`, so the ownership check will refuse them. Please add both to bundler's `paths` on `tranche/T35` (modules.json is yours); I am writing them now and will merge the tranche when you say it is done.

## Completion

**Entries applied (T35-6).**
- N696: `test/system/deploybindings.test.mjs`'s two real-config arms gain `SHEET_WORKER`/`sheet-worker` (five service bindings; four pre-flight targets). 37 passed, 0 failed: red 4 cleared.
- F20, R27: `fleet-bundle.mjs` gains `npmProductionPackages` and `containerPackages`; `containerDescriptor` takes `{packages}`, written as the part's last field, R25's fields unchanged (newgroup's reader returns the same `d`, tested). `release-assemble.mjs` adds the list to each container member's `container.json` part, so the fleet signature covers it, and refuses `[CONTAINER_PACKAGES_UNREAD]` naming the file or the package before any build or write.
- F21, R28: `release-advisories.mjs` exports `thirdPartyInventory(root?)` over (a) the plane's and every carried member's production lockfile, (b) each container member's R27 list, (c) the declaration `bio-plane/scripts/third-party.json` (tesseract-wasm 0.11.0 for ocr-worker; `@cloudflare/containers` 0.3.7 for agent-runner; `sheet-worker/engine/Cargo.lock`; `court-citations/pins.json`). Readings J1 1–4 as K1917 (3) confirmed. Real repository: 199 entries (npm 111, crates.io 86, PyPI 2), nothing unread.
- F21, R29: `node bio-plane/scripts/release-advisories.mjs [--out F]` asks OSV (`querybatch`, further pages through `/v1/query`, details through `/v1/vulns/<id>`), prints each entry and its advisories, names those with one, the database and the time; exits 0 when all were checked, 1 naming each unchecked entry or unread source; refuses nothing. Run live once from this session (2026-10-07T12:48Z): 199 checked, no known advisory, exit 0.
- DEC-149 sweep: bundler has no rows (plan rule 4).

**Deferred.** None.

**Found in other modules.** None new. `fleetbundles.test.mjs` is red on agent-worker's bundle only: `bio-plane/src/tokens.mjs` (runtime-limits, merged T35-4) changed after the committed `agent-worker` bundle was built: the generated-artifact red BOB regenerates at L1's close (red 15's class, §14); this job wrote no generated artifact.

**Tests and checks.**
- `node --test bio-plane/test/m/bundler/`: tests 70, pass 70, fail 0 (thirdparty.test.mjs 11 new; release.test.mjs 34).
- `deploybindings.test.mjs`: 37 passed, 0 failed. `resolveversion.test.mjs`: 12 pass, 0 fail. `bundle.test.mjs`: exit 0. `fleetbundles.control.mjs`: exit 0, every restore verified. `fleetbundles.test.mjs`: 1 failure, agent-worker stale (above); agent-runner's byte arm SKIPs (its `node_modules` not installed here).
- `format.mjs`: 1 failure, test-support's `make-zip.mjs` path (red 13). `architecture.mjs bundler`: 0 failures. `coverage.mjs bundler`: 29 of 29 live ids named, 0 failures. `ownership.mjs bundler tranche/T35`: 10 files, 0 failures.

Size (session_01PSRv1PEnzVenMM8dS21qae): test runs 9, module lines 2973
