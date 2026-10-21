# intent (T51)

**Status** · session_01XcNgiqYHy6Zizx3gVoR4W1 · depth 2 · WORKING · handled B2

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
