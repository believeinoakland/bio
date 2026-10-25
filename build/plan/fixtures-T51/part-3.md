# Fixture round, part 3: slice fx-part-3 (control plane L2 onward: ratification, case-*, actions, queue, monitoring, scheduler, instance-setup)

Slice: 278 findings read, 278 classified: FIX-E 200, FIX-L 35, FALSE 34, CODE 9. Mechanical FIX-E: 68; judgment FIX-E: 132. File paths below are under bio-plane/test/m/<user>/.

## Providers

Fixture = published by the provider's `test/m/<provider>/fixtures.mjs`, made by its real code when the test runs (pattern: promotion `staleBaseRefusal`). FIX-L = contract marker in the user, `// fixtures-run:` test in the provider.

### doc-clean (30)
- `encryptedRefusal`: real doc-clean answer for an encrypted file (`ENCRYPTED`). Users: case-disclosures 1, case-authoring 1 (2).

### project-roster (38)
- `projectReadRefusals`: real `projectRoster.projectList` / `projectInvitations` refusals. Users: queue-producers 2 (2).

### credentials (40)
- `securityMapRefusal`: real `credentials.securityMap(...)` for a non-admin (NOT_AN_ADMIN) and an invalid period (SECURITY_PERIOD_INVALID). Users: notice-producers 2 (2).

### promotion (41)
- `factUnavailable`: real `promotion.fact("unregistered")` (FACT_UNAVAILABLE); NOTE the tests name NO_SUCH_FACT, which only the fact readers (local-facts, money, duties, people) give. Users: case-disclosures 1 (1).
- `groupUndetermined`: real `promotion.promote` of a SUC- success record with no producing group (GROUP_UNDETERMINED, R13). Users: consequences 1 (1).
- `projectActNotParticipant`: real `promotion.promote(pkg)` by a non-participant of the project (PROJECT_ACT_NOT_A_PARTICIPANT), like `staleBaseRefusal`. Users: monitoring 2 (2).
- `registrars`: real `promotionOf(...)`: `registerStep`, `registerFact` (STEP_DECLARED on a second registration), `fact(name)` (FACT_UNAVAILABLE), `onCommitted`. Users: following 1, instance-setup 2 (3).
- `snapKeyTaken`: real `promotion.promote` twice with one snapKey (SNAP_KEY_TAKEN). Users: monitoring 1 (1).

### provenance (43)
- `holdsRegister`: real `provenanceOf(...)` over seeded captures: `registerHolds({sha})`, `registeredFor`, `containerResolver` (held/registered/acquired shapes). Users: ratification 2 (2).
- `homeOfEmpty`: real `provenanceOf(...)` over an empty store: `homeOf(sha)` answers null. Users: tasks 1, machinery-producers 1, queue-producers 2, notice-producers 1, queue 1 (6).
- `homeOfHomed`: real `provenanceOf(...)` with named captures homed by real promotion: `homeOf(sha)` -> `{bundleId}`; fixture takes a `{sha: bundleId}` map. Users: tasks 4, machinery-producers 4, queue-producers 4, notice-producers 1 (13).

### attestation (44)
- `attestationsOfBadSha`: `attestation.attestationsOf({sha:"x"})` (BAD_SHA). Users: filings 1 (1).
- `noKeyInstanceSign`: `attestationOf(host,{record,provenance,signingKey:null,now}).instanceSign(...)` answers RECEIPT_NO_KEY (attestation/index.mjs:231); also the keyless attestation object itself. Users: network-notices 2 (2).

### acquisition (47)
- `acquireRefusals`: real `acquisition.acquire(body,opts)` whose fetch fails (502 SOURCE_REFUSED / FETCH_FAILED) or the address is not eligible (409 NOT_ELIGIBLE). Users: monitoring 6, following 1, link-sweep 1, scheduler 1 (9).

### doorbell (49)
- `readerRegistrarDeclared`: real `doorbell.registerReader` already held by another module (LISTENER_DECLARED). Users: action-holds 2 (2).

### file-safety (50)
- `batchTickAnswers`: real `fileSafety.scanBatch` / `renderBatch` / `deeperBatch` / `forwardSecurityCounts` / tool refresh on an empty store. Users: scheduler 2 (2).
- `declaredRefusals`: real file-safety batch answers for each declared *_ABSENT / *_UNREADABLE / *_INVALID refusal (FILE_SAFETY_CHECKS). Users: scheduler 1 (1).

### sources (51)
- `rungOf`: real `sources.rungOf({source})` over held sources (and NO_SUCH_SOURCE for others). Users: consequences 1 (1).
- `sourceOfReads`: real `sources.sourceOf(capture)` for a capture with no source, a fetched one, and one with a source (plus `publishableAt`). Users: case-disclosures 1 (1).

### entities (56)
- `entitiesWorld`: real `entitiesOf(...)` with `createEntity` (UNKNOWN_KIND, ENTITY_NO_LABEL, ENTITY_NO_NOTE), `addIdentifier` (NO_SUCH_ENTITY, UNKNOWN_SCHEME, SCHEME_NOT_FOR_KIND, NO_BASIS, IDENTIFIER_TAKEN). Users: instance-setup 8 (8).

### events (57)
- `registerReadRefusals`: real events register read refusals CAPTURE_NOT_HELD and NOT_A_REGISTER. Users: following 2 (2).
- `timelineRefusal`: real `events.timeline(...)` refusals NO_SET and BAD_DATE. Users: case-authoring 1, filings 2 (3).

### lines (58)
- `linesWorld`: real `linesOf(...)`: `recordLine` (UNKNOWN_LINE_KIND, NO_SUCH_ENTITY, SEAT_ON_ENDS, HOLDER_NOT_A_PERSON, UNKNOWN_CAPACITY, BAD_CAPACITY, MACHINE_NEEDS_IDENTIFIERS). Users: instance-setup 7 (7).

### local-facts (59)
- `factStatusRefusal`: real `localFacts.factStatus(<unknown fact>)` (NO_SUCH_FACT). Users: action-clocks 1 (1).

