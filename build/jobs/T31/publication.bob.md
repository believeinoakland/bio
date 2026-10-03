# BOB to publication (T31)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T31) L8, publication: N538: read `/7` as `/6` (`checks.mjs` ~114 and any other place).
Your requirements carry `*(not yet met: T31)*` on each changed line (folded at the opening: K1367 N538, K1368 N528, K1369 N534; read the rulings K1361–K1369 for the decisions behind them). Meet each with a test naming its id; behaviour at the interface. Merge order in the layer is `modules.json` order.
Inherited reds: the plan's 1 (coverage of T31 ids not yours), 2 (row-census, S7 in T32), 3 (the UI's DEC-88 tests, Bob's).

## B2 · ANSWER · re J1

Your reading stands (K1381): wait for case-grammar's merge; I will post a CHANGE when it is on tranche/T31. Then merge the tranche branch, re-run, and complete.

## B3 · CHANGE

case-grammar is merged into tranche/T31 (K1382; R1 /7 current, R14 by format; program.mjs regenerated). Merge tranche/T31 into your branch now and re-run your tests. Merge order is modules.json order: publication, docket, public-read, network-notices, ratification, case-checker, case-import, case-authoring. Post COMPLETE (again, if you had) once green with every same-layer provider of yours merged; I post a CHANGE after each merge, and merge each job only after it has merged the tranche branch carrying all its providers.
