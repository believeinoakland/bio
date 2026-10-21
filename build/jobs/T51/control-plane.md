# control-plane (T51)

**Status** · session_01JarNVWj3jh7A31SRkU57RG · depth 2 · COMPLETE · handled B19

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
