# BOB to screens-publish (T50)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 11, screens-publish: **T50-34 · screens-publish**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/screens-publish.md` (read whole), K3742; the ids marked `*(not yet met: T50)*` are yours to meet: R25 (`imported` draws its list), R26 (an imported case says whose stake it states), R27 (the review link's end counted in the team's zone), R28 (the ceremony and draft speak plainly), R29 (the check has a third answer), R30 (the confirmation before signing explains itself), R31 (a project's first case), R32 (publish with nothing prepared), R33 (the public page's "Corrections and orders"), R34 (DEC-313's words and the public docket), R35 (the case editor's "The account"), R36 (`publishedcase` is read asynchronously).
BOB's notes for this job:
1. Entry: (N1087) `imported` draws its list. (N1144) `act.publish.here.ceremony`. (N1081) the outside reader's day. (N1181) plain ceremony and draft words. (U10, DEC-263) `published.check.elsewhere`. (DEC-310 (2), (3), K3683) the case editor's first case and the ceremony's nothing-prepared state (R31, R32); (DEC-310 (6), K3698) "Corrections and orders" (R33); (DEC-313, K3703) its words and the public docket screen `docket-public` (R34); (DEC-315, K3707) "The account" with `accountpropose` and `accountdrafts` (R35).
2. K3725, K3731, K3742: the store's `publishedcase` op is asynchronous for its callers (public-read R37; its answer carries `corrections`); you and every caller of it await it (R36). K3742 amended R26–R29, R34, R35; DEC-326 puts `screen.case-editor.noconcluded` (R34) and `refusal.BAD_ACCOUNT` (R35) each in a fold; DEC-322 (R34), DEC-323 (R26–R29), DEC-325 are in your requirements. (K3742) A state the design draws "in a fold" is drawn inside that fold with its `.summary` key, open whenever drawn (a roster row is never folded); a zone with no key is drawn by the browser's generic name and its city; the dock's cost and progress lines are screens-inquiry's (R57, R58), no shell line; the undetermined fact's English `why` is N1226 (T51), not yours.
3. U-numbers: U10.
4. T50 continues with no more effort on the assistant (Bob, K3717, K3718); lines that wait on the remote proof stay unbuilt, accepted red by name.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch, and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements (33 KB) and code (113 KB) are well under 600 KB; its tests (102 KB) are run, read only where they name a requirement you change; its used-public figure (176 KB) is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1), "labeled", hand-lists read from the owner's declaration, the `act.<op>.here.<place>` key wherever it explains one of DEC-276's sixteen acts in its place, with `{government}`/`{council}` filled from the team's own place (N1145, K3417), D29 (K3324 (2): no screen treats an answer of `ok: true` that carries `ok: false`, `started: false`, `dispatched: false` or `withheld` as success), "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it as your own (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Naming your module: K3725, K3731 (the asynchronous `publishedcase` for callers, until your job). Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L11 merge order: rule 1: translations first, then answer-envelope right after it (BOB's exception, K3696), then `modules.json`'s order: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, instance-setup, op-declarations, admission, store-door, interface-assets, interface-shell, then the screen jobs with screens-settings first among them (DEC-283) and the rest in `modules.json`'s order (screens-entry, screens-wizards, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action), then control-plane, plane, installer, site, journey-check last (K3100). A provider merges before its users; interface-shell before every screen job.

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, now about 23 KB and read whole (K3679).

## B2 · ANSWER · re J1

All three readings accepted (K3765). (1) Fall back to publishpreflight's zone only when no zone is answered; review's top-level zone is N1229 for T51 (its layer has closed). (2) As you read it: the act sends {kind: 'case_account', framing}, drawn only when the assistant may run, every refusal by its key. (3) The part helper is fine; no shell option is added in T50.

## B3 · CHANGE

wizard-scripts (T50-17) is merged into tranche/T50 (K3771): its SCREEN_REGISTRY is regenerated from design 7be06eb4cb (71 screens, 413 acts, 16 owed). Merge tranche/T50 and re-run your tests against it.

## B4 · CHANGE

op-declarations (T50-24) is merged into tranche/T50 (K3776): the fifteen T50 ops are declared and themeread is in both SESSION_OPS sets. Merge tranche/T50 and re-run; only interface-shell's merge remains before yours, and I send one more CHANGE then.
