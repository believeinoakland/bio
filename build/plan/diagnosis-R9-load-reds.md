# Diagnosis R9: the load reds (BOB #281, K4966). CHECKPOINT: tests 1-5 done, 6 and 7 not started.

Method: a named load, red count before, instrumentation (removed again), cause with file:line, TEST or PRODUCT, fix, green count after under the SAME load.
Runner: `node --import ./test/platform-sqlite.mjs --test --test-force-exit <file>` from bio-plane, 4 cores. Loads:
- L-4B = 4 unpinned `node -e 'for(;;){}'` burners.
- L-PIN = 3 burners AND the test process pinned to core 0 (`taskset -c 0`).
- L-BESIDE = r7-contention and g54-l looping beside the target (two suites), optionally plus 4 burners.
Not run: any module's whole suite once (only the five files themselves). Not committed.

## 1. acquisition stage-times, R95 (fix round 4, C5a): TEST
- Load: none makes it consistently red. Alone 4/20 red; L-4B 2/15; L-PIN 2/15; burners nice -20 with the test at nice 19, 5/15. Not 4 of 5: the bar is a millisecond boundary, so the rate is set by the width of a 70-230 microsecond window, not by load.
- Cause: the test asserts `stageTimes(handed).stages` deepEqual the answer's `t.stages` (stage-times.test.mjs, the C5a test). Two readings of one clock at two instants, floored to the millisecond. src/acquisition/index.mjs:969-971 reads the cut (`stageTimes(t)`, clock call A), then `t.end` (B), then `finally { stageEnd(t) }` (C, line 976) closes the cut stage `read` with a later clock. Measured gaps A to B 23 us, B to C 48 us. If a millisecond boundary falls between them `read` differs by 1 (seen: `read: 5` actual vs `4` expected).
- Instrumented proof: performance.now wrapped to add a skew at C. Skew 0 sometimes red, skew 1.5 ms always red with the unfixed test; the fixed test is green at skew 0, 1.5 and 3 ms.
- Fix applied (test only): the stages done before the throw must read equal; the cut stage reads the same name and no less; the object ends with no `running`. Files: bio-plane/test/m/acquisition/stage-times.test.mjs.
- Same file, test 4 (not in the five): the `strip` compared prose that carries the wall-clock second ("recorded ...Z"). Two runs straddling a second were red (seen once under the instrumentation). Fixed in the same file by masking ISO instants in strings.
- Proven: skew injection 3 of 3 green; 5/5 green under L-4B after the fix. The stock load never gave 4/5 red before, so the "same load" proof is the skew proof. Optional product tightening (acquisition): take one clock reading for the cut and the close.

## 2. capture g127f-plane, R113 (L) x3: TEST (harness race), with a PRODUCT advisory
- Load: L-BESIDE (r7 and g54-l looping): 1/5 red, and 1/3 earlier. L-BESIDE plus 4 burners: 1/5. L-PIN: 2/5 (all three red once). Not 4/5. Micro-reproduction of the exact call (a 16 MiB re-put of a held part, standalone): alone 10/30 failed, L-PIN 5/30, L-4B 5/30; the same request with a one-byte body 0/90.
- Cause: `putUploadPart` (src/capture/index.mjs:1148) answers `existed` (about line 1167) or `UPLOAD_UNKNOWN` before reading the body and `stop()` cancels the reader. workerd answers early and closes the socket, so a client still writing 8-16 MiB gets `fetch failed / write ECONNRESET`. Timeline (instrumented): "part 2 body 16777216 THREW after 47-66 ms: ECONNRESET" (the idempotent re-put in test 1) and "part 2 body 8388608 THREW after 33 ms" (the late part after abort in test 3). The assertion is about the answer, which was given.
- Fix applied: a helper `unread()` that sends 1 byte for the two calls the door answers without reading the body (g127f-plane.test.mjs). Product advisory (capture): a member's client re-sending a held part at the plane's door can see a reset instead of the `existed` answer on a direct-to-workerd path; consider draining the body or document that the answer can be a closed connection.
- Proven: 5/5 green under L-BESIDE plus 4 burners; 5/5 green under L-PIN. (Before: 1/5 and 2/5.)

