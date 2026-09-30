# Changes to existing modules and build state

**Status** · DRAFT by ACTION_DESIGN #1, 2026-09-30, from `MATRIX.md` §5 and Bob's decisions D1–D6 (agreed 2026-09-30); for BOB's review and fold. Wording is proposed; the requirement ids are the next free in each file as of `main` @ `5bb688333c`, for BOB to confirm. Items marked **Bob** change a layer contract, a module list or a vocabulary members see, and were approved in substance by Bob's rulings cited; items marked **BOB** are BOB's (P17).

## 1. `build/layers.md` and `modules.json` (Bob: rulings 1, 5, 10; D1)

- **Layer 9's contract**, replacing "An action rests on a published finding and a standard held in the record; the group decides every act, the AI prepares and never files; compliance is recorded as carefully as noncompliance; every deadline names its basis." with: "An action rests on the record, and one asserting a breach rests on a published finding and a standard held in the record; the group plans and decides every act, the AI proposes and prepares and never files or sends; compliance is recorded as carefully as noncompliance; every deadline names its basis."
- **Layer 9's row** gains `action-plans` after `escalation`. `modules.json` gains `action-plans` (layer 9; path `bio-plane/src/action-plans/`; tests `bio-plane/test/m/action-plans/`; uses as in `drafts/action-plans.md`, Uses). `queue` gains `action-plans` (R17's `checkpointsDue`).
- The layer's sources gain `BIO_Case_Making_v0_1.md` §THE ACTION PLAN and `docs/development/action-design/ACTION-PLAN.md`.

## 2. `actions`

- **R9, amended (Bob: D1).** `counterparty` becomes the action's **addressee**, one of: `{state: named, kind: office, role, body, level?, entity_id?}` (as today; `kind` absent reads `office`); `{state: named, kind: press | organisation | group, role, organisation}`; `{state: audience, description}` (at most 500 characters); `{state: undetermined, basis}`. Never a private individual: a reporter is addressed by role and outlet, a group by role and organisation. A breach action (R8) must address an office, `ADDRESSEE_NOT_AN_OFFICE`. Refusals extend R9's as `COUNTERPARTY_REFUSED` with the arm named. Written actions read as written.
- **R7, amended (Bob: D3).** Resolutions gain `completed`, allowed on any kind: the action was carried out and no counterparty answer decides it. `resolved` still needs one of the five. The action's own outcome (R26, DEC-14) says what happened; an impact claim still needs a leg outside the group's own actions.
- **New R44 (Bob: D5).** An action may state `contact`, a member id, the group's contact for it; set or changed only by a member (`MACHINE_CANNOT_SET_CONTACT`), refused `CONTACT_NOT_A_MEMBER`; shown in the read (R25). It grants nothing.
- **New R45 (ruling 1; A12).** An action may state `plan` and `option`, set only when created by `action-plans` R18 and never changed (`PLAN_LINK_REWRITTEN`); shown in the read.
- **New R46 (BOB).** `actionCreate({document, viewer, author})` (`op=actioncreate`): the same write as a promotion of an action document, answered with the action's id; and `op=action` (R29's `actionRead`) and `op=actions` (R30's `actionsFor`) routed.
- **Stale marks (BOB).** Strike "not yet met" from R4–R11, R22, R28–R33, R40, R41: all built and tested (K253, K370).

## 3. `filings`

- **New R22 (BOB: Publication §3 rule 9).** Every filing draft's approved bytes (R6), every counsel-packet export (R11) and every communication draft (R23) carries `publication.inbandQuartet` (its R16): hash, date, author and both threshold floors, in-band.
- **New R23 (Bob: D2).** `communicationPrepare({action, text, purpose, preparer, viewer})` (`op=communicationprepare`): a draft message, briefing or statement for an action whose addressee is anyone, stored apart and labelled as R5's drafts are (`proposalLabel(preparer, "communication")`); a machine may prepare it from the published case and the plan; no template is needed. `filingApprove` (R6) and `filingRecordSent` (R7) apply to it unchanged: a member approves it, sends it by their own hand, and the sending is recorded with the bytes sent. Nothing is transmitted by the instance (R7). Placement: `filings` is "what the group sends"; this keeps one draft–approve–send path for every outward text (BOB to confirm).

## 4. `monitoring`, `scheduler`, `queue` (BOB)

- `scheduler` gains a `deadline-recheck` consumer calling `monitoring.deadlineRecheck` on its cadence, so `monitoring` R34–R35 reach members (today nothing calls it outside tests).
- `queue` gains three kinds: an action's clock entry overdue (a CONDITION: the counterparty's deadline), an escalation stage proposed (from `escalation.escalationsDue`, an OBLIGATION), and a plan checkpoint due (from `action-plans` R17, an OBLIGATION of the group's own, never a FINDING). Each is one item per occurrence, never repeated for the same one (DEC-69).
- Strike the stale "not yet met" marks on `monitoring` R34, R35 and `publication` R36, R37 once the wiring lands.

## 5. `skills` (BOB, with the pack's doctrine)

- An action-planning skill: proposes plan options (`action-plans` R11) from the plan's subjects and the project's `work_kinds`; proposes standards (`standards` R9), comparisons (`conformance` R12), candidate theories (`filings` R14) and communication drafts (`filings` R23). It writes through proposal ops only.

## 6. `jurisdictions` (BOB: data)

- The first profile's templates for its Tier 1–2 kinds, a complete holiday calendar, and measured offices and deadlines (all five offices and the one deadline are `UNMEASURED` today).

## 7. Doctrine, no requirement change (Bob: D6)

- Any group may use CivicOS. A group with a stake in a matter discloses it (Design Requirement 6, already carried by the published case's declared bias and disclosures); its lobbying is limited by ruling 6 (`action-plans` R12). BOB records this with the rulings.

## 8. Record-keeping (BOB)

- `build/plan/next.md`: drop N61, N129, N130 (applied in T8, K232).
- DEC-1 to DEC-67: bring `docs/archive/ledgers/DECISIONS-2026-08.md` back onto `main` from `coord`, since the canon cites them.
