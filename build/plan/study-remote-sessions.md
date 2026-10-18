# Study: could the assistant run on Claude Code cloud sessions instead of the container? (BOB #192, read 2026-10-16)

Nothing in the product was changed; no cloud session was created or driven by this study, no credential used. Marks: **[doc]** documented (URL, read 2026-10-16), **[rep]** reported by others (source named), **[inf]** inferred, **[reg]** register entry in `build/terms/anthropic.md`. Today's design and its numbers are from `build/plan/study-assistant-link.md` (cited as "the link study"). API-key options are dropped per K3347.

## 0. Answer in short

**Question 1, settled: there is no supported route for a third-party product to create and drive Claude Code cloud sessions on a member's own subscription.** There are two documented ways to start or steer a cloud session from a script. Each is built for the member's own machine or CI, and each fails the product's needs in a named way (section 1). Nothing is missing from the search: the docs index, the cloud-session, routines, self-hosted, Remote Control, cross-session, GitHub Actions, Agent SDK hosting and sessions pages were all read. **[doc]**

1. **Start only, no read-back: routine `/fire`.** `POST https://api.anthropic.com/v1/claude_code/routines/{trig_...}/fire`, per-routine bearer token the member makes by hand in the web UI. Returns a session id and URL, never the output. [doc]
2. **Start, follow up, via the CLI, on a full-scope member login.** `claude -p "..." --environment <ccpool_id>` (self-hosted environments only, Team and Enterprise, public beta) to create, `claude -p "..." --cloud <session_id>` to send a follow-up. The credential needed is the member's claude.ai OAuth login with scope `user:sessions:claude_code`, which "is capped server-side at 30 days"; "There is no long-lived CI token for this today"; the one-year `setup-token` the product holds today "doesn't cover it". Reading the reply back is documented only through a Stop hook on your own runner. [doc]
3. **No sessions REST API, no SDK, no OAuth scope offered to third parties.** The routine page says the `/fire` endpoint "is available to claude.ai users only and is not part of the Claude Platform API surface" and "SDK support: None". [doc]
4. **Managed Agents needs a Claude API key.** Dropped (K3347). [doc]

**Verdict for BIO: not possible today without API keys, in a way that meets the product's needs.** Route 1 cannot return an answer and needs a hand-built routine per member. Route 2 would make the product hold each member's full claude.ai login and re-login every 30 days, which is the thing AT-17 says developers may not do ("collect, store, or intermediate Claude.ai credentials or session tokens"); Anthropic's own page offers only "Contact your Anthropic account team" for a non-human path. [doc, reg]

**The local alternative is documented and fits the goal** (section 5): one live Claude Code process per run (streaming input), `startup()` pre-warm, or resume. After the 1/2 vCPU change it saves a few seconds a conversation; it has catches.

## 1. Is there a supported programmatic way? (Q1, in full)

### 1a. The two documented routes

