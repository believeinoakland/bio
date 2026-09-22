# SCHEDULER-NEXT — the resume for SCHEDULER #14, in the cloud (written 2026-09-22 by SCHEDULER #13 at its stand-down)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its "Mechanics learned" section is the practical half), then
`docs/architecture/BIO_System_Design.md` **whole**, then `kickoffs/NEW-MACHINE.md` §0 (what a cloud session starts
without), then this, then `QUEUE.md` and `BACKLOG.md` whole. Everything below was MEASURED at SCHEDULER #13's stand-down
(2026-09-22 ~16:55Z, on `origin/main` @ `359e4020` plus this commit), ordered by BOB #27 when Bob moved development to
cloud Claude Code under his second account. It is a POINTER: re-measure before you rest anything on it.
**SCHEDULER #13 IS STOPPED:** it deleted both its crons (its own CronList then read *"No scheduled jobs."*), landed this
file, and BOB #27 archives it; you have no predecessor to archive. **YOU ARE IN THE CLOUD, WITH NO MEMORY:** the session
tools (`list_sessions`, `archive_session`, `ListAgents`), `CronCreate` and cross-session replies are UNMEASURED there
(NEW-MACHINE §0); a rule resting on one is SUSPENDED until the first BOB there records it, and the repository is the
channel both ways.

## The plan, as I left it

- **THE ORDERING LAW** (Bob, 2026-09-22, `CLAUDE.md` §2; `kickoffs/SCHEDULER.md` step 3): product before process; a process
  row is placed only if it CUTS GATE TIME or UNBLOCKS PRODUCT, and may then sit near the head; every other process row goes
  behind the product rows; landings are batched, ONE per wake. Bob, ~15:40Z (BOB #27's measured time): lane contention
  *"must be understood and fixed"* (M-97: 24 of 59 recorded gate runs discarded that day), so the tree-sharing rows stay
  at the head.
- **NO CLAIM BLOCK for an edit that lands in one commit** (`CLAUDE.md` §4, BOB #27): this lane writes none for its own
  files; DELEGATION blocks and their state lines stay.
- **Cache (8):** LED-7 (this lane's own act, never a worker slot) · M0-106 (DIST's own act: its WITNESS at the 0.72.0 cut) ·
  M0-107, REC-166, REC-165 and M0-110 **`running`** (CONDUCT #13's wave 1, flipped at `3bbcb6e1`; M0-110 carries BOB #27's
  two-stage split, both stages runnable) · REC-167 · UI-77 (queued, the next fills). The wave was LIVE when this account
  stood down: whether each worker pushed its branch is CONDUCT's to establish, by `QUEUE.md`'s rule for a `running` row
  with no live worker (read its `worktree-agent-*` branch, then its `CLAIMS.md` block).
- **Backlog (117), top:** M0-114 (`blocked` until NEW-MACHINE §0 records the first cloud session's FULL gate time and pass
  count: the gates on GitHub's machines, TREE-SHARING §3–§4) · M0-111 (landing in batches, `depends-on` M0-110) · M0-116 (a
  `MEASUREMENTS.md`-only landing re-runs a third of the battery; runnable) · M0-100 (`depends-on` M0-111) · D-85 · D-116 ·
  CAP-13 · D-389 · REC-160 · D-57 · the M1-M7 corrections · the M8 corrections (REC-159, REC-162, REC-155, REC-158, D-311,
  UI-73, D-82, D-125) · D-278 · COFF-13 · D-52 … D-178 · the features (UI-74 first; D-148 and D-149 after UI-69; D-134, the
  administrator write surface, after D-126) · then BEHIND THE PRODUCT ROWS the process rows, the ledger tooling with M0-115
  after LED-9, the instrument cluster, the older M0 rows, the four blocked rows at the foot.
- **`BACKLOG.md` is 153,243 B of 153,600** (150 KiB, KEPT by BOB #26: revisit only on an instance of a spawn delayed or
  misbriefed by a cut row). Every uncut row is at the TOP, so EVERY PLACEMENT NOW CUTS THE NEXT ROWS TO RUN, each VERBATIM
  in `QUEUE-cut-2026-09-22.md`; an instance of a cut row delaying or misbriefing a spawn goes to BOB.
- **DEBT.md: 95 open rows.** **D-388 moves only after M0-115 lands** (`corpuscheck.test.mjs` §5; WORK-PIPELINE §3).
- **Ids:** M0-114 and M0-115 were minted after this lane's own text named the next M0 number and the archive raised the
  prose floor; the two numbers below M0-114 are GAPS. Mint first, then write the id anywhere.

## Owed acts, in order

1. **BOB #27's FINAL LANDING answers this lane's four LED-7 questions** (D-150's check on the completeness statement,
   D-147's request lifecycle, the door for D-159 and D-165, D-128's flow model; SCHEDULER (#13)'s DELEGATION in
   `CLAIMS.md`) in their home documents and in a BOB INBOX entry. Drain it first: each answer closes, places or narrows
   its row, and the DELEGATION gets its DISCHARGED line.
2. **CONDUCT's completions:** ONE commit per report — the landing sha an ancestor of `origin/main` AND the row's work
   read at the code, `done`, `node tools/ledger.mjs archive <ID>`, then `refill`, then `invariants`. A landing's order is
   in SCHEDULER.md's mechanics (place without cutting, refill, THEN cut). If the cloud cannot message, CONDUCT's report is
   its commit on `main`: read `git log --merges origin/main` at each wake.
3. **M0-106:** close when DIST's 0.72.0 cut (owed no earlier than 2026-09-23 04:00Z) names the GREEN FULL record its
   step 1 relied on. In the cloud a record lives in one clone (D-293), which is M0-114's premise.
4. **M0-114** leaves `blocked` when NEW-MACHINE §0 records the first cloud session's FULL gate time and pass count.
5. **THE INTENT LAYER'S TRIGGER** (BOB #25; the Framework's front matter, §12): send its DESIGN act to BOB when
   `node tools/status.mjs 12.publish` and `12.accept` read BUILT. Both ABSENT at the stand-down.
6. **LED-7, one landing per wake, batched.** Batch S13-1 closed D-153 and D-156 in fact and placed D-134. Next, oldest
   first: D-175 (a ±2 assertion drift on an unmodified tree, 2026-08-04: two battery runs decide it, so a worker via
   CONDUCT or a process row behind the product rows), D-129 (a design row, `undetermined`'s two claims, widened by
   `STORE-AS-CACHE.md`: the next group to BOB), then D-166 onward. D-121 and D-124 are COLLIDED ids (LED-8); D-64's four
   questions are BOB's; D-53 is with Bob; D-127 is the case-making row the IS plan answered, read before moving it. The
   fold's CLOSING landing retargets WORK-PIPELINE §3's list.
7. **HELD under the law (process rows that pay nothing), not placed:** the retirable control's declared arm count (the
   draft `row-drafts/M0-108.md` on `origin/scheduler12/row-drafts`; its id is minted, so keep it out of the corpus unless
   you place it); D-441 (`decided.mjs` blind to title-case ruling markers; in `DEBT.md`, its fix named).
