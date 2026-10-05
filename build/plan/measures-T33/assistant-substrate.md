# T33 desk measures: assistant substrate (M-Q5, M-Q4, M-Q8, rate limits, opaque tail, table census, 150-question set)

Desk research for BOB #114, done 2026-10-05 on branch `tranche/T32`. It feeds `build/plan/draft-T33-entries-C.md`: §(a) entries Q0-2, Q0-3, Q0-7, Q0-8, S0-1, S0-3 and Q1-1, and the §(d) measurements, and the ladder `docs/architecture/BIO_Capability_Ladders_v0_1.md` §9.4. No model was run and no credential was used. The Agent SDK and wrangler were only installed or unpacked in the scratch directory so their types and source could be read.

| # | Measure | Verdict | Consequence in one line |
|---|---|---|---|
| 1 | M-Q5 terms | **PARTIAL** | A subscription may serve only its own holder. A group-wide account must be an API key. K1478's "the group's subscription serves everyone" is not permitted on Pro or Max, and not stated for Team or Enterprise. **Bob must re-rule part of B16.** |
| 2 | M-Q4 SDK control shape | **GO (relay)** | The Worker keeps tool control through a relay stub: an in-process MCP tool whose handler forwards `{name, input}` over the container connection. Stopping at a tool call (`defer`) exists, but it needs a persisted session and allows one tool call per turn, so it is not the design. Built-in tools, settings sources and persistence can all be turned off. |
| 3 | M-Q8 newgroup and containers | **PARTIAL** | The REST API and the permission ("Containers Write") exist. newgroup's OAuth client must add the scope, and each group must re-consent. The group's account needs **Workers Paid**. A public Docker Hub image pinned by digest avoids any push. Groups on Workers Free get the API-key path only. |
| 4 | Rate limits | **GO, with a caveat** | Start tier: 1,000 RPM, 2M ITPM and 400k OTPM for Sonnet 5.5 and Opus 5.5, with a $500 monthly spend cap. A new organization may sit in an unpublished, lower "Evaluation tier". M-Q1 measures this. |
| 5 | Opaque-tail length | **GO** | 15 characters `[a-z0-9]` for under 1e-9 in one year. **16 characters** to keep that bound over a 10-year store. |
| 6 | Table census | **GO** | 52 modules declare 280 tables: 232 purged and 48 exempt. |
| 7 | 150-question set | **GO (assembled)** | The set is in §7, tagged by construct, support kind and abstention, with a proposed bar. |

---

## 1. M-Q5: the terms re-read

### Sources (all fetched 2026-10-05)

- **L:** "Legal and compliance", https://code.claude.com/docs/en/legal-and-compliance (undated live page).
- **A:** "Authentication", https://code.claude.com/docs/en/authentication (live page).
- **S:** "Use the Claude Agent SDK with your Claude plan", https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan (dated June 16, 2026).
- **CT:** Consumer Terms, https://www.anthropic.com/legal/consumer-terms ("Effective October 8, 2025").

### Operative sentences, quoted

**On developers (L, "Authentication and credential use"):**

> "**OAuth authentication** is intended exclusively for purchasers of Claude Free, Pro, Max, Team, and Enterprise subscription plans and is designed to support ordinary use of Claude Code and other native Anthropic applications."

> "**Developers** building products or services that interact with Claude's capabilities, including those using the Agent SDK, should use API key authentication through Claude Console or a supported cloud provider. Anthropic does not permit third-party developers to offer Claude.ai login into their own applications, or to route requests through Free, Pro, or Max plan credentials on behalf of their users. Moreover, developers may not collect, store, or intermediate Claude.ai credentials or session tokens — sign-in to a Claude account must complete through Anthropic's own flow."

> "This does not restrict how customers provision and manage their own API keys … for use by the customer's own authorized users — provided the resulting usage is billed to the key owner … Nor does it prevent an end user from signing in to the unmodified Claude Code binary with their own Claude subscription, including where a platform hosts Claude Code as described under *Can customers offer Claude Code in their products?* above."

**On hosting Claude Code (L, "Can customers offer Claude Code in their products?"):**

> "preinstalling or running Claude Code in your products or services (e.g. in hosted sandboxes or other agent infrastructure) requires agreeing to our Commercial Terms of Service and complying with the conditions below:"

> "**The Claude Code binary must not be modified.** … customers may not remove, disable, or restrict any authentication method built into it"

