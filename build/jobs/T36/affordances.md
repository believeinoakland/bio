# affordances (T36)

**Status** · session_01S4Ftb92KWezfAAS4YcAnSG · depth 2 · WAITING ON BOB (J1) · handled B1

## Reading (mechanics §17, N739)

Measured set over 300 KB (the module's own tests alone are 392 KB; `reading-sets.py` 1,467 KB): path (3). Read whole myself: `build/requirements/affordances.md`; layer 11's row of `build/layers.md`; `door.mjs`; the new `act-help.mjs` and its source, `mock-acts.js` (PR #13, byte-identical to merge commit `36da334628`); `file-safety`'s Purpose and R17; `op-declarations` R21, R31–R34; the plan's rules, T36-31, K2092, K2121, K2130, K2152 and the draft's affordances section with BOB's review. A worker read the rest of the code (`affordances.mjs`, `facts.mjs`, `words.mjs`) and every test file in full and wrote a 4 KB summary citing file and line: the tests that pin R17's keys (`door.test.mjs`:21, `plane.test.mjs`:323, `t34.test.mjs`:144, all extended), the two re-pins' exact shape (`catalogue.test.mjs`:583–649, `t33.test.mjs`:144–159) and the tests op-grades' T36 tables will touch (`catalogue.test.mjs`:107–155, :477–492; `plane.test.mjs`:614–656). Nothing it left out mattered.

## J1 · REPORT

R48 and R49 are built and pushed. ACT_HELP is at src/affordances/act-help.mjs: 200 entries, generated once from 36da334628's mock-acts.js, with that commit named in the header. R49 adds act_help to the untargeted answer, the same object. The tests are t36.test.mjs, and the R17 key pins in door.test, plane.test and t34.test are extended. Three tests are red, all waiting on op-grades' T36 grades: red 20 (catalogue.test:583), red 19 (t33.test:144), and R48's arm saying every held key is a graded op (the nine ops declared in T36: aikeepaway, the eight file-safety acts). I am waiting for your word that op-grades has merged, so I can merge the tranche branch and re-pin. Checks so far: format, architecture, coverage (34/34) and ownership are clean. Found so far for the design stream: mock-acts.js explains none of K2092's five ops (standardinforcethrough, standardinforcethroughwithdraw, inforcethroughof, spotcheckvisit, spotcheck), so op-declarations R34 must name them in ACT_HELP_ABSENT.
