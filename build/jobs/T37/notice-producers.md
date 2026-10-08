# notice-producers (T37)

**Status** · session_01NtKgWhTs8dgUsdu2kZ9cnc · depth 2 · WORKING · handled B1

## J1 · QUESTION

R14's last sentence can't be built as written: "an item whose finding has left the window stays until its recipient disposes of it".

Why: `queue` keeps no items. It derives the feed on every read (R51: it reads `noticeItems` each time) and stores only dispositions and mutes (`queue/schema.mjs`: `queue_state`, `queue_item_mutes`, `finding_dispositions`). This module writes nothing (Factory; R1). So an item is in the feed only while `noticeItems` answers it, and that needs the finding read. R14 also says a finding older than the window "is never read". The two clauses together can't both hold. (R13 has the same gap, unstated: a change past 90 days stops being answered and its item leaves the feed.)

Options:
(a) The window is the item's life: a finding older than 90 days is not read, so its item stops being answered. Inside the window, the item leaves on `held: false`. R14's last clause is amended to say so, as R13 already behaves. No other module changes.
(b) Keep the item while its hold is open, outside the window too. That needs `file-safety` R15 to answer only held findings (e.g. `held: true` as a filter, with its own bound), plus a second, bounded read of R14. That is a file-safety change (another module and layer), not in T37.
(c) `queue` keeps the items it has shown until they're disposed of. That is a queue change and a doctrine change for every producer.

Recommendation: (a). It is what R13 already does, it holds R14's bound, and it needs no other module. A finding still held after 90 days stays visible where the file is (file-safety R16: the original doesn't open, the screens show the hold), so the member isn't left blind.

I am building (a) now: the windowed read (`since` = 90 days before the call; first page, then `cursor` while `truncated`; at most 1,000), and no item for a finding answered `held: false`. My tests state (a). If you pick (b) or (c), I'll bring the job in line.
