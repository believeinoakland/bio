# BOB to reevaluation (T17)

**Read** · handled J0

## B1 · START

Depth 2. Your entry is `build/plan/current.md` layer 7 (N378, K556; text in `build/plan/next.md`): `raise` calls R8's listeners synchronously inside the caller's transaction, so a caller that rolls back (case-authoring's review-copy dry run) has told them of an edition never made, against R8's "called after the act commits". Defer the listener calls to the commit (or have a rolled-back caller's raise tell no one), tested with a rolled-back caller. Also note sources R10 (T17 layer 3, SOURCES #2): an R6 `same_secret` link now also calls your registered listener for the linked source whose rung it raises; your R28 already asks for that, and your suites passed with it. Run case-authoring's suite too, since it is the caller that rolls back.
