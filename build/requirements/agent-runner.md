# agent-runner — requirements

**Status** · Reviewed (K1505; banner cleared K1599). New module and new fleet member (K617, K1439; `plan/draft-T33-plan.md` T33-56; entries C Q0-3; `measures-T33/assistant-substrate.md` §2 M-Q4 GO (relay), §3 M-Q8). Layer 6, after `agent-model`, before `agent-worker`. A container image: a Dockerfile and a Node entry over `@anthropic-ai/claude-agent-sdk`, which runs Claude Code unmodified as its own process (K1429, K1502). It is the only member with an npm dependency and a Node runtime. All requirements are new and not yet met (T33-56); its live start and reliability are measured after the release at T33's close (M-Q1, M-Q2; T33-D1).

**Size (P6).** About 300–500 lines (entries C P6 table).

## Public

### Purpose

The container in which a member's Claude subscription runs a model conversation for the plane's fleet: Claude Code, unmodified, with every built-in tool, settings source and disk persistence off, so the model sees only the tools the Worker relays and the Worker's table decides every call. It holds nothing between calls and reaches nothing but Anthropic's API and the connection it was called on.

### Provides

Terms. The **caller** is `agent-model`'s subscription provider, through the Container Durable Object. A **conversation request** is `{credential: {kind, secret}, model, system, prompt, tools: [{name, description, input_schema}], max_turns}`. A **relay** is `{tool_use: {id, name, input}}` sent to the caller, answered by `{tool_result: {id, content, is_error?}}`.

**The conversation** (one per connection)
- **R1** (K1502) For each conversation request it runs one Agent SDK query with Claude Code unmodified and not in bare mode, with built-in tools off (`tools: []`), no settings source (`settingSources: []`), no session persistence (`persistSession: false`), `strictMcpConfig: true`, no skills, and `maxTurns` set from `max_turns`; the options are checked by a test that captures them at the SDK boundary. *(not yet met: T33-56)*
- **R2** (K1429, K1502) The credential reaches Claude Code only in the environment of that one query, which replaces the process environment whole: `CLAUDE_CODE_OAUTH_TOKEN` for `kind: "subscription"`, `ANTHROPIC_API_KEY` for `kind: "apikey"`, with `CLAUDE_CONFIG_DIR` a fresh temporary directory removed when the query ends. A request with no credential, another `kind` or an empty secret answers `{ok: false, code: "NO_CREDENTIAL"}` and starts nothing. *(not yet met: T33-56)*
- **R3** (M-Q4 relay; K1474 (i)) The only tools the model can see are those the request names, each an in-process MCP tool whose handler sends a relay to the caller over the same connection and returns the caller's `tool_result` as the tool's result, unchanged. The runner performs no tool's effect itself. *(not yet met: T33-56)*
- **R4** The conversation's end is answered on the connection as `{ok: true, result, stop_reason, num_turns, usage}` with `usage` `{input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens, total_cost_usd}` as the SDK states them (`null` where it states none), or `{ok: false, code, detail}` (detail at most 300 characters) when the SDK errors, the caller's connection closes, or `max_turns` is reached (`code: "MAX_TURNS"`); a closed connection aborts the query. *(not yet met: T33-56)*

**`GET /version`**
- **R5** Answers 200 `{ok: true, name: "agent-runner", version}`, the version the image was built with. *(not yet met: T33-56)*

**Anything else**
- **R6** Any other path or method answers 404 `UNKNOWN`. *(not yet met: T33-56)*

**The fleet member**
- **R7** (M-Q8) The fleet manifest (`fleet-member.json`) names the image by a digest-pinned reference, its surface (R1–R5) and its build recipe, so an install names exactly one image. *(not yet met: T33-56)*

## Private

### Uses

None. It imports no module of this repository and reaches the plane only through its caller (R3).

### Invariants

- **R8** (K1429; `agent-worker` R36) It holds no credential: the secret arrives per request and is never written to disk, logged or echoed; no answer, relay, error or log line carries it. A test with a sentinel secret finds it in no output and no file under the image's writable paths after the query. *(not yet met: T33-56)*
- **R9** Nothing survives a conversation: no file is written outside its temporary directory (R2), which is gone when the query ends, and a second request on a fresh connection sees nothing of the first. *(not yet met: T33-56)*
- **R10** Its only egress is `api.anthropic.com`; it opens no other outbound connection, and reads no file, page or address a tool did not relay (the closed book, K1474 (i); the injection fence). *(not yet met: T33-56)*
- **R11** No place is named in its behaviour or outward text. *(not yet met: T33-56)*

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 QUESTIONS (the member's own reference; the group's copy binds no credential), §2 "Cross-cutting rulings" (the member's own account), §9.4 (Q0: the subscription path runs through the Agent SDK, Claude Code unmodified, built-in tools off, not bare mode, in a container; deploy the agent runner).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (the fleet member; K1502).
- `docs/architecture/BIO_Distribution_v0_1.md` §5 (the fleet member).
- DEC-55; K1429, K1474 (i), K1502, K1503.

### Suggestions

- **Files.** `agent-runner/Dockerfile`, `agent-runner/src/entry.mjs`, `agent-runner/package.json` with the SDK pinned to an exact version (0.3.289 was read for M-Q4), `fleet-member.json`. A Node test with a stubbed SDK `query` covers R1–R4 and R8–R9 offline.
- **Image placement (M-Q8).** A public Docker Hub image pinned by digest under the `default` scheduling policy lets newgroup install the member without a push; the digest goes in the signed release's manifest. The `durable_object` policy needs the Cloudflare registry. BOB's choice at the job; it changes R7's reference only.
- **R10's enforcement.** Express egress as the container's network configuration (an allow-list of one host) and test it by reading that configuration; the closed book is also held by R1 (no web tools).
- **Open for BOB.** (1) R2's `apikey` arm: T33-55 sends API-key turns to the Messages API directly, so the runner may serve `subscription` only; the draft keeps both (entries C Q0-3 names both variables) for M-Q1's comparison. (2) R4's error codes beyond `NO_CREDENTIAL` and `MAX_TURNS` are this draft's. (3) Whether `bundler` lists this member (plan, Choices settled: "a question its job's START names").
- **Not here.** The deployment, the image's first push and M-Q2 (start reliability) are the release's (T33-D1).
