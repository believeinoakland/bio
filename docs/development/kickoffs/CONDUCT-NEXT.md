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
- LIVE WORKERS (10, spawned 15:46-15:48Z, base 68fecb8d, rows flipped running at coord f8fd4a77; report by one-shot trigger):
  M0-140 session_01SwHJ5PDWaoePcKuzYBscMK (retire the DEBT construct; CLAUDE.md wording goes to BOB first) · D-498
  session_01N5aDuN1MfnKxsNJ5n7cPkU · D-497 session_018qopfWkzV5cvhBz2jTv3HD · UI-100 session_01SpHP4tgbseccztTdjMSCij ·
  REC-195 session_01TXWen1KhhqKXJj5A9wnvpN · M0-153 session_01CA8h4ZpGNcoCbb18TUQc8U · M0-154 session_01Gh94DitRyuZFiqZDucoiy6 ·
  M0-155 session_016oXJSbX622XgPZybiCHhPG · M0-157 session_01V8GNcS1HJ8NwMmx5AMsYzE · M0-158 session_01UNuTyy3HyKaA6NTmjLuGqT.
- NEXT RUNNABLE (QUEUE.md is the source): UI-92, D-505, D-503, D-506, REC-194 (DIST-13 is DIST's). Fill a freed slot same turn.

## 5. CAP (Bob via BOB #32 15:40Z): at most 10 live worker sessions. Refresh at 75% context.
