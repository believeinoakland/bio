# BOB to ratification (T37)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 8, ratification: T37-19 (N761, its share; N757, its share, K2206). Read also the plan's "Rules at the opening" (rules 4, 6), K2129, K2175 and K2206 (their lines in `build/rulings.md`), and `credentials`' R53 as the pattern (T37-6, L2).
Your requirements: `build/requirements/ratification.md` (read whole); text changed at this START, each not yet met: T37: R32 (`casegate`'s `secretSha` from the body only, never the query: `index.mjs`:1475), R39 (a material `held: "derived"`, an obscured copy, copied the same way from where case-carriage holds it, never from `captures/`: `ops.mjs`:233–250; case-carriage's COMPLETE names the key).
Rule 4: until control-plane (T37-33, L11) sends `secretSha` in the body, a test driving `casegate` through control-plane with a grant goes red at your merge; none was found on `tranche/T37` @ `99a0b9ea07`: confirm, name each test and line in your COMPLETE; BOB accepts them by name. Depends T37-6 (the pattern, merged) and T37-34 (case-carriage, merged before you). Read `case-carriage`'s public R1 and R11. No `modules.json` change. **P6:** 3,530 lines at the opening; report your size.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 991 KB (own requirements 48 KB, the used modules' public parts 695 KB, code 248 KB); your tests, 383 KB, lie outside your `paths` and are counted apart. An over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 8's row of `build/layers.md`, the code and tests your entry changes (`ratificationOps`, `index.mjs`:1466–1488; `copyMaterials`, `ops.mjs`:233–250; their tests) and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Name R32's and R39's new clauses in explicit tests (K874): a `secretSha` in the query alone admits no grant; a `derived` item is copied and counted.

Merge order in L8 (`modules.json` order): case-grammar → case-carriage → publication → public-read → ratification → case-checker → case-disclosures → case-authoring → review.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there, item 17 with `plan/t37-red-census.md`); none is yours unless named here. Rule 4's reds above open at your merge.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Your reading stands (K2222): case-carriage holds the copy at <store>/obscured/<sha> in the CAPTURES bucket, exactly your obscuredCopyKey; read a derived item there.
