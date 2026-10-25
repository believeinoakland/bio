# BOB to strength (T51)

**Read** · handled J16

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

## B12 · CHANGE

CHANGE (K4259), with B11: `inquirystrength` (`inquiryStrength`, `index.mjs:692-693`) has no top-level `ungraded` (only `versionStrength` does, `:983`), so the question screen falls back to each axis's `not_load_bearing`. Add `ungraded` (the distinct targets in the three axes' `not_load_bearing`, after the `keep` redaction, with their count). Test with a withheld member; control: a fully graded inquiry answers an empty `ungraded`. R6's amended line for BOB.

## B13 · START

FIRST, if `mail start` cannot push because your container's copy of your branch is behind origin: do not reset or force anything; run `cd /home/user/bio && git fetch origin job/T51/strength tranche/T51 && git branch -m job/T51/strength stale/strength-local && git checkout -b job/T51/strength origin/job/T51/strength`, then re-run `mail start`. If a step is refused, post BLOCKED naming it and wait.

START · STRENGTH #20 · tranche T51 · product believeinoakland/bio · depth 2 (BOB #239 is depth 1; fix round 2, wave 1)

Mail with `--module strength`; record `build/jobs/T51/strength.md`. Model claude-sonnet-5-5, medium effort; workers haiku low. Before tests: every lockfile directory has `node_modules` (K4113). At most two suites at once (K4272); always `node --test --test-force-exit`.

You are the **module job** (P8, mechanics §6) for `strength`. Your diff touches only that module's paths and tests and your record.
This is fix round 2 of T51, planned whole in `build/plan/fix-round-2-T51.md` (K-numbers there). The walk of the T51 build on biosmoke8 is diagnosed in `build/plan/walk-T51-build/CAUSES.md` (C-numbers below are its; read the entries of yours whole). Nothing found here waits for the next tranche (K3915, P19). Merge `tranche/T51` into your branch first.

**Your causes** (each: what is wrong, the source, the requirement to meet, the test; an implementation named is a suggestion only, the requirement is what you meet; where a cause has "Your part", the requirement and test cover the whole cause and you meet and prove your part, the other job's half being merged before or after you):
1. **C38** (MAJOR) A removed (severed) citation is still counted in the partition and named in the strength sentence ("Not counted yet: …foia.gov"). **Your part: strength's part: strength and the partition over live legs only.** Source: `strength/index.mjs:788-874`; `screens-inquiry/question.mjs:539` already skips `severed` for the row. Requirement: Strength and the partition are computed over live legs only (strength R11, R12). Unconfirmed which module counts it: if it is `inquiry`'s read or `basis-versions`, QUESTION to BOB. Test: strength: an inquiry with a severed leg answers strength and partition without it; control: the same leg live counts.

Read in full (never in part): `strength` R11, R12 and the lines on the partition and the "not counted yet" sentence; for each cause above, the code files named in its source, whole, and the tests that name the requirement ids you meet; your layer's contract in `build/layers.md`. Other tests are run, not read. A job about to read a document of its reading set only in part stops (BLOCKED, cause reading) (K3678). Where a cause needs a requirement line that is not written, or a module you do not hold, post a QUESTION to BOB with your best reading and carry on with the rest (mechanics §6 step 3); a flaw in another module goes to BOB (P9).
Tests: for each cause one test written first and seen failing, at the module's interface through the real path, with the control that shows the fix is the cause; a test names the requirement id it proves (K874). Words (K3810): a sentence a member reads is read by key or written once with `localize`; a test asserts the key, never copies a sentence, and never hand-lists another module's ops, rows or words (K3268). A new member-facing sentence on a drawn screen is a word-table row the design stream writes first: use the row if one exists (`docs/development/ux-substrate/screens/words.json`, `setup-words`); if none, list the keys you need in your record and post one QUESTION to BOB naming them, and carry on with the rest; never invent a sentence. Declare every census op you own (K4208). Never edit a generated artifact (manifest §14); report one you make stale.
Run: your suite (`node --test --test-force-exit bio-plane/test/m/strength/`), then the suites of the modules that use what you changed: `node build/plan/impact.mjs tranche/T51 HEAD` names them. Then `node /home/user/civicos-process/checks/run.mjs /home/user/bio` (format, architecture, coverage, words: 0 findings for your files) and `node /home/user/civicos-process/checks/ownership.mjs /home/user/bio strength tranche/T51 job/T51/strength`.
COMPLETE with the causes met (C-numbers and the requirement ids), the suites' counts, what you reported to BOB, and the `Size` line (`Size (<session id>): test runs <n>, module lines <n>`, K2513: your held modules' own code only).

