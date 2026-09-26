# inquiry — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `35ea098` (promotion merged; `store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682, `index.mjs` 13,438) by a drafting worker for BOB #42 (P18). A method's range runs from the line after the previous method's close to its own close, so the comment above it goes with it; the extraction job confirms each. Split by N55 (K83 (2)): `cite`, `sever`, `reinstate`, `#retiredNotCitable`, their splices and rows are `build/extraction/citation.md`'s; line numbers are unchanged at `1c205209`. The contract is `build/requirements/inquiry.md` (R1–R38); K23, K31, K57, K61, K63, K73 (5), K75 (2)–(3), K78 (3) and K79 apply. The module exports `inquiryOf(ctx)` (K61); `legacy-store` delegates to it and registers what later modules still owe it (K31). `from` reads `["legacy-store", "legacy-checks"]` (K64's pattern, K83 (1)). Nothing moves from `index.mjs`. Written beside the parallel `basis-versions` and `strength` drafts (same worker); §5 reconciles them.

## 1. What moves to `inquiry`

All in `store.mjs` unless named.

| what | where today | lines | notes |
| --- | --- | --- | --- |
| `#writeSupersededBy`, `supersededByOf` | store | 1872–1907 | R12, R16; the `inquiry_superseded_by` column leaves `bundles` (R36) |
| `RELEASE_ACK_MAX` | | 4314–4318 | `divide`'s and `groundInquiry`'s bound, a copy (K57); the rest of 4288–4551 (`EDGE_*`, `#edgeTransition`, `sever`, `reinstate`) is `citation`'s, `CORRESPOND_LEASE_MS` `actions'` |
| `dispose` | | 4552–4790 | R20–R22; `DISPOSITIONS` becomes this module's copy (K78 (3)) |
| `#restsOnLive` | | 5198–5252 | R17; `#retirementCitedBy` after it is connections' fact (K76), `#retiredNotCitable` (5268–5301) `citation`'s |
| REC-16 header, `divide` | | 12199–12724 | R23–R26; `MEMBER_ROLES`, `COMPLETENESS_MAX` above it are `publication`'s |
| `groundInquiry`, `#spliceBasisGround`, `#fmSafe` | | 12725–13169 | R27–R28 |
| `#setSection`, `#removeBlock`, `#setOrAddBlock` | | 13389–13433 | `divide`'s and `groundInquiry`'s splices, copied by each module that splices (K57); `#spliceEdgeStatus` and `cite` (13434–14300) are `citation`'s |
| `#appendStateHistory`, `#setScalar`, `#setOrAddScalar` | | 15566–15636 | helpers, copied |
| inside `#promoteChecks`: the basis arm and subject entity; supersession and division disclosure; `SELF_BASIS`/`BASIS_CYCLE` | | 17551–17671, 17844–17899, 18037–18063 | R11, registered as this module's check (promotion R39); the `responds_to` block 17821–17843 is `actions'` |
| inside `#promoteProjections`: superseded-by index, `inquiry_basis` with content rows, `inquiry_exclusions`, the migration-replay row, answer key `content` | | 18154–18351, 18618–18645, 18745–18760, 18796 | R12; the `refs` rewrite 18160–18168 is connections' R19 |
| `ensureLegContent`, `#backfillLegContent` (`LEG_BACKFILL_MAX` with the bounds) | | 22686–22745, 23166–23214 | R15 |
| `#subjectEntityOf`, `earnedBasisRegistry`, `earnedRegistryForDoc` | | 26364–26744 | R13 (§5.2) |
| `#basisCyclePath`, `#basisReach`, `basisFor`, `restingOn` | | 31123–31191 | R11, R16 |
| `#capturedAt` | | 31922–31995 | R14 (`legCapped`) |
| `#legVersions`, `earnedBasis` | | 35552–35759 | R15 |
| dispatch `basis`, `restson`, `earnedbasis`, `dispose`, `inquirydivide`, `inquiryground` | | 48584–48585, 48619–48626, 49598–49601, 49681–49704 | K3; `cite`, `sever`, `reinstate` (49473–49530) are `citation`'s |
| migrations: `inquiry_basis.ground`; `bundles.inquiry_basis_count`, `inquiry_subject_entity`, `inquiry_superseded_by` | | 1072, 1092, 1107, 1115 (with their comments) | the three `bundles` columns move to an own table (R36, K75 (3)) |
| `INQUIRY_TITLE_MAX`, `deriveInquiryTitle`, `inquiryQuestionOf` | bio-checks | 55–75 | R10; the setup page embeds the function's source (§4) |
| `STATES.inquiry` | bio-checks | 409–434 | R1; `STATES` is one object, split by the first job to move |
| `supersedesEdgeFindings`, `divisionDisclosureFindings` | bio-checks | 2330–2364, 2406–2448 | R9; `respondsToEdgeFindings` between them is `actions'` |
| `checkInquiryExtension`, `checkDividedExtension` | bio-checks | 2615–2931 | R2, R3 as `checkInquiryEntry`; it calls `checkPublishedExtension` (`publication`) for case-member bytes |
| `BASIS_ROLES` … `GROUND_LABEL_RE`, `checkLegExtentGrammar`, `checkInquiryBasis`, `checkGrounds`, `checkTestimonyLeg`, `checkEarnedLeg`, `checkInheritedLeg` | bio-checks | 3276–4177 | R4–R8; `BASIS_GRADES`, `TESTIMONY_GRADE`, `EARNED_CAPTURE_CEILING` and `UNREACHABLE_CAPTURE_GRADE` stay in `legacy-checks` (provenance and capture read them) |
| `leadLegFindings` and row C-54.1 | bio-checks | 14177–14222; in 13246–13329 | R4 (observation-log's R25 leaves them with the leg grammars) |
| rows C-33.13, .22, .23 (in `ACT_SHAPE_CHECKS`), C-32.7, C-32.8 (in `MACHINE_FENCE_CHECKS`) | bio-checks | in 9490–10105, 9191–9421 | R38; each family is one object, split by the first job to move, numbers unchanged; C-33.15–.19, .39 and C-45.7–C-45.10 are `citation`'s |

**Schema (K4).** `inquiry_basis` with its four indexes (schema.mjs 1267–1402), `inquiry_exclusions` (1462–1494), `inquiry_migration_replays` (2112–2127). All carry `bundle_id` and sit in `legacy-store`'s purge list (store.mjs 872–876), from which the job removes them when this module declares its own (R36).

**Measured size:** store.mjs 2,748 (1,343 code), bio-checks.mjs 1,390 (560), schema.mjs 185 (37): about 4,320 lines, about 1,940 of code (the check rows and migrations not counted). Before the split: store.mjs 4,115 (1,943), about 5,690 lines (2,540 code).

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `conclude`, `#withdrawConclusion` and the conclusion record | store 5630–6358, 6589–6675 | `basis-versions` | they adopt a version's claim and read CURRENT (§5.3) |
| `#caseConclusionFor`, `#editionsRecordingConclusion` and its three statics | 6359–6588 | `publication` | they compare against `case_documents` |
| `#joinedCitingProjectOf`, `#concludedForJoinedProjectOf`, `#editionWarrantedForJoinedProjectOf` | 33087–33176 | `affordances` | only `affordanceFacts` calls them |
| `reopen` | promotion | `promotion` (K62 (1)) | D-592's read is R19 here (§5.4) |
| `excludedBy` (`op=excludedby`) | 35760–35808 | `publication` | it answers which cases excluded a document; it calls R18 for the inquiry arm |
| `#reevalRaisedBy`, `reevaluations`, `#reevalLegsEarned`, `#reevalMoved`, `#frontmatterOf`, `#basisFrontmatter` | 4791–4803, 31192–31557 | `reevaluation` | registered with R21, R25 (`onRaised`) |
| `#surfacingGate`, the surfaced-by revision fence, `inquiry_run_surfacings`, C-66 | 17350–17413, 17431–17479, 18727–18744 | `ai-runs` | they read `ai_runs` and `ai_run_bounds` |
| `#strengthWalk` and the pair; the cache write | 31558–32453 | `strength` | registered with R28 (`onGrounded`) |
| `#caseRelationOf`, `publishedRegistryFor` | 4867–4934, 35809–35876 | `publication` | read here as the facts `caseMember` and `publishedRegistry` (§5.3) |
| `#producingGroup`, `#groupUndetermined` | | `instance-setup` (K69) | the fact `producingGroup` |
| `index.mjs`: the op lists, classes and stamps of these ops (`EDGE_ACTIONS`, `STATE_ACTIONS`, `STRUCTURE_ACTIONS`, `POSITIONAL_ACTS`, 1053–1054, 2561) | index.mjs | `control-plane` | routing, authentication and stamps (K3) |

## 3. Callers to rewire

Each calls moved code or reads a moved table today, and calls `inquiryOf(ctx)` after.

- `earnedBasisRegistry`: `cite` (14079; `citation`, next in the order), `#legEarnedCapture` (2486; `retrieval`, through its registration, K75 (2)), `auditPass`'s context (15936), `gateFacts` (33884), `#reevalLegsEarned` (31436), `#captureBoundsFor` (32028), `#versionLegsEarned` (37454), `#versionLegsAsMembers` (37934).
- `#capturedAt`: 2489, 31440, `#strengthWalk` (32137), 37457.
- `basisFor`: `#captureBoundsFor` (32020), `#strengthWalk` (32069). `#basisCyclePath`: `#moveVersionState` (38755).
- `#restsOnLive`: `affordanceFacts` (3046), `#reevalRaisedBy` (4800). (`#retiredNotCitable`'s callers are in `citation`'s map.) `supersededByOf`: `#reevalMoved` (31468). `#writeSupersededBy`: `#migrate`'s backfill (1729).
- `#subjectEntityOf`: `gateFacts`, `versionStrength` (38171).
- Direct SQL on `inquiry_basis`: `#searchedForCase` (9894), the contradiction readers (14643–14983), `testimonyReach` (20670), `extractProposals` (22674), `#queueAncestorEdges` (27674), `#leadBasisAbsence` (28264), `reevaluations` (31260), `gateFacts` (33868), `versionNotice` (37222), `partitionIndependence` (38410); `query.mjs`'s `leg:` arm. On `inquiry_exclusions`: `excludedBy`. On `inquiry_migration_replays`: `#surfacedIn` (2185). Proposed: state `inquiry_basis(bundle_id, ord, target_id, target_type, role, grade, grade_axis, grade_source, ground, content_id)` as a read contract (as record-core R37 does), the owner's writes only.

## 4. Old-battery tests that anchor on the moved source

Negative controls and pins that read or patch the text of moved code, so they move or re-anchor (a `legacy-tests` entry, K53): `nc-mk4.mjs`, `nc-rec84.mjs`, `nc-rec97.mjs` (the leg grammar, `leadLegFindings`; `nc-rec97`'s dispatch and extent-region arms are `citation`'s), `nc-rec83.mjs`, `nc-rec114.mjs`, `nc-rec116.mjs` (`ensureLegContent`, `#capturedAt`, `dispose`), `nc-m040.mjs`, `nc-rec88.mjs`, `nc-sk7.mjs` (the earned registry), `d280-strengthbar.control.mjs`, `founder-sight.control.mjs` (`restingOn`, `dispose`), `machinefences-dec49.test.mjs` (the DEC-49 regions of `divide`, `groundInquiry`, `dispose`), `hygiene.test.mjs` (purge tables), `identity-claims.test.mjs` (stamped authorship of dispose, divide, ground). `nc-rec72.mjs`, `rec-183-reinstate-retired.control.mjs`, `project-sight.control.mjs` and the cite arms of the others are `citation`'s. The setup page embeds `deriveInquiryTitle`'s source verbatim (its comment), so a pin reads it where it lands. Suites that drive the behaviour through the plane and follow the module: `basis`, `disposition`, `inquiry`, `grounds`, `caselifecycle` (divide), `rec114-leg-earned`, `strength` (the earned arms), `derivation-bounds`, `selection`'s dispose arm; `cite`, `citeinquiry`, `edges`, `severedhomes` follow `citation`.

## 5. Undetermined, conflicts, and code others could claim

1. **Size, and the split (P6). Settled by K83 (2), applied by N55.** 5,690 lines, past 4,000. Taken: `citation`, next after `inquiry` in layer 6, takes `cite`, `sever`, `reinstate`, `#edgeTransition`, their splices and rows (C-33.15–C-33.19, C-33.39, C-45.7–C-45.10): measured at the split as about 1,480 lines (680 code) with `#retiredNotCitable`, the `CITE_*` constants and the rows, leaving about 4,320 (1,940 code), still past 4,000: K74's case. `citation` uses `inquiry` (`earned`, `checkLegExtentGrammar`, `BASIS_ROLES`), `retrieval` (selections), `membership`, `promotion` and `content`. Read as BOB's under P17 (K70, K73 (7): a split for P6, no capability added or removed).
2. **The earned registry is placed here, not in `strength`** (settled by K83 (3)) (where the progressions map and this draft's brief placed it). It is needed by the leg grammar at every write (R6, `checkEarnedLeg`), by `cite`'s fill (`citation` R2), by `divide` and `ground`'s pre-flight, by `basis-versions` (R10) and by `strength`; here it needs no registration. In `strength` it needs one `inquiry` offers and `strength` fills, and `inquiry` refuses an earned leg while it is unfilled (never reads it as not earned). Its reads are `entities.strongestByCapture`, the `register` contract (provenance R48), `readings` and `reading_text_source` (extraction's read contract), `text-chain.captureBound`, `content.standings`, `connections.portionGrades`. 
3. **Facts from later modules** (settled by K83 (5), N56). `dispose`, `divide`, `ground` and `#restsOnLive` ask `caseMember`; the leg grammar asks `publishedRegistry`; `divide` asks `producingGroup`. `promotion` holds all three as registered facts (store.mjs 900–902) but reads them privately. Proposed: `promotion` offers `fact(name, …args)`, answering `FACT_UNAVAILABLE` when unprovided (its R40's rule), so a fact is registered once for every earlier reader; otherwise this module offers its own registrations for each.
4. **Old-plan rows** (re-targeted by K83 (4): REC-202 to `queue`, D-572 to `ai-runs`, D-592 to `promotion`). REC-202 (a member takes up or sets aside at the inquiry's grain) is built on `land/worker/REC-202` @ 1716321d in `queue`'s findings producer (`#findingsOutOfInquiryLead`, `options_grain`): the acts exist (`op=cite`'s inquiry arm, `op=proposedispose`); proposed target `queue`. D-572 (a level-empty candidate per named question) is `ai-runs`' `op=suggest` and `observation-log`'s look; proposed target `ai-runs`. D-592 (who reopened) is R19 here, read from the state history `promotion`'s `reopen` writes. MK-5 is R31, not yet met: it waits on `publication` defining the opinion element's id.
5. **Uses** (applied by K83 (1)). `modules.json` gave `inquiry` `bias`, which nothing here calls (HUNCH debt is refused at publication, `publication`'s). The moved code calls `promotion`, `entities`, `provenance`, `extraction`, `text-chain` and `observation-log` (Private/Uses). Proposed: add those six, drop `bias`.
6. **Found by this reading, not yet met.** `dispose` promotes members one at a time and `divide` the parent before its children, so a late refusal leaves a partial act (R22, R26). Whether several promotions can share one `record-core.transact` is the job's to state, through BOB.
7. **Other claimants.** `citation` (§5.1; its map). `strength`: the earned registry (§5.2). `publication`: `excludedBy`, the case facts, `checkPublishedExtension`. `reevaluation`: the obligation. `ai-runs`: surfacing. `affordances`: the three joined-project predicates and `DISPOSITIONS`' home. `connections`: `#retirementCitedBy`, `citesInto`, the `refs` rewrite. `promotion`: `reopen`.
