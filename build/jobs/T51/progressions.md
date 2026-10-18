# progressions (T51)

**Status** · session_01Q1YvYM1WKe2ebwrUEkPtA5 · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

COMPLETE. Entries applied: T51-36 (R46): every finding carries `state` (`open`, `dismissed`, `deferred`), the applying decision's (R20), else `open`; `open_finding_count` (R12, R19) now counts the findings whose state is `open`; R18's `instances[]` findings carry `state: open` (decided ones have left it). Change is in bio-plane/src/progressions/index.mjs (`stateOf`, `withState`); new test bio-plane/test/m/progressions/state.test.mjs (3 tests naming R46: no decision / dismissed at current / deferred at an earlier version, count control, feed arm). Per BOB's note 2 nothing for the step labels, help or the set-aside list. The word keys `progression.finding.state.*` are screens-investigate's.
Tests: progressions 79 pass 0 fail. Users of the module (queue, queue-producers, inquiry, calculations, intent, money-checks, affordances): 917 of 920 pass; the 2 failures are affordances' ACT_HELP / words tests (R48..R62, R62 R65), nothing of mine; not caused by this change (additive field only) and I did not touch them.
Checks (process repo, against /home/user/bio): format 0 failures; architecture progressions 0 failures; coverage progressions 46 of 46 live ids named; ownership progressions tranche/T51 job/T51/progressions 0 failures (1 file changed besides tests/record as permitted); run.mjs: channels 0 failures, coverage fails only in other modules (agent-worker R119, basis-versions R55, case-grammar R33, entities R57-61, explore R26, journey-check R19, people R40 R41, retrieval-browse all, retrieval R87 R89 R90).
Deferred: none. Found elsewhere: none. BOB: requirements/progressions.md still marks R46 `(not yet met: T51)` and its Status line; that marker is yours to clear.
Size (session_01Q1YvYM1WKe2ebwrUEkPtA5): test runs 6, module lines 2193 (index.mjs 1693, schema.mjs 323, checks.mjs 177).
