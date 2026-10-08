# money (T36)

**Status** · session_01AzpG9vAgA5NEhFJGqSdSUx · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings I am building on; tell me if either is wrong.
1. R24 and a fact whose source is a canonical table's row (R4's machine write, `{table, row, binding}`): it cites the capture the table was read from (R19's `source_capture_sha`) but no part in `content`'s extent grammar. My reading: it is an item, its `extent` read as `document` (events R49: "a citation naming no part is read as `document`"), so "who recorded something from this capture" names the machine's table-row facts too; with an `extent` filter its relation is whatever `extentRelation(extent, {kind: "document"})` answers. The alternative is to leave table-row facts out of R24 entirely.
2. R25 `moved` for a non-actual fact with several concerned events: `when` is the date of the one concerned event that has a date, and null when none or more than one has a date (I never choose between them). `compared` only counts included `actual` facts that are not withdrawn (R7: a withdrawn fact is never counted). The trail rows sit beside each inclusion and each open proposal of a `trail` set only. An attribution set's `readSet` is unchanged.