### standards (63)
- `standardReadWorld`: real `standardsOf(...)` with declared policies and viewers: `standardRead({id,viewer})` ok and NO_SUCH_STANDARD. Users: case-authoring 1, action-records 1, following 1, notice-producers 2 (5).

### progressions (64)
- `definitionRead`: real `progressions` definition read, refusing with NO_KEY on an unknown key. Users: action-records 1 (1).
- `disposeProposalRefusal`: real `progressions.disposeProposal({})` (NO_KEY). Users: queue 1 (1).
- `proposalsFeed`: real `progressions.proposalsFeed()` unread answers. Users: queue-producers 1 (1).

### money-checks (66)
- `runDetectorsAnswers`: real `moneyChecks.runDetectors({...})` on an empty world. Users: scheduler 1 (1).

### duties (67)
- `occurrences`: real `duties.occurrences({dutyId,viewer})` (NO_SUCH_DUTY and occurrences). Users: following 1 (1).
- `recordTransitionsAnswers`: real `duties.recordTransitions({asOf})`: an empty pass, and an unfinished pass `{done:false,cursor:"DUT-..."}` then a finished one. Users: scheduler 5 (5).
- `transitionsRefusal`: real duties transitions read for an unknown duty (NO_SUCH_DUTY). Users: plan-work 2 (2).

### people (68)
- `evaluateChecksAnswers`: real `people.evaluateChecks({...})` on an empty world (`{ok,evaluated,remaining}`). Users: scheduler 1 (1).
- `tiesConcerningRefusal`: real `people.tiesConcerning({entities,member,viewer})` with a bad argument. Users: case-disclosures 1 (1).

### bias (70)
- `uncleared`: real `bias.uncleared()` refused/undetermined/partial. Users: queue-producers 1 (1).

### retrieval-browse (72)
- `browseViewerMissing`: real `retrievalBrowse.browse({})` with no viewer (VIEWER_MISSING). Users: notice-producers 1 (1).
- `marksRegistrarDeclared`: real `registerBrowseMarks` registered once, so a second answers LISTENER_DECLARED. Users: following 1 (1).

### retrieval (73)
- `actionRegistrar`: real retrieval `registerActionFacts` / `registerProjectionDecoration`. Users: actions 1, action-clocks 1, action-plans 1 (3).
- `noSelection`: real `retrievalOf(...)` over an empty store: `selectionResolve(...)` answers NO_SUCH_SELECTION. Users: case-disclosures 1, case-account 1, case-authoring 1, conformance 1, consequences 1 (5).

### calculations (74)
- `onIngestWorkRefusals`: real `calculations.onIngestWork(module,fn)` registered twice / with a non-function (LISTENER_DECLARED, LISTENER_MALFORMED). Users: scheduler 1 (1).

### inquiry (79)
- `basisForUnread`: real `inquiry.basisFor(<unknown id>)` (NO_ID). Users: case-disclosures 1 (1).

### steps (81)
- `stepRead`: real `steps.stepRead({id})` (NO_SUCH_STEP and a step with looked_at). Users: notice-producers 1 (1).

### basis-versions (84)
- `basisVersions`: real `basisVersions.basisVersions()` unread answers. Users: queue-producers 1 (1).

### strength (85)
- `gradingFactsUnread`: real `strength.gradingFacts(<unknown inquiry>)`; NOTE tests name NO_SUCH_INQUIRY, which strength does not give (it gives NO_ID / NO_SUCH_BUNDLE / NOT_AN_INQUIRY). Users: case-disclosures 1 (1).
- `strengthOfNoId`: real `strength.strengthOf("")` (NO_ID). Users: case-import 1 (1).

### contradiction (86)
- `candidateReads`: real candidate read (`contradiction.candidatesFor`) answering each shape: undetermined, truncated, CANDIDATES_NO_SUBJECT (call with no subject; index.mjs:1596). Users: ratification 1, case-disclosures 1 (2).
- `readRefusals`: real `contradiction.candidatesFor` / `conflictNotices` refusals: unknown or non-participant project (`conflictNotices({project:"PRJ-none",viewer})`, membership notAParticipant), partial/undetermined answers. Users: queue-producers 5 (5).

### capture-requests (91)
- `leads`: real `captureRequests.leads()` unread answers. Users: queue-producers 1 (1).
- `sweepScopeRegistrar`: real capture-requests R45 `registerSweepScope` (LISTENER_DECLARED). Users: link-sweep 1 (1).

### answers (95)
- `limitsUnreadable`: real answers account/limit gate with no limit (LIMITS_UNREADABLE, answers/index.mjs:289). Users: wizard-scripts 1 (1).
- `onStandingSetRegistrarRefusal`: real `answers.onStandingSet` registered twice (LISTENER_DECLARED). Users: scheduler 1 (1).
- `standingQuestions`: real `answers.standingQuestionEnd` / `standingQuestionEndSet` (NO_SUCH_STANDING_QUESTION, STANDING_ENDED). Users: following 3 (3).

### intent (101)
- `gapsRefusal`: real `intent.gaps({})` refusal; NOTE NO_PROJECT is not intent's code. Users: queue-producers 2 (2).
- `intentWorld`: real `intentOf(...)` (`stubIntent()` replacement) with `gaps` and the reads monitoring uses. Users: monitoring 3 (3).

### reevaluation (103)
- `notices`: real `reevaluation.notices()` unread answers. Users: queue-producers 1 (1).

### corpus-export (105)
- `exportLog`: real `corpusExport.exportLog()` unread answers. Users: queue-producers 1 (1).

### case-carriage (106)
- `copyReadStates`: real `caseCarriage` copy read (`documentCopy`) over a captured document in each state: copy, photo, refused, undetermined, unknown capture. Users: case-disclosures 1 (1).
- `copyTickRefusals`: real case-carriage `copyWake`/`copyBatch` tick with no evidence store (DOCUMENT_COPY_NO_STORE). Users: scheduler 1 (1).
- `onCopyWorkRegistrarRefusals`: real `caseCarriage.onCopyWork` registered twice / with a non-function (LISTENER_DECLARED, LISTENER_MALFORMED). Users: scheduler 1 (1).

