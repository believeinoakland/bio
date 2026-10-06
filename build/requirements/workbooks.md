# workbooks — requirements

**Status** · New product module, layer 5, last, after `calculations` (plan Rules (2); K1504, Choices 10: the workbook path in its own module, P6). Plan entry T33-42 (C §(c) ANALYSIS L3; K1448), entered on GO with conditions (K1506). Reviewed (K1505); met by WORKBOOKS #1 in T33 (K1597).

**Size (P6).** About 1,500–2,200 lines with tests.

## Public

### Purpose

The second engine of the calculation: a member's own spreadsheet analysis held in the record. A member uploads an analysis workbook and binds its input cells, cell for cell, to captured sources. The instance recomputes the formulas with its own pinned engine and compares the results with the file's cached values: agreement between two engines, not accuracy. The workbook is linted for the usual spreadsheet defects and carries a method note and, optionally, a second member's check. A recipe calculation can also be exported to XLSX. A workbook the engine cannot recompute is recorded and disclosed as "not recomputed here". Nothing here is a gate.

### Provides

Terms. A **workbook** is a held capture of an `.xlsx` file, added to a project, keyed by its capture sha and project. An **input cell** is a cell holding a constant that a formula reads. A **binding** ties a rectangle of input cells to a source: a range of a declared table (`calculations`) or a cited figure (a content extent). The **viewer** and `by` are the control plane's stamps; a missing viewer fails closed. Every refusal is `{ok: false, reason, detail}`. `workbooksOf(ctx)` takes `ctx.recompute(captureSha)`, the plane's call to `sheet-worker`.

**addWorkbook({captureSha, question, period, project, by}), readWorkbook({captureSha, project, viewer})**
- **R1** `addWorkbook` refuses, in order: `NO_SHA`; `CAPTURE_NOT_HELD` (no such capture, or one the actor may not see, answered alike); `NOT_A_WORKBOOK` (`office-readers` gives no `cells` for it, with its reason, over the size guard included); `NO_QUESTION`; `NO_PERIOD`; `NO_PROJECT`. Otherwise the workbook is held with its question, period, project, the capture's origin as provenance states it, and its author. A repeat answers `already: true`.
- **R2** `readWorkbook` answers the workbook with its bindings (R3, R4), its inputs (R5), its latest recompute (R6–R8), its lint (R9), its method notes (R10), its checks (R11), its grade facts (R12) and the disclosure (R8). It never recomputes.

**bind({captureSha, project, range, input, by}), unbind({bindingId, reason, by}), inputsOf({captureSha, project, viewer})**
- **R3** `bind` refuses: `NO_SUCH_WORKBOOK`; `BAD_RANGE` (not one rectangle on one sheet of the workbook); `RANGE_HOLDS_FORMULAS` (an input is a constant, never a formula cell); `NO_SUCH_INPUT` (a table sha `calculations` does not hold, a range outside it, or an extent not held); `SHAPE_MISMATCH` (the range and the input differ in rows or columns). Otherwise it holds the binding with who and when. `unbind` refuses `NO_REASON`; an unbound binding stays, shown with who, when and why.
- **R4** Each bound cell is compared with its source cell for cell: numbers by exact decimal value (`calc-grammar`), text and booleans exactly. The binding answers `{agrees, compared, differing: [{cell, workbook_value, source_value}]}`. A differing binding is held and shown as differing, never corrected and never refused.
- **R5** `inputsOf` answers every input cell, each bound (naming its binding) or unbound. An unbound input is testimony, graded D (K1447 (ii)).

**recompute({captureSha, project, by})**
- **R6** It asks `ctx.recompute` for the workbook and pairs each recomputed formula cell with the cached value `office-readers` reads for it (its R30 `cached`): numbers agree within a relative 1e-9, text and booleans exactly. It records `{status, engine, engine_version, at, counts: {compared, agreed, differed, not_recomputed, volatile, cache_stale}, differing, not_recomputed}`, `status` one of `agrees`, `differs`, `partial` or `not recomputed here`.
- **R7** A cell the engine gives an error value is listed in `not_recomputed` with its `cause`, never counted as a disagreement. A volatile cell is listed and never compared. A cell whose cached value is an error while the engine gives a value is counted `cache_stale`, never a disagreement. A whole-workbook refusal (not enabled, engine absent, over a bound, external links, time limit, no binding to the engine, or no answer) records `status: "not recomputed here"` with the reason as given.
- **R8** Every answer that states a recompute calls it agreement between the file's engine and the instance's engine, never accuracy, and carries the disclosure "recomputed by the instance's engine (<engine> <version>); open it in any spreadsheet program", with the engine's measured agreement on the corpus (cells and workbooks whole, as `sheet-worker`'s job records it). Results are recomputed only by this act, never on a read.

