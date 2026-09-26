<!-- The capture extraction map, written for BOB #42 on 2026-09-26 on tranche/T3; superseded where it disagrees with build/requirements/capture.md. -->
# capture — extraction map

**Status** · Measured 2026-09-26 by a drafting worker for BOB #42 (P18), reviewed by BOB. Line ranges are in the legacy files on `tranche/T3` at that date; the extraction job confirms them. Measured at `91933d7587` (record-core merged): `store.mjs` 53,685 lines, `schema.mjs` 4,180, `index.mjs` 13,438, `bio-checks.mjs` 16,591. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/capture.md` (R1–R42); K3, K49, K58, K60, K61 and K71 apply, and `build/extraction/capture-requests.md` draws the K58 seam. The module exports a factory (for example `captureOf(ctx)`, K61) for its store half. It reaches `record-core`, `membership`, `host-governor` and `provenance` through theirs, and imports the pure modules (`capture-sources`, `subresources`, `format-registry`, `docprofile`, `jurisdictions`).

## 1. What moves to `capture`

| what | where today | lines | moves |
| --- | --- | --- | --- |
| the doorbell: `knock`, `inboxList`, `inboxGet`, `inboxResolve` | store.mjs | 39402–39505 | yes (R30–R32) |
| the render allowance: header, `renderAdmit`, `renderSpend` | | 39537–39699 | yes (R39, R40). `recordRuntimeObservation` (39516–39535) and `runtimeObservations` sit beside them and stay (§2) |
| `recordLinks`, `linksTo`, `resolveLinks` | | 44695–44849 | yes (R27). `projectLinks` (44851–44904) does not |
| `recordLinkVerdict` | | 44906–44918 | yes (R27) |
| capture sessions: header, `saveCaptureSession`, `loadCaptureSession`, `dropCaptureSession` | | 44920–44961 | yes (R22). The requirements' "45860–46026" ran into ai-runs' constants |
| `siteAssets`, `recordSiteAssets`, `reusedParts` | | 49624–49776 | yes (R24, R25) |
| `recordReuseVerdicts`, `reuseVerdicts`, `siteChrome`, `captureLimit`, `recordCaptureLimit` | | 49922–50080 | yes (R23, R26, R28, R29). The monitor methods between (49778–49920) do not |
| the D-98 header and `taskEnqueue` | | 50082–50129 | yes (R14, R15). The drain and the inbox (50131–) do not (K49) |
| the D-104 header, `FALLBACK_*`, `#thresholds` | | 50680–50734 | yes (R8) |
| `recordSourceOutcome`, `sourceReachability` | | 51408–51526 | yes (R8) |
| store-op routes: `capturelimit`, `siteassets`, `recordsiteassets`, `reusedparts`, `recordreuseverdicts`, `reuseverdicts`, `renderadmit`, `renderspend`, `recordlinks`, `resolvelinks`, `linksto`, `recordlinkverdict`, `recordsourceoutcome`, `sourcereach`, `taskenqueue`, `save`/`load`/`dropcapturesession`, `sitechrome`, `recordcapturelimit`, `knock`, `inboxlist`/`get`/`resolve` | store.mjs `fetch` | 52276–52278, 52380–52386 (not `monitorlook`), 52629–52637, 52977–52983, 53063–53068, 53663–53666 | yes (K3) |
| `userAgent` | index.mjs | 166–203 | yes (R7; host-governor R16 leaves it to the caller) |
| `archiveSelect` and its comment | index.mjs | 214–269 | yes (R3, R8) |
| `KNOCK`, its stated bounds, `knockEnvelopeTooLarge`, `knockPayloadTooLarge`, `knockEmpty` | index.mjs | 2851–2944 | yes (R30, R31) |
| `PROFILE_TEXT_MAX`, `ODF_DIGEST_MAX`, `profilesAsText`, `substanceDigests` | index.mjs | 2969–3042 | yes (R17). `op=monitor` imports them (monitoring) |
| `captureRequestArm` | index.mjs | 3963–4025 | yes, shrunk to C-28.13's refusal of an outside `via: "capture-request"` (K58; capture-requests map §1) |
| op handler `knock` | index.mjs | 6749–6828 | yes (R30–R32) |
| op handlers `links`, `capture` | index.mjs | 7552–7572, 7574–7606 | yes (R27, R21) |
| op handlers `archivelookup`, `acquire` | index.mjs | 7929–7982, 7984–10153 | yes (R1–R20), except the reading block 9225–9928, which is `extraction`'s (K49, R42; §3.1) |

About 3,300 lines move: about 1,040 from `store.mjs`, 350 from `schema.mjs` and 1,930 from `index.mjs` (the acquire handler without its reading block is about 1,470). This agrees with the requirements' "about 3,400".

