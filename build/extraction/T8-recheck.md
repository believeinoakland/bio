# Extraction maps re-checked for T8

**Status** · A worker's read-only re-check for BOB #52, 2026-09-28, on `tranche/T7` @ d4bbbac97f (after T7's layer 6, before layers 7 and 11 merged); reviewed by BOB (K206). The maps' line ranges are stale; T8's opening BOB applies what still holds after T7 closes, per K206. Not a map itself: each target's job reads its own map.


Measured 2026-09-28, read-only. Line counts now: `store.mjs` 19,417 · `index.mjs` 9,069 · `schema.mjs` 1,176 · `checks/bio-checks.mjs` about 13.7k · `airun.mjs` 1,096. **Every line range in the seven maps is stale.** Most of what the maps list for publication, ratification, case-authoring and review is **(a) still in the legacy file**, at new lines. Most scheduler consumers and the code around monitoring have **moved (b)** to layer 3–6 modules. A range below is start–end; where only a start is given, the end is a comment block or not checked. "Delegate" means the legacy line is a one-line call into the module that owns the code now.

Key: (a) still in legacy · (b) moved · (c) gone or renamed.

---

## 1. publication (`build/extraction/publication.md`)

**store.mjs**

| item | map says | now | proposed map edit |
|---|---|---|---|
| `CASE_FLAGS_LIMIT` | 3244 | (a) store 1524 | re-cite |
| `#caseRelationOf` … `caseFlags` | 4868–5197 | (a) store 2209–2487 (`#caseRelationOf` 2209, `#caseClaimInBytes` 2263, `#flagCasesOnRevision` 2328, `#dischargeCaseFlags` 2393, `caseFlags` 2421–2487) | re-cite |
| `caseDocumentFacts` … `#signedCitations` | 10036–10310 | (a) store 6371–6604 (`caseDocumentFacts` 6371–6440, `#pinnedMemberBasis` 6453, `#projectCaseExclusions` 6469, `#caseDocMemberFrozen` 6502, `#noCaseDocument` 6528, `#hasCaseStanding` 6554, `caseDocument` 6573, `#signedCitations` 6597–6604) | re-cite |
| `#memberTextAtSha` | 10107–10116, "record-core `textAtSha`" | (a) store 6444–6451; callers 6458 (`#pinnedMemberBasis`), 8486 (`ratifyCaseDocument`). record-core **R60** was added by K203 but is **not built** (T8 layer 2). bias keeps its own copy (`bias/index.mjs` 139) | say: record-core R60 (K203), built in T8 layer 2; after that, delete the store copy |
| `ATTRIBUTION_LEVELS` … `attributeObservation` | 20684–20945 | (a) store 9690–9946 | re-cite |
| `#observedMs` "stays" | 20947 | (c) gone from store. Now `observedMs()` in `provenance/index.mjs` 480; its caller moved with provenance | drop the row |
| `testimonyReach` (§2) | 20645, "to basis-versions" | (b) `basis-versions/index.mjs` 526 (basis-versions **R39**); store delegate 9683. Called at store 9733 (`#observationsReachedBy`) and 6424 (`caseDocumentFacts`) | say: read through basis-versions R39 (already in Uses) |
| `EXPORT_LOG_LIMIT_*` | 27584 | (a) store 10226–10227 | re-cite |
| `exportManifest`, `exportLog`, `publishedManifest` | 33516–33755 | (a) store 14788–14828, 14847–14855, 14867–15007 | re-cite |
| `#frozenFromPinningDocuments` … `publishedTargets` | 34420–35551 | (a) store 15673–16803 (`#caseEditionState` 15731–15931, `recordCaseManifest` 15940, `#publishEdges` 15988, `publishedCase` 16141–16426, `publishedGraphEdges` 16722, `publishedTargets` 16799–16803) | re-cite |
| `excludedBy`, `publishedRegistryFor`, `publishedCaseRegistryFor` | 35775–35907 | (a) store 16845–16973 | re-cite |
| `case_documents` insert and re-author updates, out of `publishCase` / `#reauthorAcknowledgements` / `#reauthorAttributions` | 9131, 11558, 20820 | (a) inside `publishCase` (4311–5583), `#reauthorAcknowledgements` (7863–7899) and `#reauthorAttributions` (9803–9827) | re-cite the three methods |
| commit writes out of `ratifyCaseDocument` / `publish` | 12055–12140, 34315–34340 | (a) `ratifyCaseDocument` 8216–8516; `publish` 15168–15666 | re-cite |
| dispatch rows | 48595–49796 | (a) store `caseflags` 18958, `attribute` 19141, `publishededitions` 19319, `publishedcase` 19324, `recordcasemanifest`…`publishedmanifest` 19338–19346, `casedocfacts` 19362, `casedocument` 19365, `verify` 19399, `publishedlist` 19400; `PROJECT_NAMING_READS` about 14635–14661 | re-cite |
| migrations | 954–1674 | (a) store 813–857 and 1011–1017 (published_bundles re-key), about 953 (`delivered_by`), 1057 (`export_log` DDL) | re-cite |
| purge declarations | 874–890 | (a) store 641–659 (`declarePurge("legacy-store", …)`) | re-cite |

