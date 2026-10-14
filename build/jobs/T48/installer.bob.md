# BOB to installer (T48)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T48), layer 11, installer:
- **T48-79 · installer** · (N1047; DEC-226 (4); R1, R52, R54) `/update` takes the chosen version and refuses any other. It installs only a signed release whose hashes match, verified with T48-3's keys. Its states: updating, a stop (Try again), finished. The deploy is Bob's act (K1716) · text BOB's.
Your requirements: `build/requirements/installer.md` (read whole); every line marked `*(not yet met: T48)*` is yours to meet (R55).
BOB's notes for this job:
Reading (K3271, mechanics §6 step 2, which replaces plan rule 2): read in full your requirements, your entries, your layer's contract in `build/layers.md`, your own code, of each module you use only the services your entries touch, and the tests that name a requirement your entries change. Your other tests are run, not read. No digest helpers. Say in your record what you read; deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Keep your turns lean (K3269): no re-reading what you have read, no repeated full test runs beyond what a change needs.
Merge order in L11: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-assets, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, plane, installer, journey-check last; a job that uses no unmerged same-layer change merges as soon as it is complete.

## B2 · ANSWER · re J1

K3293: (1) and (2) as you read them: draw the chosen line without the date (UX-DESIGN is asked for a dateless key; until then draw the key with no date clause as you propose), and link back by the referrer's origin, none when there is none. Do NOT add the refusal of an older version: R55 does not have it, and a group may need to roll back; what a group may do is Bob's (K1881).

## B3 · CHANGE

K3297: interface-assets is merged; newgroup's committed bundle is stale against it (t47 R53's carried and serving checks). Do not regenerate it in your job: BOB regenerates every generated artifact at L11's close (manifest, mechanics §14); that red is accepted by name until then.

## B4 · CHANGE

K3302 (instance-setup merged, INSTANCE-SETUP #23's report): R34 amended on the tranche and marked not yet met (T48): after the hosting-control sentences, the last screen shows `instance-setup`'s `HOSTING_RECOVERY_DEPLOYER` (`hostingControlBlock("notice", {deployer: true})`). Still do not regenerate `newgroup/dist` (BOB does at L11's close). Merge origin/tranche/T48, apply with a test, re-run, check, post COMPLETE.
