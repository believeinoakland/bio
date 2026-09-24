# SCHEDULER-NEXT — the resume for SCHEDULER #18 (written 2026-09-24 ~02:16Z by SCHEDULER #17, session_014MckoGTYSjDfckPqTKUpAp, at 72% context)

Read `CLAUDE.md`, `kickoffs/SCHEDULER.md`, then this, then `QUEUE.md` from `coord`. A POINTER: re-measure before resting on any of it.

## How the lane runs (Bob's rulings of 2026-09-23/24)
- **No timers.** Wake on messages. Lane-to-lane = one-shot `create_trigger` with `persistent_session_id`, `run_once_at` = `date -u -d '+1 min'` (compute it; a hand-typed minute went 7–14 min late three times). Never `fire_trigger`.
- **Peers:** BOB #32 `session_01HhTF36TQSDaFr9RAxfFnKX`; CONDUCT #19 `session_01Kqy1X9xDKa4PAWtmqTaiRx`. No DIST session is visible to this lane: relay DIST through CONDUCT.
- **Tools:** write coord with MAIN's tools (CACHE_ROWS 16, on main since a8f6094a). #17 used a worktree at `/home/user/s17main` (`git checkout --detach origin/main` to refresh).
- **Every CONDUCT report:** verify the worker merge is in the batch branch's log (`git log origin/land/conduct/<batch> | grep land/worker/<ID>`), flip `integrated` with the IC/M numbers in the note, `--refill` in the same write, restore refilled CUT rows whole from `QUEUE-cut-2026-09-{19,21,22}.md` (a whole row over 3072 B stays cut — REC-122), then trigger CONDUCT naming what entered. On a TRAIN landing: verify each row's merge in `origin/main`'s log, `--status <ID> done --archive <ID>`, refill.
- **"Finished" is not "integrated":** a row stays `running` until CONDUCT reports it on a pushed batch.
- **DEBT.md ONLY SHRINKS; a new defect is `mintid D` and placed straight into the plan** with fix, suite and NEGATIVE CONTROL. CONDUCT pre-mints ICs through coord (D-242's minter is not on main yet); if a worker's id collides, CONDUCT renumbers at integration.
- **Row checks that bite:** `op=<name>` must exist on MAIN (write a not-yet-landed op without `op=`); `design:` must be a governed path — `VERIFICATION.md` passes only for milestone M0; CLAUDE.md, INTERFACES.md, MEASUREMENTS.md, DECISIONS.md do not; a BACKLOG row is ≤ 2048 B, a cache row ≤ 3072 B.
- **Cache full but nothing runnable** = rows `running` whose workers stopped. Ask CONDUCT to report them; never exceed 16.

## State at ~02:16Z (coord e59e2fd6; main 15b2a4c0 + trains pending)
- **DEBT.md: 3 open** — D-313, D-391 close when BOB's folds (land/bob/folds-0924 → fb24040e carrier, in c19-batch9's train) reach main; D-388 closes with **M0-140** (DEBT.md leaves the process): its first act is BOB's §6 classification TOGETHER with retiring `coord.mjs` `LC-undecided-route`'s D-388 clause and correcting `corpuscheck.test.mjs` §5 — or every coord write is refused. **At 0, tell BOB at once.**
- **Trains:** c19-batch9 (c18-batch7fix + batch8 + ~35 integrated rows + BOB's folds carrier) gates after c19-unionfix's re-gate. Finished-but-not-integrated (ride the train after batch9): UI-86, REC-188, D-351, D-291, REC-189, D-461, D-469, D-462, D-464. On each landing, close by content and re-point citations: rows citing "BOB #31/#32's ruling of … (cite until folded)" → the folded sections (BOB's lists of 22:44Z, 00:40Z, 01:22Z).
- **Head of backlog:** D-480 (hidden citations crowd shared-question candidates, disclosure class), then REC-193/194 (D-150's G2/G3), UI-89, UI-90, REC-195, D-444, D-445, D-448, D-450, D-470, D-472, D-476, D-479, D-451, D-454, UI-91, UI-95, UI-96, REC-209 (owners only, Bob's §18.1 option D), D-242-moved (done), REC-190, D-64 (running), D-453/REC-203 (blocked: egress), REC-191, D-455, D-338, REC-162/155 (after REC-159), namespace guards D-463, D-475, D-478 …; M0 group opens with M0-140.
- **Owed by BOB / open questions:** §18.1 folds; D-351's Framework §16 body sentence; egress to Oakland hosts (Bob's setting; D-453, REC-203, D-166).
