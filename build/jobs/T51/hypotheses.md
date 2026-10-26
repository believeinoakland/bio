# hypotheses (T51)

**Status** · session_0189S9L8ZybB8aa7uuRhyQpw · depth 2 · WORKING · handled B6

## J1 · COMPLETE

Applied BOB's note 1 (red #30, rule 5.4, N1244). `notes.test.mjs` R11 copied the court sentence; it now takes the expected text from `Membership.COURT_STATEMENT` (the word-table row `court.statement`, the sentence membership R108 names). Commit 93ac3f2156 on job/T51/hypotheses. No source change: the module already answers the "team" sentence, which is correct.

A decision recorded here for BOB, not made silently: I first read the word table through `setup-words` directly, but `architecture.mjs` then failed because hypotheses does not declare `setup-words` in `uses`. A `uses` edge is BOB's, so I took the expected value from `Membership.COURT_STATEMENT` instead, a module already in `uses`. Please confirm, or say if you want the edge added.

Deferred: none.
Found in another module: none. The 23 other modules with coverage failures in the full run (24 ids) are the T51 jobs still open; not reported as new.

Tests: `node --test bio-plane/test/m/hypotheses/*.test.mjs`: 51 pass, 0 fail (after the change; the notes file alone was 7/7 green before it).
Checks (process repo, product /home/user/bio): format 0 failures; architecture (this module) 0 failures, and the whole tree 0 failures; coverage (hypotheses) 23 of 23 live ids named, 0 failures; ownership (tranche/T51 to job/T51/hypotheses) 1 file, 0 failures; `checks/run.mjs`: format, architecture, ownership and channels 0 failures, coverage 24 failures, all in other modules.

Size (session_01MSX35oLuKxfsaPu7fR6wpD): test runs 3, module lines 1110

## J2 · COMPLETE

