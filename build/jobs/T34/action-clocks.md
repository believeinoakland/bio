# action-clocks (T34)

**Status** · session_013PBtyrXuGm42NxyndyYf65 · depth 2 · WORKING · handled B1

## J1 · REPORT

Findings outside action-clocks, and the two readings B1 asked me to confirm. None blocks this job.
(1) **Readings confirmed against the code (K1753), no QUESTION.** R11 (`calendarFactsRead`) offers no closure-list entry for confirmation: it lists office-calendar years (`yearEntries` skips list entries; `readsOfficeCalendar` is false for a rule naming `closures`) and offices' `hours`, as worded. The zone: `actionZone` takes the addressed office's (or its kind's venue's) profile `time_zone` first, else the view's `time_zone` (which is `actions` R68's `zoneOf(place)`), as worded.
(2) **For BOB's requirements (R11, a meaning change, so not built):** since R12 now reads and states a named list's entries by their own status, a count on a list reads a fact members can confirm, but R11 never offers it. Every business-day deadline both held profiles hold names a list (T33 J2 (5)), so today R11 offers members no holiday fact at all, and every such count reads "unconfirmed" with no prompt to fix it. Suggest R11 also list the list entries a live deadline's `closures` (and `observed.closures`) reads, at their `list=<name>` paths; about 15 lines here.
(3) **civil-time (L1), DEC-149 wording:** member-facing text it returns that this module passes through (`why` of an undetermined count, which `clockPropose` answers as `undetermined`, and the trace notes): "is disputed on this instance", "cannot be read on this instance", "counted on a correction that governs on this instance", "counted on a calendar corrected on this instance". The L8–L11 grep did not cover L1. Not reworded here (another module's text).
(4) **Generated artifacts:** `bio-plane/dist/bio-plane.bundled.mjs` is stale (action-clocks' source changed; mechanics §14). Not touched.
(5) **queue-producers (R15, R18):** R3 items now carry `zone` (with `local_day`, null for a stored `overdue` of an action with no zone held) and R5 items carry `zone`, as K1675 (2) reads them. queue-producers' tests pass unchanged, 85/85.
