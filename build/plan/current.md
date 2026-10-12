# Plan T46

**Status** · OPEN · BOB #161 · session_015Mryfo5hN6kMnVMxYBTy4W · depth 1

**Jobs** · record-grammar: RECORD-GRAMMAR #15 session_01WTxZEji9hScnnv3kyz3xtf; bundler: BUNDLER #16 session_01SHEYtEvhTCnEvXN1xWJ1iY; record-core: RECORD-CORE #21 session_01U4VpUHnYKCeaZcQvK8i5XD; membership: MEMBERSHIP #35 session_01NYNAzwK9hYtCvE5CTuZxYA; project-roster: PROJECT-ROSTER #4 session_01QUJPgnjkqLzkfXN1KCUCmG; promotion: PROMOTION #44 session_01QFUJsskb7hnNteGSP3z9cY; file-safety: FILE-SAFETY #6 session_01L9fT5LDwkBexXHHGqAyzH5; extraction: EXTRACTION #22 session_01B8KpQmSKqdPEdHZZgPUk65; local-facts: LOCAL-FACTS #6 session_0132BkHEZ5G69QAFjomHQvCD; standards: STANDARDS #13 session_019UztuJhDzVGDoL16zsLyc7; duties: DUTIES #5 session_0139ZFtgTvp1mhcekkFjucSn; hypotheses: HYPOTHESES #7 session_01MXHAyHBp7fQrcxs8MPUFgy; steps: STEPS #5 session_01J3TzHfT2qWvkrKK2z2Ktcd; run-rules: RUN-RULES #13 session_016rtHXktFUtkGX8nXhc548v; ai-runs: AI-RUNS #18 session_012KrF4pcZDor4ebZmdfWuBk; reading-guides: READING-GUIDES #3 session_01JBdeWvyDiLY6TLEqW8MkkE

**At T46's opening:** T45 closed by PR #29 (`main` @ 8e5f57fad0, K2907); PR #28 (the design stream, DEC-193–DEC-197) merged into `main` at T45's close (`main` @ 3f40899950, K2904), so its `words.json` (1,503 words, 549 protected), `words-actions.json`, `registry.json` and `library.json` are on `main`. `tranche/T46` from `main`. Release 0.82.0 is being cut from `tranche/T45` (K2910–K2912: steps 0–5 done, `dist/cut-0.82.0` @ 985fbefc88; signing waits on Bob's act). T46 opens before the release finishes (P19: no idle wait on Bob's act); the cut, once signed, is merged into `tranche/T46` (K2911), and any live-check failure joins a layer not yet started (P10). Development runs (K2605); the 80% pause (K2341) and the account-switch rule stand. Provisional ids of the drafts are renumbered here (K2872, doubt 1).

**Sources** · `draft-T46-plan.md` (reviewed, K2872; Bob's answers K2892, K2893); `next.md` N751…N938, each re-tested; `archive/T45.md` (entries, "Left out", Outcome, accepted reds) and K2905; `archive/T41.md` "Left out" (its carried rows re-tested, below); `study-T46-assistant.md` (K2873); `draft-T46-interface.md` §2, §5; `draft-T46-trial.md` §1.2, §2.2, §3.2, §4–§6; `docs/development/DECISIONS.md` DEC-193–DEC-197 and `docs/development/ux-substrate/screens/` on `main` @ 3f40899950; rulings K2869–K2910; `rulings-active.md`; `modules.json` (order, layers). Text sources named per entry; "words.json" means `docs/development/ux-substrate/screens/words.json` @ 3f40899950.

## Legacy census (§5.2 (2))

| legacy module | in T46 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX), K633, K1849, N897 (1) "legacy-ui stays as it is": it stays until the new interface replaces it; a dependency not yet built: T46 builds the new interface's first part (T46-53…T46-58), the rest is T47's. N794, N865 (its reds) left out for the same reason. The 0.82.0 deploy moves its `civicos` worker unchanged (trial §4 step 12). |

