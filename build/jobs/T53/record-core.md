# record-core (T53)

**Status** · session_018Bhcefjn5o22km4fr7kbme · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# record-core · T53 · R1 report

**Applied**
- T53-69 (N1257, K5458, K5462): `getSettingAt(name, at)` (R92). The setting as of an instant, from the rows `settings` already keeps: the row with the greatest `rowid` whose `set_at` is at or before `at`, a whole-second `at` read as the last millisecond of its second. Before the first set (or a name never set) it answers the frozen `SETTING_UNDETERMINED`; an unreadable row, an unspellable name or a failing read answers the frozen `SETTING_UNDETERMINED_UNREADABLE`; an `at` that is not an instant (wrong form, month 13, 30 February, hour 24) is refused `SETTING_AT_INVALID` under the new row C-102.40 (`RECORD_CORE_CHECKS`, region `is-setting-at-refused`, BUILD_FAULT translation). No table, column or row added; `settings` classes unchanged. New tests `t53.test.mjs` name R92 (a)-(h) and the control. Test (h) asserts work (1,000 reads each answering the row in force, the plan using `settings_name`), not wall-clock time (K4787). `t47.test.mjs`'s pin of the last C-102 number moved from 39 to 40.
- T53-70 (K5565): the module's English-in-test sites converted: t33 (the declaration refusals' detail now asserted against its word key; the expunge fixture's removed content is named input), t35 and t47 (`SETTING_INVALID`'s translation asserted against its word key), t48 (a dead assertion removed, the preceding deepEqual already pins the detail), fixtures (the thrown message is named test input). `words` check with the module's baseline lines removed: testenglish 0. The ownership check refuses an edit to `build/tests-english-baseline.json` (outside the module's paths), so the job left it: BOB removes the five `bio-plane/test/m/record-core/` lines (fixtures, t33, t35, t47, t48) at merge.

**Not done**
- T53-68 (N1271, Institution upgrade from Team): waits on the Levels 2-3 study and Bob's decision; no line in the requirements yet.
- R92's two read-only checks against biosmoke8's store (Suggestions, T53): (2) done by code: no path writes settings rows except `setSetting` (no restore writes them back with an exported `set_at`). (1) that no settings rows were lost before R25 needs a read of biosmoke8's live store, which this session cannot make; left for BOB or PLATFORM.
- `bio-plane/src/setup-words/rows.mjs` (generated, setup-words') lacks the new key `record-core.checks.setting_at_invalid` and `record-core.index.the_instant_given_is_not`; `localize` falls back to the code's sentence until `proc merge` regenerates.

**Found in other modules**
- `notice-producers` reads the `settings` table directly (`index.mjs` ~1595, 1600) with its own SQL; `settings` is not in record-core's R37 read contract. It should read through `getSetting`.

**Met** · R92

Tests: 233/233. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcefjn5o22km4fr7kbme): test runs 1, module lines 2562
