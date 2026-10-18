# K2075 mapping: Bob's plan construct against canon, built modules and D1–D24

**Status** · A worker's report for BOB #134, 2026-10-07, read-only research; for INVESTIGATION-DESIGN #1 (K2076). Not a ruling.

**Report for BOB #134: Bob's "project as investigation" points, checked against canon, built requirements and the study's D1–D24**

I only read; nothing was written. Sources: rulings K1627, K1628, K2064, K1450, K1502, K1755 and K1757 (read in full); synthesis §1–§3, §5.1, §6 and §7 (`git show origin/study/investigation:study/investigation/synthesis/architecture.md`); Membership §1–§7 and §10; State Rules §4.3; Action §4; Case Making §THE ACTION PLAN; Capability Ladders §9.4–9.5 and §10; Interaction Constructs §T and §R; DECs 48, 68, 69, 70, 72, 79, 82, 89, 94, 97, 98, 111, 135 and 136; requirements for tasks, intent, inquiry, action-plans, actions, ai-runs, membership, money, people and project-stage. The working tree is `tranche/T36`.

## 0. Is the project the investigation's home, and what does canon say a project is?

- **The project is the home.** K1627: "The project becomes the investigation's home, with one view and a timeline." The synthesis (§3.1 and the "already ruled" line under §6.1) treats this as a reading BOB records rather than a question for Bob: one investigation is exactly one project, with no separate investigation object (HOME D-H1). It keeps one bar and one set of sight rules.
- **Canon defines the project.** State Rules §4.3 gives it an objective, an analysis record, a work-product readiness ladder, evaluations and a lifecycle: forming → investigating → matured → closed. The first three stages are computed and never set by hand; `closed` is the owner's act with a reason (K356, K362, DEC-79; `project-stage` derives it).
- **Members of a project.** Membership §7 has three positions: uninvited, invited-not-joined (sees the skeleton only), and joined. Participants hold **owners**, a set governed by §7.10. Administrators see everything and direct nothing (§7 preamble). Every participant sees every other participant's handle (§7.8).
- **Roles.** Owner and participant are the only project roles. DEC-72 (5): "manager is the existing project owner role, no third role minted." There is **no team leader, team or subgoal construct** inside a project.
  - `intent` has aspirations, goals and objectives. A goal is a group-level "bounded pursuit" that links objectives across projects (intent R8). Each project has **one** objective (R1).
  - Inside a project the work is broken down by **questions**: `inquiry`, its `divide` act, and its division children.
  - inquiry R39 uses "team" to mean a project ("one team's disposition never moves another team's stance").

## 1. Each of Bob's points

**(a) A plan made of steps that are added, completed, or deleted when no longer needed: partly specified, not ruled or built.**
- The study's `enquiry` module (§3.2, D1) defines a step's states: proposed, adopted, underway, waiting, satisfied, blocked, retired, declined. Every move carries a reason.
- `replanDue` and `stopRead` (watch or close, D16) keep the plan realistic. Re-proposing a step is allowed only when a cited source changes.
- The machine proposes steps and a member adopts them (D3, D5, D7).
- **Gap: "deleted".** Doctrine is that nothing vanishes: retire or decline with a reason, the item ages and stays readable (IC §T "never silently dropped"; DEC-70; intent R17). So in canon terms "deleted" means "retired with a reason, still shown".
- D1, D3, D7 and D16 are all still open with Bob (K2064).

**(b) The engine manages dependencies between steps: partly there.**
- In the study, a step has `serves`, `discriminates` and a `blocked` state, and a line of enquiry orders its steps. There is **no step-to-step dependency field**.
- The pattern already built elsewhere:
  - `action-plans` R14 and R15: phases start `after` another phase, `branch_of` with met/not_met, on another subject's track, or `when_duty` (R38); `PHASE_CYCLE` is refused.
  - `civil-time`'s `dependency` due-basis `{precedes, lead, why}` (K1431).
  - Case Making §THE ACTION PLAN §3: Bob asked for "dependency graphs keyed to possible outcomes of each step".
- Adding step dependencies to `enquiry` is new but has precedent.

