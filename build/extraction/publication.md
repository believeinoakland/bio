<!-- The publication survey, split three ways from the publication map for BOB #43 on 2026-09-26 on tranche/T3 (K94); superseded where it disagrees with build/requirements/publication.md. -->
# publication — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`bio-plane/` unchanged at `03e2481`; `store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682, `index.mjs` 13,438) by a drafting worker for BOB #43 (P18), split from the publication map's [P] rows (K94). **Re-cited** on `tranche/T7` @ `fd7e691a17` by a worker for BOB #53 (K214), from `build/extraction/T8-recheck.md` re-measured after T7's layers 7 and 11 (`store.mjs` 18,726 lines, `schema.mjs` 1,176, `checks/bio-checks.mjs` 13,732, `airun.mjs` 1,096): every `store.mjs`, `schema.mjs` and `bio-checks.mjs` line below is current there; `index.mjs` cites were re-cited at T8's opening, on `tranche/T8` @ 12e2067a5f (K226); the "code" counts are T3's. A method's range runs from the comment block above it to its closing brace; the extraction job confirms each. "Code" counts lines left after removing comment-only and blank lines (dispatch entries counted whole). The contract is `build/requirements/publication.md` (R1–R34); K3, K4, K6, K23, K31, K57, K61, K78 (2), K83 (3), K94 and N16 apply. The module exports `publicationOf(ctx)` (K61); `legacy-store` delegates to it. **`from`: `["legacy-store", "legacy-checks", "legacy-index"]`.** It is first of the three; `ratification` and `case-authoring` use it, and it uses neither.

## 1. What moves

