# filings (T11)

**Status** · session_01Bokq8y9ZX2oFtuYKbqK3YF · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two points on N217, both on my best reading; I carry on with them.

1. **The provider is not there yet.** Actions' `noSuchAction` (its R43) is not on `tranche/T11` nor on `origin/job/T11/actions`. I build against its Provides (the opening rules): filings imports `noSuchAction` from `../actions/index.mjs` and `#noAction` returns `noSuchAction(id, extra)`. Until actions' R43 is merged into the tranche, filings' module fails to load, so none of my tests can run. I ask you to merge actions early (§4) and send me a `CHANGE` when it is on the tranche; I then merge, run and complete. Meanwhile I write the tests against R43's stated shape.
2. **"`#noAction`'s second sentence rides `extra`" (K351).** My reading: the second of `#noAction`'s two `detail` sentences, "no module answers an action's read here, so no action is readable" (K248's case, no actions module given), rides as `extra: {why: <that sentence>}`; the first ("no action by that id is readable here; one you may not see answers the same") gives way to R43's one fixed `detail`. With actions present, `extra` is absent, so absent, invisible and not-an-action answer byte-identically to every other caller's `noSuchAction(id)`. C-115.2 is retired from `FILINGS_CHECKS` (a departure promotion R34 stamps; reported again at COMPLETE).
