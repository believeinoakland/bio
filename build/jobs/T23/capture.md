# capture (T23)

**Status** · session_01HagLZhkXbK2oz2jacVWoU7 · depth 2 · COMPLETE · handled B2

## Completion (CAPTURE #15)

**Entries applied** (B1 START)
1. **R82** `heldCount({sweep})` (K1036, monitoring-r29): `bio-plane/src/capture/index.mjs`, beside the held-captures acts. It counts `bundles` rows at `object_type = 'information'` and `current_state = 'collected'` whose latest held act is not a set-aside (R79, R81; the same SQL as R77's list), and whose register document `data/provenance.json` (record-core's `files.content` read contract, its R37) has a `documents[]` entry whose `origin.matched_sweep` equals `sweep`. The whole store, no viewer. It writes nothing and never throws. An unknown sweep, a sweep that is not a non-empty string, or an absent argument answers 0. My reading of "not released": a released document has left `collected` (`ratification` R24 moves it to `verified`), so the state test answers that clause. No separate release mark exists to read.
2. **N499** (K1105, K1111): `inboxResolve` takes `at` and `within` and its `pulled` arm passes both to the pull. With `within`, the reason is recorded on the knock's row inside the pull's one act, beside its promotion. A `within` refusal or throw rolls back everything, the reason included. The `discarded` and `new` arms ignore both. The `inboxresolve` route now passes only `knockId`, `status`, `by` and `reason` from the body, so a caller's body cannot set the pull's instant. Before this, `inboxResolve(body)` would have forwarded a body's `at` once the arm took it.

**Deferred.** None.

**Found in other modules.** Also sent to BOB in a REPORT:
- Accepted red 9 is still red: `test/m/control-plane/inbox-door.test.mjs`:81 (control-plane R36). The door's resolve still calls `capture.pullKnock`, not `capture.inboxResolve` (`control-plane/pull.mjs`:121), so the reason never reaches the row. Capture's side is now in place: `inboxResolve({knockId, status: "pulled", by, reason, at, within})`. This is control-plane's L11 change (K1117).
- The plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale (a change under `bio-plane/src/capture/`). I regenerated nothing.
- For `monitoring` R60, a possible gap in R82's wording: "never throws" with a numeric answer means a store fault reads 0, which lets the hold run. A data limit too: a register document held as a blob (`files.content` NULL) cannot be read in SQL and is not counted. Doorbell-pulled and acquired register documents are inline today. A wording that answers null on a fault would fail closed. That is BOB's to decide.

**Tests and checks**
- `node --test bio-plane/test/m/capture/ bio-plane/test/cap13-reuse-pages.test.mjs bio-plane/test/d57selflink.test.mjs`: tests 118, pass 118, fail 0.
- New: three R82 tests (`held.test.mjs`) and one test naming R32 and N499 (`inbox.test.mjs`). With the source change stashed, all four failed (pass 17, fail 4).
- Users (`test/m/control-plane/`, `sources/`, `instance-setup/page.test.mjs`, `affordances/`, `monitoring/`, `extraction/`): tests 554, pass 552, fail 1 (accepted red 9, `inbox-door.test.mjs`:81).
- Whole `bio-plane/test/m`: tests 5025, pass 5012, fail 1 (accepted red 9 only), todo 12, skipped 0.
- `node checks/format.mjs`: 87 modules, 86 requirements files; 0 failures. `architecture.mjs … capture`: 23 product files, 93 relative imports; 0 failures. `coverage.mjs … capture`: 55 of 55 live requirement ids named by a test; 0 failures. `ownership.mjs … capture tranche/T23`: 4 files changed; 0 failures.
- Module lines: 3,446 (under 4,000).

Size (session_01HagLZhkXbK2oz2jacVWoU7): test runs 7, module lines 3446

## J1 · REPORT

Three things outside capture, after R82 and N499: (1) Accepted red 9 is still red: control-plane inbox-door.test.mjs:81 (R36). The door's resolve calls capture.pullKnock, not capture.inboxResolve (control-plane/pull.mjs:121), so no reason reaches the row. Capture's side is in place: inboxResolve({knockId, status: "pulled", by, reason, at, within}) records the reason inside the pull's one act. This is control-plane's L11 change (K1117). Whole test/m: 5025 tests, 5012 pass, 1 fail (this one), 12 todo. (2) bio-plane/dist/bio-plane.bundled.mjs is stale (a change under src/capture/). I regenerated nothing. (3) A possible gap in R82's wording, for monitoring R60: 'never throws' with a numeric answer means a store fault reads 0 (no backlog), which lets the hold run. Also, a register document held as a blob (files.content NULL) cannot be read in SQL and is not counted; acquired and pulled register documents are inline today. A wording that answers null on a fault would fail closed. Your call.

## J2 · COMPLETE

capture T23 complete. R82 heldCount({sweep}) is met with three requirement-named tests; N499 has a test naming R32. Both were checked by negative control (all four failed with the source change stashed). capture tests and the two legacy suites: 118/118. Users: only red 9 is red (see REPORT J-prior). format, architecture, coverage (55/55) and ownership checks: 0 failures. Module lines 3,446. The record's Completion section has the details.

## Completion after B2 · CHANGE (K1129)

- Merged `tranche/T23` (R82's new wording). `heldCount` now answers `null` (not known) when the store cannot be read, never 0, so the hold fails closed. An unknown sweep, or one that is not a non-empty string, still answers 0. A register document held only as a blob is not counted, as R82 now says.
- Test (`held.test.mjs`, "R82 (K1129)"): a dropped table answers null; a store whose `sql.exec` throws on read answers null, even for a sweep with nothing held; the same store, readable again, answers 3 (negative control).
- capture tests and the two legacy suites: tests 118, pass 118, fail 0. `test/m/monitoring/`: tests 86, pass 85, fail 0 (1 todo). format: 0 failures; architecture: 0 failures; coverage: 55 of 55, 0 failures; ownership: 0 failures. Module lines 3,448.

Size (session_01HagLZhkXbK2oz2jacVWoU7): test runs 9, module lines 3448
