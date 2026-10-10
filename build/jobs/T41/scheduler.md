# scheduler (T41)

**Status** · session_01WoUvbRKoQznX2cCJWJvBwg · depth 2 · WORKING · handled B0

## J1 · QUESTION

R26 is ambiguous in two places; my best reading of each, on which I carry on:

1. **investigation's quiet check (its R18).** `investigation` offers no due, wake or tick for `scheduler`: R18 is `quietPrompts({viewer, at})` for `notice-producers`, computed on read (`index.mjs`:1023–1103: `#quiet` judged afresh, the spell opened or closed on each read), plus the members' doors and `watchArrival` for `monitoring`. There is no periodic work to run, and any cadence this module invented would break R7. **Best reading:** scheduler registers no consumer for investigation (nothing it could call without an interval of its own); R26's investigation clause is met by asserting that no consumer of investigation's is registered and that the quiet prompt needs no alarm (a test reads `quietPrompts` turning up a quiet project with no alarm armed). If you mean a consumer, investigation needs `quietDue/quietWake/quietTick` (e.g. a sweep that opens spells), its own job's, and R26 would then name them; I would also drop `investigation` from my `uses` under my reading.

2. **question-explorer's consumer (its R1).** `exploreDue(now)` answers a *count* of due questions (0 when none, `question-explorer/index.mjs`:366), not an instant or null; read as `due` it would be 0 (epoch), i.e. due at every firing. `exploreWake(now)` answers the instant or null. **Best reading:** consumer `question-explore`, key `explore`, `due(now)` and `wake(now)` both `exploreWake(now)`, `tick(now)` `exploreTick(now)`; placed after `document-copy` (appended, R5 naming no slot), holding R1–R4 and R7; no arming notice (question-explorer offers none; its wake is re-derived at every reconcile and at start, R11). Please confirm the name, key and place, or name others.
