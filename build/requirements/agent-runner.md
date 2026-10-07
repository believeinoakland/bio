# agent-runner — requirements

**Status** · In force: reviewed (K1505; banner cleared K1599); a new module and fleet member (K617, K1439; T33-56). Last changed T35 (T35-49: R11, R12 amended; R15, R16 new); every requirement met (K1985). A member's own sign-in in their runner instance (N678's share) is not worded here: it is `next.md` N708 (K1922).

**Size (P6).** About 300–500 lines (entries C P6 table).

## Public

### Purpose

The container in which a member's Claude subscription runs a model conversation for the plane's fleet: Claude Code, unmodified, with every built-in tool, settings source and disk persistence off, so the model sees only the tools the Worker relays and the Worker's table decides every call. It holds nothing between calls and reaches nothing but Anthropic's API and the connection it was called on.

### Provides

Terms. The **caller** is `agent-model`'s subscription provider, through the Container Durable Object. A **conversation request** is `{credential: {kind, secret}, model, system, prompt, tools: [{name, description, input_schema}], max_turns}`. A **relay** is `{tool_use: {id, name, input}}` sent to the caller, answered by `{tool_result: {id, content, is_error?}}`. The **connection** is a WebSocket the caller opens with `fetch("https://agent-runner/conversation", {headers: {Upgrade: "websocket"}})`; its first message is the conversation request, and relays, results and the end (R4) travel on it (K1600).

**The conversation** (one per connection)
- **R1** (K1502) For each conversation request it runs one Agent SDK query with Claude Code unmodified and not in bare mode, with built-in tools off (`tools: []`), no settings source (`settingSources: []`), no session persistence (`persistSession: false`), `strictMcpConfig: true`, no skills, and `maxTurns` set from `max_turns`; the options are checked by a test that captures them at the SDK boundary.
- **R2** (K1429, K1502) The credential reaches Claude Code only in the environment of that one query, which replaces the process environment whole: `CLAUDE_CODE_OAUTH_TOKEN` for `kind: "subscription"`, `ANTHROPIC_API_KEY` for `kind: "apikey"`, with `CLAUDE_CONFIG_DIR` a fresh temporary directory removed when the query ends. A request with no credential, another `kind` or an empty secret answers `{ok: false, code: "NO_CREDENTIAL"}` and starts nothing.
- **R3** (M-Q4 relay; K1474 (i)) The only tools the model can see are those the request names, each an in-process MCP tool whose handler sends a relay to the caller over the same connection and returns the caller's `tool_result` as the tool's result, unchanged. The runner performs no tool's effect itself.
- **R4** The conversation's end is answered on the connection as `{ok: true, result, stop_reason, num_turns, usage}` with `usage` `{input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens, total_cost_usd}` as the SDK states them (`null` where it states none), or `{ok: false, code, detail}` (detail at most 300 characters) when the SDK errors, the caller's connection closes, or `max_turns` is reached (`code: "MAX_TURNS"`); a closed connection aborts the query.

**`GET /version`**
- **R5** Answers 200 `{ok: true, name: "agent-runner", version}`, the version the image was built with.

**Anything else**
- **R6** Any other path or method answers 404 `UNKNOWN`.

**The fleet member**
- **R7** (M-Q8) The fleet manifest (`fleet-member.json`) names the image by a digest-pinned reference, its surface (R1–R5) and its build recipe, so an install names exactly one image.
- **R12** (N624; K1705; K1615) The module defines the Worker that hosts its container: it exports the Container Durable Object class `AgentRunner`, the class `agent-worker`'s `RUNNER` binding names (`agent-worker` R35, script `agent-runner`), whose instances run this module's image and pass every request they receive to it unchanged, the connection's WebSocket upgrade included, so R1–R6 answer through the binding exactly as the image answers them. The Worker adds no route, answer or tool of its own, holds no credential (R8) and has no binding, secret or address but its container's; it reaches no plane. (T35; K1915) Its one exception is R15's default handler, which reaches no container.
- **R13** (N624; K1604, T33-D1) The Worker's own wrangler configuration declares its container: the class `AgentRunner`, its Durable Object binding and migration, `max_instances`, and the image named only as `<repository>@sha256:<64 hex>` (R7), the digest the release writes when it publishes the image (T33-D1). The image's base (`Dockerfile`'s `FROM`) is pinned by digest, so a rebuild from the same source starts from the same base. R10's egress, `api.anthropic.com` only, is declared in the member's own configuration, so whoever deploys the container applies it. A test reads the configuration and the `Dockerfile` and finds each.
- **R14** (K1730, K1734; `bundler` R24–R26) `fleet-member.json` keeps `"kind": "container"` and its `image` block (R7), and states `bundle` (the Worker of R12, built and guarded as every member's bundle is), `class_name` (`AgentRunner`), `max_instances`, `bind` (the binding through which its caller reaches it, `agent-worker`'s `RUNNER`) and `image.digest` (`sha256:` and 64 lowercase hex, written by the release; `null` until then), so `bundler` lists it and guards its Worker (its R24), emits its `container.json` part from these fields (its R25) and deploys it (its R26). Until the digest is written, `bundler` refuses its release part by name (its R25, `[CONTAINER_UNDESCRIBED]`) and nothing here is deployed.
- **R15** (K1915) The Worker's module (`src/worker.mjs`, and its committed bundle, the `main` its wrangler configuration names) has a default export carrying a `fetch` handler, beside the `AgentRunner` class, so wrangler builds it as an ES-module Worker and deploys its Durable Object and container. The handler answers every request that reaches the Worker other than through its class 404 `{ok: false, code: "UNKNOWN"}` (R6's answer), reads no body, reaches no container instance and holds no state. A test imports the committed bundle and finds `default.fetch` a function answering a request 404 `UNKNOWN`, and finds `AgentRunner` still exported. The release after this module's T35 merge carries the fix (K1922).
- **R16** (F20; K1881) The image runs no package's install or lifecycle script at build: its dependencies are installed by `npm ci` with `--ignore-scripts` (and `--omit=dev`) from `package-lock.json`, and R1–R5 still answer in the built image. A test reads the `Dockerfile` and finds every `npm ci` or `npm install` carrying `--ignore-scripts`, and reads `package-lock.json` and finds no package marked `hasInstallScript`. A dependency that needs its install script fails that test, naming the package, and is admitted only by a reviewed change that names it in the test, a change BOB rules on.

