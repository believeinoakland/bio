# capture (T49)

**Status** · session_015BNtGS8DbCgXWr3necPhxA · depth 2 · WORKING · handled B3

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

## J2 · QUESTION

**Two readings of my entry, built as stated; replaces nothing (J1 is answered).**

1. **N1073, `knocker.test.mjs`:240 "reads `doorbell`'s rows".** `doorbell` is after `capture` in `modules.json` and `capture` does not declare it, so `checks/architecture.mjs` (which reads tests too) would refuse a `capture` test that imports `doorbell`'s `DOORBELL_CHECKS`/`KNOCK_CHECKS`. My reading of the intent (no hand-list of another module's items): the `MOVED_CODES` and `MOVED_CHECKS` lists are deleted and the test judges from `capture`'s side only: the checks file exports `capture`'s own table alone, its keys equal the six rows the test already states for `capture`, every row's `where` is a site in `capture`, and none is in the C-85 family. The same defect would still fail it. If you want `doorbell`'s own table read, the edge cannot be a `capture` test; tell me and I will leave it as it was.
2. **N1062, `extraction` R31 through `evidenceAbsent`.** `capture`'s tests may not import `extraction` (L4, after me). The new interface test covers every `capture` path (R21's get, a range get, `op=capture` through `captureOp`, R68 `reattest` as a service, as `op=reattest`, with and without an evidence store); `extraction`'s path is tested in `m/extraction` (`relays.test.mjs`, `pdfstructure.test.mjs` already assert `EVIDENCE_NOT_HELD`), which is its job's. The source scan is deleted.
