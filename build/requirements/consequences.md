# consequences — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code and the canon, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 9 (Action). A new module: no `from`, nothing moves. Code today (measured on `tranche/T3` @ `b0656fa`): **nothing records what a government breach did, or to whom.** Nearest, and staying where it is:
- DEC-14's `consequenceState` (`bio-plane/checks/bio-checks.mjs` 4918–4977; read at `store.mjs` 2155; `schema.mjs` 1920): the consequence of the **group's own action** (an `outcome`, or an `impact` that is `unproven` until it rests on evidence outside the action). It is `actions`'. Its discipline, that a causal claim from sequence alone lands as `unproven` and says so rather than being refused or graded low, is the model for R5 here.
- Money in the record today is only a correspondence fee quote (D-148: `action_quotes`, `schema.mjs` 2012; `store.mjs` 6882–7060). The record holds no amounts or fund figures as values (`EXTRACTION-BREADTH-DESIGN.md` §2 rows 5–6: no budget or financial-report reader; `progressions`' question 3, K102). So R3's computed figures read the numbers in cited content, and until such readers exist most consequences will be assessed or undetermined.
Every requirement is *(not yet met: new module)*. Bob's ruling of 2026-09-26 (K12) is R2–R4. No old-plan row is carried to `consequences`; no check in `bio-checks.mjs` belongs to it.

**Size (P6).** New. Estimated 700–1,000 lines of code; one session reads it with the public parts of its uses.

## Public

### Purpose

What a breach did, and to whom: for a noncompliant determination, who or what is affected (a class of people, a fund, a program, a service), the measure (money, benefits, services, time, counts) and the period. Computed from the record where the record holds the figures, each with its basis and grade; otherwise undetermined, and members determine it from the record and their own assessment, each part recorded as what it is. That the harm follows from the act is a finding that needs evidence, never assumed. It also records whether each consequence has been addressed, which `escalation`'s exit condition reads (Operational Principle 6). Significance is not here: it stays the member's judgment (K12).

### Provides

Terms. **Affected** is `{kind, description, role?}`, `kind` one of `class`, `fund`, `program`, `service`, `body`, `other`; `role` is `{role, body}` for an office. A **measure** is `{unit, currency?, value | range}`, `unit` one of `money`, `benefits`, `services`, `time`, `count`. A **part** is one affected, one measure and one period, in one **state**: `computed`, `assessed` or `undetermined`.

**consequenceRecord({determination, standard, affected, measure?, period, basis, causation?, author, viewer}) → `{ok: true, id, part}` or refusal**
- **R1** Refusals in order: `NO_SUCH_DETERMINATION` (absent or invisible, one answer); `NOT_NONCOMPLIANT` (the determination's outcome for `standard` is not `noncompliant`, or it is superseded); `NOT_A_PARTICIPANT` (a member author not joined in its project); `AFFECTED_UNKNOWN_KIND`; `AFFECTED_INDIVIDUAL` (R10); `MEASURE_UNKNOWN_UNIT`; `MEASURE_INVALID` (a value or range bound not a finite number, a range reversed, or `currency` on a unit other than `money`); `PERIOD_INVALID`. *(not yet met: new module)*
- **R2** A part is `computed` when `basis` is a computation over the record: `{op, operands}`, `op` one of `sum`, `difference`, `count`, `product`, `ratio`, and each operand a content id whose passage holds the figure, with the figure as read. The value is the module's own arithmetic over the operands, never the author's; each operand carries its capture grade as the record earns it (`inquiry.earned`), and the part's grade is the weakest (DEC-21's weakest link), named. A computed part may be recorded by a machine, labelled as machine work with its operands shown (K102); assessment (R3) and addressed (R9) stay members' alone. *(not yet met: new module)*
- **R3** A part is `assessed` when a member states the value or range with a rationale (at most 2,000 characters) and what it rests on (content ids or findings, possibly none, stated as none). It carries who assessed it and when, and is never presented, summed or graded as computed. A machine assessment is refused `MACHINE_CANNOT_ASSESS`. *(not yet met: new module)*
- **R4** A part with no measure, or whose computation lacks an operand, is `undetermined`, with why (the figure is not in the record; the record holds it in a form not read; nobody has assessed it). An undetermined part is never read as zero. *(not yet met: new module)*
- **R5** `causation` names an inquiry whose finding is that the harm follows from the act. With none, or one not concluded, the part's causation is `unproven`, stated with why: it lands, is not a refusal and is never a low grade (DEC-14's discipline, applied to the government's act). With one, the answer carries its strength pair (`strength.inquiryStrength`), per axis. *(not yet met: new module)*
- **R6** A part is never edited: `consequenceRevise({id, ..., reason, author})` records a successor, with R1's refusals, and the earlier part stays readable with the link. *(not yet met: new module)*

**consequencesOf({determination, standard?, viewer}) → `{parts, totals, undetermined, unproven}`**
- **R7** Lists every live part of the determination with its state, grade or assessor, causation and addressed state. `totals` are summed only within one state, one unit and one currency, each labelled with its state and the parts it counts; nothing is summed across states, units or currencies. `undetermined` and `unproven` list the parts in those states, so what is not known is in front of the member (Functional Architecture Function 4: "informed by … consequences"). *(not yet met: new module)*
- **R8** A part whose operand content has a newer capture that does not carry the passage, or whose causation inquiry is reopened or superseded, is flagged `basis_changed`, naming why; nothing is recomputed or moved until a member revises it. *(not yet met: new module)*

**addressedRecord({id, state, evidence, reason, author, viewer}); addressed({determination, viewer}) → `{state, parts}`**
- **R9** A member records a part `addressed` or `not_addressed`, with evidence (content ids or findings; `ADDRESSED_NO_EVIDENCE` for `addressed` with none) and a reason; `MACHINE_CANNOT_ADDRESS` otherwise. `addressed` answers per part, and overall `addressed` only when every live part is addressed; any part `not_addressed` or never assessed makes it `not_addressed`, and any `undetermined` or `unproven` part makes it `undetermined`. Partial redress does not end the escalation (Roadmap §5, Principle 6's explanatory note). This is the check `escalation` reads for "consequences addressed". *(not yet met: new module)*

## Private

### Uses

- `legacy-checks`: `isMachineIdentity`. *(not declared)*
- `record-core`: `allocId`, `transact`, `stampInstant`.
- `membership`: `sight`, `projectAuthority`, `viewerPredicate`.
- `promotion`: `promote`, a part being a record object (R14, K102). *(not declared)*
- `content`: `contentRow` and its passage text (R2's operands), `passageNotice` (R8).
- `inquiry`: `earned` (R2); the causation inquiry's state and supersession (R5, R8).
- `strength`: `inquiryStrength` (R5).
- `conformance`: `determinationRead` (R1).

### Invariants

- **R10** People are counted as a class or named in their official role, never singled out: no part names an individual; `affected.kind` has no person value, and a `role` is an office `{role, body}`. *(not yet met: new module)*
- **R11** No answer composes computed, assessed and undetermined parts into one figure, and none carries a significance, severity, priority or score (K12). *(not yet met: new module)*
- **R12** No harm is assumed from the act: every part answers its causation, `established` (naming the inquiry) or `unproven`. *(not yet met: new module)*
- **R13** Parts, revisions and addressed records are append-only and declared to `record-core`'s purge (K23). No place is named in this module's behaviour or outward text. Every read answers a part in a project the viewer may not see as absent. *(not yet met: new module)*
- **R14** A consequence part is a record object of its own type: promoted through `promotion`, with history, audit and export like a finding; R6's rule holds, a revision being a successor (`standards` R15). *(not yet met: new module; K102)*

### Satisfies

- `BIO_Complete_Roadmap_v5.md` §5, Operational Principle 6 and its note (partial compliance does not stop the clock), and §10 (the exit condition).
- `BIO_Functional_Architecture_v3.md`, Layer 2 Function 4 (significance informed by consequences) and Layer 3 Function 5 (compliance restored AND consequences addressed).
- `docs/development/DECISIONS.md` DEC-14 (impact is not asserted from sequence alone), DEC-21 (weakest link), DEC-44.
- `BIO_Interaction_Constructs_v0_1.md`, UNDETERMINED as a display primitive (R4, R7).
- `build/layers.md`, layer 9 (the `consequences` row; Bob's ruling 1); K12.

### Suggestions

- Id prefix `CONS-`; tables `consequence_parts`, `consequence_operands`, `consequence_addressed`.
- Operands read their figure from the cited passage's text; a spreadsheet cell or table extent (`content`'s `sheet-range` and `doc-table` arms) is the natural operand. A parser of figures is this module's; a budget or financial-report reader, when written, belongs to `extraction`/`docprofile`, not here.
- An AI run may prepare computed parts (R2) and propose assessments as text for a member; it never records `assessed` or `addressed`.
- **Who says a consequence is addressed** (K102): any joined participant, with evidence, as R9, no change; an escalation ends only by a member's own act (`escalation` R14), so no single entry here closes one silently.
- Tests: every refusal with a negative control; R2's arithmetic against hand-computed operands and the weakest-grade rule; R7's totals with mixed states and currencies; R9's overall state across all mixes; R10 with `kind: "person"`.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for rulings)

- `consequences`' uses gain `legacy-checks` and `promotion` (R14, K102).
- DEC-14's `consequence` on an action (the group's own outcome or impact) stays `actions`'; this module's consequence is the breach's. The two are never read as one; this module reuses only DEC-14's `unproven` rule.
- Totals within one state, unit and currency only (R7); an undetermined part is never zero.
- A part is recorded against one standard's noncompliant outcome of a live determination; a superseded determination's parts stay readable, not carried forward automatically.
