# scheduler — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 10. Code today (measured on `tranche/T3` @ `edbd39bb`; `build/extraction/scheduler.md` has the table): `bio-plane/src/store.mjs` 3382–3950, the SCHEDULER block (`SCHED_GRACE_MS` 3429, `#schedConsumers` 3439–3785, `alarm` 3793, `onAlarm` 3795–3880, `#reconcileAlarm` 3891–3900, `#armScheduler` 3906–3913, `#armSweep`, `#armDrain` 3919–3920, the probe seam 3929–3950); `#armConnectionDerive` 3344; the arms in the `promote` and `biasadopt` routes (48512–48531, 49030–49031). Nothing in `index.mjs`, `schema.mjs` or `bio-checks.mjs`. `from`: `legacy-store`. Not yet met: R3, R9 (four producers), R10 (K102), R11, R12 (D-583). Old-plan row carried: D-583 (R12). N63 and N66 folded by a drafting worker for BOB #43, 2026-09-26: R5 and R9 name the providers' services; R9 states how a later producer arms. N164 and N167 folded by a worker for BOB #53 (K206, K214): R5 names intent's `ageSurfaced` and reevaluation's `raiseNotices` as consumers, and R10 names intent's `gaps` as the rank's read; not yet met. N178 folded by BOB #54 (K228): R5 and R10 name intent's R27, R28 and reevaluation's R25. R5's consumers are met (K478); R10's read is as its own mark says. Action layer folded 2026-09-30 (K608): R2, R5, R9 name `deadline-recheck`; not yet met. T23, by a fold worker for BOB #94 at T23's opening, on `fold/T23-b` from `tranche/T23`, 2026-10-02: R5 gains the consumers `gathering-sweep` (`monitoring` R56; `build/plan/draft-monitoring-r29.md`, K1094) after `monitor-cadence`, and `working-on-seal` and `working-on-attest` (`network-notices` R12, R14, R15, R17; `build/plan/draft-network-notices.md`, DEC-111, K1031) after `deadline-recheck`; R9 gains a promotion that ratifies or re-ratifies a sweep; not yet met (T23 L10). Uses gain `network-notices`.

**Size (P6).** About 590 lines move (about 180 without comment-only and blank lines). A job reads it with the public parts of the modules whose consumers it runs. Well under 4,000.

## Public

### Purpose

The plane's periodic work runs on one reconciling Durable Object alarm, never on a cron (SCHEDULER.md). This module holds the registry of consumers, each of which says when it next wants to wake, whether it is due, and what to do; it runs the due ones when the alarm fires, keeps the alarm at the earliest wake any consumer still wants, and deletes it when none does, so an idle instance holds no timer. The work itself is each consumer's owning module's.

### Provides

Terms. A **consumer** is `{name, key, due(now), wake(now), tick(now)}`: `wake` is the instant it next wants the alarm or null; `due` the instant it is due or null; `tick` does the work and answers what it did. The **grace** is 250 ms.

