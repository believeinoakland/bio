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
No timers; act on messages. ≤8 live workers. NO RELEASES until Bob asks. Refresh at 75%. Flip `queued→running` BEFORE the
spawn; tell SCHEDULER "integrated <ID> <sha>". Never branch a worker from a red integration branch. Union-only ratchets fixed
at integration from printed figures; `Dropped-from-branch:` trailers; regenerate status/dist last; no node_modules in the tree.

## 4. STATE (03:12Z)
- MAIN = 548eb2c5 (train-20260924T024342Z-905). Interfaces on main: I3 81.0.0, I5 3.5.0, I8 1.0.0.
- land/conduct/c19-batch10 @ cff0ede6 — pushed, 10 rows integrated there (D-469 D-351 D-461 D-462 D-464 REC-189 REC-188 UI-86
  D-291 D-66), NOT TRAINED.
- c19-batch11 worker `session_01FoZ785Cn2MWUSRUCxU42Cz` (spawned by #19) — merges REC-192 REC-190 UI-85 UI-83 onto batch10+main.
  ON ITS REPORT: tell SCHEDULER those 4 integrated with shas; TRAIN batch11 onto main (drop every other WAITING).
- LIVE WORKERS spawned by #20 at ~03:07Z, all briefed to PUSH BY 05:45Z and report by one-shot trigger to CONDUCT #20:
  | row | session | base | branch |
  | D-486 | session_01Ae2P1iE8tf4RQTeMT5TaGd | batch10 cff0ede6 | land/worker/D-486 |
  | D-470 | session_01D1Fsz23g9UbhaXAfJ7xxkK | main 548eb2c5 | land/worker/D-470 |
  | D-482 | session_016Q8LfDNJxzG5jMpUZY2h9j | main | land/worker/D-482 |
  | D-487 | session_01QpChQQGWmsxiFychXbmKBX | main | land/worker/D-487 |
  | UI-84 | session_01SSgsMyxUrQACGyUi84gVuT | main | land/worker/UI-84 |
  | REC-185 | session_01CRZ6yfoarqeuJ8F2iGcnHS | main | land/worker/REC-185 |
  | c20-integ1 (D-64, REC-184, M0-141, .gitignore carry) | session_011vBzoPQBRZGhdLUxxiXzPG | batch11 if pushed, else batch10+main | land/conduct/c20-integ1 |
  c20-integ1 renumbers D-64's clone-minted C-82 family (collides with main's C-82) via mintid C; IC-252 (D-64, I3 MAJOR), IC-255 (REC-184).
- Owed on D-64's landing to DIST: teach deploy derivation the `browser` binding class, then add BROWSER binding to
  bio-plane/wrangler.jsonc and newgroup. D-64 findings (a)–(d) and REC-184 findings (1)–(3) are in #19's handoff on coord history
  (coord ae79e9d6) — send to SCHEDULER when integ1 reports if not yet sent.
- DIST owed from batch10 on landing: D-461 SAFETY (store=scratch honoured by bio-pinned ops), D-464 DISCLOSURE, D-462 agent-worker bundle (I8 2.0.0).
- BOB's branches for the next train: land/bob/folds-0924e, land/bob/status-cellcap (not on origin at 03:05Z), land/bob/d461-claude @ f1787108
  — BOB confirms tips. NEVER land/bob/folds-0924c or folds-0924d (superseded). On landing tell SCHEDULER the homes: MEMBER-KNOWLEDGE §5,
  EXTRACTION-BREADTH §2 row 5, OFFICE-FORMATS CSV, Intake §8.
- Stale WAITING refs to drop from every train: c16-batch3, c16-batch6, c18-batch7fix, the land/worker/* already inside batch10/11/integ1.
- D-453 (Oakland identifier-space measurement): network opened FULL ~03:02Z for FRESH sessions; asked SCHEDULER to cache it; spawn it
  in a NEW session, beside the eight.
- To archive after integ1 lands: WORKER D-64 session_011NsrFb1XMsrK73ukion49o, WORKER REC-184 session_0168F3n5XEbnzSJutjKHxZ2t,
  c18-batch7fix session_01Pho5eXgBrQK8TjhnKHW6fa; after batch11 trains: its 4 row workers + batch10/batch11 sessions.

## 5. QUOTA PLAN (Bob via BOB #32, 03:00Z)
Until 05:00Z full speed; 05:00Z ≤6 live; 06:00Z spawn NOTHING — finish, push, integrate, train; list to BOB every worker that needs
Bob (exact question + session id), leave them open; write this file for the other account's CONDUCT, verify on the remote, stop.
