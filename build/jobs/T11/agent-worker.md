# agent-worker (T11)

**Status** · session_01YCWGKaZA5crqGysYYhfm9j · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

R49 (N293), my best reading; I am building it now and stop only if you rule otherwise.

1. **Where the ceiling comes from.** `agent-worker/src/index.mjs` reads `AI_RUN_STATE_MAX_BYTES` from ai-runs' `bio-plane/src/airun.mjs` (already a bundle input through skills' `skillpack.mjs`, so no new graph) by a namespace import, so the member loads before ai-runs exports it. Until ai-runs' R45 lands the name is undefined, the plane measures nothing, and the member publishes the state as it does today; R49's tests that need the export are `test.todo` naming ai-runs R45 until then, and the pure rule is tested against the Provides figure (262,144) now. No copy of the figure lives in agent-worker.
2. **What a tick publishes when the table's state would exceed the ceiling** (UTF-8 bytes of its JSON, measured as ai-runs R45 measures). R49 says only that it stays within. My reading: the tick publishes the smallest state that still resumes truthfully: the same pass, restarted from `plan` (`next-pass` and `close` keep their own step, which need no working fields), every working field null. A later segment then re-does that pass's fan-out rather than resuming from a state the record would refuse; writes already made stay made and `dedup` keeps them from being written twice. The trace entry for that step says so in its note; no new answer key (R28's list is exact).
3. **A tick refused `AI_RUN_STATE_TOO_LARGE` anyway** (the plane's figure changed under a stale bundle): recorded in `refusals` as `{at: "airuntick", code, check, plane}`, the segment carries on, and it is never read as the plane failing (no `PLANE_SILENT`, no `ended`). That is what the driver already does for any refused tick; I add R49's test.

## J2 · COMPLETE

**Entries applied.** N293 (my share): R49. Built as B2 (K355) ruled on J1.
- `harness.mjs`: `stateBytes` (UTF-8 length of the JSON, ai-runs R45's measure) and `publishableState(state, limit)`. A state within the ceiling is published whole. One over it is published as its pass restarted at `plan` (`next-pass` and `close` keep their step), every working field null. `STATE_RESTART_STEPS` names the two.
- `index.mjs`: each tick after the gate publishes `publishableState(after, AI_RUN_STATE_MAX_BYTES)`, with the ceiling imported by name from ai-runs' `bio-plane/src/airun.mjs` (no copy). A restart is stated in that step's trace note, and R28's answer keys are unchanged. A tick refused `AI_RUN_STATE_TOO_LARGE` is recorded in `refusals` as `{at: "airuntick", code, check, plane}`, and the segment carries on.
- Tranche merged after B3. R49's through-the-op test, which waited on ai-runs R45, is now a real test; no `test.todo` is left.

**Deferred.** None.

**Not yet met marks.** R49's `(not yet met: N293)` now holds; it is BOB's to strike in `build/requirements/agent-worker.md`, which is outside my paths.

**Reported, other modules and artifacts.**
- Generated artifact: `agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json` are stale (my `src/index.mjs` and `src/harness.mjs`, plus ai-runs' `airun.mjs`, which the bundle also takes in). Not rebuilt, per B1. Until BOB regenerates it at layer close, R45's two tests in `requirements.test.mjs` fail on exactly that staleness, as will the plane's `fleetbundles.test.mjs`.
- Negative controls, whole run on this branch: cascade, fanout, versions and wire-vocabulary are all as declared. `agent-worker.control` is 15 of 19 as declared, and `harness.control` is 22 of 26. The eight findings (V1, V2, V4, V5; F1, G2, G3, G5) are all arms whose outcome turns on plane files: ai-runs' `airun.mjs` (G2's patch no longer matches its text) and the plane suites and fleet battery, which now meet the stale bundle. No finding is in an arm touching R49's code. I am re-running those eight arms on `tranche/T11` (without my commits) and on 484adcd662 (before ai-runs) to confirm the attribution. If either baseline shows an arm going the other way, I send a REPORT; otherwise nothing more is posted.

**Tests and checks run.**
- Suites (after the merge): agent-worker 139/0, cascade 29/0, fanout 185/0, harness 260/0, versions 22/0, wire-vocabulary 83/0, requirements 253 passed / 2 failed (both R45, the stale bundle above). Baseline before my change: all 963 green (requirements 245/0).
- R49 is 10 checks: 5 pure, 3 through the op against a mock that refuses as ai-runs R45 does, and 2 on a refused tick.
- Checks: format 0 failures (69 modules); architecture 0 failures (29 files, 71 imports); coverage 49 of 49 live ids named; ownership 0 failures (4 files).

Size (session_01YCWGKaZA5crqGysYYhfm9j): test runs 30, module lines 3303
