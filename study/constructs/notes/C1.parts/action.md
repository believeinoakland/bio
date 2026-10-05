# Action extracts (BIO_Action_v0_1.txt)

## chunk 1-40
TIME
- [DESIGN] §3 Standard L20 — standard "held as captured text with its citation and period in force" (effective/in-force period)
- [DESIGN] §3 Action L24 — Action carries "clock (each deadline with its basis)"
- [DESIGN] §3 Action plan L23 — "up to three scenarios with checkpoints a member judges" (time checkpoints)
- [DESIGN] §3 L28 — "Monitoring (layer 10) watches the actions' clocks and the escalations' triggers and tells members; the queue carries the reminders."
- [DOCTRINE] §2 L14 — "Every deadline names its basis."
- [RULING] §4 rule 5 L36 — "Every deadline names its basis, and members are told without being nagged." Reminders per DEC-10, DEC-69, DEC-70, DEC-94: "a deadline reminder is the member's own request, set when the option is chosen from defaults the member sees; it fires as asked ...; an overdue date notifies once; a nearing date changes display only; no outside channel; nothing is repeated unless the member asks (K613–K615)."
- [DESIGN] §1 L8 — span "from the first suspicion that something is wrong or working, through planning, preparing, deciding and sending, to tracking the response and recording how it ended"
ORGANISATIONS
- [DESIGN] §1 L10 — "Different groups act differently on the same record: a reporter reports, an activist works to fix, a lawyer supports or changes a claim, an oversight body refers, an administrator responds." (actor kinds incl. oversight bodies and administrators as users)
- [DESIGN] §3 Consequence L22 — "what a breach did and to whom (a class, fund, program, service or body, never a person)" — funds, programs, services, bodies as harmed parties
- [DOCTRINE] §4 rule 6 L37 — "Addressees are roles, not people. An action is addressed to a government office by role and body, a reporter or outlet, an organisation or another civic group by role and organisation, or a described audience; never a private individual (Requirement 6). An action asserting a breach is addressed to an office."
- [DESIGN] §3 Determination L21 — "a member's judgment that a named government act is compliant, noncompliant or unclear" (government act attributed to a body)
- [DOCTRINE] §4 rule 9 L40 — "a group with a stake in a matter discloses it (D6)"
LAW
- [DESIGN] §3 Standard L20 — "what a government act is measured against: a statute, regulation, ordinance, court decision or order, adopted policy or public commitment, held as captured text with its citation and period in force" — home module `standards`
- [DOCTRINE] §2 L14 — "An action rests on the record, and one asserting a breach rests on a published finding and a standard held in the record."
- [DESIGN] §3 Determination L21 — "compliant, noncompliant or unclear against named standards, per standard, resting on published findings" — home `conformance`
- [RULING] §4 rule 1 L32 — "declaring a standard" is a member act; machine "may find, compare, compute, propose and draft"
- [RULING] §4 rule 2 L33 — "An action that asserts a breach is refused by default unless it rests on a live noncompliant determination; a member may proceed anyway only by an attributed act with a stated reason"; "An action that seeks evidence (a records request, a request for comment) is never gated." (DEC-26; Bob 2026-09-30)
- [DESIGN] §3 Filing L25 — "Tier 1–2 filings from the profile's templates, the Tier 3 counsel packet for named counsel"
- [DESIGN] §3 Escalation L26 — "pursues one noncompliant determination until compliance is restored and its consequences are addressed" — home `escalation`
COURTS
- [DESIGN] §3 Standard L20 — "court decision or order" is a kind of standard
- [DESIGN] §1 L10 — "a lawyer supports or changes a claim, an oversight body refers"
- [DESIGN] §4 rule 7 L38 — "A member sends by the venue's own means and records the sending with the bytes sent" (venue incl. courts)
ANALYSIS
- [DESIGN] §3 Consequence L22 — "computed from the record or assessed by a member, with causation as its own finding; whether each part is addressed" — home `consequences`
- [RULING] §4 rule 3 L34 — "No significance, no score. ... No field holds significance, severity, priority or a score."
- [RULING] §4 rule 8 L39 — "No catalogue, no budgets ... the plan holds no costs, assignees or hours (Bob, 2026-09-29)" (group's own budgets, not the government's)
QUESTIONS
- [DOCTRINE] §2 L14 — "The group plans and decides every act; the AI proposes and prepares, and never files or sends."
- [RULING] §4 rule 1 L32 — "The machine may find, compare, compute, propose and draft, always labelled as machine work, and never does any of these acts (DEC-24, DEC-27; Roadmap §10)."
- [RULING] §4 rule 8 L39 — "Suggested options come from reasoning over the matter and from the group's own earlier plans, never from a fixed list"
DOCTRINE
- [DOCTRINE] §2 L14 — "Compliance is recorded as carefully as noncompliance."; §4 rule 4 L35 "Compliance counts ... recognition and success stories are actions."
- [RULING] §4 rule 2 L33 — "The gate is at the outward act, not the reasoning (DEC-26)"; "A plan may rest on premises not yet established, shown as hunch debt." "No tool has the final word (Requirement 12)"
- [RULING] §4 rule 7 L38 — "Nothing leaves by a system path. The instance transmits nothing."; "A plan is never published (DEC-25); a counsel packet is never published and never fileable as it stands."
- [RULING] §4 rule 9 L40 — "Civicsmith takes no position on what policy should be (Operational Principle 1). ... Policy advocacy and candidate support are not actions."
- [DESIGN] status L3 — APPROVED by Bob 2026-09-30 as canon; gathers FA v3 Layer 3, DR 7-8, State Rules §4.4, Case Making §2, Publication §6, §8, layer-9 requirements (build/layers.md, K102); §5 reconciles sixteen contradictions (INVENTORY.md §5); applies §6 canon edits at tranche boundary (K592)
- [DESIGN] §3 L28 — "an inquiry opens a plan (suspected); publication and a determination make its matters determined" (a plan may start from an inquiry before publication; determination requires publication)

