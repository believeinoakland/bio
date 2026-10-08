# BOB to case-disclosures (T37)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 8, case-disclosures: T37-41 (N757, its share). Read also the plan's "Rules at the opening", DEC-180 in `docs/development/DECISIONS.md`, DEC-83 (a refusal's sentence, then its remedy), and K2108, K2171, K2206 (their lines in `build/rulings.md`). B102 as BOB fixed it (K2206): an unchecked photo never blocks signing and travels whole; marks are append-only; a marked photo whose cover is refused is neither carried whole nor left out: a load-bearing chain reaching it is refused `PHOTO_NOT_COVERABLE` (an unmarked photo of such a format travels whole as today).
Your requirements: `build/requirements/case-disclosures.md` (read whole); text changed at this START, each not yet met: T37: R6 (a marked photo `included: false` with `obscured: {copy, label}`, presentable through its copy; `PHOTO_NOT_COVERABLE` for a load-bearing one whose cover is refused, `included: false` for a supporting-only one; `PHOTO_MARKS_UNDETERMINED`, fail closed), R7 (the row), R22 (the two new rows and their translations), new R29 `photosOf`, the ceremony's Photos step.
`modules.json`: `case-disclosures` uses `case-carriage`, added at the opening (K2171): read `case-carriage`'s Purpose and public R9–R11 (your R6 and R29 call R10 and `OBSCURED_LABEL`). Your R23 holds: every service synchronous (`photoMarks` is). Depends T37-34 (merged before you). Your user: case-authoring (T37-21) shows R29 in R34's `steps` and lists your new refusals among its blockers. Your two rows await their stamp (rule 6 item 2). **P6:** about 1,770 lines; report your size.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 770 KB (own requirements 31 KB, the used modules' public parts 618 KB, code 121 KB); your tests, 168 KB, lie outside your `paths` and are counted apart. An over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes (`materials.mjs`, `materialsJudged`, `disclosureBlocks` and their tests) and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Coverage counts any `R29` string already in your tests (`tensions.test.mjs` names `contradiction` R29) (K874): write explicit tests of R29's own clauses and R6's new ones, each naming its id, whatever the check says; a failed marks read refuses and never carries the photo whole.

Merge order in L8 (`modules.json` order): case-grammar → case-carriage → publication → public-read → ratification → case-checker → case-disclosures → case-authoring → review.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

case-grammar is merged into tranche/T37 @ f3f6002068 (K2224): merge it; your carries.test.mjs:56 (R12's obscured: null) is yours. case-carriage is not merged yet: I send another CHANGE when it is. Your fail-closed reading stands.

## B3 · CHANGE

case-carriage T37-34 is merged into tranche/T37 (K2226; tip 50f65ce6ac). Merge the tranche, drop your local OBSCURED_LABEL line, re-run your tests and checks, and complete again.
