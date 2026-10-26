> **Split K5021.** Part of `audit-fixtures-part5-L5plus.md`, split by section; contains the tables by provider module, intent to control-plane (index 101 to 169). The rest: the header, the findings for BOB and the Summary (with its lists): `audit-fixtures-part5-L5plus.md`; the tables by provider module, member-roster to agent-worker (index 35 to 100): `audit-fixtures-part5-L5plus-tables-a.md`.

### intent (index 101)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:151; queue-producers/world.mjs:172 (read in full) | queue (149) | intent `gaps` | `{ok:true, gaps:[]}` | method exists (intent/index.mjs:675) | A |
| 2 | bio-plane/test/m/monitoring/fixture.mjs:322-338 `stubIntent` (range 300-381) | monitoring (137) | intent `watchSet`, `registerSource` | `watchSet` pages of two `{entities:[], progressions:[], captures, limit:2, truncated, cursor}`; `registerSource -> {ok:true}` | method exists (intent/index.mjs:700); answer keys not compared | A |
| 3 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `ageDue/ageWake/ageSurfaced`, `servesOf` | `{aged:[]}`; `{ok:true, serves:[], truncated:false}` | unknown; intent/discovery.test.mjs:222-223 asserts `ageSurfaced` also answers `refused` | A |

### investigation (index 102)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `milestonesOverdue`, `quietPrompts` | `{ok:true, due:[]}`, `{ok:true, prompts:[]}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### reevaluation (index 103)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-inquiry/fr5-document.test.mjs:31 (read in full) | screens-inquiry (165) | reevaluation / content `versionnotice` (content/index.mjs:1265) | `{ok, target, notices:[{ord, target, content_id, capture_sha, state:"newer_capture_matched", newer, affects, candidates, chains}], count, wrote:false}` | state name yes (content/index.mjs:1265); other keys unknown | A |
| 2 | bio-plane/test/m/queue/world.mjs:144-150; queue-producers/world.mjs:164-167 (read in full) | queue (149) | reevaluation `notices`, `correctedDependents`, `docketDependents`, `citedCaseDependents` | empty pages with `limit`, `truncated`, `cursor`, `count`, `wrote` | methods exist (reevaluation/index.mjs:1953, 2081); answers not compared | A |
| 3 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `noticeSweepDue/Wake/noticeSweep` | `{pending:false}` | unknown | A |
| 4 | bio-plane/test/m/reevaluation/caseparts.test.mjs:30 (line seen by grep) | reevaluation (103) | publication `parts` | `pub.ratified[c] \|\| {ok:false, reason:"NO_CASE_EDITION"}` | NO: in no source | A |

### corpus-export (index 105)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:141; queue-producers/world.mjs:163 | queue (149) | corpus-export `exportLog` | `{ok:true, exports:[], limit:200, truncated:false}` | method exists (corpus-export/index.mjs:217) | A |

### case-carriage (index 106)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/case-disclosures/fixture.mjs:308-348 `marksStandIn` (file read in full) | case-disclosures (118) | case-carriage `photoMarks`, `documentCopy` (R10, R16, R22) | stand-in with held photos `{ok, capture, photo, state, marks, copy, refused, obscured:{copy,label,marked,kind}}`, default `{state:"public", copy:null, refused:null}`; the same fixture composes the REAL case-carriage when `realCarriage` (:176-189) | unknown; checkable against the real arm in the same file | B |
| 2 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `copyWake`, `copyBatch`, `onCopyWork` | `{ok, copied, clean, public, refused, failed, remaining}` | unknown | A |

### publication (index 108)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:137; queue-producers/world.mjs:159 (read in full) | queue-producers (147) | publication `caseDocumentFacts` | `(c, e) => ({ok:false, reason:"NO_CASE_DOCUMENT", case:c, edition:e})` | method exists (publication/index.mjs); reason is the one publication/door.test.mjs:138 asserts | A |

