@@FILE ACTION-PLAN.md.txt (74 lines; read 1-74 complete)
@@WHAT
- ACTION-PLAN (src/action-design/ACTION-PLAN.md.txt): DRAFT design by ACTION_DESIGN #1, 2026-09-29, for a new layer-9 module `action-plans`, recording Bob's ten rulings of 2026-09-29 plus D1-D6 (agreed 2026-09-30) and rules A1-A17. A plan addresses "subjects" (suspected = open inquiry; determined = a conformance determination outcome), holds options (categorised), up to three scenarios laid out in phases/checkpoints, and starts Actions. Not build state until Bob approves the module and BOB folds the requirements (line 3). Contains a worked example (school bond certification).
@@TIME
- [DESIGN] ACTION-PLAN A8, line 42 — scenarios lay out chosen options in phases; a phase starts at plan start, after another phase, or when a condition is met; checkpoint set relative to the phase's own start — "it may carry a checkpoint set relative to its own start (\"8 weeks into mitigation\")"
- [DESIGN] ACTION-PLAN A9, line 43 — a condition is words judged by a member; system reminds once per checkpoint and never judges — "The system reminds once at each checkpoint and never judges a condition."
- [DOCTRINE] ACTION-PLAN A10, line 44 — two kinds of time that never mix: group's own intentions (checkpoints) vs regulated dates with a named basis; a missed checkpoint is never a finding about the government — "There are two kinds of time, and they never mix. A plan's checkpoints are the group's own intentions: a missed one is never shown as a finding about the government."
- [DESIGN] ACTION-PLAN A10, line 44 — "A regulated date belongs to an option or an action and names its basis."
- [DESIGN] ACTION-PLAN A4, line 36 — an option carries "its regulated dates, each naming the statute, order or commitment it comes from".
- [DESIGN] ACTION-PLAN A14, line 52 — machine flags "an option whose regulated date is past or unreachable in its scenario" (requires date arithmetic against a scenario layout).
- [DESIGN] ACTION-PLAN A16, line 61 — option list sorts "by regulated start or end date" among others.
- [DESIGN] ACTION-PLAN A11, line 45 — a scenario may branch on another subject's outcome (outcome-keyed timing/dependency).
- [DESIGN] ACTION-PLAN A3, line 33 — subject lifecycle over time: suspected becomes determined when a determination is recorded; inquiry closing without one is said; superseded determination is said and the option kept — "nothing is removed silently."
- [DESIGN] ACTION-PLAN ruling 10 / A1, lines 16, 31 — a plan may open when an inquiry begins, before anything is published or determined.
- [DESIGN] ACTION-PLAN §Where it sits, line 72 — "`monitoring` (layer 10) watches checkpoints; the queue carries one reminder per checkpoint." Deadlines come from `jurisdictions` profile ("venues, deadlines, legal organisations").
- [EXAMPLE] ACTION-PLAN worked example, line 67 — election contest/court petition "its regulated end date likely short, so it sorts first"; Scenario A "three months of mitigation; checkpoint at week 8".
@@ORGANISATIONS
- [RULING] ACTION-PLAN D1 (MATRIX §6, Bob 2026-09-30), line 18 — addressees: "a reporter or outlet, an organisation, another civic group or a described audience, never a private individual".
- [DESIGN] ACTION-PLAN A4, line 36 — an option names "whom it addresses (a government office, by role and body, or for awareness and journalistic options a described audience)" — office addressed by role and body, not by holder.
- [DESIGN] ACTION-PLAN A5, line 37 — suggestions draw on "the profile's venues, deadlines and legal organisations" (organisations held as jurisdiction-profile data).
- [RULING] ACTION-PLAN D5, lines 18, 48 — a started option may name the member who is the group's contact for it.
- [RULING] ACTION-PLAN D6, line 18 — "any group may use CivicOS, disclosing a stake".
- [DESIGN] ACTION-PLAN Terms/A2, lines 24, 32 — a plan belongs to the project, never to a person; a subject in at most one active plan per project; another project may plan the same subject (finding shared across projects, DEC-72).
- [EXAMPLE] ACTION-PLAN worked example, lines 65-67 — the city (certifying body, depositing body), county grand jury (referral), local reporters; demands addressed to the city.
@@LAW
- [DESIGN] ACTION-PLAN Terms "Subject", line 22 — determined subject = "an act measured against one standard, found noncompliant, compliant or unclear"; suspected subject names "the standards the group suspects, where it can name them".
- [DESIGN] ACTION-PLAN Terms "Support status", line 23 — `established`, `short of the standard`, `hypothetical` (from Case Making).
- [RULING] ACTION-PLAN ruling 6, line 12 — lobbying "is an allowed option only to enforce or restore an existing requirement; lobbying for new policy is outside Operational Principle 1."
- [DESIGN] ACTION-PLAN A4, line 36 — lobbying option must name "which existing requirement it enforces or restores (ruling 6: without one it is refused)"; legal option carries "its risk tier (1, 2, 3 or undetermined, never defaulted)".
- [RULING] ACTION-PLAN ruling 4, line 10 — "One plan may address several related broken rules", an option may serve several at once.
- [DESIGN] ACTION-PLAN A5, line 37 — suggestions from "the standards' text, the recorded consequences ... and earlier plans in this instance that addressed similar standards" (needs similarity between standards).
- [DESIGN] ACTION-PLAN A12, line 48 — gate at the act (DEC-26): evidence-seeking option may start on a suspected subject; "an action asserting a breach needs a live noncompliant determination, as `actions` already requires."
- [DESIGN] ACTION-PLAN §Where it sits, line 73 — layer contract widens: "\"An action rests on a published finding\" gives way to \"an action rests on the record, and one asserting a breach rests on a published finding and a standard\"."
- [EXAMPLE] ACTION-PLAN worked example, line 65 — two standards: the two-thirds vote requirement for a bond measure; the requirement that bond proceeds serve the voter-approved purpose; "They are two government acts, so there are two determinations".
@@COURTS
- [EXAMPLE] ACTION-PLAN worked example, line 67 — legal options: "an election contest or court petition (legal, subject 1 ...)"; "a referral to the county grand jury (legal, Tier 1, both)".
- [DESIGN] ACTION-PLAN A12, line 48 — "A legal option on a noncompliant subject is attached to that determination's escalation as today; the plan never opens, advances or ends an escalation."
- [DESIGN] ACTION-PLAN A13, line 49 — the plan reads for each subject "its escalation's stage, so the member sees where each track stands".
- [DESIGN] ACTION-PLAN worked example, line 65 — each determination's escalation has "its own venue and deadlines".
- [DESIGN] ACTION-PLAN ruling 9, line 15 — categories include "legal".
@@ANALYSIS
- [RULING] ACTION-PLAN ruling 3, line 13 — "**No budgets.** Neither money nor licensed resources are costed."; A15 line 55 — "no assignees, hours, costs or task lists".
- [DESIGN] ACTION-PLAN §Where it sits, line 72 — uses `consequences` ("what is at stake"); A5 uses "the recorded consequences".
- [EXAMPLE] ACTION-PLAN worked example, line 65 — "$100M school bond measure" not reaching "the required two-thirds vote" (a count/percentage test underlying a determination).
@@QUESTIONS
- [DESIGN] ACTION-PLAN A5, line 37 — "The assistant suggests options, and each suggestion is stored apart from the plan and labelled as the machine's." Inputs: subjects, standards text, consequences, profile venues/deadlines/legal organisations, earlier plans in this instance, project's declared kind of work (D4) which "shapes suggestions and nothing else". "A suggestion becomes an option only when a member adopts it."
- [DESIGN] ACTION-PLAN A6, line 38 — member adds an option through the assistant, "which asks for what the option needs and shows it before the member adds it. The assistant never adds one itself."
- [DOCTRINE] ACTION-PLAN A14, line 52 — "The machine suggests (A5) and checks." ... "It never adopts, chooses, declines, schedules or starts anything."
- [RULING] ACTION-PLAN D2, line 18 — "the assistant drafts communications as proposals a member adopts".
- [RULING] ACTION-PLAN ruling 2, line 11 — no catalogue of response options; "Suggestions may learn from prior cases."
@@DOCTRINE
- [GAP] ACTION-PLAN Status, line 3 — builds on Case Making §THE ACTION PLAN "which no module or requirement carries yet (UX open question 9, use case 126)"; "Nothing here is build state until Bob approves the module and BOB folds the requirements."
- [DOCTRINE] ACTION-PLAN Terms, line 23 — "Planning on a hypothetical subject is hunch debt (Declared Bias), shown, never hidden."
- [DOCTRINE] ACTION-PLAN Terms/A15, lines 24, 55 — plan is never published and never read by publication (DEC-25).
- [DOCTRINE] ACTION-PLAN A12, line 48 — DEC-26: "The gate is at the act, not the plan".
- [RULING] ACTION-PLAN ruling 7 / A7, lines 13, 39 — "An option left unticked is undecided. Declining is an explicit act ... records a short reason"; plan keeps "the options NOT taken".
- [RULING] ACTION-PLAN A17, line 58 — "a plan never closes itself" (Bob, 2026-09-30).
- [DOCTRINE] ACTION-PLAN A10, line 44 — group intentions never shown as findings about the government.
- [DESIGN] ACTION-PLAN §Where it sits, line 72 — new module `action-plans` "last in layer 9 (after `escalation`)"; uses inquiry, conformance, consequences, standards, actions, escalation, jurisdictions, membership, ai-runs; "Adding it is a technical decision, BOB's (Bob, 2026-09-30)".
@@CROSS
- ACTION-PLAN binds TIME to LAW: regulated dates must name a statute/order/commitment (A4, A10), while checkpoints are relative durations of the group's own; the machine must compute reachability of a regulated date within a scenario (A14) — a scheduling/date-arithmetic need inside layer 9.
- A plan opens at inquiry start (ruling 10) yet sits in layer 9: the plan (layer 9) can read inquiry (layer 6) fine, but the reverse is impossible — the inquiry cannot see the plan's standards/deadlines. The assistant suggesting options (A5) uses standards, consequences and profile deadlines, i.e. the QUESTIONS construct reaching into LAW/TIME/ORGANISATIONS, which only works from layer 9 (via ai-runs, layer 6) — implies the assistant's reach to law/time is layer-dependent.
- ORGANISATIONS addressed "by role and body" (A4) — positions not holders, consistent with the private-individual ban (D1).
