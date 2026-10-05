# Constructs: what Civicsmith needs for time, organisations, law, courts, analysis and questions, and the architecture to give it

*Synthesis draft, S-SYNTHESIS for BOB #111, 2026-10-05. It joins the six studies (`studies/TIME.md`, `ORGANISATIONS.md`, `LAW.md`, `COURTS.md`, `ANALYSIS.md`, `QUESTIONS.md`), corrected by the three reviews (`reviews/R-1.md` for TIME and ORGANISATIONS, `R-2.md` for LAW and COURTS, `R-3.md` for ANALYSIS and QUESTIONS), and settles BOB's conflict list (`BOB-NOTES.md`). How to read the citations: "TIME §3" is a study section. "R-1 T-E1" means R-1, TIME, Error 1; "O-O2" means ORGANISATIONS, Omission 2; "Doc" means a review's Doctrine part. R-2 uses L- and C- (LAW, COURTS) and R-3 uses A- and Q- (ANALYSIS, QUESTIONS). "BN 3" is BOB-NOTES conflict 3. Code is cited at `tranche/T32`. No tranche is open or planned (K1425): this document describes stages and what each one unlocks, never a plan or dates. **Amended by BOB #111 after Bob's corrections of 2026-10-05:** K1429 (the assistant can run on a Claude subscription, DEC-55), K1430 (the substrate is built first; screens follow it), K1431 (dates that follow from dependencies, not only from regulation).*

## 1. The answer in one page

**Bob's question** (RESUME, 2026-10-05): is support for time richer than tracking a court deadline? Is the system's understanding of organisations (relationships, responsibilities, obligations, reporting lines) rich enough for the work? Law and court cases are at the heart of the work. Analysis has to happen both in code and in spreadsheets. Members must be able to ask questions in plain words, which Bob thought the assistant could answer. For each construct: what support is needed, what exists today, which modules and AIs provide it, and what architecture would close the gap.

**Each construct: where it stands today, and what it needs.** "Built" is what the code has. "Reachable" is what a member can actually do through today's interface.
- **TIME.** *Today:* about one and a half levels of six are built (stated dates complete, about half of computed deadlines). A member can reach only typed dates, plus progression "overdue" findings that are measured from capture time. The one deadline calculator is wrong in three ways (§7, items 1–3). *Needs:* one correct calendar engine; the duties bodies owe, tracked before anything is published; meeting schedules; a document's own dates; "as of a date".
- **ORGANISATIONS.** *Today:* a subject registry with three undated relations. There is no "who held the office when", no reporting, oversight or contract lines, and no obligation object. Every office the Action layer names is a text pair `{role, body}` that no screen reaches. *Needs:* dated, sourced lines between bodies and offices; holders over time; one held object for what a body owes.
- **LAW.** *Today:* standards and determinations are built but sit in layer 9 with no screen. A member can only type citation strings on an action. *Needs:* the law held where investigation runs, at the version in force on the date of the act and at section level, with the AI proposing only from captured text.
- **COURTS.** *Today:* no object of its own. A member can capture, cite and record correspondence, but cannot switch on a watch of a court page. *Needs:* follow a proceeding (forum, number, parties, register, stages), track the duties orders and reports impose, and verify citations.
- **ANALYSIS.** *Today:* the only calculation runs after a breach has been determined. A cited spreadsheet cell is a pointer whose value the record cannot read back. A member can only cite figures. *Needs:* one calculation construct with two engines: recipes the plane computes, and the member's own workbooks, bound to their sources and recomputed.
- **QUESTIONS.** *Today:* no member can ask anything in plain words, on any copy. The assistant is a ruling (DEC-27) and a design built over an adversarial checker. Only `check` mode is deployed, the installer carries no account, and the code can use only an API key although the design (DEC-55, K1429) lets the group's or a member's Claude subscription serve. *Needs:* first, make any assistant runnable. Then a read-only "ask the record" whose answers the plane checks. Answers that apply law, deadlines and figures come later, from the plane's own services and never from the model's memory.

**The finding that joins them.**
- The six constructs share one thread: **what a body owes, to whom, by when, under which authority**. Organisations supply the obligor and the lines between bodies, law supplies the authority, time supplies the due date, courts supply orders and reports as sources of duties, analysis measures performance against a bar, and questions read all of it.
- Today every piece of that thread sits after Publication (layer 9) or nowhere. Investigation, which is where the work happens, can use none of it.
- The architecture therefore puts the **record's understanding** low in the order and leaves **acting** where it is: `standards` and `local-facts` move to layer 5 (no `uses` edge breaks; verified in `build/modules.json`); new layer-5 modules `lines`, `duties` (the obligation construct), `chronology` and `calculations`; pure layer-1 engines `civil-time` and `calc-grammar`; an `answers` module in layer 6 that checks what the assistant says.
- Determination, consequences, the group's own clocks and filing stay in layer 9 (§3).
- The machine still never concludes. The substrate is built first (K1430): each stage publishes its services for the design stream to design against, and the UX work continues on them. Any AI help waits on QUESTIONS' stage 0.

**Decisions Bob is asked for** (§5):
- B1: the target level per construct.
- B2: moving `standards` and `local-facts` to layer 5.
- B3: the new product modules.
- B4: the obligation construct and who may owe one.
- B5: entity and line kinds.
- B6: walking evidenced lines, and powers without verdicts.
- B7: what the machine may write without a member.
- B8: private individuals.
- B9: what the record may claim about time, and in which day.
- B10: profiles that hold sourced rules.
- B11: the model of law.
- B12: what the machine may say about law and rulings.
- B13: what a finding may rest on.
- B14: the calculation construct.
- B15: outside and paid sources.
- B16: the assistant's account and spending.
- B17: what the assistant may read and suggest.
- B18: court-ordered removal.
- B19: calendar export.
- B20: where members meet all this, and its words.

The defects found are listed separately as corrections (§7); they are not choices.

## 2. Per construct

### 2.1 TIME

**Anticipated work** (TIME §1; 14 needs, all evidenced).

Core needs: **A1, statutory response deadlines on the group's own requests.** "Our CPRA went in Thursday 19 March; when is the City late?" (Roadmap §1 L241–258). **A2, a body's own commitments and audit target dates.** "They promised to implement the audit by October 2023." **A3, time standards in policy, measured per act.** "Are potholes fixed within the time the city's own policy sets?" **A5, recurring procedural duties.** "Minutes for the 28 July meeting were due 18 August." Brown Act 72 h and 24 h; Oakland OMC 2.20.070, 48 hours "excluding Saturdays, Sundays and holidays". **C1, a real calendar:** business days, holidays per office, time zone, office hours, cut-offs. **D1, meeting schedules and cancellations.** **E1, the law in force on the date of the act.** **F1, fiscal years.** "Every contract over $250k on fund 3100 since FY2019." **G1 and G3, a document's own dates and a cited chronology.** **H2, non-response as a dated outcome.** **J1, every wait says by when, with its zone.**

Regular needs: claim and limitation windows (B1), backward notice periods (C2), who held an office when (E2), lateness patterns (H1), and relative questions (I1).

**Dates that follow from dependencies, not from a rule (K1431, Bob).** Much of what must be done by a date has no statute behind it: a budget must be adopted before its fiscal year begins; a staff report must be available before the meeting that decides on it, early enough to be read; an audit should reach the council before the budget hearing; data must exist before the vote that relies on it; the group's own comment must reach a body before its hearing. The due date is derived from the date of the event it serves, with the reason stated ("needed before the 12 June vote, so the council can read it"). Missing it is a dated fact about sequence ("the report was published two hours before the vote"), often the strongest finding a watchdog has, and never a violation unless a rule also applies.

**Ladder** (TIME §2):
- L0, record time: what bytes existed when.
- L1, stated dates: a member types a date with its basis.
- L2, computed deadlines on the local calendar: business days, roll-forward, extension, tolling, hours, any start event.
- L3, the civic calendar and a body's duties before publication: meetings, commitments, fiscal periods, in force and in office on a date.
- L4, temporal evidence: a document's own and imprecise dates, cross-document chronology, lateness patterns with a denominator, as-of reads.
- L5, assisted: plain-language time questions answered with cited, labelled proposals.

**Where it stands.** **Built:** L1 complete, about half of L2, fragments of L3 and L4. L2: calendar and business days and holidays per office are built. L3: progressions on calendar intervals; `standards.inForce`. L4: the version chain, and one action's chronology (filings R9). **Reachable:** L1, through clocks typed on an action document (app.html l.3380–3393); progression overdue findings, anchored on when the group *captured* the predecessor, never on the meeting's date (`progressions/index.mjs:863–870`). Everything else in layer 9 has zero UI calls, or is not deployed (TIME §3). The design stream's own summary agrees (journeys §6 "Meetings and time").

**Target: L3 everywhere, L4 for document dates, chronology and as-of reads, and L5 in stages** (TIME §5). Bob asked for more than court deadlines. Every front door in the journeys passes through a body's time duty before publication (journey 4 step 4). Most of L2 exists and only needs correcting.

