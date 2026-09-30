# Plan: tranche T16

**Status** · OPEN · BOB #71 · session_01JiByJfjPwzScEvLLa5njn7 · depth 1

Opened by BOB #71, 2026-09-30 (PROCESS-MECHANICS §5), at `main` @ f5554232cb, T15 closed (K525). Cut from `draft-T16.md` (re-read at T15's close by BOB #70: N359–N371 folded, K517, K523, K524; points 1–5 ruled, K494). N364 (Bob's DEC-78/80/81 rulings, K509) and W1–W5 fold into the requirements before layer 2 starts (K527); `sources` entered `modules.json` at the opening. An `N` entry's text is in `build/plan/next.md`. Bob's weekly meter at the opening: asked.

**Jobs** ·

**Rules at the opening.** T15's rules hold (`archive/T15.md`): long batteries in the foreground, in chunks under ten minutes, the record pushed after each; a provider a later job of its layer needs merges early (§4, K425); promotion stamps at layer 2, last in it, every row change from T15's layers 3+ and T16's layers 1–2 (N318, K425), and rows added at T16's layers 3+ are named `awaiting stamp` for T17; legacy-tests runs alone, last (K420, K427), retiring a covered extracted suite before re-anchoring anything (K457); a job names each `not yet met` mark its work meets and BOB strikes it (K460); after each extraction merge BOB runs `test/m/` whole on the tranche. `main` is not releasable until N366 merges (K523).

## Layer 1

- **legacy-checks** · N361 (K498, K500): retire the catalogue's `checkCaseDocument` fallback (`gate.mjs`:491, used when no promotion instance registers ratification's), which accepts only `bio-case-document/4` and older; the live path is ratification's over publication R20. Its parity test `test/m/ratification/checks.test.mjs`:133, accepted red by name since K500, is ratification's to retire or re-anchor (report it).

## Layer 2

- **membership** · N357 (W1, K494): `viewerPredicate`'s member arm (`membership/index.mjs`:36–53) reads a `members` row only, so `member:admin` (the founder's spelling elsewhere, :478, :895) sees no project it does not join while bare `admin` sees all (:41); R43 as worded. Merged early for promotion (K425).
- **membership** (same job) · N364 (DEC-80 item 4; K509 (2)): R89–R91 (a member registers their own browser-held attesting key from a signed-in session, every administrator notified and able to revoke), R27 amended, row C-96.15.
- **promotion** · The stamp, last (K425): `CATALOG_VERSION` 1.45.0 → 1.46.0 (`gate.mjs`:360) over every row change since 1.45.0 (K483). T15's layers 3+, named `awaiting stamp` in their records: entities C-91.7 `NO_SUCH_RESOLUTION` added (`jobs/T15/entities.md`:31); inquiry C-2.11–C-2.17 added in `INQUIRY_CONTRADICTION_CHECKS` (`inquiry.md`:16, :38); contradiction C-60.2, C-60.3, C-93.8–C-93.39 added (34 rows) and C-93.1–C-93.3's `where` moved to `#runRefusals` (`contradiction.md`:17); case-authoring C-120.1–C-120.3 (layer 8) and conformance C-113.24–C-113.27 (layer 9); any other row a T15 record names. The gate's composition, named `awaiting stamp` by LEGACY-TESTS #13 (K524): contradiction's R38 registered promote step, and inquiry's registered step now runs R47's arm and C-2.17 (`inquiry/index.mjs`:2715), and contradiction registers a step of its own (R38; `contradiction/index.mjs`:225–226). T16's layers 1–2: legacy-checks' retired copy (N361) if it moves a row, and membership's C-96.15. `ROW_CENSUS` (R50) re-pinned. N242's promotion share (K494 point 3; the DEC-49 guard's carried red, LEGACY-TESTS #12 (4), N275): C-102.9's region at `gate.mjs`:480–483 carries no code.

## Layer 3

- **capture** · N364 (DEC-78, DEC-81 3(c); K509 (3)): R65–R70 (the pulled knock filed as a capture with its receipt, route `doorbell`; the keyed contact digest; R69 through `signatures`), R16, R20 (clear its stale co-attestation mark if the code meets it, K497), R32, R37, R53, R54 amended; rows C-118.3–C-118.6. `uses` gains signatures.
- **sources** · N364, a new product module (K509 (1)), after `capture`: R1–R14, a source's dated, attributed disclosure history, sight-restricted and read-logged, pseudonym consent by knocker secret (at least 20 characters, K497) or a member's evidenced record, hand-carried material's rule (R12, not built); rows C-121.1–C-121.6. Its first job writes the module whole. Capture merges early for it (R65–R67; §4, K425), and it merges the tranche then.
- **provenance** · N364's share (K509 (3); W4): `captureGrade` for route `doorbell`, received not fetched, chain of custody from the knock's receipt.

## Layer 6

- **contradiction** · N366 first (K523): the candidate read's `reach` and `{project}` subject leak hidden projects; fix at the interface with the two-hidden-projects fixture. Then N368: bounds on `tensionsOn` and `contextFacts`; `contradictionnotices`' `truncated` driven at its cut. N359 (W3): R27's `stale` mark from a contradiction inquiry's CORRECTED conclusion reads the member and instant from R36's resolve act (`#appendAct`, :2038; the mark is built in `#marksOn`, :1430–1432); no row changes. N365's read: whether a viewer sees both sides of an inquiry's linked candidate (as worded, K527). Merged early for reevaluation (layer 7) and affordances (layer 11) only through the tranche.
- **inquiry** · N369: the second `CONTRADICTION_LINK_MALFORMED` site (`src/inquiry/contradiction.mjs`:208–211), C-2.15 as re-worded (K527). N360 (K495): `divide` carries each apportioned leg's `content_id` to the child (R24's "verbatim"); a test that a child's leg names the parent leg's passage. N358 is settled by wording (W2): R36's older clause struck, no column move.

