# BOB to reading-pipeline (T37)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 4, reading-pipeline: T37-9. Read also K2118 and K2173 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/reading-pipeline.md` (read whole); R28 amended, not yet met: T37: a `.docx` cell's `paras` (office-readers R11, merged in L1) carried as emitted. Red 13 is yours: `test/m/reading-pipeline/emitted.test.mjs`:129's hand-written cell shape lacks `paras`; make it read what the real entry emits, and add a test on a vertically merged table. retrieval (T37-13, L5) finds a table's paragraphs by `paras` after you.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 354 KB (own requirements 23 KB, the used modules' public parts 242 KB, code and tests 90 KB), an over-estimate (it counts each used module's whole public part and every file under your paths, tests included): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 4's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L4 (`modules.json` order): reading-pipeline → extraction → content.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
