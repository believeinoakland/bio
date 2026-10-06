# A-PROCUREMENT · Procurement and public-contract understanding

Unit A-PROCUREMENT, phase 2 of the investigation study (`PROTOCOL.md` §A). Scope: the constructs and document kinds of public procurement (RFP, bids, award, contract and its terms, schedule and milestones, change orders, payments, status reports, contractor and history); how they map onto the existing constructs (events, money, duties, progressions, entities, people, connections, standards) and what must be added; and how purpose-guided reading (READING) handles them without a hand-written reader for every variant.

Sources: every `notes/*.md` (P0, C1–C6, D1, D2, M1–M4), every `research/*.md` (B1–B5), `RESUME.md`. Product claims cite a note and, through it, the product (`module Rn`, `path §section`); outside-world claims cite `research/`; *(inference)* marks my own reasoning; *(general knowledge)* marks the rest. "Built" means built on `tranche/T33` at the pin unless a note says otherwise; several T33 modules are merged there and not yet on `main` (M3 §5 item 12; M4 §5 item 10).

**The answer in one paragraph.** Procurement does not need a new engine or a new owning module. The T33 world model already carries its backbone: a `contract` entity, `award` and `signing` events, change orders as events that `amends` the award, `committedAgainstPaid`, OCDS party roles on `contracts_with` lines, duties with a `commitment` time basis and recorded transitions, declared flows (progressions) with missing-predecessor, overdue and out-of-order findings, and public commitments as standards (M4 §4 "Net"). What is missing is (1) a small set of **vocabulary amendments** in those owner modules (a contract clause as a standard, a forecast date, a completion event, an offer amount, a capital project, a promise stated as a duration), (2) a **machine-proposes path** for events, lines and money facts, which today accept only identifier-backed machine writes (M4 §5 item 1), and (3) a **procurement pack**: data, not code, that tells PLANNING what documents a public-works investigation expects and tells READING why each kind of document is held and what to propose from it. The pack's document kinds are keyed to the OCDS `documentType` codelist; its expected flow is a declared progression; its explanations are a starter library for member-held hypotheses; its red flags are gated money-checks detectors. Variants (design-bid-build, design-build, lease-leaseback, emergency or sole-source, a services contract) are pack entries and progression versions, never new readers.

## 1 · The need

### 1.1 What members bring

Procurement is the spine of four of P0's fourteen scenarios and a limb of several more (P0 §1):

