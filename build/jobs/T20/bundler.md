# bundler (T20)

**Status** · session_01Bn7W4BUTLpR4VJ7vgYfCWR · depth 2 · WORKING · handled B1

## Completion (BUNDLER #3, 2026-10-01)

**Entries applied** (B1; `build/plan/current.md` T20 layer 1, bundler, K846):
- `planeMember` (`bio-plane/scripts/fleet-bundle.mjs`): `entry` and `bundle.entry` are `src/plane/index.mjs` (plane R6), one constant beside it. Re-checked at T19's close first (`main` @ c1a27e41a5): `bio-plane/src/plane/index.mjs` exists and `bio-plane/wrangler.jsonc`'s `main` names it; `bio-plane/src/index.mjs` is the one-line re-export, now read by nothing in the bundle. `release-assemble.mjs`, `resolve-version.mjs`, `bundles.mjs` and `build-plane.mjs` read `planeMember` and follow it unchanged.
- Fixtures: `test/m/bundler/repo.mjs` writes the plane's entry at `src/plane/index.mjs` (importing `../tag.mjs`) and its config's `main` names it; `release.test.mjs`' R16 test writes its entry there and leaves a decoy `src/index.mjs` re-export beside it. The members' `src/index.mjs` stay.
- New R16 assertions: the built manifest's `recipe.entry` is `src/plane/index.mjs`, it lists that file as an input and not `src/index.mjs`; and on the real repository, `planeMember()`'s entry exists and equals `wrangler.jsonc`'s `main`.
- **Proof:** `npm run build` in `bio-plane/` wrote a bundle (6,698,637 B, sha256 0ea680b7…) whose manifest's `recipe.entry` is `src/plane/index.mjs`, with 291 first-party inputs, `src/plane/index.mjs` among them and `src/index.mjs` not. I restored the generated files afterwards (`git checkout -- dist src/signpage.mjs`): they are regenerated at the L1 close (§14), not by this job.

**Flaws fixed in my own module** (comment text only): `fleet-bundle.mjs` named its gate at `bio-plane/test/fleetbundles.test.mjs` (header, the discovery note, and the manifest's `_comment`); it is `bio-plane/test/system/fleetbundles.test.mjs`. `bundles.mjs` named its negative control in `bio-plane/test/bundles.test.mjs`, which does not exist; R21's tests in `test/m/bundler/release.test.mjs` drive it. `derive-bindings.mjs` named `test/deploybindings.test.mjs`; R13–R15's tests are in `test/m/bundler/release.test.mjs`.

**Deferred:** none.

**Generated artifacts this job stales** (reported in J1): the plane bundle and its manifest, `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`recipe.entry`, and the input set loses `src/index.mjs`), so `test/system/fleetbundles.test.mjs`' bio-plane arms read stale until the close regenerates them. The `_comment` text change moves every member manifest's bytes at its next regeneration (`pdf-worker`, `ocr-worker`, `agent-worker`); no guard reads `_comment`, so none of them reads stale before then.

**Found in other modules:** plane's T20 job (L11) may now delete `bio-plane/src/index.mjs` once this branch merges. Requirements wording (bundler's own, BOB's to word): the paragraph after R19's heading about an UNDETERMINED limits read-back (K761) describes `deploy.mjs` (R18), which reads limits back; `deploy-fleet.mjs` deploys through wrangler and reads no limits.

**Tests and checks** (on HEAD of `job/T20/bundler`):
- `node --test bio-plane/test/m/bundler/`: tests 45, pass 45, fail 0. No layer tests (`build/manifest.md`).
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … bundler`: 14 product files, 32 relative imports; 0 failures.
- `node checks/coverage.mjs … bundler`: 23 of 23 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … bundler tranche/T20`: 6 files changed; 0 failures.

Size (session_01Bn7W4BUTLpR4VJ7vgYfCWR): test runs 1, module lines 2445