### publish-schedule (index 109)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:139; queue-producers/world.mjs:160; scheduler/fixture.mjs:125-128 | queue (149) | publish-schedule `scheduledEditions`; `publishWake`, `publishDue` | `{ok:true, editions:[], limit:500, cursor:null}` | method exists (publish-schedule/index.mjs:113) | A |
| 2 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `publishWake`, `publishDue` | `{ok:true, taken:[]}` | method exists (publish-schedule/index.mjs:113 area); keys not compared | A |

### docket (index 110)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:171; queue-producers/world.mjs:183 (read in full) | queue (149) | docket `coreDue` | `{ok:true, items:[], count:0, wrote:false}` | method exists (docket/index.mjs:970) | A |

### network-notices (index 113)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:143; queue-producers/world.mjs:184 (read in full) | queue (149) | network-notices `noticesOf` | `{ok:true, notices:[]}` / `{ok, project, notices:[], sealed_weeks:[], methodVersion:1}` | method exists (network-notices/index.mjs:861) | A |
| 2 | bio-plane/test/m/ratification/fixture.mjs:220 (header 1-60 and grep of the file; not read in full) | ratification (115) | network-notices `openSeals` | "a stand-in: each call kept in `sealCalls`, answered by `w.openSeals`" | unknown | A |
| 3 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `sealDue/Wake/Tick`, `attestDue/Wake/Tick` | `{ok, sealed:[]}`; `{ok, monthly, missed, closed, lapsed, openings}` | unknown | A |

### case-checker (index 116)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/case-disclosures/fixture.mjs:156-168 (read in full) | case-disclosures (118) | case-checker `checkCaseFile` | `checkCaseFile: async () => ({format:"bio-case-file/1", case, edition, group, checker:{grading_versions, checks_version:"1.57.0"}, integrity, signatures, ..., findings})` scripted for the real case-import | unknown (case-checker 116 is earlier than case-disclosures 118; its real output not compared) | A |

### case-import (index 117)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:173 against queue-producers/world.mjs:168 (both read in full) | queue (149) | case-import `watchItems` (case-import/index.mjs:1947-1951) | queue/world.mjs answers `{ok:true, entries:[], refused:[], unreadable:[]}`; queue-producers/world.mjs answers `{entries, refused, unreadable}` | the second is the real shape (`empty = {entries, refused, unreadable}`, no `ok`); the first adds an `ok` the provider never answers | A |
| 2 | bio-plane/test/m/case-disclosures/fixture.mjs:370-417 `importsStandIn` (file read in full) | case-disclosures (118) | case-import `importedCase`, `acceptanceOf`, `openFlagsOn`, registration `finding`/`openFlags`/`withdrawals` | a full in-memory stand-in of the module's registration with the accepted-work seam (`registerAcceptedWork("case-import", imports.registration)`); the same file offers the REAL module when `realImports` (:157-168) | unknown; the real arm exists in the same fixture, so the stand-in is checkable against it | B |
| 3 | bio-plane/test/m/monitoring/fixture.mjs:359-381 `stubCaseImport` (range 300-381) | monitoring (137) | case-import `watchedImports`, `recordDocketRead` (case-import/index.mjs:1700, 1801) | pages of two in import order; `recordDocketRead` -> `{ok:true, outcome, new_entries, new_moves:0, new_refused:0}` or a configured refusal/throw | methods exist; answer keys not compared | A |

### case-authoring (index 121)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/case-authoring/documents.test.mjs:22; photos.test.mjs:29; rests.test.mjs:136 (lines seen by grep) | case-authoring (121) | case-carriage / image-cover / case-import answers | `{code:"PDF_ENCRYPTED", detail}`; `refused:{code:"FORMAT_NOT_COVERABLE", detail:"HEIC"}`; `{ok:false, reason:"NO_SUCH_IMPORT"}` | NO for all three (in no module source; the real image-cover/clean codes are not compared) | A |

