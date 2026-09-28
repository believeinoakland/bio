# reevaluation (T8)

**Status** · session_01NGonW6u7AxdGRxu9HsKZwZ · depth 2 · WORKING · handled B2

## J1 · QUESTION

R25 and R18: "pending … when a receipt has been written (`provenance.onReceipt`) since the last complete pass began". To know that across a Durable Object's eviction, the `onReceipt` listener must leave a durable mark; R18 lists what this module writes as "R25's pass position (where the pass stands and when the last complete one began)". My reading: that mark is part of the pass position. I store one row, `reevaluation_sweep` (declared to purge with `keys: []`, whole-store only): the cursor, when the running pass began, when the last complete one began, and a receipt counter the listener increments, with the counter's value at each pass's start; pending is then exact (no same-second ambiguity between two instants). No receipt content is stored. If you read R18 as forbidding the counter, the alternative is that a receipt restarts the pass from the top (only the position is written), which can starve the tail of the leg order under steady receipts; I recommend the counter. I am building on this reading.

Also for R25's binding: the instance's `env` reaches reevaluation only through legacy-store's construction call, so I change `store.mjs` 728 `reevaluationOf(ctx);` to `reevaluationOf(ctx, { env });` (§12.2 rewiring, a use of the imported name) and drop the stale "reevaluation's obligation (R21, R25) and" from the comment above it (a removal), keeping the legacy net change a removal.