| # | Claim | Source | Mark |
|---|---|---|---|
| R1 | Cloud sessions start from browser, mobile, Desktop app, `claude --cloud`, and routines. No REST API for sessions is listed. | https://code.claude.com/docs/en/claude-code-on-the-web ; docs index https://code.claude.com/docs/llms.txt | doc |
| R2 | **Routine fire.** `POST https://api.anthropic.com/v1/claude_code/routines/{routine_id}/fire` (id prefixed `trig_`), headers `Authorization: Bearer sk-ant-oat01-...`, `anthropic-version: 2023-06-01`, body `{"text": "..."}` (optional, max 65,536 characters, wrapped as untrusted data). Reply `200 {"type":"routine_fire","claude_code_session_id":...,"claude_code_session_url":...}`. "It does not stream session output or wait for the session to complete." | https://platform.claude.com/docs/en/api/claude-code/routines-fire ; https://code.claude.com/docs/en/routines | doc |
| R3 | How a member authorizes it: on the web, create a routine (prompt, repositories, environment, connectors), edit it, "Add another trigger", choose API, "Generate token", copy it at once ("shown once"). "There is no public API for token management." The CLI cannot create tokens. Token scope: "One routine only; no read access." Generating a new token revokes the old one. Requires Pro, Max, Team or Enterprise with cloud sessions enabled. | routines-fire page; routines page | doc |
| R4 | Limits: 30 fires per hour per routine (shared with Run now), 100 API fires per hour per account; over the limit returns 429 with `Retry-After`; no overage. No idempotency key: a retry makes a second session. Status "Experimental"; shapes "might change". Billing: subscription usage. | routines-fire page; routines page | doc |
| R5 | The routine's prompt, repositories, connectors and environment are fixed when saved; a fire adds only `text`. Routines "belong to your individual claude.ai account" and act "as you". | routines page | doc |
| R6 | **CLI create into a self-hosted environment.** `claude -p "<prompt>" --environment <ccpool_...> [--ref <branch>] --output-format json` prints `{"ok":true,"session_id":...,"url":...}` and exits without waiting for the reply. Needs Claude Code v2.1.224+, a git checkout, and an environment an Owner enabled ("Allow self-hosted environments", Team and Enterprise, public beta, off by default; unavailable under ZDR or HIPAA) with a runner you operate. | https://code.claude.com/docs/en/self-hosted-environments-testing ; https://code.claude.com/docs/en/self-hosted-environments | doc |
| R7 | **CLI follow-up** to any cloud session, Anthropic-hosted or self-hosted: `claude -p "<message>" --cloud <session_id> --output-format json` queues one message and exits; it "does not wait for a reply"; archived sessions refuse. `claude --cloud "<task>"` with a description is "rejected" in non-interactive runs, so the CLI cannot create an Anthropic-hosted session non-interactively. | claude-code-on-the-web "Send follow-ups from the CLI"; self-hosted-environments-testing "`--environment` dispatch behavior" | doc |
| R8 | **Credential for R6 and R7:** "authenticate with a claude.ai OAuth token; API keys ... aren't accepted for either call." From `claude auth login`; the refresh grant "is capped at 30 days from the initial login", so re-run it interactively every 30 days. "There is no long-lived CI token for this today. The scope that grants cloud-session control, `user:sessions:claude_code`, is capped server-side at 30 days, so `claude setup-token`, which mints a one-year inference-only token, doesn't cover it." Ephemeral runners can use `CLAUDE_CODE_OAUTH_REFRESH_TOKEN` and `CLAUDE_CODE_OAUTH_SCOPES`, same 30-day cap. "Contact your Anthropic account team if you need a machine-identity path that isn't bound to a human account." | self-hosted-environments-testing "Authenticate from CI" | doc |
| R9 | **Reading the answer.** No API to read a session's messages is documented. The documented read-back is a Stop hook on a self-hosted runner that writes `last_assistant_message` to a file or POSTs it to your URL ("Remote test runners"). That needs the Team/Enterprise self-hosted setup in R6. For Anthropic-hosted sessions none is documented. | self-hosted-environments-testing | doc; absence for hosted is **inf** |
| R10 | `claude setup-token` / `CLAUDE_CODE_OAUTH_TOKEN` (what BIO holds, AT-22) "can only make model requests, so it can't establish Remote Control sessions or fetch claude.ai connectors"; Remote Control needs "a full-scope login token" from `claude auth login`. | https://code.claude.com/docs/en/authentication ; https://code.claude.com/docs/en/remote-control (troubleshooting) | doc |

### 1b. Routes checked and found not to be a route