| scenario | what procurement question sits inside it | shape |
|---|---|---|
| **S1 Grandview rebuild** (Bob's) | contract time, LDs and extension clauses; bid count and spread; change orders with days, dollars and cause; monthly forecast dates; contractor history; DSA approvals and change documents | schedule-and-cost (P0 §2 obs. 1) |
| **S3 emergency shelter contract** | was the emergency exemption from bidding invoked and renewed; deliverables vs payments; amendments | compliance-against-standard, with a skipped solicitation |
| **S11 rapid bus line** | baseline vs re-baselined schedule and cost; change orders; contractor claims; oversight-contractor reports | schedule-and-cost at scale ("S1's needs generalise to any capital project") |
| **S8 towing contract and the donor** | the procurement file behind an award vote; staff recommendation; whether the process was competitive | award process plus people and money ties |
| S7 water capital programme | capital targets vs delivery; contracting capacity | programme of many contracts |
| S2 sewer fees | cost-allocation arrangements and transfers | money trail (procurement minor) |
| S6 affordable units | development agreement as a contract-like commitment | conditions register |

P0's cross-cutting table names "reading with purpose" first with procurement examples: "a bid tabulation is read for bidder count and spread; a contract for completion date, LD rate and extension clauses; a CO for days, dollars and reason; a CM report for its forecast date" (P0 §2). Its first observation says procurement is "a good first pattern because procurement documents are well structured" and that "a small library of investigation *patterns* (document kinds expected, standard sources, typical explanations, typical refusals) would carry much of the planning" (P0 §2 obs. 1–2).

### 1.2 What an investigator needs from procurement understanding

Drawn from S1 (P0 §1 S1) and B5's worked case (B5 §4, "Bob's case, compressed"):

1. **Know the stages and what each leaves behind.** Identification → preparation/design → state approval → tender → award → contract → implementation → completion, each with named documents (B5 §1.1 table). A gap in the expected set is the next task.
2. **Fix the baselines.** At least four candidates for "late": the community promise, the bond or board-approved schedule, the contract time, the contractor's baseline schedule; "each can give a different answer" (B5 §1.6; P0 S1 objective O1). The member's "one school year" may be campaign talk; the investigation must say which promise is at issue (C1 §4 item 14; B1 lesson 1).
3. **Hold the slip as a series.** Each monthly report states a forecast date; "when did the district first know?" is answered by the first report whose forecast moved (P0 S1 time structure).
4. **Follow the change orders.** Rate against the original contract, cause mix, timing, pending vs processed, ratification; the statutory limit (10% under PCC 20118.4) is a standard to compare against (B5 §1.3, L10).
5. **Follow the money**: award → contract sum with changes → paid; contingency; LDs assessed or waived (P0 S1 money; B5 §1.3).
6. **Know the contractor**: licence, bonds, registration, debarments, other agencies' experience, claims and suits; every source partial (B5 L11).
7. **Hold competing explanations** and know which documents test each (B5 §1.6 tables; B1 §1.5).
8. **Treat official status reports as claims** to cross-check against independent records (B5 L9; the WCCUSD grand-jury findings, B5 §3 item 3).
9. **Know the access regime**: what is posted (board packets, CBOC page, DSA eTracker, CSLB, DIR) and what needs a records request (schedules, pay applications, CO logs, inspector reports, claim correspondence) (B5 §1.1 "What a member can get"; P0 S1 dead ends).
10. **Date every legal premise**: statutes sunset (design-build authority, PCC 9204) (B5 L15).

The scenarios also show breadth that a single schedule-and-cost model would miss: S3's emergency exemption is a *lawful skip* of the solicitation stage; S8 is about the *award decision*, not delivery; S11 is federally funded with its own oversight documents (FFGA, PMOC reports). Procurement knowledge must therefore be general (stages, kinds, roles) and its variants data (P0 portability note: "jurisdiction-specific rules as data, not as code"; C1 D31).

## 2 · Best practice that applies

| practice | what it gives procurement understanding | source |
|---|---|---|
| **OCDS** | five stages (planning, tender, award, contract, implementation); one id per contracting process (OCID); immutable dated releases, compiled and versioned views; parties once with roles (buyer, procuringEntity, supplier, tenderer, …); milestones with `dueDate` and `dateMet`; amendments with `rationale`; an open `documentType` codelist of about 40 values (tenderNotice, awardNotice, contractSigned, physicalProgressReport, completionCertificate, …) | B5 §2.1 |
| **OC4IDS / CoST IDS** | a **project** above its contracting processes; `completion` with reasons for changes in time, cost and scope; contract `modifications[]` each with type, rationale, old and new value or period; 40 proactive and 26 reactive disclosure items | B5 §2.2 |
| **CoST assurance** | the disclosure checklist as the default "documents to find"; "record what is, and is not, available"; an unanswered request "can itself be reported as a fact"; findings written as observation plus factual comment ("Time elapsed is 400% of original contract duration. But progress is under 70%") | B5 §1.5 (b), L3, L4, L13 |
| **OCP red flags** | 73 indicators; for delay and overrun R054, R059, R064–R069, R073; a flag "is not evidence that illicit behavior is present"; a flag firing on 90% of cases is noise; each flag carries a workflow saying what follows | B5 §1.5 (a), §3 items 1–2 |
| **Forensic schedule analysis (AACE 29R-03)** | observational method in lay form: compare the baseline's milestones with each update, find the window where the slip began, read what happened in it | B5 §1.3, L7 |
| **Baselines and lock-in (Cantarelli, Flyvbjerg)** | overrun depends on the reference estimate; the earliest public figure is usually the lowest | B5 §1.6, §3 item 5 |
| **Explanation families** | owner, design, contractor, external, technical, psychological, political-economic, integrity, information failure; each with documents that would show it and documents that would contradict it; delays are concurrent | B5 §1.6 |
| **Promise vs reality** | "Most investigations are about the difference between a promise and the reality"; the official explanation is a hypothesis to test | B1 §1.1; B3 §1.7 |
| **Journalists on delayed construction** | fix the promise in a dated document; measure the gap from the owner's own reports; benchmark; read the auditors; follow claims and suits; test the owner's explanation; aggregate; follow the award | B1 §1.5 |
| **Yellow Book finding elements** | criteria, condition, cause, effect; develop only what the question needs | B2 §1.4; already a ruled presentation form (DEC-77, D1) |
| **ACH and diagnosticity** | evidence consistent with every explanation has no diagnostic value; plan collection to discriminate | B3 §1.3, lesson 1 |
| **Classify, then a type-specific schema; new types learned from a described schema plus one to five examples** | the IDP pipeline (classify → route → extract → review); the schema's field descriptions carry the purpose | B4 §1.3, lessons 6–8 |
| **Structure first, then targeted lookup; split-map-reduce for "every change order"** | PDFTriage, ReadAgent, DocETL | B4 §1.3, lessons 7, 9 |
| **FollowTheMoney** | typed entities including Contract, Call for tenders, Project; relations Contract award, Project participant | B1 §2.4 |
| **Contractor history is partial** | CSLB discloses only complaints that led to action; prequalification questionnaires are not public records (PCC 20111.6); grade a clean record as weak evidence | B5 §3 item 8, L11 |

Two warnings shape the design more than the rest. First, **US school districts publish no OCDS** (B5 §2.2): the structure must be *built* by reading board packets and PDFs, so OCDS is a vocabulary and a shape here, not an import format. Second, **red flags are leads**: the substrate already rules this (K1473, K1491, the ≤20% false-alarm gate; M4 §1.9; C6 §2 row 11), and the outside world agrees (B5 L5).

## 3 · What the substrate already provides

### 3.1 The procurement artefacts, mapped

This table extends M4 §4 (each artefact against the world-model modules) with the documents path (M3) and the evidence path (M1). State per PROTOCOL rule 3.

| artefact | how it is held today | state | evidence |
|---|---|---|---|
| **The capital project** (Grandview rebuild) | entity of kind `program` or `place`; no `project` kind, though `jurisdictions` has a `project` id space and classification scheme | built (entities); `project` id space built | M4 §1.1, §1.15 (jurisdictions R3, R52) |
| **Contracting process** (architect, CM, main contract) | entity of kind `contract`, one per contract; an OCID would be an identifier scheme on the entity | built (kind); identifiers specified (entities R43–R44, T33) | M4 §1.1 |
| **Solicitation** (IFB/RFP/RFQ) | the captured document + an `issuance`/`publication` event; stage `solicitation` of a member-declared progression; its legal basis as a standard | built | M4 §4 row "RFP" |
| **Bid** | document; bidder entity (sector `company`); `filing`/`communication` event; `contracts_with` role `tenderer`; price as a money fact with no clean phase; the bid tabulation as a declared table with a ranking by one stated quantity | built, awkward | M4 §4 row "bid"; `lines/vocab.mjs:20` |
| **Award** | `award` event (decider = board, party = contractor); money fact `encumbered` concerning it; `contracts_with` role `supplier` valid from the event; `authorises` to later payments | **built** | M4 §4 row "award"; events R6, R11, R17; money R14–R15 |
| **Award vote** | Legistar reader yields event items, votes, matters with source ids, machine-written as system-rule assertions; no reader for other board platforms | built (Legistar only) | M3 §2.10, §5 item 9 |
| **Contract and its terms** | `contract` entity; `signing` event with signatories; duties for clauses, with the contractor as obligor "acting for a public body under … contract" and a named enforcer | built, with a **tension**: a duty's source must be a standard, court, practice or dependency, and a contract is not one of the six standard kinds | M4 §1.6, §4 row "contract", §5 item 3 |
| **Schedule and milestones** | a set of duties, one per milestone, trigger an event (notice to proceed) or a date, time basis `commitment`; or `within` intervals on a declared flow | built; no baseline vs re-baseline, no percent complete | M4 §4 rows "schedule", "milestone" |
| **Change order** | `adoption`/`signing` event that `amends` the award; money fact counted as committed in `committedAgainstPaid`; `amountChecks` "change orders past a stated share of the award" (threshold must be cited); a time extension only as a duty `revise`, unlinked to the event | **built** (money R14 names change orders) | M4 §1.8, §1.9, §4 row "change order" |
| **Payments** | money facts `paid` concerning the contract, or attributed to it by a member's `attribution` set where no identifier joins them; `committedAgainstPaid`; `authorityChain` walks `authorises`; `reconcile` | built (tested on fixtures; Oakland publishes no payment ledger, K1506) | M4 §1.8; C6 §1b "Money" |
| **Status reports** | document; `publication` event; a recurring reporting duty met by each report; `reported_status` quoted; **no dated-fact kind for a forecast date** | built, gap | M4 §4 row "status report" |
| **Promise** ("one school year") | standard of kind `commitment` with captured text; a duty on it, obligor the district office, basis `commitment`; `civil-time.due` treats `commitment` as "the body's own stated date" | built, gap: a promise stated as a **duration from an anchor** has no direct form; "school year" is a calendar fact no profile holds | M4 §1.13, §1.16, §4 row "a promise" |
| **The slip** | duty occurrence state as known on each day, transitions append-only; a restated promise as a superseding standard and a duty revision; lateness `span`; progressions `overdue_successor`; `reevaluation` for "an event's date moved" is **specified, not built** (R34) | built except R34 | M4 §4 row "its slip"; M1 §1.16 |
| **Contractor history** | `contracts_with` lines to every buyer; `successor_of`; `holds` for principals; `party_to` suits; licence number as a grade-A identifier if the profile lists the scheme; money paid to it; `explore` walks; an ungated `freezeSet` count "N of M contracts late"; gated lateness pattern and vendor-concentration detector | built; **nothing ingests a contractor's record** from a register | M4 §1.10, §4 row "contractor history", §5 item 12 |
| **Declared procurement flow** | a progression: stages with `after`, `cardinality`, `within`, `required`; an instance threaded by one entity; findings missing predecessor, overdue successor, cardinality exceeded, out of order ("payment before award"); exception documents discharge a stage lawfully; the flow's basis may cite a held standard | **built** (R37–R42 code present, marks pending) | M4 §1.7; C3 §1 row §8.2 (the canon's nine-stage procurement table) |
| **Junction and amount checks** | amount-free checks (award without solicitation, one response, payments past term) in progressions; amount checks in money-checks; detectors (split contracts, change-order growth, payments before approval, vendor concentration) gated at ≤20% false alarms, raised "Noticed" | built, detectors gated | M4 §1.9; C6 §1b "Procurement" |
| **Act against standard** | `conformance` (layer 9): compliant / noncompliant / unclear per standard; "OBLIGATION AGAINST ACT routes into `conformance`" | built, UI 0 | C5 §1.6 L4; D1 DEC-76 |
| **Records request for reactive items** | `actions` kind `records_request`, never gated, correspondence ledger, `due_cite`, `passed_unanswered`; addressee suggestion from `custodian_of` (R62, T33) | built; R66–R67 (the request as a duty trigger) not built | M4 §1.19 |
| **Cost-growth analysis** | `calculations` recipes over money facts; `workbooks` with cells bound to captured sources | built | M4 §1.11; M3 §2.19 |
| **Following the district's postings** | `link-sweep` over the bids page and agenda listing; `monitoring` named requests; monitoring proposes watching sources an objective rests on | built | M3 §2.21–2.22 |