## chunk 41-100
TIME
- [DOCTRINE] §4 rule 11 L42 — "Jurisdiction lives in data. Kinds, venues, templates, offices, legal organisations, deadlines and holidays come from a jurisdiction profile; a missing fact reads undetermined, never a default (build/layers.md, 'No jurisdiction in the product')." (holidays and deadlines are profile data)
- [RULING] §5 row 2 L51 — "a met trigger is proposed, with its age; a member advances or declines with a reason" (K102, Bob 2026-09-26)
- [RULING] §5 row 4 L53 — clock reconciliation: "an action's clock entries are stored with their basis, overdue is derived when read, and the one machine write is the mechanical pending→overdue mark; a records request's next-stage due date lives on its correspondence entry" (actions R12, R25, R33; monitoring R34, approved 2026-09-26) — CONFLICT resolved: State Rules I-11, I-20 (clock stored and marked) vs Case Making ("the clock is never encoded")
- [DESIGN] §5 row 7 L56 — three outcome vocabularies: action resolution "(complied, denied, escalated, withdrawn, completed)", correspondence outcome "(granted, denied, partial, reversed, affirmed, none stated)", escalation evaluation of a response "(complied, partial, denied, none)" (D3; actions R7, R21; escalation R10) — "reversed, affirmed" are appellate-style outcomes
- [DESIGN] §5 row 8 L57; §6 L73 — edge `references` "(a finding of non-response → the action)" — non-response as a finding (time-based)
- [DESIGN] §3/§8 — none further
ORGANISATIONS
- [RULING] §4 rule 10 L41 — "A project may declare the kind of work it does (reporting, fixing, legal, oversight, other), which shapes what the assistant suggests and nothing else. No attribute of a person gates, filters or orders anything (DEC-17, DEC-54)."
- [DOCTRINE] §4 rule 11 L42 — "offices, legal organisations" come from a jurisdiction profile
- [RULING] §5 row 5 L54 — "A free-text counterparty (State Rules) against an office by role and body (requirements)" reconciled: "rule 6: the addressee shapes, never a person" (actions R9; D1)
- [DOCTRINE] §4 rule 12 L43 — "People are presumed to want better outcomes, and a bad actor is identified by evidence, never by role."; "pressure against the group or its supporters is recorded as evidence (Operational Principle 8), and can open an inquiry of its own"
- [RULING] §5 row 15 L64 — Roadmap's "war" and "protection network" vs "all stakeholders are presumed to want better outcomes": "both hold, for different things"
- [RULING] §7.5 L83 — "Confidential referral: an action addressed to the oversight office, prepared as a filing or communication, sent by the member's own hand and recorded; nothing non-public leaves by a system path (DEC-31)."
- [RULING] §7.6 / §8 L84, L96-100 — joint action with another group "recorded and deferred"; "membership never crosses a group boundary (Membership §2)"; near-term: "each group records the joint act as its own action, naming its partner groups (D1's group addressee kind, reused as partners)"; trigger "a coalition of groups asks to act jointly" (GAP)
- [RULING] §7.7 DEC-114 L85 — member word "Matters" for what a plan addresses; "'Subject' keeps its one member-facing meaning, an entity on the Subjects screen"
LAW
- [RULING] §5 row 6 L55 — "Seven state-specific kinds (State Rules) against law-neutral product kinds and profile kinds": "the product's kinds are those whose rules it enforces (records request, request for comment, other); every other kind comes from the profile; old kinds read as written" (actions R10; "No jurisdiction")
- [RULING] §5 row 1 L50 — "an action rests on the record; only a breach action needs a published finding" (Bob's rulings 5 and 10, 2026-09-29; DEC-13; DEC-26)
- [RULING] §5 row 16 L65; §7.2 L80; §8 L90-94 — DEC-26 vs Req 12/Req 8: option (c) "refuse by default; a member may override by an attributed act with a reason, disclosed on the action and everything prepared from it; evidence-seeking actions never gated"; "Built today: actions R8 refuses an action that asserts a breach unless it rests on a live noncompliant determination."
- [RULING] §5 row 10 L59 — risk tier "both: a kind's tier from the profile and an action's tier set by a member; a filing is governed by the stricter; undetermined is never read as 1" (filings Terms, R2)
- [RULING] §5 row 11 L60 — "the plan is the strategic layer above; each determined breach keeps its own escalation; a legal option joins it; the plan never moves an escalation"
- [RULING] §7.4 L82 — "Certification by a licensed professional: deferred until a group needs a licensed name on an output" (GAP)
- [RULING] §6 L73 — State Rules §5.1 vocabulary gains `action_basis` "(action → the inquiry, determination or information it rests on or advances)", `responds_to`, `references`; §4 gains action-plan type `PLN-`
COURTS
- [RULING] §4 rule 13 L44 — "The venue sets the standard of evidence (Bob, 2026-09-30). Courts and other venues hold different standards: ... federal courts have accepted co-attested Grade B evidence since the 2017 amendments to Federal Rule of Evidence 902(13)–(14) (GRADE-A-CAPTURE.md) ... No action is refused for its evidence grade. ... Every filing and counsel packet shows each exhibit's grade, and where the profile states a venue's standard, shows it beside them. DEC-81's 'Grade A stays the ceiling for adversarial or legal use' is read as the highest grade the product offers, not a minimum."
- [DESIGN] §5 row 7 L56 — correspondence outcome "granted, denied, partial, reversed, affirmed, none stated" (court-like outcomes recorded on correspondence, not a docket model)
- [DOCTRINE] §4 rule 12 L43 — prepared for "stonewalling, retaliation, discrediting, legal harassment"; "what counsel or another group needs to carry a matter on (the counsel packet, the published case, the evidence package) survives the group's disruption"
- [RULING] §6 L74 — Intake Doctrine §3 / DEC-81(1) to gain "a ceiling, not a minimum: the venue sets the standard"
- [GAP] — no construct for a court case/docket as an object in the seven constructs (Standard, Determination, Consequence, Action plan, Action, Filing, Escalation); court decisions appear only as a kind of Standard (L20)
ANALYSIS
- none further in 41-100 beyond §3 Consequence "computed from the record"
QUESTIONS
- [RULING] §4 rule 10 L41 — declared kind of work "shapes what the assistant suggests and nothing else"
- [RULING] §7.8 DEC-115 L86 — start-and-send sketch binds "the refusal shown before anything runs, the reason asked in place, approving kept separate from recording the sending"
- [OPEN] §8 L96 — "how one group's strength composes with another's is unanswered; UX open questions 12 and 29"
DOCTRINE
- [RULING] §4 rule 12 L43 — "Hope for good faith; prepare for opposition (Bob, 2026-09-30; Design Requirements 13 and 14)"; "every plan is checked for a branch that answers a hostile response"
- [RULING] §5 row 14 L63 — "the build's numbering governs: Action is layer 9; the Functional Architecture's 'Layer 3: Action' is read as the functional layer, the 2026-07-27 addition as an annotation outside canon" (build/layers.md; requirements/README.md "not the v3 annotations")
- [RULING] §5 row 3 L52 — seven stages everywhere (K14)
- [RULING] §5 row 13 L62 — this document replaces Case Making's action sections as authority
- [RULING] §6 L69-75 — canon edits: System Design gets row 16; DR 7 "next stage is proposed"; Roadmap "six"→"seven"; FA "six-stage"→"seven-stage"; State Rules §4.4 addressee, kinds, resolution `completed`, `contact`, `plan`, `option`
