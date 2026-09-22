# SCHEDULER-NEXT — the resume for SCHEDULER #14 (written 2026-09-22 by SCHEDULER #13, kept current at each landing)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its "Mechanics learned" section is the practical half), then
`docs/architecture/BIO_System_Design.md` **whole**, then this, then `QUEUE.md` and `BACKLOG.md` whole. Everything below was
MEASURED at this landing (2026-09-22 ~16:30Z, on `origin/main` @ `81510280` plus this commit). It is a POINTER: re-measure
before you rest anything on it. **SCHEDULER #13 is LIVE** (about 25% of its context) and rewrites this file at every
landing, not only at its refresh, because Bob moves development to cloud Claude Code under his second account TODAY
(`kickoffs/NEW-MACHINE.md` §0) and the switch may come without a handoff turn. **WRITTEN FOR A SUCCESSOR WITH NO MEMORY,
POSSIBLY IN THE CLOUD:** what this says about "the Mac" (the machine check, `ps`, local worktrees, `archive_session`)
applies only if you run there; in the cloud those rules are SUSPENDED until measured (NEW-MACHINE §0).

## The plan, as I left it

- **THE ORDERING LAW** (Bob, 2026-09-22, `CLAUDE.md` §2; `kickoffs/SCHEDULER.md` step 3): product before process; a process
  row is placed only if it CUTS GATE TIME or UNBLOCKS PRODUCT, and may then sit near the head; every other process row goes
  behind the product rows; landings are batched, ONE per wake. Bob, ~16:10Z: lane contention *"must be understood and
  fixed"* (M-97: 24 of 59 recorded gate runs discarded that day), so the tree-sharing rows stay at the head.
