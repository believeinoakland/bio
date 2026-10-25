# BOB to ai-runs (T51)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 6 (R6), ai-runs: **T51-210** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/ai-runs.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/ai-runs.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `ai-runs.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971).
2. If your entry names red tests of yours (K3958: civil-time now answers an undetermined `why` as `{key, vars}`), they are accepted only until you merge: make them green against the keyed reasons, passing `{key, vars}` on where you relay a reason.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio ai-runs tranche/T51 job/T51/ai-runs`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

CHANGE (K4015): the words check now judges a sentence written as string literals joined only by `+` as one sentence at the chain's first line (civicos-process `main` @ d424c32; `git -C /home/user/civicos-process pull`). Before your COMPLETE (or now, if you are already complete): pull it, run `node checks/words.mjs /home/user/bio <your module>`, and fix every finding the words rule covers (a member-read sentence by `localize` or `word`, a copy of a row by `word`, a test copy by equality); list any you judge no person reads in your record for the design's unkeyed list. Merge tranche/T51 first. Then COMPLETE (again).

## B3 · START

START · AI-RUNS #27 · tranche T51 · fix round 7, cause G83 (K4746, K4747, K4752) · depth 2 (BOB #266 at depth 1)

First: `git fetch origin tranche/T51 job/T51/ai-runs`, work on `job/T51/ai-runs`, never a rebase or force. Model: claude-haiku-5-5 (a mechanical re-point with one unit test), medium effort.

**Cause G83.** A team's record object ("room") is created by Cloudflare wherever its first `get()` runs (biosmoke8's landed in Frankfurt, its team and files in western North America; PERFORMANCE P19). Bob ruled (K4746, K4747) that a team's room is created near the team: every site obtains the room through `runtime-limits`' one helper, which passes Cloudflare's `locationHint` from the binding `STORE_LOCATION` and names the room by its generation (`STORE_GENERATION`; absent for every existing team, so names are unchanged).

**What you change:** `bio-plane/src/ai-runs/index.mjs:2155` (inside the `scratch` object, obtaining `bio`) becomes `runtime-limits.storeStub(env, "bio")`, and the id comparison at `:2098-2106` uses `storeId(env, name)` in place of `ns.idFromName(name)`. No other change; no new requirement id (your behaviour is unchanged when no binding is set).

**Tests (K4426):** (1) failing-first: a unit test with a recording `env.STORE` (records `idFromName` and `get` arguments) driving the code path at `:2155`: with `STORE_LOCATION: "wnam"` the `get` carries `{locationHint: "wnam"}`; with `STORE_GENERATION: "2"` the name is `bio~g2` and the comparison at `:2098-2106` still recognises the object; with neither, the calls are exactly today's. Red before your change. (2) Why missed: this site runs inside the `scratch` object, which plane's T2 recording `env` does not reach (review G1); this test is the gap's fix. (3)-(4) **N** beyond it (plane's T2 and BOB's P read cover the rest).
**Rules (plan §0, in short):** R-FOUR, R-SEAM, R-ONE, R-NOTMET, R-OLD, R-CLOCK, R-PROXY as `build/plan/fix-round-7-T51.md` §0 states them: read §0 whole. Read `build/plan/fix-round-7-T51-added.md` sections "Adopted revisions" (it wins) and "G83" whole. Read your reading set whole (your requirements both parts, your own code in your `paths`, the tests naming the ids your entries change; `runtime-limits`' Provides R27, R28): if you would have to read a document only in part, stop at once with BLOCKED cause `reading` (K3678). Declare every census op you own (K4208). Before any test run, every directory with a tracked `package-lock.json` has its `node_modules` (K4113: `for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`). A command handing `node --test` a computed file list checks it is non-empty first (K4741). Workers: haiku low for mechanical work, sonnet medium for reading and diagnosis, never above your own model; any act a safety or permission check refuses is never worked around, split, rephrased or retried (K4696): record it and go on. Never edit a generated artifact; name in your record any you make stale (BOB regenerates at the round end). Never contact biosmoke8 or any live deployment. Propose any requirement wording change in your record; BOB writes it. Run your module's tests, then `node build/plan/impact.mjs tranche/T51 HEAD` and the users it names that your change touches, then format, architecture, coverage, words and ownership before COMPLETE.

**The provider.** `runtime-limits` (RUNTIME-LIMITS #6, started with you) builds `bio-plane/src/store-place.mjs` (R27, R28: `STORE_HINTS`, `storeHint`, `storeGeneration`, `storeId`, `storeStub`). Write against R27/R28 as written; BOB posts a CHANGE when it is merged: then merge `tranche/T51` into your branch and run your tests. Until then your tests that need it may be red; never COMPLETE red on it.

**Added by the second review (K4754):** the comparison at `:2098-2106` loops over the logical names (`bio`, `scratch`) and compares with `storeId(env, name)`, answering the logical name (`"bio"` in the room `bio~g2`); test that.

## B4 · CHANGE

CHANGE (K4757): runtime-limits is merged into tranche/T51 (`bio-plane/src/store-place.mjs`, R27, R28). Merge `tranche/T51` into your branch now, run your tests and impact set, and COMPLETE when green.

## B5 · START

START · AI-RUNS #28 · tranche T51 · product believeinoakland/bio · fix round 10, Wave A batch 4: publish 4 fixtures, re-point 9 own lines (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #290 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/ai-runs tranche/T51 && git branch -m job/T51/ai-runs stale/ai-runs-local && git checkout -b job/T51/ai-runs origin/job/T51/ai-runs`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module ai-runs`; record `build/jobs/T51/ai-runs.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Fixtures to publish** in `bio-plane/test/m/ai-runs/fixtures.mjs` (new file), one named export each, made by your real code at test time, never stored; each with a test of yours that calls it and checks the real answer. Their users re-point in their own jobs (a later Wave A batch or Wave B); users now = findings in the live list:
- `airunDispatchRefusal` (users now: screens-inquiry 1): real ai-runs dispatch refusals: MEMBER_RUN_MODE_NOT_ADMITTED, AI_RUN_NOT_PRINCIPAL (ai-runs); with ACCOUNT_MEMBER_NOT_ACTIVE from ai-accounts and AI_RUN_CREDENTIAL_MALFORMED from credentials produced by their real calls and published under this name.
- `airunOpenRefusal` (users now: screens-inquiry 1): real `airunopen` refusals: AI_RUN_MODE_NOT_DEPLOYED, AI_NO_ACCOUNT (ai-runs) and AI_LIMIT_REACHED with `{whose, period, use, when}` (ai-use).
- `airunRefusal` (users now: agent-steps 1): the refusal of a real ai-runs read of a run the caller may not see (ai-runs code, check, translation) through op=airun / airunlog.
- `tickStateTooLarge` (users now: agent-worker 1): a real ai-runs tick whose state exceeds AI_RUN_STATE_MAX_BYTES -> AI_RUN_STATE_TOO_LARGE (C-22.18) with bytes and limit.

**Your own fixture lines, done in this job** (9; FIX-E providers are merged on your branch point, FIX-L providers run their contracts in their own jobs). FIX-E: replace the hand-built answer by the provider's fixture from its `fixtures.mjs` (`bio-plane/test/m/<provider>/`, or the provider's own tests directory); FIX-L: add `// fixtures-contract: <provider> <id>` on the value's line or up to eight above:
- FIX-L action-plans/plan-open-check: plan.test.mjs:93
- CODE (PLAN_NOT_AFTER_RESPONSE is in no product file. Fix: use PLAN_NOT_OPEN (action-plans); the literal is also action-plans/plan-open-check): reexam.test.mjs:111
- FIX-L agent-worker/dispatch-refusal: scheduler.test.mjs:238; t46.test.mjs:352
- steps/stepsWorld (4 judgment): t46.test.mjs:108; world.mjs:272,283,284
- inquiry/migratedSurfacing (1 mechanical): world.mjs:83

A `fixtures-run` you write shows `orphan-run` in your list until its user module's marker is merged, and a marker you place shows `contract-no-run` until its provider's run is merged: these are the only lines you may leave at done, each named in your record with the module it waits for.

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . ai-runs --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/ai-runs.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-sonnet-5-5, medium effort.
