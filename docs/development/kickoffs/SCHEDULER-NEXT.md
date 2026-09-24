# SCHEDULER-NEXT — the resume for SCHEDULER #20 (written by SCHEDULER #19, session_01KJoJnoXN6d5CyZsiw8KTKa, 2026-09-24 ~21:15Z; kept current at each state change)

Read `CLAUDE.md`, `kickoffs/SCHEDULER.md`, then this, then `QUEUE.md` and `BACKLOG.md` from `coord`. A POINTER: re-measure before resting on any of it.

## DISPATCH IS THIS LANE'S, END TO END (BOB #33, 2026-09-24 21:10Z, under Bob's direction)
Root cause measured all day: CONDUCT did both long work (trains, 30–60 min) and short work (flips, spawns), so slots emptied while it trained. FROM NOW ON, at EVERY wake and after EVERY write:
1. `list_sessions` (limit 50, mine) and read each worker's `status_bucket` against the cache's `running` rows.
   - FLIP a row `integrated` ONLY when its worker REPORTED finished, or its branch is pushed WITH A RECORDED GREEN (BOB #33 21:17Z correction: an idle or REVIEW_READY bucket is NOT finished; workers gate in the background). REC-200 was flipped early at 21:12Z and says so on its row.
   - BLOCKED → forward the question to CONDUCT, or to BOB if it is design.
   - A `running` row with no live session, or an idle "completed" session with no pushed branch → tell CONDUCT.
2. Refill to `CACHE_ROWS` (20).
3. SPAWN every queued row yourself. First flip it `running` with the spawn sentence (the falsification clause); CONDUCT's form is in `kickoffs/CONDUCT.md` "For each free slot". Then call `create_session`:
   - title `WORKER <ID> (SCHEDULER #N)`, model `claude-opus-5`, source `https://github.com/believeinoakland/bio`;
   - a self-contained brief: read CLAUDE.md, WORKER.md, the area kickoff, the row on coord (STOP unless `running`), the design SECTION; `npm ci` ×3; mintid; no stash; claim; don't edit QUEUE; push `land/worker/<ID>`; report to CONDUCT #20 by one-shot trigger.
   Check first that the row is not already landed, by its CONTENT.
4. Target: 16+ worker sessions WORKING at all times.
CONDUCT keeps verifying, integrating, trains and archiving of worker sessions. BOB's prototype check: builder/slots.py.txt in https://claude.ai/artifact/M5hUaNBgeM292h4D6odXbX.

## How the lane runs
- Wake by message only; no timers. Lane-to-lane = one-shot `create_trigger` with `persistent_session_id`, `run_once_at` ≈ +2 min. Peers: BOB #33 `session_01BkXH3dLHH2wx8eUA4k5p73`, CONDUCT #20 `session_011PzZW1FSobMne4cYeAYWfU`, DIST #6 `session_01Vi1XTVwxcBBMStifuBasLZ`.
- `CACHE_ROWS` is 20 on main since 1a7f0bcc (land/scheduler19/cache-20-on-m0140). DEBT.md is RETIRED on coord (M0-140's write, 0065b961). Write coord with MAIN's tools only; never from a stale or M0-140-less checkout (two deletions of DEBT.md today came from wrong checkouts).
- ORDER (Bob, 17:41Z): every process improvement is a tracked row. A process row goes ahead of product ONLY for an appreciable effect on productivity (gate time, a false or flaky gate result, a blocker) or on product quality; every other one goes after the product rows. Record why on its `order:` line.
- ROW-WRITING (BOB #33): a `scope:` naming a remedy names, in `accepts-when`, the measured failure it moves. `design:` must be a governed home (LC-row-design refuses TREE-SHARING for M0; cite VERIFICATION.md and name the other beside it).
- Build intents with a QUOTED heredoc or a script file: an unquoted heredoc executes backticks in row text.

## State at ~21:15Z (main 1a7f0bcc; coord 0ca3688c)
- Train c20-batch25 (≈18 rows) leaves ~21:20Z. On landing: verify each row's tip on main (worker branches get deleted; use the shas in CONDUCT's reports or batch ancestry), then ONE write: `--status done --archive` per row plus `--refill`, then dispatch.
- BOB RULED 21:17Z: registeraudit held-in-parts is D-533 (placed); D-518's mixed-tick epoch CONFIRMED, nothing placed.
- Owed to DIST at its next deploy: D-475's two GETs; ONE live render with the BROWSER binding (D-490; header validation undetermined).
- D-528 (UI-93's id) and D-530 are placed; both wait on the 21:20Z train.
