# standards — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). N72 and the layer-9 maps' review folded 2026-09-27 (K171): R3's `level`, R9's `proposalLabel`; no meaning changed. DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code and the canon, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 9 (Action); since T33, layer 5, after `observation-log` and before `progressions` (K1438). A new module: no `from`, nothing moves. Code today (measured on `tranche/T3` @ `b0656fa`): **none holds a standard.** Nearest, and staying where it is:
- D-149's governing laws of an action: `bio-plane/checks/bio-checks.mjs` 643–657 (`LAW_LEVELS`, `GOVERNING_LAWS_MAX`, `CITATION_MAX`), `governingLawsOf` (676), the proposal label (`lawProposalState`, `lawProposalLabel`, 770–800); `bio-plane/src/store.mjs` `actionLaws` 7180–7263, `#lawEntries` 7264, `actionLawsPropose` 7520–7576, `#lawProposalsFor` 7577. These are the laws the group's own request is made under, not the standard a government act is measured against: they stay `actions`' (REC-201 is carried there). Their member-states, machine-proposes, stored-apart pattern (REC-195) is the model for R9–R10.
- `docprofile/doctypes/regulation.mjs` 255–260 and `staff-report.mjs` 301 emit `code_section` and `instrument` references from a document's text, keyed by the profile's `vocabulary.codes` and enactment kinds: the place a citation to a standard is first read. `id-spaces` normalises enactment numbers.
- `jurisdictions` R23 (`standard_sources`), built in T2 with both profiles (`jurisdictions/profiles/*.mjs`).
No old-plan row is carried to `standards`; no check in `bio-checks.mjs` belongs to it. N309 wordings folded by BOB #62, 2026-09-29 (K380). DEC-88's reason, by a worker for BOB #90 on `tranche/T22`, 2026-10-01 (`build/plan/t22-dec88-audit.md`; K1025): R1 (the declarer's reason, `STANDARD_NO_REASON`, C-112.20) and R10 (an adoption takes it as R1's); not yet met (T22). T33's fold, by a requirements worker for BOB #114 on `tranche/T33`, 2026-10-05, from plan entry T33-31 (entries A LAW and COURTS, B B1a.7; scope §1 LAW, COURTS, TIME; Choices 18; `measures-T33/time-law.md` §4; K1438, K1442, K1446, K1447, K1449): the module moves whole from layer 9 to layer 5, after `observation-log` and before `progressions` (K1438); R1, R7, R9 and R14 amended; R18–R30 added (the instrument key and portion, `requires`, `copy`, `current_through`, `period_basis`; `inForceAt` through `civil-time.validAt`; `standardsFor`; member-recorded law relations, temporal and referential kept apart; recodification across addresses; the citation resolver; L4 links and treatment rows held as data; the connection owner; the listener order after the move; the tables declared explicitly); Uses gain `entities`, `events`, `civil-time`, `extraction`, `connection-grammar`, `acquisition` and `id-spaces` (the plan's `connections` edge is not needed by any requirement here); not yet met (T33-31).

**Size (P6).** New. Estimated 500–800 lines of code with its tables; one session reads it with the public parts of `jurisdictions`, `record-core`, `membership`, `promotion` and `content`.

## Public

### Purpose

