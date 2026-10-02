# plane (T27)

**Status** · session_013CHccnA8eCupoC3T3KyKSB · depth 2 · WORKING · handled B1

## J1 · QUESTION

R14, the shape of what plane hands `dispatch` (control-plane R46 decides it; CONTROL-PLANE #17 is building it now). My best reading, which I am building on: `dispatch(req, { routes, membership, namespace, purgeHeld })`, where `namespace` is a function answering the object's own name as R2 reads it (`bio` or `scratch`, else `bio`, so a store whose name is unknown is treated as the real record and fails closed), and `purgeHeld` is `(q) => actionsOf(ctx).purgeHeld(q)` (actions R60, on the object's storage), both called by the door at the purge, never at construction. If CONTROL-PLANE #17 settles other key names or takes values rather than functions, I bring plane in line when I merge `tranche/T27` after its merge (plane merges last in L11); no answer is needed unless you rule otherwise on the `else bio` reading.

Status: R15 built and pushed (docket composed after publication, migrated, purge-declared via its factory, started before the first request, handed to public-read, network-notices and queue, its member ops spread after publication's). One R15 test (queue asks the plane's docket for `docket-core-due`) stays red until queue-producers' and queue's merges add `docket` to `Queue.PRODUCER_DEPS`.
