# A-PLANNING · The investigation planner

Unit A-PLANNING, phase 2 of the investigation study (`PROTOCOL.md` §A). Scope: from the member's words and a short interview to objectives; lines of enquiry; next steps (find document X, ask whom, records requests, settle a contradiction, test an explanation); re-planning as evidence arrives; tactical awareness of why each document and fact is held; staying on the objectives; competing explanations; when to stop; proposals a member accepts.

Sources are the phase 0, 1 and 1b notes (`notes/`, `research/`) and `RESUME.md`. Product claims cite the note and, through it, the product (`notes/M1.md` §1.11 → `intent` R18). Status words follow PROTOCOL rule 3. Bob's ruling K1627 (`build/rulings.md:1629`, quoted in `notes/C6.md` §3.2 and re-read by grep for this study) frames the target: "a planner that stays on the investigation's objectives and knows why each document is held … the machine proposes, a member accepts … The project becomes the investigation's home".

Vocabulary used here, chosen to avoid the product's reserved words (`notes/D1.md` §4 item 13; `notes/C5.md` §4 item 13): **plan of enquiry** (the planner's working object; not "action plan", which is layer 9's); **line of enquiry** (a group of steps with one focus, the police sense, `research/B2.md` §1.1); **step** (one thing to find out or do, with why); **explanation** (a candidate answer to "why", held as a member's hypothesis once adopted). "Case", "case file", "matter", "obligation" and "lead" are not used for the planner's objects. Member-facing words are Bob's (§8).

## 1 · The need

### 1.1 What the scenarios ask of a planner

The fourteen scenarios of `notes/P0.md` share one planning shape: a grievance becomes a comparison between *what was required or promised* and *what was done* (`notes/P0.md` §0, citing Roadmap §5 OP1 and §9 Skill 6), and the work is a sequence of findable documents chosen because each settles part of that comparison.

