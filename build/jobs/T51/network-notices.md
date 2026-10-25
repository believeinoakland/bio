# network-notices (T51)

**Status** · session_01TxP6SXEnxGFivEEhYLkZT1 · depth 2 · WORKING · handled B1

## J1 · REPORT

REPORT to BOB (network-notices, T51-231; the words findings).

Found in another module, not changed here (BOB to route):
- `affordances` `bio-plane/test/m/affordances/catalogue.test.mjs:58`: handlist `[?]`, 11 of 22 ops named in the list are not affordances' own (`holdnoticeprepare`, `holdnoticesent`, `actionreceipt`, ...). The words check reports it on the whole tree; network-notices is unaffected.
- Whole-tree `checks/run.mjs` shows 2,259 words failures across the other modules (inline, plain, testcopy, handlist) and 25 coverage failures in other modules. None names network-notices.
- `installer` module, `newgroup/src/ui.mjs:116` and `:126`: inline HTML strings. Not mine.

For the design's review list: two ids are new and have no words.json row, so each falls back to its `en` (counted as `unkeyed` by the check): `network-notices.index.no_group_slug_detail` and `network-notices.index.no_instance_key_detail` (the second is `NO_INSTANCE_KEY_DETAIL`, used at both sites). `rows.mjs` is stale for those two ids: expected per the job rules; BOB regenerates it at the layer close.

## J2 · COMPLETE

COMPLETE: network-notices, T51-231 (the words findings, job record for session_01LBoZbavsJsVjLD8kDmTZhV). Pushed to job/T51/network-notices at 58f6883957, merged with tranche/T51 first.

Entries applied:
- T51-231: all six `checks/words.mjs` findings on the module are fixed (the three `plain` findings, which the check counts as inline, and the three `testcopy` findings).
  - `bio-plane/src/network-notices/index.mjs`: the NO_GROUP_SLUG detail is `localize("network-notices.index.no_group_slug_detail", …)`. The NO_INSTANCE_KEY detail is `NO_INSTANCE_KEY_DETAIL`, a `localize("network-notices.index.no_instance_key_detail", …)` constant exported beside COPY_KEY_LABEL and used at both refusal sites, with the same sentence as before.
  - `bio-plane/test/m/network-notices/words.test.mjs`: the translations of NOTICE_NO_GROUP_SLUG, NOTICE_NO_INSTANCE_KEY and NOTICE_STALE are compared with `word("refusal.<CODE>")`, the detail with `nn.NO_INSTANCE_KEY_DETAIL`. The test holds no sentence text.
- Job step 3 (ambiguity): none. Step 4 (flaws in own module): none found beyond the words findings.

Deferred: none.

Found in another module (not changed here): see my REPORT, J1.

Tests and checks (from /home/user/civicos-process against /home/user/bio):
- `node --test test/m/network-notices/*.test.mjs`: tests 73, pass 73, fail 0 (run before and after the tranche merge).
- `checks/format.mjs bio`: 176 modules, 175 requirements files; 0 failures.
- `checks/architecture.mjs bio network-notices`: 12 product files, 70 relative imports; 0 failures.
- `checks/coverage.mjs bio network-notices`: 30 of 30 live requirement ids named by a test; 0 failures.
- `checks/words.mjs bio network-notices`: inline 0, plain 0, testcopy 0, handlist 0; 0 failures.
- `checks/ownership.mjs bio network-notices tranche/T51 job/T51/network-notices`: 1 file changed by network-notices; 0 failures.
- `node bio-plane/src/setup-words/build.mjs --check`: stale-rows note only, naming the two new ids (expected; BOB regenerates at the layer close). No refusal names network-notices.
- `checks/run.mjs bio`: format 0, architecture 0, channels 0; coverage 25 failures in other modules, none in network-notices; words 2,259 failures across other modules, none in network-notices.

Size (session_01LBoZbavsJsVjLD8kDmTZhV): test runs 2, module lines 1399

## J3 · COMPLETE

COMPLETE: network-notices, T51 fix round 10, Wave A batch 5 (START B2). Pushed to job/T51/network-notices at 0d02a01efc, merged with tranche/T51 first (K1991: merge, no rebase).

Entries applied:
- FIX-E, own lines (2), both re-pointed to attestation's published fixture `noKeyInstanceSign()` (attestation R5, the real RECEIPT_NO_KEY refusal), imported from `../attestation/fixtures.mjs`:
  - `bio-plane/test/m/network-notices/activity.test.mjs` (R13 test, was line 212)
  - `bio-plane/test/m/network-notices/words.test.mjs` (R4 test, was line 48)
- Fixture published, new file `bio-plane/test/m/network-notices/fixtures.mjs`: `noticePrepareRefusal(code)` answers the real `noticeprepare` refusal for each of NOTICE_ALREADY_OPEN, NOTICE_SINCE_BEFORE_PROJECT, NOTICE_NO_GROUP_SLUG, NOTICE_NO_INSTANCE_KEY, NOTICE_PROJECT_CLOSED, NOTICE_SINCE_IN_FUTURE, NOTICE_WORDING_MALFORMED. Each is made by the real module at test time over `world()` (a world that breaks only that condition). An unknown code throws; a world that answers another code throws.
- Test of the fixture, `bio-plane/test/m/network-notices/fixtures.test.mjs` (R1): checks each published answer's reason, code, check and translation against NETWORK_NOTICE_CHECKS; checks `project_created` and the open notice's id; checks an unpublished code (NOTICE_NOT_A_CODE, and NOTICE_STALE, which is posting's answer) is refused.
- Users, not mine: screens-inquiry (1 line, `t51-project-notice.test.mjs:209`) re-points to this fixture in its own job (part-4).

Deferred: none. FIX-L lines: none in this batch. Fixture markers added: none (`fixtures-own` and `fixtures-generic`: none), so nothing to list for K5060.

Found in another module: nothing new this job. The whole-tree `checks/run.mjs` and `checks/fixtures.mjs` failures are in other modules (2,570 fixture failures, 25 coverage, 2,259 words earlier), none in network-notices.

Tests and checks (absolute paths, K5078):
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/network-notices/*.test.mjs` (from /home/user/bio): tests 78, pass 78, fail 0 (the first run had a duplicate-identifier syntax error in words.test.mjs, fixed; the second run is the one recorded).
- `checks/fixtures.mjs /home/user/bio network-notices --list`: answer 0, 0 failures.
- `checks/format.mjs /home/user/bio`: 178 modules, 178 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio network-notices`: 15 product files, 78 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio network-notices`: 31 of 31 live requirement ids named by a test; 0 failures.
- `checks/words.mjs /home/user/bio network-notices`: inline 0, plain 0, testcopy 0, handlist 0; unkeyed 6 counted as fallbacks to `en` (not a failure; this job adds no sentence); 0 failures.
- `checks/ownership.mjs /home/user/bio network-notices tranche/T51 job/T51/network-notices`: 5 files changed by network-notices; 0 failures.
- `checks/run.mjs /home/user/bio` (whole tree): format, architecture and channels 0 failures; words 0 failures; fixtures and coverage failures only in other modules.
- `bio-plane/src/setup-words/build.mjs --check`: a stale-rows note for `calculations.index.the_delimiter_is_tied` (not this module's; BOB regenerates at the layer close). No refusal naming network-notices.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: network-notices 3/9 tests affected; affected modules 1 of 178 (this module only). Its three affected tests were run in the 78-test run above.

Size (session_01TxP6SXEnxGFivEEhYLkZT1): test runs 2, module lines 1408
