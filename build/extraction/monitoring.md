# monitoring — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `edbd39bb` (`store.mjs` 49,817 lines, `index.mjs` 13,438, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682) by a drafting worker for BOB #43 (P18). A method's range runs from the comment block above it to its closing brace; the extraction job confirms each with `grep -n`. The contract is `build/requirements/monitoring.md` (R1–R43); K3, K4, K6, K23, K31, K49, K61, K72 apply. The module exports `monitoringOf(ctx, env)` (K61) and reaches its uses through their factories. `from` should read `["legacy-store", "legacy-index", "legacy-checks"]` (§5.1). **Re-cited** on `tranche/T7` @ `fd7e691a17` by a worker for BOB #53 (K214), from `build/extraction/T8-recheck.md` re-measured after T7's layers 7 and 11 (`store.mjs` 18,726 lines, `schema.mjs` 1,176, `checks/bio-checks.mjs` 13,732): every `store.mjs`, `schema.mjs`, `bio-checks.mjs` and module-file line below is current there; `index.mjs` cites were re-cited at T8's opening, on `tranche/T8` @ 12e2067a5f (K226).

## 1. What moves to `monitoring`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| D-525 header, `DRIVE_SHELLS_LIMIT_DEFAULT`, `…_MAX`, `…_RETRIEVALS_MAX`, `driveShells` | store.mjs | 9006–9079 | R26 |
| D-65 header, `static monitorObservationFor`, `recordMonitorLook`, REC-191 comment, `#recordMonitorAddressType` | store.mjs | 16944–17086 | R11–R13; the `#observe` call becomes observation-log's append, `recordCapturedLocator` provenance's writer, the `register` read provenance's read contract |
| CAP-3 header, `MONITOR_TICK_MS`, `MONITOR_TICK_BATCH`, `#monitorTickMs`, the REC-33/D-334 comments, `#monitorTokenBound`, `#monitorToken`, `MONITOR_NO_LIVE_CREDENTIAL`, `#monitorConfigured`, `#monitorFloor`, `#monitorPending`, `#monitorTick` | store.mjs | 17503–17717 (`#monitorTokenBound` 17597, `#monitorToken` 17600, `#monitorConfigured` 17616, `#monitorFloor` 17625, `#monitorPending` 17631, `#monitorTick` 17644) | R20, R22–R24; the credential helpers go to `runtime-limits` (§5.4); `#monitorFloor` already reads `capture.reachabilityThresholds` (capture R43). `#monitorPending` (17633) and `#monitorTick` (17659) read capture's table `source_reachability` by name: they read it through the read contract capture states (N166, T8's capture job), never by name (K206's P4) |
| REC-26 idempotence header, `#tickRunning`, `#openTickEpoch`, `#closeTickEpoch`, `#claimFire` | store.mjs | 17719–17794 (`#tickRunning` 17754) | R21, R22; all of it moves: `capture-requests` no longer shares the Set (it holds its own guard, `capture-requests/index.mjs` 389), and only `archive-monitor` and `monitor-cadence` use it |
| REC-26 cadence header, `MONITOR_CADENCE_MS`, `CONTRACT_FREQUENCY`, `MONITOR_CADENCE_BATCH`, `…_DELAY_MS`, `monitorIntervalMs`, REC-191 header, `#monitorSubjects`, `#monitorCadencePlan`, `#monitorCadenceWake`, `#monitorCadenceTick`, `#fireMonitorTick`, `#fireArchiveFallback` | store.mjs | 17796–18173 (`CONTRACT_FREQUENCY` 17839, `monitorIntervalMs` 17854, `#fireMonitorTick` 18130, `#fireArchiveFallback` 18153) | R14–R16, R19; the two fires call R1–R10 and `capture.acquire` in process once R23 is ruled |
| store routes `driveshells`, `monitorlook` | store.mjs `fetch` | 18262, 18305 | K3 |
| `CONTRACT_FREQUENCY` alias, `monitorCadence`, `monitorAssess`, `monitorRecordLook` | index.mjs | 2835–2927 | R6, R14; `monitorCadence` and the plan's `cadence` become one function |
| `op=monitor` | index.mjs | 5977–6588 | R1–R10; becomes a service in the Durable Object (K72 (11)); `control-plane` keeps the method check, the class stamp and the envelope |
| `GATH_ID_RE`, `CRITICALITY_ENUM`, `CADENCE_ENUM`, `GATH_STATUS_ENUM`; `checkGatheringGrammar` (C-18.5) | bio-checks.mjs | 4733–4736, 4947–5006 | R27, R42; `checkBundle` (5352) stops calling it: it runs at the write as a registered check (promotion R39) and in the audit through record-core's registration (N51). `CRITICALITY_ENUM` is used only here |
| the write-time gathering check, inside legacy-store's registered promotion step (`#promoteChecks`, registered at 744) | store.mjs | 9280–9304 | R27, carved out of `#promoteChecks` into this module's own promotion R39 step |
| `monitor_fired`, `monitor_tick_epoch` DDL and comments; `monitor_address_type` DDL and comment | schema.mjs | `monitor_fired` 622, `monitor_tick_epoch` 645, `monitor_address_type` 1164 | K4; R41 |
| purge entries `monitor_fired` (by `subject`), `monitor_tick_epoch`, `monitor_address_type` | store.mjs | 650, 655 | declared by this module (K23, record-core R46) |

**Measured size:** store.mjs 889 (464 code), index.mjs 704 (423), bio-checks.mjs 74 (64), schema.mjs 63 (23): about 1,730 lines, about 975 of code.

## 2. What stays in a legacy module or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `FALLBACK_*` constants, `#thresholds` | `capture/index.mjs` 1184 (gone from the store) | `capture` | done: R8's thresholds, served by its R43 |
| `recordSourceOutcome`, `sourceReachability`; routes `recordsourceoutcome`, `sourcereach` | `capture/index.mjs` 1204, 1229, routes 1293–1294; store delegates 16566–16567 | `capture` | done: its R8 |
| the rows C-48.8, C-48.9 | bio-checks.mjs 9684, 9698 | stay in `legacy-checks`, read | the C-48 family is read in place (K72 (1)); their invariant and test are this module's (R42) |
| `MONITOR_FREQ`, `MECHANICAL_FIELD_SETS` | bio-checks.mjs 1441, 5149–5154 | stay in `legacy-checks` | C-2.7 and C-20.1 read them too |
| the `archive-monitor` and `monitor-cadence` registry entries | store.mjs 1630–1633, 1719–1722 | `scheduler` | the registry is the scheduler's; it calls R19, R20 |
| the arm on a monitored bundle; the source-outcome arm | store.mjs 746–749 (`promotion.onCommitted`, promotion R45), 758 (`capture.on("source-outcome")`, capture R44) | `scheduler` | arming is the scheduler's: it takes over these registrations from legacy-store and reads this module's `configured()` inside its listeners |
| `OPS.monitor`, `OPS.driveshells`, the class sets naming `monitor`, `NEEDS.monitor` | index.mjs 822–828, 1390, 1958, 2100, 2273 | `control-plane` | routing and authentication (K3) |
| the daemon-class comment and `classify`'s daemon arm | index.mjs 2929–2984 and the class table | `control-plane` | authentication |
| `substanceDigests`, `profilesAsText`, `captureKey` | `capture/acquire.mjs` 75, 66 (imported by index); `captureKey` index 4245 | `capture` | its R17, through `acquire.mjs`; this module calls them |

## 3. Callers to rewire

- `op=monitor` over `env.SELF` from `#fireMonitorTick` (18135); `op=acquire`'s archive arm from `#fireArchiveFallback` (18158): in process (R23), or unchanged until Bob rules (Open 1).
- `monitorRecordLook` (index.mjs 2911) over the store route: an in-process call once `op=monitor` is a Durable Object service.
- `Store.CONTRACT_FREQUENCY` read by index.mjs 2845; `Store.monitorIntervalMs` by the plan: module exports.
- `#monitorConfigured` read by legacy-store's `promotion.onCommitted` listener (747) and its `capture.on("source-outcome")` listener (758): a `configured()` service the scheduler reads inside its own R45/R44 listeners.
- `#monitorToken`: read only by `#fireMonitorTick` (18131) and `#fireArchiveFallback` (18154), and `#monitorTokenBound` by `#monitorConfigured` (17617). `capture-requests` no longer reads either: it has its own `unattendedBound(env)` (`capture-requests/index.mjs` 125, K181 (6)), which retires when `runtime-limits` R26 is built. Both become `runtime-limits.unattendedCredential` (R26, T8's layer 1), which serves this module alone.
- The projection's `monitor_enabled`, `monitor_frequency`, `monitor_last_checked`, `source_locator`, read by `#monitorSubjects` and `driveShells`: `retrieval`'s read contract (K75 (3)).

## 4. What `legacy-store` and `legacy-index` gain (ADDED lines)

- `legacy-store`: `import { monitoringOf } from "./monitoring/index.mjs"` (the path follows the module's own convention); the routes `driveshells` and `monitorlook` delegate; the registry's two entries call `monitoringOf(this.ctx, this.env)`'s six services; `promote` stops running the gathering check (registered instead); the purge list loses three names (declared by the module). About 15 lines.
- `legacy-index`: `op=monitor` forwards the body and the class stamp to the Durable Object's `monitor` service and returns its answer in the envelope. About 10 lines.
- `legacy-checks`: `checkBundle` loses its `checkGatheringGrammar` call and the function; nothing added.

## 5. Undetermined, conflicts, and code others could claim

1. **`from`.** `modules.json` says `legacy-store` alone, but `op=monitor` (704 lines) is in `index.mjs` and C-18.5 in `bio-checks.mjs`; a job may remove code only from its `from` modules (K47). Proposed: `["legacy-store", "legacy-index", "legacy-checks"]`, as K72 (1) did for layer 3.
2. **Uses.** Declared: `record-core`, `membership`, `capture`, `extraction`, `content`, `intent`, `reevaluation`, `actions`, `escalation`. The moved code also calls `legacy-checks`, `promotion`, `provenance`, `host-governor`, `capture-sources`, `docprofile`, `format-registry`, `observation-log`, `retrieval`, `runtime-limits`; R33 adds `publication`. Nothing calls `extraction` or `content`. Proposed: add those eleven, drop `extraction` and `content`. *Closed: `modules.json` has that set, with `intent`, `reevaluation`, `publication`, `actions`, `escalation`. What the code reads and no Uses entry names is capture's `source_reachability` (§1), read through N166's contract.*
3. **The Worker-side tick.** `op=monitor` fetches and writes R2 in the Worker today; moved into the Durable Object it does both there (the governor already runs there, K72 (2)). The Durable Object already holds the capture store: `record-core`'s evidence bucket is `env.CAPTURES` (store.mjs 869, K49), so the tick reads and writes through it rather than the binding.
4. **The unattended credential.** `runtime-limits` gains `unattendedCredential(env)` (the D-334 rule, its R26, T8's layer 1); this module reads it. `capture-requests` no longer shares it (§3), so there is no rewire there.
5. **Tests.** Suites that follow the module: `monitor-cadence`, `monitor-address`, `monitor-assess`, `monitor-rendered`, `monitor-substance`, `archive-monitoring`, `d334-monitor-credential` (with its `.control.sh`), `d525-driveshells` (with its `.control`), `d524-archive-baseline`, `gathering`, `mechanical`. Old-battery files that read or patch moved text (`legacy-tests` entries, K53): `drive.control.mjs` (anchors on op=monitor's and acquire's twin lines), `m025-arm-anchor-witness.test.mjs`, `d334-monitor-credential.control.sh`, `d525-driveshells.control.mjs`, `observation-log.test.mjs` and `daemon-token.test.mjs` where they drive `onAlarm`, `reachability.test.mjs` (the floor). Runtime suites that reach `op=monitor` through the Worker stay green while the op forwards.
6. **Found in this reading:** a monitor tick records no source outcome, so a monitored source that stops answering never reaches the fallback unless something acquires it (R25). The store's comments name two consumers "the twelfth" and `SCHEDULER.md` counts twelve; there are thirteen (scheduler map §5.7).
7. **Other claimants.** `capture`: the thresholds and reachability (kept there). `observation-log`: the look's vocabulary (it provides; this module appends). `queue`: R31's items are read there. `reevaluation`: reads the flag R8 writes.
8. **Since T7's layers 7 and 11.** `intent` is merged: R33 reads its `watchSet({project})` (`intent/index.mjs` 448, intent R7), and this module registers its findings as a proposal source with `registerSource` (768, intent R15; N170). `reevaluation` is merged: R33's "reaches reevaluation as R8's flag" is the document's own `reeval_pending`, read by reevaluation from the bytes, so there is no call from here unless this module drives reevaluation's `raiseNotices` sweep (`reevaluation/index.mjs` 722, op `reevaluationraise`; N164, with `scheduler`).
9. **Registrations legacy-store fills in this module's name** (K206): the gathering arm of legacy-store's promotion step (`#promoteChecks` 9280–9304, registered at 744), removed and registered as this module's own step. The scheduler's two listeners that read `#monitorConfigured` (746–749, 758) are `scheduler`'s to take over, not this module's.
