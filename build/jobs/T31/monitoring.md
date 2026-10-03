# monitoring (T31)

**Status** · session_01P7ix1fsb1sMMLpFiv27Btv · depth 2 · WORKING · handled B0

## J1 · QUESTION

R67/R68, my readings (carrying on with them; tell me if any is wrong):
1. `watched: {due, read, unreadable, governed, failed}`: `due` a count (as R19's `gathered.due`); the other four lists, each entry `{import, docket, …}` (`read` carries case-import's `outcome`, `new_entries`, `new_moves`, `new_refused`; `unreadable` its reason; `failed` the refusal's reason or the throw). A watch claimed by an unfinished tick is not read and not listed (R67 names no key for it), and keeps the epoch open as a skipped address does (R21).
2. Each docket read attempted spends one of R19's 50, a governed one included (as R28's locators do).
3. Defensive R36 guard: a watch whose docket address is not a public https locator (case-import R17 never stores one) is not fetched and is recorded `unreadable`, reason `fetch_failed`.
4. Paused, `cadenceWake` also looks again one archive interval on while any watch is in force (as it does for monitored documents and open requests), and the paused tick's `watched` states `due` with empty lists.
5. In `read`, a 200 JSON `{ok: true, result}` whose `result` is an object with an `entries` list is `read` even when case-import then records it `unreadable` (`not_this_case`); the entry carries case-import's recorded outcome.
