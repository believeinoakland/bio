# Plan: tranche T16

**Status** · DRAFT · reviewed by BOB #69, points 1–5 ruled (K494); written by a worker for BOB #69, 2026-09-30, read on `tranche/T15` @ fd35ffcc8f (layers 1, 2, 5, 6 closed, K482, K483, K486, K492; layer 7 running; layers 8–11 and legacy-tests still to run). Re-read against T15's close before opening (K424's and K451's practice): whatever T15's layers 7–11 and legacy-tests defer, report or name `awaiting stamp` folds in then.

Cut from T15's "Not in T15" (`current.md`), `next.md`'s open entries, rulings K470–K493 and the T15 job records (`build/jobs/T15/*.md`). An `N` entry's text is in `build/plan/next.md`. Line numbers are as read on `tranche/T15` today; a job re-finds them.

**Rules at the opening.** T15's rules hold (`current.md`): long batteries in the foreground, in chunks under ten minutes, the record pushed after each; a provider a later job of its layer needs merges early (§4, K425); promotion stamps at layer 2, last in it, every row change from T15's layers 3+ and T16's layers 1–2 (N318, K425), and rows added at T16's layers 3+ are named `awaiting stamp` for T17; legacy-tests runs alone, last (K420, K427), retiring a covered extracted suite before re-anchoring anything (K457); a job names each `not yet met` mark its work meets and BOB strikes it (K460); after each extraction merge BOB runs `test/m/` whole on the tranche.

## Layer 2

- **membership** · N357, only if BOB rules the wording below (W1) before the opening: `viewerPredicate`'s member arm (`membership/index.mjs`:36–53) reads a `members` row only, so `member:admin` (the founder's spelling elsewhere, :478, :895) sees no project it does not join while bare `admin` sees all (:41). Merged early for promotion (K425).
- **promotion** · The stamp, last (K425): `CATALOG_VERSION` 1.45.0 → 1.46.0 (`gate.mjs`:360) over every row change since 1.45.0 (K483). T15's layers 3+, named `awaiting stamp` in their records: entities C-91.7 `NO_SUCH_RESOLUTION` added (`jobs/T15/entities.md`:31); inquiry C-2.11–C-2.17 added in `INQUIRY_CONTRADICTION_CHECKS` (`inquiry.md`:16, :38); contradiction C-60.2, C-60.3, C-93.8–C-93.39 added (34 rows) and C-93.1–C-93.3's `where` moved to `#runRefusals` (`contradiction.md`:17); case-authoring C-120.1–C-120.3 (layer 8) and conformance C-113.24–C-113.27 (layer 9), once their records name them; any other row a T15 record of layers 7–11 names. The gate's composition: inquiry's registered step now runs R47's arm and C-2.17 (`inquiry/index.mjs`:2715), and contradiction registers a step of its own (R38; `contradiction/index.mjs`:225–226). T16's layers 1–2, if any (none planned). `ROW_CENSUS` (R50) re-pinned. Optional, N242's promotion share (the DEC-49 guard's carried red, LEGACY-TESTS #12 (4), N275): C-102.9's region at `gate.mjs`:480–483 carries no code.

## Layer 6

- **contradiction** · N359: R27's `stale` mark from a contradiction inquiry's CORRECTED conclusion answers `member: null, at: null` (`contradiction/index.mjs`:1430–1432, in `#marksOn`, not `#marksOf` as N359 says), though R36's resolve act already records `author` and the instant (`#appendAct`, :2038). Read them from that act. No row changes.
- **inquiry** · N358, only if BOB chooses to move the columns (open point 1; not recommended): R36's older clause, `inquiry_basis_count`, `inquiry_subject_entity`, `inquiry_superseded_by` to a table of its own (written at `inquiry/index.mjs`:503; read :2040, :2578), with a read service `contradiction` K2 joins instead (`contradiction/index.mjs`:428–438). On the recommended ruling no job: R36's clause goes by wording and its mark is struck.

- **inquiry** · N360 (K495): `divide` carries each apportioned leg's `content_id` to the child (R24's "verbatim"); a test that a child's leg names the parent leg's passage.

## Layer 7

- **reevaluation** · N359's share, after contradiction merges: R27's `corrected` cause reads the mark's instant as `since` (K493 (4) set it null with a stated sentence); the null-`since` test re-anchors, and whether R16's null-matching close still has a case is the job's report. Optional, N242's share: the DEC-49 guard's four unclassified outcomes (LEGACY-TESTS #12 (4)), if REEVALUATION #5 leaves them.

## Layer 8

- **ratification** · N354 (R17, worded K477, `not yet met`): the `registerholds` probe (`ratification/ops.mjs`:512–520) reads an unanswered `doAnswer` as not held in parts, so the gate answers `PLANE_MISSING_BYTES`; silence answers `STORE_DID_NOT_ANSWER` with the correlation, a refusal the store's own (`storeRefusal`).

## Layer 11

- **queue split** (N363, K507), first: the obligation inbox and the feed producers cut into two new modules before `queue`; then **queue** · T15's moved entry: N345 R1 amended, R43–R47; N352's share (`#hiddenBundles`, `queue/index.mjs`:167, reads membership R88).

## Outside a module

- **docs** · N225: `docs/development/SCHEDULER.md` still names twelve consumers in `store.mjs`; the registry is `src/scheduler/index.mjs`:40–44, fifteen (`intent-age`, `notice-sweep` after `bias-debt`). BOB's edit, no job (docs is `not_product`).

## Last: legacy-tests (K420, K427, K457)

