# reevaluation (T17)

**Status** · session_01NpZuGNwPmPDTACdJYtaKT7 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N378 (R8 after commit). `raise` cannot know from its own module whether it runs inside a caller's transaction, nor when that transaction commits: record-core's `transact` (its R32) keeps its depth private and offers no after-commit hook, and SQLite has no SQL-visible autocommit flag. Two readings:

**(A) my best reading, recommended.** record-core gains one small service, `afterCommit(fn)`: with no transaction open it runs `fn` now; inside one, it runs `fn` synchronously just after the OUTERMOST `transact` commits, before that call returns, and drops it if the transaction rolls back (a throw or a refusal) or the savepoint holding it rolls back. `raise` then computes and answers `raised` at once (unchanged), and hands the listener calls to `afterCommit`; the deferred call writes `listeners_failed` onto the same answer object `raise` returned, so an act that embeds that object (case-authoring does, `reevaluation: this.reevaluation.raise(...)`) still names failed listeners in its reply, as R8 asks, and a rolled-back run (the review copy's dry run, or a later refusal inside `publishCase`) tells no one. Callers raising after their commit (inquiry's `onRaised` for deferral, promotion's `onReopened`) see no change. This is a record-core change (layer 2), so it needs its requirement (an R-number in record-core) and its job; my side is about 20 lines and tests with a rolled-back caller and a nested savepoint that rolls back while the outer commits.

**(B) this module alone.** Defer every tell to a microtask and tell only if evidence of the act survives (promotion R45's pattern: the target's head at raise time still holds). It needs no other module, but (1) failures could never be named in any act's reply, breaking R8's `listeners_failed` and inquiry R42 (N292) for every caller, not only the rolled-back one; and (2) head evidence misses acts that do not write the target (inquiry's `restaled` raise), so a rolled-back one of those would still tell. I do not recommend it.

I am waiting on this: it decides what I build. If (A), please say whether you want me to wait for record-core's service or build against it feature-detected (falling back to today's synchronous tell when absent).

## J2 · COMPLETE

**Entries.** N378 (R8, listeners after commit): **deferred** to T18 as N406, per B2 (K598, reading A): record-core first gains `afterCommit(fn)` (layer 2), then `raise` hands its listener calls to it and a rolled-back caller's raise tells no one. record-core's layer has closed in T17, so nothing is built against it now. R8 therefore stays not met for a caller that raises inside a transaction it later rolls back (case-authoring's review-copy dry run; case-authoring's `preflight` path already skips the raise, which covers its pre-flight but not an outer caller's rollback of `publishCase`).
Sources R10's `same_secret` link calling this module's registered listener for the linked source: nothing to change; R28 already asks for it and the suites pass on the tranche.

**Code.** No change to this module's code or tests in this job (the branch carries only the mailbox and the tranche merge).

**Found in another module.** record-core (R32): no service tells a caller whether a transaction is open or runs work after the outermost one commits; that is N406's record-core half (already BOB's).

**Tests** (on `job/T17/reevaluation` after merging `tranche/T17` @ 678a9f55b3):
- `node --test bio-plane/test/m/reevaluation/`: tests 67, pass 67, fail 0, skipped 0
- `node --test bio-plane/test/m/case-authoring/`: tests 68, pass 68, fail 0, skipped 0
- no layer tests are named in `build/manifest.md`

**Checks:**
- format: 72 modules, 67 requirements files; 0 failures
- architecture: 13 product files, 54 relative imports; 0 failures
- coverage: 28 of 28 live requirement ids named by a test; 0 failures
- ownership: 1 file changed (this record); legacy-store and legacy-checks 0 added, 0 removed; 0 failures

Size (session_01NpZuGNwPmPDTACdJYtaKT7): test runs 2, module lines 1982
