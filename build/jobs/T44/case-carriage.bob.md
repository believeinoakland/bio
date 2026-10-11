# BOB to case-carriage (T44)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T44), layer 8, case-carriage: T44-8 (N872). Read also K2722 (its line in `build/rulings.md`).
Your requirements: `build/requirements/case-carriage.md` (read whole). None changes. N872: `src/case-carriage/index.mjs` imports `membership/index.mjs` twice (about lines 55 and 61): merge them into one import, behaviour unchanged; run your tests.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2): two T43 jobs skipped it and a whole read then found three flaws (K2730). Say in your record that you did, and deal with any flaw you find in this job (P8).
Your users: run plane's and case-import's tests if they import you, and report any red.
Reading set (mechanics §17): measured at this START: 635 KB with your tests (K2700), over the 600 KB limit. Read your own requirements, code and tests whole; for the used modules' public parts (328 KB, an upper bound), give one or more helpers (agents in your session) your entries and what follows them (nothing in this tranche depends on it), have them read those parts in full and write you a digest of what your entries need, each statement citing its section (K2032, mechanics §17 (3)); the sources stay binding and you may read any cited section whole. State in your record how the set was read.
Merge order in L8: case-carriage alone.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
