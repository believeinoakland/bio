# Plan: tranche T17

**Status** · DRAFT · written by a worker for BOB #72, 2026-09-30, read on `tranche/T16` @ b5c4885d9d; layers 8 and 11 folded by a worker for BOB #73 at 8770cb5af5 (layers 1–3, 6–8, 11 closed, K532, K536, K542, K546, K548, K557, K563; layers 4–5 carried no entries; N374 and N375 worded, K565; legacy-tests still to run). Re-read against T16's legacy-tests close before opening (K424's and K451's practice).

Cut from T16's "Not in T16" (`current.md`), `next.md`'s open entries, rulings K527–K565 and the closed T16 job records (`build/jobs/T16/*.md`). An `N` entry's text is in `build/plan/next.md`. Line numbers are as the records read them on `tranche/T16`; a job re-finds them.

**Still to add at T16's close.** Layers 8 and 11 are folded (K557, K563). Whatever T16's legacy-tests defers, reports for T17 or names `awaiting stamp` folds in when it closes: into promotion's stamp below, into the named modules' entries, and into legacy-tests.

**Rules at the opening.** T16's rules hold (`current.md`): long batteries in the foreground, in chunks under ten minutes, the record pushed after each; a provider a later job of its layer needs merges early (§4, K425); legacy-checks' N372 runs first in layer 1 (K529); promotion stamps at layer 2, last in it, every row change from T16's layers 3+ and T17's layers 1–2 (N318, K425), and rows added at T17's layers 3+ are named `awaiting stamp` for T18; legacy-tests runs alone, last (K420, K427), retiring a covered extracted suite before re-anchoring anything (K457); a job names each `not yet met` mark its work meets and BOB strikes it (K460); after each extraction merge BOB runs `test/m/` whole on the tranche.

