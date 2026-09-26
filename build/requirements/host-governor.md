# host-governor — requirements

**Status** · DRAFT by BOB #41, 2026-09-26 (P18), from a drafting worker's reading of the code, reviewed by BOB (K47–K49); for Bob's approval (a product module, P17). Layer 3. Code today: inside the legacy modules — `bio-plane/src/store.mjs` (`Store.GOVERNOR`, `#governorRow`, `governorAdmit`, `governorReport`, `governorConfig`, `governorState`, about lines 40665–40795; the store-op routes `governoradmit`/`governorreport`/`governorconfig`/`governorstate`; direct reads of the table in `#conditionsGovernorHolding` and `#captureRequestHostHeld`), `bio-plane/src/schema.mjs` (table `host_governor`), and `bio-plane/src/index.mjs` (`governedFetch`; the `governorstate` and `governorconfig` op handlers and OPS rows). The extraction job moves the `legacy-store` code (its one `from`); `governedFetch` and the two op handlers (R15–R19) move out of `index.mjs` by entry N25 (K47; layers.md ruling 2: ops move with their construct). Not yet met: R3 and R12, fixed by the extraction job (K47).

## Public

### Purpose

Paces this instance's outbound fetches, one host at a time, so it leans on another party's server no harder than a person would, and learns that party's capacity only by being refused. It holds one token bucket and one cool-off per host, decides admission, records the capacity signal in each outcome, and answers which hosts it is holding. It says nothing about whether a source is reachable: its refusal is a fact about this instance, never about the source.

### Provides

**governorAdmit({host}) → `{admitted: true, wait_ms, appetite_per_min}` or `{admitted: false, reason, retry_in_ms, …}`**
- **R1** With no `host` (absent or empty), returns `{admitted: false, reason: "no host named"}` and writes nothing.
- **R2** On first contact with a host, creates its state with a full burst of `burstTokens` (3) tokens, no cool-off and no refusals, before deciding.
- **R3** The host's appetite (grants per minute) is, in order: the host's configured appetite (R11); else the instance binding `GOVERNOR_APPETITE_PER_MIN` when it is a positive finite number; else the default, 12. A binding that is absent, empty, non-numeric, zero or negative falls back to the default and is never obeyed. *(not yet met: K47 — a negative binding value is truthy and is obeyed, which makes the bucket's refill and gap negative)*
- **R4** While the host's cool-off lies in the future, refuses with `{admitted: false, reason: "cooling_off", retry_in_ms: cooloff_until − now, refusals, last_refusal_status}`, whatever the token balance and whatever appetite is configured; spends no token and adds one to `refused_total`.
- **R5** Otherwise tokens refill continuously at the appetite per minute from the last refill, capped at `burstTokens`. With fewer than 1 token, refuses with `{admitted: false, reason: "appetite", retry_in_ms}`, `retry_in_ms` = ceil((1 − tokens) / appetite × 60,000), records the refilled balance, and adds one to `refused_total`.
- **R6** Otherwise admits: spends one token, adds one to `granted`, and returns `wait_ms` = max(0, round(gap − time since the previous grant)), where gap = (60,000 / appetite) × j and j is drawn uniformly from [0.6, 1.5) on each grant (a jittered gap, never a fixed one). The grant is recorded as taking place at now + `wait_ms`, so the next grant is spaced from when this fetch goes out.
- Errors: never throws on its own logic.

**governorReport({host, status, retry_after_ms}) → `{recorded, …}`**
- **R7** With no `host`, returns `{recorded: false}` and writes nothing.
- **R8** `status` 200–399: resets the host's consecutive refusals to 0 and returns `{recorded: true, refusals: 0}`. It does not shorten a cool-off.
- **R9** `status` 429, 403 or 503: adds one to the host's consecutive refusals (n), records `last_refusal_at` and `last_refusal_status`, and sets the cool-off to end at now + max(min(cap, base × 2^(n−1)), `retry_after_ms`), where base/cap are 60 s / 1 h for 429 and 30 s / 30 min for 403 and 503. A counterparty's `Retry-After` is honoured when longer than the escalation, never when shorter. Returns `{recorded: true, refusals: n, cooloff_until, cooloff_ms}`.
- **R10** Any other `status` (404, 500, and 0 for a fetch that produced no response) changes nothing and returns `{recorded: true, ignored: status}`: it is an outcome for monitoring, not a capacity signal.
- Errors: never throws on its own logic.

**governorConfig({host, appetite_per_min}) → `{configured, host, appetite_per_min}` or refusal**
- **R11** With no `host`, returns `{configured: false}`; no global appetite can be set. With a host, creates its state if absent and sets its appetite to `appetite_per_min`, or, when it is `null` or omitted, clears it so R3's instance precedence applies again; returns `{configured: true, host, appetite_per_min}` (`null` when cleared).
- **R12** A value that is present and not a positive finite number is refused with `BAD_APPETITE` and nothing is written. *(not yet met: K47 — `governorConfig` stores it, and a 0 clears; only the `governorconfig` op refuses it today, `index.mjs`)*
- Errors: never throws.

**governorState({host}) → `{hosts: [row…]}`**
- **R13** With `host`, answers that host's row, or none; it never creates one. Without, answers every row ordered by host. A row carries `host`, `appetite_per_min` (`null` means R3's precedence), `tokens`, `refilled_at`, `last_grant_at`, `cooloff_until`, `refusals`, `last_refusal_at`, `last_refusal_status`, `granted`, `refused_total`, `updated_at`.
- Errors: never throws.

