# calculations — requirements

**Status** · DRAFT by a requirements-drafting worker for BOB #114, 2026-10-05, on `tranche/T32`, for T33 (§5.9); for BOB's review and Bob's approval (a new product module, P17). Layer 5, last before the conditional `workbooks` (plan Rules (2); K1470). Meaning from the capability ladders §2 ANALYSIS and MONEY, §8.3 L2, §8.4, §8.5 L4 (the parts plan scope §1 takes into T33), §10, and rulings K1447, K1448, K1452, K1463, K1468, K1471, K1473, K1483, K1491, K1504; entries C:A-2, C:B-1, C:B-2 (`draft-T33-entries-C.md`), B1b.5 (`-B.md`), plan entry T33-41 and Choices 17. Code today: none. Not yet met: every requirement (T33-41).

**Size (P6).** New. Expected 2,500–3,500 lines (plan P6 notes); measured at the job. The workbook path is `workbooks`' (T33-42), never added here.

## Public

### Purpose

The calculation (`CALC-`): numbers a finding can rest on, computed only by `calc-grammar`'s closed recipe grammar over declared canonical tables, money facts, cited figures and counts over the record, with denominators, grade facts and a method, stored by key and recomputed at acceptance, at publication and in the checker, never on a read. It holds the tables, the money ingest writer (money facts from an adopted table binding, only at a member's request), the recorded random draw, fact-based rankings and the machine's patterns (held in the hypothesis layer, shown only after a measured false-alarm rate). A total is a `CALC-` and is never re-entered as a money fact; `compare` yields a labelled computed fact, never "breach".

### Provides

Terms. A **recipe** is `calc-grammar`'s (`bio-calc/1`), evaluated only by it. A **result key** is `sha(recipe, inputs, method_version)`. An **input** is one of: a declared table (by its canonical sha256), money facts (`MNY-`), a cited figure (a content extent `calc-grammar`'s figure parser reads), another `CALC-`, or a frozen record set (R21). A **viewer** is the control plane's stamp; it fails closed when absent. Every refusal is `{ok: false, reason, detail}`; one with a catalogue row carries `code`, `check` and `translation`. Every write is stamped by the control plane.

**Tables: declareTable({source, schema, header, roles?, vintage?, by}), readTable({sha, viewer}), tablesAt({key, at, viewer})** (`op=tabledeclare`, `op=table`)
- **R1** `declareTable` takes a captured source (a content extent of a CSV, a workbook range or a portal export, `content`) and a Table Schema with a declared header, and holds the table as canonical RFC 4180 UTF-8 CSV plus its schema, keyed by the canonical bytes' sha256, its bytes in the evidence store, streamed. A value that does not parse as its column's declared type is held `undetermined`, never coerced. Refusals: `NO_SOURCE`, the extent's refusal, `NO_HEADER`, `BAD_SCHEMA` (naming the field), `TABLE_TOO_LARGE` (over 20 MiB or 500,000 cells, naming the bound; K1576: evaluation within a Worker's heap until N571). *(not yet met: T33-41)*
- **R2** A column may carry a role from closed lists: money roles (`amount`, `payer`, `payee`, `fund`, `account`, `period`, `kind`, `phase`, `stage`, `basis`, `currency`), person and entity keys (each naming the id space or captured crosswalk it resolves through), and `roster` roles (person key, organisation, post, period). A declaration is the member's; a machine may not declare one (K1468). *(not yet met: T33-41)*
- **R3** A table may carry a vintage, a validity (`civil-time`) under a key the member names; `tablesAt` answers the vintage valid at `at` through `civil-time.validAt`, or `undetermined` with the reason, never the latest by default. *(not yet met: T33-41)*

