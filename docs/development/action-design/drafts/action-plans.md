# action-plans — requirements

**Status** · Reviewed by Bob 2026-09-30: "correct and complete enough". DRAFT by ACTION_DESIGN #1, 2026-09-30, from `docs/development/action-design/ACTION-PLAN.md` (rules A1–A17) and Bob's rulings of 2026-09-29 (1–10) and 2026-09-30 (D1–D6, `MATRIX.md` §6); for BOB's review and fold. Adding the module is BOB's (Bob, 2026-09-30: a technical detail); the closing rule R20 was approved by Bob 2026-09-30. Layer 9 (Action), last, after `escalation`. A new module: no `from`, nothing moves. Code today: none; the nearest is `escalation`, whose record-object pattern it follows. Ids may renumber until Bob approves (conventions, rule 6).

**Size (P6).** New. Estimated 900–1,400 lines of code with its tables; one session reads it with the public parts of `conformance`, `consequences`, `actions`, `escalation`, `filings`, `inquiry`, `jurisdictions`, `membership`, `record-core` and `promotion`.

## Public

### Purpose

An action plan is a project's working material for deciding what to do about one or more matters: an inquiry still open (a suspected matter) or a determination's outcomes (determined). It holds options the assistant suggests or a member adds, each bound to the matters it serves; the member's choice of which to pursue; up to three scenarios laying the chosen options out over time, with checkpoints a member judges; and the link from each started option to the Action it created. It is not a project-management system: it holds no costs, assignees or hours. It is never published. The gate stays at the outward act (DEC-26): a plan may rest on what is not yet established; an action asserting a breach may not.

### Provides

Terms. A **subject** is `{kind: "inquiry", inquiry, act?, standards?}` (suspected) or `{kind: "outcome", determination, standard}` (determined: one standard's outcome of a live determination, `compliant`, `noncompliant` or `unclear`). Its **support** is `established` (determined), `short` (determined, a finding short of the project's bar) or `hypothetical` (suspected). A **category** is one of `mitigation`, `legal`, `awareness`, `journalistic`, `grassroots`, `other`. A **regulated date** is `{date: YYYY-MM-DD, basis}`, the basis naming the statute, order or commitment. A **checkpoint** is relative: `{after_days}` counted from its phase's start. A refusal is `{ok: false, reason, code, check, translation, ...}`.

