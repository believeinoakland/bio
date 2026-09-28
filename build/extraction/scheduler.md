# scheduler — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `edbd39bb` (`store.mjs` 49,817 lines) by a drafting worker for BOB #43 (P18). A method's range runs from the comment block above it to its closing brace; the extraction job confirms each with `grep -n`. The contract is `build/requirements/scheduler.md` (R1–R20); K31, K61, K71, K72 (9), K74, K76 apply. The module exports `schedulerOf(ctx, env)` (K61) and reaches each consumer's owner through that owner's factory. `from` stays `legacy-store`. Nothing moves from `index.mjs`, `schema.mjs` or `bio-checks.mjs`. **Re-cited** on `tranche/T7` @ `fd7e691a17` by a worker for BOB #53 (K214), from `build/extraction/T8-recheck.md` re-measured after T7's layers 7 and 11 (`store.mjs` 18,726 lines): every `store.mjs` and module-file line below is current there; this map cites no `index.mjs` line.

## 1. What moves to `scheduler`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| the SCHEDULER header, `SCHED_GRACE_MS` | store.mjs | 1551–1598 (`SCHED_GRACE_MS` 1598; `#lastDrainProgress` 1599 is the drain's) | R1, R7 |
| `#schedConsumers`: the registry array and the probe loop | | 1608–1952, thirteen entries and the probe | R5, R6, R13; each entry keeps its name and position and calls its owner's services (§2); the long comment above each entry goes with its owner's code, one line of provenance staying here |
| `alarm`, `onAlarm` | | 1960, 1962–2047 | R1–R3; the per-name answer chain becomes a lookup by each consumer's `key` |
| `#reconcileAlarm`, `#armScheduler` | | 2058–2067, 2073–2079 | R1, R4 (`arm`) |
| the probe seam: `#probeSpecs`, `#probeState`, `schedProbeArm`, `schedProbeLog`, `schedAlarmAt` | | 2096–2117 | R13 |
| the producers' registrations legacy-store fills in this module's name: `retrieval.onSelectionCreated` (717, retrieval R52), `bias.onLensChange` (736, bias R23), `promotionOf(ctx).onCommitted` (746–749, promotion R45, reading monitoring's configured state and bias's debt), `capture.on("task")` and `capture.on("source-outcome")` (757–758, capture R44), `progressionsOf(ctx).onThreaded` (761, progressions R33) | | 717–761 | R9; the route arms are gone, replaced by these notices; the job removes legacy-store's five registrations and registers its own (the registration rule, K206); `entities` R13 is not yet filled by anyone |

**Measured size:** about 590 lines of `store.mjs` (about 180 of code). No table.

## 2. Each consumer's owner, and what stays or goes elsewhere

