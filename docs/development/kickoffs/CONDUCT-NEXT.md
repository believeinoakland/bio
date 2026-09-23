# CONDUCT-NEXT — the resume prompt for CONDUCT #17, in cloud Claude Code under Bob's second account

> Written by CONDUCT #16 (session_01DEAp94ny3PfWr6deFJtTaD) on 2026-09-23 ~19:35Z, refreshing at 69% context (the line is 75%).
> Everything below is on `origin` (main and `coord`); where the tree disagrees with a line here, the tree is right.

## 1. RE-MEASURE BEFORE ACTING

```
git fetch origin
node tools/coord.mjs read docs/development/kickoffs/CONDUCT-NEXT.md | head -1   # names YOU, CONDUCT #17
node tools/train.mjs list                   # WAITING land/* ; LANDED by ancestry
node tools/coord.mjs read docs/development/QUEUE.md | grep -E '^### '
```
Run coord writes and plancheck from a worktree at CURRENT origin/main — a checkout at an old tree carries the old `CACHE_ROWS 8`
and coord refuses its writes (P3). `node -v` v26; not shallow.

## 2. LANE ADDRESSES (one-shot `create_trigger` with `persistent_session_id`)

BOB #31 `session_0124NEAbkH3D4rkivNhZtJ8X` · SCHEDULER #16 `session_01UZaSR1KRWmADuxBFYk1wY9` · DIST #5
`session_01DUyQVnz7x2hK5EajCdhEfC` · FLEET #4 `session_01YB9VgJtjiXwQ5vtx4fLvRB` · me (CONDUCT #16) `session_01DEAp94ny3PfWr6deFJtTaD`
— archive me under D-398 once the train below has landed and my local workers are integrated or handed over.

## 3. STANDING RULINGS THAT BIND YOU (each on main or on its row)

- **THE CAP OF 7 IS LIFTED** (Bob, relayed by BOB #30 at 13:19Z on 2026-09-23: *"Don't sever to preserve or spread out token
  usage. We're good."* — two Max 20x accounts, refreshing Saturday and Tuesday). Waves are sized by the machine and the work: CONDUCT.md's budget of 8, at most 5 on store/checks/index, and disk.
- **Ruling (c), confirmed both ways today:** GitHub gates run ONLY on `main` (one run per landed batch). A `land/*` branch
  based on ≥ 41c7e0c3 fires no run. Every red run on main emails Bob.
- **M0-126 HOLD (its QUEUE row carries it):** before ANY train takes `land/worker/M0-126`, trigger BOB #30 with its tip;
  every train `--drop`s it until BOB answers LAND or names a defect. It was sent to BOB at 11:13Z (tip d47af600).
- **TREE-SHARING §3a (landed):** a unit reading git history or a live ref is `GATE: never-cache (history)`; a release cut
  relies only on a FULL run that REUSED NOTHING.
- **mergecarry's `carried` class (19101d04, BOB #30's design):** a merge that kept main's bytes which already HOLD the branch's
  change is counted, never failed. Never register a KNOWN_HISTORICAL_DROPS row for a drop that did not happen.
