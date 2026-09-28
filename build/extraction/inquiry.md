# inquiry — extraction map

**Status** · Checked against `tranche/T7` @ `e15806be` by a worker for BOB #50 (P18) (`store.mjs` 33,756 lines, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,629, `index.mjs` 9,069); every line number below is re-measured there (the measured sizes are left as first measured), the prose unchanged except where a correction names it. Corrections: all store, schema and catalogue lines re-measured (layers 2–5 left the store about 16,000 lines shorter); the `refs` rewrite in the projection is already `connections`' (`refsReplacedOf`, store 15229–15232); `#legEarnedCapture` is already `retrieval`'s, reached through legacy-store's `registerLegGrades` (store 757–760); `promotion` registers `producingGroup` and `caseMember` (store 779–780) but no `publishedRegistry` yet (§5.3); the supersession arm's comment (14814–14835) and its code (14986–15041) are now apart, the action arm between them; `LEAD_ID_RE` is `legacy-checks`' (bio-checks 12295), not `observation-log`'s (review file). Measured 2026-09-26 on `tranche/T3` @ `35ea098` (promotion merged; `store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682, `index.mjs` 13,438) by a drafting worker for BOB #42 (P18). A method's range runs from the line after the previous method's close to its own close, so the comment above it goes with it; the extraction job confirms each. Split by N55 (K83 (2)): `cite`, `sever`, `reinstate`, `#retiredNotCitable`, their splices and rows are `build/extraction/citation.md`'s; line numbers are unchanged at `1c205209`. The contract is `build/requirements/inquiry.md` (R1–R38); K23, K31, K57, K61, K63, K73 (5), K75 (2)–(3), K78 (3) and K79 apply. The module exports `inquiryOf(ctx)` (K61); `legacy-store` delegates to it and registers what later modules still owe it (K31). `from` reads `["legacy-store", "legacy-checks"]` (K64's pattern, K83 (1)). Nothing moves from `index.mjs`. Written beside the parallel `basis-versions` and `strength` drafts (same worker); §5 reconciles them.

## 1. What moves to `inquiry`

All in `store.mjs` unless named.

