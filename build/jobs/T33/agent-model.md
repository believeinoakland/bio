# agent-model (T33)

**Status** · session_01SuuRCrY43CWCyUZPXPCtAs · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings, each my best; I am building on them now and stop only if you answer otherwise.

1. **`MODEL_FOR_MODE` before M-Q9 (Suggestions "Open for BOB" (3)).** A frozen table over every mode the harness holds (`check`, `investigate`, `extract`, `plan`, `ask`), each `claude-opus-5` (today's default), with an exported `MODEL_FOR_MODE_SOURCE` stating the values are provisional until M-Q9 measures the cheapest model passing K1504's bar. A mode the table does not hold answers `refused` type `MODE_UNKNOWN` and makes no call (R1: no request body chooses the model, so `converse` takes no model argument).

2. **The runner's wire (R2, R7; coded to agent-runner R1–R4 as an injected dep, K1563 (1)).** `runner` is the Container Durable Object namespace binding (`get(newUniqueId())`; a stub with `fetch` is accepted too). One WebSocket per conversation, opened by `fetch("https://agent-runner/conversation", {Upgrade: websocket})`; first message the conversation request `{credential: {kind: "subscription", secret}, model, system, prompt, tools, max_turns}`, `prompt` the transcript rendered as text (the SDK runs with no persistence, so the parent's transcript is re-sent each row); each `{tool_use}` relay is answered `{tool_result}` on the same socket; the final tool closes the socket (which aborts the query, runner R4). The meter counts the conversation request and each `tool_result` sent as one turn and its serialized length as bytes. Runner `{ok:false, code:"MAX_TURNS"}` is `exhausted`; any other `{ok:false, code, detail}` is `refused` with `status: null`, `type: code`. An upgrade answered with no socket is `refused` with its HTTP status. The path name `/conversation` is mine: AGENT-RUNNER should serve it (please route if it chose otherwise).

3. **Uses.** Nothing here needs `runtime-limits` (Open (4)); my COMPLETE will state `uses: []` (K1505 (7)). Paths `agent-model/` (code `agent-model/src/`), tests `agent-model/test/`, beside `agent-worker/`.

## Completion

**Entries applied.** T33-55 whole, a new module under `agent-model/` (576 lines of code in `src/`). Created by copy of `agent-worker/src/model.mjs` (commit `7d93754fc2`, Q0-1 seam (iii)), then extended (Q0-2):
- `src/model.mjs`: `MODEL_FOR_MODE` (frozen; `check`, `investigate`, `extract`, `plan`, `ask`, each `claude-opus-5`, `MODEL_FOR_MODE_SOURCE` marking them provisional until M-Q9; R1); `modelCall(reference, request, {runner})` and `converse({reference, runner, mode, meter, system, messages, tools, finalTool, onTool, maxTurns})`, dispatching on the reference's `kind` after the refusals made before any call (`ACCOUNT_REFERENCE_UNUSABLE`, `RUNNER_NOT_CONFIGURED`, `MODE_UNKNOWN`; R2); `segmentMeter`, the D-611 byte and turn bounds, unchanged; the prompt-shaping helpers (`parentSystem`, `rowPrompt`, `rowFacts`, `judgeTools`, `planJudgeTools`, `subsessionSystem`, `subsessionTools`, `LOAD_LAYER`) copied as they are (Suggestions: Q0-1 places `model.mjs` whole).
- `src/apikey.mjs`: the Messages API turn (the key in `x-api-key` only), `withCache` marking the system prompt's last block (the pack's resident layer is inside it), the last tool and the transcript's last message (three of the API's four breakpoints; R4); 429 a plain refusal, never retried (R3).
- `src/subscription.mjs`: the runner's wire as K1600 settled it (WebSocket at `https://agent-runner/conversation` through the Container DO binding, `get(newUniqueId())`, a stub with `fetch` accepted too); the relay (R7): only `tools`' names are offered, a relayed call is performed by `onTool` and its result sent back on the same socket, a name not offered is answered as an error and performed by no one; the transcript kept in the Messages API's shape and rendered as `prompt` for each fresh conversation; the meter counts the conversation request and each `tool_result` sent.
- `src/outcome.mjs`: the outcome and `usage` shapes both paths share (R3, R5), `sumUsage` keeping `null` (R6), and `scrub`, which removes the secret from any provider or runtime text that echoes it (R8).
- Improvements beyond the copy: every `converse` ending past its first request carries the summed `usage` (also `stopped`, `silent`, `refused`, `exhausted`), so ai-runs can record what a stopped segment spent; a conversation the member closes before the runner's end (an answer then a bound, a halt) reports its `usage` as `null`, never as a partial sum.

**Readings applied.** J1, all three accepted by B2 (K1600).

**Paths for `modules.json`.** `paths: ["agent-model/"]`, `tests: ["agent-model/test/"]`, `uses: []` (final: every import is the module's own; `runtime-limits` is not needed, Suggestions Open (4)). No `package.json`: the suite runs with `node --test agent-model/test/`.

**Deferred.** (1) `modelCall`'s subscription arm is one turn: it answers the first call the runner relays as a `tool_use` block and closes the connection, so a turn's second parallel call is not returned (`converse`, the path the shell uses, relays every call). (2) Each subscription conversation asks the binding for a new Durable Object id (`newUniqueId`), a fresh container per conversation as runner R9 asks; its start cost is M-Q2's to measure (T33-D1).

**Found in other modules (REPORT).**
- `agent-worker` (T33-57, the re-point): this module's interface differs from the copy it imports today. `converse` takes `reference` (one member's `{kind, key|token}`), `runner` (the Container DO binding, for a subscription) and `mode`, in place of `token` and `model`; `modelCall(reference, request, {runner})` takes a Messages API body, not a serialized string; `DEFAULT_MODEL` is gone (the model is `MODEL_FOR_MODE[mode]`, so `env.MODEL` no longer chooses one, R1); `converse`'s endings carry `usage`. Its mode `ask` needs a `MODEL_FOR_MODE` entry, which exists.
- No generated artifact is stale: `agent-worker`'s bundle reads its own `src/model.mjs`, which this job did not change.

**Tests and checks.**
- `node --test agent-model/test/`: tests 10, pass 10, fail 0 (R1–R10, one test each, each checking the whole requirement on both paths). Negative controls: the tools' cache mark removed, R4 fails; the secret scrub removed, R8 fails; restored, 10/10. Re-run after merging `tranche/T33` (K1600): 10/10.
- `node checks/format.mjs <bio>`: 126 modules, 125 requirements files; 0 failures.
- With `paths`/`tests`/`uses` set in a scratch copy of `modules.json` (empty until BOB's merge): `architecture.mjs`: 5 product files, 6 relative imports; 0 failures. `coverage.mjs`: 10 of 10 live ids named by a test; 0 failures. `ownership.mjs … tranche/T33`: 6 files; 0 failures. With the registered empty paths, coverage and ownership fail only for that reason.

Size (session_01SuuRCrY43CWCyUZPXPCtAs): test runs 5, module lines 576
