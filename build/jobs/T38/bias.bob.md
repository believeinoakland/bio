# BOB to bias (T38)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 5, bias: T38-27 (N783), test only. Read also K2281 (its line in `build/rulings.md`).
Your requirements: `build/requirements/bias.md` (read whole); unchanged. Your work: `bio-plane/test/m/bias/debt.test.mjs`:103's setup calls `membership.projectOwnerAdd`, which moved to project-roster in L2 (its R3, was membership R39). Make the owner through membership R118 (`participationWrite("ownerOn", …)`) if that is all the test needs (preferred: bias already uses membership), else through project-roster R3; if you import project-roster, say so in your record and BOB adds the `uses` edge at the merge (BOB's, P17). No `src/` change is expected; if one proves needed, ask in a QUESTION first. Clears plan rule 6 item 11's bias share.
Reading set (mechanics §17): measured at this START by `build/plan/reading-sets.py`: 356 KB (own requirements 24 KB, the used modules' public parts 212 KB, code 121 KB), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: read whole yourself your requirements, layer 5's row of `build/layers.md`, `debt.test.mjs` and the services it calls, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line); state in your record what you read whole and the summary's size.
Merge order in L5: bias alone.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); only item 11's `debt.test.mjs`:103 is yours.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