**governorHolding({now}) → `[row…]`; isHeld(host, now) → boolean**
- **R14** `governorHolding` answers every host whose cool-off ends after `now`, ordered by host, each as R13's row. `isHeld` answers whether one host's cool-off ends after `now`, `false` for a host with no state. Both use exactly R4's test (`cooloff_until > now`), spend no token and write nothing. (Today these are direct reads of the table by their consumers, `store.mjs` `#conditionsGovernorHolding` and `#captureRequestHostHeld`, and `index.mjs`'s subresource fetch through `governorstate`; extraction gives them this one interface.)
- Errors: never throws.

**governedFetch(target, {userAgent, fetch}) → `{res}` or `{refusedByGovernor: true, reason, retry_in_ms, last_refusal_status}`**
- **R15** Asks R1–R6 for the target's host (its URL `host`). When refused, returns the refusal with nothing fetched.
- **R16** When admitted, waits `wait_ms`, then fetches the target once, following redirects, with the user agent the caller supplied (this module composes none), and reports the response's status to R8–R10 with its `Retry-After` converted to milliseconds (delta-seconds × 1000, or an HTTP-date minus now, never below 0; `null` when absent). Returns `{res}`.
- **R17** A governor that cannot be reached, or a target whose host cannot be read, never blocks the fetch: it proceeds ungoverned, and a report that cannot be recorded is dropped (politeness, not coordination; K47). A fetch that throws propagates its error, and nothing is reported.

**op=governorstate** (a read)
- **R18** Reached by the `admin`, `member` and `probe` classes and by every session. `host=` narrows to one host; absent, all. Answers `{ok: true, hosts}` from R13. A store that does not answer is reported as silence (`storeSilent`), never as an empty `{ok: true}`, which would claim the instance is holding nothing.

**op=governorconfig** (a write)
- **R19** Reached by the `admin` and `probe` classes and, among sessions, by the founder's session alone; an enrolled administrator's and a member's session are refused (the refusal and its wording are the session gate's, `control-plane`). Refuses a missing `host` with `NEED_HOST` and a present `appetite_per_min` that is not a positive number with `BAD_APPETITE`; an absent one clears the host's appetite (R11). A store that does not answer is reported as silence, never `{ok: true}`.

## Private

### Uses