### publication (108)
- `assembleCaseContainerRefusal`: real `assembleCaseContainer` (publication/worker.mjs) with a material missing (CASE_FILE_NOT_ASSEMBLED); public-read also holds the code. Users: ratification 3 (3).
- `caseDocumentFacts`: real `publication.caseDocumentFacts(c,e)` for an edition with no document (NO_CASE_DOCUMENT) and for a stored one. Users: queue-producers 3 (3).
- `caseFileLedger`: real `caseFilesOwed`, `caseFileNextAt`, `recordCaseFileAttempt` and the build refusals MATERIAL_MISSING / BUCKET_FAILED (public-read/casefile.mjs codes). Users: ratification 2 (2).
- `photoDocRefusals`: real publication commit refusals PHOTO_MARKS_CHANGED_SINCE and DOCUMENT_COPY_CHANGED_SINCE (a photo mark withdrawn / a document copy changed after prepare). Users: ratification 1 (1).
- `publicationWorld`: real `publicationOf(...)` with the reads monitoring uses, instead of `stubPublication()`. Users: monitoring 2 (2).
- `storeCaseDocumentRefusal`: real `publication.storeCaseDocument(<malformed doc>)` (MALFORMED). Users: case-authoring 1 (1).

### publish-schedule (109)
- `scheduleRefusals`: real `publishSchedule.schedule(...)`: PUBLISH_AT_MALFORMED, PUBLISH_AT_NO_ZONE, PUBLISH_AT_PAST, PUBLISH_AT_ALREADY_SET. Users: ratification 1 (1).
- `scheduledEditions`: real `publishSchedule.scheduledEditions()` over waiting, published, stopped (with reasons) and cancelled editions. Users: queue-producers 1 (1).
- `scheduledEditionsUnread`: real `scheduledEditions()` unread answers. Users: queue-producers 1 (1).

### docket (110)
- `coreDue`: real `docket.coreDue()` unread answers. Users: queue-producers 1 (1).
- `docketEntryRead`: real docket entry read (`docketEntry`/`docketPressureOf`) over marks: NO_SUCH_DOCKET_ENTRY for unseen entries. Users: action-holds 3, plan-work 1 (4).

### public-read (111)
- `groupIdentityRegistrar`: real `publicReadOf(...).registerGroupIdentity` (PROVIDER_MALFORMED, PROVIDER_DECLARED). Users: instance-setup 1 (1).

### network-notices (113)
- `openSealsNoEdition`: real `networkNotices.openSeals({case,edition})` for an uncommitted edition (NO_PUBLISHED_EDITION, index.mjs:729/904). Users: ratification 1 (1).

### ratification (115)
- `preflightRefusal`: real ratification R18 pre-flight with no attesting key (NO_ATTESTING_KEY). Users: case-authoring 1 (1).

### case-checker (116)
- `checkAccountMalformed`: real `checkAccount({account:"x"})` (MALFORMED, case-checker/account.mjs:205). Users: case-disclosures 2, case-account 1 (3).

### case-import (117)
- `importedWorld`: real `caseImportOf(...)` with seeded imported editions, acceptances (`accept`), open flags and withdrawals; replaces the hand-built `imports`. Users: case-disclosures 1, case-authoring 1, conformance 1 (3).
- `openFlagsUnread`: real `openFlagsOn` / `acceptanceOf` reads that cannot be read (`{flags:[],complete:false}`, null). Users: case-disclosures 2, case-authoring 1 (3).
- `watchItems`: real `caseImport.watchItems()` unread answers. Users: queue-producers 1 (1).
- `watchedImports`: real case-import with watches: `watchedImports`, `recordDocketRead` (and IMPORT_NOT_WATCHED refusal), `watchItems`. Users: monitoring 3 (3).

### case-disclosures (118)
- `accountRefusals`: real `caseDisclosures.accountJudged({account,cited})` over accounts that each raise ACCOUNT_FACT_NOT_IN_CITED, ACCOUNT_FLAG_UNANSWERED, ACCOUNT_SENTENCE_UNSUPPORTED, ACCOUNT_CLAIM_NOT_BIAS. Users: case-account 3, case-authoring 5 (8).
- `stepRefusals`: real first refusal of each case-disclosures step (hunchDebt, accountJudged, ...) with a world that raises it. Users: case-authoring 1 (1).

### case-account (119)
- `reviewCommentsRegistrar`: real `CaseAccount.registerReviewComments` (MALFORMED, REVIEW_COMMENTS_DECLARED). Users: review 2 (2).

### case-inputs (120)
- `carryOutcome`: real `caseInputs.carryOutcome(...)`: NO_SUCH_CASE (unpublished case), BAD_CARRIED_OUTCOME (bad text), ok. Users: consequences 2 (2).

### case-authoring (121)
- `gateRefusals`: real `caseAuthoring.gate(...)` refusals NO_TARGET, NOT_CONCLUDED, ALREADY_A_CASE_MEMBER. Users: review 2, case-check 1 (3).
- `preflightAnswer`: real `caseAuthoring.publishPreflight(...)` answers: blockers (BELOW_PROJECT_STRENGTH), first refusals MACHINE_CANNOT_PUBLISH / NOT_THE_PROJECT_OWNER. Users: case-check 2 (2).

### review (122)
- `reviewCopyRead`: FIX-L contract `review-copy-read`: `reviewCopy`/comments read answering NO_REVIEW_COPY. Users: case-account 1 (1).

### case-check (123)
- `caseCheckOfNoSuchCase`: real `caseCheck.caseCheckOf({case,viewer})` for a viewer who cannot see the case (NO_SUCH_CASE). Users: conformance 1 (1).

### conformance (124)
- `curesOf`: real `conformance.curesOf({determination,standard,viewer})`. Users: plan-work 1 (1).
- `determinationRead`: real `conformanceOf(...)` with determinations (live, superseded, undetermined outcomes): `determinationRead({id,viewer})`. Users: actions 5, action-clocks 1 (6).
- `noDeterminations`: real `conformanceOf(...)` over an empty store (NO_SUCH_DETERMINATION). Users: monitoring 1 (1).

