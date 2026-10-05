# Brief for the second constructs study (BOB #112, 2026-10-05)

## Why
The first constructs study (folder `../`, pinned at commit `892fca16c4`) studied six constructs: time, organisations and obligations, law, courts, analysis, and questions through the assistant. Bob ruled on it (B1 (c), K1432: every construct reaches L5, its full ladder, within realistic resources and without slowing everyday use). Since then Bob has named three more constructs, in his words:

> **PEOPLE** (B8, K1452): "Tracking the activities, statements, and connections between individuals is - and has always been - an essential element of investigations. ... People is another construct the system needs to fully support. For example, who is the deputy director of city planning? What's their name? What other jobs have they had throughout their career (related to the city or otherwise)? Where did they go to school, what degrees, licenses, military service, or other credentials is known about the person? Etc. The organization should be aware of departments and staffing, but also the people within the organization - today and in the past. Understanding a person's history is the substrate for exploring who knows who, even if their current circumstances don't connect them. The organization construct tracks multiple organizations, whether they're government agencies, companies, non-profits, or other groups (social clubs, associations, political, etc)."
> B8a (K1455): no special rule for family members, minors or sensitive personal facts: any family tie or personal fact a cited document states may be held.

> **EVENTS** (K1457): "Understanding how actions are related is another important construct. When I use the word 'action' here, I'm not referring to the actions a group might take in response to a finding. I'm referring to the series of things that happen in the world and the relationships between these events that investigations must understand."

> **MONEY** (K1457): "Another very important construct is money - where it comes from and where it goes, but also the rules that govern its movement, the commitments made, the things it buys and amount produced for goods and services."

And on how this study must be done (K1459): "it's important this research that we're doing is done with full knowledge, not just scanning the canon. If another full study of existing architecture is needed, then let's do that so that the work and the results are proper and fully informed."

So this study asks, for PEOPLE, EVENTS and MONEY, what the first study asked for its six: the levels of support the system may need (to L5); what it can do now; which modules and AIs provide it; what is needed for the anticipated work; and the architecture for that support. **And** it asks how the three change the six already studied and the architecture across all nine: the total order, the modules (new, widened, merged), the shared models (as-of, grades, identity), and the doctrine.

## Bob's direction on the architecture (K1460, 2026-10-05)
> "As you do the research on these additional constructs, you should give proper consideration for the fact that the needed support for those constructs will require an awareness of how the set of constructs fit together and will interact. The architecture should be load-bearing and based on best practices with all system requirements given proper consideration."

So no construct is designed alone. Every proposal is judged by how it fits and interacts with all nine constructs (time, organisations and obligations, people, events, money, law, courts, analysis, questions): shared identity and resolution, shared as-of and validity, shared grades and provenance, one home per fact, and the flows between constructs. "Load-bearing" means the architecture must carry every later rung to L5 without rework, under real data volumes, and must be grounded in established practice (domain and data modelling, temporal and bitemporal data, entity resolution, event and ledger modelling, provenance, and the standards each construct names), cited. **All system requirements** count, not only the functional ones: the fifteen Design Requirements (`src/BIO_Design_Requirements_v2.txt`); the mission's values and operational principles (Roadmap §§1–12); the Technical Architecture Decisions and the runtime (Workers, Durable Objects, request and storage limits, one scheduler alarm); performance on members' everyday path (K1432's "without slowing everyday use"); security, privacy and safety of people in the record; sovereignty and no required vendor key (D201); reproducibility and recreatability without Civicsmith (DEC-112); publication rules; module size and total order (P4, P6); testability (every requirement tested, P7).

## Bob's rulings during the study (premises from here on; `build/rulings.md` K1462–K1468)
- **K1462 names:** "events" for things that happen in the world, with the internal renames as proposed; the government act becomes a kind of event; members see a "timeline". People: members, sources, people.
- **K1463 money:** the construct and module are `money`. The group's own money is followed like anyone else's and reported impartially, with no mark that it is the group's (the MONEY study's M-B1 is set aside); action-plans R26's ban on cost and budget keys on the group's own plans stands.
- **K1464 date-times:** world facts are recorded as date-times with their precision and zone (day precision is not an exact midnight); comparisons stay three-valued.
- **K1465 people in acts:** who decided, authored, signed or implemented an act is recorded as a participant with their role ("if somebody signed an order that was against a stated policy or law, then that's very important fact"). Design Requirement 6 is to be refined; and every element of the canon and of Bob's rulings that says no attribute of a person may filter or order anything, or restricts naming a private person, is to be listed with proposed new wording for Bob.
- **K1466 due dates and plans:** a duty's occurrence state is recorded as met or not, and an action-plan step may be conditioned on it (an overdue response activates the next step).
- **K1467 hunches:** hunches and hypotheses (a hypothesised cause included) have a place, labelled, but are never facts and never influence findings.
- **K1468 extraction:** a spreadsheet is a document and its figures and formulas are content; extraction is targeted at a member's request, tied to a basis or claim, and ongoing as the work proceeds; extracting everything is rare.
- **K1469 connections:** Bob: "I think of connections as the heart of an investigation" (decisions and spending, donations and contracts, and many more). Every kind of relationship keeps its one owning module but shares one connection shape (what it joins, kind, when it held, evidence, grade) and one bounded, as-of exploration read across all of them; never ranked, never machine-asserted; the built `connections` (document co-mention) becomes one kind.
Bob also asked: "aren't ties a type of connection?" (the member-facing words for document co-mention and for ties between people are his, as UX; the synthesis proposes them).

