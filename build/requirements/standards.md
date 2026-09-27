# standards — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). N72 and the layer-9 maps' review folded 2026-09-27 (K171): R3's `level`, R9's `proposalLabel`; no meaning changed. DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code and the canon, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 9 (Action). A new module: no `from`, nothing moves. Code today (measured on `tranche/T3` @ `b0656fa`): **none holds a standard.** Nearest, and staying where it is:
- D-149's governing laws of an action: `bio-plane/checks/bio-checks.mjs` 643–657 (`LAW_LEVELS`, `GOVERNING_LAWS_MAX`, `CITATION_MAX`), `governingLawsOf` (676), the proposal label (`lawProposalState`, `lawProposalLabel`, 770–800); `bio-plane/src/store.mjs` `actionLaws` 7180–7263, `#lawEntries` 7264, `actionLawsPropose` 7520–7576, `#lawProposalsFor` 7577. These are the laws the group's own request is made under, not the standard a government act is measured against: they stay `actions`' (REC-201 is carried there). Their member-states, machine-proposes, stored-apart pattern (REC-195) is the model for R9–R10.
- `docprofile/doctypes/regulation.mjs` 255–260 and `staff-report.mjs` 301 emit `code_section` and `instrument` references from a document's text, keyed by the profile's `vocabulary.codes` and enactment kinds: the place a citation to a standard is first read. `id-spaces` normalises enactment numbers.
- `jurisdictions` R23 (`standard_sources`), built in T2 with both profiles (`jurisdictions/profiles/*.mjs`).
Every requirement is *(not yet met: new module)*. No old-plan row is carried to `standards`; no check in `bio-checks.mjs` belongs to it.

**Size (P6).** New. Estimated 500–800 lines of code with its tables; one session reads it with the public parts of `jurisdictions`, `record-core`, `membership`, `promotion` and `content`.

## Public

### Purpose

