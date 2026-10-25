# action-records (T51)

**Status** · session_01NsKSfvCegNhmvxjABmWB8Z · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Cross-module findings from the L9 words check (`node checks/words.mjs /home/user/bio conformance consequences action-grammar actions action-holds escalation filing-templates filings action-clocks action-plans action-records plan-work action-replies`): 200 failures across 13 modules, all in other modules' own files and tests (inline sentences in action-clocks, action-grammar, action-plans; handlists in action-grammar, action-holds, action-plans, actions, filing-templates, filings; test copies in several). None names action-records. Not mine to change; each belongs to its module's job.

Two things for BOB:
1. Wording. The proposal labels (`action-records.says.*`, `action-records.machine_credential_proposed*`, `action-records.member_proposed_*`) now read from the list, which says "labeled" where the code said "labelled". The list wins (K3949); the change is visible text.
2. Stale rows. `setup-words build.mjs --check` reports rows.mjs stale for the new ids (`action-records.index.*`); the check's note is the expected one. The ids: receipt_* (5), correspond_machine_fence, entry_bad_date_time, ledger_bad_date, entry_capture_and_account, entry_neither_capture_nor, is_n_laws_stated_by, is_undetermined, it_names_n_stages_a, no_member_has_stated_what_it_seeks, promise_machine_cannot_record, action_no_project. The three rows read by key already exist in rows.mjs.

Not filed as design-unkeyed: no string was judged never read by a member.

## J2 · COMPLETE

Entries applied: T51-240 (words).
- The 15 findings of `checks/words.mjs action-records` at START are fixed: 13 inline sentences and fragments in index.mjs now read through `localize('action-records.index.<slug>', en, vars)` (new ids, en as before); 4 sentences the list already holds read by key (`word`: proposal_action_risk_tier, proposal_request_seeks_stands, member_proposed_risk, member_proposed_records) and the 4 PROPOSAL_SAYS strings by key (machine_credential_proposed, machine_credential_proposed_records, record_say_proposed, record_say_proposed_records). The K3957 plain findings and the K3962 test copy are covered by the same change.
- Test copies: correspond.test.mjs reads RECEIPT_DETAIL (now exported) instead of holding the sentences; t50.test.mjs reads NO_SUCH_ACTION_DETAIL (now exported); instance.test.mjs no longer hand-lists the eight ops, it asserts the eight arms and that R17 and R19 ride on the map (the op-declarations import was rejected by the architecture check: a later module).
- No requirement text changed; no ids, refusal codes or bounds changed. No `rows.mjs` or `words-unreviewed.json` edit.

Deferred: none.
Reported to BOB (REPORT): the other modules' L9 words findings (none naming action-records), and the wording change of "labelled" to "labeled".

Tests and checks:
- `node --test bio-plane/test/m/action-records/*.test.mjs`: 30 pass, 0 fail (the R-id tests, including R17–R19 and R1–R10 controls).
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio action-records`: 0 failures.
- `checks/coverage.mjs /home/user/bio action-records`: 19 of 19 live requirement ids named by a test; 0 failures.
- `checks/words.mjs /home/user/bio action-records`: 0 failures (inline 0, plain 0, testcopy 0, handlist 0).
- L9 words check (above): no line names action-records.
- `checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 26 failures and words 1391 failures, all in other modules; none names action-records.
- `bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only (the new ids are awaiting BOB's regeneration), no refusal naming action-records.
- `checks/ownership.mjs /home/user/bio action-records tranche/T51 job/T51/action-records`: 5 files changed, 0 failures.

Commit 18dfd2ec75 on job/T51/action-records, pushed.

Size (session_01VQcZbhMadSrXupkovniD1S): test runs 4, module lines 1036

## J3 · COMPLETE

Entries applied: B2 CHANGE (ACTION-REPLIES #6 J1, K4046).
- The eight `NO_TARGET` refusal details (seven "pass target=<action id>", one "pass action=<action id>") in index.mjs now read through localize: `action-records.index.no_target_one_action` and `action-records.index.no_action_one_action`, en unchanged. Commit 4eab89a88e on job/T51/action-records, pushed; tranche/T51 merged in first (your merge fc8459c29b of my COMPLETE is in it).
Deferred: none.

Checks after the change:
- `node --test bio-plane/test/m/action-records/*.test.mjs`: 30 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 0 failures. `checks/architecture.mjs /home/user/bio action-records`: 0 failures. `checks/coverage.mjs`: 19 of 19 ids named by a test.
- `checks/words.mjs /home/user/bio action-records`: 0 failures. The cross-module L9 words check: no line names action-records.
- `bio-plane/src/setup-words/build.mjs --check`: stale-rows note only (other modules' new ids and the two new action-records ids await your regeneration); no refusal naming action-records.
- `checks/ownership.mjs /home/user/bio action-records tranche/T51 job/T51/action-records`: reports 0 files, because tranche/T51 already carries my COMPLETE merge; the only diff against tranche is index.mjs in the commit above, inside the module's paths.

Size (session_01VQcZbhMadSrXupkovniD1S): test runs 2, module lines 1036

## J4 · COMPLETE

Entries applied: B3 START (fix round 10, Wave B batch 6): the 2 own fixture lines, both FIX-E (providers earlier in the order).
- `fixture.mjs:175` (progressions/definitionRead): the stand-in's refusal is now `definitionRead({})`, progressions' real `NO_KEY` answer.
- `fixture.mjs:194` (standards/standardReadWorld): the stand-in's not-seen answer is now standards' real `standardRead` for the stranger viewer, from `standardReadWorld()`.
- Markers added: none (no `fixtures-own`, no `fixtures-generic`). Deferred: none. Product code unchanged.

Checks:
- `checks/fixtures.mjs . action-records --list`: 0 failures (answer 0).
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/action-records/*.test.mjs`: 34 pass, 0 fail.
- format 0 failures; architecture 0 failures; coverage 20 of 20 ids named, 0 failures; words 0 failures (action-records).
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 0 of 178 (a test-fixture change only, no user of action-records affected).
- `checks/ownership.mjs`: 1 file changed, 0 failures.

Size (session_01NsKSfvCegNhmvxjABmWB8Z): test runs 2, module lines 1036
