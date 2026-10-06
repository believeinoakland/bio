# A-READING · Reading a document with purpose

Unit A-READING, phase 2 (`PROTOCOL.md` §A). Capability: the researcher is told why a document is held (its role in the investigation), identifies what kind of document it is, studies its structure (sections, TOC, tables), reads deeper and deeper, extracts content, and develops meaning and connections, proposing facts a member accepts; a recurring kind earns an approved reading profile (`RESUME.md`, Bob 2026-10-06; K1627).


All sources named in `PROTOCOL.md` §A were read whole (see `## Sources opened`). Citations: `notes/<id>.md §n` and `research/<id>.md §n`, and through them the product (`build/requirements/<module>.md Rn`, `path §section`). Status words follow PROTOCOL rule 3 (**built**, **specified**, **planned**, **absent**); "built (T33)" means merged on `tranche/T33` at the study's pin, not yet on `main` (`notes/M3.md` §5 item 12; `notes/M4.md` §5 item 10).

**The capability in one paragraph.** A member holds a document because the investigation needs something from it: the contract for its completion date and its liquidated-damages clause, a change order for its days, dollars and stated reason, a monthly report for its forecast date. Reading with purpose means the researcher starts from that reason, works out what kind of document it is, maps its structure, reads only as deep as the purpose needs, and comes back with **proposed facts**, each pinned to a verbatim passage, that a member accepts into the record. When the same kind keeps arriving, the way of reading it is written down once, measured and approved: a **reading profile**. Everything below is about doing that inside the product's doctrine: the machine looks, the member concludes (`notes/C1.md` §2 D1–D2).

## 1 · The need

### 1.1 What the scenarios ask of reading

The problem set names reading with purpose as a recurring need in its own right: "Know a document's *kind* and *why it is in the file* before reading it: a bid tabulation is read for bidder count and spread; a contract for completion date, LD rate and extension clauses; a CO for days, dollars and reason; a CM report for its forecast date; a Form 460 for contributor, date, amount; a permit for conditions; an agenda for its posting time and item wording. Many documents are long, scanned, tabular or spread across attachments" (`notes/P0.md` §2, row "Reading with purpose"). Its second observation follows: "Document kinds are finite and repeat across domains … 'Reading with purpose' can be grounded in a catalogue of kinds, each with what to extract and why" (`notes/P0.md` §2, observation 2).

| scenario (`notes/P0.md` §1) | documents read | read for (the purpose) | what makes it hard |
|---|---|---|---|
| S1 Grandview rebuild | bond measure and project list; board award item; bid tabulation; executed contract; notice to proceed; baseline and updated schedules; change orders and ratifications; monthly CM reports; CBOC minutes and audits; DSA tracker; CSLB and DIR records | the binding schedule (O1), actual progress and forecast (O2), causes of the gap (O3) | the promise may sit in a mailer, not a contract; schedules and CM reports come by records request, often scanned; change orders arrive as consent-calendar attachments in board packets |
| S2 sewer fees | ACFR fund statements; adopted budgets; cost-allocation plan; auditor follow-ups | fund transfers by label and year | labels change between years; 180-page PDFs (`notes/C1.md` §1.3) |
| S3 emergency contract | emergency declaration and renewals; contract scope and deliverables; invoices; Form 990 | deliverables vs payments | invoices redacted; deliverables buried in an exhibit |
| S6 promised units | conditions of approval; development agreement; MMRP; regulatory agreement | each binding condition, its trigger and enforcer | conditions spread over many approvals |
| S8 donor and vote | Form 460/497; Form 700; agenda item, minutes | contributor, date, amount; the vote | entity resolution across filings |
| S9 recycling yard | permit to operate; deviation reports; NOVs | permit conditions and deadlines | five agencies, five formats |
| S11 bus line | FFGA; PMOC monthly reports | baseline vs each forecast | the S1 pattern at scale, monthly over years |
| S14 school closures | agendas with posting time; late writings | timestamps and item wording | the fact is in the metadata, not the text |

### 1.2 What a reader must do, step by step (Bob's words as requirements)

Bob's description (`RESUME.md`) gives the steps; the scenarios give each its test.

| step | Bob | what the scenarios demand |
|---|---|---|
| R1 purpose | "what is the reason that that document is in the case file?" | a document is read *for* an objective and a question (S1 O1–O3); the same contract is read twice, once for the schedule, once for the change-order clause |
| R2 kind | "Oh, so it's an invoice. Or it's an RFP." | finite, recurring kinds (P0 observation 2), but compound files: a board packet holds a staff report, a resolution, a bid tabulation and a contract (`notes/C3.md` §4 item 3) |
| R3 structure | "The section of an invoice. The TOC of an RFP." | contracts of 100+ pages; reports with standard sections; tables (bid tabs, change-order logs, schedules of values) |
| R4 depth | "explore deeper and deeper" | read only the parts the purpose needs, but say what was not read |
| R5 extract | "extract content" | dated facts, amounts, parties, durations, clauses, each with its passage; scanned pages (S1, S3) |
| R6 meaning and connections | "develop meaning and connections about what it says" | the contractor here is the contractor in CSLB, DIR and other districts' minutes (P0 §2 "Linking"); this change order amends that award; this report's forecast moved from the last one |
| R7 member accepts | "the machine proposes and a member accepts" | per fact, cheaply, with the passage in view |
| R8 profile | K1627: "a recurring kind earns an approved reading profile" | the S1 kinds recur in S3, S7, S11 and in every district; a profile written once serves every later contract |

Two further needs come from the problem set's observations. **Absence is a result**: a contract with no liquidated-damages clause, a status report with no forecast date, a missing report in a monthly series are findings or leads (`notes/P0.md` S1 "Dead ends"; `research/B1.md` §1.1 "If there's no report, that's a story"). And **the member reads too**: the problem set's members are a parent with "a few hours a week" (`notes/C1.md` §1.2, DR2), so a reading method must also work without AI (`notes/C6.md` G11; `notes/D1.md` DEC-120).

## 2 · Best practice that applies

### 2.1 Practitioners read for a purpose, and know the document before they read it

- **The reader in the incident room.** The UK major-incident room separates a *receiver* (reads every incoming document, decides whether fast-track actions are needed, marks content to index), a *reader* (reads every document in detail, summarises, marks text for indexing, "raises further actions from what it says") and an *indexer* (one entity, one record) (`research/B2.md` §1.1, MIRSAP roles). Lesson 2 of B2: "know why the document is in the file, read it in full, mark what matters, extract the entities … and *raise actions from what it says* … An AI reader should do these as separate, recorded steps" (`research/B2.md` §4 L2).
- **Obtaining is not understanding.** "Obtaining a document is not the same thing as understanding it": find an interpreter of its language; decode the codes and acronyms, which "can be the story" (`research/B1.md` §1.1 backgrounding; §1.2 Segnini; §4 L12).
- **What a document says is not what is true.** Bellingcat's hearsay rule and its split between *examinable* and *descriptive* content: a status report proves the district *reported* a date, not that the date was real (`research/B1.md` §1.2, §4 L8). The procurement grand juries found official status reports understating spending and change orders entered at zero cost: "the official status report is a *claim to be checked*" (`research/B5.md` §3 item 3, L9).
- **Extracts stand alone.** Intelligence reports are written to 5WH, "understood without the need to refer to other information sources", one matter per report, with how the source came to know it graded separately from the source (`research/B3.md` §1.5, 3x5x2; §4 L6, L8). Pirolli and Card's *evidence file* is snippets extracted from the *shoebox*, each traceable to its item (`research/B3.md` §1.4).
- **Expert schemas notice absence.** Experts carry domain schemas "into which incoming information is re-represented", and "it can actually be the lack of expected features of a situation that can trigger sensemaking" (`research/B3.md` §1.4; §4 L17). Heuer: "If this hypothesis is true, what should I expect to be seeing?" (`research/B3.md` §1.3).
- **Domain document typing exists.** OCDS types every procurement document by an open `documentType` codelist (tenderNotice, biddingDocuments, evaluationReports, awardNotice, contractSigned, contractSchedule, physicalProgressReport, completionCertificate …); OC4IDS adds project-level kinds and `modifications[]` with type, date, rationale and old and new values; CoST lists 40 proactive and 26 reactive items (`research/B5.md` §2.1–2.2; L1, L3). B5 §1.1 maps each stage of a California school rebuild to its documents and "what in it matters to an investigator", which is in effect a first draft of the reading profiles S1 needs.