**Architecture** (TIME §5, as corrected).
- **`civil-time`**: a new layer-1 module directly after `jurisdictions`. It is pure: no store, no network, no clock (1,500–2,500 lines). It computes the local day from an instant and a zone. It compares EDTF level-1 imprecise dates three ways (before, after, undetermined). It evaluates time rules: units including hours and business hours, forward and backward, roll-forward past closed days, extension and tolling. It expands an RRULE subset within bounds, maps fiscal periods, and answers `validAt`. Every answer carries a trace: the rule, its citation, the days skipped and why, and the tz/ICU version. It takes "now" only from its caller and never reads `Temporal.Now` (R-1 T-E9).
- **Every day computation delegates to it.** There are about twelve today: action-clocks, actions R12, monitoring, queue, at least five sites in queue-producers, local-facts horizons, progressions, query-language (R-1 T-E4). Calculation's `span` uses it too, so no seventh engine is built (ANALYSIS §7).
- **`jurisdictions` R26 is widened**, as data only: units, direction, roll, closures, extension, tolling and anchors; new profile facts `weekend` and `computation`, citing CCP §§12 and 12a (R-1 T-E8); `fiscal_year`, notice rules, and channel `cutoff`/`outages`; recurrences keyed by the profile's own body names, never by an instance's entity ids (R-1 T-E6).
- **A due date carries its basis kind** (K1431): `rule` (a law or order, cited), `commitment` (the body's own stated date, cited), `dependency` (`{precedes: event, lead: amount, why}`, the date derived from the event it serves, computed by `civil-time` from that event's own date and recomputed if the event moves), or `window` (the group's own). Each is shown as what it is; only `rule` may be called a deadline the law sets.
- **`received` is defined once in R26** as the counterparty's receipt of the group's request (R-1 T-E1; §7 item 1).
- **`chronology`** is a new layer-5 module after `standards` and before `progressions`. It holds a document's own dated facts with their method and grade, and answers `ownDate`, `datesOf` and `chronology({scope})`. Its first writer is the reading pipeline at read time, plus a re-read job for captures already held (R-1 T-Feasibility).
- **`progressions` R16** anchors on the event's own date. Where no date is stated, the anchor is undetermined and the capture instant is shown as a bound (B9).
- **`monitoring`'s `per_meeting` cadence** follows the expanded recurrence. To show a notice violation, it must capture at the meeting time minus the notice period (R-1 T-O3).
- **A body's duty is not a TIME object.** It is one occurrence of a `duties` obligation (§3.1; R-1 T-O1). Its queue item is the kind the queue already reserves, `temporal-expectation-due` (`queuestate.mjs:164`), not a new `expectation-due` (R-1 T-E5).
- **Adopted standards** (TIME §5): CCP §12 and FRCP 6(a) counting; RFC 5545 RRULE (subset); the OCD Event shape for observed meetings, with Legistar `Events` as a source; EDTF level 1; bitemporal valid time and transaction time; OCDS `Period`; Akoma Ntoso event-bounded intervals; IANA zones through `Intl`.
- **The AI's part:** EXTRACT proposes dated facts, which a member accepts. Temporal taggers normalise only about 70–78% of values correctly. FIND answers time questions as cited reads and states the window it used. Plan mode proposes clock entries from profile rules. It never invents a rule (D250), confirms a calendar fact (D15) or runs on a schedule (D13).

**Stages** (§4 gives the joint path):
- **T1, correct clocks, usable** (§4 stage 1). Work: `civil-time`; R26 widened; the twelve delegations; the local day; an op for `clockPropose`; inclusive query ranges; the `local-facts` move. A first rule set with citations and status: CPRA with extension, Brown Act, OMC 48 business hours, the Government Claims Act's 6 and 12 months, FOIA's 20 working days. It unlocks journeys 5 and 13, experiences (h) and (k), UC-118, UC-127, UC-164 and UC-165, and the counsel packet's claim windows. Size: 1 new module, about 12 amended, about 35–45 requirements.
- **T2, what a body owes, and its meetings** (§4 stage 2). Work: `chronology`; event-anchored progressions; recurrence and observed meetings; `per_meeting` watching; `fiscal_year`. Trigger: T1 in use and a group watching a body's meetings or following up a commitment.
- **T3, as-of reads and patterns** (§4 stage 3). Work: `validAt` across standards, tenures and relations; recodification across addresses; Memento asked for a past date; the lateness pattern with its denominator; the timeline view. Trigger: the first determination, office-holder question or contradiction over a reversal that needs it.
- **T4, assisted.** Trigger: FIND and plan mode deployed, with the acceptance rate measured.

**The review's corrections, taken in** (R-1): The defect is restated (§7 items 1–3). `starts: received` is read as the group's own receipt, so Oakland's only rule (`oakland-alameda.mjs:247`) answers undetermined in the no-reply case it exists for. There is no roll-forward (`:704`, `:744`). The defect a member can reach today is the UTC end-of-day mark, which flags a typed clock seven to eight hours early. The 29 March date is latent: `clockPropose` has no op. The day computations number about twelve, not four. The Stage-1 size is raised to match. The queue kind is reused, not added. Recurrences are keyed by profile bodies. "Received" is fixed by BOB and reported, not put to Bob. R44's rule "UNMEASURED is not a basis" extends to `deadlines` before any rule set ships (B10). tzdata is at release 2026e: Manitoba moves to permanent −05 on 2026-10-31. Oakland's minutes lag is now measured from Legistar. For 2026 so far: 130 events, 24 cancelled; minutes for 105, a median of 15 days to last publication, and 33 over 21 days. "Last published" is only an upper bound: 29 of 106 agendas were last published less than 72 hours before the meeting day, and reading those as notice violations would make exactly the false claim D77 ranks worst. Snooze-by-date (queue R21–R22) also delegates to `civil-time`. Dataset vintages generalise the `roll_year` already in `id-spaces` (R10–R12). The member surface is the design stream's, built on these services after them (K1430).

### 2.2 ORGANISATIONS (and obligations)

**Anticipated work** (ORGANISATIONS §1).

Core needs: **A1, register a body or office and find everything that concerns it.** "Everything we hold about the Controller's Bureau." **A2, tell an office from its holder, over time.** "Who was Finance Director when the 2022 ACFR was certified?" **B1, reporting and oversight.** "Who can make the City Administrator act? Who audits the Port?" **B2, contracts and agency.** "Is the hauler delivering what the franchise requires?" **B3, responsibility and records custody.** "The request goes to the office that holds the records." **C1–C3, hold an obligation with its source in force, know whose move it is, and detect when one is unmet.** "Minutes for the 4 August meeting are 21 days overdue." **C6, powers.** "Were the FY22 sewer transfers authorised?" **D1 and D2, address an action to, and name an actor as, a registered office.** **E1, cited, as-of answers.**

Regular needs: sub-units (A3), renames and mergers (A4), source-system identifiers (A5), bodies beyond the city (A6), appointment and seats (B4), funds (B6), recurring duties (C4), exceptions (C5), duties of contractors (C7) and commitments (C8).

**Ladder** (ORGANISATIONS §2):
- L0: free text.
- L1: a registry with graded resolution.
- L2: structure as of a date (dated, evidenced lines; holders; renames; identifiers).
- L3: obligations held, sourced to a provision, order, contract clause or commitment in force.
- L4: declared against observed (derived occurrences, power readings, chains as of a date, patterns).
- L5: a network-scale civic model shared between groups.

**Where it stands.** **Built:** L1 complete. L2 is absent, apart from the constitutive `member_of`, which is undated, ungraded and never traversed. L3 and L4 exist only as fragments: `progressions` holds generic flows with missing and overdue findings, but has no obligor, no beneficiary and no source in force. **Reachable:** the Subjects screen (create, alias, resolve, concerns), but none of its correction or defect acts; and the progressions screen. Every `{role, body}` in layer 9 is text, unlinked to the registry and unreachable. Search can name a body only through the free-text `authority` field. `group` is the member group, and `addressee` searches the addressee's *state* (R-1 O-E3).

**Target: L4 for one city's bodies, in two stages, and L5 on demand** (ORGANISATIONS §5). Bob's definition of the analytic product is the gap between how things are supposed to flow and how they really flow (NOTIFICATIONS src 80–109, 1 August). That definition is L4. Every journey that touches a body needs L2 and L3.

**Architecture.**
- **`entities` is extended:** `identifiers [{scheme, id, basis}]`, which resolve at grade A, as aliases do; the kinds `program` and `place` (B5).
- **`lines`** is a new layer-5 module directly after `entities`, about 1,800 lines. It holds evidentiary, dated relations between registry entities: `{kind, from, to, role?, valid, basis, asserted_by, end resolution}`. The kinds come in a closed list (B5). Structure: `part_of`, `post_in`, `holds` (with status), `reports_to` (administrative, functional or budgetary), `oversees`, `appoints`, `seat_on`. Money and contracts: `funds`, `contracts_with` (OCDS roles), `acts_for`. Responsibility: `responsible_for`, `custodian_of`. Change: `successor_of`. Proceedings: COURTS' families, §2.4. Reads: `structureAt`, `holderAt` (undetermined when no line covers the date or two overlap), and a bounded `chain` walk (depth 6, fan-out 1,000, weakest hop governs, no ranking).
- **A line is graded on two axes** (R-1 O-E1): who asserts it, with the passage cited: a captured source, a system rule, or a member's testimony; how each end resolved to a registry entity (entities R9's A/B/C). The weakest *end* governs identity only. So a charter's "the Auditor reports to the Council", between two A-resolved entities, is a citable fact. Under the study's original scale it would have been grade C, never established.
- **`entities` R26 stays true** of the three constitutive relations. Lines are claims about the world (CF §13).
- **`duties`** is the obligation construct, a new layer-5 module after `progressions`. It is specified once, in §3.1.
- **A bridge from profile offices to the registry** (R-1 O-O1). The bridge itself: at instance setup, each profile office `{role, body}` (jurisdictions R24) is seeded as an `office` entity. The seeding is machine-attributed and system-asserted, and the profile entry is its basis. Later references resolve to that entity by alias, with a grade. Then the readers of `{role, body}` follow the registry: `local-facts` R6 follows the `part_of`/employer line; `escalation` R12 targets follow `oversees`/`appoints`, with the profile flag only as a fallback; `actions` suggests an addressee from `custodian_of` and `responsible_for`; `conformance` actors carry an `entity_id`.
- **Seeding without AI.** A Legistar `OfficeRecords` reader is a generic content type, and its output is a system-rule assertion. This is DEC-52's machine-attributed route, with no AI run (R-1 O-Feasibility). It seeds **council and committee seats only**. The Finance Director, Controller and City Administrator are not in it, and contact fields are dropped (R-1 O-E2). Staff posts come from directories, org charts, budget books and appointment resolutions, read by name. That is why the two-axis grade above is a precondition of this stage's value.
- **Adopted standards:** W3C ORG `Post`/`ChangeEvent`; Popolo field names; FollowTheMoney `Occupancy`; OCDS party roles and `Milestone`; OCD-IDs and org-id schemes; LegalRuleML's split of duty, prohibition and permission.
- **The AI's part:** It proposes lines, holders and obligations from charters, codes, contracts, orders and budgets (EXTRACT, member-adopted). It writes directly, machine-attributed, only from source-native data with identifiers at both ends (B7). FIND answers who held an office, who oversees it, what it must do and whether it is late, each with a grade, an as-of date and the level searched.

**Stages:**
- **O1, structure** (§4 stage 1). Work: `lines`; the `entities` extensions; the bridge; changes to `actions`, `conformance`, `escalation`, `local-facts` and `query-language` (fields `holder:`, `obligor:`, `owed_to:`). It unlocks journey 5 step 3 (the office that holds the records), journey 13's addressee and escalation steps, the court-case and contract front doors, and "offices and who held them". Size: about 45 requirements. Measure first: Legistar seats, by body and year; offices concerned by more than 32 documents (D-224's trigger); whether budget department codes stay stable across two fiscal years; the directories in the corpus (about 395 ± 272); the distribution of line grades; the bridge's resolution rate.
- **O2, obligations** (§4 stage 2). Work: `duties`; occurrences; the power reading; the delta feed. Trigger: O1 in use, and a group tracking a franchise, a code chapter's reporting duties or a records request's clock. Size: about 60 requirements. Measure first: a hand-built gold set (one code chapter, one franchise, one consent decree) for the precision of EXTRACT's proposals. Contract-obligation extraction reaches at best 70.56% accuracy (R-1 O-E5).
- **O3, network.** Shared, recreated structure and obligation packs; OCD-ID and org-id exports; Popolo and OCDS exports. Trigger: a second group working on the same body.

**The review's corrections, taken in** (R-1): Two-axis grading (O-E1). Legistar re-scoped to seats (O-E2). The search gap is wider than the study said (O-E3). The placements are reconciled (O-E4; §3.2). External figures corrected: NYC's tracker covers "more than 8,000 obligations from more than 2,000 local laws", and is NYCuriosity's, not the Council's; 70.56% is the *best* accuracy, not the lowest. The add flow sends `{state: named, name}` (app.html:19983), which collides with actions R9's `COUNTERPARTY_REFUSED`. It is listed as a correction (§7 item 8), not as a degradation (O-E6). `withinPowers` becomes `powersOf({office, at})`. It returns the powers in force, each with its instrument and any delegation instrument held. It never treats reporting lines as delegation, and never answers within or not within (R-1 O-Doc; B6). DEC-60's counter-precedent goes to Bob with the walking doctrine (O-O6; B6). The thirteen line kinds go to Bob (B5). The queue code `OBLIGATION` is **not** renamed, because DEC-107 keeps it unchanged (§3.1). `progressions` may store a `DUT-` id as data but never reads `duties` (O-O4). Occurrence state needs the deliverable's own date (O-O3), so `duties` uses `chronology`. `part_of` and `acts_for` let `strength` see two documents from one department as one source. This is added as an O2 extension of strength R12, closing X118 (O-O5).

### 2.3 LAW

**Anticipated work** (LAW §1).

Core needs: **N1, find the standard the city set for itself, before any question exists.** "Which ordinance says how fast potholes must be fixed?" (journey 4 step 3). **N2, every law that governs a body or a request.** **N3, the law's own words, with the standing of the copy.** Codifier pages say they "should not be relied upon as the definitive authority". **N4, the reverse index.** "Every agenda item and staff report that cites Ordinance 13579." **N5, the law in force on the date of the act.** "The transfer was in FY22; what did §13.04.080 say then?" **N8, section-level requirements, one question per requirement.** **N12, compare an act with a requirement during investigation.** **N13, determine compliance after publication.** This is built. **N15, deadlines that come from law** (TIME's). **N18, the assistant proposes laws with citations and never states the law.** Legal AI tools hallucinate in 17–34% of benchmark queries.

Regular needs: amendments, recodification and codifier lag (N6); being told when cited law changes (N7); definitions and exceptions (N9); contracts, policies and budgets as standards (N11); the Criteria line of a published finding (N16); explaining a charge (N17).

**Ladder** (LAW §2):
- L0: law as plain evidence.
- L1: law named (citations typed, identifiers recognised, the reverse index).
- L2: law held during investigation (a standard declared from captured text, "in force on D", the AI proposing).
- L3: law structured and versioned (work, version, portion; amendment and recodification links; cross-references; rank; codifier lag stated).
- L4: law applied and explained (comparison rows a member evaluates, canon proposals, labelled readings, determinations).
- L5: law shared and watched (imports, legislative watching, court interpretation).

**Where it stands.** **Built:** L2 and a slice of L4 (determination and the comparison store). `standards` is 849 lines; it holds one block of text, at most 50 content ids, and has no sections. `conformance` is 1,539 lines. Both are bound to layer 9, so nothing in layers 5–8 can call them. L3 is absent. **Reachable:** L1 at most. A member can type citation strings on an action (`actionlaws`, 3 UI calls), see references and backlinks, and cite law as ordinary evidence. All six `standards` ops and all six `conformance` ops have zero UI calls, and no deployed AI touches them. No Legal/Policy Lookup skill exists (`standards/index.mjs:13`).

**Target: L3 in the record and L4 in what the AI prepares, both during investigation; L5 on its triggers** (LAW §5.1). The work is criteria-centred: auditors quote the provision as it stood at the act. AI work without L3 is the hallucination failure the legal-AI studies measured.

**Architecture** (LAW §5).
- **`standards` moves whole to layer 5**, after `connections` and before `progressions` (B2; §3.2).
- **`conformance` stays whole in layer 9.** A determination still rests on published findings: K102 and conformance R2 are unchanged, so no change is asked of Bob there.
- **`standards` gains:** `instrument` (a work key composed from profile data, shaped like ELI); `portion`; `requires` (the requirement in the member's words); `copy` (official, codifier or undetermined); `current_through`; `period_basis`; `inForceAt({key, portion?, date})`, which answers undetermined with a reason at its level; `standardsFor`, the reverse index.
- **Law relations live in `standards`, because their ends are standards and portions, not registry entities.** Temporal relations, each citing the amending instrument: `amends`, `repeals`, `renumbers`, `recodifies`. Referential relations: `refers_to`, `defines`, `excepts`, `implements`, plus COURTS' `interprets`, `applies` and `holds_invalid` (R-2 L-O). Treatment rows for decisions: reversed, vacated, depublished, overruled, affirmed. Temporal and referential relations are never one edge type (D192). Search may traverse these relations: an explicit textual reference is an earned connection (D183). Identity resolution never traverses them.
- **`jurisdictions`** gains `law_ranks`, the copy status per code, and the amending-clause vocabulary.
- **The `regulation` reader in `docprofile`** adds section paths and headings in stage 1, and definitions, cross-references and amending clauses later.
- **`docprofile`'s size.** It is 3,170 lines today and was split once before, at 4,060. LAW's reader extension and COURTS' three new doctypes would take it past P6's mark. BOB splits it under K617 before either lands, for example court and oversight doctypes into their own module of the same layer (R-2 L-O, C-O).
- **Adopted, as vocabulary rather than XML:** FRBR work/expression/portion (Akoma Ntoso, Laws.Africa, Indigo); eCFR's as-of semantics; Legistar's enactment fields as the source of enactment events (`MatterEnactmentDate`, `MatterStatusName`); the Yellow Book's Criteria/Condition/Cause/Effect.
- **The AI's part:** A `legal_lookup` skill searches the four levels for held provisions, requests captures of what is missing, and proposes standards with captured text. A proposal with no captured text cannot be adopted (`STANDARD_NO_TEXT`), and acceptance is measured. Structure proposals are stored apart. `compliance_analysis` rows (requires · did · reading) never give an outcome. A labelled reading of a held provision (B12). Every output publishes what it could not mechanise beside what it did, as DEC-54 splits them (R-2 L-O).

**Stages:**
- **L1, law in the investigation** (§4 stage 1). Work: the move; the `standards` extensions; `law_ranks`; section paths; retrieval fields `standard:` and `cites:`. The `progressions` and `actions` links: a flow basis, a governing law or a deadline basis may name a held standard (B11). The `legal_lookup` skill text. It unlocks: the "law, code or policy" front door (capture a section, declare each requirement); journey 4 step 3 *by the member*; journey 5's governing law linked to a held standard; the reverse index; "in force on the date of the act"; journey 13 (its services; the screens follow, K1430). The assistant's help with journey 4 step 3 waits on investigate mode (VF-4) and the model key (R-2 L-E5). An inquiry still cannot rest a leg on an `STD-` (inquiry R4). A question cites the standard's captured passage as an information leg until B13's change (R-2 L-O). Size: no new module, about 11 touched, about 30–40 requirements. Measure first: how many OMC pages and ordinances are captured (about 1,850 ± 314 ordinances and resolutions), and the `readingref` resolution rate; section-boundary accuracy on 50 OMC pages; codifier lag against Legistar; 30 seeded law questions, checking that citations resolve and how often members accept; **how the official code is served (static, rendered or API)**. Oakland's Municode is an Angular shell, and monitoring R5 cannot see content changes in a rendered capture (R-2 L-E8); the `MODULE_ORDER` listener order after the re-pin (R-2 L-E7).
- **L2, versions and structure** (§4 stage 2). Work: amendment, repeal and recodification relations from captured enactments; definitions and exceptions; version notices across addresses through instrument keys (closing X73). Watching rests on Legistar enactments (static JSON), not on rendered codifier pages. Trigger: the first cited provision that changed between the act and publication, or a member's "what did §X say on D?"
- **L3, applied and explained** (§4 stage 3). Work: `compliance_analysis`; contradiction's canon proposals from rank and periods (this is when the move becomes *necessary* in code; R-2 L-E6); explaining a rule; requirement extraction. Trigger: investigate deployed, with stage-1 acceptance above a bar. The conformance comparison split stays deferred until a layer 5–8 module must read a comparison in code.
- **L4, shared and imported law.** Work: Akoma Ntoso, USLM and eCFR imports as captures; held standards arriving through `case-import`, recreated and never installed; court interpretation (with COURTS). Trigger: a second jurisdiction, a coalition, or a group asking to load a code.

**The review's corrections, taken in** (R-2): The `LAW_LEVELS` conflict is false and is deleted. K108(1) unified the four levels; `actions/index.mjs:613` is the DEC-49 addressee check. The only three-level array left is in the stale `release/bio-plane.bundled.mjs:4746` (L-E1). The `ordinance` and `contract` kinds come from DEC-6 and `ENTITY_KINDS`, not from DEC-114 (L-E2). Durable Object storage is 10 GB; CPU is 30 s by default and configurable to 5 min (L-E3, L-E4). The registration alternative (retrieval R53's `registerActionFacts`) is shown to Bob in B2, with the point at which the move becomes necessary (L-E6). The Municode terms URL now answers 404, though the quoted text is confirmed by search (L-E9).

