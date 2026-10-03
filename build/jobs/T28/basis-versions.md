# basis-versions (T28)

**Status** · session_01EC1CbcpHTUynmhmiinbKPz · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

R3 (N522), my readings; I am building on them now and need only the export names confirmed before I merge.

1. **Imports I will take** (neither job has pushed code yet): from `../inquiry-grammar/index.mjs` `IMPORTED_FINDING_RE` and the R11 leg-form arm, which I assume is exported as `importedLegFindings(label, leg, check, findings)` answering findings in the `checkLegExtentGrammar` shape; from `../accepted-work/index.mjs` `acceptedLegRefusals({legs, viewer})` as a pure-looking call that reads the per-host registration. If accepted-work exposes it only on an instance (`acceptedWorkOf(host)`), I take it through my factory's `deps.acceptedWork` the way I take `inquiry`. Please ask both jobs for the exact names/shapes, or tell me to read their branches when pushed.
2. **Grammar.** A version leg whose target matches `IMPORTED_FINDING_RE` skips the canonical-id/type arm (C-25.10/C-25.14), the grade-vocabulary arm and `checkLegExtentGrammar`, and runs inquiry-grammar's R11 arm instead (its findings come back C-21.3); role and ground arms unchanged.
3. **Freeze.** `target_edition` defines a ref leg, so the composition gains `leg_edition\t<k>\t<edition>` lines after the `leg_capture` lines, only when a leg carries one (every held composition stays byte-identical; R5, R6, R29). Without it a version could change edition in place without `VERSION_FROZEN`.
4. **Which legs are asked.** In my promotion check (R6), after the freeze arm: only versions not already held (a held version is frozen; a changed one is refused `VERSION_FROZEN` first), and within them each ref leg with no leg of the same target and `target_edition` in its `derived_from` version. Refused `BASIS_VERSION_REFUSED` with accepted-work R3's findings (detail naming the version). `viewer` is the promotion's `author` (the ctx carries no viewer); accepted-work's own R4 has the same question.
5. **C-25.16.** A ref leg is not looked up in `bundles` (it is not a bundle); its existence is accepted-work's (C-21.4).
6. **Writers.** `versionAsWritten` and `appendVersion`/`narrow` carry `target_edition` through and write no `extent_kind` on a ref leg (R11 forbids an extent). `narrow` on a ref leg answers `NARROW_NO_PART` (no content row).
7. **Overlap check.** Does accepted-work's R4 step also walk `basis_version_legs`? My reading: no, it asks `basis[]` only, and the versions are mine (R3). If it does both, one of us drops it.

## J2 · REPORT

control-plane (not mine; found running my users' tests after merging tranche/T28 with accepted-work in): `test/m/control-plane/families.test.mjs` "R22 (K585 (1)): CHECK_FAMILIES is total" fails 138/1: `bio-plane/src/accepted-work/checks.mjs ACCEPTED_WORK_CHECKS` (C-21.4, C-21.5) is exported by a module of the plane and not reached by control-plane's CHECK_FAMILIES (its R22). The list needs accepted-work's family in its module's place (after inquiry-grammar, before inquiry). Caused by accepted-work's new family, not by basis-versions.

## J3 · COMPLETE

**Entries applied** (plan T28 L6, basis-versions R3; N522; B2–B6, K1304–K1308):
- Grammar (R3): a version leg whose target is an imported finding reference is judged by inquiry-grammar's `importedLegFindings` (R11, C-21.3, translated at the promotion) in place of the id/self (C-25.10, C-25.14), grade and extent arms; role and ground arms unchanged.
- Freeze (R3, R5, R6, R29): the composition gains `leg_edition\t<k>\t<edition>` after the `leg_capture` lines, only when a leg names one; every held composition is byte-identical. Changing a held leg's edition is VERSION_FROZEN.
- Acceptance (R3): in the promotion check, after the freeze, each ref leg of a version this promotion adds that has no leg of the same ref and edition in its `derived_from` version goes to accepted-work's `acceptedLegRefusals` (its R3, through `acceptedWorkOf(host)` or `deps.acceptedWork`), viewer the promotion's author; a refusal is BASIS_VERSION_REFUSED with its findings, each naming the version and leg; a check that fails is accepted-work's own C-21.5 for each leg, never a pass. Held versions are never asked again. A ref leg skips C-25.16 (not a bundle).
- B3 (K1305): `inquiry_basis_version_legs.target_edition` INTEGER (migrate adds it), written by the projection, answered on every leg of `basisVersions`/`versionCollections` (null on other legs). An additive column on R38's read contract; no column renamed or re-meant.
- Writers: `versionAsWritten` writes `target_edition` and no extent on a ref leg; `narrow` copies `target_edition` (the copy is the parent's leg, so not re-asked); `narrow` on a ref leg answers NARROW_NO_PART.

**Catalogue rows added:** none (no `awaiting stamp` rows from this job). C-21.3 is inquiry-grammar's, C-21.4/C-21.5 accepted-work's.

**Deferred:** none.

**Other modules:** control-plane R22's CHECK_FAMILIES misses accepted-work's C-21 family (J2 REPORT). No generated artifact made stale (basis-versions feeds none of the manifest's bundles).

**Tests:** `node --test bio-plane/test/m/basis-versions/` → 127 pass, 0 fail (new: `imported-legs.test.mjs`, 9 tests naming R3, R5, R6, R29; `versions.test.mjs` R9's leg-field list gains `target_edition` per B3). Users of the changed read (`basisVersions`, the legs table): strength 87/0, contradiction 101/0, run-productions 39/0, skills 49/0, reevaluation 101/0, publication 98/0, project-stage 23/0, ratification 199/0, case-authoring 100/0, review 35/0, affordances 153/0, queue-producers 73/0, plane 65/0, system/migrate-released 1/0, control-plane 138/1 (the J2 failure, not this module's). No layer tests (manifest).

**Checks:** format: 95 modules, 94 requirements files; 0 failures. architecture: 24 product files, 83 relative imports; 0 failures. coverage: 44 of 44 live requirement ids named by a test; 0 failures. ownership: 7 files changed between tranche/T28 and HEAD; 0 failures.

Size (session_01EC1CbcpHTUynmhmiinbKPz): test runs 12, module lines 3594
