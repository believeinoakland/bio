# Draft: L6 entries for "Claude connect" (N1001; K3060 D10, K3061 D10; K1874)

Drafted 2026-10-13 for BOB, on `tranche/T47`. Inputs read whole: `build/plan/draft-T47-connect-trace.md` (the trace, cited "trace §n / Fn"), `build/requirements/agent-runner.md` and `agent-worker.md`, `credentials.md`'s Public part, `control-plane.md` R65 and `screens-settings.md` R4–R5, and the code: `agent-runner/src/{worker,entry,signin,runner,env}.mjs`, `agent-worker/src/signin.mjs`, `agent-model/src/signin.mjs`, `@cloudflare/containers@0.3.7` `dist/lib/container.js`, and the pinned binary (`@anthropic-ai/claude-agent-sdk-linux-x64@0.3.289`, its `claude`).

## 0. What the code shows (why the design is what it is)

- **Layers (`modules.json`).** L6, in this order: … `agent-harness`, `agent-model`, `agent-runner`, `agent-worker`; `ai-runs` is also L6. `credentials` is **L2** (closed). `control-plane`, `plane`, `store-door`, `screens-settings`, `interface-shell`, `instance-setup`, `op-declarations`, `answer-envelope` are **L11**.
- **F1 can be fixed in the Worker class.** In `container.js` 0.3.7, `alarm()` calls `onActivityExpired()` when `isActivityExpired()`, then `renewActivityTimeout()` (:1566–1569). The default `onActivityExpired()` calls `stop()` (:748–754). A subclass that overrides it and does not stop while a sign-in waits keeps the container up; the alarm checks again one `sleepAfter` later. `inflightRequests` does not count the waiting login, because the `start` request has already answered.
- **The held token is feasible with the binary's own `setup-token`, not by capturing `auth login`'s files.**
  - The pinned binary has `setup-token` ("Set up a long-lived authentication token (requires Claude subscription)").
  - Its flow uses the same manual-code prompt (`"Paste code here if prompted > "` appears in its Ink component).
  - On success it prints `Long-lived authentication token created successfully!`, `Your OAuth token (valid for <n>): <token>` and `Store this token securely. You won't be able to see it again.`, then `Use this token by setting: export CLAUDE_CODE_OAUTH_TOKEN=<token>`.
  - The binary reads `CLAUDE_CODE_OAUTH_TOKEN` (and `CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR`). Such tokens are "inference-only", which is all an Agent SDK query needs.
  - AT-22 (`build/terms/anthropic.md`) states the same: "the same browser authorization flow as `/login` … the token prints to the terminal … It does not save the token anywhere … a one-year OAuth token".
  - So a sleeping container loses nothing: the token is supplied again for each conversation, and no refresh token has to be kept in step.
- **Why not capture `auth login`.** `auth login` writes `.credentials.json` (an access token plus a rotating refresh token). Holding a copy means writing it back before each use and reading the renewed one back after, with races between conversations. It would also break R8 ("never reads the stored sign-in") in a worse way. Rejected.
- **The token must travel the account wire.** The container reaches no plane (agent-worker R35). The token therefore goes up the sign-in path to the door (`code` answer: runner → agent-worker → door → `credentials`). It comes back down on every act as the `signin` account's `secret`: `credentials.accountFor` → caller → agent-worker R6 → agent-model R2 → runner R2.
- **Today every wire site strips a sign-in's secret on purpose:**
  - `ai-runs/index.mjs`:2083, :3141 (L6);
  - `plane/ask.mjs`:186–200 `wireAccount`, for ask and draft (L11);
  - `plane/transcribe.mjs`:102–105 (L11).
- **Library limits that bear on logging.**
  - The class can log Anthropic's HTTP status with `static outboundByHost` handlers, one per allowed host (`container.js`:224–231).
  - A host outside `allowedHosts` is answered 520 by the library *before* any handler runs (:209–211), so it cannot be logged there.
  - A container that fails to start is answered by the library in plain text (500 "Failed to start container", 503, 429; trace F3). The class can catch that and answer JSON.

