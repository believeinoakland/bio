# Plan: tranche T17

**Status** · OPEN · BOB #74 · session_01WBtQhddi9im4nvVrxcgoBM · depth 1

**Jobs** · legacy-checks: LEGACY-CHECKS #11 session_01TaobwHYryXf8vfbvWkYqUz; docprofile: DOCPROFILE #2 session_01PzNztiLm9r2dBH43cVX69y; membership: MEMBERSHIP #10 session_01FgiHtCg8KEHDB2sC7rKq9y; record-core: RECORD-CORE #9 session_015Z2ibFGipKFWMV5BopFcPH; promotion: PROMOTION #18 session_011ju7BEaAQKe7REaDVMPKum; capture: CAPTURE #9 session_01CeSQD7cKcqii9K2VExg18L; provenance: PROVENANCE #7 session_01YBB3FhBVLLqxoQXxXj1PVQ; sources: SOURCES #2 session_01BuH77QM4Gg6KVGSfhNvcHf; extraction: EXTRACTION #7 session_011qbqAh8m73FQnGqGT9f8qb; retrieval: RETRIEVAL #5 session_01KW1cix2vTmvtiwxv9N28w8; basis-versions: BASIS-VERSIONS #4 session_01FcozLKDUr1LfW1f9JGHiug; inquiry: INQUIRY #6 session_016XUVGj1ZVAVNGZpyXcL8vh; contradiction: CONTRADICTION #4 session_01PJZi1Tddeq3RdfGvVdcz9C

Opened by BOB #73, 2026-09-30 (PROCESS-MECHANICS §5), at `main` @ caf5106554, T16 closed (K571). Cut from `draft-T17.md`, re-read against T16's close (K564–K573): T16's layers 8, 11 and legacy-tests folded (K566, K571), N362, N374, N375 worded (K565, K569), and Bob's priority on converting the old tests (K572) carried by the inventory's entries (K573). An `N` entry's text is in `build/plan/next.md`; the old battery's classes in `build/plan/legacy-inventory.tsv`. Bob's weekly meter at the opening: 48% (K568).

**Rules at the opening.** T16's rules hold (`archive/T16.md`): long batteries in the foreground, in chunks under ten minutes, the record pushed after each; a provider a later job of its layer needs merges early (§4, K425); legacy-checks' N372 runs first in layer 1 (K529); promotion stamps at layer 2, last in it, every row change from T16's layers 3+ and T17's layers 1–2 (N318, K425), and rows added at T17's layers 3+ are named `awaiting stamp` for T18; legacy-tests runs alone, last (K420, K427), retiring a covered extracted suite before re-anchoring anything (K457); a job names each `not yet met` mark its work meets and BOB strikes it (K460); after each extraction merge BOB runs `test/m/` whole on the tranche.

