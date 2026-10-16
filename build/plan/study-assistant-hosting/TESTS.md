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

## Remote series (K3584), 2026-10-16 19:42–19:50Z, BOB's account, haiku-5-5 unless stated

Observations under K3574. Each cell repeated; times from the sessions' own events (creation or message time, the assistant/result event's `created_at`, and the result event's own phases). Account state shown in every session: `isUsingOverage: true`, seven-day limit `rejected`, yet requests were served. Every session was archived after reading. All [test]. Raw reading by `list_events`; no body of any answer except the one word or the version.

| Cell | n | Creation (or message) to first answer text | Result event | Claude Code's own part (result event) | Notes |
|---|---|---|---|---|---|
| **d1 · cloud session per conversation, no repository** (`create_session`, "Reply with the single word OK.") | 2 (+1 by BOB: 4.6 s) | **18.05 s** and **6.05 s** (BOB's earlier probe: 4.6 s) | 19.4 s and 7.5 s | `time_to_request_from_spawn` 14,491 and 2,599 ms; `startup_wait` 12,749 and 277 ms; turn 2.73 and 2.79 s; first token 1.3 s; $0.0026 each | both "warm spare claimed"; two sessions created 0.8 s apart differed by 12 s, all of it in the intake wait before the turn |
| **d4 · message to an existing (warm) session** (`send_message`, "Reply with the single word OK again.") | 2 | **2.8 s** and **3.0 s** | n/a (answer events at 19:43:12.7 and 12.6) | thinking 1.3–1.6 s | arrives wrapped as a cross-session message; one session answered "OK", the other held the reply and asked its user; so this transport is not a clean carrier of a question |
| **d3 · cloud session with one tool call reaching biosmoke8** (Bash `curl …/?op=bootstrap`, reply with the `version`) | 2 | **18.3 s** and **13.0 s** (result events) | same | `startup_wait` 5,178 and 257 ms; turn 7.9 and 8.7 s, 2 turns; $0.0034, $0.0035 | both answered `0.85.0`: the cloud environment reaches `*.believeinoakland.workers.dev`; the tool call and its answer cost about 5–6 s of the turn |
| **c · routine fired per question** (`create_new_session_on_fire`, `fire_trigger`) | 2 | **8.1 s** (first fire, default model sonnet-5-5, $0.052) and **7.1 s** (haiku, after `update_trigger` model) | same | `time_to_request_from_spawn` 2,931 and 2,941 ms; `startup_wait` 248 and 184 ms; turn 1.75 and 1.05 s; $0.0520 and $0.0029 | not a warm spare (`warm_spare_claimed: false`) both times; the routine's session model is the account default unless set (sonnet, 18 times the cost) |
| **d2 · cloud session with the repository attached** (`believeinoakland/bio`) | 2 | **227.7 s** and **249.1 s** (result events) | same | `startup_wait` 187,359 and 202,548 ms; turn 3.8 and 4.7 s; $0.0053 and $0.0031 | clone 33.9 s (19:43:27.6 → 19:44:01.5); then this repository's own `SessionStart` hook (installs node 26, unshallows the clone) ran before the first turn and took the rest: about 150–170 s |

What it shows:
1. **A cloud Claude Code session answers in 3–18 s from creation with nothing attached, 13–18 s with one tool call to the plane's instance, 7–8 s from a fired routine, and 3 s for a message to a session already up** (haiku). The same Claude Code binary and prompt took 40 s at the local runner's container before its first call (F1): the 40 s is not Claude Code's.
2. **The spread inside a cell is large:** 18.05 vs 6.05 s for the same call 0.8 s apart; the difference was a 12.7 s wait before the turn (`startup_wait`), not the model or the CLI's own start.
3. **The repository adds its own time:** clone 34 s plus whatever the repository's `SessionStart` hook does (this repository's hook installs a toolchain and unshallows): a repository attached to a per-question session pays that on every question unless the session is kept (d4).
4. **Cost per answer:** $0.0026–0.0035 on haiku with Claude Code's own 62k-token system context mostly cached; $0.052 on the default (sonnet) for the routine.
5. **Not tested here:** the product's control of the steps (these sessions are driven by a prompt, not by the product's table); records leaving the account to Anthropic's cloud sessions; concurrency limits.