**(c) Estimating and tracking resources (people, money, information, connections, expertise, optional AI budget): mostly new, and partly against existing rulings.**
- *Information:* already designed. `holdings` records each document as sought → requested → held → read → cited, with "Waiting on" lines (§3.2, D17).
- *Expertise:* built. Members declare an expertise and an administrator confirms it; it gates nothing (Membership §1.3, membership R21–R24). DEC-135 "Ask for a check" sends a request by expertise (tasks R13–R17).
- *People:* there is the participant list (§7.8) and nothing else. No capacity or availability is held.
- *Connections:* nothing for a group's contacts. `actions` R45 has a `contact`, which is a member, "grants nothing". Sources are protected (DEC-78), and members' ties are recorded only by their own act (K1484 row 19).
- *Money:* **conflicts.** Bob's own Action ruling 3 (2026-09-29): "No budgets. Neither money nor licensed resources are costed." This is carried in Action §4 rule 8 and `action-plans` R26, which refuses `budget`, `cost`, `hours` and `assignee` keys. K1463 and money R6 add that the group's money is never marked "ours" and there is no separate ledger. One precedent points the other way: Bob, 2026-08-03 (Case Making), "a means of collecting and presenting associated resource[s] … (a collapsable list?)", adopted as a free-form, uncategorised list with no arithmetic. It was later dropped from `action-plans`.
- *AI budget:* **partly built, and the project level is new.**
  - Built: a per-member daily ceiling set by the member, with an administrator's lower copy-wide ceiling (K1450; ai-runs R50). Administrators see monthly use per mode, naming no member (R51). Members see their own use and never a cost per answer (K1450).
  - Use under the group key counts against the member's own day (K1755, K1757; ai-runs R48 and R52).
  - The synthesis §7 deliberately builds **no per-investigation allowance** ("later, on a measured need", R3 C-c). D12 (cost estimates and actual cost shown to the paying member) is open.
  - A project budget is feasible only over the group key. A member's own subscription is the member's own (K1502, K1755).