### consequences (125)
- `consequencesOfRefusal`: real `consequences.consequencesOf(...)` refusal. Users: escalation 1 (1).
- `successRecordRead`: real `consequences.successRecordRead({id})` (NO_SUCH_SUCCESS_RECORD) and a stored success record. Users: actions 1 (1).

### actions (128)
- `actionRead`: real `actions.actionRead({id,viewer,now})`: NO_SUCH_BUNDLE (unknown or unseen), NOT_AN_ACTION, and the action read. Users: escalation 4, action-plans 1, plan-work 1 (6).
- `actionsForRefusal`: real `actions.actionsFor(...)` / `actionRead(...)` refusal for an unknown or unseen target. Users: action-replies 3, escalation 1 (4).

### action-clocks (130)
- `pendingClocksRefusal`: real `actionClocks.pendingClocks({before:"x"})` (PENDING_CLOCKS_BAD_BEFORE). Users: monitoring 1 (1).

### escalation (134)
- `escalationRead`: real `escalation.escalationRead({id,viewer})` / `escalationsFor` (NO_SUCH_ESCALATION, NO_SUCH_DETERMINATION). Users: action-plans 1, plan-work 2 (3).

### action-plans (135)
- `planRead`: real `actionPlans.planRead({id})` (NO_SUCH_PLAN, ok) and `checkpointsDue`, `plansToLookAgain`. Users: action-producers 2 (2).

### plan-work (136)
- `watchReaderRegistrar`: real `planWork.registerWatchReader` (LISTENER_MALFORMED, LISTENER_DECLARED). Users: following 2 (2).

### monitoring (137)
- `flaggedRefusal`: real `monitoring.flagged(...)` unread answer. Users: queue-producers 2 (2).

### following (138)
- `watchedByRefusal`: real `following.watchedBy(...)` (MARK_NO_SUCH_ITEM). Users: notice-producers 1 (1).

### link-sweep (139)
- `sweepFence`: FIX-L contract `sweep-fence`: link-sweep fence answering SWEEP_NOT_A_MEMBER or null. Users: monitoring 1 (1).
- `sweepMutate`: FIX-L contract `sweep-mutate`: `mutate` refusal NO_SUCH_SWEEP relayed as given. Users: monitoring 3 (3).

### wizard-scripts (141)
- `brokenScripts`: real `wizardScripts.brokenScripts()` with a withdrawn script whose refusal code is a real WIZARD_* code. Users: queue 1 (1).
- `brokenScriptsUnread`: real `brokenScripts()` unread answers. Users: queue-producers 1 (1).

### action-producers (146)
- `actionItems`: real `actionProducers.actionItems(...)` over a seeded world. Users: queue-producers 1 (1).

### answer-envelope (155)
- `doAnswerShapes`: FIX-L contract `door-answers`: the `doAnswer` results `{answered:false,correlation}` and `{refused:true,...}`. Users: affordances 3 (3).
- `doorHelpers`: FIX-L contract `door-helpers`: `storeSilent(op)` (502 STORE_DID_NOT_ANSWER), `requiredArgument(op,arg,shape,error)` (REQUIRED_ARGUMENT_MISSING), `doAnswer`, `json`, as exported by answer-envelope/index.mjs. Users: ratification 4, case-disclosures 2, monitoring 1 (7).

### store-door (156)
- `storeReplies`: FIX-L contract `store-replies`: the store's own replies BAD_JSON (400), `unknown op: <op>` (400), STORE_INTERNAL_ERROR (500, with and without `correlation`) (store-door/dispatch.mjs:253,390,406). Users: ratification 7, monitoring 4, translations 2, instance-setup 6 (19).

### control-plane (169)
- `unknownOp`: FIX-L contract `unknown-op`: UNKNOWN_OP refusal with code and translation (control-plane/index.mjs:1046). Users: ratification 1 (1).

## Users

### network-notices (113; 2)
- FIX-E attestation/noKeyInstanceSign: activity.test.mjs:212, words.test.mjs:48 (mechanical)

### ratification (115; 27)
- FIX-E contradiction/candidateReads: contested.test.mjs:108 (judgment)
- FIX-E provenance/holdsRegister: fixture.mjs:145, g54-entry.mjs:103 (judgment)
- FIX-L answer-envelope doorHelpers: fixture.mjs:424, g54-entry.mjs:40, g54-paths.test.mjs:448, g57-heal.test.mjs:47 (marker `// fixtures-contract: answer-envelope door-helpers`)
- FIX-L store-door storeReplies: g54-entry.mjs:189, g54-paths.test.mjs:442, g57-heal.test.mjs:76, relays.test.mjs:119, relays.test.mjs:159, relays.test.mjs:163, relays.test.mjs:188 (marker `// fixtures-contract: store-door store-replies`)
- FIX-E publication/caseFileLedger: g54-paths.test.mjs:109, g54-paths.test.mjs:114 (judgment)
- FIX-E publication/assembleCaseContainerRefusal: g54-paths.test.mjs:310, g54-paths.test.mjs:455, g57-heal.test.mjs:426 (mechanical)
- FIX-L control-plane unknownOp: relays.test.mjs:118 (marker `// fixtures-contract: control-plane unknown-op`)
- FALSE F4: relays.test.mjs:154
- FALSE F10: release.test.mjs:108, release.test.mjs:111
- FIX-E publish-schedule/scheduleRefusals: schedule.test.mjs:127 (mechanical)
- FIX-E publication/photoDocRefusals: scheduled-commit.test.mjs:148 (judgment)
- FIX-E network-notices/openSealsNoEdition: seals.test.mjs:57 (mechanical)
- FALSE F3: whole-rows.test.mjs:40

### case-import (117; 1)
- FIX-E strength/strengthOfNoId: fixture.mjs:192 (mechanical)