**Tables `capture` owns** (`schema.mjs`):
- the block 219–421: `inbox`, `knock_rate`, `capture_limits`, `site_assets`, `site_asset_refs`, `capture_sessions`, `links`, `link_verdicts`
- `task_queue` 508–537; `source_reachability` and `reuse_verdicts` 575–649; `render_allowance` and `render_slots` 3961–3998

Constructor migrations that go with them:
- the additive columns `site_assets.last_fetched_by`, `site_asset_refs.reused_from` and `render_allowance.reserved_ms` (store 1351, 1352, 1393)
- the reshape loop's `links` entry (store 938, shared with provenance's `captured_locators`)

Purge declarations:
- declared today by `legacy-store` for the whole-store purge (store 892–894): `task_queue`, `source_reachability`, `link_verdicts`, `links`, `site_asset_refs`, `site_assets`, `reuse_verdicts`, `capture_sessions`. The module declares them itself.
- declared exempt, as `hygiene.test.mjs` states them today (803–812): `inbox`, `knock_rate`, `capture_limits`, `render_allowance`, `render_slots`.

**Checks.** Uses reads C-48 (`DRIVE_CAPTURE_CHECKS`, bio-checks 12081–12203), C-83 (`RENDER_CAPTURE_CHECKS`, 11638–11731), C-85 (`KNOCK_CHECKS`, 11988–12038), C-28.13 (inside `CAPTURE_REQUEST_CHECKS`, 9267–9455, which stays with capture-requests' family), `isPublicHttpsLocator` (5342–5353), `EARNED_CAPTURE_CEILING` (3437) and `civicosUserAgent` (9263–9265) from `legacy-checks`. They are refusal rows and helpers, not findings `checkBundle` runs, and no requirement moves them. `legacy-checks` is not needed in `from`.

## 2. What stays in `legacy-store`/`legacy-index` or goes elsewhere

| what | lines | owner |
| --- | --- | --- |
| the reading block inside `acquire` | index.mjs 9225–9928, with its module-level helpers (`textUnitsFor` 5364–5532, `readingFromWire` 5560–5654, the tier helpers 4632–5360) | `extraction` (K49), layer 4 (§3.1) |
| `projectLinks` | store 44851–44904 | `connections` (K23) |
| `monitorObservationFor`, `recordMonitorLook`, `#recordMonitorAddressType`; `#fireMonitorTick`, `#fireArchiveFallback`; `driveShells`; `#monitorFloor`, `#monitorPending`, `#monitorTick` | store 49778–49920, 51363–51406, 17272–17325, 50858–50950 | `monitoring`/`scheduler`. They read `#thresholds` and `source_reachability` (50859, 50866, 50892, 50904) |
| the tasks inbox: `#routeTask`, `taskDrain`, `taskList`, `taskForward`, `taskResolve` | store 50131– | a later module (K49). `taskDrain` (50214–50304) reads `task_queue` (50224) |
| `#conditionsPartialCapture` (reads `capture_sessions`, 29166), `#frontierNeverLooked` (reads `links`, 45722), `#schedConsumers`' wake (reads `task_queue`, 3576) | | `queue`, `retrieval`, `scheduler`; each needs a capture read service |
| `recordRuntimeObservation`, `runtimeObservations`, `runtime_observations` | store 39516–39535; schema 473–492 | stays (Suggestions: whoever owns the compute measurement) |
| op=ratify's `reusedparts`, `capturelimit`, `recordreuseverdicts`; op=runtime's `capturelimit` | index.mjs 11704, 11720, 11782, 7447 | their handlers stay; the store paths delegate |
| `captureKey` | index.mjs 4545 | shared with `op=pdfstructure`; record-core R38 fixes the key |
| the inbox ops' stamps in the generic forwarder, `SESSION_OPS`, `OPS` rows | index.mjs 2177, 13292 and the OPS table | dispatcher (`control-plane`, K3) |

## 3. Private calls that leave the module, callers to rewire, and conflicts

Calls from the moved code:
- `#one`/`#rows`: copies.
- `Store.#sha256` (39507–39510; the knock): a copy.
- `this.#observe` in `recordReuseVerdicts`: observation-log, later in the order; its Suggestions offer a listener.
- `#armDrain` in `taskEnqueue` (50119, 50127) and `#armScheduler`/`#monitorConfigured` in `recordSourceOutcome` (51466): the scheduler, layer 10.
- reads of provenance's tables: `resolveLinks` 44768, 44837; `siteAssets` 49650–49654; `reusedParts` 49770; `siteChrome` 50010, 50020. These go to provenance R16 (`receipts`) and R4 (`homeOf`), or to a read contract (provenance map §4.3).
- In `index.mjs`, every `stGov.fetch`/`stLim.fetch` of a store path (8259, 8329, 8684–8695, 8810, 8888–9046) becomes a factory call once `acquire` runs where the factories are, or stays a store call if the handler stays in the Worker (§4.2).

Callers to rewire:
- `op=monitor` (index.mjs 10318–10923: `substanceDigests`, `profilesAsText`, `governedFetch`).
- `store.mjs` `#fireArchiveFallback` (fires `op=acquire`).
- `#monitorFloor` 50859 (`#thresholds`), `#monitorTick` 50904 (`sourceReachability`).
- op=ratify 11704–11782.

Conflicts with the requirements:
1. **R42 and the reading block.** `extraction` is layer 4 and does not exist when this job runs. Removing 9225–9928 now drops `reading`/`text_units` from every acquire answer before anything replaces them. Alternatively the block stays in `legacy-index`, run after `capture.acquire` returns, until extraction's job moves it. The second keeps the old battery green. BOB decides.
2. **Arming the scheduler.** R15 says `taskEnqueue` "arms the scheduler's drain", and `recordSourceOutcome` arms the monitor alarm, both in layer 10. The K31 pattern fits: the scheduler registers a wake with this module. `capture` then calls no later module.
3. **`#thresholds` is read by monitoring** (`#monitorFloor`). R8 makes the three figures instance settings; `sourceReachability` returns them, but the floor needs them without an address. A small `reachabilityThresholds()` service, or a `record-core` setting both read.
4. **R11 (continuation).** The primary is fetched again (from 8888). Fixed here (K49), which changes answers `acquire.test.mjs` and `d260-resume` pin.
5. **R18 (D-698).** The archive letter is typed `"C"` at index.mjs 10073; it becomes `provenance.captureGrade`'s `ARCHIVE_CAPTURE_GRADE`.
6. **R20 (K60).** `attestation_attempts: []` at 10115 becomes a timestamp request and a co-archive at every capture. That needs `signatures` (TSA endpoints, `ARCHIVE_SAVE_BASE`), which is **not** in this module's `uses`; or it calls `provenance.attest`, which is in `uses`. Name which.
7. **R41, R17 (the view).** `jurisdictions.combine` needs record-core's `jurisdiction_profiles` setting (N10, record-core R26), merged now.

## 4. Undetermined (stated, not guessed)

1. **`from`.** The code spans `legacy-store` and `legacy-index`, so `from: ["legacy-store", "legacy-index"]` (K66). `modules.json` has only `legacy-store`.
2. **Where `acquire` runs.** Today it is a Worker handler that reaches the store by paths. R1–R20 make it a service, and capture-requests' in-process arm (K58) calls it from inside the Durable Object. Two options: the service runs in the DO with the factories, and the handler forwards; or it runs in the Worker taking a stub. BOB decides.
3. **Double claims.** `governedFetch` sits in this requirement's Status line but is host-governor's R15; this map leaves it there (host-governor map §4.1). The archive's 24/min `governorconfig` (index.mjs 235–240) is claimed here (R3) and offered by `capture-sources`' Suggestions; see that map's §4. `userAgent` is taken here, and `ratify` (11756) and the monitor import it.
4. **Provenance-table reads** from this module's code (§3) wait on provenance's read contract.

## 5. Old tests (legacy-tests) that anchor on the moved text

- `acquire.test.mjs` (`existed = partHeldBefore[0];` in acquire); `d524-archive-baseline.test.mjs` (`body.locator = sel.replay`); `drive.control.mjs` (two acquire lines)
- `nc-d64.mjs` (the render arm's line in acquire); `nc-d513.mjs` (the knock handler and `knockEmpty`); `doorbell.test.mjs` (its arms name `knockEmpty()` and `KNOCK` in `index.mjs`)
- `nc-d492.mjs` (`renderSpend`'s lines); `nc-d508.mjs` (`knock`'s `RATE_IP` line); `cap13-reuse-pages.test.mjs` (`siteAssets`' SQL)
- `refusal-wire.test.mjs` (`op=capture`'s `requiredArgument` text); `plane-envelope.test.mjs` (303–306: `UNCONVERTED` fetch paths in `index.mjs`, and `json(sel.payload, sel.status)`)
- `capturerequests.test.mjs` (1109: `return civicosUserAgent(version, instance, purpose)` in `INDEX_SRC`, which moves with `userAgent`); `fence-e2e.test.mjs` (5: `captureRequestArm`'s conduct fence)
- `hygiene.test.mjs` (the purge census and the exemptions for the five exempt tables)
- Candidates by name that run through ops, and so stay green while the routes and handler behave: `reachability`, `subresources`, `rendered-capture`, `d522-unattended-render`, `browser-render`, `drive`, `drive-convert`, `d525-driveshells`, `archive-monitoring`, `cap14-reused-from`, `reuse-ratify`, `d260-resume`, `d389-fullfetch`, `empty-body`, `pipeline-e2e`. R11, R18 and R20 change pinned answers in some of them.
