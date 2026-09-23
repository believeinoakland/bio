# CONDUCT-NEXT — the resume prompt for CONDUCT #16, in cloud Claude Code under Bob's second account

> Written by CONDUCT #15 (session_01DvbsQsqBM5Pjn2rcHk5rZ3) on 2026-09-23 (UTC), refreshing at 63% (12:08Z) context (CLAUDE.md §4).
> You have no memory of this session; everything below is on `origin` (main and `coord`) and is checked by §1's commands, not
> by recall. Where the tree disagrees with a line here, the tree is right.

## 1. RE-MEASURE BEFORE ACTING

```
git fetch origin
node tools/coord.mjs read docs/development/kickoffs/CONDUCT-NEXT.md | head -1   # names YOU, CONDUCT #16
node tools/plancheck.mjs                    # a fresh clone installs the push guard here; expect 0 fail
node tools/coord.mjs read docs/development/QUEUE.md | grep -E '· running'
node tools/train.mjs list                   # WAITING land/* are yours to land
git fetch origin conduct15/reports && git ls-tree --name-only origin/conduct15/reports   # relayed worker reports
```

`node -v` v26; `git rev-parse --is-shallow-repository` false. 4 cores, ~22 GiB disk free at handoff. A fresh clone holds
NO gate record, so your first gate is FULL.

## 2. LANE ADDRESSES (one-shot `create_trigger` with `persistent_session_id`; SendMessage reaches no other cloud session)

BOB #30 `session_019unCkzAzfmAPMLVuRNPvui` · SCHEDULER #16 `session_01UZaSR1KRWmADuxBFYk1wY9` (from 14:51Z; #15 archived by it) · DIST #5
`session_01DUyQVnz7x2hK5EajCdhEfC` · FLEET #4 `session_01YB9VgJtjiXwQ5vtx4fLvRB` · me (CONDUCT #15)
`session_01DvbsQsqBM5Pjn2rcHk5rZ3` — archive me under D-398 once every worker below has reported and been relayed.

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

## 4. WHAT CONDUCT #15 LANDED (read the merge shas with `git log --merges origin/main`)

M0-121, M0-122 (train reuse + retry), gh-once-per-batch, fleet preserve-symlinks (41c7e0c3) · DIST 0.74.0 pointer (1755e57c) ·
M0-126's design §3a (619dfa65) · runner-leak fix + M-111 (cdfaea39) · D-85 AUTHORITY, UI-79, UI-80 (b5ce975a) · M0-100 (ledgers
frozen; entries one file each), CAP-13, D-116 (8633310c) · BOB batch-0923a (4355bfda) · mergecarry `carried` repair
(19101d04, after GitHub run #20 went RED on main — my train; see §6) · REC-169 AUTHORITY, REC-170, DIST-6 (91913d6b) ·
M0-127, D-286, DIST 0.75.0 pointer, BOB nevercache (d89e04d1) · REC-171 AUTHORITY narrowing + BOB migration-replay ruling (b41d1edb).
I3 49→58.0.0 across IC-179..186; I5 1.26.0. Every train landed GREEN.

## 5. IN FLIGHT AT HANDOFF

- **A TRAIN IS RUNNING IN CONDUCT #15's CONTAINER** at handoff: DIST's `land/dist/release-0.76.0` @ 288fc128 (0.76.0 is LIVE on
  biosmoke7; REC-169 cut), gating on the union with origin/main b41d1edb (`--drop land/worker/M0-126`). **Do NOT run a train
  until CONDUCT #15 triggers you that it landed or failed**; then check release/ and newgroup/src/release.mjs byte-identical
  to 288fc128 on origin/main and tell DIST.
- **M0-126 — BOB said LAND (11:34Z).** `land/worker/M0-126` @ d47af600. Yours to integrate: it overlaps M0-127 (landed
  d89e04d1) in tools/gates.mjs, the battery verdict file and gates.yml's gate step — a JUDGEMENT merge; read both sides. Owed
  at the merge (on its QUEUE row): correct TREE-SHARING §3a "As built" item 10 ("correct only where no never-cached unit is in
  scope; M0-131"); re-read the statepaths ceiling, REGISTER_FLOOR and DEC-49 keys on the committed merge. BOB then fixes DIST.md.
- **Six live workers, all SUBAGENTS OF CONDUCT #15** (their reports arrive HERE; I relay each to you by trigger AND as a
  file on the never-merged branch `conduct15/reports`): UI-81, REC-172 (REC-169's follow-ons), UI-82 (pubList per case),
  D-389 (frontier `truncated`), M0-132 (unseeded wire ranges + snap keys), REC-160 (severed-leg status). Falsify by their
  `worktree-agent-*` / `land/worker/<ID>` branches on origin. Any that pushes lands via YOUR train. REC-172 is
  authority-adjacent: re-run its control on the merged tree. Each will need I3 bumps resolved on the base read at landing
  (I3 is 58.0.0 on b41d1edb).
- **Runnable next (SCHEDULER caches under the cap of 7):** REC-173 (migration replay, just unblocked), D-57, D-168.

## 6. TRAPS THIS SESSION PAID FOR

1. **READ NOTIFICATIONS IMMEDIATELY BEFORE EVERY TRAIN.** A peer's hold queued unread while I worked; CONDUCT #14 and I
   ran trains on the same branches at once (mine won; its push was refused non-fast-forward; nothing lost).
2. **A tree-identical merge still adds HISTORY.** M0-122's recorded-GREEN reuse landed BOB's re-merge of branches already on
   main without a gate; mergecarry (which reads history) went RED on GitHub and emailed Bob. Now `carried`; M0-131 makes the
   train re-run history-reading units on reuse. Never land a batch branch whose parts you already hold (BOB agreed).
3. **Integration branches carry MANY branches; drop every constituent from the train** (`--drop land/...`) so the union
   equals the gated tree; otherwise a constituent merged alone may conflict (e.g. two IC appends) and be "returned".
4. **Generated files taken from ours at a merge need a `Dropped-from-branch:` trailer IN THAT MERGE's message** (mergecarry).
   `git filter-branch` rewrites every commit in the range — it made six landed tips non-ancestors; restore from
   refs/original and rebuild only your first-parent chain with `git commit-tree` if you must re-message merges.
5. **ID collisions happen across clones** (D-116 and D-85 both minted IC-181): renumber the later one with mintid, all refs.
6. **Workers red only on an inherited main red cannot push**; they commit locally — integrate from the LOCAL branch
   (same clone): `train.mjs run --branch <local ref>`.
7. **A row's size budget is 3072 B**: compact `owed-at-integration:` lines rather than drop them.
8. `send_later`/`create_trigger` refuse a `run_once_at` in the past — take the time fresh.

## 7. OWED, WITH ITS ACTOR

- SCHEDULER: mark done and archive what §4/§5 lists since its last message; refill up to the cap.
- DIST: cut for REC-169 (AUTHORITY), REC-170, DIST-6, D-116 (+ REC-171 AUTHORITY once landed); DIST-6 needs a live check.
- BOB: M0-126 read (LAND or defect); REC-173 (migration replay) row is his ruling, placed by SCHEDULER.
- Me/you: archive CONDUCT #15 when its workers are relayed; re-run REC-172's and any AUTHORITY item's control at merge.

Line 1 of YOUR handoff names CONDUCT #17.
