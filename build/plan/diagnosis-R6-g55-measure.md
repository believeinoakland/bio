# G45 platform check L: the money ingest through the real plane Worker and Durable Object SQLite (Miniflare/workerd)

Base: origin/tranche/T51 at 7d86a96ff3 (scratch worktree /home/user/g45-wt, node_modules symlinked, nothing committed, worktree removed after).

## Method
- File: `bio-plane/test/m/calculations/g45-L.probe.mjs` (scratch; copy kept at `/tmp/claude-0/-home-user/589324c9-39f3-5dc8-8783-b80620e56495/scratchpad/g45-L.probe.mjs`). Run: `node test/m/calculations/g45-L.probe.mjs 18098 100000 100001` (one Miniflare per size, one process at a time).
- Built on `test/m/capture-requests/plane-world.mjs` (`planeEntry()`, the plane's own door and `Store`, real DO with `useSQLite: true`, R2 CAPTURES/PUBLISHED, workerd). A scratch entry `g45-world.mjs` subclasses `Store` and adds three private routes `/__g45/profile|seed|stats`; every other request goes to the real door. Private routes are used only for what the member's browser path cannot do here: set `jurisdiction_profiles=["test-port-ellery"]` (so the `ellery_person` scheme exists), upload and file the CSV (`captureOf.uploadCapture` + `promotionOf.promote`, as the shape harness feeds), and read SQL statistics and `ingestOf` back.
- Through the real HTTP door as an enrolled member (memberadd/enroll/login): `entitycreate`+`entityidentify` (P001, P002), `contentmint`, `tabledeclare` (roles payer/payee scheme ellery_person, amount), `bindingadopt`, then `moneyingest {binding, rows:"all", reason}` (the act under test).
- Table: the G45 (a) mixed table: row i payer is P001 (resolves, written) when i%60==0, else an unidentified `U######`; payee P002; amount 1..97.
- Round trip: the client hashes `JSON.stringify(answer.written/not_written)`; the DO hashes `JSON.stringify(ingestOf(key).written/not_written)`; equal means byte-equal as JSON. `rows` compared to `"all"`.
- Wall time is the client's `Date.now()` around the HTTP call (workerd freezes time inside the object).

## Results
| | 18,098 rows | 100,000 rows | 100,001 rows |
|---|---|---|---|
| HTTP / answer | 200, `ok:true`, 2,407,347 B | 200, `ok:true`, 13,350,822 B | 200, `ok:false` `INGEST_TOO_LARGE` (rows 100001, bound_rows 100000), 280 B |
| written (money facts = `money_facts` rows) | 302 (302 facts) | 1,667 (1,667 facts) | 0 (0 facts) |
| not_written in answer | 17,796 | 98,333 | none |
| `calc_ingests` rows | 1 | 1 | 0 |
| `calc_ingest_parts` rows | 10 (all kind `not_written`) | 51 (all `not_written`) | 0 |
| max `calc_ingest_parts` row bytes | 262,144 | 262,144 | 0 |
| max `calc_ingests` column bytes | 15,518 (written_json) | 86,498 (written_json) | 0 |
| `not_written_json` column | marker `{"parts":10,"bytes":2391538,"count":17796}` | `{"parts":51,"bytes":13264033,"count":98333}` | no row |
| `ingestOf` round trip (written, not_written, rows) | all equal | all equal | n/a (no row) |
| object alive afterwards | yes (`op=table` 200 ok, stats readable) | yes | yes |
| wall time | 33.0 s | 181.6 s | 0.065 s |

Checks: the largest bound value anywhere is 262,144 B, against the real platform bound 2,098,176 B (and the 1 MiB practice). 100,001 wrote no fact, no ingest row, no part.

## Findings
- No failure. Nothing threw inside workerd's real DO SQLite at either size; the real bound was never reached.
- Time is the cost, not storage: 18,098 rows take 33 s and 100,000 rows 182 s of wall time through the door (about 1.8 ms a row, mostly per-row resolve and `money.recordFact`; the 100,000 case also returns a 13.3 MB body). Local workerd under Miniflare enforces neither production's CPU limit nor the 128 MB memory cap, so this check does NOT show the 100,000-row act survives those; the 128 MB peak was measured only in the capped node child (K4687's measure). R-CLOCK applies: not asserted by time.
- The chunk is 262,144 B for the ASCII data used, as the constants intend (256 Ki characters); non-ASCII/pair-at-edge is covered by the job's own preload tests, not re-run here.
- Environment notes: `jurisdiction_profiles` had to be set for `ellery_person` (UNKNOWN_SCHEME otherwise); that is a test setup need, not a defect.

#### G55 step 0: re-measure (CALCULATIONS #9; appended before any change)

Base: `tranche/T51` merged into `job/T51/calculations` at 69bd2b3453 (providers ENTITIES #20 and MONEY #8 not yet merged: `viewBuilds` does not exist). One machine (this session's container, node v26.10.0, 4 CPUs, nothing else running), **node child capped at `--max-old-space-size=82` (the plane's headroom, as G45), `node:sqlite` in memory through the fixture world, NOT Miniflare/workerd**: the Miniflare figures belong to platform check L (step 6 of the START), run after the code. Every run is one process.
Harness: `bio-plane/test/m/calculations/g55.probe.mjs ROWS MODE` (extends `g45.probe.mjs`; prints work counts beside the wall time; no time is asserted anywhere, R-CLOCK). Command: `node --expose-gc --max-old-space-size=82 --import ./bio-plane/test/platform-sqlite.mjs bio-plane/test/m/calculations/g55.probe.mjs ROWS MODE`.
Shapes: `mixed` = G45 (a)'s table (one row in 60 resolves and is written, the rest unidentified payers); `resolving` = every row resolves and is written (payer P001, payee P002); `crosswalk` = payer resolved through a captured 2,000-vendor crosswalk (50 distinct payers in the rows, one row in 60 unknown), payee through the scheme.

