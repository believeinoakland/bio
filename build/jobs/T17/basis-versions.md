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

## J3 · COMPLETE

Completion on J2's best reading (J2 still open; a `CHANGE` re-opens me). Commit `1516cc89d3`.

**Entries applied.** B1 / N392's share (K573, K593): basis-versions registers its own R56 decoration, module name `basis-versions` (`projectionDecoration(row, {viewer})`: for an inquiry the viewer may see, `noProjectConclusionOf` exactly as `basisVersions` answers `no_project_conclusion`; null otherwise; never throws), with the `retrieval` its host hands `basisVersionsOf` (J2 §1). legacy-store: the `no_project_conclusion` key and the `#noProjectConclusionOf` delegate removed; the `surfaced_in` arm and `#surfacedIn` left for inquiry (N405); one line hands retrieval to the factory (`store.mjs`:536).

**Old suite (`test/projection-noproject.test.mjs`), what I carry** in `bio-plane/test/m/basis-versions/projection.test.mjs` (6 tests, real retrieval): §1 whole: the fixture is real (the act concluded with no project, adopting the claim); per viewer (two members and the machine) the row is the concluded inquiry, the field present and non-null on both reads with the claim state (adopted / undetermined), byte-identical to `op=basisversions`, over 200 bytes; the adopted answer's content (`relationship`, `project`, `relationship_established`, the claim verbatim, its version, the conclusion text), plus the legacy answer never back-filled. §2 (null, key present, open inquiry and two non-inquiries) and §3 (never on the list form, paged or filtered), since the null is my answer. Added: an invisible viewer gets no row and R11's null; a second registration is refused; a host with no retrieval registers nothing. **Not carried:** §4 (source-text reads). The old suite is left for legacy-tests; on this branch it runs 23 pass, 3 fail: exactly §4's three source pins of the old location, every behavioural arm passing on the real plane.

**For BOB's review (ownership).** One added line in legacy-store that is not an import or a use of my names: `store.mjs`:552 `return migrated ? { surfaced_in: migrated } : {};`. It is the minimum rewrite once the key leaves the object literal (the old `const one = { no_project_conclusion: … };` and `{ ...one, … } : one`); legacy-store's net change is −5 lines (2 added, 7 removed). The other added line (:536) uses `basisVersionsOf` only. The removed comment described blocks that have all moved (the action block is actions').

**Deferred.** None in this module. R42's text awaits J2 §3.

**Found in other modules.** inquiry: legacy-store still registers the migrated `surfaced_in` arm (N405, T18), known.

**Tests and checks.** `node --test test/m/basis-versions/`: 53 pass, 0 fail (negative control: with the registration disabled, 4 of the 6 new tests fail). Modules that build basis-versions, unchanged: retrieval 70/0, strength 45/0, contradiction 89/0, case-authoring 68/0, publication 108/0, run-productions 35/0, reevaluation 67/0, affordances 106/0, ratification 86/0, review 30/0, inquiry 78/0. No layer tests. `format`: 72 modules, 67 requirements files; 0 failures. `architecture basis-versions`: 11 product files, 43 imports; 1 failure, the fixture's import of retrieval (J2 §2's `uses` edge). `coverage basis-versions`: 41 of 41 live ids named; 0 failures (R42 named once live). `ownership basis-versions tranche/T17`: legacy-store 2 added, 7 removed; 1 failure, the line above.

Size (session_01FcozLKDUr1LfW1f9JGHiug): test runs 9, module lines 2055
