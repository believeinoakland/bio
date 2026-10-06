# money-checks (T33)

**Status** · session_019trC8S5wM3AqjiTSTYewWk · depth 2 · WORKING · handled B3

## J1 · QUESTION

Seven points; I am building on each best reading now and stop only if an answer changes it.

1. **R1's wording.** K1521 says R1 keeps only the amount part of progressions R32 (re-worded before L5), but `money-checks.md` still lists all four clauses; progressions R32 already says the amount-free two stay there. Best reading: R1 = (a) a signed amount differing from the award, (b) amendments (change orders) past a stated share of the award. Its result is shown at once (member-declared flow, K1505 (8)), not gated by R9. Which stage holds the award and which the signed contract is a check parameter (`award_stage`, `signed_stage`, stage keys of the definition), and each side's amount is the money facts concerning the instance's entity whose `source` is an extent of a capture placed at that stage (progressions R34's read contract).
2. **Where R3's parameters live.** `amountChecks({contract, viewer})` takes none, so a stated share has to be held. Best reading: a new act `stateParameter({check, name, value, citation, contract?, by})` (a member's act; `citation` a held standard's id or the member's own word, recorded as theirs; contract-scoped beats group-wide; every statement kept, the latest governs), with a read `parameters({check, contract?})` and two op arms. No parameter → `undetermined: "no threshold stated"`.
3. **money's interface, which is not built yet.** I code against money's requirements through one adapter, tested with a stand-in in their shapes. Best readings: (i) R19's columns are `money_facts.fact_id, amount, currency, sign, kind, phase, stage, basis, period_from, period_to, from_entity, from_fund, to_entity, to_fund` and a withdrawn fact has a row in `money_withdrawals(fact_id)`; (ii) `concerns` is not in R19 but detectors per contract need it: I read `readFact`/`moneyOf` for it, and ask that R19 add the concerns table (`money_concerns(fact_id, concerns)`) to the read contract; (iii) `committedAgainstPaid` answers `{committed: {award: [facts], change_orders: [facts], sum}, paid: {facts, sum}, difference}`, each sum a figure or a refusal; (iv) `readFact` answers `source` with the capture sha of an extent. Please confirm or give the shapes MONEY is building.
4. **Detector shape (my technical choice unless you rule otherwise).** `population` = `{kinds?, phases?, stages?, bases?, currencies?, per: fact | contract | payee | payer}`; a `payee`/`payer` group whose party entity is a person is never a subject (skipped and counted, R10/R14). `condition` = a `bio-calc/1` recipe over the inputs `facts` (the subject's facts) and `population` (the whole population), plus figure parameters each stated with a citation; its output is a `compare` whose `a` is a `ratio` or `share`; a result is raised when the relation is `higher`, its numerator and denominator are that ratio's. `denominator` and `derivation` are the definition's stated words (refused when empty). Another shape is `BAD_RECIPE` with why.
5. **recordGate's actor:** an administrator only (`NOT_AN_ADMIN`), per the Suggestion.
6. **Switch default:** on until a member switches it off for a project (K1491 "switch one off per project").
7. **Shipped detectors and M-C8.** No gold set exists yet (`money-people.md` not written; K1506: no Oakland payment ledger). Best reading: I ship two detectors as data (change-order growth per contract; payee share of a population), each with no parameter stated, so they raise nothing until a member states one, and no gate recorded, so nothing is shown; M-C8's measurement is deferred to when a gold set exists.

Paths: `bio-plane/src/money-checks/`, tests `bio-plane/test/m/money-checks/`.

## J2 · COMPLETE

**T33-34 applied** (commit `9161c1f6e4` on `job/T33/money-checks`): the new module, R1–R14, every id met and named by a test, built on J1's readings (J1 is still open; an answer that changes one comes back as a CHANGE).

**For `modules.json` at the merge:**
- `paths` `bio-plane/src/money-checks/`
- `tests` `bio-plane/test/m/money-checks/`
- final `uses`: record-grammar, calc-grammar, record-core, membership, **entities**, progressions, money. `entities` is new: R4's `SUBJECT_IS_PERSON` and the person rule need an entity's kind, read through `readEntity` and `has`. `civil-time` and `events` are dropped: once R1 kept only the amount part (K1505 (8), K1521), nothing calls them.
- Files: `index.mjs` 805, `schema.mjs` 107, `checks.mjs` 46 lines; tests 737 lines in 5 files.

**What was built:**
- **R1** `junctionCheck` covers (a) the signed amount against the award and (b) amendments past a stated share. It is derived on read, answers at once with `shown: true`, and lists the facts and placements it read; placements the viewer cannot see are not read.
- **R2** `amountChecks`:
  - paid above committed, as `committedAgainstPaid` answers them;
  - signed amount against the award. My reading, beyond J1: the award as adopted (facts in phase `adopted` concerning the contract) against the commitment signed (`committed.award`);
  - change orders past a stated share.
  - A sum money refuses is answered as that refusal.
- **R3** A share or stage is held by `stateParameter` and read by `parameters` (J1 (2)). With none stated, the check answers `undetermined: "no threshold stated"`.
- **R4–R9**:
  - Detectors are versioned data, with the shapes in J1 (4).
  - Switches are per project and on by default.
  - `runDetectors({budgetMs, cursor})` works in slices and answers `{remaining, cursor}`. It is pure computation. A result is keyed by sha256 of (detector, version, subject, inputs), so an unchanged rerun writes nothing. Superseded versions and subjects that no longer raise lose their rows.
  - `recordGate` is an administrator's act (`NOT_AN_ADMIN`).
  - `noticed` shows only versions gated at ≤ 0.2 (`GATE_MAX`, K1504) and switched on; inputs the viewer cannot see are withheld and not counted; bounded 1–500 with `truncated`.
- **R11** `moneyChecksOps` has ten arms: `moneyamountchecks`, `moneyjunction`, `moneycheckparam`, `moneycheckparams`, `moneydetectordefine`, `moneydetectorswitch`, `moneydetectors`, `moneydetectorsrun`, `moneydetectorgate`, `moneynoticed`. Every write goes through one private append site. Op names are yours (T33-88).
- **R13** All seven tables are declared through `declareTable`. `money_detector_results` is derived-rebuildable and `rebuildAndCompare` answers `{same: true}`; first-written instants are kept apart in `money_detector_result_times`, so the results stay exactly rebuildable.
- Refusals carry `check: "money-checks R<n>"`; I minted no C-ids.

**Deferred, with why:**
1. **M-C8** (false-alarm rates on gold sets) is not run because no gold set exists (`money-people.md` is unwritten; K1506). Until one is measured and recorded, nothing is shown, as plan Rule 7 requires.
2. **Shipped detectors: one, not J1's two.** `md-shipped-payee-share` ships with its threshold unstated, so it raises nothing until a member states one in a new version. Change-order growth cannot be written over money's facts alone: which facts are change orders is known only through `events` (money R14), which a detector population cannot read. It is better as an amount check, and R2 already has one. The full list stays owed by M-C8 (Suggestions (4)).
3. **Tests use a stand-in for `money`**, which is unbuilt, in the shapes of J1 (3). When MONEY merges, the adapter (`#populationFacts`, `#committed`, `#factsOf`, `#captureOf`) and the stand-in follow its real shapes; that is a small change in one place.

**Found in other modules:**
- **money**:
  - R19's read contract does not name `concerns`, which per-contract detectors need; I read `money_concerns(fact_id, concerns)`.
  - R19's party and withdrawal columns are unnamed; I read `from_entity`, `from_fund`, `to_entity`, `to_fund` and `money_withdrawals`.
  - R14's answer shape (award and change orders apart) is unstated.
  - (J1 (3).)
- **money-checks.md** still carries R1's four clauses and the DRAFT header. K1521 said it would be re-worded before L5.
- **scheduler** (T33-80): `runDetectors` is due at every firing while it answers `remaining: true` with a cursor; otherwise once per local day (K1522). It has no wake of its own.
- **notice-producers** (T33-82): reads `noticed` items `{result_id, detector_id, version, label: "Noticed", kind: "signal", layer: "hypothesis", subject, numerator, denominator, derivation, inputs, at, gate}`.
- **No generated artifact is made stale.**

**Tests and checks:**
- `node --test bio-plane/test/m/money-checks/`: tests 30, pass 30, fail 0.
- Negative control: `GATE_MAX` raised to 0.3 made the R9 test fail; the file was restored.
- `build/manifest.md` names no layer tests.
- Checks were run with `modules.json` given these paths, tests and uses locally, uncommitted:
  - `format: 126 modules, 125 requirements files; 0 failures`
  - `architecture: 8 product files, 19 relative imports (0 naming no tracked file, not judged); 0 failures`
  - `coverage: 1 modules, 14 of 14 live requirement ids named by a test; 0 failures`
  - `ownership: 9 files changed by money-checks between tranche/T33 and HEAD; 0 failures`

Size (session_019trC8S5wM3AqjiTSTYewWk): test runs 7, module lines 958

## J3 · REPORT

B2 applied (K1563). I merged `tranche/T33` at e07becea; the reworded R1 is the one I built.

**Change** (commit `0a568472a2`):
- The junction check now takes a fact's capture from money R19's `source_capture_sha`, through the read contract, instead of calling `readFact`.
- The test stand-in's `money_facts` carries that column.

**Results:**
- Tests: 30 of 30 pass.
- Checks: format 0, architecture 0, coverage 14/14, ownership 9 files, 0 failures. As before, these ran against a local, uncommitted `modules.json` row.

**COMPLETE (J2) is premature under K1563 (1).** My tests still run against a stand-in for `money`, and the rule is to re-point them at the real module after it merges, before COMPLETE. I am waiting for your CHANGE after MONEY merges; I will then re-point the tests and post COMPLETE again.

**Correction to J2:** the module is 942 lines, not 958 (`index.mjs` 800, `schema.mjs` 104, `checks.mjs` 38).

J2's `paths`, `tests` and `uses` stand.
