# calc-grammar (T34)

**Status** · session_01RfhvynYE7q2SRyDdV5krf8 · depth 2 · COMPLETE · handled B2

## Completion (T34-4)

**Entries applied.**
- **N567** (K1569; R21): the index exports `relate` beside R4's arithmetic (`index.mjs`). New test `R21` (`streamed.test.mjs`) imports it from the index and checks R10's whole relation: `lower`, `equal` and `higher` over exact, rounded, range and dimensioned figures; `undetermined` with why for overlapping rounded figures and ranges and for an approximate figure; `UNIT_MISMATCH` naming both sides; `FIGURE_INVALID`; `TypeError`. It also checks that `compare` labels the relation `relate` gives.
- **N571** (K1576, K1734; R22): `evaluate` reads every table through one interface (new `tables.mjs`: `size`, `scan()`, `pick(indices)`, `reader(name)`). A table bound as row objects is held as today, and so is every table derived from it, so callers that bind row objects see no change. A streamed table (`{fields, rows}`, `rows()` a new iterator over arrays) is checked in one pass at binding (`INPUT_INVALID` for rows that are not a function answering an iterator, a row that is not an array of exactly its fields' cells, or a read that throws), then read again pass by pass through views:
  - `select` keeps the indices of the rows it keeps;
  - `sort` keeps a permutation, read in chunks of at most 16,384 rows per pass;
  - `span` computes its cell again on each pass (it is pure);
  - `join` keeps its pairs;
  - `group` keeps one row per group.

  A later pass that reads a different table (another row count, a malformed row, a throw) is refused `INPUT_INVALID` at the step that read it. Totals (`sum`, `share`, `group`'s sums) read in two passes, R13's rule and then the amounts, so the order of refusals is unchanged. A table result whose source was bound streamed is answered streamed, `{fields, rows}`, over the same rows (K1734). R22 as amended.
- **An improvement in this module:** `join` now matches through an index from key to right-hand rows. Before, it compared every left row with every right row (O(L×R)). The output order is the same.

**Heap (R22's test, `fixtures/heap.mjs`, run with `--expose-gc`).** The input is a streamed table of 100,000 rows × 10 fields (1,000,000 cells), each row made afresh on every pass. Growth is the most live heap over the baseline while evaluating and reading the answer, sampled with a collection every 5,000 rows:

| recipe | growth |
| --- | --- |
| select | 1.2 MB |
| count | 0.0 MB |
| sum | 0.2 MB |
| share | 0.8 MB |
| group by dept | 1.1 MB |
| group by a unique id (100,000 groups, the worst case) | 22.2 MB |
| span | 0.3 MB |
| sort | 15.1 MB |
| join to a 20-row table | 2.2 MB |
| join of the table to itself | 15.8 MB |
| select → sort → span → group | 16.5 MB |
| difference, ratio, compare, round | 0.1 MB |

All are under the 35 MB bound. `calculations` R1's bound can return to about 1,000,000 cells over a streamed binding.

**For `calculations` (T34-27; BOB carries it to its START, B2):**
- It must bind a declared table streamed (row arrays in `fields` order) to get the bound.
- A table result over a streamed binding is a streamed table: read it through `rows()` before storing it. Today `calculations/index.mjs` stores `output: e.result` directly, which would hold a function.

**Deferred.** None.

**Found in other modules.**
- `money` (`money/index.mjs:24`, `readingOf`, `cmpD`) and `intent` (`intent/index.mjs:45`, `dec`, `cmpD`, `readingOf`) import calc-grammar's inner file `decimal.mjs`, not names its Provides lists. `duties`' import of `relate` from `decimal.mjs` is N567's user side (T34-22); these two are the same pattern, with no entry yet. Either calc-grammar's Provides gains the readings they need (a requirement change, BOB's), or they keep to the index.
- Generated artifact made stale (mechanics §14): `bio-plane/src/case-checker/program.mjs`, which bundles `recipe.mjs` and now `tables.mjs`. It was already stale on `tranche/T34` before this change (case-checker R13 fails there too). Not written here.
- Pre-existing reds in users, the same on `tranche/T34` without this change:
  - calculations: R4's refusal-order test (2 failing subtests);
  - case-checker: R13 (program.mjs stale);
  - workbooks: R15 (`workbooksOps` route arms).

**Tests and checks.**
- calc-grammar: 34 pass, 0 fail (the R22 heap test takes about 20 s). Every R7–R14 evaluation test also runs with its tables streamed and asserts the same answer.
- Users of calc-grammar, pass/fail:

  | module | pass | fail |
  | --- | --- | --- |
  | action-clocks | 51 | 0 |
  | answers | 31 | 0 |
  | case-grammar | 77 | 0 |
  | case-import | 84 | 0 |
  | consequences | 38 | 0 |
  | duties | 30 | 0 |
  | intent | 73 | 0 |
  | money | 52 | 0 |
  | money-checks | 30 | 0 |
  | calculations | 29 | 2 |
  | case-checker | 33 | 1 |
  | workbooks | 25 | 1 |

  The last three failures are the pre-existing ones above.
- Layer tests: none named in `build/manifest.md`.
- Process checks, each 0 failures:
  - `format`: 126 modules, 125 requirements files;
  - `architecture calc-grammar`: 17 product files, 26 relative imports;
  - `coverage calc-grammar`: 22 of 22 live ids named by a test;
  - `ownership calc-grammar tranche/T34`: 8 files changed.
- Size (P6): the module is 1,343 lines, a little above the 800–1,200 estimate. `tables.mjs` is 185 of them.

Size (session_01RfhvynYE7q2SRyDdV5krf8): test runs 11, module lines 1343

## J1 · QUESTION

R22, the shape of a table result over a streamed input. R22 asks for "the same `result`" over a streamed table as over row objects, and also for heap growth under 35 MB for any recipe over 1,000,000 cells. A recipe whose output is a table step (a `select` keeping most rows, a `sort`, a `span`, a `join`) would put the whole table back in the heap if its result were answered as row objects, so both cannot hold literally.

My best reading, which I am building on: a table result whose source was bound streamed is answered as a streamed table, `{fields, rows}`, `rows` a function answering a new iterator over the same rows as arrays in `fields` order. It holds the same table as the row-object answer, and the tests compare the two after reading the stream as objects. A table result whose sources are all bound as row objects is answered exactly as today. A join of a row-object table with a streamed one is answered streamed. `undetermined_rows` and `trace` are identical either way. `calculations` (T34-27) reads a streamed table result through `rows()` when it stores one.

If you want the result as row objects anyway, I will do that and state that the heap bound covers only recipes whose output is a figure, ratio or comparison.

## J2 · COMPLETE

T34-4 applied. R21: the index exports relate. R22: evaluate over a streamed table, through views (tables.mjs), answering a table result streamed per K1734. Join now matches through a key index. Heap over 1,000,000 streamed cells: every recipe is under 35 MB; the worst is group by a unique key at 22.2 MB, then select→sort→span→group at 16.5 MB, a self-join at 15.8 MB and sort at 15.1 MB. calc-grammar 34/0; every R7–R14 evaluation also runs streamed. Of the 12 users, 9 have 0 fail. calculations R4, case-checker R13 and workbooks R15 fail the same on tranche/T34 without this change. format, architecture, coverage 22/22 and ownership (8 files): 0 failures. This change stales case-checker program.mjs, which was already stale. Found: money and intent import calc-grammar/decimal.mjs inner names. For calculations: bind tables streamed, and read a streamed table result through rows() before storing it. Record: build/jobs/T34/calc-grammar.md.
