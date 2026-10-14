# action-producers (T47)

**Status** · session_01CXxJjGBZq2UvQ34XEpAM1k · depth 2 · WORKING · handled B1

## J1 · QUESTION

My readings of T47-50, applied now; say if any is wrong.
1. R25 "what is asked" (K3122: read from the action itself) is the action's title as record-core `bundleInfo` answers it; with none, "a request".
2. R25's sentences: words.json holds no `queue.request-unsent.*` key, so the summary and detail are this module's own words (from the DEC-212 mockup: "You left a request unsent: {what}" to the approver, "A request was left unsent: {what}" to anyone else; detail "Approved on {date}, not yet sent: nothing has gone to the office. …"), answered with no `summary_key`/`detail_key`, returned to BOB for the design stream as R23's kept sentences were.
3. R25's recipients: the approver, else the action's creator, each only while an active member who may see the action (R1's rule's test), else the project's active owners; no administrators arm (R25 names three).
4. R25's leaving: filings R53 answers approved-unsent filings on resolved or abandoned actions too, so the `actionmove` (abandoned) door would not make the item leave. This module draws none for an action whose lifecycle state (`bundles.current_state`) is `resolved` or `abandoned`. (Also reported: R53 could say so itself.)
5. R25's doors: "the action's screen" is the option `{id: "action"}` (actions R47's `op=action`, the action's read) carrying `screen: {op: "action", id, step: "send"}`, labelled "Pick up where you left off" (no key); `queuesnooze` labelled by `act.queuesnooze.label.queue`; `actionmove` labelled by `act.actionmove.label.queue` and carrying `move: {action, to: "abandoned", reason: "required"}`.
6. R24: `{venue}` an office as "<role>, <body>" (role alone when body is null), a venue by `name` (null name: as `venue: null`); `{rhythm}` from the rrule's FREQ and INTERVAL ("week", "2 weeks", "month", "year"); a rule with more than one occurrence a period (several BYDAY, BYMONTHDAY or BYSETPOS values) or an unreadable one keeps the present detail with no `detail_key`, as R24's `venue: null` arm does; `{plan}` the plan's title (`action-plans.planRead`, the read R10 already uses), quoted as R12's look-again summary quotes it, else its id; `{date}` by `date.daymonth`/`date.daymonthyear` with the month from `date.month.*`, now read by key for every date this module words (an improvement: the month names were a copy).
