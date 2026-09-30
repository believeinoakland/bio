# The UX substrate after the Action rulings

**Status** · APPROVED by Bob 2026-09-30 ("action UX answers have been answered"). Written by ACTION_DESIGN #1 for BOB, who keeps the UX substrate page (`docs/development/ux-substrate/`, K438: when Bob closes a question the page lists as open, the page is updated in the same change that records the ruling). This lists the open questions and use cases in `ux-experience.json` that Bob's Action rulings of 2026-09-29 and 2026-09-30 settle or change, with the text to enter. The substrate files are not edited here.

## Open questions

| question | now | text for the substrate |
| --- | --- | --- |
| **OQ-8** Where does a member record why something is, or is not, worth escalating? | **answered** | Bob, 2026-09-29 (ruling 7) and 2026-09-30: the judgment lives in acts and their reasons, never in a score. Not pursuing a matter is an option declined in its action plan, with a short reason (`action-plans` R13); a proposed escalation stage is declined with a reason (`escalation` R13, built). |
| **OQ-9** What does the action plan surface (S11) look like? | **answered** (layout remains Design's) | Bob, 2026-09-29 and 2026-09-30 (rulings 1–10, D1–D6, the closing rule): an outline, not a graph: subjects with their support, options collapsed to a summary and sorted by category, date, subject or disposition, up to three scenarios of phases with checkpoints and branches, and what each started option became. Requirements: `action-plans` R1–R28. The member's path: `docs/development/action-design/PATH.md`. A graph view may come later. |
| **OQ-14** How does the queue avoid nagging while making sure obligations with clocks are not missed? | **answered by earlier rulings** | Bob, 2026-09-30: answered already by DEC-69 (the workflow must not nag or second-guess; inform at the act, once), DEC-70 (a pushed notice tells once, is dispositionable and ages, never a recurring nag) and DEC-10 (recorded in `NOTIFICATIONS.md` at D-125: an overdue condition notifies once, and its response offers another reminder at a further time or none) and DEC-94 (a deadline reminder is the member's own request, set when the action is chosen; nearing is display only; no outside channel), as K613–K615 record. The Action drafts follow them. |
| **OQ-25** How are our own missed deadlines kept from reading as findings about the world? | **answered for plans** (the OBLIGATION relabelling stays Bob's) | A plan's checkpoints are the group's own intentions: a missed or `not_met` checkpoint is never a finding, a condition of the record or a fact about the government (`action-plans` R23); its reminder is an obligation of the group's own; the counterparty's deadline is a condition on the action. |

## Use cases whose coverage changes

| use case | was | now |
| --- | --- | --- |
| UC-067 Judge significance | partial | covered by acts and reasons (OQ-8's answer) |
| UC-124 Media outreach, public comment and testimony | partial: "no requirement shapes the communication itself" | drafted: an addressee beyond government offices (`actions` R9, D1); communication drafts approved and sent by a member, with the in-band stamp (`filings` R22–R23) |
| UC-126 Build an action plan | no | drafted: `action-plans` R1–R28 |
| UC-127 Overdue clocks marked, next stage proposed | partial: `monitoring` R34–R35 not reaching members | drafted: the scheduled deadline recheck and three queue kinds (`drafts/deltas.md` §4) |
| UC-129 Document pressure against supporters | no | drafted: pressure entries on an action (`actions` R47), a litigation-hold reminder for legal threats |

## New audiences' lines (the substrate's `audiences`)

- **Journalist or media:** may now be an action's addressee by role and outlet (D1); receives what a member sends, never anything by a system path.
- **Activist or partner group (outside this instance):** may be an addressee by role and organisation (D1); joint action recorded and deferred (Bob, 2026-09-30; trigger: a coalition asks).
