# BOB to credentials (T37)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 2, credentials: T37-6. Read also the plan's "Rules at the opening" (rules 4, 6) and K2101, K2129, K2130, K2175 (their lines in `build/rulings.md`), DEC-182 (4) in `docs/development/DECISIONS.md`, and `build/plan/draft-T37-L2-L3-reqs.md`'s credentials section and "BOB's review" (its reasons; the requirement file binds).
Your requirements: `build/requirements/credentials.md` (read whole); not yet met: T37: R51 (`AI_KEEP_AWAY_NO_REASON`, C-29.32 unmoved), R35 (`aiKeptAway()`, the one site of `AI_KEPT_AWAY`; C-29.31's `where` moves to it), R53 (`aicredentialmint`'s `secretSha` from the body only, `AI_CREDENTIAL_NO_SECRET` C-29.33), R3 (`passwordChange` serves `op=setpassword`; `MACHINE_CANNOT_SET_PASSWORD`, `CURRENT_PASSWORD_WRONG` as C-96 rows), R38, R44. Rule 4: until control-plane (T37-33, L11) sends `secretSha` in the body, the grant tests that drive `aicredentialmint` through control-plane go red at your merge: name each test and line in your COMPLETE; BOB accepts them by name. Readers of `AI_KEPT_AWAY` (instance-setup, answers, store-door, wizard-scripts) move later (rule 4). Your new and re-coded rows are stamped by promotion (T37-7) after your merge. **P6:** 2,692 lines at the opening; report your size.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 325 KB (own requirements 46 KB, the used modules' public parts 114 KB, code and tests 165 KB), an over-estimate (it counts each used module's whole public part and every file under your paths, tests included): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T37; (3) read whole yourself your requirements, layer 2's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L2: membership → credentials → promotion (last: it stamps the layer's rows). Then BOB regenerates `case-checker/program.mjs` and the bundles (manifest order).
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

All seven readings stand (K2182). Nothing to overrule.
