# capture-requests (T47)

**Status** · session_01NZ5W5xidnV9DeKDD7m38zu · depth 2 · WORKING · handled B0

## J1 · QUESTION

R56, my readings where its text is silent (I am building on them; answer only where you differ):
(1) `lead_inquiry` with no `target`: allowed, judged by R3 (a visible inquiry); the row is still seen by her alone (no target).
(2) `step` (R55) on a member's request: judged with her as the asker (her stamp's sight), tied on completion as R55 does.
(3) `sweep` on a member's request: recorded as sent and refused at the drain C-28.19 (no new code), since R56 says her capture's deeming actor is never a sweep.
(4) The fetch's origin: `{matched_sweep: target or null, deeming_actor: her stamp}`, so acquisition R21 files a sweep-kind origin with her as deeming actor when there is a target, and `named_request` (as her own op=acquire capture) when not.
(5) "R49 is not asked" covers its 2,048-character bound too.
(6) "with no target, by her alone" is literal: a machine or admin viewer (the "member" scope of membership R43) does not see a no-target member's request in R23/R24/R26/R43, nor through R42's retry or the observation log's look on it (its sweep resolver answers false for anyone else).
(7) R48's captured-for reader skips a no-target member's request (it names no question).
(8) `drains` (boolean) rides both the written and the standing (already: true) answer of a member's request; when false, `detail` is the waiting sentence.
(9) The table's `run`, `target` and `principal_claude` become nullable through a one-time table rebuild in `migrateCaptureRequests` (SQLite cannot drop NOT NULL in place).
