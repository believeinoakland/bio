# control-plane (T14)

**Status** · session_01LAa14DqmXc5v5eTwUerjPT · depth 2 · COMPLETE · handled B1


## Completion (CONTROL-PLANE #5)

**Entries applied.**
- **N339 with N349** (R23's appended sentences, R25): the door's own silences now carry the correlation id `doAnswer` read from the store's internal error: the front door's credential lookup (`aiCredentialPresented` → `storeSilent(presentedAi.silent, presentedAi.correlation)`), `caseReader`'s two lookups (its `{silent: op}` answers now carry `correlation`; the review door passes it on), the admission session lookup, `aicredentialmint` and `reviewgrant`. The sites that already carried it (`reviewAnswer`, `relayAnswer`, the forward) are unchanged, and every relay of this module answers a store refusal through `storeRefusal`. `storeRefusal`, `doAnswer` and `storeSilent` stay exported for other modules' relays.
- **N347** (R22): `MODULE_CHECK_FILES` reads capture's `src/capture/checks.mjs` (`CAPTURE_CHECKS`; the `uses` edge is in `modules.json`). `dec49Row("EVIDENCE_NOT_HELD")` is C-118.1, `dec49Row("NO_SUCH_KNOCK")` C-118.2, `dec49Row("NOT_FOUND")` null.
- **N348** (R35): `dispatch.mjs`' `Store` starts `instance-setup` once per object at construction (`ctx.blockConcurrencyWhile(() => instanceSetupOf(ctx, env).start())`, idempotent on one storage), and its `fetch` hands `dispatch` the route map `{...legacy-store's routes, ...instanceSetupOps(...)}` (no name collides; measured), so the fourteen routes pass R26's body read and envelope, R27's existence read and R25's catch. Legacy-index's wrapper (`src/index.mjs`:111–112) still answers them first until its N348 share exports this `Store`; with the wrapper, instance-setup starts once (the wrapper's second `start` starts nothing, tested).
- **Optional (K458)**: the gate's account (the family spanning membership and control-plane; the fence as a member-reach property of `OPS` with its two proofs; one code at the gate, two at the mint) restored beside `AI_SCOPE_CHECKS`' header in `src/control-plane/checks.mjs`, from the catalogue's header before 0ae4706953, with the file names brought to where the code now is.

**`not yet met` marks my work meets** (for BOB to strike): R22's (N347); R23's (N339, N349). R35's (N348) is met by this module's class; the instance's export is legacy-index's N348 share, so R35 keeps one `test.todo` naming that cause until it lands.

**Check rows.** None added, moved or retired (no row awaiting stamp).

**A reading for BOB to confirm (not blocking).** The credential and session lookups (`aicredentiallook`, `session`) are not relays: they resolve who is asking. A store refusal there (`ok: false` below 500, which `doAnswer` reports `refused`) is still answered as a silence, `STORE_DID_NOT_ANSWER` naming the lookup, never relayed to the caller of a different op as though it were that op's refusal. That is how the code stood and how I left it.

**Found in other modules (reported, not changed).**
- legacy-index (`src/index.mjs`:111–112): N348's share, exporting this module's `Store` unwrapped; after it, `instanceSetupStore` in `src/setup.mjs` (instance-setup) has no caller.
- instance-setup (`src/setup.mjs` `instanceSetupRoute`): its own door still answers a throw with `String(e.stack)` (the test's negative control shows it); once legacy-index exports this `Store` it is reached by nothing, and it and `instanceSetupStore` can go (T15 owes instance-setup N348's wrapper).
- legacy-ui / legacy-tests: `civicos-ui/check-refusal-codes.mjs`:3823 still describes capture's C-118.1 as `NOT_FOUND` (capture's rename, N347); not code I added or retired.
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`; its manifest lists the control-plane files), reported, not rebuilt.

**Greps.** `EVIDENCE_NOT_HELD`, `instanceSetupStore`, `instanceSetupOps`, `M_CAPTURE`: no hits in `civicos-ui/` or `src/affordances.mjs`. `NO_SUCH_KNOCK` and `correlation` hit only `civicos-ui/check-refusal-codes.mjs`, pre-existing.

**Deferred.** None.

**Tests and checks** (on `job/T14/control-plane` after merging `tranche/T14` @ 3e58d4b942):
- `node --test bio-plane/test/m/control-plane/`: tests 52, pass 51, fail 0, todo 1 (R35's export, above). New: `store-class.test.mjs` (R35: construction once per object and with the wrapper; the fourteen routes answering as through instance-setup's own door; BAD_JSON; STORE_INTERNAL_ERROR with a correlation and no stack); `envelope.test.mjs` "R23, R25 (N349)" (every silence site, with and without a correlation; the three functions handed to other relays) and "R22 (N347)". Each new test was run against the pre-change source and failed there.
- `node --test bio-plane/test/m/instance-setup/ bio-plane/test/m/capture/`: tests 128, pass 128, fail 0.
- `checks/format.mjs`: 69 modules, 0 failures. `checks/architecture.mjs control-plane`: 12 product files, 75 relative imports, 0 failures. `checks/coverage.mjs control-plane`: 35 of 35 live ids named by a test, 0 failures. `checks/ownership.mjs control-plane tranche/T14`: legacy-index, legacy-store, legacy-checks 0 lines added or removed, 0 failures.

Size (session_01LAa14DqmXc5v5eTwUerjPT): test runs 9, module lines 6,161

## J1 · COMPLETE

N339 with N349, N347, N348 and the optional K458 applied (record: Completion (CONTROL-PLANE #5)). The door's own silences carry the store's correlation (front-door credential lookup, caseReader's two lookups, the admission session lookup, aicredentialmint, reviewgrant). The door reads capture's CAPTURE_CHECKS (EVIDENCE_NOT_HELD C-118.1, NO_SUCH_KNOCK C-118.2, NOT_FOUND nothing). dispatch.mjs' Store starts instance-setup once per object and routes its 14 ops inside R26's frame (BAD_JSON, R27, R25's catch); legacy-index's wrapper still answers first until its N348 share exports this Store (R35 keeps one test.todo naming that). Strike: R22's and R23's not-yet-met marks; R35's once legacy-index lands. No check rows added, moved or retired. control-plane tests 52: 51 pass, 0 fail, 1 todo; instance-setup + capture 128/128; format, architecture, coverage (35/35), ownership: 0 failures. Stale: bio-plane/dist/bio-plane.bundled.mjs. A reading to confirm, not blocking: the credential/session lookups are not relays, so a store refusal there stays a silence naming the lookup. Found: instance-setup's instanceSetupRoute/instanceSetupStore go once legacy-index exports this Store; civicos-ui/check-refusal-codes.mjs:3823 still names C-118.1 NOT_FOUND.
