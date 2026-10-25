# BOB to agent-runner (T51)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 6, agent-runner: **T51-64 · agent-runner** (read the entry line whole). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/agent-runner.md` (read whole); no id of yours is marked not yet met.
BOB's notes for this job:
1. Red #26 (rule 5.4, N1243): `worker.test.mjs` R12 drops the `RUNNER` binding assertion (agent-worker R109 removed the binding) or asserts its absence.
2. N1242 (K3805, K3808, K3817): the image's address names Docker Hub by digest in `container.json` and the member's configuration: `docker.io/civicsmith/agent-runner@sha256:954ac088c8e758d7ec18c4a9ef4e78bf3fc2cac327ac9536a4162893010014ec` (release 0.85.0, amd64, Docker Hub's public listing; the release cut records its own digest later through `container-images.yml`). Read bundler R25, R35 (the marker) for where the configuration is written from; the GitHub copy stays unnamed. This clears bundler `bundler.test.mjs` R24 and R35 (real fleet) and `fleetbundles`' agent-runner arm (K3832): run those two suites and say whether they are green.
3. Its keys wait (N1214, left out). No assistant work (K3717).
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`; generated artifacts excluded). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (yours: agent-runner R12, `worker.test.mjs`; and the bundler R24/R35 real-fleet and `fleetbundles` agent-runner arm reds clear with you, K3832). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio agent-runner tranche/T51 job/T51/agent-runner`. Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

Received (K3885). Correct not to work around it. BOB has asked Bob to approve the edit in your session; do not apply it until he does, and BOB will not apply it either. Set your state NEEDS BOB and end your turn. When Bob's approval arrives in your session, make the edit, rebuild, run bundler R24/R35 and fleetbundles and the checks, and post COMPLETE.

## B3 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 6 (R6), agent-runner: **T51-149** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/agent-runner.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/agent-runner.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `agent-runner.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971).
2. Your entry carries more than words: read the entry line whole and apply every part of it; the requirement lines it names ("Text: fold") are already on the tranche branch.
3. If your entry names red tests of yours (K3958: civil-time now answers an undetermined `why` as `{key, vars}`), they are accepted only until you merge: make them green against the keyed reasons, passing `{key, vars}` on where you relay a reason.
4. Wording only (plan rule 9): no assistant behaviour changes. The image cannot import the plane's word table, so it carries the rows it reads as data of its own (your R41). Do not rebuild or push any container image: the image is rebuilt at the cut (BOB's act). Your own `dist` bundle is regenerated by BOB at R6's close; report it stale.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio agent-runner tranche/T51 job/T51/agent-runner`. Your Size line counts only your module's own code (K2513).

## B4 · START

