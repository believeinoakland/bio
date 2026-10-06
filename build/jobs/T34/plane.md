# plane (T34)

**Status** · session_016j2cQUCpdP2bQzqEqTf8Co · depth 2 · WORKING · handled B2

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
