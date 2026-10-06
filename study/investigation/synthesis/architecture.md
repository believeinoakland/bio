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

<!-- next: §3 architecture; §4 lifecycle; §5 staging; §6 decisions and review findings; §7 not built; §8 sources -->
