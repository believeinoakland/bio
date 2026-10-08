# conformance (T37)

**Status** · session_01GH338C6TD3jzDQ83fzday7 · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied.** T37-36 (N770), on B2's answer to J1: every row of `CONFORMANCE_CHECKS` names in its `where` the function that holds its region. Seven rows re-pointed, codes, numbers, region names and translations unchanged (R23: one row per code): C-113.34 `ACTOR_IS_A_PERSON` and C-113.35 `ACTOR_NOT_AN_OFFICE_OR_ORGANISATION` to `#comparedAct` (the entry); and, found by the entry's test, C-113.29 `ACT_NO_EVENT` and C-113.31 `ACT_NOT_AN_EVENT` to `#actEvent`, C-113.12 `OUTCOME_UNKNOWN` and C-113.32 `STANDARD_NOT_BINDING` to `#determine`, C-113.19 `PROPOSAL_CANNOT_DETERMINE` to `#propose`. `checks.mjs`' header records it. New test `bio-plane/test/m/conformance/t37.test.mjs` (names R28, R23): reads every row, finds its `where`'s file, function (definition to its closing brace) and the region inside it; negative controls: a row naming an absent function (`#comparedActor`), a region its function does not hold, and an absent file are each found.

**Deferred.** None. A known point, not a flaw under R23: `ACT_INCOMPLETE` (C-113.5) has its region `is-act-complete` in two functions, `#actOf` (index.mjs:377–381) and `#comparedAct` (:478–481); its one row names `#actOf`, which holds it, so the test passes. One row names one function; a second site of one code is permitted by R23 and left as is.

**Found elsewhere (for BOB).** (1) `bio-plane/dist/bio-plane.bundled.mjs`:175723, :175728 (a generated artifact, not mine, §14) still holds `#comparedActor`, and the other five old `where`s; stale until the next bundle. (2) The census: `bio-plane/test/system/row-census.test.mjs` is red for exactly the seven C-113 rows above (fixture `row-census-1.64.0.jsonl` lines 206, 212, 222, 225, 226, 228, 229; "changed with no record") until T38's promotion stamp, accepted by B2 (K2231); its C-140.40–.42 reds are inherited (K2191), not mine. Fixture left untouched.

**Reading set.** Measured: own requirements 29 KB, code 134 KB, tests 201 KB: 364 KB with no used module, over 300 KB, so B1's (3). Read whole myself: `build/requirements/conformance.md`; layer 9's row of `build/layers.md`; `checks.mjs`; `index.mjs`:440–490 (`#comparedAct`) and :1320–1340 (its caller); `t36.test.mjs`; the plan's T37-36 entry; K2150's line; K1680, K2191 by their lines. Not read whole: the used modules' public parts (no service I call changed; the entry touches no use). A worker read in full `index.mjs`, `schema.mjs` and every test file but `t37.test.mjs` (322 KB) and wrote a summary of about 1,400 words, each statement citing file and line: what reads a `where` (only `helpers.test.mjs`:24, :72, rows not re-pointed; the census fixture outside the module), a region audit (33 rows, every region in its named function, no mint outside a region; `ACT_INCOMPLETE` in two functions), and nothing in the module contradicting R28 or R23. Nothing it left out mattered: the change touches only `where` strings, which no behaviour reads.

**Tests and checks.**
- `node --test bio-plane/test/m/conformance/*.test.mjs`: tests 81, pass 81, fail 0 (includes the R27 tests reading standards' R43 as amended, T37-35).
- `node --test bio-plane/test/system/row-census.test.mjs`: fail 1, the accepted red above (seven C-113 rows, plus inherited C-140.40–.42).
- `checks/format.mjs`: 136 modules, 135 requirements files; 0 failures. `checks/architecture.mjs` conformance: 13 product files, 58 relative imports; 0 failures. `checks/coverage.mjs` conformance: 29 of 29 live requirement ids named by a test; 0 failures. `checks/ownership.mjs` conformance tranche/T37: 3 files; 0 failures.

Size (session_01GH338C6TD3jzDQ83fzday7): test runs 4, module lines 2,085 (2,083 at T36's close; +2, the header).

## J1 · QUESTION

The entry's R28 test (every row's `where` function holds its region) finds five more rows with the same flaw as C-113.34/.35, besides those two:
- C-113.29 `ACT_NO_EVENT` and C-113.31 `ACT_NOT_AN_EVENT` name `#actOf`; their regions `is-act-event-named` and `is-act-aliased` are in `#actEvent` (index.mjs:420–438), which `#actOf` and `#comparedAct` both call.
- C-113.12 `OUTCOME_UNKNOWN` and C-113.32 `STANDARD_NOT_BINDING` name `determine`, now a 6-line wrapper (since R29's async measures); the regions are in `#determine` (:910 on).
- C-113.19 `PROPOSAL_CANNOT_DETERMINE` names `comparisonPropose`, likewise a wrapper; the region is in `#propose` (:1309 on).

My best reading, applied and green (conformance 81/81): the test checks the region lies inside the named function (what a `where` means to an auditor), so all seven rows are re-pointed (`#actEvent`, `#determine`, `#propose`, `#comparedAct`), codes, numbers and translations unchanged. Consequence: from my merge `bio-plane/test/system/row-census.test.mjs` is red for seven rows (fixture 1.64.0 lines 206, 212, 222, 225, 226, 228, 229), not the accepted two, until T38's stamp.
The alternative: the test checks only that the named function exists and the region exists in the file; then only C-113.34/.35 change (red 2 as planned) and the other five stay mis-pointed, deferred to a later job.
Question: accept red 7 at the census (my reading), or narrow to red 2?
