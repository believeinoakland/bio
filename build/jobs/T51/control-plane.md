# control-plane (T51)

**Status** · session_01QFTaUWP2RH4XUurB8ppEkF · depth 2 · RUNNING until 2026-10-24T14:40:57Z (node --test t51-round9-seam.test.mjs) · handled B74

## J1 · QUESTION

control-plane T51-123: everything is done and pushed except R110 and R111 (the routes for the reads T51 adds), which I cannot test yet.
Done: /sign route, import and files deleted (R109) with tests; ACQUIRE_TIMED_OUT detail by word("refusal.ACQUIRE_TIMED_OUT") (R105); draft over-limit sentence keyed (control-plane.draft.draft_over_limit); all 32 words findings cleared (words check: 0 failures); 304 tests pass, 0 fail.
Blocked on a dependency: none of heldat, bundlehistory, entityidonly, subjectsnamed, entitysimilar, projectinvitations, publishedfrozen, versioncompare, holdsdue, templatebyhandle, rulefields, adminremovalsopen is declared in op-declarations on tranche/T51 yet (T51-107 is still WORKING). The owners' code is on the tranche. My best reading: the door's generic OP_STAMPS stamping and plane's owner maps route them, so control-plane needs no source change, only tests (R110, R111; coverage shows R111 unnamed). QUESTION: merge op-declarations' T51-107 into tranche/T51 and send me CHANGE; I then merge, write and run the R110/R111 tests and complete. Until then I wait.
Also BOB's: build/modules.json control-plane paths still list bio-plane/src/signpage.mjs, sign-release.html and scripts/embed-signpage.mjs, now deleted (checks/format.mjs: 3 failures; drop them). Plane's package.json `embed:sign` and the "build" step still call the deleted script (T51-125), and answer-envelope's page-policy.test.mjs still imports SIGN_HTML (T51-109): both red until those merge.
REPORT, strings judged unread by members (diagnostics, wire grammar), left in source: REPLAY_UNVERIFIED `detail` (root-of-trust migration caller), whoami `detail`, claim `error` sentences (byte-identical C-68 rows; members read the installationRow words), knockerconsent "is a POST", purge "requires confirm=<store>", reviewgrant/templatereviewgrant `read` usage line (API instruction), the in-band quartet's `over` description.

## Completion (T51-123)

**Entries applied.** R109: the `/sign` route and the `SIGN_HTML` import are gone; `signpage.mjs`, `sign-release.html`, `scripts/embed-signpage.mjs` and the tests `signpage.test.mjs`, `signer-keys.test.mjs` are deleted; `/sign` and `/sign/` draw R104's page (404), `/api/sign` and `/?op=sign` answer UNKNOWN_OP; `doors.test.mjs` and `page-policy.test.mjs` re-pointed; stale comments (`index.mjs` UNKNOWN_OP note, the D-78 note, `app.mjs`' R104 comment) brought to the retired legacy-ui. R105: `ACQUIRE_TIMED_OUT`'s `detail` is `word("refusal.ACQUIRE_TIMED_OUT")` (test: equals the word, `hasWord` holds the key, no other op carries it). R110/R111: tests (`t51-door.test.mjs`) for every read op-declarations R77/R78 declares, derived from `op-declarations/t51.mjs`; owner arms `approvedunsent` and `checkpointsdue` added to `owner-ops.mjs` (B3, K4073; test in `owner-ops.test.mjs`). Words (W): all 32 findings fixed (22 hand-lists derived from the owners' declarations, 10 test copies compared by key or equality); `ACT_CLOCK_OPS` exported for t46's test; `draft.mjs`' over-limit sentence keyed `control-plane.draft.draft_over_limit`.

**Readings (BOB may correct).**
1. R110 says an `ai` credential is refused `heldat` ("in none of its classes"). op-declarations R77 gives `heldat` no `machineClasses`, so admission admits an agent in its scope: it reaches capture with `by` `class:ai/<tokenId>` (machine form, which capture refuses for `check: true`). The test pins that behaviour and the daemon's refusal. Either R110's control is amended or op-declarations adds `machineClasses` to `heldat`: BOB's.
2. R110's "a `member` sent in the query or body is deleted": `member` is no declared stamp of these reads and none of their owners reads it, so it is not stripped (it is a real parameter of other ops); the test asserts it is never the session's.
3. R110's `bundlehistory`, `templatebyhandle` etc. are routed by the door's generic stamping through plane's owner maps; no door source was needed beyond the two arms above.

**Deferred.** None.