## 3. reading-pipeline r7-contention, "G82 L: a 21 MB PDF": TEST (wall-clock bar), with a PRODUCT note
- Load: L-4B: 3/3 red, the PDF test only. p95 of the cheap read while ticks run 534, 1037 and 684 ms against the bar of 500. Quiet and beside one other suite it is 406 ms.
- Cause: test/m/reading-pipeline/r7-contention.test.mjs asserts `pct(waits,.95) < BAR_MS` (500). A cheap request waits one un-yielding PDF tick; the ticks cost 260-435 ms of CPU quiet (p50 wait 260), so the wall bar is 100 ms from the machine-speed edge at quiet. CSV and text ticks yield and stay green.
- Fix applied (test and test entry only): a same-run control. `/spin` (r7-contention-entry.mjs, 80M-iteration fixed loop, 430 ms quiet) is timed by the test's clock three times before and three after the ticks; `slow = max(1, slowest/430)`; every bar is 500 ms times `slow`; both printed. Files: r7-contention.test.mjs, r7-contention-entry.mjs.
- Proven: 5/5 green under L-4B (slow x1.69-2.21, p95 397-510). Quiet single run and the module's whole suite not yet run.
- PRODUCT note (reading-pipeline / pdf-reader): the PDF tick holds the thread about 0.3-0.45 s at idle; the 100 ms headroom is the product's, and Bob may want it lowered.

## 4. plane g41-shape, 150,000-row xlsx: TEST (harness) for the tick-state failures, plus a PRODUCT risk for the OOM
- Load: L-PIN: 5/5 red, 7 of 7 counting a dump run. Four reds are "readingFor did not state its state at 75-82 ticks" and the others "child died: heap out of memory" (SIGABRT, cap 202 MB). L-4B and quiet: green (30 s).
- Cause 1 (TEST): `FIRING_BUDGET_MS = 10_000` (src/scheduler/index.mjs:99, race at :638). Tick 1 takes 4.8 s quiet but 10-20 s starved, so the firing returns at 10 s, leaves the row's run going in the object (R31 "late"), and test/m/plane/shape/harness.mjs's tick loop (about line 312-333) calls `onAlarm` 80 more times over a running row, each a no-op "tick" with no reading state. Dump: tick 1 10,152 ms 0 units; ticks 2-81 about 50-140 ms with the row `started_at` unchanged.
- Fix applied: the loop awaits the end of the run the firing left going (condition: no `keeps_pending.started_at`, up to 600 s, skipped where a fault was injected) and counts it in the tick that started it. File: bio-plane/test/m/plane/shape/harness.mjs.
- Proven: 5/5 green under L-PIN (3 ticks each, peaks 164-172 MB). The whole g41-shape file (CSV cases) and the other users of the harness were not run after the change.
- Cause 2 (PRODUCT RISK, not fixed): the OOM, 3 of 7 L-PIN runs before the fix. Quiet peak is 199.3 MB against the cap `capFor` 202 MB (3 MB headroom; shape/cap.mjs says a case that dies is a finding for its owner). With V8's GC threads starved the heap overshoots. Owner: whichever module owns the whole-sheet text read (extraction `readHeld` with formats-xlsx / csv-reader); needs a lower peak or a bigger stated cap. It did not recur in 5 runs after the fix, but the margin is unchanged.

