# LAW: a construct study for BOB (#110), 2026-10-05

Analyst A-LAW. Inputs: `digest/LAW.md`, `digest/DOCTRINE-REGISTER.md` and `digest/CROSS-REGISTER.md`, all read whole; the `## Modules` sections of M1–M5; and the primary sources listed in §9. The citation `C4: CM 218` means reader C4's note, at that source and line. `Dn` and `Xn` are entries in the two registers.

**The answer in one paragraph.** The law should be held **below Publication**, and conformance should still be determined in **Action**. Move the `standards` module, whole, from layer 9 to layer 5 (Meaning), directly after `connections`. Keep `conformance` whole in layer 9, so a determination still rests on published findings (K102, DEC-26). The move costs nothing mechanically. `standards` uses only modules in layers 1–4 (record-grammar, jurisdictions, record-core, membership, promotion and content, per `build/modules.json`). Its code and its tests import nothing else (`standards/index.mjs:29–36`; `test/m/standards/*`). Every module that uses it sits later: conformance, filings and action-plans (layer 9), and affordances, control-plane and plane (layer 11). Whether it moves is Bob's decision, because changing a module's layer is his under P4 and `layers.md` ruling 5 as amended by P17. The canon put this work in investigation from the start (Functional Architecture: the layers are "concurrent", and Function 1 of Layer 2 is "Compare actions to standards"). The rationale for layer 9 (`layers.md` L72: "because a finding is published before a group acts on it") concerns *acting*, not *holding* the law.

## 1. Anticipated needs

**A. Find and hold the governing law**
- **N1 Find the standard the city set for itself, before any question exists.** Core. A member says: "Which ordinance or policy says how fast potholes must be fixed?" Sources: D1 journey 4 step 3 (L197: "Finds the standard the city set itself, with the assistant's help if wanted: an ordinance, a policy, a budget promise, a contract term"), which comes *before* step 4, "Turns the problem into a question" (confirmed in `journeys.html` on `origin/claude/gallant-brown-zg0wc1` @bb387fffb2). Also FA L1 Fn1 (C1: L131–134) and Roadmap §10 L650 ("Investigate: … compare to legal requirements").
- **N2 Know every law that governs a body or request (federal, state and local).** Core. "Which records laws apply to the County Assessor?" Sources: C4 CM 218–226 (D-149: "ALL records laws apply"); X90 (the record holds no map from agency to law).
- **N3 Hold the law's own words, with where and when they were taken, and the copy's status.** Core. "Is this code page the official text, or a codifier's copy that may be stale?" Sources: standards R2; the codifiers' terms say their pages are "informational purposes only and should not be relied upon as the definitive authority" (https://library.municode.com/termsofuse.htm); UELMA requires official electronic law to be authenticated and preserved (https://en.wikipedia.org/wiki/Uniform_Electronic_Legal_Material_Act).
- **N4 Find every document that concerns this ordinance or section (the reverse index).** Core. "Show me every agenda item, staff report and budget page that cites Ordinance 13579." Sources: C10 CON Step 4 L261–262 ("the single largest piece of manual work the framework can remove"); C3 CF §8.1 (a shared ordinance number earns grade B); DEC-95.3.

