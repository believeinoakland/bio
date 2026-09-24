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
No timers; act on messages. ≤10 LIVE WORKER SESSIONS (Bob's ruling ~03:08Z via BOB #32; 6 from 05:00Z; none spawned from 06:00Z). NO RELEASES until Bob asks. Refresh at 75%. Flip `queued→running` BEFORE the
spawn; tell SCHEDULER "integrated <ID> <sha>". Never branch a worker from a red integration branch. Union-only ratchets fixed
at integration from printed figures; `Dropped-from-branch:` trailers; regenerate status/dist last; no node_modules in the tree.

## 4. STATE (03:52Z)
- MAIN = 16fe1e7f (train-20260924T033115Z-658: land/bob/status-cellcap 6977d9d2 + folds-0924e 16fe1e7f; 112/112 green). Map budget
  now 49,152 B with CELL_CAP 240 — never raise it. Interfaces on main: I3 81.0.0, I5 3.5.0, I8 1.0.0.
- land/bob/d461-claude RETURNED (conflicts vs main) → merged by c20-batch11fix instead (its CLAUDE.md §5 commit is the novel part).
- land/conduct/c19-batch10 MOVED to 6a3dd8eb at 04:06Z (#19's batch10 worker pushed a PARALLEL union of batch11's rows). SUPERSEDED
  by c20-batch11fix: DROP IT from every train. Archive its session session_01WHZuugzaksTkh8G6anyMyh once batch11fix lands. Its base cff0ede6
  held 10 rows integrated there (D-469 D-351 D-461 D-462 D-464 REC-189 REC-188 UI-86
  D-291 D-66), NOT TRAINED.
- c19-batch11 PUSHED @ 8b7e4bca (03:37Z): REC-192 8646219d, REC-190 c650a697, UI-85 e49f66f8, UI-83 3e3684ee — reported integrated to
  SCHEDULER. I3 84.1.0. ONE inherited red (meaning-bounds floor 43/42: op=resolve hidden in #resolveOne) + IC-246 unresolved (MAJOR)
  → WORKER c20-batch11fix session_01TcTNdcXz9g85LF9TfQ29Jp fixes both, merges current main, pushes land/conduct/c20-batch11fix by
  05:15Z. TRAIN THAT BRANCH (not batch10/batch11 directly). Map bytes vs 49,152 B budget: never raise it; report to BOB.
- LIVE WORKERS spawned by #20 at ~03:07Z, all briefed to PUSH BY 05:45Z and report by one-shot trigger to CONDUCT #20:
  | row | session | base | branch |
  | D-486 | session_01Ae2P1iE8tf4RQTeMT5TaGd | batch10 cff0ede6 | land/worker/D-486 |
  | D-470 | session_01D1Fsz23g9UbhaXAfJ7xxkK | main 548eb2c5 | land/worker/D-470 |
  | D-482 DONE @ c9dc8d96 (96/96, skip 0; findings sent) — WAITING FOR A TRAIN | session_016Q8LfDNJxzG5jMpUZY2h9j | main | land/worker/D-482 |
  | D-479 | session_01TsotUfp91DeCLz8x2n9a8J | main | land/worker/D-479 |
  | D-487 | session_01QpChQQGWmsxiFychXbmKBX | main | land/worker/D-487 |
  | UI-84 | session_01SSgsMyxUrQACGyUi84gVuT | main | land/worker/UI-84 |
  | REC-185 | session_01CRZ6yfoarqeuJ8F2iGcnHS | main | land/worker/REC-185 |
  | c20-integ1 (D-64, REC-184, M0-141, .gitignore carry) | session_011vBzoPQBRZGhdLUxxiXzPG | batch11 if pushed, else batch10+main | land/conduct/c20-integ1 |
  c20-integ1 renumbers D-64's clone-minted C-82 family (collides with main's C-82) via mintid C; IC-252 (D-64, I3 MAJOR), IC-255 (REC-184).
- OWED AT INTEGRATION (BOB #32 rulings ~03:14Z, on the D-64/REC-184 rows at coord a04264b8, sent to c20-integ1 03:17Z): D-64 timeout →
  grade unchanged, completeness UNDETERMINED (`render.wait` records the timeout; reading says "render may be incomplete");
  REC-184 → act carries definitionVersion, refuse DEFINITION_MOVED. If integ1 reports either UNPAID, tell SCHEDULER to row it.
  D-64/REC-184 findings PLACED by SCHEDULER (coord cead06f3: DIST-11, D-490, D-491, UI-99); the allowance
  overrun diagnosed (concurrent admits, not 'one render') and its fix (reserve at admission) sent 03:25Z; incl. the DIST `browser` binding-class row (for the other account).
- Owed on D-64's landing to DIST: teach deploy derivation the `browser` binding class, then add BROWSER binding to
  bio-plane/wrangler.jsonc and newgroup. D-64 findings (a)–(d) and REC-184 findings (1)–(3) are in #19's handoff on coord history
  (coord ae79e9d6) — send to SCHEDULER when integ1 reports if not yet sent.
- DIST owed from batch10 on landing: D-461 SAFETY (store=scratch honoured by bio-pinned ops), D-464 DISCLOSURE, D-462 agent-worker bundle (I8 2.0.0).
- c18-batch7fix REPORTED and DISPOSED (behind main; only .gitignore novel, riding integ1). Findings to SCHEDULER, D-150 design q to BOB.
- Stale WAITING refs to drop from every train: c16-batch3, c16-batch6, c18-batch7fix, the land/worker/* already inside batch10/11/integ1.
- D-166 DONE @ 05ec142e (125/125, skip 0, M-127; premise false — nothing moved; findings sent) — WAITING FOR A TRAIN.
- DIST-9 RUNNING, built by DIST #6 itself (not a CONDUCT slot); flipped at coord 0ab3f2a9.
- 03:43Z flipped INTEGRATED (BOB's rule tonight: flip at the integration merge): REC-192 REC-190 UI-85 UI-83 D-64 REC-184 M0-141.
  D-481 spawned session_01DT8JTdkweNJ78Y3EQxY1qr. QUEUED next: D-484, M0-143, D-493 (branch from land/worker/D-166 @ 05ec142e),
  M0-144. M0-142 waits for batch11fix on main.
- D-453 (Oakland identifier-space measurement) RUNNING beside the eight: session_017L57JtEbWmyk63Ep8SRZoj (fresh, network FULL), branch
  land/worker/D-453, push by 05:45Z. D-166 (Tier 1 probe re-point) RUNNING beside the eight: session_01YVmxTyjL1kajX9Yam7MQgM (fresh), land/worker/D-166.
  Live at 03:12Z = 10/10 (the cap). D-479 spawned 03:35Z into D-482's slot; cache EMPTY of queued rows at 03:35Z (asked SCHEDULER to refill) (D-481, D-484 at the backlog head).
- To archive after integ1 lands: WORKER D-64 session_011NsrFb1XMsrK73ukion49o, WORKER REC-184 session_0168F3n5XEbnzSJutjKHxZ2t,
  c18-batch7fix session_01Pho5eXgBrQK8TjhnKHW6fa; after batch11 trains: its 4 row workers + batch10/batch11 sessions.

## 5. QUOTA PLAN (Bob via BOB #32, 03:00Z)
Until 05:00Z full speed (≤10 live); 05:00Z ≤6 live; 06:00Z spawn NOTHING — finish, push, integrate, train; list to BOB every worker that needs
Bob (exact question + session id), leave them open; write this file for the other account's CONDUCT, verify on the remote, stop.
