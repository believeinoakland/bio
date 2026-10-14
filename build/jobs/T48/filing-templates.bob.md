# BOB to filing-templates (T48)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T48), layer 9, filing-templates:
- **T48-50 · filing-templates** · (N880; K231, K2953) R33: `RFC_QUOTING_SENTENCE` and `rfcQuotingRefusal`, with C-115.47's row moved here unchanged; `templateApprove` and the profile's templates are refused through it · text BOB's · before T48-51.
Your requirements: `build/requirements/filing-templates.md` (read whole); every line marked `*(not yet met: T48)*` is yours to meet (R33).
BOB's notes for this job:
You are the provider for filings' T48-51 (R57 checks through your R33): state `rfcQuotingRefusal` exactly; filings merges after you.
Reading (K3271, mechanics §6 step 2, which replaces plan rule 2): read in full your requirements, your entries, your layer's contract in `build/layers.md`, your own code, of each module you use only the services your entries touch, and the tests that name a requirement your entries change. Your other tests are run, not read. No digest helpers. Say in your record what you read; deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Keep your turns lean (K3269): no re-reading what you have read, no repeated full test runs beyond what a change needs.
Merge order in L9: action-records first (K3189), then conformance, action-grammar, actions, action-holds, action-replies, filing-templates, filings, action-plans; a job that uses no unmerged same-layer change merges as soon as it is complete.
