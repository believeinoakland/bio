# Fix round 10 of T51: the waves of the fixture round

**Status** · Draft for BOB, written by a drafting worker on `prep/starts-r10` from the fixtures check's live list at the tranche tip (`a9e399d70f`; `node /home/user/civicos-process/checks/fixtures.mjs <bio> --list`: 2,936 lines, answer 2,557, stub 302, code 77, on 109 modules), `build/plan/fixtures-T51/part-1.md` to `part-4.md` and `op-tables.md`, rulings K4990, K4993, K4995, K4996, K5044, K5045, K5046 and `fix-round-10-T51.md` §2. The START bodies are `build/plan/starts-T51-F10/<module>.txt`, one per Wave A module (84). Nothing here binds until BOB reads it.

## 1. How modules were placed

- **Wave A** (K5046, `fix-round-10-T51.md` §2): `store-assembly` (new), `wizard-scripts`, `translations`, `signin-door`, and every provider whose fixture or contract still has a user in the live list (83 modules with `store-assembly`: 84). A provider with no live user has nothing to publish and is Wave B (7 modules, section 6). A provider that is also a user does its own lines in the same Wave A job when the provider it needs is in an EARLIER batch and no `storeWorld()` is needed; the rest of its lines stay in its Wave B column below. `plane` and `control-plane` do provider work only in Wave A.
- **Wave B**: every other module, after the batches it names in column `after` merge (`A2` = after batch 2; `SA+IS` = after `store-assembly` and interface-shell's `boot({door})`). The live list is the coverage; each line is classed by the part that names it (E = FIX-E re-point to a provider's fixture, L = FIX-L contract marker, F = FALSE still listed, C = CODE, open = a scripted op-table entry or builder call site the parts did not class: K5044 (3) owes them a second audit pass).
- **Wave B work**: `pass` = every line is a mechanical re-point, a marker or a CODE line with a named real code, so it is a candidate for one mechanics §5.10 pass (no job); `job` = a judgment line, an op-table entry, an unclassed builder, or a CODE line the part says to confirm; `gap` = only FALSE lines remain, which no job can fix (section 5). Model: haiku-5-5 for `pass` and for mechanical test-only work; sonnet-5-5 otherwise; the default model only for `store-assembly` (K3518). Mechanics §5.10 (3) names a sonnet (medium) worker for the pass; BOB picks.

## 2. Wave A in batches (K4215: at most 20 job sessions at once)

| Batch | Jobs | Modules (modules.json order; `store-assembly` after `signin-door`) |
|---|---|---|
| 1 | 17 | `pdf-reader`, `pdf-pixels`, `doc-clean`, `pdf-worker`, `ocr-worker`, `sheet-worker`, `file-scanner`, `member-roster`, `record-core`, `membership`, `project-roster`, `ai-accounts`, `wizard-scripts`, `translations`, `signin-door`, `control-plane`, `plane` |
| 2 | 16 | `credentials`, `promotion`, `provenance`, `attestation`, `capture-sources`, `acquisition`, `capture`, `file-safety`, `sources`, `reading-pipeline`, `extraction`, `entities`, `events`, `lines`, `local-facts`, `store-assembly` |
| 3 | 17 | `standards`, `progressions`, `money-checks`, `duties`, `people`, `bias`, `retrieval-browse`, `retrieval`, `inquiry`, `steps`, `strength`, `contradiction`, `ai-use`, `ai-runs`, `run-productions`, `capture-requests`, `answers` |
| 4 | 17 | `agent-runner`, `agent-worker`, `intent`, `case-carriage`, `publication`, `publish-schedule`, `docket`, `public-read`, `network-notices`, `ratification`, `case-checker`, `case-import`, `case-disclosures`, `case-account`, `case-inputs`, `case-authoring`, `review` |
| 5 | 17 | `case-check`, `conformance`, `consequences`, `actions`, `action-clocks`, `escalation`, `action-plans`, `plan-work`, `monitoring`, `following`, `link-sweep`, `action-producers`, `instance-setup`, `admission`, `answer-envelope`, `store-door`, `screens-action` |

Sequencing:
1. Batch 1 holds the enabling jobs. `wizard-scripts`, `translations`, `signin-door`, `control-plane` and `plane` come first although they sit late in the order, because `store-assembly` copies their results (K5046 (a)-(c)). **Coupled merge:** an op declared by two modules stops plane's start (`plane/declarations.mjs:75`, `:186`). `translations` (row `interfacewords`), `signin-door` (new `DECLARED_OPS`, row `subscriptionsignin`), `control-plane` (both rows leave `owner-ops.mjs`) and `plane` (`OWNERS` gains `signin-door`) merge as ONE set by BOB; each of their STARTs says so. `wizard-scripts` is independent.
2. Batch k+1 opens when batch k is merged, so the own lines of a batch k+1 job re-point to fixtures that are already on its branch point. Batch 2 holds `store-assembly` (default model), the critical path (suite time measured before any screens job, K5046 (g)); interface-shell's `boot({door})` follows it, then the screens' jobs (Wave B). A Wave B job may open as soon as the providers named in its `after` column are merged.
3. A `fixtures-run` line a provider writes shows `orphan-run` until its user's marker is merged, and a marker shows `contract-no-run` until its provider's run is merged (`checks/fixtures.mjs:776-779`). Each START lists the lines a job may leave at done and where they clear; BOB reads `--list` after Wave B for the whole product, not after each batch.
4. The batches follow modules.json order (providers precede their users in the order). A dependency-aware assignment would put 270 of the 280 own FIX-E lines of Wave A modules in Wave A (this order: 164); it is not used: the batches follow modules.json order, and the START bodies carry the order-based split. The remaining own lines are Wave B (column `Wave B`).