M4's verdict stands: "The world model already carries the procurement backbone … What it lacks is procurement-*specific* typing …, a contract clause as a duty source, a schedule/forecast series, and — most consequential for an AI investigator — a *proposal path* by which a machine reading of a bid tabulation or status report could propose events, lines and money facts for a member to adopt" (M4 §4 "Net").

### 3.2 The documents path for procurement documents

| question | answer at the pin | evidence |
|---|---|---|
| Is there a reader for RFPs, bids, bid tabulations, contracts, change orders, invoices, pay applications, schedules, status reports? | **No.** Seven content types for civic meetings and regulations; budget, court, Legistar and roster readers. `staff_report` catches the board item recommending an award | M3 §2.7, §3.1, §5 items 1–2 |
| What happens to an unfamiliar document? | `generic` type at confidence NONE; read as text with positions; no structure beyond pages and paragraphs | M3 §2.6, §3.1 |
| Structure? | No PDF outline (`/Outlines` absent), no docx headings, PDF tables only for financial documents; regulations get a section tree | M3 §2.18, §3.2, §5 items 3–4 |
| How may an AI read it? | `extractPropose` (mode `extract`, undeployed): proposed passage readings labelled machine work, grade computed at most B, an `ai(fn, version)` step on the chain; runs never see document bytes, only extracted rows | M2 §3.3, §3.5; M3 §2.12 |
| Where can "why this document is held" be recorded? | Nowhere directly. `origin` knows named request, sweep, doorbell. The **nearest construct is the stage a document fills in a progression instance** | M3 §3.4, §5 item 5; C3 §0, §3 (c) |
| Is extraction allowed in bulk? | No: "only at a member's request for a basis or claim, or by a member's act scoped to a body and period; never a sweep" (K1468) | C5 §2; M4 §3 |
| The formats a records-request production uses | scanned PDFs through the OCR tier (cap C; external OCR not funded, DEC-74); ZIP, email, images have no format entry | M3 §2.20, §5 item 7; D1 DEC-74 |

### 3.3 How an engine would use the substrate as it is

Even before any change, the S1 investigation can be held in the record by members' acts *(inference, from the tables above)*:

1. Register the district, the contractor (sector `company`), the architect, the board, the bond fund, the main `contract` and the school (`place`) (entities R1, R42).
2. Declare a progression "public works, design-bid-build" from canon's nine-stage procurement table extended with construction stages (C3 §8.2; M4 §1.7's sketch), thread the Grandview contract through it, and read which stage's document is missing and which successor is overdue.
3. Hold the "one school year" text as a `commitment` standard once its source is captured (a board item, a bond page, a meeting recording); if the source is only the parent's memory it is testimony at grade D (provenance R27–R28 in M3 §2.16; DEC-102 in D1).
4. Record the award event, the award amount and change orders as money facts concerning the contract; read `committedAgainstPaid`.
5. Draft a records request for the schedule, the CO log and the CM reports (`actions`, never gated; ACT §4 r2 in C4).
6. Hold the member's suspected causes as hypotheses on the working inquiry (K1467; M1 §1.4).

Every one of these is a **member's** act. The engine can do almost none of it by proposal today: events, lines and money facts accept a machine write only with identifiers at both ends (M4 §5 item 1), duties and standards have a propose → adopt path but no caller (M4 §1.6, §1.13), and the only deployed AI mode is `check` (M2 §1.1). That is the main gap.

## 4 · Gaps

Each gap names whether something is **missing** or **exists but does not fit**, and its evidence.

### 4.1 Missing

