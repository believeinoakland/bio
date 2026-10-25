# Fix round 10 of T51: the waves (fixture round and cause jobs)

**Status** · Draft for BOB, second edition on `prep/starts-r10`, after K5051 to K5057 and the placement files (`placement-R10-a.md` to `-c.md`, `diagnosis-R10-d.md`, `fix-round-10-T51.md` §1). First edition: `a1fbdcdda1`. Sources: the fixtures check's live list at the tranche tip (2,936 lines, 109 modules; unchanged by the merge), `fixtures-T51/part-1.md` to `part-4.md`, `op-tables.md`, K4990, K4993, K4995, K5044 to K5046, K5052, K5054, K3518. One START per job: `build/plan/starts-T51-F10/<module>.txt` (98). One HANDOFF for UX-DESIGN: `build/plan/fix-round-10-words.md`.

## 1. How jobs were placed (K5051, BOB's instructions of this step)

- **Batched by dependency**, not by bare modules.json order: a provider's fixture is merged in an earlier batch than the users whose own lines re-point to it (a hill-climb over the 85 fixture jobs, 17 per batch: about 245 of the 280 own FIX-E lines of those jobs are done in their own job, the rest stay Wave B). A provider no live finding uses gets no fixture job (7 named by the parts: agent-steps, basis-versions, calculations, corpus-export, doorbell, office-readers, reevaluation; three of them have a job for a cause).
- **Fixture jobs** (85): `store-assembly` and `store-request` (new), the three enabling modules `wizard-scripts`, `translations`, `signin-door`, `plane`, `control-plane` (batch 1), and every provider with a live user. `store-assembly` is batch 2 (needs batch 1 merged), `store-request` batch 3 (builds on it). **Cause-only jobs** (13): a cause-owning module with no fixture work is a new START, put in the first batch with room. A module with both fixture and cause work runs once, in its fixture batch (28 modules own a re-walk 9 cause or entry 4).
- **Batch size** at most 20 sessions (K4215). Providers first: a job opens when the batch before it is merged.
- **Pending marker.** A module with findings the audit classed FALSE or left unclassed (op-table entries, builder call sites) carries `[fixtures: pending part-5 / check v3]` in its START in place of those lines; its classified lines (FIX-E, FIX-L, CODE) are final. Another worker is fixing the check (`prep/fixtures-v3`) and classifying the unclassed lines (`fixtures-T51/part-5.md`); BOB posts nothing until both are reviewed.
- **Model (K3518):** haiku-5-5 for test-only provider jobs and mechanical re-points; sonnet-5-5 for every cause job and for provider jobs with judgment fixtures; the default model only for `store-assembly` and `store-request` (new modules).

## 2. Batches

| Batch | Jobs | Modules (modules.json order; cause-only jobs in italics) |
|---|---|---|
| 1 | 20 | *`subresources`*, `pdf-pixels`, `pdf-worker`, `ocr-worker`, `file-scanner`, `record-core`, `membership`, `credentials`, `provenance`, `capture-sources`, `file-safety`, `retrieval-browse`, *`inquiry-grammar`*, `wizard-scripts`, `translations`, `admission`, `signin-door`, *`screens-inquiry`*, `control-plane`, `plane` |
| 2 | 20 | *`office-readers`*, `pdf-reader`, `ai-accounts`, `promotion`, `attestation`, `acquisition`, `capture`, `sources`, `local-facts`, `standards`, `duties`, `retrieval`, *`basis-versions`*, `ratification`, `case-import`, `case-inputs`, `conformance`, `answer-envelope`, `store-assembly`, *`screens-intake`* |
| 3 | 20 | *`csv-reader`*, `member-roster`, `project-roster`, `reading-pipeline`, `extraction`, `entities`, `events`, `progressions`, *`calculations`*, `inquiry`, `steps`, `capture-requests`, `answers`, `case-carriage`, `publication`, *`case-catalogue`*, `case-checker`, `consequences`, `actions`, `store-request` |
| 4 | 20 | `doc-clean`, *`content`*, `lines`, `people`, `bias`, `strength`, `contradiction`, `ai-use`, `ai-runs`, `run-productions`, `agent-runner`, `intent`, `public-read`, `case-account`, `case-authoring`, `action-clocks`, `action-plans`, `plan-work`, *`screens-entry`*, *`screens-daily`* |
| 5 | 18 | `sheet-worker`, `money-checks`, `agent-worker`, `publish-schedule`, `docket`, `network-notices`, `case-disclosures`, `review`, `case-check`, `escalation`, `monitoring`, `following`, `link-sweep`, `action-producers`, `instance-setup`, `store-door`, *`interface-assets`*, `screens-action` |

