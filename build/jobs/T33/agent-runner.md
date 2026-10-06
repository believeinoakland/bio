# agent-runner (T33)

**Status** · session_01N1t3rme7vXuC6u3GdZF3Jt · depth 2 · WORKING · handled B3

## J1 · QUESTION

Four points my requirements leave open, each with the reading I am building on now (I carry on; only (2) changes what lands outside my module).

(1) **The conversation's path and wire (R1–R4, R6; shared with agent-model R2, R7).** Reading: the container listens on port 8080; `GET /conversation` with `Upgrade: websocket` is the one connection per conversation. Frames are JSON text: the caller's first frame is the conversation request; the runner sends `{tool_use:{id,name,input}}`; the caller answers `{tool_result:{id,content,is_error?}}` (`content` a string or MCP content blocks, passed through); the runner's last frame is R4's answer, then it closes (1000). `GET /conversation` without the upgrade, like any other path or method, is R6's 404 `UNKNOWN`. A first frame that is not a conversation request answers `{ok:false, code:"BAD_REQUEST"}`. The model sees each tool as `mcp__relay__<name>` (the SDK's MCP naming); every relay carries the request's own `name`. R4's other codes: `SDK_ERROR`, `CONNECTION_CLOSED` (a pending relay's connection closed), `MAX_TURNS`. Please confirm or name the path, so AGENT-MODEL #1 codes the same wire.

(2) **`fleet-member.json` and bundler (R7; Suggestions "Open for BOB" (3)).** My code sits at `agent-runner/` beside agent-worker, so bundler's `discoverMembers` finds my marker, and `bio-plane/test/system/fleetbundles.test.mjs` goes red: its exact member list, and "every discovered member declares one [`bundle`]". A container image has no Worker bundle. Reading: my marker carries `"kind": "container"` and an `image` block, no `bundle`; bundler (its job or a CHANGE to BUNDLER #7) learns container members (discovered, listed, not bundle-guarded), and until then that test is a red naming agent-runner, which I REPORT. Alternative: the marker under another name until bundler learns it (against R7's text).

(3) **R7's digest before the image exists.** The image is first built and pushed at the release (T33-D1, "Not here"), so no digest exists at my COMPLETE. Reading: the manifest holds `image: {repository, digest}` with `digest: null` until the release writes it; the module exports `imageReference(manifest)`, which answers `<repository>@sha256:<64 hex>` and refuses `IMAGE_NOT_PINNED` for a manifest with no digest, so an install can name only one image; R7's test checks that, the surface and the recipe. Placement: the `default` policy, a public Docker Hub image (M-Q8).

(4) **The repository name (R11).** `believeinoakland/...` names a place in outward text; layers' rule 4 allows the publisher's name only "as the publisher and signer of a release". Reading: `docker.io/civicos/agent-runner` as a placeholder that the release's first push confirms (the Docker Hub account is Bob's act at T33-D1). Say if you want the publisher's name instead.

Also keeping both R2 arms (`subscription`, `apikey`) as the requirement states.

## Completion

