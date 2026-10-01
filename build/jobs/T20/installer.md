# installer (T20)

**Status** · session_01JjqFAqJmRa9wbiPMbEa9Rk · depth 2 · WORKING · handled B1

## Completion

**Entry applied** (`build/plan/current.md` T20, layer 11, installer: N443's share, K762):
- `newgroup/scripts/embed-release.mjs`:100: the unsigned-version refusal now tells the operator to cut and sign with `node bio-plane/scripts/release-assemble.mjs --sign` (K754).
- `newgroup/src/index.mjs`:303 and `newgroup/test/wizard.test.mjs`:1314: the 10143 refusal is cited from `bio-plane/scripts/deploy-fleet.mjs`, which still records it (its lines 20–21).
- `src/release.mjs` left alone, as directed. No other `tools/` mention remains in the module's paths.

**Fixed in my own module, beyond the entry:**
- `newgroup/DEPLOY.md`, "Rebuilding after a bio-plane change", said `npm run build` re-bundles bio-plane. It has not since 2026-09-18 (the embed copies the signed asset and refuses anything else). It now says to cut and sign the release first, then what the embed checks.
- R26's test now asserts the refusal names `node bio-plane/scripts/release-assemble.mjs --sign` and that the file exists. Negative control: with the old `embed-release.mjs` restored, R26 fails (0 pass, 1 fail); restored and verified with `cmp`.

**Deferred:** nothing. R13, R24, R32 and R33 stay not yet met, as before (K102; no T20 entry).

**Generated artifact:** `newgroup/dist/newgroup.bundled.mjs` is **not** stale. The `index.mjs` change is a comment, which esbuild drops, and `embed-release.mjs` is not bundled. `bio-plane/test/system/newgroup-bundle-fresh.test.mjs`: 4 passed, 0 failed, including (C), the whole bundle byte-identical to a fresh build. Nothing for the L11 close to regenerate on my account.

**Found in another module:** nothing.

**Tests and checks:**
- `npm test` in `newgroup/`: `embed: 23 passed, 0 failed`; the embed rewrote `src/release.mjs` byte-identically (signed 0.79.0, no diff); `wizard: 207 passed, 0 failed`; `requirements.test.mjs`: tests 33, pass 29, fail 0, todo 4 (R13, R24, R32, R33).
- Layer tests: none named in `build/manifest.md`. No service I provide changed.
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … installer`: 16 product files, 30 relative imports; 0 failures.
- `node checks/coverage.mjs … installer`: 33 of 33 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … installer tranche/T20`: 6 files changed; 0 failures.

Size (session_01JjqFAqJmRa9wbiPMbEa9Rk): test runs 5, module lines 16
