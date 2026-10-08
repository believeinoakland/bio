# admission (T36)

**Status** · session_01JySMhkj6mMeg3Ua2iHFP87 · depth 2 · WORKING · handled B0

## J1 · QUESTION

Best readings I am building on (carrying on meanwhile; none blocks me):
(1) R5 MEMBER_TOKEN_RETIRED is raised in `admit` (the gated ops), first, before any lookup. A public op (classes null) judges no credential, so a live MEMBER_TOKEN presented to one is not refused; `readerOf` (R16) answers it as no one ("") with no lookup. R5's 'gives no class' holds everywhere (`classify` answers null).
(2) R22's count is POSTed to `bio`'s store (the instance's one tally) at `securitycount` with body {kind, country}, whatever namespace the refused request addressed. `securityTally` takes two new optional arguments, `env` and `doAnswer`; without `env` it writes nothing (see my REPORT for control-plane).
(3) MEMBER_TOKEN_RETIRED's tally places the country (countryOf(req)) although the key's 64-hex shape is a session's: the shared key names no member (DEC-166 (2) does not apply).
(4) `queryGate` now removes `token` and `secret` from every URL whatever the op (nothing reads them from the address; the address gate has refused such a request first).
