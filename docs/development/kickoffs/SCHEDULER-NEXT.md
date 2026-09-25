successor: SCHEDULER #23 (requested of FLEET #4 by BOB #35 at 06:35Z; its session id is in the coord log "fleet #4: SCHEDULER #23 created"). Until it runs, SCHEDULER #22 is session_01RwrbKgduD6buQwTmKJodT3.

Read `CLAUDE.md`, `kickoffs/SCHEDULER.md`, then this, then `QUEUE.md` and `BACKLOG.md` from `coord`. A POINTER: re-measure before resting on any of it.

## WHY SCHEDULER #22 IS HANDING OVER (written 2026-09-25 ~06:27Z at 69% context, ahead of the 75% line)
SCHEDULER #22 (`session_01RwrbKgduD6buQwTmKJodT3`, created by FLEET #4, root-created so its workers sit at depth 2). If this file's date is older than the latest coord commits, the successor re-reads QUEUE for current state.

## THE LANES (confirm with get_session)
BOB #35 `session_01933kAN3JM2omheRacW6f9R` · CONDUCT #22 `session_01NdCepFRW8KzaQMyVjyFTqM` (CONDUCT #21 is ARCHIVED: triggers to it are refused, and workers briefed before ~04:25Z still name it, so their reports come here and are RELAYED to CONDUCT #22) · DIST #7 `session_01FQcUMZ2f34zhHzBkMEEdQ6` · FLEET #4 (root) `session_01YB9VgJtjiXwQ5vtx4fLvRB`.

## STATE — main 5e8a65a8 (c21-batch28, landed ~04:05Z; its 43 rows done and archived by #22). CONDUCT #22 is composing BATCH29 from every integrated row (74 at 06:27Z; each status: line carries tip and GATE).
When batch29 lands: verify each row's tip is an ancestor of origin/main, then ONE write `--status <ID> done --archive <ID>` each and `--refill`. Rows that ride OTHER rows' branches: D-597 (on REC-219 b9528b03; held in BACKLOG marked BUILT, mark done with REC-219), D-601 (REC-196), D-602 (REC-150; its duplicate fix dropped at union), D-621 (closes with D-535; CONDUCT confirms statepaths arm b arms), D-619 (rides UI-106), D-321 (BLOCKED in backlog; D-321b 5ebea344 trains as a PARTIAL, row stays open).

**Running (17, spawned by #22 unless noted):** D-612 (on D-473), D-578 (on D-563), D-627 (on D-608), D-616 (on D-606), D-617 (on UI-108), UI-106 (on D-568, carries D-619), D-623, D-575, UI-112, REC-215, M0-197, D-620, D-542 (carries D-562), D-574, D-560, D-566, D-564. Each worker reports to SCHEDULER #22 and CONDUCT #22 by trigger; after #22 is archived, read their `land/worker/<ID>` branches and summaries.

**HELD:** D-546 (queued in cache) waits on D-578, then D-615 waits on D-546 (same promote function, one worker at a time). DIST-15 (queued) is DIST's own (the installer is out of bounds for workers); leave it for DIST #7. DIST-14 BLOCKED in backlog until a deploy carries FW-23 (DIST #7 told). D-321 BLOCKED (no scanned agenda held).

**Cache mechanics learned by #22:** P3 caps the cache at 20 non-integrated rows; a new stacked row spawned by hand needs room (move an unstarted queued row back to the BACKLOG head in the same write). P4 refuses a cache row whose depends-on is still open: a row built on an integrated-not-done branch writes `depends-on: none (stacked on land/worker/<ID> @ <sha>)`. The refill treats a dependency placed EARLIER in the cache as met, so a held row returns unless its depends-on names the running row. LC-op-claims refuses a status note naming an op not yet on main (write "the new X act").

**Owed to Bob's lanes:** DIST #7 has the live checks owed at the next deploy (D-606's 32-invocation limit, D-320's DCT decode on the deployed member, D-605's setup page in a release, DIST-14's CSV arms). CATALOG_VERSION: eight branches claim 1.30.0/1.31.0; M0-195's A9 source pin lands first and each union records the merged `source` (CONDUCT #22 has this).

**PLACED BY #22 (each row's order: says why):** D-598, D-594, D-600, D-596, D-599, D-601/D-602, D-603, D-604, D-605, D-606, D-607, D-608, D-609, D-610, D-611, D-612, D-613, D-614, D-615, D-616, D-617, D-618, D-619, D-620, D-621, D-622, D-623, D-624, D-627, D-635, D-665, M0-195, M0-196, M0-197, REC-225, REC-226, UI-114, UI-115. Minted by workers and not yet reported: D-633 (D-627's), D-631/632/634/636-639 (M0-197's) — place them when their reports arrive.

## DELTA 06:27Z -> 06:34Z (#22 measured 75.3% at 06:33Z and STOPPED taking new work)
Batch29 composition CLOSED at 06:25Z (77 branches, CONDUCT #22); rows integrated after that ride BATCH30: D-617, UI-106 (+D-619), D-560, D-575, REC-215, D-612. Placed: D-626 (after D-618), D-666 (rec168 control arms, after D-600; may duplicate an M0-197 mint), UI-116 (REC-215's surface, after UI-115), D-669 (M-167 re-measure, after D-622). Spawned since the list above: D-626, D-346 (on D-612), REC-204, D-375, D-374 — all brief the successor to read this file. ONE SLOT IS FREE: spawn the next queued runnable row (D-415 or D-419; D-546 waits on D-578; DIST-15 is DIST's). UNPLACED, for the successor: D-625 (UI-112's finding: connectionchoose reads an empty occurrence= as none named, so the unplaced empty-key occurrence can never be chosen; FIX: treat a present-but-empty occurrence= as the empty key; owner RECORD). UI-112 integrated at bfd57de2 (rides batch30), freeing a SECOND slot. Open with BOB: UI-106's form gap (a draft with both caseId and newCase), asked 06:27Z.

## ROUTED AND OPEN WITH BOB
MK-7's two provisionals (§4.4 narrow veto, §4.6 name = handle) are with Bob himself; they run as built. BOB INBOX empty at 06:27Z.
