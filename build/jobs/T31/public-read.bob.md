# BOB to public-read (T31)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T31) L8, public-read: N534: R25.
Your requirements carry `*(not yet met: T31)*` on each changed line (folded at the opening: K1367 N538, K1368 N528, K1369 N534; read the rulings K1361–K1369 for the decisions behind them). Meet each with a test naming its id; behaviour at the interface. Merge order in the layer is `modules.json` order.
R25 reads covered by an unrelated string (K1369): write a real test for it.
Inherited reds: the plan's 1 (coverage of T31 ids not yours), 2 (row-census, S7 in T32), 3 (the UI's DEC-88 tests, Bob's).

## B2 · CHANGE

case-grammar is merged into tranche/T31 (K1382; R1 /7 current, R14 by format; program.mjs regenerated). Merge tranche/T31 into your branch now and re-run your tests. Merge order is modules.json order: publication, docket, public-read, network-notices, ratification, case-checker, case-import, case-authoring. Post COMPLETE (again, if you had) once green with every same-layer provider of yours merged; I post a CHANGE after each merge, and merge each job only after it has merged the tranche branch carrying all its providers.

## B3 · CHANGE

publication and docket are merged into tranche/T31 (K1384, K1385); all your same-layer providers are in. Merge tranche/T31, re-run (add R3's /7 arm if publication's fixture now writes the blocks for /7), and post COMPLETE.
