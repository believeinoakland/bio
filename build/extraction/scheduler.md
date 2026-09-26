# scheduler — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `edbd39bb` (`store.mjs` 49,817 lines) by a drafting worker for BOB #43 (P18). A method's range runs from the comment block above it to its closing brace; the extraction job confirms each with `grep -n`. The contract is `build/requirements/scheduler.md` (R1–R20); K31, K61, K71, K72 (9), K74, K76 apply. The module exports `schedulerOf(ctx, env)` (K61) and reaches each consumer's owner through that owner's factory. `from` stays `legacy-store`. Nothing moves from `index.mjs`, `schema.mjs` or `bio-checks.mjs`.

## 1. What moves to `scheduler`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| the SCHEDULER header, `SCHED_GRACE_MS` | store.mjs | 3382–3429 | R1, R7 |
| `#schedConsumers`: the registry array and the probe loop | | 3439–3785 | R5, R6, R13; each entry keeps its name and position and calls its owner's services (§2); the long comment above each entry goes with its owner's code, one line of provenance staying here |
| `alarm`, `onAlarm` | | 3787–3880 | R1–R3; the per-name answer chain becomes a lookup by each consumer's `key` |
| `#reconcileAlarm`, `#armScheduler` | | 3882–3913 | R1, R4 (`arm`) |
| the probe seam: `#probeSpecs`, `#probeState`, `schedProbeArm`, `schedProbeLog`, `schedAlarmAt` | | 3922–3950 | R13 |
| the arms in the store routes: `promote` (monitored bundle, lens moved), `biasadopt` (lens moved) | | 48512–48531, 49030–49031 | R9; become notices (`promotion` R39, `bias` R23) this module registers with |

**Measured size:** about 590 lines of `store.mjs` (about 180 of code). No table.

## 2. Each consumer's owner, and what stays or goes elsewhere

| consumer (registry lines) | its services today | owner | how the scheduler reaches it |
| --- | --- | --- | --- |
| `selection-sweep` (3441–3445) | `#sweepSelections` 3372–3380; wake reads `selections` directly | `retrieval` (R22) | calls R22; needs a wake service (§5.3) |
| `task-drain` (3446–3452) | `taskDrain`; `#lastDrainProgress` 3430, `TASK_DRAIN_*`, `#drainDelayMs` 3258–3266; wake reads `task_queue` | the tasks inbox's owner (unnamed, §5.2) | `legacy-store` registers it (R8) until an owner is ruled |
| `archive-monitor` (3453–3465) | `#monitorPending`, `#monitorTickMs`, `#monitorTick` | `monitoring` (R20) | calls it |
| `connection-derive` (3466–3480) | `#deriveConnectionsSweep`, `#connectionDeriveDelayMs` | `connections` (R18) | calls it |
| `overdue-scan` (3481–3504) | `#overdueScan` | `progressions` (R17) | calls it |
| `queue-renotify` (3505–3529) | `#queueRenotifyExpired`, `#queueRenotifyWake` | `queue` (layer 11) | `queue` registers it (R8) |
| `monitor-cadence` (3530–3555) | `#monitorCadencePlan`, `#monitorCadenceWake`, `#monitorCadenceTick` | `monitoring` (R19) | calls it |
| `ai-run-reap` (3556–3584) | `#aiRunReapPending`, `#aiRunReapWake`, `#aiRunReap` | `ai-runs` (R15) | calls it |
| `capture-request-drain` (3585–3605) | `#captureRequestPending`, `#captureRequestTickMs`, `captureRequestDrain` | `capture-requests` (R11) | calls it (K71) |
| `ai-run-wake` (3606–3689) | `#aiRunWakePending`, `#aiRunWakeWake`, `#aiRunWake` | `ai-runs` (R16) | calls it |
| `calibration-reprobe` (3690–3744) | `#calibrationDue`, `#calibrationWake`, `#calibrationTick` | `calibration` (R9) | calls it, passing `SCHED_GRACE_MS` (K74) |
| `group-domain-recheck` (3745–3753) | `#groupDomainWake`, `#groupDomainTick` | `instance-setup` (K69, layer 11) | `instance-setup` registers it (R8) |
| `bias-debt` (3754–3772) | `#biasDebtPending`, `#biasDebtDelayMs`, `#biasDebtSweep` | `bias` (R33, K82 (3)) | calls it |

