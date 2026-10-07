# money (T35)

**Status** · session_01Vz8Hy7MosEXL3LQKkTb5xV · depth 2 · WORKING · handled B2

## J1 · QUESTION

R2's found extent (T35-32; K1941's one shape). My reading, which I am building on unless you say otherwise:

1. `recordFact`'s `source` accepts retrieval R73's match whole, `{kind, words, capture_sha, extent, origin: "search", …its kind's fields}`, recognised by `origin: "search"`. Only its `capture_sha` and `extent` are taken; they are checked and graded exactly as `{capture_sha, extent}` is (SOURCE_NOT_HELD, SOURCE_EXTENT_UNREADABLE, the capture's grade). Its `words`, `kind` and kind fields (`as_read`, `figure`) are not stored and never fill the fact's own fields; the member still states `amount`, `as_read`, etc. The plain `{capture_sha, extent}` form keeps working.
2. A match naming a table (R74's `{kind, table: {...}, words, origin: "search"}`) is refused `NO_SOURCE`, its detail saying a table's amount column is declared and counted through `calculations`, never read in here row by row (K1468).
3. `question` is a top-level field of `recordFact` (beside `source`), not a field of the match. QUESTION_NOT_HELD comes after ADJUSTS_NOT_HELD (R2's last source refusal). "The actor" is `by` (as for SOURCE_NOT_HELD). The question is stored in a new `money_facts.question` column (added by `migrate` to an existing table), not part of R19's read contract.
4. A fact recorded from a source fact (`{fact}`) may also carry a question; nothing in R2 limits it to found extents.
