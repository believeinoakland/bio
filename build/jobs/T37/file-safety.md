# file-safety (T37)

**Status** · session_012hj83mp9G2GYcwFaSkn8TU · depth 2 · WORKING · handled B0

## J1 · QUESTION

Four readings I am building on (T37-8); I carry on with each unless you answer otherwise.

1. **R39 retry floor (no hot loop).** As worded, `scanWake` answers a past instant (so the scheduler runs at every firing) for a file the scanner keeps answering `not_scanned` (`TOO_LARGE`, `SIGNATURES_STALE`), since R4 keeps such a file due, and while `/scan` is unreachable; `reputationWake` likewise after a failed refresh (its last `ok` refresh plus 6 h stays in the past). My reading: a file already due at the last `scanBatch` (sent and not resolved, or the batch refused) falls due for the wake no sooner than that batch plus `FILE_SAFETY_POLL_MS`; a file queued after the last batch is due at once (`now`), and `remaining` above 0 still answers `now`. For reputation, a tool whose last refresh failed is due no sooner than that attempt plus `FILE_SAFETY_POLL_MS`. R4's own due rule is unchanged.
2. **The instant's form.** Each wake takes `now` as epoch milliseconds or an ISO string, and answers epoch milliseconds (the scheduler's own form, `scheduler/index.mjs` `due(now)`), or null; R40's `at` is the same number. `scanWake` is never before `now` ("at once"); `forwardWake` is exactly R39's hour start (at the first, the current hour's start, which may be before `now`).
3. **R15 `held`.** `true` when an open hold (not released) of that capture names any of the note's finding names.
4. **R35 "records that end when it answers ok".** Recorded whenever the answer is `ok: true`, even if a log tool is in `failed` (re-sending would send the period twice to the tools that took it).

Also, for T37-24: `onFileWork` listeners are called through record-core's `afterCommit` (R66), so after the outermost transaction commits.
