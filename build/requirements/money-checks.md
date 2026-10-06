# money-checks — requirements

> **DRAFT by a requirements worker for BOB #114, not reviewed.** 2026-10-05, on `tranche/T32` (P18), for T33's opening (§5.9). Not yet in `build/requirements/`.

**Status** · New product module, layer 5, directly after `money` and before `duties` (plan T33, Rules (2)); split from `money` at creation, with no copy (Choices 9; K1504). Its meaning is the ladders' and the rulings': `BIO_Capability_Ladders_v0_1.md` §5C.4 L3 (amount checks raised as questions), §5C.5 L4 (detectors the machine runs on its own), §2 "Cross-cutting rulings" (machine checks), §10 (machine signals live in the hypothesis layer; a due threshold raises a question), and rulings K1471, K1473, K1491, K1504 (gate: a false-alarm rate of at most 20% on its gold set). Plan entry T33-34, which also moves `progressions` R32 here (T32 A37; Choices 11). Display is gated (plan Rule 7): the checks and detectors are built and their results held, and none is shown before its rate is measured. Every requirement is new and not yet met (T33-34). For BOB's review and Bob's approval (a product module, P17).

**Size (P6).** About 600–1,000 lines (est. 15 requirements). Under 4,000.

## Public

### Purpose

Checks over money facts that raise questions, never verdicts. An **amount check** compares held facts with each other on one contract or one progression instance (committed against paid, a signed amount against its award, change orders against the award). A **detector** is a data-defined pattern the machine runs on its own over the facts held (K1491), with its denominator and cited derivation; its results are held in a table and reach the queue only as "Noticed", the machine's, in the hypothesis layer, and none is shown before its false-alarm rate is measured. Nothing here is a fact, a finding about a person, or a score standing for a judgment.

### Provides

Terms. A **detector** is `{detector_id, version, label, population, condition, denominator, derivation, origin: shipped | member, by}`: `population` a filter over money facts, `condition` a closed `calc-grammar` recipe, `denominator` the population it is counted over. A **result** is `{result_id, detector_id, version, subject, numerator, denominator, derivation, inputs, at}`; `subject` is a money fact, a money set, a contract or a pattern over facts, never a person. A **gate** is a detector version's measured false-alarm rate on a named gold set. The viewer, the refusal shape and `by` are as in `entities`.

**junctionCheck({progressionKey, entityId, viewer})** (`progressions` R32, moved; Framework §8.2)
- **R1** A junction check is data over a progression instance (`progressions`' read of the instance) and its money facts (`money`): a signed amount differing from the award, and amendments (change orders) past a stated share of the award; the amount-free checks (one response, a payment placed after the term) are `progressions`' R31–R32 (K1521, K1563). The award and signed stages are the check's parameters `award_stage`, `signed_stage`. Shown at once, as member-declared (K1505 (8)). Each answers `{check, holds: true | false | undetermined, why, derivation}` with the facts and stages it read, as a question shown as "Noticed", never a violation. It is derived on read and never stored. *(not yet met: T33-34)*

**amountChecks({contract, viewer})**
- **R2** Over `money.committedAgainstPaid` for the contract: paid above committed, a signed amount differing from its award's, and change orders summing above a stated share of the award each answer as R1's shape, with the facts read and both sums. A comparison `money.summable` refuses is answered as that refusal, not a check. *(not yet met: T33-34)*
- **R3** A threshold or share a check reads is a parameter stated in the check's definition with its citation (a held standard or the member's own word), never a default the module assumes. A check with none answers `undetermined: "no threshold stated"`. *(not yet met: T33-34)*

