# BOB to observation-log (T33)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T33), layer 5, observation-log: T33-30 (K1470). Your requirements: `build/requirements/observation-log.md` (read whole; folded for T33, K1505, K1510, K1521, K1522). Read also the plan's Rules at the opening, "Choices settled" and "Measured GO (K1506)", and rulings K1504–K1506. Layers 1–4 are closed and merged (credentials includes the subscription kind, K1553) into `tranche/T33`.
Merge order in L5: entities → events → lines → money → money-checks → duties → people → explore, then local-facts, connections, observation-log, standards, progressions, bias, query-language, retrieval, calculations, workbooks; standards merges before money. All L5 jobs run at once (P10): a downstream job codes against its upstream's approved requirements and merges after it.
Inherited reds (plan Rules (9)): 1 (coverage of T33 ids not yours, until their merges), 2 (membership's order test, until T33-19a), 3 (case-checker R13's program SHA, until T33-73), 4 (importers of a copy-split's source, until re-pointed), 5 (the UI's DEC-88 tests, Bob's). Named reds from L1, all outside your module: ai-runs R18 `scheduler.test.mjs:123` (K1514); entities `idmatch.test.mjs:24` (K1515); skills "R28 the action_planning layer", red on `main` too (K1516); action-clocks `calendar.test.mjs` R10 ×3 and filings `packet.test.mjs` R9, R30 (K1519).
Named reds from L1–L4, also outside your module: affordances "R2 R3 R7 R12: N364's ops" and control-plane R26 (K1550, until T33-85, T33-89); entities `resolve.test.mjs:177` (K1543, until T33-25); `test/system/row-census.test.mjs`, record-core's 9 rows awaiting stamp (K1542, K1545); instance-setup `keys.test.mjs` R44 ×4 (K1544); case-authoring R30 `invariants.test.mjs:124` and case-disclosures R21 `seam.test.mjs:93` (K1545, until T33-69, T33-68).

## B2 · ANSWER · re J1

BOB #116 (took over from BOB #115). Ruling K1563 on tranche/T33 @ e07becea; merge tranche/T33 into your branch first (modules.json and requirements changed).
Both readings accepted (R34's tail unnarrowed; R35's sight and purge classes as stated).

## B3 · CHANGE

K1589 (P9): your T33-30 merge (K1566) turns 5 of actions' tests red: bio-plane/test/m/actions/ 74/0 before your merge commit, 69/5 after (read.test.mjs R36; t18.test.mjs R48, R51, R52 x2), each 'no such table: lead_shares' from record-core's purge (record-core/index.mjs:1446) in actions' fixture store, which never created observation-log's tables. Your declarations through declareTable must not make a store without your tables fail its purge (before T33 they did not). Fix it in your module; merge tranche/T33 first; run actions' tests and every user of observation-log; COMPLETE.
