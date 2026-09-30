# Plan: tranche T17

**Status** · DRAFT · written by a worker for BOB #72, 2026-09-30, read on `tranche/T16` @ b5c4885d9d (layers 1, 2, 3, 6, 7 closed, K532, K536, K542, K546, K548; layers 4–5 carried no entries; layers 8 and 11 running; legacy-tests still to run). Re-read against T16's close before opening (K424's and K451's practice).

Cut from T16's "Not in T16" (`current.md`), `next.md`'s open entries, rulings K527–K552 and the closed T16 job records (`build/jobs/T16/*.md`). An `N` entry's text is in `build/plan/next.md`. Line numbers are as the records read them on `tranche/T16`; a job re-finds them.

**Still to add at T16's close.** T16's layer 8 (publication, ratification, case-authoring) and layer 11 (tasks, queue-producers, queue, affordances, control-plane) are running and their records are not written. Whatever they and T16's legacy-tests defer, report for T17 or name `awaiting stamp` folds in when those layers close: into promotion's stamp below, into their own modules' entries, and into legacy-tests.

**Rules at the opening.** T16's rules hold (`current.md`): long batteries in the foreground, in chunks under ten minutes, the record pushed after each; a provider a later job of its layer needs merges early (§4, K425); legacy-checks' N372 runs first in layer 1 (K529); promotion stamps at layer 2, last in it, every row change from T16's layers 3+ and T17's layers 1–2 (N318, K425), and rows added at T17's layers 3+ are named `awaiting stamp` for T18; legacy-tests runs alone, last (K420, K427), retiring a covered extracted suite before re-anchoring anything (K457); a job names each `not yet met` mark its work meets and BOB strikes it (K460); after each extraction merge BOB runs `test/m/` whole on the tranche.

## Layer 1