**Beside the layers (K570):** a worker for BOB classifies all 371 old suites (`bio-plane/test/*.mjs`, `civicos-ui/test/`) as *covered* (retire), *convert* (an entry for the owning module's next job: a requirement-named module test, then the suite retires) or *system* (census, DEC-49 guard, bundle freshness: layer tests or the release regression). T18 carries the first conversion entries.

## Layer 1

- **docprofile** · N390 (K573): the staff-directory suite converted to R4–R6 module tests.
- **legacy-checks** · N372 first (K529; LEGACY-CHECKS #10 J2 items 2–3, J3): delete the private `checkPublishedExtension` (`bio-checks.mjs`:2428–2653) and :8061–8669 (the C-41 header, `CASE_DOCUMENT_FORMAT` and `_V3`, `_V2`, `_LEGACY`, `CASE_DOCUMENT_FORMATS_ACCEPTED`, `caseDocumentStatesMemberBlocks`, `caseDocumentRequiresDisclosures`, `caseDocumentRequiresV4Disclosures`, `SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY`, `CASE_CITATION_VERSIONS`, the private `CITATION_NAMES_CAPTURE` and `C41`, `checkCaseDocument`; 170 exports remain of 182); keep `SUBJECT_POSITIONS`, `STRENGTH_STATES`, `CASE_MEMBER_ROLES`, `isCaseMemberBytes`, `caseEditionClaimed`; re-point the comments at :240, :251, :257, :2516–2537, :2694–2709, :4652–4657 to ratification. The job first confirms T16's promotion, ratification and legacy-tests left no importer (K529). N221's and N249's catalogue-copy clauses go with it (the job reports them). Stales `agent-worker/dist/agent-worker.bundled.mjs` (J2 (7)).

## Layer 2

- **membership** · N387 (K571): `MACHINE_CANNOT_REGISTER_KEY` gets its catalogue row, translation and region; merged before promotion's stamp.

- **record-core** · N376 (K540; SOURCES #1 J2 (3)): `MINTED_OBJECT` gains `SRC`, so `mintExhausted` for sources names a source.
- **promotion** · The stamp, last (K425): `CATALOG_VERSION` from 1.46.0 (K536) over every row change since. T16's layers 3+, named `awaiting stamp` in their records: capture C-118.3–C-118.6 added (`jobs/T16/capture.md` J3); sources C-121.1–C-121.6 added (`sources.md` J2); inquiry C-2.18 `CONTRADICTION_ARM_FAILED` added and C-2.15's translation changed (`inquiry.md`; K543). The gate's composition: registrations renamed to `tasks` (K531). T16's layer 8 (K557): publication C-122.1 `SOURCE_CONSENT_WITHDRAWN` added, in a new family `CASE_SOURCES_CHECKS` (`jobs/T16/publication.md`:33; K554); case-authoring C-120.4–C-120.7 added in `CASE_DISCLOSURE_CHECKS`, whose words become "a case's disclosures and its pre-flight"; C-120.7 gives `UNCLEARED_HUNCH` its first row (`case-authoring.md`:30, :41); ratification's six `where`s moved to `src/ratification/refusals.mjs`: C-32.13, C-32.15, C-53.12, C-65.1, and C-92.10 and C-92.11 with their region split and renamed `is-attribution-unchosen` and `is-attribution-stale` (`ratification.md`:39–47; K555). `NO_ATTESTING_KEY` and `PREFLIGHT_UNDETERMINED` have no rows (K552). T16's layer 11 (K563): C-19.1 (`checkInboxGrammar`), C-19.2, C-32.10, C-32.11 and C-76.1 moved from `queue/checks.mjs` to `src/tasks/checks.mjs` with a new `where`, and queue's copies retired (`tasks.md`:26, `queue.md`:21; K562). The gate's composition: queue's `registerStep("queue")` retired and tasks' `registerStep("tasks")` is the live step; record-core's audit likewise changes from queue's registration to `registerAuditCheck("tasks")` (K531, `queue.md`:21). Queue-producers, affordances and control-plane change no row. Any row or composition change T16's legacy-tests names. T17's layer 1: N372's census change, C-41.1–C-41.15's catalogue copies departing and the catalogue's case-document arms of C-2.8, C-3.1, C-21.1 (`legacy-checks.md` J3). `ROW_CENSUS` (R50) re-pinned.

## Layer 3

- **capture** · N388: `captureaccounts` and `lateattestations` gated by sight; `op=reattest`'s machine fence confirmed or added.

- **provenance** · N381 first (K560): the register rules admit capture R65's pulled-knock document (a null grade on R51's doorbell basis; `doorbell` among the origin kinds). Until it lands, every `op=inboxpull` is refused with nothing written.

- **sources** · N377 (K547; REEVALUATION #6 J2): a test at the module pinning R15's `source_knocks` read contract (its columns, one row per pulled knock a minted source stands behind, no value or contact), as inquiry R40's is pinned; R15's mark goes with it.

- **capture** (layer 3) · N380 (K559): a `within` seam in `pullKnock`, so control-plane R36's pull and promotion are one act; control-plane takes it in layer 11.

## Layer 4

- **extraction** · N391 (K573): the staff-directory end-to-end converted to an R4 module test.

## Layer 5

- **retrieval** · N392 (K573): R5's single-bundle decoration moved from legacy-store, and `projection-noproject` converted. Merge early for basis-versions (K425).

## Layer 6

- **basis-versions** · N392's share: `no_project_conclusion` equals R11's answer, tested at the module.
- **inquiry** · N393 (K573): R13 and R6's fidelity-bounded capture ceiling tested at the module.
- **contradiction** · N394 (K573): the over-strictness gate's requirement proposed, then tested, or shown a release measurement.
- **strength** · N395 (K573): D-269's requirement proposed and tested at the interface.

## Layer 7

- **reevaluation** · N378 (K556; CASE-AUTHORING #5 J2 (4)): R8's listeners are called after the act commits, never inside a caller that rolls back.

## Layer 8

- **case-authoring** · N383: the two regions' `where` re-pointed to `#tensionsJudged` (clears the guard's 2). N384: grade B read from provenance's `EARNED_CAPTURE_CEILING`.
- **ratification** · N385: `MACHINE_CANNOT_RATIFY_CASE` chosen by the predicate, not the word "ai".

## Layer 9

- **actions** · N396 (K573): DEC-13's request-for-comment rules as actions' requirement, proposed and tested.
- **conformance** · N362 (K569; CONFORMANCE #4 J2): R21's sides carry `text` from `content.passageText` (its R46), `null` where it answers `null`, only on a side R21 already answers the viewer; R21's mark goes.

## Layer 11

- **instance-setup** · N397 (K573): the key-line split and `content_hash` requirements proposed and tested.
- **tasks** · N374 (K565): R6's `taskExists({id, viewer})`, gated by R2's gate (R9), so a task the viewer may not see answers as no task (today `taskExists(id)`, `src/tasks/index.mjs`:456). N373's share (K566): R6's `recentTasks` takes an optional `statuses` filter. Merge it early for queue (K425). N382 (CONTROL-PLANE #7 J4): its `NOT_YOURS` (C-76.1) gets its own code, apart from intent's C-111.15, tested at the control plane's door. That is a row change in layer 11, so it is `awaiting stamp` for T18.


- **queue** · N373 (K531): the feed reads tasks capped at `cap×2` before dropping resolved ones (`queue/index.mjs`:2455 before the split), so many recently resolved tasks can hide open ones, short of R8.
- **queue** · N373 (K531): the feed reads tasks through `tasks.recentTasks({viewer, limit: cap * 2})` of any status before dropping the resolved ones (`queue/index.mjs`:754), so many recently resolved tasks can hide open ones, short of R8: read `recentTasks({viewer, limit, statuses: ["open", "forwarded"]})` (K566). N374's share (K565): R19 asks `taskExists({id, viewer})` (`queue/index.mjs`:1447) and classes a hidden task's id alike to an absent one (`UNKNOWN_KIND`), after tasks merges early. N375's share: R1 catalogues `signer-self-registered` (OBLIGATION, with its sentence) in `queuestate.mjs`, landed before queue-producers' R14. Also the stale "LIVE: queue/proposals.mjs" in `queuestate.mjs`:102 and :105, which is now `queue-producers/proposals.mjs` (QUEUE-PRODUCERS #1 J1 (4)).
- **control-plane** · N388's share (K580): stamp `viewer` on `op=captureaccounts` (its REC30_VIEWER_READS list), so capture R69's gate reaches callers. N398, N399 (K573): `surfaced_by`, the machine lease's actor, `op=purge`'s confirmation gate and `op=stats`' disclosure, each requirement proposed and tested. N386: `pull.mjs`:26's stamp through `record-core.stampInstant`. N380's share (K559): R36's route calls capture's `pullKnock({…, within})`, so the pull and the promotion are one act; R36's N380 mark goes. N381's share (K560): R36's end-to-end filing, a `test.todo` naming N381 in `test/m/control-plane/doorbell.test.mjs`, runs against the real provenance and capture; its mark goes. N379 (K566, replacing K558's owner): control-plane's `controlPlaneRoutes` (`dispatch.mjs`) dispatches `sourcesOps`, beside its own-key and `inboxpullfile` routes. Both follow layer 3's capture and provenance entries.

## Last: legacy-tests (K420, K427, K457)

- **legacy-tests** · **The conversion first (K572, K573), from `build/plan/legacy-inventory.tsv`:** delete every `covered` and `dead` suite with its helpers (311 + 67 files); for each marked `?`, first run the module tests it names and confirm they prove what it checks, else report it as `convert` to BOB. Move the 49 `system` suites into `bio-plane/test/system/`, run by BOB at each tranche close and at release. Move the legacy-ui suites (78 `convert` in `civicos-ui/test/`, with their helpers) to `civicos-ui/test/release/`, run only at release and retired with the old app (K5). Never delete a suite whose conversion entry (N390–N399) has not merged. Then, scoped by K570: run only the old suites that read a file T17 changed (the job lists them from the tranche's diff before running anything), in parallel chunks, the DEC-49 guard once at the end rather than at every merge; never the whole battery (release only, P11). Alongside, it retires each suite a module test already covers (K457) and names the rest for K570's inventory. K457 first. Then: `d470-catalog-census` and the R50 census suite over the new catalogue version (PROMOTION's T17 record), the catalogue file's census without the C-41 ids (N372, `legacy-checks.md` J3); T16's `awaiting stamp` declarations in `row-census`' `AWAITING_STAMP` retired now the rows are stamped: C-118.3–.6, C-121.1–.6, C-2.18, C-122.1, C-120.4–.7, and the moved `where`s of ratification's six and tasks' five. T17's new rows are named (N382's, `awaiting stamp` for T18). The DEC-49 guard's floors re-pinned from its print: C-2.18's row, region and site (INQUIRY #5); publication's `CASE_SOURCES_CHECKS` family, row, site, region and outcome; case-authoring's four rows, sites and regions; ratification's moved regions (`ratification.md`:55–62); tasks' moved sites; N372's departures; arm E's `vocabularyTerms` for N375's kind; arm A's `NOT_YOURS` once N382 lands. `test/d311-roster-affordances.test.mjs`:376, :381 get a `sourceconsent` drive once N379 routes `sourcesOps` (AFFORDANCES #8 J2 (1)). Whatever T16's legacy-tests left carried and T17's layers break, each named with its owner.

## Not in T17

**Bob's first:** N317, N303's remainder, N320; N61 (a meaning change: `records_laws` levels); N71 (the word "bundle"); N144, N232, N241, N371, N389 (UX: surfaces, recipes, legacy-ui's types and writes).

**Needs a deployment or measurement no job can make:** contradiction R41, the K5 gate arm and R24/R27/R32/R33's K5 arms and R34 (a measured recommender run; `test.todo`, K488, K490); DIST-14, N75 (a deployed plane); N34 (a measured JPX bound, and BOB reviews pdf-worker's split first); N22 (a non-root container).

**To word before a job runs:** N336 (installer R20, DIST-15).

**Waiting on another module or tranche:** N13 (store's imports of affordances, queue and now tasks, K551; architecture's standing failures), N21, N26, N31, N57, N248, N279, N68, N70, N136 (W2), N137, N155, N157, N211 (`SUBJECT_POSITIONS` stays in the catalogue while affordances and ai-runs import it, LEGACY-CHECKS #10 J2 (2)), N245, N249's other clauses, N242's other owners' shares (each owner's next job), N272, N337; N175 is the process repo's (`checks/ownership.mjs`:102).

