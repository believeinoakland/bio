# Plan: next tranche

**Status** · Entries that arose after the T5 triage, and those left when T3 opened, awaiting the tranche they join (PROCESS-MECHANICS §5). The carried rows of the old plan are listed in `docs/development/transition/old-plan/index.csv` and join T8's first plan there. Grouped by module, modules by layer.

## Later layers

- N12 · 2026-09-26 · **legacy-index**: `bio-plane/scripts/deploy.mjs` and `resolve-version.mjs` read JSONC through `tools/jsonc.mjs`, which is not product: the reader they need comes into the product (its own small helper, or inside `legacy-index`). `bio-plane/scripts/op-claims.mjs` serves the old process's claims ledger and is removed. Found by the architecture check, 2026-09-26.
- N13 · 2026-09-26 · **affordances**, **queue**: `store.mjs` imports `affordances.mjs` and `queuestate.mjs`, both later in the order. What the store needs from them moves to the module that owns it, earlier in the order, when each is extracted. Found by the architecture check.
- N16 · 2026-09-26 · **promotion**, **publication**: `forkProject` and project name uniqueness (C-77, with canon §7.1's NFC normalisation) move from the store to `promotion`; `exportManifest`, `exportLog` and `export_log` move to `publication` (K31). BOB writes their requirements before each module's first job. *(T3 carries its share for record-core, promotion or legacy-tests.)*
- N19 · 2026-09-26 · **legacy-index**: `needsTier3` and `tier3Pages` route a page marked `image_content_unread` (pdf-reader R26) to OCR as they route `no_text_layer`, and `needsTier2` counts it as a scan marker. Built work: `index.mjs` at `land/worker/D-627` @ 056d3092 (14 lines). Reported by PDF-READER #1.
- N21 · 2026-09-26 · **legacy-index**: pass `ctx.view` (`jurisdictions.combine` of the instance's active profiles) to `docprofile`'s `doctypeFor`, `assess` and `readText`; `docprofile` then drops its no-view fallback (R6, K39). Reported by DOCPROFILE #1.
- N22 · 2026-09-26 · **test-support**: under a non-root user a read-only subdirectory a test leaves makes the sweep's `rmSync` fail (EACCES) and the sandbox leaks (R2); make the tree writable and retry, tested where the job can run as a non-root user. Deferred by TEST-SUPPORT #1: its container runs as root.
- N25 · 2026-09-26 · **legacy-index**, **host-governor**: `governedFetch` and the ops `governorstate` and `governorconfig` move from `index.mjs` into `host-governor` (K47), the fetch and user agent passed in by the caller.
- N26 · 2026-09-26 · **office-readers**: `.docx` `mc:AlternateContent` fallbacks are read twice; the fix renumbers ¶ references in stored readings, so it lands with a migration of those references. Deferred by OFFICE-READERS #1.
- N27 · 2026-09-26 · **odf-reader**, **office-readers**: the `.ods` half of D-415 (named ranges and tables as `sheet-range` units, as `.xlsx` has by R9/K36); built work on the snapshot (`odf.mjs`); `office-readers` names `rangeUnitFor` and `a1Corner` in its Provides for it. Reported by OFFICE-READERS #1.
- N28 · 2026-09-26 · **legacy-store** (at the extraction of its reader): a page's kind reads `chainKindFor` (text-chain R81), not `terminalStep(chain) || "layer"`. Reported by TEXT-CHAIN #1.
- N30 · 2026-09-26 · **odf-reader**: repeats (`number-rows-repeated`, `number-columns-repeated`, `text:s`, `text:c`) are expanded without a bound, so hostile bytes can hang the reader or end in `reader_failed` instead of a stated undetermined. BOB adds a bounded-expansion requirement (a measured cap, answering undetermined past it) before the job. Deferred by ODF-READER #1.
- N31 · 2026-09-26 · **bundler**, **legacy-tests**: `fleet-bundle.mjs`'s remedy text names `node tools/bundles.mjs`, and `fleetbundles.test.mjs` arm (j) asserts it; change both together when `tools/` retires (N14). Also red before T2 and unchanged by it, found by BUNDLER #1: `owed-controls.test` (2 fail), `provenance-floor.control`, `walkfloor.control`, `d301-census.control`; root-caused by the `legacy-tests` job. *(T3 carries its share for record-core, promotion or legacy-tests.)*
- N34 · 2026-09-26 · **pdf-worker** (in T4 by K70): a declared refusal for a JPX image whose decode would exceed the isolate's memory (a single-tile 2550×3300 colour 9/7 image peaks near 130 MB against 128 MB), with the bound measured; then the low-memory wavelet it defers. PPM/PPT JBIG2 decoding waits on an encoder that makes a checkable fixture. `pdf-worker` is 4,075 lines, past the 4,000-line mark (`layers.md`): BOB reviews a split before its next job. Reported by PDF-WORKER #2.
- DIST-14 · **office-readers**: the CSV size bound (20 MiB) is unsettled until measured on a deployed plane (old-plan row DIST-14). Deferred by OFFICE-READERS #1 in T2: it needs a deployment.
- Local facts still in code, reported by JURISDICTIONS #1: `readingNamePlan`'s "oakland" (N4) and `legacy-checks`' `cpra_request` and `governingLawsOf`'s CPRA sentence (REC-201): each extraction reads them from the view.


- N4 · 2026-09-25 · `store.mjs` `readingNamePlan` defaults its search terms to "oakland": take them from the active profiles. The owning module is confirmed at extraction.
- N5 · 2026-09-25 · **installer**: the outward text names CivicOS and the installing group. Believe in Oakland appears only as the release's publisher and signer. The example group name is not a place.
- N6 · 2026-09-25 · **entities**: `op=idmatch` takes the renamed spaces (N2) and the view-first services, and `id-spaces` retires its legacy adapter (R26, K35) in the same tranche; `bio-plane/test/rec203-idspaces.test.mjs` moves to the new names, passes the combined profile view, and passes each end's addresses from the record. **affordances**: `idmatch`'s outward text names no local system (it says "C.M.S.", "APN" and "Legistar's floor" today).
- N10 · 2026-09-25 · **record-core**, **installer**, **instance-setup**: the instance holds the list of its active jurisdiction profiles as a setting, and the installer offers the choice. Rule 2 of "No jurisdiction in the product". *(T3 carries its share for record-core, promotion or legacy-tests.)*
- California's records law as a kind name (`cpra_request`) and in outward text is carried as old-plan row REC-201 against `actions`; the profile's `records_laws` section is where the law's name comes from.

- N35 · 2026-09-26 · **capture-requests** (K58): BOB drafts its requirements from the code (store.mjs ~44550–45440 and the `capturerequest*` ops) and brings them to Bob before its layer's tranche; `capture`'s job keeps only the trusted in-process arm.
- N36 · 2026-09-26 · **promotion** (from `legacy-checks`): catalogue rows for promotion's `EXISTS` and `ABSENT` refusals (N17). (C-18.8's removal moved into T3 by K64.)
- N37 · 2026-09-26 · **query-language**: `viewerPredicate` and `GATE_MARK` become re-exports of membership's (K63).
- N38 · 2026-09-26 · **instance-setup** (K69): the group-identity cluster (C-64) moves here from `legacy-store` at `instance-setup`'s extraction; BOB writes its requirements (the producing group, its history, the domain checks) and brings them to Bob before that tranche.
- N39 · 2026-09-26 · **observation-log**, **ai-runs** (K71): each stops reading `capture_requests` directly and offers a registration `capture-requests` fills (the K31 pattern), at their extractions.
- N40 · 2026-09-26 · **record-core** (K72): `digestCensus` and `snapKeyCensus` (store.mjs ~34223–34300) read only record-core's tables and move to it, with requirements BOB writes first.
- N41 · 2026-09-26 · DONE (K74) · **calibration**, **extraction** (K73): BOB splits `build/requirements/extraction.md` into `calibration.md` and `extraction.md` and adds `calibration` to `modules.json` (layer 4, before `extraction`), before Bob approves either.
- N42 · 2026-09-26 · **text-chain**, **pdf-reader**, **legacy-checks**, **retrieval** (K73): rows routed to extraction touch these first: D-697 and D-635 (text-chain), D-665 (pdf-reader), D-685 (legacy-checks), and D-672 (retrieval), on which D-684, D-685 and D-724 are stacked; each gets an entry against its own module in the tranche before extraction's.
- N43 · 2026-09-26 · **legacy-index**: `index.mjs`'s op table routes membership's five new ops (`adminresign`, `hostingaccessset`, `hostingaccess`, `memberpairingset`, `memberpairings`; N18) with their classes; until then they are unreachable from outside. Reported by MEMBERSHIP #1.
- N44 · 2026-09-26 · **legacy-checks**: catalogue rows for membership's new refusal codes (R10, R29, R62 and the others its record lists), so each carries a catalogue check id and translation instead of `membership.Rn`. Reported by MEMBERSHIP #1.
- N45 · 2026-09-26 · **affordances**: `projectleave` is offered where membership's REC-224 now refuses it (`d311-roster-affordances`). Reported by MEMBERSHIP #1.
- N46 · 2026-09-26 · **legacy-tests** (with N37): `meaningread` and `meaningquery` pin the gate's mint sites in `query.mjs`'s text; re-anchor them when `query.mjs` re-exports membership's `viewerPredicate` (K75).
- N47 · 2026-09-26 · DONE (K79) · **connections** (K76, K77): themes (store.mjs ~22904–23215, `themes`, `theme_placements`, `THEME_CHECKS`) are connections'; their requirements and map join `connections.md` before Bob approves it.
- N48 · 2026-09-26 · **extraction** (K76): REC-206's item-to-file derivation, and the name of its `membership.mjs` file changed so it is not confused with the module.
- N49 · 2026-09-26 · **ai-runs**, **affordances**, **queue** (K78): each re-exports, from the layer-5 module that took a copy, the vocabulary and checks it held for that module (observation-log's in `airun.mjs`; progressions' `STAGE_REQUIREDNESS`, `DISPOSITIONS` in `affordances.mjs`; `QUEUE_CONDITION_KINDS` in `queuestate.mjs`), and deletes its own copy.
- N50 · 2026-09-26 · DONE (K80) · **retrieval** (K78): its draft requirements and map gain `op=frontier`'s arms (about 1,116 lines) before Bob approves it.
- N51 · 2026-09-26 · **record-core**: `auditPass` offers a registration for later modules' audit checks (the K31 pattern), so `promotion.recordAudit` stops re-judging only the bundles the moved checks flag. Reported by PROMOTION #1.
- N52 · 2026-09-26 · **affordances**: import promotion's `REOPENABLE_FROM` instead of keeping its own. Reported by PROMOTION #1.
- N53 · 2026-09-26 · **skills**, **agent-worker**, **control-plane** (K81): the skills tests that read `agent-worker` and `index.mjs` move into those modules' own tests.
- N54 · 2026-09-26 · DONE (K86) · **ai-runs**, **run-productions** (K82): BOB splits `build/requirements/ai-runs.md` into `ai-runs.md` and `run-productions.md` (`op=suggest` and the extract proposals), adds `run-productions` after `ai-runs` in `modules.json`, before Bob approves either.
- N55 · 2026-09-26 · DONE (K85) · **inquiry**, **citation** (K83): BOB splits `build/requirements/inquiry.md` into `inquiry.md` and `citation.md` (cite, sever, reinstate), adds `citation` directly after `inquiry` in `modules.json`, before Bob approves either.
- N56 · 2026-09-26 · **promotion** (K83): a read `fact(name, ...args)` of facts registered with it (R40), for later modules; and D-592 (`reopen`), re-targeted to promotion.
- N57 · 2026-09-26 · **legacy-tests** (K84): a sweep of the 227 `*.control.mjs` and 99 `nc-*.mjs` negative controls no entry named in T3, each run as declared, re-anchored or retired with the code it anchors on.
- N58 · 2026-09-26 · **record-core** (K85): provides `stampInstant(precision, when)` (store.mjs ~814–826), which later modules take from it instead of the store; with its requirement, before layer 6's tranche. *Requirement written by BOB #43 (K87): `record-core` R47–R48, not yet met.*
- N59 · 2026-09-26 · **bias** (K82 (3), K86): its draft requirements take the bias-debt mechanism (ai-runs' old R39–R44, and members' work if Bob says yes to bias question 3) before Bob approves it. *Requirements done by BOB #43 (K87): `bias` R33–R40.*
- N60 · 2026-09-26 · **strength** (K86): its draft gains a service answering the strength pair over a candidate's legs, which run-productions reads, before Bob approves it. *Requirements done by BOB #43 (K87): `strength` R26–R27.*
- N61 · 2026-09-26 · **jurisdictions**: `records_laws` levels are `state`, `county`, `city` (R7), with no `federal`, while D-149's `LAW_LEVELS` (`legacy-checks`, read by `actions`) is `federal`, `state`, `local`; and `standard_sources` (R23) carries no level. A profile then cannot hold a federal records law, nor say a standard's level. Reconcile the two vocabularies before `actions`' and `standards`' jobs. Found by the layer-9 drafting worker (K88); a change of meaning in an approved requirement, so it goes to Bob with a recommendation.
- N62 · 2026-09-26 · **promotion** (K89): `reopen` offers a registration (`onReopened`) whose answers go into the act's reply, so `reevaluation.raise` can supply `reevaluation.raised` once `legacy-store`'s wrapper goes; with its requirement, before layer 7's tranche. Found by the layer-7 drafting worker.
- N63 · 2026-09-26 · **retrieval**, **progressions**, **capture-requests**, **bias**, **promotion**, **runtime-limits**, **capture** (K90): the services the scheduler's registry calls, stated in each provider's requirements before Bob approves them: retrieval a wake for the selection sweep (R22's notice into Provides); progressions a notice the scheduler registers with, in place of R8's "asks the scheduler to wake" (a layer-5 module cannot call layer 10); capture-requests its pending count and tick interval as named services (R11) and `expired` counted as a completion (R29, D-583); bias a due and wake for R33's sweep; promotion a post-commit notice beside R39's in-transaction projections; runtime-limits `unattendedCredential(env)`; and an owner for the tasks inbox (`taskDrain` and its siblings; capture's Suggestions, K49). Found by the layer-10 drafting worker. *Requirements written by BOB #43 (K96); each is built by its module's job.*
- N64 · 2026-09-26 · **record-core**, **capture**, **membership**, **basis-versions** (K91): stated in each provider's requirements before the using modules' tranches: record-core a per-item bound (`#perItem`, `PER_ITEM_MAX`, C-75) taking the act's identity groups, and R37's read contract widened to `current_state`, `title` and `criticality`, and a manifest read by author (for queue's unattended-capture producer); capture a read, attempt and remove over its R15 event queue and a list of live capture sessions; membership `rescueRefusal` and `positionalMember` into Provides (they are exported and used); basis-versions `projectsDrawingOn`. Found by the affordances/queue drafting worker. *Requirements written by BOB #43 (K96); each is built by its module's job.*
- N65 · 2026-09-26 · **retrieval**, **monitoring**, **affordances**, **instance-setup**, **jurisdictions** (K92): before Bob approves those drafts, (1) retrieval R2 (and its map §5.3) takes the action columns and `actionClockNext`/`actionOverdue` from actions' clock rule (its R12) by registration, keeping no copy (K75 (2)); (2) monitoring R34's mechanical overdue mark is bounded by actions R33 (only `pending` to `overdue`); (3) affordances and instance-setup take `ACTION_KINDS`, `RISK_TIERS`, `riskTierState` from `actions`, the kinds from the profile view; (4) jurisdictions (with N61, to Bob): the profile has no section for Design Requirement 8's legal organisations, the Tier 2 advisory note, a holiday calendar for business-day counts, or marking an office as an oversight or audit body. Found by the actions drafting worker. *Requirements written by BOB #43 (K96); each is built by its module's job.*
- N66 · 2026-09-26 · **record-core**, **promotion**, **scheduler**, **jurisdictions**, **legacy-index** (K93): record-core offers `isFirstBoot` (today `store.mjs` ~914 in `#migrate`), which instance-setup R2 and R13 read, and R26's writer is instance-setup R13–R14; promotion's carried checks list C-64.1 (its R13 raises it; K69's `#stampGroup` is already promotion's `stampGroup`); scheduler R9 says a producer later than it arms by calling R8; jurisdictions' Suggestion that the record refuses a test profile names instance-setup R14 instead; the `knock` handler, `KNOCK` and C-85, and the `runtime` and `cpuprobe` op arms are placed by BOB before layer 11's tranche. Found by the setup drafting worker. *Requirements written by BOB #43 (K96); each is built by its module's job.* *Placement done (K98): knock to capture, runtime and cpuprobe to instance-setup; their requirements join those modules' before their tranches.*
- N67 · 2026-09-26 · **promotion**, **inquiry**, **review**, **basis-versions** (K94): promotion R33 runs the case-document catalogue `ratification` registers, not `legacy-checks`' `checkCaseDocument` once C-41 moves; inquiry R38 (and R2's C-2.8) stops calling `checkPublishedExtension`, a layer-8 check, which `publication` registers with promotion; review's Uses name `basis-versions` (not `provenance`) for `testimonyReach`, which moves to basis-versions with `projectsDrawingOn` (N64), and basis-versions R22–R23 gain the read `concluded_elsewhere` needs. Found by the publication drafting worker.
- N68 · 2026-09-26 · **legacy-index**, **legacy-ui**, **legacy-tests** (K95): three old-battery reds LEGACY-TESTS #1 root-caused to modules no T3 job owns stay red, recorded in its job record: `op-claims` (membership's new op names in `build/` documents and `membership/index.mjs` `hostingaccessset`, and `scripts/op-claims.mjs`'s ledger entry for `setpassword`: legacy-index, with N43 in T4); `check-semantics`' docprofile drift (`app.html`'s stale flattened copy: legacy-ui, the UI placeholder, ruling 4; the check re-anchors on `docprofile`'s source or retires with the copy, legacy-tests T4-5); `rec-186-leave-join`'s catalogue arm (N44, legacy-checks in T4).
- N69 · 2026-09-26 · **promotion**, **record-core**, **filings**, **ai-runs**, **legacy-checks**, **review** (K94, K97): before layer 8's tranche, promotion offers the case-gate catalogue registration ratification fills (its R33 then runs it); record-core provides `textAtSha`; filings R15's evidence-package registration is stated in publication's Provides or filings reads what publication offers; ai-runs' next job deletes its copy of `searchedSection` (case-authoring's now); legacy-checks' copy of `isCaseMemberBytes` (C-3.1) gets a test that it agrees with ratification's; review's uses become publication and case-authoring if Bob moves it to layer 8, registrations otherwise. Found by the split worker.

## Tranche T4, prepared (P18): ready to open when T3 closes

**Layer 1, first (K53, K70): the `pdf-worker` split.** BOB applies K70 to `modules.json` and the requirement files at the opening.

**image-codecs**
- T4-0a · Requirement-named tests at the interface for every live id (the decoders against their fixtures); the CCITT decoder moved into its own file.
- N34 · A declared refusal for a JPX decode that would exceed the isolate's memory, with the bound measured; then the low-memory wavelet it defers.

**pdf-pixels**
- T4-0b · Requirement-named tests for every live id; map the JPX memory refusal into `REFUSALS`.

**pdf-worker**
- T4-0c · Requirement-named tests for its remaining ids; the bundle regenerated and verified at the layer's close.

Layer 3: the capture layer, extracted from `legacy-store` and `legacy-index` (and `legacy-checks` where a map says so), each by its target module's job (mechanics §12.2), all four concurrently (P10), in the layer's order `host-governor`, `provenance`, `capture-sources`, `capture`; a user builds against its provider's Provides and merges the tranche branch when BOB sends a CHANGE after the provider's early merge. Bob approved the four requirement sets on 2026-09-26 (K67). Each job writes requirement-named tests for every live id at its interface (P7). Maps: `build/extraction/<module>.md` (in preparation, P18).

**host-governor**
- T4-1 · Extract the module per its map and requirements (K47); requirement-named tests for every live id.
- N25 · `governedFetch` and the ops `governorstate` and `governorconfig` move from `index.mjs` (the fetch and user agent passed in by the caller).
- R3, R12 · the negative-appetite and stored-appetite defects, fixed in the extraction (K47).

**provenance**
- T4-2 · Extract the module per its map and requirements (K49, K59); requirement-named tests for every live id.
- R12 (D-580, K49), R21–R22 (REC-158), R24 (D-177), R25 (D-693), R26 (D-709), R29–R30 (REC-225), R47 (K49): the carried rows its requirements mark not yet met; built work for D-177, D-693, D-709 on the snapshot (`land/worker/<row>`), judged against the requirements.
- R34 (K59): the instance signing key for its own receipts, held as a secret, replaceable by the operator.

**capture-sources**
- T4-3 · Requirement-named tests for every live id; R36 (the CDX `urlkey`, K48), R54 (the render locale from the profiles, K48), R26 (D-570's quiet-window class, K48). R37 (Memento) stays unscheduled (K48).

**capture**
- T4-4 · Extract the module per its map and requirements (K48, K49, K58); requirement-named tests for every live id. The capture requests stay in `legacy-store` for `capture-requests` (K58); `capture` keeps the trusted in-process arm.
- D-701 (K76): `op=links` and `navchanges`, as capture's map places them.
- R17 (N3, N10), R18 (D-698), R20 (K60, co-attestation at every capture), R28–R29 (D-340, D-702), R11 and R42 (K49: the reading block moves to `extraction`, not here), R41 (K48): the rows its requirements mark not yet met; built work for D-340, D-698, D-702 on the snapshot, judged against the requirements.
- K98, K99 · the doorbell: R47–R53 (tests), R54 (bytes before the row), R55 (the compute-measurement registration), R56 (a keyed source fingerprint); C-85 stays in `legacy-checks` (K72 (1)).

**legacy-index** (layer 11, K53)
- N43 · route membership's five new ops. Also N12, N19, N21 where their modules have landed.

**legacy-checks** (layer 1, first, K53)
- N44 · catalogue rows for membership's new refusal codes; N36 · promotion's `EXISTS` and `ABSENT` rows.

**legacy-tests** (layer 11, after layer 3, K53)
- T4-5 · Re-anchor or retire every old-battery test layer 3's extractions break (each job's REPORT), first the seven that read `host_governor`'s DDL in `schema.mjs` (K72 (3)).

**Not in T4:** D-593, D-694, D-724 go with `extraction` (K49, layer 4); D-581, D-582, D-584 with `capture-requests` (K58, layer 6).

## Tranche T5, in preparation (P18; BOB #43, 2026-09-26): opens when T4 closes, once Bob has approved layers 4 and 5's requirements

Each extraction by its target module's job (mechanics §12.2), from the legacy modules its `from` names, per its map (`build/extraction/<module>.md`) and its requirements; requirement-named tests for every live id (P7); every carried row its requirements mark not yet met is applied, and built work on the snapshot is judged against the requirements (§12.5). A layer's jobs run concurrently (P10), in the layer's order; a user builds against its provider's Provides and merges the tranche branch on a CHANGE.

**Layer 2, first (record-core, promotion revisited; small)**
- **record-core** · N40 (R56–R58: `digestCensus`, `snapKeyCensus`, the shared digest and size computation), N51 (`auditPass` registration), N58 (R47–R48, `stampInstant` and `instantOrder`, so layer 6 takes them from here).
- **promotion** · N56 (`fact(name)`, D-592 `reopen`); drop its own `fileDigestOf`, `inlineBytesOf` and `EMPTY_STRING_SHA` for record-core's (R58).

**Layer 4** (order: `calibration`, `extraction`, `content`)
- **calibration** · T5-1 · Extract per map and requirements (K73, K74); D-587, D-668.
- **extraction** · T5-2 · Extract per map and requirements (K49, K73); D-593, D-694, D-724 (K49), D-614, D-616, D-684; N21 (the view to `docprofile`), N28 (`chainKindFor`), N48 (REC-206's derivation); the rows N42 routes through text-chain, pdf-reader and legacy-checks first go to those modules' jobs in the same tranche where they are in a lower layer's entries.
- **content** · T5-3 · Extract per map and requirements; D-374, D-419, D-580, D-670, D-675, D-686, REC-204 (subject to Bob's content question 2).

**Layer 5** (order: `entities`, `connections`, `progressions`, `bias`, `observation-log`, `query-language`, `retrieval`)
- **entities** · T5-4 · N4, N6 (with `id-spaces` retiring its legacy adapter, R26, K35), REC-225.
- **connections** · T5-5 · themes included (K79); D-575, D-625, D-706, D-722, REC-206.
- **progressions** · T5-6 · as its requirements.
- **bias** · T5-7 · the debt mechanism with it (K82 (3), K87), reading work products `ai-runs` registers in T6 (until then the store's arm registers them).
- **observation-log** · T5-8 · D-681, D-682; N39 (its share).
- **query-language** · T5-9 · N37 (`viewerPredicate`, `GATE_MARK` re-exported from membership).
- **retrieval** · T5-10 · the frontier included (K80); D-672, D-682, D-724.

**Layer 11, last:** **legacy-index** (the routes of the ops layers 4–5 move, N43's pattern), **legacy-tests** (re-anchor or retire what layers 4–5 break; N46 with N37; N57's remainder).

**Size.** Twelve jobs; T3's three extractions processed 236.6M tokens. BOB reports the measured T4 cost before opening T5, and may split T5 by layer (layer 4, then layer 5) if T4's cost per job says so.
