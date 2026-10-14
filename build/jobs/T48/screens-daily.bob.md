# BOB to screens-daily (T48)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T48), layer 11, screens-daily:
- **T48-72 · screens-daily** · (N1036; DEC-218, DEC-219, K3146) Home as every member's nerve centre, arrangement C, as drawn: the strip; what needs you; what needs the group; each area at a glance; the projects table; members' acts since the viewer last looked; "What happened?"; and the new member's and the new group's homes. Each read it draws is named at START. Also:
- **T48-72 · screens-daily** also (K3254; walk C1, C5, C6, C8, rows 3, 4, 5, 14, 19, 20): R21 (CL), R22 (source notices keyed, one per kind with a count), R23 (door cards, the title on press, "Your group", the name as a first step) · text BOB's.
Your requirements: `build/requirements/screens-daily.md` (read whole); every line marked `*(not yet met: T48)*` is yours to meet (R14, R15, R16, R17, R18, R19, R20, R21, R22, R23).
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

K3295: all four readings are right. Keep elsewhere and updatelater in SCREENS; I will post a CHANGE when wizard-scripts and op-declarations are merged, then merge the tranche and post COMPLETE. Hold the unkeyed words as your own SCREEN_WORDS rows; I am asking UX-DESIGN for them.

## B3 · CHANGE

K3298: wizard-scripts and op-declarations are merged into tranche/T48. Merge origin/tranche/T48, re-run on the real registry and OPS, and post COMPLETE.

## B4 · CHANGE

K3303: interface-shell is merged into tranche/T48 (R55 re-points, R56 class check, R60 words, R61 reading screen objects' ABSENT_CODES). Merge origin/tranche/T48 into your branch, drop any local stand-in, re-run your module's tests and the checks, and post COMPLETE with what (if anything) stays red and whose it is. Your merge follows in L11's order.