### case-disclosures (118; 17)
- CODE ACCOUNT_MALFORMED: no product file gives it; real checkAccount answers `MALFORMED` (case-checker/account.mjs:205). Use MALFORMED, from case-checker/checkAccountMalformed: account.test.mjs:103
- FIX-E sources/sourceOfReads: captures.test.mjs:275 (judgment)
- FIX-E promotion/factUnavailable: carries.test.mjs:172 (judgment)
- FIX-E strength/gradingFactsUnread: carries.test.mjs:295 (judgment)
- FIX-E case-carriage/copyReadStates: documents.test.mjs:154 (judgment)
- FIX-E doc-clean/encryptedRefusal: documents.test.mjs:295 (judgment)
- FIX-E retrieval/noSelection: fixture.mjs:130 (mechanical)
- FIX-E case-import/importedWorld: fixture.mjs:397 (judgment)
- FALSE F2: g50-acts.test.mjs:14
- FIX-L answer-envelope doorHelpers: g50-acts.test.mjs:24, g50-acts.test.mjs:25 (marker `// fixtures-contract: answer-envelope door-helpers`)
- FIX-E inquiry/basisForUnread: hunch.test.mjs:34 (judgment)
- FIX-E case-import/openFlagsUnread: imported.test.mjs:99 (judgment)
- CODE NO_SUCH_IMPORT: no product file gives it; case-import `openFlagsOn` never refuses, its undetermined answer is `{flags:[],complete:false}`. Use that, from case-import/openFlagsUnread: imported.test.mjs:126
- FIX-E people/tiesConcerningRefusal: people.test.mjs:317 (judgment)
- CODE ACCOUNT_MALFORMED: use MALFORMED, from case-checker/checkAccountMalformed: seam.test.mjs:158
- FIX-E contradiction/candidateReads: tensions.test.mjs:135 (judgment)

### case-account (119; 6)
- FIX-E case-checker/checkAccountMalformed: advocacy.test.mjs:123 (mechanical)
- FIX-L review reviewCopyRead: comments.test.mjs:51 (marker `// fixtures-contract: review review-copy-read`)
- FIX-E retrieval/noSelection: fixture.mjs:74 (mechanical)
- FIX-E case-disclosures/accountRefusals: judgment.test.mjs:287, judgment.test.mjs:288, t45-judgment.test.mjs:161 (judgment)

### case-authoring (121; 14)
- FIX-E case-disclosures/accountRefusals: account.test.mjs:108, account.test.mjs:109, account.test.mjs:364, account.test.mjs:482, outcomes.test.mjs:107 (judgment)
- CODE PDF_ENCRYPTED: no product file gives it; the real code is ENCRYPTED (doc-clean, file-safety). Use ENCRYPTED, from doc-clean/encryptedRefusal: copy-now.test.mjs:115
- FIX-E case-disclosures/stepRefusals: disclosures.test.mjs:66 (judgment)
- FIX-E retrieval/noSelection: fixture.mjs:209 (mechanical)
- FIX-E case-import/importedWorld: fixture.mjs:531 (judgment)
- FIX-E publication/storeCaseDocumentRefusal: g47-refusal.test.mjs:43 (mechanical)
- FIX-E ratification/preflightRefusal: preflight.test.mjs:409 (judgment)
- CODE NO_SUCH_IMPORT: as above, use `{flags:[],complete:false}`, from case-import/openFlagsUnread: rests.test.mjs:136
- FIX-E standards/standardReadWorld: standards.test.mjs:34 (judgment)
- FIX-E events/timelineRefusal: timeline.test.mjs:190 (judgment)

### review (122; 4)
- FIX-E case-authoring/gateRefusals: copy.test.mjs:117, zone-concluded.test.mjs:135 (judgment)
- FIX-E case-account/reviewCommentsRegistrar: fixture.mjs:130, fixture.mjs:131 (judgment)

### case-check (123; 3)
- FIX-E case-authoring/preflightAnswer: hold.test.mjs:8, hold.test.mjs:47 (judgment)
- FIX-E case-authoring/gateRefusals: hold.test.mjs:58 (judgment)

### conformance (124; 3)
- FIX-E retrieval/noSelection: fixture.mjs:147 (mechanical)
- FIX-E case-import/importedWorld: fixture.mjs:263 (judgment)
- FIX-E case-check/caseCheckOfNoSuchCase: t45.test.mjs:402 (mechanical)

### consequences (125; 5)
- FIX-E retrieval/noSelection: fixture.mjs:128 (mechanical)
- FIX-E sources/rungOf: fixture.mjs:144 (judgment)
- FIX-E case-inputs/carryOutcome: fixture.mjs:188, fixture.mjs:190 (judgment)
- FIX-E promotion/groupUndetermined: t46.test.mjs:252 (mechanical)

### action-records (127; 2)
- FIX-E progressions/definitionRead: fixture.mjs:175 (judgment)
- FIX-E standards/standardReadWorld: fixture.mjs:194 (judgment)

### actions (128; 7)
- FIX-E retrieval/actionRegistrar: fixture.mjs:111 (mechanical)
- FIX-E conformance/determinationRead: t12.test.mjs:16, t18.test.mjs:16, t45.test.mjs:40, t50.test.mjs:27, write.test.mjs:153 (judgment)
- FIX-E consequences/successRecordRead: t45.test.mjs:45 (judgment)

### action-holds (129; 5)
- FIX-E docket/docketEntryRead: due.test.mjs:29, places.test.mjs:92, t51.test.mjs:87 (judgment)
- FIX-E doorbell/readerRegistrarDeclared: readers.test.mjs:115, readers.test.mjs:135 (judgment)

### action-clocks (130; 3)
- FIX-E local-facts/factStatusRefusal: factreader.test.mjs:105 (mechanical)
- FIX-E retrieval/actionRegistrar: fixture.mjs:116 (mechanical)
- FIX-E conformance/determinationRead: fixture.mjs:133 (judgment)

### action-replies (131; 3)
- FIX-E actions/actionsForRefusal: open.test.mjs:97, open.test.mjs:98, open.test.mjs:107 (judgment)

### filings (133; 3)
- FIX-E events/timelineRefusal: chronology.test.mjs:122, words.test.mjs:172 (mechanical)
- FIX-E attestation/attestationsOfBadSha: packet.test.mjs:203 (mechanical)

