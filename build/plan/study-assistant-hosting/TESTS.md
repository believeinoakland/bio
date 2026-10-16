# Tests (ASSISTANT-HOSTING)

**Status** · planned, 2026-10-16. Nothing run yet. Each test: what it settles, steps, cost, whether it needs an act of Bob's. Results are added under each when run.

| Id | Family | Settles | Steps (short) | Needs Bob? |
|---|---|---|---|---|
| H1 | 1 | start-up saved by `startup()` and by one process per run (`streamInput`) at 1/2 vCPU, and by dropping the closing turn | the link study's local harness (fake Messages API, CPU quota 1/2), three variants × 5 runs | no |
| H2 | 1 | the single-shot judge call shape (k): turns and tokens per judged row against today | same harness, a scripted judge with structured output | no |
| H3 | 4 | whether a member's own Claude Code follows a product-served loop over a connector: rows in order, refusals honoured, recovery after a refused call | a scratch MCP server (no records) with `next`/`answer`; drive it from a local Claude Code on a fake API first; then one real run | real run only (his sign-in, small) |
| H4 | 2 | the routine probe, T1–T9 | `design-remote-routine.md` §5 | yes: his one act, about 10 minutes |
| H5 | 2 | a session driven turn by turn with `--cloud` (K3537 composite): latency per turn, read-back | after H4, if Bob holds a full-scope login for the test | yes |
| H6 | 3 | a member-side runner dialling out: start-up on a laptop, reconnect after sleep | a scratch runner against a scratch Worker, fake API first | real run only |

## Baseline walks of today's assistant (K3539)

**Status** · planned, 2026-10-16; waits for BOB to say the release with fix round 6 is deployed. Method follows WALK-085 r5 (`build/plan/walk-085-r5.md`) so the numbers compare with its run (29 min 33 s, 37 ticks, 83 calls, 1,698,344 tokens, $1.48, no answer).

**Where and as whom.** The trial instance (`BIO_INSTANCE`), reached directly (`--noproxy '*'`), as the administrator by `JOURNEY_ADMIN_*` read by variable inside scripts, never printed. Work only in this lane's own project, `ASSISTANT baseline <date>`; never "WALK-085 project" or a `JOURNEYS …` project. A browser (Chromium, `--no-proxy-server`) for the question page and the dock at 1280 and 390; if it still refuses the certificate, that is reported first and the walk continues by ops, as r5 did.

**B1, the reference check (each deploy).**
1. Before: Containers API (GET only, account `20b533579290b9b93168345edd3b7f72`) for `agent-runner`'s `vcpu`/`memory` (expect `standard-1`, K3535) and whether an instance is already running (cold start or not).
2. Upload a fresh `.txt` of invented council minutes (the r5 text: lights failed 3 Sept, repaired 21 Sept, "eighteen days later"), with `type=text/plain`, a short name (D1); vouch; check it reads as text.
3. Ask: "How many days passed between the Marlowe Street crosswalk lights failing and their repair?"; cite the passage as a supporting leg; open a check run and dispatch.
4. Every 30 s until it ends: ticks, pass, state; screenshots of the question page and the dock at start, mid-run, end.
5. After: `airun` `session.cost` (calls, tokens, $), budget consumed, run log; Observability lines `conversation.runner` / `runner.egress` if the credential now allows (refused in diag-085-slow); CPU per minute from `containersMetricsAdaptiveGroups`.

**Measures recorded each time.** Open→first model call; open→end; ticks and passes; conversations (`calls`) and per-conversation time (from Observability if readable, else total ÷ conversations, marked inferred); tokens and $; answer correct (18 days) or not, and what was written to the member; what the member sees on the question page and in the dock (words, raw ids, progress, "expires"); each defect with evidence, to BOB.

**B2 (once, after B1 passes or fails cleanly).** One short question the assistant should answer from a single passage in one pass, to measure the floor of a run; and, if the dock offers chat, one exchange timed from send to first words.

## H1 and H2: results (2026-10-16, local, fake model API, no credential)

Full tables, method and scripts: `h1/RESULTS.md`, `h1/summary.md`, `h1/scripts/`. Worker: sonnet at medium. Box 4 CPUs; CPU sizes emulated by a cgroup v1 CFS quota; agent-runner 0.84.0 code with Agent SDK 0.3.289 and its bundled Claude Code; 5 runs per cell (lite 3); medians. All [test].

| At 1/2 vCPU (standard-1) | V0 today | V1 `startup()` pre-warm | V2 one process, conversations 2–5 | V3 end at the final tool | V4 single-shot judge |
|---|---|---|---|---|---|
| Instant model: seconds from ask to end | 2.03 | 1.04 (0.89 paid before the ask) | 0.41 | 1.89 | 1.72 |
| 3 s per model turn: seconds from ask to end | 10.79 | 9.72 | 9.20 | 7.58 | 4.49 |
| API requests per conversation | 3 | 3 | 3 | 2 | 1 |
| CPU-s per conversation | 1.10 | 0.53 (+0.5–0.9 before) | 0.21 | 1.05 | 0.82 |

What it shows:
1. On standard-1 the process start costs about 1–2 s a conversation, now small against model time. At lite it was 21.6 s.
2. Pre-warming (V1) moves the start before the ask; it does not lower total CPU.
3. One process per run (V2) pays the start once (later conversations add 0.1–0.4 s), but **context accumulates** (each earlier conversation adds about 830 bytes and 9 messages to the next request), so independent judgements need a fresh session or a clear (not tested).
4. **The biggest single saving is the call shape, not the host**: ending at the final tool (V3) drops one model turn (3.1 s at 3 s a turn; it works only with `interrupt()` then `close()`; `close()` or `abort()` alone still sent a third request); a single-shot judge (V4) is one request.
5. Not emulated: real model, billing, limits, Cloudflare's own enforcement; memory of a parked warm process (SDK docs: 230–260 MB, so a 4 GiB standard-1 can hold several).
