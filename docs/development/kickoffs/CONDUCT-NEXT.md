# CONDUCT-NEXT — the resume prompt for CONDUCT #21, in cloud Claude Code (likely on Bob's OTHER account)

> Written by CONDUCT #20 (session_011PzZW1FSobMne4cYeAYWfU) 2026-09-24 ~03:12Z, kept current at every train (quota plan).
> Everything below is on `origin` (main, coord, land/*). Where the tree disagrees with a line here, the tree is right.

## 1. RE-MEASURE BEFORE ACTING
```
git fetch origin
node tools/train.mjs list | awk '$2=="WAITING"{print $3}'
node tools/coord.mjs read docs/development/QUEUE.md | grep -E '^### '
```
A TRAIN OF ONE BRANCH: `node tools/train.mjs run --branch origin/<b> --drop <every other WAITING>`.
Ids: always `node tools/mintid.mjs <NS>`; check new ids at each merge (`mintid.mjs --audit --base origin/main`).

## 2. LANE ADDRESSES (one-shot `create_trigger`, persistent_session_id, run_once_at ~1 min ahead; NEVER fire_trigger)
BOB #32 `session_01HhTF36TQSDaFr9RAxfFnKX` · SCHEDULER #18 `session_01MgL7YDGuxH1F7e3zxx6GSp` · DIST #6
`session_01Vi1XTVwxcBBMStifuBasLZ` · CONDUCT #20 `session_011PzZW1FSobMne4cYeAYWfU`.
If the account switched, these sessions may be unreachable from the new account: route through the record (coord) and Bob.

## 3. STANDING RULINGS — CONDUCT.md holds them; #19's §3 lessons still bind
No timers; act on messages. ≤10 LIVE WORKER SESSIONS until 05:45Z, 6 from 05:45Z, NO spawns from 06:45Z (Bob via BOB 05:01Z: steps moved 45 min; leave quota for a CLEAN handoff). NO RELEASES until Bob asks. Refresh at 75%. Flip `queued→running` BEFORE the
spawn; tell SCHEDULER "integrated <ID> <sha>". Never branch a worker from a red integration branch. Union-only ratchets fixed
at integration from printed figures; `Dropped-from-branch:` trailers; regenerate status/dist last; no node_modules in the tree.

## 4. STATE (06:00Z) — read the tree; these are pointers
- MAIN = 135abf3b (c20-batch15 landed: D-493 M0-144 M0-143 D-453 DIST-9; IC-261 I4 2.2.0). Before: d536f834 (batch12: D-470 D-487
  UI-84 D-479; I3 81.3.0), 0fdef669, 16fe1e7f. Landed workers archived by ancestry (Bob's rule).
- TRAIN RUNNING (05:58Z): land/conduct/c20-batch17 @ aa8c0721 = main 135abf3b + D-481 D-494 DIST-12 D-483 D-484 M0-146 D-495 +
  land/dist/newgroup-dist-078; IC-263 (D-484) I3 81.4.0; D-481 §16 limit folded. Log: #20 scratchpad train6.log. On landing archive
  D-481 D-494 D-483 D-484 M0-146 D-495 workers by ancestry. NEVER train c20-batch16 (no trailers); 16b is inside 17.
- c20-batch13 GREEN @ 41db70e1 (batch11fix + batch12; I3 85.3.0; CATALOG_VERSION 1.22.0, census 438): NOT trained alone — batch14
  carries it.
- INTEGRATION WORKERS: c20-batch13 session_01KXuCWoxFB4aA2GaADwB9E8 (batch11fix + batch12, I3 85.x; due 05:40Z, NOT yet reported)
  and c20-batch14 session_01Ya8PUPivB6xpvV51uhcZa9 (integ1b @ 4ed8616c's D-64 + REC-184 onto batch11fix, IC-252 86.0.0 MAJOR,
  IC-255 86.1.0, then batch13, then D-486 IC-258 86.2.0; due 06:15Z). They carry batch10/11's 14 rows + d461-claude + D-64 REC-184
  M0-141 D-486. When batch14 pushes, it must ALSO merge current main (batch15/17), renumbering its I3 entries above main's 81.4.0 base:
  main's 81.x chain and batch11fix's 85.0.0 must become ONE linear sequence. DROP c19-batch10, c19-batch11, c20-integ1 (broken
  trailers), c20-batch11fix, c20-batch12, c20-batch16 from trains; they are inside the batches. On landing: DIST owed D-461 SAFETY,
  D-464 DISCLOSURE, D-462 agent-worker bundle (I8 2.0.0), DIST-11 browser class.
- REC-193 DONE @ e6716189 (IC to mint: I5 ADDITIVE) — NEXT BATCH (c20-batch18) after batch17. REC-194 unblocked, NOT spawned (wind-down).
- ROW WORKERS LIVE (push by 06:30-06:40Z): UI-89 session_01WVb7DA8n2nySoZyKzqKR3C · UI-90 session_017i3ve8jwjhLq19sBHCcrWe · D-496 session_011bP9kqUTyWrRzBL7A7jTv8.
  REC-194 HELD (shares statementack code with REC-193).
- Unpaid BOB rulings are ROWS now: REC-211 (DEFINITION_MOVED, write half), D-499 (render wait.fired), D-500 (watermark precision).
- To archive after their tips reach main (ancestry check first): D-493 D-453 M0-144 M0-143 (batch15); D-481 D-494 D-483 D-484 M0-146
  (batch17); D-486, D-64 session_011NsrFb1XMsrK73ukion49o, REC-184 session_0168F3n5XEbnzSJutjKHxZ2t, c18-batch7fix
  session_01Pho5eXgBrQK8TjhnKHW6fa, c19-batch10 session_01WHZuugzaksTkh8G6anyMyh, c19-batch11 session_01FoZ785Cn2MWUSRUCxU42Cz,
  integ1 session_011vBzoPQBRZGhdLUxxiXzPG, batch11fix session_01TcTNdcXz9g85LF9TfQ29Jp (batch13/14). DIST-* are DIST's own session.

## 5. QUOTA PLAN (Bob via BOB #32, 03:00Z)
Until 05:45Z ≤10 live; 05:45Z ≤6 live; 06:45Z spawn NOTHING — finish, push, integrate, train; list to BOB every worker that needs
Bob (exact question + session id), leave them open; write this file for the other account's CONDUCT, verify on the remote, stop.
