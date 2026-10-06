# S-SYNTHESIS · The investigation engine: proposed architecture

Unit S-SYNTHESIS, phase 4 of the investigation study (`PROTOCOL.md` §S). Sources, all read whole: the six studies (`studies/READING.md`, `PLANNING.md`, `HOME.md`, `PROCUREMENT.md`, `LOOP.md`, `COST.md`), the three reviews (`reviews/R-1.md`, `R-2.md`, `R-3.md`) and the problem set (`notes/P0.md`). Product claims are cited through the study that verified them (`HOME §6.3` means `studies/HOME.md` §6.3, which cites the note and through it the product). Reviews are cited by finding id (`R1-B1`, `R2-X2`, `R3-X4`). *(inference)* marks reasoning of this synthesis; status words follow PROTOCOL rule 3 (**built**, **specified**, **planned**, **absent**); "built (T33)" means merged on `tranche/T33`, not yet on `main`.

**What this document does.** It turns six parallel studies into one design. The reviews found that the studies designed five constructs two to four times with different owners and layers (R3 §1). Each of those is settled here **in the architecture itself**: one owner, one layer, one service name. Where a study's design is replaced, §6.2 says so and why. The design is held to the problem set's needs and to the substrate already built: every new piece below names the P0 need it serves, and every built service an engine can use as it is, is used as it is.

## 1 · The problem in a page

**What Bob asked.** A member brings a grievance in her own words. The system should take what it is given, ask a few follow-up questions, and "start digging": find the RFP, the bids, the award, the contract and its terms, the budget, the status reports, the contractor's history, "to get at the heart of what's going on". It should read each document knowing why the document is in the file, keep an investigation file that every part of the system adds to over weeks, stay on its objectives, and keep the member in the loop: "the machine proposes and a member accepts" (`RESUME.md`; ruling K1627).

**What the problem set adds** (`notes/P0.md` §2). Fourteen realistic investigations, from a school rebuild to a sewer-fee diversion, an eviction court and a council vote, share fifteen needs. Seven observations shape the architecture (P0 obs. 1–7):
1. A grievance must become a **comparison**: what was required or promised against what was done. The first question is usually "where does the promise or rule come from?"
2. **Document kinds are finite and recur**: agendas, staff reports, contracts, change orders, schedules, budgets, permits, filings. Reading with purpose can rest on a catalogue of kinds.
3. **The records request is a first-class object** with a clock, and a refusal or a silence is itself evidence (ten of fourteen scenarios).
4. **Time dominates**: every answer is a chronology, and several clocks run at once.
5. **Iteration is driven by arrivals**, and most of an investigation's life is waiting.
6. **Scale varies a hundredfold** (S10: days and a dozen documents; S2 and S11: years and hundreds). The small case must be trivial and the large one bounded.
7. **The member is a co-investigator**: her site visits, logs and attendance are evidence too.

**What the substrate already has.** Almost everything below and around the engine is built or specified on T33 (`HOME §3`; `PROCUREMENT §3.1`; `LOOP §3`; `COST §3`):
- the project as a group's working home, with membership, sight and a bar;
- inquiries, hypotheses (member-held only), contradictions and strength pairs;
- `intent` objectives with derived progress and gaps;
- captures with provenance and grades, a tiered reader (text layer, OCR at cap C) and an observation log of every look;
- a world model of events, money, lines, duties, standards, entities and declared flows (`progressions`), with two-lane timelines and commitment-basis duties whose "overdue" is a question, never a violation;
- records requests with clocks (`actions`), capture requests, sweeps and monitoring;
- bounded, tabled AI runs paid by the starting member's own account (K1502); `check` is the only deployed mode, and it has not yet run live;
- the proposal construct (adopt, defer or dismiss with a reason; nothing adopted automatically), the queue, and wizard scripts that run with no AI.

**What is missing** is the engine itself, in six pieces, one per study:
- no record of **why a document is held** (HOME G2; PLANNING G3; READING G1);
- no **plan of enquiry** that persists across runs (PLANNING G1);
- no **reading** of a document's text by a run, and no tray for the facts a reading finds (READING G2, G5);
- no **procurement vocabulary** (PROCUREMENT G2–G8);
- no **one view** of an investigation and its log (HOME G1, G4);
- no **cost or quality measure** above a single run (COST G1, G7).

### 1.1 Grandview, end to end, as the system would handle it *(inference; figures illustrative)*

