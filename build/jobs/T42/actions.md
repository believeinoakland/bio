# actions (T42)

**Status** · session_01YWts36gHnAjf1TsTwr49NV · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied** · T42-25 (N826): R55's litigation-hold reader registers with `doorbell` (`doorbellOf(host)`, `registerReader("litigation-hold", "actions", …)`, doorbell R3), no longer `capture` (`actions/index.mjs` header, import, `holdInPlace`'s doc, `actionsOf`; the dep is `deps.doorbell`, `null` registers none). Doorbell takes no `env` (its R25); capture adopts the plane's when the plane builds it (capture R58), so actions no longer hands capture an `env`. `actions/t22.test.mjs` re-pointed (7, 28, 40–104: every site), and `t34.test.mjs`:212 `capture: null` → `doorbell: null`. R55 tested at the interface through doorbell's own `mayClearDiscarded`, with negative controls (a world built with `doorbell: null` leaves doorbell with no reader, answering fail-closed; all four R55 tests fail on the old code, checked).

**Improvement in my module** · R60's whole-store arm (`purgeHeld()` with no bundle) now answers through `holdInPlace()`, R55's reader, which R60 says it equals; they were two separate queries (found by my reading worker). New test `R55 R60 …` pins the equality in every hold state and when the holds cannot be read.

**Uses edge** · `modules.json`: actions' `uses` `capture` → `doorbell`, for BOB to edit before the ownership check (the architecture check fails on it until then, below). No test or source of actions imports `capture` any longer.

**Found in other modules (REPORT)** · `doorbell` R25 / `capture` R87: `doorbellOf` calls `capture.declareTables()`, which declares capture's purge tables (`CAPTURE_PURGED_TABLES`, e.g. `task_queue`) to record-core without creating them (`declareTables` is not `migrate`). On a host whose capture was never migrated, record-core's whole-store purge then fails `no such table: task_queue`. Before T42-25, `captureOf(host)` only constructed capture, declaring nothing; now `actionsOf` builds doorbell, so users' bare fixtures turn red:
- `action-clocks` `test/m/action-clocks/overdue.test.mjs`:151 (`w.record.purge({})`), test "R9 every read answers…";
- `action-plans` `test/m/action-plans/invariants.test.mjs`:50 (`w.record.purge()`), test "R27: no act rewrites…".
Both pass on `tranche/T42` without this change. In the plane, capture migrates (`plane/store.mjs`:470), and `plane` passes. Proposed fix (doorbell's or capture's job, not mine): capture's `declareTables` declares only tables it has created (or `doorbellOf` asks `capture.migrate()`), or record-core's purge skips a declared table that does not exist.

**Reading set (K2304)** · Read whole myself: `requirements/actions.md`; doorbell's public part and R3, R25 (`requirements/doorbell.md`); `capture-split.md` rows for actions (44, 83, 230, 245, 287); the plan entry T42-25 and K2607, K2642; the code my entry changes (`actions/index.mjs` 1–60, 1754–1870, 2700–2720, 3130–3240), `t22.test.mjs` whole, `doorbell/index.mjs` 60–230, `captureOf`. The rest of actions' code and tests (`index.mjs`, `schema.mjs`, every test but t22) read in full by one worker, summary about 3.4 KB with file:line citations.

**Tests**
- actions `bio-plane/test/m/actions/`: tests 111, pass 111, fail 0.
- users (P11): action-clocks 54/1 (red above); filings 70/0; escalation 63/0; action-plans 62/1 (red above); monitoring 124/0; affordances 232/0; machinery-producers 24/0; queue-producers 84/0; queue (+ conclude-project, docdates) 138/0; op-declarations 128/0; control-plane 216/0; plane (+ migrate-released) 167/0 (re-run on the final head).
- layer tests: none named in `manifest.md`.

**Checks**
- `format`: 147 modules, 146 requirements files; 0 failures.
- `architecture actions`: 2 failures, both "imports doorbell, which actions does not declare in uses" (the edge above, BOB's edit).
- `coverage actions`: 61 of 61 live requirement ids named by a test; 0 failures.
- `ownership actions tranche/T42`: 4 files changed; 0 failures.

Size (session_01YWts36gHnAjf1TsTwr49NV): test runs 9, module lines 3549

## J1 · REPORT

doorbell R25 / capture R87: doorbellOf calls capture.declareTables(), which declares capture's purge tables (CAPTURE_PURGED_TABLES, e.g. task_queue) without creating them; a host whose capture never migrated then fails record-core's whole-store purge 'no such table: task_queue'. Now that actionsOf builds doorbell (T42-25), users' bare fixtures go red: action-clocks test/m/action-clocks/overdue.test.mjs:151 and action-plans test/m/action-plans/invariants.test.mjs:50 (both green on tranche/T42 without my change; plane passes, capture migrates there). Proposed fix (doorbell's or capture's, not mine): declareTables declares only tables created (or doorbellOf asks capture.migrate()), or record-core's purge skips a declared table that does not exist. Details in my record.

## J2 · COMPLETE

T42-25 applied: R55's reader registers with doorbell (doorbellOf(host), registerReader litigation-hold), deps.capture -> deps.doorbell; t22 re-pointed (every site), t34:212; negative controls. Also R60's whole-store purgeHeld now answers through holdInPlace (R55), with a test. modules.json edge for BOB: actions uses capture -> doorbell (architecture's only 2 failures until then). actions 111/0; coverage 61/61; format, ownership 0 failures. Users: 10 suites green; 2 reds from the REPORT just posted (action-clocks overdue.test.mjs:151, action-plans invariants.test.mjs:50). Record: build/jobs/T42/actions.md.
