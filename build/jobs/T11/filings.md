# filings (T11)

**Status** · session_01Bokq8y9ZX2oFtuYKbqK3YF · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two points on N217, both on my best reading; I carry on with them.

1. **The provider is not there yet.** Actions' `noSuchAction` (its R43) is not on `tranche/T11` nor on `origin/job/T11/actions`. I build against its Provides (the opening rules): filings imports `noSuchAction` from `../actions/index.mjs` and `#noAction` returns `noSuchAction(id, extra)`. Until actions' R43 is merged into the tranche, filings' module fails to load, so none of my tests can run. I ask you to merge actions early (§4) and send me a `CHANGE` when it is on the tranche; I then merge, run and complete. Meanwhile I write the tests against R43's stated shape.
2. **"`#noAction`'s second sentence rides `extra`" (K351).** My reading: the second of `#noAction`'s two `detail` sentences, "no module answers an action's read here, so no action is readable" (K248's case, no actions module given), rides as `extra: {why: <that sentence>}`; the first ("no action by that id is readable here; one you may not see answers the same") gives way to R43's one fixed `detail`. With actions present, `extra` is absent, so absent, invisible and not-an-action answer byte-identically to every other caller's `noSuchAction(id)`. C-115.2 is retired from `FILINGS_CHECKS` (a departure promotion R34 stamps; reported again at COMPLETE).

## Progress (FILINGS #3)

- **N217 applied** (commits on this branch): `#noAction` answers through actions' `noSuchAction(id, extra)` (its R43), `extra` = `{why: "no module answers an action's read here, so no action is readable"}` only when no actions module is given (K248); C-115.2 `NO_SUCH_ACTION` removed from `FILINGS_CHECKS` (id retired). Tests: `refusals.test.mjs` asserts every R1/R8/R13/R14 site answers byte-identically to `noSuchAction(id)` (absent, invisible, not an action), and the K248 case carries `why`.
- **N296:** every id R1–R21 checked against its tests: each holds and is tested at the interface in full (coverage 21/21). List for BOB at COMPLETE.
- **Verified so far** against a local, uncommitted stub of R43's stated shape: filings 34 pass, 0 fail; format, architecture, coverage (21/21), ownership: 0 failures each.
- **Next step:** when actions' R43 is on `tranche/T11` (J1), merge it, run filings' tests on the real provider, then escalation's (a user of filings' R13) and record COMPLETE.