**Found in other modules.** (a) plane's `store.mjs` must hand `controlPlaneOwnerOps` the getters `filings` and `actionPlans` (the two new arms call `of.filings()` and `of.actionPlans()`): T51-125. (b) `build/modules.json`: control-plane's `paths` still list the three deleted files (format check, 3 failures): BOB drops them. (c) Reds at this tranche tip that are not control-plane's: 18 tests that build the interface page fail with `interface-shell: screen action's act actionhold is not the registry's for it` (screens-action not merged yet: doors, page-policy, t46-app, t46/t47-e2e, t48 R95 and others); `R2, R41 … affordances' unaccounted` names `publishedfrozen` stale (affordances/op-grades, told by CHANGE K4073). (d) `answer-envelope`'s `page-policy.test.mjs` imported `SIGN_HTML` (T51-109) and the plane's `package.json` build still runs `embed:sign` (T51-125). (e) Strings judged unread by members, left in source (REPORT J1): REPLAY_UNVERIFIED `detail`, `whoami` `detail`, claim `error` rows, knockerconsent "is a POST", purge "requires confirm=<store>", the `read` usage line of reviewgrant/templatereviewgrant, the in-band quartet's `over` description.

**Tests and checks.**
- `node --test bio-plane/test/m/control-plane/`: 309 tests, 290 pass, 19 fail: the 18 page tests and the one affordances test named in (c); the rest pass, R109, R105, R110, R111 included.
- `node checks/words.mjs /home/user/bio control-plane`: 0 failures; over the whole tree no line names control-plane.
- `node checks/coverage.mjs /home/user/bio control-plane`: 79 of 79 live ids named by a test.
- `node checks/run.mjs`: format 3 failures (the modules.json paths, BOB's), architecture 0 failures.
- `node checks/ownership.mjs /home/user/bio control-plane tranche/T51 job/T51/control-plane`: 0 failures.
- `node bio-plane/src/setup-words/build.mjs --check`: stale-rows note only (the new id), no refusal naming control-plane.

Size (session_01MjHoyG8YgVa17VY9VtDzG2): test runs 22, module lines 3,905

## J2 · COMPLETE · re B4

control-plane T51-123 complete and pushed: R109 (signing page gone), R105 (ACQUIRE_TIMED_OUT detail by key), R110/R111 tests, the two owner arms (approvedunsent, checkpointsdue), all 32 words findings; words 0 failures, coverage 79/79, ownership 0, architecture 0. Control-plane suite 290 of 309: the 19 reds are not control-plane's (18 page tests: screens-action not merged; affordances' unaccounted names publishedfrozen). For BOB: (1) R110 says an ai credential is refused heldat, but op-declarations R77 gives it no machineClasses so admission admits it (by class:ai/<id>, capture refuses check:true): amend R110 or add machineClasses to heldat; (2) plane must hand controlPlaneOwnerOps the getters filings and actionPlans; (3) drop the three signing-page paths from modules.json (format: 3 failures). Details in build/jobs/T51/control-plane.md.

## Re-completion (B5, K4100)

After merging `tranche/T51` (op-declarations J7: `heldat` readfenced, machineClasses admin and probe), `t51-door.test.mjs`' `heldat` arm now expects the refusal R110 states: an `ai` credential is refused (`ok: false`, status not 200) with no `heldat` store request; the daemon control is kept. Reading 1 of the completion above is withdrawn. `node --test bio-plane/test/m/control-plane/`: 309 tests, 309 pass, 0 fail (screens merged, the page tests are green). Words 0 failures, coverage 79 of 79, ownership 0 failures.

Size (session_01MjHoyG8YgVa17VY9VtDzG2): test runs 24, module lines 3,905

## J3 · COMPLETE · re B5

control-plane re-completed (B5): heldat's arm now expects the ai refusal, daemon control kept; control-plane suite 309 of 309 pass; words 0, coverage 79/79, ownership 0. Record updated.

## J4 · BLOCKED

Cause: needs Bob (items 1 and 3) and tests (item 2).

The fix round's control-plane entries are applied and pushed on `job/T51/control-plane` (f442ae0d72): K4206 and K4210 (R112), K4213 (R113). Three items wait on Bob or on another module; the rest is done.

**Done**
- **R112 (K4206, K4210):** `DECLARED_OPS` in `bio-plane/src/control-plane/owner-ops.mjs` declares `captureupload`, `accountdrafts`, `accountpropose`, `clockpropose` and `subscriptionsignin`. Classes, machine classes, mutating flag, stamps and needs are copied from the hand rows. Weight and description come from the grade; each description is `control-plane.declared.<op>`. Accepts are the fields each arm reads. Requires are only the fields a refusal names when absent: `statement` (`UPLOAD_NO_STATEMENT`), `case` (`NO_SUCH_CASE`), `framing` (`BAD_ACCOUNT_FRAMING`), `text` (`BAD_ACCOUNT_DRAFT`, field `text`), `run` (`NO_SUCH_RUN`), `target` (`NO_TARGET`), `rule` (`NO_SUCH_RULE`), `step` (`BAD_STEP`). No arm changed.
- **R113 (K4213):** `index.mjs` gives `taskdecide` the body `actor` stamp that `taskforward`, `taskresolve`, `taskdrain` and `biasdebtresolve` take.
- **Tests:** `declared-ops.test.mjs` (6, `declaredOpHolds` per op through real owners), `declared-registration.test.mjs` and `declared-disagree.test.mjs` (the registrations take the rows; a disagreeing row is refused naming the op), `t51-taskdecide.test.mjs` (2). The module's suite: 317 of 319 pass.

**Waiting**
1. **Needs Bob, architecture (1 failure):** `declared-ops.test.mjs` imports the `action-clocks` test fixture, because `clockpropose` is run through its real owner. `action-clocks` is not in control-plane's `uses`. Please add it as a test-only use, or tell me to test `clockpropose` another way.
2. **Tests, R113 (2 red):** `taskdecide` has no spec on `tranche/T51` yet. It is `tasks` R20 (FR-21), so the door answers `UNKNOWN_OP`. `tasks` (index 143) merges before control-plane (168), so I expect this to clear when FR-21 lands. I will merge `tranche/T51` and re-run once it does.
3. **Needs Bob, ownership:** `build/requirements/control-plane.md` is outside my paths. K4210 accepts that at merge. R112 and R113 are written there, R113 marked not yet met.

**Reports (not my files)**
- **Words, `op-grades`:** `bio-plane/test/m/op-grades/t37.test.mjs:26` holds the sentence I declare as `control-plane.declared.subscriptionsignin`, so the words check now reports a testcopy. That test should read the key, not the sentence. The other seven testcopy findings are other modules' and predate this job.
- **Generated, setup-words:** `bio-plane/src/setup-words/rows.mjs` is stale for the new `control-plane.declared.*` keys and for keys other jobs added. Regenerate it at the merge or in the pass.
- **To confirm:** `subscriptionsignin`'s `step` requirement is checked against a stand-in for agent-worker R66's `BAD_STEP`, since agent-worker is another module. The door relays that refusal as given. The hand rows stay in `op-declarations` and `op-grades` until the removal pass (K4168).

**Checks**
- `checks/format`: 0 failures.
- `checks/architecture`: 1 failure (item 1).
- `checks/coverage`: 81 of 81 live ids named.
- `checks/ownership`: item 3 only.
- `checks/words`: the t37 testcopy above.

## J5 · BLOCKED

Cause: tests (item 2) and needs Bob (item 1).

Pushed on `job/T51/control-plane` (3bde8a49d2). ANSWER J4 (K4219) read: `action-clocks` is in `uses` and the ownership listing is accepted. Architecture now passes.

**Done**
- **CHANGE (a), K4219, R114:** `CASE_IMPORT_ACTIONS` gains `rerunstart` and `rerunpair` (acts, `by` from the session). `CASE_IMPORT_READS` gains `importregrade` and `rerunread` (viewer only). The routing test (`r49-routes.test.mjs`, R49/R114/R2/R26) reads case-import's op list from its own export `CASE_IMPORT_OPS`, and splits acts from reads by the op table's `mutating`. It registers case-import's `DECLARED_OPS` first (`register-case-import.mjs`), because a registration must be a process's first read. Six of six pass.
- **Checks:** coverage 82 of 82; architecture 0 failures; format 0; words 0 failures for my module.
- **Suite:** 317 of 319 pass.

**Waiting**
1. **Tests, R113 (2 red):** `taskdecide` still has no spec on `tranche/T51`. `tasks` FR-21 has not landed, so the door answers `UNKNOWN_OP`. I will re-run once `tasks` merges.
2. **Needs Bob, CHANGE (b), acquisition R95:** I have not built it. Acquisition's requirements have no R95 and nothing exports `stageTimes` or takes `timings`, so the door would call a service that does not exist. I need acquisition's job to land R95 and `stageTimes` first. Then I will hand `opts.timings` to `acquire`, add `stageTimes(timings)` to the `ACQUIRE_TIMED_OUT` body, and test it with a control. Is that job on this tranche?

**Reports (other modules)**
- **case-import declarations:** its `DECLARED_OPS` covers 9 of its 14 exported ops. `importedcase`, `importedcases`, `caseimportdocument`, `importflagclear` and `importunwatch` have hand rows in the op table only. Its owner should declare them.
- **Registration:** the four rerun ops have no hand row, so they reach the door only through the plane's registration of case-import's `DECLARED_OPS`. The plane must register it at start-up, as R80 says.

## J6 · BLOCKED

Cause: needs Bob (one hand-off in two modules).

Pushed on `job/T51/control-plane` (8c98643289). ANSWER J5 (K4222) read: `tasks` and `acquisition` are merged, and both neither item was Bob's.

**Done**
- **R113 (K4213), green.** I merged `tranche/T51`. The `taskdecide` test now registers `tasks`' declared ops first (`register-tasks.mjs`), the same way as case-import. Both tests pass.
- **R22 (envelope.test.mjs):** it hard-coded 17 `C-138` rows. `tasks` has added two more, so the count now comes from the table.
- **CHANGE (b), R115 (K4222), the door's half:** the door creates the timings object for `acquire` and passes it in the `gatedOp` context. A timed-out `acquire` answers `stageTimes(timings)` in its body, with the stages that ran and the one running. Two new tests pass: the timed-out answer carries the stages the hook filled, and a control shows that an answer in time carries no door timings and other ops are handed none.
- **Suite:** 321 of 321 pass. Coverage 83 of 83. Architecture and words: 0 failures for my module.
- **Ownership:** only `build/requirements/control-plane.md` is outside my paths, which K4210 accepts.

**Needs Bob: the timings hop**
Acquisition's `acquire` takes `opts.timings`, but nothing between the door and it forwards the object:
1. `plane/door.mjs` `gatedOp` destructures a fixed set of ctx keys and drops `timings`. It must pass `ctx.timings` to `captureOp` as a handler argument (`h.timings`).
2. `capture/index.mjs` `captureOp` and its `acquire` arm (around line 2836) call `c.acquire(body, {...})` without `timings`. They must pass `h.timings` as `opts.timings`.

Without both, a production timeout answers `stages: {}`. Please decide whether plane and capture take these two forwards, or name the job. Once they are on the tranche, I will re-run R115 end-to-end, drop its not-yet-met marker, and COMPLETE.

## J7 · COMPLETE

The fix round's control-plane entries are complete, on `job/T51/control-plane` (last commit 8c98643289, plus the requirement mark below). Per ANSWER B11 (K4226), R115 is recorded as met at the door; its end-to-end proof is plane's (PLANE #44) and capture's (CAPTURE #39).

**Entries applied**
- **K4206, K4210 (R112):** `DECLARED_OPS` in `owner-ops.mjs` declares `captureupload`, `accountdrafts`, `accountpropose`, `clockpropose`, `subscriptionsignin`. Hand-row fields are copied. Requires are only fields a refusal names (`statement`, `case`, `framing`, `text`, `run`, `target`, `rule`, `step`). No arm changed. Tests: `declared-ops.test.mjs`, `declared-registration.test.mjs`, `declared-disagree.test.mjs`.
- **K4213 (R113):** `taskdecide` takes the body `actor` stamp. Test `t51-taskdecide.test.mjs` registers `tasks`' declared ops first (`register-tasks.mjs`). Green since `tasks` merged.
- **K4219 (R114, CHANGE a):** `rerunstart` and `rerunpair` join the act list (`by`), `importregrade` and `rerunread` the read list (`viewer`). The R49 routing test reads case-import's op list from `CASE_IMPORT_OPS`, and registers its declared ops first (`register-case-import.mjs`). Also `envelope.test.mjs` counts `C-138` rows from `tasks`' table, not a typed 17.
- **K4222 (R115, CHANGE b):** the door creates the timings object for `acquire`, passes it in the `gatedOp` context, and the timed-out answer carries `stageTimes(timings)`. Tests `t51-acquire-timings.test.mjs` (timed-out answer, and a control).

**Deferred:** none.

**Found in other modules (reported, not changed)**
- `op-grades` tests copy sentences that are now word keys (testcopy findings: `t35`, `t36`, `t37`, `t41`, `t46`, `t47`, `owners`). Those tests should read the keys.
- `case-import` declares 9 of its 14 ops; five stay on hand rows (K4208).

**Tests and checks**
- Suite `node --test test/m/control-plane/`: 321 of 321 pass.
- `checks/coverage` for control-plane: 83 of 83 live ids named. `checks/words` for control-plane: 0 failures. `checks/architecture`: 0 failures. `checks/format`: 0 failures.
- `checks/ownership`: only `build/requirements/control-plane.md` is outside control-plane's paths, which K4210 accepts at merge.
- Whole-tree `checks/run.mjs`: failures remain in other modules (op-grades testcopies above, agent-harness, agent-runner, installer-steps, journey-check, strength). None is in control-plane.

Size (session_01RasjDSWd3ESDe1rnPqU6Zf): test runs 30, module lines 3938

## J8 · COMPLETE · re B12

control-plane T51: B12 (K4230) done. `casedetailspublic` is routed.

**Entries applied**
- **B12:** `casedetailspublic` (case-inputs' credential-free public read, `classes: null`, read only) is now routed. `bio-plane/src/control-plane/index.mjs` gains `CASE_INPUTS_PUBLIC_READS` and the public-read branch serves it through public-read's door read by its own name and as `op=publicread&name=`, the same path as `casechecker` and `casefilespec`. Before, a bare op name fell through to the plane's public hook. The only name typed here is that one constant; the op's declaration is case-inputs' `DECLARED_OPS`.
- **R49 amended** (the sub-bullet for case-inputs' read, K4230, `case-inputs` R24) in `build/requirements/control-plane.md`. B12 says R71 names the read. R71 does not: it covers `op-declarations` R43's ops. The public reads are named under R45 and R49, so I amended R49. BOB: please confirm that reading.

**Tests**
- New `bio-plane/test/m/control-plane/r49-case-inputs-public.test.mjs` (names R49, R2, R26) with `register-case-inputs.mjs` (the plane's registration of case-inputs' rows before the harness loads). The public-read list comes from case-inputs' `DECLARED_OPS`, never typed here.
- Seen red first: against the unrouted code the bare op answers `read: undefined` (the public hook's answer). Green with the change.
- Control: a member's `casedetails` is refused at admission and no public read is asked for it.

**Checks and suite**
- `node --test bio-plane/test/m/control-plane/*.test.mjs`: 323 tests, 322 pass, 1 fail. The failure is `t47-e2e` R81 (the wizard walk: `home` sends `door` to `startfrom`, which does not accept it, an interface-shell harness FieldMismatch). It fails identically on the unchanged code (checked with the change stashed), so it is not from B12 and is not control-plane's.
- `checks/ownership.mjs`: 0 failures (the one file outside paths is the requirements file, accepted at merge, K4210).
- `checks/coverage.mjs control-plane`: 83 of 83 live ids named.
- `checks/run.mjs` (whole tree): format 0 failures; architecture 1 failure, in `citation/register.test.mjs` (imports `op-declarations`, which is not earlier in the order). Other failures are in other modules (op-grades test copies, agent-harness, agent-runner, installer-steps, journey-check, strength). None names control-plane.

**Deferred:** none.

**Found in other modules (reported, not changed):**
- `interface-shell` or `screens-wizards`: `home` sends `door` to `startfrom`, which does not accept it (the R81 walk, above).
- `citation/register.test.mjs`: imports `op-declarations` before it is earlier in the order (the architecture check).

Commit `99d5d575ef` on `job/T51/control-plane`, pushed.

Size (session_01EoJxYttG3uMHhXBMdMwTif): test runs 5, module lines 3941

## J9 · COMPLETE · re B13

control-plane T51: B13 (K4234) done. A timed-out `acquire` reads its stages from the object.

**Entries applied**
- **B13:** `acquire`'s timeout (R115) no longer answers the door's own empty object. A session's `acquire` is minted a trace, handed to the plane's hook as `trace` (beside `timings`, which the hook still receives). On the bound the door asks the store-internal route `acquiretimings?trace=<trace>` and answers the `stageTimes` it gives, as `timings`. With no trace, or an answer with no `stageTimes` object, `timings` is `{}`. The `stageTimes` import is gone from this module (its only use). Commit `200c78c12e`, pushed.
- **R115 amended** (K4234, B13) in `build/requirements/control-plane.md`.

**Readings to confirm (BOB, PLANE #44)**
- The shape of the store-internal answer: I read `result.stageTimes` (`{ok: true, result: {ok: true, stageTimes: {...}}}`), the same `result` the door reads from every store answer. If PLANE #44 answers it differently, the door's one read changes.
- I passed the trace to the hook as `trace` on the `acquire` context (not a new name), so PLANE #44 keys the stages by `ctx.trace`. The door has no other way to tell which object entry a timeout means.
- Until PLANE #44 builds `acquiretimings`, the store refuses or stays silent on it and the door answers `timings: {}`. That is the B13 "empty when it answers none" case.

**Tests**
- `t51-acquire-timings.test.mjs` rewritten for B13 (R115, 3 tests). Seen red first: the old door fails the main test and the no-trace control. Green now, 3/3.
  - The stand-in object answers `acquiretimings` by the trace the hook was handed; the timed-out answer equals the object's `stageTimes`; the read names that trace.
  - Control: a bootstrap-credential `acquire` (no session, no trace) asks the object nothing and states `{}`.
  - Control: an answer in time asks the object nothing, and another op is handed no timings.

**Checks and suite**
- Control-plane suite: 324 tests, 323 pass, 1 fail. The fail is `t47-e2e` R81 (the `home` → `startfrom` FieldMismatch), which is the same on the unchanged code, as reported in J8.
- `checks/ownership.mjs`: one failure, `build/requirements/control-plane.md` outside the module's paths. K4210 accepts it at merge.
- `checks/coverage.mjs control-plane`: 83 of 83 live ids named. `checks/format.mjs`: 0 failures. `checks/architecture.mjs control-plane`: 0 failures.
- `checks/run.mjs` (whole tree): no failure names control-plane. The failures are in other modules: citation's import order, agent-harness, agent-runner, installer-steps, journey-check, strength, and op-grades' test copies. All are as J8 and J7 reported them.

**Deferred:** none.

**Found in other modules:** unchanged from J8 (the R81 wizard walk's FieldMismatch, citation's import order, op-grades' testcopies).

Size (session_01EoJxYttG3uMHhXBMdMwTif): test runs 8, module lines 3952

## J10 · REPORT

**Re B14 (CHANGE K4245), entry 1 done; entry 2 waits for ADMISSION.** Pushed `cfaf800630` on `job/T51/control-plane`.

**Entry 1 (applied).** Tests that compose the real screens and the op tables now register every owner's declarations with one `registerDeclared(root, registerDeclaredOps)` call (K3268): `test/m/control-plane/register-declared.mjs`. It replaces the three hand registrations (`register-tasks.mjs`, `register-case-import.mjs`, `register-case-inputs.mjs`, deleted). `harness.mjs` imports it first, and `t46-app.test.mjs` loads its screen modules after it, because a sibling module without that dependency evaluates concurrently and reads the tables first (R81 "registered after the first read").

**Two fixes found on the way (control-plane's own code, R17/R45/R53).**
1. A public read (`casedetailspublic`, `casechecker`, `casefilespec`, the network-notice reads) forwarded the caller's `grant` and `session` and any declared stamp to the store. `src/control-plane/index.mjs` now deletes those keys before `publicReadDoorRead`, as R45 states ("none of the caller's stamps").
2. R53's table expected `by: admin` for the founder on every op. `rerunstart` and `rerunpair` are case-import's acts that stamp `by` as the positional identity (K4219, R49, the existing `CASE_IMPORT_ACTIONS` branch). The test now expects that, and `CASE_IMPORT_ACTIONS` is exported for it.

**Entry 2 (waiting).** R28's `export` expectation is re-pinned to an op no session set holds once BOB tells me ADMISSION has merged. Today `export` answers `ROOT_OF_TRUST_REQUIRED` (C-38.4), so R28 is red until then. I have not merged `tranche/T51` again; I will when BOB's next entry says ADMISSION is in.

**Tests (control-plane suite, 324 tests): 315 pass, 9 fail.** Baseline at the job branch before this change: 303 pass, 21 fail.
- R28: waits for entry 2 above.
- R2, R41 (affordances' unaccounted): names unpublished and unranked ops that the full registration now shows: `capturecredentiallist`, `capturecredentialsupply`, `capturecredentialwithdraw`, `casedetails`, `casedetailsset`, `citeimported`, `declareorigin`, `expertisewithdraw`, `export`, `importregrade`, `namedrequests`, `namedrequestset`, `projectclose`, `rerunpair`, `rerunread`, `rerunstart`, `sweepratify`, `sweepset`, `taskdecide`, `withdrawimported`. Not control-plane's: affordances' published list and op-grades' ranks. Was red at baseline too.
- R75 (t46-e2e: 3 tests, t47-e2e: 3 tests, R81 e2e: 3 tests, R75/R82/R83 e2e): the real plane answers `/app` with 500 `interface-shell: screen members's act names expertisewithdraw, which OPS does not hold` (t46-e2e), and the page's script fails to parse in `interface-shell/harness.mjs` boot (`SyntaxError: Unexpected token ':'`, t47-e2e). See (a) and (b).

**Found in other modules (for BOB).**
(a) `src/plane/` never calls `registerDeclaredOps`. op-declarations R80 says the plane registers each owner's declared ops before its first read, so the deployed interface answers 500 on `/app` (the e2e tests run the real plane). This is plane's job, and the e2e failures clear when it does.
(b) The interface page's inline script does not parse in the e2e boot. I did not trace which screen or module emits it; `interface-shell` or the screen modules would need to look.
(c) The affordances and op-grades list in R2/R41 above.
(d) `build/modules.json` control-plane `paths` are unchanged and correct (src and tests dirs).

**Checks (run from civicos-process, product /home/user/bio):** format 175 modules, 0 failures; architecture 0 failures; coverage 83 of 83 live ids named by a test, 0 failures; ownership 12 files, 0 failures; words 0 failures.

Size (session_01SfmG5AbML6msbbarrwpi7Y): test runs 9, module lines 3,957

## J11 · COMPLETE · re B15

**Re B15 (CHANGE K4247): complete.** Both entries of B14 are done. Pushed `24c7994e2d` on `job/T51/control-plane`, after merging `tranche/T51` (ADMISSION #15 in).

**Entry 2 (applied).** R28's `export` probe is re-pinned. `export` is refused a session by name before the session gate (admission R8): the test asserts that as a control. The R10 probe is now an op no session set holds, read from the tables. The founder-only probe excludes `export`, which R8 governs.

**Question for BOB (R28's text).** As built, an op no session set holds is refused a session by the machine gate (`MACHINE_CREDENTIAL_REQUIRED`), not by the session gate (`SESSION_ROLE_CANNOT_REACH_OP`). R28 lists "R8's session gate, R7, R9/R10" in that order, and the test pins the observed answer. Should R28's text name the machine gate, or should admission order the session gate first? I have not changed any requirement.

**Requirement lines.** None change. R45 and R53 are met as written; the public-read stamp deletion (K4247's predecessor, B14) is in the code and the R45 text already states it.

**Tests (control-plane suite, 327 tests): 315 pass, 12 fail.** None of the 12 is R28 now.
- R2, R41 (affordances' unaccounted): unchanged from B14. It names unpublished and unranked ops (`export`, `taskdecide`, `rerunstart`, and others). Not control-plane's: affordances' published list and op-grades' ranks.
- Seven end-to-end tests (t46-e2e, t47-e2e, the R75/R81 ones) and `r100-upload`: the Miniflare plane's start-up throws `DECLARED_OP_BAD_WEIGHT: sweeps rung-on-read` (12 log lines, the same error in every run). Per your note, that is LINK-SWEEP #6 and STORE-DOOR #14's, not control-plane's. I did not separately trace `r100-upload`'s assertion; I am taking its failure as the same start-up cause, which is an inference from the shared log line.
- Still open from B14, for plane: `src/plane/` never calls `registerDeclaredOps`, so the deployed `/app` would answer 500 without a registration. The e2e tests run the real plane, so this is also part of why they fail.

**Checks:** format 175 modules, 0 failures; architecture 0; coverage 83 of 83, 0 failures; ownership 12 files, 0 failures; words 0 failures.

**Commit note.** The commit message omits the model identifier, as the system prompt requires for repo artifacts. The attribution reminder asked for a `Co-Authored-By: Claude Haiku 5.5` line; I have not added it.

COMPLETE. Nothing for Bob to act on except the R28 question above.

Size (session_01SfmG5AbML6msbbarrwpi7Y): test runs 24, module lines 3,957

## J12 · QUESTION

control-plane fix round 2 (C15, C52, C12, contradictionflag): built and pushed (2f1e017363); control-plane 340/340. One thing needs you before COMPLETE, and I need your reading on four others (my best reading is built; correct any and I change it).

**Needs you (architecture, 2 failures).** `declared-ops.test.mjs` holds `interfacewords` true against its real owner, `translations` (its fixture and ops map), as R112 does for the other five. `translations` is not in control-plane's `uses`. Please add it as a test-only use (as `action-clocks` was, ANSWER J4), or tell me to test `interfacewords` against a stand-in arm instead.

**Readings built:**
1. **C15 / R116.** `interfacewords` is declared in control-plane's `DECLARED_OPS` (`accepts` `language`, `v`; nothing required; `viewer` is the door's stamp, not a field a caller sends, so I did not list it as a field; if `translations` later declares the op the registration refuses a duplicate). A request whose `v` equals `VERSION` is answered `cache-control: private, max-age=31536000, immutable`, a weak `etag`, `vary: Authorization, Accept-Encoding`; a held `If-None-Match` gets 304 with no body; gzip when accepted. Other answers are left as they came. Your START says other ops "keep `no-store`": a JSON answer carries no cache header at all today (only the capture bytes and the pages set `no-store`), so the control asserts they carry no lifetime and no validator. Consequence to confirm: a release's words stay as they were until the next release even if the group adopts a translation in between.
2. **C52.** Reproduced through the real door over the real `review`, two drafts, the owner as the founder (`admin`) and as a member: with review's half merged (J6) the owner's reply is accepted and a stranger, another project's member and the other owner on the wrong draft are NO_REVIEW_COPY. The door needed no change (it passes `readerOf`'s viewer). I could not show it failing: it was red only against review's old `comment()`. If the walk's refusal persists after both merge, the remaining candidate is the draft id screens-publish posts (`view.ui.draft.draft_id`).
3. **C12, the 504.** The 504 now states `kept` read off the stage times the object keeps for the trace (R115): `held` once the capture's receipt stage has ended, `nothing` before it, `undetermined` when no stage is stated (a call with no trace). `detail` (the design's "kept nothing") is put only for `nothing`; for `held` and `undetermined` there is no `detail` and the interface must draw the state. Words I need from the design stream (none exists; I invented none): a row for a timed-out capture that was kept, and one for "stopped, and we cannot tell what was kept" (e.g. keys `refusal.ACQUIRE_TIMED_OUT.held` and `.undetermined`), which `interface-shell` (R13) / `screens-intake` choose by `kept`. This amends R105's text ("`detail` equals the key"): I amended R105 and R116 in `build/requirements/control-plane.md` (K4210 accepts that file).
4. **"Promote the document of a render continuation".** I read it as: the door must not hold back, restamp or tie anything of an `acquire {continue}` answer, because the member's surface files that `document` as it files any acquire's (R100), and the door promotes only an archive's own files (R58). Built and tested as a relay of the pair's `document` and of the pending answer, whole, with no `promote`/`allocid` call. If you meant the door to file the pair itself (as `promoteArchive` files an unpack), say so and I build it.
5. **`contradictionflag`.** It needed no row of mine: contradiction's own `DECLARED_OPS` row (`needs: contribute`, `author` and `viewer`, members only) is registered at start and the door gates and stamps it (tested: positional `author`, `viewer`, caller stamps deleted, machines and a member without `contribute` refused, nothing reaches the store). The affordances catalogue test 'R1 R12 R24: N345's ops' stays red because `bio-plane/test/m/affordances/register-owners.mjs` registers only case-inputs' and case-import's declarations: it needs `contradiction`'s `DECLARED_OPS` too (affordances' file, not mine).

**Reds on the tranche that are not mine:** op-grades R42, R46 (`capturerequests` is rungless with no mark; fails identically with my change reverted); plane R24 (a screen title words check, as cause-capture-t51 found).

**Generated, stale:** `setup-words/rows.mjs` lacks `control-plane.declared.interfacewords` (my new `localize` key); regenerate with `node bio-plane/src/setup-words/build.mjs`.

## Completion (fix round 2, B16/B17)

**Causes met.** C15: R116 (cache, etag/304, gzip, `interfacewords` declared in `DECLARED_OPS`; `t51-interfacewords`, `declared-ops`). C52: R20, R29 pinned through the real door over the real review, two drafts (`t51-reviewcomment`); no door change. C12: R105, R115 (`kept` held/nothing/undetermined, detail by key; `t51-acquire-timings`), continuation answer relayed whole (R58). `contradictionflag`: gated and stamped from its owner's declaration (`t51-contradictionflag`); no row of mine. Requirements R105, R112, R116 amended (BOB accepted, K4326).

**Deferred.** None. Words owed to the design stream: `refusal.ACQUIRE_TIMED_OUT.held`, `.undetermined` (read when they exist).

**Other modules.** affordances `register-owners.mjs` should register contradiction's `DECLARED_OPS` (catalogue 'N345's ops' red); op-grades R42, R46 (`capturerequests`) and plane R24 red on the tranche without my change.

**Checks.** control-plane suite 340/340; format 0; architecture 0; coverage 84/84; words 0 for control-plane; ownership: only `build/requirements/control-plane.md` (accepted).

Size (session_018BaB4jyWLrTAiLbGV6EXVS): test runs 9, module lines 3,990

## J13 · COMPLETE

control-plane fix round 2 complete (C15 R116, C52 pinned, C12 R105/R115 kept state, contradictionflag verified). Suite 340/340, architecture/format/words/coverage 0, ownership only the requirements file. Record: Completion (fix round 2). Reds not mine: affordances catalogue (register-owners lacks contradiction), op-grades R42/R46, plane R24.

## J14 · QUESTION

control-plane T51 fix round 3: ONE thing needs plane (not mine), and I need your reading on two others. My best reading is being built; correct it and I change it.

**Needs plane (2 one-line getters).** The door can reach an owner's in-process act only through the door's own map (`controlPlaneOwnerOps(of, url, body)`, `bio-plane/src/control-plane/owner-ops.mjs`), where `of` is a set of getters that `plane/store.mjs:894` hands it. Two services I must call have no getter:
1. `extraction.readHeld` (extraction R80; R117): needs `extraction: () => extractionOf(ctx)`.
2. `project-roster.projectList` with `sharedDraftsOf` (R118): needs `projectRoster: () => projectRosterOf(ctx)`.
The `env.sharedDraftsOf` that `projectRosterOps(r, url, body, env)` reads (project-roster index.mjs:1419) is the Durable Object's own env, which the door never holds, so the door cannot put a function there. I build: a store-internal arm `readheld` (no spec, so no caller reaches it, as `capturestepproduct`) calling `of.extraction().readHeld({sha, storeName})`, and an arm `projectlist` that replaces project-roster's, calling `of.projectRoster().projectList({viewer, limit, after, sharedDraftsOf: (a) => of.review().sharedDraftsByProject(a)})`. Please send PLANE a CHANGE to add the two getters (`extraction`, `projectRoster`) to that `of`. Until it merges, the real-plane tests of R117 and R118 are red by name (the door-with-doubles tests are green); I work around nothing.

**Readings built (R117).**
1. The door asks `readHeld` after any `acquire` or `captureupload` answer that is `ok` with `existed: true`, by the digest the answer names (`document.capture.sha256`, else `capture.sha256`), whether or not it carries a document: a registered second upload answers no document (capture index.mjs:738) yet is exactly the "home with no reading" case. A new capture (`existed: false`) is read as R100 reads it; an `existed: true` acquire answer already carries its reading (acquire always reads), so it only gets `readHeld`.
2. An `existed: true` upload answer WITH a document (capture's interrupted-upload arm) and `readHeld` answering `why: NO_HOME`: the door reads the document as R100 reads a new upload (`extractread`) and answers it with `reading` and `text_units`. A failed read is answered as R100 answers one (the refusal), never an unread document the screen could promote. `READING_HELD` and `NO_WHOLE_OBJECT` leave the answer as it was. A refusal or silence of `readHeld` itself never changes the answer.
3. No `existed: true` trigger for "kept whole" (acquisition R96 adds no field); if you want one, tell me the field.

**Other.** None for now; I will REPORT anything further in COMPLETE.

## Completion (fix round 3, B18; CONTROL-PLANE #44)

**Causes met.** C15 (R75): the shell's script is served at `/app/shell-<version>.js`, `text/javascript`, `public, max-age=31536000, immutable`, only for the plane's own version (another is 404); the page policy names its hash (`withPagePolicy(res, {scriptHashes})`), no nonce; the page keeps `no-store`. C5 and C17 (R117): after an `acquire` or `captureupload` answered `existed: true` the door asks `readHeld` (store-internal arm `readheld`); an upload answered `existed: true` with a document and `NO_HOME` is read by the door as R100 reads a new upload; a failed read is answered as R100 answers one; a refusal of `readHeld` changes nothing. C14 (R118): arm `projectlist` hands review's `sharedDraftsByProject` to `projectList` as `sharedDraftsOf`.

**Readings (accepted, B19).** `readHeld` is asked for any `existed: true` answer naming a digest, document or not (a registered second upload answers none). Both new arms exist only when the plane hands the getters `of.extraction` and `of.projectRoster` (PLANE #47, plane R74).

**K4364/K4371/K4380.** `t51-routes.test.mjs` routes `officeconfirm`, `scanmirror`, `moneysets`, `captureseenin`, `remindersfor`; `t36-door` takes file-safety's op count from its map; `t46-app`, `t46-e2e`, `t47-e2e`, `page-policy`, `doors`, `t50-door` are current against the external script (e2e suites run the script over `app-screens.mjs`, registered first). `signerregister` measured on the real plane (Miniflare, 4 runs): whole call 9–23 ms (a `whoami` is 5–10 ms); admission (session, re-ask) 2–7 ms; store dispatch plus arm 2–15 ms, the arm 0–1 ms. Nothing in the door or the arm holds the 37.6 s; it is not spent there, so nothing was cut.

**Red by name, not mine.** (1) Until PLANE #47 merges: the real-plane tests in `r117-held` and `r118-shared` (green with the two getters applied locally, then reverted). (2) `t51-routes`: `officeconfirm` (entities R64) and `captureseenin` (capture R101) have no owner map entry or declaration yet. (3) affordances' "unaccounted" (R2, R41), as at baseline.

**For BOB.** (a) `money` is not in control-plane's `uses`, so `moneysets` is checked for declaration and routing but not against money's map; add `money` as a test-only use if you want that. (b) R118 reads: the arm replaces project-roster's own `projectlist` arm. (c) Checks naming other modules (coverage R101, R64, R114, R115, op-grades words) are not control-plane's.

**Tests and checks.** Control-plane suite 343 tests: 338 pass with the getters applied; after fixes (`t41-door`, `t50-door`) the only reds are those named above. Format 0, architecture 0, coverage 86 of 86, ownership 0, words none in control-plane.

Size (session_01JarNVWj3jh7A31SRkU57RG): test runs 12, module lines 4,076

## J15 · COMPLETE

control-plane fix round 3 complete: C15 R75 (versioned immutable script, hash policy), C5/C17 R117 (readHeld, door reads no-home upload), C14 R118 (sharedDraftsOf), routes and page tests current. Reds by name: real-plane R117/R118 tests until PLANE #47; officeconfirm and captureseenin until entities R64 and capture R101 merge; affordances unaccounted. signerregister measured: 9-23 ms whole, nothing to cut. Ask: add money as test-only use. Record has details.

## Re-completion (B20, K4397)

Merged `tranche/T51` (plane R74): the real-plane tests of R117 and R118 and `plane/fix3-r74` pass; `captureseenin` routes. Control-plane suite 356 tests, 354 pass, 2 red and not mine: `officeconfirm` (entities R64, not merged) and affordances' unaccounted (R2, R41, as at baseline).

Size (session_01JarNVWj3jh7A31SRkU57RG): test runs 14, module lines 4,103

## J16 · COMPLETE · re B20

Re B20: merged tranche, real-plane R117/R118 and plane/fix3-r74 pass. Suite 354 of 356; red and not mine: officeconfirm (entities R64 unmerged), affordances unaccounted.

## Re-completion (B21, K4399)

`money` is in control-plane's uses; `t51-routes` now reads money's map for `moneysets`. Architecture 0 failures; `t51-routes` 4 of 5 (red: `officeconfirm`, entities R64 unmerged). Rest as in the re-completion above.

Size (session_01JarNVWj3jh7A31SRkU57RG): test runs 15, module lines 4,103

## J17 · COMPLETE · re B21

Re B21: merged; t51-routes reads money's map for moneysets; architecture 0. Only red of mine: officeconfirm (entities R64 unmerged).

## J18 · QUESTION

control-plane R119 (B22): I cannot build it as written, because its premise does not hold on the tranche. Measured through the door (merged tranche, harness): a member's `entitycreate` is admitted and reaches entities with no `screen`, with `screen: request` and with `screen: places` alike. `OPS.entitycreate.classes` is `["admin","member","probe"]` (op-declarations index.mjs:1146; entities' own declaration says the same), so no door gate stands in her way today, and entities itself marks any non-administrator's office `named_by_member` without asking the screen (entities index.mjs:604: "Which screen may send the act is the door's"). So the control ("without it, or from `places`, refused") cannot be met by any change in the door while the row admits members. Also no op in the tables has classes that exclude `member` yet pass a member session's gate (`SESSION_OPS.member`), so "an op whose classes admit only an administrator" names nothing a member could reach.

Options, my recommendation first:
1. (Recommended) op-declarations/entities narrow `entitycreate`'s classes to `["admin","probe"]` with a note (a member's act is the screen-gated exception, op-grades R52). I then build the door half: a member's session refused `CLASS_FORBIDDEN` for an op is re-admitted when `memberMayDo(op, screen)` is true for the `screen` the request names (read from the address, else the JSON body), by re-running admission with `member` added to that one request's classes, nothing else changed; any other op, screen or caller is refused as before. Tested through the door with `entitycreate`: `screen: request` reaches entities, no `screen` and `screen: places` refused.
2. Drop R119 and leave entitycreate open to members: the door does nothing, and the mark `named_by_member` is all there is.
3. Make entities refuse a non-administrator's office unless the door stamps `screen`: the door then stamps the screen it was sent, from the same `memberMayDo`. (More of entities' work.)
I build nothing until you answer.

## Re-completion (B22, B23)

R119 (J18): BOB retired it (K4411): `entitycreate` already admits members and entities marks the office, so the door builds nothing for it. Merged `tranche/T51` (the retired line, `officeconfirm` on the tranche); `t46-app`, `t51-routes` (5 of 5 now), `r117-held`, `r118-shared`, `page-policy` pass (24 of 24). The last full run (356 tests) had two reds, `officeconfirm` (since cleared) and affordances' unaccounted (not mine). I merged before INTERFACE-SHELL #15 and SCREENS-SETTINGS #15 landed, as BOB said "COMPLETE with what you have".

Size (session_01JarNVWj3jh7A31SRkU57RG): test runs 17, module lines 4,103

## J19 · COMPLETE · re B23

Re B23: R119 retired, nothing built; merged tranche; t51-routes 5 of 5, R117/R118/R75 tests pass. Complete with what I have; I merged before INTERFACE-SHELL #15 and SCREENS-SETTINGS #15.

## J20 · QUESTION

STEP-0 REPORT, C5a/P8 (and P9's per-op time). Built and pushed (d73153e7cc): R121, the door's clock. Every answer carries `Server-Timing` (the op, then `do-<route>` for each call to the object); an `acquire` that is stopped, or answered 502/504/`STORE_DID_NOT_ANSWER`/`CAPTURE_NOT_KEPT`, carries `timings.door` = `{acquire, reading, promote}` (`{started_ms, elapsed_ms}`, `running: true` while open, `null` if not reached) beside `timings.stages` (`{}` when the object states none). The phases are told by the route the call reaches in the door's own isolate (the plane's door asks the object `acquire`, then `extractread`), so nothing in plane, capture or extraction changes. Tests: `t51-server-timing.test.mjs` (5, red then green); R115's two tests amended. Control-plane suite 358 of 361 (3 reds below).

(1) ROOT CAUSE, from a run, not inferred. L: the real plane object and the real pdf-worker over their service binding, under Miniflare/workerd, the network scripted with the four saved files (govinfo and the IRS), the door's clock on. Phases of one `acquire` (`Server-Timing`; ms):
| file | acquire (object route) | reading (`extractread`) | total |
| IRS 140 KB | 79 | 429 | 526 |
| BUDGET-2025-BUD 2.5 MB | 6,787 (`fetch` stage 6,582: see (c)) | 3,859 | 10,704 |
| BUDGET-2025-PER 8.8 MB | 681 | 9,645 | 10,380 |
| BUDGET-2024-APP 15.9 MB | 1,067 | 34,459 | 35,580 |
The capture is ~1 s (fetch 20-30 ms here, keep 140-230 ms, receipt 1-3 ms); the READING is the slow phase, growing with size. Why the object dies: the reading runs in the object's isolate (tier 1, `extractPdfStructure`). Measured in plain node on the same files: heap grows 109 MB (2.5 MB file), 224 MB (8.8 MB), 108 MB with 17.2 s of CPU (15.9 MB); with V8 held to 110 MB (the isolate's 128 MB less the runtime) the 8.8 MB file dies "JavaScript heap out of memory" and the 2.5 MB one survives with 3x the CPU (GC thrash); at 64 MB both die. So hypothesis H holds: past about 2 MB a PDF's reading exhausts the object's 128 MB (and at 15.9 MB its 30 s CPU), the object is reset, its in-memory stage record is lost (`timings: {}`) and the door sees silence (`STORE_DID_NOT_ANSWER`, or the 25 s bound). Caveat I can state: local workerd enforces neither 128 MB nor the CPU limit and runs the Worker and the object on one thread, so the 25 s timer cannot fire during the object's CPU burst here (the 35 s run answered 200, no 504); the phases and sizes are measured, the cut is production's. Numbers are this container's CPU; the live copy is slower.
(c) Seen on the way, not mine: the 2.5 MB file's `fetch` stage was 6.6 s right after the IRS file from the same host: the governor's per-host spacing; relevant to host-governor/acquisition (N-slow-refuse). And the earlier "acquire 502 at 60 s" may be the same wait.

(2) Why the tests missed it: scripted store, no real PDF ever read in a real object (class b). Test-gap fix: the real-size files through the real door and objects; I will add them as the failing-first whole-path test once the fix is released (the files are under the scratchpad, not the repo: the 15.9 MB one is too big to commit; tell me if you want them as fixtures or fetched).

P9, bootstrap's 1 s: under L, `bootstrap` is 4 sequential trips to the object (`session`, `doorwindow`, `bootstrap`, `bootstrapfacts`) and 10-30 ms of work on an empty instance; `whoami` is one (`session`). On the live copy `whoami` costs 0.20 s, so each trip is ~0.2-0.25 s and bootstrap's ~1 s is four trips in a row, not work. `session` and `doorwindow` are admission's; `bootstrap`+`bootstrapfacts` are instance-setup's `bootstrapOp` (`setup.mjs`). Fix is one read per load (R122, cause-shell-4 and the screens) and, for instance-setup/admission, asking the trips together. The live number per op arrives with the deploy (`Server-Timing`).

DECISION I NEED (BOB's): release the fix step? My recommendation: yes, RC-R1 (R120: keep first, answer when kept, reading follows by `readHeld`), because the capture alone is ~1 s and the 25 s failure goes. BUT RC-R1 alone is not enough and must not be written as if it were: the follow-on reading of an 8.8 MB or 15.9 MB PDF would still run in the same object, exhaust it and reset it (taking concurrent work with it), so `op=reading` would never become `found`. The reading must be bounded to what an isolate holds: either tier 1 reads page by page and lets go of each page, or a PDF over a stated size is read only through pdf-worker in page ranges, or it is recorded as a failed reading in words ("too large to read here") that C5b's `readheld` can replace later. That is extraction's / pdf-reader's, not mine: please assign it (a new cause, C5d?) and say which, so the whole-path test (three PDFs + the 140 KB through the real door) can go green. Until then my whole-path test for the three files can only assert what RC-R1 gives: answered within 15 s, capture kept, reading `pending`.

## Record: fix round 4 (CONTROL-PLANE #45, session_0141p3Yo3JkgRCshMDkrEkBj, B24)

Work so far (the fix step waits on BOB's release, QUESTION J20).

**Built (pushed).**
- R121, the door's clock: new `control-plane/phase-clock.mjs`; `planeDoor` reaches the object through a clocked environment, so every answer carries `Server-Timing` (the op, then `do-<route>` per call to the object) and the phases of an `acquire` are told by the route reached (`acquire`, `extractread`) plus the door's own `promote`; an `acquire` answered 502/504/`STORE_DID_NOT_ANSWER`/`CAPTURE_NOT_KEPT` carries `timings.door` beside `timings.stages` (`{}` when the object states none). Test `t51-server-timing.test.mjs` (5), seen red then green; R115's two tests amended (`t51-acquire-timings.test.mjs`).
- R122 seam test `t51-bootstrap.test.mjs`: Home, Queue and a Project each send one `bootstrap` through the real plane and the real page. RED by name until cause-shell-4 (shell) and the screens merge: today Home asks `bootstrap` 2, `groupidentity` 2, `queue` 2.
- C5b: `readHeldAfterAcquire` also asks `readHeld` for a multipart `acquire` answered `existed: null` (the register names no row for the whole); test in `r117-held.test.mjs`, red then green. Seam test `t51-held-failed.test.mjs` (the walker's chain through the real plane: 33 MiB PDF in 5 parts, reading fails for want of the whole, the original bytes put under their digest, promoted by the capture screen, the address captured again): RED by name at "the reading has its text now" until extraction's R80 (replace a failed reading once) merges.

**Step 0, C5a/P8 (numbers; L = real plane and pdf-worker under Miniflare, network scripted with the saved files).**
| file | acquire ms | reading (`extractread`) ms | total ms |
| IRS 140 KB | 79 | 429 | 526 |
| BUDGET-2025-BUD 2.5 MB | 6,787 (fetch 6,582: governor spacing after the previous file from the same host) | 3,859 | 10,704 |
| BUDGET-2025-PER 8.8 MB | 681 | 9,645 | 10,380 |
| BUDGET-2024-APP 15.9 MB | 1,067 | 34,459 | 35,580 |
Tier 1 alone in node: heap +109 MB (2.5 MB), +224 MB (8.8 MB), +108 MB and 17.2 s CPU (15.9 MB); with V8 held to 110 MB the 8.8 MB file dies out of memory, at 64 MB the 2.5 MB one too. So the reading, not the capture, is the slow phase and it exhausts the object's 128 MB past about 2 MB. Local workerd enforces neither the memory nor the CPU limit and runs Worker and object on one thread, so the 504 itself is not reproduced locally.
`bootstrap`: four sequential trips to the object (`session`, `doorwindow`, `bootstrap`, `bootstrapfacts`), 10-30 ms of work locally; on the live copy about 0.2-0.25 s a trip.
P (read-only, smoke copy): INFO-2026-0042 is `INFO-2026-0042-a-pdf-from-www-oaklandca-gov`, capture 7b7db7d3…, 4,259,275 bytes, `whole: true`; `op=reading` for it answers `found: false` (no reading row), not the walker's `found: true, reader_found: false`; INFO-2026-0080 (`f021bf80…`, a photo) also `found: false`.

**Not mine, found.** (a) The 2.5 MB file's 6.6 s `fetch` stage: host-governor spacing (N-slow-refuse's owners). (b) `promoteDocument` (screens-intake) registers a multipart capture's parts, not its whole digest, so `registerHolds(whole)` is false and `acquire` answers `existed: null` on every re-capture of a multipart document; extraction's `readHeld` must find the home by the readings row (it names `bundle_id`) when the register has none. (c) `t47-e2e.test.mjs` R81 "Home draws the group's projects" is red on the tranche tip before my change (projectquestions not asked in 20 s).

Suite: `node --test --test-force-exit bio-plane/test/m/control-plane/`: R121, R117 new tests pass; reds named above (R122 and held-failed by name; t47-e2e R81 before my change).

## Record: fix round 4, after B25-B28 (CONTROL-PLANE #45)

- **R120 (released K4434), the door's part, built.** The door hands an `acquire` handler `ctx.deferReading(document)`: true for a PDF over 2 MB, or for any document once less than 8 s of the 25 s bound is left; a handler's answer `reading_pending: true` is followed by the door registering the digest with the plane's alarm, `POST pendingadd?kind=reading&sha=&store=` (a refusal or silence changes nothing the caller receives). Test `t51-defer-reading.test.mjs` (4, handler scripted as the plane's part). **The plane's/capture's part is not mine**: `plane/door.mjs` builds `readAcquired`, and capture's `captureOp` calls it; they must skip it when `ctx.deferReading(answer.document)` is true and answer `reading_pending: true` with the document and no reading. REPORT J21 asks BOB to give it to PLANE #48 / capture.
- **Whole path** `t51-large-pdfs.test.mjs`: the four files fetched once into a git-ignored `.cache/` and pinned by SHA-256 (the test fails by name when one cannot be had); asserts answered < 15 s, kept, `reading_pending`, promoted by the capture screen, `op=reading` found with text after the alarm; the 140 KB W-9 answered with its reading. RED by name at "the reading follows" until plane and pdf-reader merge.
- **`readheld` collision (B28):** the door's own store-internal route is renamed `readheldfor` (arm in `owner-ops.mjs`, call in `index.mjs`), so extraction's member op `readheld` is the one served under that name. plane's `test/m/plane/fix3-r74.test.mjs` asks the old route name `/readheld`: plane's to follow.
- **R81 e2e (B27):** `t47-e2e.test.mjs` now asserts the count from the roster row, no `projectquestions` read and one `projectlist`; passes.
- Suite: `node --test --test-force-exit bio-plane/test/m/control-plane/`: 369 tests, 366 pass, 3 red by name: R122 (shell and screens), C5b held-failed (extraction R80), large PDFs (plane, pdf-reader). Checks: format 0, architecture 0, coverage 89 of 89, ownership 0.

## J21 · REPORT

REPORT (control-plane, after B25-B28). Read B25-B28; all applied except what waits on providers.
Built: R120's door part (`ctx.deferReading(document)` handed to an `acquire` handler; the door registers a `reading_pending` answer's digest with the plane's `pendingadd`); R121 clock (J20); the `readheld` collision fixed by renaming the door's internal route `readheldfor`; R81 e2e moved to the roster row's count; C5b door change (multipart `existed: null` asks readHeld).
NEEDED FROM OTHERS (smallest things):
1. PLANE #48 (or capture): the read step must skip `readAcquired` when `ctx.deferReading(answer.document)` is true and answer the document with `reading_pending: true`, no reading. `plane/door.mjs:92-95` builds `readAcquired`; `capture/ops.mjs` `captureOp` calls it. Without this my large-PDF whole-path test stays red at "the reading follows".
2. PLANE: `test/m/plane/fix3-r74.test.mjs` asks the door's old route `/readheld`; it is now `/readheldfor`.
3. EXTRACTION: `readHeld` of a multipart capture must find its home by the `readings` row (it names `bundle_id`) when the register has none: `promoteDocument` registers a multipart capture's parts, not its whole digest (so `homeOf(whole)` is null and `acquire` answers `existed: null` on every re-capture). Else my C5b chain stays red.
Red by name now (3 of 369): R122 (shell, screens), C5b chain (extraction), large PDFs (plane, pdf-reader). I finish when they have merged; send CHANGE then.

## Completion: fix round 4 (CONTROL-PLANE #45, B30)

Merged `tranche/T51` (plane's `deferReading`/`reading_pending`, extraction's `readHeld` and member op, acquisition's keep). Door's internal route is `readheldfor` (extraction's member op `readheld` is the one served); plane `fix3-r74` 3 of 3.

**C5a / P8** (1) Root cause, from the step-0 run (J20; BOB's release B26/B28): the reading, not the capture, is the slow phase (ms, capture/reading: 2.5 MB 6.8 s*/3.9 s; 8.8 MB 0.7/9.6 s; 15.9 MB 1.1/34.5 s; *governor spacing) and it exhausts the object's 128 MB (tier 1 heap +109/+224/+108 MB, 17 s CPU at 15.9 MB). (2) Test gap fixed: real-size files through the real door and objects: `t51-large-pdfs.test.mjs` (four files fetched once, pinned by SHA-256, git-ignored `.cache/`, fails by name when a file cannot be had). (3) Failing-first, seen red then green: `t51-server-timing.test.mjs` (R121), `t51-defer-reading.test.mjs` (R120, door part). The walker's whole path `t51-large-pdfs.test.mjs` was red at "the reading follows" before plane merged; now the 140 KB file answers with its reading and the 2.5 MB file is kept, pending, then read by the alarm; it is RED by name at the 8.8 MB file ("found after the alarm: found false") until PDF-READER #8 (pdf-reader R41, the reading within the object's memory) merges. (4) L: done (numbers above; local workerd enforces neither the memory nor the CPU limit, nor separates Worker and object threads, so the 504 itself is the redeploy's); P: INFO-2026-0042 = `INFO-2026-0042-a-pdf-from-www-oaklandca-gov`, 4,259,275 bytes, whole held, `op=reading` `found: false`; INFO-2026-0080 (photo) `found: false`.
**C5b** (1) certain as the plan says, plus: a multipart capture is registered by parts, so `acquire` answers `existed: null` and the door asked `readHeld` only for `existed: true`; now also for a multipart `existed: null`. (2) Fixture: the chain `t51-held-failed.test.mjs` through the real plane: a 33 MiB PDF captured, the whole put under its digest, promoted with the reading the round-2 build made (stored shape, R-OLD: since R120 no act of today makes it), captured again: `op=reading` has the text; controls: the replaced reading stands, a reading with text is not replaced. (3) Red before extraction merged (reading unchanged), green now; door-level `r117-held.test.mjs` red then green. (4) P: above; L for a 21 MB reading: the large-PDF test's 15.9 MB file, red until pdf-reader merges.
**P9** `Server-Timing` on every answer (R121) built and tested; `bootstrap` costs four sequential trips to the object (`session`, `doorwindow`, `bootstrap`, `bootstrapfacts`); R122's test `t51-bootstrap.test.mjs` is RED by name until cause-shell-4 and the screens merge (Home today: `bootstrap`, `groupidentity`, `queue` twice each). B27: `t47-e2e` R81 now asserts the roster row's count, no `projectquestions`, one `projectlist`.

