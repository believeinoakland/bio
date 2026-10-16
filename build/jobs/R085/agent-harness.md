# agent-harness (R085)

**Status** · session_015S5X9Fu4rHLX6djxYMEojD · depth 2 · WAITING ON BOB (J1) · handled B0

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
