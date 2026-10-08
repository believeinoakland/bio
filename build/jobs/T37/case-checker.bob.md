# BOB to case-checker (T37)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 8, case-checker: T37-20 (N763, its share; N757, its share). Read also the plan's "Rules at the opening", DEC-180 in `docs/development/DECISIONS.md`, and K2129, K2140, K2171, K2206 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/case-checker.md` (read whole); text changed at this START, each not yet met: T37: R22 (`COPYRIGHTED_TEXT_CARRIED` and `COPYRIGHTED_PASSAGE_UNRELIED` judged offline over `publication` R72's frozen `captures`; a row frozen before T37 `unjudged`), R8 (a row carried as its copy is present when the copy is carried at its digest, else `missing`; the label stated), R1 (the answer's `obscured`), R14 (`bio-case-file/3` specified beside `/1` and `/2`). A marked photo that cannot be covered never reaches a case file (K2206), so R8 has no arm for it.
Depends T37-18 (publication) and T37-40 (case-grammar), merged before you: read `case-grammar`'s public R12–R14 and `publication`'s R72 as amended. No `modules.json` change.
Generated artifact: `case-checker/program.mjs` (`build/manifest.md`): your change and T37-40's stale it, and your own `program.test.mjs` (R13) reads it. Rebuild only with its own command (`node bio-plane/src/case-checker/build-program.mjs` from the repository root), never by hand, and report it; BOB regenerates it at L8's close.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 958 KB (own requirements 20 KB, the used modules' public parts 187 KB, code 752 KB, of which 644 KB is the generated `program.mjs`, not part of any set: about 310 KB without it); your tests, 110 KB, lie outside your `paths` and are counted apart. An over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes (`check.mjs`' R8, `standards.mjs`' R22, `spec.mjs`; `check.test.mjs`, `standards-offline.test.mjs`, `spec.test.mjs`) and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Name R1's, R8's, R14's and R22's new clauses in explicit tests (K874): a case file whose copy is missing (`missing`), one also carrying the original (a departure, `case-grammar` R13), and a `/2` case file that still recreates.

Merge order in L8 (`modules.json` order): case-grammar → case-carriage → publication → public-read → ratification → case-checker → case-disclosures → case-authoring → review.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours unless named here. Your `program.test.mjs` red, opened by T37-40's merge, stays until L8's close.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

case-grammar is merged into tranche/T37 @ f3f6002068 (K2224): merge it and finish. Your three J1 readings stand. Its reds in your module are yours: spec.test.mjs:13, :25 (R14 /3), program.mjs (rebuild with its own command), standards-offline.test.mjs:57 waits on public-read writing /3.
