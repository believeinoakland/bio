# ratification (T51)

**Status** · session_01BEW2JCeWXjiogDsVNixAnp · depth 2 · WORKING · handled B0

## J1 · REPORT

Findings in other modules, found while running the words check and the process checks on the merged tree (not changed by this job; described against the words rule K3930, K3949):

1. `bio-plane/src/case-authoring/index.mjs:1653` (inline, plain): "ratification's pre-flight gave no answer". A member-facing sentence held in case-authoring's own source, outside the words rule. Owner: case-authoring.
2. `bio-plane/src/deliverer.mjs:42` (inline, under publication's paths): "who DELIVERED this ratification was not recorded: it was ratified b...". Owner: publication (the file sits in the publication family's source).
3. `checks/run.mjs` over the whole product reports 2235 words failures across other modules (inline 1564, plain 465, testcopy 509, handlist 161, missingkey 1). None is in the ratification module after this job's changes. I did not work any of them.
4. Not converted, for BOB's ruling (K3944): API and wire text in this module that names parameters for a developer caller, not for a member. Examples: `ops.mjs` MALFORMED details ("caseratify requires caseId, edition (integer), ..."; "ratify requires bundleId, expectedSha, and sig ..."; "publishat requires ..."), `index.mjs` `registerApprovalReader` / `registerHoldReader` MALFORMED details ("registerApprovalReader takes {rule(), approvals(...)}"). The checker does not count them, so they are not findings. Left as they are until BOB rules whether they are developer text (a BUILTIN_ERRORS-style exemption) or member text.
