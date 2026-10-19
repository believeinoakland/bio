# BOB to store-door (T51)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 11 (L11), store-door: **T51-143** (read the entry line whole, and the plan's Sequence and rules 1, 10 and 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/store-door.md` (read whole).
BOB's notes for this job:
1. Your words findings are what `node checks/words.mjs /home/user/bio store-door` lists after you merge `tranche/T51` (4 before L9's merges), with `build/plan/words-pass/store-door.md` if it exists (read whole; an item there the check no longer lists is already done). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944); a copy of a row the design keeps on its unkeyed list is not counted (K4038). The ids you assign are `store-door.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971). Cross-module test copies show only jointly: before COMPLETE also run the check over every L11 module together and fix any line naming your module (K3986).
2. Your entry carries more than words: read the entry line whole and apply every part of it; the requirement lines it names ("Text: fold") are on the tranche branch (K3861–K3869, K4040).
3. Reds you inherit (run at the tranche tip d8e14626bd, K4065): none; run your suite first after merging the tranche.
4. You merge in `modules.json` order with the plan's rule 1 (interface-assets and interface-shell before every screen; control-plane, then plane, then legacy-ui; installer-steps before installer; journey-check last).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio store-door tranche/T51 job/T51/store-door`. Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J2

`translations` added to store-door's uses and its Uses section (K4068); merge tranche/T51 and re-run architecture. dispatch.mjs:245's `error` is the envelope's legacy key, kept only for civicos-ui (deleted by T51-126); no member reads it: leave it as it is, BOB lists it unkeyed with the design (K3944). Then COMPLETE.

## B3 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the completion round (§5.7 (0); P10 as amended, K3915): **CR-27 · store-door** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/store-door.md` (read whole). No requirement changes; your entry fixes a red the tranche's full module run found (K2704), traced by BOB's reading worker.
BOB's notes for this job:
1. (K4149; full module run) `routes.test.mjs`:235, :237 (R10 `translationdraft`) call `setup.translationGrant` and `setup.translationAdopt`, delegates instance-setup removed (K4130, K4143); call them on `translations` (`tr = translationsOf(r.ctx)`, already at :118). Test-only.
2. The local walk runs once more after this round (Bob, K4111): do not run `journey.test.mjs`.
Your layer has closed; this round runs as a layer (§5.3 to §5.6). Nothing found here waits for the next tranche (K3915): a flaw in your module is fixed in this job, one in another module is a REPORT.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Words (K3810, K3930): a test asserts the key or reads the text from the word table, never copies it. Every refusal a control. Report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Never edit a generated artifact (manifest §14); report one you make stale.
Before any test run: every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code (K4113).
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio store-door tranche/T51 job/T51/store-door`. Your Size line counts only your module's own code (K2513).
