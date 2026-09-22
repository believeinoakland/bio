# SCHEDULER-NEXT — the resume for SCHEDULER #11 (written 2026-09-21 by SCHEDULER #10 at its refresh)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its "Mechanics learned" section is the practical half), then
`docs/architecture/BIO_System_Design.md` **whole**, then this, then `QUEUE.md` and `BACKLOG.md` whole. Everything below
was MEASURED at `origin/main` `8d9fa057` (~03:45Z 2026-09-22). It is a POINTER: re-measure before you rest anything on
it. The refresh line is **70%** (`CLAUDE.md` §4); I refreshed at ~58% because the acts waiting (two completions, six
placements) and a handoff would have crossed it mid-flight.

## The plan, as I left it

- **Cache (8):** LED-7 (this lane's own act, never a worker slot) · REC-157 (`running`; FINISHED on its branch @
  `536da3db`, CONDUCT #11 integrates it next) · M0-97 and D-341 (`running`, ONE worker) · M0-81 (waits on DISK) ·
  D-293 (`running`; its landing with M0-98 is READY on `conduct11/d293` @ `ab34197b`, FULL gate GREEN, and CONDUCT #11's
  push to `main` was REFUSED by the permission layer at 03:11Z: the operator decides it, and no lane pushes it for them)
  · M0-99 (after M0-97 and D-341, the same file) · M0-100.
- **Backlog (100), top:** M0-98 (blocked; CLOSE IT WITH D-293), M0-101 (waits on M0-100), REC-163, UI-77 (waits on
  REC-163), **REC-165** (a production can name a run its caller does not hold; placed today, so the SECOND row refills
  move), **D-85** (after it), M0-84, M0-85 (blocked), D-412, REC-154, CPDF-21, M0-82, D-116, CAP-13, D-389 …
- **`BACKLOG.md` is 153,449 B of 153,600.** Seven more rows at the foot were cut to their fields today (D-394 up to
  REC-149), each VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. **Prefer placing as completions free
  room**: closing D-293 with M0-98 frees ~3.8 KB (M0-98 archived, REC-163 refilled).
- **DEBT.md: 117 open rows** (139 when I opened). **BOB INBOX: empty.** The one open DELEGATION this lane sent is
  SCHEDULER (#8) -> BOB, which only Q3 (D-53, with Bob) keeps open.

## Owed acts, in order

0. **CONDUCT's completions, each ONE commit** (the landing sha an ancestor of `origin/main` AND the row's work read at the
   code; `done`, `ledger.mjs archive`, `refill`, invariants; tell CONDUCT what entered): **D-293 with M0-98** (check
   `tools/gates.mjs` records a verdict per clean tree and has a TARGETED class and `--since`, and `tools/pushguard.mjs`
   refuses a RED record), then REC-157, then M0-97 with D-341.
1. **SIX PLACEMENTS, VERIFIED AT THE CODE ON `7a8b81d6`, WAITING ONLY FOR ROOM.** The whole rows are on a branch, never
   merged: `git show origin/scheduler10/row-drafts:row-drafts/<ID>.md`. Re-verify each, then place it with its DEBT
   row archived as PLACED (the door-2 form in `DEBT-closed.md`, e.g. D-420): **D-82** after UI-73 and **D-380** after
   M0-94 first (they fit the room D-293's close frees), then **D-65** after D-60, **D-74** after D-126, **D-86** after
   D-394, **D-66** after FW-20.
2. **A TRIGGER ADDRESSED TO THIS LANE** (BOB #25, the Framework's front matter, §12): schedule the intent layer's DESIGN
   act (send it to BOB) when `node tools/status.mjs 12` reads the publication ceremony and the accept surface BUILT, or
   earlier on Bob's word. Check it whenever a UI row closes.
3. **LED-7, one landing per wake.** Next, verified in part and not yet dispositioned: **D-152** (CPDF-9 and CPDF-10 done;
   check `text_source: 'ocr'` and a leg's image region, then close in fact); **D-164** (Bob reopened it; construct
   4.edge reads its central gap CLOSED and Framework §18's six pieces are each designed: ask BOB, in a group, whether its
   reopening condition is met); **D-125** (a `queue_state` with a member-chosen snooze and muted kinds is BUILT under
   P-87, which differs from the row: compare, then close or narrow); **D-140** (read `op=queue`'s items for `class` and
   `case`); **D-160** (`RECONCILED.md` now says SUSPEND 26 times and UNRATED 7; REC-12 is done). D-121 and D-124 are
   COLLIDED ids (LED-8); D-64's four questions are BOB's; D-53 is with Bob.

## Done this session (all verified on the remote)

Archived SCHEDULER #9 (D-398's three conditions at the moment of acting; its CronList empty by message; worktree removed,
+653 MiB). LED-7 S10-1 (`18d50de5`) and S10-2 (`87638b13`), and BOB #25's answers drained (`8d9fa057`): 22 rows out of
DEBT: 8 in fact, 8 by the third door, 1 superseded, 4 onto the rows that carry their work, and D-85 placed. A group of three sent to BOB
and answered within the hour. REC-165 and D-85 placed.

## The traps this session paid for

1. **A lane mid-refresh pushes its `-NEXT` without being asked**: BOB #24's and DIST #3's handoffs each moved `main` under
   one of my gates (a non-fast-forward, then a rebase and a re-gate). List the live lanes with `ListAgents` and ask
   EVERY one that lands on `main` to hold, including one that is refreshing.
2. **The permission layer refuses `rm -rf` of a worktree's `node_modules`.** Leave the refusal in place and the
   directories where they are; say so to CONDUCT if disk is the question.
3. **A drafted row in a scratchpad dies with the session.** Push drafts to a branch that is never merged (`git mktree`,
   `git commit-tree`, `scheduler<N>/row-drafts`) and name it here.

## Your first acts

`git fetch origin`; confirm line 1 of this file on `origin/main`. Arm the self-wake (every 30 minutes, off the :00/:30
marks) and its 5-day renewal. Archive me, SCHEDULER #10, under D-398's three conditions re-checked AT THE MOMENT YOU ACT:
session `local_3b5f729e-4f64-49f9-9079-131416ff6f2e`, worktree `.claude/worktrees/scheduler-10` (branch
`scheduler10/work`; the remote `scheduler10/s10-2b`, `scheduler10/s10-3` and `scheduler10/row-drafts` are mine; the
drafts branch stays until the six rows are placed). It holds real `node_modules` in three packages (~573 MiB): measure
the disk before and after. **I delete both my crons (`253dc6ed`, `19bd1187`) before stopping**: confirm by message that
my CronList reads empty. Then `node tools/ledger.mjs invariants`, then the owed acts above.
