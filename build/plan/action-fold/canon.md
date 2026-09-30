# The Action layer's canon edits

**Status** · Written by a worker for BOB #74, 2026-09-30, from `BIO_Action_v0_1.md` §6 (approved by Bob as canon, whole, with its §6 edits, K608 (1)), against the files on `tranche/T17`. Each edit quotes the text it replaces. Where §6 names a change in outline, the exact text is BOB's wording of it (P17); where §6 misses a place its own §5 row 3 ("seven everywhere") reaches, the place is added and marked **(beyond §6)**. BOB applies them at T17's close, on the tranche branch, in one commit.

## 1. Place the document

- Copy `build/plan/action-design/BIO_Action_v0_1.md` to `docs/architecture/BIO_Action_v0_1.md`, byte-identical except its Status line's first sentence:
  - current: `**Status** · APPROVED by Bob 2026-09-30 as canon (whole), the level-1 home of the Action layer; written by ACTION_DESIGN #1 the same day. BOB places it at `docs/architecture/BIO_Action_v0_1.md`, lists it in `requirements/README.md` and applies §6's canon edits at a tranche boundary (K592).`
  - becomes: `**Status** · APPROVED by Bob 2026-09-30 as canon (whole), the level-1 home of the Action layer (K608); written by ACTION_DESIGN #1 the same day; placed here, listed in `requirements/README.md`, and its §6 edits applied, at T17's close (K591, K592, K608).`
