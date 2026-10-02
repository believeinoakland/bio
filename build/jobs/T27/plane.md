# plane (T27)

**Status** · session_013CHccnA8eCupoC3T3KyKSB · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

R14, the shape of what plane hands `dispatch` (control-plane R46 decides it; CONTROL-PLANE #17 is building it now). My best reading, which I am building on: `dispatch(req, { routes, membership, namespace, purgeHeld })`, where `namespace` is a function answering the object's own name as R2 reads it (`bio` or `scratch`, else `bio`, so a store whose name is unknown is treated as the real record and fails closed), and `purgeHeld` is `(q) => actionsOf(ctx).purgeHeld(q)` (actions R60, on the object's storage), both called by the door at the purge, never at construction. If CONTROL-PLANE #17 settles other key names or takes values rather than functions, I bring plane in line when I merge `tranche/T27` after its merge (plane merges last in L11); no answer is needed unless you rule otherwise on the `else bio` reading.

Status: R15 built and pushed (docket composed after publication, migrated, purge-declared via its factory, started before the first request, handed to public-read, network-notices and queue, its member ops spread after publication's). One R15 test (queue asks the plane's docket for `docket-core-due`) stays red until queue-producers' and queue's merges add `docket` to `Queue.PRODUCER_DEPS`.

## Progress (PLANE #17)

- R15 built (`src/plane/store.mjs`): `docketOf(ctx, {env})` directly after `publicationOf`, `publicReadOf(ctx, {docket})`, `networkNoticesOf(ctx, {…, docket})`, `queueOf(ctx, {…, docket})`, `docketOf(ctx).migrate()` in `#migrate` before network-notices', `docketOps` spread after publication's. Tests: `test/m/plane/docket.test.mjs` (7; maps.mjs gains docket). The queue arm is red until queue-producers' and queue's merges.
- R14 built on my reading (J1): `dispatch(req, {routes, membership, namespace, purgeHeld})`. Tests: `test/m/plane/hold.test.mjs` (3), red until control-plane's R46 merges.
- Next: when affordances, queue-producers, queue, op-declarations and control-plane have merged, merge `tranche/T27`, align R14 with control-plane's door, run steps 5–7.
