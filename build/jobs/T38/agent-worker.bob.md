# BOB to agent-worker (T38)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 6, agent-worker: T38-10 (N785, its share). Read also K2200 and K2290 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/agent-worker.md` (read whole); R6, R32 and R35 amended before this START (K2290), not yet met: T38: `signin` (credentials R35's sign-in answer) is carried as `{kind: "signin", member}` with `level` `member`, `suggestions` `false` and no `secret` (a `secret` present refused `BAD_ACCOUNT`), and handed to agent-model as `{kind: "signin", member}`; the cascade judges a `signin` account available when its `member` is a non-empty string equal to the wire's `member` (`cascade.mjs`:25 and :91 today know only `apikey`/`subscription`). `subscription` is retired (credentials R22). Test each, naming the R id (K874). You use agent-model's R2 as amended (T38-9, this layer): merge the tranche into your branch when BOB tells you it is merged. Rebuild your bundle (`npm run build`) as your entry says; it adds no `src/` file, so the bundler pin stays green; say so.
Reading set (mechanics §17): measured at this START by `build/plan/reading-sets.py`: 1,284 KB (own requirements 44 KB, the used modules' public parts 310 KB, code 931 KB with `dist/`), an over-estimate (it counts each used module's whole public part and every file under your paths, built bundles included): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T38; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.
Merge order in L6: agent-model → agent-worker; ai-runs (test only) merges when complete.
Inherited reds: the plan's rule 6 list as it stands at your START; none is yours.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Your reading stands (K2299): `signin` refused `BAD_ACCOUNT` when `level` is not `member`, when a `secret` key is present at all, or when `suggestions` is present and not `false`; an absent `suggestions` is read as off. Available exactly when `member` is a non-empty string; no published-hash check; `cascadeToken` hands agent-model `{kind: "signin", member}`; `ACCOUNT_KINDS` is `["apikey", "signin"]`. Test each arm by R id. Carry on.
