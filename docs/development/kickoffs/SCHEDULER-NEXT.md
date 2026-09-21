# SCHEDULER-NEXT — the resume for SCHEDULER #9 (written 2026-09-21 by SCHEDULER #8 as a CHECKPOINT while live)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its "Mechanics learned" section is the practical half), then
`docs/architecture/BIO_System_Design.md` **whole**, then this, then `QUEUE.md` and `BACKLOG.md` whole. Everything below
was MEASURED at `origin/main` `33d4a066` plus this landing (~23:05Z). It is a POINTER: re-measure before you rest anything on it. The
refresh line is **70%** since Bob's ruling of 2026-09-21 (`CLAUDE.md` §4); this checkpoint was written at 58%, while live.

## The plan, as I left it

- **Cache (8):** LED-7 (this lane's own act, never a worker slot) · D-436, M0-79 (`running`, CONDUCT #10's; M0-79 is
  finished and integrates next) · REC-157 · M0-97 · D-341 · M0-81 · D-293. **M0-97 and D-341 are ONE worker**
  (`tools/decided.mjs`); **D-293 and M0-98 are ONE worker** (`gates.mjs`, the verdict record, then the TARGETED class).
- **Backlog (92), top:** M0-98, M0-99, M0-100, M0-101 (BOB #23's *THE RECORD IS PARTITIONED BY WRITER*, in its order,
  `ORCHESTRATION.md`), then M0-84, M0-85 (blocked, the operator's), D-412, REC-154, CPDF-21, M0-82, D-116, CAP-13, D-389,
  REC-160, D-57, D-390, D-60, CAP-14.
- **`BACKLOG.md` is AT ITS BUDGET: 153,354 B of 153,600.** Every placement needs a cut first: move a row's `scope:` line
  verbatim to `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` under `#### cut: <ID>`, each line prefixed `> `, and leave
  a `cut:` line naming it — from the BOTTOM of the order, never the top: RULED by BOB #23 (2026-09-21), the budget stays
  150 KiB (`kickoffs/SCHEDULER.md`, the last mechanics line). Five rows were cut this way on 2026-09-21.
- **DEBT.md: 146 open rows** (159 when I opened). **BOB INBOX: empty.**

## Owed acts, in order

0. **CONDUCT's completions** (M0-79 next): one commit each — the landing sha an ancestor of `origin/main` AND the row's
   work read at the code, then `done`, `ledger.mjs archive`, `refill`, invariants; tell CONDUCT what entered.
1. **Answers outstanding — do NOT re-ask:** D-162 (can a theme be an entity and stay falsifiable?) and D-53 (reputation
   and credence) were PUT TO BOB in his own conversation by BOB #23; D-55 (authority at asset or content grain) passed to
   BOB #24 (BOB-NEXT §3). Each DEBT row carries a SENT note. The DELEGATION SCHEDULER (#8) -> BOB holds ONE state line
   (BOB #23 wrote Q2's ruling into it): when the last of the three is answered, DISCHARGE it, taking the open line out.
2. **The next BOB group, prepared and HELD** (send three or four at once, never one): **D-36** (workerd's SQL-limit
   CLASS: `npm run probe:limits` exists, `CONTENT-SEARCH-DESIGN.md` states the compound ceiling, but
   `RETRIEVAL-SUBSTRATE.md`'s front matter still says it is *recorded only in the source*, and the ~100-variable ceiling
   is in no governed design — a fold); **D-56** (the CPU watch: `CLIENT-RENDERED.md` still says *nobody has looked*,
   stale since the 2026-07-29 `op=cpuprobe` measurement — a fold); **D-66** (five of Bob's named content types are
   built or placed — FW-20 is the directory — but *a budget or dataset* is in no candidate list of
   `EXTRACTION-BREADTH-DESIGN.md` §2: dropped, or owed?); **D-69** (Step 1 is BUILT and monitoring is D-60's; `CONSTRUCTS.md`
   front matter says steps 5, 5a, 6, 8, 8a, 8b and 9 are unscheduled: superseded by the framework's constructs, or owed?).
3. **LED-7, the standing default, ONE landing per wake** (`ORCHESTRATION.md`'s interim rule, until M0-98–M0-101 land):
   the open count reported each time. Next ordinary rows, oldest first: D-19 (a July migration's LIVE data — reading it
   means `store=` named on every call, or place it as a VERIFY read like D-207), D-64 (blocked on D-55: carry), D-65
   (docprofile's `pipeline.assess` and `events` are consumed by no plane monitor — beyond D-60's digest), D-74 (Oakland's
   shared identifier spaces unmeasured, construct 6's ABSENT arm, Framework §8.3: real work, so PLACE it — after a cut), D-75, D-76, D-79, D-81, D-82, D-85–D-88. D-77, D-89, D-90 are DOCTRINE (a group to BOB); D-124 is a COLLIDED id (LED-8).

## Done this session (all verified on the remote)

Archived SCHEDULER #7 (D-398's three conditions at the moment of acting; its CronList empty by message; worktree
removed, +654 MiB). Carried BOB #23's rulings of #7's group: D-145 and D-99 closed as M6's stated deferrals; REC-160
cites State Rules §5.4 (DEC-70's home); M0-95/M0-96 cite `VERIFICATION.md`'s driver law. Replenished with M0-81 after
M0-83. LED-7 S8-1..S8-5: D-28, D-32, D-63, D-111, D-100 closed by the third door, D-71 in fact; D-390, D-57, D-60 placed with fixes
named (D-60 is the one trace its row asked for: `op=monitor` is raw, C-18.3 already folds by the evidentiary digest,
the links bracket is D-59's). Sent a group of four; BOB #23 closed D-38 and D-45 into State Rules §4.3/§8 (archived).
Closed D-434 (verified at `745aef00` by content). Drained BOB #23's partition entry: D-293 moved up, M0-98..M0-101
placed; D-293 entered the cache. Cut five foot-of-order rows to fit the budget.

## The traps this session paid for

1. **`git grep -E "\bID\b"` matches NOTHING on this machine** and reads like absence; a false miss nearly closed D-32 on
   a remedy it called unbuilt (one was BUILT: `Store.FACET_MODE_DEFAULT = "scan"`). Use `git grep -w -e`. Verify EACH
   remedy a row names before calling it unbuilt.
2. **`op-claims.test.mjs` fails the gate on an op-name that is a Durable Object path** — and it failed AGAIN on the
   lesson line that quoted it. Find the public op in `index.mjs` (`op === "<name>"`) and never spell the wrong one.
3. **Mint ids THROUGH the allocator, one at a time**, writing each before the next: hand-assigned M0-99..M0-101 read as a
   `mintid --audit` QUESTION until re-minted in order.
4. **CONDUCT asked me to HOLD `main` while it landed** — my docs-only pushes forced its re-merges. Push your branch, hold
   `main`, and land once per wake. Inserting a row block: assert ONE blank line between rows after the edit.

## Your first acts

`git fetch origin`; confirm line 1 of this file on `origin/main`. Arm the self-wake (every 30 minutes, off the :00/:30
marks) and its 5-day renewal. Archive me, SCHEDULER #8, under D-398's three conditions re-checked AT THE MOMENT YOU ACT:
session `local_b4569668-56f4-46c2-8c99-31b82d11f536`, worktree `.claude/worktrees/wizardly-ishizaka-f2c7cf` (branch
`claude/wizardly-ishizaka-f2c7cf`; the remote `scheduler-8/a`–`/e` hold pre-rebase copies of work already on `main`). It
holds real `node_modules` in three packages: measure the disk before and after. **I delete both my crons (`9ee6e42a`,
`9e31c380`) before stopping** — confirm by message that my CronList reads empty. Then `node tools/ledger.mjs
invariants`, then the owed acts above.
