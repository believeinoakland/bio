# action-clocks (T34)

**Status** · session_013PBtyrXuGm42NxyndyYf65 · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Findings outside action-clocks, and the two readings B1 asked me to confirm. None blocks this job.
(1) **Readings confirmed against the code (K1753), no QUESTION.** R11 (`calendarFactsRead`) offers no closure-list entry for confirmation: it lists office-calendar years (`yearEntries` skips list entries; `readsOfficeCalendar` is false for a rule naming `closures`) and offices' `hours`, as worded. The zone: `actionZone` takes the addressed office's (or its kind's venue's) profile `time_zone` first, else the view's `time_zone` (which is `actions` R68's `zoneOf(place)`), as worded.
(2) **For BOB's requirements (R11, a meaning change, so not built):** since R12 now reads and states a named list's entries by their own status, a count on a list reads a fact members can confirm, but R11 never offers it. Every business-day deadline both held profiles hold names a list (T33 J2 (5)), so today R11 offers members no holiday fact at all, and every such count reads "unconfirmed" with no prompt to fix it. Suggest R11 also list the list entries a live deadline's `closures` (and `observed.closures`) reads, at their `list=<name>` paths; about 15 lines here.
(3) **civil-time (L1), DEC-149 wording:** member-facing text it returns that this module passes through (`why` of an undetermined count, which `clockPropose` answers as `undetermined`, and the trace notes): "is disputed on this instance", "cannot be read on this instance", "counted on a correction that governs on this instance", "counted on a calendar corrected on this instance". The L8–L11 grep did not cover L1. Not reworded here (another module's text).
(4) **Generated artifacts:** `bio-plane/dist/bio-plane.bundled.mjs` is stale (action-clocks' source changed; mechanics §14). Not touched.
(5) **queue-producers (R15, R18):** R3 items now carry `zone` (with `local_day`, null for a stored `overdue` of an action with no zone held) and R5 items carry `zone`, as K1675 (2) reads them. queue-producers' tests pass unchanged, 85/85.

## J2 · COMPLETE

**Entries applied.** T34-50 whole; T34-87's two rows.
- R3 (N609): each `overdueClocks` item carries `zone`, the zone whose local day (`local_day`) it was judged on (`actionZone`); null for a stored `overdue` of an action with no zone held.
- R5 (N609): each `remindersDue` item carries `zone`, the zone its reminder was judged due in.
- R12, R10 (N562): `holidayFact` names a closure-list entry's `list`, so `factReader` reads it at its own `local-facts` path (`…/holidays/<year>/list=<name>`), never the office calendar's, and answers its own status. The count asks every entry it reads, a list's among them; the `profile_list` status is gone: a list's year is stated unconfirmed, confirmed, corrected or disputed apart from the office calendar's, the words naming the list and year ("counted on an unconfirmed calendar (<source>, <date>): the closure list 'town', 2026").
- N603: `governedView` removed; the count hands civil-time each answer as read (`corrected`, `value`), and civil-time counts on a correction that governs after a later confirm. Each entry is still asked once per count (the recorder's cache), across the rule, its extension and its observed practice.
- DEC-149 (T34-87): `count.mjs` :175–176's "a closure list is not confirmed on this instance" is gone with `profile_list`; :177's `not_read` statement now reads "whether your group has confirmed the calendar was not read", named by the R12 `not_read` test. The "instance clock" comments are kept. No check translation changed.
**Deferred:** none. **Found elsewhere:** J1 (R11 and the lists; civil-time's "this instance" words; the stale plane bundle; queue-producers told by shape).
**Tests and checks.** action-clocks 53/53 (`node --test test/m/action-clocks/*.test.mjs`): new R3 (N609) zone test, R5 (N609) zone test, R10 R12 named-list test (rewritten from the K1519 one), R12 negative control for a list name local-facts cannot name. Users, branch against `tranche/T34` (worktree), failing sets identical: filings 63/1 (chronology.test.mjs R33, K1795), monitoring 114/1 (R18), affordances 189/3, op-declarations 68/1, control-plane 166/2, plane 109/1 (all as on the tranche); action-plans 61/0, queue-producers 85/0. No layer tests named. format: 127 modules, 0 failures; architecture: 15 product files, 0 failures; coverage: 15 of 15 live ids named, 0 failures; ownership: 8 files, 0 failures.
Size (session_013PBtyrXuGm42NxyndyYf65): test runs 12, module lines 1599
