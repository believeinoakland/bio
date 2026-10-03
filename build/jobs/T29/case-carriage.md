# case-carriage (T29)

**Status** · session_01NMLMCaPqjqRW2kHK9vegRN · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

**Entries applied.** `build/plan/current.md` (T29) L8, case-carriage, a new module (N532; K1332, K1337), built by copy from publication (K624 (1)) per `build/extraction/publication-split-2.md`: R1–R7, all met.
- `bio-plane/src/case-carriage/index.mjs` (299 lines): `caseCarriageOf(host, deps)` (K61; creates its tables and declares them exempt at creation, R6) and the class `CaseCarriage` with `holdMaterials` (R1, copied from publication's `#holdMaterials`, `#registered`, `#fileRow`, `#tokenFiles`), `heldMaterialsOf` (R2), `publishedMaterialText` (R3), `acceptedWorkLapsed` (R4, from `#acceptedWorkLapsed`), `sourcesLapsed` (R5, from `#sourcesLapsed`); `UNHELD_MAX` (1000), `UNDISCLOSED_MAX` (200).
- `bio-plane/src/case-carriage/schema.mjs` (42 lines): `published_material_texts`, `published_case_materials`, same names and columns (`CREATE TABLE IF NOT EXISTS`, so existing rows stay), `CASE_CARRIAGE_EXEMPT`.
- At the seam, as R1 states: `holdMaterials(fm, {caseId, edition, at})` writes the texts and the edition's list itself, writes nothing to `published_shas`, and answers `files` (`{sha256, ref, path: "materials/<sha>", kind, bytes}`) for publication to register. Its reads all run before its writes; it opens no transaction. A second call for an edition writes no new list rows (checked by existence, not only by `ON CONFLICT`, so a longer second list adds nothing). A write the store refuses is answered (every item unheld, "could not record it"), never thrown. `at` absent: the module's clock.
- Small hardening, no change of meaning: R4's and R5's reads are guarded, so a throwing read counts as not in force / answers nothing (fail closed); `publishedMaterialText` trims and never throws. A token not held is named under the document's digest, as built.

**Paths, for BOB to write into `modules.json` before the merge:** `paths` `["bio-plane/src/case-carriage/"]`, `tests` `["bio-plane/test/m/case-carriage/"]`. My imports match the registered `uses` (record-grammar, record-core, membership, promotion, sources, extraction, accepted-work, case-grammar by import; provenance by its `register` read contract only, in SQL). No correction.

**Deferred.** None.

**For publication's job (PUBLICATION #17), against its re-worded R51, R57, R59 and the seam map §1:**
- Create it as `caseCarriageOf(host, {storage, record, membership, promotion, now, ...given})`, forwarding a given `sources`, `acceptedWork`, `extraction` (the fixture's stand-ins), and drop the two names from `PUBLICATION_EXEMPT` in the same change: publication declares first in its factory, so while it still lists them case-carriage's declaration answers `TABLE_DECLARED` and declares nothing (its `purgeDeclaration` shows it).
- In `commitCaseEdition`: call `holdMaterials(docFm, {caseId: id, edition: ed, at: when})`, insert each answered `files` row into `published_shas` (`bundle_id` = `ref`, `published` = `when`), and stop writing `published_case_materials` itself (case-carriage does).
- No generated artifact is staled by this job: nothing reaches the module yet. Publication's wiring will stale the plane bundle.

**Found in other modules.** None.

**Tests and checks** (on `job/T29/case-carriage` with tranche/T29 @ K1344 merged):
- `node --test bio-plane/test/m/case-carriage/`: tests 21, pass 21, fail 0. Every R1–R7 named; a negative control for each withdrawn and undisclosed arm of R4 and each lapse of R5; R1's arm for a material not included; R6's purge arm. Mutation-checked: 6 of 7 mutants killed; the survivor (R5's no-knock early return) is equivalent, the row failing closed either way.
- `node --test` membership `module-order`, `t9-notice-sight-bounds`, promotion `registry`, control-plane `promotion-step` (the tests that scan modules): pass 39, fail 0.
- No layer tests named in `build/manifest.md`.
- `node checks/format.mjs`: 97 modules, 96 requirements files; 0 failures.
- `node checks/architecture.mjs . case-carriage`: 6 product files, 24 relative imports; 0 failures.
- `node checks/coverage.mjs . case-carriage`: 7 of 7 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . case-carriage tranche/T29`: 7 files; 0 failures.
- The last three were run with the paths above written into `modules.json` locally, uncommitted (without them coverage reports 0 of 7, as expected).

Size (session_01NMLMCaPqjqRW2kHK9vegRN): test runs 18, module lines 341
