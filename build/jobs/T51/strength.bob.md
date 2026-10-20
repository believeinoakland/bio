# BOB to strength (T51)

**Read** · handled J9

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 6, strength: **T51-54 · strength** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/strength.md` (read whole); no id of yours is marked not yet met.
BOB's notes for this job:
1. The stale comment at `test/m/strength/vocabulary.mjs`:4 names `civicos-ui/test/analyst-vocabulary.mjs`: restate it for the code as it is (the old interface is deleted in T51-126).
2. `method.mjs`' grading-method text says "group" for the team and was held back by K3811's pass because published cases pin it byte for byte: add a new method version whose text says "team"; every earlier version stays byte-identical. Tests prove both (a new version's text, and an earlier version's bytes unchanged). If a requirement of yours fixes the method versions' list, say so in your COMPLETE with the id.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`; generated artifacts excluded). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (none of yours). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio strength tranche/T51 job/T51/strength`. Your Size line counts only your module's own code (K2513).

## B2 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 6 (R6), strength: **T51-221** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/strength.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/strength.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `strength.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971).
2. If your entry names red tests of yours (K3958: civil-time now answers an undetermined `why` as `{key, vars}`), they are accepted only until you merge: make them green against the keyed reasons, passing `{key, vars}` on where you relay a reason.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio strength tranche/T51 job/T51/strength`. Your Size line counts only your module's own code (K2513).

## B3 · ANSWER · re J3

Your best reading is right. The three published grading-method texts (bio-grading/1, /2, /3: V1_LINES, V2_LEGS and the lines gradingMethodText returns) are signed, pinned bytes (K1333): a version changes only as a new version with every earlier one byte-identical, and a row edit must never reach them. Leave them as code, unkeyed, and list them in a REPORT as 'signed method versions, pinned' for the design's unkeyed list (K3944). Convert everything else in the module as you planned.

## B4 · ANSWER · re J4

Settled (K4014). (1) `setup-words` added to strength's `uses` in build/modules.json and to your requirements' Uses, on tranche/T51: merge it and re-run architecture. (2) R40 worded to the design's row: its translation is `refusal.PROJECT_BAR_NO_REASON` as the table holds it (the list wins); the 2,000-character bound stays enforced, only not stated in the sentence (BOB's wording edit). Your test comparing with the row is right. (3) program.mjs and the plane bundle are regenerated by BOB at R6's close; case-checker's R13/R25 reds until then are expected. (4) Your unkeyed strings are accepted and go to the design with R6's batch. Then run checks/run.mjs and setup-words --check, and COMPLETE.

## B5 · CHANGE

CHANGE (K4015): the words check now judges a sentence written as string literals joined only by `+` as one sentence at the chain's first line (civicos-process `main` @ d424c32; `git -C /home/user/civicos-process pull`). Before your COMPLETE (or now, if you are already complete): pull it, run `node checks/words.mjs /home/user/bio <your module>`, and fix every finding the words rule covers (a member-read sentence by `localize` or `word`, a copy of a row by `word`, a test copy by equality); list any you judge no person reads in your record for the design's unkeyed list. Merge tranche/T51 first. Then COMPLETE (again).

## B6 · START

Depth 2. Wave 2. Your entries are below (BOB records them in `build/plan/current.md` as **FR-50 · strength**): the fix round of T51 (K4205; P10), planned whole in `build/plan/fix-round-T51.md`. Model: claude-haiku-5-5 (test repairs; one model up if it blocks on tests).
Your requirements: `build/requirements/strength.md` (read whole).
Why this job: two of your tests are red on `tranche/T51` since the design re-worded your rows (DEC-383 to DEC-385, `rows.mjs` regenerated); diagnosis `build/plan/pass-T51/DIAGNOSIS-reds.md`. They copy sentences, which K3810 forbids.
Merge order: module index 84, layer 6; independent of the other wave-2 jobs.

Your entries (apply every one; nothing found here waits for the next tranche, K3915):
1. **K4205** · `bio-plane/test/m/strength/reads.test.mjs`:50 ("R6, R22: a member the viewer may not see is withheld whole") matches `/^connection C — /`, and `vocabulary.test.mjs`:118 ("R28 …") matches `/INQ-2026-0007-a is UNRATED on/` and a second sentence regex in the same list: the rows now read otherwise. Make each assert by key or read the expected text from the word table (`word(…)` with its vars), never a copied sentence, keeping every control. Test: both green; each control seen failing.
Reds you inherit: None inherited.
Reading (mechanics §6 step 2, K3271): read whole your requirements (both parts), your entries here, your layer's contract in `build/layers.md`, your own code, the used services your entries touch and the tests that name a requirement your entries change; run your other tests without reading them. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Reading-set measure: your requirements, these entries and the tests they name: well under the 600 KB budget.
Words (K3810, K3930): a sentence a member reads is read by key through `word` or written once with `localize(id, en)`; a test asserts the key or reads the text from the word table, never copies it. Every new id needs an explicit test naming it (K874); every refusal a control.
Tests: one for each entry, written first and seen failing, at the module's interface through the real path (the module's ops map called as the door calls it, with `url` and `body`, over a real fixture of its neighbours; a screen's through interface-shell's harness), with the control that shows the fix is the cause. A test never hand-lists another module's ops, rows or words (K3268).
Before any test run (K4113): every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio strength tranche/T51 job/T51/strength`. Your Size line counts only your module's own code (K2513). Never edit a generated artifact (manifest §14); report one you make stale. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9); nothing found here waits for the next tranche (K3915).

