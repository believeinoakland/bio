# conformance — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). The layer-9 maps' review folded 2026-09-27 (K171): the act's id (Terms, R7, R11), R2's read `publication.publishedEditionsOf`, R6's two promotions, R12's `proposalLabel`; no meaning changed. DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code and the canon, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 9 (Action). A new module: no `from`, nothing moves. Code today (measured on `tranche/T3` @ `b0656fa`): **nothing records a determination** that a government act is compliant, noncompliant or unclear; `grep` for them over `store.mjs`, `schema.mjs`, `index.mjs` and `bio-checks.mjs` finds none. What it will read already exists:
- "Published" is membership of a published case edition: `schema.mjs` 1639–1715 (`published_cases`, `published_case_members` with `version_sha` and `role`), the fact `caseMember` registered by `legacy-store` (`store.mjs` 902, `#caseRelationOf`), each member's frozen `case_strength` pair (Publication v0.1 §2).
- An action today rests on any `INFO-`/`INQ-`/`PROB-`/`FOCUS-` bundle (`action_basis`, `schema.mjs` 1930; `actionBasisFindings`, `bio-checks.mjs` 4520, C-2.10), not on a determination. That is `actions`' to change (its contract: "it rests on a conformance determination").
Every requirement is *(not yet met: new module)*. No old-plan row is carried to `conformance`; no check in `bio-checks.mjs` belongs to it.

**Size (P6).** New. Estimated 700–1,000 lines of code; one session reads it with the public parts of its uses.

## Public

### Purpose

