# bias (T10)

**Status** · session_01UtHLMrHZ2X8UVfhfaiTKsg · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings I am building on; say if either is wrong.

1. R33 (N224), `waitingSince: when it was registered`. A work product carries no registration time today: `registerWorkProducts`' `read(key)` answers `{context, principal, lens, ranUnder, rerunOf}`, and ai-runs' source (its R30) gives no time. My reading: `waitingSince` is the work product's own `registered` field when its source's `read` answers one (ms since the epoch, or an ISO instant), else absent (null), which the scheduler's `rankBy` ranks as no wait. The sweep reads the batch first, hands the rank the items (`{kind: "bundle", id: <context id>, waitingSince}`), then compares in the rank's order; cursor, batch size and outcomes unchanged. Adding `registered` to ai-runs' source would be ai-runs' share, reported, not built.

2. R43 (N171), `gate` "over the context's bundle id, membership's predicate". My reading: `gate` is membership's `viewerPredicate(viewer)` answer (`{sql, args, scope}`, the SQL over alias `b` bound to `bundles`, its R43). `uncleared` applies it as bias's own gate does today: a machine or founder scope (`scope: "member"`) admits every debt; otherwise a debt is admitted when its context is NULL or a bundle the predicate admits. A malformed gate admits nothing. It answers `{debts, limit, truncated}`.
