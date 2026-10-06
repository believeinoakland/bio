# calculations (T33)

**Status** · session_01J7MbcN7jruhwCaMiQMNKVG · depth 2 · WORKING · handled B1

## J1 · QUESTION

The money ingest writer (calculations R14 → money R1, R2, R4) needs one shape both jobs agree on, and neither requirement fixes it: what a machine-written money fact names as its `source` when that source is a row of a canonical table, and what its `by` is.

My best reading, which I am building to unless you answer otherwise:
- `source` is `{table: <the table's canonical sha256>, row: <0-based data row>, binding: <the adopted binding's key>}`, money's "a canonical table's row as a derived view of captured bytes"; money checks the binding is adopted through a read I provide, `calculations.bindingOf(key)` → `{adopted, table, roles}` or null (money R4: "only from a table binding a member adopted").
- `by` is `class:daemon` (DEC-52, the machine's stamp); the requesting member is recorded on my side, in the ingest row, with the binding and the rows asked for.
- The parties are `{entity, as_written}`, `entity` the `ENT-` id the row's payer/payee value resolved to through the role's id space (`entities.entityByIdentifier`) or its captured crosswalk.

If money's job has already settled another shape, tell me and I will follow it. Nothing else in my job waits on this answer.
