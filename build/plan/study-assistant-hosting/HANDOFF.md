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

## S8 · 2026-10-16 · the runner layer (K3574, K3575): where the ~40 s sits, what was ruled out, what is unknown

Wording note (K3574): S5–S7's headlines read "passes / not proven"; in observation terms, S5: the pack's `version` held across three reads and a finished script (observed); the runner then had no door and no readable log. S6: a log reader on the tails was refused by the session's permission check (nothing measured). S7: the container's own lines, the subscription sign-in and 17 model calls were seen; the tool-call layer has no log. `ladder-r7.md` headings are reworded in its last section. Evidence: `ladder-r7.md` ("The runner layer, read as an investigation"), `ladder-r7-runner-telemetry.txt`, `ladder-r7-runner-cpu.txt`.
- **F1 localised, not explained.** In three conversations (warm container) the gap from the runner's accept to the CLI's first outbound call was 41.6, 40.5 and 40.4 s. It is a wait: the container used 6.9 CPU-s in total over the three (0.5 vCPU would allow ≈ 20 CPU-s for one such start), and H1 measured the same code at 2.03 s.
- **Ruled out by logged evidence/code:** CPU-bound start at 0.5 vCPU; the sign-in check (no `platform.claude.com` call, token in the environment); an MCP connection to the plane (the relay is in-process; none exists); container cold start (warm, same on repetition); model or plane latency (the gap ends before the first call). 
- **Left standing:** a connection to a host outside the two allowed ones, waiting for a timer (not logged: `runner.egress` writes allowed hosts only). Unknown: which host, which timer. Nothing in the container writes a line during the 41 s.
- **No new ask sent:** it would give a fourth repetition of the same lines. To see inside the interval the runner would have to log its stages and the CLI's stderr with debug on for one conversation: a product change (BOB's). Until then the value of a warm process or an open-egress host (OPTIONS) cannot be priced.
- Step 3 (tool call and answer) waits for Workers Logs on the plane (K3575). Nothing sent to the instance this time except reads; no tails; no secret printed.

## S9 · 2026-10-16 · the tool-call layer from the plane's own lines (K3577)

`ladder-r7.md` ("The tool-call layer"), `ladder-r7-ask3-plane.txt`. One new ask (ask 3, 68.6 s, same question as ask 2), plane Workers Logs on.
- **Observed:** nine plane reads under the ask's grant, all 200, 18–385 ms at the Store (one `entitybyalias` took 2,831 ms); the pack read once at the start. From a plane request to the model's next call: 1.8 s (plane 0.08 s); per turn about 1.6 s model plus 1.4 s relay and CLI. Request bodies grow 51,428 → 83,608 B over eight model calls, 1.4–10.3 KB a turn (no plane response size is logged, so tool-answer size is inferred from this).
- **Repeated:** the CLI's first two requests are byte-identical to ask 2's (51,428 and 59,653 B); the ~40 s start again (41.3 s, the fourth time: 41.6, 40.5, 40.4, 41.3); the same ending (`ASK_BOUND_REACHED` on turns, no answer, 62.0 then 68.6 s). The model's route through the reads differs between the two.
- **Not known:** why the answer in the record is not reached inside the turn bound (the ask's layer); the second `explore` frame has no plane line; the size of each answer; the F1 interval.
- **Tradeoff for OPTIONS/COMPARISON:** the plane is not where the time goes; per-conversation start (F1) and per-turn relay (1.4 s) are what a host can change. Next on the ladder (segments, K3558 step 4) needs a run; BOB names when.

## S10 · 2026-10-16 · K3583 (A): F1 against the refused-egress line; ready for K3582's cells

`ladder-r7.md` ("F1 against round 8's instrument"). One ask (ask 4, 62.0 s; same question), run on the new Worker (`8fc20b15…`, confirmed in the events). **`runner.egress.refused`: 0 lines.** The gap from accept to the CLI's first call: **40.9 s** (5th time: 41.6, 40.5, 40.4, 41.3, 40.9). So no request to a refused host reached the proxy in that time: the proxy-visible refused-host timer is excluded; what remains is a wait that never reaches the proxy (a lookup or connection dropped inside the container's network, or time inside the process or platform). With K3584's cloud probe (4.6 s with the same Claude Code) the wait is in what the container adds around it. Unknown: which of those.
- **(B) Ready for K3582's cells.** Order I propose (one ask per cell, each read from the same lines): (1) cold standard-1 (BOB stops the running `member:admin` instance; I ask once); (2) warm standard-1 (second ask, same instance); (3) BOB sets standard-4 and stops instances; cold ask; warm ask; (4) BOB sets back standard-1, reads the application back. **Tell me by a doorbell when each Cloudflare act is done.** Cell 1 is ready now: BOB may stop the instance when ready.
- **(C)** The remote series (K3584) is started by me now; results to `TESTS.md`/`COMPARISON.md` and S11+.