### escalation (134; 6)
- FIX-E actions/actionsForRefusal: draft.test.mjs:110 (judgment)
- FIX-E consequences/consequencesOfRefusal: draft.test.mjs:111 (judgment)
- FIX-E actions/actionRead: draft.test.mjs:143, fixture.mjs:162, fixture.mjs:163, fixture.mjs:165 (judgment)

### action-plans (135; 4)
- FIX-E escalation/escalationRead: fixture.mjs:131 (judgment)
- FIX-E retrieval/actionRegistrar: fixture.mjs:169 (mechanical)
- FIX-E actions/actionRead: fixture.mjs:180 (judgment)
- FALSE F8: words.test.mjs:34

### plan-work (136; 7)
- FIX-E conformance/curesOf: fixture.mjs:24 (judgment)
- CODE NO_SUCH_ENTRY: no product file gives it; docket gives NO_SUCH_DOCKET_ENTRY. Use that, from docket/docketEntryRead (replaces the whole `docket` stand-in): fixture.mjs:34
- FIX-E actions/actionRead: fixture.mjs:56 (judgment)
- FIX-E escalation/escalationRead: matters.test.mjs:113, takeup.test.mjs:14 (judgment)
- FIX-E duties/transitionsRefusal: takeup.test.mjs:175, takeup.test.mjs:221 (judgment)

### monitoring (137; 34)
- FALSE F11: cadence.test.mjs:5, fixture.mjs:270
- FIX-E case-import/watchedImports: docket.test.mjs:8, docket.test.mjs:130, fixture.mjs:359 (judgment)
- FALSE F6: docket.test.mjs:87
- FALSE F7: docket.test.mjs:171
- FIX-E acquisition/acquireRefusals: docket.test.mjs:172, docket.test.mjs:188, invariants.test.mjs:27, invariants.test.mjs:126, ticks.test.mjs:145, understanding.test.mjs:153 (mechanical)
- FIX-E conformance/noDeterminations: fixture.mjs:203 (mechanical)
- FIX-E intent/intentWorld: fixture.mjs:209, fixture.mjs:209, understanding.test.mjs:7 (judgment)
- FIX-E publication/publicationWorld: fixture.mjs:210, fixture.mjs:210 (judgment)
- FIX-L link-sweep sweepFence: fixture.mjs:314 (marker `// fixtures-contract: link-sweep sweep-fence`)
- FIX-E promotion/projectActNotParticipant: monitorset.test.mjs:167, named-requests.test.mjs:200 (mechanical)
- FIX-E promotion/snapKeyTaken: named-requests.test.mjs:227 (mechanical)
- FIX-L link-sweep sweepMutate: named-requests.test.mjs:409, named-requests.test.mjs:414, named-requests.test.mjs:415 (marker `// fixtures-contract: link-sweep sweep-mutate`)
- FIX-L answer-envelope doorHelpers: relay.test.mjs:26 (marker `// fixtures-contract: answer-envelope door-helpers`)
- FIX-L store-door storeReplies: relay.test.mjs:35, relay.test.mjs:40, relay.test.mjs:54, relay.test.mjs:57 (marker `// fixtures-contract: store-door store-replies`)
- FALSE F4: relay.test.mjs:49
- FALSE F5: relay.test.mjs:67
- FIX-E action-clocks/pendingClocksRefusal: understanding.test.mjs:479 (mechanical)

### following (138; 12)
- FIX-E promotion/registrars: fixture.mjs:66 (mechanical)
- FIX-E acquisition/acquireRefusals: fixture.mjs:132 (mechanical)
- FIX-E standards/standardReadWorld: fixture.mjs:212 (judgment)
- FIX-E duties/occurrences: fixture.mjs:260 (judgment)
- FIX-E plan-work/watchReaderRegistrar: fixture.mjs:268, fixture.mjs:269 (judgment)
- FIX-E answers/standingQuestions: fixture.mjs:298, fixture.mjs:304, fixture.mjs:305 (judgment)
- FIX-E retrieval-browse/marksRegistrarDeclared: marks.test.mjs:215 (mechanical)
- FIX-E events/registerReadRefusals: proceeding.test.mjs:118, proceeding.test.mjs:155 (mechanical)

### link-sweep (139; 2)
- FIX-E capture-requests/sweepScopeRegistrar: fixture.mjs:74 (judgment)
- FIX-E acquisition/acquireRefusals: fixture.mjs:201 (mechanical)

### scheduler (140; 13)
- FIX-E acquisition/acquireRefusals: consumers.test.mjs:234 (mechanical)
- FIX-E case-carriage/copyTickRefusals: copies.test.mjs:90 (mechanical)
- FIX-E case-carriage/onCopyWorkRegistrarRefusals: copies.test.mjs:148 (mechanical)
- FIX-E file-safety/batchTickAnswers: files.test.mjs:47, fixture.mjs:157 (mechanical)
- FIX-E file-safety/declaredRefusals: files.test.mjs:164 (judgment)
- FIX-E duties/recordTransitionsAnswers: fixture.mjs:114, new-work.test.mjs:167 (mechanical)
- CODE REGISTRATION_CLOSED: no product file gives it; calculations `onIngestWork` refuses with LISTENER_DECLARED / LISTENER_MALFORMED (membership listenerRefusal). Use those, from calculations/onIngestWorkRefusals: g55-ingest.test.mjs:141
- FIX-E duties/recordTransitionsAnswers+people/evaluateChecksAnswers+money-checks/runDetectorsAnswers: new-work.test.mjs:92 (mechanical)
- FIX-E duties/recordTransitionsAnswers: new-work.test.mjs:121, new-work.test.mjs:121 (judgment)
- FIX-E answers/onStandingSetRegistrarRefusal: t34.test.mjs:176 (mechanical)

### wizard-scripts (141; 1)
- FIX-E answers/limitsUnreadable: writing-help.test.mjs:217 (mechanical)

### affordances (143; 5)
- FALSE F9: catalogue.test.mjs:959, t33.test.mjs:404
- FIX-L answer-envelope doAnswerShapes: door.test.mjs:115, door.test.mjs:154, door.test.mjs:234 (marker `// fixtures-contract: answer-envelope door-answers`)

