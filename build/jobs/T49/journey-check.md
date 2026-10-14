# journey-check (T49)

**Status** · session_01AMkuPe1DbyB1By7eVPQ9C2 · depth 2 · WORKING · handled B0

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
