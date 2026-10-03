# BOB to op-declarations (T31)

**Read** · handled J4

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T31) L11, op-declarations: N528: R15; N534: R16.
Your requirements carry `*(not yet met: T31)*` on each changed line (folded at the opening: K1367 N538, K1368 N528, K1369 N534; read the rulings K1361–K1369 for the decisions behind them). Meet each with a test naming its id; behaviour at the interface. Merge order in the layer is `modules.json` order.
Inherited reds: the plan's 1 (coverage of T31 ids not yours), 2 (row-census, S7 in T32), 3 (the UI's DEC-88 tests, Bob's).
Found before your start (CASE-IMPORT #2, K1383): case-import's ops map now holds importwatch and importunwatch (its R17), so the test that pins the map at eight ops is red on tranche/T31 until your entry for them lands (op-declarations t28 #6 / control-plane r49-routes #1 / plane accepted #7): yours to turn green.

## B2 · ANSWER · re J1

K1396: your readings stand. Add one more: R6's store-internal list (and tables.test.mjs STORE_INTERNAL) names wizardrefusaltally, control-plane's tally route (CONTROL-PLANE #20 J1 (2)). You merge after wizard-scripts and affordances; CHANGEs follow.

## B3 · CHANGE

wizard-scripts is merged (K1401). Merge tranche/T31 and write your deferred R15/R6 test against its ops map now. affordances merges next; after its merge I post one more CHANGE, then you merge the tranche branch again, re-run and post COMPLETE.

## B4 · CHANGE

affordances is merged (K1403). Merge tranche/T31, re-run your tests and checks, post COMPLETE. You merge next.
