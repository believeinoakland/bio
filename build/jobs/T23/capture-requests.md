# capture-requests (T23)

**Status** · session_01KVQEDZowazz9Z9r2dVJ8To · depth 2 · COMPLETE · handled B1

## Completion (CAPTURE-REQUESTS #7)

**Entries applied** (B1 START)
1. **R45**, a run's request naming a sweep (`bio-plane/src/capture-requests/`).
   - The door reads `sweep` (`"<bundle>#<id>"`) from the body and stores it on a new column `capture_requests.sweep`. The column is added to older stores by `migrateCaptureRequests`. A blank value is an ordinary request. A value that is not text is stored as what was sent (for example `{"id":"agendas"}`), so the drain refuses it by name. The door never drops it and never files an ordinary request in its place. The door judges nothing here (R9, R32). Its answers, and every read (R24, R43), carry `sweep`.
   - `registerSweepScope(module, fn)` is the slot `monitoring` fills at start. Refusals go through membership's `listenerRefusal` in its single-slot form, as membership R94 does: a second registration by any module is refused `LISTENER_DECLARED` naming the holder, and a malformed one `LISTENER_MALFORMED`.
   - The check is `fn({sweep, locators: [address], run, target})`, answered at once or as a promise. Only `{ok: true, scope: [prefix, …]}` admits a request; anything else refuses it, a throw included. `reason` (`unknown`, `unratified`, `held` or `out-of-scope`) and `detail` are carried into the refusal when given. `scope` is the sweep's `sources`. It rides the fetch so that acquisition R31 can judge each redirect against it.
   - The drain judges the sweep inside conduct (R14), after attribution, purpose and agent and before rate. A request its sweep does not admit is therefore never reported as merely paced. With no check registered, a request naming a sweep is refused (BOB's reading in B1). So is a name that is not of the shape `"<bundle>#<id>"`, without asking the check.
   - Admitted, the fire carries `origin: {kind: "sweep", matched_sweep: <the sweep>, deeming_actor: <the run and both principals, R38's>}` and `scope` (acquisition R21, R31). A request naming no sweep keeps R38's origin unchanged: no `kind`, with `matched_sweep` the target.
   - acquisition's `SWEEP_REDIRECT_OUT_OF_SCOPE` (C-128.2) or `SWEEP_SCOPE_MISSING` (C-128.1) on a sweep request becomes a refusal by this module: a locator of the request was out of scope. The host's slot stays spent.
   - The refusal `CAPTURE_SWEEP_OUT_OF_SCOPE` is **new row C-28.19** (`checks.mjs`; `where` is `sweepOutOfScope > is-capture-sweep-scope`, its one site). It is terminal (`refused`), not governed, and appended `LOOKED_INDETERMINATE`. **C-28.19 is `awaiting stamp` until T24's L2 (red 7).**
   - The promoted bundle's Summary names the sweep.
2. **N497**: `test/m/capture-requests/fixture.mjs` now registers promotion's facts under their providers: `producingGroup` under `instance-setup`, `citedBy` under `connections`, `caseMember` under `publication`.

**Readings, no question needed**
- R45's last sentence ("counts toward the sweep's `per_run` on its next run") asks nothing of this module's code, on my reading. A capture filed under a sweep carries `matched_sweep` in its register origin, which `capture` already reads (R82's way). If monitoring wants a count from this module instead (requests by sweep since an instant), that is one bounded read to add.
- R45 says "every locator of the request". A request has one address, so the check gets `[address]`. Redirects are judged by acquisition against the returned scope.

**Deferred.** None.

**Found in other modules, and requirement wording** (also in a REPORT)
- The plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale (a change under `bio-plane/src/capture-requests/`). I regenerated nothing.
- `build/requirements/capture-requests.md` Terms do not list `sweep` as a field of a request (R24's reads now answer it), and R45 does not state the check's call and answer shape. Both are wording for BOB. The shape is in the Entries above and in the code.
- `monitoring` (L10) registers through `captureRequestsOf(host).registerSweepScope("monitoring", fn)` and answers in the shape above.

**Tests and checks**
- `node --test bio-plane/test/m/capture-requests/`: tests 72, pass 72, fail 0. New: `sweep.test.mjs`, nine R45 tests. They cover an admitted sweep (filed with `matched_sweep` and the run as deeming actor, with scope); a held, an unratified and an unknown sweep, and an address out of scope, each refused C-28.19 with nothing fetched or filed; no check registered; malformed names; bad check answers; a second registration refused; the conduct order; and a redirect out of scope. Updated: R34 (C-28.19 in the table) and R24 (`sweep` in a row's keys).
- Negative control: with `src/capture-requests/` checked out at the previous commit, `sweep.test.mjs` failed: tests 9, pass 0, fail 9.
- The whole `bio-plane/test/m` (which takes in the users: control-plane, plane, intent, queue-producers, scheduler): tests 5048, pass 5033, fail 3, todo 12, skipped 0. The three fails are the accepted reds only: control-plane `inbox-door.test.mjs`:81 (red 9), and queue `catalogue.test.mjs` R1 (:34) and R5 (:116).
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures. `architecture.mjs … capture-requests`: 9 product files, 34 relative imports; 0 failures. `coverage.mjs … capture-requests`: 45 of 45 live requirement ids named by a test; 0 failures. `ownership.mjs … capture-requests tranche/T23`: 8 files changed; 0 failures.
- Module lines 1,708 (source); with tests, 3,564.

Size (session_01KVQEDZowazz9Z9r2dVJ8To): test runs 6, module lines 1708

## J1 · REPORT

Outside capture-requests, after R45: (1) bio-plane/dist/bio-plane.bundled.mjs is stale (a change under src/capture-requests/). I regenerated nothing. (2) The whole test/m has only the accepted reds: control-plane inbox-door.test.mjs:81 (red 9), and queue catalogue.test.mjs R1 (:34) and R5 (:116). Tests 5048, pass 5033, fail 3, todo 12. (3) Requirement wording for you: the Terms do not list sweep as a request field (reads now answer it), and R45 does not state the scope check's shape. As built: registerSweepScope(module, fn); fn({sweep, locators:[address], run, target}), sync or async, admits only {ok: true, scope: [prefix...]}; anything else refuses, with optional reason (unknown|unratified|held|out-of-scope) and detail carried. scope rides the fetch as acquisition R31's scope, with origin {kind: 'sweep', matched_sweep, deeming_actor}. Monitoring's L10 job registers in that shape. (4) My reading is that R45's per_run sentence asks nothing of my code: captures carry matched_sweep in their register origin. If monitoring wants a count of requests by sweep from this module instead, that is one bounded read to add.
