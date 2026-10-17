# Study: how the product talks to Claude, and where the ~80 s per conversation goes (BOB #192, read 2026-10-16)

Code read on `origin/tranche/R085` @ 46f79fef (the deployed cut). Plans read on `origin/tranche/T49`. Nothing in the product was changed; no real model call was made, no instance was written to, no credential was used. Every claim is marked **[doc]** documented (URL, read 2026-10-16), **[code]** read in the code (file:line), **[test]** confirmed by a named test, or **[inf]** inferred.

## 0. Answer in short

1. The assistant link is **Agent SDK `query()` in a Node process in a Cloudflare Container, which spawns the bundled Claude Code binary (2.1.289) as a child process, once per conversation**, on the member's `CLAUDE_CODE_OAUTH_TOKEN`. Not `claude -p` by hand, not a long-lived session. [code runner.mjs:191, :164-189; package.json `@anthropic-ai/claude-agent-sdk 0.3.289`]
2. **Nothing is polled.** Every hop is a push (HTTP 202 then alarm, WebSocket frames, subrequest). There is no sleep, timer, retry or backoff in `agent-worker`, `agent-harness` or `agent-model`. The waiting is the work itself. [code, grep below]
3. **The container's size is a prime suspect and is now measured, not guessed.** Deployed `lite` = 1/16 vCPU [diag-085-slow Measurement; doc Cloudflare limits page]. Starting Claude Code costs about **1.2 CPU-seconds**; run under a CPU quota of exactly 1/16 vCPU, a conversation with a model that answers instantly took **27 s** (19 s before the first message), versus 1.1 s with one full CPU. [test T1, T2]
4. A second hidden cost: **every conversation ends with one extra model turn after the answer tool**, because the runner lets the model finish. [code signin.mjs:304, :284; test T1 shows 3 API calls for 2 tool calls]
5. Messages are **not truncated or altered** in transport; the only cut is the 12-token passage snippet, which is a query default (diag-085-r6 D3), not transport. There is no end-to-end checksum; integrity rests on TCP/TLS, WebSocket framing and JSON parsing, and any failure ends the conversation loudly. [test T3]

## 1. What the documentation says (read 2026-10-16)

| # | Claim | Source | Mark |
|---|---|---|---|
| D1 | `claude -p` is the Agent SDK as a CLI; `--output-format stream-json`; the SDK "runs the Claude Code binary" as a library | https://code.claude.com/docs/en/headless ; https://code.claude.com/docs/en/agent-sdk/overview | doc |
| D2 | `--bare` is "to reduce startup time" (skips hooks, plugins, MCP, CLAUDE.md) but **does not read `CLAUDE_CODE_OAUTH_TOKEN` or subscription login**; bare needs an API key. So bare is not available on a member's sign-in | https://code.claude.com/docs/en/headless#start-faster-with-bare-mode ; https://code.claude.com/docs/en/authentication (Generate a long-lived token) | doc |
| D3 | Auth order: `CLAUDE_CODE_OAUTH_TOKEN` is item 5, after cloud/API-key sources; token from `claude setup-token`, one year, Pro/Max/Team/Enterprise, model requests only | https://code.claude.com/docs/en/authentication | doc (register AT-22) |
| D4 | `startup()` / `WarmQuery` pre-spawns the CLI and completes the initialize handshake "so the first `query()` call resolves without paying subprocess spawn and initialization cost inline"; one use per handle; `initializeTimeoutMs` default 60000 | https://code.claude.com/docs/en/agent-sdk/typescript | doc |
| D5 | Streaming-input mode is "a persistent, interactive session" ("long lived process"); single-message mode is one-shot | https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode | doc |
| D6 | `persistSession` default true (we set false); `effort` low..max; `maxTurns` = "tool-use round trips" | https://code.claude.com/docs/en/agent-sdk/typescript | doc |
| D7 | On a retryable API error Claude Code emits `system/api_retry` (attempt, retry_delay_ms, error) and retries itself | https://code.claude.com/docs/en/headless#handle-api-retries | doc |
| D8 | stdin pipe cap 10 MB (not our path: we use the SDK, not a pipe) | headless page | doc |
| D9 | With `--mcp-config` the first turn waits for MCP servers up to `MCP_TIMEOUT` (30 s default); a stdio server that never connects added ~30 s in one third-party test (3.6 s baseline). Ours is an in-process SDK server, which connected at once in T1 | https://code.claude.com/docs/en/headless ; https://dev.classmethod.jp/en/articles/20260917-cc-updates-v2-1-274/ | doc + test |
| D10 | `"type":"sdk"` MCP entries in config files are skipped from v2.1.274; only SDK host apps register in-process servers (we are the host) | classmethod article above (secondary) | doc (secondary); ours works in T1 |
| D11 | Third-party report: `time claude -p "hi"` shows ~1.9 s user+sys CPU even with MCP off | search result via claudeissues.com mirror (secondary, unverified) | doc (secondary); agrees with T1 (1.2 s) |
| D12 | Cloudflare instance types: lite 1/16 vCPU 256 MiB; basic 1/4, 1 GiB; standard-1 1/2, 4 GiB; standard-2 1, 6 GiB; standard-3 2; standard-4 4. The page does not name a default; wrangler's code does (`lite`, diag-085-slow) | https://developers.cloudflare.com/containers/platform-details/limits/ | doc |
| D13 | `Container` `sleepAfter` default 10 min (ours 2 m); cold start "often 1-3 seconds"; containers reached only through their Durable Object | https://developers.cloudflare.com/containers/platform-details/architecture/ | doc |
| D14 | Durable Object: WebSocket received-message cap 32 MiB; alarm wall time 15 min; CPU 30 s default per invocation, reset by each incoming HTTP request or WebSocket message; 6 simultaneous outgoing connections | https://developers.cloudflare.com/durable-objects/platform/limits/ | doc |
| D15 | Subscription limits: rolling 5-hour window plus weekly caps, shared across claude.ai and Claude Code; Anthropic publishes no exact figures; concurrent-session limits not found in any source read | third-party guides only (portkey.ai, morphllm.com, inventivehq.com via search); no official page fetched | doc (secondary), weak |
| D16 | Others on Cloudflare Containers: no report found of Claude Code on `lite`; Cloudflare's late-Sept 2026 rebuild claims faster container start (median 4.0 s to 0.65 s in one third-party benchmark); runtime instance sizing is in public beta | search (remio.ai, nxcode.io, infoq.com); not official | doc (secondary) |

