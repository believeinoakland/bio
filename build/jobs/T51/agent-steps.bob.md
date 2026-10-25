# BOB to agent-steps (T51)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 6, agent-steps: **T51-45 · agent-steps** (read the entry line whole). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/agent-steps.md` (read whole); a new module by copy (K624): every id R1-R49 is marked `*(not yet met: T51)*` and is yours to meet (K3850).
BOB's notes for this job:
1. Read `build/extraction/agent-steps.md` whole: it is your cut (K3850). Copy, never move: build `agent-steps/src/` from agent-worker's code as the map says (`driveHarness`, `settleAtDispatch`, `performStep`, `performPlanStep`, `reexaminationReads`, `runSubsessions`, their shared readers, `reads.mjs`, `holdings.mjs`, three constants of `ops.mjs`); the `SegmentDriver` Durable Object stays agent-worker's. agent-worker's own job (T51-65, after you) deletes its copy and delegates. Do not edit agent-worker's files.
2. The only way back into the shell is the six-function host (`askPlane`, `refusal` and the four fixed refusals); no shared state. Tests move by copy under `agent-steps/test/`, re-pointed to a test host; a suite that asserts the shell's wire stays agent-worker's (say which in your COMPLETE).
3. Your `modules.json` row is empty until your COMPLETE: list in your COMPLETE the `paths`, `tests` and `uses` the map gives (`agent-steps/src/`, `agent-steps/test/`; uses record-grammar, test-support, query-language, retrieval, run-rules, run-productions, capture-requests, ai-runs, agent-harness, agent-model); BOB fills the row before the ownership check (K1043). Imports only from modules earlier in the order (P4).
4. No assistant behaviour changes (K3717): this split is for P6 only. The agent-worker bundle will take your files as imported inputs; report the stale bundle, never rebuild it (BOB regenerates at L6's close).
5. You merge first in L6 (K624); agent-worker's job waits for you.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`; generated artifacts excluded). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (none of yours). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio agent-steps tranche/T51 job/T51/agent-steps`. Your Size line counts only your module's own code (K2513).

## B2 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 6 (R6), agent-steps: **T51-208** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/agent-steps.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/agent-steps.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `agent-steps.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971).
2. If your entry names red tests of yours (K3958: civil-time now answers an undetermined `why` as `{key, vars}`), they are accepted only until you merge: make them green against the keyed reasons, passing `{key, vars}` on where you relay a reason.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio agent-steps tranche/T51 job/T51/agent-steps`. Your Size line counts only your module's own code (K2513).

## B3 · ANSWER · re J2

Not Bob's: layers and test placement are BOB's (P17). Ruling (C, K4009): agent-steps declares, in its own code, the plane ops its plans call, each with whether it writes (an export of yours; reuse an existing table if one already says this). plan.test.mjs reads WRITE_OPS and READ_OPS from that declaration, never from op-declarations, so the import goes and the architecture check passes; the handlist finding is met because the list is your module's own declaration (K3268). The cross-check that each declared op exists in OPS with the same mutating flag is op-declarations' (layer 11, T51-107, added to its START). Set WORKING, apply, re-run your tests and checks, then COMPLETE.

## B4 · CHANGE

CHANGE (K4015): the words check now judges a sentence written as string literals joined only by `+` as one sentence at the chain's first line (civicos-process `main` @ d424c32; `git -C /home/user/civicos-process pull`). Before your COMPLETE (or now, if you are already complete): pull it, run `node checks/words.mjs /home/user/bio <your module>`, and fix every finding the words rule covers (a member-read sentence by `localize` or `word`, a copy of a row by `word`, a test copy by equality); list any you judge no person reads in your record for the design's unkeyed list. Merge tranche/T51 first. Then COMPLETE (again).

## B5 · START

START · AGENT-STEPS #3 · tranche T51 · product believeinoakland/bio · fix round 10, Wave B job, batch 6: re-point 12 own lines, 1 marker line (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #292 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/agent-steps tranche/T51 && git branch -m job/T51/agent-steps stale/agent-steps-local && git checkout -b job/T51/agent-steps origin/job/T51/agent-steps`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module agent-steps`; record `build/jobs/T51/agent-steps.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Your own fixture lines, done in this job** (12; FIX-E providers are merged on your branch point, FIX-L providers run their contracts in their own jobs). FIX-E: replace the hand-built answer by the provider's fixture from its `fixtures.mjs` (`bio-plane/test/m/<provider>/`, or the provider's own tests directory); FIX-L: add `// fixtures-contract: <provider> <id>` on the value's line or up to eight above:
- ai-runs/airunRefusal (1 judgment): interface.test.mjs:36
- CODE (CHAIN_REFUSED / VERSION_CHAIN_REFUSED is in no product file. Fix: use VERSION_CHAIN_NO_SUCH_VERSION (provenance versionChain); the literal is FIX-E provenance/versionChainNoSuchVersion): interface.test.mjs:149
- CODE (CLOSE_REFUSED is in no product file. Fix: use an ai-runs refusal code (AI_RUN_NOT_PRINCIPAL); the literal is FIX-E ai-runs/airunRefusal): interface.test.mjs:207
- FIX-L control-plane/ask-wire: interface.test.mjs:224; t49r90.test.mjs:100; world.mjs:34,59,69,71
- CODE (AI_LOG_REFUSED is in no product file. Fix: use the code ai-runs' tick really puts in refused[]; read `bio-plane/src/ai-runs/index.mjs` tick before fixing): interface.test.mjs:265,267
- provenance/versionChainNoSuchVersion (1 judgment): t49r90.test.mjs:94

**Markers owed (K5044 (2), K5060; the audit read each line and found it no module's answer):** write on the line or up to eight lines above:
- `// fixtures-own: input <why>` (a literal handed to your own export, a route map handed to your own dispatch, an input the module reads opaquely): readers.test.mjs:130

A `fixtures-run` you write shows `orphan-run` in your list until its user module's marker is merged, and a marker you place shows `contract-no-run` until its provider's run is merged: these are the only lines you may leave at done, each named in your record with the module it waits for.

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . agent-steps --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/agent-steps.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-sonnet-5-5, medium effort.