### 2.2 How production systems read documents

- **Classify, route, extract, review.** Industrial document processing identifies the document type "before invoking the extraction model", splits multi-document files into typed page ranges, and routes each to a per-type schema (`research/B4.md` §1.3, Azure). A low document-type confidence "means the document differs from what the model knows", which should trigger schema discovery, not forced extraction (`research/B4.md` §1.4, §4 L6).
- **A new kind is a described schema plus a few examples, verified by people.** Google's custom extractor runs zero-shot "after labeling a single document", then auto-labels for a person to verify, then fine-tunes from about ten examples; "field names are semantically critical" and descriptions carry "location information and text patterns" (`research/B4.md` §1.3). Azure needs "five examples of the same form" (same). This is the industrial form of Bob's "recurring kind earns an approved reading profile" (`research/B4.md` §4 L8).
- **Structure first, then targeted lookup.** Flattening a PDF loses page, section and table questions; giving the model the document's structure and `fetch_pages`, `fetch_sections`, `fetch_table` tools fixes many (PDFTriage). ReadAgent reads by gists with look-ups to the original pages; RAPTOR summarises in a tree and retrieves at the level the question needs; Docling recovers layout, reading order and tables before any reading (`research/B4.md` §1.3; §4 L7). This is "the TOC of an RFP" made concrete.
- **Exhaustive questions need split-map-reduce.** One call over a long document misses instances ("every change order"); DocETL splits, maps, resolves and reduces; Evaporate discovers a collection's attributes, then extracts them by model or by model-written code, at 110x fewer tokens (`research/B4.md` §1.3; §4 L9, L25).
- **Quote first; retract what cannot be quoted.** Put the document first and the question last; extract verbatim quotes, then reason only from them; "If it can't find a quote, it must retract the claim"; API-level citations guarantee valid pointers; scanned pages without a text layer cannot be cited (`research/B4.md` §1.5; §4 L10, L18, L23).
- **Measured failure.** Generative search had full citation support for 51.5% of sentences; "even the best models lack complete citation support 50% of the time"; over 57% of deep-research source errors arise early and cascade (`research/B4.md` §1.5). Model confidence is overconfident; reviewers over-rely, and explanations reduce over-reliance "only when they lower the reviewer's cost of verifying" (`research/B4.md` §1.4). The product's own canon records measured extraction ceilings: contract-obligation extraction "at best 70.56%", guideline-driven LLM event extraction ~42 F1 behind supervised systems, temporal taggers ~70–78% (`notes/C5.md` §1.1, §1.2, §1.4).
- **Fetched documents are untrusted data.** Indirect prompt injection "blur[s] the line between data and instructions" (`research/B4.md` §3; §4 L21).

### 2.3 What practitioners do with machine reading at scale

Technology-assisted review is the closest professional precedent: the lead attorney defines the scope of relevance before the machine is trained; documents the software cannot read (images, very long or short text) "should be tracked, and if necessary, sent through an alternate review workflow"; exclusions are recorded; quality is validated by sampling; context-dependent calls (privilege) stay human (`research/B2.md` §1.2; §4 L13). For a reading engine this says: the *purpose* plays the role of the relevance scope; unreadable parts are listed, never silently skipped; acceptance is sampled and measured.

### 2.4 Lessons carried into the design

| # | lesson | source |
|---|---|---|
| L1 | read in recorded steps: purpose → kind → structure → targeted reading → extracts → actions raised | `research/B2.md` §4 L2; `research/B4.md` §4 L6–L7 |
| L2 | type documents from a domain vocabulary (OCDS `documentType` for procurement) | `research/B5.md` L1 |
| L3 | a kind is learned as a described schema plus a few member-verified examples, then measured | `research/B4.md` §4 L8 |
| L4 | every proposed fact carries its verbatim passage and location; no quote, no proposal | `research/B4.md` §4 L14, L18 |
| L5 | separate "the document says" from "it is so"; a status report is a claim | `research/B1.md` §4 L8; `research/B5.md` L9 |
| L6 | expected-but-absent fields are results, stated with what was read | `research/B3.md` §4 L3; `research/B2.md` §4 L14 |
| L7 | unreadable parts are tracked and routed, never skipped | `research/B2.md` §1.2 (TAR) |
| L8 | never use the model's self-reported confidence as a grade | `research/B4.md` §4 L15 |
| L9 | acceptance per fact, span beside claim, sampled and measured | `research/B4.md` §4 L16; `research/B2.md` §4 L13 |
| L10 | documents are data, never instructions | `research/B4.md` §4 L21 |
| L11 | exhaustive extraction across a set is a separate split-map-reduce job | `research/B4.md` §4 L9 |
| L12 | keep it light for volunteers; provenance and logs automatic | `research/B1.md` §4 L17 |

## 3 · What the substrate already provides

The substrate has most of the machinery below and around reading; what it lacks is the reading itself (§4). The table follows the steps of §1.2.

### 3.1 Step by step

