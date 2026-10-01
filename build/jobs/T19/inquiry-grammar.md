# inquiry-grammar (T19)

**Status** · session_01TX5AkxzGdEht5xNHpYg8od · depth 2 · COMPLETE · handled B2

## Completion (INQUIRY-GRAMMAR #1)

**Entries applied** (`build/plan/current.md` layer 6, K766; B1, B2 = K812):
- New module `bio-plane/src/inquiry-grammar/`. `grammar.mjs` is the catalogue's text moved line for line: `checkInquiryExtension`, `checkDividedExtension`, `checkRecheckCoverage`, `checkInquiryBasis` (minus its `basisVersionFindings` call, R4), `checkGrounds`, `checkTestimonyLeg`, `checkEarnedLeg`, `checkInheritedLeg`, `checkLegExtentGrammar`, `supersedesEdgeFindings`, `divisionDisclosureFindings`, `leadLegFindings`, `ENTITY_ID_RE`, `DATE_RE`, `EARNED_SOURCE_AXIS`, `GROUND_LABEL_RE`. Imports come from the module's own Uses only:
  - record-grammar for the vocabularies;
  - content's `extent-core.mjs` (its R48 copy, unchanged);
  - text-chain's `CONTENT_EXTENT_KINDS`;
  - connections' `themeLegFindings`;
  - observation-log's `LEAD_ID_RE`.
  No import from `bio-checks.mjs`, in the module or its tests. `checks.mjs` holds `LEAD_CHECKS` and `INQUIRY_GRAMMAR_ROWS` (R7).
- `index.mjs` (R6) exports:
  - `INQUIRY_GRAMMAR` (`ids` C-6.1, C-15.1, C-2.8, the arm dispatching on `{slot, rest}`);
  - `INQUIRY_GRAMMARS` (one entry per slot, for direct `checkBundle` callers);
  - `checkSupersession`;
  - `registerInquiryGrammar(record)` (once per record; a refusal throws).
  The C-2.8 arm runs `rest()` for an inquiry only, after the entry, case-field, division and subject-entity findings and before the leg grammar.
- Catalogue (legacy-checks): the three `LEGACY_GRAMMARS` entries removed, and with them `checkInquiryExtension`, `checkDividedExtension`, `checkRecheckCoverage` and `ENTITY_ID_RE`, which had no other reader (net 4 comment lines added, 308 removed). Every other moved name keeps its catalogue copy (K812 (5)).
- `store.mjs` (legacy-store, K812 (3a)): one import and `registerInquiryGrammar(recordOf(ctx))` before `basisVersionsOf`. Ownership lists these 2 lines; the net over both legacy modules is a removal.

**Requirements met, each with its test** (`bio-plane/test/m/inquiry-grammar/`):
- R1, R2, R3: `grammar.test.mjs`, the corpus parity test, the negative control and the three by-hand tests.
- R4: `grammar.test.mjs`, leg grammar parity (50 cases × 3 registry variants, plus grounds), `checkLegExtentGrammar` parity under C-2.8 and C-25.10, C-6.1 parity, by-hand controls, `GROUND_LABEL_RE` and `EARNED_SOURCE_AXIS`.
- R5: `grammar.test.mjs`, the lead checker parity and by hand. `LEAD_CHECKS` is exactly `{LEAD_NOT_EVIDENCE: C-54.1}`, and observation-log keeps C-54.2–.10. This is observation-log's `vocabulary.test.mjs` arm and its `lead.test.mjs` arm (K806).
- R6: `registration.test.mjs`. record-core answers `{ok: true}`. `checkBundle` with `record.grammars()` gives the catalogue's findings for all 36 bundles × 3 variants, the version findings at the sub-slot included. Also tested: registration order, the sub-slot's place, and a refusal.
- R7, R8, R9, R10: `grammar.test.mjs`.

**Parity basis.** `golden.json` was recorded from the catalogue on this branch before any catalogue edit (corpus header says how).

