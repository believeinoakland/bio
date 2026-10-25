# BOB to action-plans (T51)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 9 (L9), action-plans: **T51-239** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/action-plans.md` (read whole).
BOB's notes for this job:
1. Your words findings are what `node checks/words.mjs /home/user/bio action-plans` lists today (17 at this START), with `build/plan/words-pass/action-plans.md` (read whole: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)"; an item there the check no longer lists is already done). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `action-plans.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971). Cross-module test copies show only jointly: before COMPLETE also run `node checks/words.mjs /home/user/bio conformance consequences action-grammar actions action-holds escalation filing-templates filings action-clocks action-plans action-records plan-work action-replies` and fix any line naming your module (K3986).
2. Your entry may carry more than words: read the entry line whole and apply every part of it; the requirement lines it names ("Text: fold") are already on the tranche branch.
3. Your red, `t46.test.mjs`:90 (R47): its control picks a code words.json now holds a row for ("A plan's matter must be…"); choose a code with no `refusal.<CODE>` row, read from the rows, never hand-listed. Test-only; make it green.
4. You merge in `modules.json` order (L9: conformance, consequences, action-grammar, action-records, actions, action-holds, action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio action-plans tranche/T51 job/T51/action-plans`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

On your J1 (K4042): (1) SUBJECT_MALFORMED showing the row's text stands (the list wins, K3930). (2) PHASE_MALFORMED: where a row says the same sentence (here differing only in spelling), the row wins (K3984): read `refusal.PHASE_MALFORMED` by `word` and retire your own `action-plans.checks.a_phase_has_an_id` id; the test compares with `word`. R47 needs no edit: its text has no 'keeps its own' clause; the test title's control clause may be dropped as you rewrote it. Then COMPLETE again.

## B3 · START

Depth 2. Wave 2. Your entries are below (BOB records them in `build/plan/current.md` as **FR-58 · action-plans**): the fix round of T51 (K4206; P7, P10), planned whole in `build/plan/fix-round-T51.md`. Model: claude-haiku-5-5 (one judged declaration; one model up if it blocks on tests).
Your requirements: `build/requirements/action-plans.md` (read whole).
Why this job: the declaration pass (`build/plan/fix-round-T51-pass.md` §3 step 5; records `build/plan/pass-T51/RECORD*.md`) could not declare `optionadopt` mechanically: one arm with two forms (a proposal id, or an offer with its plan); the body is merged over the proposal's fields. A module where the declaration needs a judgment gets its own job (P7). Screens send these ops; the guard (`interface-shell` R104) checks each request against its owner's declaration.
Merge order: module index 134, layer 9; independent of the other wave-2 jobs; before the screen that sends the op.

Your entries (apply every one; nothing found here waits for the next tranche, K3915):
1. **K4206** · Declare `optionadopt` in your `DECLARED_OPS` (create it beside your ops map, `export const DECLARED_OPS = Object.freeze({...})` on its own line, if you have none) in the shape `op-declarations` R80 and `op-grades` R49 give (read both lines whole): `classes`, `machineClasses`, `mutating`, `weight` and `description` copied from the op's existing rows (a sentence description as `localize("action-plans.declared.<op>", <its sentence>)`; no hand description: its registry label key). For the fields, decide what the declaration can honestly state: `accepts` the fields the arm reads (for an open body, the fields its service reads, as named parameters); `requires` the fields it cannot run without. Where the arm refuses an absent field without naming it, the better fix is in your own arm: the refusal names the field (P8, a flaw in your module), unless your requirements say the answer is deliberately uniform (then `requires` lists only what a refusal names, and your record says why). Never weaken a refusal; never change a meaning your requirements state. Requirement: NEW R (next free id) in your record for BOB. Test: `declared-ops.test.mjs` calling test-support's `declaredOpHolds` (`bio-plane/test/declared-ops.mjs`) for each op; any refusal you changed gets its own test and control. If `test-support` is not in your `uses`, tell BOB in your COMPLETE (BOB adds it).
Reds you inherit: None inherited.
Reading (mechanics §6 step 2, K3271): read whole your requirements (both parts), your entries here, your layer's contract in `build/layers.md`, your own code, the used services your entries touch and the tests that name a requirement your entries change; run your other tests without reading them. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Reading-set measure: your requirements, this entry, your ops map and the named arms, R80, R49 and the helper: well under the 600 KB budget.
Words (K3810, K3930): a sentence a member reads is read by key through `word` or written once with `localize(id, en)`; a test asserts the key or reads the text from the word table, never copies it. Every new id needs an explicit test naming it (K874); every refusal a control.
Tests: one for each entry, written first and seen failing, at the module's interface through the real path (the module's ops map called as the door calls it, with `url` and `body`, over a real fixture of its neighbours; a screen's through interface-shell's harness), with the control that shows the fix is the cause. A test never hand-lists another module's ops, rows or words (K3268).
Before any test run (K4113): every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio action-plans tranche/T51 job/T51/action-plans`. Your Size line counts only your module's own code (K2513). Never edit a generated artifact (manifest §14); report one you make stale. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9); nothing found here waits for the next tranche (K3915).

## B4 · CHANGE

Requirement lines (K4210, for every wave-2 job): write your NEW and amended requirement lines yourself in build/requirements/<your module>.md, each marked *(not yet met: T51)* until your tests name it; the ownership check's listing of that one file is accepted at your merge. If you have already put them in your record instead, either is fine: say which in your COMPLETE.

## B5 · START

START · ACTION-PLANS #17 · tranche T51 · product believeinoakland/bio · fix round 10, Wave A batch 4: publish 1 fixture, run 1 contract, re-point 3 own lines, 1 marker line (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #290 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/action-plans tranche/T51 && git branch -m job/T51/action-plans stale/action-plans-local && git checkout -b job/T51/action-plans origin/job/T51/action-plans`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module action-plans`; record `build/jobs/T51/action-plans.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Fixtures to publish** in `bio-plane/test/m/action-plans/fixtures.mjs` (new file), one named export each, made by your real code at test time, never stored; each with a test of yours that calls it and checks the real answer. Their users re-point in their own jobs (a later Wave A batch or Wave B); users now = findings in the live list:
- `planRead` (users now: action-producers 2): real `actionPlans.planRead({id})` (NO_SUCH_PLAN, ok) and `checkpointsDue`, `plansToLookAgain`.
**Contracts to run** (FIX-L: your module is later in the order than the users, who cannot import you). State each value as data in a test of yours and run it against your real code; the users' hand-built values must equal it, and where the real answer differs the real one wins and the user changes. One `// fixtures-run: <user> <id>` per user module named:
- `plan-open-check` (users now: ai-runs 1): the open-check fn registered with ai-runs.registerOpenCheck("action-plans", "plan", fn) returning {ok:false, code:"PLAN_NOT_OPEN", check, translation, detail}. Lines: `// fixtures-run: ai-runs plan-open-check`.

**Your own fixture lines, done in this job** (3; FIX-E providers are merged on your branch point, FIX-L providers run their contracts in their own jobs). FIX-E: replace the hand-built answer by the provider's fixture from its `fixtures.mjs` (`bio-plane/test/m/<provider>/`, or the provider's own tests directory); FIX-L: add `// fixtures-contract: <provider> <id>` on the value's line or up to eight above:
- escalation/escalationRead (1 judgment): fixture.mjs:131
- retrieval/actionRegistrar (1 mechanical): fixture.mjs:169
- actions/actionRead (1 judgment): fixture.mjs:180

