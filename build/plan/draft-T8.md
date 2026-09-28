# Plan: tranche T8

**Status** · DRAFT (BOB #51), drafted by a worker 2026-09-28 during T7's layer 6 (P18); reviewed in part (K191). Opens as `next.md` once T7 closes, after re-reading for what T7's layers 6, 7 and 11 change. Settled by K191: N147's `CATALOG_VERSION` stamp is taken once, after layer 9 (layers 8–9 move rows too), not in layer 2; `bias/interim.mjs` goes with bias (N143, K182 (3)); `testimonyReach` is basis-versions' (review's Uses corrected); D-695, D-717 and D-688 go to actions, as its requirements place them. Open for the opening BOB: the size (45 jobs against T7's 25; consider splitting layers 1–6 from 8–10), the maps to re-check (below), N28 and N89, and the requirement marks the section "Contradictory" names.

**Jobs** · (none yet)

Drafted for BOB #51 on `tranche/T7` while T7 runs (P18), from `build/plan/next.md`, `docs/development/transition/old-plan/index.csv` and `build/modules.json`. T8 carries layers 8 (publication), 9 (action) and 10 (operations), with N129 and N130 first as their text asks; every ready `next.md` entry against a module T7 does not carry, or carries only in part, each in its module's own layer; and the carried old-plan rows whose target is a T8 module. Ten layers, lowest first (P10): 1, 2, 3, 4, 5, 6, 8, 9, 10, 11 (layer 7 has no entries). T6's and T7's rules hold. Each extraction is done by its target module's job (mechanics §12.2), following its map (`build/extraction/<module>.md`) and its requirements. A module with no `from` is built per its requirements; its map says nothing moves. Every job writes requirement-named tests for every live id (P7), applies every carried row its requirements mark *not yet met*, and judges built work on the snapshot against its requirements (§12.5). A user builds against its provider's Provides, and BOB merges a provider early (§4). An `N` entry's text is in `next.md`, and a job applies only the share this plan gives it. Each layer is re-read at its start for what T7's layers 6, 7 and 11 changed (K170's rule). The maps listed under "Maps to re-check" are checked before layer 8 opens.

### Layer 1 (order: `legacy-checks`, `jurisdictions`, `bundler`, `runtime-limits`, `subresources`, `office-readers`, `odf-reader`, `pdf-reader`, `text-chain`, `image-codecs`)

- **legacy-checks** · N129 first, at the head of the tranche (K171 (1), (2): `STD-`, `CONF-`, `CONS-`, `ESC-` registered as `BIAS` was; `proposalLabel` over `lawProposalState`, with `lawProposalLabel` kept); N128 (catalogue rows for promotion's `FACT_MALFORMED`, `STEP_DECLARED`, `STEP_MODULE_UNNAMED`, `LISTENER_MALFORMED`; the `LISTENER_DECLARED` row only after BOB's structural ruling); N148 (reword `CONTENT_EXTENT_CHECKS`' prose header); N70 (its share, if LEGACY-CHECKS #2 left any: the `where` of `MACHINE_CANNOT_REOPEN`, rec-186, machinefences-dec49 arm D).
- **jurisdictions** · N130 (R23 `level`, R24 `oversight`, R25 `advisory`, R31–R36, before actions R32); with N61 and N65 (4) (the profile sections, Bob's, K102), N77 (`locale`, which capture R41 reads), N96 (`systems[].links`, K158).
- **bundler** · N31 (its share: `fleet-bundle.mjs`'s remedy text stops naming `node tools/bundles.mjs`; the old test `fleetbundles` arm (j) must change at the same time, see "Contradictory").
- **runtime-limits** · N63 (its share: R26 `unattendedCredential(env)`, which capture-requests injects until built (K181 (6)) and monitoring R23 reads).
- **subresources** · N79 (each link carries its chrome containment; capture R28 follows in layer 3).
- **office-readers** · N27 (its share: `rangeUnitFor`, `a1Corner` named in Provides).
- **odf-reader** · N27 (the `.ods` half of D-415: named ranges and tables as `sheet-range` units; built work in `odf.mjs` on the snapshot).
- **pdf-reader** · N100 (its share: each page's box, the producer half of D-374, built on `land/worker/D-374`); N101 (`image_unread` per image, the producer half of D-665; REC-206's link anchors).
- **text-chain** · N98 (D-670's space rule for `extentCovers`, `readingPositionInExtent`, `readingSource`'s `space`; built on the D-670 branch); N102 (`mergeTier2Text` carries `image_unread`); N104 (its share: states which step kinds are machine readings).
- **image-codecs** · N75 (the low-memory line-based 9/7 wavelet only; its measurement on a deployed plane waits, see below).

### Layer 2 (order: `record-core`, `membership`, `promotion`)

- **record-core** · N69 (its share: `textAtSha`, which publication R2 and ratification R3 read; their requirements say it is not yet provided).
- **membership** · N123 (its share: a revocation notice, K31's pattern; K159); N142 (its share: `inSight` into Provides; `bundleGate`/`bundleRedactor` stated or struck); N146 (the one no-such-project answer, `#noSuchProject`, as a service); N70 (its share: bounds on the deciders of `hostingaccess`, `memberpairings`, `projectowneradd`).
- **promotion** · N67 and N69 (their share: the case-document catalogue registration ratification fills, which R33 then runs instead of `checkCaseDocument`; promotion's requirements do not state it yet, so BOB writes it first); N142 (its share: `INLINE_MAX` into Provides); N70 (its share: `fact`'s nested refusal against the D-240 reader, meaning-bounds); N147 (its share: a MINOR `CATALOG_VERSION` stamp for layer 6's departures; see "Contradictory" on timing).

### Layer 3 (order: `host-governor`, `provenance`, `capture-sources`, `capture`)

- **host-governor** · N132 (`governorOf` adopts a later caller's defaulted option and refuses a differing one, as N122 did for capture).
- **provenance** · N133 (its share: R48 states the whole-second spelling of `first_retrieved`/`last_retrieved`); N145 (a test naming R48's `authored` column, which basis-versions R39 joins).
- **capture-sources** · N123 (its share: registers membership's notice, so a revoked member's `member` credentials are destroyed at once).
- **capture** · N79 (its share: R28 records containment on live captures, D-340's `furnitureLinks`); N80 (its share: `acquireGradeNote` moves here from `affordances.mjs`); N133 (its share: bound `resolveLinks`' per-link read, bracket in SQL); N140 (the in-process `captureRequest` arm takes `{credential, heldSha, origin}`: capture-requests R38, R39, R41); R45–R46 (N63's tasks-inbox owner, N64's event-queue read and live sessions) if still marked not yet met.

### Layer 4 (order: `extraction`)

- **extraction** · N100 (its share: R13/R30 carry `page_boxes` under `page_count`'s three-state rule); N139 (its share: D-375's reading character count, built on `land/worker/D-375` @ 9a5df6e6).

### Layer 5 (order: `entities`, `connections`, `progressions`, `bias`, `observation-log`, `query-language`, `retrieval`)

- **entities** · N110 (the read contract gains `entities(entity_id, at)`); N126 (widen region `is-alias-named`); N135 (`resolutions` as a read contract in Provides, with its test).
- **connections** · N125 (`themes.mjs` re-exports C-81.11–C-81.14 from `THEME_CHECKS`, drops its copy); N131 (`m/connections/factory.test.mjs` line 18 asserts capture R58's refusal, or the arm goes).
- **progressions** · N118 (its share: C-100's rows in one `where` grammar, no rows for other modules' codes); N63 (its share: R33's notice, if its mark still holds).
- **bias** · N143 (delete `bias/interim.mjs`, its re-export and its "R33 (interim)" test; K182 (3)); N118 (its share: `BIAS_REFUSED`'s `where` names the public `promotionCheck`); N63 (its share: R41's due and wake, if its mark still holds).
- **observation-log** · N113 (`DOCUMENT_EVIDENCE_IS_ONE_SIDED`, approved K158); N118 (its share: `AI_LOG_NEVER_LOOKED_STORED`, C-22.17, at region `is-never-looked-stored`); N134 (`CAPTURE_TEXT_UNIT_CONTAINERS` gains `xlsx`, `ods`, `csv`; the reason and vocabulary sentences corrected); N139 (its share: `contentObservationsFor`, D-375).
- **query-language** · N104 (its share: `MACHINE_READ_KINDS` re-exported from text-chain); N106 (its share, with retrieval: compiled statements read retrieval's own table).
- **retrieval** · N106 (its share: projection columns and `fts_id` off `bundles` into a table of its own; record-core R37's note then goes); N142 (its share: `answerChanged` into Provides).

### Layer 6 (order: `inquiry`, `citation`, `basis-versions`, `capture-requests`)

- **inquiry** · only if T7 leaves them: N142 (its share: `subjectEntityOf`, `onRaised`, `member_user_agent`'s read, which INQUIRY #1 proposes in T7); N99 (its share, if the narrow act has an inquiry side).
- **citation** · N146 (its share: adopt membership's no-such-project service and delete its byte-identical copy).
- **basis-versions** · N99 (the narrow act reads content's `extentRelation`, not the catalogue's).
- **capture-requests** · N141 (R38's promotion at `collected`: an `information` bundle through `promotion.promote` under `token:daemon`, deferred from T7).

### Layer 8 (order: `publication`, `ratification`, `case-authoring`, `review`)

- **publication** · Extract per map and requirements (K3, K31, K57, K78 (2), K83 (3), K94, K102, K171 (4)); D-246 (R30); built work on the snapshot judged: D-618, D-626, D-680, D-683, D-703, D-708, D-712, D-720, D-721, D-725, D-728, D-734; queued rows D-613 (`publishedbytes` zip duplicate path answers 413, not 409) and D-742 (re-key pre-D-720 acknowledgements on the live record, live data); N16 (its share: `exportManifest`, `exportLog`, `export_log`, R18–R19); N67 (inquiry's share, moved here by K181 (1): C-2.8 stops calling `checkPublishedExtension`); N69 (its share: R36's evidence-package registration, which filings R15 fills); R37 `publishedEditionsOf` (K171 (4)); N127 (as the next job extracting from legacy-store: page `auditPass`'s `sighted` SELECT); N89 (classify `archivelookup` in `PROJECT_NAMING_READS` or `_NOT`; see "Could not place").
- **ratification** · Extract per map and requirements (K3, K6, K31, K57, K61, K83 (3), K93 (3), K94, K102); no rows; R16; N67 and N69 (its share: fills promotion's case-document catalogue registration, C-41 moving; R9 registers `checkPublishedExtension`); N69 (legacy-checks' share: a test that `isCaseMemberBytes`' copy in the catalogue, C-3.1, agrees with ratification's; it goes in ratification's suite, since legacy-checks cannot import it); reads record-core's `textAtSha` (layer 2).
- **case-authoring** · Extract per map and requirements (K3, K6, K57, K61, K82 (5), K94, K102); no rows; R12 (REC-15), R21's named-draft half; N138 (its share: takes `searchedSection`, `SEARCHED_LEVEL_OUTCOMES` and the `SEARCHED_SUBJECT_SOURCES` re-export from `airun.mjs`, re-pointing `store.mjs` 360/7989).
- **review** · Extract per map and requirements (K102); no rows (D-656 dropped); N67 (its share: Uses name basis-versions R39, not provenance, for `testimonyReach`; review's requirements still say provenance, so BOB folds it first); N69 (its share: uses are publication and case-authoring, as `modules.json` already has).

### Layer 9 (order: `standards`, `conformance`, `consequences`, `actions`, `filings`, `escalation`)

- **standards** · Build per requirements (map: nothing moves; K171 (3), (12)); R3's source `level` reads jurisdictions R23 (N130); R9's `proposalLabel` (N129).
- **conformance** · Build per requirements (map: nothing moves; K171 (4)–(7), (10), (11)); reads publication R37, and inquiry, strength and reevaluation as built in T7; the `CONF-` type (N129).
- **consequences** · Build per requirements (map: nothing moves; K171 (8), (9), (17); K172); R2's grade through `provenance.captureGrade`; the `CONS-` type (N129).
- **actions** · Extract per map and requirements (K3, K4, K6, K23, K31, K57, K61, K64, K75 (2), K79, K102); REC-201 (R4; with JURISDICTIONS #1's `cpra_request` and CPRA sentence), D-689 (R5), D-695 (R6), D-717 (R7), D-579 (R11), D-688 (R22), REC-215 (R28); N61 (`LAW_LEVELS` reconciled with the profile's levels, K102, reading N130); N65 (1) (registers its clock rule and action facts with retrieval R53), N65 (2) (R33 bounds monitoring R34's overdue mark); R32 after jurisdictions R33 (N130).
- **filings** · Build per requirements (map: nothing moves; K171 (13), (14)); R9 reads jurisdictions' holiday calendar (N130) and `provenance.attestationsOf` (K176); R15 registers with publication R36 (N69); R21 `availableActions`.
- **escalation** · Build per requirements (map: nothing moves; K171 (3), (15), (16); K172); R12's oversight marker (jurisdictions R24, N130); a record object of type `ESC-` (N129).

### Layer 10 (order: `monitoring`, `scheduler`)

- **monitoring** · Extract per map and requirements (K102); no rows; N116 (the instance's active profiles reach `identify`/`doctypeFor`/`assess` in `op=monitor`: through a record-core route, or N21's view passed where `op=monitor` now runs); N65 (2) (R34 bounded by actions R33: `pending` to `overdue` only); R23 reads runtime-limits R26 (N63, layer 1).
- **scheduler** · Extract per map and requirements (K102); D-583 (R12, met once capture-requests R29 counts `expired`, T7); N66 (its share: R9, a later producer arms by calling R8); N63 (the registry calls each provider's named services, built in layers 1–6).

### Layer 11 (order: `affordances`, `legacy-index`, `installer`, `legacy-tests`)

- **affordances** · N6 (its share: `idmatch`'s outward text names no local system); N45 (`projectleave` not offered where REC-224 refuses; d311); N49 (its share: re-export progressions' `STAGE_REQUIREDNESS`, `DISPOSITIONS`, delete its copy); N52 (import promotion's `REOPENABLE_FROM`); N65 (3) (`ACTION_KINDS`, `RISK_TIERS`, `riskTierState` from actions, kinds from the view); N80 (its share: drops `acquireGradeNote`); N91 (re-export `PER_ITEM_MAX`, pass `PER_ITEM_ACTS` to `perItem`); N144 (its share: `op=affordances` publishes `surfaces` and `recipes`, skills R10).
- **legacy-index** · the routes of the ops layers 8–10 move (N43's pattern); N93 (stamp `viewer` and `administer` on `op=memberpairings`).
- **installer** · N5 (R22: outward text names CivicOS and the installing group).
- **legacy-tests** · re-anchor or retire what T8's layers break; N147 (its share: the census re-pinned after promotion's stamp); N139 (its share: `nc-d375`, `observation-content`); N31 (its share, only if T7's arm (j) did not land with bundler's text).

**Size.** 45 jobs: layer 1 10, layer 2 3, layer 3 4, layer 4 1, layer 5 7, layer 6 4 (inquiry conditional), layer 8 4, layer 9 6, layer 10 2, layer 11 4. T7 has 25 jobs. Layers 1–6 are small entries; BOB may cut them to a separate tranche or fold them into fewer sessions.

## Maps to re-check

These maps name code or modules that T7's layers 6–7 move:

- **publication, ratification, case-authoring, review, actions, monitoring, scheduler**: measured on `tranche/T3` (`store.mjs` 49,817 lines), so every line range predates T4–T7.
  - publication: `testimonyReach` (now basis-versions').
  - ratification: `#projectsDrawingOn`, `#conclusionOf…` (basis-versions); `checkInquiryExtension` (inquiry); `SEARCHED_SUBJECT_SOURCES` in `airun.mjs` (ai-runs).
  - case-authoring: the `airun.mjs` 1405–1638 range, which ai-runs edits in T7; `strengthOf`/`#projectBar` (strength); `#reevalRaisedBy` (reevaluation); `testimonyReach` (basis-versions).
  - review: `#projectBar` (strength); `testimonyReach` named as provenance's; its Uses item names inquiry, basis-versions and strength.
  - actions: C-32.3, C-32.19, C-32.4 in `MACHINE_FENCE_CHECKS`, split "by the first job to move", and strength moved C-32.9 in T7 (K181 (3)).
  - monitoring: capture-requests' shared `#tickRunning` and its reads of `#monitorToken`; intent; reevaluation.
  - scheduler: the `ai-run-reap`, `ai-run-wake` (ai-runs) and `capture-request-drain` (capture-requests) consumers; strength, intent and reevaluation.
- **conformance, consequences**: re-measured at T7's base. They state inquiry's, strength's and reevaluation's services as "not yet met: its job in the next plan", which T7 builds.
- **standards, filings, escalation**: nothing moves. Only their §2 line citations (at T7's base) may drift; none names a T7 module.

## Not in T8, and why

- **Wait on something not yet done:**
  - N22: the test needs a non-root container.
  - N26: needs a migration of stored ¶ references, which BOB schedules.
  - N30: odf-reader's bounded-expansion requirement is not written; it joins if BOB writes it before layer 1 opens.
  - N34's remainder: the JBIG2 PPM/PPT fixture has no encoder, and BOB reviews pdf-worker's split before its next job.
  - N75's deployed measurement and DIST-14: both need a deployed plane.
  - N137: strength R23's cache waits on a retrieval registration no requirement states yet.
  - N136: K181 (1) keeps the columns on `bundles` until query-language's `legs` reads a new table.
- **Wait on a layer-11 extraction** (instance-setup, control-plane, queue: not in T8):
  - N38.
  - N10: the instance-setup share, and the installer's R21, which needs instance-setup R13.
  - N53: control-plane's share.
  - N65 (3): instance-setup's share.
  - N66: `runtime` and `cpuprobe` to instance-setup.
  - N95 and N13: queue's extraction (N13 is resolved through N49 as each extracts).
  - The carried rows for these modules: D-719 (instance-setup), D-629, D-679, D-586 (control-plane), D-623, REC-202 (queue), DIST-15 (installer, which needs its signed limits statement).
- **Order:**
  - N138: ai-runs' share. Deleting `airun.mjs`' copy must follow case-authoring (layer 8), and ai-runs is layer 6, so it goes to a later tranche. The case-authoring map §3 item 1 says the same.
- **Not a job:**
  - N71: BOB's wording, applied as each file is touched. Code identifiers change only with a migration.
  - The legacy-ui shares of N68, N70 and N144: `app.html`'s copy is the UI placeholder, and ruling 4 plans no new work there. The check itself (`check-semantics.mjs`) is legacy-tests'.
- **Already applied, not re-listed:** N4, N35, N36, N39, N41, N42, N44, N46, N47, N50, N54, N55, N57, N59, N60, N62, N72, N78, N81, N82, N84, N87, N90, N92, N94, N97, N103, N105, N107–N109, N111, N112, N114, N115, N117, N119, N122, N124, and N63's, N64's and N67's shares already carried (T3–T7).

## Could not place

- N28 (legacy-store): "at the extraction of its reader". No module is named as the reader, and extraction took its share in T5.
- N89: a legacy-store list entry. An extracting job may only remove from legacy-store (§12.2), so adding `archivelookup` to a list is an addition. It is placed with publication for now; BOB confirms, or gives it to whichever module owns `PROJECT_NAMING_READS` (control-plane's map).

## Contradictory

1. **N147's timing.** Promotion (layer 2) stamps for layer 6's departures, but T8's own layers 8–9 move more catalogue rows (actions' C-32/C-94, ratification's C-41). One stamp after layer 9 (P10's exception, as K150 re-opened promotion in T5) avoids two.
2. **N31.** T7's legacy-tests changes `fleetbundles` arm (j) "with N14". The bundler's remedy text, which must change at the same time, is in no T7 job.
3. **`bias/interim.mjs`.** T7's ai-runs bullet deletes it (K146), but K182 (3) and N143 give the deletion to bias. It is placed with bias here; T7's line is stale.
4. **`testimonyReach`.** review's requirements (Uses) and map name provenance, while N67 and K182 (1) put it in basis-versions (R39).
5. **Publication's rows.** index.csv carries 15 rows to publication, but its requirements mark only D-246 not yet met. D-613 and D-742 are queued, and no requirement names them. D-742 needs the live record.
6. **Row targets.** index.csv targets D-695 and D-717 at promotion and D-688 at progressions, while promotion's requirements, progressions' map and actions' requirements (R6, R7, R22) place all three in actions. They are placed with actions here.
7. **Stale requirement marks.** Several earlier-layer requirement headers still mark N63's and N64's services not yet met (progressions, bias, capture R45–R46, runtime-limits R26), although T5 reports every entry applied. The shares above are conditional on the marks still holding.