| Candidate | Finding | Source | Mark |
|---|---|---|---|
| Cross-session messaging (a Claude session lists and messages your cloud sessions) | Only from a Claude Code session connected to Remote Control with a claude.ai full-scope sign-in: "Claude can't find those sessions with an API key". It is Claude-to-Claude, plain text, with approval controls; no HTTP interface. The session-management tools available inside this working session are not documented for outside use. | https://code.claude.com/docs/en/cross-session-messaging | doc |
| Remote Control server mode (`claude remote-control`, `--capacity` default 32) | Runs Claude on the member's own machine, driven from claude.ai or the app; needs the full-scope login (R10). Not a cloud session. | https://code.claude.com/docs/en/remote-control | doc |
| Claude Code GitHub Actions | Runs Claude Code on a GitHub runner, not a cloud session. Auth `CLAUDE_CODE_OAUTH_TOKEN` (setup-token) or API key. This is the same local pattern as BIO's runner. The page itself says an OAuth token "is tied to the subscription of the person who ran `claude setup-token`". | https://code.claude.com/docs/en/github-actions | doc |
| Agent SDK hosting | Describes self-hosting the SDK subprocess (BIO's pattern); the hosted alternative it names is Managed Agents. | https://code.claude.com/docs/en/agent-sdk/hosting | doc |
| Projects, Claude Tag, Slack | Interactive surfaces for the member; no third-party API. | docs index | doc (absence) |
| Reports from others | None found of a third party driving claude.ai/code sessions on a member's subscription. Routines `/fire` for CI and alerting is the documented use. | routines-fire page | doc |

### 1c. Why neither route fits BIO

- **Route 1 (fire):** answer cannot come back; the member must hand-build a routine and token (no API); one visible session per conversation; tool calls from the session back to BIO need a connector or open domain [inf]. Terms: the register does not cover it (section 4).
- **Route 2 (CLI):** the product would hold, per member, the credential the docs call a "full-scope session token", renewed by the member every 30 days, plus a Team/Enterprise self-hosted environment and runner (for read-back) that most group members will not have. A Pro or Max member cannot use `--environment` at all (R6). [doc]
- **Both:** unattended, scheduled use of a member's subscription is the open question U-5.

## 2. Managed Agents and other server-hosted offerings (Q2)

| # | Claim | Source | Mark |
|---|---|---|---|
| M1 | Claude Managed Agents (beta header `managed-agents-2026-04-01`): to start you need "A Claude API key". | https://platform.claude.com/docs/en/managed-agents/overview | doc |
| M2 | Max and Team plans' monthly API credits "cover ... Claude Managed Agents" (the credits pay for API-key use; they are not a sign-in path). | AT-23 [reg]; https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan | doc |
| M3 | Authentication methods on the Platform side are API keys and workload identity federation (search summary of https://platform.claude.com/docs/en/api/authentication/overview, not fetched whole). Neither is a member's subscription. | web search 2026-10-16 | rep (secondary) |
| M4 | Managed Agents: not eligible for Zero Data Retention or HIPAA BAA. | overview page | doc |

**Verdict: needs an API key. Dropped.** Also dropped: the Agent SDK `ANTHROPIC_API_KEY` paths, and the routines `/fire` call when authorised by a Console key (it never is; it takes the routine token).

## 3. Remote sessions compared with today (Q3)

Today's numbers are from the link study: start-up about 27 s per conversation at 1/16 vCPU, about 2.7 s at 1/2 vCPU (now set), about 1.2 CPU-s each; about 10 conversations per pass; one new CLI process per conversation; `persistSession:false`; no context carried between conversations (each gets a re-rendered transcript).

| Aspect | Remote cloud session (routine fire) | Today (local process in container) |
|---|---|---|
| Start-up | Provisioning and clone observed here at about 20 s plus setup (BOB brief; **observed**). Docs: each session gets "a fresh virtual machine (VM) running Ubuntu 24.04"; a setup script is cached as a filesystem snapshot when it finishes in about five minutes, cache expires in about seven days, and caching "skip[s] the setup script step" but not VM provisioning or Claude Code launch. [doc: https://code.claude.com/docs/en/cloud-environments#environment-caching] "Retry after a minute, as capacity is provisioned on demand." [doc: claude-code-on-the-web "Session creation failed"] No published figure for provisioning time. | 2.7 s at 1/2 vCPU, 27 s at 1/16 [link study T2]. A single warm process: about 0 s per later conversation (section 5). |
| Per-turn latency | Same model API. Anthropic publishes no per-turn figure for cloud sessions. Extra hops: BIO to the fire endpoint (once), then the session must call BIO's tools back over the internet (a connector or allowed-domain HTTPS call) for every tool use, then BIO must receive the answer. [inf] | About 1.7 s per turn overhead at lite; much less at 1/2 vCPU [link study T2b]; tools relayed over an in-container WebSocket. |
| Closing turn | A cloud session is a full Claude Code session with its own system prompt and the routine's saved prompt; the extra turn after the final tool would remain unless the prompt or tool design stops it. [inf] | One extra model turn per conversation [link study]. |
| Context across conversations | Each `/fire` creates a new session: "Each successful request creates a new session. There is no idempotency key." Follow-ups to an existing session exist only through the CLI (R7, R8). A session's history is kept: reopening a session after VM reclaim restores "your conversation history". [doc: routines-fire; claude-code-on-the-web "Environment expired"] So context is preserved only within one session, and driving one session over many turns needs the CLI path whose auth is undocumented for our token. | None carried today; a live process or resume would add it (section 5). |
| Concurrency | No documented cap on concurrent cloud sessions. Parallel starts are normal ("each `--cloud` command creates its own cloud session that runs independently"). Cloud sessions "share rate limits with all other Claude and Claude Code usage within your account." Fire limits: 30 per routine per hour (shared with Run now), 100 API fires per account per hour. Scheduled runs 100/hour. [doc: routines page "Usage and limits"] About 10 conversations per pass fits, but several passes an hour across several checks could meet 30 per routine. [inf] | Serial by construction; one container per member [link study]. |
| Limits per subscription | Subscription usage draws as for interactive sessions; "None of these hourly limits has overage." Exact subscription caps are unpublished (link study D15). | Same subscription draw (AT-23, U-6). |
| Idle / durability | "After a few minutes without activity, a session's VM pauses with its files saved"; a paused VM "can later be reclaimed"; reopening provisions a fresh VM and restores conversation history, but not background work. Archived sessions cannot take messages. [doc: cloud-environments; claude-code-on-the-web] Durable history, not a durable process. | Container sleeps after 2 minutes idle (`sleepAfter`); no history kept (`persistSession:false`). |
| Cloudflare load | Lighter: no Cloudflare container CPU for the CLI. [inf] But BIO still needs a public endpoint for the session's tool calls and a place to receive results. | Container cost and size (instance type) as in the link study. |
| Member visibility | Every run is "a new session alongside your other sessions" in the member's claude.ai/code list, readable and shareable by the member (Pro/Max: Private or Public; Team: Private or Team). [doc: routines; claude-code-on-the-web "Share sessions"] About 10 sessions per pass would appear in the member's list. | None. |
| Setup the member must do | Create a routine, pick an environment, add BIO as a connector (or allow its domain), generate and hand over a token, one per routine; no API for any of it. [doc R3] | Sign-in flow already built (U-7). |

**Where the member's data goes (Q3 last part).**
- Local path: the record text goes to the Anthropic API from the container; the container holds it only for the conversation (`persistSession:false`, temp dir removed). [link study; code]
- Cloud path: the session VM holds the text it reads; "Anthropic stores the session transcript so you can return to the session later"; code and session data follow the account-type retention policy: Free/Pro/Max, 5 years if model-improvement use is allowed, 30 days if not; Team/Enterprise/API, 30 days; training on Pro/Max data when the setting is on. Outbound traffic from the VM goes through a security proxy for audit logging. Deleting a session removes its event data. Organizations with Zero Data Retention or HIPAA configuration cannot use cloud sessions. [doc: https://code.claude.com/docs/en/data-usage ; claude-code-on-the-web]
- The same retention policy applies to local Claude Code API use for the same account [doc: data-usage "Data retention"], so the difference is **the persistent, viewable, shareable session record and the VM**, not a new model-training exposure. [inf] A civic group's member may not expect their records to sit in a claude.ai session list; that is a UX and policy matter for Bob. [inf]

## 4. Terms (Q4)

The register has no entry on cloud sessions, routines, the `/fire` endpoint, or a third party holding a routine token. **The register does not cover it.** Entries that bear on the adjacent facts, quoted from the register, not paraphrased from memory:

- AT-16: "Anthropic does not permit third-party developers to offer Claude.ai login into their own applications, or to route requests through Free, Pro, or Max plan credentials on behalf of their users."
- AT-17: "developers may not collect, store, or intermediate Claude.ai credentials or session tokens — sign-in to a Claude account must complete through Anthropic's own flow." A routine token (`sk-ant-oat01-`) is not named there; whether it is a "session token" is not answered by the register. It would be unresolved, in the same family as U-2.
- Route 2 (section 1) needs the member's full-scope claude.ai login held by the product. That is squarely the subject of AT-17 ("collect, store, or intermediate Claude.ai credentials or session tokens") and AT-16 ("route requests through Free, Pro, or Max plan credentials on behalf of their users"); the register leaves open only whether the group's copy is "the developer" (U-2). Whether it is lawful is not for BOB to decide.
- AT-19: "Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK."
- AT-21: "OAuth authentication ... is designed to support ordinary use of Claude Code and other native Anthropic applications."
- AT-4 and U-5: Pro and Max limits "assume ordinary, individual usage"; unattended or scheduled calls on a member's subscription are unresolved. Routines are Anthropic's own documented unattended use (routines page: "run unattended") but that page is not in the register.
- AT-14, AT-15, AT-18 (local hosted binary, each end user on their own credential) are the entries that cover **today's** design; none of them describes a third-party product firing a member's routine. U-7 shows the register treats even the sign-in screen as a question for Anthropic (AT-25).

If Bob wants this option, the question for Anthropic is new and should be added to the register as an unresolved item (U-n): may a product hold a member's routine bearer token and fire it with record text on the member's behalf? BOB cannot answer it. [inf]

## 5. The local alternative: keep one Claude Code process alive (Q5)

| # | Claim | Source | Mark |
|---|---|---|---|
| L1 | Streaming input mode is "a persistent, interactive session ... a long lived process that takes in user input"; it queues messages, supports interrupt, and "maintain[s] conversation context across multiple turns naturally". It is "Recommended". | https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode | doc |
| L2 | Hosting guide, "Long-running sessions": "maps each active session to a long-lived query and the subprocess behind it." TypeScript: "use `streamInput()` to add turns to an active session. Call `startup()` to pre-warm subprocesses ahead of incoming traffic." One session = one subprocess. | https://code.claude.com/docs/en/agent-sdk/hosting | doc |
| L3 | `startup()` returns a `WarmQuery` whose `query(prompt)` "can only be called once per WarmQuery", so it saves spawn and initialise for one conversation per handle, then another must be started. `initializeTimeoutMs` default 60000. | https://code.claude.com/docs/en/agent-sdk/typescript#startup | doc |
| L4 | Session resume: `resume: <id>`, `continue: true`, `forkSession`. With `persistSession:false`, "Sessions cannot be resumed later". Transcripts are `~/.claude/projects/<cwd>/*.jsonl`, lost on container restart unless a `SessionStore` adapter mirrors them. Resume spawns a new process each time, so it keeps context but not the start-up saving. | https://code.claude.com/docs/en/agent-sdk/sessions ; hosting | doc |
| L5 | Cautions in the docs: "Memory growth over long sessions ... Cap session length or recycle subprocesses periodically"; "No top-level session timeout"; size for peak memory ("1 GiB RAM, 5 GiB disk, and 1 CPU per agent is a reasonable starting point"). Auto-compaction exists in Claude Code. | hosting page | doc |
| L6 | Hosting guide pattern "Multi-tenant isolation": per-tenant `cwd`, `settingSources: []`, `CLAUDE_CONFIG_DIR`, `CLAUDE_CODE_DISABLE_AUTO_MEMORY`. Our runner already uses `settingSources:[]` and a fresh dir per conversation; one shared process would give up the fresh dir. | hosting page; link study | doc + code |
| L7 | If a message generator throws, the TypeScript stream ends with "Claude Code process aborted by user" (a misleading message). | streaming page | doc |

**What it would save, given the link study's numbers.** Start-up is CPU-bound, about 1.2 CPU-s per conversation (T2c). At 1/16 vCPU that is 19 s before the first message, 27 s a conversation; at 1/2 vCPU (now set) about 1.9 s and 2.7 s; at 1 CPU about 0.8 s and 1.2 s. For about 10 conversations per pass:
- at the old lite size, about 190 s of start-up per pass avoided with one live process (but lite is gone);
- at 1/2 vCPU, about 19 s per pass (10 x 1.9 s), plus a smaller part of the 2.7 s that is process teardown and MCP setup; [inf from T2]
- `startup()` only saves the spawn for a conversation whose options are known in advance, once per handle; the link study already ranks it at about 1 s on a sized box (change 6). [doc L3; link study]

So **after the 1/2 vCPU change the saving is small, a few seconds per conversation, about 20-30 s a pass**, against the 80 s conversation time that is mostly model time. [inf] The big win was the instance size, which is done.

**Catches that matter for BIO** [inf unless marked]:
1. Different conversations need different system prompts, tools and `maxTurns` (parents vs level sub-sessions: Opus at medium vs Sonnet at low). Options are fixed per `query()` and per process; model can be switched with `setModel()` in streaming mode [doc], but the system prompt and the in-process MCP relay server are set at start. A live process would be one per contract kind, or per member per run.
2. Context preserved across conversations is a **cost and a risk**, not only a gain: later turns send everything earlier, grow tokens against the subscription limit (AT-4, U-5), and let one table row's text influence the next verdict. The study's pass design relies on independent judgements; a shared context would change the check's meaning (a Bob decision on what a check promises, as the link study says for the stop rule).
3. The extra closing turn after the final tool would still occur unless the worker ends the turn itself (`interrupt()` is available in streaming mode [doc L1]).
4. The container sleeps after 2 minutes idle (`sleepAfter`), so a "whole run" process dies if a run has gaps; the segment break every 10 minutes could cost a restart. [code in link study]
5. A crash or memory growth loses the in-memory context unless `persistSession` stays true plus a `SessionStore`; today's `persistSession:false` was a privacy choice (record text on disk). Turning it on writes transcripts of record text to the container disk. [doc L4; link study]
6. The sign-in token stays in the container as today (AT-22, U-2), no change to the terms position (AT-14, AT-15, AT-18).

## 6. Recommendation (for BOB; Bob decides only the parts reserved to him)

1. **Do not pursue remote cloud sessions.** There is no supported third-party route (section 0). The only no-API-key start is the experimental routine `/fire`, which cannot return an answer, needs the member to hand-build a routine and token with no API, creates a visible session per conversation, and is not covered by the terms register. It would be slower to start (about 20 s plus setup against 2.7 s) and would not preserve context across fires.
2. If Bob still wants it explored later, first add a new unresolved item to the register and put the question to Anthropic through Bob (AT-25 route), and test one routine by hand for latency and what a session can call back; both need Bob's account action.
3. Take the local alternative **only as a measured follow-up** after the instance-size change has run, using the runner's per-conversation `ms`: `startup()` pre-warm is the lowest-risk step (single use, no context sharing). A long-lived streaming process is worth a dry-run tranche only if start-up still shows at 1/2 vCPU, and only per contract kind, with the closing-turn change first.

## Sources read (2026-10-16)
- https://code.claude.com/docs/en/claude-code-on-the-web
- https://code.claude.com/docs/en/routines
- https://platform.claude.com/docs/en/api/claude-code/routines-fire
- https://code.claude.com/docs/en/cloud-environments
- https://code.claude.com/docs/en/self-hosted-environments and /self-hosted-environments-testing (CLI dispatch, credential scope, read-back)
- https://code.claude.com/docs/en/authentication ; /remote-control ; /cross-session-messaging ; /github-actions
- https://code.claude.com/docs/en/llms.txt (docs index, searched for any sessions API)
- https://code.claude.com/docs/en/data-usage
- https://platform.claude.com/docs/en/managed-agents/overview
- https://code.claude.com/docs/en/agent-sdk/hosting
- https://code.claude.com/docs/en/agent-sdk/sessions
- https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode
- https://code.claude.com/docs/en/agent-sdk/typescript (first 100,000 characters only: startup, WarmQuery, Query methods, Options rows)
- Web search for Managed Agents authentication (summary only; Okta, Zuplo and Platform docs mirrors)
- `build/terms/anthropic.md` and `build/plan/study-assistant-link.md` on `origin/tranche/T49`

Not reached: the rest of the TypeScript reference page; the Remote Control page was read by grep for requirements, not whole. Absence of a sessions REST API is inferred from the docs index and the pages read.