**planOpen({project, subjects, title, author, viewer})** (`op=planopen`)
- **R1** Refusals in order: `MACHINE_CANNOT_PLAN` (a machine or unstamped author); `PLAN_NO_TITLE` (empty, over 200 characters, or a quote, backslash or line break); `NO_SUCH_PROJECT`; `membership.projectAuthority(project, author, "joined")`'s refusal; `PLAN_NO_SUBJECT` (an empty list, or over 50); `SUBJECT_MALFORMED` (with its index); `NO_SUCH_INQUIRY` or `NO_SUCH_DETERMINATION` (a subject the author may not see, answered alike); `SUBJECT_NOT_OF_PROJECT` (an inquiry or determination of another project); `SUBJECT_NOT_LIVE` (a superseded determination, a closed inquiry); `SUBJECT_IN_ACTIVE_PLAN` (R3, naming the plan).
- **R2** Otherwise it records a plan of type `PLN-`, state `open`, with its project, title, subjects in order, author and time (this module's clock), and answers `{ok, id, subjects: [{subject, support}]}`.
- **R3** Within a project, a subject is in at most one open plan. Two subjects are the same when they name the same inquiry, or the same determination and standard. Another project may hold the same subject in its own plan.

**planSubjectAdd / planSubjectRemove({plan, subject, reason, author, viewer})** (`op=plansubjectadd`, `op=plansubjectremove`)
- **R4** Each takes R1's author, project and subject refusals, `NO_SUCH_PLAN`, `PLAN_CLOSED`, and `PLAN_NO_REASON` (empty, over 500 characters, or a quote, backslash or line break). Removing a subject that options still serve is allowed; those options keep it and are marked `subject_removed` in R8.
- **R5** When a determination is recorded on the act of a suspected subject's inquiry (`conformance.determinationsFor({act})`), `planRead` answers the determined outcomes beside the suspected subject as `determined_since`, and a member adds them with R4; nothing is added or removed without a member.

**planRead({id, nowMs?, viewer})** (`op=plan`); **plansFor({project?, subject?, state?, after?, limit?, viewer})** (`op=plans`)
- **R6** `planRead` answers the plan's title, state, subjects with their support and liveness, options (R9) with their dispositions, proposals apart (R11), scenarios (R14), each started option's action with its lifecycle state and each determined subject's escalation stage (`actions.actionRead`, `escalation.escalationRead`), the checks (R19), and its history (every act, oldest first, with who, when and why). `NO_SUCH_PLAN` for an absent id or one the viewer may not see, one answer (R22).
- **R7** `plansFor` lists plans the viewer may see, in id order, at most 200 per page, `truncated` measured by reading one past; `subject` finds the plans holding it.
- **R8** Liveness is derived when read, never stored: a subject is `live`, `superseded` (naming its successor), `closed` (an inquiry), or `subject_removed`; an option bound only to subjects no longer live says so.

**optionAdd({plan, summary, detail, category, subjects, addressee?, dates?, tier?, enforces?, author, viewer})** (`op=optionadd`); **optionRevise({plan, option, reason, ...fields, author, viewer})** (`op=optionrevise`)
- **R9** Refusals in order: `MACHINE_CANNOT_ADD_OPTION`; `NO_SUCH_PLAN`; `PLAN_CLOSED`; `projectAuthority(..., "joined")`; `OPTION_NO_SUMMARY` (empty or over 200 characters); `OPTION_DETAIL_TOO_LONG` (over 5,000); `CATEGORY_UNKNOWN`; `OPTION_NO_SUBJECT` (none, or one not in the plan); `ADDRESSEE_REFUSED` (R10); `DATE_REFUSED` (not `YYYY-MM-DD`, or no basis); `TIER_REFUSED` (a tier on a non-legal option, or not 1, 2, 3 or `undetermined`); `LOBBYING_NO_REQUIREMENT` (R12); `OPTION_KEY_REFUSED` (R21). A legal option with no tier stated reads `undetermined`, never a default. `optionRevise` records the new fields as a revision with its reason; earlier revisions stay readable.
- **R10** An addressee is `actions`' addressee shape (`actions` R9 as amended by D1): an office by role and body, a reporter or outlet, an organisation or another civic group by role and organisation, or a described audience; never a private individual.
- **R11** `optionPropose({plan, ...R9's fields, why, proposer, viewer})` (`op=optionpropose`): any credential may propose. The proposal is stored apart from the options, labelled with its proposer and whether it is machine work (`legacy-checks`' `proposalLabel(proposer, "plan_option")`), with a `why` of at most 500 characters; it is never an option, and is answered with a sentence saying so. `optionAdopt({proposal, author, viewer, ...overrides})` (`op=optionadopt`) is R9 by a member naming the proposal; the option records the proposal it came from, and a proposal is adopted at most once.
- **R12** An option whose detail or category states lobbying names, in `enforces`, the standard (a `standards` id) or the determined subject whose requirement it enforces or restores; without one it is refused `LOBBYING_NO_REQUIREMENT` (ruling 6). The module never judges whether text is lobbying; the member marks it (`lobbying: true`).

**optionDispose({plan, options, disposition, reason?, author, viewer})** (`op=optiondispose`)
- **R13** A disposition is `open` (the default), `chosen`, `declined`, `done` or `blocked`; `declined` and `blocked` need a reason (R4's rule), the others refuse one over 500 characters. Several options may be disposed of in one act, all or none. Every change is kept in the option's history. `NO_SUCH_OPTION` names the first unknown option.

**scenarioSet({plan, scenario, name, phases, author, viewer})** (`op=scenarioset`); **checkpointRecord({plan, scenario, phase, judged, note, author, viewer})** (`op=checkpointrecord`)
- **R14** A plan holds at most three scenarios, numbered 1–3; `scenarioSet` replaces one whole, keeping the earlier version in history. A phase is `{id, name, options, starts, checkpoint?, condition?, branches?}`: `options` are chosen options of the plan; `starts` is `plan_start`, `{after: phase}` or `{branch_of: phase, when: "met" | "not_met"}`; `checkpoint` is `{after_days}`, 1–3,650; `condition` is words of at most 500 characters; `branches` names the phase each judgement leads to. Refusals: `SCENARIO_OUT_OF_RANGE`, `PHASE_MALFORMED` (with its index), `PHASE_OPTION_NOT_CHOSEN`, `PHASE_CYCLE` (a phase reachable from itself), `BRANCH_UNKNOWN`.
- **R15** A branch may name another subject's track: `starts: {when_subject: subject, reaches: "resolved" | "stage", stage?}`, true when that subject's escalation reaches the stage or its started action is resolved (R6's reads); it is derived when read.
- **R16** `checkpointRecord` records a member's judgement (`met` or `not_met`) with a note of at most 500 characters: `CHECKPOINT_NOT_DUE` before the phase's start plus `after_days`, `CHECKPOINT_JUDGED` if judged already. The scenario then reads the branch the judgement names. The module never judges a condition.
- **R17** `checkpointsDue({nowMs, limit?})` answers, for open plans, the checkpoints whose day has come and that no member has judged, oldest first, at most 500, with the plan, scenario, phase and days since due. It is the one read `queue` uses for its reminder (one item per checkpoint, reaching members as Bob's notification rulings provide: DEC-10, DEC-69, DEC-70 and DEC-94). A checkpoint passed unjudged is never a finding about the government (R23).

**optionStart({plan, option, kind, contact?, breach?, author, viewer})** (`op=optionstart`)
- **R18** Refusals: `MACHINE_CANNOT_START`; `NO_SUCH_PLAN`; `PLAN_CLOSED`; `NO_SUCH_OPTION`; `OPTION_NOT_CHOSEN`; `OPTION_STARTED` (it names the action); `CONTACT_NOT_A_MEMBER`; then any refusal of the action's write (`actions` R1–R11). Otherwise it composes an action document (kind, the option's addressee, the option's regulated dates as pending clock entries with their bases, a `rests_on` leg to each subject's inquiry or determination, `plan` and `option`, `contact` when given, the reminders R29 set, `breach: true` when asked) and promotes it; an action asserting a breach is refused by `actions` R8 unless it rests on a live noncompliant determination or the member states an override with a reason (`actions` R8 as amended, Bob 2026-09-30), which the action and everything prepared from it disclose. It records the link and answers the action's id. The plan never opens, advances or ends an escalation.

**The checks (derived on read, R6)**
- **R19** `planRead` answers, each with its reason: an option whose regulated date is past, or falls before the phase that holds it can start in a scenario; a phase whose judgement has no branch for one outcome; an option bound only to subjects no longer live; an outward option (one that addresses anyone) bound only to hypothetical subjects; a scenario whose outward options have no branch answering a hostile response (refusal, obstruction, retaliation; rule 12 of `BIO_Action_v0_1.md`, Bob 2026-09-30); a lobbying option whose `enforces` target is superseded. A check informs; it never refuses or changes anything.

**planClose({id, reason, author, viewer})** (`op=planclose`)
- **R20** A member closes a plan with a reason (R4's rule); a plan never closes itself. A closed plan stays readable; its subjects become free to join another plan (R3). `PLAN_CLOSED` if already closed. Closing does not change any action or escalation. *(Bob, 2026-09-30)*

**The project's kind of work (D4)**
- **R21** A project document may state `work_kinds`, a list from `reporting`, `fixing`, `legal`, `oversight`, `other`, set by an owner; this module registers a check with `promotion` refusing any other value `WORK_KIND_UNKNOWN` and a machine's change `MACHINE_CANNOT_SET_WORK_KIND`. It is read by the assistant's suggestions (R11's proposer may be given it) and shown in `planRead`; it gates, filters and orders nothing.

**Reminders, set when an option is chosen** (Bob, 2026-09-30, K613–K615; DEC-94)
- **R29** Choosing an option that carries regulated dates (R13) includes setting its reminders: for each dated entry, whether and when the member wants to be reminded, from defaults the member sees and can change at that moment (nothing preselected unseen, DEC-77). The schedule is the member's own request; it is carried to the action R18 creates, and fires as asked. When a reminder fires, its response offers another reminder at a further time the member picks, or no further reminder (DEC-10, recorded in `NOTIFICATIONS.md` at D-125); a further reminder is one the member accepts, perhaps at the system's suggestion. A deadline coming near changes the item's position, colour or wording only, which is display, not a notification; "due within N days" is not new unless the member asked for it; an overdue date is new and notifies once (DEC-10, DEC-94). No outside channel (email, push) is used (DEC-94 (3)). Nothing reminds unless the member asked (DEC-69).

**noSuchPlan(planId, extra?) → refusal**
- **R22** The one answer to "no plan the caller may read answers to this id", in `standards` R17's form, its catalogue row this module's.

## Private

### Uses

- `record-core`: `allocId`, `transact`, `stampInstant`, `declarePurge`.
- `membership`: `projectAuthority`, `viewerPredicate`, `sight`; `noSuchProject`.
- `legacy-checks`: `isMachineIdentity`, `proposalLabel` (subject `plan_option`); the `PLN-` type registration.
- `promotion`: `promote` (a plan being a record object; R18's action; R21's check).
- `inquiry`: an inquiry's visibility, project and state (R1, R5, R8).
- `strength`: `projectBar`, for `short` support (the project's bar against a finding's strength).
- `conformance`: `determinationRead`, `determinationsFor`; `noSuchDetermination`.
- `standards`: `standardRead` (R12's `enforces`).
- `actions`: `actionRead`, the addressee shape (R10); `noSuchAction`.
- `escalation`: `escalationRead` (R6, R15).
- `filings`: `availableActions` (shown beside legal options; never a catalogue, ruling 2).
- `jurisdictions`: `combine`'s view: `deadlines`, `legal_organisations`, for the assistant's suggestions; nothing here names a place.

### Invariants

- **R23** A plan's checkpoints are the group's own intentions: a checkpoint missed or judged `not_met` is never recorded, projected or answered as a finding, a condition of the record or a fact about the government.
- **R24** A machine proposes (R11) and nothing else: it never adds, revises, disposes, schedules, judges, starts or closes.
- **R25** A plan is never published: it is not reachable from `publication` or any public read, and an outsider asking for it is answered as for something that does not exist (DEC-25).
- **R26** No field, input or answer holds a cost, budget, amount of money to be spent, assignee, hours or significance score; a key named `budget`, `cost`, `assignee`, `hours`, `significance`, `priority` or `score` is refused `OPTION_KEY_REFUSED` (rulings 3, and DEC-24 on significance).
- **R27** Every act is append-only history; each table is declared to `record-core`'s purge.
- **R28** A fact not supplied is answered undetermined, never a default; no place is named in this module's behaviour or outward text, and its tests run against the test profile.

### Satisfies

- `BIO_Case_Making_v0_1.md`, §THE ACTION PLAN (Bob, 2026-08-03), as changed by Bob's rulings of 2026-09-29 and 2026-09-30.
- `BIO_Functional_Architecture_v3.md`, Layer 3: Action ("turn findings into outputs").
- `BIO_Complete_Roadmap_v5.md` §5 (Operational Principles 1, 3, 6) and §10 ("Humans make every decision").
- `BIO_Design_Requirements_v2.md`, Requirements 5 and 12.
- DEC-25 (never published), DEC-26 (the gate at the act), DEC-24 and DEC-27 (the assistant proposes, the member acts), DEC-69 (singly or in bulk, forced into neither).
- `build/layers.md`, layer 9, as amended (`deltas.md` §1).

### Suggestions

- Id prefix `PLN-`, states `open` and `closed`, one edge open→closed; tables `plans`, `plan_subjects`, `plan_options`, `plan_option_revisions`, `plan_option_proposals`, `plan_scenarios`, `plan_checkpoints`, `plan_history`.
- The assistant's suggestions (R11) come from an AI run the `skills` job adds; its inputs are the subjects, the standards' text, the consequences, the project's `work_kinds`, the profile's deadlines and legal organisations, and earlier plans of this instance on similar standards. It writes through `optionPropose` only.
- Tests: each refusal with a negative control; R3 across two projects; R15 with an escalation fixture; R17 at and past a checkpoint's day, and never twice; R23 by showing no queue FINDING or CONDITION is minted from a missed checkpoint; R26's refused keys.

## Open for Bob

None: R20 approved by Bob 2026-09-30; every other point follows his rulings of 2026-09-29 and 2026-09-30.

## Decided (for BOB to confirm and record)

- Adding the module, last in layer 9 after `escalation` since it reads every layer-9 module (BOB's: Bob, 2026-09-30).
- Proposals follow `standards` R9's pattern with `proposalLabel` subject `plan_option`.
- Page cap 200; history cap none (a plan's history is short).