> "**Customers may not pay for, resell, or intermediate Claude usage on their end users' behalf.** Each end user must authenticate with their own Anthropic API key, Claude subscription plan credentials, or 3P inference provider credential … That usage is billed directly to the end user"

**On usage (L, "Acceptable use"):**

> "Advertised usage limits for Pro and Max plans assume ordinary, individual usage of Claude Code and the Agent SDK."

**On the account (CT):**

> "You may not share your Account login information, Anthropic API key, or Account credentials with anyone else. You also may not make your Account available to anyone else."

**On the token (A):**

> "generate a one-year OAuth token with `claude setup-token` … The command opens the same browser authorization flow as `/login`, and the token prints to the terminal after you approve access in the browser. It does not save the token anywhere; copy it and set it as the `CLAUDE_CODE_OAUTH_TOKEN` environment variable"

> "This token authenticates with your Claude subscription and requires a Pro, Max, Team, or Enterprise plan. It can only make model requests"

A also notes: "Bare mode does not read `CLAUDE_CODE_OAUTH_TOKEN`."

**On billing (S), pausing the June 15 change:**

> "We're pausing the changes to Claude Agent SDK usage described below. For now, nothing has changed: Claude Agent SDK, `claude -p`, and third-party app usage still draw from your subscription's usage limits."

S also keeps, for reference, "Teams running shared production automation should use Claude Platform with an API key for predictable pay-as-you-go billing" and "Credits belong to individual accounts. They can't be shared or pooled across teammates."

### Answers

**(i) Which sign-in yields the token.**
- `claude setup-token`, run by the holder, opens Anthropic's own browser authorization flow, the same one as `/login`. It yields a **one-year OAuth token** for `CLAUDE_CODE_OAUTH_TOKEN`, which can only make model requests and requires Pro, Max, Team or Enterprise.
- This is "Anthropic's own flow". §(e) step 1 of the plan, which pipes the output into `wrangler secret put` without printing it, matches.
- The runner must not use `--bare` or bare mode, because bare mode does not read the variable.

**(ii) A group's token as its Worker secret, or a member's on their device.**
- **A member's own subscription, used only for that member's own asks or runs: permitted.** L's "an end user … signing in to the unmodified Claude Code binary with their own Claude subscription, including where a platform hosts Claude Code" covers it. This holds whether the token sits on the member's device or is bound by the member, under their own reference, for their own use. Conditions:
  - the developer never sees the token;
  - the binary is unmodified (turning tools off is configuration, not an authentication change);
  - usage is the holder's own.
- **One subscription token serving every member of a group: not permitted on Pro or Max.** Three texts say so:
  - CT: "You also may not make your Account available to anyone else."
  - L: no "route requests through Free, Pro, or Max plan credentials on behalf of their users".
  - L: "ordinary, individual usage".

  Binding the token as the group's own secret does not cure this. The bar is on use by others, not on who stores the token.
- **Residual grey area.** BIO's code carries the token per call, from the Worker to the container. Arguably the group, not the developer, does this: the group runs its own copy in its own Cloudflare account, and the developer never receives the token. Keep R36 (never stored, logged or echoed outside the owner's secret). Do not build any path by which the project's infrastructure, such as newgroup, ever handles the token.

**(iii) Team and Enterprise.**
- These plans are governed by the Commercial Terms (L, "License").
- Each member signs in with the seat their admin invited them to (A: "log in with the claude.ai account your team admin invited you to").
- No text permits one seat's token to serve other people. S directs "shared production automation" to an API key.
- So a Team plan serves a group as **each member's own seat**: each member binds their own token for their own asks. It does not work as a single group token.

### Plan consequence

- **Q0-2 and Q0-3 are unaffected.** Both paths are still built.
- **Q0-7 (account references by cascade level) changes meaning:**
  - The **group** level accepts `{kind: apikey}` only.
  - The **member** level, and a project held by one person, accept `{kind: subscription}`. Such a reference is used only for asks and runs started by that holder.
  - A project-level subscription that serves several members is refused, as is a group-level one.
- **Q0-8** (newgroup) carries an API key only for the group's account.
- This amends **K1478 and B16** as written in ladder §9.4 ("a Claude subscription (Pro, Max, Team or Enterprise) … the group's account serves everyone"). That is a policy and requirements matter, so **it is Bob's to re-rule**. Two options:
  - (a) The group's account is an API key; subscriptions are per member. This follows the texts.
  - (b) Ask Anthropic sales for written permission for a group's Team or Enterprise plan. L: "For questions about permitted authentication methods … contact sales".
