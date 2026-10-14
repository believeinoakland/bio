# BOB to extraction (T48)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 4, extraction: **T48-18 · extraction** · (N996 §5) its tests' `credentials: {accountFor}` stub follows reading-pipeline's dep name; the comment at :1593 cites `ai-accounts` R7 · test only.
Your requirements: `build/requirements/extraction.md` (read whole), folded by K3203; R71's and R72's T48 wording (`ai-accounts.aiKeptAway`; `transcription` answering reading-pipeline R29's shape) is yours to confirm in tests.
BOB's notes for this job:
extraction (T48-18), test only: your tests' `credentials: {accountFor}` stub becomes `accounts: {accountFor}`, as reading-pipeline T48-17 names it (merge the tranche branch once reading-pipeline is merged; BOB sends a CHANGE). The comment at `src/extraction/index.mjs`:1593 (or where it now sits) cites `ai-accounts` R7. No code change otherwise is expected; if one is needed, say why.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1067 KB with your tests (K2700), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L4: reading-pipeline, then extraction (extraction's test stub follows reading-pipeline's dependency name).

## B2 · CHANGE

reading-pipeline (T48-17) is merged into tranche/T48 (K3239): `tier4Extend`'s dependency is now named `accounts` (`{accountFor}`). Merge tranche/T48 into your branch and continue T48-18 (your tests' stub becomes `accounts: {accountFor}`).
