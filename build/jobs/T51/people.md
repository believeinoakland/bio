# people (T51)

**Status** · session_016nx6W8cHCnGj3NUy1ARzAe · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two questions; R40 and R41 are built and tested on my best readings (committed on my branch), and I carry on with the record meanwhile.

1. **people's `uses` lacks `setup-words`** (your file, `build/modules.json`). K3810/R13 have my tests assert keys with `hasWord`/`word` from `setup-words`; `checks/architecture.mjs` fails 2 files (`identity.test.mjs`, `reads.test.mjs`, now also `why.test.mjs`) with "imports setup-words, which people does not declare in uses". Best reading: add `setup-words` to people's uses (it is layer 1 and "uses nothing"). Until you do, I cannot reach 0 architecture failures. The module code itself imports nothing from it.

2. **R40's "hub answer (R26)" breaks connection-grammar's `neighbours` contract.** R40 says the hub answer's `why` is `{key: people.why.person_end_identity, vars: {hub}}` and an item's `undetermined.why` is a key too. But connection-grammar's `reads.mjs` (R6/R20) judges `hub.why` and `item.undetermined.why` by `filled()`, i.e. a non-empty STRING, and the registry then refuses people's answer `OWNER_NONCONFORMING` ("hub: a hub is answered {set_size, why}"; I reproduced it with a person with more than BOUNDS.hub claims). I built it as R40 states (keys). Best reading: connection-grammar's entry accepts `{key, vars}` for those two `why`s (its module's change, not mine). If instead the contract stays a string, tell me and I put the strings back at those two sites (hub, and a claim's `undetermined`).
