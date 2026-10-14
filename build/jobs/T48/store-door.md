# store-door (T48)

**Status** · session_01J8JTQt6P29RR1amHyRxcSB · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T48-66 applied; R16 met.

**Read:** requirements/store-door.md; plan entry T48-66; `dispatch.mjs` (whole, 488 lines); `ai-accounts` index surfaces (`aiAccountsOf`, `aiKeptAway`, `accountFor`, `subscriptionConnected`); the tests naming R10/R11/R16 (`routes.test.mjs`, `dispatch.test.mjs` ask cases).
**Entries applied:** `dispatch.mjs` now reads `aiKeptAway` (R10's gate, `aikeptaway`), `accountFor` (R11's `usageOwner`) and `subscriptionConnected` (`subscriptionconnected`) from `aiAccountsOf(ctx)`; `credentialsOf` kept for `aiGrantAdmit`, `signerRegisterOwn`, `signerRevokeOwn` and `reauthdue`. Comments re-pointed to ai-accounts. Every answer, refusal and order unchanged.
**Tests:** the R10 route test's `subscriptionConnected` spy moved to `ai-accounts`; new R16 test (credentials' three delegates made to throw, routes answer as before; negative control with ai-accounts' reads throwing). `node --test bio-plane/test/m/store-door/`: 48 pass, 0 fail.
**Checks:** format 0 failures; architecture 3305 files, 0 failures; coverage store-door 16 of 16 ids named, 0 failures (full run shows 22 failures in other modules, none store-door); ownership 1 file changed by store-door (dispatch.mjs; the test file is under tests), 0 failures.
**Deferred:** none. **Other modules:** `reauthdue` still reads `credentials.session`/`reauthDue` (R15, not in my entry). The dispatch comment in `answers`-fed R10 test fixtures still hands `credentials` to `answersOf` (answers' own job).
Size (session_01J8JTQt6P29RR1amHyRxcSB): test runs 6, module lines 651
