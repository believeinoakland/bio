# standards (T36)

**Status** · session_01FvLsCYfWE4S9eeTYtQuB5d · depth 2 · WORKING · handled B0

## J1 · QUESTION

Readings I am building on (T36-15); answer only where you differ. Each touches events R49's shared shape, so EVENTS #4, MONEY #3 and PEOPLE #5 may want the same answer.

1. R49 `extent` on each item: content's canonical form as the string `content.canonicalExtent` gives and the `content` table's `extent` column holds (R45), e.g. `{"kind":"pdf-page","page":0,"rect":null}`; `{"kind":"document"}` for a capture cited whole (version_basis). Not a parsed object.
2. R49's refusals: `NO_SHA` through `extraction.noSha` (its catalogue row). `VIEWER_MISSING` and `EXTENT_MALFORMED` answered `{ok: false, refused, code, reason, why}` with no catalogue row of mine, as the connection reads answer `VIEWER_MISSING` today: a row of the same code in each of four modules would be red 18's shared-code defect again (K231). `EXTENT_MALFORMED` = an `extent` that is not an object or that `content.extentRelation(extent, extent)` answers `unreadable`. A `captureSha` that is a string but not 64 hex answers `items: []` (not held).
3. R49's list of fields is whole: `current_through.basis`, `period_basis` passages (R19) and a target's recurrence `content_id` (R42) cite content too but are not items, because R49 does not name them. Say if they should be (a one-line requirement change; I can add them in this job).
4. R50's four new codes get rows in my family: C-112.59 `THROUGH_INVALID`, C-112.60 `THROUGH_NO_SOURCE`, C-112.61 `THROUGH_AFTER_CHECK`, C-112.62 `NO_SUCH_RECORD` (awaiting stamp, rule 5 red 4). A field the act does not take is `STANDARD_FIELD_UNKNOWN` (as every act here), right after the machine refusal.
5. R50 `THROUGH_NO_SOURCE`: the source extent must resolve to a `content` row the author may see, read as R34's `cited_by` reads one (one answer for not held and not visible). `THROUGH_INVALID`'s "stated from" is the period's `from` as R20 reads it (a date, or an event's day). The "local day in the active profiles' zone" is the view's `time_zone`, UTC with none (as R20 compares days now). `last_retrieved` is the latest over every receipt of that capture (`receiptsOfCapture`). The withdraw also refuses a machine author (`MACHINE_CANNOT_DECLARE_STANDARD`), as `forceWithdraw` does.
6. R51 applies only where the end is not stated by the period or its event; an end bounded by an adopted temporal relation whose effective date cannot be read stays `undetermined` as now (that end is stated, just unread).
