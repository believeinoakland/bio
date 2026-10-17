# BOB to screens-investigate (T50)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 11, screens-investigate: **T50-33 · screens-investigate**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/screens-investigate.md` (read whole), K3742; the ids marked `*(not yet met: T50)*` are yours to meet: R31 (the `theme` screen), R32 (Person: every fact, no empty graph), R33 (Timeline), R34 (forms choose, not ask for a fingerprint), R35 (nodes labeled, the unnamed node), R36 (a proceeding's court and kind chosen; a court may be added), R37 (People), R38 ("Same person?" in the design's words, each act explained), R39 (`screen.person.same.because`'s `{basis}`).
BOB's notes for this job:
1. Entry: (N1101) the `theme` screen. (N1127) the registry's `person` and `timeline` acts. (N1102, DEC-243) `timeline` states a–c with T50-62's read. (N1079) choices from each row's `capture.sha256` (capture R77 answers it, K3627). (N1183) placeholders, fingerprint-free forms, B-18. (N1086, N1090) nodes labeled, the unnamed node. (N1190) the court choice and "Add a court". (N1193) the Person page's every fact; the Timeline's dated facts. (U16, DEC-294) the People page (K3664). (N1161 F9) the person page's "Same person?" in the design's words, its two acts each explained (R38; DEC-313's row labels, R39, K3703).
2. K3742: R31, R32 (its R85 citation re-pointed to R73), R33, R36, R38, R39 amended; DEC-319 (R32, R33 (5), R36, R38, with `label.claimbases.*` by people's `CLAIM_BASES` ids) and DEC-323 (R31) are in your requirements. Draw the four `screen.timeline.datekind.*` keys for `entered`, `hearing`, `period_covered`, `edited` (the plan's L11 header, K3749). (K3742) A state the design draws "in a fold" is drawn inside that fold with its `.summary` key, open whenever drawn (a roster row is never folded); a zone with no key is drawn by the browser's generic name and its city; the dock's cost and progress lines are screens-inquiry's (R57, R58), no shell line; the undetermined fact's English `why` is N1226 (T51), not yours.
3. M-T50-1: your START re-measures your module (2,082 lines now); split by copy first if it would pass about 4,000 (K624).
4. U-numbers: U16.
5. T50 continues with no more effort on the assistant (Bob, K3717, K3718); lines that wait on the remote proof stay unbuilt, accepted red by name.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch, and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements (42 KB) and code (169 KB) are well under 600 KB; its tests (138 KB) are run, read only where they name a requirement you change; its used-public figure (168 KB) is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1), "labeled", hand-lists read from the owner's declaration, the `act.<op>.here.<place>` key wherever it explains one of DEC-276's sixteen acts in its place, with `{government}`/`{council}` filled from the team's own place (N1145, K3417), D29 (K3324 (2): no screen treats an answer of `ok: true` that carries `ok: false`, `started: false`, `dispatched: false` or `withheld` as success), "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it as your own (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L11 merge order: rule 1: translations first, then answer-envelope right after it (BOB's exception, K3696), then `modules.json`'s order: wizard-scripts, op-grades, affordances, machinery-producers, queue-producers, notice-producers, queue, instance-setup, op-declarations, admission, store-door, interface-assets, interface-shell, then the screen jobs with screens-settings first among them (DEC-283) and the rest in `modules.json`'s order (screens-entry, screens-wizards, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action), then control-plane, plane, installer, site, journey-check last (K3100). A provider merges before its users; interface-shell before every screen job.

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, now about 23 KB and read whole (K3679).

## B2 · CHANGE

wizard-scripts (T50-17) is merged into tranche/T50 (K3771): its SCREEN_REGISTRY is regenerated from design 7be06eb4cb (71 screens, 413 acts, 16 owed). Merge tranche/T50 and re-run your tests against it.

## B3 · CHANGE

op-declarations (T50-24) is merged into tranche/T50 (K3776): the fifteen T50 ops are declared and themeread is in both SESSION_OPS sets. Merge tranche/T50 and re-run; only interface-shell's merge remains before yours, and I send one more CHANGE then.

## B4 · CHANGE

interface-shell (T50-27) is merged into tranche/T50 (K3777); it reads every screen's acts from SCREEN_REGISTRY (design 7be06eb4cb). Its R73 test finds screens-settings' members naming six acts and screens-investigate's person one act that the registry does not list for them, as composed from tranche/T50 today. Merge tranche/T50, run interface-shell's t-composition test (R73, every act of the real SCREENS composes) with your module, make your screens draw exactly the registry's acts, and post COMPLETE.
