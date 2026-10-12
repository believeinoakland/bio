# plane (T46)

**Status** · session_01WBHFsYLZ58Mve6wWPYGz5k · depth 2 · COMPLETE · handled B6

## Work

**Read.** I read these whole, myself:
- `build/requirements/plane.md` (public and private parts).
- Every file of my code: `ask.mjs`, `door.mjs`, `index.mjs`, `screens.mjs`, `stats.mjs`, `store.mjs`, `transcribe.mjs`, `unpack.mjs`, `wiring.mjs`, `wizards.mjs`.
- The tests I changed or that cover what I changed: `ask.test.mjs`, `t42.test.mjs` (R36 part and fixtures), `t45.test.mjs` (R39/R40 part), `maps.mjs`, `fixture.mjs`, `compose.test.mjs` (R11 test).
- My entry T46-62 and the plan's rules.
- The code of the exports I call: run-rules `partAdmittedOn`, `partRefusal`, `untestedLabel`; ai-runs `testInstance`, `partAdmitted`; credentials `accountReferenceState`, `subscriptionConnected`, `#usesOwner`; answers `askAccount`; agent-worker R6's `accountOf`, `untested.mjs` and the `statusreportdraft` task; hypotheses' workerd test.

The reading set (3233 KB) is over the 600 KB limit (mechanics §17 (3), K2032). A helper in my session read the remaining parts whole and wrote me a digest citing each section:
- the public parts of ai-runs, run-rules, credentials, agent-worker, answers, case-account, local-facts, hypotheses, control-plane, extraction, plan-work and op-declarations;
- `draft-T46-trial.md` §0 and §1.2;
- `study-T46-assistant.md` §2;
- `layers.md` layer 11.

The sources stay binding. My other test files were not re-read in full. They ran green unchanged, apart from the re-pins below.

**Entries applied (T46-62).**
- **R40, the gate (N897 (2)).**
  - The ask and draft doors now ask `ai-runs.partAdmitted(part)` alone: part `ask`, or `draft:<kind>`. This replaces the plane's own `partDeployableOn` read.
  - A flag that does not deploy the part is still refused `AI_RUN_MODE_NOT_DEPLOYED`. A flagged part that `partAdmitted` does not admit is refused as `run-rules.partRefusal(part)` answers it, unchanged (`AI_PART_NOT_DEPLOYED`, 403). Nothing is posted in either case.
  - When a part is admitted on the test-instance exception:
    - the ask's request carries `untested` (agent-worker R79);
    - the draft's request and its answer carry it, beside `grant`, `suggestions` and `read`.
  - When the bar admits a part, neither carries a label.
  - A module test's own set now reaches ai-runs through `assistantGateOf(ctx, {testSet})`. The composition root hands it to ai-runs at ai-runs' first construction. The plane no longer holds a set of its own.
- **R40, the transcriber.**
  - `deployable()` is `partAdmitted("transcribe").admitted`.
  - `transcription()` answers `untested`, the label or null.
  - `transcriberOf` takes no `testSet` any more.
- **R40, the status report's draft (N920; B2/K2996 confirmed the shape).**
  - `draftOnObject` takes `{op: "statusreportdraft", plan, items}`.
  - The order is: `draft`'s flag and `partAdmitted("draft:statusreport")`; then the plan, read as the member reads `op=plan`; then `credentials.aiKeptAway({project, use: "draft"})` with the plan's project. All of this happens before any account is read.
  - It mints no grant, sends no `told`, and posts `{task: {op, plan, items}, account, pack?}`.
  - The count as `draft` is the door's (control-plane's draft path); the plane adds none of its own.
- **R33 (trial finding 4; M-T46-6).**
  - `wireAccount` sends the switch of the account that serves:
    - a sign-in's own (`subscription.uses.suggestions`);
    - a member reference's own;
    - the group key's (now on the ask path too, not only the draft path).
  - A `signin` account is sent with no `secret`, on the ask and the draft paths alike.
  - **M-T46-6 measured: no secret reached the wire.** `draftOnObject` (and the ask path) built `secret: ref.key` for every account. A sign-in's `accountFor` answer has no `key`, so the field was undefined and `JSON.stringify` dropped it. What was wrong was the switch: both paths read the reference's (`st.suggestions`), never the sign-in's. The secret is now left out explicitly for a sign-in, and the sign-in's own switch is read.
