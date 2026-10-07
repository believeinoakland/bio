# duties (T35)

**Status** · session_01TGUk8GSCkas5fYA7hBEf9q · depth 2 · WORKING · handled B1

## J1 · QUESTION

Readings I am building on (T35-34); answer only where you differ.

1. R28 `reviewDue` and `cycle` are content ids of held passages of the standard's own text (the shape R4 already quotes), read through `content.passageText`; a content id content holds no row for, or one not among the standard's text passages, is refused with a new row C-133.38 `REVIEW_EXTENT_NOT_HELD`; `REVIEW_DATE_UNREAD` is C-133.37: the words must hold exactly one whole calendar date (ISO, "June 30, 2027", "30 June 2027"); none, a placeholder, a month only, or two different dates are refused. A cycle reads "every N years/months/weeks", "annually", "biennially", "triennially", "quarterly", "monthly"; a cycle in days not a whole number of weeks is `BAD_RECURRENCE` (civil-time has no DAILY).
2. R28's "Noticed": the occurrence keeps the closed state `overdue` (R13's transitions and notice-producers read the state) and is answered with `label: "Noticed"`, the why R28 states, and a question saying it is the body's own date, never a deadline the law sets. Only a review duty (the fields carry `review: {standard, review_due, cycle}`, set by `proposeReview`) is so labelled.
3. R27 `NOT_A_POWER` is a new row C-133.39. Uses are gathered by paging `events.usesOf` over all uses (no filter) and keeping those linked by provision or by a member, so the order, `after`, `limit` and `truncated` are events' own; the count R7/R15 answer is the full count for the viewer. Member links are a new append-only table `duty_use_links` (link and unlink rows). R18 gains kind `used_in` ("used in", derived).
4. R29: when the source standard's issuer is an entity of an organisation kind and a sector other than government, the duty is admitted only where the obligor is an organisation acting for a public body (a held `acts_for`/`contracts_with` line, or the source's own issuer being that public body: R1's "a source naming the body") and an enforcer is named. A government obligor resting on such a source is refused `NOT_ACTING_FOR_PUBLIC` unless `standards.bindsAt` answers `binds` for that obligor on the read's date (an adoption by reference, standards R40/R43). The R29 sentence goes in the refusal's `detail`; the translations are unchanged (no row moves).
5. R1 "a source naming the body" is met, for any organisation obligor, by a source whose standard's issuer is a public body entity (fixes a gap: today only lines count).

R27's tests need events' `usesOf` (T35-28); I build against R46's wording now and will merge the tranche branch after events merges, when you say so.
