# BOB to signin-door (T51)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 11 (L11), signin-door: **T51-245** (read the entry line whole, and the plan's Sequence and rules 1, 10 and 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/signin-door.md` (read whole).
BOB's notes for this job:
1. Your words findings are what `node checks/words.mjs /home/user/bio signin-door` lists after you merge `tranche/T51` (entries=1 before L9's merges), with `build/plan/words-pass/signin-door.md` if it exists (read whole; an item there the check no longer lists is already done). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944); a copy of a row the design keeps on its unkeyed list is not counted (K4038). The ids you assign are `signin-door.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971). Cross-module test copies show only jointly: before COMPLETE also run the check over every L11 module together and fix any line naming your module (K3986).
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
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio signin-door tranche/T51 job/T51/signin-door`. Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J2

Your decision stands: the door reads the list's row when it holds the key (the list wins, K3930). Your J1 findings are each in their own module's words check. You merge after admission and answer-envelope.

## B3 · START

START · SIGNIN-DOOR #3 · tranche T51 · product believeinoakland/bio · fix round 10, Wave A batch 1: `subscriptionsignin` declared here (K5046 (c), K5052 (4)); `signinRefusal` (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #289 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/signin-door tranche/T51 && git branch -m job/T51/signin-door stale/signin-door-local && git checkout -b job/T51/signin-door origin/job/T51/signin-door`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module signin-door`; record `build/jobs/T51/signin-door.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Entry.** `subscriptionsignin` is declared by control-plane's `owner-ops.mjs` (classes admin, member; mutating; stamps viewer, by; needs none; weight credential; accepts step, code, attempt; requires step) but answered by your `subscriptionSignin` (`signin-door/index.mjs:141`). Export `DECLARED_OPS` from `signin-door` with that row (same fields; description keyed through `localize`, R-WORDS, same English) and REPORT in your COMPLETE the exact row (text and line) that must leave `control-plane/owner-ops.mjs` in the same merge (K5052 (4)); the file is control-plane's, so BOB makes that one-row deletion at the merge and you do not edit it. **Coupled merge:** plane's test names every module that exports `DECLARED_OPS` in its `OWNERS` (`plane/declarations.mjs`), so plane's batch 1 job adds `signin-door` there: BOB merges your job and plane's together.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Fixtures to publish** in `bio-plane/test/m/signin-door/fixtures.mjs` (new file), one named export each, made by your real code at test time, never stored; each with a test of yours that calls it and checks the real answer. Their users re-point in their own jobs (a later Wave A batch or Wave B); users now = findings in the live list:
- `signinRefusal` (users now: screens-settings 2): real signin-door `subscriptionsignin` step `code` answering the agent-runner refusal: NO_SIGNIN_WAITING, SIGNIN_UNAVAILABLE, SIGNIN_ADDRESS_UNEXPECTED, AGENT_WORKER_UNBOUND, SIGNIN_REFUSED with `detail`, `trace`.

**Fixture lines NOT done in this job** (4; their providers merge in your batch or after): FIX-E 4; FIX-E providers: ai-accounts, answer-envelope. They stay in your list and arrive as a CHANGE.

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-WORDS (every sentence a member reads is a stand-in keyed through `localize`; its row goes to UX-DESIGN in the one HANDOFF); R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . signin-door --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/signin-door.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-sonnet-5-5, medium effort.

## B4 · ANSWER · re J3

Added: signin-door now uses test-support and op-declarations (K5066, modules.json on tranche/T51 at its tip). Merge the tranche branch into yours and keep the R6 registration test as written; the architecture check should then read 0. Note: run checks/fixtures.mjs with the absolute product path (a relative root reads nothing, K5066).