- **R36 (N886).** The AI path now relays a refusal from agent-worker with agent-worker's own HTTP status (`status` beside the code). Extraction answers it at that status (its R75): 400 `BAD_PAGES` is answered 400. `t42.test.mjs`' pin of `transcription()`'s keys is re-pinned (`untested`).
- **R39 (N935).** The route map spreads `caseAccountOps` and `localFactsOps`. The plane's own `advocacycheck`, `advocacychecks` and `grouprules` entries are gone, from `store.mjs` and from the test map `maps.mjs`.
- **R5.** The route map's tests are re-pinned to T46's ops served through owners' maps: `escalationstoppursuing`, `escalationreopen`, `statusreportassist`, `joindoors`, `clockproposals`, `infolevelset`, `infolevel`. `textcheck` is the draft door's (R41).
- **R42 (K2950).** New `r42-entry.mjs` and a test in `t46.test.mjs`:
  - the plane's own `Store` is booted on workerd under Miniflare, over a store numbered from the shared sequence that holds notes and turns;
  - it answers its first request (`op=notes`), with notes and turns renumbered;
  - workerd refuses a `TEMP` table.
  - Negative control: the same `Store` with one more boot migration that makes a TEMP table does not answer.

- **R40, CHANGE B3 (K2999).** The Store gains two RPC methods beside `ask` and `draft`, for control-plane's door:
  - `dispatchMemberRun(args)`, ai-runs' `dispatchMemberRun` in the object addressed, handed the args as given (the credential an in-process argument only, never answered);
  - `groupFields()`, public-read's `groupFields()` of the object addressed.
  - Tested in `t46.test.mjs`, with controls: a spy shows the owner's answer is returned, not a copy; another object's ai-runs is not reached.

**My own code read whole (P20); flaws found and dealt with (P8).**
- `askOnObject` and `draftOnObject` sent a project's account without its `project`, which agent-worker R6 requires at level `project` (`BAD_ACCOUNT`). `wireAccount` now names it, as the transcriber already did.
- None else found.

**Deferred.** None.

**Found in other modules (for BOB; no change made).**
- local-facts' map takes `by` from the body's stamp (`...b`), while case-account's takes it from the query. That is consistent with each owner's requirement, but worth a look at the door's stamping.
- **Red until instance-setup merges.** `infolevelset` and `infolevel` are served by no module's map on this branch: instance-setup's T46 job adds them (control-plane R76 routes them through its map). `t46.test.mjs`' R5 test is red on those two alone until it merges. With them left out, the test passes.

**Tests and checks.**
- Before the CHANGE merge: `node --test "bio-plane/test/m/plane/*.test.mjs" bio-plane/test/system/migrate-released.test.mjs` gave 222 tests, 221 pass, 1 fail, 0 skipped (the R5 pin on `infolevelset` and `infolevel`, below).
- After merging `tranche/T46` and building B3: `node --test "bio-plane/test/m/plane/*.test.mjs"` gave 223 tests, 222 pass, 1 fail (the same R5 pin), 0 skipped.
- No module uses plane, so there are no users' tests to run.
- Checks:
  - `checks/format.mjs`: 0 failures.
  - `checks/architecture.mjs plane`: 0 failures (54 files).
  - `checks/coverage.mjs plane`: 42 of 42 live ids named, 0 failures.
  - `checks/ownership.mjs plane tranche/T46`: 13 files (`r42-entry.mjs` and `t46.test.mjs` new, under my `tests` path), 0 failures.
- `checks/run.mjs` over the product:
  - architecture: 0 failures (52 plane files among 2974).
  - format: 0 failures.
  - channels: 0 failures.
  - coverage: 13 failures, all in other L11 modules not yet merged (answer-envelope, control-plane, installer, instance-setup, interface-shell, notice-producers, op-grades, the four screens modules, setup-page, wizard-scripts). None is plane's.

Size (session_01WBHFsYLZ58Mve6wWPYGz5k): test runs 9, module lines 2051

**CHANGE B4 (K3004).**
- Merged `tranche/T46`, which now includes instance-setup, action-producers, setup-page and answer-envelope.
- `door.test.mjs` is re-pinned to instance-setup's thirty-six routes. `infolevelset` (a machine's set is refused) and `infolevel` are driven through the door, compared with the route called directly.
- With instance-setup merged, `t46.test.mjs`' R5 pin on `infolevelset` and `infolevel` is green.