- **legacy-checks** · N372 first (K529; LEGACY-CHECKS #10 J2 items 2–3, J3): delete the private `checkPublishedExtension` (`bio-checks.mjs`:2428–2653) and :8061–8669 (the C-41 header, `CASE_DOCUMENT_FORMAT` and `_V3`, `_V2`, `_LEGACY`, `CASE_DOCUMENT_FORMATS_ACCEPTED`, `caseDocumentStatesMemberBlocks`, `caseDocumentRequiresDisclosures`, `caseDocumentRequiresV4Disclosures`, `SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY`, `CASE_CITATION_VERSIONS`, the private `CITATION_NAMES_CAPTURE` and `C41`, `checkCaseDocument`; 170 exports remain of 182); keep `SUBJECT_POSITIONS`, `STRENGTH_STATES`, `CASE_MEMBER_ROLES`, `isCaseMemberBytes`, `caseEditionClaimed`; re-point the comments at :240, :251, :257, :2516–2537, :2694–2709, :4652–4657 to ratification. The job first confirms T16's promotion, ratification and legacy-tests left no importer (K529). N221's and N249's catalogue-copy clauses go with it (the job reports them). Stales `agent-worker/dist/agent-worker.bundled.mjs` (J2 (7)).

## Layer 2

- **record-core** · N376 (K540; SOURCES #1 J2 (3)): `MINTED_OBJECT` gains `SRC`, so `mintExhausted` for sources names a source.
- **promotion** · The stamp, last (K425): `CATALOG_VERSION` from 1.46.0 (K536) over every row change since. T16's layers 3+, named `awaiting stamp` in their records: capture C-118.3–C-118.6 added (`jobs/T16/capture.md` J3); sources C-121.1–C-121.6 added (`sources.md` J2); inquiry C-2.18 `CONTRADICTION_ARM_FAILED` added and C-2.15's translation changed (`inquiry.md`; K543). The gate's composition: registrations renamed to `tasks` (K531). T16's layer 8: ratification's six `where`s moved to `src/ratification/refusals.mjs` (C-32.13, C-32.15, C-53.12, C-92.10, C-92.11, C-65.1; K555); publication C-122.1 (K554). T16's layers 8 and 11 when they close: and case-authoring C-120.4–C-120.7 as T16's plan names them (K530), and any row or composition change their records name. T17's layer 1: N372's census change, C-41.1–C-41.15's catalogue copies departing and the catalogue's case-document arms of C-2.8, C-3.1, C-21.1 (`legacy-checks.md` J3). `ROW_CENSUS` (R50) re-pinned.

## Layer 3

- **sources** · N377 (K547; REEVALUATION #6 J2): a test at the module pinning R15's `source_knocks` read contract (its columns, one row per pulled knock a minted source stands behind, no value or contact), as inquiry R40's is pinned; R15's mark goes with it.

## Layer 7

- **reevaluation** · N378 (K556; CASE-AUTHORING #5 J2 (4)): R8's listeners are called after the act commits, never inside a caller that rolls back.

## Layer 10

- **legacy-store** · N379 (K558): the durable object dispatches `sourcesOps`.

## Layer 11

On the modules T16's layer 11 writes (N363's split); re-read at its close.

- **queue** · N373 (K531): the feed reads tasks capped at `cap×2` before dropping resolved ones (`queue/index.mjs`:2455 before the split), so many recently resolved tasks can hide open ones, short of R8.

## Last: legacy-tests (K420, K427, K457)

- **legacy-tests** · K457 first. Then: `d470-catalog-census` and the R50 census suite over the new catalogue version (PROMOTION's T17 record), the catalogue file's census without the C-41 ids (N372, `legacy-checks.md` J3); T16's `awaiting stamp` declarations in `row-census`' `AWAITING_STAMP` retired now the rows are stamped, and T17's new rows named; the DEC-49 guard's floors re-pinned from its print (C-2.18's row, region and site, INQUIRY #5; N372's departures); whatever T16's legacy-tests left carried and T17's layers break, each named with its owner.

## Not in T17

**Bob's first:** N362 (conformance R21's sides gain `text`; an addition to a provided service, recommended yes); N317, N303's remainder, N320; N61 (a meaning change: `records_laws` levels); N71 (the word "bundle"); N144, N232, N241, N371 (UX: surfaces, recipes, legacy-ui's types and writes).

**Needs a deployment or measurement no job can make:** contradiction R41, the K5 gate arm and R24/R27/R32/R33's K5 arms and R34 (a measured recommender run; `test.todo`, K488, K490); DIST-14, N75 (a deployed plane); N34 (a measured JPX bound, and BOB reviews pdf-worker's split first); N22 (a non-root container).

**To word before a job runs:** N336 (installer R20, DIST-15); N374 (tasks R19's ungated task-id check against R33's parity: BOB words which it is); N375 (queue-producers: R89's notice to each administrator as a feed item, K535; no queue-producers requirement names it yet).

**Waiting on another module or tranche:** N13 (store's imports of affordances, queue and now tasks, K551; architecture's standing failures), N21, N26, N31, N57, N248, N279, N68, N70, N136 (W2), N137, N155, N157, N211 (`SUBJECT_POSITIONS` stays in the catalogue while affordances and ai-runs import it, LEGACY-CHECKS #10 J2 (2)), N245, N249's other clauses, N242's other owners' shares (each owner's next job), N272, N337; N175 is the process repo's (`checks/ownership.mjs`:102).

## BOB's points before opening

1. **next.md housekeeping:** N342 (K476, K513), N348 (K476, K479), N355 (K505), N356 (K519) read applied in the rulings yet stay in `next.md`; N225 applied (K528); N357–N361 (N361's remainder is N372), N363–N370 and N354 carried by T16. Checked, they move to `archive/next-applied.md` at the opening. N65 and N79, on T16's waiting list, are already in `archive/next-applied.md` (N79's capture mark struck, K540).
2. **N375:** worded by BOB at the opening (within Bob's K509 (2), K535), it joins layer 11 as queue-producers'.
3. **N352:** queue's share runs in T16's layer 11; whether a retrieval share (`hiddenSet`) remains is for the re-read.
4. T17 is small before the re-read (legacy-checks, record-core, promotion, sources, queue, legacy-tests).
