# tasks (T35)

**Status** · session_01GjWmHDbf99UFct9bbB4QiK · depth 2 · WORKING · handled B2

## J1 · QUESTION

The bound for B1's finding (SCHEDULER #29 J1 (2), K2029: an unfiled capture keeps an idle instance's alarm firing every 60 s). My proposal, which I am building now on this reading; tell me if you word it otherwise.

**Proposed R18 (tasks), "the drain's wake is bounded":** After a `task-drain` tick that drained nothing, the consumer's `wake` is set from the waiting events the drain reads (R1's batch, kind `authority-undetermined`), from capture's own durable `attempts` and `lastTry` (capture R45): an event tried `a` times is next due at `lastTry` + `TASK_DRAIN_BACKSTOP_MS` × 2^(a−1) (1 min, 2, 4, … ), and an event tried `TASK_DRAIN_RETRY_LIMIT` (8) times or more wants no wake at all; `wake` is the earliest such instant, or null. So an unfiled capture costs at most 8 timed retries over about 4¼ hours, and then an otherwise idle instance holds no timer (scheduler R15). It is kept, never dropped (R1 unchanged), and retried on every drain that runs for any other reason, and the drain is re-armed at its short delay (R1's) when capture enqueues an event (capture R44, as today) and when a promotion commits (`promotion.onCommitted`, its R45): only a promotion can file a capture (provenance R1, R4), so a promotion is exactly when a waiting event may have become drainable. A tick that drained something keeps today's short delay.

**Uses change:** `promotion`: `onCommitted` (its R45), registered once at start beside `registerStep`, under `tasks`, its listener arming the drain (no write).

**Constants (exported, published by name):** `TASK_DRAIN_BACKSTOP_MS` 60,000 (today's), `TASK_DRAIN_RETRY_LIMIT` 8.

Open alternatives, if you prefer: a cap on the interval instead of a stop (still a timer forever, so against R15), or a stop with no back-off (8 retries at 60 s, 8 minutes). I recommend the proposal.

Also found, for your record (my module, not fixable here alone): R1's drain reads capture's queue oldest first, at most `limit`; if `limit` or more unfiled events stand at the head, a filed event behind them is never reached (head-of-line). Fixing it needs capture R45 to read past a cursor or order by `attempts`; I list it in my record as deferred and REPORT it.
