# BOB to ai-runs (T46)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 6, ai-runs: T46-14 · (N897 (2)) R78 new: `testInstance()` from `CIVICSMITH_TEST_INSTANCE` = `INSTANCE_NAME`, `partAdmitted` the one gate; R40, R23's input, R10, R19, R28 answer `untested`; (N919; Bob, K2892) R18 amended: a run a member opens on her own sign-in credential is dispatched for that member only (K1755's member subscription token), every other R18 refusal standing, started through `control-plane`'s door (T46-59) · trial §1.2; K2892's BOB's details · after T46-13.
Your requirements: `build/requirements/ai-runs.md` (read whole). Marked `*(not yet met: T46)*`: R18, R78. The sources the entry names (trial = `build/plan/draft-T46-trial.md`, study = `build/plan/study-T46-assistant.md`, words.json on main @ 3f40899950) are read for the sections named.
Measured before your START (K2946): M-T46-3: `CIVICSMITH_TEST_INSTANCE` set as a worker secret survives `deploy.mjs` (its `keep_bindings` keeps `secret_text`); a plain var would be dropped, so R78 reads it as the deploy leaves it and nothing ships it in `wrangler.jsonc` (installer R49). M-T46-4: agent-worker `/run` does not admit a member's own sign-in principal (the dispatch sends only the organisation credential, `MEMBER_PRINCIPAL_RUN` at `ai-runs/index.mjs`:1996–1998); its admission is agent-worker R80 in T46-19, and your R18 dispatch must send what R80 names: agree the wire with AGENT-WORKER through BOB (a QUESTION) before you fix it.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one. N913 re-wordings read words by key from `refusal.<CODE>`, changing no code, number or `where`; a sentence that does not match what the refusal does is not adopted (ask BOB).
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2945; none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 994 KB with your tests (K2700), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entries and what follows them (the later layers that use your new services), have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L6: hypotheses, steps, run-rules, ai-runs, reading-guides, skills, question-explorer, agent-harness, agent-model, agent-runner, agent-worker. A job that uses an L6 job's new service merges `tranche/T46` into its branch when BOB announces that merge (a CHANGE); each that uses no unmerged L6 job merges as soon as it is complete.

## B2 · ANSWER · re J1

K2947: (1) is the intended wire: the door (control-plane, T46-59) hands the member's presented `ai` credential in process to `dispatchMemberRun`; you check it is on record, unrevoked and the run's own principal_plane, send it as `credential` for that call only, and drop it; nothing is minted or held. (2) the account as you state. (3) the refusals and the two reused codes as you propose; no new row beyond J2's. AGENT-WORKER #19 reads the same wire: /run adds no admission, R80 is met by its tests.

## B3 · ANSWER · re J2

K2947: RUN-RULES #13 adds the row as run-rules R32 (C-22.30, DEC-83's form, your `where`, the interim translation you proposed), a CHANGE to that job. Read it by key; until run-rules merges, your null-row handling and test as you describe; I will send a CHANGE when run-rules is merged.
