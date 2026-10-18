# BOB to doctypes (T51)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 1, doctypes: **T51-8 · doctypes** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/doctypes.md` (read whole).
BOB's notes for this job:
1. The stale comment at `meeting-minutes.mjs`:81 names `civicos-ui/app.html` (deleted in T51-126): restate it for what the code is now.
2. M-T51-1 (P6): report your module's raw lines of source (its own code in its `paths`, never tests or generated files) in your COMPLETE; nothing else depends on it in this job.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (no base red of K3543 or K3557 is in layer 1). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio doctypes tranche/T51 job/T51/doctypes`. Your Size line counts only your module's own code (K2513).

## B2 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 1 (R1), doctypes: **T51-168** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/doctypes.md` (read whole). Your entry changes no requirement's meaning; BOB added `setup-words` (`word`, `localize`) to your requirements' Uses at this START where the pass added the import.
BOB's notes for this job:
1. Your findings are listed by the words check itself in `build/plan/words-pass/doctypes.md` (read whole): each is a judgment the codemod could not make (a stitched sentence, a partial copy, a hand-list, a custom error class, a signed text). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944).
2. The ids you assign are `doctypes.<file stem>.<slug>`, fixed once.
3. BOB added `setup-words` to your `uses` in `build/modules.json` and to your requirements' Uses at this START; R21's test that lists your declared imports is yours to update to match.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize`. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; `localize` answers `en` until BOB regenerates them at the layer close. Your words file's findings must all read zero in `node checks/run.mjs` before COMPLETE.
Tests never copy a sentence people read; every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (format and architecture 0 failures; the words check shows no finding in your module) and `node checks/ownership.mjs /home/user/bio doctypes tranche/T51 job/T51/doctypes`. Your Size line counts only your module's own code (K2513).

## B3 · CHANGE

CHANGE (K3957, K3959): merge tranche/T51 into your branch and pull civicos-process (27aa50e) first. The words check gained a `plain` arm: lowercase, unpunctuated strings of 5+ words that it missed before (e.g. a `why:` reason a member reads). Your module has 79 of them, listed in the section "Plain findings (K3957)" of build/plan/words-pass/doctypes.md (read it whole). Judge each by the words rule of your START: a sentence a member can read is read through localize('doctypes.<file stem>.<slug>', en, vars) (or word(key) where a row exists), a test copying it compares with localize/word; text no member ever reads goes in a REPORT to BOB, each with why, for the design's unkeyed list (K3944). Then run your tests and checks again (the words check must show no finding in your module but those you REPORTed) and record COMPLETE again.