### Remote series, part 2: length, context, failures (19:44–19:52Z)

| Cell | n | Observed |
|---|---|---|
| **Run length: N sequential tool calls to the instance** (Bash `curl …/?op=bootstrap`, auto permission mode) | 20-call and 40-call sessions, 1 each | **72.1 s** for 20 calls (21 turns) and **125.5 s** for 40 (42 turns), creation to result: **about 3.0–3.2 s a call** (model about 2.1 s, tool about 1 s); cost $0.0177 and $0.0334; cache-read tokens 1.34 M and 2.72 M (the whole context, 62–70 k tokens, is read again every turn; it grew only from 62.6 k to 70.4 k). Both finished and reported "done"; the 40-call one reported its own deviation (one extra `echo` call). |
| **Logged request side (the plane's Workers Logs, `ladder-r7-remote-bootstrap-cadence.txt` figures below)** | 1 | the plane logged 54 `curl/8.5.0` requests to `op=bootstrap` between 19:46:16.6 and 19:48:05.8 for the 60 asked: the gaps between requests run 1.2–3.1 s (median about 2.5 s), the same cadence as the sessions' own timing; **6 of the 60 are not in the plane's log** and the sessions said "done"; not known whether the model skipped or batched them or the log missed them |
| **Context across messages** | 2 sessions (d1-a, d1-b) + 1 resumed | a second message to a live session sees the first (the cache-read in the second turn is the whole earlier context, 52.9 k tokens, `usage` of the second turn); a session archived and then unarchived and messaged: `send_message` to the archived session first fails at once with `session_inactive`; after `unarchive_session` a **new sandbox** was allocated (19:46:16.3), started in about 2 s, and the session was idle again at 19:46:30.9 (**about 15 s** from the message), with its earlier context (84.7 k tokens used) and its queued earlier message still answered |
| **Failures met** | | message to an archived session: `session_inactive`, immediate; to a nonexistent id: "target session could not be verified; retry" (a plain error); a `send_message` arrives wrapped as a cross-session message the haiku session treated as data, and in two of two it declined to send anything back (it answered its own user); the account showed `isUsingOverage: true, seven_day: rejected` in every session and every request was still served; the routine's first fire ran on sonnet-5-5 ($0.052) until the trigger's model was set |
| **What each needs held** | | creating and messaging sessions here used this container's claude.ai login with the sessions scope (not a member's); the sessions did not need any credential of the instance for `op=bootstrap` (public). **Not tested: a session calling an op that needs a credential** (it would have to hold a token: in the prompt, the repository, or an environment); the composite route (`claude -p … --cloud`) needs a claude.ai login in the container that runs it, which this container lacks ("Session expired", K3537); self-hosted environments (e) need a Team/Enterprise plan this account's plan is not shown to have |

