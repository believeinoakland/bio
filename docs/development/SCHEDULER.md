# The scheduler: one reconciling Durable Object alarm

Decided and built 2026-07-31 (session record-agent-1, QUEUE.md REC-1, milestone
M1). This is the WHY the next periodic consumer inherits; the mechanism lives at
the top of the SCHEDULER block in `bio-plane/src/store.mjs`, and its accepts-when
is `bio-plane/test/scheduler.test.mjs`.

## The decision

**The plane's periodic work runs on ONE reconciling Durable Object alarm, not on
a Worker cron trigger.** A registry of consumers each declare when they next want
to wake; the single DO alarm is reconciled to the EARLIEST wake any consumer
still wants and is DELETED when none does. A consumer registers a `wake` and a
`tick` and inherits reconciliation and self-termination — it does not grow its
own trigger.

This was the fork REC-1 existed to settle before a third consumer landed. CAP-2
(D-109) had just made the one alarm serve a SECOND consumer (the task drain,
beside the selection sweep) by hand-writing a second arm and a second branch in
the re-arm. Monitoring, the archive-fallback eligibility clock, per-document
cadence and M4 ageing are each on the same course. Deciding the shape once, now,
is cheap; deciding it after three hand-written alarms are in the ground is not.

## Why the DO alarm and not a Worker cron

A `wrangler.jsonc` cron trigger fires the Worker's `scheduled()` handler on a
cron line. It loses all three properties the alarm has, and each loss is
concrete here:

1. **Granularity.** A cron's floor is one minute. The task drain already
   coalesces at one *second* (`TASK_DRAIN_DELAY_MS`). A cron cannot serve that
   consumer, so adopting cron would mean running cron *beside* the alarm — a
   SECOND scheduler, which is exactly the per-consumer sprawl this item exists to
   prevent. One reconciling alarm serves both a 1-second drain and a daily
   ageing clock; two mechanisms is the thing to avoid.

2. **Self-termination.** The alarm is deleted the moment nothing is pending, so
   an idle instance carries no timer and spends nothing. A cron fires every
   minute forever, awake or not. The distribution model puts a sovereign
   instance into each group's own Cloudflare account, most on the Free tier,
   where invocations are budgeted (D-118, measured by CPDF-7). A standing
   per-minute wake on every idle instance is a cost the alarm simply does not
   incur.

3. **Locality.** Every consumer reconciles against the DO's own SQLite —
   `selections`, `task_queue`, and the source/monitoring state the coming clocks
   will read. A cron at the Worker would have to hop into the DO to do anything
   anyway. The periodic actor belongs next to its state, where the reconciling
   alarm already lives.

The one honest point for cron — that a coarse, minutes-to-days consumer maps
onto a cron line naturally — does not outweigh running two schedulers. The alarm
serves the coarse consumer too.

## The mechanism, and how the next consumer joins

`#schedConsumers(probe)` returns the registry. Each entry is
`{ name, due(now), wake(now), tick(now) }`:

- `wake(now)` → the timestamp this consumer next wants the alarm, or `null` when
  it is idle. An idle consumer contributes nothing and cannot hold the alarm
  open. **This is the anchor of no-starvation: the reconcile keeps EVERY active
  consumer's wake, not only the one that just ran**, so a fast consumer cycling
  cannot shut a slow one out — when the fast one idles, the slow one's wake is
  still in the set and still re-arms the alarm.
- `due(now)` → whether this consumer should `tick` at the firing instant. The two
  real consumers are ALWAYS due when the alarm fires (they are cheap and a no-op
  on an empty subject, which preserves the exact pre-REC-1 behaviour their suites
  pin). An interval consumer is due only at its own anchored `next`, so it fires
  at its own cadence and no other's.
- `tick(now)` → do the work. `#sweepSelections` and `taskDrain` are unchanged;
  they are simply named by a registry entry now.

`onAlarm(now)` runs every due `tick`, then reconciles the alarm **authoritatively**
(`#reconcileAlarm(now, reg, exact=true)`) to the earliest remaining wake — a
fired alarm is spent, so onAlarm states the new earliest outright rather than
only pulling an existing one earlier. A producer that just created work arms via
`#armScheduler`, which reconciles the same way but only ever pulls the alarm
EARLIER, so a sooner wake another consumer set is never lost. The two existing
producers keep their names and call sites (`#armSweep` from `selectionCreate`,
`#armDrain` from `taskEnqueue`); both now route through the one reconcile.

**To add the monitoring / eligibility / cadence / ageing consumers:** append an
entry to `#schedConsumers`, arm it from whatever producer creates its work (or
give it a self-perpetuating `wake` if it is a pure clock), and it inherits
earliest-wake reconciliation and idle self-termination. Do NOT add a second alarm
or a cron; that is the decision this file records.

## The test seam

`bio-plane/test/scheduler.test.mjs` proves the mechanism with two synthetic
INTERVAL consumers ("probes") registered only when the `SCHED_PROBE` binding is
set — inert in production (unset → the registry is exactly the two real
consumers, and not one line of the seam runs). Probes are the clean way to
exercise two *independent* cadences deterministically and to make starvation
detectable by name; the two real consumers moved onto the mechanism are proven
still-working by `selection.test.mjs` and `task-drain-alarm.test.mjs`, which this
change leaves green.

## I5 note

No schema table was added or reshaped — the probe seam's state lives in a
`sched_probe` KV value, not a SQL table, so it needs no `op=purge` entry and no
migration. I5 is unchanged by REC-1.