## 5. plane g54-l (red once in a whole plane run): TEST (race with the object's own alarm)
- Load: L-PIN, whole file: 2/4 red, and 2/4 with instrumentation. Always the "(measure)" test (500 files, 40 MB): `fetch failed / other side closed` on `g54/state`.
- Cause: `/g54/finding` (g54-l-entry.mjs, via completeEdition) arms the alarm for an edition already past its first-attempt grace, so workerd fires the object's NATURAL alarm at once, beside the test's own tick. Timeline in the red run: "ENTRY finding begin", then the test's `state` request sent; "ENTRY NATURAL alarm begin", the sweep runs 8.2-9 s (log `scheduler_alarm scheduled_for 1792800000000 started..ended` 8.2 s, `casefile-sweep` 8.9 s, files 508, 41,380,792 bytes), the `state` request never reached the object's fetch ("ENTRY state begin" never logged) and died 8.2 s later at the alarm's end. In green runs only the test's own tick built it (`scheduled_for 1795497060000`). So the test's counts and `finished === 1` belong to whichever tick wins. I did not establish why workerd closes the queued request rather than answering it.
- Fix applied: `/g54/finding?disarm=1` (g54-l-entry.mjs) deletes the alarm before answering; the measure test uses it (g54-l.test.mjs `completed(s, {disarm:true})`). Other tests of the file keep the alarm armed (test 1 asserts it) and have not shown the race.
- Proven: 5/5 whole-file runs green under L-PIN (before 2/4).

## 6. screens-inquiry fr5-seam "R129 N5 (the real plane)": NOT STARTED, hypothesis only
- Read: test/m/screens-inquiry/fr5-seam.test.mjs:65. The press goes through `p.settle()` (a fixed 40 setImmediate ticks, interface-shell/harness.mjs:116) and then `until(p, done, 30000)` (line 45), a 30 s wall wait for the page to draw the reading. Bob's report has `isolate_ms` about 37,500, so the real `op=readheld` took longer than 30 s on the loaded machine: a fixed wall timeout that measures the machine (TEST). Whether the 37 s is the work or an object waiting behind its own alarm (as in 5) is not known.
- Next: run the file under L-PIN and L-BESIDE (5 runs each), log `Date.now()` around `press` and the `until` loop and read the request logs' `isolate_ms`. If the op is slow because the object is busy with an alarm, apply the disarm idea of 5; otherwise replace the 30 s with a wait on the condition (the reading's row stored), bounded only by the test's own timeout.

## 7. control-plane t51-round7-seam "G61 twin": NOT STARTED, hypothesis only
- Read: test/m/control-plane/t51-round7-seam.test.mjs:276. A 15.9 MB PDF is served at 0.7 MB/s (23 s quiet); `until(heldcaptures contains sha, 600000, 5000)` then `until(queue holds fetch-done, 180000)`. A "600 s limit" means the first wait expired: the fetch never filed. Candidates: the scheduler's 10 s firing budget leaving a late run (as in 4), the pending row's backoff (`PENDING_RETRY_MS = 15_000` doubling to an hour, src/plane/pending.mjs:102-103, :202), or the throttled outbound body parking again.
- Next: run only that test (`--test-name-pattern "G61 twin"`) alone, then under L-PIN and L-BESIDE; log the row's `keeps_pending` (state, attempts, due_at, started_at) and the `scheduler_alarm` lines every 30 s.

## Files changed (uncommitted, all test files)
bio-plane/test/m/acquisition/stage-times.test.mjs
bio-plane/test/m/capture/g127f-plane.test.mjs
bio-plane/test/m/reading-pipeline/r7-contention.test.mjs
bio-plane/test/m/reading-pipeline/r7-contention-entry.mjs
bio-plane/test/m/plane/shape/harness.mjs
bio-plane/test/m/plane/g54-l.test.mjs
bio-plane/test/m/plane/g54-l-entry.mjs
All temporary copies (zz-*) are removed. Burners and loops are stopped.

## Notes
- A foreground `sleep` was refused by a safety check; I waited with until-loops instead.
- I once ran `git stash -- <file>` by mistake and popped it at once; the fix was restored intact.
- "Module's own suite once" was not run for any of the five.