**onAlarm(now) → answer**; `alarm()` (the runtime's handler) is `onAlarm(Date.now())`
- **R1** It runs, in registry order, the `tick` of every consumer whose `due(now)` is not null and is at most `now` + grace, awaiting each; then it reconciles authoritatively over the whole registry: the alarm is set to the smallest non-null `wake(now)`, or deleted when there is none.
- **R2** The answer is `{swept, drained, created, folded, refused, waiting, remaining, rearmed, nextAt, probes}` (the drain's counts, zero when it did not tick; `rearmed` whether an alarm is set; `nextAt` its instant or null; `probes` the test probes that ticked), plus each other consumer that ticked, its answer under its key: `monitor`, `connderive`, `overduescan`, `queuerenotify`, `monitorcadence`, `airunreap`, `capturerequests`, `airunwake`, `calibration`, `groupdomain`, `biasdebt`, `deadlinerecheck`, `gatheringsweep`, `workingonseal`, `workingonattest` (K1160), and a registered consumer's own. A consumer that did not tick is absent. A real consumer never appears in `probes`.
- **R3** A consumer whose `due`, `wake` or `tick` throws is answered under its key as `{error}` with the message; every other consumer still ticks and the reconcile still runs.

**arm(now) → instant | null** (the producers' door; `#armScheduler` today)
- **R4** Reconciles without firing: the alarm is set when none is set or when the earliest wake is sooner than it, never pushed later; deleted when no consumer wants one. It answers the alarm as it stands. It runs no tick and writes no work.

**The registry**
- **R5** The consumers, in this order, each calling its owning module: `selection-sweep` (`retrieval` R22, its wake R51), `task-drain` (`tasks` R1, registered by R8), `archive-monitor` (`monitoring` R20), `connection-derive` (`connections` R18), `overdue-scan` (`progressions` R17), `queue-renotify` (`queue`), `monitor-cadence` (`monitoring` R19), `gathering-sweep` (`link-sweep`'s `sweepTick(now, rank)`, its R4, with `sweepDue` and `sweepWake`; `monitoring` R56 before N506's split), `ai-run-reap` (`ai-runs` R15), `capture-request-drain` (`capture-requests` R11, its due and wake from R37), `ai-run-wake` (`ai-runs` R16), `calibration-reprobe` (`calibration` R9, given the grace), `group-domain-recheck` (`instance-setup` R9, registered by R8), `bias-debt` (`bias` R33, its due and wake R41), `intent-age` (`intent`'s `ageSurfaced(now)`, its R17, with `ageDue` and `ageWake`, its R27), `notice-sweep` (`reevaluation`'s `noticeSweep(now)`, its R25: one batch of its R14 sweep, `raiseNotices`, per tick, the pass held by `reevaluation` and pending after a newer capture is received; with `noticeSweepDue` and `noticeSweepWake`), `deadline-recheck` (`monitoring`'s `deadlineRecheck(now)`, its R34 and R35, with `deadlineRecheckDue` and `deadlineRecheckWake`, its R50), `working-on-seal` (`network-notices`' weekly seal, its R14 and R15) and `working-on-attest` (its `monthly`, `closed` and `lapsed` attestations, R12, and its retried openings, R17), each with its own due and wake. `capture-request-drain` ticks before `ai-run-wake`, so a request that completes on an alarm wakes its run on the same alarm.
- **R6** `selection-sweep`, `task-drain`, `archive-monitor`, `connection-derive` and `overdue-scan` are due at every firing; every other consumer is due only when its owner says so, so it fires at its own moment and at no other consumer's.
- **R7** Every cadence, batch and delay is its owning module's. This module holds only the grace, and no interval of its own for any consumer (P-87: re-notify at the stage's own interval, never a global one).

**register(module, consumer)** (for modules later than this one)
- **R8** A later module registers each of its consumers once, at start; a name already registered is refused `CONSUMER_DECLARED`. A registered consumer takes its place in R5 when R5 names it, and is otherwise appended in the modules' total order. It then inherits R1–R4.

**Producers** (K72 (9))
- **R9** On an idle instance, each act that creates a consumer's work leaves the alarm armed at that consumer's wake: a selection created (`retrieval` R52), a task enqueued and, when monitoring is configured, a counted source failure (`capture` R44), a resolution that marks an entity (`entities` R13), a progression threaded (`progressions` R33), a lens moved (`bias` R23), a promotion that leaves a bundle monitored or an action holding a `pending` clock entry, and a promotion that ratifies or re-ratifies a sweep (`promotion` R45), a calibration subject registered and a calibration signal recorded (`calibration` R18, R19), a run opened (`ai-runs` R43) and a capture request filed (`capture-requests` R44) (N223), a group domain set (`instance-setup`). This module reaches each earlier producer by registering `arm` with the notice its owner offers, never by being called by it; a producer in a module later than this one (`instance-setup`, `queue`) offers no notice and arms through R8, calling `arm` (R4) itself (K93 (5)). Until each module was extracted, `legacy-store` armed for it (retired, K858).

**Ordering by intent** (`layers.md`, layer 7)
- **R10** Where a consumer's due work exceeds its batch, the scheduler ranks it by what `intent`'s `servesOf` (its R28) answers each item serves: work serving an objective's open gap (intent R6), then work serving an aspiration in force, then longest-waiting (no aspiration ranks above another, intent R12; K228); but any work that has waited longer than one whole cadence of its own goes first, so priority orders the work and never starves it. Each batch-bounded tick (`monitor-cadence`, `archive-monitor`, `gathering-sweep` (`link-sweep`'s `sweepTick(now, rank)`, its R4; monitoring R56 before N506's split; K1122), `capture-request-drain`, `bias-debt`) receives the rank with its `now`, as `tick(now, rank)` (N224); a sweep item (`<bundle>#<id>`) serves what its bundle serves, so the rank asks `servesOf` about that bundle (K1160): `monitoring`'s `cadenceTick(now, rank)` and `archiveTick(now, rank)` (its R19, R20), `capture-requests`' tick (its R11, R12) and `bias`'s `biasDebtSweep` (its R33) as each takes it.

**Recovery** (Technical Architecture v10 §10.7's rule)
- **R11** When the instance starts, it reconciles as `arm` does, so an alarm lost to a failed firing or a reset is re-derived from durable state rather than waiting for the next producer.

**The suspended run** (D-583)
- **R12** A run waiting on a request that reaches `expired` is woken on the alarm that expires it, the expiry told to it as a completion, exactly once.

**The test seam: `SCHED_PROBE`; `schedProbeArm(now)`, `schedProbeLog()`, `schedAlarmAt()`**
- **R13** With the binding `SCHED_PROBE` unset or unparsable the registry is exactly R5's consumers and the seam writes nothing. Set to a list of `{name, period, fires}`, each becomes an interval consumer due first at arming + `period`, then every `period`, for `fires` firings; its state lives in the storage value `sched_probe`, not a table. `schedProbeArm` arms as R4, `schedProbeLog` answers each probe's firing instants, `schedAlarmAt` the alarm.

## Private

### Uses

- `retrieval`, `connections`, `progressions`, `bias`, `calibration`, `ai-runs`, `capture-requests`, `monitoring`, `link-sweep`: the due, wake and tick services R5 names, through their factories (K61).
- `retrieval` (`onSelectionCreated`, R52), `capture` (R44), `entities` (R13), `progressions` (`onThreaded`, R33), `bias` (`onLensChange`, R23), `promotion` (`onCommitted`, R45), `calibration` (`onSubjectRegistered`, R18; `onSignalRecorded`, R19; N223), `ai-runs` (`onRunOpened`, R43; N223), `capture-requests` (`onRequestFiled`, R44; N223): the notices R9 registers with.
- `monitoring`: `cadenceTick(now, rank)`, `archiveTick(now, rank)` (its R19, R20; N224), R10's rank passed in; `deadlineRecheck`, `deadlineRecheckDue`, `deadlineRecheckWake` (its R34, R50).
- `link-sweep`: `sweepTick(now, rank)`, `sweepDue`, `sweepWake` (its R4; `monitoring` R56 before N506's split), the `gathering-sweep` consumer (R5; T23).
- `network-notices`: the weekly seal (its R14, R15) and the attestations and retried openings (its R12, R17), each with its due and wake, the `working-on-seal` and `working-on-attest` consumers (R5; T23).
- `intent`: the rank (R10), through `servesOf` (its R28); `ageSurfaced` (its R17) with `ageDue`, `ageWake` (its R27), a consumer (R5; N167, N178).
- `reevaluation`: `noticeSweep`, `noticeSweepDue`, `noticeSweepWake` (its R25, over R14's `raiseNotices`, K199 (1)), a consumer (R5; N164, N178).
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

- **Factory.** `schedulerOf(ctx, env)`; the plane's Durable Object (`plane`, `src/plane/store.mjs`) delegates its `alarm()` to it (`legacy-store` did until its retirement, K858).
- **The drain.** `task-drain`'s tick (`taskDrain`), wake and progress flag (`#lastDrainProgress`, `TASK_DRAIN_*`) belong to `tasks`, the tasks inbox (K91 (3), K49's later module); the consumer is registered (R8) at its R5 slot by `tasks` (`tasks/index.mjs`, `drainConsumer`); `legacy-store` did until its retirement (K858).
- **R9 through promotion.** Promotion's projections run inside its transaction; the arm is a storage call made after commit, so it registers with promotion's post-commit notice (`onCommitted`, promotion R45), not as a projection.
- **The rank.** R10 needs `intent` to answer which objective or aspiration a bundle, address or request serves; the rank is passed into the tick, so no earlier module calls this one.
- **Keys.** R2's keys are today's; a job keeps them, since several suites read them.
- Tests: the probe seam proves R1, R4, R15, R16 by name; R3 gets a consumer that throws; R12 drives a render request past `expires` and reads `airunwake` on the same alarm; R14 reads the deployment configuration.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for the rulings)

- The registry, `onAlarm`, the reconcile, `arm` and the probe seam are this module's; each consumer's services are its owner's (the consumers map above), and R5's order is kept, `capture-request-drain` before `ai-run-wake` load-bearing.
- Later modules (`queue`, `instance-setup`, `tasks`; `legacy-store` until its retirement, K858) register their consumers (R8), as K31 does for promotion.
- R3 (a throwing consumer isolated), R9's four missing producers and R11 (reconcile at start) are stated from this reading.
- D-583 is carried as R12, met when `capture-requests` R29 counts `expired` as a completion; `ai-runs` keeps the wake (its R16).
- Uses: add `progressions`, `bias`, `entities`, `promotion`; drop `record-core`, `host-governor`, `extraction`, `strength`, `reevaluation` (nothing here calls them).
