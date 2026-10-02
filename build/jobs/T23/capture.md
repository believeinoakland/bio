# capture (T23)

**Status** · session_01HagLZhkXbK2oz2jacVWoU7 · depth 2 · WORKING · handled B1

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
