# SCHEDULER-NEXT — the resume for SCHEDULER #10 (written 2026-09-21 by SCHEDULER #9 at its refresh)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its "Mechanics learned" section is the practical half), then
`docs/architecture/BIO_System_Design.md` **whole**, then this, then `QUEUE.md` and `BACKLOG.md` whole. Everything below
was MEASURED at `origin/main` `26de0439` plus this landing (~01:40Z 2026-09-22). It is a POINTER: re-measure before you
rest anything on it. The refresh line is **70%** (`CLAUDE.md` §4); I refreshed at ~62% with nothing pending, since the
next act would cross it mid-flight.

## The plan, as I left it

- **Cache (8):** LED-7 (this lane's own act, never a worker slot) · REC-157 (`running`) · M0-97 (`running`) · D-341
  (`running`) · M0-81 · D-293 (`running`) · M0-99 · M0-100. **M0-97 and D-341 are ONE worker**, and M0-99 sequences
  after both (the same file, `tools/decided.mjs`). **D-293 and M0-98 are ONE worker**: M0-98 reads `blocked` in the
  backlog so no refill moves it; CLOSE BOTH when that worker's integration lands. **M0-81 waits on DISK, not order**:
  CONDUCT #11 reverted its flip (`11077afc`) and spawns it when D-293 integrates and frees ~1.8 GiB.
- **Backlog (98), top:** M0-98 (blocked), M0-101 (waits on M0-100), **REC-163, UI-77** (every instance's surfaces named
  Believe in Oakland; amended to `BIO_Publication_v0_1.md` §7: the slug is public), M0-84, M0-85 (blocked), D-412,
  REC-154, CPDF-21, M0-82, D-116, CAP-13, D-389, REC-160, D-57, **D-440, D-420** (placed today), D-390, D-60, CAP-14.
- **`BACKLOG.md` is at 153,026 B of 153,600.** 27 rows at the FOOT were cut to their fields in four passes on
  2026-09-21, up to D-162; each row's whole pre-cut text is VERBATIM under «ID» in
  `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. The next cut reaches the M4 product rows (D-394, REC-122, D-126).
  **Prefer placing when a completion frees room** (each refill moves a ~1.5–2 KB row out).
- **DEBT.md: 139 open rows** (146 when I opened). **BOB INBOX: empty.** No DELEGATION this lane sent is open but
  SCHEDULER (#8) -> BOB, which only Q3 (D-53, with Bob) keeps open.

## Owed acts, in order

0. **CONDUCT's completions:** REC-157; M0-97 with D-341 (one worker); D-293 with M0-98 (one worker, close both). One
   commit each: the landing sha an ancestor of `origin/main` AND the row's work read at the code, then `done`,
   `ledger.mjs archive`, `refill`, invariants; tell CONDUCT what entered.
1. **Answers outstanding — do NOT re-ask:** D-53 (reputation and credence) is with Bob. When he answers, correct its
   stale blockers (bulk release shipped; the content object exists) and DISCHARGE the DELEGATION SCHEDULER (#8) -> BOB.
2. **Placements VERIFIED AT THE CODE, waiting only for room** (place them before any new triage):
   - **D-65** after D-60, the same op: the plane imports only `identify`, `doctypeFor`, `profileRecord`, `digests`,
     `CONFIDENCE` and `readText` from docprofile, never `pipeline.mjs`'s `assess()` or `events.mjs`. Design: Framework §6
     (one entry point; identical bytes are a CONFIRMATION stored as evidence), with CONSTRUCTS Step 6. Owner RECORD, M3.
   - **D-74** first of the M4 product rows, after D-126: a MEASUREMENT (Framework §8.3, *"Oakland's shared identifiers
     have not been measured"*); construct 6's identifier-space arm reads ABSENT. Owner CAPTURE.
   - **D-82** after UI-73: the plane stamps `surfaced_by: agent` server-side (D-78, `index.mjs`), and no surface marks an
     agent-surfaced inquiry; UI-5 marks only a derived proposal. Design: Interaction Constructs §"P · PROPOSAL"'s
     accountability rule, with Assistant and AI Roles §3 rule 8. Owner UI, M8.
   - **D-66** (narrowed by BOB #24): the budget-or-dataset content type, OWED and measured first
     (`EXTRACTION-BREADTH-DESIGN.md` §2 row 5): a census class plus a read sample. M2.
3. **LED-7, one landing per wake**, the open count reported each time. Next rows, oldest first: D-64 (no longer blocked
   on D-55, since `710b574d`; its four questions go to BOB when M2 reaches it), D-75, D-76, D-79, D-81 (Framework §12's
   intent layer: ask BOB as ONE group — owed now, or a stated deferral in §12?), D-85, D-86 (the bias-debt producer on
   `overdue-scan`'s consumer shape: check at the code and place), D-87, D-88. D-77, D-89 and D-90 are DOCTRINE; D-124
   is a COLLIDED id (LED-8).

## Done this session (all verified on the remote)

Archived SCHEDULER #8 (D-398's three conditions at the moment of acting; its CronList empty by message; worktree removed,
+655 MiB). Drained BOB #23's themes entry (D-162, UI-76) and BOB #24's two entries (D-440 and D-420; REC-164 and UI-78,
with REC-163 and UI-77 amended). Closed D-436 (by content at `38850da4`; the refill moved M0-100). Placed CONDUCT #11's
route as REC-163 and UI-77. LED-7: D-19 closed in fact and D-207 superseded (Bob's ruling that pre-MVP records are test
data); a group of four sent to BOB and answered within the hour: D-36 and D-56 closed by the third door, D-69 in fact,
D-66 narrowed. Landings: `0f1d912c`, `d7282342` and this one.

## The traps this session paid for

1. **A fresh worktree has no `node_modules`:** my first gate ran without `npm ci` and failed on a missing `miniflare`
   (CLAUDE.md §6 says so). Run `npm ci` in `bio-plane/`, `pdf-worker/` and `ocr-worker/` before any gate.
2. **`main` moved three times under one gated landing** (BOB, DIST, BOB), each a rebase and a ~4-minute re-gate. **Ask
   CONDUCT, BOB and DIST to hold `main` BEFORE you gate** ("until I send landed"); all three did, and said so.
3. **Inserting a row with `t.slice(idx + 1)` dropped the blank line before the next heading**, and the next insert's
   assertion caught it. Assert ONE blank line on each side of every inserted row.
4. **Name a section's content, never whose ruling it is, unless the section says so:** my rows cited State Rules §3.1 as
   "D-436's ruling", and BOB #24 split its attribution mid-landing (Bob ruled only the pre-MVP premise).

## Your first acts

`git fetch origin`; confirm line 1 of this file on `origin/main`. Arm the self-wake (every 30 minutes, off the :00/:30
marks) and its 5-day renewal. Archive me, SCHEDULER #9, under D-398's three conditions re-checked AT THE MOMENT YOU ACT:
session `local_2b7a6b0a-cac9-4fb5-b757-b7f5905cde13`, worktree `.claude/worktrees/focused-perlman-dcfab7` (branch
`claude/focused-perlman-dcfab7`; the remote `scheduler-9/a` to `/c` hold pre-rebase copies of work already on `main`).
It holds real `node_modules` in three packages (~0.6 GiB): measure the disk before and after. **I delete both my crons
(`37752082`, `70abf407`) before stopping** — confirm by message that my CronList reads empty. Then `node tools/ledger.mjs
invariants`, then the owed acts above.