### store.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `CASE_FLAGS_LIMIT` (with its comment) | 1520 | 1 | R6 |
| `#caseRelationOf`, `#caseClaimInBytes`, `#flagCasesOnRevision`, `#dischargeCaseFlags`, `caseFlags` | 2192–2470 (`#caseRelationOf` 2192, `#caseClaimInBytes` 2246, `#flagCasesOnRevision` 2311, `#dischargeCaseFlags` 2376, `caseFlags` 2404–2470) | 100 | R4–R6 |
| `caseDocumentFacts`, `#pinnedMemberBasis`, `#projectCaseExclusions`, `#caseDocMemberFrozen`, `#noCaseDocument`, `#hasCaseStanding`, `caseDocument`, `#signedCitations` | 6352–6421, 6434–6585 | 120 | R1–R3, R21's projection; `#memberTextAtSha` (6425–6432) is `record-core`'s `textAtSha` (R60, K203, built in T8's layer 2); the store copy is deleted once it is |
| `ATTRIBUTION_LEVELS`, `observationsNamingAuthor`, `#attributionInForce`, `#observationsReachedBy`, `#attributionStatements`, `ATTRIBUTION_PROSE_HEAD`, `#attributionFrontmatterLines`, `#attributionBodyLines`, `#reauthorAttributions`, `attributionFacts`, `attributionStatedFor`, `attributeObservation` | 9671–9927 | 191 | R17; `#observedMs` is no longer in the store: it is `provenance`'s (`observedMs`, `provenance/index.mjs` 480), and its caller moved with it |
| `EXPORT_LOG_LIMIT_DEFAULT`, `EXPORT_LOG_LIMIT_MAX` | 10207–10208 | 3 | R19 |
| `exportManifest`, `exportLog`, `publishedManifest` | 14354–14394, 14413–14421, 14433–14573 | 102 | R11, R18, R19 (N16) |
| `#frozenFromPinningDocuments`, `#frozenPairsByCase`, `#caseEditionState`, `recordCaseManifest`, `#publishEdges`, `verifySha`, `publishedList`, `publishedEditions`, `publishedCase`, `#deliveredBy`, `#looseEditionState`, `#caseClaimsOf`, `#casesOf`, `#soleCase`, `#resolveOneCase`, `publishedGraphEdges`, `#ratifiedFindingsRestingOn`, `#pinnedCaseEditionsOf`, `#casesOfSha`, `publishedTargets` | 15239–16369 (`#caseEditionState` 15297–15497, `recordCaseManifest` 15506, `#publishEdges` 15554, `publishedCase` 15707–15992, `publishedGraphEdges` 16288, `publishedTargets` 16365–16369) | 458 | R7–R12, R15; `#publishEdges` and the inserts `ratification` makes today become R22 |
| `excludedBy`, `publishedRegistryFor`, `publishedCaseRegistryFor` | 16411–16539 | 68 | R7, R12 |
| the `case_documents` insert and the two conditional re-author updates, taken out of `publishCase` (4294–5564), `#reauthorAcknowledgements` (7844–7880) and `#reauthorAttributions` (9784–9808) | about 20 | — | R21 (the SQL moves here; the text builders stay with their callers) |
| the commit writes taken out of `ratifyCaseDocument` (8197–8497: `cases`, `published_cases`, `published_case_members`, the signature on `case_documents`) and `publish` (14734–15232: `published_bundles`, `published_shas`; edges through `#publishEdges`) | about 60 | — | R22 (the SQL moves here; the decisions stay in `ratification`) |
| dispatch `caseflags` (18275), `attribute` (18450), `publishededitions` (18628), `publishedcase` (18633), `recordcasemanifest` … `publishedmanifest` (18647–18655), `casedocfacts` (18671), `casedocument` (18674), `verify` (18708), `publishedlist` (18709) | about 67 | 67 | K3; the `PROJECT_NAMING_READS` rows (14195–14227) stay with the dispatcher |
| migrations: `published_bundles` re-key (808–852, 1007–1013); `delivered_by` (about 948); `export_log` DDL (1053) | 94 | 31 | with the tables |

Store: 2,366 lines in ranges (1,043 code) plus about 160 of dispatch and migrations.

### index.mjs (the Worker half; K3)

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `publishedStoreAbsent`, `publishedReadRow`, `noPublishedPart`, `publishedObjectMissing` | 4174–4230 | 22 | R13 (C-68.5, C-98.1, C-98.2) |
| `assembleCaseContainer` | 4294–4560 | 96 | R15 |
| `op=publishedcase` / `op=publishedbytes` block | 4936–5232 | 158 | R10, R13 |

Index: 621 lines (276 code).

### Owned files

`container.mjs` (195 lines, 98 code), `inband.mjs` (68, 38), `deliverer.mjs` (55, 17): already this module's paths (R14–R16).

### bio-checks.mjs

| what | lines | code | requirement |
| --- | --- | --- | --- |
| `CASE_DOCUMENT_FORMAT` … `CASE_DOCUMENT_FORMATS_ACCEPTED`, `caseDocumentStatesMemberBlocks`, `caseDocumentRequiresDisclosures`, `caseDocumentRequiresV4Disclosures`, with the D-442, REC-188 and REC-219 comments | 9781–9809 | 12 | R20 |
| `CASE_DERIVATION_CHECKS` row C-44.2 (`FINDING_IN_SEVERAL_CASES`) | 7822 (inside `CASE_DERIVATION_CHECKS` 7800–7856) | 8 | R10, R33; the rest of C-44 is `case-authoring`'s |
| `PUBLISHED_READ_CHECKS` (C-98.1–C-98.8) | 9285–9341 | 57 | R13, R33 |
| `ATTRIBUTION_CHECKS` C-92.1–C-92.9 | 11295–about 11349 (inside `ATTRIBUTION_CHECKS` 11293–11371) | 54 | R17, R33; C-92.10–C-92.12 (11353–11371) are `ratification`'s |
| `INSTALLATION_CHECKS` row C-68.5 (`NO_PUBLISHED_STORE`) | 9061 (inside `INSTALLATION_CHECKS` 9026–9068) | 8 | R13, R33 (earliest raiser; `control-plane` imports it) |

Checks: 279 lines (139 code).

### schema.mjs (K4)

| table | lines | purge (R31) |
| --- | --- | --- |
| `published_bundles` (with the REC-14 header), `published_shas` | 106, 122 | exempt |
| `published_edges` | 295 | keyed (`from_bundle`, `to_bundle`), derived |
| `published_cases`, `published_case_members`, `cases` | 387, 455, 511 | exempt |
| `case_documents`, `case_exclusions` | 556, 593 | unsigned rows only |
| `case_revision_flags` | 927 | by bundle |
| `observation_attributions` | 1057 | by bundle |
| `export_log` | store.mjs 1053 (in the migrations row) | exempt |

Schema: 530 lines (about 117 of DDL); the cites are each table's first line. The purge declarations for these tables (store.mjs 637–655, `declarePurge("legacy-store", …)`) move to this module's `declarePurge`.

**Measured size:** about 4,280 lines, about 1,830 of code.

## 2. What stays in a legacy module or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `#memberTextAtSha` | store 6425–6432 | `record-core` (`textAtSha`, R60, K203) | callers `#pinnedMemberBasis` (6439) and `ratifyCaseDocument` (8467); `bias` keeps its own copy (`bias/index.mjs` 139); built in T8's layer 2, then the store copy goes |
| `testimonyReach` | `basis-versions/index.mjs` 526; store delegate 9664 | `basis-versions` (R39) | moved; this module reads it through basis-versions R39 (callers `#observationsReachedBy` 9714, `caseDocumentFacts` 6405) |
| `#findingsExportPerformed` (N-1) | store 11678–11727 | `queue` | a queue producer; reads R19 (K94) |
| `gateFacts`, `publish`, `ratifyCaseDocument`, the conclusion comparison, the ratify handlers, C-41, C-58, C-65, C-92.10–.12 | store, index, bio-checks | `ratification` | K94 |
| `publishCase`, the document text, citations, searched section, acknowledgements, C-44.1/.3–.5, C-82 | store, airun, bio-checks | `case-authoring` | K94 |
| review's draft, grant and dead-answer helpers (`#draftForMember` … `#noReviewCopy`) | store 6587–7362 | `review` | reach this module through R23's provider |
| `reviewAnswer`, admission, stamps, the export credential gate (`ROOT_OF_TRUST_REQUIRED`), `caseReader`, the routes of `verify`, `publishedmanifest`, `caseflags`, `casedocument` | index | `control-plane` | K3 |
| `#caseAuthority`, `#isProjectOwner`, `#isJoinedParticipant`, `#existenceAct`, `#inSight`, `viewerPredicate` | store 14070–14173 (delegates) | `membership` | already delegating |

## 3. Callers to rewire

- `#caseRelationOf`: the `caseMember` registration legacy-store fills in this module's name (store 724), which this module removes and replaces with its own R4 registration (the registration rule, `draft-T8.md`); `affordanceFacts` (1349), `publishCase` (4643; `case-authoring`), `#editionWarrantedForJoinedProjectOf` (14147). `dispose`, `#restsOnLive`, `divide`, `groundInquiry` and `#moveVersionState` have moved to `inquiry` and `basis-versions`, which read the fact `caseMember` through `promotion.fact` (`inquiry/index.mjs` 172, `basis-versions/index.mjs` 620).
- `publishedRegistryFor`/`publishedCaseRegistryFor`: the `publishedRegistry` registration legacy-store fills in this module's name (store 725), removed and replaced by this module's own R7 registration (N152); `inquiry` reads the fact (`inquiry/index.mjs` 181). Direct callers left: `auditPass` (8764), `gateFacts` (14685; `ratification`), `publishedTargets` (16368).
- `#flagCasesOnRevision`: `#promoteProjections` (9608), inside legacy-store's registered promotion step (store 744), becoming this module's registered projection (R5). `#dischargeCaseFlags`: `publish` (15063; `ratification`).
- `#attributionInForce`: `reviewCopy` (7308). `#attributionStatements`: `publishCase` (5442). `observationsNamingAuthor`, `attributionStatedFor`: `gateFacts` (14673, 14675).
- `#hasCaseStanding`: `acknowledgeStatement` (7465), `excludedBy` (16425). `#noCaseDocument`: `caseDocumentFacts` (6360, 6394). `#projectCaseExclusions`: `publishCase` (5464), inside R21.
- `#pinnedCaseEditionsOf`, `#soleCase`, `#caseDocMemberFrozen`, `#publishEdges`, `#caseEditionState`, `#ratifiedFindingsRestingOn`, `#frozenFromPinningDocuments`: `publish` and `ratifyCaseDocument` (`ratification`), through exported reads and R22.
- `EXPORT_LOG_LIMIT_DEFAULT`: `#findingsExportPerformed` (11681; `queue`) → `exportLog`.
- index.mjs: `inbandQuartet` (`reviewAnswer`, 3487), `assembleCaseContainer` (6788, 7351; `ratification`), `delivererOf`, `deliveringPrincipal` (`ratification`'s handlers).

## 4. Old-battery tests

Suites that drive this module's ops and follow it: `publishedcase`, `caseflip`, `casepin`, `caselifecycle` (`op=caseflags`), `rec170-manifest-pair`, `mk7-attribution` (with `ratification` for C-92.10–.12), `exportnotice` (with `queue`), `multicase`. Source-reading suites from the parent map's §4 that name this module's code re-anchor here (`legacy-tests` entries, K53); the job confirms which: `affordances`, `case-opened`, `caseobject`, `op-claims`, `opaque-ids`, `plane-envelope`, `provenance-marker`, `reviewcopy-inband`.

## 5. Lines added to the legacy modules

- `legacy-store`: the factory import; one delegating method per moved public method still called (about 15); the `caseMember` and `publishedRegistry` registrations it fills in this module's name (store 724, 725) removed, replaced by the module's own at construction (the registration rule, K206, as reevaluation did, K205); the fill of R23's provider from its review helpers until `review` is extracted (about 10); `#promoteChecks`/`#promoteProjections` stop calling moved code. About 35 lines.
- `legacy-index`: the import of the Worker-side file and one call per moved block (about 5).
- `legacy-checks`: re-exports of the formats, C-98, C-92.1–.9, C-44.2, C-68.5 for callers not yet moved (about 5).

## 6. Undetermined, conflicts, and code others could claim

1. **The write seam.** `ratification` and `case-authoring` wrote this module's tables directly; after the split they write only through R21 and R22. The job carves the SQL out of `publishCase`, `ratifyCaseDocument`, `publish` and the two re-authorings (about 80 lines) before those modules move, so one module holds R24.
2. **The format grammar** was tagged [R] in the parent map; `#caseDocMemberFrozen`, `#signedCitations` and `assembleCaseContainer` read it, so it is here (Decided 5).
3. **C-44.2 and C-92.1–.9** split out of families the parent map gave whole to [A] and [P]: rows follow their raisers.
4. **`review`** (Open for Bob 1): R23's provider serves it in either place.
5. **Registrations legacy-store fills in this module's name** (K206): the facts `caseMember` (store 724) and `publishedRegistry` (725), and the `#flagCasesOnRevision` arm of legacy-store's promotion step (`#promoteProjections` 9608, registered at 744). The job removes each from legacy-store and registers its own (removal plus §12.2's rewiring), as reevaluation did (K205).
