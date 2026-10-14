# agent-runner — requirements

**Status** · In force: reviewed (K1505; banner cleared K1599); a new module and fleet member (K617, K1439; T33-56). Last changed T37 (T37-16: R2, R7–R11, R13 amended; R17–R23 new; N708's share, DEC-156, K1819, K2134, K2200; N750); not yet met: T37 where marked. A conversation on the member's own sign-in has no caller in T37: `credentials` R35, `agent-model` R2 and `agent-worker` R6 carry it in a later entry (`next.md`, K2200). Last changed T46 (T46-18: R24 new, amending R3: a relay's result may carry a page's picture, so a sign-in transcribes; N852; K2816 (3), (4)); marked not yet met (T46).

**Size (P6).** About 300–500 lines (entries C P6 table).

## Public

### Purpose

The container in which a member's Claude subscription runs a model conversation for the plane's fleet: Claude Code, unmodified, with every built-in tool, settings source and disk persistence off, so the model sees only the tools the Worker relays and the Worker's table decides every call. A member's own instance may also hold that member's own Claude sign-in, made and stored by Claude Code itself and serving only that member; nothing else survives a call, and it reaches nothing but Anthropic and the connection it was called on.

### Provides

Terms. The **caller** is `agent-model`'s `signin` path (its R2), through the Container Durable Object. A **conversation request** is `{credential: {kind: "signin", member}, model, system, prompt, tools: [{name, description, input_schema}], max_turns}`. A **relay** is `{tool_use: {id, name, input}}` sent to the caller, answered by `{tool_result: {id, content, is_error?}}`. The **connection** is a WebSocket the caller opens with `fetch("https://agent-runner/conversation", {headers: {Upgrade: "websocket"}})`; its first message is the conversation request, and relays, results and the end (R4) travel on it (K1600). (T37) **The member's instance** is the one `AgentRunner` instance (R12) its caller names by a member's id (`agent-worker` R66); **the sign-in** is Claude Code's own login, run by the unmodified binary in that instance (AT-14, AT-18); **the stored sign-in** is what the binary writes where it runs (AT-27).

**The conversation** (one per connection)
- **R1** (K1502) For each conversation request it runs one Agent SDK query with Claude Code unmodified and not in bare mode, with built-in tools off (`tools: []`), no settings source (`settingSources: []`), no session persistence (`persistSession: false`), `strictMcpConfig: true`, no skills, and `maxTurns` set from `max_turns`; the options are checked by a test that captures them at the SDK boundary.
- **R2** (K1429, K1502; T37: N708, DEC-156, K1819; T39: N801, K2290, K2343) The one credential this module takes is `{kind: "signin", member}`. It carries no secret. Its query runs under this instance's stored sign-in made for `member` (R21), in an environment that replaces the process environment whole, sets neither `CLAUDE_CODE_OAUTH_TOKEN` nor `ANTHROPIC_API_KEY`, and gives `CLAUDE_CONFIG_DIR` no fresh directory, so Claude Code authenticates as its own sign-in left it (AT-27); this module neither reads nor copies the stored sign-in to do so (R8), and everything else the query writes is gone when it ends (R9). Each of these answers `{ok: false, code: "NO_CREDENTIAL"}` and starts nothing: a request with no credential; a credential of any other `kind` (`subscription`, retired with `credentials` R22 in T38, and `apikey`, which `agent-model` R2 sends to the Messages API, never here); a credential carrying a `secret`; a `member` that is not a non-empty string. No code path of this module takes a token or key from a request. With no stored sign-in in the instance it answers `{ok: false, code: "NOT_SIGNED_IN"}`; with one made for another member, `NOT_THIS_MEMBER` (R21); each starts nothing. A test sends a `subscription` credential with a sentinel token and an `apikey` one, finds each refused `NO_CREDENTIAL` with nothing started, and finds the sentinel in no output (R8).
- **R3** (M-Q4 relay; K1474 (i)) The only tools the model can see are those the request names, each an in-process MCP tool whose handler sends a relay to the caller over the same connection and returns the caller's `tool_result` as the tool's result, unchanged. The runner performs no tool's effect itself.
- **R24** (T46; N852; K2611; K2816 (3), (4); `draft-T46-trial.md` §2.2 item 7, §6 B4 A; amends R3) A sign-in transcribes: the runner passes a page's picture to the model as `agent-worker` R72 does on an API key. A relay's `tool_result` whose `content` holds an `image` block in `agent-model` R14's shape, `{type: "image", source: {type: "base64", media_type, data}}`, is returned to the model as the MCP tool's image content, its media type and bytes unchanged, beside any text blocks in their order; the runner decodes, reads and alters nothing of it. A picture reaches the model only so, inside the tool's result (`agent-model` R12, R14), never in the system prompt or a user turn. It is written to no file and lasts only the conversation (R9), and no answer, relay, error or log line carries its `data` (R8). An `image` block whose `media_type` is not `image/png` or whose `data` is not base64 is returned to the model as the tool's error result naming the fault, its bytes never passed. Tests: a stub caller answers the conversation's `read_page` relay with an `image` block, and the SDK boundary receives one image content item with the same bytes and media type; a sentinel in `data` appears in no answer, log line or file; control: a text-only result still passes unchanged (R3).
- **R4** The conversation's end is answered on the connection as `{ok: true, result, stop_reason, num_turns, usage}` with `usage` `{input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens, total_cost_usd}` as the SDK states them (`null` where it states none), or `{ok: false, code, detail}` (detail at most 300 characters) when the SDK errors, the caller's connection closes, or `max_turns` is reached (`code: "MAX_TURNS"`); a closed connection aborts the query.

**`GET /version`**
- **R5** Answers 200 `{ok: true, name: "agent-runner", version, capabilities}`, the version the image was built with. (T46; K2947; R24) `capabilities` is an array naming each optional relay the image carries: `"image"` exactly when R24 is met; an image built before R24 answers no such key, which its users read as no capability.

**Anything else**
- **R6** Any other path or method answers 404 `UNKNOWN`.

**The member's own sign-in** (N708; DEC-156; K1819, K2134; values K2200)
- **R17** `POST /signin` takes `{member}`. Refusals before anything starts: a body not JSON 400 `BAD_REQUEST`; `member` not a non-empty string of at most 200 characters 400 `BAD_MEMBER`; an instance holding another member's stored sign-in 409 `NOT_THIS_MEMBER` (R21). Otherwise it starts the unmodified Claude Code binary's own sign-in in this instance for `member`, ending any sign-in the instance has waiting, and answers 200 `{ok: true, address}`, `address` the sign-in address the binary itself states, unchanged. An address that is not `https:` on an Anthropic sign-in host (`claude.ai`, `claude.com`, `anthropic.com`, or a subdomain of one) is never answered: the sign-in is ended and the answer is 502 `SIGNIN_ADDRESS_UNEXPECTED` with no address. A binary that states no address within 30 seconds, or exits, answers 502 `SIGNIN_UNAVAILABLE` with `detail` (at most 300 characters, R8). This module builds no address and offers no Claude.ai login of its own: the sign-in is the binary's (AT-18), and whether starting it for a member is AT-16's "offer" stays open (U-7 (b)).
- **R18** `POST /signin/code` takes `{member, code}`. Refusals, nothing typed, in order: R17's first two; another member's stored sign-in 409 `NOT_THIS_MEMBER` (R21); no sign-in waiting for `member` 409 `NO_SIGNIN_WAITING`; a `code` not a string of 1 to 2,000 characters, or holding a line break or any other control character, 400 `BAD_CODE` (the waiting sign-in is kept). Otherwise it delivers `code` to the waiting sign-in's own prompt (AT-26) exactly as given, followed by one line end, and answers when the binary reports the outcome: 200 `{ok: true, connected: true, member}` when it reports itself signed in, 409 `SIGNIN_REFUSED` with `detail` (the binary's words, scrubbed as R8 says, never the code) when it reports a failure, or when it reports no outcome within 60 seconds of the code (the sign-in is then ended, `detail` saying so; K2213). A sign-in waits for its code at most 10 minutes, then is ended, and a later code answers `NO_SIGNIN_WAITING`. A sign-in takes one code: after its outcome nothing more is typed to it.
- **R19** `POST /signin/state` takes `{member}` and answers 200 `{ok: true, connected, member}`: `connected` is `true` exactly when this instance holds a stored sign-in made for `member` and the binary reports it signed in, learned from the binary's own report, never by reading the stored sign-in (R8); `false` when none is held (the instance's disk no longer holding one included) or it is another member's. Refusals as R17's first two.
- **R20** `POST /signout` takes `{member}`: it ends any sign-in waiting for `member` and has the binary remove `member`'s stored sign-in by its own logout (AT-27), answering 200 `{ok: true, connected: false, member}`, also when none was held; a logout the binary itself fails (it cannot run or exits in error) answers 502 `SIGNOUT_FAILED` with `detail` scrubbed as R8 says, keeping the record (K2213); an instance holding another member's stored sign-in answers 409 `NOT_THIS_MEMBER` and touches nothing.
- **R21** (K1547, K1755, K1819) An instance holds at most one member's stored sign-in and records which member it was made for (a member id, never a secret). The stored sign-in serves only that member: every R17, R18 and R20 step and every `signin` conversation (R2) naming another member is refused 409 `NOT_THIS_MEMBER` before anything runs; R19 naming another member answers `connected: false` and runs nothing (K2213). R20 clears the record.

