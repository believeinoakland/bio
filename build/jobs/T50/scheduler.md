# scheduler (T50)

**Status** · session_011e6LGoZKTChEgaMdrAaQUm · depth 1 · WORKING · handled B1

## Completion

- **Entry applied:** T50-16 · R27. A consumer registered through R8 whose `wake`, read after its tick (also after a throw), equals the `wake` read before it and is at or before the firing's `now` is held: its due and wake read as none, so it cannot keep the alarm firing at once. Released when its own `wake` changes, at an `arm` made outside a firing, and at a start. Held in memory only (no table, no interval; R7, R18). `due`, `wake` and `tick` of any consumer are now awaited in the firing and the reconcile; `question-explore`'s wrapper awaits `exploreDue`, `exploreWake` and `exploreTick` (question-explorer R17), a rejected one being that tick's `{error}`.
- **Deferred:** none. This module's own consumers are not held by R27 (`deadline-recheck`, `scheduled-publish` keep their own rules); a registered `task-drain` or `queue-renotify` whose tick makes no progress is held, as the hold intends (an owner that starves is changed, not the hold, K3635).
- **Other modules:** nothing found. No sentence of outward text was added (no setup-words key needed).
- **Tests:** `bio-plane/test/m/scheduler/` 129 pass, 0 fail before the new file; `held.test.mjs` (new, 6 tests naming R27 with controls) 6 pass; user suites run (plane t33, t39, t41, sweep; tasks inbox; instance-setup identity): 75 pass, 0 fail.
- **Checks:** format 0 failures; architecture 0 failures; coverage 27 of 27 ids named, 0 failures.

Size (session_011e6LGoZKTChEgaMdrAaQUm): test runs 6, module lines 795
