# op-grades (T38)

**Status** · session_01J5DSe7QQUQDbseHcbcKr3x · depth 2 · COMPLETE · handled B1

## Completion

**Reading set** (mechanics §17): read whole, 280 KB as BOB's START measured it: `build/requirements/op-grades.md`; layer 11's contract and its split notes in `build/layers.md`; T38-14 and rules 1–9 in `build/plan/current.md`; `plan/draft-T38-L11.md` §0 and §1; K2300, K2318; every file under `bio-plane/src/op-grades/` and `bio-plane/test/m/op-grades/`. Uses: none (R19). Owner read for the grade: `case-carriage` R9, R12, R14 and its merged codes (`checks.mjs`: C-141.1 `MACHINE_CANNOT_MARK_PHOTO`, C-141.7 `MACHINE_CANNOT_WITHDRAW_MARK`, C-141.10 `WITHDRAW_NO_REASON`), as the draft asked: the draft's names stood at L8.

**Entries applied** (T38-14; N788; DEC-183 (2)):
- R28: a new `src/op-grades/t38.mjs` (the per-tranche file, as the draft noted): `T38_RUNGS` grades `obscuremarkwithdraw` `reasoned` (backing `WITHDRAW_NO_REASON`, which joins `JUSTIFICATION_REFUSALS` in `index.mjs`) and `obscuremark` `reversible`; `T38_NON_ACTS` gives `obscuremarkwithdraw` R28's sentence word for word. No absence is stated, no statement, weight, larger-screen entry, alias, vocabulary or `MACHINE_REFUSALS` entry added; both are phone acts by R18.
- R27 amended: `obscuremark` leaves `T37_RUNG_ABSENT`; its `NON_ACTS` reason (kept in `t37.mjs` beside its T37 ops) now reads "…; withdrawn only by a reasoned act, never erased (R28); moves no bundle"; `t37.mjs`'s header names `MACHINE_CANNOT_MARK_PHOTO` (K2311).
- `index.mjs` imports and spreads `t38.mjs` into `RUNGS` and `NON_ACTS`; its header comments name R28 and `./t38.mjs`.

**Deferred:** nothing in this module.

**Found in other modules** (each made red by this merge, by the grade R27/R28 now require; none is this module's to change; REPORT J1):
1. `affordances` `test/m/affordances/catalogue.test.mjs`:111 (its R2/R35/R37/R38 pin of `RUNGS` by rung): `obscuremarkwithdraw` now in `reasoned` and `obscuremark` in `reversible`, which the pin does not list.
2. `affordances` `catalogue.test.mjs`:485 (its R27 count), lines 505–508 and 514: `obscuremark` is pinned `undetermined` in `LATER` and in `undeterminedOf(T37_RUNG_ABSENT)`; T37's undetermined set is now `translationdraft`, `translationmark`.
3. `control-plane` `test/m/control-plane/totality.test.mjs`:20 (`affordances` R12 over the door's table): `obscuremarkwithdraw` reads `stale` until `op-declarations` T38-15 declares it (mutating); it should clear with T38-15's merge, no change needed.
Possible gap (not a red): `affordances` R19's backing drive should perform `obscuremarkwithdraw` without a reason at case-carriage's interface and see `WITHDRAW_NO_REASON`; no affordances test names it today. Baseline: the same three suites run with my change stashed on this branch showed 35 failing lines, after it 39; the difference is exactly items 1–3 (the rest are the plan's rule 6 reds, e.g. item 11's `plane.test.mjs` and item 15's `t37.test.mjs`:175).

**Tests and checks run:**
- `node --test bio-plane/test/m/op-grades/`: tests 37, pass 37, fail 0 (R27 re-pinned in `t37.test.mjs`; R28 in `t38.test.mjs`, two tests, each naming R28). No layer tests are named in `build/manifest.md`.
- `node checks/format.mjs`: 137 modules, 136 requirements files; 0 failures.
- `node checks/architecture.mjs … op-grades`: 11 product files, 18 relative imports; 0 failures.
- `node checks/coverage.mjs … op-grades`: 28 of 28 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … op-grades tranche/T38`: 6 files changed by op-grades; 0 failures.

Size (session_01J5DSe7QQUQDbseHcbcKr3x): test runs 7, module lines 2340

## J1 · REPORT

T38-14 makes three reds in other modules, each from the grade R27/R28 require (record, 'Found in other modules'): (1) affordances catalogue.test.mjs:111 pins RUNGS by rung without obscuremarkwithdraw (reasoned) and obscuremark (reversible); (2) affordances catalogue.test.mjs:485 (lines 505-508, 514) pins obscuremark undetermined in LATER and in undeterminedOf(T37_RUNG_ABSENT), now [translationdraft, translationmark]; (3) control-plane totality.test.mjs:20 reads obscuremarkwithdraw stale until op-declarations T38-15 declares it, clearing with that merge. (1) and (2) are affordances' to re-pin (AFFORDANCES #25, L11, after op-grades). Possible gap, not red: affordances R19's backing drive does not yet perform obscuremarkwithdraw without a reason (WITHDRAW_NO_REASON).

## J2 · COMPLETE

T38-14 done: R28 (t38.mjs: obscuremarkwithdraw reasoned on WITHDRAW_NO_REASON, joined to JUSTIFICATION_REFUSALS; obscuremark reversible) and R27 amended (obscuremark out of T37_RUNG_ABSENT, its reason naming the reasoned withdrawal; t37.mjs names MACHINE_CANNOT_MARK_PHOTO). op-grades tests 37/37; format, architecture, coverage (28/28), ownership: 0 failures. Three reds elsewhere: REPORT J1. Nothing deferred.
