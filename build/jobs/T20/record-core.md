# record-core (T20)

**Status** · session_01NEdggWzA6wen9mWzAPWE6z · depth 2 · WORKING · handled B0

## J1 · QUESTION

Re-scan done (P4): `registerLegacyGrammars` has no caller outside its own definition and its test; I am deleting both.

QUESTION on R74's `refs`. `refs` is `connections`' table (`src/connections/schema.mjs`:11, declared to purge by connections, layer 5). R74 puts its count in my share, but R31 says every service of this module "reads and writes only this module's own tables and the system clock" (purge and the R40 seed excepted), and a layer-2 module counting a layer-5 table reads ahead of the order (P4).

My best reading, which I am building now: R74 is the specific, later clause and wins for this one export: `refs` stays in record-core's figure source exactly as plane's held copy counts it (on `bundle_id` and `target_id`, `COALESCE(k, '')`), answered null (R63's rule) when no `refs` table exists. I add nothing else that reads another module's table.

Alternative, if you prefer: `refs` leaves R74 and `connections` exports its own figure (its table, its R63 registration), and record-core's export is `bundles`, `files`, `history` only. Then R31 needs no exception. Say which, and if the first, whether R31 should be re-worded to name R74's read.