It is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order** within a layer is `modules.json` order unless the layer says otherwise; a provider merges before its users; promotion's stamp merges last in L2; plane merges last in L11 (K425, K1680). Each layer's text is folded into its modules' files before that layer's START, from the source each entry names (BOB's wording, P5); every new or amended line ends *(not yet met: T46)*.
2. **Every job reads its own code and tests whole** (P20; mechanics §6 step 2). Each START says so.
3. **The opening's act (K657, K1043; one act):** `modules.json` and `layers.md` (layer 11, after `store-door`, before `control-plane`) gain `interface-assets`, `interface-shell`, `screens-settings`, `screens-intake`, `screens-daily`, `screens-inquiry`, with empty `paths` and `tests`; membership's `MODULE_ORDER` entry is T46-4. A job that adds a file outside its listed `paths` names it in its COMPLETE; BOB adds it before the ownership check.
4. **N913 (DEC-194's words) is folded module by module, one job per module (P8).** Each module named "N913" below re-takes its refusal rows' translations from `words.json`'s `refusal.<CODE>` and its keyed sentences from their keys, read by key as `extraction`'s `TRANSCRIBE_WORDS` and `membership`'s `HANDLE_WORDS` are (wording only, no code, number or `where` moved; counts are the rows whose text differs today, measured against `words-actions.json`). A code held at two sites (`BEARING_REFUSED`: action-grammar and action-replies; `HOLD_PLACE_REFUSED`: action-holds and filings) is re-worded at its minting site only and relayed by the other (K231), checked at each START. DEC-194's other owed work is placed in T46-43 (scripts, `@communication`) and in BOB's channel act (the owed acts re-pointed).
5. **Accepted reds at the opening** (K2905's list, re-checked against `archive/T45.md`'s Outcome; each red until the T46 job named):
   1. coverage: every id marked `*(not yet met: T46)*` until its module's merge, installer R48 among them (N923; T46-60, or carried if its address part is left out);
   2. row census: rows T45's L3+ jobs added or changed, until T46-6's stamp; rows T46's L3+ jobs add or change (N913's re-wordings among them), until T47's;
   3. legacy-ui `statement-ack.test.mjs` (N794), `progression-revision.test.mjs` and `queue-recipients.test.mjs` (N865) (K633);
   4. the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close;
   5. bundler `fleetbundles.test.mjs` "agent-worker's 26 inputs" (T45 rule 4 (13)), and from the cut's merge its real-fleet image pin to `docker.io/civicos` (K2266, K2912), until T46-2;
   6. membership `module-order.test.mjs` "R83 T45-2 negative control" (N936), and its `MODULE_ORDER` tests from the opening's act until T46-4;
   7. affordances R48 ACT_HELP (N937), until T46-45; op-declarations' four R21/R27 registry tests (N937), until T46-51;
   8. control-plane's two op-table tests, R2/R41/R47/R48 (N938), until T46-59.
   T45's rule 4 (3) (the UI's DEC-88 tests) is not among K2905's reds at T45's close and is not carried. **Named now, opened inside T46:** answer-envelope `catalogue-end.test.mjs` from the merges of conformance (C-113.7), escalation (C-116.27) and action-plans (C-124.30) re-worded under N913, until T46-52; the T46 ops new in L2–L10 (escalation R31's `escalationstoppursuing`, `escalationreopen`; plan-work's `statusreportassist`; membership's N654 read) in op-declarations', op-grades', affordances', control-plane's and plane's totality and route-map tests, from their owners' merges until T46-51, -44, -45, -59, -62; op-grades' `handlechange` NON_ACTS pin (`t41.test.mjs` R29), from T46-4's merge until T46-44. Any other red a merge opens is named at that merge (K2704).

## Entries

### L1
- **T46-1 · record-grammar** · (N910, N911, N912, N914) R35: `escalation` gains `stopped_pursuing` (edges as N910), `action_plan` gains `paused` (open↔paused, paused→closed); `success_record` registered (`SUC-` prefix, `OBJECT_TYPES`, `STATES` `recorded`); `PROPOSAL_STATES` gains the bearing subject · text BOB's · first in L1.
- **T46-2 · bundler** · (N900; K2266) test only: `fleetbundles.test.mjs` re-pinned to agent-worker's 27 inputs (K2828), and its real-fleet image pin to the 0.82.0 cut's GHCR names (`ghcr.io/believeinoakland/agent-runner`, `…/file-scanner-scanner`, `…/file-scanner-renderer`, K2912), which reach the tranche with the cut's merge · text none.

**L1 merge order:** record-grammar, bundler.

### L2
- **T46-3 · record-core** · (N904) R25: `getSetting` tells a stored value that is not valid JSON (unreadable) from unset · text BOB's.
- **T46-4 · membership** · (I1; K657) R83 `MODULE_ORDER` gains the six new modules after `store-door` (rule 3); (N934; DEC-197, K2903) R124 retired by refusal: `op=handlechange` stays declared and routed and refuses every change `HANDLE_FIXED` (a new row in membership's family), the change path's tests retired; R17's `formerly` retired; R16 states that a departed member's handle stays taken; (N936) `module-order.test.mjs`' T45 negative control re-pinned to the T45 modules' filled paths; (N913) `PROJECT_GUARD_UNCHECKED` kept in T46 until its word conforms (K2917); (N654, re-tested below) a read of the live website key's and join link's settings and history, never their secrets, to administrators · interface §5 I1; DEC-197's owed line; N654's text BOB's · first in L2's users.
- **T46-5 · project-roster** · (N913) the C-147 rows re-worded (6: `PROJECT_SCOPE_OWN_NOT_SOLE`, `_UNCHANGED`, `_OWN`, `_KEEPS_HIDDEN`, `APPROVAL_RULE_INVALID`, `APPROVAL_KIND_UNKNOWN`) · words.json.
- **T46-6 · promotion** · (N902; rule 5 (2)) **the stamp**: rows T45's L3+ jobs added or changed and T46's L1–L2 rows (membership's `HANDLE_FIXED` and re-wording, project-roster's); `src/gate.mjs`' aggregate lists `CASE_CHECK_CHECKS` C-148, `CASE_ACCOUNT_CHECKS` C-153 and C-149–C-151 (no C-152: action-producers holds no family, K2891) · text BOB's · last in L2.

**L2 merge order:** record-core, membership, project-roster, promotion.

### L3
- **T46-7 · file-safety** · (N897 (4); DEC-149) R42 new: `SCANNER_ABSENT`, `RENDERER_ABSENT` rows in member words; their details drop "copy" · trial §3.2.

### L4
- **T46-8 · extraction** · (N897 (2); N886) R71 amended: a transcription on the test-instance exception records the label the plane hands in (no edge to `run-rules`, K2872); R71 fills `transcribe.refused`'s `{reason}` from agent-worker R72's six codes by DEC-193's keys (`transcribe.reason.requestfault` for `BAD_BODY`, `BAD_SHA`, `BAD_PAGES`; `.noaccount`; `.badaccount`; `.needsapikey`), as reasons inside its existing C-51 rows, so no new family is minted · trial §1.2; DEC-193.

### L5
- **T46-9 · local-facts** · (N935) its ops map exported as an arm for `grouprules` (R12), so the plane spreads it instead of naming an entry; (N913) 8 rows re-worded (`MACHINE_CANNOT_DRAFT_RULE`, `RULE_SECTION_UNKNOWN`, `RULE_ENTRY_INVALID`, `RULE_NO_SOURCE`, `RULE_IN_PROFILE`, `RULE_NOT_DRAFTED`, `RULE_NEEDS_QUALIFICATION`, `NO_SUCH_GROUP_RULE`) · text BOB's; words.json.
- **T46-10 · standards** · (N913) `COMMITMENT_AS_HEARD`, `COMMITMENT_OWN_LETTER` re-worded · words.json.
- **T46-11 · duties** · (N913) `RESPONSE_KIND_UNKNOWN`, `RESPONSE_EXTENT_NOT_IN`, `PROMISE_DATE_UNREAD`, `DUTY_SOURCE_NOT_HELD` re-worded · words.json.

**L5 merge order:** local-facts, standards, duties.

### L6
- **T46-12 · steps** · (N899) R12: the 1,000-step and 1,000-reminder bounds stated with a `truncated` mark; Private Uses names `jurisdictions`, `calc-grammar`, `connection-grammar`, not `inquiry` · text BOB's.
- **T46-13 · run-rules** · (N897 (2); K2816; trial finding 1) R29 `partAdmittedOn`/`untestedLabel`, R30 `AI_PART_NOT_DEPLOYED` new; R16, R21 amended (`ask`, `draft` flags `true`, gated by R29); (N920) R27: `DRAFT_KINDS` gains `statusreport`, reach `none`, part `draft:statusreport`, under `draft`'s flag; (K2892, N919) R14's own reviewed act: `plan` deployed in `DEPLOYED_MODES` (with agent-worker's `MODES.plan`, T46-19), D14's bar still gating every instance but a test instance; `action_drafts`' flag set in the same reviewed change only if M-T46-5 finds its three kinds served end to end; (N913) `AI_RUN_ORIGIN_UNKNOWN`, `AI_RUN_REEXAM_NEEDS_RESPONSE`, `AI_RUN_REEXAM_OPEN` re-worded · trial §1.2; study §2; words.json; rest BOB's · first in L6's AI jobs.
- **T46-14 · ai-runs** · (N897 (2)) R78 new: `testInstance()` from `CIVICSMITH_TEST_INSTANCE` = `INSTANCE_NAME`, `partAdmitted` the one gate; R40, R23's input, R10, R19, R28 answer `untested`; (N919; Bob, K2892) R18 amended: a run a member opens on her own sign-in credential is dispatched for that member only (K1755's member subscription token), every other R18 refusal standing, started through `control-plane`'s door (T46-59) · trial §1.2; K2892's BOB's details · after T46-13.
- **T46-15 · reading-guides** · (N913) `GUIDE_KIND_UNKNOWN`, `GUIDE_ITEM_UNSOURCED` re-worded; `PROCEDURE_GUIDE_LABEL` reads `guide.procedure.legalinfo` · words.json.
- **T46-16 · skills** · (N915) the planning layer names `closingNotesOf`'s notes as planning input; (N920) R45's `action_drafting` layer names the status-report task (each sentence from a handed item, nothing read) · text BOB's · after T46-15.
- **T46-17 · question-explorer** · (N897 (2)) R16 new: the gate open on the exception, finds labelled · trial §1.2 · after T46-14.
- **T46-65 · hypotheses** · (K2926; 0.82.0 regression) R23 new: R14's renumbering runs without a `TEMP` table (the one-word fix made on the cut, reaching the tranche with its merge), tested on workerd with a store holding notes and turns · text BOB's.
- **T46-63 · agent-harness** · (N919; K2892) R10 new: `MODES.plan` deployed, the harness's copy agreeing with run-rules R14 and agent-worker R53 (K2920: the copy lives in `harness.mjs`, agent-harness's file) · text BOB's · after T46-13.
- **T46-64 · agent-model** · (N852) R15 new (amends R14): on the sign-in path an image block is relayed through the runner (agent-runner R24), `IMAGE_NOT_RELAYED` kept for a runner without it · text BOB's · before T46-18.
- **T46-18 · agent-runner** · (N852; K2816 (3), (4)) a sign-in transcribes: the runner passes page images as `agent-worker` R72 does for API keys (its dependency met for `biosmoke7` by K2816 (4)'s copy) · text BOB's (trial §6 B4 A) · before T46-19.
- **T46-19 · agent-worker** · (N897 (2)–(4)) R79 new (`untested` on `/ask`'s last answer event and `/draft`'s); R6 amended (a sign-in's `suggestions` boolean); R34 amended (`/version` `runner`); (N852) `TRANSCRIBE_NEEDS_API_KEY` lifted for a sign-in; (N915) R51 names `closingNotesOf`; (N920) R76's fourth task `{op: "statusreportdraft", plan, items}` → `{text, sources}`, `grant` present `DRAFT_READ_NOT_ALLOWED`, R77, R79 applying; (K2892) R53's reviewed act: `MODES.plan` deployed with run-rules R14; `/run` taking a member's sign-in principal if M-T46-4 finds it refused. N886 asks no change here: R72's six codes are answered with their HTTP status already (verified at START) · trial §1.2, §3.2; study §2; rest BOB's · after T46-13, -16, -18.

**L6 merge order:** hypotheses, steps, run-rules, ai-runs, reading-guides, skills, question-explorer, agent-harness, agent-model, agent-runner, agent-worker (`modules.json` order).

### L8
- **T46-20 · case-carriage** · (N907) new reads `acceptedWorkLapsedSince`, `marksLapsedSince`, `sourcesLapsedSince(…, since)` over its append-only histories · text BOB's.
- **T46-66 · publication** · (K2928; MEMBERSHIP #35 J2) test only: `t41.test.mjs` R76's handle-change arm re-pinned to membership R129 (every change refused `HANDLE_FIXED`, no case named); no requirement or capability changes, so N909's hold before a split is not engaged · text none.
- **T46-21 · docket** · (N913) `DOCKET_OUTCOME_UNREADABLE` re-worded · words.json.
- **T46-22 · public-read** · (N904) R34 reads a stored stake that record-core's strict `getSetting` answers `SETTING_UNREADABLE` (record-core R83) as undetermined, never as unset; (N906) R5 reworded to the lowercasing behaviour (callers unchanged: a 64-hex argument is lowercased, never refused); the sampling tests deepened (R13, R15, R19, R22, R27, R29, R30) · text BOB's.
- **T46-23 · case-checker** · (N916) R24 states that a sentence with nothing checkable reads `supported` when it cites anything (behaviour kept); `filings` and `case-account` told (P5) · text BOB's.
- **T46-24 · case-import** · (N903) R4: the source group's `group_fields` (public-read R34's identity and declared stake, with the time read) recorded at import and answered from `importedCase`, for `conformance` R32 · text BOB's.
- **T46-25 · case-disclosures** · (N901) R30: `accountJudged` translates case-account's `cited` holdings into `checkAccount`'s shape (one site) · text BOB's · after T46-23.
- **T46-26 · case-account** · (N935) its ops map exported as an arm for `advocacycheck`, `advocacychecks` (R13); (N913) `ADVOCACY_NOT_OWN_PROJECT` re-worded · text BOB's; words.json.
- **T46-27 · case-authoring** · (N913) 5 rows re-worded (`MACHINE_CANNOT_CARRY_OUTCOME`, `BAD_CARRIED_OUTCOME`, `NO_SUCH_CARRIED_OUTCOME`, `CARRIED_OUTCOME_SETTLED`, `CARRY_NO_REASON`) and R70's `signing.openrequest.line`, `.noreply`, `.unread` sentences (and `.nowindow` where R70 has no window) read by key. Wording only: no capability, so N908's hold before a split is not engaged · words.json.
- **T46-28 · case-check** · (N907) R2 latches a void check for the lapse causes through T46-20's reads (its clause's T46 mark struck) · text BOB's · after T46-20.

**L8 merge order:** case-carriage, docket, publication (by `modules.json` order, checked at L8's START), public-read, case-checker, case-import, case-disclosures, case-account, case-authoring, case-check.

### L9
- **T46-29 · conformance** · (N913) 9 rows re-worded, `FINDING_NOT_PUBLISHED` (C-113.7, pinned by answer-envelope: rule 5) among them · words.json.
- **T46-30 · consequences** · (N911) R17's "record object" clause: each success record promoted to the `success_record` object (T46-1); (N913) 20 rows re-worded and `consequences.success.sequence_not_cause`, `.cause_not_stated` read by key · text BOB's; words.json.
- **T46-31 · action-grammar** · (N913) 28 rows re-worded (`DETERMINATION_NOT_NONCOMPLIANT` … `PROMISE_REFUSED`), `BEARING_REFUSED` at its one site (rule 4) · words.json.
- **T46-32 · actions** · (N922) R33: the machine bound admits `pending` → `overdue` for an entry carrying `due_at` once that instant has passed in its zone (`due_zone`, else the office's; as `action-clocks`' `dueAtOf`), date-only entries unchanged; (N913) its five keyed sentences (`actions.override.ground_not_stated`, `actions.reply.not_owed`, `actions.scope.published_stays`, `actions.openitems.not_office`, `actions.recognition.promise_only`) read by key · text BOB's; words.json.
- **T46-33 · action-holds** · (N929) R5: `actionHoldRelease` where no hold stands refused `HOLD_NOT_IN_PLACE`; (N913) `HOLD_PLACE_REFUSED`, `MACHINE_CANNOT_SEND`, `HOLD_NOT_IN_PLACE` re-worded · text BOB's; words.json.
- **T46-34 · action-clocks** · (N918) R1: `pendingClocks`' items carry `due_at` and `due_zone` (as R3's); (N925) a read listing standing clock proposals, for affordances' `clockadopt` · text BOB's.
- **T46-35 · action-replies** · (N912) R1: bearing proposals labelled through `proposalLabel` (T46-1); (N932) R2 states `aroseFromLink`'s project sight and `AROSE_FROM_REFUSED`; (N913) 5 rows re-worded (`BEARING_REFUSED` relayed from action-grammar) · text BOB's; words.json · after T46-31.
- **T46-36 · filing-templates** · (N913) `TEMPLATE_NOT_REVIEWED`, `TEMPLATE_COURT_PETITION` re-worded · words.json.
- **T46-37 · filings** · (N930) R7: `filingsFor` answers `second_needed` per draft (project-roster R24's rule); (N913) 9 rows re-worded (`HOLD_PLACE_REFUSED` relayed from action-holds) and its keyed sentences (`prepared.rests.*`, `phrasing.no_list`, `packet.privileged*`, `filings.election.notice`, `rfc.quoting`, `recognition.staff_public`, the pointers, `voice.*`, `filings.secondapproval.*`) read by key, placeholders as words.json names them · text BOB's; words.json · after T46-33, T46-36.
- **T46-38 · escalation** · (N910) R31 built whole: `escalationStopPursuing` (`op=escalationstoppursuing`) writes `stopped_pursuing` as the document's state (T46-1), `escalationReopen` (`op=escalationreopen`), with rows `MACHINE_CANNOT_STOP`, `NOT_STOPPED` minted in DEC-194's words; (N931) R9: `ALREADY_ATTACHED` judged within the viewer's sight, and a read of stage 7's counterparty conditions; (N913) `NOT_OPEN` (C-116.27, pinned: rule 5) re-worded · R31 as written; text BOB's; words.json.
- **T46-39 · action-plans** · (N914) R40: `paused` moves the document's `current_state` with its Plan Log (T46-1); (N928) R40: `plansToLookAgain` compares `look_again` with the plan's local day (K1444 (iii)); (N913) 7 rows re-worded (`SCENARIO_OUT_OF_RANGE`, C-124.30, pinned: rule 5) and `plan.close.lessons` read by key · text BOB's; words.json.
- **T46-40 · plan-work** · (N920) R8's assistant arm: op `statusreportassist`, past sight answering `ASSISTANT_DRAFT_UNAVAILABLE` carrying R8's items (the `draftDue` pattern), `statusReportSave`'s `from` recording a labelled machine draft; no edge to `run-rules` (the door gates; the draft's edge struck); (N921) R13: `matterPromiseDuties` answers `met_at` · study §2; text BOB's.

**L9 merge order:** conformance, consequences, action-grammar, actions, action-holds, action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work.

### L10
- **T46-41 · monitoring** · (N918) R34, R50 read a timed entry's instant from `pendingClocks` (T46-34), not the action's document; (N922) R34's time-of-day arm met through actions R33 (T46-32), its two `test.todo` made tests · text BOB's.
- **T46-42 · following** · (N921) R24's `promises_met` reads plan-work R13's `met_at` (one source) · text BOB's · after T46-41.

**L10 merge order:** monitoring, following.

### L11
- **T46-43 · wizard-scripts** · (I3) R13: `SCREEN_REGISTRY` re-taken from `registry.json` @ 3f40899950, or a later `main` commit carrying the design stream's §3 corrections if merged before L11's START (it carries DEC-197: `handlechange` gone from Your account's acts); (N913; DEC-194 (4), (5)) R22's second clause: the five library scripts adopted ("Comment for the group", "Demand a correction", "Take an escalation to its next stage", "Refer it to an oversight body", "Pick up a plan"), and `@communication`'s step 4 naming no template · interface §5 I3; DEC-194; `library.json` @ 3f40899950.
- **T46-44 · op-grades** · R32's pattern: T46's new ops graded (`infolevelset`, `infolevel`, `statusreportassist`, `escalationstoppursuing`, `escalationreopen`, N919's door op, N654's read, `textcheck` if ungraded); (N934) `handlechange`'s NON_ACTS sentence states it refuses every change · text BOB's · first of L11's op jobs.
- **T46-45 · affordances** · (N937) R48's ACT_HELP for PR #28's 42 new ops re-pinned to the merged registry and `mock-acts.js` @ 3f40899950; R51 offers escalation's stop and reopen (R31; deferred in T45, K2898), `clockadopt` through T46-34's read (N925), `filingsent` only on a draft that needs no further approval (N930), attachment at stage 7 (N931); help for T46's new ops; `handlechange`'s help as a refusal where its tests pin it (N934) · text BOB's; `mock-acts.js` · after T46-44.
- **T46-46 · action-producers** · (N924) R1, R11: the door stating a clock entry met or waived, through `actions`' revision of the entry's status; (N926) R1: an overdue clock entry whose duty's watch has ended (`following.dutyWatchEnd`) is drawn although `noticed_by` is set (action-clocks R17 unchanged: action-clocks, L9, cannot read following, L10); (N913) its `.ours`/`.theirs` interim sentences and the summary and detail of `member-left-items`, `watch-keep-or-stop`, `plan-review-due`, `plan-look-again`, `litigation-hold.docket` read from words.json's keys, its doors' labels from `door.*` · text BOB's; words.json.
- **T46-47 · notice-producers** · (N927) R5: a possibly-overdue occurrence already told stays until disposed (queue R16) · text BOB's.
- **T46-48 · setup-page** · (I4; N897 (2), (4)) R31 new: the session record `SESSION_STORE_KEY` stated; **R32 new (Bob, K2893: Home)**: after sign-in a member lands on `/app`, the panel offering "Open your group's Civicsmith"; R33 new: the test-instance notice while `bootstrap` answers `test_instance: true`; R30 amended: scanner sentences only while `parts` says a scanner is present, parts on the healthy panel · interface §5 I4; trial §1.2, §3.2 · merges after T46-50 (doubt 14).
- **T46-49 · setup-words** · (I2; DEC-179) R1, R2: `WORD_ROWS` re-taken from words.json @ 3f40899950 (1,503 words, 549 protected), `WORDS_COMMIT` that commit · interface §5 I2 · before T46-50.
- **T46-50 · instance-setup** · (I5; N897 (2)–(4)) R79 new `infoLevelSet`/`infoLevel` (`op=infolevelset`, `op=infolevel`); R80 new `bootstrap` `test_instance` (edge → `ai-runs`, earlier); R81 new `bootstrap` `parts`; R17 amended (agent-runner through agent-worker's `runner`); R54 amended (the disclosure at a sign-in's connect) · interface §5 I5; trial §1.2, §2.2, §3.2.
- **T46-51 · op-declarations** · (I6) R50 new: `infolevelset`, `infolevel` specified; R34 holds; (N920) `statusreportassist: "ownread"` in plan-work's spec; escalation R31's two ops, N919's door op and N654's read specified; (N937) R21/R27's registry tests re-pinned to the merged registry; (N934) `handlechange`'s help as a refusal where pinned · interface §5 I6; text BOB's.
- **T46-52 · answer-envelope** · (N913) R7's snapshot re-pinned to the owners' re-worded rows C-113.7, C-116.27, C-124.30 (`changed.note` naming DEC-194); `CHECK_FAMILY_FILES` unchanged (T46 adds no family: T46-8) · text BOB's · before plane.
- **T46-53 · interface-assets** (new) · (N897 (1); DEC-138; N559) R1–R4 · interface §2.1, §5 I7 · first of the six.
- **T46-54 · interface-shell** (new) · (N897 (1); DEC-87, -98, -99, -122, -138, -139, -154, -159–-163, -175–-177, -179, -181; N672) R1–R24; Settings › "Group settings" opens the setup page's sections (K2893); (N673; DEC-155) the rail's width per member and device (184px default, 64–320px, dragged or keyed, kept on the device, never in the record) · interface §2.2, §5 I8; N673's text BOB's · after T46-53, T46-48.
- **T46-55 · screens-settings** (new) · (N897 (1), (3); K2147) R1–R10: `members`, `account`, `connect`, `notes`; (N934; DEC-197) R1 draws no "formerly", R3 no `handlechange` act and the fixed handle in DEC-197's words · interface §2.3 amended by DEC-197 · after T46-54.
- **T46-56 · screens-intake** (new) · (N897 (1); N821; N714's screen side) R1–R9: `capture` (with `captureupload`), `held`, `open-file`, `inbox`; (N747) a promote after an acquire skips an answer carrying `promoted` · interface §2.4; N747's text BOB's · after T46-54.
- **T46-57 · screens-daily** (new) · (N897 (1); N698's screen part) R1–R7: `home`, `queue`, `finder`, `find-in`, `answers` · interface §2.5 · after T46-54.
- **T46-58 · screens-inquiry** (new) · (N897 (1), (2)) R1–R5: `project`, `question`, `document`, the assistant dock (the test-instance label drawn); (N919) the dock's "Work on this" on a member's own sign-in starts the run through T46-59's door · interface §2.6; N919's share BOB's · after T46-54.
- **T46-59 · control-plane** · (I13; N897 (3), (4)) R75 new (`GET /app`, `/app/<path>`, `/app/assets/<name>`), R76 new (`infolevelset`, `infolevel` routed), the end-to-end suite; R65 amended (`DISCLOSURE_DUE` before `start`; `RUNNER_NOT_CONFIGURED` with `ai.refused.signinabsent`; the draft answer's `untested` passed); (N905) R20: the review copy's `inbandQuartet` passes the group fields; (N917) R57: a door route for `textcheck`; (N920) R57: `DRAFT_OPS` gains `statusreportassist`, `draftAsk` handing over the owner's items; (N919; K2892) the door starting a member's own run's segment on her own sign-in (ai-runs R18), op provisionally `airundispatch`; N654's read routed; (N938) R2, R41, R47, R48 re-pinned to T45's and T46's declared ops; edges → the six new modules · interface §1.2, §5 I13; trial §2.2; study §2; rest BOB's · after T46-53…58.
- **T46-60 · installer** · (N897 (2), (4)) R49 new (never `CIVICSMITH_TEST_INSTANCE`); R38, R23 amended (an unpullable image named per part, in member words, before and after install); (N923, was T45-46) R48: the README and the public documentation publish the stewards' contact address, what they may do and the plain guide **only if Bob names the address (K2799) before L11's START**; else that part stays left out (Bob's) and the rest runs · trial §1.2, §3.2; `stewards/guide.md` (K2884).
- **T46-61 · stewards** · (N923) R7's shared text aligned with the installer README's (its test reading the README, the earlier module) · **only with T46-60's address part**; otherwise no T46 job · text BOB's · before plane.
- **T46-62 · plane** · (N897 (2), (3); trial findings 1, 4) R40 amended: the ask and draft doors gate on `partAdmitted`, the label on outputs, the transcriber through it; R33 amended (the serving account's suggestions switch); (N886) R36 relays agent-worker's HTTP status; (N920) R40: `partAdmitted("draft:statusreport")` and keep-away before any account is read, use counted as `draft`; (N935) R39 spreads case-account's and local-facts' ops-map arms; the route map's tests re-pinned for T46's new ops · trial §1.2; study §2; rest BOB's · last in L11.

**L11 merge order:** wizard-scripts, op-grades, affordances, action-producers, notice-producers, setup-words, instance-setup, setup-page (after instance-setup, doubt 14), op-declarations, answer-envelope, interface-assets, interface-shell, screens-settings, screens-intake, screens-daily, screens-inquiry, control-plane, installer, stewards, plane last.

**Counts:** L1 2 · L2 4 · L3 1 · L4 1 · L5 3 · L6 11 · L8 10 · L9 12 · L10 2 · L11 20 (T46-61 conditional) = 66.

### New modules: places (K617, K657, K1043)

| new module | layer, place | built by | uses (all earlier) |
|---|---|---|---|
| `interface-assets` | L11, after `store-door` | fresh (frozen data at `ASSETS_COMMIT`) | none |
| `interface-shell` | after `interface-assets` | fresh | `interface-assets`, `setup-words`, `setup-page`, `op-declarations`, `op-grades` |
| `screens-settings`, `screens-intake`, `screens-daily`, `screens-inquiry` | after `interface-shell`, in that order, before `control-plane` | fresh | `interface-shell`, `setup-words`; tests: `op-declarations` |

No ids move. **Edges added, each to an earlier module:** `instance-setup` → `ai-runs`; `control-plane` → the six. **Struck:** `plan-work` → `run-rules` (N920). `extraction` (L4) takes the label as data, no edge to `run-rules` (L6). `action-clocks` gains no edge to `following` (N926 is action-producers'). No edge points later.

## BOB's acts (no job)

- **Release 0.82.0**, cut from `tranche/T45` (K2910–K2912: steps 0–5 done, the three GHCR images published and pinned; regression run 38197495576): the rest of trial §4 steps 6–14, the signed cut merged into `tranche/T46`, the images copied into the account's registry for `biosmoke7` (K2816 (4)), file-scanner's first deploy; signing with the development key in the `release` environment (K2893), whose secret Bob sets himself since a session cannot reach the environment (K2910), then Bob approves the `release-sign.yml` run; each deploy act and the verify controls Bob's in session; the installer's deploy deferred (trial §6 B6). Surface failures found at the live checks join T46's layers not yet started (P10).
- **Release 0.83.0** at T46's close: the same steps plus trial §4 steps 15–17 (`CIVICSMITH_TEST_INSTANCE=biosmoke7`, verified; Bob's first sign-in on `connect`, M-T46-2).
- **The channel** (I15, trial §5): one HANDOFF to UX-DESIGN, not a precondition of any job (K1430): registry corrections 1–4; the owed acts now served, to be re-pointed in `registry.json` (`itemtakeup`, `actionscope`, `filingsecondapprove` since T45; `escalationstoppursuing`, `infolevelset` with T46; `subscriptionsignin`); the screens' `SCREEN_WORDS` keys; `ai.label.untested`, `ai.refused.signinabsent`, `DISCLOSURE_DUE`, the test-instance notice, the parts' words; words for `HANDLE_FIXED`, `statusreportassist`, the member-run door and N654's read; `handlechange` kept as a refusing op (K2903), so the `handle.*` keys built code reads stay; `refusal.DRAFT_NEEDS_GRANT`, which no module mints; notice-producers R5, R6, R13–R15's sentences still unkeyed (N889); the library's stale `connect` step 4.
- **N898** (`mail done` refusal): process repository, between tranches, certified on a dry run (P3).
- **Split maps for N908, N909** (`case-authoring`, `publication`): written during T46 (P18), so their splits can run in T47.
- **Rulings recorded** at the opening (P17): the packaging choices of "Settled at the opening".

## Left out of T46 (one hard reason each)

| entry | hard reason |
|---|---|
| N751 | a measurement: no fresh policies beyond the 74 read (K2079) |
| N794, N865 | Bob's: legacy-ui stays as it is (K633, K1849, N897 (1)) |
| N824 | Bob's: "D42 - email: A" (K2425), after upload is in use; and a deployment |
| N829 | a measurement: the test set's matters and answers are written by people (D11, D14 C) |
| N842 (and `/draft`'s `account_check`) | a dependency not yet built: no `enquire` conversation, door or op and no account draft task (study §1); the exception lifts only the bar, on `biosmoke7` |
| N847 | a dependency not yet built: the pointer's content is the design stream's (N821); no provider named |
| N853c | a measurement: OCR's accuracy on members' photos |
| N858's `@records-request` template content | a dependency not yet built: no named writer and no professional review (K2781 (6), v0.2 rule 11) |
| N880's minutes comparison (U4) | a dependency not yet built: no module holds a meeting's minutes beside a comment; U4 is the design stream's screen comparison |
| N882's "proceeding followed with its own dates" | a dependency not yet built: COURTS L2 is not a requirement; no module assigned |
| `legal_facts` triggers detected at their moment | Bob's: their screens (attending, recording, receiving) are T47's (N897 (1)) |
| N889 | a dependency not yet built: words.json @ 3f40899950 keys none of notice-producers R5, R6, R13–R15's sentences (re-tested) |
| N933 | a dependency not yet built: the actions lane's answer whether a per-matter stake is wanted (D28d places one group setting, K2896) |
| N908, N909 (the splits) | a dependency not yet built: no extraction map for either (P18; BOB's act above); neither module gains capability in T46 (case-authoring's T46-27 is wording) |
| `investigate`, `extract` on the test instance | a deployment and measurement: `investigate` needs `check`'s live run verified on the deployed instance (`op=airunverify`) and the chain's reviewed edit, after 0.83.0; `extract` follows it (study §1) |
| `enquire`; `action_drafts` unless M-T46-5 finds it served | a dependency not yet built: no `/enquire` task, door or op (N842); the three draft kinds' paths as M-T46-5 finds them |
| the other 31 registry screens, `startfrom` and the dock's wizard guide, People, `projectai`, the settings still on the setup page, the v0.2 constructs' screens | Bob's: N897 (1) "the rest in T47"; and a dependency not yet built: N821's runner (screen side), and the constructs the design stream has not drawn |
| the installer's deploy | a deployment: its OAuth client lacks `connectivity-directory.bind`, Bob's dashboard act (K2164) |
| T46-60's address part and T46-61 (N923), if the address is not named by L11's START | Bob's: the stewards' contact address is his to name (K2799) |
| **T41's carried rows, re-tested:** | |
| N821's wizard runner; N551 (part); N572 | Bob's: N897 (1): `wizards` and the guide are T47's |
| N821's screens beyond T46's 18; shortcuts, command bar | Bob's: N897 (1) (T46-53…58 apply the rest of N821's screen share) |
| N788 (Photos step), N757 (photo obscuring on screen), N688 (part: archive screen), N703 (part: Settings › Security), N710 (Security tools), N719 (`person`), N721 (`projectai`, group settings), N728 (money trail), N735 (spot-check), N669 (parts: translation screens) | Bob's: N897 (1): each screen is T47's |
| N670 | a dependency not yet built: no act or owner for "read in my language" (and N669's screens) |
| N683 | a module's size before its split (P6): `case-authoring` gains no capability before N908's split |
| N708 | a measurement: M-Q2 at Bob's first sign-in (M-T46-2); `credentials` R22's `subscription` kind retires after it |
| N757 (later) | Bob's: "N757: A" (K2425), members mark photo areas by hand; no AI proposals |
| N563, N579, N632, N641, N643, N645, N652, N698 (part: proposals search cannot match) | a measurement (each as T37's table names it) |
| N703 (part: Cloudflare's blocked-request counts) | a deployment or measurement: a zone and read token per group |
| N647 | a measurement: as `investigate` above |
| N650 | a dependency not yet built: LAW L5's pack path |
| N666 | Bob's (DEC-151): after the first public release |

T41's other carried rows enter T46: N559 (T46-53, -59), N672 (T46-54), N673 (T46-54), N726 (T46-54, -50), N732, N734, N776's screen side (T46-54), N698's screen part (T46-57), N714's screen side (T46-56), N747 (T46-56), N654 (T46-4; its screens were its only reason, and K1430 holds no substrate for a screen).

**Applied in T45 (no T46 entry; move to `archive/next-applied.md` at the last owning merge):** N828, N855, N858 (but the template content), N861, N879, N880 (but U4), N881 (but the assistant's report: N920), N882 (but the proceeding), N883, N884, N885, N887, N888, N890, N891 (T45-38, -39; K2891, K2898), N892 (a)–(e) ((e) by T45-48, K2887), N893 (L1–L11), N895. N894 became N923 (T46-60, -61). N896, N897: this plan. N780: BOB's at the 0.82.0 cut.

## Applied by T45's L11: the draft's [L11?] marks

| draft entry | T45 job, ruling | outcome in T46 |
|---|---|---|
| wizard-scripts (T45-37) | merged, K2889 | dropped; T46-43 keeps I3 and R22's second clause |
| op-grades (T45-38, N891) | merged, K2891, K2897 | dropped; T46-44 keeps T46's ops |
| affordances (T45-39) | merged, K2898 | dropped; T46-45 keeps N937, N925, N930, N931 |
| action-producers (T45-40) | merged, K2888 | dropped; T46-46 carries N924, N926, N913 |
| queue-producers (T45-41) | merged, K2895 | dropped: **no T46 job** |
| notice-producers (T45-42) | merged, K2888 | dropped; T46-47 carries N927 |
| queue (T45-43) | merged, K2882, K2897 | dropped: **no T46 job** |
| instance-setup (T45-44) | merged, K2896 | dropped; T46-50 keeps I5 and the trial |
| op-declarations (T45-45) | merged, K2891 | dropped; T46-51 keeps I6, N937 |
| installer (T45-46, N894) | moved to T46 (K2878) | kept as N923 in T46-60, conditional on the address |
| plane (T45-47) | merged, K2900 | dropped; T46-62 keeps the trial, N886, N920, N935 |
| stewards (T45-48) | merged, K2887 | dropped; T46-61 only with the address (N923) |
| answer-envelope (T45-49) | merged, K2882 | dropped; T46-52 carries N913's re-pins |

## Settled at the opening

1. **Id collisions (doubt 1):** decided as drafted (K2872): instance-setup R79 info level, R80 `test_instance`, R81 `parts`; setup-page R31 session, R32 landing, R33 notice; one entry per module.
2. **No extraction → run-rules edge (doubt 2):** as drafted; the label passes as data.
3. **N852 in (doubt 3):** as drafted (T46-18, -19); size is no reason (P19).
4. **PR #28 (doubt 4):** on `main` (K2904). N886 is placed in extraction (DEC-193's keys as reasons in C-51), plane R36 and a verification in agent-worker, with no new family. N913's "Action-layer modules" are read from DEC-194's word list itself: its refusal codes belong to 19 modules across L2–L9 and its keyed sentences also to `actions` and `action-producers`, so N913 joins each module's one job (rule 4), not a single L9 entry; its scripts and `@communication` step go to T46-43, its owed acts to the channel.
5. **N908, N909 (doubt 5):** no extraction map exists, so the splits are left out and their maps are BOB's work during T46; case-authoring takes wording only.
6. **N842 (doubt 6):** stays left out (a dependency not yet built).
7. **N889 (doubt 7):** re-tested against words.json @ 3f40899950: no keys; stays left out.
8. **T41's carried rows (doubt 8):** re-tested row by row (the table above): eleven enter T46, the rest keep a hard reason.
9. **The assistant's reach (doubt 9):** settled by the study (K2873) and Bob (K2892): ask, draft, transcription and, through N919's dispatch, `check` and `plan` for a member's own sign-in. Setting `plan`'s flag is R14's own reviewed act, made in T46-13 and T46-19 because Bob's K2892 names plan and the flag only marks served code (trial B1); D14's bar still gates every other instance. `action_drafts` waits on M-T46-5.
10. **N881's status report (doubt 10):** N920's shape (study §2): no `credentials` change, no plan-work → run-rules edge.
11. **affordances, answer-envelope (doubt 11):** both have T46 work regardless of pins (T46-45: N937, N925, N930, N931; T46-52: N913's three pinned rows).
12. **Signing (doubt 12; Q2):** the development key as an interim (K2893); the secret is Bob's own act (K2910); `ARMED_SIGNERS` unchanged.
13. **The installer's address (doubt 13):** not yet named; T46-60 runs without its README part unless Bob names it by L11's START, and T46-61 joins only with it.
14. **setup-page after instance-setup (doubt 14):** as drafted.
15. **Q1:** Home (K2893): T46-48 R32 and T46-54.
16. **N926:** placed in action-producers, not action-clocks (order: action-clocks, L9, cannot use following, L10).
17. **N654:** joins membership's job; T36's reason was its screens, and K1430 holds no substrate stage for a screen.
18. **T45 rule 4 (3), the UI's DEC-88 tests:** not red at T45's close (K2905); not carried.

## Measure first

- **M-T46-1** (K617, at each START): `control-plane` (R20, R57, R65, R75, R76, N919's door, the suite), `agent-worker` (~3,300 after T45, plus N852, N915, N920, R79, R6, R34, `MODES.plan`), `membership` (~3,733 with N934, N654), `interface-shell` (est. 3,200–3,800), each screen module (est. 2,000–3,000), `instance-setup`, `setup-page`, `plane`, `escalation` (R31 whole).
- **M-T46-2** (K2147): M-Q2, container reliability, at Bob's first sign-in (0.83.0 step 17).
- **M-T46-3**: at T46-14's START, whether `CIVICSMITH_TEST_INSTANCE` survives `deploy.mjs`' `keep_bindings` as the trial assumes.
- **M-T46-4** (N919): at T46-14's START, whether `agent-worker`'s `/run` takes a member's sign-in principal through the runner; if not, its admission joins T46-19.
- **M-T46-5** (doubt 9): at T46-13's START, whether `textcheck`, `infractiondraft` and `bearingdraft` are each served end to end once T45's L11 (K2881, K2900) and N917 are in (the study predates them); if all three are, `action_drafts`' flag is set in T46-13's reviewed change.
- **M-T46-6** (K2946): at T46-62's START, whether `plane/ask.mjs` `draftOnObject` (:290) sends `secret: ref.key` for a sign-in account, which agent-worker's R6 refuses `BAD_ACCOUNT`; if so, T46-62 sends none for a sign-in.

## For BOB

- **The stewards' contact address (K2799)** is still Bob's to name; T46-60's README part and T46-61 wait on it. Ask at the opening, in one line.
- **0.82.0's signing secret** is now Bob's own act (K2910): setting the development key's seed in the GitHub `release` environment, then approving the signing run. Walk him through it in plain steps when the cut reaches step 6.

Nothing else here is Bob's. The plan flag (Settled 9), N926's placement, N654's entry and N913's spread are BOB's choices, recorded at the opening.
