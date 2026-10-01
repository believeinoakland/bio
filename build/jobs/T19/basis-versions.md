# basis-versions (T19)

**Status** · session_01JEsrTU8WsdFTZH5jPHiT6F · depth 2 · COMPLETE · handled B3

## Completion (BASIS-VERSIONS #6)

**Entries applied** (`build/plan/current.md` L6 basis-versions, kept; `draft-T19.md` L6; B1, B3):
- **The catalogue share is the module's own.** `src/basis-versions/checks.mjs` (new) holds the catalogue's text unchanged, with its comments:
  - the rows: C-25 (`BASIS_VERSION_CHECKS`, `VERSION_ACT_CHECKS`), C-27.15 (`VERSION_KIND_CHECKS`), C-32.2 and C-33.1/.2/.33–.37 (`CONCLUDE_ACT_CHECKS`), C-50 (`NARROW_CHECKS`);
  - the machine and vocabularies: `VERSION_STATES`, `VERSION_MACHINE`, `VERSION_REASON_REQUIRED`, `versionNeedsReason`, `VERSION_RELATIONSHIPS`, `VERSION_NAME_RE`;
  - `SUGGEST_KINDS`, `BOILERPLATE_FORMS`, `isBoilerplate`;
  - the sufficiency claim: `SUFFICIENCY_UNCLAIMED`, `SUFFICIENCY_CLAIM_STATES`, `sufficiencyClaimState`, `isSufficiencyUnclaimed`.

  `basisVersionFindings` is in `grammar.mjs`. Only its C-27.15 table changed (`SUGGEST_CHECKS` → `VERSION_KIND_CHECKS`). All of it is re-exported from `index.mjs`.
- **Re-points (rule 1):**
  - `grammar.mjs`: `normalizeType`, `OBJECT_TYPES`, `isMachineIdentity` and the id and grade vocabularies come from record-grammar, `legExtent` from content (R48), `canonicalExtent` from text-chain, `themeLegFindings` from connections, and `GROUND_LABEL_RE`, `leadLegFindings`, `checkLegExtentGrammar` from inquiry-grammar.
  - `index.mjs`: the record-grammar names come from record-grammar, `CONTENT_EXTENT_CHECKS` from content (K801), and `isBoilerplate` and C-27.15 from this module's own tables. `checkLegExtentGrammar` (the narrow act, :1485) comes from inquiry-grammar.
  - The tests (`conclude`, `grammar`, `sufficiency-state`, `versions`) read this module's tables and record-grammar's `actors.mjs`/`frontmatter.mjs`.
  - **No file of this module, product or test, imports `bio-checks.mjs`.**
- **R43:** `BASIS_VERSION_GRAMMAR` (`{ids: ["C-2.8"], arm}`), registered by `registerBasisVersionGrammar(record)` from `basisVersionsOf`'s creation.
  - It registers inquiry-grammar's grammar first; that registration is idempotent. Module order is registration order whoever reaches it first.
  - It runs at inquiry-grammar's `rest()` sub-slot, for an inquiry only. A record with no seam is left alone; a refusal throws.
- **The rows' `where`s.** The C-25 and C-27.15 rows the grammar raises now name `src/basis-versions/grammar.mjs basisVersionFindings` (awaiting promotion's stamp). Every other `where` is unchanged.
- **Improvement (mine):** the conclusion's refusals (C-32.2, C-33.x) now carry their own `code`, `check` and `translation` at the site, as the six acts and narrow already did. This is additive (R16, R17, R20, R21 unchanged). They then stay translated when the catalogue's copies go, whether or not control-plane lists this module's file.

**Catalogue deletions: none, re-scanned at HEAD after inquiry-grammar's merge (K817).**
- The catalogue's `checkInquiryBasis` still calls its `basisVersionFindings` (:701). `inquiry/grammar.mjs` (L6, not yet merged) imports that `checkInquiryBasis`, so every name `basisVersionFindings` reads stays: the C-25 rows, the `VERSION_*` names, `SUGGEST_KINDS`, `SUGGEST_CHECKS` and the sufficiency predicates. K814's `SUGGEST_CHECKS` goes with it.
- These importers also still read the catalogue's copies:
  - run-productions: `SUGGEST_KINDS`, `isBoilerplate`, `SUFFICIENCY_UNCLAIMED`, `SUGGEST_CHECKS`;
  - skills (`skilldoctrine.mjs`): `BASIS_VERSION_CHECKS`, `isBoilerplate`, `SUGGEST_CHECKS`;
  - strength: `VERSION_STATES` in `checks.mjs`;
  - reevaluation: `VERSION_NAME_RE`;
  - affordances: `VERSION_MACHINE`, `VERSION_REASON_REQUIRED`, `versionNeedsReason`, `SUFFICIENCY_CLAIM_STATES`, `sufficiencyClaimState`;
  - legacy-checks' own `catalogue.test.mjs`.
- By rule 1 each copy is deleted by its last importer's job.

**Measured, not committed** (a scratch sweep; no test of mine imports the catalogue): 54 rows equal to the catalogue's (the grammar rows' `where` aside), 95 predicate and vocabulary comparisons equal, and `basisVersionFindings` identical to the catalogue's over 40,000 generated documents (77,181 findings).

**Rs met, with their tests (for BOB to strike):**
- R43: `registration.test.mjs`, five "R43: …" tests. For every bundle of inquiry-grammar's corpus under every registry variant, `checkBundle` with `record.grammars()` answers the catalogue's pre-move golden findings, in content and order, with the real version grammar. A negative control (no R43) differs.
- R35 (still met, now over this module's own rows): `grammar.test.mjs` "R35: …".
- R3: `sufficiency-state.test.mjs` gains the classifier's four states (the sufficiency claim made this module's own).

