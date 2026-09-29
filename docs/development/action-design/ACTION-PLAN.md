# The action plan

**Status** · DRAFT design by ACTION_DESIGN #1, 2026-09-29, from Bob's brainstorm and rulings the same day (below). It builds on the action-plan design in `BIO_Case_Making_v0_1.md` §THE ACTION PLAN (Bob, 2026-08-03), which no module or requirement carries yet (UX open question 9, use case 126). Nothing here is build state until Bob approves the module and BOB folds the requirements.

## Bob's rulings, 2026-09-29

1. **The Action layer gets an action plan.** A publication can give rise to several plans. A member creates one; the system suggests options; the member adds others, directly or through the assistant; the member chooses which to pursue and lays them out over time. It is not a project-management system: it helps the group understand its options and envision scenarios.
2. **No catalogue of response options.** Every documented breach calls for a response that is largely its own; a formal catalogue would limit and mislead. Suggestions may learn from prior cases.
3. **No budgets.** Neither money nor licensed resources are costed.
4. **One plan may address several related broken rules**, and an option may serve several of them at once (public awareness of a bond measure falsely certified *and* of its proceeds moved to the general fund), while others serve one.
5. **A plan may also start from a compliant or unclear determination** (a success story, a records campaign).
6. **Lobbying** is an allowed option only to enforce or restore an existing requirement; lobbying for new policy is outside Operational Principle 1.
7. **An option left unticked is undecided.** Declining is an explicit act, taken only if the member wants to, and it records a short reason, because a plan keeps "the options NOT taken".
8. **A plan holds up to three scenarios**, alternative ways of laying out the chosen options, to compare.

## Terms

- **Subject:** one outcome of a live conformance determination: a government act measured against one standard, found noncompliant (a broken rule), compliant or unclear.
- **Plan:** a project's working material that addresses one or more subjects. It belongs to the project, never to a person, and is never published (DEC-25).
- **Option:** something the group could do: a summary, its detail, a category, the subjects it serves, whom it addresses, and any regulated dates.
- **Scenario:** one layout of the chosen options into phases, with checkpoints and conditions.

## The rules

**Creating a plan**
- **A1** A member who is a joined participant of a project creates a plan naming one or more subjects from the project's live determinations.
- **A2** Within a project, a subject is in at most one active plan. Another project may plan the same subject its own way (a finding is shared across projects, DEC-72).
- **A3** A subject may be added to or removed from a plan later, with a reason. When a subject stops being live (its determination is superseded), the plan says so and keeps the option bound to it; nothing is removed silently.