### review (index 122)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/publication/door.test.mjs:142-150 (file read in full) | publication (108) | review (122) provider registered through `publication.registerReviewProvider` | `registerReviewProvider("review", {draftForMember: () => null, ..., grantAdmitsCaseEdition: (s,c,e) => grant.live && ...})` | review is LATER (122) than publication (108): the rule cannot be met as written | A* |
| 2 | bio-plane/test/m/notice-producers/fixture.mjs:42 (range 1-60) | notice-producers (148) | review `reviewCommentsLeftOut` | `{ok:true, items:[], undetermined:0, truncated:false}` | method exists (review/index.mjs); answer not compared | A |

### conformance (index 124)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/escalation/fixture.mjs:98-137 (range 90-215) | escalation (134) | conformance `determinationRead`, `determinationsFor`, `curesOf` | an in-memory ledger answering `{ok:true, ...determination, live}`, paged `{ok, items, cursor, truncated}` with sight rules, `NO_SUCH_DETERMINATION` | refusal code exists; answer shape not compared (conformance/index.mjs:1335) | A |
| 2 | bio-plane/test/m/action-plans/fixture.mjs:100-115 (range 85-182) | action-plans (135) | conformance `determinationRead`, `determinationsFor` | the same ledger retyped with `out_of_view` | as above | A |
| 3 | bio-plane/test/m/monitoring/fixture.mjs:203 | monitoring (137) | conformance `determinationRead`, `registerStep` | `determinationRead: () => ({ok:false, reason:"NO_SUCH_DETERMINATION"})`, `registerStep: () => ({ok:true})` | refusal code exists | A |

### consequences (index 125)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/escalation/fixture.mjs:140-157 (range) | escalation (134) | consequences `addressed`, `consequencesOf` (consequences/index.mjs:941, 1018) | `{state:"undetermined", parts:[], says}`; `{ok, determination, standard, parts, totals, undetermined, unproven, says}` | answer keys not compared | A |

### actions (index 128)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/escalation/fixture.mjs:158-205 (lines 162-165 are the refusals; range 90-215) | escalation (134) | actions `actionRead`, `actionsFor`, `actionFacts` (actions/index.mjs:2890-2915) | reimplemented from the record: refusals `NO_SUCH_BUNDLE` and `NOT_AN_ACTION`; ok answer `{ok, id, current_state, kind, resolution, reply_owed, correspondence, legs:[{target,kind}], premise_override, breach, counterparty, clock}` | NO for the refusals: the real read answers `NO_SUCH_ACTION` for an absent, unseen or non-action id (:2893-2894, action-records/index.mjs:104); ok answer has `title`, `project`, `state_history`, `law`, legs with `note`, `at`, `target_type`, `extent_capture` that the stand-in lacks | A |
| 2 | bio-plane/test/m/action-plans/fixture.mjs:170, 179-181 (range) | action-plans (135) | actions `actionRead` (wrapped) | the REAL `actionsOf` wrapped so a hidden action answers `{ok:false, reason:"NO_SUCH_BUNDLE", target}` | NO: the real refusal is `NO_SUCH_ACTION` | A |
| 3 | bio-plane/test/m/queue-producers/world.mjs:180 | queue-producers (147) | actions `place` | `({time_zone:{value:"UTC", status:"ruled", basis:"TEST"}})` | method exists (actions/index.mjs); shape not compared | A |
| 4 | bio-plane/test/m/affordances/door.test.mjs:66-77, 12-16 (file read in full) | affordances (143) | actions `actionkinds` (actions/index.mjs:3331), affordances store routes `affordancescreens`, `affordancevocab`, `affordancefacts` | store stub: `{answered:true, result:{kinds: KINDS}}` for `actionkinds`; `SCREENS`, `PROFILE` and `FACTS` literals; `{answered:false, correlation}` / `{refused:true, reason:"STORE_REFUSED"}` as the helpers' answers | `actionkinds`: the real answer is `{ok:true, kinds}` (the stub's lacks `ok`); screens come from screens modules and wizard-scripts (all LATER); `STORE_REFUSED` is the recorder's own word | A |