Applied B2 (T51-215, the words rule; BOB's note 1 and note 2). Commit dc4a82567a on job/T51/hypotheses, merged with tranche/T51 (f70c043c78, never rebased).

- Finding 1, `checks.mjs` PROPOSAL_NOT_OPEN: the sentence had no word-table row, so it now reads `localize('hypotheses.checks.proposal_not_open', en)`, a new fixed id (setup-words R14), the same form as the module's other unrowed sentences.
- Finding 2, `index.mjs` neighbours' VIEWER_MISSING reason: row `hypotheses.why.read_names_member` exists, so it reads `word(...)`.
- Not in the findings, found by the run: `connection-grammar` now requires an undetermined reason as `{key, vars}` (its reads.mjs `reasonFills`). `UNDATED_WHY` was a bare string, so R4's owner-conformance test and the R6 re-derive test failed (3 reds, also red before my edits). `UNDATED_WHY` is now `{ key: 'hypotheses.hunch_states_period', vars: {} }`; the one test that pinned the old string shape now asserts the keyed form (`owner.test.mjs`). This is a flaw in my module, fixed here (P8).
- Deferred: none.
- Found in another module: none. The whole-tree run's failures are other modules' (coverage 28, words 3366 across the tree); none names hypotheses.
- Stale branch: as B3 said, the earlier local job branch was renamed `stale-local-hypotheses`, kept local and never pushed; this branch was taken from origin.
- `setup-words/build.mjs --check`: the one stale-rows note is the new row `hypotheses.checks.proposal_not_open`, which BOB regenerates at the layer close; no refusal names hypotheses.

Tests: `node --test bio-plane/test/m/hypotheses/*.test.mjs`: 51 pass, 0 fail (after the merge).
Checks (product /home/user/bio): format 0 failures; architecture 0 failures (module, and whole tree); coverage (hypotheses) 23 of 23 live ids named, 0 failures; ownership (tranche/T51 to job/T51/hypotheses) 4 files, 0 failures; `checks/run.mjs`: format, architecture, ownership, channels 0 failures; words: no finding in hypotheses; coverage and words failures in the whole tree are other modules'.

Size (session_01EadYoLQpp5GhXS6UWqUpKn): test runs 9, module lines 1113

## J3 · COMPLETE

Applied B4 (K5175, fix round 10): the two fixture lines `t41.test.mjs:248` and `:293` (`PERSON_NO_PUBLIC_ROLE`) now take inquiry's real exported `personWarning` (`inquiry/index.mjs:269`), per the rows in `build/plan/verify-marks.md` (hypotheses, fixture lines). Commit 08bacf5426 on job/T51/hypotheses, after merging origin/tranche/T51 (9336a0304b, never rebased).

What changed (`bio-plane/test/m/hypotheses/t41.test.mjs`):
- :247-248 new `ROLELESS`, one person in no public role, the `personFacts` shape inquiry reads.
- :251-258 (R19, the warning at the act): the hand-built `WARN` object is replaced by `inquiryModule.personWarning` over `ROLELESS` for the note's words, so its code and persons are the real ones (`persons` is `[{entity_id, label}]`). The stand-in calls the same function. A negative control asserts the real function names the person.
- :296-302 (R20, withdrawal): the stand-in is the real `personWarning` with the person named; `CODE` is the code it answers. A control asserts the share carried that warning before withdrawal.
- :324 (R20): the no-warning-left check compares against `CODE`. The old literal `PERSON_NO_PUBLIC_ROLE` matched nothing the source holds, so the check was vacuous; it now checks the real code.

Failing first, then green: the red was the fixture check (`checks/fixtures.mjs /home/user/bio hypotheses`, two FAIL lines at :248 and :293, per the verify-marks row). No test went red: the test bodies were green before and after. After the change the fixture check shows 0 failures for hypotheses.

Met ids: none new. This round changed fixture lines only, no requirement. BOB has no marks to strike.
Fixtures-own / fixtures-generic markers added: none.
Deferred: none.

Found in another module (REPORT, file:line): nine lines of other modules' tests fail on a missing hypotheses fixture. Hypotheses publishes no `fixtures.mjs` for its op answers (`hypothesishold`, `hypothesisrevise`, `hypothesiswithdraw`), so the consumers hand-build them:
- `bio-plane/test/m/screens-inquiry/fr28-question-acts.test.mjs:34` [op-table hypothesisrevise, hypothesiswithdraw] and `:72` [same two]
- `bio-plane/test/m/screens-inquiry/fr28-question.test.mjs:83` [op-table hypothesishold]
- `bio-plane/test/m/screens-inquiry/question.test.mjs:399` [op-table hypothesishold]
- `bio-plane/test/m/screens-investigate/money.test.mjs:60` [op-table hypothesishold]
- `bio-plane/test/m/screens-investigate/timeline.test.mjs:79` [op-table hypothesishold]
- `bio-plane/test/m/control-plane/t50-door.test.mjs:175` [refusal, NOT_AN_INQUIRY], which names hypotheses among its providers
Whether hypotheses should publish those op fixtures is BOB's to place (the fixtures are the provider's, K4990); I did not add a file outside my paths. Module-level `fixtures.mjs` for `src/hypotheses` is not in this round's scope.

Checks, product root /home/user/bio:
- `checks/run.mjs`: format 0 failures; architecture 0 failures; coverage 10 failures, none in hypotheses; channels 0 failures; words 16 failures, none in hypotheses (inline, plain and marker lines belong to other modules); fixtures whole tree 1474 failures, none of them the hypotheses module's own test lines (the nine above name hypotheses only as a provider).
- `checks/fixtures.mjs /home/user/bio hypotheses --list`: 0 failures.
- `checks/ownership.mjs /home/user/bio hypotheses <merge-base of origin/tranche/T51> HEAD`: 1 file changed by hypotheses, 0 failures.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 0 of 178; affected test files 0 of 2981 (a test-only change).
- `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/hypotheses/t41.test.mjs`: 14 tests, 14 pass, 0 fail.
- `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/hypotheses/*.test.mjs`: 58 tests, 58 pass, 0 fail; it exited by itself without --test-force-exit.