**index.mjs**: `publishedStoreAbsent` … `publishedObjectMissing` are (a) index 4083–4126. `assembleCaseContainer` is (a) index 4194–4456; its callers are 6684 (caseratify) and 7247/7251 (ratify). The `publishedcase`/`publishedbytes` block is (a) index 4832–5128. `inbandQuartet` is called at 3387 (`reviewAnswer`) and 4422. All need re-citing.

**bio-checks.mjs**: all (a). Formats 9835–9863. C-44.2 7876 (inside `CASE_DERIVATION_CHECKS` 7854–7910). `PUBLISHED_READ_CHECKS` 9339–9395. C-92.1–.9 11349–about 11403 (inside `ATTRIBUTION_CHECKS` 11347–11425). C-68.5 9115 (inside `INSTALLATION_CHECKS` 9080–9122). Re-cite all of them.

**schema.mjs**: all (a). `published_bundles` 106, `published_shas` 122, `published_edges` 295, `published_cases` 387, `published_case_members` 455, `cases` 511, `case_documents` 556, `case_exclusions` 593, `case_revision_flags` 927, `observation_attributions` 1057. `export_log` is DDL in store 1057.

**§3 callers, stale entries**
- `#caseRelationOf`'s callers `dispose`, `#restsOnLive`, `divide`, `groundInquiry` and `#moveVersionState` have (b) moved to inquiry and basis-versions. They read the **fact `caseMember`** through `promotion.fact` (inquiry/index.mjs 172, basis-versions/index.mjs 620, promotion/index.mjs 961). legacy-store registers that fact at store 728. Remaining store callers: `affordanceFacts` 1353, `#caseConclusionFor` 2969/2978, `publishCase` 4660, `#editionWarrantedForJoinedProjectOf` 14581, `publish` 15383. Edit: callers outside the store reach it as publication **R4**'s registered fact, replacing store 728. The map already says this at §6 via requirements item 1.
- `publishedRegistryFor`: inquiry reads the fact `publishedRegistry` (inquiry/index.mjs 181), registered at store 729. Remaining direct callers: `auditPass` 8783, `gateFacts` 15119, `publishedTargets` 16802. `#promoteChecks` no longer calls it. Edit: say R7's registered fact replaces store 729, and drop `#promoteChecks`.
- `#flagCasesOnRevision` is called from `#promoteProjections` 9627, which is still legacy-store's registered step. `#dischargeCaseFlags` is called from `publish` 15417/15497.
- `#attributionInForce` → `reviewCopy` 7327. `#attributionStatements` → `publishCase` 5461. `observationsNamingAuthor`/`attributionStatedFor` → `gateFacts` 15107/15109. `#hasCaseStanding` → `acknowledgeStatement` 7484, `excludedBy` 16859. `#projectCaseExclusions` → `publishCase` 5483. `EXPORT_LOG_LIMIT_DEFAULT` → `#findingsExportPerformed` 11697–11746 (queue).

**Uses check.** modules.json matches publication.md Uses. publication.md lists record-core `textAtSha` (R60) as not yet provided, and that is still true. strength.md line 88 says "publication calls `projectBar`", but in the code only `publishCase` (store 4741, case-authoring) and `reviewCopy` (7352, review) call it. strength.md's sentence is stale; publication's uses are right.

---

## 2. ratification (`build/extraction/ratification.md`)

