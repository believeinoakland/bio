# agent-model (T35)

**Status** · session_01492fK8cL8nD6NiXB6XUnvs · depth 2 · COMPLETE · handled B2

## Completion (AGENT-MODEL #3)

**Entries applied.** T35-48 (F5; K1881, K1941): R12. Record text reaches the model only inside tool results:
- `openRow(messages, step, row, facts)` appends the row's prompt, then a `read_facts` call and its result holding `rowFacts`. `rowPrompt(step, row)` now carries only the step and the row; a third argument is ignored.
- `subsessionOpening(contract)` builds a sub-session's opening transcript the same way. Its `read_facts` result holds the contract's record fields (`run`, `context`, `mode`, `skill`, `standard_pair`, `standard`). `subsessionSystem` keeps only the pack and the contract's own fields (`level`, `scope`, `returns`).
- `READ_FACTS` is declared in `judgeTools`, `planJudgeTools` and `subsessionTools`. If the model calls it again, `converse` answers it from the transcript's opening, on both paths.
- `onTool` may answer `{search_results: [{source, title, content}]}`. These are sent as `search_result` blocks with citations on. A plain answer stays one string, the API's form of one `text` block.
- On the subscription path the rendered `prompt` withholds every tool result's words and names each result by its id. The model reads a held result with `read_result` (offered while the transcript holds one) or its facts with `read_facts`. Both are answered over the relay (agent-runner R3), and `modelCall`'s one turn allows one runner turn per held result.

**Deferred.** None.

**Found in another module (REPORTed to BOB).**
- `agent-worker` (T35-50, its R61). This needs to be re-pointed in its own job.
  - `src/index.mjs`:489 pushes `rowPrompt(step, row, rowFacts(...))` as a user turn. Since this merge the facts are dropped from that prompt, so a model-run row sees none until it calls `openRow(model.messages, state.step, row, rowFacts(state, LEVELS))` instead.
  - `:1275` opens a sub-session with a bare user string. It should use `subsessionOpening(contract)`.
  - Two of its tests pin what R12 forbids: `requirements.test.mjs`:1252, "briefed with its own spawn contract, exactly as published", which reads the whole contract from the system prompt; and `:1254`, "its tools are … `report`, nothing else", which now also finds `read_facts`.
- Generated artifact: `agent-worker/dist/agent-worker.bundled.mjs` is stale because it bundles agent-model's source (agent-worker R45 ×2 red). It is for BOB's regeneration at L6's close (§14).

**Tests and checks run.**
- `node --test agent-model/test/`: tests 13, pass 13, fail 0.
- `agent-worker/test/` (the only user of `agent-model`): `ask.test.mjs` 0 FAIL. `requirements.test.mjs`: 4 FAIL, the two R12 pins above and R45 ×2 (stale bundle). Before this change it was 0 fail.
- `checks/format.mjs`: 130 modules, 129 requirements files; 0 failures.
- `checks/architecture.mjs` agent-model: 5 product files, 6 relative imports; 0 failures.
- `checks/coverage.mjs` agent-model: 12 of 12 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs` agent-model tranche/T35: 5 files changed; 0 failures.

Size (session_01492fK8cL8nD6NiXB6XUnvs): test runs 9, module lines 764

**B2 CHANGE (K1983), applied.** `MODEL_FOR_MODE.draft` added (`claude-opus-5`, today's default, provisional until M-Q9 as `MODEL_FOR_MODE_SOURCE` states), named by the R1 test. For agent-worker's openings: `openRow(messages, step, row, facts)`, `subsessionOpening(contract)` and the tool `READ_FACTS` (also `READ_RESULT`) are exported from `agent-model/src/model.mjs`; `READ_FACTS` is already in `judgeTools`, `planJudgeTools` and `subsessionTools`. Re-run: `node --test agent-model/test/` 13 pass, 0 fail; agent-worker `ask.test.mjs` 0 FAIL; format, architecture (5 files), coverage (12 of 12), ownership (5 files): 0 failures each.

Size (session_01492fK8cL8nD6NiXB6XUnvs): test runs 11, module lines 766

## J1 · REPORT

agent-worker (T35-50, R61) needs re-pointing for agent-model R12. (1) index.mjs:489: rowPrompt(step,row) no longer carries facts; use openRow(model.messages, state.step, row, rowFacts(state, LEVELS)). (2) :1275: open sub-sessions with subsessionOpening(contract). (3) requirements.test.mjs:1252 (contract read whole from the system prompt) and :1254 (tools now include read_facts) pin what R12 forbids. (4) agent-worker's committed bundle is stale from agent-model's source (R45 x2); BOB's at L6's close (§14). Details in my record.

## J2 · COMPLETE

T35-48 applied: R12 met, 13/13 agent-model tests pass, format/architecture/coverage/ownership 0 failures. Nothing deferred. Record: build/jobs/T35/agent-model.md.

## J3 · COMPLETE

B2 applied: MODEL_FOR_MODE.draft added (provisional, today's default), named by the R1 test; 13/13 pass, checks 0 failures. Exported for agent-worker: openRow, subsessionOpening, READ_FACTS (in judgeTools/planJudgeTools/subsessionTools), READ_RESULT from agent-model/src/model.mjs. Record updated.