Size (session_01PDGCqmr1TfpP4VKKTmG3KU): test runs 2, module lines 1132

## J4 · COMPLETE

Fix round 10 (B5, K5175; plan item 97): the hypotheses op answers are published as fixtures made by the module's real code (K4990, K4993). Commit 52298d7e49 on job/T51/hypotheses, pushed; the branch merges tranche/T51 (fast-forward, never rebased).

**What changed (file:line)**
- `bio-plane/test/m/hypotheses/fixtures.mjs` (new, 1 file under the tests path). Seven exports, each calling the real `hold`, `revise` or `withdraw` over a fresh `world()` when called, never stored:
  - `holdAnswer()` (`:14`): the ok answer `{ok, hypothesis_id, kind, label, at}`.
  - `holdRefusals()` (`:21`): NO_SUCH_BUNDLE, NOT_AN_INQUIRY, MACHINE_CANNOT_HYPOTHESISE, UNKNOWN_HYPOTHESIS_KIND, HYPOTHESIS_NO_STATEMENT, BAD_ABOUT.
  - `reviseAnswer()` (`:36`): the ok answer, the id kept.
  - `reviseRefusals()` (`:41`): NO_SUCH_HYPOTHESIS, HYPOTHESIS_NO_REASON, HYPOTHESIS_NO_STATEMENT, HYPOTHESIS_WITHDRAWN, MACHINE_CANNOT_HYPOTHESISE.
  - `withdrawAnswer()` (`:55`) and `withdrawAlreadyAnswer()` (`:59`): the ok answer and the `already` answer.
  - `withdrawRefusals()` (`:65`): NO_SUCH_HYPOTHESIS, HYPOTHESIS_NO_REASON, MACHINE_CANNOT_HYPOTHESISE.
- `bio-plane/test/m/hypotheses/fixtures.test.mjs` (new): 8 tests, R1 and R2 named in the titles. Each refusal is checked against its own code, its `HYPOTHESES_CHECKS` row (check number and translation), and `ok: false`. Each ok answer is checked for its exact keys and values. One test checks that two calls give two answers, so nothing is stored.
- No source file changed, so the module's own lines stay 1,132.

**Failing first.** Honest note: I wrote the fixture file before its test, so there was no red run of the new test. The test is new, and it has no prior state to fail against. Its checks are the refusal codes and catalogue rows, which I read from the real code's probe before writing any assertion.

**Tests.** `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/hypotheses/fixtures.test.mjs`: 8 pass, 0 fail. The full module suite `bio-plane/test/m/hypotheses/*.test.mjs`: 66 pass, 0 fail (58 before, plus the 8). It exited by itself, without `--test-force-exit`.

**Checks** (product root /home/user/bio):
- `checks/fixtures.mjs /home/user/bio hypotheses --list`: 0 failures.
- `checks/ownership.mjs /home/user/bio hypotheses <merge-base of origin/tranche/T51> HEAD`: 3 files changed by hypotheses (my two files and this record), 0 failures.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: 1 of 178 modules affected, 1 of 2,986 test files, which is this module's own. No user module needs a run.
- `checks/run.mjs /home/user/bio`: no finding in any hypotheses file. Words: 19,247 and 16 failures, none in hypotheses. I added no sentence to the source, so the count is not risen by me. Format, architecture and coverage show no hypotheses line.

**Met ids.** None new. This round changes fixtures and tests only; BOB has no marks to strike.
**Markers added.** None (`fixtures-own` and `fixtures-generic`).
**Deferred.** None.

