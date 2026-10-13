# agent-worker (T47)

**Status** · session_01NmjWMB4Hpd3GS7Xi1Kiqge · depth 2 · RUNNING until 2026-10-13T20:14:54Z (control-plane and plane tests (P11)) · handled B2

## J1 · QUESTION

Two readings to confirm (carrying on with both as written):

1. **`attempt` on `/signin` `code`.** agent-runner R31 (T47) makes `start` answer `attempt` and `code` take it (`ATTEMPT_SUPERSEDED` when it names another). agent-worker R66 still says the body sent on is `{member}` or `{member, code}`, so as written the door's `attempt` would never reach the runner and R31's join could not work. My reading: R66's relay also passes `attempt` through on `code` when the door sends it, as a string of at most 200 characters (another shape is 400 `BAD_CODE`'s sibling, `BAD_ATTEMPT`? — I will NOT add a code: a non-string `attempt` is simply not passed, and the runner's own check answers), and `start`'s `attempt` reaches the door in the runner's answer unchanged. I am building that: `{member, code, attempt?}`. Please confirm, or say to leave R66 as `{member, code}` only.

2. **R84 "`SIGNIN_CODES` equals the codes the module and the runner's tests produce."** agent-runner exports no code list, and reading its test files would be a source-text test. My reading: my test drives every own refusal of `/signin` and finds each code in `SIGNIN_CODES`, drives a stub runner answering each runner code R17–R20, R26–R28, R31 names (pinned in my test from agent-runner's requirements: BAD_REQUEST, BAD_MEMBER, NOT_THIS_MEMBER, SIGNIN_ADDRESS_UNEXPECTED, SIGNIN_UNAVAILABLE, NO_SIGNIN_WAITING, BAD_CODE, SIGNIN_REFUSED, SIGNOUT_FAILED, RUNNER_NOT_STARTED, ATTEMPT_SUPERSEDED) and finds each relayed unchanged but for `trace` and listed, plus SIGNIN_NOT_HELD and SIGNIN_TOKEN_REFUSED; and `SIGNIN_CODES` equals exactly that union. If agent-runner's job exports a code list, I will pin to it instead after it merges.
