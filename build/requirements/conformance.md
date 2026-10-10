# conformance — requirements

**Status** · In force: approved by Bob 2026-09-26 (K102); the layer-9 maps' review folded (K171), no meaning changed. Last changed T35 (T35-61: Terms amended; R27–R29 new; K1723, K1740); every requirement met (CONFORMANCE #14, K2021). Last changed T41 (T41-45's text: Purpose re-worded; N820; D55; K2405, K2417, K2418); marked not yet met (T41).

**Size (P6).** New. Estimated 700–1,000 lines of code; one session reads it with the public parts of its uses.

## Public

### Purpose

(T41; D55; K2418) A determination is a member's determination, resting on published findings, that a named government act is compliant, noncompliant or unclear against named standards, per standard (Functional Architecture, "Analysis outputs"). A member makes it; a machine may prepare the structured comparison and never determines. A compliant determination is recorded with the same care as a noncompliant one. An unclear one names its open questions and sends each back to an inquiry. This module does not rank significance: whether a breach warrants action, and how urgently, is a member's judgment made with the consequences in front of them (Function 4; Bob's ruling 1, K12).

### Provides

Terms. An **act** is an event held in `events` (B1a.10; K1465, K1485): `{event, actor: {role, body, entity_id}, evidence}`, what the government did (the event: its kind, `when`, attestations and participants), the office that did it, and the content ids that show it. (T35, K1713 (3)) A comparison (R12) may compare the act of any actor, an office or an organisation of any sector, never a person (R28); a determination still judges only an office's act. The **actor** stays the office, named by official role and body and carrying the `office` entity it is (`entity_id`; ladders §5.4); the people who decided, authored, signed or carried out the act are recorded as the event's participants in `events`' roles (`decider`, `author`, `signatory`, `implementer`), never as the actor, and the determination still judges the office's duty. Determinations made before T33 named an act by an `ACT-` id minted here (`record-core.allocId`, stored on the determination, no bundle); an `ACT-` id is now an alias of an event (`events.aliasAct`, `eventForAct`; R26). "The same act" is equality of the event (an alias resolved), never of description, actor or date (K171). An **outcome** is `compliant`, `noncompliant` or `unclear`. A **comparison row** is `{standard, requires, did, reading, content}`, `reading` one of `aligns`, `diverges`, `open`.

**determine({project, act, findings, standards, rows, questions?, supersedes?, reason?, author, viewer}) → `{ok: true, id, ...}` or refusal**
- **R1** Refusals in order: `MACHINE_CANNOT_DETERMINE` (an empty or machine author; a machine proposes, R11); `NO_SUCH_PROJECT` (absent or not visible, one answer); `DETERMINATION_NOT_A_PARTICIPANT` (the author not joined: `membership.projectAuthority(project, author, "joined")`; its row C-113.3, K275); R25's act refusals; `ACT_INCOMPLETE` (no actor role or body, or no evidence), naming the missing part; `NO_FINDINGS`; `FINDING_NOT_PUBLISHED` (R2), naming it; `NO_STANDARDS`; `NO_SUCH_STANDARD` (`standards.noSuchStandard`, its R17), naming it; `STANDARD_NOT_IN_FORCE` (R3); `ROWS_INCOMPLETE` (a named standard with no row, or a row whose `requires`, `did` or `reading` is empty); `OUTCOME_UNKNOWN`; `UNCLEAR_NO_QUESTION` (R6); `SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT` (R8); R22's refusals, in its order.
- **R2** Every finding named is a finding-version that is a member of a published case edition of `project` (`publication.publishedEditionsOf`, publication R37), and the determination pins that edition and version. A finding not published, or published only by another project, is refused.
- **R3** Each standard is read through `standards.inForceAt` (its `inForce` kept as an alias, Choices 18) at the act event's `when` (each end of a band or period): `not_in_force` is refused; `undetermined`, including an act whose `when` is undetermined or placed nowhere, is accepted and stated on the determination beside that standard with its reason.
- **R4** The outcome is given **per standard**, from the member, and is never composed across standards into one verdict. A determination whose rows for a standard are all `aligns` and whose outcome is `noncompliant`, or any `diverges` with `compliant`, is accepted and the disagreement stated beside it, never corrected.
- **R5** The three outcomes carry the same obligations (R1–R4): a compliant determination names its act, findings, standards and rows exactly as a noncompliant one does, and is read by the same services.
- **R6** An `unclear` outcome names at least one question, each `{question, inquiry}`: an existing inquiry the author may see, or a new inquiry opened in the same act (state `open`, titled from the question, in `project`). The determination and any inquiry it opens land together or not at all (Functional Architecture: "Unclear … triggers a return to Layer 1"): two `promotion.promote` calls inside one outer `record-core.transact`, a refused second rolling back the first (K171).
- **R7** A determination is never edited. `supersedes` names an earlier determination of the same act (its act id) in the same project, and the superseding determination carries its predecessor's act id, with a `reason`: an absent, null or blank reason is `CONFORMANCE_NO_REASON`, one over 500 characters or not text `CONFORMANCE_BAD_REASON` (N233, K264; R23); the earlier one stays readable and both reads name the link. A determination is superseded at most once: a second is `DETERMINATION_SUPERSEDED` (R20), naming the first; `ALREADY_SUPERSEDED`'s C-113.18 is retired and its number not reused (K275).
- **R8** No input or answer carries a significance, severity, priority, urgency, rank or score: a determination carrying any such key is refused.

**determinationRead({id, viewer}); determinationsFor({project?, act?, standard?, finding?, outcome?, live?, after?, limit?, viewer}) → `{items, cursor, truncated}`**
- **R9** `determinationRead` answers R1's fields, the per-standard outcomes, each finding's pinned edition and its strength pair frozen at publication beside its live pair (`strength.inquiryStrength`), each per axis and never composed (DEC-44), the author and time, supersession links, and R10's flag. An absent or invisible determination is `NO_SUCH_DETERMINATION`, one answer (R19); what the viewer may not see is withheld whole (R24). It also answers R22's cause; and `outcomes_differ: true` when the per-standard outcomes (R4) are not all the same, the quiet mark DEC-84 item 3 gives a determination's two standards: a statement, with no duty. It answers the act as R25 reads it.
- **R10** A determination is `live` until superseded. It is flagged `basis_changed`, naming each cause, when a finding it rests on is reopened, superseded or published in a later edition, when a standard it names is superseded, or when a text or evidence content id has a newer capture that does not carry the passage (`reevaluation`, `content.passageNotice`). The flag is a notice: the determination and its outcome do not change until a member supersedes it (Operational Principle 4).
- **R11** `determinationsFor` lists at most 200 per page (a lower `limit` honoured), in id order, `truncated` measured by reading one past. `live: true` leaves out superseded ones; `act` filters by act id. It is the read `consequences`, `actions` and `escalation` use.

**comparisonPropose({project, act, standards, rows, questions?, proposer, viewer}) → `{ok, proposal}`**
- **R12** A comparison prepared by a machine (the Government Compliance Analysis skill) or suggested by a member is stored apart, labelled with who made it and whether it is machine work (`record-grammar`'s `proposalLabel(proposer, "comparison")`, K171), and answered with a sentence saying it is not a determination. It carries rows and questions and never an outcome: a proposal naming one is refused `PROPOSAL_CANNOT_DETERMINE`. A determination may name the proposal it drew on, and the proposal records that. A comparison may name `contradiction`, the contradiction inquiry it came from (`inquiry` R48). An absent or invisible inquiry, or one that is not a contradiction inquiry, is `NO_SUCH_CONTRADICTION_INQUIRY` (C-113.24). The proposal records the link, and it still carries no outcome.
- **R18** `determine` takes `proposal?`, the id of the comparison (R12) it drew on (absent, invisible or of another project: `NO_SUCH_COMPARISON`, its row C-113.20; K275, the proposal code being intent's), and `comparisonRead({id, viewer})` answers a comparison with its label (R12) and the determinations that drew on it. A determination carries at most 50 findings, 50 standards, 200 rows, 20 questions and 50 evidence content ids, and a comparison the same; over any, `DETERMINATION_TOO_LARGE` naming the part and the cap (K249).

**noSuchDetermination(determinationId, extra?) → refusal; determinationSuperseded(determinationId, supersededBy, extra?) → refusal** (N309, N312, K275; module-level functions)
- **R19** The one answer to one condition: no determination the caller may see answers to `determinationId` (absent or invisible, answered alike; R9, R15). It answers `{ok: false, reason: "NO_SUCH_DETERMINATION", code: "NO_SUCH_DETERMINATION", check, translation, determination, detail}`: `determination` the id as asked (null when none), `detail` one fixed sentence, the same for every caller, and `check` and `translation` its catalogue row's (C-113.15). `extra` adds a caller's own fields and never replaces these. R9 answers through it, and every act or read of a later module that answers this condition answers through it (`consequences` R1, R7, R9; `escalation` R1; `filings` R21 passes R9's answer through), so the code is minted at one site; its one catalogue row is this module's, its `where` naming this function, and consequences' C-114.1 and escalation's C-116.3 give way to it. It writes nothing and never throws.
- **R20** The one answer to one condition: the determination `determinationId` names has been superseded (it is not live, R10). It answers `{ok: false, reason: "DETERMINATION_SUPERSEDED", code: "DETERMINATION_SUPERSEDED", check, translation, determination, superseded_by, detail}`: `superseded_by` the determination that superseded it (null when the caller cannot read it), `detail` one fixed sentence, the same for every caller, and `check` and `translation` its catalogue row's. `extra` adds a caller's own fields and never replaces these. R7's supersession of a determination already superseded answers through it, as does every act of a later module that answers this condition (`consequences` R1, `actions` R8, `escalation` R1), so the code is minted at one site; its one catalogue row is this module's, its `where` naming this function, and escalation's C-116.4 gives way to it. It writes nothing and never throws.

**A comparison started from a contradiction, and the cause** (N345; DEC-76 item 3, DEC-84 item 10)
- **R21** `comparisonFacts({contradiction, standardSide, viewer})` answers the rows a comparison may start from, as facts: `requires` from the side named `standardSide` (`a` or `b`, named by the member, never defaulted) and `did` from the other, each with its source, content id, date and `text`: for a side that names a content id, the passage's words as `content.passageText` answers them for it (its R46), or `null` where it answers `null`; for a claim or stance side, which names no passage, the claim's words as contradiction answers them (N362, K569, K603), labelled the record's and never an outcome. It answers the question's resolution when it is concluded. R12's refusal applies. It writes nothing. An absent or unnamed `standardSide` is `STANDARD_SIDE_UNNAMED` (C-113.28), asked after R12's `NO_SUCH_CONTRADICTION_INQUIRY` (K503).
- **R22**
  - **The input.** `determine` takes `cause?: {statement, evidence}`, member-authored.
  - **Refusals.**
    - A blank statement, or one over 2,000 characters, is `CAUSE_UNSTATED` (C-113.26).
    - No evidence, or an evidence content id the author may not see, is `CAUSE_NOT_EVIDENCED` (C-113.25). A hypothesized cause stays in the working inquiry and never enters the determination.
    - A determination carrying `recommendation` or `policy` is `RECOMMENDATION_IS_AN_ACTION` (C-113.27): a recommendation is a proposed action, recorded by `actions`, never a policy position held here.
  - **The read.** `determinationRead` (R9) answers the cause, or `cause: null` with the sentence "cause not established".

Rows C-113.24–C-113.28 (this module's C-113; N345), with their translations; promotion stamps them:

| row | code | translation |
|---|---|---|
| C-113.24 | `NO_SUCH_CONTRADICTION_INQUIRY` | "No question you can see answers to that id as one taken up from a contradiction, so no comparison starts from it. Nothing was written." |
| C-113.28 | `STANDARD_SIDE_UNNAMED` | "Name which side of the question states what the standard requires, a or b. Your group's Civicsmith never chooses it. Nothing was written." |
| C-113.25 | `CAUSE_NOT_EVIDENCED` | "A cause is recorded on a determination only when evidence you can see shows it. A cause not yet shown stays in the question where it is being worked out, and the determination says the cause is not established. Nothing was written." |
| C-113.26 | `CAUSE_UNSTATED` | "The cause is stated in a sentence of your own, of at most 2,000 characters. Nothing was written." |
| C-113.27 | `RECOMMENDATION_IS_AN_ACTION` | "A determination records what was required, what was done, and why, and never what should be done. Propose an action instead. Nothing was written." |

**A standard that does not bind the body, any actor's act, and a policy against what the office does** (N651; POLICIES L4, STANDARDS L4; K1723, K1713)
- **R27** (K1723) For each standard a determination or comparison names, this module reads from `standards` whether it binds the act's body (the actor's `body` entity) at the act's `when`, as R3 reads it in force: `binds` `true`, `false` (a **benchmark**) or `undetermined`, held on the determination or proposal beside that standard, with its basis (the adoption or the law that imposes it), and answered by R9 and `comparisonRead` with the label "Standard · binds <body>" or "Benchmark · not binding on <body>" (DEC-145 (2)). Refusals, each writing nothing:
  - `determine` with outcome `noncompliant` for a standard whose `binds` is `false` is `STANDARD_NOT_BINDING` (C-113.32), naming the standard and the body; an `undetermined` bindingness is refused the same until a member settles it in `standards`, never read as binding. Other outcomes against a benchmark are accepted, labelled as above.
  - A determination or comparison whose row text (`requires`, `did`) or question, for a standard whose `binds` is `false`, uses `violated`, `violates`, `violation`, `nonconforming`, `non-conforming`, `nonconformity` or `nonconformance` (whole words, any letter case) is `BENCHMARK_CALLED_NONCONFORMING` (C-113.33), naming the standard and the word; such a row says "below", "slower than" or the like (K1723), and a `diverges` reading against a benchmark is answered as "below the benchmark", never as a breach.

  A machine's proposal never states a standard binding (R12): `binds` is read, never taken from the proposal.
- **R28** (K1713 (3); K102) `comparisonPropose` (R12) takes the act as `determine` does (R25), except that the actor may be an `office` or an organisation of any sector (an `institution`, `body` or `movement` entity, `entities`' organisations, K1453): a company, a utility, a nonprofit or another government's body, named by `entity_id`. An actor that is a `person` entity is `ACTOR_IS_A_PERSON` (C-113.34), and one of any other kind `ACTOR_NOT_AN_OFFICE_OR_ORGANISATION` (C-113.35), each writing nothing; the people who took part are the event's participants, as R25 states. `determine` keeps R25's actor: a determination judges only an office's act, resting on published findings (R2), so a comparison of an organisation's act is held and read but never determined (`determine` naming it answers R25's `ACTOR_NOT_AN_OFFICE`).
- **R29** (K1713 (2); ladders §6B L4, "policy against practice") A comparison or determination row may state what was done as a measure: `did: {calc, result_key}`, a `CALC-` calculation (`calculations.read`, its R9) whose result is a count or share over the held acts, beside the provision it is compared with at its version (`requires` a passage of the standard, R3). Such a row is answered with the result, its **denominator**, its **population** (what was counted: the acts, the decider, subject and period) and its **derivation** (the recipe and its method version), each from the calculation, never composed here. Refusals, each writing nothing: a `calc` absent or one the viewer may not see is answered as `calculations.read` answers it (`NO_SUCH_CALCULATION`, its code, the same answer for both, no row of this module's); a result with no denominator or no stated population `MEASURE_NO_DENOMINATOR` (C-113.36). The measure is held beside the rule, never as the rule: it changes no standard's text or force. No answer of this module calls what the office does "practice" (DEC-145 (8)): it says "what the office does".

Rows C-113.32–C-113.36 (T35; N651), their translations BOB's drafts, the member words the UX stream's to revise:

| row | code | translation |
|---|---|---|
| C-113.32 | `STANDARD_NOT_BINDING` | "This standard does not bind this body, so the act cannot be found nonconforming against it. Record it as a benchmark comparison: below, slower than, or above. Nothing was written." |
| C-113.33 | `BENCHMARK_CALLED_NONCONFORMING` | "A benchmark does not bind this body, so the comparison cannot call the act a violation or nonconforming. Say how it compares: below, slower than, or above. Nothing was written." |
| C-113.34 | `ACTOR_IS_A_PERSON` | "An act is compared as the act of an office or an organisation. The people who took part are recorded on the act, never as the one who acted. Nothing was written." |
| C-113.35 | `ACTOR_NOT_AN_OFFICE_OR_ORGANISATION` | "Name the office or organisation whose act this is. Nothing was written." |
| C-113.36 | `MEASURE_NO_DENOMINATOR` | "A measure of what the office does is shown with what it counted and out of how many. This calculation states no denominator or no population. Nothing was written." |

**The act as an event** (B1a.10; EVENTS 2b, "the conformance act in full"; K1465, K1485)
- **R25** `determine` takes `act: {event, actor: {role, body, entity_id?}, evidence}`. Refusals, in order, each writing nothing: `ACT_NO_EVENT` (no `event`); `NO_SUCH_EVENT` (an event absent or one the viewer may not see, alike; an `ACT-` id resolved first by R26); then the actor: an `entity_id` that is not an `office` entity is `ACTOR_NOT_AN_OFFICE`; an `entity_id` absent is filled from the office entity seeded for that `{role, body}` (the bridge, `instance-setup`; `entities`' identifier for it), and when none is held the actor stands as `{role, body, entity_id: null}`, stated so. The act's date is the event's `when` (R3). `determinationRead` answers the act's event with its kind, `when`, attestations and its participants in the roles `decider`, `author`, `signatory` and `implementer` as `events.readEvent` answers them, each with its own attestation, labelled as who took part in the act, never as the actor, never composed into the outcome; a participant the viewer may not see is withheld whole (R24). A determination never names a person as its actor.
- **R26** An act named by an `ACT-` id (`act: {id}`, a determination made before T33) is resolved through `events.eventForAct`: an aliased id answers its event, and is then the same act as that event (Terms). An id not yet aliased is answered as recorded, with `act_unaliased: true` and the act's stored description, actor and date, and a new determination naming it is refused `ACT_NOT_AN_EVENT` until a member aliases it (`events.aliasAct`). No `ACT-` id is minted from T33 on.

**Its own reason codes** (N433, K730, K766)
- **R23** (BOB's choice: own codes, as `intent` R30) This module's refusal of a supersession with no reason (R7) is `CONFORMANCE_NO_REASON` (C-113.22), and of a reason over 500 characters or not text `CONFORMANCE_BAD_REASON` (C-113.17), each row's number and translation unchanged, so no code is held with two rows (DEC-49): it never answers `NO_REASON` or `BAD_REASON`, which are `progressions`' (C-100.18, C-100.21).

## Private

### Uses

- `civil-time` (T33-70): `localDay`, R3's reading of a `when` on its local day and an EDTF band's ends (K1649).
- `record-grammar`: `isMachineIdentity`, `proposalLabel`; the `CONF-` type registration (R17).
- `record-core`: `allocId`, `transact`, `stampInstant`.
- `membership`: `sight`, `projectAuthority`, `viewerPredicate`; `noSuchProject` (its R78), through which R1's `NO_SUCH_PROJECT` is answered, its translation membership's C-70.5, in place of C-113.2 (N274, N208, K275).
- `promotion`: `promote` (R6's new inquiry; and the determination itself, R17, K102).
- `content`: `contentRow`, `passageNotice` (R1's evidence, R10); `passageText` (its R46; R21's `text`, N362).
- `inquiry`: `supersededBy`, `stateHistory` (R10); visibility of a named inquiry (R6); `contradictionLink` (its R48), for R12 and R21 (N345).
- `contradiction` (N345): for R12 and R21.
- `strength`: `inquiryStrength` (R9).
- `reevaluation`: the notice that a finding's basis changed (R10), by a registration it offers (K31's pattern).
- `publication`: `publishedEditionsOf` (its R37: whether a finding-version is a member of a ratified edition of a case the project owns, and its frozen pair; R2, R9). Nothing is composed from `cases` (K171).
- `entities` (T33-70): the `office` entity of an actor and its identifier (R25).
- `events` (T33-70): `readEvent`, `eventForAct`, `aliasAct` (R25, R26).
- `standards` (T35, T35-31): its bindingness read (whether a standard binds a body at a date, from its adoption or a law that imposes it; K1723), for R27.
- `calculations` (T35): `read` (its R9), for R29's measures, their denominators, populations and derivations. A `modules.json` edge, BOB's (P17).
- `standards`: `standardRead`, `inForceAt` (`inForce` its alias; R3, T33-70); `noSuchStandard` (its R17), through which R1's `NO_SUCH_STANDARD` is answered, in place of C-113.9 (N309, K231, K275).

### Invariants

- **R13** Only a member determines; nothing a machine writes is a determination or an outcome.
- **R14** Every determination rests on at least one published finding and at least one standard held in the record (layer 9's contract).
- **R15** Every read answers a determination in a project the viewer may not see as an absent one (membership R44).
- **R16** Determinations, supersessions and proposals are append-only; each table is declared to `record-core`'s purge (K23). No place is named in this module's behaviour or outward text.
- **R17** A determination is a record object of its own type: promoted through `promotion`, with history, audit and export like a finding; R7's rule holds, a correction being a new determination that supersedes it (`standards` R15).
- **R24** (K903 (4), DEC-36) Every read withholds whole what the viewer may not see. The reads are R9, R10's flag, R11, R12's `comparisonRead` and R22's cause. The things withheld are a pinned finding; a standard, with its outcome, rows and disagreement; a question's inquiry; an evidence content id of the act or the cause; a proposal's standard or its `contradiction`; and an R10 cause whose subject is one, its `detail` with it. Withheld whole means no id, title, state, placeholder or count. The item leaves its list. A key that named it is left out, never null. The determination's or proposal's answer states `out_of_view: true`, which says only that something was withheld. What is authored on the determination itself stands for every viewer who may read it: a question's text without its `inquiry` key; the act, author, time, supersession and `live`; `basis_changed` when any cause stands, with the withheld causes left out; and `outcomes_differ` over all its standards. That is the pattern of `strength` R6, which keeps every record fact about the axes. A viewer who may see everything is answered as before, with no `out_of_view` key.

### Satisfies

- `BIO_Functional_Architecture_v3.md`, Layer 2: Function 1, Function 3 (the comparison separates what the standard requires from what was done), Function 4 (significance is human judgment), "Analysis outputs", and "The eighth skill" (present for human evaluation, not as a determination).
- `BIO_Complete_Roadmap_v5.md` §5 (Operational Principles 1, 2, 4) and §9, Skill 6.
- `BIO_Design_Requirements_v2.md` §12 (tools are advisory).
- `BIO_Publication_v0_1.md` §2 (a case, its editions and frozen strength).
- `docs/development/DECISIONS.md` DEC-44 (never one composed strength), DEC-72 (publication is the case relation).
- `build/layers.md`, layer 9 (the `conformance` row, Bob's ruling 1); K12.
- K102: a determination comes after publication, resting on published findings (R2), the comparison before publication being inquiry work and `comparisonPropose` (R12); and one outcome per standard, never composed (R4). Both as drafted, no change.
- `BIO_Capability_Ladders_v0_1.md` §6B.4 L4 and §6C.4 L4 (POLICIES and STANDARDS applied: comparison rows for any actor's act, policy against what the office does with its denominator, nonconformity only against a binding standard); K1723, K1713 (2), (3); DEC-145 (2), (8): R27–R29 (N651).
- N345 (R1, R9, R12, R21, R22): DEC-76 item 3 (contradiction is a source of determinations, never a second compliance mechanism); DEC-77 item 2 (Criteria, Condition, Cause); DEC-84 items 3 and 10.

### Suggestions

- **T33-70 (open technical details, BOB's).** R25's and R26's refusal codes join C-113 at the job's stamp. Whether the legacy `ACT-` acts are aliased in bulk (an event created for each from its stored description, date and evidence, machine-attributed) or one by one by members is the job's START question; R26 holds either way. The actor's `entity_id` is offered from the bridge's office entities, as `actor` was from the profile's `counterparties`.
- Id prefix `CONF-` (`allocId` plus a slug), registered in the catalogue with the one state `recorded` and no edges (K171); act ids `ACT-`; tables `determinations`, `determination_standards`, `determination_findings`, `determination_questions`, `comparison_proposals`.
- The act's `actor` should be offered from the profile's `counterparties` (jurisdictions R24) but not limited to it.
- `escalation` proposes its first stage from a live `noncompliant` outcome; nothing here triggers it.
- R6: if `promote` cannot nest in an outer `transact`, the job reports it and BOB rules then (K171).
- Every read gates on `membership.sight(project, viewer)` of the record's project before `viewerPredicate` (R15; K171); R1's `DETERMINATION_NOT_A_PARTICIPANT` is this module's code, translated from membership's `PROJECT_ACT_NOT_A_PARTICIPANT` in one line, its catalogue row with the job (K107 (3), K171).
- Tests: every refusal with a negative control; an outsider member against each read; R4 and R5 by a compliant and a noncompliant determination over the same act; R8 with each forbidden key; R10 by reopening a pinned finding and by a newer capture of a standard's text.
- N345 tests: a cause with no evidence is refused, and a determination with none reads "cause not established"; `comparisonFacts` never fills an outcome, and needs `standardSide`; `outcomes_differ` for a compliant and a noncompliant standard; a `recommendation` key is refused.
- **T35-61 (open technical details, BOB's).** R27's read is `standards`' (T35-31 names it); the binding `<body>` is the actor's `body` entity. R27's word list is the same as `case-checker` R21's and `publication`'s labels (one list, BOB's under K1723). Rows C-113.32–C-113.36 take the next numbers of C-113 (C-113.29–.31 are T33-70's) and await promotion's stamp (accepted red 2). Rates across many acts are recipes in `calculations` (T35-38); R29 only reads one.
- **The five elements** (N345) are composed by the surface, never by a module: Criteria and Condition from R21's facts or the rows; Cause from R22; Effect from `consequences`; Recommendation from `actions`' proposed action.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for rulings)

- `conformance`'s uses gain `legacy-checks` and `promotion`; `reevaluation` offers later modules a registration for "a finding's basis changed" (K31's pattern), to be stated in its requirements.
- A determination is a project's (the publishing project's), recorded by a joined participant (membership R55's `joined`).
- The act's actor is an office, not a person (R1); one determination may supersede only one of the same act and project.
- Page cap 200.