A determination is the group's recorded judgment that a named government act is compliant, noncompliant or unclear against named standards, resting on published findings (Functional Architecture, "Analysis outputs"). A member makes it; a machine may prepare the structured comparison and never determines. A compliant determination is recorded with the same care as a noncompliant one. An unclear one names its open questions and sends each back to an inquiry. This module does not rank significance: whether a breach warrants action, and how urgently, is a member's judgment made with the consequences in front of them (Function 4; Bob's ruling 1, K12).

### Provides

Terms. An **act** is `{id?, description, actor: {role, body}, at | period, evidence}`: what the government did, the office that did it (named by official role and body, never by a person), when, and the content ids that show it. The first determination of an act mints its `id` (`ACT-`, from `record-core.allocId`, stored on the determination, no bundle); a later determination of the same act names it (`act: {id}`). "The same act" is equality of that id, never of description, actor or date (K171). An **outcome** is `compliant`, `noncompliant` or `unclear`. A **comparison row** is `{standard, requires, did, reading, content}`, `reading` one of `aligns`, `diverges`, `open`.

**determine({project, act, findings, standards, rows, questions?, supersedes?, reason?, author, viewer}) → `{ok: true, id, ...}` or refusal**
- **R1** Refusals in order: `MACHINE_CANNOT_DETERMINE` (an empty or machine author; a machine proposes, R11); `NO_SUCH_PROJECT` (absent or not visible, one answer); `NOT_A_PARTICIPANT` (the author not joined: `membership.projectAuthority(project, author, "joined")`); `ACT_INCOMPLETE` (no description, no actor role or body, no date or period, or no evidence), naming the missing part; `NO_FINDINGS`; `FINDING_NOT_PUBLISHED` (R2), naming it; `NO_STANDARDS`; `NO_SUCH_STANDARD`, naming it; `STANDARD_NOT_IN_FORCE` (R3); `ROWS_INCOMPLETE` (a named standard with no row, or a row whose `requires`, `did` or `reading` is empty); `OUTCOME_UNKNOWN`; `UNCLEAR_NO_QUESTION` (R6); `SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT` (R8). *(not yet met: new module)*
- **R2** Every finding named is a finding-version that is a member of a published case edition of `project` (`publication.publishedEditionsOf`, publication R37), and the determination pins that edition and version. A finding not published, or published only by another project, is refused. *(not yet met: new module; K102)*
- **R3** Each standard is read through `standards.inForce` at the act's date (or each end of its period): `not_in_force` is refused; `undetermined` is accepted and stated on the determination beside that standard. *(not yet met: new module)*
- **R4** The outcome is given **per standard**, from the member, and is never composed across standards into one verdict. A determination whose rows for a standard are all `aligns` and whose outcome is `noncompliant`, or any `diverges` with `compliant`, is accepted and the disagreement stated beside it, never corrected. *(not yet met: new module)*
- **R5** The three outcomes carry the same obligations (R1–R4): a compliant determination names its act, findings, standards and rows exactly as a noncompliant one does, and is read by the same services. *(not yet met: new module)*
- **R6** An `unclear` outcome names at least one question, each `{question, inquiry}`: an existing inquiry the author may see, or a new inquiry opened in the same act (state `open`, titled from the question, in `project`). The determination and any inquiry it opens land together or not at all (Functional Architecture: "Unclear … triggers a return to Layer 1"): two `promotion.promote` calls inside one outer `record-core.transact`, a refused second rolling back the first (K171). *(not yet met: new module)*
- **R7** A determination is never edited. `supersedes` names an earlier determination of the same act (its act id) in the same project, and the superseding determination carries its predecessor's act id, with a `reason` (at most 500 characters, else `BAD_REASON`); the earlier one stays readable and both reads name the link. A determination is superseded at most once (`ALREADY_SUPERSEDED`). *(not yet met: new module)*
- **R8** No input or answer carries a significance, severity, priority, urgency, rank or score: a determination carrying any such key is refused. *(not yet met: new module)*

**determinationRead({id, viewer}); determinationsFor({project?, act?, standard?, finding?, outcome?, live?, after?, limit?, viewer}) → `{items, cursor, truncated}`**
- **R9** `determinationRead` answers R1's fields, the per-standard outcomes, each finding's pinned edition and its strength pair frozen at publication beside its live pair (`strength.inquiryStrength`), each per axis and never composed (DEC-44), the author and time, supersession links, and R10's flag. An absent or invisible determination is `NO_SUCH_DETERMINATION`, one answer; a finding or standard the viewer may not see is replaced by null and "an object you may not see". *(not yet met: new module)*
- **R10** A determination is `live` until superseded. It is flagged `basis_changed`, naming each cause, when a finding it rests on is reopened, superseded or published in a later edition, when a standard it names is superseded, or when a text or evidence content id has a newer capture that does not carry the passage (`reevaluation`, `content.passageNotice`). The flag is a notice: the determination and its outcome do not change until a member supersedes it (Operational Principle 4). *(not yet met: new module)*
- **R11** `determinationsFor` lists at most 200 per page (a lower `limit` honoured), in id order, `truncated` measured by reading one past. `live: true` leaves out superseded ones; `act` filters by act id. It is the read `consequences`, `actions` and `escalation` use. *(not yet met: new module)*

**comparisonPropose({project, act, standards, rows, questions?, proposer, viewer}) → `{ok, proposal}`**
- **R12** A comparison prepared by a machine (the Government Compliance Analysis skill) or suggested by a member is stored apart, labelled with who made it and whether it is machine work (`legacy-checks`' `proposalLabel(proposer, "comparison")`, K171), and answered with a sentence saying it is not a determination. It carries rows and questions and never an outcome: a proposal naming one is refused `PROPOSAL_CANNOT_DETERMINE`. A determination may name the proposal it drew on, and the proposal records that. *(not yet met: new module)*
- **R18** `determine` takes `proposal?`, the id of the comparison (R12) it drew on (absent, invisible or of another project: `NO_SUCH_PROPOSAL`), and `comparisonRead({id, viewer})` answers a comparison with its label (R12) and the determinations that drew on it. A determination carries at most 50 findings, 50 standards, 200 rows, 20 questions and 50 evidence content ids, and a comparison the same; over any, `DETERMINATION_TOO_LARGE` naming the part and the cap (K249). *(not yet met: K249)*

## Private

### Uses

- `legacy-checks`: `isMachineIdentity`, `proposalLabel` (added by the head-of-layer `legacy-checks` job, K171); the `CONF-` type registration (R17, K171).
- `record-core`: `allocId`, `transact`, `stampInstant`.
- `membership`: `sight`, `projectAuthority`, `viewerPredicate`.
- `promotion`: `promote` (R6's new inquiry; and the determination itself, R17, K102). *(not declared)*
- `content`: `contentRow`, `passageNotice` (R1's evidence, R10).
- `inquiry`: `supersededBy`, `stateHistory` (R10); visibility of a named inquiry (R6).
- `strength`: `inquiryStrength` (R9).
- `reevaluation`: the notice that a finding's basis changed (R10), by a registration it offers (K31's pattern).
- `publication`: `publishedEditionsOf` (its R37: whether a finding-version is a member of a ratified edition of a case the project owns, and its frozen pair; R2, R9). Nothing is composed from `cases` (K171).
- `standards`: `standardRead`, `inForce`.

### Invariants

- **R13** Only a member determines; nothing a machine writes is a determination or an outcome. *(not yet met: new module)*
- **R14** Every determination rests on at least one published finding and at least one standard held in the record (layer 9's contract). *(not yet met: new module)*
- **R15** Every read answers a determination in a project the viewer may not see as an absent one (membership R44). *(not yet met: new module)*
- **R16** Determinations, supersessions and proposals are append-only; each table is declared to `record-core`'s purge (K23). No place is named in this module's behaviour or outward text. *(not yet met: new module)*
- **R17** A determination is a record object of its own type: promoted through `promotion`, with history, audit and export like a finding; R7's rule holds, a correction being a new determination that supersedes it (`standards` R15). *(not yet met: new module; K102)*

### Satisfies

- `BIO_Functional_Architecture_v3.md`, Layer 2: Function 1, Function 3 (the comparison separates what the standard requires from what was done), Function 4 (significance is human judgment), "Analysis outputs", and "The eighth skill" (present for human evaluation, not as a determination).
- `BIO_Complete_Roadmap_v5.md` §5 (Operational Principles 1, 2, 4) and §9, Skill 6.
- `BIO_Design_Requirements_v2.md` §12 (tools are advisory).
- `BIO_Publication_v0_1.md` §2 (a case, its editions and frozen strength).
- `docs/development/DECISIONS.md` DEC-44 (never one composed strength), DEC-72 (publication is the case relation).
- `build/layers.md`, layer 9 (the `conformance` row, Bob's ruling 1); K12.
- K102: a determination comes after publication, resting on published findings (R2), the comparison before publication being inquiry work and `comparisonPropose` (R12); and one outcome per standard, never composed (R4). Both as drafted, no change.

### Suggestions

- Id prefix `CONF-` (`allocId` plus a slug), registered in the catalogue with the one state `recorded` and no edges (K171); act ids `ACT-`; tables `determinations`, `determination_standards`, `determination_findings`, `determination_questions`, `comparison_proposals`.
- The act's `actor` should be offered from the profile's `counterparties` (jurisdictions R24) but not limited to it.
- `escalation` proposes its first stage from a live `noncompliant` outcome; nothing here triggers it.
- R6: if `promote` cannot nest in an outer `transact`, the job reports it and BOB rules then (K171).
- Every read gates on `membership.sight(project, viewer)` of the record's project before `viewerPredicate` (R15; K171); R1's `NOT_A_PARTICIPANT` is this module's code, translated from membership's `PROJECT_ACT_NOT_A_PARTICIPANT` in one line, its catalogue row with the job (K107 (3), K171).
- Tests: every refusal with a negative control; an outsider member against each read; R4 and R5 by a compliant and a noncompliant determination over the same act; R8 with each forbidden key; R10 by reopening a pinned finding and by a newer capture of a standard's text.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for rulings)

- `conformance`'s uses gain `legacy-checks` and `promotion`; `reevaluation` offers later modules a registration for "a finding's basis changed" (K31's pattern), to be stated in its requirements.
- A determination is a project's (the publishing project's), recorded by a joined participant (membership R55's `joined`).
- The act's actor is an office, not a person (R1); one determination may supersede only one of the same act and project.
- Page cap 200.