| item | map says | now | proposed map edit |
|---|---|---|---|
| `CASE_BEARING_STATES` … `#recordedConclusionSummary` | 6360–6588 | (a) store 2899–3068 | re-cite |
| `ratifyCaseDocument` | 11880–12181 | (a) store 8216–8516 (it calls `#caseConclusionFor`/`#editionsRecordingConclusion` at 8322) | re-cite |
| `gateFacts`, `publish` | 33833–34419 | (a) store 15086–15139, 15168–15666 | re-cite |
| dispatch | 49751–49794 | (a) store `gatefacts` 19355, `caseratify` 19394, `publish` 19398 | re-cite |
| `testimonyFenceRow`, `ratifyScopeRow` / `attributionRow` / `machineFenceRow` | index 4131–4172 | (a) index 3732–3737, 3739–3744, 3763–3768; `machineFenceRow` 3745–3751 | re-cite |
| `op=caseratify`, `op=ratify` | index 10918–11858 | (a) index 6493–6707, 6718–7429 | re-cite |
| `caseEditionClaimed`, `isCaseMemberBytes` | bc 233–268 | (a) bc 233–256. The copy's layer-1 caller (C-3.1) is now bc 1277, not 1295. Other callers: store import 427, index 65/7028 | re-cite |
| `SUBJECT_POSITIONS`, `CASE_MEMBER_ROLES`, `biasAcknowledgementOf`, `completenessFields`, `checkPublishedExtension` | bc 2932–3275 | (a) bc 2668, 2682, 2701, 2706–2717, 2719–2944 | re-cite |
| `SEARCHED_SUBJECT_SOURCES` … `checkCaseDocument` | bc 11462–12078 | (a) bc 9891–9896, `CASE_DOCUMENT_FAMILY` 9922–9942, 9944, `checkCaseDocument` 9949–10376 | re-cite |
| C-92.10–.12 / C-65.1 / C-58.1–.3 / C-32.12–.15 / C-53.10–.12 | various | (a) bc 11407–11425 / `CASE_CONCLUSION_CHECKS` 11955–11964 / `RATIFY_SCOPE_CHECKS` 12026–12058 / 8076–about 8120 (inside `MACHINE_FENCE_CHECKS` 7964–8167) / 11515–about 11540 (inside `TESTIMONY_CHECKS` 11427–11554, which provenance also reads: provenance/index.mjs 2103, 2211) | re-cite; keep the note that provenance reads `TESTIMONY_CHECKS` |
| `#projectsDrawingOn` (§2) | 28423, "to basis-versions" | (b) basis-versions **R37**; store delegate 11095 | say: read through basis-versions R37 |
| `#conclusionOf`, `#conclusionRecordOf`, `#noProjectConclusionOf` | 6260–6358 | (b) basis-versions **R22, R23**; store delegates 2836–2838 | say: read through basis-versions R22/R23 |
| `#memberTextAtSha` | 10107 | (a) store 6444; record-core R60 (K203) is not built | as publication |
| `recordReuseVerdicts`, `reusedParts`, `captureLimit` | 46216 | (b) capture/index.mjs 1009, 992, 1084 (capture **R26, R25, R23**); store delegates 16993–17001 | say: capture R23, R25, R26 |
| `partsHeld` | index 4560, "provenance" | (b) `provenance/index.mjs` 508 (provenance **R7**), imported at index 151, used at 6960/7212 | say: provenance R7 |
| `#caseAuthority`, `#inSight`, `#existenceAct` | 33180 | (b) membership; store delegates 14599, 14601, 14607 | re-cite |

**§3 callers, stale entries**
- `checkPublishedExtension`'s caller is no longer "inquiry's `checkInquiryExtension`". Under K181 (1), inquiry's grammar stays in legacy-checks with `inquiry/grammar.mjs` as its public face, so the call is legacy-checks' own: bc 2483, inside `checkInquiryExtension` 2351–2550, which `checkBundle` calls at 5410. Edit: R9 registers the arm with promotion, and the job removes the call at bc 2483 (legacy-checks is in ratification's `from`). "inquiry's grammar stops calling it" should read "legacy-checks' `checkInquiryExtension` stops calling it".
- `checkCaseDocument`'s callers are `gate.mjs` 35/336 (`runCaseGate`) and index 7028/7033 (via `completenessFields`). Promotion now has **R47** `registerCaseCatalogue` (K202). §6 item 5 is resolved: say R8 fills promotion R47.
- `SEARCHED_SUBJECT_SOURCES` in `airun.mjs`: import 92, re-export 205, uses 248/251. It is imported into the store at 322.
- `completenessFields` callers are store 5194 (`publishCase`) and 8408 (`ratifyCaseDocument`), and index 7033. `SUBJECT_POSITIONS` callers are store 4426 (`publishCase`) and `affordances.mjs` 70/553.

**Uses check.** Matches modules.json and ratification.md. One entry is still not built: `textAtSha`.

---

## 3. case-authoring (`build/extraction/case-authoring.md`)

