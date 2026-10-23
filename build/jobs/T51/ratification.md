# ratification (T51)

**Status** · session_017fBDjJ7yCsJ4GrHnDn78Xw · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Findings in other modules, found while running the words check and the process checks on the merged tree (not changed by this job; described against the words rule K3930, K3949):

1. `bio-plane/src/case-authoring/index.mjs:1653` (inline, plain): "ratification's pre-flight gave no answer". A member-facing sentence held in case-authoring's own source, outside the words rule. Owner: case-authoring.
2. `bio-plane/src/deliverer.mjs:42` (inline, under publication's paths): "who DELIVERED this ratification was not recorded: it was ratified b...". Owner: publication (the file sits in the publication family's source).
3. `checks/run.mjs` over the whole product reports 2235 words failures across other modules (inline 1564, plain 465, testcopy 509, handlist 161, missingkey 1). None is in the ratification module after this job's changes. I did not work any of them.
4. Not converted, for BOB's ruling (K3944): API and wire text in this module that names parameters for a developer caller, not for a member. Examples: `ops.mjs` MALFORMED details ("caseratify requires caseId, edition (integer), ..."; "ratify requires bundleId, expectedSha, and sig ..."; "publishat requires ..."), `index.mjs` `registerApprovalReader` / `registerHoldReader` MALFORMED details ("registerApprovalReader takes {rule(), approvals(...)}"). The checker does not count them, so they are not findings. Left as they are until BOB rules whether they are developer text (a BUILTIN_ERRORS-style exemption) or member text.

## J2 · COMPLETE

Entries applied: T51-236 (the words pass, K3949, K3957, K3962), every finding in build/plan/words-pass/ratification.md.
- Inline and plain sentences, now read through word(key) or localize(id, en, vars):
  - finding.mjs: word ratification.basis.reused_part_re, ratification.basis.network_error, ratification.basis.plain_get_returned_different (rows that already existed); localize ratification.finding.the_record_has_changed.
  - index.mjs: localize ratification.index.the_case_document_has_changed_since, ratification.index.a_reader_of_the_teams_approvals, ratification.index.a_reader_of_litigation_holds, ratification.index.no_active_registered_signing_keys.
  - ops.mjs: localize ratification.ops.the_case_document_has_changed, ratification.ops.no_active_registered_signing_keys (both sites, one id, one sentence), ratification.ops.so_its_container_is_assembled (the fragment that completes ratification.ops.the_case_is_committed_and).
  - refusals.mjs: approvalMissingRefusal's sentence is now three localize calls (ratification.refusals.the_team_requires_approvers_to, ratification.refusals.and_members_have_not_approved, ratification.refusals.the_approvals_given_are_not); the wording is unchanged, with each fragment's own id.
  - release.mjs: ratification.release.a_bulk_release_records_what, ratification.release.this_selection_resolves_to_release; retire.mjs: ratification.retire.this_selection_resolves_to_retire.
