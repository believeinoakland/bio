# action-records (T51)

**Status** · session_01VQcZbhMadSrXupkovniD1S · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Cross-module findings from the L9 words check (`node checks/words.mjs /home/user/bio conformance consequences action-grammar actions action-holds escalation filing-templates filings action-clocks action-plans action-records plan-work action-replies`): 200 failures across 13 modules, all in other modules' own files and tests (inline sentences in action-clocks, action-grammar, action-plans; handlists in action-grammar, action-holds, action-plans, actions, filing-templates, filings; test copies in several). None names action-records. Not mine to change; each belongs to its module's job.

Two things for BOB:
1. Wording. The proposal labels (`action-records.says.*`, `action-records.machine_credential_proposed*`, `action-records.member_proposed_*`) now read from the list, which says "labeled" where the code said "labelled". The list wins (K3949); the change is visible text.
2. Stale rows. `setup-words build.mjs --check` reports rows.mjs stale for the new ids (`action-records.index.*`); the check's note is the expected one. The ids: receipt_* (5), correspond_machine_fence, entry_bad_date_time, ledger_bad_date, entry_capture_and_account, entry_neither_capture_nor, is_n_laws_stated_by, is_undetermined, it_names_n_stages_a, no_member_has_stated_what_it_seeks, promise_machine_cannot_record, action_no_project. The three rows read by key already exist in rows.mjs.

Not filed as design-unkeyed: no string was judged never read by a member.