8. **Not rowed, this lane's call (BOB #26):** a DIGEST-level duplicate across bundles, `LINK-FIDELITY.md` "The work, in
   order" step 5's cross-bundle check in `op=audit`; place it beside D-179 when its turn comes.

## Where the lane's scripts are

`origin/scheduler13/row-drafts` (never merged, parented on SCHEDULER #12's drafts branch): `lane-scripts-13/` holds
`place13.mjs` (placement and the balanced foot cut, `--place` and `--cut` apart), `land13.mjs` (the done words, the inbox
drains, the DEBT doors by `owed.mjs`'s own predicate, the DELEGATION lines), `led7b1.mjs` (a LED-7 batch: door 1 and door 2
with the prior disposition moved verbatim, MILESTONES lines, a DELEGATION to BOB), `debtpeek.mjs` (a DEBT row's head and
disposition, read-only), `m0110.mjs`, `sched13.mjs` and `fix278.mjs`; `row-drafts-13/` the full drafts as placed;
`lane-scripts/` SCHEDULER #12's older scripts. Each script reads its drafts from its own directory: copy both into a
scratchpad and run with the repo as argument. A shell guard may refuse loops and awk around git: use a node script.

## Done by SCHEDULER #13 (verified on the remote)

Archived SCHEDULER #12 (D-398's three conditions, its CronList empty by its own reply). `8ec66c57`: REC-163, M0-109 and
M0-99 CLOSED by content; all three BOB INBOX entries DRAINED (M0-114 placed blocked, D-278, D-148 and D-149 placed); M0-115
and M0-116 placed; M0-110 split in two stages; the refill moved M0-110, REC-167 and UI-77; `kickoffs/SCHEDULER.md` gained
four durable mechanics and M0-99's item 9. `359e4020`: LED-7 batch S13-1 (D-153 and D-156 closed in fact, D-134 placed,
four questions to BOB). Stood down at BOB #27's order, 16:49Z: both crons deleted, this file landed.

## Your first acts

`git fetch origin`; confirm line 1 of this file on `origin/main`. `npm ci` in `bio-plane/`, `pdf-worker/` and
`ocr-worker/` (each `node_modules` a real directory, not a symlink); `node tools/plancheck.mjs` before any push (it
installs the push guard a fresh clone lacks). A fresh clone holds NO gate record (D-293), so your first gate runs whole.
Arm the self-wake (every 30 minutes, off :00/:30) and its 5-day renewal only if `CronCreate` exists there; if it does not,
say so in the repository, where the first BOB records §0's answers. Then `node tools/ledger.mjs invariants`, then the
owed acts.
