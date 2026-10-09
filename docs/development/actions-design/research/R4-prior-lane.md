# R4 · The prior lane: ACTION_DESIGN #1 (2026-09-29/30)

**Status** · Research for ACTIONS-DESIGN #1, 2026-10-09. Read-only. Sources read in full: `docs/development/action-design/ACTION-PLAN.md`, `INVENTORY.md`, `MATRIX.md`, `sources/{canon-mission,canon-constructs,build-state,code}.md` (on this branch); the lane's `drafts/action-plans.md`, `HANDOFF.md` and `README.md` at its last commit `be85eafb39` (branch `origin/claude/brave-johnson-5fqmix`, PR #5); `build/requirements/action-plans.md` as it stands now. Also consulted: `docs/architecture/BIO_Action_v0_1.md` §4 rule 9, §7–§8; `build/rulings.md` K590–K629, K660, K1180, K2382; `build/plan/next.md` N817; the status lines of `actions`, `filings` and the other affected requirement files.

**In one paragraph.** The lane inventoried the Action layer, designed the action plan with Bob (rulings 1–10, 2026-09-29), built a completeness matrix and got D1–D6 agreed (2026-09-30), drafted the `action-plans` module (R1–R28 and later R29) and deltas to nine other modules, and wrote a level-1 home, `BIO_Action_v0_1.md`, which Bob approved as canon. All of it was folded by BOB (K590, K591, K597, K600, K608, K611, K613–K615) and built. The requirements today carry the draft almost whole, with additions from later rulings. What did not carry: the UX rule A16, the worked example, the canon's free-form resources note, joint action and certification (both deferred by Bob), and a few nuances noted in §4. The lane's branch was never merged. Its files reached `main` by being restaged into `build/plan/action-design/`, and a subset was later placed under `docs/development/action-design/`.

---

## 1. Bob's rulings

### 1.1 Rulings of 2026-09-29 (`ACTION-PLAN.md` "Bob's rulings", verbatim)

1. **The Action layer gets an action plan.** A publication can give rise to several plans. A member creates one; the system suggests options; the member adds others, directly or through the assistant; the member chooses which to pursue and lays them out over time. It is not a project-management system: it helps the group understand its options and envision scenarios.
2. **No catalogue of response options.** Every documented breach calls for a response that is largely its own; a formal catalogue would limit and mislead. Suggestions may learn from prior cases.
3. **No budgets.** Neither money nor licensed resources are costed.
4. **One plan may address several related broken rules**, and an option may serve several of them at once (public awareness of a bond measure falsely certified *and* of its proceeds moved to the general fund), while others serve one.
5. **A plan may also start from a compliant or unclear determination** (a success story, a records campaign).
6. **Lobbying** is an allowed option only to enforce or restore an existing requirement; lobbying for new policy is outside Operational Principle 1.
7. **An option left unticked is undecided.** Declining is an explicit act, taken only if the member wants to, and it records a short reason, because a plan keeps "the options NOT taken".
8. **A plan holds up to three scenarios**, alternative ways of laying out the chosen options, to compare.
9. **The categories** are mitigation, legal, awareness, journalistic, grassroots, and other.
10. **A plan may open when an inquiry begins**, before anything is published or determined. It is not tied to a publication.

### 1.2 MATRIX §6, D1–D6 (agreed by Bob 2026-09-30 "as recommended"; verbatim)

- **D1 · Addressees beyond government offices.** Recommended: an action may be addressed to a reporter or outlet, another civic group, or an organisation, each named by role and organisation, never as a private individual (Requirement 6); an awareness option may address a described audience ("residents of the district"). Without this, four of the ten purposes cannot be sent.
- **D2 · Preparing communications.** Recommended: the assistant drafts a message or briefing for an option as a proposal, stored apart and labelled, from the published case and the plan; a member edits and adopts it; it leaves by the member's hand and carries the in-band stamp. This is Publication §6's "new action_kind and a rendering", placed in the Action layer.
- **D3 · Outcomes for actions that are not requests.** Recommended: add `completed` to the resolutions, with the action's own outcome (DEC-14) saying what happened ("the story ran on 2026-10-14"), and keep impact claims needing outside evidence.
- **D4 · Actor kinds.** Recommended: a project may declare the kind of work it does (reporting, fixing, legal, oversight), which shapes what the assistant suggests and nothing else (DEC-27, DEC-54); no attribute on a person.
- **D5 · Roles for outward acts.** Recommended: no new capability. A started option may name the member who is the group's contact for it, shown with the action; sending stays recorded and unsigned until a group needs more.
- **D6 · Unions and special interests** (carried from the inventory, §6 item 4). Recommended: any group may use CivicOS; one with a stake in the matter discloses it (Requirement 6) and its lobbying is limited by ruling 6.