| consumer (registry lines) | its services today | owner | how the scheduler reaches it |
| --- | --- | --- | --- |
| `selection-sweep` (1610–1613) | `retrieval` R22 `sweepSelections` and R51 `sweepWake` | `retrieval` (R22) | calls R22 and R51 (§5.3's gap closed) |
| `task-drain` (1614) | `taskDrain` 17178–17261; `#lastDrainProgress` 1599, `TASK_DRAIN_*`, `#drainDelayMs` 1537; wake reads `task_queue` | `queue` (capture R45, K91 (3); layer 11) | `legacy-store` registers it (R8) until `queue` is extracted |
| `archive-monitor` (1630–1633) | `#monitorPending`, `#monitorTickMs`, `#monitorTick` (store 17631, 17644; monitoring's map §1) | `monitoring` (R20) | calls it |
| `connection-derive` (1644–1647) | `connectionsOf(ctx).wake`/`sweep` (`connections/index.mjs` 791, 797); the store methods are gone | `connections` (R18) | calls it |
| `overdue-scan` (1668–1671) | `progressions` R17 `overdueScan` | `progressions` (R17) | calls it |
| `queue-renotify` (1687) | `#queueRenotifyExpired`, `#queueRenotifyWake` (store 12900–12915) | `queue` (layer 11) | `queue` registers it (R8) |
| `monitor-cadence` (1719–1722) | `#monitorCadencePlan`, `#monitorCadenceWake`, `#monitorCadenceTick` (store 17796–18173) | `monitoring` (R19) | calls it |
| `ai-run-reap` (1748–1751) | `ai-runs` R15 `reapDue`, `reapWake`, `reap` | `ai-runs` (R15) | calls it |
| `capture-request-drain` (1769–1772) | `capture-requests` R37 `drainPending`, `drainIntervalMs` and R11 `drain` (§5.3's gap closed) | `capture-requests` (R11) | calls it (K71) |
| `ai-run-wake` (1851–1856) | `ai-runs` R16, R17, R41 `wakeDue`, `wakeWake`, `wake`, with `capture-requests` as the registered wait source | `ai-runs` (R16) | calls it |
| `calibration-reprobe` (1908–1911) | `calibrationOf(ctx).calibrationDue`, `calibrationWake`, `calibrationTick` | `calibration` (R9) | calls it, passing `SCHED_GRACE_MS` (K74) |
| `group-domain-recheck` (1917) | `#groupDomainWake`, `#groupDomainTick` (store 13999–14008) | `instance-setup` (K69, layer 11) | `instance-setup` registers it (R8) |
| `bias-debt` (1936–1939) | `bias` R41 `biasDebtDue`, `biasDebtWake` and R33 `biasDebtSweep` | `bias` (R33, K82 (3)) | calls it (§5.3's gap closed) |

The producers' shims: `#armSweep` (2086, registered on retrieval's notice at 717), `#armDrain` (2087, on capture's `task` notice at 757), `#armConnectionDerive` (1547, called at 10075, 10080), the group domain's (13923), and the notices of §1's last row. Each becomes this module's `arm`, registered on the owner's notice (K72 (9)); `legacy-store` keeps calling `arm` for owners not yet extracted.

Two consumers the registry lacks (N164, N167; scheduler R5 as corrected for K214): `intent`'s `ageSurfaced(now)` (`intent/index.mjs` 947, intent R17, "called by `scheduler`"), and `reevaluation`'s `raiseNotices({limit, after})` sweep (`reevaluation/index.mjs` 722, op `reevaluationraise`, K199 (1); "scheduler or monitoring"). Neither owner states a due or wake service. R10's rank reads `intent`'s `gaps` (`intent/index.mjs` 427, intent R6).

## 3. Callers to rewire

- workerd's `alarm()` on the Durable Object class: delegates to `schedulerOf(this.ctx, this.env).onAlarm()`.
- Every `this.#armScheduler()` site above: `schedulerOf(...).arm()` while in `legacy-store`, a registered notice once its owner is extracted.
- Suites that drive `onAlarm(now)` and `schedProbeArm` over RPC: the Durable Object keeps both entry points, delegating.

## 4. What `legacy-store` gains (ADDED lines)

`import { schedulerOf } from "./scheduler/index.mjs"` (path by the module's convention); `alarm()`, `onAlarm`, `schedProbeArm`, `schedProbeLog`, `schedAlarmAt` as one-line delegations; `register` calls at start for `task-drain`, `queue-renotify` and `group-domain-recheck` (their owners are later or unnamed) wrapping the store's existing private methods; each `#armScheduler()` call site becomes a call to the module's `arm`. About 20 lines.

## 5. Undetermined, conflicts, and code others could claim

1. **Uses.** Declared: `record-core`, `host-governor`, `capture`, `calibration`, `extraction`, `connections`, `retrieval`, `strength`, `ai-runs`, `capture-requests`, `monitoring`, `intent`, `reevaluation`. The moved code calls `progressions` (overdue-scan) and `bias` (bias-debt), and R9 registers with `entities` (R13) and `promotion` (R39); nothing calls `record-core`, `host-governor`, `extraction`, `strength` or `reevaluation`. Proposed: add `progressions`, `bias`, `entities`, `promotion`; drop those five. *Closed: `modules.json` has that set and keeps `intent`. `reevaluation` returns as a use for `raiseNotices` (N164), not yet declared.*
2. **The tasks inbox has no owner.** `capture` keeps the event queue and hands `taskDrain`, `taskList`, `taskForward`, `taskResolve` and `#routeTask` "to a later module" (capture Suggestions, K49) that no ruling names. The drain's consumer is registered by `legacy-store` until BOB names one.
3. **Services the owners' drafts lack**, which R5 and R9 need: `retrieval` has no wake for the selection sweep (live count, earliest expiry) and no notice for a selection created (its Suggestions only); `progressions` R8 "asks the scheduler to wake", a call from layer 5 to layer 10, where a notice is needed; `capture-requests` R11 offers "the pending count" and cadence with no named service; `bias` R33 names `biasDebtSweep` but no due or wake; `promotion` R39's projections run inside the transaction, where arming wants a post-commit notice. *Mostly closed: retrieval R51/R52, capture-requests R37, bias R41 and promotion R45 `onCommitted` are provided; `progressions` arms through its R33 notice.*
4. **Four producers arm nothing** (R9, found in this reading): `captureRequest`, `aiRunOpen`, `calibrationSubjectRegister` and `calibrationSignalRecord` (whose answer says `armed`). On an idle instance their consumers wait for an unrelated producer.
5. **A throwing consumer** abandons the rest of `onAlarm` and its reconcile (R3); and nothing reconciles at start (R11). Both found in this reading.
6. **Tests.** Suites that follow the module: `scheduler.test.mjs` (the probes, starvation, the registry's census and order), `task-drain-alarm.test.mjs`. `scheduler.control.mjs` patches the store's source text (the reconcile over `reg`; "every setAlarm is inside #reconcileAlarm"): a `legacy-tests` entry (K53) re-anchors it on the module. Consumer suites that drive `onAlarm` stay green while the Durable Object delegates: `airun.test.mjs` (ARM S3b counts the registry), `airun-principal`, `archive-monitoring`, `calibration`, `connection-derive-sweep`, `d260-resume`, `d334-monitor-credential`, `d86-bias-debt`, `daemon-token`, `group-identity`, `monitor-address`, `monitor-cadence`, `observation-log`, `overdue-successor`, `pipeline-e2e`, `queue-state`, `rec207-bias-debt-settle`.
7. **`SCHEDULER.md` is stale**: the registry holds thirteen consumers; the file counts twelve, and the store's comments call both `group-domain-recheck` and `bias-debt` "the twelfth". The file argues for counting in a test, which `scheduler.test.mjs` does; its prose is corrected when T8 moves the canon.
8. **Registrations legacy-store fills in this module's name** (K206): the five notices of §1's last row (store 717, 736, 746–749, 757–758, 761). The job removes each from legacy-store and registers its own `arm` (removal plus §12.2's rewiring), as reevaluation did (K205); its R45 listener reads `monitoring`'s `configured()` and `bias`'s `biasDebtDue` as legacy-store's does today.