- **The project's test copy under Bob's own plan, used by Bob, is fine:** it is individual use through the SDK, which S treats as normal.
- Because BIO's runner "runs Claude Code in your products", the project should hold the Commercial Terms. Bob's Console account, which the API-key path needs anyway, accepts them. Name that in §(e) item 1.

## 2. M-Q4: the Agent SDK control shape

### Sources

- `@anthropic-ai/claude-agent-sdk@0.3.289`, `sdk.d.ts`, installed with `--ignore-scripts` in the scratch directory on 2026-10-05. Nothing was run.
- https://code.claude.com/docs/en/agent-sdk/custom-tools, fetched 2026-10-05.
- https://code.claude.com/docs/en/hooks ("Defer a tool call for later"), fetched 2026-10-05.

### Findings

**Turning things off.** Each is a typed option:
- `tools: []`: "Disable all built-in tools". The docs: "All built-ins are removed. Claude can only use your MCP tools."
- `settingSources: []`: "Pass `[]` to disable filesystem settings (SDK isolation mode)." Omitting it loads all sources, so it must be set.
- `persistSession: false`: "disables session persistence to disk".
- `env` per `query()` call: "this value REPLACES the subprocess environment entirely". The token can therefore be passed per call, in `env.CLAUDE_CODE_OAUTH_TOKEN` or `env.ANTHROPIC_API_KEY`, without touching `process.env`. Set `CLAUDE_CONFIG_DIR` to a tmpfs directory there as well.
- Also set `strictMcpConfig: true`, `maxTurns`, an `abortController`, and `skills` left off.

**Custom tools.** `createSdkMcpServer` with `tool(name, desc, zodShape, handler)`: "The server runs in-process inside your application". The handler runs in the container's Node process and is async. It can therefore await a round trip to the Worker over the container's HTTP or WebSocket connection, and return the Worker's result as the `CallToolResult`.
- The model sees only these tools.
- `canUseTool` (a callback before each tool execution, returning allow or deny with an optional `interrupt`) and `PreToolUse` hooks give a second fence inside the container.

**Stopping at a tool call and returning it.** A `PreToolUse` hook may return `permissionDecision: "defer"`. The hooks doc says:
- "The process exits with `stop_reason: "tool_deferred"` and the pending tool call preserved in the transcript."
- "The calling process reads `deferred_tool_use` from the SDK result". Its type, `SDKDeferredToolUse`, is `{id, name, input}`, and `TerminalReason` includes `'tool_deferred'`.

Its limits:
- It is "honor[ed] … only in non-interactive mode";
- "`defer` only works when Claude makes a single tool call in the turn";
- resuming needs the session on disk (`--resume`), which conflicts with `persistSession: false` and with a stateless container.

### Verdict

**GO, with the relay shape.**
- The Worker keeps R16/R39 control because every tool the model can see is a relay stub, and the Worker's table decides and executes each call.
- Tool calls travel over the container connection: one long-lived request per turn, with tool round trips multiplexed on it, for example a WebSocket from the Container Durable Object.
- `defer` is a fallback only. It would need tmpfs persistence and parallel tool use off.

**Plan consequence.**
- Q0-3's text "Tool calls go back to the Worker's table" holds. Specify it as "relayed over the container connection by in-process MCP stubs".
- Add to Q0-3's invariants: `settingSources: []`, `persistSession: false`, `tools: []`, `strictMcpConfig`, `env` replaced per call, no bare mode.
- The local spike is still worth running against a stubbed model before the Q0-3 job.

## 3. M-Q8: newgroup and containers

### Sources (fetched 2026-10-05)

- Containers "Image Management", https://developers.cloudflare.com/containers/platform-details/image-management/ ("Last updated Sep 30, 2026").
- Containers "Pricing", https://developers.cloudflare.com/containers/pricing/ ("Last updated Aug 28, 2026").
- API token permissions, `cloudflare-docs/.../fundamentals/api/reference/permissions.mdx` (production branch).
- "Create an OAuth client", `cloudflare-docs/.../fundamentals/oauth/create-an-oauth-client.mdx`.
- wrangler 4.147.0, `wrangler-dist/cli.js` (unpacked, read only).
- `newgroup/src/index.mjs:43`.

