# intent (T51)

**Status** · session_01BBT6yik8ZYE33ZBXj5u7xP · depth 2 · WORKING · handled B2

## J1 · COMPLETE

**T51-222 · intent (words, K3949).** Done. Commit `81924580ba` on `job/T51/intent`; no other module touched.

**Entries applied**
- The 8 findings of the conversion (`build/plan/words-pass/intent.md`):
  - `index.mjs` CONDITION_UNREADABLE detail (the two shape sentences): `localize("intent.index.condition_shape_unreadable", …, {shape, amount_shape})`. The literal braces are passed as vars, so the rendered text is unchanged.
  - `grammar.test.mjs` rows for INTENT_NO_SUCH_PROGRESSION and INTENT_NO_REASON: `word("refusal.…")` in place of the copied sentences.
  - `pursuits.test.mjs` REMEDY: `word("intent.ask_active_administrator")`. The copied "is an administrator's act" fragment is removed; the exact detail is already held by the `notAnAdmin` deepEqual.
- The 3 plain findings (K3957):
  - `index.mjs:62` GROUP_ASPIRATION_ACT: `localize("intent.index.declaring_revising_retiring_group_aspiration", …)`. The test imports the export rather than copying it.
  - `index.mjs` undetermined grade `why`: `word("intent.why.instance_grade_undetermined")`, which has a row.
  - `index.mjs` money "never taken as zero": `word("intent.record_holds_money")`, which has a row.
- The 1 test copy (K3962): `pursuits.test.mjs` line 24, handled above.
- Found on the re-run of the words check, after the first pass (5 more `intent` findings, all member-facing sentences):
  - `checks.mjs` NOT_YOURS translation: `word("refusal.NOT_YOURS")`, which has a row with the same text.
  - `index.mjs` aspiration scope refusal (lines 298 and 929, the same sentence): one constant, `ASPIRATION_SCOPE_NAMED = localize("intent.index.aspiration_scope_named", …)`.
  - `index.mjs` MACHINE_CANNOT_SET_OBJECTIVE: `localize("intent.index.objective_measure_member_act", …)`.
  - `index.mjs` project departs only from a group aspiration: `localize("intent.index.project_departs_group_only", …)`.
- New ids are `intent.index.*`, as the job names them. None has a row yet, so each answers its `en` until BOB's regeneration.

**Deferred:** nothing.

**Found in other modules (not changed):** the whole-product words check still reports 2,300 failures, in other modules (case-grammar, case-import, case-disclosures, wizard-scripts and others). That is for BOB to route to their owners (P9).

**Checks and tests**
- `node --test bio-plane/test/m/intent/*.test.mjs`: `tests 82, pass 82, fail 0`.
- `checks/run.mjs /home/user/bio`: format `0 failures`; architecture `0 failures`; channels `0 failures`; coverage across the product `25 failures`, none in intent; words `2300 failures`, none in intent.
- `checks/format.mjs`: `0 failures`. `checks/architecture.mjs intent`: `0 failures`. `checks/coverage.mjs intent`: `33 of 33 live requirement ids named by a test; 0 failures`.
- `checks/ownership.mjs /home/user/bio intent tranche/T51 job/T51/intent`: `5 files changed by intent; 0 failures`.
- `setup-words/build.mjs --check`: stale-rows note only, expected: `rows.mjs` lacks the new `intent.index.*` ids. No refusal naming intent.

Size (session_01Xq24r8vyf2nW2HRS4PznTs): test runs 2, module lines 2235

## J2 · COMPLETE · re B2

CHANGE B2 (K4259) done. Commit on `job/T51/intent`; only intent's files touched.

**Entry applied (1).** The reason a condition was set is stored with it and `progress` answers it.
- `doc.mjs`: `conditionLines` writes `set_reason` beside `set_by` and `set_at`; `conditionOf` reads it back (null when absent). Front-matter-safe: a quote, backslash or any white-space run (a line break too) becomes one space (`oneLine`); the Session Log keeps the words whole. Not cut, however long.
- `index.mjs`: `setCondition` passes the trimmed reason in; `progress` answers `set_reason` beside `set_by` and `set_at`. A removal drops the whole block, so a removed condition answers none and leaves nothing behind. A condition set before this change answers `set_reason: null`.
- Tests (`reasons.test.mjs`, written first and seen failing): a set, a replacement and a removal (and a re-set after it); a reason holding quotes, backslash, line breaks, `#` and 5,000 characters; the control, a condition planted without a reason, answers `set_reason: null` with its `set_by` and `set_at`. `invariants.test.mjs`: the stored key list gains `set_reason` (R19's check that no progress figure is stored is unchanged).

**Requirement lines for BOB (not edited, they are not mine).**
- R2: "Success ... carrying the condition (or its removal), its reason, author and time" already says this; add: "the reason is stored with the condition as `set_reason`, on one line (a quote, backslash or line break becomes a space; the Session Log keeps the words whole)."
- R3/R4: `progress` answers `set_reason` beside `set_by` and `set_at`; `null` for a condition set before it was stored; no `set_reason` key when there is no condition.
- Or as a NEW R, next free id R36, in R30's neighbourhood: "R36 (K4259) The reason a condition was set is stored with it (`set_reason`) and `progress` answers it beside `set_by` and `set_at`; null for a condition set before this."
No new member-facing sentence, so no new word id.

**Tests and checks**
- `node --test bio-plane/test/m/intent/*.test.mjs`: tests 94, pass 94, fail 0.
- Users of intent (investigation, actions, monitoring, queue-producers, store-door): all pass except store-door R17 (1 fail, same on the untouched tip). scheduler 7, affordances 33, answer-envelope 16, control-plane 13, plane 39 fail, each the same count with my change stashed, so not caused by it (they look environmental or other modules'; for BOB).
- `checks/run.mjs`: format 0; architecture 0; channels 0; coverage 6 failures in other modules (agent-harness R17; agent-runner R37 R38 R40; installer-steps R26 R31; journey-check R19; screens-inquiry R110 R119; screens-intake R53), intent `35 of 35 ... 0 failures`; words 1 failure, `testcopy op-grades t37.test.mjs:32`, none in intent.
- `checks/ownership.mjs /home/user/bio intent tranche/T51 job/T51/intent`: 0 failures.

**Deferred:** nothing. **Found in other modules:** only the failures above (not changed).

Size (session_01XcNgiqYHy6Zizx3gVoR4W1): test runs 5, module lines 2265