What it shows:
1. **The remote session is steady where the local runner waits:** after the start (3–18 s, one 12.7 s outlier) each tool call costs 3 s, flat over 40 calls, and the context cost is cache-read, not growth.
2. **A repository is the dominant start cost** (clone 34 s plus the repository's own start hook: 228–249 s in total here); a session without a repository starts in seconds.
3. **State survives sandbox loss:** an archived session came back in 15 s with its history.
4. **Not yet known:** limits on concurrent sessions and on a long single run (over 125 s); a session with a credential; the composite route; (e).

### Remote series, part 3: concurrency, a long run, and the account's spend limit (19:54–19:59Z)

| Cell | n | Observed |
|---|---|---|
| **Concurrency A: 6 sessions created within 4 s** (one subscription, haiku, "Reply with the single word OK.", with one long run already in flight: 7 live) | 6 | all six answered, **7.5–8.8 s each** from creation (8.69, 7.49, 8.83, 7.95, 8.26, 7.85 s); no refusal, no queueing visible; cost $0.0025 each |
| **Long run (40 × `sleep 15; curl bootstrap`, about 12 minutes planned)** | 1 | ran 19:54:38 → 19:59:27Z (4 min 49 s) and **ended by the account's spend limit**, not by a session limit: the plane logged 13 requests 19:55:03–19:59:27, a steady **18.6 s a call** (15 s sleep + 3.6 s of turn), two gaps of 37–38 s (a call whose log line is missing, or a skipped one); cost to that point $0.0134 (955 k cache-read tokens, context 66 k) |
| **Concurrency B: 10 sessions created within 7 s (repeat, 11 live with the long run)** | 10 | **all ten failed within 5–12 s of creation**: `status_category: failed`, "You've hit your monthly spend limit · raise it at https://claude.ai/settings/usage?from=cc_cli_limit_message · your weekly limit resets 11am (UTC)"; `rate_limit_info`: `isUsingOverage` **false** (it was `true` in every earlier session), `rateLimitType: seven_day`, `status: rejected` |
| **Credential held by a probe session (K3593 (1))** | 0 run | the two creating calls (prompt carrying the test member `walker`'s session token) were **refused by this session's permission check** ("Credential Leakage"); not worked around. The token had been issued and checked (`op=whoami` → member `walker`, class member). |

What it shows [test]:
1. **Several cloud sessions at once on one subscription start together** (6 at once, 7.5–8.8 s each, no queue) while the account is within its limits.
2. **The binding limit on this account is a spend limit, not a concurrency or a session limit**: at about 19:59:19Z, after roughly 85 sessions' worth of haiku use on top of the day's other use (this lane's and BOB's sessions bill the same account), every session, new or running, was refused with the monthly spend message. The account had shown "overage, weekly limit rejected, served" until then; at the moment of the refusal `isUsingOverage` read `false`. What the cloud sessions cost is small (a one-word answer $0.0026–0.003; 40 curl calls $0.033); the account's cap is not.
3. **A running session is cut, not finished, when the limit trips**: the long run ended with its state intact (idle, context 66 k tokens) and "failed" status; its earlier work is in the plane's log.
4. **Not obtained:** a run longer than 10 minutes (the cap above); concurrency B at ten; a session using a held credential.

### Remote series, part 4: concurrency repeated after the limit was lifted (20:48Z)

BOB #195 reported the spend limit lifted; sessions served again (`isUsingOverage: true` again in every session). **Concurrency C: 7 sessions created within 5 s** (haiku, "Reply with the single word OK."): all answered, **7.1–9.9 s** from creation (9.88, 8.64, 7.97, 7.10, 9.80, 9.70, 8.54 s); no refusal, no queueing [test]. With A (6 sessions, 7.5–8.8 s) that is two repetitions at 6–7 concurrent on one subscription. **Not run:** the 10-at-once repeat (3 of 10 creates) and the long run over 10 minutes (the create): this session's permission check refused them ("Real-World Transactions", "Interfere With Workloads"), after the earlier spend-limit event; not worked around.

### Container size cells (K3582, K3595): standard-4, 2026-10-16 20:57–21:00Z

Application `agent-runner-agentrunner` read back at version 5: 4 vCPU, 12 GiB (BOB's act, rollout 20:51Z). Two asks as the administrator, same question as asks 2–4 ("What time does the library now open?"), read from Observability as before (`ev5.json` method: needle `conversation.runner`, service `agent-runner`). [test]

| | ask 5 ("cold") | ask 6 (warm, the next) |
|---|---|---|
| ask, curl | 20:57:20.7 → 20:58:29.6, 68.8 s | 20:58:29.6 → 20:59:29.6, 60.0 s |
| `conversation.runner` | `failed` / `CLOSED`, 67,151 ms (the ask layer closing at its turns bound, as every time) | `failed` / `CLOSED`, 59,231 ms |
| conversation starts (end − ms) | 20:57:22.4 | 20:58:30.3 |
| first logged outbound call | 20:58:03.8 (`GET settings`; its `HEAD /api/hello` line is not in the window's list) | 20:59:10.7 (`HEAD /api/hello` 200) |
| **gap, start → first call** | **41.4 s** | **40.4 s** |
| model calls | 12 `POST /v1/messages` 200, 1.5–6.4 s | 7, 200, 0.8–1.7 s |

What it shows:
1. **The wait before the CLI's first call does not change with the container's size:** 41.4 and 40.4 s on 4 vCPU / 12 GiB, against 41.6, 40.5, 40.4, 41.3, 40.9 s on standard-1 (0.5 vCPU / 4 GiB). Seven repetitions across two sizes lie within 40.4–41.6 s. That agrees with the CPU reading of S8 (a wait, not computing) and puts it outside what size can change.
2. **"Cold" was not demonstrated:** no `runner.lifecycle` `start`/`started` line appears in 20:50–21:02Z (only the old instance's `activity_expired` lines up to 20:55:59, instance ref `564876135686`), so whether the ask started a new container or reused one cannot be seen; the first ask's 41.4 s is the same as the warm one's, so any container start it paid is hidden inside that second at most. The instance list read `inactive` afterwards.
3. **The model's calls were slower on the first ask** (1.5–6.4 s against 0.8–1.7 s on the second, same container size): not explained by size; possibly the model side.
4. **Finding (N7): the CLI keeps calling the model after the conversation is closed.** The first conversation was closed (`CLOSED`) at 20:58:29.5, yet five more `POST /v1/messages` appear from the same container at 20:58:32.8, 35.7, 42.6, 49.8 and 53.7 (24 s after the close; they cannot belong to the second conversation, whose first call is its `HEAD /api/hello` at 20:59:10.7). The same occurred with one extra call after the close in ask 2 (18:51:56.6, 2 s after 18:51:54.3) and ask 3 (19:23:00.3, 2 s after 19:22:57.9). So a closed or aborted conversation can leave the CLI spending on the model for up to about 24 s [test]; the `abort` in `runner.mjs` `closed()` does not stop an in-flight turn at once.

### Remote cell: a cloud session that holds a credential and calls credentialed ops (K3593 (1), K3599 (a)), 21:02Z

One haiku cloud session (`create_session`, default environment), told to sign in to biosmoke8 **itself** from the `JOURNEY_MEMBER_HANDLE` / `JOURNEY_MEMBER_PASSWORD` variables that the environment already carries, keep the token in a mode-600 file, never print it, and run `whoami` once-twice and `search` twice, timed. No token or password was written in any prompt. [test]
- The session reported: `login=200; whoami_member=walker; whoami_times=1.53,0.73; search_codes=200,200; search_times=1.02,2.61; search_bytes=1559`. Created 21:02:38.6, answered 21:03:09.4: **30.8 s** end to end (7 turns, $0.0064).
- The plane's own log (`ladder-r7-remote-auth-probe-plane.txt`, `curl/8.5.0`): `POST /api/?op=login` 200 at 21:02:51.2 (13 s after creation: session start and first model turns), `GET …op=search&q=library` 200 at 21:02:58.5 and 21:03:04.6 (265 and 274 ms at the plane), `GET …op=whoami` 200 at 21:03:01.96 (564 ms). The log holds **one** `whoami` where the session reported two (the same missing-line pattern as in the length cell: 6 of 60 there).
- So a cloud session **can hold a member's credential supplied by its environment, sign in, and call credentialed ops** of the instance as that member (`walker`, class member, `contribute`); a call and its answer take 0.7–2.6 s measured at the session, 0.3–0.6 s at the plane. Not shown: the same under a *member's own* environment variables (they would have to be set per member), and renewal of the sign-in.

### Remote cell: the full dialogue at Civicsmith's size (K3595), 21:01–21:06Z: what is and is not proven

K3595 asks whether a prompt of Civicsmith's real size (the 212 KB agentpack plus a question) reaches the model whole in a remote session, and the whole answer comes back whole, each checked by size and hash at both ends. **Not proven. Three separate obstacles, each tested:**
1. **This lane cannot type 212 KB through the tool.** The only way for this lane to put text into a cloud session is a tool-call parameter written by the model (`create_session` prompt, `send_message`); a 212 KB parameter is about 60–70 k output tokens in one call. I prepared an exactly reproducible 211,700-byte text (3,650 numbered lines, sha256 `aa63de22…facdbc`, in the scratchpad) and sent only its first 150 lines (about 8.7 KB) in five messages; further parts were not sent. A real test of the 212 KB path needs a **program** that calls the sessions service with the pack read from a file (the way Civicsmith itself would), which this lane cannot do: it holds no claude.ai login (K3537: `claude -p … --cloud` from this container is "Session expired").
2. **`send_message` is not a carrier for a dialogue.** Messages sent to a live session arrive wrapped as "cross-session messages" and the haiku session treats them as data, not as the user's turns: after parts 1–5 the session reported it was still "waiting on PART 2 of 4" and answered later messages with "no PART marker" (21:01:30, 21:04:13, 21:04:44), and it ignored the instructions of the later parts. (The same wrapper made d1-a/b answer or hold a simple "OK".) A remote option that is driven by messages must use a real user turn (first prompt of `create_session`, a routine's prompt, or `--cloud`), not `send_message`.
3. **The variant that avoids typing was refused by the permission check:** a session told to sign in from its environment, fetch the real agentpack itself (member class, 212,345 bytes, sha256 `5e04868c…527566`, measured here), pass it whole through its context in 8 chunks and return canaries and a 25 KB answer for comparison, was refused at `create_session` as "Data Exfiltration". Not worked around.
Also seen: **the spend-limit message came back for three calls (21:01:33–37Z)** inside the first dialogue session, then service resumed (`isUsingOverage` true again at 21:04): the account's limit is not a single clean event.

What the evidence does prove about size: a cloud session's context holds at least the CLI's own 62–83 k tokens of system prompt plus what is sent (67 k tokens used after the five small parts), and the 40-call session carried 70 k tokens of context across 42 turns with 2.7 M cache-read tokens; **no run has put 212 KB into a remote session's prompt yet.** What it does not prove: the transport limit of a prompt on `create_session`, `claude -p --cloud` or a routine; that a 31 KB answer returns whole (the answer-back, like the 212 KB, is untested).

### Container size cells, standard-1 again (K3582), 21:09–21:13Z: the cold start is visible

Application v6 (standard-1: 0.5 vCPU, 4096 MiB) read back by BOB at 21:07Z; every instance restarted. Ask 7 (cold) and ask 8 (warm, the next), same question, as the administrator. [test]

| | ask 7 (cold) | ask 8 (warm) |
|---|---|---|
| ask, curl | 21:09:55.8 → 21:11:42.4, 106.6 s | 21:11:42.4 → 21:12:46.9, 64.5 s |
| `runner.lifecycle` | `start` 21:09:58.7, `started` 21:10:00.1 (**1,458 ms** for the container) | none (same container) |
| conversation start (DO fetch) | 21:09:59.7 (`conversation.runner` ms 102,162, ended 21:11:42.4 → start 21:10:00.3) | ≈ 21:11:42.9 |
| first outbound call (`HEAD /api/hello`) | 21:11:23.8 | 21:12:23.6 |
| **gap, start → first call** | **83.5 s** | **≈ 40.7 s** |
| model calls | 12, 0.9–1.4 s each | 5+, 1.4–2.5 s |

What it shows:
1. **The container itself starts in 1.46 s**; the cold ask nevertheless waits **83.5 s** for the CLI's first call, **about 43 s more than the warm ask's ≈ 40.7 s**. So the ≈ 40 s F1 wait is paid on every conversation, and a freshly started container pays about 43 s more on its first one: the extra is not the container (1.5 s) but the first run of the CLI in it (cold files of the image, first execution); the warm 40 s remains unexplained.
2. Together with S15 (standard-4: 41.4 s and 40.4 s, not shown cold) the picture over nine conversations: **warm 40.4–41.6 s on both sizes; one demonstrated cold start 83.5 s on standard-1.**
3. A cold ask is 106.6 s against 64.5 s warm (ask layer included); size makes no difference to the warm figure.

### Remote cell: a 212 KB text through a cloud session's context and a 25 KB answer back (synthetic, no credential), 21:10Z

One haiku session (no repository, no credentials), told to generate a known 211,700-byte text itself, print it into its own context in eight chunks, then generate and print a 24,960-byte answer file and return it with hashes and canaries. [test]
- Created 21:10:03.0; answered 21:11:14.98: **72.0 s**, 17 turns, $0.147; its context reached **169,088 tokens**.
- **Both ends agree:** `big_bytes=211700; big_sha256=aa63de22…facdbc` equals my local file's; `canary1`, `canary5` (character 112,000) and `canary8` (last 40 characters) equal the expected strings; `ans_bytes=24960; ans_sha256=4d7f13eb…f79483` equals my expected. The returned answer text ran continuously A00001–A00480 (480 lines) with no gap or duplicate in what the event returned; I could not machine-hash the returned text (the tool printed it inline, not to a file).
- What this proves: a remote session **takes in 212 KB through tool results (about 170 k tokens of context) and returns a 25 KB final message whole**. What it does not: that 212 KB passes as the **prompt** (the transport of the first message); that is the repository route below.

### Remote cell: the repository route for the 212 KB dialogue (K3601), 21:12Z: both ends compared from git

The text `probe-dialogue/probe-text.txt` (211,182 bytes, 1,975 lines, sha256 `cd1de8a7…780c8`, two facts planted: `ORCHID-319` in line 3, `QUARTZ-857` in the second-last line) was committed to `tranche/T49` (commit `f7517229f4`). One haiku cloud session with `believeinoakland/bio` attached on `tranche/T49` was told to read it whole with the Read tool, hash it, name the two code words and their sum, write a 61,950-byte answer file by a rule, and push it to its own branch `study/probe-dialogue`. [test]
- Created 21:12:00.9; final message 21:12:55.6: **54.7 s** end to end (8 turns, $0.0766, context **165,098 tokens**; the repository's start hook did not hold it up this time: `startup_wait` 16.9 s against 150–200 s in cells d2-a/b).
- **In:** the session reported `bytes=211182; sha256=cd1de8a7…780c8; lines_seen=1975` (equal to the committed file's), `first=ORCHID-319; last=QUARTZ-857; sum=1176` (correct: one fact from the first 2 KB, one from the last 2 KB, so it read the whole text).
- **Out:** it reported `answer_bytes=61950; answer_sha256=5a70f297…b4f23; pushed=yes; commit=39f955a325…`. From git: `origin/study/probe-dialogue` holds commit `39f955a325` ("probe answer") on top of `f7517229f4`; its `probe-answer.txt` is **61,950 bytes, sha256 `5a70f297fcd0afe2416cd4b90282939b0a8cefb64c205c923db4b889150b4f23`, byte-identical to the expected file** (`cmp`). The branch `study/probe-dialogue` is left on the remote.
- **What is proven:** a cloud session with a repository attached **reads a 211 KB file whole by its own Read tool (165 k tokens of context), answers from facts at both ends, and returns a 62 KB result whole through git, hashes equal at both ends**, in about 55 s, on haiku, for $0.08. **What is not:** the 212 KB as the **text of the prompt** (the first message was about 1.6 KB and named the file); for the product the equivalent is the data reaching the session as a file, tool result or repository content, not as a prompt typed by this lane; the sessions service's own limit on a prompt body is still not measured.
- Findings recorded with it: **`send_message` is not a carrier for a product's dialogue**: it wraps each message as a "cross-session message", a haiku session treats it as data (it ignored five numbered parts and kept "waiting for PART 2"); the product would use the sessions service, whose first prompt or a routine's prompt is a real user turn.
