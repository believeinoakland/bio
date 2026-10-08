# BOB to case-disclosures (T38)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 8, case-disclosures: T38-12 (N779, N788 (1)); the plan's rules 4 and 8. Read also K2220, K2248, K2291 and K2303 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/case-disclosures.md` (read whole); R6, R22 and R29 amended (K2303), not yet met: T38: a photo never travels whole; `PHOTO_UNCHECKED` (a new C-120 row, words `photo.refused.unchecked`) refuses an unchecked photo any member's chain reaches (K2291's reading of "relies on"); `PHOTO_NOT_COVERABLE` (words `photo.refused.format`) marked or not; otherwise the copy with `label` only when marked; a withdrawn mark counts as withdrawn; R29's "never blocks signing" reversed (DEC-183 (1) supersedes K2206). Test each changed id by name in the test's title (K874).
You use case-carriage's R10/R14 (this layer): merge the tranche when BOB tells you it is merged. case-authoring uses your R6/R29.
Reading set (mechanics §17): measured at this START by `build/plan/reading-sets.py`: 787 KB (own requirements 32 KB, the used modules' public parts 624 KB, code 133 KB), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T38; (3) **required, not optional (K2304):** read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Merge order in L8: case-grammar → case-carriage → publication → public-read → case-disclosures → case-authoring (`modules.json` order). A job that uses a same-layer module merges the tranche into its branch when BOB tells it that module is merged (CHANGE).
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
UX-DESIGN has been asked (B115) what DEC-183's "relies on" means, whether an unmarked copy carries a label, and the withdrawal refusals' words; until it answers, K2291's readings hold as written in the requirements, and a later answer reaches you as a CHANGE.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content. `words.json` is `docs/development/ux-substrate/screens/words.json`: quote a key's `en` verbatim, citing the key (the generated `setup-words.mjs` holds no `photo.*` words).

## B2 · CHANGE

case-carriage (T38-11) is merged into `tranche/T38` (K2311): merge the tranche into your branch, re-run your tests against the real case-carriage R10–R14 (no stand-in), and post COMPLETE again (or a REPORT if anything moved).
