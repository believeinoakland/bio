# BOB to actions (T51)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 9 (L9), actions: **T51-89** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/actions.md` (read whole).
BOB's notes for this job:
1. Your words findings are what `node checks/words.mjs /home/user/bio actions` lists today (18 at this START), with `build/plan/words-pass/actions.md` (read whole: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)"; an item there the check no longer lists is already done). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `actions.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971). Cross-module test copies show only jointly: before COMPLETE also run `node checks/words.mjs /home/user/bio conformance consequences action-grammar actions action-holds escalation filing-templates filings action-clocks action-plans action-records plan-work action-replies` and fix any line naming your module (K3986).
2. Your entry may carry more than words: read the entry line whole and apply every part of it; the requirement lines it names ("Text: fold") are already on the tranche branch.
3. Your entry's red, `t33.test.mjs`:105 (R9 R25): `holderAt` answers `why` as `{key, vars}` (lines R11, R24); pass it on by key; make it green.
4. R108 (Text: fold) is on the tranche branch (K4035). Its drawing gap (the passage field's label) was answered by the design (B335, U368): nothing to report.
5. You merge in `modules.json` order (L9: conformance, consequences, action-grammar, action-records, actions, action-holds, action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio actions tranche/T51 job/T51/actions`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

Two changes (K4041); merge `tranche/T51` into your branch first (actions' requirements changed):
1. R108, worded (field added, meaning unchanged; FILINGS #22 J1): the minutes' passage is recorded as content by the author's act, `content.mint` (its R12, R13: mint or find, `mintedBy` the author) at that extent, and `minutes.passage` keeps the row's `content_id` beside `captureSha` and `extent`, so filings R64 reads its text through `content.passageText(content_id)` (its R46). Test it: the stored passage carries the id; a second reply at the same extent finds the same row.
2. CONFORMANCE #24 J1: `test/m/actions/t34.test.mjs`:101 copies your own `localize("actions.index.an_action_recorded_for_a_2", …)` sentence (`index.mjs`:1240) as a literal: compare with `localize`/`word` by equality (K3810).

## B3 · CHANGE

K4049 (ACTION-GRAMMAR #14 J3): action-grammar added C-117.59 `MINUTES_NOT_PUBLIC_COMMENT` and C-117.60 `BAD_MINUTES`, each `where` `src/actions/index.mjs actionCorrespond > is-minutes`. Draw `DEC-49 REGION is-minutes` around the minutes act in `actionCorrespond` (as your other regions are drawn) and raise both refusals through the catalogue rows (code, check, translation), not as bare `{ok, reason, detail}`. Merge `tranche/T51` once action-grammar merges (I will tell you), then COMPLETE again.

## B4 · CHANGE

action-grammar has merged (K4052): C-117.59 MINUTES_NOT_PUBLIC_COMMENT and C-117.60 BAD_MINUTES are on `tranche/T51`. Merge it into your branch, finish B3 (draw `DEC-49 REGION is-minutes` and raise both through the rows), confirm action-grammar's R28 census arm passes with your branch, then COMPLETE.

## B5 · START

START · ACTIONS #23 · tranche T51 · product believeinoakland/bio · fix round 10, Wave A batch 2: publish 2 fixtures, re-point 6 own lines (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #289 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/actions tranche/T51 && git branch -m job/T51/actions stale/actions-local && git checkout -b job/T51/actions origin/job/T51/actions`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module actions`; record `build/jobs/T51/actions.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Fixtures to publish** in `bio-plane/test/m/actions/fixtures.mjs` (new file), one named export each, made by your real code at test time, never stored; each with a test of yours that calls it and checks the real answer. Their users re-point in their own jobs (a later Wave A batch or Wave B); users now = findings in the live list:
- `actionRead` (users now: escalation 4, action-plans 1, plan-work 1): real `actions.actionRead({id,viewer,now})`: NO_SUCH_BUNDLE (unknown or unseen), NOT_AN_ACTION, and the action read.
- `actionsForRefusal` (users now: action-replies 3, escalation 1): real `actions.actionsFor(...)` / `actionRead(...)` refusal for an unknown or unseen target.

**Your own fixture lines, done in this job** (6; FIX-E providers are merged on your branch point, FIX-L providers run their contracts in their own jobs). FIX-E: replace the hand-built answer by the provider's fixture from its `fixtures.mjs` (`bio-plane/test/m/<provider>/`, or the provider's own tests directory); FIX-L: add `// fixtures-contract: <provider> <id>` on the value's line or up to eight above:
- retrieval/actionRegistrar (1 mechanical): fixture.mjs:111
- conformance/determinationRead (5 judgment): t12.test.mjs:16; t18.test.mjs:16; t45.test.mjs:40; t50.test.mjs:27; write.test.mjs:153

**Fixture lines NOT done in this job** (1; their providers merge in your batch or after): FIX-E 1; FIX-E providers: consequences. They stay in your list and arrive as a CHANGE.

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . actions --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/actions.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-sonnet-5-5, medium effort.

## B6 · START

START · ACTIONS #24 · tranche T51 · product believeinoakland/bio · fix round 10, the final pass's causes (plan build/plan/fix-round-10-T51.md §3 item 70; K5148)

Depth 2 (BOB #295 is depth 1). An act on the code, your branch or the tranche that a permission or safety check refuses: cite K5120 (Bob's standing approval) and take it as one plain command, never a compound one; never relay it to Bob.

FIRST, before `mail start`: `git fetch origin job/T51/actions tranche/T51`; if a local `job/T51/actions` exists and differs from origin, never reset it: `git checkout --detach && git branch -m job/T51/actions stale/actions-local && git checkout -b job/T51/actions origin/job/T51/actions`. If `job/T51/actions` is behind `tranche/T51`, merge `origin/tranche/T51` into it (never a rebase). Then `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module actions`; record `build/jobs/T51/actions.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses (other than K5120's) is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test <files>` from the repository root; run without `--test-force-exit` when the run exits by itself, else compare its reported count with the sum of its files run alone, and a shortfall is a defect of your tests (K5124). `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment. Run every check with the ABSOLUTE product root, never `.` (K5078). A test never hand-builds another module's answer: it takes the provider's published fixture, or, where the provider is later in the order, a `fixtures-contract` marker whose value the provider's `fixtures-run` checks against its real code (K4990, K4993, K4995). A through-the-door test that imports control-plane's `r8-kit.mjs` belongs to control-plane: never add one to your tests; write your test at your module's interface (with providers' published fixtures) and REPORT the door case for BOB to place (K5138).

**Each cause below** is diagnosed with K4426's four fields in the named section of a diagnosis file under `build/plan/walk-T51-final/diagnosis/`: read that section whole first, then re-read every cited line yourself before changing anything (the line numbers are of an older tranche commit). The requirement named is already amended on the tranche (K5148) and marked `*(not yet met: T51)*`: build to its text; name the met ids in your COMPLETE (BOB strikes the marks). For each cause: (1) the failing-first test at your interface, seen red on today's code, then green; (2) the fix where the cause is; (3) why the tests missed it, written in your record. A new sentence people read is written at its use as `localize(id, en, vars)` (K3930, K3943); the design stream reviews it through the unreviewed list. If a cause needs a change outside your `paths`, or you find the cause is not where the diagnosis says, REPORT it to BOB and carry on with the rest.

1. **`actioncreate` is accepted for a member outside the project** (`diag2-04.md` §10; actions R47, promotion R53): `actionCreate` (`actions/index.mjs:2077-2083`) promotes with no `actorMemberId`, so promotion's participant check never runs. Pass `actorIdentity`, `actorViewer` and `actorMemberId` as `intent/index.mjs:224` does; read each other promote call in your module (`index.mjs:1607`, `:1943`, `:2206`, `:2323`, `:2406` at the diagnosis's commit) and give each the same, or record why it needs none. Test: `create-participant.test.mjs`, a stranger's `actionCreate` into a project refused `PROMOTE_NOT_A_PARTICIPANT`, nothing written; controls: a participant and an invited member succeed; the machine path is unchanged.

**Done:** module tests green; `checks/fixtures.mjs <absolute root> actions --list` with no new failing line (list any marker you add, file:line and why); format, architecture, coverage, words, ownership 0. Record a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE.