**Entries applied.** T33-56 (K1429, K1474, K1502; M-Q4 relay, M-Q8): the new container member, with B2's CHANGE (K1600, the connection) and B3's answers (K1601). R1–R11 are met.
- `agent-runner/src/entry.mjs`: the Node entry and host factory `agentRunnerOf({sdk, tmpRoot})`: `GET /version` (R5), the WebSocket `GET /conversation` (R1–R4, K1600), 404 `UNKNOWN` for anything else, including an upgrade on another path (R6). Port 8080.
- `src/runner.mjs`: one Agent SDK `query` per request with `tools: []`, `settingSources: []`, `persistSession: false`, `strictMcpConfig: true`, `skills: []`, `plugins: []`, `maxTurns`, no bare mode (R1). Its `env` replaces the environment whole: the credential variable, `CLAUDE_CONFIG_DIR` set to a fresh `mkdtemp` directory that holds `HOME`, `TMPDIR` and `cwd` and is removed when the query ends, plus Claude Code's telemetry, error-report and update traffic switched off (R2, R9, R10). Relay tools come from a low-level MCP server, so each tool's `input_schema` reaches the model unchanged as JSON Schema with no zod conversion. A call sends `{tool_use}` and returns the caller's `tool_result` as the result; a tool the request did not name is refused and never relayed (R3). The end is sent per R4 with codes `NO_CREDENTIAL`, `BAD_REQUEST`, `SDK_ERROR` and `MAX_TURNS`; a closed connection aborts the query. Every outward string is scrubbed of the secret (R8).
- `src/ws.mjs`: a minimal RFC 6455 server for text frames, so the SDK and its peers stay the image's only npm dependencies.
- `src/manifest.mjs`: `imageReference(manifest)` answers `repository@sha256:…` or refuses `IMAGE_NOT_PINNED` (R7, K1601 (3)).
- `fleet-member.json`: `kind: container`, `image` (`docker.io/civicos/agent-runner`, digest `null` until the release writes it, `linux/amd64`, port 8080, the `default` policy), surface, build recipe, `egress: ["api.anthropic.com"]`. Also `Dockerfile`, `.dockerignore`, `package.json` at the fleet's one version 0.79.0, with the SDK 0.3.289 and its peers (`@anthropic-ai/sdk` 0.131.0, `@modelcontextprotocol/sdk` 1.32.1, `zod` 4.6.5) pinned exactly, and `package-lock.json`.

**Paths, tests, uses (for `modules.json`).** paths `agent-runner/`; tests `agent-runner/test/`; uses none.

**Deferred.**
- The base image is the tag `node:22-bookworm-slim`, not pinned by digest: Docker Hub's registry answered 429 from here. The release (T33-D1) should pin it by digest when it builds the image.
- R10's allow-list is declared in the manifest (`egress`). The side that deploys the container applies it (the Container's network configuration in agent-worker or the installer, T33-57 or T33-91). In-process, the runner opens no connection of its own and Claude Code's other traffic is off.
- Live start and reliability (M-Q1, M-Q2) belong to the release.

**Found in other modules.**
- bundler: my marker reddens `bio-plane/test/system/fleetbundles.test.mjs` (the member list; "every discovered member declares one"; and "agent-runner: no staleness…"). This is accepted by name until N578 (K1601 (2)). The same marker also reddens `bio-plane/test/system/resolveversion.test.mjs` ARM 7b ("the plane and all FOUR members (10 sites)"; green when my marker is moved away). That is the same cause, so it belongs under N578 too.
- agent-model and agent-worker: the model sees each relayed tool as `mcp__relay__<name>` (the SDK's MCP naming), while each relay carries the request's own `name`. A system prompt or skill pack that names tools should expect that prefix on this path.

**Tests and checks.**
- `agent-runner`: `npm test`: tests 14, pass 14, fail 0. The stubbed SDK drives the real relay MCP server through an MCP client.
- Live smoke of the real SDK (0.3.289): Claude Code started with these options and reached the API. A bogus token answered `SDK_ERROR` "Failed to authenticate. API Error: 401", and the secret was not echoed.
- `checks/format.mjs`: 0 failures.
- `architecture`, `coverage` and `ownership` were run with `agent-runner/` and `agent-runner/test/` set in a working copy of `modules.json`, not committed, because the paths are BOB's to write at merge:
  - `architecture`: 13 product files, 0 failures.
  - `coverage`: 11 of 11, 0 failures.
  - `ownership`: 14 files, 0 failures.
- Committed `modules.json` (empty paths): `coverage` and `ownership` fail only for that reason.
- No layer tests are named in the manifest.

Size (session_01N1t3rme7vXuC6u3GdZF3Jt): test runs 10, module lines 809
