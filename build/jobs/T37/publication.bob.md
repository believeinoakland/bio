# BOB to publication (T37)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 8, publication: T37-18 (N763, its share; N757, its share, K2206). Read also the plan's "Rules at the opening", DEC-180 in `docs/development/DECISIONS.md`, and K2129, K2140, K2206 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/publication.md` (read whole); text changed at this START, each not yet met: T37: R72 (each criteria row's `captures`: only the captures holding its passages that the edition carries `included: true`; `null` for a row "not held"; rows frozen before T37 answered as frozen); R57 (an obscured copy, `held: "derived"`, copied by `ratification` R39; at the commit, after R51 and before R59, `case-carriage.marksLapsed` (its R13) refuses `PHOTO_MARKS_CHANGED_SINCE`, C-122.6, nothing committed); R33 (C-122.6 and its translation, awaiting its stamp).
`modules.json`: `publication` uses `content`, added at this START (K2206, rule 5), for `content`'s read contract (its R45), as `case-authoring` R61 reads it (`case-authoring/index.mjs`:1129–1140): read `content`'s Purpose and public R45. Read `case-carriage`'s public R1, R11, R13. Depends T37-34 (case-carriage, merged before you). Your users: case-checker (T37-20) judges its R22 offline over your frozen `captures`; public-read's R31, R33 carry them as frozen. Your N761 share is none (R73 reads the body already). **P6:** 3,731 lines at the opening (K2171): report your size; past about 4,000 a split is BOB's first (K617).
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 901 KB (own requirements 59 KB, the used modules' public parts 525 KB, code 317 KB, which counts `publication/worker.mjs`, 59 KB, public-read's by `paths`); your tests, 319 KB, lie outside your `paths` and are counted apart. An over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes (R72's `#criteriaOf` and `#criterion`, `index.mjs`:1027–1100; `commitCaseEdition` and its R51 arm; their tests) and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Name R72's, R57's and R33's new clauses in explicit tests (K874): a non-free standard's capture the edition does not carry is never stated; a photo marked after preparation refuses the commit, and nothing is committed.

Merge order in L8 (`modules.json` order): case-grammar → case-carriage → publication → public-read → ratification → case-checker → case-disclosures → case-authoring → review.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Your reading stands (K2222): criteriaFor unchanged; the commit's rows are its rows plus captures; photos: [{ref, sha, why}], at most 200.
