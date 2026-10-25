# K4995 audit, part 5: test files of layer 5 and above (without plane and control-plane)

> **Split K5021.** This file is part 1; the rest of it was moved whole, unchanged, to: the tables by provider module, member-roster to agent-worker (index 35 to 100): `audit-fixtures-part5-L5plus-tables-a.md`; the tables by provider module, intent to control-plane (index 101 to 169): `audit-fixtures-part5-L5plus-tables-b.md`. A reference "audit-fixtures-part5-L5plus.md §n" finds §n in the part named here.

Branch tranche/T51, read only. Paths are from the repository root. Provider indexes are positions in build/modules.json (lower = earlier). Row format, classes (A, B, C, A*) and method are those of part 1 (`build/plan/audit-fixtures-K4990.md`); a row is a seam (one hand-built provider answer), not a file.

## Header: what was covered and what was not

**Scope.** 2,008 test files, 519,485 lines, in 118 modules (every module of layer 5 and above in modules.json except plane and control-plane; includes agent-worker, newgroup/installer, stewards, site, journey-check). This is far more than one reader can read whole. I chose the files that define the seams (fixtures, worlds, stand-in files, doors) and a few test files that use them, and I say below exactly what I read. **I claim nothing for any file not listed.**

**Read in full (every line), 28 files, 6,982 lines (1.3 % of the scope):**
screens-inquiry: fixtures.mjs, assistant.test.mjs, fr5-document.test.mjs, fr6-document.test.mjs. screens-settings: fixtures.mjs. screens-investigate: fixtures.mjs, real-plane.mjs. screens-publish: fixtures.mjs. screens-wizards: fixtures.mjs, standin.mjs. screens-action: declared.mjs. screens-intake: page.mjs. interface-shell: harness.mjs. scheduler: fixture.mjs. queue: world.mjs. queue-producers: world.mjs, reads.test.mjs. publication: door.test.mjs. store-door: dispatch.test.mjs. affordances: door.test.mjs. answer-envelope: envelope.test.mjs. instance-setup: fixture.mjs, r8-parts-report.test.mjs, r9-parts-kept-outside-isolate.test.mjs. signin-door: door.test.mjs. public-read: g54-attempt.test.mjs. case-import: accept.test.mjs. case-disclosures: fixture.mjs.

**Read by line range (the row names the range):** screens-action/real.mjs 1-30 of 87; screens-intake/t51-fix5.test.mjs 20-60 of 236; ratification/fixture.mjs 1-60 of 433 (+ grep); notice-producers/fixture.mjs 1-60; escalation/fixture.mjs 90-215 of 422; action-plans/fixture.mjs 85-182 of 322; monitoring/fixture.mjs 196-215 and 300-381 of 381; newgroup/test/fixture.mjs 1-25 and 530-592 of 648; agent-steps/test/plane-suggest.mjs 1-40 of 319, plane-meaning.mjs 1-22 of 77, plane-versions.mjs 1-22 of 32, plane-capturerequest.mjs 1-22 of 106; journey-check/live.test.mjs 1-15; machinery-producers/world.mjs 1-12; action-producers/world.mjs 1-14; and windows of 10-17 lines around single hand-built refusals in monitoring/understanding.test.mjs 506-516, monitoring/tick.test.mjs 564-576, ratification/retire.test.mjs 268-284, hypotheses/t41.test.mjs 240-252, queue-producers/contradictions.test.mjs 150-162, intent/discovery.test.mjs 214-226, store-door/pull.test.mjs 104-116, reevaluation/sweep.test.mjs 176-188.

**Checked against the provider's code (file:line in the rows):** extraction (reading, completeness, readHeld), capture (heldcaptures, supporting), actions (actionRead), promotion (CAS_STALE, registration refusal), member-roster (adminMath), ai-runs (withheld codes, reap), monitoring (archiveTick), case-import (watchItems), progressions (NO_KEY), instance-setup (instancegroup), citation (repairs), the method names of 45 stand-in providers (all exist), and text-chain's closed extent kinds.

