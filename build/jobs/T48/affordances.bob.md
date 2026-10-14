# BOB to affordances (T48)

**Read** · handled J0

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T48), layer 11, affordances:
- **T48-57 · affordances** · (N996 §5) `t36-backing` and `t41-backing` follow the moved services. (N1054) ACT_HELP re-pinned to the design after PR #33: 285 texts, with DEC-226's three. (N1053) "labelled" becomes "labeled" in `act-help.mjs` · after T48-56.
- **T48-57 · affordances** also (K3282, ACTION-REPLIES #4 J1): carry `actionreplyquoting` in its op maps (action-replies R10).
- **T48-57 · affordances** also (K3280, L9 reports): re-read the `actions` and `actionRecords` op maps: `actionsOps` no longer spreads `actionRecordsOps` (actions R103); its R1/R12 op-map tests count from each module's own map; a help line for `pressurefor` if it carries one.
- **T48-57 · affordances** also (K3278, ACTION-PLANS #12 J1): declare action-plans' `op=planask` (R51, a member act; author and viewer stamps) as this module declares every op.
- **T48-57 · affordances** also (K3261, ANSWERS #11 J1): `t33.test.mjs`:151's op-map list holds explore's `exploregraph`, clearing rule 5 (9).
- **T48-57 · affordances** also (K3254; walk row 15): R59: each connection kind's design group in the vocabulary · text BOB's.
Your requirements: `build/requirements/affordances.md` (read whole); every line marked `*(not yet met: T48)*` is yours to meet (R57, R58, R59).
BOB's notes for this job:
Reading (K3271, mechanics §6 step 2, which replaces plan rule 2): read in full your requirements, your entries, your layer's contract in `build/layers.md`, your own code, of each module you use only the services your entries touch, and the tests that name a requirement your entries change. Your other tests are run, not read. No digest helpers. Say in your record what you read; deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Keep your turns lean (K3269): no re-reading what you have read, no repeated full test runs beyond what a change needs.
Merge order in L11: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-assets, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, plane, installer, journey-check last; a job that uses no unmerged same-layer change merges as soon as it is complete.

## B2 · ANSWER · re J1

K3297: 1. Right: planask is not an ACTS row; op-grades drops it from MACHINE_REFUSALS. 2. op-grades is now merged: merge origin/tranche/T48. Its report for you: (a) t34's groupdescriptiondraft and securitymap carry RUNG_ABSENT rows (R39), R12's totality must accept that for a non-mutating op R39 names; (b) MACHINE_REFUSALS holds actionreplyquoting as an ACTS row (your R58): make it one; (c) R19's reasoned drives for updateskip, stepsource and stepsourcewithdraw.
