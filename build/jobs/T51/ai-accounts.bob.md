# BOB to ai-accounts (T51)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 2 (R2), ai-accounts: **T51-175** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/ai-accounts.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/ai-accounts.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `ai-accounts.<file stem>.<slug>`, fixed once.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, or held in a test's regular expression): convert those too (K3964, K3965). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality, a regular-expression copy included; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio ai-accounts tranche/T51 job/T51/ai-accounts`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

CHANGE (K3974; K3964, setup-words R13). Your J1 is merged. The copy you left at `t35-misc.test.mjs`:145 (a substring of the unknown-kind detail) is a test copy of a member sentence whatever the check counts: compare with `localize(id, en[, vars])` by equality, and read that detail by `localize` in `index.mjs` if it is not yet. Merge `tranche/T51` first. Then tests, checks, COMPLETE.

## B3 · CHANGE

CHANGE (K3980). R2's close: `checks/run.mjs` on the tranche (after every R2 merge, @ 3ba33495cb) shows these test copies of sentences in your tests; they read now because the copied sentences are `localize` text elsewhere in the tree since the other R2 merges (member-roster's, credentials', record-core's):

- testcopy ai-accounts bio-plane/test/m/ai-accounts/seams.test.mjs:173 [code] "an ask's grant is minted only under the member's own live session. ..."
- testcopy ai-accounts bio-plane/test/m/ai-accounts/seams.test.mjs:176 [code] "an ask's grant is minted only under the member's own live session. ..."
- testcopy ai-accounts bio-plane/test/m/ai-accounts/seams.test.mjs:183 [code] "a standing question runs only for an active member. Nothing was min..."
- testcopy ai-accounts bio-plane/test/m/ai-accounts/seams.test.mjs:186 [code] "a standing question runs only for an active member. Nothing was min..."

Merge `tranche/T51` into your branch (never rebase), make each compare with `localize`/`word` by equality or assert the key (K3810), run `node checks/words.mjs /home/user/bio ai-accounts` (0 failures) and your tests, and COMPLETE again.

## B4 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the words round RW (K4015; read the RW section whole, and the plan's Sequence and rule 11): ai-accounts. Model: claude-haiku-5-5.
Your requirements: `build/requirements/ai-accounts.md` (read whole).
BOB's notes for this job:
1. Your findings are what `node checks/words.mjs /home/user/bio ai-accounts` lists (civicos-process `main` @ d424c32 or later: pull it first): the check now judges a sentence written as string literals joined only by `+` as one sentence. Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). New ids are `ai-accounts.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971). Words only: no provided service changes.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio ai-accounts tranche/T51 job/T51/ai-accounts`. Your Size line counts only your module's own code (K2513).

## B5 · START

Depth 2. Wave 2. Your entries are below (BOB records them in `build/plan/current.md` as **FR-54 · ai-accounts**): the fix round of T51 (K4206; P7, P10), planned whole in `build/plan/fix-round-T51.md`. Model: claude-haiku-5-5 (one judged declaration; one model up if it blocks on tests).
Your requirements: `build/requirements/ai-accounts.md` (read whole).
Why this job: the declaration pass (`build/plan/fix-round-T51-pass.md` §3 step 5; records `build/plan/pass-T51/RECORD*.md`) could not declare `accountusesset` mechanically: a missing `owner` is refused `NOT_YOUR_ACCOUNT`, naming no field. A module where the declaration needs a judgment gets its own job (P7). Screens send these ops; the guard (`interface-shell` R104) checks each request against its owner's declaration.
Merge order: module index 38, layer 2; independent of the other wave-2 jobs; before the screen that sends the op.

