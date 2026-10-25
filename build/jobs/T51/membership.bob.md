# BOB to membership (T51)

**Read** · handled J11

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 2, membership: **T51-11 · membership** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/membership.md` (read whole); no id of yours is marked not yet met.
BOB's notes for this job:
1. N1243, red #28: `t19-enrol-boot.test.mjs` R12, R57 assert the key (`hasWord`) where they match `/has NOT been renamed/`.
2. Stale comments `index.mjs`:4, 256, 641, `members.test.mjs`:5, 125, 444 (naming the old interface or the setup page): restate them for the code as it is.
3. Confirm (K3824, for screens-inquiry's "Before you vote", DEC-330 A47): R38's live row of `projectOwnerArithmetic` (`op=projectownerarith`) answers the project's owner count, whether standing down is possible at that size, and `targetMayVote`. Say in your COMPLETE which fields answer each; if one is missing, post a REPORT to BOB (it becomes a requirement change), and do not add it unasked.
4. M-T51-1 (P6): report your raw lines of source (own code in your `paths`) in COMPLETE (4,208 at the draft; the split is T52's, K3809 (1)).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (yours: `t19-enrol-boot.test.mjs` R12, R57 (plan rule 5.4); the K3543 hand-list reds of `module-order.test.mjs` and `t9-notice-sight-bounds.test.mjs`, if any is still red, are yours to fix against `modules.json` (K3268: never a hand list)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio membership tranche/T51 job/T51/membership`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

CHANGE (K3838). membership R120's read contract gains `project_participants.invited_by` (the column R118 already writes; a field added, no meaning changed), for project-roster R35, marked `*(not yet met: T51)*` for you. Merge `tranche/T51` into your branch; make the R120 contract test (whatever states the contract's columns) name `invited_by`, change no column, and COMPLETE again. You merge before project-roster.

## B3 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 2 (R2), membership: **CR-4** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/membership.md` (read whole).
BOB's notes for this job:
1. You start after member-roster (T51-145) has merged: read the Purpose and Provides of `build/requirements/member-roster.md` and the split map `build/extraction/membership-split-T51.md` §2–§7 whole. Delegate each moved name to member-roster (your new R154, the delegation, is its test; R153 moved to member-roster R75), delete the copies, re-export as map §4 says. BOB has retired the moved ids in your requirements at this START (the text is his; you never edit `build/` but your record) and added `member-roster` to your `uses`. Report your module's own size (about 1,700 lines expected) in your Size line.
2. The administrator removals read (formerly your R153) is built by member-roster (its R75, K3946); your part is the delegate, routed through membership's ops as map §4 says.
3. From MEMBER-ROSTER #1's completion (K3976): (a) export `MEMBERSHIP_CHECKS`, `MEMBER_ID_CHECKS` and `CUSTODIAL_CHECKS` as the union of your rows and member-roster's `MEMBER_ROSTER_ROWS` (member-roster exports no `*_CHECKS` name, because answer-envelope's families test reaches every exported `*_CHECKS` table), in the same act that deletes your copies; (b) your `memberList` passes your own `projectsOf` (member-roster R71; its `membersOps` gives none); (c) `checkAddressees` (your R106) asks member-roster R72 `expertiseHolders` and applies your sight; (d) the op `adminremovalsopen` is answered through your ops map.
4. (K3958, bundler R38) `membership/words.mjs`:11 `keyed(key, names)` reads `word` with a variable key: each read names its key literally or by a literal prefix.
5. Your words findings are in `build/plan/words-pass/membership.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `membership.<file stem>.<slug>`, fixed once.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, or held in a test's regular expression): convert those too (K3964, K3965). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality, a regular-expression copy included; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio membership tranche/T51 job/T51/membership`. Your Size line counts only your module's own code (K2513).

## B4 · CHANGE

CHANGE (K3980). R2's close: `checks/run.mjs` on the tranche (after every R2 merge, @ 7ab05dbb47) shows these test copies of sentences in your tests; they read now because the copied sentences are `localize` text elsewhere in the tree since the other R2 merges (member-roster's, credentials', record-core's):

- testcopy membership bio-plane/test/m/membership/t19-enrol-boot.test.mjs:52 [code] "the invitation is still live"
- testcopy membership bio-plane/test/m/membership/t35-words.test.mjs:59 [code] "is an administrator's act (Membership Architecture v2 §4.9), and yo..."
- testcopy membership bio-plane/test/m/membership/t35-words.test.mjs:60 [code] "Civicsmith takes who is asking from the signed-in session rather th..."
- testcopy membership bio-plane/test/m/membership/t35-words.test.mjs:61 [code] "the active administrators. Nothing was changed."
- testcopy membership bio-plane/test/m/membership/t35-words.test.mjs:65 [code] "recording who holds hosting access (4.8)"
- testcopy membership bio-plane/test/m/membership/t46-handles-doors.test.mjs:35 [code] "reading the team's website key and join link"

Merge `tranche/T51` into your branch (never rebase), make each compare with `localize`/`word` by equality or assert the key (K3810), run `node checks/words.mjs /home/user/bio membership` (0 failures) and your tests, and COMPLETE again.

## B5 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the words round RW (K4015; read the RW section whole, and the plan's Sequence and rule 11): membership. Model: claude-haiku-5-5.
Your requirements: `build/requirements/membership.md` (read whole).
BOB's notes for this job:
1. Your findings are what `node checks/words.mjs /home/user/bio membership` lists (civicos-process `main` @ d424c32 or later: pull it first): the check now judges a sentence written as string literals joined only by `+` as one sentence. Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). New ids are `membership.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971). Words only: no provided service changes.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio membership tranche/T51 job/T51/membership`. Your Size line counts only your module's own code (K2513).