| planning need | what it means concretely | scenarios that show it (`notes/P0.md`) |
|---|---|---|
| Turn words into objectives | Bob's parent says "promised one school year … 2 years … what's going on?". The planner must produce checkable objectives: O1 the binding schedule versus the promise; O2 actual progress and forecast; O3 causes, attributed, with time and money; O4 any breach of law or stated policy; O5 what the member can do | S1 (worked in full); every scenario has 2–5 objectives |
| Ask the few questions that change the plan | Which district; who made the promise and in what form; where the children are; how it is paid for; what the site looks like; what the district already said. "Each changes the plan" | S1 §Clarifying; S7 (which utility decides the venue); S8 (which vote); S14 (which meeting) |
| Find the source of the standard first | "the question that matters most is usually 'where does the promise or rule come from?'" A promise may turn out not to be binding; that is an honest answer | §2 Intake row; S1, S6 |
| Decompose into findable steps | Each objective breaks into documents by kind, publisher and where found (S1's 15-row document table), and each document is wanted for a stated reason ("contract: completion date, LD rate, extension clauses") | S1, S3, S6, S9, S11 |
| Hold several explanations at once | Every scenario lists 3–5 live explanations, often several true; "the government's own explanation is always one of them, never the default" | §2 Competing explanations row; S1 lists eight |
| Re-plan on arrival | "a CO coded 'differing site condition' opens a soils line; a stop-payment notice opens a contractor-distress line"; "Iteration is driven by arrivals … most of an investigation's life is waiting" | S1 §Iterates; §2 observation 5 |
| Know which access regime applies | CPRA for the district; Rule 10.500 for a court; SB 1421's 45 days; a private contractor "owes no answers". The step "get the change-order log" is a records request with a clock, not a web search | S1, S2, S4, S12; §2 Access regimes row |
| Watch deadlines that bind the member | S14's cure-and-correct window forces action in days | S14 |
| Stop, or wait | Lines end when "exhausted or legally closed" (S4's non-covered records); S1 "stays open until occupancy and DSA certification"; S10 is days, S2 and S11 are years | §2 Planning row; observation 6 |
| Know why each document is held | Bob: "what is the reason that that document is in the case file? … At a tactical level, it understands why it has this document and this content. At a higher level, it's able to stay focused on its objective(s)" | `RESUME.md` |
| Keep the member deciding | "the machine proposes and a member accepts … the member is kept 'in the loop'"; and the member generates evidence (site visits, logs) | `RESUME.md`; §2 Member involvement row |

### 1.2 The planner's job in one sentence

*(inference from the above)* Keep, for one investigation, a visible, member-owned answer to four questions at every moment: **what are we trying to establish** (objectives and the questions under them), **what could explain it** (the live explanations), **what would settle it and where is that** (steps, each tied to an objective or explanation, with the access route and any clock), and **what changed since we last decided** (arrivals that call for a re-plan or a stop). Everything the machine contributes to those four answers is a proposal.

### 1.3 Two shapes, one planner

P0 observation 1 finds two recurring shapes: *schedule-and-cost* of a capital project (S1, S11, partly S3, S7) and *compliance-against-standard* (S2, S4–S6, S8–S10, S13, S14) (`notes/P0.md` §2). Both reduce to the same planning loop; what differs is the starter set of documents and explanations. Scale differs by two orders of magnitude (S10: days, a dozen documents; S2/S11: years, hundreds), so the planner must make the small case trivial and the large one sustainable (`notes/P0.md` observation 6; DR2 "useful to one person with a few hours a week", `notes/C1.md` §1.2).

## 2 · Best practice that applies

Four traditions describe the same loop with different names. The table aligns them; the lessons after it are the ones the planner must encode.

| step of the loop | police (`research/B2.md`) | intelligence (`research/B3.md`) | journalism (`research/B1.md`) | AI agents (`research/B4.md`) |
|---|---|---|---|---|
| Frame | intake decision: investigate / refer / no action, recorded (QSI Planning; AFP Evaluation) | the question as a priority intelligence requirement (ATP 2-01) | "a subject is not a story": a ≤3-sentence hypothesis (SBI ch. 2) | Gemini: clarifying questions, then an editable plan |
| Explain | develop scenarios; "consider the opposite" (MIM §2.3.3.6; College 2023 G2) | 3–7 competing hypotheses, ACH (Heuer ch. 8) | the official version as hypothesis (SBI ch. 2) | STORM perspectives as competing lines |
| Decompose | strategy → lines of enquiry → small achievable actions (MIM §§2.3.4–2.3.5) | PIR → indicators → specific information requirements with LTIOV (ATP 2-01) | hypothesis → terms → questions → document tasks (SBI ch. 2) | planner → workers with task descriptions (Anthropic) |
| Collect | "no activity unless tasked by an action" (MIM) | collect what discriminates (Heuer ch. 5) | quiet documentary work first (SBI ch. 3) | orchestrator-workers, effort scaling |
| Hold | HOLMES account; policy file of decisions (MIM §2.5.1) | evidence file, schema (Pirolli & Card) | master file, chronology (SBI ch. 5) | plan saved outside context; progress file (Anthropic harness) |
| Re-plan | Oldfield cycle back to step 1; reviews at 28 days (MIM §4) | triggers: milestone, requirement satisfied, indicator change, residue (B3 §1.7) | weekly review; "neither cling … nor leap" (SBI ch. 2) | re-planner after each batch (plan-and-execute) |
| Stop | Investigative Maintenance when no viable line remains (MIM Fig. 12); "a fair investigation does not mean an endless investigation" (APP §9) | more information raises confidence, not accuracy (Heuer ch. 5) | worst / minimum / maximum outcome bracket (SBI ch. 2) | stopping conditions; "declaring victory prematurely" as a failure (harness) |

**Lessons the planner must encode** (each with its source):

1. **Plan from explanations, not from a document wish-list.** "Collection is focused narrowly on information that will help to discriminate the relative probability of alternate hypothesis"; medical students who collected thoroughly diagnosed worse (`research/B3.md` §1.1, lesson 1, Heuer ch. 5). P0's S1 table lists fifteen document kinds; a planner should fetch first the ones that separate the live explanations.
2. **Keep 3–7 explanations alive, including the boring ones; never drop one silently.** "Unproven hypotheses should be kept alive until they can be disproved"; ">7 unmanageable"; randomness and error are under-weighted (`research/B3.md` §1.3, lesson 2; Primer rationality bias).
3. **For each explanation ask what would be seen if it were true, and whether we could see it.** The "there is no evidence that…" test (`research/B3.md` §1.3, lesson 3). This generates steps and also interprets gaps: a missing change-order log may be unpublished, withheld or never requested.
4. **Start from the promise and from the official explanation.** "Most investigations are about the difference between a promise and the reality"; the official version serves as a hypothesis (`research/B1.md` §1.1, lessons 1–2). Fix up to four baselines before measuring a slip: the public promise, the approved budget or schedule, the contract time, the contractor's baseline schedule (`research/B5.md` §1.6, L6).
5. **Hierarchical, explicit, small steps with stated purpose.** "Carry out house-to-house" is "meaningless … the team is setting the investigative strategy, not the SIO" (`research/B2.md` §1.1, §3, lesson 5). Each step names its objective; the AFP: "It is by reference to the investigative strategy that all taskings should be derived, explained, sequenced and justified" (`research/B3.md` §1.7).
6. **Requirements carry a "by when" and are retired.** LTIOV reverse-planned from the decision it serves; necessity check ("has someone already collected it?"); retire satisfied requirements (`research/B3.md` §1.7, lesson 10). Civic analogues: a board meeting, a bond vote, a records-request window, S14's cure window.
7. **Re-planning is event-driven and deliberate.** Triggers: milestone, requirement satisfied or obsolete, indicator change, a diagnostic item or a residue that does not fit, a challenge (`research/B3.md` §1.7, lesson 12). Guard the tipping points (choosing main lines; naming a responsible party) with a contrarian pass (lesson 13; College REA 2022).
8. **Record every decision with what was known and why, including why a line was not followed** (Policy File, IIO Decision Log, `research/B2.md` §1.1, lesson 9; AFP "judged on the quality of the decision-making, not on the outcome").
9. **Stop on a stated rule, and allow dormancy.** Investigative Maintenance (`research/B2.md` §1.1); AFP phases "time bound … should prompt re-evaluation" (`research/B3.md` §1.7); CoST: record what is and is not available and stop seeking more than the purpose needs (`research/B5.md` §1.5(b)).
10. **Show the plan before spending, persist it outside any model context, guard the early stage hardest.** Gemini's editable plan; Anthropic's lead agent "saves its plan to Memory"; ">57% of source errors … arise early (in planning) and cascade"; agents "silently drop user-specified restrictions" (`research/B4.md` §1.1, §1.5, lessons 1–4).
11. **The machine does the matrix work humans skip; the human decides.** Pirolli and Card's leverage points (span of attention, generation of alternatives, diagnosticity); "You, not the matrix, must make the decision"; ACH alone does not improve accuracy, aggregation of independent judgments does (`research/B3.md` §1.4, lessons 4–5; Mandel et al. 2018).
12. **Proportionality.** Weigh each action's likelihood, size and the volume it generates before raising it; "avoid issuing low-quality actions simply as a way of doing something" (`research/B2.md` §1.1, §3, lesson 12).
13. **Domain schemas tell the planner what is missing.** Experts carry schemas that make absences visible (`research/B3.md` lesson 17). For public works the schema is the OCDS/OC4IDS stage-and-document model and CoST's proactive/reactive list, which is "a ready-made checklist of what to ask for" (`research/B5.md` §1.1, L1, L3).
14. **Red flags are leads, never conclusions**, each with "what action follows" (`research/B5.md` §1.5(a), L5).
15. **Keep the person who brought the case informed on a cadence** (`research/B2.md` lesson 16, APP §8.4) — subject in this product to the no-nagging doctrine (§3.4 below).

A light touch matters: Bellingcat says its court-grade SOP is too heavy for volunteer coalitions (`research/B1.md` §1.2, lesson 17); Heuer says the full eight-step ACH "may be unnecessary, except on highly controversial issues" (`research/B3.md` lesson 20). The planner must not turn a parent's question into a police incident room.

## 3 · What the substrate already provides

### 3.1 The pieces, and how a planner would use them as they are

| need | substrate piece | state | how the planner uses it as is | source |
|---|---|---|---|---|
| Objective with computed progress and a work list | `intent` (layer 7): project `objective` (R1); satisfaction condition over a progression's instances (R2); `progress` derived, never reported (R3–R5); `gaps` → one `objective-gap` proposal per short instance (R6) | **built** | Express any part of the investigation that *is* a staged process (procurement stages, a records request) as a condition; its gaps are steps | `notes/M1.md` §1.11 |
| A run that works an objective | `intent.workObjective` (R18): "a member opens an AI run with the objective and its current gaps as its instructions"; rung *reasoned*, "the run's budget and scope shown beside it" (DEC-88; `affordances` R31) | **specified at the record's edge; not consumed**: the worker reads neither objective nor gaps | The door a planning run would come through | `notes/M2.md` §3.16; `notes/D1.md` DEC-88 |
| Discovery loop | `intent` R15–R17: proposals; triage adopt / question / defer / dismiss; a machine may only `question`; unacted machine-surfaced questions deferred after 30 days with a reason | **built** | Off-objective finds go here instead of into the plan | `notes/M1.md` §1.11 |
| Pursuit record, dead ends | `intent` R8–R14: goals, aspirations, `recordDeadEnd` (never removed), `pursuitOf` (goals, objectives, triaged proposals, capture requests and their outcomes, dead ends) | **built** | The backward-looking half of the plan: what was tried and abandoned | `notes/M1.md` §1.11; Framework §12.2 (`notes/C3.md`) |
| Questions and sub-questions | `inquiry` (layer 6): one recursive object; `surfaced_by: agent`; `divide` member-only; falsifier required to conclude; ≥1 recheck trigger on every question; dated waits (R54–R57) | **built** | Each objective's questions, and each explanation's test, are inquiries | `notes/M1.md` §1.1–1.2 |
| Explanations | `hypotheses` (layer 6, K1467): member-held rows of kind `cause` / `identity` / `relation` / `flow` / `other`, revisable, withdrawable; "never facts, never legs"; `MACHINE_CANNOT_HYPOTHESISE` | **built** (T33, K1607) | The home of an adopted explanation | `notes/M1.md` §1.4 |
| Alternative supports for one claim | `basis-versions`: frozen versions, machine appends `suggested`, member moves them | **built** | Not explanations; useful at the leg level once a step returns evidence | `notes/M1.md` §1.8 |
| Conflicts between recorded assertions | `contradiction`: deterministic pairing (K1–K6), proposals, member resolution, acceptance-rate measure with a review at ≥95% over ≥30 | **built** (K5, K6 withheld until measured) | A detected conflict ("on schedule" in March, "delayed" in October) is a re-plan trigger and a step ("settle a contradiction") | `notes/M1.md` §1.5 |
| What nobody has looked at | `retrieval.frontier` per level, with `never_looked` subjects (links never followed, captures never read, references never matched, leads never followed) | **built** | The planner's raw material for "what's missing"; it is a list, not a plan | `notes/M1.md` §1.15 |
| Record of looking | `observation-log`: every look by level, authority (`run`, `sweep`, `lead`, `objective`…), state (`LOOKED_ABSENT`, `PRESENT`…); a member's lead "somewhere to look and never evidence" | **built** (R20–R21 specified) | A step is satisfied or blocked by looks; a `LOOKED_ABSENT` is a finding, not a failure | `notes/M2.md` §3.12 |
| Getting documents | `capture-requests` (a run names a public address; `purpose`, `lead_inquiry`; daemon fetches; run woken on completion); `link-sweep` (ratified, budgeted standing breadth); `monitoring` R28 named requests, R33 "sources a live objective … rests on … proposed for monitoring" | **built** (some Rs specified) | The execution routes for "find document X" | `notes/M2.md` §3.4; `notes/M3.md` §2.21–2.22 |
| Records requests | `actions`: kind `records_request`, correspondence ledger, `due_cite`, `passed_unanswered`; evidence-seeking actions "never gated" (R8); addressee suggested from `custodian_of` lines (R62, specified) | **built** (R61–R67 specified) | The route for reactive documents; its clock is a wait in the plan | `notes/M4.md` §1.19; `notes/C4.md` §1.2 |
| Promises and their slip | `standards` kind `commitment`; `duties` with time basis `commitment`, occurrences `met` / `overdue` / `undetermined`, transitions recorded; `civil-time.due`; `progressions` with `missing_predecessor`, `overdue_successor`, `out_of_order` | **built** on T33 (duties K1585; progressions `out_of_order` in code) | O1 and O2 of S1 become a duty and its occurrence; a missing stage becomes a step | `notes/M4.md` §1.6–1.7, §1.13, §1.16 |
| Timeline | `events.timeline`, `explore.timelineOver` with "what they did" and "what we did" lanes | **built** (T33) | The chronology the plan reads to find the window where the slip began (`research/B5.md` L7) | `notes/M4.md` §1.5; `notes/M1.md` §1.13 |
| A member-in-the-loop proposal tray | `action-plans` plan mode: `optionPropose` stored apart with run id, skill version and sources; tray five at a time in "the assistant's order of strength"; fixed disclosure sentence; `optionAdopt` by a member; "No score, rank figure or strength is recorded" | **specified** (R30–R34; code present, mode undeployed) | The exact pattern a plan-of-enquiry proposal needs, but for outward action only | `notes/M4.md` §1.18; `notes/M2.md` §3.5 |
| Run bounds and control | `ai-runs` / `run-rules` / `agent-harness`: bounds (`fetches`, `subsessions`, `proposals`, `surfaces`…); "the model decides what to search for … and never when the loop stops"; judgements may not set pass, step, budget or mode (`JUDGEMENT_OVERREACH`) | **built**; only `check` deployed; nothing verified live (VF-4 after T33) | Every planning run is bounded and tabled | `notes/M2.md` §1.1, §3.1–3.6 |
| The member's answer shape | `answers`: `question_as_read`, at most **one** clarifying question, per-level looks, `next_acts`, "machine work"; an ask keeps nothing (K1450) | **built**, mode `ask` undeployed | The shape of the planner's intake read-back | `notes/M1.md` §1.10 |
| Watching | `answers` standing questions (saved query, no model unless something new, K1481); `monitoring`; reevaluation notices | **built** (AI half off) | Investigative maintenance | `notes/M1.md` §1.10, §1.16 |
| Guided procedure without AI | `wizard-scripts`: authored step lists, approved by an owner, "a script says what to do, never what to conclude", run with no key | **built** (library empty) | The no-AI floor of planning (K1547; DEC-120) | `notes/M2.md` §3.14; `notes/D1.md` DEC-120, DEC-121 |
| Queue | `queue` kinds `objective-gap`, `assistant-surfaced-focus`, `out-of-inquiry-lead`, `newer-capture-affects-reference`, `capture-completed-unattended`, contradiction kinds; one item per (member, case), events reach every ancestor | **built** (`inquiry-recheck-due`, `standing-answer` specified) | Where plan proposals and re-plan prompts reach members | `notes/M1.md` §1.17–1.18; `notes/C2.md` §1.2 |
| After-read seam | `reading-pipeline` `afterRead` hook per capture class | **built** on T33 (K1557) | Lets the planner be told a held document has been read | `notes/M3.md` §2.13 |

### 3.2 What the canon already says about planning

- **Bob's 2026-07-27 three-layer workflow** is the canon's prior statement of this capability: Layer 2 "articulates objectives that define what it wants to see in the data store: a specific document, a kind of document, a document set that could contain a piece of evidence it needs, with the requester indicating whether found documents should be kept up to date and when or how often" (`notes/C1.md` §1.3). That is a planner-to-gatherer contract: steps that name a document, a kind or a set, with a freshness wish.
- **Layer 7 is reserved for it.** `intent`: "its gaps are the work list"; and "Beyond MVP: Discovery (Bob's candidate, 2026-09-25, not in the module list). An AI assistant that searches documents, content, meaning and the results of inquiries for an understanding of what is working and what is not. It would sit in this layer" (`notes/C1.md` §1.6, `build/layers.md` §Layer 7).
- **DEC-22 / D-165, the objectives engine.** "An UNSUPPORTED CLAIM is a standing objective"; the backward question's output "is not prose — it is a WORK LIST"; deferred by Bob with a trigger (K1500) (`notes/C2.md` §1.1).
- **Unclear returns to Layer 1.** Compliance analysis output *Unclear* "triggers a return to Layer 1 (more information needed) and may result in CPRA requests, additional research, or outreach" — "the canon's only explicit statement of investigative iteration driven by an information gap" (`notes/C1.md` §1.3).
- **The session discovers, the member decides; blanket direction.** A session "follows the evidence to sources the standing intent does not yet name, proposes new gathering requests, and prepares everything a decision needs"; a member may direct a session "within a named investigation scope, to plant the gathering requests its discovery warrants" (Intake Doctrine §6, `notes/C4.md` §1.1). Blanket direction has no module requirement (grep: no hits, `notes/C4.md` §3).
- **The gate is at the act, not at the reasoning.** "A plan may rest on premises not yet established. An act that reaches outside the group may not be taken on them"; plan elements carry support status established / short / hypothetical (Case Making §6a, `notes/C2.md` §1.1); "An action that seeks evidence … is never gated" (Action §4 r2, `notes/C4.md` §1.2).

### 3.3 Bob's school case on today's substrate

*(inference, from §3.1)* A member can today open a project with an objective, declare a public-works progression whose gaps list missing stages, hold the promise as a `commitment` standard with a duty whose occurrence reads `overdue` as a question, open inquiries and hold hypotheses, and send a records request with its clock. She cannot say why each document is held, get proposed objectives, explanations or steps, see steps tied to explanations, be told a new status report calls for re-planning, or know when to stop: the only deployed mode, `check`, re-checks one question's basis (`notes/M2.md` §1.1).

### 3.4 Doctrine that binds the planner

| rule | words and citation | consequence for the planner |
|---|---|---|
| The machine looks, the member concludes | DEC-24 (`notes/C2.md` D1); "The machine may not choose the question" (DEC-24 r2), narrowed by K1491 "the machine may point, members decide what to pursue" | Objectives, questions and explanations become the member's only by the member's act |
| Proposals | "Three affordances, and only three: adopt …, defer with a recorded reason, dismiss with a recorded reason. Nothing is adopted automatically and nothing disappears silently" (IC §P, `notes/C2.md` D13); a proposal must LOOK derived (D-82) and ages (D-79) | Every plan proposal has these three acts |
| Accepting a proposal | DEC-77 (b): a judgement "accepted in one act; the record keeps whether the member chose unaided or accepted a recommendation"; acceptance rate measured per kind; introduced "for contradictions first" (`notes/D1.md`) | Extending it to plan items is a Bob decision (§8) |
| Single or bulk | "ENABLED to act singly or in bulk and is FORCED into neither"; nothing pre-ticked (DEC-69, DEC-97) | A tray of twelve steps is adoptable item by item or together |
| Runs start at a member's act | "every AI run but a member-authored standing question starts at a member's act" (K1481; `run-rules` R18) | The planner never wakes itself; re-planning is offered, then started by a member |
| Table decides control | "the model never decides when the loop stops" (IS §14b.4; `agent-harness` R4) | Stop conditions and re-plan triggers are code; the model judges inside a step |
| Targeted extraction | "only at a member's request for a basis or claim, or by a member's act scoped to a body and period; never a sweep" (K1468, CL §10) | An adopted step is the natural "member's request" (§8 decision) |
| Goals direct seeking, never filtering | Framework invariant 7: "A goal may direct what is SOUGHT. It must never filter what is recorded, retained, or shown … a finding that cuts against a goal is surfaced at least as prominently" (`notes/C3.md` §2); bias "never shapes what is captured or monitored" | The plan chooses what to look for; it hides nothing found |
| No significance or priority field | "no field, value or vocabulary for significance, severity, priority, urgency or rank exists anywhere" (DEC-89); "the order is the only sign of it" (`action-plans` R34) | Steps carry an order and a reason, never a stored priority |
| Cause | "Cause is member-authored and published only when evidenced; a hypothesized cause stays in the working inquiry" (DEC-84 (10)) | The planner proposes explanations; it never answers "why" |
| Hypotheses | "never facts, never legs"; `MACHINE_CANNOT_HYPOTHESISE` (K1467, K1473) | Machine explanations are stored apart until a member holds them |
| Plans are working material | "THE PLAN IS WORKING MATERIAL AND IS NEVER PUBLISHED" (DEC-25); project participation scopes "the group's thinking" (Membership §7.9, `notes/C4.md` D31) | The plan of enquiry lives in the project and never publishes |
| Our plan is not their progression | "If the two shared machinery, our own missed deadline would surface as a finding about the record" (Case Making §3, `notes/C2.md` D27) | The plan's own by-whens are never findings about the district |
| No nagging; no outside channel | "INFORMING AT THE ACT, ONCE, IS RESPECT" (DEC-69); reminders are the member's own (DEC-94); no email or push | Re-plan prompts are told once and age |
| Undetermined, by level | five named gaps (DEC-86); "saying WHICH absence is true is a first-class obligation" (System Design row 9) | A blocked step says why: not published, withheld, nobody looked |
| Activity is the members' | "never the assistant's" (DEC-111) | Machine planning never counts as the group's work |
| Each member's own account | K1502, K1503 | A planning run is paid by the member who starts it |
| A no-AI version | K1547; DEC-120 | Planning must work by hand and by wizard script |

## 4 · Gaps

### 4.1 What is missing

| # | gap | evidence | consequence |
|---|---|---|---|
| G1 | **No plan-of-enquiry object.** Nothing holds, across runs and weeks, the steps to take, each with its purpose (which objective or explanation it serves), its route, its clock and its state. A run's `state` is opaque scratch (≤256 KiB), never shown; `action-plans` plans outward action and forbids assignees and costs; `tasks` are created only from capture events | `notes/M2.md` G2, G8; `notes/M4.md` §1.18, §5 item 6; `notes/M1.md` §1.19, §4 item 9 | Bob's "planning function … has context about all the various things going on" has no home; every run starts from nothing |
| G2 | **Objectives cannot express an investigation.** A satisfaction condition reads a progression's instances; "an objective the shape cannot express keeps its text with progress stated as not computable" (`intent` R4). Objectives sit on projects, not on questions; goals and aspirations exist but no objective → question tree | `notes/M1.md` §1.11, §4 item 2 | "What's going on at Grandview?" has text but no computed progress; its gaps cannot become a work list |
| G3 | **No "why held".** A document reaches a question only as a cited leg with a role; capture records only `origin` (named request, sweep, doorbell) and a capture request's `purpose` (`investigate` / `acquire`). Nothing records that this PDF is "the bid tabulation, held to test whether the award was competitive" | `notes/M3.md` §3.4, §5 item 5; `notes/M1.md` §4 item 1 | The planner cannot tell which documents serve which objective, and READING has no purpose to read with |
| G4 | **No machine-proposed explanations.** `MACHINE_CANNOT_HYPOTHESISE`; hypotheses carry no expected observations, test or status beyond withdrawn; nothing shows explanations side by side against the evidence | `notes/M1.md` §1.4, §4 items 3–4; `notes/C6.md` G6 | The planner's most valuable contribution (generating alternatives, `research/B3.md` lesson 4) has no tray |
| G5 | **The worker does not plan an investigation.** `check` is the only deployed mode; the run's plan judgement names search targets for one question for up to three passes; `workObjective`'s objective and gaps are not read; a project run with several questions has target `null` (D-572, open); the run's `PLANE_OPS` lacks the T33 reads (`timeline`, `moneyof`, `duties`, `explore`) the ask has | `notes/M2.md` §3.5, G4, G6; `notes/C6.md` G7 | Even with a plan object, no run could propose into it today |
| G6 | **No re-plan trigger joins the arrivals.** The arrivals exist separately (capture completed, correspondence received, newer capture of a cited document, contradiction candidate, duty transition, after-read). Nothing says "this project's plan may need review". `reevaluation` R34 (an event's date moved) and `notice-producers` (dated waits, standing answers) are specified, not built | `notes/M1.md` §1.16, §1.18, §4 item 7 | Iteration depends on the member noticing |
| G7 | **No stop rule.** `project-stage` has four coarse derived stages; `closed` is an owner's act; nothing proposes "no viable line remains: watch, or close" | `notes/M1.md` §1.12 | Investigations either sprawl or die silently; maintenance has no state |
| G8 | **Intake is one question deep.** `answers` allows at most one clarifying question and keeps nothing; the assistant flow (prompt entry, INTERPRET, classifier, wizard) is absent | `notes/M1.md` §1.10, §4 item 5; `notes/C1.md` §1.4 row 11 | The interview Bob describes ("a few follow-on questions") has no held state; LOOP owns the conversation, the planner owns what it yields |
| G9 | **Steps cannot be executed by scope.** Blanket direction "within a named investigation scope" is doctrine with no module; a capture request needs a known address; records requests are member actions | `notes/C4.md` §3, §4 items 1, 7; `notes/M2.md` G5 | Each adopted step must be routed to an existing execution path, one by one |
| G10 | **No starter knowledge of where things are and what usually explains them.** No procurement doctypes; jurisdiction profiles cover a city and county, not a school district or DSA; no explanation library | `notes/M3.md` §5 items 2, 9; `notes/M4.md` §5 item 7; `research/B5.md` §1.6 | The planner cannot propose "DSA eTracker for application dates" unless it knows (closed book, K1474: no fact from the model's memory) |

### 4.2 What exists but does not fit

- **Two plans already exist, and neither is this one.** The *action plan* (layer 9) decides what to do about a matter; the *investigative session's pass plan* (layer 6) chooses search targets within one question. The plan of enquiry sits between them (`notes/C2.md` §4.2 item 4; `notes/C6.md` G3). Reusing the action plan would break Case Making's rule that the plan addresses matters and DEC-114's vocabulary, and would put research steps beside filings.
- **`intent`'s condition grammar is the right pattern on the wrong substrate.** Derived progress, gaps as work list, dead ends kept, member-authorised runs: all correct. But it is keyed to progressions, so it covers the procurement lifecycle and records requests, not "test explanation H3" (`notes/M1.md` §4 item 2).
- **`hypotheses` are statements, not explanations under test.** Their kinds fit (cause, flow); they lack *expects* (what would be seen if true or false) and a per-evidence rating, so ACH-style work has no home (`notes/M1.md` §1.4).
- **The observation-log lead is personal.** A member's lead is visible to its author and sharees, never administrators, and has no link to a question or a plan beyond a project share (`notes/M2.md` §3.12; `notes/C4.md` §4 item 15). It is a tip, not a step.
- **Dated waits are personal.** "Only the member who set a wait is answered it" (`inquiry` R55), so "look again when the March status report is due" is not shared (`notes/M1.md` §4 item 11).
- **The machine-proposes doctrine is uneven.** Three patterns coexist: no adopt control, re-author (governing laws, UI-102); adopt as an attributed act recorded as acceptance (DEC-77); labelled draft edited then adopted (DEC-120) (`notes/C2.md` §4.2 item 2). The planner needs one, stated.
- **The machine may rule, machine-attributed (DEC-52/53)**, which is wider than Bob's "the machine proposes and a member accepts" (`notes/D1.md` §4 item 2). For planning, the narrower rule fits better: a plan is the group's intention, so nothing enters it without a member.
- **Skills need canon text.** A disclosed skill layer must quote canon verbatim (`skills` R21), so a planning skill needs canon first (`notes/M2.md` §3.9).

### 4.3 Tensions to resolve

1. **"Keeps digging" vs runs at a member's act.** Bob's engine "starts digging"; doctrine allows AI only at a member's act or as a read-only standing question with no outside fan-out (`notes/C5.md` §4 item 3; `notes/C3.md` §4 item 12). Resolution proposed in §6: the plan is the persistent thing; runs are short, member-started, and the member can start a whole batch of adopted steps in one act.
2. **A starter library vs "no catalogue".** Action rule 8: options come "from reasoning over the matter and from the group's own earlier plans, never from a fixed list" (`notes/C4.md` D23). The planner benefits from domain schemas (`research/B3.md` lesson 17; `research/B5.md` L3, L8). Resolution proposed in §6 and §8: patterns as profile-like data that inform proposals, labelled with their source, never conclusions.
3. **Ordering vs no priority.** The planner must say what to do first; DEC-89 forbids a stored priority. `action-plans` already settled this: "the order is the only sign of it" (`notes/M4.md` §1.18). The same rule fits steps, with "by when" (a stated date with a basis) as the one quantity that may sort.
4. **Measuring acceptance vs not counting attention.** DEC-77 and DEC-95 (f) measure acceptance rates; DEC-68/69 forbid grading a member's attention. Reconciled as an aggregate, per-kind measure of the recommender (`notes/D1.md` §4 item 4).
5. **Project vs inquiry.** "A project does not own a line of inquiry" (Membership §7.9). The plan is the project's thinking; the questions it works on are shared inquiries other projects may also work (`notes/C4.md` §4 item 2).

## 5 · Options

Four options, from least to most new machinery. All keep the doctrine of §3.4; they differ in where the plan lives and what the machine may propose.

### Option A · No new module: plan by hand, runs on objectives

**Reuses.** `intent` (objective, condition over a member-declared public-works progression, gaps, dead ends); inquiries for each objective; hypotheses held by members; observation-log leads; `actions` for records requests; `wizard-scripts` with an authored "Plan an investigation" script (no AI); fix `agent-worker` to read `workObjective`'s objective and gaps (intent R18 as written).
**Adds.** One worker change; one wizard script; canon text for a planning skill layer.
**Doctrine fit.** Perfect; nothing new to rule.
**Cost and risk.** Cheapest. But G1, G3, G4, G6, G7 stay open: no "why held", no explanations side by side, no re-plan or stop. The run's plan still lives in opaque `state`. The member does the planner's work; for a parent with a few hours a week that is the failure DR2 names (`notes/C1.md` §1.2). It answers K1627 only in part.

### Option B · Widen `intent` into the planner

**Reuses.** Everything in A.
**Adds, inside `intent`.** New condition kinds beyond progressions (a question concluded by the project, a question's strength against the bar, a duty occurrence met, a step satisfied); steps as a new kind of intent row; machine proposals of steps and objectives through the discovery loop's `registerSource` (R15); a re-plan trigger as an `intent` listener.
**Doctrine fit.** Good: intent already says "progress … derived and never reported; its gaps are the work list" and "an assistant proposes at any point and adopts at none" (R20).
**Cost and risk.** Moderate code, but `intent` becomes a large module mixing the group's aims (aspirations, goals) with tactical working state (steps, routes, clocks). Explanations still have nowhere to be proposed. Risk of a module near the ~4,000-line split threshold (layers.md ruling 1) *(inference)*.

### Option C · A plan-of-enquiry module beside `intent` (recommended)

**Reuses.** `intent` for objectives and their computed progress; `inquiry`, `hypotheses`, `contradiction`, `strength` for questions, explanations, conflicts and what a basis would be worth; `retrieval.frontier` and `observation-log` for what was and was not looked at; `capture-requests`, `link-sweep`, `monitoring`, `actions` as the routes a step runs through; `duties`, `standards`, `progressions`, `events` for promises, baselines and windows; `ai-runs` / `run-rules` / `agent-harness` for bounded, tabled runs; `queue` for proposals and prompts; `wizard-scripts` for the no-AI floor.
**Adds.** One layer-7 module holding the plan of enquiry: steps, lines of enquiry, explanation proposals and their expected observations, the why-held read, re-plan triggers and the stop read; one new run mode that reads the plan and proposes into it (no fetching); small additions to `hypotheses` (expected observations), `capture-requests` (the step a request serves) and `intent` (one condition kind).
**Doctrine fit.** Good, with four rulings needed (§8): extend ACCEPTING A PROPOSAL to plan items; machine-proposed explanations stored apart; an adopted step counts as a member's request for targeted work; a starter pattern library.
**Cost and risk.** One module (est. 2,000–3,000 lines *(inference, by comparison with `action-plans` 2,655 and `intent`)*), one run mode, one table. Risk: over-building for S10-sized cases; mitigated by making every part optional (a plan can be three steps typed by hand).

### Option D · An autonomous research agent with its own memory

**Reuses.** The runner and model plumbing.
**Adds.** A lead-agent/sub-agent system (`research/B4.md` §1.1) that holds the plan in its own memory, fetches, reads and re-plans continuously, reporting findings.
**Doctrine fit.** Poor. It breaks K1481 (runs only at a member's act), the table-decides rule ("the model never decides when the loop stops"), DEC-61 (transcripts are not the record), and the "persist the plan outside any model context" lesson (`research/B4.md` lesson 2). It is also the costliest (~15x a chat, `research/B4.md` §1.1).
**Cost and risk.** High cost; plan invisible to members; failures early in planning cascade unseen (`research/B4.md` §3, PIES). Rejected.

| | A by hand | B widen intent | C plan module | D agent |
|---|---|---|---|---|
| Plan visible and persistent | partly (dead ends, gaps) | yes | yes | no |
| Why each document is held | no | partly | yes | inside the agent only |
| Competing explanations proposed | no | no | yes | yes, unaccepted |
| Re-plan and stop | by the member | partly | yes | yes, unattended |
| New modules | 0 | 0 | 1 + 1 mode | many |
| Rulings needed | 0 | 2 | 4 | doctrine change |
| Works with no AI | yes | yes | yes | no |

## 6 · Recommendation: Option C, a plan-of-enquiry module and one planning mode

### 6.1 Shape

The plan is **record, not memory**: a set of member-owned rows in the project, read by every run first and proposed into by runs last (`research/B4.md` lesson 2). Runs stay short, bounded and member-started; the plan is what persists. The machine proposes objectives, explanations and steps with reasons; a member adopts, declines or defers each, singly or in bulk; nothing executes until a member starts it.

```
member's words + interview (LOOP)
        │
        ▼
  enquire run (frame)  ──proposes──►  plan of enquiry (project, layer 7)
                                        objectives (intent) · questions (inquiry)
                                        explanations (hypotheses + proposals)
                                        lines of enquiry · steps (why · route · by when · state)
        ▲                                        │ member adopts / starts
        │ plan review due (told once)            ▼
  arrivals: capture, reply, newer      execution routes: search · capture request ·
  version, contradiction, duty         sweep · records request (action) · ask a member ·
  transition, read done                observation · watch      ── each tagged with its step
```

### 6.2 Modules and services

**New: `enquiry` (layer 7, after `intent`).** Holds the plan of enquiry of a project. Uses `intent`, `inquiry`, `hypotheses`, `contradiction`, `strength`, `retrieval`, `observation-log`, `capture-requests`, `events`, `duties`, `standards`, `progressions`, `ai-runs` (all earlier layers). Later layers (`actions`, `action-clocks`, `link-sweep`, `monitoring`) reach it only through registration seams, as `duties` does with `registerTriggerSource` (`notes/M4.md` §1.6), because a layer-7 module may not use layer 9 or 10 (layers.md P4, `notes/C1.md` D32).

Objects:

| object | fields (essentials) | who writes |
|---|---|---|
| **Step** `STP-` | `serves` (≥1 of: objective, inquiry, hypothesis, standard, duty); `seeks` (a document, a kind of document, a document set, a fact, a person's account, a member's observation, a decision; with publisher entity and expected kind, e.g. OCDS `documentType` or profile doctype); `why` (one or two sentences; machine reason labelled, never the member's words); `discriminates` (hypotheses it could support or cut, with the expectation); `route` (search the record · capture an address · sweep · named request · records request · ask a member · firsthand observation · watch); `access` (from the profile: public online, records law with its clock, court rule, not public; undetermined when the profile is silent); `by_when` (optional date with a basis: a deadline id, a meeting, or the group's own window); `state` (proposed · adopted · underway · waiting · satisfied · blocked · retired · declined) with a reason on every move; `satisfied_by` (captures, looks, legs, correspondence) | machine proposes; member declares, adopts, revises, retires |
| **Line of enquiry** `LOE-` | label; focus (one question or one explanation); its steps in order | member, or adopted from a proposal |
| **Explanation proposal** `XPL-` | statement; kind (`cause`, `flow`, `other`…, as `hypotheses`); about (entities, events); `expects` [{observable, if true or if false, step?}]; source (run, or a pattern from the starter library); state proposed → held (a member holds it as `HYP-`) · deferred · dismissed | machine only; adoption is the member's `hypotheses.hold` |
| **Constraint** | what the member said must hold for this investigation ("no contact with the principal yet", "only public sources", "by the 14 Nov board meeting") | member; echoed into every run's instructions |

Services (each one sentence):

| service | what it does |
|---|---|
| `planOf({project, viewer})` | The plan as it stands: objectives with `intent.progress`, questions, held explanations and pending proposals, lines and steps by state, waits with what/from whom/by when (DEC-98), and the frontier subjects that touch an adopted step. |
| `whyHeld({capture, project})` | For a held document: the steps it satisfies, the objectives and explanations those steps serve, the route and who started it; else "held with no stated purpose" as an Undetermined with its because-line. This is the read READING and HOME consume. |
| `propose({run, items})` | The machine's only door: steps, lines, explanation proposals and step links, stored apart, labelled machine work with the run, skill version and sources; refused if an item serves nothing (`STEP_SERVES_NOTHING`), repeats a held item, or exceeds the run's `proposals` bound. |
| `declare`, `adopt`, `decline`, `defer`, `revise`, `retire` | Member acts, reasoned where they decline, retire or change purpose; single or over a selection (DEC-69, DEC-97); every move appended, never overwritten; the record keeps whether a member adopted a proposal or wrote the item unaided (DEC-77 (b)). |
| `linkToStep({capture, step})` | A member states that a held document serves a step; the machine may propose the link, never make it. |
| `registerStepEvidence(source)` | The seam by which `capture`, `observation-log`, `actions` (correspondence received, `passed_unanswered`), `link-sweep` and `monitoring` tell the plan that something arrived for a step; satisfaction is then derived, or proposed for a member's confirmation where it is a judgment. |
| `replanDue({project})` | Derived, never stored: the arrivals since the plan was last reviewed (a step satisfied or blocked; a capture completed; a reply or a missed due date; a newer version of a cited document; a contradiction candidate; a duty occurrence changing state; a held document read), each with when. Raises one `plan-review-due` queue item per project when the set gains its first member, told once and ageing (DEC-70). |
| `stopRead({project})` | Derived: each objective's state; adopted steps still open; held explanations that no feasible step could still move; due dates ahead. When no adopted step is open and no proposed step could change an explanation's status, it says so and offers two proposals: **watch** (standing questions, monitored sources, dated waits; the plan reopens on arrival) or **close** (the owner's reasoned act in `project-stage`). |
| `startSteps({steps, by})` | One member act that starts adopted steps: opens a bounded `investigate` or `extract` run per step with the step as its objective (subject and objective member-authored, `notes/C2.md` §1.3 AR §7), files capture requests tagged with the step, or opens a drafted records request in `actions` for the member to send. Rung *reasoned*, the budget shown beside it (DEC-88's `workobjective` pattern). |
| `explanationsView({inquiry})` | Derived read: held explanations as columns, accepted evidence as rows, the member's ratings (consistent, inconsistent, neutral, with a reason) in the cells, the machine's proposed ratings beside them labelled, items consistent with every explanation marked "does not discriminate" and kept, and for each explanation what it expects that nobody has looked for. No total, no likelihood word, no ranking (DEC-89, DEC-84 (10)). |

**Changed, small:**

- `hypotheses`: add `expects` (observables if true or false) and member ratings of evidence against a hypothesis; still member-only, still never legs (K1467). *(This is the explanation-under-test shape `notes/M1.md` §4 item 4 finds missing.)*
- `intent`: one more condition kind, *questions answered*: satisfied when the listed inquiries are concluded by the project, or reach the project's bar, so "what's going on" gets computed progress; R18's `workObjective` gains a consumer (the `enquire` mode reads objectives and gaps).
- `capture-requests`: a `step` field beside `purpose` and `lead_inquiry`, written at the door, never inferred (the `out-of-inquiry-lead` discipline, `notes/M1.md` §1.18, §4 item 13).
- `queue`: kinds `plan-proposals` (a tray, one item per run, N instances: "never 58 tasks", IC `:392`) and `plan-review-due`.

**New run mode `enquire`** (in `run-rules`, `agent-harness`, `agent-worker`, `skills`). A tabled flow like `PLAN_FLOW` (`notes/M2.md` §3.6): gate → read (`planOf`, frontier, looks, waits, timeline, standards and duties on the subject, contradiction candidates, held documents with `whyHeld`, constraints) → judge `frame` (intake only: the question as read, proposed objectives, the promise and the baselines to trace) → judge `explain` (3–7 explanations, always including the official explanation and an error-or-accident explanation; what each expects) → judge `steps` (steps that discriminate, quiet documentary ones first, each serving something, with route and access from the record and profile) → judge `contrary` (a consider-the-opposite set when the member has just adopted a main line or an explanation naming a person or body) → code checks → `propose` → close. **No fetches and no sub-sessions** (`fetches = subsessions = 0`, as `plan` mode for action plans, `notes/M2.md` §3.1), so a planning run is cheap and cannot reach the web; research happens in the runs `startSteps` opens. Closed book (K1474): every place, publisher and rule it names comes from the record, the profile or the starter library; otherwise the step says "where to find it: undetermined".

**Skill layer `investigation_planning`** in the pack, quoting canon (`skills` R21): needs canon text first, which this study's synthesis can supply for Bob to approve.

**Starter library (data, not code).** Per investigation shape (schedule-and-cost; compliance-against-standard, `notes/P0.md` observation 1): the stages and document kinds to expect (OCDS/OC4IDS stages and `documentType`, CoST proactive and reactive items, `research/B5.md` §2.1–2.2, L3), the explanation families with what would confirm or contradict each (`research/B5.md` §1.6 table), and the baselines to fix (L6). Held like a wizard-script library (DEC-121): authored, sourced, approved by a member, labelled when used, places from jurisdiction profiles only. It informs proposals; it never concludes.

### 6.3 How the planner meets each part of its scope

| scope item | how |
|---|---|
| **Words and interview → objectives** | LOOP holds the conversation (§9). The planner turns what it yields into a `frame` proposal set: the question as read; objectives (S1's O1–O5 shape) with a *questions answered* condition where they can be computed; the first step is always "find the source of the promise or rule" (`notes/P0.md` §2; `research/B5.md` L6); clarifying questions still open become steps routed *ask a member*. The member edits and adopts before anything is spent ("show the plan before spending", `research/B4.md` lesson 1). |
| **Lines of enquiry** | One per held explanation or per objective question; steps ordered by the planner's proposal order and by `by_when`; no stored priority. |
| **Next steps** | Find document X (capture, sweep, named request); records request (drafted into `actions`, sent by the member); ask whom (a step whose route is *ask a member* or a request for comment, addressee by role, Action rule 6); settle a contradiction (a step serving a `contradiction` candidate, satisfied by its resolution); test an explanation (a step whose `discriminates` names it). |
| **Re-planning** | `replanDue` gathers arrivals; one queue item; the member starts an `enquire` run, which proposes a *difference* (new steps, steps to retire, explanations to revisit); the member adopts per item. A diagnostic arrival (a change order coded "differing site condition") makes the run propose a new line (`notes/P0.md` S1 §Iterates). |
| **Why each document is held** | The step is the purpose: capture requests carry it; member captures are linked to it; `whyHeld` answers for any document; a document held for no step says so. READING reads a document *for* its step: what the step expects and which explanations it might separate. |
| **Staying on the objectives** | Every proposal must serve an adopted objective, question or explanation, enforced in code. Finds that serve nothing go to the discovery loop (`intent` R15) or to `out-of-inquiry-lead`, never into the plan. Constraints are echoed into every run, against agents' habit of dropping user restrictions (`research/B4.md` §1.5, PIES). Invariant 7 holds: the plan directs what is sought; nothing found is hidden. |
| **Competing explanations** | Proposed 3–7 at a time, including the official version and error or accident; held by members as hypotheses with `expects`; tested by discriminating steps; seen side by side in `explanationsView`; status changes only with a recorded reason; unproven kept alive. The planner never states which explanation is true; cause stays member-authored (DEC-84 (10)). |
| **When to stop** | `stopRead`'s rule is code: no open adopted step and no proposable step that could move an explanation. It proposes watch or close; the member decides. Watching is the existing standing questions, monitored sources (`monitoring` R33) and dated waits; an arrival reopens the plan. |
| **Proposals a member accepts** | One tray per run (five at a time, as `action-plans` R32), each item with its reason, sources, what it serves and what it would cost to start; adopt, decline with reason, defer; single or bulk; nothing pre-ticked; acceptance rate measured per kind, aggregate only. |

### 6.4 Bob's school case under the recommendation *(inference)*

1. The parent writes her paragraph. The interview (LOOP) asks which district, where "one school year" was said, where the children are, how it is funded. She knows the district and remembers a principal's letter.
2. An `enquire` run (frame) proposes: objectives O1–O5; first steps "find the source of the one-school-year promise (principal's letter; board presentation; bond material)", "find the contract time and LD rate in the awarded contract", "find the DSA application and approval dates", "find the board award item and bid tabulation", "find the latest bond program status report", each with why, route and access (board portal: public; contract: records request under the profile's records law, its clock shown); explanations: unforeseen site conditions, design errors and DSA change documents, owner scope changes, contractor performance or distress, funding timing, an optimistic promise never in the contract, plus the district's stated reason once found. She keeps all but one explanation (declines "contractor distress" for now, with a reason) and nine of eleven steps.
3. She presses start on the online steps; runs find the award item and the status reports; she sends the drafted records request herself. Each captured document answers `whyHeld` with its step.
4. The status reports show the forecast moving in month 7; the planner's next run proposes a line on that window (`research/B5.md` L7). The records request goes unanswered past its due date; the step turns *waiting* then *blocked: passed unanswered*, which is itself a finding (`research/B5.md` L4).
5. The change-order log arrives; `plan-review-due` appears once; the re-plan proposes steps on design-error change orders and DSA CCD dates, and a contrarian set when she adopts "design errors" as the main line.
6. When the remaining steps can no longer move any explanation and occupancy is months away, `stopRead` offers *watch*: standing questions on board agendas and the DSA tracker until certification (`notes/P0.md` S1).

### 6.5 Deliberately left out

- **An autonomous agent** that plans and fetches unattended (Option D): doctrine (K1481, table-decides) and cost.
- **Machine-held hypotheses, likelihoods, scores or a "most likely" label**: K1467, DEC-89, DEC-84 (10); ACH's value is the audit trail, not the arithmetic (`research/B3.md` §3, Mandel et al.).
- **Assigning steps to other members, hours or costs**: Action rule 8 and `action-plans` R26 forbid them for plans; a member may claim a step for themself (§8 decision 9).
- **Publishing the plan**: DEC-25.
- **A plan-of-enquiry per inquiry**: the plan is the project's thinking (Membership §7.9); questions remain shared.
- **Fetching inside the planning run**: kept for `investigate` and `extract` runs started from steps, so planning stays cheap and closed-book.
- **Writing new document readers per kind**: READING's concern; the planner only names the kind it expects.
- **Notifications outside the product, reminders the member did not set**: DEC-94.

## 7 · Staging

Smallest useful step first. Each stage works with no AI as well (K1547); the AI adds proposals.

| stage | delivers | depends on | acceptance test, in a member's terms |
|---|---|---|---|
| **P1 · A plan by hand** | `enquiry` with steps, lines, constraints, member acts, `linkToStep`, `whyHeld`, `registerStepEvidence` from capture, observation-log and actions; `planOf`; a wizard script "Plan an investigation" (no key) | nothing new beyond T33 | "I write five steps for Grandview, link the award item I captured to 'was the award competitive?', and three weeks later I see which steps are done, which wait on the district and until when, which are blocked and why, and for every document I hold, why I hold it." |
| **P2 · The planner proposes at intake** | mode `enquire` (frame, steps), the tray, DEC-77 acceptance on plan items, `capture-requests.step`, `intent` *questions answered* condition, skill layer from canon | the agent runner live and `check` verified (VF-4, after T33's release, `notes/M2.md` §1.1); ruling §8 items 1–4 | "From my paragraph and four answers, the assistant proposes objectives, the promise to trace and about ten first steps, each saying why and where; I keep most, decline two with a reason, and nothing is fetched until I press start." |
| **P3 · Explanations** | `XPL-` proposals, `hypotheses.expects` and ratings, `explanationsView`, the `explain` and `contrary` judgements; starter library for schedule-and-cost | P2; ruling §8 items 3, 5 | "I see six possible reasons Grandview is late, the district's own among them, each with what would show it; nothing calls one the answer; when I pick 'design errors' as the main line, I'm offered once the steps that would show it wrong." |
| **P4 · Re-plan and stop** | `replanDue`, `plan-review-due`, re-plan as a difference, `stopRead`, watch and close proposals | P2; `notice-producers` and `reevaluation` R34 (specified) for the date-moved trigger | "When the change-order log arrives I'm told once that the plan may need review; one press gives me proposed changes. When nothing left could change the picture, I'm told so and offered to watch the board agendas and the state tracker until the school opens." |
| **P5 · Steps that run** | `startSteps` opening `investigate` and `extract` runs with the step as objective; drafted records requests; sweeps and named requests tagged with steps | `investigate` deployed (after `check` verified, `run-rules` R19); READING's purpose-guided reading; `actions` R62 addressee | "I press start on three adopted steps; the assistant finds two documents online and drafts a records request for the third, which I send myself; each document arrives labelled with the step it answers." |
| **P6 · Compliance shape and more profiles** | starter library for compliance-against-standard; profile entries for a school district, its board portal and the state architect | P3; jurisdiction profile work (`notes/M4.md` §1.15) | "The same planning works for my neighbour's sewer-fee question, starting from the audit's recommendations." |

The eval set comes with P2: twenty to fifty investigations from `notes/P0.md`'s scenarios with known documents, graded on outcomes (objectives sensible, the promise's source found first, steps that serve something, explanations including the official one, no step from the model's memory) and read by people (`research/B4.md` lessons 26–29). A-COST owns the measures.

## 8 · Decisions for Bob

| # | kind | decision | recommendation |
|---|---|---|---|
| 1 | architecture | Add a layer-7 module `enquiry` holding the plan of enquiry, beside `intent`, as the first form of the reserved "Discovery" candidate (`build/layers.md` §Layer 7) | **Yes.** Widening `intent` (Option B) mixes the group's aims with tactical state; an agent (D) breaks doctrine |
| 2 | policy | Extend DEC-77's ACCEPTING A PROPOSAL act to plan items (objectives, explanations, steps, step links), with the per-kind acceptance rate measured in aggregate, never per member | **Yes**, with the `contradiction` R39 review rule (≥95% over ≥30) reused |
| 3 | doctrine | The machine may propose explanations, stored apart and labelled; only a member holds one as a hypothesis (K1467 unchanged; this is not a K1473 judgment score) | **Yes.** Generating alternatives is where people fail and machines help most (`research/B3.md` §1.4) |
| 4 | doctrine | An adopted step counts as a member's request for targeted work (K1468), and one member act may start several adopted steps (K1481) | **Yes.** It keeps every run at a member's act while sparing a parent twelve presses |
| 5 | policy | A starter library of investigation shapes (stages and document kinds to expect, typical explanations, baselines), sourced, approved like wizard libraries, labelled when used, distinct from Action rule 8's "no catalogue" for outward action | **Yes**, public works first |
| 6 | policy | The plan of enquiry is working material, never published (DEC-25 extended), shared with the project's joined participants | **Yes** |
| 7 | requirements | When nothing left could change the picture, the machine proposes *watch* or *close*; the member decides; watch reopens the plan on arrival | **Yes** |
| 8 | requirements | At the two tipping points (adopting a main line; holding an explanation that names a person or body) the planner offers a consider-the-opposite set once, as proposals, never as a gate or a second ask (DEC-69) | **Yes** |
| 9 | policy | A member may claim a step for themself ("I'm on it"); nobody assigns steps to others; no hours or costs | **Yes** |
| 10 | UX | Member words for the plan, its lines, steps and explanations (the study uses "plan of enquiry", "line of enquiry", "step", "possible explanation"; "plan" alone is the action plan's) | Bob chooses, through the design stream |

## 9 · Interfaces with the other capabilities

| capability | what PLANNING gives it | what PLANNING needs from it |
|---|---|---|
| **READING** | The purpose to read with: `whyHeld` gives the step, what it expects, and the explanations the document might separate; the expected document kind | Facts proposed from a read document (which satisfy or block steps); a "read done" arrival for `replanDue`; whether a document is of the expected kind |
| **HOME** | The plan as one section of the investigation's view; plan moves (adopted, declined, retired, with reasons) as the "what we did" lane of the timeline and as the decision log `research/B2.md` lesson 9 asks for | The home's single view and timeline to show the plan in; the project as the plan's container |
| **PROCUREMENT** | The schedule-and-cost shape: baselines to fix, windows to explain, the explanation families as starter proposals | Document kinds and stages (OCDS/OC4IDS), what each kind settles, which red flags exist as leads, profile entries for school districts and state agencies |
| **LOOP** | Proposal sets (frame, steps, explanations, re-plan differences, watch or close) for the tray; the reason and cost beside each | The interview and its held answers; the tray, acceptance acts and notification rules; how several members' decisions on one plan meet (a step one member declined that another's question needs) |
| **COST** | Planning runs with no fetches; per-step budgets at `startSteps`; the stop rule as the main bound on total spend | Run budgets and the plan meter's display; who pays (the starting member's account, K1502); the eval set and measures for P2 onward |

## Sources opened

All read whole, first line to last (long files in consecutive ranges):

- `RESUME.md`, `PROTOCOL.md`, `prompts/A-PLANNING.txt`.
- `notes/P0.md` (1–324).
- `notes/C1.md` (1–244), `notes/C2.md` (1–226), `notes/C3.md` (1–182), `notes/C4.md` (1–207), `notes/C5.md` (1–274), `notes/C6.md` (1–172).
- `notes/D1.md` (1–416), `notes/D2.md` (1–182).
- `notes/M1.md` (1–393), `notes/M2.md` (1–308), `notes/M3.md` (1–425, 426–516), `notes/M4.md` (1–369, 370–440).
- `research/B1.md` (1–252), `research/B2.md` (1–216), `research/B3.md` (1–307), `research/B4.md` (1–271), `research/B5.md` (1–361).

Searched after reading (PROTOCOL rule 1):

- `build/rulings.md` line 1629 (K1627), by grep, to quote Bob's ruling exactly.
- `prompts/A-READING.txt`, `A-HOME.txt`, `A-PROCUREMENT.txt`, `A-LOOP.txt`, `A-COST.txt`: the scope line of each, to draw the interfaces in §9 without overlap.
