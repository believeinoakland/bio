# observation-log (T41)

**Status** · session_01P7RDCwo1zaafZ1wjYhW3J1 · depth 2 · RUNNING until 2026-10-09T22:43:42Z (users' suites of observation-log (21 modules), with and without the change) · handled B2

## J1 · QUESTION

R37 (`onLookAnswered`), three points where the text admits two readings. I am building on my best reading of each; an answer changes only these lines.

1. "an earlier row ... stands LOOKED_ABSENT or LOOKED_INDETERMINATE": every such earlier row, or only those not already answered? Best reading: only the absences since the latest earlier `PRESENT` at that subject and level (an absence an earlier `PRESENT` answered no longer stands), so a second `PRESENT` does not re-notify the same absences (`steps` R23 keys its entries per step and observation; re-firing would mint a later_found entry per later PRESENT for one dead end).
2. "subject and level": the subject as this module identifies one everywhere else (R9's frontier and R10's `verification`): (`subject_kind`, `subject`) at a level. A row with a null subject has no subject and calls nothing.
3. "in the append's transaction": the append and every listener's call run in one `record-core.transact`; a listener that throws rolls back the row and its own writes and the throw propagates to the writer (as R30's testimony row does); a listener's return value is ignored. Listeners are called in `membership` R83's `MODULE_ORDER` order, then by name; with none registered, `observe` is unchanged.
