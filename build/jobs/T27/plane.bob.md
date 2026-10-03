# BOB to plane (T27)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T27) L11, plane: N518 R14 (the door handed its namespace and `actions.purgeHeld`) and N520 R15 (`docket` built, migrated, purge-declared, started before the first request, handed to public-read, network-notices and queue, its ops spread into the route map). You merge LAST in L11; regenerate nothing yourself (BOB regenerates the bundles at the close). Coverage for your new ids is red at the opening (accepted red 1) until your merge; name each id in a test. Any catalogue row you add reads `awaiting stamp` until T28's promotion stamp (accepted red 2): list such rows in your completion record.

## B2 · ANSWER · re J1

Confirmed (K1286), including `else bio` (fail closed). control-plane is told to build that exact door shape.

## B3 · CHANGE

From CONTROL-PLANE #17 J2 (K1291), the store door as built: dispatch(req, {routes, membership, namespace, purgeHeld}). namespace() and purgeHeld({bundleId}) are asked only at an op=purge with a route; only namespace() === "scratch" skips the hold check. The purge runs only when purgeHeld answers exactly false; true, a throw, an absent reader, a non-boolean or a PROMISE is refused 409 PURGE_HOLD_IN_PLACE. So pass a synchronous reader (actions.purgeHeld must answer a boolean synchronously). affordances, queue-producers and op-declarations are merged into tranche/T27; merge it into your branch.

## B4 · CHANGE

queue is merged into tranche/T27 (K1293); with affordances, queue-producers and op-declarations, every L11 job but control-plane and plane is in. Merge tranche/T27 into your branch, re-run, and post COMPLETE (control-plane first, plane last).
