# queue (T23)

**Status** · session_017MoDouHv8ALjeYQN3gFsNb · depth 2 · WORKING · handled B2

## J1 · REPORT

Progress, and what I wait on. (1) is done at 3a2b177054: no code change was needed (`QUEUE_CONDITION_KINDS` spreads observation-log's `CONDITION_KINDS`, so `classOfKind` already answered `CONDITION` for the eight with observation-log's sentences); `catalogue.test.mjs`'s R1 and R5 tests now pin the twenty plus `action-clock-overdue`, each new kind's sentence equal to observation-log's and saying what R1 states, with near-miss kinds classed null as negative controls. Red 13 is cleared on my branch: `test/m/queue/` 93 pass, 0 fail. A comment in `src/queuestate.mjs` (:61, "observation-log's twelve") is corrected, which stales the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`); I regenerate nothing. The world's `monitoring` stand-in gains `sweepConditions` (empty), ready for queue-producers R26. `node --test bio-plane/test/conclude-project.test.mjs` is red only by red 6 (`#findingsExportPerformed`: `this.#publication.exportLog is not a function`), as at my start.

(2) and (3) wait on queue-producers' merge (your CHANGE). One note for it: queue hands queue-producers only the deps named in `Queue.PRODUCER_DEPS` (`bio-plane/src/queue/index.mjs`:103), so the dep it adds for corpus-export's `exportLog` and the one for `network-notices.noticesOf` (R27) must be added there by me for queue's stand-ins to reach them; I will take their names from its COMPLETE. Checks: format, architecture, coverage (39 of 39), ownership all 0 failures.
