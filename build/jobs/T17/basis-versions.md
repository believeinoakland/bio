# basis-versions (T17)

**Status** · session_01FcozLKDUr1LfW1f9JGHiug · depth 2 · COMPLETE · handled B0

## J1 · QUESTION

Two things B1 needs that are BOB's, with my best reading; I am building on it now.

1. **A `uses` edge.** Registering my own R56 decoration (K593) means `basis-versions` imports `retrievalOf` from `retrieval` (layer 5, earlier; legal under P4), but `modules.json` does not list `retrieval` in basis-versions' `uses`, so `checks/architecture.mjs` will fail. Best reading: add `retrieval` to basis-versions' `uses` (as `ai-runs` has it for its own R56 decoration).

2. **A requirement for the registration.** R11 says what `op=basisversions` answers; nothing says basis-versions registers the projection decoration. Proposed text, a new **R42**, under the reads:
   "**R42** At creation, `basisVersionsOf` registers with `retrieval` (its R56, module name `basis-versions`) the single-bundle projection's `no_project_conclusion`: for an inquiry, exactly R11's `no_project_conclusion` for the same viewer (R23's answer when the inquiry is visible to them, else null); null for every other type. It never throws (a failure reads null) and it is never on the list form (retrieval R5). *(N392, K593)*"
   The factory takes `deps.retrieval` (a test's own) and otherwise `retrievalOf(host)`; on the plane, legacy-store has created retrieval with its clock before any module reaches basis-versions (`store.mjs` about :535).

My tests name R11, R23 and R42. If you reword or refuse R42, say so and I will align.

## J2 · QUESTION

Replaces J1 (the design moved; best reading, built and green).

1. **Wiring, no source import.** `basisVersionsOf(host, deps)` registers its decoration with `deps.retrieval` when given, and a host that hands none registers nothing: letting the factory call `retrievalOf(host)` itself created a retrieval on every other module's test host that builds basis-versions (strength, publication, case-authoring, …) and broke their promotions (no `bundle_projection`). On the plane, legacy-store hands it one line after it creates retrieval with its clock (`store.mjs` :536, `basisVersionsOf(ctx, { retrieval });`, before `aiRunsOf`, the first module that reaches basis-versions); that line uses only a name imported from my paths (§12.2). legacy-store's net change is −7 lines.

2. **A `uses` edge, for the test only.** `bio-plane/test/m/basis-versions/fixture.mjs` imports `retrievalOf` to build the real retrieval the equality test needs. Best reading: add `retrieval` to basis-versions' `uses` in `modules.json` (layer 5, earlier; P4 holds). If you'd rather not add it, I'll replace the real retrieval with a stand-in that applies the registered decoration as R56 does, a weaker test.

3. **A requirement, proposed R42** (under the reads):
   "**R42** `basisVersionsOf` registers with the `retrieval` its host hands it (its R56, module name `basis-versions`) the single-bundle projection's `no_project_conclusion`: for an inquiry, exactly R11's `no_project_conclusion` for the same viewer (R23's answer when the viewer may see it, else null); null for every other type; never throws. *(N392, K593)*"

My tests name R42, R11, R23 (and R33 for the invisible arm).
