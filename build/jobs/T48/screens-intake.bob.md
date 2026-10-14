# BOB to screens-intake (T48)

**Read** · handled J5

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T48), layer 11, screens-intake:
- **T48-85 · screens-intake** · (K3254; walk C1, C5, rows 12, 14, 20) R17 (CL), R18 (the tab bar and act row, Watch after a capture), R19 (no empty Set aside; the `heldcaptures` stall traced and fixed), R20 (bare `archive` and `open-file`) · text BOB's · merges after screens-settings.
Your requirements: `build/requirements/screens-intake.md` (read whole); every line marked `*(not yet met: T48)*` is yours to meet (R17, R18, R19, R20).
BOB's notes for this job:
The registry and words re-takes (T48-55, T48-61) merge before any screen draws `elsewhere` or `updates`. Until T48-78 (plane) merges, a screen draws a `null` pointer as `state.failed`, testing against a fake plane (K31's pattern). A word you need that is not in `words.json`: tell BOB (a REPORT); never write a fallback of your own.
Reading (K3271, mechanics §6 step 2, which replaces plan rule 2): read in full your requirements, your entries, your layer's contract in `build/layers.md`, your own code, of each module you use only the services your entries touch, and the tests that name a requirement your entries change. Your other tests are run, not read. No digest helpers. Say in your record what you read; deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Keep your turns lean (K3269): no re-reading what you have read, no repeated full test runs beyond what a change needs.
Merge order in L11: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-assets, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, plane, installer, journey-check last; a job that uses no unmerged same-layer change merges as soon as it is complete.

## B2 · CHANGE

K3303: interface-shell is merged into tranche/T48 (R55 re-points, R56 class check, R60 words, R61 reading screen objects' ABSENT_CODES). Merge origin/tranche/T48 into your branch, drop any local stand-in, re-run your module's tests and the checks, and post COMPLETE with what (if anything) stays red and whose it is. Your merge follows in L11's order.

## B3 · CHANGE

K3312, a defect found by JOURNEY-CHECK #3 (J4) walking the composed page: /app/capture/saw draws no tab body. `capture.mjs:73` wraps each Add tab body in `<div class="st" data-tab=…>`, and the served `shell.css` (interface-assets) carries the design mock's state switch `.st { display: none; }` (shown only under `main[data-st] .st-a…g`), so all three Add tabs are invisible. A design class must mean what the design means: draw the tab bodies under a class that does not collide (a design tab class or the kit's, else a hook class the shell lists), and add a test that each Add tab body is visible under the served stylesheets (not hidden by any rule they carry), with a control. Merge origin/tranche/T48, fix, re-run, check, post COMPLETE.