| what | where today | lines | notes |
| --- | --- | --- | --- |
| `#writeSupersededBy`, `supersededByOf` | store | 1283–1318 | R12, R16; the `inquiry_superseded_by` column leaves `bundles` (R36) |
| `RELEASE_ACK_MAX` | | 2399–2403 | `divide`'s and `groundInquiry`'s bound, a copy (K57); the rest of 2374–2636 (`EDGE_*`, `#edgeTransition`, `sever`, `reinstate`) is `citation`'s, `CORRESPOND_LEASE_MS` `actions'` |
| `dispose` | | 2637–2875 | R20–R22; `DISPOSITIONS` becomes this module's copy (K78 (3)) |
| `#restsOnLive` | | 3226–3280 | R17; `#retirementCitedBy` after it is connections' fact (K76, already a delegation to `connections`, 3281–3295), `#retiredNotCitable` (3296–3329) `citation`'s |
| REC-16 header, `divide` | | 10169–10694 | R23–R26; `MEMBER_ROLES`, `COMPLETENESS_MAX` above it are `publication`'s |
| `groundInquiry`, `#spliceBasisGround`, `#fmSafe` | | 10695–11139 | R27–R28 |
| `#setSection`, `#removeBlock`, `#setOrAddBlock` | | 11359–11402 | `divide`'s and `groundInquiry`'s splices, copied by each module that splices (K57); `#spliceEdgeStatus` and `cite` (11403–12270) are `citation`'s |
| `#appendStateHistory`, `#setScalar`, `#setOrAddScalar` | | 13536–13606 | helpers, copied |
| inside `#promoteChecks`: the basis arm and subject entity; supersession and division disclosure; `SELF_BASIS`/`BASIS_CYCLE` | | 14693–14813, 14814–14835 with 14986–15041, 15179–15204 | R11, registered as this module's check (promotion R39); the `responds_to` block 14963–14985 is `actions'` |
| inside `#promoteProjections`: superseded-by index, `inquiry_basis` with content rows, `inquiry_exclusions`, the migration-replay row, answer key `content` | | 15229–15415, 15629–15656, 15698–15707, 15738–15749 | R12; the `refs` rewrite is already connections' R19 (it reads `refsReplacedOf`, 15229–15232) |
| `ensureLegContent`, `#backfillLegContent` (`LEG_BACKFILL_MAX` with the bounds) | | 16541–16652; `LEG_BACKFILL_MAX` 29351 | R15 |
| `#subjectEntityOf`, `earnedBasisRegistry`, `earnedRegistryForDoc` | | 16772–17153 | R13 (§5.2) |
| `#basisCyclePath`, `#basisReach`, `basisFor`, `restingOn` | | 20682–20750 | R11, R16 |
| `#capturedAt` | | 21481–21554 | R14 (`legCapped`) |
| `#legVersions`, `earnedBasis` | | 24811–25018 | R15 |
| dispatch `basis`, `restson`, `earnedbasis`, `dispose`, `inquirydivide`, `inquiryground` | | 32917–32922, 32957–32968, 33541–33551, 33630–33647 | K3; `cite`, `sever`, `reinstate` (33433–33486) are `citation`'s |
| migrations: `inquiry_basis.ground`; `bundles.inquiry_basis_count`, `inquiry_subject_entity`, `inquiry_superseded_by` | | 956, 913, 933, 948 (with their comments) | the three `bundles` columns move to an own table (R36, K75 (3)) |
| `INQUIRY_TITLE_MAX`, `deriveInquiryTitle`, `inquiryQuestionOf` | bio-checks | 55–75 | R10; the setup page embeds the function's source (§4) |
| `STATES.inquiry` | bio-checks | 409–430 | R1; `STATES` is one object, split by the first job to move |
| `supersedesEdgeFindings`, `divisionDisclosureFindings` | bio-checks | 2046–2078, 2116–2182 | R9; `respondsToEdgeFindings` between them is `actions'` |
| `checkInquiryExtension`, `checkDividedExtension` | bio-checks | 2351–2660 | R2, R3 as `checkInquiryEntry`; it calls `checkPublishedExtension` (`publication`) for case-member bytes |
| `BASIS_ROLES` … `GROUND_LABEL_RE`, `checkLegExtentGrammar`, `checkInquiryBasis`, `checkGrounds`, `checkTestimonyLeg`, `checkEarnedLeg`, `checkInheritedLeg` | bio-checks | 3002–3912 | R4–R8; `BASIS_GRADES`, `TESTIMONY_GRADE`, `EARNED_CAPTURE_CEILING` and `UNREACHABLE_CAPTURE_GRADE` stay in `legacy-checks` (provenance and capture read them) |
| `leadLegFindings` and row C-54.1 | bio-checks | 13194–13249; 12298–12305 (in `LEAD_CHECKS`, 12297–12306) | R4 (observation-log's R25 leaves them with the leg grammars) |
| rows C-33.13, .22, .23 (in `ACT_SHAPE_CHECKS`), C-32.7, C-32.8 (in `MACHINE_FENCE_CHECKS`) | bio-checks | 8893–8899, 8992–9004 (in 8691–9257); 8487–8502 (in 8371–8634) | R38; each family is one object, split by the first job to move, numbers unchanged; C-33.15–.19, .39 and C-45.7–C-45.10 are `citation`'s |

**Schema (K4).** `inquiry_basis` with its four indexes (schema.mjs 203–339), `inquiry_exclusions` (399–431), `inquiry_migration_replays` (1050–1064). All carry `bundle_id` and sit in `legacy-store`'s purge list (store.mjs 687–712, the names at 689–693), from which the job removes them when this module declares its own (R36).

**Measured size:** store.mjs 2,748 (1,343 code), bio-checks.mjs 1,390 (560), schema.mjs 185 (37): about 4,320 lines, about 1,940 of code (the check rows and migrations not counted). Before the split: store.mjs 4,115 (1,943), about 5,690 lines (2,540 code).

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `conclude`, `#withdrawConclusion` and the conclusion record | store 3658–4386, 4617–4703 | `basis-versions` | they adopt a version's claim and read CURRENT (§5.3) |
| `#caseConclusionFor`, `#editionsRecordingConclusion` and its three statics | 4387–4616 | `publication` | they compare against `case_documents` |
| `#joinedCitingProjectOf`, `#concludedForJoinedProjectOf`, `#editionWarrantedForJoinedProjectOf` | 22488–22602 | `affordances` | only `affordanceFacts` calls them |
| `reopen` | promotion | `promotion` (K62 (1)) | D-592's read is R19 here (§5.4) |
| `excludedBy` (`op=excludedby`) | 25019–25067 | `publication` | it answers which cases excluded a document; it calls R18 for the inquiry arm |
| `#reevalRaisedBy`, `reevaluations`, `#reevalLegsEarned`, `#reevalMoved`, `#frontmatterOf`, `#basisFrontmatter` | 2876–2888, 20751–21116 | `reevaluation` | registered with R21, R25 (`onRaised`) |
| `#surfacingGate`, the surfaced-by revision fence, `inquiry_run_surfacings`, C-66 | 14495–14558, 14576–14624, 15680–15697 | `ai-runs` | they read `ai_runs` and `ai_run_bounds` |
| `#strengthWalk` and the pair; the cache write | 21117–22012 | `strength` | registered with R28 (`onGrounded`) |
| `#caseRelationOf`, `publishedRegistryFor` | 2889–2962, 25068–25135 | `publication` | read here as the facts `caseMember` and `publishedRegistry` (§5.3) |
| `#producingGroup`, `#groupUndetermined` | 22117–22175, 22246–22254 | `instance-setup` (K69) | the fact `producingGroup` |
| `index.mjs`: the op lists, classes and stamps of these ops (`EDGE_ACTIONS`, `STATE_ACTIONS`, `STRUCTURE_ACTIONS`, `POSITIONAL_ACTS`: 1517, 1551, 1596, 1820; OPS rows 397, 442, 453, 549; `NEEDS` 2211, 2255, 2281, 2544) | index.mjs | `control-plane` | routing, authentication and stamps (K3) |

## 3. Callers to rewire

Each calls moved code or reads a moved table today, and calls `inquiryOf(ctx)` after.

- `earnedBasisRegistry`: `cite` (12049; `citation`, next in the order), legacy-store's `registerLegGrades` for `retrieval` (758; `#legEarnedCapture` is already `retrieval`'s, K75 (2)), `auditPass`'s context (13906), `gateFacts` (23143), `#reevalLegsEarned` (20995), `#captureBoundsFor` (21587), `#versionLegsEarned` (25716), `#versionLegsAsMembers` (26196).
- `#capturedAt`: 759, 20999, `#strengthWalk` (21696), 25719.
- `basisFor`: `#captureBoundsFor` (21579), `#strengthWalk` (21628). `#basisCyclePath`: `#moveVersionState` (27017).
- `#restsOnLive`: `affordanceFacts` (1573), `#reevalRaisedBy` (2885). (`#retiredNotCitable`'s callers are in `citation`'s map.) `supersededByOf`: `#reevalMoved` (21027). `#writeSupersededBy`: `#migrate`'s backfill (1240).
- `#subjectEntityOf`: `auditPass` (13906), `gateFacts` (23143), `versionStrength` (26433).
- Direct SQL on `inquiry_basis`: `#searchedForCase` (7864), the contradiction readers (12613–12953), `auditPass` (13905), `testimonyReach` (15842), `extractProposals` (16529), `#queueAncestorEdges` (17345), `#leadBasisAbsence` (17934), `reevaluations` (20819, 20833), `gateFacts` (23127, 23144), `versionNotice` (25484), `partitionIndependence` (26672); `query.mjs`'s `legs:` field (103, reading `inquiry_basis_count`) and `leg:` arm. On `inquiry_exclusions`: `excludedBy` (25041). On `inquiry_migration_replays`: `#surfacedIn` (1430). Proposed: state `inquiry_basis(bundle_id, ord, target_id, target_type, role, grade, grade_axis, grade_source, ground, content_id)` as a read contract (as record-core R37 does), the owner's writes only.

