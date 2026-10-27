# Declaration pass T51: record of group C

Worker: continuation of the mechanical pass (mechanics 5.10, P7), sonnet, group C. Rule as in `RECORD.md` part 1 plus BOB's K4203/K4204 rulings. Not committed. Group: escalation basis-versions wizard-scripts capture calculations membership events ratification following workbooks progressions hypotheses ai-runs case-carriage content conformance extraction publish-schedule. Of the 63 ops of the group still marked `pass` and "not reached" in `owners.tsv`, 49 are declared and 14 are judgments. `capture` and `hypotheses` had no op left (all declared in part 1). No arm changed.

## Declared (49 ops, 12 modules)
| module | requirement | ops |
|---|---|---|
| escalation | R38 | declinetoescalate, escalationopen, escalationattach, escalationevaluate, escalationadvance, escalationdecline, escalationend, escalationsuspend, escalationresume, escalationstoppursuing, escalationreopen |
| basis-versions | R57 | versionaccept, versionreject, versionconsider, versionrevert, versioncurrent, versionhide, narrow, conclude, withdrawconclusion |
| calculations | R42 | tabledeclare, calculationcreate, calculationaccept, calculationdraw |
| membership | R155 | projectinvite, projectjoin, projectleave, projectremove, projectvisibilityset |
| events | R55 | recorddatedfact, createevent, addparticipant, relate (declared under the alias names; the test drives the arms `datedfact`, `eventcreate`, `participantadd`, `eventrelate`) |
| ratification | R53 | release, retire |
| following | R36 (part 1's line, extended: it now lists followregister, watchitem, secondlook, secondlookclear) | watchitem, secondlook, secondlookclear |
| workbooks | R19 | addworkbook, bind, recordcheck (aliases of workbookadd, workbookbind, workbooksecondcheck) |
| progressions | R47 | progressiondefine, thread, discharge |
| ai-runs | R90 | airunopen, airunclose |
| content | R56 | transcribe, transcriptionattest |
| conformance | R42 | determine |

Each module has `DECLARED_OPS` beside its ops map, `declared-ops.test.mjs` (following: the part-1 file extended) and the requirement line marked `*(not yet met: T51)*`.

## Judgments (14 ops): declared nothing
| module | op | sentence that stopped it |
|---|---|---|
| wizard-scripts | wizarddraft, wizardrevise, wizardsubmit, wizardapprove, wizardretire | op-grades' own test (owners.test.mjs:118) copies the start of the hand description the five share, so repeating it in the declaration fails the words check's testcopy arm in a module the pass may not edit; and `wizard-scripts` is a drawn-screen module (`DRAWN_MODULES`), where a `localize` call fails the marker arm |
| wizard-scripts | wizards, startfrom | their hand description is the sentence "read: ..." and `wizard-scripts` is a drawn-screen module: `localize` there fails the words check's marker arm, a raw sentence fails its inline arm, and the registry has no label key for either |
| calculations | spotcheckvisit | op-grades' own test (t36.test.mjs:30) copies the start of the hand description, so repeating it fails the words check's testcopy arm |
| case-carriage | obscuremark | op-grades' own tests (t37.test.mjs:23, t38.test.mjs:15) copy the start of the hand description (testcopy arm) |
| case-carriage | obscuremarkwithdraw | op-grades' own test (t38.test.mjs:13) copies the start of the hand description (testcopy arm) |
| extraction | pagetranscribe | op-grades' own test (t42.test.mjs:13) copies the start of the hand description (testcopy arm) |
| publish-schedule | publishatcancel | op-grades' own test (owners.test.mjs:230) copies the start of the hand description (testcopy arm) |
| ratification | caseratify | a missing caseId, edition or docSha is refused MALFORMED and a missing sigArmored, attestorKey or gateVersion CASE_UNSIGNED, which name no field, so the required fields cannot be stated as the refusal names them (the fields are the signed ceremony's) |
| ratification | publish | a missing bundleId, bundleSha, attestorKey, gateVersion, sigArmored or shas is refused MALFORMED, which names no field (the fields are the signed ceremony's) |

The four modules whose only op was a judgment (wizard-scripts, case-carriage, extraction, publish-schedule) are as at HEAD: their source, requirement file and tests are untouched, and I removed the declaration, test and requirement line I had written before the words check showed the testcopy and marker failures. For calculations I removed spotcheckvisit from `DECLARED_OPS`, from its test file and from the R42 line.

## UNCERTAIN
- UNCERTAIN: `workbooks` ops take `by` from the body (the control plane stamps it there); read as a stamp, not an accept. `thread`/`progressiondefine`/`discharge` `threadedBy`/`declaredBy` likewise.
- UNCERTAIN: the six version acts (basis-versions) share one argument reader (`versionArgs`) that reads target, version, reason, project, hidden, preview, affirmed for every act, so each declares all seven as accepts. Requires: target and version for all; reason also for `versionreject` and `versionconsider` (`VERSION_REASON_REQUIRED` is considering and rejected); project also for `versioncurrent`. `affirmed` (required of an accept of a reading with several parts) is conditional and left out.
- UNCERTAIN: `conclude` requires target and two alternative groups, [falsifier, no_falsifier] and [conclusion, project, reading]. The arm refuses both of a pair, and `conclusion` with `project`, so "any one satisfies" is only half the rule; `version` (required when no project) is conditional and left out. It reads `no_falsifier`, `bias_applied` and most other fields from the query, `affirmed` and `bias_applied` also from the body.
- UNCERTAIN: `escalationattach` has no hand description and no act-help key: its description is the registry label key `act.escalationattach.label.matter`.
- UNCERTAIN: `airunopen` accepts also `at`, `state`, `leaseMs` and `principalClaudeRef` because the arm reads them (`at` is a clock the tests pass). `principalClaude` is a body field the arm requires (AI_RUN_CAPABILITY_UNAVAILABLE); `principalPlane`, `actor` and `viewer` are stamps. `airunclose` requires `run` and `bound`; a missing run is answered `{found: false}` with no code, so its test counts `found: false` as naming `run`.
- UNCERTAIN: `determine` accepts project, act, findings, standards, rows, questions, supersedes, reason, proposal, cause; requires project, act, findings, standards, rows (questions are conditional on an `unclear` outcome, supersedes/reason on a revision). Significance and recommendation keys are refused by the arm and are not accepts. `reason` is the arm's own.
- UNCERTAIN: `calculationaccept` takes its calculation as `id` (query) or `calcId` (body): a list of alternatives. `calculationcreate` requires question, period, inputs, kind; `recipe` is conditional on the kind.
- UNCERTAIN: `escalation*` arms read the `reason` themselves (ESCALATION_NO_REASON), so `reason` is an accept and, where the arm refuses without it, a require. `escalationend` takes only `id`. `escalationattach`'s `purpose` and `standards` (stage 7) and `escalationevaluate`'s `response` (reading other than none) are conditional: accepts only.
- UNCERTAIN: `projectjoin` and `projectleave`'s missing `projectId` is answered NOT_INVITED and NOT_A_PARTICIPANT, which name no field but cannot be anything else for those arms; I counted the code as naming it. `release`/`retire` miss `handle` as NO_SUCH_SELECTION (the resolve's one answer), counted likewise.
- UNCERTAIN: `progressions` `progressiondefine` requires `basis` only for a first declaration (conditional, left out). `discharge` requires [stageKey|stage] and [captureSha|capture_sha] as alternatives.
- UNCERTAIN: `pagetranscribe` (judged) reads sha256 and project from the url and the door's stamps `cls`, `session`, `caps`, `viewer`, `author`, `trace`, `memberRef`, `store`.

## Uses needed (test-support is not in `uses` of): 
ai-runs, basis-versions, calculations, conformance, content, escalation, events, progressions, ratification, workbooks. (membership and following already use it.) `build/modules.json` is untouched.

## Words
No new key is missing from the table (missingkey 0). New `localize` ids for BOB's regeneration of `rows.mjs` (the words-unreviewed list): escalation.declared.{declinetoescalate, escalationevaluate, escalationadvance, escalationdecline, escalationend, escalationsuspend, escalationresume}; basis-versions.declared.narrow; calculations.declared.{tabledeclare, calculationcreate, calculationaccept, calculationdraw}; membership.declared.{projectinvite, projectjoin, projectleave, projectremove}; events.declared.{recorddatedfact, createevent, addparticipant, relate}; following.declared.{watchitem, secondlook, secondlookclear}; workbooks.declared.{addworkbook, bind, recordcheck}; progressions.declared.{progressiondefine, thread, discharge}; ai-runs.declared.{airunopen, airunclose}; content.declared.{transcribe, transcriptionattest}; conformance.declared.determine. The other declared ops (escalationopen, escalationattach, escalationstoppursuing, escalationreopen, the version acts, conclude, withdrawconclusion, projectvisibilityset, release, retire) use registry keys, no new id. Until the rows are regenerated, setup-words R10, R16, R17 are red (as in part 1).

## Checks (temporary index holding only group C's changed and new files)
format 0; architecture: only the 10 missing `uses` edges to test-support above; coverage: none of group C's modules (the 27 failures are other modules'); channels 0; words: testcopy 0 and marker 0 for group C (the 6 testcopy failures left are other groups' ops: owners.test.mjs:79, t36:113, t37:20, t37:29, t37:30, t47:74). Output: `/tmp/claude-0/s/checks-C2.txt`.

## Tests, before / after (`node --test --test-force-exit` over each module's test files)
| module | before | after |
|---|---|---|
| escalation | 89 pass | 100 pass (11 new) |
| basis-versions | 169 pass | 178 pass (9 new) |
| calculations | 57 pass | 61 pass (4 new) |
| membership | 172 pass | 177 pass (5 new) |
| events | 86 pass | 90 pass (4 new) |
| ratification | 246 pass | 248 pass (2 new) |
| following | 74 tests, 71 pass: body, checks and meetings failed as files under load (60-75 s, 16 modules in parallel); body.test.mjs alone passes 5/5 | 116 pass (3 new; the whole module green) |
| workbooks | 21 tests, add and export failed as files under the same load; add.test.mjs alone passes 4/4 | 29 pass (3 new) |
| progressions | 79 pass | 82 pass (3 new) |
| ai-runs | 132 pass | 134 pass (2 new) |
| content | 132 pass | 132 + 2 = 134 pass |
| conformance | 119 pass | 120 pass (1 new) |
| wizard-scripts, case-carriage, publish-schedule | 107, 88, 26 pass | untouched |
| extraction | 190 of 191 pass: R77 (a capture whose register row holds its size answers `bytes` equal to the stored size) was red before I started | untouched, same red |

## Remaining
Nothing of group C remains unreached. The 14 judgments above go to BOB (a wave-2 job for each module, or a ruling on the testcopy/marker cases: the op-grades tests that copy the hand sentences, and wizard-scripts as a drawn-screen module).
