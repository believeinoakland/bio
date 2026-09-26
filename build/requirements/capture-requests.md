# capture-requests — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18, N35), from a reading of the code; for Bob's approval (a product module, P17). Layer 6. Code today: `bio-plane/src/store.mjs` 44506–45407 (`captureRequest` 44579–44830, `#captureRequestAttribution` 44832–44865, `captureRequestDrain` 44869–45103, `#renderHoldReason` 45109–45115, `#captureRequestConduct` 45117–45218, `#captureRequestHostHeld` 45223–45226, `#captureRequestMemberAgent` 45232–45239, `#fireCaptureRequest` 45257–45294, `captureRequestDraining` 45304–45328, `captureRequests` 45340–45406, with the constants and `#captureRequestTickMs`, `#captureRequestConfigured`, `#captureRequestPending` at 44546–44571), the alarm consumer `capture-request-drain` (3675–3695) and the four store-op routes (53866–53885). `bio-plane/src/index.mjs`: the OPS rows (1552–1579), `captureRequestArm` (3963–4025) and the arm inside `op=acquire` (8051–8076, which stays in `capture` as its trusted in-process arm, K58). `schema.mjs`: `capture_requests` (2668–2790) and its three additive columns (store.mjs 1143–1169). `bio-plane/checks/bio-checks.mjs` 9175–9455: `CAPTURE_PURPOSES`, `CAPTURE_UA_MODES`, `userAgentIsLegible`, `civicosUserAgent`, `CAPTURE_REQUEST_CHECKS` (C-28). Not yet met: R6, R7 and R21 (found in this reading), R16 (K58), R18 (D-582), R19 (D-584), R20 and R27 (D-581), R29 (D-583). Old-plan rows: D-581, D-582, D-584 (this module's, K58); D-583 (the run wake's, triaged to `scheduler`, served by R29).

**Size (P6).** About 1,050 lines as the code stands (902 in store.mjs, of which about 450 are not comments; 280 of checks; 100 of ops and arm), well under 4,000. A job reads it with the public parts of `capture`, `ai-runs`, `inquiry`, `observation-log`, `membership`, `record-core` and `host-governor`.

## Public

### Purpose

The AI does not capture: it requests, and the daemon captures with provenance preserved (INVESTIGATIVE-SESSION §4). This module is the request door and the drain. A run files a request for a public address under the question it is working; the request is a row that carries no bytes and fetches nothing. The drain alone turns a row into a fetch, through `capture`'s trusted in-process arm, after applying DEC-47's conduct (a legible agent, a purpose, rate) and composing the attribution that names both principals. It reports what became of every request, to the run, to members and to operators.

### Provides

Terms. A **request** is one row: `request` id, `run`, `target` (the inquiry it was asked under), `address`, `host`, `purpose`, `ua_mode`, `principal_plane`, `principal_claude`, `state`, `code`, `detail`, `capture_sha`, `attempts`, `requested_at`, `updated`, `expires`, `captured_at`, `lead_inquiry`, `run_woken_at`, `render`. Its **state** is `requested`, `draining`, `captured`, `refused` or `expired`; `captured`, `refused` and `expired` are **terminal**. The **caller** is the control plane's `principal` stamp; the **viewer** is its viewer stamp; neither is ever a body field. Every refusal is an answer `{ok: false, reason, code, check, translation, detail}`, never a throw.

