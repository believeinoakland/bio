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
