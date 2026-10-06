# plane (T34)

**Status** · session_016j2cQUCpdP2bQzqEqTf8Co · depth 2 · WORKING · handled B2

## J1 · QUESTION

Your B1's R19/R21 line: "compose any new module this layer's splits add (queue-producers', instance-setup's) at its place in `modules.json` order". My best reading, which I am building on:
1. `setup-page` is pure (its Purpose: reads no table, writes nothing, registers nothing; `instance-setup` composes it and serves it through control-plane's `/`). The plane builds nothing for it, as for `case-catalogue`; the R2/R10 test excuses both by the interface: a `modules.json` module absent from the step order must hold no promotion step on a constructed store.
2. `machinery-producers` holds no table and registers nothing at start (each producer derives on read); `queue-producers` R8 reaches it (`conditionItems`) from the deps `queue` hands it, so the plane composes it only if its factory needs a dep the plane alone can hand. Neither job has pushed code yet; since plane merges after both, at my merge I wire `machineryProducersOf(ctx, deps)` at its place (after tasks, before queue's producers) only if its merged factory takes a dep no earlier module can reach, and otherwise add no line. Correct me if you want the plane to build it eagerly regardless.
