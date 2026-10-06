# plane (T34)

**Status** · session_016j2cQUCpdP2bQzqEqTf8Co · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

Your B1's R19/R21 line: "compose any new module this layer's splits add (queue-producers', instance-setup's) at its place in `modules.json` order". My best reading, which I am building on:
1. `setup-page` is pure (its Purpose: reads no table, writes nothing, registers nothing; `instance-setup` composes it and serves it through control-plane's `/`). The plane builds nothing for it, as for `case-catalogue`; the R2/R10 test excuses both by the interface: a `modules.json` module absent from the step order must hold no promotion step on a constructed store.
2. `machinery-producers` holds no table and registers nothing at start (each producer derives on read); `queue-producers` R8 reaches it (`conditionItems`) from the deps `queue` hands it, so the plane composes it only if its factory needs a dep the plane alone can hand. Neither job has pushed code yet; since plane merges after both, at my merge I wire `machineryProducersOf(ctx, deps)` at its place (after tasks, before queue's producers) only if its merged factory takes a dep no earlier module can reach, and otherwise add no line. Correct me if you want the plane to build it eagerly regardless.

## J2 · REPORT

Findings outside plane (none changed by me):
1. **bundler** `test/system/deploybindings.test.mjs` (layer 1, closed): its live arms pin the real config's four service bindings and three fleet targets, so T34-76's `SHEET_WORKER` binding (N625, K1683) turns two arms red: "the real config's four service bindings all derive" and "the real config's fleet targets pre-flight (self excluded)" (35 passed, 2 failed). Each wants `SHEET_WORKER` / `sheet-worker` added. Nothing else reading `wrangler.jsonc` is red (scheduler, capture, bundler release, control-plane limits, reevaluation mv5, resolveversion, newgroup's three: all green). The deploy pre-flight now also names `sheet-worker` as a fleet target, so the member must be deployed before the plane (K1705 G6).
2. **membership** R83 `module-order.test.mjs` is red on the tranche (2 tests): `MODULE_ORDER` lacks `case-catalogue` (K1824), `machinery-producers` (K1850) and `setup-page` (K1851). Today none of the three registers a step or listener, so nothing is mis-ranked (plane's R2/R10 test now checks exactly that); a later registration by any of them would rank last (promotion R39).
3. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale from this job's source (regenerated at the layer's close).
4. **ratification/actions order (fixed in plane, for the record):** `actionsOf` reaches `ratificationOf(ctx)` for its hold reader (actions R69), so ratification was first built there, bare. The plane now builds ratification with its `worker` immediately before `actions`, so the reach K1832 asks for is the one it holds. No full scheduled-publish run on the composed store drives R42's after-commit steps end to end (no fixture builds a signed waiting edition on the real store); ratification's own `schedule.test.mjs` covers the publisher, and plane's `t34.test.mjs` covers the reach it hands.

## J3 · COMPLETE

**Entries applied (T34-76, R19's T34 share, T34-87's rows, accepted red 8):**
1. (K1806) `plane/ask.mjs` asks `credentials.accountFor` and carries agent-worker R6's shape `{kind, level, secret, member, suggestions}`; the member's own switch is read for a `member`-level account, and a `group`-level one carries `suggestions: false` (K1798). A member served by the group key can ask once the key is held and on and the notice read.
2. (N625, K1683) `wrangler.jsonc` binds `SHEET_WORKER` → `sheet-worker`.
3. (N584; K1788, K1803) answers' `relations` dep dropped (and the `PROJECTION_RELATION` import): answers reads retrieval's `relations()` and `zone()` itself.
4. (K1832, accepted red 8) `store.test.mjs` R2/R10: a `modules.json` module absent from the step order is not asked for a rank and must hold no step on a constructed store (case-catalogue, setup-page, machinery-producers today). Cleared.
5. (K1832) `ratificationOf(ctx, {worker})` with `ratificationWorker({env, door, namespace})` (`wiring.mjs`): the env, a stub whose `fetch` is the object's own door, and `storeName` read from the namespace. Built before `actions`, which otherwise builds ratification bare (found by tracing construction).
6. R19 (DEC-152, DEC-153): `MACHINE_DRAFTS` gains `groupdescriptiondraft` and `writinghelp`; the registration hands `irreversible`, read from affordances' `RUNGS` at registration (so `publishat`/`publishatmove` join when affordances' R42 merges).
7. R2/R21 splits (B2, K1863 (3)): setup-page pure, no line; machinery-producers merged and read: every dep defaults lazily to its module's per-host instance and it registers nothing, so no line.
8. DEC-149 (T34-87): `ask.mjs:36` "your group's Civicsmith has no assistant bound to it. Nothing was asked."; `screens.mjs` record, members and published purposes say "your group's Civicsmith". No check translation changed (no catalogue version move). `wizards`/`wiring`' operator-facing `NO_ENGINE` ("not bound to this plane") left as operator text.

**Deferred:** none in plane. When wizard-scripts merges with R13's `irreversible`, its own tests drive R24's refused set; plane's R19 test checks the registration's parts.

**Other modules:** see J2 (bundler deploybindings ×2 red from the binding; membership R83 red; plane bundle stale).

**Tests and checks** (on the branch with `tranche/T34` @ machinery-producers' merge): `node --test test/m/plane/` 114 pass, 0 fail; wrangler readers elsewhere green (scheduler 5, capture 2, bundler release 34, control-plane limits 1, reevaluation mv5 1, resolveversion 1, newgroup 37+1+1); bundler `deploybindings` 35 passed, 2 failed (J2 1). `format`: 0 failures; `architecture plane`: 0 failures; `coverage plane`: 24 of 24, 0 failures; `ownership plane tranche/T34`: 13 files, 0 failures. P6: `src/plane/` 1,000 lines.

Size (session_016j2cQUCpdP2bQzqEqTf8Co): test runs 7, module lines 1000

## J4 · COMPLETE

B4 and B5 applied (tranche/T34 merged first, at wizard-scripts' merge, K1869).

**B4 (K1868 (2)).** The plane builds `queueProducersOf(ctx, deps)` itself, its deps being `Queue.PRODUCER_DEPS` filtered from the providers it hands queue (filingTemplates, localFacts, docket, caseImport). It hands that instance to queue as `producers` and to instance-setup as `deps.queueProducers`. Instance-setup is now built by `instanceSetupOf(ctx, env, {queueProducers})` before its start. Construction traced: queue-producers is first built at the plane's line, with those four deps. Instance-setup is first built at that line too. Test `t34.test.mjs` K1868 (2): `queueProducersOf(ctx)` is the one instance and holds instance-setup's `placeArrivals`, so a second `registerPlaceArrivals` is refused `PLACE_ARRIVALS_REGISTERED`. A bare instance on another storage holds none.

**B5 (K1869 (2)).** `wizardRegistration().screens` is wizard-scripts' `SCREEN_REGISTRY`. `requiredFailures` defaults `screens` to `[]`, so I pass it explicitly rather than omit it. The plane's own `SCREENS` still goes to answers' explain read and R24's check. **Wording for you:** plane R24 says `SCREENS` is "hands to wizard-scripts (its R13)", and R19 says "the screen registry carried in the plane's bundle". After B5 these should read that wizard-scripts is registered with its `SCREEN_REGISTRY`, and `SCREENS` goes to answers only.

R19's wizard test now also drives R24's help refusal over what was registered: `groupdescriptiondraft` and `writinghelp` conclude on a machine-refused act and on each irreversible act, while case-authoring's drafts are allowed there. The door test's instance-setup route count is no longer pinned at 20: every route instance-setup holds must be in the route map, and the driven ones answer through the door.

**Tests:**
- On `job/T34/plane` alone: 112 pass, 3 fail. Each failure waits on a merge due before plane's in the L11 order:
  - release R19 ×2 wait on op-declarations, which declares the owed acts `groupkeyset`, `memberlanguageset` and `publishat`.
  - K1868 (2) waits on queue-producers' `registerPlaceArrivals` and instance-setup's `deps.queueProducers`.
- On a scratch merge of plane + `job/T34/queue-producers` + `job/T34/instance-setup` + `job/T34/op-declarations` (heads as fetched now): `node --test test/m/plane/` 115 pass, 0 fail.

**Checks:** format 0, architecture plane 0, coverage plane 24/24 0, ownership plane tranche/T34 14 files 0. P6: `src/plane/` 1,013 lines.

Size (session_016j2cQUCpdP2bQzqEqTf8Co): test runs 12, module lines 1013
