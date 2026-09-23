# The work pipeline — QUEUE, BACKLOG, archive

Written 2026-09-18 by BOB #15 at Bob's direction, verbatim: *"Can QUEUE.md become a cache of the next several things
that need to be done (rather than a list of everything ever done and everything still needed)? Reducing it to a cache
will require that there be a separate file that is the full list of work still to be done. When the work identified in
QUEUE.md is completed, the completed work should be (properly) added to the archive of what has been done, the contents
of QUEUE.md refreshed to contain the next several things needed to be done, and those items added to QUEUE.md removed
from the full list of things still to be done. (So these 3 files will act as a work pipeline - greatly reducing the
information a new session must learn and hold throughout it's lifetime.)"* And: *"These documents should NOT just be
scanned!"* — the reason this exists is `CLAUDE.md` §1's reading budget: a file is READ WHOLE or LOOKED UP, never half.

**Measured when written** (`origin/main`, 2026-09-18): `QUEUE.md` 214 KB holding 24 open rows — the rows are a small
fraction; the rest is ~865 lines of BOB INBOX (nearly all drained), a 2026-08-04 session handover, and per-area status
narrative. `DEBT.md` 504 KB holding 222 open rows averaging 2.3 KB. No session could read either whole.

## 1. The three files, and who reads each

| file | holds | size | read |
| --- | --- | --- | --- |
| `docs/development/QUEUE.md` — **the cache** | the BOB INBOX's UNDRAINED entries; then at most **8** rows: those `running`, then the next `queued` rows whose `depends-on` is met, in order | ≤ 40 KB; a row ≤ 3 KB | **WHOLE, by every session** |
| `docs/development/BACKLOG.md` — **everything still to do** | every open item NOT in the cache, in the order it will be processed (top = next), `blocked` rows included with what unblocks them | ≤ 150 KB; a row ≤ 2 KB | **WHOLE, by SCHEDULER at every replenish and when ordering** (corrected 2026-09-19 by BOB #16: it read CONDUCT, before SCHEDULER existed); by id otherwise |
| `docs/development/BACKLOG-LATER.md` — **the backlog's tail** (M0-119) | the SAME order, continued: its first row comes directly after `BACKLOG.md`'s last (§2) | unbounded; a row ≤ 2 KiB | **LOOKED UP** (`node tools/ledger.mjs find <ID>`) |
| `docs/archive/ledgers/QUEUE-closed*.md` — **what has been done** | every `done` / `superseded` row, verbatim, as it stood when it closed | unbounded | **LOOKED UP** (`node tools/ledger.mjs find <ID>`) |

**All three live on the branch `coord`, not `main`, since M0-110** (`TREE-SHARING.md` §1): each is read with
`node tools/coord.mjs read <path>` and changed with `node tools/coord.mjs write`, whose intents (a status word, a row
placed before or after another, archive, refill) are re-applied to the fresh tip, and whose ledger checks — the
invariants below among them — refuse a write that breaks one. "The same commit" below is ONE such write.

A row is FIELDS, not narrative: id · state · title (one line) · milestone · interface · design (a SECTION) ·
depends-on (ids) · owner · accepts-when (one paragraph) · why it is here in the order (one line). Reasoning, receipts
and history belong in the design document the row cites, or in the archive.

## 2. The cycle — SCHEDULER's, as the owner of both files (`kickoffs/SCHEDULER.md`; Bob, 2026-09-18)

**CONDUCT writes one word — a cached task's `queued` → `running` — and reports each completion to SCHEDULER.** Where
the steps below say CONDUCT refills or gates the plan, read SCHEDULER: the lane was created after this section was
first written. SCHEDULER **replenishes** the cache; CONDUCT **fills slots**.

1. **An item completes →** its row leaves the cache for the archive in the SAME write as its `done` flip
   (`node tools/ledger.mjs archive <ID>` — LED-5; `coord.mjs write --status <ID> done --archive <ID>`).
2. **Refill, same write →** the next runnable rows move from the top of `BACKLOG.md` into the cache until it holds 8
   (or the backlog has nothing runnable), and are DELETED from the backlog as they move (`node tools/ledger.mjs refill`).
   A `blocked` row is skipped, never moved; it stays where the order put it.
3. **New work arrives →** BOB writes it into the BOB INBOX with its place in the order; SCHEDULER gates it (the design is
   verified at the artifact, the depends-on resolve) and INSERTS it into `BACKLOG.md` at that place. A drained inbox
   entry moves to `docs/archive/ledgers/BOB-INBOX-drained.md` in the drain's commit — the inbox holds only what is waiting.
4. **The order and the files are SCHEDULER's; BOB supplies designs and brings Bob's priority calls.** BOB re-orders by an inbox entry naming the new order,
   checked against `node tools/status.mjs` (nothing before what it rests on).

**The invariants, each a `plancheck` arm and a coord write's ledger check (FAIL):** every open id is in EXACTLY ONE of the cache and the backlog; no
closed id is in either; the cache holds ≤ 8 rows and no `blocked` row; every cache row's `depends-on` is met; both files
are within budget.

**WHEN `BACKLOG.md` IS OVER ITS BUDGET, THE TAIL MOVES, NOT THE HEAD — RULED 2026-09-22 by BOB #28 on SCHEDULER #14's
question (its DELEGATION in `CLAIMS.md`).** Cutting rows to their fields cut the rows about to be spawned (seventeen at
one placement, every product row still whole) and runs out, while LED-7 folds ~95 debt rows into this file. So: (1) no
placement cuts a row; rows already cut stay as they are. (2) The order continues past `BACKLOG.md` into
`docs/development/BACKLOG-LATER.md`, the SAME order's tail, LOOKED UP, never read whole, unbounded: a placement that
puts `BACKLOG.md` over budget moves whole rows from its FOOT to the head of `BACKLOG-LATER.md`, and a refill promotes
rows back from that head as room frees. (3) Every reader of the backlog (`ledger.mjs` find, refill and the invariants,
`plancheck`'s pipeline arms, `owed.mjs`, the design and substrate checks, `mintid`'s floor) reads the two files as one
sequence, and "exactly one place" spans all three. (4) It is a new state file, so it rides with M0-110's family to
`coord`: its row is placed after M0-110's cutover. **Until it is built**, `BACKLOG.md`'s budget is 200 KiB
(SCHEDULER sets it in `ledger.mjs`) and no new cut is made.
**As built (M0-119, 2026-09-22):** `tools/ledger.mjs` — `LEDGERS.LATER` in `PIPELINE`, `planRebalance` /
`rebalanceConserved` / `rebalance` (the split held at the budget both ways; id multiset, ORDER, every row verbatim, each
file's non-row lines and the split judged on the plan and on what is read back), `refill` walking the backlog then the
tail and rebalancing in the same act, P1/P2/P5 over three files; the budget is 150 KiB again. `tools/coord.mjs write`
ends every write with a rebalance before its ledger checks, so a placement over budget moves the tail; its new intents
are `rebalance` (creates an absent tail's header) and `swap` (an exact text found once — a preamble line). An ABSENT
tail is an empty one, named `absent`, never `unreadable`. Readers: `findId`, `pipelineRows` (and through it `rowdesign`,
`rowsubstrate`, `plancheck` §2), `owed.mjs`, `mintid.mjs`' corpora, `ledgerAudit`. Rows already cut STAY CUT, per (1):
nothing restores them from the cut archive.

**WHICH WRITES REBALANCE — RULED 2026-09-23 by BOB #29 (M0-119's question, SCHEDULER #14's recommendation):** only a write
that changes the plan's MEMBERSHIP OR SIZE rebalances — an `insert`, a `row` replace or delete, an `append` or `line` into
`QUEUE.md`, `BACKLOG.md` or `BACKLOG-LATER.md`, a `refill`, an `archive`. A claim, a handoff, a DELEGATION or a status word
never rewrites a plan file, so M0-110's partition of writers holds and a lane's claim cannot move a row it never read. As
built, `coord.mjs write` rebalances after EVERY write; that is the correction owed (M0), and until it lands a stray
rebalance is harmless because it conserves every row verbatim. A tree's GATE never fails on the budget either way
(TREE-SHARING §3 (c)): the budget is enforced at the write.

## 3. DEBT.md FOLDS INTO THE BUILD PLAN, and is retired as a live file

Bob, 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in
the right build order. Once in the build plan, they'll eventually be worked on when they are included in a tranche of
QUEUE.md entries."* **Measured that day:** 222 open rows, of which **6** had a disposition naming an open queue item,
**~200** carried a milestone label and nothing that would ever schedule them, and **54** dated from July. A register
nothing drains is a list of work nobody does, and the estate had already measured one row outliving its own remedy by
38 days (D-225). The earlier version of this section kept DEBT.md as a register beside the backlog; Bob's direction
replaces it.

**LED-7 — THE FOLD.** Every open row is TRIAGED AT THE CODE (a row is a claim about the day it was written, `CLAUDE.md`
§5) and leaves DEBT.md by exactly one of three doors, recorded on the row as it goes to the archive:
1. **ALREADY CLOSED IN FACT** — the remedy exists on the tree; the evidence (the file, the check, the sha) is written on
   the row and it is archived closed.
2. **REAL WORK** — it becomes a BACKLOG item in build order, keeping its `D-` id so every citation still resolves, with
   the row's cost and closing text as its scope, its `depends-on` checked against `node tools/status.mjs`, and its
   place in the order set by BOB. It reaches a session only when a refill brings it into the cache.
3. **A DELIBERATE, PERMANENT LIMITATION** — stated in its construct's home design document (its Incomplete sections, or
   a stated limitation), then archived pointing there. Measured before triage: about 6 of 222 dispositions read this way
   (D-28, D-38, D-45, D-111, D-306, half of D-396). **Door 3 also takes a DEFERRAL WITH A TRIGGER** (BOB #27, 2026-09-22,
   on SCHEDULER #13's question about D-159 and D-165): stated in its home document as *deferred, trigger: …*, the trigger
   written where the event that fires it is recorded (a milestone's text, or the row that builds its precondition), then
   archived pointing there — never a blocked backlog row, which costs a placement and watches nothing.

**After the fold, a newly found defect is DIAGNOSED UNTIL ITS FIX CAN BE NAMED, then placed by SCHEDULER as a
BACKLOG item in build order** (class `defect`, a `D-` id minted as today; Bob: *"understood deeply enough that a fix
can be identified and properly added (in the correct order) in the build plan"*; a fix that needs design goes to BOB
first) — there is no second list for work to wait in. **`DEBT.md` cannot be emptied row by row** (M0-109's sweep, M-96:
`ledger.mjs`'s `DEBT_FLOOR_BYTES`, 10,000 B, refuses any archive leaving less, and an empty file is 3,174 B), so LED-7's
CLOSING landing archives the last rows with the file and, in that landing, retargets every reader of the live file:
`owed.mjs`, `plancheck`'s disposition arm and `ledger.mjs` to the backlog; `DEBT_FLOOR_BYTES` retired with
`nc-m039.mjs`'s arm 2 re-pointed at the backlog; `ledger.test.mjs` §3 at the archive and `planning-hygiene.test.mjs` §1
re-pointed or retired — both fail by name at zero rows, on purpose. And AHEAD of the batch that moves D-388,
`corpuscheck.test.mjs` §5 reads D-388 through `ledger.mjs`'s `findId`, open in the live DEBT, the cache or the backlog
(BOB #27, 2026-09-22, folding M0-109's DELEGATION to SCHEDULER, which places the fixes); these readers move and `CLAUDE.md` §4's *write it in
DEBT.md* changes to the backlog in LED-7's own landing, not before. **Performed in batches of ~20 rows by SCHEDULER itself** (Bob,
2026-09-19: *"Scheduler should be actively involved in moving debt rows into the build plan (in the proper order)"* —
corrected by BOB #16; this read *by workers under CONDUCT*), each row verified at the code, with a worker through CONDUCT
only for a row whose verification needs a build; **accepts when** every open row has left by one of the three doors with
its evidence, the id multiset (live, archive and backlog together) is identical before and after, and every new backlog
task is placed in order by SCHEDULER.

## 4. What this replaces

LED-4 (*open rows cut to their fields and ordered*) is subsumed: its cut and its ordering are steps 2–3 of the migration
below. LED-7 (the fold, §3) follows LED-6, since it writes into the backlog LED-6 creates. The QUEUE budget in `tools/ledger.mjs` (150 KB) moves to `BACKLOG.md`; the cache gets 40 KB.

## 5. The migration — one item, SCHEDULER's act on its own files, performed by hand with the tool (transferred from CONDUCT 2026-09-18, `kickoffs/SCHEDULER.md`)

**LED-6.** (1) Build `ledger.mjs refill`, the `BACKLOG` ledger, `find` across all three, and the five invariant arms,
each with a negative control. (2) Move every non-row block of `QUEUE.md` (handover, per-area narrative, drained inbox
entries) VERBATIM to the archive, conserving line multisets as LED-3 did. (3) Cut every open row to its fields — the cut
text moving verbatim to the archive — and order them (BOB checks the order against `status.mjs` before it lands). (4)
Split: `running` + the first runnable rows to the cache, the rest to `BACKLOG.md`.
**Accepts when:** every invariant arm passes and fails on its control; the id multiset of open ∪ archived is identical
before and after; `QUEUE.md` ≤ 40 KB. **CORRECTED 2026-09-19 by BOB #16 at LED-6's close:** this clause first said `tools/readbudget.mjs`
adds `QUEUE.md` to the read-whole set; it does NOT, because `ledger.mjs`'s P5 already produces the cache's budget and a
second producer of one quantity is the defect `BOB.md` rule 7 names. `QUEUE.md` is read whole by `CLAUDE.md` §1 and bounded
by P5 alone.
