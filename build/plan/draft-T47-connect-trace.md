# N1001 — The member's Claude sign-in ("Claude connect") on biosmoke7: trace, failure points, logging design

Research only (2026-10-12). Code read at `tranche/T47` @ 47474f1c37. The sign-in path is **byte-identical to release 0.83.0** (`main` @ b4dd9d2616): `git diff b4dd9d2616 HEAD` shows no change under `control-plane`, `screens-settings`, `interface-shell`, `agent-worker/src` or `agent-runner/src`. Only `credentials` changed on T47, so credentials lines are cited from the release copy (`git show b4dd9d2616:bio-plane/src/credentials/index.mjs`, written "cred@0.83.0:line").

Live, read-only, unauthenticated GETs to `https://biosmoke7.believeinoakland.workers.dev`:
- `/version` gives `0.83.0`.
- `/api/?op=bootstrap` gives `storeVersion 0.83.0`, `claimed true`, `test_instance true`, and `parts: signin present, scanner present, safe_view present`.
- `/app` gives 200 (480 KB). Its bundled screen code holds the same `connect` screen and act table; `subscriptionsignin` is in both the member and admin session-op sets, rung `none`.

Nothing was signed in, POSTed or changed.

**The headline finding:** this path has **never run end to end against the real Claude Code binary in the real container**.
- M-Q2 was "not measurable" with a machine credential (K2133).
- K3048's live check after the 0.83.0 deploy never signed in (K3051 (3)).
- Every test stubs the binary.

Bob's attempt is the path's first live run.

---

## 1. The flow, step by step

### 0. The page loads (every page, not only `connect`)
- The shell's `loadReach()` calls four ops at once (`interface-shell/browser.mjs:821`), including `POST /api/?op=subscriptionsignin {step:"state"}`.
- So **every page load wakes (or cold-starts) the member's own container instance** and runs `claude auth status --json` in it (below).

### 1. The `connect` screen's reads (`screens-settings/connect.mjs:12-33`)
| Read | Op | Purpose |
|---|---|---|
| `assistant` | `assistantstate` | |
| `keepaway` | `aikeptawaystate` | |
| `groupkey` | `groupkeystate` | |
| `notice` | `groupkeynotice` | |
| `disclosure` | `disclosureof` | `member` is `"admin"` for the founder, else `member:<id>` |
| `reference` | `accountreference` | |
| `signin` | `subscriptionsignin {step:"state"}` | |
| `boot` | `bootstrap` | |
| (panel) | `accountuses`, `ailimits`, `aiusage`, `accounthistory` | the AI account panel |

- The situation shown (`connect.mjs:59-63`) is "own" when **either** the runner's `state` says `connected:true` **or** `credentials` holds the connection fact (`ref.subscription.connected`).
- The subscription option is drawn only when:
  - the disclosure has been read (`connect.mjs:88-89`), and
  - `bootstrap.parts` has `signin present:true` (`connect.mjs:92-94`).
- `signin` "present" means only that agent-worker reports a `RUNNER` binding (`agent-worker/src/index.mjs:1765-1768`). It does not mean the container starts.

### 2. The member clicks "Read what connecting means"
- This is `disclosureshown`. `POST op=disclosureshown {member, version}` records that the disclosure was shown (instance-setup R54).

