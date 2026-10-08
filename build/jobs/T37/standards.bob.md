# BOB to standards (T37)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 5, standards: T37-35. Read also K2150 (its line in `build/rulings.md`; CONFORMANCE #15 J1 (1)).
Your requirements: `build/requirements/standards.md` (read whole); no text change: R43 as written ("puts it in force", R20, R40) is not met: `#bindingOf` (`index.mjs`:1926–1930) answers `binds` from an adoption's start with no in-force check, so a standard adopted by the body binds after its period ended. Fix it so the adoption branch binds only while the version is in force on the date (R20, R51). Tests: adopted then ended; adopted with a recorded `through`, then after it; adopted with no end and no record. conformance (T37-36, L9) re-tests R27 against you.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 700 KB (own requirements 46 KB, the used modules' public parts 445 KB, code and tests 209 KB), an over-estimate (it counts each used module's whole public part and every file under your paths, tests included): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 5's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L5 (`modules.json` order): events → standards → progressions → retrieval.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

K2203: (1) your reading stands: not in this entry. (2) Intended, as R20 and R34 are written; no change. (3) Deal with them in this job (P8): an adoption whose act is an event stores its body (R40 allows an event act), and the imposition and incorporation branches check the standard's own period wherever R43, R20 and R51 already say a binding holds only while the version is in force, each with a test. If a branch's requirement text does not say so, report it in your record and leave it (a change of meaning). Then COMPLETE again.
