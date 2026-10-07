# case-authoring (T35)

**Status** · session_01Wf4MncyKDeDENFcc6teTX8 · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · REPORT

T35-59 built on `job/T35/case-authoring` (R58, R59, row C-44.6), waiting on T35-54.

- **R58.** `publishCase` asks `publication.waitingEditionOf(theCase)` right after R7's `NO_SUCH_CASE`, before R8, R9 and any mint, and refuses `CASE_EDITION_WAITING` (C-44.6 in `CASE_DERIVATION_CHECKS`, the requirements' translation word for word) naming `caseId`, `edition`, `at` (`{date, time, zone}`) and `publish_at`. Nothing is written. A minted case is not asked. R34's pre-flight answers it `first`.
- **My decision (R33):** a case another project prepared is not answered with its waiting edition. When the waiting case's owner (the `cases` row, else the waiting document's `case_project`) is not the publishing project, R58 does not refuse, and R7's `CASE_BELONGS_TO_ANOTHER_PROJECT` refuses later in its existing place. So another project's set time is never named. Tested.
- **R59.** On the case door, a document R74 answers waiting is refused C-82.3, in R19's order. Through a draft door, a waiting document is not re-authored and `draft_link.signed` is true. After a cancel, the document is acknowledged and re-authored again.
- **Tests:** `test/m/case-authoring/waiting.test.mjs` (6 tests) and R29's row list in `invariants.test.mjs`. They use publication's real `scheduleEdition` and `publishAtCancel` with the test zone profile.
- **Local check:** I added an uncommitted scratch `waitingEditionOf`, written to R74's shape, to publication, then removed it. With it: case-authoring 151 pass, 0 fail. Checks: format 0, architecture 0, coverage 43/43, ownership 0 failures.
- **Until T35-54 merges,** every `publishCase` that resolves a case throws (`waitingEditionOf` is not a function). That is the plan's merge order, so I merge `tranche/T35` and run the tests when you say publication has merged. The new row C-44.6 waits for its stamp (red 2).
