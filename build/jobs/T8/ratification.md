# ratification (T8)

**Status** · session_018gC7F7HKgtN9WEz93FAf9j · depth 2 · WORKING · handled B3

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

## J2 · QUESTION

Replaces J1. Items 2–4 are J1's, unchanged. Item 1 now names exactly what I need from publication.

1. **Publication, concurrently (the seam and the sequence).** `publish`, `ratifyCaseDocument`, `gateFacts` and R1's comparison read and write publication's tables through its private helpers. Publication's map §6.1 also has its job "carve the SQL out of" the two store methods I remove.
   **Best reading:**
   - PUBLICATION writes R21/R22 as new code in its module and leaves those store methods to me. I remove them and call `publicationOf(host)`.
   - I build now against the names below and test once BOB merges publication early (§4).
   - The ones marked *new* are not in publication's Provides today. Please have them stated there, or tell me which existing service covers each.

   Reads:
   - (a) `caseDocumentFacts` (R2), as it stands.
   - (b) *new* `caseDocumentRow(case, edition)`: the in-process, unfenced row `{doc_sha, text, sig_armored, attestor_key, ratified_at}` or null. R3 reads the bytes it commits from it, and R1 reads the recorded conclusion rows from it (`#editionsRecordingConclusion` reads `case_documents.text` today).
   - (c) *new* `caseOwner(case)`: the `cases.project_id`, or null. Used by R3's `CASE_PRODUCTION_DIVERGED` and by R5's authority per owning project.
   - (d) *new* `pinnedCaseEditionsOf(id, sha)`: the ratified case editions pinning those bytes, the newest edition per case, as `{case_id, edition, role}` (today's `#pinnedCaseEditionsOf`). Used by R5's first arm and by C-58.2.
   - (e) *new* `ratifiedFindingsRestingOn(id)`: `[{case_id, finding, project}]` (today's `#ratifiedFindingsRestingOn`). Used by C-58.3.
   - (f) *new* `caseClaimsOf(id)`: the cases a finding is pinned or prepared into (today's `#caseClaimsOf`). R7 reads `publishedCaseRegistryFor(caseClaimsOf(id))`.
   - (g) `publishedRegistryFor`, `publishedCaseRegistryFor` (R7), `attributionStatedFor` and `observationsNamingAuthor` (R17), and `publishedGraphEdges(fm)` (the static the Worker builds edges with), all as they stand.

   Writes:
   - (h) `commitCaseEdition({case, edition, project, scope, completeness, biasAcknowledgement, bar, roster: [{bundle_id, role, version_sha}], sigArmored, attestorKey, attestorMember, gateVersion, deliveredBy, at})` inside my transaction.
     - It answers `existed` or `CASE_EDITION_ALREADY_RATIFIED` as R22 says.
     - It also answers `awaiting` (the roster members not yet published at their pins) and the case edition's state for the container (today's `#caseEditionState`).
     - Ratification computes `completeness` from the signed bytes (R13, `completenessFields`) and calls `dischargeCaseFlags` itself (R3).
   - (i) `commitEdition({bundleId, bundleSha, edition?, title, completeness, strength, memberCarriesBlocks, group, edges, shas, attestorKey, attestorMember, gateVersion, sigArmored, deliveredBy, at})` inside my transaction, taking everything in today's `publish` after the authority and scope arms:
     - the rule-12 frozen pair, `EDITION_EXISTS` and `EDITION_NOT_INCREMENTED`;
     - `CASE_ASSERTION_DIVERGED`, the per-case discharge and the bar projection;
     - `published_bundles`, `published_shas` and the edges (R35 included);
     - the answer fields `op=ratify` forwards today: `edition`, `existed`, `ratifiedAt`, `edges`, `caseCount`, `barUndetermined`, `frozenFrom`, `strengthUndetermined`, `caseId`/`caseEdition`/`case`, `containerCases`.
   - Ratification keeps what decides who may publish: R3's refusals through `CASE_PRODUCTION_DIVERGED`, and R5's authority and scope arms (C-58.2, C-58.3).
2. As J1 item 2: legacy-checks keeps `checkCaseDocument` (and its private `checkPublishedExtension`), `SUBJECT_POSITIONS` and `SEARCHED_SUBJECT_SOURCES` only while promotion, affordances and ai-runs import them.
   - Ratification holds and registers the canonical code, and the rows move.
   - C-2.8's case-member arm leaves `checkInquiryExtension`. It is registered with promotion (a step check, replays exempt) and with record-core's audit (R59), and `op=ratify` runs it over the image after the catalogue, as it does bias's and the register's. So neither the gate nor the audit loses it.
   - I REPORT the three removals owed.
3. As J1 item 3: `caseConclusionRowLines` moves here with R1, and `#caseDocumentText` imports it. Please tell CASE-AUTHORING.
4. As J1 item 4: the store-half op `casegate` runs `promotionOf(host).runCaseGate` (K233) over the document at the signed `doc_sha`.
