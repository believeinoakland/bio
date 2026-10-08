# notice-producers (T36)

**Status** · session_014RE9GRKMXoXK4GGwKBuTgt · depth 2 · WORKING · handled B2

## J1 · QUESTION

R14's leaving rule cannot be read as written. `file-safety.threatOf` is `async` (it answers a Promise: `file-safety/index.mjs`:532, its `#grade` awaits archive reads), while `noticeItems` is synchronous and `queue` reads it synchronously (`queue/index.mjs`:897, its R51). No other file-safety service answers a file's hold synchronously: `verdictNotes` and `scanFindings` (R2, R15) carry no hold state, and `#holdOf`/`#openHolds` are private. So "leaves when ... `file-safety.threatOf` no longer answers the file under a scan hold that covers that finding" has no synchronous read in T36.

Options:
(a) T36: R14's item leaves when its recipient disposes of it; its leaving on release waits for a synchronous hold read in `file-safety` (a T37 entry beside N762's `since`, e.g. `scanFindings` answering each finding with `held` true or false: whether an open hold still covers that note's names). R14 is amended to say so, that clause marked not yet met (T37); `threatOf` dropped from R14's Uses for T36.
(b) notice-producers reads file-safety's `fs_holds` table directly: crosses file-safety's data; not recommended.
(c) `noticeItems` and queue's read become async: cascades through queue and its callers mid-L11; not recommended.

Recommendation (a). My best reading, on which I build now: (a). Everything else in R1, R13, R14, R15 I build as written.
