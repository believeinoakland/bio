# ratification (T8)

**Status** · session_018gC7F7HKgtN9WEz93FAf9j · depth 2 · WORKING · handled B1

## J1 · QUESTION

Four readings. I am building on each now; only the first decides when I can finish the store half.

1. **Publication, concurrently (sequencing and seam).** `publish`, `ratifyCaseDocument` and `gateFacts` call publication's private helpers, not only its Provides: `#pinnedCaseEditionsOf`, `#soleCase`, `#caseDocMemberFrozen`, `#frozenFromPinningDocuments`, `#caseEditionState`, `#ratifiedFindingsRestingOn`, `#caseClaimsOf`, `#dischargeCaseFlags`, `#publishEdges`, `publishedGraphEdges`, `publishedRegistryFor`/`publishedCaseRegistryFor`, `attributionStatedFor`, `observationsNamingAuthor`. Publication's map §6.1 also says its job "carves the SQL out of `ratifyCaseDocument` and `publish`" — the same methods I remove from `store.mjs`.
   **Best reading:**
   - PUBLICATION writes R22 as new code in its own module and does not edit those two store methods. I remove them and call `publicationOf(host)`.
   - The split follows R22's words. `commitEdition` takes the member-edition half: the rule-12 frozen pair, `EDITION_EXISTS`/`EDITION_NOT_INCREMENTED`, `CASE_ASSERTION_DIVERGED`, the per-case discharge, the bar projection, `published_bundles`/`published_shas`, edges, and the case-edition state it answers. `commitCaseEdition` takes the case rows, the pins and the signature columns.
   - Ratification keeps what decides who may publish: R3's order through `CASE_CONCLUSION_MOVED`, `CASE_PRODUCTION_DIVERGED`, R5's authority and scope arms, and R13's reading of the signed bytes.
   - For R5's scope arms I need two reads from publication: the ratified case editions pinning (id, sha), and the ratified findings resting on an id. Their bodies are `#pinnedCaseEditionsOf` and `#ratifiedFindingsRestingOn`, and neither is named in publication's Provides.
   - Please put those two reads into publication's Provides (R4's neighbourhood), or tell me they are `caseRelation`'s.
   - Please ask BOB-side for an early merge of publication (§4). I write the store half against those names now and test it once publication lands.
2. **Code in legacy-checks that earlier modules import.** legacy-checks cannot import from me (§12.2). Removing these names breaks three importers outside my `from`:
   - `checkCaseDocument`: promotion's free `runCaseGate` default and its instance fallback (`gate.mjs` 35/348, `promotion/index.mjs` 21/279).
   - `SEARCHED_SUBJECT_SOURCES`: ai-runs (`airun.mjs` 92, 205).
   - `SUBJECT_POSITIONS`: affordances (`affordances.mjs` 70, 554).

   **Best reading:**
   - Ratification holds the canonical code (`src/ratification/checks.mjs`) and registers it: the case catalogue through `registerCaseCatalogue`, and `checkPublishedExtension` as a promotion check on `isCaseMemberBytes` bytes.
   - In legacy-checks I remove the rows (C-32.12–.15, C-53.10–.12, C-58, C-65, C-92.10–.12) and the `checkPublishedExtension` call in `checkInquiryExtension` (Decided 2). Nothing outside legacy-store and legacy-index reads the rows by code.
   - I leave legacy-checks' `checkCaseDocument` (with its private `checkPublishedExtension`), `SUBJECT_POSITIONS` and `SEARCHED_SUBJECT_SOURCES` in place, only while promotion, affordances and ai-runs import them. My suite asserts the copies agree, as for `isCaseMemberBytes`.
   - I REPORT the three removals owed: promotion drops the `checkCaseDocument` default and fallback; affordances imports `SUBJECT_POSITIONS` from here; ai-runs' is N138's.
3. **`#caseConclusionRowLines` (the one writer of a `case_conclusions` row).** R1's comparison (`#conclusionRowParsed`) renders what a new edition would record through it. Case-authoring's map gives it to case-authoring, which is later than me, so I cannot import it.
   **Best reading:** it moves here as `caseConclusionRowLines(m, c)` with the frontmatter-safe helper it uses (a copy of `#fmSafe`'s rule, exported as R1's), and `store.mjs`' `#caseDocumentText` is rewired to import it. Please tell CASE-AUTHORING that its `#caseDocumentText` imports it from ratification.
4. **`op=caseratify`'s gate must run on the promotion instance (K233), which lives in the Durable Object, not the Worker.** I add one store-half op, `casegate` (the case document at its `doc_sha`, with `priorCase` and `memberBasis` from the same facts), which the Worker handler calls after the signature verifies, in R2's order. I decide this under P17 unless you say otherwise.
