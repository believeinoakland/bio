# BOB to interface-shell (T50)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 11, interface-shell: **T50-27 · interface-shell**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/interface-shell.md` (read whole), K3742; the ids marked `*(not yet met: T50)*` are yours to meet: R73 (the registry is the design's, interim lists go), R74 (act button answers the press), R75 (member menu, first month's question, password dialog by design's keys), R76 (header button, phone masthead, button explanation), R77 (weight mark only above Reversible), R78 (a streamed answer is handed on as it arrives), R79 (an address outside the team's pages), R80 (`cs.checks` takes record data), R81 (more doors), R82 (explanations read the design's keys), R83 (a refusal is drawn in its own words), R84 (look), R86 (a first load settles quickly; the shell's share measured and cut), R87 (a Reasoned act asks its reason), R88 (public frame cards), R89 (the phone layout as drawn); R85 is retired (K3742).
BOB's notes for this job:
1. Entry: (N1122) R72 retired. (N1106, DEC-251) the member menu; the first month's question; the re-auth dialog. (N1083) `cs.checks` takes data options. (N1141, N1144) keys. (N1180, DEC-299) doors. (N1192) the refusal mapping draws a refusal in its own words. (N1174, owners §1) a path outside `/` and `/app` draws `unavailable`. (U2, U2b, U2c; DEC-280, DEC-292, DEC-295) act-button states and Sounds, the header's button, the weight mark only above Reversible (K3664). (V3 B-34) an act whose weight is Reasoned asks its reason (R11), never sent without. (V3 B-1) doors for Docket, Archive and the published case as DEC-299 (1) gives them; those it does not give, an ask to UX-DESIGN. (N1184, DEC-299 (12)) the look rows (R84). (DEC-310 (4), K3683) R81's door kinds; (DEC-313, K3703) their cards and `docket-public` in the public frame (R88); (DEC-316, K3709) the phone layout as drawn (R89). DEC-327 is in your requirements.
2. K3742: R73 and R82 amended, R85 retired (the registry lists all five ops on those screens; `ratify` goes because screens-publish sends `caseratify`). The plan entry's "the dock shows a run's cost" (N1167) and "draws each progress step" (N1195) are read through K3742: those dock lines are screens-inquiry's (R57, R58), no shell line.
3. M-T50-6 is yours: first-load time of `/` and `/app` on biosmoke8 measured at START and again after, your own share cut, a cause elsewhere a REPORT (N1161 F11, R86). Record the figures.
4. Merge after T50-17 (wizard-scripts), T50-26 (interface-assets) and op-grades, op-declarations; before every screen job. U-numbers: U2, U2b, U2c.
5. T50 continues with no more effort on the assistant (Bob, K3717, K3718); lines that wait on the remote proof stay unbuilt, accepted red by name.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch, and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements (76 KB) and code (157 KB) are well under 600 KB; its tests (282 KB) are run, read only where they name a requirement you change; its used-public figure (252 KB) is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1), "labeled", hand-lists read from the owner's declaration, the `act.<op>.here.<place>` key wherever it explains one of DEC-276's sixteen acts in its place, with `{government}`/`{council}` filled from the team's own place (N1145, K3417), D29 (K3324 (2): no screen treats an answer of `ok: true` that carries `ok: false`, `started: false`, `dispatched: false` or `withheld` as success), "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it as your own (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L11 merge order: rule 1: translations first, then answer-envelope right after it (BOB's exception, K3696), then `modules.json`'s order: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, instance-setup, op-declarations, admission, store-door, interface-assets, interface-shell, then the screen jobs with screens-settings first among them (DEC-283) and the rest in `modules.json`'s order (screens-entry, screens-wizards, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action), then control-plane, plane, installer, site, journey-check last (K3100). A provider merges before its users; interface-shell before every screen job.

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, now about 23 KB and read whole (K3679).

## B2 · CHANGE

Merge tranche/T50: your R78 is worded (no change of meaning, K3763): onEvent is spelled cs.call(op, {query, body, onEvent}) and, on an act, its own onEvent(event, view, cs) beside send and done. screens-daily R52 builds to it.

## B3 · CHANGE

A flaw in your ring, from SCREENS-WIZARDS #2 (P9, K3769): cs.ring finds the control by data-act and opens its row panel, but not a closed <details> around it, so a step that rings an act inside a closed fold (screens-wizards R16's 'own' fold) leaves it hidden. Ringing a control opens every closed <details> enclosing it. Deal with it in your job; a test with a control inside a closed fold.

## B4 · CHANGE

wizard-scripts (T50-17) is merged into tranche/T50 (K3771): its SCREEN_REGISTRY is regenerated from design 7be06eb4cb (71 screens, 413 acts, 16 owed). Merge tranche/T50 and re-run your tests against it.
