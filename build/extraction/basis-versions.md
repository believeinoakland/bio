# basis-versions — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `35ea098` (promotion merged; `store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682) by a drafting worker for BOB #42 (P18). Ranges as in `build/extraction/inquiry.md`. The contract is `build/requirements/basis-versions.md` (R1–R36); K31, K61, K73 (5) (C-50 and the version legs come here), K79 (`themeLegFindings`) apply. The module exports a factory answering its one instance per Durable Object `ctx` (K61), reaching `inquiry`, `content`, `promotion` and `membership` through theirs. `from` should read `["legacy-store", "legacy-checks"]`. Nothing moves from `index.mjs`.

## 1. What moves to `basis-versions`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| REC-13/REC-124 header, `conclude`, `#undeterminedClaim`, `#appendConclusionEntry`, `#setProjectConclusion`, `#conclusionRecordOf`, `#conclusionOf`, `#noProjectConclusionOf` | store | 5630–6358 | R16–R23 (§5.3); `actNoBasis` (632–644) is copied (C-33.40, shared) |
| `#withdrawConclusion` | | 6589–6675 | R20 |
| `#narrowSource`, `#extentLegFields`, `NARROW_CANDIDATES_MAX`, `#narrowCandidateList`, `narrowCandidates` | | 14301–14594 | R24–R25; the contradiction region that follows (14595–15304) is `contradiction`'s |
| `narrow` | | 15305–15565 | R26–R27 |
| `#setVersionField`, `#setCurrentVersionRow`, `#appendFmRows` | | 15637–15752 | splices, used only by versions and conclusions |
| `#canon`, `basisVersionsOf`, `#compositionDiff` | | 17176–17349 | R5, R6 |
| inside `#promoteChecks`: the basis-version arm, `VERSION_LEG_UNRESOLVED`, the version legs' content refusals, `VERSION_FROZEN` | | 17900–18036 | R6, registered as this module's check (promotion R39) |
| inside `#promoteProjections`: the two version tables with each leg's content row; answer key `version_content` | | 18352–18477, 18797–18818 | R7 |
| `BASIS_VERSIONS_LIMIT_*`, `BASIS_VERSION_LEGS_MAX`, `#versionCollections`, `#versionLegsEarned` | | 37255–37463 | R9, R10 (`#versionLegsEarned` calls `inquiry.earned`/`legCapped`) |
| `basisVersions`, `#currentVersionOf` | | 37533–37731 | R8–R11 |
| `versionAccept` … `versionHide`, `#versionArgs`, `VERSION_ACT_TO`, `#moveVersionState`, `#setProjectCurrentVersion` | | 38458–39020 | R12–R15 |
| dispatch `basisversions`, `versionaccept` … `versionhide`, `narrow`, `narrowcandidates`, `conclude`, `withdrawconclusion` | | 48958–48974, 49045–49056, 49071–49088, 49602–49641 | K3 |
| migrations: `inquiry_basis_versions.state_by`, `state_at`, `state_reason`, `kind`, `affirmed_parts` | | 1145–1160 | with the table |
| `BASIS_VERSION_CHECKS` (C-25.1–C-25.19), `VERSION_STATES`, `VERSION_MACHINE`, `VERSION_REASON_REQUIRED`, `versionNeedsReason`, `VERSION_ACT_CHECKS` (C-25.20–C-25.34), `VERSION_RELATIONSHIPS`, `VERSION_NAME_RE`, `basisVersionFindings` | bio-checks | 6801–7717 | R1–R4, R35 |
| `SUGGEST_KINDS` and row C-27.15 (`VERSION_KIND_UNKNOWN`) | bio-checks | 7718–7735; in 7791–8033 | R1; the rest of C-27 is `ai-runs'` (§5.2), one object split by the first job to move |
| `NARROW_CHECKS` (C-50) | bio-checks | 12778–12878 | R24, R26 |
| rows C-33.1, C-33.2, C-33.33–C-33.37 (`ACT_SHAPE_CHECKS`), C-32.2 (`MACHINE_FENCE_CHECKS`) | bio-checks | in 9490–10138, 9191–9421 | R16–R21 |

**Schema (K4).** `inquiry_basis_versions` with its header and indexes (schema.mjs 2128–2344), `inquiry_basis_version_legs` (2345–2384). Both carry `bundle_id` and sit in `legacy-store`'s purge list (store.mjs 873), removed when this module declares them (R34).

**Measured size:** store.mjs 3,004 (1,558 code), bio-checks.mjs 1,018 (558), schema.mjs 257 (45): about 4,280 lines, about 2,160 of code.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `suggestVersion`, `SUGGEST_LEGS_MAX`, `SUGGEST_ORIGIN_MAX`, `#suggestionPersisted`, `#suggestionFrontmatter`; `suggest_refusals`; dispatch `suggest`; C-27 but C-27.15 | store 39021–40075, 49217–49232; schema 2461–2497 | `ai-runs` | it reads `ai_runs`, calls `runPrincipalGate` (`airun.mjs`), `strength`'s walk and independence, and remembers its own refusals; it appends through R28 (§5.2) |
| `#caseConclusionFor`, `#editionsRecordingConclusion`, `#conclusionRowParsed`, `#sameRecordedConclusion`, `#recordedConclusionSummary`, `CASE_BEARING_STATES` | store 6359–6588 | `publication` | they read `case_documents`; they call R22, R23 |
| `#versionLegsAsMembers`, `versionStrength`, `partitionIndependence`, `#independenceOf`, `#refusePairComposed` | 37464–37532, 37732–38457 | `strength` | a pair and its independence over a version |
| the contradiction readers of the version tables (`#contradictionDoc`, `#contradictionLadder`, `#contradictionExtent`) | 14595–15304 | `contradiction` | they read these tables in SQL (§3, §5.5) |
| `#findingsVersionFromAnotherTeam`, `#findingsConcludedElsewhere`, `#findingsStanceDiverged` | 28633–29100 | `queue` | the §7 notifications; they call R11, R22 |

