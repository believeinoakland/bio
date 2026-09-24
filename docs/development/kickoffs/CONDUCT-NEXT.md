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
BOB #33 `session_01BkXH3dLHH2wx8eUA4k5p73` (BOB #32 archived 15:53Z) · SCHEDULER #18 `session_01MgL7YDGuxH1F7e3zxx6GSp` · DIST #6
`session_01Vi1XTVwxcBBMStifuBasLZ` · CONDUCT #20 `session_011PzZW1FSobMne4cYeAYWfU`.
If the account switched, these sessions may be unreachable from the new account: route through the record (coord) and Bob.

## 3. STANDING RULINGS — CONDUCT.md holds them; #19's §3 lessons still bind
No timers; act on messages. ≤10 LIVE WORKER SESSIONS until 05:45Z, 6 from 05:45Z, NO spawns from 06:45Z (Bob via BOB 05:01Z: steps moved 45 min; leave quota for a CLEAN handoff). NO RELEASES until Bob asks. Refresh at 75%. Flip `queued→running` BEFORE the
spawn; tell SCHEDULER "integrated <ID> <sha>". Never branch a worker from a red integration branch. Union-only ratchets fixed
at integration from printed figures; `Dropped-from-branch:` trailers; regenerate status/dist last; no node_modules in the tree.

## 4. STATE (16:52Z) — read the tree; these are pointers. Development RESUMED 15:40Z on this account.
- MAIN = 58293bf3 (16:50Z: D-498 + M0-153). Before: 68fecb8d (fold-m132), 5f116f33 (0.79.0 pointer). I3 87.0.0 on main.
- TRAIN RUNNING (16:50Z, log #20 scratchpad train13.log): land/conduct/c20-batch20 @ 6a9df102 = UI-100 + D-505 + M0-154 +
  D-503 + D-506, dist rebuilt; IC-265 (D-506) I3 88.0.0, IC-266 (D-505) I3 89.0.0. On landing archive those 5 by ancestry.
- DONE on coord only: M0-158 (CLAIMS 6c0f0763), archived.
- LIVE WORKERS: M0-140 session_01SwHJ5PDWaoePcKuzYBscMK · D-497 session_018qopfWkzV5cvhBz2jTv3HD · REC-195
  session_01TXWen1KhhqKXJj5A9wnvpN · M0-155 session_016oXJSbX622XgPZybiCHhPG · M0-157 session_01V8GNcS1HJ8NwMmx5AMsYzE (told to merge
  M0-153 and reconcile G5 IN ITS FAVOUR: its gates.mjs §2d fix beats M0-153's downgrade) · UI-92 session_01QY1UMF2hnkFRAigwRyrbZp ·
  REC-194 session_01YL4Drx2EamtQLtaGQSL1HC · D-507 session_01PXoZMHp8BzqvtbponMk52b · D-508 session_01G8U6vc36TrANDpVtGUArFZ ·
  REC-212 session_01HHnoha7mw6A3Dzdk5X45yy · REC-211 session_01M33XV9m3mqkNdrkz8BFWxx. Integrated-awaiting-archive: UI-100
  session_01SpHP4tgbseccztTdjMSCij, D-505 session_014oU4xtRHymVAFfuYTPkFL4, M0-154 session_01Gh94DitRyuZFiqZDucoiy6, D-503
  session_01Lar2mJnqfdxQ3fb6dVUuQv, D-506 session_01JnKExYq87zoNZ3mx3fCgdq.
- VERSION COLLISIONS TO WATCH: D-507 and D-508 both move CATALOG_VERSION (reconcile at integration); REC-211 is I3 MAJOR (next
  above 89.0.0). Flip rows with `--status <ID> running` and NO --note (a note replaces the headline; M0-164 fixes the tool).
- Pending BOB #33: D-505's caller-asserted `replay: true` exemption (forwarded 16:48Z).

## 5. CAP AND CADENCE (Bob via BOB #32 15:45Z): at most 16 live worker sessions. TRAIN at least every 2 HOURS whenever gated
land/* branches wait (sooner when a batch is ready); BOB's stall probe alarms after 120 min without a landing while branches wait. Refresh at 75% context.
