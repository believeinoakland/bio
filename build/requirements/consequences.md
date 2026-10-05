# consequences — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). The layer-9 maps' review folded 2026-09-27 (K171): R1's machine part, R2's grade through `provenance.captureGrade` (uses + `provenance`), R9's superseded parts, the factory's name; no meaning changed. R9's empty case (no live part is `undetermined`) approved by Bob 2026-09-27 (K172). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code and the canon, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 9 (Action). A new module: no `from`, nothing moves. Code today (measured on `tranche/T3` @ `b0656fa`): **nothing records what a government breach did, or to whom.** Nearest, and staying where it is:
- DEC-14's `consequenceState` (`bio-plane/checks/bio-checks.mjs` 4918–4977; read at `store.mjs` 2155; `schema.mjs` 1920): the consequence of the **group's own action** (an `outcome`, or an `impact` that is `unproven` until it rests on evidence outside the action). It is `actions`'. Its discipline, that a causal claim from sequence alone lands as `unproven` and says so rather than being refused or graded low, is the model for R5 here.
- Money in the record today is only a correspondence fee quote (D-148: `action_quotes`, `schema.mjs` 2012; `store.mjs` 6882–7060). The record holds no amounts or fund figures as values (`EXTRACTION-BREADTH-DESIGN.md` §2 rows 5–6: no budget or financial-report reader; `progressions`' question 3, K102). So R3's computed figures read the numbers in cited content, and until such readers exist most consequences will be assessed or undetermined.
Bob's ruling of 2026-09-26 (K12) is R2–R4. No old-plan row is carried to `consequences`; no check in `bio-checks.mjs` belongs to it. N309 wordings folded by BOB #62, 2026-09-29 (K380). T33's fold, by a requirements worker for BOB #114 on `tranche/T33`, 2026-10-05, from plan entry T33-71 (B1b.6; C:A-11; the audit's "consequences · R10" and "consequences · R2" changes; K1448, K1484 (C2 row 7)): Terms amended (a person a document names may be affected; measures are exact decimals); R1 amended (`AFFECTED_INDIVIDUAL` replaced by R10's conditions; `MEASURE_INVALID` read exactly); R2 amended (operands are figures read by `calc-grammar`, money facts or calculation outputs; the arithmetic is `calc-grammar`'s; this module's own parser deleted); R10 amended (a harmed person may be named; publication names them only with consent or as Design Requirement 6 allows; a source stays protected); R16 (a harmed person in a read) added; Uses gain `calc-grammar`, `money`, `calculations`, `people`; not yet met (T33-71).

**Size (P6).** New. Estimated 700–1,000 lines of code; one session reads it with the public parts of its uses.

## Public

### Purpose

What a breach did, and to whom: for a noncompliant determination, who or what is affected (a class of people, a fund, a program, a service), the measure (money, benefits, services, time, counts) and the period. Computed from the record where the record holds the figures, each with its basis and grade; otherwise undetermined, and members determine it from the record and their own assessment, each part recorded as what it is. That the harm follows from the act is a finding that needs evidence, never assumed. It also records whether each consequence has been addressed, which `escalation`'s exit condition reads (Operational Principle 6). Significance is not here: it stays the member's judgment (K12).

### Provides

Terms. **Affected** is `{kind, description, role?, person?}`, `kind` one of `class`, `fund`, `program`, `service`, `body`, `person`, `other`; `role` is `{role, body}` for an office; `person` is `{entity, named_in}` for `kind: person` (R10). A **measure** is `{unit, currency?, value | range}`, `unit` one of `money`, `benefits`, `services`, `time`, `count`, each value an exact decimal (`calc-grammar`), never a floating-point number. *(not yet met: T33-71)* A **part** is one affected, one measure and one period, in one **state**: `computed`, `assessed` or `undetermined`.

**consequenceRecord({determination, standard, affected, measure?, period, basis, causation?, author, viewer}) → `{ok: true, id, part}` or refusal**
- **R1** Refusals in order: `NO_SUCH_DETERMINATION` (absent or invisible, one answer; `conformance.noSuchDetermination`, its R19); `DETERMINATION_SUPERSEDED` (`conformance.determinationSuperseded`, its R20); `CONSEQUENCE_NOT_NONCOMPLIANT` (the determination's outcome for `standard` is not `noncompliant`; its row C-114.2, K275); `CONSEQUENCE_NOT_A_PARTICIPANT` (a member author not joined in its project; a machine's computed part, R2, answers no project authority, K171; its row C-114.3, K275); `AFFECTED_UNKNOWN_KIND`; R10's refusals for `kind: person`; `MEASURE_UNKNOWN_UNIT`; `MEASURE_INVALID` (a value or range bound that does not read as an exact decimal through `calc-grammar`, a range reversed, or `currency` on a unit other than `money`); `PERIOD_INVALID`. *(not yet met: T33-71)*
- **R2** A part is `computed` when `basis` is a computation over the record: `{op, operands}`, `op` one of `sum`, `difference`, `count`, `product`, `ratio`, and each operand one of: a content id whose passage holds the figure, read by `calc-grammar`'s figure reader (its R1–R3: exact, with its currency sign or code kept and `%` read as a percent; this module holds no parser of its own, C:A-11); a money fact (`money.readFact`), its amount as held (B1b.6); or a calculation's output (`calculations.read`, named by calculation and result key, K1448). The value is `calc-grammar`'s exact arithmetic over the operands (`product` is its `multiply`), never the author's and never floating point; operands of different currencies or units are refused as `calc-grammar` refuses them (`UNIT_MISMATCH`), and a total across money facts `money.summable` refuses is refused by its code. Each operand carries its grade: a content operand its capture's grade (`provenance.captureGrade`, K171), a money fact its own grade, a calculation output the capture axis of its grade facts (`calculations` R9); the part's grade is the weakest (DEC-21's weakest link), named. *(not yet met: T33-71)* A computed part may be recorded by a machine, labelled as machine work with its operands shown (K102); assessment (R3) and addressed (R9) stay members' alone.
- **R3** A part is `assessed` when a member states the value or range with a rationale (at most 2,000 characters) and what it rests on (content ids or findings, possibly none, stated as none). It carries who assessed it and when, and is never presented, summed or graded as computed. A machine assessment is refused `MACHINE_CANNOT_ASSESS`.
- **R4** A part with no measure, or whose computation lacks an operand, is `undetermined`, with why (the figure is not in the record; the record holds it in a form not read; nobody has assessed it). An undetermined part is never read as zero.
- **R5** `causation` names an inquiry whose finding is that the harm follows from the act. A part whose measure is zero (value 0, or range [0, 0]) answers causation `not_applicable` and is not counted `unproven` by R9, so a group's judgment of no consequence can be addressed and end an escalation (Bob, K283; N257). Otherwise, with none, or one not concluded, the part's causation is `unproven`, stated with why: it lands, is not a refusal and is never a low grade (DEC-14's discipline, applied to the government's act). With one, the answer carries its strength pair (`strength.inquiryStrength`), per axis.
- **R6** A part is never edited: `consequenceRevise({id, ..., reason, author})` records a successor, with R1's refusals, and the earlier part stays readable with the link.

**consequencesOf({determination, standard?, viewer}) → `{parts, totals, undetermined, unproven}`**
- **R7** Lists every live part of the determination with its state, grade or assessor, causation and addressed state. `totals` are summed only within one state, one unit and one currency, each labelled with its state and the parts it counts; nothing is summed across states, units or currencies. `undetermined` and `unproven` list the parts in those states, so what is not known is in front of the member (Functional Architecture Function 4: "informed by … consequences").
- **R8** A part whose operand content has a newer capture that does not carry the passage, or whose causation inquiry is reopened or superseded, is flagged `basis_changed`, naming why; nothing is recomputed or moved until a member revises it.

**addressedRecord({id, state, evidence, reason, author, viewer}); addressed({determination, viewer}) → `{state, parts}`**
- **R9** A member records a part `addressed` or `not_addressed`, with evidence (content ids or findings; `ADDRESSED_NO_EVIDENCE` for `addressed` with none) and a reason; `MACHINE_CANNOT_ADDRESS` otherwise. `addressed` answers per part, and overall `addressed` only when every live part is addressed; any part `not_addressed` or never assessed makes it `not_addressed`, and any `undetermined` or `unproven` part makes it `undetermined`. A determination with no live part is `undetermined`, "no consequence recorded", never `addressed`: a group that judges a breach had no consequence records an assessed part saying so (R3, a member's judgment with its rationale) and addresses it (K172). `addressedRecord` is accepted on the parts of a superseded determination, which `escalation` R14 reads (K171). Partial redress does not end the escalation (Roadmap §5, Principle 6's explanatory note). This is the check `escalation` reads for "consequences addressed".

## Private

### Uses

- `record-grammar`: `isMachineIdentity`; the `CONS-` type registration (R14).
- `record-core`: `allocId`, `transact`, `stampInstant`.
- `membership`: `sight`, `projectAuthority`, `viewerPredicate`.
- `promotion`: `promote`, a part being a record object (R14, K102).
- `content`: `contentRow` and its passage text (R2's operands), `passageNotice` (R8).
- `provenance`: `captureGrade` (R2, K171).
- `inquiry`: the causation inquiry's state and supersession (R5, R8).
- `strength`: `inquiryStrength` (R5).
- `calc-grammar` (T33-71): the figure reader, exact arithmetic and unit refusals (its R1–R5; R2), replacing `consequences/figures.mjs`.
- `money` (T33-71): `readFact`, `summable` (R2). `calculations` (T33-71): `read` (R2).
- `people` (T33-71): the source↔person link's sight (R10, R16).
- `conformance`: `determinationRead` (R1); `noSuchDetermination` and `determinationSuperseded` (its R19, R20), through which R1's, R7's and R9's `NO_SUCH_DETERMINATION` and R1's `DETERMINATION_SUPERSEDED` are answered, in place of C-114.1 (N309, K275).

### Invariants

- **R10** (K1484 C2 row 7; K1483) People are counted as a class or named in their official role, and a harmed party may also be a person a document names: `affected.kind: person` names a `person` entity and `named_in`, a content id of a held capture whose passage names that person; one with no such passage is `AFFECTED_PERSON_NOT_NAMED`, one whose entity is not a person `AFFECTED_NOT_A_PERSON`. The record holds the person as the document names them. Published text names such a person only with their consent or as Design Requirement 6 allows (`case-disclosures` R25), and a person the record holds as a protected source (`people`' source↔person link) stays protected: no read of this module names them to a viewer that link's sight does not admit (R16; DEC-78). *(not yet met: T33-71)*
- **R11** No answer composes computed, assessed and undetermined parts into one figure, and none carries a significance, severity, priority or score (K12).
- **R12** No harm is assumed from the act: every part answers its causation, `established` (naming the inquiry) or `unproven`, or `not_applicable` for a zero measure, which claims no harm (N257, K283).
- **R13** Parts, revisions and addressed records are append-only and declared to `record-core`'s purge (K23). No place is named in this module's behaviour or outward text. Every read answers a part in a project the viewer may not see as absent; inside a part the viewer may see, R15.
- **R14** A consequence part is a record object of its own type: promoted through `promotion`, with history, audit and export like a finding; R6's rule holds, a revision being a successor (`standards` R15).
- **R15** (K903 (4), DEC-36) A part's answer (R6, R7 and every read that answers parts) withholds whole what the viewer may not see:
  - an operand whose content lies in a bundle the viewer may not see leaves `computation.operands`;
  - a causation inquiry the viewer may not see is not named: `causation` keeps the `state` the part recorded, and its `inquiry`, `why` and `strength` keys are left out;
  - an id in an assessment's `rests_on` or an addressed record's `evidence` the viewer may not see leaves its list;
  - an R8 cause about a withheld operand or the withheld causation is left out.

  No id, title, state, placeholder or count: never a null in its place. The part states `out_of_view: true`, which says only that something was withheld. The computed value and grade, and every other fact the part records, stand. A viewer who may see everything is answered as before, with no `out_of_view` key.

- **R16** (K1484 C2 row 7) A part whose `affected` is a person is answered with the person entity and the passage naming them to a viewer who may see that passage's capture; to any other viewer the part answers `affected: {kind: person}` with the entity and passage withheld whole (R15's rule, `out_of_view: true`), and the computed value and grade stand. A person linked as a protected source is withheld from every viewer the link's sight does not admit, whatever the capture's sight. *(not yet met: T33-71)*

### Satisfies

- K1448 (R2: calculation outputs as operands), K1484 C2 row 7 and K1483 (R10, R16).
- `BIO_Complete_Roadmap_v5.md` §5, Operational Principle 6 and its note (partial compliance does not stop the clock), and §10 (the exit condition).
- `BIO_Functional_Architecture_v3.md`, Layer 2 Function 4 (significance informed by consequences) and Layer 3 Function 5 (compliance restored AND consequences addressed).
- `docs/development/DECISIONS.md` DEC-14 (impact is not asserted from sequence alone), DEC-21 (weakest link), DEC-44.
- `BIO_Interaction_Constructs_v0_1.md`, UNDETERMINED as a display primitive (R4, R7).
- `build/layers.md`, layer 9 (the `consequences` row; Bob's ruling 1); K12.

### Suggestions

- The factory is `consequencesModule(ctx)`; the service keeps its approved name `consequencesOf` (R7), as the approved name wins any collision (K171).
- Id prefix `CONS-` (`allocId` plus a slug), registered in the catalogue with the one state `recorded` and no edges (K171); tables `consequence_parts`, `consequence_operands`, `consequence_addressed`.
- Operands read their figure from the cited passage's text; a spreadsheet cell or table extent (`content`'s `sheet-range` and `doc-table` arms) is the natural operand. The parser of figures is `calc-grammar`'s since T33 (its R3 accepts every figure this module's parser accepted, with the same value; the job proves it and deletes `figures.mjs`); a budget or financial-report reader, when written, belongs to `extraction`/`docprofile`, not here.
- An AI run may prepare computed parts (R2) and propose assessments as text for a member; it never records `assessed` or `addressed`.
- **Who says a consequence is addressed** (K102): any joined participant, with evidence, as R9, no change; an escalation ends only by a member's own act (`escalation` R14), so no single entry here closes one silently.
- Tests: every refusal with a negative control; R2's arithmetic against hand-computed operands and the weakest-grade rule, `0.1 + 0.2` exact; R7's totals with mixed states and currencies; R9's overall state across all mixes, the empty case included; R10 with `kind: "person"` named by a passage, and refused with none; R16's withholding from a viewer who may not see the passage.
- **T33-71 (open technical details, BOB's).** R10's new codes join C-114 at the job's stamp. Whether an existing part's stored float values are re-read as exact decimals or kept as recorded is the job's START question (a part is never edited, R6).

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for rulings)

- `consequences`' uses gain `legacy-checks` and `promotion` (R14, K102).
- DEC-14's `consequence` on an action (the group's own outcome or impact) stays `actions`'; this module's consequence is the breach's. The two are never read as one; this module reuses only DEC-14's `unproven` rule.
- Totals within one state, unit and currency only (R7); an undetermined part is never zero.
- A part is recorded against one standard's noncompliant outcome of a live determination; a superseded determination's parts stay readable, not carried forward automatically.