**Results after B4.**
- `node --test "bio-plane/test/m/plane/*.test.mjs"`: 223 tests, 223 pass, 0 fail, 0 skipped.
- Checks:
  - format: 0 failures.
  - architecture plane: 0 failures.
  - coverage plane: 42/42, 0 failures.
  - ownership plane tranche/T46: 14 files, 0 failures.

Size (session_01WBHFsYLZ58Mve6wWPYGz5k): test runs 11, module lines 2051

**CHANGE B5, B6 (K3017, K3018).**
- Merged `tranche/T46`, which now holds every other L11 job: control-plane, with R75 bringing interface-assets into the route path, and screens-intake merged again.
- On the B5 merge: `node --test "bio-plane/test/m/plane/*.test.mjs" bio-plane/test/system/migrate-released.test.mjs` gave 224 tests, 224 pass, 0 fail, 0 skipped.
- On the final B6 merge: `node --test "bio-plane/test/m/plane/*.test.mjs"` gave 223 tests, 223 pass, 0 fail, 0 skipped.
- Checks: format 0 failures; architecture plane 0 failures; coverage plane 42/42, 0 failures; ownership plane tranche/T46 14 files, 0 failures.

Size (session_01WBHFsYLZ58Mve6wWPYGz5k): test runs 13, module lines 2051

## J1 · QUESTION

R40 (N920), the status report's draft: control-plane (T46-59, R57) calls the object's `draft` RPC for `statusreportassist`; R40 names the op `statusreportdraft`. My best reading, which I am building: `draftOnObject` takes `{op: "statusreportdraft", member, session, plan, items, pack?}` (agent-worker R76's task op, kind `statusreport`); it gates on `draft`'s flag and `partAdmitted("draft:statusreport")`, refuses AI_KEPT_AWAY through `credentials.aiKeptAway({project, use: "draft"})` with the plan's project (read as the member reads `op=plan`; a plan read refused ends the draft with that refusal) before any account is read, mints no grant, sends no `told`, and posts `{task: {op, plan, items}, account, pack?}` to /draft. The usage count as `draft` is the door's (control-plane's draft path, as for every DRAFT_OPS op); the plane adds none of its own. Please confirm control-plane hands `op: "statusreportdraft"` with `plan` and `items` (not `statusreportassist`), or tell me the shape.

## J2 · COMPLETE

T46-62 complete, with CHANGE B3 (K2999) built. Full detail in the record's Work section.

- R40: the gate now goes through ai-runs.partAdmitted, with the test-instance label on the ask, the draft and transcription.
- R40, N920: the status report's draft, as you confirmed in B2.
- R40, K2999: Store RPCs dispatchMemberRun and groupFields.
- R33: the serving account's own suggestions switch, and no secret sent for a sign-in. M-T46-6 measured: no secret ever reached the wire for a sign-in, because the field was undefined and dropped. What was wrong was the switch read, which is now fixed.
- R36: agent-worker's HTTP status is relayed.
- R39: caseAccountOps and localFactsOps are spread.
- R5: the route map's tests are re-pinned.
- R42: the plane's Store boots on workerd under Miniflare.
- Own flaw fixed (P8): a project's account was sent without its project.

Tests on the merged branch: 223 tests, 222 pass, 1 fail. The red is the R5 pin on infolevelset and infolevel only. No module's map serves them until instance-setup's T46 job merges, and with them left out the test passes. It should go green when instance-setup merges ahead of me.

migrate-released passed (before the CHANGE merge).

Checks: format, architecture, coverage (42/42) and ownership, each 0 failures. run.mjs: architecture 0 failures. Its 13 coverage failures are all in other L11 modules not yet merged.

For you (no change made): local-facts' map takes by from the body's stamp, while case-account's takes it from the query.

## J3 · COMPLETE

B4 (K3004) done. I merged tranche/T46 and re-pinned door.test.mjs to instance-setup's thirty-six routes, with infolevelset and infolevel driven through the door. The R5 pin in t46.test.mjs is now green as well.

Plane module tests: 223 tests, 223 pass, 0 fail, 0 skipped.

Checks: format, architecture, coverage (42/42) and ownership (14 files) each show 0 failures.

Plane is ready to merge last in L11.