| item | map says | now | proposed map edit |
|---|---|---|---|
| `publishCase` | 7975–9273 | (a) store 4311–5583 (header from about 4301) | re-cite |
| `CASE_CITATION_WORDS` … `#searchedForCase` | 9274–10035 | (a) store 5611–6355 (`#caseDocumentText` 5661–6145, `#caseConclusionRowLines` 6154, `#searchedForCase` 6214–6355, its `searchedSection` call 6354) | re-cite |
| acknowledgements `STATEMENT_ACK_MAX` … `#statementWriter` | 11079–11815 | (a) store 7415–8140 (`acknowledgeStatement` 7420, `#reauthorAcknowledgements` 7863–7899, `#statementAcknowledgements` 7953–8042, `#statementWriter` 8077–8140) | re-cite |
| `COMPLETENESS_MAX`, `MEMBER_ROLES` | 12183–12197 | (a) store 8518, 8532 | re-cite |
| `SEARCHED_SUBJECT_MAX` | 42195 | (a) store 17443 | re-cite |
| dispatch | 49645–49785 | (a) store `publishcase` 19289, `statementack` 19386 | re-cite |
| **`airun.mjs` 1405–1638** | `searchedSection`, `SEARCHED_LEVEL_OUTCOMES`, re-export | (a) still in `airun.mjs`, which ai-runs kept (K181 (5)): header 146, re-export 194–205, `SEARCHED_LEVEL_OUTCOMES` 209–223, `searchedSection` 245–366 | re-cite as airun 146–366. **draft-T8's case-authoring entry cites "store.mjs 360/7989"; the lines are now store 322 (the import) and 6354 (the call)** |
| C-44.1, .3–.5 / C-82 / C-32.6 | bc 9081–9190 / 14237–14344 / 9247 | (a) bc 7854–7910 (C-44.2 at 7876 is publication's) / `STATEMENT_ACK_CHECKS` 12438–12502 / 8021 | re-cite |
| `statement_acknowledgements` | schema 3576 | (a) schema 1031 | re-cite |
| `#projectBar`, `#barAxisWords`, `strengthOf`, `STRENGTH_AXES` (§2) | store 13220, 32206, 31644 | (b) strength: `projectBar` strength/index.mjs 683 (**R14**), `barAxisWords` 78 (exported; the store imports it at 398 and uses it at 6122), `strengthOf` 247 (**R1–R5**), `STRENGTH_AXES` arithmetic.mjs 16. Store keeps delegates 13946–13947. `#projectBar` is (c) gone from the store; calls are `strengthModule(this.ctx).projectBar` at 4741 and 7352 | say: strength R14 and R1–R5, and name `barAxisWords` as strength's export |
| `biasManifest` | store 48076 | (b) `bias/index.mjs` 330–513; store delegate 18852 | re-cite |
| `#missingMeaningCause`, `#missingContentCause`, `MEANING_EVIDENCE_IS_ONE_SIDED` "to observation-log" | store 42742, 41690; airun 790 | **split.** The rule is (b) observation-log's R11 (`missingCause`, `missingCauseAt`, `firstRowAt`; observation-log/index.mjs 101, 452, 472), and `MEANING_EVIDENCE_IS_ONE_SIDED` is at observation-log/vocabulary.mjs 731 (re-exported by airun 114). The **evidence probes are (a) still in the store**: `#missingContentCause` 17434–17437 and `#missingMeaningCause` 17502–17514, which run SQL on `readings`, `resolutions` and `connections`. Their only callers are in `#searchedForCase` (6328, 6348, capture kind only) | say: the probes move **with case-authoring**, their only caller, calling observation-log R11. See problem P3 |
| `#reevalRaisedBy` | store 4798, "reevaluation" | (a) store 2145–2150. It is registered in reevaluation's name at store 732 (`inquiry.onRaised`) and 754 (`promotion.onReopened`), and `publishCase` calls it at 5320. Reevaluation **R7** `raise` is **not built** (the reevaluation job branch has no code yet) | say: R15 calls reevaluation R7 `raise` once T7's reevaluation merges; the store copy and its two registrations go with that job |
| `testimonyReach` | 20645, basis-versions | (b) basis-versions R39 (store 5462) | say: basis-versions R39 |
| review helpers | 10348–10660 | (a) store 6606–7381 | re-cite |
| `SELECTION_ID_CHUNK` | store 3353, "own copy" | (b) retrieval/schema.mjs 100, re-exported from retrieval/index.mjs 33; the store's `static` at 1552 re-exports it | keep the K57 copy (retrieval is not in case-authoring's uses), or add the use |
| `refusal()`, `#fmSafe` | 601, 13167 | (a) store 528–531, 8542–8544 | re-cite |

**§3 callers.** `publishCase` ← `#reviewGates` 6909–6930 (at 6914). `#statementAcknowledgements`/`#withheldWriterStated` ← `reviewCopy` 7264/7278. `#statementSha` ← `acknowledgeStatement` 7603.

**§5/§6 item 1** stands: ai-runs kept the copy (K181 (5)), and N138 deletes it in a later tranche (draft-T8 "Order").

**Uses check.** modules.json matches case-authoring.md. case-authoring.md names observation-log services `missingMeaningCause` and `missingContentCause`, which **do not exist** under those names (see P3).

---

## 4. review (`build/extraction/review.md`)