The producers' shims stay with their producers until each owner offers its notice: `#armSweep` (3919, called at 4028), `#armDrain` (3920, 46413, 46421), `#armConnectionDerive` (3344, 24992, 25000, 25089), the thread's arm (26966), the group domain's (32807), `recordSourceOutcome`'s (47760). Each becomes this module's `arm`, registered on the owner's notice (K72 (9)); `legacy-store` keeps calling `arm` for owners not yet extracted.

## 3. Callers to rewire

- workerd's `alarm()` on the Durable Object class: delegates to `schedulerOf(this.ctx, this.env).onAlarm()`.
- Every `this.#armScheduler()` site above: `schedulerOf(...).arm()` while in `legacy-store`, a registered notice once its owner is extracted.
- Suites that drive `onAlarm(now)` and `schedProbeArm` over RPC: the Durable Object keeps both entry points, delegating.

## 4. What `legacy-store` gains (ADDED lines)

`import { schedulerOf } from "./scheduler/index.mjs"` (path by the module's convention); `alarm()`, `onAlarm`, `schedProbeArm`, `schedProbeLog`, `schedAlarmAt` as one-line delegations; `register` calls at start for `task-drain`, `queue-renotify` and `group-domain-recheck` (their owners are later or unnamed) wrapping the store's existing private methods; each `#armScheduler()` call site becomes a call to the module's `arm`. About 20 lines.

## 5. Undetermined, conflicts, and code others could claim

1. **Uses.** Declared: `record-core`, `host-governor`, `capture`, `calibration`, `extraction`, `connections`, `retrieval`, `strength`, `ai-runs`, `capture-requests`, `monitoring`, `intent`, `reevaluation`. The moved code calls `progressions` (overdue-scan) and `bias` (bias-debt), and R9 registers with `entities` (R13) and `promotion` (R39); nothing calls `record-core`, `host-governor`, `extraction`, `strength` or `reevaluation`. Proposed: add `progressions`, `bias`, `entities`, `promotion`; drop those five.
2. **The tasks inbox has no owner.** `capture` keeps the event queue and hands `taskDrain`, `taskList`, `taskForward`, `taskResolve` and `#routeTask` "to a later module" (capture Suggestions, K49) that no ruling names. The drain's consumer is registered by `legacy-store` until BOB names one.
3. **Services the owners' drafts lack**, which R5 and R9 need: `retrieval` has no wake for the selection sweep (live count, earliest expiry) and no notice for a selection created (its Suggestions only); `progressions` R8 "asks the scheduler to wake", a call from layer 5 to layer 10, where a notice is needed; `capture-requests` R11 offers "the pending count" and cadence with no named service; `bias` R33 names `biasDebtSweep` but no due or wake; `promotion` R39's projections run inside the transaction, where arming wants a post-commit notice.
4. **Four producers arm nothing** (R9, found in this reading): `captureRequest`, `aiRunOpen`, `calibrationSubjectRegister` and `calibrationSignalRecord` (whose answer says `armed`). On an idle instance their consumers wait for an unrelated producer.
5. **A throwing consumer** abandons the rest of `onAlarm` and its reconcile (R3); and nothing reconciles at start (R11). Both found in this reading.
6. **Tests.** Suites that follow the module: `scheduler.test.mjs` (the probes, starvation, the registry's census and order), `task-drain-alarm.test.mjs`. `scheduler.control.mjs` patches the store's source text (the reconcile over `reg`; "every setAlarm is inside #reconcileAlarm"): a `legacy-tests` entry (K53) re-anchors it on the module. Consumer suites that drive `onAlarm` stay green while the Durable Object delegates: `airun.test.mjs` (ARM S3b counts the registry), `airun-principal`, `archive-monitoring`, `calibration`, `connection-derive-sweep`, `d260-resume`, `d334-monitor-credential`, `d86-bias-debt`, `daemon-token`, `group-identity`, `monitor-address`, `monitor-cadence`, `observation-log`, `overdue-successor`, `pipeline-e2e`, `queue-state`, `rec207-bias-debt-settle`.
7. **`SCHEDULER.md` is stale**: the registry holds thirteen consumers; the file counts twelve, and the store's comments call both `group-domain-recheck` and `bias-debt` "the twelfth". The file argues for counting in a test, which `scheduler.test.mjs` does; its prose is corrected when T8 moves the canon.
