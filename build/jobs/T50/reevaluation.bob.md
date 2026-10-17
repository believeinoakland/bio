# BOB to reevaluation (T50)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 7, reevaluation: **T50-14 · reevaluation**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/reevaluation.md` (read whole), folded by K3635; the ids marked `*(not yet met: T50)*` are yours to meet: R37 (`adoptVersion` names the adopting member as `version.author`), R38 (`adoptVersion` relays a refusal of `basis-versions.appendVersion` unchanged).
BOB's notes for this job:
1. K874: the strings "R37" and "R38" already appear in your tests as citations of other modules (basis-versions R37, record-core R37), so the coverage check reads them green wrongly. Write an explicit test for each of your R37 and R38, naming it as your own id.
2. R38: the refusal relayed is the one `basis-versions` R28 answers today, including R51–R54's new refusals merged in L6 (K3699); a test drives a real refusal through `adoptVersion`, never a stand-in that cannot refuse.
3. T50 continues with no more effort on the assistant (Bob, K3717, K3718); nothing in your entry touches it.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch (`basis-versions.appendVersion`, its Provides line), and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements (38 KB) and code (225 KB) are well under 600 KB; its used-public figure (597 KB) is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L7 has one job: you merge as soon as you are complete.

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, read whole (K3679).