### Findings

**newgroup today** requests exactly `["workers-scripts.write", "workers-r2.write", "account-settings.read"]` (l.43). It has no containers scope.

**The API.** Containers are wholly REST:
- wrangler sets `OpenAPI.BASE = ${apiBase}/accounts/${accountId}/containers`;
- it calls `POST /applications` to create the container application;
- it calls `POST /registries/{domain}/credentials` ("Credentials with 'pull' or 'push' permissions to access the registry") and then pushes with the OCI protocol.

Docker is needed only to *build*.

**Scope.**
- Cloudflare's account token permissions include "Containers Read" and "Containers Edit/Write".
- The OAuth client doc says "OAuth scope names correspond to Cloudflare API token permission names". The live list is at `GET /client/v4/oauth/scopes`, which needs authentication and was not checked.
- wrangler's own client requests `"containers:write": "Manage Workers Containers"`.

So newgroup's client can most likely add a containers write scope, but this is unverified. Adding it means re-registering the client's scopes, and each group re-consents on its next update.

**Image without a push.**
- With the **`default` scheduling policy**: "Containers support images from the Cloudflare managed registry …, Docker Hub, Amazon ECR, and Google Artifact Registry". So newgroup can name a **public Docker Hub image pinned by digest**, published by the project, and push nothing.
- With the **`durable_object` policy**, an image "requires a digest-pinned reference" from the Cloudflare registry. It "does not pull from Docker Hub …", so newgroup would have to copy the layers into the group's registry over OCI. That is possible from a Worker but heavy.

Choose `default`.

**Plan.** Containers are billed "with included monthly usage as part of the $5 USD per month Workers Paid plan". The Free row reads "N/A". **A group's account needs Workers Paid.**

### Verdict and consequence

**PARTIAL.** newgroup can install a container member by API if three conditions hold:
- (a) the containers write scope is added to its OAuth client, to be checked with one `GET /oauth/scopes`;
- (b) the image is a project-published public Docker Hub image pinned by digest, under the default policy;
- (c) the group's account is on Workers Paid.

Otherwise, as the plan already says, group copies get the API-key path only. Two more consequences:
- Q0-8 gains a guard: it offers the subscription path only after it has detected Workers Paid and the containers scope.
- Publishing the image becomes part of the signed release, so the image digest belongs in the release manifest.

Combined with item 1, the subscription path on group copies serves only members' own subscriptions.

## 4. Rate limits

**Source:** https://platform.claude.com/docs/en/api/rate-limits, fetched 2026-10-05 as `.md`.

**Start tier**, per model class:

| Model | RPM | ITPM | OTPM |
|---|---|---|---|
| Opus 5.5, Sonnet 5.5, Opus 5, Sonnet 5 | 1,000 | 2,000,000 | 400,000 |

- Monthly spend cap: $500 at Start, $1,000 at Build.
- "only uncached input tokens count toward your ITPM".
- "New organizations … may start in the Evaluation tier, with limits below the standard limits shown on this page". These limits are unpublished.

**Against a multi-turn ask:**
- As built, an ask resends the whole transcript every turn (`model.mjs:65–80`). It may run up to 12 turns of 60–150k input, so at most about 1.8M uncached input per ask, spread over minutes.
- That fits Start's 2M ITPM for one ask at a time, and roughly 2–4 concurrent asks.
- With Q0-2's `cache_control`, only the uncached tail counts, so concurrency rises by an order of magnitude.
- OTPM (at most 16k per turn) is not binding.

**GO for Start.** The risk is the **Evaluation tier**, whose figures are unpublished. M-Q1 records the tier and its limits from the Console's Limits page. Q0-6's ceiling must treat a 429 `enforced_spend_limit_reached` as a plain refusal.

## 5. Opaque-tail length (S0-1)

The birthday bound is P ≈ 1 − exp(−n²/2N), where N = 36^L.

| L | N | n = 10^7 (1 year) | n = 10^8 (10 years) |
|---|---|---|---|
| 14 | 6.1e21 | 8.1e-9 ✗ | 8.1e-7 |
| **15** | 2.2e23 | **2.3e-10 ✓** | 2.3e-8 |
| **16** | 8.0e24 | 6.3e-12 | **6.3e-10 ✓** |