## B6 · CHANGE

A flaw in your module, found reading your J6 (P8, K4036): your inherited R151 red (`t50-words.test.mjs`:36) is membership's, not the design's. DEC-345 (merged at R3's close, K3981) split the `reads` lists: membership reads only its own keys (its list holds 15, and its note says so), member-roster reads its 46. But `index.mjs`:36–39 still builds `WORD_KEYS` as `[...SENTENCE_KEYS, ...MEMBER_WORD_KEYS]`, member-roster's 46 keys re-exported under membership's name, so the test compares 61 with 15. Make membership's `WORD_KEYS` its own keys only (member-roster's stay member-roster's `WORD_KEYS`); if any caller of membership's `WORD_KEYS` relied on the union (a start-time check, a delegate), have it read member-roster's own declaration (K3268). R151's test must then pass unchanged, with the module suite green. Then record COMPLETE again.

## B7 · ANSWER · re J7

Your proposal stands (K4037): membership's `WORD_KEYS` is its own 15 keys (DEC-345); the four tests (`t50-words.test.mjs`:26, :60, :158, `t41-sight-words.test.mjs`:232) assert over the union of membership's `WORD_KEYS` and member-roster's `WORD_KEYS`, the member-roster half read from its own export (K3268), with the same strength (test 1's bound becomes the union's count); the reads-list test is unchanged. Make the change, run the module suite (all green), and record COMPLETE again.

## B8 · START

Depth 2. Wave 2. Your entries are below (BOB records them in `build/plan/current.md` as **FR-66 · membership**): the fix round of T51 (K4218; P10), planned whole in `build/plan/fix-round-T51.md`. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/membership.md` (read whole). Write each NEW or amended requirement line yourself in that file (K4210), marked *(not yet met: T51)* until a test names it; the ownership check's listing of that one file is accepted at your merge.
Why this job: `member-roster` (FR-07, merged, its R76–R81) changed what it provides, and membership composes it (since CR-4). Its J6 found two of your tests red on tranche/T51.
Merge order: module index 36, layer 2; independent of the other wave-2 jobs (member-roster is merged).

Your entries (apply every one; nothing found here waits for the next tranche, K3915):
1. **C80 (member-roster R76)** · `t49-founder-handle.test.mjs`:33 (R68) asserts `memberFacts("admin")` is null; since R76 the founder, once she has claimed her place, is a member and the answer is her facts. Bring R68's test (and R68's line, if it states the null) in line with R76: the unclaimed founder answers null, the claimed one her facts, each tested.
2. **R154 (delegation)** · `t51-delegation.test.mjs`:19 wants a delegate on `Membership` for each new public name of member-roster: `expertiseWithdraw` (R79), `endorsementsOwed` (R77), `expertiseAwaitingConfirmation` (R78). Add the three delegates as R154 says delegates are made (the old module delegating to the new, K3268), with the test green.
Reds you inherit: None inherited.
Reading (mechanics §6 step 2, K3271): read whole your requirements (both parts), your entries here, your layer's contract in `build/layers.md`, your own code, the used services your entries touch and the tests that name a requirement your entries change; run your other tests without reading them. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Reading-set measure: your requirements, these entries and the tests they name: well under the 600 KB budget.
Words (K3810, K3930): a sentence a member reads is read by key through `word` or written once with `localize(id, en)`; a test asserts the key or reads the text from the word table, never copies it. Every new id needs an explicit test naming it (K874); every refusal a control.
Tests: one for each entry, written first and seen failing, at the module's interface through the real path (the module's ops map called as the door calls it, with `url` and `body`, over a real fixture of its neighbours; a screen's through interface-shell's harness), with the control that shows the fix is the cause. A test never hand-lists another module's ops, rows or words (K3268).
Before any test run (K4113): every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio membership tranche/T51 job/T51/membership`. Your Size line counts only your module's own code (K2513). Never edit a generated artifact (manifest §14); report one you make stale. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9); nothing found here waits for the next tranche (K3915).

## B9 · START

START · MEMBERSHIP #45 · tranche T51 · product believeinoakland/bio · fix round 10, Wave A batch 2: publish 1 fixture, 6 marker lines (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #289 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/membership tranche/T51 && git branch -m job/T51/membership stale/membership-local && git checkout -b job/T51/membership origin/job/T51/membership`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module membership`; record `build/jobs/T51/membership.md` (append a new section). Model claude-haiku-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Fixtures to publish** in `bio-plane/test/m/membership/fixtures.mjs` (new file), one named export each, made by your real code at test time, never stored; each with a test of yours that calls it and checks the real answer. Their users re-point in their own jobs (a later Wave A batch or Wave B); users now = findings in the live list:
- `projectActRefusals` (users now: promotion 2): the real membership (`membershipOf(ctx, {record})`) with a project, owner and participants set through its own acts: `projectAuthority(p, identity, need, act)` -> PROJECT_ACT_NOT_A_PARTICIPANT; `visibilitySettingRefusal(v)` -> PROJECT_VISIBILITY_UNKNOWN_SETTING; also the whole `makeMembership` double of promotion's fixtures.mjs.

**Markers owed (K5044 (2), K5060; the audit read each line and found it no module's answer):** write on the line or up to eight lines above:
- `// fixtures-own: harness <why>` (your own harness, or a world helper named like an op): fixture.mjs:55,99
- `// fixtures-generic: <the made-up word the line carries>`: t19-enrol-boot.test.mjs:39; t45-project-guard.test.mjs:124,125; t47-check-tables.test.mjs:86

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . membership --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/membership.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-haiku-5-5, medium effort.