- **TRAIN CADENCE ~2 HOURS, EVERY WAITING land/* BRANCH** (BOB #30's ruling, 13:40Z 2026-09-23; home TREE-SHARING §2 and
  CONDUCT.md on `land/bob/batch-cadence` @ 7b16b393, riding the next scheduled train). Own train ONLY for: a CUT-NOW security
  release, a red-main repair, a landing a running worker or release is blocked on, or Bob asks — named in the train's commit.
  Measured before: 13 trains 05:25Z–12:54Z, 6 carrying one branch. RE-MEASURE after a day (trains/day, branches/train, gate
  minutes, red batches) and report to BOB. CONDUCT #16's trains: 12:58Z (batch1, 4 items), 13:26Z (batch2, REC-160, started
  before the ruling); first scheduled train ~15:30Z.
- **SPAWNING IS CONTINUOUS; ONLY LANDING IS ON THE 2-HOUR CADENCE** (BOB #30, 16:22Z 2026-09-23, on Bob's complaint that lanes
  sat idle). Fill every empty slot from the cache the moment it frees; wake at least every ~20 minutes and on each report; there
  is NO budget cap (Bob); the machine's limit is CONDUCT.md's 8 with at most 5 on store/checks/index. CONDUCT #16 left seven slots
  empty 15:00Z–16:22Z by misreading the train cadence as a wake cadence — do not repeat it. The refresh line is 80% (BOB #30, 15:05Z).
- **LOCAL CAP ~4 CONCURRENT GATES, ONE PER CORE; OVERFLOW TO CLOUD SESSIONS ON A MEASURED TRIAL** (BOB #30, 17:50Z 2026-09-23).
  Measured 17:46Z: 8 concurrent gates (7 workers + a train) on 4 cores ran load 12.8 (3.3x), no worker reported in ~80 min, and
  a 24-suite never-cached run took 1388 s. The next spawn runs as ONE separate cloud session (create_session, own container,
  pushes land/worker/<ID>, triggers CONDUCT); if its wall time beats local, the rest of the queue goes that way. Report the
  trial's wall time to BOB.
- **ONE FULL GATE PER TRAIN** (BOB #30 on Bob's ruling, 18:08Z 2026-09-23). A worker runs ONLY the suites its row names (its new or
  changed suite, the named negative control, plancheck) through the battery by name, and does NOT run `gates.mjs` FULL before
  pushing land/* (verified: the push guard accepts land/* with no local GREEN — c16-batch1..5 were pushed ungated). The train's
  union gate is the one full gate; on a red union name the failing unit from the per-unit record (M0-126) before `--isolate`,
  return the branch whose diff that unit reads, land the rest. MEASURE after a day: full-gate runs per landed row; red unions
  and their re-gate minutes. **REFRESH LINE 75%** (auto-compaction fires ~79%; BOB #30, same message).
- **CLOUD-SESSION WORKERS ARE THE DEFAULT PAST ~4 LOCAL GATES** (BOB #30's 17:50Z approval; trial measured 2026-09-23): REC-178 as
  one cloud session went start 18:47:53Z → push 18:59:16Z (~11.5 min, own suites only) against 1h45m–2h35m+ for local workers
  under 8 concurrent FULL gates. D-82, D-423, D-420 went out as cloud sessions at 19:05Z. Brief: create_session (source_url,
  clone_depth 1000, auto), branch land/worker/<ID> from origin/main, own suites + control + plancheck only, report by one-shot
  create_trigger into CONDUCT; archive each after its branch is integrated. Coord writes from a worktree at current main
  (the main checkout lags; its ledger.mjs refused CACHE_ROWS 12).

## 4. WHAT CONDUCT #16 LANDED (merge shas: `git log --merges origin/main`)

e62e08e1 M0-126, UI-81, D-389, UI-82 · 14faa089 REC-160 · 0e7cc03e REC-172, REC-173, M0-130, M0-131, M0-132, M0-134, REC-174 + BOB
cadence · 38b49c50 DIST 0.78.0 pointer (own CUT-NOW train) · 0e5f7054 REC-175, SCHEDULER cache-size (CACHE_ROWS 12), BOB spawn rulings.
I3 went 58.0.0 → 60.0.0 on main; I5 1.27.0. Six ID COLLISIONS renumbered with mintid (IC-188→191, IC-190→192, M-115→116, IC-196→199 …):
workers mint in separate clones — ALWAYS grep the batch for the proposed id before resolving.

## 5. IN FLIGHT AT HANDOFF

- **TRAIN RUNNING** (started 19:32Z, in `/home/user/c16`): land/conduct/c16-batch7 @ fa5d0a10 + land/bob/spawn-continuous @ 48614e29
  over main 0e5f7054. Batch7 = M0-136, D-57 (IC-194), REC-176 (IC-193 MAJOR), REC-178 (IC-196 MAJOR), D-168 (IC-199, renumbered),
  D-423, UI-73 → I3 63.0.0. (c16-batch6 is SUPERSEDED by batch7 — same trees, REC-178's merge re-messaged with its carried-path
  trailers; drop batch6 and batch3.) When it lands: sha to SCHEDULER (those 7 done; REC-180, REC-181 then enter the cache); DIST at
  the daily cut (≥ 2026-09-24 ~17:00Z): REC-176's snap-key census op + op=digestcensus incl. bytes_disagree, and the corrected livefire.mjs.
- **FINISHED, NOT YET INTEGRATED — yours, onto a batch on the landed main:** REC-179 @ 263cab65 (IC-197 MAJOR; authority path:
  re-run its control; its report names D-78's first-line restamp bypass and the late-refusal class for SCHEDULER), D-440 @ 729203da
  (IC-198, I5 capture_format; C-45.11), D-420 @ 16a160dc (IC-203 I1, IC-204 I3; C-45.12; collides textually with D-440 in the image
  arm — integrate D-440 first), D-82 @ 803556f6 (civicos-ui; CIVICOS_UI_STATE v102 collides with UI-73's v102 → renumber v103),
  REC-177 @ 02ed34dc (pushed; its report never arrived — read the branch and its claim; authority path: re-run REC-172/REC-169's
  controls). Every one of these is DROPPED from the running train. Re-read DEC-49 floors from the merged print at each; check the
  BIO_System_Design reading budget (49152 B) after each status re-render.
- **CLOUD SESSIONS to archive once integrated:** D-82 `session_01Fv8G2PsbJdw5h6QK9iugga`, D-420 `session_01E2jFNbEfTcUGomdGRpeagZ`.
- **LOCAL workers:** all have reported except REC-177 (see above). Worktrees under /home/user/bio/.claude/worktrees are locked by my
  pid; they release when I am archived.
- **Refill wakes** :05/:25/:45 are MY session's routines (trig_01L2gq4FZgrUaVTzfbgkKU3e, trig_016gMZin2aCsFRWsxfgGZffP,
  trig_01KsgTeDb5tq2SiJmcDB4sDb): re-create them for yours, then delete mine. The next scheduled train is yours to arm (~21:30Z).
- **REC-177 REPORTED at ~19:36Z (after the handoff above was written): tip is 259a88cb, not 02ed34dc.** op=airunopen refuses a declared
  bound with no or zero allowance, AI_RUN_BOUND_NO_ALLOWANCE (C-22.16; the number was taken from the family, not mintid — check no other
  branch holds it). IC-195 proposed MAJOR (base read 59.2.0). Owed: resolve IC-195; re-run rec177-allowance.control (5 arms),
  rec172-bounds.control and rec169-consume.control on the merge; re-read DEC-49 floors from the merged print (it and D-168 both moved
  them). Its worker gated FULL (spawned before the one-gate rule).

## 6. TRAPS THIS SESSION PAID FOR

1. **A two-hour train cadence is not a two-hour wake.** Slots sat empty 15:00–16:22Z. Spawn continuously.
2. **Eight local FULL gates on 4 cores stalled everything** (load 13, no report in 80 min). One full gate per train; cloud sessions.
3. **mergecarry's `carried` misses a branch that merged main once your side moved further**: declare each path with a
   `Dropped-from-branch:` trailer in a FINAL paragraph of its own (git ignores trailers in a paragraph with prose).
4. **A worker gating only its own suites leaves union-level checks to the train** (hygiene's walker list caught rec178-bytes on the
   batch). Run hygiene, the DEC-49 guard, plancheck and status --check on every batch before pushing it.
5. **Rendered claim texts count against BIO_System_Design's budget** — keep new construct-status `text` short.
6. `create_trigger` `run_once_at`: read `date -u` first (I twice scheduled peers 30 min late).

Line 1 of YOUR handoff names CONDUCT #18.
