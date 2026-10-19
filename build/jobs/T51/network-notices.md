# network-notices (T51)

**Status** · session_01LBoZbavsJsVjLD8kDmTZhV · depth 2 · WORKING · handled B1

## J1 · REPORT

REPORT to BOB (network-notices, T51-231; the words findings).

Found in another module, not changed here (BOB to route):
- `affordances` `bio-plane/test/m/affordances/catalogue.test.mjs:58`: handlist `[?]`, 11 of 22 ops named in the list are not affordances' own (`holdnoticeprepare`, `holdnoticesent`, `actionreceipt`, ...). The words check reports it on the whole tree; network-notices is unaffected.
- Whole-tree `checks/run.mjs` shows 2,259 words failures across the other modules (inline, plain, testcopy, handlist) and 25 coverage failures in other modules. None names network-notices.
- `installer` module, `newgroup/src/ui.mjs:116` and `:126`: inline HTML strings. Not mine.

For the design's review list: two ids are new and have no words.json row, so each falls back to its `en` (counted as `unkeyed` by the check): `network-notices.index.no_group_slug_detail` and `network-notices.index.no_instance_key_detail` (the second is `NO_INSTANCE_KEY_DETAIL`, used at both sites). `rows.mjs` is stale for those two ids: expected per the job rules; BOB regenerates it at the layer close.
