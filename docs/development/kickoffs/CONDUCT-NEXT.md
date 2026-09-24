# CONDUCT-NEXT — the resume prompt for CONDUCT #21, in cloud Claude Code

> Written by CONDUCT #20 (session_011PzZW1FSobMne4cYeAYWfU) 2026-09-24; kept current at every train; last 18:58Z, before the 19:20Z train.
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

## 4. STATE (19:13Z, measured) — read the tree; these are pointers. Addresses: BOB #33 session_01BkXH3dLHH2wx8eUA4k5p73 · SCHEDULER #19
session_01KJoJnoXN6d5CyZsiw8KTKa (confirm each with get_session before binding; both lanes refresh).
- #20 is LIVE (live context ~24%). CAUTION: get_session's context_usage.used_tokens COUNTS PAST THE COMPACTION BOUNDARY (read
  753,618 = 75.4% while the live window was ~24%) — never refresh on that figure alone.
- MAIN = e9b21be6 (batch21). TRAIN ~19:20Z (#20's background launcher; log: #20's scratchpad train23.log) carries
  land/conduct/c20-batch24b @ 1ab3c839 (contains c20-batch23 @ 5ff1b9b2 and c20-batch22 @ bece63ad) + land/bob/batch-0924c @ 1b323110.
  c20-batch24 @ 3d0d0529 is SUPERSEDED by 24b (same trees; 24b adds Dropped-from-branch trailers mergecarry needed) — never train it.
  Rows carried: D-480 D-492 D-497 D-499 D-500 D-501 D-502 D-507 D-508 D-509 M0-159 M0-160 M0-164 (+M0-140) M0-165 REC-211 REC-212
  UI-92 + cache-20-on-m0140. I3 91.1.0, I5 3.11.0, I1 1.11.0, CATALOG 1.25.0 (457), census 219/116.
- IF IT LANDED (`git merge-base --is-ancestor 1ab3c839 origin/main`): archive under D-398 the workers of those rows; run M0-140's
  coord write from m0140/coord-write @ ee12ecc7 (README; --delete DEBT.md); report rows + sha to SCHEDULER #19 and BOB #33.
  IF REFUSED: read the named assertion, fix on a NEW branch (never force-push), re-run.
- WORKING (15): REC-194 M0-173 D-490 D-491 D-472 D-511 D-510 M0-169 D-518 M0-178 D-476 FW-22 FW-23 D-463 D-475. DIST-11/13 are DIST's.
  Bob 18:50Z via BOB: 16 WORKING is the target; at EVERY wake spawn first when rows are queued. None queued at 19:13Z (SCHEDULER asked).
- Pending BOB: D-500 ms-watermark (I3), M0-155 pen doctrine (M0-172), C-82.6/7 generalised words, REC-211's §8.2 fold.
- Coord writes from a main-based worktree are REFUSED (LC-ledger P3: cache 20 > 16) until CACHE_ROWS 20 lands; write from a
  batch23+ worktree meanwhile.

## 5. CAP AND CADENCE (Bob via BOB #32 15:45Z): at most 16 live worker sessions. TRAIN at least every 2 HOURS whenever gated
land/* branches wait (sooner when a batch is ready); BOB's stall probe alarms after 120 min without a landing while branches wait. Refresh at 75% context.
