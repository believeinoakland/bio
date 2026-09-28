# capture-requests (T10)

**Status** · session_019sbMfF1wWCjRTgXkdVuLBi · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

My readings, on which I am building now (answer only where you differ):

1. **N141 / R38 (the promotion).** After the drain files a NEW capture (capture answers `ok`, a `document`, not `existed`/`held`/`unchanged`), the drain composes and promotes through `promotion.promote`, author `token:daemon` (R10's actor), no `writer: mechanical` (a creation, not an operation): id `${record.allocId("INFO", year).id}-requested`; `bundle.md` `information@2` at `collected` (produced_by mode `agent`, tier `session`; `source.locator` the address; `retrieved` the capture's; no `group`, so promote writes the recorded one or refuses C-64.1), a Summary naming the address, Provenance Notes and a Session Log entry carrying R10's statement; `data/provenance.json` `{documents: [capture's document]}`; the primary as a blob file with its register row. A capture already held (R39) makes no bundle. A refused promotion changes nothing of the row (still `captured`, the capture is filed) and the drain's answer names it: each `captured[]` entry gains `promoted: {ok, bundle_id} | {ok: false, reason}`. No new column (R24's field list unchanged).
2. **N262 / R38's origin.** `origin` = `{matched_sweep: <target inquiry>, deeming_actor: "run <run> under <plane>, paid by <claude>"}` (a string, since provenance C-18.1 needs it truthy and nothing reads it structurally).
3. **N262 / R39's `heldSha`.** "The record holds a successful capture" of the address is read from this module's own rows: the latest `captured` row with the same address and render flag and a `capture_sha`. Capture's `unchanged: true` answer (no `document`) is `captured` with `capture_sha` = heldSha and `already_held: true` (today it would be a failure).
4. **N188 (3) / R6's `at`.** The in-process caller's instant is the second argument's `at` (`captureRequest(args, {viewer, caller, at})`, ms or ISO); the op handler never passes one; a body's `at` stays ignored.
5. **N188 (1).** `waitSource().holds`/`woken` read in keyset pages, bounded in total by `CAPTURE_REQUEST_READ_MAX` rows per call, filtered by run status as today.
6. **N224 / R12.** With `rank`, the tick reads `10 × batch` requested rows oldest first, offers each as `{kind: "request", id, waitingSince: <requested_at in ms>, cadenceMs: drainIntervalMs()}` (the scheduler's `rankBy` reads ms and needs the cadence for "longer than one cadence"), takes the first `batch` in the rank's order; a rank that throws or answers a non-array falls back to oldest first (bias's pattern).
7. **N223 / R44.** `onRequestFiled` is synchronous to register; listeners are called after the row is written, a promise's rejection swallowed; `captureRequest` stays synchronous.

## J2 · REPORT

Found outside this module (P9), none changed by me:

1. **legacy-tests: two legacy suites turn red by design.** (a) `test/capturerequests.test.mjs` 140/0 → 138/2: it locates the door by the literal text `captureRequest(a = {}, { viewer = null, caller = null } = {}) {`, which R6's `at` (N188 (3), K333 reading 4) changes to `…, at = null } = {}) {`; its two source-text arms ("the door's body was actually read", "every refusal … through a helper called `refusal`") need the new anchor. (b) `test/leadslug.test.mjs` 74/0 → 21/2: after the drain it promotes the captured bytes by hand and is refused `CAPTURE_HELD_BY_ANOTHER_BUNDLE` (C-53.13), because the drain now promotes a requested capture itself (N141, R38): one capture, one home. Its fixture should read the drain's `captured[].promoted.bundle_id` instead of promoting. `bounds`, `derivation-bounds` and `hygiene` are unchanged (their reds predate me: 3, 4, 1).
2. **Generated artifact stale:** `bio-plane/dist/bio-plane.bundled.mjs` (the plane's source changed under `src/capture-requests/`). Not rebuilt.
3. **intent (a user of R43):** `pursuitOf` (its R14) can now read `requestById({request, viewer})` for exact outcomes instead of the bounded list (N169's reason).
4. **Requirement marks that no longer hold** (for you to strike): the T10 marks on R6, R12, R15, R38, R43, R44; K103's on R39 (heldSha and the 304/identical-bytes arms are built and tested here and in the plane); K58's on R16 (drain in process, `op=acquire` refusing `via: capture-request` from every class, tested in the module and in the plane). Older marks whose ids are met and tested today: R7, R18, R19, R20, R21, R27, R29, R37, R40, R41, R42 (each named by a passing interface test; R19's C-28.17 and R42's C-28.18 are now also driven through the plane, N188 (2)).

## J3 · COMPLETE

**Entries applied** (on K333's readings):
- **N141 / R38.** A new capture from the drain is promoted at `collected` (never higher) as an `information@2` bundle `INFO-<year>-<n>-requested` through `promotion.promote`, author `token:daemon`: bundle.md (Summary, Provenance Notes with R10's statement, a Session Log entry), `data/provenance.json` holding capture's document, the primary (and a render's shell, a streamed capture's parts) as blobs, one register row. A capture already held makes no bundle (R39). A refused promotion spends no id and changes nothing of the row; `captured[]` entries carry `promoted: {ok, bundle_id} | {ok: false, reason, detail}` (the promotion's own code relayed, none minted here). Verified in the running plane with provenance's registered check in place.
- **N262.** `#fire` passes `origin` `{matched_sweep: target, deeming_actor: "run <run> under <plane>, paid by <claude>"}` and `heldSha` (the latest `captured` row of this address and render flag, via a new index `capture_requests_address`); capture's `unchanged: true` (304) and `held: true` answers are recorded as the held capture, `already_held: true`.
- **N169 / R43.** `requestById({request, viewer})`: one row by key, as R24 and R25 answer it, gated by membership's predicate; null for a blank, unknown or unseen id; never throws.
- **N223 / R44.** `onRequestFiled(module, fn)` through `listenerRefusal`, run in `MODULE_ORDER`; called once per written row with `{request, run, expires}`; `already: true` notifies nobody; throws and rejections isolated.
- **N224 / R12.** `drain({…, rank})`: reads 10 × batch oldest first, offers `{kind: "request", id, waitingSince (ms), cadenceMs}`, takes its batch in the rank's order; a failing rank leaves oldest first.
- **N188.** (1) the wait source's `holds`/`woken` walk in keyset pages, at most `CAPTURE_REQUEST_READ_MAX` rows per call; (2) `CAPTURE_FETCH_FAILED` and `CAPTURE_REQUEST_NOT_RETRYABLE` driven through the plane (`plane.test.mjs`); (3) `captureRequest(args, {viewer, caller, at})`: each request's `requested_at` and `expires` follow its own `at`; the op never reads one from a body.
- Tests moved to the plane's shape: the fixture's storage answers workerd's cursor and refuses LIKE/GLOB patterns over 50 bytes (K313, K316); real `promotion` in the fixture. The module runs no LIKE/GLOB.

**Deferred:** none.

**Found in other modules:** J2 (legacy-tests: `capturerequests` and `leadslug` need re-anchoring; the plane bundle stale; intent may adopt R43; marks to strike).

**Tests and checks:**
- `node --test test/m/capture-requests/` — tests 61, pass 61, fail 0, todo 0 (was 53).
- users: `test/m/scheduler/` 46/0; `test/m/intent/` 35/0; `d334-monitor-credential`, `rec168-capturerequest-principal` pass; legacy `bounds` 220/3, `derivation-bounds` 69/4, `hygiene` 1346/1 unchanged from `tranche/T10`; `capturerequests` 138/2 and `leadslug` 21/2 new, J2.
- `checks/format.mjs` — 0 failures; `checks/architecture.mjs … capture-requests` — 0 failures; `checks/coverage.mjs … capture-requests` — 44 of 44 live ids, 0 failures; `checks/ownership.mjs … capture-requests tranche/T10` — legacy-store 0 lines, 0 failures.

Size (session_019sbMfF1wWCjRTgXkdVuLBi): test runs 24, module lines 1286
