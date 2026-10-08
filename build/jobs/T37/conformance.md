# conformance (T37)

**Status** · session_01GH338C6TD3jzDQ83fzday7 · depth 2 · WORKING · handled B0

## J1 · QUESTION

The entry's R28 test (every row's `where` function holds its region) finds five more rows with the same flaw as C-113.34/.35, besides those two:
- C-113.29 `ACT_NO_EVENT` and C-113.31 `ACT_NOT_AN_EVENT` name `#actOf`; their regions `is-act-event-named` and `is-act-aliased` are in `#actEvent` (index.mjs:420–438), which `#actOf` and `#comparedAct` both call.
- C-113.12 `OUTCOME_UNKNOWN` and C-113.32 `STANDARD_NOT_BINDING` name `determine`, now a 6-line wrapper (since R29's async measures); the regions are in `#determine` (:910 on).
- C-113.19 `PROPOSAL_CANNOT_DETERMINE` names `comparisonPropose`, likewise a wrapper; the region is in `#propose` (:1309 on).

My best reading, applied and green (conformance 81/81): the test checks the region lies inside the named function (what a `where` means to an auditor), so all seven rows are re-pointed (`#actEvent`, `#determine`, `#propose`, `#comparedAct`), codes, numbers and translations unchanged. Consequence: from my merge `bio-plane/test/system/row-census.test.mjs` is red for seven rows (fixture 1.64.0 lines 206, 212, 222, 225, 226, 228, 229), not the accepted two, until T38's stamp.
The alternative: the test checks only that the named function exists and the region exists in the file; then only C-113.34/.35 change (red 2 as planned) and the other five stay mis-pointed, deferred to a later job.
Question: accept red 7 at the census (my reading), or narrow to red 2?
