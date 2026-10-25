# BOB to observation-log (T51)

**Read** · handled J9

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 5, observation-log: **T51-34 · observation-log** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/observation-log.md` (read whole); no id of yours is marked not yet met.
BOB's notes for this job:
1. The stale comments at `vocabulary.mjs`:59 and :261 name the old interface (deleted in T51-126): restate them for the code as it is. No behaviour changes.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (none of yours). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio observation-log tranche/T51 job/T51/observation-log`. Your Size line counts only your module's own code (K2513).

## B2 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 5 (R5), observation-log: **T51-200** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/observation-log.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/observation-log.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `observation-log.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971).
2. If your entry names red tests of yours (K3958: civil-time now answers an undetermined `why` as `{key, vars}`), they are accepted only until you merge: make them green against the keyed reasons, passing `{key, vars}` on where you relay a reason.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio observation-log tranche/T51 job/T51/observation-log`. Your Size line counts only your module's own code (K2513).

## B3 · CHANGE

K3994, on your J2: (1) The four 'pass <param>=…' hints are refusal details, and a refusal's detail is a sentence a member can read wherever it travels (K3982): convert them by localize. (2) Where a words.json row holds the same sentence in the design's words (your item 3, all eight, and the condition sentences whose rows drop '(S-7)', '(D-104)'), the list wins (K3930, as provenance-routes' NEVER_LOOKED at K3984): read the row with word(key), its words replacing the code's; delete the duplicate code-side ids. Developer notes in member text go with it. (3) vocabulary.test.mjs R36: compare by equality with the product's own localize(id, en, vars) call (K3988), never a prefix and suffix. (2) changes member text, so name each changed sentence in your COMPLETE. Then re-run tests and checks and post COMPLETE again.

## B4 · CHANGE

CHANGE (K4240): OBSERVATION-LOG, depth 2 (BOB #234 is depth 1). Your branch is at the tranche's tip.
Entry: the design's leads screen draws "Your leads, every lead you can read", but this module has no read that lists them (`leadread` needs an id), so leads written in an earlier visit cannot be reached from the screen (SCREENS-INTAKE #10 J7 (4)). Add a read `leads` (`op=leads`): the leads the viewer may read (the same reach `leadread` applies), newest first, each with what `leadread` answers for its summary (id, title or first words, state, written at, by), at most a stated cap with `truncated`; declared in `DECLARED_OPS` (a read, no field required; accepts what the read takes, e.g. a cursor if you add one). Test at the interface with its reach controls (a lead the viewer may not read is absent). Requirement line for BOB in your COMPLETE.
Before tests: node_modules (K4113). Reading (K3678): your requirements, this entry, your code and the tests naming the ids it touches, whole. Words (K3930). Model sonnet, medium effort; workers sonnet medium, haiku low.

## B5 · START

FIRST, if `mail start` cannot push because your container's copy of your branch is behind origin: do not reset or force anything; run `cd /home/user/bio && git fetch origin job/T51/observation-log tranche/T51 && git branch -m job/T51/observation-log stale/observation-log-local && git checkout -b job/T51/observation-log origin/job/T51/observation-log`, then re-run `mail start`. If a step is refused, post BLOCKED naming it and wait.

START · OBSERVATION-LOG #17 · tranche T51 · product believeinoakland/bio · depth 2 (BOB #253 is depth 1; fix round 6, wave 2; K4571, K4578, K4579)

Mail with `--module observation-log`; record `build/jobs/T51/observation-log.md` (append a new section; earlier sections are history). Model claude-sonnet-5-5, medium effort; workers: haiku low for mechanical work, sonnet medium for reading and diagnosis (K3518). Before tests: every lockfile directory has `node_modules` (K4113). At most two suites at once; always `node --test --test-force-exit`. A document of your reading set you are about to read only in part: stop, post BLOCKED (cause `reading`) (K3678). You are the module job (P8, mechanics §6) for `observation-log`: your diff touches only that module's paths, tests and your record. Merge `tranche/T51` first.

**Read in full:** `build/plan/fix-round-6-T51.md` section 0 (its rules bind you) and the section "G14-G25" (your cause, with its four fields), `build/plan/audit-silent-partial-reads-K4571.md` row S2 (G15) (the audit's evidence), your requirements (both parts), the used services your entry touches, and your code. The file:line evidence is your starting point, never a substitute for reading the code.

**Bob (K4571):** "silent scanning is death! CS should never set a member's expectation that documents are fully read but just scan those documents that are larger than some metric." Nothing a member supplies, captures, searches or publishes is read, searched, listed or exported in part without saying so; a chosen bound is continued by cursor or stated; a platform limit stays and is stated.

**Rules** (plan section 0; K4426-K4428): (1) root cause with file:line; (2) why the tests missed it, and the gap fixed; (3) a failing-first test past the bound, through the module's real entry (the op or the provided service, never an inner helper), seen red in your record, then green; (4) the platform check named in the cause (most are N). R-NOTMET: no "not met", deferred, REPORT or open QUESTION at COMPLETE: name the smallest thing you need and ask BOB now. R-OLD: stored data: "new data only" or a repair. A new sentence a member reads uses a stand-in (a drawn-screen module uses the nearest held row; any other module `localize(id, en)`), the row owed named in your record (BOB's HANDOFF B485 asks the design). Declare every census op you own whose accepted keys change (K4208). Bob's focus: an alpha release deployed as efficiently as possible: do what the entry needs, nothing more.

**Your entry.** **G15 (provider).** `observeIndexed` (`index.mjs:451-465`) states a content axis PRESENT when units were only cut (`truncated`), appending it to the detail; state is `partial` only when `over_bound > 0`. A cut unit makes the axis `partial` as an over-bound one does. Failing-first: an index with one `truncated` unit and none over bound: state `partial` (red now: present); control: an uncut index stays present.

Run: your suite(s), then the users `node build/plan/impact.mjs tranche/T51 HEAD` names (the users of what you changed; when it names hundreds because of a shared table, run the modules that call your changed service); `node /home/user/civicos-process/checks/run.mjs /home/user/bio` (no finding in your files; the words count must not rise); `node /home/user/civicos-process/checks/ownership.mjs /home/user/bio observation-log tranche/T51 job/T51/observation-log`. COMPLETE: what changed (file:line), each failing-first test red then green, suite counts, the requirement lines you propose (BOB writes `build/requirements/`), and the `Size` line.

## B6 · START

START · OBSERVATION-LOG #18 · tranche T51 · product believeinoakland/bio · fix round 10, Wave B job, batch 6: re-point 1 own line (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #292 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/observation-log tranche/T51 && git branch -m job/T51/observation-log stale/observation-log-local && git checkout -b job/T51/observation-log origin/job/T51/observation-log`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module observation-log`; record `build/jobs/T51/observation-log.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Your own fixture lines, done in this job** (1; FIX-E providers are merged on your branch point, FIX-L providers run their contracts in their own jobs). FIX-E: replace the hand-built answer by the provider's fixture from its `fixtures.mjs` (`bio-plane/test/m/<provider>/`, or the provider's own tests directory); FIX-L: add `// fixtures-contract: <provider> <id>` on the value's line or up to eight above:
- extraction/extractionNotice (1 judgment): fixture.mjs:71

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . observation-log --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/observation-log.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-sonnet-5-5, medium effort.
