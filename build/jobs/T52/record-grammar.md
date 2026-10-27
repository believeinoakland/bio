# record-grammar (T52)

**Status** · session_018BhcegUYKt4HvsMstng9cS · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

## Report · record-grammar · T52

**Entries applied**
- T52-2 (R65): `checkHistoryCoherence` (C-12.2) now maps a history file to its manifest entry by the keys the manifest lists (`listedKeyOf` in `bundle.mjs`): any key form after a `_`, followed by the extension's dot or the name's end, including keys with a dot (stamp with ms). Unlisted keys still raise C-12.2. History is not rewritten.
- Test: `bundle.test.mjs`, "R65 C-12.2", one per writer key form (plain stamp_hex, connections `_links_`, strength `_bar`, investigation `_plan`/`_close`, contradiction `takeup_`/`resolve_`), each with an unlisted-key control. Without the fix all 7 fail; with it the 26 tests of the file pass (114 in the module folder).

**Not done:** none.

**Other modules:** `bio-plane/src/case-checker/program.mjs` (and the bundles built from it) embed `bundle.mjs` and are stale until `proc merge` regenerates them; I did not touch them.

**Met** · R65

Tests: 114/114. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegUYKt4HvsMstng9cS): test runs 1, module lines 2665