**B. Versions and time**
- **N5 The law in force on the date of the act, not today's text.** Core. "The transfer was in FY22; what did §13.04.080 say then?" Sources: conformance R3; C3 CF §11 src 1704 (a regulation superseded at a new URL is not modelled); legal research practice requires updating the law and checking a citator for amendment or repeal (https://law.gwu.libguides.com/statutorylaw/updating).
- **N6 Amendments, repeal, renumbering, recodification and codifier lag.** Regular. "The code online says X, but Council amended it in March; which governs?" Sources: RM App B (CPRA recodified 2023; C1); "A staff member may know an ordinance was adopted, while the public version still shows older language" (https://www.civicplus.com/blog/cs/why-codification-is-necessary/).
- **N7 Be told when cited law changes.** Regular. "The section our finding cites was amended." Sources: C3 CF §18.1 (pin the version, notify, ADOPT or KEEP; works per address only, X73); conformance R10 (`basis_changed`).

**C. Structure**
- **N8 Cite and hold law at the section and requirement level, one question per requirement.** Core. "Chapter 13.04 has five requirements; open a question for each." Sources: D1 journeys §3 L105 ("Capture the section and declare what it requires as a standard … Each requirement becomes a question"); DEC-23 (content is the unit the record points at; C11).
- **N9 Definitions, cross-references and exceptions read in context.** Regular. "The procurement rule has an emergency exemption in §2.04.050." Sources: DEC-60 (rule plus exception; C12); IS §5 (C5: does an emergency declaration excuse a contract?); D273 ("Undetermined, because the city does not define it").
- **N10 Hierarchy and conflict of norms.** Occasional. "Prop 218 overrides the municipal fee ordinance." Sources: DEC-76.3 (canons "higher over lower, later over earlier through `standards`' periods and `supersedes`, specific over general"); CM 791–795 (C4: Bob's utility example, a regulation against the constitution plus court decisions); X14.
- **N11 Contracts, policies, budgets and public commitments as standards.** Regular. "Is the hauler meeting the franchise's service levels?" Sources: D1 journeys L98–100 (franchise; bond purpose; overtime policy); DEC-27 (a required general audit; C11); C9 ACTION-PLAN line 65 (the two-thirds vote); RM §5 OP1 ("the law and its stated policies").

**D. Apply the law**
- **N12 Compare an act with a requirement during investigation.** Core. "What does the law require, what did the city do, where do they diverge, and what is still unknown?" Sources: FA Layer 2 Function 1 (src L254–261); IS §8 L770–783 (C5: the AI separates the conformance question from the factual one); CONTRADICTION-IDENTIFY §1 ("the rule requires X and the department did not-X").
- **N13 Determine compliance per standard after publication, and act on a breach.** Core, and built. Sources: AC §3 and §4 rule 2; conformance R1–R9; actions R8.
- **N14 Lawful skips and exception documents in a procedure.** Regular. "A sole-source award with no justification published." Sources: DEC-9 (C11); progressions R11 and R14.
- **N15 Deadlines that come from law.** Core; TIME owns it. Sources: layer 9 contract ("every deadline names its basis"); X41 (the basis is a string today, not a link to a held provision).
- **N16 The published finding states its criteria.** Regular. "Criteria: OMC 13.04.080 as in force on 1 July 2022." Sources: DEC-77.2 and DEC-84.10 (CCCER; C2); the GAO Yellow Book's finding elements (https://www.gao.gov/press-release/gao-issues-2024-yellow-book-updating-standards-government-auditing). Auditors define criteria as "the standard that the condition violates – a law, regulation, contract, grant agreement, common business practice" (https://lla.la.gov/resources/local-government-reporting/louisiana-governmental-audit-guide/400-1210-writing-findings).

**E. Explain and answer**
- **N17 Explain a charge or a rule.** Regular. "What's this sewer maintenance charge on my water bill?" Sources: D1 journeys §6 L529 ("Nothing finds and explains the ordinance or rate schedule behind a charge"); X154.
- **N18 The assistant proposes laws and standards with citations, and never states the law.** Core. Sources: UC-004 (Legal/Policy Lookup, partial); D274 (the assistant "Cannot… state a law, determine, file"). Legal AI tools hallucinated in 17–34% of benchmark queries (https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries).
- **N19 The counsel packet carries the standards' text and candidate theories.** Occasional, and built. Sources: filings R8–R14; DR §8 as amended (C1).
- **N20 Court decisions that interpret a provision.** Occasional; COURTS owns it. Source: journeys §6 "Following a court case" ("links a decision to the rule it interprets").

**How the work is actually done, and where it fails** (real-world research)
- Auditors and watchdogs work from **criteria**: the specific provision, quoted, set against the condition (Yellow Book; Louisiana guide, above).
- Researchers **update** the law: check supplements and session laws, and run a citator for amendment, repeal or a ruling that a provision is unconstitutional (GWU and South Carolina law-library guides; https://guides.law.sc.edu/LRAWFall/UpdatingStateStatutes).
- Local law reaches the public mostly through **codifiers**. ICC Code Solutions (General Code and American Legal Publishing) serves more than 7,000 communities (https://www.generalcode.com/blog/general-code-and-american-legal-publishing-unite-as-icc-code-solutions/), and Municode is owned by CivicPlus (https://en.wikipedia.org/wiki/Municipal_Code_Corporation). A code is "current through" the last ordinance a supplement includes, and some ordinances are never codified ("Omits"; supplement-history tables such as https://srpmic-nsn.gov/wp-content/uploads/2025/07/SupplementHistory.pdf).
- Enactment facts come from legislative systems. Legistar exposes `MatterEnactmentNumber`, `MatterEnactmentDate`, `MatterPassedDate` and `MatterStatusName` (https://webapi.legistar.com/Help/Api/GET-v1-Client-Matters). State bills are available through Open States with a free key (https://docs.openstates.org/api-v3/).
- The common failure modes:
  - citing today's code text for a past act;
  - trusting a codifier page that lags the adopted ordinances;
  - missing an uncodified ordinance;
  - missing an exception or definition elsewhere in the code;
  - joining on a number to the wrong instrument (CF §8.3: "Resolution No. 87751" for 87551; C3);
  - AI-invented citations (Stanford/Yale study, above).
- Free access is a legal right: under the government edicts doctrine no one may own the law, including official annotations (*Georgia v. Public.Resource.Org*, 2020; https://www.loeb.com/en/insights/publications/2020/05/georgia-v-public-resource-org).

## 2. Levels of support (the LAW ladder)

| level | what a member can do | needs served first at this level |
|---|---|---|
| **L0 Law as plain evidence** | Capture a code page, ordinance or contract and cite passages of it as legs, like any other document; nothing knows it is law. | (N12 by hand) |
| **L1 Law named** | Type citations (an action's governing laws; a deadline's or a declared flow's basis); identifiers are recognised (enactment numbers, code sections), and the record finds documents citing them. | N2, N4 |
| **L2 Law held, during investigation** | Declare a standard from its captured text (citation, kind, issuer, level, profile source, period in force, supersession); ask "in force on date D?"; cite a held standard from an inquiry, a contradiction, a flow or a deadline; the assistant proposes candidate standards with captured text. | N1, N3, N5 (whole-standard), N8 (by declaring each section), N11, N15, N16, N18 |
| **L3 Law structured and versioned** | An instrument (the work) has versions (points in time) and portions (sections, definitions); amendment, repeal and recodification are links that cite the amending instrument; cross-references and definitions are linked; a rank among levels comes from the profile; "what did §X say on D, and what changed it?" is answered with its basis, and codifier lag is stated. | N5 (portion-level), N6, N7, N9, N10 |
| **L4 Law applied and explained** | The assistant prepares a comparison per requirement (requires · did · reading), which a member evaluates; it proposes which canon may reconcile two norms; it gives a labelled, cited reading that explains a rule or a charge; unclear outcomes become questions; determinations after publication; breach actions. | N12, N13, N14, N17, N19 |
| **L5 Law shared and watched** | Import held law from public structured sources (Akoma Ntoso, USLM, eCFR as of a date) or from another group's case, with provenance; watch legislative systems for amending instruments; link court interpretations to portions; give each venue a standard of proof. | N6 (watched), N20 |

## 3. What exists now

The "built" column is checked against code by M1–M5. "Reach" is the member's op as declared and its number of legacy-UI calls (`civicos-ui/app.html`; M5 "Member reach today"). "AI" means a deployed AI path touches it. Only the `check` mode is deployed (run-rules `DEPLOYED_MODES`; M3), and the installer sets no model key (M3).

| module (layer) | what it provides for law (R ids) | built | member reach today | AI |
|---|---|---|---|---|
| jurisdictions (1) | `codes` and enactment kinds with coverage floors (R3, R6); `records_laws` (R7); `standard_sources` (R23); `LAW_LEVELS` federal/state/county/city (R31); action kinds and their laws (R25); venue evidence standard (R39). Oakland's profile: 3 standard sources (OMC and ordinances/resolutions measured M-24; Gov. Code `UNMEASURED`), 1 deadline rule. Citation patterns only; never a law's text, structure or version (M2). | yes | `profiles` UI 0 | plan mode only (not deployed) |
| id-spaces (1) | Recognises enactment numbers (kind and reach), normal form, crosswalks only from a captured document (R1, R4, R5, R17); judges sameness, never content or force. | yes | via `idmatch`, UI 0 | none |
| docprofile (1) | The `regulation` and `staff_report` readers emit `instrument`, `code_section` and `legislation` references with positions (`regulation.mjs:254–258`). "does not decide whether the instrument was ADOPTED" (`regulation.mjs:188–191`). No sections, definitions or amendment clauses. | yes | inside `acquire` (UI 7) | none |
| extraction (4) | `op=readingref`: every document whose reading carries a reference, such as `omc:13.04.080` (R28); agenda item to legislative file by containment, grade C (R52). A reading's date is capture time. | yes | `readingref` UI 1; `pdfstructure` UI 0 | EXTRACT not deployed |
| content (4) | Extents and citation checks for every citing module; version notice per address (R29–R31); envelope extent (tracked changes in draft ordinances, R33). | yes | reached only inside citing acts | mint labels |
| entities (5) | `ordinance` and `contract` entity kinds; DEC-114 makes a law a Subject kind; `idMatch` (R21); relations only `proxy_for`, `member_of`, `overlaps`. No link to a standard. | yes | `concerns` UI 22, `entitycreate` UI 1 | none |
| connections (5) | Citation graph and backlinks (R19–R23); agenda→file membership grade C (R30, R55–R57). | yes | `backlinks` UI 9; `filemembership*` UI 0 | none |
| progressions (5) | A declared flow carries a basis statement and citation (R2, R4); `unless_exception` stages; `dischargeStage` with a required citation (R14). The law that prescribes the flow is a citation string. | yes | yes (UI) | none |
| inquiry, contradiction (6) | `NORM_CANONS` and `conflict_of_norms` / `obligation_against_act` resolution kinds (inquiry R46–R47) as bare tokens; "nothing ranks norms, reads their dates or applies a canon" (M3). A leg targets only an information or inquiry bundle (inquiry R4). | yes | dispose UI 5; contradiction surfaces UI 0 | none on law |
| skills, agent-worker (6) | The `action_planning` layer names `standardpropose` and `comparisonpropose` (skills R28); plan mode reads `standard` and `determination` (agent-worker R51, `harness.mjs:296–303`). **No Legal/Policy Lookup or Government Compliance Analysis skill exists** (`standards/index.mjs:13`; C9 code §6). | yes | none | plan mode `deployed: false` |
| **standards (9)** | `standardDeclare` R1–R4 (`MACHINE_CANNOT_DECLARE_STANDARD`, reason per DEC-88); text required R2; profile match or undetermined R3; read with passage notice R5; one-successor supersession R6; `inForce` with three answers R7; `standardsIn` at a date R8; propose and adopt stored apart R9–R10; instance-wide, outside any project. One block of text, at most 50 content ids; no sections, definitions, cross-references or hierarchy (M1). 849 lines, 17 ids tested. | yes | 6 ops, **UI 0 for every one** | no caller (plan mode reads, undeployed) |
| **conformance (9)** | `determine` R1–R11 (per standard; rests on findings published by the same project, R2; standard in force at the act's date, R3); `comparisonPropose`, `comparisonRead`, `comparisonFacts` R12, R18, R21 (stored apart; may start from a contradiction); cause R22; no significance R8. 1,539 lines, 24/24. | yes | 6 ops, UI 0 | no caller |
| actions, action-grammar (9) | Governing laws `{level, citation}`, at most 12, set by a member, machine proposals stored apart (actions R18–R19; D-149); records-request `law` (action-grammar R3); a breach action rests on a live determination or an override (R8); "No outward text of this module names a law" (R41). `LAW_LEVELS` in actions is federal/state/local (`:613`), against jurisdictions' four levels (X78). | yes | **`actionlaws` UI 3, the one law act a member can perform** | none |
| filings, filing-templates, escalation, action-plans, action-clocks (9) | Counsel packet with the standards' text and theories (filings R8–R14); templates cite law in free text; escalation's exit is a live compliant determination per pursued standard (R14); a lobbying option `enforces` a standards id (action-plans R12); a deadline basis is a citation string (action-clocks R7). | yes | UI 0 (except action creation) | plan mode undeployed |
| affordances (11) | Publishes `law_levels`, `norm_canons` and resolution kinds; every layer-9 law act is a `NON_ACT`, never offered per object (M5). | yes | read by the UI | pack rendered |

**Where the system stands on the ladder.**
- **Built: L2, layer-9-bound, with a slice of L4** (determination and the comparison store). L3 is entirely absent. Because `standards` sits in layer 9, nothing in layers 5–8 can call it in code. Inquiry, contradiction, progressions, entities, retrieval, intent, reevaluation and publication cannot read a held standard (X23, X25).
- **Usable by a member today: L1, and only just.** A member can capture law and cite it as ordinary evidence (L0). They can type governing-law citation strings on an action (`actionlaws`). They see references and backlinks through `readingref`, `concerns` and `backlinks`. Declaring a standard, asking what was in force, comparing and determining are all built but unreachable (UI 0), and no deployed AI touches any of it (X191, D226).

## 4. Gaps

Severity: **B** = blocks core work; **D** = degrades it; **N** = nice to have.

| need | the missing capability | sev. |
|---|---|---|
| N1, N12 | Law cannot be held or read where investigation runs. `standards` sits in layer 9, so no inquiry, contradiction, flow or retrieval code can use it (X6, X8, X23). No member screen declares a standard (UI 0). | **B** |
| N1, N18 | No Legal/Policy Lookup skill; investigate mode not deployed; no FIND (X151, X153). The proposal store exists (R9), but nothing fills it. | **B** |
| N3 | A standard does not state its copy's standing: official or authenticated text against a codifier copy and its "current through" date (Municode terms; UELMA). | D |
| N4 | `readingref` and backlinks find documents by reference key, but nothing joins a held standard to its key or to its `ordinance` entity. "Every document that concerns this standard" is not one query (SD row 6's promise; C1). | D |
| N5, N6 | Versions exist only as whole-standard `supersedes` with one successor (R6). There is no instrument (work) that groups versions, no link to the amending instrument and its effective date, and no recodification crosswalk. A regulation superseded at a new address is unmodelled (CF §11). | **B** for any act older than the current text |
| N7 | Version notice works per address. An amendment published as a new ordinance at a new URL never reaches the finding (X73). | D |
| N8 | No portion structure (chapter → section → subsection); each requirement must be declared by hand as its own standard (journeys §6 "A code's structure"). | D |
| N9 | Definitions, cross-references and exceptions are not read or linked; the regulation reader reads references only and does not decide whether an instrument was enacted. | D |
| N10 | No rank among norms. `higher_over_lower` and `later_over_earlier` are tokens a member types; nothing supplies the rank or the dates (M3). | N (occasional) |
| N2, N15 | Two law constructs run in parallel: an action's governing laws, records law and deadline bases are citation strings, while standards hold text. Nothing links them, contrary to D368 (one fact in one place) (M1 CONFLICT). There are two `LAW_LEVELS` vocabularies (X78). | D |
| N13 | Built, but unreachable by a member (UI 0); the chain breaks at the screens (D226). | **B** for use; UX stream |
| N16 | The published form's Criteria cannot name a held standard; publication (layer 8) cannot read `standards` (layer 9). | D |
| N17 | Nothing finds the ordinance or rate schedule behind a charge, and the assistant may not state law (D274). No labelled "reading of a provision" form is defined. | D |
| N11 | Contract terms and commitments can be declared (kind `commitment`), but their parties, terms and duration are not modelled (ORGANISATIONS interface). | D |
| N20 | No link from a court decision to the portion it interprets (COURTS interface). | N |

## 5. Proposed architecture

### 5.1 Target level and why
**Target: L3 in the record and L4 in what the AI prepares, both available during investigation.** L5 comes later, on its triggers.
- The work is criteria-centred. Auditors, watchdogs and lawyers all quote the specific provision as it stood at the time of the act (§1). A comparison against today's text is wrong for any older act (N5), so whole-standard L2 is not enough.
- L4's AI work raises the risk without L3. A proposal that cannot name the version and portion it relies on is the hallucination failure the legal-AI study measured.
- Bob's frame is that "law and regulations are at the very heart of much of this work" (brief). The Case Making frame says the substrate "understands the legal/regulatory/policy framework" (C4: CM 107).

### 5.2 What to adopt from the real world
- **FRBR, as Akoma Ntoso and Laws.Africa apply it.** Adopt the *identity model and vocabulary*, not the XML in stage 1:
  - a **work**, an instrument "uniquely identified by a work FRBR URI which never changes";
  - its **expressions**, versions "at a particular point in time" (`…@2014-01-17`);
  - **portions** addressed inside an expression;
  - lifecycle **events** (generation, amendment, repeal), whose intervals refer to events rather than to bare dates.

  Sources: https://developers.laws.africa/content-api/works-and-expressions ; https://diff.parlamento.ai/docs/akn/frbr ; https://docs.oasis-open.org/legaldocml/akn-core/v1.0/os/part2-specs/os-part2-specs_xsd_Element_timeInterval.html. Why: it is the standard answer to "versions in force". Indigo, which is open source, runs it for municipal by-laws with "amendments, point-in-time comparison, complex commencements" (https://indigo.readthedocs.io/en/latest/). It also maps one-to-one onto the record's own doctrine: pinned versions, append-only change, supersession that never edits.
- **ELI's key.** Adopt the shape of its URI template (`/{jurisdiction}/{agent}/{type}/{natural identifier}/{portion}/{point in time}`, every component optional; https://en.wikipedia.org/wiki/European_Legislation_Identifier) for an **instrument key** composed only from profile data: the code's `key` and section, or the enactment space's kind and number. No place is written in code.
- **eCFR's as-of semantics.** An as-of read takes a date; point-in-time content is immutable; the source states how current it is (https://www.ecfr.gov/reader-aids/ecfr-developer-resources). Mirror this with `inForceAt(key, date)` and a stated "current through".
- **Legislative-system facts as the source of enactment and amendment events.** For example Legistar's `MatterEnactmentNumber`, `MatterEnactmentDate` and `MatterStatusName`, captured as documents with provenance. The regulation reader rightly refuses to infer enactment (`regulation.mjs:188`).
- **Audit criteria discipline.** Yellow Book Criteria/Condition/Cause/Effect, already DEC-77.2. The Criteria line names the held standard at its version.
- **Not adopted as code.** eyecite (Python; it could not run in a Worker) and USLM's schema. The profile's citation patterns already serve local codes. USLM and eCFR become stage-4 import sources.

### 5.3 Data model (it extends `STD-`; no new record type in stage 1)
- **Standard (as today, the version).** `STD-`, carrying R1's fields: cite, kind, issuer, text content ids, period, supersedes, reason. It gains:
  - `instrument`: the work key from the profile, for example `code:omc` or `ordinance:13579`;
  - `portion`: a path such as `13.04.080(b)`, or null for the whole instrument;
  - `requires`: an optional statement, in the member's words, of the requirement a group holds the government to (journeys: "declare what it requires");
  - `copy`: `official`, `codifier` or `undetermined`, from the matched source;
  - `current_through`: a date and its basis, when the copy is a codifier's;
  - `period_basis`: what the in-force period rests on, being an amending instrument's standard id, a captured enactment record, a codifier statement or `member`; the period stays undetermined when the basis is absent.
- **Instrument (the work).** A key, not a new object, in stage 1. All versions and portions sharing a key form the work. An `ordinance` or `contract` entity (DEC-114) may carry the same key, one fact in one place. If audit needs it in stage 2, it becomes a record object; deciding that is BOB's.
- **Law relations.** Each relation is evidentiary: it names the captured instrument or passage that makes it, carries an author class and a grade, and is stored apart while proposed.
  - Temporal: `amends`, `repeals`, `renumbers` or `recodifies` (a crosswalk only from a captured document, D184), each with an effective date.
  - Referential: `refers_to` (a textual cross-reference, which is an earned A/B connection, DEC-24/D183), `defines` (term → portion), `excepts` (portion → portion), and `implements` (regulation → enabling statute).
  - Temporal and referential relations are never one edge type (D192). These are not entities' constitutive relations (entities R26 still binds those), so search may traverse them, and identity resolution never does.
- **Rank.** `law_ranks` in the profile orders the kinds within each level, for example a charter above an ordinance above an administrative regulation. When the profile states none, rank is undetermined and no `higher_over_lower` canon is proposed.
- **As-of read.** `inForceAt({key, portion?, date})` returns `{version: STD-…}` or `undetermined` with a reason stated at its level: "no version held for that date", "versions held from 2024 only", or "codifier current through 2026-03-01; later ordinances not checked". `not_in_force` comes only from a stated bound (R7 today).
- **Requirement and obligation.** A *requirement* is a standard declared at portion grain with `requires` stated; it is the thing an inquiry asks about and a determination judges. The duty a body owes (DEC-107's "obligation") is ORGANISATIONS', and it names a standard as its authority. LAW supplies the authority and does not model the duty instance.

### 5.4 The layer question, settled

**The evidence.**
- (a) The canon makes law concurrent with investigation. The Functional Architecture's layers are "not phases … concurrent" (src L104–109). Legal/Policy Lookup sits in its Layers 1 and 2 (L227, L351), and Layer 2's outputs precede Layer 3's "Document" (L325–341). `standards`' own requirement cites "Layer 2 Function 1" (`standards.md` L15, L64).
- (b) The Action design's own rulings say the comparison is investigation. "Standards and comparisons … exist independently of any finding" (C9 build-state L295), and K102 ("the comparison before publication being inquiry work") is restated in `conformance.md` L99.
- (c) The journeys need a standard before any question exists (journey 4 step 3; the "law, code or policy" row).
- (d) Layer 5–8 constructs already presuppose held law:
  - contradiction's RESOLVE "later over earlier through `standards`' periods and `supersedes`" (DEC-76.3);
  - CCCER Criteria at publication (DEC-84.10);
  - a declared flow's cited basis (progressions R2/R4);
  - the ordinance entity (DEC-114);
  - the reverse index (C10 CON Step 4).
- (e) The layer-9 workaround reaches only the AI. A layer-6 AI may read layer 9 over plane ops, because P4 checks *imports* (PROCESS-DESIGN P4; X26). That serves agent-worker and the screens only. It does nothing for layer 5–8 *code*, and registration seams carry data, not services (X27).
- (f) The layer-9 placement rests on a rationale about acting (`layers.md` L70–72). Nothing in `standards` depends on publication.

**The options.**
1. **Stay in layer 9.** No work. Law stays unusable by inquiry, contradiction, flows, retrieval, intent, reevaluation and publication. N1, N4, N5, N12 and N16 stay blocked or degraded.
2. **Move `standards` whole to layer 5, after `connections` and before `progressions`. Keep `conformance` whole in layer 9. (Recommended.)** This is the "split" in substance: the law is held and read low, and conformance is determined in Action.
   - Its uses already sit in layers 1–4, and so do its tests' imports (verified).
   - Layer 5 already holds member-declared constructs over content: entities, and progressions with cited bases.
   - Every refusal moves unchanged (X24).
   - Determination stays after publication, so the breach doctrine is untouched (layer 9 contract; DEC-26; conformance R14).
3. **Move `standards`, and also split `conformance`'s comparison half** (R12, R18's `comparisonRead`, R21; ~150 lines at `conformance/index.mjs:911–1048`) into a new layer-6 module after `contradiction`. It is defensible, since the comparison uses only content, inquiry, contradiction and standards. It unlocks nothing now: no layer 5–8 module calls a comparison in code; contradiction is read *by* conformance (R21); the surfaces compose CCCER; and the AI and screens reach `comparisonpropose` by op. It would add a product module (Bob's). `contradiction` is 3,127 lines, too close to P6's mark to absorb it. **Defer it, with a trigger:** a layer 5–8 module must read a comparison in code.
4. **Move to layer 6 instead of 5.** Possible, but entities, progressions and retrieval (all layer 5) could then not use it. Rejected.

**The effect on every module that uses `standards` (option 2).**
- `conformance` (9): unchanged; its use stays earlier-in-order; R3's `inForce` is unchanged.
- `filings` (9): unchanged; the counsel packet still reads the standards' text.
- `action-plans` (9): unchanged; R12's `enforces` and the plan reads.
- `affordances` (11): unchanged.
- `control-plane` (11): unchanged; it routes the same six ops.
- `plane` (11): it constructs and migrates `standards` earlier. The standards tables depend on nothing later, so behaviour is unchanged.
- Mechanical, and BOB's:
  - `modules.json` (layer 9 → 5; position);
  - `layers.md`'s layer-5 and layer-9 rows;
  - `membership` R83 `MODULE_ORDER`, re-pinned and held by its test (the docket and case-checker precedent, `layers.md` L177, L188);
  - the format check.
- Bob's: the K11 text "(standards, conformance, …) sits between Publication and Operations" is amended. The layer-9 contract's words stay true ("a standard held in the record").
- **Newly possible users, each a uses edge and BOB's:** progressions, retrieval, query-language (by registration), inquiry, contradiction, reevaluation, intent, publication and case-authoring, actions, action-clocks.

**The reading of law needs no move.** Mechanical reading already lives low: the `regulation` reader is in layer 1 and readings and `readingref` are in layer 4; stage 1 extends them to structure. Interpretive reading ("what a term means") is the graded meaning axis (CF §14.3; C3) and is produced by the AI in layer 6 as labelled proposals. The same evidence applies to `local-facts`, which uses only layers 1–2; that call is TIME's (§7).

### 5.5 Module changes
- **`standards`** (moved to layer 5, and extended): `instrument`, `portion`, `requires`, `copy`, `current_through` and `period_basis`; law relations with their proposals; `inForceAt`; `standardsFor({key | entity | document | inquiry})` (the reverse index, over `extraction.readingref` and `connections`).
  - Estimated +700 to 1,000 lines, so about 1,800 in total, within P6.
  - If stage 3 takes it toward ~4,000 lines, BOB splits off `law-relations` under K617.
- **`jurisdictions`** (1): `law_ranks`; per-code `copy` (official or codifier) and where its "current through" statement appears; amending-clause vocabulary per code (data, never code).
- **`docprofile`** (1): the `regulation` reader adds a structure reading: section paths and headings, defined terms, cross-references, and amending clauses ("Section … is amended to read"), each with its position. It is a versioned recogniser (D105) and is never a verdict.
- **`extraction`** (4): a reading carries portions; `readingref` works by portion.
- **`entities`** (5): an `ordinance` or `contract` entity may carry an instrument key, to join with `standards`.
- **`retrieval` and `query-language`** (5): fields `standard:` and `cites:` (key or portion), with in-force status shown as of the date asked, never cached as "now" (M4's `overdue` defect, X46).
- **`contradiction`** (6): proposes the canon that may apply, from rank and periods. It is labelled, never picks a side and never names a GENUINE kind (DEC-84).
- **`progressions`** (5): a flow's basis may name a standard; the citation string remains.
- **`actions`** (9): a governing-law entry may name a standard; `LAW_LEVELS` unifies on the four levels (K108(1)).
- **`skills` and `agent-worker`** (6): layers `legal_lookup` and `compliance_analysis`; the investigate and assistant op tables add `standard`, `standards`, `standardinforce`, `readingref`, `standardpropose` and `comparisonpropose`.
- **Surfaces (the UX stream):** the Standards register (view F's design: citation · kind · issuer · source · in force on · text); declare from a selected passage; an "in force on" selector; "concerns this standard".
- **No new product module in stage 1.**

### 5.6 The AI's role
- **Run modes:** investigate (after VF-4 deploys it), the assistant's FIND, and plan (designed, not deployed).
- **`legal_lookup`.** From an inquiry's act, office and subject, and the profile's `standard_sources`:
  - search the four levels for provisions already held;
  - *request* capture of the code pages it lacks (D45: the AI never fetches);
  - propose standards with cite, captured text and a `why` (R9).

  A proposal whose citation resolves to no captured passage is labelled "not captured", and adoption is refused until it is captured (R1 `STANDARD_NO_TEXT`, extended to adoption). Acceptance rate is measured (DEC-95).
- **Structure proposals.** Portions, definitions, cross-references and amendments, read from captured instruments and stored apart. A member adopts any relation that changes an in-force answer.
- **`compliance_analysis`.** Rows per requirement (requires · did · reading) and open questions; never an outcome (conformance R12, `PROPOSAL_CANNOT_DETERMINE`).
- **Explaining a rule (N17).** A labelled reading that quotes the provision at a stated version, says what it cannot say ("undefined term", "exception at §…", "versions before … not held"), and ends with "Legal information, not legal advice" plus routing to declared expertise (MA §1.3). This follows the established line: information is general; advice is the law applied to a person's specific facts (https://www.in.gov/courts/publications/legal-info-guide). It never states "the law is", and never says whether to file (D274).
- **The member decides:** declaring and adopting standards, adopting relations, governing laws, determining, tier and filing.

### 5.7 Doctrine kept
- **The machine never concludes or attests; a member declares and determines.** AC §4 rule 1; standards R11; conformance R13; D1, D3.
- **Proposals are stored apart and adopted only by a member's act.** REC-195/D-149; D53; DEC-54 "INHALE MEANS PROPOSE FOR ADOPTION, NEVER INSTALL" (D16).
- **Labelled drafts; the assistant's words are labelled as the assistant's.** K1364 (D14); DEC-125 (D30).
- **Undetermined is first-class; absence is stated by level.** Standards R3 and R7; IC §U (D55, D56); the four-level search (layer-5 contract; D59, CF §8.3 "OUTSIDE THE RECORD'S REACH").
- **No jurisdiction in the product.** Ranks, code forms and codifiers are profile data (`layers.md` rules 1–5; standards R13; D196).
- **Relations.** Registry relations stay constitutive and are never traversed (entities R26; CF §13; D178). Law relations are evidentiary and cite a captured instrument; a crosswalk comes only from a document (D184; D192).
- **Version doctrine.** Pin, notify, ADOPT or KEEP; an authored edge is never re-pointed (CF §18.1; D182); declarations are append-only (D264; standards R4).
- **A breach rests on a published finding and a held standard.** Layer-9 contract; DEC-26; actions R8; conformance R14.
- **Neutral on policy.** No judgment of a standard's merit (OP1; standards R12; D380). Lobbying only enforces an existing requirement (K590 (6)).
- **Offices, not persons, as actor and addressee.** Actions R9 (D156); conformance's act actor `{role, body}` (D173).
- **What cannot be mechanised is published beside what is.** DEC-54's split, for any requirement extraction (C12).
- **The module rules.** P4 (one total order, checked on imports); P6; P17.

### 5.8 Runtime and deployment
- **Storage.** Everything lives in the instance's Durable Object SQLite. Versions, portions and relations are rows; the text stays as captured content, never copied. Even a large municipal code (thousands of sections) is far inside the 1 GB-per-object SQLite limit (https://developers.cloudflare.com/durable-objects/platform/limits/).
- **Compute.** Structure reading runs per captured page inside acquisition and extraction. That is within 128 MB of memory and, on the Paid plan, CPU up to 5 minutes and 10,000 subrequests (https://developers.cloudflare.com/workers/platform/limits/). Codifiers already serve a code page by page.
- **The AI** runs in `agent-worker`, its own Worker. Two deployment items gate it: the installer must set the instance's model key (today it does not: `NO_ACCOUNT_RESOLVED`, M3), and the investigate mode must be deployed (VF-4).
- **Keyless sources only.** Public codifier pages, the public Legistar web API and eCFR are captured as documents. A keyed service such as Open States waits for Bob's sovereignty call (D201; §8 D7).
- **Migration.** Moving the module changes no table. The new columns are migrations run at every instance (the K986(1) pattern).
