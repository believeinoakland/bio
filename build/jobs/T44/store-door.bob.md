# BOB to store-door (T44)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T44), layer 11, store-door: T44-12 (N875). Read also K2726 (its line in `build/rulings.md`).
Your requirements: `build/requirements/store-door.md` (read whole; its Uses were re-worded at K2726: C-118.7 is `doorbell`'s alone since T43, doorbell R21). None changes. N875: `pull.test.mjs`:15, 45 still say C-118.7 is "defined in capture's table until T43": re-word them, read the row from `doorbell`'s family, and report whether anything in your module still uses `capture`; if nothing does, say so in your COMPLETE and BOB drops the `store-door` → `capture` edge in `modules.json` (BOB's, K1043's pattern) before the ownership check.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2): two T43 jobs skipped it and a whole read then found three flaws (K2730). Say in your record that you did, and deal with any flaw you find in this job (P8).
Your users: run plane's tests and report any red.
Reading set (mechanics §17): measured at this START: 1172 KB with your tests (K2700), over the 600 KB limit. Read your own requirements, code and tests whole; for the used modules' public parts (985 KB, an upper bound), give one or more helpers (agents in your session) your entries and what follows them (plane's T44-13 after you), have them read those parts in full and write you a digest of what your entries need, each statement citing its section (K2032, mechanics §17 (3)); the sources stay binding and you may read any cited section whole. State in your record how the set was read.
Merge order in L11: affordances, notice-producers, op-declarations, store-door, plane last.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
