<!-- The provenance extraction map, written for BOB #42 on 2026-09-26 on tranche/T3; superseded where it disagrees with build/requirements/provenance.md. -->
# provenance — extraction map

**Status** · Measured 2026-09-26 by a drafting worker for BOB #42 (P18), reviewed by BOB. Line ranges are in the legacy files on `tranche/T3` at that date; the extraction job confirms them. Measured at `91933d7587` (record-core merged; membership and promotion not yet): `store.mjs` 53,685 lines, `schema.mjs` 4,180, `index.mjs` 13,438, `bio-checks.mjs` 16,591. Once PROMOTION #1 merges, the two `promote()` sites below will be in `legacy-store`'s registered step, not in `promote()`, and the job re-measures them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/provenance.md` (R1–R47); K23, K31, K49, K59, K61, K62 and K69 apply. The module exports a factory (for example `provenanceOf(ctx)`, K61) and reaches `record-core`, `membership` and `promotion` through theirs.

## 1. What moves to `provenance`

All in `store.mjs` unless named otherwise.

| what | where today | lines | moves |
| --- | --- | --- | --- |
| `chainFromEvidence`, `#rowUnlessStated`, `provenanceChainRebuild` | store.mjs | 16353–16597 | yes (R19–R21). R21's machine refusal is added (REC-158) |
| route marks: header, `ROUTE_MARK_NOTE`, `#latestRouteMark`, `routeFinding`, `provenanceRouteAssess`, `provenanceRoutesMarked`, `ROUTE_MARKED_*` | | 16599–17116 | yes (R22, R23) |
| testimony header, `TESTIMONY_MAX_BYTES`, `TESTIMONY_FORMAT`, `testimonyBytes`, `observerRef` | | 21701–21791 | yes (R28) |
| `#observedMs`, `#testimonyFence`, `testify` | | 22095–22474 | yes (R1–R3 fence, R28) |
| inside `promote()`: the fence call | | 18327–18336 | becomes this module's registered `check` (R3; promotion R39) |
| inside `promote()`: the register UPSERT | | 19769–19793 | becomes this module's registered `project`ion (R1; promotion R39) |
| `registerAudit`, `#partsNamedFor` | | 34525–34602 | yes (R6, R8, R9) |
| `homeCensus`, `registerHolds` | | 35614–35720 | yes (R5, R10) |
| `recordCapturedLocator`, `capturedLocators`, `VERSION_CHAIN_LIMIT_*`, `versionChain` | | 39863–40164 | yes (R13–R18); renamed `recordReceipt`/`receipts`, and the observation-log row goes to `onReceipt` (R47) |
| `homeOf`, `registeredFor`, `capturesOf`, `captureGrade`, `declareOrigin`/`originOf`, `onReceipt` | not written | — | new (R4, R11, R12, R24–R27, R29–R30, R47). `capturesOf` replaces the ordering in `#captureForContent` (20863–20918; D-580) |
| store-op routes `homecensus`, `registerholds`, `recordcapturedlocator`, `versionchain`, `testify`, `provenancechain`, `provenanceroute`, `provenanceroutes`, `registeraudit` | store.mjs `fetch` | 52245–52251, 52640, 52656–52662, 52820–52829, 53397–53419, 53610 | yes (K3) |
| `partsHeld`, `PART_VERIFY_READ_MAX` | index.mjs | 4547–4577 | yes (R7) |
| op handler `registeraudit` | index.mjs | 7247–7306 | yes (R8, R9) |
| op handler `attest` | index.mjs | 10155–10302 | yes (R31–R33) |
| C-18 register arms: `checkAuthorityPublishable` (C-18.9) and `checkReleaseAuthority` (C-18.1), with their doc comments | bio-checks.mjs | 2031–2273 | yes (R42, R46) |
| `checkRegisterIntegrity` (C-18.3, C-18.4) | bio-checks.mjs | 5360–5423 | yes (R43, R44). The section comment 5333–5338 also covers C-18.5, which goes to monitoring |
| `storedToHashable`, `checkInfo2Contract` (C-18.1 @2, C-18.6) | bio-checks.mjs | 5554–5740 | yes, except the C-18.7 arm (5688–5698), which stays for promotion (K49) |
| their calls in `checkBundle` | bio-checks.mjs | 6985–6988 | removed (§3.1) |

About 2,700 lines move: about 1,780 from `store.mjs`, 240 from `index.mjs`, 170 from `schema.mjs` and 480 from `bio-checks.mjs`. The refusal families (§4.2) would add about 270 more.