- **Dangling references (to settle before or with the copy).** The document cites `ACTION-PLAN.md`, `MATRIX.md` and `INVENTORY.md` (Status, §5, §7) and `docs/development/GRADE-A-CAPTURE.md` (§4 rule 13). The first three live only on `claude/brave-johnson-5fqmix` under `docs/development/action-design/` (draft PR believeinoakland/bio#5), not on this branch; the fourth is on this branch (`docs/development/GRADE-A-CAPTURE.md`, 43,916 bytes), but the staged copy `build/plan/action-design/GRADE-A-CAPTURE.md` is empty (0 bytes) and must not be the one placed. Recommendation (BOB's): bring `docs/development/action-design/` onto the tranche branch as **reference, not canon** (a row in `requirements/README.md` "Reference, not canon"), so canon never cites a file `main` lacks.

## 2. `requirements/README.md`

- **The construct-designs table** gains, after the `BIO_Case_Making_v0_1.md` row:

  `| `docs/architecture/BIO_Action_v0_1.md` | whole | the Action layer: standards, determinations, consequences, action plans, actions, filings and communications, escalation; the rules and the reconciled contradictions |`

- **The Case Making row**, current:

  `| `docs/architecture/BIO_Case_Making_v0_1.md` | whole | the inquiry, the claim, the case |`

  becomes:

  `| `docs/architecture/BIO_Case_Making_v0_1.md` | whole, except §"Observations" 2 ("`action` IS the impact substrate") and §THE ACTION PLAN, which `BIO_Action_v0_1.md` replaces (read for why) | the inquiry, the claim, the case |`

- **The Status line** gains at its end: ` AMENDED 2026-09-30 (K608): `BIO_Action_v0_1.md` listed as canon (whole); Case Making's action sections leave its canon part.`
- (Recommended, §1:) **"Reference, not canon"** gains `| `docs/development/action-design/` (ACTION-PLAN.md, MATRIX.md, INVENTORY.md, PATH.md, UX-ANSWERS.md) | the Action design's working record and rulings trail; `BIO_Action_v0_1.md` is the design |`.

## 3. `docs/architecture/BIO_System_Design.md` §3

A row after row 15:

`| 16 | **Action** | standards, conformance determinations, consequences, action plans, actions, filings and communications, and the escalation protocol: how a group turns what it has learned into what it does, from the first suspicion through planning, preparing, deciding and sending to tracking the response and recording how it ended | where the record becomes civic effect; every outward act is a member's, rests on the record, and names its basis | inquiry (8), publication (13), standing intent and monitoring (10), the assistant (11), membership (1) | `BIO_Action_v0_1.md` (canon, 2026-09-30) [`NOTIFICATIONS.md` for its reminders; `GRADE-A-CAPTURE.md` for the venue's standard of evidence] | not rendered: `construct-status.json` is retired (`requirements/README.md`); the build state is `build/` (layer 9) |`

(The state column is outside the canon part, `requirements/README.md`.)

## 4. `docs/architecture/BIO_Design_Requirements_v2.md`

- **Requirement 7, (beyond §6: §5 row 3, "seven everywhere", K14)** current:

  > Six stages: Discovery and Documentation, Notification, Clock Starts,
  > Response Evaluation, Escalation to Legal Tools, Sustained Attention.

  becomes:

  > Seven stages: Discovery and Documentation, Notification, Clock Starts,
  > Response Evaluation, Escalation to Legal Tools, Sustained Attention,
  > Political Accountability.

- **Requirement 7**, current:

  > protocol is designed to be mechanical: when trigger conditions are met,
  > the next stage activates. This removes the human hesitation that the
  > protection system exploits.

  becomes:

  > protocol is designed to be mechanical: when trigger conditions are met,
  > the next stage is proposed, and a member advances it. This removes the
  > human hesitation that the protection system exploits.

  and, as the requirement's amendments are recorded, a paragraph after the 2026-09-26 amendment:

  > **Amended by Bob, 2026-09-30** (`BIO_Action_v0_1.md` §5 row 2; K102, K608): a met trigger proposes the next stage, with its age; a member advances it or declines with a reason. The protocol never advances itself (Requirement 12).

- **Requirement 12**, current:

  > where they are in the six-stage process and what the next step is;

  becomes:

  > where they are in the seven-stage process and what the next step is;

## 5. `docs/architecture/BIO_Complete_Roadmap_v5.md`

- **§6**, current: `**Requirement 7: Six-stage escalation protocol** with documented trigger` → `**Requirement 7: Seven-stage escalation protocol** with documented trigger`.
- **§9, Skill 8**, current: `Guides groups through the six escalation stages. Identifies current` → `Guides groups through the seven escalation stages. Identifies current`.
- **§8, Tier 3**, current:

  > **Tier 3 --- Do not file without counsel.** Prop 218 challenges, CCP
  > 526a taxpayer actions, consent decree motions. Evidence published;
  > filing templates NOT included. Contact information for legal
  > organizations provided.

  becomes:

  > **Tier 3 --- Do not file without counsel.** Prop 218 challenges, CCP
  > 526a taxpayer actions, consent decree motions. Evidence published;
  > filing templates NOT included. Contact information for legal
  > organizations provided. For counsel the group names, CivicOS prepares
  > a counsel packet (the facts with their citations, a chronology, exhibits
  > with provenance, the standards' text, candidate legal theories and
  > remedies, and any deadline that binds a claim), marked as prepared for
  > counsel's review, never published and never fileable as it stands
  > (Design Requirement 8 as amended 2026-09-26; `BIO_Action_v0_1.md` §3).

## 6. `docs/architecture/BIO_Functional_Architecture_v3.md`

- **Function 3**, current: `When findings reveal noncompliance, the six-stage escalation protocol` → `When findings reveal noncompliance, the seven-stage escalation protocol`.
- **Skills that power Layer 3**, current: `**Escalation Skill:** guides groups through the six-stage protocol with` → `**Escalation Skill:** guides groups through the seven-stage protocol with`.
- **Updated skill inventory, 8**, current: `six-stage protocol with tiered actions.` → `seven-stage protocol with tiered actions.`

## 7. `docs/architecture/BIO_State_Rules_Consistency_v1_5.md`

An amendment appended at the end, in the file's amendment form (the canon part is §3 onward):

> ## Amendment: the Action layer (2026-09-30, `BIO_Action_v0_1.md` §6; K608)
>
> **§1.2 and §4 gain the action-plan type.** `PLN-` (type `action_plan`) is a record object like the layer-9 types `STD-`, `CONF-`, `CONS-` and `ESC-` (K171): states `open` and `closed`, one edge `open → closed`, taken only by a member's act with a reason; a plan never closes itself (`action-plans` R20).
>
> **§4.4 Action, as the layer holds it now.** The `counterparty` field is the action's **addressee**: an office by role and body; a reporter or outlet, an organisation or another civic group by role and organisation; or a described audience; never a private individual, and an action asserting a breach is addressed to an office (`BIO_Action_v0_1.md` §4 rule 6; `actions` R9). The free-text example `counterparty: "Oakland Finance Department, Controller's Bureau"` is history. The kinds are the product's own (`records_request`, `request_for_comment`, `other`) and the active jurisdiction profile's; the seven state-specific kinds listed above read as written on records that carry them (`actions` R4, R10). Resolutions are `complied`, `denied`, `escalated`, `withdrawn` and `completed` (the action was carried out and no counterparty's answer decides it). An action may state `contact` (a member id, the group's contact for it), and `plan` and `option` (the action plan and option it was started from, set at creation, never changed).
>
> **§5.1's closed vocabulary gains three relationships**, already built and approved: `action_basis` (an action → the inquiry, determination or information it rests on or advances), `responds_to` (a reply → the action it answers) and `references` (a finding of non-response → the action).

## 8. `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §3, and DEC-81 (1)

- **§3, Grade A**, current:

  > -   **Grade A, evidentiary raw capture.** WACZ web-archive or equivalent
  >     > chain-of-custody capture of the source as served; the ceiling for
  >     > adversarial or legal use; produced by a network-capable agentic

  becomes:

  > -   **Grade A, evidentiary raw capture.** WACZ web-archive or equivalent
  >     > chain-of-custody capture of the source as served; the ceiling for
  >     > adversarial or legal use (a ceiling, not a minimum: the venue sets the
  >     > standard of evidence, and no action is refused for its grade;
  >     > `BIO_Action_v0_1.md` §4 rule 13, Bob 2026-09-30); produced by a network-capable agentic

- **§3, "Raising a grade mechanically"**, current: `capture (Grade A) remains the ceiling for adversarially distributed work` → `capture (Grade A) remains the ceiling (not a minimum; the venue sets the standard, `BIO_Action_v0_1.md` §4 rule 13) for adversarially distributed work`.
- **DEC-81 (1)** in `docs/development/DECISIONS.md` is Bob's ruling record: its words are not edited. An annotation line is added directly under item 1, in the register's own form:

  > `  read with (Bob, 2026-09-30, K597 (3)): "Grade A stays the ceiling for adversarial or legal use" is the highest grade the product offers, not a minimum: the venue sets the standard of evidence (`BIO_Action_v0_1.md` §4 rule 13).`

  (§6 says "DEC-81 (1) … gains"; an annotation carries it without rewriting a ruling's text. BOB's form.)

## 9. `build/layers.md`

Layer 9's contract and row: `deltas/modules-and-layers.md`.

## 10. Record-keeping (`BIO_Action_v0_1.md` §6 and the design's `deltas.md` §9)

- `build/plan/next.md`: N129 and N130 are already gone (moved to `archive/next-applied.md` by K411's worker or later; neither appears in `next.md` today). **N61 is still listed** (`next.md`:19) and `current.md`'s "Not in T17" still names it as Bob's; its substance is applied: `jurisdictions` R7 and R31 hold `federal` among the law levels, R23 gives `standard_sources` a level, and K232 records R7, R23 and R31 met. Moving N61 to `archive/next-applied.md` with that evidence is record-keeping (BOB's), not a meaning change; it leaves Bob's list.
- DEC-1 to DEC-67 on `main`: the design asks that `docs/archive/ledgers/DECISIONS-2026-08.md` be brought back from `coord`, since the canon cites them (DEC-10 among the rulings the Action drafts cite). Out of the fold's files; BOB's.
