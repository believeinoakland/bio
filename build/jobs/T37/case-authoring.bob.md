# BOB to case-authoring (T37)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 8, case-authoring: T37-21 (N761, its share; N757, its share). Read also the plan's "Rules at the opening" (rules 4, 6), DEC-180 in `docs/development/DECISIONS.md`, K2129, K2171, K2175, K2206 (their lines in `build/rulings.md`), and `credentials`' R53 as the pattern (T37-6).
Your requirements: `build/requirements/case-authoring.md` (read whole); text changed at this START, each not yet met: T37: R14 (a marked photo stated by its copy, `obscured: {copy, label}`), R34 (`steps` gains `photos`, `case-disclosures` R29's answer, after "what you are leaving out"; an unchecked photo never a blocker; `case-disclosures` R6's `PHOTO_NOT_COVERABLE` and `PHOTO_MARKS_UNDETERMINED` are, and `op=publish` answers them first as R55 orders `materialsJudged`), new R62 (`op=statementack`'s `secretSha` from the body only, never the query: `index.mjs`:2419, the plan's :2355).
Rule 4: until control-plane (T37-33, L11) sends `secretSha` in the body, control-plane's `statementack.test.mjs`:31 is expected red at your merge (it runs your `caseAuthoringOps` behind control-plane's door, which still puts the digest in the query): confirm it, name each red test and line in your COMPLETE; BOB accepts them by name until T37-33. Depends T37-41 (merged before you): read `case-disclosures`' public R6, R7 and R29 as amended. No `modules.json` change. **P6:** 3,446 lines on `tranche/T37` (the plan's 3,365 predates T36-28): report your size; past about 4,000 a split is BOB's first (K617).
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 1166 KB (own requirements 40 KB, the used modules' public parts 879 KB, code 247 KB); your tests, 376 KB, lie outside your `paths` and are counted apart. An over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes (`caseAuthoringOps`, `index.mjs`:2364–2422; `acknowledgeStatement`, :1888; `publishPreflight`'s `steps`; `statement.test.mjs`, `preflight.test.mjs`) and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Coverage counts any `R62` string already in your tests (`identity.test.mjs` names `record-core` R62) (K874): write explicit tests of R62's own clauses, and of R14's and R34's new ones, each naming its id, whatever the check says.

Merge order in L8 (`modules.json` order): case-grammar → case-carriage → publication → public-read → ratification → case-checker → case-disclosures → case-authoring → review.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours unless named here. Rule 4's red above opens at your merge.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Your reading stands (K2223): wait; I send RESUME once case-disclosures (T37-41) is merged, with case-carriage and case-grammar before it.

## B3 · CHANGE

case-grammar is merged into tranche/T37 @ f3f6002068 (K2224); your carries.test.mjs:40 (R12's obscured: null) is yours. From CASE-DISCLOSURES #5: its rows are now C-120.1–.18 (your two R29 tests pin .1–.16), and your fixture's case-carriage photoMarks must answer photo:false for non-images. Still wait for my RESUME after case-disclosures merges.

## B4 · RESUME

case-carriage, publication, public-read, ratification, case-checker and case-disclosures are merged into tranche/T37 (K2226, K2227; tip at this entry). Merge the tranche and finish T37-21. On the merged tranche your module reads 155 pass, 3 fail; per CASE-DISCLOSURES #5's REPORT: your two R29 tests pin C-120.1–.16 (case-disclosures now adds C-120.17 PHOTO_NOT_COVERABLE and C-120.18 PHOTO_MARKS_UNDETERMINED, provisional, awaiting stamp), and carries.test.mjs:49 (R55) expects rows without case-grammar's `obscured: null`. Note case-disclosures' kept reading (K2227): an unreadable marks read refuses only where it decides what travels. Then complete; you merge before review.
