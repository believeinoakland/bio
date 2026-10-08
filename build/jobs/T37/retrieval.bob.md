# BOB to retrieval (T37)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 5, retrieval: T37-13. Read also K2118 and K2122 (their lines in `build/rulings.md`; RETRIEVAL #14 J1, J2).
Your requirements: `build/requirements/retrieval.md` (read whole); R74 amended, not yet met: T37: a `.docx` table's paragraphs found by its cells' `paras` (office-readers R11, merged in L1; carried by reading-pipeline R28, T37-9), never by matching cell lines in order; a test on a vertically merged table, and one where a cell's `paras` names a paragraph with no `doc-para` unit (READING-PIPELINE #8's note, K2197: R74 now says such an ordinal is passed over). Also (N759) a test that a fact recorded at one cell of a found column is named on that column's R73 result through content's `extentRelation` (T37-10, L4). **P6:** 3,492 lines at the opening; report if you would pass about 4,000 (a split is BOB's first, K617).
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 823 KB (own requirements 54 KB, the used modules' public parts 544 KB, code and tests 225 KB), an over-estimate (it counts each used module's whole public part and every file under your paths, tests included): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 5's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L5 (`modules.json` order): events → standards → progressions → retrieval.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Your reading stands (K2202): remove line matching entirely; a cell with no `paras` names no paragraph, its paragraphs matched as ordinary paragraphs until re-read; no legacy arm. Add a test naming that case (a pre-N758 reading: the column result unchanged).
