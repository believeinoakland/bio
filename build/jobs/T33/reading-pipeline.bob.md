# BOB to reading-pipeline (T33)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T33), layer 4, reading-pipeline: T33-23 (B1a.4; K1468, D177). Your requirements: `build/requirements/reading-pipeline.md` (read whole; folded for T33, K1505). Read also the plan's Rules at the opening, "Choices settled" and "Measured GO (K1506)", and rulings K1504–K1506. Layers below yours are closed and merged into `tranche/T33`. The hook is a provided service whose one caller is extraction (T33-23a, K1521); merge first.
Merge order in L4: reading-pipeline (the `onRead` hook) → extraction (its one caller, K1521) → content. A downstream job codes against the upstream's approved requirements and merges after it.
Inherited reds (plan Rules (9)): 1 (coverage of T33 ids not yours, until their merges), 2 (membership's order test, until T33-19a), 3 (case-checker R13's program SHA, until T33-73), 4 (importers of a copy-split's source, until re-pointed), 5 (the UI's DEC-88 tests, Bob's). Named reds from L1, all outside your module: ai-runs R18 `scheduler.test.mjs:123` (K1514); entities `idmatch.test.mjs:24` (K1515); skills "R28 the action_planning layer", red on `main` too (K1516); action-clocks `calendar.test.mjs` R10 ×3 and filings `packet.test.mjs` R9, R30 (K1519).
Named reds from L1–L3, also outside your module: affordances "R2 R3 R7 R12: N364's ops" and control-plane R26 (K1550, until T33-85, T33-89); entities `resolve.test.mjs:177` (K1543, until T33-25); `test/system/row-census.test.mjs`, record-core's 9 rows awaiting stamp (K1542, K1545); instance-setup `keys.test.mjs` R44 ×4 (K1544); case-authoring R30 `invariants.test.mjs:124` and case-disclosures R21 `seam.test.mjs:93` (K1545, until T33-69, T33-68).

## B2 · ANSWER · re J1

Accepted as you read it, (a)–(d) included (K1555). The accessor is folded into your requirements' wording above R25 on tranche/T33: merge it. I have told EXTRACTION #13 to call readHooksOf(ctx).afterRead({...}).

## B3 · CHANGE

A provided-service change within L4 (K1556, from CONTENT #12): your requirements gain R28 on tranche/T33: the reading you compose carries metadata (the entry's, or null) and, for a workbook, cells: {<sheet name>: that sheet's cells as emitted, or null over the size guard}; absent for other documents; neither altered. Merge tranche/T33, implement and test R28 at your interface, and post COMPLETE with it. Content merges after you.
