# BIO Capability Ladders v0.1: time, organisations and obligations, people, law, courts, analysis and questions

**Status.** Written 2026-10-05 for BOB #111 from the constructs study (K1426–K1432); the study's full evidence is on branch `study/constructs`, commit `892fca16c4` (never deleted, K1433). The targets are Bob's (B1 (c), K1432): every construct reaches L5, staged by dependency, within realistic resources and without slowing everyday use. Rungs not yet built are planned, not held; each is re-verified against the code and the world when its stage is planned. Facts about the product are as of `tranche/T32` @ 84e7cd321d. (The studies cite `09837e3ddc`, the reviews `6645f2ea04` and the synthesis's module order `8fa5ab4e3d`; a `git diff` from each of those to 84e7cd321d over `bio-plane/src`, `build/requirements`, `build/modules.json`, `agent-worker`, `newgroup` and `civicos-ui` shows no change.)

**Amended 2026-10-05 by BOB #112 (K1452, K1453, K1455).** Bob ruled B8: tracking people is essential to investigation. §5A PEOPLE is added; §5.1 reaches organisations of every kind; the doctrine row "Offices, never private individuals" (§10) is replaced; Design Requirement 6 still governs publication.

**Why it exists.** Bob, 2026-10-05: "The required capabilities is certain to expand. When I discover the need for that expansion is less certain. So while meeting the targets you've identified for today sounds appropriate, the understanding from this study should be preserved in a way that supports later situation when the need for greater capabilities is identified." Bob then ruled decision B1 as option (c) (K1432): every construct is to reach its full ladder, L5, within what is realistically doable with the resources available and without slowing the system's everyday use for members. This document is the plan's reference: for each construct, every rung, its evidence, its design, what must exist first, what is realistic today, and the decisions it raises. The study's synthesis (`synthesis/constructs.md` on the study branch, cited here as "synthesis §n") holds the full argument.

**How citations read.** "TIME §5" is a section of a study (`studies/TIME.md` etc.). "R-1 T-E1" is review R-1, TIME, Error 1 (O- for ORGANISATIONS, L- LAW, C- COURTS, A- ANALYSIS, Q- QUESTIONS; -O omission, -Doc doctrine). "B4" is a decision put to Bob in synthesis §5 (B21, B22 and the recommendations revised after B1 (c) are in its §5A). `D<n>` and `X<n>` are entries of the study's doctrine and cross-construct registers; `DEC-`, `K` and requirement ids (`actions R12`) are the product's own. "Not studied" means the study gives nothing on the point.

## 1. How to use this document

**When planning a stage.**
1. **Take the stage's rungs.** Synthesis §4 orders the stages by dependency (stage 0: runnable and correct; stage 1: the shared ground; stage 2: what bodies owe, their meetings and proceedings; stage 3: applied and assisted; stage 4: network and imports). Each construct's ladder table (§4.3–§9.3) names the stage that carries each rung; rungs beyond stage 3 are the "Later rungs, planned" of §4.5–§9.5. A stage opens only when Bob says a tranche may open (K1425).
2. **Read each rung's entry and the rungs below it.** An entry gives what a member can do, its state on 2026-10-05, the design, what must exist first, realism and performance, the decisions it raises, and risks. A rung assumes every rung below it.
3. **Check what must exist first.** Prerequisite rungs, modules, deployments and measurements. A rung whose prerequisites are not in place is not in the stage; say which one is missing (P19).
4. **Re-verify.** The product facts here are as of 84e7cd321d; check each cited file, requirement and line again. The world sources date: standards are revised, APIs change their limits and prices, vendors change terms (the study saw a tzdata release this month and an Anthropic terms reading withdrawn within a day, K1429). Fetch every URL the rung depends on again and note what changed.
5. **Keep it realistic and off the everyday path.** Use each entry's "realism and performance": do only what the real sources, costs, limits and measured accuracies allow, and keep heavy or paid work in the background (scheduler consumers, stored results, runs at a member's act), with a per-group switch where it costs money or meets a vendor's limits. Nothing in a stage may slow members' everyday reads and acts.
6. **Bring the decisions to Bob, with a recommendation.** Only policy and doctrine, requirements, architecture (layers and product modules) and UX are his (P17). Each entry names those it raises and the study's recommendation where it gave one; where a rung conflicts with a ruling (QUESTIONS L5 against D13; COURTS L5 against the legal-information line), the conflict is put to Bob as a decision, never resolved by dropping the rung. Everything technical below that is BOB's: decide it, record it once in `build/rulings.md`, report it.
7. **Draft requirements citing this document by section** (for example "BIO_Capability_Ladders_v0_1 §7.5, COURTS L5"), with each "measure first" item made an `M-<n>` before the requirements are drafted (D350), and every requirement given a negative control (P7).

