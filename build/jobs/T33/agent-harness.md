# agent-harness (T33)

**Status** · session_01W6zutnM3TH8jmQ47V6r9ga · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Best readings, carrying on with them unless you answer otherwise:

1. **Directories.** Code `agent-harness/src/` (`harness.mjs`, `subsession.mjs`), tests `agent-harness/test/`, beside `agent-worker/`. `paths` `agent-harness/src/`, `tests` `agent-harness/test/`.
2. **Final `uses`: none.** Neither file imports anything outside the two (checked on `tranche/T33`), and my tests import only the module and `node:` builtins. The declared `runtime-limits` edge is dropped (requirements Suggestions leave it to you).
3. **Tests.** agent-worker's suites (`harness.*`, `fanout.*`, `versions.*`, `plan.test.mjs`, `requirements.test.mjs`) drive the Worker (`src/index.mjs`, miniflare, the plane), and agent-worker comes after agent-harness, so they can't move here (P4). I write a new pure suite at this module's interface that names R1–R8; agent-worker's suites stay where they are until T33-57 re-points or deletes them.
4. **R2 and R6, the shell's clauses.** "after only the run and log reads … its log entry and close are still written" (R2) and "calls no `airunspawn`, `capturerequest` or `suggest`, makes no fetch" (R6) describe what the Worker shell does. Here I test the table's part of each: `gate-mode` first; it closes `mode-not-deployed` at the first step from every state, a spent budget included; the `why` texts; `PLAN_FLOW` has no `fanout` row and no edge to one, and is pure under R8's throwing `fetch` stub. The shell's half stays tested in agent-worker (its R14, R50).
5. **R3's default of 3.** Today it lives in agent-worker's `index.mjs` (`DEFAULT_MAX_PASSES`), so the copied `stopBecause` alone never closes a state with no `maxPasses`. To meet R3 at this interface, I add `DEFAULT_MAX_PASSES = 3` and `passLimit(maxPasses)` to the copied `harness.mjs`, and `stopBecause` reads the limit through it. The shell always passes a positive limit, so a run behaves the same; T33-57 can drop its own constant for the export.
6. **R39, R44, R52 (K1505 (13), K1521).** Your START doesn't name them, and `agent-harness.md` doesn't hold them. The files are copied whole, so their code (`applyJudgement`'s refusal, the pinned copies, `applyPlanJudgement`/`PLAN_JUDGEABLE`/`planDedup`) is here, but the requirements and their tests stay agent-worker's. If you move them, I'll add the ids and the tests (R44's pins would add `run-rules` and the plane's vocabulary modules to `uses`).

## Completion

**Entries applied.** T33-54 whole: a new module, `agent-harness`, made by copying `agent-worker/src/harness.mjs` and `subsession.mjs` to `agent-harness/src/` with no change of meaning. Each copy gains a header line naming its origin. One addition, per J1 (5) as answered by B2 (K1600): `DEFAULT_MAX_PASSES = 3` and `passLimit(maxPasses)` are exported, and `stopBecause` (and its `why`) reads the pass limit through `passLimit`. So R3's "else 3" holds at this module's interface. agent-worker's shell always passes a positive figure, so a run behaves the same. agent-worker's own copies are untouched until T33-57.

**Readings applied (all answered, B2, K1600).** These are J1's six points. Paths are `agent-harness/src/` and tests `agent-harness/test/`. `uses` is none. The new pure suite names R1–R8, and agent-worker's Worker-driven suites stay there. For R2 and R6, only the table's part is tested here. R39, R44 and R52 stay agent-worker's.

**Paths for `modules.json`.** `paths: ["agent-harness/src/"]`, `tests: ["agent-harness/test/"]`, `uses: []`. This is final: the two files import only each other, and the suite imports only them and `node:` builtins. The registered `runtime-limits` edge is dropped.

**Deferred.** Nothing in this module. The shell's halves of R2 (only the run and log reads before the close, the log entry and close written) and R6 (no `airunspawn`, `capturerequest`, `suggest` or fetch), and R4's HTTP `400 JUDGEMENT_OVERREACH`, are agent-worker's behaviour. They stay tested by agent-worker's suites (its R14, R16, R50) until T33-57.

**Found in other modules (REPORT).**
- `run-rules`: `GATE_ADDRESS.file` and `DEPLOYMENT_SEQUENCE.enforced_by_row` name `agent-worker/src/harness.mjs` (`deployment.mjs:11`, and `rules.mjs` comments). `skills`' `test/m/skills/doctrine.test.mjs:160,165` pins those strings. When T33-57 deletes agent-worker's copy, the gate's address becomes `agent-harness/src/harness.mjs`. That is a run-rules edit, with skills' pin beside it. Until then `MODES` exists twice, and a deployment edit (e.g. R53's `plan`) must be made in both files.
- `agent-worker` (T33-57): its `index.mjs` `DEFAULT_MAX_PASSES` can be replaced by this module's `passLimit` export.
- Generated artifacts: none staled. The agent-worker bundle does not read `agent-harness/` until T33-57 re-points `index.mjs`, and at that point the bundle's inputs (manifest table, `fleetbundles.test.mjs`'s input count) gain these two files.

**Tests and checks.**
- `node --test agent-harness/test/`: tests 30, pass 30, fail 0. This holds on the job's commit and again after merging `tranche/T33`. Negative controls, each restored: with `stopBecause` back to `Number(s.maxPasses)`, two R3 tests fail; with a `Date.now()` call in `canonical`, the R8 purity test fails; with the citation-count bound removed, an R5 test fails.
- `node checks/format.mjs <bio>`: 126 modules, 125 requirements files; 0 failures.
- With `paths`, `tests` and `uses` set in a scratch copy of `modules.json` (empty until BOB's merge):
  - `architecture.mjs`: 3 product files, 3 relative imports; 0 failures.
  - `coverage.mjs`: 8 of 8 live ids named by a test; 0 failures.
  - `ownership.mjs … tranche/T33`: 4 files; 0 failures.
- With the registered empty paths, coverage sees 0 of 8 (accepted red 1, until the merge).

Size (session_01W6zutnM3TH8jmQ47V6r9ga): test runs 9, module lines 1857

## J2 · COMPLETE

T33-54 applied: new module agent-harness, copied from agent-worker's harness.mjs and subsession.mjs (1,857 lines), plus passLimit/DEFAULT_MAX_PASSES for R3 (J1, K1600). 30 tests pass (three negative controls run); format, architecture, coverage (8/8) and ownership 0 failures, the last three with my paths set in a scratch modules.json. For modules.json: paths ["agent-harness/src/"], tests ["agent-harness/test/"], uses []. REPORT in the record: run-rules' GATE_ADDRESS/DEPLOYMENT_SEQUENCE (and skills' doctrine pin) name agent-worker/src/harness.mjs, so they move to agent-harness at T33-57, and until then MODES exists in two files; T33-57 can use passLimit. The record's Completion section has the rest.
