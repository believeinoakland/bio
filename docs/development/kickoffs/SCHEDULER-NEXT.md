# SCHEDULER-NEXT — the resume for SCHEDULER #12 (written 2026-09-22 by SCHEDULER #11 at its refresh)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its "Mechanics learned" section is the practical half), then
`docs/architecture/BIO_System_Design.md` **whole**, then this, then `QUEUE.md` and `BACKLOG.md` whole. Everything below
was MEASURED at `origin/main` `381427e4` plus this landing (2026-09-22). It is a POINTER: re-measure before you rest
anything on it. The refresh line is **70%** (`CLAUDE.md` §4); I refreshed at ~62% because CONDUCT #12's batch and ten
placements would have crossed it mid-flight.

## The plan, as I left it

- **Cache (8):** LED-7 (this lane's own act) · REC-157, M0-97, D-341, M0-81 (`running`; each FINISHED on its branch —
  merged by CONDUCT #12 at `conduct12/batch2` @ `049da926`, whose ONE FULL gate was running at my refresh) · M0-99 ·
  M0-100 · REC-163.
- **Backlog (105), top:** M0-106 (DIST's release gate reuses a GREEN record) and M0-107 (a timeout is never a finding),
  near the head because they cut gate time; REC-166 (a project's make-current writes nothing on the shared question,
  `depends-on` REC-157); M0-101, UI-77, REC-165, D-85, M0-84 … M0-104 (the dirty-tree key) and M0-105 (`VERIFICATION.md`'s
  cut, `depends-on` M0-97) now sit BEHIND the product rows, after D-50. The batch's refill should move M0-106, M0-107,
  REC-166 and REC-165 in.
- **`BACKLOG.md` is 153,334 B of 153,600.** I cut seventeen foot rows to their fields today, each VERBATIM in
  `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`; the cut frontier now reaches UI-74 and the instrument cluster.
- **DEBT.md: 110 open rows** (114 when I opened). **BOB INBOX: empty.** The one open DELEGATION this lane sent is
  SCHEDULER (#11) -> BOB, a group of four (D-152, D-164, D-125, D-179), sent 2026-09-22; BOB #25 refreshed at 65% and hands
  it to BOB #26.

## Owed acts, in order

0. **RE-ORDER THE WHOLE PLAN UNDER BOB'S RULING OF 2026-09-22** (`CLAUDE.md` §2: *The goal is BIO work; process is
   overhead* — product before process tooling; no process row unless it cuts gate time or unblocks product; batch
   landings; now the lane's law in `kickoffs/SCHEDULER.md` step 3). It supersedes the order that heads the plan with M0
   instruments. BOB #25: *the product rows start with REC-165 and REC-166; after them come M8-M10: publish, accept and the
   case path.* I moved only my own four (M0-106 and M0-107 up, M0-104 and M0-105 behind the product rows). Judge the rest
   row by row, and say why on each `order:` line: M0-99 and M0-100 (in the cache), M0-101, M0-84, M0-85, D-412, REC-154,
   CPDF-21, M0-82, LED-8, LED-9 and the instrument cluster from D-438 to M0-96. Batch it with the completion if the batch
   lands first.
1. **CONDUCT #12's completion, ONE commit**: the landing sha an ancestor of `origin/main` AND each row's work read at the
   code; `done`, `ledger.mjs archive`, `refill`, invariants; tell CONDUCT what entered. D-341 was built NARROWER than its
   literal fix (M-91). Then run `node tools/status.mjs 12` for the trigger in item 4.
2. **PLACEMENTS WAITING FOR ROOM, each verified at the code; re-verify, then place (door 2: its DEBT row archived as
   PLACED, D-82's form in `DEBT-closed.md`):**
   - M0-97's worker's DEBT row (title-case ruling markers `decided.mjs` cannot see). **Name its id only once that row is
     on `main`**: my first gate went RED on `mintid.test`'s prose floor for naming it early. Draft:
     `origin/scheduler11/row-drafts`; after D-85, first of the process instruments, sequenced after M0-99.
   - SCHEDULER #10's four (`origin/scheduler10/row-drafts`, re-verified on `464c2779`): D-65 after D-60, D-74 after
     D-126, D-86 after D-394, D-66 after FW-20.
   - D-178: the audit sweep's `checkBundle` gets `earnedRegistry` and no `publishedRegistry` (`store.mjs`), so C-21.1 and
     C-21.2 never fire in an audit. Fix: inject `publishedRegistryFor` as `gateFacts` does, after a corpus count of what
     would fire. RECORD, M10.
   - D-169: `dispose` writes `disposition_reason` with `#setScalar`, a no-op when the key is absent, and `setup.mjs`'s
     `mdFor` writes none, so a disposed intake inquiry fails C-2.8 unseen. Fix: `#setOrAddScalar` at that site, and an
     arm disposing an `mdFor` inquiry. RECORD, M7.
   - D-171: `#revisionKind` breaks ties on `snap_key`, a caller's key. Fix: REC-32's `rowid DESC`. RECORD, M7.
   - CONDUCT #11's route: `bio-plane/test/retirable.control.mjs`'s head declares eight arms and M0-83's six; `ARMS` runs
     fifteen (A6b). Fix: the head's count, in a phrase the census's `readDeclaredArms` reads. Mint M0; instrument cluster.
   - D-278, a PHANTOM ROW (CONDUCT #12's route, 2026-09-22): `origin/main` cites *D-278's subject* seven times (`bio-checks.mjs`,
     `d270-refusal-truth.test.mjs` thrice, `refusal-wire.test.mjs`, `CLAIMS.md`, `MEASUREMENTS.md`) and `ledger.mjs find`
     finds it nowhere: the row lives only on the unmerged `origin/worktree-agent-aafee89563a3f2d42`, its `DEBT.md` line 327
     (2026-08-09: the codeless-refusal class is bigger than D-270's six). Fix: carry it onto `main` VERBATIM under its own
     id, then door 2 with a dated re-measure at the code (CONDUCT's auditor points at `index.mjs` ~5649, 5689, 6040, 6042,
     7822: pointers, not measurements).
   - REC-157's DELEGATION (reaches `main` with the batch): ratify-after-withdraw commits a stale conclusion. Fix named:
     `ratifyCaseDocument` asks `#caseConclusionFor` with REC-157's comparison and refuses by a new code. Mint REC.
3. **THE BACKLOG BUDGET.** Every placement now costs about two foot rows cut; I cut seventeen to place six. Put it to BOB
   in your first group, with that measurement: BOB #23 raises the budget only on re-read cost, and a worker on a cut row
   re-reads the archive — the frontier reached UI-74, *the first feature*, within one session.
4. **THE INTENT LAYER'S TRIGGER** (BOB #25; the Framework's front matter, §12): send its DESIGN act to BOB when
   `node tools/status.mjs 12` reads the publication ceremony and the accept surface BUILT. Unmet on `381427e4`.
5. **BOB #26's answers to the group of four**: drain each into its row (closed, placed or narrowed further).
6. **LED-7, one landing per wake** (batched, per Bob's ruling). Next, oldest first after the defects: D-175 (two assertions varying run to run,
   measured in August on a battery a quarter today's size: a worker measures, or it narrows), D-128, D-129, D-134, D-147,
   D-150, D-153, D-156, D-159, D-165 … D-121 and D-124 are COLLIDED ids (LED-8); D-64's four questions are BOB's; D-53
   is with Bob; D-148 and D-149 were routed to BOB by batch 4.

## Done this session (all verified on the remote)

Archived SCHEDULER #10 (D-398's three conditions at the moment of acting; its CronList empty by its own reply; worktree
removed, +652 MiB). Drained three BOB INBOX entries: M0-104, M0-105, REC-166, M0-106 and M0-107 placed, M0-103
superseded by M0-107, M0-105 amended. LED-7 S11-1: D-140, D-160, D-133 and D-180 closed in fact; D-152 and D-125
narrowed; a group of four to BOB. `SCHEDULER.md`: the gate sentence corrected (D-293's DELEGATION item 3), the
hold-`main` mechanic superseded, and Bob's product-before-process ruling written in as the lane's ordering law.

## The traps this session paid for

1. **A fresh worktree has no `node_modules`**: my first gate failed every suite in ~70 ms, and I killed it before its
   record. `npm ci` in `bio-plane/`, `pdf-worker/` and `ocr-worker/` first (~587 MiB).
2. **A DEBT id that exists only on a worker's branch, named in ANY corpus file — `CLAIMS.md` included — reds
   `mintid.test`'s prose floor**, and since D-293 that RED is recorded against the tree.
3. **Asking lanes to hold `main` failed and is now against Bob's ruling**: BOB #25's push crossed my ask. Gate a clean,
   committed tree; after a rebase run `gates.mjs --since <measured commit>`.

## Your first acts

`git fetch origin`; confirm line 1 of this file on `origin/main`. `npm ci` in the three packages. Arm the self-wake
(every 30 minutes, off the :00/:30 marks) and its 5-day renewal. Archive me, SCHEDULER #11, under D-398's three
conditions re-checked AT THE MOMENT YOU ACT: session `local_bde6b916-77fa-4926-83f7-779c1d3cb863`, worktree
`.claude/worktrees/heuristic-wing-f4faae` (branch `claude/heuristic-wing-f4faae`; `origin/scheduler11/row-drafts` is
mine and stays until its row is placed). It holds ~587 MiB of `node_modules`: if `git worktree list` still shows it after
the archive, `git worktree remove` it by its literal path, disk measured before and after. **I delete both my crons
(`07bac0c2`, `e3298a77`) before stopping**: confirm by message that my CronList reads empty. Then
`node tools/ledger.mjs invariants`, then the owed acts.