**The fleet member**
- **R7** (M-Q8) The fleet manifest (`fleet-member.json`) names the image by a digest-pinned reference, its surface (R1–R5, R17–R20), its build recipe and R23's terms, so an install names exactly one image.
- **R12** (N624; K1705; K1615) The module defines the Worker that hosts its container: it exports the Container Durable Object class `AgentRunner`, the class `agent-worker`'s `RUNNER` binding names (`agent-worker` R35, script `agent-runner`), whose instances run this module's image and pass every request they receive to it unchanged, the connection's WebSocket upgrade included, so R1–R6 answer through the binding exactly as the image answers them. The Worker adds no route, answer or tool of its own, holds no credential (R8) and has no binding, secret or address but its container's; it reaches no plane. (T35; K1915) Its one exception is R15's default handler, which reaches no container.
- **R13** (N624; K1604, T33-D1) The Worker's own wrangler configuration declares its container: the class `AgentRunner`, its Durable Object binding and migration, `max_instances`, and the image named only as `<repository>@sha256:<64 hex>` (R7), the digest the release writes when it publishes the image (T33-D1). The image's base (`Dockerfile`'s `FROM`) is pinned by digest, so a rebuild from the same source starts from the same base. R10's egress, `api.anthropic.com` and the sign-in hosts R10 names, is declared in the member's own configuration, so whoever deploys the container applies it. A test reads the configuration and the `Dockerfile` and finds each.
- **R14** (K1730, K1734; `bundler` R24–R26) `fleet-member.json` keeps `"kind": "container"` and its `image` block (R7), and states `bundle` (the Worker of R12, built and guarded as every member's bundle is), `class_name` (`AgentRunner`), `max_instances`, `bind` (the binding through which its caller reaches it, `agent-worker`'s `RUNNER`) and `image.digest` (`sha256:` and 64 lowercase hex, written by the release; `null` until then), so `bundler` lists it and guards its Worker (its R24), emits its `container.json` part from these fields (its R25) and deploys it (its R26). Until the digest is written, `bundler` refuses its release part by name (its R25, `[CONTAINER_UNDESCRIBED]`) and nothing here is deployed.
- **R15** (K1915) The Worker's module (`src/worker.mjs`, and its committed bundle, the `main` its wrangler configuration names) has a default export carrying a `fetch` handler, beside the `AgentRunner` class, so wrangler builds it as an ES-module Worker and deploys its Durable Object and container. The handler answers every request that reaches the Worker other than through its class 404 `{ok: false, code: "UNKNOWN"}` (R6's answer), reads no body, reaches no container instance and holds no state. A test imports the committed bundle and finds `default.fetch` a function answering a request 404 `UNKNOWN`, and finds `AgentRunner` still exported. The release after this module's T35 merge carries the fix (K1922).
- **R16** (F20; K1881) The image runs no package's install or lifecycle script at build: its dependencies are installed by `npm ci` with `--ignore-scripts` (and `--omit=dev`) from `package-lock.json`, and R1–R5 still answer in the built image. A test reads the `Dockerfile` and finds every `npm ci` or `npm install` carrying `--ignore-scripts`, and reads `package-lock.json` and finds no package marked `hasInstallScript`. A dependency that needs its install script fails that test, naming the package, and is admitted only by a reviewed change that names it in the test, a change BOB rules on.
- **R22** (AT-14) Claude Code runs as published: no file of the installed `@anthropic-ai/claude-agent-sdk` package, the Claude Code it carries included, is changed, wrapped or replaced in the image after `npm ci` (R16), and no option, setting or environment variable this module passes removes, disables or restricts a sign-in method Claude Code offers. A test reads the `Dockerfile` (no step after `npm ci` writes under that package's directory) and the options and environment R1, R2 and R17 pass, and finds no setting that selects or forbids a sign-in method.
- **R23** (AT-14; U-7 (d); DEC-156) `fleet-member.json` states `terms`, `{condition, source, who_agrees}`, recording AT-14's condition for whoever deploys this member: `condition` AT-14's two conditions as the register quotes them (agreeing to Anthropic's Commercial Terms of Service; Claude Code run unmodified, no authentication method removed), `source` AT-14's page, `who_agrees` `null` while U-7 (d) is open. No text of this module says Anthropic's terms allow the sign-in (DEC-156: Bob's decision is to build, not a reading of the terms; U-7 (a)–(d) open). A test reads the field.

**The sign-in held through its wait; the token Claude Code mints, handed up once; conversations on the held token; the trace** (T47; N1001; K3060 D10, K3061 D10; K1874; trace F1, F3, F5, F6, F10)

- **R25** (a; trace F1; amends R12) The container stays awake for the whole of a sign-in, from `start` to the code's outcome, and the sleep timer never ends a waiting sign-in.
  - **Start of the hold.** When a `POST /signin` the class passes to its container answers 200, the class records in its own Durable Object storage a hold until `start + CODE_WAIT_MS + OUTCOME_WAIT_MS + 30 s` (10 min 90 s, from R18's constants, exported).
  - **During the hold.** `onActivityExpired` does not stop the container while the hold is in force. It renews the activity timeout and stops nothing.
  - **End of the hold.** The hold is cleared when any of these answers:
    - `POST /signin/code` with an outcome (200, or 409 `SIGNIN_REFUSED` or `NO_SIGNIN_WAITING`);
    - `POST /signout`;
    - a later `POST /signin` that answers other than 200.
    It also clears when its deadline passes. After that, `sleepAfter` (2 minutes) governs as before.
  - **What the class reads.** Only the path and status of these answers, never a body (R8). It adds no route or answer of its own.
  - **Unchanged.** A conversation-only instance sleeps as today, and R18's 10-minute wait for the code is unchanged.
  - **Tests**, with a stubbed `Container` base and a fake clock:
    - after a 200 `start`, expiries at +3 and +9 minutes stop nothing, and an expiry at +12 minutes stops the container;
    - after a `code` answer, the next expiry stops it;
    - after a `start` answered 502, the next expiry stops it;
    - control: an instance that never saw `start` stops at its first expiry.
  -
- **R26** (a; trace F3; amends R12) A start is fast, and a failed start is said in JSON.
  - The container's server listens before the Agent SDK is loaded. `GET /version` and the four sign-in routes answer without it. A conversation that arrives before the SDK has loaded waits for it.
  - When the library cannot start the container or reach its port (any answer of `containerFetch` that is not JSON), the class answers JSON 503 `RUNNER_NOT_STARTED` with:
    - `status` (the library's own status);
    - `detail`: the library's words, at most 120 characters, with any URL query and anything R29 scrubs removed.
  - It never answers the library's plain text.
  - **Tests:**
    - with an SDK loader that never resolves, `/signin/state` answers;
    - a stub base answering text/plain 500 "Failed to start container: …" gives JSON 503 `RUNNER_NOT_STARTED` with that status;
    - control: a JSON answer passes through unchanged.
  -
- **R27** (b; K3060 D10, K3061 D10; AT-22; amends R8, R17, R18, R19, R21, R22) The sign-in mints a token that Civicsmith holds.
  - **`start`.** It runs the unmodified binary's own `claude setup-token` in place of `claude auth login`, through the same pseudo-terminal (R17, R16), with a terminal wide enough that neither the address nor the token is wrapped. It answers the address the binary states, checked as R17 checks it, with R17's refusals.
  - **`code`.** It types the code once, as R18 does. The binary reports success by printing its token after `Your OAuth token (valid for …):`.
    - The runner reads the token from that output only: terminal escapes removed (`plain()`), lines joined, the token a single run of `[A-Za-z0-9._-]`, 20 to 2,000 characters.
    - It answers 200 `{ok: true, connected: true, member, attempt, token, valid_for}`, `valid_for` the binary's own words ("1 year"). This is the one answer that ever carries the token, to its one caller (`agent-worker` R81).
    - It then ends the binary's process and drops every copy of its output.
  - **Failure.** A failure, no token within `OUTCOME_WAIT_MS`, or a token of another shape answers 409 `SIGNIN_REFUSED`, its `detail` scrubbed as R29 says. No answer carries `token` then.
  - **What the instance keeps.** No stored sign-in, and no member record beyond the waiting attempt. `NOT_THIS_MEMBER` now means only "a sign-in is waiting for another member" (R21).
  - **`state`.** R19's `state` answers `{ok: true, connected: false, waiting, member}`, `waiting` true while an attempt for `member` waits. Whether a member is connected is `credentials`', not this instance's.
  - **`signout`.** R20's `signout` ends a waiting attempt and answers `connected: false`. It runs no logout, since there is nothing stored.
  - **What this changes in R8 and R22.** R8's "the stored sign-in is written … only by the binary" is replaced: the token is the binary's output, read once, answered once, and never logged, written to disk, kept after the answer, or put in any other answer, relay or error. R22's test admits `setup-token`, the binary's own command, as AT-22 directs.
  - **Tests**, with a stubbed binary that prints a sentinel token in the binary's own words, wrapped and with escapes:
    - the `code` answer carries it exactly once;
    - no log line, file under the writable paths, other answer, or `state`/`signout` answer carries it;
    - controls: a binary that prints "OAuth error: …" gives `SIGNIN_REFUSED` with no `token`; a token over 2,000 characters gives `SIGNIN_REFUSED`.
  -
- **R28** (b; K3060 D10; AT-22; amends R2, R8, R9, R21) A conversation runs on the held token.
  - **The credential.** The conversation request's credential is `{kind: "signin", member, secret}`, `secret` the token `credentials` holds for `member` (handed down by `agent-model` R16).
  - **How the query runs.**
    - `CLAUDE_CODE_OAUTH_TOKEN` is set to `secret` in that query's environment only (AT-22's way).
    - `CLAUDE_CONFIG_DIR` is a fresh directory inside the conversation's temporary directory, gone when it ends (R9).
    - No stored sign-in is read, and `keepOnly` is retired.
    - Everything else R2 sets stands: the environment replaced whole, no `ANTHROPIC_API_KEY`.
  - **Refusals.**
    - A `signin` credential with no non-empty string `secret` answers `{ok: false, code: "SIGNIN_NOT_HELD"}` and starts nothing.
    - A query the binary ends on Anthropic refusing the token (an authentication failure as the binary reports it; START fixes the strings from the pinned binary) answers `{ok: false, code: "SIGNIN_TOKEN_REFUSED", detail}`, so the member is told to connect again (§2, credentials need C4).
    - R2's `NO_CREDENTIAL` cases stand, except that a `signin` credential carrying a `secret` is no longer one of them.
  - **The token's reach.** It is never logged, echoed, put in a relay, error, answer or file, nor passed to anything but that query's environment (R8).
  - **The instance.** It stays named by the member (agent-model R2), so each member's conversations run apart. It holds nothing between them.
  - **Tests:**
    - a sentinel `secret` reaches the stubbed SDK's `options.env.CLAUDE_CODE_OAUTH_TOKEN` and nothing else: no answer, log line or file after the query;
    - no `secret` gives `SIGNIN_NOT_HELD` with nothing started;
    - a stub SDK result reporting an authentication failure gives `SIGNIN_TOKEN_REFUSED`;
    - control: R2's `apikey`- and `subscription`-kind refusals are unchanged.
  -
- **R29** (c; trace §3 R8a; K1874; amends R8's "logs nothing of a request") Each sign-in step and each conversation writes exactly one JSON line to stdout.
  - **Sign-in lines.** `{event: "signin.runner", trace, attempt, step, member_ref, outcome, code?, status, ms, cold, uptime_s, binary_present, binary_exit?, said_head?}`.
    - `start` adds `address_host` (the hostname only) and `ms_to_address`.
    - `code` adds `ms_to_outcome` and `waited_s` (seconds since its `start`).
    - `state` adds `waiting`.
  - **Conversation lines.** `{event: "conversation.runner", trace?, member_ref, outcome, code?, ms, num_turns}`.
  - **Where the fields come from.**
    - `trace` is the `x-civicsmith-trace` header the caller sent, else one minted here.
    - `member_ref` is the `x-civicsmith-member-ref` header the caller sent, else `null`. The bare member id is never logged.
    - `outcome` is `ok`, `refused` or `failed`, and `code` the refusal code.
    - `said_head` is the binary's last words, at most 200 characters, after `plain()`. It has removed: every copy of the code; every URL query; and anything token-shaped (`sk-ant-…`, a JWT, any run of 32 or more `[A-Za-z0-9._-]`).
  - **Never logged:** a code, token, `secret`, address path or query, prompt, system text, tool content, result text, header, or body.
  - **Tests:** a stubbed binary echoing a sentinel code and printing a sentinel token, and a conversation with a sentinel `secret`. No stdout line carries any sentinel, and each step writes exactly one line with the named fields.
  -
- **R30** (c; trace §3 R13a, R10a; amends R12) The Worker class logs its lifecycle and its egress, one JSON line each.
  - **Lifecycle.** `{event: "runner.lifecycle", instance_ref, what, ms?, error_head?, signin_hold}`, where:
    - `what` is `start`, `started`, `activity_expired`, `held_awake`, `stop` or `error` (`onStart`, `onStop`, `onError` and R25's `onActivityExpired` overridden, each calling `super` where it stops);
    - `instance_ref` is the first 12 hex characters of the Durable Object id;
    - `signin_hold` says whether R25's hold was in force.
  - **Egress.** One `static outboundByHost` handler per `fleet-member.json` `egress` host passes the request to `fetch` unchanged and logs `{event: "runner.egress", instance_ref, host, method, path_template, status, ms}`.
    - `path_template` is the path with each segment longer than 24 characters replaced by `:id`. It never carries a query, header or body.
    - This makes Anthropic's HTTP status on `/v1/oauth/token`, `/api/oauth/…` and `/v1/messages` visible.
    - A host outside `egress` is still refused by the library before any handler (R10 unchanged), and is not logged here.
  - **Tests:**
    - a stubbed base fires each lifecycle hook and finds one line each;
    - the egress handler, given a request carrying a sentinel in its query, headers and body, logs none of them and passes the request through unchanged;
    - control: the handlers' hosts equal `egress`.
  -
- **R31** (d; trace F5 (b), F6; amends R17, R18) Every step answers a member-readable refusal and joins its start and code.
  - **`attempt`.** `start` answers `attempt` (a UUID). `code` takes `attempt`, and one naming another attempt than the waiting one answers 409 `ATTEMPT_SUPERSEDED`, typing nothing and keeping the waiting attempt.
  - **Refusals of the sign-in routes.** Every refusal of `/signin`, `/signin/code`, `/signin/state` and `/signout`, and `RUNNER_NOT_STARTED` (R26), carries:
    - `trace`;
    - `detail` written for the member: at most 300 characters, in DEC-149's words ("your group's Civicsmith", never "instance" or "container"), naming what happened and what to do.
    - `SIGNIN_UNAVAILABLE`'s `detail` names which of its arms it is (no binary, no address in time, the binary exited).
  - **`trace_detail`.** Each answer carries `{ms, cold, uptime_s, waiting_age_s?}`, a closed list of non-secret fields for the door's trace (§3).
  - **Tests:**
    - two `start`s, then a code naming the first attempt, gives `ATTEMPT_SUPERSEDED`;
    - each refusal carries `trace` and a `detail` with no place word (R11's sweep) and no sentinel;
    - control: a code naming the waiting attempt is typed.
  -

R23 and R17's sentences that U-7 is open ("No text of this module says Anthropic's terms allow the sign-in"; "whether starting it … stays open (U-7 (b))") are re-worded to cite K3061: Bob settled U-2 and U-7 as allowed. Wording only.

## Private

### Uses

- `bundler.writeMember`, at build only (its committed bundle, K1799). It imports no other module of this repository and reaches the plane only through its caller (R3).

### Invariants

- **R8** (K1429; `agent-worker` R36; K1819) It holds no credential of its own: a request's secret arrives per request and is never written to disk, logged or echoed; no answer, relay, error or log line carries it. (T37; N708) The stored sign-in (R21) is written, renewed and removed only by the Claude Code binary, where it runs (AT-27); this module's code never reads, copies, logs, answers or sends it, nor the code from Anthropic's page beyond typing it once at the sign-in's prompt (R18); nothing of either leaves the instance, and no Civicsmith store holds either (K1819; `credentials` R43 holds only the fact). A test with a sentinel secret finds it in no output and no file under the image's writable paths after the query; a test with a stubbed binary that stores a sentinel sign-in and takes a sentinel code finds neither in any answer, relay, error or log line, and the sentinel sign-in in no file but the one the binary wrote.
- **R9** Nothing survives a conversation: no file is written outside its temporary directory (R2), which is gone when the query ends, and a second request on a fresh connection sees nothing of the first. (T37; N708) The one exception is the instance's stored sign-in (R21), which the binary may renew during a `signin` conversation (R2); a test lists the instance's writable paths before and after a conversation of each kind and finds them equal but for that renewal.
- **R10** Its only egress is `api.anthropic.com` and each host Claude Code's own sign-in and its renewal reach from the container (R17, R18, R2's `signin` kind), each named exactly, with no wildcard, in `fleet-member.json`'s `egress` (R13), as BOB rules them on the job's QUESTION (K2200); it opens no other outbound connection, and reads no file, page or address a tool did not relay (the closed book, K1474 (i); the injection fence). The sign-in address (R17) is opened by the member in their own browser, never by this module.
- **R11** No place is named in its behaviour or outward text. (T35; K1905) The image's registry address (`fleet-member.json`'s `image.repository`, and the same repository in the image reference of the wrangler configuration's `containers`) is a distribution coordinate, the publisher's namespace, not a place the product states; R11's test exempts exactly those two values, and a place word anywhere else in the module's behaviour, outward text or configuration still fails it. (T37; N750, K2074) R11's test derives the published form from the configuration as it stands: where `wrangler.jsonc`'s image reference reads `@sha256:UNPUBLISHED` (a tranche) it writes a published digest in to check the exemption, and where the release has already written one (a release cut) it judges that form as published, so it passes on both and asserts nothing about which holds.

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 QUESTIONS (the member's own reference; the group's copy binds no credential), §2 "Cross-cutting rulings" (the member's own account), §9.4 (Q0: the subscription path runs through the Agent SDK, Claude Code unmodified, built-in tools off, not bare mode, in a container; deploy the agent runner).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (the fleet member; K1502).
- `docs/architecture/BIO_Distribution_v0_1.md` §5 (the fleet member).
- DEC-55; K1429, K1474 (i), K1502, K1503.
- K1905 (R11), K1915 (R15); `plan/draft-T35-security-review.md` F20 (K1881; R16).
- DEC-156; K1819, K2134, K2147, K2200 (R2, R8–R10, R17–R23); `build/terms/anthropic.md` AT-14, AT-18, AT-26, AT-27, U-7 (R17–R23); K2074 (R11, N750).

### Suggestions

- **Files.** `agent-runner/Dockerfile`, `agent-runner/src/entry.mjs`, `agent-runner/package.json` with the SDK pinned to an exact version (0.3.289 was read for M-Q4), `fleet-member.json`. A Node test with a stubbed SDK `query` covers R1–R4 and R8–R9 offline.
- **Image placement (M-Q8).** A public Docker Hub image pinned by digest under the `default` scheduling policy lets newgroup install the member without a push; the digest goes in the signed release's manifest. The `durable_object` policy needs the Cloudflare registry. BOB's choice at the job; it changes R7's reference only.
- **R10's enforcement.** Express egress as the container's network configuration (an allow-list of one host) and test it by reading that configuration; the closed book is also held by R1 (no web tools).
- **Open for BOB.** (1) Answered (K2290, K2343): the runner takes `signin` only (R2). (2) R4's error codes beyond `NO_CREDENTIAL` and `MAX_TURNS` are this draft's. (3) Whether `bundler` lists this member (plan, Choices settled: "a question its job's START names"). Answered: `bundler` R24–R26 list, describe and deploy it (K1734), and R14 here states its fields (T34).
- **Not here.** The deployment, the image's first push and M-Q2 (start reliability) are the release's (T33-D1). The Worker and its configuration are here (R12–R13, T34-74); deploying them is `bundler`'s `deploy-fleet` (its R26) at a release, which needs the account's token to reach Containers (Bob's act if it cannot, K1705).
- **T35 (T35-49).** R15 clears K1915's refusal; R11's exemption clears the plan's accepted red 11. R16: the lockfile on `tranche/T35` holds no `hasInstallScript` package, so `--ignore-scripts` is expected to change nothing the image runs; the job proves it by building the image and running R1–R5's tests against it, or reports which package needs a script. F20's other half, the image's package list recorded in the release, is `bundler`'s third-party listing (F21, T35-6) if BOB extends it to the image; it is not here.
- **T37 (T37-16).** The binary's login prompts in a terminal: drive it through a pseudo-terminal with util-linux `script` in the pinned base, so R16 holds (K2200). The instance is named by its caller; today `agent-model` opens a fresh instance per conversation (`subscription.mjs`:106, `newUniqueId`), so a `signin` conversation needs the member's own instance, the caller's to name in the later entry that carries it (K2200). A container's disk is fresh after each sleep (Cloudflare Containers' architecture page), so the stored sign-in lasts only while the instance is awake (`src/worker.mjs`:23, `sleepAfter` 2 minutes); R19 and R2's `NOT_SIGNED_IN` make its loss visible to the caller, and whether to keep it longer is Bob's (K2200). The image is proven at the release's build when Docker is refused here (K1985). M-Q2 is measured at Bob's first own sign-in in the new member screens (K2147), not by this job.
- **T46 (T46-18).** The caller's half is not this module's: `agent-model` R14 answers an `image` block on the `signin` path `refused` `IMAGE_NOT_RELAYED` today, and `agent-worker` lifts `TRANSCRIBE_NEEDS_API_KEY` (its R72, T46-19). The image's dependency for `biosmoke7` is met by K2816 (4)'s copy into the account's registry. A page's picture may be up to `agent-worker`'s `TRANSCRIBE_IMAGE_MAX_BYTES` decoded; whether the connection's WebSocket message size admits it is measured at START, and a limit found is named to BOB, never worked round silently.
- **The Worker (T34-74).** A small entry beside `src/entry.mjs` (e.g. `src/worker.mjs`) over Cloudflare's Container class, with a `wrangler.jsonc` of its own; its build may use `bundler`'s `writeMember` as `agent-worker`'s does, in which case `uses` gains `bundler` (the job's COMPLETE states its final `uses`).
