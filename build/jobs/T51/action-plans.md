# action-plans (T51)

**Status** · session_01QNmwftmFAVAy2K1WHsTW8M · depth 2 · COMPLETE · handled B8

## Completion

**Entries applied.** T51-239 (words, K3949): the 15 findings of `checks/words.mjs` in `build/plan/words-pass/action-plans.md` (handlist, inline, testcopy), the 2 `plain` findings (K3957) and the 1 test copy of a code sentence (K3962); and `t46.test.mjs` R47 (K4036), red at START.

**What changed (module only).**
- `checks.mjs`: `SUBJECT_MALFORMED` reads `refusal.SUBJECT_MALFORMED` by key (the row exists in `words.json`, so the code's own sentence is retired; its wording is the row's, with "matter" per R36); `WORK_KIND_UNKNOWN` and `MACHINE_CANNOT_SET_WORK_KIND` read their rows by key (copies).
- `index.mjs`: the two no-zone sentences read `action-plans.time_zone_held` and `action-plans.time_zone_held_place` by key (copies); `MARK_LABEL` reads `action-plans.says.marked_plan_examination` by key (copy); the default detail of `refuseMalformed` reads `refusal.SUBJECT_MALFORMED`. New `localize` ids, each with its existing text: `action-plans.index.matter_named_twice`, `action-plans.index.matter_is_neither` (`{i}` filled), `action-plans.index.regulated_dates_list` (`{max}` filled), `action-plans.says.phase_leads_here_not_led` (plain finding: a member reads it in `says`).
- Tests: `duty-starts` compares `PHASE_MALFORMED` with `localize('action-plans.checks.a_phase_has_an_id', en)` instead of a copy; `invariants` compares `PLAN_PROVIDER_UNAVAILABLE` with `word(...)`, and its 21-op hand-list is replaced by a count and a callable check on the module's own `actionPlansOps` (no import of `op-declarations`, which is later in the order); `runs` compares the disclosure with `localize('action-plans.suggested_assistant_machine', …)`; `words` takes the disclosure's prefix from `DISCLOSURE(...)`, not a copy.
- `t46` R47 control: every one of the module's 64 refusal codes now has a `refusal.<CODE>` row in `words.json` (checked, 64 of 64), so no code is left to keep its own text. The control is rewritten to assert that, and that `SUBJECT_MALFORMED` reads its row. R47's clause "a row words.json does not hold keeps its own" has no instance now: BOB may retire it.

