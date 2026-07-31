# How this project runs: CONDUCT, BOB, and the work queue

Established 2026-07-31, when parallel development moved into Claude Code and the
`ARCH` role was renamed `CONDUCT`. `PARALLELISM.md` is the WHY (work parallelises
across stable interfaces). This is the HOW: who runs, how work flows, what the
limits are.

## Roles

- **BOB** — the human, working through a dedicated session (`kickoffs/BOB.md`).
  Where requirements, UX and architecture are decided. Its product is not prose
  but DECOMPOSITION: a decision, its full implications, and the independent
  pieces of work it becomes — each scoped and named with the interface it sits
  behind. BOB hands decompositions to CONDUCT.
- **CONDUCT** — the orchestration/integration session (`kickoffs/CONDUCT.md`),
  the evolution of `ARCH`. Owns the queue, spawns workers, verifies and
  integrates their output on `main`, records claims/delegations/interfaces, and
  escalates ONLY genuine decisions to BOB. Writes no area code itself.
- **Areas** — CAPTURE, CONTENT-PDF, DIST, and dormant CONTENT-HTML / FRAMEWORK /
  UI. Each is a body of work with a queue, not a standing agent.

## Workers are ephemeral; the queue persists

A worker is a worktree-isolated sub-session CONDUCT spawns to do ONE queued
piece. It builds, tests, reports, and ends — it does not live on and pull its
own next task. The persistence is in `QUEUE.md`: CONDUCT takes the top runnable
item for an active area, spawns a worker, integrates the result, marks it done,
and spawns the next. A larger plan is a sequence of queued items drained one
worker at a time — which is how CONDUCT "keeps spawning successive tasks"
without a long-lived agent.

## Where the plan lives (2026-07-31)

Three files, split by LIFECYCLE, and an item exists in exactly one of them at a time:

- **`MILESTONES.md`** — the capability ladder. What the work is FOR, what each
  milestone's acceptance is in terms of the record, and where every open piece of work
  is placed. Slow-moving.
- **`QUEUE.md`** — what is RUNNABLE. CONDUCT's, sole writer. Drained.
- **`DEBT.md` / `MEASUREMENTS.md` / the design docs** — knowledge. Append-only, and
  an INPUT to the queue rather than a rival to it.

**Nothing is work until it is in `QUEUE.md`.** `PLAN.md` is closed history.

## The flow

1. BOB reaches a decision and decomposes it into independent pieces, each placed
   under a milestone.
2. CONDUCT enqueues each piece in `QUEUE.md` under its area, with the interface
   it sits behind and its depends-on. **CONDUCT is the GATE:** nothing becomes
   runnable until CONDUCT has confirmed it is genuinely independent (behind a
   stable interface or on non-overlapping paths) or explicitly ordered.
3. CONDUCT keeps the active areas' workers busy from the top of each queue.
4. A worker lands its piece; CONDUCT verifies (`npm run test:battery` — the whole
   battery, every suite reported — plus the item's own `accepts-when:`, plus a
   re-run of the negative control for destructive or security-sensitive changes),
   integrates on `main`, records bookkeeping, and spawns the area's next item.
   `VERIFICATION.md` defines what "done" requires and holds the coverage floor.
4a. **When an area's queue DRAINS**, before promoting the next area, CONDUCT triages
   that area's `UNSCHEDULED` items from `MILESTONES.md` into the queue, or leaves them
   with a reason. Tying the triage to an event that already happens is what keeps the
   plan from falling behind the ledger again.
5. Cross-area needs are DELEGATIONS (`CLAIMS.md`); CONDUCT routes them into the
   owning area's queue.

## How an architectural change lands mid-flight, without stopping CONDUCT

Established 2026-07-31, after a BOB session made structural changes (a new area, a new
interface, a superseded queue item) that required CONDUCT to be PAUSED by hand. That
worked once and does not scale: architecture will keep changing, because discovery is
the premise, and a model where every change stops the machine is a model that
discourages the change.

**The mechanism is one this codebase already proved: a producer/consumer split.** D-98
stopped the daemon credential causing an inbox write by giving it a queue boundary and
one consumer. Same shape here.

- **`QUEUE.md` gains a `BOB INBOX` section at the top.** BOB APPENDS to it. CONDUCT is
  the sole writer of everything below it and DRAINS the inbox into the queue proper as
  part of its ordinary loop. No pause, no second file, no collision — the two parties
  write to disjoint regions.
- **What BOB may write directly:** `MILESTONES.md`, the design documents, new or
  PROVISIONAL entries in `INTERFACES.md`, appends to `DEBT.md` and `MEASUREMENTS.md`,
  and the inbox. **What it may not:** the queue body, any area's code.
- **A change that supersedes queued or in-flight work SAYS SO IN THE INBOX, naming the
  item id.** Whether to stop a running worker or let it land is worker lifecycle, and
  that is CONDUCT's call, not BOB's. BOB's duty is to make the supersession visible;
  CONDUCT's is to decide what happens to the work.
- **Superseded is never silent.** The item keeps its id, takes status `superseded`,
  and names what replaced it and where any branch work goes. `CPDF-2` is the worked
  example: superseded by the Worker topology, its branch becoming `CPDF-6`'s Tier 2
  core. An item that vanishes is indistinguishable from one nobody did, which is the
  same rule the record applies to findings.

Two obligations fall on whoever makes the change, and both were learned by getting
them wrong in the same session:

1. **An area may not be ACTIVE without a kickoff naming its paths.** `RECORD` was
   activated with no `kickoffs/RECORD.md`, so a worker spawned for it would have had
   nothing to read. Activating an area and writing its kickoff are one act.
2. **A kickoff your change supersedes is corrected in the SAME turn, by you.** This is
   the one licensed exception to "do not write another area's kickoff", and the reason
   is that the area's next session is precisely who the stale text misleads.
   `kickoffs/CONTENT-PDF.md` told its next worker to bundle `unpdf` into the plane for
   several hours after that approach had been overturned.

## Concurrency: sized to CONDUCT, not to the subscription

CONDUCT integrates serially, so it is the bottleneck; parallelism is sized to
what it can verify-and-land, not to the raw subscription ceiling. Standing
budget: **two active development areas at once**, plus the BOB session and DIST
when a release is being cut. That is about all CONDUCT keeps integrated cleanly;
more workers pile up behind it.

**Refined 2026-07-31: a slot is held by work that CHANGES PLANE BEHAVIOUR.** The limit
exists because verification and integration are serial and expensive, and two kinds of
work are neither:

- **Measurement-only items**, which commit no code and produce a decision input
  (CPDF-1 and CPDF-7 are the pattern). Integration is an append to
  `MEASUREMENTS.md`.
- **Test-estate items** (the M0 lane), which add assertions and change no behaviour.
  A worker either leaves the battery green or does not land.

Both still cost a worker and still get verified; neither occupies one of the two
slots, because the thing the slot rations is CONDUCT's behavioural-verification
attention. Getting this wrong in the other direction has a real cost: measurement work
gates design decisions, so parking it behind a behavioural queue is how a session ends
up building against an assumption it could have measured in one turn.

## Pipelining: dormant areas wait their turn

Areas beyond the two active ones stay DORMANT with their queues pre-seeded. When
an active area's queue empties, a dormant area is promoted into the freed slot.
Define the pipeline ahead of time, run two, let the rest wait in the wings.

## The target is integrated-correct throughput

Not agent busyness. An idle ephemeral worker costs nothing; work that lands
wrong, or piles up unintegrated, costs a lot. Optimise for pieces that land
green and meet every objective, policy and standard — the only throughput that
counts.