**Terms register (`build/terms/anthropic.md`).** Pro/Max limits assume "ordinary, individual usage of Claude Code and the Agent SDK" (AT-4); the token is made in Anthropic's own flow (AT-22); Agent SDK and `claude -p` still draw on subscription limits (AT-23, U-6); the Agent SDK overview note that third parties may not "offer claude.ai login or rate limits for their products" unless approved is AT-19, bearing on U-2 and U-7. Whether four conversations at once, or unattended repeated runs, are "ordinary" is unresolved (U-5). **The register does not cover:** per-account concurrent-session limits, request-rate limits on a subscription token, or priority/speed. Nothing below claims any exist.

## 2. The protocol, hop by hop (R085)

### Hop A: plane (`ai-runs`) to `agent-worker`
- **Reactive.** `#aiRunDispatch` calls `AGENT_WORKER.fetch("https://agent-worker/run")` and waits at most `AI_RUN_DISPATCH_WAIT_MS = 10_000` for the 202 acceptance (`bio-plane/src/ai-runs/index.mjs:2195, :2236, :2111`). The segment then runs inside a Durable Object alarm: `setAlarm(Date.now())` (`agent-worker/src/index.mjs:2052`), `alarm()` runs the whole segment (`:2056-2068`). No recurring alarm, cron or poll. The plane's lease is `AI_RUN_LEASE_MS = 600000`, renewed on every tick (`ai-runs/index.mjs:366`); it reaps, never paces.
- **Waits:** segment wall bound `DEFAULT_SEGMENT_WALL_MS` 10 min (`index.mjs:2035`), checked between steps (`:552` loop). A bound hit re-dispatches via `tickAndContinue` (`ai-runs/index.mjs:1712`). Cost per break not recorded (diag-085-slow section 4).
- **Limits:** alarm 15 min wall [doc D14]; our 10 min is clear of it.

### Hop B: `agent-worker` loop to plane (reads, ticks)
- **Reactive subrequests**, `env.PLANE.fetch` per call (`index.mjs:335`); one `airuntick` after every table step (`:679`, comment `:643`). 96 plane subrequests in the observed run, small against 30 minutes.
- **No retry/backoff anywhere**: grep for `setTimeout|sleep|retry|backoff|AbortSignal|TIMEOUT|setInterval` over `agent-worker/src`, `agent-harness/src`, `agent-model/src` finds only comments and the alarm at `index.mjs:2052`. A plane failure ends the segment (`planeSilent`), the run stays resumable.
- **Serial by construction:** table rows one at a time (`index.mjs:552`), the four level sub-sessions in `for (const contract of contracts) { await converse(...) }` (`index.mjs:1508`).