### 3. The member clicks "Open Anthropic's sign-in page" (`step:"start"`)
1. **Browser.** `POST /api/?op=subscriptionsignin`, body `{"step":"start"}`, session token in `Authorization` (`browser.mjs:64-74`; act at `connect.mjs:129-131`).
2. **Plane door** (`control-plane/index.mjs:2025-2043`, `control-plane/signin.mjs:73-98`):
   - **Keep-away check.** It asks the store's internal `aikeptaway` (store-door `dispatch.mjs:415`). It fails closed: if the store refuses, the door answers with the store's refusal; if the store is silent, the door answers `STORE_DID_NOT_ANSWER`.
   - **Disclosure check.** It asks `disclosureof?member=<by>`. If the disclosure has not been shown it answers 409 `DISCLOSURE_DUE` with nothing sent (`index.mjs:2029-2039`).
   - **Forward.** It sends `{member: <by>, step}` to `env.AGENT_WORKER.fetch("https://agent-worker/signin")` (`signin.mjs:51-58`). `by` is `admin` for the founder and `member:<id>` otherwise (`admission/index.mjs:322-330`).
   - **Endings of its own.** No binding gives 503 `AGENT_WORKER_UNBOUND`. A fetch that throws, or an answer that is not a JSON object, gives 502 `AGENT_WORKER_SILENT` (`signin.mjs:31-34, 58-61`).
3. **agent-worker** (`agent-worker/src/signin.mjs:42-84`):
   - Checks: `RUNNER` missing gives 503 `RUNNER_NOT_CONFIGURED`; bad body, member, step or code give 400 `BAD_*`.
   - It sends the step to `env.RUNNER.get(idFromName(member)).fetch("https://agent-runner/signin", {member})`. The runner instance is named by the member.
   - A throw gives 502 `RUNNER_SILENT` with the exception text. An answer that is not JSON gives 502 `RUNNER_SILENT "(status N)"`.
   - Otherwise the runner's status and body are passed through unchanged.
4. **agent-runner Worker class** (`agent-runner/src/worker.mjs`):
   - `AgentRunner extends Container`, with `sleepAfter = '2m'`, `enableInternet = false`, `allowedHosts = [api.anthropic.com, platform.claude.com]` (`fleet-member.json` `egress`) and `interceptHttps = true` (`worker.mjs:352-366`).
   - `containerFetch` starts the container if it is not running. In `@cloudflare/containers` 0.3.7 the start waits up to 8 s for the instance and 20 s for the port. On failure it answers **text/plain** 500 "Failed to start container: …", 503 "no Container instance available" or 429 (`container.js:864-880`, constants at :25, :29).
5. **Container, Node** (`agent-runner/src/entry.mjs`):
   - The server starts listening only after `await realSdk()` imports the Agent SDK (`entry.mjs:95-98`). This is part of the cold start.
   - `POST /signin` calls `signin.start(member)` (`agent-runner/src/signin.mjs:112-150`):
     - If another member's sign-in is recorded, it answers 409 `NOT_THIS_MEMBER`.
     - It **ends any waiting sign-in** (`:115`).
     - It spawns `script -q -f -e -c "<claude> auth login" /dev/null`. The environment is `HOME=~/signin/home`, `CLAUDE_CONFIG_DIR=~/signin/claude`, `TERM=dumb`, the telemetry and updater switches off, and `NODE_EXTRA_CA_CERTS` (`signin.mjs:65-73, 119-120`; `env.mjs`).
     - It waits up to **30 s** for output containing both `visit: <url>` and "Paste code here" (`:135-140`).
     - It checks the address is `https` on `claude.ai`, `claude.com` or `anthropic.com` (`:52-58, 147`), then answers 200 `{ok:true, address}`.
     - It keeps the login process alive, waiting at most 10 minutes for the code (`:148`).
   - **Verified in the pinned binary** (`@anthropic-ai/claude-agent-sdk-linux-x64@0.3.289`, its `claude`, `authLogin`):
     - It prints `Opening browser to sign in…`, then `If the browser didn't open, visit: <URL>` (wrapped in an OSC-8 hyperlink, which `plain()` strips), then `Paste code here if prompted > `.
     - It reads stdin line by line and splits the line on `#` into `code#state`. A line without `#` prints `Invalid code. Please make sure the full code was copied.` and keeps waiting.
     - Success prints `Login successful.` Failure prints `Login failed: <message>` and exits 1.
     - The binary's OAuth constants:

       | Constant | Value |
       |---|---|
       | `CLAUDE_AI_AUTHORIZE_URL` | `https://claude.com/cai/oauth/authorize` |
       | `MANUAL_REDIRECT_URL` | `https://platform.claude.com/oauth/code/callback` |
       | `TOKEN_URL` | `https://platform.claude.com/v1/oauth/token` |
       | `BASE_API_URL` | `https://api.anthropic.com` (profile and roles under `/api/oauth/...`) |
       | client id | Claude Code's own client metadata, `https://claude.ai/oauth/claude-code-client-metadata` |

       This matches K2211's egress ruling.
