# Tests the drafts require

**Status** · DRAFT by ACTION_DESIGN #1, 2026-09-30, for the jobs that build `drafts/action-plans.md` and `drafts/deltas.md` (P7: every requirement tested at the module's interface, never its source text). Each line names the requirement, what the test shows, and its negative control (the same call with the one fact that should refuse it). Fixtures: the test profile only (`jurisdictions` test profile); a project with an owner, a joined participant, an invited non-joined member and a machine credential; one open inquiry; one published case with a live determination holding a `noncompliant`, a `compliant` and an `unclear` outcome.

## `action-plans`

| req | test | negative control |
| --- | --- | --- |
| R1 | each refusal fires, in order, one test per code (`MACHINE_CANNOT_PLAN`, `PLAN_NO_TITLE`, `NO_SUCH_PROJECT`, the joined-authority refusal, `PLAN_NO_SUBJECT` at 0 and 51, `SUBJECT_MALFORMED`, `NO_SUCH_INQUIRY`/`NO_SUCH_DETERMINATION` for absent and invisible alike, `SUBJECT_NOT_OF_PROJECT`, `SUBJECT_NOT_LIVE`, `SUBJECT_IN_ACTIVE_PLAN`) | the valid call lands; two faults at once answer the earlier code |
| R2 | a plan opens with an inquiry subject (support `hypothetical`) and an outcome subject (`established`); the answer lists both | a title of 201 characters refuses |
| R3 | a second plan in the same project naming the same outcome refuses, naming the first; another project's plan with the same subject lands; after R20 closes the first, the same project's second plan lands | the same determination with a different standard lands |
| R4 | add and remove land with a reason; removing a subject an option serves marks the option `subject_removed` | no reason refuses `PLAN_NO_REASON`; a closed plan refuses `PLAN_CLOSED` |
| R5 | after a determination is recorded on the inquiry's act, `planRead` shows `determined_since`; the plan's subjects are unchanged until R4 | before the determination, `determined_since` is absent |
| R6 | `planRead` returns every named part, including a started option's action state and a subject's escalation stage; history oldest first with who, when, why | an invited non-joined member of another project gets `NO_SUCH_PLAN`, identical to an absent id |
| R7 | pages of 200, `truncated` by reading one past; `subject` filter finds the plan | a limit above 200 is capped |
| R8 | superseding the determination shows `superseded` naming the successor; closing the inquiry shows `closed`; nothing is stored (read twice around the change) | an untouched subject reads `live` |
| R9 | each refusal fires in order; a legal option with no tier reads `undetermined`; `optionRevise` keeps the prior revision readable | a tier on an awareness option refuses `TIER_REFUSED` |
| R10 | each addressee arm lands (office, press, organisation, group, audience) | a named person with no role and organisation refuses `ADDRESSEE_REFUSED` |
| R11 | a machine proposal is stored apart, labelled machine work, absent from options; a member adopts it once; the option names the proposal | a second adoption refuses; a machine calling `optionAdopt` refuses |
| R12 | a lobbying option naming a held standard in `enforces` lands | the same option without `enforces` refuses `LOBBYING_NO_REQUIREMENT` |
| R13 | bulk choose of three options lands all; `declined` with a reason lands; history keeps each change | bulk with one unknown option changes none (`NO_SUCH_OPTION`); `declined` without a reason refuses |
| R14 | a three-phase scenario with a checkpoint and both branches lands; a fourth scenario refuses | a phase holding an unchosen option refuses `PHASE_OPTION_NOT_CHOSEN`; a cycle refuses `PHASE_CYCLE` |
| R15 | a phase starting when another subject's escalation reaches stage 5 reads not started, then started after the escalation advances | a subject not in the plan refuses `BRANCH_UNKNOWN` |
| R16 | on the checkpoint's day a member judges `not_met`; the scenario reads the `not_met` branch | a day early refuses `CHECKPOINT_NOT_DUE`; judging twice refuses `CHECKPOINT_JUDGED`; a machine refuses |
| R17 | `checkpointsDue` lists the due, unjudged checkpoint once, oldest first, with days since due | after judging, it is absent; a closed plan's checkpoint is absent |
| R18 | starting a chosen option creates an action with the option's addressee, dated clock entries with bases, `rests_on` legs, `plan` and `option`, and `contact`; the plan records the link | an unchosen option refuses `OPTION_NOT_CHOSEN`; `breach: true` on an inquiry-only subject is refused by `actions` R8 |
| R19 | each check appears with its reason (past date, unbranched outcome, dead subject, outward option on hypothetical subjects, superseded `enforces`) and changes nothing | a plan with none of these answers no checks |
| R19b | a scenario whose outward options have no branch for a hostile response is flagged | adding a `not_met` branch to a refusal clears it |
| R29 | choosing a dated option shows default reminders the member can change; the schedule reaches the action R18 creates and fires as asked; the response offers another reminder or none; an overdue date notifies once; a nearing date changes display only | nothing reminds when the member set none; a machine setting reminders refuses; no outside channel is used |
| R20 | a member closes with a reason; the plan stays readable; its subjects join a new plan | no reason refuses; closing twice refuses `PLAN_CLOSED`; a machine refuses; nothing closes a plan on its own (advance the clock a year: still open) |
| R21 | an owner sets `work_kinds: ["reporting"]`; `planRead` shows it; a proposal made with and without it lands identically in R11's checks | an unknown kind refuses `WORK_KIND_UNKNOWN`; a machine refuses |
| R22 | every `NO_SUCH_PLAN` site answers through `noSuchPlan`, one code and sentence | an existing visible plan never answers it |
| R23 | a checkpoint passed unjudged produces no queue FINDING or CONDITION and no record fact (read `queue` and the record after the day passes) | the reminder (R17) is present |
| R24 | every act with a machine credential refuses, except `optionPropose` | `optionPropose` by a machine lands |
| R25 | the public read path and `publication` answer nothing for a plan id, exactly as for a non-existent id | a joined member reads it |
| R26 | each refused key (`budget`, `cost`, `assignee`, `hours`, `significance`, `priority`, `score`) refuses `OPTION_KEY_REFUSED` | an option without them lands |
| R27 | no act rewrites a row (read history before and after each act); every table is declared to purge (purge a test instance: counts zero) | not applicable |
| R28 | against the test profile only; with no profile active, suggestions' deadlines read undetermined | not applicable |