### 2.4 COURTS

**Anticipated work** (COURTS §1). None of the design session's 172 use cases follows a proceeding. The need comes from Bob ("as are court cases"), the canon's examples, the journeys' court and regulatory front doors (§3 L106, L111) and watchdog practice. **Core needs:** **A1, identify and follow a proceeding.** "The city is a defendant in the sewer-fee suit: which court, what number, who are the parties, where does it stand?" **A2, know when something is filed or ordered.** "Tell me when the judge rules on the demurrer." **A3, cite orders to the paragraph.** **C1, hold a decision as a standard the city is measured against.** **Regular needs:** A4: hearing and compliance dates. A5: the appeal chain. A6: settlements paid. A7: regulatory proceedings. "In the utility's rate case, when are comments due?" B1: consent decrees as long-running duties. The OPD decree ran 23 years; the monitor reports at Preliminary, Secondary and Full. B2: grand jury reports and the replies the law requires, within 60 or 90 days, giving one of four answers per recommendation (Penal Code 933.05). B3: audit recommendations still open. The founding case requested "all City Auditor follow-up records on the February 2022 recommendations" (rated **regular** per R-2 C-E8, not core). C2 and C3: precedent, and verifying citations. D1 and D2: following the group's own petition after filing, and its referrals. E2: a member's account of a hearing they attended. F: questions.

