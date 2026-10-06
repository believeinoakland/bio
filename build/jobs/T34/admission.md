# admission (T34)

**Status** · session_01881r9vqe42oZehxYxDvLfc · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings; I carry on with each as stated and stop only if you answer otherwise.

(1) R17 and R19 at admission's interface. Today the door runs R1, then the agent credential's lookup (R6) and R2 for EVERY op, public ones included, so a confined `aik-` credential presented with `websiteinvite`/`joinlinkinvite` is looked up and can be refused `NAMESPACE_CONFINED` or have `store=scratch` set: the credential is used, which R17 forbids. My reading: a new admission export `queryGate(url, op)` (never refuses, returns null), called by the door right after R1 and before R6's lookup, which removes from the URL what an op may not take from the query: for the two doors the caller's `token` (so no lookup, no R2, no reader sees a caller) and `key`/`link`/`cover`; for `groupkeyset`, `key` (R19). The body fields are untouched (control-plane R54/R56 read them from the body). Control-plane's T34-60 then calls it in R28's order (R1, queryGate, R2, R3, ...); I will REPORT that as a wiring item for CONTROL-PLANE (its R28's order names admission's gates; it may want a word added there). Admission adds no limit (R17's cap is membership's).

(2) DEC-149's C-38.8 (`SESSION_ROUTE_NOT_RECORDED`, checks.mjs:111). Your START puts it with C-38.1 under "this group's Civicsmith" as answered to a caller with no session; but `sessionOpGate` raises it only to a signed-in session (a member or the founder), so by K1821 (2) it addresses a member. My reading: "your group's Civicsmith" for C-38.8 and C-38.3/.7-class rows; "this group's Civicsmith" only for C-38.1 (NOT_AUTHENTICATED). If you meant "this group's" for C-38.8 regardless, say so and I change one word.

Dependency: my R3/R17/R18/R19 tests read op-declarations' `OPS` specs for the T34 ops (R22, R24), which are not on `tranche/T34` yet (OP-DECLARATIONS #11 is running). I write them now against op-declarations R22/R24 as worded; they stay red on my branch until op-declarations merges, then I merge `tranche/T34` and post COMPLETE with them green. I will set WAITING ON BOB then; send a CHANGE when op-declarations has merged.
