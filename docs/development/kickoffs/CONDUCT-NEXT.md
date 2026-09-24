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

## 4. STATE (05:17Z)
- MAIN = d536f834 (train-20260924T044500Z-4275: c20-batch12 = D-470 D-487 UI-84 D-479; I3 81.3.0; workers archived). Before: 0fdef669 (train-20260924T041650Z-598: D-482 61b5ceca, D-166 958ad9ac, REC-185 0fdef669 — reported). Before it 16fe1e7f (train-20260924T033115Z-658: land/bob/status-cellcap 6977d9d2 + folds-0924e 16fe1e7f; 112/112 green). Map budget
  now 49,152 B with CELL_CAP 240 — never raise it. Interfaces on main: I3 81.0.0, I5 3.5.0, I8 1.0.0.
- land/bob/d461-claude RETURNED (conflicts vs main) → merged by c20-batch11fix instead (its CLAUDE.md §5 commit is the novel part).
- land/conduct/c19-batch10 MOVED to 6a3dd8eb at 04:06Z (#19's batch10 worker pushed a PARALLEL union of batch11's rows). SUPERSEDED
  by c20-batch11fix: DROP IT from every train. Archive its session session_01WHZuugzaksTkh8G6anyMyh once batch11fix lands. Its base cff0ede6
  held 10 rows integrated there (D-469 D-351 D-461 D-462 D-464 REC-189 REC-188 UI-86
  D-291 D-66), NOT TRAINED.
- c20-batch11fix GREEN @ 54415fcb (04:44Z; full 347/347): batch10+11's 14 rows + d461-claude on main 16fe1e7f; I3 85.0.0
  (IC-246 MAJOR); meaning-bounds BARE 44. It CONFLICTS with c20-batch12 in 6 files → WORKER c20-batch13 session_01KXuCWoxFB4aA2GaADwB9E8
  (spawned 04:47Z) merges batch12 onto it (IC-259/260/257 → 85.1/85.2/85.3.0, ratchets re-read), full gate, pushes by 05:40Z.
  TRAIN land/conduct/c20-batch13 (drop batch10, batch11, batch11fix, batch12 refs). ON LANDING: DIST owed D-461 SAFETY
  (store=scratch honoured by bio-pinned ops), D-464 DISCLOSURE, D-462 agent-worker bundle (I8 2.0.0), D-64 BROWSER class (DIST-11).
- c20-integ1 REPORTED GREEN on land/conduct/c20-integ1b @ 4ed8616c (full 347/347 RECORDED; renderAdmit docstring PAID there): D-64 + REC-184 + M0-141 + .gitignore; D-64's family
  is C-83. NEVER train land/conduct/c20-integ1 (cb2a35aa, broken trailers; undeletable) — drop it. integ1b re-did batch10+main
  in parallel with batch11fix and numbers ICs on batch10 (84.x): WORKER c20-batch14 session_01Ya8PUPivB6xpvV51uhcZa9 (04:53Z)
  moves its content onto batch11fix (IC-252 → I3 86.0.0 MAJOR, IC-255 → 86.1.0), merges batch13 when pushed, adds the
  renderAdmit docstring fix; push by 06:15Z. FINAL TRAIN = land/conduct/c20-batch14 if it carries batch13, else batch13 then 14.
  BOB's two owed rulings (D-64 timeout, REC-184 DEFINITION_MOVED) were NOT paid → sent to SCHEDULER 04:56Z to row.
- M0-146 @ 3f939f53 built the `.scratch/` ignored path BOB RULED AGAINST (05:04Z) — NOT TRAINABLE as is; sent back 05:33Z to rework
  (scratch in the session scratchpad, WORKER.md under 24,576 B, JSDoc sentence); push by 06:30Z. If not reworked, carry the row.
- D-494 DONE @ 6283fe29 (96/96; 18=18 fences) — next small train. D-496 spawned 05:31Z (push by 06:40Z).
- D-481 DONE @ dbe88ab9 (343/343, M-133; rebuilt plane+pdf+ocr dists) — NEXT TRAIN after batch15; fold its §16 limit (Content
  Framework) at integration. UI-90 spawned session_017i3ve8jwjhLq19sBHCcrWe 05:19Z. M-126 lives on batch11fix (not a defect).
- REC-193 spawned session_01F4H89NyikAfnwK5a5p8jHD at 05:03Z (push by 06:30Z). D-494 spawned session_01SfuiqkhBjwWXAtsg8Ny6P5 05:06Z.
  REC-194 HELD (same statementack code as REC-193). M0-144 DONE @ 7833f860 (265/265, no id); M0-143 DONE @ c8a40639 (M-134) — NEXT SMALL TRAIN = D-493, M0-144,
  M0-143, D-453, DIST-9 (+ IC for DIST-9's I8 MINOR). UI-89 spawned 05:10Z (push by 06:30Z).
- D-486 DONE @ 9fcf876e (base batch10; IC-258 → resolve I3 86.2.0 MINOR on batch14; C-84 minted UNUSED): told c20-batch14 to merge it.
  Its watermark design question is with BOB (05:01Z). DIST-12 flipped running, DIST #6 builds it (push by 05:50Z).
- ARCHIVE RULE (Bob via BOB 04:58Z): the moment a train lands, archive every worker whose land/worker tip is an ancestor of the new main
  (`git merge-base --is-ancestor`, never by title), same turn. A worker whose work did not land stays open and is named here.
- DIST-9 DONE: land/dist/DIST-9 @ 41c195d5 (326/326; 15.instance-ai-secret BUILT; I8 additive — classify at its train, mint an IC).
  Train it with D-493 right after batch12 lands.
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
- TRAIN RUNNING 05:15Z: land/conduct/c20-batch15 @ 83b83f00 (worktree /home/user/w12; log train4.log) = main d536f834 + D-493 M0-144
  M0-143 D-453 DIST-9 (flipped integrated), IC-261 I4 MINOR 2.2.0 (row said I8 — wrong interface, stated). ON LANDING: archive their
  workers (D-493 session_01XknYRN5Zzyw2fU3nRqF8F9, M0-144 session_01ERbJKhXFUofstFpHerqrEx, M0-143 session_01M7BzVNbCiY4Q4dqVLxDvUw,
  D-453 session_017L57JtEbWmyk63Ep8SRZoj) after ancestry check; DIST-9 is DIST's own session (not archived).
- UI-84 DONE @ 8f8b7be7 (124/124, M-130, no IC) — NEXT TRAIN. M0-144 spawned session_01ERbJKhXFUofstFpHerqrEx into its slot.
- D-487 DONE @ 14e9140d (101/101, M-128, no IC) — NEXT TRAIN. BOB asked: knock limiter bound or budget (sliding-window fix named).
  D-493 spawned session_01XknYRN5Zzyw2fU3nRqF8F9 from land/worker/D-166 into its slot.
- D-470 DONE @ 8344367c (102/102, skip 0) — NEXT TRAIN. OWED at its integration: mint its IC (I3 MINOR, gateVersion string
  1.20.0→1.21.0) and fold its design gap into BIO_Publication_v0_1.md §3 Incomplete ("the catalogue version must move with the
  catalogue" is stated nowhere; rule sent to BOB). M0-143 spawned session_01M7BzVNbCiY4Q4dqVLxDvUw into its slot.
- REC-185 DONE @ 72757288 (343/343, IC-257, M-129; findings sent). D-484 spawned session_014Ef8JECzL8eJFPhut7GVed into its slot.
- D-166 DONE @ 05ec142e (125/125, skip 0, M-127; premise false — nothing moved; findings sent) — WAITING FOR A TRAIN.
- DIST-9 RUNNING, built by DIST #6 itself (not a CONDUCT slot); flipped at coord 0ab3f2a9.
- 03:43Z flipped INTEGRATED (BOB's rule tonight: flip at the integration merge): REC-192 REC-190 UI-85 UI-83 D-64 REC-184 M0-141.
  D-481 spawned session_01DT8JTdkweNJ78Y3EQxY1qr. QUEUED next: D-484, M0-143, D-493 (branch from land/worker/D-166 @ 05ec142e),
  M0-144. M0-142 waits for batch11fix on main.
- D-453 DONE: land/worker/D-453 @ 5f4a5914 (M-132; base 548eb2c5; report went to BOB) — next small train. D-495 spawned 05:08Z into its slot.
  D-486 watermark RULED by BOB 05:05Z: stays viewer-independent; the precision race is the defect (SCHEDULER rows it). D-166 (Tier 1 probe re-point) RUNNING beside the eight: session_01YVmxTyjL1kajX9Yam7MQgM (fresh), land/worker/D-166.
  Live at 03:12Z = 10/10 (the cap). D-479 spawned 03:35Z into D-482's slot; cache EMPTY of queued rows at 03:35Z (asked SCHEDULER to refill) (D-481, D-484 at the backlog head).
- To archive after integ1 lands: WORKER D-64 session_011NsrFb1XMsrK73ukion49o, WORKER REC-184 session_0168F3n5XEbnzSJutjKHxZ2t,
  c18-batch7fix session_01Pho5eXgBrQK8TjhnKHW6fa; after batch11 trains: its 4 row workers + batch10/batch11 sessions.

## 5. QUOTA PLAN (Bob via BOB #32, 03:00Z)
Until 05:45Z ≤10 live; 05:45Z ≤6 live; 06:45Z spawn NOTHING — finish, push, integrate, train; list to BOB every worker that needs
Bob (exact question + session id), leave them open; write this file for the other account's CONDUCT, verify on the remote, stop.
