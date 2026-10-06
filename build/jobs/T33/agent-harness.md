# agent-harness (T33)

**Status** · session_01W6zutnM3TH8jmQ47V6r9ga · depth 2 · WORKING · handled B2

## J1 · QUESTION

Best readings, carrying on with them unless you answer otherwise:

1. **Directories.** Code `agent-harness/src/` (`harness.mjs`, `subsession.mjs`), tests `agent-harness/test/`, beside `agent-worker/`. `paths` `agent-harness/src/`, `tests` `agent-harness/test/`.
2. **Final `uses`: none.** Neither file imports anything outside the two (checked on `tranche/T33`), and my tests import only the module and `node:` builtins. The declared `runtime-limits` edge is dropped (requirements Suggestions leave it to you).
3. **Tests.** agent-worker's suites (`harness.*`, `fanout.*`, `versions.*`, `plan.test.mjs`, `requirements.test.mjs`) drive the Worker (`src/index.mjs`, miniflare, the plane), and agent-worker comes after agent-harness, so they can't move here (P4). I write a new pure suite at this module's interface that names R1–R8; agent-worker's suites stay where they are until T33-57 re-points or deletes them.
4. **R2 and R6, the shell's clauses.** "after only the run and log reads … its log entry and close are still written" (R2) and "calls no `airunspawn`, `capturerequest` or `suggest`, makes no fetch" (R6) describe what the Worker shell does. Here I test the table's part of each: `gate-mode` first; it closes `mode-not-deployed` at the first step from every state, a spent budget included; the `why` texts; `PLAN_FLOW` has no `fanout` row and no edge to one, and is pure under R8's throwing `fetch` stub. The shell's half stays tested in agent-worker (its R14, R50).
5. **R3's default of 3.** Today it lives in agent-worker's `index.mjs` (`DEFAULT_MAX_PASSES`), so the copied `stopBecause` alone never closes a state with no `maxPasses`. To meet R3 at this interface, I add `DEFAULT_MAX_PASSES = 3` and `passLimit(maxPasses)` to the copied `harness.mjs`, and `stopBecause` reads the limit through it. The shell always passes a positive limit, so a run behaves the same; T33-57 can drop its own constant for the export.
6. **R39, R44, R52 (K1505 (13), K1521).** Your START doesn't name them, and `agent-harness.md` doesn't hold them. The files are copied whole, so their code (`applyJudgement`'s refusal, the pinned copies, `applyPlanJudgement`/`PLAN_JUDGEABLE`/`planDedup`) is here, but the requirements and their tests stay agent-worker's. If you move them, I'll add the ids and the tests (R44's pins would add `run-rules` and the plane's vocabulary modules to `uses`).
