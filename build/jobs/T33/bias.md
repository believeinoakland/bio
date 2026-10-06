# bias (T33)

**Status** · session_01UoYr2kGcT4PB5AXrdUSnAZ · depth 2 · COMPLETE · handled B1

## Completion (BIAS #9, T33-38)

**Entries applied.**
- T33-38 / S0-9, R3: C-26.2 now reads a subject registry key through `record-grammar`'s `idPattern("ENT")` (`ID_TABLE`; sequential, no four-digit ceiling). The module's own copy of the pattern (`/^ENT-\d{4}-\d{4}$/`) is gone; the finding's message and the schema comment no longer spell `ENT-YYYY-NNNN`.
- T33-38 / B0.6, R47 (plan Rules (6)): the five tables are declared explicitly through `record-core.declareTable` (`BIAS_TABLE_DECLARATIONS`, exported from `index.mjs`), replacing `declarePurge`. R30's purge is unchanged: `bias_statements` keyed by `bundle_id`, `bias_adoptions` by `bundle_id` and `scope_id`, both `sight: "bundle"`; `bias_debts` and `bias_debt_settlements` whole-store (`keys: []`), `bias_debt_sweeps` `purge: "exempt"`, all three `sight: "group"`; every other class as the default form gave it (`expunge: "none"`, `export: "admin-only"`, `derive: "stored"`, `version_chain: false`).

**Tests.** R3's test widened (the new key form both ways, and the module's verdict equal to `idPattern("ENT")`'s on every subject tried); new R47 test over `record.declaredTables()` and the `TABLE_DECLARED` refusal. R30's purge test passes unchanged.
- `node --test bio-plane/test/m/bias/`: tests 58, pass 57, fail 0, todo 1 (R26, deferred by K102).
- No layer tests are named in `build/manifest.md`; no provided service changed, so no user's tests are owed.

**Checks** (from `civicos-process`):
- `format.mjs`: 126 modules, 125 requirements files; 0 failures
- `architecture.mjs … bias`: 11 product files, 40 relative imports; 0 failures
- `coverage.mjs … bias`: 47 of 47 live requirement ids named by a test; 0 failures
- `ownership.mjs … bias tranche/T33`: 6 files changed by bias; 0 failures

**For BOB.** R3's and R47's `*(not yet met: T33-38)*` marks in `build/requirements/bias.md` can be struck (BOB's file). Final `uses` unchanged: record-grammar, record-core, membership, promotion, entities, credentials. Nothing deferred; nothing found in another module.

Size (session_01UoYr2kGcT4PB5AXrdUSnAZ): test runs 1, module lines 1859