| item | map says | now | proposed map edit |
|---|---|---|---|
| REC-126 block … `reviewComment` | 10271–11047 | (a) store 6606–7381 (`reviewAct` 6702, `#caseDraft` 6815–6896, `#reviewGates` 6909, `#grantAdmitsCaseEdition` 6968, `#reviewGrant` 6997, `#reviewLastChange` 7092, `reviewCopy` 7150–7354, `reviewComment` 7356–7381) | re-cite |
| REC-198, `caseDraftList` | 11806–11845 | (a) store 6981 (REC-198 header of the draft fence), `caseDraftList` 8152–8179 | re-cite |
| migration `case_drafts.statement_by` | 1340 | (a) store about 962 | re-cite |
| dispatch | 49765–49789 | (a) store 19372–19392 | re-cite |
| C-87 / C-32.16 | bc 14303 / 9383 | (a) `REVIEW_COPY_CHECKS` bc 12546–12621 / 8149 | re-cite |
| tables | schema 3505–3574 | (a) schema `case_drafts` 965, `review_grants` 993, `review_comments` 1010; purge at store 658–659 | re-cite |
| `#projectBar` (§2) | 13226, strength | (b) strength R14; `reviewCopy` 7352 | say: strength R14 |
| `testimonyReach` "provenance (K49)" | 20661 | (b) **basis-versions R39** (`reviewCopy` 7325) | fix the owner to basis-versions (K202) |
| `#attributionInForce` | 20722 | (a) store 9723 (publication's) | re-cite |
| `publishCase`'s draft binding "→ publication" | 8725–8760 | (a) inside `publishCase` (`draftNamed` 5060), **case-authoring**'s since K97 | fix the owner to case-authoring |
| `#statementWriter` direct SQL on `case_drafts` "publication's" | 11750 | (a) store 8077–8140, **case-authoring**'s | fix the owner |
| id-prefix census `DRAFT`, `RVG` | 30751 | (a) store 13206–13207; record-core/index.mjs 218/223 also names the prefixes | re-cite |
| `reviewAnswer` | index 3678 | (a) index 3373–3400 | re-cite |

**§5 item 3 (Uses): mostly resolved.** modules.json has been fixed (K202): `legacy-checks, record-core, membership, basis-versions, strength, publication, case-authoring`. But `build/requirements/review.md`'s Uses section **still ends with "`inquiry`, `basis-versions`: declared; nothing in this module's share calls them"**, which contradicts its own `basis-versions` entry two lines above. Delete that line. The map's §5.3 proposal is superseded, and item 2 is closed (the acknowledgements are case-authoring's, K97).

---

## 5. actions (`build/extraction/actions.md`)

| item | map says | now | proposed map edit |
|---|---|---|---|
| `actionClockNext`, `actionOverdue` | 1814–1841 | (a) store 1086–1106. Retrieval now takes them by **R53** `registerActionFacts`, which legacy-store fills at store 699–706 | say: actions registers R12 with retrieval R53, replacing store 699–706 |
| `#actionDerived` | 2090–2161 | (a) store 1144–1197. It reaches retrieval by **R56** `registerProjectionDecoration`, which legacy-store fills at store 711–719 **as one function shared with inquiry's `no_project_conclusion` and `surfaced_in`** | say: actions registers its own R56 decoration, and legacy-store's registration keeps the other keys (see P5) |
| `CORRESPOND_LEASE_MS` | 4320 | (a) store 2135 | re-cite |
| `actionMove` … `#spliceCorrespondence` | 6677–7835 | (a) store 3070 (REC-24 (c) header)–4228, contiguous (`actionCorrespond` 3289, `actionLaws` 3573, `actionRiskTier` 3767, `actionLawsPropose` 3913, `#respondsToInto` 4009, `actionQuotes` 4070); `#appendSessionLog` 4163–4169 is copied | re-cite |
| inside `promote`: governing-laws fence / action and `responds_to` arms / three projections | 17480 / 17694–17842 / 18531–18617 | (a) `promote` is now promotion's (store 9210 delegates). The arms are in **legacy-store's registered step** (store 747): `#promoteChecks` 9216–9490, with the laws fence 9257–9288 and the action arm plus risk tier plus `responds_to` 9338–9487; `#promoteProjections` 9494–9638, with the action projections 9508–9594 | say: carved out of legacy-store's `#promoteChecks`/`#promoteProjections` into actions' own promotion R39 step |
| `LAW_PROPOSALS_READ_MAX` | 22213 | (a) store 9993 | re-cite |
| purge counts | 30946, 31085 | (a) store 13397–13401, 13534; list 644–645 | re-cite |
| dispatch | 49361–49410 | (a) store 19169–19212 | re-cite |
| DDL | schema 1903–2025, 3784 | (a) schema `action_basis` 678, `correspondence` 725, `action_quotes` 760, `action_law_proposals` 1136 | re-cite |
| `ACTION_KINDS` … `RESOLUTIONS` | bc 516–838 | (a) bc 524–838 | re-cite |
| `lawProposalLabel` (§5.4, open) | bc | (a) bc 782–796; callers store 3947, 3979. **Resolved by K171 (2)/N129:** stays in legacy-checks, gains `proposalLabel`, keeps `lawProposalLabel` | close §5.4 |
| `RFC_…` … `COUNTERPARTY_PLACEHOLDER` | bc 858–929 | (a) bc 847–910. bias also has a private `ENTITY_ID_RE` (bias/checks.mjs 10) | re-cite |
| `respondsToEdgeFindings` | bc 2344–2405 | (a) bc 2101–2114, called at bc 2042 and store 9473 | re-cite |
| `checkCounterparty` … `checkActionExtension` | bc 4396–5023 | (a) bc 4143–4758 (`checkActionExtension` 4716–4758, called at 5418) | re-cite |
| C-32.3, C-32.19, C-32.4 / C-32.18 | bc 9208–9238 / 9394–9421 | (a) bc 7982 / 7996 / 8005 (contiguous 7980–about 8012) / 8160. **Precedent for the split now exists:** strength took C-32.9 whole out of `MACHINE_FENCE_CHECKS` into `strength/checks.mjs` 226–227 (K181 (3)), leaving no row behind. Key references to fix: store 3122, 3297, 3577, 3736; index 476–493; affordances 1840–1849 | cite strength's precedent; list the key references |
| `GOVERNING_LAW_CHECKS` / C-33.3–.9 / C-72 / C-94 / C-90 | bc 9422 / 9591 / 13911 / 15385 | (a) bc 8187–8222 / 8357–8399 (inside `ACT_SHAPE_CHECKS` 8255–8598) / 12110–12159 / 12165–12232 / 13655–13689 | re-cite |
| `themeLegFindings` (§2), "connections (K79)" | bc | (a) text in bc 12728–12758; public face is connections **R46** (connections/index.mjs 55). `actionBasisFindings` calls it (bc 4267) | say: import from connections R46 |
| `projectionOf`/`ADDITIVE_COLUMNS`/`PROJECTION_COLS` (§2) | store 1117–1858 | (b) retrieval (projection.mjs) | say: done (retrieval R2, R53) |
| `this.#bundleGate`/`viewerPredicate` → membership | store | `viewerPredicate` is (b) membership R43 (membership/index.mjs 31; `query.mjs` 1012 re-exports it; the store imports it from query at 240). `#bundleGate`/`#bundleRedactor` are (a) store 9157/9177, and **none of actions' ranges call them** | say: `viewerPredicate` from membership R43 |

**Uses check.** modules.json now reads `legacy-checks, jurisdictions, record-core, membership, promotion, provenance, content, connections, inquiry, conformance`. That matches the proposal in §5.2 (add promotion and provenance, drop strength and consequences), and actions.md Uses agrees. Close §5.2.

---

## 6. monitoring (`build/extraction/monitoring.md`)

| item | map says | now | proposed map edit |
|---|---|---|---|
| D-525, `DRIVE_SHELLS_*`, `driveShells` | 16935–17009 | (a) store 9025–9098 | re-cite |
| D-65, `monitorObservationFor`, `recordMonitorLook`, `#recordMonitorAddressType` | 46072–46214 | (a) store 17619–17761 | re-cite |
| CAP-3 … `#monitorTick` | 47030–47244 | (a) store 18178–18392 (`#monitorTokenBound` 18272, `#monitorToken` 18275, `#monitorConfigured` 18291, `#monitorFloor` 18300, which already reads `capture.reachabilityThresholds` (capture **R43**), `#monitorPending` 18306, `#monitorTick` 18319) | re-cite; the `#thresholds` rewire is done |
| REC-26 idempotence, `#tickRunning` … `#claimFire` | 47246–47321 | (a) store 18394–18469. **capture-requests no longer shares `#tickRunning`**: it holds its own guard (capture-requests/index.mjs 389). `#tickRunning` is used only by `archive-monitor` and `monitor-cadence` | drop "capture-requests keeps its own (it shares the Set today)": all of it moves |
| REC-26 cadence … `#fireArchiveFallback` | 47323–47700 | (a) store 18471–18848 | re-cite |
| routes `driveshells`, `monitorlook` | 48564, 48676 | (a) store 18939, 18988 | re-cite |
| `CONTRACT_FREQUENCY` alias … `monitorRecordLook` | index 3044–3136 | (a) index 2735–2827 | re-cite |
| `op=monitor` | index 10304–10914 | (a) index 5887–6484 | re-cite |
| `GATH_ID_RE` … `checkGatheringGrammar` | bc 5277, 5664–5733 | (a) bc 4787–4790, 5001–5060; `checkBundle` calls it at 5406 | re-cite |
| gathering check "inside `promote()`" | 17525–17549 | (a) now inside legacy-store's step `#promoteChecks`, store 9299–9323 | say: carve out of `#promoteChecks` into monitoring's promotion R39 step |
| DDL | schema 1860–1901, 3885–3905 | (a) schema `monitor_fired` 622, `monitor_tick_epoch` 645, `monitor_address_type` 1164 | re-cite |
| purge | store 884, 890 | (a) store 654, 659 | re-cite |
| `FALLBACK_*`, `#thresholds` (§2) | 46996 | (c)/(b) gone from the store; capture R43 (capture/index.mjs 1184) | say: done |
| `recordSourceOutcome`, `sourceReachability` | 47702–47821 | (b) capture/index.mjs 1204, 1229 (capture R8); store delegates 17000–17001 | say: done |
| `substanceDigests`, `profilesAsText` | index 2969–3042 | (b) capture/acquire.mjs 75, 66 (imported at index 155); `captureKey` is (a) index 4141 | say: capture R17 via acquire.mjs |
| `MONITOR_FREQ`, `MECHANICAL_FIELD_SETS`, C-48.8/.9 | bc 1510, 5876, 11254 | (a) bc 1492, 5203–5208, 9738/9752 | re-cite |
| registry entries, the promote arm, the `recordSourceOutcome` arm (§2, scheduler) | 3453–3555, 48512, 47760 | (a) registry store 1634–1637, 1723–1726. The promote arm is now `promotion.onCommitted` at store 749–752 (promotion **R45**), and the source-outcome arm is `capture.on("source-outcome")` at store 763 (capture **R44**). Both read `#monitorConfigured` | say: the scheduler reads monitoring's `configured()` inside its R45/R44 listeners |
| `#monitorToken` read by capture-requests (§3, §5.4) | store 40137, 40829 | (c) **gone.** capture-requests has its own `unattendedBound(env)` (capture-requests/index.mjs 125, K181 (6), runtime-limits R26's `bound` injected until built) and fires in process with no credential. `#monitorToken` is read only by `#fireMonitorTick` 18806 and `#fireArchiveFallback` 18829 | drop the capture-requests rewire; runtime-limits R26 (T8 layer 1) serves monitoring alone, and capture-requests' `unattendedBound` copy retires when R26 is built |
| `Store.CONTRACT_FREQUENCY` read by index | 3054 | (a) index 2745 | re-cite |
| **intent** (R33) | uses | intent is on `origin/job/T7/intent`, not merged. `watchSet({project}) → {entities, progressions, captures}` is at intent/index.mjs 463 on that branch | say: R33 reads intent's `watchSet` |
| **reevaluation** (R33) | uses | R33's "reaches reevaluation as R8's flag" is the document's own `reeval_pending` (monitoring R8), which reevaluation reads from the bytes (its R4 `stored`, C-10.1). **No monitoring→reevaluation call.** K199 (1) says reevaluation's `raiseNotices` sweep is called by "scheduler or monitoring" | say: no call unless monitoring drives `raiseNotices` (see P6) |

**Uses check.** modules.json has the proposed set (the eleven added; `extraction` and `content` dropped) plus `intent, reevaluation, publication, actions, escalation`. Close §5.1–5.2. Code that is **not in the Uses**: `#monitorPending` 18308 and `#monitorTick` 18334 SELECT from `source_reachability`, which is capture's table, and capture states no read contract for it (see P4).

---

## 7. scheduler (`build/extraction/scheduler.md`)

| item | map says | now | proposed map edit |
|---|---|---|---|
| SCHEDULER header, `SCHED_GRACE_MS` | 3382–3429 | (a) store 1555–1603 (`SCHED_GRACE_MS` 1602, `#lastDrainProgress` 1603) | re-cite |
| `#schedConsumers` | 3439–3785 | (a) store 1612–1956, 13 entries plus the probe | re-cite |
| `alarm`, `onAlarm` | 3787–3880 | (a) store 1964, 1966–2051 | re-cite |
| `#reconcileAlarm`, `#armScheduler` | 3882–3913 | (a) store 2062–2071, 2077–2083 | re-cite |
| probe seam | 3922–3950 | (a) store 2100–2121 | re-cite |
| the route arms (`promote`, `biasadopt`) | 48512, 49030 | (c) replaced by the notices already built and filled by legacy-store: `promotion.onCommitted` 749 (**R45**), `bias.onLensChange` 740 (**R23**), `retrieval.onSelectionCreated` 721 (**R52**), `progressions.onThreaded` 766 (**R33**), `capture.on("task"/"source-outcome")` 762–763 (**R44**) | say: the scheduler takes over these five registrations from legacy-store (entities R13 is not yet filled) |

**§2 consumers: who each entry calls now**

| consumer | map says | now (store line) |
|---|---|---|
| selection-sweep | `#sweepSelections`, needs a wake | (b) retrieval **R51** `sweepWake` and **R22** `sweepSelections` (1614–1617); §5.3's gap is closed |
| task-drain | unowned | (a) `taskDrain` store 17853–17936, `#drainDelayMs` 1541, `#lastDrainProgress`. Capture **R45** names `queue` (K91 (3)) as the drainer, so §5.2's owner is **queue** (layer 11) and legacy-store registers it until then |
| archive-monitor, monitor-cadence | monitoring R20, R19 | (a) store 1634, 1723 → `#monitorPending`/`#monitorTick`/`#monitorCadence*` (monitoring's code, §6) |
| connection-derive | `#deriveConnectionsSweep` | (b) `connectionsOf().wake/sweep` (1648–1651; connections/index.mjs 791, 797); the store methods are gone |
| overdue-scan | `#overdueScan` | (b) progressions **R17** `overdueScan` (1672–1675) |
| queue-renotify | queue | (a) `#queueRenotifyExpired`/`Wake` store 12968–12983 |
| **ai-run-reap** | `#aiRunReap*` | (b) ai-runs **R15** `reapDue/reapWake/reap` (1752–1755) |
| **capture-request-drain** | `#captureRequestPending` … | (b) capture-requests **R37** `drainPending`/`drainIntervalMs` and R11 `drain` (1773–1776); §5.3's gap is closed |
| **ai-run-wake** | `#aiRunWake*` | (b) ai-runs **R16/R17/R41** `wakeDue/wakeWake/wake` (1855–1860), with capture-requests as the registered wait source |
| calibration-reprobe | calibration R9 | (b) `calibrationOf().calibrationDue/Wake/Tick` (1912–1915) |
| group-domain-recheck | instance-setup | (a) store 14433–14442 |
| bias-debt | `#biasDebt*` | (b) bias **R41** `biasDebtDue/Wake` and R33 `biasDebtSweep` (1940–1943); §5.3's gap is closed |

Rewrite §2's "its services today" column with these. §5.3 is mostly closed; what remains open is promotion R39 versus post-commit, which R45 `onCommitted` now answers. §5.4 still stands: capture-requests, ai-runs and calibration still arm nothing.

**Uses check.** modules.json has the proposal of §5.1 (`progressions`, `bias`, `entities`, `promotion` added; `record-core`, `host-governor`, `extraction`, `strength`, `reevaluation` dropped) and keeps `intent`. Close §5.1. See P6 for two consumers the map and requirements lack: intent's `ageSurfaced` and reevaluation's `raiseNotices`.

---

## 8. conformance and consequences (extraction maps §2's service tables)

| statement (map:line) | service | now | edit |
|---|---|---|---|
| conformance 29, consequences 29: inquiry `supersededBy`, `stateHistory` "(R19, not yet met: D-592) … no inquiry module; its job in the next plan" | inquiry | **Provided and merged** (inquiry COMPLETE, K189/K190): `supersededBy` at inquiry/index.mjs 474 (in the R16–R19 reads, unnumbered), `stateHistory` 491 = inquiry **R19**, with no not-yet-met mark in inquiry.md | say: provided, inquiry R19 and the `supersededBy` read (inquiry.md line 38) |
| conformance 30, consequences 30: strength `inquiryStrength` "still store.mjs 21861; its job in the next plan" | strength | **Provided and merged** (K188): strength/index.mjs 258 = strength **R6**; no store copy remains | say: provided, strength R6 |
| conformance 31: reevaluation `onBasisChanged` (R8) "no reevaluation module; its job in the next plan" | reevaluation | **Not provided.** reevaluation.md R8/R9 are still *not yet met*. `origin/job/T7/reevaluation` (4 commits ahead, all mail; readings K199) has **no code yet** | say: T7's reevaluation job builds R8 and R9, not yet merged; re-check at T8 layer 9 |
| conformance 32: publication `publishedEditionsOf` (R37) | publication | not provided (T8 layer 8) | unchanged |

conformance.md and consequences.md (the requirements) carry no such statement: their Uses name these services without a mark. Only the two extraction maps need editing.

---

## Real problems

- **P1 · review.md is self-contradictory.** Its Uses gives `basis-versions: testimonyReach (R39)` and then ends with "`inquiry`, `basis-versions`: declared; nothing … calls them". modules.json is right after K202. Delete the last line.
- **P2 · Most "moves to X" items in the layer-8 maps are still in legacy-store, behind registrations that legacy-store fills in other modules' names.** The fact registrations `caseMember`/`publishedRegistry` (store 728–729), the retrieval registrations `registerActionFacts`/`registerProjectionDecoration` (699–719), the promotion step (747, with the action, gathering and C-2.10 arms inside `#promoteChecks`), `onRaised`/`onReopened` for reevaluation (732, 754), and five scheduler notices (721, 740, 749, 762–763, 766). Each target job must **edit or split these legacy-store registrations**, not just import and rewire. The worst case is the shared decoration (P5). Say so in each map's §5.
- **P3 · case-authoring's observation-log reads name services that do not exist.** case-authoring.md Uses gives observation-log `missingMeaningCause` and `missingContentCause`. observation-log provides `missingCause`, `missingCauseAt` and `firstRowAt` (R11). The two probes (store 17434–17437, 17502–17514) are legacy-store's, called only by `#searchedForCase`, and run SQL on `readings` (extraction). Their unused `reference`/`entity` arms read `resolutions`/`connections`, which are not in case-authoring's uses. Ruling needed: case-authoring moves the probes (capture arm only), or observation-log gains a service. Fix the Uses wording either way.
- **P4 · monitoring reads capture's `source_reachability` directly.** `#monitorPending` (store 18306–18310) and `#monitorTick` (18334) do this, and capture states no read contract for the table, only `sourceReachability(addressNorm)` per address and `reachabilityThresholds`. monitoring needs capture to state a read contract, or a "failing addresses at or over the floor" service; otherwise it would write SQL on another module's table.
- **P5 · retrieval R56 allows one decoration per module, but legacy-store's one function mixes owners.** It holds actions' `action`, inquiry's `no_project_conclusion` and ai-runs/inquiry's `surfaced_in` (store 711–719). When actions registers its own, legacy-store's function must be edited to drop the action arm. That is a change of existing legacy code, not an ADDED line.
- **P6 · scheduler consumers missing from the map and from scheduler.md.** intent R17 `ageSurfaced(now)` is "called by scheduler" (intent.md 51), with no due or wake service stated. Reevaluation's `raiseNotices` sweep (K199 (1)) is "called by scheduler or monitoring", and scheduler's uses dropped `reevaluation`. scheduler R10's "rank by intent" has no named intent service: intent Provides has `gaps`, `watchSet`, `aspirationsFor` and no "which objective does this work serve". Needs BOB: add the consumers and the reevaluation use, and name intent's rank read.
- **P7 · draft-T8's case-authoring entry cites stale lines** ("re-pointing `store.mjs` 360/7989"). They are now store 322 (the import) and 6354 (the call in `#searchedForCase`).
- **P8 · ratification's `checkPublishedExtension` caller is legacy-checks', not inquiry's** (bc 2483 in `checkInquiryExtension`, kept in legacy-checks by K181 (1)). Removing the call is inside ratification's `from`, so it is allowed, but ratification.md "Decided 2" ("inquiry's grammar stops calling it") and the map §3 should say legacy-checks.
- Minor: record-core R60 `textAtSha` is stated (K203) but not built; publication and ratification depend on T8 layer 2 building it first. strength.md line 88 says publication calls `projectBar`; case-authoring and review do.