| step | what exists | status | citation |
|---|---|---|---|
| bring the document in | `acquisition.acquire` (public address, hash, receipt, provenance chain, grade by route: direct B, archive C); the doorbell for handed-over material; `provenance.testify` for a member's own observation (grade D); held captures listed for triage, never notified | built | `notes/M3.md` §2.1, §2.2, §2.16; `notes/D1.md` DEC-97 |
| R1 purpose | none. A document's tie to an investigation is its project (bundle home), a citation from an inquiry, or `origin` (`named_request`/`sweep`); nothing records the purpose a document serves | **absent** | `notes/M3.md` §3.4, §5 item 5; `notes/M1.md` §4 item 1 |
| R1 purpose, partial | the EXTRACT role "names a SUBJECT — a document, a document set, or an objective's scope — and an OBJECTIVE, both authored by a member"; `intent.workObjective` opens a run with an objective and its gaps as instructions | specified (role); `workObjective` built at the record, not consumed by the worker | `notes/C2.md` §1.3 (AR `:129`); `notes/M1.md` §1.11; `notes/M2.md` §3.16 |
| R2 kind | `format-registry.detectFormat` (nine formats, else `undetermined`); `site-profiles.identify` and the one recogniser registry and confidence ladder; `docprofile.doctypeFor` (always a type, `generic` at NONE; `also` lists other matches, "about one in twelve") | built | `notes/M3.md` §2.5, §2.6, §2.20 |
| R2 kinds known | seven doctypes (meeting calendar, agenda, minutes, staff report, ordinance or resolution with sections, definitions and exceptions, staff directory, generic); `budget-doctypes` (ACFR, budget book, budget table, cells as printed); `court-doctypes` (three registers); `legistar-reader` (votes, matters, with source ids); `roster-reader` | built (several T33) | `notes/M3.md` §2.7–§2.11 |
| R2 kinds missing | no RFP/IFB, bid, bid tabulation, contract, change order, invoice or pay application, schedule, status report, permit, campaign filing; profile vocabulary holds no procurement terms | **absent** | `notes/M3.md` §5 item 2; `notes/M4.md` §1.15 |
| R3 structure | PDF: pages, text with named undetermined causes, images with rects, links, page boxes; DOCX: paragraphs and tables, tracked changes, comments; XLSX/CSV: typed cells with formulas; regulations: section tree with extents | built | `notes/M3.md` §3.2 |
| R3 structure missing | PDF outline (`/Outlines` not read), headings, PDF tables outside finance (M-55 NO-GO), DOCX heading levels, positional text (REC-206); no logical-section extent | **absent** | `notes/M3.md` §2.18, §5 items 3–4; `notes/C3.md` §3 (a) |
| R4 text | tier ladder: format entry → `pdf-worker` → `ocr-worker` (tesseract, cap C, 24 calls); every unread page named, never an empty document; text units per page, paragraph, slide or sheet range with extents | built | `notes/M3.md` §2.13, §3.1 |
| R4 reading ops | `content.passageText` (text at a row's extent); `extraction.unitsOf` (text units with extents); `retrieval` `passage:` search and `contentAxis`; `extraction.documentsByReference` (every held document carrying a reference such as a file number) | built | `notes/M3.md` §2.12, §2.14; `notes/M1.md` §1.15 |
| R4 reach of a run | a run's sub-sessions read only extracted rows through `op=meaningrows` (≤50 a call) and return a ≤500-character report; "none of [the run's ops] returns document bytes" | built (fence) | `notes/M2.md` §3.5 (agent-worker R17, R37) |
| R5 extract, deterministic | content types' readings: entities and facts placed only where `locate` says; references carried as they appear | built | `notes/M3.md` §2.12, §3.3 |
| R5 extract, machine proposal | `EXTRACT_FUNCTIONS = propose-reading`; a proposed reading's grade is computed (kind and key B, label C), never offered, never above B; an `ai(fn, version)` step joins the chain; `extractPropose` stores proposals labelled machine work within a `mints` bound | built but unreachable: mode `extract` not deployed; "The ASSISTANT half is ABSENT" | `notes/M3.md` §2.12; `notes/M2.md` §3.3; `notes/C3.md` §1b (§14.5) |
| R5 passages | content rows with mint labels `member_marked`, `plane_minted`, `machine_marked` ("part of a finding only when a member cites it"); eight extent kinds; member transcription and second-member attestation; `passageNotice` for a newer capture | built | `notes/M3.md` §2.14 |
| R5 grades | the transcription chain only weakens; an unmeasured step's cap is UNDETERMINED (DEC-75); "a number is only a number when a classic engine computed it" (model confidence refused); `calibration` holds engine fidelity, no model engine registered | built | `notes/M3.md` §2.15; `notes/M2.md` §3.11; `notes/D1.md` DEC-75 |
| R5 targeting | K1468: extraction "only at a member's request for a basis or claim, or by a member's act scoped to a body and period; never a sweep"; the after-read hook (`reading-pipeline` R25–R27) lets a later module act when a capture class is read | doctrine ruled; hook built (T33) | `notes/C5.md` §2; `notes/M3.md` §2.13 |
| R6 meaning: where facts go | `events.recordDatedFact` and `createEvent` (award, signing, payment, issuance …; relations `amends`, `authorises`, `stated_cause`); `money.recordFact` with `committedAgainstPaid` over award and change orders; `lines` (`contracts_with` with OCDS roles); `duties` with `commitment` basis and recorded transitions; `standards` kind `commitment`; `entities.resolve` and `testify` | built (T33) | `notes/M4.md` §1.1–§1.13, §4 |
| R6 machine → world fact | propose/adopt exists for duties (R2), standards (R9–R10), themes, money *sets*; events, lines and money facts accept a machine write only when source identifiers join both ends; otherwise a member's direct act | partial | `notes/M4.md` §5 item 1 |
| R6 connections | entity resolution graded A–D; co-mention connections; `explore` across owners; `contradiction.pairs` (K4 one entity two sources; K6 two amounts, withheld until measured); `progressions` declared flows with missing, overdue and out-of-order findings | built | `notes/M1.md` §1.5, §1.13; `notes/M4.md` §1.3, §1.7 |
| R7 acceptance | the PROPOSAL shape (adopt, defer with reason, dismiss with reason; nothing adopted automatically); DEC-77 "ACCEPTING A PROPOSAL" with acceptance rates measured, introduced for contradictions first; DEC-95 six guards for suggestions; queue FINDING items leave only by recorded disposition | built (queue, contradiction); doctrine for the rest | `notes/C2.md` §1.2; `notes/D1.md` DEC-77, DEC-95; `notes/M1.md` §1.17 |
| R7 review surface | "the review surface presents the source material itself, never only an AI summary" | doctrine | `notes/C4.md` §2 D8 |
| R8 profiles | the recogniser registry ("a new content type … costs one recogniser and one registry line"); every reader "written from a measured page" (invariant 4); `calibration` for fidelity; wizard-script libraries governed like filing templates, "a machine never approves" (DEC-121); the skills pack's disclosed layers, versioned and recorded on each run but quoting canon only (skills R21) | built (registry, calibration, wizard-scripts); no reading-profile construct | `notes/C3.md` §1 (§4, §9), §2; `notes/D1.md` DEC-121; `notes/M2.md` §3.9, §3.14 |
| looking recorded | observation log at four levels with `LOOKED_ABSENT`, `partial`, `PRESENT`; `retrieval.frontier` lists captures never read and references never matched | built | `notes/M2.md` §3.12; `notes/M1.md` §1.15 |
| non-AI path | wizard scripts run "with no AI and no key"; "Your first question" wizard has "Point at the passage that matters"; member `narrow`, `transcribe`, cite with extent | built (engine); scripts unwritten | `notes/D2.md` §1.4; `notes/M2.md` §3.14 |

### 3.2 How an engine would use it as is

Without new construction, an engine could do this much for S1. A member captures the contract. `docprofile` calls it `generic` at NONE (`notes/M3.md` §3.1). The tier ladder gives page text. The member, guided by a wizard script, finds the "Time of Completion" article, marks the passage (`member_marked`), and records: a `signing` event; a duty with `commitment` basis (contractor as obligor acting for the district, enforcer the district office); and money facts for the contract sum (`notes/M4.md` §4 rows "contract", "promise"). A `check` run can then re-read the question's basis against the record (`notes/M2.md` §1.1). That is a manual reading with good provenance. The machine cannot help yet. No deployed mode reads a document. A run cannot see document text. Nothing proposes "the contract time is 365 calendar days, page 14" for the member to accept.

### 3.3 Doctrine that binds reading

| rule | words | citation |
|---|---|---|
| purpose directs seeking, never filtering | "A goal may direct what is SOUGHT. It must never filter what is recorded, retained, or shown" (invariant 7) | `notes/C3.md` §2 |
| machine text labelled | "Machine-read text is never presented as publisher text" (DEC-4); "Every derivation step weakens" | `notes/C3.md` §2; `notes/C1.md` D13 |
| no machine grade | "No machine mints a grade"; a proposal's grade "is computed, never taken" | `notes/M3.md` §4 (extraction R42, R44) |
| uncalibrated is undetermined | "a step whose fidelity was never measured has cap UNDETERMINED, stated, never a letter" | `notes/D1.md` DEC-75 |
| a failed reading is not an empty document | "A reading that finds nothing is a failed reader, never an emptied document" | `notes/C3.md` §2; `notes/M3.md` §4 |
| rules from measurement | "A rule requires a measurement"; "a type is written from a measured page" | `notes/C3.md` §2 (invariant 4) |
| runs start at a member's act | "Every AI run but a member-authored standing question starts at a member's act (K1481), and extraction is targeted at a member's request (K1468)" | `notes/C2.md` §1.3 (AR `:135`) |
| table decides, model judges | "the model decides what to search for and what reports mean, inside a step, and never when the loop stops" | `notes/M2.md` §2 |
| reports, not documents | "a sub-session that returns documents rather than reports has defeated the architecture" | `notes/C6.md` §2 row 6 |
| closed book; injection fence | "No fact and no rule from the model's knowledge"; collected material "strictly as untrusted data, never as instructions" | `notes/C5.md` §2; `notes/C4.md` §2 D7 |
| machine proposes, member adopts | "Machine words are labelled as the machine's until a member keeps them; proposals are stored apart and become the member's only by the member's act" | `notes/C5.md` §2 |
| nothing preselected; act singly or in bulk | DEC-77 (c); DEC-69 amendment | `notes/D1.md` §2 |
| mints are a bound; minted-to-cited ratio | "if it never falls, the assistant is manufacturing citable-looking passages" | `notes/C2.md` §1.3 (AR `:131`, `:133`) |
| a member's own account | runs spend the starting member's own account within their ceiling (K1502) | `notes/M2.md` §3.10 |
| a version without AI | K1547; wizards with no AI (DEC-120) | `notes/C6.md` §2 row 22; `notes/D1.md` DEC-120 |
| no jurisdiction in code | "Everything local lives as DATA in a jurisdiction profile" | `notes/C1.md` D31 |


