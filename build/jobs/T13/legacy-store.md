# legacy-store (T13)

**Status** · session_01L19DRu2cbWBiRXm4jADFGU · depth 2 · WORKING · handled B0

## Progress

- N328, bias half: done. `#counts` spreads bias's `counts(hid)` (its R42) in place of counting `bias_statements` and `bias_adoptions` by name; the keys and their subtraction are unchanged. Bias's five tables, dead in legacy-store's purge declaration (filtered out by `BIAS_TABLES`), removed with the filter and the import. Improvement: `#counts` asks retrieval's and run-productions' `counts(hid)` once per answer, not once per key (3 and 2 calls before).
- N328, `tasks` half: J1 (QUESTION) open; the `TASK` row and the `tasks` read stay until answered.
- `test/m/` whole (from `bio-plane/`, `node --test test/m/`): 2,744 tests, 2,722 pass, 0 fail, 22 todo.
- Old battery, the suites reading these counts: purge 14/0, project-sight 255/0, mint-ledger 26/0; bias 137/1: the one red is its `CORPUS PRINTED` blindness floor, `store.mjs` >= 222,052 characters, now 221,831 (this change's -221). legacy-tests' to re-pin.
- Checks: format 0 failures; architecture 3 (legacy-store importing queue twice and affordances, all before this job); coverage 0 of 0 (no requirements file); ownership 0 failures.
- Grep of `civicos-ui/` and affordances for `biasStatements`, `biasAdoptions`, `BIAS_TABLES`: no hits.
- Next: apply BOB's answer to J1, re-run steps 5–7.

## J1 · QUESTION

N328's `tasks` half: my best reading, and what blocks the rest. The bias half is done (`#counts` spreads bias `counts(hid)`; bias's five dead purge entries and the `BIAS_TABLES` filter go).

(1) `#MINT_LEDGER_LIVE`'s `TASK` row. Not blocked by the order: review already seeds its own ids at start (`seedLedger`, record-core R40's `seedMintLedger`), and `mint-ledger.test.mjs` reads every module's `seedMintLedger([...])` literal. Best reading: queue seeds `["TASK", "tasks", "id"]` itself, at start and before its first mint (review's shape), and legacy-store drops its row. That needs a queue requirement and queue's T13 job (layer 11, after me). Dropping the row before queue seeds leaves TASK unseeded on the tranche, so I hold the drop until you say queue's job carries the seed; then I drop it (one line) in this job or a CHANGE.

(2) `#counts`' `tasks: n("tasks", "refers_to")` (op=stats and purge's proof). Blocked by the order: legacy-store (10) may not call queue (11). Options, none mine alone:
  (a) record-core gains a counts registration beside `declarePurge` (a module registers `counts(hid)` once at start; `#counts` spreads every registered one). General: it also serves the next extractions. Needs a record-core requirement and job (not in T13).
  (b) queue provides `counts(hid)` → `{tasks}` (as bias R42) and legacy-store reads it through its existing `queueOf` import. Adds to the known architecture failure (legacy-store's queue imports, 3 today): I would not choose it.
  (c) The read stays by name until op=stats moves up with the store's door (N333, control-plane, top layer), which can read queue's `counts(hid)` directly.
Best reading: (c) for T13, with queue's `counts(hid)` worded now so N333 (or a later control-plane job) reads it, and (a) worded for next if you want the general form. Until you answer, the `tasks` read stays as it is and I carry on with tests and checks.