**Two scans over the whole scope (mechanical, not reading; they find candidates and are NOT a coverage claim):**
1. Every `reason|why|code|failure|error: "UPPER_CASE"` literal in the 2,008 files (452 distinct codes) was looked up as an upper-case token in the source of every module in modules.json. **74 codes occur in no module source.** The list is at the end. About half are visibly deliberate unknown-code controls by their names; the others are rows above where I read the line. A code built at run time from parts would be reported missing in error.
2. Every `extent: {kind: "..."}` literal in the screens, retrieval, queue, case-*, inquiry and related tests, against text-chain's closed kinds (textchain.mjs:1547-1556; content/extent.mjs:51). Kinds that exist nowhere: `line`, `paragraph`, `page`, `heading` (rows in extraction below). `nonsense` and `nope` are deliberate controls.

**Not covered:** the other 1,980 files. Where the same pattern is likely is in the census at the end. Class C rows (faults, platform, unknown-code controls) were not enumerated: this audit looked for seams.

## Findings for BOB (not row-level)

1. **Order blocks the rule in only 12 of 170 rows (the A* rows); the rest can be fixed by a provider fixture imported by a later module.** The A* rows are: queue's `homesOf`/`optionsOf` retyped in queue-producers, machinery-producers, action-producers and notice-producers (queue 149 is later than all four); the control-plane / store-door / answer-envelope reply helpers (`doAnswer`, `storeSilent`, `storeRefusal`, `json`) retyped in publication, answer-envelope, affordances, instance-setup and public-read; review's provider registered by hand in publication (review 122, publication 108); screens-intake's `DOCUMENT_STUB` of screens-inquiry (165 vs 163); and interface-shell's frame answers (`whoami` is control-plane's). The `doAnswer` helper exists in at least three hand-typed copies (instance-setup/fixture.mjs:152-162, publication/door.test.mjs:17-27, public-read/g54-attempt.test.mjs:18-19) beside the real one; part 1 reached the same conclusion for the registrar.
2. **The screens are the largest block and every screen module is later than every provider it reads.** 242 test files in 9 screens modules answer from a scripted plane; 12 of them (screens-action 2, screens-intake 2, screens-inquiry 4, screens-investigate 1, screens-publish 1, screens-daily 2) boot the real plane or the real owners (listed under "good models"). interface-shell's harness checks every REQUEST against the owner's declared fields (`declaredOpsOf`, R104, harness.mjs:30-78: the right shape of check), but an ANSWER is `ok(result)`: any object. Nothing compares an answer with its owner. Because no order problem stands in the way, the natural fix is the one part 1 proposed per provider (a published answer fixture made by the owner's real code) with the harness's `ok` replaced by a lookup of the owner's fixture, and `test-support`'s collector (`declared-ops.mjs`) as its home. That is BOB's call; my recommendation is to start with the ops the screens read from extraction, capture, strength, ai-runs and instance-setup, where the rows below show real drift.
3. **The same op is typed differently in sibling fixtures**, which no provider fixture can allow: `heldcaptures` (`rows` in screens-inquiry/fixtures.mjs:121, `held` in three siblings; the real key is `held`, capture/index.mjs:2108), `reading` (`capture_sha` vs `sha256`), `watchItems` (with and without `ok`: queue/world.mjs:173 vs queue-producers/world.mjs:168), `availableActions` (three shapes in escalation, action-plans and affordances), `strengthbarof` (two shapes), `actionRead` (see 4).
4. **Hand-built refusals the owner never raises (this audit's strongest rows):** promotion's stale-base refusal is `CAS_STALE` (promotion/index.mjs:750) but monitoring (two files), ratification and store-door hand it `BASE_MISMATCH`, `BASE_MOVED`, `STALE_BASE`, `PROMOTE_REFUSED_HERE`; `actionRead` refuses with `NO_SUCH_ACTION` (actions/index.mjs:2893, action-records/index.mjs:104) but escalation's and action-plans' stand-ins answer `NO_SUCH_BUNDLE` and `NOT_AN_ACTION`; `PRIMARY_TOO_LARGE` is fed to the document screen as a not-walked reason that acquisition never emits (it emits `TOO_LARGE_TO_PARSE`); instance-setup's absent-group answer is the code string where the real one is the sentence. In each of them the screen or module under test accepts both spellings, so the tests pass.
5. **Good models already in the tree (use as the pattern):** screens-investigate/real-plane.mjs (the deployed Worker under Miniflare, nothing scripted); screens-action/real.mjs (the real `filings` world answering each op through its owner's map); screens-intake/t51-fix5.test.mjs (real `captureOps().heldat()` beside a scripted twin); store-door/dispatch.test.mjs (a fake membership and a real-record arm in one file, so the fake's drift is visible: it omits `check: "C-70.1"`); publication/door.test.mjs (a stub Durable Object that serves the REAL `caseTensionsOps` and `publicationOps`); public-read/g54-attempt.test.mjs (real publication, store and bucket shape; the failures are the bucket's and the store's own); case-disclosures/fixture.mjs (real modules throughout; `realImports` and `realCarriage` options compose the real `case-import` and `case-carriage` instead of the stand-ins in the same file, so each stand-in can be checked against its twin); instance-setup/fixture.mjs:104-110 (`aiKeptAway` built from the real `AI_ACCOUNT_CHECKS` row); agent-steps/test/plane-*.mjs (mocks derived from the owners' constants and functions; their headers record that the earlier mocks answered yes to anything and hid a wrong field name for a whole tranche).

## Summary

### Published fixtures each provider would need (additions to part 1's list)

- **membership**: `existenceFixture(project, viewer)` (the C-70.1 answer, with `check`), `membershipWithAdmins(ids)` (part 1).
- **member-roster**: use `Members.adminMath` directly; `rosterRows()` for `memberlist`.
- **credentials / ai-accounts**: `keptAwayRefusal({reason,set_by,set_at})` and `disclosureDueRefusal()` made from the real rows; account-state answers (`accountreference`, `accountuses`, `ailimits`, `aiusage`, `aiuseovertime`, `accounthistory`); signer rows.
- **promotion**: `stepRegistry()` (part 1) with the real `STEP_DECLARED` refusal; `refusedPromote(reason)` that accepts only reasons promotion raises (`CAS_STALE` and the rest), so no test can invent `BASE_MOVED`.
- **provenance / capture / acquisition**: `homeOfRow(...)` and `provenanceDocument(bytes)` (part 1); `heldCapturesAnswer(rows)` (key `held`), `heldAtAnswer`, `emptyCaptureProvider()` (the nine empty methods queue, queue-producers and notice-producers each retype); `supportingFacts({...})` made by `supportingOf`.
- **extraction**: `readingAnswer({units, completeness, more, next, repairable})` made by the real reader, with extent kinds limited to the closed list (part 1's `readHeldAnswers` goes with it).
- **strength / basis-versions / citation / reevaluation**: `strengthAnswer`, `basisVersionsAnswer`, `citeRefusalWithRepairs`, `versionNotice`, and the empty pages queue and queue-producers retype.
- **ai-runs / run-rules / run-productions**: `openAnswer`, `dispatchAnswer({withheld})`, `runGate(runs)`, `aiRunsWorld()` (the in-memory ai-runs three fixtures rebuild); export run-rules' allowance rule as a function.
- **conformance / consequences / actions / filings / escalation / standards**: `determinationLedger()`, `actionReadFor(id)` (with `NO_SUCH_ACTION`), `availableActionsAnswer()`, `escalationsFor()`: the stand-ins escalation and action-plans rebuild with their own sight rules.
- **case-import / case-checker / case-carriage / bias / retrieval**: `importsWorld()` and `photoMarksWorld()` (already available as real twins in case-disclosures/fixture.mjs), `lensManifest()`, `selectionResolveRefusal()` (with its translation).
- **instance-setup**: `bootstrapAnswer`, `instanceGroupAnswer` (absent and recorded), `groupAlreadyRecordedRefusal`, `selftestAnswer`, `memberVersions`.
- **queue (A\*)**: `homesOfFor(viewer)` and `optionsOf` recorder, published by queue for its four earlier users; needs a ruling (contract fixture run by queue's tests, as part 1 proposed for the registrar).
- **control-plane / store-door / answer-envelope (A\*)**: one `doorHelpers` contract (`doAnswer`, `storeSilent`, `storeRefusal`, `json`, `frame`) that the three later modules run against their real code; the five hand-typed copies then import it.
- **interface-shell**: its `cs` kit as a fixture (screens-wizards/standin.mjs rebuilds it) and the frame defaults.
- **scheduler's providers**: one `{due, wake, tick}` facet per owner (22 owners), made by running each owner's real methods on an empty world.
- **screens' op owners (screens-investigate and screens-publish)**: op-by-op answer fixtures per owner (entities, people, lines, events, money, calculations, progressions, standards, explore; review, case-inputs, case-authoring, ratification, public-read, docket).

### Rows by user module (A, A*, B, C)

| user module | A | A* | B | C | total |
|---|---|---|---|---|---|
| hypotheses (80) | 1 | 0 | 0 | 0 | 1 |
| basis-versions (84) | 1 | 0 | 0 | 0 | 1 |
| agent-steps (99) | 1 | 0 | 0 | 0 | 1 |
| intent (101) | 1 | 0 | 0 | 0 | 1 |
| reevaluation (103) | 2 | 0 | 0 | 0 | 2 |
| publication (108) | 0 | 2 | 0 | 0 | 2 |
| public-read (111) | 0 | 1 | 0 | 0 | 1 |
| ratification (115) | 3 | 0 | 0 | 0 | 3 |
| case-disclosures (118) | 5 | 0 | 2 | 0 | 7 |
| case-authoring (121) | 1 | 0 | 0 | 0 | 1 |
| escalation (134) | 4 | 0 | 0 | 0 | 4 |
| action-plans (135) | 7 | 0 | 0 | 0 | 7 |
| monitoring (137) | 5 | 0 | 0 | 0 | 5 |
| scheduler (140) | 24 | 0 | 0 | 0 | 24 |
| affordances (143) | 1 | 1 | 0 | 0 | 2 |
| machinery-producers (145) | 0 | 1 | 0 | 0 | 1 |
| action-producers (146) | 0 | 1 | 0 | 0 | 1 |
| queue-producers (147) | 8 | 1 | 0 | 0 | 9 |
| notice-producers (148) | 18 | 1 | 1 | 0 | 20 |
| queue (149) | 25 | 0 | 2 | 0 | 27 |
| instance-setup (151) | 2 | 1 | 4 | 0 | 7 |
| answer-envelope (155) | 0 | 1 | 0 | 0 | 1 |
| store-door (156) | 2 | 0 | 0 | 1 | 3 |
| signin-door (157) | 2 | 0 | 0 | 0 | 2 |
| interface-shell (159) | 0 | 1 | 0 | 0 | 1 |
| screens-entry (160) | 1 | 0 | 0 | 0 | 1 |
| screens-wizards (161) | 2 | 0 | 0 | 0 | 2 |
| screens-settings (162) | 9 | 0 | 1 | 0 | 10 |
| screens-intake (163) | 4 | 1 | 0 | 0 | 5 |
| screens-inquiry (165) | 12 | 0 | 1 | 0 | 13 |
| screens-investigate (166) | 2 | 0 | 0 | 0 | 2 |
| screens-publish (167) | 1 | 0 | 0 | 0 | 1 |
| screens-action (168) | 1 | 0 | 0 | 0 | 1 |
| installer (172) | 1 | 0 | 0 | 0 | 1 |
| **all** | 146 | 12 | 11 | 1 | 170 |

Of the 170 rows: 146 A (a provider fixture made by its real code, re-pointed with judgment), 12 A* (provider later than user), 11 B (a real provider function or fixture exists now), 1 C. A, B and A* rows are all rows the rule forbids as written. The counts are of rows (seams) in the files named; the real total is much higher (see the census).

### Hand-built refusal codes found in no module source (mechanical scan, 74 codes)

Rows above cover those I could read. By name, the rest are mostly deliberate unknown-code controls (`SOMETHING_ELSE`, `SOME_REFUSAL`, `NO_SUCH_DOOR_CODE`, `ZZ_REASON`, `NOPE`, `TEST_REFUSED`, and similar) and need no fixture, but a reader should confirm each before calling it a control.

| code | uses | module(s) | file(s) (up to 3) |
|---|---|---|---|
| ACCOUNT_MALFORMED | 2 | case-disclosures | case-disclosures/account.test.mjs, case-disclosures/seam.test.mjs |
| AI_LOG_REFUSED | 1 | agent-steps | agent-steps/test/interface.test.mjs |
| BASE_MISMATCH | 2 | monitoring | monitoring/docket.test.mjs, monitoring/tick.test.mjs |
| BASE_MOVED | 3 | monitoring | monitoring/understanding.test.mjs |
| BREACH_ON_HYPOTHESIS | 2 | screens-action | screens-action/start-send.test.mjs |
| CALLER_REFUSED | 5 | ai-runs, publication | ai-runs/producers.test.mjs, ai-runs/transact.test.mjs, ai-runs/usage.test.mjs |
| CALLER_ROLLED_BACK | 1 | inquiry | inquiry/raise.test.mjs |
| CODE_NO_ONE_HAS_A_WORD_FOR | 1 | screens-action | screens-action/plan.test.mjs |
| DOCUMENT_COPY_UNWORDED | 1 | screens-publish | screens-publish/ceremony.test.mjs |
| FORMAT_NOT_COVERABLE | 2 | case-authoring | case-authoring/photos.test.mjs |
| HELD_ELSEWHERE | 1 | intent | intent/discovery.test.mjs |
| HTTP_404 | 2 | intent | intent/pursuits.test.mjs |
| INNER_REFUSED | 1 | reevaluation | reevaluation/raise.test.mjs |
| KEY_REFUSED | 2 | screens-settings | screens-settings/teamai.test.mjs |
| LATE_REFUSAL | 1 | ai-runs | ai-runs/surfacing.test.mjs |
| LEG_ON_ACTION | 1 | screens-action | screens-action/actionnew-fix.test.mjs |
| LIMIT_OUT_OF_RANGE | 2 | public-read | public-read/public-reads.test.mjs |
| MACHINE_CANNOT_ALPHA | 1 | skills | skills/pack.test.mjs |
| MACHINE_CANNOT_MID | 1 | skills | skills/pack.test.mjs |
| MACHINE_CANNOT_MOVED | 1 | skills | skills/pack.test.mjs |
| MACHINE_CANNOT_ZED | 1 | skills | skills/pack.test.mjs |
| MACHINE_PASSAGE_NOT_TAKEN_UP | 1 | basis-versions | basis-versions/own-reading.test.mjs |
| MEMBER_EXISTS | 1 | screens-entry | screens-entry/setup.test.mjs |
| NOPE | 2 | interface-shell | interface-shell/p9.test.mjs |
| NOT_ALLOWED | 1 | screens-entry | screens-entry/setup.test.mjs |
| NOT_FOR_YOU | 2 | agent-steps | agent-steps/test/interface.test.mjs |
| NOT_IN_THESE_TESTS | 1 | question-explorer | question-explorer/fixture.mjs |
| NO_CASE_EDITION | 1 | reevaluation | reevaluation/caseparts.test.mjs |
| NO_PROFILES | 1 | answers | answers/words.test.mjs |
| NO_ROW_FOR_THIS_CODE | 2 | answer-envelope | answer-envelope/envelope.test.mjs |
| NO_SUCH_DOOR_CODE | 4 | screens-inquiry | screens-inquiry/assistant.test.mjs |
| NO_SUCH_ENTRY | 1 | plan-work | plan-work/fixture.mjs |
| NO_SUCH_IMPORT | 2 | case-authoring, case-disclosures | case-authoring/rests.test.mjs, case-disclosures/imported.test.mjs |
| NO_SUCH_KEY_HELD | 1 | screens-inquiry | screens-inquiry/fr2-question.test.mjs |
| NO_SUCH_READING | 1 | journey-check | journey-check/walker.test.mjs |
| NO_WORDS_FOR_THIS_CODE | 1 | screens-publish | screens-publish/review.test.mjs |
| NO_WORD_NO_TRANSLATION | 1 | screens-intake | screens-intake/capture.test.mjs |
| ONLY_A_REASON | 1 | run-productions | run-productions/suggest.test.mjs |
| OUTER_REFUSES | 1 | money | money/g55-view.test.mjs |
| OVERLOADED | 1 | connections | connections/converts-links.test.mjs |
| PDF_ENCRYPTED | 2 | case-authoring | case-authoring/copy-now.test.mjs, case-authoring/documents.test.mjs |
| PERSON_NO_PUBLIC_ROLE | 2 | hypotheses | hypotheses/t41.test.mjs |
| PHOTO_CHECK_UNWORDED | 2 | screens-publish | screens-publish/fixtures.mjs |
| PLAN_NOT_AFTER_RESPONSE | 1 | ai-runs | ai-runs/reexam.test.mjs |
| PROBE_REFUSED | 3 | store-door | store-door/promotion-step.test.mjs |
| PROFILES_DISAGREE | 4 | ratification | ratification/r7-publish-at.test.mjs |
| PROJECT_NOT_PARTICIPANT | 1 | queue-producers | queue-producers/contradictions.test.mjs |
| PROMOTE_REFUSED_HERE | 2 | store-door | store-door/pull.test.mjs |
| PROVIDER_DOWN | 1 | ai-runs | ai-runs/r085.test.mjs |
| REGISTRATION_CLOSED | 1 | scheduler | scheduler/g55-ingest.test.mjs |
| ROLLED_BACK | 1 | reevaluation | reevaluation/raise.test.mjs |
| SCHEDULED_SOURCE_CHANGED | 2 | queue-producers | queue-producers/scheduled.test.mjs |
| SOMEONE_ELSES | 3 | action-plans, case-import | action-plans/words.test.mjs, case-import/flags.test.mjs |
| SOMETHING_ELSE | 6 | public-read, reevaluation, screens-inquiry, screens-intake | public-read/g54-attempt.test.mjs, reevaluation/raise.test.mjs, screens-inquiry/b22-question.test.mjs |
| SOMETHING_NEW | 4 | affordances, screens-intake | affordances/catalogue.test.mjs, affordances/t33.test.mjs, screens-intake/r67-supporting-reasons.test.mjs |
| SOME_NEW_CODE | 2 | screens-settings | screens-settings/security.test.mjs |
| SOME_REFUSAL | 2 | queue-producers | queue-producers/reads.test.mjs |
| SOME_STEP_REFUSED | 2 | citation | citation/draw.test.mjs |
| SOME_STORE_REASON | 1 | answer-envelope | answer-envelope/envelope.test.mjs |
| STALE_BASE | 4 | ratification | ratification/release.test.mjs, ratification/retire.test.mjs |
| STANDARD_DEPARTED | 1 | screens-publish | screens-publish/t50.test.mjs |
| STEP_GONE | 1 | queue | queue/watched.test.mjs |
| STORE_BUSY | 2 | public-read | public-read/docket.test.mjs |
| STORE_REFUSED | 3 | affordances | affordances/door.test.mjs |
| SUGGEST_REFUSED_FOR_TEST | 2 | agent-steps | agent-steps/test/r107.test.mjs |
| TEST_REFUSED | 4 | contradiction | contradiction/acts.test.mjs |
| THE_OUTER_ACT_REFUSED | 1 | answers | answers/endset.test.mjs |
| UNEXPECTED | 1 | public-read | public-read/relay.test.mjs |
| VERIFY_NOT_RUN | 1 | screens-publish | screens-publish/public.test.mjs |
| VERSION_REFUSED_HERE | 1 | reevaluation | reevaluation/sweep.test.mjs |
| WRONG_PASSWORD | 1 | answer-envelope | answer-envelope/envelope.test.mjs |
| ZIP_ENCRYPTED | 1 | screens-intake | screens-intake/archive.test.mjs |
| ZZ_REASON | 1 | interface-shell | interface-shell/t50.test.mjs |
| ZZ_STOP | 1 | interface-shell | interface-shell/t50.test.mjs |

### Census of what was not read (grep counts, NOT findings)

Files per module that name a stand-in word (stub, fake, mock, double, canned, stand-in, scripted) or one of registerJob, readHeld, armJobs, keepLater, owedLater, largest first (module (index): files, lines, files naming a stand-in word, `ok:` literals, reason/why/code literals). The words also match the platform ("double", "fake clock"), so the numbers over-count: screens-inquiry (165): 57, 16,287, 54, 768, 212; public-read (111): 60, 11,116, 46, 165, 130; screens-intake (163): 43, 6,553, 15, 527, 155; agent-worker (100): 36, 13,511, 25, 234, 132; screens-investigate (166): 25, 9,433, 20, 249, 110; queue (149): 36, 6,145, 28, 86, 117; ratification (115): 34, 8,517, 25, 126, 84; screens-settings (162): 27, 5,670, 11, 336, 103; queue-producers (147): 26, 4,414, 19, 194, 66; screens-daily (164): 34, 11,132, 9, 341, 69; instance-setup (151): 29, 5,827, 20, 133, 60; installer (172): 27, 9,828, 18, 89, 24; interface-shell (159): 41, 7,977, 17, 90, 28; screens-entry (160): 8, 2,123, 5, 278, 36; notice-producers (148): 17, 3,342, 10, 148, 29; agent-runner (98): 19, 2,482, 17, 21, 0; publication (108): 33, 5,924, 14, 65, 67; agent-steps (99): 17, 3,067, 12, 97, 45; scheduler (140): 21, 3,987, 11, 109, 12; case-authoring (121): 42, 7,748, 11, 90, 94; journey-check (175): 26, 2,522, 12, 64, 19; screens-publish (167): 28, 5,110, 11, 79, 141; affordances (143): 30, 7,549, 12, 56, 169; monitoring (137): 19, 5,397, 8, 117, 81; case-disclosures (118): 15, 4,085, 9, 87, 74; screens-wizards (161): 13, 1,981, 7, 114, 85; screens-action (168): 33, 5,189, 7, 108, 228; reevaluation (103): 23, 4,947, 10, 37, 50; action-producers (146): 9, 1,802, 7, 80, 23; inquiry (79): 34, 5,647, 7, 35, 110; installer-steps (171): 10, 2,691, 7, 28, 18; following (138): 14, 3,192, 4, 67, 29; answer-envelope (155): 7, 2,568, 2, 100, 55.

Likeliest places for more rows, in my judgment: the 41 other files of screens-inquiry (the scripted-plane tests: 54 of 57 files), the 30 other screens-intake files (including r67-supporting-reasons.test.mjs and r8-supporting.test.mjs, which type the supporting-files reasons), screens-daily (34 files, no fixture read), screens-entry/setup.test.mjs (746 lines, 102 `ok:` literals, invented codes MEMBER_EXISTS and NOT_ALLOWED), screens-action (30 files; `reads-t51`, `plan`, `matter-t51`, `request` type the ops of the Action layer), the agent-worker and agent-runner suites (platform/model fakes: likely class C, not read), public-read (60 files; only g54-attempt read), ratification (34 files; fixture read only to line 60), and the plane-mock sources agent-steps inject as text.

### Lines seen by grep only (no row, no claim beyond the line)

store-door/promotion-step.test.mjs:131 (`PROBE_REFUSED`, a provenance listener refusal; class C, one row above), plan-work/fixture.mjs:34 (`NO_SUCH_ENTRY` for a docket pressure read), ratification/r7-publish-at.test.mjs:45 (one row above), screens-publish/t50.test.mjs:117 (`STANDARD_DEPARTED`), screens-publish/review.test.mjs and ceremony.test.mjs (`NO_WORDS_FOR_THIS_CODE`, `DOCUMENT_COPY_UNWORDED`: unworded-code controls), screens-settings/security.test.mjs (`SOME_NEW_CODE`), ai-runs/reexam.test.mjs:111 (`PLAN_NOT_AFTER_RESPONSE`, `C-0.0`), ai-runs/r085.test.mjs:99 (`PROVIDER_DOWN`), public-read/docket.test.mjs:221 (`STORE_BUSY`), public-read/public-reads.test.mjs:192 (`LIMIT_OUT_OF_RANGE`), queue/watched.test.mjs:38 (`STEP_GONE` with check C-131.1), intent/pursuits.test.mjs (`HTTP_404`), answers/words.test.mjs:40 (`NO_PROFILES`), journey-check/walker.test.mjs:156 (`NO_SUCH_READING`).
