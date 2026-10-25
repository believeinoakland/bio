# BOB to duties (T51)

**Read** · handled J8

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 5, duties: **T51-37 · duties** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/duties.md` (read whole); no id of yours is marked not yet met.
BOB's notes for this job:
1. N1244: `checks.mjs`:31 `duty.reason.deadline_not_held` reads words.json's "team" sentence by key, so `t48-reasons.test.mjs` R33 is green; if the pass already made it so, confirm and change nothing else.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (yours: red #29, `t48-reasons.test.mjs` R33, which the K3811 pass is reported to have cleared: confirm it green). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio duties tranche/T51 job/T51/duties`. Your Size line counts only your module's own code (K2513).

## B2 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 5 (R5), duties: **T51-194** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/duties.md` (read whole).
BOB's notes for this job:
1. Your words findings are in `build/plan/words-pass/duties.md` (read whole), in up to three sections: the conversion's left findings, "Plain findings (K3957)" and "Test copies of code sentences (K3962)". Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar, an identifier) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944). The ids you assign are `duties.<file stem>.<slug>`, fixed once. A table key or any string code compares is an identifier, never a `localize` sentence (K3971).
2. If your entry names red tests of yours (K3958: civil-time now answers an undetermined `why` as `{key, vars}`), they are accepted only until you merge: make them green against the keyed reasons, passing `{key, vars}` on where you relay a reason.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. setup-words R13 binds every sentence a member reads, whatever the check counts (under five words, punctuated, a refusal's `detail`, or held in a test's regular expression or substring check): convert those too, in this job (K3964, K3965, K3974). A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize` by equality; `localize` answers its `en` while `rows.mjs` is stale. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; BOB regenerates them at the layer close. A word id needs no test of its own (K874 binds R ids; K3965).
Tests never copy a sentence people read; every new requirement id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9). Merge `tranche/T51` into your branch, never rebase or reset (K1991).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Your context window is the `max_tokens` of `context_usage` in `get_session` (your own session id): read it, never assume a size; "half your window" (mechanics §6 (1)) is half of that number (K3987).
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (pull it first; format and architecture 0 failures; the words check shows no finding in your module), `node bio-plane/src/setup-words/build.mjs --check` (read-only; a stale-rows note is expected, a refusal naming your module is not) and `node checks/ownership.mjs /home/user/bio duties tranche/T51 job/T51/duties`. Your Size line counts only your module's own code (K2513).

## B3 · CHANGE

K3997, two effects of R5 merges on duties, done in this job (P10): (1) lines' holderAt now answers {holder: null, undetermined: true, why: {key, vars}, lines} (lines R11, R24): index.mjs ~1451-1453 builds a message from h.undetermined through said(), which loses the reason; read h.why by key (pass it on, or lines' exported reasonText where a sentence is built). (2) local-facts R18 requires effective_from on a member-drafted rule (DEC-341): response.test.mjs:346's draft over the real local-facts adds it. Merge tranche/T51 after lines and local-facts merge (I will tell you), or test against their branches now; re-run tests and checks, then COMPLETE again.

## B4 · CHANGE

Lines and events are merged into tranche/T51 (K3998); local-facts is not yet. Merge tranche/T51 now for lines' holderAt shape; local-facts' effective_from follows when it merges (I will tell you).

## B5 · CHANGE

local-facts is merged into tranche/T51 (K3999): merge it now for effective_from (K3997 (2)), then COMPLETE again.

## B6 · ANSWER · re J4

K4000: lines and local-facts are merged, and setup-words' rows.mjs is regenerated on tranche/T51 (it holds lines.why.no_line_covers). Merge tranche/T51, re-run duties' tests and checks, post COMPLETE.

## B7 · START

START · DUTIES #10 · tranche T51 · product believeinoakland/bio · fix round 10, Wave A batch 2: publish 4 fixtures, re-point 1 own line (plan build/plan/fix-round-10-T51.md; waves build/plan/fix-round-10-waves.md)

Depth 2 (BOB #289 is depth 1).

FIRST, if `mail start` cannot push (your branch copy is behind origin): reset and force nothing; `git fetch origin job/T51/duties tranche/T51 && git branch -m job/T51/duties stale/duties-local && git checkout -b job/T51/duties origin/job/T51/duties`, then re-run `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module duties`; record `build/jobs/T51/duties.md` (append a new section). Model claude-sonnet-5-5, medium effort; workers haiku low for mechanical work, sonnet medium for reading, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment.

**Fixture rule (K4990, K4993, K4995, K5044).** A test never hand-builds another module's answer: it takes the provider's published fixture (`fixtures.mjs` in the provider's tests, made by the provider's real code when the test runs, never stored). Where the provider is later in `build/modules.json`, the user marks its value `// fixtures-contract: <provider> <id>` (on its line or up to eight above) and the provider's test carries `// fixtures-run: <user> <id>` and runs it against the real code. A code made up on purpose carries `// fixtures-generic: <CODE>`; a code no provider gives is replaced by the real one (K5044 (5)); a real path giving none is a product cause for BOB (K4426). Parts in `build/plan/fixtures-T51/`.