### tasks (144; 6)
- FALSE F3: authority.mjs:35
- FIX-E provenance/homeOfHomed: inbox.test.mjs:188, ledger.test.mjs:55, ledger.test.mjs:78, world.mjs:124 (judgment)
- FIX-E provenance/homeOfEmpty: world.mjs:99 (mechanical)

### machinery-producers (145; 5)
- FIX-E provenance/homeOfHomed: conditions.test.mjs:23, invariants.test.mjs:35, invariants.test.mjs:119, producers.test.mjs:26 (judgment)
- FIX-E provenance/homeOfEmpty: world.mjs:116 (mechanical)

### action-producers (146; 2)
- FIX-E action-plans/planRead: t45.test.mjs:288 (judgment)
- FIX-E action-plans/planRead: world.mjs:123 (mechanical)

### queue-producers (147; 20)
- FIX-E action-producers/actionItems: action.test.mjs:20 (judgment)
- CODE PROJECT_NOT_PARTICIPANT: no product file gives it; contradiction `conflictNotices` answers membership `notAParticipant` = PROJECT_ACT_NOT_A_PARTICIPANT. Use that, from contradiction/readRefusals: contradictions.test.mjs:159
- FIX-E publication/caseDocumentFacts: credit.test.mjs:28 (judgment)
- FIX-E provenance/homeOfHomed: feeditems.test.mjs:125, lead.test.mjs:18, producers.test.mjs:29, reads.test.mjs:227 (judgment)
- FIX-E queue-producers feeds (per-feed provider reads, see Providers: bias, progressions, basis-versions, capture-requests, corpus-export, reevaluation, intent, monitoring, contradiction, publication, docket, case-import, wizard-scripts, publish-schedule): feeds.test.mjs:74 (judgment)
- FIX-E intent/gapsRefusal: feeds.test.mjs:82 (judgment)
- FIX-E project-roster/projectReadRefusals: feeds.test.mjs:98, inviter.test.mjs:74 (judgment)
- FIX-E monitoring/flaggedRefusal: producers.test.mjs:133 (judgment)
- FIX-E provenance/homeOfEmpty: proposals.test.mjs:32, world.mjs:150 (mechanical)
- FIX-E contradiction/readRefusals: reads.test.mjs:58, reads.test.mjs:90, reads.test.mjs:98 (judgment)
- FIX-E publish-schedule/scheduledEditions: scheduled.test.mjs:62 (judgment)
- FALSE F13: scheduled.test.mjs:157
- FIX-E publication/caseDocumentFacts: world.mjs:159 (mechanical)

### notice-producers (148; 9)
- FIX-E credentials/securityMapRefusal: fixture.mjs:20, security.test.mjs:177 (mechanical)
- FIX-E standards/standardReadWorld: fixture.mjs:27 (mechanical)
- FIX-E provenance/homeOfEmpty: fixture.mjs:31 (mechanical)
- FIX-E steps/stepRead: investigation.test.mjs:289 (judgment)
- FIX-E standards/standardReadWorld: policy.test.mjs:41 (judgment)
- FIX-E provenance/homeOfHomed: read.test.mjs:50 (judgment)
- FIX-E retrieval-browse/browseViewerMissing: watched.test.mjs:132 (mechanical)
- FIX-E following/watchedByRefusal: watched.test.mjs:134 (mechanical)

### queue (149; 3)
- CODE STEP_GONE: no product file gives it; wizard-scripts has WIZARD_STEP_REFUSED and the other WIZARD_* codes (C-131.x). Use a real one, from wizard-scripts/brokenScripts: watched.test.mjs:38
- FIX-E provenance/homeOfEmpty: world.mjs:121 (mechanical)
- FIX-E progressions/disposeProposalRefusal: world.mjs:132 (mechanical)

### translations (150; 2)
- FIX-L store-door storeReplies: fixture.mjs:77, fixture.mjs:83 (marker `// fixtures-contract: store-door store-replies`)

### instance-setup (151; 42)
- FALSE F1: declared-ops.test.mjs:11, group.test.mjs:7, limits.test.mjs:5, profiles.test.mjs:6, r8-parts-report.test.mjs:7, r9-parts-kept-outside-isolate.test.mjs:8, relay.test.mjs:7, reports.test.mjs:9, store-place.test.mjs:7, t45.test.mjs:6, t47.test.mjs:7, t51.test.mjs:5
- FIX-E promotion/registrars: fixture.mjs:79, fixture.mjs:82 (mechanical)
- FIX-E public-read/groupIdentityRegistrar: fixture.mjs:118 (mechanical)
- FIX-L store-door storeReplies: fixture.mjs:190, fixture.mjs:200, fixture.mjs:216, relay.test.mjs:13, relay.test.mjs:15, relay.test.mjs:16 (marker `// fixtures-contract: store-door store-replies`)
- FALSE F2: fixture.mjs:207, limits.test.mjs:9, r9-parts-kept-outside-isolate.test.mjs:136, reports.test.mjs:21
- FIX-E entities/entitiesWorld: fixture.mjs:249, fixture.mjs:250, fixture.mjs:251, fixture.mjs:259, fixture.mjs:261, fixture.mjs:262, fixture.mjs:263, fixture.mjs:266 (judgment)
- FIX-E lines/linesWorld: fixture.mjs:275, fixture.mjs:276, fixture.mjs:277, fixture.mjs:278, fixture.mjs:279, fixture.mjs:280, fixture.mjs:283 (judgment)
- FALSE F4: relay.test.mjs:14
- FALSE F12: t46.test.mjs:136

## Check rules

