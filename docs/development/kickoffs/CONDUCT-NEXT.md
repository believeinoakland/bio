# CONDUCT-NEXT — the resume prompt for CONDUCT #18, in cloud Claude Code

> Written by CONDUCT #17 (session_01RQQSvvqhRfYC4PH1nBZQob) on 2026-09-23 ~22:05Z, refreshing near the 75% line.
> Everything below is on `origin` (main, coord and land/* branches). Where the tree disagrees with a line here, the tree is right.

## 1. RE-MEASURE BEFORE ACTING
```
git fetch origin
node tools/coord.mjs read docs/development/kickoffs/CONDUCT-NEXT.md | head -1   # names YOU, CONDUCT #18
node tools/train.mjs list | grep WAITING
node tools/coord.mjs read docs/development/QUEUE.md | grep -E '^### '
```
Until land/scheduler16/integrated @ 6ea0d504 (CACHE_ROWS 16 at 48 KiB) is on main, run COORD WRITES with that branch's
tools (`git worktree add --detach <dir> origin/land/scheduler16/integrated`, then `node <dir>/tools/coord.mjs write …`):
main's tools refuse the 16-row cache. Workers are told a coord-state plancheck finding (P3/P5/integrated) is not theirs.

## 2. LANE ADDRESSES (one-shot `create_trigger` with `persistent_session_id`; NEVER fire_trigger a routine)
BOB #31 `session_0124NEAbkH3D4rkivNhZtJ8X` · SCHEDULER #17 `session_014MckoGTYSjDfckPqTKUpAp` (SCHEDULER #16 is stopped) ·
DIST #5 `session_01DUyQVnz7x2hK5EajCdhEfC` · me (CONDUCT #17) `session_01RQQSvvqhRfYC4PH1nBZQob` — archive me once the
c17-unionfix train has landed and my workers' reports are routed.

## 3. STANDING RULINGS (today; the prose landing land/bob/message-driven writes them into CONDUCT.md)
- ONLY BOB KEEPS TIMERS. You are woken by MESSAGES: SCHEDULER "rows entered", a worker's done report, a train result, BOB.
  A done report ENDS with a spawn, or a one-line "CONDUCT idle: <why>" to BOB and SCHEDULER.
- SCHEDULER ALONE writes the plan. Your one word: a CACHE row `queued` → `running`, one coord write per cohort, BEFORE spawning.
  Spawn only cache rows. Tell SCHEDULER each row you integrate on a PUSHED batch; it flips it `integrated` (frees the slot).
- Workers are separate CLOUD sessions (create_session, clone_depth 1000, permission auto), gate = own suites + control +
  plancheck, NO gates FULL. The train's union gate is the one full gate. No releases until Bob asks.
- NO WAIVER of a red gate (BOB #31 20:35Z). Union-only ratchets are CORRECTED from the printed figure with the new member
  NAMED at the constant, never exempted (precedents this session: statepaths 63→64, provenance-marker 27→28, versions.test
  basis filter, check-semantics \b, surface-registry 33/29/29).
- BIO_System_Design §3 renders each claim's FIRST SENTENCE (M0-138, landed). NEVER trim a claim text to fit.
- ID COLLISIONS ARE ROUTINE: each cloud clone has its own mintid ledger. At EVERY merge check the branch's new IC/C ids
  against every remote land/* branch; renumber with mintid and a `Dropped-from-branch:` trailer (IC-205 hit three times).

## 4. LANDED BY CONDUCT #17 (merge shas: `git log --merges origin/main`)
02603e88 (21:21Z): land/scheduler16/integrated @ 01fd6c00 (af1ffa3f) + c17-batch2 — REC-179, REC-177, D-440, D-82, D-420,
D-171, D-169, D-60, REC-180, REC-181, D-390, M0-138. I3 67.0.0, I1 1.6.0, I5 1.28.0. SCHEDULER archived all 12.

## 5. IN FLIGHT AT HANDOFF — THE NEXT ACT IS THE c17-unionfix TRAIN
- Train train-20260923T213817Z-16774 (batch4 + scheduler16 @ 6ea0d504 + bob/message-driven @ ca38625a) was RED at bounds,
  derivation-bounds, owed-controls (A13b), statepaths (≤64) and coverage --strict: union-only rosters/floors. NOTHING pushed.
  (An earlier batch3 train was stopped by PID at 21:37Z for the versions.test pin, corrected on batch4.)
- WORKER c17-unionfix `session_01GMjneAHLFsj4DM96PogGz4` (22:04Z) builds `land/conduct/c17-unionfix` = c17-batch5 +
  scheduler16 + bob/message-driven (58f6d4ed), corrects the five with named members, runs gates FULL once, and REPORTS TO
  BOB #31. When pushed: `node tools/train.mjs run` with c17-unionfix ALONE (drop its ancestors: c17-batch3/4/5, c16-batch3/6,
  every land/worker/* it carries). On landing: sha to SCHEDULER #17, BOB, DIST.
- c17-batch5 @ 7c4f6b5f holds batch4 (= batch3's D-219, D-54, D-128, D-278, COFF-13, D-311 + D-84, D-125, D-179, D-220)
  plus D-182, D-178, CAP-14, D-52, REC-161, UI-74. Every IC resolved: I3 72.3.0, I1 1.8.0, I2 2.7.0, I4 2.1.0, I5 1.31.0,
  I8 0.2.0 (IC-207…IC-221; IC-205/211 renumbered). All those rows read `integrated`.
- FINISHED, NOT YET INTEGRATED (branches pushed, sessions still open — archive after integrating):
  REC-182 @ 461dad84 (session_018FMzHFpELmJkPaF4PZpsuQ; IC none; finding: readImage/C-20.1 sort by snap key, fix named).
  CPDF-22 @ 59a0e458 (session_01HD2kKx3HN7LzU9SgzCEvFS; its IC-220 COLLIDES with D-52's IC-220 on batch5 — renumber;
  withdraws image_bound → one `undetermined` shape, I3 MAJOR; add a pointer from IC-204 to the new id).
  Put both on a c17-batch6 cut from c17-unionfix once it is pushed; run nc-d420 and the d420/d440 suites on the union.
- RUNNING cloud workers (report to me; if I am archived they report to BOB, who routes): REC-183, D-443, D-65, REC-164
  (21:48Z); MK-6, M0-71, UI-68, REC-148, D-150, D-148, D-149, REC-149 (22:01Z). Session ids: `get_session` by title
  "WORKER <ID> (CONDUCT #17)" via list_sessions.
- REC-159 is BLOCKED on Bob: my create_session was refused "[Permission Grant]" (21:11Z) after Bob approved it; the ask
  (an attended session Bob opens, or a permission rule) is with BOB. Never route around that refusal.

## 6. TRAPS THIS SESSION PAID FOR
1. A worker gate is its own suites; UNION-ONLY rosters (bounds, derivation-bounds, statepaths, owed-controls, coverage,
   provenance-marker, surface-registry, check-semantics) trip only at the train. Run them on the batch BEFORE the train.
2. Clone-local mintid ledgers collide; always audit a branch's new ids against every remote land/* ref.
3. A merge "exit 0" can still land a branch's edit into the wrong file after a rename (verify the renamed file's content).
4. `create_trigger` run_once_at: read `date -u` first.

Line 1 of YOUR handoff names CONDUCT #19.
