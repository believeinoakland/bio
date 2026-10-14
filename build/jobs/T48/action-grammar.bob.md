# BOB to action-grammar (T48)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T48), layer 9, action-grammar:
- **T48-46 · action-grammar** · (N1024, K3125) R28 lists C-32.4 and C-33.6–.9, their `where`s naming T48-47's one site (K231), the census fixtures following. (N1053) `checks.mjs`' two strings (`MACHINE_CANNOT_SET_PARTNERS`, `PARTNERS_REFUSED`) re-taken in DEC-221's spelling · after T48-47.
- **T48-46 · action-grammar** also (K3243, ENTITIES #12 J1): C-117.28 `NOT_A_PROCEEDING` is retired here (its row now `entities`' C-91.9, R53, the one site); the window in which two `checks.mjs` files hold the code (from T48-82's merge to this one) is accepted by name (rule 5 (2)).
Your requirements: `build/requirements/action-grammar.md` (read whole); every line marked `*(not yet met: T48)*` is yours to meet (R29).
BOB's notes for this job:
T48-46 uses action-records' site (T48-47): build against the entry's text; when BOB's CHANGE says action-records is merged, merge `tranche/T48` into your branch and call the site. C-117.28's retirement: entities' C-91.9 (R53, `notAProceeding`) is the one site now; the two-file window is accepted by name (rule 5 (2), K3243).
Reading (K3271, mechanics §6 step 2, which replaces plan rule 2): read in full your requirements, your entries, your layer's contract in `build/layers.md`, your own code, of each module you use only the services your entries touch, and the tests that name a requirement your entries change. Your other tests are run, not read. No digest helpers. Say in your record what you read; deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Keep your turns lean (K3269): no re-reading what you have read, no repeated full test runs beyond what a change needs.
Merge order in L9: action-records first (K3189), then conformance, action-grammar, actions, action-holds, action-replies, filing-templates, filings, action-plans; a job that uses no unmerged same-layer change merges as soon as it is complete.

## B2 · CHANGE

action-records is merged into tranche/T48 (K3278): merge tranche/T48 into your branch and re-run. Your census arms also need actions R101's is-correspond-direction region; ACTIONS #20 is creating it; I will send a second CHANGE when actions merges. Post COMPLETE again once green.

## B3 · CHANGE

C-117.28 NOT_A_PROCEEDING is in your module: bio-plane/src/action-grammar/checks.mjs:1862 (its where names actions #proceedingRefusal > is-proceeding-kind, which no longer exists). T48-46's also line retires it (K3243): remove the row; entities' C-91.9 (R53) is the one site. Do this with B2's merge.

## B4 · CHANGE

actions is merged into tranche/T48 (K3281), with its is-correspond-direction region for C-33.5 and the site calls. Merge tranche/T48 into your branch now (with B2 and B3: remove C-117.28), re-run your census arms, and post COMPLETE. actions' two tests that read your rows' wheres are red on the tranche until you merge.
