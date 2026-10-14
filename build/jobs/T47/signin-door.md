# signin-door (T47)

**Status** · session_01DHEqiW9nuJMTjMzmoo7o7T · depth 2 · WORKING · handled B1

## J1 · QUESTION

Five points the requirements leave open. I carry on with every best reading below; only Q1 decides a file outside my paths.

**Q1 · Where the store-side halves live.** R2 (`credentials.disclosureDue`), R4 (`subscriptionTokenHold`, `subscriptionTokenRefused`) and R5 (the trace store) are in-plane calls of the record store (the Durable Object); the door runs in the Worker. Today only `aikeptaway` and `subscriptionconnected` are store-internal routes (`store-door` R10); no entry adds the others. Best reading: this module provides its own store-internal map, `signinDoorOps(ctx, url, body)` (the `membershipOps` pattern, no op spec, `op-declarations` R6), with `signintokenhold`, `signintokenrefused`, `signindisclosuredue`, `signintracekeep` and `signintraceread`, each calling `credentials` in process (`credentialsOf(ctx)`) or the module's own bounded trace, and **`plane`'s job spreads it** into the store's route map (`plane/store.mjs`, beside `credentialsOps`). `state` reads the existing `accountreference` route (credentials' own map). Until plane spreads it, the door's calls to those routes answer as a store refusal (fail closed: no `start`, no hold). Alternative: `store-door` adds the five routes to its R10 map.

**Q2 · The instance salt for `member_ref` (R3).** No "instance salt" exists. Best reading: `member_ref` = first 12 hex of `sha256(env.INSTANCE_NAME + by)` (`""` when unset), the bare `by` on a test instance (`CIVICSMITH_TEST_INSTANCE` equal to `INSTANCE_NAME`, both non-empty: `ai-runs` R78's fact, read from `env` here). The member id is not a secret (K1819); the ref only keeps the bare id out of logs.

**Q3 · `state` under R4.** R4 ("`state` is answered from `credentials.accountReferenceState`'s `subscription`") amends R1's "`state` and `signout` are always sent". Best reading: `state` sends nothing to the runner and answers `{ok: true, step: "state", connected, since, held, valid_until?, refused_at?, trace}` from `accountreference?member=<by>&viewer=<by>`; a store refusal or silence is answered as the door answers one (never "not connected"). R1's "a `state` answer carrying `connected: true` is recorded" then has no case.

**Q4 · `attempt` on `code` (`agent-worker` R85).** agent-worker relays `{member, code, attempt?}`, "an `attempt` the door sends"; my R1 sends `{member, step, code?}` "from the request's body only" and names no `attempt`. Best reading: on `code` the door also passes the body's `attempt` when it is a string of at most 200 characters (from the body only), else sends none; `start`'s answer relays the runner's `attempt` unchanged. Say no and I send none.

**Q5 · `connected: true` with a hold.** `credentials.subscriptionTokenHold` records the fact itself (its R70). Best reading: a `code` answer that carries `token` is recorded only through the hold (no `subscriptionconnected` call); a `code` answer with `connected: true` and no `token` is recorded by `subscriptionConnected` as R1 says.

Also for BOB's notes (no answer needed): `SIGNINTRACE_NOT_TEST`'s row is `answer-envelope` R16's (`DISPATCH_CHECKS`); its `where` should name `src/signin-door/index.mjs`. The door's interface for `control-plane` (T47-65) will be in my COMPLETE.