- **legacy-tests** · K457 first. Then: `d470-catalog-census` A1, A3, A9 and the R50 census suite over 1.46.0, T15's `awaiting stamp` declarations retired now the rows are stamped; the DEC-49 guard's floors re-pinned from its print (T15's rows, and promotion's region if it takes N242's share); the suites N359 moves (a CORRECTED inquiry's `stale` mark with member and instant); whatever T15's legacy-tests leaves carried and T16's layers break, each named with its owner.

## Not in T16

**Bob's first:** N345's DEC-78, DEC-80 and DEC-81 parts (BOB drafts, Bob approves; ids re-count at the fold, K454; `/5` shared with DEC-81); N317, N303's remainder, N320; N61 (a meaning change: `records_laws` levels); N71 (the word "bundle"); N144, N232, N241 (UX: surfaces, recipes, legacy-ui's six types); the queue split (draft-T15 point 6: a new product module, inbox and feed producers), unless Bob has approved it, when queue's entry is re-cut.

**Needs a deployment or measurement no job can make:** contradiction R41, the K5 gate arm and R24/R27/R32/R33's K5 arms and R34 (a measured recommender run; `test.todo`, K488, K490; K5 candidates stay unshown); DIST-14, N75 (a deployed plane); N34 (a measured JPX bound, and BOB reviews pdf-worker's split first); N22 (a non-root container).

**To word before a job runs, not drafted here:** N336 (installer R20, DIST-15: what "carried from the signed release" names in the release manifest; `PLANE_LIMITS` still a constant, `newgroup/src/index.mjs`:343).

**Waiting on another module or tranche,** as in T15's list: N13 (store's imports of affordances and queue; architecture's 3 standing), N21, N26 (with a ¶ migration), N31 (with `tools/`' retirement), N57, N248, N279 (controls only once the guard and meaning-bounds are green, K317), N68, N70, N136 (with query-language's `legs`; see open point 1), N137, N155, N157, N211, N221, N249 (ratification registering at every host), N245, N272, N337 (a composed catalogue), N65 (3), N79; N175 is the process repo's (`checks/ownership.mjs`:102 still excludes a name after `.`, so `...name(` is unseen: not met).

**T15's own, still to run there:** N355 (filings, layer 9), N356 (control-plane, layer 11), N342's and N348's remainders, N345's layers 8–11: if T15 defers any, it joins T16 at the re-read.

## BOB's points before opening

**Ruled (K494):** 1 as recommended (W2; no inquiry job); 2 as recommended (W1, a clarification of R43's founder arm, not a change of meaning; N357 runs); 3 take both N242 shares; 4 at the opening; 5 hold T16 for T15's re-read. W1–W3 fold into the requirements when T16 opens (K479). In the entries above, read "only if BOB rules" as ruled, and inquiry's layer-6 entry as dropped.

1. **N358: resolve inquiry R36 against R40.** Recommended: keep `bundles.inquiry_subject_entity` (and its two siblings) where they are, as R40's read contract, and strike R36's older clause (K75 (3)), leaving the move to N136, which already waits on query-language and the store reading a moved column. R40 is the later ruling (K181) and a live join depends on it (`contradiction/index.mjs`:428–438); moving the columns now costs an inquiry job, a read service and a contradiction re-anchor for no change of meaning. A wording clarification, BOB's (P17); then no inquiry job in T16.
2. **N357: rule W1** (below), or N357 drops from layer 2. Recommended: the two spellings alike, since R43 already says the founder sees every bundle.
3. **N242's optional shares** (promotion's C-102.9 region; reevaluation's four outcomes): take them with the jobs T16 already opens, or leave the guard's three carried. Recommended: take them; each is a few lines in a job already running.
4. **next.md housekeeping:** entries T13–T15 carried in full move to `archive/next-applied.md` at the opening. Checked in code and looking met: N212, N251 (no `CASE_DERIVATION_CHECKS` or `ATTRIBUTION_CHECKS` in `bio-checks.mjs`), N340 (`promotion/index.mjs`:44 `REOPENABLE_FROM = DISPOSITIONS`), N343 (`store.mjs`:753 through bias's `migrate`), N349 (`index.mjs`:150–255 pass `correlation`), N351, N352 (K483, K486); by the archives also N30, N214, N238, N250, N277, N318, N319, N321, N322, N324–N335, N338, N339, N341, N346, N347, N350. N354 and N355–N359 stay until applied.
5. T16 is small (six jobs at most, four if points 1–2 go as recommended). BOB may hold it for T15's re-read to add what layers 7–11 defer, or join it to the DEC-78/80/81 fold if Bob approves those parts first.

## Wordings BOB must rule

New ids and changed text wait here, not in the requirements files, until their job's tranche opens (coverage: a live id is named by a test).

- **W1** membership **R43** (N357), added sentence: "The founder's viewer is spelled bare `admin` or `member:admin`; both see every bundle, and the member id the rule returns is `admin` for the second and null for the first." (`hiddenBundles`, R88, then answers null for both, as the complement of R43.)
- **W2** inquiry **R36** (N358, on point 1's recommendation): drop "the columns this module writes on `bundles` today (…) move to a table of its own keyed by `bundle_id` (K75 (3));" and its `not yet met` mark; R40 stands as written, and N136 keeps the move.
- **W3** contradiction **R27**'s `stale` bullet (N359), clarifying, meaning unchanged: "…the member and the instant (for a resolution concluded by a contradiction inquiry, R36's concluding member and the conclusion's instant)…".