### Hop C: `agent-model` to the member's runner (WebSocket)
- **Per conversation attempt, a new WebSocket** to `runner.get(runner.idFromName(member)).fetch("https://agent-runner/conversation", Upgrade: websocket)` (`agent-model/src/signin.mjs:181-195`; the instance is the member's own, one per member). Frames are pushed into a queue and awaited (`next()`, `:200-215`): reactive, no interval.
- **Framing:** request = one JSON text frame `{credential, model, effort, system, prompt, tools, max_turns}` where `prompt` is the whole transcript re-rendered as text, tool results replaced by "held; read it with read_result" (`signin.mjs:conversationRequest`, `renderTranscript`). Answers: `{tool_use}` relays, `{tool_result}` back, final `{ok,result,...}`. A frame that is not JSON becomes `{closed:true, detail:"the runner sent a message that is not JSON"}` (`:198-199`); a close or error becomes a closed message (`:200-201`). So a damaged conversation is never read as an answer.
- **Limits:** `CONVERSATION_MAX_TURNS = 12` requests per conversation (`agent-model/src/model.mjs:119`; `k` counts the conversation request and every tool_result sent, `signin.mjs:274, :331`); `maxTurns` handed to the SDK is `maxTurns - k` (`:275`). Meter `charge()` bounds turns and bytes per segment (`model.mjs:213`, 1 GB `DEFAULT_MAX_SEGMENT_BYTES`).
- **Extra turn:** when the model calls the final tool (`report`, `judge_*`), the worker stores the answer and replies "received" (`signin.mjs:304`), then keeps waiting for the runner's end frame (`:284`); the model therefore takes one more API turn to say it is done. [code]; [test T1: scripted 2 tool calls, the fake API saw 3 requests, `num_turns: 3`]
- **A model that ends without the final tool** is asked again "in a fresh conversation" (`:340`), a whole new CLI start.

### Hop D: inside the container (`agent-runner`)
- **Image/runtime:** Node 22 slim, `node src/entry.mjs`, SDK 0.3.289 (`Dockerfile`, `package.json`); `listen` first, SDK loads behind it (`entry.mjs:337-343`). One HTTP server; `GET /conversation` upgrade (`entry.mjs:311-333`).
- **Process per conversation:** `converse()` makes a fresh temp dir with `home tmp work claude` (`runner.mjs:153-157`), builds options with `persistSession:false`, `settingSources:[]`, `tools:[]`, `strictMcpConfig`, in-process MCP relay server, `permissionMode:'dontAsk'`, the token in the query's `env` only (`:164-189`), runs `for await (m of kit.query(...))` (`:191`) which spawns the Claude Code binary as a child, and removes the dir in `finally` (`:213`). No session, no warm process, no `startup()`.
- **Waits built in:** none in our code. `sleepAfter = '2m'` (`worker.mjs:65`) plus the sign-in hold (`waits.mjs`). Cold start only after 2 idle minutes; in the observed run none occurred (diag-085-slow Measurement). Inside the SDK, API retries (`api_retry`, `runner.mjs:192` reads them for auth only) are Claude Code's own and invisible to us.
- **Limits:** WebSocket message cap `MAX_MESSAGE` 16 MiB, over it closes 1009; non-masked or binary frames closed (`ws.mjs:396, :434-445`); sign-in POST bodies 16 KiB (`entry.mjs:253`, not conversations); `max_turns` 1..100 (`runner.mjs:11, :39`); result text not cut (`scrub(..., Infinity)` `:206`); error details cut to 300 characters (`env.mjs` `DETAIL_MAX`).
- **Output back:** `channel.send` writes one frame per tool_use and one final frame, `setNoDelay(true)` (`ws.mjs:409, :421`): pushed at once.

### Hop E: Claude Code to Anthropic and back
- Claude Code makes the HTTPS calls itself, through the container's egress interceptor (`worker.mjs:66-70`, `egressHandler` `:43-57`; logs `runner.egress` with `ms`, status, per call). Streaming SSE; one API call per model turn. [code; T1 shows one POST `/v1/messages` per turn and one `/api/hello` at start]
- Model/effort: parents Opus 5.5 at `medium`, sub-sessions Sonnet 5.5 at `low` (`model.mjs:54-72`).

### Back up
Result frame to worker (`signin.mjs:343+`), then worker tool/judgement application and tick (hop B), then next table row. Usage per conversation is recorded as `calls` = `num_turns` (`model.mjs`/`index.mjs` `spent`).

## 3. Tests

Scripts are in `build/plan/study-assistant-link-tests/` (`fakeapi.mjs`, `run1.mjs`, `frame.mjs`). Setup: copy `agent-runner/{package.json,package-lock.json,src}` to a scratch dir, `npm ci --omit=dev --ignore-scripts`, copy `agent-runner/test/{helpers.mjs,stubs}` for T3. The box has 4 CPUs; a CFS quota via `/sys/fs/cgroup/cpu/<g>/cpu.cfs_quota_us` (6250 per 100000 us = 1/16) stands in for the container size. All local; the "model" is a local fake of the Messages API (SSE) that scripts two tool calls (`meaningrows`, `report`) then "OK". No token, no real call.

| Test | What it ran | Result |
|---|---|---|
| **T1 real stack** | the runner's own `converse()` + real SDK 0.3.289 + the real bundled Claude Code 2.1.289 binary, `ANTHROPIC_BASE_URL` to the fake API, relay answered in 5 ms | Works end to end. 0.8 s total, first message (`system init`) at 0.51 s, 3 API requests (2 tool calls + 1 closing turn), `num_turns 3`; tools reached the model on turn 1 (D9, D10 not a problem here) |
| **T2 size** | same, zero model latency, CPU quota 1/16 (lite), 1/4 (basic), 1/2 (standard-1), 1 | wall to first message / whole conversation: **lite 19 s / 27 s** (two runs: 18.7/27.1, 19.2/28.0); basic 3.9/6.1; standard-1 1.9/2.7; 1 CPU 0.8/1.2 |
| **T2b with a model that takes 3 s per turn** | same, 3 turns | lite 35.2 s; 1 CPU 10.2 s. So lite adds about 25 s over the unthrottled run, about 20 s of it before the first request and about 1.7 s per later turn |
| **T2c CPU cost** | process CPU of the whole test minus loading the SDK in Node | about **1.2 CPU-s** per conversation (user 1.41 + sys 0.33 total, less 0.48 + 0.10 for SDK import). At 1/16 vCPU that is 19 s minimum, matching T2 |
| **T3 framing** | real WebSocket client (masking) to the runner's server with a stub SDK; hash of prompt and of a relayed tool result as received | 1 MB ASCII with 2 MB result: intact. 1 MB of 1-4 byte UTF-8 characters: intact. 10 MB: intact. 17 MB (over the runner's 16 MiB): connection closed 1009, no partial delivery |

