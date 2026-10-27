# inquiry-grammar (T52)

**Status** · session_018BhcefZe8MJ26gSBpswxfA · depth 2 · COMPLETE
**Sessions** · 2

## Completion (2026-10-27)

**Entries applied.** T52-20 (R70): `checkGrounds` now gives the finding for a cutting leg that names a ground the code `CUTTING_LEG_IN_GROUND` (C-2.8, same check, severity and meaning as R68). Its one repair tells the member to take the passage out of its ground first, then put it on the cutting side, with no field, code or id named (R69). R16's list gains the row `CUTTING_LEG_IN_GROUND` in `INQUIRY_GRAMMAR_CHECKS`, with a translation and a `where`. Tests: R70 test and control in `t51.test.mjs`; the row-list test in `grammar.test.mjs` now expects thirteen rows. The module's 92 tests pass; the R69 sweep and the golden answers are unchanged (no corpus case has a cutting leg in a ground).

**Not done.** `citation`'s through-the-door test (`reinstate` with `role: cuts_against` answering `BASIS_REFUSED` carrying this finding) belongs to `citation`'s job, which relays the finding unchanged.

**Found in other modules.** `bio-plane/src/setup-words/rows.mjs` (setup-words' generated artifact) is stale by two new sentences (the finding's repair and the row's translation); `proc merge` regenerates it with `node bio-plane/src/setup-words/build.mjs`. Not edited here.

**Met** · R70

Tests: 92/92. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefZe8MJ26gSBpswxfA): test runs 1, module lines 2059
