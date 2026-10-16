# ASSISTANT-HOSTING → BOB: hand-offs

Entries `S<n>`, newest last. BOB reads this at takeover and at each backstop check (K3538).

## S1 · 2026-10-16 · inventory and draft criteria, for Bob

**Done.** Charter step 1 (inventory) to a first cut, step 2 (screen) provisionally, step 4's criteria as a draft. Files: `OPTIONS.md` (22 entries, screen, five families), `COMPARISON.md` (contexts, gates, 14 draft criteria, three ways to compare), `NOTES.md` (findings with sources; one research pass by a worker, sonnet at medium, read-only, 2026-10-16). Nothing tested yet; no session, credential or instance used.

**What the inventory found, in short.**
- Every option is four separate choices: *where Claude Code runs*, *whose credential*, *how long a process lives*, and *the call shape*. Two gains (a fewer-turn call shape; a warm process) are available on any host, so they are not credited to a host.
- After the screen, five families remain: (1) product-hosted on a held token (today, warm/per-run variants, other hosts); (2) Anthropic-hosted session with the product serving rows (routine fire; session driven by `--cloud`); (3) a runner on a machine the member or team owns, on its own sign-in, the product holding nothing (new; includes background sessions and, for Team/Enterprise, self-hosted environments); (4) the member's own Claude with Civicsmith as a connector or plugin (strong for chat; control for checks to be tested, since Claude does not support MCP sampling); (5) GitHub-hosted, scheduled checks only.
- Screened out, with reasons in `OPTIONS.md`: Remote Control and Cowork and Claude Tag as ways to *run checks* (no product control); Claude in Chrome; cloud-provider and federated credentials (billed API access, K3347's spirit — recorded, not proposed).
- One route is a question, not an option: Anthropic's approval ("Unless previously approved", AT-19), reached only through sales (AT-25). Whether to ask is Bob's; listed so it is weighed.
- New cost fact: Cloudflare bills container CPU on active use only and memory on provisioned size while running, so keeping a standard-1 warm costs about $0.036 an hour in memory (NOTES §2.5).

**For Bob (BOB to bring; P17).** Two things, both in the rendered page https://claude.ai/artifact/APQkn9goZZkxyi9kkt7VK4 :
1. **The criteria.** Accept, merge or drop the 14 (C1–C14; the charter's draft plus C7 plan reach, C11 accounting, C14 scale), and the four contexts (team / member × small / large).
2. **How to compare.** Options: A gates then weighted scores per context, with sensitivity (recommended); B must-have / nice-to-have; C pairwise ranking. Under A, Bob later sets the weights per context.

**Next, without waiting.** Step 3 on each family: documentation second pass for the pages not yet read whole, then cheap tests. First tests planned (`TESTS.md`): warm-process and per-run timing on a local copy (no credential); the connector served-loop control test with a scratch MCP server; the routine probe as designed (needs Bob's one act, already written up in `design-remote-routine.md` §5).

**Lane state.** Session `session_01YE7nwvJxdhu4Xc9nnb77MX`, branch `tranche/T49`, folder `build/plan/study-assistant-hosting/`.

## S2 · 2026-10-16 · the assistant lane (K3539): baseline walk planned

Read the charter's new section. The baseline walk is planned in `TESTS.md` ("Baseline walks"): B1 repeats WALK-085 r5's question in this lane's own project (`ASSISTANT baseline <date>`) so each deploy compares with r5's 29.5 min / 83 calls / $1.48 / no answer, and records instance size, cold start, timings, cost, correctness and what the member sees on the question page and in the dock; B2 measures the floor (one-passage question, one chat exchange if the dock has chat). **Not walking until BOB says round 6 is deployed.** Meanwhile the study continues (step 3).

## S3 · 2026-10-16 · K3540 folded

Bob's ruling folded in: method A with weights only where clear, and the 14 criteria and four contexts are the working set (`COMPARISON.md` status, §2, C12). Under K3540, no terms point remains in `OPTIONS.md`: option q (Anthropic approval) is withdrawn; the screen reasons for a, d, j and m no longer cite the register; C12 counts only a point confirmed against Anthropic's latest text, read live and quoted. The S1 page for Bob is updated to match. Step 3 continues: the local timing tests (H1/H2) are running.

## S4 · 2026-10-16 · baseline walk r6 (B1, B2) after fix round 6; H1/H2 results

Full report `walk-r6.md`, raw material `walk-r6/`; local timings `TESTS.md` "H1 and H2: results". Walk worker sonnet at medium; own project "ASSISTANT baseline 2026-10-16"; administrator only.

**standard-1 confirmed for the fresh run**: single-app GET version 4, vcpu 0.5, 4 GiB, rollout completed 16:42Z, 7 minutes before B1 opened; the run's container reached 491 MiB. B1 was a cold start (no instance running). Caveat: the applications *list* endpoint still showed v3/lite at 16:47Z (it lags).

| B1 | r5 | r6 |
|---|---|---|
| open → first model call | 2:35 | 1:56 |
| open → end | 29:33, finished | 32:19, **stopped at lease** (last model call 21:40) |
| ticks / calls | 37 / 83 | 35 / 88 |
| tokens / cost | 1,698,344 / $1.48 | 1,965,222 / **$2.50** |
| per call (total ÷ calls) [inf] | 19.2 s | 13.5 s |
| answer | none, false "nothing found" | **correct (18 days) composed, never written**; nothing reached the question |

B2 (one-passage question, warm): 6:58 open→end, 12 ticks, 35 calls, 701,476 tokens, $0.70, "completed", **nothing written** (9:30 am only in the run log). CPU over B1 ≈ 2% of a core: the time is model calls and passes, not the box. The dock has no chat (screens-inquiry: `airunopen`, `suggest`, `airunclose`), so no chat timing.

**Defects for BOB** (evidence in `walk-r6.md`):
- **N1 (high)** a skill-pack version published mid-run kills the run: resume refused `SKILL_VERSION_MISMATCH` (pack `…7b404bd9e7316499` at open, `…33edb5b26bf81250` later, no worker deploy between), lease lapsed, answer lost.
- **N4 (high)** a run can end "completed" with nothing for the member (B2).
- **N2 (medium-high)** the assistant read and cited records of another project (WALK-085's INFO-0005/0006, INQ-0002) as legs; B2 saw "24 docs / 13 captures in scope". Walked as administrator; whether a plain member's run does the same is not checked.
- **N3 (medium)** levels contradict each other on the same documents; pass 2 spent about 6 minutes on it.
- **N5 (medium)** model prose put into the `condition` field, cut at about 200 characters, turning a PRESENT finding into LOOKED_INDETERMINATE.
- **N6 (low)** the runner container stays running (≈372 MiB) after the run.
- r5: D1 fixed in code (not re-walked with a long name), D3 fixed (full ¶2 reached the model), D4/D5 not seen, D6 still present, D7 changed (cost higher, ends at lease); D2, D8, D9 not checked.

**Not possible.** (1) No screenshots: Chromium still fails `ERR_CERT_AUTHORITY_INVALID` on the direct path, which carries the "Egress Gateway SDS Issuing CA" chain; K3530's setup-script import put only the agent-proxy CA in `~/.pki/nssdb`. The fix is the environment's: import that egress-gateway CA too (Bob's act, as K3530). Not worked around. (2) Observability refused again (code 10000). (3) `$BIO_INSTANCE` reads `biosmoke7`, not a URL.

**Incidents (the walk worker's own, reported in full).** (a) Its first four node scripts (three sign-ins and reads, no writes) went through the agent proxy because `NODE_USE_ENV_PROXY=1` is set in this session; the rest went direct. (b) **One debug script printed the administrator's (`sparky`) sign-in answer, with its session token, into the worker's tool output** (this session's transcript only; no file, no commit; the token expires 2026-11-15). Its sign-out was refused by the permission check and not retried. **Action needed: end `sparky`'s sessions on biosmoke8** (Bob's or BOB's act).

**H1/H2 (local, fake model).** On standard-1 the Claude Code start is about 1–2 s a conversation (21.6 s on lite); pre-warm and one-process-per-run save about a second each; the call shape saves more: ending at the final tool removes one model turn (3.1 s at 3 s a turn; needs `interrupt()` then `close()`), a single-shot judge is one request. One process per run accumulates context (≈830 bytes and 9 messages per earlier conversation).

**Reading for the study.** With the box fixed, the run's time and cost now sit in the number of model calls and passes, and its failures in run control (N1, N4), none of which a different host changes. The baseline for the comparison is r6 B1/B2.

**Next step and successor's reading (end of S4; this session ends here, K3553).**
Read first, in order: `CHARTER.md` (with K3539's section), this `HANDOFF.md` (S1–S4), `TESTS.md` (plans and H1/H2 results), `walk-r6.md`; then `OPTIONS.md`, `COMPARISON.md`, `NOTES.md` as needed. Rulings to know: K3538, K3539, K3540 (no unconfirmed terms points; method A, weights only where clear), K3549 (overage: cheapest model, no speculative workers, no repeated walks), K3551 (test only what the release's focus journey needs; other comparison work waits for T50), K3553.
Next step, now (K3551): **only a re-walk of B1 after the fix round BOB names that addresses N1/N4** (the focus journey's "the assistant connected, a real investigation"), compared with r6 in `walk-r6.md`'s table, as administrator and, if BOB asks, once as a plain member (N2). Before it: the walk worker must clear `NODE_USE_ENV_PROXY` in its scripts' environment (go direct) and never print a sign-in answer. Screenshots need the egress-gateway CA added to the environment (S4, Bob's act); without it walk by ops as r6 did.
Waiting for T50: step 3 for the other families (H3 connector served-loop, H4 routine probe with Bob's one act, H5, H6), then scoring in `COMPARISON.md` with r6 as the baseline.
Open with BOB: end `sparky`'s sessions on biosmoke8 (S4 incident b). Leftovers on the instance, this lane's own project "ASSISTANT baseline 2026-10-16": runs `RUN-1efe27ab71508a74` (stopped) and `RUN-057d97eb40cae620` (finished), two documents, two questions; nothing deleted.

## S5 · 2026-10-16 · ladder r7 (K3558): step 1 passes, step 2 not provable from outside

Full evidence and diagnosis: `ladder-r7.md`. ASSISTANT-HOSTING #2 (sonnet, K3553), after round 7 (K3569).
- **Step 1 passes.** `op=agentpack` read three times on biosmoke8 (18:46:12Z, 18:46:13Z, and after a wizard "finish" was recorded, whose count did rise 0→1): byte-identical, `investigative-session@1+09001158eec54623`. N1's cause is gone (skills R50).
- **Step 2 stops the ladder.** standard-1 is confirmed (version 4, 0.5 vCPU, 4 GiB) and the CLI is signed in and reachable (two `op=ask` calls as the administrator got model output and 9 plane reads), but "one message answered intact, timed" cannot be shown: the runner has no door from outside (404 `UNKNOWN`; agent-worker 1042), its `conversation.runner` log is unreadable (Observability still refuses the lane's token, code 10000), and the only route in, `op=ask`, wraps three conversations. Both asks ended without an answer (101 s: `ANSWER_MALFORMED` summary null for a bare "OK"; 62 s: `ASK_BOUND_REACHED` turns after 9 reads for a question the record answers); not shown to be the runner's fault.
- **For BOB:** give this lane read access to the runner's logs (a Cloudflare token with Workers Observability · Read on account 20b533…7f72), or build a probe door that sends one frame to a runner and returns its frames with timings. Then steps 2–4 are climbable by logged request and answer. **N6 persists**: `member:admin` still running 2 h+ after the r6 walk.
- Not done: steps 3–9; no whole run (K3558). Leftover: one `finish` tally on the wizard "Set up and claim". No product code touched; no secret printed.

## S6 · 2026-10-16 · K3571 attempt: the tail reader was refused by the permission check

Tails on `agent-runner` and `agent-worker` opened fine (both `success: true`), but connecting a websocket client to them was denied by this session's permission check ("Credential Exploration"); I did not work around it, sent no ask, and **deleted both tails**. Step 2 is unproven; no later step started. **Needs BOB/Bob:** either allow that one act in this session (a Bash permission rule for running a Node websocket client against `wss://tail.developers.workers.dev/…`), or have BOB open the tails and read them from its session, with this lane sending the one `op=ask` at an agreed minute. `ladder-r7.md` has the detail.

## S7 · 2026-10-16 · ladder r7 (K3573): step 2 PASSES; step 3 not provable; F1 = ~40 s start before the CLI's first call

Evidence in `ladder-r7.md` ("Step 2, third attempt", "Step 3") and `ladder-r7-runner-telemetry.txt`. Read from Observability with the injected token; no new ask sent (the lines existed).
- **Step 2 passes.** Container `5648761356…` on standard-1; the CLI is signed in by subscription (every call to `api.anthropic.com` 200 under the oauth beta header); `conversation.runner` lines (container stdout, under the id `a0341573…`, not `agent-runner`): ask 1 #1 `ok` 48,584 ms, 3 turns; #2 `ok` 49,964 ms, 4 turns; ask 2 `failed`/`CLOSED` 60,062 ms (the ask layer closed it at its turns bound). 17 model calls, all 200, 0.6–1.9 s, bodies 51–125 KB.
- **F1 (for BOB, to diagnosis; not mine to fix):** each conversation spends **~40 s (41.6, 40.5, 40.4) before the CLI's first outbound call**, on a warm container; H1 measured 1–2 s. Model time after it is 3–9 s. So ~81 of ask 1's 101 s is runner start-up in two conversations. Nothing in the logs says where; the container writes no line between accept and first egress. F2: the websocket stays open 25–35 s after the conversation's end; N6 stands (`activity_expired` fires every 2 min and the container is renewed).
- **Step 3 not proven: no log holds a tool call and its answer.** The plane has no telemetry (0 events), agent-worker logs only `POST /ask`, no op exposes the read log. Stream shows 9 `read` frames; body growth (largest +24.7 KB) is inference only. Needs, BOB's choice: plane Workers logs on, or an op returning the ask's read log, or take step 4's `airunlog` (costs a run).
- Ladder stops at step 3. Not started: 4–9. No product code touched; no secret printed; no tails left open.
