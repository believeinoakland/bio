# docket (T51)

**Status** · session_01SMUewbpPXf2emYuG2aQvxY · depth 2 · WORKING · handled B0

## Completion (T51-162, R8)

**Entries applied**
- R30: `docketOf` answers each record entry's pressure mark as `{kind, note, at, by}`, `by` the marking member as `{member, handle}` (handle from `membership.memberFacts`, null when she holds none), null when the mark has no author. R27's `docketPressureMarks` and `docketPressureOf` are unchanged and name no member. Test and controls under `R30` in `reads.test.mjs`; `file.test.mjs` R2 and the R3 test updated to the new shape.
- Words (K3949): the three literal sentences in `checks.mjs` (`DOCKET_WITHDRAWAL_FINAL`, `DOCKET_TAKE_BACK_FINAL`, `DOCKET_ORDER_UNREADABLE`) are `localize` calls (`docket.checks.withdrawal_final`, `.take_back_final`, `.order_unreadable`), single string literals as the build requires. The plain finding at `index.mjs:575` is `localize("docket.index.no_team_slug_recorded", …)`. `words.test.mjs` compares with `word("refusal.DOCKET_NO_GROUP_SLUG")` and `word("refusal.DOCKET_STALE")` instead of copies. The hand-list in `reads.test.mjs` is the ops map's own keys (a count and a handler each), not a literal list.

**Deferred:** none.

**Found in other modules:** `action-holds` tests `R2 an administrator neither invited nor joined may name a hidden project in a hold (D54)` and `R4 doorbell asks this module's reader…` fail on `tranche/T51` with and without my change (inherited, not docket's).

**Ran:** `node --test bio-plane/test/m/docket/`: 80 pass, 0 fail. Users' tests (`public-read/docket-real`, `plane/docket`, `network-notices`, `action-holds`): 120 pass, 2 fail (the inherited two). Checks: format 0 failures; architecture 14 files, 0 failures; coverage 30 of 30 ids, 0 failures; ownership 0 failures; words (docket) 0 failures, inline 0, plain 0, testcopy 0, handlist 0; `setup-words/build.mjs --check`: only the expected stale-rows note, no refusal naming docket. (`checks/run.mjs` over the whole product shows other modules' words findings, none docket's.)

Size (session_01LB8wrfssMdqb1sPQdkkUPT): test runs 8, module lines 1635

## J1 · COMPLETE

T51-162 applied: R30 (docketOf's pressure mark carries by {member, handle}; R27 reads unchanged), 4 words findings localized, test copies and the hand-list removed. Docket tests 80 pass; format, architecture, coverage, ownership, words 0 failures. Two action-holds tests fail with and without my change (inherited). Details in the record.
