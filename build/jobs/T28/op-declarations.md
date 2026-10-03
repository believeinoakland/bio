# op-declarations (T28)

**Status** · session_016KFczMmF55nqNMETV7tFqA · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied** (`plan/current.md` L11; R14, N520, N522; K1313):
- `OPS`: `caseimport`, `caseimportdocument`, `importaccept`, `importacceptwithdraw`, `importflag`, `importflagclear` (mutating) and `importedcases`, `importedcase` (reads), each `classes: ["admin", "member"]`, `machineClasses: []` (docket's shape); `casechecker`, `casefilespec` `classes: null`, not mutating.
- Lists (one per stamp, the docket's shape): `CASE_IMPORT_ACTIONS` and `CASE_IMPORT_READS` (`viewer`), `CASE_IMPORT_BY` (`by`; the six acts), `CASE_CHECKER_PUBLIC_READS` (nothing stamped). All exported.
- `SESSION_OPS.member` and `.admin`: the eight case-import ops; the two public reads in neither.
- `NEEDS`: `contribute` for the six acts; present `null` for the two reads and the two public reads (affordances R35).
- `publish` and `publishpreflight` unchanged: `flagsDisclosed` is a body field, named by no table (tested).

**Deferred:** none.

**Found in other modules / for BOB:**
- `control-plane` (R49, its L11 job): to stamp R14's ops it must read `CASE_IMPORT_BY` (`by`, the positional identity, as `DOCKET_BY`) and add `CASE_IMPORT_ACTIONS`/`CASE_IMPORT_READS` to its `viewer` stamp (beside `DOCKET_ACTIONS`/`DOCKET_READS`, control-plane `index.mjs` ~1350). case-import's map reads `by` (else `author`) and `viewer` from the query.
- `control-plane` `totality.test.mjs` R2/R41 (affordances R12 over the door's table) is red on this branch for the eight case-import ops **and** `casechecker`, `casefilespec`: accepted red 4 (which names only the eight); it clears when affordances' L11 merge publishes R35. Its other two reds (R22, R43) are accepted red 6, unchanged by this job.
- `build/requirements/op-declarations.md`: R14 ends with a stray duplicate paragraph "R6 holds over them." after its `*(not yet met: T28)*` mark; and Uses lists `affordances` and `case-import` but not `link-sweep`, which `modules.json` has. Wording only, BOB's.

**Catalogue rows added:** none (this module has no check table), so nothing reads `awaiting stamp`.

**Tests and checks:**
- `node --test bio-plane/test/m/op-declarations/`: 49 pass, 0 fail (new `t28.test.mjs`, 6 tests naming R14; `tables.test.mjs` R2's public list gains the two public reads).
- Users (P10), before → after: admission 19/0 → 19/0; plane 65/0 → 65/0; `migrate-released` 1/0 → 1/0; affordances 153/0 → 153/0; control-plane 137 pass 2 fail → 136 pass 3 fail (the one new red is accepted red 4, above).
- `checks/format.mjs`: 0 failures (95 modules). `checks/architecture.mjs`: 0 failures. `checks/coverage.mjs`: 14 of 14 live ids named; 0 failures. `checks/ownership.mjs … tranche/T28`: 0 failures.

**Size:** `index.mjs` 2,604 lines (was 2,553).

Size (session_016KFczMmF55nqNMETV7tFqA): test runs 4, module lines 2604
