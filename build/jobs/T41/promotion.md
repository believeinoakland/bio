# promotion (T41)

**Status** · session_0126JXzoUNxJ6PKnFaGmmabB · depth 2 · COMPLETE · handled B4

## J1 · REPORT

Started and ready to stamp (T41-6). Census of `tranche/T41` @ 3d39f0c2a1 (merged into my branch): 1567 rows, `956799df…` against the 1.67.0 pin of 1566 (`d3f742b5…`); exactly B1's two L1 rows: C-33.54 ACCEPT_MUST_REAUTHOR arrived (record-grammar), C-35.13 TEXT_CHAIN_LETTER_UNCALIBRATED changed (text-chain's translation, K2428); nothing departed. row-census 7 pass 1 fail, naming only those two. Holding the stamp (1.67.0 → 1.68.0, ROW_CENSUS re-pin, fixture row-census-1.68.0.jsonl) until you tell me record-core, membership, project-roster and credentials are merged, as B1 says.

## J2 · REPORT

While waiting, in my own module (96d1aaecbe, pushed): R18's whole-write-path suite (write-path.test.mjs) now probes PROMOTION_CHECKS' 13 rows too (34 rows met by name, was 21; negative control: a broken probe fails it); refusal() no longer throws (→ PROMOTE_FAILED) on a code no row family holds, answering by reason without check/translation (the Errors bullet); comments and two test titles cited R20 for the unnumbered Errors bullet, now say Errors. Promotion + d526: 125 tests, 124 pass; the 1 red is registry R39/R45/R46 MODULE_ORDER, accepted red 5 until membership merges. For your wording (no action needed from me): R12 states no replay exemption, but the code exempts a replay from ENVELOPE_DATES_DISAGREE (index.mjs, inside `if (!replay)`), as R9 exempts type/title/state. Suggest R12 say 'A replay is exempt from this refusal, as R9's are.' Still holding the stamp for your word on L2's merges.

## Completion

**Entry applied (T41-6; T40's and T41's rule 4 item 2; K2426, K2428, K2431, K2435, K2439, K2441, K2442, K2444, K2445).** The stamp, **1.67.0 → 1.68.0 (MINOR)**, taken over `tranche/T41` after record-core, membership, project-roster and credentials merged (B4), merged into this branch. `ROW_CENSUS` is **1567 rows, `8c92f849fed9dd1e00dfc8ee1cd3165a442bd6479dd81f3f7981e656e2e57cbb`**, on stamp commit `f350e71780`. The fixture was renamed `row-census-1.67.0.jsonl` → `row-census-1.68.0.jsonl` and rewritten by `censusOf`; I diffed it line by line against 1.67.0's. Every row is one B1/B3/B4 names:
- 1 new: record-grammar C-33.54 ACCEPT_MUST_REAUTHOR (`SHARED_ACT_CHECKS`).
- 13 changed, translation only (code, number, `where` unmoved):
  - text-chain C-35.13;
  - membership C-70.1, C-96.48, C-96.49, C-96.51;
  - credentials C-29.21, C-29.34–.39.
- None departed. T40's layers 3–11 moved no row; record-core's and project-roster's T41 jobs moved none.
- `gate.mjs`'s 1.68.0 note also records that `MODULE_ORDER` gains the five new modules, none registering a gate step (none of their `src/` exists yet), so no gate's order moves.
- The census suite's header and its two declaration lists are re-anchored at 1.68.0. None is open.

**Improvements in this module (J2, B2):**
- `write-path.test.mjs` (R18) now probes `PROMOTION_CHECKS`' 13 rows through the whole write path (34 rows met by name, was 21); negative control: a broken probe fails it (96d1aaecbe).
- `refusal()` answers a code no row family holds by its reason, without check and translation, instead of throwing into `PROMOTE_FAILED` (the Errors bullet).
- Comments and two test titles cited R20 for the unnumbered Errors bullet; now "Errors".
- R12's test meets its replay exemption, worded by BOB from my report (K2439; d12925f590).

**Deferred:** none.

**Found in other modules (BOB's):**
- `build/modules.json`: swap promotion's `tests` entry `row-census-1.67.0.jsonl` → `row-census-1.68.0.jsonl`. Until then `format` and `ownership` each show exactly this one failure.
- §14, stale generated artifacts: `bio-plane/src/case-checker/program.mjs` and the plane bundle embed 1.67.0 and the old census. Regenerate both at L2's close.
- answer-envelope's pin of C-35.13 (T41-60, K2428) and any other suite pinning the 13 changed translations stay their owners'.

**Reading (mechanics §17).** The set measured over 300 KB (code and tests about 570 KB without the fixture), so I followed B1's (3).
- Read whole myself: my requirements; `layers.md` layer 2's row; the plan's rule 4 and T41-6; K2426, K2431, K2435; my T40 record; the files this entry changes (`gate.mjs`, `row-census.mjs`, `row-census.test.mjs`); each used module's Purpose and the services my Uses names (record-core's `transact`, `commit`, `mintOpaqueId`, `mintExhausted`, `bundleInfo`, `readImage`; membership's `viewerPredicate`, `notAParticipant`, `noSuchProject`, `existenceAct`, `participation`, `listenerRefusal`, `MODULE_ORDER`; signatures' `verifySshsig`).
- A worker read the rest in full: all 8 promotion source files, all 15 test files and d526 (6,216 lines). Its summary is about 2,000 words, citing file:line throughout. It found: no test or source pins a version literal, row count or digest (every check compares against `CATALOG_VERSION`/`GATE_VERSION`/`ROW_CENSUS`); promotion's six tables (37 rows) unmoved; four flaws, all fixed above. What it left out (other modules' tables) did not matter to a stamp.

**Tests and checks** (on `f350e71780`):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (1.68.0, 1567 rows, `8c92f849…`). Before the stamp 7/1, naming exactly the 14 rows above.
- `node --test bio-plane/test/m/promotion/ bio-plane/test/d526-refusal-order.test.mjs`: 125 tests, 125 pass, 0 fail.
- `checks/format.mjs`: 1 failure (the `modules.json` swap).
- `checks/architecture.mjs bio promotion`: 0 failures.
- `checks/coverage.mjs bio promotion`: 56 of 56, 0 failures.
- `checks/ownership.mjs bio promotion tranche/T41`: 9 files, 1 failure (the new fixture, outside `tests` until the same swap).

Size (session_0126JXzoUNxJ6PKnFaGmmabB): test runs 12, module lines 3620
