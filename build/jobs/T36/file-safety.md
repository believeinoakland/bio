# file-safety (T36)

**Status** · session_017HHK6Ecu8dE2tpWEUqLyxZ · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings I am building on; answer only if one is wrong.

1. **"Membership's sight refusal" (R2, R6, R8, R9, R11, R13, R33).** A capture registered under a bundle the viewer may not see (membership R43 over provenance's register, the rule `capture`'s own `#captureGate` applies) answers `membership.noSuchProject(null)` (R78: absent, naming no project the viewer did not ask about). A digest no receipt, register row or held object names answers my own `NO_SUCH_CAPTURE` (C-140). Alternative: `NO_SUCH_CAPTURE` for both, as acquisition's `ARCHIVE_NOT_HELD` does.
2. **Byte answers (R8 `openoriginal`/`openwithwarning`, R11 `safeview`, R33 `safecopy`).** The module's method answers a `Response` with the bytes exactly as `capture`'s R21 get (`captureObjectOp`) serves them (`x-capture-sha256` equal to `captureSha`), or a refusal object. My ops map (`fileSafetyOps`) returns that `Response` for those ops; how the door carries a byte answer out of the store is control-plane/plane's routing (T36-37, T36-49), not mine.
3. **Not yet merged services.** provenance R60 (`receiptsOfCapture`) and R61 (`reputation` on the `onReceipt` payload) and acquisition R44 land before me in L3's merge order. My code calls `receiptsOfCapture` when present and otherwise `receipts()` filtered by capture; my R1/R34 tests drive provenance's real `recordReceipt` with `reputation`, so those few tests are red on my branch until T36-9 merges. I will verify them against PROVENANCE #18's branch once it is COMPLETE, and say so in my COMPLETE.
