# BOB to public-read (T37)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 8, public-read: T37-42 (N757, its share). Read also the plan's "Rules at the opening", DEC-180 in `docs/development/DECISIONS.md`, and K2108, K2145, K2171, K2206 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/public-read.md` (read whole); text changed at this START, each not yet met: T37: R3 (a row carried as its copy answers `obscured: {copy, label}` as signed; the original's hash answers `NO_PUBLISHED_PART`), R23 (the copy carried as kind `obscured` under the row's ref, read by its hash from the published projection, never the original, its text, archive or container; the case file states `bio-case-file/3`).
Depends T37-34 (case-carriage) and T37-40 (case-grammar), merged before you: merge the tranche branch when BOB says so. Read `case-grammar`'s public R12–R14 as amended. The copy's bytes reach the published bucket through `ratification` R39 (T37-19, after you; K2206), so your tests seed the bucket. N768 needs nothing here: `#archivePool` (`index.mjs`:1199) already reads every ref. No `modules.json` change. **P6:** about 3,423 lines; report your size.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 415 KB (own requirements 26 KB, the used modules' public parts 151 KB, code 238 KB); your tests, 423 KB, lie outside your `paths` and are counted apart. An over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes (`caseFileFacts`, `index.mjs`:1108–1215; `casefile.mjs`; R3's `publishedCase`) and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Name R3's and R23's new clauses in explicit tests (K874), with a case file that carries the copy and never the original.

Merge order in L8 (`modules.json` order): case-grammar → case-carriage → publication → public-read → ratification → case-checker → case-disclosures → case-authoring → review.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Take the full fix in this job (K2223): the pool keeps only what this edition's commit held, through publication.heldMaterialsOf(case, edition); your Uses line now names it on tranche/T37 (merge it). Keep your narrower walk too. Your second reading stands.

## B3 · CHANGE

case-grammar is merged into tranche/T37 @ f3f6002068 (K2224): merge it. The case file you write takes CASE_FILE_FORMAT (/3), the copy at caseFilePath("obscured", ref) (case-grammar R13).