## Private

### Uses

- `bundler.writeMember`, at build only (its committed bundle, K1799). It imports no other module of this repository and reaches the plane only through its caller (R3).

### Invariants

- **R8** (K1429; `agent-worker` R36) It holds no credential: the secret arrives per request and is never written to disk, logged or echoed; no answer, relay, error or log line carries it. A test with a sentinel secret finds it in no output and no file under the image's writable paths after the query.
- **R9** Nothing survives a conversation: no file is written outside its temporary directory (R2), which is gone when the query ends, and a second request on a fresh connection sees nothing of the first.
- **R10** Its only egress is `api.anthropic.com`; it opens no other outbound connection, and reads no file, page or address a tool did not relay (the closed book, K1474 (i); the injection fence).
- **R11** No place is named in its behaviour or outward text. (T35; K1905) The image's registry address (`fleet-member.json`'s `image.repository`, and the same repository in the image reference of the wrangler configuration's `containers`) is a distribution coordinate, the publisher's namespace, not a place the product states; R11's test exempts exactly those two values, and a place word anywhere else in the module's behaviour, outward text or configuration still fails it.

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 QUESTIONS (the member's own reference; the group's copy binds no credential), §2 "Cross-cutting rulings" (the member's own account), §9.4 (Q0: the subscription path runs through the Agent SDK, Claude Code unmodified, built-in tools off, not bare mode, in a container; deploy the agent runner).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (the fleet member; K1502).
- `docs/architecture/BIO_Distribution_v0_1.md` §5 (the fleet member).
- DEC-55; K1429, K1474 (i), K1502, K1503.
- K1905 (R11), K1915 (R15); `plan/draft-T35-security-review.md` F20 (K1881; R16).

### Suggestions

- **Files.** `agent-runner/Dockerfile`, `agent-runner/src/entry.mjs`, `agent-runner/package.json` with the SDK pinned to an exact version (0.3.289 was read for M-Q4), `fleet-member.json`. A Node test with a stubbed SDK `query` covers R1–R4 and R8–R9 offline.
- **Image placement (M-Q8).** A public Docker Hub image pinned by digest under the `default` scheduling policy lets newgroup install the member without a push; the digest goes in the signed release's manifest. The `durable_object` policy needs the Cloudflare registry. BOB's choice at the job; it changes R7's reference only.
- **R10's enforcement.** Express egress as the container's network configuration (an allow-list of one host) and test it by reading that configuration; the closed book is also held by R1 (no web tools).
- **Open for BOB.** (1) R2's `apikey` arm: T33-55 sends API-key turns to the Messages API directly, so the runner may serve `subscription` only; the draft keeps both (entries C Q0-3 names both variables) for M-Q1's comparison. (2) R4's error codes beyond `NO_CREDENTIAL` and `MAX_TURNS` are this draft's. (3) Whether `bundler` lists this member (plan, Choices settled: "a question its job's START names"). Answered: `bundler` R24–R26 list, describe and deploy it (K1734), and R14 here states its fields (T34).
- **Not here.** The deployment, the image's first push and M-Q2 (start reliability) are the release's (T33-D1). The Worker and its configuration are here (R12–R13, T34-74); deploying them is `bundler`'s `deploy-fleet` (its R26) at a release, which needs the account's token to reach Containers (Bob's act if it cannot, K1705).
- **T35 (T35-49).** R15 clears K1915's refusal; R11's exemption clears the plan's accepted red 11. R16: the lockfile on `tranche/T35` holds no `hasInstallScript` package, so `--ignore-scripts` is expected to change nothing the image runs; the job proves it by building the image and running R1–R5's tests against it, or reports which package needs a script. F20's other half, the image's package list recorded in the release, is `bundler`'s third-party listing (F21, T35-6) if BOB extends it to the image; it is not here. N678's own-sign-in share is N708 (K1922).
- **The Worker (T34-74).** A small entry beside `src/entry.mjs` (e.g. `src/worker.mjs`) over Cloudflare's Container class, with a `wrangler.jsonc` of its own; its build may use `bundler`'s `writeMember` as `agent-worker`'s does, in which case `uses` gains `bundler` (the job's COMPLETE states its final `uses`).