**Markers owed (K5044 (2), K5060; the audit read each line and found it no module's answer):** write on the line or up to eight lines above:
- `// fixtures-generic: <the made-up word the line carries>`: words.test.mjs:34

A `fixtures-run` you write shows `orphan-run` in your list until its user module's marker is merged, and a marker you place shows `contract-no-run` until its provider's run is merged: these are the only lines you may leave at done, each named in your record with the module it waits for.

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . action-plans --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/action-plans.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-sonnet-5-5, medium effort.

## B6 · START

START · ACTION-PLANS #18 · tranche T51 · product believeinoakland/bio · fix round 10, follow-up 61, a cause the final pass found (plan build/plan/fix-round-10-T51.md §3; K5131)

Depth 2 (BOB #294 is depth 1). An act on the code, your branch or the tranche that a permission or safety check refuses: cite K5120 (Bob's standing approval) and take it as one plain command, never a compound one; never relay it to Bob.

FIRST, before `mail start`: `git fetch origin job/T51/action-plans tranche/T51`; if a local `job/T51/action-plans` exists and differs from origin, never reset it: `git checkout --detach && git branch -m job/T51/action-plans stale/action-plans-local && git checkout -b job/T51/action-plans origin/job/T51/action-plans`. If `job/T51/action-plans` is behind `tranche/T51`, merge `origin/tranche/T51` into it (never a rebase). Then `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module action-plans`; record `build/jobs/T51/action-plans.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses (other than K5120's) is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test <files>` from the repository root; run without `--test-force-exit` when the run exits by itself, else compare its reported count with the sum of its files run alone (K5124). `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment. Run every check with the ABSOLUTE product root, never `.` (K5078). A test never hand-builds another module's answer: it takes the provider's published fixture (K4990, K4993). Each cause carries K4426's four fields in your COMPLETE: root cause with evidence, why the tests missed it (that gap fixed), a test of the walker's exact case through its real entry seen failing then passing, and any platform check.

**The cause (WALK-FINAL-09 row R102, D6; K5131).** A question concluded in the plan's project (its stance row there, `basis-versions` R18; its own state stays open) is offered "Plan what to do" (`screens-inquiry` state g), but `#support` (`bio-plane/src/action-plans/index.mjs:238-239`) answers every inquiry subject `hypothetical` with "a suspected matter: a question still open, nothing decided yet", which is false for it. Your Terms are amended (read them whole): such a matter stays a suspected matter (`hypothetical`: it is not a determination) and its `why` says it is concluded in this project, not yet a determination (a new sentence at its use by `localize`, K3930, reviewed by UX-DESIGN). Read the stance through `basis-versions`' published answer (`concludeAct`, its `fixtures.mjs`), never a hand-built one. Why missed: `open.test.mjs:61` uses an open question only. Test through the real acts: conclude in the project, `planOpen`, `planRead`: the matter's `why` is the concluded sentence; an open question keeps the still-open one; seen red first.

**Done:** the marked requirement met (name the ids; BOB strikes the marks); `node /home/user/civicos-process/checks/fixtures.mjs <absolute root> action-plans --list` 0 failing; module tests green; format, architecture, coverage, words, ownership 0. Record a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE.

## B7 · CHANGE

J5: `basis-versions` is now in action-plans' `uses` on `tranche/T51` (K5135). Merge `origin/tranche/T51` into your branch; your lazy-dependency reading is adopted (a host with no basis-versions keeps the old answer for an open question; a concluded stance never reads as still open).

## B8 · CHANGE

J5: `basis-versions` is now in action-plans' `uses` on `tranche/T51` (K5135). Merge `origin/tranche/T51` into your branch; your lazy-dependency reading is adopted (a host with no basis-versions keeps the old answer for an open question; a concluded stance never reads as still open).
