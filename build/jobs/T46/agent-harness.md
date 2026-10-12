# agent-harness (T46)

**Status** · session_01PB3YZExYaDASn4QJXKFYwe · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Q1 (R10's test needs an edge `modules.json` does not have). R10: "A copy that disagrees with run-rules R14 fails this module's test." The only way a test of this module can see run-rules' answer at its interface is to import `DEPLOYED_MODES` and `RUN_MODES` from `bio-plane/src/run-rules/index.mjs`; agent-harness's `uses` is `[]`, so `checks/architecture.mjs` fails that import (it judges test files too). Reading run-rules' source as text would be a source-text test, which JOB.md forbids.

My best reading, on which I am carrying on: you add `run-rules` (earlier in L6's order) to agent-harness's `uses` in `build/modules.json` on `tranche/T46`, and the R10 test imports run-rules' `DEPLOYED_MODES` and `RUN_MODES` and asserts: the harness's `MODES` keys are exactly `RUN_MODES`; for each, `MODES[m].deployed` equals `DEPLOYED_MODES.includes(m)`; and `check` and `plan` are deployed, `investigate` and `extract` not. (This also settles the Suggestions' open `runtime-limits` edge only if you choose; I do not touch it.)

Consequence: R10's test is red on my branch until run-rules' T46-13 (which sets `plan` in `DEPLOYED_MODES`) is merged into `tranche/T46`. I make the harness change now and will post COMPLETE after you announce run-rules' merge (CHANGE) and I have merged the tranche and seen R10 green. Say if you want it otherwise.

## Completion

- **Read whole** (P20): `build/requirements/agent-harness.md`; L6's row and contract in `build/layers.md`; my code and tests whole (`agent-harness/src/harness.mjs`, `src/subsession.mjs`, `test/agent-harness.test.mjs`); plan entries T46-63 and, for the shared act, T46-13 and T46-19; run-rules R14 and agent-worker R53. My Uses (now `run-rules`, K2947): its `DEPLOYED_MODES` and `RUN_MODES`.
- **Applied T46-63 (R10):** `MODES.plan` deployed in `harness.mjs`, its comment and `does` updated (no "not yet deployed"); `check` stays deployed, `investigate` and `extract` unchanged. The gate's `why` now names `deployed now: check, plan`.
- **Flaws fixed in my module (P8):** comments citing the old `agent-worker` ids for what are now this module's requirements corrected (gate R14→R2; pass count R15→R3; `PLAN_FLOW` R50→R6); header R1–R9→R1–R10. The R6 test no longer flips `MODES.plan` in-process to walk a plan run.
- **Tests:** R2's cases follow the new deployed set; R10 two new tests: the deployed set exactly, and agreement with run-rules (`MODES` keys = `RUN_MODES`; each `deployed` equals `DEPLOYED_MODES.includes`; the gate answers each run mode as run-rules does). Control: before run-rules' merge this test failed naming `plan` as the disagreement (seen at 984c528953).
- **Deferred:** none.
- **Another module's generated artifact made stale (mechanics §14):** `agent-worker/dist/agent-worker.bundled.mjs` (and `.bundle.json`), built by `bundler` from agent-worker's sources including this module, still carries `MODES.plan` `deployed: false` with "not yet deployed". Not written by me; BOB regenerates at layer close.
- **Tests and checks run** (on `tranche/T46` merged after B3):
  - `node --test agent-harness/test/`: tests 33, pass 33, fail 0
  - `node --test bio-plane/test/m/run-rules/` (the module I use): tests 60, pass 60, fail 0
  - `node checks/format.mjs`: 159 modules, 152 requirements files; 0 failures
  - `node checks/architecture.mjs … agent-harness`: 3 product files, 4 relative imports; 0 failures
  - `node checks/coverage.mjs … agent-harness`: 10 of 10 live requirement ids named by a test; 0 failures
  - `node checks/ownership.mjs … agent-harness tranche/T46`: 3 files changed; 0 failures
- Size (session_01PB3YZExYaDASn4QJXKFYwe): test runs 5, module lines 1774
