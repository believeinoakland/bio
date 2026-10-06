# record-core (T34)

**Status** · session_01PUSin6MoPzixDUECYoN6b8 · depth 2 · COMPLETE · handled B1

## Completion (RECORD-CORE #17)

**Entry applied: T34-9** (N554, N593; K1545, K1632, K1728; R62, R76, R77 amended, R80 new, BOB's wording).
- **`CALC` minted opaque (R76, R62; K1728, K1732).** `allocId` and `allocIdOp` already mint by `ID_TABLE`'s `form` alone. So `CALC` now gets a 16-character opaque tail, even though its row also carries `legacy: "sequential"`. Its `CALC-<year>` counter is never read or stepped. The sequential `CALC` ids minted before stay held and readable (`idPattern`). `mintExhausted` now has a fixed sentence for `CALC` ("calculation"). The K1732 reds in `t33.test.mjs` (R76's opaque set, R62's sentences) are updated to the requirements as now worded, and a test was added for `CALC`'s legacy row.
- **R77 `from` (N593).** `declareTable` keeps a derived-rebuildable table's `from`, the stored tables its rows are rebuilt from, as it was given (frozen). `declaredTables()` answers it as a fresh list. An entry declared without `from`, or with `null`, answers `from: null`. A stored table answers no `from`. A `from` that is not a non-empty list of plain table names is refused `TABLE_NAME_INVALID`.
- **R80 (N554, DEC-49).** `TABLE_NAME_INVALID` and `TABLE_DECLARED` now answer through `rowRefusal`: `{ok, reason, code, check, translation, detail, table, module}`. `TABLE_DECLARED` also keeps `declaredBy`. `detail` is one sentence that names the table and ends "nothing was declared." Both `declareTable` and `declarePurge` answer this way. The rows are new in `checks.mjs`, beside C-102.21 and C-102.22, with `where` `src/record-core/index.mjs #declare > is-table-declaration`.
- **Improvement in my own module.** A table name that is not a string (an entry with no `name`, which used to be declared as `"undefined"`) is now refused `TABLE_NAME_INVALID`. The `keys`, `clears` and `key` columns must be strings too; before, they were stringified.

**Final row ids (for promotion's stamp, T34-12):** C-102.26 `TABLE_NAME_INVALID` and C-102.27 `TABLE_DECLARED`. Both are awaiting stamp.

**Deferred.** Rows for `ANONYMOUS_LEASE` and the `SETTING_*` refusals, carried over from T33. They are not in T34-9. Giving them rows changes shapes that other modules' callers may pin, so it needs its own entry.

**Found in other modules** (in the REPORT inside COMPLETE):
1. Accepted reds (plan Rules 5.2), now red from this branch, as expected: case-carriage R6 (`invariants.test.mjs`) and corpus-export R4. Both `deepEqual` the old row-less `TABLE_DECLARED` shape. They are fixed by T34-43 and T34-42 in L8.
2. Stale generated artifacts: `bio-plane/src/case-checker/program.mjs` and `bio-plane/dist/bio-plane.bundled.mjs`, which both bundle record-core. They are BOB's to regenerate at the layer close.
3. `test/system/row-census.test.mjs` R50 lists C-102.26 and C-102.27 as "arrived with no record" beside the earlier named red (promotion's). Promotion's `AWAITING_STAMP` list takes them in T34-12.

**Tests and checks**
- `node --test bio-plane/test/m/record-core/`: 131 pass, 0 fail (on the tranche before this job: 2 fail, the K1732 reds). `bio-plane/test/stats-disclosure.test.mjs`: 36 pass, 0 fail.
- The tests of all 77 modules that use record-core, plus record-core's own, run on this branch and on `tranche/T34` @ 04bd58ab0c: this branch 5697 pass, 30 fail; the tranche 5692 pass, 30 fail. The only differences are record-core (2 fail → 0) and case-carriage R6 and corpus-export R4 (each 0 → 1, item 1). The other 28 fails are red on the tranche too, all among the named inherited reds: promotion ×2, provenance, acquisition ×2, extraction ×6, entities ×2, events ×3, calculations ×2, workbooks, run-productions, capture-requests ×4, monitoring, following, scheduler, control-plane.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … record-core`: 0 failures. `checks/coverage.mjs … record-core`: 80 of 80 live ids named, 0 failures. `checks/ownership.mjs … record-core tranche/T34`: 0 failures.
- Final `uses`: record-grammar, id-spaces, test-support. Unchanged.

Size (session_01PUSin6MoPzixDUECYoN6b8): test runs 9, module lines 2251
