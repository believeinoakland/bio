# steps (T44)

**Status** · session_01DFB5ozwU2VhpMC9hsjyxyD · depth 2 · RUNNING until 2026-10-11T15:30:35Z (users' tests (ai-runs … plane)) · handled B1

## Completion (T44-6)

**Entry applied** (N873, K2726; R23's T44 clause; K874):
- Each `later_found` entry now keeps and answers `looked_at`: the look's own instant (its `observation-log` `look` row's `at`, handed in as `earlier.at` by R37), beside `at`, the arrival's. Both `step()`'s `later_found` (R4) and `laterFound()` (for `notice-producers`) answer it.
- A store made before T44 gains the `looked_at` column at start. Each older entry is filled from its look's row through `observation-log` R29's read contract (`seq`, `at`). An entry whose look the log no longer holds answers `looked_at: null`, never the arrival's instant.

**My own code and tests read whole** (P20, K2730): `index.mjs`, `schema.mjs`, `checks.mjs` and every file under `test/m/steps/`. Two flaws found and fixed:
1. `laterFound` compared its `at` with each entry's `at` as strings. `…:00Z` sorts after `…:00.000Z`, so an entry logged in the same second as an `at` spelled with milliseconds was held back. It now compares instants (`record-core` R48's `instantOrder`).
2. `laterFound` read at most 5,000 entries and said nothing past them. The bound is now `LATER_FOUND_SCAN`, exported, and the answer carries `truncated`.

No other flaw found. Nothing deferred.

**Reading set** (mechanics §17; 584 KB at the START, under 600 KB, K2700): read whole, myself. That is my requirements, code and tests; the public parts of all fifteen modules in my Uses (record-grammar, jurisdictions, civil-time, calc-grammar, connection-grammar, record-core, membership, promotion, provenance, extraction, content, entities, connections, observation-log, leg-earning); layer 6's contract and sections in `build/layers.md`; my plan entry; K2725, K2726; and `notice-producers` T43 J3.

**Found in other modules:** none. `notice-producers` already reads `looked_at` when present (its T43 J1 (4)), so it needs no change. Generated artifacts: only the plane bundle includes this module; it is staled as every merge stales it (rule 4 (5)) and regenerated at the layer's close.

**Tests and checks:**
- steps `node --test bio-plane/test/m/steps/`: 38 pass, 0 fail (was 35). New: R23 (T44) `looked_at` with its negative control (the look on 2 March, the arrival in October; `looked_at` equals the look's `at` and differs from the entry's `at`, for every one told, and per look); the start-time fill of an older store, including an entry whose look is gone; `at` compared as an instant, and `truncated`.
- Users (each module whose `uses` names steps):
  - `notice-producers`: 92 pass, 3 fail. The 3 are rule 4 (6)'s inherited reds (`accounts.test.mjs`:95, 121, `words.test.mjs`:22), the same before my change.
  - `affordances`: 231 pass, 2 fail (rule 4 (6): `t36.test.mjs`:54, 93).
  - `op-declarations`: 132 pass, 1 fail (rule 4 (6): `t34.test.mjs`:148).
  - The rest are green: ai-runs 81, run-productions 58, capture-requests 108, question-explorer 28, investigation 32, answer-envelope 31, control-plane 223, plane 190 and `migrate-released` 1, each 0 fail.
- `format`: 147 modules, 0 failures. `architecture steps`: 0 failures. `coverage steps`: 27 of 27, 0 failures. `ownership steps tranche/T44`: 4 files, 0 failures.

Size (session_01DFB5ozwU2VhpMC9hsjyxyD): test runs 18, module lines 1651
