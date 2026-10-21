# BOB to extraction (T51)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 4 (R4), extraction: **T51-189** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/extraction.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/extraction.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `extraction.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971).
2. (K3958, bundler R38) `extraction/words.mjs`:7 imports the whole `WORD_ROWS` and :67 `say(key)` reads a variable key: read rows by `word`/`hasWord` with literal keys or literal prefixes, never the whole table, so agent-worker's bundle can carry only the rows it reads.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio extraction tranche/T51 job/T51/extraction`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

CHANGE (K3987), a note only, no code change: Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987). Carry on.

## B3 · CHANGE · re J1

CHANGE and answer (K3988): (1) "team" stays: K3472 is "team", never "group", in any text people read (K3803 (3) is the same rule, "team" for "group"); no change. (2) `n26.test.mjs`:208 now asserts the fragment "evidence store set up", a substring copy of your new sentence (setup-words R13 binds it, K3964): compare by equality with the product's `localize` call. (3) Code-written ids need no row: `rows.mjs` gains them at the layer close. Merge `tranche/T51`, run tests and the words check, COMPLETE again.

## B4 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the completion round (§5.7 (0); P10 as amended, K3915): **CR-18 · extraction** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/extraction.md` (read whole). R77 (`readingFor` states `bytes` from `provenance.homeOf`) is marked not yet met: meet it.
BOB's notes for this job:
1. Provider of screens-inquiry R82 (CR-19): merged before it.
2. Your layer has closed; this round runs as a layer (§5.3 to §5.6). Do every item of your entry; nothing found here waits for the next tranche (K3915): a flaw in your module is fixed in this job, one in another module is a REPORT.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`; generated artifacts excluded). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Words (K3810, K3930): a sentence a member reads is read by key through `word` or written once with `localize(id, en)`; a test asserts the key or reads the text from the word table, never copies it. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio extraction tranche/T51 job/T51/extraction`. Your Size line counts only your module's own code (K2513).
Before any test run: every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code (K4113).

## B5 · CHANGE

CHANGE (K4127; SCREENS-INQUIRY #13 J8 (1)). Your R78 is written on the tranche (merge it first): `readingFor`'s answer also states `format`, the reading's own `capture_format` (a format-registry id; your `readings` table holds it), absent when null, and withheld with the bundle as `bytes` is. Test and control as R78 says; then post COMPLETE again. screens-inquiry draws the file card's kind from it after you merge.

## B6 · START

FIRST, if `mail start` cannot push because your container's copy of your branch is behind origin: do not reset or force anything; run `cd /home/user/bio && git fetch origin job/T51/extraction tranche/T51 && git branch -m job/T51/extraction stale/extraction-local && git checkout -b job/T51/extraction origin/job/T51/extraction`, then re-run `mail start`. If a step is refused, post BLOCKED naming it and wait.

START · EXTRACTION #28 · tranche T51 · product believeinoakland/bio · depth 2 (BOB #239 is depth 1; fix round 2, added by K4318)

Mail with `--module extraction`; record `build/jobs/T51/extraction.md`. Model claude-sonnet-5-5, medium effort; workers haiku low. Before tests: every lockfile directory has `node_modules` (K4113). At most two suites at once (K4272); always `node --test --test-force-exit`.

You are the **module job** (P8, mechanics §6) for `extraction`. Your diff touches only that module's paths and tests and your record.
This is fix round 2 of T51, planned whole in `build/plan/fix-round-2-T51.md` (K-numbers there). The walk of the T51 build on biosmoke8 is diagnosed in `build/plan/walk-T51-build/CAUSES.md` (C-numbers below are its; read the entries of yours whole). Nothing found here waits for the next tranche (K3915, P19). Merge `tranche/T51` into your branch first.

**Your cause** (found by CAUSE-HALVES-T51):
1. **C17** reading-pipeline R35 (merged) gives a reading `words_total` and `words_read`; extraction's re-read (`extraction/index.mjs:1310`, `:1512`) must also set them (from `textWordsFor`), store them and answer them, so a document re-read says how much of it was read. Write the requirement line in your record (I fold it) and test it: a re-read answers both counts as the first reading does; control: a document never re-read answers its first reading's counts.

Read in full (never in part): extraction's lines on the re-read and what it stores; reading-pipeline R35 (read, not yours); the two sites named and `textWordsFor`; the tests naming the re-read lines. Other tests are run, not read. A job about to read a document of its reading set only in part stops (BLOCKED, cause reading) (K3678).
Tests: for each cause one test written first and seen failing, at the module's interface through the real path, with the control that shows the fix is the cause; a test names the requirement id it proves (K874). Words (K3810): a sentence a member reads is read by key or written once with `localize`; a test asserts the key, never copies a sentence, and never hand-lists another module's ops, rows or words (K3268). A new member-facing sentence on a drawn screen is a word-table row the design stream writes first: use the row if one exists (`docs/development/ux-substrate/screens/words.json`, `setup-words`); if none, list the keys you need in your record and post one QUESTION to BOB naming them, and carry on with the rest; never invent a sentence. Declare every census op you own (K4208). Never edit a generated artifact (manifest §14); report one you make stale.
Run: your suite (`node --test --test-force-exit bio-plane/test/m/extraction/`), then the suites of the modules that use what you changed: `node build/plan/impact.mjs tranche/T51 HEAD` names them. Then `node /home/user/civicos-process/checks/run.mjs /home/user/bio` (format, architecture, coverage, words: 0 findings for your files) and `node /home/user/civicos-process/checks/ownership.mjs /home/user/bio extraction tranche/T51 job/T51/extraction`.
COMPLETE with the causes met (C-numbers and the requirement ids), the suites' counts, what you reported to BOB, and the `Size` line (`Size (<session id>): test runs <n>, module lines <n>`, K2513: your held modules' own code only).