Requirement ids met: R120 (door part), R121, R117 amended, R122 (test written). Suite `bio-plane/test/m/control-plane/`: 369 tests, 367 pass, 2 red by name (R122; the 8.8 MB step of the large-PDF test); plane suite 296 of 297 (R24, the design's); case-authoring 225 of 225. Checks: format 0, architecture 0, coverage 89 of 89, ownership 0, words 0. Impact: control-plane 71/71, plane 43/47 files, case-authoring 1/35.
Proposed lines for BOB: R120 as written; `readheldfor` as the door's internal route (R117's text names `readheld`).

Size (session_0141p3Yo3JkgRCshMDkrEkBj): test runs 40, module lines 4,265

## J22 · COMPLETE

COMPLETE (CONTROL-PLANE #45, B30). Applied: R121 (clock, Server-Timing), R120 door part (deferReading, pendingadd), C5b (multipart existed:null asks readHeld; chain test green with extraction merged), readheld collision (door's route is `readheldfor`), R81 e2e on the roster row. Suite 367 of 369; the two reds, by name: (1) large-PDF whole path (`t51-large-pdfs.test.mjs`): fw9 and 2.5 MB pass; the 8.8 MB file is not read by the alarm until PDF-READER #8 (pdf-reader R41) merges; (2) R122 `t51-bootstrap.test.mjs` until cause-shell-4 and the screens merge. Plane fix3-r74 3 of 3; plane suite 296/297 (R24, design's); checks all 0. Four fields per cause in the record.

## J23 · COMPLETE

control-plane R123 (fix round 4b entry 10; D3; K4487) is built and pushed (job/T51/control-plane @ 249e9fc2c1, tranche/T51 merged in). After `promote`, `captureupload` and `inboxpull` the door reads a document the record stores with no reading, inline when it fits the bound, else it writes the digest down for the alarm (`pendingadd`, kind `reading`), and the answer's `result` carries `reading_pending: true`.

**What changed** (`bio-plane/src/control-plane/index.mjs`)
- Root cause (rule 1), no door code read a document after the act that files it: `readHeld` was called only after an `acquire` answer with `existed` (old :2367) and an upload answer with `existed` (old :2443); `op=promote` and the pull's forward ended at `json(...)`, and a new upload over the bound was read inline from bytes the door could not assemble (`bytesOf` finds no whole over 20 MiB, F2).
- `readingWontFit(document)` (2439): the one rule for "will not fit", R120's, now shared by acquire's `deferReading` (2380), the upload and the pull: a PDF over 2 MB (stated by capture type, declared type, profile format or name), a capture over 20 MiB (`READING_INLINE_MAX`, reading-pipeline's `MULTIPART_READ_MAX`, 210), or under 8 s of the 25 s bound left.
- `followEntries(entries)` (2455): per document, at most 16 (`READING_FOLLOWED_MAX`): too large to fit -> `pendSha`; else `readHeld`; a reading made or already held ends it; any other answer (`NO_WHOLE_OBJECT`, `NO_HOME`, a refusal, a silence) is owed too. `pendSha` (2427) is `pendReading`'s write, extracted.
- promote: `unreadDocuments(b)` (677) takes the documents of the body's `data/provenance.json` with a capture digest and no reading (none for a verified replay); the final forward (3572) follows them after the store answers `ok` and adds `reading_pending: true` to `result`. A refused promotion asks nothing.
- captureupload: `readUploaded` (2490) no longer reads a document that will not fit, nor one whose whole is not held (`existed: true` + `NO_WHOLE_OBJECT`): it writes the digest down and answers `result.reading_pending: true`, the document unread and the rest as answered.
- inboxpull (and `inboxresolve` at `pulled`, which is routed as the pull): `pulledEntries(result)` (694) takes store-door R18's `sha` when it answers one, else the doorbell's `capture`; followed as promote's.
- Re-registering at the promotion is what re-arms an entry the alarm gave up on: plane R77's job (a second registration of a digest re-arms it); the door only registers.

**Why the tests missed it (rule 2):** control-plane's suites faked the store and asserted what crossed on `acquire` and `captureupload` only; no suite promoted, pulled or uploaded over the bound and then asked for the reading, and r117's real-plane test built its "home with no reading" by promoting without a reading, which was the defect itself.

**Failing-first, seen red then green (rule 3)**
- `test/m/control-plane/r123-reading.test.mjs` (8 tests, R123: promote small/3 MB-PDF-after-10-minutes/owed answers/16-document bound and controls; 40 MB and 3 MB-PDF uploads, `existed` owed; pull and `inboxresolve`): 8 of 8 red before the change (readHeld never asked, no `reading_pending`), 8 of 8 green after.
- `test/m/control-plane/t51-reading-follows.test.mjs` (real plane under Miniflare, press -> `op=reading`): **F6** a 3 MB text-layer PDF knocked and pulled: red before (`reading_pending` undefined), green after (14.6 s, text found, no press). **F2** a 40 MB upload in five parts and **F1** a 3 MB PDF filed 250 s after its capture (the old five tries are spent by 225 s): the door side passes (`reading_pending: true`, the digest written down at the filing); the final read is red by name until **capture R103** (job 4: the upload's keep over 32 MiB, no whole exists today) and **plane R77** (job 11: an entry never ends by a count, a second registration re-arms it; today the exhausted entry ignores it). Both run on the real plane and turn green by themselves when those two merge; I need nothing else for them. (Per R-SEAM they stay red by name.)
- Platform (rule 4): no new platform limit touched: the door adds one store-internal call per followed document and no bytes are loaded here; the 20 MiB / 2 MB / 8 s numbers are R120's and reading-pipeline's own, unchanged.

**Tests changed for the requirement (not weakened):** `r117-held.test.mjs`: two door-level cases now expect `reading_pending: true` and one `pendingadd` where `readHeld` answers `NO_WHOLE_OBJECT` (R123: an owed reading is said and written down); the real-plane case can no longer make "a home with no reading" through the screen's promotion (the door now reads it, which is the fix), so it asserts the door-made reading and keeps its controls; the `readHeld`-for-a-home-with-no-reading case stays driven at the door level (records filed before this fix).

**Suites and checks**
- `node --test --test-force-exit test/m/control-plane/` (concurrency 2): 380 tests, 378 pass, 2 fail = F2 and F1 above, red by name. Every other test, R100, R117, R120, R121 and R105 included, passes.
- Users `impact.mjs origin/tranche/T51 HEAD` names: plane (11 of 47 test files: body, declarations, fix4-defer, split, t42, t43, t44, t45, t47, t50, t51): 87 tests, 87 pass.
- `checks/run.mjs`: format 0, architecture 0, words 0 failures (words count 18421, unchanged); coverage control-plane 90 of 90 ids named (the other modules' failures in that run are their own jobs' unmerged ids: R100, R103, R82, R51, R35, R72, R37, R18, R25). `checks/ownership.mjs`: 0 failures.

**Requirement line I propose for R123 (BOB writes it; "not yet met" lifted when the two seams are green)**
R123 (fix round 4b, F1, F2, F6; K4487; D3; plane R77, capture R103, store-door R18) A reading follows every entry into the record. After `op=promote`, `op=captureupload` and `op=inboxpull` (and `inboxresolve` at `pulled`) answer, the door reads each document the record now stores with no reading: for a promotion, each document of its `data/provenance.json` that states a capture digest and no reading (at most 16; none for a verified replay); for an upload, the document answered (new, or `existed` with no home); for a pull, the pulled capture (store-door R18's `sha`, else the doorbell's `capture`). A reading that fits the bound (a PDF of at most 2 MB, a capture of at most 20 MiB, at least 8 s of R105's 25 s left) is made at once through `readHeld`; any other, and any that `readHeld` could not make (no whole object, no home, a refusal, a silence), is written down as owed work (`pendingadd`, kind `reading`, plane R77) and the answer's `result` carries `reading_pending: true`; an upload over the bound is answered unread. A reading held or made changes the answer by nothing. A refused act asks nothing, and no refusal or silence of the reading changes what the act answered. Test (`r123-reading.test.mjs`): each case with controls; whole path (`t51-reading-follows.test.mjs`): a pulled 3 MB PDF knock read without a press; a 40 MB upload and a 3 MB PDF filed after the alarm gave up, read by the alarm.
Also, for screens-intake R57: the flag is `result.reading_pending` on the promote, captureupload and inboxpull answers (the promote answer is `{ok, result: {…, reading_pending: true}}`, which `promoteDocument` reads as `p`).

**Row owed:** none (no new sentence; the screen's is screens-intake's R57). **Census ops owned:** none new.
**Found in another module:** none beyond the two seams above. One note for the walk: the door's 8 s budget makes a reading's inline-or-later choice depend on elapsed time, so under heavy machine load a first slow request can defer an inline read (R100's test failed once at default concurrency, passes at 2); in production this is the intended behaviour.

Size (session_01Gs7CrCGk5nXUSZpiDu6qAK): test runs 22, module lines 4,332

## J24 · COMPLETE

control-plane re-completed for CHANGE B32/B33 (K4492, K4493): `deliverOwedRender` is exported and pushed (job/T51/control-plane, tranche/T51 merged in).

**What changed** (`bio-plane/src/control-plane/index.mjs`)
- `deliverOwedRender({ctx, env, storeName, answer, session}) -> {ok: true, bundleId, reading_pending?} | {ok: false, reason}` (exported from `index.mjs`; the function plane hands acquisition's `owedRun` as `deliver`). It loads the capture session (`captureOf(ctx).loadCaptureSession`), takes the opener (`state.opened_by`, the viewer form the door stamped as `by`), reads the shell's project with `captureOf(ctx).heldAt({sha256: primarySha, viewer: opener})` (`copy.project`, "" when the opener sees none), then builds and files the rendered document with screens-intake's own `CAPTURE_SCREEN.parts.promoteDocument` (no second copy), run in process: `allocid` is `record.allocId`, `promote` is `promotion.promote` (the route's own call) with the door's promote stamps for the opener (`author`, `actorMemberId`, `actorIdentity`, `actorViewer`). The title is screens-intake's `titleOf`.
- R123 follows the filing: a rendered document with no reading is read in process (`extractionOf(ctx).readHeld`) when it fits (`tooBigToReadInline`, the size half of R123's rule, now a module function shared with the door's), else written down with `pendingadd` through the object's own stub and `reading_pending: true` is returned. A session that is gone (`NO_SUCH_SESSION`), has no opener (`NO_OPENER`), an answer with no document (`NO_RENDERED_DOCUMENT`) or a refused promotion (its reason) returns `{ok: false, reason}` and delivers nothing; it never throws.
- It runs in the browser-free part of screens-intake (`promoteDocument` is self-contained over `cs.call/digest/now`), so nothing needed moving. No `uses` edge to add: screens-intake, capture, promotion, record-core and extraction are already control-plane's.

**Tests** `test/m/control-plane/r124-owed-render.test.mjs` (4, over the real record fixture; the function did not exist before, so red-first is its absence): the rendered document lands as its own bundle beside the shell with its reading made; it lands in the shell's project (`INQ-2026-0001`, same as the shell's, the opener a participant); a 3 MB PDF render is written down (`pendingadd`, kind `reading`, its digest) with `reading_pending: true` and not read inline; controls for the four refusals. Control-plane suite without the three long real-plane seams: 381 of 381 pass; `checks/architecture.mjs` control-plane 0 failures (the whole-tree run shows 1 architecture failure that is not control-plane's), format 0, words 0 (count 18421 unchanged), ownership checked at the previous COMPLETE and only this module's files changed since.

**Proposed requirement line (BOB writes it):** R124 (fix round 4b, F5; K4492, K4493; acquisition R100, plane R77) The alarm's delivery of an owed render. `deliverOwedRender({ctx, env, storeName, answer, session})` promotes the rendered document `answer.document` as the capture screen promotes an acquired one (screens-intake's `promoteDocument`, through the record's `promote`), filed under the project of the shell document (the capture session's primary, as the session's opener sees it), the opener its author with the door's promote stamps; then R123's read follows (inline when it fits, else written down, `reading_pending: true`). It answers `{ok: true, bundleId, reading_pending?}`, or `{ok: false, reason}` for a session that is gone, one with no opener, an answer with no document or a refused promotion, delivering nothing. Test: `r124-owed-render.test.mjs`.

**Seam:** plane's seam test (an owed render delivered by the alarm, filed under the shell's project, reading pending) is plane's and runs on this once plane calls it as `deliver`; the door's part is tested here.

Size (session_01Gs7CrCGk5nXUSZpiDu6qAK): test runs 32, module lines 4,423

## J25 · QUESTION

Q1 · CONTROL-PLANE #47 · fix round 5 · two points I cannot settle inside control-plane's paths. My best reading is given; I carry on with it.

**(a) "Read it" (`readheld`) and the OCR press: answering at once when the reading will not fit (E2, E6).**
The door can tell, without a hop, how big the held whole is: the Worker has the evidence bucket, so `env.CAPTURES.head(<store>/captures/<sha>)` gives its size and a 5-byte range gives `%PDF-`. It cannot tell whether the caller may see the document: that gate (NO_HOME for an unseen home, READING_HELD) is extraction's, and answering "being read" from the door alone would tell a member that a large file with that digest exists in a project she cannot see.
Best reading, and what I build: when the whole will not fit (R2 head: a PDF over 2 MB, or a capture over 20 MiB and under the 24 MiB ceiling), the door forwards `readheld` with `defer=1`; extraction's arm, after its own gates, answers `{ok: true, read: false, why: "READING_PENDING"}` without reading; the door then writes the `reading` entry down and answers at once. If extraction ignores `defer`, the press is read inline as today (nothing worse). For the OCR press (`pdfstructure&ocr=1`) the same: the door asks `reading&sha256=` as the member (sight is the reading's own redaction), and if the reading names unread pages and an OCR member is bound it writes the `ocr` entry and answers at once; otherwise it forwards, so every refusal stays the owner's.
NEED from extraction (its job is running): `readheld`/`readheldfor` honour `defer=1` as above. Please send it to EXTRACTION #33 as a CHANGE, or tell me to build the door without the sight gate (not recommended: it is an existence oracle).

**(b) E10 (ii), one call instead of two to five.**
Measured on the real plane (Miniflare, a signed-in administrator, distinct `do-*` metrics in `Server-Timing`):
`whoami` 1 (session), `projectlist` 2 (session, projectlist), `groupidentity` 3 (session, doorwindow, groupidentity), `bootstrap` 4 (session, doorwindow, bootstrap, bootstrapfacts), `queue` 2.
Only `whoami` meets the plan's targets. The session read must come first because every stamp (`viewer`, `by`, `author`...) is built from it, and `admission.admit` judges the class, the capability and the re-ask window from it. Folding it into the op's own call means the object resolves the session and applies `admit` and the stamps itself: admission's pure judgement exported over a resolved session, a route in store-door/plane that does lookup, judgement and stamping in process, and this door sending the raw request there. That crosses admission, store-door and plane, and is a re-architecture of the door's front half, not a fold. A short-lived session cache in the Worker would be cheaper but delays a sign-out or a revocation by its lifetime: that is policy, Bob's.
Options: (A) the object-side admission above, placed by BOB in admission, store-door and plane; I then re-point the door, and the hop test stays red by name until they merge. (B) not this round: the floor is recorded with its numbers (K4354: "what stays over the bar is recorded, never silent"); I do (i) and (iii) only. (C) a session cache, to Bob with its trade-off.
Recommendation: B for the alpha (Bob's focus: efficient deployment), recording the numbers above. Until you answer I write the hop-count test to pin today's counts as ceilings (so no op gets worse) and name the targets in it.
(i) is the part I do now: the door reads the object's own time from each answer's `server-timing: object;dur=<ms>` header and adds `in-<route>;dur=<ms>` beside `do-<route>`. PLANE #50 (merge 11) must send that header; tell it, or give me the name it uses.

## Completion: fix round 5 (CONTROL-PLANE #47, B34, B36-B38)

**Entries applied** (`bio-plane/src/control-plane/`, line numbers at this commit)
- **E3** `index.mjs:684-703` `sizeOfDocument`, `tooBigToReadInline`: a document whose size (capture bytes or the sum of its parts) is over `READING_STATEMENT_MIN` (24 MiB, :219, reading-pipeline's `WHOLE_READ_MAX`) is never deferred, since its reading is only a statement of its size; 20-24 MiB and a PDF over 2 MB still follow by the alarm. Used by `deferReading` (acquire), `readUploaded`, `followEntries`, `deliverOwedRender`.
- **E2, acquire half** `readHeldAfterAcquire` (:2637) and `readUploaded`'s `existed` path (:2616): both ask `readingWontFit` of the held document first and owe the reading (`reading_pending: true`, `pendingadd`) instead of calling `readheldfor` inline.
- **E2, "Read it"** `heldWholeFacts` (:705, the Worker's own R2 `head` plus a 5-byte range for `%PDF-`, no hop) and the `readheld` arm (:2917): a whole that will not fit is forwarded with `defer=1` (a caller's is deleted); extraction's `READING_PENDING` (R86) makes the door write the entry and answer at once. BOB's ruling B35 (a).
- **E6** `unreadDocuments` (:790), `followEntries` (:2567), `pendSha(sha, kind)`: `held.owed` and a promoted reading with `tier3_candidate` (with an OCR member bound) write an `ocr` entry. The OCR press (`pdfstructure` with `ocr`, member session, :2482): asks `reading` as the member and, when the reading names unread pages and an OCR member is bound, writes the `ocr` entry and answers at once (`ocr_pending`); every other press is the owner's.
- **E10 (i)** `phase-clock.mjs`: the object's `server-timing: object;dur=<ms>` on an answer is told as `in-<route>` beside `do-<route>`. (iii) is acquisition's.
- **E1, E5** need no door change; their seam tests run on the merged providers. **E8**: the composition test of B36 (`t51-visitor-copy.test.mjs`) is E8's through-the-door test; green since acquisition merged.

**Failing-first, red then green** (red on `c0b6aaedfb`, the code before this job, green now)
- `t51-round5-door.test.mjs`, 10 tests: 9 red before (E3 x3, E2 x2, E6 x3, E2 "Read it"), all green now; the E10 (i) door test red-first is by absence of the code.
- `t51-round5-seam.test.mjs` E6 (60-page scan, OCR member answering 24 pages a call): red before (24 pages, 1 OCR call), green now (all 60, 57 s, press under 2 s). E1 (10 MB, 22 MiB PDFs, 12 MB text), E5, E1 controls: red before acquisition/reading-pipeline/doorbell/extraction merged (10 MB 261 s timeout; E5 failed), green on the merged tranche. E3 seam (40 MB upload, 41.5 MB capture): green; it was also green on the old door in Miniflare, so the door's E3 proof is the door tests (the old `tooBigToReadInline` deferred them).
- `r123-reading.test.mjs` F2 case and `t51-reading-follows.test.mjs` F2 re-pointed: a 40 MB upload is read as its statement at the door (R-STOP: states the size; the stored reading checked).

**Measurements (E10)**: distinct calls to the object, real plane, signed-in administrator: `whoami` 1, `projectlist` 2, `groupidentity` 3, `bootstrap` 4, `queue` 2. Targets 1, 1, 2, 2. BOB ruled (B35 b): (ii) waits for the deployed copy's in-object time; `t51-hops.test.mjs` pins these as ceilings and names the targets. Its (i) test is red by name until plane sends `server-timing: object;dur=`.

**Tests and checks**
- `node --test --test-force-exit bio-plane/test/m/control-plane/` (merged tranche at 832c763e9e): 405 tests, 404 pass, 1 fail: `t51-hops` E10 (i), red by name until plane (merge 11) states the object's time.
- `checks/run.mjs`: format 0, architecture 0, coverage 6614 of 6614, channels 0, words 0 (count 18421, unchanged). `checks/ownership.mjs control-plane tranche/T51 job/T51/control-plane`: see COMPLETE.

**For BOB**
- Proposed requirement lines. R123 amended: a document whose size is over the whole-read ceiling (24 MiB) is read at once, as its statement, never owed; "an upload over the bound is answered unread" is struck for that case. R117 amended: an `existed` acquire or upload whose reading will not fit is owed (`reading_pending`), never read inside the request. R125 new (fix round 5; E2, E6; B35): "Read it" on a whole that will not fit is asked of the owner with `defer=1` (the size from the evidence bucket) and, on `READING_PENDING`, the entry is written and the answer is at once; the OCR press on a copy whose reading, as the member sees it, names unread pages, with an OCR member bound, writes the `ocr` entry and answers `ocr_pending` at once; a promotion that read a scan with pages left, or carries a reading that left pages, owes the `ocr` entry. R121 amended: the object's `server-timing: object;dur=` is told as `in-<route>`. Tests: `t51-round5-door.test.mjs`, `t51-round5-seam.test.mjs`, `t51-hops.test.mjs`.
- Words owed (T52): the press answers "being read" with no sentence (the screen draws none for `READING_PENDING`/`ocr_pending`); row owed `document.readnow.pending`.
- **Found in other modules**: (1) plane: an alarm is starved by frequent requests: with the 60-page scan owed an `ocr` entry due at once, polling `op=reading` every 4 s left it unworked for 300 s (2 of 3 passes), polling every 20-30 s finished in under a minute. Plane R77's accounting should not let traffic postpone the alarm (E2 d is the same shape). (2) plane `owedwork&sha=` does not take a session key (step 0). (3) the stale `t51-hops` E10 (i) goes green when plane merges.
- Old data (R-OLD): the OCR/defer changes act on new calls only; an old scan with pages left is repaired by the member's next press, which now hands it to the ledger.

Size (session_01ScsNRTFgkShQFLDCyhHJBM): test runs 14, module lines 4,494

**Users' suites** (`bio-plane/test/m/plane/`, `journey-check/`, on the merged tranche): 435 tests, 339 pass, 95 fail, none from this job. Plane: 1 red, `release.test.mjs:74` R24 (`screen.objective.purpose` not held by the words list: the design words, not this module). journey-check: 94 red, all `playwright-core cannot be loaded (run npm ci in bio-plane/src/journey-check)`: the container has no `node_modules` there (K4113 names the lockfile directories; this one was not installed). Nothing of control-plane's is among them.

## J26 · COMPLETE

control-plane fix round 5 complete, pushed (job/T51/control-plane, tranche/T51 merged through extraction). Record: "Completion: fix round 5" in build/jobs/T51/control-plane.md.
E3: a capture over 24 MiB is never deferred (statement). E2: an `existed` acquire/upload that will not fit is owed; "Read it" asks the owner with `defer=1` (size from the bucket) and answers at once on READING_PENDING. E6: unread scan pages owe an `ocr` entry (promote with and without a reading); the OCR press hands the pages to the ledger and answers at once. E10 (i): `in-<route>` from the object's `server-timing: object;dur=`. E10 (ii) per B35: hop counts pinned as ceilings (whoami 1, projectlist 2, groupidentity 3, bootstrap 4, queue 2). E1, E5 seams green on the merged providers; E3 and E6 seams green; E8's composition test (t51-visitor-copy.test.mjs) is E8's through-the-door test, green.
Suite: 405 tests, 404 pass; the one red is t51-hops E10 (i), red by name until plane sends `server-timing: object;dur=`. checks: format, architecture, coverage (6614/6614), words (count unchanged), ownership 0 failures. Users' suites: plane 1 red (release R24 words, not mine), journey-check 94 red from missing playwright-core in the container.
For you: proposed lines for R123, R117, R121, R125 (record). Finding for plane: frequent traffic starves the alarm (60-page scan stuck 300 s at 4 s polling, done in under a minute at 20-30 s).

## Fix round 6 (B40, B41, B42; K4570, K4571, K4573, K4577, K4578)

**Entries applied (file:line in `bio-plane/src/control-plane/`).**
- **G5.** `index.mjs` `tooBigToReadInline`: any format other than a PDF above `READING_DEFER_TEXT_BYTES` (3 MiB) follows by the ledger (PDF above 2 MiB as before); this covers the `existed` + no-home path, the delivery, and "Read it" (`heldWholeFacts`). `readingHeld(sha)` asks the store's plain `reading` read, so an `existed` capture whose reading is already made is neither read again nor promised again (the owner's `readheldfor` is not asked, as round 5 requires).
- **G7.** `readingWontFit` is false whenever the size is over `READING_STATEMENT_MIN`, whatever the clock.
- **G2.** `deliverOwedRender` takes the project and opener from the session's state (a fetch session), else the shell's project (a render); it calls `captureOf(ctx).recordFetchDone({session, document: {bundleId, sha256, locator}, opener, project, at})` for a fetch session only, guarded (B41 item 1). A document-less `fetch_pending` answer passes through untouched (tested). `keptInStore`: a timed-out `acquire`'s `kept` is `held` when the record holds the address (`heldat`) or the opener's own session is kept (`loadcapturesession`, opener only), else the stages decide.
- **G4 (B41 item 3).** `readUploaded` carries `reading_pending` and `diag` from `read.body` and writes the row.
- **G14.** A reading that answers `more` (the `readheldfor` answer or the document's `reading.more`) is owed to the ledger on promote/pull (`followEntries`), the `existed` upload, `readHeldAfterAcquire`, the acquire answer and the delivery. **G18.** `followEntries` follows the first 16 and owes the rest (`pendSha`).
- **G1.** `PLANE_CRONS_STATEMENT = "bio-plane-crons/1 */5 * * * *"` exported and on the made function (`cronsStatement`).
- **G12c (B41 item 4).** `reviewcopy` forwards `drafts` (query or body list, session path only), each copy of a `review-copies` answer is stamped as the single read is (in-band quartet, group fields per its project); `casedrafts` takes `projects` as a body list or the query; `inquirystrength` `ids` passes in the query (body list passes through the forward).

**Failing-first, seen red then green.** `t51-round6-door.test.mjs` (17): G5 (walker's 12,000,060 B text, format classes, `existed`, held), G7 (40 MB upload and 41.5 MB capture, clock spent, promotion), G1 literal, batch keys, G14, G18, batch answers, `fetch_pending` relay, `kept` asked of the store: all red on the code before (run with the old `index.mjs`), green now. `t51-round6-seam.test.mjs` G5 on the real plane (12 MB text answered unread and owed in 31 s test time; first lines in `text_units`; second upload `existed`, nothing promised): red on the old code, green now; G7 real (40 MB upload, no row owed) green; control 1 MB text read inline. `r124-owed-render.test.mjs` +4: fetch session project/opener, 12 MB text owed, `recordFetchDone` once.

**Red by name (providers unmerged), no other red of mine.** (1) `t51-round6-seam` G2 (two tests): `acquire {locator, project}` of 15,932,155 B at 0.7 MB/s answered in 22.4 s (needs acquisition `fetch_pending`/`owedFetch`, plane `fetch` kind, capture `openCaptures`/`fetch_done`, notice-producers); no Content-Length 21.4 s, same. The 1 MB control is green. (2) G13: after 1,100 s `ENDMARKER` is not in `text_units` and the ledger holds nothing owed (extraction segments and `more`, reading-pipeline cursor, plane continuation). (3) `t51-round6-door` G4: extraction's `acquireReadingOp` still answers `{response}` 502 for a failed read (EXTRACTION #34 J18).

**Measurements (R-CLOCK: the test's clock outside the object).** Local workerd (Miniflare), text uploads read inline: 1 MiB 1.5 s, 2 MiB 2.8 s (about 1.4 s/MiB, as the live 12 MB text's 18 s); 3 MiB+ is owed. The 100 MB declared-length workerd check of G2 and the 12 MB/24 MiB ledger read need the providers; not run.

**Tests changed because the entry changes their rule (not weakened):** `t51-defer-reading` control "large file that is not a PDF" 20 MB html is now a 3 MiB page (above it is the new door tests); `r123-reading` promote F1 9 MB text is now 3 MiB; `t51-round5-door` "text whole under 20 MiB" control is 3 MiB; their no-inline-read assertions stand.

**Words.** No new sentence: nothing drawn here. Stand-ins named: none from this module.

**Proposed requirement lines (BOB writes `build/requirements/`).** R105: `kept` is `held` when the record holds the address or the opener's session is kept. R123/R125: the size rule by format class (non-PDF above 3 MiB, PDF above 2 MiB); a statement is made at once whatever the clock; a reading already held is not promised; a `more` reading is owed; a promotion's documents past the 16th are owed; a failed read after a kept upload is `reading_pending` with `diag`. R124: the delivery serves a finished fetch (project and opener from the session) and records `fetch_done`. R1: the cron literal. R20: batch `drafts`/`projects` and their stamping.

**Found in other modules.** `build/plan/next.md:38` fails `checks/format` (N1265 names no P19 reason): BOB's. Plane suite: one failure, R24 (accepted by name in the plan). `r117-held` R117 (acquire): passes alone 5 of 5 once and 7 of 8 later on the code before my change, and fails 2 of 8 there under load too: the accepted flake, not mine.

**Tests and checks.** control-plane suite without the long seam file: 430 tests, 428 pass, 2 fail (the G4 red above; the R117 flake). Users run green: answer-envelope 43, store-door 55, signin-door 15, tasks 134, op-declarations 247, instance-setup 218, queue 210, screens-action 270, scheduler 135 (all pass), plane 319 of 320. `checks/architecture` 0, `coverage` 92 of 92, `words` 0 failures, `ownership` 0 failures, `format` only `next.md`.

Size (session_01X5bP76qJ2j296J7FB51rWp): test runs 24, module lines 4,620

## J27 · COMPLETE

control-plane fix round 6 (B40-B42) built and pushed. Door side of G5 (3 MiB size rule by format class), G7 (statement ignores the clock), G2 (delivery by session project/opener, recordFetchDone, kept asked of the store, fetch_pending relayed), G4 (diag/reading_pending on upload), G14/G18 (more owed; first 16 followed, rest owed), G1 literal, G12c batch keys and stamping. Failing-first seen red then green. RED BY NAME until providers merge: G2 seam (acquisition fetch_pending, plane fetch kind, capture, notice-producers), G13 seam (extraction/reading-pipeline/plane: ENDMARKER absent after 1100 s), G4 door test (extraction 502). Control-plane suite minus the long seam file 428/430 (the G4 red; the accepted r117-held flake). Users green; plane R24 accepted. Changed 3 old tests to the 3 MiB threshold (noted). Proposed requirement lines, measurements and Size line are in build/jobs/T51/control-plane.md. For BOB: format check fails only on build/plan/next.md:38.

## Re-completion (B43; K4577 follow-up)

Merged `tranche/T51` (acquisition merged). (1) `t51-visitor-copy.test.mjs` lines 63-71 now assert `[ok, render.state, document]` = `[true, "pending", undefined]` and `copySha = hex(RENDERED)`; its alarm half passes (1 of 1). (2) **`r117-held` R117 (acquire) root cause:** the file builds a real Miniflare plane at module scope; its boot runs in the same process while part one's door tests run, and holds the first request for about 17 s (measured: `acquire;dur=17000-17755` in 6 of 14 runs, with only 0-4 ms in any object call). The door's own clock arm of `readingWontFit` (R120: under 8 s of the 25 s bound left) then says "will not fit" and owes the reading instead of asking `readHeld`, so the first assert reads `0 !== 1`. It is a test depending on wall time (R-CLOCK), not a door fault, and not load in the usual sense. Fix: part one's hooks set `acquireBoundMs` to an hour (`NO_CLOCK`), so no case about `readHeld` is decided by the clock; the clock arm itself stays tested in `t51-defer-reading`. 8 of 8 runs green after (was 6 of 14 red). (3) The delivery already reads `state.opened_by`, `state.project`, `answer.document` and calls `recordFetchDone` (tested in r124).

Size (session_01X5bP76qJ2j296J7FB51rWp): test runs 30, module lines 4,620

## J28 · COMPLETE

control-plane re-complete (B43): visitor-copy test updated to acquisition R106 (alarm half passes); r117-held R117 root cause = real Miniflare booting in the same process holds the first request ~17 s so the door's own R120 clock arm owes the reading (test depended on wall time); fixed by pinning acquireBoundMs in part one, 8/8 green; delivery contract (opened_by, project, answer.document, recordFetchDone) as stated. Details in the record.

## B44 follow-up

B44 read (it crossed J28, which answers B43). With acquisition merged, the G2 seam was run against the tranche: still red, `acquire` of the 15,932,155 B file answers in 22.2 s (39.8 s with the tick wait), the no-length case in 21.3 s, 1 MB control green. The hand-off needs the plane's `owe` (`fetch` kind, `PENDING_KINDS`) and capture's `openCaptures`/`fetch_done`, unmerged; red by name until plane and capture merge.

## J29 · REPORT

B44: all three done in J28 (visitor-copy test, r117-held root cause = wall-clock test fixed, contract). G2 seam re-run with acquisition merged: still red (22 s) until plane's fetch kind and capture merge. Nothing else open.

## B45

Merged `tranche/T51` (capture). Capture's `recordFetchDone` takes `document` as a string (the real call refused my object as `recorded: false`, which the spy test could not see): the delivery now passes the document's bundle id. The real-capture test (`r124-owed-render.test.mjs`, last test) finds one `fetch_done` row `{session, document: bundleId, opener, project}` for a fetch and none for a render; red before the fix, green now (9 of 9 in the file). The G2 seam still waits on the plane's `fetch` kind.

## J30 · REPORT

B45 done: merged capture; recordFetchDone takes document as a string, so the delivery now passes the bundle id (my first shape, an object, was refused by the real call and my spy test could not see it). Real-capture test finds one fetch_done row per fetch, none per render; r124 9/9. G2 seam waits on the plane fetch kind.

## B46

Merged `tranche/T51` (plane, extraction, reading-pipeline, capture, acquisition all in). (1) **G2 seam, real plane `fetch` kind and real `owedFetch`: green.** `acquire {locator, project}` of the 15,932,155 B file at 0.7 MB/s answers in under 2 s `fetch_pending` (declared 15932155, no document, at most 1 MiB pulled); `opencaptures` lists the session; the tick files the document in the project; the reading is owed or made, and the PDF's words reach `text_units` (R-STOP); the Queue tells the opener; a second capture answers in under 2 s. No Content-Length: answered at 10.2 s with `fetch_pending`. 1 MB control green (44 s whole test). I had asserted "a reading row is owed" as a snapshot, which raced the ledger's fast read; it now waits for either, then for the words. (2) `t51-round6-door` 17 of 17: `readUploaded` carries `reading_pending`, `diag` and the row for a failed read (G4, now green with extraction merged); `more` is registered on promote, held upload, acquire and delivery (G14); the 16-and-owed rule (G18). (3) **`r117-held` alone five times: 9 of 9 pass in each of five runs** (the wall-clock fix of B43 holds).

**G13 seam still red, and the cause is not the door's.** Run on the merged tranche: the 12 MB text (last line ENDMARKER), uploaded, answered unread and owed, promoted: the ledger's first tick reads it at once (4,096 units, `found: true`), and then the `reading` row is gone (`owedwork` empty) with no continuation: after 1,100 s `ENDMARKER` is not in `text_units`. The door's part is done (the upload is owed; `followEntries` and `readUploaded` register a continuation whenever the reading answers `more`); the first piece comes from the plane's tick through extraction's `readHeld`, and its answer did not carry `more: true` for a text of about 119,000 one-line units, so the ledger settled the row. To look at: extraction `readHeld` (index.mjs ~762-769, `out.more` from the reading-pipeline's read of a text with no blank lines) and plane `pending.mjs` ~106. The test is `t51-round6-seam.test.mjs` G13, unchanged.

Size (session_01X5bP76qJ2j296J7FB51rWp): test runs 40, module lines 4,620

## J31 · COMPLETE

B46: merged tranche. (1) G2 seam GREEN on the real plane fetch kind + owedFetch (fetch_pending <2 s, tick files it in the project, words in text_units, Queue notice, second capture <2 s; no-length 10.2 s). (2) door tests 17/17: readUploaded carries reading_pending, diag and pendSha; more registered on every door path. (3) r117-held alone x5: 9/9 each. G13 seam still RED and not the door's: the 12 MB text's first tick reads 4096 units then the reading row ends with no continuation (owedwork empty), ENDMARKER absent after 1100 s: extraction readHeld's answer did not carry more:true (index.mjs ~762-769) or plane pending.mjs ~106 settled it. Evidence in the record.

## B47

Merged `tranche/T51`. Each of the four reds failed alone before; one root cause for all, **by design of round 6's G2**: each acquires a file over 8 MiB (15.9, 16, 22 and 41.5 MB) by address and read `answer.document` (`TypeError: reading 'capture'`/`'locator'` at `t51-held-failed.test.mjs:101`, `t51-large-pdfs.test.mjs:86`, `t51-round5-press-seam.test.mjs:118`, `t51-round5-seam.test.mjs:175`). Since acquisition's park (`fetch_pending`, `LARGE_DECLARED`) such a capture is answered at once with no document, and the alarm's delivery (`deliverOwedRender`, index.mjs) files it and follows its reading. No member operation fails: each case now passes through the real plane to its old end state. Updated to the new contract:
1. `t51-held-failed` R117 (C5b): the old-build starting state (a 22 MiB packet promoted with a reading that failed for want of the whole) is made by the member's upload of the same bytes (same digest and parts); the recapture by address answers `fetch_pending` even for held bytes, and the failed reading is replaced by the tick's delivery (polled up to 300 s): green, 36 s.
2. `t51-large-pdfs` R120/R121: the 8.8 and 15.9 MB captures assert `fetch_pending` with the declared size; the 2.5 MB keeps the old path; the alarm reads all three. The 2 s bar is not asserted here (the 15.9 MB answer took 4.7 s while the object ran the tick of the 8.8 MB capture before it: one object, one thread; the 2 s case alone is `t51-round6-seam`); 15 s stays.
3. `t51-round5-press-seam` R125 (b), (c): the first capture asserts `fetch_pending`, waits for the tick's filing and the words in `text_units`; the second capture is answered at once with no `readheldfor` in its timing and any promise backed by a ledger entry; (c) then finds the reading held (NO_HOME was a consequence of (b) never filing).
4. `t51-round5-seam` E3 (41.5 MB): asserts `fetch_pending`, then the `final` statement with the size (G7) within 120 s.
Suite: control-plane directory minus G13 (BOB's fixed seam): 437 tests, 437 pass.

Size (session_01X5bP76qJ2j296J7FB51rWp): test runs 46, module lines 4,620

## J32 · COMPLETE

B47: the four reds had one root cause by round 6's design: each captures a file over 8 MiB by address and read answer.document, but G2 now parks it (fetch_pending, no document) and the alarm's delivery files it. No member operation fails. Updated to the new contract: t51-held-failed R117 (old state made by upload; recapture replaced via the tick), t51-large-pdfs R120/R121 (fetch_pending for 8.8/15.9 MB; 2 s bar left to t51-round6-seam, 4.7 s seen while the object ran the previous tick), t51-round5-press-seam R125 b/c (fetch_pending, then words), t51-round5-seam E3 (fetch_pending, then final statement with size). Control-plane directory minus G13: 437/437. Pushed b5dc0aa72f + record.

## G30, control-plane's half (CONTROL-PLANE #49, B48; K4609, K4428)

**Entry.** `page()` writes one structured log line per front page: `console.log(JSON.stringify({event: "control-plane.page", ...pageWork(), ms}))`, where `pageWork()` is interface-shell R126's counts (scripts composed, hashes taken, checks run). Nothing else changed. `bio-plane/src/control-plane/index.mjs`: the `pageWork` import (:47) and `page()` (:888-896).

**(1) Root cause.** Not a defect of this module's code: B-21 (a page that took 20-30 s) is `diagnosis-R6-unplaced.md` B-21, cause unknown, probable the page route's synchronous work (script hash twice per hit, checks per hit; fixed once per release by INTERFACE-SHELL #18, R126). This job's part is the evidence for the deploy: the page route states its own work (counts, not CPU times, R-CLOCK), so the live copy names it.
**(2) Why the tests missed it.** No test observed what the page route does per request; `page-policy.test.mjs` and `doors.test.mjs` assert answers only. Gap fixed: `t51-page-log.test.mjs` reads the route's own log.
**(3) Failing-first.** `bio-plane/test/m/control-plane/t51-page-log.test.mjs`, "R126 (G30)": twenty `GET /` through the real door log twenty `control-plane.page` lines, each with integer `scripts`, `hashes`, `checks` and a finite `ms`, and `scripts`, `hashes`, `checks` all 1 on every line (the first line included: this file is its own process); control: `/version`, the favicon and an unknown op log no page line. Red before the change: `0 !== 20` ("one line per front page"). Green after: 1 pass.
**(4) Platform check.** N (INTERFACE-SHELL #18's `page-contention.probe.mjs` measured the route).
**R-OLD.** No stored data. **Words.** No new sentence a member reads (a log line). **Census ops.** None changed.

**Requirement line proposed (BOB writes it), control-plane R126:** (T51, fix round 6, G30; B-21; K4428, K4609; `interface-shell` R126) **The front page names its work.** Every page the door draws (`GET /`, `/app` and below, and the unknown-address page, R104) writes one structured log line `{event: "control-plane.page", scripts, hashes, checks, ms}`: the counts of scripts composed, hashes taken and screen and guide checks run in this isolate (`interface-shell`'s `pageWork()`), and `ms` the isolate's clock; counts, not CPU times (R-CLOCK). The line carries no credential, member, address or name; no other route logs it; the page's answer is unchanged. Test: `t51-page-log.test.mjs`; control: a route that is not a page logs none.

**Entries applied:** the G30 entry. **Deferred:** none. **Found in another module:** `plane`'s own tests fail identically on `origin/tranche/T51` without my change: `release.test.mjs` "R24 (DEC-149; T34-87, K1784; T51)" (a screen-name words rule) and `l77-size.test.mjs` "R77 L (gate)" (21 MB PDF alarm read in a capped child; run alone, 74.9 s, red on both trees). Not caused by this job; BOB's to place (plan section 4 lists the memory gate class).

**Tests and checks.** `node --test --test-force-exit bio-plane/test/m/control-plane/`: tests 439, pass 439, fail 0. `build/plan/impact.mjs origin/tranche/T51 HEAD`: control-plane 68/82, plane 50/58; affected modules 2 of 176. plane: tests 351, pass 349, fail 2 (the two above, identical on the tranche without my change). Process checks (`checks/run.mjs`): format 0 failures; architecture 0; coverage 6667 of 6667 live requirement ids named, 0 failures; channels 0; words 0 failures, count unchanged (`inline 0, plain 0, testcopy 0, missingkey 0`). `checks/ownership.mjs control-plane tranche/T51 job/T51/control-plane`: 0 failures.

Size (session_01UfCsV2Sdg2bv4LCfMXB99A): test runs 9, module lines 4625

## J33 · COMPLETE · re B48

G30, control-plane's half, applied and pushed (job/T51/control-plane). page() (control-plane/index.mjs:888-896) writes one console.log line per page: {event:'control-plane.page', ...pageWork(), ms}. Failing-first t51-page-log.test.mjs through the real GET / door: twenty pages, twenty lines, scripts/hashes/checks 1 on every line; red 0 !== 20 before, green after; control: /version, favicon, unknown op log none. Platform check N. Suite: control-plane 439/439 pass; impact names control-plane and plane; plane 351 tests, 2 fail IDENTICALLY on origin/tranche/T51 without my change (release.test.mjs R24 words rule; l77-size R77 L memory gate, alone 74.9s red on both trees): not mine, BOB's to place. checks/run.mjs: 0 failures all five, coverage 6667/6667, words count unchanged; ownership 0 failures. Proposed requirement line (control-plane R126) is in my record. Size (session_01UfCsV2Sdg2bv4LCfMXB99A): test runs 9, module lines 4625.

## J34 · COMPLETE · re B49

G42, control-plane's half (K4635, K4638), applied and pushed (job/T51/control-plane).

**What changed.** `control-plane/index.mjs`: `op=stats` stamps `capacity=1` for class `admin` or an administering member's session (`viaSession && sessRights.administer`, the `memberlist` judgment), else 0; at the answer, for the administering member alone (not class `admin`), a numeric `result.dbBytes` is floored to a whole `STATS_GRAIN` 100,000,000 B (null stays null, absent stays absent); ADMIN_TOKEN and the founder keep the exact figure; a member and the probe get none. `test/m/control-plane/record.mjs`: `databaseSize` settable (`setSize(n)`).

**Failing-first.** `stats.test.mjs` (door, a store answering as record-core's `stats` does, `dbBytes` only on `capacity=1`): red before (dee stamped `0`, `dbBytes` undefined where 10,500,000,000 expected), green after; sizes 10,573,212,345 / 99,999,999 / 100,000,000 / 0 / null; dee exact-vs-floored, founder and ADMIN_TOKEN exact, ann and the probe absent even when sending `capacity=1`; the stamp test updated (dee `1`). **L** `stats-capacity.test.mjs` (Miniflare, the real Worker and Store, host-governor pattern): `op=stats` as `T.admin` answers a non-zero `dbBytes`, nine 126 KiB leads grow it by over 1,000,000 B, the founder reads it equal to the admin's, an administering member (ruth) floored to a multiple of 100,000,000 and equal to floor of the admin's, a member and the probe none; red before (ruth `dbBytes` undefined), green after.

**Outside my paths, by your START.** `bio-plane/test/stats-disclosure.test.mjs` (record-core's): B1's arm for ruth (an admin-role member) now expects `dbBytes` present and a multiple of 100 MB; 31 pass, 0 fail. `ownership.mjs` lists exactly that one file as outside control-plane's paths: BOB accepts it at the merge (or the arm moves to record-core). The `dbbytesmember`/`dbbytesall` arms named in the file's header comment are `nc-rec129.mjs`, deleted at T20 (no file to update).

**Proposed requirement lines (BOB writes them).** Amend **R40**: "`op=stats` is stamped `capacity=1` for the `admin` class (the ADMIN_TOKEN binding and the founder's session) and for an administering member's session, else `capacity=0`, beside its `viewer` (R17); a caller's `capacity` never reaches the store, in either direction. For an administering member alone, `dbBytes` is answered floored to a whole 100,000,000 B (null stays null); the ADMIN_TOKEN and the founder read it exact; a member and the probe none (G42, K4638)."

**Tests and checks.** `node --test --test-force-exit bio-plane/test/m/control-plane/`: tests 441, pass 441, fail 0. impact set (`impact.mjs origin/tranche/T51 HEAD`: record-core 1/10, control-plane 69/83, plane 50/58): record-core tests 196/196; plane tests 351, pass 349, fail 2, the same two as before my change (`l77-size.test.mjs` R77 L, `release.test.mjs` R24), recorded at J32. `checks/run.mjs`: format, architecture, coverage, channels, words all 0 failures. Ownership: as above.

Size (session_01YAZZqemwaGayLxQo7ovcWS): test runs 9, module lines 4630

## J35 · COMPLETE · re B49

G42 control-plane half done and pushed; see record J34 (door and Miniflare L tests red then green; control-plane 441/441; one file outside my paths, record-core's stats-disclosure.test.mjs B1 arm, edited per your START: accept at merge). Proposed R40 amendment is in J34.

## J36 · COMPLETE · re B50

The gauge's ten words (K4640) added as code-origin rows: `bio-plane/src/control-plane/storage-words.mjs` exports `STORAGE_WORDS` (frozen), each a `localize(id, en)` with the ids and English as B50 gave; `size` is a function of `{used, limit, percent}` (`localize` fills its variables at the call, so it cannot run bare at load). Screens-settings reads the rows by key. Test `storage-words.test.mjs` (names R40): the ten entries, `size` fills its three variables; no English copied. `setup-words/build.mjs --check`: only the expected stale-rows note (first stale word `screen.group.storage.factors.latency`; rows.mjs not committed). `checks/run.mjs`: format, architecture, coverage, channels, words 0 failures. Proposed requirement: R40's G42 line also says "the gauge's ten sentences are control-plane's code-origin rows, `screen.group.storage.*`".

Size (session_01YAZZqemwaGayLxQo7ovcWS): test runs 11, module lines 4645

## J37 · COMPLETE · re B50

B50 done and pushed: STORAGE_WORDS (ten screen.group.storage.* rows, size a function of used/limit/percent) in control-plane/storage-words.mjs, test storage-words.test.mjs; words check 0; setup-words --check reports only the stale-rows note. See J36.

## G43, control-plane's half (CONTROL-PLANE #51, B51; K4649, K4651)

**Entries applied.** (1) `deliverOwedRender` (`control-plane/index.mjs:810`) follows the reading (`readHeld`, else `pendingadd`) when `made.readingDropped === true` as well as when the original document carries none. (2) `archive.mjs`: `PROV_EMBED_MAX = promotion's INLINE_MAX - 65,536` (imports `INLINE_MAX`, which promotion exports for this use; control-plane uses promotion), `embedded(doc)` files a document whose provenance text is over it without `reading`, `text_units`, `text_units_over_bound`, `text_units_skipped` (indent 2 unchanged; a document with none of those keys is filed whole); `promoteArchive` takes `onDropped({sha, document})`, called per document filed without its reading; the answer's shape is unchanged. `index.mjs` `promoteFiled` (both callers: acquire's `promoteAcquired`, and `op=unpack`) follows those with `followEntries`. A 1 MB CSV acquired as an archive member cannot reach this path with a reading (unpack's documents carry none, `unpack.mjs`), but acquire's answer for the archive's own document can (the door reads it), so the bound is applied rather than argued away.

**Failing-first.** `t51-g43-embed.test.mjs`. (a) R58 archive test: archive document and first member carry 1.5 MB / 2 MiB readings; red before (no bound existed: the 2 MiB reading went into `data/provenance.json`; the file fails to load without `PROV_EMBED_MAX`), green after: every provenance file is within the bound, no reading embedded, `readheldfor` and `pendingadd` asked for exactly the two digests whose reading was left out, `promoted` keys unchanged; control: readings that fit are embedded byte-identical and nothing is followed. (b) `promoteArchive` unit: `onDropped` only for the dropped one; a large non-reading field is filed whole. (c) Equality: `INLINE_MAX` is 1,048,576 and the door's bound 65,536 below it. (d) **Seam, red by name until SCREENS-INTAKE #19 merges:** `R124 (G43; K4651): an owed render of a 1 MiB CSV ...` (real `extraction.read` of a 1 MiB CSV with `LASTROWMARK` in the last row, real `promoteDocument`, real promotion): refused `OVERSIZE_INLINE` today. With a local, uncommitted stand-in for the provider's drop (undone), it passes (104 s), and with my `readingDropped` condition removed it fails (neither read nor owed): so the delivery change is what makes it green. Control: a render whose reading fits is filed with it and followed by nothing. The "last row found" half of the plan's test is screens-intake's seam (its tests, K4651 (e)); mine asserts read-or-owed and the file bound.

**L.** The Miniflare real-DO/R2 form is screens-intake's seam (K4651 (e)); mine uses the real record, extraction and promotion in process (the file's pattern). No Miniflare test added here.

**Other embedders, by reading (4).** `store-door/pull.mjs:56` files `doc` from a pulled knock (capture's document, made by capture/acquisition, never passed through the door's reading: the door reads only in `readUploaded` and the acquire handler); `capture-requests/index.mjs:1089` and `monitoring/index.mjs:2582` file the daemon's own captures, which `readHeld` reads afterwards. None carries a door reading; none changed.

**Deferred:** none. **Found in other modules:** none new; plane's two reds (`release.test.mjs` R24 words rule, `l77-size.test.mjs` R77 L) are unchanged from J32/J33.

**Proposed requirement lines (BOB writes them).** R58: "A document the door files from an archive (an acquire's `document`, a member) whose `data/provenance.json` would exceed promotion's inline bound less 65,536 B is filed without its `reading`, `text_units`, `text_units_over_bound` and `text_units_skipped`, and its reading follows by the ledger (G43)." R124: "The delivery follows the reading of a document whose promotion answers `readingDropped`, as one filed with none."

**Tests and checks.** control-plane directory: tests 447, pass 446, fail 1 (the seam above, red by name). plane: 351, pass 349, fail 2 (the same two as J32). `impact.mjs origin/tranche/T51 HEAD`: control-plane 69/85, plane 50/58. `checks/run.mjs`: format, architecture, coverage (6674 of 6674), channels, words all 0 failures; words count unchanged (no new sentence). `ownership.mjs`: 0 failures.

Size (session_01AwthwuHLmeRX25rjM7qqN9): test runs 14, module lines 4680

## J38 · COMPLETE

G43, control-plane's half, done and pushed (job/T51/control-plane). deliverOwedRender follows when promoteDocument answers readingDropped; archive.mjs bounds the provenance file (PROV_EMBED_MAX = INLINE_MAX - 65536; drops reading/text_units; promoteArchive onDropped; both callers follow). Tests t51-g43-embed: archive test red before/green after; 1 MiB CSV owed-render seam RED BY NAME (OVERSIZE_INLINE) until SCREENS-INTAKE #19 merges; with a temporary local stand-in for the drop it passes, and fails without my condition. control-plane 447 tests, 446 pass, 1 = that seam; plane 349/351 (same two as J32); checks 0 failures; ownership 0. pull.mjs/capture-requests/monitoring embed no door reading (by reading). Details and proposed R58/R124 lines in the record. Size (session_01AwthwuHLmeRX25rjM7qqN9): test runs 14, module lines 4680.

## Fix round 7 (CONTROL-PLANE #52, B52): the seam file

**Done.** `bio-plane/test/m/control-plane/t51-round7-seam.test.mjs` (Miniflare plane, round 6's pattern; members enrolled through the door: `memberadd`, `enroll`, `login`): 16 tests, 7 green, 9 red by name until their providers merge. No source change (no door fault found).

**Red by name (expected):** G58 (founder's `owedwork` has none of the five fields: `{ok, owed}` only; provider plane); G61 (member's `op=queue` 400 NO_SUCH_KIND `ingest-done`; provider queue); G61 twin (see finding 2); G64 (see finding 1); G59 (409 GATE_REFUSED C-12.2 on the vouched upload; provider record-grammar and regenerated case-checker; control: unvouched signs, green); G62 (two tests, finding 3); G74 (outsider's `promote` accepted; both controls, a joined and an invited member, green; providers promotion, screens-intake); G75 (finding 4).
**Green today:** G63 (`moneyingest` over 12,000 rows after a plane restart answers `ingesting` under 2 s; the test prints it beside a trivial act: the floor decides, no calculations change by this evidence), G66 (finding 5), G79 (24 MiB and 40 MB uploads; a smoke only, the failing-first is capture's `r7-upload-t51`).

**Findings for BOB (each differs from the plan's reading):**
1. G64: the comma control is RED too. A CSV uploaded and filed reaches `declareTable` as the document's reading text, which is not comma-separated (every row is one cell: 121 rows for 120 data rows, `payee` and `amount` empty). So the cause is wider than a tab file; calculations' delimiter detection fixes it only if it also covers this reading text. The test checks comma, tab, semicolon, pipe and the one-cell refusal.
2. G61 twin: an enrolled member who opens a large capture gets NO `fetch-done` item at all in the Queue after the fetch is filed (3 minutes polled; the Queue answers 200 with other items). So the producer does not mint it for a member (notice-producers `#fetchDone`, or capture's `fetchesDone` opener), a cause beyond the catalogue hole. Not diagnosed further here.
3. G62: the ceremony's `publishpreflight` body never sends `tieAttested`, so `first` is `TIE_ATTESTATION_MISSING`, the Sign step's `publish_at` is null with `publish_at_stated` "not reached", and the screen draws "isn't set". With `tieAttested: true` the zone is `America/Los_Angeles` (offered). Likely the walker's cause: the pre-flight request, not the zone. Test 1 asserts the ceremony's call (red); test 2 the `tieAttested` call (zone green, `source` red until ratification adds it).
4. G75: the plan's null / "Untitled capture" was not reproduced. What is red: for an address naming no file, the delivery's `cs` (`control-plane/index.mjs` ~:795, `date: (d) => d`) fills `titleOf`'s `{ date: { html: cs.date(day) } }`, so the title reads "A page from www.example.gov, captured [object Object]" in the held row and the filed bundle. A defect in MY module (the delivery's `cs`); it is not fixed here because the START says no source change; I can fix it on a CHANGE.
5. G66: green, but the second capture must come in a later second than the first: two captures of one address in the same second answered `versionnotice` `no_newer_capture`, so no item. The test waits 2.5 s. A tie-break gap in the chain (stamps are whole seconds): BOB's ruling.
Also: `reauth` is not in the ceremony's op list; the test calls it before `caseratify` (REAUTH_DUE otherwise).

**Checks.** `checks/run.mjs`: format 0, architecture 0, words 11 failures all in installer-steps (not mine, none names control-plane), coverage 1 failure (not this file's ids). `ownership.mjs`: 2 files changed, 0 failures. `r117-held` not run alone (no change to it).

Size (session_01DVeYe6wF7P8CpLfVhfSwSK): test runs 9, module lines 4680

## J39 · COMPLETE

Round 7 seam file t51-round7-seam.test.mjs pushed: 16 tests, 7 green, 9 red by name for their providers (G58, G61 + fetch-done twin, G64, G59, G62 x2, G74, G75). No source change. Five findings differing from the plan are in the record (J-round7 section): G64 comma control red too (reading text not comma), fetch-done never minted for a member, G62 ceremony never sends tieAttested, G75 title is '[object Object]' from the delivery's cs date (my module; fix on CHANGE), G66 same-second tie. Checks: format/architecture 0, ownership 0.

## B53 (CHANGE): G75 fixed

The delivery's `cs` (`control-plane/index.mjs` ~:795) now unwraps `{html}` variables for `word` and formats `date` as a UTC "October 23, 2026" (it returned the ISO string, and `word` printed the `{html}` object): the held row and the filed bundle read "A page from www.example.gov, captured October 23, 2026". §G75's seam test (red before) is green; its small-PDF control stays green. G66's same-second tie accepted (B53); `reauth` before `caseratify` is right.

Control-plane directory after merging tranche/T51: tests 463, pass 457, fail 6. The six are the seam sections red by name for providers not merged: G58, G61 (ingest-done), G61 twin (fetch-done, BOB diagnosing), G64 (calculations CHANGE), G62 x2 (screens-publish CHANGE). G59 and G74 now pass (their providers have merged).

Size (session_01DVeYe6wF7P8CpLfVhfSwSK): test runs 11, module lines 4690

## J40 · COMPLETE

B53 done: G75 fixed in the delivery's cs (date formatted, html vars unwrapped); seam G75 green. Control-plane dir 463 tests, 457 pass, 6 red by name (G58, G61, G61 twin, G64, G62 x2); G59 and G74 now green. Record updated.

## J41 · REPORT

G83 re-point done and pushed (5 sites via storeStub; t51-g83-location.test.mjs 13 tests, 7 red before, all green with a local stand-in of runtime-limits' store-place.mjs, which is NOT committed: my branch imports ../store-place.mjs and is red until runtime-limits merges; waiting for your CHANGE, no COMPLETE). Also found, not mine and independent of G83 (same on HEAD before my change): after merging tranche/T51 two round-6 seam tests fail: t51-round6-seam G7 (40 MB five-part upload now leaves a reading row owed; the test asserts none) and G2 (15.9 MB fetch_pending flow). Likely capture/acquisition's G79 change (keep handed to the ledger / owed row) or reading-pipeline; the test pins the round-6 behaviour. Tell me whether to amend the round-6 assertions. Seam round 7: G64 and G59/G74 now pass; remaining red: G58, G61 x2, G62 x2.

## J42 · QUESTION

G83 done on the merged tranche (store-place.mjs in): t51-g83-location 13/13 (7 red before). Control-plane dir after merge: 476 tests, 473 pass, 3 fail: G58 and G62 (round-7 seam sections, providers plane / screens-publish unmerged: accepted red by name) and t51-round6-seam G7 (40 MB five-part upload: a reading row is owed, why NO_HOME, attempts 1, where the test says none). G7 fails the same on the pre-G83 commit, so it came with the tranche merge. My reading: with capture's G79 (keep handed to the ledger) the 40 MB upload's document carries no stated reading any more, so the door's promote follow (followEntries, readingWontFit -> pendSha, index.mjs:2682) owes a row that the ledger then clears; the stated final reading itself is still made (the test's first assertions pass). QUESTION: is a transient owed row the intended contract after G79 (then I amend G7 to wait until the row clears, my test file), or must a stated-final upload owe nothing (then followEntries must skip a capture whose stated reading is held, and I need to know which read says 'stated final held': readingHeld refuses readings with a failure)? Best reading: amend G7 to wait for the row to clear. I will do that on your word and COMPLETE; checks: format 0, architecture/coverage/words failures none name control-plane, ownership 0.

## J43 · REPORT

After merging tranche/T51 (B56): control-plane dir 476 tests, 473 pass, 3 red: G7 (round 6, red by name until PLANE #54), G58 (plane), and G62. G61 x2, G2, G59, G64, G74, G75, G66 are green. G62 is still red and is a finding, not a test to amend: the test 'R105 (G62): with the instance's profile oakland-alameda chosen, the Sign step's pre-flight, asked as the ceremony asks it ...' (t51-round7-seam.test.mjs:453) asks publishpreflight with body {draft, project, biasAcknowledgement} exactly as src/screens-publish/ceremony.mjs sends it (the ceremony never sends tieAttested; only its publish act does). ACTUAL: first = {ok:false, reason:TIE_ATTESTATION_MISSING, check C-120.16}; the Sign step's publish_at = null with publish_at_stated 'Whether this edition can be published at a set time is not known yet: the signing check is not reached, so only publishing now is described here.' EXPECTED: publish_at {offered:true, zone:'America/Los_Angeles'}. The companion test (same pre-flight with tieAttested:true) is green on the zone and on publish_at.source. So the walker's 'time zone isn't set' is the pre-flight not reaching the signing check because the ceremony's read omits the tie attestation (ceremony.mjs ~:77 P.later(cs, view, 'preflight', 'publishpreflight', {body: args})); fix is screens-publish sending tieAttested with the read when the member has attested, or case-authoring not gating publish_at on it. Route as you see fit; I do not COMPLETE with G62 red unless you say so. G83: t51-g83-location 13/13 on the merged helper.

## G83 (B54, B55): the five room sites

`control-plane/index.mjs` obtains the room only through `storeStub(env, name)` (runtime-limits R28) at the five sites (AI grant admission `bio`, the delivery's owed row, the `bio` stub, the scratch stub, the request's forward); logical names unchanged. Harness `env.gets` records each `get()`'s id, options and stack. `t51-g83-location.test.mjs` (names R33): 13 tests, 7 red before, all green with the merged helper: hint `wnam` on every control-plane get(); generation 2 gives `bio~g2`/`scratch~g2` and no bare name, the delivery's `store=` stays `bio`; neither binding gives today's calls; `WNAM`, `bogus`, empty, ` wnam` pass no options. Why missed: no test recorded `get()`'s arguments. Platform check N. No requirement wording proposed. No generated artifact made stale.

## Completion (B55, B57)

Control-plane directory after merging tranche/T51: 476 tests, 473 pass, 3 red by name (K4764): round-6 G7 (until PLANE #54's keep-owner change, NO_HOME owes nothing), round-7 G58 (plane), round-7 G62 (screens-publish; actual value in J43: `TIE_ATTESTATION_MISSING`, `publish_at` null). Checks: format 0; architecture, coverage and words show failures none of which names control-plane; ownership 0. Impact set: control-plane 71/87, plane 54/66 (run by their jobs).

Size (session_01DVeYe6wF7P8CpLfVhfSwSK): test runs 15, module lines 4695

## J44 · COMPLETE

G83 done (5 sites via storeStub, t51-g83-location 13/13, 7 red before). Control-plane dir 476 tests, 473 pass; red by name per K4764: round-6 G7 (PLANE #54), G58 (plane), G62 (screens-publish; actual value in J43). Checks: format 0, ownership 0, no architecture/coverage/words finding names control-plane. Record updated.

## B58 (CHANGE, K4765): G62's seam test rebuilt

The G62 test was stale: since B46 the ceremony sends `tieAttested: true` once the Ties step is confirmed. `t51-round7-seam.test.mjs` now builds the pre-flight body with the ceremony's own `PARTS.caseArgs(copy, draft)` from the draft's real `reviewcopy`, the declared bias, and `tieAttested: true` exactly when the edition is prepared. Test 1 (prepared): `publish_at` is `{offered: true, zone: "America/Los_Angeles"}` with a `source` (local-facts or profiles): green. Control (a draft not yet prepared): `TIE_ATTESTATION_MISSING`, `publish_at` null with `publish_at_stated`: green. The old "tie attested" companion is folded into test 1.

Control-plane directory: 476 tests, 474 pass, 2 red by name: round-6 G7 (until PLANE #54) and round-7 G58 (plane). Checks as at J44.

Size (session_01DVeYe6wF7P8CpLfVhfSwSK): test runs 17, module lines 4695

## J45 · COMPLETE

B58 done: G62 seam test now builds the pre-flight body with the ceremony's own PARTS.caseArgs + tieAttested when prepared; green (zone America/Los_Angeles with source), control TIE_ATTESTATION_MISSING green. Control-plane dir 476 tests, 474 pass; red by name only G7 (PLANE #54) and G58 (plane). Record updated.

## J46 · COMPLETE · re B59

control-plane T51, B59 (cause G60, K4772): the seam arm is built and pushed on `job/T51/control-plane` (0cc939a04b). Test-only: no product code changed, no door defect found.

**Entry applied.** `/* ---- G60 ---- */` in `bio-plane/test/m/control-plane/t51-round7-seam.test.mjs` (two tests, naming R105):
- The held finding is made by the member's own act. After filing and vouching her upload she revises the document through the real door under a snap key the history cannot name (`reviseUnnamed`, `promote` with `snapKey: "not-a-stamp"`, the stored bytes carried by address as the screens carry them). It is the plan's C-12.2 shape ("history file ... maps to no manifest entry"). I could not delete a stored snapshot copy: no door op or Miniflare handle removes a single history file. The case is then prepared by the ceremony's own `publish`.
- Test 1: the real `publishpreflight` passes (`first` is null). `caseratify` through the real door answers 409 `GATE_REFUSED` with three real findings, each `C-12.2` with the gate's text and repair. The ceremony of screens-publish, given exactly that answer, draws the refusal's key (`refusal.GATE_REFUSED`), `ceremony.gate.heading`, and one line per finding with its check, its text and its repair, all from the door's data (no English asserted). Nothing is drawn signed.
- Control: the same case with no revision signs (200, `ok`, no `findings`) and the ceremony, given that answer, draws no refusal and no finding, and draws it signed.
- Seen red first: with the two `GATE_REFUSED: GATE_REFUSED, // G60` handler lines removed from `screens-publish/ceremony.mjs` in my working copy (restored with `git checkout`, never committed), test 1 failed at "under the heading the ceremony lists its stops by" (`actual: false, expected: true`). Green on the tranche.
- The file now imports `./register-declared.mjs` and `../screens-publish/fixtures.mjs` (both in control-plane's `uses`, as the module's other tests already do) and `preparedEdition` takes a `spoil` option; its header lists G60.

**Deferred.** None. **Found in other modules.** None. Proposed requirement wording: none.

**Tests and checks.**
- Seam file alone, five runs: 18 of 18 pass each time.
- `node --test bio-plane/test/m/control-plane/*.test.mjs`: 478 tests, 478 pass, 0 fail.
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 1 of 176 (control-plane); no user to run.
- `checks/format`: 176 modules, 0 failures. `checks/architecture control-plane`: 0 failures. `checks/coverage control-plane`: 93 of 93 live ids named. `checks/words control-plane`: 0 failures. `checks/ownership control-plane tranche/T51 job/T51/control-plane`: 0 failures.
- Generated artifacts made stale: none.

Size (session_011FKAKGkn2jfrmRFWQyLVFe): test runs 17, module lines 4,680

## J47 · QUESTION

control-plane #54, fix round 8 (G114/G106). Three small contract points the providers and I must share; my best reading is stated, I carry on with it.

1. **The shape of `v`, and where the door learns the current stamp (G114, R127).** R127 says the door accepts exactly a `v` carrying the current release, the asked language and the current `words_version`. Nothing yet says how the three are written in `v`, nor how the Worker learns the current language and stamp (translations R20's `wordsVersion()` is in-process in the object; the Worker is not). My reading, the smallest thing that works with no new hop: (a) `v` is `<release>~<language>~<words_version>` (three parts joined by `~`, an unreserved URL character; the release alone, as today, still names the release and is answered `private, no-cache`); (b) the object's `interfacewords` answer `result` carries `language` (it already does, R8) and `words_version` (translations R20's value), so the door compares the three parts of `v` with `env.VERSION` and that answer and nothing else. What I need: translations (or the instance-setup arm that answers `interfacewords`) to add `words_version` to that answer's `result`, and interface-shell's `loadWords` to join the three with `~` in that order (its R128 test then asserts that form). Tell me if you prefer another form; I will follow it.

2. **The object's age for `timings.door.cold.object_ms` (G106, R129).** The Worker cannot see the object's age. I will read it from a module-stated Server-Timing entry `object-age;dur=<ms>` that the object states in its answer (R128 accepts such entries). The plane is not a provider this round, so until it states that entry `cold.object_ms` is `null` (the field is always present; `isolate_ms` is the Worker isolate's age, measured by the door). My test asserts the field and that a stated `object-age` is carried. If you want the object's age stated now, the plane's `store.mjs` (`objectTiming`, line 52) is the one-line place and is not mine.

3. **Two forms I choose (R128, R129), for the other jobs that read them:** the door adds `body;dur=<ms>` and `bytes;dur=<n>` (both numeric, so the same parser reads them) to `Server-Timing` once per request, summed over the object answers' bodies; and each `acquire`/`captureupload` writes `{event:"request_start", op, isolate_ms, object_ms}` BEFORE the object is called and `{event:"request_done", op, total_ms, stages, door, queued_ms, isolate_ms, object_ms}` after (the start line is what survives if the tail of the long firing's log is lost, R-LOG).

No answer needed to carry on; I stop only if (1) turns out to need a different place for the stamp.

## J48 · QUESTION

control-plane #54, after merging tranche/T51 through B66. Green now (red seen first, then green): R127 words (r8-words-cache, r8-words-door, t51-interfacewords), R128 (r8-phase-clock incl. stateTiming and the Queue marks lifted from `result.derivation`), R129 (r8-door-phases), G118 fleet (r8-bootstrap-fanout), seam F, C, A, A1b, G108, G109, G115/G116. Two defects of MY door found and fixed on the way: the env handed to hooks was a new Proxy each request, so instance-setup's per-env memo (G118) never hit (now one stable clocked env, the request's clock in async context); and the Queue's `derivation` was never turned into `queue-count`/`rows-queue` marks (the door lifts it now).

Three seams stay red, each in a provider's code, not mine. I need BOB to send each owner a CHANGE (or rule otherwise):
1. SCREENS-INTAKE (G105, seam A2): the Add screen's watch (`capture.mjs` watchFetch ~746 and the Unfinished line ~385) reads top-level `failed` of an `opencaptures` capture; acquisition (R111) lists it as `fetch_pending.failed` (the row ends final with CAPTURE_HELD_BY_ANOTHER_BUNDLE and the listing carries it; both asserted green). So the watch never ends in the held-elsewhere words and polls on. Fix: read `c.fetch_pending.failed`.
2. RATIFICATION (G120, r8-caseratify-calls): of the plan's figures (b) the three reads issued together is green, the case file's heads/puts in flight 8 (>=6) is green; the chain is 38, the plan says <=25. Cause: `copyMaterials` is still sequential: events 31-54 are `PUBLISHED.head / CAPTURES.get / PUBLISHED.put` x6 one after another, before `recordcasefile`. Making them concurrent (groups of 8) gives <=25.
3. G119 table (r8-hops): a MEMBER's `bootstrap` makes 4 object calls (session, doorwindow, bootstrap, bootstrapfacts), the plan's table says at most 3 (administrator 4). groupidentity is now 3 as ruled. Either `bootstrapfacts` is folded for a member (instance-setup/plane) or the table's member figure is 4: your ruling; my test follows it.
Also a finding for acquisition/capture, not asserted: two PDFs from the test kit with the same size and same filler stream but different page words, for different members, were refused CAPTURE_HELD_BY_ANOTHER_BUNDLE on the second; my seam makes each file distinct to avoid it. Possibly distinct documents sharing a large stream are treated as held.
I carry on with the checks and my record meanwhile; I will COMPLETE when 1-3 are answered or ruled out.

## Fix round 8 (B60, B61–B68): G114 and G106, the seam owner's work

**Entries applied.**
- **G114 / R127** (`words-cache.mjs`, `index.mjs`): `v` is `<release>~<language>~<words_version>` (BOB K4822); the language and the stamp are read from the owner's `interfacewords` answer (`result.language`, `result.words_version`, translations R19/R20). Exactly that `v` is answered `private, max-age=31536000, immutable`, a weak `etag` of the key, `vary: Accept-Encoding`, 304 on a held validator; any other `v` or none is `private, no-cache`. The answer is read for a bounded 8 KiB head and the rest streams on (compressed for a gzip caller); the tallies skip an answer known to be the words (no whole-body read), and read a refusal as before (a 200 `{ok:false}` is still tallied). Red first: `r8-words-cache.test.mjs` (6 of 8 red, two controls green), then green; through the real plane `r8-words-door.test.mjs` red (bootstrap states no language/stamp) until instance-setup and translations merged, then green. `t51-interfacewords.test.mjs` re-pointed to the new key (R116 amended).
- **R128** (`phase-clock.mjs`): the clock carries entries a module states, in the object's `server-timing` header (token-checked, first of a name, never the door's own, METRIC_MAX 64) and by the hook `stateTiming(name, ms)` handed to the plane's door context (gated and public) and to instance-setup's `io` (K4822); the door adds `body;dur` and `bytes;dur` (summed over the object answers). The Queue's `result.derivation` is lifted by the door into `queue-count;desc=hit|miss` and `rows-queue;dur` (the Queue runs in the object and cannot hold the hook). Red first: `r8-phase-clock.test.mjs` (4 of 5, then the `stateTiming` test red with the argument removed), green.
- **R129 / G106**: `timings.door.cold {isolate_ms, object_ms}` (the object's age from the module-stated `object-age;dur`, plane R96; null until stated); `request_start` before the object is asked and `request_done` after for `acquire` and `captureupload`. Red first: `r8-door-phases.test.mjs` (3 red, absent), green. The no-tick control (first web capture of a never-seen host, fresh object): answered in 90 ms by the test's own clock, `do-acquire` less `in-acquire` 1 ms (reported). Cause stays unknown (R-FOUR); the L run does not reproduce it; the logging rides the redeploy.
- **Two defects of my own door found by the seam and fixed**: (1) the env handed to hooks was a new Proxy per request, so instance-setup's per-env fleet memo (G118) never hit (`r8-bootstrap-fanout` red: fleet asked twice; green after one stable clocked env with the request's clock in async context); (2) the Queue's derivation was never turned into marks.
- R122's `t51-bootstrap` test (K4826) now asserts work: a round is quiet only when the plane owes the page no answer (an inflight count), never a wall time.

**Door tests, red then green** (`wrap-entry.mjs` is the counting door; its worker source is `wrap-entry.worker.txt`, named the plane by path, so no architecture edge): `r8-hops` (groupidentity 4 -> 3; member bootstrap 4 by BOB's K4833), `r8-bootstrap-fanout` (fleet asked 2 -> 1; second answer 312 -> 12 ms), `r8-caseratify-calls` (59 calls, chain 59 -> 25, heads/puts in flight 1 -> 8), `r8-words-door`, `r8-door-phases`, `r8-wrap-entry` (control of the helper). Seam `t51-round8-seam.test.mjs` (sections in `r8-seam-capture.mjs`, `r8-seam-misc.mjs`, kit `r8-kit.mjs`): A, A1b, A2 (red: held-elsewhere row polled for ever until acquisition R111 and screens-intake read `fetch_pending.failed`), G108, G109 (red: empty fill and fallback title), F (red: `TIE_ATTESTATION_MISSING` on a prepared edition), C (red: 18,100 rows, 2 undetermined), Q cases 1-3 and the mark case (red: no mark, then the count recomputed; green after the door lifts the marks and record-core's counter), Q controls green before and after. All green on the merged tree.

**Not built / deferred**: G104's "delivery held for 5 s" case (no clean way to hold a delivery; the made state is polled at 1 s granularity inside A). No requirement of mine is unmet. Plane's `r77` 21/22 MB child-cap tests and `release.test.mjs` R24 words test are red on the clean tranche tip as well (not mine; they run alone per the plan).

**Found in other modules (reported in J48, answered B67)**: screens-intake read top-level `failed` (fixed); ratification's material copy sequential (fixed); distinct large PDFs sharing a stream refused `CAPTURE_HELD_BY_ANOTHER_BUNDLE` (noted for the reading round).

**Proposed requirement wording (BOB writes it)**: R116's as-built parenthesis is superseded by R127 (key `release~language~stamp`, `vary: Accept-Encoding`, 304 on the key's validator; every answer that is the words is gzip-compressed for a gzip caller, whatever its `v`). R121: `timings.door` gains `cold`. R128: the entries come from the object's header and from `stateTiming(name, ms)`; `bytes;dur` is the form; the Queue's `derivation` is lifted by the door. R129: the lines are `request_start` and `request_done`. Uses: `wrap-entry`/kit need no edge.

**Generated artifacts made stale**: none.

## J49 · COMPLETE

control-plane T51, fix round 8 (B60, causes G114, G106; B61-B68 applied), merged through B68 (tranche/T51 15c1a7cd6c and later). COMPLETE. Details, with each door test's red-then-green, are in the record's section "Fix round 8".
Applied: R127 (words keyed `release~language~stamp`, `vary: Accept-Encoding`, no whole-body tally read), R128 (module-stated entries from the object's header and `stateTiming(name, ms)`, `body;dur`, `bytes;dur`, the Queue's derivation lifted to `queue-count`/`rows-queue`, METRIC_MAX 64), R129 (`timings.door.cold`, `request_start`/`request_done`), the no-tick control of G106 (first capture of a never-seen host: 90 ms by the test's clock). Two defects of my own door found by the seams and fixed (env identity broke instance-setup's memo; the Queue marks were never lifted). R122 test now asserts work.
Tests (counts): control-plane directory 524 of 524 pass. Seam t51-round8-seam (A, A1b, A2, G108, G109, F, C, Q) all green on the merged tree; r8-hops, r8-bootstrap-fanout, r8-caseratify-calls (chain 59 -> 25), r8-words-door, r8-door-phases, r8-words-cache, r8-phase-clock green. Plane's own directory: 3 reds also red on the clean tranche tip (R77 L 21/22 MB child-cap x2, release.test R24 words), not mine.
Checks: format 0, architecture 0, coverage 96/96 0, words 0, ownership 0 failures. impact.mjs: control-plane, plane. Generated artifacts made stale: none. No requirement unmet, nothing deferred but G104's "delivery held for 5 s" case (no clean way to hold a delivery). Requirement wording to write is in the record (R116 superseded by R127 etc.); new ids R127-R129 are named by tests.
Size (session_01QvJL1jsWs1q3cNX7FjmWow): test runs 24, module lines 4,830

## J50 · QUESTION

QUESTION (CONTROL-PLANE #55, fix round 9, job 38). I read the START, the requirements and the code, and carry on with the readings below; four small things are not mine to write, and I name the smallest of each now (R-NOTMET):

1. **plane (R135).** `op=reading` and `owedwork` must answer the job row's `state`, counters, `failed_why`, cursor position, `last_progress_at`, `priority` and, for a refusal, `verdict`, for finished rows too. Plane's only route today is `owedwork`, whose rows (`view`, `plane/pending.mjs:589`) leave out `cursor`, `last_progress_at` and `verdict`, and `list` leaves out `state = 'finished'`. Smallest need: a store-internal route `jobrow?sha=&kind=` answering `holder.jobRow({sha, kind})` (every column, finished and refused included; the door applies the sight check). I build R135 on `owedwork` rows now (fields present are carried, `state: null` when no row) and switch to `jobrow` when it exists.
2. **plane (R131 (2)).** `plane/door.mjs:113` calls `deferReading(answer.document) === true` without `await`. The container gate must read the central directory from R2, so it is async; with the call awaited, `op=acquire` defers an over-bound ODS as the upload does. Smallest need: `deferred = (await deferReading(...)) === true`. Until then `acquire`'s `deferReading` stays synchronous (size and kind only).
3. **runtime-limits (R132).** The inline ceiling for every kind but a PDF (3 MiB: text, office, HTML, no stated type) has no `READ_BOUNDS` row. Proposed row, kind `text`, name `request_bytes`: standard 3 MiB, alpha 3 MiB, protective 3 MiB, key `limit.text.request_bytes`. I keep the figure as a constant marked "proposed; BOB records" until it exists (ruling K4842 (1)).
4. **modules.json (R131 (2)).** The ODF part predicate: `odf-reader` is not in control-plane's `uses`, so I use one local predicate for the declared unpacked text of any container (parts named `*.xml`, `*.rels`, `*.txt`, `*.html`, `*.xhtml`, `*.csv`, `*.json`, `*.css`, `*.svg`: a superset of ODF's `content.xml`, `styles.xml`, `meta.xml`, never less). If you want odf-reader's own `isOdfTextPart`, add the edge and say so.

Readings I carry on with (correct any): the inline ceiling for a container's unpacked text is the same 3 MiB as a stored text's; a document over its kind's whole-read ceiling (`pdf.bytes`, `csv.bytes`, `text.bytes`, else `pdf.bytes`) is stated at once by the reader and never deferred or registered; a document between the inline and the whole-read ceiling is deferred and gets a `reading` row before the answer.

## J51 · BLOCKED

BLOCKED (cause: context). CONTROL-PLANE #55 passed half its window after reading (START, requirements, index.mjs) and orienting. RESUME NOTES for the next session (state is pushed on job/T51/control-plane):

DONE (src): `reading-gate.mjs` (R131/R132 gate, quotes READ_BOUNDS incl. `text.request_bytes`, ODF predicate), `jobs.mjs` (R130 checked registrar, fresh-stub retry, `pendsha_failed`), `job-state.mjs` (R135), `index.mjs` (readUploaded/followEntries/promoteFiled/deliverOwedRender P25/op=reading+owedwork job state/declared+parted part routing/async deferReading/stateTiming desc), `archive.mjs` (transient flag), `owner-ops.mjs` (declared, ledger, 4 parted arms), `phase-clock.mjs` (isolate age, desc, bytes-<route>), `words-cache.mjs` (null language). Tests done: r72-parted, r128-timing-desc-bytes, r129-isolate-age, r9-words-no-language, r117-held and t51-visitor-copy brought to R130/R117, r8-phase-clock/owner-ops/r100 key sets.
IN FLIGHT (workers, files uncommitted/partial when this was written; check `git status`): seam modules `r9-seam-reading.mjs` (§1,2,3,9), `r9-seam-documents.mjs` (§4-8), `r9-seam-limits.mjs` (§14,15) and unit tests r130-jobs, r131-gate, r133-r134-follow, r135-job-state; throwaway `r9-tmp-*.test.mjs` must be deleted. Their reports go to the session that spawned them; if lost, re-read the files.
TODO: (1) create `t51-round9-seam.test.mjs` importing the three section modules like t51-round8-seam.test.mjs; (2) section 19 per B72: find the cause of round-8 seam A1/A1 control/A1b red (count, not 120 s) or name the provider; (3) run module tests (long: run files alone), fix reds; (4) tests for R100/R120/R123/R124 (P25 through the real owedFetch)/R125 amendments, named ids R130-R135 each; (5) P24 logging (op shape in Server-Timing) not started; bytes-<route> done; (6) captureobjectop needs `ledger` handed (`ops.mjs:277` reads `h.ledger`); (7) store-door `STREAMED_BODY_OPS` must gain `captureuploadpart` (store-door's file: REPORT to BOB); (8) impact.mjs, then checks format/architecture/coverage/words/ownership; new files to list for BOB's paths: none outside paths except none; (9) COMPLETE with red/green lines, Size line, words rows owed (`control-plane.reading.not_registered`), proposed wording for R127 (null language), R128 (desc, bytes-<route>), R129 (lazy isolate age), R72 (parted arms, declared).

## Fix round 9 · CONTROL-PLANE #55 · RESUME NOTES (partial; BLOCKED, cause context; B73)

**Source done** (all pushed on job/T51/control-plane): `reading-gate.mjs` (R131/R132 gate; quotes READ_BOUNDS, `text.request_bytes`; ODF predicate from odf-reader, local superset otherwise), `jobs.mjs` (R130 checked registrar, fresh-stub retry, `pendsha_failed`), `job-state.mjs` (R135, from plane's `owedwork` rows; switch to plane's `jobrow` when it merges), `index.mjs` (readUploaded/followEntries/promoteFiled `unpack_pending`/deliverOwedRender P25/op=reading `job`/owedwork sight filter/`declared`+`captureuploadpart` routing/async deferReading/stateTiming desc), `archive.mjs` (`transient`), `owner-ops.mjs` (declared, ledger, four parted arms), `phase-clock.mjs` (lazy isolate age, desc, `bytes-<route>`), `words-cache.mjs` (null language).
**Tests done and green**: r72-parted 8, r128-timing-desc-bytes 6, r129-isolate-age 3, r9-words-no-language 5, r131-gate 13, r130-jobs 8, r133-r134-follow 10, r135-job-state 11/12 (1 red by name: plane view). Existing tests brought to the new behaviour: r117-held, t51-visitor-copy, r8-phase-clock, owner-ops, r100-upload (key sets with `ledger`).
**Seam** (`t51-round9-seam.test.mjs` imports three section modules; NOT yet run as one file): `r9-seam-reading.mjs` §1,2,3,9 = 15 tests, 14 green, 1 red (killPage: extraction/plane `skipKilled`); `r9-seam-limits.mjs` §14,15 = 19 tests, 14 green, red: §14a stated PDF still has a capture `reading` row, §14g acquisition's refusal lacks the declared total, §15 2.2 MB CSV read inline (needs BOB's ruling: csv `request_bytes` row or smaller test), all-modules grep (14 unquoted ceilings listed in the worker report: office-xml TAG_MAX, provenance PART_VERIFY_READ_MAX, acquisition ODF_DIGEST_MAX/LARGE_FETCH_BYTES, extraction CAPTURE_TEXT_CAPTURE_BOUND, calculations INGEST_ROWS_MAX/TABLE_MAX_BYTES, workbooks x2, case-carriage/case-authoring COPY_NOW_MAX_BYTES, case-import CALC_INPUT_MAX, monitoring DOCKET_READ_MAX_BYTES, following PORTAL_PARSE_MAX_BYTES); `r9-seam-documents.mjs` §4-8 = 18 tests, 10 green, 8 red: §6 A1/A12 (uploaded archive's members end `filed` with `bundle: null`: unpack-filed members are promoted only on `op=unpack`/`acquire` answers, not for an uploaded archive: CONTROL-PLANE DOOR GAP, mine to fix: promote them when the plane's `unpack` job runs `op=unpack`, with the project), A11 transient entry never re-offered (acquisition offers only `waiting`), continuation member not in the project (`jobs.mjs` `ask()` sends no `project`; plane `pendingadd` must take `project` into `detail.project`; capture's upload registration has none), §8 SCAN C1/C4 completeness (extraction-2 41), J-10 hit `row` null (G128h), §5 same-file-two-members flaky (queueing, scheduler-2 62), §7 AES reason is lowercase prose not `PASSWORD_REQUIRED`.
**Open items for the next session**: (1) run the one seam file alone; (2) §6 door gap above (promote an uploaded archive's members; pass the archive project to the unpack job); (3) section 19 per B72: cause of round-8 seam A1/A1 control/A1b red (count, not 120 s); (4) tests for R100/R120/R123/R124 (P25 through the real `owedFetch`)/R125 amendments; (5) P24 op-shape Server-Timing not started; (6) hand `ledger` to `captureObjectOp` (`ops.mjs:277`); (7) run the whole module (files alone), fix reds; (8) impact.mjs, then format/architecture/coverage/words/ownership; (9) COMPLETE with red/green lines and Size.
**Words owed to later-ux.md**: `control-plane.reading.not_registered`. **Proposed wording** for BOB: R127 (null language is the empty key part), R128 (`stateTiming` desc; `bytes-<route>`), R129 (isolate age from the first request), R72 (`declared`; four parted arms; ledger).
**Reports to BOB**: store-door job 69 (placed); plane `jobrow` and `pendingadd` project (B70 1, here); capture stated-file row; acquisition declared total; csv request ceiling ruling; unquoted ceilings above; a 3 MiB single-part PDF upload does one whole CAPTURES.get inside captureupload.

## J52 · BLOCKED

BLOCKED (cause: context). Workers are all finished and everything is pushed. My record's last section, 'Fix round 9 · CONTROL-PLANE #55 · RESUME NOTES', says what each file holds, which are partial, and the open items. Needs from BOB are listed there (plane jobrow/pendingadd project, capture stated-file row, acquisition declared total, csv request ceiling ruling, 14 unquoted ceilings).