6. **Back in the browser.** `done()` stores `address` as `ui.signinAddress` (`connect.mjs:137`). The screen then draws the link "Open Anthropic's sign-in page in a new tab" (`<a target=_blank rel="noopener noreferrer">`, `connect.mjs:98`) and re-reads `signin`, which runs `state` again.

### 4. The member, on Anthropic's own page (their own browser; we see nothing)
- They sign in on `claude.com` / `claude.ai`, approve, and are redirected to `platform.claude.com/oauth/code/callback`, which **shows a code of the form `code#state`**.
- There is no redirect back to Civicsmith, so CORS and our callback URL do not arise.

### 5. The member pastes the code and clicks "Connect" (`step:"code"`)
1. **Browser.** `POST op=subscriptionsignin {step:"code", code}`, the code in the body only (`connect.mjs:132-133`).
2. **Door.** The keep-away check again, then the forward to agent-worker and the runner `/signin/code` (as step 3).
3. **Runner `code()`** (`signin.mjs:153-182`):
   - If no login is waiting for this member, or the process has exited, it answers 409 `NO_SIGNIN_WAITING` (`:157`).
   - Otherwise it writes `code\n` to the pseudo-terminal and waits up to **60 s** for:
     - `Login successful`, which answers 200 `{ok:true, connected:true, member}` and writes `~/signin/member`; or
     - `Login failed` / `Invalid code` / the process exiting, which answers 409 `SIGNIN_REFUSED` with the binary's words scrubbed of the code.