- F1 (12): a stub-named binding IMPORTED from the user's own test fixture file (a test-support helper, not another module's interface). e.g. instance-setup/declared-ops.test.mjs:11, instance-setup/group.test.mjs:7
- F2 (5): a platform stub: a Durable Object / store-fetch / HTTP stub the harness builds (stubOver, stubOf, dumbStub, bootstrapStub, stubFor). e.g. case-disclosures/g50-acts.test.mjs:14, instance-setup/fixture.mjs:207
- F3 (2): a wrapper that only delegates to the real provider's function (logging or forwarding), `x.name = (a) => real.name(a)`. e.g. ratification/whole-rows.test.mjs:40, tasks/authority.mjs:35
- F4 (3): a raw platform error reply (a thrown error's stack, `{ok:false,error:STACK}` with no product answer) fed to a relay. e.g. ratification/relays.test.mjs:154, monitoring/relay.test.mjs:49
- F5 (1): a pass-through payload the test asserts is relayed verbatim (any reason will do). e.g. monitoring/relay.test.mjs:67
- F6 (1): a reply of the fake external network (a remote site's 404), not a module's answer. e.g. monitoring/docket.test.mjs:87
- F7 (1): the user module's own operation replaced by a failing one (its own answer shape). e.g. monitoring/docket.test.mjs:171
- F8 (1): a literal that is an argument of the user module's own checker/probe (offending([...])), a negative example. e.g. action-plans/words.test.mjs:34
- F9 (2): a deliberately unknown code handed in as input to a catalogue lookup (negative control). e.g. affordances/catalogue.test.mjs:959, affordances/t33.test.mjs:404
- F10 (2): a code built by a template literal in the product (`BAD_${name.toUpperCase()}`), so no UPPER_SNAKE literal exists. e.g. ratification/release.test.mjs:108, ratification/release.test.mjs:111
- F11 (2): test data registered through the real registry (`registerDoctype`), named stub. e.g. monitoring/cadence.test.mjs:5, monitoring/fixture.mjs:270
- F12 (1): a local test helper whose name equals a service (partsOf), not a stand-in. e.g. instance-setup/t46.test.mjs:136
- F13 (1): a value seeded as INPUT to the real module (reasons handed to real publish-schedule), and the code exists in ratification/checks.mjs (check missed it). e.g. queue-producers/scheduled.test.mjs:157

Rule suggestions for BOB's check text: F1/F2/F12 are one rule family (name-only matches in harness code: skip stub-named bindings imported from the same module's tests or that wrap a Request/fetch/DO); F3 (delegation): skip an assignment whose right side is a call of the same name on another object; F4/F5: skip `reply`/`store(...)` literals handed to a relay op under test; F10: expand `BAD_${...}` template codes when scanning source.

## Uncertain

- Real calls named above were read from provider source for the codes (grep), not run; each provider job must confirm the call yields the shown answer and adjust inputs. Named reads whose exact function was not opened: attestation `attestationsOf` (BAD_SHA), people `tiesConcerning` refusal, events register read (CAPTURE_NOT_HELD, NOT_A_REGISTER), duties transitions read behind plan-work's `transitionsAnswer`, case-carriage copy read, steps `stepRead`, `consequencesOf`.
- Tests that use a code the provider does not give, so the re-point changes the asserted code (user job must follow the provider's real code): case-disclosures carries.test:172 (NO_SUCH_FACT; promotion.fact gives FACT_UNAVAILABLE), carries.test:295 (NO_SUCH_INQUIRY; strength gives NO_ID/NO_SUCH_BUNDLE/NOT_AN_INQUIRY), queue-producers feeds.test:82 (NO_PROJECT is not intent's code), the many generic invented reasons (BROKEN, UNAVAILABLE, REFUSED, SOMETHING, X, NO, down, OTHER) in action-replies, escalation, filings, queue-producers, case-disclosures: they stand for "a read that refuses", so any real refusal of that read will do.
- queue-producers feeds.test:74 (finding 207) covers 14 providers at once through the BREAK map; each provider publishes the "unread" answers of the named read (Providers list), judgment because the world must be made to answer so.
- queue-producers scheduled.test:62 (219) is class code but SCHEDULED_SOURCE_CHANGED and SCHEDULED_HOLD_CHANGED exist (ratification/checks.mjs, schedule.mjs): I classified it FIX-E for the hand-built `scheduled([...])` entries (publish-schedule); BOB may prefer FALSE (check missed the code) with the stand-in left to the user job. Same code at scheduled.test:157 is FALSE F13.
- ratification g54-paths:310, 455 and g57-heal:426: CASE_FILE_NOT_ASSEMBLED is given by publication and public-read both; I chose publication (assembleCaseContainer is publication/worker.mjs).
- ratification fixture.mjs:424 uses reason STORE_SILENT (publication/public-read casefile code) in the door helper `storeSilent`; the plane helper gives STORE_DID_NOT_ANSWER. Taken as the door-helpers contract; user job decides which code the test means.
- monitoring docket.test:125 (404 NO_SUCH_CASE) taken as FALSE F6 (remote site reply); if the daemon's read wrapper classifies the status by the body, treat as the docket module's answer (docket, earlier) instead.
- monitoring understanding.test:479 PENDING_CLOCKS_BAD_BEFORE: action-clocks gives it; fixture assumes `pendingClocks({before:"x"})`.
- scheduler/files.test:164 (175): declared file-safety refusal codes are built from FILE_SAFETY_CHECKS; whether each can be produced by a real batch call is unchecked (judgment; a declared-code subset may need a FIX-L-style run test instead).
- FIX-L provider tests: `// fixtures-run:` needs one provider test per user module and contract id: store-door store-replies (ratification, monitoring, instance-setup, translations), answer-envelope door-helpers (ratification, case-disclosures, monitoring) and door-answers (affordances), control-plane unknown-op (ratification), review review-copy-read (case-account), link-sweep sweep-fence / sweep-mutate (monitoring). A provider job can instead publish a fixture only if BOB wants these users moved after the provider (no).
- affordances door.test:115, 154, 234 (STORE_REFUSED): the check calls them codes; they are the `{refused:true,...}` door-answer shape of answer-envelope `doAnswer`, so FIX-L; STORE_REFUSED itself appears only in record-core.

## Tally

FIX-E 200 + FIX-L 35 + FALSE 34 + CODE 9 = 278 = lines in fx-part-3.txt (278). Each finding file:line appears once under Users.