**lint({captureSha, project, viewer}), explainLint({captureSha, project, finding, note, by})**
- **R9** `lint` answers each finding `{kind, cell, detail}`, `kind` one of: `short_range` (an aggregate's range stops short of, or starts after, the contiguous run of numbers in its column or row); `constant_in_formula` (a number written inside a formula); `hidden_input` (an input cell in a hidden row, column or sheet); `number_as_text` (an input whose stored type is text but whose text is a figure); `error_value` (a cached error value); `cross_foot` (a block whose row totals and column totals do not sum to the same grand total). Lint changes nothing and blocks nothing. `explainLint` holds a member's note against a finding (`NO_NOTE` when blank), kept and never erased.

**recordMethodNote({captureSha, project, purpose, sources, steps, limitations, by})**
- **R10** Each field is required (`NO_PURPOSE`, `NO_SOURCES`, `NO_STEPS`, `NO_LIMITATIONS`), the documentation an audit's data-reliability test asks for. A new note supersedes the last, and every note is kept with who and when.

**recordCheck({captureSha, project, outcome, note, by})**
- **R11** A second member's check: refused `SELF_CHECK` when `by` is the workbook's author, and `UNKNOWN_OUTCOME` outside `agrees`, `disagrees`, `could_not_check`. It is disclosed on every read with who and when. Nothing refuses, waits or warns for want of one (K1448).

**Grade facts and sight**
- **R12** `readWorkbook` answers grade facts on the terms of K1447 (ii): each bound input's capture grade, capped by its derivation; each unbound input D; each formula result carrying the derivation step "third-party engine" at `undetermined`, whatever the recompute found; the method disclosed, not graded. `strength` reads them.
- **R13** A workbook whose capture, or any bound source, the viewer may not see is withheld whole: every read answers it exactly as an absent one (DEC-36, DEC-85).

**exportRecipe({calcId, viewer}) → XLSX bytes**
- **R14** For a calculation the viewer may see (else `found: false`), it answers a workbook that opens in any spreadsheet program: one sheet per input table (its canonical values as typed cells); a results sheet; a method sheet naming the question, period, recipe, method version, result key and each input's sha256. Each result of a `count`, `sum`, `difference`, `ratio` or `share` step is written as a formula over the input sheets whose cached value is the stored result; any other step's result is written as a value labelled "computed by bio-calc/1". Recomputing the exported file gives the stored results.

**The ops map**
- **R15** The module publishes `workbooksOps(workbooks, url, body)`, one route arm per act and read above; one append site, stamped by the control plane.

## Private

### Uses

- `calculations`: `readTable` (R3, R4, R14), `read` (R14), the grade facts of a table's source (R12).
- `calc-grammar`: `parseFigure` and exact decimal comparison (R4), `resultKey` (R14).
- `office-readers`: typed cells with formula and cached value (R30), hidden rows, columns and sheets and external references (R9, R10), `sheet-cell` references (R17).
- `record-core`: `transact`, `declareTable`. `membership`: `viewerPredicate`. `provenance`, `content`: whether a capture is held, its origin, its bytes' reading, and an extent's visibility (R1, R3, R13). *(edges beyond the plan's list; see the report)*

### Invariants

- **R16** Not a gate: no act of any module is refused, delayed or warned because a workbook was not recomputed, differed, has lint findings or lacks a second check. The publication rule that refuses only an undisclosed differing or unbound load-bearing calculation (K1448; DEC-76.4) is `publication`'s, reading R2.
- **R17** No macro is run, no external link is followed and no formula is evaluated in this module; the only computation is `sheet-worker`'s and `calc-grammar`'s. No number is stored but the file's cells, the engine's results and the sources' values.
- **R18** No place is named in behaviour, defaults or outward text. Tables (workbooks, bindings, recomputes, lint notes, method notes, checks) are declared through `record-core.declareTable`, export `yes`, keyed to their project for purge.

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §8.2 D2, C4, E1; §8.3 L3; §8.4 L3 (the workbook path: bind cell for cell; recompute as agreement between two engines, D110; volatile functions flagged, macros never run, external links refused; the lint list; a method note against the GAGAS test; a second member's check, disclosed, never a gate; export from recipe to XLSX; "not recomputed here"); §2 ANALYSIS.
- Plan T33, "Measured GO (K1506)" and entry T33-42; rulings K1447 (ii), K1448, K1506; DEC-36, DEC-85, DEC-112.

### Suggestions

- **Identity.** A workbook is keyed by its capture sha and project, as `calculations` keys a table by its sha; there is no new id prefix. Whether a workbook should also be a `CALC-` (one construct, two engines) needs `calculations` to accept a second engine, which its draft rules out. BOB's.
- **R12 and the engine's measure.** K1447 (ii) keeps a third-party engine's value `undetermined` "until measured". The corpus measure reads 98.9% of cells and 71% of workbooks whole. Whether that counts as measured, and so lifts R12's `undetermined`, is BOB's.
- **The engine call.** The plane wires `ctx.recompute` to the `SHEET_WORKER` binding, as it does for `ocr-worker`. With no binding, R7 records "not recomputed here: no engine bound".
- **Export.** Writing XLSX needs a small writer. `ooxml` reads containers only, so the writer is this module's own, or a later `ooxml` service (BOB's). R14's test can recompute the export through `sheet-worker`'s test build.
- Tests: a binding that differs by one cent (R4); an unbound input graded D (R5, R12); each R7 case from the corpus fixtures; each lint kind with a negative control; a self-check refused (R11); a hidden bound source (R13); an act elsewhere passing with no check and a differing recompute (R16).
