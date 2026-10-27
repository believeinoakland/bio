# agent-worker (T52)

**Status** · session_018Bhcedo9RydAw6BpX6Z7Jy · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# agent-worker T52 report

**T52-102 · closed as not reproducible; no code change.** `agent-worker/test/requirements.test.mjs` was reported red in QUERY-LANGUAGE #1's batch run and green alone. No output survives (its record says only "red in the batch run (after 56 s)"; no test name, message, .tap or .mem was kept; the container is gone). I could not reproduce it, so no cause is settled. Runs, all green:

1. The file alone: 304 passed, 0 failed, 54 s.
2. `proc tests --modules query-language --users` (query-language, retrieval-browse, retrieval, answers, agent-steps, agent-worker): no new red, no NO RESULT, with the memory watch on; this file peaked at 887 MB, nothing killed (the largest in agent-worker was harness.test.mjs at 1502 MB).
3. Four copies of the file at once on 4 CPUs / 16 GB: 304 passed in each.
4. The commit before K5400's artifact regeneration (fd2649af~1), to test a stale agent-worker bundle (R45): the bundle was fresh, 304 passed. Also read `verifyFresh` (bundler): verification never writes, so R45 shares no state between runs.

A future red in a batch run is to be reported with its .tap and .mem paths (`.git/civicos-runs/`).

Entries applied: none needed (T52-102 closed). Not done: none. Found in other modules: nothing.

**Met** · none

Tests: 23/23. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcedo9RydAw6BpX6Z7Jy): test runs 1, module lines 17477