### action-holds (index 129)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:160-162 | queue (149) | action-holds `holdsDue`, `holdsReleased` | empties | methods exist (action-holds/index.mjs:720, 597) | A |

### filing-templates (index 132)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:179 | queue (149) | filing-templates `reviewsRequested` | `({limit}) => ({ok:true, items:[], limit: limit ?? 500, truncated:false, cursor:null})` | method exists (filing-templates/index.mjs:1328) | A |

### filings (index 133)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/escalation/fixture.mjs:209-215 (range) | escalation (134) | filings `filingsFor`, `availableActions` | `{ok, drafts:[{id,tier}], packets:[]}`; `{ok, kinds:[{kind, tier, words, counsel?}]}` | unknown (not compared) | A |
| 2 | bio-plane/test/m/action-plans/fixture.mjs:134 (range) | action-plans (135) | filings `availableActions` | `{ok:true, determination, kinds:[{kind:"complaint", tier:1}]}` | unknown (not compared); a third shape of the same answer (escalation adds `words`, `counsel`) | A |

### escalation (index 134)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/action-plans/fixture.mjs:123-133 (range) | action-plans (135) | escalation `escalationsFor`, `escalationRead` | `{ok, determination, items:[{id,state,stage}]}`; `NO_SUCH_ESCALATION` | refusal codes exist; shapes unknown | A |

### action-plans (index 135)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:168-169 | queue (149) | action-plans `checkpointsDue`, `plansToLookAgain` | empties | methods exist (action-plans/index.mjs:1968, 1674) | A |

### plan-work (index 136)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:166-167 | queue (149) | plan-work `planReviewsDue`, `takeUpsFor` | empties `{ok:true, items:[], limit:500, truncated:false}` | methods exist (plan-work/index.mjs:385, 967) | A |

### monitoring (index 137)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:152-154; queue-producers/world.mjs:173-175 | queue (149) | monitoring `monitoring`, `flagged`, `archiveEligible` | `{ok:true, items:[], truncated:false}`, `{ok:true, eligible:[], limit:50, truncated:false, paused:{paused:false}}` | methods exist (monitoring/index.mjs:2942, 2972) | A |
| 2 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `configured`, `archiveDue/Wake/Tick`, `cadenceDue/Wake/Tick`, `deadlineRecheckDue/Wake/deadlineRecheck` | archiveTick default `{configured, at, checked, epoch, eligible, fired, failed, skipped}` | partly: the real archiveTick answers also carry `paused` and, when busy, `busy:true` (monitoring/index.mjs:2142-2170) | A |

### following (index 138)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:165 (read in full) | queue (149) | following `watchQuestions` | `{ok:true, questions:[], truncated:false, cursor:null}` | method exists (following/index.mjs:1288) | A |
| 2 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `followDue/Wake/Tick` | `{configured, at, epoch, read, captured, unscheduled, member_act_required, failed, paused}` | method exists (following/index.mjs:593); keys not compared | A |
| 3 | bio-plane/test/m/notice-producers/fixture.mjs:11-43 (range 1-60) | notice-producers (148) | `policyChanges`, `dutyWatchEndAt`, `watchedBy` | `{ok:true, changes:[], cursor:null}`, `null`, `{ok:true, watchers:[]}` | methods exist (chk of each name in its module); empties plausible; shapes not compared | A |

### link-sweep (index 139)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:156; queue-producers/world.mjs:176 (read in full) | queue (149) | link-sweep `sweepConditions` | `{ok:true, conditions:[]}` | method exists (link-sweep/sweep.mjs:651) | A |
| 2 | bio-plane/test/m/monitoring/fixture.mjs:292-320 (range 196-215, 300-381) | monitoring (137) | link-sweep sweep grammar / `fence` / `dueForSlate` | a stand-in that re-implements the entry check (C-18.5 findings per extra key, id uniqueness, `SWEEP_TERM_REFUSED` for a lookahead) and `fence` -> `{ok:false, reason:"SWEEP_NOT_A_MEMBER", code, detail:"fenced by the stand-in"}` | the grammar is retyped; the detail is the stand-in's own wording | A |
| 3 | bio-plane/test/m/scheduler/fixture.mjs:25-196 (file read in full) | scheduler (140) | `sweepDue/Wake/Tick` | `{ran:[]}` | unknown | A |