Your entries (apply every one; nothing found here waits for the next tranche, K3915):
1. **K4206** · Declare `accountusesset` in your `DECLARED_OPS` (create it beside your ops map, `export const DECLARED_OPS = Object.freeze({...})` on its own line, if you have none) in the shape `op-declarations` R80 and `op-grades` R49 give (read both lines whole): `classes`, `machineClasses`, `mutating`, `weight` and `description` copied from the op's existing rows (a sentence description as `localize("ai-accounts.declared.<op>", <its sentence>)`; no hand description: its registry label key). For the fields, decide what the declaration can honestly state: `accepts` the fields the arm reads (for an open body, the fields its service reads, as named parameters); `requires` the fields it cannot run without. Where the arm refuses an absent field without naming it, the better fix is in your own arm: the refusal names the field (P8, a flaw in your module), unless your requirements say the answer is deliberately uniform (then `requires` lists only what a refusal names, and your record says why). Never weaken a refusal; never change a meaning your requirements state. Requirement: NEW R (next free id) in your record for BOB. Test: `declared-ops.test.mjs` calling test-support's `declaredOpHolds` (`bio-plane/test/declared-ops.mjs`) for each op; any refusal you changed gets its own test and control. If `test-support` is not in your `uses`, tell BOB in your COMPLETE (BOB adds it).
Reds you inherit: None inherited.
Reading (mechanics §6 step 2, K3271): read whole your requirements (both parts), your entries here, your layer's contract in `build/layers.md`, your own code, the used services your entries touch and the tests that name a requirement your entries change; run your other tests without reading them. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Reading-set measure: your requirements, this entry, your ops map and the named arms, R80, R49 and the helper: well under the 600 KB budget.
Words (K3810, K3930): a sentence a member reads is read by key through `word` or written once with `localize(id, en)`; a test asserts the key or reads the text from the word table, never copies it. Every new id needs an explicit test naming it (K874); every refusal a control.
Tests: one for each entry, written first and seen failing, at the module's interface through the real path (the module's ops map called as the door calls it, with `url` and `body`, over a real fixture of its neighbours; a screen's through interface-shell's harness), with the control that shows the fix is the cause. A test never hand-lists another module's ops, rows or words (K3268).
Before any test run (K4113): every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio ai-accounts tranche/T51 job/T51/ai-accounts`. Your Size line counts only your module's own code (K2513). Never edit a generated artifact (manifest §14); report one you make stale. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9); nothing found here waits for the next tranche (K3915).

## B6 · START

START · AI-ACCOUNTS #6 · tranche T51 · product believeinoakland/bio · fix round 10, Wave A batch 2: publish 14 fixtures, re-point 8 own lines, 1 marker line (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #289 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/ai-accounts tranche/T51 && git branch -m job/T51/ai-accounts stale/ai-accounts-local && git checkout -b job/T51/ai-accounts origin/job/T51/ai-accounts`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module ai-accounts`; record `build/jobs/T51/ai-accounts.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Fixtures to publish** in `bio-plane/test/m/ai-accounts/fixtures.mjs` (new file), one named export each, made by your real code at test time, never stored; each with a test of yours that calls it and checks the real answer. Their users re-point in their own jobs (a later Wave A batch or Wave B); users now = findings in the live list:
- `accountForRefused` (users now: reading-pipeline 5): `accountFor({member, act})` of the real ai-accounts for a member with no account: the whole NO_ACCOUNT refusal with check C-29.1 and translation.
- `accountForResult` (users now: reading-pipeline 1): `accountFor({member, act})` of the real ai-accounts for a member with an account set through `accountReferenceSet`: `{ok:true, level, key}`.
- `accountReference` (users now: signin-door 1): the real `accountReference` answer `{ok, held, subscription}` over a group with and without a connected subscription.
- `accountsServing` (users now: extraction 10, answers 2): a real ai-accounts (as ai-accounts/fixture.mjs world()) with an API key referenced for the member; `accountFor({member, act})` is the service; the member and key are parameters.
- `keepAwaySet` (users now: screens-settings 1): `aiKeepAwaySet({on, uses, reason, by})` ok answer (parameterised by the body).
- `keepAwayState` (users now: screens-settings 1): `aiKeepAwayState()` after a set (kept) and on a fresh account (off).
- `keepAwayUnreadable` (users now: screens-settings 1): `aiKeepAwayState()` over an account whose SQL read throws: `{on:null, reason:null, set_by:null, set_at:null, uses:null}`.
- `keptAwayGroup` (users now: extraction 2, answers 2): aiKeptAway / accountFor with the group keep-away setting on -> AI_KEPT_AWAY (C-29.31), keep_away {reason,set_by,set_at}.
- `keptAwayProject` (users now: extraction 4): the project keep-away set (R22) -> PROJECT_AI_KEPT_AWAY (C-29.38).
- `keptAwayUnreadable` (users now: extraction 1, answers 1): the keep-away setting unreadable (R34) -> AI_KEPT_AWAY with keep_away {null,null,null} and detail.
- `noAccount` (users now: extraction 2, answers 2): accountFor for a member with no reference and no sign-in -> NO_ACCOUNT.
- `subscriptionDisconnect` (users now: signin-door 1): the real `subscriptionDisconnect` answer `{ok, disconnected:true}` of a connected subscription.
- `switchedOff` (users now: answers 1): accountFor with the member (own) or group switch off (R11) -> AI_USE_SWITCHED_OFF {whose, use}.
- `tokenMalformedHold` (users now: signin-door 1): the sign-in token hold with a malformed token (`signintokenhold` path): SUBSCRIPTION_TOKEN_MALFORMED.

**Your own fixture lines, done in this job** (8; FIX-E providers are merged on your branch point, FIX-L providers run their contracts in their own jobs). FIX-E: replace the hand-built answer by the provider's fixture from its `fixtures.mjs` (`bio-plane/test/m/<provider>/`, or the provider's own tests directory); FIX-L: add `// fixtures-contract: <provider> <id>` on the value's line or up to eight above:
- record-core/coreOver (1 judgment/4 mechanical): fixture.mjs:33,44,51,53,54
- record-core/tableDeclarationRefusals (3 mechanical): seam.test.mjs:68,71; seams.test.mjs:340

**Markers owed (K5044 (2), K5060; the audit read each line and found it no module's answer):** write on the line or up to eight lines above:
- `// fixtures-own: harness <why>` (your own harness, or a world helper named like an op): fixture.mjs:92

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . ai-accounts --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/ai-accounts.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-sonnet-5-5, medium effort.
