# admission (T36)

**Status** · session_01JySMhkj6mMeg3Ua2iHFP87 · depth 2 · RUNNING until 2026-10-08T06:39:37Z (users' tests (answer-envelope, control-plane, plane) with and without my change) · handled B3

## J1 · QUESTION

Best readings I am building on (carrying on meanwhile; none blocks me):
(1) R5 MEMBER_TOKEN_RETIRED is raised in `admit` (the gated ops), first, before any lookup. A public op (classes null) judges no credential, so a live MEMBER_TOKEN presented to one is not refused; `readerOf` (R16) answers it as no one ("") with no lookup. R5's 'gives no class' holds everywhere (`classify` answers null).
(2) R22's count is POSTed to `bio`'s store (the instance's one tally) at `securitycount` with body {kind, country}, whatever namespace the refused request addressed. `securityTally` takes two new optional arguments, `env` and `doAnswer`; without `env` it writes nothing (see my REPORT for control-plane).
(3) MEMBER_TOKEN_RETIRED's tally places the country (countryOf(req)) although the key's 64-hex shape is a session's: the shared key names no member (DEC-166 (2) does not apply).
(4) `queryGate` now removes `token` and `secret` from every URL whatever the op (nothing reads them from the address; the address gate has refused such a request first).

## J2 · REPORT

Users' tests with my change (job/T36/admission @ my T36-36 commit) against the same tranche tip without it (tranche/T36 @ 4bcdfe4ea3):
- answer-envelope: 24/2 both (unchanged).
- control-plane: 163/4 → 113/54. The 4 are unchanged. The 50 new are its tests that call as the member binding (42 meet MEMBER_TOKEN_RETIRED) or send a credential in the address (now not read: NOT_AUTHENTICATED; 4 still expect `deprecated`). Each is T36-37's to re-pin with R59/R28. Proposed as a named red from my merge until T36-37.
- plane: 128/2 → 127/3. New: `worker.test.mjs` R6 ('in the runtime, the door answers through the hooks…'), whose op is called with `?token=` (now 401 NOT_AUTHENTICATED). `test/system/migrate-released.test.mjs`: 1/0 → 0/1; it calls every op as `?token=<MEMBER_TOKEN>` (lines 217–220). Both are T36-49's to re-pin (plane's tests). Proposed as named reds until T36-49.
Found for control-plane (T36-37), against admission R20/R22 and control-plane R28/R59: (a) call `credentialAddressGate(url, credential)` directly after `namespaceGate`; (b) R22's count is written only when `securityTally` is handed `env` and `doAnswer`: today `outOfAddress` (control-plane/index.mjs:120) passes neither, so nothing reaches `securitycount` until it does; (c) `classify` now answers null for MEMBER_TOKEN, so `groupRead` (index.mjs:270) reads that key as a stranger, which is R5's intent.
No generated artifact staled by me beyond the plane bundle that BOB regenerates at layer close.