A standard is what a government act is measured against: a statute, regulation, ordinance, court decision or order, adopted policy, or public commitment (Functional Architecture, Layer 2 Function 1). This module holds each standard as content in the record, with its citation, its kind and issuer, where it comes from (a jurisdiction profile's `standard_sources`, or undetermined), and the period it was in force. It says which standards were in force at a date. It judges nothing about a government act (`conformance` does) and nothing about the merit of a standard (Operational Principle 1).

### Provides

Terms. A **period** is `{from, to}`, each a `YYYY-MM-DD` date or null; null is "not stated in the record", never "always". A **source** answer is `{state: "matched", source, kind, issuer, level, profile, basis}` or `{state: "undetermined", why}`; `level` is the source's level (`jurisdictions` R23, R31), or `undetermined` when the entry states none.

**standardDeclare({cite, kind, issuer, text, period, supersedes?, author, viewer}) → `{ok: true, id, source, ...}` or refusal**
- **R1** Refusals in order: `MACHINE_CANNOT_DECLARE` (an empty author or a machine identity: a machine proposes, R9); `STANDARD_NO_CITE` (an empty citation, or over 200 characters); `STANDARD_KIND_UNKNOWN` (outside `statute`, `regulation`, `ordinance`, `court`, `policy`, `commitment`, the set of `jurisdictions` R23); `STANDARD_NO_ISSUER`; `STANDARD_NO_TEXT` (no content id); `STANDARD_TEXT_UNRESOLVED` (a content id `content.contentRow` does not hold, naming it); `STANDARD_PERIOD_INVALID` (a date not `YYYY-MM-DD`, or `to` before `from`); `STANDARD_SUPERSEDES_UNKNOWN` (R6). *(not yet met: new module)*
- **R2** `text` is one or more content ids: the standard's own words as captured. A standard is never held without a capture of its text (Intake Doctrine: material enters only with provenance). *(not yet met: new module)*
- **R3** The citation is matched against the `cite` pattern of every `standard_sources` entry in the active profiles' combined view (`jurisdictions.combine` over the list `record-core` holds). The first match gives `source: matched` with that entry's `source`, `kind`, `issuer`, `level`, `profile` and `basis`; a matched entry with no level answers `level: undetermined` beside the match (K108 (5), K171). No match, no active profile, or a withheld fact (`jurisdictions` R15) gives `source: undetermined` with why; the standard is still held (K102): the profile describes local sources and does not decide what law a group may hold its government to. A declared `kind` or `issuer` that differs from the matched entry's is kept as declared and the difference is stated beside it, never corrected. *(not yet met: new module)*
- **R4** The answer and every later read carry who declared it and when (this module's clock), and the declaration is never edited: a correction is a new standard that supersedes it (R6). *(not yet met: new module)*

**standardRead({id, viewer}) → answer or refusal**; **standardsIn({at?, kind?, source?, cite?, after?, limit?, viewer}) → `{items, cursor, truncated}`**
- **R5** `standardRead` answers R1's fields, R3's source, the declarer and time, what it supersedes and what supersedes it, and for each text content id its standing (`content.standings`) and whether a newer capture of its document holds the passage (`content.passageNotice`), so a changed statute text is seen and nothing is moved. `NO_ID`; an absent id, and any id for a viewer naming no member, is `NO_SUCH_STANDARD`, one answer. *(not yet met: new module)*
- **R6** `supersedes` names an earlier standard (an amendment, a renumbering, a later decision). The earlier one stays readable, and both reads name the link. A standard is superseded by at most one standard; a second is refused `STANDARD_ALREADY_SUPERSEDED`, naming the first. *(not yet met: new module)*
- **R7** `inForce(id, date) → "in_force" | "not_in_force" | "undetermined"`, with why: `not_in_force` only when a stated bound excludes the date; `undetermined` when a bound needed to decide is null; never a default. *(not yet met: new module)*
- **R8** `standardsIn` lists the standards the filters admit, in id order, at most 200 per page (a lower `limit` is honoured, a higher one is not), `truncated` measured by reading one past the page. With `at`, a standard is listed with R7's answer for that date, and `not_in_force` ones are left out. *(not yet met: new module)*

**standardPropose({cite, kind?, issuer?, text?, why, act?, proposer, viewer}) → `{ok, proposal}`**; **standardAdopt({proposal, author, viewer, ...R1's fields})**
- **R9** A proposal (the Legal/Policy Lookup skill's work, or a member's suggestion) is stored apart from standards, labelled with who proposed it and whether it is machine work (`legacy-checks`' `proposalLabel(proposer, "standard")`: `lawProposalState`'s three states, one composer, K171), with a `why` of at most 240 characters. It is never a standard, never read by `standardsIn`, and is answered with a sentence saying so. *(not yet met: new module)*
- **R10** `standardAdopt` is R1 by a member, naming the proposal; the new standard records the proposal it came from, and the proposal records its adoption. A proposal is adopted at most once. *(not yet met: new module)*

## Private

### Uses

- `jurisdictions`: `combine` (R3); the kinds of R23; a source's `level` (R23, R31: not yet met there, built by the `jurisdictions` job before layer 9, K171).
- `record-core`: `getSetting` (the active profiles), `allocId`, `transact`, `stampInstant`.
- `legacy-checks`: `isMachineIdentity`, `proposalLabel` (R1, R9; added by the head-of-layer `legacy-checks` job, K171); the `STD-` type registration (R15, K171).
- `membership`: `viewerPredicate` (R5; a member sees every standard). *(not declared)*
- `promotion`: `promote`, a standard being a record object (R15, K102). *(not declared)*
- `content`: `contentRow`, `standings`, `passageNotice`.

### Invariants

- **R11** Nothing a machine writes is a standard; the only writers of a standard are R1 and R10, by a member. *(not yet met: new module)*
- **R12** No service accepts or answers a judgment of a standard's merit or desirability; the six kinds are the whole vocabulary (Operational Principle 1). *(not yet met: new module)*
- **R13** A fact the profile does not supply is answered undetermined, never a default (`jurisdictions` R27); no place is named in this module's behaviour or outward text, and its tests run against the test profile (`layers.md`, rule 3). *(not yet met: new module)*
- **R14** Declarations, supersessions, proposals and adoptions are append-only; each table is declared to `record-core`'s purge (K23). *(not yet met: new module)*
- **R15** A standard is a record object of its own type: promoted through `promotion`, with history, audit and export like an inquiry or an action; R4's rule holds, a correction being a new standard that supersedes it (R6). *(not yet met: new module; K102)*

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
