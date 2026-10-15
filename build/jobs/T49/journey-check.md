# journey-check (T49)

**Status** · session_01AMkuPe1DbyB1By7eVPQ9C2 · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Measure first (your START, item 1), on `tranche/T49` @ 5fa1db6433 with every other L11 job still open.

**The composed walk as it stands** (journey 28, journey 3, the sweep): 94 steps, 0 failures, before and after R8 (built: a refusal at any depth of a 200 now fails the step; walker tests pass, 12/12).

**The fake model's seam (doubt 11): settled as K3351 says.** The built-in release the local installer installs uploads the plane only (no fleet), so the local arm binds, as the deployer: `AGENT_WORKER` → agent-worker run from `agent-worker/src/index.mjs` under the same Miniflare, its `PLANE` → the copy, its `RUNNER` → `journey-check/runner.mjs`, a Durable Object class `AgentRunner` answering agent-runner's sign-in (R17–R21, R27, R31) and conversation (R1–R4, R28) contract with the fake model (`fake-model.mjs`). Measured: the copy's bootstrap answers `part_signin: true`; agent-worker's `/version` answers `runner: true`. No model address is added anywhere. A stub city site answers the copy's outbound requests to its own address.

**`site` on the local arm:** not yet. `site` (T49-31) has no code on the tranche (its job is open). Once it merges it can be served the same way (a static Worker under Miniflare at civicsmith.org's origin) and journey 28's first two steps added; I will build that when your CHANGE says it has merged, unless you rule them out.

**R9's steps on the tranche today, each with its owner** (probe through the screens' own controls; the owners' jobs are open, so most of this may already be in hand):
1. Claim with her own handle: the claim has no handle field, and setup says "signed in as admin" — screens-entry (T49-21).
2. Start a project: works (projects' "Start a project" sits in a closed disclosure; the walk opens it). The project screen titles the project by its id ("PROJ-2026-9282-roof-repairs-…") in the title, the crumbs and the question's subtitle — screens-inquiry (`project.mjs`, question). The projects list says "Owner: admin" (R7) — screens-daily (`screen.projects.owner`).
   - R8 catches `projectdirectory` answering `{ok: true, result: {ok: false, code: PROJECT_DIRECTORY_NEEDS_A_MEMBER}}` on the project screen — screens-inquiry `project.mjs` (or control-plane, if the op should not refuse the founder).
3. Open a question: works (`promote` on the project).
4. Connect by subscription on `connect`: the controls are there (`subscriptionsignin`, `mc-code0`); the start asks a re-authentication (`REAUTH_DUE`, the shell's password prompt), which the walk answers. The rest measured once the step is built.
5. "Add a document" on the question: not drawn (no capture control on the question) — screens-inquiry R43 / screens-intake.
9. Run from the dock: no `airunopen` on the question — screens-inquiry (R33, D3).
6–8, 10–12 follow 5 and 9 and are not reached yet.

I go on building R9–R14 against the screens' own controls and the design (journey 29), and I will re-run the walk each time you merge an L11 job. No question for you now.

## J2 · QUESTION

R7: "signed in as the founder, with a handle held and with none". After screens-entry's T49 claim (its open branch: `claim` takes `su-handle`, then she signs in by it), a group claimed now always has a founder with a handle; a handleless founder exists only in a group claimed before T49 (DEC-230's `founderhandleset` step). The local arm makes its group by the screens' own controls, so it cannot make a handleless founder once that claim lands.

My best reading, which I am building:
- The local arm sweeps every screen as the founder with her handle held (after R9 step 1) and checks R7 with no exception.
- Where the group's founder has no handle — the local arm today, until screens-entry merges, and a live instance claimed before T49 (biosmoke8, if it still has one) — the sweep runs as the handleless founder before she chooses, with DEC-230's two words excepted (`founder.handle.says`, `founder.handle.later.help`), then she chooses her handle and the held sweep runs.
- When the claim took a handle, the walk says "R7 with no handle: not walkable here (the claim took a handle)" in its report, as a note, not a failure; the live arm against a pre-T49 instance walks it.

Is that right, or do you want the handleless sweep made some other way?

## Completion (T49-32)

**Read, whole:** `build/requirements/journey-check.md`; my entry T49-32 and the plan's rules in `build/plan/current.md`; layer 11's contract and the helper-module line in `build/layers.md`; all of `bio-plane/src/journey-check/`; the tests naming requirements my entries change (`journey.test.mjs`, `walker.test.mjs`, `live.test.mjs` with `fake-plane.mjs`). Of the services my entries touch: `setup-words` R11–R12 (and its `word`, `hasWord`); agent-runner's contract (R1–R6, R17–R21, R24–R31), which the runner stand-in answers; agent-model's `signin.mjs` (the runner's wire) and `model.mjs`'s judge, sub-session and opening shapes; agent-worker R35, R66 and its `/version`; the installer's binding and fleet code (`newgroup/src/index.mjs`, binding order), `site/src/index.mjs`; design journey 29 and the question's states in `mock-journeys.js`, `mock-screens.js`; the keys asserted, in `words.json`. My other tests (entry, guard) were run, not read.

**Entries applied:**
- **R7:** `sweepAsFounder` sweeps every screen as the founder and fails any drawn `admin` standing alone (`adminAsName`); with no handle, DEC-230's two words (`founder.handle.says`, `founder.handle.later.help`, by `word`) are excepted, with a handle nothing is. Which sweep runs follows her state (J2 asks how the handleless sweep is made once the claim takes a handle).
- **R8:** `refusalsIn` finds `ok`, `started`, `dispatched` or `found` false and a non-empty `withheld` at any depth; each fails the step unless the step expects its code (a string, a pattern, or `{at, code}` for one place in the answer).
- **R9, R10:** `investigation.mjs`: the administrator's twelve steps and the member's journey (project invite, her own subscription, her question, `projectai`, `planask`, her run, Ask), each through the screens' own controls (closed disclosures opened by their summaries; the shell's confirmation, reason and re-authentication answered), each asserting the design's words by key. Step 1 is in `journeys.mjs`: the founder claims with her handle where the claim asks it, else chooses it (`founderhandleset`), then signs in by it.
- **R11:** the local arm binds, as the deployer: `AGENT_WORKER` → agent-worker from source under the copy's Miniflare; its `RUNNER` → `runner.mjs`, the stand-in for agent-runner (sign-in with attempt and a token minted once; conversations only on that token; the fake model `fake-model.mjs`); a stub city site (`city.mjs`); the stand-in for Anthropic's sign-in page (`signin.mjs`); the test-instance mark. The co-attestation services the local arm does not stand in for answer 503 (`OUTSIDE`), and the capture steps expect exactly their failed attempts. `model: false` binds no fake model.
- **R12:** the live arm walks R9 and R10 after its sweeps; the sign-in's code is typed by the person at the terminal (not echoed, kept secret, masked); with none, step 4 fails by name and nothing later runs.
- **R13:** `journeyPairs` pairs each step of design journey 29 (the mock's own walker, journey mode) with the LIVE screenshot of the step that walks it (`JOURNEY_29_STEPS`); a missing pair fails by name. `more` is a working screen, so the live arm's 390 px pairs hold it.
- **R14:** `words.mjs`: every asserted word is named by key and matched against `word(key, vars)`, an unknown placeholder left open.
- **B4 (K3379):** journey 28 now starts at civicsmith.org (`site` served on the local arm, `INSTALLER_ADDRESS` set as its deployer): "what Civicsmith is", then "Start a group" and "Create your group" into the installer. Both steps pass.

**Flaws fixed in my module:** the installer's consent click waited on a navigation the install outlasts (now `noWaitAfter` and a long wait for the callback); the shell's question was read after it had gone (now held by handle, and awaited gone before the next).

**Deferred:** the fake model's judgements past step 9 cannot be measured until a run can be opened from the dock (screens-inquiry R33): it answers each mode's answer tool from that tool's schema and what it read, and `judge_compose`'s suggestion may need shaping to `op=suggest`'s checks once the run is reached. I will do that at the CHANGE that brings the dock.

**Found in other modules (for BOB; the walk on `tranche/T49` @ 472d8f6fa4, 98 steps, 19 failures, every one in an open job or placed by K3379):** step 1, no `su-handle` at the claim nor `su-fh` after it (screens-entry); step 2, the project titled by its id, and `projectdirectory` refusing the founder inside a 200 (screens-inquiry; project-roster N1129); R7, `admin` drawn as a name on forgot ("Your handle is admin"), setup ("signed in as admin"), home and projects ("Owner: admin") and account ("YOUR HANDLE admin") (screens-entry, screens-daily, screens-settings); R10 and R13's missing pairs follow from R9 stopping at step 2.

**Tests and checks:** `node --test --test-concurrency=1 bio-plane/test/m/journey-check/`: 52 tests, 43 pass, 9 fail. The 9: the local arm's walk-through tests (R1 (a), R7 walk, R9, R10, R11, R11 control, R13 local pairs), red only for the defects above, which is what an acceptance test is for; and two fixed and re-run since (R1 (a) world closing, R5 proxy: 2 pass). `node checks/run.mjs /home/user/bio`: architecture 0 failures; format 2 (`site`'s paths, before its merge); coverage 12, all other L11 modules' not-yet-met ids; `coverage.mjs … journey-check` 14 of 14; `ownership.mjs … journey-check tranche/T49`: 0 failures.

Size (session_01AMkuPe1DbyB1By7eVPQ9C2): test runs 14, module lines 2097