## 3. Wave A modules (84)

Columns: `#` = position in `build/modules.json` (L = layer); `a/s/c` = the check's answer/stub/code lines on the module (own user lines); classed = the parts' classes of those lines; a line carrying findings of two classes counts in each class; `Wave B` = what is left for the module after its Wave A job (`none` = nothing); model = Wave A job.

| Batch | # | Module | L | a/s/c | classed | Wave A: why | Wave B | Model |
|---|---|---|---|---|---|---|---|---|
| 1 | 18 | `pdf-reader` | 1 | 1/0/0 | F 1 | provider; fixtures `notAPdf` | none | haiku-5-5 |
| 1 | 29 | `pdf-pixels` | 1 | 0/0/0 | 0 | provider; fixtures `pageRefusal`, `pixelRefusal`, `renderedPage` | none | haiku-5-5 |
| 1 | 31 | `doc-clean` | 1 | 0/0/0 | 0 | provider; fixtures `encryptedRefusal` | none | haiku-5-5 |
| 1 | 32 | `pdf-worker` | 1 | 1/0/0 | F 1 | provider; fixtures `tier2Answer` | none | sonnet-5-5 |
| 1 | 33 | `ocr-worker` | 1 | 1/2/0 | E 2 · F 1 | provider; fixtures `memberRefusal`, `memberWorker`, `pageNotRenderable` | job: FIX-E 2; after A1 | sonnet-5-5 |
| 1 | 34 | `sheet-worker` | 1 | 0/0/0 | 0 | provider; fixtures `recomputeNotEnabled` | none | haiku-5-5 |
| 1 | 35 | `file-scanner` | 1 | 0/0/0 | 0 | provider; fixtures `reputationRefresh` | none | haiku-5-5 |
| 1 | 36 | `member-roster` | 2 | 3/0/1 | F 3 · open 1 | provider; fixtures `expertiseWithdrawn`, `listenerRefusals` | job: op-table 1; after SA+IS | haiku-5-5 |
| 1 | 37 | `record-core` | 2 | 1/0/0 | F 1 | provider; fixtures `coreOver`, `evidencePartsRefusal`, `perItemRetained`, `tableDeclarationRefusals` | none | sonnet-5-5 |
| 1 | 38 | `membership` | 2 | 5/0/1 | F 4 · open 2 | provider; fixtures `projectActRefusals` | job: op-table 2; after SA+IS | haiku-5-5 |
| 1 | 39 | `project-roster` | 2 | 0/0/0 | 0 | provider; fixtures `projectReadRefusals` | none | haiku-5-5 |
| 1 | 40 | `ai-accounts` | 2 | 8/2/0 | E 8 · F 1 · open 1 | provider; fixtures `accountForRefused`, `accountForResult`, `accountsServing`, `keepAwaySet`, `keepAwayState`, `keepAwayUnreadable`, `keptAwayGroup`, `keptAwayProject`, `keptAwayUnreadable`, `noAccount`, `switchedOff`, `tokenMalformedHold` | job: FIX-E 8, op-table 1; after A1 SA+IS | sonnet-5-5 |
| 1 | 142 | `wizard-scripts` | 11 | 1/0/0 | E 1 | enabling: receives `ADMIN_ACTS`/`ADMIN_SCREENS` (K5046 (c)) | pass: FIX-E 1; after A3 | sonnet-5-5 |
| 1 | 151 | `translations` | 11 | 2/0/0 | L 2 | enabling: declares `interfacewords` (K5046 (c)) | none | sonnet-5-5 |
| 1 | 158 | `signin-door` | 11 | 6/0/0 | E 2 · F 2 · open 2 | enabling: declares `subscriptionsignin` (K5046 (c)); provider; fixtures `signinRefusal` | job: FIX-E 2, op-table 2; after A5 SA+IS | sonnet-5-5 |
| 1 | 170 | `control-plane` | 11 | 78/11/4 | E 10 · L 6 · F 61 · C 6 · open 11 | provider (K5044 (5)); two rows leave `owner-ops.mjs`; contracts `ask-wire`, `deliver-owed`, `unknown-op` | delete `owner-ops.mjs`, call the door function of `store-assembly`; own findings; job: op-table 11, FIX-E 10, FALSE 61, FIX-L 6, CODE 6; after A5 SA+IS | sonnet-5-5 |
| 1 | 171 | `plane` | 11 | 42/32/2 | E 61 · F 15 · C 3 · open 3 | provider (K5044 (4), (5)); `OWNERS` gains signin-door; contracts `job-registrar`, `keep-later`, `owed-later`, `owed-ledger` | delete the composition body (copied to `store-assembly`), `Store` calls `assembleStore`; own findings; job: FIX-E 63, CODE 3, FALSE 15, op-table 3; after A5 SA+IS | sonnet-5-5 |
| 2 | 41 | `credentials` | 2 | 7/2/0 | E 8 · F 1 | provider; fixtures `securityMapRefusal` | none | sonnet-5-5 |
| 2 | 42 | `promotion` | 2 | 2/0/2 | E 2 · F 2 | provider; fixtures `factUnavailable`, `groupUndetermined`, `makePromotion`, `projectActNotParticipant`, `registrars`, `retireCited`, `staleBaseRefusal` | none | sonnet-5-5 |
| 2 | 44 | `provenance` | 3 | 1/0/0 | F 1 | provider; fixtures `heldParts`, `holdsOf`, `holdsRegister`, `homeOf`, `homeOfEmpty`, `homeOfHomed`, `homeOfWorld`, `provenanceOver`, `registeredHomes`, `versionChainNoSuchVersion` | none | sonnet-5-5 |
| 2 | 45 | `attestation` | 3 | 0/0/0 | 0 | provider; fixtures `attestationsOfBadSha`, `noKeyInstanceSign` | remove the dead `attest` declaration (`ops.mjs:46`) if `store-assembly` entry (f) confirms no route | haiku-5-5 |
| 2 | 47 | `capture-sources` | 3 | 0/1/0 | F 1 | provider; fixtures `renderFailure`, `renderRefusal` | none | haiku-5-5 |
| 2 | 48 | `acquisition` | 3 | 11/87/0 | E 14 · L 77 · F 6 · C 4 | provider; fixtures `acquireRefusals`, `archiveNotHeld`, `keyedServiceOff`, `notHeldRange`, `owedFetchAnswer`, `owedRunAnswer` | job: FIX-E 14; after A2 | sonnet-5-5 |
| 2 | 49 | `capture` | 3 | 17/25/1 | E 11 · L 28 · F 4 · C 4 | provider; fixtures `acquireRefusal`, `captureArm`, `heldActsUnreadable`, `heldSetAside`, `storageNotConfigured` | job: FIX-E 10; after A2 | sonnet-5-5 |
| 2 | 51 | `file-safety` | 3 | 2/2/0 | E 2 · L 2 | provider; fixtures `batchTickAnswers`, `declaredRefusals`, `scannerAbsent`, `toolTestFailed`, `toolTested` | none | sonnet-5-5 |
| 2 | 52 | `sources` | 3 | 0/0/0 | 0 | provider; fixtures `rungOf`, `sourceOfReads` | none | haiku-5-5 |
| 2 | 54 | `reading-pipeline` | 4 | 20/10/1 | E 10 · L 1 · F 12 · C 3 · open 5 | provider; fixtures `storeFailedTransient` | job: op-table 5; after SA+IS | sonnet-5-5 |
| 2 | 55 | `extraction` | 4 | 35/39/0 | E 45 · L 21 · F 1 · C 6 · open 5 | provider; fixtures `extractionNotice`, `progressOf`, `readHeldAnswer`, `unheldStructure` | job: FIX-E 22, op-table 2; after A2 SA+IS | sonnet-5-5 |
| 2 | 57 | `entities` | 5 | 0/1/0 | E 1 | provider; fixtures `entitiesWorld`, `namingInRefused`, `unreadable` | job: FIX-E 1; after A2 | sonnet-5-5 |
| 2 | 58 | `events` | 5 | 1/1/0 | E 1 · F 1 | provider; fixtures `recordedByMalformedExtent`, `timelineRefusal`, `usesOf` | job: FIX-E 1; after A2 | haiku-5-5 |
| 2 | 59 | `lines` | 5 | 0/1/0 | E 1 | provider; fixtures `linesWorld` | job: FIX-E 1; after A2 | sonnet-5-5 |
| 2 | 60 | `local-facts` | 5 | 0/0/0 | 0 | provider; fixtures `factStatusRefusal` | none | haiku-5-5 |
| 2 | 158.5 | `store-assembly` | 11 | 0/0/0 | 0 | new module (K5046 (a)): `assembleStore`, `storeWorld()` | none | default |
| 3 | 64 | `standards` | 5 | 0/0/0 | 0 | provider; fixtures `standardRead`, `standardReadWorld`, `standardRow` | none | sonnet-5-5 |
| 3 | 65 | `progressions` | 5 | 0/2/0 | E 2 | provider; fixtures `definitionRead`, `disposeProposalRefusal` | none | sonnet-5-5 |
| 3 | 67 | `money-checks` | 5 | 0/0/0 | 0 | provider; fixtures `runDetectorsAnswers` | none | haiku-5-5 |
| 3 | 68 | `duties` | 5 | 2/0/0 | F 1 · open 1 | provider; fixtures `occurrences`, `occurrencesOf`, `recordTransitionsAnswers`, `transitionsRefusal` | job: op-table 1; after SA+IS | sonnet-5-5 |
| 3 | 69 | `people` | 5 | 1/0/0 | open 1 | provider; fixtures `evaluateChecksAnswers`, `tiesConcerningRefusal` | job: op-table 1; after SA+IS | haiku-5-5 |
| 3 | 71 | `bias` | 5 | 0/0/0 | 0 | provider; fixtures `biasRefusedPromote` | none | haiku-5-5 |
| 3 | 73 | `retrieval-browse` | 5 | 5/1/0 | E 4 · L 2 | provider; fixtures `browseViewerMissing`, `marksRegistrarDeclared` | none | sonnet-5-5 |
| 3 | 74 | `retrieval` | 5 | 0/1/0 | E 1 | provider; fixtures `actionRegistrar`, `meaningRowsUnknownArm`, `noSelection`, `selectionResolve`; contracts `selection-read` | none | sonnet-5-5 |
| 3 | 80 | `inquiry` | 6 | 5/0/1 | E 5 · F 1 | provider; fixtures `basisForUnread`, `basisRefusals`, `migratedSurfacing` | job: FIX-E 3; after A3 | sonnet-5-5 |
| 3 | 82 | `steps` | 6 | 0/0/0 | 0 | provider; fixtures `stepRead`, `stepsWorld` | none | sonnet-5-5 |
| 3 | 86 | `strength` | 6 | 3/0/0 | E 2 · open 1 | provider; fixtures `gradingFactsUnread`, `strengthBarSet`, `strengthOfNoId` | job: op-table 1; after SA+IS | sonnet-5-5 |
| 3 | 87 | `contradiction` | 6 | 2/0/0 | E 1 · open 1 | provider; fixtures `candidateReads`, `readRefusals` | job: FIX-E 1, op-table 1; after A3 SA+IS | haiku-5-5 |
| 3 | 89 | `ai-use` | 6 | 0/0/0 | 0 | provider; fixtures `ceilingRefusal`; contracts `use-check` | none | haiku-5-5 |
| 3 | 90 | `ai-runs` | 6 | 5/4/3 | E 5 · L 3 · F 3 · C 1 | provider; fixtures `airunDispatchRefusal`, `airunOpenRefusal`, `airunRefusal`, `tickStateTooLarge` | job: FIX-E 5; after A3 | sonnet-5-5 |
| 3 | 91 | `run-productions` | 6 | 0/0/0 | 0 | provider; fixtures `suggestRefusals` | none | haiku-5-5 |
| 3 | 92 | `capture-requests` | 6 | 6/3/1 | E 3 · L 4 · F 2 · open 1 | provider; fixtures `sweepScopeRegistrar` | job: FIX-E 1, op-table 1; after A3 SA+IS | sonnet-5-5 |
| 3 | 96 | `answers` | 6 | 1/8/0 | E 8 · C 1 | provider; fixtures `limitsUnreadable`, `standingQuestions`, `standingSwitchOff` | none | sonnet-5-5 |
| 4 | 99 | `agent-runner` | 6 | 0/1/0 | F 1 | provider; fixtures `runnerRefusal` | none | haiku-5-5 |
| 4 | 101 | `agent-worker` | 6 | 14/1/7 | E 8 · L 1 · F 2 · C 8 · open 3 | provider; contracts `dispatch-refusal`, `transcribe-declined`, `transcribe-not-sent`, `transcribe-refusal` | job: op-table 3, FIX-E 1; after A4 SA+IS | sonnet-5-5 |
| 4 | 102 | `intent` | 7 | 4/2/0 | E 4 · C 1 · open 1 | provider; fixtures `intentWorld` | job: op-table 1; after SA+IS | sonnet-5-5 |
| 4 | 107 | `case-carriage` | 8 | 0/0/0 | 0 | provider; fixtures `copyReadStates`, `copyTickRefusals`, `onCopyWorkRegistrarRefusals` | none | haiku-5-5 |
| 4 | 109 | `publication` | 8 | 5/0/0 | E 4 · L 1 | provider; fixtures `assembleCaseContainerRefusal`, `caseDocumentFacts`, `caseFileLedger`, `publicationWorld`, `stampEditionRefusal`, `storeCaseDocumentRefusal` | none | sonnet-5-5 |
| 4 | 110 | `publish-schedule` | 8 | 0/0/0 | 0 | provider; fixtures `scheduleRefusals`, `scheduledEditions` | none | haiku-5-5 |
| 4 | 111 | `docket` | 8 | 1/0/0 | E 1 | provider; fixtures `docketEntryRead` | job: FIX-E 1; after A4 | haiku-5-5 |
| 4 | 112 | `public-read` | 8 | 13/0/3 | L 12 · F 4 | provider; fixtures `groupIdentityRegistrar` | none | sonnet-5-5 |
| 4 | 114 | `network-notices` | 8 | 2/0/0 | E 2 | provider; fixtures `noticePrepareRefusal` | none | haiku-5-5 |
| 4 | 116 | `ratification` | 8 | 20/2/0 | E 9 · L 9 · F 1 · open 3 | provider; fixtures `noCaseDocument`, `preflightRefusal` | job: op-table 3, FIX-E 6; after A4 SA+IS | sonnet-5-5 |
| 4 | 117 | `case-checker` | 8 | 0/0/0 | 0 | provider; fixtures `checkAccountMalformed` | none | haiku-5-5 |
| 4 | 118 | `case-import` | 8 | 1/0/0 | E 1 | provider; fixtures `importedWorld`, `openFlagsUnread`, `watchedImports` | none | sonnet-5-5 |
| 4 | 119 | `case-disclosures` | 8 | 16/0/0 | E 11 · L 2 · C 3 | provider; fixtures `gateRefusal` | job: FIX-E 3; after A4 | sonnet-5-5 |
| 4 | 120 | `case-account` | 8 | 3/0/0 | E 2 · L 1 | provider; fixtures `reviewCommentsRegistrar` | pass: FIX-E 1; after A4 | haiku-5-5 |
| 4 | 121 | `case-inputs` | 8 | 0/0/0 | 0 | provider; fixtures `carryOutcome`, `statementAck` | none | haiku-5-5 |
| 4 | 122 | `case-authoring` | 8 | 13/0/1 | E 6 · C 2 · open 6 | provider; fixtures `preflightAnswer` | job: FIX-E 3; after A4 | sonnet-5-5 |
| 4 | 123 | `review` | 8 | 2/0/0 | E 2 | provider; contracts `review-copy-read` | job: FIX-E 2; after A4 | haiku-5-5 |
| 5 | 124 | `case-check` | 8 | 2/0/0 | E 2 | provider; fixtures `caseCheckOfNoSuchCase` | none | sonnet-5-5 |
| 5 | 125 | `conformance` | 9 | 4/0/0 | E 3 · open 1 | provider; fixtures `curesOf`, `determinationRead`, `noDeterminations` | job: op-table 1, FIX-E 1; after A5 SA+IS | sonnet-5-5 |
| 5 | 126 | `consequences` | 9 | 5/0/0 | E 5 | provider; fixtures `consequencesOfRefusal`, `successRecordRead` | none | sonnet-5-5 |
| 5 | 129 | `actions` | 9 | 6/1/0 | E 7 | provider; fixtures `actionRead`, `actionsForRefusal` | job: FIX-E 6; after A5 | sonnet-5-5 |
| 5 | 131 | `action-clocks` | 9 | 2/1/0 | E 3 | provider; fixtures `pendingClocksRefusal` | job: FIX-E 1; after A5 | haiku-5-5 |
| 5 | 135 | `escalation` | 9 | 6/0/0 | E 6 | provider; fixtures `escalationRead` | job: FIX-E 6; after A5 | haiku-5-5 |
| 5 | 136 | `action-plans` | 9 | 3/1/0 | E 3 · F 1 | provider; fixtures `planRead`; contracts `plan-open-check` | job: FIX-E 2; after A5 | haiku-5-5 |
| 5 | 137 | `plan-work` | 9 | 7/0/0 | E 6 · C 1 | provider; fixtures `watchReaderRegistrar` | job: FIX-E 4; after A5 | sonnet-5-5 |
| 5 | 138 | `monitoring` | 10 | 30/6/0 | E 15 · L 5 · F 4 · open 12 | provider; fixtures `flaggedRefusal` | job: op-table 12, FIX-E 2; after A5 SA+IS | sonnet-5-5 |
| 5 | 139 | `following` | 10 | 13/1/0 | E 10 · open 4 | provider; fixtures `watchedByRefusal` | job: op-table 4, FIX-E 2; after A5 SA+IS | sonnet-5-5 |
| 5 | 140 | `link-sweep` | 10 | 1/1/0 | E 2 | provider; contracts `sweep-fence`, `sweep-mutate`, `sweep-scope` | none | sonnet-5-5 |
| 5 | 147 | `action-producers` | 11 | 7/0/0 | E 2 · open 5 | provider; fixtures `actionItems` | job: op-table 5, FIX-E 2; after A5 SA+IS | haiku-5-5 |
| 5 | 152 | `instance-setup` | 11 | 22/0/0 | E 18 · L 2 · F 1 · open 1 | provider; fixtures `assistantState`, `instanceGroupAnswer`; contracts `group-identity-public` | job: op-table 1; after SA+IS | sonnet-5-5 |
| 5 | 155 | `admission` | 11 | 0/0/0 | 0 | provider; contracts `credential-revoked` | none | haiku-5-5 |
| 5 | 156 | `answer-envelope` | 11 | 9/0/1 | F 10 | provider; fixtures `planeHelpers`, `refusedAnswer`, `storeSilent`; contracts `door-helpers` | none | haiku-5-5 |
| 5 | 157 | `store-door` | 11 | 10/5/2 | E 2 · F 7 · open 8 | provider; fixtures `internalErrorAnswer`; contracts `store-replies` | job: op-table 8; after SA+IS | sonnet-5-5 |
| 5 | 169 | `screens-action` | 11 | 57/0/2 | E 1 · F 3 · C 2 · open 53 | provider; contracts `plan-screen-shape` | job: op-table 50, builder 3, FIX-E 1; after A5 SA+IS | haiku-5-5 |

