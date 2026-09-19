# SCHEDULER-NEXT — the resume for the next SCHEDULER, in the OTHER Claude Code account (written 2026-09-19 by SCHEDULER #1 at Bob's stand-down)

Read `CLAUDE.md`, then `kickoffs/SCHEDULER.md` (its "Mechanics learned" section is the practical half), then this, then
`QUEUE.md` whole. Everything below was measured on `origin/main` at the commit that carries this file. It is a pointer:
re-measure before you act on any line (`CLAUDE.md` §1).

## Why this lane stopped

Bob, 2026-09-19, via BOB #16: at 91% of weekly usage every lane spins down, saves everything, and stops; development
moves to the other account. SCHEDULER #1 finished the batch it held, committed it conserved, deleted its self-wake, and
started nothing else.

## The plan, measured

- **The pipeline is LIVE** (LED-6 done at `c25cac55`): `QUEUE.md` is the cache (8 rows), `BACKLOG.md` holds the rest in
  order, `docs/archive/ledgers/QUEUE-closed.md` holds what is done. `node tools/ledger.mjs invariants` reads P1–P5 PASS,
  0 armed FAIL. Rows cut to their fields name `docs/archive/ledgers/QUEUE-cut-2026-09-19.md`, which holds their full text.
- **Cache:** REC-152 and REC-151 `running`; then UI-67, UI-72, LED-7, REC-135, MK-3, REC-146 `queued`.
- **Backlog:** 33 rows. The top is D-158 (placed by LED-7 batch 1), then MK-5, M0-71, REC-147 (blocked on M0-71's
  measured gate), UI-68, REC-148, UI-69, REC-149, REC-150, UI-70, UI-71, REC-122, CAP-11, FW-20, CPDF-3, DIST-5, the M0
  rows (M0-77 first), then the blocked tail (SK-5, UI-60, REC-15, UI-17).
- **Ordering rule in force** (BOB #16, while usage was short): disclosure and authority rows first, then corrections to
  landed work, then features, then M0.
- **TRACKED ELSEWHERE** (end of `QUEUE.md`): DS-1/2/3, FL-6, PL-16 — ids allocated by the archived IS build plan.

## Owed acts, in order

1. **Completions in flight.** REC-152 was in CONDUCT #6's full gate, and REC-151 was live, when the lanes stopped. When
   their landing shas reach you, close each in ONE commit: verify, archive, refill (`kickoffs/SCHEDULER.md`, "Mechanics").
   If a row reads `running` with no live worker, read its branch before concluding anything (`QUEUE.md`'s preamble).
2. **LED-7, the debt fold — this lane's act** (Bob, 2026-09-19; `WORK-PIPELINE.md` §3). DEBT.md holds **218 open rows**
   (223 before batch 1). **Batch 1 (10 rows):** closed in fact D-141, D-428, D-193, D-42; placed D-158; routed to BOB
   and NOT moved D-325 (admin-class confinement vs the witness posture) and D-52 (the export-notification channel);
   carried to batch 2, NOT moved, D-134 and D-136 (admin ops' session reachability: `SESSION_OPS` and the ballot's call
   site need a trace) and D-92 (an intermittent 403, undiagnosed since 2026-07-30). The security/disclosure candidates
   still open, by a keyword scan (a candidate list, not a verdict): D-55, D-60, D-80, D-116, D-126, D-138, D-148, D-149,
   D-155, D-177, D-195, D-182, D-199, D-203, D-226, D-235, D-339, D-284, D-306, D-353, D-355, D-359, D-356, D-414, D-404,
   D-396. Take ~20 per batch, each verified at the code, each out by one of the three doors in the same commit; report
   counts to BOB (in / closed / placed / limitation).
3. **D-325 and D-52 need BOB's decision.** Tell BOB in your first message; they were routed in the batch-1 commit
   message and not yet by `SendMessage` when the stop came.
4. **CONDUCT-NEXT.md line 34** still describes the old "THE BUILD ORDER table". CONDUCT #6 said it would fix this at its
   handoff; check.

## Process lessons not written anywhere else

- The self-wake loop is cheap only if the no-op turn is ONE fetch and one line. Every write costs a gate run of about
  4–6 minutes. Batch the closes that arrive together into one commit.
- **Weekly usage is the binding limit, not context.** At 91% the lanes stopped with context to spare. Pace the fold by
  usage. Batches of 20 rows cost most of a context window at the verification depth this lane uses.
- A row's size budget (2 KiB backlog, 3 KiB cache) fits fields, not briefs. Write new rows as fields from the start
  (title, order, milestone, interface, design, depends-on, accepts-when with its control), and put any history in the
  commit message.
- When CONDUCT spawns a P0 ahead of the order (REC-143 did), re-place it first at your next act and say why on its
  `order:` line.
- The order audit's strongest finds were claims no tool could see: a row spliced into prose (UI-60), stale blockers
  (CPDF-3, VF-7), a state contradicting its own text (SK-5). Re-read the rows, and do not stop at running the tools.

## Your first acts

`git fetch origin`; confirm `origin/main:docs/development/kickoffs/SCHEDULER.md` line 1. Arm the self-wake and its 5-day
renewal (`CLAUDE.md` §4). Tell CONDUCT and BOB you are up, run `node tools/ledger.mjs invariants`, then take owed act 1.
