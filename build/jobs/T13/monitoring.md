# monitoring (T13)

**Status** · session_012PquHVC9k9aMw1YH8G1kq4 · depth 2 · WORKING · handled B0

## Completion

**Applied** (on `tranche/T13` at c15f79e658): **N324**, R30 as K408 words it.
- `pause()` refuses a stamped caller who is not an administrator through `membership.notAnAdmin(by, MONITOR_PAUSE_ACT)` (its R84). Monitoring no longer mints `NOT_AN_ADMIN` itself and no longer reads C-96.1 from the catalogue's `CUSTODIAL_CHECKS`: that import is gone from `src/monitoring/index.mjs`.
- `MONITOR_PAUSE_ACT` ("pausing or resuming the monitoring daemon") is the fixed act phrase. It is exported so the test can compare against membership's answer.
- Who is admitted is unchanged: membership R64's `isAdministrator`, or the root of trust `MONITOR_ROOT_OF_TRUST` (`class:admin`). The refusal is still asked after the missing-`by` refusal and before the request's shape, and it writes nothing.
- `membership` is already in monitoring's `uses`, so no new edge.

**Tests** (`bio-plane/test/m/monitoring/ticks.test.mjs`, R30's N314 test, renamed to N314, N324): each refusal (`ann`, `nobody`, `class:daemon`, `class:member`, a revoked administrator, `admin` on an unclaimed instance) is asserted `deepEqual` to `notAnAdmin(by, MONITOR_PAUSE_ACT)`. It is also checked against R84's shape, with `check` and `translation` taken from `MEMBERSHIP_CHECKS.NOT_AN_ADMIN` (C-96.1), not the catalogue. Negative control: this test on the old source, with only the constant added, fails 1 of 1.

**Please strike** (the code meets these marks; `build/requirements/` is outside my paths, and the ownership check refused my first attempt to strike them, so I reverted that):
- R30's `*(not yet met: N324)*`, and in the Status line "R30 answers through `membership.notAnAdmin`, not yet met."
- R44's `*(not yet met: N65, with R34)*`, and in the Status line "R44, not yet met" (N63/N65). It is met: `deadlineRecheck` reads through `actions.pendingClocks` and moves only pending to overdue. It leaves met, waived and overdue entries alone and adds, removes or re-dates nothing. The test `understanding.test.mjs` "R44 …" covers each clause over the real actions module, including its R33 bound refusing a tampered move. R34's own mark stays: members are not yet told (its `test.todo`).
- Uses' `capture` line, `*(not yet met: N166)*`. Capture R59 (K235) states `source_reachability` (`address_norm`, `consecutive_failures`, `first_failure_since`) as a table read contract and names exactly monitoring's two reads. Those are the count at or over the floor (`archivePending`) and the list oldest failing run first (`archiveTick`), and that is all monitoring reads. **Wording to settle:** the same line still says "through the read contract … never by the table's name". Under K235 the contract *is* the table read by name, so that clause contradicts R59. I suggest cutting ", never by the table's name".

**Check rows:** none added, moved or retired. C-96.1 is membership's row. One mint site of `NOT_AN_ADMIN` is retired (monitoring's `pause`), which changes no row. There is nothing for promotion to stamp (N318).

**Deferred:** nothing.

**Found in other modules** (sent to BOB as a REPORT):
1. **DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`, legacy-tests'): 15 failures against 14 on the parent (`origin/tranche/T13`). Every other line is identical, floors included. The one new failure is arm G: "NOT_AN_ADMIN is declared in MULTI_SITE_CLOSED but is not multi-site on this tree". That is N324's intended effect: the code now has one mint site, membership's `notAnAdmin`. The declaration and the K403 notes are now stale: line 638 calls monitoring's `pause` "a NEW MINT SITE of NOT_AN_ADMIN", and line 1468 says "NOT_AN_ADMIN's closure gains monitoring's `pause`". This is for legacy-tests (the plan's "arm G").
2. **civicos-ui and affordances' lists:** besides item 1, `affordances.mjs`:862 and :2222 describe `monitorpause` as refused `NOT_AN_ADMIN`. That is still true, so there is nothing to change. `civicos-ui/test/plane-refusal-wire.mjs`:173 lists `monitoring/index.mjs` as a call site for its own walk, which this change does not touch.
3. **Stale, not rebuilt (§14):** `bio-plane/dist/bio-plane.bundled.mjs` (`bio-plane.bundle.json` names `src/monitoring/index.mjs`). No worker bundle takes monitoring.

**Tests and checks run**
- `node --test bio-plane/test/m/monitoring/`: tests 58, pass 52, fail 0, todo 6 (R17, R18, R28, R29, R31, R34's telling, all unchanged).
- `node civicos-ui/check-refusal-codes.mjs`: 15 failures against the parent's 14. The difference is item 1.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … monitoring`: 12 product files, 59 relative imports; 0 failures.
- `node checks/coverage.mjs … monitoring`: 45 of 45 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … monitoring tranche/T13`: legacy-store, legacy-index and legacy-checks 0/0; 0 failures. Run before this record was written, so it counted 3 files changed.

Size (session_012PquHVC9k9aMw1YH8G1kq4): test runs 3, module lines 2330

## J1 · REPORT

Found in other modules (full list in my record's Completion): (1) DEC-49 guard (civicos-ui/check-refusal-codes.mjs, legacy-tests'): 15 failures vs the parent's 14; the one new failure is arm G, 'NOT_AN_ADMIN is declared in MULTI_SITE_CLOSED but is not multi-site on this tree'. That is N324's intended effect (one mint site, membership's notAnAdmin). The declaration and the K403 notes at lines 638 and 1468 are stale, for legacy-tests' arm G. (2) affordances.mjs:862 and :2222 on monitorpause are still accurate; nothing to change. (3) Stale, not rebuilt: bio-plane/dist/bio-plane.bundled.mjs (takes src/monitoring/index.mjs). (4) Marks for you to strike: R30 (N324), R44 (N65) and Uses' capture line (N166), all met. The ownership check refused my striking them in build/requirements/, so I reverted. Wording: the Uses capture line's 'never by the table's name' contradicts capture R59/K235, which make the table itself the read contract. I suggest cutting that clause.
