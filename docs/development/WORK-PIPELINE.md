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
| `docs/development/BACKLOG.md` — **everything still to do** | every open item NOT in the cache, in the order it will be processed (top = next), `blocked` rows included with what unblocks them | ≤ 150 KB; a row ≤ 2 KB | **WHOLE, by CONDUCT at every refill and by BOB when ordering**; by id otherwise |
| `docs/archive/ledgers/QUEUE-closed*.md` — **what has been done** | every `done` / `superseded` row, verbatim, as it stood when it closed | unbounded | **LOOKED UP** (`node tools/ledger.mjs find <ID>`) |

A row is FIELDS, not narrative: id · state · title (one line) · milestone · interface · design (a SECTION) ·
depends-on (ids) · owner · accepts-when (one paragraph) · why it is here in the order (one line). Reasoning, receipts
and history belong in the design document the row cites, or in the archive.

## 2. The cycle — CONDUCT's, as the sole writer of both files

1. **An item completes →** its row leaves the cache for the archive in the SAME commit as its `done` flip
   (`node tools/ledger.mjs archive <ID>` — LED-5, unchanged).
2. **Refill, same commit →** the next runnable rows move from the top of `BACKLOG.md` into the cache until it holds 8
   (or the backlog has nothing runnable), and are DELETED from the backlog as they move (`node tools/ledger.mjs refill`).
   A `blocked` row is skipped, never moved; it stays where the order put it.
3. **New work arrives →** BOB writes it into the BOB INBOX with its place in the order; CONDUCT gates it (the design is
   verified at the artifact, the depends-on resolve) and INSERTS it into `BACKLOG.md` at that place. A drained inbox
   entry moves to `docs/archive/ledgers/BOB-INBOX-drained.md` in the drain's commit — the inbox holds only what is waiting.
4. **The order is BOB's; the gate and the file are CONDUCT's.** BOB re-orders by an inbox entry naming the new order,
   checked against `node tools/status.mjs` (nothing before what it rests on).

**The invariants, each a `plancheck` arm (FAIL):** every open id is in EXACTLY ONE of the cache and the backlog; no
closed id is in either; the cache holds ≤ 8 rows and no `blocked` row; every cache row's `depends-on` is met; both files
are within budget.

## 3. DEBT.md — only what supports development

`DEBT.md` stays the register of what we KNOW is wrong or owed, but a session never needs to read it to follow the
process, because **every debt row that needs work gets a BACKLOG item, and the row's disposition names it.** So:
- **An open row is FIELDS**: id · class · date · what it costs (≤ 3 lines) · what closing it takes (≤ 3 lines) ·
  disposition — a BACKLOG/QUEUE id, or *accepted, not scheduled, because …* (one line). ≤ 1 KB.
- **Its narrative moves VERBATIM to the archive** (`docs/archive/ledgers/DEBT-narrative-2026-09.md`) with the row
  keeping a one-line pointer — the same move that made archiving closed rows safe: `decided.mjs` and
  `ledger.mjs find` still reach every word.
- **A closed row leaves in the commit that closes it** (LED-5, unchanged).
- It is a LOOKED-UP file (by id). The actionable part of it reaches sessions through the backlog.

## 4. What this replaces

LED-4 (*open rows cut to their fields and ordered*) is subsumed: its cut and its ordering are steps 2–3 of the migration
below. The QUEUE budget in `tools/ledger.mjs` (150 KB) moves to `BACKLOG.md`; the cache gets 40 KB.

## 5. The migration — one item, CONDUCT's own act on CONDUCT's own files, performed by hand with the tool

**LED-6.** (1) Build `ledger.mjs refill`, the `BACKLOG` ledger, `find` across all three, and the five invariant arms,
each with a negative control. (2) Move every non-row block of `QUEUE.md` (handover, per-area narrative, drained inbox
entries) VERBATIM to the archive, conserving line multisets as LED-3 did. (3) Cut every open row to its fields — the cut
text moving verbatim to the archive — and order them (BOB checks the order against `status.mjs` before it lands). (4)
Split: `running` + the first runnable rows to the cache, the rest to `BACKLOG.md`. (5) The same for `DEBT.md` (§3).
**Accepts when:** every invariant arm passes and fails on its control; the id multiset of open ∪ archived is identical
before and after; `QUEUE.md` ≤ 40 KB; `tools/readbudget.mjs` adds `QUEUE.md` to the read-whole set.
