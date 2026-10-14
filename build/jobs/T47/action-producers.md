# action-producers (T47)

**Status** · session_01CXxJjGBZq2UvQ34XEpAM1k · depth 2 · WORKING · handled B3

## J1 · QUESTION

My readings of T47-50, applied now; say if any is wrong.
1. R25 "what is asked" (K3122: read from the action itself) is the action's title as record-core `bundleInfo` answers it; with none, "a request".
2. R25's sentences: words.json holds no `queue.request-unsent.*` key, so the summary and detail are this module's own words (from the DEC-212 mockup: "You left a request unsent: {what}" to the approver, "A request was left unsent: {what}" to anyone else; detail "Approved on {date}, not yet sent: nothing has gone to the office. …"), answered with no `summary_key`/`detail_key`, returned to BOB for the design stream as R23's kept sentences were.
3. R25's recipients: the approver, else the action's creator, each only while an active member who may see the action (R1's rule's test), else the project's active owners; no administrators arm (R25 names three).
4. R25's leaving: filings R53 answers approved-unsent filings on resolved or abandoned actions too, so the `actionmove` (abandoned) door would not make the item leave. This module draws none for an action whose lifecycle state (`bundles.current_state`) is `resolved` or `abandoned`. (Also reported: R53 could say so itself.)
5. R25's doors: "the action's screen" is the option `{id: "action"}` (actions R47's `op=action`, the action's read) carrying `screen: {op: "action", id, step: "send"}`, labelled "Pick up where you left off" (no key); `queuesnooze` labelled by `act.queuesnooze.label.queue`; `actionmove` labelled by `act.actionmove.label.queue` and carrying `move: {action, to: "abandoned", reason: "required"}`.
6. R24: `{venue}` an office as "<role>, <body>" (role alone when body is null), a venue by `name` (null name: as `venue: null`); `{rhythm}` from the rrule's FREQ and INTERVAL ("week", "2 weeks", "month", "year"); a rule with more than one occurrence a period (several BYDAY, BYMONTHDAY or BYSETPOS values) or an unreadable one keeps the present detail with no `detail_key`, as R24's `venue: null` arm does; `{plan}` the plan's title (`action-plans.planRead`, the read R10 already uses), quoted as R12's look-again summary quotes it, else its id; `{date}` by `date.daymonth`/`date.daymonthyear` with the month from `date.month.*`, now read by key for every date this module words (an improvement: the month names were a copy).

## J2 · COMPLETE

**Completion record, T47-50 (action-producers).** Commit 98f93af5de on `job/T47/action-producers`. Built on J1's readings; no answer to J1 had arrived when this was posted.

**Entries applied:**
- **R24.** `queue.action-clock-overdue.ours.detail` is read by key for a group's own date when `overdueClocks` answers a `venue`. An office is named as "<role>, <body>" (the role alone when there is no body), and a venue by its name. `{what}` and `{date}` are filled as the summary fills them. The basis now carries `venue` and `venue_why`. With `venue: null` the present detail stays and no `detail_key` is answered (kept, returned).
- **R24, plan review.** `queue.plan-review-due.detail` is read by key. `{plan}` is the plan's title from `action-plans.planRead`, quoted, or the plan's id when there is no title. `{rhythm}` is the recurrence's FREQ and INTERVAL in words. `{date}` is `since.day`. A rhythm with more than one occurrence a period, an unreadable rhythm, or no `since` keeps the present detail with no `detail_key`.
- **Dates (improvement).** Every date this module puts in words now uses `date.daymonth`, `date.daymonthyear` and `date.month.*` by key. Before this, the month names were a copied list.
- **R25 `request-unsent`.** One CONDITION per `filings.approvedUnsent` item, keyed `CONDITION::request-unsent::<filing>`.
  - It goes to the approver, else the action's creator (each only while an active member who may see the action), else the project's active owners. There is no administrators arm.
  - Its subject is the action, homed under its project. It names what is asked, which is the action's title read from `bundles` (the value `bundleInfo` answers), or "a request" when there is none. It also names the approval's local day.
  - Its age runs from the approval. It carries no `due`.
  - Its doors are `{id: "action", screen: {op: "action", id, step: "send"}}`, then `queuesnooze`, then `actionmove` with `move: {to: "abandoned", reason: "required"}`. Their labels are `act.queuesnooze.label.queue` and `act.actionmove.label.queue`.
  - No item is drawn for a `resolved` or `abandoned` action.
  - Its sentences are this module's own (`OWN_WORDS`, exported) and carry no key. They are returned to BOB for the design stream.
- `filings` is reached lazily as a dep (`filingsOf`); the test world gains a `filings` fake.

**Returned to BOB (words):** R25's summary, detail and "Pick up where you left off" have no `words.json` key. The kept arms of R24 are `.ours.detail` with no venue, and `plan-review-due.detail` when the rhythm cannot be put in words or there is no `since`.

**Read:** I read my requirements, all my code (`index.mjs`, `words.mjs`) and all my tests (8 files, about 130 KB) whole, myself. I read the used services my entry names: action-clocks R23, plan-work R4 and R18 (with its `planReviewsDue` code), filings R6, R7 and R53 (with its `approvedUnsent` code), actions' Terms and R1–R11, R25, R29 and R47, action-plans R6, and civil-time R20. From the design sources: the `words.json` entries named, the DEC-212 mockup row in `mock-screens.js`, the `registry.json` `actionmove` row, and the L11 fold draft's R25, R53 and screens-daily R13. No helper was used: the set read stayed under 600 KB. I found no flaw in my own module beyond the month-name copy, now fixed.

**Deferred:** none.

**Other modules (REPORT):**
- **filings R53.** `approvedUnsent` answers approved, unsent filings on `resolved` and `abandoned` actions too. R25's drop door (`actionmove` to `abandoned`) only makes the item leave because this module filters on the action's state. R53 could leave out filings on final actions itself.
- **The plane bundle** (`bio-plane/dist/bio-plane.bundled.mjs`) is stale through this module's source, as expected; regenerated at layer close.
- **queue-producers** receives a new kind, `request-unsent`, through `actionItems`. Its tests and queue's pass unchanged.

**Tests and checks:**
- action-producers: 53 pass, 0 fail (`t47.test.mjs` is new and names R24 and R25; `t45.test.mjs`'s R13 and R15 tests now include R25).
- Users: queue-producers 74 pass, 0 fail; queue 142 pass, 0 fail.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 24 failures, none of them action-producers (25 of 25); channels 0 failures.
- Module checks: ownership 0 failures; coverage for action-producers 0 failures.

Size (session_01CXxJjGBZq2UvQ34XEpAM1k): test runs 8, module lines 1636
