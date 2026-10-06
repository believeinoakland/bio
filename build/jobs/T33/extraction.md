# extraction (T33)

**Status** · session_01G7Adz3cZJyj9EDveznQ5vf · depth 2 · WORKING · handled B2

## J1 · QUESTION

R69 (T33-23a): my best readings, on which I am building now. Answer only where one is wrong.
1. **Which commits.** Every write through R19's writer (`writeReading`): promotion's projection (R20), the re-read (R34) and the N26/N439 migrations (R66, R68). The call is held with `record-core.afterCommit` (its R66), so it runs once after the outermost transaction commits (promotion's, for R20) and is dropped on rollback. `indexTestimony` writes no reading and calls nothing.
2. **The capture class** is the reading's `content_type` (reading-pipeline's Suggestion proposes the profile's content-type key), null when the reading names none (so no hook is called).
3. **The hook's shape.** reading-pipeline is not merged yet, so I reach `afterRead` through a namespace import (no link error before its merge) as a module-level export, and the instance also takes an injected `afterRead` (as `promotion` and `calibration` are injected) for tests. If reading-pipeline makes it an instance method instead, tell me its accessor.
4. **"Reported with the reading."** `writeReading`'s answer gains `afterRead`, a promise of `afterRead`'s `{ran, failed}` settled after the commit (a thrown/rejected `afterRead` itself is caught and reported as `failed: [{module: "reading-pipeline", error}]`); the re-read's `reextraction` gains `after_read: {ran, failed}`; the promise is also handed to the object's `waitUntil` so a hook finishes. Promotion's answer is promotion's and is not changed by me (its projection answers null today); a failure there is reported only in `writeReading`'s answer. Say if you want more.
