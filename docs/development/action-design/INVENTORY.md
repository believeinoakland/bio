# The Action layer: what we know

**Status** · ACTION_DESIGN #1, 2026-09-29. Step 1 of the week's Action design work: an inventory of what the canon, the approved requirements and the code say about Actions, tested against Bob's framing of 2026-09-29. It decides nothing. Read at `main` @ `5bb688333c`. The four detailed inventories it draws on, every claim cited by file and section, are in `sources/` beside this file: `canon-mission.md` (Roadmap, Design Requirements, Functional Architecture, System Design, DEC rulings), `canon-constructs.md` (State Rules, Publication, Membership, Case Making, AI Roles, Interaction Constructs, the UX substrate), `build-state.md` (layer 9's requirements, rulings and plan) and `code.md` (the built modules, routing, UI, profiles, tests).

## 1. In brief

1. **The Action layer is built, not blank.** All six modules (standards, conformance, consequences, actions, filings, escalation) were approved by Bob on 2026-09-26 and built in T8, then hardened in T9, T11 and T12. They hold about 9,400 lines of source and 7,000 of tests; all 181 of their tests pass today, and all 45 of their ops are routed. What is missing is the part a member would touch: screens for five of the six modules, filing templates in the real profile, anything that tells a member a deadline passed or a stage is due, and any AI skill that prepares the work.
2. **What is built is a narrow model:** one group whose members all stand alike, acting against a government office, because of a breach. The approved layer contract says so: "An action rests on a published finding and on a standard held in the record."
3. **The canon is broader than the build, and Bob's framing is closer to the canon.** The Functional Architecture defines the layer as "Turn findings into outputs: work products, publications, escalations, communications, and ongoing tracking." The System Design says CivicOS exists to "answer questions, make a case, tell a story, and take action." Case Making records Bob (2026-08-03): an action plan "may differ based on the user type (journalist, activist, lawyer, etc.)".
4. **But the canon never designed that breadth.** No record holds a kind of actor. No role says who may send or speak for the group. No action kind exists for recognising compliance or telling a success story. Nothing composes a communication, and an action has one addressee. The action plan is designed but has no module.
5. **Five doctrines constrain any widening.** Standards and bars are "indexed on the work, not the person" (DEC-17, DEC-54). "We take no position on what the policies should be" (Operational Principle 1). The machine may do the looking, and the member does the concluding (DEC-24). Bad actors are "identified by evidence, never assumed by role" (Case Making §4). No tool may gate an action (Design Requirement 12).

## 2. Bob's framing, tested

