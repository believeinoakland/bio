# admission (T47)

**Status** · session_01AvZMhLufz25XDGgpfUXgYQ · depth 2 · COMPLETE · handled B2

## Completion (ADMISSION #10)

**Entry applied** · T47-77 (K3043, K3084, K3143): R23, R24, R25 met, on the readings BOB confirmed in B2 (K3143).
- **R23** `aiTaskScope(cred, op, spec, {named})`: a credential whose row carries a non-empty `run` is admitted to a mutating op only when the request names at least one run and every run it names (the body's `run`, the query's) is that run; else `AI_BEYOND_TASK_SCOPE` (C-29.6, its existing region and row) with `run` beside it, before any store call. Reads stay the floor. `admit` takes the request's `body` for it; `runsNamed({url, body})` is exported. A body value that is not a string never equals a run.
- **R24** `admit`: a session answered `locked: true` asking any op but `unlock`, `reauth`, `signout` (`LOCKED_SESSION_OPS`) is answered 401 with `Credentials.sessionLockedRefusal()` as given, directly after the session resolves (before `export`'s refusal and the session gate), a read included. `readerOf` reads a locked session as no one (`""`). `admit` and `readerOf` take `background`, sent as `session?background=1` (control-plane R83 passes it; K3143).
- **R25** `admit`: for a session, after R11, an act `REAUTH_ACTS` names with its argument (`reauthAsked`, op-declarations R62's shape: `null` or `{field, values}`, the body's field else the query's; any other entry asks) asks the store's internal `reauthdue` (store-door R15) with the token in `x-bio-session`; a `{due: null}` admits, a `REAUTH_DUE` row is answered 403 as given, anything else is a silence (R6's 502). Binding classes and agents are not asked (no password to give). `REAUTH_ACTS` is read through a namespace import of op-declarations, so the module loads before op-declarations' R62 merges and uses its table from then on (an empty table until then).

**Read** · my requirements whole; my code (`index.mjs`, `checks.mjs`, `window.mjs`) and every test file whole; credentials' `session`, `#liveSession`, `sessionLockedRefusal`, `unlock`/`reauth`, `reauthDue`, its routes and rows; store-door's header hand-over; the plan entry and the L11 fold draft's admission, credentials and op-declarations sections; agent-worker's calls for how a write names its run.

**Flaws found and dealt with** · none in my module beyond the entry; `readerOf` counting a locked session as its member was the one gap R24 opened, closed here.

**Deferred** · none.

**Other modules** · store-door's `reauthdue` route (its R15, K3143) and op-declarations' `REAUTH_ACTS` (its R62, R63) are what R25 reaches at run time; until both merge, an act it names answers 502 (route absent) or is not asked (table absent). No generated artifact touched.

**Tests and checks** · admission 48/48 (5 new in `t47.test.mjs`: R23, R24 ×2, R25 ×2, each with a control). Users: answer-envelope 25/33, control-plane 235/242, plane 218/223, the same counts on the base without my change (inherited); `test/system/migrate-released` 1/1. format 0, architecture (admission) 0, coverage 25 of 25, ownership 0 failures; `run.mjs`: architecture 0 failures (coverage's 26 are other L11 modules').

Size (session_01AvZMhLufz25XDGgpfUXgYQ): test runs 9, module lines 1505

**B3 (CHANGE, K3152)** · tranche/T47 merged (op-declarations' `REAUTH_ACTS` live). R12's and R19's reds were my harness's: its default sessions had never given the password again, so `adminendorse` and `groupkeyset` from a session were now rightly answered `REAUTH_DUE` before the fence and admission those tests check. The harness's default sessions now carry an open re-ask window; `t47.test.mjs` drives the window shut with its own sessions. No product code changed; no other module's cause. admission 48/48; format, architecture (admission), coverage (25/25), ownership 0 failures; `run.mjs` architecture 0.

Size (session_01AvZMhLufz25XDGgpfUXgYQ, after B3): test runs 12, module lines 1505

## J1 · QUESTION

Three readings for R24/R25. I am building on each reading now; only (1) needs another module to change.

1. **How the gate reaches `reauthDue` (R25).** `credentials.reauthDue({token})` is a method of the store's credentials instance with no route. Admission runs in the Worker and reaches credentials only through the store (as it does for `session` and `aicredentiallook`, R6). My best reading: admission asks a store-internal route `reauthdue` with the session token in `x-bio-session`, the way it asks `session`. store-door already hands that header on as `session` and `t`. Credentials' map would answer `reauthdue: () => ({ due: c.reauthDue({ token: url.searchParams.get("session") }) })`, and op-declarations R6 would list it as store-internal. A store that does not answer is a silence (R6's 502), never an admission. That route is credentials' code and op-declarations' list, not mine, so I am reporting it. Until it exists, every act REAUTH_ACTS names will be answered 502 or refused. Alternative: the door passes admission a `reauthDue` function; it still needs the same route.
2. **The shape of `REAUTH_ACTS` (op-declarations R58, not yet on any branch).** My best reading: a frozen object `op → null` (every call asks the password again) or `op → { field, values }` (the body's `field`, falling back to the query's, being one of `values`; `values: null` meaning the field present at all). Admission cannot know a member's present role, so "memberset (a role to or from admin)" is read as `memberset` with `role` present at all (`{ field: "role", values: null }`). That set is wider than the requirement's but never narrower. I read the table through `import { REAUTH_ACTS }` and write the matcher in admission. Please confirm the shape with OP-DECLARATIONS #22, or tell me theirs.
3. **Statuses and order.** credentials' rows carry no status. I answer `SESSION_LOCKED` at 401 (the session authenticates nobody for the act) and `REAUTH_DUE` at 403, each body relayed exactly as credentials gives it. The lock is judged right after the session resolves, before `export`'s refusal and the session gate. Re-ask is judged after the capability (R11), so it is the last refusal before the landing. R24 also covers reads, as credentials R71 (1) says. `readerOf` (R16) treats a locked session as no one (`""`).

Also, for control-plane R83 ("`background=1` is passed to the session read"): the session read is admission's lookup. `admit` and `readerOf` take an optional `background: true`, and the lookup then sends `session?background=1`. The flag is not a credential. Control-plane would pass it.

## J2 · COMPLETE

T47-77 applied on B2's readings (K3143): R23 (a run-bound ai credential writes only to its run, AI_BEYOND_TASK_SCOPE otherwise), R24 (a locked session admitted only to unlock, reauth, signout; SESSION_LOCKED relayed at 401; readerOf reads it as no one; background passed to the session read), R25 (REAUTH_ACTS, R62's shape, asks store-door's reauthdue; REAUTH_DUE relayed at 403; silence is 502). tranche/T47 merged per B2. admission 48/48; format, architecture, coverage (25/25), ownership 0 failures; run.mjs architecture 0. Users' reds are inherited (same counts on the base). R25 depends at run time on store-door R15 and op-declarations R62 merging. Record: build/jobs/T47/admission.md on job/T47/admission.
