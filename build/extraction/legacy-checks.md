# Extraction map: legacy-checks (the old catalogue, `bio-plane/checks/bio-checks.mjs`)

**Status** · DRAFT by a worker for BOB #73, 2026-09-30, on `tranche/T17` after N372 (K575); K578. The plan to empty and retire the catalogue (Bob, 2026-09-30: finish the legacy conversions). BOB turns it into tranche entries from T18.

# legacy-checks extraction map

For BOB #73 (T17), by a read-only worker, 2026-09-30. Measured on `tranche/T17` @ `0f1b0c256c`, which already carries N372 (LEGACY-CHECKS #11, `cce4d99e29`): `bio-plane/checks/bio-checks.mjs` is **10,659 lines, 170 exports, 51 private top-level declarations**. The N372 block (`checkPublishedExtension` and the C-41 case-document gate, 12 exports, 826 lines) is gone and is not in this map.

`build/extraction/legacy-checks.md` does not exist, so there was nothing to reconcile. This map was checked against the requirement files' "Each check moves here" invariants (K6), the `where` of every row, and the rulings that kept code in the catalogue (K72 (1)/(5), K138, K145, K181 (1)). Its only other inventory is `build/plan/legacy-inventory.tsv`, which is about test files.

**How it was measured.** Top-level declarations were parsed, each with the comment block above it, so line ranges cover comments. Importers were collected by parsing every static, namespace and dynamic `import` of the catalogue across the whole repository (496 files; `dist/` and `release/` bundles left out) and mapping each file to its module through the `paths` and `tests` in `modules.json`. **Importers** lists the product modules that import the export by name. The bracket after it gives the test modules that import it (not `legacy-tests`), how many `legacy-tests` suites import it, and `ns` for a `*_CHECKS` family. `ns` means the family is also read as part of the whole namespace, by control-plane's `dec49Row` (`src/control-plane/index.mjs`:799), by skills' `machineFences`/`renderPack` through `agent-worker/src/index.mjs`:385, and by 19 test files. **Owner** is the module that should hold the export. `shared:X` means many modules use it and X is the proposed holder. `split` means its rows go to more than one owner. `unowned` means no requirement names an owner. `dead` means no product importer, with the reason given.

**Proposed new module, `record-grammar` (layer 1, at the head of the order).** This is the shared core: the id and type grammar, the front-matter parser, `STATES` and `HEADINGS`, actor identity and the machine-work labels, the grade vocabulary, the digests, and `checkBundle`'s structural arms (C-1, C-2.1–.6, C-3.1, C-4, C-5, C-6.2/.3, C-12–C-14, C-16, C-17.1). Why a new module and not an existing one: `text-chain` and `ocr-worker` (layer 1) read `isMachineIdentity`, `BASIS_GRADES` and `EARNED_CAPTURE_CEILING`, and both `record-core` (auditPass, R18) and `promotion` (gate, R27) run `checkBundle`, so the holder must come before all of them. `record-core`'s Purpose (storage) and `promotion`'s ("it does not decide what a document must say to be true; the catalogue states that") both exclude it. The helper-module precedent is `test-support` and `bundler` (layers.md, BOB #38). The cheapest path is a rename: move every owned part out first, and what is left of `bio-checks.mjs` becomes `record-grammar`, with requirements and tests (P2). Its importers are then re-pointed once.

## 1. The map