**captureRequest(args, {viewer, caller}) → answer** The door (`op=capturerequest`). `args`: `run`, `address`, `target`, optional `lead_inquiry` (alias `lead`), `purpose`, `ua_mode` (default `civicos`), `render`.
- **R1** The run: a run absent, or whose context the viewer cannot see (ai-runs' run sight), or not `running`, is `CAPTURE_REQUEST_NO_RUN` (C-28.1), the unseen and never-minted cases answering alike but for the id. A run the caller is not the principal of is ai-runs' `runPrincipalGate` refusal (`AI_RUN_NOT_PRINCIPAL`, C-22.12), relayed field by field. Sight is asked before position, and position before status.
- **R2** The address must be a public locator (`isPublicHttpsLocator`) with a readable host, else `CAPTURE_REQUEST_NOT_PUBLIC` (C-28.2). The host is derived here, lower-cased, and stored.
- **R3** `target` must be an inquiry the viewer can see, else `CAPTURE_REQUEST_NOT_AN_INQUIRY` (C-28.3), answering alike for an unseen and an absent one. A `lead_inquiry`, when given, must be another inquiry the viewer can see (`CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY`, C-28.14) and not the target (`CAPTURE_REQUEST_LEAD_IS_THE_TARGET`, C-28.15).
- **R4** A request carrying any of `capture_sha`, `sha256`, `bytes`, `content`, `provenance_chain`, `via`, `retrieved` (non-empty) is `CAPTURE_REQUEST_CARRIES_A_CAPTURE` (C-28.4), naming the fields; nothing is dropped silently.
- **R5** `render` absent, `null` or `false` asks for the served document and `true` for the rendered page; any other value is `CAPTURE_REQUEST_RENDER_MALFORMED` (C-28.16) and nothing is queued.
- **R6** Idempotent on (run, address, render): with a row in `requested`, `draining` or `captured` for that key, the answer is that row's `request`, `target`, `purpose`, `ua_mode`, `lead_inquiry`, `render`, `state` and principals, with `requested: false, already: true`, and nothing is written. Otherwise one row is written in `requested` with `attempts` 0, `requested_at` and `updated` now, `expires` now + 24 h, and answered with `requested: true, already: false` and the values as written (never as sent). The time is this instance's clock (a test may inject one), never a body's `at`. *(not yet met: this reading — a body's `at` sets `requested_at` and `expires`)*
- **R7** The request id is minted here (`CR-<instant>-<random>`); `captureRequest` never throws. *(not yet met: this reading — a body's `request` is used as the id, and one already held throws on the primary key)*
- **R8** `principal_plane` is the caller stamp; `principal_claude` is the run's. Neither is taken from the body. `purpose` and `ua_mode` are recorded as sent and judged only at the drain (R14).
- **R9** The door makes no outbound request of any kind, and runs no conduct or attribution check.

**captureRequestAttribution(row) → `{ok: true, actor, machine_attributed: true, at_the_request_of: {run, inquiry}, principals: {plane, claude}, statement}` | `{ok: false, code: "CAPTURE_ATTRIBUTION_ONE_PRINCIPAL", plane, claude}`** The one composer.
- **R10** Both principals, trimmed, must be non-empty, else the refusal naming which is present. `actor` is `token:daemon` (machine-shaped by construction). `statement` is composed only from those fields: "the daemon captured this, at the investigative session's request (run <run>), under <plane>, paid by <claude>". Every surface that states a request's attribution (R15, R25, and the notifications built on R26) uses this composer.

**captureRequestDrain({limit, actor, now}) → `{configured, actor, at, drained, captured[], refused[], held[], expired[], remaining}`** The sole fetcher (`op=capturerequestdrain` and the scheduler's `capture-request-drain` consumer).
- **R11** Inert unless the instance's unattended capture is configured: unconfigured, it answers `configured: false` with nothing drained, and the pending count it offers the scheduler is 0, so no alarm is held. Not re-entrant: a drain called while one is running answers `busy: true` and does nothing.
- **R12** A tick acts on at most 10 rows (`limit` lowers it, never raises it). It first releases render rows past their `expires` (R20), before selecting, so an expired row never takes a slot; then takes `requested` rows oldest first (`requested_at`, then `request`).
- **R13** Each selected row is judged by R14; a refusal writes `code`, `detail` and `attempts + 1`, and moves the row to `refused` when terminal or leaves it `requested` when not. Every refusal and hold is appended to the observation log as `LOOKED_INDETERMINATE` for the row's address, `governed` exactly when the reason is this instance's own pacing or renderer.
- **R14** Conduct, in this order, the first failing rule deciding: attribution (R10, terminal, C-28.11); `purpose` in `CAPTURE_PURPOSES` (`investigate`, `acquire`), else `CAPTURE_CONDUCT_NO_PURPOSE` (terminal, C-28.8); `ua_mode` in `CAPTURE_UA_MODES` (`civicos`, `member-browser`), else `CAPTURE_CONDUCT_UA_ILLEGIBLE` (terminal, C-28.6); for `member-browser`, the agent recorded on the target inquiry (`member_user_agent`), else `CAPTURE_CONDUCT_UA_UNRECORDED` (terminal, C-28.7); for `civicos`, `civicosUserAgent(version, instance, purpose)`, which must pass `userAgentIsLegible` (a `(+<url>` contact), else C-28.6; the host in cool-off (host-governor's non-consuming `isHeld`), else `CAPTURE_CONDUCT_HOST_HELD` (held, C-28.9, condition `governor-holding-host`); a host already fetched once this tick, else `CAPTURE_CONDUCT_TICK_SPENT` (held, C-28.10). No rule reads `robots.txt`, and a document under a `Disallow` path is captured (BOB-3).
- **R15** A row passing conduct is set `draining` (`attempts + 1`) in the tick that then fetches, counts one fetch for its host, and is fired through `capture`'s trusted in-process arm with the row's address, purpose, agent (for `member-browser` only) and render, and nothing else. On a filed capture the row becomes `captured` with `code` null, `detail` the attribution statement, `capture_sha` and `captured_at`; the observation log gains `PRESENT` with `result_kind` `capture`, `result_ref` the digest and the statement as detail; the answer lists `{request, address, sha, grade, attribution}`.
- **R16** Nothing outside this drain can make the instance fetch for a request: `capture`'s arm is reachable only in process, and `op=acquire` refuses `via: "capture-request"` from any caller (`CAPTURE_NOT_DRAINING`, C-28.13, `capture` R1, R37). *(not yet met: K58 — the drain reaches `op=acquire` over `env.SELF` with a daemon credential, and `op=acquire` admits a body naming a row in `draining`)*
- **R17** A render `capture` refuses before fetching (C-83.3, .4, .5, .8) holds the row `requested` under that code with its detail, gives the host's tick slot back, is appended `LOOKED_INDETERMINATE`, `governed`, condition `render-deferred`, and is answered in `held` with `render: {state, content: "undetermined"}`, `state` being `capture`'s own word (`waiting` for C-83.8) or else `deferred`. The served shell is never filed in its place.
- **R18** A render result decided after the page was fetched spends the host's slot: `RENDER_NOT_A_PAGE` (C-83.6) is terminal (`refused`), and `RENDER_FAILED` (C-83.7) holds the row. *(not yet met: D-582 — both give the slot back and hold, so the page is re-fetched every tick until expiry)*
- **R19** Any other failure holds the row `requested` under a code catalogued in C-28 with its check and translation, appended `LOOKED_INDETERMINATE`, not governed, and answered in `held`. Every code this module writes to a row is catalogued in C-28 or C-83. *(not yet met: D-584 — `CAPTURE_FETCH_FAILED` is catalogued nowhere)*
- **R20** Every non-terminal row past its `expires`, plain or render, is released: state `expired`, its last code kept, `detail` saying what it was held under and that nothing was filed, appended `LOOKED_INDETERMINATE` (for a render, `governed`, condition `render-deferred`), answered in `expired` (a render with `render: {state: "expired", content: "undetermined"}`), and never fetched. At most one tick's batch is released per tick. *(not yet met: D-581 — a plain row past `expires` is still drained and fetched)*
- **R21** A row left `draining` by a tick that did not finish is not left there: the next tick returns it to `requested`, or releases it by R20 when past `expires`. *(not yet met: this reading — nothing reads a `draining` row again, so it stays, holds its run (R29) and blocks a new ask for its key (R6) indefinitely)*
- **R22** `remaining` is the number of `requested` rows after the tick.

**captureRequests({run, target, state, limit, viewer}) → `{count, limit, truncated, requests[]}`** The read (`op=capturerequests`).
- **R23** Rows are those whose target the viewer can see (membership's predicate; an absent or unrecognised stamp sees none), filtered by `run`, `target`, `state` when given, oldest first. `limit` defaults to 200 and is clamped to 1–1,000; `limit` in the answer is the bound applied, `count` the rows returned and `truncated` whether more matched. Nothing says how many rows the gate withheld.
- **R24** Each row answers the request's fields (Terms, less the principals), `render` as a boolean, and `attribution` (R10's composer, its refusal when a principal is missing).
- **R25** Each row answers `render_deferral`: for a render row `expired`, or `requested` with a code, `{state: "expired" | "deferred", content: "undetermined", code, check, translation}` with check and translation from the family that minted the code (C-83, else C-28, else null); otherwise null.

**For later modules** (reached through this module's factory, K61):
- **R26** `completed({viewer, limit})` answers `captured` rows the viewer can see by target; `leads({viewer, limit})` answers `captured` rows with a `lead_inquiry` the viewer can see, by `lead_inquiry`; `rendersHeld({viewer, limit})` answers render rows `expired`, or `requested` with a code, by target. Each is bounded as R23 and says when it was cut. (The queue's `capture-completed-unattended`, `out-of-inquiry-lead` and `render-deferred` producers.)
- **R27** Terminal rows do not accumulate unboundedly in what R26 walks. *(not yet met: D-581 — terminal rows stay forever and the producers walk the table unbounded)*
- **R28** `bundlesOf(request)` answers the request's `target` and `lead_inquiry` (either absent when not set), or `null` for an unknown id (observation-log's authority-to-bundle resolution for a look this module wrote).
- **R29** `waits({run, now})` answers the run's outstanding requests (`requested` or `draining`, not past `expires`) and its completions not yet told to it (`captured`, `refused` and `expired` with `run_woken_at` null), each bounded by 25; `markWoken({requests, at})` stamps `run_woken_at`. A run's wait is bounded by its requests' own expiry. *(not yet met: D-583 — `expired` is not a completion, so a run waiting on a render that expires is never woken)*

**The ops** (K3; `control-plane` keeps routing, authentication and the envelope).
- **R30** `capturerequest`: admin, member (with `contribute`) and probe, mutating, carrying the viewer and principal stamps. `capturerequestdrain`: admin, probe and daemon, mutating, and no member class. `capturerequests`: admin, member and probe, carrying the viewer stamp. No op admits the `ai` class by name. The daemon class reaches no read of the queue.

## Private

### Uses

- `legacy-checks`: `CAPTURE_REQUEST_CHECKS` (C-28), `RENDER_CAPTURE_CHECKS` (C-83), `CAPTURE_PURPOSES`, `CAPTURE_UA_MODES`, `userAgentIsLegible`, `civicosUserAgent`, `isPublicHttpsLocator`, `MACHINE_AUTHOR_PREFIX`.
- `record-core`: `recordOf(ctx)`, `transact`, `bundleInfo` (a target's type), `declarePurge`, the instance settings (version, instance name).
- `membership`: `viewerPredicate` (R3, R23, R26).
- `capture`: the trusted in-process `acquire` arm (R15–R18).
- `host-governor`: `isHeld` (R14). *(not in `modules.json`'s uses; see the extraction map)*
- `observation-log`: the one append (R13, R15, R17, R19, R20).
- `inquiry`: that a bundle is an inquiry, and its recorded `member_user_agent` (R3, R14).
- `ai-runs`: run sight, the run's status and principals, `runPrincipalGate` (R1, R8).

### Invariants

- **R31** The AI does not capture: the door writes a row and fetches nothing (R9); the drain is the only path from a row to a fetch (R15, R16); what leaves the instance is what conduct judged, read from the row (R15).
- **R32** Conduct is applied once, at the drain, and nowhere else; attribution is judged there too, so a row that outlived the door's rules is judged again before anything leaves.
- **R33** Every capture made for a request is attributed to the daemon at the session's request, naming both principals and never a token value or a person on the act (DEC-27(b), DEC-55.4); no fetch is made for a request that cannot be so attributed.
- **R34** Every refusal and hold carries its catalogue row: C-28.1–.4, .6–.11, .14–.16 here, C-83 relayed from `capture`, C-22.12 relayed from `ai-runs`; C-28.5 and C-28.12 stay unallocated.
- **R35** A request is scratch, not record: `capture_requests` is declared to `record-core`'s purge, a bundle's purge deleting its requests by `target` and clearing `lead_inquiry` where it names the bundle, a whole-store purge clearing the table, and the census counting it.
- **R36** No place is named in this module's behaviour or text.

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3, constructs 2 (the daemon/member division of who fetches) and 11 (the machine may request capture; never touches the provenance chain).
- `docs/development/INVESTIGATIVE-SESSION.md` §4 (the fence; the request table drained by the daemon; attribution corrected), §11 item 5 (`op=capturerequest` as ruled 2026-09-22 and corrected 2026-09-23), §14a (the pursue session and the daemon; reaching the open internet, DEC-47; BOB-3).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3 rules 3, 4, 5, 10.
- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §4 (fetching is policy-governed, never caller-governed).
- `docs/development/SOURCE-ACCESS.md`, the rulings and the 2026-08-07 amendment (the member-browser agent for public documents).
- `docs/development/CLIENT-RENDERED.md`, RULED 2026-09-24 by BOB #33 (a held render is shown and expires UNDETERMINED) and the render throttle.
- `docs/development/OBSERVATION-LOG-DESIGN.md` §4.1 (the document-level look and its authority).
- `docs/development/NOTIFICATIONS.md`, the catalogue (`render-deferred`, `capture-completed-unattended`, `out-of-inquiry-lead`).
- `docs/development/SCHEDULER.md` (one reconciling alarm; a consumer holds no alarm when idle).
- DEC-47, DEC-27(b), DEC-55.4, DEC-49.

### Suggestions

- **The member-browser agent is never recorded.** Nothing in the product writes `member_user_agent` to an inquiry, so R14's `member-browser` form always refuses C-28.7 outside tests. Recording the member's browser agent at inquiry creation is `inquiry`'s requirement (SOURCE-ACCESS's amendment: "the UA the member's browser was using when the inquiry was created").
- The queue's three producers use R26 and publish its cut on `op=queue` (D-581's second half); the run wake uses R29 (D-583). Registration follows K31 where an earlier module needs this one's rows (extraction map §3).
- `captureRequestDraining` and `op=capturerequestdraining` have no caller once the arm is in process (R16); retire them.
- Tests: each C-28 code gets a driven negative control; R9 is asserted over the door's source; R14's robots arm drives a `Disallow` path; R15 is asserted with a fake `capture` instance (K61) receiving exactly the row's values.

## Open for Bob

1. **What a requested capture becomes in the record.** Intake Doctrine §4 says what a sweep brings back "always lands at collected", recording "the deeming actor and the matched sweep in provenance", and INVESTIGATIVE-SESSION §4 says the run's captures land "at collected, never higher". Today the drain files bytes and a receipt only: nothing is promoted, and the capture's `origin` reads `named_request` with no run in its provenance (the attribution lives on the request row and the observation log). *Recommendation:* the drain promotes the capture at `collected` with `origin: sweep`, the run and both principals as the deeming actor and the inquiry as the matched scope (DEC-47 makes the inquiry the authorisation), as a new requirement not yet met, adding `promotion` to this module's uses.
2. **Hidden projects.** Membership v2 §7 (Bob #32, 2026-09-24): a capture request a hidden project's run produced "stays in the shared corpus and in every count of it"; only the run's attribution is withheld. `op=capturerequests` withholds the whole row from a viewer who cannot see the target. *Recommendation:* keep the gated read, and state that the ruling is met because the capture itself (bytes, receipt, observation) stays shared through `capture` and `provenance`, while the request row is the run's attribution; the census count stays ungated.
3. **Where "public" stops.** INVESTIGATIVE-SESSION §14a lists "logins, paywalls, a private individual's site" as conduct for the drain; the code's only test is the public-locator shape, and no rule was ever made. *Recommendation:* no new drain rule; a login or paywall arrives as `capture`'s source refusal, and a private individual's site is a judgement for the skill's doctrine, not a check.