**When a member's real situation shows a gap no rung covers.** The need may come from a group's request, a job's report, the design session, a measurement, or questions members keep asking (the assistant's unattributed tallies, B17 (iii), are built to show this).
1. Look for it in the construct's needs register (§4.2–§9.2) and the rung that serves it. If it is there, plan that rung as above.
2. If it is not, the ladder itself is extended here: add the need to the register in the same form (id, a member's words, centrality, evidence); place it on the rung that serves it, or add a rung where no rung serves it; write the rung's design, what must exist first, realism and performance, decisions and risks; update §2 if the new rung needs a substrate choice made earlier; and update the interfaces table.
3. Keep the registers whole: a need is retired only with the reason stated. Update a rung's state when it is built.

## 2. Design for the ladder, build every rung so the next one extends it

**The principle.** Every construct climbs to L5 in stages, and each rung is built so that the next one extends it rather than rebuilds it. A choice that would force a higher rung to migrate stored data, add a second engine or a second object for one idea, or reverse a doctrine is made correctly the first time, even when the current stage does not yet need its full generality. Stages publish their services (ops, reads, refusals, vocabularies) for the design stream to design against; a member screen is never a precondition of a substrate stage (K1430).

**TIME.**
- *One engine.* `civil-time` (layer 1, pure, no store, no network, no clock) does every day computation, and the twelve existing sites delegate to it (synthesis §2.1; R-1 T-E4, T-O6). Later rungs (recurrences, fiscal periods, as-of reads, the windows the assistant resolves) are new functions of the same engine. *Blocks a higher rung if careless:* any module that counts days itself (G10, X60), including calculation's `span` and the queue's snooze.
- *EDTF level 1 for every civil date the record holds,* with three-valued comparison (before, after, undetermined). Imprecise document and tenure dates (L4) then need no schema change. *Blocks:* civil facts stored as UTC instants or as bare `YYYY-MM-DD` strings validated by shape only (`inquiry-grammar/grammar.mjs:171` accepts 2026-02-31).
- *One validity value* `{valid: {from, to, precision}, basis}`, read only by `civil-time.validAt`, where a null bound means "not stated", never "always" (synthesis §3.4). Standards, lines, tenures, duties, proceedings, profile rules and dataset vintages all use it, so "as of a date" across constructs is one read. *Blocks:* a module that reads a missing end date as "current" (OpenSanctions stops treating an open-ended occupancy as current after 40 years for this reason; ORGANISATIONS §1).
- *Valid time kept apart from record time* (bitemporal). "What was true on D" and "what did we know on D" stay different reads. *Blocks:* a read that caches "now" (the `overdue:` flag, synthesis §7 item 5).
- *A due date carries its basis kind from the first stage:* `rule`, `commitment`, `dependency` (`{precedes, lead, why}`) or `window` (K1431). Only `rule` may be called a deadline the law sets. *Blocks:* a single "deadline" field that implies law for every due date.
- *Rules are profile data with a citation and a status;* R44's "UNMEASURED is not a basis" extends to `deadlines` (R-1 T-Doc; B10). New jurisdictions and rule sets are data. *Blocks:* jurisdiction in code (the hard-coded weekend, `action-clocks/index.mjs:744`).
- *Computed dates are derived on read, never stored* (D245; action-clocks R7), so a corrected rule needs no migration. *Traces name the tz/ICU version*, so a past answer can be explained after tzdata changes.
- *Profile recurrences are keyed by the profile's own body names;* an instance's observed recurrence resolves to an entity (R-1 T-E6). *Blocks:* instance entity ids in shipped profile data.

**ORGANISATIONS AND OBLIGATIONS.**
- *Lines are a store of their own* (`lines`, layer 5), evidentiary, dated, cited, with a closed list of kinds revised only by spec (B5). New families (COURTS' proceeding families were the first) are added, not retrofitted. *Blocks:* putting structure into `entities`' constitutive relations, which are untraversed by rule (entities R26).
- *Two-axis grading from the start:* who asserts the line (a captured source with its passage, a system rule, a member's testimony) and how each end resolved (R-1 O-E1). *Blocks:* a single scale, under which a charter's "the Auditor reports to the Council" is grade C and never established, so no chain at L4 would answer.
- *Identifiers carry a scheme* `{scheme, id, basis}` (OCD-ID, org-id prefixes, source-system ids). This is what later allows sharing and export between groups (L5) and resolution at grade A. *Blocks:* anything shared or exported keyed on `ENT-` ids, which are minted per instance.
- *One obligation object,* `duties`/`DUT-` in layer 5, whose `source` is a union (a held standard at its version, a court standard's paragraph, measured practice, a dependency) and which carries `arising_in` and `reported_status[]` (synthesis §3.1). Law, courts and time attach to it without a new object. *Blocks:* a second home for the same idea (TIME's proposed `expectation` in `progressions`; R-1 T-O1), or duties in layer 9, where investigation cannot read them.
- *Occurrences derived on read, in the shape of an OCDS milestone,* so a later export of an obligation register is a rendering, not a conversion.
- *Walks bounded* (depth 6, fan-out 1,000, `truncated` stated), weakest hop governing, no ranking (B6). *Blocks:* centrality or a score, which DEC-60 and D181 forbid and which no later rung may add.
- *Powers read as instruments, never verdicts* (`powersOf({office, at})`; R-1 O-Doc). *Blocks:* a "within powers" answer, which would be the machine concluding.
- *The private-individuals rule is applied from the first import* (B8): holders only for registered offices, no contact fields. Sharing at L5 then cannot leak what was never held.

**LAW.**
- *Work, version and portion* (FRBR, as Akoma Ntoso uses it), with an instrument key shaped like ELI and composed only from profile data (LAW §5.2–5.3; B11). Imports at L5 (Akoma Ntoso, USLM, eCFR) land on the same keys. *Blocks:* whole-standard supersession as the only version model, or place names in code.
- *`copy`, `current_through` and `period_basis` held from stage 1.* Codifier lag, official copies and imported text all state their standing the same way.
- *Law relations live in `standards`, evidentiary, citing the amending or referring instrument,* with temporal (`amends`, `repeals`, `renumbers`, `recodifies`) and referential (`refers_to`, `defines`, `excepts`, `implements`, plus COURTS' `interprets`, `applies`, `holds_invalid`) kept as separate types (D192). *Blocks:* one generic edge type, or law relations in `lines` (their ends are standards and portions, not registry entities).
- *`inForceAt` answers undetermined with a reason at its level.* An import or a watch later narrows the reason; it never changes the answer's shape.
- *Proposals stored apart; no adoption without captured text* (`STANDARD_NO_TEXT`). AI rungs add proposers, never write paths.
- *`standards` moves whole to layer 5 now* (B2), so the later callers (inquiry legs, contradiction's canons, publication's Criteria, `duties`) need no further move. *Blocks:* a registration seam built for stage 1 and thrown away later (R-2 L-E6).
- *Watching rests on Legistar enactments (static JSON), not on rendered codifier pages* (R-2 L-E8).

**COURTS.**
- *A proceeding is an entity of kind `proceeding` with a facet* (Option A). Option B (a `proceedings` module) can come later with no data change, on the trigger "the facet needs its own acts and tables, or `entities` nears 4,000 lines" (B3).
- *Its label is forum, number and a neutral description;* the caption stays a citable extent and never becomes an alias (R-2 C-Doc). A private party is the class "a private party" (B8). Later patterns and sharing then cannot index a private name.
- *Parties and proceeding-to-proceeding links are `lines` families,* so the appeal chain is walkable with the same bounds.
- *The register is a reading, not a store;* rows are never findings (D76). Later alerts and patterns read rows; they never promote them.
- *Duties from orders, decrees, grand jury reports and audits are `duties`,* with `arising_in` and quoted `reported_status`.
- *The citation recogniser is pure (in `id-spaces`) over profile data (reporters-db, courts-db); its resolver in `standards` says "verified" only for a held capture that states the citation.* An outside lookup (CourtListener) can be added later as an optional source, never a dependency (D201).
- *Decision-to-provision links and treatment rows are data in `standards` from the first court stage,* so the assistant at L4 only proposes them.
- *A register behind a member's account is refreshed only by that member's act* (B15 (b); D13). *Blocks:* any unattended path that uses a member's credential, on which later automation would then rest.

**ANALYSIS.**
- *One `CALC-` object with two engines* (recipes, workbooks), one leg kind, one grade rule, one way of being carried in a case (B14 (i)).
- *A closed recipe grammar with a method version* (`bio-calc/1`), no eval and no user code. New steps (fund joins, recorded draws, period aggregates) are a method-version change, and results are keyed `sha(recipe, inputs, method_version)`, so an old result stays reproducible under its own version. *Blocks:* a general expression language, or a grammar change without a version.
- *Canonical tables:* RFC 4180 UTF-8 CSV plus a Table Schema, hashed; a header is declared, a value that does not parse is undetermined, never coerced. Longitudinal work (vintages, keyed diffs) builds on the hashes.
- *`span` and fiscal periods come from `civil-time` and the profile;* joins only through an id space or a captured crosswalk (D184), so L4's fund and program joins use ORGANISATIONS' identifiers.
- *Grades stay on the existing capture axis* (no new scale); a third-party engine's workbook value is a derivation step, undetermined until measured (R-3 A-E4).
- *The case checker stays one self-contained file* (case-checker R13) until the engine passes its measure (B14 (iii)).
- *Outputs are grouped only by office, department or class;* person-level rows travel only redacted or aggregated (B8). *`compare` gives a labelled computed fact, never "breach"* (D275).

**QUESTIONS.**
- *The closed-book rule and the answer contract live in `answers` (layer 6),* with the plane's delivery checks (`ANSWER_CITES_UNREAD`, `ANSWER_FIGURE_UNSOURCED`, `ANSWER_RULE_NOT_PLANE`, `ANSWER_ABSENCE_WITHOUT_LEVEL`). Each later rung adds plane services, by import once they sit in layer 5 or by registration (`registerRuleService`) for layer 9; the model never gains a source of rules of its own. *Blocks:* letting the model answer from its own knowledge "for now".
- *The asking grant is minted by the member, read-only, short-lived, with that member as viewer, and writes no run row.* L2 adds propose ops in separately deployed modes; it never widens the asking grant into a write.
- *Nothing of an ask enters the record;* use is counted as unattributed tallies (B17 (iii)). The tallies are what will show when L4 is needed.
- *The account is a reference per cascade level* (member, project, group): a Claude subscription signed in through Anthropic's own flow, or an API key as an option (K1429; DEC-55). `usage` is recorded and a use ceiling exists from stage 0, so every later rung's cost is measured, not guessed.
- *Standing questions (L5) are built mechanical-first:* a saved question re-run by the scheduler, with the AI called only when that check finds something new, read-only and within the group's ceiling. Even so, an AI run without a member's act conflicts with D13's provisional NO, which is Bob's to decide (§9.5).

## 3. The common thread

**What joins the constructs is the obligation: who owes what, to whom, by when, under which authority.** It is held once, as `duties`/`DUT-` in layer 5 (synthesis §3.1). Members see "obligation" for a duty or prohibition and "power" for what an office may do (DEC-107; B20). ORGANISATIONS supplies the obligor (an office or body, never a private individual) and the lines between bodies; LAW supplies the authority (a held standard at its version in force); TIME supplies the due date, computed by `civil-time` and anchored on a document's own date from `chronology`; COURTS supplies orders, decree paragraphs, grand jury and audit recommendations as sources, with `arising_in` and quoted `reported_status`; ANALYSIS supplies measured performance (a calculation output as the evidence of an occurrence); QUESTIONS reads all of it in plain words.

**A due date's basis is one of four kinds (K1431):** a `rule` (a law or order, cited), a `commitment` (the body's own stated date, cited), a `dependency` (the event it must precede, the lead, and why; derived from that event's date and recomputed if the event moves), or the group's own `window`. Only `rule` may be called a deadline the law sets. A missed dependency date is a dated fact about sequence ("the report was published after the vote"), never a violation unless a rule also applies. Occurrences are derived on read (`met`, `met_late`, `overdue`, `pending`, `discharged`, `undetermined`); "overdue" raises a question and never asserts a violation (D241). Its queue item is the reserved FINDING kind `temporal-expectation-due` (`queuestate.mjs:164`), shown as "Noticed". The queue's internal code `OBLIGATION` (a member's to-do) is unchanged, as DEC-107 says.

**What moved below Publication, and why.** Every piece of the thread sat in layer 9 or nowhere, so investigation could use none of it. The architecture puts the record's understanding low and leaves acting where it is (synthesis §3.2):
- layer 1 gains the pure engines `civil-time` and `calc-grammar` (and, at stage 2, the fleet Worker `sheet-worker`);
- layer 5 runs `entities`, `lines` (new), `local-facts` (moved from layer 9), `connections`, `standards` (moved from layer 9), `chronology` (new), `progressions`, `duties` (new), `bias`, `observation-log`, `query-language`, `retrieval`, `calculations` (new);
- layer 6 gains `answers` after `skills` and before `agent-worker`;
- `conformance`, `consequences` and `action-clocks` stay in layer 9, because a determination rests on published findings (K102, DEC-26) and they use `publication` or `conformance`.

No `uses` edge breaks (checked against `build/modules.json`; BOB's review). The mechanical work is BOB's (`modules.json`, `layers.md` rows, membership R83's `MODULE_ORDER` re-pin with a listener-order test); the layer change itself and the new modules are Bob's (B2, B3).

**Where the assistant reaches the plane.** The model runs in `agent-worker`, a separate Worker, and reaches the plane only through ops, so the barrier is which ops a mode may call (X26; agent-worker R44). `answers` imports the layer-5 services directly and takes layer-9 rule results by registration. `ask` may call reads only (record, law, time, organisations, a non-persisting recipe evaluation, the system's affordances and dry runs), under the asker's view; never a write, `sources*`, member search history, or admin and export ops (synthesis §3.3; B17 (i)).

## 4. TIME

### 4.1 Purpose

Time is how the record says when: when bytes existed, when a body must act and on what basis, when a meeting is due and whether it was noticed, which law and which office holder applied on a date, and how lateness falls into patterns. Bob asked whether support for time is richer than tracking a court deadline; the study found it must be, because every front door in the journeys passes through a body's time duty before anything is published (journey 4 step 4), and because many due dates follow from dependencies rather than regulation (K1431).

### 4.2 Needs register

Centrality: core, regular, occasional (TIME §1). Rung: the lowest that serves the need (TIME §2).

| id | need | in a member's words | centrality | rung | evidence |
|---|---|---|---|---|---|
| A1 | Statutory response deadline on the group's own request, counted by the law's rule | "Our CPRA went in Thursday 19 March; when is the City late?" | core | L2 | RM §1 L241–258; CCP §12 (https://firstamendmentcoalition.org/2009/06/when-does-the-10-days-count-start-with-a-cpra-request); FOIA (https://foia.blogs.archives.gov/2011/09/29/twenty-days-or-not); journey 5 |
| A2 | A body's own commitments and audit target dates | "They promised to implement the audit by October 2023. Where are they now?" | core | L3 | RM §1 L219–232; https://seattle.gov/cityauditor/recommendations |
| A3 | Time standards in policy or law, measured per act | "Are potholes fixed within the time the city's own policy sets?" | core | L3 | journey 4 step 4; journey 6 steps 2–3; matter page VM L20 |
| A4 | Contract, franchise, settlement and consent-decree deadlines over years | "Track each deliverable the hauler owes, and the monitor's reports." | regular | L3 | journeys §3; RM §1 L279–281; Chicago missed "37 of 50" (https://news.wttw.com/2019/11/15/federal-monitor-cpd-lagging-behind-consent-decree-compliance) |
| A5 | Recurring procedural duties: agenda before, minutes after, annual reports | "Minutes for the 28 July committee meeting were due 18 August and aren't up." | core for meeting watchers | L3 | CF §8; Brown Act 72 h / 24 h (Gov. Code 54954.2, 54956); OMC 2.20.070, 48 h "excluding Saturdays, Sundays and holidays" |
| B1 | Filing and limitation windows | "Can we still file? The claim window is six months from when we knew." | regular, high stakes | L2 | CM 939–941; Gov. Code 911.2 (https://california.public.law/codes/ca_gov't_code_section_911.2); filings R9 |
| B2 | Windows the group sets: right of reply, checkpoints, reminders | "Give them 14 days to respond, and remind me the day before." | regular | L1 | DEC-13; action-plans R14–R17, R29; DEC-94 |
| B3 | Retention clocks and a litigation hold | "We got a preservation demand. Stop deleting." | occasional | L1 | DEC-61, DEC-113 |
| C1 | A real calendar: business days, per-office holidays, zone, hours, cut-offs | "Friday 3 July: is the court closed but the City open?" | core enabler | L2 | research-oakland-calendar M-NEW-2–7; FRCP 6(a) (https://www.courtrules.net/federal/civil-procedure/rule-6) |
| C2 | Periods counted backward from an event, and in hours | "Was the special meeting noticed 48 business hours ahead?" | regular | L2 | Brown Act; OMC 2.20.070; VF L22 |
| D1 | A body's meeting schedule, next agenda, cancellations, watching per meeting | "Tell me if the Rules Committee meeting was cancelled." | core for meeting watchers | L3 | journeys §3; DP L215–219 (8 of 18 cancelled); SR §4.1 `per_meeting`; UC-031 |
| E1 | The law in force on the act's date, across amendment and recodification | "Did the 2023 recodification change the rule they broke in 2021?" | core for any determination | L3 | RM App B L1083; UC-063; conformance R3 |
| E2 | Who held an office when, with approximate tenures | "Who was Finance Director when the transfers ran (about 2019–2021)?" | regular | L3 | RM App A L1051–1072; journeys §6 |
| E3 | What a page said on a date; dataset vintages | "What did the budget page say in March?" | regular | L0 (partly), L4 | FA L1 Fn3; X59; acquisition R32 (Memento); CF §8.3 |
| F1 | Fiscal years and biennial budgets mapped to dates, per body | "Every contract over $250k on fund 3100 since FY2019." | core for money work | L3 | RM §1 L234–239; CF §12 src 1202–1209; https://legalclarity.org/how-state-fiscal-years-work-dates-and-budget-cycles/ |
| F2 | A claim's own period, in the city's words | "Over what period is '90% filled' measured?" | regular | L3 | journey 6 step 2 |
| G1 | A document's own dates (meeting, adoption, effective, hearing, period covered, edits) | "The figure changed three days before publication." | core enabler | L4 | DEC-5, DEC-11; CF §8.2 src 965–968; acquisition R8 |
| G2 | Imprecise dates | "Sometime between FY2021 and FY2024." | regular | L4 | RM §1 L234–239; App A |
| G3 | A cited chronology across documents; sequence without causation | "The emergency was declared two weeks after the contract was signed." | core | L4 | IS §5; DEC-77.2; DEC-14; https://support.everlaw.com/hc/en-us/articles/42469701435803 |
| H1 | One late item versus a pattern of lateness, with its denominator | "Minutes were late at 38 of 41 meetings since January 2024." | regular | L4 | FA L2 Fn4 L311–313; CF §13.1 |
| H2 | Non-response as a dated outcome | "We asked on this date; nothing came back by that date." | core | L1 (as a fact), L4 (as a leg) | D-181; DEC-14; D113 |
| I1 | Relative and range questions answered correctly | "What's due this week?" | regular | L5 | DEC-27 src 1810; DEC-110 |
| J1 | Every wait says by when; dates written out; times with their zone | "Waiting on the City Clerk's reply, due 14 October." | core (UX) | L1 | DEC-98.2; BR §5 L138 |
| K1431 | Due dates that follow from a dependency, not a regulation | "The staff report had to be out before the 12 June vote, so the council could read it." | core (Bob's ruling) | L3 | K1431 (Bob, 2026-10-05); synthesis §2.1 |

### 4.3 The ladder

| rung | a member can | example | state on 2026-10-05 | stage |
|---|---|---|---|---|
| L0 Record time | Prove what bytes existed when; see every version of a page and the record's append-only history | "This page changed between two captures; both versions are held, each with its instant." | **Usable today.** UTC instants (`record-grammar` `ISO_TS_RE`, `stampInstant`); version chain; RFC 3161 co-attestation. Memento always asks for "now" (`acquisition/index.mjs:291–293`) | foundation |
| L1 Stated dates | Type a date with its basis on an action; see it overdue the day after; be reminded as asked | "Clock: reply due 30 March, CPRA." | **Usable today, with a defect.** Clocks typed in the add flow (`app.html` l.3380–3393); overdue is marked on the UTC day (`monitoring/index.mjs:2746–2764`; `actions/index.mjs:174–183`, R12), seven to eight hours early in Pacific time (synthesis §7 item 3). Reminders and retention hold built, UI 0 | first stages |
| L2 Computed on the local calendar | Have a deadline proposed from a profile rule, counted the law's way, with the calendar's confirmation stated or "undetermined" with why | "Due Monday 30 March: 10 calendar days from receipt, rolled past Sunday (CCP §§12, 12a)." | **Partly built, not reachable.** Business days and per-office holidays exist (action-clocks R10–R12; jurisdictions R26, R33, R43). `computeDeadline` (`action-clocks/index.mjs:694–749`) reads `received` as the group's receipt (`:695–698`), has no roll-forward (`:704`), hard-codes the weekend (`:744`), never reads `extension`; zone and hours unused; `clockPropose` has no op | stage 1, T1 |
| L3 Civic calendar and a body's duties | Before anything is published: watch a body's meetings; track what it owes, anchored on the event's own date; use fiscal periods; ask what law was in force and who held an office on a date | "Minutes of the 4 August meeting: due 21 days after it (a group expectation until measured); overdue, Noticed." | **Fragments.** `progressions` R16 overdue findings are reachable but anchored on capture time (`progressions/index.mjs:863–870`) with fixed 86,400,000 ms days; `standards.inForce` built in layer 9, UI 0; `per_meeting` is null (`monitoring/index.mjs:133–148`); no fiscal year; no holder tenure | stage 2, T2; holder and in-force reads at stage 3, T3 |
| L4 Temporal evidence | Use document dates, imprecise ones included, as graded evidence; build a cited chronology across documents; tell change over time from contradiction; measure lateness with its denominator; read a page or a search as of a date | "Timeline: the emergency was declared two weeks after the contract was signed (two sources)." | **Fragments.** Version chain; one action's chronology (filings R9, UI 0); no document date is stored (a reading's `at` is the capture instant, `reading-pipeline/index.mjs:741`) | stages 2–3 (T2, T3): document dates, chronology, as-of reads, the lateness pattern |
| L5 Assisted | Ask in plain words and get cited answers, with proposed deadlines, periods and dates labelled for a member to adopt | "Over the weekend = Sat 3 Oct 00:00 – Sun 4 Oct 23:59 PDT; n new documents." | **Not built.** FIND not built; plan mode `deployed: false` (`run-rules/deployment.mjs:108–112`) | stage 3 (T4) |

### 4.4 Rungs in the first stages

Bob's decisions these rungs rest on (synthesis §5): B1 (c) (every construct to L5), B2 (`local-facts` to layer 5), B3 (`civil-time`, `chronology`), B4 (iii) (a member adopts a body's clock), B9 (what the record may claim about time; the governing day), B10 (sourced profile rules), B20 (where members meet dates). The synthesis's stage labels (T1–T4) are stages, not rungs.

**L1 and L2: correct clocks, usable (synthesis stage 1, "T1").**
- *Design:* New `civil-time` in layer 1 directly after `jurisdictions` (1,500–2,500 lines): local day from an instant and a zone; EDTF level-1 parsing and three-valued comparison; time-rule evaluation (units including hours and business hours, forward and backward, roll past closed days, extension, tolling); bounded RRULE expansion; fiscal-period mapping; `validAt`; every answer with a trace (rule, citation, days skipped and why, tz/ICU version); "now" only from its caller, never `Temporal.Now` (R-1 T-E9). `jurisdictions` R26 widened as data (units, direction, anchors, roll, closures, extension, tolling; facts `weekend` and `computation` citing CCP §§12, 12a; channel `cutoff`/`outages`; `received` defined once as the counterparty's receipt of the group's request). The twelve day computations delegate. `local-facts` moves to layer 5. `clockPropose` gains an op; query ranges become inclusive local days with an `asOf` note. A first sourced rule set: CPRA with extension, Brown Act, OMC 48 business hours, Government Claims Act 6 and 12 months, FOIA 20 working days, each only with a primary source (B10).
- *The AI's part:* none at this stage.
- *The member decides:* adopting a computed deadline, in one act (B4 (iii)).
- *Size:* 1 new module, about 12 amended, about 35–45 requirements.
- *Measure first:* `Intl` zones and `Temporal` presence on the deployed plane; 20 published worked deadline examples, each with a negative control; how many typed clocks differ from the rule's computation.

**L3: what a body owes, and its meetings (stage 2, "T2").**
- *Design:* New `chronology` in layer 5 (after `standards`, before `progressions`): a document's own dated facts `{capture, extent, kind, value, method, grade}`, read by `ownDate`, `datesOf`, `chronology({scope})`; first writer the reading pipeline at read time, plus a re-read job (R-1 T-Feasibility). `progressions` R16 anchors on the event's own date; without one, undetermined with the capture instant as a bound (B9 (ii)). Profile recurrences (RRULE subset: WEEKLY, MONTHLY, YEARLY; BYDAY with ordinal; BYMONTHDAY; BYSETPOS; EXDATE; UNTIL; at most 24 months or 500 instances) and observed meetings in the OCD Event shape from Legistar `Events`; vendor encodings ("- CANCELLED", special-meeting bodies, zone-less `EventDate`) normalised as profile or site data (R-1 T-O4). `monitoring`'s `per_meeting` captures at the meeting time minus the notice period and states the alarm's lateness. `fiscal_year` in the profile. A body's duty is a `duties` occurrence (§5), not a TIME object.
- *The AI's part:* EXTRACT later proposes dated facts.
- *Size:* about 35–45 requirements.
- *Measure first:* date accuracy of the calendar, agenda and minutes readers on three bodies. Oakland's minutes lag is already measured from Legistar: 2026 to date, 130 events, 24 cancelled; 105 with minutes, median 15 days to last publication, 33 over 21 days; 29 of 106 agendas last published under 72 hours before the meeting day, which must not be read as notice violations, because "last published" is only an upper bound (R-1 T-O3).

**L4: as-of reads and patterns (stage 3, "T3").**
- *Design:* `validAt` across standards, tenures and relations; recodification across addresses (with LAW); Memento asked for a past date; the lateness pattern with its denominator and a cross-action lateness index; the timeline view (DEC-77.2); the counsel packet's chronology widened to a project.
- *What must exist first:* stage 2's `chronology` and event-anchored progressions; LAW's versions (stage 2) for recodification. Planned in stage 3 (B1 (c)). No new module expected.

**L5: assisted (stage 3, "T4").**
- *Design:* EXTRACT proposes dated facts and imprecise dates, graded no higher than the method earns (temporal taggers normalise about 70–78% correctly, https://aclweb.org/aclwiki/Temporal_Information_Extraction_(State_of_the_art)); FIND answers time questions as cited reads and states the window used; plan mode proposes clock entries from profile rules. Never invents a rule (D250), confirms a calendar fact (D15) or runs on a schedule (D13).
- *What must exist first:* FIND and plan mode deployed, with the acceptance rate measured (DEC-95).

### 4.5 Extensions beyond the ladder, planned

TIME's six rungs are all carried by stages 1–3 (§4.3). Planned beyond them are extensions the staged path does not yet carry.

**Calendar export (one-off `.ics` download).**
- *Design:* a member downloads a file of their own deadlines, in RFC 5545 (the standard already adopted for recurrences); it reaches no one who has not opened the product (B19 (b)). A subscription feed is an outside channel and is rejected under DEC-94 (3).
- *What must exist first:* `civil-time`'s due dates with their zones (stage 1); B19 ruled.
- *Realism and performance:* small; the file is produced only when a member asks for it, so it is off the everyday path. Size: not studied.
- *Decisions for Bob:* B19: since B1 (c), BOB recommends (b) now; (c) the feed stays rejected under DEC-94 (3) unless Bob lifts it.
- *Risks:* a file that goes stale once downloaded; contained by stating its "as of" instant in the file (not studied further).

**Rule sets for further jurisdictions and bodies.**
- *Design:* each rule is profile data with citation, status and confirmation horizon, researched as a measurement (K903 (6)) and confirmed locally (D15, D198); absent rules read undetermined (jurisdictions R27). This includes the lead times bodies set for themselves (an agenda packet a set number of days before a meeting, a budget adopted before its year; K1431).
- *What must exist first:* T1's widened grammar; R44's "UNMEASURED is not a basis" extended to `deadlines` (B10); for Oakland, the 2027 holiday lists once published (the profile holds 2026 only).
- *Realism and performance:* the cost is research, one primary source per rule; holiday libraries (date-holidays, OpenHolidays) are research aids only, never sources (D197). A rule is shipped data, so it adds no runtime; re-confirmation reaches the queue through the confirmation horizon (local-facts R3), not members' reads.
- *Decisions for Bob:* B10.
- *Risks:* encoded law going stale (D-149); contained by citation, status, horizon, the version notice, and member adoption (B4 (iii)).

**Dated waits on an inquiry** (G13).
- *Design:* an inquiry's recheck-trigger dates (validated today and read by no module) become dated waits read by a scheduler consumer, each saying what, from whom and by when (DEC-98) (TIME §5, `inquiry` bullet).
- *What must exist first:* `civil-time`; a scheduler consumer.
- *Realism and performance:* one consumer on the one Durable Object alarm, waking at the next local midnight; alarms fire at least once, so marks stay idempotent; nothing on members' reads. The study rated it "nice to have"; size not studied.
- *Decisions for Bob:* none identified.

**`Temporal` in place of `Intl`.**
- *What must exist first:* a measurement on the deployed Workers runtime.
- *Realism and performance:* `Intl` with IANA zones works today; a search snippet reports a global `Temporal` exposed unintentionally from 2026-07-30 with `Temporal.Now` at 1970-01-01 (R-1 T-E9; https://github.com/cloudflare/workerd/discussions/6716), so `civil-time` never reads `Temporal.Now`. No member-visible effect. BOB's to decide; no decision for Bob.

**The litigation hold's device half and retention clocks (B3).**
- *Design:* built at the plane (actions R52–R60); the device half is unbuilt (N521) and every member door is missing (COURTS §3).
- *What must exist first:* the device half; the design stream's doors (K1430).
- *Realism and performance:* not studied. *Decisions for Bob:* none identified (DEC-61, DEC-113 already rule it).

**Standing time questions** ("tell me if the Clerk misses this date") are QUESTIONS L5 (§9.5). The mechanical form already exists: an adopted duty's overdue occurrence reaches the queue once (DEC-94; D252).

### 4.6 Interfaces

| construct | TIME needs from it | TIME supplies to it |
|---|---|---|
| ORGANISATIONS | offices, bodies and venues as entities with parent and employer, so the right calendar applies (X39); the body a recurrence belongs to; the `duties` object that owns a body's duty | `validAt` and EDTF tenures; recurrences; the due part of an occurrence; validity on lines |
| LAW | deadline and notice rules linked to held provisions (X41); amendment and repeal events; recodification across addresses (X73) | `inForceAt`'s interval evaluation; computation of any period a provision states; fiscal periods for budgets as law |
| COURTS | court calendars and clerk channels (cut-offs, outages); `entered`, `served`, `hearing` anchors; register dates | the rule engine and band rule for court dates; a proceeding's chronology; limitation windows for the counsel packet |
| ANALYSIS | per-record timestamps from datasets; lateness rates computed as calculations | `span`, fiscal-period mapping, local-day bucketing; denominators of "due in period"; dataset vintages (generalising `id-spaces` `roll_year`) |
| QUESTIONS | plain-language interpretation of time phrases; FIND deployed | `deadlinecompute` and `validAt` as plane reads, each with basis and undetermined stated |

## 5. ORGANISATIONS AND OBLIGATIONS

### 5.1 Purpose

This construct holds the bodies and organisations the work concerns, of every kind (governments, departments, boards, courts as bodies, special districts, joint powers authorities, companies, contractors acting for government, nonprofits, associations, social clubs, political organisations; K1453), the offices within them as distinct from the people who hold them over time (the people themselves are §5A), the dated lines between them (part of, reports to, oversees, appoints, funds, contracts with, acts for, responsible for, holds the records of), how they change, and the obligations and powers that bind them. Bob's 1 August definition of the analytic product is the gap between how things are supposed to flow and how they really flow (NOTIFICATIONS src 80–109); that gap is this construct's L4. The group's own internal organisation (`membership`) is out of scope.

### 5.2 Needs register

(ORGANISATIONS §1.)

| id | need | in a member's words | centrality | rung | evidence |
|---|---|---|---|---|---|
| A1 | Register a body, office, fund or program and find every document that concerns it | "Show me everything we hold about the Controller's Bureau." | core | L1 | UC-018/019; CF §3 src 404–409; DEC-15 |
| A2 | Tell an office from its holder; who held it when | "Who was Finance Director when the 2022 ACFR was certified?" | core | L2 | RM App A L1049–1077; DR §6 L149–156; journeys §6; X100 |
| A3 | Sub-units and parents | "The Controller's Bureau is part of Finance, not the Clerk." | regular | L2 | research-oakland-calendar L151–269; SR §4.4 |
| A4 | Renamed, merged, split, re-organised bodies | "The department was renamed in 2023; it's the same office." | regular | L2 | CF §11 src 1704–1706; DP `renamed`; X162 |
| A5 | Stable identifiers across systems | "Body 138 in Legistar is the Finance Committee." | regular | L2 | CF §8.3 src 1038–1051; CON Step 5a; https://org-id.guide/list/US-COA |
| A6 | Bodies beyond the city (county, state, special districts, JPAs, vendors, unions, peer groups) | "The bot-blocker is Akamai's, not the City's." | regular | L2 | A&T L63–95; MATRIX §3; 90,837 local governments and 39,555 special districts in 2022 (https://www.census.gov/library/publications/2026/econ/govtorg2225.html) |
| B1 | Reporting and oversight lines | "Who can make the City Administrator act? Who audits the Port?" | core | L2 | escalation R12 (boolean only); UC-123; the brief |
| B2 | Contracts and agency, with roles | "Is the hauler delivering what the franchise requires, and is the city enforcing it?" | core | L2 | journeys §3 L98, L110; CF §8.2; OCDS roles (https://standard.open-contracting.org/latest/en/guidance/map/buyers_suppliers/) |
| B3 | Responsibility and records custody | "The request goes to the office that holds the records." | core | L2 | design-principles §6 L117; journey 5 step 3 L215; DEC-5 |
| B4 | Appointment and seats | "Who appoints the Police Commission?" | regular | L2 | CON `serves_on`; CF §8; Popolo |
| B5 | An accountability chain as of a date | "Who answers for this, then and now?" | regular | L4 | DR §6 L154–156; D243 |
| B6 | Funds and money between funds and bodies | "Sewer Service Fund → General Purpose Fund." | regular | L2 | RM §1 L235–239; consequences `fund`; X132 |
| C1 | Hold an obligation with its source in force | "Declare the franchise's obligations and deadlines." | core | L3 | NOTIFICATIONS src 80–109 (Bob, 2026-08-01; D-128); journeys §3 L110; DEC-107 |
| C2 | Whose move it is: what, from whom, by when | "Waiting on the City Clerk's reply, due 14 October." | core | L4 | DEC-98.2; IC 619; principles §3 L58 |
| C3 | Detect obligations unmet or late, with the derivation | "Minutes for the 4 August meeting are 21 days overdue." | core | L4 | NOTIFICATIONS L105–109; FA L2 Fn4; NYC: 214 of 728 verifiable reports never filed (https://searchlight.citizensunion.org/unfunded-and-unfinished-how-council-mandates-slow-the-city-down/) |
| C4 | Recurring duties (annual reports, audits, minutes) | "The Auditor must report every year by 31 January." | regular | L3 | NYC tracker; CF §8 `has_minutes … within N days` |
| C5 | Exceptions that lawfully discharge a duty | "Sole source is lawful if the justification is published." | regular | L3 | CF §8.2 src 898–905; DEC-9 `unless_exception` |
| C6 | Powers: was an act within the actor's authority | "Were the FY22 sewer fund transfers authorised?" | core | L4 | DEC-16 INQ-2; RM §1 L219–232 |
| C7 | Duties of private bodies acting for government | "The hauler's duty under the franchise." | regular | L3 | canon-mission §3 l.90; X77; CM 906–908 |
| C8 | A body's own commitments | "The Administration promised a plan by October 2023." | regular | L3 | RM L230–232; CM 906–908 |
| C9 | Keep the group's own duties apart from a body's | "That's our checkpoint, not the city's deadline." | core (doctrine) | L3 | D234; DEC-107 |
| D1 | Address an action to a registered office | "Send the demand to the Office of the City Clerk." | core | L2 | actions R9 |
| D2 | Name an act's actor as an office; a holder only in official capacity | "By the City Council (office)." | core | L2 | conformance Terms; DR §6; VM L11 |
| D3 | Escalate along real lines | "Who do we ask next, and why them?" | regular | L2 | escalation R12; UC-123 |
| D4 | Public bodies as the key outward (subject standing, directory) | "Every group working on the Port." | regular | L1 (index key), L5 (network) | DEC-100, DEC-111.6; X86 |
| D5 | Which laws govern an agency | "Is this county office under the CPRA or the city's ordinance?" | regular | L2 | D-149 (CM 221–233); X90 |
| E1 | Cited, as-of answers in plain words, absence by level | "Who is responsible for pothole repair, and are they late on their report?" | core (Bob) | L4 | the brief; X145, X146; DEC-27 |
| E2 | Patterns about an office, with a registry-defined denominator | "The Clerk posted 9 of 14 minutes late since 2024-01." | occasional | L4 | CF §13.1 src 1558–1577; DB 82–88 |
| E3 | Disclose the group's own ties to bodies it examines | "We disclose that a member works for the Port." | occasional | L5 | DR §6 L141–145; UC-101 (partial) |

### 5.3 The ladder

| rung | a member can | example | state on 2026-10-05 | stage |
|---|---|---|---|---|
| L0 Free text | Name a body only as a string | a capture's `authority`; an action's counterparty | **Usable today** (acquisition R15; actions R9) | foundation |
| L1 Registry | Register bodies, offices, people in public roles, funds and contracts with aliases; resolve documents to them with a grade; see what concerns a subject | "Everything that concerns the Controller's Bureau, with each resolution's grade." | **Usable today, partly.** Subjects screen: `entitycreate`, `entityalias`, `relationdeclare`, `resolve`, `resolvetestify`, `concerns` (22 UI calls); correction and defect acts UI 0 (entities R1–R38). Search names a body only through free-text `authority` (R-1 O-E3) | first stages |
| L2 Structure as of a date | Record and read evidenced, dated, graded lines and holders; renames; identifiers; actors and addressees linked to the registry | "On 1 July 2022 the Auditor reported to the Council (the charter section, cited)." | **Not built.** Only the constitutive, undated, untraversed `member_of` (`entities/schema.mjs:42–54`; entities R26). Every `{role, body}` in layer 9 is text; the add flow's named addressee collides with actions R9 (`app.html:19983`; synthesis §7 item 8) | stage 1, O1 |
| L3 Obligations held | Hold who owes what to whom, by when, under which authority: duties, prohibitions and powers, each sourced and versioned | "Obligation: the City Clerk must post minutes within a stated period (labelled practice, not law)." | **Not built.** Duties exist only as a progression stage's requiredness, a clock's free-text basis or prose | stage 2, O2 |
| L4 Declared against observed | Occurrences derived with state and why; powers read with instruments; chains walked as of a date; patterns with denominators | "Noticed: the Clerk posted 9 of 14 minutes late since 2024-01; derivation shown." | **Fragments.** `progressions` overdue and missing findings are reachable but have no obligor, beneficiary or source in force (progressions R16, R17) | stage 2; EXTRACT proposals at stage 3 |
| L5 Network-scale civic model | Structure and obligation registers shared between groups as recreatable material; standard identifiers and exports | "Import the Port's structure pack from the coalition, recreated here." | **Not built** | planned (later stage; §5.5) |

### 5.4 Rungs in the first stages

Bob's decisions these rungs rest on: B3 (`lines`, `duties`), B4 (one obligation object; who may owe one, recommended (B) public bodies and bodies acting for one), B5 (entity and line kinds), B6 (walking evidenced lines; powers without verdicts), B7 (what the machine writes without a member), B8 (private individuals), B13 (i) (an occurrence as a leg), B20 (the office page; "obligation", "power", "lines").

**L1 to L2: structure (synthesis stage 1, "O1").**
- *Design:* `entities` gains `identifiers [{scheme, id, basis}]` (resolving at grade A) and the kinds `program`, `place` (and `proceeding` for COURTS; B5). New `lines` in layer 5 directly after `entities` (about 1,800 lines): `{kind, from, to, role?, valid, basis, asserted_by, end resolution}` over the closed kinds `part_of`, `post_in`, `holds` (with status), `reports_to` (administrative, functional, budgetary), `oversees`, `appoints`, `seat_on`, `funds`, `contracts_with` (OCDS roles), `acts_for`, `responsible_for`, `custodian_of`, `successor_of`, plus COURTS' families; graded on two axes; reads `structureAt`, `holderAt` (undetermined when no line covers the date or two overlap) and a bounded `chain`.
- *The bridge:* at instance setup each profile office `{role, body}` (jurisdictions R24) is seeded as an `office` entity, machine-attributed and system-asserted; `local-facts` R6 then follows `part_of`, `escalation` R12 follows `oversees`/`appoints` (the profile flag only as fallback), `actions` suggests an addressee from `custodian_of`/`responsible_for`, `conformance` actors carry an `entity_id`; `query-language` gains `holder:`, `obligor:`, `owed_to:`.
- *Seeding without AI:* a Legistar `OfficeRecords` reader is a generic content type whose output is a system-rule assertion (DEC-52), and it seeds council and committee seats and their holders (Legistar `Persons`; §5A); staff posts come from directories, org charts, budget books and appointment resolutions, read by name (R-1 O-E2).
- *The AI's part:* none needed for seeding; proposals of lines from charters and charts come with EXTRACT (stage 3).
- *The member decides:* any line from a name match.
- *Size:* about 45 requirements.
- *Measure first:* Legistar seats by body and year; offices concerned by more than 32 documents (D-224's trigger); whether budget department codes stay stable across two fiscal years; the directories in the corpus (about 395 ± 272); the distribution of line grades; the bridge's resolution rate.

**L3 to L4: obligations (stage 2, "O2").**
- *Design:* New `duties` in layer 5 after `progressions` (synthesis §3.1): `DUT-` with `modality` (duty, prohibition, power), `obligor` (an office or body, or a person where a law binds them by name or role, K1453), `obligee`, `performance`, `source` (held standard at its version; court standard paragraph; labelled practice; labelled dependency), `trigger`, `time` (computed by `civil-time`, never stored), `exceptions`, `enforcer` (a contractor's breach is routed to its enforcing office), `observed_by`, `arising_in`, `reported_status[]`, `in_force` (derived). Occurrences derived on read, dated from `chronology`, never from capture time (R-1 O-O3). A profile deadline is a generic duty ("the agency asked"), so a records request's clock is one occurrence of the addressed office's duty. `powersOf({office, at})` lists the powers in force with their instruments and any delegation instrument held; never within or not within (B6). `progressions` may store a `DUT-` id as data but never reads `duties`. `strength` R12 treats `part_of` and `acts_for` as one issuing source (closing X118).
- *The AI's part:* proposes duties and powers from charters, codes, contracts, orders and budgets, always adopted by a member naming the clause (B7).
- *Size:* about 60 requirements.
- *Measure first:* a hand-built gold set (one code chapter, one franchise, one consent decree) for EXTRACT's precision; contract-obligation extraction reaches at best 70.56% (https://fse.studenttheses.ub.rug.nl/34210).

### 5.5 Later rungs, planned

**L5: a network-scale civic model (synthesis stage 4, "O3").**
- *Design* (ORGANISATIONS §2, §6): structure and obligation registers travel between groups as signed packs. A group shares a pack only by an explicit act, like publishing. A receiving group accepts it by a reasoned act (DEC-96) and its instance recreates it, never installs it, with provenance under DEC-45/96 and no inherited grade (the receiving instance trusts nothing the sender asserts, D312; the `case-import` pattern). What travels about people is decided with B22 (Bob's; B8 ruled, K1452). Identifiers with schemes make the match: OCD-IDs for jurisdictions and divisions, org-id schemes (`US-COA`, EINs), source-system ids such as Legistar `BodyId` (never `ENT-` ids). Exports: Popolo for posts and memberships (https://www.popoloproject.com/specs/), OCDS milestones for an obligation register (https://standard.open-contracting.org/latest/en/schema/reference/), W3C ORG terms (https://www.w3.org/TR/vocab-org/). Cross-group coordination keyed on bodies (D4's network form; DEC-100, DEC-111.6). Disclosure of a group's own ties to the bodies it examines (E3). Modules: extensions of `lines`, `duties`, `case-import` and the export path; no new module was studied.
- *What must exist first:* O1 and O2 in use (`lines`, `duties`, identifiers populated with schemes); `case-import`'s recreate path; D-224's pair materialisation reopened at its trigger (below). Measure first: how many groups work on one body, how much of their structure overlaps, and the share of entities carrying a scheme identifier. Size: not studied.
- *Realism and performance:* the identifiers exist and are free: OCD-IDs (https://open-civic-data-docs.readthedocs.io/en/latest/ocdids.html), org-id (https://org-id.guide/list/US-COA), Legistar's unauthenticated `Bodies`, `Persons` and `OfficeRecords` (seats only, R-1 O-E2), the Census of Governments' unit files (https://www.census.gov/programs-surveys/gus/data/datasets.html). Paid officeholder feeds (Cicero, BallotReady) would need a vendor key in every instance (D201) and stay outside. Outside datasets can vanish: Google's representatives API was turned down on 30 April 2025 (https://groups.google.com/g/google-civicinfo-api/c/9fwFn-dhktA/m/ftUoL83mAwAJ). A city's structure (thousands of entities, tens of thousands of lines, a few thousand obligations) fits one Durable Object's SQLite (10 GB). Off the everyday path: a pack enters through `acquisition` as a capture under the host governor and is recreated as background processing; sharing and accepting are explicit acts, so the rung is opt-in per group; occurrences and chains stay derived per read within their published bounds.
- *Decisions for Bob:* (policy, B22) sharing only by an explicit act like publishing, acceptance by a reasoned act (DEC-96), recreated and never installed: recommended. (People) B8 ruled (K1452); what a shared pack carries about people is part of B22. (Policy) whether and how a group discloses its members' ties (E3; UC-101 is partial and no requirement covers it): not studied. Export formats and their timing are BOB's (synthesis §6).
- *Risks:* stale shared structure after a re-organisation (contained by validity periods, `successor_of`, and undetermined beyond the last basis); inherited trust (contained by recreation and no inherited grade); people's data travelling (decided with B22).

**Scale, at any rung.** `connections` caps an office at 32–100 documents (connections R2; D-224), while a city body is concerned by thousands; truncation is stated, not hidden. D-224's pair materialisation is reopened for office and body entities when its trigger fires (BOB's; synthesis §6).

### 5.6 Interfaces

| construct | ORGANISATIONS needs from it | ORGANISATIONS supplies to it |
|---|---|---|
| TIME | `civil-time` (business days by an office's calendar, recurrences, `validAt`, zone); `chronology` for a deliverable's own date | which office and parent a clock runs for; every wait's "from whom"; occurrences for TIME's notices |
| LAW | `standards` in layer 5 at portion and version, as a duty's source; issuers as entities | duties as the structured reading of provisions; which law governs which body (D-149) |
| COURTS | courts and forums as bodies; parties with roles; orders and decrees as sources | `lines` party and proceeding families; enforcers and oversight lines; `duties` with `arising_in` |
| ANALYSIS | performance measures as calculations; registry-scoped denominators | fund, program and department keys for joins; occurrence counts per office and period |
| QUESTIONS | INTERPRET resolving named bodies to the registry; FIND calling the new reads | cited, as-of answers on holders, lines, duties, powers and late occurrences, each with grade and level |

## 5A. PEOPLE

*Added 2026-10-05 by BOB #112 on Bob's ruling of B8 (K1452, K1453). Not from the study: its needs register is Bob's statement and the practice of investigation; each rung is re-verified when its stage is planned.*

### 5A.1 Purpose

Bob, 2026-10-05: "Tracking the activities, statements, and connections between individuals is, and has always been, an essential element of investigations." This construct holds the people the work concerns: officials and staff, today and in the past, and anyone else a document puts in the work (contractors' principals, lobbyists, donors, board members, parties to proceedings). For each person it holds their positions and career inside and outside government, their education, degrees, licences, military service and other credentials, their memberships, their statements and acts, their financial interests and money given or received, and the evidenced overlaps between people over time, which is the substrate for "who knows who" even when their current circumstances do not connect them. Every fact about a person is cited, dated and graded like any other fact; the machine never concludes about a person. Publication is unchanged: a published work product names an individual only in their official capacity in connection with a specific documented act (Design Requirement 6), so what the record holds for investigation is not what a case publishes.

### 5A.2 Needs register

| id | need | in a member's words | centrality | rung | evidence |
|---|---|---|---|---|---|
| P1 | Register a person, with their other names, and find every document that concerns them | "Everything we hold about Jane Doe." | core | L1 | Bob, 2026-10-05; entities kind `person` |
| P2 | Who holds or held a post, by name | "Who is the deputy director of city planning? What's their name?" | core | L2 | Bob, 2026-10-05; DR §6 L149–156 (predecessors stay accountable) |
| P3 | A person's career, inside and outside government | "What other jobs have they had, at the city or anywhere else?" | core | L2 | Bob, 2026-10-05 |
| P4 | Education, degrees, licences, military service and other credentials, with the issuing body and status | "Where did they go to school? Is their engineering licence current?" | core | L2 | Bob, 2026-10-05 |
| P5 | Memberships: associations, clubs, political organisations, boards | "Which boards and associations does she sit on?" | regular | L2 | Bob, 2026-10-05 |
| P6 | An organisation's staffing, today and in the past | "Who worked in Public Works' contracting unit in 2021?" | core | L2 | Bob, 2026-10-05 |
| P7 | A person's statements and acts across documents, dated | "Everything he said about the sewer fund, in order." | core | L2 | Bob, 2026-10-05 ("activities, statements"); TIME `chronology` |
| P8 | Financial interests, gifts, money given and received, lobbying, company officer roles | "Did the councilmember disclose an interest in the contractor?" | core | L3 | statements of economic interests, campaign finance and lobbying registers (profile data per jurisdiction) |
| P9 | A possible conflict surfaced as a question, never a verdict | "She voted on a contract with a firm her former employer owns: worth a look." | core | L3 | Doctrine §10 (the machine never concludes) |
| P10 | Who knows who: evidenced overlaps between two people over time | "Did the planning director and the developer's lobbyist ever work, study or serve together?" | core | L4 | Bob, 2026-10-05 |
| P11 | Movement between government and the bodies it oversees | "Which regulators went to work for the companies they regulated?" | regular | L4 | Bob, 2026-10-05 |
| P12 | Ask about a person in plain words; import public registers; be told of a change | "Tell me if she files a new statement of interests." | regular | L5 | B1 (c), K1432 |

### 5A.3 The ladder

| rung | a member can | example | state on 2026-10-05 | stage |
|---|---|---|---|---|
| L0 Names in text | Find a person's name as a string in documents | search for "Jane Doe" | **Usable today** | foundation |
| L1 Registry | Register a person with aliases; resolve documents to them with a graded match; see what concerns them | "Everything that concerns Jane Doe, each match graded." | **Usable today, partly**: the `person` kind exists on the Subjects screen (entities R1–R38); no person-specific read | first stages |
| L2 Positions, career, credentials, statements | Record and read dated, cited facts: posts and employment anywhere, education and degrees, licences and credentials with issuer and status, military service, memberships; an organisation's staffing as of a date; a person's statements and acts in order | "The deputy director of planning since March 2024 is Jane Doe; before that she was a project manager at a private developer (her LinkedIn capture and the appointment resolution, cited)." | **Not built** | stage 1, with `lines` |
| L3 Interests and money | Hold interests, gifts, contributions given and received, lobbying registrations and company officer roles as dated, cited facts; surface a possible conflict as a question in the queue | "Noticed: the councilmember reported income from Acme Ltd in 2023 and voted on Acme's contract in 2024; derivation shown." | **Not built** | stage 2 |
| L4 Connections over time | Walk evidenced overlaps between people (same employer, unit, board, school and years, campaign, address, co-signed document), bounded, as of a date, each hop cited and graded; patterns such as movement between regulator and regulated, with denominators | "The planning director and the lobbyist both worked at Smith & Co. from 2015 to 2018 (two cited captures); no other overlap held." | **Not built** | stage 2, reads at stage 3 |
| L5 Assisted, imported, watched | Ask in plain words; import public registers (campaign finance, lobbying, licensing, corporate filings) with their identifiers; be told when a watched register changes | "What's known about the new deputy director's career?" | **Not built** | stage 4 |

### 5A.4 Design, at BOB's level (K1453)

- **Where it lives.** A person is an `entities` entity of kind `person` (it exists). Facts about a person are `lines` from the person (B5's list gains the family below) and statements are `chronology` dated acts that name the person. A new product module **`people`**, in layer 5 after `lines`, composes them: `personAt({person, at})` (posts, employers, memberships in force), `careerOf(person)` (every line, in date order, each cited), `credentialsOf(person)`, `staffingAt({body, at})`, `overlaps({a, b, window})` and a bounded `path({a, b, at, maxHops})`. About 40 requirements at L2 and L4; interests (L3) add about 20.
- **Line kinds added (closed, revised only by spec):** career and credentials: `employed_by` (with title and unit), `educated_at` (with degree and years), `credentialed_by` (licence or certificate, number, status), `served_in` (military service, branch, years), `belongs_to` (associations, clubs, political organisations); interests and money: `officer_of`, `owns_interest_in`, `gave_to` and `received_from` (contributions, gifts), `lobbies_for`; personal: `related_to` (family ties; B8a ruled (a), K1455: any family tie or personal fact a cited document states may be held, with no special rule).
- **Organisations of every kind.** An organisation's kind (`institution`, `body`, `movement`) gains a closed `sector`: government, company, nonprofit, association, political, religious, education, other. The registry holds any organisation a document puts in the work, not only governments.
- **Who knows who, without concluding.** An overlap is a set of cited, dated facts (two people on the same board in the same years), shown as such; the machine never says that two people know each other, never ranks people by how connected they are, and never infers a tie no document states. Walks follow §10's rule for evidenced lines (bounded, as of a date, weakest hop governing, undetermined on exhaustion).
- **Identity.** Two people with the same name are never merged without evidence; a match carries its grade, and a disputed match is undetermined. Identity resolution never traverses a line (entities R26).
- **What the machine writes without a member (B7 (A)).** Only facts from source data with identifiers at both ends (Legistar `Persons` and `OfficeRecords`, a licensing board's record by licence number, a campaign-finance filing by filer id); everything else is proposed for a member to adopt.
- **Obligations.** A duty may bind a person by name or by role where a law does (a filer's statement of economic interests, a lobbyist's registration), not only an office or body (K1453 amends K1440).
- **Publication.** Unchanged: Design Requirement 6 governs every published work product. A case names an individual only in their official capacity in connection with a documented act; the group's record may hold far more.

### 5A.5 Interfaces

| construct | PEOPLE needs from it | PEOPLE supplies to it |
|---|---|---|
| ORGANISATIONS | bodies, offices and units as line ends; `holds` for posts | holders by name; staffing as of a date |
| TIME | `civil-time` and `chronology` for every dated fact and statement | dated career events for timelines |
| LAW | the laws that oblige filers and registrants | filers and registrants as obligors |
| COURTS | parties as people where a document names them | a party's other roles |
| ANALYSIS | contributions and interests as datasets; denominators | person-keyed rows for patterns |
| QUESTIONS | INTERPRET resolving names to people | cited answers about a person, with grade and level |

## 6. LAW

### 6.1 Purpose

Law is the standard the work measures against: charters, statutes, codes, ordinances, resolutions, regulations, policies, budgets as law, contracts and commitments held as binding. The construct holds the law's own words with the standing of the copy, at the version in force on the date of an act and at section level, linked to the documents that cite it, and makes it available where investigation runs, so that "each requirement becomes a question". Bob: "Law and regulations are at the very heart of much of this work." Members see "standard" for law, policy or a commitment held and "requirement" for one thing it requires (B20).

### 6.2 Needs register

(LAW §1.)

| id | need | in a member's words | centrality | rung | evidence |
|---|---|---|---|---|---|
| N1 | Find the standard the city set for itself, before any question exists | "Which ordinance or policy says how fast potholes must be fixed?" | core | L2 | journey 4 step 3 (L197); FA L1 Fn1; RM §10 L650 |
| N2 | Every law that governs a body or request (federal, state, local) | "Which records laws apply to the County Assessor?" | core | L1 | CM 218–226 (D-149: "ALL records laws apply"); X90 |
| N3 | The law's own words, where and when taken, and the copy's status | "Is this code page the official text, or a codifier's copy that may be stale?" | core | L2 | standards R2; Municode terms ("should not be relied upon as the definitive authority"; URL now 404, text confirmed by search, R-2 L-E9); UELMA (https://en.wikipedia.org/wiki/Uniform_Electronic_Legal_Material_Act) |
| N4 | Every document that concerns this ordinance or section (the reverse index) | "Every agenda item and staff report that cites Ordinance 13579." | core | L1 | CON Step 4 L261–262; CF §8.1; DEC-95.3 |
| N5 | The law in force on the date of the act | "The transfer was in FY22; what did §13.04.080 say then?" | core | L2 (whole), L3 (portion) | conformance R3; CF §11; https://law.gwu.libguides.com/statutorylaw/updating |
| N6 | Amendments, repeal, renumbering, recodification, codifier lag | "The code online says X, but Council amended it in March; which governs?" | regular | L3 | RM App B (CPRA recodified 2023); https://www.civicplus.com/blog/cs/why-codification-is-necessary/ |
| N7 | Be told when cited law changes | "The section our finding cites was amended." | regular | L3 | CF §18.1; conformance R10; X73 |
| N8 | Law at section and requirement level, one question per requirement | "Chapter 13.04 has five requirements; open a question for each." | core | L2 | journeys §3 L105; DEC-23 |
| N9 | Definitions, cross-references and exceptions in context | "The procurement rule has an emergency exemption in §2.04.050." | regular | L3 | DEC-60; IS §5; D273 |
| N10 | Hierarchy and conflict of norms | "Prop 218 overrides the municipal fee ordinance." | occasional | L3 | DEC-76.3; CM 791–795; X14 |
| N11 | Contracts, policies, budgets and commitments as standards | "Is the hauler meeting the franchise's service levels?" | regular | L2 | journeys L98–100; DEC-27; ACTION-PLAN l.65 (two-thirds vote); RM §5 OP1 |
| N12 | Compare an act with a requirement during investigation | "What does the law require, what did the city do, where do they diverge?" | core | L4 | FA Layer 2 Function 1 (L254–261); IS §8 L770–783; CONTRADICTION-IDENTIFY §1 |
| N13 | Determine compliance per standard after publication, and act on a breach | (built) | core | L4 | AC §3, §4 rule 2; conformance R1–R9; actions R8 |
| N14 | Lawful skips and exception documents in a procedure | "A sole-source award with no justification published." | regular | L4 | DEC-9; progressions R11, R14 |
| N15 | Deadlines that come from law (TIME owns) | "The CPRA's 10 days, linked to the section." | core | L2 | layer-9 contract ("every deadline names its basis"); X41 |
| N16 | The published finding states its criteria | "Criteria: OMC 13.04.080 as in force on 1 July 2022." | regular | L2 | DEC-77.2, DEC-84.10; GAO Yellow Book (https://www.gao.gov/press-release/gao-issues-2024-yellow-book-updating-standards-government-auditing) |
| N17 | Explain a charge or a rule | "What's this sewer maintenance charge on my water bill?" | regular | L4 | journeys §6 L529; X154 |
| N18 | The assistant proposes laws with citations, and never states the law | "Find me the rule, with the text." | core | L2 | UC-004; D274; legal tools hallucinated in 17–34% of benchmark queries (https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries) |
| N19 | The counsel packet carries the standards' text and theories | (built) | occasional | L4 | filings R8–R14; DR §8 |
| N20 | Court decisions that interpret a provision (COURTS owns) | "Which ruling read this section?" | occasional | L5 | journeys §6 "Following a court case" |

### 6.3 The ladder

| rung | a member can | example | state on 2026-10-05 | stage |
|---|---|---|---|---|
| L0 Law as plain evidence | Capture a code page, ordinance or contract and cite passages as legs | "Leg: OMC page, §13.04.080 passage." | **Usable today** | foundation |
| L1 Law named | Type citations; identifiers recognised; find documents citing them | "Governing law: the CPRA, typed as a citation; every document citing it found." | **Usable today, just.** `actionlaws` (UI 3); `readingref` (UI 1); backlinks (UI 9); `id-spaces` recognises enactment numbers | first stages |
| L2 Law held during investigation | Declare a standard from captured text; ask "in force on D?"; cite it from an inquiry, flow or deadline; the AI proposes candidates with captured text | "STD-: OMC 13.04.080, in force on 1 July 2022: yes (period basis: the amending ordinance, cited)." | **Built, not reachable, and in the wrong layer.** `standards` (849 lines) in layer 9: one text block, at most 50 content ids, no sections; six ops, UI 0; no AI caller; no Legal/Policy Lookup skill (`standards/index.mjs:13`) | stage 1 |
| L3 Law structured and versioned | Work, versions, portions; amendment, repeal, recodification links citing the amending instrument; cross-references and definitions; rank from the profile; "what did §X say on D?" with codifier lag stated | "§13.04.080(b) as amended by Ordinance 13579, from its effective date; the codifier's copy is current through a stated date." | **Not built.** Only whole-standard `supersedes` with one successor (standards R6); version notice per address (X73) | stages 1–2 |
| L4 Law applied and explained | The AI prepares comparison rows (requires · did · reading) for a member to evaluate; canon proposals; a labelled reading; determinations after publication | "Requires: minutes posted within the stated period · Did: posted after it (dated captures) · Reading: undetermined where a term is undefined." | **Partly built, not reachable.** `conformance` (1,539 lines) determination and comparison store in layer 9, UI 0; no reading or canon proposal | stage 3, in what the AI prepares during investigation; determination stays after publication (K102) |
| L5 Law shared and watched | Import held law from structured public sources or another group's case; watch legislative systems; link court interpretations to portions | "Load an eCFR part as of a past date; an ordinance amending a held section was enacted yesterday." | **Not built** | planned (later stage; §6.5) |

### 6.4 Rungs in the first stages

Bob's decisions these rungs rest on: B2 (the move), B11 (the model of law; one home for cited law), B12 (what the machine may say about law), B13 (iii) (a leg on a held standard), B15 (a), (b) (keyless sources; fee-bearing records by a member's act), B20 (the Standards register; "standard", "requirement", "bar"). No change is asked on determination timing (K102 stands). The synthesis names LAW's stages "L1"–"L4"; those labels are stages, not the rungs of this ladder.

**L2, with the first of L3 (synthesis stage 1, "L1, law in the investigation").**
- *Design:* `standards` moves whole to layer 5, after `connections` and before `progressions` (B2); `conformance` stays whole in layer 9. `standards` gains `instrument` (a work key composed from profile data, shaped like ELI), `portion`, `requires`, `copy` (official, codifier, undetermined), `current_through`, `period_basis`, `inForceAt({key, portion?, date})` answering undetermined with a reason, and `standardsFor` (the reverse index). `jurisdictions` gains `law_ranks`, the copy status per code and the amending-clause vocabulary. The `regulation` reader adds section paths and headings; `docprofile` (3,170 lines) is split first under K617. Retrieval fields `standard:` and `cites:`; a flow basis, governing law or deadline basis may name a held standard (B11 (ii)); an inquiry leg may cite a held standard (B13 (iii)), until which a question cites the captured passage as an information leg. The `legal_lookup` skill text: search the four levels, request captures of what is missing, propose standards with captured text (a proposal without it cannot be adopted, `STANDARD_NO_TEXT`), and publish what it could not mechanise beside what it did (DEC-54).
- *The AI's part:* proposals only, and only once investigate mode (VF-4) and the account are live (R-2 L-E5).
- *The member decides:* declaring and adopting standards.
- *Size:* no new module, about 11 touched, about 30–40 requirements.
- *Measure first:* captured OMC pages and ordinances (about 1,850 ± 314) and the `readingref` resolution rate; section-boundary accuracy on 50 OMC pages; codifier lag against Legistar; 30 seeded law questions (citations resolving; acceptance); how the official code is served (Oakland's Municode is an Angular shell, so `monitoring` R5 reads it undetermined on every tick, R-2 L-E8); the `MODULE_ORDER` listener order after the re-pin (R-2 L-E7).

**L3 complete (stage 2, "L2, versions and structure").**
- *Design:* Amendment, repeal and recodification relations from captured enactments (Legistar `MatterEnactmentNumber`, `MatterEnactmentDate`, `MatterStatusName`; https://webapi.legistar.com/Help/Api/GET-v1-Client-Matters); definitions and exceptions; version notices across addresses through instrument keys (closing X73); watching on Legistar enactments, not rendered codifier pages; the citation resolver for COURTS. A member adopts any relation that changes an in-force answer.
- *Planned in stage 2* (B1 (c)). The study's earlier triggers (a cited provision that changed between the act and publication; a member's "what did §X say on D?"; codifier lag above the monitoring interval) now mark where it matters first, not whether it is built.
- *Size:* 4–6 modules, 20–30 requirements; `law-relations` split off only if `standards` nears 4,000 lines.

**L4 in what the AI prepares (stage 3, "L3, applied and explained").**
- *Design:* `compliance_analysis` rows per requirement, never an outcome (conformance R12, `PROPOSAL_CANNOT_DETERMINE`); contradiction's canon proposals from rank and periods (labelled, never picking a side); the explain-a-rule reading (B12 (ii)): it quotes the provision at its version, states its limits ("undefined term", "exception at §…", "versions before … not held"), says "legal information, not legal advice", and never says "the law is", a member's rights, a likely outcome or what to file; requirement extraction under DEC-54's split.
- *What must exist first:* investigate deployed, with stage-1 acceptance above a bar BOB sets. The conformance comparison split (about 150 lines, `conformance/index.mjs:911–1048`) stays deferred until a layer 5–8 module must read a comparison in code.
- *Size:* 3–5 modules, 15–20 requirements.

### 6.5 Later rungs, planned

**L5: law shared and watched (synthesis stage 4, "L4, shared and imported law").**
- *Design* (LAW §2, §6 stage 4): imports of point-in-time texts as captured documents with provenance: Akoma Ntoso (https://docs.oasis-open.org/legaldocml/akn-core/v1.0/os/part2-specs/os-part2-specs_xsd_Element_timeInterval.html; Laws.Africa's works and expressions, https://developers.laws.africa/content-api/works-and-expressions; Indigo, https://indigo.readthedocs.io/en/latest/), USLM (https://github.com/usgpo/uslm) and eCFR as of a date (https://www.ecfr.gov/reader-aids/ecfr-developer-resources). Imported texts land on the same instrument keys and portions; their `copy` and `period_basis` say where they came from. Sharing between groups: a group shares its held standards only by an explicit act, like publishing; a receiving group accepts them by a reasoned act (DEC-96), and they are recreated, never installed (`case-import`; D312). Legislative watching on enactment records (Legistar; Open States for state bills). Court interpretations linked to portions (`interprets`, `applies`, `holds_invalid`, with COURTS). A standard of proof per venue (jurisdictions R39 already holds venue evidence standards). Modules: `standards` (or `law-relations` if split), `acquisition`, `case-import`; no new module was studied.
- *What must exist first:* LAW stages 1–2 (instrument keys, portions, law relations, enactment watching); COURTS C1 for interpretations; `case-import`'s recreate path. Measure first: whether each source serves static structured text or a rendered page; the share of imported portions that map onto existing keys. Size: not studied.
- *Realism and performance:* eCFR serves federal regulations as of a date and states its currency; USLM is the federal code's published XML; Akoma Ntoso is used where publishers adopt it (Laws.Africa, Indigo), and the study found no U.S. city code served that way. Municipal codes mostly reach the public through codifiers (ICC Code Solutions serves more than 7,000 communities; Municode); Oakland's Municode is a rendered Angular shell (R-2 L-E8), so a municipal code arrives as rendered captures read by the structure reader, not as a structured import. Legistar's enactment records are static JSON with no key; Open States needs a free key (https://docs.openstates.org/api-v3/). Off the everyday path: imports are captures processed page by page in `acquisition` and `extraction` (128 MB per isolate, shared; CPU 30 s by default, configurable to 5 min); watching runs on `monitoring`'s scheduler tick (at most 50 subjects per tick); imports and keyed services are switched on per group.
- *Decisions for Bob:* (policy, B22) sharing only by an explicit act, acceptance by a reasoned act (DEC-96): recommended as for ORGANISATIONS L5. (Policy, sovereignty) keyed services such as Open States or commercial legal databases: B15 (c), which since B1 (c) BOB recommends as built into every copy, off by default and switched on by a group with its own key; no vendor key is ever required (D201). (Requirement meaning) whether an imported standard counts as an `official` copy: not studied. (Doctrine) a labelled reading of court interpretations follows B12 (ii): rulings quote-only until acceptance is measured.
- *Risks:* imported law treated as authoritative without its standing (contained by `copy`, `current_through`, provenance); a lagging or vanished source (the Municode terms page moved within the study; free access to the law is a right, *Georgia v. Public.Resource.Org*, 2020, https://www.loeb.com/en/insights/publications/2020/05/georgia-v-public-resource-org); size of `standards` (split under K617).

**A record object for the instrument (the work).** In stage 1 the work is a key, not an object. If audit or publication needs to name a work apart from its versions, it becomes a record object; that is BOB's (LAW §5.3).

### 6.6 Interfaces

| construct | LAW needs from it | LAW supplies to it |
|---|---|---|
| TIME | period and as-of semantics (`validAt`, EDTF, undetermined bands); business-day counting for law-set periods | in-force periods and `inForceAt`; a deadline's basis as a link to a held standard; dated versions for the later-over-earlier canon |
| ORGANISATIONS | issuers and actors as offices with entity ids; `ordinance` and `contract` entities (DEC-6, `ENTITY_KINDS`) carrying instrument keys | the authority of a duty; which law governs which body (N2) |
| COURTS | proceedings as objects, so a `court` standard can `interpret` a portion | `court` standards (orders, decrees, decree paragraphs); the citation resolver; `interprets`, `applies`, `holds_invalid` and treatment rows |
| ANALYSIS | computed figures to set against legal thresholds | each threshold's text and in-force version as the Criteria (a calculation may cite a held standard as a threshold) |
| QUESTIONS | FIND and investigate deployed; four-level absence extended to law | `legal_lookup`, `compliance_analysis`, the explain-a-rule reading, all fenced by `answers` |

## 7. COURTS

### 7.1 Purpose

Courts and tribunals produce the orders, rulings, decrees, reports and recommendations that bind or describe the bodies a group watches. The construct lets a member follow a proceeding (the city's, a utility's, the group's own), know when something new is filed or ordered, cite orders to the paragraph, hold a decision as a standard, track the duties that orders, decrees, grand jury reports and audits impose, and keep every citation honest. It covers administrative and quasi-judicial proceedings (commissions, hearing officers, inspectors general, audits, grand juries, Attorney General opinions). Members see "proceeding" for a matter before a court or tribunal and "register" for its list of entries; "case" (the group's publication, DEC-72) and "docket" (its public response log, DEC-116) are taken words (B20).

### 7.2 Needs register

(COURTS §1, with R-2 C-E8.) None of the design session's 172 use cases follows a proceeding; the needs come from Bob ("as are court cases"), the canon, the journeys' court and regulatory rows (§3 L106, L111) and watchdog practice.

| id | need | in a member's words | centrality | rung | evidence |
|---|---|---|---|---|---|
| A1 | Identify and follow a proceeding (forum, number, kind, parties by role, where it stands) | "The city is a defendant in the sewer-fee suit: which court, what number, who are the parties, where does it stand?" | core | L2 | journeys §3 L106, L111; FA L1 Fn1; journeys §6 L531 |
| A2 | Know when something new is filed or ordered | "Tell me when the judge rules on the demurrer." | core | L2 | Free Law Project alerts (https://free.law/2018/08/21/announcing-pacer-docket-alerts-for-journalists-lawyers-researchers-and-the-public/); Alameda eCourt register of actions (https://eportal.alameda.courts.ca.gov/?q=node/388) |
| A3 | Hold filings, orders and rulings as cited evidence, to the paragraph | "Paragraph 12 of the order says the City must produce within 30 days." | core | L1 | DEC-4 src 110–113; DEC-23 |
| A4 | The proceeding's dates in view (hearings, briefing, compliance, appeal windows) | "When is the hearing, and when must the city comply?" | regular | L2 | journeys L106; X50; TAD §8.2 l.917 |
| A5 | Outcome and appeal chain; which ruling stands now | "Was the trial court reversed?" | regular | L2 | journeys §6 L531 |
| A6 | Settlements and judgments paid | "What has the city paid in police-misconduct settlements since 2019?" | regular | L3 (amounts from ANALYSIS); patterns L5 | RM App B L1099 (Livermore, $3.78M); https://www.kuow.org/stories/tracking-police-misconduct-settlements-that-cost-cities-millions |
| A7 | Regulatory proceedings | "In the utility's rate case, when are comments on the proposed decision due, and who are the parties?" | regular | L2 | HO §2 L18 ("the CPUC especially"); DEC-100; https://webproda.cpuc.ca.gov/about-cpuc/divisions/news-and-public-information-office/public-advisors-office/tracking-issues-of-interest; regulations.gov API (https://open.gsa.gov/api/regulationsgov/) |
| B1 | Consent decrees and settlements as long-running duties | "Which tasks did the monitor find OPD out of compliance with, and does our record agree?" | regular | L3 | RM §1 L279–281 (the 23-year OPD decree); monitor levels Preliminary, Secondary, Full (https://www.justice.gov/crt/case-document/file/1365081/download); Oakland monitor reports 2010–2025 |
| B2 | Grand jury reports and the replies the law requires | "Did the Council answer the grand jury's report within 90 days, and did it do what it said?" | regular | L3; patterns L5 | RM App B L1086–1087; CM 939–941; Penal Code 933.05 (https://california.public.law/codes/penal_code_section_933.05) |
| B3 | Audit recommendations still open | "Which of the Auditor's February 2022 recommendations are still open?" | regular (R-2 C-E8) | L3 | RM §1 src L250–251; DEC-77.2; https://www.sandiego.gov/auditor/reports/recommendation-follow-dashboard |
| B4 | Administrative and quasi-judicial decisions; AG opinions | "What did the Ethics Commission decide, and does the AG's opinion support our reading?" | occasional | L1 (held and cited); L4 | IS §14a; AG opinions are advisory (https://oag.ca.gov/node/6) |
| C1 | Hold a decision or order as a standard | "The city is measured against this decree." | core | L1 | AC §3 L20; standards R1, R6 |
| C2 | Precedent tied to what it interprets, and whether it still stands | "Is Carachure still good law, and which provision did it read?" | regular | L4 | RM L272–274, App B L1096–1102; FA Fn4 L317–319; HO §4 L71 |
| C3 | Find precedent and verify every citation | "Find California rulings on franchise fees under Prop 26, and check each citation is real." | regular; core once an AI touches law | L1 (verification), L4 (finding) | FA L447; Citation Lookup as a guardrail (https://free.law/2024/04/16/citation-lookup-api/) |
| D1 | Follow the group's own petition after filing | "Our records petition: when is the hearing, and were fees awarded?" | regular | L2; backward question L5 | RM §1 L256–258; App B L1081–1084 (7923.005, 7923.115, filing fee $435) |
| D2 | Referrals to oversight bodies and what came back | "The grand jury complaint: what did they do with it?" | regular | L2 | INVENTORY §3 |
| D3 | Counsel briefing with related proceedings and precedent | (counsel packet) | occasional | L4 | filings R9 |
| D4 | The group as defendant or subpoenaed | "We got a SLAPP threat." | occasional, critical | L0 | RM §2 L316–318; DEC-61, DEC-113 |
| D5 | A court order to remove or redact a published case | "The court ordered us to take it down." | occasional | policy | DEC-116.7; https://wiki.free.law/c/terms/courtlistener/courtlistenercom-content-removal-policy |
| E1 | Exhibits at the venue's evidence standard; chain of custody | (filing exhibits) | occasional | capture axis (Grade A) | DEC-81; jurisdictions R39; filings R25 |
| E2 | A member's account of a hearing they attended | "I was in Dept. 24 when the judge set the date." | regular | L0 | DEC-39; D109; Court Watch NOLA (130 volunteers, 1,110 visits, 7,000 matters in 2016) |
| F | Questions about a proceeding | "What's happening in the sewer-fee suit, and what did the last order require?" | regular | L2 (with QUESTIONS L1) | X145 |

### 7.3 The ladder

| rung | a member can | example | state on 2026-10-05 | stage |
|---|---|---|---|---|
| L0 Documents | Capture any court document, cite a passage, record the group's own filing or a decision as correspondence | "Correspondence: court_decision received, dated, cited." | **Usable today:** capture, cite, `actioncorrespond`, `actionrisktier`. Watching a page is **built, not reachable**: the add flow writes `monitoring: enabled: false` (`app.html:3313`), monitoring R1 refuses `NOT_MONITORED`, only the daemon may propose a watch (R-2 C-E1) | foundation |
| L1 Court-aware reading and citation | Documents read by type (register, order, oversight report); numbers and reporter citations recognised; citations verified or "not verified"; a decision held as a standard | "Cited: 123 Cal.App.4th 456: not verified (no held capture states it)." | **Partly built, not reachable.** `court` standards with text, period and one `supersedes` (standards R1, R6), UI 0; pin-cited extents; venue facts and court holidays (jurisdictions R39, R43); counsel packet (filings R8–R12). No court doctype; no recognition; no verification | stage 2, C1 |
| L2 A proceeding followed | A registered proceeding (forum, number, kind, parties by role, related proceedings); its register's rows with new ones flagged; stages as a declared flow; dates with their basis; the group's action linked | "Alameda Sup. Ct. RG24-…, sewer-fee suit, city as respondent: 2 new register rows since Tuesday." | **Not built.** "No op in the 446 names a court case … as an object" (M5) | stage 2, C1 |
| L3 Duties from proceedings tracked | Order and decree paragraphs, grand jury and audit recommendations held as duties; mandated replies on a clock; reported status quoted beside the group's own determination | "Council reply to the grand jury due 90 days after the report; reported: 'will be implemented' (quoted)." | **Not built** | stage 2, C2 |
| L4 Interpretation and precedent | Decisions linked to the provisions they interpret, with later treatment as of a date; the assistant proposes precedent and related proceedings, labelled | "Carachure, linked to the Prop 218 provision it read; later treatment: none held." | **Not built** (one `supersedes` only) | links as data: stages 2–3; assistance: planned (later stage; §7.5) |
| L5 Procedural reasoning and patterns | Help with the backward question (filing window, standing, exhaustion; D-165); patterns across proceedings; alerts from outside register services | "Response compliance: n of N required replies on time since a stated date." | **Not built** | planned (later stage; §7.5) |

### 7.4 Rungs in the first stages

Bob's decisions these rungs rest on: B1 (c) (COURTS to L5), B5 (the kind `proceeding`; party and proceeding line families), B8 (parties as offices or the class "a private party"), B12 (ii) (rulings quote-only), B15 (outside and paid sources), B18 (court-ordered removal), B20 (the proceeding page; "proceeding" and "register").

**L1 and L2: follow a proceeding (synthesis stage 2, "C1"; a joint stage sequenced after `lines` and the LAW move).**
- *Design:* `entities` gains the kind `proceeding` with a facet: `forum` (an entity: court, commission, grand jury, auditor), `forum_kind`, `number` (an alias recognised by a profile id space `proceeding`, so a capture carrying it resolves at grade A), `kind`. Label: forum, number and a neutral description; the caption stays a citable extent, never an alias. Party lines `party_to {role}` (roles from ECF and the CPUC service list: petitioner, respondent, intervenor, amicus, monitor, information only) and proceeding lines `appeal_of`, `consolidated_with`, `remanded_to`, `arises_from` are `lines` families; a private party appears only as "a private party". `jurisdictions` gains `spaces.proceeding`, `proceeding_kinds`, reporters-db and courts-db as profile data (1,167 reporters and 2,102 variants per the README, https://github.com/freelawproject/reporters-db), `proceeding_flows`, and the anchors `entered`, `served`, `hearing`. A `docprofile` split carries three doctypes: `court_register` (rows of date, text and filer as written, with the document link), `court_order` (caption, number, date entered, numbered paragraphs, citations) and `oversight_report` (numbered findings, recommendations, required responses). The row diff is new work in the register doctype's assess.
- *Following a register:* it needs `monitoring` to change: a public register that needs rendering or session cookies is re-rendered on the tick; one behind a member's account is refreshed only by that member's act; otherwise only static registers are followed, and the page says so (B15 (b); BOB's review). Status as of a date uses TIME's as-of read. `actions` gains a `proceeding` link.
- *Citations:* the recogniser extends `id-spaces`; its resolver lives in `standards`, and "verified" means it matches a held capture that states the citation (most reporter citations will read "not verified", because a slip opinion does not carry its later reporter citation; this is measured).
- *The AI's part:* machine-attributed registration of a proceeding from a captured register or caption, its number, resolutions, threading (B7).
- *The member decides:* flows, dates and duties to adopt; fees by their own act.
- *Size:* about 35 requirements.
- *Measure first:* capture three registers whole (Alameda eCourt, a CourtListener federal register page, a CPUC proceeding card) and see whether they can be followed; their number forms; how many proceedings the group would follow.

**L3: duties from proceedings (stage 2, "C2", after `duties`).**
- *Design:* Orders, decree paragraphs and recommendations become `duties` with `arising_in` (the proceeding) and `reported_status` `{reported_by, status as written, as_of, extent}`, quoted and never graded. The Penal Code 933.05 answers (implemented; will be, with timeframe; needs analysis, at most six months; will not be, with reasons; within 60 days for elected officers or 90 for governing bodies) and monitor levels are profile vocabulary. A breach of an order feeds `conformance` and `escalation` as any duty does. A6 waits on amounts as values (ANALYSIS).
- *Size:* about 15–20 requirements.

**L4's links held as data (stages 2–3).**
- *Design:* `interprets`, `applies` and `holds_invalid` from an extent of a `court` standard to a portion of a statute or ordinance; treatment rows (`reversed`, `vacated`, `depublished`, `overruled`, `affirmed`), each citing the later decision's extent; "still standing on D" derived, undetermined where unread (D134). A member records them; the machine's proposals of them are §7.5.

### 7.5 Later rungs, planned

**L4 assistance: precedent and labelled help (synthesis stage 3, "C3").**
- *Design* (COURTS §5–§6): pack layers `court_reading` (run mode `extract`) and `legal_lookup` (run mode `investigate`), member-launched only (D13). The machine proposes, labelled and stored apart: parties, flows, dates, duties from an order's paragraphs, `interprets` links and treatment, related proceedings and precedent (as capture requests, D45). It never states what a ruling holds as its own sentence, enters an unadopted deadline, spends a fee unattended, or registers a private party. Any citation in machine output that does not resolve to a held opinion is labelled "not verified" (refusing nothing, D88). An optional outside lookup: CourtListener's Citation Lookup, which needs its own path; it is not existing plumbing (R-2 C-E6).
- *What must exist first:* COURTS C1–C2; LAW stage 2 (portions); `extract` and `investigate` deployed (VF-4's chain). Measure first: acceptance of proposed links on a gold set; the share of citations reading "not verified". Size: about 6 requirements for the relations plus two skill layers (COURTS §6).
- *Realism and performance:* reporters-db and courts-db are free profile data; U.S. case law is open since the Caselaw Access Project's commercial restrictions ended (https://www.lawnext.com/2024/03/event-tomorrow-marks-the-end-of-commercial-restrictions-on-the-caselaw-access-project-that-digitized-all-u-s-case-law.html). Most reporter citations will read "not verified", because a slip opinion does not carry its later reporter citation. CourtListener's API defaults are 5 requests a minute, 50 an hour, 125 a day (https://wiki.free.law/c/courtlistener/help/api/rest/v4/overview), enough for a member's lookups, not for instance-wide polling; Citation Lookup takes 64,000 characters and 250 citations per request, 60 a minute, token required (https://wiki.free.law/c/courtlistener/help/api/rest/v4/citation-lookup). Off the everyday path: runs start only at a member's act and continue on the alarm-driven wake; the outside lookup is a per-group switch with the group's own token.
- *Decisions for Bob:* (doctrine) B12 (ii): rulings stay quote-only until acceptance is measured (D40), then possibly a labelled reading as for statutes; (policy) B15 (c): a CourtListener token, built in, off by default, switched on with the group's own key (BOB's recommendation since B1 (c)); never a required vendor key (D201).
- *Risks:* hallucinated or misread law (contained by quote-only, the citation check in code, labels); reading as legal advice (applying law to someone's own facts is advice, https://judicature.duke.edu/articles/legal-information-vs-legal-advice-a-25-year-retrospective/; contained by "Not legal advice" in the packet, filings R10, and legal tools shown as facts, D279).

**L5: procedural reasoning and patterns.**
- *Design, on the information side of the line:* for a procedural question (a filing or claim window, standing, exhaustion of remedies, and the other conditions of the backward question, D-165: what else would have to be true), the machine lays out each condition with its source (a held standard at its version, or a sourced profile rule), and which facts in the record bear on each, each marked met, unmet or undetermined as a computed fact. For example, a window is computed by `civil-time` from dated facts and its rule ("the six-month claim window of Gov. Code 911.2, counted from the accrual date the record holds, ends on …"; the accrual date itself is a dated fact a member adopts); a condition with no held source reads "not held". It never says "you have standing", "you should file", what to file, or a likely outcome, and it routes the member to counsel and to members with declared expertise (MA §1.3), with "legal information, not legal advice". The result is a work list for members, never a determination (D-165's form: findings that would also need to hold). Patterns across proceedings (settlement totals, response-compliance rates such as the Placer court's response report, https://www.placer.courts.ca.gov/sites/default/files/Response%20Report%20for%202022-2023.pdf) are calculations with denominators. Alerts from outside register services enter as captures. No module was designed; the parts are `standards`, `civil-time`, `duties`, `calculations`, `answers` and the QUESTIONS L4 run.
- *What must exist first:* COURTS L3; TIME's `known` and `act` anchors (claim windows) and a sourced rule set (B10); LAW L3 (portions and definitions); ANALYSIS L2 (amounts and denominators) and L4 (patterns); QUESTIONS L4 (the hand-off to a bounded run). Size: not studied.
- *Realism and performance:* the conditions that are dates are computable once anchors and sourced rules exist; conditions that turn on legal judgment (standing, exhaustion) can be laid out but stay undetermined unless a held source and dated facts settle them, which will be common. Outside alerts are limited: CourtListener's cover federal PACER matters only, 5 free (https://wiki.free.law/c/courtlistener/help/alerts/docket-alerts-for-pacer); state registers such as Alameda's need cookies and are followed only by re-rendering or a member's act; PACER charges $0.10 a page, capped at $3 a document, waived under $30 a quarter (https://pacer.uscourts.gov/help/faqs/how-much-does-it-cost-access-documents-using-pacer). Off the everyday path: the layout is built at a member's act as a run; patterns are stored calculations, computed at acceptance and publication; alerts arrive through `monitoring`'s tick.
- *Decisions for Bob:* (doctrine, the unauthorised-practice line) the layout sits near the line B12 draws: B12 (ii) allows labelled readings of held text, B12 (iii) shows procedural facts from the profile as facts and never as recommendations (D279), and D255 bars machine-invented legal text filed. Bob decides (B12 (iv), recommended by BOB on these terms) whether a condition-by-condition layout of a procedural question may be offered on that basis, or only within an attorney-supervised mode (deferred until a group with a licensed lawyer member asks). (Doctrine) the backward question itself, which Bob deferred as "a capability added later to a structure that already exists" (D-165). (Policy) outside alert services and their fees: B15 applies, and an unattended paid account is rejected (B15 (d); D13).
- *Risks:* the layout read as legal advice (practice shows the risk: Upsolve v. James, https://www.probonoinst.org/2025/10/07/setback-for-justice-advocates-in-upsolve-litigation/; the FTC's DoNotPay order, https://www.ftc.gov/node/87474); contained by conditions and computed facts only, sources quoted, "undetermined" where judgment is needed, no recommendation, and routing to counsel. Patterns read as blame of an office; contained by denominators, reporting whichever way they cut (D331), and no ranking. Fees; contained by the member's act with the price shown first.

**Planned policy points.** A court order to remove or redact a published case: since B1 (c), BOB recommends designing and building the path now (B18 (b)), because an order arrives with a deadline and legal stakes; the principle: an order addressed to the group is complied with, never silently; the order is captured, a signed docket entry names it, and the edition is stamped (B18). Sealed and later-unsealed material is open (synthesis §9): restricted records stay deferred (D140, D-124), DEC-100 (2) declines confidential filings on the group's own docket, and the policy is to be folded into B18's principle when its trigger comes. The `proceedings` module (Option B) is planned with its trigger (§2). Fee-bearing records (PACER; Alameda $1 a page, $50 cap) only by a member's act with the price shown first.

### 7.6 Interfaces

| construct | COURTS needs from it | COURTS supplies to it |
|---|---|---|
| TIME | absolute dates with a basis extent; a document's own date; court calendars per venue (jurisdictions R43); `entered`, `served`, `hearing` anchors; response clocks (60/90 days) | court-set dates and hearings, register dates, stage timelines for chronologies |
| ORGANISATIONS | `lines` (party and proceeding families); `duties` with `arising_in` and `reported_status`; forums as bodies | proceedings as sources of duties and lines; reported-status rows |
| LAW | `standards` in layer 5; portions for `interprets`; treatment beyond one `supersedes` | `court` standards; decree paragraphs as standards; AG opinions as persuasive readings; `interprets` links; the citation resolver |
| ANALYSIS | amounts as values for settlements and judgments; viewer-gated counts (X114) | settlement and judgment figures with their basis; response and compliance data for patterns |
| QUESTIONS | the cited read with its level; `extract` and `investigate` modes | the proceeding as a subject to ask about; the citation check, reusable for any legal citation in an answer |

## 8. ANALYSIS

### 8.1 Purpose

Analysis turns cited figures and datasets into numbers a finding can rest on: counts, totals, shares with their denominators, threshold tests, budget against actuals, fund flows across fiscal years. Bob asked that analysis happen both in code and in spreadsheets. The study's answer is one record construct, the calculation (`CALC-`), with two engines: recipes in a small closed grammar that the plane evaluates, and the member's own workbooks, bound to their sources, recomputed and linted, and carried whole. Every number a case relies on must recompute without Civicsmith (DEC-112). The machine proposes; only the evaluator computes; only a member adopts.

### 8.2 Needs register

(ANALYSIS §1.)

| id | need | in a member's words | centrality | rung | evidence |
|---|---|---|---|---|---|
| A1 | Test a percentage or target claim against the city's own per-record data | "The city says it filled 90% of reported potholes this year. Is that true?" | core | L2 | journeys J6 L154–165; §3 L60–61; wizard "Check a claim" L472–477 |
| A2 | Pin down the claim's terms and period first | "What counts as 'filled', and over which year?" | core | L0 | J6 step 2; D273 |
| A3 | A member spot-check sample beside the records, with denominators | "Of 40 closed reports we visited, 11 were not repaired." | core | L2 (counts), L4 (estimate) | J6 steps 5–6; CSD §4.4; https://ww2.amstat.org/meetings/proceedings/2019/data/assets/pdf/1199463.pdf |
| A4 | Threshold tests against a legal or promised bar | "Certified at 61.8% when two-thirds was required." | core | L1 (part), L2 | matter page L18; CM 763; CF §13.1 |
| A5 | Compare an open dataset with what was promised | "Does the service-request data show the promised response times?" | regular | L2 | journeys §3 L75 |
| B1 | Budget against actuals | "Overtime keeps running past the budget: by how much, each year?" | core | L3 (one year), L4 (across years) | journeys §3 L63; FA L2 Fn2 L271–276 |
| B2 | Fund flows and shares across fiscal years | "$52.6 million diverted over nine fiscal years, about 10% of sewer charge revenue." | core | L4 | RM §1 L219–223, L234–239; SR §1.1 INFO-2026-0002 |
| B3 | Reconcile two sources of one figure | "The ACFR's transfer does not match OpenGov." | regular | L4 | FA L2 Fn2; SR §3.1, §4.6 |
| B4 | Contract checks over amounts | "Payments continued past the contract's term." | regular | L2 | CF §8.2 src 909–921; progressions R32 (T32 A37) |
| B5 | A size for a breach's effect | "$100,000,000 of bond debt authorised, computed from the resolution and schedule." | regular | L1 (built) | matter page L27–33; DEC-84.10; consequences R2 |
| B6 | Fee quotes side by side | "Which office quoted less for the copies?" | occasional | L0 | CM §2 D-148; actions R27 |
| C1 | Filter, count, total and group a dataset's rows | "Closed ÷ reported, by month, 2025." | core | L2 | u41 G5.2; journeys §3 L75 |
| C2 | A figure that changed between versions or captures | "$4.2M became $2.8M between drafts." | regular | L4 | DEC-11 src 589–593; TAD §7.4 |
| C3 | Counts over the group's own record | "41 of 58 contracts at Grade B." | regular | L2 | IS §14c; CF §12; intent R4 |
| C4 | Large inputs | "The budget book is 39.6 MB." | occasional, blocking | L3 (workbook route) | MS M6 L323; OF L11; D-593 |
| D1 | The government's own workbook, where the formula is the finding | "Which cells feed the 'budgeted' figure; what is on the hidden sheet?" | regular | L0 | OF L117–128 |
| D2 | A member's own spreadsheet analysis | "Our accountant built the model; check it in." | regular | L3 | the brief; journeys J8; MA §1.3 |
| D3 | Figures read off PDFs | "The ACFR table on page 112." | regular | L2 (typed transcriptions) | EBD §3.3 M-55 (NO-GO); table F1 0.28–0.47 (https://arxiv.org/pdf/2303.09957) |
| E1 | Every number a case relies on recomputes without Civicsmith | "Anybody can recreate the case for themselves." | core | L2 | DEC-112; Pub §5C L399–408; X119 |
| E2 | Charts that tell the story, survive print and are accessible | "A chart of the transfers by year." | regular | L4 | DEC-99; DEC-122; PR §8 L135 |
| E3 | A partner group reruns the analysis | "Their rerun matched ours." | occasional | L4 | DR §5; audiences L1163 |
| F1 | Objective progress over amounts and funds | "How much of the fund's spending have we checked?" | regular | L4 | CF §12 src 1199–1216; intent R4 |
| F2 | Pattern statements with a registry denominator | "9 of 14 minutes late, reported whichever way it cuts." | occasional | L4 | CF §13.1; D331 |
| F3 | Lateness across a body's acts (with TIME) | "Average days late per meeting, 2025." | regular | L4 | X129 |

Practice and failure modes the design answers: keep the raw file untouched and document the method (https://www.ire.org/?p=44398; GAGAS audit documentation, https://gaoinnovations.gov/yellowbook/2024/audit-documentation-1.html; GAO-20-283G data reliability); the Reinhart–Rogoff short range (https://retractionwatch.com/2013/04/18/influential-reinhart-rogoff-economics-paper-suffers-database-error/); errors in about 94% of field-audited spreadsheets and 1–5% of formula cells (https://arxiv.org/pdf/0801.3114.pdf); silent type conversion (https://genomebiology.biomedcentral.com/track/pdf/10.1186/s13059-016-1044-7); engines that disagree in floating point; a sample read as a census.

### 8.3 The ladder

| rung | a member can | example | state on 2026-10-05 | stage |
|---|---|---|---|---|
| L0 Cite a figure | Point a leg at the passage, cell, range or table holding a number; formulas and hidden sheets visible | "Leg: ACFR p.112, transfer line." | **Usable today**, plus facet counts in search. A cited cell is a pointer whose value cannot be read back: `passageText` of a single cell is null (`content/notice.mjs`, `heldTextAt`) | foundation |
| L1 Arithmetic over cited figures | Sum, difference, count, product, ratio over cited figures, graded by the weakest input and recomputable | "Total of the nine transfers: $52.6M." | **Built, not reachable,** and only after a noncompliant determination: `consequences` R2 in layer 9 (1,105 lines, UI 0, `CONSEQUENCE_NOT_NONCOMPLIANT`); the parser has no `%`; a figure must appear verbatim; `count` counts operands | stage 1 (absorbed by L2) |
| L2 Reproducible calculation over a dataset | Typed tables from captured CSV, workbook ranges or portal exports; recipes (filter, count, total, group, share, span, threshold) cited by a finding, recomputed by a stranger's checker | "Closed within the period: n of N (the share, with its denominator); claimed 90%; computed fact: lower or not." | **Not built.** No module in layers 4–8 holds a number as a value (X166); `OBJECT_TYPES` has no calculation type (`record-grammar/types.mjs:20`) | stage 1, A1 |
| L3 Spreadsheet analysis in the record | Bring one's own workbook; inputs bound to captured sources; formulas recomputed by a pinned engine; defects flagged; method and a second member's check recorded; carried whole | "Workbook: every input bound; recompute agrees; lint: one short range flagged." | **Not built.** Office readers keep formulas beside cached values and never recalculate (office-readers R10) | stage 2, A2 |
| L4 Longitudinal and comparative | Budget against actuals across fiscal years by fund and program keys; reconciliation; dataset revisions; recorded random samples with an interval; patterns and progress over amounts; charts in the published case | "Nine fiscal years of transfers by fund, reconciled to the ACFR; a chart with its data table." | **Not built** | planned (later stage; §8.5) |
| L5 Assisted | Ask in plain words; the assistant proposes a recipe, a table's types or a PDF table's structure, and explains lint; the member adopts | "Proposed recipe: share(closed_within_7d, reported), FY2025." | **Not built** | planned (later stage; §8.5) |

### 8.4 Rungs in the first stages

Bob's decisions these rungs rest on: B3 (`calc-grammar`, `calculations`, `sheet-worker`), B8 (person-level rows), B13 (ii) (the `calculation` leg and its grade), B14 (i)–(v), (vii) (one construct; consequences R2; the checker and the engine; the second member's check; disclosure at publication; `compare` as a computed fact), B20 ("Work it out"). Live cloud spreadsheets are already ruled out (DEC-67) and are not re-asked.

**L2: "Check a claim" (synthesis stage 1, "A1").**
- *Design:* New `calc-grammar` in layer 1 after `civil-time` (pure, about 800–1,200 lines): the figure parser moved from `consequences`, typed values, units and currencies, the closed recipe grammar and its evaluator (`select`, `count`, `sum`, `difference`, `ratio`, `share` always with its denominator, `group`, `span` by `civil-time`, `compare`, `round`, `join` only through an id space or captured crosswalk), method version `bio-calc/1`; no eval, no user code, no rank or score column. New `calculations` at the end of layer 5 (about 2,000–3,000 lines): tables (CSVW / Table Schema, canonical RFC 4180 UTF-8 CSV plus schema, sha256; https://www.w3.org/TR/tabular-metadata/, https://framework.frictionlessdata.io/docs/resources/table.html), held as bytes in the evidence store and streamed; `CALC-` objects (question, terms, period, inputs, kind, results with denominators, recompute status, lint, grade facts, method note, checks); results stored keyed `sha(recipe, inputs, method_version)` and recomputed at acceptance, publication and in the checker, not on every read (R-3 A-Feasibility); the reevaluation cause `calculation_input_changed`; a threshold may cite a held standard at its version.
- *Extensions:* typed cells in office-readers and odf-reader; `record-grammar` gains `calculation`; inquiry gains the `calculation` leg (B13 (ii)); strength, reevaluation, case-grammar, case-checker and `case-import` carry and recreate calculations; consequences R2 accepts outputs as operands (B14 (ii)).
- *Visibility:* a calculation whose input is hidden from a viewer is withheld whole (DEC-36, DEC-85). `compare` gives a labelled computed fact, never "breach" (D275).
- *The AI's part:* none at this stage.
- *Unlocks:* journey 6 end to end, one year of budget against actuals where the city publishes XLSX or CSV, the bond's two-thirds test, the founding case's ACFR figures through typed transcriptions attested by a second member (content R24–R25).
- *Size:* 2 new modules, about 10 extended, about 55 requirements.
- *Measure first:* recipe coverage of every calculation in the journeys; a dataset census against the 8 and 20 MiB bounds; CPU and peak memory to normalise and evaluate 20 MiB (the 128 MB isolate is shared by all concurrent requests, R-3 A-E6); exactness against a decimal reference.

**L3: workbooks (stage 2, "A2").**
- *Design:* New `sheet-worker` (a fleet Worker on the `ocr-worker` precedent, inert until DIST deploys it) wrapping the candidate engine IronCalc as wasm (https://github.com/ironcalc/IronCalc; "work-in-progress", "very early stages", no function count stated; R-3 A-E1).
- *The workbook path:* capture inputs; declare tables; the member works in any spreadsheet program; uploads an analysis workbook (member origin); binds it cell for cell; recompute (agreement between two engines, not accuracy, D110; volatile functions flagged, macros never run, external links refused); lint (a range stopping short of its data, constants inside formulas, inputs in hidden rows, numbers stored as text, error values, totals that do not cross-foot); a method note against the GAGAS test; an optional second member's check, disclosed, never a gate (B14 (iv)); export from recipe to XLSX. A third-party engine's workbook value is a derivation step, undetermined until measured (B13 (ii)). The checker keeps R13 (one self-contained file): it recomputes recipes and bindings; a workbook is disclosed as "recomputed by the instance's engine; open it in any spreadsheet program" (B14 (iii) (b)). If IronCalc fails its measure, workbooks are recorded and disclosed as "not recomputed here". HyperFormula is excluded (GPLv3), and so is any cloud spreadsheet (DEC-67).
- *Planned in stage 2* (B1 (c)); what must exist first: A1 in use and the engine measure below. A calculation the grammar cannot express, or a professional member's workbook, is where it matters first.
- *Measure first:* which functions the corpus's 288 workbooks use; how often IronCalc agrees with their cached values; the wasm's size.

### 8.5 Later rungs, planned

**L4: longitudinal and comparative (synthesis stage 3, "A3").**
- *Design* (ANALYSIS §5–§6): budget and financial-report readers in `docprofile` and `extraction` (EBD rows 5–6: no reader is written), with the Fiscal Data Package's classifications and plan/actual phase (https://specs.frictionlessdata.io/fiscal-data-package/); fund and program joins through id spaces and captured crosswalks (ORGANISATIONS' identifiers); portal snapshots keyed to their query with keyed field-level diffs (TAD §7.4); dataset vintages as `validAt` values; recorded random draws over a frozen set, seeded, with an exact interval (B14 (vi)); Vega-Lite specs as the authoritative chart description, regenerated and verified, with a data table as text alternative and a print form (SR §2.3; publication R30); amount filters for intent R4 and progressions R32 (clearing T32 A37); measurable pattern statements; PROV-O for a calculation's inputs and outputs in the case file (https://www.w3.org/TR/prov-o/); the PDF table engine re-measured against M-55 with tools of the TATR class. A partner group's rerun (E3) uses the recreate path. No new module expected.
- *What must exist first:* A1 and A2 in use; TIME's fiscal periods (`fiscal_year`, T2); ORGANISATIONS' fund and program identifiers (O1); B14 (vi) ruled before any draw. Measure first: budget-reader feasibility against M-55; the PDF table engine re-measured. Size: not studied separately (stage 3 as a whole: about 80–100 requirements across constructs).
- *Realism and performance:* open-data portals compute filtered and grouped aggregates server-side, free: Socrata `$group` (https://dev.socrata.com/docs/queries/group), CKAN `datastore_search` (https://docs.ckan.org/en/ckan-2.1.5/datastore.html), ArcGIS `outStatistics` with paging (`resultOffset`, `exceededTransferLimit`); a portal's own aggregate may be captured and cited ("let the source compute"). Budget platforms export CSV. ACFRs will stay PDFs for years: FDTA Phase 2 is due 1 October 2028, two years from Phase 1's effective date, and the MSRB has no deadline (https://www.gfoa.org/fdta; R-3 A-E5). PDF table recognition was measured NO-GO (M-55), and a benchmark puts table F1 at 0.28–0.47 (https://arxiv.org/pdf/2303.09957), so figures from PDFs enter as typed transcriptions attested by a second member (content R24–R25) until a re-measure says GO. The starting bound is one input of 20 MiB or about a million cells, inside one 128 MB isolate shared by all concurrent requests. Off the everyday path: results are stored, keyed `sha(recipe, inputs, method_version)`, and recomputed only at acceptance, at publication and in the checker, never on a read; multi-year or oversized work goes to the workbook route and `sheet-worker`; portal snapshots are captured on the scheduler; charts are regenerated at publication.
- *Decisions for Bob:* (doctrine) B14 (vi): a population estimate only from a plane-drawn random sample; the draw decides which records members visit, which touches DEC-22 ("the machine does not choose what to look into"); the study recommends allowing it as a mechanical draw, not a choice. (UX) B20: charts from an authoritative spec with a data table. (People outside the project) B8 on person-level rows (overtime by officer, Stop-Data): outputs grouped only by office, department or class; rows travel only redacted or aggregated, with the redaction disclosed.
- *Risks:* false precision (contained by denominators, sample labels, the plane's bound sentences, negative-control tests); drift into a BI or dashboard product (DEC-48; every addition justified by a journey; no performance scores); runtime limits on large multi-year tables (bytes in R2, streaming, stated bounds, the workbook route).

**L5: assisted analysis (stage 3, "A4").**
- *Design:* propose ops only, inside an investigate or plan mode or the assistant: `tabledeclarepropose`, `calculationpropose` (a recipe from the member's question), `workbookcheck` (lint explained), and EXTRACT `table(engine)` proposals once measured. The model never produces a number that enters the record; a number it states in conversation is labelled `derived` and not stored (run-productions R5); it is kept only by becoming a recipe. It never states significance, a rank, or a population claim without a recorded draw.
- *What must exist first:* ANALYSIS L2 (the grammar a proposal is written in); QUESTIONS L2 (a propose-capable mode deployed) with acceptance measured (the DEC-77.3 instrument). Size: not studied.
- *Realism and performance:* a proposal is one model turn on the group's account, within its use ceiling (B16); the evaluator, not the model, computes, so the arithmetic costs no more than a member's own recipe. Off the everyday path: proposals are made only at a member's act, in a mode the group has switched on.
- *Decisions for Bob:* (doctrine) B17 (ii): suggestions only from material the member brought or chose; B12 (i): no figure from the model's knowledge.
- *Risks:* AI arithmetic entering the record (contained: only the evaluator computes; `ANSWER_FIGURE_UNSOURCED` in `answers`).

### 8.6 Interfaces

| construct | ANALYSIS needs from it | ANALYSIS supplies to it |
|---|---|---|
| TIME | `span`, business days, office holidays, zone, fiscal-year boundaries from `civil-time` and the profile; never a seventh engine | durations, lateness counts, period aggregates |
| ORGANISATIONS | office, department, fund and program keys and captured crosswalks; grouping by role, never by person | per-body aggregates, reconciliations, counts of obligations met and unmet |
| LAW | thresholds and defined terms citable during investigation (a held standard at its version) | the measured Condition for conformance; the Effect for the audit-style finding; three-valued threshold tests |
| COURTS | settlement and decree-monitor figures as inputs | computed figures for the counsel packet and compliance under a decree |
| QUESTIONS | a run mode with propose ops; a tool that reads tables and calculations | computable, cited answers to "how many, how much, what share", with level and bound; a non-persisting recipe evaluation as a rule service |

## 9. QUESTIONS (the assistant)

### 9.1 Purpose

Members must be able to ask in plain words, as Bob expected and as DEC-27 rules (a tag on every surface, free text and voice; FIND, CREATE and ACT; the assistant "gets its understanding of the rules from the server"). The construct is what members ask, what the assistant may do, and how an answer cites, states absence by level, states its bound and stays labelled. Practice shows the harm is greatest exactly where Bob wants the assistant to go: retrieval-backed legal tools were wrong 17–34% of the time (https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries); general models were wrong 58–88% on verifiable case-law questions (https://arxiv.org/abs/2401.01301v1); New York City's chatbot advised illegal practice and is being shut down (https://themarkup.org/artificial-intelligence/2026/01/30/mamdani-to-kill-the-nyc-ai-chatbot-we-caught-telling-businesses-to-break-the-law); 45% of assistant answers about news had a significant problem (https://www.infodocket.com/2025/10/22/bbc-largest-study-of-its-kind-shows-ai-assistants-misrepresent-news-content-45-of-the-time-regardless-of-language-or-territory/). So every rule the assistant applies comes from the plane, and the model only understands the member's words, writes queries, quotes and translates (B12 (i)).

### 9.2 Needs register

(QUESTIONS §1.)

| id | need | in a member's words | centrality | rung | evidence |
|---|---|---|---|---|---|
| A.1 | What changed in our material | "Show me new content uncovered over the weekend on the Sewer Fund project." | core | L1 | DEC-27's own FIND example (C11 src 1810) |
| A.2 | Which documents say X, and which nobody has read | "Which of our documents mention the franchise fee, and which haven't been read yet?" | core | L1 | CF §14.3; CSD §4.4 |
| A.3 | Where a question stands | "How strong is this question against our bar, and what's the weakest link?" | core | L1 | DEC-82; journey 3 (D1 L181) |
| A.4 | Have we looked, and where | "Did anyone look for the 2023 sewer audit? Where?" | regular | L1 | OLD §6; UC-008 |
| B.1 | Explain a screen, a word or a refusal | "Why won't it let me publish?" | core | L1 | DEC-27; DEC-49; ASSISTANT-PILOT §1 |
| B.2 | Walk me through it | "Help me open a project to explore this tip." | core | L1 (scripted), L2 (planned on the fly) | DEC-27 CREATE; DEC-120, DEC-121; journey 9 |
| C | Turn a problem into questions | "The potholes on my street never get fixed: what can we ask?" | core | L2 | journeys §3 "A problem they live with"; "one question per requirement in a code section" |
| D.1 | What a charge or rule rests on | "What's this sewer maintenance charge on my water bill?" | core | L3 (L4 when the ordinance is not held) | journeys §6 L529; X154 |
| D.2 | What a provision requires, and when it was in force | "Was it in force when the contract was signed?" | regular | L3 | journey 4 step 3; standards R7 |
| D.3 | What a term means | "What's a 'controlled audit' versus the audit that's required?" | regular | L3 | DEC-27; D273 |
| E.1 | When something is due, from whom | "When is the Clerk's reply to our records request due?" | core | L3 | X35; DEC-98 |
| E.2 | What is late | "Which council minutes are overdue?" | regular | L1 | progressions overdue findings; `minutes_due_days` |
| E.3 | What's coming | "When does this come back to council?" | occasional | L3 | journeys §6 "Meetings and time" |
| F | Offices | "Who is responsible for street repair, and who held that office in 2023?" | regular | L3 | journeys §6; actions R9 |
| G | Courts and proceedings | "What's been filed in the city's lawsuit since we last looked?" | occasional | L4 | journeys §3, §6 |
| H | Analysis | "Does the city's 90% pothole claim hold against its own records?" | regular | L3 | journeys §3 overtime row; journey 6; X130 |
| I | What we could do | "If this finding holds, what could we do, and what else would have to be true?" | regular | L2 (drafting), L4 (backward question) | CM 1032–1044; D-165 |
| J | Language and voice | "Read me this in Spanish." | regular | L2 | DEC-127; UC-093 |
| K | Find the right person | "Who in our group knows the Brown Act?" | occasional | L1 | Membership §1.3; X149 |

### 9.3 The ladder

| rung | a member can | example | state on 2026-10-05 | stage |
|---|---|---|---|---|
| L0 Typed search | Type words or the query grammar; read results, the four-level statement and refusals | `franchise fee concerns:ENT-…` | **Usable today** (`search` UI 24; retrieval R13–R16) | foundation |
| L1 Ask the record | Ask in plain words on any screen; an answer that cites record addresses, names the levels searched and which absence is true, states its bound and what is withheld, shows its query; explain a screen, word or refusal; be walked through a wizard | "n documents mention the franchise fee; m of them unread. Levels searched and the bound stated; the query shown." | **Partly built, not reachable.** Substrate only: retrieval envelopes, the pack's four-level layer, intent-to-query in `model.mjs:215–226`. No panel or INTERPRET; `SCREENS` and the wizard library empty (`plane/screens.mjs:4`); only `check` deployed (`run-rules/deployment.mjs:144–145`); a member's run withheld (`MEMBER_PRINCIPAL_RUN`, `ai-runs/index.mjs:1590`); the installer carries no account (`newgroup/src/index.mjs:391–398`); model-turn status in conflict (`agent-worker/src/index.mjs:1457` against l.34); only an API key works although a subscription may serve (`model.mjs:20, 43`; K1429) | stages 0–1, Q0–Q1 |
| L2 Ask it to set things up | Proposed objects from the member's own words; conducted acts with labelled drafts; first questions suggested from material the member brought; drafts of translations and messages; start a run from the panel | "Draft (labelled): a project on the potholes, with one question per requirement of the code section you captured." | **Not built** (CREATE designed in DEC-27; wizards DEC-120/121) | stage 2, Q2 |
| L3 Answers that apply rules | Answers that need a rule use the plane's services (law in force, computed deadlines, offices, arithmetic), each relayed with basis, grade and status, or "not held" at its level | "Due 30 March (CPRA, 10 days, rolled past Sunday; calendar confirmed). Not legal advice." | **Not built.** The worker's reach (agent-worker R37) holds no law, clock, profile or organisation read | stage 3, Q3 |
| L4 Investigative questions | A question the record cannot answer becomes a bounded run across the four levels, with capture requests; the backward question returns a work list | "Not held. Start a run to find the ordinance behind this charge?" | **Partly built, not reachable:** the CHECK run (investigative session, IS plan 43/43), organisation runs only | planned (later stage; §9.5) |
| L5 Standing questions | Author a standing question (a saved question with a cadence and an end date) and be told, once, when something new answers it | "Tell me if the Clerk misses this date." | **Not built.** Planned mechanical-first; an AI run without a member's act conflicts with D13, a decision for Bob | planned (later stage; conflicts with D13, a decision for Bob; §9.5) |

### 9.4 Rungs in the first stages

Bob's decisions these rungs rest on: B3 (`answers`; the `agent-worker` split), B12 (closed book; the legal-information line), B16 (optional at setup with the disclosure, D311; the group's account with project or member accounts taking precedence; a use ceiling; administrators see monthly use per mode), B17 (the widened read reach; suggestions only from the member's material; nothing kept), B20 (the answer panel). That a Claude subscription can serve is settled (DEC-55, K1429).

**Stage 0: make any assistant runnable ("Q0").**
- *Design:* No new module, about 6–10 requirement changes. The account (K1429, DEC-55): the group's or a member's own Claude account, a Claude subscription (Pro, Max, Team or Enterprise) signed in through Anthropic's own flow, with an API key kept as an option; the product never collects or stores a Claude.ai password or session; usage is the account owner's; Pro and Max limits assume ordinary individual use, so shared use fits a Team or Enterprise plan or members' own plans. Anthropic's support article confirms that Agent SDK and third-party app usage "still draw from your subscription's usage limits" (https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan); the conditions are on the legal-and-compliance page (https://code.claude.com/docs/en/legal-and-compliance). The subscription path runs through the Agent SDK, which runs Claude Code as its own process, so the agent runner moves into a container (Cloudflare Containers or Sandbox), to be measured because spawning the CLI there has known issues.
- *Also:* install and update carry the group's account; deploy the agent runner; settle the model-turn conflict and make plan's deployment an explicit act (R53); `cache_control` on the API-key path (none today, `model.mjs:68`); `usage` recorded on every call (read nowhere today); a use ceiling per group and per member, refused in plain words (B16 (iii); D79); CHECK's first live run verified (VF-4).
- *Measure first:* one model turn on a deployed copy through each path (latency, CPU, cost or plan usage); whether the container starts Claude Code reliably; whether a multi-turn ask fits a new Console account's Start-tier rate limits.

**L1: ask the record (stage 1, "Q1").**
- *Design:* New `answers` in layer 6 after `skills` and before `agent-worker` (about 1,500–2,500 lines): the answer contract (a one-line summary bound to support; holdings with verbatim quotes; rules applied with basis and status; per-level look states; bound, truncation, out-of-view, lens; what could not be established; the query shown; next acts; "machine work" label), the asking scope, the interpretation shape (the question as read, at most one clarifying question), the tallies, and the delivery checks `ANSWER_CITES_UNREAD`, `ANSWER_FIGURE_UNSOURCED`, `ANSWER_RULE_NOT_PLANE`, `ANSWER_ABSENCE_WITHOUT_LEVEL`, each a named refusal with its translation; an unsupported sentence is withheld with a note. The checks are strings and ids and cannot judge meaning, so quotes always sit beside the summary. `run-rules` gains mode `ask` (read-only, interactive, deployed apart); `agent-worker` (3,766 lines) is split; membership and credentials mint a short-lived `ai` grant at the member's act, with that member as viewer; `op=ask`; the `skills` `ask` layer; the wizard registry and library filled. Nothing enters the record from an ask: a device-local transcript under a time limit (and a litigation hold), unattributed tallies only (B17 (iii)).
- *Adopted practice:* grounded answering with abstention (https://arxiv.org/pdf/2501.03200; https://arxiv.org/abs/2407.18418v2); citations as data (https://docs.anthropic.com/en/docs/build-with-claude/search-results); the query shown, because text-to-query is still short of expert accuracy (best about 82% against about 93% for people on BIRD); record content treated as data against prompt injection (OWASP LLM01).
- *Size:* about 30–40 requirements.
- *Gate:* at least 150 real questions measured for grounding, correct abstention, correct level statements, mistranslation, false refusals, latency and cost on two models, against a bar BOB sets before measuring (the DEC-77 and K491 precedent).

**L2: set things up (stage 2, "Q2").**
- *Design:* CREATE from the member's words; conducted acts with labelled drafts (K1364); runs started from the panel only by the member's act; translation and message drafts; suggestions derived only from material the member brought or chose, each adopted by the member's act (B17 (ii)).
- *What must exist first:* Q1's bar met in use, and investigate verified live. No new module; about 15 requirements.

**L3: rules applied (stage 3, "Q3").**
- *Design:* Plane rule services as non-mutating ops: law (`standard`, `standardinforce`, `profiles`); time (`deadlinecompute`, new over `civil-time`); organisations (entities, lines, holders, duties, occurrences); figures (a non-persisting recipe evaluation); the record and the system. Where the plane holds no rule, "not held" at its level and the act that would find it. The legal-information line (B12 (ii), (iii)): labelled readings of held text, procedural facts from the profile shown as facts, never a member's rights, an outcome or what to file; an attorney-supervised mode deferred until a group with a licensed lawyer member asks.
- *What must exist first:* TIME, LAW, ORGANISATIONS and ANALYSIS have shipped their first services, and the profile's facts are sourced (today one rule, `UNMEASURED`, and 2026 holidays only). About 10–15 requirements on this side.

Cost (B16, information for Bob): on a subscription the cost is the plan's flat price, bounded by its usage limits; whether a group's use fits is what stage 0 measures. On the API-key option, per answer on the study's unsourced 60–150k input and 2–5k output tokens: Sonnet 5.5 about $0.07–0.18 cached, $0.14–0.35 as built; Opus 5 (the code's default, `model.mjs:22`) $0.18–0.46 cached; five members asking five questions a day would be about $55–135 a month on Sonnet 5.5 once caching is built (R-3; prices from https://platform.claude.com/docs/en/about-claude/pricing, all unmeasured). Runs (CHECK, investigate, plan) spend the same account and are not yet costed.

### 9.5 Later rungs, planned

**L4: investigative questions (synthesis stage 4, "Q4").**
- *Design* (QUESTIONS §2, §6): the question-to-run hand-off: a question the record cannot answer becomes a bounded run across all four levels with capture requests, returning suggested versions, leads and gaps, shown in the running-session surface; the backward question as a work list of findings that would also have to hold (D-165; its procedural form is COURTS L5, §7.5); questions over proceedings once COURTS has objects. It reuses the built investigative session; the asking grant itself still writes nothing, and the run starts only at the member's act.
- *What must exist first:* Q1–Q3; investigate verified live (VF-4); the cost of runs measured (runs and their sub-sessions are separate conversations, `subsession.mjs`); COURTS C1 for proceeding questions. Size: not studied.
- *Realism and performance:* as built, a conversation re-sends its whole transcript every turn (`model.mjs:65–80`) and may run 12 turns of up to 16,000 output tokens (`model.mjs:23, 29`), so a run costs far more than an ask; on an API key a new Console account starts at the Start tier's rate limits, and on a subscription the plan's usage limits bound it. Off the everyday path: a run is background work on the alarm-driven wake, started only at a member's act, within the group's and member's use ceiling (B16), and members keep working while it runs.
- *Decisions for Bob:* (policy) B16 applied to runs: who pays, and the ceiling; (doctrine) the backward question, which Bob deferred as a capability added later (D-165).
- *Risks:* cost to volunteer groups (contained by the ceiling and `usage`); over-reliance (nothing enters the record without a member's act; the tally of answers followed by an act is the steering signal, DEC-77).

**L5: standing questions.**
- *Design:* a member authors a standing question: a saved question with a cadence and an end date (no open-ended standing question), owned by that member and ended by them at any time. A mechanical check runs first: the saved query, which the assistant wrote and showed when the question was first asked, is re-run by the scheduler at the cadence, under the member's view. It is cheap and involves no model. Only when the mechanical check finds something new (a new matching document, an occurrence changing state, a register row) does the AI run, read-only, bounded per ask, within the group's and member's use ceiling, under a short-lived grant scoped as an ask. Its answer, with the same `answers` checks, reaches the queue as one labelled item ("machine work, from your standing question"), told once (DEC-94; D252), and nothing else enters the record. Fan-out to outside sources is not part of it.
- *What must exist first:* Q1 (`answers` and the asking grant), Q3 (rule services), a saved-query form in `query-language` and `retrieval`, a scheduler consumer, the use ceiling and `usage` (stage 0), and a queue item kind for a standing answer. Size: not studied.
- *Realism and performance:* the mechanical re-run is a bounded query on the one scheduler alarm, as `monitoring`'s watches and the overdue scans already are; the AI is called only on a change, so its cost scales with what changes, not with the cadence, and the ceiling caps it. Off the everyday path entirely: it runs on the scheduler, and members see only a queue item. A per-group switch, because it spends the group's account.
- *Decisions for Bob:* (doctrine, B21, recommended by BOB in this form) **it conflicts with D13** (no standing or automatic AI run; DEC-24 rule 2), which AIR §7.3 point 7 keeps as a provisional NO. Bob decides whether an AI run triggered by a member-authored standing question, mechanical-first, read-only, bounded and capped, may run without the member's act at that moment. (Doctrine) what is kept: a standing question is a saved object of the member's, while B17 (iii) recommends that asks leave nothing in the record; where it is stored and who can see it is Bob's. (Policy) outside sources stay excluded unless B15 says otherwise.
- *Risks:* unattended spend (contained by the ceiling, the change condition and the end date); noise (one item per new finding, DEC-10's relevance filter); injection from captured documents (the grant is read-only and writes nothing); surveillance of members (the standing question is visible only as its owner's object, under B17's ruling).

### 9.6 Interfaces

| construct | QUESTIONS needs from it | QUESTIONS supplies to it |
|---|---|---|
| TIME | `deadlinecompute` (rule × start event × office → due date or undetermined, with zone and calendar status); as-of reads; progression findings in scope | plain-language date questions; the wait line ("Waiting on the City Clerk's reply, due 14 October") in answers |
| ORGANISATIONS | entity and alias reads, holders over time, lines, duties and occurrences | INTERPRET's bodies named, as labelled registry candidates; the office-never-person check |
| LAW | standards in scope with captured text, version and in-force reads; sections and definitions once built | the Legal/Policy Lookup (standards R9) as labelled proposals; the "not held → find it" path; the information-only line |
| COURTS | proceeding and register reads | plain questions over filings; a ruling applied as a rule only when held as a `court` standard |
| ANALYSIS | a non-persisting calculation over cited figures and tables | the member's question turned into a proposed recipe, labelled; the assistant never computes a number itself |
| all | (the DEC-8/DEC-27 rule binds every construct's machine help) | the `answers` checks, the one fence any construct's prose can reuse (LAW's readings, ANALYSIS's method text) |

## 10. Doctrine every rung keeps

Each rule binds every rung of every construct, including the planned ones. Where a planned rung conflicts with a rule (QUESTIONS L5 with D13; COURTS L5 with the legal-information line of B12 and D279), the conflict is a decision for Bob, stated in the rung's entry; the rule changes only by his ruling.

| rule | what it requires at every rung | home |
|---|---|---|
| The machine never concludes | The machine looks, finds, proposes and prepares; a member declares, adopts, determines, files and sends. No machine attestation, verdict or determination; no "within powers"; no "breach" from a `compare` | DEC-24; layer-6 and layer-9 contracts; D1, D3; AC §4 rule 1; standards R11; conformance R12–R13 (`PROPOSAL_CANNOT_DETERMINE`); D274, D275 |
| Labelled drafts | Machine words are labelled as the machine's until a member keeps them; proposals are stored apart and become the member's only by the member's act; inhaled policy is proposed, never installed | K1364 (D14); DEC-90, DEC-125; D53; REC-195; DEC-54 |
| Basis and grade; undetermined | Every fact carries its basis and a grade that says how it was established, never truth; derivation steps weaken; no composed or new scale; "undetermined" is first-class, never a default, never zero, counted apart | D55–D57; jurisdictions R27; DEC-21; D58; D92; D95; DEC-82; consequences R4 |
| Four-level absence | A statement of absence names which of the record's four search levels it was found at (what lies beyond them is "outside the record's reach") and uses the five absence terms; the `answers` check `ANSWER_ABSENCE_WITHOUT_LEVEL` enforces it for prose | D59; layer-5 contract; skills R19; DEC-86, DEC-98; CF §8.3 |
| No jurisdiction in product code | Rules, holidays, weekends, ranks, case-number forms, reporters, flows, vocabularies and vendor encodings are profile or site data with citations; tests run against a fictional test profile | D196; `layers.md` rules 1–6; standards R13; D197 (profile facts sourced to primary pages) |
| Relations constitutive and untraversed; lines evidentiary | `entities`' declared relations (`proxy_for`, `member_of`, `overlaps`) are never traversed; `lines` and law relations are claims about the world, cited and graded, and may be walked only bounded, as of a date, weakest hop governing, with no ranking; temporal and referential relations are never one edge type; identity resolution never traverses a relation | entities R26; D178; CF §13; D179, D191; D181; D183; D192; B6; DEC-16; DEC-60 (read as applying to inference, not cited structure) |
| People are tracked; publication names them only in office | The record holds people and their positions, careers, credentials, memberships, statements, interests and overlaps, every fact cited, dated and graded; the machine never concludes about a person, never asserts that two people know each other, and never ranks people by connection; same-name people are never merged without evidence. Actors and addressees of the group's own actions are offices or bodies (actions R9). A published work product names an individual only in official capacity in connection with a documented act | Bob, B8 (K1452); K1453; Design Requirement 6 (D176); actions R9; entities R26 |
| One total order | Every module has one position; a module uses only modules before it; a layer change is Bob's, positions within a layer are BOB's; `MODULE_ORDER` is re-pinned and tested | P4; `build/modules.json`; `layers.md` (ruling 5 as amended by P17); membership R83 |
| A module fits in one reading | Size is a metric reported near about 4,000 lines; a module nearing it is split (a split for size is BOB's) | P6; K617; `layers.md` ruling 1 |
| No standing AI run | AI runs only at a member's act; periodic work is mechanical, on the one scheduler alarm, never a cron and never a second alarm | D13; DEC-24 rule 2; AIR §7.3 point 7; SCHEDULER |
| Closed-book answers | No fact and no rule from the model's knowledge; every rule from the plane (system rules from affordances, the group's rules from its reads, jurisdiction rules from the profile, law's text from `standards`); "not held" at its level, with the act that would find it; quotes beside every summary | DEC-8, DEC-27 as extended by B12 (i); DEC-49; ASSISTANT-PILOT §1 ("a confidently wrong assistant is worse than none", D48); D274 |
| A due threshold raises a question, never a violation | "Overdue" is a question shown as "Noticed" with its derivation; met occurrences are shown with the same care; no deadline is invented; computed dates are derived, never stored; the group's own checkpoint is never a finding about government; a dependency date is a fact about sequence, never a legal deadline | D241; D330; D250; D245; action-clocks R7; D234; K1431 |

Also binding, and often met by the planned rungs: measure before widening (D40); sovereign instances and no required vendor key (D201); a capability serves the path and takes a place in an existing construct, with no drift into BI, case management or dashboards (DEC-48, D224, D231); recreatable without Civicsmith (DEC-112, D202); one fact in one place (D368); one quantity under one name (D320).

## 11. Where the evidence is

All of this is on branch `study/constructs`, commit `892fca16c4` (never deleted, K1433), in the study folder.

| role | files |
|---|---|
| The question and its method | `constructs-brief.md` (the question, with its corrections); `RESUME.md` (Bob's question, 2026-10-05); `READING-PROTOCOL.md` and `READING-PROTOCOL-MODULES.md` (phase 1: read whole, extract, checkpoint); `ANALYSIS-PROTOCOL.md` (phase 2); `REVIEW-PROTOCOL.md` (phase 3); `SYNTHESIS-PROTOCOL.md`; `prompts/` (each unit's prompt); `units.json` (each reader's files); `status.py` and `STATE.md` (unit status); `build-digests.py`; `sync.sh` |
| Phase-1 notes, canon readers | `notes/C1.md` (Roadmap v5, Design Requirements v2, Functional Architecture v3, System Design, Action v0.1, MILESTONES, UI-KICKOFF); `C2` (the design branch's DECISIONS); `C3` (Content Framework v0.10); `C4` (Case Making, Declared Bias, Interaction Constructs, Assistant and AI Roles); `C5` (Investigative Session, Assistant Pilot, Retrieval Substrate, Contradiction Identify, Findings Workplan, Retrieval Probe); `C6` (Publication, Intake Doctrine, Source Access, Authority and Trust, Communications Platforms); `C7` (State Rules Consistency, Membership Architecture); `C8` (Member Knowledge, Extraction Breadth, Document Profiles, Office Formats, Content Search, Scheduler); `C9` (the Action design papers and NOTIFICATIONS); `C10` (Observation Log, Technical Architecture Decisions v10, Distribution, Practice Survey, CONSTRUCTS); `C11` and `C12` (Bob's archived rulings DEC-1 to DEC-67, in two parts); `C13` (build-side Action papers and the Oakland calendar research) |
| Phase-1 notes, design and modules | `notes/D1.md` (design journeys, audiences, use cases, journey experience); `D2.md` (surface rules, principles, brand, measures, the design HANDOFF, the four views); `M1.md` (layer-9 requirements: local-facts, standards, conformance, consequences, actions, action-clocks, filings, escalation, action-plans and others); `M2.md` (layers 1, 4 and 5: jurisdictions, id-spaces, docprofile, office-readers, odf-reader, extraction, content, entities, connections, progressions, bias); `M3.md` (inquiry, strength, run-rules, ai-runs, run-productions, skills, agent-worker, capture-requests and others); `M4.md` (retrieval, query-language, observation-log, intent, reevaluation, monitoring, scheduler, acquisition, sources); `M5.md` (affordances, op-declarations, wizard-scripts, tasks, queue, control-plane, publication, corpus-export). The `.parts`, `-work` and helper scripts beside them are working files |
| Digests and registers | `digest/TIME.md`, `ORGANISATIONS.md`, `LAW.md`, `COURTS.md`, `ANALYSIS.md`, `QUESTIONS.md`, `DOCTRINE.md`, `CROSS.md` (the notes joined by construct); `digest/DOCTRINE-REGISTER.md` (the `D<n>` entries) and `CROSS-REGISTER.md` (the `X<n>` entries) |
| Studies | `studies/TIME.md`, `ORGANISATIONS.md`, `LAW.md`, `COURTS.md`, `ANALYSIS.md`, `QUESTIONS.md` (needs §1, ladder §2, state §3, gaps §4, design §5, stages §6, interfaces §7, decisions §8, sources and URLs §9); their `.work` files; `ANALYSIS.summary.md`; `studies/journeys.txt` |
| Reviews | `reviews/R-1.md` (TIME, ORGANISATIONS), `R-2.md` (LAW, COURTS), `R-3.md` (ANALYSIS, QUESTIONS). A review's correction wins over its study; R-3's finding that only an API key can serve is withdrawn by K1429 |
| Synthesis and Bob's review | `synthesis/constructs.md` (the joined, corrected synthesis: the answer, per construct, the architecture across constructs, the staged path, decisions B1–B20 and, after B1 (c), the amended recommendations and B21–B22 (its §5A), BOB's decisions, corrections, U41, risks, sources); `synthesis/BOB-REVIEW.md` (BOB #111's check and corrections, and Bob's K1429–K1431); `BOB-NOTES.md` (the twelve conflicts the synthesis settles); `U41.md` (the design session's question the synthesis answers in §8); `synthesis/page-for-bob.html` ("The Constructs Study", the page shown to Bob) |
| Rulings after the synthesis | `ladders/rulings-K1429-1431.txt` (the subscription; substrate first; dependency dates). They override anything earlier |
| Superseded | `prior/` (an earlier capabilities page and U41 area notes), superseded by the synthesis |

**Rebuilding the sources.** `src/` holds plain-text copies of every source phase 1 read (canon documents, design pages, requirement files, rulings), folded at 900 characters with HTML markup removed. `sh make-src.sh <bio checkout> <study dir>` rebuilds them exactly: it reads the product at `31f30a6c7d` (`tranche/T32` as phase 1 pinned it), the design branch `claude/gallant-brown-zg0wc1` at `bb387fffb2`, and Bob's archived DEC ledger on the old process's `coord` branch at `5393f63ea5` (split at DEC-34). Code citations in this document were checked at later commits (§Status); no product code, requirement or module order changed between them.