**Found in other modules (REPORT).** The user lines that hand-build a hypothesis answer are still FAIL, but now each names `hypotheses` as its provider. Each user job clears its line by adding `fixtures-contract: hypotheses <name>` and importing the named fixture in place of the hand-built object. The mapping:
- `screens-inquiry/fr28-question-acts.test.mjs:34` and `:72` (hypothesisrevise, hypothesiswithdraw): `reviseAnswer`, `withdrawAnswer`, and the `reviseRefusals` or `withdrawRefusals` entries it draws.
- `screens-inquiry/fr28-question.test.mjs:83`, `screens-inquiry/question.test.mjs:399`, `screens-investigate/money.test.mjs:60`, `screens-investigate/timeline.test.mjs:79` (hypothesishold): `holdAnswer`, and `holdRefusals` where a test draws a refusal.
- `control-plane/t50-door.test.mjs:175` (refusal NOT_AN_INQUIRY): this refusal comes from `inquiry`, not from these fixtures. It is inquiry's to publish, so it stays open for BOB to place.
I did not add any `fixtures-run` line: each would be an orphan run until a user marks it, and the check would fail on this module's own lines.

**Size (session_011WtEw93w6Hath6F3qEfKYj): test runs 4, module lines 1132**

## J5 · COMPLETE

Applied START B6 (fix round 10, K5216): the `op=hypotheses` list answer, published in `bio-plane/test/m/hypotheses/fixtures.mjs` beside `holdRefusals`, `reviseAnswer` and `withdrawAnswer`. No source change. No `fixtures-own` or `fixtures-generic` marker added.

- `fixtures.mjs:84` `listWorld()`: the inquiry INQ with one hypothesis Ann holds live and one she holds and withdraws (`withdraw`, reason "mistaken").
- `fixtures.mjs:95` `listAnswer()`: `hypothesesOf({inquiry: INQ, viewer: ANN})` over `listWorld()`, made on each call, never stored: `{ok, inquiry, label, hypotheses: [live, withdrawn], system_proposals}`.
- `fixtures.mjs:100` `emptyListAnswer()`: the empty list for an inquiry that holds none, the system's proposals' heading beside it.

A reading for BOB to confirm. The START says "a project's or question's hunches". The op takes an inquiry (`hypothesesOps`' `inquiry` query), and hypotheses has no project list, so the list fixture is for a question. A project-level list would be a new op, BOB's call.

Tests (`fixtures.test.mjs`): R3 `listAnswer`, its shape and labelling (line 69); R3 `listAnswer` equals `op=hypotheses` over the same `listWorld()` through `hypothesesOps` (line 79); R3 `emptyListAnswer` (line 85); the made-on-each-call test now also covers `listAnswer`. Break once: with the withdrawal removed from `listWorld`, `R3 listAnswer` goes red (10 pass, 1 fail); restored, 11 of 11 green. I wrote the tests with the fixture, not before it, so the red step is the break test, not a test-first run.

Met ids: R3 (the list answer). Coverage: 24 of 24 live ids named by a test.

Suite counts: `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/hypotheses/*.test.mjs`: 69 pass, 0 fail, 0 cancelled; the run exited by itself (no force-exit, so K5124's sum check does not apply). The fixtures file alone: 11 of 11.

Checks (process repo, product /home/user/bio): format 0 failures; architecture (this module) 0 failures; coverage (hypotheses) 24 of 24, 0 failures; `checks/fixtures.mjs /home/user/bio hypotheses --list`: 0 answers, 0 failures; ownership: 0 failures; impact (`build/plan/impact.mjs origin/tranche/T51 HEAD`, the ref is `origin/` because `tranche/T51` is not local in this checkout): 1 of 178 modules, hypotheses itself. `checks/run.mjs /home/user/bio`: 370 FAIL lines, none naming hypotheses; they sit in other modules (fixtures 349: stub 92, answer 257; words 16: store-assembly 15, ratification 1). The words count cannot rise: this change adds no sentence. Reported to BOB in a REPORT.

Deferred: none.

Size (session_0189S9L8ZybB8aa7uuRhyQpw): test runs 6, module lines 1132