## 4. Wave B only (modules with findings that are not providers)

| # | Module | L | a/s/c | classed | Wave B work | after | Model |
|---|---|---|---|---|---|---|---|
| 7 | `test-support` | 1 | 2/2/1 | L 4 · F 1 | pass: FIX-L 4, FALSE 1 | - | haiku-5-5 |
| 9 | `signatures` | 1 | 0/1/0 | F 1 | gap: FALSE only (FALSE 1): check-rule gap for BOB | - | - |
| 10 | `bundler` | 1 | 0/7/0 | F 7 | gap: FALSE only (FALSE 7): check-rule gap for BOB | - | - |
| 17 | `odf-reader` | 1 | 1/0/0 | F 1 | gap: FALSE only (FALSE 1): check-rule gap for BOB | - | - |
| 22 | `docprofile` | 1 | 0/3/0 | F 3 | gap: FALSE only (FALSE 3): check-rule gap for BOB | - | - |
| 43 | `host-governor` | 3 | 6/0/0 | L 5 · F 1 | pass: FIX-L 5, FALSE 1 | - | haiku-5-5 |
| 50 | `doorbell` | 3 | 13/6/0 | E 4 · L 14 · C 1 | pass: FIX-E 4, FIX-L 14, CODE 1 | A2 | haiku-5-5 |
| 56 | `content` | 4 | 1/2/0 | E 3 | job: FIX-E 3 | A2 | sonnet-5-5 |
| 61 | `connections` | 5 | 7/0/0 | E 1 · L 4 · F 1 · C 1 | job: FIX-L 4, FALSE 1, CODE 1, FIX-E 1 | A2 | sonnet-5-5 |
| 62 | `observation-log` | 5 | 1/0/0 | E 1 | job: FIX-E 1 | A2 | sonnet-5-5 |
| 63 | `law-relations` | 5 | 9/0/0 | E 1 · open 8 | job: FIX-E 1, builder 8 | A2 SA+IS | sonnet-5-5 |
| 66 | `money` | 5 | 1/0/1 | E 1 · F 1 | job: FALSE 1, FIX-E 1 | A2 | sonnet-5-5 |
| 70 | `explore` | 5 | 2/0/0 | open 2 | job: op-table 2 | SA+IS | sonnet-5-5 |
| 75 | `calculations` | 5 | 1/1/0 | E 2 | job: FIX-E 2 | A2 | sonnet-5-5 |
| 76 | `workbooks` | 5 | 1/0/0 | E 1 | job: FIX-E 1 | A1 | sonnet-5-5 |
| 81 | `hypotheses` | 6 | 0/0/2 | C 2 | pass: CODE 2 | - | haiku-5-5 |
| 83 | `citation` | 6 | 2/0/0 | E 1 · C 1 | job: FIX-E 1, CODE 1 | A3 | sonnet-5-5 |
| 94 | `skills` | 6 | 0/0/8 | F 8 | gap: FALSE only (FALSE 16): check-rule gap for BOB | - | - |
| 95 | `question-explorer` | 6 | 1/0/0 | open 1 | job: op-table 1 | SA+IS | sonnet-5-5 |
| 98 | `agent-model` | 6 | 0/0/1 | F 1 | gap: FALSE only (FALSE 1): check-rule gap for BOB | - | - |
| 100 | `agent-steps` | 6 | 12/0/7 | E 2 · L 3 · F 3 · C 7 · open 4 | job: FIX-E 2, CODE 7, FIX-L 3, op-table 1, FALSE 3, builder 3 | A3 SA+IS | sonnet-5-5 |
| 104 | `reevaluation` | 7 | 3/0/2 | E 1 · F 2 · C 1 · open 1 | job: CODE 1, op-table 1, FIX-E 1, FALSE 2 | A3 SA+IS | sonnet-5-5 |
| 128 | `action-records` | 9 | 2/0/0 | E 2 | job: FIX-E 2 | A3 | sonnet-5-5 |
| 130 | `action-holds` | 9 | 2/0/0 | E 2 | job: FIX-E 2 | A4 | sonnet-5-5 |
| 132 | `action-replies` | 9 | 3/0/0 | E 3 | job: FIX-E 3 | A5 | sonnet-5-5 |
| 134 | `filings` | 9 | 6/0/0 | E 3 · open 3 | job: FIX-E 3, op-table 3 | A2 SA+IS | sonnet-5-5 |
| 141 | `scheduler` | 10 | 12/0/0 | E 11 · open 1 | job: FIX-E 13, op-table 1 | A4 SA+IS | sonnet-5-5 |
| 144 | `affordances` | 11 | 0/0/5 | L 3 · F 2 | pass: FALSE 2, FIX-L 3 | - | haiku-5-5 |
| 145 | `tasks` | 11 | 0/5/0 | E 5 | job: FIX-E 5 | A2 | sonnet-5-5 |
| 146 | `machinery-producers` | 11 | 5/5/0 | E 5 · open 5 | job: FIX-E 5, op-table 5 | A2 SA+IS | sonnet-5-5 |
| 148 | `queue-producers` | 11 | 24/7/2 | E 16 · F 1 · C 1 · open 15 | job: FIX-E 15, op-table 15, CODE 1, FALSE 1 | A5 SA+IS | sonnet-5-5 |
| 149 | `notice-producers` | 11 | 8/2/0 | E 9 · open 1 | job: FIX-E 9, op-table 1 | A5 SA+IS | sonnet-5-5 |
| 150 | `queue` | 11 | 6/1/1 | E 2 · C 1 · open 5 | job: op-table 5, CODE 1, FIX-E 2 | A3 SA+IS | sonnet-5-5 |
| 160 | `interface-shell` | 11 | 56/0/1 | F 5 · open 52 | `boot({door})` (`harness.mjs:190`), delete its `ADMIN_*` and import them from `wizard-scripts`, own tables; job: op-table 52, FALSE 5 | SA+IS | sonnet-5-5 |
| 161 | `screens-entry` | 11 | 173/0/0 | C 2 · open 171 | job: op-table 171, CODE 2 | SA+IS | sonnet-5-5 |
| 162 | `screens-wizards` | 11 | 51/0/0 | open 51 | job: op-table 50, builder 1 | SA+IS | sonnet-5-5 |
| 163 | `screens-settings` | 11 | 247/0/0 | E 12 · F 5 · C 1 · open 229 | job: op-table 229, FIX-E 13, FALSE 5, CODE 1 | A5 SA+IS | sonnet-5-5 |
| 164 | `screens-intake` | 11 | 359/1/4 | E 1 · L 1 · F 4 · C 1 · open 357 | job: CODE 1, op-table 355, FALSE 4, FIX-L 1, FIX-E 1, builder 2 | A2 SA+IS | sonnet-5-5 |
| 165 | `screens-daily` | 11 | 250/0/0 | E 2 · open 248 | job: op-table 248, FIX-E 2 | A1 SA+IS | sonnet-5-5 |
| 166 | `screens-inquiry` | 11 | 479/1/4 | E 4 · L 1 · F 5 · C 1 · open 473 | job: op-table 471, FIX-E 4, FALSE 5, builder 2, CODE 1, FIX-L 1 | A4 SA+IS | sonnet-5-5 |
| 167 | `screens-investigate` | 11 | 166/0/0 | E 2 · open 164 | job: op-table 164, FIX-E 2 | A3 SA+IS | sonnet-5-5 |
| 168 | `screens-publish` | 11 | 56/0/4 | E 10 · F 6 · open 44 | job: FIX-E 10, op-table 44, FALSE 6 | A5 SA+IS | sonnet-5-5 |
| 172 | `installer-steps` | 11 | 3/0/0 | open 3 | job: op-table 3 | SA+IS | sonnet-5-5 |
| 173 | `installer` | 11 | 17/0/0 | E 2 · open 15 | job: op-table 15, FIX-E 2 | A5 SA+IS | sonnet-5-5 |
| 176 | `journey-check` | 11 | 16/1/1 | E 1 · F 2 · open 15 | job: op-table 15, FIX-E 1, FALSE 2 | A1 SA+IS | sonnet-5-5 |