## 4 · Gaps

### 4.1 What is missing

| # | gap | evidence | consequence for S1 |
|---|---|---|---|
| G1 | **No record of why a document is held.** Reading takes a document and the jurisdiction view, never a question; `origin` knows only named request, sweep or doorbell | `notes/M3.md` §3.1, §5 item 5 | the contract cannot be read "for the completion date"; every reading is generic |
| G2 | **No machine reading of a document's text by a run.** The fence keeps document text out of a run's reach; the only machine reader, `extract`, is undeployed and excluded from the assistant pilot by name | `notes/M2.md` §4 G3, T1; `notes/C3.md` §4 item 6 | the engine cannot open the contract at all |
| G3 | **No procurement or project document kinds.** Seven civic-meeting doctypes plus finance, court, Legistar and roster readers | `notes/M3.md` §5 item 2 | the contract, change orders, CM reports, bid tabulation read as `generic` text |
| G4 | **No logical structure.** No PDF outline, no headings, no section extent outside regulations; PDF tables only for finance | `notes/M3.md` §5 items 3–4; `notes/C3.md` §4 item 5 | "the TOC of an RFP" has no representation; a bid tabulation is a page of text |
| G5 | **No proposal path into most world facts.** Events, lines and money facts accept a machine write only with identifiers at both ends; there is "no tray" for a model's reading of a resolution or a bid tabulation | `notes/M4.md` §5 item 1 | an AI that finds "Notice to Proceed: 3 June 2024" has nowhere to put it for the member to accept |
| G6 | **No reading-profile construct.** The registry holds deterministic recognisers; skills layers must quote canon (skills R21); wizard scripts hold steps, not fields | `notes/M3.md` §2.5; `notes/M2.md` §3.9, §3.14 | nothing to "earn" approval |
| G7 | **No home for compound documents.** "The registry cannot say a document is two kinds"; 52 of 600 sampled documents satisfy more than one class | `notes/C3.md` §1b (§16) | a board packet's award item, bid tabulation and contract are one capture |
| G8 | **No measured AI reader.** No model is registered in `calibration`; an AI step's cap is UNDETERMINED until measured | `notes/M2.md` §3.11; `notes/D1.md` DEC-75 | every AI-located fact would carry an undetermined cap unless the design avoids it (§6.3) |
| G9 | **Expected-but-absent fields are not stated.** Absence is recorded per level of search, but no reading says "this contract, sections 1–12 read, states no liquidated-damages rate" | `notes/M2.md` §3.12; `notes/C3.md` §2 (invariant 9) | a missing clause or a missing forecast is lost |
| G10 | **No forecast date and no schedule series.** No dated-fact kind for a projected date; no read of the succession of forecasts across reports | `notes/M4.md` §4 row "status report", §5 item 5 | S1's "when did the district first know?" (`notes/P0.md` S1 Time) cannot be answered from reports |
| G11 | **Image-only pages are capped at C and costly to lift.** External OCR is not funded (DEC-74); records-request productions are often scans | `notes/D1.md` DEC-74; `notes/M3.md` §5 item 7 | scanned change orders and CM reports read at C, and only page by page |
| G12 | **No re-reading when a document changes.** `passageNotice` tells a member a cited passage moved; nothing re-reads a revised monthly report for the purpose it was held for | `notes/M3.md` §2.14; `notes/M1.md` §1.16 (R34 specified) | each month's report is a new reading from scratch |

### 4.2 What exists but does not fit

| # | misfit | evidence | resolution in §6 |
|---|---|---|---|
| F1 | **Recognition is by kind, never by purpose**, and deterministic over bytes and the profile view (docprofile R31). Right for what a document *is*; wrong as the only reader, because purpose decides which fields matter | `notes/M3.md` §2.6, §3.1 | keep `doctypeFor` as the first, cheap step; add purpose-guided reading after it |
| F2 | **"Reports, never documents" vs reading in depth.** The architecture keeps document text out of a run's context; Bob's reader "studies the document" | `notes/M2.md` §4 T1 | read bounded, addressed spans inside a sub-session; return proposals pinned to verbatim quotes, never text |
| F3 | **Targeted extraction (K1468) vs "deeper and deeper".** Extraction only at a member's request for a basis or claim | `notes/C5.md` §4 item 4 | each reading is tied to a member's act that holds the document for a stated purpose (Decision B3) |
| F4 | **`propose-reading` proposes entities and facts "the registered readers did not find" with no field schema and no purpose** | `notes/M3.md` §3.1 (`extractrun.mjs`:104–107) | reuse its store, grade rule and chain step; add profile fields and purpose |
| F5 | **`extract` sits third in the deployment chain** (check → investigate → extract), so purposeful reading waits on `investigate` being verified live | `notes/M2.md` §3.2 | let `extract` deploy apart once `check` is verified, as `plan` and `ask` do (§7, a BOB-level call) |
| F6 | **Readings are kept per capture, not per purpose.** A second purpose reading other sections of the same document has no way to say what the first read and skipped | `notes/M3.md` §2.12 (R23) | each purposeful reading records its coverage (sections read, fields sought) in the observation log |
| F7 | **The doorbell, Drive folders and bulk handover are narrow** (one payload ≤8 MiB; folders refused); ZIP, email and image formats are not registered | `notes/M3.md` §5 items 7–8 | out of READING's scope; HOME and records-request intake (§9) |

## 5 · Options

Each option answers the same question: how does a document held for a purpose become proposed facts a member accepts, and how does a recurring kind become an approved profile?

### Option A · Deterministic readers per kind

Write a doctype for each recurring kind (contract, change order, bid tabulation, CM report, award item, permit, Form 460 …) in `doctypes`, measured on real pages (invariant 4); AI only as today's `propose-reading`.
- **Reuses:** the registry, `doctypeFor`, readings, extraction, the after-read hook.
- **Adds:** one reader per kind per format family; procurement vocabulary in jurisdiction profiles.
- **Doctrine fit:** excellent; deterministic readings may write identifier-backed facts (K1443).
- **Cost and risk:** high and slow. Each reader needs measured pages; school districts' contracts and reports vary by district, construction manager and year (`research/B5.md` §1.1); readers carry no purpose and fail on the unfamiliar. Bob's "unfamiliar document read by its role" is not served.

### Option B · Purposeful reading with reading profiles as data (recommended)

A member's act holds a document *for* a purpose. A bounded EXTRACT run classifies it, maps its structure, reads the sections the purpose and the kind's profile point to, and proposes facts, each pinned to a verbatim passage, into a proposal tray the member adopts from into the owning modules. A **reading profile** is data, not code: the kind's description, recognition cues, expected sections and fields with descriptions and target owners. It is drafted from member-verified readings, measured, approved by a member's act, versioned, and recorded on every reading. Deterministic readers stay first; a heavily used, stable profile may later graduate into a deterministic doctype (Option A as a destination, not a start). The same profile renders as a member's reading checklist when no AI is available.
- **Reuses:** `extract` mode and `extractPropose`; `propose-reading`'s grade rule and `ai(fn, version)` chain step; content rows and mint labels; `docprofile`; `reading-pipeline` text units; `calibration`; observation log; the queue's PROPOSAL; duties and standards propose/adopt; the owners' member write acts; wizard scripts.
- **Adds:** a `reading-profiles` module; a `fact-proposals` module (proposal tray and adoption act); a reading control-flow table and two plane ops for the run; a deterministic structure pass (PDF outline, DOCX headings); one skills layer.
- **Doctrine fit:** strong. It is the EXTRACT role as canon already defines it: a subject and an objective authored by a member (`notes/C2.md` §1.3). Purpose directs seeking only (invariant 7). The machine proposes and the member adopts (CL §10). An approved profile is a published, human-readable method (DR4, DR12; `notes/C1.md` §1.2).
- **Cost and risk:** medium. Risks are hallucinated or misplaced facts (mitigated by verbatim-anchor verification), automation bias at acceptance (mitigated by span-beside-claim and measured acceptance rates), and model cost (mitigated by structure-first, targeted reading).

