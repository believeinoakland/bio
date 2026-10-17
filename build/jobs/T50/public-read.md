# public-read (T50)

**Status** · session_01AwdRj3H21ktEZnLTXx3okd · depth 2 · WORKING · handled B0

## J1 · QUESTION

QUESTION (R37, the data of "Corrections and orders"): `publishedCase` is synchronous and its callers (ratification, filings, case-checker, tests) rely on that, but R37 says to read `docket`'s public answer, and `docket.docketPublic` is `async`, so I cannot read its entries inside `publishedCase`. `docket`'s synchronous reads do not cover R37: `lastEntryOf` answers only the newest date; `withdrawalOf({case, edition})` and `courtOrdersOf({case})` are synchronous and carry `date`, but no synchronous docket service answers the case's `edition`-kind entries (R6 kind `edition`) with their dates.

Best reading, which I recommend (docket is another module, so it is BOB's to change): `docket` provides one synchronous, viewer-free, capture-free service, e.g. `correctionsOf({case, after})`, answering `{entries: [{seq, kind, date}]}` of the case's public entries of kind `edition`, `withdrawal` or `court-order` whose `date` is after `after` (null when the case has no ratified edition, like `docketPublic`). I would then fill `corrections` from it inside `publishedCase`, count and newest by (date, seq), and answer `{count: null, last: null, undetermined: true}` when the service is absent, throws or answers null for a case the projection holds.

Alternative if docket must stay unchanged: I add `corrections` only to the `publishedcase` op's answer (awaiting `docketPublic({captures: "omit"})` in `publicReadOps`), and `publishedCase()` the method does not carry it. That deviates from R37's "`publishedCase` also answers".

I am building R36 and the words work (plan rule 6) meanwhile, and will leave R37 until you answer.
