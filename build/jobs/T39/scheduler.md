# scheduler (T39)

**Status** · session_01D563oouGGZLMyLRRFhNngN · depth 2 · COMPLETE · handled B2

## J1 · REPORT

A flaw in `case-carriage` (R15), found while building R25; not fixed here (not my module).

With no evidence store or bucket bound, `copyBatch` answers `DOCUMENT_COPY_NO_STORE` before it stamps any try (`bio-plane/src/case-carriage/index.mjs:956-960`), so the queued rows keep `tried` null and `copyWake(now)` keeps answering `now` (`:1029-1045`). R25 asks `copyWake` afresh at every firing, so on such an instance with a member document queued the alarm is re-set to the firing instant after every firing: it spins until a store is bound. The plane binds `CAPTURES` today, so production is not affected; any deployment or test plane without it is.

Proposed fix (case-carriage's job, a requirement line in its R15): while no evidence store or bucket is bound, `copyWake` answers null (as `file-safety` R39 answers no scan wake with no scanner bound); the next `onCopyWork` notice or the instance's start re-reads it. Alternative, mine if you prefer it: the scheduler holds a `document-copy` wake at or before a tick that answered a refusal until the next `onCopyWork` call or start (as R22's scheduled-publish hold), which needs a sentence in R25. I built R25 to the letter meanwhile; no answer is needed for me to finish.