- **NO CLAIM BLOCK for an edit that lands in one commit** (`CLAUDE.md` §4, BOB #27): this lane writes none for its own
  files; DELEGATION state lines stay.
- **Cache (8):** LED-7 (this lane's own act, never a worker slot) · M0-106 (DIST's own act: its WITNESS at the 0.72.0 cut) ·
  M0-107 · REC-166 · REC-165 · M0-110 (the `coord` branch, SPLIT by BOB #27: stage 1 new files only; stage 2 waited for
  M0-99, now DONE) · REC-167 · UI-77. CONDUCT #13's first spawns, per its CONDUCT-NEXT: REC-166, M0-107, REC-165, M0-110.
- **Backlog (115), top:** M0-114 (`blocked`: the gates on GitHub's machines, TREE-SHARING §3–§4, until the first cloud
  session's FULL gate time and pass count are in NEW-MACHINE §0) · M0-111 (landing in batches, `depends-on` M0-110) · M0-116
  (a `MEASUREMENTS.md`-only landing re-runs a third of the battery: BOB #27's defect, its fix named, runnable now) · M0-100
  (`depends-on` M0-111) · D-85 · D-116 · CAP-13 · D-389 · REC-160 · D-57 · the M1-M7 corrections · the M8 corrections
  (REC-159, REC-162, REC-155, REC-158, D-311, UI-73, D-82, D-125) · D-278 (M9, placed this landing) · COFF-13 · D-52 … D-178 ·
  the features (UI-74 first; D-148 and D-149 after UI-69) · then BEHIND THE PRODUCT ROWS the process rows (M0-104 …), the
  ledger tooling with M0-115 after LED-9, the instrument cluster, the older M0 rows, the four blocked rows at the foot.
- **`BACKLOG.md` is 153,012 B of 153,600** (150 KiB, KEPT by BOB #26: revisit only on an instance of a spawn delayed or
  misbriefed by a cut row). Every uncut row is now at the TOP: this landing's foot cut reached D-311, REC-158, REC-155,
  REC-162, REC-159, D-54 and CAP-14, so EVERY PLACEMENT NOW CUTS THE NEXT ROWS TO RUN; each is VERBATIM in
  `QUEUE-cut-2026-09-22.md`. If a cut row ever delays or misbriefs a spawn, that instance goes to BOB (the budget's trigger).
- **DEBT.md: 98 open rows.** The floor that stopped the fold is gone (M0-109). **D-388 moves only after M0-115 lands**
  (`corpuscheck.test.mjs` §5 reads the literal `| D-388 |` line; WORK-PIPELINE §3).
- **BOB INBOX: EMPTY.**
- **Ids:** mintid gave M0-114 and M0-115 because this lane's own done text named the next M0 number before it was minted,
  and archiving that text raised the prose floor; the two numbers below M0-114 are GAPS, never allocated (the text was
  corrected before landing). Mint first, then write the id anywhere.

## Owed acts, in order

1. **CONDUCT's completions** (CONDUCT #13 now): ONE commit per report — the landing sha an ancestor of `origin/main` AND
   the row's work read at the code, `done`, `node tools/ledger.mjs archive <ID>`, then `refill`, then `invariants`; tell
   CONDUCT what entered. A landing's order is in SCHEDULER.md's mechanics (place without cutting, refill, THEN cut).
2. **M0-106:** close when DIST reports the 0.72.0 cut commit and its step-1 line naming the GREEN FULL record it relied on
   (owed no earlier than 2026-09-23 04:00Z). In the cloud a record lives in one clone (D-293), which is M0-114's premise.
3. **M0-114** leaves `blocked` when NEW-MACHINE §0 records the first cloud session's FULL gate time and pass count.
4. **THE INTENT LAYER'S TRIGGER** (BOB #25; the Framework's front matter, §12): send its DESIGN act to BOB when
   `node tools/status.mjs 12.publish` and `12.accept` read BUILT. Both ABSENT at this landing.
5. **LED-7, one landing per wake, batched.** Oldest first after the defects: D-175 (a ±2 assertion drift on an
   unmodified tree, 2026-08-04: needs two battery runs, so a worker via CONDUCT or a process row behind the product
   rows), D-128 and D-129 (design rows: BOB, in a group of three or four), D-134 (routed to BOB with D-136 on 2026-09-19;
   read its answer first), D-147 (the request lifecycle, a design row beside D-148 and D-149), D-150, D-153, D-156,
   D-159, D-165. D-121 and D-124 are COLLIDED ids (LED-8); D-64's four questions are BOB's; D-53 is with Bob; D-388 waits
   on M0-115. The fold's CLOSING landing retargets WORK-PIPELINE §3's list (BOB #27 added M0-109's items 2 and 3).
6. **HELD under the law (process rows that pay nothing), not placed:** the retirable control's declared arm count (the
   draft `row-drafts/M0-108.md` on `origin/scheduler12/row-drafts`; its id is minted, so keep it out of the corpus unless
   you place it); D-441 (`decided.mjs` blind to title-case ruling markers; in `DEBT.md`, its fix named).
7. **Not rowed, this lane's call (BOB #26):** a DIGEST-level duplicate across bundles, `LINK-FIDELITY.md` "The work, in
   order" step 5's cross-bundle check in `op=audit`; place it beside D-179 when its turn comes.

## Where the lane's scripts are

`origin/scheduler13/row-drafts` (never merged): `lane-scripts/` holds this landing's `place13.mjs` (placement and the
balanced foot cut, `--place` and `--cut` separately), `land13.mjs` (the done words, the inbox drains, the DEBT doors by
`owed.mjs`'s own predicate, the DELEGATION lines), `m0110.mjs`, `sched13.mjs`, and SCHEDULER #12's older scripts.
`origin/scheduler12/row-drafts` keeps SCHEDULER #12's drafts and the held patch, now spent (D-148 and D-149 landed).

## Done this session (verified on the remote)

Archived SCHEDULER #12 (D-398's three conditions, its CronList empty by its own reply; its worktree removed, +653 MiB).
ONE landing: REC-163, M0-109 and M0-99 CLOSED, each by content; all three BOB INBOX entries DRAINED — M0-114 placed blocked
(TREE-SHARING item 2), D-278 placed after D-125 with group (1) closed in fact, D-148 and D-149 placed after UI-69; M0-115
placed (M0-109's DELEGATION item 1); M0-116 placed after M0-111 (BOB #27's gate-selection defect, verified at the code);
M0-110 split into its two stages (BOB #27); the refill moved M0-110, REC-167 and UI-77; eleven rows cut to their fields; `kickoffs/SCHEDULER.md`'s two `DECIDED.md` sentences corrected (M0-99's DELEGATION
item 9) and four durable mechanics added from SCHEDULER #12's handoff.

## Your first acts

`git fetch origin`; confirm line 1 of this file on `origin/main`. On the Mac: `scutil --get LocalHostName` must print
Sparky-Air; `npm ci` in `bio-plane/`, `pdf-worker/` and `ocr-worker/` (check `df -h`). In the cloud: the same `npm ci`,
and `node tools/plancheck.mjs` before any push (it installs the push guard a fresh clone lacks). Arm the self-wake (every
30 minutes, off :00/:30) and its 5-day renewal, where `CronCreate` exists. SCHEDULER #13's crons are `5cb4402b` (:14/:44)
and the one-shot `57f85344` (27 Sep): it deletes both before it stops; archive it under D-398's three conditions after its
own CronList reads empty by message, or, if you cannot reach it, say so to BOB. Then `node tools/ledger.mjs invariants`,
then the owed acts.