## 4. Old-battery tests that anchor on the moved source

Negative controls and pins that read or patch the text of moved code, so they move or re-anchor (a `legacy-tests` entry, K53): `nc-mk4.mjs`, `nc-rec84.mjs`, `nc-rec97.mjs` (the leg grammar, `leadLegFindings`; `nc-rec97`'s dispatch and extent-region arms are `citation`'s), `nc-rec83.mjs`, `nc-rec114.mjs`, `nc-rec116.mjs` (`ensureLegContent`, `#capturedAt`, `dispose`), `nc-m040.mjs`, `nc-rec88.mjs`, `nc-sk7.mjs` (the earned registry), `d280-strengthbar.control.mjs`, `founder-sight.control.mjs` (`restingOn`, `dispose`), `machinefences-dec49.test.mjs` (the DEC-49 regions of `divide`, `groundInquiry`, `dispose`), `hygiene.test.mjs` (purge tables), `identity-claims.test.mjs` (stamped authorship of dispose, divide, ground). `nc-rec72.mjs`, `rec-183-reinstate-retired.control.mjs`, `project-sight.control.mjs` and the cite arms of the others are `citation`'s. The setup page embeds `deriveInquiryTitle`'s source verbatim (its comment), so a pin reads it where it lands. Suites that drive the behaviour through the plane and follow the module: `basis`, `disposition`, `inquiry`, `grounds`, `caselifecycle` (divide), `rec114-leg-earned`, `strength` (the earned arms), `derivation-bounds`, `selection`'s dispose arm; `cite`, `citeinquiry`, `edges`, `severedhomes` follow `citation`.

