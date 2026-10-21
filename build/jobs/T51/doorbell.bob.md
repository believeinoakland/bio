# BOB to doorbell (T51)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 3 (R3), doorbell: **T51-182** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/doorbell.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/doorbell.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `doorbell.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio doorbell tranche/T51 job/T51/doorbell`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

CHANGE (K3982), on your two open points, before I merge:
1. `knocker.test.mjs`:205 matches a regular-expression copy of the product sentence ("received at the doorbell of your team's Civicsmith as knock … not fetched"). setup-words R13 binds it whatever the check counts (K3964): compare `asserts` with the product's own `localize`/`word` call evaluated with the fixture's vars, by equality.
2. `expect.mjs`:18 mints `localize("doorbell.checks.group_can_see", …)`, an id no product code reads. A test never holds a sentence (K3810) and never mints an id (the extraction would make it a row): if the product shows that sentence, the test reads the product's key; if not, delete the constant and assert what the product actually answers.
Merge `tranche/T51` (never rebase), run your tests and `node checks/words.mjs /home/user/bio doorbell`, and COMPLETE again.

## B3 · START

FIRST, if `mail start` cannot push because your container's copy of your branch is behind origin: do not reset or force anything; run `cd /home/user/bio && git fetch origin job/T51/doorbell tranche/T51 && git branch -m job/T51/doorbell stale/doorbell-local && git checkout -b job/T51/doorbell origin/job/T51/doorbell`, then re-run `mail start`. If a step is refused, post BLOCKED naming it and wait.

START · DOORBELL #5 · tranche T51 · product believeinoakland/bio · depth 2 (BOB #240 is depth 1; fix round 2, wave 3, K4323)

Mail with `--module doorbell`; record `build/jobs/T51/doorbell.md`. Model claude-sonnet-5-5, medium effort; workers haiku low. Before tests: every lockfile directory has `node_modules` (K4113). At most two suites at once (K4272); always `node --test --test-force-exit`. A document of your reading set you are about to read only in part: stop, post BLOCKED (cause `reading`) (K3678).

You are the **module job** (P8, mechanics §6) for `doorbell`. Your diff touches only that module's paths and tests and your record. This is fix round 2 of T51 (`build/plan/fix-round-2-T51.md`); merge `tranche/T51` into your branch first. Nothing found here waits for the next tranche (K3915, P19). Every requirement you meet is named by a test seen failing first, with a negative control; propose any requirement line in your COMPLETE for BOB to write (BOB writes `build/requirements/`). Run your suite, then `build/plan/impact.mjs tranche/T51 HEAD`'s users; format, architecture, coverage, words and ownership clean (reds also on the tranche tip are named, not fixed). Declare every census op you own (K4208).

**Your causes:**
1. **C28's plane half: what a knock is** (SCREENS-INTAKE #13 REPORT 2, K4328). A knock in the inbox stores no file name or type, so the inbox cannot tell a member what arrived before she pulls it. Requirement (new line, proposed by you; read your R3 and the knock's record whole): a knock records the file name and media type its sender stated (bounded, never trusted as a type check: the file-safety scan still decides), and the inbox read answers both. Test with control (a knock with neither stated answers them absent). A read of the bytes before the pull (a safe view) is not in this entry; say in your COMPLETE what it would take.