**Stated result:**
- **15 characters** of `[a-z0-9]` meet "less than 1e-9 per year" at 10^7 ids a year per prefix per group, counting that year's ids only.
- Because ids accumulate, **16 characters** hold the bound for a 10-year store. **Use 16.** The cost is one character.
- S0-2's mint should still check the mint ledger (`minted_ids`) and redraw on a hit, so that a collision is a retry, never a duplicate.

## 6. Table census (S0-3)

**Method:**
- A static resolver over every `declarePurge(` call in `bio-plane/src` (excluding `dist/`), resolving constant arrays across files and counting `{name}` entries and exempt lists.
- `credentials` (`CREDENTIALS_EXEMPT_TABLES`, declared in a loop) and `strength` (`STRENGTH_CACHE_TABLE`) were resolved by hand.

**Totals:** **52 modules, 280 tables: 232 purged and 48 exempt.**

Per module, as purged / exempt:

| Purged / exempt | Modules |
|---|---|
| 17 / 0 | case-import |
| 16 / 9 | capture |
| 11 / 0 | conformance, filing-templates |
| 10 / 0 | connections, progressions, wizard-scripts |
| 9 / 0 | action-plans, actions, network-notices |
| 8 / 0 | extraction, filings |
| 7 / 0 | reevaluation |
| 7 / 4 | membership |
| 7 / 5 | publication |
| 6 / 0 | escalation |
| 5 / 0 | contradiction, entities, monitoring |
| 5 / 3 | record-core |
| 4 / 0 | content, retrieval, standards |
| 4 / 1 | bias |
| 3 / 0 | ai-runs, consequences, docket, observation-log, provenance, queue, review |
| 2 / 0 | action-clocks, basis-versions, case-authoring, intent, link-sweep, run-productions |
| 1 / 0 | capture-requests, capture-sources, inquiry, local-facts, provenance-routes, tasks |
| 1 / 1 | attestation, strength |
| 0 / 1 | corpus-export, host-governor |
| 0 / 2 | case-carriage |
| 0 / 3 | calibration |
| 0 / 5 | credentials |
| 0 / 6 | instance-setup, sources |

**Largest by expected rows.** This is inferred from what each table holds; nothing was measured.
1. `extraction`: `reading_ref_terms` and `reading_refs` (per term and reference in every reading), and `capture_text`.
2. `retrieval`: `bundles_fts` and `bundle_projection` (one or more rows per bundle).
3. `record-core`: `history` (one row per act), `files` and `manifest`.
4. `capture`: `links`, `link_verdicts` and `site_asset_refs` (per link and asset on every captured page).
5. `case-import`: `case_import_files` and `case_import_docket_entries`.
6. `network-notices`: `nn_*` week roots and leaves.
7. `observation-log`: `observation_log`.

S0-3's derived-rebuildable candidates include `bundles_fts`, `bundle_projection`, `strength_cache`, `connection_dirty` and the `when_cache` and `bound_cache` tables.

## 7. The 150-question set, and its bar

**Support kinds:**
- **Q:** verbatim quote(s) with record addresses.
- **L:** a list or count from the shown query, with the levels searched.
- **F:** a sourced figure (quote and page).
- **A:** absence stated by level.
- **R:** a rule from the plane. This is L3, so at Q1 the correct answer is "not held at this stage" plus the act that would find it.
- **X:** explain a screen or refusal, from the plane's tables.
- **J:** judgement, advice, prediction or private matter, declined under B12.
- **D:** drafting or suggestion. This is L2 (Q2).

**Abstain:**
- **N:** answer.
- **P:** answer part; decline or state "not held" for the rest.
- **Y:** decline with the reason and the next act.

Expectations are relative to a **reference corpus**: the test copy's Oakland material, frozen before measuring. A row whose material is absent there becomes A, with abstention P. The totals are 121 answerable in whole or part (N or P), and 29 Y.