## The product
Civicsmith (formerly CivicOS; repository `bio`, /home/user/bio, branch `tranche/T32`) is an evidence engine for civic watchdog groups: members capture public documents with provenance, extract content, investigate through inquiries with graded findings, publish cases, and act (filings, escalation) to bring a government back into conformance. One instance per group; any jurisdiction (local knowledge lives only in jurisdiction profiles as data). It runs on Cloudflare Workers and Durable Objects.

## Where things are
- The sources you read are in `src/` (plain text, folded at 900 characters, nothing else removed), rebuilt by `make-src.sh` at pinned commits: product `tranche/T32` @ 597f20e11c, design branch @ e4a98364f5, the archived DEC ledger on `coord`.
- The first study, all of it, in `../` (the parent folder): `../studies/*.md` (six studies), `../reviews/R-*.md`, `../synthesis/constructs.md` (with §5A and §5B: Bob's rulings since), `../synthesis/BOB-REVIEW.md`, `../digest/DOCTRINE-REGISTER.md` and `../digest/CROSS-REGISTER.md`. Its reader notes `../notes/*.md` were taken for the six constructs only; this study re-reads the sources for the three.
- The capability ladders, canon since K1432: `src/BIO_Capability_Ladders_v0_1.txt`. **Its §5A PEOPLE, §5B EVENTS, §5C MONEY and the passages threading them through the other sections were drafted by BOB #112 from targeted reading and are marked provisional (K1459).** Treat them as hypotheses to test, never as premises or evidence; your conclusions may keep, change or discard any of them.
- Build state: `build/layers.md`, `build/modules.json`, `build/requirements/<module>.md`, `build/rulings.md` (K rulings; Bob's rulings since the first study: K1432, K1452, K1455, K1457; BOB's under Bob's delegation K1437: K1438–K1451, K1453, K1456, K1458), `build/plan/archive/T32.md`.
- Code: `bio-plane/src/<module>/`, `agent-worker/`, etc. (paths in `build/modules.json`). The UI is `civicos-ui/app.html`.

## Layers today (total order; a module may use only earlier modules)
1 Foundations: record-grammar jurisdictions test-support runtime-limits signatures bundler id-spaces subresources ooxml office-readers odf-reader pdf-reader format-registry text-chain site-profiles docprofile image-codecs pdf-pixels pdf-worker ocr-worker
2 Record and authority: record-core membership credentials promotion
3 Intake and provenance: host-governor provenance attestation provenance-routes capture-sources acquisition capture sources
4 Content: calibration reading-pipeline extraction content
5 Meaning, bias and retrieval: entities connections progressions bias observation-log query-language retrieval
6 Inquiry and the assistant: inquiry-grammar accepted-work inquiry citation basis-versions strength contradiction run-rules ai-runs run-productions capture-requests skills agent-worker
7 Understanding: intent reevaluation
8 Publication: case-grammar corpus-export case-carriage publication docket public-read project-stage network-notices ratification case-checker case-import case-disclosures case-authoring review
9 Action: local-facts standards conformance consequences action-grammar actions action-clocks filing-templates filings escalation action-plans
10 Operations: monitoring link-sweep scheduler
11 Interface and distribution: wizard-scripts affordances tasks queue-producers queue instance-setup op-declarations admission control-plane plane legacy-ui(legacy) installer
Ruled but not yet built (first study, K1438–K1439): `standards` and `local-facts` move to layer 5; new `civil-time`, `calc-grammar` (L1), `lines`, `calculations`, `chronology`, `duties` (L5), `answers` (L6), `sheet-worker` (L1 fleet Worker), and the split of `agent-worker`.

## Rulings in force that bind this study (premises, not questions)
- B1 (c), K1432: every construct to L5, staged by dependency, realistic resources, everyday use never slowed.
- K1438–K1451: the first study's B2–B7, B9–B11, B13–B15, B16 (iii)–(iv), B17 (i), (iii), B19, as recommended there.
- K1452, K1455: people are tracked fully (above); Design Requirement 6 (a published work product names an individual only in official capacity in connection with a documented act) still governs publication; it does not limit what the group's record holds.
- K1457: events and money are constructs, to L5.
- Still open with Bob: the first study's B12, B16 (i)–(ii), B17 (ii), B18, B21, B22 (see `../synthesis/constructs.md` §5, §5A). Do not re-decide them; say where this study bears on them.

## Doctrine any proposal must keep (cite where you rely on it; the first study's `../digest/DOCTRINE-REGISTER.md` gives the homes)
- The machine never concludes or attests; it proposes and prepares; a member decides.
- Words a script or AI places are a labelled draft, the member's only once kept (K1364).
- Every derived thing carries a basis and a grade; "undetermined" is first-class.
- Four-level absence: a statement of absence names the level searched.
- No jurisdiction in product code; local knowledge is profile data.
- `entities`' relations are constitutive and never traversed (entities R26; Content Framework §13); `lines` (ruled, K1439, K1442) are evidentiary and may be walked bounded, as of a date, no ranking.
- Cause: DEC-84 (10): a cause is member-authored and published only when evidenced; a hypothesised cause stays in the working inquiry, published as "cause not established".
- Actions R9: the addressee of the group's own action is an office by role and body.
- P4 one total order; P6 a module fits in one reading (~4,000 lines).
- **Changed by Bob since the first study:** the rule "offices, never private individuals" no longer limits the record (K1452, K1455); the first study's B8 (a) is set aside.

## Taken words
"Case" (a group's publication, DEC-72), "docket" (a case's public response log), "standard" (law held, or the evidence bar), "obligation" (a public body's duty, DEC-107; also a member's queue item code), and **"action"** (the group's own act in response to a finding, `BIO_Action_v0_1.md`): Bob's "actions" in the EVENTS quote means events in the world. Name new constructs and objects so they do not clash, and say why.

**Names BOB proposes, to be tested by the analysts and reviewers (internal names are BOB's; the words members see are Bob's, as UX):** (1) keep **event** for things that happen in the world, and rename the internal uses (monitoring significance "event/notice/routine" → "significant/notice/routine"; notification and queue "events" → "notices", "queue changes"; document-change events → "change kinds"); fold the government act (`ACT-`, conformance) into events as one kind; the module `events` replaces `chronology`, which stays only as the counsel packet's section; members see a **timeline**. (2) money: **money facts** and **flows**, never "ledger" (an action's correspondence ledger); "budget" is a stage value, so action-plans R26's ban on `budget`/`cost` keys stands; consequences' amounts become money facts a consequence cites. (3) people: **members** (the group), **sources** (who gave material), **people** (whom the record is about), linked where one human is two; who-knows-who is **ties** (held as `lines`), never "connection" (document co-mention) or "relation" (entities' constitutive, untraversed relations). Say where a name fails and propose a better one.

## Rules for you
Read-only: never edit, commit or push in /home/user/bio or /home/user/civicos-process. Write only in this study folder. Read whole, never scan. Verify "built" against code. Cite file:line, doc §, R id, DEC or K.
