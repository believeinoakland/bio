# Notes: findings with evidence (ASSISTANT-HOSTING)

Marks: **[doc]** official documentation (URL, read 2026-10-16), **[rep]** reported by others, **[test]** tested here, **[inf]** inferred. §1 points to what earlier studies established; §2 is the fresh research pass of 2026-10-16 (a worker, sonnet at medium, read-only; a few pages were summarised by a small model, so wording must be re-checked against the page before it is quoted in a ruling or the terms register). Statements about Anthropic's terms are made only in `build/terms/anthropic.md`'s words (K1762); where a page below is not in the register, that is said.

## 1. Established before this lane

- Today's path, its protocol and its measured costs: `build/plan/study-assistant-link.md` (T1–T3; start-up ≈1.2 CPU-s per conversation; 27 s at 1/16 vCPU, 2.7 s at 1/2; one closing model turn per conversation).
- Cloud sessions, routines, `--cloud`, self-hosted environments, Remote Control, Managed Agents: `build/plan/study-remote-sessions.md`.
- The routine-and-write-back design and its nine-run probe: `build/plan/design-remote-routine.md`.
- How this very session's cloud sessions are made (sessions service, `user:sessions:claude_code`), and a repo-less cloud session's first reply in ≈6 s: K3537.

## 2. Research pass, 2026-10-16

### 2.1 Civicsmith as a remote MCP connector (option g)
- **Plans.** Custom connectors on Free (one), Pro, Max, Team, Enterprise. Pro/Max add their own; on Team only Owners/Primary Owners add them; Enterprise Owners and roles with Libraries access. The server must be public; Anthropic connects from `160.79.104.0/21`. [doc] https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp
- **Surfaces.** Same connector infrastructure on claude.ai, Desktop, mobile, Cowork, Claude Code. [doc] https://claude.com/docs/connectors/building/index.md. Projects support not confirmed. In Claude Code, claude.ai connectors load only under a claude.ai sign-in, not under `setup-token`. [doc] https://code.claude.com/docs/en/mcp ; https://code.claude.com/docs/en/authentication (AT-22 agrees)
- **Auth.** Per-user OAuth 2.0 (MCP auth specs 2025-03-26 / 06-18 / 11-25), DCR or CIMD, PKCE S256, callback `https://claude.ai/api/mcp/auth_callback`; no `client_credentials`. Static org-wide headers in beta for some orgs only. [doc] https://claude.com/docs/connectors/building/authentication.md. Fits K1874 (no credential in a URL) [inf].
- **Limits.** Tool result ≈150,000 characters on claude.ai/Desktop; Claude Code 25,000 tokens default (`MAX_MCP_OUTPUT_TOKENS`), files over 50,000 characters unless `_meta["anthropic/maxResultSizeChars"]` (ceiling 500,000), HTTP response 16 MiB; tool call timeout 240 s on claude.ai/Desktop. [doc] connectors building index; Claude Code mcp page
- **Can the server drive the steps?** Sampling: "Claude doesn't yet support … Sampling" [doc, building index]. Elicitation (form and URL) supported in Claude Code [doc, mcp page]; on claude.ai not documented. So the product cannot call the model from its side; it can only serve tools that refuse anything out of order (the served loop of `design-remote-routine.md` Option A). G2 would then hold for *what is recorded*, not for *whether the member's Claude keeps going* [inf]. To test.
- **MCP Apps.** Interactive `ui://` resources render on claude.ai, Desktop, mobile; not in Claude Code. [doc] https://claude.com/docs/connectors/building/mcp-apps/getting-started
- **Directory.** Optional listing via https://claude.ai/directory/manage (OAuth, tool annotations, privacy policy, test account); custom connectors need no review. [doc] https://claude.com/docs/connectors/building/submission

### 2.2 Plugins, Desktop Extensions, channels (options g′, g″, o)
- **Plugins** bundle skills, agents, hooks, MCP servers; distributed by folder, a git marketplace (private repo allowed) or Anthropic's directory; run in the member's own `claude` on their own sign-in; the Agent SDK can load plugins by path. [doc] https://code.claude.com/docs/en/plugins/publish ; https://code.claude.com/docs/en/agent-sdk/plugins
- **MCPB / Desktop Extensions**: a local stdio MCP server installed by double-click in Claude Desktop (macOS, Windows); directory listings deprecated, private distribution only. [doc] https://claude.com/docs/connectors/building/mcpb.md
- **Channels** (research preview): an MCP server that pushes events into a running local Claude Code session; needs claude.ai or Console sign-in; Team/Enterprise admins enable it; custom channels need an allowlist or a development flag. [doc] https://code.claude.com/docs/en/channels

