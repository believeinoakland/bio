# Changes to existing modules and build state

**Status** · Reviewed by Bob 2026-09-30: "correct and complete enough". DRAFT by ACTION_DESIGN #1, 2026-09-30, from `MATRIX.md` §5 and Bob's decisions D1–D6 (agreed 2026-09-30); for BOB's review and fold. Wording is proposed; the requirement ids are the next free in each file as of `main` @ `5bb688333c`, for BOB to confirm. Items marked **Bob** change a layer contract, a module list or a vocabulary members see, and were approved in substance by Bob's rulings cited; items marked **BOB** are BOB's (P17).

## 1. `build/layers.md` and `modules.json` (the contract wording follows Bob's rulings 1, 5, 10 and D1; adding the module is BOB's)

- **Layer 9's contract**, replacing "An action rests on a published finding and a standard held in the record; the group decides every act, the AI prepares and never files; compliance is recorded as carefully as noncompliance; every deadline names its basis." with: "An action rests on the record, and one asserting a breach rests on a published finding and a standard held in the record; the group plans and decides every act, the AI proposes and prepares and never files or sends; compliance is recorded as carefully as noncompliance; every deadline names its basis."
- **Layer 9's row** gains `action-plans` after `escalation`. `modules.json` gains `action-plans` (layer 9; path `bio-plane/src/action-plans/`; tests `bio-plane/test/m/action-plans/`; uses as in `drafts/action-plans.md`, Uses). `queue` gains `action-plans` (R17's `checkpointsDue`).
- The layer's sources gain `BIO_Case_Making_v0_1.md` §THE ACTION PLAN and `docs/development/action-design/ACTION-PLAN.md`.

## 2. `actions`

- **R9, amended (Bob: D1).** `counterparty` becomes the action's **addressee**, one of: `{state: named, kind: office, role, body, level?, entity_id?}` (as today; `kind` absent reads `office`); `{state: named, kind: press | organisation | group, role, organisation}`; `{state: audience, description}` (at most 500 characters); `{state: undetermined, basis}`. Never a private individual: a reporter is addressed by role and outlet, a group by role and organisation. A breach action (R8) must address an office, `ADDRESSEE_NOT_AN_OFFICE`. Refusals extend R9's as `COUNTERPARTY_REFUSED` with the arm named. Written actions read as written.
- **R7, amended (Bob: D3).** Resolutions gain `completed`, allowed on any kind: the action was carried out and no counterparty answer decides it. `resolved` still needs one of the five. The action's own outcome (R26, DEC-14) says what happened; an impact claim still needs a leg outside the group's own actions.
- **New R44 (Bob: D5).** An action may state `contact`, a member id, the group's contact for it; set or changed only by a member (`MACHINE_CANNOT_SET_CONTACT`), refused `CONTACT_NOT_A_MEMBER`; shown in the read (R25). It grants nothing.
- **New R45 (ruling 1; A12).** An action may state `plan` and `option`, set only when created by `action-plans` R18 and never changed (`PLAN_LINK_REWRITTEN`); shown in the read.
- **New R47 (Bob, 2026-09-30: prepared for opposition).** A received correspondence entry may be marked `pressure: {kind: legal | retaliation | discrediting | other, note}` (note at most 500 characters): a threat, retaliation, discrediting or legal harassment directed at the group or its supporters (Operational Principle 8, Design Requirement 13). Only a member marks it; the read (R25) lists an action's pressure entries apart; `actionsFor` can filter by it. It is evidence like any capture, and may be cited by a new inquiry.
- **New R48 (Bob, 2026-09-30: the venue sets the standard).** No action, filing or packet is refused for the capture grade of what it rests on. `filings`' drafts and counsel packets show each exhibit's grade and whether it is co-attested; a profile kind may state its venue's standard of evidence and the grades it accepts (`jurisdictions`), shown beside the grades; an exhibit below that standard, or at a grade the profile marks contestable, is flagged so counsel and members can prepare.
- **R8, amended (Bob, 2026-09-30: DEC-26 with Requirement 12, option (c)).** An action stating `breach: true` without a live noncompliant determination is still refused `ACTION_NO_DETERMINATION`, unless it states `premise_override: {reason}` (at most 500 characters, R14's text rule), authored by a member (`MACHINE_CANNOT_OVERRIDE` for a machine). The override is stamped with who and when, never edited, shown in the read (R25), and carried as a disclosure on every filing, counsel packet and communication prepared from the action (`filings` R24). An overridden breach action is never attachable to an escalation (which exists only for a determined breach, `escalation` R9).
- **New (reminders; Bob, 2026-09-30, K613–K615, DEC-94).** An action may carry `reminders`: the member's own requests to be reminded of its dated clock entries, set when the option is chosen (`action-plans` R29) or later by a member, never by a machine (`MACHINE_CANNOT_SET_REMINDER`). Each reminder names its clock entry and when it fires; a member changes or removes it at any time; the read (R25) shows them. They fire as asked and nothing else reminds (DEC-69).
- **New R46 (BOB).** `actionCreate({document, viewer, author})` (`op=actioncreate`): the same write as a promotion of an action document, answered with the action's id; and `op=action` (R29's `actionRead`) and `op=actions` (R30's `actionsFor`) routed.
- **Stale marks (BOB).** Strike "not yet met" from R4–R11, R22, R28–R33, R40, R41: all built and tested (K253, K370).

## 3. `filings`

- **New R22 (BOB: Publication §3 rule 9).** Every filing draft's approved bytes (R6), every counsel-packet export (R11) and every communication draft (R23) carries `publication.inbandQuartet` (its R16): hash, date, author and both threshold floors, in-band.
- **New R23 (Bob: D2).** `communicationPrepare({action, text, purpose, preparer, viewer})` (`op=communicationprepare`): a draft message, briefing or statement for an action whose addressee is anyone, stored apart and labelled as R5's drafts are (`proposalLabel(preparer, "communication")`); a machine may prepare it from the published case and the plan; no template is needed. `filingApprove` (R6) and `filingRecordSent` (R7) apply to it unchanged: a member approves it, sends it by their own hand, and the sending is recorded with the bytes sent. Nothing is transmitted by the instance (R7). Placement: `filings` is "what the group sends"; this keeps one draft–approve–send path for every outward text (BOB to confirm).

- **New R24 (Bob, 2026-09-30).** A filing draft, counsel packet or communication prepared from an action with a `premise_override` (`actions` R8) carries, on its face and in every export, "Rests on an unestablished premise:" with the override's reason, author and time.

- **New (the template library; Bob, 2026-09-30, K613 (3)).** Every filing has case-specific parts. A group builds a library of boilerplate templates over time: a member may keep an approved draft, or a derivative of it, as a template of the group's (`templateSave({from, name, kind?, author})`, never a machine), and `filingPrepare` fills either the profile's template for the kind or one of the group's. Where none fits, members use the assistant to draft one for the action at hand, a proposal a member adopts (R23's path, D2). No job and no machine invents legal text that is filed without a member adopting it.

