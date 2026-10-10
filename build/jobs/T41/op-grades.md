# op-grades (T41)

**Status** · session_01AeoP2zAYoh9M4VE32oH24e · depth 2 · WORKING · handled B1

## J1 · QUESTION

R29 vs `op-declarations` R42 on `handlecheck`. R29 has `NON_ACTS` give `handlecheck` "read: whether a handle is free, taken or not allowed, never who holds it". R42 declares `handlecheck` public with **no `NEEDS` row**. `affordances`' `unaccounted` (its R12) reads a `NON_ACTS` key the table does not carry as gated (no `NEEDS` row) as `stale`, so the totality would fail on it; T34's public ops with no `NEEDS` row (`groupdescription`, `websiteinvite`, …) carry no `NON_ACTS` row for that reason, while public reads with a `null` `NEEDS` row (`noticespublic`, `credit`) carry "read: public, no credential".

My best reading, which I am building now: keep R29 as written (`NON_ACTS.handlecheck` with its sentence), and op-declarations R42 gives `handlecheck` a `NEEDS` row of `null` (as `noticespublic`'s), so the totality holds. The alternative: R29 drops `handlecheck`'s `NON_ACTS` row (as `groupdescription`'s). Either way it is one line on one side; tell me which and I bring mine in line. Nothing else waits on it.