### 1.3 Further rulings during the lane (for context)

- **Closing rule, 2026-09-30:** "A member closes a plan with a reason; a plan never closes itself. A closed plan stays readable, and its subjects may join another plan" (`ACTION-PLAN.md` A17; draft R20). Adding the `action-plans` module is BOB's, "a technical detail" (K590).
- **On `BIO_Action_v0_1.md` §7 (K597, K600):** the system hopes for good faith and is fully prepared for opposition (every plan checked for a branch answering a hostile response; pressure recorded as evidence). The venue sets the standard of evidence: no grade gate, grades shown. Certification by a licensed professional is deferred. A confidential referral is an action sent by the member's own hand. DEC-26 against Requirement 12 was settled as option (c): refuse a breach-asserting action by default, and let a member override openly with a reason that is disclosed on everything prepared from it. Joint action is recorded and deferred until a coalition asks.
- **K608:** `BIO_Action_v0_1.md` is canon, whole. The drafts are "correct and complete enough". The plan-page view and `UX-ANSWERS.md` are approved (OQ-8, OQ-9, OQ-25; OQ-14 answered by DEC-10, DEC-69, DEC-70). Action development is prioritised. K629 later corrected this priority: legacy removal leads T18.
- **K613–K615 (reminders, litigation hold, templates):** choosing a dated option includes setting its reminders, from defaults the member sees. A notice's response offers another reminder or none. Nothing is repeated unless asked. The litigation hold stays open until cleared. Filing templates come from a library the group builds, and the assistant drafts one where none fits. Bob's only words on nagging in the lane session were: *"We've addressed questions related to 'nagging' already. Refer to those answers rather than us risking conflicting responses."* (HANDOFF.md).
- **Later, outside the lane:** K660 (the planning skill: five strongest suggestions first, then the next five on request, no score; earlier plans of the same project only; the disclosure stops at adoption). DEC-114 (the member-facing word is "matter", not "subject"). DEC-115 (the start-and-send sketch binds the redesign's content).

---

## 2. The lane's design (`ACTION-PLAN.md`)

**Terms**
- **Subject:** what a plan addresses. A subject is *suspected* (an open inquiry, with the act and the standards where they can be named) or *determined* (one standard's outcome of a live determination: noncompliant, compliant or unclear). A suspected subject becomes determined when a determination is recorded on its act.
- **Support status** (from Case Making): `established`, `short of the standard` or `hypothetical`. Planning on a hypothetical subject is "hunch debt", shown and never hidden.
- **Plan:** the project's working material. It belongs to the project, never to a person, and is never published (DEC-25).
- **Option:** a summary, its detail, a category, the subjects it serves, an addressee and any regulated dates.
- **Scenario:** one layout of the chosen options into phases, with checkpoints and conditions.

**Rules A1–A17** (summary)
- **Creating:** a joined participant creates a plan naming one or more subjects; it may open with the inquiry (A1). Within a project, a subject is in at most one active plan, while other projects may plan it too (A2, DEC-72). Subjects are added or removed with a reason, a determination links to its suspected subject, and nothing is removed silently (A3).
- **Options:** an option carries its fields. A legal option has a tier (1, 2, 3 or undetermined, never defaulted). A lobbying option names the requirement it enforces (A4). The assistant's suggestions are stored apart and labelled. They draw on the subjects, the standards' text, the consequences, the profile's venues, deadlines and legal organisations, earlier plans "in this instance" on similar standards, and the project's kind of work, with no catalogue (A5). A member adds an option directly or through the assistant, which never adds one itself (A6). The dispositions are `open`, `chosen`, `declined` (with a reason), `done` and `blocked` (with a reason), singly or in bulk (A7).
- **Scenarios and time:** a plan holds up to three scenarios. Each has phases that start at the plan's start, after a phase, or on a condition, with checkpoints relative to the phase's start (A8). A condition is words; a member judges it at a checkpoint, the system reminds once and never judges (A9). There are two kinds of time that never mix: the group's checkpoints are never a finding about the government, while a regulated date names its basis (A10). A phase may branch on another subject's track (A11).
- **Acting:** starting a chosen option creates an Action that records the plan, the option and the optional contact (D5). The gate is at the act (DEC-26): evidence-seeking may rest on a suspected subject, while a breach assertion needs a live noncompliant determination. The plan never opens, advances or ends an escalation (A12). The plan reads each action's state and each subject's escalation stage (A13).
- **The machine** suggests and checks. It flags past or unreachable dates, an outward option resting only on hypothetical subjects, a branch with no next step, a subject no longer live, and lobbying with no requirement. It never adopts, chooses, declines, schedules or starts (A14).
- **What it is not:** no assignees, hours, costs or task lists. "The canon's free-form resources note on a step stays a note." Never published (A15).
- **UX:** options are collapsed to their summary and expand to their detail. The list sorts by category, regulated start or end date, subject and disposition (A16).
- **Closing:** A17, as in §1.3.

**Worked example.** A $100M school bond measure was certified as passed without two-thirds of the vote, and its proceeds were put into the general fund. That gives two acts, two determinations and possibly two escalations. The plan opens on the suspected subject with records requests. Its options then include demands to rescind the certification and to restrict the funds, an election contest (short regulated date), a grand-jury referral (Tier 1, both subjects), awareness and journalistic options. Scenario A: three months of mitigation, a checkpoint at week 8 ("earnest commitment"), then awareness and legal preparation. It branches: if the certification is voided, the second rule's question changes.

**Where it sits.** A new module `action-plans`, last in layer 9. It uses inquiry, conformance, consequences, standards, actions, escalation, jurisdictions, membership and ai-runs. Monitoring and the queue carry the checkpoints. The layer contract widens: "an action rests on the record, and one asserting a breach rests on a published finding and a standard". It is reconciled with Case Making §THE ACTION PLAN: that design's steps, branches, dispositions, suggest-and-check and never-published rule are kept. The plan is now keyed to subjects, not findings, and adds categories and scenarios. Resources are not costed.

---

## 3. INVENTORY and MATRIX

### 3.1 INVENTORY (step 1, 2026-09-29, at `main` @ `5bb688333c`)

**What it inventoried.** Four detailed source inventories, every claim cited:
- `canon-mission.md`: Roadmap, Design Requirements, Functional Architecture, System Design and the DEC rulings, on actor roles, plurality, non-breach actions, every named element and its contradictions.
- `canon-constructs.md`: State Rules, Publication, Membership, Case Making, AI Roles, Interaction Constructs and the UX substrate. It covers the Action object, the plan, six clock designs, three outcome vocabularies, outbound models and the UX open questions.
- `build-state.md`: the six layer-9 modules' requirements, rulings, vocabularies, the escalation stage table, profile sections, the monitoring and queue wiring, and the AI boundary.
- `code.md`: 181 of 181 tests passing, 45 routed ops, missing UI, an unscheduled `deadlineRecheck`, no skills, and an Oakland profile with no templates.

**Findings (§1):**
- The layer is built but narrow: one group, all members alike, acting against government offices, on a breach. The layer contract says "An action rests on a published finding and on a standard held in the record."
- Canon is broader ("turn findings into outputs", "tell a story") and close to Bob's framing, but canon never designed that breadth.
- Five doctrines constrain any widening: DEC-17 and DEC-54 (indexed on the work, not the person), OP1, DEC-24, "bad actors identified by evidence" and Requirement 12.

**§2 Bob's framing tested:**
- Kinds of groups, roles within a group, non-breach actions, communications, auditors and unions: gaps.
- Several actions: covered.
- Declining: partly covered.
- Lawyers: partly covered, as recipients only.

**§5:** sixteen contradictions among the documents. Examples: the contract against canon on "published"; mechanical against human escalation; seven stages against six; stored against derived clocks; the addressee shape; three outcome vocabularies; the plan against escalation; DEC-26 against Requirement 12.

**§6:** eleven gaps for Bob to decide (who the "groups" are, the layer's scope, non-breach purposes, unions, roles, communications, the plan, "consequences addressed", cross-group work, evidence grade per tier, a home document) and items for BOB to plan (wiring, a create op, affordances, profile data). It also found record-keeping defects: stale "not yet met" marks, and DEC-1–67 readable only on `coord`.

### 3.2 MATRIX (step 3, 2026-09-30)

**Axes:**
- §2 **purposes × stages of the work.** Ten purposes: seek evidence, mitigation, legal Tier 1–2, legal Tier 3, oversight and political accountability, awareness, journalistic, grassroots, recognition, and the plan itself. Six stages: Plan, Prepare, Decide, Send, Track, Close.
- §3 **actors**, as user, as addressee or recipient, and as audience: activists, journalists, lawyers, auditors and oversight bodies, independent auditors and CPAs, unions and special interests, administrators, other civic groups, residents.
- §4 **roles within a group:** prepare, choose or approve, send or speak for the group, record, bring resources, judge a checkpoint.
- Cell grades: Built, Wiring, Designed, Partly, Gap.

**Findings (§1):**
- The legal and breach track is nearly complete, blocked only by wiring and by the profile's missing templates.
- Every purpose outside the legal track stops at Prepare: no drafting help, no addressee shape, no tracking, no outcome.
- Non-activist actors appear only as recipients or offices.
- Roles within a group are thin.
- Two new gaps: no plan-closing rule, and no in-band stamp on filing drafts and packet exports.

**§5 changes implied:** A1–A16 plus the closing rule; `actions` addressee, plan link and outcome; communications preparation; and BOB's wiring, ops, skill and profile data.

**§6:** D1–D6 (§1.2 above).

**§7, re-run after the rulings:** "No cell is a gap. Everything is built, drafted, resolved by a ruling, or deferred by Bob with a trigger."
- Deferred: joint action with another group (trigger: a coalition asks); certification by a licensed professional (trigger: a group needs a licensed name on an output).
- Resolved: reach is not measured, by design; any contributing member may send; resources are a note.
- Bob was content and asked for priority.

---

## 4. What is in `build/requirements/action-plans.md` now, and what is not

**Carried, essentially as drafted** (draft R1–R28 → current R1–R28):
- Subjects and support (A1–A3 → R1–R5, R8).
- Reads (A13 → R6, R7).
- Options, addressee (D1), proposals, adoption (A4–A6 → R9–R11).
- Dispositions (A7 → R13).
- Scenarios, branches, checkpoints and the reminder read (A8, A9, A11 → R14–R17).
- Start (A12, D5, K600 override → R18).
- Checks (A14 → R19, plus the hostile-response check of K597).
- Close (A17 → R20).
- `work_kinds` (D4 → R21).
- Reminders (K613–K615 → R29).
- Invariants: R23 (A10, two kinds of time), R24 (machine proposes only), R25 (never published), R26 (no costs or scores; ruling 3), R27, R28.
- "Open for Bob: None."

Elsewhere:
- D1 → `actions` R9.
- D2 → `filings` R23 `communicationPrepare`, with the R22 in-band stamp.
- D3 → `actions` R7, where `completed` is allowed on any kind.
- D5 → `actions` R45.
- The plan link → `actions` R46.
- Pressure → `actions` R48.
- Venue standard → `actions` R49 and `filings` R25.
- Override disclosure → `filings` R24.
- Wiring went to `action-clocks`, `queue-producers` and monitoring.
- `filing-templates` was split out later (K921–K924).

**Changed in the fold or later:**
- R12: the draft let "detail or category states lobbying" trigger the rule. Now it reads only the member's `lobbying: true` mark, since the module never judges text ("Decided by BOB").
- R29: the reminders are rows in `action-clocks`' own table, set via `reminderSet` once the action exists, never a field of the action (K617, K624 (3)).
- R6: it reads `escalation.escalationsFor`, then `escalationRead`, and shows `work_kinds`.
- R11: it uses the control plane's `proposer` and `principal` stamps (K727) and `record-grammar` instead of `legacy-checks`.
- R18: it gains `premise_override`, the `contactNotAMember` helper and `action-clocks` R4 in the same act.
- **Suggestion sources narrowed:** A5 and the draft said earlier plans "in this instance" on similar standards. K660 (4) says "earlier plans of the same project only".

**Added since the lane:**
- R30–R34: the planning run (K660). Five proposals per page, ordered strongest first with no score; a disclosure that stops at adoption; a tray (`planProposals`); refusal of machine acts.
- R35: withholding unseen items in `planRead` (K903, DEC-36).
- R36: member-facing wording says "matter" (DEC-114).
- R37: `optionStartPreview` (DEC-115).
- R38: a phase may start on a body's duty occurrence state (`met`, `met_late`, `overdue`, `undetermined`; K1466, T33/T34).
- The status line says every requirement is met (K1845).

**Not in requirements:**
- **A16 (UX):** options collapsed to their summary, and sorting by category, date, subject and disposition. Nothing in the module says it. It lives only in the approved plan-page view (`build/plan/action-design/plan-page.html`), which is design, not requirement.
- **The worked example** (bond measure). It is in the views' sample data only.
- **The canon's free-form "resources" note on a step** (A15 kept it as a note; MATRIX §7 "Resolved: a note on a step"). No field holds it. R26 forbids cost keys, but nothing provides the note.
- **Ruling 2's "suggestions may learn from prior cases"** survives only as "earlier plans of the same project" (K660). It does not learn across projects or instances.
- **D6:** only canon (`BIO_Action_v0_1.md` §4 rule 9: "a group with a stake in a matter discloses it"). No requirement gives a disclosure field or act for a group's stake.
- **D4** covers projects only. No group-level or member-level type, by design.
- **Deferred by Bob:** joint action with another group (design in `BIO_Action_v0_1.md` §8: `partners`, an identical stamped text in both instances); certification by a licensed professional.
- **Never ruled by the lane:** plan publication (DEC-25 provisional, still "never published"); the backward question (D-165); action preconditions.

---

## 5. Open questions the lane left

The lane itself declared nothing open with Bob (K600: "Nothing in the Action design is open with Bob"). What remained open or was set aside:

1. **Joint action** across groups. Deferred; the trigger is a coalition asking.
2. **Certification** by a licensed professional. Deferred; the trigger is a group needing a licensed name on an output.
3. **DEC-25:** whether any part of a plan is ever published. It stays provisional as "never".
4. **D-165, the backward question** ("what else must be true for action X"), and action preconditions (standing, exhaustion, filing windows). Deferred in Case Making and not taken up.
5. **"Consequences addressed" and an adequate response** (INVENTORY §6 item 8). No ruling in the lane. Escalation's exit rules (K172) remain the only answer.
6. **Reach and impact of awareness or journalistic actions.** "Not measured, by design (no metrics)" (MATRIX §7). Impact claims still need outside evidence (DEC-14).
7. **Cross-group consumption and the directory** (UX OQ-12, OQ-29). Untouched.
8. **Whether an observed absence of a reply may be a basis leg** (Case Making §8). Deferred on a trigger.
9. **Reconciling the canon's leftover contradictions** (stored against derived clocks, the edge vocabulary, the legacy distribution model). `BIO_Action_v0_1.md` §5–§6 reconciled sixteen of them; whether State Rules §4.4 was ever amended was not checked here.
10. **The lane's Bob-recalled reminder points** came through BOB #74's session (K613), not through the lane's own messages. HANDOFF records this so that the two are not read as conflicting statements.
11. **Bob's D43 (2026-10-08)** says the actions work needs fresh "research, explore, and design [of] the requirements, capabilities, use cases, and UX of actions" (N817). That is the current lane's brief, so Bob does not regard the prior lane's output as the end of the design.

---

## 6. What happened to the lane

- **Session:** ACTION_DESIGN #1, `session_01AvsM94TwTtNzadzkdQdU58`, branch `claude/brave-johnson-5fqmix`, draft PR #5.
- **Commits:** 18 commits from `7cf9ef3add` (inventory, 2026-09-29) to `be85eafb39` (2026-09-30, Bob's words on nagging, K615).
- **Working line:** K592 (Bob: "make sure that this session only does design") limited it to design on its own branch, never `build/`, canon or `main`, and never merging.
- **Never merged:** `be85eafb39` is not an ancestor of `origin/main`.
- **Recorded by BOB (#74, #75):**
  - K590: rulings 1–10, D1–D6, the closing rule.
  - K591: drafts staged in `build/plan/action-design/` for the fold at T17's close.
  - K597 and K600: the `BIO_Action_v0_1.md` §7 rulings.
  - K608: canon approved, drafts correct, UX approved, priority.
  - K611: the fold basis via `build/plan/action-fold/`, with renumbering.
  - K613–K615: reminders and templates.
  - K629: corrected the priority.
  - K660: the planning skill.
- **Restaging:** the drafts were restaged several times by commits titled "Action design drafts restaged from …". Commit `7634be7a5d` (T18 preparation, "BIO_Action canon placed") put `BIO_Action_v0_1.md` at `docs/architecture/` and copied `ACTION-PLAN.md`, `INVENTORY.md`, `MATRIX.md` and `sources/` to `docs/development/action-design/` on the tranche line. That is the folder present now. The drafts, `PATH.md`, `UX-ANSWERS.md`, `HANDOFF.md` and the views are on `main` only under `build/plan/action-design/`.
- **Build:** the module `action-plans` was built in T18 onwards. Jobs ran on branches `job/T18…T34/action-plans`. Later tranches amended it (T24: DEC-114, DEC-115; T33/T34: R38), and it is now "every requirement met" (K1845). K1180 notes that T24 folded "the action-design HANDOFF line".
- **Retirement:** the lane worked under the old process (lanes, rings, `coord`), which has since been retired. The dates in `CLAUDE.md` do not fit, because the lane ran after the stated change date, so this was not resolved here. Its successor is this lane, N817 (K2382, Bob's D43: "Not today"). It was started 2026-10-09 as ACTIONS-DESIGN #1 on `design/actions`, building on `BIO_Action_v0_1.md` and the earlier Actions rulings.
