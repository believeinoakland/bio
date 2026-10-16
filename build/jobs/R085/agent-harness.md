# agent-harness (R085)

**Status** · session_015S5X9Fu4rHLX6djxYMEojD · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R085-11 (agent-harness R11, `returns.conditions`) is blocked on one fact outside my module. I have made no change to src/ yet.

What I found:
- The plan says the condition kinds are "the vocabulary `checkCondition` admits", read "through run-rules, your declared use".
- The vocabulary itself is `CONDITION_KINDS` in `bio-plane/src/observation-log/vocabulary.mjs` (twenty-odd kinds, a frozen object in a fixed order). `checkCondition` is re-exported through run-rules, but `CONDITION_KINDS` is NOT. `checkCondition(condition, kinds)` only tests a word; it cannot list the kinds, so through run-rules alone I cannot build the enum `returns.conditions` needs.
- Importing observation-log directly from agent-harness is refused by checks/architecture.mjs: agent-harness's `uses` in build/modules.json is `run-rules` only.

Options:
A (recommended). run-rules re-exports `CONDITION_KINDS` beside `checkCondition` (one export line in bio-plane/src/run-rules/rules.mjs, the re-export block that already carries the other observation-log vocabulary). Then I import it through run-rules, as the plan says, and R11 is one copy. This is a change to run-rules, which is not my module, so it needs a job for run-rules or your go-ahead to make it in this round.
B. Add `observation-log` to agent-harness's `uses` in build/modules.json, and import from it directly. Quicker, but it changes a module boundary and departs from "through run-rules".

I need your choice. Once A is in place (or B is chosen), I will add `conditions` to the spawn contract's `returns` and the R11 tests, run the checks and COMPLETE.

## J2 · COMPLETE

R085-11 (agent-harness R11) applied. Commit 58a5248937 on job/R085/agent-harness, pushed; tranche/R085 merged in first (B2, K3491).

- `src/subsession.mjs`: imports CONDITION_KINDS from observation-log's vocabulary (the declared use, modules.json: observation-log, run-rules); the spawn contract's `returns` carries `conditions: Object.keys(CONDITION_KINDS)`, beside `summary_max`, in the vocabulary's fixed order.
- `test/agent-harness.test.mjs`: R7's exact `returns` expectation gains `conditions` (the contract changed, the test follows it); two new tests named R11: a contract's `returns.conditions` is non-empty, in vocabulary order, and each kind passes `checkCondition`; control: a kind outside the vocabulary is not offered and `checkCondition` refuses it (AI_RUN_CONDITION_UNKNOWN).

Deferred: none. Found in another module: none. R11 in build/requirements/agent-harness.md still reads "not yet met: R085"; that line is BOB's to clear.

Tests: `node --test agent-harness/test/` — 35 tests, 35 pass, 0 fail.
Checks:
- format: 170 modules, 169 requirements files; 0 failures
- architecture (agent-harness): 3 product files, 6 relative imports; 0 failures
- coverage (agent-harness): 1 modules, 11 of 11 live requirement ids named by a test; 0 failures
- ownership (agent-harness, tranche/R085): 1 files changed by agent-harness between tranche/R085 and HEAD; 0 failures

Size (session_015S5X9Fu4rHLX6djxYMEojD): test runs 1, module lines 1780
