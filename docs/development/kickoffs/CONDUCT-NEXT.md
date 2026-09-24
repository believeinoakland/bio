# CONDUCT-NEXT — the resume prompt for CONDUCT #20, in cloud Claude Code

> Written by CONDUCT #19 (session_01Kqy1X9xDKa4PAWtmqTaiRx) on 2026-09-24 ~03:05Z, refreshing at 76% context (761,985 / 1,000,000, get_session).
> Everything below is on `origin` (main, coord, land/*). Where the tree disagrees with a line here, the tree is right.

## 1. RE-MEASURE BEFORE ACTING
```
git fetch origin
node tools/train.mjs list | awk '$2=="WAITING"{print $3}'     # field 3 is the branch
node tools/coord.mjs read docs/development/QUEUE.md | grep -E '^### '
```
A TRAIN OF ONE BRANCH: `node tools/train.mjs run $(every other WAITING as --drop …)`. `--drop WAITING` drops nothing.
Ids: D-242's `node tools/mintid.mjs <NS>` (a CAS push to coord) is ON MAIN since 548eb2c5 — clone-local collisions end for
workers branched from main at or past it. Workers branched earlier still collide: check new ids at each merge. Coord floors at
handoff: IC-256 · C-82 · M-126 · D-487.

## 2. LANE ADDRESSES (one-shot `create_trigger` with `persistent_session_id`, run_once_at ~1 min ahead; NEVER fire_trigger)
BOB #32 `session_01HhTF36TQSDaFr9RAxfFnKX` · SCHEDULER #18 `session_01MgL7YDGuxH1F7e3zxx6GSp` · DIST #6
`session_01Vi1XTVwxcBBMStifuBasLZ` · me (CONDUCT #19) — archive me once you have re-measured and confirmed to BOB.

## 3. STANDING RULINGS (CONDUCT.md holds them; BOB #32 at my start)
- No timers of your own; act on a message. Only BOB keeps timers. Every done report ends in a spawn or "CONDUCT idle: <why>" to BOB.
- Trains back to back, everything integrated. ≤8 live workers. NO RELEASES until Bob asks. Refresh at 75% (get_session).
- My words on the plan: `queued→running` (`node tools/coord.mjs write --status <ID> running --note "…"` BEFORE spawning) and
  "integrated <ID> <sha>" to SCHEDULER (it flips).
- LESSON (throughput): a finished row holds its cache slot until INTEGRATED on a PUSHED batch — merge each report onto the
  current batch branch at once (or spawn one integration worker for several), do not queue them behind a train.
- LESSON: a land/* push on a red base is refused by pushguard — never branch a worker from a red integration branch; send
  integration fixes to ONE union worker.
- Union-only ratchets are fixed AT INTEGRATION from the printed figure (refusal-code floors, bounds OPS.size, construct
  3.census, provenance-marker/derivation-bounds/statepaths ceilings, coverage REGISTER_FLOOR). A path taken whole needs a
  `Dropped-from-branch:` trailer in the LAST paragraph (mergecarry.mjs). Corpus `as of` dates current. Regenerate
  `node tools/status.mjs --write` and the dist bundles last.
- NEVER commit node_modules (a SYMLINK is not matched by `node_modules/`): `git ls-tree -r --name-only HEAD | grep node_modules` empty before every push.

## 4. STATE AT HANDOFF
- MAIN = 548eb2c5 (train-20260924T024342Z-905, GREEN tree 5bae378f, land/conduct/c19-unionfix = batch9 + unionfix): 36 rows,
  reported to SCHEDULER #18, BOB (figures) and DIST (disclosures + owed deploy work). Interfaces on main: I3 81.0.0, I5 3.5.0, I8 1.0.0.
- land/conduct/c19-batch10 @ cff0ede6 — PUSHED, 10 rows REPORTED INTEGRATED to SCHEDULER: D-469, D-351 (IC-245), D-461 (IC-250),
  D-462 (IC-253), D-464 (IC-254), REC-189 (+BOB F2 ruling, C-32.19, IC-249 MAJOR), REC-188 (IC-256), UI-86, D-291 (IC-247),
  D-66 (M-126; finding D-481). Interfaces there: I3 83.2.0, I1 1.9.0, I8 2.0.0. NOT YET TRAINED.
- c19-batch11 worker `session_01FoZ785Cn2MWUSRUCxU42Cz` — RUNNING: builds on batch10 + main 548eb2c5, merging REC-192 (IC-248),
  REC-190 (IC-251), UI-85, UI-83. ON ITS REPORT: tell SCHEDULER those 4 integrated with shas, then TRAIN batch11 ALONE onto
  main (the gate is the real test; fix ratchets from the printed figures). ON LANDING: rows+sha to SCHEDULER, figures to BOB,
  DIST (D-461 SAFETY: store=scratch honoured by bio-pinned ops; D-464 DISCLOSURE; D-462 agent-worker bundle, I8 2.0.0; D-64
  Browser Rendering binding when D-64 lands).
- CARRY into the next train batch: `bio-plane/.gitignore` → `node_modules` without the slash (from c18-batch7fix 5d9026bb,
  the only novel piece of that branch; the rest re-did the c17-batch7 union, superseded by batch9+unionfix, its IC-252
  superseded by IC-246). Take BY HAND, do not merge the branch. Then archive c18-batch7fix `session_01Pho5eXgBrQK8TjhnKHW6fa`.
- LIVE WORKERS (3/8): D-64 (IC-252 pre-minted — note coord's IC-252 was ALSO written by c18-batch7fix's text; the coord
  ledger is the authority, check it), REC-184 (IC-255 pre-minted), c19-batch11. 5 slots free; cache was empty — waiting on
  SCHEDULER #18's refill after the flips.
- M0-141 (WORKER.md corpuscheck line) is placed — take it with the next batch.
- BOB's branches ride the next train: land/bob/folds-0924e (built on the new main) and land/bob/status-cellcap (map cell cap
  (b) + budget back to 49,152 B). DO NOT take folds-0924c/0924d (they revert CORPUS-STANDARD §6). On landing tell SCHEDULER the
  homes: MEMBER-KNOWLEDGE §5, EXTRACTION-BREADTH §2 row 5, OFFICE-FORMATS CSV, Intake §8.
- Stale land/* in the train list (land/conduct/c16-batch3, c16-batch6, the land/worker/* already in batch10, land/bob/d461-claude,
  folds-0924c/d): drop them from every train; the batch branch carries the workers.
- ARCHIVED by me (idle, tip an ancestor of main or superseded): D-242 CAP-11 D-452 D-260 REC-187 REC-198 D-162 D-176
  c19-unionfix c19-capfix. Earlier: batch10's finished workers per my report. REC-159's session is BOB's to archive.

## 5. WORKTREES (my container; gone with it)
/home/user/wtrain (train; real npm ci) · w8 (batch9 builder) · w242 (D-242 minter) · wg, wh (gates). Nothing unpushed in them.

## 6. ARRIVED AFTER THE HANDOFF WAS WRITTEN (03:02Z) — integrate at once (finished rows hold cache slots)
- D-64 DONE: land/worker/D-64 @ b1ffb5a0 (base main 15b2a4c0). Gate: 323/323 suites green · 18627 assertions, skip 0.
  IC-252 (coord-minted, OK): I1 MINOR, I5 MINOR (table render_allowance); I3 MINOR or MAJOR is yours. Edge: a non-boolean
  `render` was ignored and is now refused 400; no caller sends it. By IC-25's test that is MAJOR.
  ID COLLISION: its refusal family RENDER_CAPTURE_CHECKS is numbered C-82.1..7, minted clone-locally. MAIN 548eb2c5 already
  holds C-82 (unionfix, STATEMENT_ACK_CHECKS). Mint a new C with `node tools/mintid.mjs C` and renumber D-64 at every literal
  site: the rows, the suite's pin, claim 2.rendered text, IC-252, the check-refusal-codes floor notes. Its floors (families
  +1, rows +7, regions +2, regionLines +68…) are re-read from the union's --strict print.
  Findings for SCHEDULER: (a) no renderer exists (fix: @cloudflare/puppeteer behind rendererFor(env.BROWSER), or a RENDER
  fleet member); (b) sweep deferral NARROWED (fix: `render` column on capture_requests through captureRequestDrain →
  #fireCaptureRequest, held as RENDER_DEFERRED); (c) DESIGN GAP for BOB: CLIENT-RENDERED.md §What must be recorded — does a
  wait that fired on TIMEOUT make the capture undetermined?; (d) the allowance can overrun by one render (stated).
  DIST OWES at landing: teach the deploy derivation the `browser` binding class (it refuses UNKNOWN_BINDING_CLASS today), then
  add "browser": {"binding":"BROWSER"} to bio-plane/wrangler.jsonc and to newgroup. Live today: every render:true answers
  501 RENDER_NO_RENDERER.
  Session: archive after integration (its id is in the report trigger trig_01PyovCeTTBxucrykFtGGy7F; find it with list_sessions, title WORKER D-64).
- REC-184 DONE: land/worker/REC-184 @ 36b1f505 (base main 15b2a4c0). Gate GREEN (run 2 FULLREUSE; run 1 was 321/322, with a
  status date fixed in 36b1f505), skip 0, no refusal code minted, no floor moved. IC-255 (coord-minted): I5 + I3 MINOR
  ADDITIVE on the wire, with ONE behaviour change: a pre-revision disposition no longer ages a revised definition's
  proposal. Classify it; IC-25 asks whether any answer that stood now refuses — none does, so MINOR. Name the column on
  INTERFACES I5's proposal_dispositions line at the bump.
  Findings for SCHEDULER: (1) RACE — the act stamps the version at the act, not the version the member saw (fix: accept
  definitionVersion, refuse DEFINITION_MOVED; the UI sends it) — BOB may want the design call, framework §8.2; (2) UI shows
  none of the new keys; (3) D-128's UI basis field is still NOT BUILT.
- With these two finished, the ONLY live worker is c19-batch11. Spawn ONE integration worker: branch from batch11's tip when it
  pushes, or from batch10 cff0ede6 + main 548eb2c5 if you do not want to wait. It merges D-64 + REC-184 + the .gitignore carry
  + M0-141, and reports; then you report D-64 and REC-184 integrated to SCHEDULER.

## 7. SCHEDULER #18 REFILL (03:00Z, coord 5d728c22) — SPAWN FIRST, it is the biggest waste while idle
batch10's 10 rows are flipped integrated. Cache = 16: running UI-85 REC-192 REC-190 (inside c19-batch11), D-64 REC-184 (both
DONE, §6), UI-83; QUEUED in order: D-486, D-470, D-481, D-484, D-482, M0-141, D-487, UI-84, D-483, REC-185.
Live workers = 1 (c19-batch11) → up to 7 spawns. Branch D-486 from land/conduct/c19-batch10 (same count readers as D-464);
D-481 from batch10 if it needs M-126. M0-141 can ride the §6 integration worker instead of its own slot.
Backlog waiting on main: D-480 D-472 D-476 D-479 D-475 D-478 — they enter when batch10/11 trains onto main, so the batch11 train
also unblocks the next refill.
Brief template: my scratchpad is gone with the container; CONDUCT.md's worker brief + the fields in §3 here are the source.

## 8. QUOTA SCHEDULE — Bob via BOB #32, 03:00Z (this account's weekly quota 80%, exhausted tonight; OVERRIDES §7's pace)
- until 05:00Z: full speed. 05:00Z (90%): ≤6 concurrent workers (BOB confirms by message).
- 06:00Z (95%): spawn NOTHING. Help every running worker finish, commit, push; integrate and TRAIN what is built. Send BOB the
  list of workers that cannot finish without Bob, each with its EXACT question; leave those OPEN. Then write CONDUCT-NEXT on
  coord for a CONDUCT on Bob's OTHER account, verify it on the remote, stop.
- FROM NOW: keep CONDUCT-NEXT current at every train (an abrupt cutoff loses nothing). Prefer LANDING what is built: the
  batch11 train and the §6 integration (D-64, REC-184) come before new spawns; any spawn must be a row that FINISHES before 06:00Z.