- `record-core.declarePurge`: declares `host_governor` exempt from purge (R24).

### Invariants

- **R20** One bucket and one cool-off per host for the whole instance: admissions are serialised, so two admissions never spend the same token (the Durable Object serialises; a bucket in Worker memory would govern nothing).
- **R21** Our appetite is a configured constant; their capacity is learned only from refusals (R9). No outcome raises an appetite or shortens a cool-off, and nothing probes a host to find its ceiling.
- **R22** A configured appetite never outlasts a counterparty's refusal: R4 refuses during a cool-off whatever R11 set.
- **R23** The governor records capacity signals only. It holds no verdict on whether a source is reachable, and none of its refusals is a statement about the source.
- **R24** `host_governor` is this module's own table and no other module writes it. It is declared to `record-core` exempt from `purge` (K47), as today: a cool-off is a counterparty's refusal, and a purged instance still honours it.
- **R25** No jurisdiction and no named counterparty: no host is named in this module. A per-host figure (the archive's 24/min) is set by the module that owns the knowledge of that counterparty, through R11.

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3, construct 14 ("the host governor") and construct 2 (intake: who fetches, and how).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §4, the 4.9 block (RULED 2026-09-21 by BOB #23): `governorconfig` is the operator's (R19); a host's configured appetite outranks the instance binding (R3); a configured appetite never outlasts a counterparty's refusal (R22); an administrator keeps sight through `governorstate` (R18).
- `docs/development/ARCHIVE-FALLBACK.md` §Rate limits: THIRD-PARTY FIGURES, not ours (appetite is ours, capacity is discovered by polite use being refused, never by probing; a 429 is never ignored, R9, R21), and §The scaling problem a per-instance governor cannot solve (it governs this instance only).
- `docs/development/SOURCE-ACCESS.md`, the rulings (the honest CivicOS agent by default; the member-browser agent for publicly available documents under DEC-47's access-parity amendment): R16 sends the agent the caller chose.
- `docs/development/NOTIFICATIONS.md` §The catalogue ("governor is holding a host — the capture is PACED, not broken", CONDITION, D-103; "source unreachable, and distinguishably: governed by our own pacing", D-104) and §What the three classes actually ARE (a pacing governor is *noticed*): R14 supplies the fact, R23 keeps it about us.
- `docs/development/CLIENT-RENDERED.md` §RULED 2026-09-23 by BOB #32, item 3 (an unattended render goes through the host governor): the render arm asks R1–R6.
- `docs/architecture/BIO_Publication_v0_1.md` §7 (the group-domain verifier fetches through the per-host governor; a governor hold makes the verdict `undetermined`).

### Suggestions

- Inject the clock and the jitter source (`now()`, `random()`) so R5, R6 and R9 are testable exactly; today they read `Date.now()` and `Math.random()`.
- Obligations on callers, for their own requirements (convention 2): a governed refusal is never counted as a source failure (D-104; `capture`'s `recordSourceOutcome`, C-22.2 in `legacy-checks`); a page's subresources ride the primary fetch's admission rather than taking a token each, take a small jittered stagger (`GOVERNOR_SUBRESOURCE_STAGGER_MS`, default 50–250 ms), stop when `isHeld` becomes true, and report every outcome (`capture`, `index.mjs`'s subresource `fetchOne`); the archive lookup sets web.archive.org's appetite to 24 (`capture`); the queue's `governor-holding-host` item is built by `queue` from R14.
- `governedFetch` and the subresource `fetchOne` each parse `Retry-After`; one helper here removes the second copy.
- The host key is the string given; callers pass a URL's `host` (lowercased, port kept). The group-domain verifier passes the claimed domain as stored. Normalising the key here would make that uniform.
- `bio-plane/test/governor.test.mjs` holds today's tests; `modules.json` places this module's at `bio-plane/test/m/host-governor/`. The chosen constants are recorded as chosen in `docs/development/MEASUREMENTS.md` (reference).

