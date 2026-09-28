# capture (T8)

**Status** · session_012gK9YaHTpAXY7PQYP1hnbG · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · QUESTION

N166 needs a requirement to test against: capture's Provides states no read contract for `source_reachability` yet, and requirements are BOB's to write. My best reading, which I am building to now (a test at the interface, no code change: the table and `recordSourceOutcome` already hold it), is a new id beside R57, worded the same way:

> **R59** The table `source_reachability` (its `address_norm`, `consecutive_failures` and `first_failure_since` columns) is a stated read contract: a later module may read it in its own SQL (monitoring counts the rows at or over R43's floor, and lists them oldest failing run first), and this module changes none of those columns' names or meaning without a change to this requirement. `address_norm` is the normalised document address R8 records an attempt against, one row per address; `consecutive_failures` the failures the source produced (`source_refused`, `fetch_failed`) since its last `success`, never moved by a `governed` refusal; `first_failure_since` the whole-second UTC instant of the first failure of the current run, null when there is none. Every write to `source_reachability` stays this module's. *(N166, K206)*

Please add it (or your wording) to `build/requirements/capture.md`; I will name the id in the test. The alternative P4 offered, a service ("failing addresses at or over the floor") instead of a table contract, is not what the plan's entry says, so I am not building it unless you rule so.

## Completion

**Entries applied.**
- N80 (its share, K225 (4)): `acquireGradeNote` and `ACQUIRE_GRADE_NOTE` are capture's (`acquire.mjs`, re-exported from `capture/index.mjs`), composed from legacy-checks' `EARNED_CAPTURE_CEILING` and `UNREACHABLE_CAPTURE_GRADE`, throwing when either letter is absent. Every success answer of `acquire` (a filed capture and a continuation) carries `note`; no refusal does. `affordances.mjs` and `index.mjs` untouched: the op still assigns the identical value until layer 11 re-points it.
- N187: a test at capture's interface drives `op=navchanges`' `limit` (route and `op=links`): default 200 for none, a non-number, 0 or a negative; floored; clamped to 500; the newest `limit` observations, oldest first; `truncated`.
- N166: R59 (K235) tested: the columns, their meaning under every outcome, one row per address, and monitoring's two reads as its own SQL. No code change: the table already held it.

**Deferred.** Nothing.

**Found in other modules.** None new. Known and planned: `affordances.mjs` keeps its now-duplicate `acquireGradeNote` (drops it in layer 11); legacy-index's `acquire` handler still assigns `note` (re-pointed in layer 11). In capture's own requirements: R29 states no bound for `navChanges` (code: default 200, max 500, `truncated`, no `next`), unlike the reads N90 bounded; REPORT J2.

**Tests and checks.**
- `node --test bio-plane/test/m/capture/`: tests 59, pass 59, fail 0. Negative controls run on each new test (cap raised to 600; `note` removed; a governed refusal counted as a failure): each fails, restored green.
- Old battery touched by the note (not mine, checked for no change): `test/acquire.test.mjs` 1 pass; `test/m/affordances/catalogue.test.mjs` 22 pass; `test/hygiene.test.mjs` 1 fail, identical on the base without this change.
- format: 69 modules, 64 requirements files; 0 failures. architecture: 11 product files, 48 relative imports; 0 failures. coverage: 59 of 59 live requirement ids named by a test; 0 failures. ownership: 6 files changed by capture; legacy-store 0 added 0 removed; legacy-index 0 added 0 removed; 0 failures.

Size (session_012gK9YaHTpAXY7PQYP1hnbG): test runs 11, module lines 2858
