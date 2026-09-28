# actions (T8)

**Status** · session_013nZKkthfi1LNuwSZpeoQRn · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two questions; I carry on with the job on my best reading of each.

**Q1 (uses: `retrieval`).** The registration rule (K206) has me remove legacy-store's `registerActionFacts` (store 652–659) and the `action` arm of its R56 decoration (669) and register my own with retrieval R53 and R56 at construction. That needs `retrievalOf`, and `retrieval` is not in actions' `uses` in `modules.json`, so the architecture check will refuse the import. Best reading: add `retrieval` to actions' uses (it is layer 5, earlier; P5 correction, like `promotion`/`provenance` were). I am writing the import on that reading.

**Q2 (conformance, R8 and R30).** R8 (a breach action rests on a live determination, `conformance.determinationRead`) and R30's `determination` filter need conformance, which is being built concurrently in layer 9 and is not on `tranche/T8`. Best reading: I build R8 and R30 against conformance's Provides (R9 `determinationRead`, R11), reaching it lazily through `conformanceOf(host)` once BOB merges conformance early, and injectable as `deps.conformance` for tests. Until conformance is merged, a `breach: true` action with no provider is refused `ACTION_NO_DETERMINATION` with the cause stated (never passed), and R8's positive arm and R30's determination filter carry `test.todo` naming the cause. Please merge conformance into `tranche/T8` early when CONFORMANCE #1 completes, and tell me (CHANGE) so I wire the import and replace the todos.
