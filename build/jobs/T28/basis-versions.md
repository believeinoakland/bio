# basis-versions (T28)

**Status** · session_01EC1CbcpHTUynmhmiinbKPz · depth 2 · WAITING ON BOB (J1) · handled B5

## J1 · QUESTION

R3 (N522), my readings; I am building on them now and need only the export names confirmed before I merge.

1. **Imports I will take** (neither job has pushed code yet): from `../inquiry-grammar/index.mjs` `IMPORTED_FINDING_RE` and the R11 leg-form arm, which I assume is exported as `importedLegFindings(label, leg, check, findings)` answering findings in the `checkLegExtentGrammar` shape; from `../accepted-work/index.mjs` `acceptedLegRefusals({legs, viewer})` as a pure-looking call that reads the per-host registration. If accepted-work exposes it only on an instance (`acceptedWorkOf(host)`), I take it through my factory's `deps.acceptedWork` the way I take `inquiry`. Please ask both jobs for the exact names/shapes, or tell me to read their branches when pushed.
2. **Grammar.** A version leg whose target matches `IMPORTED_FINDING_RE` skips the canonical-id/type arm (C-25.10/C-25.14), the grade-vocabulary arm and `checkLegExtentGrammar`, and runs inquiry-grammar's R11 arm instead (its findings come back C-21.3); role and ground arms unchanged.
3. **Freeze.** `target_edition` defines a ref leg, so the composition gains `leg_edition\t<k>\t<edition>` lines after the `leg_capture` lines, only when a leg carries one (every held composition stays byte-identical; R5, R6, R29). Without it a version could change edition in place without `VERSION_FROZEN`.
4. **Which legs are asked.** In my promotion check (R6), after the freeze arm: only versions not already held (a held version is frozen; a changed one is refused `VERSION_FROZEN` first), and within them each ref leg with no leg of the same target and `target_edition` in its `derived_from` version. Refused `BASIS_VERSION_REFUSED` with accepted-work R3's findings (detail naming the version). `viewer` is the promotion's `author` (the ctx carries no viewer); accepted-work's own R4 has the same question.
5. **C-25.16.** A ref leg is not looked up in `bundles` (it is not a bundle); its existence is accepted-work's (C-21.4).
6. **Writers.** `versionAsWritten` and `appendVersion`/`narrow` carry `target_edition` through and write no `extent_kind` on a ref leg (R11 forbids an extent). `narrow` on a ref leg answers `NARROW_NO_PART` (no content row).
7. **Overlap check.** Does accepted-work's R4 step also walk `basis_version_legs`? My reading: no, it asks `basis[]` only, and the versions are mine (R3). If it does both, one of us drops it.
