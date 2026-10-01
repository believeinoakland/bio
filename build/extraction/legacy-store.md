# Extraction map: legacy-store (`bio-plane/src/store.mjs`, `bio-plane/src/schema.mjs`)

**Status** · DRAFT by a worker for BOB #75, 2026-09-30, on `tranche/T18` @ `99295ca732` (the plane's source unchanged since `88289d088a`, K632). The map to empty and retire `legacy-store` (K632: T19's top priority). Written in the form of `legacy-checks.md` §1–§4. BOB turns it into tranche entries.

`legacy-store` owns `bio-plane/src/store.mjs` (**3,102 lines**) and `bio-plane/src/schema.mjs` (**83 lines**) (`modules.json`; layer 10, after `scheduler`). `store.mjs` is now:
- 396 lines of imports (263 names; **139 never read**);
- one class, `Store extends DurableObject` (469–3096), with 260 members;
- three small top-level declarations and a default export.

Most of the class is one-line delegations to modules that already hold the code. What is still real is:
- the composition root (construction order, the migration pass, the route map);
- two bulk acts (`release`, `retire`);
- `auditPass`, `listBundles`, `buildIndex`, `#counts`, `purge`;
- the two promotion shares (`#promoteChecks`, `#promoteProjections`) with the testimony path;
- the strength cache;
- 46 explicit route arms of modules that publish no ops map.

**How the plane reaches it.** Only through `fetch`: `control-plane/dispatch.mjs`:192 `Store extends LegacyStore` answers every request through `this.routes(url, body)` (R26). Grep finds no Durable Object RPC call (`stub.<method>(`) anywhere in `bio-plane/src`, `agent-worker/src`, `newgroup/src`, `ocr-worker` or `pdf-worker`. So a public method is reached by the product only if a route arm, or other code in the file, calls it. The rest are reached only by old suites, or not at all; the old suites are not run (K619) and are deleted at the next release (K635). The only other product importer of `store.mjs` is `control-plane/index.mjs`:71 (`Store.CAPABILITIES` at :1759, which is `Membership.CAPABILITIES`).

**How it was measured.**
- *Parsing.* Top-level declarations and class members were parsed with acorn, and each range includes the comment block above it. Imported names were counted by identifier use outside the import.
- *Callers.* Private members (`#x`) were checked with grep. Public members and statics were grepped as `.name(` and `Store.name` over the product, `test/m/` and the old battery.
- *Purge declaration.* The constructor's declaration (478–512) was evaluated under node with the owners' real predicates: all 61 names filter out, so it declares nothing.
- *Owners.* Each owner was chosen from its requirements' Purpose and Provides, and from rulings N13, N342, N379, N392, N400/K583, N405/K593, N408/K621, K566, K624, K636 and K637.

**Actions in the map:**
- **move**: code the owner does not hold yet.
- **delete (delegation)**: a one-line forwarder to a module that already holds the code; it is deleted, not moved. The route arm or in-file caller that reads it is re-pointed with it.
- **composition root**: construction, migration order and the route map's frame. They go to `control-plane`, which R35 already makes the composition root and whose `Store` already wraps this class. Control-plane is layer 11, after `affordances`, `queue` and `tasks`, so the move also ends N13.
- **dead**: nothing reads it.
- **imports / frame**: these lines go when the file empties.

**T18** marks what the current tranche (K636, K637) already carries.

## 1. The map

### 1a. `store.mjs`

