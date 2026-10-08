# admission (T36)

**Status** · session_01JySMhkj6mMeg3Ua2iHFP87 · depth 2 · COMPLETE · handled B4

## Completion

**Entries applied (T36-36; K2111, K2129, K2130, K2157; N711, N744).** Code `bio-plane/src/admission/` 1,260 → 1,345 lines (`index.mjs` 895, `checks.mjs` 354, `window.mjs` 96).
- R20 (F1's tail): `presentedCredential` reads the token only from an exact `Authorization: Bearer` header or a JSON body's `token`, and the secret only from the body's `secret`, never from the address. `inAddress` is true exactly when the address names a `token` or `secret` parameter, whatever its value. A new gate, `credentialAddressGate(url[, credential])` (B2's name; K2157), refuses such a request 400 `CREDENTIAL_IN_ADDRESS` (C-38.10). It names the parameters (`named`), never the value or its digest. It is the code's one site, and no answer carries `deprecated`. `queryGate` removes `token` and `secret` from every URL (B3 (4)). Gates handed no credential read none from the URL.
- R5 (N711): `MEMBER_TOKEN` stays in `BINDINGS` only as the name R5 refuses. `classify` answers `null` for it. `admit` refuses a live one 401 `MEMBER_TOKEN_RETIRED` (C-38.11), first, before any lookup, read or write. All four bindings are still compared in constant time (9 digests for any credential, tested). With no binding set, an old member key is answered `NOT_AUTHENTICATED` (R7). `readerOf` (R16) reads the retired key as no one, with no lookup. A public op judges no credential (B3 (1)).
- R22 (N744): `securityTally` takes `env` and `doAnswer` and POSTs `{kind, country}` to `bio`'s store-internal route `securitycount` (credentials R50; B3 (2)). The address and headers carry nothing. A failed write is dropped and logged by correlation id only, and never changes the answer. `MEMBER_TOKEN_RETIRED` counts as kind `credential`, with the request's country: the shared key names no member (B3 (3)).
- R14: two new rows, **C-38.10 `CREDENTIAL_IN_ADDRESS`** (BOB's translation with K2129's protective sentence) and **C-38.11 `MEMBER_TOKEN_RETIRED`**, both awaiting promotion's stamp (T37; plan red 4). No row was re-worded.

**Deferred.** Nothing.

**Reading (mechanics §17, N739).** I measured the reading set as mechanics §3 asks: requirements 24 KB; code 87 KB; tests 108 KB; layer 11's row and the control-plane split section of `layers.md`; the Purposes of the seven used modules (about 4 KB); and the services my Uses names (op-declarations Terms and R2–R6, runtime-limits `liveToken`, credentials R5, R15, R42, R44 and R50, capture R56). The total is about 230 KB, under 300 KB, so I read it all myself and used no workers. I also read whole the plan's rules at the opening, my entry T36-36, K2111, K2129, K2130, K2038 and K1936, the draft sections with their "BOB's review", and the control-plane code that calls my gates (index.mjs:100–126, 255–275, 455–600).

**Found in other modules (also in my REPORT J2).**
- control-plane (T36-37) must call `credentialAddressGate` directly after R1. It must also hand `env` and `doAnswer` to `securityTally` (index.mjs:120); until then no count is written. 50 of its tests fail with my change (163/4 → 113/54): they call as the member binding or with the address form, and are T36-37's to re-pin.
- plane (T36-49): `worker.test.mjs` R6 and `test/system/migrate-released.test.mjs` both use `?token=` (the latter `MEMBER_TOKEN`), so they are re-pinned with plane's job.
- No generated artifact is made stale beyond the plane bundle, which BOB regenerates at layer close.

**Tests and checks** (after merging `tranche/T36` for B2).
- `node --test bio-plane/test/m/admission/`: `ℹ tests 34`, `ℹ pass 34`, `ℹ fail 0`.
- Users, without my change → with it: answer-envelope 24/2 → 24/2; control-plane 163/4 → 113/54; plane 128/2 → 127/3; migrate-released 1/0 → 0/1.
- `format: 135 modules, 134 requirements files; 0 failures`
- `architecture: 14 product files, 27 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 22 of 22 live requirement ids named by a test; 0 failures`
- `ownership: 12 files changed by admission between tranche/T36 and HEAD; 0 failures`

Size (session_01JySMhkj6mMeg3Ua2iHFP87): test runs 16, module lines 1345

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

## J3 · COMPLETE

T36-36 complete on job/T36/admission (record's Completion section). R20: credentialAddressGate (400 CREDENTIAL_IN_ADDRESS, C-38.10); R5: MEMBER_TOKEN_RETIRED (401, C-38.11), four bindings still compared; R22: securityTally writes {kind, country} to bio's securitycount, MEMBER_TOKEN_RETIRED counted as credential; R14: rows added C-38.10 CREDENTIAL_IN_ADDRESS and C-38.11 MEMBER_TOKEN_RETIRED (none re-worded), awaiting T37's stamp. admission 34/34; format, architecture, coverage, ownership 0 failures. Users' reds from my merge until T36-37 and T36-49: see J2. Ready to merge after N711's callers, when you say so.