**Fixtures to publish** in `bio-plane/test/m/duties/fixtures.mjs` (new file), one named export each, made by your real code at test time, never stored; each with a test of yours that calls it and checks the real answer. Their users re-point in their own jobs (a later Wave A batch or Wave B); users now = findings in the live list:
- `occurrences` (users now: following 1): real `duties.occurrences({dutyId,viewer})` (NO_SUCH_DUTY and occurrences).
- `occurrencesOf` (users now: inquiry 1): duties.occurrencesOf({dutyId, asOf}) over a seeded duty with occurrences (met / undetermined); NO_SUCH_DUTY otherwise.
- `recordTransitionsAnswers` (users now: scheduler 7): real `duties.recordTransitions({asOf})`: an empty pass, and an unfinished pass `{done:false,cursor:"DUT-..."}` then a finished one.
- `transitionsRefusal` (users now: plan-work 2): real duties transitions read for an unknown duty (NO_SUCH_DUTY).

**Your own fixture lines, done in this job** (1; FIX-E providers are merged on your branch point, FIX-L providers run their contracts in their own jobs). FIX-E: replace the hand-built answer by the provider's fixture from its `fixtures.mjs` (`bio-plane/test/m/<provider>/`, or the provider's own tests directory); FIX-L: add `// fixtures-contract: <provider> <id>` on the value's line or up to eight above:
- standards/bindsAt (1 judgment): policies.test.mjs:207

Rules of fix-round-9 §0 that bind: R-SEAM / R-ONE; R-LAYER; R-PROXY.

List every `fixtures-own` and `fixtures-generic` marker you add, file:line and why, in your COMPLETE; BOB reads each at the merge (K5060).

**Done:** your lines named above in `node /home/user/civicos-process/checks/fixtures.mjs . duties --list` (from the repository root) at zero (waiting, `stay` and Wave B lines excepted, each named in your record); module tests, words, fixtures and format checks green by failure count; `node build/plan/impact.mjs origin/tranche/T51 HEAD` and the tests of the users it names run. Record in `build/jobs/T51/duties.md`: causes done, lines done and left, a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Model: claude-sonnet-5-5, medium effort.

## B8 · START

START · DUTIES #11 · tranche T51 · product believeinoakland/bio · fix round 10, follow-up 38, a published fixture (plan build/plan/fix-round-10-T51.md §3; K5108)

Depth 2 (BOB #293 is depth 1).

FIRST, before `mail start`: `git fetch origin job/T51/duties tranche/T51`; if a local `job/T51/duties` exists and differs from origin, never reset it: `git checkout --detach && git branch -m job/T51/duties stale/duties-local && git checkout -b job/T51/duties origin/job/T51/duties`. If `job/T51/duties` is behind `tranche/T51`, merge `origin/tranche/T51` into it (never a rebase). Then `mail start`. A refused step: post BLOCKED naming it.
Mail with `--module duties`; record `build/jobs/T51/duties.md` (append a new section). Model claude-haiku-5-5; workers haiku low, never above your own model (K3518); an act a safety or permission check refuses is NEVER worked around, split or retried: post BLOCKED naming it (K4696). `node_modules` first (K4113). Tests: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>` from the repository root. `RUNNING until` at most 30 minutes ahead. You write only your `paths`, `tests` and your record; never contact a live deployment. Run every check with the ABSOLUTE product root (`/home/user/bio` or wherever your clone is), never `.` (K5078). A fixture is made by your real code when the test runs, never stored (K4990, K4993).

**Follow-up 38 (test files only; QUEUE #36, its record's last section).** queue's `noticed.test.mjs:292` `notices:` table needs your real `dutiesOf(...)` → `{ok: true, duties: []}` and `occurrencesOf(...)` → `{ok: true, occurrences: []}` for a viewer holding no duty (and, if natural, one holding one). Publish them by your real code.

**Done:** the fixture exported from `bio-plane/test/m/duties/fixtures.mjs` with a test in your `fixtures.test.mjs` that calls it and checks the real answer; `checks/fixtures.mjs <absolute root> duties --list` 0; your module's tests green; format, architecture, coverage, words, ownership 0. Name each new export and its signature in your COMPLETE (its user re-points next). List every `fixtures-own`/`fixtures-generic` marker you add (K5060). Record with a `Size (<session id>): test runs <n>, module lines <n>` line; COMPLETE. Test files only: if the real answer shows a product defect, REPORT it to BOB and change no product code.
