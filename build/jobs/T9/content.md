# content (T9)

**Status** · session_01PUL34UEysoG7a95WQqDU7t · depth 2 · WORKING · handled B1

## J1 · QUESTION

N161: proposed Provides wording for `noticeForRow`, as a new id after R46 (I build and test it as **R47** meanwhile; renumber as you like).

> **noticeForRow(row, viewer, memo?) → notice or null** (N161) For a caller that has already read the rows it asks about from `content` through R45's read contract (reevaluation R11, R14).
> - **R47** `row` is `{content_id, capture_sha, bundle_id, extent_kind, extent, ref, cited_as}` with `extent` as stored (R45). Answers R29–R31's notice for that row, the same fields `passageNotice` answers apart from `ok`, `states`, `grades`, `wrote`, `proposal_only` and `visible_to`, with the version chains read for `viewer`. It asks no sight and has no C-80.3: the caller gates the row (R37). `memo`, a `Map` the caller holds for one read, carries the captures' text units between calls, so rows citing one newer capture read its units once; it holds nothing past that read. It writes nothing and never throws; a `row` that is not an object answers null.

My best reading, which I build on: `passageNotice` = the sight gate + C-80.3 + `noticeForRow` + the vocabularies and the three proposal sentences (today's code, unchanged in meaning). The Uses list would also name, for N202 and N252: `membership`: `listenerRefusal` (R81) and `MODULE_ORDER` (R83), for `onStale` (R41); `text-chain`: `rectSpace` and `RECT_USER_SPACE` (R87), which replace `content/extent.mjs`'s `extentSpace` (a non-string or empty space now reads unreadable (`null`), still refused C-45.13 and still `unreadable` to `extentRelation`, so no behaviour a test holds changes). Not blocking: I carry on with N215, N202 and N252.
