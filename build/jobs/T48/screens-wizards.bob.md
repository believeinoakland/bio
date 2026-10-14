# BOB to screens-wizards (T48)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T48), layer 11, screens-wizards:
- **T48-70 · screens-wizards** · (N847; DEC-227 (1)) R10: the guide's line `wizard.guide.elsewhere` on every step of a script a door offers · text BOB's.
- **T48-70 · screens-wizards** also (K3254; walk C3, C5, rows 8, 17): R11: one chip, never zero, filtered by what the viewer can do; R12 (CL) · text BOB's.
Your requirements: `build/requirements/screens-wizards.md` (read whole); every line marked `*(not yet met: T48)*` is yours to meet (R10, R11, R12).
BOB's notes for this job:
The registry and words re-takes (T48-55, T48-61) merge before any screen draws `elsewhere` or `updates`. Until T48-78 (plane) merges, a screen draws a `null` pointer as `state.failed`, testing against a fake plane (K31's pattern). A word you need that is not in `words.json`: tell BOB (a REPORT); never write a fallback of your own.
Reading (K3271, mechanics §6 step 2, which replaces plan rule 2): read in full your requirements, your entries, your layer's contract in `build/layers.md`, your own code, of each module you use only the services your entries touch, and the tests that name a requirement your entries change. Your other tests are run, not read. No digest helpers. Say in your record what you read; deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Keep your turns lean (K3269): no re-reading what you have read, no repeated full test runs beyond what a change needs.
Merge order in L11: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-assets, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, plane, installer, journey-check last; a job that uses no unmerged same-layer change merges as soon as it is complete.

## B2 · ANSWER · re J1

K3293: as you read it: hold the three wizard.marks rows in your SCREEN_WORDS under those keys until UX-DESIGN adds them (asked); read the elsewhere keys from WORD_ROWS (setup-words is now merged: merge origin/tranche/T48). Your R12 audit against civicsmith.css plus the shell's STYLE is right until R56's check lands.
