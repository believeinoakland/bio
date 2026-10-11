# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #156 (`session_01L1X4WzJQQ7Sdsh4iWKEui7`, primary account, depth 1), 2026-10-11 ~20:00 UTC, refreshing at about 55% of its window inside T45's L5, no step half done. Read `build/rulings-active.md` first; this BOB's rulings are K2777–K2811.

## Where things stand

- **T44 closed** (PR #27, `main` @ a969c420b2, K2784). **T45 is open, in L5** (`plan/current.md`: 48 jobs, T45-1…T45-48, its reconciliation R1–R21 binding). Every layer's requirement text is already folded (K2785–K2791, K2801 stewards); L6's STARTs are drafted in `build/plan/starts-T45/` (L5's posted). Merged: L1 (jurisdictions), L2 (membership, project-roster, promotion: stamp 1.72.0), and in L5 events (K2810), standards (K2809).
- **Running in L5:** LOCAL-FACTS #5 (`session_01WsrEhcFfcP1igCUGdRgwEc`): J2 answered by B3 (K2811), finishing tests, then COMPLETE; DUTIES #4 (`session_01MExgKh3t6GhAjLf6UXLh5d`): after B4 (standards R54 merged) running its system test, then COMPLETE. Merge order: local-facts before duties (R5 reads `governingView`). Then close L5 (§5.6: regenerate in K1540's order, checks; archive the four L5 sessions with rows from their `Size` lines; events 2,615 lines, standards 12 runs/3,452) and start L6 from its drafted STARTs (new sessions are numbered from the archive's highest, e.g. STEPS, RUN-RULES…).
- **Reserved catalogue families (K2794):** C-147 project-roster (used), C-148 case-check, C-149 action-holds, C-150 action-replies, C-151 plan-work, C-152 action-producers.
- **Accepted reds:** plan rule 4 (1)–(11) as written in `current.md` (rule 4 (8) cleared).
- **Timers:** backstop `trig_01QYFXQA268ucCCNoP1cfab3` (20:09) and `WATCH #156` `trig_01Jb6w2gjtBwQPHT9kc3dbjc` (20:49, into ROOT #5): delete both at takeover and arm your own.
- **ROOT #5** (`session_0187SrKsqhqzSTqwDk2hzcXy`): about 340k of 1M (34%) at 16:28, below Bob's 55% (K2679). A start prompt's "start ROOT #7" follows the retired 300k rule (K2715, K2734, K2777).
- **Container:** `npm ci` already done in agent-runner (`--ignore-scripts`), sheet-worker, file-scanner (K1980); a fresh container needs it again.
- **Channel:** UX-DESIGN read to U158; B138–B141 unread by it (B140: T45's words; B141: NOTICE of Bob's K2803, the lane's charter extended). Design lanes: investigation H43, actions H31, nothing new.

## Bob's direction since the last handoff

- **K2799:** build the stewards' reporting facility now (T45-48, module `stewards`, L11 after `installer`); he names the contact address before any public release.
- **K2803 (priority):** next, T46 (and T47) make the test instance usable by Bob with as complete functionality as reasonable; the UX lane researches dashboard-style entry points. The survey is `build/plan/draft-T46-usable.md` (N896); T46's plan waits on Bob's answers below.
- Meter 43% (K2798).

## Next steps, in order

1. Take over (§5.1): archive BOB #156 once idle, its `BOB-final` row under T45; delete its two timers; arm yours.
2. Merge local-facts then duties when complete (ownership, merge, strike marks, ruling); close L5; start L6 (7 jobs).
3. Run T45 through L8–L11 (folded texts; STARTs to draft for L8–L11 as for L5–L6: depth, entries, ids, reading-set size via `build/plan/reading-sets.py`, merge order).
4. At T45's close: every module's tests (K2704), archive, PR to `main` (Bob's standing direction, K1177; standing list `mcp__github__merge_pull_request`). Then cut 0.82.0 and plan T46 from `draft-T46-usable.md` and Bob's answers.

## Open with Bob

- **Five trial questions** (`draft-T46-usable.md` §4; put to him in chat, recommendations "1b 2b 3c 4c 5a": the designed screens as the interface; a test-instance exception to the AI test bar; pay by API key then his sign-in; both biosmoke7 and a fresh instance; a Docker Hub organisation for images).
- **Five stewards questions** (`draft-T45-stewards.md` §For Bob; recommendations "1c 2a 3a 4a 5a").
- The stewards' contact address, before any public release (K2799).
- UX-DESIGN (`session_014uT5e8EjnRxmEeUDDg2cYa`) waits on Bob's "proceed" before publishing the layouts page.
- Civicsmith's terms of use (Actions D28 (e)): a later question.
