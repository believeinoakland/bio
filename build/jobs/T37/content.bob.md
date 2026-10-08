# BOB to content (T37)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 4, content: T37-10. Read also K2122 (its line in `build/rulings.md`; RETRIEVAL #14 J2 (a)).
Your requirements: `build/requirements/content.md` (read whole); R6 as stated, a flaw to fix: `extentRelation` relates sheet-range and doc-table extents by their cells: a cell inside a range answers `narrower` (and the range `wider`), two ranges compare (same, narrower, wider, disjoint), a doc-table cell inside its table `narrower`. Test each case through the interface. retrieval (T37-13, L5) names a fact recorded at one cell of a found column on that column's result through it. **P6:** 3,719 lines at the opening; the cell relations add perhaps 100–200: report if you would pass about 4,000 (a split is BOB's first, K617).
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 538 KB (own requirements 34 KB, the used modules' public parts 261 KB, code and tests 243 KB), an over-estimate (it counts each used module's whole public part and every file under your paths, tests included): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 4's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L4 (`modules.json` order): reading-pipeline → extraction → content.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