## 3. Callers to rewire

- `#currentVersionOf`: `conclude` (moves with it), `#projectsDrawingOn` (28520, `queue`), `versionStrength` (38127, `strength`).
- `#conclusionOf`, `#conclusionRecordOf`: `#caseConclusionFor` (`publication`), `#findingsConcludedElsewhere` (29032, 29073), `#concludedForJoinedProjectOf` (33141, `affordances`). `#noProjectConclusionOf`: `projection` (2029, `retrieval`'s decoration, K75 (2)), `#caseConclusionFor`.
- `basisVersionsOf`: `suggestVersion` (39598). `#versionCollections`: `suggestVersion` (39844).
- Direct SQL on `inquiry_basis_versions` or its legs: the contradiction readers (14686–14984), `testimonyReach` (20671), `extractProposals` (22675), `#leadBasisAbsence` (28266), `#findingsVersionFromAnotherTeam` (28856), `versionStrength` (38140, 38164), `partitionIndependence` (38349, 38360), `suggestVersion` (39637, 39843). Proposed: state both tables' columns as a read contract (record-core R37's form); every write this module's.
- `this.promote` in every act → `promotion.promote`. `#caseRelationOf` in `#moveVersionState` → the fact `caseMember`.

## 4. Old-battery tests that anchor on the moved source

Negative controls and pins that read or patch moved text (a `legacy-tests` entry, K53): `versionstate.control.mjs` and `versionstate.test.mjs` (the one-implementation pin over comment-stripped source), `nc-rec119.mjs`, `nc-rec119-freeze-phase.mjs` (`#versionLegsEarned`, the freeze), `current.control.mjs`, `current-shared-question.control.mjs`, `d216-sharing.control.mjs`, `sufficiency-state.control.mjs`, `conclude-project.control.mjs`, `conclude-project-arm.control.mjs`, `case-project-conclusion.control.mjs`, `projection-noproject.control.mjs`, `machinefences-dec49.test.mjs` (the conclude, version-act and narrow regions), `identity-claims.test.mjs` (stamped authorship). Suites that follow the module: `versions`, `versionstate`, `current`, `current-shared-question`, `conclude`, `conclude-project`, `conclude-project-arm`, `narrow`, `rec119-version-legs-earned`, `d216` (probe), `vf4-suggestprobe` (with `ai-runs`).

## 5. Undetermined, conflicts, and code others could claim

1. **Size.** About 4,280 lines, 2,160 of code: just past 4,000, under K74's test. Without the conclusion acts (816 lines) it is about 3,460, but then `inquiry` would need a registration from this module to adopt a claim (§5.3).
2. **`op=suggest` is placed with `ai-runs`**, not here. K73 (5) places the leg code with `inquiry` and `basis-versions`; `suggestVersion` is the AI's one write (INVESTIGATIVE-SESSION §4), reads `ai_runs` and calls `strength`, both later than this module. `ai-runs` uses `basis-versions` already and gains a use of `strength`. What stays here is the write it lands through (R28) and the kind vocabulary the version grammar checks (C-27.15).
3. **The conclusion acts are placed here, not in `inquiry`.** A conclusion adopts a version's claim and, for a project, stands beside CURRENT in the project's bytes (§7.1 item 1); `inquiry` is earlier and cannot read versions. The no-project arm moves the shared question's own state, by `inquiry`'s machine (its R1–R2). BOB settles it; the alternative is a claim resolver this module registers with `inquiry`.
4. **Uses.** Declared: `legacy-checks`, `record-core`, `membership`, `content`, `connections`, `inquiry`. The moved code also calls `promotion` (`promote`, the step registration, `caseMember`), `extraction` (`reading_refs`, `readings`) and `entities` (`resolutions`) in `narrowCandidates`. Proposed: add those three. `connections` stays for `themeLegFindings` (K79).
5. **Missing edge elsewhere.** `contradiction` (layer 6, after this module) reads both version tables and `inquiry_basis`; its declared uses are `record-core`, `content`, `inquiry`. It needs `basis-versions`.
6. **Registration owed.** `narrowCandidates`' extract arm reads `proposed_readings` (`ai-runs`, K73 (2)): `ai-runs` fills a candidate source this module offers (K31's pattern); `legacy-store` registers until then.
7. **Other claimants.** `ai-runs`: `op=suggest`. `strength`: the version pair and independence. `publication`: the case-conclusion comparison. `queue`: the §7 findings. `inquiry`: the conclusion acts (§5.3). `contradiction`: the version reads.
