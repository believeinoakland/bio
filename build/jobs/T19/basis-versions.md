# basis-versions (T19)

**Status** · session_01JEsrTU8WsdFTZH5jPHiT6F · depth 2 · WORKING · handled B1

## Progress (BASIS-VERSIONS #6)

Done on this branch: the catalogue share copied into the module, and every catalogue import re-pointed except the three leg-grammar names that inquiry-grammar provides.
- `src/basis-versions/checks.mjs` (new) holds:
  - the rows: C-25 (`BASIS_VERSION_CHECKS`, `VERSION_ACT_CHECKS`), C-27.15 (`VERSION_KIND_CHECKS`), C-32.2 and C-33.1/.2/.33–.37 (`CONCLUDE_ACT_CHECKS`), C-50 (`NARROW_CHECKS`);
  - the machine and vocabularies: `VERSION_STATES`, `VERSION_MACHINE`, `VERSION_REASON_REQUIRED`, `versionNeedsReason`, `VERSION_RELATIONSHIPS`, `VERSION_NAME_RE`;
  - `SUGGEST_KINDS`, `BOILERPLATE_FORMS`, `isBoilerplate`;
  - the sufficiency claim: `SUFFICIENCY_UNCLAIMED`, `SUFFICIENCY_CLAIM_STATES`, `sufficiencyClaimState`, `isSufficiencyUnclaimed`.
- `basisVersionFindings` is in `grammar.mjs`.
- Next: R43, after inquiry-grammar merges into `tranche/T19` (K787 (5)). Then `GROUND_LABEL_RE`, `leadLegFindings` and `checkLegExtentGrammar` are read from inquiry-grammar, and the catalogue's deletions are re-scanned.
