# Study: INTEGRATION, the nine constructs as one system (second constructs study, phase 2b, BOB #112, 2026-10-05)

Analyst: INTEGRATION. I read these whole, in consecutive chunks: `prompts/A-INTEGRATION.txt`, `ANALYSIS-PROTOCOL.md`, `constructs-brief.md`, `STATE.md`, `RESUME.md`; the three new studies `studies/PEOPLE.md`, `EVENTS.md`, `MONEY.md` with their `.work` notes; `digest/SIX.md` (1,009 lines); `digest/DOCTRINE-REGISTER.md` (1,615) and `digest/CROSS-REGISTER.md` (676); the `## Modules` sections of `notes/M1.md`–`M7.md`; the first study's `../synthesis/constructs.md` (685, with §5A, §5B); its six studies `../studies/TIME.md`, `ORGANISATIONS.md`, `LAW.md`, `COURTS.md`, `ANALYSIS.md`, `QUESTIONS.md`; `src/BIO_Capability_Ladders_v0_1.txt` (974; its §5A–§5C read as hypotheses, never as evidence, K1459); and, on BOB's instruction while I worked, `reviews/R-1.md` (221), whose eight cross-study points I settle in §3 (each marked "R-1"). Primary sources and URLs are in §7.

Citations: a study section as "PEOPLE §5.3"; register entries `D<n>` (doctrine) and `X<n>` (cross-construct); requirement ids; `DEC-`, `K`; code `file:line` at `tranche/T32` @ `55e831ce54` (read-only, unchanged). "First study" is `../`; "synthesis" is `../synthesis/constructs.md`.

**The answer in one paragraph.** The nine constructs are one system if, and only if, every fact about the world has exactly one home, every home reads the same four shared models, and the total order lets each home read what it needs. The three studies are individually sound but disagree on exactly those points: three different layer-5 orders (two of them breaking P4), payer and payee held twice, a career's position held as three line kinds, money's promises held as a duty and an amount, a tenure's start held on a line and on an appointment event, a fixed four-digit id that breaks every high-volume prefix at 10,000 a year, and an exit export that omits every module table. This study settles each one with its reason (§3) and gives one model (§0, §2): **identity** lives once, in `entities`; **validity** is one value, read by `civil-time`, whose bounds may now name an event; **grades** stay on the existing A–D family on two axes (assertion, resolution) with no new scale; **the obligation thread** (`duties`) is where what should happen is set against what did; **events** anchor every occurrence; **money** is stated amounts with phase, stage, basis and kind, never one "amount". The total order of layer 5 becomes `entities`, `events`, `lines`, `local-facts`, `connections`, `standards`, `progressions`, `money`, `duties`, `people`, `bias`, `observation-log`, `query-language`, `retrieval`, `calculations`, checked against `build/modules.json` with no `uses` edge broken. Three worked cases at realistic volumes (the founding case's money trail across ten fiscal years; a councilmember's career meeting a hauling contract's award and payments; a consent decree's duties tracked through events) run through it without a second home for any fact and inside one Durable Object.

## 0. The architecture as one system

### 0.1 What the system is for, and what "load-bearing" means here

Bob asked for an architecture that is "load-bearing and based on best practices with all system requirements given proper consideration" (K1460), across nine constructs that must each reach L5 "without slowing the system's everyday use" (K1432). For this product, load-bearing means four testable properties:

