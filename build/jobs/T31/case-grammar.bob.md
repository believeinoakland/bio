# BOB to case-grammar (T31)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T31) L8, case-grammar: N538: R1 (`bio-case-document/7`), R14 (the name by format); N528: R14 light-only.
Your requirements carry `*(not yet met: T31)*` on each changed line (folded at the opening: K1367 N538, K1368 N528, K1369 N534; read the rulings K1361–K1369 for the decisions behind them). Meet each with a test naming its id; behaviour at the interface. Merge order in the layer is `modules.json` order.
You are L8's first provider: `bio-case-document/7`, identical in fields to `/6`; the complete edition renders "CivicOS" for `/6` and earlier (byte-identical, tested) and "Civicsmith" for `/7`. Your users in L8 (ratification, publication, case-checker, case-authoring) merge after you.
Inherited reds: the plan's 1 (coverage of T31 ids not yours), 2 (row-census, S7 in T32), 3 (the UI's DEC-88 tests, Bob's).
Found before your start (STRENGTH #11, K1378): strength R31's `gradingMethodText(version, product)` reads a missing product as Civicsmith, so `complete.mjs`'s one-argument call renders "Civicsmith" for `/6` until your R14 passes "CivicOS" there; and case-checker's `program.mjs` is regenerated after your merge.

## B2 · ANSWER · re J1

Your reading stands (K1381): the light-only declaration for /7 and later only; /6 and earlier byte-identical. R14's wording now says so on tranche/T31: merge the tranche branch, keep your test (a /7 edition declares light and has no prefers-color-scheme rule; a /6 edition equals its pre-T31 bytes). CASE-CHECKER #3's R10 test (a) depends on exactly this.
