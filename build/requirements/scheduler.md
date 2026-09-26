# scheduler — requirements

**Status** · DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 10. Code today (measured on `tranche/T3` @ `edbd39bb`; `build/extraction/scheduler.md` has the table): `bio-plane/src/store.mjs` 3382–3950, the SCHEDULER block (`SCHED_GRACE_MS` 3429, `#schedConsumers` 3439–3785, `alarm` 3793, `onAlarm` 3795–3880, `#reconcileAlarm` 3891–3900, `#armScheduler` 3906–3913, `#armSweep`, `#armDrain` 3919–3920, the probe seam 3929–3950); `#armConnectionDerive` 3344; the arms in the `promote` and `biasadopt` routes (48512–48531, 49030–49031). Nothing in `index.mjs`, `schema.mjs` or `bio-checks.mjs`. `from`: `legacy-store`. Not yet met: R3, R9 (four producers), R10 (Open for Bob 1), R11, R12 (D-583). Old-plan row carried: D-583 (R12). N63 and N66 folded by a drafting worker for BOB #43, 2026-09-26: R5 and R9 name the providers' services; R9 states how a later producer arms.

**Size (P6).** About 590 lines move (about 180 without comment-only and blank lines). A job reads it with the public parts of the modules whose consumers it runs. Well under 4,000.

## Public

### Purpose

The plane's periodic work runs on one reconciling Durable Object alarm, never on a cron (SCHEDULER.md). This module holds the registry of consumers, each of which says when it next wants to wake, whether it is due, and what to do; it runs the due ones when the alarm fires, keeps the alarm at the earliest wake any consumer still wants, and deletes it when none does, so an idle instance holds no timer. The work itself is each consumer's owning module's.

### Provides

Terms. A **consumer** is `{name, key, due(now), wake(now), tick(now)}`: `wake` is the instant it next wants the alarm or null; `due` the instant it is due or null; `tick` does the work and answers what it did. The **grace** is 250 ms.

