# CONDUCT-NEXT — the resume prompt for CONDUCT #21, in cloud Claude Code (likely on Bob's OTHER account)

> Written by CONDUCT #20 (session_011PzZW1FSobMne4cYeAYWfU) 2026-09-24 ~03:12Z; FINAL at wind-down ~07:15Z, kept current at every train (quota plan).
> Everything below is on `origin` (main, coord, land/*). Where the tree disagrees with a line here, the tree is right.

## 1. RE-MEASURE BEFORE ACTING
```
git fetch origin
node tools/train.mjs list | awk '$2=="WAITING"{print $3}'
node tools/coord.mjs read docs/development/QUEUE.md | grep -E '^### '
```
A TRAIN OF ONE BRANCH: `node tools/train.mjs run --drop <b1> --drop <b2> …` — ONE `--drop` PER BRANCH. A comma list is NOT parsed:
#20's 07:08Z train took `--drop a,b,c` as one unknown name and merged EVERY waiting branch (killed by PID before any push; main
untouched). Build the args from `train.mjs list` (grep WAITING, awk $3), and confirm the log's first line says `1 waiting`.
Ids: always `node tools/mintid.mjs <NS>`; check new ids at each merge (`mintid.mjs --audit --base origin/main`).

## 2. LANE ADDRESSES (one-shot `create_trigger`, persistent_session_id, run_once_at ~1 min ahead; NEVER fire_trigger)
BOB #32 `session_01HhTF36TQSDaFr9RAxfFnKX` · SCHEDULER #18 `session_01MgL7YDGuxH1F7e3zxx6GSp` · DIST #6
`session_01Vi1XTVwxcBBMStifuBasLZ` · CONDUCT #20 `session_011PzZW1FSobMne4cYeAYWfU`.
If the account switched, these sessions may be unreachable from the new account: route through the record (coord) and Bob.

## 3. STANDING RULINGS — CONDUCT.md holds them; #19's §3 lessons still bind
No timers; act on messages. ≤10 LIVE WORKER SESSIONS until 05:45Z, 6 from 05:45Z, NO spawns from 06:45Z (Bob via BOB 05:01Z: steps moved 45 min; leave quota for a CLEAN handoff). NO RELEASES until Bob asks. Refresh at 75%. Flip `queued→running` BEFORE the
spawn; tell SCHEDULER "integrated <ID> <sha>". Never branch a worker from a red integration branch. Union-only ratchets fixed
at integration from printed figures; `Dropped-from-branch:` trailers; regenerate status/dist last; no node_modules in the tree.

## 4. STATE (14:37Z, updated on BOB #32's instruction) — read the tree; these are pointers
- MAIN = 5f116f33 (14:36Z: land/dist/cut-0.79.0 @ d2ca15b0 trained ALONE by #20 on Bob's ask via BOB #32 — release/ now reads
  0.79.0, deployed and live-verified by DIST #6 on all six workers; gate GREEN; merged onto 0a00c9c6 = Bob's prune-landed.yml:
  land/* refs already on main are now deleted by .github/workflows/prune-landed.yml on every push, so train.mjs's ref deletion is
  redundant). Before: 13073707 (c20-batch14 @ bf73ee6d LANDED 11:39Z, trained ALONE by BOB #32 as Bob's ONE-TIME close-out exception — trains
  stay CONDUCT's act; gate GREEN 351/351 · 19,983). Versions on main: I1 1.10.0 · I3 87.0.0 · I4 2.2.0 · I5 3.8.0. Before it:
  6761e903 (batch19: UI-89 D-496), 454a02bc (batch18). D-150 -> UI delegation NARROWED on coord CLAIMS (six STATEMENT_ACK DEC-49 rows).
- NO TRAIN IS OWED, and nothing is in flight. The archive list is DONE: BOB #32 archived all 23 idle workers on the first account
  (20 by ancestry on main; c20-integ1, c19-batch10, c18-batch7fix as never-merge). SCHEDULER #18 closes the 20 rows.
- EVERY REMAINING WAITING REF IS NEVER-MERGE: c16-batch3, c16-batch6, land/bob/folds-0924c, land/bob/folds-0924d, c18-batch7fix,
  c19-batch10, c20-integ1, c20-batch16. Drop them all from every train (one `--drop` per branch).
- DIST owed on batch14's landing: D-461 SAFETY, D-464 DISCLOSURE, D-462 agent-worker bundle (I8 2.0.0), DIST-11 browser class.
- NEXT RUNNABLE (QUEUE.md is the source): REC-194 (unblocked by REC-193 on main), REC-211, D-499, D-500, REC-212, D-506, M0-153..158,
  DIST-13. No worker of #20's needs Bob.

## 5. QUOTA PLAN (Bob via BOB #32, 03:00Z)
Until 05:45Z ≤10 live; 05:45Z ≤6 live; 06:45Z spawn NOTHING — finish, push, integrate, train; list to BOB every worker that needs
Bob (exact question + session id), leave them open; write this file for the other account's CONDUCT, verify on the remote, stop.
