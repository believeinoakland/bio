# promotion (T40)

**Status** · session_01XChv8V6DE72utCnY78u8bo · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Started and ready to stamp (T40-4). Census of `tranche/T40` @ K2403 (merged into my branch): 1556 rows, `a57540ad…` against the 1.66.0 pin of 1551; five arrivals, nothing departed or changed: C-120.20 DOCUMENT_COPY_UNDETERMINED, C-120.21 DOCUMENT_COPY_PENDING, C-120.22 DOCUMENT_NOT_CLEANABLE (case-disclosures' record), C-122.7 DOCUMENT_COPY_CHANGED_SINCE (publication's), C-141.11 DOCUMENT_COPY_NO_STORE (case-carriage's); each named by its T39 record. T40's L1 moved no row. Holding the stamp (1.66.0 → 1.67.0, ROW_CENSUS re-pin, fixture row-census-1.67.0.jsonl) until you tell me membership and credentials are merged, as B1 says.

## Completion

**Entry applied (T40-4; T39's rule 3 item 2, T40's rule 4 item 2; K2370, K2377, K2378, K2413, K2414).** The stamp, **1.66.0 → 1.67.0 (MINOR)**. It was taken over `tranche/T40` after membership and credentials merged (B2), merged into this branch. `ROW_CENSUS` is **1566 rows, `d3f742b59fd8e19cf2fe0a547d8854866705fa935818e563783267796721e904`**, on stamp commit `80461f44f9`. The fixture was renamed `row-census-1.66.0.jsonl` → `row-census-1.67.0.jsonl` and rewritten by `censusOf`. I diffed it line by line against 1.66.0's. Every row matches B2's list:
- 15 new:
  - case-disclosures C-120.20–.22;
  - publication C-122.7;
  - case-carriage C-141.11 (T39's, named by their T39 records);
  - membership C-96.48–.51;
  - credentials C-29.34–.39.
- 3 changed:
  - C-29.21 UNKNOWN_SWITCH (translation);
  - C-29.32 AI_KEEP_AWAY_NO_REASON (`where` only);
  - C-56.2 PROJECT_ACT_NOT_THE_OWNER (`where` only).
- None departed. T40's L1 moved no row.
- The note in `gate.mjs` also records record-grammar's T40-1 as a change in what the gates run, with no row moving. It also records that `ai-use` entering `MODULE_ORDER` moves no gate's order.
- The census suite's header and its two declaration lists are re-anchored at 1.67.0. None is open.

**Deferred:** none. The worker flagged the `checks.mjs` header ("C-86.5 to C-86.14"), but it is accurate: it names the Batch30 rows, and C-86.15 came later (R56, K904). I left it unchanged.

**Found in other modules (BOB's):**
- `build/modules.json`:42: swap promotion's `tests` entry `row-census-1.66.0.jsonl` → `row-census-1.67.0.jsonl`. Until then `format` and `ownership` each show exactly this one failure.
- §14, stale generated artifacts: `bio-plane/src/case-checker/program.mjs` and the plane bundle embed 1.66.0 and the old census. Regenerate both at L2's close (K1540; case-checker's `program.test.mjs` R13 goes red until then).
- `case-disclosures/checks.mjs`:168 says its rows were stamped at 1.66.0. They are now 1.67.0's. This is wording only, for its next job.

**Reading (mechanics §17).** The set measured over 300 KB (code and tests about 560 KB without the fixture), so I followed B1's (3).
- Read whole myself:
  - my requirements;
  - `layers.md` layer 2's row;
  - the plan's rule 4 and T40-4;
  - K2370, K2377, K2378;
  - my T39 record;
  - the files this entry changes: `gate.mjs`, `row-census.mjs`, `row-census.test.mjs`.
- A worker read the rest in full: all 8 promotion source files, all 15 test files, d526 (about 416 KB), and each used module's Purpose and named services. Its summary is about 2,000 words and cites file:line throughout. It found:
  - no test pins a version literal; every check compares against `CATALOG_VERSION`/`GATE_VERSION`;
  - promotion's own six tables (37 rows) are unmoved;
  - no used service pins a catalogue version.
- What it left out did not matter to a stamp.

**Tests and checks** (on `80461f44f9`):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (1.67.0, 1566 rows, `d3f742b5…`). Before the stamp it was 7/1, naming exactly the 18 rows above.
- `node --test bio-plane/test/m/promotion/ bio-plane/test/d526-refusal-order.test.mjs`: 125 tests, 125 pass, 0 fail. The `MODULE_ORDER` red is cleared by membership's merge.
- `checks/format.mjs`: 1 failure (the `modules.json` swap).
- `checks/architecture.mjs bio promotion`: 0 failures.
- `checks/coverage.mjs bio promotion`: 56 of 56, 0 failures.
- `checks/ownership.mjs bio promotion tranche/T40`: 5 files, 1 failure (the new fixture, outside `tests` until the same swap).

Size (session_01XChv8V6DE72utCnY78u8bo): test runs 7, module lines 3599