**defineDetector({label, population, condition, denominator, derivation, by}), switchDetector({detectorId, project, on, by}), detectors({viewer})**
- **R4** `defineDetector` refuses `NO_LABEL`, `NO_POPULATION`, `BAD_RECIPE` (`calc-grammar`'s refusal of the condition), `NO_DENOMINATOR`, `NO_DERIVATION`, and a condition or population naming a person entity as its subject (`SUBJECT_IS_PERSON`). A member's definition is recorded as theirs; a change is a new version, earlier versions kept. Shipped detectors are data, versioned the same way. *(not yet met: T33-34)*
- **R5** `switchDetector` is a member's act per project (`MEMBER_ACT_ONLY`; `NO_SUCH_DETECTOR`; `NO_PROJECT`); a detector switched off for a project raises nothing for it. `detectors` answers every detector with its versions, origin, gate and per-project switch. *(not yet met: T33-34)*

**runDetectors({budgetMs, cursor?})** (the scheduler's consumer, registered by `scheduler`, T33-80)
- **R6** Runs each detector over the facts held, in slices within `budgetMs` on the one alarm, answering a cursor to resume; it is a computation, never a model run. Each run writes its results, keyed by (detector, version, subject, inputs), so a rerun over unchanged inputs writes nothing new. *(not yet met: T33-34)*
- **R7** A result carries its numerator, denominator and derivation with each input cited; a result with no denominator is never written. *(not yet met: T33-34)*

**recordGate({detectorId, version, goldSet, falseAlarmRate, by}), noticed({project, viewer, limit})**
- **R8** `recordGate` records a measured false-alarm rate for one detector version on a named gold set, with who and when; it refuses `NO_GOLD_SET` and a rate outside 0–1. *(not yet met: T33-34)*
- **R9** `noticed` answers, for a project, only the results of detector versions whose recorded rate is at most 20% (K1504) and that are switched on for it, each labelled as the machine's, "Noticed", with its derivation; every other result is withheld and not counted. Bounded 1–500 with `truncated`. *(not yet met: T33-34)*
- **R10** A result is never written on a person's or entity's row, never cited as a basis, never moves a grade or a finding, and no read answers it as a fact or as "conflict" (K1473, K1491). *(not yet met: T33-34)*

**The ops map**
- **R11** The module publishes `moneyChecksOps(checks, url, body)`, one route arm per act and read above; one append site, stamped by the control plane. *(not yet met: T33-34)*

## Private

### Uses

- `record-grammar`: `isHypothesisId` (R12).
- `calc-grammar`: recipes, comparison, exact decimals (R2, R4, R6).
- `record-core`: `transact`, `declareTable` (R6, R13).
- `membership`: `viewerPredicate`, projects (R5, R9, R13).
- `progressions`: the instance read (R1).
- `money`: facts, `summable`, `committedAgainstPaid`, the read contract (R1, R2, R6).
- `events`, `civil-time` (not in the plan's list): sequence and dates for payments past the term and payments before approval (R1). *(new edges; BOB's)*

### Invariants

- **R12** No `HYP-` id is an input, subject or parameter of a check or detector (K1467). *(not yet met: T33-34)*
- **R13** Sight: a result is answered only to a viewer who may see every input it cites; results inside a hidden project stay fenced and uncounted (K1489). The results table is declared through `record-core.declareTable` as derived-rebuildable from its detectors and inputs. *(not yet met: T33-34)*
- **R14** No result, label or text says "violation", "breach", "conflict", "suspicious" or ranks a person; a detector's output is a signal with its method, inputs and measured rate (K1473). No place is named in behaviour or defaults. *(not yet met: T33-34)*

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §5C.4 L3, §5C.5 L4 (detectors, K1491), §2 "Cross-cutting rulings" (machine checks), §10 (machine signals live in the hypothesis layer; a due threshold raises a question, never a violation; the machine never concludes; one home per fact).
- `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 (junction checks; progressions R32's source).
- Bob's rulings K1471, K1473, K1491; BOB's K1504 (the 20% gate).

### Suggestions

- Factory `moneyChecksOf(ctx)` (K61). Tables `money_detectors`, `money_detector_versions`, `money_detector_switches`, `money_detector_results`, `money_detector_gates`.
- Op names are BOB's (T33-88). The "Noticed" queue item is `notice-producers`' (T33-82), reading R9.
- Open (BOB's): (1) the ladders place amount-free junction checks (one response; payments past the term by date) in `progressions` (§5C.4, R-2 M-E6), while Choices 11 moves R32 whole here: R1 keeps all four clauses here; BOB to confirm or leave the amount-free two in `progressions`; (2) whether R1's junction results are member-declared (shown at once, as `progressions`' findings are) or machine-raised (gated by R9); proposed: shown, since the member declared the flow; (3) who may `recordGate` (proposed: an administrator, recording BOB's desk measurement); (4) the shipped detector list (split contracts under a threshold, change-order growth, payments before approval, vendor concentration as a named quantity) and their gold sets are owed by M-C8.
