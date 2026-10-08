# notice-producers (T37)

**Status** · session_01NtKgWhTs8dgUsdu2kZ9cnc · depth 2 · COMPLETE · handled B1

## Record

**Read, whole** (the set measured under 300 KB: own requirements 17 KB, code 55 KB, tests 96 KB, the used modules' Purposes 8 KB and the services my Uses names, about 60 KB): `build/requirements/notice-producers.md`; layer 11's row of `build/layers.md`; plan entry T37-28; K2130, K2155, K2160, K2175 and the K2175 draft's item 3 (`plan/draft-T37-L2-L3-reqs.md`:159, :169); the Purpose and named services of each module in my Uses (`file-safety` R8, R15–R19, R27, R29, R31, R38 and its `scanFindings` code; `provenance` `homeOf`; `following` R16, R21; `credentials` R44, R45; `standards` R1, R5; `membership` R65, R68, R74, R86; `people` R23–R25; `money-checks` R6, R9, R10; `answers` R19, R20; `duties` R7, R9–R11, R20; `inquiry` R54–R57; `civil-time` R17, R19); `index.mjs` whole; the tests R14 changes (`files.test.mjs`, `fixture.mjs`) whole, and `read.test.mjs`'s facts assertion. No worker summary was needed.

**Entries applied** (T37-28; N762, N771; K2175): R14 reads `file-safety.scanFindings({since, after, limit, viewer})` with `since` the instant 90 days before the call (`SCAN_FINDINGS_DAYS`, as R13's window), from the first page, following `cursor` while `truncated`, to at most 1,000 findings in pages of 200; each read starts again from `since`, never from a kept cursor; a `since_invalid` answer is a failure named in `facts.failed`. An item leaves when `scanFindings` answers its note `held: false` (an absent `held` is read as held). `facts.scan_found` now also names `days` (90), as R13's does. The header comments (R14's block; the constant at :77) follow. The T36 `test.todo` is replaced by tests; the T36 test "leaves only on disposal, whatever becomes of the hold" now states the T37 rule.

**Open:** J1 (R14's "an item whose finding has left the window stays until disposed of" cannot be met by a producer that writes nothing while `queue` keeps no items; built on reading (a): past the window the item is no longer answered). R14's two T37 marks are BOB's to strike once J1 is answered.

**Deferred:** none in this module.

**Found in another module:** none beyond J1 (R13 has the same window gap, unstated; `queue` keeps no item).

**Tests and checks:** `node --test bio-plane/test/m/notice-producers/`: tests 74, pass 74, fail 0, todo 0. The manifest names no layer tests. `checks/format.mjs`: 136 modules, 135 requirements files; 0 failures. `checks/architecture.mjs`: 11 product files, 52 relative imports; 0 failures. `checks/coverage.mjs`: 15 of 15 live requirement ids named by a test; 0 failures. `checks/ownership.mjs` (tranche/T37): 4 files; 0 failures.

Size (session_01NtKgWhTs8dgUsdu2kZ9cnc): test runs 4, module lines 862

## J1 · QUESTION

R14's last sentence can't be built as written: "an item whose finding has left the window stays until its recipient disposes of it".

Why: `queue` keeps no items. It derives the feed on every read (R51: it reads `noticeItems` each time) and stores only dispositions and mutes (`queue/schema.mjs`: `queue_state`, `queue_item_mutes`, `finding_dispositions`). This module writes nothing (Factory; R1). So an item is in the feed only while `noticeItems` answers it, and that needs the finding read. R14 also says a finding older than the window "is never read". The two clauses together can't both hold. (R13 has the same gap, unstated: a change past 90 days stops being answered and its item leaves the feed.)

Options:
(a) The window is the item's life: a finding older than 90 days is not read, so its item stops being answered. Inside the window, the item leaves on `held: false`. R14's last clause is amended to say so, as R13 already behaves. No other module changes.
(b) Keep the item while its hold is open, outside the window too. That needs `file-safety` R15 to answer only held findings (e.g. `held: true` as a filter, with its own bound), plus a second, bounded read of R14. That is a file-safety change (another module and layer), not in T37.
(c) `queue` keeps the items it has shown until they're disposed of. That is a queue change and a doctrine change for every producer.

Recommendation: (a). It is what R13 already does, it holds R14's bound, and it needs no other module. A finding still held after 90 days stays visible where the file is (file-safety R16: the original doesn't open, the screens show the hold), so the member isn't left blind.

I am building (a) now: the windowed read (`since` = 90 days before the call; first page, then `cursor` while `truncated`; at most 1,000), and no item for a finding answered `held: false`. My tests state (a). If you pick (b) or (c), I'll bring the job in line.