## 1. Requirement lines

Next free ids: agent-runner R25, agent-model R16, agent-worker R81 (credentials R65, control-plane R82, screens-settings R17, interface-shell R32 for the notes in §2 and §3).

### 1.1 agent-runner (L6)

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
  - *(not yet met: T47)*
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
  - *(not yet met: T47)*
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
  - *(not yet met: T47)*
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
  - *(not yet met: T47)*
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
  - *(not yet met: T47)*
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
  - *(not yet met: T47)*
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
  - *(not yet met: T47)*

R23 and R17's sentences that U-7 is open ("No text of this module says Anthropic's terms allow the sign-in"; "whether starting it … stays open (U-7 (b))") are re-worded to cite K3061: Bob settled U-2 and U-7 as allowed. Wording only.

### 1.2 agent-model (L6)

- **R16** (b; K3060 D10; amends R2) A `signin` reference carries the held token.
  - **The reference.** It is `{kind: "signin", member, secret}`. `secret` (the token `credentials` holds) is sent only inside the conversation request's credential, `{kind: "signin", member, secret}`, in the first message on the WebSocket to the member's own instance (`agent-runner` R28). It is never logged, put in a trace, in `usage`, in an outcome or in its `detail`, or sent anywhere else.
  - **Headers.** The upgrade request carries `x-civicsmith-trace` and `x-civicsmith-member-ref` when the caller gave them, and nothing secret.
  - **Refusals.**
    - A `signin` reference with no non-empty string `secret` answers `refused` with type `SIGNIN_NOT_HELD`, making no call.
    - The runner's `SIGNIN_NOT_HELD` and `SIGNIN_TOKEN_REFUSED` are `refused` with that type, never reworded (R2).
  - **Tests:**
    - a sentinel `secret` reaches the stub runner's first frame only, and no outcome, usage or detail;
    - no `secret` gives `SIGNIN_NOT_HELD` with no runner call;
    - control: an `apikey` reference is unchanged.
  - *(not yet met: T47)*

### 1.3 agent-worker (L6)

- **R81** (b; K3060 D10; K1874; amends R66, R67, R36) A `code` answer's token goes to the door once.
  - **Relayed under `hold`.** When the runner's `code` answer carries `token`, this module relays it only when the door's request body states `hold: true`: the door's statement that it hands the token to `credentials` and removes it from what the member's browser sees (`control-plane`, §3). The answer is then relayed unchanged.
  - **Dropped without it.** Without `hold: true`, `token` and `valid_for` are removed and the answer gains `held: false`, so no token can reach a browser through a door that does not hold it.
  - **Never kept.** The token is never logged, stored, echoed in a refusal, or sent anywhere else. It exists here only between reading the runner's body and writing the answer.
  - **Tests**, with a stub `RUNNER` answering a sentinel token:
    - with `hold: true`, the sentinel is in the answer once and in no log line;
    - without it, it is in no answer and `held: false`;
    - control: a `start` answer is relayed unchanged.
  - *(not yet met: T47)*
- **R82** (b; K3060 D10; amends R6, R32, R33, R71) A `signin` account carries its `secret`, the token `credentials` holds for that member (`credentials` need C2).
  - **Wire shape.** On the wire it is `{kind: "signin", level: "member" | "project", member, secret, suggestions?}`. It is handed to `agent-model` as `{kind: "signin", member, secret}` (its R16).
  - **What lifts.** R6's refusal of a `signin` account carrying a `secret` (`BAD_ACCOUNT`) is lifted.
  - **No secret.** A `signin` account with no non-empty `secret` is refused 409 `SIGNIN_NOT_HELD` before any plane write or model call, its `detail` saying the member connects their Claude account again.
  - **Unchanged.** R32's cascade judges a `signin` account `available` when its `member` equals the wire's `member` and its `secret` is non-empty. R36 holds: the secret is never stored, logged or echoed.
  - **Tests:**
    - for `/ask`, `/run`, `/draft` and `/transcribe`, a `signin` account with a sentinel `secret` reaches the stub runner's first frame, and no answer, trace or log line;
    - none gives `SIGNIN_NOT_HELD`;
    - control: an `apikey` account is unchanged.
  - *(not yet met: T47)*
