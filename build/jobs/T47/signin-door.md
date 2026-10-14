# signin-door (T47)

**Status** · session_01DHEqiW9nuJMTjMzmoo7o7T · depth 2 · WORKING · handled B3

## J1 · QUESTION

Five points the requirements leave open. I carry on with every best reading below; only Q1 decides a file outside my paths.

**Q1 · Where the store-side halves live.** R2 (`credentials.disclosureDue`), R4 (`subscriptionTokenHold`, `subscriptionTokenRefused`) and R5 (the trace store) are in-plane calls of the record store (the Durable Object); the door runs in the Worker. Today only `aikeptaway` and `subscriptionconnected` are store-internal routes (`store-door` R10); no entry adds the others. Best reading: this module provides its own store-internal map, `signinDoorOps(ctx, url, body)` (the `membershipOps` pattern, no op spec, `op-declarations` R6), with `signintokenhold`, `signintokenrefused`, `signindisclosuredue`, `signintracekeep` and `signintraceread`, each calling `credentials` in process (`credentialsOf(ctx)`) or the module's own bounded trace, and **`plane`'s job spreads it** into the store's route map (`plane/store.mjs`, beside `credentialsOps`). `state` reads the existing `accountreference` route (credentials' own map). Until plane spreads it, the door's calls to those routes answer as a store refusal (fail closed: no `start`, no hold). Alternative: `store-door` adds the five routes to its R10 map.

