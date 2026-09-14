# The scheduler: one reconciling Durable Object alarm

**Status** · The DECISION RECORD for the plane's periodic work, decided and built 2026-07-31 by RECORD as REC-1 (milestone M1) and approved in the item rather than by a separate ruling. [BUILT] and live: the reconciling Durable Object alarm, the `#schedConsumers` registry, earliest-wake reconciliation, idle self-termination and the two producers are all in the SCHEDULER block of `bio-plane/src/store.mjs`, with `bio-plane/test/scheduler.test.mjs` as the accepts-when. COMPLETE as the decision it records — the fork it settled (one reconciling alarm, never a Worker cron, never a second alarm) has held through every consumer added since, and each new consumer joined exactly the way this file says. NOT complete as a description of the registry AS IT STANDS: two sections still say the registry holds "the two real consumers", and it holds ELEVEN, measured in the source on 2026-09-14. The mechanism is the authority; the counts in this prose are not, which is the very argument the file makes about CPDF-13. as of 2026-09-14.

**Place in the system** · A level-2 design serving construct 14 of `BIO_System_Design.md` §3, *scheduler and operations*, and through it construct 2 (intake and capture) and construct 10 (standing intent and monitoring), whose clocks are consumers of this one alarm. **That row names no level-1 document that owns the construct**: it lists this file and `INBOX-GRAMMAR.md`, and points at `BIO_Technical_Architecture_Decisions_v10.md` §10.7, whose interruption model is the RULE the plane implements — recover by re-deriving outstanding conditions from durable state, never by trusting a signal — while §10.7's own mechanisms are retired (that document's front matter says so). This file is the WHY the next periodic consumer inherits, and it is cited by name in `store.mjs` at every site where a consumer was appended.

**Incomplete sections** ·
- §The mechanism — stale in its count. "The two real consumers are ALWAYS due when the alarm fires" described a registry of two on 2026-07-31; `#schedConsumers` holds ELEVEN real entries today (selection-sweep, task-drain, archive-monitor, connection-derive, overdue-scan, queue-renotify, monitor-cadence, ai-run-reap, capture-request-drain, ai-run-wake, calibration-reprobe — read from `store.mjs` on 2026-09-14), and most are INTERVAL consumers due only at their own anchored `next`, which is the other arm the same paragraph describes. The two producers it names are still the two producers; the always-due claim is now true of two entries out of eleven.
- §The test seam — the same stale count, one sentence further: "unset → the registry is exactly the two real consumers" is false. Unset, the registry is the eleven real consumers and no probe; the seam itself is unchanged, still `SCHED_PROBE`-gated and still inert in production.
- §I5 note — true of REC-1 and true of nothing since. Consumers appended later DO carry schema tables (`calibration_subjects`, `monitor_fired`, `monitor_tick_epoch`), so this section describes the schema footprint of the ITEM that created the scheduler, not the footprint of the scheduler as it stands, and a reader taking it for the latter would conclude the alarm owes `op=purge` nothing.
- §The eleventh consumer — correct today, verified against the registry on 2026-09-14, and fragile in exactly the way the section itself diagnoses: it convicts CPDF-13 of pinning a count in prose and then pins its own. One more consumer makes "the eleventh entry" wrong, and nothing in the gate will notice.

**Contents**
- [The decision](#the-decision)
- [Why the DO alarm and not a Worker cron](#why-the-do-alarm-and-not-a-worker-cron)
- [The mechanism, and how the next consumer joins](#the-mechanism-and-how-the-next-consumer-joins)
- [The eleventh consumer, and what it costs a group (CPDF-13, D-183)](#the-eleventh-consumer-and-what-it-costs-a-group-cpdf-13-d-183)
- [The test seam](#the-test-seam)
- [I5 note](#i5-note)

---

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

## The eleventh consumer, and what it costs a group (CPDF-13, D-183)

`calibration-reprobe` is the eleventh entry in `#schedConsumers`, appended
exactly the way this file says a consumer joins: no cron line, no second alarm,
and no timer of its own. **It is worth recording that QUEUE.md CPDF-13 calls it
"a SIXTH REC-1 alarm consumer", which it was on 2026-08-04 when Bob wrote the
entry — five landed while the item sat queued.** The count in the item is stale;
the registry and `test/scheduler.test.mjs`'s totality assertion are not, which is
the argument for pinning a count in a test rather than in prose.

**What it is for.** A transcription's grade rests on a fidelity letter; a
fidelity letter is a MEASUREMENT of a named engine AT A DATE; engines move. With
no clock, the record's grades rest on a measurement that silently ages and
nothing is looking. This consumer is the thing that looks. The construct it
serves is `bio-plane/src/calibration.mjs`.

**THE CADENCE IS A DECLARED CONSTANT AND IT IS `CALIBRATION_CADENCE_MS` —
THIRTY DAYS.** It lives in `calibration.mjs`, in one place, and is deliberately
NOT re-typed here: a number carried by hand into a second file is this
repository's most-repeated finding. It is CHOSEN rather than measured — nobody
has yet measured how fast a derivation engine drifts — and it is **revisable by
measurement**. When somebody measures a real drift interval, that constant moves
and the reason moves with it.

**WHAT IT COSTS, STATED HERE SO NO GROUP DISCOVERS IT BY BEING BILLED FOR IT:**

- **ONE PROBE PER REGISTERED ENGINE PER CADENCE.** Not one per document, not one
  per capture, not one per reading. A group with one calibratable engine pays for
  twelve probe runs a year.
- **ON THE INSTANCE'S OWN ACCOUNT, against the free allocation.** Never a vendor
  key and never a second account: the distribution model puts a sovereign
  instance into each group's own Cloudflare account, and a capability that
  required somebody else's credential is not one this project can ship (D-115's
  class, DEC-35's own argument).
- **AND ZERO ON AN INSTANCE THAT HAS REGISTERED NOTHING.** `#calibrationWake`
  returns `null` on its first line when `calibration_subjects` is empty, so an
  instance with no calibratable engine holds **no alarm at all** — the
  self-termination property this whole file exists to preserve. Turning the
  feature on is an act (`op=calibrationsubject`); until a group performs it, this
  consumer costs exactly nothing.

**The tick runs no probe and writes no calibration.** This plane holds no
derivation engine of its own, so the tick marks a subject OWED and says so in
words. A tick that treated "the cadence elapsed and nobody announced anything" as
grounds to refresh a calibration would be the claim-versus-measurement failure
committed by the scheduler; `calibrationRecord` refuses a calibration with no
probe behind it, so it could not do it even if it tried.

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
