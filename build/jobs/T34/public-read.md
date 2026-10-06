# public-read (T34)

**Status** · session_01DA3fU4xbZtzcUJYePtzwib · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R29 / publication R70: through which service does public-read read `signed_at` and `published_at`?

R70 says publication answers them "in R53's `document` and to `public-read`", but names no list-wide read and no column under R40's read contract. `publishedCase` already calls `caseEditionState` for the answered edition, but R29 also needs both dates on each entry of its `editions` and on every case-edition row of `publishedList` (and `publishedEditions`), which today come from one SQL over `published_cases`. Reading them through R53 means one `caseEditionState` per case edition on the public index, which is the N+1 shape N598 (R64 `stampedEditions()`) removes for R28.

My best reading, which I am coding now: both dates come from `caseEditionState(case, edition).document.signed_at` / `.published_at` (R53, R70), called once per case edition listed; null where the edition has no ratified document.

Proposed (BOB's call, a publication requirement change while PUBLICATION #21 is still live): R40's read contract names the two columns where publication stores them (e.g. `case_documents.signed_at`, `published_at`, with R70's pre-T34 rule applied in the stored value or stated as "null means `ratified_at` for both"), so public-read reads them in its one SQL per list. If you rule that, I read the columns and drop the per-edition calls.

Also, for `publishedEditions(id)`: its rows are finding editions; I read R29's "for each case edition they list" there as the row's sole case edition (`case_id`/`case_edition`), dates null when the finding serves several cases (as its other case fields are, D-309), and a loose finding's row unchanged.
