# monitoring — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `edbd39bb` (`store.mjs` 49,817 lines, `index.mjs` 13,438, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682) by a drafting worker for BOB #43 (P18). A method's range runs from the comment block above it to its closing brace; the extraction job confirms each with `grep -n`. The contract is `build/requirements/monitoring.md` (R1–R43); K3, K4, K6, K23, K31, K49, K61, K72 apply. The module exports `monitoringOf(ctx, env)` (K61) and reaches its uses through their factories. `from` should read `["legacy-store", "legacy-index", "legacy-checks"]` (§5.1).

## 1. What moves to `monitoring`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| D-525 header, `DRIVE_SHELLS_LIMIT_DEFAULT`, `…_MAX`, `…_RETRIEVALS_MAX`, `driveShells` | store.mjs | 16935–17009 | R26 |
| D-65 header, `static monitorObservationFor`, `recordMonitorLook`, REC-191 comment, `#recordMonitorAddressType` | store.mjs | 46072–46214 | R11–R13; the `#observe` call becomes observation-log's append, `recordCapturedLocator` provenance's writer, the `register` read provenance's read contract |
| CAP-3 header, `MONITOR_TICK_MS`, `MONITOR_TICK_BATCH`, `#monitorTickMs`, the REC-33/D-334 comments, `#monitorTokenBound`, `#monitorToken`, `MONITOR_NO_LIVE_CREDENTIAL`, `#monitorConfigured`, `#monitorFloor`, `#monitorPending`, `#monitorTick` | store.mjs | 47030–47244 | R20, R22–R24; the credential helpers go to `runtime-limits` (§5.4); `#monitorFloor` reads `capture.reachabilityThresholds` instead of `#thresholds` |
| REC-26 idempotence header, `#tickRunning`, `#openTickEpoch`, `#closeTickEpoch`, `#claimFire` | store.mjs | 47246–47321 | R21, R22; `capture-requests` keeps its own `#tickRunning` (it shares the Set today, 40448) |
| REC-26 cadence header, `MONITOR_CADENCE_MS`, `CONTRACT_FREQUENCY`, `MONITOR_CADENCE_BATCH`, `…_DELAY_MS`, `monitorIntervalMs`, REC-191 header, `#monitorSubjects`, `#monitorCadencePlan`, `#monitorCadenceWake`, `#monitorCadenceTick`, `#fireMonitorTick`, `#fireArchiveFallback` | store.mjs | 47323–47700 | R14–R16, R19; the two fires call R1–R10 and `capture.acquire` in process once R23 is ruled |
| store routes `driveshells`, `monitorlook` | store.mjs `fetch` | 48564–48566, 48676–48679 | K3 |
| `CONTRACT_FREQUENCY` alias, `monitorCadence`, `monitorAssess`, `monitorRecordLook` | index.mjs | 3044–3136 | R6, R14; `monitorCadence` and the plan's `cadence` become one function |
| `op=monitor` | index.mjs | 10304–10914 | R1–R10; becomes a service in the Durable Object (K72 (11)); `control-plane` keeps the method check, the class stamp and the envelope |
| `GATH_ID_RE`, `CRITICALITY_ENUM`, `CADENCE_ENUM`, `GATH_STATUS_ENUM`; `checkGatheringGrammar` (C-18.5) | bio-checks.mjs | 5277–5280, 5664–5733 | R27, R42; `checkBundle` (6082) stops calling it: it runs at the write as a registered check (promotion R39) and in the audit through record-core's registration (N51). `CRITICALITY_ENUM` is used only here |
| the write-time gathering check inside `promote()` | store.mjs | 17525–17549 | R27, registered with `promotion.registerStep` |
| `monitor_fired`, `monitor_tick_epoch` DDL and comments; `monitor_address_type` DDL and comment | schema.mjs | 1860–1901, 3885–3905 | K4; R41 |
| purge entries `monitor_fired` (by `subject`), `monitor_tick_epoch`, `monitor_address_type` | store.mjs | 884, 890 | declared by this module (K23, record-core R46) |

**Measured size:** store.mjs 889 (464 code), index.mjs 704 (423), bio-checks.mjs 74 (64), schema.mjs 63 (23): about 1,730 lines, about 975 of code.

## 2. What stays in a legacy module or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `FALLBACK_*` constants, `#thresholds` | store.mjs 46996–47028 | `capture` | R8's thresholds, served by its R43 |
| `recordSourceOutcome`, `sourceReachability`; routes `recordsourceoutcome`, `sourcereach` | store.mjs 47702–47821, 49252–49256 | `capture` | its R8 |
| the rows C-48.8, C-48.9 | bio-checks.mjs 11254–11286 | stay in `legacy-checks`, read | the C-48 family is read in place (K72 (1)); their invariant and test are this module's (R42) |
| `MONITOR_FREQ`, `MECHANICAL_FIELD_SETS` | bio-checks.mjs 1510, 5876–5881 | stay in `legacy-checks` | C-2.7 and C-20.1 read them too |
| the `archive-monitor` and `monitor-cadence` registry entries | store.mjs 3453–3465, 3530–3555 | `scheduler` | the registry is the scheduler's; it calls R19, R20 |
| the promote handler's arm on a monitored bundle; `recordSourceOutcome`'s arm | store.mjs 48512–48531, 47760 | `scheduler` | arming is the scheduler's, through promotion's projection and capture R44 |
| `OPS.monitor`, `OPS.driveshells`, the class sets naming `monitor`, `NEEDS.monitor` | index.mjs 1010–1016, 1529, 2065, 2197, 2357 | `control-plane` | routing and authentication (K3) |
| the daemon-class comment and `classify`'s daemon arm | index.mjs 3138–3190 and the class table | `control-plane` | authentication |
| `substanceDigests`, `profilesAsText`, `captureKey` | index.mjs 2969–3042, 4545 | `capture` | its R17; this module calls them |