4. **Inside the binary** (the only external calls in the whole flow, all from the container through the Worker's HTTPS interception, `ContainerProxy` → `fetch()`):
   - `POST platform.claude.com/v1/oauth/token` (PKCE code exchange).
   - Then `api.anthropic.com/api/oauth/profile` and `/roles` (validation).
   - The binary writes `~/signin/claude/.credentials.json` (AT-27).
5. **Door, after a `connected:true` answer.** It calls the store's `subscriptionconnected?by=<member>` → `credentials.subscriptionConnected({member})` (cred@0.83.0:1555-1574), which writes the fact `subscription_connections(member_id, since)`. **The result is never inspected** (`control-plane/signin.mjs:91-96`).

### 6. Where the credential lives, and how it is used
- **Stored.** Only on the container's disk, in `~/signin/claude/.credentials.json`, written by the binary. That holds an OAuth access token (short-lived, roughly hours) and a refresh token. `credentials` holds only the fact that the member is connected (credentials R43; K1819).
- **Lifetime.** The container stops 2 minutes after the last request to it (`sleepAfter='2m'`, `worker.mjs:357`; the library renews activity only on proxied requests, `container.js:770-783, 889-891, 1686-1692`). Its **disk is fresh after a stop** (K2200 (8)). Bob accepted that "for now", to be decided again at M-Q2 (K2246).
- **Used.** In an ask, run or draft:
  1. `credentials.accountFor` answers `{kind:"signin", member}` when the member has no API key and a `subscription_connections` row exists (cred@0.83.0:1789ff).
  2. agent-worker → agent-model `signinConverse` → `RUNNER.get(idFromName(member))`, WebSocket `/conversation` (`agent-model/src/signin.mjs:166`).
  3. The runner checks `signin.serves(member)`: a `member` record **and** `claude auth status --json` reporting `loggedIn:true, authMethod:"claude.ai"` (`agent-runner/src/signin.mjs:101-109, 206-211`; the binary's status JSON was verified to carry these keys).
  4. It runs the Agent SDK with `CLAUDE_CONFIG_DIR` set to the sign-in directory (`runner.mjs:133-135, 164-167`).
  5. The binary calls `api.anthropic.com/v1/messages` with the OAuth token and refreshes it at `platform.claude.com` when needed.

---

## 2. Likely failure points, ranked

The symptom Bob saw is not recorded, so each point names the symptom it would produce.

### F1 (very likely). The container goes to sleep while Bob is on Anthropic's page, killing the waiting login
- **Evidence:**
  - `agent-runner/src/worker.mjs:357` sets `sleepAfter = '2m'`.
  - The library renews activity only when a request is proxied, and counts no in-flight work once the `start` request has answered (`container.js:770-783, 889-891, 1686-1692`). The waiting `script`/`claude auth login` process is invisible to it.
  - After 2 idle minutes `onActivityExpired()` calls `stop()` (`container.js:748-754`). That destroys the process, its PKCE verifier and the disk.
  - The code wait of 10 minutes (`signin.mjs:15, 148`) can never be reached: a first-time sign-in on claude.ai (an email login link or code, approval, copying the code) easily takes more than 2 minutes.
  - The `code` step then cold-starts a fresh instance with `waiting = null`.
- **Symptom:** "The sign-in timed out, or was never started. Open Anthropic's sign-in page again." (`NO_SIGNIN_WAITING`, `words.mjs:234`) after every attempt slower than about 2 minutes.
- **Second face, even on success:**
  - About 2 minutes after the last request, the stored sign-in is wiped.
  - `state` then answers `connected:false` and every ask fails `NOT_SIGNED_IN`.
  - Meanwhile `credentials` keeps the connection fact, so the screen still says "The assistant serves you on your own Claude subscription" (`connect.mjs:60`), and `accountFor` keeps routing asks to a runner that holds nothing.
- **To confirm:** Cloudflare's Workers Logs for the `agent-runner` Worker (observability is on, `agent-runner/wrangler.jsonc`). The library itself logs `Activity expired, signalling container to stop` (`container.js:749`). Such a line between Bob's start and code requests confirms F1. Alternatively, repeat with the code pasted within 90 seconds.

### F2 (likely, if Bob used the founder's session). The connection fact is refused for `admin`, and the refusal is swallowed
- **Evidence:**
  - The founder's session stamps `by = "admin"` (`admission/index.mjs:322-330`; K3051 (2)).
  - The runner instance is therefore named `admin` and the sign-in may succeed.
  - But `subscriptionConnected({member:"admin"})` requires `membership.memberFacts("admin").status === "active"` (cred@0.83.0:1564-1566). The founder's id is reserved, not a roster member (`admission` comment at :318-321), so this answers `ACCOUNT_MEMBER_NOT_ACTIVE`.
  - `control-plane/signin.mjs:94-95` awaits `store(...)` and **ignores the answer** (only a throw is caught, and none occurs).
  - `accountFor` then never serves the founder's sign-in.
- **Symptom:** "Connected" (from the runner's `state`) but the assistant refuses or says no account. After the container sleeps (F1), plain "not connected".
- **To confirm:** `whoami` on Bob's session (`member: "admin"`?). The `accounthistory` read on `connect` shows no `signin_set` change. A unit test of `subscriptionConnected({member:"admin"})` on a store holding only the founder.

### F3 (likely on the first try of the day). Cold start of a large image is longer than the library's 28 s start budget, or the first request reaches the container before it is up
- **Evidence:**
  - The image carries a roughly 246 MB `claude` binary plus Node and the SDK.
  - `entry.mjs:95-98` imports the SDK before `listen`.
  - The library allows 8 s plus 20 s (`container.js:25, 29`) and answers **plain-text** 500, 503 or 429.
  - agent-worker turns that into 502 `RUNNER_SILENT "answered with no JSON (status 500)"` (`agent-worker/src/signin.mjs:79-81`).
  - The page-load `state` call (step 0) also cold-starts the instance and may hit the same failure.
- **Symptom:** "Could not read this, because RUNNER_SILENT" beside the button. `RUNNER_SILENT` has no word of its own, so `browser.mjs:159-167` falls to `state.failed` with the bare code, and the useful status and detail are dropped.
- **To confirm:**
  - The Cloudflare dashboard: Containers › `agent-runner-agentrunner` › instances and their start times.
  - Workers Logs for `agent-worker` (status 500, 503 or 429 from the runner).
  - A retry within 2 minutes succeeding (warm).

### F4 (possible). The binary cannot complete OAuth through the container's egress
Three ways this could fail:
- **(a) TLS.** HTTPS is intercepted by the Worker's `ContainerProxy` (`container.js:196-265`, `interceptOutboundHttps('*')` at :1191-1193). The binary must trust Cloudflare's CA through `NODE_EXTRA_CA_CERTS=/etc/cloudflare/certs/cloudflare-containers-ca.crt` (`Dockerfile`). The binary does reference `NODE_EXTRA_CA_CERTS` (39 occurrences), so support is likely, but it is unproven live. Whether that file exists at that path is also unverified.
- **(b) A blocked host.** Any host the binary needs that is not in `allowedHosts` gets 520 "Origin is disallowed" (`container.js:209-211`). The token, profile and roles calls are covered (`platform.claude.com`, `api.anthropic.com`), but no live run has shown that nothing else is needed.
- **(c) Anthropic's side.** Anthropic's token endpoint could refuse a request arriving from a Cloudflare Worker egress.

- **Symptom:** "Anthropic's page did not accept that code: Login failed: …" (`SIGNIN_REFUSED` with detail, which is shown). Or, if it fails before an address is printed (unlikely, since the address needs no network), `SIGNIN_UNAVAILABLE`, whose detail the screen **drops** (`words.mjs:236` has no `{detail}`).
- **To confirm:** the `detail` in the `code` step's answer, from the browser's network panel (a response body, not a secret). An egress log (§3 L7) would show host, status and timing.

### F5 (possible). The code itself
- **(a)** Anthropic's page shows `code#state`. Copying only the part before `#` gives `Invalid code…`, which is `SIGNIN_REFUSED` (detail shown).
- **(b)** Clicking "Open Anthropic's sign-in page" **twice** ends the first login (`signin.mjs:115`). A code from the first tab then fails the state check: `Login failed`, or `NO_SIGNIN_WAITING` if the second start failed.
- **(c)** A start retried by the browser has the same effect.
- **To confirm:** the `detail` text of the refusal.

### F6 (certain to hamper diagnosis). Errors are swallowed or reduced to a bare code, and nothing is logged
- `SIGNIN_UNAVAILABLE`'s word ignores the runner's `detail` (`connect.mjs:139`, `words.mjs:236`).
- `RUNNER_SILENT`, `AGENT_WORKER_SILENT`, `NOT_THIS_MEMBER`, `BAD_CODE`, `BAD_MEMBER` and `RUNNER_NOT_CONFIGURED` (without translation) render as "Could not read this, because CODE" (`browser.mjs:159-167`).
- A `state` read that fails is silently treated as "not connected" (`connect.mjs:42, 59`; `browser.mjs:821-825`).
- `subscriptionConnected`'s refusal is ignored (F2).
- The runner "logs nothing of a request" (`entry.mjs:2-4`, R8), and neither the door nor agent-worker writes any log line on this path.
- No correlation id crosses the three hops. Only `storeSilent` and the plane's outer catch carry one (`answer-envelope/index.mjs:289-321`).

### F7 (possible, cost or load). A container per member is woken on every page load
- `loadReach` sends `state` on every app load (`browser.mjs:821`). Each one cold-starts the member's instance (with `max_instances` 10) and runs `claude auth status` (`signin.mjs:101-109`, a 20 s budget).
- Slow page loads and concurrent cold starts can make the `connect` reads fail or lag. A `state` that runs while a `start` is spawning shares the config directory.
- **To confirm:** container instance counts and starts in the dashboard against page loads.

### F8 (low, but a standing risk). Terms
- The flow drives Claude Code's own OAuth client inside a hosted product.
- AT-16 and AT-19 say third-party developers may not offer Claude.ai login in their own apps. AT-18 says an end user may sign in to the unmodified, platform-hosted binary. AT-17 bars developers from collecting or intermediating Claude.ai credentials, and our page relays the code.
- U-7 (a) to (d) are open. AT-25: Anthropic may enforce without notice.
- A refusal by Anthropic at the authorize page or token endpoint would surface as F4's `Login failed`.
- Not a likely technical cause today, but the main policy exposure. See §4.

### F9 (low). Configuration on the instance
- `bootstrap.parts.signin present` proves only that the `RUNNER` binding exists (`agent-worker/src/index.mjs:1765-1768`). It does not prove that the container application (`agent-runner-agentrunner`, updated in K3048, version e338042e, image `…@sha256:9fcf5ee5…`) can pull and start.
- `AGENT_WORKER` must be bound on the plane; if it were not, the result would be `AGENT_WORKER_UNBOUND` with its own word.
- No secret is needed on this path. CORS and callback URLs are not involved (same-origin `/api/`, and Anthropic's own manual-code callback).
- **To confirm:** `GET /version` of agent-worker through the plane (agent-worker R30 `runner:true`); the container application's status in the dashboard.

### F10 (low). Token expiry and renewal
- An access token lasts hours and is refreshed at `platform.claude.com` (allowed).
- `keepOnly` (`runner.mjs:189`, `signin.mjs:228-231`) deletes new paths in the config directory after each conversation. A renewal that writes a new file name, rather than overwriting `.credentials.json`, could be removed. Unverified.
- F1 wipes the disk long before expiry matters.

---

## 3. Logging design

### Principles
- Each hop writes **one JSON line per step** with `console.log`. Workers Logs is already enabled on the plane, agent-worker and agent-runner (`observability.enabled`).
- **Never log** a code, token, secret, address query, cookie, header or request body (K1874; credentials R43; agent-worker R67; agent-runner R8).
- The member id is not a secret (K1819), but it is logged as `member_ref` = the first 12 hex characters of `sha256(instance-salt + member)`. On the test instance the bare id is allowed (gated by `CIVICSMITH_TEST_INSTANCE`, as `test_instance` already is).
- **Readable by BOB**, in two ways:
  - (a) Workers Logs (dashboard, `wrangler tail`, or the Observability API) under the pinned account.
  - (b) A bounded trace kept in the store and read through an administrator op that answers **only on the test instance**. BOB can then read a failure with Bob's session or the test credential, and Bob can read it on the screen.

### Correlation
- The door mints `trace` (a UUID) for each `subscriptionsignin` request.
- It sends `trace` to agent-worker in the header `x-civicsmith-trace`, never in the body beside the code. agent-worker passes the same header to the runner.
- Every log line and every refusal answer carries `trace`.
- A sign-in attempt also gets `attempt` (a UUID minted by the runner at `start`, returned in the `start` answer and sent back with `code`), so a start and its code can be joined.

### Candidate requirement lines

**control-plane**
- **R65a** Each `subscriptionsignin` request is given a fresh `trace`.
  - The door writes one log line `{event:"signin.door", trace, step, member_ref, outcome, code?, status, ms_total, ms_agent_worker, kept_away_ms, disclosure_ms}`. `outcome` is `sent`, `refused_local` or `relayed`; `code` is the refusal code (its own, or the relayed `code`/`reason`).
  - It never logs the body, the `code` field, the `address`, or any answer's `detail`.
  - It sends `trace` to agent-worker in `x-civicsmith-trace` and adds `trace` to every answer, success or refusal.
  - Test: a sentinel code appears in no log line and no answer.
- **R65b** The result of `subscriptionconnected` is read, not ignored. A refusal or silence writes `{event:"signin.fact", trace, member_ref, outcome:"refused"|"silent", code}` and adds `fact:{recorded:false, code}` to the relayed answer. The answer's status is unchanged (credentials R43 stays a fact, never a gate).
  - Test: founder `admin` → `fact.recorded false`, code `ACCOUNT_MEMBER_NOT_ACTIVE`.
- **R65c** (test instance only) Each `signin.door` line is also kept in a bounded store trace (last 200 lines or 7 days, whichever is smaller). The trace holds the fields above plus the agent-worker and runner fields relayed in the answer's `trace_detail`, and is read by `op=signintrace` (administrator, `test_instance:true` only; any other instance answers `NOT_TEST_INSTANCE`).

**agent-worker**
- **R66a** `POST /signin` reads `x-civicsmith-trace` and writes one line `{event:"signin.worker", trace, step, member_ref, outcome, code?, runner_status, runner_content_type, ms_runner, runner_text_bytes}`.
  - When the runner answers non-JSON, the line adds `runner_text_head` (the first 120 characters, scrubbed: the code removed and the URL query removed). This is how the library's "Failed to start container: …", "no Container instance available" and 429 texts become visible (F3).
  - The `RUNNER_SILENT` answer gains `runner_status` and `runner_text_head`.
  - It never logs the code or the address.
  - Test: sentinel code; a stub runner answering `text/plain` 500.

**agent-runner (container)**
- **R8a** (amends R8 "logs nothing") The runner writes one line per sign-in step to stdout, which Cloudflare carries to the container's logs: `{event:"signin.runner", trace, attempt, step, member_ref, outcome, code?, ms, cold:boolean, uptime_s, binary_present, binary_exit?, said_head?}`.
  - `said_head` is the binary's last words (at most 200 characters), passed through `plain()`. Any copy of the code is removed, and so is anything matching a URL query, `sk-ant-…`, a JWT or a 32+ character base64url run.
  - `start` also logs `address_host` (the hostname only) and `ms_to_address`. `code` logs `ms_to_outcome`. `state` logs `logged_in`, `auth_method` and `ms_status`.
  - It never logs `.credentials.json`, its paths' contents, the address path or query, or the code.
  - Test: a stubbed binary echoing a sentinel code and a sentinel token; neither appears in stdout.
- **R17a** `start` answers `attempt` (a UUID). `code` takes an optional `attempt`; a mismatch answers 409 `ATTEMPT_SUPERSEDED` (F5 (b) made visible).
  - The answers to `start`, `code` and `state` carry `trace_detail:{ms, cold, uptime_s, waiting_age_s?}`, a closed list of non-secret fields that the door keeps (R65c).
- **R13a** (the Worker class, `worker.mjs`) The class logs its lifecycle: `{event:"runner.lifecycle", instance_ref, what:"start"|"started"|"activity_expired"|"stop"|"error", ms?, error_head?}` (overriding `onStart`, `onStop`, `onActivityExpired` and `onError`, calling super). F1 then shows as `activity_expired` between a start and its code.
- **R10a** (egress) The class's outbound handler for each allowed host logs `{event:"runner.egress", instance_ref, host, method, path_template, status, ms}`.
  - `path_template` is the path with any segment longer than 24 characters replaced by `:id`. It never includes the query, a header or a body.
  - Disallowed hosts are logged with `status:520`.
  - This is how **Anthropic's HTTP status** for `/v1/oauth/token`, `/api/oauth/profile` and `/v1/messages` becomes visible without touching a token (F4).

**credentials**
- **R43a** `subscriptionConnected` refusals carry the member's status in a closed form (`member_status: "absent"|"revoked"|"pending"|…`), so the door's R65b line names why. This is a fact about the roster, not a secret.

**screens-settings**
- **R5a** Every refusal of `subscriptionsignin` is drawn with:
  - its code;
  - the answer's `detail` where the code's word has a `{detail}` fill (adds `{detail}` to `SIGNIN_UNAVAILABLE`, and new words for `RUNNER_SILENT`, `AGENT_WORKER_SILENT`, `NOT_THIS_MEMBER`, `ATTEMPT_SUPERSEDED` and `BAD_CODE`);
  - "Reference: <first 8 of trace>".
  It never draws the code the member typed. A `state` read that fails is said ("couldn't check your sign-in just now", with the reference), never drawn as "not connected".

**interface-shell**
- **R13a** A refusal answer's `trace` is drawn as a reference beside any act's refusal (generic). It is kept nowhere in the browser.

**instance-setup** (optional)
- **R17a** `bootstrap.parts.signin` adds `warm_check` only on the test instance, from `op=signintrace`'s last `state` line: `last_state_ok` and `last_state_at`. Booleans and a time only.

### What BOB reads, for one failed attempt
- One `trace` from Bob's screen. Then, under that `trace`: `signin.door` → `signin.worker` → `signin.runner` (plus `runner.lifecycle` and `runner.egress` around it by time and instance).
- This gives:
  - where it stopped;
  - the refusal code;
  - the runner's or library's status;
  - Anthropic's HTTP status on the token call;
  - timings: cold start, time to address, time between start and code against the 120 s sleep, time to outcome;
  - whether the container slept in between.

---

## 4. Questions that are Bob's

### B1. How long should a member's sign-in last? (money; K2246 said "decided again at M-Q2")
The plain facts:
- Today the sign-in lives only inside a small computer (a container) that Cloudflare switches off 2 minutes after its last use. Switching it off erases the sign-in.
- So a member would have to sign in with Claude almost every time they use the assistant.
- Keeping that sign-in alive longer means paying Cloudflare to keep a container running per member while they are signed in.

| Option | What it means | Cost and risk |
|---|---|---|
| **A** (recommended) | Keep a member's container awake while they are active, for example up to 1 hour after their last use. They sign in again after that. | A bounded per-member cost. BOB prices it before you decide. |
| **B** | Keep it awake all day, every day, for each connected member. | Highest cost, grows with members. |
| **C** | Save the sign-in somewhere that survives the switch-off (a copy of the stored login). | Low cost, but it means the group's copy holds the member's Claude login, which the terms may forbid (AT-17; U-7 (c)). Not recommended. |
| **D** | Drop subscription sign-in for now and use API keys (the member's own, or the group's). | No container cost. Members pay Anthropic per use. |

What is not a question for Bob: keeping the container awake for the 10 minutes a sign-in waits for its code is a fix BOB makes, not a policy.

### B2. Should we ask Anthropic before relying on this sign-in? (terms)
- The product starts Claude Code's own login on Anthropic's page and passes the code the member copies into the hosted Claude Code.
- Anthropic's pages both allow an end user to sign in to hosted, unmodified Claude Code (AT-18) and forbid third-party apps from offering Claude.ai login or intermediating credentials (AT-16, AT-17, AT-19). Which one applies to us is not stated (U-7 (a) to (d)).
- Anthropic says to ask its sales team (AT-25) and may enforce without notice.

| Option | What it means |
|---|---|
| **A** (recommended) | Keep testing on biosmoke7 only, and ask Anthropic in writing now, before any group uses it. |
| **B** | Proceed without asking. |
| **C** | Stop the subscription path and use API keys only. |

### Note for Bob (not a question)
If Bob wants the assistant working while this is fixed, the same `connect` screen offers "With your own Claude API key". That path does not use the container.
