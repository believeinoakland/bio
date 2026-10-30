# Task summary · T53 · action-plans

Stands for: current.md:318-323; build/plan/T53-R1/action-plans.md; build/requirements/action-plans.md (R1-R56); build/layers.md head and layer 9 row (:15); Purpose and named services of 24 used modules. The sources stay binding; read any cited section in full when the work touches it.

## Entries

- C T52-32 (current.md:319; rows:5,:15) · W18 E-K11 MINOR: a tier reason stores the option's own words, not "the tier option opt-1 of plan PLN-…" (PL2 W18) (R9, R54)
- C T52-33 (current.md:320; rows:5,:16) · U19 E U-4/K7, N4: first settle whether the owner's checks list or the screen repeats each sentence per scenario ("Checks · 9" for two); the closed plan keeps its checks (R19)
- T53-308 · K5571 (6) (current.md:321) · agent-steps R54's idem obligations get lines here (R55, R56)
- T53-309 · K5565 (current.md:322; rows:6,:20-24) · English in tests, this module's one conversion entry, done in T53: each assertion reads the word key the product reads, never a copied sentence; a B site first gets its key (words row, UX-DESIGN's wording); a C site kept as input or removed with its reason; every test touched is converted; Test: words-check baseline loses the module's files, suite green (R47, R36)
- rows:24 · layer 9 action-plans: literal A/B files 0/0; regex A/B/C sites 10/0/2 (8 files), before TESTS-SWEEP's removals; `tests-sweep/CENSUS.md`, `CENSUS-RX.md`; model `haiku-5-5` test-only, `sonnet-5-5` for a B site (BOB #324, K3518) (R47)
- rows:5 · draft: layer names in actions, action-records, action-grammar, action-clocks, filing-templates, filings (K5458); N1257 R36; plan-T53-capabilities.md §A Layer 9 (R19, R48)
- rows:11 · journeys: co-owner of Layer 11 modules with no draft line; written in the screen module and, only where "(owner half)", in the owner module; the job reads the screen-module line's "owner" clause (R51)
- rows:28 · K5571 (2026-10-27): lines enter tranche/T53 layer by layer before each START; (1) each downward `uses` edge enters modules.json; (2) no upward use; (3) jurisdictions R121 pure over a passed layer set; (6) agent-steps R54's idem obligations get lines in capture-requests, run-productions and action-plans (R55, R56, R121)

## action-plans (own requirements)
- R1-R56 · most Test and Control sentences are left out of this summary: read a requirement whole in build/requirements/action-plans.md before writing or changing its test

Status: in force (Bob 2026-09-30, K608 (3); R20 Bob's, K590). R55, R56 not yet met (T53).
Purpose: a project's working material for deciding what to do about matters, suspected (an open inquiry; one concluded in this project is suspected, `why` saying concluded here, not yet a determination, K5131) or determined (a determination's outcomes): options bound to matters, the member's choice, scenarios with member-judged checkpoints, the link from a started option to its Action. No costs, assignees, hours; never published. Gate at the outward act (DEC-26); a breach action needs a determination or an open override (`actions` R8) (R25, R26).
Terms: subject `{kind:"inquiry",inquiry,act?,standards?}` or `{kind:"outcome",determination,standard}`; support `established|short|hypothetical`; category `mitigation|legal|awareness|journalistic|grassroots|other`; regulated date `{date:YYYY-MM-DD,basis}`; checkpoint `{after_days}`; refusal `{ok:false,reason,code,check,translation,...}`.

