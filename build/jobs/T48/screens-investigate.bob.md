# BOB to screens-investigate (T48)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T48), layer 11, screens-investigate:
- **T48-74 · screens-investigate** · (N1027, N1030) the connection graph on `explore`, `person` ("Connections") and the money trail, from T48-24 with T48-68's tokens, including "stopped at its depth". Also: (N1029) the `standard` screen's proposals (T48-21); (N1031) participants, grades and order on the timeline (T48-19); (N1032) withdrawing an identity claim by its id (T48-23); (N1050) R15: `people` draws "Added at setup" from `today.machine`, and the regex is retired; (N882) R16 (the reviewed draft's R15, renumbered): "Follow its register" sends `proceeding` and lists that proceeding's follows · text BOB's.
- **T48-74 · screens-investigate** also (K3254; walk C1, C5, C7, C8, rows 6, 14, 15, 18): R22 (CL), R23 (no id fields), R24 (explore's five groups), R25 (people's empty state), R26 (the subject guard) · text BOB's · after T48-57.
Your requirements: `build/requirements/screens-investigate.md` (read whole); every line marked `*(not yet met: T48)*` is yours to meet (R15, R16, R17, R18, R19, R20, R21, R22, R23, R24, R25, R26).
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

K3295: 1. Yes. 2 and 3. Scope R23 to the fields a read in your Uses already answers (people from peopledirectory, laws from standards, questions from the inquiry list); fields whose id no read answers (passage capture shas, content ids, table and workbook fingerprints) stay as they are now and are named in your record: N1079 (next tranche) gives heldcaptures rows a capture_sha, after which they become choices. 4. Draw a word only where certain, as you propose; I am asking UX-DESIGN for connection.thing.entity.
