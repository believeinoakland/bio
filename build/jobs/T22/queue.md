# queue (T22)

**Status** · session_01Xt65J5ux1SsQmscugvVYYt · depth 2 · WORKING · handled B1

## J1 · QUESTION

My readings, on which I am building now (answer only if one is wrong):
(a) R49 `case`: each item's key is its nearest home ancestor (`case.ancestors`, least depth, then id), and items are ordered by that key's (depth, id), an item with none after; ties in R6's order. The default ("grouped by case ... as `case` below; within a case to-dos, then noticed, then signals; R6's order among equals") is then the same order as `sort=case` today, since R6's order (class, then id) is both the within-case order and the tie-break; they part only when DEC-110 (2)'s collapsing lands. I build one comparator for both and test both.
(b) `added`: newest first by `age.since` (else `age.ms`, smaller first); an item whose age is undetermined goes after, in R6's order. `due`: soonest `due` (YYYY-MM-DD, queue-producers R25) first; items without one after, in R6's order. `kind`: class in R6's order, then kind ascending, then id.
(c) `QUEUE_SORT_UNKNOWN` is row C-33.51 in `queue/checks.mjs` (next after C-33.50), answering `sorts: ["added","due","case","kind"]` before any read; `op=queue`'s door (`queue/door.mjs`, mine) now passes the query's `sort` to the store beside `now` and `limit`; the refusal reaches the caller with status 400 through R17's pass-through.
(d) K1035 / the forwarded REEVALUATION #12 J1 (1): R12 states `requires: [notice]`, so `requires` stays; "require it" I read as the detail's sentence: adopting takes a why (1–2,000 characters), keeping's why stays optional.
(e) R48: "condition" in plan-checkpoint-due's own sentence ("whether its condition was met") and objective-gap's ("satisfaction condition") names a checkpoint's and an objective's condition, not a signal; both stay, and R48's test excludes exactly those two phrases.
