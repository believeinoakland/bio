# monitoring (T33)

**Status** · session_01XaKEVPm9N9a9f7CAG1p53m · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three readings for T33-78; I am building on each now and will bring the work in line if you answer otherwise.
(1) R34, R50, the zone. I read "the local day of the office's or venue's jurisdiction, as actions R12 reads it" as the zone actions itself uses at its R33 write guard: `zoneOf(view)`, the active profiles' combined view's `time_zone` (actions `index.mjs:639`), read through civil-time `localDay` and `dayRange`. Not action-clocks' per-office `actionZone`: where an office's profile zone differs from the view's, a mark on the office's day could be refused `CLOCK_STATUS_NOT_MECHANICAL` by actions' guard, which reads the view's day. With no zone held, R34 marks nothing (actions R33: no entry has passed) and R50 holds no wake (`deadlineRecheckWake` null), stated in `deadlineRecheck`'s answer as `zone: null` with a reason.
(2) R15's new clause. Monitoring's share is: an address that is a register's own query for one identifier is watched exactly as any address (captured, compared), and the tick fetches only that address, following no link out of its answer; monitoring composes no query and takes no person or name from any caller (R36). Refusing a query by name alone or across registers is `following` R9's (`PERSON_QUERY_NOT_NAMED`), not a check here. The test drives a monitored bundle at such a query address whose answer links out, and asserts one fetch, of that address only.
(3) `modules.json`: monitoring's `uses` lacks `civil-time` (the plan's T33-78 names it, and the requirements' Uses list it). I import `../civil-time/index.mjs`; if `checks/architecture.mjs` refuses the edge, I will say so in my COMPLETE for you to set it, as at actions' merge (K1657).