| Bob's point | The canon | The approved requirements | The code | Verdict |
| --- | --- | --- | --- | --- |
| **Different kinds of groups** (activists, journalists, lawyers, auditors, unions) act differently | Recognised in words, never as data. Case Making's frame: media report, activists fix, administrators respond, lawyers support or change a claim ("the list is open"). DEC-27: "I'm a journalist" may lead the assistant to *propose* a project's action repertoire. Roadmap §12 has a group "type" field with no stated effect. | Not modelled. One instance is one group. | No group type anywhere. | **Gap in the requirements.** The canon's rule is that the work varies (the project, its bar, its output act), never a gate on who someone is. |
| **Roles within a group**: sharing resources, information, perspectives | Four capabilities (contribute, publish, create projects, administer); project owner, joined and invited; declared expertise that "gates nothing" and routes tasks. Plan steps carry a free-form resources list. | Not modelled. Any member with `contribute` may take every layer-9 act. | None. | **Gap.** Nothing says who drafts, approves, sends or speaks for the group. |
| **A group takes several actions**, and different kinds | Supported and argued for. A project initiates "zero or more Actions". The founding case ran three enforcement actions at once. A plan holds many steps and may serve several findings. | Yes, through a determination: many actions per determination, several attached at escalation stages 5 and 7. | Yes. | **Covered**, with limits: one open escalation per determination, one addressee per action. |
| **A group declines to act** | Supported. Escalation happens "if the group chooses to pursue it", and a plan keeps the options it declined, with reasons. | An escalation's proposed stage can be declined with a reason. Deciding not to escalate at all leaves no trace (UX open question 8). | As required. | **Partly covered.** |
| **Actions with no rule broken** (a reporter's story of a community success) | Allowed in spirit. Layer 3 covers findings in general, "Documenting compliance is important because it demonstrates that BIO examines facts evenhandedly", and CivicOS should "tell a story". But no kind, stage or example exists, and the action plan is triggered by nonconformity. | Tolerated, not designed. The breach rule binds only actions marked `breach: true`, so others pass, but no kind or purpose names them. A compliant determination leads to nothing but escalation's exit check. | Kinds `other`, `media`, `public_comment` exist, with no shape. | **Gap.** It also conflicts with the layer contract's wording. |
| **Communications**: press, public, other groups | Media outreach is a Tier 1 action. Publication says a new audience should cost "a new `action_kind` and a rendering", never a field on the case. Certification and persistence are "unmade". | An addressee must be a government office, so a journalist or newspaper cannot be one. Publication has no audience or story construct. | Nothing composes a communication. | **Gap.** UX use case 124: "No requirement shapes the communication itself." |
| **Lawyers** | User type (DEC-17: a lawyer's project may need "beyond a reasonable doubt"); Tier 3 counsel; legal organisations. | Outside named counsel only (the counsel packet); profile legal organisations. | As required. | **Partly covered**, as a recipient only. |
| **Auditors** (city or independent) | Only as venues and addressees (City Auditor complaints, grand jury, State Controller). | An office marked `oversight`; stage 7's audit request. | As required. | **Gap as actors.** They exist only as offices. |
| **Unions and special interests** | Never as actors. The only mention puts unions in the "protection network" (Roadmap §1). Interests are handled by disclosure (Requirement 6) and declared bias. Operational Principle 1 and stage 7 exclude policy advocacy. | Absent. | Absent. | **Gap, and a doctrine question** (§6, question 4). |

## 3. What the canon holds

**Kinds of action named:** records requests; grand jury complaints; State Controller referrals; City Auditor whistleblower complaints; Brown Act reports; public comment; council testimony; media outreach (all Tier 1); records court petitions (Tier 2); Prop 218 challenges, taxpayer actions, consent-decree motions and constitutional claims (Tier 3); litigation support; a request for comment to a case's subject before publication (DEC-13); political accountability (asking officials to act, oversight and audit requests, testimony, legislation that restores an existing requirement; stage 7); forum posts, directory entries and "working on" signals to other groups; a review copy (DEC-31); `other`. Every named action, venue and deadline is Californian.

**Stages:** Design Requirement 7's seven (documentation, notification, clock starts, response evaluation, legal tools, sustained attention, political accountability). The canon promises each stage "defined entry conditions, defined actions, defined timelines, and documented trigger conditions" and defines none; the approved `escalation` requirements supply them.

**Risk tiers** (Design Requirement 8, amended by Bob 2026-09-26): 1 file freely, 2 file with caution, 3 do not file without counsel (a counsel packet is prepared for counsel the group names; it is never published and never fileable). A tier is set only by a member, never defaults, and is revised only by an authored act with a reason (D-182).

**Clocks:** "The clock runs. Deadlines are deadlines" (Operational Principle 3). Every dated deadline names the statute, order or commitment it comes from. The canon holds six deadline designs with no stated relation among them: the action's clock, due dates on correspondence, task clocks, progression intervals, plan-step deadlines and escalation stage 3.

**Addressees:** an office, named in its official capacity, never a person (Requirement 6: "Accountability belongs to the role and the institution").

**What leaves the instance:** a published case (signed, irreversible); an evidence package ("the primary output of the escalation protocol", fully public, open to "any actor to pick up"); filing templates for Tiers 1–2; the counsel packet; the review copy, which "never leaves the instance". Anything addressed carries its hash, date, author and both threshold floors in-band (Publication §3 rule 9). An action leaves only through a member's own hands and is recorded afterwards (DEC-31, provisional). The action plan is never published (DEC-25, deferred).

**The action plan** (Case Making, designed, no module): steps with dependencies, deadlines, outcome-keyed branches, resources and a disposition (chosen, declined with reason, done, blocked). The machine suggests and checks and never adopts a step. "The gate belongs at the ACT, not at the reasoning" (DEC-26).

**The human boundary:** "AI skills provide support. Humans make every decision" (Roadmap §10). "No tool has authority to approve, reject, or gate any work product or action" (Requirement 12). The phrase "the AI prepares, never files" is the layer contract's; the canon holds the substance but never those words.

## 4. What is approved and built

| module | what it holds | tests | the gaps that matter |
| --- | --- | --- | --- |
| standards | What a government act is measured against: statute, regulation, ordinance, court, policy, commitment; its captured text, citation, period in force, and source from the profile. | 18 pass | No Legal/Policy Lookup skill exists to propose standards. |
| conformance | A member's determination that a named act is compliant, noncompliant or unclear, per standard, resting on findings published in a ratified case of the same project. A machine compares, never determines. | 36 pass | Needs the whole case and ratification path first. Nothing acts on a compliant determination. |
| consequences | What a breach did, to whom (a class, fund, program, service or body, never a person), measured, computed from the record or assessed by a member, with causation as its own finding; whether each part is addressed. | 24 pass | None structural. |
| actions | The Action object: kind, tier, addressee office, clock with bases, legs, lifecycle, correspondence ledger, governing laws, fee quotes, the action's own outcome. `breach: true` actions must rest on a live determination. | 40 pass | Created only through the generic promote op. The only product kinds are records request, request for comment and other. |
| filings | Tier 1–2 drafts filled from the profile's template, each blank naming its source; a member approves, sends by the venue's own means, and records it. Tier 3: the counsel packet. | 34 pass | The real profile has no templates, so every Tier 1–2 draft is refused there. |
| escalation | Seven stages from a live noncompliant determination; a met trigger is proposed and a member advances or declines; it ends only when compliance is restored and consequences are addressed. | 29 pass | Nothing tells a member a stage is due. |

**Where the chain breaks today:**

- **No screens** for standards, determinations, consequences, filings, counsel packets or escalation. The old interface has only the action loop, and its intake form writes the addressee in a shape the plane now refuses (read, not run).
- **Nothing is pushed.** Monitoring's deadline recheck is never called, and the queue has no kind for an overdue clock or a due escalation. Both answer when asked; neither tells anyone.
- **No skills.** The only skill pack is the investigative session.
- **The real profile** has 13 action kinds, 5 offices (all unmeasured), 1 deadline, no holidays and no templates.

## 5. Where the documents disagree

1. **The layer contract against the canon.** "An action rests on a published finding" contradicts records requests made to find out, the request for comment before publication (DEC-13), the review copy (DEC-31), and DEC-26's gate ("established", not "published"). The contract's aim, "to bring the government back into conformance", is narrower than the Functional Architecture's Layer 3.
2. **Mechanical or human escalation.** Requirement 7 says "when trigger conditions are met, the next stage activates"; the Roadmap says "Human decides". The approved requirements chose proposal and a member's act (K102). Requirement 7's text was not amended.
3. **Seven stages or six.** Requirement 7 now has seven; the Roadmap, Skill 8, the Functional Architecture and Requirement 12 still say six.
4. **Clocks stored or derived.** State Rules makes the clock "the authoritative deadline register", marked overdue by a machine (I-11, I-20); Case Making says "the clock is never encoded" and status is derived when read.
5. **Addressee shape.** State Rules shows a free string; the requirements refuse it and require an office by role and body.
6. **Kinds.** State Rules lists seven kinds, including California's `cpra_request`; the requirements moved to a law-neutral `records_request` and kinds from the profile. Publication's test counts a new audience as a new product kind.
7. **Three outcome vocabularies:** the action's resolution (complied, denied, escalated, withdrawn), the correspondence outcome (granted, denied, partial, reversed, affirmed, none stated) and escalation's evaluation (complied, partial, denied, none). None fits a story published or a thank-you delivered.
8. **Edges.** `action_basis`, `responds_to` and `references` sit outside State Rules' closed edge vocabulary, which says new kinds "require a spec revision".
9. **Two outbound models.** State Rules' distribution ladder (internal and external audiences, recipients' stale copies) was never reconciled with case publication.
10. **Tier per kind or per action.** The reference platforms document classifies kinds; State Rules puts the tier on each action; filings take the stricter of the two.
11. **The plan against escalation.** A plan is a set of options, including those declined; escalation is one pursued breach. Nothing relates them (UX open question 9).
12. **Audience and user type.** Publication makes an audience a reader, distinct from a user type; Case Making grounds plan variation in user type; no record holds either.
13. **The status of Case Making.** It is canon "whole" in `requirements/README.md`; its own banner calls it non-authoritative ("several body sentences are now false as written").
14. **"Layer 3"** means Action in the Functional Architecture's analysis, and "the UI surfaces" in its 2026-07-27 addition.
15. **Two stances toward government.** The Roadmap's "war" and "protection network" (unions, the City Attorney, the external auditor and Council) against System Design and Case Making: "all stakeholders are presumed to want better outcomes."
16. **DEC-26's refusal of an unestablished outward act** against Requirement 12 (no tool gates an action) and Requirement 8 ("Any individual can initiate" Tier 1).

## 6. The gaps

**Bob's to decide (requirements, doctrine, architecture, UX), each to come with a recommendation:**

1. **Who the "groups" are.** The canon has three different ideas under that word: a *user type* (journalist, lawyer; varies journeys and repertoire), an *audience* (a reader of a published case) and an *addressee* (an office). Bob's framing could mean kinds of CivicOS groups, kinds of project or member within one group, or outside parties a group works with.
2. **The layer's scope.** Keep "restore conformance", or widen to the canon's "turn findings into outputs", with breach actions keeping the stricter rule?
3. **Action purposes beyond a breach:** informing, recognising compliance, a success story, outreach, coalition work, supportive testimony. Each needs a kind or purpose, an outcome vocabulary, and a place in publication or action.
4. **Unions and special interests against Operational Principle 1.** Can a group with a stake use CivicOS, and what disclosure keeps it inside the doctrine?
5. **Roles for acting:** who may draft, approve, send, sign or speak for the group; whether sending anything is an attested (signed) act; how "No group speaks for Believe in Oakland" applies.
6. **Communications as a construct:** one message to many addressees, to non-government recipients (press, other groups, the public), certification by a licensed professional, and confidential referral to an oversight body.
7. **The action plan:** designed, no module; its relation to escalation; whether any of it is published (DEC-25).
8. **What "consequences addressed" and an adequate response mean** in practice.
9. **Cross-group work:** joint actions, one group accepting another's work, the directory and "working on" signals (UX open questions 12 and 29).
10. **Evidence grade per tier:** may a Tier 2 or 3 action, or a counsel packet, rest on Grade B evidence?
11. **A home document for the Action layer.** It has no level-1 design and no row in System Design §3; its design is spread across State Rules §4.4, Case Making, Design Requirements 7–8 and the requirements.

**BOB's to plan (build and wiring), no decision of Bob's needed:**

- Schedule monitoring's deadline recheck; give the queue kinds for an overdue clock and a due escalation.
- An op to create an action, and read ops for an action and its lists.
- Act entries in `affordances` for standards, determinations, consequences, filings and escalation.
- Profile data: templates, holidays, measured offices and deadlines.
- Verify that a member can create a `breach: true` action through promote (reported refused in T9, probably fixed, not pinned by a test).
- The old interface's intake writes an addressee the plane refuses; the new UI is designed elsewhere.

**Record-keeping defects found:**

- `build/requirements/actions.md` still marks R4–R11, R22, R28–R33, R40 and R41 "not yet met", and monitoring R34–R35 and publication R36–R37 likewise, though all are built and tested.
- `build/plan/next.md` still lists N61, N129 and N130, which T8 applied (K232).
- DEC-1 to DEC-67 (including DEC-13, 14, 17, 24, 26, 27, 54) are not readable on `main`: `docs/archive/ledgers/DECISIONS-2026-08.md` there is only a pointer to the retired `coord` branch, yet the canon cites them.
- State Rules §4.4 was not amended for any of the requirements' changes.

## 7. The path for the week

1. **Inventory** (this document).
2. **Bob's framing questions**, one page: §6 items 1–4 first, since the rest depend on them, each with a recommendation drawn from the canon.
3. **A completeness matrix:** actor kinds × action purposes × stages of the work (prepare, decide, send, track, close), each cell traced to canon, requirement, or gap. Use the UX substrate's use cases (UC-110 to UC-129) and audiences as its rows.
4. **Requirement changes**, drafted for BOB to fold: deltas to the six modules and to `publication`, and any new module (the action plan, communications) for Bob as architecture.
5. **Design** of the member's path through acting, with the UX substrate, and the test list each requirement needs (P7: every requirement tested at the interface).
6. **Build** follows the process: the drafts go to BOB, who plans them into a tranche; module jobs write and test the code.