| export | lines | kind | importers | owner | note |
|---|---|---|---|---|---|
| `BUNDLE_ID_RE` | 1–28 (28) | constant (id grammar) | actions, connections, inquiry, ratification, strength, tasks, legacy-store (tests: escalation, observation-log; legacy-tests 5) | shared:record-grammar |  |
| `ANN_ID_RE` | 29–29 (1) | constant (id grammar) | — | shared:record-grammar |  |
| `FILENAME_RE` | 30–30 (1) | constant (id grammar) | — | shared:record-grammar |  |
| `ISO_TS_RE` | 31–31 (1) | constant (id grammar) | monitoring, ratification, reevaluation, tasks | shared:record-grammar |  |
| `OBJECT_TYPES` | 33–49 (17) | constant/helper (type vocabulary) | actions, ai-runs, basis-versions, case-authoring, citation, content, inquiry, run-productions, strength, legacy-store (tests: agent-worker, citation, promotion; legacy-tests 4) | shared:record-grammar |  |
| `LEGACY_TYPE_ALIASES` | 50–50 (1) | constant/helper (type vocabulary) | basis-versions, legacy-store (legacy-tests 2) | shared:record-grammar |  |
| `normalizeType` | 51–51 (1) | constant/helper (type vocabulary) | actions, affordances, ai-runs, basis-versions, bias, capture-requests, case-authoring, citation, conformance, consequences, content, control-plane, inquiry, intent, promotion, publication, query-language, queue, queue-producers, ratification, reevaluation, retrieval, run-productions, standards, strength, legacy-store (tests: affordances, promotion, query-language; legacy-tests 6) | shared:record-grammar |  |
| `INQUIRY_TITLE_MAX` | 53–64 (12) | helper | inquiry | inquiry | inquiry R10; promotion (layer 2) calls both at the write (R9 title) |
| `deriveInquiryTitle` | 65–74 (10) | helper | conformance, inquiry, instance-setup, intent, promotion, legacy-store (tests: instance-setup; legacy-tests 1) | inquiry | inquiry R10; promotion (layer 2) calls both at the write (R9 title) |
| `inquiryQuestionOf` | 75–82 (8) | helper | inquiry, promotion, legacy-store | inquiry | inquiry R10; promotion (layer 2) calls both at the write (R9 title) |
| `CORE_FIELDS` | 84–89 (6) | constant (document grammar) | — | shared:record-grammar |  |
| `FORBIDDEN_ALIASES` | 91–95 (5) | constant (document grammar) | — | shared:record-grammar |  |
| `HEADINGS` | 97–141 (45) | constant (document grammar) | instance-setup (tests: instance-setup; legacy-tests 4) | shared:record-grammar |  |
| `HEADINGS_WHEN` | 143–171 (29) | constant (document grammar) | — | shared:record-grammar |  |
| `caseEditionClaimed` | 173–245 (73) | constant/helper | — (tests: ratification) | dead | ratification holds its own; only ratification's parity test and legacy suites import the catalogue copy |
| `isCaseMemberBytes` | 246–265 (20) | helper | — (tests: ratification) | shared:record-grammar | C-3.1 heading rule (core); ratification keeps its own copy (ratification R-notes 6) |
| `vocabFor` | 267–278 (12) | constant (document grammar) | actions, affordances, basis-versions, inquiry, promotion, queue, queue-producers (tests: affordances, promotion; legacy-tests 1) | shared:record-grammar |  |
| `STATES` | 280–558 (279) | constant (document grammar) | actions, affordances, basis-versions, inquiry, instance-setup, promotion, queue, queue-producers, legacy-store (tests: affordances, citation, escalation, instance-setup, promotion; legacy-tests 17) | shared:record-grammar |  |
| `ACTION_KINDS` | 560–572 (13) | constant/helper | actions (tests: affordances) | actions | actions R38, R40 (D-149 laws stay actions', standards intro) |
| `RISK_TIERS` | 574–591 (18) | constant/helper | actions (legacy-tests 1) | actions | actions R38, R40 (D-149 laws stay actions', standards intro) |
| `riskTierState` | 592–599 (8) | constant/helper | actions | actions | actions R38, R40 (D-149 laws stay actions', standards intro) |
| `LAW_LEVELS` | 602–613 (12) | constant | — | dead | actions reads jurisdictions' LAW_LEVELS (actions line 113); no importer |
| `LAW_PROPOSAL_STATES` | 615–653 (39) | shared helper (machine-work label) | — (legacy-tests 2) | shared:record-grammar | one composer for standards, conformance, actions, filings (K171); actions does not use standards, so it cannot live in standards |
| `lawProposalState` | 655–663 (9) | shared helper (machine-work label) | — | shared:record-grammar | one composer for standards, conformance, actions, filings (K171); actions does not use standards, so it cannot live in standards |
| `PROPOSAL_STATES` | 665–708 (44) | shared helper (machine-work label) | — | shared:record-grammar | one composer for standards, conformance, actions, filings (K171); actions does not use standards, so it cannot live in standards |
| `proposalLabel` | 710–723 (14) | shared helper (machine-work label) | actions, conformance, filings, standards (tests: conformance, standards) | shared:record-grammar | one composer for standards, conformance, actions, filings (K171); actions does not use standards, so it cannot live in standards |
| `lawProposalLabel` | 725–728 (4) | constant/helper | actions, legacy-store (legacy-tests 1) | actions | actions R38, R40 (D-149 laws stay actions', standards intro) |
| `ACTION_BASIS_KINDS` | 731–734 (4) | constant/helper | actions | actions | actions R38, R40 (D-149 laws stay actions', standards intro) |
| `CORRESPONDENCE_DIRECTIONS` | 736–740 (5) | constant/helper | actions | actions | actions R38, R40 (D-149 laws stay actions', standards intro) |
| `RESOLUTIONS` | 742–767 (26) | constant/helper | actions | actions | actions R38, R40 (D-149 laws stay actions', standards intro) |
| `RFC_RESPONSE_WINDOW_PRECEDENT` | 769–780 (12) | constant/helper | — (legacy-tests 1) | actions | actions R38, R40 (D-149 laws stay actions', standards intro) |
| `f` *(private)* | 788–839 (52) | shared helper | — | shared:record-grammar |  |
| `parseFrontmatter` | 876–974 (99) | shared helper | actions, affordances, basis-versions, bias, case-authoring, citation, connections, contradiction, control-plane, escalation, filings, inquiry, intent, monitoring, promotion, provenance, publication, query-language, ratification, reevaluation, retrieval, run-productions, strength, legacy-store (tests: actions, case-authoring, citation, conformance, contradiction, escalation, inquiry, intent, monitoring, promotion, provenance, publication, ratification, reevaluation, standards; legacy-tests 60) | shared:record-grammar |  |
| `checkIdentity` *(private)* | 997–1045 (49) | check function (private) C-1 | — | shared:record-grammar | structural arms of checkBundle |
| `checkFrontmatterContract` *(private)* | 1047–1080 (34) | check function (private) C-2 | — | shared:record-grammar | structural arms of checkBundle |
| `checkHeadings` *(private)* | 1082–1109 (28) | check function (private) C-3 | — | shared:record-grammar | structural arms of checkBundle |
| `checkStateLegality` *(private)* | 1111–1138 (28) | check function (private) C-2/C-4 | — | shared:record-grammar | structural arms of checkBundle |
| `checkFormatHygiene` *(private)* | 1162–1193 (32) | check function (private) C-14 | — | shared:record-grammar | structural arms of checkBundle |
| `checkQueueAndBase` *(private)* | 1195–1291 (97) | check function (private) C-16/C-17 | — | shared:record-grammar | structural arms of checkBundle |
| `canonicalJson` | 1294–1305 (12) | shared helper | content, contradiction, promotion, run-productions, legacy-store (tests: contradiction; legacy-tests 1) | shared:record-grammar |  |
| `MONITOR_FREQ` | 1311–1316 (6) | check function (private) / constant | monitoring (tests: monitoring; legacy-tests 1) | capture | C-2.7 information grammar: no requirement names an owner; capture writes information bundles; monitoring reads MONITOR_FREQ |
| `checkInformationExtension` *(private)* | 1319–1378 (60) | check function (private) / constant C-2 | — | capture | C-2.7 information grammar: no requirement names an owner; capture writes information bundles; monitoring reads MONITOR_FREQ |
| `REL_VOCAB` *(private)* | 1380–1410 (31) | check function (private) | — | shared:record-grammar | C-6.2/C-6.3 core reference check; its C-6.1 arms call inquiry's supersedes/division findings and actions' responds_to arm |
| `sectionText` | 1417–1427 (11) | shared helper | publication | shared:record-grammar |  |
| `NON_MEMBER_AUTHORS` | 1429–1442 (14) | shared helper (actor identity) | — (legacy-tests 2) | shared:record-grammar | membership is the semantic owner but text-chain (layer 1) calls isMachineIdentity |
| `ACTOR_CLASSES` | 1443–1449 (7) | shared helper (actor identity) | provenance (legacy-tests 2) | shared:record-grammar | membership is the semantic owner but text-chain (layer 1) calls isMachineIdentity |
| `MACHINE_AUTHOR_PREFIX` | 1451–1494 (44) | shared helper (actor identity) | bias, capture-requests, control-plane, queue-producers, legacy-index, legacy-store (legacy-tests 4) | shared:record-grammar | membership is the semantic owner but text-chain (layer 1) calls isMachineIdentity |
| `MACHINE_CLASS_PREFIX` | 1495–1497 (3) | shared helper (actor identity) | connections, consequences, control-plane, filings, membership, query-language, queue-producers, ratification, reevaluation, run-productions, legacy-index (tests: ai-runs, membership; legacy-tests 5) | shared:record-grammar | membership is the semantic owner but text-chain (layer 1) calls isMachineIdentity |
| `MACHINE_STAMP_PREFIXES` | 1498–1500 (3) | shared helper (actor identity) | — (legacy-tests 3) | shared:record-grammar | membership is the semantic owner but text-chain (layer 1) calls isMachineIdentity |
| `isMachineStamp` | 1502–1509 (8) | shared helper (actor identity) | bias, tasks (legacy-tests 5) | shared:record-grammar | membership is the semantic owner but text-chain (layer 1) calls isMachineIdentity |
| `isMachineIdentity` | 1511–1517 (7) | shared helper (actor identity) | actions, affordances, basis-versions, case-authoring, conformance, connections, consequences, content, contradiction, escalation, filings, inquiry, intent, membership, observation-log, promotion, provenance, publication, queue, ratification, reevaluation, review, run-productions, sources, standards, strength, text-chain, legacy-store (legacy-tests 9) | shared:record-grammar | membership is the semantic owner but text-chain (layer 1) calls isMachineIdentity |
| `SUFFICIENCY_UNCLAIMED` | 1519–1596 (78) | constant/helper | basis-versions, run-productions (tests: basis-versions, run-productions; legacy-tests 4) | basis-versions | conclusion sufficiency claim; affordances publishes SUFFICIENCY_CLAIM_STATES |
| `SUFFICIENCY_CLAIM_STATES` | 1598–1614 (17) | constant/helper | affordances (tests: affordances; legacy-tests 2) | basis-versions | conclusion sufficiency claim; affordances publishes SUFFICIENCY_CLAIM_STATES |
| `sufficiencyClaimState` | 1616–1636 (21) | constant/helper | — (legacy-tests 2) | basis-versions | conclusion sufficiency claim; affordances publishes SUFFICIENCY_CLAIM_STATES |
| `isSufficiencyClaimed` | 1638–1644 (7) | constant/helper | — (legacy-tests 3) | basis-versions | conclusion sufficiency claim; affordances publishes SUFFICIENCY_CLAIM_STATES |
| `isSufficiencyUnclaimed` | 1646–1651 (6) | constant/helper | — (legacy-tests 2) | basis-versions | conclusion sufficiency claim; affordances publishes SUFFICIENCY_CLAIM_STATES |
| `CONTENT_MINTED_BY_PLANE` | 1653–1697 (45) | shared helper (machine-work label) | content, legacy-store (legacy-tests 2) | shared:record-grammar | read by extraction, content, observation-log; extraction is earlier than content |
| `CONTENT_MINT_STATES` | 1699–1721 (23) | shared helper (machine-work label) | content, legacy-store (legacy-tests 2) | shared:record-grammar | read by extraction, content, observation-log; extraction is earlier than content |
| `contentMintState` | 1723–1748 (26) | shared helper (machine-work label) | content, extraction, observation-log, legacy-store (legacy-tests 1) | shared:record-grammar | read by extraction, content, observation-log; extraction is earlier than content |
| `isMachineMinted` | 1750–1755 (6) | shared helper (machine-work label) | — (legacy-tests 1) | shared:record-grammar | read by extraction, content, observation-log; extraction is earlier than content |
| `checkAppendOnly` *(private)* | 1762–1808 (47) | check function (private) C-5 | — | shared:record-grammar | structural arms of checkBundle |
| `checkReferences` *(private)* | 1810–1864 (55) | check function (private) C-6 | — | shared:record-grammar | C-6.2/C-6.3 core reference check; its C-6.1 arms call inquiry's supersedes/division findings and actions' responds_to arm |
| `supersedesEdgeFindings` | 1866–1898 (33) | check function C-6 | inquiry, legacy-store | inquiry | C-6.1 supersession/division arms (inquiry R38); called by core checkReferences |
| `divisionDisclosureFindings` | 1901–1967 (67) | check function C-6 | inquiry, legacy-store | inquiry | C-6.1 supersession/division arms (inquiry R38); called by core checkReferences |
| `checkHistoryCoherence` *(private)* | 1969–2101 (133) | check function (private) C-12 | — | shared:record-grammar | structural arms of checkBundle |
| `checkInquiryExtension` *(private)* | 2131–2294 (164) | check function (private) C-2 | — | inquiry | C-2.8 grammar (inquiry R2, R3, R38); held here by K181 (1) |
| `checkDividedExtension` *(private)* | 2296–2404 (109) | check function (private) C-2 | — | inquiry | C-2.8 grammar (inquiry R2, R3, R38); held here by K181 (1) |
| `SUBJECT_POSITIONS` | 2406–2412 (7) | constant/helper | legacy-store (tests: ratification; legacy-tests 1) | dead | ratification holds its own; only ratification's parity test and legacy suites import the catalogue copy |
| `STRENGTH_STATES` | 2413–2413 (1) | constant | ratification (legacy-tests 1) | strength | strength names it; ratification checks.mjs reads it |
| `CASE_MEMBER_ROLES` | 2415–2426 (12) | constant | — | dead | ratification holds its own; its only reader (checkCaseDocument) left in N372 |
| `BASIS_ROLES` | 2428–2499 (72) | constant (grade vocabulary) | inquiry, query-language, skills (tests: query-language; legacy-tests 3) | shared:record-grammar | text-chain and ocr-worker (layer 1) read BASIS_GRADES/EARNED_CAPTURE_CEILING |
| `BASIS_GRADES` | 2500–2500 (1) | constant (grade vocabulary) | calibration, case-authoring, consequences, entities, extraction, inquiry, intent, provenance, ratification, strength, text-chain, legacy-store (tests: affordances, calibration, entities, ocr-worker, provenance, text-chain; legacy-tests 8) | shared:record-grammar | text-chain and ocr-worker (layer 1) read BASIS_GRADES/EARNED_CAPTURE_CEILING |
| `GRADE_AXES` | 2501–2512 (12) | constant (grade vocabulary) | query-language, ratification (tests: query-language; legacy-tests 4) | shared:record-grammar | text-chain and ocr-worker (layer 1) read BASIS_GRADES/EARNED_CAPTURE_CEILING |
| `TESTIMONY_GRADE` | 2513–2520 (8) | constant (grade vocabulary) | inquiry, provenance, strength, legacy-store (tests: inquiry, provenance; legacy-tests 1) | shared:record-grammar | text-chain and ocr-worker (layer 1) read BASIS_GRADES/EARNED_CAPTURE_CEILING |
| `GRADE_SOURCES` | 2521–2535 (15) | constant (grade vocabulary) | query-language (tests: query-language; legacy-tests 3) | shared:record-grammar | text-chain and ocr-worker (layer 1) read BASIS_GRADES/EARNED_CAPTURE_CEILING |
| `EARNED_GRADE_SOURCES` | 2537–2541 (5) | constant (grade vocabulary) | skills | shared:record-grammar | text-chain and ocr-worker (layer 1) read BASIS_GRADES/EARNED_CAPTURE_CEILING |
| `EARNED_CAPTURE_CEILING` | 2543–2582 (40) | constant (grade vocabulary) | affordances, capture, inquiry, provenance, text-chain, legacy-store (tests: affordances, capture, inquiry, provenance, text-chain; legacy-tests 15) | shared:record-grammar | text-chain and ocr-worker (layer 1) read BASIS_GRADES/EARNED_CAPTURE_CEILING |
| `UNREACHABLE_CAPTURE_GRADE` | 2583–2584 (2) | constant (grade vocabulary) | affordances, capture, inquiry, legacy-store (tests: affordances, capture; legacy-tests 6) | shared:record-grammar | text-chain and ocr-worker (layer 1) read BASIS_GRADES/EARNED_CAPTURE_CEILING |
| `EARNED_SOURCE_AXIS` | 2585–2589 (5) | constant | — | inquiry |  |
| `GROUND_LABEL_RE` | 2591–2596 (6) | constant | inquiry, reevaluation | inquiry |  |
| `checkLegExtentGrammar` | 2598–2694 (97) | check function | basis-versions, inquiry, legacy-store (legacy-tests 1) | inquiry | inquiry R38; face `inquiry/grammar.mjs`; checkInquiryBasis calls basis-versions' basisVersionFindings (later module) |
| `checkInquiryBasis` | 2696–2893 (198) | check function C-2/C-6 | inquiry, legacy-store (legacy-tests 3) | inquiry | inquiry R38; face `inquiry/grammar.mjs`; checkInquiryBasis calls basis-versions' basisVersionFindings (later module) |
| `checkGrounds` *(private)* | 2895–3041 (147) | check function (private) C-2 | — | inquiry | C-2.8 grammar (inquiry R2, R3, R38); held here by K181 (1) |
| `checkTestimonyLeg` *(private)* | 3043–3184 (142) | check function (private) C-2 | — | inquiry | C-2.8 grammar (inquiry R2, R3, R38); held here by K181 (1) |
| `checkEarnedLeg` *(private)* | 3186–3315 (130) | check function (private) C-2 | — | inquiry | C-2.8 grammar (inquiry R2, R3, R38); held here by K181 (1) |
| `checkInheritedLeg` *(private)* | 3317–3399 (83) | check function (private) C-2/C-21 | — | inquiry | C-2.8 grammar (inquiry R2, R3, R38); held here by K181 (1) |
| `checkProjectExtension` *(private)* | 3401–3440 (40) | check function (private) C-2/C-9 | — | unowned | C-2.9 workproduct_state/evaluations/closed_reason arms and C-9.1 readiness ladder; the objective arm already left for intent (K198). intent.md: "stay in legacy-checks for their owner", none named. Candidate: publication (projectStage, N300) |
| `CHECK_RETIREMENTS` | 3442–3614 (173) | constant (census) | — (legacy-tests 2) | promotion | retired ids C-7.1, C-8.1; census data for R50; test-only today |
| `actionBasisFindings` | 3617–3695 (79) | check function C-2 | actions (legacy-tests 2) | actions | C-2.10 arms (actions R38) |
| `correspondenceFindings` | 3697–3776 (80) | check function C-2 | actions | actions | C-2.10 arms (actions R38) |
| `QUOTE_KEYS` | 3778–3809 (32) | constant | actions | actions | C-94 vocabularies |
| `isQuoteEntry` | 3812–3815 (4) | check function | actions | actions | C-2.10 arms (actions R38) |
| `quoteValue` | 3816–3819 (4) | check function | actions | actions | C-2.10 arms (actions R38) |
| `quoteFindings` | 3820–3860 (41) | check function | actions | actions | C-2.10 arms (actions R38) |
| `CORRESPONDENCE_STAGES` | 3862–3900 (39) | constant | actions | actions | C-94 vocabularies |
| `CORRESPONDENCE_OUTCOMES` | 3901–3901 (1) | constant | actions | actions | C-94 vocabularies |
| `DECISION_STAGES` | 3902–3902 (1) | constant | actions | actions | C-94 vocabularies |
| `LIFECYCLE_KEYS` | 3903–3903 (1) | constant | actions | actions | C-94 vocabularies |
| `lifecycleFindings` | 3904–3973 (70) | check function | actions | actions | C-2.10 arms (actions R38) |
| `isPublicHttpsLocator` | 3976–4001 (26) | shared helper | capture, capture-requests, monitoring, provenance, ratification, tasks (tests: agent-worker; legacy-tests 5) | shared:record-grammar | earliest user provenance (layer 3); subresources would also fit |
| `b64ToBytes` | 4018–4032 (15) | shared helper (digest) | — | shared:record-grammar | two SHA-256 implementations (createSha256, sha256HexSync): consolidate on the move |
| `createSha256` | 4034–4129 (96) | shared helper (digest) | actions, basis-versions, bias, capture, capture-requests, case-authoring, citation, control-plane, inquiry, monitoring, provenance, publication, record-core, legacy-store (legacy-tests 1) | shared:record-grammar | two SHA-256 implementations (createSha256, sha256HexSync): consolidate on the move |
| `checkInfo2Contract` *(private)* | 4139–4200 (62) | check function (private) C-18 | — | promotion | C-18.6/C-18.7, run by the gate before the transaction (K49, K72 (4)) |
| `MECHANICAL_FIELD_SETS` | 4202–4225 (24) | constant/helper | promotion, legacy-store (tests: monitoring; legacy-tests 1) | promotion | promotion R8, R13 (K69); name key goes with fork (membership map) |
| `projectNameKey` | 4226–4249 (24) | constant/helper | promotion, legacy-store (tests: promotion; legacy-tests 1) | promotion | promotion R8, R13 (K69); name key goes with fork (membership map) |
| `checkProjectNameUniqueness` | 4251–4323 (73) | check function C-77 | — (legacy-tests 1) | promotion | C-77: no product caller; only d50 legacy suite |
| `checkBundle` | 4325–4451 (127) | check function (catalogue entry) C-13 | inquiry, promotion, record-core, legacy-store (tests: intent, promotion, provenance, ratification, record-core, reevaluation; legacy-tests 41) | shared:record-grammar | run by record-core auditPass (R18) and promotion gate (R27); keeps the structural arms and gains a per-type registration seam so the inquiry, information, project and info2 arms leave |
| `AI_RUN_CHECKS` | 4453–4763 (311) | row data C-22 | ai-runs, observation-log (tests: observation-log; legacy-tests 1; ns) | observation-log | C-22.1-.4/.6/.9/.10/.17 (observation-log R26); every `where` already names observation-log |
| `VERSION_CHAIN_CHECKS` | 4765–4822 (58) | row data C-24 | provenance, legacy-store (legacy-tests 1; ns) | provenance | C-24, C-34, C-89, C-103, C-53.1-.9/.13 (provenance Suggestions); K72 (5) kept them in the catalogue: needs a new ruling |
| `BASIS_VERSION_CHECKS` | 4824–5087 (264) | row data C-25 | basis-versions, skills, legacy-store (tests: agent-worker; legacy-tests 5; ns) | basis-versions | C-25, C-50 (basis-versions R35) |
| `VERSION_STATES` | 5089–5091 (3) | constant/helper | basis-versions, strength (legacy-tests 3) | basis-versions | run-productions: "SUGGEST_KINDS until basis-versions holds it" |
| `VERSION_MACHINE` | 5093–5141 (49) | constant/helper | basis-versions, strength, legacy-store (tests: affordances; legacy-tests 3) | basis-versions | run-productions: "SUGGEST_KINDS until basis-versions holds it" |
| `VERSION_REASON_REQUIRED` | 5143–5163 (21) | constant/helper | basis-versions (legacy-tests 2) | basis-versions | run-productions: "SUGGEST_KINDS until basis-versions holds it" |
| `versionNeedsReason` | 5164–5164 (1) | constant/helper | basis-versions, legacy-store (legacy-tests 2) | basis-versions | run-productions: "SUGGEST_KINDS until basis-versions holds it" |
| `VERSION_ACT_CHECKS` | 5166–5356 (191) | row data C-25 | basis-versions, legacy-store (legacy-tests 4; ns) | basis-versions | C-25, C-50 (basis-versions R35) |
| `VERSION_RELATIONSHIPS` | 5357–5362 (6) | constant/helper | basis-versions (legacy-tests 1) | basis-versions | run-productions: "SUGGEST_KINDS until basis-versions holds it" |
| `VERSION_NAME_RE` | 5363–5365 (3) | constant/helper | basis-versions, reevaluation, legacy-store (tests: agent-worker) | basis-versions | run-productions: "SUGGEST_KINDS until basis-versions holds it" |
| `basisVersionFindings` | 5367–5751 (385) | check function | basis-versions, legacy-store (tests: promotion; legacy-tests 5) | basis-versions | C-25.1-.19, C-27.15; called from inquiry's checkInquiryBasis (earlier module) |
| `SUGGEST_KINDS` | 5753–5795 (43) | constant/helper | basis-versions, run-productions (tests: agent-worker; legacy-tests 1) | basis-versions | run-productions: "SUGGEST_KINDS until basis-versions holds it" |
| `SUGGEST_LEVELS` | 5797–5800 (4) | constant / row data | run-productions (tests: agent-worker; legacy-tests 1) | run-productions | C-104 (K163) |
| `BOILERPLATE_FORMS` | 5802–5826 (25) | helper | — (tests: agent-worker; legacy-tests 1) | basis-versions | earliest caller basis-versions; run-productions reads it through basis-versions |
| `isBoilerplate` | 5827–5839 (13) | helper | basis-versions, run-productions, legacy-store (tests: agent-worker; legacy-tests 1) | basis-versions | earliest caller basis-versions; run-productions reads it through basis-versions |
| `SUGGEST_CHECKS` | 5841–6053 (213) | row data C-27 | basis-versions, run-productions, legacy-store (tests: agent-worker, basis-versions, run-productions; legacy-tests 1; ns) | split | C-27.1-.14/.16-.19 run-productions (R16); C-27.15 basis-versions (R35) |
| `EXTRACT_PROPOSE_CHECKS` | 6055–6155 (101) | constant / row data | run-productions (tests: run-productions; ns) | run-productions | C-104 (K163) |
| `BIAS_CHECKS` | 6157–6197 (41) | row data C-26 | bias, promotion (tests: bias, promotion; ns) | promotion | C-26.12 raised only by promotion R15 (`where` promotion); bias R29 claims C-26.1-.19: reword it |
| `CAPTURE_PURPOSES` | 6199–6248 (50) | constant/helper | capture-requests (legacy-tests 1) | capture-requests | capture-requests conduct (C-28) |
| `CAPTURE_UA_MODES` | 6250–6256 (7) | constant/helper | capture-requests (legacy-tests 1) | capture-requests | capture-requests conduct (C-28) |
| `userAgentIsLegible` | 6258–6268 (11) | constant/helper | capture-requests (tests: capture-requests; legacy-tests 1) | capture-requests | capture-requests conduct (C-28) |
| `CIVICOS_CONTACT_URL` | 6270–6286 (17) | helper | — | capture | capture is the earliest caller (then capture-requests, monitoring, instance-setup) |
| `civicosUserAgent` | 6287–6289 (3) | helper | capture, capture-requests, instance-setup, monitoring (tests: capture-requests; legacy-tests 1) | capture | capture is the earliest caller (then capture-requests, monitoring, instance-setup) |
| `CAPTURE_REQUEST_CHECKS` | 6291–6509 (219) | row data C-28 | capture, capture-requests (tests: agent-worker, capture, capture-requests; legacy-tests 3; ns) | split | C-28.13 capture (`where` capture, capture is earlier); the other 15 capture-requests |
| `AI_CREDENTIAL_CHECKS` | 6511–6626 (116) | row data C-29 | membership, legacy-store (tests: membership; legacy-tests 3; ns) | membership | C-29, C-55, C-63, C-96.2-.12, C-56, C-70, C-95, C-57 (membership Uses: translations "until those checks move") |
| `MACHINE_FENCE_CHECKS` | 6628–6752 (125) | row data C-32 | case-authoring, inquiry, promotion, skills (tests: basis-versions, case-authoring, review; legacy-tests 6; ns) | split | C-32.2 basis-versions; C-32.5 promotion; C-32.6 case-authoring; C-32.7/.8 inquiry; C-32.1 unowned (op=release, N400) |
| `ACT_SHAPE_CHECKS` | 6755–7053 (299) | row data C-33/C-67 | entities, inquiry, progressions, promotion, legacy-store (tests: basis-versions, citation, inquiry, progressions, promotion, queue; legacy-tests 4; ns) | split | C-33.1/.2/.33-.37 basis-versions; C-33.13/.22/.23 inquiry; C-33.14 case-authoring; C-33.21/.24/.38/.49, C-67.1 promotion; C-33.25 entities; C-33.28/.48 membership; C-33.10-.12 unowned (op=release, N400); C-33.40 NO_BASIS and C-33.41 NO_CITATION shared act rows (entities, progressions, inquiry) -> record-grammar |
| `ROUTE_MARK_CHECKS` | 7055–7125 (71) | row data C-34 | provenance, legacy-store (legacy-tests 1; ns) | provenance | C-24, C-34, C-89, C-103, C-53.1-.9/.13 (provenance Suggestions); K72 (5) kept them in the catalogue: needs a new ruling |
| `TEXT_CHAIN_CHECKS` | 7127–7279 (153) | row data C-35 | text-chain (tests: text-chain; legacy-tests 2; ns) | text-chain | C-35 (text-chain: "no other module may mint a C-35 code") |
| `REQUIRED_ARGUMENT_CHECKS` | 7282–7325 (44) | row data C-61 | legacy-index (legacy-tests 2; ns) | control-plane | C-61.1, C-68.1: raised in src/index.mjs (requiredArgument, storageAbsent), which control-plane takes; control-plane R32 does not list them yet |
| `INSTALLATION_CHECKS` | 7327–7358 (32) | row data C-68 | control-plane (tests: publication; legacy-tests 1; ns) | control-plane | C-61.1, C-68.1: raised in src/index.mjs (requiredArgument, storageAbsent), which control-plane takes; control-plane R32 does not list them yet |
| `RENDER_CAPTURE_CHECKS` | 7360–7464 (105) | row data C-83 | capture, capture-requests (tests: capture, capture-requests; legacy-tests 4; ns) | capture | C-83, C-85 (capture R5, R47-R56); K72 (1) kept them here |
| `KNOCK_CHECKS` | 7468–7610 (143) | row data C-85 | capture (tests: capture; legacy-tests 1; ns) | capture | C-83, C-85 (capture R5, R47-R56); K72 (1) kept them here |
| `ATTEST_CHECKS` | 7612–7633 (22) | row data C-89 | — (ns) | provenance | C-24, C-34, C-89, C-103, C-53.1-.9/.13 (provenance Suggestions); K72 (5) kept them in the catalogue: needs a new ruling |
| `PROVENANCE_ACT_CHECKS` | 7635–7695 (61) | row data C-103 | provenance (tests: provenance; ns) | provenance | C-24, C-34, C-89, C-103, C-53.1-.9/.13 (provenance Suggestions); K72 (5) kept them in the catalogue: needs a new ruling |
| `DRIVE_CAPTURE_CHECKS` | 7697–7837 (141) | row data C-48 | capture, monitoring (tests: capture, monitoring; legacy-tests 2; ns) | split | C-48.1-.7 capture; C-48.8/.9 monitoring (R42; its line 134 says the opposite: reword) |
| `CONTENT_EXTENT_KINDS` | 7839–7973 (135) | shared helper (extent algebra) | content (legacy-tests 7) | shared:text-chain | content R1-R2 claim it, but extraction (earlier than content) stores canonicalExtent's bytes; text-chain's Purpose already holds "the extent geometry"; content/extent.mjs stays the face |
| `CONTENT_EXTENT_RANGE_RE` | 7975–7980 (6) | shared helper (extent algebra) | — | shared:text-chain | content R1-R2 claim it, but extraction (earlier than content) stores canonicalExtent's bytes; text-chain's Purpose already holds "the extent geometry"; content/extent.mjs stays the face |
| `rangeCorners` | 7982–7993 (12) | shared helper (extent algebra) | — | shared:text-chain | content R1-R2 claim it, but extraction (earlier than content) stores canonicalExtent's bytes; text-chain's Purpose already holds "the extent geometry"; content/extent.mjs stays the face |
| `canonicalRange` | 8002–8008 (7) | shared helper (extent algebra) | — | shared:text-chain | content R1-R2 claim it, but extraction (earlier than content) stores canonicalExtent's bytes; text-chain's Purpose already holds "the extent geometry"; content/extent.mjs stays the face |
| `contentCitedAs` | 8010–8029 (20) | shared helper (extent algebra) | content | shared:text-chain | content R1-R2 claim it, but extraction (earlier than content) stores canonicalExtent's bytes; text-chain's Purpose already holds "the extent geometry"; content/extent.mjs stays the face |
| `CONTENT_EXTENT_A1_RE` | 8031–8044 (14) | shared helper (extent algebra) | content (legacy-tests 1) | shared:text-chain | content R1-R2 claim it, but extraction (earlier than content) stores canonicalExtent's bytes; text-chain's Purpose already holds "the extent geometry"; content/extent.mjs stays the face |
| `a1ToRowCol` | 8046–8059 (14) | shared helper (extent algebra) | — (legacy-tests 1) | shared:text-chain | content R1-R2 claim it, but extraction (earlier than content) stores canonicalExtent's bytes; text-chain's Purpose already holds "the extent geometry"; content/extent.mjs stays the face |
| `CONTENT_EXTENT_KIND_NO_PRODUCER` | 8061–8065 (5) | check function / row data | content | content | C-45.1-.6/.11/.12 (content R38); held here by K138 |
| `CONTENT_EXTENT_CHECKS` | 8067–8171 (105) | check function / row data C-45 | basis-versions, content (tests: citation, content; legacy-tests 4; ns) | content | C-45.1-.6/.11/.12 (content R38); held here by K138 |
| `refusal` *(private)* | 8173–8202 (30) | helper (private) | — | content | looks rows up in CONTENT_EXTENT_CHECKS and CONNECTION_PAIR_CHECKS; connections takes its own `refusal` (guard spelling rule) |
| `legExtent` | 8204–8295 (92) | check function / row data | basis-versions, content (legacy-tests 4) | content | C-45.1-.6/.11/.12 (content R38); held here by K138 |
| `legHasAuthoredExtent` | 8297–8321 (25) | check function / row data | content (legacy-tests 2) | content | C-45.1-.6/.11/.12 (content R38); held here by K138 |
| `CONTENT_ID_RE` | 8323–8330 (8) | check function / row data | content (legacy-tests 1) | content | C-45.1-.6/.11/.12 (content R38); held here by K138 |
| `CONTENT_EXTENT_DOCUMENT_ONLY` | 8332–8346 (15) | check function / row data | content (legacy-tests 1) | content | C-45.1-.6/.11/.12 (content R38); held here by K138 |
| `canonicalExtent` | 8348–8429 (82) | shared helper (extent algebra) | basis-versions, content, extraction, reevaluation (tests: extraction; legacy-tests 6) | shared:text-chain | content R1-R2 claim it, but extraction (earlier than content) stores canonicalExtent's bytes; text-chain's Purpose already holds "the extent geometry"; content/extent.mjs stays the face |
| `describeExtent` | 8431–8500 (70) | shared helper (extent algebra) | content, extraction (legacy-tests 6) | shared:text-chain | content R1-R2 claim it, but extraction (earlier than content) stores canonicalExtent's bytes; text-chain's Purpose already holds "the extent geometry"; content/extent.mjs stays the face |
| `extentRelation` | 8502–8565 (64) | check function / row data | content, legacy-store (legacy-tests 1) | content | C-45.1-.6/.11/.12 (content R38); held here by K138 |
| `NARROW_CHECKS` | 8567–8670 (104) | row data C-50 | basis-versions, legacy-store (legacy-tests 1; ns) | basis-versions | C-25, C-50 (basis-versions R35) |
| `TRANSCRIBE_CHECKS` | 8672–8753 (82) | row data C-52 | content, legacy-store (tests: content; legacy-tests 1; ns) | content | C-52, C-80.3 (content R38) |
| `TESTIMONY_CHECKS` | 8755–8894 (140) | row data C-53 | provenance, legacy-store (legacy-tests 3; ns) | provenance | C-24, C-34, C-89, C-103, C-53.1-.9/.13 (provenance Suggestions); K72 (5) kept them in the catalogue: needs a new ruling |
| `LEAD_ID_RE` | 8896–8919 (24) | constant | — (tests: observation-log; legacy-tests 1) | observation-log | leads are minted by observation-log (C-54.2-.10, its R26) |
| `LEAD_CHECKS` | 8921–8930 (10) | check function / row data C-54 | inquiry, legacy-store (tests: observation-log; ns) | inquiry | C-54.1 (inquiry R38) |
| `MEMBER_ID_CHECKS` | 8932–8953 (22) | row data C-55 | membership, legacy-store (legacy-tests 2; ns) | membership | C-29, C-55, C-63, C-96.2-.12, C-56, C-70, C-95, C-57 (membership Uses: translations "until those checks move") |
| `SIGNER_ENROLMENT_CHECKS` | 8955–8991 (37) | row data C-63 | membership, legacy-store (tests: membership; legacy-tests 1; ns) | membership | C-29, C-55, C-63, C-96.2-.12, C-56, C-70, C-95, C-57 (membership Uses: translations "until those checks move") |
| `CUSTODIAL_CHECKS` | 8993–9098 (106) | row data C-96 | membership, promotion, legacy-store (tests: membership, promotion; legacy-tests 2; ns) | membership | C-29, C-55, C-63, C-96.2-.12, C-56, C-70, C-95, C-57 (membership Uses: translations "until those checks move") |
| `PROJECT_AUTHORITY_CHECKS` | 9100–9125 (26) | row data C-56 | membership, legacy-store (legacy-tests 2; ns) | membership | C-29, C-55, C-63, C-96.2-.12, C-56, C-70, C-95, C-57 (membership Uses: translations "until those checks move") |
| `PROJECT_VISIBILITY_CHECKS` | 9127–9163 (37) | row data C-70 | membership, promotion, legacy-store (tests: case-authoring, membership, promotion, review; legacy-tests 1; ns) | membership | C-29, C-55, C-63, C-96.2-.12, C-56, C-70, C-95, C-57 (membership Uses: translations "until those checks move") |
| `PROJECT_JOIN_REQUEST_CHECKS` | 9165–9228 (64) | row data C-95 | membership, legacy-store (ns) | membership | C-29, C-55, C-63, C-96.2-.12, C-56, C-70, C-95, C-57 (membership Uses: translations "until those checks move") |
| `PROJECT_CREATION_VISIBILITY_CHECKS` | 9230–9253 (24) | row data C-97 | promotion, legacy-store (legacy-tests 1; ns) | promotion | C-97, C-86 (`where` promotion) |
| `CASE_AUTHORITY_CHECKS` | 9255–9278 (24) | row data C-57 | membership, legacy-store (legacy-tests 1; ns) | membership | C-29, C-55, C-63, C-96.2-.12, C-56, C-70, C-95, C-57 (membership Uses: translations "until those checks move") |
| `SURFACE_CHECKS` | 9280–9308 (29) | row data C-66 | legacy-store (ns) | inquiry | C-66.5 (ai-runs map: "C-66.5 is inquiry's"); `where` still names store.mjs #promoteChecks |
| `PROJECT_ID_CHECKS` | 9310–9354 (45) | row data C-59 | promotion, record-core, legacy-store (tests: promotion; ns) | split | C-59.1-.4 promotion; C-59.5 record-core (R27) |
| `VERSION_NOTICE_CHECKS` | 9358–9383 (26) | row data C-80 | content (tests: content, reevaluation; legacy-tests 2; ns) | content | C-52, C-80.3 (content R38) |
| `INSTANCE_GROUP_CHECKS` | 9385–9406 (22) | row data C-64 | inquiry, promotion, strength (legacy-tests 2; ns) | promotion | C-64.1 (promotion R13, instance-setup R30); its `where` names inquiry #groupUndetermined: re-point |
| `withProducingGroup` | 9408–9425 (18) | constant/helper | promotion (legacy-tests 7) | promotion | promotion R8, R13 (K69); name key goes with fork (membership map) |
| `leadLegFindings` | 9427–9452 (26) | check function / row data | inquiry (tests: observation-log; legacy-tests 1) | inquiry | C-54.1 (inquiry R38) |
| `THEME_ID_RE` | 9454–9483 (30) | row data / check function | connections (legacy-tests 1) | connections | C-49, C-74, C-81 (connections R35); held here by K145 |
| `THEME_CHECKS` | 9493–9587 (95) | row data / check function C-81 | connections (legacy-tests 2; ns) | connections | C-49, C-74, C-81 (connections R35); held here by K145 |
| `themeLegFindings` | 9589–9628 (40) | row data / check function | connections (legacy-tests 1) | connections | C-49, C-74, C-81 (connections R35); held here by K145 |
| `checkContentExtent` | 9630–9938 (309) | check function / row data | content (legacy-tests 5) | content | C-45.1-.6/.11/.12 (content R38); held here by K138 |
| `coversSheetCell` *(private)* | 9940–9996 (57) | check function (private) | — | content | checkContentExtent's container tests |
| `coversSheetRange` *(private)* | 10025–10064 (40) | check function (private) | — | content | checkContentExtent's container tests |
| `imagePartUndetermined` | 10115–10138 (24) | check function / row data | content (legacy-tests 1) | content | C-45.1-.6/.11/.12 (content R38); held here by K138 |
| `coversImagePlacement` *(private)* | 10140–10174 (35) | check function (private) | — | content | checkContentExtent's container tests |
| `PER_ITEM_CHECKS` | 10176–10223 (48) | row data C-75 | record-core (tests: record-core; ns) | record-core | C-75 (record-core R55) |
| `REGISTRATION_CHECKS` | 10225–10330 (106) | row data C-102 | promotion (tests: connections, promotion; ns) | split | C-102.1-.3 record-core; C-102.4-.9 promotion; C-102.10 ratification |
| `CONNECTION_PAIR_CHECKS` | 10332–10429 (98) | row data / check function C-49 | connections (legacy-tests 3; ns) | connections | C-49, C-74, C-81 (connections R35); held here by K145 |
| `CONNECTION_CHOICE_CHECKS` | 10431–10481 (51) | row data / check function C-74 | connections (legacy-tests 3; ns) | connections | C-49, C-74, C-81 (connections R35); held here by K145 |
| `PROMOTED_TYPE_CHECKS` | 10483–10544 (62) | row data C-86 | promotion, legacy-store (tests: promotion; ns) | promotion | C-97, C-86 (`where` promotion) |
| `SHA256_K` *(private)* | 10548–10579 (32) | shared helper (digest) | — | shared:record-grammar | two SHA-256 implementations (createSha256, sha256HexSync): consolidate on the move |
| `sha256HexSync` | 10581–10634 (54) | shared helper (digest) | connections, content, contradiction, extraction, filings, reevaluation, skills (legacy-tests 1) | shared:record-grammar | two SHA-256 implementations (createSha256, sha256HexSync): consolidate on the move |
| `contentIdFor` | 10636–10659 (24) | helper | — (legacy-tests 7) | dead | content holds its own (content/extent.mjs); only legacy suites import this copy |

Small private declarations (under 25 lines), which go with their owner: **inquiry**: `ENTITY_ID_RE` (4), `checkRecheckCoverage` (20), `DATE_RE` (6); **shared:record-grammar**: `stripComment` (17), `parseScalar` (16), `asText` (13), `hasFile_` (6), `checkWriteCompleteness` (21), `SOURCE_ASSERTED_RELS` (4), `EDGE_STATUS` (1), `latestHistorySnapshot` (4); **capture**: `INFO_ENUMS` (4), `CONTENT_HASH_RE` (1); **actions**: `QUOTE_NUMBER_RE` (1), `ORD_RE` (1); **promotion**: `CAPTURE_ENCODINGS` (13), `RAW_SHA_RE` (1), `storedToHashable` (7); **shared:text-chain**: `a1Letters` (6); **connections**: `THEME_REF_RE` (4), `THEME_LEG_KEYS` (3); **content**: `coversDocPara` (10), `coversSlideShape` (15), `coversDocTable` (20), `coversImage` (10), `partOutsideAnyContainer` (16).

## 2. Per owner

A split table's lines are shared out by its rows, with its header going to the owner that holds most of it. Line counts include comments.

| owner | layer | lines | exports (whole, or part of a split table) |
|---|---|---|---|
| shared:record-grammar | 1 (new) | 2063 | `BUNDLE_ID_RE`, `ANN_ID_RE`, `FILENAME_RE`, `ISO_TS_RE`, `OBJECT_TYPES`, `LEGACY_TYPE_ALIASES`, `normalizeType`, `CORE_FIELDS`, `FORBIDDEN_ALIASES`, `HEADINGS`, `HEADINGS_WHEN`, `isCaseMemberBytes`, `vocabFor`, `STATES`, `LAW_PROPOSAL_STATES`, `lawProposalState`, `PROPOSAL_STATES`, `proposalLabel`, `parseFrontmatter`, `canonicalJson`, `sectionText`, `NON_MEMBER_AUTHORS`, `ACTOR_CLASSES`, `MACHINE_AUTHOR_PREFIX`, `MACHINE_CLASS_PREFIX`, `MACHINE_STAMP_PREFIXES`, `isMachineStamp`, `isMachineIdentity`, `CONTENT_MINTED_BY_PLANE`, `CONTENT_MINT_STATES`, `contentMintState`, `isMachineMinted`, `BASIS_ROLES`, `BASIS_GRADES`, `GRADE_AXES`, `TESTIMONY_GRADE`, `GRADE_SOURCES`, `EARNED_GRADE_SOURCES`, `EARNED_CAPTURE_CEILING`, `UNREACHABLE_CAPTURE_GRADE`, `isPublicHttpsLocator`, `b64ToBytes`, `createSha256`, `checkBundle`, `sha256HexSync`, `ACT_SHAPE_CHECKS (part)` |
| inquiry | 6 | 1419 | `INQUIRY_TITLE_MAX`, `deriveInquiryTitle`, `inquiryQuestionOf`, `supersedesEdgeFindings`, `divisionDisclosureFindings`, `EARNED_SOURCE_AXIS`, `GROUND_LABEL_RE`, `checkLegExtentGrammar`, `checkInquiryBasis`, `LEAD_CHECKS`, `SURFACE_CHECKS`, `leadLegFindings`, `MACHINE_FENCE_CHECKS (part)`, `ACT_SHAPE_CHECKS (part)` |
| basis-versions | 6 | 1365 | `SUFFICIENCY_UNCLAIMED`, `SUFFICIENCY_CLAIM_STATES`, `sufficiencyClaimState`, `isSufficiencyClaimed`, `isSufficiencyUnclaimed`, `BASIS_VERSION_CHECKS`, `VERSION_STATES`, `VERSION_MACHINE`, `VERSION_REASON_REQUIRED`, `versionNeedsReason`, `VERSION_ACT_CHECKS`, `VERSION_RELATIONSHIPS`, `VERSION_NAME_RE`, `basisVersionFindings`, `SUGGEST_KINDS`, `BOILERPLATE_FORMS`, `isBoilerplate`, `NARROW_CHECKS`, `MACHINE_FENCE_CHECKS (part)`, `ACT_SHAPE_CHECKS (part)`, `SUGGEST_CHECKS (part)` |
| content | 4 | 988 | `CONTENT_EXTENT_KIND_NO_PRODUCER`, `CONTENT_EXTENT_CHECKS`, `legExtent`, `legHasAuthoredExtent`, `CONTENT_ID_RE`, `CONTENT_EXTENT_DOCUMENT_ONLY`, `extentRelation`, `TRANSCRIBE_CHECKS`, `VERSION_NOTICE_CHECKS`, `checkContentExtent`, `imagePartUndetermined` |
| promotion | 2 | 720 | `CHECK_RETIREMENTS`, `MECHANICAL_FIELD_SETS`, `projectNameKey`, `checkProjectNameUniqueness`, `BIAS_CHECKS`, `PROJECT_CREATION_VISIBILITY_CHECKS`, `INSTANCE_GROUP_CHECKS`, `withProducingGroup`, `PROMOTED_TYPE_CHECKS`, `MACHINE_FENCE_CHECKS (part)`, `ACT_SHAPE_CHECKS (part)`, `REGISTRATION_CHECKS (part)`, `PROJECT_ID_CHECKS (part)` |
| capture | 3 | 482 | `MONITOR_FREQ`, `CIVICOS_CONTACT_URL`, `civicosUserAgent`, `RENDER_CAPTURE_CHECKS`, `KNOCK_CHECKS`, `CAPTURE_REQUEST_CHECKS (part)`, `DRIVE_CAPTURE_CHECKS (part)` |
| membership | 2 | 480 | `AI_CREDENTIAL_CHECKS`, `MEMBER_ID_CHECKS`, `SIGNER_ENROLMENT_CHECKS`, `CUSTODIAL_CHECKS`, `PROJECT_AUTHORITY_CHECKS`, `PROJECT_VISIBILITY_CHECKS`, `PROJECT_JOIN_REQUEST_CHECKS`, `CASE_AUTHORITY_CHECKS`, `ACT_SHAPE_CHECKS (part)` |
| actions | 9 | 444 | `ACTION_KINDS`, `RISK_TIERS`, `riskTierState`, `lawProposalLabel`, `ACTION_BASIS_KINDS`, `CORRESPONDENCE_DIRECTIONS`, `RESOLUTIONS`, `RFC_RESPONSE_WINDOW_PRECEDENT`, `actionBasisFindings`, `correspondenceFindings`, `QUOTE_KEYS`, `isQuoteEntry`, `quoteValue`, `quoteFindings`, `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES`, `DECISION_STAGES`, `LIFECYCLE_KEYS`, `lifecycleFindings` |
| shared:text-chain | 1 | 366 | `CONTENT_EXTENT_KINDS`, `CONTENT_EXTENT_RANGE_RE`, `rangeCorners`, `canonicalRange`, `contentCitedAs`, `CONTENT_EXTENT_A1_RE`, `a1ToRowCol`, `canonicalExtent`, `describeExtent` |
| provenance | 3 | 352 | `VERSION_CHAIN_CHECKS`, `ROUTE_MARK_CHECKS`, `ATTEST_CHECKS`, `PROVENANCE_ACT_CHECKS`, `TESTIMONY_CHECKS` |
| observation-log | 5 | 335 | `AI_RUN_CHECKS`, `LEAD_ID_RE` |
| connections | 5 | 321 | `THEME_ID_RE`, `THEME_CHECKS`, `themeLegFindings`, `CONNECTION_PAIR_CHECKS`, `CONNECTION_CHOICE_CHECKS` |
| run-productions | 6 | 310 | `SUGGEST_LEVELS`, `EXTRACT_PROPOSE_CHECKS`, `SUGGEST_CHECKS (part)` |
| capture-requests | 6 | 263 | `CAPTURE_PURPOSES`, `CAPTURE_UA_MODES`, `userAgentIsLegible`, `CAPTURE_REQUEST_CHECKS (part)` |
| text-chain | 1 | 153 | `TEXT_CHAIN_CHECKS` |
| dead | — | 128 | `caseEditionClaimed`, `LAW_LEVELS`, `SUBJECT_POSITIONS`, `CASE_MEMBER_ROLES`, `contentIdFor` |
| record-core | 2 | 77 | `PER_ITEM_CHECKS`, `REGISTRATION_CHECKS (part)`, `PROJECT_ID_CHECKS (part)` |
| control-plane | 11 | 76 | `REQUIRED_ARGUMENT_CHECKS`, `INSTALLATION_CHECKS` |
| unowned | — | 40 | (private only) |
| unowned (release, N400) | — | 29 | `MACHINE_FENCE_CHECKS (part)`, `ACT_SHAPE_CHECKS (part)` |
| monitoring | 10 | 22 | `DRIVE_CAPTURE_CHECKS (part)` |
| case-authoring | 8 | 15 | `MACHINE_FENCE_CHECKS (part)`, `ACT_SHAPE_CHECKS (part)` |
| ratification | 8 | 8 | `REGISTRATION_CHECKS (part)` |
| entities | 5 | 7 | `ACT_SHAPE_CHECKS (part)` |
| strength | 6 | 1 | `STRENGTH_STATES` |

Total apportioned: 10464 lines. The other 195 lines are blank lines between declarations.

## 3. Dead

**Dead: no importer anywhere, and nothing in the file uses them** (24 lines):
- `LAW_LEVELS` (602–613, 12 lines): actions reads `jurisdictions`' copy (actions requirements, "Law levels").
- `CASE_MEMBER_ROLES` (2415–2426, 12 lines): its only reader, `checkCaseDocument`, left in N372. Ratification holds its own. LEGACY-CHECKS #10's reason for keeping it no longer holds.

**Dead in product: another module holds the live copy, and only a parity test or legacy suites import the catalogue's** (104 lines). They can be deleted once those suites are re-pointed:
- `SUBJECT_POSITIONS` (2406–2412): read from ratification by affordances and case-authoring. Imported only by `test/m/ratification/checks.test.mjs` and legacy suites. N211's condition is met.
- `caseEditionClaimed` (173–245, 73 lines): ratification holds its own (`ratification/checks.mjs`:100). Imported only by ratification's parity test.
- `contentIdFor` (10636–10659): content holds its own (`content/extent.mjs`). Imported only by 7 legacy suites.

**No product caller, but the check is kept (K6: removing it needs a ruling):**
- `checkProjectNameUniqueness` (73 lines, C-77): nothing runs it. Only the legacy suite `d50-project-names` calls it, while promotion uses `projectNameKey` directly. Either promotion runs it, or a ruling retires C-77's catalogue arm.
- `CHECK_RETIREMENTS` (173 lines): census data, read only by `check-firing`, `declared-corpus` and `retirement.control` (legacy) and as text by `scripts/declared-source.mjs`.
- `isSufficiencyClaimed`, `isMachineMinted`: legacy suites only.

**Exports used only inside the file**, which lose `export` when they move: `ANN_ID_RE`, `FILENAME_RE`, `CORE_FIELDS`, `FORBIDDEN_ALIASES`, `HEADINGS_WHEN`, `lawProposalState`, `PROPOSAL_STATES`, `EARNED_SOURCE_AXIS`, `b64ToBytes`, `CIVICOS_CONTACT_URL`, `CONTENT_EXTENT_RANGE_RE`, `rangeCorners`, `canonicalRange`. `ATTEST_CHECKS` (C-89.1) has no named importer, but it is live: `dec49Row` reads it as part of the namespace.

## 4. Order constraints

The catalogue is first in the order, and in every tranche its layer-1 job runs before any owner. So an export can leave only after every importer reads the new owner, and a row can leave only after its owner holds it. **Each deletion therefore comes one tranche after the owner's move**: the owner adds its copy in its own layer, and legacy-checks deletes the catalogue's copy in the next tranche's layer 1. This is the N361→N372 sequence (K529). Each departure is promotion's to stamp in layer 2 (`CATALOG_VERSION`, `ROW_CENSUS`, R50).

### 4.1 Prerequisites, before any family can leave

1. **A composed catalogue (N245, N272, N337).** These read the whole namespace and harvest every `*_CHECKS` family:
   - control-plane's `dec49Row` (`MODULE_CHECK_FILES` already lists 39 module files);
   - skills' `machineFences` and `renderPack`, called by `agent-worker/src/index.mjs` with the catalogue's namespace. This reads the catalogue only, so every `MACHINE_CANNOT_*` row that moves is lost from the pack (N337 is already red);
   - the DEC-49 guard `civicos-ui/check-refusal-codes.mjs` (`CATALOG` path, :176);
   - `scripts/coverage.mjs` and `scripts/declared-source.mjs` (they read the file's text);
   - 19 test files: d470, refusal-wire, machinefences-dec49, dec49-onecode sweep, skillpack, skillsequencing, rec120, preauth-vocabulary, `agent-worker/test/requirements`, and the `test/m` suites of affordances, ai-runs, case-authoring, promotion (×2), publication, queue, ratification, review and skills.

   A provider of the composed catalogue must exist before `MACHINE_FENCE_CHECKS` or any family the pack reads moves, and before the file can be deleted. Until then, each family that moves must also be added to `MODULE_CHECK_FILES`.
2. **A registration seam in `checkBundle`.** `checkBundle` (core, `record-grammar`) calls the type grammars of later modules directly:
   - `checkInquiryExtension` and `checkRecheckCoverage` (inquiry);
   - `checkInformationExtension` (proposed capture);
   - `checkInfo2Contract` (promotion);
   - `checkProjectExtension` (unowned);
   - `checkReferences` calls inquiry's `supersedesEdgeFindings` and `divisionDisclosureFindings`.

   Each owner has to register its arm as a promotion step (R39/R40) and a record-core audit check (R59), and the core stops calling it. N325 did exactly this for queue's inbox grammar (T14–T15). This seam is what removes the reason K72 (1)/(5), K138, K145 and K181 (1) gave for keeping families in the catalogue ("legacy-checks is earlier in the order"). Each of those rulings needs a new ruling (BOB's, P17) before its family moves.
3. **Owners for unowned parts.** Three parts have no owner, and the file cannot be emptied until each has one:
   - `op=release`: C-32.1, C-33.10–.12 (N400, "BOB words its owner before T18");
   - the project arms: C-2.9 `workproduct_state`, `evaluations`, `closed_reason`, and C-9.1 (intent.md: "stay … for their owner"; candidate publication);
   - C-2.7, the information grammar (proposed capture).

### 4.2 Moves that must come before other moves

| must come first | then | why |
|---|---|---|
| basis-versions registers its version grammar (C-25.1–.19, C-27.15, `basisVersionFindings`) as its own step and audit check | inquiry's grammar leaves (`checkInquiryBasis`, …) | `checkInquiryBasis` calls `basisVersionFindings`, and basis-versions (6, #39) comes after inquiry (6, #37) |
| `SUGGEST_KINDS` and C-27.15's row reach basis-versions | `basisVersionFindings` leaves | it reads `SUGGEST_KINDS` and `SUGGEST_CHECKS.VERSION_KIND_UNKNOWN`. run-productions (#43) takes the other C-27 rows and imports `SUGGEST_KINDS` and `isBoilerplate` from basis-versions |
| promotion stops importing `deriveInquiryTitle` and `inquiryQuestionOf` (for example, a per-type title fact that inquiry registers) | these two and `INQUIRY_TITLE_MAX` go to inquiry (R10) | promotion (layer 2) calls them at the write (`promotion/index.mjs`:335). The alternative is to keep them in `record-grammar` |
| `test/m/observation-log/lead.test.mjs`:8/:234 moves its `leadLegFindings` arm to inquiry's tests | `leadLegFindings` and `LEAD_CHECKS` go to inquiry | observation-log (5) comes before inquiry (6). `LEAD_ID_RE` goes to observation-log, which mints leads |
| the extent algebra reaches `text-chain` | content's extent core leaves (`checkContentExtent`, …) | extraction (#28) stores `canonicalExtent`'s bytes and comes before content (#29). content's `extent.mjs` re-exports it, so content R1–R2 stay met. Note that extraction calls the catalogue's `canonicalExtent`, not content's, which has gained the `envelope` kind (R33) |
| connections takes its own `refusal` helper | content's `refusal` (8173–8202) leaves | it looks rows up in `CONNECTION_PAIR_CHECKS`, and connections (5) comes after content (4) |
| content holds the extent grammar | inquiry's `checkLegExtentGrammar`, basis-versions' `legExtent` use | both call content's functions; the order is fine once content holds them |
| `test/m/promotion` re-anchors `basisVersionFindings`; `test/m/publication` re-anchors `INSTALLATION_CHECKS` | basis-versions and control-plane take them | these are tests of earlier modules that import a later owner's export |
| every owner of an `ACT_SHAPE_CHECKS` row holds it: membership (2), promotion (2), entities (5), inquiry (6), basis-versions (6), case-authoring (8), `record-grammar` (C-33.40/.41, shared by entities, progressions and inquiry), release's owner | the `ACT_SHAPE_CHECKS` export is deleted | it is split seven ways, and the last owner is case-authoring (layer 8) or release's owner |
| inquiry, basis-versions, promotion, case-authoring and release's owner hold their fences, **and** the composed catalogue exists | `MACHINE_FENCE_CHECKS` is deleted | the pack reads every fence |
| capture holds C-28.13; capture-requests holds the rest | `CAPTURE_REQUEST_CHECKS` is deleted | capture (3) raises C-28.13 and imports the table |
| capture holds C-48.1–.7 and monitoring (10) holds C-48.8/.9 | `DRIVE_CAPTURE_CHECKS` is deleted | monitoring's requirements contradict each other: R42 says the rows move, line 134 says they stay |
| record-core holds C-102.1–.3; promotion holds C-102.4–.9; ratification (8) holds C-102.10 | `REGISTRATION_CHECKS` is deleted | split three ways |
| record-core holds C-59.5; promotion holds C-59.1–.4 | `PROJECT_ID_CHECKS` is deleted | record-core (#19) imports it and comes before promotion |

### 4.3 The order of the moves

Owners are listed in module order. Each step can start once the prerequisites above are met.
1. Layer 1:
   - `text-chain` takes C-35 and the extent algebra;
   - `record-grammar` is formed last, from what remains (the rename).
2. Layer 2:
   - record-core takes C-75, C-59.5 and C-102.1–.3;
   - membership takes its eight families and C-33.28/.48;
   - promotion takes C-26.12, C-64.1, C-77, C-86, C-97, C-59.1–.4, C-102.4–.9, C-33.21/.24/.38/.49, C-67.1 and C-32.5, plus `MECHANICAL_FIELD_SETS`, `withProducingGroup`, `projectNameKey` and C-18.6/.7 (`checkInfo2Contract`).
3. Layer 3:
   - provenance takes C-24, C-34, C-53, C-89 and C-103;
   - capture takes C-83, C-85, C-48.1–.7, C-28.13, the user agent and C-2.7.
4. Layer 4: content takes C-45, C-52, C-80.3 and the extent core.
5. Layer 5:
   - observation-log takes C-22 and `LEAD_ID_RE`;
   - connections takes C-49, C-74 and C-81;
   - entities takes C-33.25.
6. Layer 6:
   - inquiry takes the C-2.8 grammar, C-6.1, C-15.1, C-54.1, C-66.5, C-33.13/.22/.23 and C-32.7/.8, after basis-versions has registered;
   - strength takes `STRENGTH_STATES`;
   - basis-versions takes C-25, C-50, C-27.15, C-33.1/.2/.33–.37, C-32.2, and the version, sufficiency and boilerplate helpers;
   - run-productions takes C-27 and C-104;
   - capture-requests takes the rest of C-28 and the conduct vocabularies.
7. Layer 8:
   - case-authoring takes C-33.14 and C-32.6;
   - ratification takes C-102.10.
8. Layer 9: actions takes C-2.10, C-94 and the action vocabularies.
9. Layers 10 and 11:
   - monitoring takes C-48.8/.9;
   - control-plane takes C-61.1 and C-68.1.
10. Last: the legacy consumers are re-pointed, and the file is retired.
    - `legacy-store` imports 56 names from the catalogue; `legacy-index` imports 3.
    - `legacy-tests`: 288 suites plus `civicos-ui/check-semantics.mjs`, which imports 11 names.
    - The source-text readers.
    - Every delete stales `agent-worker/dist/agent-worker.bundled.mjs` and the plane bundle (regenerated by BOB at each close).
    - `modules.json` gains the `uses` edges each move creates. Today almost every module lists `legacy-checks` in place of them.

### 4.4 Wording to correct in requirements (found on the way, BOB's to word)
- bias R29 claims C-26.1–.19, but C-26.12 is raised only at promotion's write (R15).
- monitoring R42 and its line 134 disagree about C-48.8/.9.
- control-plane R32 does not list C-61.1 or C-68.1, both of which its code raises.
- `INSTANCE_GROUP_CHECKS` C-64.1's `where` names `inquiry #groupUndetermined`, but promotion R13 and instance-setup R30 make it promotion's.
- extraction's and sources' Uses name `requiredArgument` as a legacy-checks export. It is not one: it lives in `src/index.mjs`.
- K6: two SHA-256 implementations (`createSha256`, and `sha256HexSync` with its own `SHA256_K`) should become one when they move.
