# ratification (T51)

**Status** · session_01BEW2JCeWXjiogDsVNixAnp · depth 2 · WORKING · handled B0

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
