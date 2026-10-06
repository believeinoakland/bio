# BOB to money (T33)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T33), layer 5, money: T33-33 (K1443, K1463, K1468, K1470). Your requirements: `build/requirements/money.md` (read whole; folded for T33, K1505, K1510, K1521, K1522). Read also the plan's Rules at the opening, "Choices settled" and "Measured GO (K1506)", and rulings K1504–K1506. Layers 1–4 are closed and merged (credentials includes the subscription kind, K1553) into `tranche/T33`. This is a new module, registered in `modules.json` with empty `paths`/`tests`: choose its code and test directories (beside its neighbours), state both and its final `uses` in your COMPLETE; BOB writes them into `modules.json` at your merge.
Merge order in L5: entities → events → lines → money → money-checks → duties → people → explore, then local-facts, connections, observation-log, standards, progressions, bias, query-language, retrieval, calculations, workbooks; standards merges before money. All L5 jobs run at once (P10): a downstream job codes against its upstream's approved requirements and merges after it.
Inherited reds (plan Rules (9)): 1 (coverage of T33 ids not yours, until their merges), 2 (membership's order test, until T33-19a), 3 (case-checker R13's program SHA, until T33-73), 4 (importers of a copy-split's source, until re-pointed), 5 (the UI's DEC-88 tests, Bob's). Named reds from L1, all outside your module: ai-runs R18 `scheduler.test.mjs:123` (K1514); entities `idmatch.test.mjs:24` (K1515); skills "R28 the action_planning layer", red on `main` too (K1516); action-clocks `calendar.test.mjs` R10 ×3 and filings `packet.test.mjs` R9, R30 (K1519).
Named reds from L1–L4, also outside your module: affordances "R2 R3 R7 R12: N364's ops" and control-plane R26 (K1550, until T33-85, T33-89); entities `resolve.test.mjs:177` (K1543, until T33-25); `test/system/row-census.test.mjs`, record-core's 9 rows awaiting stamp (K1542, K1545); instance-setup `keys.test.mjs` R44 ×4 (K1544); case-authoring R30 `invariants.test.mjs:124` and case-disclosures R21 `seam.test.mjs:93` (K1545, until T33-69, T33-68).

## B2 · ANSWER · re J1

BOB #116 (took over from BOB #115). Ruling K1563 on tranche/T33 @ e07becea; merge tranche/T33 into your branch first (modules.json and requirements changed).
All seven readings accepted. Additions (K1563):
- R19 is now named whole: money_facts (fact_id, amount, currency, sign, kind, phase, stage, basis, period_from, period_to, from_entity, from_fund, to_entity, to_fund, source_capture_sha), money_withdrawals(fact_id), money_concerns(fact_id, concerns). source_capture_sha is the capture of the source extent, or the capture a source table was read from, else null. money-checks, retrieval and query-language build to these names.
- R9: moneyOf's entity takes any id concerns may name (EVT-, LIN- too); explore reads facts per event that way.
- Machine-written facts from a canonical table row (calculations R14): source {table, row, binding}, by class:daemon, parties {entity, as_written}; check the binding through calculations.bindingOf(key) → {adopted, table, roles, capture_sha} | null, injected until calculations merges (it merges after you, so your test uses a stand-in in that shape).
- Events' shape: I have told EVENTS your assumed readEvent/eventsFor shapes; it confirms or names its own at COMPLETE.
- query-language imports kinds(), phases(), stages(), bases() from bio-plane/src/money/index.mjs; keep those exports there.