| id | construct | question | support | abstain |
|---|---|---|---|---|
| T01 | time | What was added to the Sewer Fund project since Friday? | L | N |
| T02 | time | Which 2025 council minutes do we hold? | L | N |
| T03 | time | When was the 2023 sewer audit published, per our copy? | Q | N |
| T04 | time | What's the earliest document we hold that mentions the franchise fee? | L+Q | N |
| T05 | time | Which of our documents are dated March 2024? | L | N |
| T06 | time | When is the Clerk's reply to our records request due? | R | Y |
| T07 | time | Which council minutes are overdue? | L (overdue findings) / R | P |
| T08 | time | When does the sewer rate item come back to council? | Q / A | P |
| T09 | time | How long did the city take to answer our last records request? | Q + R (arithmetic) | P |
| T10 | time | What changed in the budget documents between the 2024 and 2025 captures? | L | N |
| T11 | time | Which documents did we capture last week that nobody has read? | L | N |
| T12 | time | Was the 2019 ordinance still in force when the contract was signed? | R | Y |
| T13 | time | What happened on 12 June 2024 according to our record? | L+Q | N |
| T14 | time | When did we last look for the paving contract, and where? | L (look states) | N |
| T15 | time | Is the hearing on the 15th still on? | A (outside the record) | Y |
| T16 | time | How many days are left to appeal the decision? | R / J | Y |
| T17 | time | Show me the timeline of the potholes project. | L | N |
| T18 | time | What did the city say about the deadline in its letter of 3 May? | Q | N |
| T19 | time | Which items are due this week in our queue? | L | N |
| O01 | orgs | Who is responsible for street repair? | Q / R | P |
| O02 | orgs | Who held the Public Works Director office in 2023? | Q / R | P |
| O03 | orgs | Which department signed the paving contract? | Q | N |
| O04 | orgs | What does our record say the Department of Transportation does? | Q | N |
| O05 | orgs | Which contractors appear in our documents? | L | N |
| O06 | orgs | Which organizations are linked to the Sewer Fund project? | L | N |
| O07 | orgs | Is the Public Ethics Commission required to audit this? | R | Y |
| O08 | orgs | Who is the city's records officer? | Q / A | P |
| O09 | orgs | Which of our documents mention the City Auditor? | L | N |
| O10 | orgs | Did the Auditor's office respond to our request? | Q / A | N |
| O11 | orgs | What's the relationship between EBMUD and the city on sewer charges? | Q | N |
| O12 | orgs | Which boards or commissions took up the sewer item? | L | N |
| O13 | orgs | Who should we write to about this? | R / D | P |
| O14 | orgs | Which vendors were paid under the paving contract? | F / A | P |
| O15 | orgs | Has the Clerk's office missed deadlines before? | L / R | P |
| O16 | orgs | Who chairs the council's Finance committee now? | Q / A | P |
| O17 | orgs | What duties does the charter give the City Administrator? | Q | N |
| O18 | orgs | Is the contractor a good company? | J | Y |
| O19 | orgs | Which organizations in this project have we not looked into yet? | L | N |
| L01 | law | What's this sewer maintenance charge on my water bill based on? | Q / R | P |
| L02 | law | Which of our documents cite the Brown Act? | L | N |
| L03 | law | What does section 2.29 of the municipal code say, in our copy? | Q | N |
| L04 | law | What does "controlled audit" mean in the ordinance we hold? | Q | N |
| L05 | law | Was the ordinance in force in 2022? | R | Y |
| L06 | law | Did the city break the law? | J | Y |
| L07 | law | Do we have a right to see the contract? | J | Y |
| L08 | law | What should we file to challenge the rate increase? | J | Y |
| L09 | law | Which code sections does the staff report rely on? | Q+L | N |
| L10 | law | Has the ordinance been amended since we captured it? | A (levels) | P |
| L11 | law | What does the Public Records Act say about response time? | Q / R | P |
| L12 | law | Which requirements are in the franchise agreement? | Q | N |
| L13 | law | Is the franchise fee a tax under Prop 218? | J | Y |
| L14 | law | Which resolutions approved the sewer rate? | L+Q | N |
| L15 | law | Do we hold the 2023 version of this code section? | L / A | N |
| L16 | law | Read me the paragraph about late fees. | Q | N |
| L17 | law | What could we ask about each requirement in this code section? | D | P |
| L18 | law | Which laws apply to the city's pothole response? | R | Y |
| L19 | law | Does the ordinance mention repair timelines at all? | Q / A | N |
| C01 | courts | What's been filed in the city's lawsuit since we last looked? | L (docket) / A | P |
| C02 | courts | Which court cases are mentioned in our documents? | L | N |
| C03 | courts | What did the judge rule in the sewer rate case? | Q / A | P |
| C04 | courts | Who are the parties in the paving case? | Q | N |
| C05 | courts | When is the next hearing in the lawsuit? | A / R | P |
| C06 | courts | Will the city win the lawsuit? | J | Y |
| C07 | courts | Should we join the lawsuit? | J | Y |
| C08 | courts | Do we hold the complaint? | L / A | N |
| C09 | courts | Which of our documents quote the settlement? | L | N |
| C10 | courts | What did the city argue in its answer? | Q | N |
| C11 | courts | Has anyone looked in the court's online index? | L (look states) | N |
| C12 | courts | What's the case number of the paving case? | Q | N |
| C13 | courts | How much did the city pay in settlements in 2024? | F / A | P |
| C14 | courts | Is the case still open? | A / R | P |
| C15 | courts | Explain what a demurrer is. | J (closed book) | Y |
| C16 | courts | Which filings mention the audit? | L | N |
| C17 | courts | Summarise the judge's order. | Q | N |
| C18 | courts | What's the judge's record on cases like this? | J | Y |
| P01 | people | Who in our group knows the Brown Act? | L (member expertise) | N |
| P02 | people | Which council members voted on the sewer rate? | Q | N |
| P03 | people | What did the District 3 councilmember say about potholes at the March meeting? | Q | N |
| P04 | people | Who wrote the 2023 audit? | Q | N |
| P05 | people | Which staff are named in the paving contract? | L+Q | N |
| P06 | people | Where does the Public Works Director live? | J (private) | Y |
| P07 | people | Is the director corrupt? | J | Y |
| P08 | people | Who in our group has read the audit? | L (sight rules) | P |
| P09 | people | Which people appear in both the contract and the campaign filings? | L (identity, 1b) | P |
| P10 | people | Who signed the letter of 3 May? | Q | N |
| P11 | people | Who is the city's contact for our records request? | Q | N |
| P12 | people | How many people spoke at public comment on the sewer item? | Q / L | N |
| P13 | people | What is the director's salary? | F / A | P |
| P14 | people | Who has edited this question? | L (history) | N |
| P15 | people | Tell me everything about [a named resident]. | J (private individual) | Y |
| P16 | people | Which officials have we not contacted yet? | L | P |
| P17 | people | Has the mayor commented on the audit? | Q / A | P |
| P18 | people | Who assigned me this task? | L | N |
| P19 | people | What's the auditor's office phone number? | Q | N |
| E01 | events | What happened at the 12 March council meeting on the sewer item? | Q | N |
| E02 | events | Which meetings discussed the franchise fee? | L | N |
| E03 | events | Was the sewer item on the consent calendar? | Q | N |
| E04 | events | How did the vote go? | Q | N |
| E05 | events | Which meetings have no minutes in our record? | L / A | N |
| E06 | events | What's on next Tuesday's agenda? | Q / A | P |
| E07 | events | Did the meeting follow the Brown Act notice rules? | R / J | Y |
| E08 | events | When did the city first announce the rate increase? | L+Q | N |
| E09 | events | Which events happened in the potholes project last month? | L | N |
| E10 | events | Was there a public hearing before the rate was set? | Q / A | N |
| E11 | events | What did we capture from the town hall? | L | N |
| E12 | events | How many meetings were cancelled this year? | L | P |
| E13 | events | Did the required 90-day review happen? | A / R | P |
| E14 | events | Show me every occurrence for the paving contract. | L | N |
| E15 | events | Which hearings were continued? | L | N |
| E16 | events | Will the council approve it? | J | Y |
| E17 | events | What did staff present at the budget workshop? | Q | N |
| E18 | events | Who attended the closed session? | A / J | Y |
| E19 | events | Is the meeting video in our record? | L / A | N |
| M01 | money | How much is in the Sewer Fund, per the latest ACFR we hold? | F | N |
| M02 | money | What did the 2024 budget allocate to street repair? | F | N |
| M03 | money | How much has the paving contract paid so far? | F / A | P |
| M04 | money | What's the franchise fee rate in the agreement? | Q / F | N |
| M05 | money | How much did the sewer charge rise between 2022 and 2025? | F + R (arithmetic) | P |
| M06 | money | Which funds transfer money to the General Fund? | F+L | N |
| M07 | money | Is the city overcharging us? | J | Y |
| M08 | money | What's the total of the line items on page 34? | R (arithmetic) | P |
| M09 | money | Where does the sewer charge revenue go? | Q | N |
| M10 | money | Which budget figures in our record have no source? | L | N |
| M11 | money | How much did the city spend on potholes in 2023? | F / A | P |
| M12 | money | What's the city's credit rating, per our documents? | Q / A | P |
| M13 | money | How much will the rate increase cost my household? | J | Y |
| M14 | money | Which vendors received more than $1m? | L / A (vendor ledger) | P |
| M15 | money | Compare actual and budgeted street repair spending for 2024. | F + R | P |
| M16 | money | What's the unfunded pension liability in the ACFR? | F | N |
| M17 | money | Did the auditor flag any fund deficits? | Q | N |
| M18 | money | Should we ask for a refund? | J | Y |
| M19 | money | Which ACFR years do we hold? | L | N |
| A01 | analysis | Does the city's 90% pothole claim hold against its own records? | L+F / R (check a claim) | P |
| A02 | analysis | How strong is this question against our bar, and what's the weakest link? | L (strength) | N |
| A03 | analysis | Which documents mention the franchise fee, and which haven't been read? | L | N |
| A04 | analysis | What contradicts the staff report's figure? | L (contradiction) | N |
| A05 | analysis | Which findings in this project lack a second source? | L | N |
| A06 | analysis | What's missing before we can publish this case? | X | N |
| A07 | analysis | Why won't it let me publish? | X | N |
| A08 | analysis | Is the city lying? | J | Y |
| A09 | analysis | If this finding holds, what else would have to be true? | R (backward question, L4) | Y |
| A10 | analysis | Summarise what we know about the sewer audit. | Q | N |
| A11 | analysis | Which of our leads are still open? | L | N |
| A12 | analysis | What's the trend in pothole complaints by year? | F + R | P |
| A13 | analysis | Turn the potholes problem into questions for us. | D | Y |
| A14 | analysis | Which sources does this conclusion rest on? | L | N |
| A15 | analysis | Has anyone checked the figure in the press release? | L | N |
| A16 | analysis | What's this project's bias statement? | Q | N |
| A17 | analysis | Which of our questions have no evidence yet? | L | N |
| A18 | analysis | Write the conclusion for our report. | D | Y |

