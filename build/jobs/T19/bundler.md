# bundler (T19)

**Status** · session_01F828m2QDyyWgtT23v7Rivx · depth 2 · WORKING · handled B3

## J1 · QUESTION

Where the three `tools/` commands live (B1: "decide where the files live under your own paths").

Problem: my `paths` in `build/modules.json` name the files only at `tools/release-assemble.mjs`, `tools/deploy-fleet.mjs`, `tools/bundles.mjs`, `tools/jsonc.mjs`. `bio-plane/scripts/` as a directory is legacy-index's, so a new file `bio-plane/scripts/release-assemble.mjs` is a legacy-index addition and fails ownership (§12.2: added legacy lines must be an import from my paths). I cannot move them out of `tools/` without a `modules.json` change, which is yours.

Best reading (I proceed on it now): move them beside the scripts, as the Suggestions say: `bio-plane/scripts/release-assemble.mjs`, `bio-plane/scripts/deploy-fleet.mjs`, `bio-plane/scripts/bundles.mjs`; delete `tools/jsonc.mjs` and keep one JSONC implementation at `bio-plane/scripts/jsonc.mjs` (R11). Please (1) replace my four `tools/` paths with those three `bio-plane/scripts/` paths in `modules.json`, and (2) re-word R19, R21, R22's usage lines (`node tools/deploy-fleet.mjs …` → `node bio-plane/scripts/deploy-fleet.mjs …` from the repository root, likewise `bundles.mjs`, `release-assemble.mjs`). Until you answer, the ownership check will list those three new files as failures; I'll note that in my record.

Also N31: with `bundles.mjs` surviving (R21) at its new path, my best reading is that `fleet-bundle.mjs`' remedy text names `node bio-plane/scripts/bundles.mjs` (it rebuilds every bundle the change staled, from the repository root), and the manifest's Generated-artifacts section may add it as the all-members recipe. If you instead mean the per-member `npm run build` in the manifest's table, say so and I'll word the remedies that way.

## J2 · QUESTION

R18, the limits read-back when it is UNDETERMINED (the account's settings are unreadable or state no `limits.subrequests`).

R18 says the deploy "reports success only when the script read back … hashes to the asset's SHA-256 … and R15's read-back is `MATCH` (`[LIMITS_MISMATCH]` exits 1)". Today's code, after the bytes verify: `MATCH` prints `verified: limits.subrequests N read back` and exits 0; `MISMATCH` refuses `[LIMITS_MISMATCH]`, exit 1; `UNDETERMINED` prints `limits: UNDETERMINED — … The ceiling sent (N) is NOT confirmed; establish it before stating it.`, never the word verified, then waits on the rollout and exits 0.

My best reading (I test it so now): R18 states today's behaviour, so "reports success" means the `verified:` lines, and UNDETERMINED exits 0 saying the limit is not confirmed (the bytes are deployed, so a non-zero exit would claim nothing was applied, which is false). If you mean UNDETERMINED should exit non-zero, say so and I'll make it exit 1 with a stated code (my proposal: `[LIMITS_UNDETERMINED]`), and the requirement would name it.
