# bundler (T19)

**Status** · session_01F828m2QDyyWgtT23v7Rivx · depth 2 · WORKING · handled B4

## J1 · QUESTION

Where the three `tools/` commands live (B1: "decide where the files live under your own paths").

Problem: my `paths` in `build/modules.json` name the files only at `tools/release-assemble.mjs`, `tools/deploy-fleet.mjs`, `tools/bundles.mjs`, `tools/jsonc.mjs`. `bio-plane/scripts/` as a directory is legacy-index's, so a new file `bio-plane/scripts/release-assemble.mjs` is a legacy-index addition and fails ownership (§12.2: added legacy lines must be an import from my paths). I cannot move them out of `tools/` without a `modules.json` change, which is yours.

Best reading (I proceed on it now): move them beside the scripts, as the Suggestions say: `bio-plane/scripts/release-assemble.mjs`, `bio-plane/scripts/deploy-fleet.mjs`, `bio-plane/scripts/bundles.mjs`; delete `tools/jsonc.mjs` and keep one JSONC implementation at `bio-plane/scripts/jsonc.mjs` (R11). Please (1) replace my four `tools/` paths with those three `bio-plane/scripts/` paths in `modules.json`, and (2) re-word R19, R21, R22's usage lines (`node tools/deploy-fleet.mjs …` → `node bio-plane/scripts/deploy-fleet.mjs …` from the repository root, likewise `bundles.mjs`, `release-assemble.mjs`). Until you answer, the ownership check will list those three new files as failures; I'll note that in my record.

Also N31: with `bundles.mjs` surviving (R21) at its new path, my best reading is that `fleet-bundle.mjs`' remedy text names `node bio-plane/scripts/bundles.mjs` (it rebuilds every bundle the change staled, from the repository root), and the manifest's Generated-artifacts section may add it as the all-members recipe. If you instead mean the per-member `npm run build` in the manifest's table, say so and I'll word the remedies that way.

## J2 · QUESTION

R18, the limits read-back when it is UNDETERMINED (the account's settings are unreadable or state no `limits.subrequests`).

R18 says the deploy "reports success only when the script read back … hashes to the asset's SHA-256 … and R15's read-back is `MATCH` (`[LIMITS_MISMATCH]` exits 1)". Today's code, after the bytes verify: `MATCH` prints `verified: limits.subrequests N read back` and exits 0; `MISMATCH` refuses `[LIMITS_MISMATCH]`, exit 1; `UNDETERMINED` prints `limits: UNDETERMINED — … The ceiling sent (N) is NOT confirmed; establish it before stating it.`, never the word verified, then waits on the rollout and exits 0.

My best reading (I test it so now): R18 states today's behaviour, so "reports success" means the `verified:` lines, and UNDETERMINED exits 0 saying the limit is not confirmed (the bytes are deployed, so a non-zero exit would claim nothing was applied, which is false). If you mean UNDETERMINED should exit non-zero, say so and I'll make it exit 1 with a stated code (my proposal: `[LIMITS_UNDETERMINED]`), and the requirement would name it.

## Completion (BUNDLER #2, 2026-10-01)

**Entries applied** (B1; `build/plan/current.md` layer 1, BOB-5, N31; K749, K754, K756, K761):
- The release tooling moved beside the scripts (K754): `tools/release-assemble.mjs`, `tools/deploy-fleet.mjs` and `tools/bundles.mjs` are now `bio-plane/scripts/` (git renames), `tools/jsonc.mjs` is deleted, and `bio-plane/scripts/jsonc.mjs` is the module's one JSONC reader (R11). Every importer I own is re-pointed: `release-assemble.mjs` imports `./fleet-bundle.mjs`, `./resolve-version.mjs`, `../src/sshsig.mjs` and signatures' `./sign-sshsig.mjs` (K756); `bundles.mjs` imports `./fleet-bundle.mjs`; `deploy-fleet.mjs`' repository root is two levels up. Usage lines and refusal texts name the new paths. `bio-plane/package.json` (legacy-index's) needed no change: `build-plane.mjs` and `deploy.mjs` did not move.
- `deploy.mjs`' release-baton gate is removed (`--thread`, `--force-without-baton`, the BATON.md fetch from `main`); its usage line is `node scripts/deploy.mjs <slug> <version> <asset>`.
- N31: every staleness remedy in `fleet-bundle.mjs` is one constant naming `node bio-plane/scripts/bundles.mjs` from the repository root (12 sites had their own copy of the old text).
- R11–R23 each named by tests at the interface: `bio-plane/test/m/bundler/release.test.mjs` (25 tests). R11–R15 are called as functions; R16–R23 run as the operator's commands against a throwaway fixture repository (`repo.mjs`: the module's scripts copied beside a tiny plane and fleet, esbuild linked from the plane's install), with `fetch` stubbed by a preload (`stubfetch.mjs`, a model of the Cloudflare API and workers.dev), a fake `wrangler`, and a throwaway release key checked by stock `ssh-keygen`. Never a real account.

