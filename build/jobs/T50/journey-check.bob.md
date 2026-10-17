# BOB to journey-check (T50)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 11, journey-check: **T50-38 · journey-check**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/journey-check.md` (read whole), K3747; the ids marked `*(not yet met: T50)*` are yours to meet: R15 (the local world binds `SEGMENTS`), R16 (the walk's own reading), R17 (no served page or word row says "group" for a team), R18 (R13 follows the design's journey 29), R19 (the local arm's `RUNNER` replaced by `REMOTE`; CONDITIONAL on the remote proof).
BOB's notes for this job:
1. Entry: (N1109, N1106) the walk's own reading and Sign out; R13 follows journey 29 (DEC-245, DEC-292 D14, DEC-293; K3747). (N1162) the local world binds `SEGMENTS`. (N1160, U15) a check that no served page or word row calls a team a "group". Whether the local world also binds `CHECKS` is decided at your START by a test (K3747).
2. K3747: R18's live arm reports the assistant's steps as not walked while the assistant does not work (K3717); the local arm walks them with R11's stub. R19 waits on the remote proof: unbuilt, accepted red by name (K3718 (2)).
3. Last in L11. U-numbers: U15. K3557 names journey-check (46) as base reds, diagnosed in your module.
4. T50 continues with no more effort on the assistant (Bob, K3717, K3718); lines that wait on the remote proof stay unbuilt, accepted red by name.
Also: your R8 carries a T49 not-yet-met mark; say in your COMPLETE whether it is met (naming its test), and BOB strikes it at the merge.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch, and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements (14 KB) and code (146 KB) are well under 600 KB; its tests (84 KB) are run, read only where they name a requirement you change; its used-public figure (9 KB) is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it as your own (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Naming your module: K3557's journey-check (46); rule 5 (14). Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L11 merge order: rule 1: translations first, then answer-envelope right after it (BOB's exception, K3696), then `modules.json`'s order: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, instance-setup, op-declarations, admission, store-door, interface-assets, interface-shell, then the screen jobs with screens-settings first among them (DEC-283) and the rest in `modules.json`'s order (screens-entry, screens-wizards, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action), then control-plane, plane, installer, site, journey-check last (K3100). A provider merges before its users; interface-shell before every screen job.

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, now about 23 KB and read whole (K3679).

## B2 · CHANGE

interface-shell (T50-27) and instance-setup (T50-23) are merged into tranche/T50 (K3777). Merge tranche/T50, re-run your tests against the real shell (remove any stand-in), and post COMPLETE; screens merge next, screens-settings first.

## B3 · CHANGE

Every L11 job but installer (restarted, running) and control-plane (one test re-opened) is merged into tranche/T50 (K3778): all screens, interface-shell, queue, queue-producers, plane. The composed interface builds (interface-shell 166/166). Merge tranche/T50 and re-walk the local arm. For each failure that remains, REPORT it by the module that owns it, with the step and the words or answer seen (in particular: any 'group' still drawn on /app pages, the shell's sign-out key, and queue's NO_SUCH_KIND for project-invitation). Then post COMPLETE; you merge last. K3779.