## 5. Wave B in numbers

Modules with Wave B work: 87. Of these, 45 have findings and no Wave A job, and 42 are Wave A modules with lines their Wave A job cannot do (their provider is in the same or a following batch, or they need `storeWorld()`).

| | pass (one mechanics §5.10 pass, no job; haiku-5-5) | job (sonnet-5-5) | gap (no work: only FALSE lines remain) |
|---|---|---|---|
| Wave B only (45) | 5: `test-support`, `host-governor`, `doorbell`, `hypotheses`, `affordances` | 34 | 6: `signatures`, `bundler`, `odf-reader`, `docprofile`, `skills`, `agent-model` |
| Wave A modules with Wave B lines (42) | 2: `case-account`, `wizard-scripts` | 40 | 0 |

`interface-shell` and the nine screens modules need `store-assembly` and interface-shell's `boot({door})`: order `store-assembly`, `interface-shell`, then `screens-entry`, `screens-investigate`, `screens-action`, `screens-wizards`, `screens-publish`, then `screens-settings`, `screens-intake`, `screens-daily`, `screens-inquiry` (op-tables §5.5; 1,834 scripted op-table entries over them, 138 more in 35 other modules). `plane` and `control-plane` Wave B jobs follow `store-assembly` (they delete their copies, K624). A pass worker applies the rules of one provider at a time and leaves every judgment line to the module's job; a module that has both kinds is a job.