**Judgement calls for BOB (REPORT).**
1. `SUBJECT_MALFORMED` now shows the design row ("A plan's matter must be either an inquiry, or an outcome with its determination and the standard it is measured by."), not the code's former sentence. The code's text named `{kind: inquiry, inquiry}`, a developer shape a member should not read. Please confirm the row is the text you want.
2. `refusal.PHASE_MALFORMED` and `action-plans.checks.a_phase_has_an_id` hold the same sentence in two spellings (`judgment` in the row, `judgement` in the code's `en`). The module shows the id's row. The design stream should pick one spelling and retire the other.

**Found in other modules (not touched).** The joint words check (`conformance consequences action-grammar actions action-holds escalation filing-templates filings action-clocks action-plans action-records plan-work action-replies`) reports 198 failures, none naming action-plans; `checks/run.mjs` reports tree-wide coverage and words failures in other modules (for example `installer-steps` 36 of 36 ids named by no test). None is this job's.

**Deferred.** None in this module.

**Model.** START named claude-haiku-5-5 for this job; plan rule 3 puts a judgement-heavy words job on the default. I did the judgement calls myself and kept each conversion to what the check measures.

**Checks run** (from `civicos-process`, against `/home/user/bio`):
- `node tools/mail.mjs` start, done (B1): ok.
- `node --test bio-plane/test/m/action-plans/*.test.mjs`: 88 pass, 0 fail (the R47 test that was red at START now passes).
- `node checks/words.mjs /home/user/bio action-plans`: 0 failures (15,361 words).
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio action-plans`: 0 failures (after the `op-declarations` import was removed from `invariants.test.mjs`).
- `node checks/coverage.mjs /home/user/bio action-plans`: 51 of 51 live requirement ids named by a test.
- `node checks/ownership.mjs /home/user/bio action-plans tranche/T51 job/T51/action-plans`: 0 failures (after commit).
- `node bio-plane/src/setup-words/build.mjs --check`: rows.mjs is stale, as expected, and names the module's new ids. Rows not regenerated (BOB regenerates at the layer close). No refusal names action-plans.
- `node checks/run.mjs /home/user/bio`: the action-plans failure found in the run (architecture) is fixed; the rest is in other modules.

Size (session_014XCjtGo1PwP3JkN5NxAqDd): test runs 6, module lines 3330

## J1 · COMPLETE

action-plans (T51-239, words K3949, R47 control K4036) is complete on job/T51/action-plans at e867f14aef; 88 tests pass; words, format, architecture, coverage and ownership checks show 0 failures for action-plans. Two judgement calls need your decision, in the record's Completion section (build/jobs/T51/action-plans.md): (1) SUBJECT_MALFORMED now shows the words.json row's text; (2) refusal.PHASE_MALFORMED and action-plans.checks.a_phase_has_an_id differ in one spelling (judgment/judgement). R47's "unheld row keeps its own text" clause has no instance now (all 64 codes hold rows); you may retire it.

## Change B2 (K4042, K3984)

BOB's CHANGE applied. `refusal.PHASE_MALFORMED` is now read by `word` in `checks.mjs` (the row wins over the duplicate sentence), so the `localize` id `action-plans.checks.a_phase_has_an_id` is retired from this module. `duty-starts.test.mjs` compares with `word("refusal.PHASE_MALFORMED")`. The R47 test title drops its "row words.json does not hold keeps its own (control)" clause. SUBJECT_MALFORMED keeps the row's text, as BOB ruled.

Checks rerun: 88 of 88 action-plans tests pass; `checks/words.mjs` 0 failures for action-plans; `checks/architecture.mjs` and `checks/format.mjs` 0 failures; `checks/coverage.mjs` 51 of 51.

Test runs: 7 (6 before, 1 after the change). Size (session_014XCjtGo1PwP3JkN5NxAqDd): test runs 7, module lines 3330

## J2 · COMPLETE

Change B2 applied on job/T51/action-plans (commit after e867f14aef): PHASE_MALFORMED reads refusal.PHASE_MALFORMED by word; the localize id a_phase_has_an_id is retired; R47 title drops the control clause. 88 of 88 tests pass; words, architecture, format, coverage and ownership show 0 failures for action-plans. Record: build/jobs/T51/action-plans.md, section "Change B2".

## J3 · COMPLETE

Applied B3 (K4206) and B4 (requirement lines). Commit 59856e01e6 on job/T51/action-plans.

**K4206, `optionadopt` declared** in `DECLARED_OPS` (`bio-plane/src/action-plans/index.mjs`, beside `optionadd`): classes `admin`, `member`, `probe` and `mutating: true` (from `op-declarations`); weight `undetermined` (from `op-grades`); description `localize("action-plans.declared.optionadopt", …)` with `op-grades`' sentence. Fields: `accepts` `proposal`, `offer`, `plan` and the body fields R9 reads; `requires` `[["proposal", "offer"]]`.

**Judgement for BOB (no decision needed unless he disagrees):** the offer form also needs `plan`, which a requires list cannot state as conditional. `plan` is accepted, not required, so the declaration is true as stated but not complete for the offer form. The proposal form needs no `plan`.

**No refusal changed.** The absent-id refusal, `NO_SUCH_PLAN_PROPOSAL`, already names `proposal` in its detail, so the arm needed no change (P8).

**Test (R53, `declared-ops.test.mjs`).** Written first: red with "the declaration has no fields.accepts and fields.requires arrays". Green after the declaration. It uses a real member proposal from `optionPropose` as the base, so the requires-alone case is a valid call and not an absent-id refusal.

**Requirement.** New R53 in `build/requirements/action-plans.md`, no "not yet met" mark (its test names it). R52 unchanged.

**Words.** `action-plans.declared.optionadopt` has no row in `setup-words` yet, so `localize` uses the en sentence; rows regenerate at the layer close (BOB). No test names the id explicitly; the other declared ids have no such test either. Say if you want one added.

**Deferred.** None.

**Found in other modules.** None. The tree-wide words check reports 16 failures in other modules (e.g. `op-grades` `t47`, `t48`, `t49` testcopy). None names action-plans.

**Checks** (`checks/*` from `civicos-process`, against `/home/user/bio`):
- Module suite `bio-plane/test/m/action-plans/*.test.mjs`: 99 pass, 0 fail.
- `format.mjs`: 175 modules, 0 failures.
- `architecture.mjs action-plans`: 0 failures.
- `coverage.mjs action-plans`: 53 of 53 live requirement ids named by a test.
- `words.mjs action-plans`: 0 failures.
- `ownership.mjs … tranche/T51 job/T51/action-plans`: 1 failure, `build/requirements/action-plans.md` (outside the module's paths). B4 says that listing is accepted at merge.
- `run.mjs`: no finding names action-plans (16 words failures in other modules).

Size (session_019adkgzUkBj7R8ajuFvhTNL): test runs 4, module lines 3357

## Fix round 10, Wave A batch 4 (B5 START) · session_0129vmmwvkC9E9jVVexUhTsz

**Published** (`bio-plane/test/m/action-plans/fixtures.mjs`, new; tested in `fixtures.test.mjs`): `planRead`, made by the real module at test time: `planRead` (ok, unknown id, unseen), `checkpointsDue` (before and after a checkpoint), `plansToLookAgain` (before and on the look-again day).

**Contract run** (`fixtures.test.mjs`): `plan-open-check`, `// fixtures-run: ai-runs plan-open-check` (orphan-run until ai-runs' marker merges). **The real answer differs from the stated one:** the open check refuses a closed plan with `PLAN_CLOSED` (check `C-124.10`, `reason` and `plan` kept), not `PLAN_NOT_OPEN` (that code is `optionReact`'s, not the check's). The real one wins: ai-runs' hand-built value (`plan.test.mjs:95`, `PLAN_NOT_OPEN`, `C-999.1`) must change to it.

**Own lines re-pointed** (`fixture.mjs`): `escalationRead` (line 131) now answers through escalation's published fixture (`escalationRead()`, the real module); `actionRead` unseen (line 180) through actions' (`actionRead()`; the real answer is `NO_SUCH_ACTION`, replacing the invented `NO_SUCH_BUNDLE`); `retrieval` (line 169) is retrieval's real module from `actionRegistrar()`.

**Marker added:** `words.test.mjs:29` `// fixtures-generic: SOMEONE_ELSES`: the code is made up on purpose, as a control that a scan leaves other modules' refusals alone; no module gives it.

**Needs BOB:** `retrieval` is not in action-plans' `uses` in `build/modules.json`; `architecture.mjs action-plans` fails with one failure (`fixture.mjs` imports `test/m/retrieval/fixtures.mjs`). Add `retrieval` to my `uses`. Nothing else fails.

**Checks:** module suite 103 pass, 0 fail; `fixtures.mjs --list` for action-plans: 0 failures (the one accepted line is the generic marker); `words.mjs`: 0 failures; `format.mjs`: 0; `coverage.mjs`: 53 of 53; `ownership.mjs`: 0 failures; `impact.mjs`: 0 affected modules.

Size (session_0129vmmwvkC9E9jVVexUhTsz): test runs 6, module lines 3357

## J4 · COMPLETE

COMPLETE (B5). Published planRead fixture (planRead, checkpointsDue, plansToLookAgain) in test/m/action-plans/fixtures.mjs; ran contract plan-open-check (fixtures-run: ai-runs plan-open-check). REAL DIFFERS: the open check refuses a closed plan with PLAN_CLOSED (C-124.10), not PLAN_NOT_OPEN; ai-runs plan.test.mjs:95 must change to it. Own lines re-pointed: escalationRead (131), actionRead (180, real NO_SUCH_ACTION), retrieval (169). Marker: words.test.mjs:29 fixtures-generic: SOMEONE_ELSES (code made up on purpose as a scan control). NEEDS BOB: add 'retrieval' to action-plans' uses in modules.json (architecture.mjs fails with 1 failure until then; fixture.mjs imports test/m/retrieval/fixtures.mjs). Tests 103/0, fixtures 0 failures, words/format/coverage/ownership 0. Waiting: orphan-run on ai-runs' marker.

## J5 · QUESTION

B6 needs a uses edge. Reading the project's stance on a question (the row in the project's conclusions[]) means calling basis-versions: basisVersions.conclusionOf(project, inquiry, viewer) (R22), and the tests take concludeAct from its fixtures.mjs. action-plans' uses in build/modules.json does not list basis-versions (layer 6, earlier, so no cycle). Please add 'basis-versions' to action-plans' uses on tranche/T51. My reading: a lazy dep 'basisVersions' in actionPlansOf, like strength, so a host with none leaves #support's old answer for open questions and fails closed (hypothetical, concluded wording) never. Meanwhile I build and test on that reading; the architecture check will name the missing edge until you add it.

## B6 (K5131, WALK-FINAL-09 R102, D6): a question concluded in the plan's project

**Marked requirement met:** the Purpose paragraph's sentence (Terms: a concluded question is a suspected matter whose `why` says it is concluded in this project, not yet a determination). No numbered R id carries the mark; BOB strikes the *(not yet met: T51)* in the Purpose.

**Root cause, with evidence.** `#support` (`index.mjs`, the `s.kind === "inquiry"` arm) answered every inquiry subject `hypothetical` with the one sentence for an open question, whatever the plan's project had done with it. The project's stance on a question lives in the project's document (`basis-versions` R18, R22) and is read by `basisVersions.conclusionOf(project, inquiry, viewer)`; this module never asked. Red first: the new test showed `why` "a suspected matter: a question still open, nothing decided yet" on a plan over a question the project had concluded.

**Fix.** `#support` asks `basisVersions.conclusionOf(project, inquiry, viewer)`. A stance that is a conclusion keeps `support: hypothetical` (a conclusion is not a determination) and `why` is the new sentence `action-plans.why.suspected_matter_concluded`: "a suspected matter: a question concluded in this project, not yet a determination". Everything else is unchanged: an open question, a project that concluded nothing, another project's conclusion (the stance is the plan's project's alone) and a withdrawn or unrecognised stance (`conclusionOf` answers null) keep the still-open sentence. `basisVersions` is a lazy provider (`actionPlansOf` reaches `basisVersionsOf(host, base)` as it reaches strength). **The sentence is new text for UX-DESIGN to review (K3930); it has no `words.json` row yet, so `localize` answers its `en`.**

**Why the tests missed it.** `open.test.mjs:61` used an open question only, and no test world held a project that had concluded anything. Gap fixed: `concluded.test.mjs` builds the world over a real basis-versions world (`world({on})` in `fixture.mjs`) so the stance is made by the real act, `bv.conclude({target, project})`, then `planOpen` and `planRead` read it; controls for an open question in the same project, a project that concluded nothing, and another project's conclusion. Seen red (both tests), then green.

**Walker's case through its real entry:** `bv.conclude` in project P, then `planOpen({project: P, subjects: [{kind: "inquiry"}]})` and `planRead`: `subjects[0].why` is the concluded sentence; the same question in Q (which concluded nothing) reads the open sentence.

**Platform check:** none (no runtime or deployment surface).

**Fixture notes.** `fixture.mjs` gained `world({on})` (a basis-versions world's host, record, membership, promotion and clock) and builds real basis-versions on every other world (`basisVersionsOf` over stubs for the services its acts ask of inquiry, content and accepted-work, which no action-plans test reaches); on an `on` host, leg-earning cannot migrate (connections' tables already exist in another shape), so `projectsDrawingOn` reads the real `refs` rows that world's connections wrote. No `fixtures-own` or `fixtures-generic` marker added.

**Needs BOB.** `build/modules.json`: action-plans' `uses` lacks `basis-versions` (layer 6, earlier; no cycle). `architecture.mjs action-plans` reports exactly two failures, both that missing edge (`index.mjs` and `fixture.mjs` import `basis-versions`). Posted as J5.

**Checks** (`civicos-process/checks`, absolute root `/home/user/bio`): module suite 105 of 105 pass (after merging tranche/T51); users plan-work 52/52, following 128/128, action-producers 54/54, answer-envelope 52/52; `format` 0; `coverage` 53 of 53; `words` 0; `fixtures --list` 0 failures (1 accepted, the existing generic marker); `architecture` 2 failures awaiting the `uses` edge; `ownership` run at COMPLETE.

Size (session_01QNmwftmFAVAy2K1WHsTW8M): test runs 9, module lines 3366

## Change B7/B8 (K5135): the `uses` edge

Merged `tranche/T51` (basis-versions is in action-plans' `uses`). `concluded.test.mjs` no longer holds the two sentences (words `testcopy` flagged them): the still-open `why` is read from the module's own answer for a question nobody concluded, and the concluded one is asserted different from it. Checks (absolute root `/home/user/bio`): module suite 105 of 105; `format` 0; `architecture` 0; `coverage` 53 of 53; `words` 0; `fixtures --list` 0 failures; `ownership` 0. No `fixtures-own` or `fixtures-generic` marker added.

Size (session_01QNmwftmFAVAy2K1WHsTW8M): test runs 14, module lines 3364
