# scheduler — requirements

**Status** · In force: approved by Bob 2026-09-26 (K102), with later folds reviewed. Last changed T35 (T35-83: R12, K2029), T36 (T36-29: R24, option B; K2129, K2153) T37 (T37-24: R2, R7, R24 amended; N762; K2153, K2175) and T39 (T39-15: R25 new, R2, R5, R9 amended; N806; K2333); those marked not yet met (T37, T39), every other requirement met.

**Size (P6).** About 590 lines move (about 180 without comment-only and blank lines). A job reads it with the public parts of the modules whose consumers it runs. Well under 4,000.

## Public

### Purpose

The plane's periodic work runs on one reconciling Durable Object alarm, never on a cron (SCHEDULER.md). This module holds the registry of consumers, each of which says when it next wants to wake, whether it is due, and what to do; it runs the due ones when the alarm fires, keeps the alarm at the earliest wake any consumer still wants, and deletes it when none does, so an idle instance holds no timer. The work itself is each consumer's owning module's.

### Provides

Terms. A **consumer** is `{name, key, due(now), wake(now), tick(now)}`: `wake` is the instant it next wants the alarm or null; `due` the instant it is due or null; `tick` does the work and answers what it did. The **grace** is 250 ms.

**onAlarm(now) → answer**; `alarm()` (the runtime's handler) is `onAlarm(Date.now())`
- **R1** It runs, in registry order, the `tick` of every consumer whose `due(now)` is not null and is at most `now` + grace, awaiting each; then it reconciles authoritatively over the whole registry: the alarm is set to the smallest non-null `wake(now)`, or deleted when there is none.
- **R2** The answer is `{swept, drained, created, folded, refused, waiting, remaining, rearmed, nextAt, probes}` (the drain's counts, zero when it did not tick; `rearmed` whether an alarm is set; `nextAt` its instant or null; `probes` the test probes that ticked), plus each other consumer that ticked, its answer under its key: `monitor`, `connderive`, `overduescan`, `queuerenotify`, `monitorcadence`, `airunreap`, `capturerequests`, `airunwake`, `calibration`, `groupdomain`, `biasdebt`, `deadlinerecheck`, `gatheringsweep`, `workingonseal`, `workingonattest` (K1160), `follow`, `dutytransitions`, `interestchecks`, `moneydetectors`, `standingquestions`, `datedwaits` (T33-80), `scheduledpublish` (R22;), `filescan`, `filerender`, `filedeeper`, `fileforward` and `filereputation` (R24; K2153), `doccopy` (R25; T39), and a registered consumer's own. A consumer that did not tick is absent. A real consumer never appears in `probes`.
- **R3** A consumer whose `due`, `wake` or `tick` throws is answered under its key as `{error}` with the message; every other consumer still ticks and the reconcile still runs.

**arm(now) → instant | null** (the producers' door; `#armScheduler` today)
- **R4** Reconciles without firing: the alarm is set when none is set or when the earliest wake is sooner than it, never pushed later; deleted when no consumer wants one. It answers the alarm as it stands. It runs no tick and writes no work.

**The registry**
- **R5** The consumers, in this order, each calling its owning module: `selection-sweep` (`retrieval` R22, its wake R51), `task-drain` (`tasks` R1, registered by R8), `archive-monitor` (`monitoring` R20), `connection-derive` (`connections` R18), `overdue-scan` (`progressions` R17), `queue-renotify` (`queue`), `monitor-cadence` (`monitoring` R19), `gathering-sweep` (`link-sweep`'s `sweepTick(now, rank)`, its R4, with `sweepDue` and `sweepWake`; `monitoring` R56 before N506's split), `ai-run-reap` (`ai-runs` R15), `capture-request-drain` (`capture-requests` R11, its due and wake from R37), `ai-run-wake` (`ai-runs` R16), `calibration-reprobe` (`calibration` R9, given the grace), `group-domain-recheck` (`instance-setup` R9, registered by R8), `bias-debt` (`bias` R33, its due and wake R41), `intent-age` (`intent`'s `ageSurfaced(now)`, its R17, with `ageDue` and `ageWake`, its R27), `notice-sweep` (`reevaluation`'s `noticeSweep(now)`, its R25: one batch of its R14 sweep, `raiseNotices`, per tick, the pass held by `reevaluation` and pending after a newer capture is received; with `noticeSweepDue` and `noticeSweepWake`), `deadline-recheck` (`monitoring`'s `deadlineRecheck(now)`, its R34 and R35, with `deadlineRecheckDue` and `deadlineRecheckWake`, its R50), `scheduled-publish` (R22;), `working-on-seal` (`network-notices`' weekly seal, its R14 and R15) and `working-on-attest` (its `monthly`, `closed` and `lapsed` attestations, R12, and its retried openings, R17), then the six of R21, `follow`, `duty-transitions`, `interest-checks`, `money-detectors`, `standing-questions` and `dated-waits`, each with its own due and wake, then the five of R24 and, after them, `document-copy` (R25; T39). `capture-request-drain` ticks before `ai-run-wake`, so a request that completes on an alarm wakes its run on the same alarm.
- **R6** `selection-sweep`, `task-drain`, `archive-monitor`, `connection-derive` and `overdue-scan` are due at every firing; every other consumer is due only when its owner says so, so it fires at its own moment and at no other consumer's.
- **R7** Every cadence, batch and delay is its owning module's. This module holds only the grace, and no interval of its own for any consumer (P-87: re-notify at the stage's own interval, never a global one). (T37; N762) The two intervals R24 carried against this rule (K2129's option B) are gone: this module exports no `FILE_SCAN_EVERY_MS` or `FILE_SAFETY_POLL_MS`, and keeps no instant of its own for any `file-safety` consumer.

**register(module, consumer)** (for modules later than this one)
- **R8** A later module registers each of its consumers once, at start; a name already registered is refused `CONSUMER_DECLARED`. A registered consumer takes its place in R5 when R5 names it, and is otherwise appended in the modules' total order. It then inherits R1–R4.

**Producers** (K72 (9))
- **R9** On an idle instance, each act that creates a consumer's work leaves the alarm armed at that consumer's wake: a selection created (`retrieval` R52), a task enqueued and, when monitoring is configured, a counted source failure (`capture` R44), a resolution that marks an entity (`entities` R13), a progression threaded (`progressions` R33), a lens moved (`bias` R23), a promotion that leaves a bundle monitored or an action holding a `pending` clock entry, and a promotion that ratifies or re-ratifies a sweep (`promotion` R45), a calibration subject registered and a calibration signal recorded (`calibration` R18, R19), a run opened (`ai-runs` R43) and a capture request filed (`capture-requests` R44) (N223), a group domain set (`instance-setup`); and, for R21's consumers, a follow recorded (`following` R1, R7, R9, R10), a duty adopted or its trigger recorded (`duties`), a check or detector switched on (`people`, `money-checks`), a standing question saved or switched on (`answers`, R23) and a dated wait set (`inquiry`), and an edition set to publish at a time or its time moved (`publication`, R22;), and a member document queued for its copy (`case-carriage`, R25; T39), each through the notice its owner offers. This module reaches each earlier producer by registering `arm` with the notice its owner offers, never by being called by it; a producer in a module later than this one (`instance-setup`, `queue`) offers no notice and arms through R8, calling `arm` (R4) itself (K93 (5)). Until each module was extracted, `legacy-store` armed for it (retired, K858).

**The consumers of T33's new work** (T33-80; K1466, K1481, K1491; Choices 23)
- **R21** Six consumers join the registry (R5), each calling its owning module and each holding R1–R4 and R7: `follow` (`following`'s `followTick(now, rank)` with `followDue` and `followWake`, its R12, R13; batch-bounded, so it receives R10's rank); `duty-transitions` (`duties`' `recordTransitions({asOf: now, budgetMs})`, its R13, which records each tracked occurrence's state change as of the firing, K1466); `interest-checks` (`people`' `evaluateChecks({budgetMs})`, its R23); `money-detectors` (`money-checks`' `runDetectors({budgetMs, cursor})`); `standing-questions` (`answers`' `standingTick(now)` with `standingDue` and `standingWake`, its R17); `dated-waits` (`inquiry`'s `datedWaitsTick(now)` with `datedWaitsDue` and `datedWaitsWake`). A consumer whose owner answers `remaining` (or a cursor) is due again at the next firing until it answers none; the budget each tick is given is the owner's to state, never an interval of this module's (R7). Each owner's tick writes only its own rows and raises no queue item: the items are `notice-producers`' reads of those rows (R19). A gate that is closed (Rule 7) never stops a consumer from running; it only keeps its results from being shown.

**Publishing at a set time** (DEC-147; N662; T34-51)
- **R22** The consumer `scheduled-publish` joins the registry (R5) after `deadline-recheck` and before `working-on-seal`, calling `publication` (its R67): `wake(now)` and `due(now)` are both `publication.publishWake()`, the earliest set time of an edition still waiting (null when none waits), and `tick(now)` is `publication.publishDue(now)`, which takes each waiting edition whose time has come, has `ratification`'s publisher check it again, and publishes or stops it (that work, its checks and its answer are `publication`'s and `ratification`'s; this module decides none of it). Its answer is under the key `scheduledpublish` (R2). An edition is taken at the first firing at or after its time (within the grace, R1); one whose time passed while no alarm fired (a lost alarm, a reset) is taken at the next firing, R11's reconcile at start setting the alarm from `publishWake`, and is checked when taken (`publication` R67). It holds R1–R4 and R7: the time is the owner's, never an interval of this module's. Setting an edition to wait (`publication` R66) or moving its time (its R68) arms the alarm at once (R9), through the notice `publication` offers for that, so an idle instance wakes at the set time; a cancel needs no arming (the next reconcile drops a wake no one wants, R15). (K1836) It registers once at start with `publication.onPublishScheduled` (its R71), whose call after a set, a move, a cancel or a take re-arms the alarm from the `publishAt` it carries; an edition is never taken before its `publish_at` (R67 takes only at or before `now`; the grace of R1 delays, never advances, it).
- **R23** (ANSWERS #2, K1803; `answers` R27) At start this module registers once with `answers.onStandingSet` (its R27), as R9's notice for standing questions; each call, after a standing question is set or ended, runs `arm` (R4) at once, so the `standing-questions` wake (R21) is re-armed without waiting for the next firing; a question ended (its `due` null) arms nothing new, and the next reconcile drops a wake no one wants (R15). A refusal of the registration (`membership.listenerRefusal`) is a start-up fault the job reports, never ignored. The call writes nothing and runs no tick (R17).
*The file-safety consumers* (T36, T37; N707, rev. 2 §4; K1913, K1929; N762)
- **R24** Five consumers join the registry (R5) after `dated-waits`, in this order, each calling `file-safety` and holding R1–R4 and R7, their answers under the keys `filescan`, `filerender`, `filedeeper`, `fileforward` and `filereputation` (R2).
  - `file-scan`: `tick(now)` is `scanBatch({at})`, `at` the firing instant (its R4); its due and wake `scanWake(now)`.
  - `file-render`: `renderBatch({})` (its R12); `renderWake(now)`.
  - `file-deeper`: `deeperBatch({})` (its R36); `deeperWake(now)`.
  - `file-forward`: `forwardSecurityCounts({})`, with neither `from` nor `to`, so `file-safety` chooses the period (its R35); `forwardWake(now)`.
  - `file-reputation`: `refreshReputationLists({at})`, `at` the firing instant (its R41); `reputationWake(now)`.
  Each consumer's `due(now)` and `wake(now)` are both what `file-safety` R39 answers for its batch at `now` (an instant in epoch milliseconds, or null for none; K2188), asked afresh at every firing, `arm` and start, so a restarted instance re-derives them from `file-safety`'s durable state (R11). A refusal `file-safety` answers (`SCANNER_ABSENT`, `RENDERER_ABSENT`, `DEEPER_CHECKS_UNREADABLE`, `FORWARD_PERIOD_INVALID`) is the tick's answer, and the next wake is again R39's. This module keeps no instant, period or interval for any of the five (R7, R18).
  When the plane hands it `file-safety` (after construction, before `start`), this module registers once with `file-safety.onFileWork` (its R40), R9's notice for these consumers: each call runs `arm` (R4) at once, so an act that gives a batch work sooner (a receipt queued, a deeper check queued, a safe copy queued, a tool switched `on`) wakes an idle instance at that batch's instant; a refused registration is a start-up fault, reported as R23's is, never ignored; the call writes nothing and runs no tick (R17). No consumer passes a viewer, a file name or a member to `file-safety`, and none keeps or answers who opened a file (K1892, K1929). (N707; K1913, K1929; N762, K2129, K2153, K2175, K2188)
*The member documents' copies* (T39; N806; K2333)
- **R25** The consumer `document-copy` joins the registry (R5) after `file-reputation`, calling `case-carriage` and holding R1–R4 and R7, its answer under the key `doccopy` (R2).
  - `tick(now)` is `case-carriage.copyBatch({})` (its R15).
  - `due(now)` and `wake(now)` are both `case-carriage.copyWake(now)`, asked afresh at every firing, `arm` and start, so a restarted instance re-derives them from case-carriage's durable state (R11).
  - A refusal case-carriage answers (`DOCUMENT_COPY_NO_STORE`) is the tick's answer.
  - This module keeps no instant or interval for it (R7, R18).
  - At start it registers once with `case-carriage.onCopyWork` (its R17), as R9's notice. Each call runs `arm` (R4) at once, so a member document queued on an idle instance is copied at once. A refused registration is a start-up fault, reported as R23's is. The call writes nothing and runs no tick (R17).
  - No call names a member or a file.

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
- `following` (T33-80): `followTick`, `followDue`, `followWake` (its R12, R13; R21). `duties`: `recordTransitions` (its R13). `people`: `evaluateChecks` (its R23). `money-checks`: `runDetectors`. `answers`: `standingTick`, `standingDue`, `standingWake` (its R17). `inquiry`: `datedWaitsTick`, `datedWaitsDue`, `datedWaitsWake`. Each with the notice R9 registers with.
- `publication` (T34-51): `publishWake`, `publishDue` (its R67; R22), and the arming notice it offers when an edition is set to wait or its time moved (R9, R22). `answers`: `onStandingSet` (its R27; R23).
- `file-safety` (T36-29, T37-24): `scanBatch`, `renderBatch`, `deeperBatch`, `forwardSecurityCounts`, `refreshReputationLists` (its R4, R12, R36, R35, R41); their due and wake `scanWake`, `renderWake`, `deeperWake`, `forwardWake`, `reputationWake` (its R39); `onFileWork` (its R40), R24's notice.
- `case-carriage` (T39; N806, K2333; a `modules.json` edge): `copyBatch`, `copyWake`, `onCopyWork` (its R15, R17), the `document-copy` consumer (R25).
- `doc-clean` (T39; K2381; a `modules.json` edge, tests only): its test fixtures, so `copies.test.mjs` makes a real cleaned copy through the real case-carriage.
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
- DEC-147 (Bob's "S1: B", 2026-10-06; (3): at the set time the edition is checked again and published or stopped): R22; K1784, K1790 (T34-51).
- `docs/development/NOTIFICATIONS.md`, Place (R19); `build/layers.md`, layer 7 (R10) and layer 10's contract.
- N707 and N762 (`file-safety`'s cadences its own; K2129, K2153, K2175): R24, R7, R2.
- K2333 (N806): R25.

### Suggestions

- **Factory.** `schedulerOf(ctx, env)`; the plane's Durable Object (`plane`, `src/plane/store.mjs`) delegates its `alarm()` to it (`legacy-store` did until its retirement, K858).
- **The drain.** `task-drain`'s tick (`taskDrain`), wake and progress flag (`#lastDrainProgress`, `TASK_DRAIN_*`) belong to `tasks`, the tasks inbox (K91 (3), K49's later module); the consumer is registered (R8) at its R5 slot by `tasks` (`tasks/index.mjs`, `drainConsumer`); `legacy-store` did until its retirement (K858).
- **R9 through promotion.** Promotion's projections run inside its transaction; the arm is a storage call made after commit, so it registers with promotion's post-commit notice (`onCommitted`, promotion R45), not as a projection.
- **The rank.** R10 needs `intent` to answer which objective or aspiration a bundle, address or request serves; the rank is passed into the tick, so no earlier module calls this one.
- **Keys.** R2's keys are today's; a job keeps them, since several suites read them.
- **T33-80 (open technical details, BOB's).** `duties` R13, `people` R23 and `money-checks`' `runDetectors` state no due or wake of their own: their jobs (T33-35, T33-36, T33-34) state them, or this job registers them due at every firing while `remaining` and otherwise once per local day, which is an interval and so needs BOB's word against R7. Whether each earlier owner offers an arming notice (R9) is its own job's; one that offers none arms by calling `arm` (R4) through the plane. Where R21's six sit in R5's order (after `working-on-attest`) is this fold's choice; `follow` before `duty-transitions`, so an occurrence a followed meeting meets is recorded on the same alarm.
- **T34-51 (open technical details, BOB's).** `publication` R66–R68 as worded offer no arming notice: the notice R22 registers with (an `onPublishScheduled(module, fn)` in `answers` R27's model, called after R66's record and R68's move with the edition's `publish_at`) is owed by `publication`'s job (T34-79), worded as its R71 (K1816); until it exists, R22's wake is set only by a reconcile another producer or R11 runs, which can be late on an idle instance. Placing `scheduled-publish` before `working-on-seal` and `working-on-attest` lets an opening of sealed weeks a scheduled commit leaves undone (`ratification` R37) be retried on the same alarm.
- Tests: the probe seam proves R1, R4, R15, R16 by name; R3 gets a consumer that throws; R12 drives a render request past `expires` and reads `airunwake` on the same alarm; R14 reads the deployment configuration.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for the rulings)

- The registry, `onAlarm`, the reconcile, `arm` and the probe seam are this module's; each consumer's services are its owner's (the consumers map above), and R5's order is kept, `capture-request-drain` before `ai-run-wake` load-bearing.
- Later modules (`queue`, `instance-setup`, `tasks`; `legacy-store` until its retirement, K858) register their consumers (R8), as K31 does for promotion.
- R3 (a throwing consumer isolated), R9's four missing producers and R11 (reconcile at start) are stated from this reading.
- D-583 is carried as R12, met when `capture-requests` R29 counts `expired` as a completion; `ai-runs` keeps the wake (its R16).
- Uses: add `progressions`, `bias`, `entities`, `promotion`; drop `record-core`, `host-governor`, `extraction`, `strength`, `reevaluation` (nothing here calls them).
