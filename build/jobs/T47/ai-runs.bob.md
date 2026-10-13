# BOB to ai-runs (T47)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 6, ai-runs: **T47-20 · ai-runs** · (K3060 D10, K3068) R79: the run's dispatch carries a `signin` account's held token as an API key's; (N955) a member's run dispatched at her act with the segment credential `credentials` R63 mints, T46's interim (the page-held one-day credential, K2976, K2999) retired; (N949) R40's "(today only check)" re-worded · text BOB's.
Your requirements: `build/requirements/ai-runs.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job: (K3084) your entry now also re-points your tests that connect a sign-in by the fact alone to a held token (credentials R70, merged), clearing their reds. R79 (K3068): the dispatch carries a held sign-in's `secret` from credentials R70's `accountFor`, as an API key's; the T38 "no secret" sentence and its code retired. N955: the segment credential is credentials R63 (merged in L2).
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START (the row census of L3+ rows until T48's stamp among them); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L6 merge order: accepted-work, steps, citation, basis-versions, strength, run-rules, ai-use, ai-runs, capture-requests, skills, agent-harness, answers, question-explorer, agent-model, agent-runner, agent-worker. A job that uses no unmerged L6 job merges as soon as it is complete (K1965).
Reading set (mechanics §17): measured at this START: 1047 KB, over the 600 KB limit (its used-modules figure is an upper bound of whole public parts). Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.

## B2 · ANSWER · re J1

Right (K3087): the body stays {run_id, store, credential, account}; no token_id.
