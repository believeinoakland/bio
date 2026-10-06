# workbooks (T33)

**Status** · session_01L8fgt74g2hidcVrkrDDCCZ · depth 2 · WAITING ON BOB (J2) · handled B3

## J1 · QUESTION

The answer shapes of `calculations.readTable` and `calculations.read`, which workbooks R3, R4, R12 and R14 read. calculations R1–R10 do not fix them, and its job codes in parallel. My best reading, which I build and test against (with a stand-in calculations) unless you say otherwise:
(1) `readTable({sha, viewer})` → `{ok: true, found: true, table: {sha, fields: [{name, type, unit?, currency?}], rows: [{<field>: <canonical value string>}], grade_facts: {capture_grade, derivation, grade}}}` (calc-grammar's table shape plus the source's grade facts for R12); an absent or withheld table → `{found: false}` (R10's "exactly as an absent one").
(2) `read({calcId, viewer})` → `{ok: true, found: true, calculation: {calc_id, question, period, recipe, method_version, result_key, inputs: [{name, kind: "table", sha} | {name, kind: "figure", figure, content_id?}], results: {<step name>: <calc-grammar value>}}}`, `results` holding at least the output step; absent or withheld → `{found: false}`.
Workbooks reads them through one adapter, so a different shape costs one function. Please confirm, or name the shape the CALCULATIONS job holds, and forward this to that job if it should conform.

## Progress (WORKBOOKS #1, 2026-10-06)

**Built, on `job/T33/workbooks` @ 5deeb90fb3 (merged with `tranche/T33` after).** T33-42: all 18 ids (R1–R18) coded and tested against a stand-in `calculations` holding J1's shapes (confirmed, K1563 (6)). **Paths for `modules.json`:** `paths: ["bio-plane/src/workbooks/"]`, `tests: ["bio-plane/test/m/workbooks/"]`. **Final `uses`** (each imported or injected): `record-grammar` (canonical JSON, sha256 for the export's method sheet), `calc-grammar` (figures, exact decimals, `evaluate` for the export's per-step values, `divide` for the tie test), `office-readers` (`xlsxEntry.text`/`structure`, `a1Corner`, `rangeUnitFor`), `sheet-worker` (`ENGINE_NAME`/`ENGINE_VERSION` from `contract.mjs` for R8's measure; its test helpers drive the real engine in my tests), `record-core`, `membership`, `promotion` (tests only), `provenance` and `content` (injected: capture held, home, origin, grade; extent sight, text), `calculations` (injected: `readTable`, `read`).

**Waiting on.** K1563 (1): my tests re-point from the stand-in to the real `calculations` after CALCULATIONS merges, before my COMPLETE. Nothing else in my module is open.

**Choices made on my reading (BOB's to overrule).**
- Refusals beyond the requirement's lists: `unbind` answers `NO_SUCH_BINDING` for an unknown or withheld binding; `explainLint` answers `NO_SUCH_FINDING` for a `{kind, cell}` lint does not give. A workbook absent or withheld is `NO_SUCH_WORKBOOK` on every read and act (R13).
- A binding's input is `{table: <sha>, range: "A1:B3"}` (A the table's first field, row 1 its first data row) or `{extent: <content id>}` (one figure, 1×1). A bind's range is `Sheet!A1:B2`, the sheet matched as office-readers R27 matches it.
- R6: a formula cell whose file caches no value is counted `cache_stale` (with that reason), never compared; status is `differs` on any disagreement, else `partial` when anything was not compared, else `agrees`. Each recorded list keeps 2,000 cells; counts are always whole and a cut list says how many it left.
- R8: the measure is sheet-worker's recorded figure (98.85% of 200,551 cells, 81 of 111 workbooks whole; within the bounds 97.96%, 73 of 99), stated only for the engine build it was taken on (`ENGINE_VERSION`); another build answers "not measured".
- R12 keeps `undetermined` for every formula result (K1511).
- R14: a count, sum, share or difference whose formula a spreadsheet would not compute as `bio-calc/1` does is written as a labelled value: a condition on a date, a text match a case-blind COUNTIFS would widen (`Acme` beside `acme`), a literal that reads as a number in a text field, a numeric column holding an approximate figure as text, a half-way tie under rounding, more than 16 `in` combinations. Formulas use COUNTIFS/SUMIFS/ROWS/SUM and ROUND/ROUNDDOWN/ROUNDUP; recomputed by the real engine, each gives the stored result (tested).
- The ops (R15): `workbookadd`, `workbook`, `workbookbind`, `workbookunbind`, `workbookinputs`, `workbookrecompute`, `workbooklint`, `workbooklintexplain`, `workbookmethodnote`, `workbooksecondcheck` (not `workbookcheck`, which names the deferred L5 proposal, T33-D6), `workbookexport` (bytes as base64).