A standard is what a government act is measured against: a statute, regulation, ordinance, court decision or order, adopted policy, or public commitment (Functional Architecture, Layer 2 Function 1). This module holds each standard as content in the record, with its citation, its kind and issuer, where it comes from (a jurisdiction profile's `standard_sources`, or undetermined), and the period it was in force. It says which standards were in force at a date. It judges nothing about a government act (`conformance` does) and nothing about the merit of a standard (Operational Principle 1).

### Provides

Terms. A **period** is `{from, to}`, each a `YYYY-MM-DD` date or null; null is "not stated in the record", never "always". A **source** answer is `{state: "matched", source, kind, issuer, level, profile, basis}` or `{state: "undetermined", why}`; `level` is the source's level (`jurisdictions` R23, R31), or `undetermined` when the entry states none.

**standardDeclare({cite, kind, issuer, text, period, supersedes?, reason, author, viewer}) → `{ok: true, id, source, ...}` or refusal**
- **R1** Refusals in order: `MACHINE_CANNOT_DECLARE_STANDARD` (K251; an empty author or a machine identity: a machine proposes, R9); `STANDARD_NO_CITE` (an empty citation, or over 200 characters); `STANDARD_KIND_UNKNOWN` (outside `statute`, `regulation`, `ordinance`, `court`, `policy`, `commitment`, the set of `jurisdictions` R23); `STANDARD_NO_ISSUER`; `STANDARD_NO_REASON` (C-112.20, a new row, stamped by 1.53.0: the `reason`, the declarer's words on why the group holds its government to this standard, absent, not a string, blank or over 2,000 characters; DEC-88, K1025); `STANDARD_NO_TEXT` (no content id); `STANDARD_TEXT_UNRESOLVED` (a content id `content.contentRow` does not hold, naming it); `STANDARD_PERIOD_INVALID` (a date not `YYYY-MM-DD`, or `to` before `from`); `STANDARD_SUPERSEDES_UNKNOWN` (R6); then R18–R19's refusals for the fields they add, when given. The reason is read back with the declaration (R4, R5).
- **R2** `text` is one or more content ids: the standard's own words as captured. A standard is never held without a capture of its text (Intake Doctrine: material enters only with provenance).
- **R3** The citation is matched against the `cite` pattern of every `standard_sources` entry in the active profiles' combined view (`jurisdictions.combine` over the list `record-core` holds). The first match gives `source: matched` with that entry's `source`, `kind`, `issuer`, `level`, `profile` and `basis`; a matched entry with no level answers `level: undetermined` beside the match (K108 (5), K171). No match, no active profile, or a withheld fact (`jurisdictions` R15) gives `source: undetermined` with why; the standard is still held (K102): the profile describes local sources and does not decide what law a group may hold its government to. A declared `kind` or `issuer` that differs from the matched entry's is kept as declared and the difference is stated beside it, never corrected.
- **R4** The answer and every later read carry who declared it and when (this module's clock), and the declaration is never edited: a correction is a new standard that supersedes it (R6).

**standardRead({id, viewer}) → answer or refusal**; **standardsIn({at?, kind?, source?, cite?, after?, limit?, viewer}) → `{items, cursor, truncated}`**
- **R5** `standardRead` answers R1's fields, R3's source, the declarer and time, what it supersedes and what supersedes it, and for each text content id its standing (`content.standings`) and whether a newer capture of its document holds the passage (`content.passageNotice`), so a changed statute text is seen and nothing is moved. `STANDARD_NO_ID` (its own row C-112.11; K369); an absent id, and any id for a viewer naming no member, is `NO_SUCH_STANDARD`, one answer (R17).
- **R6** `supersedes` names an earlier standard (an amendment, a renumbering, a later decision). The earlier one stays readable, and both reads name the link. A standard is superseded by at most one standard; a second is refused `STANDARD_ALREADY_SUPERSEDED`, naming the first.
- **R7** `inForce(id, date) → "in_force" | "not_in_force" | "undetermined"`, with why: `not_in_force` only when a stated bound excludes the date; `undetermined` when a bound needed to decide is null; never a default. It is kept as an alias of R20's `inForceAt({standard: id, date})`, answering exactly its state and why, so its callers (`conformance`, `filings`, `action-plans`, `affordances`, `control-plane`, `plane`) need no change (Choices 18).
- **R8** `standardsIn` lists the standards the filters admit, in id order, at most 200 per page (a lower `limit` is honoured, a higher one is not), `truncated` measured by reading one past the page. With `at`, a standard is listed with R7's answer for that date, and `not_in_force` ones are left out.

**noSuchStandard(standardId, extra?) → refusal** (N309, K231, K275; a module-level function)
- **R17** The one answer to one condition: no standard the caller may read answers to `standardId` (absent, or any id for a viewer naming no member, answered alike; R5). It answers `{ok: false, reason: "NO_SUCH_STANDARD", code: "NO_SUCH_STANDARD", check, translation, standard, detail}`: `standard` the id as asked (null when none), `detail` one fixed sentence, the same for every caller, and `check` and `translation` its catalogue row's. `extra` adds a caller's own fields and never replaces these. R5 answers through it, and every act of a later module that answers this condition answers through it (`conformance` R1; `filings` R14 passes R5's answer through), so the code is minted at one site; its one catalogue row is this module's (C-112.10), its `where` naming this function, and conformance's C-113.9 gives way to it. It writes nothing and never throws.

**standardPropose({cite, kind?, issuer?, text?, why, act?, proposer, viewer}) → `{ok, proposal}`**; **standardAdopt({proposal, author, viewer, ...R1's fields})**
- **R9** A proposal (the Legal/Policy Lookup skill's work, or a member's suggestion) is stored apart from standards, labelled with who proposed it and whether it is machine work (`record-grammar`'s `proposalLabel(proposer, "standard")`: `lawProposalState`'s three states, one composer, K171), with a `why` of at most 240 characters. It is never a standard, never read by `standardsIn`, and is answered with a sentence saying so. A proposal may be stored with no captured text, and says so; it cannot be adopted until a member names its captured text: `standardAdopt` refuses it `STANDARD_NO_TEXT` (R1), whatever the proposer stated (ladders §6.4: the `legal_lookup` skill proposes standards with captured text).
- **R10** `standardAdopt` is R1 by a member, naming the proposal; the new standard records the proposal it came from, and the proposal records its adoption. A proposal is adopted at most once. The adopting member's own `reason` is R1's (`STANDARD_NO_REASON`); the proposal's `why` (R9) is the proposer's and does not serve as it (DEC-88; K1025).

**standardsOf(host) → the module's instance**
- **R16** Constructing the instance creates every table this module declares to purge (R14), as the other factories do, so every service here and `record-core`'s purge succeed after construction with no caller calling `migrate()` (N220, N267, K267).

**T33: law structured and versioned** (T33-31; ladders §2 LAW, §6.4 L2–L3, §7.4 COURTS C1 and L4 links; K1438, K1442, K1446, K1447, K1449)

*The instrument, its portions and its copy*
- **R18** A declaration (R1) may name `instrument`, `portion`, `requires`, `copy`, `current_through` and `period_basis`. `instrument` is a work key shaped like ELI, composed by `instrumentKey({cite, view})` only from profile data: `jurisdictions` R50's `instrument_key.jurisdiction` segment, the matched `standard_sources` entry's `key` segment and the instrument's own number or section path as the cite states it; a source with no `key`, or no active profile, answers the key `undetermined` with why, never a key with a place in code. `portion` is a path within the instrument (the section path the `regulation` reader reads, `doctypes` R10) with the content id of its extent in the standard's text (`STANDARD_PORTION_NOT_IN_TEXT` when the extent is not one of the standard's text rows). Standards sharing an instrument key are its versions; a portion is answered as of a date by R20.
- **R19** `requires` is the list of passages of the portion that state what it requires, each a content id among the standard's text, quoted, never paraphrased (the comparison's "requires", ladders §6.3 L4). `copy` is `official`, `codifier` or `undetermined`, defaulting to the matched source's code `copy` (`jurisdictions` R6), and stated as declared beside it when a member declares otherwise. `current_through` is the date the copy states it is current through, with its basis (a codifier's banner, captured), or null for not stated. `period_basis` names what the period rests on: a cited passage, or an enactment event (`EVT-`, `events`) with the edge used (`start` or `end` of its `when`). Malformed values are refused `STANDARD_FIELD_INVALID`, naming the field.

*In force at a date*
- **R20** `inForceAt({key | standard, portion?, date, viewer?})` answers `{state, why, standard, version}`, `state` `in_force`, `not_in_force` or `undetermined`, through `civil-time.validAt` over each version's period: a period bound given as an event is read from that event's `when` (`events`), and an event with no `when` or an undetermined band answers `undetermined` with why. With a key, the version whose period covers `date` answers; two versions both covering it, or none deciding it, answer `undetermined` naming them. An adopted temporal relation (R23) bounds the period of the version it amends, repeals, renumbers or recodifies at its effective date. A date after a codifier copy's `current_through` with no later version held answers `undetermined` with "versions after <current_through> not held" (codifier lag, `measures-T33/time-law.md` §4), never `in_force`. It writes nothing and never throws.
- **R21** `standardsFor({target, limit?, viewer})` is the reverse index (LAW N4): for a held standard (or an instrument key, with an optional portion) it answers every document whose reading cites it (a reference `extraction` holds whose recognised key or cite matches the standard's instrument key or cite, by R3's patterns), and for a document (a bundle or capture) the held standards its readings cite. Each item carries how it matched. A document the viewer may not see is neither answered nor counted. `limit` is clamped to 1–500 (default 100), with `truncated` by reading one past.

*Law relations, recorded by members* (D192; ladders §2 LAW; K1443: the machine only proposes them)
- **R22** The relation types are two closed sets, kept apart and never mixed in one list or read: temporal `amends`, `repeals`, `renumbers`, `recodifies`; referential `refers_to`, `defines`, `excepts`, `implements`. `LAW_RELATIONS` exports both, frozen.
- **R23** `lawRelate({type, from, to, citation, effective?, reason, author, viewer})` (`op=lawrelate`) records one relation from one standard or portion to another, by a member's act: refusals, in order, `MACHINE_CANNOT_RELATE` (a machine or empty author), `LAW_RELATION_UNKNOWN`, `NO_SUCH_STANDARD` (R17) naming the end, `PORTION_UNKNOWN`, `LAW_RELATION_NO_CITATION` (a temporal relation cites the amending instrument's extent, a referential one the referring passage, a content id of a held standard's text), `LAW_RELATION_NO_EFFECTIVE` (a temporal relation with no effective date or enactment event), `STANDARD_NO_REASON`. A relation that would change an R20 answer is recorded only this way, by the member's act; a machine's suggestion of one is a proposal (R9's pattern) and never moves an answer. `lawWithdraw({relation, reason, author})` withdraws one, kept with who, when and why.
- **R24** Recodification across addresses: `addressesOf({key, portion?})` follows the adopted `renumbers` and `recodifies` relations both ways and answers every key and portion the provision has been held under, each with the relation and effective date that moved it, bounded by `connection-grammar`'s default depth (`truncated` past it). `reevaluation`'s version notices across addresses read it (X73). It never throws.

*The citation resolver* (COURTS C1; K1449)
- **R25** `resolveCourtCitation({citation, viewer, lookup?})` takes a court citation as `id-spaces` reads it (its R27) and answers `verified` only when a held capture states that citation and the viewer may see it: a `court` standard whose text, or a capture of the opinion it rests on, states the volume, reporter and page, naming the capture and extent. Otherwise it answers `not verified`, refusing nothing (D88). With `lookup: true` and the keyed lookup switched on (`acquisition.citationLookup`, its R37), it adds the service's matches, labelled as the service's and never as `verified`; switched off, it answers without them and says so. It writes nothing.

*Court links and treatment held as data* (COURTS L4, links as data; D134)
- **R26** `courtLink({type, from, to, citation, reason, author, viewer})` records, by a member's act, `interprets`, `applies` or `holds_invalid` from an extent of a `court` standard's text to a portion of a held statute, regulation or ordinance; refusals as R23's, and `NOT_A_COURT_STANDARD` when `from` is another kind. A machine's suggestion of one is a proposal.
- **R27** `courtTreat({decision, treatment, by_decision, citation, reason, author, viewer})` records a treatment row: `treatment` one of `reversed`, `vacated`, `depublished`, `overruled`, `affirmed`, citing the later decision's extent. `stillStanding({decision, date})` answers `standing`, `not_standing` (a held `reversed`, `vacated`, `depublished` or `overruled` effective on or before `date`) or `undetermined` where the later history is not read, saying so; never a default of standing.

*The connection owner* (B1a.7; `connection-grammar` R2, R6–R9)
- **R28** The module registers once at load as a connection owner of its law-relation kinds (R22, class `evidentiary`), its court links (R26, `evidentiary`) and the derived kind "in force at an event's date" (class `derived`), each with its members' word (K1486). `neighbours({node, kinds, at, page, viewer, scope})` answers, for a standard node, its relations and links valid at `at`, and for an event node the held standards in force at the event's `when` (R20), each derived item with its method (R20's) and `connection-grammar.derivedId`; an undetermined in-force answer is returned marked so. Its owner-conformance battery (`connection-grammar` R9) runs in this module's tests.

*The move and its order* (K1438; R-2 L-E7)
- **R29** The move to layer 5 changes no answer: a standard's promotion (R15) answers the same, with the same checks, when every registered promotion listener of layers 5–8 runs in `membership`'s `MODULE_ORDER` after the re-pin (T33-19a); a test registers them all and shows it.

## Private

### Uses

- `jurisdictions`: `combine` (R3); the kinds of R23; a source's `level` (R23, R31).
- `record-core`: `getSetting` (the active profiles), `allocId`, `transact`, `stampInstant`.
- `record-grammar`: `isMachineIdentity`, `proposalLabel` (R1, R9); the `STD-` type registration (R15).
- `membership`: `viewerPredicate` (R5; a member sees every standard).
- `promotion`: `promote`, a standard being a record object (R15, K102).
- `content`: `contentRow`, `standings`, `passageNotice`.
- `civil-time`: `validAt`, the validity value (R20).
- `events`: an event's `when` (R19's `period_basis`, R20, R28).
- `entities`: an issuer as an entity, where a source names one (R18; `entities` R7).
- `extraction`: the `reading_refs` read contract (R21).
- `connection-grammar`: `registerOwner`, the `neighbours` contract, `derivedId`, `BOUNDS`, `ownerConformance` (R24, R28).
- `acquisition`: `citationLookup` (R25), switched on by the group (K1449).
- `id-spaces`: the citation recogniser's reading (R25). *(not in the plan's list; L1, earlier)*

### Invariants

- **R11** Nothing a machine writes is a standard; the only writers of a standard are R1 and R10, by a member.
- **R12** No service accepts or answers a judgment of a standard's merit or desirability; the six kinds are the whole vocabulary (Operational Principle 1).
- **R30** No law relation, court link or treatment row is written by a machine (K1443): each is a member's act (R23, R26, R27), and an AI's reading of one reaches a member only as a proposal.
- **R13** A fact the profile does not supply is answered undetermined, never a default (`jurisdictions` R27); no place is named in this module's behaviour or outward text, and its tests run against the test profile (`layers.md`, rule 3).
- **R14** Declarations, supersessions, proposals and adoptions are append-only; each table is declared to `record-core`'s purge (K23). Since T33, so are law relations, court links and treatment rows (R23, R27): each is withdrawn with a reason, never edited or deleted. Each table is declared explicitly through `record-core.declareTable` (its R21): `version_chain: true`, `sight: "group"` (a standard is instance-wide; a member sees every standard, R5), the other classes as `declarePurge`'s default form gives them (plan T33, Rules (6)).
- **R15** A standard is a record object of its own type: promoted through `promotion`, with history, audit and export like an inquiry or an action; R4's rule holds, a correction being a new standard that supersedes it (R6).

### Satisfies

- `BIO_Functional_Architecture_v3.md`, Layer 2 Function 1 (the applicable legal framework) and "Skills that power Layer 2" (Legal/Policy Lookup).
- `BIO_Complete_Roadmap_v5.md` §5 (Operational Principles 1, 2) and §9, Skill 4.
- `BIO_Intake_Doctrine_v1_1.md` (material enters with provenance: R2).
- `BIO_Interaction_Constructs_v0_1.md`, UNDETERMINED as a display primitive (R3, R7).
- `build/layers.md`, layer 9 (the `standards` row) and "No jurisdiction in the product".
- State Rules §4 gains the standard, determination and consequence types (R15, `conformance` R17, `consequences` R14; K102, a change to the canon's text).

### Suggestions

- Id prefix `STD-`: `record-core.allocId("STD", year)` followed by a slug the module writes, registered in the catalogue with the one state `recorded` and no edges (K171); tables `standards`, `standard_texts`, `standard_proposals`.
- A standard is instance-wide, not a project's: public law is shared by every project; the viewer rule is R43's for non-project bundles. The job tests that `promote` creates a bundle outside any project (K171).
- `docprofile`'s `code_section` and `instrument` references can seed a proposal (R9) naming the reading they came from; the reader that does so belongs to whoever runs it (an AI run), not here.
- Tests: each refusal with a negative control; R3 against the test profile, an unmatched citation, and two profiles that disagree (withheld, so undetermined); R7's three answers.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for rulings)

- `standards`' uses gain `legacy-checks`, `membership` and `promotion` (the last for R15, K102).
- A standard is superseded, never edited; one successor at most (R6).
- Proposals follow D-149/REC-195's pattern and read `proposalLabel` (subject `standard`) from `legacy-checks` (one composer, never a second copy; K171).
- Page cap 200, as membership R48 and the other listing services.
- (T33-31, BOB's details in this fold) `connection-grammar` refuses a kind another owner holds (`KIND_TAKEN`), and `events` holds `amends`: this module registers its law-relation kinds under names of its own (`law_amends` and the like), with the members' words unchanged. R20's tie between two versions both covering a date answers undetermined rather than preferring the later one; the later-over-earlier canon is `contradiction`'s proposal (ladders §6.3 L4), not this read's. The refusal codes of R18–R27 and the op name `lawrelate` are this fold's; `op-declarations` declares the ops (T33-88). The size after T33 is about 1,800–2,600 lines (entries A (c)); `law-relations` splits off only near 4,000.
