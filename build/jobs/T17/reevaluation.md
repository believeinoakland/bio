# reevaluation (T17)

**Status** · session_01NpZuGNwPmPDTACdJYtaKT7 · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · QUESTION

N378 (R8 after commit). `raise` cannot know from its own module whether it runs inside a caller's transaction, nor when that transaction commits: record-core's `transact` (its R32) keeps its depth private and offers no after-commit hook, and SQLite has no SQL-visible autocommit flag. Two readings:

**(A) my best reading, recommended.** record-core gains one small service, `afterCommit(fn)`: with no transaction open it runs `fn` now; inside one, it runs `fn` synchronously just after the OUTERMOST `transact` commits, before that call returns, and drops it if the transaction rolls back (a throw or a refusal) or the savepoint holding it rolls back. `raise` then computes and answers `raised` at once (unchanged), and hands the listener calls to `afterCommit`; the deferred call writes `listeners_failed` onto the same answer object `raise` returned, so an act that embeds that object (case-authoring does, `reevaluation: this.reevaluation.raise(...)`) still names failed listeners in its reply, as R8 asks, and a rolled-back run (the review copy's dry run, or a later refusal inside `publishCase`) tells no one. Callers raising after their commit (inquiry's `onRaised` for deferral, promotion's `onReopened`) see no change. This is a record-core change (layer 2), so it needs its requirement (an R-number in record-core) and its job; my side is about 20 lines and tests with a rolled-back caller and a nested savepoint that rolls back while the outer commits.

**(B) this module alone.** Defer every tell to a microtask and tell only if evidence of the act survives (promotion R45's pattern: the target's head at raise time still holds). It needs no other module, but (1) failures could never be named in any act's reply, breaking R8's `listeners_failed` and inquiry R42 (N292) for every caller, not only the rolled-back one; and (2) head evidence misses acts that do not write the target (inquiry's `restaled` raise), so a rolled-back one of those would still tell. I do not recommend it.

I am waiting on this: it decides what I build. If (A), please say whether you want me to wait for record-core's service or build against it feature-detected (falling back to today's synchronous tell when absent).