### scheduler (index 140)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:184 | queue (149) | scheduler `arm`, `register` | `arm: async () => null`, `register: () => ({ok:true})` | unknown | A |

### wizard-scripts (index 141)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-wizards/fixtures.mjs:1-72 (file read in full) | screens-wizards (161) | wizard-scripts `wizards`, `wizardread`, `baseupdates`, `wizarddraft`, `wizardrevise`, `wizardsubmit`, `wizardapprove`, `wizardretire` | `CIV`/`COPY`/`SUBMITTED`/`RETIRED` script rows `{id, origin, name, scope, required, based_on, versions:[{id, version, state, author, contributors, approved, created_at, broken, use}]}`; `read()` -> `{ok, script, version:{id,state,steps}}` or `refuse("NO_SUCH_WIZARD")`; the library scripts are the REAL `CIVICSMITH_LIBRARY` entries | library ids/steps real; the rows and answers are typed (wizard-scripts/index.mjs:1496 and the declared ops not compared) | A |
| 2 | bio-plane/test/m/queue/world.mjs:175-176; queue-producers/world.mjs:169-171 | queue (149) | wizard-scripts `brokenScripts`, `submittedFor`, `baseUpdates` | `{ok:true, entries:[], cursor:null, truncated:false}` | methods exist (wizard-scripts/index.mjs:835, 1641, baseUpdates) | A |

### affordances (index 143)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:183 | queue (149) | affordances `affordanceFacts` | `affordanceFacts: () => ({ok:false})` | method exists (affordances/facts.mjs:368); the refusal has no reason | A |

### action-producers (index 146)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue-producers/world.mjs:182 | queue-producers (147) | action-producers `actionItems` | `({items:[], facts:{}})` | method exists (action-producers/index.mjs); action-producers (146) is earlier than queue-producers (147) | A |

### queue-producers (index 147)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue-producers/scheduled.test.mjs:62; contradictions.test.mjs:159 (lines seen) | queue-producers (147) | publication reasons | `{code:"SCHEDULED_SOURCE_CHANGED", translation}` | NO: in no source | A |

### notice-producers (index 148)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue/world.mjs:182 | queue (149) | notice-producers `noticeItems` | `({items:[], facts:{}})` | method exists (notice-producers/index.mjs:281); the real module is composed by a test option (:73) | B |

### queue (index 149)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/queue-producers/world.mjs:8-10, 83-102, 136-141 (read in full); machinery-producers/world.mjs:1-12 and action-producers/world.mjs:1-14 (ranges) | queue-producers (147) | queue `homesOf`, `optionsOf` (queue R7, R12) | a walk up basis legs and `cites` edges through the viewer's gate, returning `{state:"determined", ungrouped, reasons, depth_bound:6, ancestors, of}`; `optionsOf` answers `[{id:"opt", on}]` and records what was asked | queue is LATER (149) than queue-producers (147), machinery-producers (145), action-producers (146): their fixtures retype the caller's side of queue's interface | A* |
| 2 | bio-plane/test/m/machinery-producers/world.mjs:1-12 and action-producers/world.mjs:1-14 (ranges); notice-producers/fixture.mjs:55-62 (range 1-60 and grep) | notice-producers (148) | queue `homesOf`, `optionsOf` | `homesOf: (s) => ({state:"determined", ungrouped:true, reasons:[], depth_bound:6, ancestors:[]})` recorded in `asked` | same: queue is later (149) than notice-producers (148) | A* |
| 3 | bio-plane/test/m/machinery-producers/world.mjs; action-producers/world.mjs (header ranges) | machinery-producers (145) | queue `homesOf`, `optionsOf` | copied from queue-producers' world (K1850) | queue later (149) | A* |
| 4 | bio-plane/test/m/action-producers/world.mjs (header range) | action-producers (146) | queue `homesOf`, `optionsOf` | copied from queue-producers' world (K624) | queue later (149) | A* |

