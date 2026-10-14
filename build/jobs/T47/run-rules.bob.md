# BOB to run-rules (T47)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 6, run-rules: **T47-71 · run-rules** · (N992) R32 re-takes what DEC-198/DEC-199 changed in the design files it reads (`registry.json`, `words.json` on `main`), clearing its red · DEC-198, DEC-199.
Your requirements: `build/requirements/run-rules.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job: DEC-198/DEC-199 are on `main` and in this tranche; re-take the design files R32 reads from `main`'s versions (not PR #33's head, which joins at L11).
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START (the row census of L3+ rows until T48's stamp among them); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L6 merge order: accepted-work, steps, citation, basis-versions, strength, run-rules, ai-use, ai-runs, capture-requests, skills, agent-harness, answers, question-explorer, agent-model, agent-runner, agent-worker. A job that uses no unmerged L6 job merges as soon as it is complete (K1965).
Reading set (mechanics §17): measured at this START: 399 KB, within the 600 KB limit (K2700). Read it whole.
