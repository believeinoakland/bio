# basis-versions (T17)

**Status** · session_01FcozLKDUr1LfW1f9JGHiug · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two things B1 needs that are BOB's, with my best reading; I am building on it now.

1. **A `uses` edge.** Registering my own R56 decoration (K593) means `basis-versions` imports `retrievalOf` from `retrieval` (layer 5, earlier; legal under P4), but `modules.json` does not list `retrieval` in basis-versions' `uses`, so `checks/architecture.mjs` will fail. Best reading: add `retrieval` to basis-versions' `uses` (as `ai-runs` has it for its own R56 decoration).

2. **A requirement for the registration.** R11 says what `op=basisversions` answers; nothing says basis-versions registers the projection decoration. Proposed text, a new **R42**, under the reads:
   "**R42** At creation, `basisVersionsOf` registers with `retrieval` (its R56, module name `basis-versions`) the single-bundle projection's `no_project_conclusion`: for an inquiry, exactly R11's `no_project_conclusion` for the same viewer (R23's answer when the inquiry is visible to them, else null); null for every other type. It never throws (a failure reads null) and it is never on the list form (retrieval R5). *(N392, K593)*"
   The factory takes `deps.retrieval` (a test's own) and otherwise `retrievalOf(host)`; on the plane, legacy-store has created retrieval with its clock before any module reaches basis-versions (`store.mjs` about :535).

My tests name R11, R23 and R42. If you reword or refuse R42, say so and I will align.
