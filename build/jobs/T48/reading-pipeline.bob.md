# BOB to reading-pipeline (T48)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 4, reading-pipeline: **T48-17 · reading-pipeline** · (N996 §5) `accountFor` is read from `ai-accounts` (its dep `accounts`); `uses` drops `credentials` and gains `ai-accounts`; the `transcribe` test follows. (N1052) three tests sign in by `{handle}`.
Your requirements: `build/requirements/reading-pipeline.md` (read whole), folded by K3203; the ids marked `*(not yet met: T48)*` (R31) are yours to meet, with R29's re-pointed Uses line.
BOB's notes for this job:
reading-pipeline (T48-17): `tier4Extend`'s `transcription` names the paying account `accounts` (an object whose `accountFor` is `ai-accounts.accountFor`, its R7, R11), in place of `credentials`; R29's answers are unchanged. Through T48, `credentials` handed in its place (its R72 delegate) is still read, since plane T48-78 re-points the transcriber later in this tranche (K3203); removing that alias is T49's. BOB changes `modules.json` (`uses`: drop `credentials`, add `ai-accounts`) at your merge; say in your record if any import of `credentials` remains and why. The three tests that sign in by `{role}` follow credentials R67's `{handle}` (founder `admin`), clearing their K3192 reds.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 848 KB with your tests (K2700), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L4: reading-pipeline, then extraction (extraction's test stub follows reading-pipeline's dependency name).
