# events (T37)

**Status** · session_01DWZn96yS9yBWvB4GvqMSf6 · depth 2 · COMPLETE · handled B1

## Completion (EVENTS #5)

**Entry applied.** T37-11 (N760; K2119, K2127): a hub's vote events are read in pages, not node by node. `owner.mjs` now reads the owner's answer for many nodes at once (`answersFor`, `liveSets`, `builder`). Each node keeps its own candidates, order, hub judgement and page. The queries take the nodes' ids `IN (…)` in slices of 400, and times, governing attestations, attestation rows, event kinds and resolution grades are read in bulk across the batch. When a page is answered, the events it names are kept as one batch. The first of them that a walk asks is answered together with the whole batch, and each answer is kept. A set longer than one page (a hub's 4,000 votes) is read once for all its pages.

What is kept lives on the Events instance (`#kept`, through the kernel's `kept()`). It is used only outside any transaction: record-core R66's `afterCommit` runs at once only there, so a read whose rows may yet be rolled back keeps nothing. It is emptied whenever SQLite's `total_changes()` on the store's connection has moved, which covers any module's write. It is also emptied past 20,000 answers and waiting entries. Every answer is handed out as a `structuredClone`, so a caller's change to it is never kept. The cache key is the node, the kinds, `at`, the viewer, the profile's zone and the page.

I checked under Miniflare/workerd that a SQLite-backed Durable Object answers `SELECT total_changes()`: 0, then 1 after an insert. If the store cannot answer it, nothing is kept and every read is computed as before. No requirement text changed: R35 and K2119's page rule hold.

**Timing at the 4,000-vote shape.**
- **Explore's M-X1a through events' real owner** (`test/m/explore/mx1a-events.test.mjs`, unchanged):
  - Before: 5,276 ms on this machine (EXPLORE #3 measured 8,089–8,507 ms on its own).
  - After: 837 ms and 877 ms in two runs. At 4,001 votes it answers in 434 and 423 ms (two runs), still a hub for `event_voted`.
  - Profile before the change: 4,001 vote-node calls took 3,301 ms (0.83 ms a node) and the member's four pages took 1,126 ms.
- **New test `pages.test.mjs`** (a member with 4,000 votes, each with a second voter, every tenth within a meeting): the four pages took 312–320 ms, and the pages plus all 4,000 vote nodes asked one at a time took 721–763 ms. The test asserts a bound of a quarter of the 10,000 ms budget.

**Tests (R35, R40, R10), `test/m/events/pages.test.mjs`.**
1. **The 4,000-vote shape.** Every page and every one of the 4,000 vote answers is deep-equal to the answer for that node computed alone. The reference is the same read inside `record.transact`, where nothing is kept.
2. **Invalidation.**
   - Identical calls give identical answers, and a caller's mutation of its answer is not kept.
   - A new relation shows at once.
   - A read inside a transaction that is rolled back keeps nothing.
   - Sight withdrawn by a raw delete in membership's `project_participants` shows at once, and the viewer is part of the key.
   - A stale `when_cache` fails closed at once.
   - At the end, every node's kept answer equals its alone answer.

Two mutations were each caught by test 2: ignoring the change stamp, and keeping inside a transaction.

**Test and check results.**
- **events, explore and connection-grammar together:** 128 pass, 0 fail.
- **Whole module suite (`test/m/**`):** 8,784 tests, 8,711 pass, 60 fail. All 60 are in 11 files outside events and its users' owner path: affordances/plane (27), affordances/t36-backing (1), affordances/t36 (1), capture-requests/plane (5), host-governor/ops (9), op-declarations/t34 (3), plane/release (2), plane/worker (1), progressions/order (1), scheduler/plane (5), setup-page/worker-page (5). The same 60 fail on the base with my change stashed: inherited, none mine.
- **Process checks:**
  - format: 136 modules, 0 failures.
  - architecture: 19 product files, 0 failures.
  - coverage: 49 of 49 live requirement ids, 0 failures.
  - ownership against `tranche/T37`: 0 failures.

**Reading set (mechanics §17).** BOB's measure was 498 KB. Mine was: own requirements 36 KB, code and tests about 280 KB, plus the used services' public parts. That is over 300 KB, so I followed (3).
- **Read whole myself:** `build/requirements/events.md`; `owner.mjs`; `index.mjs`; `owner.test.mjs`; `test/m/explore/mx1a-events.test.mjs`; connection-grammar's public part; record-core's `transact`, `afterCommit` and `readDerived`; civil-time's `validAt` header.
- **Not read:** layer 5's row of `build/layers.md`. The change adds no edge.
- **Read by a worker, whole:** the other 6 source files and the other 10 test files. Its summary is about 2,600 words, citing file:line. It covers:
  - every caller of `neighbours` (only `uses.test.mjs:149`, R45's facet)
  - every write path (all through the one SQL connection, `withdrawUse` outside a transaction)
  - the schema and its indexes
  - the fixture's store and transactions
  - the tests that re-read after a write
  - the non-SQL inputs: the view (in the key through its zone; vote values do not reach owner answers) and the clock (not read by the owner)

Nothing it left out mattered. One risk it named stays: a raw `storage.transactionSync` that bypasses record-core is not seen as a transaction. Every module writes through `record.transact`.

**Deferred.** None.

**Other modules.** Nothing found.

**Suggestion (BOB's to take or not).** Proposed for events' T37 Suggestions: "(T37-11) A walk's per-node reads of a hub's votes are answered from the hub's pages: M-X1a through the real owner ~0.85 s of 10 s at 4,000 votes (was 8.1–8.5 s)."

Size (session_01DWZn96yS9yBWvB4GvqMSf6): test runs 14, module lines 2607
