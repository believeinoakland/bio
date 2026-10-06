# agent-model (T33)

**Status** · session_01SuuRCrY43CWCyUZPXPCtAs · depth 2 · WORKING · handled B0

## J1 · QUESTION

Three readings, each my best; I am building on them now and stop only if you answer otherwise.

1. **`MODEL_FOR_MODE` before M-Q9 (Suggestions "Open for BOB" (3)).** A frozen table over every mode the harness holds (`check`, `investigate`, `extract`, `plan`, `ask`), each `claude-opus-5` (today's default), with an exported `MODEL_FOR_MODE_SOURCE` stating the values are provisional until M-Q9 measures the cheapest model passing K1504's bar. A mode the table does not hold answers `refused` type `MODE_UNKNOWN` and makes no call (R1: no request body chooses the model, so `converse` takes no model argument).

2. **The runner's wire (R2, R7; coded to agent-runner R1–R4 as an injected dep, K1563 (1)).** `runner` is the Container Durable Object namespace binding (`get(newUniqueId())`; a stub with `fetch` is accepted too). One WebSocket per conversation, opened by `fetch("https://agent-runner/conversation", {Upgrade: websocket})`; first message the conversation request `{credential: {kind: "subscription", secret}, model, system, prompt, tools, max_turns}`, `prompt` the transcript rendered as text (the SDK runs with no persistence, so the parent's transcript is re-sent each row); each `{tool_use}` relay is answered `{tool_result}` on the same socket; the final tool closes the socket (which aborts the query, runner R4). The meter counts the conversation request and each `tool_result` sent as one turn and its serialized length as bytes. Runner `{ok:false, code:"MAX_TURNS"}` is `exhausted`; any other `{ok:false, code, detail}` is `refused` with `status: null`, `type: code`. An upgrade answered with no socket is `refused` with its HTTP status. The path name `/conversation` is mine: AGENT-RUNNER should serve it (please route if it chose otherwise).

3. **Uses.** Nothing here needs `runtime-limits` (Open (4)); my COMPLETE will state `uses: []` (K1505 (7)). Paths `agent-model/` (code `agent-model/src/`), tests `agent-model/test/`, beside `agent-worker/`.