What T2 supports and does not: it proves Claude Code's start-up is CPU-bound enough that a 1/16 vCPU budget makes it about 19 s. It does **not** prove Cloudflare enforces `lite` as a hard 1/16 quota; the earlier Cloudflare measurement shows per-minute CPU of up to 8.65 CPU-s against a 3.75 nominal cap and a total of about 43 CPU-s over about 27 conversations (1.6 CPU-s each), which agrees with T2c's per-conversation cost but not with a hard cap. Whether the platform bursts is therefore open: that is test O1 below.

## 4. Where the ~80 s goes, and what causes waits

A level sub-session (Sonnet, low) is about 80 s (diag-085-slow: 75-86 s, very regular). Best decomposition from the evidence:
- **Claude Code start-up, CPU-bound: about 19 s at 1/16 vCPU** [test T2; platform enforcement [inf]]. The diag's own CPU data (idle minutes) says the container is "waiting", but a throttled process also looks idle in a per-minute CPU sum; the sum of 43 CPU-s over the run is what a throttled container would show.
- **Per-turn handling in the CLI/MCP relay, about 1.7 s per turn** at lite [test T2b], about 4-6 turns: about 7-10 s [inf].
- **Closing turn after `report`: one extra model turn** [code, test T1], roughly 5-15 s of model time plus its 1.7 s [inf].
- **Model time for the real turns (Sonnet, low, growing context) and plane reads:** the remainder, about 40-50 s [inf]. Not separable without the runner's own `ms`/`num_turns` lines (Observability not readable by this session, diag-085-slow).
- Not a cause: polling (none), retries (none in our code), container cold start (none in the window), message size (no transport cut), the 10-minute segment break (seconds to ~90 s, three times at most).

At the run level (observed 29.5 min): about 27 serial conversations, each carrying about 20-30 s of fixed overhead if lite really throttles: **about 9-13 minutes of the 30 would be start-up and closing overhead, not thinking** [inf from T2 x count]. Another 2/3 of the wall time repeats pass 1 (passes 2-3 re-read the same 12-token snippets; r6 D3).

What in our design causes waits: (a) one new CLI process per conversation, on the smallest container; (b) everything serial (table rows and the four levels); (c) a closing model turn after every final tool; (d) a fixed three passes with no "nothing new" stop; (e) a transcript re-sent as text on each retry conversation.