**onAlarm(now) → answer**; `alarm()` (the runtime's handler) is `onAlarm(Date.now())`
- **R1** It runs, in registry order, the `tick` of every consumer whose `due(now)` is not null and is at most `now` + grace, awaiting each; then it reconciles authoritatively over the whole registry: the alarm is set to the smallest non-null `wake(now)`, or deleted when there is none.
- **R2** The answer is `{swept, drained, created, folded, refused, waiting, remaining, rearmed, nextAt, probes}` (the drain's counts, zero when it did not tick; `rearmed` whether an alarm is set; `nextAt` its instant or null; `probes` the test probes that ticked), plus each other consumer that ticked, its answer under its key: `monitor`, `connderive`, `overduescan`, `queuerenotify`, `monitorcadence`, `airunreap`, `capturerequests`, `airunwake`, `calibration`, `groupdomain`, `biasdebt`, and a registered consumer's own. A consumer that did not tick is absent. A real consumer never appears in `probes`.
- **R3** A consumer whose `due`, `wake` or `tick` throws is answered under its key as `{error}` with the message; every other consumer still ticks and the reconcile still runs. *(not yet met: found in this reading; a throw today abandons the rest of the alarm and its reconcile)*

**arm(now) → instant | null** (the producers' door; `#armScheduler` today)
- **R4** Reconciles without firing: the alarm is set when none is set or when the earliest wake is sooner than it, never pushed later; deleted when no consumer wants one. It answers the alarm as it stands. It runs no tick and writes no work.

**The registry**
- **R5** The consumers, in this order, each calling its owning module: `selection-sweep` (`retrieval` R22, its wake R51), `task-drain` (`queue` R23, registered by R8), `archive-monitor` (`monitoring` R20), `connection-derive` (`connections` R18), `overdue-scan` (`progressions` R17), `queue-renotify` (`queue`), `monitor-cadence` (`monitoring` R19), `ai-run-reap` (`ai-runs` R15), `capture-request-drain` (`capture-requests` R11, its due and wake from R37), `ai-run-wake` (`ai-runs` R16), `calibration-reprobe` (`calibration` R9, given the grace), `group-domain-recheck` (`instance-setup` R9, registered by R8), `bias-debt` (`bias` R33, its due and wake R41). `capture-request-drain` ticks before `ai-run-wake`, so a request that completes on an alarm wakes its run on the same alarm.
- **R6** `selection-sweep`, `task-drain`, `archive-monitor`, `connection-derive` and `overdue-scan` are due at every firing; every other consumer is due only when its owner says so, so it fires at its own moment and at no other consumer's.
- **R7** Every cadence, batch and delay is its owning module's. This module holds only the grace, and no interval of its own for any consumer (P-87: re-notify at the stage's own interval, never a global one).

**register(module, consumer)** (for modules later than this one)
- **R8** A later module registers each of its consumers once, at start; a name already registered is refused `CONSUMER_DECLARED`. A registered consumer takes its place in R5 when R5 names it, and is otherwise appended in the modules' total order. It then inherits R1–R4.

**Producers** (K72 (9))
- **R9** On an idle instance, each act that creates a consumer's work leaves the alarm armed at that consumer's wake: a selection created (`retrieval` R52), a task enqueued and, when monitoring is configured, a counted source failure (`capture` R44), a resolution that marks an entity (`entities` R13), a progression threaded (`progressions` R33), a lens moved (`bias` R23), a promotion that leaves a bundle monitored (`promotion` R45), a calibration subject enabled (`calibration`), a run or request created (`ai-runs`, `capture-requests`), a group domain set (`instance-setup`). This module reaches each earlier producer by registering `arm` with the notice its owner offers, never by being called by it; a producer in a module later than this one (`instance-setup`, `queue`) offers no notice and arms through R8, calling `arm` (R4) itself (K93 (5)). Until a module is extracted, `legacy-store` arms for it. *(not yet met, for four producers, found in this reading: a capture request filed, a run opened, a calibration subject registered and a calibration signal arm nothing today, so on an idle instance the drain, the reaper and the re-probe wait for an unrelated producer; `op=calibrationsignal` answers `armed` without arming)*

**Ordering by intent** (`layers.md`, layer 7)
- **R10** Where a consumer's due work exceeds its batch, the scheduler ranks it by `intent`: work serving an objective's open gap, then by the priority of the aspiration it serves, then longest-waiting. Each batch-bounded tick (`monitor-cadence`, `archive-monitor`, `capture-request-drain`, `bias-debt`) receives the rank with its `now`. *(not yet met: new; Open for Bob 1)*

**Recovery** (Technical Architecture v10 §10.7's rule)
- **R11** When the instance starts, it reconciles as `arm` does, so an alarm lost to a failed firing or a reset is re-derived from durable state rather than waiting for the next producer. *(not yet met: found in this reading)*

**The suspended run** (D-583)
- **R12** A run waiting on a request that reaches `expired` is woken on the alarm that expires it, the expiry told to it as a completion, exactly once. *(not yet met: D-583; `capture-requests` R29 counts `captured` and `refused` only)*

**The test seam: `SCHED_PROBE`; `schedProbeArm(now)`, `schedProbeLog()`, `schedAlarmAt()`**
- **R13** With the binding `SCHED_PROBE` unset or unparsable the registry is exactly R5's consumers and the seam writes nothing. Set to a list of `{name, period, fires}`, each becomes an interval consumer due first at arming + `period`, then every `period`, for `fires` firings; its state lives in the storage value `sched_probe`, not a table. `schedProbeArm` arms as R4, `schedProbeLog` answers each probe's firing instants, `schedAlarmAt` the alarm.

## Private

### Uses

- `retrieval`, `connections`, `progressions`, `bias`, `calibration`, `ai-runs`, `capture-requests`, `monitoring`: the due, wake and tick services R5 names, through their factories (K61).
- `retrieval` (`onSelectionCreated`, R52), `capture` (R44), `entities` (R13), `progressions` (`onThreaded`, R33), `bias` (`onLensChange`, R23), `promotion` (`onCommitted`, R45): the notices R9 registers with.
- `intent`: the rank (R10).
- The Durable Object's alarm (`ctx.storage.setAlarm`, `getAlarm`, `deleteAlarm`).

### Invariants

- **R14** One alarm: the plane's periodic work runs on this Durable Object alarm alone; the deployed configuration declares no cron trigger, and no consumer sets an alarm of its own.
- **R15** Self-terminating: after any reconcile on an instance where no consumer wants a wake, no alarm is set.
- **R16** No starvation: a reconcile weighs every consumer's wake, not only those that ticked, so a slow interval consumer's wake survives a fast one going idle (the probes prove it with two cadences).
- **R17** Arming only schedules: `arm` and every notice this module registers write no consumer's work and run no tick.
- **R18** This module keeps no table and carries no check; no row of `bio-checks.mjs` belongs to it, and nothing of it is purged.
- **R19** It raises no queue item and holds no notification kind of its own (NOTIFICATIONS.md, Place: the scheduler and the catalogue share one kind vocabulary).
- **R20** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/development/SCHEDULER.md` whole (the decision, the mechanism, how a consumer joins, the test seam).
- `docs/architecture/BIO_System_Design.md` §3, construct 14, and through it constructs 2 and 10.
- `docs/architecture/BIO_Technical_Architecture_Decisions_v10.md` §10.7's general rule: recover by re-deriving outstanding conditions from durable state (R11).
- `docs/development/NOTIFICATIONS.md`, Place (R19); `build/layers.md`, layer 7 (R10) and layer 10's contract.

### Suggestions

- **Factory.** `schedulerOf(ctx, env)`; `legacy-store`'s `alarm()` and `onAlarm` delegate to it until the Durable Object class itself belongs to `control-plane`.
- **The drain.** `task-drain`'s tick (`taskDrain`), wake and progress flag (`#lastDrainProgress`, `TASK_DRAIN_*`) belong to the tasks inbox, which is `queue`'s (K91 (3), K49's later module); `queue` registers the consumer (R8) at its R5 slot, and `legacy-store` does until `queue` is extracted.
- **R9 through promotion.** Promotion's projections run inside its transaction; the arm is a storage call made after commit, so it registers with promotion's post-commit notice (`onCommitted`, promotion R45), not as a projection.
- **The rank.** R10 needs `intent` to answer which objective or aspiration a bundle, address or request serves; the rank is passed into the tick, so no earlier module calls this one.
- **Keys.** R2's keys are today's; a job keeps them, since several suites read them.
- Tests: the probe seam proves R1, R4, R15, R16 by name; R3 gets a consumer that throws; R12 drives a render request past `expires` and reads `airunwake` on the same alarm; R14 reads the deployment configuration.

## Open for Bob

1. **Priority against fairness (R10).** `layers.md` says scheduling orders work by the priority aspirations set and the gaps objectives leave. Today every batch-bounded tick takes the longest-waiting first, so nothing waits past its turn; ranking by priority alone would let low-priority work wait indefinitely while higher-priority work keeps arriving. *Recommendation:* rank by priority within each batch, but any work waiting longer than one whole cadence of its own goes first, so priority orders the work and never starves it.

## Decided by BOB (for the rulings)

- The registry, `onAlarm`, the reconcile, `arm` and the probe seam are this module's; each consumer's services are its owner's (the consumers map above), and R5's order is kept, `capture-request-drain` before `ai-run-wake` load-bearing.
- Later modules (`queue`, `instance-setup`, the tasks inbox's owner, `legacy-store` meanwhile) register their consumers (R8), as K31 does for promotion.
- R3 (a throwing consumer isolated), R9's four missing producers and R11 (reconcile at start) are stated from this reading.
- D-583 is carried as R12, met when `capture-requests` R29 counts `expired` as a completion; `ai-runs` keeps the wake (its R16).
- Uses: add `progressions`, `bias`, `entities`, `promotion`; drop `record-core`, `host-governor`, `extraction`, `strength`, `reevaluation` (nothing here calls them).