### instance-setup (index 151)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-settings/fixtures.mjs:186, 236-266, 343-404 (file read in full): `bootstrap`, `selftest`, `runtime`, `updatenotice`, `translations`, `groupidentity`, `factstatus`, `profiles`, `hostingaccess`, `declaredstakeset` | screens-settings (162) | instance-setup ops | `bootstrap -> {ok, service, version:"0.83.0", part_signin, part_scanner, part_safe_view, installed_at, memberVersions?}` at the top level; `selftest`; `runtime` measured metrics | bootstrap flat keys yes per instance-setup/r8-parts-report.test.mjs:136-137 (`BOOTSTRAP_FACT_KEYS`, `BOOTSTRAP_VIEWER_KEYS`); the others unknown | A |
| 2 | bio-plane/test/m/newgroup/test/fixture.mjs:1-25, 530-592 (ranges; 648 lines) | installer (172) | instance-setup `instancegroup`, `instancegroupseed`, `selftest`, `bootstrap`, `bootstrapfacts` | the fake copy answers `instancegroup` `{ok, group}` flat or `{ok, result:{ok, group\|null, detail:"NO_GROUP_RECORDED"}}`, the seed refusal `{ok:false, result:{ok:false, code:"GROUP_ALREADY_RECORDED", group}}` or a configured code, `selftest {ok, bindings:{STORE:true}}`, `bootstrap {ok, version, storeVersion, memberVersions}` | NO for the absent group: the real answer is `{ok:true, group:null, recorded_at, source, recorded_by, detail: NO_GROUP_RECORDED}` where the constant is the SENTENCE (bio-plane/src/setup.mjs:895, 1147), not the code; `GROUP_ALREADY_RECORDED` is a real row (setup.mjs:269) with check and translation that the fake omits | A |

### op-declarations (index 153)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/interface-shell/harness.mjs:30-78, 86-99 (file read in full) | interface-shell (159) | op-declarations `DECLARED_OPS` (request side) and the frame's answers | REQUESTS are checked against the owners' declared `fields` (`declaredOpsOf`, R104): good; ANSWERS are `ok(result)`: any object. FRAME defaults typed: `whoami`, `queue` (3 items `{id, class}`), `groupidentity`, `infolevel`, `assistantstate`, `accountreference`, `subscriptionsignin`, `groupkeystate` | nothing checks an answer against its owner; whoami keys match control-plane/index.mjs:1333-1343 (rootOfTrust, confinedTo) | A* |
| 2 | bio-plane/test/m/screens-investigate/fixtures.mjs:41-164 (file read in full) | screens-investigate (166) | entities / people / lines / events / money / calculations / progressions / standards / explore ops (person, peopledirectory, samepersoncandidates, entity, explore, exploregraph, timeline, event, moneyset, money, calculation, spotcheck, partiesof, dutiesof, follows, proceedingdates, standard, lawrelations, standardproposals, instances, instance, progression, themeread, memberties) | `PERSON`, `DIRECTORY`, `WALK`, `GRAPH`, `TIMELINE`, `EVENT`, `FACTS`, `TRAIL`, `CALCULATION`, `SPOT`, `ENTITY`, `PARTIES`, `DUTIES`, `FOLLOWS`, `STANDARD`, `RELATIONS`, `TIES`, `MATTER`, `DEF`, `THEME` typed; `money` unknown id -> `{ok:false, reason:"NO_SUCH_FACT"}`; the comment says shapes were "surveyed on tranche/T47" | unknown (not compared op by op); `NO_SUCH_FACT` exists in source; the same file's seam test (`real-plane.mjs`, Miniflare over the deployed Worker) is the model | A |
| 3 | bio-plane/test/m/screens-publish/fixtures.mjs:24-137 (file read in full) | screens-publish (167) | review / case-inputs / case-authoring / case-check / case-tensions / case-carriage / ratification / publish-schedule / public-read / case-import / docket ops (reviewcopy, casedrafts, casecheck, casedocument, publishpreflight, publishtensions, photomarks, publish, caseratify, publishat, publishedcase, verify, importedcases, importedcase, docket, docketpublic, docketprepare, docketpost, casedetails, casedetailspublic, knock) | `COPY`, `PREFLIGHT`, `DOCUMENT`, `PUBLISHED_CASE`, `DETAILS`; `casedocument` answers `NO_CASE_DOCUMENT` until `publish` flips a closure flag; `publishedcase` answers `NOT_PUBLISHED`; `PREFLIGHT.first.code = "PHOTO_CHECK_UNWORDED"` (deliberately a code the word list lacks) | `PHOTO_CHECK_UNWORDED` exists in no source (an invented code by design); `NO_CASE_DOCUMENT` real (publication/door.test.mjs:138); `NOT_PUBLISHED` not compared; the shapes cite `casedocument`'s real answer in the fixture comment (:51-52) | A |
| 4 | bio-plane/test/m/screens-inquiry/fixtures.mjs:83-141 (file read in full) | screens-inquiry (165) | retrieval / project-roster / project-stage / hypotheses / connections / link-sweep / intent ops (list, projectstage, projectparticipants, projectquestions, projectaccountstate, projectdirectory, projectvisibility, projectownervotes, plans, partitionindependence, hypotheses, questionwaits, backlinks, themeread, captureprogressions, inquirypartition, groupidentity, projectstake, publishedlist, links, connections, reevaluationnotices, importedcases, transcriptions, memberlist) | literals per op, e.g. `projectstage -> {ok, project, stage:"investigating", questions:{read, with_legs, concluded}}`, `links -> {ok, links:[]}`; `links` in fr6-document.test.mjs:159 `{address, partition:"deferred", resolution:"offsite", verdict:null}` | unknown (not compared op by op) | A |