Depth 2. Wave 2. Your entries are below (BOB records them in `build/plan/current.md` as **FR-14 · agent-runner** when the round opens): the fix round of T51 (K4165, K4168; P10), planned whole in `build/plan/fix-round-T51.md`. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/agent-runner.md` (read whole). Each `NEW … R<n>` below is a requirement line to write first, in the file's style (an outcome, an id first on its line, marked *(not yet met: T51)*): the number given is the next free one at planning; if another line has taken it, take the next. Test names carry the id.
Why this job: K4176 (2): the minimal fix that makes the release deployable as a whole, in the module the requirement says exports the class.
Merge order: module index 97, layer 6. After `bundler` (wave 1): your merge turns its real-fleet arm green.
Wave 1 is merged on `tranche/T51` before you start (test-support's helper, op-declarations' and op-grades' assembly, interface-shell's guard, bundler's check): merge the tranche first and read their new requirement lines for the shapes you use.

Your entries (apply every one; nothing found here waits for the next tranche, K3915):
1. **K4176 (2)** · The release is not deployable as a whole: agent-worker 0.86.0 binds `REMOTE` to `agent-runner`'s class `RemoteSession` (agent-worker/wrangler.jsonc:98-100, R35, R109), which this Worker does not export (`src/worker.mjs` exports `AgentRunner` and `ContainerProxy` only); Cloudflare refuses agent-worker (10061). Export `RemoteSession`, a Durable Object class with no container, as the least that exists: its `fetch` answers `GET /remote/version` as unavailable and every other request refused `REMOTE_UNAVAILABLE` (the code R36 already names), so agent-worker's R110 gives `ASSISTANT_REMOTE_NOT_READY` exactly as it would with no remote. Declare it in `wrangler.jsonc` (`durable_objects.bindings` stays AgentRunner's; add the class to a new `migrations` entry `new_sqlite_classes`, tag `v2`, beside `AgentRunner`'s `v1`). The assistant is held (K3717): no conversation, no Claude Code session, no sign-in relay is built here, and nothing is disabled; R36 (the conversation) stays conditional on R38's proof and its text is not met by this stub. Do not touch `agent-worker`. Bundler's check (wave 1) turns green when your bundle exports the class. Requirement: NEW `agent-runner` R42: the Worker exports `RemoteSession`, which answers `GET /remote/version` as unavailable and refuses every other request `REMOTE_UNAVAILABLE` until R36 is built; its migration is declared. Test: The Worker's exports include `RemoteSession` (from the built bundle, which `bundler`'s coherence check reads); a stub request to its `fetch` for `/remote/version` answers unavailable; any other path is refused `REMOTE_UNAVAILABLE`; `AgentRunner`'s own tests unchanged (control).

Reds you inherit: None inherited.
Reading (mechanics §6 step 2, K3271): read whole your requirements (both parts), your entries here, your layer's contract in `build/layers.md`, your own code, the used services your entries touch and the tests that name a requirement your entries change; run your other tests without reading them. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Reading-set measure (`python3 build/plan/reading-sets.py` takes no module argument and prints every module; its figure for yours is 440 KB, an upper bound that counts every used module's whole public part and all tests): your firm set (requirements, code, this START) is about 125 KB and, with the public parts of the services your entries touch, about 152 KB against the 600 KB budget.
Words (K3810, K3930): a sentence a member reads is read by key through `word` or written once with `localize(id, en)`; a test asserts the key or reads the text from the word table, never copies it. Every new id needs an explicit test naming it (K874); every refusal a control.
Tests: one for each entry, written first and seen failing, at the module's interface through the real path (the module's ops map called as the door calls it, with `url` and `body`, over a real fixture of its neighbours; a screen's through interface-shell's harness), with the control that shows the fix is the cause. A test never hand-lists another module's ops, rows or words (K3268).
Before any test run (K4113): every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio agent-runner tranche/T51 job/T51/agent-runner`. Your Size line counts only your module's own code (K2513). Never edit a generated artifact (manifest §14); report one you make stale. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9); nothing found here waits for the next tranche (K3915).

## B5 · CHANGE

Requirement lines (K4210, for every wave-2 job): write your NEW and amended requirement lines yourself in build/requirements/<your module>.md, each marked *(not yet met: T51)* until your tests name it; the ownership check's listing of that one file is accepted at your merge. If you have already put them in your record instead, either is fine: say which in your COMPLETE.

## B6 · CHANGE

Requirement lines (K4210, for every wave-2 job): write your NEW and amended requirement lines yourself in build/requirements/<your module>.md, each marked *(not yet met: T51)* until your tests name it; the ownership check's listing of that one file is accepted at your merge. If you have already put them in your record instead, either is fine: say which in your COMPLETE.

## B7 · START

START · AGENT-RUNNER #16 · tranche T51 · product believeinoakland/bio · fix round 10, Wave A batch 4: publish 1 fixture, 1 marker line (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #290 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/agent-runner tranche/T51 && git branch -m job/T51/agent-runner stale/agent-runner-local && git checkout -b job/T51/agent-runner origin/job/T51/agent-runner`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module agent-runner`; record `build/jobs/T51/agent-runner.md` (append a new section). Model claude-haiku-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Fixtures to publish** in `agent-runner/test/fixtures.mjs` (new file), one named export each, made by your real code at test time, never stored; each with a test of yours that calls it and checks the real answer. Their users re-point in their own jobs (a later Wave A batch or Wave B); users now = findings in the live list:
- `runnerRefusal` (users now: agent-worker 1): one real runner refusal per code of RUNNER_REQUIREMENT_CODES (signin.mjs, runner.mjs), body {ok:false, reason, code, detail}.

**Markers owed (K5044 (2), K5060; the audit read each line and found it no module's answer):** write on the line or up to eight lines above:
- `// fixtures-own: harness <why>` (your own harness, or a world helper named like an op): remote-log.test.mjs:16

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . agent-runner --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/agent-runner.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-haiku-5-5, medium effort.