## S11 · 2026-10-16 · K3585: Claude Code remote first: creation, message, tool call, length, context, failures (haiku, BOB's account)

`TESTS.md` "Remote series" (parts 1 and 2), `COMPARISON.md` §6. All sessions archived; the routine's two fired sessions archived.
- **Creation and start (n=2+1):** 18.05, 6.05 s (BOB's: 4.6 s) to the first answer; the 12 s difference is a wait inside the session before the turn (`startup_wait` 12.7 s against 0.3 s). **A message to a live session: 2.8 and 3.0 s.** A routine per question: 8.1 s (sonnet, default, $0.052) and 7.1 s (haiku); not a warm spare.
- **A tool call reaching biosmoke8 from the session:** works (public `op=bootstrap`, answered `0.85.0` both times); 13.0 and 18.3 s from creation. **Run length:** 20 sequential calls 72 s, 40 calls 125.5 s: a flat 3.0–3.2 s a call, context cache-read 62→70 k tokens; the plane logged 54 of the 60 requests (6 unaccounted for).
- **With the repository attached:** 227.7 and 249.1 s (clone 34 s, then this repository's `SessionStart` hook ran about 150–170 s before the first turn). A session without a repository does not pay it.
- **Context and failures:** the second message sees the first; archived then unarchived: new sandbox, back in about 15 s with history; `session_inactive` error while archived; the account runs on overage and is served.
- **Not done, and what each needs (for BOB, plain steps to Bob where he must act):** (1) a session calling an op that needs a credential (a token must be held by the session; K3556 makes a biosmoke8 dev token fair to use if BOB says so); (2) the composite route `claude -p … --cloud` (needs a claude.ai login in a container that runs it; Bob's act, as K3537); (3) e, self-hosted environments (Team/Enterprise only; plan unknown); (4) concurrency limit (several sessions at once) and a run longer than 2 minutes; (5) the F1 local ask and K3582's size cells, which wait on BOB's Cloudflare acts.

## S12 · 2026-10-16 · K3593: concurrency and a long run; the account hit its monthly spend limit at 19:59Z

`TESTS.md` "Remote series, part 3". All probe sessions archived; no tails, no routines left running (the two probe-c sessions archived earlier; trigger `trig_01HmGTerSNAVkG4uJeE82xt9` (the routine, poke-only) still exists: delete it when no more fires are wanted).
- **(4) Concurrency A: 6 sessions within 4 s, all answered in 7.5–8.8 s** (7 live, with the long run); no queueing, no refusals. **Concurrency B (10 at once, repeat) and the long run could not finish: at about 19:59:19Z every session failed with "You've hit your monthly spend limit · raise it at claude.ai/settings/usage … your weekly limit resets 11am (UTC)"; `isUsingOverage` read `false`.** I did not retry (nothing more is spent; no work around). The long run reached 4 min 49 s at a flat 18.6 s a call (13 logged plane requests, two gaps with a missing line) before the cut.
- **(1) A probe session holding a credential: not run.** The creating call with the test member's token in the prompt was refused by this session's permission check ("Credential Leakage") even with K3593's go-ahead; it needs the permission rule `mcp__claude-code-remote__create_session` (Bob's to add, or BOB's call whether to proceed another way).
- **NEEDS Bob (plain, one act):** raise the monthly spend limit at https://claude.ai/settings/usage (the message's own link) if more cloud-session measurements are wanted; the weekly limit resets 11am UTC. This also bears on every other session on the account (BOB's, jobs'), not only this lane's probes. I stop new cloud sessions and routine fires until told it is raised. Local cells (the F1 ask on biosmoke8, K3582's size cells) use the product's own subscription sign-in, not this limit, and wait only on BOB's Cloudflare acts.
- Still not done: a run over 10 minutes; concurrency B; a credential-holding session; the composite route and (e) (Bob's, in BOB's report).

## S13 · 2026-10-16 · K3593 resumed after the limit: concurrency C passes in numbers; the long run and the 10-at-once repeat were refused by the permission check

`TESTS.md` "Remote series, part 4". All probe sessions archived (none left running).
- **Observed:** concurrency C, 7 sessions within 5 s: 7.1–9.9 s each, all answered, none queued (with A: 6 sessions, 7.5–8.8 s). Two repetitions at 6–7 concurrent on one subscription give a steady start; nothing else on the account was loaded. The limit is lifted (`isUsingOverage` true again).
- **Refused by this session's permission check, not worked around:** the create call of the long run (40 × `sleep 15; curl`, 12 minutes), and 3 of the 10 concurrency creates ("Interfere With Workloads" / "Real-World Transactions"); the credentialed-op probe (token in the prompt, "Credential Leakage") also. **To run them, Bob must add the permission rule `mcp__claude-code-remote__create_session` for this lane** (his act in his settings), or BOB can say another way. Until then: no run over 10 minutes (the S12 cut at 4 min 49 s stands: a steady 18.6 s a call; that run was ended by the spend limit), no ten-at-once, no credentialed session.
- S12's "NEEDS Bob: raise the limit" is done (BOB #195). Left on the account: the routine `trig_01HmGTerSNAVkG4uJeE82xt9` (poke-only; delete when BOB says).

## S14 · 2026-10-16 · the credentialed probe: approved by Bob, still blocked at the token

Bob approved (in this session, 20:55Z) a probe cloud session holding a biosmoke8 test member's session token. Done: a fresh token for the test member `walker` was obtained by sign-in and checked (`op=whoami` → member `walker`, class member), never printed. **Not done:** the token has to be written into the probe session's prompt, which needs me to read it; this session's permission check refused the read twice ("Credential Materialization"), as it refused the creating call earlier ("Credential Leakage"). Not worked around. **To unblock (either):** Bob adds permission rules for `Bash(cat …/tok-member)` (the scratchpad file) and `mcp__claude-code-remote__create_session` in his settings; or BOB gives the probe session the test member's handle and password instead, in a way the check accepts. The probe is then one cloud session running `op=whoami` and `op=search&q=library` with `Authorization: Bearer <token>`, twice, timed.

## S15 · 2026-10-16 · K3582 size cells on standard-4 (done), credentialed cloud probe (done); full-dialogue cell (K3595) in progress

`TESTS.md` "Container size cells" and "A cloud session that holds a credential".
- **standard-4 (application v5, 4 vCPU, 12 GiB): the wait before the CLI's first call is 41.4 s (first ask) and 40.4 s (second)** against 40.4–41.6 s on standard-1 in five conversations: **size does not change it.** "Cold" was not demonstrated (no `runner.lifecycle` start line in 20:50–21:02Z). New finding N7: after a conversation is closed (`CLOSED`) the CLI keeps calling the model: five more `POST /v1/messages` over 24 s after the first ask's close (one extra after the close in asks 2 and 3).
- **BOB: roll back to standard-1 when you are ready; the standard-1 cold and warm asks follow, from you.** (The standard-4 numbers are in; I need nothing more from the size.)
- **Credentialed cloud probe (BOB's way, no secret in a prompt): login 200 as `walker`, `whoami` and `search` 200, 0.7–2.6 s each, 30.8 s end to end; the plane's log shows the login and searches from the cloud session.**
- **Full-dialogue cell (K3595):** a session is open (`session_012K2Dm2b6LcZaGe77NuHxQN`) receiving the 212 KB text in parts; to say plainly in S16 what is proven and not.