**Beside the layers (K570):** a worker for BOB classifies all 371 old suites (`bio-plane/test/*.mjs`, `civicos-ui/test/`) as *covered* (retire), *convert* (an entry for the owning module's next job: a requirement-named module test, then the suite retires) or *system* (census, DEC-49 guard, bundle freshness: layer tests or the release regression). T18 carries the first conversion entries.

## Layer 1

- **legacy-checks** · N372 first (K529; LEGACY-CHECKS #10 J2 items 2–3, J3): delete the private `checkPublishedExtension` (`bio-checks.mjs`:2428–2653) and :8061–8669 (the C-41 header, `CASE_DOCUMENT_FORMAT` and `_V3`, `_V2`, `_LEGACY`, `CASE_DOCUMENT_FORMATS_ACCEPTED`, `caseDocumentStatesMemberBlocks`, `caseDocumentRequiresDisclosures`, `caseDocumentRequiresV4Disclosures`, `SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY`, `CASE_CITATION_VERSIONS`, the private `CITATION_NAMES_CAPTURE` and `C41`, `checkCaseDocument`; 170 exports remain of 182); keep `SUBJECT_POSITIONS`, `STRENGTH_STATES`, `CASE_MEMBER_ROLES`, `isCaseMemberBytes`, `caseEditionClaimed`; re-point the comments at :240, :251, :257, :2516–2537, :2694–2709, :4652–4657 to ratification. The job first confirms T16's promotion, ratification and legacy-tests left no importer (K529). N221's and N249's catalogue-copy clauses go with it (the job reports them). Stales `agent-worker/dist/agent-worker.bundled.mjs` (J2 (7)).

## Layer 2

- **record-core** · N376 (K540; SOURCES #1 J2 (3)): `MINTED_OBJECT` gains `SRC`, so `mintExhausted` for sources names a source.
- **promotion** · The stamp, last (K425): `CATALOG_VERSION` from 1.46.0 (K536) over every row change since. T16's layers 3+, named `awaiting stamp` in their records: capture C-118.3–C-118.6 added (`jobs/T16/capture.md` J3); sources C-121.1–C-121.6 added (`sources.md` J2); inquiry C-2.18 `CONTRADICTION_ARM_FAILED` added and C-2.15's translation changed (`inquiry.md`; K543). The gate's composition: registrations renamed to `tasks` (K531). T16's layer 8 (K557): publication C-122.1 `SOURCE_CONSENT_WITHDRAWN` added, in a new family `CASE_SOURCES_CHECKS` (`jobs/T16/publication.md`:33; K554); case-authoring C-120.4–C-120.7 added in `CASE_DISCLOSURE_CHECKS`, whose words become "a case's disclosures and its pre-flight"; C-120.7 gives `UNCLEARED_HUNCH` its first row (`case-authoring.md`:30, :41); ratification's six `where`s moved to `src/ratification/refusals.mjs`: C-32.13, C-32.15, C-53.12, C-65.1, and C-92.10 and C-92.11 with their region split and renamed `is-attribution-unchosen` and `is-attribution-stale` (`ratification.md`:39–47; K555). `NO_ATTESTING_KEY` and `PREFLIGHT_UNDETERMINED` have no rows (K552). T16's layer 11 (K563): C-19.1 (`checkInboxGrammar`), C-19.2, C-32.10, C-32.11 and C-76.1 moved from `queue/checks.mjs` to `src/tasks/checks.mjs` with a new `where`, and queue's copies retired (`tasks.md`:26, `queue.md`:21; K562). The gate's composition: queue's `registerStep("queue")` retired and tasks' `registerStep("tasks")` is the live step; record-core's audit likewise changes from queue's registration to `registerAuditCheck("tasks")` (K531, `queue.md`:21). Queue-producers, affordances and control-plane change no row. Any row or composition change T16's legacy-tests names. T17's layer 1: N372's census change, C-41.1–C-41.15's catalogue copies departing and the catalogue's case-document arms of C-2.8, C-3.1, C-21.1 (`legacy-checks.md` J3). `ROW_CENSUS` (R50) re-pinned.

## Layer 3

- **provenance** · N381 first (K560): the register rules admit capture R65's pulled-knock document (a null grade on R51's doorbell basis; `doorbell` among the origin kinds). Until it lands, every `op=inboxpull` is refused with nothing written.

- **sources** · N377 (K547; REEVALUATION #6 J2): a test at the module pinning R15's `source_knocks` read contract (its columns, one row per pulled knock a minted source stands behind, no value or contact), as inquiry R40's is pinned; R15's mark goes with it.

- **capture** (layer 3) · N380 (K559): a `within` seam in `pullKnock`, so control-plane R36's pull and promotion are one act; control-plane takes it in layer 11.

## Layer 7

- **reevaluation** · N378 (K556; CASE-AUTHORING #5 J2 (4)): R8's listeners are called after the act commits, never inside a caller that rolls back.

## Layer 9

- **conformance** · N362 (K569; CONFORMANCE #4 J2): R21's sides carry `text` from `content.passageText` (its R46), `null` where it answers `null`, only on a side R21 already answers the viewer; R21's mark goes.

## Layer 11

- **tasks** · N374 (K565): R6's `taskExists({id, viewer})`, gated by R2's gate (R9), so a task the viewer may not see answers as no task (today `taskExists(id)`, `src/tasks/index.mjs`:456). N373's share (K566): R6's `recentTasks` takes an optional `statuses` filter. Merge it early for queue (K425). N382 (CONTROL-PLANE #7 J4): its `NOT_YOURS` (C-76.1) gets its own code, apart from intent's C-111.15, tested at the control plane's door. That is a row change in layer 11, so it is `awaiting stamp` for T18.


- **queue** · N373 (K531): the feed reads tasks capped at `cap×2` before dropping resolved ones (`queue/index.mjs`:2455 before the split), so many recently resolved tasks can hide open ones, short of R8.
- **queue** · N373 (K531): the feed reads tasks through `tasks.recentTasks({viewer, limit: cap * 2})` of any status before dropping the resolved ones (`queue/index.mjs`:754), so many recently resolved tasks can hide open ones, short of R8: read `recentTasks({viewer, limit, statuses: ["open", "forwarded"]})` (K566). N374's share (K565): R19 asks `taskExists({id, viewer})` (`queue/index.mjs`:1447) and classes a hidden task's id alike to an absent one (`UNKNOWN_KIND`), after tasks merges early. N375's share: R1 catalogues `signer-self-registered` (OBLIGATION, with its sentence) in `queuestate.mjs`, landed before queue-producers' R14. Also the stale "LIVE: queue/proposals.mjs" in `queuestate.mjs`:102 and :105, which is now `queue-producers/proposals.mjs` (QUEUE-PRODUCERS #1 J1 (4)).
- **control-plane** · N380's share (K559): R36's route calls capture's `pullKnock({…, within})`, so the pull and the promotion are one act; R36's N380 mark goes. N381's share (K560): R36's end-to-end filing, a `test.todo` naming N381 in `test/m/control-plane/doorbell.test.mjs`, runs against the real provenance and capture; its mark goes. N379 (K566, replacing K558's owner): control-plane's `controlPlaneRoutes` (`dispatch.mjs`) dispatches `sourcesOps`, beside its own-key and `inboxpullfile` routes. Both follow layer 3's capture and provenance entries.

## Last: legacy-tests (K420, K427, K457)

- **legacy-tests** · Scoped by K570: run only the old suites that read a file T17 changed (the job lists them from the tranche's diff before running anything), in parallel chunks, the DEC-49 guard once at the end rather than at every merge; never the whole battery (release only, P11). Alongside, it retires each suite a module test already covers (K457) and names the rest for K570's inventory. K457 first. Then: `d470-catalog-census` and the R50 census suite over the new catalogue version (PROMOTION's T17 record), the catalogue file's census without the C-41 ids (N372, `legacy-checks.md` J3); T16's `awaiting stamp` declarations in `row-census`' `AWAITING_STAMP` retired now the rows are stamped: C-118.3–.6, C-121.1–.6, C-2.18, C-122.1, C-120.4–.7, and the moved `where`s of ratification's six and tasks' five. T17's new rows are named (N382's, `awaiting stamp` for T18). The DEC-49 guard's floors re-pinned from its print: C-2.18's row, region and site (INQUIRY #5); publication's `CASE_SOURCES_CHECKS` family, row, site, region and outcome; case-authoring's four rows, sites and regions; ratification's moved regions (`ratification.md`:55–62); tasks' moved sites; N372's departures; arm E's `vocabularyTerms` for N375's kind; arm A's `NOT_YOURS` once N382 lands. `test/d311-roster-affordances.test.mjs`:376, :381 get a `sourceconsent` drive once N379 routes `sourcesOps` (AFFORDANCES #8 J2 (1)). Whatever T16's legacy-tests left carried and T17's layers break, each named with its owner.

## Not in T17

**Bob's first:** N317, N303's remainder, N320; N61 (a meaning change: `records_laws` levels); N71 (the word "bundle"); N144, N232, N241, N371 (UX: surfaces, recipes, legacy-ui's types and writes).

**Needs a deployment or measurement no job can make:** contradiction R41, the K5 gate arm and R24/R27/R32/R33's K5 arms and R34 (a measured recommender run; `test.todo`, K488, K490); DIST-14, N75 (a deployed plane); N34 (a measured JPX bound, and BOB reviews pdf-worker's split first); N22 (a non-root container).

**To word before a job runs:** N336 (installer R20, DIST-15).

**Waiting on another module or tranche:** N13 (store's imports of affordances, queue and now tasks, K551; architecture's standing failures), N21, N26, N31, N57, N248, N279, N68, N70, N136 (W2), N137, N155, N157, N211 (`SUBJECT_POSITIONS` stays in the catalogue while affordances and ai-runs import it, LEGACY-CHECKS #10 J2 (2)), N245, N249's other clauses, N242's other owners' shares (each owner's next job), N272, N337; N175 is the process repo's (`checks/ownership.mjs`:102).

## BOB's points before opening

1. **next.md housekeeping:** N342 (K476, K513), N348 (K476, K479), N355 (K505), N356 (K519) read applied in the rulings yet stay in `next.md`; N225 applied (K528); N357–N361 (N361's remainder is N372), N363–N370, N354 and N352 carried by T16 (N352: membership R88's `hiddenBundles` now read by the store (`store.mjs`:2070), retrieval (:747, :970) and queue-producers (:880); queue's copy removed, QUEUE #5; so no retrieval share remains). N364's remainders are their own entries (N375, N380, N381). N345 stays (contradiction R34, R41 marks). Checked, they move to `archive/next-applied.md` at the opening. N65 and N79, on T16's waiting list, are already in `archive/next-applied.md` (N79's capture mark struck, K540).
2. **N375, N374:** worded (K565) and in layer 11; queue R1 names `signer-self-registered` (K566).
3. **N352:** applied in full (point 1); no retrieval share remains.
4. T17's jobs: legacy-checks, record-core, promotion, provenance, sources, capture, reevaluation, tasks, queue-producers, queue, conformance, control-plane, legacy-tests.