1. **One home per fact.** Every statement about the world is stored once, by one writer, and every other construct reads it there (D198; X7; Intake §8 D-179). This is the relational rule that "every fact is stored exactly once", which is what prevents update anomalies (https://en.wikipedia.org/wiki/Database_normalization). Its failure here is not abstract: an amount held on a duty and on a money fact, or a tenure start held on a line and on an event, will disagree after the first correction, and the record will then claim two things at once (D24).
2. **Shared models, not construct-local ones.** Identity, validity and as-of, grades and provenance, and absence each have one model all nine use (§0.3). A tenth construct, or a higher rung, then needs no migration (ladders §2, "build every rung so the next one extends it").
3. **A total order that carries every read.** Each home is placed so that everything it must read sits earlier (P4); anything a later module must feed into an earlier one goes by registration (K31's pattern; D102). No rung to L5 needs a module to move again.
4. **Bounded at real volumes on the everyday path.** Every read is bounded and says so (D144); heavy work (imports, sweeps, detectors, recomputation) is background work on the one alarm, its results stored (D139; synthesis §5A). Volumes are sourced, and the worked cases (§0.6) show the store at a city-decade.

### 0.2 The objects and their owners (one home per fact)

Every object a construct holds about the world, its one owner (module and construct), and who reads it. "World facts" are claims about what is or happened outside the group; the group's own acts keep their own ledgers (D111; X102, X104).

| object | id | owner (module · construct) | what it holds, and nothing else | read by |
|---|---|---|---|---|
| registry entity (body, office, institution, person, fund, contract, program, place, proceeding, ordinance, parcel, source, movement) | `ENT-` | `entities` · ORGANISATIONS (shared registry, X1) | identity: kind, label, aliases, scheme identifiers, resolutions and their grades, defects; constitutive relations (never traversed, entities R26); `sector` on organisations | all nine |
| event (a happening in the world) | `EVT-` | `events` · EVENTS | kind, status, participants by entity and role (never payer or payee, §3 C-2), `concerns`, `within`, attestations; `when` derived from attestations, with a re-derivable index cache | TIME, ORG, PEOPLE, MONEY, LAW, COURTS, ANALYSIS, QUESTIONS |
| dated fact (a document's own date) | row of `events` | `events` · TIME/EVENTS | `{capture, extent, kind, value EDTF, method, grade}`; never an event | progressions, duties, contradiction, docket, standards |
| event relation | row of `events` | `events` · EVENTS | `authorises`, `answers`, `amends`, `reverses`, `stated_cause`; cited, two-axis graded | duties, money (authority chain), COURTS, QUESTIONS |
| line (dated, evidentiary relation between registry entities) | `LIN-` | `lines` · ORGANISATIONS | structure, posts and careers (`holds` with `capacity`), memberships, education, credentials, interests held, stated ties, agency, contracts, funding, proceeding families | PEOPLE, ORG, COURTS, MONEY, ANALYSIS, QUESTIONS |
| law (a standard, its versions, portions and law relations) | `STD-` | `standards` · LAW | text held at a version, portion, `requires`, `copy`, in-force period (whose bounds may name enactment and effective events), law relations | duties, money (restrictions, thresholds), conformance, calculations |
| declared flow and its instances | progression rows | `progressions` · TIME/ORG | stages, order, cardinality, placements of documents and events | duties (`observed_by`), money (junction checks), queue |
| money fact (a stated amount) | `MNY-` | `money` · MONEY | amount, `as_read`, precision, currency, kind, phase, stage, basis, period, parties `from`/`to` with fund and account, classification, `buys`, `concerns`, one source | duties, people, calculations, consequences, QUESTIONS |
| money series (a member's declared flow across labels and years) | `MSR-` | `money` · MONEY | inclusions and exclusions, each with its author and reason | duties, calculations, publication |
| obligation (duty, prohibition, power) and its occurrences | `DUT-`; occurrences derived | `duties` · ORGANISATIONS (the thread) | obligor, obligee, performance, source in force, trigger, time rule, exceptions, enforcer, `observed_by`, `arising_in`, `reported_status[]`; occurrences derived on read from events, money facts and progressions | conformance, escalation, people, queue, QUESTIONS |
| person fact, identity claim, member tie, source↔person link, interest check | `PFA-`, `IDC-`, `MTI-`, (link row), `CHK-` | `people` · PEOPLE | facts of a person with no second entity; claims that two records are or are not one human (linking, never merging); the group's members' own declared ties; the protected source link; member-declared checks | case-disclosures, QUESTIONS (not member ties, not the source link) |
| table (canonical CSV + schema, bytes in the evidence store) and calculation | table id; `CALC-` | `calculations` · ANALYSIS | typed rows (rosters, payroll, checkbooks, registers stay tables); recipes and workbooks; stored results keyed by `sha(recipe, inputs, method)` | money (row references), people (rosters by registration), inquiry legs, publication |
| finding, inquiry, case | `INQ-`, case | `inquiry`, `publication` · QUESTIONS/ANALYSIS | the group's claims, legs, conclusions, editions | — |
| the group's acts (actions, correspondence, plans, docket entries) | `ACTN-`, `PLN-` … | layer 9 and 8 ledgers | the group's own acts, read into timelines by registration (`registerEventSource`), never copied | events' "ours" lane |
| the government act a determination judges | `EVT-` (`ACT-` kept as an alias) | `events` · EVENTS (owner of the occurrence); `conformance` holds only the determination | — | conformance, escalation, consequences, filings |

What is **not** stored anywhere, because it is derived on read (D199): sequence between events; a missing event ("no reply came"); overdue and met states; overlaps between people; paths between people; flows between funds; totals across facts (a total is a `CALC-` output); "who held the office on D" (`holderAt` over lines).

### 0.3 The shared models

**(a) Identity and resolution: one registry, link-not-merge.** Every party, participant, payee, holder, obligor, issuer and subject is an `entities` id (X1). Identity is a graded judgment, never a fuzzy attribution (D78; Publication §3 rule 15(d)): aliases (grade C for a name), scheme identifiers (`{scheme, id, valid?, basis}`, grade A when source-assigned at both ends; ORGANISATIONS O1, PEOPLE §5.3), and member testimony (D). Two records thought to be one human are **linked by an identity claim** (`same_as` / `not_same_as`, in `people`), never merged, following OpenSanctions' referents and `sources` R6. This is the OpenSanctions practice of tracing "the origin and temporal range of each attribute of any tracked entity" as statements (https://www.opensanctions.org/docs/statements/), not overwriting. Wrong resolutions are reported to `entities` (defect R38) and corrected forward with a re-evaluation notice (X6, X73). The same model serves a vendor across a checkbook, a person across filings, a fund across fiscal years (fund code counts only with its name, id-spaces R1) and a proceeding across captures.

**(b) Validity and as-of: one value, two clocks.** Every world fact that holds for a time carries the first study's one value `{valid: {from, to, precision}, basis}` (synthesis §3.4), read only by `civil-time.validAt` (in, out, undetermined with why). This study widens one thing: **a bound may be an event reference** `{event: EVT-, edge: start | end}` instead of an EDTF value, never both. That is Akoma Ntoso's design, where an interval's start and end "are NOT dates, but references to event elements" (https://docs.oasis-open.org/legaldocml/akn-core/v1.0/os/part2-specs/os-part2-specs_xsd_Element_timeInterval.html), already adopted by TIME (TIME §5). It gives one home to a tenure's start (the appointment event), a law's in-force start (the effective-date event) and a contract's term (its signing event): correct the event's date and every bound that names it follows (§3 C-6). Valid time and record time stay apart (bitemporal): "actual history" may be corrected, but "record history itself *is* append only" (https://martinfowler.com/articles/bitemporal-history.html), which is the record's own append-only rule (D104).

**(c) Grades and provenance: one A–D family, two axes, no new scale.** Every world fact carries (i) its **assertion** axis: a captured source with its passage (the capture grade capped by its derivation: OCR at C, machine reading labelled, typed transcription attested, D34), a system rule from source-native data, or a member's testimony (D), and (ii) its **resolution** axis: how each entity end resolved (entities R9–R12). Lines (R-1 O-E1 of the first study), event attestations, event relations, money facts (reading and party axes) and person facts all use exactly this. When a fact becomes an inquiry leg (K1447's widened target set), the assertion axis is the leg's capture axis and the resolution axis its connection axis; nothing composes them (DEC-21; D53; X61). This settles T3 and T4 (§3). Provenance itself follows W3C PROV's split of entity, activity and agent ("a thing in the world… generated by an activity that used other entities", https://en.wikipedia.org/wiki/W3C_Prov): the capture is the entity, the reading or member act the activity, the stamp the agent (D158).

**(d) The obligation thread.** What a body (or, where a law binds them, a person, K1440 as amended here, §3 C-17) owes, to whom, by when, under which authority, is one object, `duties` (synthesis §3.1). The three new constructs attach to it without a new object: EVENTS supplies what actually happened (an occurrence is met by the events it names, its due date anchored on an event's own date); MONEY supplies the amounts a `pay` duty promises and the payments that discharge it, and the flows a prohibition governs; PEOPLE supplies who held the obligor office on the date, and person duties (a filer's annual statement). Occurrences are derived on read; "overdue" raises a question, never a violation (D241).

**(e) Events as the anchor of occurrences.** Every occurrence in the world (a vote, an adoption, an award, a signing, a payment, a transfer, a filing, an order, a statement, a communication, an appointment) is one `EVT-` with its attestations. A money fact quantifies an event; a duty's occurrence is met by events; a line's bounds may name events; a standard's period may name events; a progression stage places events; the government act a determination judges is an event (§3 C-4). Absence is never an event (EVENTS E3): it is the derived state of a duty occurrence or a progression stage, with its level searched (D31).

**(f) Money as stated facts with stages.** An amount is a reading of one source, at one **phase** (proposed, adopted, adjusted, actual) and actual **stage** (encumbered → incurred → paid; assessed → collected), on one **basis** (budgetary, cash, modified accrual, accrual), of one **kind** (revenue, expenditure, transfer, allocation, payment, contribution, gift, income, settlement, debt, balance, fee charged), for one period, between parties (MONEY §5.3, adopting the Fiscal Data Package's phase/direction split and USAspending's obligation/outlay split). Totals are calculations over facts of one phase, stage, basis, currency and period, refused otherwise by name (MONEY §5.3). Ledgers stay tables; a row becomes a fact only when something must cite it alone (X8).

**(g) Absence and visibility, shared.** Four-level absence (D31) and the five absence terms (DEC-86) apply to every read of every construct ("no position held at level meaning", "no payment of this kind in any ledger read", "not held"). One sight rule: facts asserted from captured public documents are shared evidence corpus, visible like their capture (Membership §7.9; BOB #32); a member's testimony, hypotheses and claims inside a hidden project are fenced by that project, withheld whole, never counted (D54, D163). A prefix whose rows some caller may not see is minted opaque (BOB #16), with a random tail at volume (§3 C-15).

### 0.4 The flows between constructs

The nine as bounded contexts with a shared kernel. Domain-driven design's strategic pattern is to divide a large model into bounded contexts "and be explicit about their interrelationships", where contexts "share concepts" through explicit mappings (https://martinfowler.com/bliki/BoundedContext.html). Here the shared kernel is the registry, the validity value, the grade family and the absence vocabulary; the "published language" is the vocabulary each construct owns and `affordances` re-exports by reference (X114; D90); integration between contexts is by reads down the order and registrations up it.

```
                    jurisdictions · civil-time · calc-grammar        (layer 1: rules as data; pure engines)
                                   │
 capture → reading → content ──────┤                                  (layers 3–4: evidence; content is the citable unit)
                                   ▼
 entities ──► events ──► lines ──► local-facts ──► connections ──► standards ──► progressions ──► money ──► duties ──► people
 (identity)  (occurrence) (structure,  (confirmed     (co-mention)   (law at its     (declared flow;   (stated    (obligation   (person reads;
                          careers)     calendars)                    version)        placements)       amounts)   thread)       identity claims)
      └──────────── bias · observation-log · query-language · retrieval ──────────────────────────────► calculations (tables, CALC-)
                                   ▼
 inquiry (legs on documents, occurrences, calculations, standards; K1447) · answers (closed-book asking, L6)
                                   ▼
 publication · case-disclosures (DR6 filter over persons in claims, timelines and money) · corpus-export (declared module tables)
                                   ▼
 conformance (determination on a government act = EVT-) · consequences · actions (addressed to offices) · escalation    (layer 9)
```

The flows that make the thread: `events` → `duties` (occurrence met, by event), `money` → `duties` (pay discharged; prohibition set against a flow), `lines` → `duties` and `people` (holder on the date), `standards` → `duties` and `money` (authority, restriction, threshold at its version), `progressions` → `money` (procurement instances for junction checks), everything → `calculations` (counts, totals, unit costs with denominators), everything → `answers` (cited reads), `people`/`events`/`money` → `case-disclosures` (persons to filter), `actions`/`publication`/`docket` → `events` by registration (the "ours" lane).

### 0.5 Judged against established practice

| practice (cited) | what the design takes | where |
|---|---|---|
| Bounded contexts with a shared kernel and context map (Evans, DDD; https://martinfowler.com/bliki/BoundedContext.html) | nine constructs, one registry and one vocabulary home; explicit interfaces (§1, §2) | §0.2, §0.4 |
| Normalisation, one fact stored once (https://en.wikipedia.org/wiki/Database_normalization) | the one-home table; derived state never stored (D199) | §0.2, §3 |
| Bitemporal data, actual vs record time (https://martinfowler.com/articles/bitemporal-history.html; SQL:2011 via TIME §5) | one validity value; append-only record time | §0.3 (b) |
| Event-bounded intervals (Akoma Ntoso `timeInterval`, link above) | validity bounds may name events | §0.3 (b), §3 C-6 |
| Event sourcing: rebuild state from the log (https://martinfowler.com/eaaDev/EventSourcing.html) | the record already event-sources its own acts (D104); every derived cache (`when_cache`, occurrences, results) is rebuildable and tested by rebuild | §3 C-12 |
| Statement-based entity data (OpenSanctions statements, link above; FollowTheMoney schemata) | every fact a cited statement with its origin; link not merge | §0.3 (a) |
| Provenance as entity/activity/agent (W3C PROV, link above) | capture, reading, stamp | §0.3 (c) |
| Domain standards: Popolo/W3C ORG (posts), FtM (Occupancy, Event, Payment), OCD Event/VoteEvent, schema.org `eventStatus`, EDTF, Fiscal Data Package, OCDS, GASB 34/54, USAspending (each cited in the three studies' §5.1/§5.2) | field shapes and vocabularies, so imports and exports at L5 are renderings, not conversions | §2 |
| Record linkage (Fellegi–Sunter; Splink, PEOPLE §5.1) | the explanation shape of a same-person proposal (fields agree/disagree), never a score | PEOPLE §5.6 |

### 0.6 Worked cases at realistic volumes

**Case 1: the founding case's money trail across fiscal years (FY2012–FY2026).** *Volumes:* a few hundred money facts (ten ACFR years × a handful of transfer and allocation lines; OpenGov's series; the auditor's "$52.6 million … FY 2012-2021"), about 20 events, 4 duties, 2 standards, 5 posts × 15 fiscal years of holder reads; storage well under 1 MB beside a corpus measured at 176,657 B per bundle (D142).

| step | fact | its one home | read by |
|---|---|---|---|
| fiscal years | "FY2012-13" = 2012-07-01/2013-06-30 | profile `fiscal_year` (data), mapped by `civil-time` | money, calculations |
| the law | Prop 218 Art. XIII D §6(b)(2); OMC 13.04.080 at its version, in force from its effective event | `standards` (+ the enactment event in `events`) | duties, money |
| the restriction | "sewer fee revenue only for the sewer system" as a prohibition on the City | `duties` (`DUT-`, modality prohibition, source the standards above) | money's series read; publication |
| each transfer | "FY22 $2.1M, Sewer Service Fund → General Purpose Fund, actual, paid, basis undetermined, OpenGov row 41" and "FY22 transfers out $2.1M, modified accrual (ACFR p.112, typed transcription attested)" | two `MNY-` facts (two sources), each `concerns` one `EVT-` transfer event | duties, calculations, contradiction (`reconcile`) |
| relabelling | FY22–26 "cost allocation – sewer" counted with the franchise fee, each inclusion with its author's reason | `MSR-` series in `money` | duties, calculations |
| the audit | Auditor's report, issued 2022-02 (EDTF month) | `EVT-` issuance; its recommendations are duties with a commitment date `2023-10` | duties, timeline |
| who held office | Finance Director, Controller, City Administrator, Auditor per FY | `lines` (`holds`, capacity appointed/elected), bounds as EDTF `~2011/2014` or an appointment event | people (`holderAt` per post per FY: 60 bounded reads) |
| the CPRA request | sent 19 March 2026; due 30 March (10 days, rolled) | `actions` ledger (ours), registered into the timeline; the City's response duty's occurrence derived in `duties` | timeline, queue |
| the question | "Was the $2.1m transfer authorised?" | duty occurrence derivation: prohibition set against the series facts, authorising event "not held at level 2 (Legistar searched)" | inquiry leg (K1447), answers |
| totals | "$52.6M over FY2012–21, about 10% of sewer charge revenue" | `CALC-` over the series (phase actual, stage paid, one basis), with its denominator (revenue facts, stage collected) | publication, case-checker (recomputes) |

Nothing here is stored twice: the transfer amount is in `money`, the transfer's occurrence in `events`, the rule in `standards`, the duty in `duties`, the tenure in `lines`, the total in `calculations`. At L5 the next OpenGov snapshot is diffed by key on the scheduler and a new FY row becomes a new fact, told once (MONEY §5.10); no earlier object changes shape.

**Case 2: a person's career meets a contract's award and payments.** *Volumes:* Oakland had 186 meetings and 852 matters in 2025, about 20 items a meeting (EVENTS §9, measured, re-measured by R-1); a checkbook at 100,000–450,000 payments a year in comparable cities (MONEY §5.9: SF 8.18M rows over ~18 years; Chicago 469K since 1996), partitioned by month in the evidence store; 5,119 Oakland payroll records for 2024 (PEOPLE §1).

- The councilmember is one `person` entity, seeded with a scheme identifier from Legistar `PersonId` at grade A (machine-written, K1443's extension, §3 C-21); her seat is a `holds` line (capacity elected) whose start names her swearing-in event.
- Her earlier position "operations manager, Bay Hauling Holdings, ~2014/2018" is a `holds` line read from a résumé passage (grade C for the name end, proposed by EXTRACT at stage 3 or recorded by a member).
- Her statement of economic interests is filed with the City's filing officer, not the FPPC search (R-1 PEOPLE Error 3); Schedule C income "from Bay Hauling Holdings, $10,001–$100,000, 2023" is one `MNY-` fact (kind income, precision range, `to` her entity) and Schedule A-2's investment is an `owns_interest_in` line; the line holds the stake, the fact holds the amount (§3 C-9).
- The award: a vote event within the 12 March meeting event (Legistar `EventItemId`), eight `voted` participants, hers `aye`; an `award` event; the contract's awarded amount, an `encumbered` money fact concerning the award event and the contract entity; two change orders, `adjusted`; 38 payment rows of the 150,000-row FY checkbook become money facts because a junction check cites them alone (X8). The payer and payee are held on those money facts only; the award and payment events carry the signatory and actor (§3 C-2).
- `committedAgainstPaid` (in `money`) shows $3.4M paid against $2.6M committed; the junction check "payments past commitment" writes one stored finding read by the queue (X108).
- A member-declared interest check (`CHK-`, `people`) "a voting participant with a line or income fact naming a party of the item within three years" raises one "Noticed" item with the cited derivation, never the word "conflict" (PEOPLE P-B6). `overlaps` reads her lines and the hauler's officers' lines; a shared employer of 5,000 is "too common to walk".
- Published, the case names her in her official capacity for the documented vote, under the DR6 filter that now screens claims, timeline participants and money parties alike (§3 C-19); the title-only vs title-and-name reading goes to Bob (§6 I-B5).
- *Everyday path:* her person page is one entity read, at most 500 lines by an index on `from`, at most 500 events by participant, and a money read on `(entity, period)`: bounded single-index reads; the checkbook is never scanned on a read.

**Case 3: a court order's duties tracked through events.** The 2003 Negotiated Settlement Agreement in the federal case over the Oakland Police Department, with an independent monitor reporting publicly from 2010 to 2025 (COURTS §1 B1, citing the City's monitor-report page and KQED on the exit after 23 years).
- The proceeding is an `entities` `proceeding` with forum (the federal court) and number (an alias, grade A from the register); parties by `party_to` lines; the monitor and the judge are `person` entities with roles (K1456).
- The register is a reading, not a store (COURTS §5): each capture's rows are content. A filing or order becomes an `EVT-` (kind `filing` or `order`, `within` nothing, `concerns` the proceeding) machine-written only where the source assigns an entry identifier (a CourtListener/RECAP entry id), otherwise proposed for a member to adopt (§3 C-16).
- Each task of the agreement is a `duties` obligation (`arising_in` the proceeding, source a `court` standard at the paragraph, obligor the Department); each monitor report is an `issuance` event; its per-task finding ("in compliance", "partial", quoted) is a `reported_status` row on the duty, quoted and never graded (synthesis §3.1).
- An occurrence's state is derived from the events that meet it and the reported statuses beside it; the group's own determination stays in `conformance` (layer 9).
- Settlement payments in related suits are money facts (kind settlement) concerning the proceeding (COURTS A6, now served).
- *Volumes:* tens to low hundreds of tasks; roughly quarterly reports over 15 years (about 60 issuance events); reported statuses about tasks × reports, a few thousand rows; register rows are readings already held. All bounded reads; occurrences derived per duty with the 500-row page.

### 0.7 Against every system requirement

| requirement (brief) | how the one-system design meets it, or where it strains and how that is contained |
|---|---|
| Design Requirements (fifteen) | DR2 (one person, a few hours): source-native imports and seeding write what members would otherwise type (Legistar people, seats, events; adopted money-table bindings), everything else proposed; DR4–DR5: every fact cited, every total recomputable, no shared canonical register (D189); DR6: one publication filter for persons wherever they appear (§3 C-19); DR8: counsel packet chronology is the `timeline` read; DR12: no tool gates; DR15: every vocabulary, scheme, fiscal year, threshold and filing officer is profile data |
| Mission principles (Roadmap §§1–12) | show your work (D23); OP1 neutrality (no significance, no characterising words, D4, D53); compliance recorded as carefully as noncompliance (D207: met occurrences, consistent flows shown); "when the evidence changes, the findings change": one re-evaluation spine with cause arms per construct (`event_changed`, `money_fact_superseded`, `identity_claim_changed`, `calculation_input_changed`; X73) |
| Runtime and TAD | one Durable Object SQLite per instance, 10 GB, rows ≤ 2 MB, ≤ 100 bound parameters, ≤ 100 KB statements, 30 s CPU default (5 min configurable), alarms 15 min wall (https://developers.cloudflare.com/durable-objects/platform/limits/); world facts are rows, not bundles (§3 C-13); ledgers and rosters are bytes in R2 streamed by recipes; one alarm, consumers only (D139); no new Worker beyond the first study's `sheet-worker` and `agent-worker` split |
| Everyday path (K1432) | every read paged and indexed (500 default, 5,000 max; `truncated` by reading one past, D144); every walk has a depth, a fan-out **and a total visited bound** of 5,000 (R-1; §3 C-14); queue producers read stored finding tables, never re-derive detectors per read (X108); a measured response budget per new read, held by a failing test (synthesis §5A) |
| Security | store-authoritative stamps (D154, D158); record content is data (D180); imports trust identifiers only from fetched bytes; the asking grant writes nothing |
| Privacy and safety of people | K1452/K1455 hold people fully; protections are sight (project fence for testimony), one publication filter, expunge for what may not be held, a lawful-demand removal class (Gov. Code 7928.215 binds a group after an official's written demand: 48-hour removal, no transfer, four years; R-1; §3 C-20), no automated collection from login-gated platforms, and the root-of-trust exposure stated (D185) |
| Sovereignty, no vendor key (D201) | every adopted source is free and keyless or free-keyed per group, off by default (K1449) |
| Reproducibility (DEC-112) | published cases carry the facts they rest on as cited legs and flat rows (K549); `corpus-export` carries every declared module table with its re-derivation rule, paged (§3 C-11) |
| Publication rules | DR6 filter; materials travel whole (DEC-100 (2)); third parties' words leave only by their own act (D82); a published timeline is frozen at signing |
| Module size and order (P4, P6) | §2.1: every new module under ~3,200 lines; one total order with registrations for the four upward needs; `publication` (4,564–4,619) and `ratification` (3,987) absorb nothing |
| Testability (P7) | every requirement with a negative control; three cross-construct controls: a corrected event date moves every bound that names it; a payment's payee appears once in a timeline; a money total across bases is refused |

What makes it load-bearing, in one line each: one registry (identity never forks); one validity value with event-bounded bounds (dates never disagree); one grade family on two axes (no scale to reconcile later); one obligation thread (what should happen meets what did in one place); events as the anchor (every occurrence one id); money as staged facts (no "amount" ever ambiguous); one table declaration for purge and export (nothing a construct holds is left behind); one order with registrations (no rung forces a move).

## 1. What the three new studies change in each of the six constructs

Each entry: what changes, why, and whether it amends the first study's design (synthesis) or only adds to it.

**TIME (first study: `civil-time`, dated facts, chronology).**
1. *Two objects, not one.* The first study and ladders §2 TIME held "a document's own dates are events too; one store, same object". EVENTS §5.2 and §3 separate them: a **dated fact** (a document's date in its frame, with method and grade) and an **event** (a happening, with participants and attestations). A dated fact may be an attestation of an event; it never is one. Amends synthesis §3.4 and ladders §2 TIME.
2. *Validity bounds may name events* (§0.3 (b); §3 C-6). Adds to `civil-time.validAt`: an event bound is resolved through `events` (the event's derived `when`), and `validAt` returns undetermined with "bound event's date not held" when the event has none. `civil-time` stays pure (layer 1): the caller passes the resolved bound; no layer-1 read of layer 5.
3. *`chronology` becomes `events`.* The module the first study placed for timelines (chronology) is EVENTS' module; the event store, relations and timelines live there, and the dated-fact table moves with it. One module, renamed by ruling (§2.1).
4. *Writer of dated facts specified* (R-1 point 5; §3 C-12).
5. *Absence never stored* now holds for events, money and people alike (EVENTS E3; MONEY §5.4; PEOPLE §5.5).

**ORGANISATIONS (first study: `entities`, `lines`, `duties`, `progressions`).**
1. *Line kinds revised* (§3 C-8): `holds` gains one field `capacity` and absorbs the provisional `employed_by`, `served_in` and `officer_of` (PEOPLE §5.2; R-1 agrees); `seat_on` stays office→body only; `gave_to`/`received_from` leave lines for money facts (§3 C-9); `lobbies_for` becomes `acts_for` with role `lobbyist`; `associate_of` added for stated ties; `educated_at`, `credentialed_by`, `belongs_to`, `owns_interest_in`, `related_to` kept. The kinds' one home is `lines`' spec list, with `affordances` re-exporting by reference (§3 C-10).
2. *Holder reads unchanged in shape*, but `holderAt` never treats an organisation-level line (a person `holds` "employee at the City") as an office holder; only a `holds` to an office counts (PEOPLE §5.2).
3. *Duties may bind a person* where a law binds them (filer duties; K1453 amended K1440), taken as BOB's on its reasons (§3 C-17).
4. *Duties read money and events.* A `pay` duty's amount is a money fact the duty cites (never a second amount on the duty, MONEY §5.6; §3 C-7); a prohibition or restriction is set against money facts or a series; occurrences are met by events. This is why `duties` moves after `money` (§2.1).
5. *Progressions' junction checks move to `money`* (R-1 point 1; §3 C-1): the checks that compare a procurement instance's commitments with payments read money facts, so they live in `money` and read `progressions` down the order; `progressions` keeps its stage placements only.
6. *`entities` identifiers widen* (PEOPLE §5.3; ORGANISATIONS O1): scheme identifiers become first-class `{scheme, id, valid?, basis}`; the id width defect is fixed at stage 0 (§3 C-15).
7. *`sector` on organisations* (K1453) and the new kinds `program`, `place`, `proceeding` (K1441) are unchanged in placement.

**LAW (first study: `standards` at a version; law relations; `requires`).**
1. *In-force periods may name enactment and effective events* (§3 C-6): `standards` reads `events`, so `events` sits before `standards` (it already did in EVENTS' order; MONEY and PEOPLE agreed).
2. *Thresholds and restrictions in money terms* (a bid threshold, a fee cap) stay in the standard's text; the comparison with a money fact is a duty-occurrence or money check, never a value copied into `standards` (MONEY §5.6).
3. *Law relations and event relations stay apart*: `amends` between two versions of law is a law relation (LAW); `amends` between two acts (a resolution amending an award) is an event relation (EVENTS §5.5). Two vocabularies, one word, two homes, each named by its kind set (§3 C-10).

**COURTS (first study: proceeding, register as reading, rulings as duties).**
1. *Filings and orders become events* only through source-native entry identifiers; otherwise proposed (§3 C-16; R-1 EVENTS).
2. *Parties may be persons* (K1456), served by the `person` entity and the DR6 filter (§3 C-19); captions stay aliases.
3. *Settlements and judgments* are money facts of kind `settlement` concerning the proceeding (MONEY §5.3), closing COURTS' open "money a case moves" question.
4. *Monitor and judge* are persons with roles; `reported_status` unchanged.

**ANALYSIS (first study: `calculations`, tables, `CALC-`, legs on calculations).**
1. *Ledgers stay tables*; a row becomes a money fact only when something must cite it alone (X8; MONEY §5.9). Money facts may reference a table row by `{table, row_key}` and the table bytes' sha.
2. *Rosters stay tables* (PEOPLE §5.4): `staffingAt` reads rosters through a registration `registerRosterSource` that `calculations` fills, because `calculations` is last in layer 5 (R-1 point 1; §3 C-1).
3. *Totals are calculations*: `money` refuses a total across phase, stage, basis, currency or period by name (MONEY §5.3); the total itself is a `CALC-` result with its inputs' fact ids.
4. *Independence widened* (strength R12): two legs are not independent when they share a provenance origin, a person source, an event origin or a ledger table, or one source `acts_for` or is `within` the other (§3 C-18).
5. *Legs on events and money facts* through K1447's widened target set, with the two-axis grade (§0.3 (c)).

**QUESTIONS (first study: `inquiry`, `answers`, the asking path).**
1. *New answerable reads*: `timeline`, `eventsOf`, `moneyOf`, `committedAgainstPaid`, `flowsFrom`, `holderAt`, `careerOf`, `overlaps` are registered as answer rule services at stage 3 (§5), each cited, bounded and absence-honest.
2. *Asking scope* still excludes `sources*`, and now also excludes member ties, the source↔person link and identity claims inside hidden projects (PEOPLE §5.8).
3. *Subjects may be persons*; an inquiry subject is any registry entity (K1452), with the DR6 filter applying at publication, never at asking.
4. *Questions raised*: "overdue", "payments past commitment", "no reply held", "interest check noticed" all raise questions, never findings, and carry their cited derivation (D241).

## 2. Architecture across all nine

### 2.1 One total order (P4), checked against `build/modules.json`

**Layer 5, in order:** `entities` → `events` → `lines` → `local-facts` → `connections` → `standards` → `progressions` → `money` → `duties` → `people` → `bias` → `observation-log` → `query-language` → `retrieval` → `calculations`. Layer 1 adds the pure engines `civil-time` and `calc-grammar`; layer 6 adds `answers` after `inquiry`.

What each new or moved module reads, and why it sits where it does (every read is down the order; the four upward needs go by registration):

| module | reads (down) | why here | upward needs, by registration |
|---|---|---|---|
| `entities` (36, built) | record-grammar, jurisdictions, id-spaces, record-core, membership, provenance, extraction | identity first; unchanged | — |
| `events` (new) | entities, content, promotion, provenance, civil-time | needs only identity and evidence; must precede `lines` (bounds name events) and `standards` (in-force bounds name events) | `registerEventSource` for the "ours" lane (actions, publication, docket, correspondence) and the after-read dated-fact step (§3 C-12) |
| `lines` (new) | entities, events, civil-time, promotion, provenance | structure and careers; event-bounded tenure | — |
| `local-facts` (moved from 9) | record-grammar, jurisdictions, record-core, membership (as built) | confirmed calendars and facts before anything computes a date from them | — |
| `connections` (37, built) | as built, incl. entities | unchanged; uses no new module | — |
| `standards` (moved from 9) | as built (content, jurisdictions, promotion), plus events | law at a version; effective events | — |
| `progressions` (38, built) | as built, incl. entities, connections; plus events | stage placements of events and documents | — |
| `money` (new) | entities, lines, events, standards, progressions, civil-time, calc-grammar | amounts with parties and authority; junction checks over procurement instances (moved from progressions R32) | — |
| `duties` (new) | entities, lines, events, standards, progressions, money, civil-time | occurrences met by events, `pay` amounts and prohibitions set against money | — |
| `people` (new) | entities, lines, events, money, duties, civil-time | person reads over everything above: careers, person duties, money given and received, interest checks | `registerRosterSource` (filled by `calculations`) for `staffingAt` |
| `bias` … `retrieval` (39–42, built) | as built | unchanged | — |
| `calculations` (new) | everything above, calc-grammar | counts, totals, unit costs over any construct; tables | fills `registerRosterSource` |

**Check against `build/modules.json` (read at T32).** No built module `uses` any of the new modules, so inserting them breaks no edge. The built layer-5 edges all still point down: `connections` uses `entities`; `progressions` uses `entities`, `connections`; `observation-log` uses `entities`, `connections`; `retrieval` uses `observation-log`, `query-language`; `bias` uses `entities`, `credentials`. `local-facts` uses only record-grammar, jurisdictions, record-core, membership, and `standards` uses only record-grammar, jurisdictions, record-core, membership, promotion, content, so both move from layer 9 to layer 5 without a broken edge; their layer-9 reader `conformance` (uses `standards`) still reads down. `inquiry` (layer 6) uses `progressions`, `bias`, `retrieval`, all earlier. `corpus-export`, `publication`, `docket`, `case-disclosures` (layer 8) gain reads of layer-5 modules only, all earlier.

**What this corrects.** K1453 placed `people` "after lines" and K1458 placed `money` after `calculations` and `events` after `standards`; PEOPLE placed `people` after `lines`; MONEY placed `money` after `duties` and `people` after `lines`. Each of those orders broke P4 somewhere (R-1 point 1): `people` read `calculations` (staffingAt) and money (given/received) while sitting before both; `progressions`' junction checks read `money` from before it; `duties` read money from before it. The order above removes each break: the junction checks live in `money`; `duties` sits after `money`; `people` sits after `duties`; rosters go by registration. The provisional rulings (K1459) are superseded by BOB's ruling in §6 B-1.

### 2.2 Module sizes and splits (P6)

From the three studies' estimates, adjusted for what moved here: `events` ~2,400–2,900 at L5 (dated facts, relations, timelines); `lines` ~1,800–2,200 (with the people kinds); `money` ~2,600–3,100 (with the junction checks, ~250 lines from progressions); `duties` ~2,200–2,700; `people` ~1,800–2,300 (identity claims, person facts, member ties, checks, reads); `calculations` per the first study. If `money` passes ~3,200 at stage 3 its detectors split into `money-checks` immediately after it (no order change). `entities` grows by scheme identifiers only (~200). Nothing is added to `publication` (over P6) or `ratification` (at cap); the DR6 filter goes in `case-disclosures` (§3 C-19).

### 2.3 Shared models and where each lives

| shared model | one home | what others do |
|---|---|---|
| registry identity, aliases, scheme ids, resolution grades, defects | `entities` | reference `ENT-` ids; report defects |
| identity claims between person records (same_as / not_same_as) | `people` | read; never merge |
| validity value and `validAt` | `civil-time` (layer 1; pure) | store the value; resolve event bounds before calling |
| fiscal year, calendars, holidays | profile data, `local-facts` | read |
| date frames, EDTF, method, grade of a dated fact | `events` (dated-fact table) | cite |
| grade family A–D and the two-axis shape | `record-grammar` (vocabulary) with `provenance` (stamps) | each construct grades its own facts in that shape |
| absence levels and terms | `record-grammar` (DEC-86 terms) | every read returns them |
| line kinds and their per-kind end types | `lines` spec list | `affordances` re-exports by reference (X114) |
| event kinds, roles, statuses, relation kinds | `events` spec list | same |
| money kind, phase, stage, basis vocabularies | `money` spec list | same |
| duty modality, performance, time rule | `duties` spec list | same |
| id grammar (all prefixes, widths, opaque rule) | `record-grammar` (one id table) | every validator imports it; no local regex (§3 C-15) |
| table declaration (purge, expunge, export, re-derivation rule) | `record-core` (R21/R46 declaration) | each module declares its tables once |
| re-evaluation causes | `reevaluation` (cause arms) | each construct registers its arm |
| publication filter for persons | `case-disclosures` | every published read is screened there |
| bound constants (page 500/5,000, walk depth, fan-out, total visited 5,000) | `record-grammar` | every read and walk imports them |

### 2.4 Storage at volume

World facts at volume (`EVT-`, `LIN-`, `MNY-`, `MSR-`, `PFA-`, `IDC-`, dated facts, event relations) are **module rows**: typed, indexed columns for what reads filter on, plus a bounded JSON tail; append-only, superseded by a new version row; written through `promotion` (`registerStep`/`registerFact`) so stamps, attestation and re-evaluation are the record's. They are not record bundles: a bundle averages 176,657 B and 10 GB holds about 60,800 (D142), far below a checkbook's year. `CALC-`, inquiries, findings, cases and the group's acts stay record objects. Ledgers and rosters stay table bytes in the evidence store, read by streaming recipes (`sheet-worker`). At the cases in §0.6 the world-fact rows of a decade of one city are under a few hundred MB; the 10 GB store is not approached by the facts but by captures, which are already in R2.

## 3. Conflicts settled, with reasons, or put to Bob

### 3.1 Between the three studies (and R-1's eight points)

**C-1. Module order (R-1 point 1).** Settled as §2.1. Reason: it is the only order of the candidates in which every read is down; it moves the two broken reads (staffingAt over rosters; junction checks over money) to a registration and to `money` respectively. BOB-level (architecture), stated as decided (§6 B-1).

**C-2. Payer and payee held twice (R-1 point 2).** EVENTS gave a payment event participants `payer`/`payee`; MONEY gave the money fact `from`/`to`. Settled: **the money fact owns payer, payee and fund**; the payment event carries only the actor and signatory roles (who signed the warrant, who approved). Reason: the parties of a flow are part of the amount's meaning (a fund-to-fund transfer has no person at all; an amount without its parties cannot be totalled or reconciled), and a payment event exists only when an occurrence must be cited apart from its amount. A timeline shows the payee by reading the money facts that `concern` the event, so the payee appears once (test, §0.7). EVENTS' role list loses `payer`, `payee`.

**C-3. Grades for the new facts.** EVENTS proposed an attestation grade, MONEY a reading axis and a party axis, PEOPLE a person-fact grade; the first study had a two-axis line grade and the registers ask whether a new scale is needed (T3) and whether the 0–3 and A–D scales coexist (T4). Settled: **no new axis**; every world fact uses the assertion and resolution axes of §0.3 (c); MONEY's "reading axis" is the assertion axis, its "party axis" the resolution axis. The 0–3 claim-strength scale and the A–D evidence family stay separate and labelled (T4), as DEC-21 already holds them.

**C-4. How the government act (`ACT-`) becomes an event.** Conformance holds `ACT-` as a determination's object with actor `{role, body}`, never a person (conformance index.mjs:331). Settled: `conformance.determine` takes `act: {event: EVT-}`, or an inline act that `conformance` records through `events` in the same transaction; the actor is an office participant of that event; an optional `holder` (the person holding the office on the date, read by `holderAt`) is shown only if Bob's person-exclusion reading allows it (§6 I-B4). Existing `ACT-` ids stay as aliases of their event ids (UI references: 0, so the migration is trivial). Reason: the occurrence has one home; the determination is the group's act and stays in `conformance` (D111). Decided at stage 1 so `ACT-` is not hardened further.

**C-5. Visibility of world facts.** Settled with §0.3 (g): evidence-sourced facts (events, lines, money facts, person facts read from captured public documents) are shared evidence corpus, like their capture; testimony, hypotheses and member assertions inside a hidden project are fenced, withheld whole, never counted; the registry stays instance-wide (OBS open ruling, now ruled). Bob's choice on the sight of world facts about people (§6 I-B2) can narrow this; it cannot widen it.

**C-6. One home for a tenure's start and a law's in-force start.** PEOPLE put a holder's start on the `holds` line; EVENTS put it on the appointment event; LAW put in-force dates on the standard's version, EVENTS on the effective event. Settled: a validity bound is **either** an EDTF value with its basis **or** `{event, edge}`, never both; when an event exists, the bound names it. Reason: Akoma Ntoso's event-bounded intervals (§0.3 (b)); one correction moves every bound. Bitemporality kept.

**C-7. A `pay` duty's amount.** MONEY (§5.6) held that duties cite money facts; the first study's duty had a `performance` that might carry an amount. Settled: the duty holds the performance (`pay`, obligee, by when); the promised amount is a money fact of phase `adopted` or stage `encumbered` that the duty cites; the discharge is money facts of stage `paid`. No amount on a duty.

**C-8. Career line kinds.** K1453 (provisional) listed `employed_by`, `served_in`, `officer_of` beside `holds`. Settled per PEOPLE §5.2 and R-1: `holds` gains `capacity` (employee, elected, appointed, acting, interim, ex officio, board member, officer or director, partner, military, volunteer, contractor, other), replacing `status`, and absorbs the three; `seat_on` is office→body only. Reason: one post, three kinds would split a career across three reads and duplicate FtM's single `Occupancy`/W3C ORG's single `Membership`-with-role shape (PEOPLE §5.1).

**C-9. Money given and received by a person (`gave_to`/`received_from`).** PEOPLE's draft held them as lines; MONEY held money as facts. Settled: **money facts** (kinds contribution, gift, income; `to`/`from` the person), read through `moneyOf({entity: person})`; `people` presents "money given and received" over that read. Form 700: the stake is an `owns_interest_in` line; stated amounts or ranges are money facts with precision `range`, whose `concerns` may name the line. Reason: an amount is never held twice (C-7's rule); a contribution has a period, a basis, a precision and a filing that only money facts carry; a line would need all of them.

**C-10. The line kinds' one home.** Settled: `lines`' spec list owns the kinds with per-kind end types and default capacities; `affordances` re-exports by reference (X114); `people` owns no kind. Same for event kinds/roles (`events`), money vocabularies (`money`), duty vocabularies (`duties`). Word clashes across homes (`amends`: law relation vs event relation) are disambiguated by kind set, never merged.

**C-11. How `corpus-export` is widened.** Today it exports bundles, files, manifest, history, refs and register in one unpaged answer (corpus-export/index.mjs:73–112), so `entities`, `connections`, `progressions` and every module table are already missing (X107). Settled: each module declares its tables once in the `record-core` table declaration (R21/R46) with two added fields, `export` (yes/no) and `rederive` (stored/derived-rebuildable); `corpus-export` reads the declaration and exports every declared table, **paged per table with a sha per page**, plus the manifest. No separate `registerExportTables`. Reason: purge, expunge and export must list the same tables, or one will drift. Stage 0 correction, before the new modules add tables.

**C-12. `when` and the dated-fact writer (R-1 points 4 and 5).** EVENTS derived `when` on read; timelines need a range scan. Settled: `events` stores `when_cache` (start, end, precision), **rebuilt in the same transaction** as any attestation change and re-derivable; a test rebuilds every cache and byte-compares (event-sourcing practice, §0.5). Dated facts: `events` registers an after-read step on the reading pipeline (layer 4 calls registered steps, never imports layer 5); the step runs as a scheduler consumer after the reading commits (budget measured; never inside the capture request), plus a re-read job for existing content. Event cause: only `stated_cause` (an event relation citing a source that states the cause), per K1461 = DEC-84 (10); `within` replaces `part_of`; `follows_from` dropped (sequence is derived).

**C-13. Storage of world facts.** MONEY proposed `MNY-` as record objects; EVENTS and PEOPLE proposed rows. Settled per §2.4: module rows. Reason: volume (D142).

**C-14. Total walk bound (R-1 point 6).** Settled: every walk (lines chain, `pathBetween`, event-relation walks, `flowsFrom`) has depth, fan-out and a **total visited-node bound of 5,000**; on reaching it the walk returns `truncated` and the answer `undetermined`, never a partial path presented as complete. Constants in `record-grammar` (§2.3).

**C-15. Id width (R-1 point 3).** `allocId` pads the counter to 4 digits (record-core/index.mjs:392–434) and ten validators fix `\d{4}` (e.g. inquiry-grammar/grammar.mjs:45 `ENT`, actions/index.mjs:75 `PLN`, monitoring/checks.mjs:131, connections/checks.mjs:206,210, observation-log/checks.mjs:208, bias/checks.mjs:13, action-grammar/checks.mjs:43, tasks/checks.mjs:80, case-grammar/reference.mjs:20); the 10,000th id of a year is refused downstream. The opaque minter (`mintOpaqueId`, 4 random digits + tail, null after 64 collisions, record-core R6–R9) is also narrow at volume. Settled at stage 0: **one id grammar in `record-grammar`**, every counter `\d{4,}`, every validator imports it; new high-volume or possibly-fenced prefixes (`EVT-`, `LIN-`, `MNY-`, `PFA-`, `IDC-`) are minted opaque with a random tail long enough for 10^7 a year; `ENT-` stays sequential, widened (instance-wide registry). Existing ids remain valid.

**C-16. Court register rows.** Settled: rows are readings (attestations); an event from a row is machine-written only when the source assigns an entry identifier, else proposed. Reason: K1443's rule (source-native identifiers at both ends).

**C-17. Duties binding persons.** K1453 amended K1440. Taken as BOB's on its reasons (a filer's duty is a law's duty on a person, Gov. Code §87200 et seq.); the person exclusions of the action layer are untouched (Bob's, §6 I-B4).

**C-18. Independence of legs.** Settled: strength R12 widened as in §1 ANALYSIS 4.

**C-19. One publication filter for persons (R-1 point 7).** Settled: the DR6 filter lives in `case-disclosures` and lists every person a published case names: in authored statements, subjects, lens, docket entries, **event participants in a published timeline**, and **money parties**. One filter, one rule; materials travel whole (DEC-100 (2)). The filter's rule (title only, or title and name, for an official in an official act) is Bob's (§6 I-B5).

**C-20. Gov. Code 7928.215 (R-1 point 8).** On an elected or appointed official's written demand, a group may not publicly post that official's home address or telephone number, must remove it within 48 hours and not re-post or transfer it for four years (https://law.justia.com/codes/california/2024/code-gov/title-1/division-10/part-5/chapter-14/article-3/section-7928-215/; https://codes.findlaw.com/ca/government-code/gov-sect-7928-215/). Settled at BOB level: a **lawful-demand removal class** in the person-fact table (attributes of that kind are never published, and on a recorded demand are withheld from export and sharing for the statutory period); the reach of removal into replicated copies and already-published editions is Bob's (§6 I-B9).

**C-21. Machine writes beyond K1443's letter.** Legistar events and votes, licence and filer records, adopted money-table bindings. Settled as BOB's extension of K1443 on DEC-52's reasoning: machine-written only from source-native identifiers at both ends, machine-attributed, correctable; everything else proposed.

### 3.2 Every conflict in DOCTRINE-REGISTER `## Conflicts`

| id | settlement |
|---|---|
| A1 | Ruled by K1452/K1455 (people held fully); nothing open. |
| A2 | Action-layer person exclusions (actions R9, consequences R10, conformance actor): Bob's (§6 I-B4). |
| A3 | No conflict on reading: the brand rule names individuals in their official role; K1452 holds people; publication applies the DR6 filter (C-19). |
| A4 | Action §4 rule 10 (no attribute of a person gates, filters or orders) governs **members**, per R-1; BOB's reading, recorded. Subjects are ordered by date or name only (B3). |
| A5 | Ruled: purge class, sight rule (C-5), expunge for what may not be held (stage 0–2). |
| A6 | Member conflicts of interest: Bob's (member ties, §6 I-B3). |
| A7 | Sources: the fact of being a source is protected (the source↔person link never published, never asked over). |
| A8 | Removal of person facts: Bob's (§6 I-B9). |
| A9 | Lookup conduct (searching people): Bob's (§6 I-B7). |
| A10 | DR6 filter home: `case-disclosures` (C-19); materials travel whole. |
| A11 | Stays Bob's DEC-6 trigger, unchanged. |
| A12 | Stated at setup (instance-setup discloses the hosting account's reach, D185). |
| B1 | Bounded contexts split as §0.2. |
| B2 | Word choice: Bob's UX (§6 I-B12). |
| B3 | Ordering by date or name allowed; no importance ordering. |
| B4 | Machine may rule: bounded by K1443 and its extension (C-21). |
| B5–B7, B10, B14 | Not construct questions (process or other modules); left where the register puts them. |
| B8 | The first study's B8 is overridden by K1452 (ruled). |
| B9 | "Overdue" is derived, never stored. |
| B11 | Ruled (K1461). |
| B12 | Evidence rows shared; testimony rows withheld whole (C-5). |
| B13 | Settled in the first study; unchanged. |
| B15 | Superseded by K1452/K1455. |

### 3.3 Every conflict in CROSS-REGISTER

| id | settlement |
|---|---|
| C1 | Member ties and the source link: `people`, fenced; member ties are Bob's (§6 I-B3). |
| C2 | Special rules govern sources, third parties and publication (D82, DEC-78) over any general read. |
| C3 | Cause: settled by K1461 (DEC-84 (10)); `stated_cause` only (C-12). |
| C4 | Built state vs ladder claims: build state is BOB's to verify at each stage boundary. |
| C5 | Recurrence: `civil-time` recurrence rules plus observed meetings (events). |
| C6 | Day boundaries: the local day of the jurisdiction (profile). |
| C7 | DR6 filter (C-19). |
| T1 | K1443 extension (C-21). |
| T2 | Event relations are world facts in `events` rows (C-12, §2.4). |
| T3 | No new grade axis (C-3). |
| T4 | Both scales kept, labelled (C-3). |
| T5 | Module rows; the Software Requirements' three families named in §2.4. |
| T6 | The scheduler orders work, not items: it never ranks people or findings. |

### 3.4 Where R-1's eight points are settled

(1) order → C-1, §2.1; (2) payer/payee → C-2; (3) id width → C-15, stage 0; (4) `when` cache → C-12; (5) dated-fact writer → C-12; (6) total walk bound → C-14; (7) DR6 for participants and payees → C-19, §6 I-B5; (8) Gov. Code 7928.215 → C-20, §6 I-B9.

## 4. Ladder amendments, section by section

Against `src/BIO_Capability_Ladders_v0_1.txt` (v0.1). Each is precise enough to apply as written.

1. **Status paragraph.** Add: "Phase 2 of the constructs study (2026-10) adds PEOPLE, EVENTS and MONEY as full constructs; §5A–§5C are replaced by §5A–§5C below; the provisional rulings K1453, K1456, K1458 are superseded by BOB's integration ruling where they differ (order, line kinds, payer/payee)."
2. **§2 TIME.** Replace "a document's own dates are events too; one store, same object" with "a document's own dates are dated facts held by `events`; a dated fact may attest an event, never is one". Add: "A validity bound is an EDTF value with its basis, or a reference to an event's start or end, never both."
3. **§2 ORGANISATIONS.** Replace the line-kind list with: `post_in`, `holds` (field `capacity`: employee, elected, appointed, acting, interim, ex officio, board member, officer or director, partner, military, volunteer, contractor, other), `seat_on` (office→body), `appoints`, `belongs_to`, `educated_at`, `credentialed_by`, `owns_interest_in`, `related_to`, `associate_of`, `acts_for` (role incl. lobbyist), with the first study's structural, contract, funding and proceeding kinds. Delete `employed_by`, `served_in`, `officer_of`, `gave_to`, `received_from`, `lobbies_for`. Add: "`holderAt` counts only a `holds` to an office."
4. **§2 EVENTS.** Replace "cause" by "stated cause (a cited relation; the system never infers cause, DEC-84 (10))"; replace `part_of` by `within`; delete `follows_from`; delete roles `payer`, `payee`; add "`when` derived from attestations, cached re-derivably for range reads".
5. **§2 MONEY.** Replace "amount" with "amount at a phase, stage, basis and kind, for a period"; add "amounts a duty promises are money facts the duty cites; a person's money given and received is money facts read by person".
6. **§2 LAW / COURTS / ANALYSIS.** LAW: "in-force bounds may name enactment and effective events". COURTS: "filings and orders become events only with a source-assigned entry id; settlements are money facts". ANALYSIS: "independence also fails on a shared person source, event origin, ledger table, or an `acts_for`/`within` tie".
7. **§3 (the thread) and the order list (l.117).** Replace the order with §2.1's; add "junction checks live in `money`; rosters reach `people` by registration from `calculations`".
8. **§4.4 events position.** Replace with "`events` immediately after `entities`".
9. **Interface tables** (each construct's row for EVENTS, MONEY, PEOPLE). EVENTS: provides `event`, `eventsOf`, `timeline`, `datedFacts`, `relationsOf`; reads entities, content. MONEY: provides `moneyOf`, `series`, `committedAgainstPaid`, `flowsFrom`, junction checks; reads entities, lines, events, standards, progressions. PEOPLE: provides `personAt`, `careerOf`, `credentialsOf`, `staffingAt` (via registration), `overlaps`, `pathBetween`, identity claims, interest checks; reads entities, lines, events, money, duties. Remove MONEY's "uses people".
10. **§5.4 Legistar.** "Persons and OfficeRecords seed person entities with scheme id `legistar:PersonId` and `holds` lines to seats (capacity elected/appointed); staff posts are read from directories, org charts, budget books and appointment resolutions, proposed."
11. **§5A, §5B, §5C.** Replace with the three studies' ladders as amended here: PEOPLE §6 (L0–L5), EVENTS §6, MONEY §6, with the changes in §1 and §3 of this study (order, line kinds, payer/payee, `when_cache`, dated-fact writer, total walk bound, DR6 filter, lawful-demand class).
12. **§10 (rulings table).** Rows: cause → K1461/DEC-84 (10); amounts → money facts only; people → K1452/K1455 with Bob's decisions §6 below. Add rows: "absence is never stored (events, money, people)"; "one home per fact; vocabularies in the owning module's spec list"; "one id grammar (record-grammar), counters of four or more digits"; "one table declaration for purge, expunge and export".
13. **§11 (study history).** Add "Phase 2 (2026-10): PEOPLE, EVENTS, MONEY studies; review R-1; INTEGRATION."

## 5. One staged path (stages 0–4, revised)

Sizes are the studies' requirement estimates, merged.

**Stage 0. Corrections before anything is added (≈ 10–15 requirements).** One id grammar in `record-grammar`, counters `\d{4,}`, every validator importing it (C-15); opaque minter with a wider tail; `corpus-export` reading the `record-core` table declaration (export + rederive), paged per table with sha (C-11); the first study's stage-0 items (as-of value, defect UI) unchanged; PEOPLE stage 0 (3–5) on entities identifiers and expunge declaration. Negative controls: the 10,000th id accepted; an `entities` table present in the export.

**Stage 1. Foundations.**
- *1a:* `civil-time`, `calc-grammar` (layer 1); `lines` with the people kinds and `capacity` (C-8); `entities` scheme identifiers; `standards` and `local-facts` move to layer 5; `calculations` (tables, `CALC-`); `answers` (L6 shell); the DR6 filter in `case-disclosures` (C-19); the `ACT-`→event decision recorded (C-4).
- *1b:* `money` L1 (~40: facts, vocabularies, refusals of mixed totals, row references); `people` L1–L2 reads (`holderAt` use, `careerOf`, identity claims, scheme ids; PEOPLE s1 35–45).

**Stage 2. Occurrences and the thread.** `events` L1–L3 in 2a (event, attestations, `when_cache`, dated facts with the after-read step) and 2b (relations, timelines, "ours" lane by registration) (45–55); `duties` with occurrences met by events and money; `sheet-worker`; `money` L2–L3 (series, `committedAgainstPaid`, junction checks moved from progressions) (~45); `people` L2 complete and L3 (person facts, member ties if Bob allows, lawful-demand class) (40–50); COURTS C1/C2; LAW L2; Q2; the roster reader after the docprofile split.

**Stage 3. Detection and asking.** `people` L4 `overlaps`, `pathBetween` with the total walk bound (20–25); `events` L4 (25–30); `money` L4 readers and detectors (~25), member-switched, measured; EXTRACT proposals for the three; `answers` rule services for events, money, people reads.

**Stage 4. Exchange.** Imports and exports in the domain standards (OCD, Popolo, FtM, OCDS, Fiscal Data Package), sharing between groups by the members' act, standing reads (PEOPLE 15–20, EVENTS 12–18, MONEY ~20).

Every stage keeps the everyday-path budget as a failing test, and closes with BOB verifying build state against the ladder (C4).

## 6. Decisions

### 6.1 Decided by BOB (architecture and technical; stated, not asked)

- **B-1.** The total order of §2.1; the registrations `registerEventSource`, the after-read dated-fact step and `registerRosterSource`; supersedes the order parts of K1453 and K1458.
- **B-2.** Payer and payee on money facts only (C-2); amounts never on duties (C-7); money given and received are money facts (C-9).
- **B-3.** Line kinds as C-8, one home per vocabulary (C-10).
- **B-4.** Event-bounded validity (C-6); two time objects; `when_cache`; dated-fact writer (C-12); events E2, E3, E4, E6.
- **B-5.** World facts as module rows (C-13); id grammar (C-15); table declaration and paged export (C-11); total walk bound (C-14).
- **B-6.** `ACT-` as an event alias (C-4), subject to Bob's I-B4 on the holder.
- **B-7.** Grades: no new axis (C-3); independence widened (C-18).
- **B-8.** K1440 amendment (duties binding persons) taken on its own reasons (C-17); K1443 extension (C-21); court rows (C-16).
- **B-9.** The rule-10 half of P-B7: Action §4 rule 10 governs members (A4).

### 6.2 For Bob (policy, doctrine, requirement meaning, UX)

Each with options and a recommendation.

- **I-B1. How a person's identity is established.** (a) only from identifiers in sources; (b) also by a member's adjudicated claim, linked, never merged, with its grade; (c) by match score. *Recommend (b)*: link-not-merge with a stated reason; scores are never used (D53). Legal exposure of a wrong link stated in setup.
- **I-B2. Who sees world facts about people.** (a) only the project that read them; (b) the shared evidence corpus, like their capture, with testimony fenced. *Recommend (b)*.
- **I-B3. Members' own ties (conflicts of interest).** (a) members declare ties, held fenced, used only for their own recusal checks, with a self-declaration attestation; (b) not held. *Recommend (a)*.
- **I-B4. Person exclusions in the action layer** (actions R9 addressee, consequences R10, conformance actor). (a) keep: acts addressed to offices, never persons; (b) allow the holder named beside the office where the act is the official's own. *Recommend (b)* for showing the holder on a determination, keeping addressees offices only.
- **I-B5. The DR6 publication filter.** Home `case-disclosures` and reach (claims, timeline participants, money parties) recommended (a). Rule: (i) officials in official acts by title only; (ii) by title and name. *Recommend (ii)* for elected and appointed officials in documented acts, (i) for staff below department head unless the source names them in the act.
- **I-B6. Machine detectors over people and money.** (a) member-switched interest checks and money detectors, each measured, raising "Noticed" questions with derivations, never scores; (b) none. *Recommend (a)*.
- **I-B7. Lookup conduct.** (a) people looked up only from public records and the group's sources, no login-gated platforms, no paid people-search, searches not logged as suspicion; (b) wider. *Recommend (a)*.
- **I-B8. Whose money is followed.** (a) public money and money to and from officials as disclosed; (b) also private money between private parties. *Recommend (a)*.
- **I-B9. Removal.** Removal of person facts, the lawful-demand class (Gov. Code 7928.215), and expunge's reach into replicated copies and published editions. Options: (a) remove from the record and future editions, note in published editions; (b) also withdraw published editions. *Recommend (a)*, with the statutory 48-hour removal applied to anything the instance publishes.
- **I-B10. A published timeline section** in cases. (a) yes, frozen at signing, screened by DR6. *Recommend (a)*.
- **I-B11. Voice rule half of P-B7**: whether the system may say "the same person" in its own voice when an identity claim is grade A/B. *Recommend*: only quoting the claim and its grade.
- **I-B12. Words on screen.** "People", "ties", "overlaps", "timeline"/"what happened", "money trail", "committed / spent / paid". *Recommend* those words, and never "conflict", "connected to", "suspicious".

## 7. Sources opened

Study folder: `prompts/A-INTEGRATION.txt`; `ANALYSIS-PROTOCOL.md`; `constructs-brief.md`; `STATE.md`; `RESUME.md`; `studies/PEOPLE.md`, `EVENTS.md`, `MONEY.md` and their `.work`; `reviews/R-1.md`; `digest/SIX.md`; `digest/DOCTRINE-REGISTER.md`; `digest/CROSS-REGISTER.md`; `notes/M1.md`–`M7.md` (## Modules); `src/BIO_Capability_Ladders_v0_1.txt`. First study: `../synthesis/constructs.md`; `../studies/TIME.md`, `ORGANISATIONS.md`, `LAW.md`, `COURTS.md`, `ANALYSIS.md`, `QUESTIONS.md`.

Code and build (`/home/user/bio`, `tranche/T32` @ 55e831ce54, read-only): `build/modules.json`; `build/rulings.md` l.1439–1463 (K1437–K1461); `build/requirements/record-core.md` (R6–R9, R21, R46, R75); `bio-plane/src/record-core/index.mjs:392–434`; `bio-plane/src/corpus-export/index.mjs:73–112`; `bio-plane/src/conformance/index.mjs:331`; id validators at `monitoring/checks.mjs:131`, `actions/index.mjs:75`, `inquiry-grammar/grammar.mjs:45`, `tasks/checks.mjs:80`, `bias/checks.mjs:13`, `connections/checks.mjs:206,210`, `case-grammar/reference.mjs:20`, `observation-log/checks.mjs:208`, `action-grammar/checks.mjs:43`, `sshsig.mjs:357`.

Web (opened for this study): https://martinfowler.com/bliki/BoundedContext.html ; https://martinfowler.com/articles/bitemporal-history.html ; https://martinfowler.com/eaaDev/EventSourcing.html ; https://en.wikipedia.org/wiki/W3C_Prov ; https://www.w3.org/TR/prov-o/ ; https://docs.oasis-open.org/legaldocml/akn-core/v1.0/os/part2-specs/os-part2-specs_xsd_Element_timeInterval.html ; https://www.opensanctions.org/docs/statements/ ; https://en.wikipedia.org/wiki/Database_normalization ; https://developers.cloudflare.com/durable-objects/platform/limits/ . Gov. Code 7928.215 as cited by R-1: https://law.justia.com/codes/california/2024/code-gov/title-1/division-10/part-5/chapter-14/article-3/section-7928-215/ ; https://codes.findlaw.com/ca/government-code/gov-sect-7928-215/ . Every domain-standard and volume URL relied on in §0.5–§0.6 is the one cited in PEOPLE §5.1/§7, EVENTS §5.1/§9 and MONEY §5.1/§5.9 at the place named.