| when | what happens | who acts | built pieces used | new pieces used |
|---|---|---|---|---|
| Day 0 | The parent opens a project "Grandview rebuild" from "Start from…" and picks the script **"A public project is late"**. It shows six questions on one page, each with why it is asked: which district and school; where "one school year" came from; when construction started; where the children are; how it is paid for; what she has seen and been told. She skips one. | member | `wizard-scripts`, `intent` (objective), `inquiry`, `provenance.testify` (her site visit, grade D), `observation-log` lead | interview script; `investigation.subjectPropose` (district, school, contractor) |
| Day 0 | With her AI account on, an **`enquire` run** (no fetching) proposes objectives O1–O5, a first step "find the source of the one-school-year promise", nine more steps each with why, route and access (board portal: public; contract: records request, clock from the profile), and seven possible explanations, including the district's own and "an optimistic promise never in the contract". She keeps most, and declines two with a reason. Nothing is fetched yet. | machine proposes, member adopts | `intent`, `hypotheses` | `enquiry` steps and lines; explanation proposals in `hypotheses`; the library's public-works pattern |
| Day 0 | Each adopted step that seeks a document becomes a **sought holding**: "the executed contract, to fix contract time and LD rate, serves O1". The records request is drafted in `actions`; she sends it herself. | member | `actions` (records request, `due_cite`) | `holdings.seek`; `enquiry.startSteps` (drafting) |
| Week 1 | She starts the online steps. Capture requests carry their holding; on completion each document says why it is held: "sought by the assistant at the parent's request, to establish the award date and contract sum". | member act; machine-attributed provenance | `capture-requests`, `capture` | `holdings` (purpose stated at the door) |
| Week 1 | She asks the assistant to **read the award item for the award**. The reading proposes award date, amount, contractor and four bidders, each beside its quote on the page. She adopts three and corrects one. | machine proposes, member adopts | `docprofile`, `reading-pipeline`, `events`, `money`, `lines` | `extract` READ_FLOW; owner propose paths; reading profiles |
| Weeks 2–8 | The view shows "Waiting on the district's records officer: contract, schedules, change-order log; due 14 Oct". Production arrives as a ZIP of scans. Each file becomes a capture; the holdings they answer turn **held**; the plan shows "review due" once. | daemon; member | `actions` correspondence, OCR tier | ZIP intake; `enquiry.replanDue` |
| Weeks 3–8 | Read for its purpose, the contract yields "contract time 540 calendar days from NTP" as a `contract` standard and a duty triggered by the NTP event, its due date computed. Each CM report adds a `forecast` date. The baseline schedule was withheld: its holding reads "Looked, absent: withheld under the litigation exemption, reply of 2 Nov", and the refusal is a journal entry. | machine proposes, member adopts | `duties`, `civil-time`, `observation-log` | `standards` kind `contract`; `events` kind `forecast`; `explore.baselinesOf` |
| Month 3 | The project page shows three clocks side by side: the promise (its source found in a board slide, or "member's account, grade D"), the contract's completion date, and the forecast series, with the first slip in the March report. "Overdue" reads as a question. A Noticed item: change orders 14% of award, against the statute's cited limit of 10%. | view; gated detector | `duties`, `money-checks` (gated) | `investigation.timelineOf`; `baselinesOf` |
| Month 4 | A second parent joins. She reads "What we did": what was requested, refused and decided, and why; which entries were the assistant's. A run she starts begins from the same record, not from anyone's transcript. | member | membership, `ai-runs` | `investigation.journalOf`, `resumeContext` |
| Month 6 | Nothing left could move an explanation; occupancy is months away. The plan offers **watch** (board agendas, the state architect's tracker, a dated wait) or **close**. She chooses watch. | machine proposes, member decides | `monitoring`, standing questions | `enquiry.stopRead` |
| Any time | "What's going on?" returns the **project answer**: baselines with sources, the chronology, member-authored causes with their strength against the bar, every other explanation by its state, unknowns with the record that would settle each, the district's own explanation quoted, next acts. No cause she has not authored is named. | machine composes, member reads | `answers.checkAnswer`, `strength` | `investigation.projectAnswer` |

## 2 · The principles of the design

Each principle is doctrine already ruled (cited), or a rule this synthesis sets to close a review finding.

| # | principle | source |
|---|---|---|
| P1 | **The record is the memory.** The plan, the purposes, the log and every decision live in owner modules, in the project. Nothing an investigation must remember lives in a transcript, a run's scratch state or one member's account. | DEC-61, DEC-113, K1502 (`HOME §5` Option D; `PLANNING §6.1`) |
| P2 | **The machine proposes; a member accepts.** Every machine contribution is a proposal stored **in the module that owns that kind of fact**, labelled machine work, adopted only by a member's act. One pattern: the one `duties` and `standards` already use. | `RESUME.md`; DEC-77; `PROCUREMENT §6.3`; R1-B1, R3-X1 |
| P3 | **One fact, one home.** Each construct below has exactly one owner and one service name. Where two studies built the same thing, one is chosen (§6.2). | CL §10, D368 (`HOME §6.3`); R3 §1 |
| P4 | **Purpose directs seeking, never filtering.** Why a document is held is an annotation: a document with no stated purpose is still held and shown; a purpose ranks, hides and gates nothing. | Framework invariant 7 (`READING §3.3`; `HOME §4.3`) |
| P5 | **Runs are short, bounded and start at a member's act.** The plan persists; runs do not. The table decides control; the model judges inside a step. | K1481, `run-rules` R18, `agent-harness` R4 (`PLANNING §3.4`; `COST §3.3`) |
| P6 | **Read the document, return proposals, never text.** A run may read bounded, addressed spans of one held document for one purpose; it returns proposals pinned to verbatim quotes. | IS §14b.1 kept in substance (`READING §4.2` F2); R1-S4 |
| P7 | **Grades are computed, never offered.** The quote's cap is the text's cap; values are parsed by code; the interpretation is the member's (Decision D4). | DEC-75, extraction R42 (`READING §6.3`); R1-B2 |
| P8 | **Layer order holds.** A module uses only earlier layers; a later layer contributes through a registration seam. | layers.md P4 (`notes/C1.md` D32); R3-X4, R2-H1, R2-P8 |
| P9 | **No score, no priority, no outside notification, no read surveillance.** Order is by time, by objective, or by a stated quantity. The home is the cadence; arrivals reach the queue once. | DEC-82, DEC-89, DEC-94, DEC-68, DEC-69, DEC-70 (R3 §5) |
| P10 | **A floor without AI at every stage.** Each first step works by wizard script with no key. | K1547, DEC-120 |
| P11 | **Knowledge is data, approved by people.** Document kinds, investigation patterns and red-flag thresholds are versioned library entries with sources; jurisdiction facts live in profiles; no law in code. | DEC-121, D31, D-149 (`READING §6.2`; `PROCUREMENT §6.4`) |
| P12 | **Measure before widening.** No run mode or proposal kind deploys without a live verification and a test-investigation bar. | `run-rules` R19 extended (`COST §6.4`) |
| P13 | **People are named only through their documented acts.** No investigation of a private person; officials in their official acts only. | DR6/K1483 (`COST §6.5`, narrowed by R3 C-a) |
| P14 | **Small first.** Every piece is optional: a plan can be three steps typed by hand; a reading can be a checklist. | P0 obs. 6; DR2 |

## 3 · The architecture

### 3.1 The whole in one paragraph

The investigation **is the project** (K1627; decision D2). Four new modules hold what no owner holds today: **`investigation-library`** (layer 4: how to read a recurring kind of document, and what a recurring shape of investigation expects); **`holdings`** (layer 6: why each document is held or sought); **`enquiry`** (layer 7: the plan of enquiry); and **`investigation`** (layer 7: the one view, the two-lane timeline, the journal, the context a run reads first, and the project answer). One new run mode, **`enquire`**, proposes into the plan and fetches nothing. One new flow, **`READ_FLOW`**, inside the existing `extract` mode, reads one held document for one purpose. Everything else is an amendment to an existing owner: **propose → adopt** acts in `events`, `lines` and `money`, on the pattern `duties` and `standards` already use; explanation proposals in `hypotheses`; a few procurement words in closed vocabularies; one field on `capture-requests`; one shared verification and one acceptance measure in `run-productions`. No module duplicates an owner, no new trust boundary is added, and no new payer exists.

### 3.2 New modules

Sizes are rough *(inference)*, in the line terms the studies use; the four together are about 6,000–8,500 lines, plus the run mode across `run-rules`, `agent-harness`, `agent-worker` and `skills`, plus the amendments of §3.4 (R2-P6 asked for the total).

#### `investigation-library` (new · layer 4, after `content` and `calibration`)

**Need served.** Reading with purpose (P0 §2; obs. 2); "a recurring kind earns an approved reading profile" (K1627); planning from domain schemas (P0 obs. 1). **Replaces** three libraries designed separately: READING's `reading-profiles`, PROCUREMENT's pack catalogue and PLANNING's starter library (R1-S1, R3-S9).

**Stored.** Versioned entries of two types, each with status (`draft` / `measured` / `approved` / `retired`), library (`civicsmith` or the group's), sources, and the member act that approved the version:

| entry type | content | first entries (from S1) |
|---|---|---|
| **reading profile** (one per document kind) | description; OCDS `documentType` code where one exists; recognition cues (jurisdiction-specific cues by reference to the profile, D31); expected structure; **fields**, each with key, description, where to look, type (date, duration, amount, party, clause, table), expectation (`always` / `usually` / `sometimes`), **critical** flag, and target owner act; purposes served; stage in a declared flow; proactive or reactive (CoST); cautions ("a status report is a claim to check"); examples (captures whose member decisions form the measurement set) | construction contract, notice to proceed, change order, board award item, bid tabulation, CM monthly report, bond measure and project list (`READING §6.5`; `PROCUREMENT §6.4` (a)) |
| **investigation pattern** (one per shape) | the shape (schedule-and-cost, compliance-against-standard; P0 obs. 1); the baselines to fix (promise, approved schedule, contract time, baseline schedule; B5 L6); the expected kinds with proactive/reactive marks (the disclosure checklist); the declared-flow templates it uses, by reference to `progressions` definitions and versions; the explanation families, each with "would show in" and "contradicted by" document kinds | public works, design-bid-build (`PROCUREMENT §6.4` (b)–(d); `PLANNING §6.2` starter library) |

**Services.**
- `entryDeclare`, `entryRevise` (member); `entryPropose` (machine, stored apart, labelled; e.g. a draft profile built from what a member adopted on three documents of one kind, `READING §6.2` lifecycle).
- `entryApprove` (a project owner for the group's library; for Civicsmith's, the approver named in D8); `MACHINE_CANNOT_APPROVE`. Approval of a reading profile requires its measured adoption record to meet the bar BOB sets.
- `entryRetire`; `profilesFor({cues, jurisdiction})`; `patternsFor({shape})`; `checklistOf(entry)` renders the human checklist a wizard walks with no AI.
- Measurement is **not** computed here (it needs layer-6 adoption data): `run-productions` computes it and records it in `calibration` as the fidelity of the engine `reading:<profile>@<version>/<model>`; the library reads `calibration` (R1-B1 layering; R3-X4 rule).

**Fences.** An entry says what to look for, never what to conclude (`wizard-scripts` R12 pattern); no law or deadline is encoded (D-149); a place, body or rule named in an entry comes from a profile with its source (K1474 closed book).

#### `holdings` (new · layer 6, after `capture-requests` and `inquiry`)

**Need served.** Bob's central premise, "what is the reason that that document is in the case file?" (`RESUME.md`); the file's gaps as next tasks (HOME H-L4); refusals as entries (H-L5). **This is the single record of why a document is held** (R1-B3, R2-X1, R3-X2): PLANNING's `enquiry.whyHeld` and `linkToStep`, PROCUREMENT's "the stage is the role", READING's held-for record and both studies' extra fields on `capture-requests` all become acts that write a holding or reads of it.

**Stored, per `HLD-` row** (append-only history): `project`; `target` (a held capture's digest, or for a document **sought**: the library kind, a description, and where it is expected); `kind` (a library key, or words); `purpose` (the stater's words, with actor class); `serves[]` (question ids, the objective, plan-step ids registered by `enquiry`, and flow stages `{instance, stage}`); `brought` (actor class, actor, route: member capture, named request, sweep, a run's capture request, doorbell, records-request reply).

**Derived on read, never stored.** The state: *sought → requested* (from a pending capture request, or from a records request through the seam `actions` fills, R2-H1) → *held* → *released* → *read by the record* (content axis) → *cited* (a leg in a question the project draws on) → *set aside* (read from `capture` R79's existing act, so there is **one set-aside act**, R3-S8). For a sought row, its look state in D-129's words (Nobody looked; Looked, absent; Looked, could not tell).

**Services.**
- `hold({project, target, kind?, purpose, serves?})`: a member's act.
- **At the door** (R2-X2): a capture request filed by a run under a member's act carries one new field, `holding: {purpose, serves}`; on completion it becomes the holding, **machine-attributed** as provenance ("sought by the assistant, at Rosa's request, to …"; DEC-53). No new run write op is added (R2-H2).
- `holdingPropose({capture, serves, purpose})`: the machine's only other door, for **linking an existing document** to a question or step; stored apart, labelled; a member adopts or declines (R2-X2).
- `seek({project, kind, description, where?, purpose, serves})`: a member's act, also performed when a member adopts a plan step that seeks a document (R2-X3). Sought rows never fetch.
- `placeAtStage({capture, instance, stage})`: one member act that threads the document into a declared flow (`progressions.threadInstance`, layer 5) and writes the holding with `serves: stage` (R1-B3: the stage is one way to set a holding, not a replacement for it).
- `revise` (history kept); `holdingsOf({project, viewer, state?, kind?, serves?, page})`, bounded and paged, ordered by time or kind only.
- `whyHeld({capture, viewer})`: **the one `whyHeld`**, every holding the viewer may see for one document.
- `registerServes(kind, check)` (for `intent` and `enquiry`), `registerRequestState(source)` (for `actions`), `onHeld(listener)` (for re-plan triggers).
- `dependentSetAsides({question})`: a document set aside (`capture` R79) that a holding says serves another member's question; registered into `inquiry`'s waits (K1618, §3.4; R3-S8).

**Fences** (`HOME §6.3`): a capture lands whether or not any holding names it, listed as "held, no stated purpose"; a purpose filters, ranks and gates nothing; a holding is never a leg; "read" never means a member viewed it (DEC-68); a hidden project's holdings answer as absent. **Why not themes** (R2-H3): a `connections` theme is per idea, not per document; it has no sought state and is not project-scoped; its machine-proposes / member-places pattern is reused here in `holdingPropose`.

#### `enquiry` (new · layer 7, after `intent`, before `investigation`)

**Need served.** Planning toward objectives, re-planning on arrival, stopping (P0 §2 "planning" row; obs. 5); Bob's "planning function … stays focused on its objective(s)". It is the first form of the "Discovery" candidate reserved in layer 7 (`PLANNING §3.2`).

**Stored.**

| object | essentials | who writes |
|---|---|---|
| **Step** `STP-` | `serves` (≥1 of objective, question, hypothesis, standard, duty; `STEP_SERVES_NOTHING` otherwise); `seeks` (a document, a kind, a set, a fact, an account, an observation, a decision). A step that seeks a **document** creates a sought holding; one that seeks a fact or account stays a step only (R2-X3); `why`; `discriminates` (the hypotheses it could support or cut); `route` (search the record, capture an address, sweep, named request, records request, ask a member, firsthand observation, watch); `access` from the profile or "undetermined"; `by_when` with a basis; `state` (proposed, adopted, underway, waiting, satisfied, blocked, retired, declined) with a reason on every move; `claimed_by` (a member claiming it for herself; nobody assigns, D25); `satisfied_by` | machine proposes; member declares, adopts, revises, retires |
| **Line of enquiry** `LOE-` | label; one focus (a question or an explanation); its steps in order | member, or adopted from a proposal |
| **Constraint** | what the member said must hold ("only public sources", "by the 14 Nov board meeting"); echoed into every run's instructions; sight and DR6 rules as for leads (R2-X10) | member |

Explanation proposals are **not** stored here: they are owner-held in `hypotheses` (§3.4; R3-S4, R2-P1). Objectives and questions the machine proposes go through `intent`'s existing discovery loop (R15–R17), which already holds machine proposals apart.

**Services.**
- `planOf({project, viewer})`: objectives with `intent.progress` (or "not computable", R4), questions, held explanations and pending explanation proposals, lines and steps by state, waits.
- `propose({run, items})`: the machine's only door for steps and lines; refused if an item serves nothing, repeats a held or declined item whose cited sources have not changed (re-proposal only when a cited source gains a newer version or a new holding serves the same step, R3 L-c), or exceeds the run's `proposals` bound.
- `declare`, `adopt`, `decline`, `defer`, `revise`, `retire`, `claim`: member acts, singly or over a selection (DEC-69, DEC-97); every move appended with its reason; the record keeps whether the member adopted a proposal as proposed, edited it, or wrote it unaided (DEC-77 (b)).
- `registerStepEvidence(source)`: for **later** layers only (`actions`, `link-sweep`, `monitoring`); earlier owners (`capture`, `observation-log`, `holdings.onHeld`) are subscribed to directly (R2-P7).
- `registerStepHandler(route, handler)`: `actions` (layer 9) registers "draft a records request from a step", so `enquiry` never calls layer 9 (R2-P8).
- `replanDue({project})`: derived, never stored: the arrivals since the plan was last reviewed. It raises one `plan-review-due` queue item per project, told once and ageing (DEC-70).
- `stopRead({project})`: derived: when no adopted step is open and no proposable step could change an explanation's status, it says so and offers **watch** or **close** (decision D16).
- `startSteps({steps, by})`: one member act over adopted steps. It drafts records requests (through the registered handler) and files capture requests carrying their holding. **Opening AI runs from steps** ships only with decision D7 clause (c), in the last stage (§5).

**Why not inside `intent`** (`PLANNING §5` Option B): `intent` holds the group's aims; steps, routes and clocks are tactical working state, and the merged module would pass the ~4,000-line split threshold *(inference)*. **Why `serves` is not `intent.servesOf`** (R2-P3): `servesOf` orders mechanical scheduler work over subjects; a step's `serves` is a purpose link. The scheduler is not blind to planned work, because every fetch a step causes is a capture request or sweep that the scheduler already orders.

#### `investigation` (new · layer 7, after `enquiry`)

**Need served.** K1627's "one view and a timeline"; holding over weeks to years (P0 §2, all scenarios); picking up after weeks (LOOP N6); handover to a new member or a later run (HOME H-L6); the answer (P0 §2 "answer and action"). **This is the one composition** of "where it stands" (R3-S5): PLANNING's `planOf`, COST's meter and LOOP's L9 and `changesSince` are sections or parameters of it, and LOOP's L10 project answer sits here, so `answers` never reads upward (R3-X4).

**Stored.** Only the **subject set**: the entities the investigation is about (district, school, bond program, contract, contractor), with history. The machine may propose additions (from the interview's "which district, which school?" or from holdings' resolved entities, R3-S12); a member adopts. Everything else is composed on read. R2-H5 asked whether this module owns enough to exist: it owns the subject set, and its composed reads join some fifteen owners and the registration seams of layers 9–11. Folding them into `enquiry` would pass the split threshold; folding the subject set into `intent` would mix it with `watchSet`, which is what `monitoring` watches *(inference)*.

**Services.**
- `investigationOf({project, viewer, asOf?})`: sections, each bounded and paged, each naming its truncation, each answering hidden things as absent:
  - questions, with stance and **strength pair against the project's bar** (never one badge, DEC-82);
  - objectives, with progress or "not computable", and gaps;
  - the plan (`enquiry.planOf`);
  - documents (`holdings.holdingsOf`), listed with their states; counts appear only as list headings, never as "n of m" (R2-H7);
  - **Waiting on**, one line each, "what, from whom, by when" (DEC-98), from registered sources: action clocks, capture requests, dated waits (personal and project), duty occurrences, monitoring rechecks, steps in state *waiting* (R2-X9), and K1618 set-aside waits;
  - explanations: held hypotheses, explanation proposals labelled, "Hunches to clear" (DEC-104), contradictions;
  - runs: mode, starter, state, what each proposed and what members did; **spend** shown to the paying member only, other members' runs as a count (`ai-runs.runCost`; D12). This section replaces COST's `investigationMeter`, which sat in layer 6 and read layer 7 (R3-X4 (a));
  - findings and conclusions; the project stage and what the next stage needs;
  - dormancy as a display: "Waiting on 3 things; next expected 14 October", or "Watching" once a member chose watch in `stopRead` (R2-X7; D16).
- `timelineOf({project, viewer, from, to})`: two lanes side by side, never interleaved (events R28–R30). **What happened**: `explore.timelineOver(subject set)`, the duties concerning the set with their recorded transitions (the promise and contract clocks), and dated facts including `forecast` dates. **What we did**: `journalOf`.
- `journalOf({project, viewer, from, to, actor?, kind?, decisionsOnly?})`: derived from registered sources, each an owner's own append-only history: `intent.pursuitOf`, `holdings`, `enquiry` (step and plan moves with reasons, R2-X5), `inquiry`, `basis-versions`, `hypotheses`, `contradiction`, queue dispositions, `ai-runs`, and through `registerSource` `actions`, `action-plans` and `monitoring`. `decisionsOnly` is the decision log. `changesSince` is this read from a date that defaults to **the member's own last act** in the project, never a logged view (DEC-68; R3-S5).
- `registerSource({lane, kind, read})`: for layers 9–11, including queue counts (R3-X4 (b)).
- `resumeContext({project, viewer, bound})`: the compact read a run takes at open: objectives and gaps, the plan's open lines, holdings with purposes and states, open waits, live explanations and proposals, constraints, the journal since the run's last close. **The one new opening-context op** in the run's reach (R2-X4). References and short text only, never document bytes.
- `projectAnswer({project, objective?})`: per objective, criteria (each baseline with its source or "Undetermined, because …"), condition (chronology and occurrence states), cause (member-authored only; every other explanation by its state; otherwise "cause not established", DEC-84 (10)), effect where a finding supports it, unknowns with the record that would settle each and its wait, the other side quoted, next acts from adopted `action-plans` options (empty until that mode deploys, R3 L-f) and evidence-seeking actions. Composed closed-book and passed through `answers.checkAnswer` (layer 6). Read-only, labelled machine work, kept nowhere; a member may take its text as a labelled draft into a review copy (DEC-31).
- `subjectAdd`, `subjectRemove`, `subjectPropose`, `subjectsOf`.

**Fences.** No composed figure, percentage or score; no notification (the queue already groups by project); nothing about what a member viewed; assistant entries labelled and never counted as the group's activity (DEC-111); every read applies the viewer predicate, and a run's read stays within its principal's sight (MEM §7.9; membership R43's wide machine sight does not reach the home); an empty section speaks in DEC-86's words. **Scale** (R2 §4 risk 2): every section and both lanes are paged; the join is bounded; an S11-scale fixture (years, hundreds of documents) is part of the acceptance test.

### 3.3 The run side

**One new mode, `enquire`** (in `run-rules`, `agent-harness`, `agent-worker`, `skills`). It proposes into the plan and **fetches nothing**: `fetches = subsessions = 0`, like the `plan` mode for action plans (`PLANNING §6.2`). Its table, `ENQUIRE_FLOW`:

1. **gate**; **read**: `resumeContext`, plus the T33 reads the ask has and a run lacks (`timeline`, `duties`, `moneyof`, `explore`, `committedagainstpaid`; M2 G6), added to the mode's `PLANE_OPS`.
2. **judge `frame`** (only when the plan is empty, or at a member's request): the question as read; **up to six clarifying questions, each with why it changes the plan** (this is the AI interview: LOOP L2 had no home, R3 L-a; it is a judgement of this mode, rendered on the interview script's page, not a new flow or mode); proposed objectives and questions (through `intent`'s discovery loop); the promise and the baselines to trace.
3. **judge `explain`**: 3–7 explanations, always including the official account and an error-or-accident account, each with what it expects (to `hypotheses` as proposals).
4. **judge `steps`**: steps that discriminate, quiet documentary ones first, each serving something, with route and access taken from the record, the profile or the library.
5. **judge `contrary`**: only when a member has just adopted a main line, or an explanation naming a person or body; an optional tray of steps that would show it wrong (decision D6; R2-X11).
6. **code checks**: every item serves an adopted objective, question or explanation; every place, publisher and rule comes from the record, a profile or the library, otherwise "where to find it: undetermined" (K1474); the constraints are honoured; an item that names a natural person is proposed only from record rows, never from the model's memory, and is labelled (R2-P5; P13).
7. **propose** (to `enquiry.propose`, `hypotheses.explanationPropose`, `intent`'s discovery loop, `holdings.holdingPropose`); **close**.

A project run's target is the **adopted step** it serves, or, for `enquire`, the project's objective: this closes D-572 for the engine (R2-H4; decision D21). The worker reads `workObjective`'s objective and gaps (intent R18 gains its consumer; R2-H8).

**One new flow, `READ_FLOW`, in the existing `extract` mode** (`READING §6.1`, amended by the reviews):

| step | what happens | review fixes applied |
|---|---|---|
| purpose | the run's subject is a capture; its objective is a **holding** in the run's project. With none, the run does not start, and the reading wizard asks one question: "What do you want from this document?" | R1-B3 (holdings is the record) |
| kind | the deterministic chain first (`detectFormat`, `identify`, `doctypeFor` with `also`); where a doctype is CERTAIN its reading is used. Otherwise the model proposes a kind from the library's profiles, or "unfamiliar", in words, labelled, with no confidence figure; for a compound capture, a part map of page ranges | R1-S8 (no recogniser per kind) |
| structure | deterministic first (PDF outline, DOCX headings, regulation tree, sheet names); otherwise a model structure map, each heading anchored to a byte-exact string on its page, stored as a proposed reading and not counted as extraction coverage | — |
| plan the read | the model chooses sections from the purpose and the profile's fields; the table caps it with the new bound `read_units` plus `mints`, `proposals`, `wallclock` | — |
| read | a sub-session receives bounded, addressed spans of the chosen sections through `op=unittext` (at most N KiB per call, counted against `read_units`, only for a capture with a holding in the run's project) and nothing else; it returns proposals, never text. Sections never read are listed | R1-S4: this loosens IS §14b.1's letter, so it is put to Bob in D1 with its bound |
| propose | field values (target owner act; value parsed by code from the quote), passages worth citing, entity mentions (C at best on name alone), references to other documents (resolved through `documentsByReference`, else offered as sought holdings), expected fields not found with the sections read, and a quote-bound bearing note (D23) | R1-M7: the bearing note is a named stage-6 deliverable |
| verify | in **layer 6**, at submit (`run-productions.proposalSubmit`, §3.4): quote found **through the existing normaliser** (both normalised and raw extents recorded), extent read by this run, field in the profile in force, no grade offered. An independent re-read of the quoted span runs only on fields the profile marks **critical**, or on a sample | R1-S6 (read check in layer 6), R1-S10, R1-M7 |
| tables | rows read from a PDF table (bid tabulation, change-order log) are proposed only with **a member's attestation per row**, until M-55 is re-measured on S1 tabulations and says GO | R1-S9 |
| record the looking | one observation-log entry per field sought: `PRESENT`, `LOOKED_ABSENT` in the sections read, or `partial` | — |
| member accepts | one queue item per reading; the review page shows each proposed fact beside its highlighted passage | — |

Fetched documents stay untrusted data behind relayed tools (`agent-runner` R10); the same fence covers procurement documents (R1-M6).

**Run-side amendments.**

| module (layer) | change |
|---|---|
| `run-rules` (6) | bound `read_units`; mode `enquire`; the deployment table of §5.2 with the second gate `eval_recorded` per mode (`COST §6.4`); refusal rows `PROPOSAL_QUOTE_NOT_FOUND`, `PROPOSAL_CITES_UNREAD`, `RUN_SUBJECT_IS_PRIVATE_PERSON`, `DOSSIER_BREADTH` (P13; §3.6); `estimateStep(kind, size, unitCosts)` returning a range, or "undetermined: not measured" until an `M-<n>` exists |
| `agent-harness` (6) | `ENQUIRE_FLOW`, `READ_FLOW`; `JUDGEMENT_OVERREACH` unchanged |
| `agent-worker` (6) | mode reaches: `enquire` gains `op=resumecontext` and the T33 reads; `extract` gains `op=readstructure`, `op=unittext`, `op=readingprofile`, `op=factpropose`. No other reach. The worker reads `workObjective` |
| `skills` (6) | disclosed layers `document_reading`, `investigation_planning`, `interview`; each may only quote canon (R21), so its canon text is written and ruled first |
| `run-productions` (6) | `proposalSubmit({run, kind, quote, extent, row})`: **one shared check** every run proposal passes before it reaches an owner's `propose` act (R3-X1); proposal forms `structure-map`, `part-map`, `bearing-note`; `acceptanceRates` (§3.5); per-profile measurement written to `calibration` |
| `ai-runs` (6) | `runCost({run})`: actual use after close, told once to the paying member (D12). **No allowance store yet** (§7; R3 C-c) |
| `calibration` (4) | the reader engine `reading:<profile>@<version>/<model>` registered with its probe set; until calibrated, an AI *transcription* step (model-read pixels, D22) has cap UNDETERMINED (DEC-75) |
| `extraction` (4) | plane ops `op=readstructure`, `op=unittext`; R43 amended per decision D4 |

### 3.4 Amendments to existing owners

Rule for every vocabulary amendment (`PROCUREMENT §6.2`): **add a kind only where a check, a read or a member must tell it apart; otherwise rely on the document's stage in a declared flow.**

| module (layer) | amendment | need served / finding closed | status of what it builds on |
|---|---|---|---|
| `pdf-reader` (1) | `outlineOf(pdf)`: the `/Outlines` tree, or `undetermined` with its cause | structure (READING G4) | built reader |
| `office-readers` (1) | DOCX paragraphs carry their declared outline level | structure | built |
| `format-registry` (1) and the doorbell (`acquisition`) | register **ZIP** (each member file becomes its own capture with the archive as parent in provenance) and **email** (`.eml`: body and attachments as captures); a handover may carry several payloads, each within the existing limit | records-request productions (R1-S11); staged before any reading of produced documents | ZIP, email absent (M3 §5 items 7–8) |
| `civil-time` (1) | `due` with basis `commitment` accepts **a duration from a trigger event**, traced | "one school year from construction start"; "540 days from NTP" (PROCUREMENT G8; R1-S3) | specified (T33), DRAFT (R1-M2) |
| `jurisdictions` (1) | a body's academic calendar as a dated profile fact; procurement vocabulary for recognisers; standard sources for procurement law; identifier schemes for contractor licences and wage registration; the first school-district and state school-construction entries, each sourced (R44) | S1 end to end (D10) | built (Oakland, Alameda) |
| `reading-pipeline` (4) | the reading's `container_extent` carries `outline` and `headings`, anchored to text units | structure | built (T33) |
| `standards` (5) | kind **`contract`**: a held contract or clause, captured text, in force from its signing event. A duty's existing source kind `standard` can then cite a clause, so `duties` needs no change | contract clauses (D9; R1-S2, R3-S3) | built |
| `events` (5) | dated-fact kind **`forecast`** (a document's projected date for an event on an entity); event kinds **`completion`** and **`notice_to_proceed`**; a link from a change-order event to the duty revision it caused | the slip series and its anchors (PROCUREMENT G4, G5, F2) | built (T33) |
| `events`, `lines`, `money` (5) | **`propose` → `adopt` / `decline`** on the pattern of `duties` R2 and `standards` R9–R10: the proposal is stored apart, labelled, carries run, extent and quote, is read by no check or total, and becomes a row only by a member's adopt. The layer-5 act checks only what it owns (row shape, extent present, no grade offered); the read check is done in layer 6 before (R1-S6). Identifier-backed machine writes stay as they are (K1443) | facts from documents (READING G5; PROCUREMENT G1; LOOP G3) | absent today (M4 §5 item 1) |
| `money` (5) | phase **`offered`** (a bid or proposal price), never summable with budget phases | bid count and spread (PROCUREMENT G6) | built |
| `entities` (5) | kind **`project`** (a capital project holding contracts) | OC4IDS's level (PROCUREMENT G7) | built |
| `progressions` (5) | data only: construction-execution stages in the example flow; templates for design-bid-build and a services contract with lawful-skip exception documents (S3) | the expected flow (PROCUREMENT F4) | specified (T33); code present for `out_of_order` (R1-M1) |
| `explore` (5) | preset `baselinesOf({project or contract, at})`: up to four baselines with source or "undetermined, because not held", the `forecast` series, change-order extensions, the completion duty's occurrence state as known each day. Never says "late" | promise vs reality (PROCUREMENT §6.6; D20) | presets built |
| `money-checks`, `calculations` (5) | **only the detectors P0 names** (R1-M8): change-order share of award against a **cited** limit; bidder count; bid spread and low bid against estimate. Each under the existing ≤20% false-alarm gate, shown "Noticed", never on an entity's page. Contract time elapsed against reported percent complete as a `calculations` recipe, not a flag | S1 O4 | detectors gated, unmeasured |
| `observation-log` (5) | a lead entry of kind **`note`**: a member's own working words, with the lead's existing sight (author and shares only, never administrators), never evidence, never published; it becomes a question, lead or hypothesis only by her act | member notes (HOME G7; LOOP G10), replacing HOME's `notes` module (decision D18) | leads built |
| `hypotheses` (6) | **explanation proposals**, stored apart in the owner: statement, kind, about, `expects` [observable, if true or false], source (run, or a library pattern). Only `hold` by a member makes one a `HYP-`; `MACHINE_CANNOT_HYPOTHESISE` unchanged. Held hypotheses gain `expects`. BOB first checks what the catalogued `theorypropose` act already writes and builds on it if it fits (R2-P1). No per-evidence rating matrix (§7; R2-P4) | competing explanations (PLANNING G4; LOOP G4); replaces PLANNING's `XPL-` in `enquiry` and LOOP L4's "beside `hypotheses`" (R3-S4) | `theorypropose` catalogued at rung *reversible* |
| `inquiry` (6) | R55: a dated wait may be **set for the project** and is then answered to its joined participants (D17); `registerWaitSource(source)` so `holdings.dependentSetAsides` appears in `waitsOn` as kind `set_aside` (K1618) | shared waits (R3-S7, replacing LOOP's `waitShare`); K1618 | built; K1618 specified (approved) |
| `capture-requests` (6) | **one** field, `holding: {purpose, serves}`, written at the door, never inferred (R3-X2: one field, not two) | why held, at the door | built |
| `extraction` (4) | R43 amended per decision D4 | grade rule (R1-B2) | built |
| `intent` (7) | one condition kind, **questions answered** (the listed inquiries concluded by the project, or at its bar); `workObjective` consumed | "what's going on" gains computed progress where it can | built |
| `actions` (9) | R66–R67 built (the group's acts feed "what we did"); registers `draftFromStep` with `enquiry`, `registerRequestState` with `holdings`, sources with `investigation` | records requests in the plan and the journal | R61–R67 specified |
| `monitoring` (10) | registers arrivals with `enquiry` and `investigation` | re-plan triggers | built |
| `queue`, `queue-producers` (11) | the kinds of §3.6; one aggregation rule | proposals reach members | built |
| `notice-producers` (11) | T33-83 (`inquiry-recheck-due`, `standing-answer`) built | waits fall due once | specified |
| `wizard-scripts` (11) | Civicsmith scripts: "Start an investigation", "A public project is late" (the interview), "Plan an investigation", "Read a ‹kind›" (walks `checklistOf`), "Follow a public contract" | the no-AI floor (P10) | server half built; library empty |

Already-specified requirements that become prerequisites: `reevaluation` R34 (an event's date moved), `actions` R66–R67, `action-plans` R38, T33-83 (`PROCUREMENT §6.2`; `LOOP §7`).

### 3.5 The one proposal path

Every machine contribution follows one path (P2; R1-B1, R3-X1, R3-S1, R3-S6):

1. A run in a deployed mode produces an item and calls `run-productions.proposalSubmit`. **Layer 6 checks** what only layer 6 knows: the quote is found through the normaliser at its extent; the run read that extent; the field is in the profile in force; no grade is offered; the `proposals` bound holds.
2. The item goes to **its owner's propose act**: `events` / `lines` / `money` / `duties` / `standards` (5); `hypotheses` (explanations), `holdings` (document links) (6); `intent` (objectives and questions, discovery loop), `enquiry` (steps, lines) (7); `entities.subjectPropose` via `investigation` (7). The owner stores it apart, labelled, with the run and its sources.
3. `queue-producers` raises **one FINDING per (run, kind, project)** with N instances, in a stated order (by the objective each serves, then by document position), never a model rank. A run that stops at its `proposals` bound says "N more not shown; run stopped at bound" (R3 L-g).
4. A member adopts (as proposed or edited), declines with a reason she writes (never prefilled), defers, or leaves it; singly or in bulk over homogeneous instances; nothing pre-ticked; an item that would become load-bearing is accepted one at a time (DEC-97's crucial-document rule). Any joined participant may act on a proposal from a run another member started (D3). The adopt act is **the owner's own member act**, carrying `adopted_from` and `accepted: as_proposed | edited | unaided` (DEC-77 (b), DEC-101).
5. **One instrument** measures it: `run-productions.acceptanceRates({kind, window})`, aggregate across members, never per member, review due at ≥95% over ≥30 (the `contradiction` R39 rule, which keeps its own instance). It reads layer-5 and layer-6 owners directly and layer-7 kinds through `registerProposalKind`. It is visible to the copy's administrators, and reaches development only by an administrator's export (R3 L-b). It also feeds the reading-profile measurement.

### 3.6 Queue kinds (the one list)

| kind | class | raised by | maps from |
|---|---|---|---|
| `facts-proposed` | Noticed | `queue-producers` over owners' proposals from a reading | READING `reading-proposals`; PROCUREMENT "one FINDING per document"; LOOP `facts-proposed` |
| `explanations-proposed` | Noticed | over `hypotheses` proposals | LOOP |
| `plan-proposals` | Noticed | over `enquiry`, `intent` discovery and `holdings` link proposals | PLANNING; LOOP `plan-steps-proposed` |
| `plan-review-due` | Noticed, told once, ageing | `enquiry.replanDue` | PLANNING |
| existing kinds unchanged | — | `objective-gap`, contradiction kinds, `out-of-inquiry-lead`, `capture-completed-unattended`, T33-83 kinds | — |

LOOP's `next-acts-proposed` is not added: next acts are `action-plans` options, which have their own tray. No kind is added for allowance exhaustion, since no allowance is built (§7).

**Privacy fences** on the run side (P13; R3 C-a, R2-P5): `RUN_SUBJECT_IS_PRIVATE_PERSON` refuses a run whose subject or objective is a natural person who is **not** a public official or employee acting in that role; a run about an official is scoped to official acts (DR6 as amended). `DOSSIER_BREADTH` is defined mechanically: the number of capture requests in one run whose `holding.serves` or subject names one person entity, capped by a bound BOB sets; over the cap is refused with its reason. A proposal that names a natural person comes only from record rows, is labelled, never publishes (DEC-25 extended), and its acceptance rate is measured like K1491's.

### 3.7 Reused unchanged

The engine uses these as they are: `project`, `membership` and sight (MEM §7.9); `project-stage` (DEC-79); `inquiry` (questions, division, falsifier, rechecks); `basis-versions`; `strength`; `contradiction` (K1–K4 shown; K5, K6 withheld); `retrieval.frontier` and `contentAxis`; `observation-log` levels and authorities; `capture` (held captures, release, set-aside R79), `acquisition`, `provenance.testify`; `docprofile.doctypeFor`, `site-profiles`, the existing doctypes, `budget-doctypes`, `court-doctypes`, `legistar-reader`; `content` mint labels, member marking, transcription and attestation; `extraction.extractPropose`, `unitsOf`, `documentsByReference`; `entities.resolve`; `duties` (propose/adopt, occurrences, transitions); `standards` propose/adopt; `money` facts, sets and `committedAgainstPaid`; `lines` roles; `events.timeline`; `explore.timelineOver`; `progressions` findings and `threadInstance`; `calculations`; `answers` contract and `checkAnswer`; `ai-runs` bounds, lease, usage and ceilings; `run-rules` refusal table; `capture-requests` (wake on completion); `link-sweep`; `monitoring` named requests and R33; `actions` records requests; `action-plans` options tray; `queue` and its dispositions; `affordances` rungs (`workobjective` reasoned, with budget and scope beside it); `wizard-scripts` engine and `checkScript`.

### 3.8 The diagram, described

Read top to bottom; arrows point from user to used. Layer numbers in brackets.

```
 MEMBER  ── interview script, plan, review page, project view (design stream screens) ──┐
                                                                                        │ member acts
 [11] queue · queue-producers (4 kinds, one FINDING per run/kind/project) · wizard-scripts · notice-producers
 [10] monitoring ──registers arrivals──┐        [9] actions ──registers draftFromStep, requestState, journal source──┐
                                       ▼                                                                             ▼
 [7]  investigation  (subject set; view · two-lane timeline · journal · resumeContext · projectAnswer)
          │ reads
          ▼
 [7]  enquiry  (steps · lines · constraints; replanDue · stopRead · startSteps)  ── intent (objectives, discovery loop, questions-answered)
          │ registerServes / seek / onHeld
          ▼
 [6]  holdings (why held / sought; the one whyHeld)   hypotheses (+ explanation proposals, expects)   inquiry (+ project waits, set-aside waits)
      run-productions (proposalSubmit · acceptanceRates · profile measurement)   capture-requests (+ holding field)
      ai-runs · run-rules · agent-harness (ENQUIRE_FLOW, READ_FLOW) · agent-worker (mode reaches) · skills (3 layers) · answers
          │ propose → adopt
          ▼
 [5]  events (+forecast, completion, NTP, propose/adopt) · lines (+propose/adopt) · money (+offered, propose/adopt)
      standards (+contract) · entities (+project) · duties · progressions (+stages, templates) · explore (+baselinesOf)
      money-checks / calculations (P0's detectors only) · observation-log (+note)
 [4]  investigation-library (reading profiles · investigation patterns) · calibration (+reader engine)
      extraction (+readstructure, unittext) · reading-pipeline (+outline, headings) · content · docprofile
 [3]  capture · acquisition (doorbell, several payloads) · provenance
 [1]  pdf-reader (+outline) · office-readers (+headings) · format-registry (+ZIP, email) · civil-time (+duration from trigger) · jurisdictions (+district, state bodies, calendar, vocabulary)
```

**Layer check** (P8; R3-X4, R2-H1, R2-P8): every arrow above points down or sideways to an earlier module in the same layer; the only upward links are registration seams (`actions`, `monitoring`, `queue` counts into `investigation`; `actions` into `holdings` and `enquiry`; `enquiry` into `holdings.registerServes` and `run-productions.registerProposalKind`). The order inside layer 7 is `intent` → `enquiry` → `investigation` (R2-X5). Inside layer 6, `holdings` follows `capture-requests` and `inquiry`.

## 4 · How the six capabilities work together over an investigation's life

The six capabilities are not six components. They are six concerns spread over the modules of §3 (*(inference)*; the mapping below is the synthesis's). **LOOP** is the member's side of every act; **PLANNING** is `enquiry` and the `enquire` mode; **READING** is `READ_FLOW` and the library's profiles; **HOME** is `holdings` and `investigation`; **PROCUREMENT** is vocabulary, library entries and flows, with no module of its own; **COST** is bounds, estimates, the eval gate and the fences.

| phase | what happens | LOOP (the member) | PLANNING | READING | HOME | PROCUREMENT | COST |
|---|---|---|---|---|---|---|---|
| **Intake** | Words become a project with an objective, questions, a subject set and first observations | the interview script (≤6 questions on a page, each with why, all skippable; a skipped one reads "Undetermined"); she creates the project; "not now" is a non-event (K1364) | with AI, `enquire` `frame` proposes the questions and the objectives; without AI, the script carries them | — | answers land as authored objects: objective (`intent`), questions (`inquiry`), testimony (`testify`), leads and notes (`observation-log`), subject set | the "A public project is late" script and the public-works pattern supply the questions and the baselines to trace | an `enquire` run is fetch-free; its estimate is shown beside the act |
| **Plan** | Objectives become explanations and steps, each serving something | adopt, edit, decline with a reason, defer; in bulk or one by one; the tipping-point display shows the other explanations once (D6) | `enquire` `explain` and `steps`; `enquiry` holds steps, lines and constraints | the plan names the kind and the fields a step needs | a step seeking a document becomes a **sought holding** | the pattern's expected kinds (disclosure checklist) and explanation families inform proposals; reactive items become drafted records requests | proportionality: quiet documentary steps first; each step's route has a cost tier |
| **Gather** | Steps run: captures, sweeps, records requests | she presses start (`startSteps`); she sends every records request herself | `startSteps` drafts and files; later (D7 c) it opens runs per step | — | each capture carries its holding at the door; `actions` makes a request *requested*; the request's clock is a wait | the profile names where each kind is published and which records law applies | runs start only at her act; waiting costs nothing |
| **Read** | A held document is read for its purpose | reviews each proposed fact beside its passage; adopts, corrects, declines | the step and its `discriminates` are the purpose | `READ_FLOW`: kind, structure, targeted read, propose, verify | the holding is the input; "read by the record" is a derived state | reading profiles for contract, change order, award item, CM report, NTP, bid tabulation | structure first; `read_units`; critical-field re-reads only |
| **Hold** | Everything persists, as record | "Waiting on" lines; shared project waits; K1618 set-aside waits | the plan persists in `enquiry`; runs do not | coverage recorded per field in the observation log | the view, the two lanes, the journal; `resumeContext` for the next run | `baselinesOf`, `forecast` series, declared flows | spend shown to the payer in the runs section |
| **Explain** | Competing explanations are tested, never chosen by the machine | she holds explanations as hypotheses; cause is member-authored (DEC-84 (10)) | explanation proposals with `expects`; steps that discriminate; the optional `contrary` tray | adopted facts are what explanations are tested against; READING never proposes causes | explanations section beside held evidence | explanation families with "would show in" and "contradicted by" kinds; gated detectors as Noticed leads | the explanation-coverage measure in the eval gate |
| **Answer** | "What's going on?" | reads the project answer; may take its text as a labelled draft into a review copy (DEC-31) | stated unknowns become steps | — | `projectAnswer`: criteria, condition, cause, effect, unknowns, the other side, next acts | baselines side by side; never one "late" verdict (D20) | answers checked by `checkAnswer`; precision measured in the harness |
| **Iterate** | Arrivals re-plan; the plan stops or watches | told once ("plan review due"); one press starts a re-plan run; chooses watch or close | `replanDue`, a re-plan as a difference; `stopRead` | a revised document is re-read for its holding's purpose, changed sections only (stage 8) | arrivals reach the journal and the waits; dormancy is a display | `reevaluation` R34 propagates a moved date | re-planning is one proposal per arrival; nothing self-starts |

**Several members** (R2 §4 risk 1). Any joined participant may act on any proposal; the record shows who asked and who accepted (D3). Conflicts are handled by attributed acts and never by votes: a set-aside another member's question depends on becomes a wait on that question, restorable by either member with a reason (K1618, generalised in D17); one CURRENT version per question per project; fork as the last remedy (MEM §7.12). A step one member declined that another's question needs is visible in the plan with its reason, and either may re-propose it with a new reason.

## 5 · Staging

### 5.1 Stages, smallest useful step first

Each stage is useful on its own, works with no AI where it can (P10), and has an acceptance test in a member's terms. What goes into a tranche and when it opens are BOB's; the order and the dependencies below are the recommendation.

| stage | delivers | depends on | acceptance test (a member's terms) |
|---|---|---|---|
| **1 · One view, and why we hold each document** (no AI) | `investigation` (view, subject set, world lane of the timeline); `holdings` (`hold`, `seek`, `whyHeld`, the `capture-requests` field, set-aside read from `capture` R79, the `requestState` seam); scripts "Start an investigation" and "A public project is late" | built modules only | "With no AI key, I typed my paragraph about Grandview, answered the questions I could, and ended with a project: our objective, my question, what I saw on site, and a list of documents we need, each saying why. Opening it a week later, I saw on one page what we hold and why, what is sought, and a dated line from the award vote to today with each date's source. A date the documents give only as 'spring 2023' shows as spring 2023." |
| **2 · A plan by hand, and what we did** (no AI) | `enquiry` (steps, lines, constraints, member acts, `planOf`, `startSteps` drafting only); `journalOf`, `changesSince`; `actions` R66–R67; project waits (`inquiry` R55) and T33-83 items; K1618 set-aside waits; notes as leads of kind `note`; script "Plan an investigation" | stage 1 | "I wrote five steps, linked the award item to 'was the award competitive?', and three weeks later saw which steps were done, which waited on the district and until when, and which were blocked and why. A parent who joined in week six read 'What we did' and could tell what was requested, refused and decided, and why. When she set aside the bid tabulation my question needed, I saw it as a wait on my question with her reason, and restored it with mine. Nobody was notified." |
| **3 · Procurement words, and reading by hand** (no AI) | the vocabulary amendments of §3.4 (`contract` standard, `forecast`, `completion`, `notice_to_proceed`, `offered`, `project`, duration from a trigger, the change-order link); flow templates; the school-district and state-body profile entries; `investigation-library` with hand-written **draft** profiles for the S1 kinds and the public-works pattern; scripts "Read a ‹kind›" and "Follow a public contract"; PDF outline and DOCX headings with a contents pane; ZIP and email intake; `baselinesOf`; `reevaluation` R34 | stage 1; D9, D10 | "I opened the Grandview contract, chose 'Read this for: the completion date', jumped to 'Time of Completion' from the contents, followed the checklist and pointed at the contract-time passage. The record now holds the clause as a contract term and a duty whose due date is computed from the notice to proceed, with its derivation shown. Every checklist field is answered, marked 'not found in the pages I read', or left unread, and the record says which. The district's ZIP of scans arrived as 31 documents, each answering the request that sought it." (R1-S3: this test now rests on the `contract` kind and the duration from a trigger, which this stage builds.) |
| **4 · Measure first, and the fences** | VF-4; M-Q6 and M-Q9 (usage per check run, sub-session, ask, by account kind); the test harness with T-small, T-founding (S2) and T-rebuild (a real district's school rebuild, frozen) and member-authored gold; `eval_recorded`; `runCost` told after a run; `estimateStep` before ("undetermined" until measured); `RUN_SUBJECT_IS_PRIVATE_PERSON`, `DOSSIER_BREADTH`, injection probes | `check` live; D12, D13, D14 | "After my first check run I was told once what it used of my account and where it stopped. Before the next, I saw roughly what it would use, or that nobody knows yet. When I asked the assistant to dig into a private person, it refused and said why; a document telling it to ignore its rules changed nothing." |
| **5 · The assistant proposes the plan** | mode `enquire` (frame with the AI interview, explain, steps, contrary); explanation proposals with `expects` in `hypotheses`; `intent` questions-answered; `resumeContext`; the proposal path of §3.5 for plan kinds; queue kinds; `acceptanceRates`; skills layers from ruled canon text | stage 2, stage 4's bars for `enquire`; D3, D5 (purposes), D6, D11 | "From my paragraph and four answers, the assistant proposed objectives, the promise to trace, about ten first steps each saying why and where, and six possible reasons Grandview is late, the district's own among them, each with what would show it. Nothing was fetched until I pressed start. When I picked 'design errors' as the main line I was shown, once, the other open explanations and offered the steps that would show mine wrong." |
| **6 · The assistant reads one document for one purpose** | `READ_FLOW`; `op=readstructure`, `op=unittext`, `op=factpropose`; `proposalSubmit`; propose → adopt in `events`, `lines`, `money`; `holdingPropose`; `facts-proposed`; profile measurement and the reader engine in `calibration`; the bearing note (if D23) | stages 3 and 4 (T-rebuild atomic-fact and citation bars); D1, D4, D7 (a), D11 | "I asked the assistant to read the contract for the completion date. It showed proposals, each beside its highlighted passage, every quote found word for word on the page shown; I adopted three, corrected one and dismissed one. It said which articles it did not read. On the test district's documents, the share of proposals adopted unchanged met the published bar before the reading was offered to me." |
| **7 · Re-plan, stop, answer; earned profiles** | `replanDue` and `plan-review-due`; re-plan as a difference; `stopRead` (watch or close); `projectAnswer`; machine-drafted profiles from member-verified readings, approval, the Civicsmith library seeded with the measured S1 profiles | stages 5–6; D8, D16, D20 | "When the change-order log arrived I was told once that the plan may need review; one press gave me proposed changes. When nothing left could change the picture, I was offered to watch the board agendas and the state tracker until the school opens. 'What's going on?' gave me the promise and its source, the contract time, the forecast series, which explanations have support, what is unknown and which record would settle it, and the district's own explanation, quoted. After three contracts, the assistant offered a reading guide for construction contracts drafted from what I kept, which our owner approved." |
| **8 · Steps that run, and hard documents** | `investigate` objective-driven, deployed; `startSteps` opens runs per adopted step (D7 c); part maps for board packets; table rows with per-row attestation; forecast series across reports; re-reading a revised document for its purpose; split-map-reduce over a member-declared set; P0's detectors through the false-alarm gate; model-read image pages (if D22) | stages 4–7; investigate's bars; D7 (c), D22 | "I accepted the plan's first three steps with their estimate; the assistant found two documents online and drafted a records request for the third, which I sent; nothing outside those steps started. Asked for every change order's days and amount, it gave one table of proposals, each row tied to its page, with the four the OCR could not read listed by page; I attested the rows. A Noticed item told me change orders passed the share the statute names, with the statute cited." |

**Later, only on a measured need** (not staged; §7): a per-investigation allowance; deterministic readers graduated from stable profiles; contractor-register readers; an OCDS reader.

### 5.2 Deployment of run modes (one table, R3-X3)

Built today: `DEPLOYMENT_SEQUENCE` = `check, investigate, extract, plan`, with `ask` deployed apart and a `deploys_apart.plan` entry (M2 §1.1, §3.2 via `COST §3.6`, R3 C-e; BOB confirms in code which governs `plan`). Proposed (decision D11):

| order | mode or flow | in the chain or apart | gate: live verification **and** eval bar (`eval_recorded`) | reason for its place |
|---|---|---|---|---|
| 1 | `check` | chain, first | VF-4; T-small regression | unchanged |
| 2 | `enquire` (incl. the AI interview as its `frame` judgement) | **apart**, once `check` is verified | constraint survival, explanation coverage, expected-document coverage on T-small and T-rebuild | fetch-free and proposal-only: it spends about a re-plan's cost and starts nothing. COST put "investigation planning last" because planning multiplies the cost of everything below it (`COST §6.7`); in this design that multiplier is `startSteps` opening runs, which is gated separately (D7 c) and comes last. So the cheap, early-error-catching planner can come early and the multiplier late (R3-X3's required stated reason; R2-P2) |
| 3 | `extract` with `READ_FLOW` | **apart**, once `check` is verified | atomic-fact precision and citation precision on T-rebuild; reader engine calibrated | one held document, one purpose, no fetch fan-out; Bob's case needs reading before broad search. COST's concern (reading is most exposed to invented facts) is carried by the eval gate, not by chain position (R1-M4, READING F5) |
| 4 | `investigate`, objective-driven | chain, after `check` | T-small and T-founding bars; M-Q6 cost measured | the first mode that fetches with fan-out |
| 5 | `ask` | apart (unchanged) | Q1; the 150-question bar (unchanged) | unchanged |
| 6 | `plan` (action plans) | apart | its own bar | unchanged |
| — | `startSteps` opening runs | not a mode: a member act | after `investigate` is deployed, and only if D7 (c) is yes | the cost multiplier comes last |

The chain thus becomes `check → investigate`; `enquire`, `extract`, `ask` and `plan` deploy apart, each needing `check` verified and its own eval bar (`COST §6.4`'s two-condition gate applies to every mode). One harness, COST's, supplies every bar: READING's S1 gold set becomes T-rebuild, and PLANNING's 20–50 investigations become the T-tiers (R3-S11).

## 6 · Decisions for Bob, and the reviews' findings

### 6.1 Decisions for Bob

The six studies put 44 questions to Bob (R3 §6). Merged where they were the same question, and with the reviews' additions, they are 25. Only policy, doctrine, requirements, architecture and UX are here (P17); the BOB-level choices are listed after the table. "Merges" names the study decisions each one replaces.

| # | kind | decision | merges | recommendation |
|---|---|---|---|---|
| **D1** | architecture | Four new modules: `investigation-library` (4), `holdings` (6), `enquiry` (7), `investigation` (7); one new run mode, `enquire`; `READ_FLOW` in `extract`. Within it: a run may read **bounded, addressed text spans of one held document** (`op=unittext`, at most N KiB per call, counted against `read_units`, only for a capture with a holding in the run's project), returning proposals and never text. This loosens the letter of IS §14b.1 ("a sub-session that returns documents … has defeated the architecture") while keeping its intent | READING B6; PLANNING 1; HOME (Option B); R1-S4 | **Approve.** No module duplicates an owner; `fact-proposals` and `notes` are not built (§6.2); everything else is amendments |
| **D2** | architecture | An investigation is exactly one project; no separate investigation object | HOME D-H1 | **Yes.** It follows K1627 and keeps one bar and one set of sight rules |
| **D3** | doctrine | Extend DEC-77's ACCEPTING A PROPOSAL from contradictions to **every investigation proposal**: facts read from documents, plan steps and lines, explanations, document links, subject additions. The record keeps *as proposed / edited / unaided*; acceptance rates per kind, aggregate only, review at ≥95% over ≥30. **One line**: where accepting would make the member vouch for a legal or authored claim (a governing law, a risk tier, a conclusion, a reason, a completeness statement), she re-authors, as UI-102 does. Adopting a contract clause's **quote** as a standard's captured text is a provenance act, not vouching, so it is a one-act adoption. Any joined participant may act on a proposal from a run another member started | READING B1; PLANNING 2; LOOP 2, 4; PROCUREMENT §6.3; R3-S1, R3-S2 | **Yes**, as stated |
| **D4** | doctrine (evidence) | **The grade of a fact an AI located.** The quote is the publisher's text, verified by code, so its cap is the text unit's cap; the value is parsed by code; the interpretation ("this passage is *the* contract time") is the member's, on the meaning axis, made by her adoption, which the record keeps as *as proposed* or *edited* (D3). This amends `extraction` R43 (an `ai(fn, version)` step on every proposed reading, capped at B) and the canon EXTRACT line ("graded by what it names and never A") for verified-quote proposals. An AI *transcription* (model-read pixels, D22) stays a weakening step with cap UNDETERMINED until calibrated (DEC-75) | READING §6.3 vs PROCUREMENT §6.5; R1-B2 | **Yes, the split rule.** Both READING and PROCUREMENT then cite this one rule; PROCUREMENT's "grade B" example becomes the text's own cap |
| **D5** | doctrine | **Who may state why a document is held.** A purpose stated **at the door**, by a run whose capture request a member authorised, is a machine-attributed fact about provenance ("sought by the assistant at X's request, to …"; DEC-53). A purpose **linking an existing document** to a question or step is a proposal a member adopts | R2-X2, R2-H2 | **Yes.** It records how a document came, not a judgement; the rate at which members later revise machine-stated purposes is measured (R2 §4 risk 3) |
| **D6** | doctrine | **Machine-proposed explanations.** The machine may propose explanations, stored apart in `hypotheses` with what each expects; only a member holds one (K1467, K1473 unchanged). At the two tipping points (adopting a main line; holding an explanation that names a person or body) the panel shows the other open explanations once, at the act, never as "are you sure?", and offers an optional tray of steps that would show the chosen line wrong | PLANNING 3, 8; LOOP 3, 9; R2-X11 | **Yes** |
| **D7** | doctrine | **What authorises targeted work** (K1468, K1481), one ruling in three clauses: (a) holding a document for a stated purpose authorises reading **that document for that purpose**, and nothing else; (b) adopting a plan step that names a document is such a holding; (c) one member act may start several adopted steps, each a bounded run inside her own account, never fanning out beyond them; anything new needs a new acceptance | READING B3; PLANNING 4; COST D3; R3-S10 | **Yes to (a) and (b)** now; **(c) yes, shipped last** (stage 8), after `investigate` is deployed and its cost measured. With (c) "no", the engine still works one act per run |
| **D8** | policy | **The library.** Investigation knowledge (reading profiles, investigation patterns) is held as versioned, sourced, published entries in two libraries: Civicsmith's, approved by Bob **or a delegate Bob names** (DEC-121's words), shipped to every group; and each group's, approved by a project owner. A machine drafts and never approves. A reading profile is approved only after its measured adoption record meets the bar BOB sets. Distinct from Action rule 8's "no catalogue" for outward action | READING B2; PROCUREMENT 2; PLANNING 5; R1-M3, R3-S9 | **Yes**, public works first |
| **D9** | requirements | **A contract is a standard**: add kind `contract`, so a contractor's obligations are measured against the contract's clauses and a district's public promise stays a separate `commitment` | PROCUREMENT 1; R1-S2 | **Yes** (Capability Ladders N11 already counts contracts as standards) |
| **D10** | requirements | **Jurisdictions first**: extend the profile to a school district and the state school-construction bodies (design review, state funding, contractor licensing, wage registration), with a second, non-California state in tests | PROCUREMENT 3 | **Yes**, S1 as the first acceptance case |
| **D11** | architecture | **Deployment order** as §5.2: chain `check → investigate`; `enquire`, `extract`, `ask`, `plan` apart; every mode needs a live verification **and** a test-investigation bar | COST D4; READING F5; PLANNING P2; R3-X3, R1-M4, R2-P2 | **Approve** |
| **D12** | policy, UX | **Cost shown to members** (reverses F11, "recorded and never shown"): an estimate before the act (a range, or "undetermined: not measured") and the actual after, to the paying member only; other members' runs appear as a count. Keep K1502 (each member's own account); retire the "group key" wording for the assistant in DEC-120 and the journeys. For a subscription member, show runs and tokens, and "share of your plan: not reported by the provider", until a source for that figure exists | COST D1, D2, D7; R3 C-b | **Yes** |
| **D13** | doctrine | **No investigation of a private person.** A run's subject or objective is never a natural person who is not a public official or employee acting in that role; a run about an official is scoped to official acts (DR6); a per-run, per-person breadth cap on capture requests; a proposal naming a natural person comes only from record rows and never publishes | COST D6; R3 C-a; R2-P5 | **Yes**, as narrowed (the unnarrowed fence would block S4 and S8) |
| **D14** | requirements | **Test investigations**: gold answers authored by members (Bob or a group) for the founding case and one real school rebuild; test-copy transcripts kept for grading only; the test copy's gold and transcripts fall under DR6 and are never published | COST D5; R3 C-h | **Yes** |
| **D15** | policy | **Working material is never published**: the plan, purposes, journal, notes and the project answer are project-scoped thinking (DEC-25 extended); an interim answer leaves the group only as a review copy carrying its own gaps (DEC-31); any later change applies prospectively | PLANNING 6; HOME D-H3; LOOP 8 | **Yes** |
| **D16** | requirements | **Watch, close, and dormancy.** When nothing left could change the picture, the machine proposes *watch* or *close*; the member decides; watch reopens the plan on arrival. Dormancy is a display derived from waits and the watch choice, not a new project stage | PLANNING 7; HOME D-H6; R2-X7 | **Yes** |
| **D17** | requirements | **Shared waits and dependent set-asides.** A dated wait set for the project is answered to all joined participants (personal waits stay personal). K1618 generalised: any project-scoped set-aside or dismissal that another member's question depends on becomes a wait on that question, with its reason, restorable by either member; no veto, quorum or notification | HOME D-H5; LOOP 5, 6; R3-S7 | **Yes** (HOME's project-scoped wait, not LOOP's share act: one act fewer) |
| **D18** | requirements | **Member notes**: a member's working words, private or shared to the project, never evidence, never published, member-only; held as a lead of kind `note`. Rule at the same time on the design stream's open question about an anonymous person's characterisations of named individuals: the lead rule applies | HOME D-H4; LOOP G10 | **Allow**, as a lead kind (no new module) |
| **D19** | requirements, UX | **The intake interview** may show up to about six questions on one page, each with its reason, all skippable, a skipped one read as "Undetermined". The ask keeps its one-question rule | LOOP 1 | **Yes** |
| **D20** | UX, doctrine | **The answer's vocabulary.** Every schedule answer shows the baselines side by side (promise, approved schedule, contract time, baseline schedule), each with its source or "not found", and never one "late" verdict. No ratings ("kept / broken"), no likelihood words in Civicsmith's voice; the promise reads by its occurrence state ("overdue: a question"); each explanation by its record state; "cause not established" wherever no member has authored a cause | PROCUREMENT 4; LOOP 7 | **Yes** |
| **D21** | architecture | **D-572**: a project run over several questions targets the **adopted step** it serves; an `enquire` run targets the project's objective | R2-H4; HOME §9; PLANNING G5 | **Yes** |
| **D22** | policy (spending, evidence) | **Model-read image pages**: may a reading transcribe image-only pages through the member's own model account, as a labelled derivation with cap UNDETERMINED until calibrated, liftable to B by a member's attestation? (DEC-74 left external OCR unfunded) | READING B4 | **Yes, as proposals only**, on her own account; in-account OCR stays the default |
| **D23** | UX, doctrine | **The bearing note**: a short, quote-bound note beside the source (what this document says about the question, and what it does not); every sentence bound to a quote and withheld if unbound; never shown in place of the source at acceptance, never stored as content, never cited | READING B5 | **Yes** |
| **D24** | UX | **Member-facing names**, as one vocabulary through the design stream: an "Investigation" view on the project page; "Why we hold it"; "Waiting on"; "What happened" and "What we did"; "Read this for…"; "reading guide" for a profile; "possible explanation"; a word for the plan of enquiry other than "plan" (the action plan's). Never "case file", "docket" or "matters" | HOME D-H2; PLANNING 10; READING B7 | **Approve the set, drawn by the design stream** (BOB does not edit the UX folder) |
| **D25** | policy | A member may claim a step for herself ("I'm on it"); nobody assigns steps to others; no hours or costs | PLANNING 9 | **Yes** |

**Not put to Bob** (BOB-level, to be recorded once in `build/rulings.md` when the work opens): the bound `read_units` and its default; the KiB per `op=unittext` call; `DOSSIER_BREADTH`'s value; each eval bar and the profile-approval bar; the model per mode (M-Q9); refusal codes and op shapes; where the harness lives; whether a structure map is stored or recomputed; the interview script's exact questions. PROCUREMENT's decision 5 (red flags on organisations) is dropped as a decision: money-checks R9–R10 and K1491 already rule it, and BOB records that reading (R1-M5).

### 6.2 The reviews' blocking findings, and how the architecture resolves each

Every blocking finding is resolved **in the design of §3**, not only noted.

| finding | the conflict | resolution in the architecture | where |
|---|---|---|---|
| **R1-B1** (= R3-X1) | the proposal path for events, lines and money facts was designed three ways: a new `fact-proposals` module (READING) against propose acts inside each owner (PROCUREMENT, LOOP) | **Owner-held, one pattern.** `events`, `lines`, `money` gain `propose → adopt / decline` like `duties` and `standards`. READING's checks become `run-productions.proposalSubmit`, the one layer-6 check every run proposal passes; its grouping becomes the queue's one aggregation rule; its `acceptanceRates` becomes the one instrument in `run-productions`. **`fact-proposals` is not built.** Adoption is the owner's own member act | §3.3, §3.4, §3.5 |
| **R1-B2** | the grade of an AI-located fact stated three ways; two of them break DEC-75 or R43 | one rule, put to Bob as **D4** (the split: quote's cap from the text, value by code, interpretation by the member's adoption, recorded per DEC-77 (b)); AI transcription stays UNDETERMINED until calibrated | §2 P7; §3.3; D4 |
| **R1-B3** (= R2-X1 = R3-X2) | "why a document is held" had three or four homes: `holdings`, `enquiry.whyHeld`, stage placement, `capture-requests` fields | **`holdings` is the single record**, with the only `whyHeld`. A plan step is a `serves` id registered by `enquiry`; adopting a step that seeks a document performs `holdings.seek`; `placeAtStage` threads the flow **and** writes the holding in one act; READING's held-for record is a holding; `capture-requests` gains one field, `holding`. PROCUREMENT's misreading of the `purpose` enum is dropped (R1-S5) | §3.2 `holdings`, `enquiry`; §3.4 |
| **R2-X2** | HOME let a run write a purpose; PLANNING said the machine may only propose a link | one rule, put to Bob as **D5**: at the door, machine-attributed provenance through the capture-request field (no new write op, R2-H2); linking an existing document, a proposal (`holdingPropose`) | §3.2 `holdings`; D5 |
| **R3-X3** | five deployment orders; `enquire` and the AI interview placed nowhere | one table covering every mode, with a stated reason for each place, the AI interview placed as `enquire`'s `frame` judgement, and COST's two-condition gate on every mode; put to Bob as **D11** | §5.2; D11 |
| **R3-X4** | the layer order broken in three places: COST's meter in `ai-runs` (6) read layer 7; LOOP's L9 in `intent` (7) read `queue` (11); LOOP's `projectAnswer` in `answers` (6) worked per objective (7) | the meter is a **runs section of `investigation`** (7) reading `ai-runs.runCost` (6); L9 is `investigationOf` with queue counts through `registerSource`; `projectAnswer` is a service of `investigation` (7) that calls `answers.checkAnswer` (6). The same rule fixed R2-H1 (`actions` fills `holdings.registerRequestState`), R2-P8 (`actions` registers `draftFromStep` with `enquiry`) and R1-S6 (the read check in layer 6) | §3.2 `investigation`; §3.8 layer check |

### 6.3 The reviews' other findings, and their resolution

| finding | resolution | where |
|---|---|---|
| R1-S1, R3-S9 one library | `investigation-library`: reading profiles carry PROCUREMENT's extra fields; patterns carry PLANNING's starter library; flows stay in `progressions`, thresholds in `money-checks` | §3.2 |
| R1-S2, R3-S3 contract clause | `standards` kind `contract`; READING's `policy`/`commitment` example corrected | §3.4; D9 |
| R1-S3 READING step 1 depends on missing kinds | stage 3 builds the `contract` kind and the duration from a trigger with the hand reading | §5.1 |
| R1-S4 `op=unittext` | named in D1 with its bound | D1 |
| R1-S5 `capture-requests.purpose` misread | dropped; the reason lives in `holdings` | §3.2 |
| R1-S6 read check upward | in `run-productions` (6); layer-5 acts check only what they own | §3.4, §3.5 |
| R1-S7 PROCUREMENT assumed rulings | PROCUREMENT now cites D3 and D7 | §6.1 |
| R1-S8 kind by recogniser | deterministic chain, then model against the library, labelled, no confidence | §3.3 |
| R1-S9 PDF tables | per-row attestation until M-55 re-measured on S1 tabulations | §3.3; stage 8 |
| R1-S10 byte-exact quotes | verified through the existing normaliser, both extents recorded | §3.3 |
| R1-S11 records productions | ZIP and email in `format-registry`, several payloads per handover; stage 3, before any reading of produced documents | §3.4; §5.1 |
| R1-M1, R1-M2 status words | `progressions` R37–R42 specified (T33), code present for `out_of_order`; `civil-time` and `calc-grammar` specified (T33), DRAFT | §3.4 |
| R1-M3 approver wording | DEC-121's words, "or a delegate Bob names" | D8 |
| R1-M4 deployment as one decision | D11 | §5.2 |
| R1-M5 PROCUREMENT D5 | dropped as a decision | §6.1 |
| R1-M6 injection in procurement documents | one fence for every fetched document | §3.3 |
| R1-M7 over-building in READING | critical-field or sampled re-reads; bearing note a named deliverable; no network library | §3.3; §7 |
| R1-M8 over-building in PROCUREMENT | only P0's detectors; OCDS reader not staged | §3.4; §7 |
| R2-X3 sought list | steps seeking documents create sought holdings; others stay steps | §3.2 |
| R2-X4 two opening-context reads | one `resumeContext`, plus the T33 reads in `enquire`'s reach | §3.2, §3.3 |
| R2-X5 journal sources and order | `enquiry` registered; layer-7 order `intent` → `enquiry` → `investigation` | §3.2, §3.8 |
| R2-X6 queue and notification | the four kinds of §3.6; the view adds none | §3.6 |
| R2-X7 dormancy | merged into D16; the view reads `stopRead`'s watch state | §3.2; D16 |
| R2-X8, R3-S12 interview owner | LOOP's; "which district" routes to `subjectPropose` | §3.2; §4 |
| R2-X9 step waits | a step in state *waiting* is a wait source | §3.2 |
| R2-X10 constraints and notes | Constraint kept in `enquiry` with the lead's sight and DR6 rules | §3.2 |
| R2-X11, R3-S4, R2-P1 explanations | proposals in `hypotheses` with `expects`; `theorypropose` checked first; the contrarian tray in `enquire` | §3.3, §3.4; D6 |
| R2-P2 `enquire` position | apart, after `check`, with its bar and stated reason | §5.2 |
| R2-P3 `servesOf` | kept apart, reason stated | §3.2 |
| R2-P4 ACH ratings | not built; `expects` and "what nobody has looked for" kept; DEC-77's matrix form for presentation | §3.4; §7 |
| R2-P5 people in proposals | record rows only, labelled, never published, acceptance measured | §3.6; D13 |
| R2-P6 total cost | stated for the whole | §3.2 |
| R2-P7, R2-P8 registration direction | earlier layers subscribed; later register; `actions` registers `draftFromStep` | §3.2 |
| R2-H1 layer-6 read of layer 9 | `registerRequestState` | §3.2 |
| R2-H2 run write op | none added; the purpose comes through the capture request | §3.2 |
| R2-H3 themes | why not, stated; their proposal pattern reused | §3.2 |
| R2-H4 D-572 | D21 | §3.3 |
| R2-H5 four modules | `notes` folded into leads; `investigation`'s existence tested and kept, reason stated | §3.2 |
| R2-H6, H9 citations | HOME's "intent R19" reads R3–R5; the Gov. Code citation is illustrative and comes from the profile | §1.1 note |
| R2-H7 counts | headings only, never "n of m" | §3.2 |
| R2-H8 worker reads the objective | in §3.3 | §3.3 |
| R2 §4 risks | concurrency (§4 "several members"); scale (paged sections, S11 fixture); purpose-revision rate measured (D5) | §3.2, §4 |
| R3-S5 four compositions | one: `investigationOf` | §3.2 |
| R3-S6 queue kinds | one list | §3.6 |
| R3-S7 shared waits | HOME's | D17 |
| R3-S8 set-aside | one act (`capture` R79); dependency derived from `holdings.serves` | §3.2 |
| R3-S10 authorisation | one ruling, three clauses | D7 |
| R3-S11 eval sets | one harness | §5.2 |
| R3 L-a AI interview | absent today; placed as `enquire`'s `frame` | §3.3 |
| R3 L-b acceptance visibility | administrators of the copy; development by export | §3.5 |
| R3 L-c re-proposal | tied to the proposal's recorded sources | §3.2 `enquiry.propose` |
| R3 L-d, L-e, L-f, L-g | "without an AI account"; notes cross-referenced (D18); next acts empty until the plan mode deploys; the `proposals` bound caps a tray and says so | §3.2, §3.5 |
| R3 C-a person fence | narrowed; `DOSSIER_BREADTH` defined mechanically | §3.6; D13 |
| R3 C-b subscription meter | undetermined until a source exists | D12 |
| R3 C-c allowance | not built until a measured need | §7 |
| R3 C-d `ai_usage` status | specified, code present per M2 §1.1; BOB verifies in code before stage 4 | §5.1 |
| R3 C-e `plan` in the chain | apart | §5.2 |
| R3 C-f, C-g cost figures | COST's figures stay order-of-magnitude *(inference)* until M-Q6 and M-Q9; "many members", not "most" | §5.1 stage 4 |
| R3 C-h test transcripts | under DR6, never published | D14 |

*(Note for §1.1: the 10-day response due date in the walk-through is illustrative; in the product it comes from the jurisdiction profile's records law, R2-H9.)*

## 7 · What is deliberately not built, and why

| not built | why | instead |
|---|---|---|
| `fact-proposals` module (READING) | a second store of proposals outside their owners (R1-B1) | owner-held propose → adopt; one check in `run-productions` |
| `notes` module (HOME) | the lead already has the right sight and share rules | a lead of kind `note` (D18) |
| `XPL-` objects in `enquiry` (PLANNING) and a store "beside" `hypotheses` (LOOP) | two homes for one construct | explanation proposals held in `hypotheses` |
| a separate "where it stands" read (LOOP L9), `planOf`-as-view, an `ai-runs` meter (COST) | four compositions of one view; two broke the layer order | `investigationOf` |
| `waitShare` (LOOP L8) | one more act than needed | project-scoped waits (D17) |
| a per-investigation allowance store (COST S3) | the daily ceiling exists, and nobody has yet run out on one investigation (R3 C-c); P0 asks for cost known and the long case bounded, which estimates, actuals and the stop rule give | later, on a measured need |
| an investigation container beside the project; a case-management console with tasks, assignees, roles and cadence reminders | K1627; DEC-72; MEM §7.9; CL §10 "no drift into case management"; DEC-69, DEC-94; `action-plans` R26 | the project, its view and the queue |
| the home as the assistant's memory; a transcript-centred loop; an autonomous agent that plans and fetches unattended; scheduled AI runs | DEC-61, DEC-113, K1502, K1547; K1481; table-decides | the record as memory (P1); short member-started runs |
| a group or project AI pool or key | K1502, K1503 | each member's own account |
| a `procurement` owner module; an OCDS reader | duplicates five owners; US districts publish no OCDS (B5 §2.2) | vocabulary amendments; OCDS as a vocabulary only |
| the full OCP red-flag set | P0 names only change-order limits, bidder count and spread, and contract-time slip (R1-M8) | three detectors and one recipe, gated |
| CPM schedule analysis; percent complete as a computed field | members need windows, not critical paths; percent complete is a stated claim | `baselinesOf`, `forecast` series, quoted figures |
| a per-evidence ACH rating matrix | over-building; ACH alone does not improve accuracy; DEC-77 already rules the matrix as a presentation form (R2-P4) | `expects`, "what nobody has looked for", side-by-side display |
| deterministic readers for every kind up front; contractor-register readers | measurement cost per kind; volume not yet shown | profiles first; graduation and register readers later, on volume |
| a network-shared profile library (READING step 6) | no second group yet (R1-M7) | Civicsmith's library and each group's |
| reading every held document automatically; reading without a purpose | K1468 ("never a sweep"); invariant 7; cost | a reading starts at a holding; without one, one question |
| model-stated values, grades or confidence entering the record; machine summaries as content | DEC-4, extraction R42; ID F4 | values by code from quotes; the bearing note beside the source only (D23) |
| legal interpretation of clauses | "legal information, not legal advice" | clauses quoted as standards by the member's adoption |
| per-member evaluation comparison; any score on members, proposals, contractors or explanations; "since you last looked" from viewing | DEC-68, DEC-89, DEC-82, `people` R29 | aggregate acceptance measure; dates the member picks |
| email, push or digests | DEC-94 | the home is the cadence; told once in the queue |
| joint investigations across groups | membership never crosses a group boundary | import and acceptance of a published case |
| publishing the plan, purposes, journal, notes or project answer | DEC-25 extended (D15) | a review copy with its own gaps |

## Sources opened

Read whole, first line to last:
- `study/investigation/prompts/S-SYNTHESIS.txt`, `RESUME.md`, `PROTOCOL.md`, `STATE.md`.
- `study/investigation/notes/P0.md` (1–325).
- `study/investigation/studies/READING.md` (1–411, in two consecutive ranges, 1–339 and 339–411), `PROCUREMENT.md` (1–351), `PLANNING.md` (1–364), `HOME.md` (1–475), `LOOP.md` (1–388), `COST.md` (1–423).
- `study/investigation/reviews/R-1.md` (1–112), `R-2.md` (1–97), `R-3.md` (1–113).

Searched after reading (PROTOCOL rule 1), to settle two review findings:
- `notes/*.md` for `theorypropose`, `servesOf`, `deploys_apart`, `wizardPropose`, `checkScript` and the hypothesis-layer "Noticed" route: hits at `notes/D1.md` l.177, `notes/M2.md` l.12, l.103, l.244, l.255, `notes/M1.md` l.74, l.179, `notes/C5.md` l.20, l.71, l.73, `notes/C6.md` l.119, `notes/M4.md` l.47 (lines read in full).

Not opened: the other notes and research files (their content reaches this synthesis through the studies and reviews that cite them); `prior/constructs-study-synthesis.md`; the product tree, which the protocol leaves to the M notes' code checks. Claims this synthesis could not verify beyond the studies are marked for BOB to confirm in code (`deploys_apart.plan` versus the chain; what `theorypropose` writes; `ai_usage` status).