## 5. Undetermined, conflicts, and code others could claim

1. **Size, and the split (P6). Settled by K83 (2), applied by N55.** 5,690 lines, past 4,000. Taken: `citation`, next after `inquiry` in layer 6, takes `cite`, `sever`, `reinstate`, `#edgeTransition`, their splices and rows (C-33.15–C-33.19, C-33.39, C-45.7–C-45.10): measured at the split as about 1,480 lines (680 code) with `#retiredNotCitable`, the `CITE_*` constants and the rows, leaving about 4,320 (1,940 code), still past 4,000: K74's case. `citation` uses `inquiry` (`earned`, `checkLegExtentGrammar`, `BASIS_ROLES`), `retrieval` (selections), `membership`, `promotion` and `content`. Read as BOB's under P17 (K70, K73 (7): a split for P6, no capability added or removed).
2. **The earned registry is placed here, not in `strength`** (settled by K83 (3)) (where the progressions map and this draft's brief placed it). It is needed by the leg grammar at every write (R6, `checkEarnedLeg`), by `cite`'s fill (`citation` R2), by `divide` and `ground`'s pre-flight, by `basis-versions` (R10) and by `strength`; here it needs no registration. In `strength` it needs one `inquiry` offers and `strength` fills, and `inquiry` refuses an earned leg while it is unfilled (never reads it as not earned). Its reads are `entities.strongestByCapture`, the `register` contract (provenance R48), `readings` and `reading_text_source` (extraction's read contract), `text-chain.captureBound`, `content.standings`, `connections.portionGrades`. 
3. **Facts from later modules** (settled by K83 (5), N56). `dispose`, `divide`, `ground` and `#restsOnLive` ask `caseMember`; the leg grammar asks `publishedRegistry`; `divide` asks `producingGroup`. `promotion` offers `fact(name, …args)` now (promotion/index.mjs 210); legacy-store registers `producingGroup` and `caseMember` (store.mjs 779–780), and `publishedRegistry` is not registered yet (legacy-store computes it privately, `publishedRegistryFor`, 25068–25135). Proposed: `promotion` offers `fact(name, …args)`, answering `FACT_UNAVAILABLE` when unprovided (its R40's rule), so a fact is registered once for every earlier reader; otherwise this module offers its own registrations for each.
4. **Old-plan rows** (re-targeted by K83 (4): REC-202 to `queue`, D-572 to `ai-runs`, D-592 to `promotion`). REC-202 (a member takes up or sets aside at the inquiry's grain) is built on `land/worker/REC-202` @ 1716321d in `queue`'s findings producer (`#findingsOutOfInquiryLead`, `options_grain`): the acts exist (`op=cite`'s inquiry arm, `op=proposedispose`); proposed target `queue`. D-572 (a level-empty candidate per named question) is `ai-runs`' `op=suggest` and `observation-log`'s look; proposed target `ai-runs`. D-592 (who reopened) is R19 here, read from the state history `promotion`'s `reopen` writes. MK-5 is R31, not yet met: it waits on `publication` defining the opinion element's id.
5. **Uses** (applied by K83 (1)). `modules.json` gave `inquiry` `bias`, which nothing here calls (HUNCH debt is refused at publication, `publication`'s). The moved code calls `promotion`, `entities`, `provenance`, `extraction`, `text-chain` and `observation-log` (Private/Uses). Proposed: add those six, drop `bias`.
6. **Found by this reading, not yet met.** `dispose` promotes members one at a time and `divide` the parent before its children, so a late refusal leaves a partial act (R22, R26). Whether several promotions can share one `record-core.transact` is the job's to state, through BOB.
7. **Other claimants.** `citation` (§5.1; its map). `strength`: the earned registry (§5.2). `publication`: `excludedBy`, the case facts, `checkPublishedExtension`. `reevaluation`: the obligation. `ai-runs`: surfacing. `affordances`: the three joined-project predicates and `DISPOSITIONS`' home. `connections`: `#retirementCitedBy`, `citesInto`, the `refs` rewrite. `promotion`: `reopen`.