- Test copies, now word or localize, never the text:
  - approvals.test.mjs: word refusal.APPROVAL_MISSING.
  - checks.test.mjs: word refusal.CONTESTED_IN_BATCH, refusal.ANONYMOUS_TESTIMONY_UNCORROBORATED, refusal.ATTRIBUTION_UNCHOSEN (the R14 translations stay asserted, word for word, by key).
  - preflight.test.mjs: the two copied constants are gone; their uses are word refusal.ATTRIBUTION_UNCHOSEN and refusal.ANONYMOUS_TESTIMONY_UNCORROBORATED.
  - converted-c.test.mjs: fixture lines use word case-authoring.body.manifest_force_case and case-authoring.body.case_production_standard; the dangling-reference assertion compares with localize record-grammar.bundle.references_i_target_t_does_2 (the testcopy the whole-tree check reported).
  - scheduled-commit.test.mjs: the fixture reason is word document.refused.changed (a fixture value; the old literal was a fragment of another module's sentence).
Deferred: none. No flaw in this module outside the findings.
Reports to BOB: see the REPORT entry of this job (case-authoring:1653; publication/deliverer.mjs:42; the whole-product words count; the API-text ruling in item 4).

Tests and checks (all run on the merged tree, job/T51/ratification after its merge with tranche/T51 at ef6a1fee9a):
- node --test bio-plane/test/m/ratification/: tests 246, pass 246, fail 0.
- node checks/words.mjs /home/user/bio ratification: 0 failures (inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0).
- node checks/run.mjs /home/user/bio: format 0 failures; architecture 0 failures; the words arm reports other modules only (no ratification line after the fix in converted-c).
- node bio-plane/src/setup-words/build.mjs --check: rows.mjs is stale, as expected (the new localize ids are not yet in it; BOB regenerates at the layer close). No refusal names this module.
- node checks/ownership.mjs /home/user/bio ratification tranche/T51 job/T51/ratification: 12 files changed by ratification, 0 failures.

Size (session_01BEW2JCeWXjiogDsVNixAnp): test runs 3, module lines 3677

## J3 · COMPLETE

CHANGE B2 applied: converted-c.test.mjs's Trigger line now reads case-authoring's localize call (case-authoring.document.trigger_op_publish_case) by equality, with the fixture's case and edition. Commit 5f7df2a65a, pushed; tranche/T51 merged first (da80e5c1dd).

Checks on the merged tree after the change:
- node --test bio-plane/test/m/ratification/: tests 246, pass 246, fail 0.
- node checks/words.mjs /home/user/bio ratification: 0 failures.
- node checks/run.mjs /home/user/bio: format 0 failures; architecture 0 failures; no ratification line in the words arm.
- node bio-plane/src/setup-words/build.mjs --check: rows.mjs stale (expected); no refusal names this module.
- node checks/ownership.mjs /home/user/bio ratification tranche/T51 job/T51/ratification: 0 failures.

Size (session_01BEW2JCeWXjiogDsVNixAnp): test runs 4, module lines 3677

## J4 · REPORT

Decisions made in this job, for BOB to record in build/rulings.md (this job does not write that file):

1. `publish` is NOT declared in `DECLARED_OPS` (B3 entry 1 named it). Reason: the door's `publish` is case-authoring's state act. The control plane aliases door `publish` to `publishcase` (`control-plane/index.mjs`:1069), and case-authoring's `DECLARED_OPS` already holds `publish` with its own row. This module's `publish` arm (R5) is the store's internal committer that the Worker calls; no screen sends it. Declaring it here would give `publish` two owners, which `declaredOpsOf` reports as a duplicate and R81 refuses. Only `caseratify` is declared (R54). If BOB wants `publish` declared by this module, the door-to-internal mapping must change first, which is case-authoring's and control-plane's to decide.

2. B5 (provenance resolver) is done differently from the wording. The resolver is passed in the store half, `ratifyGate` (`ratification/index.mjs`), which is the only place in this module with a provenance instance. The Worker half (`ops.mjs`:511) has no provenance and cannot call `containerResolver()`, so I removed the Worker's own `withRegisterChecks` pass and the store's wrapper at the publish call site. The arm order is unchanged (catalogue, register, then bias and case-member in the Worker). Requirement R55 states it; the test is `provenance-gate.test.mjs`.

Other modules (found by `checks/run.mjs`, not worked by this job, described against their requirements):

- Coverage, live ids named by no test: `agent-harness` R17; `agent-runner` R37, R38, R40; `installer-steps` R26, R31; `journey-check` R19; `link-sweep` R13, R14, R15.
- Words, inline: `bio-plane/src/strength/method.mjs`:349 (a member-facing sentence, "11. Legs that cut against the finding. ...").
- Words, testcopy (15): `bio-plane/test/m/op-grades/owners.test.mjs`:84 and `t36.test.mjs`:47, 49, 52, 55, 59; `t41.test.mjs`:24; `t46.test.mjs`:33, 195; `t47.test.mjs`:36, 63, 83; `t48.test.mjs`:31, 34; `t49.test.mjs`:27 (test copies of op-grades' sentences).

Ownership: the one failure is `build/requirements/ratification.md`, outside the module's paths, which B4 accepts at merge.

## J5 · COMPLETE

Entries applied (commit 31ac3cb2b8, pushed to job/T51/ratification):

- K4206 (B3 entry 1): `DECLARED_OPS.caseratify` declared: classes admin, member, probe; mutating; weight `attested`; description `act.caseratify.does`; accepts caseId, edition, expectedSha, sig, members; requires caseId, edition, expectedSha, sig. `publish` is not declared (REPORT J4, decision 1). New requirement R54 written in `build/requirements/ratification.md` (B4), and R53 amended to name caseratify as R54's. Refusals are already named: the Worker half's MALFORMED detail names each field, so no refusal changed.
- K4219 (B5): the ratify gate reads the provenance resolver. Done in the store half `ratifyGate` with `this.provenance.containerResolver()`; the Worker's duplicate register pass and the store's wrapper are removed (REPORT J4, decision 2). New requirement R55 written. Test `provenance-gate.test.mjs`: control (no decision: C-18.9 refused), and a standing `determined` decision: no C-18.9.

Deferred: none in this module.

Tests and checks (run on job/T51/ratification after the commit):
- `node --test bio-plane/test/m/ratification/`: tests 251, pass 251, fail 0 (246 before, plus 5 new).
- Red first: with `bio-plane/src/ratification` stashed, `declared-ops.test.mjs` (R54) and `provenance-gate.test.mjs` (R55 control) fail. The R55 decision test passes on the original code, which is only trivial: the original store half ran no register arm. The bug was in the Worker call, which the unit tests do not reach. Stated plainly so it is not read as a control of the fix.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio ratification`: 0 failures.
- `node checks/coverage.mjs /home/user/bio ratification`: 54 of 54 live ids named by a test, 0 failures.
- `node checks/run.mjs /home/user/bio`: architecture 0 failures; the ratification module has no line in the coverage or words arms. Failures in other modules are in REPORT J4.
- `node checks/ownership.mjs /home/user/bio ratification tranche/T51 job/T51/ratification`: 7 files, 1 failure, `build/requirements/ratification.md` (accepted at merge, B4).

Size (session_017fBDjJ7yCsJ4GrHnDn78Xw): test runs 5, module lines 3691
