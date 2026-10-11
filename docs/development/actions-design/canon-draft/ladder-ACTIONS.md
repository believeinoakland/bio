# §9A. ACTIONS (draft section for `BIO_Capability_Ladders_v0_1.md`)

**Placement (BOB, on Bob's approval with `BIO_Action_v0_2.md`).** Inserted after §9 QUESTIONS. The document's title gains "and actions"; §1's list of needs registers gains §9A.2; an "Amended" line is added under the Status: "Amended 2026-10-<n> (K<n>; `BIO_Action_v0_2.md`): §9A ACTIONS added, from the actions design (`docs/development/actions-design/`), Bob's rulings Actions D1–D24, D11a, D11b, D16a."

## 9A. ACTIONS

*Added 2026-10-11 from the actions design (`docs/development/actions-design/DESIGN.md`; use cases `research/U1`–`U20`; synthesis `research/S1-synthesis.md`). Each rung is re-verified when its tranche is planned.*

### 9A.1 Purpose

Bob, 2026-10-09: "we need to dive every bit as deeply into the requirements, current capabilities, additional capabilities needed, design, and use cases of Actions" as for investigations, so that Civicsmith supports members "throughout the action plan to the greatest and most appropriate extents possible" (investigation D43). This construct holds how far Civicsmith carries a group from deciding to act to knowing how it ended, for members who use the assistant and members who don't, without ever deciding for them or speaking for a policy (`BIO_Action_v0_2.md`).

### 9A.2 Needs register

(Use cases U1–U20, traced with practice, law, today's product and the gap.)

| id | need | in a member's words | centrality | rung | evidence |
|---|---|---|---|---|---|
| AC1 | Address a real office and record what was sent, received and how it ended | "We sent the Clerk our request on the 3rd; they answered in part." | core | L0 | U1, U6, U13; actions R63; S1 §D 1 |
| AC2 | Reach every built act from a screen; answer a to-do where it appears | "The queue says the date passed; let me reply to it here." | core | L1 | all twenty; S1 §D 4, §D 12 |
| AC3 | Dates computed from the law, with their citation, in the office's local day | "When is the City late, and under which law?" | core | L2 | U1, U7, U19; K1431, K1657 |
| AC4 | An approved starting text and a sourced guide, after choosing the act | "I've never written a records request; what does it say?" | core | L2 | U18; D8 |
| AC5 | The next routes after a reply, in the law's order | "They denied it; what can we do now?" | regular | L2 | U1; S1 §C 2 |
| AC6 | The group's own deadlines to a venue; a body that owes no reply | "We're a party now; when must we serve?" | occasional | L2 | U5, U6; D15; S1 §C 8 |
| AC7 | Asking kept apart from asserting; the record check on everything sent | "Can we ask the Auditor to look without accusing anyone?" | core | L3 | U3, U11; D1, D2 |
| AC8 | Act before the window closes without lowering the standard | "We have 30 days to send a Brown Act demand." | regular | L3 | U7, U20; D3, D18, D24 |
| AC9 | A breach claim on a checked case or on another group's accepted findings | "Our case is ready but we're holding it to negotiate." | regular | L3 | U14, U20; D16, D23, D24 |
| AC10 | Advocacy checked against the evidence and nothing more | "Does our flyer say anything the record doesn't support?" | occasional | L3 | U11; D11 |
| AC11 | A response recorded wherever it appears, and the plan re-examined | "The City's statement was in the paper; what changes for us?" | core | L4 | U2, U10, U16; D20, D21 |
| AC12 | Pressure recorded, a hold placed and members told what to keep | "Their lawyer threatened to sue us." | occasional | L4 | U15; D10 |
| AC13 | Promises adopted as duties and watched | "They promised to finish by June." | regular | L4 | U13, U16; D7 |
| AC14 | Counsel briefed early, and for the group's defence | "We want a lawyer to look before we decide." | regular | L4 | U8, U15, U20; D9 |
| AC15 | A breach that ends by a cure, with harm addressed honestly | "They fixed it with a new resolution in 2028." | core | L5 | U9, U16; D5 |
| AC16 | Stopping without winning, and saying so | "The grand jury took it over; we'll follow their report." | regular | L5 | U9, U16; D6a |
| AC17 | What came of the plan, and success recorded | "What did all this achieve?" | regular | L5 | U12, U16; D6b, D6c |
| AC18 | A newcomer picks up where things stand | "Maria left; what's due and why?" | regular | L5 | U17; D14 |
| AC19 | Act with partner groups on one text | "The tenants' union wants to sign on." | occasional | L5 | U14; D16 |
| AC21 | Manage a long action: what each matter is for, one timeline, reviews, preparation taken up, decisions together | "Where are we on the bond-reports plan, and who's drafting the follow-up?" | core | L1 | D27 |
| AC20 | Any state, from its own sourced profile | "The same request, but in Houston." | occasional | L2 | U19; D8 |

### 9A.3 The ladder

| rung | a member can | example | state on 2026-10-11 | planned tranche |
|---|---|---|---|---|
| L0 Recorded | Record an action to an office, its correspondence and its resolution | "Records request to the City Clerk, sent 3 Oct, partly granted 28 Oct." | **Usable today, thin** (old interface; addressee only "undetermined") | after the lane's requirements hand-off |
| L1 Reached | Use everything built through screens: plans, determinations, preparing and sending, clocks and reminders, escalation, the packet, holds; answer to-dos where they appear; manage the plan as it goes (each matter's intended outcome and state, one timeline, reviews, pause, decision log, preparation taken up, second approval, notes) | "From the action: prepare the follow-up, set a reminder, open the escalation." | **Built, no screen** | with the UX stream's action screens (N821) |
| L2 Guided | Computed dates with their law; approved starting texts and guides; facts on their trigger; next routes; the group's own deadlines; any state's profile | "Due 17 Oct (10 days, Gov. Code §7922.535); template 'Records request (CPRA + Sunshine)'." | **Not built** (rules partly built; no templates, guides or most profile facts) | BOB's |
| L3 Checked | Asking vs asserting; the record check on what is sent; override grounds; the window and quick route; checked-and-held and accepted findings; the advocacy evidence check; the election notice; the guards against misuse (volume shown, no self-benefit asks, naming offices, the actor visible) | "2 sentences assert a breach; 1 contradicted by finding F-12." | **Not built** (the case-account check exists for cases) | BOB's |
| L4 Responsive | Responses recorded wherever found, claim by claim; the plan re-examined; new matters from responses; pressure and holds anywhere; promises adopted as duties; counsel at any stage | "Reply recorded: the 30-day window now closes 27 Nov; 2 options marked." | **Partly built, not reachable** (correspondence, holds, duties) | BOB's |
| L5 Complete and together | Cures, harm statements, stopped pursuing, closing summaries, success records, recognition, watch end dates, where it stands, taking up; partners, joint approval, sign-ons | "Escalation ended at stage 4: cured by Resolution 2028-031; harm mitigated." | **Not built** | BOB's |

### 9A.4 Rungs in the first stages

Bob's decisions these rungs rest on: §9A.8.

**L0 and L1.**
- *Design:* the addressee from the registry by role (ORGANISATIONS L2), never a typed name; screens for every built act, the affordances deriving each act an action offers; queue to-dos answered by their own reply (`BIO_Action_v0_2.md` rules 1, 7).
- *The AI's part:* proposes options and drafts, labelled (already built).
- *The member decides:* every act.
- *Measure first:* which of the twenty use cases a member completes end to end on the new screens.

### 9A.5 Patterns of application

Responses across a group's actions to one body (late, partial, silent) are shown as facts with their counts and dates; a pattern across requests is TIME L4's, never a verdict.

### 9A.6 Later rungs, planned

**L2: guided.** Profile rules, venue facts, `response_statuses` quoted beside the fixed outcomes, templates under the template process, sourced guides, member-drafted rules with a second member's confirmation and, for Tier 2–3, a recorded professional review; schema for other states now, data when a group asks. *Risks:* encoded law going stale (cited, versioned, adopted by members).
**L3: checked.** The case-account check applied to outward text; the assertion phrasings held per language and extendable by a profile; the override's two grounds; held and accepted findings as bases for a determination. *Risks:* over-flagging (members resolve; nothing is refused for wording alone).
**L4: responsive.** A deterministic re-examination on every recorded response, AI where enabled within the recording member's settings and limits; `arose_from` links; pressure marks readable across actions, docket and testimony.
**L5: complete and together.** Cures, stopped pursuing, closing summaries, success records, watch end dates, taking up; partners and joint approval with matching fingerprints (case import and acceptance, DEC-96).
*What waits, and why:* court-petition templates (licensed certification, not yet); compensation claims for formal parties (until a group asks); "if this finding holds, what could we do" (deferred, D-165).

### 9A.7 Interfaces

| construct | ACTIONS needs from it | ACTIONS supplies to it |
|---|---|---|
| ORGANISATIONS | offices by role, oversight lines, holders on a date | addressees acted on |
| LAW / STANDARDS | standards held in the record; profile rules | determinations against them |
| TIME | `civil-time`; duties and occurrences; due-date bases | clock entries; the group's own deadlines |
| EVENTS | meetings, agenda items, minutes | what the group said and did, beside them |
| COURTS | reports and their required responses; proceedings | proceedings linked to actions |
| QUESTIONS | standing questions ("tell me if they miss this date") | the action's dates to watch |
| Publication (layer 8) | published, checked-and-held and accepted findings; the docket; pressure marks on the docket | dated outcome entries and responses written to the docket by a member's act (layer 9 calling layer 8); open requests for comment at signing through a registration seam |

### 9A.8 Decisions, all ruled

Each with Bob's ruling; BOB adds its K number at placement. Full text: `docs/development/actions-design/DECISIONS.md`.
- **D1** asking or asserting: classed by what the text does (c). **D2** what is sent is checked against the record (c). **D3** short windows: shown beside the refusal, a quick route; an overridden action may join escalation once determined (b with d). **D4** three scopes: confidential act, counsel matter, source role (a). **D5** curing act; harm statement; outcome entry then determination. **D6** stopped pursuing; closing summary; success record; watches asked once (a, b, a, b).
- **D7** a spoken promise binds once confirmed in writing or public (a). **D8** templates, guides, facts on trigger, other states, rule-writing (as recommended). **D9** counsel at any stage; defence packet (b). **D10** any member places a hold; hold notice (a, a). **D11** Civicsmith never rules on policy; advocacy gets the evidence check only (Bob's words); the assistant stays with facts (D11b: b). **D12** who speaks and who is named (as recommended).
- **D13** replies quotable unless they say otherwise; open requests at signing (b, b). **D14** taking up a departed member's items; where it stands; status reports (b, c). **D15** formal party as Tier 2; our deadlines (b; c when asked). **D16** partners now, joint approval designed; breach claims on accepted findings (Bob's words), with D16a's three points (all). **D17** every option listed. **D18** override only on a legal deadline or an imminent act (b).
- **D19** no limit on scenarios (b). **D20** a response that may be an infraction becomes a new matter, same or linked project (a, b and c). **D21** responses re-examine the plan. **D22** actions before publication; the published record of actions. **D23** checked and held. **D24** determinations on a checked, held case (b).