**Found in other modules (also in my REPORT).**
- `plane` / `control-plane` / `op-declarations` / `affordances` (L11): the plane wires `ctx.recompute` to the `SHEET_WORKER` binding and constructs `workbooksOf(host, {provenance, content, calculations})`; control-plane spreads `workbooksOps`; op-declarations and affordances (its R40, K1522) take the 11 ops. I bind nothing in the plane, so the K1531 finding (instance-setup's `FLEET_BINDINGS`, control-plane's `members-pin.test.mjs`, bundler's `deploybindings.test.mjs`) falls to the job that first binds `SHEET_WORKER` (installer T33-91, or plane).
- `publication` (K1448, R16): reads `readWorkbook`'s `recompute.status`, `bindings[].agrees` and `inputs[].bound` to find an undisclosed differing or unbound load-bearing workbook.
- No generated artifact is staled: nothing that bundles reaches `workbooks` yet.

**Tests and checks run (on the stand-in).** `node --test bio-plane/test/m/workbooks/`: 26 pass, 0 fail (the real sheet-worker engine over its corpus fixtures for R6–R8 and R14). `format` 0 failures; with my paths filled in locally (not committed): `architecture` 15 product files, 0 failures; `coverage` 18 of 18 ids named, 0 failures; `ownership` 0 failures. No layer tests are named in `build/manifest.md`.

## J2 · REPORT

Built and tested on a stand-in calculations holding J1's shapes: all 18 ids (R1–R18), 26 tests pass (the real sheet-worker engine for R6–R8 and R14); format, architecture, coverage 18/18 and ownership 0 failures with my paths filled locally. Paths: bio-plane/src/workbooks/, tests bio-plane/test/m/workbooks/. Per K1563 (1) I re-point my tests at the real calculations after CALCULATIONS merges, then post COMPLETE; please send a CHANGE when it has. Found in other modules (record's Progress): plane/control-plane/op-declarations/affordances take my 11 ops and wire ctx.recompute to SHEET_WORKER (I bind nothing in the plane, so K1531's three test pins fall to whichever job first binds it); publication reads readWorkbook for an undisclosed differing or unbound workbook (K1448). Choices on my reading, including two refusals beyond the lists (NO_SUCH_BINDING, NO_SUCH_FINDING) and the op name workbooksecondcheck (workbookcheck names T33-D6), are in my record.

## Completion (WORKBOOKS #1, 2026-10-06)

**Entry applied.** T33-42: the new module `workbooks` (layer 5), all 18 ids (R1–R18) met and tested against the real `calculations` (merged, K1595; re-pointed per K1563 (1)). **Paths for `modules.json`:** `paths: ["bio-plane/src/workbooks/"]`, `tests: ["bio-plane/test/m/workbooks/"]`. **Final `uses`:** `record-grammar`, `calc-grammar`, `office-readers`, `sheet-worker`, `record-core`, `membership`, `promotion` (tests), `provenance`, `content`, `calculations` (each as in my Progress section above).

**Changed since Progress.** `calculations.readTable` and `read` are async in the real module, so every read and act of `workbooks` that may reach a bound table is now async (`bind`, `unbind`, `inputsOf`, `lint`, `explainLint`, `recordMethodNote`, `recordCheck`, `readWorkbook`, `exportRecipe`; `addWorkbook` and `recompute` already were). The ops arms answer promises, as the control plane awaits. The fixture now declares tables and creates calculations through the real module over captured CSVs held in an in-memory evidence store, and reads capture bytes through the record's evidence store (the default `bytesOf`). R12's test reads a real table's grade facts: its source fetched directly (B) and read under a chain capped at C, so its bound inputs grade C.

**Deferred.** Nothing in my own module. The choices made on my reading are those in my Progress section.

**Found in other modules.** As in my Progress section and J2: the L11 wiring (plane, control-plane, op-declarations, affordances R40) and the `SHEET_WORKER` binding with K1531's three pins; `publication`'s read of R2 (K1448). No generated artifact staled.

**Tests and checks run.** `node --test bio-plane/test/m/workbooks/`: 26 tests, 26 pass, 0 fail (real calculations, real sheet-worker engine). No layer tests are named in `build/manifest.md`. From the process repository, with my paths filled in `modules.json` locally (not committed): `format` 126 modules, 0 failures; `architecture` 15 product files, 48 relative imports, 0 failures; `coverage` 18 of 18 live ids named by a test, 0 failures; `ownership` 16 files changed between `tranche/T33` and HEAD, 0 failures.

Size (session_01L8fgt74g2hidcVrkrDDCCZ): test runs 34, module lines 1,588 (plus 1,196 test lines)