## B7 · CHANGE

Requirement lines (K4210, for every wave-2 job): write your NEW and amended requirement lines yourself in build/requirements/<your module>.md, each marked *(not yet met: T51)* until your tests name it; the ownership check's listing of that one file is accepted at your merge. If you have already put them in your record instead, either is fine: say which in your COMPLETE.

## B8 · CHANGE

Requirement lines (K4210, for every wave-2 job): write your NEW and amended requirement lines yourself in build/requirements/<your module>.md, each marked *(not yet met: T51)* until your tests name it; the ownership check's listing of that one file is accepted at your merge. If you have already put them in your record instead, either is fine: say which in your COMPLETE.

## B9 · CHANGE

CHANGE (K4213; inquiry J4, K4194 L9): a question's strength is its supporting legs': `axisResult` (and every path that builds the population) leaves a leg whose `role` is `cuts_against` out of the members and out of the implicit AND part, so `[supports A in g1, cuts_against C unlabelled]` reads A. A cutting leg keeps its own strength by the same computation where the module reports one (Case Making §3, invariant 7: "a finding that cuts against the case has the same strength computation as one that supports it"), never folded into the supported answer's. Write the requirement line yourself (K4210), with the test and a control (the same pair before the change read C). `inquiry` (FR-45) leaves cutting legs unlabelled since `inquiry-grammar` R68.

## B10 · ANSWER · re J8

ANSWER J8 (K4218): your four choices stand (`bio-grading/4`; `/1`–`/3` recompute as published; the `cutting` list; `role` in `graded`). Rule 11's signed text stays code: BOB asks UX-DESIGN to add it to the unkeyed list (HANDOFF); strength's one words finding is accepted red by name until that merges. Merged (K4218).

## B11 · CHANGE

CHANGE (K4258): STRENGTH, depth 2 (BOB #236 is depth 1). Your branch is at the tranche's tip. Model: claude-haiku-5-5 (one model up if it blocks on tests).
Why: op-declarations (J18, confirmed by BOB at `bio-plane/src/strength/index.mjs:1683`, `:1697`) found that your `DECLARED_OPS` declares `strengthbarset` while your ops map serves only `strengthbar`: since K4254 dropped the alias, no arm answers `strengthbarset`, the op `screens-settings` sends (`group.mjs:322`), and `op-declarations` R6 (no spec without a handler) is unmet.
Entries:
1. Your ops map serves `strengthbarset` with the arm `strengthbar` has (`strengthBarSet` with `author` from the query); `strengthbar` stays served (op-capabilities and case-catalogue still name it until the round's hand-row deletion). Test: `strengthbarset` through the ops map as the door calls it sets the bar and reads back by `strengthbarof`; control: an unknown op is still refused.
2. `DECLARED_OPS.strengthbarset` gains `needs: "publish"` (the capability `strengthbar`'s hand row carries, op-capabilities). Its honesty test (`declaredOpHolds`) stays green.
Requirement lines for BOB in your COMPLETE.

Reading (mechanics §6 step 2, K3271): read whole your requirements (both parts), your entries here, your layer's contract in `build/layers.md`, your own code, the used services your entries touch and the tests that name a requirement your entries change; run your other tests without reading them. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Words (K3810, K3930): a sentence a member reads is read by key through `word` or written once with `localize(id, en)`; a test asserts the key or reads the text from the word table, never copies it. Every new id needs an explicit test naming it (K874); every refusal a control.
Tests: one for each entry, written first and seen failing, at the module's interface through the real path (the module's ops map called as the door calls it, with `url` and `body`, over a real fixture of its neighbours; a screen's through interface-shell's harness), with the control that shows the fix is the cause. A test never hand-lists another module's ops, rows or words (K3268).
Before any test run (K4113): every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio strength tranche/T51 job/T51/strength`. Your Size line counts only your module's own code (K2513). Never edit a generated artifact (manifest §14); report one you make stale. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9); nothing found here waits for the next tranche (K3915).