- **R83** (c; trace §3 R66a; K1874) `POST /signin` writes one JSON line per step.
  - **Headers.** It reads `x-civicsmith-trace` and `x-civicsmith-member-ref` (minting a `trace` when absent) and passes both to the runner.
  - **The line.** `{event: "signin.worker", trace, step, member_ref, outcome, code?, runner_status, runner_content_type, ms_runner, runner_text_bytes, held?}`.
  - **A non-JSON runner answer.** The line adds `runner_text_head`: the first 120 characters, with the code, any URL query and anything token-shaped removed (R29's scrub). The `RUNNER_SILENT` answer gains `runner_status` and `runner_text_head`.
  - **Never logged:** the code, address, token, body or any header but the two named.
  - **Tests:**
    - sentinel code and sentinel token in no line;
    - a stub runner answering text/plain 500 is logged with its status and head, and answered `RUNNER_SILENT` carrying both.
  - *(not yet met: T47)*
- **R84** (d; trace F6; amends R43's reach, not its rule) Every `/signin` answer carries `trace`, and every refusal reaches the member in words.
  - **`trace` added.** Every `/signin` answer, success or refusal, its own or the runner's relayed, carries `trace`. Adding it rewords nothing (R43).
  - **Its own refusals.** `RUNNER_NOT_CONFIGURED`, `BAD_BODY`, `BAD_MEMBER`, `BAD_STEP`, `BAD_CODE` and `RUNNER_SILENT` each carry a `detail` written for the member in DEC-149's words (R64).
  - **The list for `words.json`.** The module exports `SIGNIN_CODES`, every code `/signin` can answer: its own, plus `agent-runner`'s R17–R20, R26–R28 and R31 codes, `SIGNIN_NOT_HELD` and `SIGNIN_TOKEN_REFUSED`. The design stream's `refusal.<code>` keys are checked against it at L11 (§3).
  - **Tests:**
    - each own refusal carries `trace` and a `detail` with no place word;
    - a relayed runner refusal is unchanged but for `trace`;
    - `SIGNIN_CODES` equals the codes the module and the runner's tests produce.
  - *(not yet met: T47)*

### 1.4 ai-runs (L6): one sentence, the run's wire

- **ai-runs R18** (amend; K3060 D10) The run's dispatch carries a `signin` account's `secret`, `accountFor`'s `key` (the held token, credentials need C2), as it carries an API key's.
  - This replaces the T38 sentence "no `secret` key at all" (`index.mjs`:2083, :3141).
  - The secret stays where an API key's does: never logged, stored or answered.
  - **Tests:**
    - a sentinel token held for the payer reaches the stub agent-worker's `account.secret` and no record;
    - control: an `apikey` account is unchanged.
  - *(not yet met: T47)*

### 1.5 What credentials (L2) must provide. Out of layer: Bob's approval, asked in K3062/K3064, "D10 held tokens"

- **C1 · hold.** `subscriptionTokenHold({member, token, validFor})` is in-plane only, reached by no route and answered to no viewer; the door calls it after a `code` answer.
  - It seals the token under `member` as R23 seals a reference, `export: "never"`, `sight: "owner"`, replacing any earlier one, and records the fact R43 records ("connected", with the instant).
  - It answers `{ok, since}`, never the token or a digest of it.
  - Refusals, each writing nothing: `member` not active `ACCOUNT_MEMBER_NOT_ACTIVE` (but see C5 for the founder); a token not a string of 20 to 2,000 characters `SUBSCRIPTION_TOKEN_MALFORMED`.
  - It amends R43's "never holds … a token", and R22's retirement of the `subscription` kind stays: a member never types a token; it arrives only from the sign-in.
- **C2 · answer.** `accountFor` (R35, R56) answers a held sign-in as `{kind: "signin", level, member, key}`, `key` the unsealed token. It is used for the one call it serves, as R24's reference is.
  - A "connected" fact with no token held (every connection made before T47) is answered as not connected. `SIGNIN_NOT_HELD` is the code when a sign-in account is otherwise chosen, as for a project's sign-in account (R54).
- **C3 · drop.** `subscriptionDisconnect` (R43), the member's revocation (R16) and `projectSigninSet`'s clearing (R54) remove the held token with the fact. Its removal is a change in R61's history (never the token).
- **C4 · refused at Anthropic.** `subscriptionTokenRefused({member})` is in-plane only and called when an act on that token is answered `SIGNIN_TOKEN_REFUSED`. It drops the token and records `refused_at`, so `accountReferenceState` (R23) answers `subscription: {connected: false, refused_at}`, and the member is told once to connect again. This is the "revoked on the Anthropic side" half of D10.
- **C5 · the founder.** The founder's own act (`by` `admin`, once claimed) may hold a sign-in as an account holder, as R46 treats the founder ("the founder included"). Today `subscriptionConnected({member: "admin"})` is refused `ACCOUNT_MEMBER_NOT_ACTIVE`, and the door ignores the refusal (trace F2). D11 (Bob tests on his own subscription) needs this.
- **C6 · state.** `accountReferenceState` answers `subscription: {connected, since, held, valid_until?, refused_at?}`. It is computed from `validFor` when the binary stated a whole number of days or years, else omitted.
- **C7 · status line.** The credentials requirement status names K3060/K3061 D10 as replacing K1819's "held only on the container's disk".

## 2. Plan entries (L6; next free numbers after T47-77)

- **T47-78 · agent-model** · (N1001, K3060 D10, K3061 D10) R16: a `signin` reference carries the held token as `secret`, sent only in the conversation request's credential; `SIGNIN_NOT_HELD`, the runner's `SIGNIN_TOKEN_REFUSED` passed as types; trace headers forwarded; R2 amended · text BOB's.
- **T47-79 · agent-runner** · (N1001, K3060 D10, K3061 D10; K1874) R25: the container held awake through a sign-in (the class's `onActivityExpired` hold, start to outcome, at most 10 min 90 s); R26: listen before the SDK loads, a failed start answered JSON `RUNNER_NOT_STARTED`; R27: `start`/`code` run the binary's own `setup-token` (AT-22), and the token it prints is answered once in the `code` answer, the instance storing no sign-in; R28: conversations on the held token through `CLAUDE_CODE_OAUTH_TOKEN` in the query's environment only, `SIGNIN_NOT_HELD`, `SIGNIN_TOKEN_REFUSED`; R29–R30: one JSON line per step, conversation, lifecycle event and egress call (Anthropic's HTTP status), never a token, secret or code; R31: `attempt`, `ATTEMPT_SUPERSEDED`, member-readable `detail` and `trace` on every refusal; R2, R8, R9, R12, R17–R23 amended (R23/R17's U-7 sentences cite K3061) · the image rebuilt and published by the release (N780) · START measures `setup-token` under `script` in the image up to its address and prompt (doubt 1) · text BOB's.
- **T47-80 · agent-worker** · (N1001, K3060 D10; K1874) R81: a `code` answer's token relayed only under the door's `hold: true`, else dropped (`held: false`); R82: a `signin` account carries `secret` (R6's refusal lifted), `SIGNIN_NOT_HELD`; R83: one JSON line per `/signin` step, trace and member-ref headers passed on, `RUNNER_SILENT` with the runner's status and text head; R84: `trace` on every answer, member-readable `detail` on its own refusals, `SIGNIN_CODES` exported for the words; R66, R67, R6, R32, R36 amended · after T47-78, T47-79 · text BOB's.
- **T47-20 · ai-runs** (gains) · (K3060 D10) R18: the run's dispatch carries a `signin` account's `secret` (the held token) as an API key's; the T38 "no secret" sentence retired · text BOB's.

**L6 merge order (amended):** accepted-work, steps, citation, basis-versions, strength, run-rules, ai-use, ai-runs, capture-requests, skills, agent-harness, **agent-model, agent-runner,** agent-worker. Counts: L6 12 → 14 (T47-78, T47-79 added; T47-20 widened). Total 75 → 77.

**Outside L6 (BOB's, recorded with these):** the out-of-layer **credentials** job (C1–C7) must merge before L6's sign-in tests can run end to end. L6's own tests stub `credentials` and stand alone.

## 3. Notes for L11 (control-plane, plane, screens-settings and their neighbours)

**control-plane** (R65 amended; new R82–R85)
- **Trace.** Mint `trace` per `subscriptionsignin` request. Send it and `member_ref` (the first 12 hex characters of `sha256(instance salt + by)`; the bare id on the test instance) to agent-worker in `x-civicsmith-trace` and `x-civicsmith-member-ref`. Write one line `signin.door` (trace §3 R65a). Add `trace` to every answer.
- **The hold.** Send `hold: true` on `code`. On an answer carrying `token`:
  - call `credentials.subscriptionTokenHold({member, token, validFor})` (C1);
  - **read its result** (trace F2);
  - remove `token` and `valid_for` before answering;
  - answer `held: true` or `held: false, fact: {code}`.
  The token is never logged, stored elsewhere, or put in an answer.
- **`state` from credentials.** Answer `state` from `credentials.accountReferenceState`'s `subscription` (C6), not from the runner, so a page load no longer wakes a container (trace F7). Send `state` to the runner only while an attempt is known to wait, or drop that use.
- **Dropping.** `subscriptiondisconnect` and revocation drop the token through `credentials` (C3) and send `signout` to end any waiting attempt.
- **`SIGNIN_TOKEN_REFUSED`.** When an ask, draft, run or transcription answers it, call `credentials.subscriptionTokenRefused` (C4). The door sees ask and draft answers. For runs, `ai-runs` is the caller, at L6 or L11: BOB's at START.
- **`signintrace`.** A bounded trace store and `op=signintrace` on the test instance only (trace §3 R65c), with `op-declarations`, `op-grades` and `answer-envelope` rows for the new door codes.
- **The founder.** Exercised: Bob's founder session connects (C5).

**plane** (`ask.mjs` `wireAccount`, `transcribe.mjs`): put a `signin` account's `secret` (`accountFor`'s `key`) on the wire, as for `apikey`, for ask, draft and transcribe. Retire the "no secret for a sign-in" comments and tests.

**screens-settings** (R5 amended; R17 new)
- **Words.** Every `subscriptionsignin` refusal is drawn in words with "Reference: <first 8 of trace>". There is a `refusal.<code>` word for each `SIGNIN_CODES` entry (agent-worker R84), plus `{detail}` where the word has a fill (`SIGNIN_UNAVAILABLE`, `SIGNIN_REFUSED`, `RUNNER_NOT_STARTED`). The code the member typed is never drawn.
- **A failed `state` read** is said ("couldn't check your sign-in just now", with the reference), never drawn as "not connected".
- **Connected** draws "since <date>" and "valid until …" when known (C6).
- **Refused at Anthropic** draws once: "Anthropic no longer accepts your sign-in; connect again".
- **The code field** tells the member to copy the whole code, `#` part included (trace F5 (a)).
- **"Open Anthropic's sign-in page"** is disabled while a start is in flight (trace F5 (b), (c)).

**interface-shell** R13: a refusal's `trace` is drawn as a short reference beside any act's refusal (generic), and kept nowhere in the browser.

**instance-setup** (optional) R81: `part_signin` stays the binding's presence. `warm_check` from `signintrace` on the test instance only (trace §3).

**Design stream (HANDOFF):** the words for `SIGNIN_CODES` (new: `RUNNER_NOT_STARTED`, `ATTEMPT_SUPERSEDED`, `SIGNIN_NOT_HELD`, `SIGNIN_TOKEN_REFUSED`, `RUNNER_SILENT`, `AGENT_WORKER_SILENT`, `NOT_THIS_MEMBER`, `BAD_CODE`), the reference line, the "connect again" notice and the "valid until" line.

## 4. Doubts, each with a recommendation

1. **`setup-token` run headless.** It is an Ink UI. In `script` with `TERM=dumb` it may:
   - wrap its long address and the token at the terminal width (the address follows "Browser didn't open? Use the url below to sign in", not `auth login`'s `visit:`);
   - show an onboarding or "press Enter" screen first.
   **Recommend:**
   - START runs the real binary in the image, under `script` with wide columns (`stty cols 4000` inside the `-c` command, `COLUMNS`), up to its address and prompt. No network is needed to print the address.
   - It records the exact strings and pins them in tests. It never types anything but the code (AT-26).
   - The token's parse is proven against the binary's own strings; its live proof is Bob's next sign-in (M-Q2).
   - If START finds `setup-token` cannot be driven, R27/R28 wait for T48, and R25, R26, R29–R31 land alone. Capturing `auth login`'s refresh token is not the fallback (rotation races, R8).
2. **The credentials job is not yet approved** (asked K3064). **Recommend:**
   - Keep L6 as drafted. Its tests stub `credentials`, and agent-worker R81's `hold` guard keeps the token out of every answer until the door holds it.
   - If Bob refuses, keep the token in the member's `AgentRunner` Durable Object storage as a T47-only interim, moved into `credentials` first in T48 (BOB's technical choice, P17). Under the interim, the class strips the `token` from the `code` answer, stores it, injects it as a header on the member's conversation upgrade to its own container, and erases it on `signout`.
   - Do not re-ask Bob about terms (K3061).
3. **Ordering L6 before L2's credentials job and L11's door.** On `tranche/T47` between merges, a `signin` account has no `secret`, so the sign-in path answers `SIGNIN_NOT_HELD`. That is no worse than today, where the container's sleep wipes the sign-in. **Recommend:** accept, named as an accepted red for the plane's sign-in suites until T47-65/T47-66 and the credentials job. Nothing is released in between.
4. **Egress to a host not on the list is not logged** (the library answers 520 before any handler). **Recommend:** accept. R29's `said_head` and R30's lifecycle cover it. Do not move the allow-list into our own handler (R10 keeps it in configuration).
5. **`member_ref` needs a salt L6 does not hold.** **Recommend:** the door computes it and sends it as a header (§3). L6 logs what arrives, else `null`, never the bare id.
6. **The token's validity window.** AT-22 says one year. **Recommend:** read `valid_for` from the binary's own words, not a constant. `credentials` computes `valid_until` only from a whole number of days or years, and the screen shows it.
7. **Cost of the hold.** At most about 11.5 minutes of one container per sign-in attempt, then the ordinary 2-minute sleep. D10 ("kept active … without any additional costs") and the held token make B1 (keep-awake pricing) moot. **Recommend:** no question to Bob. Record in `rulings.md` as BOB's, and close the trace's B1 and B2 as settled by K3060/K3061.
8. **The member-named instance.** With nothing stored, any instance could serve. **Recommend:** keep naming by member (agent-model R2) so one member's conversations never share a process with another's. `NOT_THIS_MEMBER` narrows to a waiting attempt.
9. **The SDK's authentication-failure strings for `SIGNIN_TOKEN_REFUSED`** are not yet fixed. **Recommend:** START greps the pinned binary for its 401/expired-token messages and pins them. An unrecognised failure stays `SDK_ERROR` (never guessed as refused).