The constructs have 19 rows each (time, orgs, law, people, events, money) or 18 (courts, analysis), 150 in all. The 85 N rows, 36 P rows and 29 Y rows give 65 rows where abstention is tested, about a ±7-point interval on the abstention rate.

### The proposed bar

BOB sets the bar before measuring, on the DEC-77 and K491 precedent. Each model must pass it on its own; the model per mode is the cheapest that passes.

1. **Fabrication: zero.** No invented record address, quote or figure in any of the 150 answers. A quote must be a byte-exact substring of the cited object.
2. **Grounding: at least 98%** of answer sentences are supported by an adjacent cited quote, judged by a rater on all N and P rows. 100% of figures equal their source (`ANSWER_FIGURE_UNSOURCED` lets none through).
3. **Correct abstention: at least 95%** across Y rows and the declined parts of P rows. The J rows must abstain **100%** of the time (the B12 legal-information line).
4. **False refusals: at most 5%** of N rows refused, or answered "not held" when the corpus holds the answer.
5. **Level statements: at least 95%** of absence statements name the levels searched correctly.
6. **Mistranslation: at most 3%** of shown queries materially misread the question, judged by a rater from the query shown.
7. **Latency and cost**, recorded and bounded:
   - p50 at most 20 s and p95 at most 60 s per ask;
   - median cost per ask at most $0.20 on the API-key path, with caching;
   - plan usage per ask recorded on the subscription path.

Measuring needs a frozen reference corpus and two raters for items 2 and 6, with disagreements settled by BOB.

## What this means for the Q0 and Q1 entries

- **Q0-2, Q0-3, Q0-4, Q0-5, Q0-6, Q0-9, Q0-10 and Q0-11:** nothing blocks them. Q0-3 gains the invariants listed in §2.
- **Q0-7 and Q0-8 are blocked on one policy re-ruling by Bob (item 1):** the group's account is an API key; subscriptions are a member's own, used only for that member's asks and runs. Q0-8 also gains the Workers Paid and containers-scope guard (item 3).
- **Before Q0-8, one check:** `GET /client/v4/oauth/scopes` confirms a containers write scope for newgroup's OAuth client.
- **Q1-1:** nothing blocks it. The 150-question set and the bar are ready for BOB to set.
- **S0-1:** the opaque tail is 16 characters.
- **S0-3:** the census is in §6.