| lines | n | what | owner | action |
|---|---|---|---|---|
| 1 | 1 | import DurableObject | control-plane | composition root |
| 2–127 | 126 | catalogue import block: 33 names, 25 never read, 2 (BASIS_GRADES, ACT_SHAPE_CHECKS) read only by dead code | imports | imports |
| 128–396 | 269 | module imports and 12 more catalogue import statements at 331–395 (23 names, 2 read: SURFACE_CHECKS, MEMBER_ID_CHECKS); 144 re-exports stampInstant, instantOrder (only the legacy suite d543 reads it) | imports | imports |
| 397–435 | 39 | actNoCitation (+ D-484 header): no caller; entities and progressions hold their own; C-33.41 row's where names it | dead | dead |
| 437–457 | 21 | file header comment | frame | frame |
| 458–459 | 2 | INLINE_MAX: unused | dead | dead |
| 461–467 | 7 | safeJson (textattest route's rect) | content | move |
| 469 | 1 | class Store extends DurableObject | frame | frame |
| 470–474 | 5 | constructor frame | control-plane | composition root |
| 475–477 | 3 | comment on the purge declaration | dead | dead |
| 478 | 1 | recordOf(ctx,{evidence,evidencePrefix}) | control-plane | composition root |
| 479–512 | 34 | declarePurge("legacy-store", [61 tables] filtered): every table is owned, the list filters to [] (measured) | dead | dead |
| 513–544 | 32 | module construction order (observation-log, promotion, extraction/content, entities, retrieval, basis-versions, ai-runs, reevaluation, publication, actions) | control-plane | composition root |
| 545–548 | 4 | retrieval.registerLegGrades: earned registry + legCapped are inquiry's (R13, R14) | inquiry | move |
| 549–553 | 5 | retrieval projection decoration surfaced_in (N405, K593; T19 by K624 (5)) | inquiry | move |
| 554–558 | 5 | connections onDerived + registerDerivationProvider in legacy-store's name (connections R5, R51). **T18** (observation-log) | observation-log | move |
| 559–577 | 19 | construction: ratification, strength, bias, run-productions, review, intent, case-authoring, layer 9, monitoring | control-plane | composition root |
| 578 | 1 | promotion.registerStep("legacy-store") (goes when its two shares are empty) | frame | frame |
| 579 | 1 | comment for capture R55 | observation-log | move |
| 580–584 | 5 | capture, capture-requests construction | control-plane | composition root |
| 585 | 1 | capture.on("observation","legacy-store") (capture R55, K99) | observation-log | move |
| 586–590 | 5 | scheduler, queue, tasks (N13), migrate, scheduler start | control-plane | composition root |
| 592 | 1 | #migrate header | control-plane | composition root |
| 593 | 1 | schema text pass (with schema.mjs; env.SCHEMA override unused) | record-core | move |
| 594–626 | 33 | DROP-derived loop: capture.migrate (CAPTURE_RESHAPE) and extraction.migrate already drop links / reading_ref_terms; captured_locators filtered out | dead | dead |
| 627–660 | 34 | REC-143 two-pass note + manifest writer/operation additive columns | record-core | move |
| 661–676 | 16 | bundles.inquiry_capture_/connection_ strength+state columns (strength R13, R23) | strength | move |
| 677–714 | 38 | bundles.inquiry_basis_count, _subject_entity, _superseded_by columns (inquiry R36, N136) | inquiry | move |
| 715–724 | 10 | addColumns helper + first pass | record-core | move |
| 725 | 1 | schema statements executed | record-core | move |
| 726–743 | 18 | each module's migrate(), in order | control-plane | composition root |
| 744–746 | 3 | second additive pass | record-core | move |
| 747–759 | 13 | DROP COLUMN classification on bundles | record-core | move |
| 760–768 | 9 | type-alias normalisation of bundles.object_type (reads record-grammar's LEGACY_TYPE_ALIASES) | record-core | move |
| 769–772 | 4 | comment: the strength indexes | strength | move |
| 773 | 1 | retrieval.migrate() | control-plane | composition root |
| 774–775 | 2 | CREATE INDEX bundles_inquiry_*_strength | strength | move |
| 776–781 | 6 | record.migrate + seedMintLedger(MINT_LEDGER_LIVE) | record-core | move |
| 782–788 | 7 | reindexProjectSight at boot (D-497) | membership | move |
| 789 | 1 | close | control-plane | composition root |
| 791–792 | 2 | static supersededByOf: no caller | dead | dead |
| 794–802 | 9 | reproject..searchIndexCheck delegators | retrieval | delete (delegation) |
| 803 | 1 | selectionCreate | retrieval | delete (delegation) |
| 804 | 1 | selectionResolve (read by retire, release) | retrieval | delete (delegation) |
| 805–808 | 4 | selectionList..frontier | retrieval | delete (delegation) |
| 810–818 | 9 | #surfacedIn (N405) | inquiry | move |
| 821–826 | 6 | #armConnectionDerive (read by resolve arms) | scheduler | delete (delegation) |
| 827 | 1 | static SELECTION_ID_CHUNK | retrieval | delete (delegation) |
| 829–830 | 2 | alarm(), onAlarm(): the DO class's alarm hook, to scheduler | control-plane | composition root |
| 831–834 | 4 | #armScheduler, schedProbeArm, schedProbeLog, schedAlarmAt | scheduler | delete (delegation) |
| 836 | 1 | static EDGE_REASON_MAX (retire's bound) | unowned (retire) | move |
| 837–841 | 5 | static RELEASE_ACK_MAX. **T18** (K583, K636) | ratification | move |
| 842–843 | 2 | dispose | inquiry | delete (delegation) |
| 844 | 1 | #refEdgeSevered: no caller | dead | dead |
| 847 | 1 | #citesInto (read by #retirementCitedBy) | connections | delete (delegation) |
| 850–855 | 6 | published registries, attribution reads (publishedRegistryFor read by auditPass) | publication | delete (delegation) |
| 857–870 | 14 | RETIRE_CITED_DETAIL, #retirementCitedBy (promotion R16's "same fence") | unowned (retire) | move |
| 872–997 | 126 | retire (bulk verified→retired over a selection, weight refuse): no requirement names an owner; proposed ratification, beside release | unowned (retire) | move |
| 999–1198 | 200 | release (K583; C-32.1, C-33.10–.12 regions; ratification R20–R27). **T18** | ratification | move |
| 1200–1201 | 2 | conclude | basis-versions | delete (delegation) |
| 1203–1208 | 6 | six action delegators | actions | delete (delegation) |
| 1211–1213 | 3 | reopen (route) | promotion | delete (delegation) |
| 1216 | 1 | publishCase | case-authoring | delete (delegation) |
| 1221–1223 | 3 | divide, groundInquiry | inquiry | delete (delegation) |
| 1225–1229 | 5 | narrowCandidates, narrow | basis-versions | delete (delegation) |
| 1231–1263 | 33 | #appendStateHistory (read by release and retire only: T18 copies it, the copy here goes with retire) | ratification | move |
| 1265–1272 | 8 | #setScalar (release, retire; as above) | ratification | move |
| 1275–1276 | 2 | #rows, #one | frame | frame |
| 1279–1306 | 28 | auditPass: viewer-gated page over recordAudit (R18-R20) | record-core | move |
| 1307–1311 | 5 | auditPass context: earned registry (inquiry) + published registry (publication), R45 | inquiry | move |
| 1312–1314 | 3 | auditPass page | record-core | move |
| 1315–1358 | 44 | auditPass route-marker tally (DEC-56, provenance R22-R23) | provenance | move |
| 1359–1365 | 7 | auditPass answer | record-core | move |
| 1366–1373 | 8 | auditPass `route` field | provenance | move |
| 1374–1384 | 11 | auditPass answer (limit, cursor, total) | record-core | move |
| 1385–1406 | 22 | auditPass reserved-id finding (C-55, MEMBER_ID_CHECKS) | membership | move |
| 1407–1408 | 2 | close | record-core | move |
| 1410–1416 | 7 | provenanceChainRebuild, provenanceRouteAssess, provenanceRoutesMarked (routes) | provenance | delete (delegation) |
| 1419–1444 | 26 | #withRoute (provenance's routeFinding folded into op=list's row) | retrieval | move |
| 1446–1535 | 90 | listBundles (op=list) | retrieval | move |
| 1537–1550 | 14 | buildIndex (op=index) | retrieval | move |
| 1553 | 1 | #viewerSees (image/file routes) | membership | delete (delegation) |
| 1555–1641 | 87 | REC-30 note + #bundleGate + #bundleRedactor: no caller | dead | dead |
| 1643–1648 | 6 | eachImage: no product caller (legacy suites only) | dead | dead |
| 1650–1651 | 2 | static basisVersionsOf: no caller | dead | dead |
| 1653–1664 | 12 | promote (read by retire, release) | promotion | delete (delegation) |
| 1666–1670 | 5 | #promoteChecks frame | frame | frame |
| 1671–1707 | 37 | C-66.5 surfaced_by carried forward (SURFACE_CHECKS; row's where names this) | inquiry | move |
| 1709–1715 | 7 | testimony path: C-45 extent check before the mint | content | move |
| 1716–1732 | 17 | unused docFmW/isInquiry and comments of moved arms | dead | dead |
| 1734–1738 | 5 | #promoteProjections frame | frame | frame |
| 1739–1741 | 3 | unused testimony, surfacing consts | dead | dead |
| 1742–1747 | 6 | membership's sight index recomputed on each promotion (D-497) | promotion | move |
| 1748–1750 | 3 | comments of moved projections | dead | dead |
| 1751–1757 | 7 | #writeStrengthProjection call (R13) | strength | move |
| 1758–1760 | 3 | comments of moved projections | dead | dead |
| 1761–1765 | 5 | testimony path projection call | provenance | move |
| 1766–1768 | 3 | comment of a moved projection | dead | dead |
| 1769–1774 | 6 | answer: bundleSha/rowVersion, visibility on project creation (REC-197) | promotion | move |
| 1775–1779 | 5 | answer: testimony key | provenance | move |
| 1783–1792 | 10 | attestText, attestationsFor, contentContextFor, mintContent, contentMint | content | delete (delegation) |
| 1794–1795 | 2 | static observerRef: no caller | dead | dead |
| 1797 | 1 | testimonyReach: no caller | dead | dead |
| 1799–1800 | 2 | testify (route) | provenance | delete (delegation) |
| 1802–1815 | 14 | #testimonyWithin header | provenance | move |
| 1816–1817 | 2 | indexTestimony (R61, R62) | extraction | move |
| 1818–1820 | 3 | content row minted at the document extent | content | move |
| 1821–1825 | 5 | extraction look row | observation-log | move |
| 1826–1827 | 2 | answer | provenance | move |
| 1829–1832 | 4 | transcribe, transcriptionAttest, transcriptionRead | content | delete (delegation) |
| 1834–1840 | 7 | lead..leadList | observation-log | delete (delegation) |
| 1841–1842 | 2 | #leadReach, #leadReferentVisible: no caller | dead | dead |
| 1844 | 1 | #positionalMember: no caller | dead | dead |
| 1846–1847 | 2 | ensureLegContent | inquiry | delete (delegation) |
| 1849–1854 | 6 | contentRow, contentRead, cropOf | content | delete (delegation) |
| 1856–1885 | 30 | readingTermsClear..documentsByReference | extraction | delete (delegation) |
| 1887–1908 | 22 | #GRADE_RANK, #isEstablished and their notes: no caller | dead | dead |
| 1910–1937 | 28 | #MEANING_LIMIT_DEFAULT/_MAX and D-225 note: no caller | dead | dead |
| 1939–1952 | 14 | resolveReferences, testifyResolution: entities' resolve, arming the connection sweep (routes resolve, resolvetestify) | entities | move |
| 1954–1961 | 8 | eight progression delegators | progressions | delete (delegation) |
| 1963–1969 | 7 | #strongestResolutionsFor: no caller | dead | dead |
| 1971–1974 | 4 | #subjectEntityOf, earnedBasisRegistry (auditPass, leg grades), earnedRegistryForDoc | inquiry | delete (delegation) |
| 1976–1989 | 14 | #nowMs (clock handed to retrieval, capture-requests) | control-plane | composition root |
| 1994–2002 | 9 | MINT_LEDGER_LIVE (PROJ on bundles; CASE on case-authoring/publication tables) | record-core | move |
| 2005–2020 | 16 | stats (record-core R64, K621). **T18** | record-core | move |
| 2022–2027 | 6 | #hiddenRunTail (R42) | ai-runs | move |
| 2030–2079 | 50 | #counts frame, D-464 subtraction, bundles/files/history | record-core | move |
| 2080–2108 | 29 | textUnits, textIndexOk | extraction | move |
| 2109–2110 | 2 | selections, selectionItems | retrieval | move |
| 2111–2113 | 3 | taskQueue, sourceReachability | capture | move |
| 2114–2119 | 6 | monitor counts | monitoring | move |
| 2120–2124 | 5 | entities, aliases, relations, resolutions | entities | move |
| 2125–2130 | 6 | connections, connectionPairChoices (+progressionDefs) | connections | move |
| 2131–2143 | 13 | stages, versions, instances, exceptions | progressions | move |
| 2144–2147 | 4 | connectionDirty | connections | move |
| 2148–2151 | 4 | proposalDispositions | progressions | move |
| 2152–2157 | 6 | projectParticipants, projectOwnerVotes | membership | move |
| 2158–2169 | 12 | content, contentStale | content | move |
| 2170–2179 | 10 | proposedReadings | run-productions | move |
| 2180–2190 | 11 | aiRuns, aiRunBounds, inquiryRunSurfacings | ai-runs | move |
| 2191–2192 | 2 | inquiryMigrationReplays | inquiry | move |
| 2193–2207 | 15 | aiRunLog through R42 | ai-runs | move |
| 2208–2237 | 30 | observationsNonLead / observations / leads disclosure (R64, K621). **T18** | record-core | move |
| 2238–2240 | 3 | themes, themePlacements | connections | move |
| 2241–2247 | 7 | basisVersions, basisVersionLegs | basis-versions | move |
| 2248–2252 | 5 | suggestRefusals | run-productions | move |
| 2253–2258 | 6 | captureRequests | capture-requests | move |
| 2259–2268 | 10 | bias counts spread | bias | move |
| 2269–2272 | 4 | routeMarks | provenance | move |
| 2273–2282 | 10 | dbBytes (R64) and record-core's registered counts (R63); dbBytes **T18** | record-core | move |
| 2284–2287 | 4 | #basisCyclePath (dead), basisFor, restingOn | inquiry | delete (delegation) |
| 2289–2292 | 4 | STRENGTH_AXES, strengthOf (read by #writeStrengthProjection) | strength | delete (delegation) |
| 2294–2295 | 2 | #capturedAt = legCapped | inquiry | delete (delegation) |
| 2298–2350 | 53 | #writeStrengthProjection (R13 cache) | strength | move |
| 2352–2380 | 29 | purge (R22) with before/after proof | record-core | move |
| 2381 | 1 | clearLead on a bundle purge | capture-requests | move |
| 2382–2434 | 53 | purge proof | record-core | move |
| 2436–2446 | 11 | credentials note + static #enc: unused | dead | dead |
| 2449–2452 | 4 | #rand (release, retire snap keys; as above) | ratification | move |
| 2456–2469 | 14 | bootstrapState..session, LOGIN_REFUSAL_DETAIL | membership | delete (delegation) |
| 2472–2477 | 6 | orphan members note | dead | dead |
| 2479–2480 | 2 | registerAudit (route) | provenance | delete (delegation) |
| 2482–2510 | 29 | authority, sight, visibility, directory, requests (5 of them dead privates) | membership | delete (delegation) |
| 2511–2517 | 7 | homeCensus, registerHolds (routes) | provenance | delete (delegation) |
| 2518–2536 | 19 | editor, admin, owner acts (#isProjectEditor, #isAdminMember dead) | membership | delete (delegation) |
| 2538–2562 | 25 | forkProject (route) | promotion | delete (delegation) |
| 2564–2567 | 4 | static projectNameKey (d50 legacy suite) | promotion | delete (delegation) |
| 2571–2620 | 50 | expertise, participants, capabilities, admins, members, signers | membership | delete (delegation) |
| 2622–2645 | 24 | earnedBasis | inquiry | delete (delegation) |
| 2647–2673 | 27 | 27 capture delegators | capture | delete (delegation) |
| 2675–2680 | 6 | governor delegators | host-governor | delete (delegation) |
| 2682–2697 | 16 | recordCapturedLocator: receipt + observation-log listener's answer (route) | provenance | move |
| 2698–2699 | 2 | capturedLocators, versionChain | provenance | delete (delegation) |
| 2701–2716 | 16 | limits, VERSION_ACT_TO, version acts (#versionCollections, #currentVersionOf dead) | basis-versions | delete (delegation) |
| 2718–2720 | 3 | captureRequestDrain | capture-requests | delete (delegation) |
| 2722–2728 | 7 | AI credential acts | membership | delete (delegation) |
| 2732–2734 | 3 | #aiRuns: no caller | dead | dead |
| 2736–2742 | 7 | TEXT_SOURCE_LIMIT_*: extraction holds its own | dead | dead |
| 2744–2770 | 27 | static LEG_BACKFILL_MAX (legacy battery) | inquiry | delete (delegation) |
| 2772 | 1 | #aiIso: no caller | dead | dead |
| 2774–2777 | 4 | #observe | observation-log | delete (delegation) |
| 2779–2790 | 12 | #ownNamespace | control-plane | composition root |
| 2795–2800 | 6 | bias delegators | bias | delete (delegation) |
| 2802 | 1 | #numberParam (escalation arms) | escalation | move |
| 2804–2805 | 2 | routes frame | control-plane | composition root |
| 2806–2827 | 22 | 22 ops-map spreads | control-plane | composition root |
| 2828 | 1 | route promote | promotion | move |
| 2829–2832 | 4 | routes allocid, lease, snapkeycensus | record-core | move |
| 2833–2839 | 7 | routes homecensus, registerholds | provenance | move |
| 2840–2851 | 12 | routes image, file (D-15 gate over record-core's reads) | retrieval | move |
| 2852–2856 | 5 | routes list, index | retrieval | move |
| 2857–2860 | 4 | orphan CAP-4 comment | dead | dead |
| 2861–2885 | 25 | routes contentcrop, content, contentmint | content | move |
| 2886–2890 | 5 | orphan FW-5 / REC-30 comment | dead | dead |
| 2891–2916 | 26 | routes textattest, attesttext | content | move |
| 2917–2924 | 8 | routes resolve, resolvetestify | entities | move |
| 2925–2930 | 6 | orphan FW-8 comment | dead | dead |
| 2931–2932 | 2 | queue, tasks spreads (N13) | control-plane | composition root |
| 2933–2934 | 2 | orphan D-64 comment | dead | dead |
| 2935–2949 | 15 | routes recordcapturedlocator, versionchain | provenance | move |
| 2950–2953 | 4 | transcribe comment | content | move |
| 2954–2968 | 15 | route testify | provenance | move |
| 2969–2985 | 17 | routes transcribe, transcriptionattest, transcription | content | move |
| 2986–2992 | 7 | capture-requests, governor, ai-runs, retrieval, actions spreads | control-plane | composition root |
| 2993–2999 | 7 | layer-9 spreads | control-plane | composition root |
| 3000–3022 | 23 | ten escalation arms (escalation publishes no ops map) | escalation | move |
| 3023 | 1 | monitoring spread | control-plane | composition root |
| 3024–3032 | 9 | route affordancefacts (N13) | affordances | move |
| 3033–3034 | 2 | route stats | record-core | move |
| 3035–3038 | 4 | route retire | unowned (retire) | move |
| 3039–3043 | 5 | route release. **T18** | ratification | move |
| 3044–3071 | 28 | routes provenancechain, provenanceroute, provenanceroutes | provenance | move |
| 3072–3081 | 10 | routes reopen, projectfork | promotion | move |
| 3082 | 1 | route registeraudit | provenance | move |
| 3083–3084 | 2 | route digestcensus | record-core | move |
| 3085–3088 | 4 | review spread | control-plane | composition root |
| 3089–3092 | 4 | routes audit, purge | record-core | move |
| 3093–3096 | 4 | routes close, class close | control-plane | composition root |
| 3098–3102 | 5 | default export: nothing imports it (control-plane/dispatch.mjs carries its own) | dead | dead |

### 1b. `schema.mjs`

The only product reader of `SCHEMA` is `store.mjs`:135, which runs it at :593 and :725. Only old suites read it besides (`observation-log.test`, `publishedcase.test`, `nc-rec104`, `hygiene`). Five of its seven fragments are run a second time by their owners' own `migrate()`.

| lines | n | what | owner | action |
|---|---|---|---|---|
| 1 | 1 | import `RECORD_SCHEMA` | record-core | move: record-core runs its own DDL. Today its `migrate` only adds `bundles.project`, and it runs last (store 780) |
| 2 | 1 | import `PROVENANCE_SCHEMA` | provenance | delete: duplicate (`provenance/schema.mjs`:237 runs it) |
| 3 | 1 | import `HOST_GOVERNOR_SCHEMA` | host-governor | delete: duplicate (`host-governor/index.mjs`:91) |
| 4 | 1 | import `CALIBRATION_SCHEMA` | calibration | move: calibration has no `migrate()` yet |
| 5 | 1 | import `BIAS_SCHEMA` | bias | delete: duplicate (`bias/index.mjs`:182) |
| 6 | 1 | import `AI_RUNS_SCHEMA` | ai-runs | delete: duplicate (`ai-runs/index.mjs`:2471) |
| 7 | 1 | import `QUEUE_SCHEMA` (**layer 11 into layer 10: a P4 violation, as N13**) | queue | move: `queue.migrate()` exists (`queue/index.mjs`:73) but nothing calls it, so this text is the only thing that creates queue's tables. The composition root calls it |
| 8–10 | 3 | header | frame | goes with the file |
| 12 | 1 | `${RECORD_SCHEMA}` | record-core | as line 1 |
| 15–17 | 3 | provenance note and fragment | provenance | duplicate |
| 19–21 | 3 | `${QUEUE_SCHEMA}` | queue | as line 7 |
| 24–26 | 3 | `${AI_RUNS_SCHEMA}` | ai-runs | duplicate |
| 28–63 | 36 | the folded `ai_run_log` note (REC-93) and hygiene's harvest note | dead | prose only. `hygiene.test.mjs` (old) harvests table names from this text |
| 65 | 1 | `${BIAS_SCHEMA}` | bias | duplicate |
| 70 | 1 | `${CALIBRATION_SCHEMA}` | calibration | as line 4 |
| 72–80 | 9 | separators (4 non-blank) | dead | |
| 82–83 | 2 | `${HOST_GOVERNOR_SCHEMA}`, close | host-governor | duplicate |

`this.env.SCHEMA` (store 593), an override of the text, is bound nowhere (not in `wrangler.jsonc`), so it is dead.

## 2. Per owner (`store.mjs`)

| owner | layer | move | delete (delegation) | composition root | total |
|---|---|---|---|---|---|
| imports | — |  |  |  | 395 |
| dead | — |  |  |  | 351 |
| record-core | 2 | 337 |  |  | 337 |
| ratification | 8 | 255 |  |  | 255 |
| provenance | 3 | 164 | 20 |  | 184 |
| inquiry | 6 | 100 | 68 |  | 168 |
| control-plane | 11 |  |  | 166 | 166 |
| retrieval | 5 | 149 | 16 |  | 165 |
| membership | 2 | 35 | 120 |  | 155 |
| unowned (retire) | — | 145 |  |  | 145 |
| content | 4 | 101 | 20 |  | 121 |
| strength | 6 | 82 | 4 |  | 86 |
| promotion | 2 | 23 | 44 |  | 67 |
| extraction | 4 | 31 | 30 |  | 61 |
| frame | — |  |  |  | 35 |
| ai-runs | 6 | 32 |  |  | 32 |
| basis-versions | 6 | 7 | 23 |  | 30 |
| capture | 3 | 3 | 27 |  | 30 |
| entities | 5 | 27 |  |  | 27 |
| progressions | 5 | 17 | 8 |  | 25 |
| escalation | 9 | 24 |  |  | 24 |
| observation-log | 5 | 12 | 11 |  | 23 |
| bias | 5 | 10 | 6 |  | 16 |
| run-productions | 6 | 15 |  |  | 15 |
| connections | 5 | 13 | 1 |  | 14 |
| scheduler | 10 |  | 10 |  | 10 |
| capture-requests | 6 | 7 | 3 |  | 10 |
| affordances | 11 | 9 |  |  | 9 |
| publication | 8 |  | 6 |  | 6 |
| actions | 9 |  | 6 |  | 6 |
| monitoring | 10 | 6 |  |  | 6 |
| host-governor | 3 |  | 6 |  | 6 |
| case-authoring | 8 |  | 1 |  | 1 |
| **all** | — | 1604 | 430 | 166 | 2981 (+ 121 blank) |
Line counts include comments. The "delete (delegation)" lines move nothing: the owner already holds the code.


**Notes on the totals:**
- **ratification (255)** is `release` with its bound and route (210, **T18**, K583, ratification R20–R27) and the three helpers `release` shares with `retire` (45: `#appendStateHistory`, `#setScalar`, `#rand`). T18 copies the helpers. They leave `store.mjs` with `retire`.
- **unowned (retire) (145)**: no requirement names an owner. Proposed: ratification, beside `release` (§4.2).
- **record-core (337)** includes `#counts`' frame, its D-464 subtraction and the R64 disclosure keys (**T18**, K621: `stats`, `observationsNonLead`/`leads`, `dbBytes`, about 50 lines). The other `#counts` keys are each owner's (§4.2).
- **membership (155)** is 120 lines of delegations. Ten dead privates sit inside the delegation rows (`#projectAuthority`, `#caseAuthority`, `#visibilitySettingRefusal`, `#rosterInSight`, `#isProjectEditor`, `#isAdminMember`, `#activeAdmins`, and `#basisCyclePath`, `#versionCollections`, `#currentVersionOf` in inquiry's and basis-versions'). They are counted with their owners.
- **Delegations with no caller at all** in the product or in `test/m/` are most of the 430. Only these are read in the file: `selectionResolve`, `promote`, `#citesInto` (retire, release); `publishedRegistryFor`, `earnedBasisRegistry`, `#subjectEntityOf` (auditPass); `contentContextFor`, `mintContent`, `#observe` (testimony path); `strengthOf` (strength cache); `#capturedAt` (leg grades); `#viewerSees` (image, file); `#visibilityOf`, `#reindexProjectSight` (promotion's projection share); `#armScheduler` (resolve); and the route arms' `contentRead`, `contentMint`, `attestationsFor`, `testify`, `transcribe`, `transcriptionAttest`, `transcriptionRead`, `homeCensus`, `registerHolds`, `registerAudit`, `versionChain`, `provenanceChainRebuild`, `provenanceRouteAssess`, `provenanceRoutesMarked`, `reopen`, `forkProject`. Each goes with the arm or code that reads it.

**schema.mjs (83):**

| owner | lines (non-blank) |
|---|---|
| record-core | 2 |
| calibration | 2 |
| queue | 3 |
| duplicates to delete | 12 (provenance 4, ai-runs 3, host-governor 3, bias 2) |
| dead | 40 |
| frame | 3 |
| blank | 21 |

## 3. Dead (`store.mjs`: 351 lines, plus 139 import names; `schema.mjs`: 40 lines, plus 12 lines of duplicates)

**Nothing reads them:**
- `actNoCitation` (397–435, 39). Entities and progressions hold their own helper. But catalogue row C-33.41's `where` still names `src/store.mjs actNoCitation > is-act-no-citation` (`bio-checks.mjs`:7028), so deleting it re-points the row to the helper sites that raise it (entities, progressions): a row change for promotion's stamp.
- `INLINE_MAX` (458–459).
- The purge declaration (475–477, 479–512, 37 lines). All 61 names are owned by 14 modules' predicates, so `declarePurge("legacy-store", …)` declares `[]` (measured). record-core's R21 note (`record-core.md`:257, "the legacy store declares the rest") is stale.
- The derived-table DROP loop in `#migrate` (594–626, 33). `capture.migrate` (`CAPTURE_RESHAPE`, `capture/index.mjs`:195) and `extraction.migrate` (:165) already drop `links` and `reading_ref_terms`; `captured_locators` is filtered out.
- `static supersededByOf` (791–792), `#refEdgeSevered` (844), `static basisVersionsOf` (1650–1651), `static observerRef` (1794–1795), `testimonyReach` (1797).
- `#bundleGate` and `#bundleRedactor` with the REC-30 note (1555–1641, 87). `retrieval.md`:108 still names `#bundleRedactor`.
- `eachImage` (1643–1648): old suites only.
- The leftovers of moved arms in `#promoteChecks` (1716–1732: unused `docFmW`, `isInquiry`) and in `#promoteProjections` (1739–1741: unused `testimony`, `surfacing`; comments 1748–1750, 1758–1760, 1766–1768).
- `#leadReach`, `#leadReferentVisible`, `#positionalMember` (1841–1844).
- `#GRADE_RANK` and `#isEstablished` (1887–1908, 22). They are the only readers of `BASIS_GRADES` here.
- `#MEANING_LIMIT_*` (1910–1937, 28).
- `#strongestResolutionsFor` (1963–1969).
- The credentials note and `#enc` (2436–2446), and the members note (2472–2477).
- `#aiRuns` (2732–2734).
- `TEXT_SOURCE_LIMIT_*` (2736–2742): extraction holds its own (`extraction/index.mjs`:34).
- `#aiIso` (2772).
- Four orphan comments in `routes` (2857–2860, 2886–2890, 2925–2930, 2933–2934).
- The default export (3098–3102). Nothing imports it: `wrangler.jsonc` `main` is `src/index.mjs`, and `control-plane/dispatch.mjs`:232 carries its own.

**Import names never read (139 of 263):**
- 46 of the 56 catalogue names. Only 8 are live: `parseFrontmatter`, `createSha256`, `projectNameKey`, `normalizeType`, `LEGACY_TYPE_ALIASES`, `isMachineIdentity`, `SURFACE_CHECKS`, `MEMBER_ID_CHECKS`. `BASIS_GRADES` and `ACT_SHAPE_CHECKS` are read only by dead code.
- Every `airun.mjs` name except `OBSERVATION_STATES` (41).
- All 12 `textchain.mjs` names.
- 10 of 12 `query.mjs` names.
- 11 of 15 `content/index.mjs` names.
- 6 extraction constants.
- `tokens.mjs` (3), `readingprov.mjs` (2), `formats.mjs`, `skillpack.mjs`, `posFields`, `refsReplacedOf`, `barAxisWords`, `withheldWriterStated`, `caseConclusionRowLines`, `completenessFields`.

Deleting them first costs nothing. It also takes `legacy-store` out of `legacy-checks.md`'s importer column for 48 catalogue names (46 never read, 2 read only by dead code).

**No product caller, but the behaviour is kept.** `stats` and `purge` are reached through their routes, so they are not dead. `eachImage`'s streaming pass is dead and has no requirement.

## 4. Order constraints

`legacy-store` is layer 10. Every owner above is earlier except `affordances` and `control-plane` (layer 11). So §12.2 holds without trouble for all but those two:
- **For an earlier owner:** its job removes the code and rewires the store to import it.
- **For a layer-11 owner:** its job only removes, and control-plane (after it) reaches the moved part.

Each move is one job in the owner's own layer, bottom-up. Nothing is held twice across tranches except the three helpers `release` and `retire` share.

### 4.1 P4 violations today (hard)

1. **N13, still open: `store.mjs` imports three later modules.** `store.mjs` imports `affordances` (164), `queue` (312) and `tasks` (313), all layer 11. It uses them:
   - to construct them: 587, where `tasksOf(ctx,{env}).migrate()` runs;
   - in the dead purge filter (511);
   - in two route spreads (2931–2932);
   - in `affordancefacts` (3024–3032).

   `schema.mjs`:7 imports `queue` too, and that text is what creates queue's tables. The fix is one control-plane job, since control-plane comes after all three:
   - construct `queue` and `tasks`, and call `queue.migrate()` and `tasks.migrate()`;
   - spread `queueOps` and `tasksOps` in `controlPlaneRoutes`;
   - spread an `affordancesOps` holding `affordancefacts`: affordances' job builds that map, and removes the arm from the store without rewiring it.

   The three imports and `schema.mjs`:7, :21 then go. Nothing else in the store needs these modules.
2. **`control-plane/index.mjs`:71 imports `Store` for `Store.CAPABILITIES` only.** It re-points to membership's `Membership.CAPABILITIES`.

### 4.2 Seams to build before a family can leave (wording, BOB's)

1. **`auditPass` (record-core, layer 2).** It cannot call what it now gathers from later modules: provenance's route-marker tally (1315–1358, 1366–1373), membership's reserved-id finding (1385–1406) and R45's context (inquiry's earned registry, publication's published registry, 1307–1311). It needs a registration beside R59 and R63 (an audit-finding registration, and the context by registration). Then the route `audit` goes into record-core's ops map.
2. **`#counts` (record-core R63).** 17 owners each register their keys: extraction, retrieval, capture, monitoring, entities, connections, progressions, membership, content, run-productions, ai-runs, inquiry, basis-versions, capture-requests, bias, provenance, and record-core itself (T18's R64 keys). `monitoringOf(…).counts()`, `retrievalOf(…).counts(hid)`, `runProductionsOf(…).counts(hid)` and `biasOf(…).counts(hid)` are called by name today, and become registrations too. `purge`'s proof (2382–2434) then reads record-core's counts. `capture-requests`' `clearLead` (2381) becomes its own purge declaration (its table keyed `lead_inquiry`) or a hook.
3. **The mint ledger (record-core R28).** `MINT_LEDGER_LIVE` (1994–2002) names later modules' tables: `cases`, `published_cases`, `case_documents`, `published_case_members`. Each owner registers its live rows for the seed.
4. **The schema.**
   - record-core runs `RECORD_SCHEMA` itself, and **first**: `bundles` must exist before any other module's `migrate` reads it. Today the schema pass runs before every migrate, and `record.migrate()` runs last (780).
   - calibration gains a `migrate()` for its DDL.
   - The composition root calls `queue.migrate()`.
   - Then `schema.mjs` is deleted with lines 135, 593 and 725.
5. **The testimony path (provenance R28).** The path's later writes are three modules' promotion projections on `TESTIMONY_PATH`, each registered in order:
   - extraction's `indexTestimony` (R61, 1816–1817);
   - content's mint (1818–1820), with its C-45 extent check as a registered check (1709–1715);
   - observation-log's look (1821–1825).

   Provenance (layer 3) cannot call any of them.
6. **Ops maps.** content, provenance, record-core, promotion, entities, retrieval, ratification, escalation and affordances each publish an ops map of their arms (the `membershipOps` pattern). `escalation` publishes none today (K262), so its ten arms are named in the store (3000–3022). The composition root then only spreads.

### 4.3 Moves that must come before other moves

| must come first | then | why |
|---|---|---|
| ratification takes `release` and copies the three helpers (**T18**) | `retire` moves, and the helpers leave the store | `retire` reads `#appendStateHistory`, `#setScalar`, `#rand`, `selectionResolve`, `promote` |
| BOB rules `retire`'s owner and its requirements are written (as K636 BOB-5 did for release) | `retire` (872–997), `RETIRE_CITED_DETAIL`/`#retirementCitedBy`, `EDGE_REASON_MAX`, its route | no owner. Promotion R16 calls it "the same fence `retire` runs". Ratification (layer 8) can use retrieval and connections |
| inquiry's promotion step, registered before strength's | `#writeStrengthProjection` (2298–2350), the strength columns (661–676) and indexes (769–775) to strength | strength R13 summarises the legs inquiry's step writes in the same transaction. Construction order sets the step order |
| extraction, content and observation-log register their testimony projections (4.2 (5)) | `#testimonyWithin`, 1761–1765 and 1775–1779 deleted | the transaction must still write all three |
| inquiry registers the leg grades (545–548) and `surfaced_in` (549–553, N405, K593) with retrieval | `#surfacedIn`, `#capturedAt` and the inquiry delegations go | retrieval R56 registrations in legacy-store's name |
| observation-log registers `onDerived` and the provider (554–558, **T18**) and capture's observation listener (579, 585; capture R55) | `#observe` goes | |
| the audit-finding seam (4.2 (1)); provenance and membership register | `auditPass` to record-core | layer 2 cannot import them |
| every `#counts` key registered (4.2 (2)) | `#counts`, `stats` and `purge` wholly record-core's | |
| retrieval holds `op=list`, `op=index`, `op=image`, `op=file` with `#withRoute` over provenance's `routeFinding` | `listBundles`, `buildIndex`, `#viewerSees` and those arms go | record-core (layer 2) cannot gate its reads by membership's sight or provenance's marks |
| inquiry holds C-66.5 (`surfaced_by` carried forward, 1671–1707) as its registered check | the catalogue row's `where` (`bio-checks.mjs`:9303) is re-pointed | a row change for promotion's stamp |
| every arm in an owner's ops map, and the composition root moved into control-plane's `Store` | the class goes; control-plane's `Store` extends `DurableObject`; `dispatch.mjs`:7 and `index.mjs`:71 lose their imports | control-plane is the last owner, as R35 says |

**Order inside the composition root.** Today's migration order (726–743) is not module order: `content` runs before `extraction`, and `basis-versions` before `inquiry`. The constructor comments name order dependencies:
- provenance before observation-log;
- reevaluation before actions;
- publication after reevaluation;
- every module's step before legacy-store's.

Control-plane keeps today's order unless a job measures that another is safe.

**Catalogue rows naming `src/store.mjs`**, re-pointed by the move that takes the code and stamped by promotion the next tranche:
- C-32.1, C-33.10, C-33.11, C-33.12: release, **T18**, to ratification;
- C-66.5: to inquiry;
- C-33.41: to the entities and progressions sites.

### 4.4 The moves, bottom-up

1. **Any tranche, first.** Delete the dead lines (§3) and the 139 unread import names. A legacy module only shrinks; BOB names the job.
2. **Layer 2.**
   - record-core: the R64 disclosure (**T18**), the seams (4.2 (1)–(4)), `auditPass`, `purge`, the mint ledger, its `#migrate` share (manifest columns, the `classification` drop, the type-alias normalisation, the second pass), and the routes `allocid`, `lease`, `snapkeycensus`, `digestcensus`, `stats`, `audit`, `purge`.
   - membership: the boot reindex (782–788) and the reserved-id finding. It waits for T19's split (K637).
   - promotion: the sight reindex and the visibility answer (1742–1747, 1769–1774), and the routes `promote`, `reopen`, `projectfork`.
3. **Layer 3.** provenance: the route tally, `recordCapturedLocator` (it reads observation-log's listener by module name, so that name must come in by registration or as a string), and its nine routes. capture: its counts.
4. **Layer 4.** extraction: the testimony index and its counts. content: the extent check, the mint, `safeJson`, its eight routes and its counts.
5. **Layer 5.**
   - observation-log: 554–558 (**T18**), 579, 585, the testimony look.
   - entities: `resolveReferences` and `testifyResolution` with their routes. The connection sweep is armed through a listener that scheduler registers (entities R13), or kept as a hook.
   - retrieval: the four reads.
   - connections and progressions: their counts.
6. **Layer 6.**
   - inquiry: C-66.5, the leg grades, `surfaced_in` (N405), the `bundles` columns (677–714) and its count.
   - strength: the cache.
   - basis-versions, ai-runs (`#hiddenRunTail`), run-productions, capture-requests: their counts.
7. **Layer 8.** ratification: `release` (**T18**), then `retire` once ruled.
8. **Layer 9.** escalation: its ops map (3000–3022, `#numberParam`).
9. **Layer 11.**
   - affordances: `affordancefacts`.
   - control-plane, last: the composition root (166 lines: constructor, `#migrate`'s frame and module order, `alarm`/`onAlarm`, `#ownNamespace`, `#nowMs`, the route frame and spreads), N13, and deleting the class.

### 4.5 What remains

Nothing. With the moves done:
- the imports (396), the frame (35) and the 430 delegation lines go;
- `store.mjs` and `schema.mjs` are deleted;
- `legacy-store` leaves `modules.json`, and the `from` of the 37 modules naming it is dropped as each finishes.

The only code that changes home without a module to receive it today is `retire`. The composition root lands in control-plane, which grows by about 170 lines on its post-split ~3,500 (current.md, K624).

## 5. Requirement changes found

**Change of meaning (Bob's): none found.** Every move carries existing behaviour to a module whose Purpose already covers it. `retire`'s owner is file ownership (P17, BOB's). No row is dropped: each is re-pointed.

**Wording (BOB's):**
- **retire:** requirements for its owner, from the code and `op=retire`'s behaviour: verified to retired only, a named reason at most 160 characters, cited items refused `CITED` naming the citers, the whole set or nothing, the Session Log entry. Sources are State Rules §4.1 and promotion R16.
- **record-core:**
  - the audit-finding registration, and R45's context by registration;
  - R28's seed sources registered;
  - `RECORD_SCHEMA` run by record-core, first;
  - its caller notes are stale: `record-core.md`:256 says the counts' reader is legacy-store's until control-plane (N342), where K621 makes it record-core's; :257 says legacy-store declares the rest, where it declares none.
- **retrieval:** `op=list`, `op=index`, `op=image` and `op=file` as its Provides; `retrieval.md`:108's `#bundleRedactor` reference is dead.
- **Ops maps:** content, provenance, record-core, promotion, escalation, entities and affordances name them in Provides.
- **The testimony path:** extraction, content and observation-log each gain an R; provenance R28 is re-worded.
- **calibration:** `migrate()`.
- **strength:** R13 already names `writeProjection` and is met by the move.
- **control-plane:** R35's "beside `legacy-store`'s" once the class goes.
- **`layers.md`' legacy table:** the sizes are stale (store 54,618 → 3,102; schema 4,287 → 83).
- **Stale citations:**
  - K583 cites `store.mjs` 1004–1202; `release` is now 999–1198, and `RELEASE_ACK_MAX` is 837–841;
  - N405's "about :548–556, :817" is now 549–553 and 810–818;
  - T17's finding cites `store.mjs`:558; that is now 557–558.
