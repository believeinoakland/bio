# escalation — requirements

**Status** · DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code and the canon, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 9 (Action). A new module: no `from`, nothing moves. Code today (measured on `tranche/T3` @ `edbd39b`): **no escalation protocol exists.** `grep -i escalat` over `store.mjs` and `index.mjs` finds only the host governor's back-off (36251–36337), DEC-10's notification escalation (3490) and progressions' overdue marking (27216, 27398), none of them this. What exists to build on: the action's clock and ledger (`actions`), the resolution `escalated` in `RESOLUTIONS` (`bio-checks.mjs` 838), and progressions' pattern of a declared stage with a due date (`progressions`), which this module does not reuse (Suggestions). Every requirement is *(not yet met: new module)*. Bob's ruling K14 (Design Requirement 7 as amended: stage 7) is R11–R12. No old-plan row is carried to `escalation`; no check in `bio-checks.mjs` belongs to it.

**Size (P6).** New. Estimated 800–1,200 lines of code with its tables; one session reads it with the public parts of its uses.

## Public

### Purpose

The escalation protocol (Design Requirement 7 as amended): the stages a group works through to bring a government act back into conformance, from a live noncompliant determination to its end, each stage with its entry condition, its defined acts and the trigger for the next. The next stage is proposed when its trigger is met, from the record at the time of reading, and a member advances it. It ends only when compliance is restored and the consequences are addressed (Operational Principle 6). It decides nothing about significance and takes no position on what policy should be (Operational Principle 1).

### Provides

Terms. The **stages**, in order: `1 documentation` (discovery and documentation), `2 notification`, `3 clock`, `4 response_evaluation`, `5 legal_tools`, `6 sustained_attention`, `7 political_accountability`. The **stage table** (edges a member may advance along): 1→2; 2→3; 3→4; 4→5, 4→7; 5→6, 5→7; 6→4; 7→4. An escalation's **state** is `open`, `suspended` or `ended`. A **breach action** is an action whose document states `breach: true` and rests on the escalation's determination (`actions` R8). A refusal is `{ok: false, reason, ...}`.

**escalationOpen({determination, author, viewer}) → `{ok: true, id, stage: 1, proposed}` or refusal**
- **R1** Refusals in order: `MACHINE_CANNOT_OPEN` (an empty or machine author); `NO_SUCH_DETERMINATION` (absent or invisible, one answer); `DETERMINATION_SUPERSEDED`; `NOT_NONCOMPLIANT` (no standard's outcome is `noncompliant`, `conformance` R4); `NOT_A_PARTICIPANT` (the author is not joined in the determination's project); `ALREADY_OPEN` (an open or suspended escalation of this determination, named). Otherwise it opens at stage 1, recording the noncompliant standards it pursues, who and when. Any joined member may open one (Design Requirement 7: "any group or individual can initiate"). *(not yet met: new module)*

