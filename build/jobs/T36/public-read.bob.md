# BOB to public-read (T36)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 8, public-read: T36-27. Read also the plan's "Rules at the opening", K2129 (its line in `build/rulings.md`, and the draft it cites, `build/plan/draft-T36-L8-L10-reqs.md`, your section and its "BOB's review"; Suggestions bind nothing) and the rulings your entry cites.
Your requirements: `build/requirements/public-read.md` (read whole); R32 (a carried archive member's `container` record and archive bytes, outward to the outermost) and R33 (the edition's `criteria` file) are yours (K2129). Depends on case-grammar's merge (R13's `/2` kinds and paths): merge `tranche/T36` once BOB announces it.
P6: report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 404 KB, an over-estimate (it counts each used module's whole public part and every file under your paths): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T36; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L8: case-grammar → publication → public-read → case-checker → case-authoring (`modules.json` order).
Inherited reds: the plan's rule 5 list as it stands at your START (read it there); cleared: 2, 3, 5, 6, 8, 9, 14, 21. Expect among your users' tests red 16, 18, 19, 20, 22, 23, 24 (control-plane and affordances, until L11).
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

case-grammar is merged into tranche/T36 (K2144): merge it into your branch. Also (CASE-GRAMMAR #9 J1): your casefile.mjs:195 isCaseFileManifest tests format === CASE_FILE_FORMAT, so a stored bio-case-file/1 manifest is no longer recognised; use case-grammar's exported CASE_FILE_FORMATS_ACCEPTED, with a test that a /1 manifest is still recognised.