**Options**
- **A4** An option carries: a one-line summary; its detail; a category (mitigation, legal, awareness, journalistic, grassroots, or other); the subjects it serves (one or more of the plan's); whom it addresses (a government office, by role and body, or for awareness and journalistic options a described audience); its regulated dates, each naming the statute, order or commitment it comes from; for a legal option, its risk tier (1, 2, 3 or undetermined, never defaulted); for a lobbying option, which existing requirement it enforces or restores (ruling 6: without one it is refused).
- **A5** The assistant suggests options, and each suggestion is stored apart from the plan and labelled as the machine's. It works from the plan's subjects, the standards' text, the recorded consequences, the profile's venues, deadlines and legal organisations, and earlier plans in this instance that addressed similar standards. There is no catalogue (ruling 2). A suggestion becomes an option only when a member adopts it.
- **A6** A member adds an option directly, or through the assistant, which asks for what the option needs and shows it before the member adds it. The assistant never adds one itself.
- **A7** An option's disposition is `open` (the default), `chosen`, `declined` (with a reason), `done` or `blocked` (with a reason). Choosing and declining may be done singly or in bulk.

**Scenarios and time**
- **A8** A plan holds up to three scenarios. Each lays out the chosen options in phases. A phase starts at the plan's start, after another phase, or when a condition is met, and it may carry a checkpoint set relative to its own start ("8 weeks into mitigation").
- **A9** A condition is written in words and judged by a member ("the city shows earnest commitment"). At a checkpoint the member records what they judged and the scenario follows the branch it names. The system reminds once at each checkpoint and never judges a condition.
- **A10** There are two kinds of time, and they never mix. A plan's checkpoints are the group's own intentions: a missed one is never shown as a finding about the government. A regulated date belongs to an option or an action and names its basis.
- **A11** A scenario may branch on another subject's outcome: an option bound to one rule may depend on how another rule's track ends.

**Acting on the plan**
- **A12** Starting a chosen option creates an Action (the `actions` module), which records the plan and option it came from and rests on the determinations of the option's subjects. A legal option on a noncompliant subject is attached to that determination's escalation as today; the plan never opens, advances or ends an escalation.
- **A13** The plan reads, for each option it started, the action's state and correspondence, and for each subject its escalation's stage, so the member sees where each track stands.

**The machine**
- **A14** The machine suggests (A5) and checks. It flags an option whose regulated date is past or unreachable in its scenario, a branch with no next step, an option bound to a subject no longer live, and a lobbying option with no existing requirement. It never adopts, chooses, declines, schedules or starts anything.

**What it is not**
- **A15** Not a project-management system: no assignees, hours, costs or task lists (ruling 3). The canon's free-form resources note on a step stays a note. Not published, and never read by publication (DEC-25).

**Presenting it (UX)**
- **A16** Options show collapsed as their summary, expanding to their detail. The list sorts by category, by regulated start or end date, by subject and by disposition.

## Worked example

A city certifies a $100M school bond measure as passed although it did not reach the required two-thirds vote, then deposits the proceeds in its general fund. Members publish the case and record two determinations: the certification against the two-thirds requirement (noncompliant), and the deposit against the requirement that bond proceeds serve the voter-approved purpose (noncompliant). They are two government acts, so there are two determinations and, if pursued, two escalations, each with its own venue and deadlines.

One plan names both subjects. Its options include: a demand to the city to rescind the certification (mitigation, subject 1); a demand to move the proceeds to a restricted account (mitigation, subject 2); an election contest or court petition (legal, subject 1, its regulated end date likely short, so it sorts first); a referral to the county grand jury (legal, Tier 1, both); a public-awareness campaign (awareness, both); a briefing for local reporters (journalistic, both). Scenario A: three months of mitigation; checkpoint at week 8, "the city shows earnest commitment"; if not, awareness begins, then legal preparation. It branches: if the certification is voided, the second rule's question changes, since proceeds of a measure that never passed should not exist.

## Where it sits

- **A new module, `action-plans`, last in layer 9** (after `escalation`), for Bob's approval as architecture. It uses `conformance` (subjects), `consequences` (what is at stake), `standards`, `actions` (a started option), `escalation` (each subject's track), `jurisdictions` (venues, deadlines, legal organisations), `membership` (who may act) and `ai-runs` (the assistant's suggestions). `monitoring` (layer 10) watches checkpoints; the queue carries one reminder per checkpoint.
- **Changes elsewhere:** `actions` gains the plan and option an action came from. The layer contract widens with ruling 5: a plan, and an action it starts, may rest on a compliant or unclear determination; breach actions keep the stricter rule.
- **Reconciled with Case Making:** its steps, dependencies, deadlines, outcome-keyed branches, dispositions, suggest-and-check machine and never-published rule are kept. Changed by Bob's rulings: a plan is keyed to determination outcomes rather than findings; options carry categories and the subjects they serve; scenarios are added; resources are not costed. Its "support status" (established, short of the standard, hypothetical) and DEC-26's gate at the outward act are carried by the Action an option starts, not by the plan.

## Open for Bob

1. **The categories:** mitigation, legal, awareness, journalistic, grassroots, and other. Keep "other"? Recommended: yes, so an option that fits none is not forced into one.
2. **Options before any determination:** may a plan hold options for an unclear matter still under inquiry, such as a records request, before members have determined anything? Recommended: no; that work stays an inquiry's action, and ruling 5 already lets an unclear determination start a plan.