**Q2 · The instance salt for `member_ref` (R3).** No "instance salt" exists. Best reading: `member_ref` = first 12 hex of `sha256(env.INSTANCE_NAME + by)` (`""` when unset), the bare `by` on a test instance (`CIVICSMITH_TEST_INSTANCE` equal to `INSTANCE_NAME`, both non-empty: `ai-runs` R78's fact, read from `env` here). The member id is not a secret (K1819); the ref only keeps the bare id out of logs.

**Q3 · `state` under R4.** R4 ("`state` is answered from `credentials.accountReferenceState`'s `subscription`") amends R1's "`state` and `signout` are always sent". Best reading: `state` sends nothing to the runner and answers `{ok: true, step: "state", connected, since, held, valid_until?, refused_at?, trace}` from `accountreference?member=<by>&viewer=<by>`; a store refusal or silence is answered as the door answers one (never "not connected"). R1's "a `state` answer carrying `connected: true` is recorded" then has no case.

**Q4 · `attempt` on `code` (`agent-worker` R85).** agent-worker relays `{member, code, attempt?}`, "an `attempt` the door sends"; my R1 sends `{member, step, code?}` "from the request's body only" and names no `attempt`. Best reading: on `code` the door also passes the body's `attempt` when it is a string of at most 200 characters (from the body only), else sends none; `start`'s answer relays the runner's `attempt` unchanged. Say no and I send none.

**Q5 · `connected: true` with a hold.** `credentials.subscriptionTokenHold` records the fact itself (its R70). Best reading: a `code` answer that carries `token` is recorded only through the hold (no `subscriptionconnected` call); a `code` answer with `connected: true` and no `token` is recorded by `subscriptionConnected` as R1 says.

Also for BOB's notes (no answer needed): `SIGNINTRACE_NOT_TEST`'s row is `answer-envelope` R16's (`DISPATCH_CHECKS`); its `where` should name `src/signin-door/index.mjs`. The door's interface for `control-plane` (T47-65) will be in my COMPLETE.

## J2 · COMPLETE

Complete at `d115bc78e0` on `job/T47/signin-door` (with `tranche/T47` merged for K3143's text).

**Files added (for `modules.json`):** paths `bio-plane/src/signin-door/` (`index.mjs`, `ops.mjs`); tests `bio-plane/test/m/signin-door/` (`door.test.mjs`, `ops.test.mjs`).

**Entries applied:** T47-91 whole. R1–R5 copied from `control-plane` R65, R78, R85–R87 into this module, as K3143 answered J1: Q1 the store-internal map `signinDoorOps` (for `plane` R49); Q2 `member_ref` = first 12 hex of `sha256(INSTANCE_NAME + by)`, the bare id on a test instance; Q3 `state` answered from `accountreference`, nothing sent to the runner; Q4 the body's `attempt` (a string of at most 200 characters) passed on `code`; Q5 a token's fact recorded by the hold alone. `SIGNINTRACE_NOT_TEST` is minted once, in `signintrace`, region `is-signintrace-test-instance` (C-69.7); the store's half answers nothing kept / no lines off a test instance rather than a second copy of the code.

**The interface, for `control-plane` (T47-65) and `plane` (R49):**
- `subscriptionSignin({env, member, asked, store, log?})` → `{status, body}` for `op=subscriptionsignin` (`member` the session's `by`; `asked` the parsed body; `store(path, init)` answering in `doAnswer`'s shape; `body.trace` always set; a store silence or refusal already answered as `answer-envelope` R3 answers one). The door sends `json(body, status)`.
- `subscriptionDisconnect({env, member, store})` → the store answer as `doAnswer` read it (relay as any store answer); it sends `signout` after a success.
- `leaverOf(op, asked, result, by)` and `signoutLeaver(env, member)` for `memberset`/`adminremove` revocations, as today.
- `tokenRefusedSeen({member, answer, store})`: call with the ask's and draft's answer body (R4's `SIGNIN_TOKEN_REFUSED`).
- `signintrace({env, store})` → `{status, body}` for `op=signintrace`.
- `signinDoorOps(credentialsOf(ctx), url, body, env)` — `plane` spreads it beside `credentialsOps` (its first argument is the store's `credentials`, not `ctx`).
- Also exported: `SIGNIN_STEPS`, `SIGNIN_WORDS`, `TRACE_HEADER`, `MEMBER_REF_HEADER`, `SIGNIN_TRACE_MAX`, `TRACE_FIELDS`, `STORE_ROUTES`, `testInstanceOf`, `memberRefOf`, `mintTrace`.

**Deferred:** none. Note: R5's trace is held in the store object's memory (bounded at 200 lines, never a table), so it empties when the object is evicted; the requirement asks only for a bounded store.

**Found in other modules (for their jobs):**
- `control-plane` (T47-65): `src/control-plane/signin.mjs` and the `subscriptionsignin` branch of `index.mjs` are now this module's copy to delete; route `subscriptionsignin`, `subscriptiondisconnect` and `signintrace` here, and call `tokenRefusedSeen` on ask and draft answers. Its `t37-door`/`t46-door` R65 tests send `state` to the runner and read `disclosureof`; under R2/R4 neither holds.
- `answer-envelope` R16: C-69.7's `where` is `src/signin-door/index.mjs signintrace > is-signintrace-test-instance`, as matched.
- No generated artifact made stale by this job (the plane bundle picks the module up when `control-plane` imports it).

**Tests and checks run:**
- `node --test bio-plane/test/m/signin-door/`: tests 15, pass 15, fail 0.
- `node checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
- `node checks/architecture.mjs … signin-door` and `coverage.mjs … signin-door`, with my paths filled into a local, uncommitted `modules.json`: architecture 4 product files, 0 failures; coverage 5 of 5 live ids named by a test, 0 failures. With the committed (empty) entry: coverage reads 0 of 5, as expected until BOB adds the paths.
- `node checks/ownership.mjs … signin-door tranche/T47`: 5 files changed, 0 failures.
- `node checks/run.mjs` (paths filled locally): architecture 3128 product files, 0 failures; coverage 25 failures, all other modules' open ids (queue, screens-*, setup-words, tasks, wizard-scripts), none mine; channels 0 failures.

Size (session_01DHEqiW9nuJMTjMzmoo7o7T): test runs 3, module lines 336

## J3 · COMPLETE

Re-run after B3 (K3152): `tranche/T47` merged into `job/T47/signin-door` at `9d57591897`, no conflict, no code change. The files, interface and findings are as in J2.

- `node --test bio-plane/test/m/signin-door/`: tests 15, pass 15, fail 0.
- `format`: 168 modules, 0 failures.
- With my paths filled into a local, uncommitted `modules.json` (the committed entry is still empty): architecture 4 files, 0 failures; coverage 5 of 5, 0 failures; ownership 5 files, 0 failures. `run.mjs` reports architecture at 3141 files with 0 failures, and coverage with 16 failures, all in other modules.
- With the committed empty entry, `architecture` and `ownership` each count my 4 files as unowned (4 failures), and coverage reads 0 of 5. Both clear once BOB adds paths `bio-plane/src/signin-door/` and tests `bio-plane/test/m/signin-door/`.

Size (session_01DHEqiW9nuJMTjMzmoo7o7T): test runs 4, module lines 336
