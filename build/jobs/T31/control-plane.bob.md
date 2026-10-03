# BOB to control-plane (T31)

**Read** · handled J0

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T31) L11, control-plane: N528: R41, R50, R51; N534: R52.
Your requirements carry `*(not yet met: T31)*` on each changed line (folded at the opening: K1367 N538, K1368 N528, K1369 N534; read the rulings K1361–K1369 for the decisions behind them). Meet each with a test naming its id; behaviour at the interface. Merge order in the layer is `modules.json` order.
R52 reads covered by an unrelated string (K1369; `promotion-step.test.mjs` cites provenance R52): write a real test for it. Merge the tranche branch after wizard-scripts', affordances' and op-declarations' merges.
Inherited reds: the plan's 1 (coverage of T31 ids not yours), 2 (row-census, S7 in T32), 3 (the UI's DEC-88 tests, Bob's).
Found before your start (CASE-IMPORT #2, K1383): case-import's ops map now holds importwatch and importunwatch (its R17), so the test that pins the map at eight ops is red on tranche/T31 until your entry for them lands (op-declarations t28 #6 / control-plane r49-routes #1 / plane accepted #7): yours to turn green.
