<!-- The host-governor extraction map, written for BOB #42 on 2026-09-26 on tranche/T3; superseded where it disagrees with build/requirements/host-governor.md. -->
# host-governor — extraction map

**Status** · Measured 2026-09-26 by a drafting worker for BOB #42 (P18), reviewed by BOB. Line ranges are in the legacy files on `tranche/T3` at that date; the extraction job confirms them. Measured at `91933d7587` (record-core merged): `store.mjs` 53,685 lines, `schema.mjs` 4,180, `index.mjs` 13,438, `bio-checks.mjs` 16,591. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/host-governor.md` (R1–R25); K47, K61, K66 and K69 apply. The module exports a factory answering its one instance per Durable Object `ctx` (for example `governorOf(ctx)`, K61) and reaches `record-core` through `recordOf(ctx)`.

## 1. What moves to `host-governor`

| what | where today | lines | moves |
| --- | --- | --- | --- |
| section header (D-95), `static GOVERNOR` | store.mjs | 39733–39759 | yes (R2, R5, R6, R9: the chosen constants) |
| `#governorRow` | | 39761–39770 | yes (R2) |
| `governorAdmit` | | 39772–39815 | yes (R1–R6). R3 fixed here: `r.appetite_per_min \|\| Number(env.GOVERNOR_APPETITE_PER_MIN) \|\| 12` obeys a negative binding (39781–39783) |
| `governorReport` | | 39817–39845 | yes (R7–R10) |
| `governorConfig` | | 39847–39854 | yes (R11). R12 fixed here: it stores any value and a 0 clears (39851–39853) |
| `governorState` | | 39856–39861 | yes (R13) |
| `governorHolding({now})`, `isHeld(host, now)` | not written | — | new (R14), from the predicate `cooloff_until > now` at 29100 and 44291 |
| store-op routes `governoradmit`, `governorreport`, `governorconfig`, `governorstate` | store.mjs `fetch` | 52992–52995 | yes (K3): the routes call the factory. `index.mjs` reaches the governor only through these four paths today |
| `governedFetch` and its two comments (D-95, PL-4) | index.mjs | 205–213, 271–314 | yes (R15–R17), if `legacy-index` is in `from` (§4.1) |
| op handlers `governorstate`, `governorconfig` | index.mjs | 7510–7522, 7524–7550 | yes (R18, R19), as `governedFetch` |
| OPS rows `governorstate`, `governorconfig` and their comment | index.mjs | 1614–1626 | yes (the requirements' Status line). `SESSION_OPS` entries (2177, 2237) and `NEEDS.governorconfig` (2641–2646) stay with the dispatcher (`control-plane`, K3) |
| `host_governor` DDL and its comment | schema.mjs | 4154–4179 | yes (K4). It is the last table in the file (§3.4) |

About 270 lines move: 140 from `store.mjs`, 26 from `schema.mjs`, about 105 from `index.mjs`.

**Tables `host-governor` owns:** `host_governor` (schema 4154–4179). It is declared to `record-core` exempt from purge (R24, K47). It is absent from `legacy-store`'s `declarePurge` list today (store.mjs 866–896), so purge never touched it, as R24 requires. No additive column or constructor DDL touches it.

**Checks.** None. `NEED_HOST` and `BAD_APPETITE` (index.mjs 7532, 7538) have no catalogue row; no check in `bio-checks.mjs` is this module's. `SESSION_ROLE_CANNOT_REACH_OP` (bio-checks 11432, its comment from 11418) names `governorconfig` and stays with the session gate (`control-plane`, R19). `legacy-checks` is not needed in `from`.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | lines | owner |
| --- | --- | --- |
| `#conditionsGovernorHolding` | store.mjs 29079–29138 | `queue` (layer 11; the `governor-holding-host` condition). Its direct read of `host_governor` (29099–29100) becomes `governorHolding(now)` (R14) |
| `#captureRequestHostHeld` | store.mjs 44286–44293 | `capture-requests` (K58; its map §1). Its direct read (44291) becomes `isHeld` (R14); `host-governor` is in its `uses` (K71) |
| `#checkGroupDomain` (calls `governorAdmit` 34120, `governorReport` 34135) | store.mjs 34108–34166 | `instance-setup` (K69), later in the order; it calls the factory |
| `userAgent` | index.mjs 166–203 | not this module: R16 sends the agent the caller supplies. `capture` (R7) takes it (capture map §2) |
| `archiveSelect`'s `governorconfig` POST for `web.archive.org` at 24/min | index.mjs 235–240 | `capture` (R3; R25: the counterparty's figure belongs with its knowledge). `capture-sources`' Suggestions offer itself too (§4.3) |
| the render arm's admission, the render's report, the subresource `fetchOne`'s cool-off read, stagger and report | index.mjs 8236–8247, 8731–8737, 8950–8972 | `capture` (its R5, R19). The subresource read of `governorstate` (8954–8957) becomes `isHeld` |
| `op=monitor`'s governed fetch | index.mjs 10472 | `monitoring`; it imports `governedFetch` |