**escalationRead({id, nowMs?, viewer}) → `{id, state, stage, history, standards, actions, triggers, proposed, exit}`**
- **R2** The read derives, at `nowMs` (the caller's, else the instance clock), for each edge out of the current stage whether its trigger (R4–R10) is met, naming the record ids that meet it or what is missing; `proposed` lists the met ones, each with the instant its trigger was first met by those ids and its age. Nothing is stored as the answer: the same record read later can propose more. `NO_SUCH_ESCALATION` for an absent or invisible one. *(not yet met: new module)*
- **R3** `exit` answers R14's two conditions separately, each `met`, `not_met` or `undetermined` with its ids and why, and never composes them into a score. *(not yet met: new module)*

**The stages: entry, defined acts and trigger** (each trigger is a fact about the record, read through the module named)
- **R4** Stage 1 (documentation) is entered by R1. Its acts: the published findings and the determination. Trigger to 2: the determination is live, and the act's actor is an office (`conformance` R1), so a notice has an addressee. *(not yet met: new module)*
- **R5** Stage 2 (notification). Its act: a breach action addressed to the actor's office, attached at this stage (R9). Trigger to 3: that action's ledger holds a `sent` entry (`actions` R16). *(not yet met: new module)*
- **R6** Stage 3 (clock). Its act: a clock entry, with its basis, on the notification action, stated by a member (`actions` R32 may propose it). Trigger to 4: after the `sent` entry, the ledger holds a `received` or `no_response` entry, or the clock's earliest pending entry is past (`actions` R12's rule at `nowMs`). A stage-3 action with no clock entry never triggers by time, and the read says so. *(not yet met: new module)*
- **R7** Stage 4 (response evaluation). Its act: a member's evaluation (R10). Triggers: to 5 and to 7, the latest evaluation reads `denied`, `partial` or `none`; a `complied` evaluation proposes no stage and points at R14. Partial compliance is recorded and does not stop the clock or end the escalation (Functional Architecture Layer 3 Function 5). *(not yet met: new module)*
- **R8** Stage 5 (legal tools). Its acts: breach actions attached at this stage, with their filings or counsel packets (`filings.filingsFor`); what is available is listed by tier (the profile's kinds for the actor's office, `filings` R15's block). Trigger to 6: an attached action's ledger holds a `sent` entry. Trigger to 7: as R7's, from the evaluation in force. *(not yet met: new module)*
- **R9** `escalationAttach({id, action, author, viewer})` attaches a breach action to the current stage, which must be 2, 5 or 7: `MACHINE_CANNOT_ATTACH`; `NO_SUCH_ESCALATION`; `NO_SUCH_ACTION`; `NOT_A_BREACH_ACTION` (no `breach: true`, or no `rests_on` leg naming this escalation's determination); `STAGE_TAKES_NO_ACTION` (stages 1, 3, 4, 6); `ALREADY_ATTACHED`. An action is attached to one escalation at one stage. *(not yet met: new module)*
- **R10** `escalationEvaluate({id, response?, reading, reason, author, viewer})`: a member's reading of a response, `complied`, `partial`, `denied` or `none` (nothing came back by the clock), naming the response (`{action, ord}` of a `received` entry, or none for `none`) and a reason of 1–2,000 characters. Refusals: `MACHINE_CANNOT_EVALUATE`; `NO_SUCH_ESCALATION`; `NOT_IN_EVALUATION` (the stage is not 4); `READING_UNKNOWN`; `NO_SUCH_RESPONSE` (not a `received` entry of an attached action); `RESPONSE_FOR_NONE` (a response with `none`); `NO_REASON`. Evaluations are append-only; the latest is in force. *(not yet met: new module)*
- **R11** Stage 6 (sustained attention). Entered from 5. Its act: none of its own; `monitoring` watches the attached actions' clocks and the counterparty's responses (R15). Trigger to 4: a `received` entry on an attached action later than the latest evaluation. *(not yet met: new module, K14 for the order of 5, 6 and 7)*
- **R12** Stage 7 (political accountability), entered from 4 or 5 (K14). Its acts are breach actions attached here, each stating one `accountability` purpose of `official_request` (asking an elected office to act on the breach), `oversight_request`, `audit_request`, `testimony` or `enforcing_legislation` (legislation that restores or enforces an existing requirement), and naming at least one of the escalation's noncompliant standards as the requirement it seeks enforced. Refused at R9: `NOT_ACCOUNTABILITY` (no purpose, or one outside the five: policy advocacy and candidate support have none); `NOT_THE_BREACH` (no standard, or one the escalation does not pursue); `COUNTERPARTY_NOT_ELECTED` for `official_request` addressed to an office the profile marks `elected: false` (`jurisdictions` R24; where the profile says nothing, it lands and the read states the office's election undetermined). Trigger to 4: as R11's. *(not yet met: new module, K14)*

**escalationAdvance({id, to, reason, author, viewer}); escalationDecline({id, to, reason, author, viewer})**
- **R13** `escalationAdvance`: `MACHINE_CANNOT_ADVANCE`; `NO_SUCH_ESCALATION`; `NOT_OPEN` (suspended or ended); `NO_REASON` (empty or over 2,000 characters); `ILLEGAL_STAGE` (not an edge of the table from the current stage, with the legal ones); `TRIGGER_NOT_MET` (R2 does not propose `to`; it names what is missing). Otherwise it appends `{from, to, reason, author, at, trigger ids}` to the history. `escalationDecline` records, with the same refusals and `NOT_PROPOSED` in place of `TRIGGER_NOT_MET`, that a member chose not to advance along a proposed edge now, with a reason; the proposal stays in the read, with its age and the declines. *(not yet met: new module)*

**escalationEnd({id, author, viewer}); escalationSuspend({id, reason, author, viewer}) / escalationResume**
- **R14** `escalationEnd` refuses `MACHINE_CANNOT_END`, `NO_SUCH_ESCALATION`, and, naming the ids, `COMPLIANCE_NOT_RESTORED` unless, for every standard the escalation pursues, a live `compliant` determination of the same act recorded after it opened exists (`conformance.determinationsFor`), and `CONSEQUENCES_NOT_ADDRESSED` or `CONSEQUENCES_UNDETERMINED` unless `consequences.addressed` for the escalation's determination is `addressed` (`consequences` R9). Otherwise the state is `ended`, with who and when; an ended escalation is never reopened (a new breach is a new determination). *(not yet met: new module)*
- **R15** `escalationSuspend` (a member, with a reason) stops proposals being reported as due; the escalation stays open to reading, its clocks keep running in the actions, and the read says it is suspended and since when. `escalationResume` restores it at the same stage. Neither ends it. *(not yet met: new module; Open for Bob 3)*

**For `monitoring`: escalationsDue({nowMs, limit?, viewer}) → `{items, truncated}`**
- **R16** Lists every open escalation with at least one proposed edge not advanced or declined since its trigger was met, with the edge, the trigger's instant and its age, oldest first, at most 500 (`truncated` stated). This is what `monitoring` notifies on. *(not yet met: new module)*

## Private

### Uses

- `record-core`: `allocId`, `transact`, `stampInstant`, `declarePurge`. `membership`: `viewerPredicate`, `projectAuthority`. `legacy-checks`: `isMachineIdentity`. *(legacy-checks not declared)*
- `jurisdictions`: `combine`'s view, `counterparties` (R12). *(not declared)*
- `conformance`: `determinationRead`, `determinationsFor` (R1, R4, R14).
- `consequences`: `addressed` (R3, R14).
- `actions`: `actionRead`, `actionsFor`, `actionFacts`'s clock rule (R5–R12).
- `filings`: `filingsFor` and the available-actions block (R8).

### Invariants

- **R17** Nothing a machine writes opens, attaches to, evaluates, advances, declines, suspends or ends an escalation; a proposal is the protocol's derivation over the record, stated as such, never an act (Design Requirement 12; DEC-24). *(not yet met: new module)*
- **R18** Every stage move, evaluation, decline, suspension and end is append-only with who, when and why; the history is never edited. *(not yet met: new module)*
- **R19** No input or answer carries a significance, severity, priority, urgency or score (K12); no stage act has a purpose outside enforcing a standard the escalation pursues (Operational Principle 1, K14). *(not yet met: new module)*
- **R20** Every read answers an escalation in a project the viewer may not see as absent. Tables are declared to purge (K23). No place, office or law is named in this module's behaviour or outward text. *(not yet met: new module)*

### Satisfies

- `BIO_Design_Requirements_v2.md` §7 as amended 2026-09-26 (seven stages, entry and trigger conditions, anyone may initiate) and §12.
- `BIO_Functional_Architecture_v3.md` Layer 3, Function 3 (escalate: current stage, available actions by tier, deadlines) and Function 5 (track toward resolution; the exit condition; partial compliance does not stop the clock).
- `BIO_Complete_Roadmap_v5.md` §5 (Operational Principles 1, 3 and 6), §8, §9 (Skill 8, Escalation Protocol).
- `build/layers.md`, layer 9 (the `escalation` row and the contract); K12, K14.

### Suggestions

- Id prefix `ESC-`; tables `escalations`, `escalation_moves`, `escalation_evaluations`, `escalation_attachments`, `escalation_declines`. Whether an escalation is a record object is decided with `standards`' Open for Bob 1.
- R2's "first met" instant is the latest of the dates of the ids that meet the trigger (a `sent` entry's `at`, a clock date's next day), not the read time, so the age is a fact of the record.
- `progressions`' declared stages are a member's own template for a recurring process; the protocol's stages are fixed by Design Requirement 7, so this module holds its own table and does not reuse progressions.
- The Escalation Protocol skill (Roadmap §9, Skill 8) reads R2 and `filings` to explain the stage, the acts available by tier and the deadlines; it prepares, and a member acts.
- Tests: every refusal with a negative control; one arm per edge driving its trigger from the record alone, with the clock seam (`nowMs`) moved across a deadline; R14 with each condition failing alone; R12 with each forbidden purpose.

## Open for Bob

1. **Mechanical, or proposed and advanced?** Design Requirement 7 says the protocol "is designed to be mechanical: when trigger conditions are met, the next stage activates. This removes the human hesitation that the protection system exploits." The approved layer-9 contract says the next stage "is proposed when its trigger is met, and a member advances it". *Recommendation:* the contract's reading (R2, R13): an escalation acts outside the system, and every such act is the group's. Hesitation is countered by making it visible: a met trigger is proposed with its age, a member who declines records why (R13), and `monitoring` notifies on every due proposal (R16). Design Requirement 7's sentence is then noted as amended.
2. **What counts as "compliance restored"?** A member's `complied` evaluation of a response, or a new determination? *Recommendation:* a live `compliant` determination of the same act for every standard pursued (R14), recorded with the same care as the noncompliant one (the contract: "compliance is recorded as carefully as noncompliance"); an evaluation reading `complied` only points at it.
3. **Can a group stop without an end?** The contract says an escalation "ends only when compliance is restored and the consequences are addressed", but a group can run out of capacity. *Recommendation:* it may suspend with a reason (R15); it is never ended, withdrawn or resolved without both conditions, so the record never reads a stopped escalation as a finished one.

## Decided by BOB (for rulings)

- `escalation`'s uses gain `legacy-checks` and `jurisdictions`.
- The stage table, including 6→4 and 7→4 when a new response arrives (R11, R12): a response re-enters evaluation; the canon names no other exit from 6.
- One open or suspended escalation per determination (R1); an action attaches to one escalation at one stage (R9).
- Stage acts are `actions` actions marked `breach: true` (`actions` R8), so the Action object stays the one place outward acts and their clocks live (Functional Architecture Function 5's resolution note).
- `escalationsDue` pages at 500.
