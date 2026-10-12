# agent-harness (T46)

**Status** · session_01PB3YZExYaDASn4QJXKFYwe · depth 2 · WAITING ON BOB (J1) · handled B0

## J1 · QUESTION

Q1 (R10's test needs an edge `modules.json` does not have). R10: "A copy that disagrees with run-rules R14 fails this module's test." The only way a test of this module can see run-rules' answer at its interface is to import `DEPLOYED_MODES` and `RUN_MODES` from `bio-plane/src/run-rules/index.mjs`; agent-harness's `uses` is `[]`, so `checks/architecture.mjs` fails that import (it judges test files too). Reading run-rules' source as text would be a source-text test, which JOB.md forbids.

My best reading, on which I am carrying on: you add `run-rules` (earlier in L6's order) to agent-harness's `uses` in `build/modules.json` on `tranche/T46`, and the R10 test imports run-rules' `DEPLOYED_MODES` and `RUN_MODES` and asserts: the harness's `MODES` keys are exactly `RUN_MODES`; for each, `MODES[m].deployed` equals `DEPLOYED_MODES.includes(m)`; and `check` and `plan` are deployed, `investigate` and `extract` not. (This also settles the Suggestions' open `runtime-limits` edge only if you choose; I do not touch it.)

Consequence: R10's test is red on my branch until run-rules' T46-13 (which sets `plan` in `DEPLOYED_MODES`) is merged into `tranche/T46`. I make the harness change now and will post COMPLETE after you announce run-rules' merge (CHANGE) and I have merged the tranche and seen R10 green. Say if you want it otherwise.

## Progress (not a message)

- Read whole: `build/requirements/agent-harness.md`; L6's row of `build/layers.md`; `agent-harness/src/harness.mjs`, `src/subsession.mjs`, `test/agent-harness.test.mjs`; my plan entry T46-63 and T46-13/T46-19 for the act it shares; run-rules R14 and agent-worker R53 for the agreement. Uses: none declared.
- Done (uncompleted): `MODES.plan` deployed with its comment; header R1–R10; stale old-agent-worker ids in comments corrected (gate R14→R2, pass count R15→R3, PLAN_FLOW R50→R6). Tests: R2's deployed-list and gate-wording cases follow; R6's toggle of `MODES.plan` removed (no longer needed); R10 two tests new.
- Red, by design until run-rules' T46-13 merges: the R10 agreement test (plan deployed here, not yet in `DEPLOYED_MODES`). Architecture fails on the run-rules import until Q1 is answered.
- Next: on BOB's answer to J1 and the CHANGE for run-rules' merge, merge `tranche/T46`, re-run steps 5–7.
