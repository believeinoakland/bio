# action-plans (T45)

**Status** · session_01TfC1CmNozvRZtyciH6cRgT · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three refusals the T45 text needs but does not name. My best reading for each, which I am building now; tell me if you want otherwise.

1. **R40 `look_again` that is not a `YYYY-MM-DD` day.** R40 lists only R20's refusals and `PLAN_NOT_OPEN` / `PLAN_NOT_PAUSED`. Reading: a new C-124 row `LOOK_AGAIN_REFUSED` ("A day to look again is written year-month-day. Nothing was written."), asked after `PLAN_NO_REASON` and before `PLAN_NOT_OPEN`.
2. **R20 closing `note` over 4,000 characters.** Reading: a new C-124 row `CLOSE_NOTE_TOO_LONG` ("A closing note is at most 4,000 characters. Nothing was written."), asked after `PLAN_NO_REASON`. The note may span lines and hold quotes (it is prose, kept in the log's JSON), unlike a reason.
3. **R41 `optionAdopt({plan, offer: {subject, kind}})` naming no standing offer of that plan** (the matter is not in the plan, not an infraction matter, or `kind` is neither `document_infraction` nor `chance_to_fix`). Reading: answered by the existing `NO_SUCH_PLAN_PROPOSAL` (C-124.22), the detail saying no such offer; no new row. An offer is adopted as often as a member chooses (the chance to fix is re-offered); the option records the offer it came from, and that is how R42 knows a matter's documentation option.

Both new rows go in C-124 (this module's own family), after the six T45 names, for the stamp.
