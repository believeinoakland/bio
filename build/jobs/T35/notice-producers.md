# notice-producers (T35)

**Status** · session_01EqDcfJ9L6q52BBKRNNeiu9 · depth 2 · WORKING · handled B0

## J1 · QUESTION

R13's bound. `following.policyChanges` (its R21) pages by a change-id cursor in order of the later capture, oldest first, and takes no time: there is no way to start the read 90 days back. My best reading, which I am building: the 1,000-change bound counts every change read (5 pages of 200, older ones included, so the read's cost is bounded); changes whose later capture is older than 90 days are skipped; `facts.policy_change` states `{bound: 1000, days: 90, truncated}`, `truncated` when a sixth page would follow. The cost of this reading: once a group holds more than 1,000 policy changes in total, the newest ones (the ones that matter) are cut. The fix belongs to `following`: R21 gaining a `since` (an instant) so the read starts at the window; I will use it if it is given (a REPORT carries it). If you read the bound as counting only changes inside the window (older pages read unbounded), say so and I will change one line.

R12's episode start, my reading (no answer needed unless you differ): an hour h "ended High" when credentials R45's rule holds for the 24 hours ending at its end (a `through` in hours h-23..h, or hour h unusual); read from `securityMap` in 48-hour periods (hour steps) backwards from the call, under the administrator's own `by`, bounded by the 90 days kept. The episode starts at the start of the earliest hour of the unbroken run of such hours reaching the call (the current hour counting as High when `securityLevel` answers High); key `FINDING::security-level-high::<that instant>`.