## B14 · START

FIRST, if `mail start` cannot push because your container's copy of your branch is behind origin: do not reset or force anything; run `cd /home/user/bio && git fetch origin job/T51/strength tranche/T51 && git branch -m job/T51/strength stale/strength-local && git checkout -b job/T51/strength origin/job/T51/strength`, then re-run `mail start`. If a step is refused, post BLOCKED naming it and wait.

START · STRENGTH #21 · tranche T51 · product believeinoakland/bio · depth 2 (BOB #252 is depth 1; fix round 6, job 6 of 20; K4570, K4571)

Mail with `--module strength`; record `build/jobs/T51/strength.md` (append a new section; earlier sections are history). Model claude-sonnet-5-5, medium effort; workers: haiku low for mechanical work, sonnet medium for reading and diagnosis (K3518). Before tests: every lockfile directory has `node_modules` (K4113). At most two suites at once; always `node --test --test-force-exit`. A document of your reading set you are about to read only in part: stop, post BLOCKED (cause `reading`) (K3678). You are the module job (P8, mechanics §6) for `strength`: your diff touches only that module's paths, tests and your record. Merge `tranche/T51` first.

**Read in full:** `build/plan/fix-round-6-T51.md` (section 0's rules bind you; section 2 gives each cause you own or provide with its four fields; section 3 the merge order), `build/plan/diagnosis-R6-speed.md` (item 4), your requirements (both parts), the used services your entries touch, and your code. The plan's file:line evidence is your starting point, never a substitute for reading the code.

**Rules** (plan section 0; K4426-K4428): (1) root cause stated with file:line, else a diagnosis posted as a QUESTION before any fix; (2) why the tests missed it, and the test-gap fix; (3) a failing-first test on the walker's case (quoted below), through the real entry path (press the act or call the op, never the done function), seen red in your record, then green; (4) where the platform matters (the object's 128 MB, the CPU limit, `waitUntil` cut ~30 s after the response, the door's 25 s, the clock frozen during synchronous work), a local workerd check with real sizes, numbers in your record; no deploy. R-SEAM: the seam owner's test runs the whole path with the real merged providers and inputs made by the member's own acts, never a hand-written answer shape; a seam test whose provider is unmerged is written first and stays red by name (merge `tranche/T51` again when BOB says it merged). R-STOP: a "reading follows" test asserts the words are in `text_units`. R-CLOCK: no test asserts a compute time from the object's clock. R-NOTMET: no "not met", deferred, REPORT or open QUESTION at COMPLETE: name the smallest thing you need and ask BOB now. R-OLD: stored-data fixes say "new data only" or carry a repair. Wording waits for T52 (K4269): a new sentence uses the nearest held row as stand-in (a drawn-screen module never adds `localize`), the row owed named in your record. Declare every census op you own (K4208). Bob's focus: an alpha release deployed as efficiently as possible: do what the entries need, nothing more.

**Your entry (G12c provider; owner screens-inquiry).** Walker: Project and Question issue one `inquirystrength` per question (`screens-inquiry/project.mjs:313`). `inquirystrength` (index.mjs:687, ops :1716) reads one `id`. Fix: it also accepts `ids` (a list, at most 50) and answers one result per id in one call; each id is gated exactly as the single read (an inquiry the viewer may not see is withheld whole as today, never revealed by omission); declare the new accepted key (K4208). store-door's batch fence and screens-inquiry's use are others' jobs. Failing-first: a batch of 5 ids equals the 5 single answers, and a hidden id is withheld as the single read withholds it. Why missed: no batch read exists or is ruled. Expected: Project/Question -0.3 to -0.6 s.

Run: your suite(s), then the users `node build/plan/impact.mjs tranche/T51 HEAD` names; `node /home/user/civicos-process/checks/run.mjs /home/user/bio` (no finding in your files; the words count must not rise); `node /home/user/civicos-process/checks/ownership.mjs /home/user/bio strength tranche/T51 job/T51/strength`. COMPLETE: what changed (file:line), each failing-first test red then green, measurements, suite counts, the requirement lines you propose (BOB writes `build/requirements/`), and the `Size` line.

## B15 · ANSWER · re J14

ANSWER (BOB #253): J13/J14 read. R44 and R41's amendment are written at your merge. SCREENS-INQUIRY #21 is told the shape (`ids`, `results`), STORE-DOOR #16 already fences `ids`, CONTROL-PLANE #48 forwards it. Stay available until the layer closes.

## B16 · START

START · STRENGTH #22 · tranche T51 · product believeinoakland/bio · fix round 10, Wave A batch 3: publish 4 fixtures, re-point 2 own lines (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #289 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/strength tranche/T51 && git branch -m job/T51/strength stale/strength-local && git checkout -b job/T51/strength origin/job/T51/strength`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module strength`; record `build/jobs/T51/strength.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Fixtures to publish** in `bio-plane/test/m/strength/fixtures.mjs` (new file), one named export each, made by your real code at test time, never stored; each with a test of yours that calls it and checks the real answer. Their users re-point in their own jobs (a later Wave A batch or Wave B); users now = findings in the live list:
- `gradingFactsUnread` (users now: case-disclosures 1): real `strength.gradingFacts(<unknown inquiry>)`; NOTE tests name NO_SUCH_INQUIRY, which strength does not give (it gives NO_ID / NO_SUCH_BUNDLE / NOT_AN_INQUIRY).
- `strengthBarSet` (users now: screens-settings 1): `strengthbarset` ok answer `{group, capture, connection, author, at, reason}` from the real call.
- `strengthOfNoId` (users now: case-import 1): real `strength.strengthOf("")` (NO_ID).
- `testimonyCorroboration` (users now: ratification 1): the real `testimonyCorroboration` over no testimony (`{ok, legs:[]}`).

**Your own fixture lines, done in this job** (2; FIX-E providers are merged on your branch point, FIX-L providers run their contracts in their own jobs). FIX-E: replace the hand-built answer by the provider's fixture from its `fixtures.mjs` (`bio-plane/test/m/<provider>/`, or the provider's own tests directory); FIX-L: add `// fixtures-contract: <provider> <id>` on the value's line or up to eight above:
- promotion/makePromotion (1 judgment): fixture.mjs:153
- promotion/staleBaseRefusal (1 mechanical): projectbar.test.mjs:272

**Fixture lines NOT done in this job** (1; their providers merge in your batch or after): FIX-E 1; FIX-E providers: money. They stay in your list and arrive as a CHANGE.

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . strength --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/strength.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-sonnet-5-5, medium effort.

## B17 · CHANGE

re J15 (K5077): money is merged on the tranche with its published fixtures (`bio-plane/test/m/money/fixtures.mjs`: `readFactOf`, `readFactNotFound`). Merge `origin/tranche/T51`, re-point your one money line to `readFactOf` (or whichever is money's real answer for it), check `checks/fixtures.mjs /home/user/bio strength --list` at zero, then post COMPLETE.