### Option C · Free-form AI reader without profiles

The model reads any document with the purpose in its prompt and proposes passages and facts. No schema library.
- **Reuses:** as B, minus profiles.
- **Adds:** less up front.
- **Doctrine fit:** weak. Nothing is published as method (DR12), nothing is measured (invariant 4), and there is nothing for a recurring kind to "earn".
- **Cost and risk:** cheap to start, expensive to trust. Output varies run to run, the 50% citation-support failure rate applies unchecked (`research/B4.md` §1.5), and members cannot learn what the reader looks for.

### Option D · Member reading only

Reading profiles exist only as checklists (wizard scripts). Members read and point; no AI.
- **Reuses:** wizard scripts, content marking, owners' member acts.
- **Adds:** profiles as checklists; adoption without proposals.
- **Doctrine fit:** perfect. It is the non-AI floor K1547 asks for.
- **Cost and risk:** zero AI cost. It fails DR2's "a few hours a week" for S1-sized files (a contract, dozens of change orders, two years of monthly reports) and gives up Bob's engine. Kept inside B as its floor and its first step.

| | A deterministic | **B purposeful + profiles** | C free-form | D member only |
|---|---|---|---|---|
| reads the unfamiliar | no | yes, as a generic reading with a draft profile | yes | yes (by hand) |
| reads for a purpose | no | yes | yes | yes (by hand) |
| verifiable proposals | n/a | yes (verbatim-anchored) | weak | n/a |
| recurring kind earns a profile | as code | as data, measured, approved | no | as checklist |
| works without AI | yes | yes (D inside it) | no | yes |
| build size | large, per kind | medium, once | small | small |

## 6 · Recommendation: Option B

### 6.1 The reading, end to end

A reading is one bounded EXTRACT run over **one held document for one stated purpose**. It runs on a deterministic table (§6.4) whose steps are:

1. **Purpose in.** The run's subject is a capture, its objective a *held-for* record, owned by HOME (§9): the investigation home, the question or requirement the document serves, and a one-line role statement. A member writes it, or adopts it from a plan step. If none exists, the run does not start; the reading wizard asks the member one question: "What do you want from this document?" (cf. the ask's one clarifying question, `notes/M1.md` §1.10).
2. **Kind.** First the deterministic chain: `detectFormat`, `identify`, `doctypeFor` with `also` (`notes/M3.md` §3.1). Where a doctype is CERTAIN, its reading is used and the AI reads only for fields the reader does not produce. Otherwise the model proposes a kind from the approved and draft **reading profiles**, or "unfamiliar", as a labelled proposal stating its reasons in words. A model confidence figure is never shown (`notes/M3.md` §2.15, `checkConfidence`). For a compound capture it proposes a **part map**: page ranges, each with a proposed kind (`research/B4.md` §1.3, splitting).
3. **Structure.** Deterministic first: the PDF outline, internal GoTo links, DOCX heading levels, the regulation section tree, sheet names (§6.3 S1). Where those are absent, the model proposes a **structure map** of headings, each anchored to a page and a byte-exact heading string found in that page's text unit. The plane refuses any heading it cannot find there. The structure map is stored as a proposed reading, labelled machine work and not counted as extraction coverage (`notes/C2.md` §1.3, AR `:133`).
4. **Plan the read.** From the purpose and the profile's fields, the model judges which sections to read and in what order (PDFTriage; `research/B4.md` §1.3). The table, not the model, caps how much may be read: the bound `read_units`, plus the existing `mints`, `proposals` and `wallclock` (`notes/M2.md` §3.2).
5. **Read deeper.** A sub-session receives bounded, addressed text spans of the chosen sections through a new op, and nothing else. It returns **proposals**, each with a verbatim quote and its extent, never free text (the "reports, never documents" rule kept: §4.2 F2). Long or repetitive sections, such as a 40-row change-order log, are read section by section and their proposals merged (split-map-reduce, `research/B4.md` §1.3). If the profile's fields are not all found in the sections read, the model may widen to further sections, up to the bound. Sections never read are listed.
6. **Propose.** The proposal kinds:
   - **field values**: a profile field, the quote, the extent, and a target owner act such as a dated fact, event, money fact, line, duty or standard. Values are parsed by deterministic code from the quote, never taken from the model (§6.3);
   - **passages worth citing** (`machine_marked` content rows);
   - **entity mentions** with candidate resolutions, which are C at best on name alone (`notes/M4.md` §1.2);
   - **references to other documents** (an "Exhibit C baseline schedule", "Change Order No. 7"), resolved against held captures through `documentsByReference`, otherwise offered as leads (§9 PLANNING);
   - **expected fields not found**, stated with the sections read;
   - a short **bearing note** on the purpose: what this document states about the question, and what it does not. It is machine work with every sentence bound to a quote, checked by the answer contract's rule that withholds a sentence quoting what was not read (`notes/M1.md` §1.10, `checkAnswer`). It is never a leg and never a finding.
7. **Verify, then submit.** Before anything reaches the member, the plane refuses:
   - a quote not byte-identical to the held text at its extent (`PROPOSAL_QUOTE_NOT_FOUND`);
   - an extent the run did not read (`PROPOSAL_CITES_UNREAD`, the analogue of `ANSWER_CITES_UNREAD`);
   - a field not in the profile in force;
   - any offered grade (`GRADE_OFFERED`, extraction R42).

   An independent re-read (Chain-of-Verification style: the field asked again of the quoted span alone, `research/B4.md` §1.5) marks disagreement as "re-read disagrees" rather than hiding it.
8. **Record the looking.** One observation-log entry per field sought: `PRESENT` with its extent, `LOOKED_ABSENT` in the sections read, or `partial` when sections were left unread (`notes/M2.md` §3.12). Authority is the run, naming the held-for record. Invariant 7 is kept: the purpose chose what to read, and the record says what was not read.
9. **Member accepts.** Proposals reach the queue as **one** Noticed item per reading ("12 proposals from the contract, read for the completion date"), never twelve tasks (`notes/C2.md` §1.2, "one proposal with 58 instances"). The review page shows each proposed fact beside its highlighted passage in the source, never only a summary (`notes/C4.md` §2 D8). The member adopts, corrects, defers or dismisses, singly or in bulk, with nothing preselected (DEC-69, DEC-77 (c)). Adoption performs the owning module's own member act, authored by the member and carrying `adopted_from: <proposal>`. The record keeps that it began as a machine proposal (DEC-101).

### 6.2 What a reading profile is

A reading profile is data that says how to read one recurring kind for the purposes that kind serves. It is held by the new module `reading-profiles`.