**Calculations: create({question, terms, period, inputs, recipe, kind, threshold?, methodNote?, evidences?, project, by}), evaluate({recipe, inputs, viewer}), accept({calcId, by}), recompute({calcId}), read({calcId, viewer})** (`op=calculationcreate`, `op=calculationevaluate`, `op=calculationaccept`, `op=calculation`)
- **R4** `create` records a `CALC-` with its question, terms, period, inputs, recipe, kind, method version, method note and project, evaluates the recipe through `calc-grammar` (`checkRecipe`, `evaluate`) and stores the results under the result key (`calc-grammar.resultKey`). Refusals, in order: `NO_QUESTION`, `NO_PERIOD`, `NO_INPUTS`, `NO_SUCH_INPUT` (naming it), `HYPOTHESIS_NOT_A_FACT` (an input or threshold naming a hypothesis id, `record-grammar.isHypothesisId`; K1467), then `calc-grammar`'s refusal of the recipe, by name. *(not yet met: T33-41)*
- **R5** Every result of a `share` or `ratio` carries its denominator; every `compare` result is labelled a computed fact and never "breach" or "violation" (D275); values that could not be counted (an `undetermined` cell, an input out of view at evaluation) are counted apart and stated, never as zero. *(not yet met: T33-41)*
- **R6** A threshold is a value or a held standard cited at its version (`standards`); a standard not in force for the calculation's period (`standards.inForceAt`) is refused `THRESHOLD_NOT_IN_FORCE`, or stated `undetermined` with the reason. *(not yet met: T33-41)*
- **R7** `evaluate` answers what `create` would store and writes nothing. *(not yet met: T33-41)*
- **R8** Results are recomputed at `accept`, at publication and in the checker (`recompute`), never on a read: `read` answers the stored results with `computed_at` and the method version. `accept` recomputes and is refused `CALC_RECOMPUTE_DIFFERS`, naming the differing result, when the recompute differs from what is stored; `recompute` answers `{agrees, results}` and writes only the recompute status. *(not yet met: T33-41)*
- **R9** `read` answers the calculation with its grade facts (K1447 (ii)): per input its capture grade capped by its derivation; the calculation's capture axis is the weakest; recipe arithmetic is not a weakening step; an unbound input is testimony (D); the method is disclosed, not graded. `strength` reads them. *(not yet met: T33-41)*
- **R10** A calculation any of whose inputs the viewer may not see is withheld whole: every read answers it exactly as an absent one (DEC-36, DEC-85). *(not yet met: T33-41)*
- **R11** `onInputChanged(module, fn)` (one registration per module, through `membership`'s `listenerRefusal`): when an input of a held calculation changes (a money fact it names is corrected or withdrawn, as `money` reports; a table vintage it names is superseded), the calculation's recompute status becomes `stale` and each listener is told once with `{calcId, input, cause: "calculation_input_changed"}`. Nothing is recomputed by itself. *(not yet met: T33-41)*

**Money over calculations** (C:B-1, K1463, K1468)
- **R12** A total over money facts is refused by name across kind, phase or stage, basis, currency or period (`money.summable`, whose codes are `calc-grammar`'s); a total across funds that includes interfund transfers is answered with the interfund flag `money.summable` names. *(not yet met: T33-41)*
- **R13** No act of this module records a money fact whose source is a `CALC-`, and no result is ever written as a money fact. *(not yet met: T33-41)*
- **R14** `adoptBinding({table, roles, by})` records a member's adoption of a table's money roles (R2). `ingestMoney({binding, rows, reason?, by})` writes money facts through `money.recordFact`, machine-attributed, only at a member's request, only from an adopted binding, and only for rows whose payer and payee each resolve through an identifier (an id space or captured crosswalk): each fact cites its canonical row as its source. Rows that cannot be written are listed `not_written`, each with its reason. `rows` selects rows; all rows are taken only with `rows: "all"` and a stated `reason`. *(not yet met: T33-41)*

**Joins by person** (C:B-2, K1452)
- **R15** A `join` from a table to registered entities, persons included, runs only through an id space (`id-spaces`) or a captured crosswalk table declared as one; a join on a name alone is refused `JOIN_NOT_BY_IDENTIFIER`. Rows may be grouped by person. *(not yet met: T33-41)*

**Fact-based analysis: buys, unit cost, budget against actuals, rankings** (K1471; ladders §8.5)
- **R16** A unit cost is a `ratio` of a money fact's amount over its `buys` quantity, with the unit stated; budget against actuals compares an `adopted` total with an `actual` total per fiscal period (`civil-time`'s periods from the profile), each total within one phase and basis (R12), the bases stated beside the result. *(not yet met: T33-41)*
- **R17** A ranking orders by one stated, measured quantity and names its quantity, scope and period, cites its inputs, records its method and states what it could not count. A recipe composing several measures into one score, or a measure across mixed kinds of link, is refused `SCORE_NOT_A_FACT` (K1471, K1473). *(not yet met: T33-41)*

**Recorded draws: draw({set, n, seed?, by})** (`op=calculationdraw`; K1448)
- **R18** A draw is over a frozen set (a table's sha or a frozen record set), records the seed, the set's sha and the drawn members, and reproduces exactly from them (`calc-grammar.draw`). A population estimate is answered only over a recorded draw, with its exact interval (`calc-grammar.interval`); an estimate without one is refused `ESTIMATE_WITHOUT_DRAW`. *(not yet met: T33-41)*

**Registrations it fills**
- **R19** At start it registers with `duties.registerOccurrenceEvidence`; asked `{duty, occurrence}`, an accepted calculation that names, in `evidences`, the duty occurrence it measures is answered to `duties` as that occurrence's evidence, with its results and grade facts; a stale or withheld one is answered as such. *(not yet met: T33-41)*
- **R20** At start it registers with `people.registerRosterSource`: for an organisation and a date it answers the rows of tables with `roster` roles valid at that date (R3), by person key, with the table's sha, and reads no row into a line. *(not yet met: T33-41)*

**Counts over the record** (C3)
- **R21** `freezeSet({query, by})` freezes the ids a saved query answers for the asking member (`retrieval`) as a record set with its sha, so a count over the record ("41 of 58 contracts at Grade B") is a recipe over a frozen set with its denominator, reproducible from the set. *(not yet met: T33-41)*

**The machine's patterns** (K1471, K1473, K1491; Rules 7; Choices 17)
- **R22** Shipped, data-defined patterns: sequence anomalies (events out of their declared flow's order, `progressions`, `events.sequence`), lateness (days late per occurrence, `duties`, and per meeting's posting, `events`), and patterns about an office and across proceedings, each a recipe with its denominator and cited derivation. `runPatterns({budgetMs})` evaluates them within the budget into their own result table, never onto a person or entity row, and answers `{evaluated, remaining}`. *(not yet met: T33-41)*
- **R23** A pattern's results are answered only once its gate is recorded at a false-alarm rate of at most 20% on its gold set (K1504, M-C8), by an administrator's `recordPatternGate({pattern, goldSet, falseAlarmRate, by})`; until then the read answers `{gated: true, reason}`. Each answered result is labelled the machine's, `layer: "hypothesis"`, "Noticed", and is switchable off per project; `onPatternResult(module, fn)` tells `notice-producers` once per new result. A result resting on a row the viewer may not see is withheld whole and not counted. *(not yet met: T33-41)*

**The ops map**
- **R24** The module publishes `calculationsOps(calculations, url, body)`, route arms for the ops above (C:A-16). *(not yet met: T33-41)*

## Private

### Uses

- `record-grammar`: `ID_TABLE` (`CALC-`), `OBJECT_TYPES`' `calculation`, `isHypothesisId`.
- `calc-grammar`: `parseFigure`, decimal arithmetic, `checkRecipe`, `evaluate`, `resultKey`, `draw`, `interval` (R4–R8, R18).
- `civil-time`: `validAt`, `span`, fiscal periods (R3, R16).
- `id-spaces`: the resolver `calc-grammar`'s `join` takes from its caller (R15; Choices 4).
- `record-core`: `allocId`, `transact`, `declareTable`, `evidenceStore` (R1).
- `membership`: `viewerPredicate`, `listenerRefusal`, `notAnAdmin`.
- `promotion`, `provenance`, `content`: the source extent and its visibility (R1, R10).
- `entities`, `events`, `lines`, `standards`, `progressions`, `money`, `duties`, `people`: inputs and registrations (R6, R11–R14, R19, R20, R22).
- `retrieval`: the saved query's ids for the asking member (R21). *(an edge beyond plan Rule 3's list; see the report)*

### Invariants

- **R25** Only the evaluator computes: every stored number is `calc-grammar`'s result over held inputs; no number is taken from a caller's field or a model (ladders §8.5 L5). *(not yet met: T33-41)*
- **R26** No eval and no user code is run; a recipe outside the closed grammar is refused by `calc-grammar` (ladders §2 ANALYSIS). *(not yet met: T33-41)*
- **R27** No outward text uses "breach", "violation", "diverted", "misused" or a score's word (K1486, D275). *(not yet met: T33-41)*
- **R28** No place is named in this module's behaviour, defaults or outward text; fiscal years and schemes are profile data. *(not yet met: T33-41)*
- **R29** Table declarations (`record-core`): tables, bindings, calculations, draws and results (export `yes`); pattern definitions and results (export `admin-only`); each keyed to its project for purge. *(not yet met: T33-41)*

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 ANALYSIS and MONEY ("A total is a `CALC-` …", "Ledgers stay captured tables …"); §8.3 L2; §8.4 L2; §8.5 L4 (recorded draws, vintages, amount and pattern statements, as plan scope §1 takes them); §8.6; §5A.4 (`registerRosterSource`); §3 (occurrence evidence); §10 rows "Every amount names its kind …", "Machine signals live in the hypothesis layer", "Hypotheses have a place, never in findings", "Extraction is targeted", "The machine never concludes".
- Bob's rulings K1452, K1463, K1468, K1471, K1473, K1483, K1491; BOB's K1447, K1448, K1470, K1504.
- DEC-36, DEC-85 (withheld whole), DEC-112 (recomputable without Civicsmith), D275.

### Suggestions

- **Factory.** `calculationsOf(ctx)`. Evaluation over a 20 MiB table streams from the evidence store; CPU and peak memory measured at the job.
- **Identity of a table.** Its canonical sha256; no new id prefix.
- **Patterns.** `scheduler` (T33-80) registers the consumer that calls `runPatterns`; `notice-producers` (T33-82) registers `onPatternResult`. A member's own recipe over the same data is an ordinary calculation and is not gated.
- **Tests.** Every refusal with a negative control; R5 an undetermined cell counted apart; R8 a tampered stored result; R10 one hidden input; R12 each summation axis; R14 a row without a payee identifier; R15 a name-only join; R18 a draw reproduced from its seed.

## Open for Bob

None: the meaning is the ladders' and Bob's rulings. Open technical points for BOB are in the drafting report.
