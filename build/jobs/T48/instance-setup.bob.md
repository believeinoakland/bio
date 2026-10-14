# BOB to instance-setup (T48)

**Read** · handled J0

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T48), layer 11, instance-setup:
- **T48-62 · instance-setup** · (N996 §5) `aiKeepAwayState`, `aiKeptAway` and the disclosure read's registration go through `ai-accounts`; it keeps `credentials` for `recoveryCodesState`. (N1047, K3189; DEC-226 (2)) the daily update check, as a `scheduler` consumer (R8). The check is a plain GET at a time spread per group, sending no group, member or credential. It verifies the notice with T48-3's keys (a new edge, `instance-setup → signatures`), refuses a downgrade or replay, and caps the notes as text only. It stores the notice and each decision (Update, Not now, Skip with a reason, with who and when); a security release returns after a snooze. It provides:
- **T48-62 · instance-setup** also (K3240): `setup-fleet.mjs`:35's recovery sentence ("replace the ADMIN_TOKEN value in this worker's settings"), shown to every member on `forgot`, is developer language: the member-facing `forgot` text says, in members' words, who can help (the group's administrators) and the founder-only block ("Before you choose a password: who controls your group's Civicsmith") shows only on the founder's path; the deployer's instructions stay in the installer's and DEPLOY.md's text.
Your requirements: `build/requirements/instance-setup.md` (read whole); every line marked `*(not yet met: T48)*` is yours to meet (R87, R88, R89, R90, R91).
BOB's notes for this job:
Reading (K3271, mechanics §6 step 2, which replaces plan rule 2): read in full your requirements, your entries, your layer's contract in `build/layers.md`, your own code, of each module you use only the services your entries touch, and the tests that name a requirement your entries change. Your other tests are run, not read. No digest helpers. Say in your record what you read; deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Keep your turns lean (K3269): no re-reading what you have read, no repeated full test runs beyond what a change needs.
Merge order in L11: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-assets, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, plane, installer, journey-check last; a job that uses no unmerged same-layer change merges as soon as it is complete.
