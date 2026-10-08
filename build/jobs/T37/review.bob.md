# BOB to review (T37)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 8, review: T37-22 (N761, its share). Read also the plan's "Rules at the opening" (rules 4, 6), K2129 and K2175 (their lines in `build/rulings.md`), and `credentials`' R53 as the pattern (T37-6).
Your requirements: `build/requirements/review.md` (read whole); text changed at this START, not yet met: T37: the Terms sentence on stamps and new R29: `reviewgrant`, `reviewcopy` and `reviewcomment` take `secretSha` from the body only, never the query (`index.mjs`:778–782; its comment at :769 re-worded); `bySecret`, `author` and `viewer` stay query stamps.
Rule 4: until control-plane (T37-33, L11) sends `secretSha` in the body, a test driving these ops through control-plane with a grant goes red at your merge; none was found on `tranche/T37` @ `99a0b9ea07` (control-plane's tests stub the store): confirm, name each in your COMPLETE. Your own `acts.test.mjs`:227–246 drives `reviewOps` with the query form: move it to the body and keep a negative control. Depends — (T37-6's pattern, merged). No `modules.json` change.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 298 KB (own requirements 15 KB, the used modules' public parts 215 KB, code 68 KB); your tests, 98 KB, lie outside your `paths` and are counted apart. An over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, your code (68 KB) and the tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Name R29 in an explicit test of its own (K874).

Merge order in L8 (`modules.json` order): case-grammar → case-carriage → publication → public-read → ratification → case-checker → case-disclosures → case-authoring → review. You merge last.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.
