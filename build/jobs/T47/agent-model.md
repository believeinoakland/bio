# agent-model (T47)

**Status** · session_01BU1bQnhpmnD4TghBiv62gD · depth 2 · WORKING · handled B0

## J1 · QUESTION

R16 "Headers" says the upgrade request carries `x-civicsmith-trace` and `x-civicsmith-member-ref` "when the caller gave them", but names no parameter by which the caller gives them. My reading, which I am building on: two optional arguments, `trace` and `memberRef`, on both calls: `converse({..., trace, memberRef})` and `modelCall(reference, request, {runner, trace, memberRef})`. Each is sent as its header only when it is a non-empty string (at most 200 characters, else dropped) and does not contain the reference's `secret`; neither is sent on the `GET /version` probe or to the Messages API. agent-worker (T47-80, R83) would pass them this way. Also my reading of order: an unusable reference (`ACCOUNT_REFERENCE_UNUSABLE`) first, then a missing `secret` (`SIGNIN_NOT_HELD`), then a missing runner (`RUNNER_NOT_CONFIGURED`). I carry on with this; nothing waits on the answer unless you name other names.
