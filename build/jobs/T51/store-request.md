# store-request (T51)

**Status** · session_01KkxdPkQTFsfr63anJhveG7 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Five readings; I am building on each now and stop for none of them.

1. R22 (control-plane holds none of the rules and calls innerRequest) can only be met by control-plane's Wave B job (K624; my START: control-plane keeps its code). Reading: R22 is named in a `test.todo` here, as store-assembly R98 was (K5125 (3)), and stays not yet met.
2. R23, the grant issuers (`reviewgrant`, `templatereviewgrant`): control-plane's `withDigest` turns a JSON body that is not an object (an array, `null`) into `{secretSha}`; R23 says such a body passes unchanged so no grant is made. Reading: the requirement wins (a non-object JSON body or non-JSON text passes unchanged, no digest anywhere); an absent body becomes `{secretSha}` as today (R23 is silent on absent).
3. R23's secret ops (`reviewcopy`, `reviewcomment`, `statementack`, the four template doors) are public ops whose address control-plane builds afresh (only `draft`, `limit`, `drafts`, `case`/`edition`, `reason`). Reading: innerRequest applies R2-R5, R9 and R23 to them exactly as written (the address keeps the page's other parameters, less R3's); the narrower address those arms build stays the arm's, for control-plane's Wave B job to reconcile under R137.
4. `modules.json` has empty `paths`/`tests` for store-request (K1043, K5125 (1): filled by BOB at the merge). Reading: I commit no `modules.json` change; I run architecture/coverage/ownership with the row filled in my working tree only, and my COMPLETE names the two paths.
5. R17's arms need control-plane's `sha256Hex`, `captureKey`, `storageAbsent`, `caseReader` (later module). Reading: the world (test support) re-makes each from an earlier module (record-grammar `createSha256`; store-assembly R2's `<namespace>/captures/<sha>`; acquisition `evidenceStorageAbsent` with answer-envelope `json`; admission `readerOf` with `doAnswer`), and R15's parity test covers the requests those arms make only where they go through innerRequest.
