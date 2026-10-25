# BOB to lines (T51)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 5 (R5), lines: **CR-7** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/lines.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/lines.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `lines.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971).
2. Your entry carries more than words: read the entry line whole and apply every part of it; the requirement lines it names ("Text: fold") are already on the tranche branch.
3. If your entry names red tests of yours (K3958: civil-time now answers an undetermined `why` as `{key, vars}`), they are accepted only until you merge: make them green against the keyed reasons, passing `{key, vars}` on where you relay a reason.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio lines tranche/T51 job/T51/lines`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

K3995 (CALCULATIONS #6 J3, confirmed): connection-grammar's neighbours contract (reads.mjs:78, reasonFills) refuses lines' line:contracts_with and line:holds:employee OWNER_NONCONFORMING because lines' undetermined 'at' reasons are plain text: index.mjs:351 'cache stale', :354 String(e.message||e) on a validAt throw (a developer message must never reach why), :360 word(...) English instead of a key, and :600 'cache stale'. Your CR-7 entry keys exactly these: each why is {key, vars} (a civil-time reason passed on as given). Confirm with calculations' test on your branch: `node --test bio-plane/test/m/calculations/application.test.mjs` (R32, :73, expects relationships 'contract;former_employment'), and say so in your COMPLETE.

## B3 · CHANGE

K3997: (1) holderAt: your reading of R11 stands (undetermined: true, why the key); duties follows now, actions in L9. (2) nested reasons: setup-words' word will fill a var that is a reason with its words (CR-14); keep R24's nesting. (3) R24 is worded to connection-grammar R6/R20, as you built (BOB's edit on the tranche): merge tranche/T51, re-run your tests, and post COMPLETE again; no code change expected.

## B4 · START

START · LINES #6 · tranche T51 · product believeinoakland/bio · fix round 10, Wave A batch 3: publish 1 fixture, re-point 1 own line (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #289 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/lines tranche/T51 && git branch -m job/T51/lines stale/lines-local && git checkout -b job/T51/lines origin/job/T51/lines`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module lines`; record `build/jobs/T51/lines.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Fixtures to publish** in `bio-plane/test/m/lines/fixtures.mjs` (new file), one named export each, made by your real code at test time, never stored; each with a test of yours that calls it and checks the real answer. Their users re-point in their own jobs (a later Wave A batch or Wave B); users now = findings in the live list:
- `linesWorld` (users now: instance-setup 7): real `linesOf(...)`: `recordLine` (UNKNOWN_LINE_KIND, NO_SUCH_ENTITY, SEAT_ON_ENDS, HOLDER_NOT_A_PERSON, UNKNOWN_CAPACITY, BAD_CAPACITY, MACHINE_NEEDS_IDENTIFIERS).

**Your own fixture lines, done in this job** (1; FIX-E providers are merged on your branch point, FIX-L providers run their contracts in their own jobs). FIX-E: replace the hand-built answer by the provider's fixture from its `fixtures.mjs` (`bio-plane/test/m/<provider>/`, or the provider's own tests directory); FIX-L: add `// fixtures-contract: <provider> <id>` on the value's line or up to eight above:
- promotion/makePromotion (1 judgment): fixture.mjs:57

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . lines --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/lines.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-sonnet-5-5, medium effort.

## B5 · CHANGE

re J5: `promotion` added to lines' `uses` in `build/modules.json` (K5077; order unchanged, `order.mjs --check` clean). Merge `origin/tranche/T51` into your branch, re-run `checks/architecture.mjs /home/user/bio lines` (absolute root), then post COMPLETE.