## 3. Private calls that leave the module, callers to rewire, and conflicts

The moved store code calls only `this.sql.exec`, `this.env` (`GOVERNOR_APPETITE_PER_MIN`) and `Store.GOVERNOR`. `sql` comes through `ctx.storage`; the binding reaches the factory as an option (K61's `opts`) or through a setting. The clock and jitter (`Date.now()`, `Math.random()`) are injected, per the Suggestions.

Callers to rewire:
- `store.mjs` 52992–52995: the four routes call `governorOf(this.ctx)`.
- `store.mjs` 29099–29100 and 44291: to R14. Both methods stay in `legacy-store`; the job edits only the line that reads the table.
- `store.mjs` 34120, 34135: `this.governorAdmit`/`this.governorReport` become factory calls. Alternatively they keep calling delegating `Store` methods, as membership did (K63).
- `index.mjs` 244 (`archiveSelect`), 8343 (acquire) and 10472 (monitor): `governedFetch` imported from the module, if it moves now (§4.1). Otherwise they are unchanged.

Conflicts with the requirements:
1. **`governedFetch` runs in the Worker, the governor in the Durable Object.** R15 says `governedFetch(target, {userAgent, fetch})` "asks R1–R6", but the Worker has no `ctx`. Today it asks through the stub (`http://x/governoradmit` and `governorreport`), and R17's "a governor that cannot be reached" is exactly a stub failure. Its signature needs an `admit`/`report` pair (or the stub) passed in. Wording is BOB's (P17).
2. **R12 against the op.** The op (index.mjs 7534–7539) already refuses `BAD_APPETITE`; once `governorConfig` refuses it too (R12), the op's copy can stay as the envelope's early refusal or go. R19 needs one refusal, not two different answers.
3. **Two `Retry-After` parsers.** `governedFetch` (300–304) and the subresource `fetchOne` (8969–8970) each parse `Retry-After`. The Suggestion's helper lives here, and `capture` imports it.
4. **The "before `host_governor`" schema rule.** Seven old tests assert that their table is declared before `CREATE TABLE IF NOT EXISTS host_governor` in `schema.mjs`'s text, and they fail when that string leaves the file (§5). record-core's precedent (`schema.mjs` 1–6 interpolates `${RECORD_SCHEMA}`) does not help, because the tests read the source text.

## 4. Undetermined (stated, not guessed)

1. **`from`.** `modules.json` gives `from: "legacy-store"`. K47 ("one `from`") moved `governedFetch` and the two ops to entry N25. K66 now allows a list. Folding N25 into this job means `from: ["legacy-store", "legacy-index"]`; keeping N25 separate leaves the three in `index.mjs` calling the store routes. Either is BOB's.
2. **Where the binding precedence reads `env`.** R3 names "the instance binding". A factory keyed on `ctx` has no `env` unless `legacy-store` passes it in `opts`.
3. **The archive's 24/min** is claimed by `capture` (R3) and offered by `capture-sources`' Suggestions; R25 says only that it is not this module's. Stated in both maps' §4.
4. **`userAgent`.** Not this module's (R16), and claimed by `capture` (§2).

## 5. Old tests (legacy-tests) that anchor on the moved text

The job does not edit these; each is `legacy-tests`' to re-anchor.
- **The schema order rule** (§3.4) in `aicredential.test.mjs` (206–208), `bias.test.mjs` (597–598), `capture-text-index.test.mjs` (295–299), `capturerequests.test.mjs` (270–272), `mint-ledger.test.mjs` (299–300), `observation-log.test.mjs` (460–464) and `publishedcase.test.mjs` (812–813).
- `hygiene.test.mjs`: the purge census's exemption for `host_governor` (834) reads `schema.mjs`.
- `capturerequests.control.mjs` (188) and `capturerequests.test.mjs` (692): the anchor `this.#captureRequestHostHeld(q.host, nowMs)`, which moves with the rewire in `capture-requests` rather than here. Also the door test at 464 (`/host_governor/.test(door)`).
- `plane-envelope.test.mjs` (303–306): `UNCONVERTED` lists the `governoradmit` and `governorstate` fetch paths in `index.mjs`, and moves if `governedFetch` leaves.
- `adminvote.control.mjs` (158): the exact OPS row for `governorconfig`.
- Runtime tests that reach the governor through the store routes stay green while the routes delegate: `governor.test.mjs`, `monitor-cadence.test.mjs` (559–567), `queue-conditions.test.mjs`, `derivation-bounds.test.mjs` (543, whose site line is not edited).