**Awaiting stamp.** `LEAD_NOT_EVIDENCE`'s `where` is now `src/inquiry-grammar/grammar.mjs leadLegFindings > is-lead-not-evidence`.

**Product callers of the catalogue's `checkBundle` wrapper that pass no grammars, at HEAD:**
- `src/inquiry/grammar.mjs` `checkInquiryEntry`, when called without `opts.grammars`. Its one product caller, `inquiry/index.mjs`:693, always passes `record.grammars()`.
- No other product file calls the wrapper. `gate.mjs` calls record-grammar's own `checkBundle` with `record.grammars()`.

**Found in other modules** (each is the owner's to fix):
- **inquiry (L6, stage two):** re-point `inquiry/grammar.mjs` to this module (R4's `===` re-exports, `INQUIRY_ROWS` from `INQUIRY_GRAMMAR_ROWS`, `checkInquiryEntry` passing `INQUIRY_GRAMMARS` when it is given none). Seven inquiry tests go red at my HEAD until then:
  - `case-grammar.test.mjs` (two);
  - `grammar.test.mjs` (two: R2 entry, R3 divided);
  - `facts.test.mjs` (the entry grammar with the registered grammars);
  - `lifecycle-reads.test.mjs`;
  - `testimony-inherited.test.mjs` (R7 inheritance).
  Each calls the wrapper with no grammar for C-2.8.
- **legacy-checks:** `test/m/legacy-checks/catalogue.test.mjs`' "rule 2 the wrapper answers exactly record-grammar's checkBundle given LEGACY_GRAMMARS" goes red (it expects the five-entry list).
- **control-plane (L11):** `MODULE_CHECK_FILES` / `CHECK_FAMILY_FILES` should list `src/inquiry-grammar/checks.mjs`, so that C-54.1's row with its new `where` reaches the DEC-49 guard and `dec49Row` once the catalogue's copy goes.
- **basis-versions (stage two):** register R43 after this module (store order is now `registerInquiryGrammar`, then `basisVersionsOf`). Read `GROUND_LABEL_RE`, `leadLegFindings` and `checkLegExtentGrammar` from here.
- **The bio-plane bundle** is stale (new source, `store.mjs` changed); regenerated at the close (§14).

**Deferred.** None of this module's own work is deferred. The catalogue's remaining copies (`checkInquiryBasis` and its helpers, `supersedesEdgeFindings`, `divisionDisclosureFindings`, `GROUND_LABEL_RE`, `EARNED_SOURCE_AXIS`, the rows; K766's four) go when their last importers re-point (rule 1).

**Tests and checks:**
- Module: `node --test test/m/inquiry-grammar/`: 23 pass, 0 fail.
- `test/m/` whole at HEAD: 4,491 tests, 222 fail. At `tranche/T19` base: 4,457 tests, 217 fail. New at HEAD: exactly the 8 above. Red only at base: 3, extraction load flakes that pass alone (13/13).
- Layer tests: none named.
- `format`: 0 failures.
- `architecture inquiry-grammar`: 0 failures. `architecture legacy-store legacy-checks`: 0 failures.
- `coverage inquiry-grammar`: 10 of 10, 0 failures.
- `ownership inquiry-grammar tranche/T19`: 0 failures. legacy-checks: 4 lines added, 308 removed. legacy-store: 2 lines added.

Size (session_01TX5AkxzGdEht5xNHpYg8od): test runs 9, module lines 1440

## J1 · QUESTION

R6's registration needs a caller at start, and the caller's file is not mine. My best reading, which I am building on now:

1. The module exports `INQUIRY_GRAMMAR` (`{ids: ["C-6.1", "C-15.1", "C-2.8"], arm}`, the arm dispatching on record-core's `{slot, rest}`), `registerInquiryGrammar(record)` (once per record, a refusal throws, promotion's `registerInfo2Grammar` pattern), and `INQUIRY_GRAMMARS`, one `{module, ids, arm}` per slot for a caller passing grammars to record-grammar's `checkBundle` directly (K787 (2); `grammarsOf` refuses one entry claiming three slots). `ids` are the three slots' ids only, as the catalogue's `LEGACY_GRAMMARS` entries were: listing C-6.3, C-21.2, C-54.1 or C-81.1 too would claim non-slot ids and refuse basis-versions' R43 registration (its version legs raise C-54.1 and C-81.1).
2. The C-2.8 arm runs `rest()` (the sub-slot) for an inquiry only, after the entry, case-field, division and subject-entity findings and before `checkInquiryBasis`, which no longer calls `basisVersionFindings` (R4).
3. The call `registerInquiryGrammar(recordOf(ctx))` belongs in the composition root, `store.mjs`' constructor, before `basisVersionsOf(ctx, …)` (so mine precedes basis-versions' R43 in module order, K775 (2)). `store.mjs` is legacy-store's; my `from` is only legacy-checks. Removing the three `LEGACY_GRAMMARS` entries (R6) without that line leaves the store's record with no C-6.1, C-15.1 or C-2.8 grammar from my merge on.
   Options: (a) I add that line (one import from my paths and the call) to `store.mjs`; ownership lists it; you accept it by ruling. (b) basis-versions' job (legacy-store in its `from`) adds it, and until then the store runs none of the three (red). (c) I keep the three entries, re-pointed at my exports, until (b). **I recommend (a).**
4. The catalogue's own `checkBundle` wrapper (callers passing no grammars: inquiry's `checkInquiryEntry` without `o.grammars`, old suites, tests not yet re-pointed) would, with the entries gone, stop running the three slots. My reading: the wrapper fills the slots its caller leaves unclaimed with my `INQUIRY_GRAMMARS`, the C-2.8 one given the catalogue's own `basisVersionFindings` as its `rest` (catalogue lines that use names imported from my paths, §12.2), so every wrapper caller's findings stay identical; `LEGACY_GRAMMARS` itself fills neither slot. basis-versions drops that `rest` when it takes the version grammar.
5. Deletions now (rule 1, confirmed over the repository): the catalogue's `checkInquiryExtension`, `checkDividedExtension`, `checkRecheckCoverage` (no importer once the entries go), and `ENTITY_ID_RE` if nothing else reads it. Every other moved name keeps its catalogue copy: `checkInquiryBasis`, `supersedesEdgeFindings`, `divisionDisclosureFindings`, `GROUND_LABEL_RE`, `EARNED_SOURCE_AXIS` and the rows are still imported by later L6 modules (inquiry's `grammar.mjs`, basis-versions, citation) and old suites, and the catalogue's `checkInquiryBasis` still calls `basisVersionFindings` for its callers (promote's path); K766's four stay for `actionBasisFindings`. Whoever re-points last deletes them.
6. `inquiry/grammar.mjs`'s re-point to this module (R4's `===` re-exports) is inquiry's file, so it is inquiry's job (L6, after me), not mine.

## J2 · COMPLETE

Done; the record's Completion section has the detail (job/T19/inquiry-grammar @ 4915f37471). Met, each with its test under test/m/inquiry-grammar/: R1, R2, R3, R4, R5, R7, R8, R9, R10 (grammar.test.mjs); R6 (registration.test.mjs). Module 23/23. Checks: format, architecture, coverage (10/10) and ownership all 0 failures; ownership lists legacy-checks +4 comment lines/-308 and legacy-store +2 (the K812 import and call before basisVersionsOf). Product callers of the catalogue wrapper with no grammars at HEAD: only inquiry/grammar.mjs checkInquiryEntry without opts.grammars (its one product caller, inquiry/index.mjs:693, passes record.grammars()). New reds in test/m at HEAD vs tranche/T19: 8. Seven are inquiry's (its stage two); one is legacy-checks' catalogue.test.mjs rule-2 wrapper arm. LEAD_NOT_EVIDENCE where is awaiting stamp. Reports in the record: control-plane MODULE_CHECK_FILES/CHECK_FAMILY_FILES need src/inquiry-grammar/checks.mjs; the bio-plane bundle is stale.
