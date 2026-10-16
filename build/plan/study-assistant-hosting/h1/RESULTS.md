## Assistant-hosting study: local tests of the V0-V4 variants

Every number below is [test]: measured on this box with a fake Messages API, zero real Anthropic or Cloudflare traffic. The credential string was `fake-oauth-token-for-local-test`. Nothing in the product tree was touched or committed.

### Environment and what was emulated
- Box: 4 CPUs, Linux 6.18, Node v26.10.0, npm 11.19.1 (the study's Node may differ; `agent-runner` needs >=22).
- Runtime: `agent-runner` as on branch tranche/T49 (`package.json` 0.84.0), `npm ci --omit=dev --ignore-scripts`; `@anthropic-ai/claude-agent-sdk` 0.3.289 with its bundled Claude Code binary (`claude-agent-sdk-linux-x64`).
- Fake API: `scripts/fakeapi.mjs` (the study's, with two additions: a cycling script, and `input_tokens` reported as body bytes / 4), run by `scripts/fakeserver.mjs` as **its own process outside the CPU cgroup**, so the fake's CPU is not charged to the container under test.
- **CPU limiting was emulated with a cgroup v1 CFS quota** (period 100000 us; the process is put in `cpu/h1` and `cpuacct/h1`): no quota (4 CPUs), 100000 (1 vCPU), 50000 (1/2 vCPU = standard-1), 6250 (1/16 vCPU = lite). `taskset` was not needed. Only memory and the network path of a real Cloudflare container are not emulated; whether Cloudflare enforces lite as a hard quota is still open (study O1).
- 5 runs per cell, a fresh node process per run (3 runs for the lite column, zero latency only; V4 not run at lite). Cells show median (min-max). Model latency 0 or 3 s per API request, applied by the fake before streaming.
- CPU = user+sys of the whole cgroup (node plus the Claude Code child), read from `cpuacct`, **from after the SDK module import**. The import costs a further 0.4-0.5 CPU-s unthrottled (0.65-0.75 under the lite quota) and is reported separately because the real runner imports once per container, not per conversation.
- Scripted conversation: tool `meaningrows`, tool `report`, then closing text "OK" = 3 main API requests. "API req (main)" excludes the small side request the CLI makes (a haiku title/quota call).
- Tools in V1-V3 use the runner's own `relayServer()` and the same query options and env as `converse()` (`env.mjs` PATH/QUIET/passed), reply after 5 ms. V0 and V4 call `converse()` itself.

### Exact commands
```
cd $SCRATCH/h1      # SCRATCH = /tmp/claude-0/-home-user-bio/4d2f0f0d-4f7d-5449-bba1-a0983b3c5029/scratchpad
cp -r /home/user/bio/agent-runner/{package.json,package-lock.json,src} .
npm ci --omit=dev --ignore-scripts
scripts/run.sh <V0|V1|V2|V3|V4> <latency_ms> <cfs_quota_us|max> <runs>   # one cell, JSON lines
scripts/matrix.sh     # 4 CPUs, 1 CPU, 1/2 vCPU x latency 0/3000 x V0-V4 x 5 runs
scripts/lite.sh       # 1/16 vCPU, latency 0, V0 V1 V3 V2 x 3 runs
python3 scripts/summarize.py > raw/summary.md
```
Variant definitions (`scripts/bench.mjs`):
- **V0** `converse()` with one `query()` per conversation.
- **V1** `startup({options})` (SDK 0.3.289 exports `startup(params?: {options, initializeTimeoutMs}): Promise<WarmQuery>` and `WarmQuery.query(prompt)`, plus an `@alpha` `prewarm()`/`SpareProcess.claim()`; `startup` used here). Measured: `await startup()`, then ask; time is ask to result. Tools and MCP servers are fixed at startup, so one warm process serves one conversation.
- **V2** one `query()` whose prompt is an async iterable; 5 conversations pushed one after another once the previous `result` arrived; same process, same session.
- **V3** same as V0 but when the `report` tool call reaches the relay handler, `q.interrupt()` then `q.close()`, and the handler never returns.
- **V4** `converse()` with `tools: []`; the fake returns a JSON judgement as text.

### Results

#### Model latency 0 s per turn

| CPU | variant | n | first msg s | end s (from ask) | API req (main) | CPU s per conv (user+sys) |
|---|---|---|---|---|---|---|
| 4 CPUs, no quota | V0 | 5 | 0.50 (0.48-0.57) | 0.73 (0.66-0.77) | [3] | 0.94 (0.85-0.97) |
| 4 CPUs, no quota | V1 (startup, not in 'end') | 5 | startup 0.41 (0.37-0.43) | - | - | startup 0.52 (0.47-0.56) |
| 4 CPUs, no quota | V1 (ask→end) | 5 | 0.07 (0.06-0.10) | 0.27 (0.24-0.33) | [3] | 0.35 (0.32-0.42) |
| 4 CPUs, no quota | V2 conv 1 | 5 | 0.43 (0.41-0.43) | 0.56 (0.54-0.58) | 3 | 0.71 (0.67-0.73) |
| 4 CPUs, no quota | V2 conv 2-5 | 20 | 0.01 (0.01-0.01) | 0.08 (0.06-0.09) | 3 | 0.12 (0.08-0.16) |
| 4 CPUs, no quota | V2 whole process (5 conv) | 5 | - | 0.88 (0.88-0.91) | [15] | 1.28 (1.18-1.39) |
| 4 CPUs, no quota | V3 | 5 | 0.48 (0.43-0.52) | 0.67 (0.58-0.70) | [2] | 0.82 (0.71-0.91) |
| 4 CPUs, no quota | V4 | 5 | 0.47 (0.44-0.49) | 0.59 (0.56-0.78) | [1] | 0.77 (0.69-0.77) |
| 1 CPU quota | V0 | 5 | 0.60 (0.56-0.61) | 0.86 (0.82-0.88) | [3] | 0.85 (0.83-0.90) |
| 1 CPU quota | V1 (startup, not in 'end') | 5 | startup 0.47 (0.42-0.48) | - | - | startup 0.49 (0.47-0.52) |
| 1 CPU quota | V1 (ask→end) | 5 | 0.11 (0.06-0.11) | 0.36 (0.32-0.37) | [3] | 0.35 (0.32-0.36) |
| 1 CPU quota | V2 conv 1 | 5 | 0.53 (0.52-0.60) | 0.73 (0.71-0.83) | 3 | 0.78 (0.70-0.82) |
| 1 CPU quota | V2 conv 2-5 | 20 | 0.01 (0.01-0.06) | 0.18 (0.10-0.25) | 3 | 0.17 (0.09-0.28) |
| 1 CPU quota | V2 whole process (5 conv) | 5 | - | 1.41 (1.31-1.70) | [15] | 1.52 (1.38-1.92) |
| 1 CPU quota | V3 | 5 | 0.57 (0.45-0.59) | 0.81 (0.74-0.83) | [2] | 0.84 (0.80-0.87) |
| 1 CPU quota | V4 | 5 | 0.65 (0.53-0.68) | 0.80 (0.73-0.89) | [1] | 0.82 (0.73-0.88) |
| 1/2 vCPU quota | V0 | 5 | 1.28 (1.19-1.30) | 2.03 (1.88-2.21) | [3] | 1.10 (0.87-1.15) |
| 1/2 vCPU quota | V1 (startup, not in 'end') | 5 | startup 0.89 (0.82-1.00) | - | - | startup 0.53 (0.47-0.58) |
| 1/2 vCPU quota | V1 (ask→end) | 5 | 0.28 (0.21-0.28) | 1.04 (1.00-1.16) | [3] | 0.53 (0.48-0.64) |
| 1/2 vCPU quota | V2 conv 1 | 5 | 1.13 (1.09-1.20) | 1.71 (1.60-1.81) | 3 | 0.87 (0.82-0.89) |
| 1/2 vCPU quota | V2 conv 2-5 | 20 | 0.02 (0.01-0.20) | 0.41 (0.21-0.61) | 3 | 0.21 (0.13-0.37) |
| 1/2 vCPU quota | V2 whole process (5 conv) | 5 | - | 3.29 (3.11-3.43) | [15] | 1.84 (1.70-1.87) |
| 1/2 vCPU quota | V3 | 5 | 1.20 (1.02-1.39) | 1.89 (1.73-2.14) | [2] | 1.05 (0.94-1.11) |
| 1/2 vCPU quota | V4 | 5 | 1.21 (1.10-1.30) | 1.72 (1.53-1.84) | [1] | 0.82 (0.78-0.88) |
| 1/16 vCPU quota (lite) | V0 | 3 | 14.20 (14.11-14.89) | 21.61 (21.30-22.70) | [3] | 1.79 (1.72-1.88) |
| 1/16 vCPU quota (lite) | V1 (startup, not in 'end') | 3 | startup 10.29 (10.10-10.40) | - | - | startup 0.91 (0.90-0.95) |
| 1/16 vCPU quota (lite) | V1 (ask→end) | 3 | 4.00 (3.70-4.10) | 11.01 (10.40-11.10) | [3] | 0.84 (0.80-0.87) |
| 1/16 vCPU quota (lite) | V2 conv 1 | 3 | 13.70 (13.70-14.90) | 19.20 (18.70-20.50) | 3 | 1.58 (1.56-1.75) |
| 1/16 vCPU quota (lite) | V2 conv 2-5 | 12 | 0.35 (0.10-1.10) | 3.80 (2.80-6.10) | 3 | 0.34 (0.25-0.55) |
| 1/16 vCPU quota (lite) | V2 whole process (5 conv) | 3 | - | 35.20 (35.10-35.20) | [15] | 3.22 (3.12-3.28) |
| 1/16 vCPU quota (lite) | V3 | 3 | 14.70 (13.79-14.80) | 20.90 (20.00-21.10) | [2] | 1.79 (1.76-1.81) |

#### Model latency 3 s per turn

| CPU | variant | n | first msg s | end s (from ask) | API req (main) | CPU s per conv (user+sys) |
|---|---|---|---|---|---|---|
| 4 CPUs, no quota | V0 | 5 | 0.51 (0.48-0.58) | 9.70 (9.66-9.77) | [3] | 1.20 (1.13-1.22) |
| 4 CPUs, no quota | V1 (startup, not in 'end') | 5 | startup 0.37 (0.35-0.45) | - | - | startup 0.49 (0.43-0.64) |
| 4 CPUs, no quota | V1 (ask→end) | 5 | 0.09 (0.07-0.09) | 9.25 (9.22-9.28) | [3] | 0.59 (0.59-0.69) |
| 4 CPUs, no quota | V2 conv 1 | 5 | 0.46 (0.41-0.49) | 9.59 (9.55-9.66) | 3 | 1.00 (0.97-1.10) |
| 4 CPUs, no quota | V2 conv 2-5 | 20 | 0.01 (0.01-0.02) | 9.10 (9.08-9.11) | 3 | 0.21 (0.11-0.32) |
| 4 CPUs, no quota | V2 whole process (5 conv) | 5 | - | 45.97 (45.95-46.08) | [15] | 1.99 (1.86-2.06) |
| 4 CPUs, no quota | V3 | 5 | 0.43 (0.39-0.49) | 6.58 (6.53-6.63) | [2] | 1.01 (1.00-1.10) |
| 4 CPUs, no quota | V4 | 5 | 0.47 (0.43-0.49) | 3.56 (3.52-3.58) | [1] | 0.93 (0.89-1.00) |
| 1 CPU quota | V0 | 5 | 0.61 (0.53-0.66) | 9.90 (9.84-9.98) | [3] | 1.07 (0.89-1.09) |
| 1 CPU quota | V1 (startup, not in 'end') | 5 | startup 0.44 (0.44-0.49) | - | - | startup 0.51 (0.47-0.57) |
| 1 CPU quota | V1 (ask→end) | 5 | 0.13 (0.09-0.13) | 9.39 (9.37-9.47) | [3] | 0.51 (0.46-0.64) |
| 1 CPU quota | V2 conv 1 | 5 | 0.59 (0.51-0.60) | 9.84 (9.72-9.89) | 3 | 0.96 (0.88-1.01) |
| 1 CPU quota | V2 conv 2-5 | 20 | 0.02 (0.01-0.05) | 9.16 (9.12-9.21) | 3 | 0.27 (0.16-0.38) |
| 1 CPU quota | V2 whole process (5 conv) | 5 | - | 46.49 (46.37-46.56) | [15] | 2.08 (2.04-2.24) |
| 1 CPU quota | V3 | 5 | 0.57 (0.55-0.60) | 6.80 (6.78-6.83) | [2] | 0.97 (0.94-1.00) |
| 1 CPU quota | V4 | 5 | 0.66 (0.60-0.68) | 3.79 (3.74-3.83) | [1] | 0.86 (0.82-0.91) |
| 1/2 vCPU quota | V0 | 5 | 1.21 (1.19-1.38) | 10.79 (10.61-10.87) | [3] | 1.13 (1.07-1.19) |
| 1/2 vCPU quota | V1 (startup, not in 'end') | 5 | startup 0.90 (0.80-0.92) | - | - | startup 0.53 (0.48-0.54) |
| 1/2 vCPU quota | V1 (ask→end) | 5 | 0.21 (0.20-0.28) | 9.72 (9.58-9.79) | [3] | 0.58 (0.51-0.65) |
| 1/2 vCPU quota | V2 conv 1 | 5 | 1.09 (1.01-1.13) | 10.51 (10.43-10.62) | 3 | 0.98 (0.92-1.05) |
| 1/2 vCPU quota | V2 conv 2-5 | 20 | 0.02 (0.01-0.09) | 9.20 (9.11-9.30) | 3 | 0.25 (0.19-0.37) |
| 1/2 vCPU quota | V2 whole process (5 conv) | 5 | - | 47.31 (47.18-47.46) | [15] | 2.15 (2.10-2.19) |
| 1/2 vCPU quota | V3 | 5 | 1.19 (1.11-1.22) | 7.58 (7.52-7.71) | [2] | 1.09 (1.00-1.15) |
| 1/2 vCPU quota | V4 | 5 | 1.21 (1.10-1.30) | 4.49 (4.33-4.53) | [1] | 0.88 (0.81-0.92) |

Lite (1/16 vCPU) column above is n=3 at zero latency only. For reference with the same method the first message arrives at 14.2 s and the whole conversation takes 21.6 s (V0); the earlier study measured 19 s and 27 s on its harness. The difference includes my timing starting after the SDK import and the fake running outside the quota.

SDK import (not in the tables), CPU-s [test]: 0.39-0.51 unthrottled, 0.65-0.77 at lite.

### Per-variant reading [test]
- **V1 pre-warm** removes the start-up from the ask: unthrottled 0.73 s to 0.27 s; 1/2 vCPU whole conversation 2.03 s to 1.04 s (first message 1.28 s to 0.28 s); lite 21.6 s to 11.0 s (start-up itself, 10.3 s, moves before the ask). CPU is not saved, only moved (startup 0.5 + ask 0.35-0.6 vs 0.94-1.2 total). Wall-to-end with 3 s turns: 9.7 s to 9.25 s (4 CPUs), 10.8 s to 9.7 s (1/2 vCPU). The 3 s turns dominate, so pre-warming saves 0.5-1 s there, ~10 s at lite.
- **V2 one process, 5 conversations**: conversation 1 costs the same as V0; conversations 2-5 take 0.08 s (4 CPUs) / 0.18 s (1 CPU) / 0.41 s (1/2 vCPU) / 3.8 s (lite) at zero latency, i.e. start-up is paid once; with 3 s turns they take 9.1-9.2 s (3 turns x 3 s plus about 0.1 s). CPU per later conversation 0.12-0.27 s (lite 0.34) against 0.94-1.2 s for V0; whole 5-conversation process 1.3-2.2 CPU-s (lite 3.2) against about 5 x 1.0 for five V0 processes. Every conversation here sees 3 requests each.
- **Context accumulates in V2**: the request body sent for conversation k grows by about 830 bytes (about 208 estimated tokens) and 9 messages per earlier conversation. First request of each conversation (bytes): 1646, 2477, 3308, 4139, 4974; message counts 2, 11, 20, 29, 38. (Messages in the request: 2, 5, 8 in V0; the sequence in V2 continues 11, 14, 17...). The model would see all earlier conversations; V2 needs a fresh session per member/matter or a clear between conversations for isolation. I did not test `/clear` or a new session id.
- **V3 no closing turn**: `interrupt()` then `close()` on the final tool call gives **2 main requests instead of 3** (4 CPUs: 0.67 s vs 0.73 s; 1/2 vCPU 3 s turns: 7.58 s vs 10.79 s; 4 CPUs 3 s turns: 6.58 s vs 9.70 s, i.e. one model turn = 3.1 s saved plus its CPU). Caveat: plain `q.close()` or `abortController.abort()` alone still produced a 3rd request (the CLI sent an error tool result on the way down, body 2453 B instead of 2299 B), so those two do not save the call; `interrupt()` first does. Counted at the fake on arrival; with a real model the aborted request would also be billed or not depending on the interrupt timing.
- **V4 single-shot judge** (no tools, one turn): 1 request, 0.59 s (4 CPUs, zero latency), 3.56 s with 3 s latency, 4.49 s at 1/2 vCPU with 3 s latency; first message 1.2 s at 1/2 vCPU. CPU 0.77-0.93 per judgement: start-up still dominates, so a single-shot judge in V0 style pays the same start-up as a tool run.

### Not done or not emulated
- No real model: model time, token billing, rate limits and the real egress interceptor are absent. 3 s per turn is a flat delay.
- Lite column: 3 runs, zero latency, V4 and the 3 s latency not run.
- V2 isolation between conversations, `/clear`, `prewarm()/claim()` (alpha) and idle-process memory (the SDK doc says a parked process holds about 230-260 MB) were not tested.
- Cloudflare's own enforcement of lite/basic/standard-1 as CFS quotas is an assumption of this emulation.
