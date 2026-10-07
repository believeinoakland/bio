# money (T35)

**Status** · session_01Vz8Hy7MosEXL3LQKkTb5xV · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied (T35-32).**
- N635 (K1736): every name money takes from `calc-grammar` now comes from its index. `readingOf` and `cmpD` (inner names of `decimal.mjs`) are gone: R1's range check and R11's "within the coarser fact's precision" go through the index's `relate` (R21 there). R11's results are unchanged (a rounded or approximate figure still stands for half its printed unit either side; touching intervals still count as consistent). money's private `dec()` helper is removed.
- N698 (DEC-164 (4), (5), K1865; R2 as amended, K1941; readings J1, confirmed B2 / K1965): `recordFact`'s `source` takes retrieval R73's match whole (`origin: "search"`). Only its `capture_sha` and `extent` are kept, checked and graded as any other extent. A found table is refused `NO_SOURCE` and the detail names `calculations`. The new optional `question` must be an `inquiry` bundle the writer may see, else `QUESTION_NOT_HELD` (after `ADJUSTS_NOT_HELD`). It is stored in the new `money_facts.question` column, which `migrate` adds to an older store, and is not part of R19's read contract. `readFact`, `moneyOf` and committed-against-paid's facts answer it only to a viewer who may see the inquiry, else `null`.

**Deferred.** None. R2's `*(not yet met: T35)*` mark in `build/requirements/money.md` is BOB's to strike at merge (not my file).

**Found in other modules.** None. The plan's suggestion of a test asserting that no file imports `calc-grammar/decimal.mjs` was not written, because tests check behaviour, never source text (JOB step 5). The architecture check has 0 failures.

**Tests and checks.**
- money `bio-plane/test/m/money/`: 57 pass, 0 fail. The new `found.test.mjs` has five R2 tests: a found extent as the source; refusals unchanged; `QUESTION_NOT_HELD` order and alike-answer; question kept and withheld; old store migrated.
- Users of money: money-checks 41/0, duties 37/0, people 37/0, explore 27/0, query-language 45/0, retrieval 139/0, calculations 38/0, strength 143/0, contradiction 119/0, intent 73/0, corpus-export 25/0, ratification 212/0, case-disclosures 59/0, case-authoring 145/0, consequences 41/0, affordances 203/0.
  - op-declarations 81/3: accepted reds 9 (t34 R21/R5, R21/R27) and 23 (t33 R19/R6).
  - plane (with `migrate-released`) 110/6: all six are `ask.test.mjs`, accepted red 22.
- `format`: 130 modules, 2 failures, both law-relations entries (accepted red 24).
- `architecture . money`: 0 failures.
- `coverage . money`: 23 of 23 live ids named, 0 failures.
- `ownership . money tranche/T35`: 4 files, 0 failures.

Size (session_01Vz8Hy7MosEXL3LQKkTb5xV): test runs 6, module lines 1314

## J1 · QUESTION

R2's found extent (T35-32; K1941's one shape). My reading, which I am building on unless you say otherwise:

1. `recordFact`'s `source` accepts retrieval R73's match whole, `{kind, words, capture_sha, extent, origin: "search", …its kind's fields}`, recognised by `origin: "search"`. Only its `capture_sha` and `extent` are taken; they are checked and graded exactly as `{capture_sha, extent}` is (SOURCE_NOT_HELD, SOURCE_EXTENT_UNREADABLE, the capture's grade). Its `words`, `kind` and kind fields (`as_read`, `figure`) are not stored and never fill the fact's own fields; the member still states `amount`, `as_read`, etc. The plain `{capture_sha, extent}` form keeps working.
2. A match naming a table (R74's `{kind, table: {...}, words, origin: "search"}`) is refused `NO_SOURCE`, its detail saying a table's amount column is declared and counted through `calculations`, never read in here row by row (K1468).
3. `question` is a top-level field of `recordFact` (beside `source`), not a field of the match. QUESTION_NOT_HELD comes after ADJUSTS_NOT_HELD (R2's last source refusal). "The actor" is `by` (as for SOURCE_NOT_HELD). The question is stored in a new `money_facts.question` column (added by `migrate` to an existing table), not part of R19's read contract.
4. A fact recorded from a source fact (`{fact}`) may also carry a question; nothing in R2 limits it to found extents.

## J2 · COMPLETE

T35-32 applied: N635 (calc-grammar through its index; relate in place of readingOf/cmpD) and N698 (R2: found match as source, optional question, QUESTION_NOT_HELD, money_facts.question added by migrate). money 57/0; users of money green but their accepted reds (op-declarations 9, 23; plane ask 22). format (red 24 only), architecture, coverage 23/23, ownership: 0 failures. R2's not-yet-met mark is yours to strike. Details in the record's Completion section.
