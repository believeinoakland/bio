# Entries applied, moved from next.md

**Status** · Moved by BOB #64, 2026-09-29 (K411), after a worker verified each against the archived plans' outcomes, the rulings and the code (`draft-T13.md`'s "Met, still filed" list). Each line: the entry as filed, then `→ applied:` the evidence. Read only for history; nothing here is planned.

- N16 · 2026-09-26 · **promotion**, **publication**: `forkProject` and project name uniqueness (C-77, with canon §7.1's NFC normalisation) move from the store to `promotion`; `exportManifest`, `exportLog` and `export_log` move to `publication` (K31). BOB writes their requirements before each module's first job. *(T3 carries its share for record-core, promotion or legacy-tests.)*
  → applied: archive/T3.md promotion share done; archive/T8.md publication N16 share (layer 8 merged)
- N27 · 2026-09-26 · **odf-reader**, **office-readers**: the `.ods` half of D-415 (named ranges and tables as `sheet-range` units, as `.xlsx` has by R9/K36); built work on the snapshot (`odf.mjs`); `office-readers` names `rangeUnitFor` and `a1Corner` in its Provides for it. Reported by OFFICE-READERS #1.
  → applied: archive/T9.md: odf-reader + office-readers, layers 1-4 every entry applied
- N28 · 2026-09-26 · **legacy-store** (at the extraction of its reader): a page's kind reads `chainKindFor` (text-chain R81), not `terminalStep(chain) || "layer"`. Reported by TEXT-CHAIN #1. *(T5 carries extraction's share.)*
  → applied: archive/T9.md + K307
- N4 · 2026-09-25 · `store.mjs` `readingNamePlan` defaults its search terms to "oakland": take them from the active profiles. The owning module is confirmed at extraction. *(T5 carries entities.)*
  → applied: archive/T5.md: entities T5-4, every entry applied; T8 "Already applied"
- N5 · 2026-09-25 · **installer**: the outward text names CivicOS and the installing group. Believe in Oakland appears only as the release's publisher and signer. The example group name is not a place.
  → applied: archive/T8.md outcome: installer N5/R22
- N6 · 2026-09-25 · **entities**: `op=idmatch` takes the renamed spaces (N2) and the view-first services, and `id-spaces` retires its legacy adapter (R26, K35) in the same tranche; `bio-plane/test/rec203-idspaces.test.mjs` moves to the new names, passes the combined profile view, and passes each end's addresses from the record. **affordances**: `idmatch`'s outward text names no local system (it says "C.M.S.", "APN" and "Legistar's floor" today). *(T5 carries entities' and id-spaces' shares.)*
  → applied: archive/T5.md entities/id-spaces/legacy-tests; T6 N105; K225: affordances share applied T7
- N35 · 2026-09-26 · **capture-requests** (K58): BOB drafts its requirements from the code (store.mjs ~44550–45440 and the `capturerequest*` ops) and brings them to Bob before its layer's tranche; `capture`'s job keeps only the trusted in-process arm.
  → applied: archive/T7.md capture-requests T6-8; T8 "Already applied"
- N36 · 2026-09-26 · **promotion** (from `legacy-checks`): catalogue rows for promotion's `EXISTS` and `ABSENT` refusals (N17). (C-18.8's removal moved into T3 by K64.)
  → applied: archive/T4.md outcome
