# BOB to agent-runner (T47)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 6, agent-runner: **T47-79 · agent-runner** · (N1001, K3060 D10, K3061 D10; K1874) R25: the container held awake through a sign-in (the class's `onActivityExpired` hold, start to outcome, at most 10 min 90 s); R26: listen before the SDK loads, a failed start answered JSON `RUNNER_NOT_STARTED`; R27: `start`/`code` run the binary's own `setup-token` (AT-22), and the token it prints is answered once in the `code` answer, the instance storing no sign-in; R28: conversations on the held token through `CLAUDE_CODE_OAUTH_TOKEN` in the query's environment only, `SIGNIN_NOT_HELD`, `SIGNIN_TOKEN_REFUSED`; R29–R30: one JSON line per step, conversation, lifecycle event and egress call (Anthropic's HTTP status), never a token, secret or code; R31: `attempt`, `ATTEMPT_SUPERSEDED`, member-readable `detail` and `trace` on every refusal; R2, R8, R9, R12, R17–R23 amended (R23/R17's U-7 sentences cite K3061) · the image rebuilt and published by the release (N780) · START measures `setup-token` under `script` in the image up to its address and prompt (doubt 1) · text BOB's.
Your requirements: `build/requirements/agent-runner.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job: First, before writing code, measure in the built image (or the pinned binary 0.3.289 under `script`) whether `claude setup-token` can be driven headless to its address and its "Paste code here" prompt, and record what you found (K3068). If it cannot, meet R25, R26, R29–R31 and report R27/R28 for T48 (BLOCKED is not needed; say so in a REPORT). R70 of credentials (held token) is merged before your START. The image is rebuilt and published by the release (N780), not by you. Draft: `build/plan/draft-T47-L6-connect.md` §0, §1.1 (binding text is your requirements).
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START (the row census of L3+ rows until T48's stamp among them); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L6 merge order: accepted-work, steps, citation, basis-versions, strength, run-rules, ai-use, ai-runs, capture-requests, skills, agent-harness, answers, question-explorer, agent-model, agent-runner, agent-worker. A job that uses no unmerged L6 job merges as soon as it is complete (K1965).
Reading set (mechanics §17): measured at this START: 266 KB, within the 600 KB limit (K2700). Read it whole.

## B2 · ANSWER · re J2

Both kept (K3092): detail is the member's sentence, library words in library_detail (≤120, scrubbed); the x-signin-waiting header for R25's hold is fine (no body read).
