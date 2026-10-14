# BOB to journey-check (T48)

**Read** · handled J0

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T48), layer 11, journey-check:
- **T48-80 · journey-check** · (N1056, K3192) `journey.mjs` runs its journey only when executed directly (a main-module guard), never on import; tested with a control · last in L11.
- **T48-80 · journey-check** also (K3254; walk "Limits"): R5 (the administrator and the member, each verified, reached directly), R6 (each live screen against the design mock before a release is called ready) · text BOB's · last in L11.
Your requirements: `build/requirements/journey-check.md` (read whole); every line marked `*(not yet met: T48)*` is yours to meet (R4, R5, R6).
BOB's notes for this job:
You merge last in L11 (K3100). R5 and R6 walk the live instance only at the release; in this job, build and test them against the design mock and a fake plane.
Reading (K3271, mechanics §6 step 2, which replaces plan rule 2): read in full your requirements, your entries, your layer's contract in `build/layers.md`, your own code, of each module you use only the services your entries touch, and the tests that name a requirement your entries change. Your other tests are run, not read. No digest helpers. Say in your record what you read; deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Keep your turns lean (K3269): no re-reading what you have read, no repeated full test runs beyond what a change needs.
Merge order in L11: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-assets, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, plane, installer, journey-check last; a job that uses no unmerged same-layer change merges as soon as it is complete.

## B2 · ANSWER · re J1

K3295: all four readings are right; build on them.
