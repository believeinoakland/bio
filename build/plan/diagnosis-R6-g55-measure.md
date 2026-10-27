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


(Copied from CALCULATIONS #9's record, `build/jobs/T51/calculations.md`, by BOB #263 at the round end: the job could not write this file, K4717.)

## Base (nothing held)
| shape | rows | wall | per row | entity lookups | facts written |
|---|---|---|---|---|---|
| mixed | 6,000 | 9.5 s (9.9 s on the G45 probe) | 1.58 ms | 6,100 | 100 |
| resolving | 3,000 | 16.8 s | 5.60 ms | 6,000 | 3,000 |
| crosswalk | 3,000 | 12.2 s | 4.08 ms | 2,950 | 2,950 |

Profile (`--cpu-prof`, `resolving`, 1,500 rows, 8.7 s total, inclusive share of samples): `ingestMoney` 92.3 %; `entityByIdentifier` 57.8 % (its `view()` 51.2 %); `recordFact` 34.2 % (its `#validate` 30.1 %, `#view` 24.9 %); `combine` (both callers) **74.4 %**. The entry's cause stands (the combine is the bulk); the mixed-table share it reports (`entityByIdentifier` 90 % of 6,000 mixed rows) is the same code with one lookup a row and no fact.

## Views held (a scratch change in a throwaway worktree: `entities.view()` and `money.#view()` memoised on the profile ids; never committed, the worktree removed)
| shape | rows | wall | per row | note |
|---|---|---|---|---|
| mixed | 6,000 | 0.16 s | 0.027 ms | an unidentified row: entry says about 0.02 ms |
| resolving | 3,000 | 1.55 s | 0.52 ms | two lookups and one fact a row; entry says 0.29 ms in Miniflare |
| resolving | 18,098 | 9.6 s | 0.53 ms | entry says 5.3 s in Miniflare |
| crosswalk | 3,000 | 2.62 s | 0.87 ms | the whole-crosswalk scan per call, 2,000 rows, 2,950 times (before the cache) |

**Where this differs from the entry:** a written row costs 0.52-0.53 ms here (node, held views) against the entry's 0.29 ms (Miniflare), so the entry's inline threshold (about 5,000 rows) would be about 2,800 on this node child (1.5 s / 0.53 ms); the crosswalk branch costs 0.87 ms a row against 0.52 for the same count through a scheme, so the per-row scan is real (1.7x), and the cache removes it. The constants for tier 2 follow the Miniflare measure of check L, not this node one; none is set yet.

#### G55 platform check L (CALCULATIONS #9, after the code; K4717)

**Check L (Miniflare/workerd, real DO SQLite and R2; probe `bio-plane/test/m/calculations/g55-L.probe.mjs`, one process at a time, this machine; the module's services are reached through private routes of a Store subclass on a stub, the door's authentication not driven; the clock is frozen in the object, so ms are the parent's wall time around each fetch; reported, never asserted).**
- Inline, all rows resolving and written: 500 rows 141 ms; 3,000 rows 432 ms; **10,000 rows 1,275 and 1,261 ms (the worst inline case, ≤ 1.5 s)**; 10,001 rows answers started in 57 ms. About 0.127 ms a written row (the entry measured 0.29 ms with the views held: money's and entities' views are now held, and calculations' cache removes the repeated lookups).
- Slices: 25,000 resolving rows: 13 ticks, each 2,000 facts in 234-292 ms (the last 1,000 in 137 ms), 3,248 ms in all, 25,000 facts; largest stored value 52,001 B. Mixed 18,098 rows (302 resolve): one tick of 200 ms judging all 18,098; largest stored 135,001 B. Mixed 100,000 rows: act 141 ms, 5 ticks of 225-260 ms (20,000 rows and about 333 facts each), 1.2 s in all, 1,667 facts. A slice of 2,000 facts plus 18,000 unwritten rows is about 0.45 s on this measure: far inside the 10 s bar. `INGEST_SLICE_ROWS` 20,000, `INGEST_SLICE_FACTS` 2,000 and `INGEST_MAX_ATTEMPTS` 3 stay as the entry sets them (pinned by test).
- A 20 MiB table through slices (BOB asked for this one): 100,000 rows of 190-character payers, 19,990,740 bytes: act 536 ms, 5 ticks of 154-204 ms, 887 ms in all, 100,000 rows listed not written, largest stored value 192,001 B. `INGEST_ROWS_MAX` stays 100,000.
- Kill between slices: `KILL=2`, the runtime disposed after tick 2 (4,000 facts) and a fresh Miniflare over the persisted store: state `ingesting`, `rows_done` 4,000, then the remaining 11 ticks finished: 25,000 facts, 25,000 distinct source rows (no duplicate).
- Not driven: the real alarm (SCHEDULER #41 is not merged), the HTTP door and a member's login. The ticks are fired by hand through the route; the scheduler job's own L covers the alarm.

**Result:** `INGEST_INLINE_ROWS` = 10,000 (worst inline case 1.26-1.28 s, under 1.5 s); `INGEST_SLICE_ROWS` 20,000, `INGEST_SLICE_FACTS` 2,000, `INGEST_MAX_ATTEMPTS` 3, `INGEST_CACHE_MAX` 10,000, `INGEST_ROWS_MAX` 100,000 (protective bounds, K1881, reported to Bob at the round end). The real alarm is the scheduler's L (SCHEDULER #41, merged K4717); the HTTP door and a member's login are the re-walk's P (G55 (5)).
