# scheduler (T22)

**Status** · session_01GsKdFZYRue1QuYjqA5nRRW · depth 2 · WORKING · handled B2

## J1 · REPORT

Progress, all three entries applied on `job/T22/scheduler` @ 4568ad7eca (tests only; `src/scheduler/` unchanged, plane bundle fresh):
(1) N479: `rank.test.mjs`'s todo replaced by the composed R10 test: monitoring's own fixture, 62 due subjects (batch 50), the ten gap-serving ones at the tail of R16's order; `onAlarm` hands the real `cadenceTick` the scheduler's rank and the batch checked is the rank's head. Negative controls: no rank, intent naming no gap, and a reversed rank each check a different batch. Mutation check: with `monitor-cadence` dropped from `RANKED` the test fails. No todo left.
(2) `plane.test.mjs` entitycreate sends a note: red before (`ENTITY_NO_NOTE`, C-91.8), green with it; R9's assertion unchanged.
(3) Re-scan: nothing names a T20-deleted file, `tools/`, `legacy-tests` or the plane `index.mjs` as live. I found `legacy-store` (retired K858) named as a live registrant in four test files; I re-pointed them to `tasks`, `queue` and `instance-setup`.
Runs: `test/m/scheduler/` 52/52; monitoring `ticks.test.mjs` 15/15 (unchanged); tasks 71/71, queue 80/80, instance-setup 86/86; whole `test/m`: 4947 tests, 4921 pass, 9 fail, all accepted by name (control-plane catalogue-end:15 and doorbell:310; accepted red 4: module-order:12, t9-notice-sight-bounds:185, promotion registry:58; queue-producers proposals ×4). Checks: format 0, architecture 0, coverage 20/20 with 0 failures, ownership 5 files with 0 failures.
For BOB, not applied: (a) `src/scheduler/index.mjs`:17's header comment still names `legacy-store` as a registrant "meanwhile". Re-wording it stales the plane bundle (measured: fleetbundles goes red), so I reverted it per your "tests only" line. I'll make the comment-only edit on a CHANGE if you want it at a layer close. (b) `build/requirements/scheduler.md` (yours): R9's "Until a module is extracted, `legacy-store` arms for it", and Suggestions "Factory" and "The drain", still name `legacy-store` as live; they want the past tense (N469's rule).
Next: merge `tranche/T22` on your CHANGE announcing monitoring's merge, re-run the composed test, then COMPLETE.