## 4. `monitoring`, `scheduler`, `queue` (BOB)

- `scheduler` gains a `deadline-recheck` consumer calling `monitoring.deadlineRecheck` on its cadence, so `monitoring` R34–R35 reach members (today nothing calls it outside tests).
- `queue` (its producers are `queue-producers`', N363) gains: (i) **a reminder the member asked for** (`actions`' reminders, `action-plans` R29), fired as asked; its response offers another reminder at a further time or none (DEC-10 at D-125); (ii) **an action's clock entry overdue** (a CONDITION, K611), new and notifying once (DEC-10, DEC-94 (4)); (iii) **an escalation stage proposed** (an OBLIGATION); (iv) **a plan checkpoint due** (an OBLIGATION of the group's own, never a FINDING). A deadline coming near changes only the item's position, colour or wording (DEC-94 (2)). No item is repeated unless the member asks (DEC-69, DEC-70), and no outside channel is used (DEC-94 (3)). A fifth: when a member marks a received entry as pressure of a legal kind (a threat of suit, a subpoena, a demand to preserve), an OBLIGATION for an administrator to consider a litigation hold (DEC-61); like every item it is not repeated unless the member asks; the hold may be cleared when responding to it, and if not cleared the item stays open until it is (Bob, 2026-09-30, K613 (2)): clearing is its disposing door.
- Strike the stale "not yet met" marks on `monitoring` R34, R35 and `publication` R36, R37 once the wiring lands.

## 5. `skills` (BOB, with the pack's doctrine)

- An action-planning skill: proposes plan options (`action-plans` R11) from the plan's subjects and the project's `work_kinds`; proposes standards (`standards` R9), comparisons (`conformance` R12), candidate theories (`filings` R14) and communication drafts (`filings` R23). It writes through proposal ops only.

## 6. `jurisdictions` (BOB: data)

- **New R39 (Bob, 2026-09-30: the venue sets the standard of evidence).** An `action_kinds` entry (R25) may carry `evidence: {standard, accepts, contestable?, basis}`: `standard` in words (at most 200 characters, naming the rule or practice, e.g. a rule of evidence's number), `accepts` a non-empty list of `{grade, coattested?}` the venue admits, `grade` a letter of `provenance`'s `BASIS_GRADES` and `coattested: true` requiring the capture's co-attestation (its trusted timestamp and co-archive, `capture`'s co-attestation), `contestable` a list in the same form of what it admits but the opposition may contest. Refusals join R28: `GRADE_UNKNOWN`, `EVIDENCE_NO_STANDARD`. Combined as one value per kind (R15): profiles that disagree on a kind's `evidence` have it withheld and reported in `conflicts`. Absent, the venue's standard reads undetermined (R27) and `actions` R48 shows grades alone. The test profile supplies `evidence` on at least one kind with a `contestable` grade (R36).

- A complete holiday calendar for the first profile, and measured offices and deadlines (all five offices and the one deadline are `UNMEASURED` today). Tier 1–2 templates come from the group's library or the assistant's adopted drafts (`filings`' template library, K613 (3)); a profile may still carry a venue's official form where one is captured and measured.

## 7. Deferred (Bob, 2026-09-30)

- Joint action with another group: recorded in `BIO_Action_v0_1.md` §8 and deferred, including the near-term level (partner groups named on each group's own action, one jointly approved text). Trigger: a coalition asks.

## 8. Doctrine, no requirement change (Bob: D6)

- Any group may use CivicOS. A group with a stake in a matter discloses it (Design Requirement 6, already carried by the published case's declared bias and disclosures); its lobbying is limited by ruling 6 (`action-plans` R12). BOB records this with the rulings.

## 9. Record-keeping (BOB)

- `build/plan/next.md`: drop N61, N129, N130 (applied in T8, K232).
- DEC-1 to DEC-67: bring `docs/archive/ledgers/DECISIONS-2026-08.md` back onto `main` from `coord`, since the canon cites them.
