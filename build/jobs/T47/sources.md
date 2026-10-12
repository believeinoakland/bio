# sources (T47)

**Status** · session_012DLyugbYugm9hcAwhQQgJk · depth 2 · WORKING · handled B0

## J1 · QUESTION

`sourcepublishable`'s `at`. The plan entry (T47-13, K3027/K3033) says `sourcepublishable` is evaluated at the server's instant, a query `now`/`at` ignored. `build/requirements/sources.md` (R8 signature `publishableAt({source, audience, at?})`, and the T47 suggestion) says the opposite: R8's `at` is a stated instant asked about, not N983's subject, "whether a caller may choose it is left as it stands". Requirements are the contract, so my best reading: leave `op=sourcepublishable` passing the query's `at` unchanged and build only R20. If you mean the plan's half, amend R8 (e.g. "`op=sourcepublishable` evaluates at this module's instant; a query `now`/`at` is ignored; the in-process `publishableAt` keeps `at?`", which R20's callers need) and I will apply it with a test. Carrying on with R20 meanwhile.
