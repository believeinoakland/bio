# tasks (T35)

**Status** · session_01GjWmHDbf99UFct9bbB4QiK · depth 2 · COMPLETE · handled B3

## Completion (T35-77; R18)

**Entries applied.**
- **T35-77** (K1951, K1974; R1 and the Uses line's capture R45 bullet): the drain, its `remaining`, the inbox's `queued` count and the `task-drain` consumer's wait count pass `kind: "authority-undetermined"` to capture's `taskEvents`/`taskEventCount` (the one kind is `TASK_EVENT_KIND`, `checks.mjs`, which the grammar's kind list now reads too). An `archive-unpack` event is never taken, routed, folded, refused, attempted, removed or counted. Test: "R1 (T35; K1951, K1974) …", with a negative control (the filter removed, the test fails).
- **R18** (B1's finding, SCHEDULER #29 J1 (2), K2029; proposed J1, adopted K2038): after a tick that drained nothing, `wake` is the earliest instant a waiting event of R1's batch is next due, `lastTry` + `TASK_DRAIN_BACKSTOP_MS` × 2^(a−1) from capture's durable `attempts`; an event tried `TASK_DRAIN_RETRY_LIMIT` (8) times wants no wake, so an idle instance holds no timer after about 4¼ h of retries (1, 2, 4 … 64 min). The drain is re-armed at its short delay by capture's task notice (as before) and by `promotion.onCommitted` (registered at start under `tasks`, beside `registerStep`). Both constants exported by name. Reading: an event never tried by a drain (`attempts` 0) is due at the plain backstop from now.
- **Flaw fixed in my module:** an event the mint could not take (`MINT_EXHAUSTED`, R1) was never counted as a try, so it would have kept the 60 s backstop forever outside R18; it is now counted (`taskEventAttempt`), its `waiting` entry showing the attempt.

**Deferred.** Head-of-line in R1's drain: capture's queue is read oldest first, at most `limit`, so `limit` or more unfiled events at the head keep a filed event behind them from being reached. Needs capture R45 to read past a cursor or by attempts: N740 (T36), as BOB recorded (B3).

**Found in other modules (REPORT J3).** Generated artifact: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) embeds `tasks`, so this job stales it; regenerated at L11's close (§14).

**Tests and checks.**
- `node --test bio-plane/test/m/tasks/`: 98 pass, 0 fail, 0 skipped (was 95; three new tests: R1's kind, R18's back-off, R18's commit re-arm).
- Users of `tasks` (my start now registers one more listener): `queue` 127/0; `control-plane` 178/4, `plane` 107/8, `op-declarations` 81/3: the failing tests are the same set, by name, as on the tree with my change stashed (inherited reds, none mine).
- Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 133 modules, 0 failures. `architecture.mjs tasks`: 9 files, 36 imports, 0 failures. `coverage.mjs tasks`: 18 of 18, 0 failures. `ownership.mjs tasks tranche/T35`: 5 files, 0 failures.

Size (session_01GjWmHDbf99UFct9bbB4QiK): test runs 20, module lines 1416


## J1 · QUESTION

The bound for B1's finding (SCHEDULER #29 J1 (2), K2029: an unfiled capture keeps an idle instance's alarm firing every 60 s). My proposal, which I am building now on this reading; tell me if you word it otherwise.

**Proposed R18 (tasks), "the drain's wake is bounded":** After a `task-drain` tick that drained nothing, the consumer's `wake` is set from the waiting events the drain reads (R1's batch, kind `authority-undetermined`), from capture's own durable `attempts` and `lastTry` (capture R45): an event tried `a` times is next due at `lastTry` + `TASK_DRAIN_BACKSTOP_MS` × 2^(a−1) (1 min, 2, 4, … ), and an event tried `TASK_DRAIN_RETRY_LIMIT` (8) times or more wants no wake at all; `wake` is the earliest such instant, or null. So an unfiled capture costs at most 8 timed retries over about 4¼ hours, and then an otherwise idle instance holds no timer (scheduler R15). It is kept, never dropped (R1 unchanged), and retried on every drain that runs for any other reason, and the drain is re-armed at its short delay (R1's) when capture enqueues an event (capture R44, as today) and when a promotion commits (`promotion.onCommitted`, its R45): only a promotion can file a capture (provenance R1, R4), so a promotion is exactly when a waiting event may have become drainable. A tick that drained something keeps today's short delay.

**Uses change:** `promotion`: `onCommitted` (its R45), registered once at start beside `registerStep`, under `tasks`, its listener arming the drain (no write).

**Constants (exported, published by name):** `TASK_DRAIN_BACKSTOP_MS` 60,000 (today's), `TASK_DRAIN_RETRY_LIMIT` 8.

Open alternatives, if you prefer: a cap on the interval instead of a stop (still a timer forever, so against R15), or a stop with no back-off (8 retries at 60 s, 8 minutes). I recommend the proposal.

Also found, for your record (my module, not fixable here alone): R1's drain reads capture's queue oldest first, at most `limit`; if `limit` or more unfiled events stand at the head, a filed event behind them is never reached (head-of-line). Fixing it needs capture R45 to read past a cursor or order by `attempts`; I list it in my record as deferred and REPORT it.

## J2 · REPORT

Generated artifact made stale: the plane bundle (bio-plane/dist/bio-plane.bundled.mjs) embeds tasks, changed by T35-77 and R18; for L11's close regeneration (§14). Nothing else outside tasks.

## J3 · COMPLETE

T35-77 applied (drain and counts ask only authority-undetermined; tested with a negative control) and R18 built as K2038 worded it (back-off from capture's attempts, no wake at 8 tries, re-armed by enqueue and promotion.onCommitted; constants exported). Also fixed: a MINT_EXHAUSTED try is now counted, so R18 bounds it. Deferred: head-of-line, N740. tasks 98/0; users' failures identical to baseline; format, architecture, coverage (18/18), ownership (5 files): 0 failures. Record: Completion (T35-77; R18).
