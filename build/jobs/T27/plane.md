# plane (T27)

**Status** · session_013CHccnA8eCupoC3T3KyKSB · depth 2 · WORKING · handled B4

## J1 · QUESTION

R14, the shape of what plane hands `dispatch` (control-plane R46 decides it; CONTROL-PLANE #17 is building it now). My best reading, which I am building on: `dispatch(req, { routes, membership, namespace, purgeHeld })`, where `namespace` is a function answering the object's own name as R2 reads it (`bio` or `scratch`, else `bio`, so a store whose name is unknown is treated as the real record and fails closed), and `purgeHeld` is `(q) => actionsOf(ctx).purgeHeld(q)` (actions R60, on the object's storage), both called by the door at the purge, never at construction. If CONTROL-PLANE #17 settles other key names or takes values rather than functions, I bring plane in line when I merge `tranche/T27` after its merge (plane merges last in L11); no answer is needed unless you rule otherwise on the `else bio` reading.

Status: R15 built and pushed (docket composed after publication, migrated, purge-declared via its factory, started before the first request, handed to public-read, network-notices and queue, its member ops spread after publication's). One R15 test (queue asks the plane's docket for `docket-core-due`) stays red until queue-producers' and queue's merges add `docket` to `Queue.PRODUCER_DEPS`.

## Completion (PLANE #17)

**Entries applied.**
- N518 R14: `Store.fetch` hands `dispatch` `namespace: () => ownNamespace() || "bio"` (an unknown name fails closed; J1, confirmed B2, K1286) and `purgeHeld: (q) => actionsOf(ctx).purgeHeld(q)`, a synchronous reader on the object's storage (B3, K1291).
- N520 R15: `docketOf(ctx, {env})` built directly after `publicationOf` (it migrates, declares its three tables to purge, registers its figures and mint seed and starts at creation, filling reevaluation's docket registration); `publicReadOf(ctx, {docket})` built there so public-read reads it; `networkNoticesOf(ctx, {…, docket})`; `queueOf(ctx, {…, docket})` (`Queue.PRODUCER_DEPS`); `docketOf(ctx).migrate()` in `#migrate` before network-notices'; `docketOps` spread directly after `publicationOps`. Before this, network-notices' factory built docket on first use with no environment (its clock fell back to the wall clock); the plane now builds it with the object's environment.

**Deferred.** None.

**Found in other modules.** None. No catalogue row added by plane (no `awaiting stamp` row of mine). Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` is stale from this change (plane's source); BOB regenerates it at the close (B1).

**Tests and checks** (on `job/T27/plane` after merging `tranche/T27` @ B4):
- `node --test test/m/plane/`: 65 tests, 63 pass, 2 fail. The two failures are R14 refusals that need control-plane's R46 door, which has not merged yet. On a scratch merge of `origin/job/T27/control-plane` (23a3b66cf1), `node --test test/m/plane/ test/m/control-plane/` gives 204 pass, 0 fail.
- `node --test test/system/migrate-released.test.mjs`: 1 pass, 0 fail.
- `checks/format.mjs`: 0 failures. `architecture.mjs plane`: 0 failures. `coverage.mjs plane`: 15 of 15 live ids named, 0 failures. `ownership.mjs plane tranche/T27`: 5 files, 0 failures.

Size (session_013CHccnA8eCupoC3T3KyKSB): test runs 12, module lines 201
