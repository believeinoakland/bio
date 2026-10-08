# BOB to project-roster (T38)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 2, project-roster: T38-3 (N783), and rule 2. Read also K617, K624, K2270 and K2271 (their lines in `build/rulings.md`) and `build/plan/membership-split.md` (the helper's study; variant C1′ is the boundary, its Suggestions name the code, tables and rows that move).
You are a new module, split from membership: copy, then delete (K624). Build by copy, in new files under `bio-plane/src/project-roster/`, exactly the behaviour of the membership code your requirements were moved from, with the moved tests (copied to `bio-plane/test/m/project-roster/`, renamed to your ids). Reach membership's tables only through its services R116–R120 (membership's job, T38-4, builds them in the same layer: until it merges, code against their stated interfaces and name in your record anything that waits on them; if you need one before it merges, say so in a QUESTION). Do not edit membership's files: its job deletes its copy after you merge. Register your module (start, listeners R116, R117) as plane does for membership's other listeners; the plane's wiring is T38-26 (L11).
Your requirements: `build/requirements/project-roster.md` (read whole); every id not yet met: T38. Each needs a test naming it in its title (K874: the moved tests still name membership's old ids; rename them). `modules.json`: your `paths` and `tests` are empty (K1043); name them in your COMPLETE and BOB fills them before the ownership check. Uses: record-grammar, record-core, membership, test-support. **P6:** about 800 lines estimated; report your size.
Reading set (mechanics §17): measured at this START by `build/plan/reading-sets.py`: 135 KB (own requirements 13 KB, the used modules' public parts 123 KB, no code yet), plus membership's code you copy from (in the study's line ranges), which you read whole.
Merge order in L2: project-roster (copy) → membership (delete, R83) → credentials → promotion last.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Your reading stands, with the order changed (K2275): membership merges first with R116-R120 (its copy of the moved acts still in place); I send you a CHANGE when it lands, you merge tranche/T38 and your tests go green against the real services; no tests accepted red for that. Code strictly to the stated interfaces meanwhile.

## B3 · CHANGE

(K2276) membership's first half is merged into tranche/T38: R116-R121 are real (R116/R117 one registration each, told {projectId, memberId, by, at} / {projectId, by, at}, a whole number >= 1 returned as the count; R118 participationWrite(kind, {...}) with kinds invite, ownerOn, ownerOff, rescue; R119 memberByHandle). Merge tranche/T38, run your tests against them, and COMPLETE. You merge next.

## B4 · CHANGE

(K2278) Merged. One addition: your requirements gain R20 (DEC-149's words rule, held from membership R112 for your strings). Merge tranche/T38, add a test naming R20 (your ops.test rows test already holds the translations to it: re-title or add one), and COMPLETE again. Your two figures-purge reds stay accepted until membership's second merge.