Sequencing:
1. **Batch 1 holds the enabling jobs.** `wizard-scripts` (receives `ADMIN_ACTS`/`ADMIN_SCREENS`), `translations` (declares `interfacewords` and deletes control-plane's row, self-contained), `signin-door` (declares `subscriptionsignin`, deletes control-plane's row) and `plane` (`OWNERS` gains `signin-door`; its LOAD-RED 5 (1) study first). **Coupled merge:** signin-door's export and plane's `OWNERS` entry arrive together (plane's test names every module exporting `DECLARED_OPS`). The two row deletions in `control-plane/owner-ops.mjs` are outside those modules' `paths`: each lists them in COMPLETE and BOB adds them before the ownership check (K5052 (4), K1043). `control-plane` no longer removes the rows.
2. **`store-assembly` (batch 2) then `store-request` (batch 3)** are the critical path: the world (`storeWorld()`), its door, sign-ins and recipes are store-request's (K5054); interface-shell's `boot({door})` follows it, then the screens' op-table jobs (Wave B). Requirements: `build/requirements/store-assembly.md` and `store-request.md` on `prep/store-assembly-reqs`, being revised; BOB adds both `modules.json` entries.
3. **Gates:** `interface-assets` (R32) starts only when UX-DESIGN's scroll rule is merged. `screens-daily` (batch 4) draws R17a after `retrieval-browse` (batch 1). `screens-inquiry` (batch 1) gets R30b's screen half, R23's `repairs` draw and R9's draw as a CHANGE after `inquiry-grammar` (batch 1), `inquiry` (batch 3), `basis-versions` (batch 2) and reading-pipeline's R9 (batch 3) have merged. `inquiry` must follow `inquiry-grammar` (it does).
4. **Contract lines wait on each other** (`orphan-run`, `contract-no-run`, `checks/fixtures.mjs:776-779`); each START says which may remain. After Wave B moves the registrar code to `store-assembly`, plane's contract tests keep working because they run through plane's real `Store`.

## 3. The 98 jobs

`#` = position in `build/modules.json`. `a/s/c` = the check's answer/stub/code lines on the module. `Pending` = FALSE-classed or unclassed lines (placeholder in the START). `Wave B` = classified fixture lines the job cannot do (their provider merges in its batch or after) plus module work of the rulings; they arrive as a CHANGE to the same job.

| Batch | # | Module | Role | Causes | Fixture work | Wave B / pending | a/s/c | Model |
|---|---|---|---|---|---|---|---|---|
| 1 | 13 | `subresources` | cause only | R15 | - | none | 0/0/0 | sonnet-5-5 |
| 1 | 29 | `pdf-pixels` | provider | R6 | fixtures `pageRefusal`, `pixelRefusal`, `renderedPage` | none | 0/0/0 | sonnet-5-5 |
| 1 | 32 | `pdf-worker` | provider | R8 | fixtures `tier2Answer` | pending part-5/v3: 1 | 1/0/0 | sonnet-5-5 |
| 1 | 33 | `ocr-worker` | provider | R7 | fixtures `memberRefusal`, `memberWorker`, `pageNotRenderable` | job: FIX-E 2; after batch 1; pending part-5/v3: 1 | 1/2/0 | sonnet-5-5 |
| 1 | 35 | `file-scanner` | provider | R11c | fixtures `reputationRefresh` | none | 0/0/0 | sonnet-5-5 |
| 1 | 37 | `record-core` | provider | - | fixtures `coreOver`, `evidencePartsRefusal`, `perItemRetained`, `tableDeclarationRefusals` | pending part-5/v3: 1 | 1/0/0 | sonnet-5-5 |
| 1 | 38 | `membership` | provider | - | fixtures `projectActRefusals` | pending part-5/v3: 6 | 5/0/1 | haiku-5-5 |
| 1 | 41 | `credentials` | provider | R24 (a) | fixtures `securityMapRefusal` | job: FIX-E 8; after batch 3; pending part-5/v3: 1 | 7/2/0 | sonnet-5-5 |
| 1 | 44 | `provenance` | provider | - | fixtures `heldParts`, `holdsOf`, `holdsRegister`, `homeOf`, `homeOfEmpty`, `homeOfHomed`, `homeOfWorld`, `provenanceOver`, `registeredHomes`, `versionChainNoSuchVersion` | pending part-5/v3: 1 | 1/0/0 | sonnet-5-5 |
| 1 | 47 | `capture-sources` | provider | - | fixtures `renderFailure`, `renderRefusal` | pending part-5/v3: 1 | 0/1/0 | haiku-5-5 |
| 1 | 51 | `file-safety` | provider | R39a | fixtures `batchTickAnswers`, `declaredRefusals`, `scannerAbsent`, `toolTestFailed`, `toolTested` | job: FIX-E 2; after batch 1 | 2/2/0 | sonnet-5-5 |
| 1 | 73 | `retrieval-browse` | provider | R17a, R26 | fixtures `browseViewerMissing`, `marksRegistrarDeclared` | job: FIX-E 4; after batch 3 | 5/1/0 | sonnet-5-5 |
| 1 | 77 | `inquiry-grammar` | cause only | R30b | - | none | 0/0/0 | sonnet-5-5 |
| 1 | 142 | `wizard-scripts` | enabling | - | - | pass: FIX-E 1; after batch 3 | 1/0/0 | sonnet-5-5 |
| 1 | 151 | `translations` | enabling | - | - | none | 2/0/0 | sonnet-5-5 |
| 1 | 155 | `admission` | provider | R27b | contracts `credential-revoked` | none | 0/0/0 | sonnet-5-5 |
| 1 | 158 | `signin-door` | enabling | - | fixtures `signinRefusal` | pass: FIX-E 2; after batch 2; pending part-5/v3: 4 | 6/0/0 | sonnet-5-5 |
| 1 | 166 | `screens-inquiry` | cause only | R1, R2a, R4, R35a, R37, R38, R17b, R30a | - | job: FIX-E 4; after batch 5; pending part-5/v3: 478 | 479/1/4 | sonnet-5-5 |
| 1 | 170 | `control-plane` | provider | - | contracts `ask-wire`, `deliver-owed`, `unknown-op` | delete `owner-ops.mjs`, call `innerRequest`; job: FIX-E 10, FIX-L 6, CODE 6; after batch 5; pending part-5/v3: 72 | 78/11/4 | sonnet-5-5 |
| 1 | 171 | `plane` | provider | entry 4, R24 (b2), R24 (d), R28b | contracts `job-registrar`, `keep-later`, `owed-later`, `owed-ledger` | delete the composition copy, `Store` calls `assembleStore`; job: FIX-E 63, CODE 3; after batch 3; pending part-5/v3: 18 | 42/32/2 | sonnet-5-5 |
| 2 | 16 | `office-readers` | cause only | R11a, R16, R21(b) | - | none | 0/0/0 | sonnet-5-5 |
| 2 | 18 | `pdf-reader` | provider | - | fixtures `notAPdf` | pending part-5/v3: 1 | 1/0/0 | haiku-5-5 |
| 2 | 40 | `ai-accounts` | provider | - | fixtures `accountForRefused`, `accountForResult`, `accountsServing`, `keepAwaySet`, `keepAwayState`, `keepAwayUnreadable`, `keptAwayGroup`, `keptAwayProject`, `keptAwayUnreadable`, `noAccount`, `switchedOff`, `tokenMalformedHold` | pending part-5/v3: 2 | 8/2/0 | sonnet-5-5 |
| 2 | 42 | `promotion` | provider | - | fixtures `factUnavailable`, `groupUndetermined`, `makePromotion`, `projectActNotParticipant`, `registrars`, `retireCited`, `staleBaseRefusal` | pending part-5/v3: 2 | 2/0/2 | sonnet-5-5 |
| 2 | 45 | `attestation` | provider | - | fixtures `attestationsOfBadSha`, `noKeyInstanceSign` | none | 0/0/0 | haiku-5-5 |
| 2 | 48 | `acquisition` | provider | R12 | fixtures `acquireRefusals`, `archiveNotHeld`, `keyedServiceOff`, `notHeldRange`, `owedFetchAnswer`, `owedRunAnswer` | pending part-5/v3: 6 | 11/87/0 | sonnet-5-5 |
| 2 | 49 | `capture` | provider | R29 | fixtures `acquireRefusal`, `captureArm`, `heldActsUnreadable`, `heldSetAside`, `storageNotConfigured` | pending part-5/v3: 4 | 17/25/1 | sonnet-5-5 |
| 2 | 52 | `sources` | provider | - | fixtures `rungOf`, `sourceOfReads` | none | 0/0/0 | haiku-5-5 |
| 2 | 60 | `local-facts` | provider | - | fixtures `factStatusRefusal` | none | 0/0/0 | haiku-5-5 |
| 2 | 64 | `standards` | provider | - | fixtures `standardRead`, `standardReadWorld`, `standardRow` | none | 0/0/0 | sonnet-5-5 |
| 2 | 68 | `duties` | provider | - | fixtures `occurrences`, `occurrencesOf`, `recordTransitionsAnswers`, `transitionsRefusal` | pending part-5/v3: 2 | 2/0/0 | sonnet-5-5 |
| 2 | 74 | `retrieval` | provider | - | fixtures `actionRegistrar`, `meaningRowsUnknownArm`, `noSelection`, `selectionResolve`; contracts `selection-read` | job: FIX-E 1; after batch 3 | 0/1/0 | sonnet-5-5 |
| 2 | 85 | `basis-versions` | cause only | R23 | - | none | 0/0/0 | sonnet-5-5 |
| 2 | 116 | `ratification` | provider | R27a | fixtures `noCaseDocument`, `preflightRefusal` | job: FIX-E 7; after batch 5; pending part-5/v3: 4 | 20/2/0 | sonnet-5-5 |
| 2 | 118 | `case-import` | provider | - | fixtures `importedWorld`, `openFlagsUnread`, `watchedImports` | pass: FIX-E 1; after batch 4 | 1/0/0 | sonnet-5-5 |
| 2 | 121 | `case-inputs` | provider | - | fixtures `carryOutcome`, `statementAck` | none | 0/0/0 | haiku-5-5 |
| 2 | 125 | `conformance` | provider | - | fixtures `curesOf`, `determinationRead`, `noDeterminations` | job: FIX-E 3; after batch 5; pending part-5/v3: 1 | 4/0/0 | sonnet-5-5 |
| 2 | 156 | `answer-envelope` | provider | - | fixtures `planeHelpers`, `refusedAnswer`, `storeSilent`; contracts `door-helpers` | pending part-5/v3: 10 | 9/0/1 | haiku-5-5 |
| 2 | new, after signin-door | `store-assembly` | new module | - | - | none | 0/0/0 | default |
| 2 | 164 | `screens-intake` | cause only | R5, R35b, R36, R14, R33 | - | job: FIX-E 1; after batch 2; pending part-5/v3: 361 | 359/1/4 | sonnet-5-5 |
| 3 | 15 | `csv-reader` | cause only | R20 | - | none | 0/0/0 | sonnet-5-5 |
| 3 | 36 | `member-roster` | provider | - | fixtures `expertiseWithdrawn`, `listenerRefusals` | pending part-5/v3: 4 | 3/0/1 | haiku-5-5 |
| 3 | 39 | `project-roster` | provider | - | fixtures `projectReadRefusals` | none | 0/0/0 | haiku-5-5 |
| 3 | 54 | `reading-pipeline` | provider | R2b, R3, R9, R11b, R18b | fixtures `storeFailedTransient` | pending part-5/v3: 17 | 20/10/1 | sonnet-5-5 |
| 3 | 55 | `extraction` | provider | R10, R24 (b), R39b | fixtures `extractionNotice`, `progressOf`, `readHeldAnswer`, `unheldStructure` | pending part-5/v3: 6 | 35/39/0 | sonnet-5-5 |
| 3 | 57 | `entities` | provider | - | fixtures `entitiesWorld`, `namingInRefused`, `unreadable` | none | 0/1/0 | sonnet-5-5 |
| 3 | 58 | `events` | provider | - | fixtures `recordedByMalformedExtent`, `timelineRefusal`, `usesOf` | pending part-5/v3: 1 | 1/1/0 | sonnet-5-5 |
| 3 | 65 | `progressions` | provider | - | fixtures `definitionRead`, `disposeProposalRefusal` | none | 0/2/0 | sonnet-5-5 |
| 3 | 75 | `calculations` | cause only | R19 | - | job: FIX-E 1; after batch 3 | 1/1/0 | sonnet-5-5 |
| 3 | 80 | `inquiry` | provider | R30b | fixtures `basisForUnread`, `basisRefusals`, `migratedSurfacing` | pending part-5/v3: 1 | 5/0/1 | sonnet-5-5 |
| 3 | 82 | `steps` | provider | - | fixtures `stepRead`, `stepsWorld` | none | 0/0/0 | sonnet-5-5 |
| 3 | 92 | `capture-requests` | provider | - | fixtures `sweepScopeRegistrar` | pending part-5/v3: 3 | 6/3/1 | sonnet-5-5 |
| 3 | 96 | `answers` | provider | - | fixtures `limitsUnreadable`, `standingQuestions`, `standingSwitchOff` | none | 1/8/0 | sonnet-5-5 |
| 3 | 107 | `case-carriage` | provider | - | fixtures `copyReadStates`, `copyTickRefusals`, `onCopyWorkRegistrarRefusals` | none | 0/0/0 | haiku-5-5 |
| 3 | 109 | `publication` | provider | - | fixtures `assembleCaseContainerRefusal`, `caseDocumentFacts`, `caseFileLedger`, `publicationWorld`, `stampEditionRefusal`, `storeCaseDocumentRefusal` | none | 5/0/0 | sonnet-5-5 |
| 3 | 115 | `case-catalogue` | cause only | R31 | - | none | 0/0/0 | sonnet-5-5 |
| 3 | 117 | `case-checker` | provider | - | fixtures `checkAccountMalformed` | none | 0/0/0 | haiku-5-5 |
| 3 | 126 | `consequences` | provider | - | fixtures `consequencesOfRefusal`, `successRecordRead` | none | 5/0/0 | sonnet-5-5 |
| 3 | 129 | `actions` | provider | - | fixtures `actionRead`, `actionsForRefusal` | job: FIX-E 1; after batch 3 | 6/1/0 | sonnet-5-5 |
| 3 | new, after store-assembly | `store-request` | new module | - | - | none | 0/0/0 | default |
| 4 | 31 | `doc-clean` | provider | - | fixtures `encryptedRefusal` | none | 0/0/0 | haiku-5-5 |
| 4 | 56 | `content` | cause only | R22 | - | none | 1/2/0 | sonnet-5-5 |
| 4 | 59 | `lines` | provider | - | fixtures `linesWorld` | none | 0/1/0 | sonnet-5-5 |
| 4 | 69 | `people` | provider | - | fixtures `evaluateChecksAnswers`, `tiesConcerningRefusal` | pending part-5/v3: 1 | 1/0/0 | haiku-5-5 |
| 4 | 71 | `bias` | provider | - | fixtures `biasRefusedPromote` | none | 0/0/0 | haiku-5-5 |
| 4 | 86 | `strength` | provider | - | fixtures `gradingFactsUnread`, `strengthBarSet`, `strengthOfNoId` | pending part-5/v3: 1 | 3/0/0 | sonnet-5-5 |
| 4 | 87 | `contradiction` | provider | - | fixtures `candidateReads`, `readRefusals` | pending part-5/v3: 1 | 2/0/0 | sonnet-5-5 |
| 4 | 89 | `ai-use` | provider | - | fixtures `ceilingRefusal`; contracts `use-check` | none | 0/0/0 | haiku-5-5 |
| 4 | 90 | `ai-runs` | provider | - | fixtures `airunDispatchRefusal`, `airunOpenRefusal`, `airunRefusal`, `tickStateTooLarge` | pending part-5/v3: 3 | 5/4/3 | sonnet-5-5 |
| 4 | 91 | `run-productions` | provider | - | fixtures `suggestRefusals` | none | 0/0/0 | haiku-5-5 |
| 4 | 99 | `agent-runner` | provider | - | fixtures `runnerRefusal` | pending part-5/v3: 1 | 0/1/0 | haiku-5-5 |
| 4 | 102 | `intent` | provider | - | fixtures `intentWorld` | pending part-5/v3: 1 | 4/2/0 | sonnet-5-5 |
| 4 | 112 | `public-read` | provider | - | fixtures `groupIdentityRegistrar` | pending part-5/v3: 4 | 13/0/3 | sonnet-5-5 |
| 4 | 120 | `case-account` | provider | - | fixtures `reviewCommentsRegistrar` | none | 3/0/0 | haiku-5-5 |
| 4 | 122 | `case-authoring` | provider | - | fixtures `preflightAnswer` | pending part-5/v3: 6 | 13/0/1 | sonnet-5-5 |
| 4 | 131 | `action-clocks` | provider | - | fixtures `pendingClocksRefusal` | none | 2/1/0 | sonnet-5-5 |
| 4 | 136 | `action-plans` | provider | - | fixtures `planRead`; contracts `plan-open-check` | job: FIX-E 1; after batch 5; pending part-5/v3: 1 | 3/1/0 | sonnet-5-5 |
| 4 | 137 | `plan-work` | provider | - | fixtures `watchReaderRegistrar` | job: FIX-E 2; after batch 5 | 7/0/0 | sonnet-5-5 |
| 4 | 161 | `screens-entry` | cause only | R34 | - | pending part-5/v3: 171 | 173/0/0 | sonnet-5-5 |
| 4 | 165 | `screens-daily` | cause only | R17a | - | pending part-5/v3: 248 | 250/0/0 | sonnet-5-5 |
| 5 | 34 | `sheet-worker` | provider | - | fixtures `recomputeNotEnabled` | none | 0/0/0 | haiku-5-5 |
| 5 | 67 | `money-checks` | provider | - | fixtures `runDetectorsAnswers` | none | 0/0/0 | haiku-5-5 |
| 5 | 101 | `agent-worker` | provider | - | contracts `dispatch-refusal`, `transcribe-declined`, `transcribe-not-sent`, `transcribe-refusal` | pending part-5/v3: 5 | 14/1/7 | sonnet-5-5 |
| 5 | 110 | `publish-schedule` | provider | - | fixtures `scheduleRefusals`, `scheduledEditions` | none | 0/0/0 | haiku-5-5 |
| 5 | 111 | `docket` | provider | - | fixtures `docketEntryRead` | none | 1/0/0 | sonnet-5-5 |
| 5 | 114 | `network-notices` | provider | - | fixtures `noticePrepareRefusal` | none | 2/0/0 | haiku-5-5 |
| 5 | 119 | `case-disclosures` | provider | - | fixtures `gateRefusal` | none | 16/0/0 | sonnet-5-5 |
| 5 | 123 | `review` | provider | - | contracts `review-copy-read` | none | 2/0/0 | sonnet-5-5 |
| 5 | 124 | `case-check` | provider | - | fixtures `caseCheckOfNoSuchCase` | none | 2/0/0 | sonnet-5-5 |
| 5 | 135 | `escalation` | provider | - | fixtures `escalationRead` | none | 6/0/0 | sonnet-5-5 |
| 5 | 138 | `monitoring` | provider | - | fixtures `flaggedRefusal` | pending part-5/v3: 16 | 30/6/0 | sonnet-5-5 |
| 5 | 139 | `following` | provider | - | fixtures `watchedByRefusal` | pending part-5/v3: 4 | 13/1/0 | sonnet-5-5 |
| 5 | 140 | `link-sweep` | provider | - | contracts `sweep-fence`, `sweep-mutate`, `sweep-scope` | none | 1/1/0 | sonnet-5-5 |
| 5 | 147 | `action-producers` | provider | - | fixtures `actionItems` | pending part-5/v3: 5 | 7/0/0 | sonnet-5-5 |
| 5 | 152 | `instance-setup` | provider | - | fixtures `assistantState`, `instanceGroupAnswer`; contracts `group-identity-public` | pending part-5/v3: 2 | 22/0/0 | sonnet-5-5 |
| 5 | 157 | `store-door` | provider | - | fixtures `internalErrorAnswer`; contracts `store-replies` | pending part-5/v3: 15 | 10/5/2 | sonnet-5-5 |
| 5 | 159 | `interface-assets` | cause only | R32 | - | none | 0/0/0 | sonnet-5-5 |
| 5 | 169 | `screens-action` | provider | - | contracts `plan-screen-shape` | pending part-5/v3: 56 | 57/0/2 | sonnet-5-5 |

## 4. Modules with findings and no job in the batches (Wave B only)

| # | Module | a/s/c | Wave B work | Model |
|---|---|---|---|---|
| 7 | `test-support` | 2/2/1 | pass: FIX-L 4; after -; pending part-5/v3: 1 | haiku-5-5 |
| 9 | `signatures` | 0/1/0 | pending part-5/v3: 1 | - |
| 10 | `bundler` | 0/7/0 | pending part-5/v3: 7 | - |
| 17 | `odf-reader` | 1/0/0 | pending part-5/v3: 1 | - |
| 22 | `docprofile` | 0/3/0 | pending part-5/v3: 3 | - |
| 43 | `host-governor` | 6/0/0 | pass: FIX-L 5; after -; pending part-5/v3: 1 | haiku-5-5 |
| 50 | `doorbell` | 13/6/0 | pass: FIX-E 4, FIX-L 14, CODE 1; after batch 1 | haiku-5-5 |
| 61 | `connections` | 7/0/0 | job: FIX-L 4, CODE 1, FIX-E 1; after batch 3; pending part-5/v3: 1 | sonnet-5-5 |
| 62 | `observation-log` | 1/0/0 | job: FIX-E 1; after batch 3 | sonnet-5-5 |
| 63 | `law-relations` | 9/0/0 | pass: FIX-E 1; after batch 2; pending part-5/v3: 8 | haiku-5-5 |
| 66 | `money` | 1/0/1 | job: FIX-E 1; after batch 2; pending part-5/v3: 1 | sonnet-5-5 |
| 70 | `explore` | 2/0/0 | pending part-5/v3: 2 | - |
| 76 | `workbooks` | 1/0/0 | job: FIX-E 1; after batch 5 | sonnet-5-5 |
| 81 | `hypotheses` | 0/0/2 | pass: CODE 2; after - | haiku-5-5 |
| 83 | `citation` | 2/0/0 | job: FIX-E 1, CODE 1; after batch 3 | sonnet-5-5 |
| 94 | `skills` | 0/0/8 | pending part-5/v3: 16 | - |
| 95 | `question-explorer` | 1/0/0 | pending part-5/v3: 1 | - |
| 98 | `agent-model` | 0/0/1 | pending part-5/v3: 1 | - |
| 100 | `agent-steps` | 12/0/7 | job: FIX-E 2, CODE 7, FIX-L 3; after batch 4; pending part-5/v3: 7 | sonnet-5-5 |
| 104 | `reevaluation` | 3/0/2 | job: CODE 1, FIX-E 1; after batch 2; pending part-5/v3: 3 | sonnet-5-5 |
| 128 | `action-records` | 2/0/0 | job: FIX-E 2; after batch 3 | sonnet-5-5 |
| 130 | `action-holds` | 2/0/0 | job: FIX-E 2; after batch 5 | sonnet-5-5 |
| 132 | `action-replies` | 3/0/0 | job: FIX-E 3; after batch 3 | sonnet-5-5 |
| 134 | `filings` | 6/0/0 | pass: FIX-E 3; after batch 3; pending part-5/v3: 3 | haiku-5-5 |
| 141 | `scheduler` | 12/0/0 | job: FIX-E 13; after batch 3; pending part-5/v3: 1 | sonnet-5-5 |
| 144 | `affordances` | 0/0/5 | pass: FIX-L 3; after -; pending part-5/v3: 2 | haiku-5-5 |
| 145 | `tasks` | 0/5/0 | job: FIX-E 5; after batch 1 | sonnet-5-5 |
| 146 | `machinery-producers` | 5/5/0 | job: FIX-E 5; after batch 1; pending part-5/v3: 5 | sonnet-5-5 |
| 148 | `queue-producers` | 24/7/2 | job: FIX-E 16, CODE 1; after batch 5; pending part-5/v3: 16 | sonnet-5-5 |
| 149 | `notice-producers` | 8/2/0 | job: FIX-E 9; after batch 5; pending part-5/v3: 1 | sonnet-5-5 |
| 150 | `queue` | 6/1/1 | pass: CODE 1, FIX-E 2; after batch 3; pending part-5/v3: 5 | haiku-5-5 |
| 160 | `interface-shell` | 56/0/1 | `boot({door})`, delete `ADMIN_*` (import from wizard-scripts); pending part-5/v3: 57 | - |
| 162 | `screens-wizards` | 51/0/0 | pending part-5/v3: 51 | - |
| 163 | `screens-settings` | 247/0/0 | job: FIX-E 13, CODE 1; after batch 5; pending part-5/v3: 234 | sonnet-5-5 |
| 167 | `screens-investigate` | 166/0/0 | job: FIX-E 2; after batch 2; pending part-5/v3: 164 | sonnet-5-5 |
| 168 | `screens-publish` | 56/0/4 | job: FIX-E 10; after batch 5; pending part-5/v3: 50 | sonnet-5-5 |
| 172 | `installer-steps` | 3/0/0 | pending part-5/v3: 3 | - |
| 173 | `installer` | 17/0/0 | pass: FIX-E 2; after batch 5; pending part-5/v3: 15 | haiku-5-5 |
| 176 | `journey-check` | 16/1/1 | job: FIX-E 1; after batch 1; pending part-5/v3: 17 | sonnet-5-5 |

## 5. Wave B in numbers

Classified fixture work left after the batches (the lines the audit classed FIX-E, FIX-L or CODE, which are final):

| | pass (one mechanics §5.10 pass, no job; sonnet medium worker per §5.10 (3), haiku-5-5 if BOB takes K3518) | job (a CHANGE to the module's job, or a job of its own) | only pending lines |
|---|---|---|---|
| Modules with no job in the batches (39) | 9: `test-support`, `host-governor`, `doorbell`, `law-relations`, `hypotheses`, `filings`, `affordances`, `queue`, `installer` | 19 | 11 |
| Modules in the batches with lines left (53) | 3: `case-import`, `wizard-scripts`, `signin-door` | 15 | 35 |

The screens' work (1,834 op-table entries over the nine screens modules and `interface-shell`, 138 more in 35 other modules) is `pending` until part-5 and the check are reviewed; it then needs `store-request` and interface-shell's `boot({door})`. Order of the screens jobs (op-tables §5.5): `interface-shell`, `screens-entry`, `screens-investigate`, `screens-action`, `screens-wizards`, `screens-publish`, then `screens-settings`, `screens-intake`, `screens-daily`, `screens-inquiry`.

## 6. Open points and what moved since the first edition

- **Causes placed (28 modules):** pdf-pixels R6; ocr-worker R7; pdf-worker R8; reading-pipeline R2b, R3, R9, R11b, R18b; extraction R10, R24 (b), R39b; office-readers R11a, R16, R21(b); file-scanner R11c; acquisition R12; subresources R15; retrieval-browse R17a, R26; screens-daily R17a (draw); screens-inquiry R1, R2a, R4, R35a, R37, R38, R17b, R30a (+ following entries); screens-intake R5, R35b, R36, R14, R33; file-safety R39a; calculations R19; csv-reader R20; content R22; basis-versions R23; capture R29 (and R33's `heldCaptures` test); inquiry-grammar and inquiry R30b; case-catalogue R31; interface-assets R32 (gated); screens-entry R34 (minor); credentials R24 (a); admission R27b; plane entry 4 (first), R24 (b2), R24 (d), R28b; ratification R27a. **Cause-only STARTs added (13):** subresources, inquiry-grammar, screens-inquiry, basis-versions, screens-intake, office-readers, csv-reader, case-catalogue, calculations, content, screens-daily, screens-entry, interface-assets; plus the new module `store-request`.
- **No job:** R13a (live reading first, then UX-DESIGN's picker), R13b and R11c's container cause and R5's parted half (the redeploy, K4428), R18a (closed, R32/R51), R21(a) and R21(c), R25, R28a, R34's cause (re-walk asks), R31b/R31c (a reproduction first), R24 (d) beyond plane's arrival log.
- **Lines for modules the jobs may not own, reported to BOB by the jobs:** `capture`'s four parted ops' class rows live in `control-plane/owner-ops.mjs` (R29); ratification R27a's `session`/`reauthdue` fold touches control-plane; extraction R39b's `migrations` block in `selftest` is a control-plane Worker arm; `interface-shell` may be needed by R34; `office-readers` R21(b) names `odf-reader` for the ODS twin. Each START says so; none is a hidden edit.
- **attest (K5046 (f))** is closed by K5052 (3): served, nothing removed; the earlier row for `attestation` is gone.
- **Still true from the first edition:** the live list still carries 220 lines the parts class FALSE and 2,000 no part classes (all in the pending marker now); 54 named fixtures and contracts have no live user and are in no START; seven providers the parts name have no live user (agent-steps, basis-versions as a provider, calculations, corpus-export, doorbell, office-readers, reevaluation: three of them, basis-versions, calculations and office-readers, have a job anyway for a cause); `journey-check`'s `servedPlane` stays outside (journey-check imports no module); `pdf-pixels`' fixtures file is added to its `tests` by BOB at its COMPLETE (K5051).
- **Counts for the check change:** if `prep/fixtures-v3` drops lines, the classified work above shrinks and a START's line list is rechecked against `--list` at job start (each START names the command).

