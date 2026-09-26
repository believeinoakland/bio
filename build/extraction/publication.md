<!-- The publication survey, split three ways from the publication map for BOB #43 on 2026-09-26 on tranche/T3 (K94); superseded where it disagrees with build/requirements/publication.md. -->
# publication — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`bio-plane/` unchanged at `03e2481`; `store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682, `index.mjs` 13,438) by a drafting worker for BOB #43 (P18), split from the publication map's [P] rows (K94). A method's range runs from the comment block above it to its closing brace; the extraction job confirms each. "Code" counts lines left after removing comment-only and blank lines (dispatch entries counted whole). The contract is `build/requirements/publication.md` (R1–R34); K3, K4, K6, K23, K31, K57, K61, K78 (2), K83 (3), K94 and N16 apply. The module exports `publicationOf(ctx)` (K61); `legacy-store` delegates to it. **`from`: `["legacy-store", "legacy-checks", "legacy-index"]`.** It is first of the three; `ratification` and `case-authoring` use it, and it uses neither.

## 1. What moves

### store.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `CASE_FLAGS_LIMIT` (with its comment) | 3244 | 1 | R6 |
| `#caseRelationOf`, `#caseClaimInBytes`, `#flagCasesOnRevision`, `#dischargeCaseFlags`, `caseFlags` | 4868–5197 | 100 | R4–R6 |
| `caseDocumentFacts`, `#pinnedMemberBasis`, `#projectCaseExclusions`, `#caseDocMemberFrozen`, `#noCaseDocument`, `#hasCaseStanding`, `caseDocument`, `#signedCitations` | 10036–10106, 10117–10310 | 120 | R1–R3, R21's projection; `#memberTextAtSha` (10107–10116) is `record-core`'s `textAtSha` |
| `ATTRIBUTION_LEVELS`, `observationsNamingAuthor`, `#attributionInForce`, `#observationsReachedBy`, `#attributionStatements`, `ATTRIBUTION_PROSE_HEAD`, `#attributionFrontmatterLines`, `#attributionBodyLines`, `#reauthorAttributions`, `attributionFacts`, `attributionStatedFor`, `attributeObservation` | 20684–20945 | 191 | R17; `#observedMs` (20947) stays (its caller, 21125, is not this module's) |
| `EXPORT_LOG_LIMIT_DEFAULT`, `EXPORT_LOG_LIMIT_MAX` | 27584–27586 | 3 | R19 |
| `exportManifest`, `exportLog`, `publishedManifest` | 33516–33755 | 102 | R11, R18, R19 (N16) |
| `#frozenFromPinningDocuments`, `#frozenPairsByCase`, `#caseEditionState`, `recordCaseManifest`, `#publishEdges`, `verifySha`, `publishedList`, `publishedEditions`, `publishedCase`, `#deliveredBy`, `#looseEditionState`, `#caseClaimsOf`, `#casesOf`, `#soleCase`, `#resolveOneCase`, `publishedGraphEdges`, `#ratifiedFindingsRestingOn`, `#pinnedCaseEditionsOf`, `#casesOfSha`, `publishedTargets` | 34420–35551 | 458 | R7–R12, R15; `#publishEdges` and the inserts `ratification` makes today become R22 |
| `excludedBy`, `publishedRegistryFor`, `publishedCaseRegistryFor` | 35775–35907 | 68 | R7, R12 |
| the `case_documents` insert and the two conditional re-author updates, taken out of `publishCase` (9131–9138), `#reauthorAcknowledgements` (11558) and `#reauthorAttributions` (20820) | about 20 | — | R21 (the SQL moves here; the text builders stay with their callers) |
| the commit writes taken out of `ratifyCaseDocument` (12055–12140: `cases`, `published_cases`, `published_case_members`, the signature on `case_documents`) and `publish` (34315–34340: `published_bundles`, `published_shas`; edges through `#publishEdges`) | about 60 | — | R22 (the SQL moves here; the decisions stay in `ratification`) |
| dispatch `caseflags` (48595–48602), `attribute` (49158–49168), `publishededitions`, `publishedcase`, `recordcasemanifest`, `publishedtargets`, `excludedby`, `export`, `exportlog`, `publishedmanifest` (49715–49742), `casedocfacts`, `casedocument` (49758–49764), `verify`, `publishedlist` (49795–49796) | about 67 | 67 | K3; the `PROJECT_NAMING_READS` rows (33210–33243) stay with the dispatcher |
| migrations: `published_bundles` re-key (954–967), copy-forward (1465–1473); `published_case_members.version_sha`, `.role`, `published_cases.bar` (1186–1219); `delivered_by` columns (1303–1314); `case_documents.draft_id` (1348–1352); `export_log` (1655–1674) | 94 | 31 | with the tables |

Store: 2,366 lines in ranges (1,043 code) plus about 160 of dispatch and migrations.

### index.mjs (the Worker half; K3)

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `publishedStoreAbsent`, `publishedReadRow`, `noPublishedPart`, `publishedObjectMissing` | 4474–4530 | 22 | R13 (C-68.5, C-98.1, C-98.2) |
| `assembleCaseContainer` | 5805–6071 | 96 | R15 |
| `op=publishedcase` / `op=publishedbytes` block | 6447–6743 | 158 | R10, R13 |

Index: 621 lines (276 code).

### Owned files

`container.mjs` (195 lines, 98 code), `inband.mjs` (68, 38), `deliverer.mjs` (55, 17): already this module's paths (R14–R16).

### bio-checks.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `CASE_DOCUMENT_FORMAT` … `CASE_DOCUMENT_FORMATS_ACCEPTED`, `caseDocumentStatesMemberBlocks`, `caseDocumentRequiresDisclosures`, `caseDocumentRequiresV4Disclosures`, with the D-442, REC-188 and REC-219 comments | 11402–11460 | 12 | R20 |
| `CASE_DERIVATION_CHECKS` row C-44.2 (`FINDING_IN_SEVERAL_CASES`) | 9102–9109 | 8 | R10, R33; the rest of C-44 is `case-authoring`'s |
| `PUBLISHED_READ_CHECKS` (C-98.1–C-98.8) | 10933–11078 | 57 | R13, R33 |
| `ATTRIBUTION_CHECKS` C-92.1–C-92.9 | 13009–13066 | 54 | R17, R33; C-92.10–C-92.12 (13067–13088) are `ratification`'s |
| `INSTALLATION_CHECKS` row C-68.5 (`NO_PUBLISHED_STORE`) | 10708–10715 | 8 | R13, R33 (earliest raiser; `control-plane` imports it) |

Checks: 279 lines (139 code).

### schema.mjs (K4)

| table | lines | purge (R31) |
| --- | --- | --- |
| `published_bundles` (with the REC-14 header), `published_shas` | 66–155 | exempt |
| `published_edges` | 1514–1555 | keyed (`from_bundle`, `to_bundle`), derived |
| `published_cases`, `published_case_members`, `cases` | 1556–1767 | exempt |
| `case_documents`, `case_exclusions` | 1768–1859 | unsigned rows only |
| `case_revision_flags` | 2859–2932 | by bundle |
| `observation_attributions` | 3602–3621 | by bundle |
| `export_log` | store.mjs 1662–1674 (in the migrations row) | exempt |

Schema: 530 lines (about 117 of DDL). The purge declarations for these tables (store.mjs 874–890) move to this module's `declarePurge`.

**Measured size:** about 4,280 lines, about 1,830 of code.

## 2. What stays in a legacy module or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `#memberTextAtSha` | store 10107–10116 | `record-core` (`textAtSha`) | `biasManifest` (48120) and `ratifyCaseDocument` call it too (K94) |
| `testimonyReach` | store 20645–20682 | `basis-versions` | walks the basis tables (K94) |
| `#findingsExportPerformed` (N-1) | store 29102–29174 | `queue` | a queue producer; reads R19 (K94) |
| `gateFacts`, `publish`, `ratifyCaseDocument`, the conclusion comparison, the ratify handlers, C-41, C-58, C-65, C-92.10–.12 | store, index, bio-checks | `ratification` | K94 |
| `publishCase`, the document text, citations, searched section, acknowledgements, C-44.1/.3–.5, C-82 | store, airun, bio-checks | `case-authoring` | K94 |
| review's draft, grant and dead-answer helpers (`#draftForMember` … `#noReviewCopy`) | store 10348–10660 | `review` | reach this module through R23's provider |
| `reviewAnswer`, admission, stamps, the export credential gate (`ROOT_OF_TRUST_REQUIRED`), `caseReader`, the routes of `verify`, `publishedmanifest`, `caseflags`, `casedocument` | index | `control-plane` | K3 |
| `#caseAuthority`, `#isProjectOwner`, `#isJoinedParticipant`, `#existenceAct`, `#inSight`, `viewerPredicate` | store 33085–33188 | `membership` | already delegating |

## 3. Callers to rewire

- `#caseRelationOf`: the `caseMember` registration (store 902, replaced by this module's), `affordanceFacts` (3061), `dispose` (4640), `#restsOnLive` (5249), `divide` (12309), `groundInquiry` (12857), `#editionWarrantedForJoinedProjectOf` (33162), `#moveVersionState` (38687), `publishCase` (8325; `case-authoring`).
- `publishedRegistryFor`/`publishedCaseRegistryFor`: `divide` (12581), `groundInquiry` (13021), `auditPass` (15937), `#promoteChecks` (17595), `gateFacts` (33867, 33876; `ratification`): the first four through the facts (R7).
- `#flagCasesOnRevision`: `#promoteProjections` (18769), becoming the registered projection (R5). `#dischargeCaseFlags`: `publish` (34245; `ratification`).
- `#attributionInForce`: `reviewCopy` (10992). `#attributionStatements`: `publishCase` (9126). `observationsNamingAuthor`, `attributionStatedFor`: `gateFacts` (33855, 33857).
- `#hasCaseStanding`: `acknowledgeStatement` (11149). `#noCaseDocument`: the review helpers (10330). `#projectCaseExclusions`: `publishCase` (9148), inside R21.
- `#pinnedCaseEditionsOf`, `#soleCase`, `#caseDocMemberFrozen`, `#publishEdges`, `#caseEditionState`, `#ratifiedFindingsRestingOn`, `#frozenFromPinningDocuments`: `publish` and `ratifyCaseDocument` (`ratification`), through exported reads and R22.
- `EXPORT_LOG_LIMIT_DEFAULT`: `#findingsExportPerformed` (29128) → `exportLog`.
- index.mjs: `inbandQuartet` (`reviewAnswer`, 3696), `assembleCaseContainer` (11115, 11676; `ratification`), `delivererOf`, `deliveringPrincipal` (`ratification`'s handlers).

## 4. Old-battery tests

Suites that drive this module's ops and follow it: `publishedcase`, `caseflip`, `casepin`, `caselifecycle` (`op=caseflags`), `rec170-manifest-pair`, `mk7-attribution` (with `ratification` for C-92.10–.12), `exportnotice` (with `queue`), `multicase`. Source-reading suites from the parent map's §4 that name this module's code re-anchor here (`legacy-tests` entries, K53); the job confirms which: `affordances`, `case-opened`, `caseobject`, `op-claims`, `opaque-ids`, `plane-envelope`, `provenance-marker`, `reviewcopy-inband`.

## 5. Lines added to the legacy modules

- `legacy-store`: the factory import; one delegating method per moved public method still called (about 15); its `caseMember` registration (store 902) removed, replaced by the module's at construction; the fill of R23's provider from its review helpers until `review` is extracted (about 10); `#promoteChecks`/`#promoteProjections` stop calling moved code. About 35 lines.
- `legacy-index`: the import of the Worker-side file and one call per moved block (about 5).
- `legacy-checks`: re-exports of the formats, C-98, C-92.1–.9, C-44.2, C-68.5 for callers not yet moved (about 5).

## 6. Undetermined, conflicts, and code others could claim

1. **The write seam.** `ratification` and `case-authoring` wrote this module's tables directly; after the split they write only through R21 and R22. The job carves the SQL out of `publishCase`, `ratifyCaseDocument`, `publish` and the two re-authorings (about 80 lines) before those modules move, so one module holds R24.
2. **The format grammar** was tagged [R] in the parent map; `#caseDocMemberFrozen`, `#signedCitations` and `assembleCaseContainer` read it, so it is here (Decided 5).
3. **C-44.2 and C-92.1–.9** split out of families the parent map gave whole to [A] and [P]: rows follow their raisers.
4. **`review`** (Open for Bob 1): R23's provider serves it in either place.
