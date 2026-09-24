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

## 4. STATE (07:42Z, #20's wind-down) — read the tree; these are pointers
- BEFORE THAT: 454a02bc (c20-batch18 LANDED 07:05Z, 346/346 green · 19649 assertions: D-481 D-494 DIST-12 D-483 D-484 M0-146 D-495
  REC-193 UI-90 + newgroup-dist-078; IC-263 I3 81.4.0, IC-264 I5 3.6.0, CATALOG_VERSION 1.22.0 = 435 checks). Its eight workers
  ARCHIVED by ancestry. Before: 135abf3b (batch15), d536f834 (batch12).
- MAIN = 6761e903 (c20-batch19 LANDED 07:40Z, 346/346 green · 19659 assertions: UI-89 + D-496; IC-262 ACCEPTED, I3 82.0.0 MAJOR).
  UI-89 and D-496 ARCHIVED by ancestry. D-150 -> UI delegation NARROWED on coord CLAIMS (residue: six STATEMENT_ACK DEC-49 rows).
- c20-batch14 (session_01Ya8PUPivB6xpvV51uhcZa9) REPORTED DONE 08:39Z: @ d026654d, gate GREEN (composite: 104/104 re-run on tree
  8b10a224 + 314 units reused from 7df9d2d5), merged main 454a02bc + batch13 + D-486. Versions I1 1.10.0 · I3 86.3.0 (main's IC-263
  renumbered 81.4.0→86.3.0) · I4 2.2.0 · I5 3.8.0 · CATALOG 1.23.0 = {447, 3309735d…}. IT HAS NOT MERGED 6761e903 (batch19): the
  next merger renumbers IC-262 (I3 82.0.0 MAJOR) to 87.0.0 above 86.3.0, re-reads every ratchet from the print, then batch14 is
  trained ALONE. Its gate verdict is the proof, not its message. DROP from every train: c19-batch10, c19-batch11, c20-integ1
  (broken trailers), c20-integ1b, c20-batch11fix, c20-batch12, c20-batch13, c20-batch16, c20-batch17 (all inside batch14 or on
  main). On batch14 landing: DIST owed D-461 SAFETY, D-464 DISCLOSURE, D-462 agent-worker bundle (I8 2.0.0), DIST-11 browser class.
- To archive after batch14 lands (ancestry check FIRST): D-486 session_01Ae2P1iE8tf4RQTeMT5TaGd, batch13 session_01KXuCWoxFB4aA2GaADwB9E8,
  batch11fix session_01TcTNdcXz9g85LF9TfQ29Jp, integ1 session_011vBzoPQBRZGhdLUxxiXzPG, and #19's: c19-batch11 session_01FoZ785Cn2MWUSRUCxU42Cz,
  c19-batch10 session_01WHZuugzaksTkh8G6anyMyh, REC-184 session_0168F3n5XEbnzSJutjKHxZ2t, UI-83 session_01M3Z9duYEGWXiXM6tnJMntX,
  D-64 session_011NsrFb1XMsrK73ukion49o, REC-190 session_01R1xeKRqknqVPs7yR8j2yQY, UI-85 session_01WaD9mX9VyoE6CQJP7y5HPs,
  REC-192 session_01AQGmdmsmaCKeo5jmMXfgLb, D-462 session_01Ps1kdpY7gtSCEGWohAmUem, D-469 session_01MdtEu1CdMzJYmw268tpfrn,
  D-464 session_01S1yD1KP7nLEPi5EAGnHH8N, D-461 session_01TsJmm3f4seHyFePUKBdRvT. (All IN batch14's tip at 07:06Z by ancestry
  except D-486, batch13, integ1, c19-batch10 — batch14 had not yet merged those.) These sessions are on Bob's FIRST account.
- NEXT RUNNABLE (QUEUE.md is the source): REC-194 (unblocked by REC-193 on main), REC-211, D-499, D-500, REC-212, D-506, M0-153..158,
  DIST-13. No worker of #20's needs Bob.

## 5. QUOTA PLAN (Bob via BOB #32, 03:00Z)
Until 05:45Z ≤10 live; 05:45Z ≤6 live; 06:45Z spawn NOTHING — finish, push, integrate, train; list to BOB every worker that needs
Bob (exact question + session id), leave them open; write this file for the other account's CONDUCT, verify on the remote, stop.
