# member-roster (T53)

**Status** · session_018BhcefiiLZYzriCJJmrdXE · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# member-roster · T53 · report

## Entries applied

- **T53-66 (K5562, K5563; R84–R91).** `adminRemove` by the founder removes alone (reason required; `remove_founder` row; listeners told once; answer `alone: true`); `TARGET_NOT_AN_ADMIN` now tests `active` as well as `admin` (K5566). New `adminRemovals` (completed removals, founder and vote, newest first, `limit`/`truncated`) and `adminProposalCancel` (new C-96.56 `NO_WAITING_PROPOSAL`, C-96.57 `NOT_YOUR_PROPOSAL`). `adminEndorse` and `memberAdd` by the founder issue an administrator invitation at once (`issuedBy: "founder"`); `endorsementsOwed` lists the founder her own old-rule proposals. Both ops are in `DECLARED_OPS` and the ops map. New test file `t53-founder.test.mjs`; existing tests that had the founder propose or vote were changed to the new rules (`fixture.mjs` gains `fiveAdmins`).
- **T53-67 (K5565).** The nine English-in-test sites in six files now assert the word table's value (`word(id)`); `build/tests-english-baseline.json` is outside this module's paths (the ownership check refuses it), so its six member-roster lines (administrators 4, not-an-admin-visibility 1, t34-settings 1, t35-words 1, t46-handles-doors 1, t49-founder-handle 1) are to be removed by BOB at the merge; the words check is green for the module (testenglish 0). `t34-settings.test.mjs`'s `rowOf` asserted "Nothing was written." in a detail that differs per code: it now asserts a non-empty detail (the sentence is the word table's).

## Not done, and why

- Nothing: the reads row has landed and the module's suite is green.

## Found in other modules

- **Vote removal now needs five administrators.** The founder no longer votes, so a removal by vote needs `floor(n/2)+1` votes from the other administrators: at 3 and 4 administrators the non-founders cannot carry one (at four, 2 eligible of 3 needed), at 5 they can. R86's test line "at four, two non-founders carry a removal" cannot hold; the tests use five. `adminMath(n).possible` still reads true at four. For BOB's decision (a requirement note, or `possible` counting the founder out).
- **`adminRemovalsOpen` still lists the founder in `awaiting`** (screens-settings Found 2, `members.mjs`:284; the screen's job).
- **Other modules' tests that this change turns red** (their jobs): `membership` (R112 battery and rows, R151, R154 delegates: the two new ops and rows), `credentials` (R9, R16 tests where the founder votes on or proposes an administrator), `op-declarations` (`affordances` ACT_HELP for `adminproposalcancel`, K5563-R6).
- Promotion's row-census stamp takes C-96.56/.57 (checks.mjs' header).
- Reactivating a removed administrator and removing them again by the founder replaces the first `remove_founder` row (the key is kind, target, voter; R67 adds no column).
- 

**Met** · R84, R85, R86, R87, R88, R89, R90, R91

Tests: 225/225. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefiiLZYzriCJJmrdXE): test runs 1, module lines 3082
