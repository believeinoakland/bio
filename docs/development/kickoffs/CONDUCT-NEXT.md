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

## 4. STATE (15:50Z) — DEVELOPMENT RESUMED ON THIS ACCOUNT (Bob via BOB #32 15:40Z: quota reset, account switch CANCELLED,
wind-down OVER; cap 10 live workers). Read the tree; these are pointers.
- MAIN = 68fecb8d (BOB's train landed land/bob/fold-m132). Before: 5f116f33 (0.79.0 release pointer, DEPLOYED by DIST #6),
  13073707 (c20-batch14), 6761e903 (batch19), 454a02bc (batch18). Versions: I1 1.10.0 · I3 87.0.0 · I4 2.2.0 · I5 3.8.0.
- land/* already on main are deleted by .github/workflows/prune-landed.yml; train.mjs's ref deletion is redundant. Trains:
  ONE `--drop` PER BRANCH (M0-159 is the fix row). NEVER-MERGE refs: c16-batch3, c16-batch6, land/bob/folds-0924c,
  land/bob/folds-0924d, c18-batch7fix, c19-batch10, c20-integ1, c20-batch16.
- LIVE WORKERS (first 10, spawned 15:46-15:48Z, base 68fecb8d, rows flipped running at coord f8fd4a77; report by one-shot trigger):
  M0-140 session_01SwHJ5PDWaoePcKuzYBscMK (retire the DEBT construct; CLAUDE.md wording goes to BOB first) · D-498
  session_01N5aDuN1MfnKxsNJ5n7cPkU · D-497 session_018qopfWkzV5cvhBz2jTv3HD · UI-100 session_01SpHP4tgbseccztTdjMSCij ·
  REC-195 session_01TXWen1KhhqKXJj5A9wnvpN · M0-153 session_01CA8h4ZpGNcoCbb18TUQc8U · M0-154 session_01Gh94DitRyuZFiqZDucoiy6 ·
  M0-155 session_016oXJSbX622XgPZybiCHhPG · M0-157 session_01V8GNcS1HJ8NwMmx5AMsYzE · M0-158 session_01UNuTyy3HyKaA6NTmjLuGqT.
  PLUS 5 (15:49-15:50Z, coord 0cf9783c; 15 live): UI-92 session_01QY1UMF2hnkFRAigwRyrbZp · D-505 session_014oU4xtRHymVAFfuYTPkFL4 ·
  D-503 session_01Lar2mJnqfdxQ3fb6dVUuQv · D-506 session_01JnKExYq87zoNZ3mx3fCgdq · REC-194 session_01YL4Drx2EamtQLtaGQSL1HC.
- NEXT RUNNABLE: the cache is DRAINED (only DIST-13, DIST's); SCHEDULER asked to refill 15:52Z. Fill a freed slot same turn.

## 5. CAP AND CADENCE (Bob via BOB #32 15:45Z): at most 16 live worker sessions. TRAIN at least every 2 HOURS whenever gated
land/* branches wait (sooner when a batch is ready); BOB's stall probe alarms after 120 min without a landing while branches wait. Refresh at 75% context.
