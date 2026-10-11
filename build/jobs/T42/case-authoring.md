# case-authoring (T42)

**Status** · session_017gKhVp4wij8NKw7oL1jXhs · depth 2 · WORKING · handled B1

## Progress (prepared against case-account's requirements; waiting on its CHANGE)

**Entry.** T42-23 (N839, K2608, K2614). Applied in the working tree, prepared against `requirements/case-account.md` because case-account (T42-22) has not merged:
- `src/case-authoring/index.mjs`: the moved bodies are deleted (the account constants, `citeOf`, `citesOf`, `accountShaped`, `citeAddress`, `exclusionSentence`, `namedOrds`, `#accountDraftJudged`, `#accountJudged`, `#accountFlags`, `#citedFor`, `#reviewCommentsChosen` and its reader, `registerReviewComments`, `#caseForDrafts`, `#accountLabel`, `accountPropose`, `accountDrafts`, the `runs` slot and the `ai-runs` import, and the record-grammar imports only they used). `#publishCase` and `publishPreflight` now ask `this.account` (the `case-account` instance on the host) in R69's order: R5 after R65; R4 after R10; R6; R7; `acceptanceRecorded` after the document is stored. There are three one-line pass-throughs (`accountPropose`, `accountDrafts`, `registerReviewComments`) until T43 (N850). `caseAuthoringOf` creates `caseAccountOf(host)` eagerly (case-account R12; the map's doubt 4). The header is re-worded.
- `schema.mjs`: `account_drafts` and `account_acceptances` are removed, and `CASE_AUTHORING_TABLES` is the first two entries.
- `document.mjs`: `reviewCommentBodyLines` is removed and imported from `../case-account/document.mjs`, never copied (K1333).
- Tests: `fixture.mjs` builds `caseAccountOf` first, with the runs, inquiry and judged disclosures, exposed as `w.cacc`, and hands `caseAuthoringOf` no `runs`. In `account.test.mjs`, `ACCOUNT_FRAMINGS` is now imported from case-account, the R64 and R66 arms are re-tagged R69, and there are two new explicit R69 tests: the order, with a negative control at each seam; and the acceptance inside the act's transaction, the one instance and the pass-throughs. In `invariants.test.mjs`, R28 asserts the two tables and that the account tables are not owned here.

**Verified with a stand-in.** case-account is not built, so I put an uncommitted stand-in in the tree, copied from the old code as the map's §2 says, and deleted it afterwards. Against it:
- case-authoring passes 183 of 183;
- review passes 45/45, affordances 232/232, op-declarations 128/128, control-plane 216/216 and plane 166/166;
- answer-envelope passes 28 of 29. Its one red, `families.test.mjs:425`, is the same with my change stashed (accepted red 6).

The checks (format, architecture, coverage, ownership) were all 0 failures. Architecture did not judge the four imports of the untracked `case-account`. These runs are re-done against the real module once its CHANGE arrives.

**Reading (mechanics §17; START 1,345 KB, over 300 KB).**
- I read these whole myself:
  - `requirements/case-authoring.md` and `requirements/case-account.md`;
  - layer 8's row and section of `layers.md`;
  - `extraction/case-account-split.md` (whole, so §3, §4, §6 and §7 included), and K2608 and K2614;
  - plan entry T42-23 and the opening's rules;
  - `src/case-authoring/index.mjs` (3,047 lines), `schema.mjs`, `document.mjs`'s changed parts;
  - `test/m/case-authoring/fixture.mjs`, `account.test.mjs` and `invariants.test.mjs`.
- A worker read the rest whole and wrote a 9,026-byte summary citing file and line: `document.mjs`, `checks.mjs`, `searched.mjs` and the 22 other test files. None uses a moved name. `tensions.test` uses `w.runs` for contradiction's gate, which stays. `carries.test` 65/75 counts tables across a publish, which still holds because the fixture creates case-account's tables first.

**For BOB.** `modules.json`'s case-authoring `uses` still lists `ai-runs` and lacks `case-account`. That edge is BOB's (the map's §3; START); the architecture check will need it once case-account's files are tracked.

## J1 · REPORT

Prepared T42-23 against requirements/case-account.md and pushed (901399311f): moved bodies and tables deleted, publishCase/publishPreflight ask case-account in R69's order, three pass-throughs kept, caseAccountOf created eagerly, fixture builds caseAccountOf first, explicit R69 tests with negative controls. Verified against an uncommitted stand-in copied per the map §2 (since deleted): case-authoring 183/183; review, affordances, op-declarations, control-plane, plane all green; answer-envelope 28/29, the red families.test.mjs:425 is accepted red 6 (same with my change stashed). Checks 0 failures. For BOB: modules.json case-authoring uses still lists ai-runs and lacks case-account (BOB's edge). Waiting on case-account's CHANGE to merge tranche/T42 and re-run against the real module.
