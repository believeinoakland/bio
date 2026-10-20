# control-plane (T51)

**Status** · session_01EoJxYttG3uMHhXBMdMwTif · depth 2 · COMPLETE · handled B11

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
