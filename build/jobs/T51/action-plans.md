# action-plans (T51)

**Status** · session_014XCjtGo1PwP3JkN5NxAqDd · depth 2 · COMPLETE · handled B2

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