**Tables `provenance` owns (R41):**
- `register`: schema 17–40, plus the constructor's additive columns `authored`, `author`, `observed_at` (store 1322–1324).
- `captured_locators`: schema 422–472, plus its entry in the constructor's reshape loop (store 938, for `via`, which it shares with `links`).
- `provenance_route_marks`: schema 2764–2856, with the REC-112 index and its comment.

Today `legacy-store` declares all three to purge (store 868, 871, 893). The module declares them itself: `register` and `provenance_route_marks` keyed by `bundle_id`, `captured_locators` whole-store only.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | lines | owner |
| --- | --- | --- |
| `testimonyReach`, `observationsNamingAuthor`, the attribution cluster (`#attributionInForce` … `attributeObservation`) | store 21793–22093 | later modules (inquiry basis, publication attribution; Suggestions "What stays out") |
| `changedFromAudit`, `#versionNoticeFor`, `versionNotice` | store 40166–40254, 40600–40750 | `content`/`publication` readers of `versionChain`. Not in R1–R47 |
| `digestCensus`, `#fileDigestOf`, `#digestFiles`, `snapKeyCensus`, `#manifestFiles`, `#samePromotion` | store 34228–34292, 35527–35613 | not provenance: they census `files`/`manifest` (record-core or promotion; §4.5) |
| `#producingGroup`, `#groupUndetermined` (called by `testify` 22297–22299) | store 33900–33905, 33977–33984 | `instance-setup` (K69), later in the order (§3.3) |
| `attesttext`, `transcriptionAttest`, `text_attestations` | — | `extraction` (Suggestions) |
| `projectLinks` | store 44851–44904 | `connections` (K23) |
| the generic forwarder's stamps for `testify`, `provenancechain`, `provenanceroute`, `provenanceroutes`, `versionchain` | index.mjs 12001–12015, 12047, 12274–12275, 12391–12392, 12576–12585 | stay with the dispatcher (`control-plane`, K3) |
| the ratify gate's and publication's calls of `partsHeld` | index.mjs 11389, 11641 | publication/promotion's handlers; they import R7 |

**Direct SQL on this module's tables from other code: 48 sites.** R41 forbids other writers only, so reads need a stated read contract (as record-core R37) or services:
- `actionCorrespond` 7134, `#respondsToInto` 7745, `#caseCitations` 9620, `#searchedForCase` 10242–10245
- `auditPass` 16285–16287 (route marks), `listBundles` 17164–17166, `driveShells` 17307
- `promote` 18730 and 19685, `#captureForContent` 20900–20913 (R12)
- the testimony readers 21823, 21896, 22037; `#leadReferentVisible` 23002; `idMatch` 23430–23438
- `earnedBasisRegistry` 27705–27706, `#captureDateMs` 28332
- the conditions 29066–29067, 29167, 29417
- `exportManifest` 36282, `gateFacts` 37339, `#legVersions` 39102, `changedFromAudit` 40223, `#capturedAddresses` 40596, `#independenceOf` 41000
- `projectLinks` 44871, `contentAxis` 45470
- the observation and frontier readers 45787, 45955–46091, 46561–46639, 46997
- `recordMonitorLook` 49855, `taskDrain` 50227, `#monitorSubjects` 51145–51150
- stats counts 32078, 32298

`capture`'s own code reads them at 6 more sites (capture map §3).

## 3. Private calls that leave the module, callers to rewire, and conflicts

Calls from the moved code:
- `#one`/`#rows`, `Store.#rand`: copies (K57).
- `recordOf(ctx).readImage`, `.allocId` (16502, 22310), the evidence store (R38): record-core, clean.
- `viewerPredicate` (16495), `#bundleGate` (40082), `#inSight` (inside the fence): membership R43/R44.
- `this.promote` (16579, 22403): promotion.
- `isMachineIdentity`, `TESTIMONY_CHECKS`, `ROUTE_MARK_CHECKS`, `VERSION_CHAIN_CHECKS`, `ATTEST_CHECKS`, `EARNED_CAPTURE_CEILING`, `TESTIMONY_GRADE`, `OBSERVATION_STATES`: `legacy-checks`, allowed.
- `timestampRequest` and the rest: `signatures`.
- Later modules, which cannot be called from here: `#observe` (39942, 22435; observation-log), `#writeCaptureText`, `#observeIndexed`, `mintContent`, `contentContextFor` (22401–22424; extraction, content).

Callers to rewire:
- `#withRoute` 17140 and `auditPass` 16294 (`Store.routeFinding`).
- `promote` 18334 and 19783, through registration.
- `recordMonitorLook` 49865 (`recordCapturedLocator`).
- `changedFromAudit` 40233 and `#versionNoticeFor` 40609/40618 (`versionChain`).
- `index.mjs` 8599, 8765 and 10197 (store paths `registerholds`, `recordcapturedlocator`, unchanged while routes delegate), 11385–11389 and 11641 (`partsHeld`).

