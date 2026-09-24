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

## 4. STATE (18:00Z) — read the tree; these are pointers. Addresses: BOB #33 session_01BkXH3dLHH2wx8eUA4k5p73 · SCHEDULER #19
session_01KJoJnoXN6d5CyZsiw8KTKa (confirm each with get_session before binding; both lanes refresh).
- MAIN = e9b21be6 (17:58Z, batch21: D-503 D-505 D-506 M0-154 M0-155 M0-157 REC-195 UI-100 + BOB doorbell-home, replay-ruling;
  I3 89.1.0, I5 3.9.0, CATALOG 1.23.0, census 219/115). Workers archived by ancestry.
- CADENCE (Bob 17:30Z via BOB #33): trains leave EVERY 2 HOURS carrying everything finished; NO early small trains. Next ~19:20Z.
  Archiving a train's workers (tip on main, nothing unpushed; D-398) is part of landing it.
- NEXT TRAIN carries (integrated): D-507 a8ba4f98 (IC-270 I3 MINOR, CATALOG 1.24.0), D-508 dbacd55f (IC-271 I3 MINOR, CATALOG
  1.24.0 — RECONCILE: one next version from the d470 census PRINT on the union; floors from check-refusal-codes --strict print),
  D-497 29d8409d (IC-268 I5, +1 table: census re-read), D-501 c97b0363, D-500 63aaf1b5, M0-159 792395ca, M0-164 c29e0947 (CONTAINS
  M0-140 d7809ed0 — one branch, not a union), land/scheduler19/cache-20 868072f6. REC-194 must merge D-507 (told).
  FOLD at integration: Content Framework §16 (tier-2 per-page rule + read-time tier-3 BUILT; add the glyph award sentence; D-501).
  AFTER it lands: run M0-140's coord write from branch m0140/coord-write @ ee12ecc7 (README has the command; --delete DEBT.md).
- RUNNING: UI-92 REC-194 REC-212 REC-211 D-502 M0-160 M0-165 M0-173 D-492 D-499 D-490 D-491 D-480 D-472 (session ids: list_sessions).
- Pending BOB: D-500's ms-watermark (I3), M0-155's scratch-pen doctrine (placed M0-172 after ruling).

## 5. CAP AND CADENCE (Bob via BOB #32 15:45Z): at most 16 live worker sessions. TRAIN at least every 2 HOURS whenever gated
land/* branches wait (sooner when a batch is ready); BOB's stall probe alarms after 120 min without a landing while branches wait. Refresh at 75% context.
