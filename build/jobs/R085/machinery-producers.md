# machinery-producers (R085)

**Status** · session_01WdZWF2N7iamL2RKVC1vFPM · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Found in another module, not changed here: screens-daily's item words. `screens-daily/item-words.mjs:41-47` falls back to `queue.source.untitled` for a CONDITION item with no `subject.title`. The diagnosis (diag-085-r4, (b)) pairs R14 with a screens-daily change so an item names its document's title. R14 stops the item for the question, so the untitled wording no longer shows for it; the fallback itself remains for any other item without a title. For screens-daily to own, not for this job.

## J2 · COMPLETE

R14 (R085-19) applied: raised only for a bundle holding a capture (its register row) or a completed capture request. Commit b7aaf3363e on job/R085/machinery-producers.

Changed: bio-plane/src/machinery-producers/index.mjs (one check in #conditionsCaptureUnattended, before the item is built); test/m/machinery-producers/conditions.test.mjs (new R14 test: a question carrying a run's machine-written proposal raises no item for carol or dave; control, a register row under the question raises it; control, a machine-written capture still raises its item; R13's fixture bundles INFO-77 and INFO-66 given a register row, the same words still asserted); test/m/machinery-producers/producers.test.mjs (INF-U given a register row, the machine-completed document it asserts).

Deferred: none.
Not touched: requirements file still marks R14 "(not yet met: R085)"; that file is Bob's, outside my paths, for Bob to clear. Finding in screens-daily reported separately (REPORT).

Tests: node --test test/m/machinery-producers/ — 31 of 31 pass (30 before, plus R14). Dependents: test/m/queue-producers/ and test/m/queue/ — 228 of 228; test/m/observation-log/append, test/m/plane/t48, test/m/queue-producers/feeditems, test/m/queue/catalogue — 39 of 39. A full run of test/m/** exceeded my 300 s limit and was not completed.

Checks, run from /home/user with product bio:
- format.mjs bio: 170 modules, 169 requirements files; 0 failures
- architecture.mjs bio machinery-producers: 7 product files, 31 relative imports; 0 failures
- coverage.mjs bio machinery-producers: 14 of 14 live requirement ids named by a test; 0 failures
- ownership.mjs bio machinery-producers tranche/R085: 1 files changed by machinery-producers; 0 failures (run before the commit; it reads committed changes, which covers the same three files)

Size (session_01WdZWF2N7iamL2RKVC1vFPM): test runs 9, module lines 1214