**Flaws fixed in my own module:**
- `release-assemble.mjs`: when a member's fresh build failed with every vendored input present, `verifyFresh` returned `{checked:false, findings:null}` and the assembler crashed (`findings.length` of null) instead of refusing; it now refuses `[GUARD_CANNOT_RUN]` (R22). With no `signer` in `RELEASE.json` it crashed in `verifyWith`; that is now a refusal by the stock-verifier check (`[PLANE_SIG_DOES_NOT_COVER_ASSET]`, R23). Its verification temp directories are now removed; `release/` is created if absent; a duplicate copy of the plane asset was dropped.
- `deploy.mjs`: a pre-flight request that threw (network) crashed the script; it now refuses `[PREFLIGHT_UNREADABLE]` (R17). A read-back or upload request that threw also crashed; a read-back that cannot be read is now "not a match" and a failed upload is reported as that attempt, both falling through to the byte check (R18). It parses `wrangler.jsonc` with `parseJsonc` (R11), and its `pdf-worker` refusal points at `deploy-fleet.mjs`.
- `deploy-fleet.mjs`: on a failed deploy it exits with wrangler's own status instead of always 1 (R20); its NOT_A_FLEET_MEMBER text no longer calls the plane deploy "baton-gated".
- `bundles.mjs`: a stale comment named `tools/sign-release.html`; it is `src/sign-release.html`.

**Deferred:** none.

**Found in other modules** (sent as J3 REPORT): legacy-tests' `fleetbundles.test.mjs` arm (j) and `fleetbundles.control.mjs` assert the old remedy spelling in `fleet-bundle.mjs`' source text, so the two (j) checks now fail; the suite's other failures (ocr-worker stale, agent-worker inputs arm, four bio-plane freshness arms) are generated artifacts staled by other jobs, not by me. Stale `tools/` paths in text: installer (`newgroup/scripts/embed-release.mjs`:100, an operator instruction; comments at `newgroup/src/index.mjs`:303, `newgroup/test/wizard.test.mjs`:1314) and signatures (`bio-plane/src/sshsig.mjs`:229, a comment). No generated artifact is staled by this job: my scripts are inputs to no bundle.

**Tests and checks run** (on `job/T19/bundler` after merging `tranche/T19` at K761):
- `node --test bio-plane/test/m/bundler/`: tests 44, pass 44, fail 0 (19 before the job). Two mutations (the GUARD_CANNOT_RUN fix and the pre-flight refusal reverted) each turned a test red; both restored.
- Suites reading my scripts: `system/deploybindings`, `system/resolveversion`, `system/newgroup-bundle-fresh`, `system/bundle`: each pass 1, fail 0. `system/fleetbundles`: 88 pass, 8 fail, as reported above.
- `node checks/format.mjs`: 84 modules, 79 requirements files; 0 failures.
- `node checks/architecture.mjs … bundler`: 14 product files, 31 relative imports (7 naming no tracked file, not judged); 0 failures.
- `node checks/coverage.mjs … bundler`: 23 of 23 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … bundler tranche/T19`: 14 files changed; legacy-index: 0 line(s) added, 0 removed; 0 failures.

Size (session_01F828m2QDyyWgtT23v7Rivx): test runs 14, module lines 2440