| field | content | example (construction contract) |
|---|---|---|
| identity | key, label, version, status (`draft` / `measured` / `approved` / `retired`), library (`civicsmith` or the group's) | `public-works-construction-contract` v3, approved, Civicsmith library |
| kind description | plain-language description; aligned where one exists to an outside vocabulary (OCDS `documentType` `contractSigned`) | "The executed agreement between a public owner and a builder, with its general and supplementary conditions" |
| recognition cues | words, headings, form numbers and layout cues, used by the model and by the member; jurisdiction-specific cues live in the jurisdiction profile, cited (D31) | "Agreement", "Contract Time", "Liquidated Damages", "Notice to Proceed"; a profile-supplied form list |
| expected structure | typical sections, in order, with how to find them | Agreement; General Conditions Art. 8 Time; Art. 7 Changes; Supplementary Conditions |
| fields | for each: key, description, where to look, type (date, duration, amount, party, clause, table), expectation (`always` / `usually` / `sometimes`), target owner act | `contract_time` · "calendar days from Notice to Proceed to Substantial Completion" · duration · always · `duties.propose` (commitment basis, obligor the contractor, enforcer the owner office) |
| purposes served | the questions this kind usually answers, linking it to PLANNING's requirements | "the binding completion date"; "who bears delay"; "change-order limits" |
| examples | captures read under this profile whose member decisions form its measurement set | 5–10 contracts from at least two owners |
| measurement | per field: proposals made, adopted as proposed, corrected, rejected, missed (a member added the field by hand); engine identity `reading:<profile>@<version>/<model>` recorded in `calibration` | `contract_time` 9 of 10 adopted unchanged |
| approval | the member act that approved this version, with reason; for the Civicsmith library, the approver Bob names | — |

**The lifecycle:**

1. **Draft.** An unfamiliar kind is read *generically*: structure plus the purpose's own fields, no profile. After a member has adopted facts from two or three documents of the same kind, the machine may propose a draft profile built from what the member adopted and where it was found. This is schema discovery on member-verified examples (Evaporate, Google auto-labelling, `research/B4.md` §1.3). A member may also write a profile by hand. A machine never approves (DEC-121 pattern).
2. **Measured.** Each reading under a draft profile adds to its measurement set. The measurement is the members' own decisions, so it costs nothing extra (`research/B4.md` §4 L17, "member decisions are data").
3. **Approved.** An owner of the project, or the library's approver, approves a version once its measurement set and per-field adoption rates meet the bar BOB sets (§8 B2). Approval names the version; a revision is a new version and re-measures. A worse measurement raises an obligation, as `calibration.compare` does today (`notes/M2.md` §3.11).
4. **Graduated (optional).** When a kind's documents share a stable layout and the profile's cues are deterministic, BOB may write it as a `doctypes` reader from the measured pages. Its readings then need no model, and identifier-backed facts may be machine-written under K1443 (`notes/C6.md` §2 row 14).

**What approval buys** is concrete. The reading is cheaper, because the model skips discovery. Proposals are fewer and more precise, because fields are named and described. The cap becomes measurable: a calibrated profile-and-model engine moves the `ai(read)` step of an *interpretation* from UNDETERMINED to its measured fidelity (DEC-75). Members get a published checklist (DR4). Approval never turns a proposal into a fact; that stays the member's act.

**Two libraries**, as for wizard scripts (DEC-121): Civicsmith's, approved by whoever Bob names and shipped to every group, and each group's own. A group may adopt a Civicsmith profile unchanged, or fork it and approve its own version. Profiles carry no jurisdiction in code; cues and vocabulary from a place are profile data with a source (`notes/M4.md` §1.15, R44).

### 6.3 Grades: why a verbatim anchor matters

Doctrine says every derivation step weakens, and an unmeasured step reads UNDETERMINED (DEC-75; `notes/M3.md` §2.15). If the model's reading were a transcription step, every AI-found fact would carry an undetermined cap until a model was calibrated (G8). The design avoids that by splitting what the model does from what the record stores:
- **The quote is the publisher's text.** The proposed value's quote is checked byte-exact against the held text unit at its extent. Its derivation cap is that text unit's cap (tier 1 text layer, `pdf-worker`, or OCR at C), unchanged by the model, which only *located* it.
- **The value is parsed by code.** Dates go through `civil-time` (EDTF, precision kept); amounts through `calc-grammar.parseFigure` (exact decimals, precision words); durations through a parse of the quote ("three hundred sixty-five (365) calendar days"). Where code cannot parse, the value is `undetermined` and the quote stands (`notes/M4.md` §1.12, §1.16).
- **The interpretation is the member's.** That the quote is *the* contract time, and not a superseded figure or one phase's time, is a judgment on the meaning axis (`notes/C3.md` §1b, §14.2: "Interpreting … is the meaning axis, graded on its own"). The member makes it by adopting. The machine's interpretation is labelled and stays the machine's (DEC-84 (14)).
- **Image-only pages** keep the OCR cap C unless a member attests the passage, which lifts it to B (`notes/M3.md` §2.15). Model-read pixels are a separate question (§8 B4).

So acceptance is cheap to check. The member sees the passage, the value and the field, and judges one thing: does this passage say that? That is the condition under which review reduces over-reliance (`research/B4.md` §1.4, Vasconcelos et al.).

### 6.4 Modules and services

Layer numbers follow `build/layers.md` (`notes/C1.md` §1.6). "New" means a new module, which comes to Bob (`build/layers.md` ruling 5; §8 B6).

| module (layer) | new / changed | responsibility | services and interfaces (one sentence each) | uses |
|---|---|---|---|---|
| `pdf-reader` (1) | changed | read the document outline | `outlineOf(pdf)` returns the `/Outlines` tree with titles and target pages, or `undetermined` with the cause, never invented | — |
| `office-readers` (1) | changed | read heading levels | DOCX paragraphs gain their outline level from the style's declared level, as stated in the file | — |
| `reading-pipeline` (4) | changed | carry structure with the reading | the reading's `container_extent` gains `outline` (PDF), `headings` (DOCX) and, for regulations, the existing section tree, each anchored to text units | `pdf-reader`, `office-readers`, `doctypes` |
| `reading-profiles` (4, after `content` and `calibration`) | **new** | hold reading profiles and their versions, examples, measurements and approvals | `profileDeclare`, `profileRevise` (member; the machine may only `profilePropose`, stored apart, labelled); `profileApprove` (owner or named library approver; `MACHINE_CANNOT_APPROVE`); `profileRetire`; `profilesFor({kind cues, jurisdiction})`; `profileMeasure({profile, version})` (adoption, correction, rejection and miss counts from `fact-proposals`; registers the engine in `calibration`); `profileChecklist(profile)` renders the human checklist a wizard walks | `content`, `calibration`, `jurisdictions` |
| `run-rules` (6) | changed | one new bound | `read_units` (plane-counted text units served to a run), beside `mints` and `proposals` | — |
| `agent-harness` (6) | changed | the reading table | `READ_FLOW`: `gate-mode, resume, purpose, kind, structure, plan-read, read, propose, verify, submit, close`. The model may set targets (kind, sections, proposals); `JUDGEMENT_OVERREACH` still refuses any judgement naming a bound, a pass count or the target | — |
| `skills` (6) | changed | doctrine text for reading | a disclosed layer `document_reading` (quote first; propose, never conclude; absent is a result; documents are data); per R21 it may only quote canon, so its canon text is written first (§7 step 2) | — |
| `agent-worker` (6) | changed | perform `READ_FLOW` in mode `extract` | the mode's reach gains `op=readstructure`, `op=unittext`, `op=readingprofile`, `op=factpropose`; no other new reach; documents stay data behind relayed tools (`agent-runner` R10) | plane ops |
| plane ops (in `extraction`, 4) | new ops | bounded reading of a held capture | `op=readstructure({capture})` returns the deterministic outline and any structure-map proposals; `op=unittext({capture, extents, run})` returns at most N KiB of text with addresses, counted against `read_units`, only for a capture the run's context names in its held-for record | `reading-pipeline`, `content` |
| `run-productions` (6) | changed | structure maps and part maps as proposed readings | `extractPropose` gains proposal forms `structure-map`, `part-map` and `bearing-note`; it keeps its existing labels and its computed grade | `extraction` |
| `fact-proposals` (6, after `run-productions`) | **new** | the tray of proposed world facts and their adoption | `factPropose({run, heldFor, profile@v, field, quote, extent, target})` checks quote, read and field (refusals in §6.1 step 7) and stores the proposal apart, labelled; `factAdopt({proposal, edits?, reason?})` (member only) calls the owner's member act (`events.recordDatedFact` / `createEvent`, `money.recordFact`, `lines.recordLine`, `duties.adopt`, `standards.adopt`, `entities.testify`, `content` mark) with `adopted_from`; `factDefer` / `factDismiss` with reason; `proposalsFor({heldFor | capture | home})`; `acceptanceRates({kind, profile})` per kind and profile, aggregate only (DEC-77; never per member, DEC-68) | `run-productions`, `events`, `money`, `lines`, `duties`, `standards`, `entities`, `content`, `observation-log` |
| `queue-producers` (11) | changed | one item per reading | kind `reading-proposals` (Noticed), homed under the held-for record's home and question | `fact-proposals` |
| `wizard-scripts` (11) | uses | the non-AI path | a Civicsmith script "Read a <kind>" walks `profileChecklist`; the member points at passages and adopts facts through `factAdopt` with no proposal (`origin: member`) | `reading-profiles` |
| `observation-log` (5) | uses | the looking | one entry per field sought, authority `extract`, naming the held-for record | — |

The engine reads in layer 6 and stores profiles in layer 4. Nothing below layer 6 depends on a model. The world-fact owners (layer 5) gain no machine write: every fact is still written by their own member act, reached through `fact-proposals`.

**Owner changes PROCUREMENT and HOME will ask for** (noted here, owned there):
- a dated-fact kind for a *forecast* or projected date, so each monthly report's completion forecast is a fact and the series can be read (G10);
- typed event kinds or progression stages for solicitation, bid opening, notice to proceed, change order and substantial completion (`notes/M4.md` §5 item 2);
- a contract clause as a duty's source (`notes/M4.md` §5 item 3).

The reading engine works without them: values land as `other` kinds with the quote. Its proposals are better typed with them.

### 6.5 Grandview, read

| document (how obtained) | held for (purpose) | kind | what the reading proposes | where adopted facts land |
|---|---|---|---|---|
| bond measure text and project list (county elections site) | O1: "was a schedule promised, by whom?" | `bond-measure` profile (draft) | Grandview in the project list (passage); any stated timing; Prop 39 accountability terms | `standards.adopt` kind `commitment` only if timing is stated; else "expected field not found: completion timing (all 6 pages read)" (G9 closed) |
| board presentation slide "one school year" (member's capture) | O1 | generic (no profile) | the quoted promise, the date shown on the slide, the body that presented | a `statement` event; `standards` kind `commitment`; a `duties.propose` with `commitment` basis (`notes/M4.md` §4 row "a promise") |
| board award item (board portal) | O1, money | `staff_report` doctype (CERTAIN) plus profile fields | award date, amount, contractor, vote; bid count and spread if a tabulation is attached | `award` event (`decider` board, `party` contractor); money fact `encumbered`; `contracts_with` line, role `supplier` |
| bid tabulation (attachment) | money; integrity flags (PROCUREMENT) | `bid-tabulation` profile; table read section by section | bidders and amounts as quoted, engineer's estimate | money facts per bid (kind and phase per PROCUREMENT); `tenderer` lines |
| executed contract (records request) | O1: the binding date | `public-works-construction-contract` profile | contract time, LD per day, NTP clause, time-extension procedure, change-order clause; "sections 1–12 of 40 read" | duty (obligor the contractor, enforcer the district office, trigger the NTP event); clause passages as `standards` candidates (`policy`/`commitment`) |
| notice to proceed (records request) | O1 | `notice-to-proceed` profile | NTP date | `issuance` event, which triggers the contract duty, so its due date is computed |
| change orders 1–23 (board consent items, scanned) | O3 causes | `change-order` profile; OCR tier, cap C | per CO: number, amount, days added, stated reason as quoted | `adoption` event `amends` award; money fact; duty `revise` for days; reason as `stated_cause` "<district> states" (`notes/M4.md` §1.5) |
| CM monthly reports, 24 months (bond program page) | O2 forecast | `cm-monthly-report` profile | percent complete as stated; forecast completion date; issues list | forecast dated facts (needs G10's new kind); percent as a quoted figure; "forecast field not found" in months where it is absent |
| CSLB page (public lookup) | contractor history | `licence-record` profile | licence status, bond, disclosed actions | entity identifier (licence number, grade A where a profile lists the scheme); lines; *weak evidence* note (`research/B5.md` L11) |

After adoption, the substrate already answers more of S1:
- `duties.occurrencesOf` says the contract duty is `overdue` as a question, never a violation (`notes/M4.md` §1.6);
- `money.committedAgainstPaid` sums award plus change orders against payments;
- `explore.timelineOver` lays out award, NTP, change orders and forecasts with "what we did" in a separate lane (`notes/M1.md` §1.13);
- `contradiction` K4 pairs two sources' dates for one event.

Reading does not explain the delay. It supplies the facts that PLANNING's hypotheses are tested against.

### 6.6 What is deliberately left out, and why

| left out | why |
|---|---|
| reading every held document automatically | K1468 forbids sweeps; invariant 7; cost. A reading starts at a held-for act |
| a reading without a purpose | purpose is the input that makes reading cheap and verifiable; without it the member is asked one question |
| model-stated values, grades or confidence figures entering the record | DEC-4, extraction R42, text-chain R42; values come from code over quotes; grades from the owners' rules |
| summaries as content, or summaries at acceptance | ID F4; DEC-4. The bearing note is quote-bound machine work, shown beside the source, never cited |
| deterministic readers for every kind up front (Option A) | measurement cost per kind; profiles first, graduation when volume and stability justify it |
| PDF table extraction by code | M-55 measured NO-GO; tables are read section by section by the model, quote by quote, until re-measured (`notes/C5.md` §1.8) |
| legal interpretation of clauses | the LAW construct's line: quote the provision, "legal information, not legal advice" (`notes/C5.md` §2); a clause becomes a standard or duty only by a member's adoption |
| a second document store or "case file" | HOME's (§9); reading writes to existing owners and the observation log |
| ranking documents or proposals by importance | DEC-89; ACT r3. Proposals are ordered by document position |
| cross-document exhaustive extraction ("every change order across the program") in the first stages | a separate split-map-reduce job over a member-declared set (`research/B4.md` L9); stage 5 |
| profiles that encode law or deadlines | D-149: "the plane encodes no law's rules"; deadlines come from `civil-time` rule sets and jurisdiction profiles (`notes/C2.md` §2 D31) |


## 7 · Staging

Smallest useful step first. Each step's test is stated in a member's terms.

| step | delivers | depends on | acceptance test (a member's terms) |
|---|---|---|---|
| **1 · Read by hand, with a checklist** (no AI) | `reading-profiles` with hand-written, *draft* profiles for five S1 kinds (contract, change order, board award item, CM monthly report, notice to proceed), written from real documents of one real district; `fact-proposals` adoption with `origin: member`; the held-for record (HOME); wizard "Read a <kind>" | `wizard-scripts`; owners' member acts (built T33) | A parent opens the Grandview contract, chooses "Read this for: the completion date", follows the checklist, points at the contract-time passage, and the record holds a duty with its passage and a computed due date, with no AI and no key. Every field the checklist names is answered, marked "not found in the pages I read", or left unread, and the record says which. |
| **2 · See the structure** | PDF outline and DOCX headings in the reading; a "contents" pane that jumps to a section; canon text for the `document_reading` layer | `pdf-reader`, `office-readers`, `reading-pipeline` | Opening a 120-page contract shows its articles; one click reaches "Time of Completion". Where the file has no outline, the pane says so in those words, never an empty list. |
| **3 · The engine reads one document for one purpose** | `READ_FLOW` in mode `extract`; `op=unittext`, `op=readstructure`, `op=factpropose`; verification refusals; one Noticed item per reading; structure maps proposed where no outline exists | `check` verified live (VF-4); `extract` deployed apart (BOB's call, §4.2 F5); the member's own account | A member asks the assistant to read the contract for the completion date. Within the bound it shows proposals, each beside its highlighted passage. Every proposal's quote is found word for word on the page shown. The member adopts three, corrects one and dismisses one. The reading states which articles it did not read. On a gold set of real S1 documents, the share of proposals adopted unchanged meets the bar BOB sets before step 3 is offered to members. |
| **4 · Unfamiliar kinds and earned profiles** | kind proposals against the profile library; generic reading for the unfamiliar; machine-drafted profiles from member-verified readings; measurement; approval acts; Civicsmith library seeded with the measured S1 profiles | step 3; `calibration` engine registration | After a member has read three contracts from two districts, the assistant offers "a reading profile for construction contracts, drafted from what you kept". An owner approves it after reading its fields. The next contract's reading proposes the same fields with no discovery step, and the profile page shows each field's adoption record. |
| **5 · Hard documents** | part maps for board packets; section-by-section reading of tables (bid tabulations, change-order logs) with member verification; forecast series across monthly reports (with the owner change in §6.4); re-reading a revised document for its held-for purpose, changed sections only (`docprofile.assess`, `passageNotice`); split-map-reduce over a member-declared set ("all 23 change orders") | step 4; G10's owner change (PROCUREMENT) | A member drops in a 300-page board packet; the reading proposes "pages 41–58: bid tabulation; 59–140: contract", and each part is read for its purpose. Asking for "every change order's days and amount" across 23 scanned change orders yields one table of proposals, each row tied to its page, with the four the OCR could not read listed by page. |
| **6 · Graduation and sharing** | stable, high-volume profiles written as `doctypes` readers from their measured pages; profiles shared between groups as a network library | step 4; volume | A district's change orders, read by a deterministic reader, arrive as readings without a model call. Another group imports the approved "construction contract" profile and its first reading uses it. |

Step 1 is useful on its own. It gives members the method (DR4, DR12) and the non-AI floor (K1547), and it seeds the measurement set that steps 3–4 need. It also fixes the profile format before any model depends on it.

## 8 · Decisions for Bob

Only policy, requirements, architecture and UX (CLAUDE.md, P17). Each has a recommendation.

| # | decision | why it is Bob's | recommendation |
|---|---|---|---|
| B1 | **Accepting a reading proposal.** Extend DEC-77's act "ACCEPTING A PROPOSAL" (one attributed act, recorded as acceptance, acceptance rate per kind measured) from contradictions to facts proposed by a reading, adopted into events, money, lines, duties, standards and entities | doctrine (DEC-77 scoped it "to contradictions first") | **Yes.** Each acceptance is per fact. The source passage is on screen at the act, nothing is preselected, and bulk adoption is allowed but never forced. Acceptance rates are measured per proposal kind and profile, never per member. |
| B2 | **Reading profiles and their approval.** A recurring kind's reading method is held as an approved, versioned, published profile, in two libraries (Civicsmith's and each group's), like wizard scripts (DEC-121). A machine may draft and never approve | doctrine and requirements (a new construct; DR4, DR12) | **Yes.** Bob names who approves Civicsmith's library. A group's profiles are approved by a project owner. A profile is approved only after its measured adoption record meets the bar BOB sets. |
| B3 | **What authorises a reading under K1468.** Does a member's act that holds a document *for a stated purpose* (or adopts a plan step that names the document) count as "a member's request" for targeted extraction from that document? | doctrine (K1468's scope) | **Yes, for that document and that purpose only.** No sweep, no reading of other documents, and the reading states what it did not read. |
| B4 | **Model-read image pages.** May the reading transcribe image-only pages through the member's own model account, as a labelled derivation with cap UNDETERMINED until calibrated, liftable to B by a member's attestation? DEC-74 left external OCR unfunded, and DEC-35 makes spending Bob's | policy (spending, evidence) | **Yes, as proposals only, on the member's own account.** The in-account OCR stays the default. A model transcription never replaces it and is shown as machine work. |
| B5 | **Machine summaries.** May a reading show a short quote-bound "bearing note" (what this document says about the question, what it does not) beside the source? | UX and doctrine (ID F4; DEC-4) | **Yes.** It is machine work, every sentence bound to a quote and withheld if unbound. It is never shown in place of the source at acceptance, never stored as content, never cited. |
| B6 | **Architecture.** Two new modules, `reading-profiles` (layer 4) and `fact-proposals` (layer 6), and a reading table in the `extract` mode | layers ruling 5 | **Approve.** |
| B7 | **Member-facing words.** What members see: "Read this for…" (the held-for act), "reading guide" for a profile (the internal name stays *reading profile*), "Proposed by the assistant · from page 14" on each proposal | UX (DEC-8: member-facing vocabulary is Bob's) | **Approve these, through the design stream** (`notes/D2.md` §1.1: BOB never edits the UX folder). |

BOB's level, recorded here and not put to Bob: the bound `read_units` and its default; `extract` deploying apart once `check` is verified; the gold set and the adoption bar for steps 3 and 4; refusal codes; the op shapes; whether a structure map is stored or recomputed.

## 9 · Interfaces with the other capabilities

| capability | READING needs from it | READING gives it |
|---|---|---|
| **HOME** (the investigation's home) | the **held-for record**: document, home, question or requirement, role statement, who set it. The home's document list says which documents are held and read, and for what | each document's reading status (not read, read for X, sections covered) and the reading's proposals and adopted facts, for the home's single view and timeline |
| **PLANNING** | the purpose: which requirement or hypothesis a document is wanted for, and the fields that would satisfy it, so a plan step "get and read the contract for the contract time" names a profile's fields; the order of readings | per requirement, *satisfied*, *not found in the parts read* or *unread*; **leads** from references to unheld documents ("Exhibit C baseline schedule"), routed explicitly (the `lead_inquiry` rule, `notes/M1.md` §4 item 13); expected-but-absent fields as possible records-request targets; the bearing note. READING never ranks hypotheses or proposes causes (DEC-84 (10)); it supplies the facts they are tested against |
| **PROCUREMENT** | the procurement kinds and their profiles' field lists (B5 §1.1 is the seed); the typed owner kinds (forecast dated facts, change-order and NTP events, contract-clause duty sources); declared procurement flows in `progressions` | the engine that reads those kinds; proposals placing a document on a flow stage (a member threads it, `progressions` R6) |
| **LOOP** (member in the loop) | the acceptance act (B1), the review page (span beside claim), queue grouping, bulk-but-never-forced, the acceptance-rate measure and its review threshold (as `contradiction` R39) | proposals in one shape (field, value, quote, extent, profile version, run) so LOOP renders every reading the same way; per-kind acceptance data that also measures the profiles |
| **COST** | the member's account and ceiling; the run bounds; the price of a reading by document size and profile maturity | cost levers: structure first, read only the planned sections, approved profiles skip discovery, deterministic doctypes first, split-map-reduce only on request; per-reading `read_units` and token usage recorded (`ai_usage`, `notes/M2.md` §3.1) |

## Sources opened

Read whole, first line to last:
- `study/investigation/RESUME.md`, `study/investigation/PROTOCOL.md`, `study/investigation/prompts/A-READING.txt`.
- `study/investigation/notes/P0.md` (1–325).
- `study/investigation/notes/C1.md` (1–245), `C2.md` (1–227), `C3.md` (1–183), `C4.md` (1–208), `C5.md` (1–275), `C6.md` (1–173).
- `study/investigation/notes/D1.md` (1–417), `D2.md` (1–183).
- `study/investigation/notes/M1.md` (1–394), `M2.md` (1–309), `M3.md` (1–516, in two ranges 1–425 and 426–516), `M4.md` (1–440, in two ranges 1–369 and 370–440).
- `study/investigation/research/B1.md` (1–253), `B2.md` (1–217), `B3.md` (1–308), `B4.md` (1–272), `B5.md` (1–362).

Consulted, not read whole:
- `study/investigation/STATE.md` (whole; unit states).
- `study/investigation/studies/` (file list, word counts and checkpoint comments of the sibling studies PLANNING, HOME, LOOP, PROCUREMENT, COST, all still in progress at the time; their content was not used).

Not opened: `study/investigation/prior/constructs-study-synthesis.md` (outside §A's source list; its content reaches this study through `notes/C6.md`, which read it whole). No product file was opened directly. Every product claim is cited through the note that verified it.