### answer-envelope (index 155)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/affordances/door.test.mjs:72-86 (file read in full) | affordances (143) | answer-envelope / control-plane `json`, `doAnswer`, `storeSilent`, `storeRefusal` | recorders: `json: (body, status) => ({body, status})`, `doAnswer: async (r) => r`, `storeSilent: (op, correlation) => ({silent: op, correlation})`, `storeRefusal: (out) => ({refusal: out})` | answer-envelope (155) and control-plane (169) are LATER than affordances (143) | A* |

### store-door (index 156)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/answer-envelope/envelope.test.mjs:25-35, 106-162, 164-195 (file read in full) | answer-envelope (155) | store-door `dispatch` replies (BAD_JSON, unknown op, STORE_INTERNAL_ERROR with correlation) | `reply({ok:false, reason:"BAD_JSON", detail}, 400)`, `{ok:false, error:"unknown op: nosuch"}`, `{ok:false, reason:"SOME_STORE_REASON", error}`, `{ok:false, reason:"STORE_INTERNAL_ERROR", correlation, error}` | BAD_JSON / unknown op / STORE_INTERNAL_ERROR: yes (store-door/dispatch.test.mjs:46-51, 378-381 shows the real ones); `SOME_STORE_REASON`, `WRONG_PASSWORD` are deliberate unknown-code controls (C); store-door is LATER (156) than answer-envelope (155) | A* |
| 2 | bio-plane/test/m/publication/door.test.mjs:17-31, 36-49 (file read in full) | publication (108) | store-door / control-plane helpers `doAnswer`, `storeSilent`, `storeRefusal`, `json` and the store's Durable Object `fetch` | retyped from `control-plane` R23, R25; a stub `fetch` serving the REAL `caseTensionsOps` and `publicationOps` (good) wrapped in `{ok:true, result}`; refusal `STORE_DID_NOT_ANSWER` built by the test | helpers: control-plane (169) and store-door (156) are LATER than publication (108); the real ops are used | A* |

