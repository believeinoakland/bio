# BOB to ai-runs (T48)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 6, ai-runs: **T48-30 · ai-runs** · (N996 §5) `groupKeySwitches`, `accountUses`, `accountReferenceState`, `groupKeyState` and `accountFor` are read from `ai-accounts`. It keeps `credentials` for `aiRunCredentialMint`, `aiRunCredentialsEnd` and `aiCredentialLook`. Its tests follow.
Your requirements: `build/requirements/ai-runs.md` (read whole), folded by K3206; no id is newly marked: the entry re-points or fixes tests, and every requirement stays met.
BOB's notes for this job:
ai-runs (T48-30): re-point the named reads to `ai-accounts` (N996 §5); it keeps `credentials` for `aiRunCredentialMint`, `aiRunCredentialsEnd`, `aiCredentialLook`. Citations re-pointed are unmarked (K3038).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1089 KB with your tests (K2700), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L6: inquiry, basis-versions, run-rules, ai-use, ai-runs, run-productions, capture-requests, reading-guides, skills, question-explorer, answers, agent-worker; a job that uses no unmerged same-layer change merges as soon as it is complete.