## 5. Changes, ranked by evidence

| # | Change | Owning module | Evidence | Expected gain | Risk |
|---|---|---|---|---|---|
| 1 | Give the runner a real size: `instance_type` `standard-1` (1/2 vCPU) or `standard-2` in `agent-runner/wrangler.jsonc`. Do it first on a staging member and compare the runner's `ms` per conversation before and after | `agent-runner` (config) | T2: 27 s to 2.7 s (standard-1) per zero-latency conversation; D12 | up to about 20 s a conversation, about 9 minutes of 30 if the platform throttles as the quota does | low; Cloudflare cost only; platform enforcement unconfirmed (O1) |
| 2 | Stop a run when a pass adds nothing new | `agent-harness` (stop rule), `agent-worker` | diag-085-slow section 4; r6 D3 (passes 2-3 repeat) | 10-20 min of 30 | medium; states what a check promises, BOB then Bob |
| 3 | Fix what makes passes 2-3 repeat: snippet length / readunit | `retrieval`, `query-language`, `agent-worker`, `agent-model` | r6 D3 | fewer wasted passes; makes #2 safe | low (A), medium (B) |
| 4 | Do not wait for the model's closing turn: once the final tool's answer is accepted, end the conversation from the worker side (close the socket), or have the runner end the query after the final tool result and report usage itself | `agent-model` (`signin.mjs:304, :284`); possibly `agent-runner` for usage | T1: 3rd request after the answer; code | one model turn per conversation, about 5-15 s x 27 = 2-7 min [inf] | medium: today's `usage`/`calls` come from the end frame; closing early yields `calls: null` (`signin.mjs:296`) and an unmetered turn; needs a decision on accounting. Confirm timing with one real call (O2) |
| 5 | Run the four level sub-sessions in parallel | `agent-worker` (`index.mjs:1508`), `agent-model` meter | diag-085-slow #3 | about 4 min a pass, only with #1 (a 1/16 vCPU box cannot run four CLIs at once) | medium; multiplies draw on one subscription (AT-4, U-5 open) |
| 6 | Pre-warm the CLI with `startup()` while the worker prepares the conversation | `agent-runner` | D4 | about one start-up (about 1 s on a sized box); no gain on lite | low; only after #1; WarmQuery single use |
| 7 | Cheaper parent conversations (model/effort) | `agent-model` | diag-085-slow #4 | 1-3 min a pass | quality; K3490 is Bob's |
| 8 | Honest progress words instead of "expires" | `ai-runs`, `screens-inquiry` | diag-085-slow #6 | none in speed; removes the "stuck" reading | low |
| - | Not an option: `--bare` (needs an API key, D2) | - | D2 | - | - |

Order: 1 (with the measurement O1 as its check), 3 then 2, 4, then 5 and 6.

## 6. Tests still owed (exact steps)

- **O1: does Cloudflare throttle `lite` as the quota test did?** With a credential that holds Observability read (the proxy's token had none, diag-085-slow): query Workers Observability for event `conversation.runner` of `agent-runner` over 2026-10-16 13:50-14:25 UTC (fields `ms`, `num_turns`, `outcome`) and `runner.egress` (`ms` per Anthropic call). Sum of egress `ms` per conversation is the model time; `ms` minus that is start-up and relay. One query settles the 80 s split. Alternative without logs: deploy a copy of `agent-runner` as a new worker name with `instance_type: standard-1` and send one tiny conversation (`prompt "Reply OK"`, no tools, `max_turns 1`) to each of the lite and the standard-1 copy and compare `conversation.runner ms` (needs a held sign-in token, so only by Bob's member through a direct op).
- **O2: the closing turn.** One tiny real call (reply OK with a one-tool schema) through the runner path, reading `num_turns` and the `runner.egress` lines: expect `num_turns` 2 when the model calls the tool then closes.
- **O3: real model time per turn** at Sonnet low and Opus medium for the contract-sized prompt (from O1's egress `ms`).
- **O4: subscription throttling.** No test is possible without hammering Bob's subscription; the register has no entry on concurrency or rate limits, and no official page was found. Watch for `api_retry` with `error: rate_limit` in the runner (not logged today; `runner.mjs:192` sees the messages). Suggest logging `attempt`, `retry_delay_ms`, `error` per conversation to settle it for free on the next run.
- **O5: cost of a segment break** (diag-085-slow section 7) and **whether `lite` plus 256 MiB memory pressure** (samples up to 427 MB against 256 MiB) adds swap or stall: compare O1.