- R1 · `planOpen({project,subjects,title,author,viewer})` refusals in order: `MACHINE_CANNOT_PLAN`; `PLAN_NO_TITLE` (empty, >200, quote, backslash, line break); `NO_SUCH_PROJECT`; `projectAuthority(project,author,"joined")`'s; `PLAN_NO_SUBJECT` (empty or >50); `SUBJECT_MALFORMED` (index); `NO_SUCH_INQUIRY`/`NO_SUCH_DETERMINATION` (unseen, alike); `SUBJECT_NOT_OF_PROJECT`; `SUBJECT_NOT_LIVE`; `SUBJECT_IN_ACTIVE_PLAN` (R3, names plan)
- R2 · records `PLN-` plan `open` (project, title, subjects in order, author, own-clock time); answers `{ok,id,subjects:[{subject,support}]}`
- R3 · a subject is in at most one open plan per project (same inquiry, or same determination and standard); another project may hold it
- R4 · `planSubjectAdd`/`planSubjectRemove({plan,subject,reason,author,viewer})`: R1's author/project/subject refusals, `NO_SUCH_PLAN`, `PLAN_CLOSED`, `PLAN_NO_REASON` (empty, >500, quote, backslash, line break); a removed subject's options keep it, marked `subject_removed` (R8)
- R5 · a determination recorded on a suspected subject's act (`conformance.determinationsFor({act})`): `planRead` answers `determined_since`; a member adds by R4; nothing without a member
- R6 · `planRead({id,nowMs?,viewer})` answers title, state, `work_kinds` (R21), subjects with support and liveness, options (R9) with dispositions, proposals apart (R11), scenarios (R14), each started option's action with lifecycle (`actionRead`), each determined subject's escalation and stage (`escalationsFor`, `escalationRead`), checks (R19), history (oldest first, who/when/why), pause (R40), set-asides (R39), offers (R41), marks apart (R43), `decisions` (choices, declines, set-asides, restorations, pauses, start-first reasons, close; reason and date); `NO_SUCH_PLAN` absent or unseen, one answer (R22)
- R7 · `plansFor({project?,subject?,state?,after?,limit?,viewer})` (op=plans): id order, <=200 a page, `truncated` by reading one past; `subject` finds plans holding it
- R8 · liveness derived on read: `live`, `superseded` (successor named when seen, R35), `closed` (inquiry), `subject_removed`; an option bound only to non-live subjects says so
- R9 · `optionAdd({plan,summary,detail,category,subjects,addressee?,dates?,tier?,enforces?,lobbying?,author,viewer})`, `optionRevise({plan,option,reason,...fields,author,viewer})`; refusals in order: `MACHINE_CANNOT_ADD_OPTION`; `NO_SUCH_PLAN`; `PLAN_CLOSED`; `projectAuthority(..,"joined")`; `OPTION_NO_SUMMARY` (empty or >200); `OPTION_DETAIL_TOO_LONG` (>5,000); `CATEGORY_UNKNOWN`; `OPTION_NO_SUBJECT`; `ADDRESSEE_REFUSED` (R10); `DATE_REFUSED` (not YYYY-MM-DD or no basis); `TIER_REFUSED` (tier on non-legal option, or not 1, 2, 3, `undetermined`); `LOBBYING_NO_REQUIREMENT` (R12); `OPTION_KEY_REFUSED` (R26). Legal option with no tier reads `undetermined`. Revise records a revision with reason (R4's rule)
- R10 · addressee is `actions` R9's shape (office by role and body; reporter or outlet; organisation or civic group by role and organisation; described audience); never a private individual
- R11 · `optionPropose({plan,...R9 fields,why,proposer,principal,viewer})`: any credential; `proposer` (`class:ai/<tokenId>`) and `principal` (`<principal>/<tokenId>`) are control-plane stamps (K727), never from the body; stored apart, labelled via `proposalLabel(proposer,"plan_option")`, `why` <=500; never an option. `optionAdopt({proposal,author,viewer,...overrides})` is R9 by a member; records its proposal; adopted once
- R12 · option marked `lobbying:true` names in `enforces` the standard or determined subject it enforces, else `LOBBYING_NO_REQUIREMENT` (K590); the module never judges text
- R13 · `optionDispose({plan,options,disposition,reason?,reminders?,author,viewer})`: `open` (default), `chosen`, `declined`, `done`, `blocked`; `declined`/`blocked` need a reason (R4's rule), others refuse one >500; several options, all or none; changes kept; `NO_SUCH_OPTION` names the first unknown
- R14 · `scenarioSet({plan,scenario,name,phases,author,viewer})` replaces one whole, earlier kept; `scenario` a positive integer, no upper bound (`0` refused `SCENARIO_OUT_OF_RANGE`). Phase `{id,name,options,starts,checkpoint?,condition?,branches?}`: `options` chosen options; `starts` is `plan_start`, `{after:phase}`, `{branch_of:phase,when:"met"|"not_met"}`, R15's form or R38's `{when_duty:…}`; `checkpoint` `{after_days}` 1-3,650; `condition` <=500; `branches` names the phase each judgement leads to. Refusals: `SCENARIO_OUT_OF_RANGE`, `PHASE_MALFORMED` (index), `PHASE_OPTION_NOT_CHOSEN`, `PHASE_CYCLE`, `BRANCH_UNKNOWN`. C-124.32 translation exactly: "A phase has an id, a name, the chosen options it holds, when it starts (at the plan's start, after another phase, on one outcome of another phase's checkpoint, when another matter's track reaches a point, or when an obligation's occurrence reaches a state: met, met late, overdue or undetermined), and may have a checkpoint after 1 to 3,650 days, a condition of up to 500 characters and the phase each judgement leads to. The phase named was not so. Nothing was written."
- R15 · `starts:{when_subject:subject,reaches:"resolved"|"stage",stage?}`: true when that subject's escalation reaches the stage or its started action is resolved; derived on read
- R16 · `checkpointRecord({plan,scenario,phase,judged,note,author,viewer})`: `met`|`not_met`, note <=500; `CHECKPOINT_NOT_DUE` before phase start plus `after_days`; `CHECKPOINT_JUDGED`; the scenario reads the branch named; never judges a condition
- R17 · `checkpointsDue({nowMs,limit?})`: open plans' unjudged checkpoints whose day has come, oldest first, <=500, with plan, project, scenario, phase, the member who set the scenario's current version, days since due; for `queue-producers` (its R16; DEC-94); never a finding (R23); paused (R40) and set-aside (R39) not due
- R18 · `optionStart({plan,option,kind,contact?,breach?,premise_override?,author,viewer})`; refusals: `MACHINE_CANNOT_START`; `NO_SUCH_PLAN`; `PLAN_CLOSED`; `NO_SUCH_OPTION`; `OPTION_NOT_CHOSEN`; `OPTION_STARTED` (names action); `CONTACT_NOT_A_MEMBER` (before any write, `actions.contactNotAMember`; N427); then the action write's (`actions` R1-R11, R45, R46; `action-clocks` R4). Else composes the action (kind, option's addressee, its dates as pending clock entries with bases, a `rests_on` leg per subject, `plan`/`option`, `contact`, `breach`, `premise_override`) and promotes it; breach refused by `actions` R8 unless it rests on a live noncompliant determination or an override with reason (K600 (a)). Same act sets R29's reminders (`action-clocks` R4; a refusal of either leaves neither); records the link; answers the action id. Never touches an escalation
- R19 · checks derived on read, each with reason: option date past, or before the phase holding it can start (`date_past`, `date_before_phase`; R48); phase whose judgement lacks a branch for one outcome; option bound only to non-live subjects; outward option (addresses anyone) bound only to hypothetical subjects; scenario whose outward options lack a branch for a hostile response (refusal, obstruction, retaliation; v0_1 §4 rule 12, K597 (1)); lobbying option whose `enforces` target is superseded. A check informs, never refuses or changes
- R20 · `planClose({id,reason,author,viewer})`: a member, reason (R4's rule); never self-closes; stays readable; subjects free (R3); `PLAN_CLOSED` if closed; no action or escalation changes. From `open` or `paused` records reason, a **closing summary** (frozen answer of R44's reader; never machine prose, published or rated), optional `note` <=4,000 answering the lessons prompt (`plan.close.lessons`); no reader or a throwing one: `undetermined`, close lands
- R21 · project document may state `work_kinds` (`reporting`, `fixing`, `legal`, `oversight`, `other`), set by an owner (`projectAuthority(..,"owner")`); a `promotion` check refuses others `WORK_KIND_UNKNOWN`, a machine `MACHINE_CANNOT_SET_WORK_KIND`; read by suggestions, shown in `planRead`; gates nothing
- R22 · `noSuchPlan(planId,extra?)`: the one answer for no plan the caller may read, `standards` R17's form, row this module's
- R23 · invariant: a missed or `not_met` checkpoint is never recorded, projected or answered as a finding, a condition of the record or a fact about the government
- R24 · invariant: a machine proposes (R11) and nothing else; R43's marks the only other machine writes
- R25 · invariant: never published, unreachable from `publication` or any public read; an outsider is answered as for nothing (DEC-25)
- R26 · invariant: no cost, budget, amount, assignee, hours or significance score; keys `budget`, `cost`, `assignee`, `hours`, `significance`, `priority`, `score` refused `OPTION_KEY_REFUSED`
- R27 · invariant: every act is append-only history; each table declared to `record-core`'s purge
- R28 · invariant: an unsupplied fact is undetermined, never a default; no place named
- R29 · `optionDispose` takes `reminders` `[{date,on}]` (`on` a YYYY-MM-DD; none/empty = none), defaults the member sees and can change (DEC-77); a date not the option's, or a non-date day, `REMINDER_REFUSED`, whole act with it (R13), via `action-clocks.reminderRefused` (R4; N427). After R18 creates the action each is set by `reminderSet` (R4), the choosing member its author, never a field of the action's document (K624 (3)); fires as asked (`action-clocks` R5); a firing offers a further reminder or none (R6). Nearing deadline is display only; overdue notifies once (`queue-producers` R15); no outside channel (DEC-94 (3)); nothing reminds unless asked (DEC-69; K613-K615)
- R30 · planning run, mode `plan` (fills `ai-runs` R47; K660): `NO_SUCH_PLAN` (absent/unseen); `PLAN_NOT_OF_PROJECT`; `PLAN_CLOSED`; `projectAuthority(project,actor,"joined")`'s; a suspected-only plan is not refused (K590 ruling 10); R19 flags an outward option resting only on hypothetical subjects
- R31 · machine `optionPropose` names `run`: absent or not answered by `ai-runs.runFor` `PROPOSAL_NO_RUN`; not `running` `PROPOSAL_RUN_NOT_RUNNING`; not mode `plan` or another plan `PROPOSAL_RUN_OTHER_PLAN`; caller from the `principal` stamp not the run's (`run-rules` R5), its refusal; `PROPOSAL_BOUND_REACHED`; then R9's field refusals (all but author's); then `PROPOSAL_NO_SOURCE` for empty `sources` or a source (finding, determination, standard, consequence, plan or option id) unseen, alike. Then one transaction stores as R11 with run, skill version, `sources`, order place (`agent-worker` R52) and consumes `proposals` by one (`consumeBound`). A member's proposal needs no run
- R32 · each machine proposal in the tray (R34, `planRead`) carries `disclosure` "Suggested by the assistant (machine work) in run RUN-…, under skill version …. It is not the team's decision; it becomes an option only when a member adopts it." (filled), `why`, `sources`, `work_kinds` as when the run opened; no score. A `why` is never copied into a member's reason (R4, R9, R13, R20). An adopted option answers the same `disclosure` and `origin:{assistant:true,run,proposal,adopted_by,adopted_at}`; not carried onto the action or anything prepared from it
- R33 · invariant: proposals never become options, dispositions, scenarios, judgements, actions, filings or communications by themselves; every act but `optionPropose` refuses a machine by its code (R1, R9, R11, R13, R14, R16, R18, R20); `scenariosetaside`, `scenariorestore`, `planpause`, `planresume` refuse `MACHINE_CANNOT_PLAN`
- R34 · `planProposals({plan,run?,viewer})` (op=planproposals): `NO_SUCH_PLAN` (R22); a run not a planning run of this plan `PROPOSAL_RUN_OTHER_PLAN`; `run` absent = most recent; answers `{run,proposals}`: every proposal, each as R32 with whether adopted, in run order = strongest first (R31), no cut-off or paging (`after`, `next`, `PROPOSALS_CURSOR_REFUSED` retired), no score or rank; `planRead` answers them whole (K2443)
- R35 · invariant (K903 (4), DEC-36): `planRead` withholds what the viewer may not see whole: a subject (from `subjects`, each option's `subjects`/`subjects_liveness`, `available`), a superseded subject's successor, a started option's action; no id, state, placeholder or count; `out_of_view:true`; support `short` when conformance withheld a finding (its R24)
- R36 · member-facing sentences (refusal translations and details, R19 `says`, R32 disclosure, R37's answers) say "matter(s)", never "subject"; internal names (`subject(s)`, `PLAN_NO_SUBJECT`, `SUBJECT_*`, `OPTION_NO_SUBJECT`, `subject_removed`, ops) unchanged (DEC-114)
- R37 · `optionStartPreview({plan,option,kind,contact?,breach?,premise_override?,author,viewer})`: writes nothing; answers what R18 would do (the action document, R29's reminders, `would_start:true` or R18's refusal with code and translation); allocates no id, sets no reminder, promotes nothing (DEC-115)
- R38 · (K1466) `starts:{when_duty:{duty,occurrence?},state}`; `duty` a held `DUT-` the author sees else `NO_SUCH_DUTY` via `duties.noSuchDuty` (N601, K1650); `occurrence` one of its keys, absent = first `duties.occurrencesOf` derives with a trigger on or after the anchor's day (anchor = instant a judgement leading here was made, else when the scenario's current version was set; K1649); `state` `met`, `met_late`, `overdue`, `undetermined`. True, derived, never stored, when the latest `duties.transitionsOf` transition reads that state, else the derived state at read. Overdue = a question, never a violation; an uncertain due date `overdue` only after its latest candidate (K1444 (i)). `planRead` answers occurrence, state, derivation, whether it holds. The body's, never the group's (R23)
- R39 · `scenarioSetAside`/`scenarioRestore({plan,scenario,reason,author,viewer})`: reason per R4; refusals in order `MACHINE_CANNOT_PLAN`, `NO_SUCH_PLAN`, `PLAN_CLOSED`, `NO_SUCH_SCENARIO`, `PLAN_NO_REASON`, `SCENARIO_ALREADY_SET_ASIDE`/`SCENARIO_NOT_SET_ASIDE`; kept whole, never deleted; checkpoints not due (R17), checks not run (R19); restored = due again
- R40 · state `open|paused|closed` (edges open->paused, paused->open, open->closed, paused->closed). `planPause({id,reason,look_again?,author,viewer})`, `planResume({id,reason,author,viewer})`: member with reason; `look_again` YYYY-MM-DD; refusals as R20's, then `PLAN_NOT_OPEN`/`PLAN_NOT_PAUSED`. Paused: what the plan set running continues, checkpoints not due (R17), every other act open. `plansToLookAgain({nowMs,limit?})`: each paused plan whose `look_again` day has come, once, for `action-producers` (`plan-look-again`)
- R41 · offers for an infraction (suspected naming `standards`, or determined `noncompliant`/`unclear`): `planRead` answers `document_infraction` (first in order) and `chance_to_fix`, derived, never stored; adopted by `optionAdopt({offer:{subject,kind}})`. Chance to fix while the matter is not `fixed` (`plan-work` R2), whatever declined; after each later step with `offered_again:{step,at}`; never withdrawn; `compliant` has neither
- R42 · `optionStart` of any other outward option serving an R41 matter whose `document_infraction` option is not started takes `why_first` (1-500, R4's rule), recorded in history; else `DOCUMENT_FIRST_NO_REASON`; none asked once documentation is started
- R43 · `planMark({plan,marks,cause})` in process, `plan-work` R10 only: machine marks labelled machine work; `cause` `{action,ord}` or `"<action>#<ord>"`; mark `{kind,why,option?,scenario?,phase?,routes?}`, `kind` `option_changed`, `phase_start_holds`, `next_routes` (<=20), `why` 1-500; a malformed mark is skipped and named, not refused; absent plan `noSuchPlan`, closed `PLAN_CLOSED`. Changes no disposition, scenario, judgement or start (R24)
- R44 · `registerCloseSnapshot(module,fn)`: one registration (`membership.listenerRefusal`; `plan-work` R7); R20's close calls `fn({plan})` in its transaction, stores the answer as closing summary; a throwing `fn` = `undetermined`, close stands; a second registration refused
- R45 · `closingNotesOf({project,viewer})`: closing notes (R20) of the project's closed plans the viewer sees, newest first, <=50; read by the planning run (R30); none = `[]`
- R46 · (a) `planPause` writes `paused` as the document's `current_state`, `planResume` `open`, along `record-grammar`'s edge (R58) in the same act as its Plan Log entry; close from `paused` writes `closed`. (b) `plansToLookAgain` compares `look_again` with the local day of `nowMs` in the governing zone: `jurisdictions.governingZone(<active profiles>,<`team_time_zone`>)` (R98; `local-facts` R22), else `actions` R68's `place()`/`zoneOf`, else none, never the UTC day; no zone = no plan due (K5292)
- R47 · rows C-124.30 `SCENARIO_OUT_OF_RANGE`, C-124.58 `NO_SUCH_SCENARIO`, C-124.59 `SCENARIO_ALREADY_SET_ASIDE`, C-124.60 `SCENARIO_NOT_SET_ASIDE`, C-124.61 `PLAN_NOT_OPEN`, C-124.62 `PLAN_NOT_PAUSED`, C-124.2 `PLAN_NO_TITLE` take translations from `words.json` `refusal.<CODE>` by key, never a copy; codes, numbers, behaviour unmoved (DEC-194; N913; K3736); R20's note prompted by key `plan.close.lessons`
- R48 · `date_past` (date before the local day of the read's instant) and `date_before_phase` (before the local day the holding phase can start) compare on the plan's local day in the governing zone as R46 (b) (else `actions` R68; `civil-time.localDay`), never UTC; met by anything on the day; no zone = each `undetermined` with reason (R28), never UTC nor omitted (N964)
- R49 · C-124.63 `DOCUMENT_FIRST_NO_REASON` stays the one code for both R42 arms (`why_first` absent; malformed: quote, backslash, line break, >500); translation = `words.json` `refusal.DOCUMENT_FIRST_NO_REASON` by key (DEC-199); unmoved otherwise; waits for T48's stamp
- R50 · `planRead` of a closed plan answers `closed:{at,by,reason,note,summary}`: `at` the instant R20's close was recorded (own clock), `by` the closing member, `reason`, `note`, `summary` as stored (`undetermined` for a plan closed before summaries); not closed = no `closed` key; `closed.at` is read by `following` (N966)
- R51 · `planAsk({plan,author,viewer})` (op=planask; N1043; K3149): opens one planning run (`ai-runs.open` mode `plan`, its R46; context the plan's project, `plan`, `actor` the member; principals as `ai-runs` R52). Refusals in order, nothing written: `MACHINE_CANNOT_PLAN`; `NO_SUCH_PLAN`; `PLAN_CLOSED`; then `ai-runs.open`'s incl. R30's (`AI_RUN_MODE_NOT_DEPLOYED`). While a planning run of this plan is `running` it opens none and answers that run `existed:true`. Answers `{ok,plan,run,started}`; records no option, proposal or disposition
- R52 · (T51; K4168) `DECLARED_OPS` exported beside the ops map: frozen, keyed by door name, each `{classes,machineClasses?,mutating,weight,description,fields:{accepts,requires}}` copied from the op's rows, fields read from the arm whole: `planopen`, `plansubjectadd`, `planclose`, `optionadd`, `optiondispose`, `scenarioset`, `checkpointrecord`, `optionstart`, `optionstartpreview`, `planask`
- R53 · (T51; K4206) `DECLARED_OPS` holds `optionadopt`: `accepts` `proposal`, `offer`, `plan` and R9's body fields; `requires` one of `proposal` or `offer`, the absent one `NO_SUCH_PLAN_PROPOSAL` naming it; offer form also needs `plan`
- R54 · (T51; K5271, K5277; amends R9, R18) starting a chosen option stating tier 1, 2 or 3 records it on the action as its first risk-tier history entry, by the starter, same transaction; none = undetermined; addressee with empty role or organisation `ADDRESSEE_INCOMPLETE` naming the field (distinct from `ADDRESSEE_REFUSED`); each `date_before_phase` check carries `start` (null when undetermined)
- R55 · (T53; AIR28, BR27; K5571 (6); `agent-steps` R54; amends R11; not yet met) `optionPropose` accepts `idem` (`<run>:<pass>:<step>:<n>`); a call with an `idem` this principal already sent answers the first call's answer verbatim with `repeated:true`, no second proposal; a changed candidate carries a new `idem` and stores its own; no `idem` = R11 as today
- R56 · (T53; AIR25, BR29; `agent-steps` R56; owed line for BOB; not yet met) `optionPropose` accepts `produced_by` (labels of the conversations that produced it, deduplicated, in order, as `agent-model` answered), stored with the proposal and answered as stored, `null` for a member's own (R31); malformed `PLAN_PRODUCED_BY_MALFORMED` (number BOB's), nothing stored; repeated `idem` (R55) answers the first proposal's list

Private. Uses (R-cited): services as in the sections below; `leg-earning` `projectsDrawingOn` read directly, not through inquiry's delegate (K1661); `actions` `place`, `zoneOf`, `contactNotAMember`, `contactId`; `filings` `availableActions` (never a catalogue, Bob 2026-09-29; R41); `membership` `listenerRefusal` (R44); `record-grammar` `isMachineIdentity`, `proposalLabel`, `PLN-`.
Satisfies (R-cited): Action v0_1 §3, §4 rules 1, 2, 3, 5, 8, 9, 10, 12, §5 row 11; Action v0_2 §3 (R14, R39), §4 rules 1-4, 9, 12, 16, 17, 19, 20 (R20, R40-R45), every option listed (R34); Actions D6b, D11b, D14, D17, D19, D21, D25-D27; Functional Architecture v3 Layer 3; Roadmap v5 §5, §10; Design Requirements v2 Req. 5, 12; DEC-94, DEC-10, DEC-69, DEC-70, DEC-77 (R17, R29); DEC-114, DEC-115; DEC-24 to DEC-27.
Suggestions: tables `plans`, `plan_subjects`, `plan_options`, `plan_option_revisions`, `plan_option_proposals`, `plan_scenarios`, `plan_checkpoints`, `plan_history` (R27); suggestions from an AI run (`skills` R28; K660 (4)) via `optionPropose` only (R31); `values.mjs`:124, :163 still say "subject" (R36); `actionPlansOps` (K671; `control-plane` R17, R29); page cap 200 (R7).

## Uses: record-grammar

Purpose: shared grammar (ids, types, canonical JSON, actor identity, the one SHA-256); no store or clock. No service named (R11, R46).

## Uses: jurisdictions

Purpose: holds the jurisdiction profiles (local facts as data with their measurement); no other module names a place. `combine(list) -> {ok:true,view,conflicts}|{ok:false,errors}` (`list` = active profiles in order, ids or objects; an instance setting). Cap-compressed (block R12-R139).
- R12-R16 · unheld id `UNKNOWN_PROFILE`; failing `validate` or one `id` twice `INVALID_PROFILE`; non-array `NOT_A_LIST`; unknown field `UNKNOWN_SECTION`; `view` has profile shape plus `profiles`, `covers`, `test`, each fact its `profile`; list facts unioned in order, an equal entry kept once; one-value-per-key facts kept only when all givers agree, else withheld and in `conflicts` `{at,values:[{profile,value,basis}],says}`; combine never chooses; empty list `ok:true`, no facts, consumers answer undetermined
- R29, R34 · kind `tier`, `venue`, `template`; deadline `days`, `count`, `starts` under one `rule`/`applies_to`; `extension`, `advisory`, `evidence`, office `oversight`/`hours`, `holidays` year `days`: one value per key (R15), disagreement withheld, a count into it undetermined; `label`, `citation` joined `; `; `laws`, `legal_organisations` unioned
- R98 · `governingZone(profileIds,teamZone)` pure, exported: `teamZone` when an R41 value (IANA name or `UTC`); else `time_zone` of `combine(profileIds)`'s view when it combines; else `null`; never throws
- R95-R97, R99-R108, R121 · FOIA in the first profile; `response`, `label`; layers `layer:{level,place,within?,origin}` (`LAYER_INVALID`, `LAYER_LEVEL_MISMATCH`, `LAYER_ID_TWICE`, `LAYER_FEDERAL_TWICE`, `LAYER_PARENT_MISSING`, `LAYER_PARENT_LEVEL`, `LAYER_CYCLE`, `LAYER_NO_FEDERAL`, `LAYER_TEAM_TWICE`); `NAME_AMBIGUOUS`; `CLOSURES_UNKNOWN`; `LEVEL_UNKNOWN`; `nameResolve({section,name,layer?,asking?,layers})` pure: `{ok:true,layer,entry}`, `NAME_UNKNOWN`, `NAME_AMBIGUOUS`
- R115-R117, R123-R139 · one team layer (`TEAM_LAYER_SECTIONS`, `TEAM_SECTION_REFUSED`), a team value against a shipped one kept only when equal; `fiscal_year` per government, never a default; text attribution (`GUIDE_UNATTRIBUTED`, `TEMPLATE_COURT_PETITION`), `REGISTER_*`, `use_limits`; `proceeding_kinds` never filled in (R139)

## Uses: record-core

Purpose: the record's storage (ids, leases, append-only history, purge); no member, fence or promotion write path.
- R1 · `allocId(prefix,year) -> {id}`: `<prefix>-<year>-N` (sequential prefix or one `ID_TABLE` lacks), next unused, zero-padded to four digits never cut, no ceiling, a number never reissued; opaque prefix R76's id
- R2 · `allocId` takes the same step in a caller's transaction; never throws
- R21 · `declarePurge(module,tables,{exempt?})`: `purge` `exempt` if listed else `clear`; `expunge` `none`; `export` `admin-only`; `sight` `bundle` if keyed to a bundle else `group`; `derive` `stored`; `version_chain` `false`; twice or by two modules `TABLE_DECLARED`
- R32 · `transact(fn)`: one transaction; throw or `ok:false` rolls back every row and spends no id; nested joins
- R47 · `stampInstant(precision,when?)`: `"second"` `YYYY-MM-DDTHH:MM:SSZ`, `"millisecond"` `…SS.sssZ`, UTC; other precision throws

## Uses: membership

Purpose: who the members are and may do; projects, the fence.
- R78 · `noSuchProject(projectId,extra?)`: `{ok:false,reason:"NO_SUCH_PROJECT",code,check,translation,project,detail}` when no project answers or sight is not `FULL`; `extra` never replaces; never throws

## Uses: promotion

Purpose: the one write path for a bundle (compare-and-swap, append-only, all-or-nothing).
- R39 · `registerStep(module,{check?,project?})`: once at start; `check` before the write, `project`ion after, in the one `transact`; a refusing check refuses with its own `reason`; module order; twice `STEP_DECLARED`

## Uses: provenance

Purpose: the trust root: register of captured bytes, receipts, capture grade; a hop attests bytes, address, time, never credibility. No service named (R1).

## Uses: inquiry

Purpose: the recursive object of case-making: legs, grading, supersession; no version, conclusion or strength. No service named (R1, R5, R8).

## Uses: leg-earning

Purpose: what the record can earn for a leg; the cycle walk; projects drawing on a question.
- R7 · `projectsDrawingOn(id)`: projects with a non-severed `cites` reference, over every project whatever the viewer sees, <=32, first by id, `truncated` when more; a severed citer takes no slot
- R4 · `basisFor(id,{limit?})`, `restingOn(targetId)` (`confirmed`/`severed`): in-process, not gated; R5 `restsOnLive`; R6 `cyclePath(id,targets)` first cycle `[id,target,…,id]` else null

## Uses: strength

Purpose: a claim's worth derived, never stated: pair (capture, connection; DEC-21), testimony beside; holds the project bar `projectBar`. No service named (R1).

## Uses: run-rules

Purpose: the AI run's rules without a store; `runPrincipalGate` (R5) used by R31. No service named.

## Uses: ai-runs

Purpose: the AI run: durable, bounded, attributed.
- R9 · `open({...,mode,actor,viewer})` refusals in order, nothing written: `AI_RUN_NO_CONTEXT`; membership's existence refusal; `run-rules` R7, R6; `AI_RUN_CAPABILITY_UNAVAILABLE`; `run-rules` R8, R3; R45; `AI_RUN_ALREADY_OPEN`; `AI_RUN_RERUN_SELF`/`_UNKNOWN`/`_OTHER_CONTEXT`; T53 (not yet met): `principal_ai`, `principal_ai_ref`
- R10 · success writes run, bounds, manifest, bar, lens in one transaction; answers `{run,started,status,ticks,created,expires,rerun_of?,projectGate}`
- R40 · undeployed mode `AI_RUN_MODE_NOT_DEPLOYED` (`check`, `plan` today) after `run-rules` R8, before any write; T53 adds `PART_NOT_PASSED`
- R46 · mode `plan` takes `plan`; `AI_RUN_PLAN_REQUIRED`; other mode `AI_RUN_PLAN_UNEXPECTED`; context not `project` `AI_RUN_PLAN_NEEDS_PROJECT`; no member `AI_RUN_PLAN_NEEDS_MEMBER`; then R47's check; `fetches`/`subsessions` 0 else `AI_RUN_PLAN_NO_SEARCH`
- R47 · `registerOpenCheck(module,mode,fn)`: `fn({contextType,contextId,plan,actor,viewer}) -> null|refusal`, applied last; mode `plan` with none `AI_RUN_MODE_UNCHECKED`
- R19 · `read({run,viewer})`: absent/invisible `{found:false,session:null}`; else `session` incl. `principal`, `state`, `rerun_of`
- R42 · `hiddenRuns(viewer) -> {sql,args}`: excludes runs R19 answers `found:false`; fail closed
- R43 · `onRunOpened(module,fn)` once; run in module order after a successful `open`, a throwing listener changes nothing

## Uses: standards

Purpose: what a government act is measured against; judges nothing.
- R5 · `standardRead({id,viewer})`: fields, source, supersession, `content.standings`, `passageNotice`; `STANDARD_NO_ID`; absent or non-member `NO_SUCH_STANDARD`, one answer (R17)

## Uses: conformance

Purpose: a member's determination (never a machine's) that an act is compliant, noncompliant or unclear per standard.
- R9 · `determinationRead({id,viewer})`: outcomes per standard, findings' edition and pair, supersession, `basis_changed`, `cured_by`/`cures`; absent/invisible `NO_SUCH_DETERMINATION`, one answer (R19); unseen withheld whole (R24)
- R11 · `determinationsFor({project?,act?,standard?,finding?,outcome?,live?,after?,limit?,viewer})` <=200 a page
- R19 · `noSuchDetermination(determinationId,extra?)`: `{ok:false,reason:"NO_SUCH_DETERMINATION",code,check,translation,determination,detail}` (C-113.15); never throws

## Uses: actions

Purpose: the Action object (State Rules v1.5 §4.4): what the group sends outside, to whom, deadlines, response; a member decides every move.
- R43 · `noSuchAction(actionId,extra?)`: `{ok:false,reason:"NO_SUCH_ACTION",code,check,translation,action,detail}` (C-117.2); never throws

## Uses: action-clocks

Purpose: deadlines across actions and members' reminders, fired as asked; `reminderSet`, `reminderRefused` (its R4) used by R18, R29. No service named.

## Uses: filings

Purpose: what the group sends, prepared from the record; a member files.
- R21 · `availableActions({determination,viewer})`: R15's block for a live determination; `NO_SUCH_DETERMINATION` or `DETERMINATION_UNREADABLE`

## Uses: escalation

Purpose: stages from a live noncompliant determination to its end.
- R2 · `escalationRead({id,nowMs?,viewer})` `{id,state,stage,history,standards,actions,triggers,proposed,exit}`; nothing stored; `NO_SUCH_ESCALATION`

## Uses: duties

Purpose: the obligation object `DUT-`; overdue is a question, never a violation (R38). No service named.

## Uses: civil-time

Purpose: the one civil-time engine; pure; `localDay` (R46, R48). No service named.

## Uses: setup-words

Purpose: the interface word list as frozen data (R36, R47). No service named.

## Uses: test-support

Purpose: test sandbox and shared fixtures (R52). No service named.

## Uses: retrieval

Purpose: the query language over the record; mints nothing. No service named.

## Uses: basis-versions

Purpose: an inquiry basis's frozen versions and its CURRENT version. No service named.