**Deferred:** nothing.

**Found in other modules (REPORT):**
1. **control-plane (L11), `families.mjs`:** `CHECK_FAMILY_FILES` must list `src/basis-versions/checks.mjs` before the catalogue's C-25, C-27.15 and C-50 copies go (J1; carried to control-plane's START, B2).
2. **inquiry (L6):** its three `checkInquiryBasis` callers (`index.mjs` :331, :1533, :1973) get the version findings today only through the catalogue's call to `basisVersionFindings`. Once they re-point to inquiry-grammar's `checkInquiryBasis`, which no longer calls it, they must call `basisVersionFindings` (this module's export) beside it if their answers are to stay unchanged (P1; inquiry-grammar R4 says so).
3. **Importers that can re-point to this module now:** run-productions, skills, strength, reevaluation, affordances (names above). The last importer of each name deletes the catalogue's copy.

**Tests and checks:**
- basis-versions 115/115.
- Modules that use it:
  - unchanged and green: inquiry-grammar 23/23, strength 69/69, contradiction 101/101, run-productions 36/36, skills 39/39, reevaluation 73/73, project-stage 23/23, review 33/33, affordances 123/123, agent-worker 8/8;
  - red, but red identically on `tranche/T19` without this branch (the same 134 failing test names): publication 71 pass/19 fail, ratification 87/81, case-authoring 78/1, queue-producers 14/32.
- Checks: `format.mjs` 0 failures; `architecture.mjs` 0 failures (21 product files, 67 imports); `coverage.mjs` 43 of 43 live ids named, 0 failures; `ownership.mjs` 0 failures (legacy-store and legacy-checks 0 lines).

Size (session_01JEsrTU8WsdFTZH5jPHiT6F): test runs 24, module lines 3488

## J1 · REPORT

Found in other modules while making the catalogue share my own (record and branch `job/T19/basis-versions` @ 9e603654a2):
1. **control-plane (L11)** `src/control-plane/families.mjs`: `CHECK_FAMILY_FILES` does not list `src/basis-versions/checks.mjs`. My C-25, C-27.15, C-32.2/C-33 and C-50 rows reach `dec49Row` and `CHECK_FAMILIES` only through the catalogue's copies. Before those copies are deleted, control-plane adds `["src/basis-versions/checks.mjs", …]`. Until then nothing breaks. Meanwhile my conclusion refusals now carry their own `code`, `check` and `translation` at the site (additive), as the six acts and narrow already did.
2. **The catalogue's copies stay, held twice under rule 1:** I delete none in this job. The catalogue's own `checkInquiryBasis` (:1000) still calls its `basisVersionFindings`, which reads every C-25 row, `VERSION_*`, `SUGGEST_KINDS`, `SUGGEST_CHECKS` and the sufficiency predicates. The L6 importers that re-point after my merge also still read them: run-productions (`SUGGEST_KINDS`, `isBoilerplate`, `SUFFICIENCY_UNCLAIMED`), skills (`skilldoctrine.mjs`: `BASIS_VERSION_CHECKS`, `isBoilerplate`), strength (`checks.mjs`: `VERSION_STATES`) and agent-worker's tests. Each of these can now read the name from `src/basis-versions/index.mjs`. I re-scan after inquiry-grammar merges.
3. **Measured, not committed** (a scratch sweep; no test of mine imports the catalogue): 54 rows equal to the catalogue's (only the grammar rows' `where`, now naming `src/basis-versions/grammar.mjs basisVersionFindings`, awaiting the stamp), 95 predicate and vocabulary comparisons equal, and `basisVersionFindings` identical to the catalogue's over 40,000 generated documents (77,181 findings).

## J2 · QUESTION

Everything but R43 is done: module 110/110; format 0, architecture 0, ownership 0; coverage fails on R43 alone. R43 needs inquiry-grammar's R6 sub-slot and its `GROUND_LABEL_RE`, `leadLegFindings` and `checkLegExtentGrammar`, which I read from the catalogue until then. My reading of K787 (5): I merge `tranche/T19` once inquiry-grammar has merged, then build R43 and complete. Please send a CHANGE when inquiry-grammar is on `tranche/T19`. Until then I wait; nothing for Bob to do.

## J3 · COMPLETE

COMPLETE on `job/T19/basis-versions` @ 404e5d71d5, with `tranche/T19` merged at K817. The full report is in my record, under "Completion".
- **R43 met:** `registration.test.mjs` (five "R43: …" tests). For every bundle of inquiry-grammar's corpus under every registry variant, the real version grammar registered after inquiry-grammar's gives the catalogue's pre-move golden findings, in content and order. A negative control differs.
- **No file of mine imports the catalogue.** The leg grammar comes from inquiry-grammar.
- **Catalogue deletions: none.** The catalogue's `checkInquiryBasis` still calls its `basisVersionFindings`, and inquiry (not yet merged) imports that `checkInquiryBasis`. run-productions, skills, strength, reevaluation and affordances still import the moved names, so `SUGGEST_CHECKS` stays too (K814).
- **New REPORT:** inquiry's three `checkInquiryBasis` callers (:331, :1533, :1973) must call `basisVersionFindings` beside inquiry-grammar's `checkInquiryBasis` when they re-point, or they lose the version findings (P1).
- **Tests:** mine 115/115. The users of this module are green, except publication, ratification, case-authoring and queue-producers, which fail identically on `tranche/T19` (the same 134 failing test names).
- **Checks:** format 0, architecture 0, coverage 43/43, ownership 0.