- N39 · 2026-09-26 · **observation-log**, **ai-runs** (K71): each stops reading `capture_requests` directly and offers a registration `capture-requests` fills (the K31 pattern), at their extractions. *(T5 carries observation-log's share.)*
  → applied: archive/T5.md (observation-log), T7.md (ai-runs, capture-requests); T8 "Already applied"
- N41 · 2026-09-26 · DONE (K74) · **calibration**, **extraction** (K73): BOB splits `build/requirements/extraction.md` into `calibration.md` and `extraction.md` and adds `calibration` to `modules.json` (layer 4, before `extraction`), before Bob approves either.
  → applied: DONE K74
- N42 · 2026-09-26 · **text-chain**, **pdf-reader**, **legacy-checks**, **retrieval** (K73): rows routed to extraction touch these first: D-697 and D-635 (text-chain), D-665 (pdf-reader), D-685 (legacy-checks), and D-672 (retrieval), on which D-684, D-685 and D-724 are stacked; each gets an entry against its own module in the tranche before extraction's. *(T5 carries extraction applies D-635, D-665, D-697, D-685 as its R8, R9 (K126); retrieval D-672.)*
  → applied: K126 (rows are extraction's); archive/T5.md extraction/retrieval; T8 "Already applied"
- N44 · 2026-09-26 · **legacy-checks**: catalogue rows for membership's new refusal codes (R10, R29, R62 and the others its record lists), so each carries a catalogue check id and translation instead of `membership.Rn`. Reported by MEMBERSHIP #1.
  → applied: archive/T4.md outcome
- N45 · 2026-09-26 · **affordances**: `projectleave` is offered where membership's REC-224 now refuses it (`d311-roster-affordances`). Reported by MEMBERSHIP #1.
  → applied: K310: N45 met
- N46 · 2026-09-26 · **legacy-tests** (with N37): `meaningread` and `meaningquery` pin the gate's mint sites in `query.mjs`'s text; re-anchor them when `query.mjs` re-exports membership's `viewerPredicate` (K75). *(T5 carries legacy-tests.)*
  → applied: archive/T5.md T5-12; T8 "Already applied"
- N47 · 2026-09-26 · DONE (K79) · **connections** (K76, K77): themes (store.mjs ~22904–23215, `themes`, `theme_placements`, `THEME_CHECKS`) are connections'; their requirements and map join `connections.md` before Bob approves it.
  → applied: DONE K79
- N49 · 2026-09-26 · **ai-runs**, **affordances**, **queue** (K78): each re-exports, from the layer-5 module that took a copy, the vocabulary and checks it held for that module (observation-log's in `airun.mjs`; progressions' `STAGE_REQUIREDNESS`, `DISPOSITIONS` in `affordances.mjs`; `QUEUE_CONDITION_KINDS` in `queuestate.mjs`), and deletes its own copy.
  → applied: archive/T7.md ai-runs; K225 affordances (applied T7); queue via N114 (queuestate.mjs:61-62)
- N50 · 2026-09-26 · DONE (K80) · **retrieval** (K78): its draft requirements and map gain `op=frontier`'s arms (about 1,116 lines) before Bob approves it.
  → applied: DONE K80
- N52 · 2026-09-26 · **affordances**: import promotion's `REOPENABLE_FROM` instead of keeping its own. Reported by PROMOTION #1.
  → applied: K225: applied T7
- N54 · 2026-09-26 · DONE (K86) · **ai-runs**, **run-productions** (K82): BOB splits `build/requirements/ai-runs.md` into `ai-runs.md` and `run-productions.md` (`op=suggest` and the extract proposals), adds `run-productions` after `ai-runs` in `modules.json`, before Bob approves either.
  → applied: DONE K86
- N55 · 2026-09-26 · DONE (K85) · **inquiry**, **citation** (K83): BOB splits `build/requirements/inquiry.md` into `inquiry.md` and `citation.md` (cite, sever, reinstate), adds `citation` directly after `inquiry` in `modules.json`, before Bob approves either.
  → applied: DONE K85
- N59 · 2026-09-26 · **bias** (K82 (3), K86): its draft requirements take the bias-debt mechanism (ai-runs' old R39–R44, and members' work if Bob says yes to bias question 3) before Bob approves it. *Requirements done by BOB #43 (K87): `bias` R33–R40.*
  → applied: K87: bias R33-R40 written
- N60 · 2026-09-26 · **strength** (K86): its draft gains a service answering the strength pair over a candidate's legs, which run-productions reads, before Bob approves it. *Requirements done by BOB #43 (K87): `strength` R26–R27.*
  → applied: K87 requirements; archive/T7.md strength N60 built; T8 "Already applied"
- N62 · 2026-09-26 · **promotion** (K89): `reopen` offers a registration (`onReopened`) whose answers go into the act's reply, so `reevaluation.raise` can supply `reevaluation.raised` once `legacy-store`'s wrapper goes; with its requirement, before layer 7's tranche. Found by the layer-7 drafting worker.
  → applied: archive/T6.md outcome: promotion N62 (onReopened, R46)
- N63 · 2026-09-26 · **retrieval**, **progressions**, **capture-requests**, **bias**, **promotion**, **runtime-limits**, **capture** (K90): the services the scheduler's registry calls, stated in each provider's requirements before Bob approves them: retrieval a wake for the selection sweep (R22's notice into Provides); progressions a notice the scheduler registers with, in place of R8's "asks the scheduler to wake" (a layer-5 module cannot call layer 10); capture-requests its pending count and tick interval as named services (R11) and `expired` counted as a completion (R29, D-583); bias a due and wake for R33's sweep; promotion a post-commit notice beside R39's in-transaction projections; runtime-limits `unattendedCredential(env)`; and an owner for the tasks inbox (`taskDrain` and its siblings; capture's Suggestions, K49). Found by the layer-10 drafting worker. *Requirements written by BOB #43 (K96); each is built by its module's job.* *(T5 carries promotion's share.)*
  → applied: shares: promotion T5, capture-requests T7, runtime-limits T8 L1, capture T9, progressions+bias T10 (K332 "mark void"); tasks-inbox owner = queue (K91), T12 queue extraction; T8 "Already applied" for T3–T7 shares
- N64 · 2026-09-26 · **record-core**, **capture**, **membership**, **basis-versions** (K91): stated in each provider's requirements before the using modules' tranches: record-core a per-item bound (`#perItem`, `PER_ITEM_MAX`, C-75) taking the act's identity groups, and R37's read contract widened to `current_state`, `title` and `criticality`, and a manifest read by author (for queue's unattended-capture producer); capture a read, attempt and remove over its R15 event queue and a list of live capture sessions; membership `rescueRefusal` and `positionalMember` into Provides (they are exported and used); basis-versions `projectsDrawingOn`. Found by the affordances/queue drafting worker. *Requirements written by BOB #43 (K96); each is built by its module's job.* *(T5 carries record-core's and membership's shares.)*
  → applied: archive/T5.md record-core+membership; T7.md basis-versions; T9.md capture R45-R46; all applied
- N67 · 2026-09-26 · **promotion**, **inquiry**, **review**, **basis-versions** (K94): promotion R33 runs the case-document catalogue `ratification` registers, not `legacy-checks`' `checkCaseDocument` once C-41 moves; inquiry R38 (and R2's C-2.8) stops calling `checkPublishedExtension`, a layer-8 check, which `publication` registers with promotion; review's Uses name `basis-versions` (not `provenance`) for `testimonyReach`, which moves to basis-versions with `projectsDrawingOn` (N64), and basis-versions R22–R23 gain the read `concluded_elsewhere` needs. Found by the publication drafting worker.
  → applied: archive/T7.md basis-versions; T8.md promotion, publication (inquiry share, K181), review; K202
- N69 · 2026-09-26 · **promotion**, **record-core**, **filings**, **ai-runs**, **legacy-checks**, **review** (K94, K97): before layer 8's tranche, promotion offers the case-gate catalogue registration ratification fills (its R33 then runs it); record-core provides `textAtSha`; filings R15's evidence-package registration is stated in publication's Provides or filings reads what publication offers; ai-runs' next job deletes its copy of `searchedSection` (case-authoring's now); legacy-checks' copy of `isCaseMemberBytes` (C-3.1) gets a test that it agrees with ratification's; review's uses become publication and case-authoring if Bob moves it to layer 8, registrations otherwise. Found by the split worker.
  → applied: archive/T8.md promotion, record-core (K203), filings, ratification, review (K202); T10.md ai-runs via N138
- N72 · 2026-09-26 · DONE (K171) · **standards**, **escalation**, **filings** (K108): standards R3's match carries the source's level; escalation R12's oversight and audit requests check the office's `oversight` marker (jurisdictions R24); filings R9's claim deadlines count business days on the profile's holiday calendar (jurisdictions R33). Written into those requirements before layer 9's tranche; the escalation file also states it is a record object.
  → applied: DONE K171
- N77 · 2026-09-27 · **jurisdictions** (CAPTURE-SOURCES #1 Q1, K119): a profile key `locale` (`{value, basis}`, one BCP 47 tag, validated), combined like `practice`'s keys, so capture-sources R54 reads the render locale from the profiles; the first profile states its locale.
  → applied: archive/T8.md jurisdictions; K227 (R37 locale)
- N78 · 2026-09-27 · **docs** (CAPTURE-SOURCES #1, T4; BOB's): file R26's measurement (N = 4 s, 32 runs, M-151's instrument; stated whole in `browserrender.mjs`'s comment) as an M-entry, and fold D-570 into `CLIENT-RENDERED.md`. *(DONE by BOB #45: M-186; CLIENT-RENDERED.md.)*
  → applied: DONE K131
- N79 · 2026-09-27 · **subresources** (CAPTURE #1, T4): `captureSubresources`' links carry each link's containment in a chrome region, so capture R28 files it on live captures (D-340's `furnitureLinks`, built on the snapshot).
  → applied: archive/T9.md subresources + capture, layers 1-4 every entry applied
- N80 · 2026-09-27 · **affordances**, **capture** (CAPTURE #1, T4): `acquireGradeNote` (acquire's `ACQUIRE_GRADE_NOTE`) moves out of `affordances.mjs` to `capture` or `legacy-checks`, so capture composes its own answer; until then the op handler adds it.
  → applied: archive/T8.md capture L3 (K274), affordances + legacy-index (K262, K266)
- N81 · 2026-09-27 · **legacy-checks** (PROVENANCE #1, T4): catalogue rows for provenance's new refusal codes (its record lists them).
  → applied: archive/T6.md L1 legacy-checks (complete); T8 "Already applied"
- N82 · 2026-09-27 · **strength** (PROVENANCE #1, T4): the earned registry reads provenance's `captureGrade`.
  → applied: archive/T7.md strength; K182 (registry share is inquiry's, T7); T8 "Already applied"
- N84 · 2026-09-27 · **affordances** (LEGACY-INDEX #1, T4): `NON_ACTS` rows for `adminresign`, `hostingaccessset`, `memberpairingset` (the totality test reads 98/1 after N43).
  → applied: archive/T7.md affordances; T8 "Already applied"
- N87 · 2026-09-27 · **legacy-checks** (LEGACY-TESTS #2, T4): re-point every row whose `where` names `src/store.mjs` or `src/index.mjs` for code layer 3 moved with its DEC-49 markers into `src/capture/` and `src/provenance/` (the list in legacy-tests' T4 record).
  → applied: archive/T6.md L1; T8 "Already applied"
- N89 · 2026-09-27 · **legacy-store** (LEGACY-TESTS #2 REPORT 6): classify `archivelookup` in `PROJECT_NAMING_READS` or `_NOT` (project-sight); with it, `pdfstructure` into `PROJECT_NAMING_READS_NOT` beside `reading` (QUEUE #1 REPORT J2.1, K210).
  → applied: archive/T9.md legacy-store; K307
- N90 · 2026-09-27 · **capture** (LEGACY-TESTS #2 REPORT 8): bound its six unbounded routes (meaning-bounds ceiling 45 → 51, not moved).
  → applied: archive/T7.md outcome
- N91 · 2026-09-27 · **affordances** (RECORD-CORE #2, K130): re-export record-core's `PER_ITEM_MAX` (R49) and pass its `PER_ITEM_ACTS` groups to `perItem`, deleting its own copy.
  → applied: K225: applied T7
- N92 · 2026-09-27 · **provenance** (K130): `provenanceAudit` registers its checks with record-core's `registerAuditCheck` (R59) and drops its wrapper.
  → applied: archive/T7.md outcome
- N94 · 2026-09-27 · **legacy-checks** (RECORD-CORE #2 REPORT 4, PROMOTION #3): C-75's five `where`s now name `src/record-core/index.mjs` `perItem` (`is-per-item-*`); catalogue rows for record-core R59's `AUDIT_CHECK_DECLARED`, `AUDIT_CHECK_MALFORMED`, `AUDIT_CHECK_FAILED` and promotion's `FACT_FAILED`.
  → applied: archive/T6.md L1; T8 "Already applied"
- N96 · 2026-09-27 · **jurisdictions** (EXTRACTION #1 REPORT 1, K139): the profile gains `systems[].links` `{item, file}` patterns, and the first profile's agenda system states REC-206's measured gateway shapes, so extraction R52 derives item-to-file membership on a real instance; a new profile key, so it goes to Bob with N61 and N65.
  → applied: archive/T8.md jurisdictions; K158, K227 (R38)
- N97 · 2026-09-27 · **legacy-checks** (CONTENT #1 REPORT 2): the `where`s of C-45.5, C-45.6, C-52.1–C-52.9 and C-80.3 name `src/content/index.mjs` (the regions its record lists).
  → applied: archive/T6.md L1; T8 "Already applied"
- N98 · 2026-09-27 · **text-chain** (CONTENT #1 REPORT 5): D-670's space rule for `extentCovers` and `readingPositionInExtent`, and `readingSource`'s `space` (built on the D-670 branch).
  → applied: archive/T9.md text-chain, every entry applied
- N99 · 2026-09-27 · **basis-versions**, **inquiry** (CONTENT #1 REPORT 7): the narrow act reads content's `extentRelation` (D-670's space rule, `envelope`), not the catalogue's.
  → applied: K336 (BASIS-VERSIONS #2 N99); archive/T10.md inquiry share ("if T7 left it"), every entry applied
- N100 · 2026-09-27 · **pdf-reader**, **extraction** (CONTENT #1 REPORT 4 (a), EXTRACTION #1): pdf-reader emits each page's box (D-374's producer half, `extractPdfStructure`'s `pageBoxes`, built on `land/worker/D-374`); then extraction R13/R30 carry `page_boxes` under `page_count`'s three-state rule, a re-read keeping the stored ones, so content R9 can bound a rectangle.
  → applied: archive/T9.md pdf-reader; K296 extraction N100 met
- N101 · 2026-09-27 · **pdf-reader** (EXTRACTION #1 REPORT 2): emits `image_unread` per image (D-665's producer half) and REC-206's link anchors (page rect), which extraction R9 and R52 read.
  → applied: archive/T9.md pdf-reader, every entry applied
- N102 · 2026-09-27 · **text-chain** (EXTRACTION #1 REPORT 3): `mergeTier2Text` carries `image_unread` markers (extraction carries them today).
  → applied: archive/T9.md text-chain, every entry applied
- N103 · 2026-09-27 · **capture** (EXTRACTION #1 REPORT 4): `readingInputs` and `acquireOp`'s reading inputs are unused since extraction reads the primary itself; drop them (a second read of the primary per acquire).
  → applied: archive/T7.md outcome
- N104 · 2026-09-27 · **text-chain**, **query-language** (QUERY-LANGUAGE #1 Q1, K143): text-chain states which step kinds are machine readings (`ocr`, `ai`), and query-language's `MACHINE_READ_KINDS` re-exports it instead of holding the list.
  → applied: archive/T9.md text-chain; K332 query-language N104
- N105 · 2026-09-27 · **id-spaces** (ENTITIES #1 Q1, K143): remove the legacy adapter at the foot of `idspaces.mjs` and its test, retiring R26 (K35): nothing in the plane imports it after T5's entities job.
  → applied: archive/T6.md outcome
- N106 · 2026-09-27 · **retrieval**, **query-language** (RETRIEVAL #1 Q1, K144): K75 (3)'s move of retrieval's projection columns and `fts_id` off `bundles` into a table of retrieval's own, done by both jobs together (query-language's compiled statements read `b.<column>` and key the text index through `b.fts_id`); record-core R37's note then goes.
  → applied: K332 (query-language R25); archive/T11.md retrieval N283 (bundle_projection, K354)
- N107 · 2026-09-27 · **queue** (PROGRESSIONS #1, K147): aggregate progressions' `cardinality_exceeded` finding into its proposal items with its own wording (it is not "required and absent").
  → applied: archive/T7.md outcome
- N108 · 2026-09-27 · **extraction** (ENTITIES #1 REPORT 6): state `readings`, `reading_refs`, `reading_ref_terms` as a read contract (entities and connections join them) and the term fold in Provides; `capture_text_skipped` joins it (retrieval's frontier and `contentAxis` read it: RETRIEVAL #1 REPORT 6), and D-672 is whole once extraction's unit writer names sheets (retrieval R25 is met over `sheet-range` units).
  → applied: archive/T7.md outcome; K179
- N109 · 2026-09-27 · **capture** (RETRIEVAL #1 REPORT 7): state a read contract on `links` (`source_capture`, `address_norm`, `partition`, `first_seen`), which retrieval's frontier R40 reads.
  → applied: archive/T7.md outcome; K175
- N110 · 2026-09-27 · **entities** (RETRIEVAL #1 REPORT 8): the read contract extends to `entities(entity_id, at)`, which retrieval's frontier R46 reads.
  → applied: K332 (ENTITIES #2)
- N111 · 2026-09-27 · **provenance** (RETRIEVAL #1 REPORT 9): R48's contract names `register.registered` and `captured_locators.address_norm`, which retrieval reads (§5.1's cause, R41).
  → applied: archive/T7.md outcome; K173
- N114 · 2026-09-27 · **affordances** (OBSERVATION-LOG #1 REPORT 2): D-681's NON_ACTS row for `op=leadlist`. **queue**: re-export `CONDITION_KINDS` from `queuestate.mjs` (its REPORT 5).
  → applied: archive/T7.md affordances + queue; T8 "Already applied"
- N115 · 2026-09-27 · **affordances** (LEGACY-INDEX #3 REPORT 1; with N84): a published act or a NON_ACTS row for `connectionassert`, `filemembershipstore`, `filemembershipjudge`, `themewithdraw`, `leadlist`, `aliaswithdraw`, `relationwithdraw`, `contentcrop`, and each new mutating op's rung or stated absence (`rung-ladder` FORWARD arm, exact count 130).
  → applied: archive/T7.md affordances; T8 "Already applied"
- N116 · 2026-09-27 · **record-core** or **monitoring** (LEGACY-INDEX #3 REPORT 5; N21's remainder): a store route answering the instance's active profiles to the Worker, which `index.mjs` passes to `identify`/`doctypeFor`/`assess` in op=monitor; or N21 moves with monitoring's extraction of op=monitor, which runs where the setting is.
  → applied: archive/T8.md monitoring N116; code monitoring/index.mjs:371-392
- N117 · 2026-09-27 · **content** (LEGACY-TESTS #3 REPORT 7): `markStale` (R41) reads every row a re-read stales, unbounded, and notifies per row inside promotion's transaction (the store's version was one COUNT and one UPDATE, REC-66/D-227); bound it before inquiry registers `onStale` in T6. **record-core**: `auditPass`'s cursor read carries no SQL `LIMIT`.
  → applied: archive/T6.md record-core; T7.md content; K180
- N118 · 2026-09-27 · **legacy-checks**, **promotion**, **progressions**, **observation-log**, **bias** (LEGACY-TESTS #3 REPORTs 8–11): every `PROMOTION_CHECKS` row (C-86.5–C-86.14 and two more) gains its `where`; C-100's `where`s name marked regions in one grammar (no `fn1|fn2`), and C-100 stops minting rows for codes other modules mint for other conditions (`NOT_FOUND`, `NO_ENTITY`, `NO_KEY`, `NO_LABEL`, `NO_SHA`, `NO_SUCH_ENTITY`, `NOT_A_DISPOSITION`); `AI_LOG_STATE_UNKNOWN` (C-22.1) is minted for a second condition (a look stating `NEVER_LOOKED`, K148): a code of its own or C-22.1 reworded; `BIAS_REFUSED`'s `where` names the public `promotionCheck`. *(Its observation-log share also: LEGACY-CHECKS #2 REPORT 5: mint `AI_LOG_NEVER_LOOKED_STORED` at region `is-never-looked-stored` in `checkObservation` (C-22.17).)*
  → applied: archive/T6.md legacy-checks+promotion; K332 progressions/observation-log/bias
- N119 · 2026-09-27 · **content** (LEGACY-TESTS #3 REPORT 14): R32 states the crop's wire encoding (base64, `bytes_base64` as D-419 answered), and the module or the route encodes it; through the plane it arrives today as a JSON object keyed by index.
  → applied: archive/T7.md outcome; K179
- N122 · 2026-09-27 · **capture** (K155): `captureOf` keeps the first instance made for a storage whatever options later callers pass, so an earlier module creating it without `env` silently strips the plane's renderer; a later call that supplies `env` (or a governor) must be adopted or refused loudly, tested at the interface.
  → applied: archive/T7.md outcome; K175
- N113 · 2026-09-27 · **observation-log** (RETRIEVAL #1 REPORT 12): state `DOCUMENT_EVIDENCE_IS_ONE_SIDED` in its vocabulary, beside content's, meaning's and the internet's, so retrieval R41 can publish the document level's sidedness (today `evidence_one_sided: true`, all three causes live). A requirement change: for Bob with the next observation-log entry.
  → applied: K306 (Bob); K332 (OBSERVATION-LOG #2, RETRIEVAL #2 R41)
- N123 · 2026-09-27 · **membership**, **capture-sources** (K159): membership offers a revocation notice (a registration, the K31 pattern) and capture-sources registers it, so a revoked member's `member` credentials are destroyed at once, not at the next read.
  → applied: K288, K290 (membership R79, capture-sources)
- N124 · 2026-09-27 · **legacy-tests** (ID-SPACES #2 REPORT R2): `bio-plane/test/nc-rec203.mjs` line 16 and `rec203-idspaces.test.mjs` line 56 still describe id-spaces' legacy adapter, removed in T6 (N105; R26 retired); prose only, correct them.
  → applied: T8 "Already applied"; prose fixed (test/nc-rec203.mjs:17-18, rec203-idspaces.test.mjs:55-56)
- N125 · 2026-09-27 · **connections** (LEGACY-CHECKS #2 REPORT 1): `src/connections/themes.mjs` re-exports C-81.11–C-81.14 from the catalogue's `THEME_CHECKS` and deletes its `THEME_WITHDRAW_CHECKS` copy (the guard fails 8 lines until then).
  → applied: K332
- N126 · 2026-09-27 · **entities** (LEGACY-CHECKS #2 REPORT 9): region `is-alias-named` (4 lines, 99 characters) is under the guard's floor; widen it to the whole refusal.
  → applied: K332
- N127 · 2026-09-27 · **legacy-store** (its next extracting job; RECORD-CORE #3 REPORT R2): `auditPass`'s `sighted` set is still built by an unbounded SELECT in `store.mjs` (N70's other half); page it as record-core's cursor read now is (N117).
  → applied: archive/T8.md publication N127; K240
- N131 · 2026-09-28 · **connections** (CAPTURE #3 REPORT J2.1): `bio-plane/test/m/connections/factory.test.mjs` line 18 pins capture's old first-caller-wins memo, which capture R58 (K175) now refuses; the arm asserts the refusal or goes (m/connections reads 59/1 until then).
  → applied: K332
- N132 · 2026-09-28 · **host-governor** (CAPTURE #3 REPORT J2.4): `governorOf` keeps the first instance per storage with the `env` it was first given (N122's pattern): adopt a defaulted option from a later caller, refuse a differing one, tested at the interface.
  → applied: archive/T9.md host-governor; K287
- N133 · 2026-09-28 · **provenance**, **capture** (CAPTURE #3's deferral): provenance R48 states the whole-second spelling of `first_retrieved`/`last_retrieved`; then capture bounds `resolveLinks`' per-link read of the target's direct captures, deciding the bracket in SQL.
  → applied: archive/T9.md provenance + capture; K290
- N134 · 2026-09-28 · **observation-log** (EXTRACTION #2 REPORT J2.1; AI-RUNS #1 REPORT J2: also `vocabulary.mjs` 416 and `CONTENT_AXIS_STATES.indexed_none`'s text): `CAPTURE_TEXT_UNIT_CONTAINERS` (`src/observation-log/index.mjs` 52) gains `xlsx`, `ods`, `csv`, and the reason at 249 and the vocabulary's sentences (`vocabulary.mjs` 271, 416) are corrected, so a workbook's `indexed` content-axis row reads indexed now extraction writes its `sheet-range` units (K179); retrieval R25's axis word holds then.
  → applied: K332
- N135 · 2026-09-28 · **entities** (CONTRADICTION #1 Q, K181): state `resolutions` (`capture_sha`, `entity_id`, `established`: 1 exactly when R34 holds of the grade) as a read contract in Provides, with its test; contradiction joins it from T7.
  → applied: K332
- N138 · 2026-09-28 · **case-authoring** (AI-RUNS #1 Q1, K181): at its extraction it takes `searchedSection`, `SEARCHED_LEVEL_OUTCOMES` and the `SEARCHED_SUBJECT_SOURCES` re-export from `airun.mjs` (N69's ai-runs share), re-pointing `store.mjs` 360/7989, and ai-runs' copy goes.
  → applied: archive/T8.md case-authoring share; K335/K336 ai-runs (AI-RUNS #3)
- N139 · 2026-09-28 · **observation-log**, **extraction** (AI-RUNS #1 Q2, K181): D-375 (built on `land/worker/D-375` @ 9a5df6e6) is theirs: `contentObservationsFor` and the reading's character count; `nc-d375`, `observation-content` follow in legacy-tests.
  → applied: K296 extraction, K332 observation-log; legacy-tests follow-ons not among T11's closing reds (archive/T11.md)
- N140 · 2026-09-28 · **capture** (CAPTURE-REQUESTS #1 Q3, K181): the in-process `captureRequest` arm accepts and acts on `{credential, heldSha, origin}`: the conditional fetch with the held capture's validators (capture-requests R39), the credentialed fetch and its provenance marking (R41), the `sweep` origin (R38).
  → applied: archive/T9.md capture; K287
- N141 · 2026-09-28 · **capture-requests** (its Q4, K181): R38's promotion at `collected` (a plane-composed `information` bundle through `promotion.promote` under `token:daemon`, id `allocId("INFO", year)`), deferred from T7 as new composition of its own size.
  → applied: K336 (CAPTURE-REQUESTS #2)
- N142 · 2026-09-28 · **membership**, **inquiry**, **retrieval**, **promotion** (maps review MAPS67 items 1, 2, 4, 5, 8, 10; K181): Provides gaps the layer-6 jobs use: membership `inSight` (built, unnamed), `bundleGate`/`bundleRedactor` (neither; the jobs gate with `viewerPredicate`); inquiry `subjectEntityOf`, `onRaised`, `member_user_agent`'s read (INQUIRY #1 proposes them in T7); retrieval `answerChanged`, promotion `INLINE_MAX` (exported, unnamed).
  → applied: K230/K274 promotion INLINE_MAX; K285 membership inSight; K332 retrieval R59; archive/T10.md inquiry ("if T7 left it")
- N143 · 2026-09-28 · **bias** (AI-RUNS #1 Q1, K182): delete `bias/interim.mjs`, its re-export (`bias/index.mjs` 39) and its test "R33 (interim)" (`test/m/bias/debt.test.mjs`), unused since ai-runs registers its own work products (K146's remainder).
  → applied: K332 (BIAS #2)
- N145 · 2026-09-28 · **provenance** (K182): a test naming R48's `authored` column, which basis-versions R39 joins.
  → applied: archive/T9.md provenance, layers 1-4 every entry applied
- N146 · 2026-09-28 · **membership** (CITATION #1 REPORT J1.11): state the one no-such-project answer (`#noSuchProject`) as a service; `citation` and legacy-store hold byte-identical copies (K57) until then.
  → applied: archive/T9.md membership; K336 (CITATION #2); legacy-store copy via N208 (K307)
- N147 · 2026-09-28 · **promotion**, **legacy-tests** (CITATION #1 REPORT J1.9; STRENGTH #1 J5; REEVALUATION #1 REPORT J2.8): `CATALOG_VERSION` takes a MINOR stamp for layer 6's and layer 7's departures (with reevaluation's C-10.1, C-80.1, C-80.2) from the catalogue (citation's C-33.15–C-33.19, C-33.39, C-45.7–C-45.10; strength's C-30, C-71, C-32.9; ai-runs' 22 rows and its new C-109.1; the others the layer-6 records name), 1.35.0's precedent; legacy-tests re-pins the census.
  → applied: K233 (1.37.0), archive/T8.md outcome (1.38.0) + legacy-tests re-pins
- N148 · 2026-09-28 · **legacy-checks** (CITATION #1 REPORT J1.12): the prose header of `CONTENT_EXTENT_CHECKS` still names C-45.7–C-45.10 as that family's; reword it.
  → applied: archive/T8.md L1; header reworded (bio-checks.mjs:9271-9274)
- N149 · 2026-09-28 · **inquiry** (INQUIRY #1 J3; K189): R44's recording of `member_user_agent` at the inquiry's creation (SOURCE-ACCESS's amendment), not yet built.
  → applied: K334, K336
- N151 · 2026-09-28 · **extraction**, **inquiry** (INQUIRY #1 REPORT J2.4): `reading_text_source.chain`, which inquiry's earned registry reads, joins extraction R58's read contract, or inquiry reads the chain through an extraction service.
  → applied: K293/K296 (extraction R58 reading_text_source)
- N152 · 2026-09-28 · **strength**, **publication** (INQUIRY #1 REPORT J2.5): each replaces the registration legacy-store makes for it in its constructor with its own (`inquiry.onGrounded("strength", …)`; `promotion.registerFact("publishedRegistry", …)` at publication's extraction).
  → applied: archive/T8.md publication share; K336 (STRENGTH #2)
- N153 · 2026-09-28 · **ai-runs**, **agent-worker** (AGENT-WORKER #1 REPORT 3): `op=airun` publishes the run's `state` (ai-runs R12 stores it), so a resumed model segment resumes the table where the last stopped; agent-worker then reads it. Done in T7 by AI-RUNS #2 (R19's `state`, K194); agent-worker's read of it remains.
  → applied: K194 (ai-runs side, T7); K336 (AGENT-WORKER #2 R11)
- N156 · 2026-09-28 · **skills** (AI-RUNS #2 Q J5.4, K194): `skillpack.mjs` re-exports ai-runs' `checkSkillVersion` (ai-runs R8) and deletes its own copy (546); C-22.7 moves from the catalogue's `AI_RUN_CHECKS` to skills (its R25) with `skilldoctrine.mjs`' load re-pointed in the same change; `skilldoctrine.mjs`' `DEPLOYMENT_SEQUENCE` copy re-exports `src/ai-runs/deployment.mjs` (`enforced_by: ["C-109.1"]`), `skillsequencing`'s pins moving with it (AI-RUNS #2 REPORT J6.3); agent-worker's `MODES` pin and plane mocks meet C-109.1 (J6.4). Unless SKILLS #1 does it in T7 after ai-runs merges.
  → applied: K335/K336 (SKILLS #2)
- N158 · 2026-09-28 · **legacy-ui** (AI-RUNS #2 J7): the DEC-49 guard's `FLOOR.regions` in `civicos-ui/check-refusal-codes.mjs` moves 246 → 247, its growth named as ai-runs' C-109.1 region (`is-airun-open-mode`).
  → applied: K201 → T7 legacy-tests; archive/T7.md forwarded list, layer 11 closed
- N159 · 2026-09-28 · **legacy-checks** (INTENT #1 Q2, K198): admit `aspiration` (`ASP-<year>-NNNN`, schema `aspiration@1`, states `held → retired`) and `goal` (`GOAL-<year>-NNNN`, `goal@1`, `open → closed`) to `OBJECT_TYPES`, the known schemas and `STATES`, so C-2.5 stops reporting intent's two document types as unknown in the audit and the gate; intent's own step enforces their machines from T7.
  → applied: K229
- N160 · 2026-09-28 · **inquiry** (REEVALUATION #1 Q6, K199): R42's `onRaised` carries a failing listener as `listeners_failed` through `dispose` and `divide` (inquiry wraps the listener's array as `{source, since, raised}`, so reevaluation R8's field cannot reach those replies without it).
  → applied: K336 (INQUIRY #2)
- N161 · 2026-09-28 · **content** (REEVALUATION #1 REPORT J2.6): state `noticeForRow(row, viewer, memo)` in content's Provides (reevaluation R11 and R14 call it; R29–R31 name only `passageNotice`), with its test.
  → applied: K292
- N162 · 2026-09-28 · **record-core** (REEVALUATION #1 REPORT J2.7): R37's `files` read contract adds `content`, which reevaluation R12, inquiry, retrieval and run-productions scan in SQL.
  → applied: K233
- N163 · 2026-09-28 · **publication** (REEVALUATION #1 REPORT J2.3): at its extraction, (a) R14's last clause: a published case's owners are told once per affected or undetermined cited part (reevaluation reads the case's cited parts and owners through publication); (b) `publishCase`'s edition arm calls `reevaluationOf(ctx).raise({target, source: "edition", since, edition, viewer})`, now in the store, and moves with it; (c) publication provides `publishedRegistry` itself (N152's half).
  → applied: archive/T8.md publication (b),(c); (a) via N210, archive/T11.md met (K366)
- N164 · 2026-09-28 · **scheduler**, **monitoring** (REEVALUATION #1 REPORT J2.4): a caller of reevaluation's sweep `raiseNotices({limit, after})` (op `reevaluationraise`), following `cursor` to null after a newer capture is read.
  → applied: archive/T8.md scheduler + monitoring; K259 (3)
- N165 · 2026-09-28 · **actions**, **run-productions**, **citation** (REEVALUATION #1 REPORT J2.5; D-579, D-595): a case's `cites`, an action's legs and a run's suggested legs raise reevaluation notices only once each module pins its capture and names a holder; each states it when its job next runs.
  → applied: archive/T8.md actions; K336 citation ("held") + run-productions
- N166 · 2026-09-28 · **capture**, **monitoring** (the T8 map re-check, K206): capture states `source_reachability` as a read contract in Provides, with its test; monitoring's `#monitorPending` and `#monitorTick` read it by name today.
  → applied: K235
- N168 · 2026-09-28 · **legacy-ui** (INTENT #1 REPORT J4.1): `civicos-ui/test/` fixtures that promote a project with no `objective` (`project-workspace`, `published-index-pair`, `several-cases-choice`, `conclude-reading`, `statement-ack`, `review-copy`) are refused `NO_OBJECTIVE` since intent R1; each states one.
  → applied: code: all six civicos-ui/test fixtures state `objective` (e.g. conclude-reading.test.mjs:196-198, review-copy.test.mjs:189)
- N169 · 2026-09-28 · **capture-requests** (INTENT #1 REPORT J4.7): a read of one request by id in Provides, so intent's `pursuitOf` (R14) reads outcomes exactly rather than through a bounded list.
  → applied: K336 (CAPTURE-REQUESTS #2)
- N174 · 2026-09-28 · **observation-log** (QUEUE #1 REPORT J2.3): `src/observation-log/vocabulary.mjs` 8–9, 1346–1348 and the refusal at 1599 name `queuestate.mjs` as the vocabulary's home; since N114 it is observation-log's, re-exported by queue: name it.
  → applied: K332
- N176 · 2026-09-28 · **affordances** (AFFORDANCES #1 REPORT J4.1–2, at its extraction of `affordanceFacts`): R14's `cites_in` passes counts `{confirmed, severed}`, not the citing bundles' ids (R16); R18's `roster.owner_floor_clear` counts committed owners only (membership R35), so `projectleave` is not offered to an owner whose co-owners are all leaving.
  → applied: K310 (N176 R16 met)
- N177 · 2026-09-28 · **control-plane**, **legacy-index**, **legacy-tests** (AFFORDANCES #1 REPORT J4.5–6): the control plane's `decorateAct` (index.mjs) is replaced by affordances' `decorate(act, gate)` (R11), passing `{needs, mode}`; and its own test passes its op table to `unaccounted` (R12), retiring `affordances.test.mjs`' and `rung-ladder.test.mjs`' source scans of NEEDS/OPS.
  → applied: archive/T8.md outcome: legacy-index N177 (K262); legacy-tests' source-scan share (K266)
- N178 · 2026-09-28 · **intent**, **scheduler** (T8 map re-check, K217): scheduler R10 ranks by "the priority of the aspiration", which no intent service offers (R6 `gaps` names the gap, not a priority); and intent's `ageSurfaced` (R17) and reevaluation's `raiseNotices` (R14), scheduler's new consumers (N164, N167), have no due or wake service. The T8 scheduler job proposes, in a QUESTION, the reads it needs; BOB folds them into intent's and reevaluation's Provides (wording, provider side) and schedules their builds.
  → applied: K225 (provider side folded); archive/T8.md intent, reevaluation, scheduler shares
- N179 · 2026-09-28 · **intent** (LEGACY-TESTS #4 REPORT J3.1, confirmed by BOB): a T7 regression: `intentOf(ctx)` (legacy-store 743) runs before legacy-store's `progressionsOf(ctx, {env})` (761) and builds progressions with no `env` (`intent/index.mjs` 1146); the per-host memo keeps that first instance, so progressions R16's configured clock (`env.BIO_NOW_MS`) is ignored on the plane (`overdue-successor` PART 2 red). Intent's fix (lazy `() => progressionsOf(host)`, or the plane's `env`); T8's layer 7 (K218).
  → applied: archive/T8.md outcome: N179 met
- N180 · 2026-09-28 · **intent** (LEGACY-TESTS #4 REPORT J4; LEGACY-INDEX #4 REPORT J1.2): its refusal rows break DEC-49's one-code-one-row rule. (1) `src/intent/checks.mjs` numbers its rows C-110.1–C-110.27, but K199 gave family C-110 to reevaluation (`REEVALUATION_ACT_CHECKS` holds C-110.1–C-110.9). Intent renumbers into a family of its own, which BOB assigns (C-111 is the next free). (2) `NO_STATEMENT` is two rows: intent's C-110.10 and the catalogue's C-33.14 (`publishCase`). Intent mints a code of its own (refusal-wire 38/4). (3) The guard's other intent lines: `where`s in a grammar the guard does not read (`mint.X`, `setCondition|check`, `check >` for `#checkProject`/`#checkPursuit`); region `is-dead-end-noted` is under the region floor; arm G's `BAD_GRADE`, `NO_STATEMENT` and `NO_SUCH_PROJECT`.
  → applied: K238; archive/T8.md intent
- N181 · 2026-09-28 · **intent** (LEGACY-TESTS #4 REPORT J4, bounds family): (1) five unbounded reads: `#departures`, `#measure`, `#triaged`, `pursuitOf` and `watchSet`. `#measure` also joins the amplification class (derivation-bounds 69/4). (2) `op=pursuit` publishes collections built from those reads. (3) `doc.mjs` restates `GRADES` and should import the catalogue's (hygiene C). (4) The `intent_triage_key` index is unused: airuns 53/1 has a ceiling of 13 and measures 14. A query uses it, or the index goes.
  → applied: K239 (published bounds stated)
- N182 · 2026-09-28 · **reevaluation** (LEGACY-TESTS #4 REPORT J4): (1) the `where`s of C-110.1–C-110.5 name `adoptVersion`/`keepVersion > is-version-choice`, but that region is in `#choiceSubject` (index.mjs 830–843). (2) `#records` and `raiseNotices` are unbounded reads (derivation-bounds). (3) `op=reevaluationnotices` caps its limit, but no test drives the cap (bounds 203/3, one arm shared with capture's N187). (4) `adoptVersion`'s default is newly on meaning-bounds' unjudged D-240(b) list (94/2, N70's class): judge it or bound it.
  → applied: archive/T8.md reevaluation N182 (1)-(4); K239 REEVALUATION #2 COMPLETE
- N183 · 2026-09-28 · **inquiry** (LEGACY-TESTS #4 REPORT J4): (1) C-106's `where` names `dispose > is-dispose-shared`, but the region is in `#dispose`. (2) Unbounded reads: `projectsDrawingOn` (a second copy beside basis-versions' own `projectsDrawingOn`, N64), `staled` and `exclusionsNaming`. (3) `exclusionsNaming` has no caller and duplicates legacy-store's `excludedBy`, so it is deleted.
  → applied: K336 (INQUIRY #2); (3) superseded by K335 (kept, bounded)
- N184 · 2026-09-28 · **strength** (LEGACY-TESTS #4 REPORT J4): (1) `#walk` names an ungraded version leg with the record's own `leg.why` before the arithmetic's reason (index.mjs 200). strengthpair 90/1 requires the branch to say "the leg carries no grade"; the record's reason is published at the top level in `ungraded`. The walk states the arithmetic's own reason (K220). (2) `VERSION_LEGS_MAX` (index.mjs 51) restates basis-versions' `BASIS_VERSION_LEGS_MAX`, so strength imports it (bounds, 2 reds). (3) C-107's `where`s name `#refusePairComposed`, but the function is the module function `refusePairComposed` (checks.mjs 98, 113).
  → applied: K336 (STRENGTH #2)
- N185 · 2026-09-28 · **basis-versions** (LEGACY-TESTS #4 REPORT J4): `src/basis-versions/schema.mjs` 52 lost D-423's comment on `grade_axis` naming the three axes of `GRADE_AXES` (hygiene 1333/2); restore it.
  → applied: K336 (BASIS-VERSIONS #2)
- N186 · 2026-09-28 · **basis-versions**, **inquiry**, **legacy-store** (LEGACY-TESTS #4 REPORT J4): D-484's one governed site (C-33.40, `NO_BASIS`) is now two live copies: inquiry's `actNoBasis` (index.mjs 104) and basis-versions' region `is-act-no-basis` (index.mjs 65). basis-versions imports inquiry's copy (inquiry comes first in the order) and deletes its own. legacy-store deletes its dead `actNoBasis` (store.mjs 555, no caller). legacy-checks then re-points C-33.40's `where` (N192).
  → applied: K336 (inquiry, basis-versions); K341 (legacy-store done T9); re-point via N192
- N187 · 2026-09-28 · **capture** (LEGACY-TESTS #4 REPORT J4): `op=navchanges` caps its `limit`, but no test drives the cap (bounds 203/3, one arm shared with reevaluation's `reevaluationnotices`). A test at capture's interface drives it.
  → applied: K236; archive/T8.md capture
- N188 · 2026-09-28 · **capture-requests** (LEGACY-TESTS #4 REPORT J4): (1) `waitSource` (index.mjs 792) is an unbounded read (derivation-bounds). (2) `CAPTURE_FETCH_FAILED` and `CAPTURE_REQUEST_NOT_RETRYABLE` are never driven out of the plane (capturerequests' DEC-49 floor arm). `capturerequestretry` is routed now (LEGACY-INDEX #4), so capture-requests' tests drive both through it. (3) R6's clock is per instance: a request's expiry ignores its own `at`, and one `BIO_NOW_MS` moves every request together. scheduler FL-4 therefore cannot expire two requests apart (scheduler 47/4); a test clock seam per request is needed.
  → applied: K333, K336 (CAPTURE-REQUESTS #2)
- N189 · 2026-09-28 · **capture-sources** (LEGACY-TESTS #4 REPORT J4): (1) the `CAPTURE_CREDENTIAL_CHECKS` rows (C-105, credentials.mjs 36) carry no `where`. (2) `NO_SUCH`'s translation is 19 characters, under the guard's floor. (3) `NO_KEY` and `NO_SUCH` are each minted for two conditions, and each condition needs a code of its own. (4) `credentialList` (339) and `credentialsForFetch` (271) are unbounded reads.
  → applied: archive/T9.md capture-sources, every entry applied (K274)
- N190 · 2026-09-28 · **ai-runs** (LEGACY-TESTS #4 REPORT J4): `ai_runs.rerun_of` is neither published by a reader nor declared withheld (run-conditions P1, P6: the matrix wants a disposition for every stored column). ai-runs states one.
  → applied: K335/K336 (AI-RUNS #3)
- N191 · 2026-09-28 · **ai-runs**, **legacy-store** (LEGACY-TESTS #4 REPORT J4): D-486's hidden-run subtraction is written twice: ai-runs' `#hiddenRunTail` and legacy-store's `#hiddenSets` (store.mjs 13202). One spelling stays and is read by the other (observation-log 130/1, observation-content 74/1: J5 wants one shared predicate).
  → applied: K335 (ai-runs), K341 (legacy-store)
- N193 · 2026-09-28 · **legacy-store** (LEGACY-TESTS #4 REPORT J4; with N89): project-sight 11g lists five id-naming reads as unclassified: `archivelookup` and `pdfstructure` (N89, N112) and three more, `connectionsasserted`, `contentcrop` and `filemembership`. Each goes into `PROJECT_NAMING_READS` or `_NOT` (store.mjs 14195, 14207), with N89's placement (242/1).
  → applied: K307
- N194 · 2026-09-28 · **run-productions** (LEGACY-TESTS #4 REPORT J4): `interim.mjs` (22) still reads `ai_runs` in SQL, in an arm with no caller (run-conditions W6). The arm is deleted, or the read goes through ai-runs R28's `runFor`.
  → applied: K336 (RUN-PRODUCTIONS #2)
- N195 · 2026-09-28 · **membership** (LEGACY-TESTS #4 REPORT J4): region `is-hosting-access-holders` (index.mjs 203–205) holds one line and is under the guard's floor. Widen it to the whole refusal (N126's pattern).
  → applied: archive/T9.md membership (K274), every entry applied
- N196 · 2026-09-28 · **citation** (LEGACY-TESTS #4 REPORT J4; N70's class): `#document` (index.mjs 135; called at 247 and 446) is newly on meaning-bounds' unjudged D-240(b) list, twice (94/2). Judge it or bound it.
  → applied: K336 (CITATION #2)
- N199 · 2026-09-28 · **intent** (LEGACY-TESTS #4 REPORT J5.1–2, confirmed by BOB; R23, hidden projects): hidden-project material reaches a non-member (gate-reads, red): (1) `proposals()` serves a gap triaged `defer` with `project_id` NULL in `set_aside` to every viewer (`intent/index.mjs` 846), though its key names the hidden project: a triaged gap carries its project, or is gated on the project its key names; (2) `op=pursuit`, `op=aspirationcontacts` and `op=goal`'s pointer ask `inSight` of the aspiration's own id, never of its owning project, so a `scope: project` aspiration's owner and statement reach a non-member. R23 is met at every read and act. First in T8's layer 7 (K222).
  → applied: archive/T8.md outcome: N199 met; K239
- N200 · 2026-09-28 · **reevaluation** (LEGACY-TESTS #4 REPORT J5.3; Bob's ruling asked, K222): `op=reevaluationnotices` serves a notice's `newer_capture`, `grade` and `affects` for a capture filed in a hidden project to any viewer who sees the holder, where `op=versionnotice` withholds that version. Recommended: the notice withholds those three fields (answers them as absent) unless the viewer sees the newer capture's project; R14 states it. *(Bob ruled as recommended, 2026-09-28, K224; T8 carries it, layer 7.)*
  → applied: K224; archive/T8.md outcome: N200 met
- N201 · 2026-09-28 · **run-productions**, **content** (LEGACY-TESTS #4 J6, K220's retired extract arms): run-productions' tests name the STRENGTHENS and NO_PROPOSALS sentences, the op's cap and the `reading_refs` write at its interface; content's a member's leg on a machine-minted content row. A run's `mints` budget is testable only once extract deploys (ai-runs, run-productions).
  → applied: K336 (run-productions); K326 (content share)
- N203 · 2026-09-28 · **citation** (LEGACY-CHECKS #3 J3.3): `test/m/citation/invariants.test.mjs` R5 pins the retiring types as `["bias","information"]`; `aspiration` now retires too (N159). R5 covers retired aspirations, or the test pins a sample.
  → applied: K336 (CITATION #2)
- N204 · 2026-09-28 · **basis-versions** (LEGACY-CHECKS #3 J3.4): `#moveVersionState` relays promotion's `FACT_UNAVAILABLE` (line 666), which `VERSION_ACT_CHECKS` does not hold; and C-33.40's duplicate `is-act-no-basis` marker is an orphan until N186 deletes it.
  → applied: K336 (BASIS-VERSIONS #2)
- N205 · 2026-09-28 · **legacy-store** (LEGACY-CHECKS #3 J3.5): the dead `#groupUndetermined` (store.mjs 13807, no caller; C-64.1 now names inquiry's) is deleted.
  → applied: archive/T9.md legacy-store N205; outcome "the deletions" (K307)
- N206 · 2026-09-28 · **legacy-checks** (PROMOTION #6 J2.1–2, K231, K233): catalogue rows for `CASE_CATALOGUE_FAILED` (`src/gate.mjs runCaseGate`, whole function; its translation proposed in J2.1) and for `STEP_DECLARED`, now minted at one site (`src/promotion/index.mjs stepDeclared`); `LISTENER_MALFORMED`'s and `LISTENER_DECLARED`'s rows wait on N202.
  → applied: archive/T9.md L1 legacy-checks, every entry applied
- N207 · 2026-09-28 · **bias** (RECORD-CORE #4 REPORT J2): `#textAtSha` (bias/index.mjs 139, called 352) keeps its own copy of record-core R60's lookup, reading the bundle's whole image and hashing every snapshot; it calls `record-core.textAtSha` instead (efficiency; one computation of the pinned bytes).
  → applied: K332 (BIAS #2)
- N208 · 2026-09-28 · **membership**, and each module refusing `NO_SUCH_PROJECT` (INTENT #2 J1.3, K238): one condition (a project absent or unseen, answered as absent) minted at many sites (membership, citation, promotion, strength, intent, legacy-store). Membership provides the one helper, the sites call it, and the one row is membership's (K231); intent's row stands until then. Strength's `BAD_GRADE` (index 741) needs its own row. `NO_SUCH_ENTITY` is the same case (8 sites across entities, progressions and intent): entities holds the one helper and row (INTENT #2 J2).
  → applied: K286/K307 (membership, promotion, legacy-store T9); K332/K336 (entities, progressions, citation, strength T10); K361 (intent T11)
- N209 · 2026-09-28 · **intent** (INTENT #2 J3, deferred): `#aspirations` walks every aspiration document and `contacts` pairs them, unbounded; BOB words a published bound into R12 and R13 first, then intent's job applies it.
  → applied: K338, K361
- N210 · 2026-09-28 · **publication**, **reevaluation** (PUBLICATION #1 J1.2, K240): N163 (a), telling a case's owners once per affected cited part, needs a publication read of a case edition's cited parts and owning projects (proposed `caseCitedParts({case, edition?})`); BOB words it, and reevaluation calls it.
  → applied: K359, K361, K366
- N213 · 2026-09-28 · **record-core**, **provenance**, **connections** (PUBLICATION #1 J4.2, RATIFICATION #2 J6): read contracts publication and ratification read in their own SQL but their providers do not state: record-core `files.bytes`, `files.blob_sha`, `bundles.bundle_sha`, `row_version`, `created`, `last_updated`, the `manifest` table, `history.created`; provenance `register.bytes`, `register.author`; connections `refs` (`target_id`, `kind`). BOB states them (R37, R48, a connections contract) or the providers give export reads.
  → applied: archive/T9.md record-core + provenance; K332 connections R58; K352 marks struck
- N215 · 2026-09-28 · **content** (CONSEQUENCES #1 J1.2, K249): consequences R2 reads an operand's passage text, which content's Provides does not offer; content provides `passageText(contentId)` (the typed text for a typed row, else extraction's units at the row's extent); until then consequences answers such a part `undetermined` ("held in a form not read").
  → applied: archive/T9.md content N215; K277
- N216 · 2026-09-28 · **legacy-store** (CONSEQUENCES #1 J2, K250): the durable object constructs the layer-9 modules built with no `from` (`consequencesModule`, `escalationOf(ctx)` (with conformance, consequences, actions and filings on the same host), `filingsOf(ctx, deps)` with `actions`, `conformance`, `standards`, `consequences` and `producingGroup` (legacy-store's `#producingGroup`), and any other) and spreads their ops into its op map, as it does reevaluation's; legacy-store's own job (T9) adds those lines.
  → applied: K307 (LEGACY-STORE #1)
- N217 · 2026-09-28 · **legacy-checks**, **legacy-tests**, and each module minting a generic code (ESCALATION #1 J2.4, with N208): `NO_REASON`, `NOT_A_PARTICIPANT`, `NO_SUCH_DETERMINATION`, `DETERMINATION_SUPERSEDED`, `NO_SUCH_ACTION` are minted by several modules, each for its own condition with its own row; BOB rules, with N208, whether such a code is one condition with one helper (K231) or each module's own code.
  → applied: K275 ruling; actions R43 (K370, K371); remaining codes carried by T12 as N309/N312 (current.md)
- N218 · 2026-09-28 · **strength** (CONFORMANCE #1 J2.1, against its R6): `strengthOf(host)` with no `deps.inquiry` builds an instance whose walk throws (`#legsOf` reads `this.inquiry.basisFor` of undefined), so `inquiryStrength` throws instead of answering; its factory reaches `inquiryOf(host)` lazily as the others do (K61).
  → applied: K336 (STRENGTH #2)
- N219 · 2026-09-28 · **record-core** (ACTIONS #1 J2.3): no lease release; actions releases by `acquireLease(id, who, 0)` (R16). record-core provides `releaseLease(bundleId, actor)`.
  → applied: K277, K352 (mark struck)
- N220 · 2026-09-28 · **standards** (FILINGS #1 J5): `standardsOf` does not migrate its tables at construction, so a user's fixture calls `migrate` itself; it migrates at construction, as the other factories do.
  → applied: K371 (STANDARDS #2)
- N222 · 2026-09-28 · **monitoring, runtime-limits** (MONITORING #1 J1, K259): R23, R45, R30 (the two ticks in process, fired by the scheduler's alarm without `env.SELF`, `configured()` true on every instance) are not built; the old battery's "inert unless configured" suites (d334, daemon-token, archive-monitoring, monitor-cadence) move with it.
  → applied: K373 (marks R23, R45, R30 struck)
- N223 · 2026-09-28 · **capture-requests, ai-runs, calibration** (SCHEDULER #1 J1.4, K259): each offers a post-write notice (as retrieval R52) for scheduler R9's producers: a capture request filed, a run opened, a calibration subject registered, a calibration signal.
  → applied: K335/K336 (ai-runs, capture-requests), K353 (calibration), K373 (scheduler)
- N224 · 2026-09-28 · **monitoring, capture-requests, bias** (SCHEDULER #1 J1.5, K259): their batch ticks (monitoring R19/R20, capture-requests R11/R12, bias R33) state that they take and apply the scheduler's R10 rank, `tick(now, rank)`.
  → applied: K332 (bias), K336 (capture-requests), K373 (monitoring, scheduler)
- N226 · 2026-09-28 · **legacy-checks** (MONITORING #1 J3.2): C-48.8's and C-48.9's `where` read `src/index.mjs fetch > is-drive-tick-…`; the regions are now `src/monitoring/index.mjs monitor > is-drive-tick-export` and `… > is-drive-tick-bytes` (with N212).
  → applied: archive/T9.md L1 legacy-checks, every entry applied
- N227 · 2026-09-28 · **provenance, monitoring** (MONITORING #1 J3.3): `driveShells` (monitoring R26) reads `captured_locators.via`, which provenance R48's read contract does not list; either R48 gains `via` or R26 stops reading it.
  → applied: K276; archive/T9.md provenance
- N228 · 2026-09-28 · **capture** (MONITORING #1 J3.4): `driveRow`'s export reason (op=monitor's Drive tick answering C-48.8/.9) is gone, since monitoring reads `DRIVE_CAPTURE_CHECKS` itself; capture judges whether the export stays.
  → applied: K290
- N230 · 2026-09-28 · **publication, monitoring** (MONITORING #1 J3.8): monitoring R33's published-finding half needs a cursor-able read of the captures a published finding rests on, as intent R7 offers for objectives.
  → applied: K366 (publication R42), K373 (monitoring half)
- N231 · 2026-09-28 · **actions, legacy-index** (AFFORDANCES #2 J2 Q1, K262): affordances R26's live half. Actions offers a read op answering `kinds()` for the instance (the combined view's kinds); legacy-index publishes `vocabulariesFor(kinds)` in `op=affordances` (target and no target) and `op=queue`.
  → applied: K370 (actions), K378 (legacy-index)
- N233 · 2026-09-28 · **conformance** (AFFORDANCES #2 J3 Q3, K264): `determine`'s supersession answers an absent reason `BAD_REASON`; everywhere else `BAD_REASON` is the malformed code beside `NO_REASON`. Conformance answers an absent reason `NO_REASON`, so affordances can grade `determine` `reasoned`.
  → applied: K371
- N236 · 2026-09-28 · **intent** (LEGACY-TESTS #5 J3): `MEASURE_MAX`, `DEPARTURES_MAX`, `SET_ASIDE_MAX` are driven by no test, intent's own included; each gets an interface test at its bound (bounds PIN).
  → applied: K361
- N237 · 2026-09-28 · **actions, publication** (LEGACY-TESTS #5 J3): new unbounded reads (derivation-bounds): actions' `pendingClocks` and `project`, publication's `#promoteNamedEdges`; each states and enforces a bound.
  → applied: K366 (publication), K370 (actions)
- N239 · 2026-09-28 · **reevaluation** (LEGACY-TESTS #5 J4): `src/reevaluation/index.mjs` ~909 spells a whole-second stamp by hand (`.replace(/\.\d+Z$/, "Z")`, from b6d4308734); it uses record-core's `stampInstant` (D-543; d543-instant-precision 11/1).
  → applied: K361
- N240 · 2026-09-28 · **promotion, legacy-tests** (LEGACY-TESTS #5 J5): monitoring moved C-18.5's emission site out of the catalogue while `CATALOG_VERSION` stayed 1.38.0 (the census prints 394, digest `7bb13138…`, source `eaaf9b18…`), so R34 does not hold at T8's close: promotion's next MINOR stamp is T9's first act, with d470's row from the print. First in T9.
  → applied: archive/T9.md promotion first; outcome 1.39.0/1.40.0
- N243 · 2026-09-28 · **legacy-store** (LEGACY-TESTS #5 J5): project-sight 248/1: five read routes unclassified in `PROJECT_NAMING_READS(_NOT)` (with N216's routes).
  → applied: K307
- N244 · 2026-09-28 · **run-productions, ai-runs** (LEGACY-TESTS #5 J5): run-conditions 56/3: `interim.mjs` W6; ai-runs `rerun_of` P1/P6. Observation-log 130/1 and observation-content 74/1: ai-runs' `hiddenRunTail` writes the D-486 subtraction a second time.
  → applied: K335/K336 (N190 rerun_of, N194 interim W6, N276 hiddenRuns)
- N246 · 2026-09-28 · **actions** (LEGACY-TESTS #5 J5): machine-fences 91/1: `NO_RULE` (`clockPropose`) shadows and is pinned by no suite; BAD_LAW_LEVEL C-73.3's translation says "federal, state or local" (the levels are federal, state, county, city).
  → applied: K370
- N247 · 2026-09-28 · **monitoring, capture, legacy-index** (LEGACY-TESTS #5 J5): plane-envelope 60/4: with `op=monitor` in the DO the Worker holds no computed-verdict success site (D-240 (b), (c)); `monitoringOp` spreads a DO result unclassified (e); `capture/doorbell.mjs` and `monitoring/index.mjs` open DO envelopes outside `doAnswer` (DETECTOR C).
  → applied: K290 (capture), K373 (monitoring), K376 (envelope half; no Worker verdict site); openEnvelope carried as N313 (current.md)
- N252 · 2026-09-28 · **content** (TEXT-CHAIN #2 J1): `extentSpace` (`content/extent.mjs`) duplicates text-chain's `rectSpace` (R87) except for a non-string space; content reads text-chain's.
  → applied: K294
- N253 · 2026-09-28 · **extraction** (PDF-READER #2 J1, TEXT-CHAIN #2 J2.2; K279): pdf-reader's `image_unread` markers (R34) enter `text.undetermined` and `counts.undetermined` with count 0; extraction's tier-2 decision (`needsTier2`, `readText`) excludes them, so a photo page does not escalate; and `carryImageUnread` goes, text-chain's `mergeTier2Text` carrying the markers (R90). Joins extraction's T9 job.
  → applied: K296
- N254 · 2026-09-28 · **promotion** (LEGACY-CHECKS #4 J2, K279): `stepDeclared` becomes a declared function (K238 (4)), and the failed-catalogue finding moves out of `runCaseGate`'s catch into a named `caseCatalogueFailed(e)` in `src/gate.mjs`, R33's answer unchanged, so C-102.8 and C-102.9 name one function each. Joins promotion's T9 job.
  → applied: K286
- N255 · 2026-09-28 · **pdf-pixels** (IMAGE-CODECS #2 J1, K281): N75's line-based wavelet changes `decodeJpx`'s working set (R4's `detail.working_set_bytes`: the 8-bit output plus the reused line buffers, not 4 bytes a sample of the largest tile), so `pdf-worker/test/jpx.test.mjs` (R25) re-pins its figure and its sizes (5000×5000 colour still refused; 8000×8000 grey the refused grey case). Carried in T9's layer 1 (P10's provided-service exception).
  → applied: K284
- N256 · 2026-09-28 · **publication**, **ratification** (RATIFICATION #2 J5; Bob, K283): a reference from a published finding to evidence not yet published is held privately (its id never enters the published graph) and becomes a `serve` edge when the evidence is published (publication R22, R35; ratification R5, R16); today it is dropped, so R16's end-to-end arm is a `test.todo`.
  → applied: K366
- N257 · 2026-09-28 · **consequences** (CONSEQUENCES #1 J1 (3); Bob, K283): R5's zero-measure part answers causation `not_applicable` and R9 does not count it `unproven`.
  → applied: K371
- N258 · 2026-09-28 · **jurisdictions** (K227; Bob, K283): the first profile's `legal_organisations` (R32) names HJTA (Howard Jarvis Taxpayers Association) and the First Amendment Coalition, each with its public website as contact, `evaluates` the Tier 3 kinds each takes up, basis `UNMEASURED`.
  → applied: K303, K322
- N259 · 2026-09-28 · **case-authoring** (LEGACY-CHECKS #4 J3.1): C-32.6's region `is-machine-publish` in `#publishCase` returns a spread `refusal(…)`; the guard judges no refusal in it and counts an inherited verdict; a literal `ok: false, reason` or a named helper at the site.
  → applied: K366
- N260 · 2026-09-28 · **publication** (LEGACY-CHECKS #4 J3.2): `src/publication/checks.mjs` lines 5, 8, 167 say C-44.1/.3–.5 and C-92.10–.12 "stay in the catalogue"; they are case-authoring's and ratification's.
  → applied: K366
- N261 · 2026-09-28 · **actions** (RECORD-CORE #5 J1): `#releaseLease` (`src/actions/index.mjs` 201) releases with `acquireLease(id, who, 0)`; it calls record-core R61 `releaseLease` (actions R16), dropping its `try` wrapper.
  → applied: K370
- N262 · 2026-09-28 · **capture-requests** (CAPTURE #5 J1, K287): `#fire` passes only `credential`; it passes `heldSha` (the held capture, R39) and `origin` (`{matched_sweep, deeming_actor}` from the drain's row, R38) to capture's `captureRequest`, which honours them (capture R60, R61).
  → applied: K333, K336
- N263 · 2026-09-28 · **provenance**, **legacy-checks** (PROVENANCE #3 J1.2): a register entry with `bytes` absent or null fails the promotion as `PROMOTE_FAILED` (NOT NULL), and `-1` or `1.5` are stored as stated; R48 states the column, so an entry with no whole non-negative `bytes` is refused by a named code with its catalogue row.
  → applied: K325 (provenance R50, its own row, K324); stamped by N281
- N264 · 2026-09-28 · **content** (CONTENT #3 J2, K294): R46 `passageText` on a row R41 marked stale answers the new reading's text at that extent, which may not be the text cited; it answers null for a stale row (the passage is held in a form not read, consequences R2: undetermined).
  → applied: K326
- N265 · 2026-09-28 · **legacy-store**, **legacy-index** (BOB #57's verification of EXTRACTION #3 J2.5): the firsthand-observation (testimony) path in `store.mjs` (about 2445–2460) still calls extraction's `indexUnits` and observation-log's `observeIndexed` inline, K31's leftover; it goes through extraction's writer and its `onReading` listeners, or states why it writes no reading. `index.mjs` about 5145 still says "until `extraction` takes the block (K49)"; the op hands the read to extraction now.
  → applied: K337, K341, K342
- N266 · 2026-09-28 · **monitoring**, **legacy-store** (LEGACY-STORE #1 J1 Q1, K261): `op=stats`' `monitorFired`, `monitorTickEpoch`, `monitorAddressType` count monitoring's tables by name. Monitoring provides `counts() → {monitorFired, monitorTickEpoch, monitorAddressType}` (whole-store), then legacy-store's `#counts` calls it; the wire keys stay.
  → applied: K373, K374
- N267 · 2026-09-28 · **standards**, **legacy-store** (LEGACY-STORE #1 J1 Q2, K267's pattern): `standardsOf(host)` declares its four tables to purge but creates none unless `migrate()` is called; the factory migrates at construction, as escalation does, and legacy-store's `standardsOf(ctx).migrate()` call then goes.
  → applied: K307, K371, K374
- N268 · 2026-09-28 · **legacy-store** (AFFORDANCES #3 J2, after `affordanceFacts`' extraction): nine private delegates with no caller left (`#restsOnLive`, `#ownsAnyProject`, `#participation`, `#owners`, `#rescueRefusal`, `#caseRelationOf`, `#isJoinedParticipant`, `#isProjectOwner`, `#inSight`), `static ownerMath` if no suite calls `Store.ownerMath`, and the stale header comment at `store.mjs` ~178 ("deriveActs over its own affordanceFacts") are deleted.
  → applied: K341
- N269 · 2026-09-28 · **standards** (LEGACY-INDEX #6 J1.1): `op=standard` with no `id` answers `{ok:false, reason:"NO_ID"}` with no code, check or translation, a codeless refusal (D-495) from `standardRead`; it refuses through a coded row.
  → applied: K371
- N270 · 2026-09-28 · **legacy-store** (BOB #57's sweep after K313): `#conditionBundlesForHost` (`store.mjs` ~2720) binds `https://${host}/*`-style GLOB patterns; a hostname over about 40 bytes passes workerd's 50-byte LIKE/GLOB cap and the read fails on the plane. It matches the host without a pattern that grows with the input (e.g. `substr`/`instr` over `address_norm`), tested under a workerd-like cap. No other LIKE/GLOB in `bio-plane/src` can exceed the cap (literal patterns under 45 bytes; bound ones are fixed prefixes).
  → applied: K341
- N271 · 2026-09-28 · **actions** (LEGACY-TESTS #6 J2): `#breachRefusal` reads the viewer as `pkg.viewer ?? c.viewer ?? who`, and `who` is the bare member id, which `viewerPredicate` denies; a member session cannot record a `breach: true` action through `op=promote` (answered `ACTION_NO_DETERMINATION`), against R8. It reads the session's viewer.
  → applied: K370
- N273 · 2026-09-28 · **capture-sources** (LEGACY-TESTS #6 J3): C-105.10's region `is-credential-stored` lies outside `credentialSupply`'s body and C-105.11's is a 3-line span; neither resolves for the guard. Regions that resolve, each over its whole refusal.
  → applied: K325
- N274 · 2026-09-28 · **conformance** (LEGACY-TESTS #6 J3): its `NO_SUCH_PROJECT` translation is word for word membership's C-70.5; it calls membership's `noSuchProject` (R78), N208's share.
  → applied: K369, K371
- N275 · 2026-09-28 · **case-authoring**, **promotion** (LEGACY-TESTS #6 J3): `is-machine-publish` judges no refusal (a spread), and C-102.9's `where` (`caseCatalogueFailed`) carries no boolean verdict, so the guard's arm C cannot judge either; each names a region holding the refusal's verdict.
  → applied: K352 (promotion), K366 (case-authoring)
- N276 · 2026-09-28 · **ai-runs** (LEGACY-TESTS #6 J3): `hiddenRunTail` counts D-486's subtraction twice (observation-content 74/1, observation-log 130/1); with N191's one predicate (R42).
  → applied: K335, K336
- N278 · 2026-09-28 · **monitoring** (LEGACY-TESTS #6 J3, plane-envelope 62/2): `monitorOp` spreads the durable object's answer unclassified (D-240 (e)) and opens its envelope outside `doAnswer`; N247's monitoring share.
  → applied: K373
- N280 · 2026-09-28 · **membership** (BOB #57, T9's closing coverage run): R83 (`MODULE_ORDER`, K289) is built and tested under R79 but no test names R83; coverage fails on it.
  → applied: K323
- N281 · 2026-09-28 · **promotion** (PROVENANCE #5 J1, K324): C-53.14 arrives as provenance's own row (`REGISTER_BYTES_UNSTATED`, R50); `CATALOG_VERSION` re-stamps for it (MINOR), and legacy-tests' version row follows.
  → applied: K352 (1.41.0)
- N282 · 2026-09-28 · **legacy-checks** (PROVENANCE #5 J2.3, K325): C-53's header above `TESTIMONY_CHECKS` in `bio-checks.mjs` names C-53.14 and that it lives in provenance's `REGISTER_ENTRY_CHECKS`; with legacy-checks' convergence rows (T11).
  → applied: K348
- N283 · 2026-09-28 · **retrieval**, **monitoring**, **actions**, **legacy-store** (RETRIEVAL #2 J1, K327): R61's move of the projection columns and `fts_id` off `bundles` into `bundle_projection`, in one tranche with its readers: monitoring (`index.mjs` 1129–1142, 1590–1592, 1751: `monitor_enabled`, `monitor_frequency`, `monitor_last_checked`, `source_locator`), actions (1804: `b.action_clock_next`) and legacy-store (`store.mjs` 5461–5465, `bundles.fts_id`; or queue's call through N171's `counts(hid)`) each read `bundle_projection` joined on `bundle_id`; retrieval passes its relation to `compile` (query-language R25, built in T10).
  → applied: K354 (retrieval), K370 (actions), K373 (monitoring); store.mjs no longer reads `fts_id`
- N284 · 2026-09-28 · **ai-runs** (BIAS #2 J1.1, K328): its work-product source (R30) answers each product's `registered` instant, so bias R33's `waitingSince` ranks a waiting product by its wait (today absent, ranked as no wait).
  → applied: K358
- N286 · 2026-09-28 · **legacy-checks** (OBSERVATION-LOG #2 J2.3): the comment above `AI_LOG_NEVER_LOOKED_STORED` in `bio-checks.mjs` (about line 5114) says the region is unmarked and C-22.1 is what that site answers; since T10 the region `is-never-looked-stored` is marked in `checkObservation` and mints C-22.17: correct it, with legacy-checks' convergence rows (T11).
  → applied: K348
- N287 · 2026-09-28 · **record-core**, **retrieval** (RETRIEVAL #2 J5): retrieval's `projection()` reads `bundles.group_id` and `bundles.prior_state`, which record-core R37's read contract does not state: R37 states them, or retrieval reads them otherwise.
  → applied: K352
- N288 · 2026-09-28 · **connections** (RETRIEVAL #2 J5): `observationOf`'s missing-row probe for an entity reads `connections.entity_id`, for which connections states no read contract: state it (as N213's `refs`), with its test.
  → applied: K354
- N289 · 2026-09-28 · **ai-runs**, **legacy-checks** (SKILLS #2 J1–J2, K333): C-22.7's `where` (still `src/skillpack.mjs checkSkillVersion`, deleted by N156; the DEC-49 guard fails on it) is re-pointed to `src/ai-runs/skill-version.mjs checkSkillVersion`, and its row leaves the catalogue's `AI_RUN_CHECKS` for ai-runs' own row table beside its one minting site (`checkSkillVersion`, ai-runs R8), its `where` re-pointed; skills keeps naming it by key through ai-runs (R25); with legacy-checks' convergence rows (T11).
  → applied: K358 (ai-runs); catalogue copy via N299, K381
- N290 · 2026-09-28 · **legacy-index** (INQUIRY #2 J2, K334; in T10, P10's provided-service exception): the control plane stamps `memberUserAgent` on a creating promotion package as it stamps `migrationReplay`: deleted first from every caller's body, set only for a creation through a member's session, from that request's `User-Agent` header; inquiry R44 records it.
  → applied: K342
- N291 · 2026-09-28 · **intent** (CAPTURE-REQUESTS #2 J2.3): `pursuitOf` (its R14) reads `capture-requests.requestById` (its R43) for exact outcomes instead of the bounded list (N169's reason).
  → applied: K361
- N292 · 2026-09-28 · **reevaluation** (INQUIRY #2 J4.1, against its R8 and inquiry R42): its registration `inquiry.onRaised("reevaluation", … => r.raise({…}).raised)` (`src/reevaluation/index.mjs` 1167–1168) answers only the dependents; answer `r.raise({…})` whole, so its `listeners_failed` reaches dispose's, divide's and a re-read's reply (R8).
  → applied: K361
- N293 · 2026-09-28 · **ai-runs** (AGENT-WORKER #2 J1): `tick`'s `state` (R12) is stored with no bound on its size; a run's principal can write any amount on every tick: a byte ceiling with its refusal and row, as ai-runs' other figures (REC-169).
  → applied: K358 (ai-runs R45, agent-worker R49)
- N294 · 2026-09-28 · **extraction**, **observation-log**, **provenance**, **legacy-store** (LEGACY-STORE #2 J1, K337): the testimony path (`#testimonyWithin`, `store.mjs` ~2142) calls extraction's `indexUnits` and observation-log's `observeIndexed` directly, neither a provided service; extraction provides one (e.g. `indexTestimony(bundleId, captureSha, units)`: index and raise an index notice, no reading) that observation-log R7 listens to, and legacy-store (or provenance, K31) calls it.
  → applied: K353, K354, K374
- N295 · 2026-09-28 · **capture-requests** (LEGACY-INDEX #7 J1, K342): R14's `member-browser` form reads only the inquiry document's `member_user_agent`, so the agent the control plane now stamps and inquiry records (R44, K334, N290) never reaches it and C-28.7 refuses every plane-created inquiry; `#memberAgent` reads inquiry's `memberUserAgent` (R44), with a test on a plane-created inquiry. R14 and its Uses line worded (K342).
  → applied: K358
- N296 · 2026-09-28 · **standards**, **conformance**, **consequences**, **filings**, **escalation** (BOB #59, the UX substrate): every id still carries `not yet met: new module` though T8 built and merged the five; each T11 job of these modules confirms its ids against its tests and strikes the marks that hold. Also BOB: mark Case Making's pre-DEC-72 naming paragraph as superseded (canon tidy).
  → applied: K369, K371 (marks struck in all five); canon tidy in docs/architecture/BIO_Case_Making_v0_1.md:10
- N297 · 2026-09-28 · **actions**, **publication**, **monitoring**, **consequences**, **conformance**, **case-authoring**, **escalation**, **review** (LEGACY-TESTS #7 J1, the refusal-code guard): actions' `RECORDS_LAW_REFUSED` minted at 3 sites (one helper, K275); publication's `is-no-published-part` judges no refusal; monitoring's `REFUSED` has no translation; consequences 11 guard failures (two short translations, nine codes outside its family), conformance 6, case-authoring 5, escalation 5, review 3 (regions): each module's own share, with N242, N217, N274.
  → applied: K366 (publication, case-authoring, review), K370 (actions), K371 (conformance, consequences, escalation), K373 (monitoring)
- N298 · 2026-09-28 · **legacy-tests** (LEGACY-TESTS #7 J1, deferred): `nc-rec91.mjs` (seven arms dead since T5) and m025 A4's blindness to it; `refusal-codes.control.mjs` arm r1's stale anchor; with N57's sweep of the controls.
  → applied: archive/T11.md: N298 met
- N38 · 2026-09-26 · **instance-setup** (K69): the group-identity cluster (C-64) moves here from `legacy-store` at `instance-setup`'s extraction; BOB writes its requirements (the producing group, its history, the domain checks) and brings them to Bob before that tranche.
  → applied (T12, K424): Met; K102 (requirements); C-64 moved by instance-setup (K414, record J5)
- N53 · 2026-09-26 · **skills**, **agent-worker**, **control-plane** (K81): the skills tests that read `agent-worker` and `index.mjs` move into those modules' own tests.
  → applied (T12, K424): Applied; control-plane R34 holds skillpack A10's pin (T12 archive, control-plane line; record item 5); legacy-tests re-anchored the text in B8
- N65 · 2026-09-26 · **retrieval**, **monitoring**, **affordances**, **instance-setup**, **jurisdictions** (K92): before Bob approves those drafts, (1) retrieval R2 (and its map §5.3) takes the action columns and `actionClockNext`/`actionOverdue` from actions' clock rule (its R12) by registration, keeping no copy (K75 (2)); (2) monitoring R34's mechanical overdue mark is bounded by actions R33 (only `pending` to `overdue`); (3) affordances and instance-setup take `ACTION_KINDS`, `RISK_TIERS`, `riskTierState` from `actions`, the kinds from the profile view; (4) jurisdictions (with N61, to Bob): the profile has no section for Design Requirement 8's legal organisations, the Tier 2 advisory note, a holiday calendar for business-day counts, or marking an office as an oversight or audit body. Found by the actions drafting worker. *Requirements written by BOB #43 (K96); each is built by its module's job.*
  → applied (T12, K424): Share (3) applied; R32 reads `RISK_TIERS` from actions (instance-setup J5); the other shares were met earlier (draft's Met list)
- N66 · 2026-09-26 · **record-core**, **promotion**, **scheduler**, **jurisdictions**, **legacy-index** (K93): record-core offers `isFirstBoot` (today `store.mjs` ~914 in `#migrate`), which instance-setup R2 and R13 read, and R26's writer is instance-setup R13–R14; promotion's carried checks list C-64.1 (its R13 raises it; K69's `#stampGroup` is already promotion's `stampGroup`); scheduler R9 says a producer later than it arms by calling R8; jurisdictions' Suggestion that the record refuses a test profile names instance-setup R14 instead; the `knock` handler, `KNOCK` and C-85, and the `runtime` and `cpuprobe` op arms are placed by BOB before layer 11's tranche. Found by the setup drafting worker. *Requirements written by BOB #43 (K96); each is built by its module's job.* *Placement done (K98): knock to capture, runtime and cpuprobe to instance-setup; their requirements join those modules' before their tranches.* *(T5 carries record-core's `isFirstBoot`.)*
  → applied (T12, K424): Applied; runtime and cpuprobe moved to instance-setup (J5); `isFirstBoot` read at first boot
- N95 · 2026-09-27 · **queue** (RECORD-CORE #2 REPORT 6): its unattended-capture producer reads record-core's `manifestByAuthor` (R53) instead of `manifest` in its own SQL, at its extraction.
  → applied (T12, K424): Applied; queue reads `manifestByAuthor` (queue J3; K409)
- N172 · 2026-09-28 · **queue** (QUEUE #1 Q4, Q5, K209; REEVALUATION #1 J2.2, INTENT #1 J4.6): at queue's extraction, reevaluation's notices as a FINDING kind with its producer and its ADOPT/KEEP door (`versionadopt`, `versionkeep`), and `objective-gap`'s producer over intent's `gaps` (bounded projects); `reevaluation` and `intent` join queue's uses; BOB folds R1, R9, R12 first from QUEUE #1's J1 proposals.
  → applied (T12, K424): Applied; queue J3; K409, K417 (R1, R9, R12)
- N173 · 2026-09-28 · **queue** (QUEUE #1 Q1, K209): at queue's extraction, requirement-named tests at the interface for R6–R40 (the feed in legacy-store until then).
  → applied (T12, K424): Applied; 40 of 40 ids (queue J3)
- N229 · 2026-09-28 · **queue** (MONITORING #1 J3.7): monitoring R31's four kinds (`source-modified`, `source-removed`, `archive-fallback-eligible`, `monitoring-recheck-due`) have no producer; the facts are offered (R8's `reeval_pending`, `archiveTick`'s `eligible`, `monitoring()`'s due and unscheduled rows, `escalationsSeen()`), and the item's catalogue ids and options are composed in legacy-store/affordances.
  → applied (T12, K424): Applied; K406 readings; queue J3
- N234 · 2026-09-28 · **instance-setup, installer** (INSTALLER #1 J2.1, K265): instance-setup's extraction exports the slug grammar (`GROUP_SLUG_RE`, now a legacy-store static) and the member binding names (`FLEET_BINDINGS`, unexported in legacy-index), and the installer imports both (R30), dropping its `SLUG_RE` and `MEMBER_BINDINGS` copies.
  → applied (T12, K424): Applied; K405, K416; installer R30 struck (K417)
- N235 · 2026-09-28 · **instance-setup** (LEGACY-TESTS #5 J2, K267): `setup.mjs` `mdFor` writes a named counterparty as `{state: named, name}`, which actions R9 refuses on creation (`{state: named, role, body, level?}`).
  → applied (T12, K424): Applied; R24 (instance-setup J5)
- N285 · 2026-09-28 · **progressions**, **inquiry**, **legacy-store**, **connections**, **entities**, **membership**, **content**, **extraction**, **intent** (PROGRESSIONS #2 J2, ENTITIES #2 J2.2–3, K329): K275 per shared code, each keeping a member's translation: `NOT_A_DISPOSITION` is one condition, progressions providing its one helper and row, inquiry and legacy-store calling it; `NOT_FOUND`, `NO_ENTITY`, `NO_LABEL`, `NO_SHA` name different subjects per site, each module's own renamed with its row (legacy-ui keys on the new names), or where one condition the earliest holder's helper (entities for `NO_ENTITY`); intent's `refuseNoSuchEntity` (C-111.5) gives way to entities' `noSuchEntity` (R36).
  → applied (T12, K424): Applied, layers 2–10 plus legacy-ui's key; K382–K404; K387 and legacy-ui record
- N299 · 2026-09-28 · **legacy-checks** (K350; T12, after ai-runs R35 and skills R25 read ai-runs' own row): the catalogue's `AI_RUN_CHECKS` row for C-22.7 (`AI_RUN_SKILL_VERSION_UNNAMED`), restored in T11 so the plane boots while ai-runs takes it, leaves the catalogue; ai-runs' own row is then its one site (K231).
  → applied (T12, K424): Applied; K381
- N300 · 2026-09-29 · **project stage** (Bob, K356; T12): a project shows its stage, one of State Rules §4.3's four (forming, investigating, matured, closed), with its work products' readiness, computed from the questions it holds and what it has published and never set by hand; worded as a provided read of a module at or after `publication` in the order (it reads inquiry and publication), placed by BOB when worded before T12 opens; the redesign shows it on a project's home screen.
  → applied (T12, K424): Applied; basis-versions R41 (K390); publication R44–R47 (K396, K399)
- N301 · 2026-09-29 · **queue**, **legacy-ui** (Bob, K356; T12, with queue's extraction): the queue class `FINDING` keeps its code and meaning and is shown to members as **Noticed** (its translation and every member-facing label); "finding" is reserved for a concluded question.
  → applied (T12, K424): Applied in full, including legacy-ui's label; queue `class_labels` (K409); legacy-ui `queueClassLabel` shows "Noticed" (legacy-ui record lines 7–10, 55; K409)
- N302 · 2026-09-29 · **promotion** (AI-RUNS #4 J1; T12): `CATALOG_VERSION` stamps T11's check changes after 1.41.0: C-22.18 `AI_RUN_STATE_TOO_LARGE` added in ai-runs' own table, C-22.7's `where` now ai-runs' `skill-version.mjs` (R34); with legacy-tests' census re-pin. Also T11 layer 9's rows (K369): standards C-112.11 `STANDARD_NO_ID` added; conformance C-113.2 retired, C-113.22 `NO_REASON` added, C-113.12's `where` (`determine`), C-113.17's translation; actions C-117.4 `ACTION_MOVE_NO_REASON`, C-117.5 `PENDING_CLOCKS_BAD_BEFORE` (K368); filings C-115.2 retired; escalation C-116.11 retired (each as its job reports at COMPLETE).
  → applied (T12, K424): Applied; 1.42.0 (K382)
- N303 · 2026-09-29 · **strength** (UX substrate open question 23, a worker's reading checked by BOB #60; T12): R6 replaces each hidden member by null and "an object you may not see", so a reader can count what is withheld, which DEC-36 forbids ("no id, no title, no state, no count"); withhold hidden members whole and state only `out_of_view` (the incompleteness), with R6's test showing no count. Whether DEC-36's stated incompleteness also governs hidden dependents and backlinks (reevaluation R3, R7, R20; connections R20, which withhold silently) is Bob's (doctrine), put to him on the substrate page.
  → applied (T12, K424): Strength's share applied; K390
- N304 · 2026-09-29 · **agent-worker** (AGENT-WORKER #3 J3; T12): its negative-control arms need re-anchoring against the plane's text and suites: `agent-worker.control` V1, V2, V4 and `harness.control` G2 were already failing before T11's ai-runs merge; V5, F1, G3, G5 arrived with it (the legacy `airun` suites inside F1, G3, G5 fail 2–4, legacy-tests' in T11 layer 11). None touches R49.
  → applied (T12, K424): Applied; K390
- N305 · 2026-09-29 · **intent** (INTENT #3 J1; T12): (worded K367 into intent's Bounds paragraph) R28's `servesOf` walks every held aspiration and every conditioned project, `#conditioned` (for `proposals` with no project) walks every project, and `pursuitOf` reads one request per basis-named request with no count bound; each is an unbounded read like N209's. BOB words a bound first (R28 says "every held aspiration in force"), then intent applies it with interface tests at the bound.
  → applied (T12, K424): Applied; K391, K393, K394
- N306 · 2026-09-29 · **review** (REVIEW #2 J1; T12): the two `MINT_EXHAUSTED` answers in `#draft` and `#grant` carry no code and no catalogue row; each gets a C-87 row in review's own table (K231), stamped by promotion R34.
  → applied (T12, K424): Applied; K392, K399
- N307 · 2026-09-29 · **conformance** (CASE-AUTHORING #2 J1; T12): its `NO_SUCH_PROJECT` literal (arm G's last second site, and an identical-translation failure against `MEMBERSHIP_CHECKS`) answers through membership's `noSuchProject` (its R78; K231), byte for byte. **Met in T11 by CONFORMANCE #2's N274 (K369); nothing left for T12.**
  → applied (T12, K424): Met in T11; K369
- N308 · 2026-09-29 · **publication** (PUBLICATION #2 J3; T12): R38's `ratifiedFindingsRestingOn` reads every pinned roster member's bytes on each call, bounded only by the cases ever ratified; BOB words a bound, then publication applies it with an interface test at the bound.
  → applied (T12, K424): Applied; K395, K399
- N309 · 2026-09-29 · **conformance**, **escalation**, **membership**, **inquiry** (ESCALATION #4 J1; T12, K275): the DEC-49 guard's arm G lists codes minted at more than one site: `NOT_PROPOSED` (escalation, membership), `NO_SUCH_DETERMINATION`, `DETERMINATION_SUPERSEDED`, `NOT_NONCOMPLIANT` (escalation and conformance; K275 gives them a conformance helper its requirements do not yet provide) and `NOT_A_PARTICIPANT` (escalation and others). BOB words each code's one site and its helper, then each caller answers through it. Also (CONFORMANCE #2, STANDARDS #2): conformance mints `ALREADY_SUPERSEDED` (consequences'), `NOT_A_PARTICIPANT`, `NO_SUCH_DETERMINATION` (escalation's), `NO_SUCH_PROPOSAL` (intent's) and `NO_SUCH_STANDARD` beside another module's row; for `NO_SUCH_STANDARD`, the same condition as standards' own, standards gains a `noSuchStandard` helper (K231, as membership's `noSuchProject`) that conformance calls.
  → applied (T12, K424): Applied; K400–K402
- N310 · 2026-09-29 · **affordances** (ACTIONS #2 J1, K368; T12): its `reasoned` code list (`src/affordances.mjs` 453, 711) names `NO_REASON` for `actionmove`; actions now answers `ACTION_MOVE_NO_REASON` (its R13), so the list names that code. Also (CONFORMANCE #2): with N233 applied, `determine` is graded `reasoned`. **Taken into T11 layer 11 (K370): affordances' job applies it.**
  → applied (T12, K424): Met in T11; K370
- N311 · 2026-09-29 · **actions** (ACTIONS #2 J4; T12): R31's cursor names actions, so an action holding more pending clock entries than a page (500) is answered in part (`cut_inside`) and its remaining entries are unreachable; R3 bounds basis and correspondence (500 each) but not the clock. BOB words either an entry-level cursor or R3's bound on pending clock entries, then actions applies it.
  → applied (T12, K424): Applied; K401, K402
- N312 · 2026-09-29 · **conformance** (ACTIONS #2 J4; T12, with N309): `DETERMINATION_SUPERSEDED` is minted by actions R8 (`#breachRefusal`) and escalation; conformance provides it as one helper (K275), and both call it.
  → applied (T12, K424): Applied; K400, K402
- N313 · 2026-09-29 · **monitoring** (MONITORING #3; T12): `openEnvelope` in `monitoring/index.mjs` duplicates the control plane's `doAnswer` rule (K231); it goes once legacy-index hands `doAnswer` to `monitorOp` (K372, T11 layer 11).
  → applied (T12, K424): Applied; K403, K404
- N314 · 2026-09-29 · **monitoring**, **legacy-index** (LEGACY-INDEX #8 J1, K376; T12): R30's pause is "an administrator"'s, but T11's Worker opens `monitorpause` to the root of trust only (the admin token and the founder's session), since the Worker holds no administrator refusal. Monitoring's `pause` refuses a non-administrator through membership (its `isAdministrator` and `NOT_AN_ADMIN`'s one site, K231), and the Worker opens the op to every member session, stamping `actor`.
  → applied (T12, K424): Applied (both halves); monitoring (K404); the Worker half by control-plane (K413, archive)
- N315 · 2026-09-29 · **publication** (LEGACY-TESTS #9; T12, with N308): R42 `restingCapturesOf` reads each capture's findings unbounded (`derivation-bounds` red); BOB words a bound, publication applies it with a test at the bound.
  → applied (T12, K424): Applied; K399
- N316 · 2026-09-29 · **legacy-tests** (LEGACY-TESTS #8; T12): `nc-mk1`'s `pubdirect` arm retired as `pubcited` was (MK-7, D-431), leaving basis-versions' `testimonyReach` depth unguarded by that suite; an interface test in basis-versions or a re-derived arm guards it.
  → applied (T12, K424): Applied; K390
- N10 · 2026-09-25 · **record-core**, **installer**, **instance-setup**: the instance holds the list of its active jurisdiction profiles as a setting, and the installer offers the choice. Rule 2 of "No jurisdiction in the product". *(T3 carries its share for record-core, promotion or legacy-tests.)*
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N93 · 2026-09-27 · **legacy-index** (MEMBERSHIP #2, T5): the control plane stamps `viewer` (as for PROJECT_ACTIONS) and `administer` (as for memberlist) on `op=memberpairings`, so membership's R19 filter (N85) reaches unpublished pairings for their member and administrators; until then every caller sees only published pairings.
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N112 · 2026-09-27 · **legacy-store**, **queue** (RETRIEVAL #1 REPORTs 10, 12; BIAS #1 REPORT 5; LEGACY-TESTS #3 REPORTs 3, 13: the unused `enteredAfterFirstRow` import, and `pdfstructure` into `PROJECT_NAMING_READS_NOT` beside `reading`): `#counts` (`op=stats`) counts retrieval's and bias's tables by name, and `#obligationsBiasDebt` reads bias's; the thin delegates `#frontierLatest`, `#frontierVerification`, `#frontierDocumentVisible` have no caller. Removed or rewired by the job that next extracts from legacy-store (queue's, for the two reads).
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N128 · 2026-09-27 · **legacy-checks** (PROMOTION #5 REPORT 1): catalogue rows owed for promotion's `FACT_MALFORMED`, `STEP_DECLARED`, `STEP_MODULE_UNNAMED`, `LISTENER_MALFORMED`; `LISTENER_DECLARED`, minted at 12 sites in 12 modules for one condition, needs BOB's structural decision (a shared registration code, or one per module) before its row.
  → applied: met: archive/T14.md layer 2 (MEMBERSHIP #7, R81)
- N150 · 2026-09-28 · **legacy-checks** (INQUIRY #1 REPORT J2.1): the `where` of C-32.7, C-32.8, C-33.13, C-33.22, C-33.23 names `src/inquiry/index.mjs` (the regions moved with the code); `machinefences-dec49` arm D goes green with it.
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N154 · 2026-09-28 · **legacy-checks** (BASIS-VERSIONS #1 REPORT J4.2; CAPTURE-REQUESTS #1 REPORT J2.1; with N150): re-point the `where`s of the rows whose regions moved: C-25.11, C-25.16–C-25.18, C-25.20–C-25.34, C-50.1–C-50.11, C-33.1, C-33.2, C-33.33–C-33.37, C-32.2 to `src/basis-versions/index.mjs`; C-28.1–.4, .14–.16 to `src/capture-requests/index.mjs captureRequest > is-capture-request`, C-28.6–.11 to `#conduct > is-capture-conduct`, C-28.17 to `drain > is-capture-fetch-failed`; C-27 (all but .15) and C-104 to `src/run-productions/index.mjs` (`suggest > is-suggest-shape|checks|write`, `extractPropose > is-extract-*`, `extractProposals > is-extract-scope`; RUN-PRODUCTIONS #1 REPORT J2.1) (K6; the region names unchanged).
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N167 · 2026-09-28 · **scheduler** (the T8 map re-check, K206): intent's `ageSurfaced` (R17) is a consumer with no caller; scheduler's requirements name it, and R10 names the intent service it ranks by.
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N170 · 2026-09-28 · **monitoring** (INTENT #1 REPORT J4.6): monitoring watches `intentOf(ctx).watchSet({project})` (intent R7), and its findings join intent's proposals through `registerSource` (R15), as scheduler's do (N167).
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N171 · 2026-09-28 · **retrieval**, **bias**, **queue** (QUEUE #1 Q3, K209): retrieval `counts(hid)` → `{indexed, selections, selectionItems}` and bias `counts(hid)` → `{biasStatements, biasAdoptions}` and `uncleared({gate, limit})` (the uncleared debts with their recipients, newest first), as run-productions' `counts(hid)`; queue's `#counts` and `#obligationsBiasDebt` then read them (N112's remainder).
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N192 · 2026-09-28 · **legacy-checks** (LEGACY-TESTS #4 REPORT J4; with N150, N154): beyond N150 and N154's rows, (1) C-33.40's `where` names `src/store.mjs actNoBasis > is-act-no-basis`, which is dead; it is re-pointed to the site N186 keeps. (2) Some `MACHINE_FENCE_CHECKS` rows are not minted where their `where` says (refusal-wire's D-494 arms, 38/4). (3) The guard's 26 lines and orphan markers for code T7 moved. After these, the floors that move with them are re-measured: regionLines, codesChecked, outcomeReturns, inheritedVerdicts.
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N129 · 2026-09-27 · **legacy-checks** (K171 (1), (2)), the head of layer 9's tranche, before its module jobs: register the record types `STD-` (`standard`), `CONF-` (`determination`), `CONS-` (`consequence`) and `ESC-` (`escalation`) in the catalogue as `BIAS` was (`BUNDLE_ID_RE`, `ANN_ID_RE`, `OBJECT_TYPES`, each type's `STATES` table: one state `recorded` and no edges for the first three; `open`, `suspended`, `ended` with open→suspended, suspended→open, open→ended, suspended→ended for the escalation), checking the per-type front-matter checks admit each new type's document; and add `proposalLabel(proposedBy, subject)` over `lawProposalState`, one closed sentence table keyed `governing_laws` (today's `LAW_PROPOSAL_STATES`, word for word), `standard`, `comparison`, `filing_draft`, `theory`, with `lawProposalLabel(p)` kept as `proposalLabel(p, "governing_laws")` so `actions` and `rec195-laws-proposal.test.mjs` are unchanged.
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N130 · 2026-09-27 · **jurisdictions** (K171 (3); K108): its next job, before layer 9 and before `actions` R32 (which needs R33): R23's source `level`, R24's `oversight`, R25's `advisory`, and R31–R36 (`legal_organisations`, `holidays` among them), none built since T2; with N77 (`locale`) and N96 (`systems[].links`; Bob's, approved K158), which wait on this job.
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N202 · 2026-09-28 · **promotion**, and each module that registers listeners (LEGACY-CHECKS #3 J1.2, K229): `LISTENER_DECLARED` and `LISTENER_MALFORMED` are minted for one condition at about twelve sites (promotion `#listen`, extraction, bias, content, retrieval, connections, inquiry, entities, calibration, basis-versions, provenance, capture). The registrations converge on one provided helper, so each code has one site; then legacy-checks adds their two catalogue rows and `STEP_DECLARED`'s (N128's remainder; promotion converges its own three `STEP_DECLARED` sites in T8, K231). One code is minted at one site (K231).
  → applied: met (draft-T15 point 8)
- N323 · 2026-09-29 · **intent** (INTENT #4 J2 (5); T13): three internal reads N305 left unbounded, each worded like K391 before the entry runs: `pursuitOf`'s walk over every goal document; `#ageable`'s walk over every inquiry and its manifest (R17, R27); `#heldAspirations` passing over retired aspirations uncounted.
  → applied: carried in full by T8–T14 (draft-T15 point 8, BOB #67's review; BOB #68 moved it)
- N344 · 2026-09-29 · **contradiction**, **inquiry**, **conformance**, **publication** (DEC-76, DEC-77; K439): the level-2 PRESENT and RESOLVE design on DEC-76's terms (a contradiction is conditional; a taken-up candidate becomes an inquiry whose conclusion records its kind; the dissolved, corrected and genuine families; publication discloses an unresolved RECORD contradiction) and DEC-77's (inline by default with the "how do these differ" clarifier, the six presentation forms, context that recommends and never silently decides, the attributed act of accepting a proposal, its acceptance rate measured), continuing `CONTRADICTION-IDENTIFY-DESIGN.md` §9 item 4. BOB writes it; its requirement changes are N345's.
  → applied: met: the PRESENT/RESOLVE design written, N345 drafted from it (K454)
- N353 · 2026-09-29 · **legacy-tests** (LEGACY-TESTS #11, deferred own flaw): project-sight's `promote-stamp-dropped` control arm is 0/1 because REC-171's `surfacing-run.mjs` fixture throws SURFACE_NO_RUN (C-66.1) before any assertion (D-447 (2)); fix the fixture.
  → applied: met: archive/T14.md, LEGACY-TESTS #12 (K479)
