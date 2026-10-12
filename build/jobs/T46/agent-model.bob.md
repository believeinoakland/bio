# BOB to agent-model (T46)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 6, agent-model: T46-64 · (N852) R15 new (amends R14): on the sign-in path an image block is relayed through the runner (agent-runner R24), `IMAGE_NOT_RELAYED` kept for a runner without it · text BOB's · before T46-18.
Your requirements: `build/requirements/agent-model.md` (read whole). Marked `*(not yet met: T46)*`: R15. The sources the entry names (trial = `build/plan/draft-T46-trial.md`, study = `build/plan/study-T46-assistant.md`, words.json on main @ 3f40899950) are read for the sections named.
Merge before agent-runner's users rely on it: T46-64 is before T46-18.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one. N913 re-wordings read words by key from `refusal.<CODE>`, changing no code, number or `where`; a sentence that does not match what the refusal does is not adopted (ask BOB).
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2945; none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 221 KB with your tests (K2700), under the 600 KB limit; read it whole.
Merge order in L6: hypotheses, steps, run-rules, ai-runs, reading-guides, skills, question-explorer, agent-harness, agent-model, agent-runner, agent-worker. A job that uses an L6 job's new service merges `tranche/T46` into its branch when BOB announces that merge (a CHANGE); each that uses no unmerged L6 job merges as soon as it is complete.

## B2 · ANSWER · re J1

K2947: your reading is ruled. agent-runner R5's `/version` gains `capabilities` ("image" when R24 is met); your R15 now says: ask the member's runner only when a picture is about to be relayed, at most once per conversation; anything else (key absent, non-200, throw, non-JSON) refuses IMAGE_NOT_RELAYED with nothing sent. The relay's block-array form is accepted. Merge tranche/T46 into your branch.