## 6. Disagreements between the parts and the live list, and what could not be placed

- **K5044's rules removed less than the parts expect.** The live list still carries 220 lines (53 modules) the parts class FALSE; K5044's rules in the check did not remove them: `control-plane` 61, `plane` 15, `reading-pipeline` 12, `answer-envelope` 10, `skills` 8, `bundler` 7, `store-door` 7, `acquisition` 6, `screens-publish` 6, the rest 1 to 5. A job cannot fix a FALSE line by re-pointing: each START names them, tells the job to re-shape them so the check does not read another module's answer (a code asserted back in the same test, or `// fixtures-generic: <CODE>` for a made-up one) and otherwise to report file:line and the part's rule to BOB. Six modules have only such lines (`gap` above). BOB decides whether the check text gets the rules (parts' `Check rules`) or the lines are marked one by one.
- **The live list drops 422 lines the parts class FIX-E, FIX-L, FALSE or CODE** (FALSE 205, FIX-L 111, FIX-E 101, CODE 5; same file and line absent), so 54 fixtures or contracts named in the parts' Providers sections have no user left and are not in any START (for example answer-envelope's `required-argument` 38 lines in `public-read`, `agent-runner`'s `runner-refusals` and `runner-wire` for `agent-model`, `basis-versions`' four fixtures, `office-readers`' `cellsInRefusal`, `case-disclosures`' `accountRefusals`). Seven providers named by the parts have no live user at all and are Wave B: `agent-steps`, `basis-versions`, `calculations`, `corpus-export`, `doorbell`, `office-readers`, `reevaluation`. If BOB wants them as providers anyway, a START is two lines of the generator.
- **2,000 lines no part classes** (K5044 (3) owes them a second audit pass, K5044 (7)): 1,972 op-table entries (1,834 in the nine screens modules and interface-shell, which `storeWorld()` replaces; 138 in 35 other modules, the largest `journey-check` 15, `queue-producers` 15, `installer` 15, `monitoring` 12, `control-plane` 11, `store-door` 8) and 28 builder call sites (`law-relations` 8, `case-authoring` 6, `extraction` 3, `agent-steps` 3, `screens-action` 3, `screens-inquiry` 2, `screens-intake` 2, `screens-wizards` 1). The ones in a Wave A module are in its START with the instruction to read and classify them (`extraction`, `case-authoring`); the rest are in Wave B jobs. No scripted op table outside the screens has a design: `queue-producers`, `monitoring`, `installer` and `store-door` may need one.
- **`journey-check`'s `servedPlane`** (part 4: the real plane served in process, replacing `fake-plane.mjs`) is not given to `plane`: journey-check imports no module and is imported by none (`layers.md:95`, K3100), op-tables §4 says it stays outside. It is Wave B with 1 FIX-E line, 15 op-table entries and 2 FALSE lines; BOB decides the line.
- **Ordering inside the check.** Plane's and control-plane's `fixtures-run` lines cannot clear before their users' markers merge (`orphan-run`), and the users' markers cannot clear before the runs merge (`contract-no-run`), so no module's list is zero until both sides are merged; each START says which lines may remain. After Wave B moves the registrar, ledger and `keepLater` code to `store-assembly`, plane's contract tests keep working only if they run through plane's real `Store` (the START says so); the marker names stay `plane`.
- **Coupled merge** of `translations`, `signin-door`, `control-plane` and `plane` (section 2, item 1): the declarations move is atomic or plane's start stops. If BOB prefers to give the two row removals to `translations` and `signin-door` as an ownership exception, the STARTs change in one line each.
- **Contract ids** follow K5044 (5): `store-replies` (merging `store-envelope` and `store-reply`), `door-helpers` (merging `relay-helpers`, `envelope-helpers`, `required-argument`, `door-answers`); in addition parts 1 and 2's `use-check` and `use-check-refusal` are one contract, `use-check`, and part 3's names `doorHelpers`, `doAnswerShapes`, `storeReplies`, `unknownOp`, `reviewCopyRead`, `sweepFence`, `sweepMutate` are written as `door-helpers`, `door-helpers`, `store-replies`, `unknown-op`, `review-copy-read`, `sweep-fence`, `sweep-mutate`.
- **Parts' line numbers** matched the live list for 936 of its 2,936 lines (every non-op-table, non-builder line matched; matching on module, file name and line). The parts' own module numbers differ from `modules.json`'s positions; this document uses `modules.json`.
- **`pdf-pixels`** has `tests` entries that are single files, so its fixtures file `pdf-worker/test/pdf-pixels-fixtures.mjs` is outside them: its START says to list it in COMPLETE and BOB adds it (K1043).
- **CODE fixes not confirmed against code**: the parts name the real code from a grep; each START says the job confirms. `screens-action`'s `BREACH_ON_HYPOTHESIS` and `LEG_ON_ACTION` have no real code found (part 4 Uncertain 5); the START applies K5044 (6): a real path giving neither is a product cause for BOB.