## `actions` (deltas §2)

| req | test | negative control |
| --- | --- | --- |
| R9 amended | each addressee arm lands; a written `{state: named, name}` action reads as written | a breach action addressed to press refuses `ADDRESSEE_NOT_AN_OFFICE`; a private person refuses |
| R7 amended | `completed` lands on a `media`-kind action and on a records request | `resolved` with no resolution still refuses `NO_RESOLUTION` |
| R44 | a member sets `contact`; the read shows it | a machine refuses; a non-member id refuses `CONTACT_NOT_A_MEMBER` |
| R45 | an action created by `action-plans` R18 carries `plan` and `option` | changing either on a revision refuses `PLAN_LINK_REWRITTEN` |
| R8 amended | a member's breach action with no determination but a `premise_override` lands, stamped, shown in the read; a filing prepared from it carries the disclosure | without the override it refuses `ACTION_NO_DETERMINATION`; a machine's override refuses; attaching it to an escalation refuses |
| R47 | a member marks a received entry `pressure`; the read lists it apart; `actionsFor` filters by it | a machine refuses; a `sent` entry refuses |
| R48 | a Tier 2 filing resting on a Grade B capture is prepared and shows the grade and the venue's stated standard | not applicable (nothing refuses) |
| R46 | `op=actioncreate` answers the id and writes what a promote would; `op=action` and `op=actions` answer R29's and R30's reads | a malformed document refuses as promote does |

## `filings` (deltas §3)

| req | test | negative control |
| --- | --- | --- |
| R22 | the approved bytes of a filing draft, a counsel-packet export and a communication draft each carry the in-band quartet, verifiable with `publication`'s R16 | a draft not yet approved carries none |
| R24 | a draft and a packet prepared from an overridden action carry "Rests on an unestablished premise:" with reason, author and time, in every export | a draft from a determined breach action carries none |
| R23 | a machine prepares a communication draft for an action addressed to press; it is labelled machine work; a member approves; sending records the bytes | a machine approving refuses (R6); sending before approval refuses `NOT_APPROVED` |

## `jurisdictions` (deltas §6)

| req | test | negative control |
| --- | --- | --- |
| R39 | a kind's `evidence` validates and reaches `combine`; two profiles that disagree on it withhold it and report the conflict | an unknown grade refuses `GRADE_UNKNOWN`; no `standard` refuses `EVIDENCE_NO_STANDARD` |

## Wiring (deltas §4)

| change | test | negative control |
| --- | --- | --- |
| scheduler `deadline-recheck` | a pending clock entry past its date is marked overdue within one cadence, and escalation is asked | an entry dated today stays pending |
| queue kinds | a reminder the member asked for fires as asked and offers another or none; an overdue clock (CONDITION) notifies once; a proposed stage and a due checkpoint (OBLIGATIONs) appear once; none repeats unless the member asks | an unrequested 'due within N days' produces no item |
| litigation-hold reminder | a `legal` pressure entry yields one OBLIGATION for an administrator; it stays open until cleared, and responding may clear it | kind `retaliation` yields none; the item is not repeated unless asked |
| template library | a member keeps an approved draft as a group template; `filingPrepare` fills it for the kind; an assistant draft is a proposal until adopted | a machine calling `templateSave` refuses |
