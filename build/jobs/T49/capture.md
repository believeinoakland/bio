# capture (T49)

**Status** · session_015BNtGS8DbCgXWr3necPhxA · depth 2 · WORKING · handled B0

## J1 · QUESTION

**M-T49-3 measured; proposing `HELD_PAGE_WAIT_MS` = 5000 (5 s).**

Measure (before the change, `heldCaptures` unfiltered, `limit` = N, every row a plain held capture, the evidence store with a stated round trip; the script is mine, in my scratchpad, over `capture`'s test fixture and acquisition's real `archiveList`):

| rows | evidence round trip | examination per row | whole page | per row |
|---|---|---|---|---|
| 50 | 0 ms | 0 ms | 43 ms | 0.85 ms |
| 200 | 0 ms | 0 ms | 161 ms | 0.80 ms |
| 50 | 20 ms | 0 ms | 4,196 ms | 83.9 ms |
| 50 | 20 ms | 30 ms | 5,712 ms | 114.2 ms |

Split at 20 ms: `#archiveRow` is 4,170 of the 4,196 ms, because each unopened capture costs 4 evidence reads inside `archiveList` (holds, head, parts check, profile read: `acquisition/unpack.mjs`:757–764), asked row after row; `#eligibility` costs the examination's own time per row, also row after row (30 ms each = 1.5 s over 50). So the page's time is rows x (4 x round trip + examination), unbounded: at the screen's own page (`limit` 50) 4.2 to 5.7 s at a 20 ms round trip, and 17 to 23 s at the default 200. The live round trip to R2 could not be measured from here (the instance answers `NOT_AUTHENTICATED` to my unauthenticated read, and I looked for no credential), so the table is the model, not the live number; BOB's walk of biosmoke8 can read the live one.

Proposal: `HELD_PAGE_WAIT_MS` = 5000, one wait for the whole page (examinations and archive groupings asked together, concurrently, none twice). Reasons: it is the figure the module's neighbours use for a wait on another module's answer (`file-safety` `SCAN_WAIT_MS` 5,000; `acquisition` `REPUTATION_TIMEOUT_MS` 5,000); the screen's page of 50 then answers well inside it even at a 50 ms round trip once the work is concurrent, and a page that cannot is answered in 5 s with the rest read undetermined (R91), never longer. Chosen, not measured, like those two.

I carry on against 5000. If BOB sets another value, only the constant and the test's stated bound change.