## Layer 7

- **reevaluation** · N364: R28 (DEC-78 item 5(e)), R2's terms; `uses` gains sources. N359's share, after contradiction merges: R27's `corrected` cause reads the mark's instant as `since` (K493 (4) set it null with a stated sentence); the null-`since` test re-anchors, and whether R16's null-matching close still has a case is the job's report. N242's share (K494 point 3): the DEC-49 guard's four unclassified outcomes (LEGACY-TESTS #12 (4)), if REEVALUATION #5 left them.

## Layer 8

- **publication** · N364 (DEC-81): R51–R52, R2, R10, R20 amended (each document's grade and co-attestation into `/5`, K497); row C-122.1. `uses` gains sources.
- **ratification** · N364: R18–R19 (DEC-80 item 3). N354 (R17, worded K477, `not yet met`): the `registerholds` probe (`ratification/ops.mjs`:512–520) reads an unanswered `doAnswer` as not held in parts, so the gate answers `PLANE_MISSING_BYTES`; silence answers `STORE_DID_NOT_ANSWER` with the correlation, a refusal the store's own (`storeRefusal`). N361's parity test (`test/m/ratification/checks.test.mjs`:133) retired or re-anchored, as legacy-checks reports.
- **case-authoring** · N364 (DEC-80 item 3, DEC-81): R34–R37 (`op=publishpreflight`, write-free; `op=reattest` is capture's own act, K497), R12, R14, R29, R32 amended; rows C-120.4–C-120.7. `uses` gains sources, capture. N370: `#authority` and `#judgeMembers` answer their refusal flat, not nested. Publication and ratification merge early for it (R51, R18; §4, K425).

## Layer 11

- **queue split** (N363, K507), first: the obligation inbox and the feed producers cut into two new modules before `queue`, their seams worded by BOB before the layer; then **queue** · N367 (a direct R41 grammar test over the 31 bounds); T15's moved entry: N345 R1 amended, R43–R47; N352's share (`#hiddenBundles`, `queue/index.mjs`:167, reads membership R88).
- **affordances** · N364: R28–R29 (the rung backing, through sources and capture), R2, R3, R5 amended. `uses` gains sources, capture. N365's fact (R14, R8's arm; K527) from contradiction's read.
- **control-plane** · N364's share (W5): `op=inboxpull` routes to capture's `pullKnock` and promotes its document as a new information bundle at `collected` in the same act, the puller its author (DEC-78 item 1); routes, `NEEDS` rows and stamps for sources', membership's, case-authoring's and capture's new ops. `uses` gains sources.

## Outside a module

- **docs** · N225: `docs/development/SCHEDULER.md` still names twelve consumers in `store.mjs`; the registry is `src/scheduler/index.mjs`:40–44, fifteen (`intent-age`, `notice-sweep` after `bias-debt`). BOB's edit, no job (docs is `not_product`).

## Last: legacy-tests (K420, K427, K457)

- **legacy-tests** · K457 first. Then: `d470-catalog-census` A1, A3, A9 and the R50 census suite over 1.46.0, T15's `awaiting stamp` declarations retired now the rows are stamped; the DEC-49 guard's floors re-pinned from its print (T15's rows, and promotion's region); the suites N359 moves (a CORRECTED inquiry's `stale` mark with member and instant); whatever T15's legacy-tests left carried and T16's layers break, each named with its owner.

## Not in T16

**Bob's first:** N362 (conformance R21's sides gain `text`, the passage's words through `content.passageText`: an addition to a provided service, so his; recommended yes); N317, N303's remainder, N320; N61 (a meaning change: `records_laws` levels); N71 (the word "bundle"); N144, N232, N241, N371 (UX: surfaces, recipes, legacy-ui's types and writes).

**Needs a deployment or measurement no job can make:** contradiction R41, the K5 gate arm and R24/R27/R32/R33's K5 arms and R34 (a measured recommender run; `test.todo`, K488, K490); DIST-14, N75 (a deployed plane); N34 (a measured JPX bound, and BOB reviews pdf-worker's split first); N22 (a non-root container).

**To word before a job runs:** N336 (installer R20, DIST-15: what "carried from the signed release" names in the release manifest).

**Waiting on another module or tranche:** N13 (store's imports of affordances and queue; architecture's 3 standing), N21, N26, N31, N57, N248, N279, N68, N70, N136 (keeps inquiry's column move, W2), N137, N155, N157, N211, N221, N249, N245, N272, N337, N65 (3), N79; N175 is the process repo's (`checks/ownership.mjs`:102).
