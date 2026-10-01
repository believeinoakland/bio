# basis-versions (T19)

**Status** · session_01JEsrTU8WsdFTZH5jPHiT6F · depth 2 · WAITING ON BOB (J2) · handled B2

## Progress (BASIS-VERSIONS #6)

Done on this branch: the catalogue share copied into the module, and every catalogue import re-pointed except the three leg-grammar names that inquiry-grammar provides.
- `src/basis-versions/checks.mjs` (new) holds:
  - the rows: C-25 (`BASIS_VERSION_CHECKS`, `VERSION_ACT_CHECKS`), C-27.15 (`VERSION_KIND_CHECKS`), C-32.2 and C-33.1/.2/.33–.37 (`CONCLUDE_ACT_CHECKS`), C-50 (`NARROW_CHECKS`);
  - the machine and vocabularies: `VERSION_STATES`, `VERSION_MACHINE`, `VERSION_REASON_REQUIRED`, `versionNeedsReason`, `VERSION_RELATIONSHIPS`, `VERSION_NAME_RE`;
  - `SUGGEST_KINDS`, `BOILERPLATE_FORMS`, `isBoilerplate`;
  - the sufficiency claim: `SUFFICIENCY_UNCLAIMED`, `SUFFICIENCY_CLAIM_STATES`, `sufficiencyClaimState`, `isSufficiencyUnclaimed`.
- `basisVersionFindings` is in `grammar.mjs`.
- Next: R43, after inquiry-grammar merges into `tranche/T19` (K787 (5)). Then `GROUND_LABEL_RE`, `leadLegFindings` and `checkLegExtentGrammar` are read from inquiry-grammar, and the catalogue's deletions are re-scanned.

## J1 · REPORT

Found in other modules while making the catalogue share my own (record and branch `job/T19/basis-versions` @ 9e603654a2):
1. **control-plane (L11)** `src/control-plane/families.mjs`: `CHECK_FAMILY_FILES` does not list `src/basis-versions/checks.mjs`. My C-25, C-27.15, C-32.2/C-33 and C-50 rows reach `dec49Row` and `CHECK_FAMILIES` only through the catalogue's copies. Before those copies are deleted, control-plane adds `["src/basis-versions/checks.mjs", …]`. Until then nothing breaks. Meanwhile my conclusion refusals now carry their own `code`, `check` and `translation` at the site (additive), as the six acts and narrow already did.
2. **The catalogue's copies stay, held twice under rule 1:** I delete none in this job. The catalogue's own `checkInquiryBasis` (:1000) still calls its `basisVersionFindings`, which reads every C-25 row, `VERSION_*`, `SUGGEST_KINDS`, `SUGGEST_CHECKS` and the sufficiency predicates. The L6 importers that re-point after my merge also still read them: run-productions (`SUGGEST_KINDS`, `isBoilerplate`, `SUFFICIENCY_UNCLAIMED`), skills (`skilldoctrine.mjs`: `BASIS_VERSION_CHECKS`, `isBoilerplate`), strength (`checks.mjs`: `VERSION_STATES`) and agent-worker's tests. Each of these can now read the name from `src/basis-versions/index.mjs`. I re-scan after inquiry-grammar merges.
3. **Measured, not committed** (a scratch sweep; no test of mine imports the catalogue): 54 rows equal to the catalogue's (only the grammar rows' `where`, now naming `src/basis-versions/grammar.mjs basisVersionFindings`, awaiting the stamp), 95 predicate and vocabulary comparisons equal, and `basisVersionFindings` identical to the catalogue's over 40,000 generated documents (77,181 findings).

## J2 · QUESTION

Everything but R43 is done: module 110/110; format 0, architecture 0, ownership 0; coverage fails on R43 alone. R43 needs inquiry-grammar's R6 sub-slot and its `GROUND_LABEL_RE`, `leadLegFindings` and `checkLegExtentGrammar`, which I read from the catalogue until then. My reading of K787 (5): I merge `tranche/T19` once inquiry-grammar has merged, then build R43 and complete. Please send a CHANGE when inquiry-grammar is on `tranche/T19`. Until then I wait; nothing for Bob to do.