### signin-door (index 157)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-settings/fixtures.mjs:182-184 | screens-settings (162) | signin-door / agent-worker `subscriptionsignin` | `start -> {ok, address}`, `state -> {ok, connected, member}`, other -> `{ok, connected:true, member}` | unknown (agent-worker answer in signin-door/door.test.mjs:39-46 is a third copy: `{ok, address, attempt}` / `{ok, member}`) | A |

### interface-shell (index 159)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-wizards/standin.mjs:73-153 (file read in full) | screens-wizards (161) | interface-shell `cs` kit and route | `standIn()` rebuilds `cs.call/set/go/ring/fieldOf/fill/value/kept/keep/act/field/choice`, `enter`, `start`, `control`, `pressed`, `ring`, `render`; header: tested "before the shell's half lands" | interface-shell (159) is earlier than screens-wizards (161): the shell's real kit is what `harness.mjs` boots | A |

### screens-entry (index 160)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-entry/setup.test.mjs:542, 573 (lines seen by grep; file not read) | screens-entry (160) | membership `memberadd`, instance-setup `courtnoticeset` refusals | `{ok:false, code:"MEMBER_EXISTS"}`, `{ok:false, code:"NOT_ALLOWED"}` | NO for both codes (in no module source) | A |

### screens-settings (index 162)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-settings/teamai.test.mjs:63; security.test.mjs (SOME_NEW_CODE) (lines seen by grep) | screens-settings (162) | credentials `groupkeyset` refusal | `{ok:false, reason:"KEY_REFUSED", code:"KEY_REFUSED"}`; `SOME_NEW_CODE` as an unknown-code control | KEY_REFUSED: NO (in no source); SOME_NEW_CODE: deliberate control (C) | A |

### screens-intake (index 163)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-intake/archive.test.mjs:17 (line seen by grep) | screens-intake (163) | provenance / acquisition unpack file row | `E(6, "not_filed", {name, code:"ZIP_ENCRYPTED", check:"C-1", translation})` | NO: `ZIP_ENCRYPTED` is in no source | A |

### screens-inquiry (index 165)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-intake/page.mjs:24-26 (file read in full) | screens-intake (163) | screens-inquiry `document` screen | `DOCUMENT_STUB = {id:"document", reads: () => ({}), render: () => "", acts: [], words: []}` | screens-inquiry (165) is LATER than screens-intake (163); imported by 27 of the 42 screens-intake test files (grep) | A* |

### screens-action (index 168)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/screens-action/start-send.test.mjs:24; actionnew-fix.test.mjs:21 (lines seen by grep) | screens-action (168) | actions / hypotheses refusals | `BREACH_ON_HYPOTHESIS` (with a typed translation), `LEG_ON_ACTION` finding | NO for both (in no module source) | A |

### control-plane (index 169)

| # | test file:line | user module | provider function/service | hand-built value | real provider can produce it? | class |
|---|---|---|---|---|---|---|
| 1 | bio-plane/test/m/instance-setup/fixture.mjs:148-203 (file read in full) | instance-setup (151) | control-plane `doAnswer`, `storeSilent`, `storeRefusal`, store-door frame | copied by hand: `doAnswer` (the same code as publication/door.test.mjs), `io`, `frame()` (empty body = null, non-JSON = 400 BAD_JSON, throw = 500 STORE_INTERNAL_ERROR with a uuid); the header says control-plane "comes after this module in the order" | yes by comparison with store-door/dispatch.test.mjs:39-51, 378-381; a third copy of the same helper (after publication/door.test.mjs and answer-envelope's own) | A* |
| 2 | bio-plane/test/m/public-read/g54-attempt.test.mjs:17-22 (file read in full) | public-read (111) | control-plane helpers bound into `bindPublishedPlane` | `doAnswer` reduced to `{answered:true, result}` / `{answered:false}`, `storeSilent`, `requiredArgument`, `json` retyped; the rest of the file drives the real publication, store and bucket shape (good) | control-plane/answer-envelope are LATER than public-read (111) | A* |
