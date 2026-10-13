# agent-worker (T47)

**Status** · session_01NmjWMB4Hpd3GS7Xi1Kiqge · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Two readings to confirm (carrying on with both as written):

1. **`attempt` on `/signin` `code`.** agent-runner R31 (T47) makes `start` answer `attempt` and `code` take it (`ATTEMPT_SUPERSEDED` when it names another). agent-worker R66 still says the body sent on is `{member}` or `{member, code}`, so as written the door's `attempt` would never reach the runner and R31's join could not work. My reading: R66's relay also passes `attempt` through on `code` when the door sends it, as a string of at most 200 characters (another shape is 400 `BAD_CODE`'s sibling, `BAD_ATTEMPT`? — I will NOT add a code: a non-string `attempt` is simply not passed, and the runner's own check answers), and `start`'s `attempt` reaches the door in the runner's answer unchanged. I am building that: `{member, code, attempt?}`. Please confirm, or say to leave R66 as `{member, code}` only.

2. **R84 "`SIGNIN_CODES` equals the codes the module and the runner's tests produce."** agent-runner exports no code list, and reading its test files would be a source-text test. My reading: my test drives every own refusal of `/signin` and finds each code in `SIGNIN_CODES`, drives a stub runner answering each runner code R17–R20, R26–R28, R31 names (pinned in my test from agent-runner's requirements: BAD_REQUEST, BAD_MEMBER, NOT_THIS_MEMBER, SIGNIN_ADDRESS_UNEXPECTED, SIGNIN_UNAVAILABLE, NO_SIGNIN_WAITING, BAD_CODE, SIGNIN_REFUSED, SIGNOUT_FAILED, RUNNER_NOT_STARTED, ATTEMPT_SUPERSEDED) and finds each relayed unchanged but for `trace` and listed, plus SIGNIN_NOT_HELD and SIGNIN_TOKEN_REFUSED; and `SIGNIN_CODES` equals exactly that union. If agent-runner's job exports a code list, I will pin to it instead after it merges.

## Completion (not a message)

**Entries applied.**
- **T47-24 (R56).** Wording only, met by a test that names R56: the suggestions switch is read from the wire's `account`. A sign-in's own switch loads the `suggestions` layer for a draft and an ask exactly when it is on. Its control: a reference's switch is read the same way (t47).
- **T47-80, R81.** A `code` answer's `token` is relayed only when the door's body says `hold: true`. Otherwise `token` and `valid_for` are removed and the answer gains `held: false`.
- **T47-80, R82.** A `signin` account carries `secret` (the held token). `cascadeToken` hands `agent-model` `{kind: "signin", member, secret}`. With no non-empty secret it answers 409 `SIGNIN_NOT_HELD` before any plane call or model turn, on all four paths. A secret that is not a string is `BAD_ACCOUNT`. A published token is `revoked_by_publication`, like any secret.
- **T47-80, R83.** One `signin.worker` JSON line per request, holding only the named fields. The door's `x-civicsmith-trace` (else a minted trace) and `x-civicsmith-member-ref` are passed on to the runner. A runner answer that is not JSON is logged and answered `RUNNER_SILENT` with `runner_status` and `runner_text_head`, after R29's scrub: the code, URL queries, `sk-ant-…`, JWTs and runs of 32 or more characters are removed.
- **T47-80, R84.** `trace` is on every `/signin` answer. A runner's own `trace` is kept unchanged. Each of this module's own refusals has a member-readable `detail` in DEC-149's words. `SIGNIN_CODES` is exported from `src/signin.mjs`.
- **R85 (B2, K3087).** `code` relays `{member, code, attempt?}`; an attempt that is not a string of at most 200 characters is not passed on. `SIGNIN_CODES` is proven by driving the codes, never by reading another module's source.
- **Behaviour change, stated.** A runner answer that is JSON but not an object can no longer carry `trace`, so it is now `RUNNER_SILENT`. A thrown binding error now goes in `detail_from_binding`, scrubbed, and no longer in `detail`. The T37 tests were re-pinned to both.

**Read.** I read `build/requirements/agent-worker.md` and every source file of the module whole. I also read the draft (`draft-T47-L6-connect.md` §0–§4) and the public lines of agent-model R2 and R16 and agent-runner R1–R31. The tests were over the reading-set limit, so per mechanics §17 (3) a helper in this session read all of them in full except t37, and wrote a digest with citations; I read `t37.test.mjs` and the parts I changed myself. The sources stay binding.

**Own flaws fixed (P8).**
- The `t41.control` arm 2 anchor went stale with the new reference; it is re-armed.
- New `t47.control.mjs` credits an arm only with lines that were not already failing before it. Its first run found that the 32-character token scrub was not exercised, and a test for it was added.

**Deferred, with why.**
- agent-model's new `converse({trace, memberRef})` (B3) is not used on `/ask`, `/run`, `/draft` or `/transcribe`. No requirement of mine asks for it, and those requests carry no door trace today. It is a candidate when the door sends one (L11 §3).

**Found in other modules (for BOB).**
- `plane` `test/m/plane/t46.test.mjs` R33 still pins a sign-in sent with no secret. This is draft §3's L11 change (`wireAccount`). It is red on tranche/T47 without my branch too.
- `plane` `roster.test.mjs` R5/R9 (project-roster routing) is red on the tranche baseline too. It is unrelated to this job.
- `fleetbundles`: the bio-plane bundle is stale (accepted red 4). Every agent-worker arm passes, and my bundle was regenerated after B3 and B4.

**Tests and checks.**
- `npm test`: all 17 suites green, 0 failures (t47 114/0, requirements 303/0, t46 71/0, t41 51/0).
- Controls: t47 12/12, t41 9/9, t42 17/17, t46 13/13, cascade 4 as declared, wire-vocabulary 3 as declared.
- Users' tests (P11), control-plane and plane on tranche/T47 @ B4 merged: 466 tests, 463 pass, 3 fail (the three named above, none mine).
- Process checks: `format` 0 failures; `architecture` (agent-worker) 0 failures; `coverage` 77 of 77 ids, 0 failures; `ownership` (tranche/T47) 16 files, 0 failures. `run.mjs`: architecture 0, channels 0, and 43 coverage failures, all in other modules.
- New files: `agent-worker/test/t47.test.mjs` and `agent-worker/test/t47.control.mjs`.

Size (session_01NmjWMB4Hpd3GS7Xi1Kiqge): test runs 32, module lines 3502