| # | gap | why it matters for procurement | evidence |
|---|---|---|---|
| G1 | **No machine-proposes path for events, lines and money facts.** Duties, standards, money sets, themes and action-plan options have propose → adopt; events, lines and money facts take a machine write only when both ends carry source identifiers, otherwise only a member's direct act. Lines leaves "whether a member line may be adopted from a machine proposal" open | An AI reading an award resolution or a bid tabulation (names, not ids) can write none of the award event, the `contracts_with` line or the award amount, and has no tray to put them in. Every procurement fact would be typed by a member | M4 §5 item 1; M4 §1.10 (lines §Suggestions open (4)) |
| G2 | **No procurement document kinds.** No reader, no recogniser vocabulary, no profile vocabulary for solicitation titles, bid tabulations, notices of award, change-order forms, pay applications, CM or bond-programme reports | Nothing says "this is a bid tabulation, read it for bidder count and spread"; an RFP arrives as `generic` | M3 §2.7, §5 item 2; M4 §1.15 (jurisdictions R6 "no procurement vocabulary") |
| G3 | **No record of why a document is held.** Only `origin` and a workbook's free-text question | The planner cannot say "the contract is in the file to fix contract time and LD rate"; READING cannot be told | M3 §3.4, §5 item 5; M1 §4 item 1 |
| G4 | **No forecast date.** Dated-fact kinds are closed (meeting … edited) and hold no projected date | The slip series ("each report's forecast completion date") has no home; "when did they first know?" cannot be read | M4 §4 row "status report", §5 item 5 |
| G5 | **No completion or notice-to-proceed event kind**; no `solicitation`, `bid opening`, `change order` kinds | Members can use `other`, `issuance`, `amends`; queries and checks cannot tell the difference without a typing layer | M4 §5 item 2; events §Terms |
| G6 | **No offer amount.** Money phases are budget phases (proposed, adopted, adjusted, actual) | A bid price fits none cleanly; bid spread and low-bid-vs-estimate cannot be computed honestly | M4 §4 row "bid" |
| G7 | **No capital-project kind above contracts** | OC4IDS's project (one rebuild, many contracts) has to be a `program` or a `place`; a bond programme is also a `program` | M4 §1.1; B5 §2.2 |
| G8 | **A promise as a duration from an anchor** ("no longer than one school year" from construction start) and **the school year as a calendar fact** | `civil-time.due` reads `commitment` as a stated date; the profile holds no academic calendar | M4 §1.16 "Gap for promises", §5 item 4 |
| G9 | **No ingestion of contractor registers** (licence board, wage-law registration and debarment, other agencies' awards, court registers beyond the three systems read) | "Contractor info/history" (Bob, RESUME) rests on members typing lines | M4 §4 row "contractor history"; B5 L11 |
| G10 | **No cross-baseline read.** Nothing joins the superseded commitments, the duty's transitions, the forecast dates and the change orders into "promise vs reality" | Must be composed by a caller each time | M4 §4 row "its slip" |
| G11 | **No profile for a school district or for state school-construction bodies.** The first profile covers Oakland and Alameda County | The district's board portal, fiscal year, bond codes, DSA, OPSC, CSLB and DIR need sourced profile entries before ids from them count | M4 §1.15, §5 item 7; C1 §4 item 15 |
| G12 | **No structure for long procurement PDFs.** No outline, no headings, no non-financial PDF tables | Reading an RFP "by its TOC" or a schedule of values as a table has no primitive | M3 §5 items 3–4 |

### 4.2 Exists but does not fit

| # | misfit | evidence |
|---|---|---|
| F1 | **A contract clause cannot be a duty's source** except by declaring it a `commitment` or `policy` standard, though K1440 lets a contractor owe "under a … contract" and Capability Ladders N11 already counts "contracts, policies, budgets and commitments" as standards | M4 §5 item 3; C5 §1.6 (LAW N11) |
| F2 | **A time extension is not linked to its change order**: the extension is a duty revision, the change order an event; the two are joined by nothing | M4 §4 row "change order" |
| F3 | **Progressions take one entity per instance and a fixed `within` interval from the predecessor**; a contract's own completion date is a duty, not an interval; a rebuild with a design contract and a construction contract is two instances | M4 §1.7 "Limits" |
| F4 | **Canon's procurement flow ends at `amendment`**: no construction-execution stages (notice to proceed, progress reports, substantial completion, closeout) | C3 §4 item 1; C3 §1 row §8.2 |
| F5 | **Hubs.** The district will be named in most documents; co-mention through an entity in more than 32 documents is stepped around | M4 §5 item 8; C3 §1 row §8 |
| F6 | **"An event's date moved" does not propagate** (`reevaluation` R34 specified, not built) | M1 §1.16, §4 item 7 |
| F7 | **The request as the district's response duty** (actions R66–R67) and **a plan step waiting on a duty** (action-plans R38) are specified, not built | M4 §1.18–1.19, §1.21 |
| F8 | **Money conflicts withheld**: contradiction key K6 (two amounts for one transfer) forms pairs but is `not_shown` until measured | M1 §1.5 |
| F9 | **Detectors exist as a proposed list, gated and unmeasured**: split contracts, change-order growth, payments before approval, vendor concentration | M4 §1.9 (money-checks open (4)) |
| F10 | **A run cannot read the T33 constructs.** The ask's reach includes `timeline`, `moneyof`, `committedagainstpaid`, `holderat`; a run's `PLANE_OPS` does not | M2 §4 G6 |

### 4.3 What is *not* a gap

Three things look like gaps and are not *(inference)*:
- **A procurement object.** OCDS's contracting process is a container for stages; in this record the stages are events, money facts, lines and duties concerning a `contract` entity, threaded through a progression. A parallel `procurement` object would hold a second copy of each, against "one fact in one place" (C5 §2, D368; M4 §3 "one home per fact").
- **A reader per variant.** Inv. 4 ("a rule requires a measurement") binds *deterministic* readers (C3 §2); purpose-guided AI reading proposes labelled rows a member adopts, and needs a described schema, not a measured parser (B4 lesson 8). Deterministic readers are earned only where volume justifies them (§6.4).
- **A schedule engine.** Members will rarely run CPM software; the observational method (baseline milestones vs each update, by window) needs only dated facts, duties and `span` (B5 §1.3, L7).

## 5 · Options

### Option A · Pack only: data on top of what is built

**Reuses** everything in §3.1 unchanged. **Adds** a procurement pack as data: a declared progression per delivery method, a document-kind catalogue keyed to OCDS `documentType`, the CoST disclosure checklist, an explanation library, red-flag definitions. Members do all writing; the pack guides wizards (DEC-120, DEC-121) and the planner.
**Doctrine fit:** perfect; nothing new is written by a machine. **Cost:** low (data, profile entries, wizard scripts). **Risk:** the AI cannot carry the reading load; every award, amount and date is typed by a member; DR2's "useful to one person with a few hours a week" (C1 §1.2) is missed on S1, which has dozens of documents. The awkward fits (F1, G4–G8) remain and members work around them with `other` and free text, which later checks cannot read.

### Option B · Pack + vocabulary amendments + the proposal path (recommended)

**Reuses** the owner modules as they are. **Adds** (1) the pack of Option A; (2) a short list of amendments to owner modules' closed vocabularies (§6.2); (3) a member-adopted proposal path for events, lines and money facts, on the pattern duties and standards already use (G1); (4) one composite read (baselines and slip) as an `explore` preset; (5) the pack's red flags as money-checks detectors and progressions junction checks under the existing gate.
**Doctrine fit:** good. Proposals are stored apart, labelled, adopted by a member's act (C5 §2 "Labelled drafts"; M4 §3 "machine proposes, member adopts"); extraction stays targeted (K1468); flags stay "Noticed" (K1491). **Cost:** moderate; each amendment is a requirement in an existing module, no new module, no layer change. The proposal path is shared with READING and LOOP and is the expensive part. **Risk:** vocabulary creep if every pack entry asks for a new kind; contained by the rule in §6.2 (a kind is added only when a check or a read must tell it apart).

### Option C · A new `procurement` owner module (layer 5)

**Adds** an OCDS-shaped record per contracting process (tender, bids, awards, contracts, milestones, amendments) owned by one module, with its own reads.
**Doctrine fit:** poor. It duplicates events (award, signing), money (amounts), lines (parties and roles), duties (milestones) and progressions (stages), breaking "one fact in one place" (C5 §2) and "every kind of relationship keeps its one owning module and all share one connection shape" (C1 §1.4 row 17). It drifts toward case management (C5 §2 "No drift into case management"). **Cost:** high (a new module, adding a capability module is Bob's, C1 D32). **Risk:** two answers for "when was it awarded?".

### Option D · OCDS import as a reader

**Adds** a reader for published OCDS releases, writing identifier-backed rows as system-rule assertions, as `legistar-reader` does (M3 §2.10).
**Doctrine fit:** good (machine writes with source ids at both ends, K1443 as extended; C6 §2 row 14). **Cost:** moderate. **Risk:** little value now: US school districts and most US agencies publish no OCDS (B5 §2.2). Worth keeping as a later stage for publishers that do.

**Choice.** B, with D as a later stage. A leaves the engine unable to help with the very documents Bob named; C rebuilds what T33 just built.

## 6 · Recommendation: Option B

### 6.1 The shape

Procurement understanding is **knowledge held as data plus a few words added to existing modules**, used by the other capabilities. It has no module of its own. Three parts:

1. **Vocabulary amendments** in owner modules of layer 5 (and `civil-time`, `jurisdictions` in layer 1), so that procurement facts have honest homes (§6.2).
2. **The proposal path** for events, lines and money facts, built once for every domain and used here first (§6.3).
3. **The procurement pack**: a versioned library of document kinds, declared flows, a disclosure checklist, an explanation library and red-flag definitions, read by PLANNING and READING (§6.4–6.5).

Plus one composite read (§6.6) and a later register path for contractor history (§6.7).

### 6.2 Vocabulary amendments (each a requirement in an existing module)

Rule for every amendment: **add a kind only where a check, a read or a member must tell it apart; otherwise rely on the document's stage in a declared flow.** That keeps the closed vocabularies small (C5 §2 "one quantity under one name") *(inference)*.

| module (layer) | amendment | closes | why not something else |
|---|---|---|---|
| `standards` (5) | kind **`contract`**: a held contract or its clause, captured text, `portion`, `requires`, in force from the signing event | F1; lets a duty's existing source kind `standard` cite a clause, so `duties` needs no change | Capability Ladders N11 already counts contracts as standards (C5 §1.6); calling a contract a `commitment` would mix the contractor's obligation with a body's public promise |
| `events` (5) | dated-fact kind **`forecast`** (a document's stated projected date, with what it forecasts: an event kind on an entity); event kind **`completion`** (substantial completion, notice of completion) and **`notice_to_proceed`** | G4, G5 in part; the slip series and the two anchors every construction duty needs | `solicitation`, `bid_opening` and `change_order` stay generic (`issuance`, `filing`, `adoption` + `amends`): their stage in the declared flow already tells them apart, and money R14 already finds change orders by `amends` |
| `events` (5) or `duties` (5) | a **link from a change-order event to the duty revision it caused** (the time extension granted), as an event relation or a duty-revision basis | F2 | the days granted are neither money nor an event field (M4 §4 row "change order") |
| `money` (5) | phase **`offered`** for an amount a party offers (a bid, a proposal price), concerning the solicitation event | G6 | `proposed` is a budget phase; mixing them would let `summable` add bids to budgets |
| `entities` (5) | kind **`project`**: a capital project holding contracts (OC4IDS's level), with the profile's `project` id scheme | G7 | `program` stays for a bond programme or a service programme; a rebuild is neither |
| `civil-time` (1) | `due` with basis `commitment` accepts **a duration from a trigger event** ("one school year from construction start"), traced | G8 | today a member must compute the date by hand and the trace loses the promise's words |
| `jurisdictions` (1) | (a) a body's **academic calendar** as a dated profile fact; (b) **procurement vocabulary** (solicitation titles, award-item wording, form names) for recognisers; (c) **standard sources** for procurement law (public contract code sections, school-construction statutes) and register **identifier schemes** (contractor licence, wage-law registration); (d) the first **school-district and state-agency entries**, each sourced (R44) | G8, G2 (recognition), G11 | all are local facts; "no jurisdiction in code" (C1 D31) |
| `progressions` (5) | **construction-execution stages** in the shipped example flow (notice to proceed, progress reports recurring, substantial completion, closeout) | F4 | a data change to an example definition, not code (progressions R1) |

Three already-specified requirements become prerequisites rather than additions: `reevaluation` R34 (an event's date moved) for F6, `actions` R66–R67 and `action-plans` R38 for F7 (M1 §1.16; M4 §1.21). F3 (one entity per instance) is handled by threading a `project` entity through a project-level flow and each `contract` through its own, which `explore` can walk *(inference)*; no change.

### 6.3 The proposal path for events, lines and money facts

Built once, in each owner module, on the pattern `duties` R2 and `standards` R9–R10 already use: **a machine proposal is stored apart, labelled machine work, carries its source extent and verbatim quote, is never read by any check or total, and becomes a row only by a member's adopt act** (M4 §3; C5 §2 "Labelled drafts"). Interface in one sentence each:

- `proposeEvent | proposeLine | proposeMoneyFact({run, extent, quote, row})`: a run in a deployed mode writes one proposal; refused without an extent the run read (`ANSWER_CITES_UNREAD`-style check, M1 §1.10) or with an offered grade (DEC-4; extraction R42 in M3).
- `proposals({target|document|project, viewer})`: the tray, read by `queue` as one FINDING per document with N instances ("one check across 58 contracts is ONE proposal with 58 instances", C2 §1.2).
- `adopt({proposal, by, reason?})` / `decline({proposal, reason})`: member acts, singly or in bulk, nothing pre-ticked (DEC-69, DEC-97 in D1); adoption records "accepted a recommendation" (DEC-77) and the acceptance rate per kind is measured as the steering guard (contradiction R39's precedent, M1 §1.5).

This path is READING's and LOOP's to design in full; PROCUREMENT needs it for exactly these rows: award event and participants, signing event and signatories, `contracts_with` line with OCDS role, award amount, offered amounts from a tabulation, change-order events and amounts, `forecast` dated facts, `completion` and `notice_to_proceed` events. Where a document carries source identifiers at both ends (a Legistar vote, a future OCDS release), the existing machine write stays (K1443 as extended; C6 §2 row 14).

### 6.4 The procurement pack

A versioned data library, recorded on every run that used it (as the skill version is, ai-runs R10 in M2), governed like wizard-script libraries: a **Civicsmith library** approved by Bob, and **each group's own** additions approved by a project owner; a machine may propose an entry and never approve one; an entry says what to look for, never what to conclude (DEC-121 in D1; wizard-scripts R12 in M2). Jurisdiction-specific content (statutes, thresholds, bodies, registers, form names) lives in the profile and is referenced by key (C1 D31). Five parts:

**(a) Document kinds.** One entry per kind, keyed to the OCDS `documentType` codelist where a code exists (B5 §2.1) and a local key where not. Fields: stage; **purposes** (the questions this kind answers); **fields to look for**, each with a plain description and the owner-module row it would become; recognition signals (profile vocabulary, form names); where it is usually found and whether proactive or reactive (CoST, B5 §2.2); **cautions**. The first entries, from S1:

| kind (OCDS code) | purposes (why held) | fields → owner rows | cautions |
|---|---|---|---|
| bond measure / project list (`projectScope`) | the voter-approved scope; Prop 39 limits | scope text → `standards` (commitment); amount → money (`adopted`) | a list is not a schedule |
| board item approving the project (`budgetApproval`) | budget and any stated schedule at the decision to build | amount → money; any completion statement → standards (commitment) | lock-in: earliest figure lowest (B5 §1.6) |
| notice inviting bids, specifications (`tenderNotice`, `biddingDocuments`) | contract time, LD rate, phasing, known site conditions | contract time, LD rate → `standards` (contract) portions; issue date → dated fact | addenda change terms |
| bid tabulation (`bidders`, `evaluationReports`) | how many bid, how close, low bid vs estimate | bidders → entities + `contracts_with` role `tenderer`; prices → money (`offered`) | a table: read whole, split-map-reduce (B4 lesson 9) |
| staff report and award item (`awardNotice`) | who decided, when, on what recommendation | award event, decider, party; amount → money (`encumbered`) | one award per contract |
| executed contract, notice to proceed (`contractSigned`) | the binding completion date and extension rules | clauses → `standards` (contract); NTP event; completion duty (trigger NTP, basis commitment) | often only by records request (P0 S1) |
| baseline schedule and updates (`contractSchedule`) | as-planned and as-updated milestones | milestones → duties; each update's dates → `forecast` dated facts | the baseline is the reference for every window (B5 §1.3) |
| change order and ratification (`contractAmendment`) | cost, days, cause, ratification | event `amends` award; amount → money; days → duty revision (F2); stated cause → `stated_cause` "<source> states" | cause codes are contestable (B5 §2.3) |
| pay application (`paymentCertificate`) | paid vs contract sum; percent complete | amounts → money (`paid`); percent complete as stated → dated fact or quoted status | the contractor's claim, certified by the owner |
| CM or bond-programme status report (`physicalProgressReport`, `financialProgressReport`) | the owner's reported forecast and spending | forecast → `forecast`; status → `reported_status` quoted | **a claim to check**, not ground truth (B5 L9) |
| oversight committee report, audits (`financialAuditReport`, `technicalAuditReport`) | findings, recommendations, required responses | recommendations → duties `arising_in` (COURTS `oversight_report`, C5 §1.7) | reviews after the fact (B5 §1.4) |
| state approval records (DSA application, change documents, certification) | design-review time; change documents queued; certification | dated facts; events (approval, certification) | state body judges code, not schedule (B5 §1.4) |
| contractor register records (licence, registration, debarment) | licence status, bonds, disclosed actions | entity identifiers; lines; events | disclosure-limited: a clean record is weak evidence (B5 §3 item 8) |
| claims, stop-payment notices, suits | the contractor's account; distress | events (`filing`); `party_to` lines; `stated_cause` | self-serving on both sides (P0 S1) |

**(b) Declared flows.** Progression definitions (progressions R1, built), one per delivery method: design-bid-build; design-build; lease-leaseback; a services contract (S3); each with stages from identification to closeout, `cardinality` (bids 1..n, change orders 0..n, progress reports recurring), `required` levels, and exception documents for lawful skips (an emergency finding discharges `solicitation`, progressions R14, which is S3's question). Each flow's basis cites the held standard that requires it (R39). A group adopts a flow; the pack's flows are templates, versioned with a basis (D-128 in C3).

**(c) Disclosure checklist.** The CoST proactive and reactive items mapped to the document kinds, with the profile's notes on where each is published locally (B5 L3). PLANNING uses it as the default "documents to find"; reactive items become **drafted** records requests a member sends (actions, never gated; DEC-115's approve ≠ send in D1).

**(d) Explanation library.** The B5 §1.6 table: each family (owner change, design error, state-review backlog, unforeseen conditions, contractor performance, contractor distress, owner payment or funding, optimistic promise, integrity, information failure), with "would show in" and "contradicted by" naming document kinds. PLANNING offers them as **suggestions a member may hold as hypotheses** (only a member holds one: `MACHINE_CANNOT_HYPOTHESISE`, M1 §1.4) and derives lines of enquiry from the "would show in" kinds. The library says what to look at, never which explanation is true (DEC-84 (10): a cause is member-authored and published only when evidenced; D1).

**(e) Red flags.** Each OCP indicator relevant to the domain (R054, R059, R064–R069, single bid, bid spread, B5 §1.5) written as a `money-checks` detector or a `progressions` junction check: definition, data needed, unit, **threshold with its citation** (money-checks R3: else "undetermined: no threshold stated"), and the next step it suggests. Shown only after the measured false-alarm gate, as "Noticed", never on an entity's row (money-checks R9–R10; K1491, K1504). Contract-time elapsed vs reported percent complete (CoST's example, B5 §1.5 (b)) is a `calculations` recipe, not a flag.

### 6.5 How purpose-guided reading handles procurement without a reader per variant

The answer to the scope's last question. A procurement document is read in six steps *(design; each step names the substrate it uses)*:

1. **It arrives with its purpose.** It was sought by a plan step or a gap ("the contract, to fix contract time and LD rate"), or it came in by sweep or doorbell. The purpose travels with the capture request (`capture-requests` already carries `purpose` and `lead_inquiry`, M2 §3.4) and is the "why held" READING is told (G3).
2. **Its kind is proposed, then recorded by placement.** The recogniser proposes a pack kind with a confidence word (`certain` … `none`, site-profiles R4 in M3). The member records the kind and the purpose in one act: **placing the document at a stage of the contract's declared flow** (progressions `threadInstance`, which also checks the document resolves to the contract entity). The stage *is* the document's role in the investigation; no new "purpose" field is needed for procurement *(inference; C3 §0 names the stage as the nearest construct)*. A document of no known kind stays `generic`, and READING may propose a new pack entry from it (B4 lesson 6), which a member approves into the group library.
3. **READING reads for the purpose first.** The kind's field descriptions plus the plan step's question tell the reader what to look for; it reads structure first and quotes before it proposes (B4 lessons 7, 10). Extraction is targeted, as K1468 requires: the fields the investigation needs, not every field.
4. **It proposes rows into owner modules** through the path of §6.3, each with extent and quote. Exhaustive kinds (every change order in a log, every bidder in a tabulation) go through split-map-reduce, reported as N instances of one proposal (B4 lesson 9; C2 §1.2).
5. **The member adopts**, singly or in bulk; the record keeps that each row began as a machine proposal (DEC-101 in D1).
6. **A recurring kind with a stable layout earns a deterministic reader**, written from measured pages (C3 inv. 4) and approved like a reading profile (K1627's "a recurring kind earns an approved reading profile", C6 G4): for example a district board portal reader on the `legistar-reader` pattern, or a bid-tabulation table reader on the `budget-doctypes` pattern (M3 §2.8, §2.10). Until then, AI proposals carry the load.

**Why variants need no new readers.** The variation between districts is in wording, forms and layout; the variation between delivery methods is in which stages and documents exist. The first is profile vocabulary and a schema's field descriptions (what a "notice of completion" is called locally; DSA form numbers); the second is a different declared flow. Neither changes what a field means, so one kind entry serves every variant *(inference from B4 §1.3: one neural model for "the same information, but different page structures")*. Grades stay honest throughout: an AI reading is a weakening `ai(fn, version)` step, at most B, never a machine attestation (text-chain R13, extraction R42 in M3; DEC-75 in D1).

### 6.6 One composite read: baselines and slip

An `explore` preset `baselinesOf({project | contract, at})` (explore R10 presets, built, M1 §1.13), writing nothing, returning for one contract or project: up to four baselines (the commitment standard, the board-approved schedule, the contract's completion duty, the baseline schedule), each with its source and grade or "undetermined, because not held"; the `forecast` series in report order; change-order time extensions; the completion duty's occurrence state as known on each day (duties R13–R14). It never says "late"; overdue is "a question, never a violation" (duties R11). It is the input to criteria/condition (DEC-77's ruled form) and to the windows method (B5 L7).

### 6.7 Contractor history

By member act and standing named request first: capture licence, registration and debarment pages and other agencies' award items; lines `contracts_with`, `successor_of`, `party_to` adopted from proposals; the licence number as an identifier scheme in the profile, which lifts resolution to grade A (entities R43 in M4). Later, a `contractor_register` doctype per register (on the `court-doctypes` pattern, M3 §2.9) whose rows carry source ids and may be machine-written. Patterns ("N of M of this contractor's contracts completed late") are an ungated `freezeSet` calculation with its denominator (calculations R21, M4 §5 item 12); detectors stay gated. Paid or login-gated registers only by a member's own act (K1492 in C6; capture-requests R46 in M2). No score on the contractor (people R29; money-checks R14).

### 6.8 Where it sits

| element | module | layer | kind of change |
|---|---|---|---|
| amendments §6.2 | standards, events, money, entities, progressions | 5 | requirements in existing modules |
| | civil-time, jurisdictions | 1 | requirements in existing modules |
| proposal path §6.3 | events, lines, money (+ queue producer) | 5 (11) | new acts in existing modules |
| pack §6.4 | data: Civicsmith library + group library + profile entries | data | none in code beyond a loader *(owner to be chosen with PLANNING and READING)* |
| baselines read §6.6 | explore | 5 | a preset |
| detectors §6.4 (e) | money-checks, progressions, calculations | 5 | definitions as data under the existing gate |
| contractor registers §6.7 | a new doctype set beside court-doctypes | 1 | a reader, later |

No new module and no layer change.

### 6.9 Deliberately left out

- **A procurement owner module** (Option C): duplicates five owners (§5).
- **CPM schedule analysis**: members need windows, not critical paths (B5 §1.3); a professional's analysis enters as a document.
- **Percent complete as a field**: it is a stated claim, held as a quote or a dated fact, never computed.
- **Scores or rankings of contractors or bids** beyond a ranking by one stated quantity (calculations R17; DEC-89).
- **Machine-chosen explanations**: the library suggests, members hold hypotheses; causes publish only when evidenced (DEC-84 (10)).
- **Unattended register crawls** of a contractor's principals (monitoring R15 in M3; K1492).
- **OCDS import** until a publisher in scope publishes it (Option D, later).
- **Legal advice**: delay doctrine (excusable, compensable, LDs, *Opinski*) appears only as cited standards, "legal information, not legal advice" (C5 §2).

### 6.10 Grandview through the design (short; figures illustrative)

The member's words open a project and an inquiry (HOME). PLANNING proposes the S1 clarifying questions and, from the pack, the design-bid-build flow, the disclosure checklist and five starter explanations; the member adopts the flow and two hypotheses. Captures of the bond page, the award item and the CBOC reports arrive; each is placed at its stage; READING proposes the award event, amount and bidders; the member adopts. The flow shows `contract` and `notice_to_proceed` documents missing; reactive items become drafted records requests. When the contract arrives, its completion clause becomes a `contract` standard and a duty from the notice to proceed; each CM report adds a `forecast`. `baselinesOf` then shows: "promise: one school year (member's account, grade D, source not yet found); contract time: 540 days from NTP (contract §3, grade B); first forecast slip: March report". The change-order detector raises "Noticed: change orders 14% of award; PCC 20118.4 limit 10% (cited)". The member decides what it means.

## 7 · Staging

Smallest useful step first. Each acceptance test is in a member's terms.

| step | what is delivered | acceptance test (member's terms) |
|---|---|---|
| **P1 · Pack v0, no code** | the design-bid-build and services flows as progression templates with construction stages; the document-kind catalogue and disclosure checklist as a Civicsmith library entry and a "Follow a public contract" wizard script (DEC-120: runs with no AI) | "I adopted the flow for the Grandview contract, placed the six documents I had, and the page told me the contract and notice to proceed were missing and drafted a records request I could edit and send." |
| **P2 · Vocabulary amendments and first profile** | §6.2: `contract` standard kind, `forecast` and `completion`/`notice_to_proceed`, `offered`, `project`, duration commitments, school calendar; a school-district and state-agency profile, and a second non-Oakland profile in tests (C1 D31) | "I entered the contract's completion clause once; the due date was computed from the notice to proceed with its derivation shown, and each status report's forecast date appears as a series under it." |
| **P3 · Proposals from documents** | §6.3 path for events, lines, money facts; READING proposes from the pack's kinds (needs a deployed reading mode, M2 §3.2's chain) | "I asked the assistant to read the award item; it proposed the award, the amount and the four bidders, each with the quote it came from; I accepted three and declined one with a reason." |
| **P4 · Baselines read and checks** | `baselinesOf`; detectors and junction checks with cited thresholds, through the false-alarm gate; `reevaluation` R34 | "The project shows the promise, the contract time and the forecast series side by side; a Noticed item tells me change orders passed the share the statute names, and I can open the change orders behind it." |
| **P5 · Contractor registers; OCDS** | register doctypes; identifier-backed machine rows; an OCDS reader for publishers that publish | "I added the contractor's licence number once and the record showed its licence status, its other public contracts and a lawsuit, each cited." |

P1 is usable on the substrate as built, by members alone, and is the no-AI floor the product requires (K1547 in C6; DEC-120). P3 depends on the deployment chain (`check` verified live, then `investigate`, then `extract`; M2 §3.2) and on READING's and LOOP's designs.

## 8 · Decisions for Bob

Only policy, requirements, architecture and UX; the rest is BOB's (CLAUDE.md, P17).

1. **Is a contract a standard?** Requirement: add `contract` to the kinds of standard, so a contractor's obligations are measured against the contract's own clauses and a district's public promise stays a separate `commitment`. *Recommend yes*; Capability Ladders N11 already says contracts are standards (C5 §1.6).
2. **Does Civicsmith ship investigation knowledge as an approved library?** Policy: a Civicsmith-authored pack (document kinds, flows, checklist, explanation library, red-flag definitions), approved by Bob, extendable by each group under a project owner's approval, never saying what to conclude, on the wizard-script model (DEC-121). *Recommend yes*, with procurement as the first pack.
3. **Which jurisdictions first?** Requirement: extend the profile to a school district and the state school-construction bodies (design review, state funding, contractor licensing, wage registration) so Bob's own case can be run end to end. *Recommend yes*, S1 as the first acceptance case, with a second state in tests.
4. **How the answer shows "late".** UX: every schedule answer shows the baselines side by side (promise, approved schedule, contract time, baseline schedule), each with its source or "not found", and never one "late" verdict. *Recommend yes* (B5 L6; DEC-82's "never one score" in D1).
5. **Red flags on contractors.** Policy check, not a new ruling: confirm that K1491's machine "Noticed" checks extend to procurement detectors on organisations (contractors, districts), with thresholds always cited and never shown on the organisation's own page. *Recommend confirming* as stated in money-checks R9–R10.

## 9 · Interfaces with the other capabilities

| capability | what PROCUREMENT gives | what PROCUREMENT needs from it |
|---|---|---|
| **READING** | the kind catalogue (purposes, field descriptions, owner targets, cautions); recognition vocabulary; the rule that a recurring kind earns a measured reader | the purpose-guided reading run itself; structure-first reading of long PDFs (G12); proposals with extent and quote; whether an adopted plan step counts as "a member's request" under K1468 |
| **PLANNING** | declared flows whose missing stages are gaps (intent's satisfaction condition already reads progression instances, M1 §1.11, so the pack makes `intent` usable for procurement without changing it); the disclosure checklist; the explanation library with "would show in" kinds | the plan object that records each step's purpose, so "why held" reaches READING; hypothesis suggestions within K1473 |
| **HOME** | the progression instance as the procurement spine of the project's timeline; stage placement as the document's role; `baselinesOf` for the project view | the project as home (K1627), holding the `project` and `contract` entities and their flows |
| **LOOP** | the list of row kinds that need the §6.3 path; bulk adoption for tabulations and CO logs | the proposal tray, adopt/decline acts, acceptance-rate measure, queue items as one finding with N instances |
| **COST** | targeted extraction by kind (only needed fields); split-map-reduce only for exhaustive kinds; deterministic readers where volume earns them | per-member budgets for reading long contracts and logs; OCR's cap and the no-funding rule (DEC-74) |

## Sources opened

All read whole, first line to last:
- `study/investigation/RESUME.md`, `PROTOCOL.md`, `prompts/A-PROCUREMENT.txt`, `STATE.md`.
- `notes/P0.md`, `notes/C1.md`, `notes/C2.md`, `notes/C3.md`, `notes/C4.md`, `notes/C5.md`, `notes/C6.md`, `notes/D1.md`, `notes/D2.md`, `notes/M1.md`, `notes/M2.md`, `notes/M3.md` (1–516, in two ranges), `notes/M4.md` (1–440, in two ranges).
- `research/B1.md`, `research/B2.md`, `research/B3.md`, `research/B4.md`, `research/B5.md`.

Not opened: the product tree itself (claims about it are taken through the notes, which cite the product); `prior/constructs-study-synthesis.md` (read through C6).