**(d) Deadlines and milestones: partly there.**
- Built or specified: due-dates on four bases (rule, commitment, dependency, the group's own `window`; K1431; Ladders TIME B2 "windows the group sets: checkpoints, reminders"); a step's `by_when` with a basis (study); action clocks; plan checkpoints (action-plans R16 and R17); project waits (D17); reminders only at the member's own request (DEC-94); and the computed project stage as the only "milestone" (DEC-79).
- Doctrine to keep: "the group's own checkpoint is never a finding about government" (Ladders §10; D234). Case Making §3 says the group's missed deadline must never surface as a finding.
- Gap: the group's own named milestones for an investigation do not exist.

**(e) Assignments to some members, organised as a team with a high-level goal and subgoals: new, and against the study's recommendation and BOB's own readings.**
- D23 (open with Bob): "a member may claim a step for herself ('I'm on it'); nobody assigns steps to others."
- §7 rejects "a case-management console with tasks, assignees, roles and cadence reminders", citing DEC-72, MEM §7.9, Ladders §10 ("no drift into BI, case management or dashboards", DEC-48), DEC-69 and DEC-94.
- HOME's study: "who works on what is the members' conversation, not a field" (inference).
- The "no assignees" in Action §4 rule 8 is BOB's gloss (ACTION-PLAN A15). Bob's own words were "not a project-management system" and "no budgets", and they concern **action plans**. Under K1762 his words govern.
- Precedents for assigning already exist:
  - tasks R3: an obligation has an assignee and can be forwarded to a named member.
  - DEC-135 (6): an owner "may ask a named member instead".
  - `actions` R45: a `contact` member on an action.
- Nothing in Membership forbids assignment, but there is no subgoal or team leader role (see §0).

**(f) Project and subgoal leaders produce status reports: partly there as reads, new as an authored act.**
- The study's `investigation` module composes the reports: `investigationOf` (where it stands), `journalOf` and `changesSince` ("what we did"), and `projectAnswer`. All are composed on read and labelled. `changesSince` starts from the member's own last act, never from what a member viewed (DEC-68).
- Doctrine limits:
  - No percentage or score (DEC-82, DEC-89; intent R19 "progress is derived, never reported").
  - Nothing measures an individual member: DEC-68; DEC-111's activity level counts "members' work, never the assistant's, never volume", for the group; acceptance rates are "never per member" (§3.5).
  - Working material is never published (D15, which BOB settled).
- New: a report authored by a leader, and a report per subgoal or team.

## 2. Conflicts to put plainly

1. Assignments, teams and leaders against D23, synthesis §7 and Ladders §10's "no drift into case management". These are BOB readings and study recommendations, not Bob rulings; Bob's own words limit only action plans.
2. Money and resource estimates against Bob's "No budgets" (Action rule 8) and K1463.
3. A project AI budget against K1450's per-member model and §7's deliberate absence. It is compatible with K1755 only for use under the group key.
4. "Deleted" steps against append-only, never-silently-dropped doctrine.
5. Status reports and assignments against DEC-68 (no measuring members) and DEC-69 (no nagging). A deadline on someone else's assignment must not become a reminder they did not ask for (DEC-94).
6. Anonymity: members are known by handles, and acts **are** attributed to handles (Membership §1.2, §3). So "who did what" is recorded. What is excluded is measuring or scoring a member, and putting members' names in anything outward (DEC-111 (2)).

## 3. Questions that are Bob's

1. **Who decides who works on what?** (A) Members claim work themselves; owners see who claimed what (D23). (B) An owner may also assign a step to a named member, who may accept or decline with a reason; nothing measures them. (C) Full assignment with due dates. **Recommend B:** real teams, such as newsroom editors (DEC-128), do assign; accept/decline keeps DEC-69's respect, and tasks R3 and DEC-135 (6) already assign narrowly.
2. **Leaders and subgoals.** (A) No new role: owners lead, and subgoals are questions or lines of enquiry. (B) A named "lead" on a line of enquiry, which is a label that grants no power. (C) Sub-teams with their own membership and authority. **Recommend B:** it gives a visible lead without minting a third authority, which DEC-72 avoided.
3. **Money and other material resources.** (A) Keep "no budgets". (B) A free-form "what this needs" list on a step, with no arithmetic (Bob's 2026-08-03 "collapsable list"). (C) Costed estimates and totals. **Recommend B:** it matches his earlier ruling and leaves room for a schema once real groups' lists exist.
4. **AI budget for an investigation.** (A) None; per-member ceilings only (as built). (B) An optional project allowance over group-key use, set by an owner, which counts and warns once. (C) A hard project cap that also covers members' own accounts. **Recommend B:** it is optional, as Bob said, and stays clear of the member-owned subscription (K1502, K1755). This also requires settling D12.
5. **Status reports.** (A) Composed reads only ("where it stands", "what we did"). (B) A leader writes a dated report as prose, with the composed read attached; never a score, never per-member figures, never published. (C) Scheduled reports, required on a cadence. **Recommend B:** an authored judgement is respected, and C breaks DEC-69 and DEC-94.
6. **Retiring steps.** (A) Retire with a reason, still visible (doctrine). (B) Allow a real delete of steps never adopted. **Recommend A for adopted steps and B for unadopted proposals:** the decision log keeps what was decided against, and noise is not kept.
7. **The group's own milestones.** (A) Allow named, dated milestones on the plan, the member's own and never a finding about government. (B) Computed project stages only. **Recommend A.**

Bob's open D-decisions D1, D3, D7, D12, D16 and D23 are directly affected by the answers above.

## 4. BOB's technical choices (not decided here)

- Where step dependencies live (an `enquiry` field following action-plans R14's phase form, with a cycle refusal) and whether "blocked" is derived from them.
- The shape of an assignment or claim (a step field, or a `tasks` kind with forwarding), and its refusal codes.
- How a line-of-enquiry lead is stored, and the authority checks (`projectAuthority`).
- The status report's object: an owner module (`investigation`), its sight and purge classes, and its history.
- The resources list's storage and limits.
- A project allowance in `ai-runs` (how it is metered, which account it applies to, how it is refused) and its interaction with R50 and R52.
- Milestones as `civil-time` windows, how they feed "Waiting on", and the queue kinds involved.
- Layer placement and the registration seams.