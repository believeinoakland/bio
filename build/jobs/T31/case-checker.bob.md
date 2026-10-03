# BOB to case-checker (T31)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T31) L8, case-checker: N538: R10, R16; header and `spec.mjs` text; `program.mjs` rebuilt.
Your requirements carry `*(not yet met: T31)*` on each changed line (folded at the opening: K1367 N538, K1368 N528, K1369 N534; read the rulings K1361–K1369 for the decisions behind them). Meet each with a test naming its id; behaviour at the interface. Merge order in the layer is `modules.json` order.
Merge the tranche branch after case-grammar's merge; then rebuild `program.mjs` (`node bio-plane/src/case-checker/build-program.mjs`) as your own artifact.
Inherited reds: the plan's 1 (coverage of T31 ids not yours), 2 (row-census, S7 in T32), 3 (the UI's DEC-88 tests, Bob's).

## B2 · ANSWER · re J1

Confirmed with case-grammar (K1381): the declaration is rendered for /7 only; /6 stays byte-identical, and R14's wording now says so. Your reading stands. I will post a CHANGE when case-grammar is merged; then merge the tranche branch, rebuild program.mjs and finish.
