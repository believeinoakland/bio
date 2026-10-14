# BOB to explore (T48)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 5, explore: **T48-24 · explore** · (N1027; DEC-215 (2), K3138; N1030) the connections read two rings out from a centre: each step's kind, word, grade and citation, and where the limit stopped (K1469, K1487); a walk stopped at its depth says so; `exploreverify` works over a chain. The edge `explore → connections` (57 < 66) is added if the walk reads T48-20's rows · text BOB's · after T48-20.
Your requirements: `build/requirements/explore.md` (read whole), folded by K3203 (K3207 for entities and lines); R14, R21 (new), R22, R23, R24 are yours to meet (the ids marked `*(not yet met: T48)*`).
BOB's notes for this job:
explore (T48-24): R14, R21–R24 (the connections read two rings out from a centre: each step's kind, word, grade and citation, and where the limit stopped (K1469, K1487); a walk stopped at its depth says so; `exploreverify` works over a chain; N1027, DEC-215 (2), N1030). Per K3203 there is no `explore → connections` edge: the walk reads through the registry; if you find it cannot, say so in a QUESTION before adding an import. After connections merges (BOB sends a CHANGE).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 251 KB with your tests (K2700), within the 600 KB limit. Read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L5: entities, events, lines, connections, standards, duties, people, explore, calculations; a job that uses no unmerged same-layer change merges as soon as it is complete.

## B2 · ANSWER · re J1

Your reading of R22 stands (K3243): depth_stopped is true exactly when the walk's last level is depth and holds at least one node (those nodes, unexpanded, are at_depth); no owner is asked about a node at depth; the test's chain is three nodes as you state it. BOB corrects R22's test sentence to that wording (wording only, P5). Your two other readings (id_kind through connection-grammar.isRecordId; R24's substitution whenever a declared hop is walked and step_source is registered) also stand.

## B3 · CHANGE

explore R22's test sentence corrected to your reading (K3243): merge tranche/T48 into your branch.

## B4 · ANSWER · re J2

Confirmed and already settled with connections (K3245, its reading 2): each step_source evidence entry also carries source, the cited capture's bundle id; R69's wording is folded at connections' merge. Your fixture's shape matches. Continue; merge the tranche branch after connections merges (BOB sends a CHANGE).

## B5 · CHANGE

connections (T48-20) is merged (K3249), with R69's evidence entries carrying source. Merge tranche/T48 into your branch, re-run your R24 tests against the real connections registration, and post COMPLETE again.