**Ladder** (COURTS §2):
- L0: documents.
- L1: court-aware reading and citation (register, order and oversight-report doctypes; case numbers and reporter citations recognised; citations verified or marked "not verified"; a decision held as a standard).
- L2: a proceeding followed (a registered subject with forum, number, kind, parties by role, related proceedings; register rows with new entries flagged; stages as a declared flow; dates with their basis).
- L3: duties from proceedings tracked (order and decree paragraphs, grand jury and audit recommendations held as duties; the reply a statute requires runs on a clock; reported status quoted beside the group's own determination).
- L4: interpretation and precedent (`interprets` links and treatment; the AI proposes precedent).
- L5: procedural reasoning and patterns.

**Where it stands.** **Built:** L0, and a slice of L1: a `court` standard with text, period and one `supersedes`; pin-cited extents; venue facts and court holidays; the counsel packet. "No op in the 446 names a court case … as an object" (M5). **Reachable:** capture, cite, record `court_filing` and `court_decision` correspondence, and set a risk tier on the group's own action. **Not reachable:** watching a court page. The add flow writes `monitoring: enabled: false` (app.html:3313), monitoring R1 refuses with `NOT_MONITORED`, and only the daemon may propose a watch (R-2 C-E1).

**Target: L3, with L1's citation discipline and L4's links held as data; L4's assistance and L5 later** (COURTS §5). The founding case's own material (a grand jury complaint, a records petition, audit follow-up) is L3 work. The journeys' court and regulatory rows need L2.

**Architecture** (COURTS §5, Option A; corrected by R-2).
- **A proceeding is an entity of a new kind `proceeding`** (B5), with a facet: `forum` (an entity: a court, commission, grand jury or auditor); `forum_kind`; `number` (an alias, recognised by a profile id space `proceeding`, so a capture that carries the number resolves at grade A); `kind` (from the profile vocabulary).
- **Its label is forum, number and a neutral description**, for example "Alameda Sup. Ct. RG24-…, sewer-fee suit, city as respondent". The caption stays a citable extent and is **never** an alias, or a private party's name becomes an indexed alias (R-2 C-Doc; B8).
- **A machine-registered proceeding** carries the machine's own labelled note, never one presented as a member's (D35; R-2 C-Doc).
- **Parties and proceeding links are `lines`.** Party lines: `party_to {role}`, from an office, body or institution to the proceeding. Roles follow ECF and the CPUC service list (petitioner, respondent, intervenor, amicus, monitor, information only). Proceeding-to-proceeding lines: `appeal_of`, `consolidated_with`, `remanded_to`, `arises_from`. Both are added to `lines` as their own families. These are relations between registry entities, so they belong in the one store of evidentiary entity relations (BN 4; R-2 C-O). A private party appears only as the class "a private party" (B8).
- **`enforces`** (a proceeding enforcing a decree held as a `court` standard) becomes a field, `arising_in`, on that standard and on each duty it imposes.
- **The register is a reading, not a store.** A `court_register` doctype turns each capture into rows: date, text and filer as written, and the document link. A **row diff is new work**: monitoring's `assess` compares substance, not rows (R-2 C-E2). A row is never a finding (D76).
- **Following a register needs `monitoring` to change** (R-2 C-E3). Today a rendered or cookie-gated portal reads "undetermined" on every tick (monitoring R5), and member credentials serve only capture requests (`capture-requests/index.mjs:778–786`). Alameda's eCourt requires cookies. Stage C1's first measurement decides the path: a public register that needs rendering or session cookies (no login) is re-rendered on the tick; a register behind a member's account is refreshed only by that member's act, never on the unattended tick (B15 (b); D13); otherwise only static registers are followed, and the page says so. Either way, a member must be able to switch a watch on.
- **Stages** are a progression per proceeding kind, offered from the profile and adopted by a member.
- **Status is as of a date.** That read is TIME's new as-of read; progressions R24 has none (R-2 C-E4).
- **Dates** carry the order's or the row's extent as their basis. R26 `starts` gains `entered`, `served` and `hearing`.
- **`actions` gains a `proceeding` link** on the action and on its court correspondence.
- **Duties** (orders, decree paragraphs, recommendations) are `duties` obligations. They add `arising_in` (the proceeding) and **reported status** `{reported_by, status as written, as_of, extent}`: quoted, never graded (BN 3; R-2 C-O). The 933.05 answers and monitor levels are profile vocabulary.
- **The citation check** is a pure recogniser in layer 1, extending `id-spaces` with eyecite-style citation forms. reporters-db (1,167 reporters and 2,102 variants, per its GitHub README) and courts-db are profile data.
- **Its resolver** lives in `standards` (layer 5): "verified" means it matches a held capture that states this citation; anything else is "not verified". Most reporter citations will read "not verified", because a slip opinion does not carry its later reporter cite. This is expected, and it is measured. Its home is now named (R-2 C-E5).
- **The AI's part:** Machine-attributed: registering a proceeding from a captured register or caption, adding its number, resolving captures, threading an instance. Proposed and labelled: parties, flows, dates, duties, interprets links and treatment, related proceedings, precedent. Never: stating what a ruling holds as its own sentence (B12), entering an unadopted deadline, spending a fee unattended, or registering a private party.

**Stages:**
- **C1, follow a proceeding** (§4 stage 2). Work: the entity kind and facet; profile spaces, kinds, reporters and courts, and flows; the three doctypes in a `docprofile` split; the row diff; the change to monitoring; the progressions date anchor; the `actions` link; the citation check. It unlocks the court-case and regulatory-proceeding front doors (into journeys 7, 13 and 14), A1–A5, A7, C1, C3's verification half, D1 and D2. Size: about 35 requirements, raised for the row diff and monitoring. Measure first: capture three registers whole (Alameda eCourt, a CourtListener docket page, a CPUC docket card) and see whether they can be followed; their number forms; how many proceedings the group would follow. Hard reasons it is not in stage 1: it depends on `lines` (parties) and on the `standards` move (decisions as law); it shares the `docprofile` split with LAW; and the register measurement decides the monitoring change (R-2 C-Feasibility).
- **C2, duties from proceedings** (§4 stage 2, after `duties`). Covers B1–B3; A6 needs amounts as values (ANALYSIS). Size: about 15–20 requirements.
- **C3, precedent and assistance** (§4 stage 3). Trigger: `extract` and `investigate` deployed, and LAW's provision structure built. An optional CourtListener Citation Lookup is a POST to an API. It needs its own path and must stay optional (D201); it is not existing plumbing (R-2 C-E6).
- **L5.** Trigger: members answering D-165's backward question by hand.

**The review's corrections, taken in** (R-2): The reachable level is narrowed: watching is built but not reachable (C-E1). The row diff is new work (C-E2). Monitoring cannot follow rendered or cookie-gated registers (C-E3). There is no existing as-of status read (C-E4). The citation check's home and meaning are now stated (C-E5). CourtListener is a later option (C-E6). The reporters-db figures are cited to the README (C-E7). B3 is regular, not core (C-E8). Private names never become aliases (C-Doc). The member words "proceeding" and "register" go to Bob in B20 (C-P17). Sealed material: a capture of a document later sealed, or a record later unsealed, is held under a policy the D-C6 principle extends. Restricted records stay deferred (D140, D-124), and DEC-100(2) declines confidential filings on the group's own docket. This is open, §9. C1 is a joint stage, sequenced after `lines` and the LAW move.

### 2.5 ANALYSIS

**Anticipated work** (ANALYSIS §1).

Core needs: **A1, test a government's claim against its own per-record data.** "The city says it filled 90% of reported potholes. Is that true?" (journey 6). **A2, pin down the claim's terms and period.** "Undetermined, because the city does not define it." **A3, put a spot-check sample with its denominator beside the records.** "Of 40 closed reports we visited, 11 were not repaired." **A4, threshold tests.** "Certified at 61.8% when two-thirds was required." **B1, budget against actuals.** **B2, fund flows over fiscal years.** "$52.6 million diverted over nine fiscal years, about 10% of sewer charge revenue" (the founding case). **C1, filter, count, total and group a dataset.** **E1, every number a case relies on recomputes without Civicsmith** (DEC-112).

Regular needs: reconciling two sources (B3), contract checks (B4), a breach's effect (B5), version changes (C2), the government's own workbook (D1), a member's own spreadsheet (D2), figures read off PDFs (D3; PDF tables were measured NO-GO), charts (E2), patterns and progress (F).

**Ladder** (ANALYSIS §2):
- L0: cite a figure.
- L1: arithmetic over cited figures.
- L2: a reproducible calculation over a dataset (typed tables, recipes, recomputed by a stranger's checker).
- L3: spreadsheet analysis in the record (bound, recomputed, linted, the method noted, carried whole).
- L4: longitudinal and comparative (across fiscal years, reconciliation, dataset revisions, recorded random samples, charts).
- L5: assisted.

**Where it stands.** **Built:** L1, but only inside `consequences`, layer 9, after a noncompliant determination, and counts over the record. The figure parser has no `%`. A figure must appear verbatim in the passage. `count` counts the operands given. `passageText` of a single cell answers null (`content/notice.mjs`, `heldTextAt`), so the "natural operand", a spreadsheet cell, does not work. No module in layers 4–8 holds a number as a value. **Reachable:** L0, which is citing a document or sheet range, plus facet counts in search.

**Target: L2 first, then L3; L4 and L5 on their triggers** (ANALYSIS §5). Every core need sits at L2. Importing and checking a member's workbook answers Bob's "spreadsheets for more comprehensive challenges" without growing the product into a spreadsheet or BI tool (DEC-48).

**Architecture: one construct with two engines** (ANALYSIS §5; corrected by R-3).
- **`calc-grammar`**: layer 1, pure, after `civil-time`, about 800–1,200 lines. It holds the figure parser (moved from consequences), typed values, units and currencies. It holds the closed recipe grammar and its evaluator: select, count, sum, difference, ratio, a share that always carries its denominator, group, a `span` computed by `civil-time`, compare, round, and joins only through an id space or a captured crosswalk. Method version `bio-calc/1`. No eval, no user code, no ranks. The case checker imports it, as it imports `strength/method.mjs`.
- **`calculations`**: layer 5, last, after `retrieval`, about 2,000–3,000 lines. **Tables**: CSVW or Table Schema, canonical CSV plus a schema, hashed. A header is declared, never assumed. A value that does not parse as its type is listed as undetermined, never coerced. **`CALC-` objects**: question, terms, period, inputs, kind (recipe or workbook), results with denominators, recompute status, lint, grade facts, method note, checks. Bindings, the reevaluation cause `calculation_input_changed`, and the ops. Because `standards` now sits earlier in layer 5, a threshold can cite a held standard at its version, not only a captured passage (BN 11).
- **Results are stored, keyed by `sha(recipe, inputs, method_version)`.** They are recomputed at acceptance, at publication and in the checker, and are not recomputed on every read. Large tables would otherwise compete for the one isolate's 128 MB, which is shared by every concurrent request, and for the 30 s default CPU (R-3 A-Feasibility, A-E6). The starting bound is 20 MiB or about a million cells, to be measured for both CPU and peak memory.
- **`sheet-worker`** (stage A2): a fleet Worker on the `ocr-worker` precedent, inert until DIST deploys it. It wraps the candidate engine as wasm and returns a hashed recompute report. Macros are never run. Its installation and update work is counted (R-3 A-O6).
- **The workbook path:** capture the inputs; declare the tables; the member works in any spreadsheet program; upload it as an *analysis workbook* (member origin); bind it cell for cell; recompute; lint (a short range of the Reinhart–Rogoff kind, constants inside formulas, numbers stored as text, totals that do not cross-foot); a method note; an optional second member's check. The workbook is carried whole.
- **IronCalc is the candidate engine, not a settled one.** It is "work-in-progress", "very early stages", and gives no function count. It is decided only if stage A2's agreement measure on the corpus's 288 workbooks passes. Otherwise a workbook is recorded and disclosed as "not recomputed here" (R-3 A-E1). HyperFormula is excluded (GPLv3), and so is any cloud spreadsheet.
- **Grades** (R-3 A-E4). A result's capture axis is the weakest capture among its inputs, each capped by its derivation (D92). Recipe arithmetic is pure, tested and recomputed, so it is not a weakening step. **A workbook value computed by a third-party engine is a derivation step**, so its cap stays undetermined until the engine is measured. Unbound inputs are testimony (grade D).
- **`compare` gives a computed fact about two numbers**, labelled as such. It never says "breach" or "noncompliant"; that determination stays a member's act in `conformance` (D275; R-3 A-Doc 2).
- **Visibility.** Table rows are data in a capture, not record statements. D155 governs only frozen record-set inputs. A calculation whose input is hidden from a viewer is withheld from that viewer whole (DEC-36, DEC-85), and counts follow retrieval R29 (R-3 A-O3, A-Doc 1).
- **Extensions:** office-readers and odf-reader gain typed cells; content can read a cell's value through its table; record-grammar gains the `calculation` type; inquiry-grammar and inquiry gain the `calculation` leg kind (B13); strength computes grade facts; reevaluation gains the new cause; case-grammar, case-checker and **case-import** carry calculations. An imported case's calculations are recreated, never trusted (DEC-112, D312; R-3 A-O1); publication and public-read show outputs and charts; consequences R2 accepts calculation outputs as operands (B14); intent R4 and progressions R32 gain amount filters at stage A3.
- **The AI's part:** it proposes a recipe, a table's types or a PDF table's structure, and explains lint. The model never produces a number that enters the record. A number it states in conversation is labelled `derived` and is not stored.

**Stages:**
- **A1, "Check a claim"** (§4 stage 1). Work: `calc-grammar`, `calculations`, typed tables, recipes, the leg kind, carriage in the case file. It unlocks journey 6 end to end, budget against actuals for one year where the city publishes XLSX or CSV, the bond's two-thirds test, the dataset front door, and the founding case's ACFR figures through typed transcriptions attested by a second member. Size: 2 new modules, about 10 extended, about 55 requirements. Measure first: recipe coverage of every calculation in the journeys; a dataset census against the 8 and 20 MiB bounds; the DO's cost to normalise and evaluate 20 MiB, CPU and peak memory; exactness against a decimal reference; a walk-through of journey 6's "Work it out" step with the design stream. The "Work it out" step is the design stream's, designed against these services once they are in (K1430; R-3 A-O5).
- **A2, workbooks** (§4 stage 2). Work: `sheet-worker`, import, bindings, recompute, lint, method and check acts, export from recipe to XLSX. Trigger: a calculation the grammar cannot express, or a professional member's workbook in a real case. Measure first: which functions the 288 workbooks use; how often IronCalc agrees with the cached values; the wasm's size.
- **A3, longitudinal** (§4 stage 3). Work: budget and financial-report readers; joins through fund and program keys; portal snapshots with keyed diffs; recorded random draws (B14); Vega-Lite charts; amount filters. Trigger: a multi-year fund case or a reconciliation.
- **A4, assisted.** Trigger: a propose-capable mode deployed, with acceptance measured.

**The review's corrections, taken in** (R-3): The engine is a candidate (A-E1). Shipping an engine beside the checker would amend case-checker R13, which requires one self-contained file. That goes to Bob (A-E2, B14). The consequences R2 change goes to Bob (A-E3). The grade rule is made consistent (A-E4). FDTA, reworded: Phase 2 is due 1 October 2028, two years from Phase 1's effective date. 8 June 2026 is only the date of an article about the final rule. ACFRs stay PDFs for years (A-E5). The memory limit is shared across the isolate (A-E6). `case-import` is added (A-O1). The canon conflict with TAD is recorded: TAD v10 §8.3 says "spreadsheets only as OUTPUT" and §9 "Never a spreadsheet". It is amended, citing X113, under which the retired substrate's spreadsheet rulings do not carry over (A-O2; §7 item 12). Withheld inputs (A-O3). Person-level rows (A-O4, B8). The UX step (A-O5). DIST (A-O6). Plane-drawn samples go to Bob as doctrine (A-Doc 3, B14). Decision 8, live cloud spreadsheets, is **already ruled**: DEC-67, "Period." It is reported, not re-asked.

### 2.6 QUESTIONS (the assistant)

**Anticipated work** (QUESTIONS §1).

Core needs: **A, find and recall.** "New content over the weekend on the Sewer Fund project", which is DEC-27's own example; "which documents mention the franchise fee, and which haven't been read"; "how strong is this question, and what's the weakest link". **B, use the system.** "Why won't it let me publish?"; "Help me open a project." **C, turn a problem into questions.** "The potholes on my street never get fixed: what can we ask?" **D.1, explain a charge or rule.** "What's this sewer maintenance charge on my water bill?" **E.1, when something is due, and from whom.**

Regular needs: what a provision requires and when it was in force (D.2); what a term means (D.3); what is late (E.2); offices (F); analysis (H); "what could we do" (I); language and voice (J). Courts (G) and finding a member with expertise (K) are occasional.

Practice shows the harm is greatest exactly where Bob wants the assistant to go: retrieval-backed legal tools were wrong 17–34% of the time; general models were wrong 58–88% on case law; New York City's chatbot advised illegal practice and is being shut down; 45% of assistant answers about news had a significant problem.

**Ladder** (QUESTIONS §2):
- L0: typed search.
- L1: ask the record (plain words in; a cited answer naming the levels searched, its bound and what is withheld; explain a screen or a refusal).
- L2: ask it to set things up (CREATE from the member's words, labelled drafts, start runs).
- L3: answers that apply rules (law, deadlines, offices, arithmetic, from the plane's services).
- L4: investigative questions (a bounded run across the four levels; the backward question).
- L5: standing questions. Not proposed: no standing AI run (D13).

**Where it stands.** **Built:** L0 in full, the substrate of L1, and a slice of L4 (the CHECK run). The substrate of L1: retrieval's envelopes, the pack's four-level layer, and the worker translating intent into queries (`model.mjs`:215–226). **Reachable:** L0. No deployed copy runs any AI. There are five reasons, all verified (QUESTIONS §3.1, R-3): Nothing to ask into: no panel, INTERPRET or FIND; `SCREENS` and the wizard library are empty. `check` is an adversarial evidence-checker, not a question-answerer. It cannot run: only `check` is deployed; a member's run is withheld (`MEMBER_PRINCIPAL_RUN`); the installer never sets a model key or the `ai` credential; `AGENT_WORKER` is inert; whether model turns run at all is in conflict: they run at `agent-worker/src/index.mjs:1457`, while the header at l.34 says they do not. The worker's reach (agent-worker R37) holds no law, clock, profile or organisation read. The setup design rightly names a Claude subscription (DEC-55), but the code accepts only an API key (K1429).

**Target: L3 in stages, L4 in bounded steps; L5 not proposed** (QUESTIONS §5).

**Architecture.**
- **The closed-book rule** (B12) extends DEC-8 and DEC-27. Every rule comes from the plane. Of the four kinds, system rules come from affordances, the group's rules from its reads, jurisdiction rules from profile services, and the law's text from `standards`. The model only understands the member's words, writes queries, quotes and translates. Where the plane holds no rule, the answer says "not held", at its level, and offers the act that would find it.
- **`answers`**: a new layer-6 module after `skills` and before `agent-worker`, about 1,500–2,500 lines. It holds the answer contract and the plane's delivery checks: `ANSWER_CITES_UNREAD`, `ANSWER_FIGURE_UNSOURCED`, `ANSWER_RULE_NOT_PLANE` and `ANSWER_ABSENCE_WITHOUT_LEVEL`. Each is a named refusal with its translation, and an unsupported sentence is withheld with a note saying so. Quotes always sit beside the summary. It holds the asking scope, the interpretation shape and the tallies. It imports the layer-5 services directly once they sit there (`standards`, `local-facts`, `lines`, `duties`, `chronology`, `calculations`). The layer-9 ones (`conformance`, `consequences`, `action-clocks`) come in by registration (`registerRuleService`, the ai-runs R47 pattern). QUESTIONS itself needs no move: the worker reaches the plane only through ops (X26; agent-worker R44). Inquiry, progressions and publication *code* still do need the moves (BN 12).
- **Rule services** are non-mutating ops. Law: `standard`, `standardinforce`, `profiles`. Time: `deadlinecompute`, new over `civil-time`. Organisations: entities, lines, holders, duties. Figures: a non-persisting recipe evaluation. The record, and the system. Excluded: `sources*` (DEC-78.5), member search history, and admin ops.
- **Other modules:** `run-rules` gains mode `ask` (read-only, interactive, deployed apart); `agent-worker` is split for P6 (3,766 lines); membership and credentials mint a short-lived `ai` grant at the member's act, with that member as viewer; `op=ask`; the `skills` `ask` layer; the wizard registry and library are filled; the installer carries the group's API key; the panel comes from the UX stream.
- **What is kept:** Nothing enters the record from an ask: the transcript stays on the device under a time limit, and use is counted only as unattributed tallies (B17). Each answer gives a one-line answer, the line naming the levels searched, and its bound; quotes and the query sit one tap away (B20).
- **The account (K1429, DEC-55).** The assistant runs on the group's or a member's own Claude account: a Claude subscription (Pro, Max, Team or Enterprise), or an API key as an option. Anthropic's support article confirms that Agent SDK and third-party app usage "still draw from your subscription's usage limits"; the 15 June pause withdrew only a planned separate credit. The conditions, from Anthropic's legal-and-compliance page: the account is signed in through Anthropic's own flow, and the product never collects or stores a Claude.ai password or session; usage is the account owner's; Pro and Max limits assume ordinary individual use, so a group sharing one assistant fits a Team or Enterprise plan or members' own plans. **The code is what diverges:** `agent-worker` calls the raw Messages API with `x-api-key` (`model.mjs:20, 43`). A subscription path runs through the Agent SDK, which runs Claude Code as its own process, so the agent runner moves into a container (Cloudflare Containers or Sandbox; to be measured, since spawning the CLI there has known issues). That is BOB's technical work, reported.
- **Cost.** On a subscription, the cost is the plan's flat price, bounded by its usage limits; R-3's per-token figures apply only to the API-key option (Sonnet 5.5 about $0.07–0.18 an answer cached, $0.14–0.35 as built; unmeasured). Either way the code today records no `usage`, sends no `cache_control` (`model.mjs:68`) and has no bound but a 1,000,000,000-byte segment (`model.mjs:25`), so neither a plan's limits nor a key's spend can be watched.

**Stages:**
- **Q0, make any assistant runnable** (§4 stage 0). Work: the subscription path (the Agent SDK in a container, signed in through Anthropic's flow), with the API key kept as an option; install and update carry the group's account; deploy the agent runner; settle the model-turn conflict and R53's automatic plan deployment; add `cache_control` on the API-key path; record `usage` on every call; a use ceiling per group and per member, with a stated refusal (B16); verify CHECK's first live run (VF-4). Measure first: one model turn on a deployed copy through each path (latency, CPU, cost or plan usage), and whether the container runtime starts Claude Code reliably.
- **Q1, ask the record** (§4 stage 1). Work: `ask`, `answers`, the grant, `op=ask`, the panel, the wizards. It unlocks journey 9's front door for finding and help, journey 3 (a newcomer asks what "Undetermined" means), journey 4 steps 1–2, and UC-092 and UC-008. Size: 1 new module, about 7 extended, about 30–40 requirements. Gate: at least 150 real questions measured for grounding, correct abstention, correct level statements, mistranslation, false refusals, latency and cost on two models, against a bar BOB sets *before* measuring.
- **Q2, set things up** (§4 stage 2). Work: CREATE, conducted acts, runs started from the panel, drafts; suggestions if B17 allows. Trigger: Q1's bar is met in use, and investigate is verified live.
- **Q3, rules applied** (§4 stage 3). Trigger: TIME, LAW, ORGANISATIONS and ANALYSIS have shipped their first services, and the profile's facts are sourced.
- **Q4, the question-to-run hand-off** and the backward question. Trigger: the tallies show many answers ending "not held" or "start a run".

**The review's corrections, taken in** (R-3): The cost is corrected (Q-E1). The terms are cited in full (Q-E2). "Per-ask bounds" do not exist yet; they become a Q0 deliverable (Q-E3). The `wrangler.jsonc:103` quotation is corrected to its text as written (Q-E4). TAD v10 is engaged: l.597–617 and 670–675 rest on the paused billing change and a retired substrate, X113 and X135 (Q-O1). Spend ceiling (Q-O2). Rate tiers (Q-O3). Runs costed (Q-O4). The asking scope opens standards, profiles, entities, `frontier` and `strengthbarof` to a model. That widens the AI's least privilege (D9, DEC-37, DEC-55, agent-worker R37), so it goes to Bob in B17 (Q-Doc 1). Q5 is reframed as the policy questions Bob owns (B16).

## 3. The architecture across constructs

### 3.1 Obligations: the thread, and its one home

**One construct, not three** (BN 3; R-1 T-O1 and O-O2; R-2 C-O). Three studies proposed the same thing in different places. TIME proposed an `expectation`, a rule plus instances, in `progressions`. ORGANISATIONS proposed `obligations`/`OBL-` in a new module. COURTS proposed duties from orders, decrees, grand jury reports and audits. LAW names the authority. They become **one record object in one layer-5 module**. ORGANISATIONS' design is the base, because it carries an obligor, a source and an in-force period. TIME supplies the computation (`civil-time`) and the anchor dates (`chronology`). COURTS adds two fields. `progressions` remains the declared flow that observes an obligation.

**The name.** "Obligation" is a taken word: DEC-107 reserves it, on members' and readers' screens, for a public body's duty, and keeps the queue's internal code `OBLIGATION` (a member's to-do) unchanged. So: **Members see:** "obligation" for a duty or prohibition, and "power" for what an office may do (B20). That is DEC-107's own sense. **The module and ids are `duties` / `DUT-`.** Neither name occurs in `build/requirements` or `bio-plane/src` (checked). So no internal name means two things (D320), and DEC-107's "internal code unchanged" stands. ORGANISATIONS' proposed rename of `OBLIGATION` to `TODO` is withdrawn (R-1 O-P17). TIME's `expectation` is not used as an object name. **Its queue item is the reserved FINDING kind `temporal-expectation-due`** (`queuestate.mjs:164`), produced at last. It is shown as "Noticed", with its derivation (R-1 T-E5). No new kind is added.

**The object** (merged from ORGANISATIONS §5, TIME §5 item 6, COURTS §5, LAW §5.3): `DUT-`, version; `modality`: duty, prohibition or power; `obligor`: an office or body entity, **never a private individual** (actions R9); `obligee`: an entity, an audience, or "the public"; `performance`: report, publish, respond, meet, decide, deliver, pay, notify, audit, enforce, or other; `source`, which is one of: a held standard with its passages and its version in force (LAW); a court standard's paragraph (COURTS); or `{practice: measured custom, basis}`, labelled practice and never law (X45); or `{dependency: the event it must precede, lead, why}` (K1431), labelled as a dependency and never as law; `trigger`: an event, a recurrence, a date, or a request; `time`: a rule reference or interval. It is computed by `civil-time` and never stored (D245); `exceptions`, with the documents that discharge them; `enforcer`: the office a breach is addressed to. A contractor's breach is routed to its enforcing office (R-1 O-Doc); `observed_by`: a progression stage, a watch, or a document kind resolving to the obligor; `arising_in`: a proceeding (COURTS); `reported_status[]`: what a monitor, an auditor or the respondent reported, quoted and never graded (COURTS); `in_force`: derived from the source's period; `declared_by`, `at`.

**Occurrences are derived on read** (progressions R24's rule): Each has `{due, state: met | met_late | overdue | pending | discharged | undetermined, evidence, why}`, in the shape of an OCDS milestone. The date a deliverable *appeared* comes from `chronology` (its own date, or a source's publication instant), never from capture time (R-1 O-O3). "Overdue" raises a question and never asserts a violation (D241). Met occurrences are shown with the same care (D330).

**Profile deadlines are generic duties.** A profile deadline (R26: the records law's response period) is a template for "the agency asked". So a records request's clock is one occurrence of the addressed office's duty, and the two homes of lateness (X52, X60) share one meaning. The group's own checkpoints and reminders stay on its plan, in layer 9, and are never a finding about government (D234).

**Direction of use.** `duties` uses `progressions`, `standards`, `lines`, `local-facts`, `chronology` and `civil-time`. `progressions` may store a `DUT-` id as data but never reads `duties` (P4; R-1 O-O4). `conformance` (layer 9) names the duty an `obligation_against_act` determination judges. `escalation` targets the enforcer.

**How the obligation joins the constructs:** the obligor and the lines between bodies come from ORGANISATIONS; the authority comes from LAW; the due date comes from TIME; orders and reports come from COURTS; the measured performance comes from ANALYSIS (a calculation output as the evidence of an occurrence); the cited answer to "who must do what by when, and are they late" comes from QUESTIONS.

### 3.2 The total order: what moves, what is new, what stays

**Proposed order** (settles BN 1, 2 and 11; starts from R-1 T-O2's order; checked against `build/modules.json` at `tranche/T32` 8fa5ab4e3d).

**Layer 1.** `civil-time` sits directly after `jurisdictions`. It uses record-grammar and jurisdictions. `calc-grammar` sits after `civil-time`. It uses record-grammar and civil-time. `sheet-worker` is a fleet Worker. It arrives at stage A2. The citation-form recogniser extends `id-spaces`.

**Layer 5 runs, in order:**
1. `entities`.
2. **`lines`**: uses only layers 1–4 and `entities`.
3. **`local-facts`**, moved from position 72. Its uses today are record-grammar, jurisdictions, record-core and membership. It gains `lines` (R6 follows `part_of`) and `civil-time`.
4. `connections`.
5. **`standards`**, moved from position 73. Its uses today are record-grammar, jurisdictions, record-core, membership, promotion and content. It gains `entities`, `extraction`, `connections` (for `standardsFor`) and `civil-time`.
6. **`chronology`**.
7. `progressions`. It gains `chronology`, `local-facts`, `standards` and `civil-time`.
8. **`duties`**.
9. `bias`, `observation-log`, `query-language` and `retrieval`, unchanged.
10. **`calculations`**, last. It may now cite a held standard as a threshold.

**Layer 6.** **`answers`** sits after `skills` and before `agent-worker`.

**Nothing breaks.** `standards`' users are `conformance` (position 74), `filings` (80), `action-plans` (82), `affordances` (87), `control-plane` (94) and `plane` (95). `local-facts`' users are `action-clocks` (78), `filings`, `affordances`, `queue-producers` (89), `control-plane` and `plane`. Every user sits later than the new position, and both modules' code and tests import only earlier layers (R-1 O-Confirmed; R-2 L-E7). **Mechanical work, BOB's:** `modules.json`, and the layer-5 and layer-9 rows of `layers.md`; membership R83's `MODULE_ORDER` re-pin; a test that the `standards` promotion check runs correctly when it runs earlier relative to layer 5–8 listeners (R-2 L-E7); the format check. **Bob's (B2):** the amendment of K11's module list; layer 5's contract gains "the law and local facts held over captured content"; layer 9's contract keeps "a standard held in the record".

**What stays in layer 9, and why.** **`conformance`** stays, because a determination rests on published findings (K102, DEC-26). It uses `publication` and `reevaluation`, so it could not move anyway. **`consequences`** stays as the size of a breach's effect, because it uses `conformance`. Calculation's low home is the new `calculations`; consequences R2 merely accepts its outputs (B14). **`action-clocks`** stays as the group's own action clock, because it uses `actions` and `conformance`. Its counting delegates to `civil-time`, and a body's deadlines move to `duties`. So the brief's structural observation resolves. Law and local facts move down. Calculation and a body's time duties gain new low homes. Acting stays after Publication.

**The registration alternative** (R-2 L-E6). Stage 1's search fields alone could manage without the move. Retrieval R53's `registerActionFacts` already lets layer 9 put data into a layer-5 search, and stage 1's retrieval fields are data. The move becomes **necessary** when a layer 5–8 module must call `standards` or `local-facts` in code. Five cases: an inquiry leg that rests on a held standard (B13 (iii), already in stage 1); `progressions` and `chronology` reading confirmed calendars (TIME T2); `duties` reading a source in force (ORGANISATIONS O2); contradiction's canon proposals (LAW L3); publication's Criteria (N16). The move is cheap, and with B13 (iii) even stage 1 needs it in code. B2 recommends making it at once rather than building a registration seam that would later be thrown away.

**Size, P6.** Every new module is planned under about 3,000 lines. `docprofile` (3,170 lines) is split before LAW's reader and COURTS' doctypes land (K617, BOB's). `agent-worker` (3,766 lines) is split for the asking flow (B3). `contradiction` (over 3,100 lines) absorbs nothing. `standards` grows to about 1,800 lines. If it nears 4,000, `law-relations` is split off.

### 3.3 Where the assistant's question-answering sits, and what it may call

**Where it sits.** The model runs in `agent-worker`, a separate Worker in layer 6. It reaches the plane only through ops. So the barrier is which ops a mode may call, not the import order (X26; agent-worker R44). The plane-side contract and checks live in `answers` (layer 6). They import the layer-5 services directly once these sit there, and take the layer-9 rule results by registration (`registerRuleService`).

**What `ask` may call: reads only.** record reads: search, meaningrows, frontier, contentaxis, strength reads, basis versions, the version chain, leads, the queue, intent proposals, the run log; law: standards, the in-force read, profiles; time: `deadlinecompute` and fact status; organisations: entities, aliases, resolutions, concerns, lines, holders, duties and occurrences; figures: a recipe evaluated without being stored; the system: affordances, whoami, the dry runs. All of these run under the asker's view, through a short-lived grant the member mints.

**What it never calls:** any write; `sources*`, which identify the group's sources; member search history; admin or export ops. Widening the AI's reach to the law, profile and registry reads is put to Bob (B17).

**What it may do beyond reading:** propose (`standardpropose`, `calculationpropose`, line, duty and table proposals) in modes deployed for that purpose; start a run only at the member's act; **never** state a fact or a rule the plane did not return (B12).

### 3.4 One as-of model for organisations, law, courts and time

**One validity value, read the same way everywhere.** The value is `{valid: {from, to, precision}, basis}`. Its bounds are EDTF level-1 civil dates in the governing zone. A null bound means "not stated", never "always" (standards' terms, generalised). It is read only by `civil-time.validAt(value, date)`, which answers `in`, `out` or `undetermined {why}`. The reasons are: no bound stated; the date falls in an imprecise band (the D-516 band applied to civil dates); or the latest basis predates the date by more than its horizon.

**Where the value is used:** a standard's period (`inForceAt`); a line's validity, and an office holder's tenure (`structureAt`, `holderAt`); a duty's in-force period (derived from its source); a proceeding's status (derived from its threaded stages); an adopted profile rule; a dataset vintage (generalising `id-spaces`' `roll_year`).

**Valid time and record time are kept apart (bitemporal).** When a thing was true in the world is kept apart from when the record learned it. The record learns through append-only rows and their write instants, which stay in UTC. So "what did we know on D" and "what was true on D" are different reads, and each says which it is. Search reads answer as of the date asked, and a read never caches "now" (the `overdue:` defect, §7 item 5).

### 3.5 What the AI proposes, and what the member decides

Throughout, the machine looks, finds, proposes and prepares, and never attests or concludes. Its words are labelled drafts until a member keeps them (K1364). Proposals are stored apart and become the member's only by the member's act (D53). It never runs on a schedule (D13).

| construct | the machine (labelled, reversible) | written by the machine, attributed to it (B7) | the member decides |
|---|---|---|---|
| TIME | dated facts and imprecise dates (EXTRACT); clock entries from profile rules (plan); the window a phrase resolved to (FIND) | system-rule reader dates, labelled with their method | adopting a computed deadline (B4); confirming calendar facts (D15); accepting extracted dates |
| ORGANISATIONS | lines, holders and duties read from charters, charts, contracts, orders and budgets | lines and holders from source-native data with identifiers at both ends (Legistar seats); seeding profile offices | adopting every duty and power, naming its clause; any line from a name match |
| LAW | candidate standards with captured text; structure and relations; comparison rows; a labelled reading (B12) | none | declaring and adopting standards; adopting relations that change an in-force answer; determining; governing laws |
| COURTS | parties, flows, dates, duties, interprets links and treatment, precedent (as capture requests) | registering a proceeding from a captured register or caption; its number as an alias; threading an instance | adopting flows, deadlines and duties; any private party is out of scope (B8); fees by the member's act (B15) |
| ANALYSIS | recipes, table types, PDF table structure, lint explained | none: only the evaluator computes | the question, terms and inputs; adopting the calculation; the method note; a check; publication |
| QUESTIONS | interpretation, one clarifying question, cited answers, drafts, suggestions (B17) | nothing enters the record | every keep, create, start, file and send |

## 4. One staged path across constructs

Stages are given in dependency order. Each stage carries everything that can safely be done in it, and anything left for later names its hard reason (P19): a dependency not yet built, a measurement, a deployment, or a question that is Bob's. **Two preconditions hold for every member-visible stage:**
- **Substrate first (K1430).** Each stage builds services, not screens: its ops, reads, refusals and vocabularies are published so the design stream knows what it can do and designs against it, and the UX work continues once they are in. A screen is never a precondition of a stage; "unlocks" below names what becomes possible for the screens to offer.
- **The measurements.** Every "measure first" item becomes an `M-<n>` before that stage's requirements are drafted (D350).

**Stage 0: runnable and correct.** No new module.
- Work: QUESTIONS Q0 in full (§2.6); the corrections in §7 that need no new module (items 1, 3 at its two reachable sites after B9 (iii), 7–13); and the measurements of stages 0 and 1. Items 2, 4, 5 and 6 are fixed by `civil-time` in stage 1, because fixing them in each module first would build the engine twelve times (G10).
- **Unlocks:** no false "overdue" marks on typed clocks; a setup page that asks for the right credential; every AI stage becomes testable. Nothing new for members.
- **Size:** about 6–10 requirement changes in agent-worker, run-rules, installer, actions, monitoring and query-language.
- **Measure:** one model turn on a deployed copy; rate limits on a new Console account; the stage-1 measurements listed in §2.

**Stage 1: the shared ground** (TIME T1, LAW L1, ORGANISATIONS O1, ANALYSIS A1, QUESTIONS Q1).
- **Modules:** new: `civil-time`, `lines`, `calc-grammar`, `calculations`, `answers`; moved: `standards` and `local-facts`; extended: about 30 others (jurisdictions, entities, docprofile after its split, extraction, actions, conformance, escalation, action-clocks, filings, monitoring, queue, queue-producers, query-language, retrieval, progressions, inquiry-grammar, inquiry, strength, reevaluation, record-grammar, content, office-readers, odf-reader, case-grammar, case-checker, case-import, publication, run-rules, skills, agent-worker after its split, membership and credentials, affordances, op-declarations, control-plane).
- **Size:** 5 new modules and about 195–225 requirements (TIME 35–45, LAW 30–40, ORGANISATIONS about 45, ANALYSIS about 55, QUESTIONS 30–40). The five strands are independent except that `calculations`' `span` uses `civil-time`, and `local-facts` R6 uses `lines`. Both are ordered within the stage.
- **Unlocks for members:** journey 5: a due date from the law, overdue once, the office that holds the records; journey 13: addressee, escalation target, standard and determination; journey 4 step 3, by the member: find the city's own standard; the "law, code or policy" front door; journey 6, "check a claim"; budget against actuals for one year; the bond's two-thirds test; "offices and who held them" for council and committee seats; journey 9's front door for finding and help; journey 3; UC-118, UC-127, UC-164, UC-165 and UC-092.
- **Measure first:** the 20 worked deadline examples, each with a negative control (P7); the Legistar seats; the directories census; code serving and section accuracy; recipe coverage and the dataset census; the cost of a 20 MiB table; the 150-question set with its bar.

**Stage 2: what bodies owe, their meetings and proceedings** (TIME T2, ORGANISATIONS O2, COURTS C1 and C2, LAW L2, ANALYSIS A2, QUESTIONS Q2).
- **Modules:** new `chronology`, `duties` and `sheet-worker`. Extended: progressions (event anchor, single-stage duties), monitoring (`per_meeting` cadence, row diff, rendered registers), jurisdictions (recurrences, fiscal year, proceeding spaces, kinds and flows), entities (`proceeding`), lines (party and proceeding families), the docprofile court split (three doctypes), standards (amendment relations, definitions, the citation resolver), strength (common issuing body), inquiry (legs on occurrences, B13), intent, queue-producers, skills.
- **Size:** 3 new modules and about 150–180 requirements (T2 35–45, O2 about 60, C1 and C2 about 50–55, L2 20–30, A2 and Q2 as stated).
- **Unlocks:** watching a body's meetings: agendas, minutes due, notice; "Waiting on the City Clerk's reply, due 14 October", from data; the franchise and contract journeys; "was the transfer authorised", answered with powers and their instruments; the flow model's gap, shown as "Noticed"; following a court case or regulatory proceeding; grand jury and audit follow-up (the founding case's February 2022 recommendations); "what did §X say on D"; a member's own workbook in the record; setting things up from the panel.
- **Hard reasons it is not stage 1:** `duties` uses `lines`, the moved `standards` and `chronology`; COURTS needs `lines` and the move; `chronology` needs reader date accuracy measured; workbooks need the IronCalc agreement measure and a DIST deployment; Q2 needs Q1's bar met in use and investigate verified live.

**Stage 3: applied and assisted** (TIME T3 and T4, LAW L3, COURTS C3, ANALYSIS A3 and A4, QUESTIONS Q3, ORGANISATIONS' EXTRACT).
- **Modules:** no new module expected (`law-relations` only if `standards` nears P6).
- **Work:** `validAt` everywhere; recodification; dated Memento; the lateness pattern and the timeline view; compliance analysis, canon proposals and the labelled reading; precedent and treatment; budget readers, joins, keyed diffs, random draws and charts; the plane rule services for the assistant; EXTRACT proposals of dated facts, lines and duties.
- **Size:** about 80–100 requirements.
- **Unlocks:** explaining a charge or a rule; "when is it due", "who is responsible", "are they late" and "actuals against budget" in plain words; multi-year fund cases (the founding case's nine fiscal years); reconciliation; a published chart.
- **Hard reasons:** the investigate and extract deployments, with acceptance and precision measured on gold sets; stage 2's objects; budget-reader feasibility, measured against M-55; a profile with sourced rules (today: one rule, UNMEASURED, and 2026 holidays only).

**Stage 4: network and imports** (ORGANISATIONS O3, LAW L4, COURTS L5, QUESTIONS Q4).
- **Work:** shared structure, duty and law packs, recreated per group; Akoma Ntoso, USLM and eCFR imports; exports; the question-to-run hand-off; the backward question.
- **Hard reasons:** no group asks for it yet (D224: a capability serves the path), and it sits outside the targets in B1; tallies from Q1 to Q3; D-165's trigger.

## 5. Decisions for Bob

Each item below is policy, doctrine, the meaning of a requirement, layers and product modules, or UX (P17). Where two studies asked the same thing differently, the asks are merged into one item. **No change is asked** on determination timing: a determination still rests on published findings (K102 "for now", conformance R2; LAW §8 item 2). **Already ruled, not re-asked:** no live cloud spreadsheet (DEC-67).

**B1 · How far each construct should go (requirement scope).**
- Options: (a) close only the defects; (b) the levels the studies target; (c) everything, including the network and imports now.
- **Recommend (b):** TIME: L3, plus L4 for document dates, chronology and as-of reads; ORGANISATIONS: L4 for one city; LAW: L3 in the record and L4 in the AI's preparation, both during investigation; COURTS: L3, with L4's links held as data (this merges COURTS D-C1 (c)); ANALYSIS: L2 and then L3, with L4 on its trigger; QUESTIONS: L3.
- **Why:** each target is the lowest level that serves the core needs Bob described: a body's duties before publication, structure as of a date, the law at the act's date, following a proceeding, checking a claim, asking in plain words.
- **What follows:** §4's stages 1–3. L5 everywhere waits on a group asking.

**B2 · Move the law and local facts below Publication (layers).**
- Options: (a) Stay in layer 9. (b) Move `standards` and `local-facts` to layer 5 now, in the order of §3.2. `conformance`, `consequences` and `action-clocks` stay in layer 9. (c) Bridge stage 1 by registration, and move only when a layer 5–8 module must call them in code. (d) Also split conformance's comparison into a new layer-6 module now.
- **Recommend (b).** The canon makes law concurrent with investigation (FA L104–109). K102 calls comparison "inquiry work". No `uses` edge breaks. Stage 1's inquiry leg on a standard (B13 (iii)) and every later stage need the move in code, so (c) would build a seam only to discard it. (d) unlocks nothing yet; it is deferred until a layer 5–8 module must read a comparison.
- **What follows:** K11's module list is amended; layer 5's contract gains words for law and local facts held over captured content. With (a), investigation never sees law, calendars or duties.

**B3 · New product modules (architecture).** Approve each, at the stage in §4:
- stage 1: `civil-time` (L1), `calc-grammar` (L1), `lines` (L5), `calculations` (L5), `answers` (L6), and the split of `agent-worker`;
- stage 2: `chronology` (L5), `duties` (L5), `sheet-worker` (an L1 fleet Worker).
- **Alternatives considered:** fold `chronology` into `extraction` and `connections`: rejected, because D192 keeps temporal and referential relations apart, and `connections` is about 2,700 lines; fold duties into `progressions`: rejected, because a flow is not a duty with an obligor and a source; put duties in layer 9: rejected, because investigation could not see them; fold calculation into `inquiry` (3,897 lines) or `consequences` (unusable before publication): rejected; fold the answer contract into `run-productions`: rejected, because answers are not record writes; a `proceedings` module (COURTS option B): not now, but on the trigger "the facet needs its own acts and tables, or `entities` nears 4,000 lines".
- **Recommend all eight, plus the split.** None merges with another: they are different concerns, and each fits in one reading (P6).
- **What follows:** nine additions, over three stages.

**B4 · The obligation construct (requirement meaning, doctrine, words).**
- **(i) Adopt one held object** for what a body owes, as Bob defined it on 1 August, home of the flow model (§3.1). Recommend yes.
- **(ii) Who may owe one:** (A) public bodies only; (B) public bodies, and bodies acting for one under a public law, contract, franchise or grant ("the hauler's obligation under the franchise"); (C) any organisation. **Recommend (B).** Bob's own definition of nonconformity reaches "action by some other person or organization" (CM 906–908). A private individual is never an obligor, and a contractor's breach is addressed to its enforcing office (actions R9).
- **(iii) Who starts a body's clock** (whatever its basis kind: rule, commitment or dependency, K1431): a duty computed from a profile rule, or proposed by the machine, stays a proposal until a member adopts it in one act. From then it is tracked, and told once. **Recommend yes:** DEC-10's licence is that "the due-by was AUTHORED" (TIME D2).
- **What follows:** DEC-107's word now has an object; with (A), the franchise journey shows only "contract terms"; without (iii), the plane would encode law's rules (D-149).

**B5 · Registry vocabulary (doctrine: closed kinds).**
- **Entity kinds:** add `program` (a program, service or function), `place` (a division, with its identifier) and `proceeding`. This merges ORGANISATIONS D6 and COURTS D-C2 (A).
- **Line kinds:** a closed list, revised only by spec. Structure: `part_of`, `post_in`, `holds`, `reports_to`, `oversees`, `appoints`, `seat_on`. Money and contracts: `funds`, `contracts_with`, `acts_for`. Responsibility: `responsible_for`, `custodian_of`. Change: `successor_of`. Proceedings: `party_to`, `appeal_of`, `consolidated_with`, `remanded_to`, `arises_from`.
- **Options:** (a) as listed; (b) add no entity kinds, so responsibility targets become themes and a proceeding stays a document; (c) lines without the proceeding families.
- **Recommend (a).** Responsibility, funding and consequences already name programs; DEC-114 counts a place as a subject; a proceeding needs a stable identity across captures.
- **What follows:** the doctrine change "introducing a kind" (`entities/index.mjs:23–25`), made once for all three kinds.

**B6 · Evidenced lines may be walked, and powers are never a verdict (doctrine).**
- **The precedents on both sides.** For: DEC-16 rules a bounded walk that answers undetermined on exhaustion. Against: DEC-60 says "the intelligence goes into how the legs are formed and weighted, never into relationships the record computes over" (X91).
- **Options:** (a) dated, graded, cited lines may be walked: bounded, as of a date, weakest hop governing, undetermined on exhaustion, with no centrality or ranking; constitutive relations stay untraversed (entities R26); (b) single hops only.
- **Recommend (a),** because "who answers for this" and escalation are chains. Within (a), the powers read answers only *which powers are in force*, each with its instrument and any delegation instrument held. It never walks reporting lines as delegation, and never says whether an act was within powers. That is a member's determination in `conformance` (R-1 O-Doc).
- **What follows:** chains and escalation targets from data; DEC-60 is read as applying to inference about relationships, not to cited structure.

**B7 · What the machine may write without a member (doctrine; extends DEC-52 and DEC-53).**
- **Options:** (A) The machine writes, attributed to itself and shown for review, only: lines and holders from source-native data with identifiers at both ends (Legistar seats); profile offices seeded at setup; a proceeding registered from a captured register or caption, with its number, resolutions and threading; reader-stated dates, with their method.
    Everything else is proposed. Duties and powers are always proposals a member adopts. (B) Everything proposed. (C) The machine writes all.
- **Recommend (A).** It extends DEC-52 exactly as far as DEC-52 reasons ("an A-tier correspondence is not a guess the machine made"), while reading law into a duty stays a member's act (DEC-54: "propose, never install").
- **What follows:** structure arrives seeded rather than as a blank org chart.

**B8 · Private individuals (doctrine; people outside the project).** One rule across holders, parties, labels and data. This merges ORGANISATIONS D2, COURTS D-C3 and ANALYSIS 7.
- **The rule:** an office's holders are recorded only for offices the group registers, each tenure cited to a public document, with no attribute beyond role, dates and status; bulk import covers elected and appointed officials and office heads only, and drops contact fields; other staff appear only when a documented act names them in official capacity; a court party is an office, body or institution, otherwise the class "a private party"; a proceeding's label never carries a caption name; a calculation's outputs are grouped only by office, department or class; person-level rows (overtime by officer, Stop-Data) travel in a published case only redacted or aggregated, with the redaction disclosed.
- **Options:** (a) the rule above; (b) holders and parties for any public employee a document names, and per-person outputs for officials; (c) leave it to each group's editorial policy (D169).
- **Recommend (a).** It is Design Requirement 6 (D176), actions R9, and D-77 with invariant 7, carried into new domains. (b) builds the work-pattern profile DEC-11 warned of.
- **What follows:** predecessor accountability is kept (DR §6); no person is indexed by name.

**B9 · What the record may claim about time (doctrine and requirement meaning).**
- **(i) When a date is uncertain:** (a) always err early (K941); (b) direction-aware: the group's own deadlines use the earliest candidate date; a body is "overdue" only after the latest candidate date, and "possibly overdue: undetermined, because …" between the two; (c) undetermined whenever any input is uncertain. **Recommend (b).** (a) makes premature claims about bodies, the overclaim D77 ranks worst; (c) hides most real deadlines.
- **(ii) progressions R16:** a body's overdue duty runs from the event's own date, never from when the group captured the document. Without a stated date it is undetermined, with the capture date shown as a bound. **Recommend yes:** today findings can be misdated in both directions (TIME D6, verified by R-1).
- **(iii) The governing day (actions R12):** "a deadline is met by anything on its day" is read in the local day of the office's or venue's jurisdiction, not the UTC day R12 states today, and a rule may say "by close of business" using the office's hours. **Recommend yes.** Today a typed clock dated 30 March marks a body overdue at 17:00 Pacific that day (§7 item 3); it is also what "times with their zone" needs. This changes what a requirement means, so it is Bob's (TIME D7; R-1 T-P17).
- **What follows:** fewer, truer overdue findings; meeting chains wait on `chronology`.

**B10 · Profiles hold sourced rules (requirement scope; doctrine D-149).**
- **The question.** Should the jurisdiction profile hold, as data, the rules groups need? That means notice periods counted backward, rules in hours, tolling, `known`/`act`/`entered`/`served`/`hearing` anchors, recurrences, fiscal years, the weekend, the counting convention, law ranks, codifier status, case-number forms, reporters and proceeding flows, and the lead times a body sets for itself (an agenda packet a set number of days before a meeting, a budget adopted before its fiscal year; K1431). Each would carry a citation and a status, and each would be confirmed locally.
- **Options:** (a) yes, with R44's rule "UNMEASURED is not a basis" extended to `deadlines`, so a rule ships only with a primary source (R-1 T-Doc); (b) keep the profile to calendars and citations, so members type every rule.
- **Recommend (a).** D-149's fear is a rule that "goes stale silently". Its containment is the citation, the status, a confirmation horizon, the version notice, and a member's adoption (B4 (iii)).
- **What follows:** the Oakland profile's one `UNMEASURED` rule must be sourced before it applies. A first researched rule set: CPRA, Brown Act, OMC, Government Claims Act, FOIA.

**B11 · The model of law (requirements).**
- **(i) Model:** adopt the work, version and portion model (FRBR, as Akoma Ntoso uses it), with evidentiary law relations that cite the amending or referring instrument, instead of whole-standard supersession alone.
- **(ii) One home for cited law:** a governing law (actions R18), a records-request law and a deadline basis *may* name a held standard; the member's citation string stays their statement.
- **Recommend both,** staged as in §2.3. "The law in force on the date of the act" is the core need, and one fact belongs in one place (D368).
- **What follows:** the reverse index; Criteria lines naming a held version.

**B12 · What the machine may say about law, rulings and facts (doctrine; the line on unauthorised practice of law).** This merges LAW 4, COURTS D-C5, QUESTIONS Q1 and Q2.
- **(i) Closed book.** No fact and no rule from the model's knowledge. Where nothing is held, it answers "not held", at its level, and offers the act that would find it. **Recommend yes.** Retrieval-backed legal tools are still wrong one time in six or more, and "a confidently wrong assistant is worse than none".
- **(ii) Explaining:** (a) quote only, for provisions and rulings alike; (b) a labelled, cited *reading* of held text: it quotes the provision or ruling at its version beside the reading, states its limits ("undefined term", "exception at §…", "versions before … not held"), says "legal information, not legal advice", and never says "the law is", what a court decided as a fact, a member's rights, a likely outcome, or what to file; (c) free explanation. **Recommend (b) for statutes, ordinances and policies at LAW L3, and for rulings only once acceptance is measured (D40).** Until then rulings stay quote-only, as COURTS D-C5 (a) proposed.
- **(iii) Procedural facts** taken from the profile (which form, which venue, which deadline) may be shown, each as a fact and never as a recommendation (D279). An attorney-supervised mode is deferred until a group with a licensed lawyer member asks.
- **What follows:** the stage-3 explain-a-rule work; the `answers` checks enforce (i).

**B13 · What a finding may rest on, and how it is graded (requirement meaning: D-181, strength).** This merges ORGANISATIONS D8 and ANALYSIS 3.
- **(i) An occurrence of a sourced duty** may be a leg. Its derivation is the source in force, the trigger date, the due date and the level searched. **Recommend at stage 2.** DEC-14 already makes a body's non-response "a dated, capturable, first-party fact"; the four-level absence rule (D59) keeps it honest.
- **(ii) A `calculation` leg:** its capture axis is the weakest input capture, each capped by its derivation; recipe arithmetic is not a weakening step; a third-party engine's workbook value is a derivation step, undetermined until the engine is measured; unbound inputs are testimony; the method is disclosed, not graded. **Recommend yes.** It is consistent with DEC-21, D70, D92 and DEC-82.
- **(iii) A leg may cite a held standard** (inquiry R4 today allows only information and inquiry). **Recommend yes, from stage 1:** each requirement becomes a question.
- An action is never a basis leg (D113).

**B14 · The calculation construct (requirements and doctrine).**
- **(i)** One construct with two engines: recipes first, workbooks after. Recommend yes.
- **(ii)** consequences R2 accepts calculation outputs as operands. Recommend yes.
- **(iii) The checker and the engine:** (a) amend case-checker R13 so the checker may ship a fingerprinted engine file beside it; (b) keep R13: the checker recomputes recipes and bindings only, and a workbook is disclosed as "recomputed by the instance's engine; open it in any spreadsheet program". **Recommend (b)** until the engine has passed its measure. Then revisit.
- **(iv)** A second member's check is disclosed, never a gate. "A group may be one person" (D370).
- **(v)** At publication, a load-bearing calculation that differs on recompute, or has unbound inputs, is disclosed. Pre-flight refuses only an undisclosed difference (DEC-76.4's pattern).
- **(vi) Samples:** counts with their denominators from stage 1; a population estimate only from a draw the plane makes at random, seeded and recorded, over a frozen set, at stage 3. That draw decides which records members visit, which touches DEC-22 ("the machine does not choose what to look into"). **Recommend allowing it** as a mechanical draw, not a choice.
- **(vii)** `compare` results are labelled computed facts, never a determination (D275).

**B15 · Outside and paid sources (policy; sovereignty).** This merges LAW 7 and COURTS D-C4.
- **Options:** (a) Keyless public sources by default: codifier pages, the Legistar web API, eCFR, CourtListener's public pages. (b) Fee-bearing or account-gated records (PACER, state portals) fetched only by a member's own act, with their own credential, the price shown first, marked not reproducible by the public, never in an unattended run. (c) Keyed services (Open States, a CourtListener token, commercial legal databases) on a group-level key, only at the group's request. (d) A group-level paid account used by the daemon. No vendor key is ever required (D201).
- **Recommend (a) and (b) now, (c) on request** (DEC-74's pattern), **and reject (d)** (D13).

**B16 · The assistant's account and use (policy; UX).** This reframes QUESTIONS Q5. That a Claude subscription can serve is settled (DEC-55, K1429); these are the remaining policy questions.
- **(i)** Is the assistant required at setup, or switched on later? **Recommend optional, offered at setup.** The setup tells the administrator, at the act, that questions and the material read to answer them go to Anthropic under the group's account (D311).
- **(ii)** Whose account: the group's (a Team or Enterprise plan fits shared use; an API key is the option), with a project's or a member's own account taking precedence under the cascade. **Recommend yes.** Members' own accounts alone would leave newcomers without the assistant journey 9 promises.
- **(iii)** A use ceiling per group and per member per day, so one member cannot exhaust the group's plan limits or key, refused in plain words ("UNAVAILABLE, and say so", D79). **Recommend yes.** Today any member could exhaust it (DEC-63 as amended).
- **(iv)** Administrators see monthly use per mode; members see no per-answer cost. **Recommend yes.**
- **Information for Bob:** on a subscription the cost is the plan's price, and the question is whether a group's use fits its limits, which stage 0 measures. On the API-key option, five members asking five questions a day would be about $55–135 a month on Sonnet 5.5 once caching is built (unmeasured).

**B17 · What the assistant may read, suggest and keep (doctrine).** This merges QUESTIONS Q3 and Q7 with R-3 Q-Doc 1.
- **(i) Reach.** Widen the AI's least privilege to the reads in §3.3: law, profiles, registry, lines, duties, frontier, bar. `sources*`, member history and admin stay excluded. **Recommend yes,** as a recorded widening (D9, DEC-55).
- **(ii) Suggestions:** (a) keep DEC-27 limit 2: structure only what was said; (b) labelled suggestions derived only from material the member brought or chose, each adopted by the member's act, never from the model's own curiosity; (c) DEC-60's full licence. **Recommend (b).** The journeys promise "one question per requirement in a code section".
- **(iii) What is kept:** (a) nothing: a device-local transcript, no run or observation row, unattributed tallies only; (b) asks recorded as looks in the observation log. **Recommend (a).** (b) is a log of members' searching that legal process can reach (OLD §4.6).

**B18 · A court order to remove or redact a published case (policy).**
- **Options:** (a) defer the path, with the trigger "the first such order served on a group", and record the principle now; (b) design the path now.
- **The principle:** an order addressed to the group is complied with, never silently. The order is captured, a signed docket entry names it, and the edition is stamped.
- **Recommend (a).**
- Sealed material (§9) is folded into the same principle when its trigger comes.

**B19 · Calendar export (policy; DEC-94 (3)).**
- **Options:** (a) none; (b) a one-off `.ics` download of a member's own deadlines, which reaches no one who has not opened the product; (c) a subscription feed, which is an outside channel.
- **Recommend (a) now and (b) when members ask. Reject (c)** under DEC-94 (3).

**B20 · Where members meet all this, and its words (UX).** Each place sits in an existing construct, with no new top-level screen (D231). This merges TIME D9, ORGANISATIONS D7, LAW 6, COURTS D-C7, ANALYSIS 9 and 10, and QUESTIONS Q6.
- **Places:** due dates written out with their zone, sorted by due on the queue, the action page and the plan; a "Calendar facts" place reached from the queue's `local-fact-due` item; an **office page** on Subjects: holders over time, lines as of a date, obligations and powers with their sources, occurrences, the documents that concern it; a body's "Expected" list (next meeting, agenda, minutes due); a **proceeding page** with register rows, new ones marked, and "the court's date, not ours"; a Standards register with declare-from-passage and an "in force on" selector; a "Work it out" step in the question workspace, with the doors "compute from the record", "bring my spreadsheet" and "ask the assistant"; charts from an authoritative spec with a data table, at stage 3; timelines in contradiction inquiries and projects; the answer panel: a one-line answer, the level line and the bound always shown; quotes and citations one tap away; the query and the rules applied on expanding.
- **Words:** "obligation" for a body's duty and "power" for what an office may do; "lines" for the structure, with verbs ("reports to", "held by", "acts for"); "standard" for law, policy or a commitment held, "requirement" for one thing it requires, and "bar" always for the group's evidence threshold (view start-and-send's "The group's standard is…" changes); "proceeding" and "register" for court matters, never "case" or "docket".
- **Recommend all,** for the design stream to render.

## 5A. After Bob's ruling on B1 (K1432, 2026-10-05)

**B1 ruled (c).** Every construct reaches L5, its full ladder, staged by dependency, "within what is realistically doable with the resources available and without slowing the system's everyday use". Bob: "I don't want to repeatedly find myself in real-world situations using the tool where the tool says, 'Oh sorry, I can't do that yet.'" Stage 4 (§4) no longer waits on a group asking; it follows stage 3 in dependency order. The capability ladders are preserved in the requirements canon as `docs/architecture/BIO_Capability_Ladders_v0_1.md`.

**Recommendations revised by BOB #111.**
- **B8:** the rule also governs sharing between groups (B22): a shared pack carries offices and lines, and holders only with their cited tenures.
- **B12 (iv), new:** procedural reasoning for the group's own situation (COURTS L5; D-165's backward question). The machine lays out each condition with its source and the facts in the record that bear on it, marked met, unmet or undetermined as computed facts. It never says "you have standing" or what to file, and it routes to counsel. Recommend offering it on these terms. Rulings stay quote-only until their accuracy is measured (a quality gate, not a missing capability).
- **B15 (c):** keyed services (Open States, a CourtListener token, regulations.gov) are built into every copy, off by default, and switched on by a group with its own key. No vendor key is ever required; (d) stays rejected.
- **B18:** now recommend (b): design and build the path now.
- **B19:** now recommend (b) now; (c) stays rejected under DEC-94 (3) unless Bob lifts it.

**New decisions.**
- **B21 · Standing questions (doctrine; QUESTIONS L5 against D13).** (a) Keep D13: standing questions are watched mechanically only. (b) A member authors a standing question with a cadence and an end date; a saved search re-runs on the scheduler first; the AI runs only when that finds something new, read-only, bounded, within the use ceiling; its answer reaches the queue once, labelled. (c) Unrestricted standing AI runs. **Recommend (b).**
- **B22 · Sharing between groups (policy; ORGANISATIONS L5, LAW L5).** (a) Share a pack only by an explicit act; the receiving group accepts by a reasoned act (DEC-96); recreated, never installed, no inherited grade; holders only under B8. (b) Automatic sharing within a coalition. (c) No sharing. **Recommend (a).**

**How Bob's two limits are kept (BOB's, decided and reported).**
- *Everyday speed:* search, the queue, opening a question and reading the record each get a measured response budget, held by a test that fails any capability that breaks it. Heavy work (imports, large recomputation, watching registers, standing questions) runs in the background and stores its results; it never runs while a member waits.
- *Realistic resources:* every capability is in every copy. Those that cost money or plan limits (keyed services, standing questions, the spreadsheet engine) are switched on per group. Each has a measured budget before it ships. At a limit the system says what it could not do, why, and what would do it.
- *Where the world limits a rung,* it is built on the path that exists and says so: state courts offer no push alerts, so registers are read on a schedule; most city codes exist only on codifier sites, so they are captured section by section, while federal law and some states can be imported; PDF tables stay on checked transcription until a reader passes its measure.

## 5B. Bob hands B2 onward to BOB where BOB is better placed (K1437, 2026-10-05)

Bob: "B2: You're much more qualified to answer this question than I am. B3: too low level. I need you to go through all the questions, B2 onward, to consider which you're more qualified/informed to answer than I am." BOB #112 ruled every decision that follows from canon and Bob's existing rulings or is technical, each as recommended in §5 and §5A: B2 (K1438), B3 (K1439), B4 (K1440), B5 (K1441), B6 (K1442), B7 (K1443), B9 (K1444), B10 (K1445), B11 (K1446), B13 (K1447), B14 (K1448), B15 as revised in §5A (K1449), B16 (iii)–(iv) and B17 (i), (iii) (K1450), B19 as revised in §5A (K1451).

**Still Bob's:** B8 (private individuals), B12 (what the machine may say about law, with (iv)), B16 (i)–(ii) (the assistant optional at setup; whose account), B17 (ii) (suggestions; loosens DEC-27), B18 (now recommend (b)), B21 (loosens D13), B22; B20 is UX, for the design stream. Each weighs values, legal exposure, money or how real groups behave, or loosens a rule of Bob's.

Their product work stays owed here until K1425 is lifted.

## 6. Decided at BOB's level

These are recorded once in `build/rulings.md` when acted on, and reported to Bob as done.

**Names.**
- Module and id names: `civil-time`, `chronology`, `lines`/`LIN-`, `duties`/`DUT-`, `calc-grammar`, `calculations`/`CALC-`, `sheet-worker`, `answers`. Leg kind `calculation`. Method versions `bio-calc/1`.
- The queue code `OBLIGATION` stays. The reserved kind `temporal-expectation-due` is produced. TIME's `expectation-due` and ORGANISATIONS' `TODO` rename are withdrawn.
- The internal identifiers `proceeding` and `register`. Their member-facing use is in B20.

**Order and size.**
- Within-layer positions as in §3.2.
- `uses` edges; the `MODULE_ORDER` re-pin and its listener-order test.
- The `docprofile` split before the court doctypes (K617).
- The `agent-worker` split boundary.
- `law-relations` split off only if `standards` nears P6.

**Time** (§2.1).
- `received` in R26 means the counterparty's receipt of the group's request, counted from the group's `sent` entry (R-1 T-E1, fixed with a test).
- `civil-time` takes "now" only from its caller and never reads `Temporal.Now`. It uses `Intl` until `Temporal` is measured on Workers.
- Record instants stay UTC (D-516). Traces name the tz/ICU version.
- RRULE subset: WEEKLY, MONTHLY, YEARLY; BYDAY with an ordinal; BYMONTHDAY; BYSETPOS; EXDATE; UNTIL.
- Expansion bounds: 24 months or 500 instances, with `truncated` stated.
- EDTF level 1. Query ranges are inclusive by local day.
- Profile recurrences are keyed by profile body names, and instance recurrences resolve to entities.
- Vendor meeting encodings (a "- CANCELLED" suffix, special-meeting bodies, a zone-less `EventDate`) are normalised as site or profile data, never in code (R-1 T-O4).
- `per_meeting` captures at the meeting time minus the notice period. A finding states the alarm's lateness, because alarms fire at least once.

**Organisations.**
- Lines are graded on two axes: the assertion with its passage, and the resolution of each end.
- Walk bounds: depth 6, fan-out 1,000, with `truncated` stated.
- Identifiers are stored with a scheme: OCD-ID, org-id prefixes, source-system ids.
- Roster and org-chart readers are generic content types. Imports drop contact fields.
- D-224's pair materialisation is reopened for office and body entities at its own trigger.
- Popolo and OCDS exports are deferred to stage 4.
- `strength` R12 treats `part_of` and `acts_for` as one issuing source.

**Law.**
- Field names (`instrument`, `portion`, `requires`, `copy`, `current_through`, `period_basis`) and the shape of the instrument key.
- Relation names, with temporal and referential relations kept apart (D192).
- Proposal storage follows REC-195.
- The citation recogniser goes in `id-spaces` and its resolver in `standards`. "Verified" means it matches a held capture that states the citation.
- Watching rests on Legistar enactments, not on rendered codifier pages.

**Courts.**
- Party roles come from ECF and the CPUC service list. reporters-db and courts-db are profile data.
- A followed register's cadence is daily by default. Reported statuses are quoted, never graded.
- The proceeding label is forum, number and a neutral description.
- The machine registration note is labelled as the machine's.

**Analysis.**
- Canonical tables are RFC 4180 UTF-8 CSV plus a Table Schema, hashed with sha256.
- Sums are exact decimals. Ratios have 15 significant digits, with the rounding stated.
- Volatile functions are flagged. Macros are never run. External links are refused.
- Results are stored, keyed by `sha(recipe, inputs, method_version)`.
- The bound is 20 MiB or a million cells, to be measured for CPU and memory.
- IronCalc is the candidate engine, adopted only if it passes its measure, and HyperFormula is excluded.
- Every requirement has a negative control (P7), including a planted short range, a cached-value mismatch and a value that will not parse.

**Questions.**
- The asking mechanism: a short-lived grant minted by the member, and no run row.
- Check names and refusal names. Bounds per ask. Progress streaming. The tally list.
- The model per mode, chosen by measurement, with Sonnet 5.5 or Opus 5.5 rather than the Opus 5 default.
- `cache_control` on every call, and `usage` recorded on every call.
- The cascade holds an account reference per level; a subscription is signed in through Anthropic's own flow and the product never stores a Claude.ai password or session (K1429).

**Measurement plans.** Each "measure first" item in §2 and §4 becomes an `M-<n>` before its requirements are drafted.

## 7. Corrections to make

These are defects and misleading wording, not choices. Each fix is BOB's to place.

1. **The deadline calculator counts from the wrong receipt.** What is wrong: `computeDeadline` maps `starts: received` to the group's first *inbound* ledger entry (`action-clocks/index.mjs:695–698`; `clocks.test.mjs:166–179`). So Oakland's only rule, `records_response` (`oakland-alameda.mjs:247`), answers "no received entry" when the City never replied, which is the case it exists for. When a reply does arrive, the rule counts from that reply. Fix: define `received` as the counterparty's receipt of the group's request (R26 wording), count from the `sent` entry, and correct the test (R-1 T-E1; BOB-NOTES, verified).
2. **No roll-forward, and a weekend hard-coded into the code.** What is wrong: `t0 + days*86400000` (`:704`), with Saturday and Sunday written into the code (`:744`). So 19 March 2026 plus 10 days lands on Sunday 29 March, not Monday 30 March. This is latent: `clockPropose` has no op (R-1 T-E3). Fix: count in `civil-time`; move the weekend into profile data citing CCP §§12 and 12a (D196).
3. **Overdue is marked on the UTC day.** This is the defect a member can reach today. What is wrong: `deadlineRecheck` (`monitoring/index.mjs:2746–2764`) and `actions.actionOverdue` (`actions/index.mjs:174–183`, R12) compare against the UTC date. A typed clock dated 30 March (add flow, app.html l.3380–3393) is marked overdue at 17:00 PDT on 30 March. Fix, once Bob rules B9 (iii): use the local day of the office's jurisdiction, through the profile's `time_zone` and `Intl`, at these two reachable sites first (stage 0), absorbed by `civil-time` in stage 1. Fix the same UTC-day comparisons in `local-facts/index.mjs:53`, `queue/index.mjs:246`, `queue-producers` (2449, 2499, 2587, 2607, 2831), and `progressions`' fixed 86,400,000 ms days (R-1 T-E2, T-E4).
4. **`extension` is never read, and zone and hours are never used.** What is wrong: R26 `extension` and R41/R42 are confirmed in the profile but never computed. Fix: these are implemented in `civil-time` (TIME §3).
5. **Search dates and the cached flag.** What is wrong: query ranges compare strings, so `created:..2026-01-31` drops that day's stamped rows (`query.mjs:1487–1491`, 1693–1701). `overdue:` reads the cached flag without saying so (`query.mjs:107–122`). Fix: inclusive local-day ranges, and an `asOf` note on `due` and `overdue`.
6. **Impossible dates are accepted.** What is wrong: `DATE_RE` checks shape only and accepts 2026-02-31 (`inquiry-grammar/grammar.mjs:171`). Fix: validate calendar dates through `civil-time`.
7. **The Oakland profile ships rules without a source.** What is wrong: the deadline rule and the five counterparties carry `basis: "UNMEASURED"` (`oakland-alameda.mjs:207–217`, `:248`). Fix: research and source them before any rule applies (B10). This is a data correction.
8. **A named addressee collides with actions R9.** What is wrong: the add flow sends `{state: "named", name}` (`civicos-ui/app.html:19983`), while actions R9 refuses a named addressee with no role (`COUNTERPARTY_REFUSED`). Fix: trace which path applies R9, and send `{role, body}` or fail visibly (R-1 O-E6).
9. **The code cannot use the account the design names.** What is wrong: the setup page rightly says "a Claude subscription account for the assistant" (DEC-55; K1429), but `agent-worker` calls the raw Messages API with `x-api-key` (`model.mjs:20, 43`), so only an API key works. Fix: add the subscription path through the Agent SDK in a container, signed in through Anthropic's flow; keep the API key as an option. (This replaces the first draft's item, which had it backwards.)
10. **The model-turn status conflicts.** What is wrong: `agent-worker/src/index.mjs:1457` runs model turns when an account resolves, but the header at l.34 says "IT STILL RUNS NO MODEL TURNS", and so do R40/R41's status. R53 deploys `plan` automatically as soon as a member runs model turns. Fix: settle one truth in the code, the header and the requirement before any key is carried in. Make plan's deployment an explicit act (R-3 Q-Feasibility).
11. **The model calls have no caching, no usage record and no spend bound.** What is wrong: the request body has no `cache_control` (`model.mjs:68`); `usage` is read nowhere; the only bound is 1,000,000,000 bytes (`model.mjs:25`). Fix: add caching and record `usage`. The spend ceiling itself is B16.
12. **The canon contradicts a member's workbook as input.** What is wrong: TAD v10 §8.3 says "spreadsheets only as OUTPUT surface", and §9 says "Never a spreadsheet". A member's workbook as an input contradicts both. Fix: amend the text, citing X113 (the retired substrate's rulings do not carry over) and X135 (TAD is unratified) (R-3 A-O2).
13. **Small items.** The stale three-level `LAW_LEVELS` in `release/bio-plane.bundled.mjs:4746` is regenerated (R-2 L-E1). The `OCR_WORKER` comment is cited as written (R-3 Q-E4). The queue never renders or sorts by `due`; the UI sends no sort (TIME §3). That is a design-stream item and is listed for the design stream.

## 8. Answer to U41

The design session's reading is confirmed in each area, with the additions and corrections below. Each area points to the decisions in §5.

1. **Time.** *Confirmed built:* calendar and business days against the profile's holidays per office; "undetermined" when a holiday year is missing (action-clocks R10–R12; jurisdictions R26, R33, R43); the zone and hours stored but unused; `extension` never read; no meeting model; dates in documents not stored; a chronology only in the counsel packet. *Limits beyond U41's reading:* the calculator counts from the wrong receipt, so the first profile's only rule never computes on non-response; it does not roll forward; overdue is marked on the UTC day, so a typed clock reads overdue seven to eight hours early; `clockPropose` has no op, so no member reaches a computed date; progressions measure from capture time; query ranges drop the last day (§7 items 1–6). Nothing holds a date that follows from a dependency rather than a rule (a budget before its year, a report before its meeting; K1431). *Options:* B9, B10, B3 (`civil-time`, `chronology`), B2 (`local-facts`), B19, B20.
2. **Organisations.** *Confirmed built:* ten closed kinds; three undated, constitutive, untraversed relations (entities R1–R8, R26); counterparties by role (jurisdictions R24); a Subjects screen without its correction acts. *Limits:* no reporting, oversight or contract lines; no holders over time; no obligation object; search names a body only through free-text `authority`; `{role, body}` is unlinked to the registry; the add flow's named addressee (§7 item 8). Legistar can seed council and committee seats, but not staff posts. *Options:* B4, B5, B6, B7, B8, B3 (`lines`, `duties`), B20 (the office page).
3. **Law and regulation.** *Confirmed built:* standards with citation, issuer, captured text, period and a supersedes chain; determinations per standard. All of it sits in layer 9 with zero UI calls and no AI caller. *Limits beyond U41's reading:* nothing in investigation can use a standard, because of where it sits; no Legal/Policy Lookup skill exists; Oakland's code (Municode) is client-rendered, so watching it cannot see amendments. *Options:* B2, B11, B12, B13 (iii), B15, B20 (the Standards register).
4. **Court cases and precedent.** *Confirmed built:* `court` as a standard, source and venue kind; the counsel packet; correspondence words; the litigation hold at the plane. *Limits beyond U41's reading:* there is no proceeding object; a member cannot switch on a watch; a rendered or cookie-gated register cannot be followed; no doctype reads a register or an order; citations go unverified. *Options:* B1, B5 (`proceeding`), B8 (parties), B12, B15, B18, B20 (the proceeding page).
5. **Calculation.** *Confirmed built:* consequences R2 over cited figures, after a noncompliant determination only. Formulas are kept, never evaluated (office-readers R10). *Limits beyond U41's reading:* a cited cell's value cannot be read back (`passageText` is null); the figure parser has no `%`; no module before layer 9 holds a number; no budget or financial-report reader exists; PDF tables were measured NO-GO. *Options:* B14, B13 (ii), B3 (`calc-grammar`, `calculations`, `sheet-worker`), B8 (person-level rows), B20 ("Work it out", charts). The 90% pothole claim is stage 1's first unlock.
6. **Plain-language questions.** *Confirmed:* an inquiry holds any question; the question-to-search flow is designed, not built. *Limits beyond U41's reading:* no member can ask anything on any copy; only `check` is deployed; the installer carries no key; the worker's reach holds no law, clock or office read; the code can use only an API key although a subscription may serve (§7 item 9; K1429). "What is this sewer charge?" needs the closed-book rule, law held and readable, and a labelled reading of the held ordinance (stage 3). *Options:* B16, B17, B12, B3 (`answers`), B20 (the answer panel).

## 9. Risks and open points

**Unresolved between studies and reviews.** The size of stage 1 (about 195–225 requirements across 5 new modules) rests on each study's own estimate, raised where a review said so. No review summed them. Whether stage 1's five strands can share one stage under P8 (one job per module) is a planning question for when a tranche opens (K1425).

**Unverified.** `Temporal` on Workers (a search snippet reports an accidental exposure with `Temporal.Now` at 1970). The DO cost and memory of a 20 MiB table. IronCalc's agreement rate, function coverage and wasm size. The real token volume per ask. The 60–150k figure has no source (R-3). The Start-tier rate limits for a multi-turn ask. Whether the bundle path applies actions R9 (§7 item 8). Section-boundary accuracy of a structure reader. The share of reporter citations that will read "not verified". Whether Alameda's eCourt or a CPUC docket card can be followed without a login.

**Only a measurement can settle.** Each stage's "measure first" list (§2). The acceptance and grounding bars, which are set before measuring (the DEC-77 and K491 precedent). EXTRACT's precision on gold sets for duties, lines and dated facts. Taggers manage 70–78%; contract-obligation extraction at best 70.56%. Codifier lag. The distribution of line grades after the two-axis fix.

**Only a real group can settle.** How many proceedings a group follows, and how often. Whether members hand-enter any structure: the risk that the registry stays empty is contained by seeding (B7). Whether a professional member brings a workbook (the A2 trigger). The spend a group will accept (B16). Whether anyone asks for the network level, calendar export or keyed sources.

**Risks the design contains.** False overdue claims against a body: B9 and §7. Encoded law going stale: B10. Invented law, deadlines or citations: B12, `STANDARD_NO_TEXT`, the citation check, and the `answers` checks. A walked chain read as blame: B6, the weakest hop, no ranking. Surveillance of public employees and members: B8, B17 (iii). Injection from captured documents: the asking grant writes nothing. Unauthorised practice of law: B12 (ii) and (iii). Drift into BI, case management or a dashboard: DEC-48, and no assignees or scores. Cost to volunteer groups: B16.

**Open.** Sealed and later-unsealed court material (R-2 C-O): the policy is not designed and should be folded into B18's principle when its trigger comes. The `local-facts` "Calendar facts" door is unreachable today (its queue item renders, but its door cannot open). It waits on the design stream.

## 10. Sources

**The study folder, read whole.**
- `RESUME.md` and `constructs-brief.md`, with its corrections.
- `reviews/R-1.md`, `R-2.md` and `R-3.md`.
- `studies/TIME.md`, `ORGANISATIONS.md`, `LAW.md`, `COURTS.md`, `ANALYSIS.md` and `QUESTIONS.md`.
- `BOB-NOTES.md` and `U41.md`. Through the studies and reviews, these rest on the digests, the registers (D and X entries) and the phase-1 notes C1–C13, D1, D2 and M1–M5.

**Primary sources opened by this synthesis.**
- `build/modules.json` at `tranche/T32` 8fa5ab4e3d: positions, `uses` and users of `standards`, `local-facts`, `consequences`, `action-clocks`, `entities`, `connections` and `progressions`, and the whole of layers 4–7 (§3.2).
- `bio-plane/src/queuestate.mjs:164` (`temporal-expectation-due`).
- A search of `build/requirements` and `bio-plane/src` showing that `duties` and `DUT-` are free names.
- `src/DECISIONS-design-branch.txt` 1740–1752 (DEC-107's text: "the internal code is unchanged").
- `src/PROCESS-DESIGN.txt` l.62 (P19).
- The weekday of 19 March 2026, and of 10 days later, computed.

**Not opened.** The `.work` files, because no point a review disputes needed them. `prior/` is superseded.
