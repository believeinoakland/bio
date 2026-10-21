# ratification (T51)

**Status** · session_014wrhn7FbzULdWGZY1H4QvG · depth 2 · WAITING ON BOB (J7) · handled B2

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

## J6 · QUESTION

QUESTION · P10 (d) step 0, the measurement (B6 (1)); the fix waits for BOB's release.

Probe: real `contradiction` (migrated tables) and real `ratification.examineMember` on retrieval's fixture world (node:sqlite, the fixture's workerd-shaped cursor), 27 collected Information documents, `contradiction_candidates` seeded with N rows none naming those documents (each with `a_bundle_id`, `b_bundle_id`, `a_side`, `b_side` JSON as `#append` writes them), 20 timed passes over all 27 documents, median. The probe script is not committed (a scratch file); its method is this paragraph.

| table rows | one `candidatesFor` (one state) | the 3 calls per document | `examineMember` per document, as is | `examineMember` per document, reads stubbed |
| --- | --- | --- | --- | --- |
| 2,000 | 1.35 ms | 4.1 ms | 4.7 ms (128 ms for 27) | 0.08 ms (2.1 ms for 27) |
| 20,000 | 12.8 ms | 38.5 ms | 40.3 ms (1,089 ms for 27) | 0.29 ms (7.9 ms for 27) |

Findings:
1. The three `candidatesFor` calls are 98% (2,000 rows) and 96% (20,000 rows) of `examineMember`. The rest of the examination (one bundles row, bundle.md and provenance reads, the front-matter parse) is 0.08-0.29 ms a document.
2. Each call is a full scan: the plan is `SCAN contradiction_candidates` plus `USE TEMP B-TREE FOR ORDER BY` (the four-column `OR` of `#candidatesNaming`'s bundle arm, `contradiction/index.mjs`:1515, has no index to use, and `json_extract` cannot use one). The cost is linear in the table: about 0.64 ms per 1,000 rows per document for the three calls. The state filter runs after the scan (`candidatesFor`:1632), so the three calls scan the same rows three times.
3. Share of the 60-85 ms a Held row: the three calls reach 60-85 ms a document at about 28,000-40,000 rows (3 x 0.64 ms per 1,000 rows, linear), where the single read this fix proposes would be a third of that. I could not read the smoke copy's row count (no read-only probe of it is open to this session), so I cannot say whether the copy holds that many; the measurement says the reads are the only part of the examination that can reach 60-85 ms, and that they do so only at a table of about that size. With few candidates (a match is rare) a row costs the scan, not the loading of rows; a document that does match loads up to 2,001 candidate rows, which this probe did not time.
4. The scan is per document, so the Held list of 27 documents costs 27 x 3 scans; the whole list at 20,000 rows is 1.1 s synchronous in the object.

Proposed fix (needs release): one `candidatesFor({on:{bundle}, limit: 50, viewer: PLANE_VIEWER})` per document with no state filter, then the contested states filtered by `candidate.state` in ratification, the same refusals as before (an unread, failed, `undetermined` or `truncated` read counts as contested). That removes two scans of three (a third of today's cost, the reads at 20,000 rows 13 ms a document). It does not remove the scan itself: the remaining 13 ms a document at 20,000 rows is `#candidatesNaming`'s, and an index or a pre-computed list per bundle is `contradiction`'s to give (P9; ratification may not change it). Question for BOB: release the three-to-one fix here, and decide whether `contradiction` gets a job to index the bundle arm (e.g. a `contradiction_candidates` read by `a_bundle_id` and `b_bundle_id` indexes, with the `a_side`/`b_side` inquiry arms stored as columns), which is the only change that takes the cost off the table's size.

Failing-first test planned (after release): count `candidatesFor` calls per examined document (three before, one after) with the test's `contradiction` double, control a standing `explained_not_shown` candidate still `CONTESTED_IN_BATCH`; and a timing test over the real `contradiction` at a seeded table.

## J7 · QUESTION

QUESTION (replaces J6, which misstated the per-row rate) · P10 (d) step 0, the measurement (B6 (1)); the fix waits for BOB's release.

Probe: real `contradiction` (migrated tables) and real `ratification.examineMember` on retrieval's fixture world (node:sqlite, the fixture's workerd-shaped cursor), 27 collected Information documents, `contradiction_candidates` seeded with N rows none naming those documents (each with `a_bundle_id`, `b_bundle_id`, `a_side`, `b_side` JSON as `#append` writes them), 20 timed passes over all 27 documents, median. The probe script is not committed (a scratch file); its method is this paragraph.

| table rows | one `candidatesFor` (one state) | the 3 calls per document | `examineMember` per document, as is | `examineMember` per document, reads stubbed |
| --- | --- | --- | --- | --- |
| 2,000 | 1.35 ms | 4.1 ms | 4.7 ms (128 ms for 27) | 0.08 ms (2.1 ms for 27) |
| 20,000 | 12.8 ms | 38.5 ms | 40.3 ms (1,089 ms for 27) | 0.29 ms (7.9 ms for 27) |

Findings:
1. The three `candidatesFor` calls are 98% (2,000 rows) and 96% (20,000 rows) of `examineMember`. The rest of the examination (one bundles row, bundle.md and provenance reads, the front-matter parse) is 0.08-0.29 ms a document.
2. Each call is a full scan: the plan is `SCAN contradiction_candidates` plus `USE TEMP B-TREE FOR ORDER BY` (the four-column `OR` of `#candidatesNaming`'s bundle arm, `contradiction/index.mjs`:1515, has no index to use, and `json_extract` cannot use one). The cost is linear in the table: about 0.64 ms per 1,000 rows for one call, 1.93 ms for the three, per document. The state filter runs after the scan (`candidatesFor`:1632), so the three calls scan the same rows three times.
3. Share of the 60-85 ms a Held row: the three calls reach 60-85 ms a document at about 31,000-44,000 rows (1.93 ms per 1,000 rows, linear), where the single read this fix proposes would be a third of that. I could not read the smoke copy's row count (no read-only probe of it is open to this session), so I cannot say whether the copy holds that many; the measurement says the reads are the only part of the examination that can reach 60-85 ms, and that they do so only at a table of about that size. With few candidates (a match is rare) a row costs the scan, not the loading of rows; a document that does match loads up to 2,001 candidate rows, which this probe did not time.
4. The scan is per document, so the Held list of 27 documents costs 27 x 3 scans; the whole list at 20,000 rows is 1.1 s synchronous in the object.

Proposed fix (needs release): one `candidatesFor({on:{bundle}, limit: 50, viewer: PLANE_VIEWER})` per document with no state filter, then the contested states filtered by `candidate.state` in ratification, the same refusals as before (an unread, failed, `undetermined` or `truncated` read counts as contested). That removes two scans of three (a third of today's cost, the reads at 20,000 rows 13 ms a document). It does not remove the scan itself: the remaining 13 ms a document at 20,000 rows is `#candidatesNaming`'s, and an index or a pre-computed list per bundle is `contradiction`'s to give (P9; ratification may not change it). Question for BOB: release the three-to-one fix here, and decide whether `contradiction` gets a job to index the bundle arm (e.g. a `contradiction_candidates` read by `a_bundle_id` and `b_bundle_id` indexes, with the `a_side`/`b_side` inquiry arms stored as columns), which is the only change that takes the cost off the table's size.

Failing-first test planned (after release): count `candidatesFor` calls per examined document (three before, one after) with the test's `contradiction` double, control a standing `explained_not_shown` candidate still `CONTESTED_IN_BATCH`; and a timing test over the real `contradiction` at a seeded table.
