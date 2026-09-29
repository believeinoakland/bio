# legacy-store (T13)

**Status** · session_01L19DRu2cbWBiRXm4jADFGU · depth 2 · WORKING · handled B0

## J1 · QUESTION

N328's `tasks` half: my best reading, and what blocks the rest. The bias half is done (`#counts` spreads bias `counts(hid)`; bias's five dead purge entries and the `BIAS_TABLES` filter go).

(1) `#MINT_LEDGER_LIVE`'s `TASK` row. Not blocked by the order: review already seeds its own ids at start (`seedLedger`, record-core R40's `seedMintLedger`), and `mint-ledger.test.mjs` reads every module's `seedMintLedger([...])` literal. Best reading: queue seeds `["TASK", "tasks", "id"]` itself, at start and before its first mint (review's shape), and legacy-store drops its row. That needs a queue requirement and queue's T13 job (layer 11, after me). Dropping the row before queue seeds leaves TASK unseeded on the tranche, so I hold the drop until you say queue's job carries the seed; then I drop it (one line) in this job or a CHANGE.

(2) `#counts`' `tasks: n("tasks", "refers_to")` (op=stats and purge's proof). Blocked by the order: legacy-store (10) may not call queue (11). Options, none mine alone:
  (a) record-core gains a counts registration beside `declarePurge` (a module registers `counts(hid)` once at start; `#counts` spreads every registered one). General: it also serves the next extractions. Needs a record-core requirement and job (not in T13).
  (b) queue provides `counts(hid)` → `{tasks}` (as bias R42) and legacy-store reads it through its existing `queueOf` import. Adds to the known architecture failure (legacy-store's queue imports, 3 today): I would not choose it.
  (c) The read stays by name until op=stats moves up with the store's door (N333, control-plane, top layer), which can read queue's `counts(hid)` directly.
Best reading: (c) for T13, with queue's `counts(hid)` worded now so N333 (or a later control-plane job) reads it, and (a) worded for next if you want the general form. Until you answer, the `tasks` read stays as it is and I carry on with tests and checks.
