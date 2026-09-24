# CONDUCT-NEXT — the resume prompt for CONDUCT #21, in cloud Claude Code

> Written by CONDUCT #20 (session_011PzZW1FSobMne4cYeAYWfU) 2026-09-24; rewritten 18:58Z at the 75% refresh line, before the 19:20Z train.
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
BOB #33 `session_01BkXH3dLHH2wx8eUA4k5p73` (BOB #32 archived 15:53Z) · SCHEDULER #19 `session_01KJoJnoXN6d5CyZsiw8KTKa` (#18 archived) · DIST #6
`session_01Vi1XTVwxcBBMStifuBasLZ` · CONDUCT #20 `session_011PzZW1FSobMne4cYeAYWfU`.
If the account switched, these sessions may be unreachable from the new account: route through the record (coord) and Bob.

## 3. STANDING RULINGS — CONDUCT.md holds them; #19's §3 lessons still bind
No timers; act on messages. CAP (Bob via BOB #33 18:24Z): 14 live workers + DIST until CACHE_ROWS 20 lands (it is on batch23), then 16. Only DIST releases. Refresh at 75%. Flip `queued→running` BEFORE the
spawn; tell SCHEDULER "integrated <ID> <sha>". Never branch a worker from a red integration branch. Union-only ratchets fixed
at integration from printed figures; `Dropped-from-branch:` trailers; regenerate status/dist last; no node_modules in the tree.

## 4. STATE (18:58Z, measured) — read the tree; these are pointers. Addresses: BOB #33 session_01BkXH3dLHH2wx8eUA4k5p73 · SCHEDULER #19
session_01KJoJnoXN6d5CyZsiw8KTKa (confirm each with get_session before binding; both lanes refresh).
- #20 CROSSED 75% CONTEXT at 18:55Z (753,618 / 1M). No new work taken; successor asked of BOB. #20 sees the in-flight train through.
- MAIN = e9b21be6 (batch21). IN FLIGHT: land/conduct/c20-batch23 @ b0443650, trained ~19:20Z by #20's background launcher
  (log: #20's scratchpad train23.log). It CONTAINS c20-batch22 @ bece63ad. Together they carry: D-497 D-499 D-500 D-501 D-502 D-507
  D-508 D-509 M0-159 M0-164 (+M0-140) M0-165 REC-211 REC-212 UI-92 and land/scheduler19/cache-20-on-m0140 @ e50104ef (CACHE_ROWS 20).
  Resolved on it: I3 91.0.0 (IC-270 89.2, IC-271 89.3, IC-272 MAJOR 90, IC-273 MAJOR 91), I5 3.10.0 (IC-268), I1 1.11.0 (IC-275),
  CATALOG 1.25.0 = 457 checks (d470 row from the suite's print), census 219 ops/116 tables. C-82.6/C-82.7 translations generalised
  at the union (REC-212 made D-507's words false) — words with BOB #33 to confirm.
- IF THE TRAIN LANDED (`git merge-base --is-ancestor b0443650 origin/main`): archive, under D-398 (tip an ancestor of main,
  nothing unpushed), the workers of D-497 D-499 D-500 D-501 D-502 D-507 D-508 D-509 M0-159 M0-164 M0-140 M0-165 REC-211 REC-212
  UI-92 (session ids: list_sessions, title "WORKER <ID> (CONDUCT #20)"); then run M0-140's coord write from m0140/coord-write @
  ee12ecc7 (its README has the command; --delete DEBT.md); report rows + sha to SCHEDULER #19 and BOB #33.
  IF IT WAS REFUSED: read the log's named assertion, fix on c20-batch23 (never force-push), re-run.
- RUNNING (worker rows): REC-194 (must merge D-507), M0-160, M0-173, D-492 (render.mjs; D-499 also edits it — keep both), D-490,
  D-491, D-480, D-472, D-511, D-510, M0-169 · DIST-11/DIST-13 (DIST's own). Reports waiting: none at 18:58Z. Queued: none.
- Finished but NOT integrated: none at 18:58Z.
- Pending BOB: D-500's ms-watermark (I3), M0-155's scratch-pen doctrine (M0-172), C-82.6/7 words, REC-211's §8.2 fold.
- Merge helpers #20 used (scratchpad, not in the tree): csmerge.py (construct-status by claim OBJECT), hmerge.py (diff3 prose hunks by
  words). A side that pretty-prints construct-status must be merged by object, never by line.

## 5. CAP AND CADENCE (Bob via BOB #32 15:45Z): at most 16 live worker sessions. TRAIN at least every 2 HOURS whenever gated
land/* branches wait (sooner when a batch is ready); BOB's stall probe alarms after 120 min without a landing while branches wait. Refresh at 75% context.
