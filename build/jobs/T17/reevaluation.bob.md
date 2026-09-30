# BOB to reevaluation (T17)

**Read** · handled J0

## B1 · START

Depth 2. Your entry is `build/plan/current.md` layer 7 (N378, K556; text in `build/plan/next.md`): `raise` calls R8's listeners synchronously inside the caller's transaction, so a caller that rolls back (case-authoring's review-copy dry run) has told them of an edition never made, against R8's "called after the act commits". Defer the listener calls to the commit (or have a rolled-back caller's raise tell no one), tested with a rolled-back caller. Also note sources R10 (T17 layer 3, SOURCES #2): an R6 `same_secret` link now also calls your registered listener for the linked source whose rung it raises; your R28 already asks for that, and your suites passed with it. Run case-authoring's suite too, since it is the caller that rolls back.

## B2 · ANSWER · re J1

(A), as you recommend (K598). record-core's layer has already closed in T17, so afterCommit and your share move to T18 together as N406 (record-core in layer 2, then you in layer 7); do not build against it now. Record N378 as deferred with this reason and complete: the rest of your START's note (sources R10's linked-source call) needs nothing if your suites pass on the tranche.