## 3. Callers to rewire

- `op=monitor` over `env.SELF` from `#fireMonitorTick` (47657); `op=acquire`'s archive arm from `#fireArchiveFallback` (47680): in process (R23), or unchanged until Bob rules (Open 1).
- `monitorRecordLook` (index.mjs 3120) over the store route: an in-process call once `op=monitor` is a Durable Object service.
- `Store.CONTRACT_FREQUENCY` read by index.mjs 3054; `Store.monitorIntervalMs` by the plan: module exports.
- `#monitorConfigured` read by `op=promote`'s arm (48522) and `recordSourceOutcome` (47760): a `configured()` service the scheduler reads.
- `#monitorTokenBound` and `#monitorToken` read by `capture-requests` (40137, 40829): `runtime-limits.unattendedCredential` (§5.4).
- The projection's `monitor_enabled`, `monitor_frequency`, `monitor_last_checked`, `source_locator`, read by `#monitorSubjects` and `driveShells`: `retrieval`'s read contract (K75 (3)).

## 4. What `legacy-store` and `legacy-index` gain (ADDED lines)

- `legacy-store`: `import { monitoringOf } from "./monitoring/index.mjs"` (the path follows the module's own convention); the routes `driveshells` and `monitorlook` delegate; the registry's two entries call `monitoringOf(this.ctx, this.env)`'s six services; `promote` stops running the gathering check (registered instead); the purge list loses three names (declared by the module). About 15 lines.
- `legacy-index`: `op=monitor` forwards the body and the class stamp to the Durable Object's `monitor` service and returns its answer in the envelope. About 10 lines.
- `legacy-checks`: `checkBundle` loses its `checkGatheringGrammar` call and the function; nothing added.

## 5. Undetermined, conflicts, and code others could claim

1. **`from`.** `modules.json` says `legacy-store` alone, but `op=monitor` (704 lines) is in `index.mjs` and C-18.5 in `bio-checks.mjs`; a job may remove code only from its `from` modules (K47). Proposed: `["legacy-store", "legacy-index", "legacy-checks"]`, as K72 (1) did for layer 3.
2. **Uses.** Declared: `record-core`, `membership`, `capture`, `extraction`, `content`, `intent`, `reevaluation`, `actions`, `escalation`. The moved code also calls `legacy-checks`, `promotion`, `provenance`, `host-governor`, `capture-sources`, `docprofile`, `format-registry`, `observation-log`, `retrieval`, `runtime-limits`; R33 adds `publication`. Nothing calls `extraction` or `content`. Proposed: add those eleven, drop `extraction` and `content`.
3. **The Worker-side tick.** `op=monitor` fetches and writes R2 in the Worker today; moved into the Durable Object it does both there (the governor already runs there, K72 (2)). The Durable Object already holds the capture store: `record-core`'s evidence bucket is `env.CAPTURES` (store.mjs 869, K49), so the tick reads and writes through it rather than the binding.
4. **The unattended credential** is shared with `capture-requests` (layer 6). Proposed: `runtime-limits` gains `unattendedCredential(env)` (the D-334 rule) beside `liveToken`; both modules read it until R23 and capture-requests' R16 retire it.
5. **Tests.** Suites that follow the module: `monitor-cadence`, `monitor-address`, `monitor-assess`, `monitor-rendered`, `monitor-substance`, `archive-monitoring`, `d334-monitor-credential` (with its `.control.sh`), `d525-driveshells` (with its `.control`), `d524-archive-baseline`, `gathering`, `mechanical`. Old-battery files that read or patch moved text (`legacy-tests` entries, K53): `drive.control.mjs` (anchors on op=monitor's and acquire's twin lines), `m025-arm-anchor-witness.test.mjs`, `d334-monitor-credential.control.sh`, `d525-driveshells.control.mjs`, `observation-log.test.mjs` and `daemon-token.test.mjs` where they drive `onAlarm`, `reachability.test.mjs` (the floor). Runtime suites that reach `op=monitor` through the Worker stay green while the op forwards.
6. **Found in this reading:** a monitor tick records no source outcome, so a monitored source that stops answering never reaches the fallback unless something acquires it (R25). The store's comments name two consumers "the twelfth" and `SCHEDULER.md` counts twelve; there are thirteen (scheduler map §5.7).
7. **Other claimants.** `capture`: the thresholds and reachability (kept there). `observation-log`: the look's vocabulary (it provides; this module appends). `queue`: R31's items are read there. `reevaluation`: reads the flag R8 writes.
