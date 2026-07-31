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

## The flow

1. BOB reaches a decision and decomposes it into independent pieces.
2. CONDUCT enqueues each piece in `QUEUE.md` under its area, with the interface
   it sits behind and its depends-on. **CONDUCT is the GATE:** nothing becomes
   runnable until CONDUCT has confirmed it is genuinely independent (behind a
   stable interface or on non-overlapping paths) or explicitly ordered.
3. CONDUCT keeps the active areas' workers busy from the top of each queue.
4. A worker lands its piece; CONDUCT verifies (full battery + re-runs negative
   controls, especially for destructive or security-sensitive changes),
   integrates on `main`, records bookkeeping, and spawns the area's next item.
5. Cross-area needs are DELEGATIONS (`CLAIMS.md`); CONDUCT routes them into the
   owning area's queue.

## Concurrency: sized to CONDUCT, not to the subscription

CONDUCT integrates serially, so it is the bottleneck; parallelism is sized to
what it can verify-and-land, not to the raw subscription ceiling. Standing
budget: **two active development areas at once**, plus the BOB session and DIST
when a release is being cut. That is about all CONDUCT keeps integrated cleanly;
more workers pile up behind it.

## Pipelining: dormant areas wait their turn

Areas beyond the two active ones stay DORMANT with their queues pre-seeded. When
an active area's queue empties, a dormant area is promoted into the freed slot.
Define the pipeline ahead of time, run two, let the rest wait in the wings.

## The target is integrated-correct throughput

Not agent busyness. An idle ephemeral worker costs nothing; work that lands
wrong, or piles up unintegrated, costs a lot. Optimise for pieces that land
green and meet every objective, policy and standard — the only throughput that
counts.