### 2.3 Member-side runner (option j)
- The SDK and `claude -p` use whatever sign-in `claude` holds on that machine; unattended sessions stop when the login expires (AT-29). [doc] https://code.claude.com/docs/en/authentication
- **Agent view / background sessions** (research preview): `claude --bg "<prompt>"`, `claude agents --json --all`, `claude logs <id>`, `attach`, `respawn`, `stop`; a `Notification` hook fires on `agent_completed`; idle sessions stop after about an hour unless pinned; `--bg` cannot combine with `-p`. [doc] https://code.claude.com/docs/en/agent-view. A documented local surface a runner could use instead of the SDK [inf].
- No Anthropic guidance for a product's runner on a member's machine; the hosting page covers operator-run hosting only. [doc, absence]

### 2.4 Other offerings
- **No** sessions API, "Sign in with Claude", or third-party OAuth found; the Agent SDK overview's "Unless previously approved" (AT-19) has no documented application path; the legal page points to sales (AT-25). [doc, absence]
- **Cloud sessions** reported out of preview on 2026-09-23 [rep, search snippet, https://www.agent37.com/blog/claude-code-cloud]; unconfirmed. Plans: Pro, Max, Team, some Enterprise; org policy `allow_remote_sessions`. [doc] https://code.claude.com/docs/en/claude-code-on-the-web
- **Claude Tag** (Slack only; Team and Enterprise; public beta): channel work bills to an org usage balance; DMs run on the sender's own account; admins add connectors and plugins; no API for a third party to invoke it. [doc] https://claude.com/docs/claude-tag
- **Cowork** remote execution: member-started sessions on Anthropic's servers, connectors work, no developer API. [doc] https://support.claude.com/en/articles/15811196-what-to-expect-with-remote-execution-in-claude-cowork
- **Workload identity federation / cloud providers**: a short-lived Console service-account credential from an OIDC JWT, pay per token, needs a Console organization; disables claude.ai-sign-in features. [doc] https://platform.claude.com/docs/en/manage-claude/workload-identity-federation. A billed API credential in all but name [inf] (screened, OPTIONS m).

### 2.5 Cloudflare (options a, b, b′)
- **Container pricing**: CPU $0.000020 per vCPU-second, **active use only**; memory $0.0000025 per GiB-second **on provisioned size while running**; disk $0.00000007 per GB-second; 10 ms billing; Workers Paid. standard-1 = 1/2 vCPU, 4 GiB. [doc] https://developers.cloudflare.com/containers/pricing/
  - So a warm-but-idle standard-1 costs ≈ 4 × 0.0000025 × 3600 = **$0.036 an hour** (≈ $0.86 a day) in memory, CPU ≈ 0; a 1.2 CPU-s start-up costs ≈ $0.000024. [inf, arithmetic from the page]. Keeping warm (b′) is a memory bill, not a CPU bill.
- `sleepAfter` default 10 min; cold start "often 1-3 seconds"; disk ephemeral. [doc] https://developers.cloudflare.com/containers/platform-details/architecture/
- **Sandbox SDK** (`@cloudflare/sandbox`): long-running processes, streaming exec, persistent workspace. [doc] https://developers.cloudflare.com/sandbox/
- **Cloudflare's own Claude Code tutorial** runs `claude --print --output-format stream-json` in a Sandbox from a Durable Object, keeps it alive with a 60 s alarm, and authenticates through AI Gateway (key-based, so its auth is out of scope; the hosting pattern is a). First container start ≈ 1 minute in the tutorial. [doc] https://developers.cloudflare.com/sandbox/tutorials/claude-code/

### 2.6 Other hosts (option h)
- Anthropic's hosting page names no providers; criteria: cold start, storage, pricing, networking; "A minimally provisioned container runs roughly $0.05 per hour"; cookbook for Docker, Modal, Kubernetes; its auth section assumes an API key. [doc] https://code.claude.com/docs/en/agent-sdk/hosting
- Sandbox vendors (E2B, Daytona, Vercel Sandbox, Modal): sub-second create/resume, ≈$0.05–0.14 per vCPU-hour [rep, secondary benchmarks, unverified]. Against Cloudflare: no advantage in start-up once the CLI's own 1.2 CPU-s dominates; a second vendor for record text to pass through [inf].

### 2.7 Subscription limits
- Pro/Max: five-hour and weekly limits, shared across Claude and Claude Code; Max has a model-specific weekly limit. No published concurrency figure; no statement on automated use beyond "ordinary, individual usage" (AT-4). [doc] https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan
- Cloud sessions share the account's limits; ten parallel agents use quota about ten times as fast. [doc] agent-view; claude-code-on-the-web
- The pages named in §2.1–2.6 are **not in the terms register**; before any is relied on for a terms statement, it is added there as an AT entry.