Conflicts:
1. **C-18 moves from the gate to the promotion.** The arms run today in `checkBundle` at `runGate` (ratify) and in record-core's `auditPass`. R42–R46 register them with `promotion.registerStep`, which runs inside `promote`'s synchronous `transact`. C-18.6 streams stored parts from the evidence store (`await`), which cannot run inside that transaction. Also, `gate.mjs` (promotion, layer 2) cannot import this module to keep running them at ratify, and the audit would lose them. K64's pattern (the gate imports the moved checks) does not fit a layer-3 module. BOB decides: a gate-side registration in promotion (a `registerGateCheck`), or C-18.6 staying at the gate through one.
2. **Testify's later work.** `testify` passes `promote` a hook that indexes words, mints content and logs an observation (22401–22435). Under K31 those are projections that `extraction`, `content` and `observation-log` register; until they are extracted, `legacy-store` registers them, as PROMOTION #1 does for its share.
3. **The producing group.** R28 refuses with no group and stamps it; `#producingGroup` goes to `instance-setup` (K69), later in the order, and membership's Provides lack it. promotion reads it as a registered fact (R40, K69). This module needs the same fact: either promotion exposes its registered facts, or R28 gets its own registration.
4. **`recordCapturedLocator` writes the observation row itself** (39942). R47 `onReceipt` replaces that; `legacy-store` registers the listener until observation-log is extracted.

## 4. Undetermined (stated, not guessed)

1. **`from`.** The code spans three legacy modules: `["legacy-checks", "legacy-store", "legacy-index"]` (K66 permits a list). `modules.json` has only `legacy-store`.
2. **The refusal families.** The Suggestions say C-53.1–9 and .13, C-34, C-24 and C-89.1 "move with this module". Uses reads them from `legacy-checks`: `TESTIMONY_CHECKS` 13998–14125 (C-53.10–12 in it are publication's), `ROUTE_MARK_CHECKS` 11016–11086, `VERSION_CHAIN_CHECKS` 7611–7667, `ATTEST_CHECKS` 12052–12061. Moving them means splitting `TESTIMONY_CHECKS`. Which it is is BOB's.
3. **The read contract** for the 48 outside sites (§2): stated table columns, or services.
4. **The `bundles` join.** `#testimonyFence` 22225, `registerHolds` 35717, `homeCensus` 35635 and `versionChain` 40102 join `bundles`. That is record-core R37's read contract; confirm that it covers them.
5. **`digestCensus`/`snapKeyCensus`** are claimed by no map (the membership map §2 left them open too).
6. **`userAgent`** is not used here; `attest` uses the TSA endpoints only (R39).

## 5. Old tests (legacy-tests) that anchor on the moved text

- `provenance-chain.test.mjs` (2, 285–286: the `checkAuthorityPublishable`…`checkReleaseAuthority` slice of the catalogue)
- `provenance-marker.test.mjs` (303: `/provenanceRouteAssess[\s\S]{0,6000}?UPDATE bundles/`; `#partsNamedFor`)
- `nc-rec63.mjs` (82, `#withRoute`'s `Store.routeFinding` line); `nc-rec112-index-plan.mjs`, `nc-rec116-plan.mjs` (62, 80–81), `nc-rec69-selects.mjs` (the REC-112 index text); `rec116-route-marked.test.mjs`
- `airuns.test.mjs` (the unread-index roster pins `provenance_route_marks_finding`)
- `versionchain.test.mjs` (356: `versionchain: () => this.versionChain({`, and the table text); `derivation-bounds.test.mjs` (620, 950: `provenanceRoutesMarked`, `versionChain` as store methods); `meaning-bounds.test.mjs` (1383: `registeraudit->registerAudit`)
- `attest.test.mjs` (102–103: `if (op === "attest")` in `index.mjs`); `d533partsaudit.control.mjs` and `d556partedpublish.control.mjs` (`partsHeld`, `registerHolds`)
- `testify.test.mjs` (`testimonyBytes`), `mk7-attribution.test.mjs` (419: testify's `observerRef` line), `instance-group.control.mjs` (41: testify's `group:` line), `d179onehome.control.mjs` (`registerAudit`)
- `independence.test.mjs` (308) and `partitionindependence.test.mjs`: `FROM captured_locators` text in store code that stays; they break only if that SQL is rewired.
- `hygiene.test.mjs`: the purge and table census over `schema.mjs`.

Runtime tests through the store routes (`homecensus`, `versions`, `bounds` 952, `monitor-*`, `observation-log`) stay green while the routes delegate.
