# Cross-construct register (de-duplicated from digest/CROSS.md)

Every distinct observation the phase-1 readers recorded about how time, organisations and obligations, law, courts, analysis and the assistant connect or depend on each other, and the layer-order evidence, merged across readers. Written by the X-REGISTER worker (BOB #110 study, 2026-10-05) from a full, chunked read of `digest/CROSS.md`.

**Notation.** `x123` = line 123 of `digest/CROSS.md`. Reader ids as in the doctrine register; `D<n>` refers to an entry of `digest/DOCTRINE-REGISTER.md`. Constructs: TIME, ORG (organisations and obligations), LAW, COURTS, ANALYSIS, QUESTIONS (the assistant).

**Progress (resume note).** CROSS.md read: 1–170, 171–328, 329–478, 479–635. A resumed worker keeps every entry and continues from the first line not listed. Working store: `regwork/` (as for the doctrine register).

**Contents.** Layer-order evidence X1–X27 · Obligations: organisations × law × time X28–X34 · Time with law and organisations: deadlines, calendars, versions in force X35–X51 · Where time lives now X52–X66 · Law across constructs X67–X79 · Organisations, entities and relations X80–X103 · Courts X104–X111 · Analysis across constructs X112–X132 · Questions and the assistant X133–X155 · Jurisdiction profiles and identifier spaces X156–X159 · Shared mechanisms any construct would reuse X160–X166 · Doctrine binding every construct X167–X177 · Naming clashes across constructs X178–X182 · Other X183–X191 · Coverage check

## Layer-order evidence

### X1 · The canon's own functional map needs law during investigation: comparison against legal and policy standards is concurrent with information gathering, while the Action design puts Standard and Determination in layer 9 with a Determination resting on published findings
- **Evidence:** FA L103–109, L114–115 (Analysis concurrent), L564–565 (Legal/Policy Lookup in Layers 1 and 2), L327–341 (Compliant/Noncompliant/Unclear per government action before Document); RM §10 L650–652 ("compare to legal requirements" in Investigate); AC L20–21 vs L28 (an inquiry may open a plan, suspected) and rule 2; Skills 4, 6
- **Reported by:** C1 (x7)
- **Constructs joined:** LAW, ANALYSIS, QUESTIONS, TIME
- **Notes:** C1 marks this [CONFLICT]: the sources differ on when comparison against a standard happens; only the Determination needs publication as specified.

### X2 · History explains the gap: the analytical layer (law, comparison, calculation) was knowingly deferred, not ruled out
- **Evidence:** UK L49–52 (Bob 2026-07-27: "Layer 2 the analysis layer fills in afterward"); FA L609–613; RM L552–557 (the eighth skill, Government Compliance Analysis, added to fill "the Layer-2 analytical gap")
- **Reported by:** C1 (x16)
- **Constructs joined:** ANALYSIS, LAW

### X3 · Time and law are joined in the design only on Actions (every clock names its statute, order or commitment; "Clocks belong to Actions"), while investigation already needs time for a public body's expected acts
- **Evidence:** TAD §8.2 l.915–920; CONSTRUCTS (minutes within N days; need-to-signed-contract) checked by progressions and connections (layer 5) and aged by REC-8
- **Reported by:** C10 (x20)
- **Constructs joined:** TIME, LAW, COURTS, ORG

### X4 · Some process-law and time reasoning already lives low in the order: progressions (layer 5) state that a body must produce stage B within N days of stage A unless it publishes a lawful exception, with overdue/missing derived on read and notified via the case connection
- **Evidence:** DEC-9 (stage order; lawful exceptions discharge a required stage); DEC-9/DEC-10 (interval AUTHORED by the group, not sourced from a statute; no business days or holidays); CF §8, §8.2
- **Reported by:** C11 (x37, x38); C9 (x298); D1 (x333); M2 (x589)
- **Constructs joined:** TIME, LAW, ORG

### X5 · The backward question ("what else would need to be true for action X") is where law (an action's elements and preconditions), questions and analysis (support status per element) meet, at investigation time; it is deferred
- **Evidence:** DEC-26; CM §6a (CM 1034–1044), §6b D-165 (CM 1100–1118: filing window vs a date, standing vs who the group is, exhaustion vs recorded actions; Bob named "AI support for procedural knowledge"); AIR §7.2 PURSUE (AR 125); canon-mission line 215 ("standing, exhaustion and filing-window checks" not designed)
- **Reported by:** C11 (x52); C4 (x143, x152); C9 (x313)
- **Constructs joined:** LAW, QUESTIONS, ANALYSIS, TIME, COURTS, ORG

### X6 · The investigative session (layer 6) reads the whole project and may reach any public source, so if inquiries need law, deadlines, organisational facts or calculations it can only read what exists at or below its layer; layer-9 `standards`, `consequences` and `action-clocks` are invisible to it as built
- **Evidence:** DEC-60 ("The session reads the whole project and writes one inquiry ..."); DEC-47; DEC-62; IS §5 example (src 361: sequence of declaration vs contract, emergency exception, declaring body); IS §8 (src 770–783: Bob's canonical example, does the contract award conform to the required contracting process)
- **Reported by:** C12 (x58); C5 (x163, x167)
- **Constructs joined:** LAW, TIME, ORG, ANALYSIS, QUESTIONS

### X7 · The designed workaround for the layer order: a layer-6 AI reaches layer-9 law and conformance only through plane ops declared in `op-declarations` (layer 11) under the run's credential, and `ai-runs` learns of plans only through a registered callback; `action-plans` must sit last in layer 9 because it reads every layer-9 module
- **Evidence:** draft-planning-skill R47, R51, L21, L26 (`standards.standardRead`, `conformance.determinationRead`, consequences, `filings.availableActions`, `jurisdictions.combine`); action-plans placement
- **Reported by:** C13 (x70, x80); M3 (x598)
- **Constructs joined:** LAW, TIME, ANALYSIS, QUESTIONS
- **Notes:** Direct evidence for the brief's structural observation: the AI needs law, consequences and deadlines, and today gets them only at the plane boundary and only for planning (after publication). Doctrine: D214.

### X8 · Layer 9 may read layer 6, so planning can begin during investigation (a suspected subject is an inquiry), but nothing provides the reverse: no inquiry, layer-6 assistant or entities can use `standards`, `local-facts`, `consequences` or `action-clocks`
- **Evidence:** action-plans R1, R5; HANDOFF rulings 1–10 ("a plan may open when an inquiry begins"); draft-planning-skill R51; ai-runs R47
- **Reported by:** C13 (x88); C9 (x279)
- **Constructs joined:** LAW, TIME, ANALYSIS, ORG, QUESTIONS
- **Notes:** Doctrine: D213, D21.

### X9 · `local-facts`, the module that makes calendars trustworthy (researched → unconfirmed → confirmed/corrected/disputed, with lapse horizons and a queue item), sits first in layer 9, so only `action-clocks` and `filings` read calendar status, though it is generic by key and could carry office and legal facts if placed where investigation can read it
- **Evidence:** draft-filing-templates §3, L98 (K921); local-facts R1–R5; research-oakland-calendar Summary ("Generic by key so any `UNMEASURED` fact (an office, a deadline) can later be confirmed the same way")
- **Reported by:** C13 (x72, x89)
- **Constructs joined:** TIME, ORG, LAW
- **Notes:** Doctrine: D15, D215, D232.

### X10 · Determinations are keyed by government act (`conformance.determinationsFor({act})`), joining inquiry (layer 6) to conformance (layer 9) only from the layer-9 side
- **Evidence:** action-plans R5
- **Reported by:** C13 (x79)
- **Constructs joined:** LAW, ANALYSIS

### X11 · The layer-9 contract is loosened toward pre-publication action ("An action rests on the record"; only breach assertions need a published finding and a held standard), but law (`standards`) and time (`action-clocks`) stay in layer 9
- **Evidence:** action-design deltas §1, L7
- **Reported by:** C13 (x81)
- **Constructs joined:** LAW, TIME, COURTS

### X12 · The AI is expected to help put law into the record and compare conduct to it (the planning skill proposes standards and comparisons), yet those modules sit in layer 9, after the inquiry and the layer-6 assistant
- **Evidence:** action-design deltas §5, L42 (`standards` R9, `conformance` R12)
- **Reported by:** C13 (x82)
- **Constructs joined:** LAW, QUESTIONS, ANALYSIS

### X13 · Bob's own sequencing doctrine ("we need a solid substrate before building on top of it") favours putting the substrate (law, time, calculation) before what builds on it
- **Evidence:** DEC-33 (src 776–778)
- **Reported by:** C2 (x94, x104)
- **Constructs joined:** LAW, TIME, ANALYSIS

### X14 · Contradiction handling at investigation time needs law-in-time: its coordinates are the constructs (subject = organisations, time or occasion, applicability and meaning = law); RESOLVE is ruled to reconcile conflicting norms "later over earlier through `standards`' periods and `supersedes`" and "higher over lower", fill a CCCER Effect from `consequences`, and route obligation-against-act into `conformance`, all layer-9 modules
- **Evidence:** DEC-76/76.3 (src 1252); DEC-77; DEC-84.10 (src 1387); CM §CONTRADICTION + DEC-76 (CM 826–882); CM §THE ACTION PLAN 1 (CM 881–923); CONTRADICTION-IDENTIFY K4 (src 82: a regulation as doctype, an entity resolved at document grain and document dates, in layer 6 `contradiction` without `standards`); M3: `NORM_CANONS` (higher over lower, later over earlier, specific over general) and kinds `obligation_against_act` and `conflict_of_norms` presuppose norm hierarchy, effective dates and obligations that nothing in layer 6 can supply or check; a member names the canon by hand
- **Reported by:** C2 (x97, x104); C4 (x140, x142); C5 (x181); M3 (x607)
- **Constructs joined:** LAW, TIME, ORG, ANALYSIS
- **Notes:** C4: a conflict of norms needs reconciliation canons (lex specialis etc. implied), law-structure knowledge the plane does not encode. C5: the design already wants rule-vs-act and statement-vs-later-statement comparisons during investigation, before publication. Doctrine: D93, D98.

### X15 · The Content Framework puts investigation-time time support in the MEANING layer (progressions with `within` intervals, overdue/missing findings, temporal connections with due dates), organisations in entities and the subject registry, law only as the C.M.S. recogniser, and analysis's designed home in the intent layer; none depends on or mentions layer-9 `standards`, `conformance` or `action-clocks`
- **Evidence:** CF §8, §8.2, §8.3 (`idspaces.mjs`), §12 (layer 7 `intent`)
- **Reported by:** C3 (x130)
- **Constructs joined:** TIME, ORG, LAW, ANALYSIS

### X16 · Inside an inquiry law appears only as captured documents cited as legs; structured law (governing-law citations, due-date citations, risk tier) exists only on the `action` object; the only structured time-for-others an investigation can reach is the progression plus the task clock
- **Evidence:** CM 922–923 ("such a claim has legs pointing at BOTH the standard and the conduct, and both are ordinary evidence"); D-149, D-147; CM 952–966; IC 337; CM 266–267 (no cross-action index)
- **Reported by:** C4 (x154)
- **Constructs joined:** LAW, TIME, ORG

### X17 · In the publication and intake documents, authority determination sits at intake (layer 3) and venue and audience standards in the profile consulted at publication (8) and action (9); nothing requires law, courts or analysis before publication except authority determination at capture (needs organisations), standing watches of public-body sources (organisations and time), and the venue-set standard of evidence a project's bar would want whenever the bar is set
- **Evidence:** Pub §2 L80, rule 8; DEC-105; `risk_tier`
- **Reported by:** C6 (x197)
- **Constructs joined:** LAW, COURTS, ORG, TIME, ANALYSIS

### X18 · The record schema supports the structural observation: every law-, time- or calculation-bearing type State Rules names (the Action clock; STD-, CONF-, CONS-, ESC-, PLN-) belongs to the Action layer, while investigation-side types carry only dated recheck triggers on the legacy Focus, `as_of` on citations, monitoring frequency and state-history timestamps; the live `inquiry` type is not schematised
- **Evidence:** SR §4.2 (I-15), I-8, §4.1, src 20; SR amendments src 1690–1809 (K171, K608)
- **Reported by:** C7 (x202, x223)
- **Constructs joined:** LAW, TIME, ANALYSIS

### X19 · Time, organisations and law already meet in a layer-1 library: `docprofile` content types parse entities and named facts and emit referential connections (meeting `held_by` body; staff member in department; agenda item cites ordinance) and temporal ones with `expected_by` (an absence with a due date), thresholds from profile data; but the monitor keeps only the COUNT of connections, the per-kind contract and the contemporaneity bracket do not fire, and whether `progressions` consumes them is not stated
- **Evidence:** docprofile; DP L11, L13; `practice.minutes_due_days`; monitoring/index.mjs:535
- **Reported by:** C8 (x227, x228, x229, x230); M2 (x583)
- **Constructs joined:** TIME, ORG, LAW
- **Notes:** C8: some time handling is not confined to layer 9; the facts are produced and mostly dropped.

### X20 · The action design's own evidence supports the structural observation: standards and comparisons "exist independently of any finding" and comparison before publication is "inquiry work" (K102), yet `standards`/`conformance` sit above inquiry and the assistant; `determine` is hard-gated on a finding in a ratified case edition (the wire test had to plant one); `consequences` accepts only a live noncompliant outcome; business-day arithmetic exists only in `filings/dates.mjs`; and the newest layer-9 design (a plan that may open when an inquiry begins, suggestions using standards, consequences and profile deadlines) itself needs law, time and organisations before publication
- **Evidence:** build-state lines 50, 295; code lines 20, 63, 85, 152, 267; ACTION-PLAN ruling 10, A4, A5; INVENTORY line 50
- **Reported by:** C9 (x271, x279, x281, x294, x314, x318)
- **Constructs joined:** LAW, TIME, ORG, ANALYSIS, QUESTIONS

### X21 · Members need law, time and analysis during investigation, before anything is published: the most common front door has the member find the standard the city set itself and ask whether it meets its own time policy before any finding exists, every entry point runs through a standard, a deadline or a docket, and the use cases file standards, in-force-on-a-date and comparison under functional layer 2 (Analysis); as built a determination needs published findings and "The only calculation in the product comes after a breach has been determined"
- **Evidence:** design-journeys journey 4 (L186, L197–198), §3, §6 L528; UC-062–UC-065 (UC-065 trigger "Published findings and standards exist."); journeyExperience (c) step 2 ("Published findings with frozen pairs")
- **Reported by:** D1 (x331)
- **Constructs joined:** LAW, TIME, ANALYSIS, QUESTIONS

### X22 · The surface rules place standards, determinations, clocks, consequences and venues only on action-stage surfaces, and the question workspace lists legs, grades, versions and tensions but no standard, deadline, figure or calculation ("a breach claim rests on a published finding"); three items pull law and analysis earlier: the published case's Criteria/Condition/Cause/Effect/Recommendation needs a standard at publication (layer 8), the contradiction inquiry (layer 6) must handle a conflict of norms, and a connection grades B when the same identifier (an ordinance number) is in both captures
- **Evidence:** surface rules L422–640, L667, L1584–2002, L2636, L3004–3473; view start-and-send L38; DEC-84 (10); measures L41; design HANDOFF L61 ("in-product calculation over a dataset")
- **Reported by:** D2 (x532)
- **Constructs joined:** LAW, TIME, ANALYSIS, ORG

### X23 · Placement verified against `modules.json`: law (`standards`), calculation (`consequences`), the local calendar (`local-facts`) and all deadline arithmetic (`action-clocks`) are layer 9 and are used only by layer 9–11 modules, so inquiry, the assistant, entities and understanding cannot read a standard, a determination, a deadline or a computed figure; before publication the only law-shaped constructs are `comparisonPropose` (stored apart, no outcome), contradiction's `obligation_against_act` kind (records no outcome) and an action plan's suspected subject that may hold `standards?`; conformance's determination rests on `publication.publishedEditionsOf`
- **Evidence:** modules.json (dependents: affordances, queue-producers, control-plane, plane, monitoring, wizard-scripts, instance-setup); conformance R21; action-plans Terms; M5 (publication.publishedEditionsOf)
- **Reported by:** M1 (x546, x547, x548, x549, x550, x551, x552, x553); M5 (x635)
- **Constructs joined:** LAW, TIME, ANALYSIS, ORG, QUESTIONS

### X24 · Doctrine is uniform across layer 9 and enforced by refusal codes (acts are members' only; machine proposals labelled and stored apart; undetermined never defaulted; nothing composed or scored; hidden withheld whole; append-only), so moving any of these services lower would carry its refusals unchanged, and the assistant would then read member-declared standards and determinations, not make them
- **Evidence:** M1 (layer-9 requirements)
- **Reported by:** M1 (x577)
- **Constructs joined:** LAW, TIME, ANALYSIS, QUESTIONS
- **Notes:** Doctrine: D53, D56, D235.

### X25 · The profile data are already low but consumed only high: `jurisdictions` (layer 1) carries deadlines, holidays, hours, time zone, standard sources, records laws, code-citation patterns and counterparties, but its R23–R45 sections are "the action sections ... for layer 9" and its only layer 5–8 user is `entities` (search terms, identifier spaces); no inquiry, ai-runs, skills, agent-worker, intent or reevaluation module uses it, so an investigation cannot ask when something is due, which law governs or which office; the fix need not move `jurisdictions` but needs a layer-5/6 consumer (progressions reading profile deadlines and holidays, or the assistant reading standard sources)
- **Evidence:** jurisdictions l.32; modules.json
- **Reported by:** M2 (x581, x590)
- **Constructs joined:** TIME, LAW, ORG, QUESTIONS
- **Notes:** Doctrine: D196, D213.

### X26 · A lower-layer module can consume later layers by op at runtime without breaking P4 (op-time, not import-time): agent-worker R51's plan mode reads deadlines, venues, `legal_organisations`, standards, determinations, consequences and available actions over plane ops, while the deployed `check` mode reads only `meaningrows`, `search`, `versionchain` and `basisversions`; the barrier is less the layer order than which ops a deployed mode's table and the sub-session's single tool may call
- **Evidence:** agent-worker R51; M3
- **Reported by:** M3 (x598)
- **Constructs joined:** LAW, TIME, ORG, ANALYSIS, QUESTIONS

### X27 · Higher-layer facts reach lower layers only by registration, never by use: layer-9 clock facts (`due`, `overdue`, `addressee`) reach layer-5 search through `retrieval.registerActionFacts`, layer-6 grades and fields through `registerLegGrades` and `registerField`, and layer-9 conformance and consequences hear layer-7 basis changes through `reevaluation.onBasisChanged`; it keeps the grammar unchanged and the order intact but carries data, not services, so an inquiry cannot ask `standards` or `consequences` a question
- **Evidence:** retrieval R53, R55, R62; reevaluation R8; query-language Suggestions (query-language.txt:76)
- **Reported by:** M4 (x614)
- **Constructs joined:** LAW, TIME, ANALYSIS, QUESTIONS
- **Notes:** Doctrine: D214.

## Obligations: organisations × law × time

### X28 · An obligation (who owes what to whom, by when, under what authority) is ORG × LAW × TIME, and no construct holds it: examples are everywhere, accountability attaches to the role with predecessors answerable, but no document models positions, holders over time or obligations as data
- **Evidence:** RM L230–232 (Administration's own October 2023 deadline), L253 (Controller's 10-day CPRA duty); FA L311–312 (report "two days late"); DR §6 L149–156; RM App A (positions with dated holders); AC rule 6; SD row 6; CF §8 src 689–717 ("an absence with a due date ... is a fact about the body"; no source of the due date)
- **Reported by:** C1 (x9); C10 (x21); C13 (x90); C3 (x116); D1 (x337)
- **Constructs joined:** ORG, LAW, TIME

### X29 · Rule versus instance is the shared pattern ("The table holds the rule; something else has to age the instances"), and the member-facing need is to know whose move it is: the clock belongs to the counterparty
- **Evidence:** CON l.198–199; PS MuckRock (l.121), ADOPT 6; ORGANISATIONS sketch (meeting `held_by` body; person `serves_on` body)
- **Reported by:** C10 (x21)
- **Constructs joined:** ORG, LAW, TIME

### X30 · Two kinds of obligation-with-a-clock: the group's own (a checkpoint is an intention; a queue "obligation") and the counterparty's (a deadline as a condition on the action); progressions hold what others owe, plans hold ours; the seed of an obligations thread exists only inside action plans
- **Evidence:** action-design PATH §1, §3; UX-ANSWERS OQ-25; CM §THE ACTION PLAN (CM 906–994: statutory deadlines, filing windows, outcomes keyed to "ignored past the statutory deadline", standing, grand-jury referral)
- **Reported by:** C13 (x75, x90); C4 (x141); C9 (x298)
- **Constructs joined:** ORG, TIME, LAW, COURTS
- **Notes:** C9 (canon-constructs line 98): the progression (what a government body is supposed to do, its declared flow) vs the plan (what we intend) is the time construct's key distinction and an organisations one: the obligation-with-a-deadline Bob asks for already exists as `progressions` (layer 5). Doctrine: D234, D314.

### X31 · Time, organisations and law meet in an action-plan option (addressee by role and organisation, regulated dates with basis, a tier), but only at layer 9
- **Evidence:** action-design PATH steps 4–9
- **Reported by:** C13 (x76)
- **Constructs joined:** TIME, ORG, LAW

### X32 · An obligation construct needs a body, a source of duty and a date together: Bob reserves "obligation" for a public body's duty, and every wait must name what is awaited, from whom and the expected or legal date
- **Evidence:** DEC-107; DEC-98.2; IC §U DEC-98 (IC 619–620)
- **Reported by:** C2 (x105); C4 (x148)
- **Constructs joined:** ORG, LAW, TIME

### X33 · Non-response findings ("asked on this date, nothing by that date") are dated outcomes about a body that link the four-level absence construct to time and obligations; an observed absence as a graded leg is deferred
- **Evidence:** CM §8 D-181 (CM 1152–1161)
- **Reported by:** C4 (x144)
- **Constructs joined:** TIME, ORG, ANALYSIS, QUESTIONS

### X34 · The conformance act (`actor {role, body}` plus `at | period`) is the only structured "who did what when" record of a government act, and it is minted only at determination, after publication
- **Evidence:** build-state line 82
- **Reported by:** C9 (x290)
- **Constructs joined:** ORG, TIME, LAW

## Time with law and organisations: deadlines, calendars, versions in force

### X35 · Deadline arithmetic needs the law (its basis), the profile (holidays and counting rule) and the as-of date of the version in force: every deadline names its source, a standard carries its period in force, statutes are recodified, and the CPRA example implies a business-day roll-forward
- **Evidence:** FA L424–428; AC §2, rule 5, L20, rule 11; RM App B ("Recodified 2023 by AB 473"); RM L253–254 (10 days from Thu Mar 19 → "expired March 30", a Monday); audiences L1246; UC-118 ("carrying its statute"); journeyExperience (h) ("Due date with citation"; step 1 "The law and its deadline (from the profile)"; L1062 overdue derived, never stored), (c) ("Profile deadlines, holidays"); J5 step 6
- **Reported by:** C1 (x8); C9 (x293); D1 (x332)
- **Constructs joined:** TIME, LAW, ORG

### X36 · The precision doctrine generalises to civic dates (an inference): a date-only deadline or "within N days" denotes an interval, and comparisons inside it should state undetermined; no document handles time zones, business days, holidays or fiscal periods
- **Evidence:** OLD ("the coarser side is read as the INTERVAL it actually denotes"; undetermined band, BOB #33); TAD §10.10 ("created is real UTC"); RFC 3161
- **Reported by:** C10 (x28)
- **Constructs joined:** TIME, LAW, ANALYSIS

### X37 · An authored deadline is the licence for machine tracking: a due-by binds (notifies) without a human decision because a member authored the expectation; a deadline the machine derived from law it read would not obviously fall under that licence; authored windows (progression intervals, the right-of-reply window) are a recurring pattern
- **Evidence:** DEC-10 ("the due-by was AUTHORED"); DEC-13 (right-of-reply window modelled on GAGAS audit practice)
- **Reported by:** C11 (x39, x40)
- **Constructs joined:** TIME, LAW, ORG, COURTS
- **Notes:** Doctrine: D245, D250.

### X38 · Templates for as-of reasoning exist: every derived claim is tied to a fixed version and a date, change over time is reported as dated sequence, never inferred cause, and the session's "in force at open vs now" for the bias lens is a pattern for law in force at the time of the act
- **Evidence:** DEC-12 (editions; a citation pins an edition; supersession surfaced, not followed); DEC-14; IS §11 (src 836–840, 876–889); D-219/D-256 ("A stored string is a fact about when it was written"); D-203 (a weaker past check "STATED beside the state, never reverted"); SR §8 (checks apply only to bundles whose schema stamp declares a version carrying the rule); D2: law in force on a date (view F "In force on" selector L10; SR L1605), captures superseded by newer captures (SR L58, L904; VF L16), question versions with CURRENT and conclusion history (SR L443), case editions with supersession (SR L2605), the lens "in force" (SR L978); M4: Memento (acquisition R32) can ask an archive for a document at a date but the code always asks "now" and only for unreachable sources; reevaluation's version reasoning (edition in force, frozen pair, `since` after `last_updated`) applies to evidence and case editions, not law in force
- **Reported by:** C11 (x41); C5 (x168); C7 (x208); D2 (x531); M4 (x617)
- **Constructs joined:** TIME, LAW, ANALYSIS
- **Notes:** C7: this "version in force at the time" pattern is already practised internally. Since BOB #16 ids carry no chronology ("ordering by id carries no meaning from here on"), so every timeline must come from `created`, write order or dated records. D2: analysts may treat "as of" as one shared construct across law, captures, question versions, editions and lenses rather than per-module features.

### X39 · Time depends on organisations: which holiday list and hours apply depends on the office, body or venue and its parent or employer, so a business-day deadline cannot be computed without resolving the addressee to an organisational unit and its governing calendar
- **Evidence:** research-oakland-calendar L136–138, L304–306 (Grand Jury: court vs county; SCO: CalHR as employer; City departments differ)
- **Reported by:** C13 (x67); M4 (x624)
- **Constructs joined:** TIME, ORG, COURTS
- **Notes:** M4 pointer: `build/plan/research-oakland-calendar.md` exists in the repository and may bear on meeting calendars (read by C13).

### X40 · Time rests on law: the zone, court holidays, City holidays and state elective holidays come from statutes and MOUs, so calendar facts are law-derived facts with versions in force
- **Evidence:** research-oakland-calendar (Gov. Code §6808; CCP §135; MOUs expired 2026-06-30; Gov. Code §19853)
- **Reported by:** C13 (x68)
- **Constructs joined:** TIME, LAW

### X41 · Law → time → action: a regulated date's basis names "the statute, order or commitment" and on start becomes pending clock entries with their bases in `action-clocks`, but the basis is a name, not a link to a held provision or order
- **Evidence:** action-plans Terms, R18; SR §4.4, I-11 (Action `clock[]` {text, description, date, basis, status}; basis free text, e.g. "Gov. Code 7922.535"); I-20 (`deadline-recheck` flips status, never derives a date); src 1806 (counterparty "an office by role and body"); M1: a deadline's basis is always a citation string — profile `deadlines` (jurisdictions R26), `clock[].basis`, `due_cite`, an action-plans regulated-date `basis` — and the only time construct using standards is a standard's own in-force period, so "every deadline names the statute, order or commitment it comes from" is met by a string, not a link to the law's text or version in force; M5: laws on an action are free-text `{level, citation}` rows, not links to `standards`
- **Reported by:** C13 (x78); C7 (x201, x219); M1 (x570, x571, x572); M5 (x630)
- **Constructs joined:** TIME, LAW, COURTS
- **Notes:** C7: the Action clock is the one structure where time, law and organisations meet; its basis links to no captured provision, version in force, computation rule (calendar vs business days, holidays, zone, tolling) or obliged body, and the obligation it tracks is spread across counterparty, basis and date with no obligation record. Doctrine: D256, D250.

### X42 · Time granularity mismatch: the profile is to carry an IANA zone and office hours (needed for "received after close"), and court e-filing has outages and an unknown "deemed filed" cut-off, yet a regulated date is `YYYY-MM-DD` and a checkpoint is `{after_days}` in calendar days
- **Evidence:** research-oakland-calendar M-NEW-7; draft-filing-templates §2 L71; jurisdictions R41–R42; action-plans Terms L15
- **Reported by:** C13 (x87)
- **Constructs joined:** TIME, COURTS, ORG

### X43 · Time is bound to member-stated law: every due date carries a citation that must be one of the action's governing-law citations; the plane computes elapsed days and passed-due status but never the clock itself, because law's rules are not encoded
- **Evidence:** CM §2 D-147/D-149 (CM 252–266)
- **Reported by:** C4 (x137)
- **Constructs joined:** TIME, LAW

### X44 · Time quality gates the analysis of contradictions: an undetermined date blocks a pair, and legitimate change between dates (a rule amended, a figure revised) is an unmeasured confounder that an as-of / in-force model would separate from a true contradiction
- **Evidence:** CONTRADICTION-IDENTIFY §4/§7 (src 84–86, 13)
- **Reported by:** C5 (x182)
- **Constructs joined:** TIME, LAW, ANALYSIS

### X45 · Two kinds of time rule must stay distinct and each carry its basis: a practice expectation (minutes due about 21 days, UNMEASURED) raises a question and never asserts a violation, while a legal deadline (naming its statute) can ground a breach; any richer time construct needs both, labelled measured practice, ruled law or undetermined
- **Evidence:** DP L332–334; layer 9 contract
- **Reported by:** C8 (x231, x232, x233, x234)
- **Constructs joined:** TIME, LAW
- **Notes:** Doctrine: D241, D256.

### X46 · UTC is used throughout and the jurisdiction's zone is unused where checked: `observed_at` is a date or UTC instant, the calendar parser reads M/D/YYYY into UTC and `deadline-recheck` marks overdue on the UTC day, while the profile carries `time_zone: America/Los_Angeles`; a deadline on a local evening could flip a day (inferred from code)
- **Evidence:** MKD L77; monitoring/index.mjs:2746, 2783; oakland-alameda.mjs:184; design-journeys §6 "Meetings and time" (days counted in UTC; time zone and office hours stored but unused; no recurring-meeting model); M1: actions R12, action-clocks Terms (UTC and date-only; profile zone and office hours researched, confirmed and lapsed by local-facts but never applied; a fixed Saturday–Sunday weekend); M4: monitoring marks deadlines overdue at the UTC midnight after the date (`monitoring/index.mjs`:2747–2756, 2791–2813), acquisition renders in UTC (`render.mjs`:60–61), query ranges compare strings, ageing is 30 calendar days; M5: time as built is a member-typed date plus a UTC "today" comparison, holidays and hours exist only as unconfirmed profile facts
- **Reported by:** C8 (x235, x236, x237, x238); D1 (x332); M1 (x573, x574, x575); M4 (x615); M5 (x629)
- **Constructs joined:** TIME
- **Notes:** Doctrine: D211, D249, D196.

### X47 · An action plan binds time to law: regulated dates must name a statute, order or commitment while checkpoints are relative durations of the group's own, and the machine must compute whether a regulated date is reachable within a scenario, a date-arithmetic need inside layer 9
- **Evidence:** ACTION-PLAN A4, A10, A14
- **Reported by:** C9 (x278)
- **Constructs joined:** TIME, LAW

### X48 · The richest time structure in the product is the profile `deadlines` grammar (`{rule, applies_to, days, count ∈ calendar|business, starts ∈ received|filed|act|known, extension?, citation}`) plus `holidays` per complete year, held in `jurisdictions` (layer 1) but consumed only by `actions.clockPropose` (layer 9); no general date/time service exists for inquiry or the assistant
- **Evidence:** build-state lines 326, 358
- **Reported by:** C9 (x293)
- **Constructs joined:** TIME, LAW, QUESTIONS

### X49 · Lateness against a required date is itself a law conformance question ("files a report two days late is technically noncompliant"); significance stays human
- **Evidence:** canon-mission line 71; FA L311–312
- **Reported by:** C9 (x308)
- **Constructs joined:** TIME, LAW, ORG

### X50 · Members' time needs reach beyond action clocks: claim periods ("over what period"), per-record reported and closed timestamps, the next agenda, contract deadlines, a court case's deadlines and filing deadlines in a regulatory proceeding
- **Evidence:** design-journeys J6 (and step 3), §3 (meeting; contract; L106 court case; L111 regulatory proceeding)
- **Reported by:** D1 (x332)
- **Constructs joined:** TIME, LAW, COURTS, ORG, ANALYSIS

### X51 · Every deadline is a time–law–organisations joint: the design never shows a bare date (a clock names its statute, an overdue item its date, basis and text, options their regulated dates with basis, the response window the group's stated window with DEC-13 precedent, the claim deadline its profile basis); there are four deadline origins (regulated, the group's stated window, the group's own checkpoint, the member's reminder), each with a direction of obligation ("the counterparty's deadline, not ours")
- **Evidence:** surface rules L73, L93, L1620, L3030; view matter-page L52; view plan-page L54; view F L50, L57
- **Reported by:** D2 (x530)
- **Constructs joined:** TIME, LAW, ORG

## Where time lives now

### X52 · Two homes for lateness with no stated shared time model: progressions in meaning (layer 5: missing-predecessor and overdue-successor findings, temporal connections) and action clocks in layer 9 (overdue derived when read, an overdue-scan on the alarm); the framework's one "obligation with a clock" may duplicate Action's clocks
- **Evidence:** SD row 6; MS M4 (meeting→agenda→minutes; need→award→contract); AC §5 row 4; MS M1, M10; TAD vs CON; CF §13 src 1508–1520 ("rather than growing two schedulers")
- **Reported by:** C1 (x10); C10 (x20); C3 (x131)
- **Constructs joined:** TIME, ORG, LAW

### X53 · Time is pervasive as immutability and thin as calendar: editions, frozen versions, pinned revisions, dated assertions and add-never-unsay support as-of reading of the group's own record, but nothing supports external deadlines, calendars or in-force dates; the only legal-suspension clock (litigation hold) and the only business-day rule concern the group's own conduct
- **Evidence:** DEC-34/41/44 (editions); DEC-60 (frozen versions, CURRENT pointer); DEC-45/54 (pinned revisions); DEC-65 (`at`); DEC-56; DEC-61 (litigation hold, "on notice"); DEC-55 ("three business days"); Publication/Intake/A&T: instants and precision (D-543 `stampInstant`), undetermined order within a precision band (D-516, D-573), dated histories never overwritten, as-of-signing statements (Pub rule 18), version pinning (`case_citations[].version`), editions with "what changed" (DEC-101), per-case docket chronology (DEC-100/116), rolling windows, monitoring thresholds (3 failures/14 days)
- **Reported by:** C12 (x61); C6 (x190)
- **Constructs joined:** TIME, LAW, COURTS
- **Notes:** C6: deadlines, effective/in-force dates, fiscal periods, meeting calendars and notice rules appear only as raw material (FY2025-27 budget, ACFR, council agendas, "CPRA request and nonresponse record"); the version doctrine (pin to the version as it stood) is reusable for law in force and office holders over time.

### X54 · Time support is built but unreachable: `monitoring.deadlineRecheck` exists, no scheduler calls it and the queue has no kind for an overdue clock, so deadline monitoring never reaches a member
- **Evidence:** action-design HANDOFF L42; deltas §4 L35; UX-ANSWERS UC-127; monitoring R34–R35
- **Reported by:** C13 (x85); C9 (x295)
- **Constructs joined:** TIME, QUESTIONS

### X55 · The progression is where time (within, overdue, out of order), organisations (department, council, contractor; institution scoping), law (lawful skip, exception document, a declared flow's cited basis) and analysis (amounts, thresholds, cardinality) meet; the declared flow is a group-authored "ought" standing in for law, and the law itself is not an object
- **Evidence:** CF §8.2 src 834–968; M2 (progressions): investigative "overdue" over declared procedural flows (minutes after a meeting; award → contract → payments) with calendar-only intervals, no link to jurisdictions' holidays or deadline rules or to the law that prescribes the flow; its deferred junction checks are where amounts as values meet contracts, awards and obligations
- **Reported by:** C3 (x117); M2 (x589)
- **Constructs joined:** TIME, ORG, LAW, ANALYSIS

### X56 · Out-of-order detection is blocked on extracting a document's own date, a content/extraction capability (layer 4) that time depends on
- **Evidence:** CF §8.2 src 965–967
- **Reported by:** C3 (x118); M2 (x591)
- **Constructs joined:** TIME, ANALYSIS

### X57 · An action's overdue is already derived on read in `op=projection`; whether that derivation lives in `action-clocks` (layer 9) and what an inquiry-time caller could reuse is to be checked
- **Evidence:** IS src 685–686
- **Reported by:** C5 (x165)
- **Constructs joined:** TIME

### X58 · The scheduler is not the bottleneck for time: its single reconciling alarm already hosts deadline-recheck, overdue-scan, notice-sweep, intent-age, calibration-reprobe and bias-debt, and any deadline monitoring, recurring meeting or limitation-window watch must join as a consumer, not a cron; what is missing is time SEMANTICS (business days, holidays, local zone, fiscal periods), not the trigger
- **Evidence:** IS §14b.3 (src 1507–1510, `#schedConsumers`); SCHEDULER L115–119 (layer 10, fed by modules in total order)
- **Reported by:** C5 (x174); C8 (x262)
- **Constructs joined:** TIME

### X59 · Search is over live rows: time questions such as "what did this page say in March" depend on the document-version chain, not the text index
- **Evidence:** RETRIEVAL-PROBE (src 181–184); RETRIEVAL-SUBSTRATE; D-220 (`op=versionchain`); CSD L181 (the index holds only the current chain)
- **Reported by:** C5 (x185)
- **Constructs joined:** TIME, QUESTIONS, LAW

### X60 · Time is fragmented: at least six deadline designs with no stated relation (the profile deadline grammar and holidays in `jurisdictions`, layer 1; `actions` clocks with derived overdue, `filings/dates.mjs` and `standards.inForce`, layer 9; progressions' intervals with the scheduler's overdue-scan, layer 5; `monitoring.deadlineRecheck`, never called) plus plan checkpoints; business-day arithmetic exists only in filings while the only overdue consumer serves progressions; stored vs derived clock status is an unresolved canon conflict and code does both
- **Evidence:** INVENTORY lines 35, 59, 61, 68; canon-constructs lines 106–112, 156; build-state lines 326, 358; NOTIFICATIONS line 4; code lines 98, 109, 152, 228; D-86 ("two schedulers would be two sets of bugs about one thing", canon-constructs line 109); M2: three places that do not share a clock — docprofile (meeting dates, minutes `expected_by`, UTC, assess-only), progressions (declared `within`, calendar UTC, anchored on capture time), action-clocks (statutory deadlines, business days, per-office holidays, UTC years); none reads the profile's `time_zone` and none takes a document's own date from its text
- **Reported by:** C9 (x272, x283, x299, x316, x317); M2 (x591)
- **Constructs joined:** TIME, LAW, ORG
- **Notes:** Doctrine pulls toward one engine while requiring two kinds of time never mixed: our intentions vs a body's or the law's dates (ACTION-PLAN A10; DEC-107 "our plan's checkpoint" / "the city's deadline"). Doctrine: D245.

### X61 · Time answers only on demand: the MATRIX "Track" column is uniformly "Wiring" (derived when read, never pushed); the overdue mark is never computed in production, the queue has no kind for it and the scheduler does not reach layer 9; the remedy is spread across `monitoring`, `scheduler`, `queue` and profile holidays and deadlines
- **Evidence:** MATRIX (Track column); build-state lines 370–378
- **Reported by:** C9 (x285, x295)
- **Constructs joined:** TIME, QUESTIONS

### X62 · The only time notifications in the catalogue ("overdue required successor", "temporal expectation coming due") are findings about bodies' declared obligations (progressions); action-clock and plan-checkpoint items are absent from it
- **Evidence:** NOTIFICATIONS; canon-constructs line 117
- **Reported by:** C9 (x303, x324)
- **Constructs joined:** TIME, ORG

### X63 · Progressions are an existing time-and-organisation primitive the gap list does not mention: "Declare an expected flow" (OBLIGATION as declared flow, D-128) and missing predecessors / overdue successors are covered in layer 5, and monitoring offers a "per meeting" cadence, yet the journeys say there is no model of a recurring meeting; whether progressions plus monitoring cadence are the base for meetings, notice rules and recurring obligations is to be checked
- **Evidence:** UC-024; UC-080 (progressions R1–R25); UC-031; design-journeys §6; D2: the only recurrence is monitoring cadence (SR L2007–2016); meetings appear only as examples (a special meeting that may trigger open-meeting notice law, VF L22; a council-meeting video, VM L61); design HANDOFF L68 confirms "no recurring-meeting model"; M4: `per_meeting` cadence is unschedulable because "This plane does not hold" a body's meeting schedule
- **Reported by:** D1 (x333, x361); D2 (x537); M4 (x615)
- **Constructs joined:** TIME, ORG, LAW
- **Notes:** D2: notice rules would join time (notice periods), law (open-meeting law) and organisations (the body that meets).

### X64 · Time in layer 6 is provenance-time and record-time (pins to captures, frozen versions, append-only stances, leases, 24 h request expiry, `observed_at`); recheck triggers are the inquiry's only forward-looking date and are inert; a time construct (as-of, effective dates, deadlines) would attach to recheck triggers, the `time_or_occasion` coordinate and the pinned capture's date
- **Evidence:** M3 (inquiry, basis-versions, capture-requests)
- **Reported by:** M3 (x609)
- **Constructs joined:** TIME, LAW

### X65 · The scheduler's rank ties work order to intent (objective gap → aspiration → longest-waiting, never starving) and monitoring ties watched sources to live objectives and published findings, but a legal deadline does not raise a source's watch frequency by itself: a member must type `legal_deadline_approaching`
- **Evidence:** scheduler R10; intent R28; monitoring R33, R52
- **Reported by:** M4 (x622)
- **Constructs joined:** TIME, ORG, QUESTIONS, LAW

### X66 · The interface layer already carries time- and law-driven work (queue kinds action-clock-overdue, action-reminder, local-fact-due, plan-checkpoint-due, escalation-stage-proposed, litigation-hold) produced in layer 9, all about the group's own action after publication; the queue has no kind for a public body's duty or a statutory deadline arising during investigation
- **Evidence:** queue; action-clocks; local-facts; action-plans; escalation; actions (M5)
- **Reported by:** M5 (x628)
- **Constructs joined:** TIME, LAW, ORG

## Law across constructs

### X67 · The law need in the observation-log and architecture files is a reverse index ("every document that concerns this ordinance", the largest manual job the framework can remove), depending on the entity axis, the subject registry and `proposes_amendment_to`; no structure for law (sections, versions in force, cross-references) is offered and a statute is only a cited leaf
- **Evidence:** CON Step 4; FW-6; TAD ("You do not re-derive a primary source")
- **Reported by:** C10 (x23)
- **Constructs joined:** LAW, ORG, QUESTIONS

### X68 · Content extents are a precondition for law and courts at depth: a provision, definition, cross-reference target or paragraph of an order can be cited, connected or reasoned over only once a content extent is addressable
- **Evidence:** DEC-23 (ruled, parked D-164 in this half)
- **Reported by:** C11 (x47)
- **Constructs joined:** LAW, COURTS, QUESTIONS

### X69 · DEC-54 is the strongest ruled template for law and time-versioned standards: the machine reads a rulebook, splits what GATES from what is DISCLOSED, publishes what it cannot mechanise as prominently as what it enforces, proposes for adoption, pins source, retrieval date and hash, and the case names the version it was held to; the bar already gates at inquiry pre-flight (layer 6)
- **Evidence:** DEC-54 (countable/uncountable warning: 4 of 5 verification failures had countable rules satisfied); IS §13 (src 1169–1173: pinned at publication, layer 8, not available to the session); `BELOW_PROJECT_STRENGTH`
- **Reported by:** C12 (x57); C5 (x169)
- **Constructs joined:** LAW, TIME, ANALYSIS
- **Notes:** Doctrine: D16, D85, D264.

### X70 · The CCCER finding form (Criteria = law/standard, Condition = act, Cause, Effect, Recommendation) joins law, the acting organisation and effect quantification in one published form; CAUSE has no requirement
- **Evidence:** DEC-77.2; DEC-84.10; canon-mission line 170 (DEC-77 item 2: the GAGAS audit-standard structure for "an obligation-against-act finding", tying criteria, a body's obligation, measured effect and condition at a date); surface rules L1640, L2636 ("Cause (only when evidenced, else 'cause not established')"); DEC-84 (10); principles L20 (members include auditors, accountants, lawyers)
- **Reported by:** C2 (x98); C9 (x310); D2 (x534)
- **Constructs joined:** LAW, ORG, ANALYSIS
- **Notes:** D2: the form needs a standard (criteria), an office (against whom), a measured condition and a quantified effect, and audit sources (the quasi-judicial side of courts).

### X71 · Law is an entity kind (a Subject may be "a person in a public role, office, place, law or thing"), so organisations and law share `entities` (layer 5) while law's structure lives in `standards` (layer 9)
- **Evidence:** DEC-114
- **Reported by:** C2 (x102)
- **Constructs joined:** LAW, ORG

### X72 · The content framework's whole support for explaining a provision and versions in force is generic: explanation ("what an archaic term means") sits on the derived, graded MEANING axis, and an amended document is a new capture re-anchored by machine proposal and member acceptance
- **Evidence:** CF §14.2/§14.4 src 1838–1862, 1941–1948
- **Reported by:** C3 (x125)
- **Constructs joined:** LAW, TIME, QUESTIONS

### X73 · Bob's version doctrine (pin, notify when affected, member ADOPT/KEEP) is the time mechanism law most needs (a cited code section amended), generic over reference kinds, but it works per document ADDRESS, so a law re-enacted or recodified at a new address is outside it
- **Evidence:** CF §18.1 src 2514–2529; CF §11 (regulation superseded at a different URL)
- **Reported by:** C3 (x129)
- **Constructs joined:** LAW, TIME

### X74 · Legal rules are held by neither the assistant nor the plane: the assistant "holds no copy of the rules" and the plane "encodes no law's rules", so law exists only as member-stated citations and captured documents; richer law support must decide where rules live without breaking both statements
- **Evidence:** IC §P (IC 575); CM 235; D-149; AIR §1
- **Reported by:** C4 (x153); C9 (x300)
- **Constructs joined:** LAW, QUESTIONS, TIME

### X75 · Law has a recogniser, not a model: the `regulation` content type is registered, ordinances and resolutions rank third in the census, monitoring can notice a legislation page or an item's status changing, and a document citing an ordinance is not one; nothing covers structure, definitions, cross-references, amendments, versions in force or hierarchy, and the index holds only the current chain
- **Evidence:** DP L14, L184, L208; CSD L181
- **Reported by:** C8 (x257, x258, x259, x260)
- **Constructs joined:** LAW, TIME

### X76 · `standards` is the one place law, time and organisation level meet (a period in force, `inForce(id, date)` with `undetermined`, issuer and level, instance-wide outside any project), and a court decision or order is a standard of kind `court` (measured against, not modelled as a case); but it sits in layer 9
- **Evidence:** build-state lines 35–49
- **Reported by:** C9 (x289, x297)
- **Constructs joined:** LAW, TIME, ORG, COURTS

### X77 · Bob's definition of nonconformity spans law broadly ("law, policies, regulations, stated intentions/promises, or other restrictions") and organisations beyond government ("or action by some other person or organization"), a wider subject than the built conformance act (actor = an office `{role, body}`)
- **Evidence:** canon-mission line 90
- **Reported by:** C9 (x306)
- **Constructs joined:** LAW, ORG

### X78 · Two law-level vocabularies exist in code: `actions` uses federal/state/local and `jurisdictions` federal/state/county/city
- **Evidence:** code line 127
- **Reported by:** C9 (x315)
- **Constructs joined:** LAW, ORG

### X79 · Extraction (layer 4) is where the AI's EXTRACT meets grading (proposals capped at B, graded by computation), and its R52 is the only place agenda structure (meetings) is tied to the legislative file (law); it waits on profile data (N96)
- **Evidence:** extraction R52, N96
- **Reported by:** M2 (x585)
- **Constructs joined:** LAW, TIME, QUESTIONS

## Organisations, entities and relations

### X80 · Relationship doctrine for organisations is consistent: a richer organisation and relationship model must carry a grade per edge, an author class per edge and a visible undetermined state; the entity read is instance-wide and unfenced (open ruling), so exposing an organisation graph is an open disclosure question
- **Evidence:** CON (`asserted_by` has three authors; declared relations constitutive and outside the grade); PS (grade travels with the edge; no centrality); TAD (agent-proposed, human-decided); OLD (entity read open ruling)
- **Reported by:** C10 (x30); C4 (x155)
- **Constructs joined:** ORG, QUESTIONS, ANALYSIS

### X81 · Edit instants by named people or offices, aggregated across documents, are evidence of departmental conduct, which presupposes knowing which office a person belongs to and what an office has business in (remit), a relation kind the entity registry does not yet name
- **Evidence:** DEC-5; DEC-6
- **Reported by:** C11 (x35)
- **Constructs joined:** TIME, ORG, ANALYSIS

### X82 · Organisation modelling bounds case strength: an earned connection grade is a resolution of a capture to the inquiry's subject entity, so weak organisation modelling means no earned grades above testimony
- **Evidence:** DEC-15
- **Reported by:** C11 (x42)
- **Constructs joined:** ORG, ANALYSIS, COURTS

### X83 · The basis DAG's depth bound with undetermined on exhaustion is the built pattern any walk over organisation relations or legal cross-references would inherit
- **Evidence:** DEC-16 (R3 depth bound)
- **Reported by:** C11 (x44)
- **Constructs joined:** ORG, LAW, QUESTIONS

### X84 · Connections are entity co-reference edges; typed organisational relations (reports to, owes, appointed by) would be a different kind of edge with no grade rule
- **Evidence:** DEC-21
- **Reported by:** C11 (x49)
- **Constructs joined:** ORG, LAW

### X85 · The only link from Action's organisations to `entities` is an optional `entity_id?` on an office addressee
- **Evidence:** action-design deltas R9, L13; build-state lines 179, 319 (counterparty's optional `entity_id`, a seam where an organisations model could attach)
- **Reported by:** C13 (x84); C9 (x292, x296)
- **Constructs joined:** ORG, LAW

### X86 · The public body is the organising key of the inter-group directory (filed under the body examined and shown on every place page it touches), so organisations are needed outward too, with a body ↔ place relation and time windows
- **Evidence:** DEC-111 (13-week windows, monthly re-signing, sealed weekly timestamps); Publication: the subject's "party-like standing" and its responses and press releases on the docket (DEC-100, Pub L415–419); "working on" notices naming "the public body and the matter" (DEC-111); standing watches over "a city's press page, council agendas" (Pub L421); the Legistar chain (Int L705–707); Pub's only modelled organisation identity is the GROUP's own (slug, display name, verified domain, Pub L663–664)
- **Reported by:** C2 (x100); C6 (x195)
- **Constructs joined:** ORG, TIME, COURTS
- **Notes:** Each ruled-but-unbuilt publication feature presupposes a stable identification of public bodies.

### X87 · Private-individual protections recur (sources' disclosure histories with consent, a reply naming a private person not published, `entitycreate` a heavy act, handles not legal names), so an organisation construct modelling holders of positions over time must keep public-role persons distinct from private persons
- **Evidence:** DEC-78.5; DEC-116.4; DEC-88; DEC-102; Design Requirement 6 (audiences L1259: accountability "belongs to the role and institution"; individuals named "only in official capacity in connection with specific documented acts"); actions R9 (ADDRESSEE_REFUSED); consequences R10; UC-018 (no adversarial attribute)
- **Reported by:** C2 (x108); C9 (x280); D1 (x357)
- **Constructs joined:** ORG, QUESTIONS, COURTS
- **Notes:** D1: any office-holder-over-time model must stay role-centred under these rules. Doctrine: D156, D176, D163, D173.

### X88 · ENTITY spans organisations (body, person), law (ordinance, contract) and analysis (fund, parcel) in one undifferentiated type resolved across documents with a grade
- **Evidence:** CF §3 src 404–409; DEC-114
- **Reported by:** C3 (x115)
- **Constructs joined:** ORG, LAW, ANALYSIS

### X89 · Two kinds of organisational relation exist: DECLARED relations in the subject registry (`proxy_for`, `member_of`, `overlaps`) are constitutive and outside the A–D grade, while source-evidenced relations (`serves_on`, `held_by`) are graded connections; there is no vocabulary for reporting lines, responsibility, holder-of-office over time or obligation between bodies
- **Evidence:** CF §13 src 1456–1486; CF §8; DB 218–223 (D-83); CM 339–342; DB 232–235; entities R26; DB safeguard 4; M5: `entity_kinds` include ordinance, contract, body and office, but `relation_kinds` has three values and no relation links an entity to a standard, an office to a holder over time, or a body to an obligation
- **Reported by:** C3 (x121); C4 (x155); M5 (x630)
- **Constructs joined:** ORG, LAW

### X90 · Which laws govern depends on the agency (federal, state, local), but the plane has no agency → law map and matches counterparties by exact name string, so the organisation–law link is member-stated per action
- **Evidence:** CM §2 D-148/D-149 (CM 221–243); canon-constructs line 90 (LAW applicability "following the AGENCY ASKED"; "The plane encodes no law's rules: fees, clocks, appeals")
- **Reported by:** C4 (x138); C9 (x300)
- **Constructs joined:** ORG, LAW

### X91 · Bob refused typed evidential relationships (supports/undercuts/rebuts) in favour of AI-composed legs over a simple calculation: the precedent concerns evidence-to-claim relations, not entity relations, but shows a preference for intelligence in composition over a rich relationship calculus
- **Evidence:** IS §5 (src 357–381); DEC-60 ("the intelligence goes into how the legs are formed and weighted, never into relationships the record computes over")
- **Reported by:** C5 (x162)
- **Constructs joined:** ORG, LAW, ANALYSIS

### X92 · DEC-52 is the doctrinal route by which an AI could populate an organisations graph (bodies, positions, relations) from documents: entity, alias and relation acts are machine-writable and machine-attributed (sidebar review, not a gate), provided acts are attributed and the inquiry's no-AI-accept fence is untouched; design documents still carry the superseded text
- **Evidence:** IS §14a BOB-4/DEC-52 (src 1346–1360), §19 (src 1820–1822); FINDINGS-WORKPLAN (src 121–130; F9)
- **Reported by:** C5 (x172, x176, x184)
- **Constructs joined:** ORG, QUESTIONS

### X93 · "Authority" (the body that issued a document) is a free-text, caller-assigned, three-valued string with mechanical determination absent; its examples are public bodies and vendors acting for them, so an organisation model (bodies, vendors, offices) is its natural referent; legal authority ("under what authority an obligation exists") is a different, absent sense
- **Evidence:** Intake §2 (L237–238); A&T (L9, L45–49, L66, L93, L101–108, L249–256); SOURCE-ACCESS L113–119 (Akamai acting for oaklandca.gov)
- **Reported by:** C6 (x189)
- **Constructs joined:** ORG, LAW

### X94 · Any new relation kind (obligation, reporting line, amends, in force, party to, appeal of) is a spec revision because the checker rejects unknown values, and two rules bind any walk: the cascade moves one hop with no forced transitive walk, and derived reverse edges must be filtered by the viewer's position, plus the "never traversed" rule
- **Evidence:** SR §5.1, §5.2, §5.4 (src 1018–1056); MA §7.9/§11.1; entities R26
- **Reported by:** C7 (x204, x221)
- **Constructs joined:** ORG, LAW, COURTS, TIME
- **Notes:** Doctrine: D189, D191, D147, D178, D179.

### X95 · Two worked templates exist for positions versus holders over time: Membership (office separate from person; roles held by handles; votes with deciders and reason; dated append-only settings, latest current; one row per claim per member with declare/confirm/withdraw timestamps) and `sources` (a dated, evidenced, append-only disclosure history; an attribute `occupation, employer, role`; claims that never merge; an as-of read `publishableAt({at})`; the source as it stood at capture beside the current history); entities offer only `proxy_for`, `member_of` and `overlaps`
- **Evidence:** MA §7.14, §10, §9; BOB #35 (`invited_by` its own fact); sources R1–R9 (M4; scoped to protecting private sources)
- **Reported by:** C7 (x205); M4 (x616)
- **Constructs joined:** ORG, TIME
- **Notes:** Doctrine: D163, D176.

### X96 · Stated vs built relation vocabulary: the built vocabulary adds `links_to` (a source-asserted relation, absent from State Rules) and `responds_to`; `action_basis` is built as a frontmatter leg list, not a §5.1 edge; the amendment's `references` is not in `REL_VOCAB`; `REL-` ids are allocated in `entities`
- **Evidence:** `bio-plane/src/record-grammar/bundle.mjs:416`; `action-grammar/grammar.mjs:141`; `entities/index.mjs:396` (C7 code check)
- **Reported by:** C7 (x211)
- **Constructs joined:** ORG, LAW

### X97 · Organisation knowledge is document-borne and weakly typed: bodies appear as `body:<name>` from calendars with `renamed` notices, staff from directories only where emails share a domain, org charts and rosters fall to `generic`, and staff names in office metadata sit in the D-77/invariant-7 neighbourhood; no position-versus-holder, reporting line or responsibility appears
- **Evidence:** DP L16–17; OFFICE-FORMATS L157–160; SCH L175 ("OBLIGATION" = a member's queue item)
- **Reported by:** C8 (x253, x254, x255, x256)
- **Constructs joined:** ORG, TIME

### X98 · Built organisation data is flat and exists to address mail: profile `counterparties {role, body, level, elected, oversight?, basis}` and `legal_organisations {name, evaluates, contacts}`, the conformance act's `actor {role, body}`, consequences' affected kind `body`; auditors, grand jury and State Controller exist only as offices; non-government addressees are still only addressees; no relations among bodies, reporting lines or positions-versus-holders, and the Roadmap's protection network is prose only
- **Evidence:** build-state lines 24, 82, 120, 179, 319, 357; canon-mission lines 38, 61, 156; D1, D4; Requirement 6
- **Reported by:** C9 (x273, x280, x282, x286, x296, x307)
- **Constructs joined:** ORG, LAW

### X99 · Organisations live in two unconnected places: the entity registry (layer 5, member-filled: offices, funds, programs, people-in-role with aliases and cited relations, only three relations, no "reports to" or "contracts with", no record of who held a role when) and the jurisdiction profile (counterparties by role and body, action kinds and tiers available against an office, venues and legal organisations, each venue's evidentiary standard); contracts and franchises need organisation obligations, contract terms as standards and deadlines together, and nothing joins them
- **Evidence:** UC-018, UC-019, UC-160; design-journeys §6 L533, §3 L98, L110 ("Is the hauler delivering what the franchise requires, and is the city enforcing it?"); journeyExperience (c), (k); UC-117; UC-169
- **Reported by:** D1 (x334, x335, x336, x337)
- **Constructs joined:** ORG, LAW, TIME
- **Notes:** Doctrine: D178, D196.

### X100 · The doctrine is role, never person, yet the designs need office holders over time: "a public statement by an office holder" recorded as pressure, and a plan check for "a lobbying option whose target is superseded"; there is "no holder-of-role over time"
- **Evidence:** brand L136; surface rules L1660, L1712, L1727, L3020, L3390; view matter-page L33, L61; design HANDOFF L69 (second-hand); actions R9
- **Reported by:** D2 (x536)
- **Constructs joined:** ORG, TIME, LAW

### X101 · Organisations run through law, time and courts: the office `{role, body}` text pair (optionally beside profile `counterparties` or an `entity_id`) is the actor of an act (conformance), the addressee (actions R9), an affected party (consequences), the key for holidays and hours (local-facts R6, action-clocks R10), the holder of the `elected` and `oversight` flags (escalation R12) and the target of available actions (filings R15), so a richer organisation model would be read by six of the eleven layer-9 modules at once
- **Evidence:** M1 (layer-9 requirements)
- **Reported by:** M1 (x561, x562, x563, x564, x565, x566, x567, x569)
- **Constructs joined:** ORG, LAW, TIME, COURTS

### X102 · `entities` is the only organisations store and is shared with Declared Bias's subject registry: Bob's traversable lines of responsibility are exactly what entities R26 forbids for its constitutive relations, so a separate evidentiary relation type (graded, cited, time-bounded) is needed rather than a widening of the three constitutive kinds; placed in layer 5 it would keep R26 and connections R34 intact and be usable by inquiry and the assistant
- **Evidence:** entities R26; connections R34; the registry's ten kinds and three relations
- **Reported by:** M2 (x587, x592)
- **Constructs joined:** ORG, LAW, TIME, QUESTIONS
- **Notes:** Doctrine: D178, D186, D195, D135.

### X103 · `connections` joins organisations to evidence (any two documents naming one office are connected) but never through a declared relation, and only for the first 32–100 documents per entity; agenda→file containment is the only machine-derived legislative-history link, and docprofile's temporal "expected by" connections have no home there
- **Evidence:** connections R34
- **Reported by:** M2 (x588)
- **Constructs joined:** ORG, LAW, TIME, ANALYSIS

## Courts

### X104 · COURTS has no object of its own: courts enter as a kind of Standard (court decision or order), a venue setting the evidence standard, risk tiers keyed to precedent risk, outcome words on correspondence and sources to discover, while the mission needs dockets, parties, long-running consent decrees, settlements, grand-jury powers, audit opinions and recalls
- **Evidence:** AC L20, rule 13, §5 row 7; DR §8; FA L132–133; RM §1, App A/B; C9: a standard kind `court` (build-state line 49), a venue `court` (line 325), correspondence stages `court_filing`/`court_decision`/`appeal_decision` (code line 125), Tier 2/3 profile kinds (records_petition, taxpayer_action, consent_decree_motion, constitutional_claim; code lines 252–258), the counsel packet with "a chronology" and "the claim deadlines" (line 205), the DEC-61 hold; no court case, docket, party, order or judgment is a record; D1: no use case, experience journey or audience follows a court case or administrative proceeding; courts appear only as places the group's own action goes (Tier 1–2 filings, Tier 3 counsel packet, venue standards, stage 7 oversight bodies, AI-proposed legal theories UC-116); journeys §3 L106, L111 add court cases and regulatory proceedings as front doors, supported only by capturing filings and watching a docket page; §6 "Following a court case": "Nothing tracks a case's filings, rulings and appeals, or links a decision to the rule it interprets."; M5: courts appear only as correspondence stages and a litigation hold; docket and case-import must not be counted as court support
- **Reported by:** C1 (x11); C9 (x274, x288, x297); D1 (x343); M5 (x631)
- **Constructs joined:** COURTS, LAW, ORG
- **Notes:** D1: the last clause ties courts to law through interpretation of a provision. Doctrine: D321, D313.

### X105 · Court vocabulary meets the grade system only through standards of proof ("beyond a reasonable doubt", "convincing") left to the group, and the venue's evidence standard joining capture grades (layer 3) to court rules held as profile words
- **Evidence:** DEC-17; action-design deltas R48, R39; DEC-105 (Pub L730–736: audience standards "a sourced fact in the jurisdiction profile", on the form ruled for legal venues K597 (3), K600 (b)); DEC-81/Action §4 rule 13 ("the venue sets the standard of evidence"; Grade A only a ceiling, Int L6, L344–348); OQ-22 (no catalogue of what grade a court, auditor or journalist expects; jurisdictions R39 drafts "the venue's standard")
- **Reported by:** C11 (x46); C13 (x83); C6 (x191); C9 (x304)
- **Constructs joined:** COURTS, ANALYSIS, LAW

### X106 · The group itself is a potential litigant (subpoena, spoliation, hold), so the product must know when the group is "on notice" (a court/time fact about the group), and a litigation hold joins courts, retention time and assistant transcripts as held material
- **Evidence:** DEC-61; DEC-113; IS §14a (src 1299–1311: the group's own legal threat recorded on a reply; scheduled deletion, TTL, one-week archive clearing); canon-mission line 151 (being "on notice" changes retention rules and needs a recorded legal-notice state)
- **Reported by:** C12 (x62); C2 (x103); C5 (x171); C9 (x312)
- **Constructs joined:** COURTS, TIME, QUESTIONS

### X107 · The profile models a court only as a filing venue: its departments, clerk's offices and channels are flattened into a `closed_note` string
- **Evidence:** research-oakland-calendar L227–229
- **Reported by:** C13 (x69)
- **Constructs joined:** COURTS, ORG, TIME

### X108 · The product approaches courts from the group's own action side, not as a model of proceedings: Tier 3 matters go to counsel via briefings; legal use needs Grade A (deferred); corroboration to journalistic and legal standards is owed; venue standards of proof are future profile facts; litigation hold is ruled; filing drafts and counsel packets bind the redesign
- **Evidence:** K921/K924 (L182, L195); DEC-81; DEC-102; DEC-105; DEC-113; DEC-115; D2: a matter goes to a Tier 1 complaint, a Tier 2 filing draft or a Tier 3 counsel packet with "chronology" and "deadlines that bind a claim" (VF L45–50), then the member sends by the venue's own means (SR L3368; VS L62); nothing follows a proceeding after filing; Bob's reference point is regulatory proceedings ("the CPUC especially", HO L18), which have no surface; the only timelines are the counsel packet's chronology and the contradiction inquiry's "timeline for a reversal" (SR L667)
- **Reported by:** C13 (x74); C2 (x110); D2 (x539)
- **Constructs joined:** COURTS, LAW

### X109 · The precedent rationale is a courts reason for an action-layer rule: Tier 3 actions get no filing templates because a loss on the merits could create adverse precedent, and the published classification is meant as evidence in a later court's preclusion analysis; supporting it needs remedies, venues and with/without-prejudice facts per jurisdiction, which would be profile data
- **Evidence:** Communications Platforms L288–324; Publication §8 L753; DEC-105
- **Reported by:** C6 (x192)
- **Constructs joined:** COURTS, LAW

### X110 · Courts are absent from the extraction and scheduler documents, and the sovereignty rule ("never a vendor key and never a second account", Free tier) constrains any court-docket or legal-database integration (an inference to weigh against SOURCE-ACCESS)
- **Evidence:** SCHEDULER; DEC-35; D-115
- **Reported by:** C8 (x261)
- **Constructs joined:** COURTS, LAW

### X111 · The only docket in the modules is the publication docket of cases (the group's own and other groups'); its move stream (seq, date, kind, verified, never evidence) is the nearest existing shape for court dockets, which no module models
- **Evidence:** reevaluation R30, R33; monitoring R67
- **Reported by:** M4 (x621)
- **Constructs joined:** COURTS, TIME

## Analysis across constructs

### X112 · Analysis sits between extraction and law: cross-source reconciliation, trends over fiscal years and the size of a breach, over a substrate with cell-level citation, bounded by doctrine (grades never compose across scales; no score or significance; costs-nothing; reproducible method; charts carry the narrative in print)
- **Evidence:** FA L271–276, L156–163; RM §1; AC L22 (Consequence "computed from the record"), rule 3; SD row 4/5, §1, §4; MS M2 ("Sheet1!B14"), M9; DR §6; UK
- **Reported by:** C1 (x12)
- **Constructs joined:** ANALYSIS, LAW, TIME

### X113 · The retired substrate's spreadsheet and Python decisions do not carry over: spreadsheets appear only as an output surface, the budget/dataset content type is still owed, the built compute envelope (Workers Paid, subrequest ceiling, wall-clock/CPU termination) bounds in-code analysis, and nothing designs where spreadsheet-scale analysis would run
- **Evidence:** TAD §8.3, §9, §10.7 and header; CON (budget-or-dataset OWED); DIST (Workers Paid; subrequest ceiling 10000); PS V10 (ceilings shown as status)
- **Reported by:** C10 (x24)
- **Constructs joined:** ANALYSIS

### X114 · Counting is a disclosure and a signed claim: a count discloses existence, a hidden project's run output is dropped from tallies, a signed completeness number must be viewer-independent, "zero of zero is not 100%", and numbers are capped at `partial` with `unidentified` published; any aggregate, percentage or trend feature must decide its fencing and whether a signed artifact consumes it
- **Evidence:** OLD (BOB #15; BOB #32; REC-110); PS V3, V4, V6 (SK-3 built); MA (BOB #15/#16; D-464 counts through the viewer's predicate; D-447 "an ORDER, never a score"; D-479/D-480 a bounded read publishes its bound and a measured `truncated` — "the BOUND is an answer"; D-158, M-68 `undetermined` a literal answer)
- **Reported by:** C10 (x25); C7 (x206)
- **Constructs joined:** ANALYSIS, QUESTIONS
- **Notes:** C7: any aggregate a member or AI run is shown (budget totals, counts of filings, chronologies) must be computed through `viewerPredicate`/`hiddenSets` and state its bound. Doctrine: D136, D147, D144, D146.

### X115 · Any figure is bounded by its capture: a number extracted from an image is bounded by transcription fidelity (only member attestation of the cited region lifts it), PDF tables lose cell boundaries and OCR digits carry only agreement, so a derived number from a scanned or PDF financial table inherits an undetermined or capped grade
- **Evidence:** DEC-4; CF §16 src 2195–2197, 2241–2249; CF §14.2 (weakest link)
- **Reported by:** C11 (x34); C3 (x128)
- **Constructs joined:** ANALYSIS, LAW

### X116 · A calculation construct would plug into the existing grade arithmetic and must say which axis its output's grade falls on and how its inputs' grades compose (two axes, weakest link over load-bearing legs, ungraded legs inert and named, all-ungraded UNRATED, absent bar undetermined, cycles refused, depth-bounded)
- **Evidence:** DEC-17; DEC-18; CM §R1–R2 (CM 1169–1294)
- **Reported by:** C11 (x45); C4 (x145)
- **Constructs joined:** ANALYSIS

### X117 · A coherent number doctrine binds any derived value: numbers come from measurement, never a surface; the bound and "what it examined and out of what" are stated; a strength carries the state set and filter that produced it, stated in-band; what-if values are never record values; no single aggregate; OCR digit fidelity is the floor; confidence is never self-reported; a negative result prints its reach; AND-min/OR-max grading; never a significance rank; recreatable from the case file
- **Evidence:** DEC-58, DEC-64, DEC-57, DEC-60, DEC-44, DEC-35/42, DEC-65 (PL-20), DEC-32, DEC-104, DEC-53, DEC-75, DEC-82, DEC-92, DEC-111, DEC-89, DEC-112; DEC-40; IS §12 (src 1123–1132); MKD §5 (a count subtracts hidden projects and leads); EBD §5.2 (one name, one quantity; a same-named field counting different things is a false comparison); CSD UI-62 (no proportions over a sample; denominator named in the heading; SAMPLE stated); CSD D-391 (give a range when inputs disagree); CSD REC-115
- **Reported by:** C12 (x59); C2 (x107); C5 (x170); C8 (x243, x244, x245, x246, x247, x248)
- **Constructs joined:** ANALYSIS, QUESTIONS
- **Notes:** Doctrine: D65, D90, D94, D78, D132.

### X118 · The independence check on OR-branches is a provenance-derived relation between sources (shared upstream origin) that informs grade and depends on knowing which bodies or pipelines produced the evidence
- **Evidence:** DEC-32 (src 692–703, D-195)
- **Reported by:** C2 (x95); M3 (x608)
- **Constructs joined:** ANALYSIS, ORG
- **Notes:** M3 (inferred): strength's independence test (shared document, capture or address) is blind to an organisational common source; an organisations model (same issuing body or official) could feed independence, a doctrine-level change to DEC-32 arithmetic.

### X119 · Reproducibility: the method and checks version travel inside the signed case and a standalone checker recreates results, so any derived number in a case must be re-runnable from the case file without the product
- **Evidence:** DEC-112; Pub §5C L399–408 (grade recomputed by hand; open spec and standalone checker; import recomputes each grade: Recreated / in part / Did not recreate); rule 17 (D-470, check catalogue versioned); rule 16 (renderings verified by pixels)
- **Reported by:** C2 (x101); C6 (x193)
- **Constructs joined:** ANALYSIS, COURTS
- **Notes:** C6: any calculation, dataset filter or chart a case relies on must meet the same bar (method versioned, inputs whole and fingerprinted, recomputable outside the product). The founding evidence is financial (sewer-fund transfers across auditor report, fund statements, budget, OpenGov), yet Intake's only analysis constructs are the fact/analysis/judgment classification and "the normalized dataset with its content hash"; extraction and normalisation standards per document type are not yet forced, and "Accuracy and credence are separate questions the catalog does not yet model". Doctrine: D304, D202.

### X120 · The satisfaction condition is the framework's only design for member-defined computation over progressions and funds, and it is deferred behind the intent-layer trigger
- **Evidence:** CF §12 src 1199–1216 (Incomplete §12)
- **Reported by:** C3 (x120)
- **Constructs joined:** ANALYSIS, TIME, ORG

### X121 · The measurable form (a proportion, "21 days after the meeting", "since 2024-01", a committee as registry entry, a registry-defined denominator reported whichever way it cuts) is the clearest worked example of lateness and patterns in the canon, and it is deferred
- **Evidence:** CF §13.1 src 1558–1567
- **Reported by:** C3 (x123)
- **Constructs joined:** ANALYSIS, TIME, ORG

### X122 · No file provides calculation over datasets: the computations present are strength arithmetic, governance ballots, elapsed days on a request chain, the minted-to-cited ratio and the acceptance-rate guard; the only analysis-facing machine role ("a proposed table structure") is unbuilt
- **Evidence:** IC 367–370; CM 256–263, 327–329, 884, 1095 (resources carry "no arithmetic"), 1256–1289; AIR 84, 139, 145; IC 657–659
- **Reported by:** C4 (x150, x156)
- **Constructs joined:** ANALYSIS, QUESTIONS

### X123 · Analysis and time share the selection mechanism: a server-side snapshot with a published lease term holds a stable set for an act, and a reproducible calculation over a selection (count, total, trend) needs the same stability guarantee and must state the set it ran over
- **Evidence:** RETRIEVAL-SUBSTRATE (src 246–249, 362–392); SR §4.1 (three-layer snapshot keyed to a stable query definition)
- **Reported by:** C5 (x180)
- **Constructs joined:** ANALYSIS, TIME, QUESTIONS

### X124 · Numeric precision (summary vs table) is a contradiction-detection input; a typed number/figure model would let `precision` be decided partly in code
- **Evidence:** CONTRADICTION-IDENTIFY §1/§7 (src 36–37, 129–131)
- **Reported by:** C5 (x183)
- **Constructs joined:** ANALYSIS

### X125 · Reproducibility of a derived number has a basis (the citation register with claim, cites, snapshot, hash, as_of; the snapshot keyed to a stable query definition with the normalised dataset hashed; an export that trusts nothing the sender asserts) but no record of the calculation itself (inputs, code or formula, result, grade)
- **Evidence:** SR §4.1, §4.5 (`data/citations.json`); MA §8; DEC-20 ("a hunch inflates a GRADE"); MA §4.10 (calibration "may never move a GRADE")
- **Reported by:** C7 (x207)
- **Constructs joined:** ANALYSIS

### X126 · Analysis is supported as citation of figures, not calculation: the record can hold and cite a cell, a range, a formula beside its cached value, hidden sheets and CSV cells (with gaps), and "the DERIVATION is frequently the finding", but nothing computes totals, budget-versus-actuals or re-runs a formula; budget and financial-report types have no reader, PDF tables are NO-GO, scanned ACFRs invisible, workbooks not indexed per sheet
- **Evidence:** OFFICE-FORMATS L117–122; BOB #32 (plan/actuals type distinction); D-593; CSD L51; FW-19; M2: office-readers is the only spreadsheet path and ends at text plus cell/range references (evidence citable cell by cell, not a dataset that can be filtered or summed); tracked-change and comment dates and authors and redline superseded text (a draft's amendment history) sit in an envelope that is not searchable (envelope extent designed, not built); M4: retrieval and query-language give totals, facets, tallies and reproducible sets (selections with digests, R18–R20, R59), intent computes one proportion three-valued, nothing sums or compares values, spreadsheets are searchable at sheet grain (R25) with named tables and ranges deferred (K102)
- **Reported by:** C8 (x239, x240, x241, x242); M2 (x584); M4 (x620)
- **Constructs joined:** ANALYSIS

### X127 · Grades age over time: a fidelity letter is a measurement of a named engine at a date, re-probed on a 30-day cadence; testimony weight changes with identity; an AI run's bias lens can move; so time governs the grade of every derived thing
- **Evidence:** SCHEDULER L131–134; DEC-102; bias-debt
- **Reported by:** C8 (x263, x264, x265, x266, x267)
- **Constructs joined:** ANALYSIS, TIME

### X128 · Analysis as built is minimal and breach-bound: five ops (sum, difference, count, product, ratio) over content ids, graded by the weakest operand's capture, `undetermined` never zero, the machine recording only computed parts, on one live noncompliant outcome; plus elapsed time on the group's own records request and fee-quote reads; no budgets, and resources carry no arithmetic
- **Evidence:** build-state lines 123–128, 401; code lines 75–86, 107; canon-constructs line 91; ACTION-PLAN ruling 3; canon-mission line 221; MATRIX line 94; M1: consequences R2 runs only after a noncompliant determination, over figures cited verbatim in passages, because the record holds no amounts as values (T32 A37); spreadsheet cells are only operands, not a working medium
- **Reported by:** C9 (x276, x291); M1 (x576); M2 (x593)
- **Constructs joined:** ANALYSIS, LAW, TIME

### X129 · Lateness and patterns are unbuilt as analysis: the group's own request's elapsed time and passed-due derivation exist, but no cross-action index of lateness is built, and the canon's measurable form for patterns is deferred
- **Evidence:** canon-constructs line 91; CM 266–267; CF §13.1
- **Reported by:** C9 (x301)
- **Constructs joined:** ANALYSIS, TIME, ORG

### X130 · A new main journey ("Check a claim") and the overtime, bond-measure, budget and dataset entry points need computation over datasets; today the calculation is the assistant's or a member's, shown with its method and checked by a second member, and "A built-in, repeatable calculation step may be needed"; any analysis construct must keep per-axis grades (never one score), consequences never composed into one figure, plans refusing budget, cost and hours keys, machine calculation labelled, and reproducibility for the cross-group rerun
- **Evidence:** design-journeys journey 6 (L230, L236); audiences L443, L1163 (Design Requirement 5: "Forks at fact or analysis signal a reproducibility issue"); UC-053, UC-065, UC-112; OPTION_KEY_REFUSED; UC-076 (uncovered)
- **Reported by:** D1 (x344, x345, x346, x347, x348, x349)
- **Constructs joined:** ANALYSIS, QUESTIONS, LAW

### X131 · A derived number has no scale of its own: the measures have four evidence scales (capture, connection, testimony, subject match) with no form borrowed across them, and the one computed figure in the designs inherits a capture grade ("grade B, co-attested", consistent with consequences R2's weakest-input grade); if analysis grows, a derived figure's grade must fit the capture/connection pair or become a new scale, under DEC-82's measures doctrine and "totals only within a state"
- **Evidence:** principles L62; measures L17–66; view matter-page L29; design HANDOFF L72; surface rules L1615; DEC-82
- **Reported by:** D2 (x535)
- **Constructs joined:** ANALYSIS

### X132 · Fiscal and fund material appears in examples with no surface for it ("FY22 sewer fund transfers authorized?", bond proceeds deposited into the general fund against the voter-approved purpose, a restricted account, $100,000,000 of bond debt authorised); no surface rule covers budgets, funds or fiscal periods and there is no budget reader; the plans' "Never a cost, budget" rule concerns the group's own work, not government budgets
- **Evidence:** measures L78; view plan-page L32, L58; view matter-page L29; design HANDOFF L72; surface rules L3077
- **Reported by:** D2 (x538)
- **Constructs joined:** ANALYSIS, LAW, TIME, ORG

## Questions and the assistant

### X133 · QUESTIONS has two meanings: a member's question that becomes an inquiry, and natural-language help from skills and the assistant; the prompt entry and INTERPRET are absent, two skills are unbuilt, and the assistant's diagrammed edges reach only Retrieval and Capture, not Action, standards or calculation, so its reach into law, time and calculation is unspecified
- **Evidence:** MS M9; SD row 11 (FIND/PURSUE/EXTRACT/CHECK), L121, L237–238; RM L12; AC ("compare, compute, propose and draft"), rule 10
- **Reported by:** C1 (x13)
- **Constructs joined:** QUESTIONS, LAW, TIME, ANALYSIS

### X134 · A member's natural-language question to the assistant leaves no observation unless it becomes a run, objective or lead, so an answer's "searched at which level" rests on the run log; the observation level distinguishes LOOKED_INDETERMINATE, LOOKED_ABSENT and NEVER_LOOKED, but the case-level `undetermined` still blurs them (a possible conflict to check against Interaction Constructs)
- **Evidence:** OLD §4.6 (a member's ad hoc search "states it as a LEAD"); REC-100; `authority_kind = run`; PS (Wikidata "could not determine" vs "there is none")
- **Reported by:** C10 (x26)
- **Constructs joined:** QUESTIONS, ANALYSIS

### X135 · The July AI design (Claude-first Session executor, three cost modes, capability cap) is unratified; what is live is one org-principal AI credential per instance, the agent-worker and stated absence when none is set; unattended runs are fenced, so analysis-heavy question answering defaults to interactive sessions
- **Evidence:** TAD (header: "no ruling or dataplane entry carries the Session abstraction"); DEC-47; DIST (D-260 `INSTANCE_AI_TOKEN`; `NO_INSTANCE_AI_CREDENTIAL`); CON Step 8b (UNSCHEDULED)
- **Reported by:** C10 (x27)
- **Constructs joined:** QUESTIONS, ANALYSIS

### X136 · The AI roles (FIND, PURSUE, EXTRACT, CHECK) are defined over content and claims only: none names computing or deadline derivation, none reads law or reasons about time, and EXTRACT's registry resolution is the only organisation-facing role
- **Evidence:** DEC-24; AIR §2/§7 (AR 56, 139)
- **Reported by:** C11 (x48); C4 (x150)
- **Constructs joined:** QUESTIONS, ANALYSIS, TIME, LAW, ORG

### X137 · The assistant's permitted reach (search, gather, extract, check, capture) is exactly where richer time, organisation, law and analysis support would surface to members, and its rules (never commits; plane-sourced rules; labelled non-member actor) apply unchanged
- **Evidence:** DEC-27 (examples: a relative-time FIND "over the weekend"; "people and bodies named"; a claim about a legally required audit)
- **Reported by:** C11 (x50)
- **Constructs joined:** QUESTIONS, TIME, ORG, LAW, ANALYSIS

### X138 · Answers must state absence and context: the fact of incompleteness but never the hidden thing, the lens an answer was evaluated under, what could not be established, the bound applied, and refusals by code with canned translation; the conversation is not part of the permanent record, so an answer the group wants to keep must become a suggestion or version
- **Evidence:** DEC-36; DEC-45 det. 2/6; DEC-56/57/58; DEC-64; DEC-49; DEC-60/61 ("The conversation is NOT part of the permanent record"); M4: observation-log holds levels, states and causes; retrieval states the four levels on every meaning read and skills teach it; the assistant's sub-sessions search only through `op=meaningrows` with a model-written query string (`model.mjs`:215–226)
- **Reported by:** C12 (x60); M4 (x618)
- **Constructs joined:** QUESTIONS, ANALYSIS

### X139 · AI work has an authority model: keys are organisation-scoped (acting for the group) or member-scoped (attributable) and the record names which; one `ai` class with a declared task scope; minting is a member act; the endpoint surface is the fence; who may start a run is decided by project membership
- **Evidence:** DEC-55; DEC-63
- **Reported by:** C12 (x63)
- **Constructs joined:** QUESTIONS, ORG

### X140 · The one assistant mode designed to use law, consequences and deadlines together is the planning run in layer 9's territory, and it proposes options rather than answering questions
- **Evidence:** draft-planning-skill L7
- **Reported by:** C13 (x71)
- **Constructs joined:** QUESTIONS, LAW, TIME, ANALYSIS

### X141 · The assistant turns natural language into structure: it fills a structured option form from a member's description
- **Evidence:** action-design PATH step 4, L16
- **Reported by:** C13 (x77)
- **Constructs joined:** QUESTIONS, LAW, TIME

### X142 · The four-level search (meaning, content, documents, internet) is the questions construct's absence doctrine, stated as a property of the content store, and is the absence contract any assistant answer must state
- **Evidence:** CF §14.3 src 1899–1906
- **Reported by:** C3 (x126, x132)
- **Constructs joined:** QUESTIONS, LAW, ANALYSIS

### X143 · Two regimes for the same construct: the investigative session may formulate claims and legs proactively, while the member-facing assistant pilot may only structure what the member said
- **Evidence:** AIR §3 rule 7 (AR 82); IC §P (IC 530–536); DEC-60
- **Reported by:** C4 (x151)
- **Constructs joined:** QUESTIONS

### X144 · Open-ended questions (by AI or members) and analytic answers need a composable query algebra under the one viewer gate, with counts gated and the model never deciding when the search stops: today's query compiler (34 fields, 5 FTS columns) cannot reach meaning tables, so any analytic or natural-language answer over findings needs Route 2; aggregates ("what is our exposure?") are answered at inquiry grain
- **Evidence:** IS §14b.2 (src 1449–1468; D-222, staged A then C), §14b.4, §14c (src 1661–1663)
- **Reported by:** C5 (x173, x175)
- **Constructs joined:** QUESTIONS, ANALYSIS

### X145 · Members are expected to reach time, organisations, law, courts and analysis through the assistant, but its FIND is designed only as "read ops → cited answer with level" and is not built: no calculation step, no law or time reasoning, and the no-unstated-propositions limit bars it from stating its own conclusions, so any "what is the deadline / who is responsible / what does this provision require" answer must be a cited read of something already held
- **Evidence:** ASSISTANT-PILOT (whole; DEC-60, src 9)
- **Reported by:** C5 (x177)
- **Constructs joined:** QUESTIONS, TIME, ORG, LAW, COURTS, ANALYSIS
- **Notes:** Doctrine: D47, D48.

### X146 · INTERPRET names "the people and bodies named" in a question, linking questions to organisations and the entities layer, and through the private-individual rules to doctrine on persons
- **Evidence:** ASSISTANT-PILOT §2 INTERPRET (src 94–96); actions R9
- **Reported by:** C5 (x178)
- **Constructs joined:** QUESTIONS, ORG

### X147 · The retrieval substrate's time is record time (created, last_updated, retrieved, monitoring cadence) and its only organisation hook is `source.authority`: dates and bodies named inside documents are not projected fields and would have to come from extraction and entities (layers 4–5) to be searchable or filterable
- **Evidence:** RETRIEVAL-SUBSTRATE Finding 2 (src 89–99)
- **Reported by:** C5 (x179)
- **Constructs joined:** QUESTIONS, TIME, ORG

### X148 · Collected material is untrusted data, never instructions; the review surface shows the source, "never only an AI summary"; stored fields are quoted data never used to steer a member's session
- **Evidence:** Intake L409–412, L614–619; A&T L171–182; C-18.5
- **Reported by:** C6 (x194); C7 (x210)
- **Constructs joined:** QUESTIONS, LAW, COURTS

### X149 · Legal and financial questions (Brown Act, franchise fee, reading an ACFR) are routed to confirmed humans by declared expertise, not to code; the routing exists as data (`member_expertise`) but there is no notification channel
- **Evidence:** MA §1.3; A&T L184–188 (D-52); canon-mission line 44
- **Reported by:** C6 (x194); C7 (x210); C9 (x309)
- **Constructs joined:** QUESTIONS, LAW, ANALYSIS

### X150 · The assistant's retrieval substrate is disciplined but text- and row-grained: FIND answers carry level, scope and a five-bucket tally, hidden and absent answer alike, a hit is an address, EXTRACT proposes entities and facts graded ≤ B; nothing gives a structured answer to a time, organisation or law question beyond text match and typed connections, and the query language is structured, not natural language, with ambiguity hazards
- **Evidence:** CSD §6 (`passage:` level); DEC-24; MKD L14; CSD `leg:grade>=B` defect; M4: there is no natural-language layer in the plane; the member types the query grammar and the assistant's model translates natural language into it inside agent-worker; answers can only be as rich as the grammar's fields (bundle dates, `authority`, `addressee`, meaning arms), which have no organisation, law or arithmetic vocabulary
- **Reported by:** C8 (x249, x250, x251, x252); M4 (x619)
- **Constructs joined:** QUESTIONS, TIME, ORG, LAW

### X151 · The questions → law/time bridge is a missing skill, not missing ops: machine credentials can already call `standardpropose`, `comparisonpropose`, `actionlawspropose`, `actionriskpropose`, `theorypropose`, `filingprepare` and `clockPropose`, but no skill or run template drives them; the only skill pack is `investigative-session` and the named "Legal/Policy Lookup skill" does not exist
- **Evidence:** code lines 44, 234, 236; build-state line 160; `standards/index.mjs:13`; MATRIX §5 line 71 (an action-planning skill for BOB to build); skill §5, `filings` R23
- **Reported by:** C9 (x275, x287, x320); M1 (x558, x560)
- **Constructs joined:** QUESTIONS, LAW, TIME
- **Notes:** Doctrine: D53, D26.

### X152 · The Assistant and AI Roles document never mentions actions: the action boundary lives in module requirements (`filings`), so the assistant's role in law and courts work is defined bottom-up per module rather than in AIR
- **Evidence:** AIR; `filings` R23
- **Reported by:** C9 (x305)
- **Constructs joined:** QUESTIONS, LAW, COURTS

### X153 · Natural-language questions are promised and uncovered: journeys and the wizard "Your first question" promise asking in plain words, but "Ask the assistant in my own words" has no requirement, the question-to-search flow is designed but not built, FIND, the Context skill, Legal/Policy Lookup and the compliance-comparison skill are not modules, and only CHECK is deployed
- **Evidence:** design-journeys journeys 9, 4, §6; UC-092; UC-002, UC-003, UC-004, UC-064; UC-085, UC-087, UC-088, UC-163; M5: no member-facing op accepts a natural-language question; the browser cannot open an AI run; wizards (the no-AI guide) are built but have no screens or scripts
- **Reported by:** D1 (x350, x351, x352, x353, x354); M5 (x634)
- **Constructs joined:** QUESTIONS, LAW

### X154 · The canonical combined need is "Explaining a charge or a rule" ("What's this sewer maintenance charge on my water bill?"), needing questions, law (ordinance or rate schedule), organisations (which office) and analysis (the charge); since the assistant "Cannot… state a law, determine, file" (refusals include MACHINE_CANNOT_DECLARE_STANDARD and MACHINE_CANNOT_STATE_RECORDS_LAW), an explaining assistant must offer labelled readings and proposals, never a statement of the law
- **Evidence:** design-journeys §6; audiences L1554
- **Reported by:** D1 (x356)
- **Constructs joined:** QUESTIONS, LAW, ORG, ANALYSIS
- **Notes:** Doctrine: D274, D255.

### X155 · The assistant is designed across every construct but deployed for none: designs have it propose standards, plan options, filing text, clarifier recommendations and translations, with natural-language FIND/CREATE/ACT as the question model, but only the `check` mode is deployed (plan mode `deployed: false`), no plane path starts a first segment, the UI never opens a run, the installer sets no model key and there is no member-facing panel; as built the assistant is a bounded, adversarial evidence-checker that writes suggested basis versions and answers no question in prose
- **Evidence:** view F L20; surface rules L662, L2412, L2471–2498, L2540, L2663, L2912, L3251, L3256; view start-and-send L50; brand V4; design HANDOFF L77; agent-worker R37, R51; M1 (standards R9, conformance R12, filings R14, R23, filing-templates R6 have no AI caller); M3 (model turns marked unmet while code runs them; contradiction recommender prompt unmeasured)
- **Reported by:** D2 (x540); M1 (x558, x559, x560); M3 (x599, x600, x601, x602, x603, x604, x605, x606)
- **Constructs joined:** QUESTIONS, LAW, TIME, ANALYSIS, ORG
- **Notes:** M3: Bob's belief that the system "could do [natural-language questions] through the assistant" is not supported by layer 6. D2: any question-answering assistant inherits the same bounds plus "Never drop qualifiers when compressing" and the look-state vocabulary for absence. Doctrine: D47, D44, D13.

## Jurisdiction profiles and identifier spaces

### X156 · The Oakland-specific mission examples are the requirements catalogue for what a jurisdiction profile must express (statute hierarchy, venues and fees, counting rules, office rosters with tenures), since all of it must live in profile data; such data also varies by instance and build version
- **Evidence:** RM, MS (Gov. Code sections, Prop 218, Legistar, OpenGov); DR §15; AC rule 11; TAD (CPRA, OMC, sewer fund); CON (C.M.S.); DIST; REC-64 ("freeze the sentence at ITS build"); Int L428–430 (Cal. Gov. Code 54953.5), CP tiers (CPRA, Brown Act, Prop 218, CCP §526a); Pub §8 (tier words and `risk_tier` only, D-182); INVENTORY line 29 / canon-mission line 219 ("Every named action, venue and deadline is Californian"); canon line 145/148 (Gov. Code 7922.535; GAGAS/GAO 7–30 days); D2: holidays (principles L157; brand L44), state-code matching of standards (VF L14), action-kind clocks ("the profile states none", VS L26), venues and legal organisations (SR L1911, L3045), venue evidentiary standards (SR L3358; VS L58), filing-window advisories (VF L31) and claim deadlines (VF L50) all come from the profile (K1)
- **Reported by:** C1 (x14); C10 (x29); C6 (x191); C9 (x277, x284, x311); D1 (x358); D2 (x541)
- **Constructs joined:** LAW, ORG, TIME, COURTS
- **Notes:** D1: governing records law, deadlines and holidays, action kinds and tiers, venues and their standards, legal organisations and filing templates all come from the jurisdiction profile, so much law, time and courts support is a profile-data problem as well as a code problem. D2: richer construct support implies a much richer profile schema, or profile-like shared data. Doctrine: D196, D197.

### X157 · Identifier spaces bridge organisations, law, analysis and time (Legistar resolution and C.M.S. numbers; fund codes and project numbers; contract and PO numbers; concurrent forms, vintages, roll years), each shared identifier raising a progression from C to B, yet the construct stays ABSENT, the origin system has no object, and the Oakland-specific recognisers sit in product code
- **Evidence:** CON Step 5a / M-119 (header l.11); CF §8.3 src 1027–1117 (BOB #35: origin a member's attributed per-document declaration); `idspaces.mjs`; CF Incomplete §8.3; M2 (id-spaces): an identifier joins two records only if published by independent offices (coverage floors, parcel roll years); the product's only machine join between public records by key; it never reads what the enactment says
- **Reported by:** C10 (x22); C3 (x119, x133); M2 (x582)
- **Constructs joined:** ORG, LAW, ANALYSIS, TIME
- **Notes:** Doctrine: D207, D184, D188.

### X158 · Jurisdiction ties law, organisation (venue) and calendar together in a filing template, but only as profile data with free-text citations; a template's use under another jurisdiction must be stated
- **Evidence:** draft-filing-templates L17, L71, L186
- **Reported by:** C13 (x73)
- **Constructs joined:** LAW, ORG, TIME, COURTS

### X159 · The first profile has no holidays and no templates, and its offices and one deadline are `UNMEASURED`, so every business-day count is undetermined until local facts and the calendar research land
- **Evidence:** action-design HANDOFF L44; deltas §6 L49; draft-filing-templates L10; code lines 244–259 (the real Oakland profile: 1 deadline, records_response 10 calendar days + 14 extension, § 7922.535, UNMEASURED; no holidays; 5 unmeasured offices; no templates); build-state lines 350, 361; UC-114 ("the real profile has no Tier 1-2 templates yet (N-A14: legal text Bob supplies or approves, and a source)")
- **Reported by:** C13 (x86); C9 (x277); D1 (x358)
- **Constructs joined:** TIME, ORG, LAW

## Shared mechanisms any construct would reuse

### X160 · The recogniser (`detect(ctx) -> { match, confidence, signals[] }`, versioned, one ladder, registry with conservative fallback) is the framework's single extension shape; any new date, deadline, citation, provision, body, office or docket recogniser plugs in at the profile and reading level
- **Evidence:** CF §4 src 442–494 ("a third axis is a third column, not a rewrite")
- **Reported by:** C3 (x114)
- **Constructs joined:** TIME, LAW, ORG, COURTS

### X161 · One task-with-clock mechanism is designed for two consumers: temporal expectations (what a body is expected to do by when, which BLOCKS a transition) and bias debt (which only surfaces); an obligation with a clock, attached to an object and settleable in batches, belongs in the TASK construct fed from the record
- **Evidence:** CF §13 src 1506–1520 (Step 7 of the plan); IC §T D-86 (IC 339–351)
- **Reported by:** C3 (x122, x131); C4 (x146); C9 (x299)
- **Constructs joined:** TIME, ORG, QUESTIONS

### X162 · Supersession of a regulation and renaming of a department are the same unmodelled construct: change across addresses and identities over time
- **Evidence:** CF §11 src 1704–1706
- **Reported by:** C3 (x124)
- **Constructs joined:** LAW, ORG, TIME

### X163 · The doctype readers that exist (meeting calendar, agenda, minutes, staff report, ordinance/resolution) are exactly the sources for time, law and organisations, but they emit references only, and the staff directory reader (the source of offices and positions) is unwritten
- **Evidence:** CF §16 src 2062–2071
- **Reported by:** C3 (x127)
- **Constructs joined:** TIME, LAW, ORG

### X164 · The FLOW MODEL (declared vs observed institutional flow, "a reference model many investigations read") is where organisations, law and time meet and the natural home of a public body's obligations; the queue's OBLIGATION domain is the civic system's declared flow, the analytic product is the delta between declared and observed, and the model must sit below the investigations that read it; where it is built is not said
- **Evidence:** CM §2 (CM 273–279), §What is missing 3 (CM 435–438) (D-128); IC §QUEUE domains (IC 110–115); NOTIFICATIONS lines 14, 80–109 (Bob 2026-08-01: "Obligations are the flows (edges) that go on in a living civic system", declared vs observed, D-128 designed-not-built, M4, open); DEC-107 (line 94–96: "a public body's own duty only"); canon-constructs line 98 (progression vs plan)
- **Reported by:** C4 (x139, x147, x154); C9 (x273, x298, x302, x321)
- **Constructs joined:** ORG, LAW, TIME, ANALYSIS
- **Notes:** C9: the obligation construct Bob asks for was named on 2026-08-01; its only built part is progressions' missing-predecessor and overdue-successor generators. Doctrine: D314, D241.

### X165 · None of organisations, law or courts is a record object type (`OBJECT_TYPES {information, inquiry, project, action}`): they enter the record only as information or through later-layer modules
- **Evidence:** IS src 281; SR §1.1–1.2 (src 284–308: INFO, PROB/Focus, PROJ, ACTN; no type for organisation, person, provision, case, deadline or dataset); SR src 1060–1063 (outside bodies only as free text `source.authority`, `counterparty`); MA §7.9 (`ENT` and `REL` objects in the shared corpus, src 913–915, 956)
- **Reported by:** C5 (x164); C7 (x203, x214)
- **Constructs joined:** ORG, LAW, COURTS

### X166 · Content is the citation substrate every construct's evidence passes through (a law passage, a court order page, a spreadsheet range, a dated minutes paragraph); its version notice is the record's only time-over-documents comparison, and `passageText` → `consequences` R2 is the declared route from a cited passage to layer-9 calculation, skipping layers 5–8: spreadsheet → reader text and cell references (L1) → content extents (L4) → `passageText` → consequences (L9), with nothing between L4 and L9 holding a number as a value
- **Evidence:** content; consequences R2; progressions R32 (deferred for that reason)
- **Reported by:** M2 (x586, x593)
- **Constructs joined:** ANALYSIS, LAW, COURTS, TIME

## Doctrine binding every construct

### X167 · The UNDETERMINED lineage runs through every construct (FA's "Unclear" → the Determination value "unclear", the never-defaulted risk tier, the missing profile fact, the ungraded leg that suspends its axis, search naming which absence is true), so any time, law, organisation or analysis support must say undetermined the same way
- **Evidence:** FA L338–341; AC L21, row 10, rule 11; SD L111, row 9; MS M9; M4: undetermined stated by name in query-language R5, observation-log R11–R12, intent R3–R4, reevaluation R21, monitoring R5 and R14, acquisition R11 and R15
- **Reported by:** C1 (x15); C6 (x196); M4 (x623)
- **Constructs joined:** TIME, LAW, ORG, ANALYSIS, QUESTIONS
- **Notes:** Doctrine: D55, D56, D96.

### X168 · Any computed legal or time rule (a deadline, a notice period, a conformance check) is computed once by the plane and rendered, never re-derived in a surface or held by the assistant: the assistant relays the plane's single authority and holds no copy
- **Evidence:** DEC-8; DEC-27 ("gets its understanding of the rules from the server"); IC §P + §U (IC 514–613)
- **Reported by:** C11 (x36, x51); C4 (x149)
- **Constructs joined:** LAW, TIME, QUESTIONS, ANALYSIS
- **Notes:** Doctrine: D22, D81, D48.

### X169 · The hunch lifecycle opens investigation-time reasoning that is not yet evidenced (a provisional reading of which office is responsible or which provision applies), provided it is visibly a hunch and cannot survive publication
- **Evidence:** DEC-15
- **Reported by:** C11 (x43)
- **Constructs joined:** ORG, LAW, QUESTIONS
- **Notes:** Doctrine: D60, D61.

### X170 · Two machine-authority regimes must not be merged: a machine credential may write relations, aliases, resolutions and progressions directly, machine-attributed (so the organisation/time substrate may be machine-built), while a machine's claims and legs are only suggestions and grades stay earned (so the reasoning layer stays member-accepted); DEC-52 changes who may constitute a relation, not whether the record computes over relations
- **Evidence:** DEC-52 (2026-08-07); DEC-60/62/65
- **Reported by:** C12 (x56)
- **Constructs joined:** ORG, TIME, QUESTIONS, LAW
- **Notes:** Doctrine: D8, D5, D3.

### X171 · Any construct support must be justified by the member's path (the journeys), not by completeness
- **Evidence:** DEC-48 (src 1081–1083)
- **Reported by:** C2 (x96)
- **Constructs joined:** TIME, ORG, LAW, COURTS, ANALYSIS, QUESTIONS

### X172 · The act inventory shows the same split for every construct: law (`standardpropose`, `standarddeclare`, `standardadopt`, `actionlawspropose`), organisations (`entitycreate`, `entityalias`), courts and forums (`filing*`, `escalation*`, `counselpacket`), analysis (`comparisonpropose`, `consequencerecord`), time (`progressiondefine`); the machine side is a REVERSIBLE proposal, the member side REASONED
- **Evidence:** DEC-88
- **Reported by:** C2 (x99)
- **Constructs joined:** LAW, ORG, COURTS, ANALYSIS, TIME

### X173 · The machine's permitted shape is uniform across constructs: it may find, propose, recommend with a reason and draft into a field as labelled machine work (and, per DEC-52, declare/resolve/thread machine-attributed); it never picks a side or a GENUINE kind, never flags, never approves, never counts toward activity, never tells a member what to conclude, and is never attested; any time, law, organisation or analysis assistance must fit this shape
- **Evidence:** DEC-77.3, DEC-95.3, DEC-101, DEC-116.3, DEC-120, DEC-127, DEC-52/53, DEC-84.5, DEC-92, DEC-121, DEC-111; CF (assistant focus, hunch, EXTRACT row, theme proposal, carry-forward candidate, idmatch referent); Publication/Intake/A&T: drafting "what changed" (DEC-101), suggesting outside responses under the six guards (DEC-95 (3)), resolving undetermined authority as "a human or an AI" (A&T L84–87), flagging redaction candidates, proposing gathering requests, a labelled machine gatekeeper; release and actions are member acts (Int §4a, §9); NOTIFICATIONS "Analysis (M4)" items are machine-derived proposals a member adopts, defers or dismisses; M3: any construct support offered to the assistant must pass the same plane-side verdicts (no unearned grade; `derived` labelling as in run-productions R5; absence by level; the skill pack's "no single confidence score" and "no significance, no score"); M4: in all nine modules the machine proposes and never adopts, enables, regrades or advances
- **Reported by:** C2 (x106); C3 (x132); C6 (x194, x196); C7 (x210); C9 (x325); M3 (x610); M4 (x623)
- **Constructs joined:** QUESTIONS, TIME, ORG, LAW, ANALYSIS
- **Notes:** Doctrine: D4, D27, D14.

### X174 · A fact is recorded because it is true and dated, not because it is explained: a public body's intent is not inferred; with the rest of the shared doctrine (undetermined stated, never back-filled; neither more nor less than the record holds; no gate pressuring an invented value; exact-match attribution; bad actors by evidence; the machine never releases, files or concludes)
- **Evidence:** SOURCE-ACCESS L136–138, L233–235; Pub rules 13, 14, 15(d), L247–248, L593–595, §6A.4; A&T L97–99, L258–265, L280–281; Int §4a, §8 (D-533), §9
- **Reported by:** C6 (x196)
- **Constructs joined:** ORG, LAW, TIME, ANALYSIS, QUESTIONS

### X175 · Any system-raised claim about a body ("21 days overdue") must show its derivation (dates, rule, basis) or state undetermined, the same basis-and-grade discipline as any derived thing
- **Evidence:** NOTIFICATIONS rule 3 (lines 313–317)
- **Reported by:** C9 (x326)
- **Constructs joined:** TIME, ORG, ANALYSIS, LAW
- **Notes:** Doctrine: D78, D241.

### X176 · Time notifications (deadlines approaching or overdue) are bound by the no-nag doctrine: threshold crossings told once, per-member mute, the finding stands
- **Evidence:** DEC-10; DEC-69 (canon-constructs line 113; canon-mission line 49)
- **Reported by:** C9 (x327)
- **Constructs joined:** TIME, QUESTIONS

### X177 · Non-advocacy limits law and organisation work: stage 7 and lobbying only "enforce or restore an existing requirement", and on ballot measures the group checks claims without campaigning
- **Evidence:** UC-123 (Bob's ruling 6); design-journeys L100, L118
- **Reported by:** D1 (x357)
- **Constructs joined:** LAW, ORG

## Naming clashes across constructs

### X178 · "Case" and "standard" collide with courts and law: a case is the group's published case (a container over findings), never a court case; "evidence standard" (`required_strength`) is not the layer-9 `standards` module (law held in the record)
- **Evidence:** DEC-34–46, DEC-44; IS src 217–224, §7–7.1; DEC-17/21; DEC-72 ("a case is a production of a project"; `case_id`, `case_edition`, `published_case_members`); actions R4, R10 (court-related kinds `grand_jury`, `litigation_support`, `controller_referral` moved to profile data); code line 235 (evidence-strength standard in agent-worker vs legal standard in layer 9); D2: "Standard" carries three senses — a legal standard (VF L9–18; SR L1605), the group's own rule ("The group's standard is that a breach claim rests on a published finding", VS L38) and a venue's evidentiary bar ("The venue's standard: accepts B co-attested", VS L58; SR L3358) — beside the project's evidence "bar" (MS L65)
- **Reported by:** C12 (x62); C5 (x160, x166); C7 (x209); C9 (x319); D2 (x542); M5 (x631)
- **Constructs joined:** COURTS, LAW, ANALYSIS
- **Notes:** Doctrine: D313, D321.

### X179 · "Version" is overloaded six ways, and a correct count depends on recognising versions of one source, so any version-in-force design must name its sense
- **Evidence:** IS src 226–245, 150–156 (D-220)
- **Reported by:** C5 (x161)
- **Constructs joined:** TIME, LAW, ANALYSIS

### X180 · "Obligation" in the action and notification documents is always a member's queue item (checkpoint due, stage proposed, template review requested, local fact due, litigation hold), while a counterparty's duty is a "deadline" or a "condition"; DEC-107 reserves the word for a public body's duty
- **Evidence:** action-design PATH §1, deltas §4, filing-templates queue-producers R20–R21; DEC-107; SCH L175; canon-constructs line 170 ("OBLIGATION ... means the body's civic duty (NOTIFICATIONS, Bob)"; queue label collision open, OQ-25); ACTION-PLAN A10; D1: three senses in the design sources — the queue's OBLIGATION, a task addressed to a member (UC-040, UC-041; (d)); "OBLIGATION as declared flow" (UC-024, D-128); "obligation against act", a contradiction resolution kind routed to conformance (UC-069, UC-070); Bob's sense (who owes what to whom by when under what authority) has no construct; D2: SR's queue classes ("obligation (do / forward / resolve), queue finding …, condition", SR L13, queue R1, R12) and VF's labels ("obligation", "obligation · ours", VF L61–69); only "obligation-against-act finding" (SR L1640) and "counterparty's deadline" (SR L73) mean a public body's duty
- **Reported by:** C13 (x75, x90); C8 (x256); C9 (x302, x322); D1 (x338, x339, x340, x341, x342); D2 (x542)
- **Constructs joined:** ORG, LAW, TIME
- **Notes:** Doctrine: D314.

### X181 · "Condition" is the audit-finding word for "what happened" (Criteria, Condition, Cause, Effect), reserved for findings about bodies, so signals about the group's machinery must not borrow it (hence "Signal" replaced "Condition")
- **Evidence:** NOTIFICATIONS line 159; DEC-110; DEC-77
- **Reported by:** C9 (x323)
- **Constructs joined:** LAW, ORG, ANALYSIS

### X182 · "Docket" is the case's public response log, not a court docket; "Matter" is the plan-level name for a government act under examination (DEC-114), while "subject" is used for the same thing on the plan page
- **Evidence:** principles L66; brand L28, L100, L236; views VM, VP (L19–36); DEC-114
- **Reported by:** D2 (x542)
- **Constructs joined:** COURTS, LAW, ORG

## Other

### X183 · Bob's design-branch rulings contain no ruling on business days, holidays, time zones, limitation windows, fiscal periods, recurring meetings or notice rules, dates in text, court cases as objects, datasets, spreadsheets, budgets-vs-actuals, charts, reporting lines or position-vs-holder modelling; time rulings concern reminders, queue display, editions, timestamps and retention
- **Evidence:** C2 reader's observation over DEC-68–127 (DEC-94, 98, 107, 110; DEC-72, 101, 116; DEC-39, 81; DEC-108, 113; docket modelled on the CPUC, DEC-100, DEC-116)
- **Reported by:** C2 (x109)
- **Constructs joined:** TIME, COURTS, ANALYSIS, ORG, LAW

### X184 · State Rules disagrees with itself: §4.4's body (state-specific kinds, free-text counterparty) vs its Action-layer amendment (both called history), and §4.3's project-name annotation vs the Incomplete list and Membership §11 saying it is unenacted
- **Evidence:** SR §4.4 vs src 1806; SR §4.3 (src 841–842) vs src 21 and MA §11 item 8 (src 1552–1554)
- **Reported by:** C7 (x212)
- **Constructs joined:** ORG, LAW
- **Notes:** Recorded by C7 as [CONFLICT]; see also DOCTRINE-REGISTER Conflicts.

### X185 · State Rules inventory of record types and fields bearing on the constructs: four persisted types (INFO, Focus, PROJ, ACTN); the universal core (id, object_type, schema, states, created, last_updated, produced_by, references, state_history, reeval_pending); Information (criticality, classification fact/analysis/judgment, source with authority and retrieved, monitoring frequency; provenance register with grade A/B/C); Focus recheck triggers; Project workproduct states; Action clock and counterparty; Work Product citations with `as_of`; edge vocabulary; invariants I-1…I-20 (I-11 clock discipline, I-15 recheck coverage); amendments adding inquiry, STD-, CONF-, CONS-, ESC-, PLN- and edges `action_basis`, `responds_to`, `references`
- **Evidence:** SR §1.1–1.2, §3.1, §4.1–§4.6, §5.1–5.2, §6, amendments (src 284–1809); `bio-checks.mjs` is the authority for the edge set and state machines
- **Reported by:** C7 (x214, x215, x216, x217, x218, x219, x220, x221, x222, x223)
- **Constructs joined:** ORG, LAW, TIME, ANALYSIS, COURTS

### X186 · Staleness and conflicts inside the design sources: journeyExperience (c) L586 says overdue marks are "Not yet built" while UC-127 says they were built at the plane in T18; UC-031 offers a "per meeting" cadence while journeys §6 says there is no meeting model; journeyExperience (c) cites actions R32 and R35 for clocks, which K617 moved to `action-clocks`; the brief says "fourteen journeys", the source has seventeen
- **Evidence:** journeyExperience (c) L586; UC-127; UC-031; journeys §6; UC-118; K617
- **Reported by:** D1 (x359, x360, x361, x362, x363)
- **Constructs joined:** TIME, QUESTIONS

### X187 · The design sources' own coverage verdicts: use cases with no requirement (12) include the Context skill, Classify fact/analysis/judgment, Regrade or rerun under another lens, Accept another group's work, Ask the assistant in my own words, Speak to the assistant, Compliance Evaluation, Public directory, Discuss across groups, Starter kit (DEC-91 deferred) and Decline to escalate; partial (10) include Search outside sources, Legal/Policy Lookup, watches and sweeps, Government Compliance Analysis, suggested accounts of support and proposed readings (investigate and extract not deployed), Standard metadata; 27 are covered but have no member surface, almost every construct-bearing Action use case among them
- **Evidence:** design-ux-useCases (`coveredByRequirements`): no — UC-003, 005, 027, 076, 083, 092, 093, 100, 110, 125, 148, 154; partial — UC-002, 004, 034, 035, 037, 064, 082, 087, 088, 101; covered without member surface — UC-040, 069, 113, 115, 119, 122, 124, 126, 129, 149, 150, 153, 155, 158–172; journeyExperience ("openInThisStep", "Decided, not built"); audiences ("open" marks, no list)
- **Reported by:** D1 (x366, x367, x368, x369, x380, x381)
- **Constructs joined:** QUESTIONS, LAW, ORG, ANALYSIS, TIME, COURTS

### X188 · The journeys' own "Gaps to close" (proposed 5 October, nothing decided): calculating over a dataset (ANALYSIS); explaining a charge or a rule (LAW, QUESTIONS); a code's structure (LAW); following a court case (COURTS); meetings and time (TIME); offices and who held them (ORG, TIME); asking an expert for a check; all but the last wait on the development process's answer to the 5 October capability question
- **Evidence:** design-journeys §6 "Gaps to close" (L518–536); other rows: invitation links, one administrator, kind of group, private note, the assistant's account
- **Reported by:** D1 (x370, x371, x372, x373, x374, x375, x376, x377, x379)
- **Constructs joined:** ANALYSIS, LAW, QUESTIONS, COURTS, TIME, ORG

### X189 · Index of construct-bearing use cases and journey steps with the sources' own coverage (D1's tables)
- **Evidence:** D1 tables x383–x5xx. Use cases — QUESTIONS: UC-001 yes; UC-002 partial (FIND only inside a run); UC-003 no; UC-004 partial (lookup skill not a module); UC-008 yes (four-level absence); UC-047, 054, 084–086, 089–091 yes; UC-087 partial (investigate not deployed); UC-088 partial (extract not deployed); UC-092, 093, 100 no; UC-156 yes (none produced live until measured); UC-163 yes (plan mode not deployed); UC-170 yes. ORG: UC-005 no; UC-018, 019, 020, 046, 172 yes; UC-083, 125 no; UC-101 partial (area of government, relationship disclosure); UC-139 yes (routing not built); UC-160 yes, no member surface. TIME: UC-023, 028, 029, 031–033, 056–058, 105, 118, 120, 121 yes; UC-034, 035, 037 partial (R32, R28–R29, R33 unmet); UC-038, 039 yes (R17 "weakened" unmet); UC-122, 126, 150, 164, 165 no member surface; UC-127 yes (built T18); UC-154 no (DEC-89 owed). LAW: UC-024, 062, 063, 066, 070, 080, 081, 116, 117, 123, 133 yes; UC-064 partial (skill not a module); UC-065 yes, rests on published findings; UC-069, 113, 167 no member surface; UC-114 yes but the profile has no templates (N-A14); UC-148 no (DEC-91). COURTS: UC-115, 169 no member surface; UC-129 yes, hold deferred (N-A19). ANALYSIS: UC-027, 076 no; UC-052, 053, 077, 099, 112, 128 yes; UC-067 yes with DEC-89 parts uncovered; UC-068 no member surface; UC-151 yes, bars not built. Journey steps — §3 potholes and dumping, police overtime, bond measure, budget or audit, dataset: gap "calculating over a dataset"; franchise: standards declarable, no "contracts with"; law, code or policy (sewer): gaps "a code's structure", "explaining a charge or a rule"; court case: gaps "following a court case", "offices and who held them"; public meeting: gap "meetings and time"; contract: deadlines only as action clocks; regulatory proceeding: gap "following a court case"; J1 step 5 (places whose rules apply): built (UC-133); J2 step 2 (offices and agencies watched): gap "what kind of group" (J7); Journey steps (cont.) — J4 step 3 find the city's standard: partial (UC-004, UC-062), gap "explaining a rule"; J4 step 4 time-bound question: question yes (UC-047), evaluation needs calculation; J5 steps 3, 4, 6, 8 office, governing law, due date, overdue: yes (UC-120, UC-118, UC-127); J6 steps 2–6 period, timestamps, calculation with method, sample, counts: gap (L230, §6); J8 step 3 ask an expert: gap; J9 ask in plain words: no (UC-092), only CHECK deployed; J10 step 2 sort by time due: yes (UC-040); J13 steps 3, 4, 5, 7, 8 reminders, standard and determination, filing or escalation, clocks, legal tools and counsel packet: built at the plane, no member surface (UC-113–115, UC-126, UC-164–166); J14 source changes: yes (UC-033, UC-039); J15 watch the publisher's docket: partial or no (UC-082, UC-083). Experience steps — (a) 1, 3 jurisdiction profiles: fixed and built; (b) 3 resolve subjects: fixed; (b) 4, 6 assistant surfaces a question, run: CHECK only; (c) 1 declare standard (profile source match): fixed; (c) 2 determination in force at the act's date: fixed; (c) 3 consequences: fixed; (c) decline to escalate: decided, not built; (c) breach action, counterparty from profile: fixed; (c) filing, counsel packet: fixed, no Tier 3 template by design; (c) deadline with legal basis: fixed; (c) plane marks overdue: "Not yet built" (stale vs UC-127); (e) delegating to the assistant: CHECK only, panel not built; (f) source identity over time: built at the plane, no member surface; (h) 1–3 records request: fixed, RECORDS_LAW_REFUSED not yet enforced; (i) source change: fixed, "weakened" unmet; (k) 2 determined_since: fixed; (k) 3 assistant suggestions from standards, deadlines, venues, legal organisations: plan mode not deployed; (k) 4 dates with basis, addressee by role and organisation: fixed; (k) 6–8 reminders, scenarios, checkpoints (1 to 3,650 days): fixed; (k) 10 legal option via filing or counsel packet: fixed, KIND_NO_TEMPLATE; (k) 11 counterparty's window (statutory or the group's): fixed. Audiences — government office or official (addressed by role and body; statutory clocks; compliance commended): fixed; oversight body (referrals at stage 7): fixed, needs "open"; named counsel (packet with chronology, standards' text, theories, binding deadlines, venue standard): fixed; AI run (find, pursue, extract, check; propose laws and standards; never state a law): fixed, only CHECK deployed; professional member (routed questions such as "a Brown Act or franchise-fee question"): fixed, routing not built; participant (own deadline reminders): fixed; newcomer and investigator ("Statutory clocks run whether or not the member is ready"; "Deadlines are deadlines"): fixed; partner group (reproducible analysis; strength across instances): open; operator (chooses jurisdiction profiles): fixed
- **Reported by:** D1 (x383, x465, x490, x515)
- **Constructs joined:** QUESTIONS, ORG, TIME, LAW, COURTS, ANALYSIS

### X190 · The matter page is where all six constructs meet (an act by an office; standards in force with captured text; a 30-day rule met on day 21 and a two-thirds threshold against 61.8%; a consequence computed from the resolution and the bond schedule at grade B; escalation clocks and triggers; grand-jury and court-petition tiers from the profile; assistant drafts), and it is not approved
- **Evidence:** view matter-page (VM); surface rules L1598–1600 (basis "open", "design view, not stated as approved"); K608 (4) (only the plan page approved)
- **Reported by:** D2 (x533)
- **Constructs joined:** ORG, LAW, TIME, ANALYSIS, COURTS, QUESTIONS

### X191 · Built but not reachable by a member: of about 115 layer-9 ops the member interface calls only `actionmove`, `actioncorrespond`, `actionlaws` and `actionrisktier` plus the action add flow; standards, conformance, consequences, filing-templates, filings, escalation, action-plans, local-facts and action-clocks have 0 UI calls, their due items surface as queue To-dos whose door the UI cannot open (it offers "Mark resolved"); several layer-1–5 construct services (`idmatch`, `relation`, `resolutiondefect`, agenda→file containment, `dangling`, `connectionassert`, bias ops, content ops, `profiles`) and the frontier, content axis, leads, intent and sources also have no UI calls; affordances offers per-object acts only for information, inquiry, action and project
- **Evidence:** `civicos-ui/app.html` (legacy UI, frozen as Bob's UX, K633); M1 reachability check; M2; M4; M5 (affordances; agent-worker R37)
- **Reported by:** M1 (x554, x555, x556, x557); M2 (x594); M4 (x618); M5 (x632, x633)
- **Constructs joined:** LAW, TIME, ANALYSIS, ORG, QUESTIONS
- **Notes:** M5: a new interface built "from the plane's publication" (DEC-8) would still need hard-wired knowledge of where layer-9 acts live. M4: the absence doctrine is fully built at the substrate but barely surfaced.

## Coverage check

- Bullets in `digest/CROSS.md`: 417 (lines beginning `- ` or `<n>. `, top-level or nested); the file was read in full, in chunks 1–170, 171–328, 329–478, 479–635.
- Register entries: 191.
- Every bullet in the ranges read maps to at least one entry (its line appears in that entry's *Reported by*); a bullet carrying several rules is cited under each. No bullet was dropped: exact duplicates are merged into the entry they repeat and listed there by reader id.
- Bullets per reader: C1 10, C10 11, C11 19, C12 8, C13 24, C2 17, C3 20, C4 20, C5 26, C6 9, C7 22, C8 41, C9 57, D1 45, D2 13, M1 30, M2 14, M3 12, M4 11, M5 8.
- Non-bullet content is carried too: D1's four index tables (use cases x385–x463, journey steps x466–x488, experience steps x491–x513, audiences x516–x526) are summarised row by row in the entry that cites x383, x465, x490 and x515; D1's paragraphs x356 and x379 and M1's paragraph x569 are cited in their entries; x213, x365, x383, x465, x490 and x515 are headings.
