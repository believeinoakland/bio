# ratification (T51)

**Status** · session_01BjXA2f1GgToabWomrTvi6L · depth 2 · WAITING ON BOB (J23) · handled B20

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

## J8 · REPORT

G54 step 0 (RATIFICATION #31), on the unchanged tree. Details: build/plan/diagnosis-R6-g54-cause.md section 7; test/m/ratification/g54-l.test.mjs (workerd, Miniflare, real Durable Object and R2).

CANDIDATES, red today (the Worker half's post-commit block run as op=caseratify runs it, one fault at a time):
- (b) a bucket put that throws: RED. The block throws out of caseRatifyOp after the commit; the edition is complete, manifest_sha null, nothing recorded.
- (b') only the manifest's own put throws: RED, and worse: manifest_sha is SET (recorded) but its bytes are never stored, so nothing would ever owe it. The plan's "owed" rule must (and does) cover a set manifest_sha with casefile_state not built.
- (c) recordcasemanifest not answered: RED. The statement STORE_DID_NOT_ANSWER is returned inside the act's container, seen once; edition complete, manifest_sha null, nothing recorded.
- (a) the caller cancels after the commit: NOT reproduced under Miniflare (the request ran to its end after the caller aborted). Neither shown nor ruled out; the sweep covers it (a building left by a cancelled request counts as an attempt).

PROBE of the evidence store for 4783 (read-only, account 20b53357... only, existence and size by hash): the document ae95e37e... is in bio/captures (46,222 B) and in bio/published (46,222 B): copyMaterials ran for it. Its extracted text d299837e... is in neither bucket, BUT an extracted text is never an evidence-store object: it is held inline in the Durable Object (published_material_texts, held: "inline") and the case file builder reads it from the facts; only the assembly writes it to the bucket (the three healthy editions' texts are also absent from bio/captures and present in bio/published). So no material is missing: 4783 is repairable (built), not stopped, and the plan's sentence that the sweep re-copies the text from the evidence store is wrong (nothing to re-copy). The diagnosis's "second silent partial" is corrected: copyMaterials completed; the block failed or was cut short at or after casefilefacts, before the file puts. Decision for BOB: none; the design stands, and the stopped rule has nothing to apply to 4783. I go on with the fix on that reading.

Note for the plan (not mine to change): the earlier "4783 shows a second silent partial" reading in G54 (1) and (b) "R-OLD / the repair" should read as above; and the plane job's L ("the sweep's tick rebuilds both") will find 4783 built.

## J9 · COMPLETE

COMPLETE · RATIFICATION #31 · G54 (3)(a) "ratification" and (b), fix round 6 · branch job/T51/ratification at its last push, tranche/T51 merged at 2c6e5c8509 (merged again after B8's answer arrived; nothing of yours changed since).

ENTRIES APPLIED
Step 0 (J8, adopted by B8/K4704): three of the four candidates red on workerd, (a) not reproduced; 4783 repairable (its extracted text is inline in the object, written to the bucket only by the assembly). Details: build/plan/diagnosis-R6-g54-cause.md section 7 (7.1 candidates, 7.2 the probe with its commands and date, 7.3 the L measure). That file is outside my paths and is written because the START says to (the ownership check lists it as its one failure; accepted by the START).

WHAT CHANGED
- finding.mjs:331 `owesCaseFile` (complete, and manifest null OR publication's casefile_state set and not built: covers the (b') shape you confirmed); :336 casesToAssemble and :437 editionsToAssemble use it; :346 `failedCopy`; :351 `priorOf` ({materials_missing, copy_error}); :358 `assembleEdition` (the assembly, never a throw: a throw is recorded through public-read's recordCaseFileFailure at step build and stated ASSEMBLY_FAILED with the recorder's code); :369 `recordedFailure`; findingAnswer carries a failed copy as published.reason COPY_FAILED.
- ops.mjs op=caseratify (:244-262): a sitting member's copyFinding that throws is stated (published.reason COPY_FAILED) and, with copyMaterials' `missing`, goes to every assembly as `prior`; op=ratify (:430-447): a copyFinding that throws is a 200 with published.r2 COPY_FAILED, the edition's failure recorded at step copy through recordCaseFileFailure, its assembly not reached; the assembly that throws is recorded and stated. The answers' `container` is as today. :306 copyMaterials unchanged in shape; :314 `copyMaterialsDetailed` also names the materials the evidence store ANSWERED absent (the sweep's stopped rule reads it; a copy that failed never stops an edition).
- index.mjs publishScheduled (:1026-1073): every completed edition is assembled with `prior`, and `after.containers` keeps one {case, edition, built, code?} for each (`after.container` stays the last); a copy that throws is handed on; with no bucket reach `after.containers` still names each edition (built false, code NOT_ATTEMPTED) beside after.not_done. :844/:852 FLAW IN MY MODULE FOUND AND FIXED (P8): the retry path (#completedCase) read the edition's state with NO group, so a re-sent op=caseratify would have built a manifest of group null; `#editionState` reads it as the commit does (the first member's bytes at its pin) and both the retry and the sweep use it.
- casefile.mjs (new) + index.mjs :867 `caseFileSweep(now)`, :876 `caseFileWake(now)`: per tick publication.caseFilesOwed({now, limit: 2}) oldest first, one edition at a time: state with its group, an edition estimated over 4,000 files is failed TOO_LARGE (recorded, not attempted), the materials copied FIRST (copyMaterialsDetailed), stopped (state stopped, code MATERIAL_MISSING, one final error line) only when the evidence store ANSWERED the material absent AND the ledger counted CASEFILE_MISSING_MAX_ATTEMPTS tries of MATERIAL_MISSING, else the assembly runs with `prior` (so no manifest over a missing material: public-read's); after an edition the tick stops when it has pulled 400 files or 16 MB. Never throws. Wake: now while one is due, else caseFileNextAt(), else null (also null when the object has no reach to the bucket, so a consumer never spins). Named, exported constants: CASEFILE_SWEEP_EDITIONS 2, CASEFILE_SWEEP_FILES 400, CASEFILE_SWEEP_BYTES 16 MiB, CASEFILE_TOO_LARGE_FILES 4000, CASEFILE_MISSING_MAX_ATTEMPTS 6 (pinned by a test).
- Census (K4208): no op changes its accepted keys; DECLARED_OPS unchanged (release, retire, caseratify); nothing new is an op. Words: none (codes only; the words check shows 0 failures for the module).

FAILING-FIRST, seen red on the unchanged source (the module's src stashed), green on the fix: test/m/ratification/g54-paths.test.mjs, 13 tests, each with its control: caseratify copy that throws -> prior.copy_error (control: none); materials missing -> prior.materials_missing (control: all copied); assembly that throws on caseratify -> ASSEMBLY_FAILED recorded at step build, a recorder that throws changes nothing (control: answering assembly records nothing); op=ratify copy that throws -> 200, COPY_FAILED, recorded at step copy, assembly not reached (control: one assembly); scheduled publisher with two editions keeps both (control: one edition, one entry) and a throwing assembly / copy; retry reads the group and owes a manifest whose state is failed (control: built is not owed); sweep: two a tick, third waits, 0 calls at the third tick; failure retried only when due (wake = the ledger's earliest); materials copied first, MATERIAL_MISSING, built once present; stopped only for ANSWERED absence at the bound (controls: one try short, a copy that failed, another code); files and bytes bounds, TOO_LARGE; wake/never-throw. All 16 tests of the file were red on the old source.
L (workerd, real Durable Object and R2; test/m/ratification/g54-l.test.mjs, entry g54-entry.mjs, built from the modules ratification uses: the plane is a later module): the control builds; for each of the three faults the block now states the failure and never throws, and the edition stays complete (green); cancel: not reproduced under Miniflare (the block ran to its end, documented); measure: 120 documents of 330 KiB (40.7 MB): 248 files, 1 part, 241 get + 249 head + 3 put (about 2 R2 subrequests per file), 40,658,975 bytes read; 4,000 files would be about 8,000 of the 10,000 subrequests; the held bytes are the case file's own (about 41 MB, peak near 50 MB); a memory kill cannot be shown on a local workerd.

SEAMS STILL RED BY NAME (providers unmerged): publication (PUBLICATION #37): "G54 SEAM (publication ...)" (caseFilesOwed, caseFileNextAt, recordCaseFileAttempt), the L SEAM ledger tests (state failed, step and code) and the L sweep tests; public-read (PUBLIC-READ #31): "G54 SEAM (public-read ...)" (recordCaseFileFailure). The test "G54 SEAM (publication, public-read): the real ledger and the real assembly" is red only at `caseFilesOwed is not a function`; with a scratch stand-in for that one read it passes through the REAL current assembly (checked, scratch deleted), so it is sound for the day they land.

SUITES: ratification dir: tests 281, pass 273, fail 8 (exactly the 8 SEAM tests above; every other test green, 246 earlier ones included). Users run (those importing ratification's files): mk6, case-authoring evidence-rows, review edition, action-holds readers, affordances t34 and catalogue, plane t41, t45, accepted, op-declarations t34: 125 tests, 0 fail. impact.mjs names only ratification. Checks: format 0; architecture 0 (4339 files); coverage 0 (6686 of 6686); channels 0; words: 0 for ratification, the run shows only the inherited inline 1 at case-checker/spec.mjs:11; ownership: 9 files changed, 1 failure = the START-directed diagnosis file.

CONTRACTS I CODED AGAINST (providers' to confirm at their merge; where they differ I change one line): (1) publication.caseFilesOwed({now: ms, limit}) -> array (or {editions}) of {case_id|caseId, edition, attempts, why (object or JSON)}, oldest first, never stopped or built; caseFileNextAt() -> ms or null; recordCaseFileAttempt({caseId, edition, state, why, at: ms}); I call it with state failed (TOO_LARGE, UNKNOWN) and stopped (MATERIAL_MISSING). The plan puts "stopped after N" in the writer too: the sweep is where "confirmed absent" is known, so I decide and pass state stopped; if publication's writer also counts, ONE owner should export CASEFILE_MISSING_MAX_ATTEMPTS (mine is 6). (2) public-read.assembleCaseContainer({..., prior}) with prior = {materials_missing: [sha], copy_error: string|null}; recordCaseFileFailure({stub, cs, via, step: "copy"|"build", error}) -> {ok, code}. (3) publish-schedule reads after.containers = [{case, edition, built, code?}]. (4) plane: the consumer calls ratificationOf(ctx).caseFileSweep(now) / caseFileWake(now) (ms); the object's ratificationWorker already supplies env, stub, storeName. (5) caseEditionState may carry casefile_state (owesCaseFile reads it).

PROPOSED REQUIREMENT LINES (yours to write; mine are outside my paths)
- R6 amended, after "...a copy failing midway leaves rows a re-ratification converges.": "A copy that throws after the commit is stated in the act's answer (op=ratify: published.reason COPY_FAILED; op=caseratify: the member's published) and never fails or undoes the act. Every path that completes an edition (op=ratify, op=caseratify, R42's publisher) hands the assembly what its own copy found (prior: the materials not copied and a copy that threw) and never lets a failure after the commit throw out of the act: an assembly that throws is recorded for the edition (public-read R6's recordCaseFileFailure, step build) and stated ASSEMBLY_FAILED; for op=ratify a copy that threw is recorded at step copy and the assembly is not reached. A case edition is owed its case file while it is complete and either has no manifest or publication's ledger says an attempt did not end built. An edition's state is read with its publishing group, as the commit reads it, wherever it is assembled."
- R42 amended, last sentence: "...R6's assembly of every edition the commit completed, each outcome kept: the publisher answers after.containers, one {case, edition, built, code?} for each (after.container stays the last)."
- R39 amended: add "(the sweep, R57, also tells a material the evidence store answered absent from one whose copy failed; the act's materials_copied is as above)".
- R57 NEW: "The case-file sweep. caseFileSweep(now) takes publication's owed case files (caseFilesOwed, its R15/R40 as amended), oldest first, at most CASEFILE_SWEEP_EDITIONS (2) a tick and one at a time, and for each copies the materials first (R39) and runs public-read's assembly (its R6) with what the copy found; an edition estimated over CASEFILE_TOO_LARGE_FILES (4,000) files is failed TOO_LARGE, recorded and not attempted; an edition is stopped (state stopped, code MATERIAL_MISSING, one error line) only for a material the evidence store answers absent, after CASEFILE_MISSING_MAX_ATTEMPTS (6) tries the ledger counted; the tick takes no further edition once it has pulled CASEFILE_SWEEP_FILES (400) files or CASEFILE_SWEEP_BYTES (16 MiB); idempotent (stored files are skipped, a manifest of the same hash is recorded once); never throws. caseFileWake(now) is now while an edition is due, else the ledger's earliest next try, else null (also null with no reach to the published bucket). Bounds provisional until the platform check P. Test: g54-paths.test.mjs, g54-l.test.mjs." Uses: publication gains caseFilesOwed, caseFileNextAt, recordCaseFileAttempt (and heldMaterialsOf, already); public-read gains recordCaseFileFailure.

DEFERRED / FOR BOB (P9)
1. The sweep does not re-copy a FINDING's bytes: if a finding's copy failed at op=ratify (now recorded at step copy), the assembly fails FINDING_MISSING hourly until a person re-sends that op=ratify (R6). Healing it by the sweep needs the ratified image at the pin from record-core (not a read this module has); not done. Your call whether it is worth a request to record-core. 4783 and 6227 are not this shape (their finding bytes answer 200).
2. Bytes of ONE edition are not bounded before the build (heldMaterialsOf carries no sizes); the 4,000-file estimate is the only pre-check. The first P at the redeploy shows it (casefile_attempt lines carry bytes and wall). A kill would be recorded as a building left behind, counted as an attempt, backed off.
3. Plan text for G54 (b) "R-OLD / the repair" still says the sweep re-copies 4783's text from the evidence store; you have corrected it (K4704).

Size (session_01BzSCgXgk3R3CkA61oFbhfw): test runs 24, module lines 3924

## J10 · REPORT

B9 applied, waiting for PUBLIC-READ's CHANGE. tranche/T51 merged (publication G54 in). Aligned to publication's published signatures: owed entries read `case`/edition, `next_at` and caseFileNextAt are ISO (wake returns ms), recordCaseFileAttempt is called only for `failed` UNKNOWN (ISO `at`). The sweep never records `stopped`: CASEFILE_MISSING_MAX_ATTEMPTS and my TOO_LARGE bound/estimate are removed from the module (publication's writer and public-read's assembly own them); a material the evidence store answered absent goes to the assembly as prior.absent (every item {sha, absent}; absent true only when every missing one is confirmed gone), a failed copy is not an absence. prior = {materials_missing:[{sha,absent}], copy_error, copy_code ("BUCKET_FAILED" when a copy threw), absent}; the acts use the same (copyMaterialsDetailed). Suite: 281 tests, 275 pass, 6 red, all needing PUBLIC-READ's merge (recordCaseFileFailure seam, and the 5 L seams that need the assembly to record). Publication's seam is green. Checks: architecture, coverage, words 0 for the module. I will turn the six green and COMPLETE on your CHANGE.

## J11 · COMPLETE

COMPLETE (again) · RATIFICATION #31 · G54 after CHANGEs B9, B10 (K4710 (2), K4711, K4718). tranche/T51 merged with publication's and public-read's G54.
- The six seam tests are green against the real providers: 281 tests, 281 pass, 0 fail (ratification dir). Users run (mk6, case-authoring evidence-rows, review edition, action-holds readers, affordances t34 and catalogue, plane t41/t45/accepted, op-declarations t34): 125 of 125. Checks for the module: architecture 0, coverage 0 (55 of 55), words 0; ownership: 1 failure = build/plan/diagnosis-R6-g54-cause.md (START-directed).
- Aligned to the published signatures: owed entries read `case`/edition; `next_at` ISO, caseFileNextAt ISO read as ms; the sweep records only `failed` UNKNOWN itself (ISO `at`); NEVER `stopped`. Removed from the module: CASEFILE_MISSING_MAX_ATTEMPTS and my TOO_LARGE estimate and bound (publication's writer and public-read's assembly own them). Constants left: CASEFILE_SWEEP_EDITIONS 2, _FILES 400, _BYTES 16 MiB (provisional until P).
- prior = {materials_missing:[{sha, absent}], copy_error, copy_code ("BUCKET_FAILED" when a copy threw), absent}; a material the evidence store ANSWERED absent sets absent (true only when every missing one is), a failed copy is not an absence; all four paths (op=caseratify, op=ratify's copy step via recordCaseFileFailure, the scheduled publisher, the sweep) use it.
- L on workerd with the real providers: each of the three faults is recorded by the assembly (state failed with its step and code: bucket_put/manifest_put BUCKET_FAILED, record STORE_SILENT; two attempts = building then failed) and the block states it; one tick of the sweep builds two editions (a third waits), the next the third, then nothing; a put that threw, and one that threw only for the manifest's bytes, are healed after the backoff. Measure unchanged (7.3 of the diagnosis).
- Census: no op changes its keys; DECLARED_OPS unchanged. Words: none.
- My R6/R39/R42/R57 proposal stands as amended: drop from R57 the stop count, the TOO_LARGE bound and CASEFILE_MISSING_MAX_ATTEMPTS/CASEFILE_TOO_LARGE_FILES; the sweep tells the assembly of a confirmed absence (prior.absent) and publication's writer stops the edition. Deferred item unchanged: the sweep does not re-copy a finding's bytes.
Size (session_01BzSCgXgk3R3CkA61oFbhfw): test runs 33, module lines 3904

## J12 · COMPLETE

COMPLETE · RATIFICATION #32 · G57 (K4720, K4724)

**What changed.** `bio-plane/src/ratification/casefile.mjs`: `healFindings` (new) and `bundlePartOf`; `sweepCaseFiles` gains the `textAt` dependency and, between the materials and the assembly, heals each owed edition's member findings: per finding the bundle part (the `parts` entry whose `sha256` is `bundle_sha`, else `{bundle.md, bundle_sha}`, so a row with empty `parts` is healed), `head` in the published bucket, present skipped (no record read), absent read with `textAtSha` and put as UTF-8, unreadable listed and left to the assembly (`FINDING_MISSING`, never stopped). A bucket throw goes to the assembly as `prior.copy_error` (failed, step copy, BUCKET_FAILED; the materials information is then not read, as `worker.mjs:218-221`). The in-edition stop is on puts (`CASEFILE_SWEEP_FILES`) and bytes only, never on heads; an incomplete heal assembles and records nothing and the edition stays due. Heads and bytes are added to the tick's files and bytes. The tick's answer gains `healed: [{case, edition, examined, copied, bytes, unreadable}]` (+ `error`), and one `casefile_heal` log line per edition that copied or listed anything. `index.mjs` `caseFileSweep` passes `textAt` from `this.record.textAtSha` (undefined when the record lacks it: nothing healed). Nothing outside ratification changed.

**Tests, red then green.** `g57-heal.test.mjs`, 17 tests, through the real `ratifyOp`/`caseRatifyOp` with real signatures, the real record, ledger and assembly, one shared published bucket: (a) op=ratify last member, (b) op=caseratify sitting, (c) earlier member's copy failed, (d) empty `parts`, (e) recorded FINDING_MISSING, (g) `casefile_heal` lines, (h) put failing for good (one record per due tick, nothing inside the backoff), (i) unreadable listed, (f) two bounds cases over the stand-in ledger (450 findings, last 3 absent: built in one tick, 450 heads counted into files, the second edition's assembly 0 times; 450 all absent: 400 puts a tick, built on the second). Controls C1-C6. Seen red on the unchanged tree: 12 of 16 then-existing tests (the others, C2, C4, C6 and the two-small-editions control, are green before and after by design). Now 17 of 17 pass. `g54-paths.test.mjs` green whole. Bounds case (f) lays its extra member rows in the state the sweep reads (450 signed findings would test the signer); stated in the file.

**L (`g57-l.test.mjs`, `g57-entry.mjs`; 6 of 6 pass).** Figures in `build/plan/diagnosis-R6-g54-cause.md` section 7.4: `textAtSha` live and snapshot rows over real SQLite; 3 findings healed and built in one tick (get 3, head 20, put 8), a second tick 0 puts; a put that throws once: failed BUCKET_FAILED/copy, nothing inside the backoff, healed after; object killed part-way (fresh Miniflare over persisted storage and R2): next tick copies only the 2 absent; 1,000 member findings, every copy failed: ticks of 801, 1,201 and 7,205 subrequests (get 1,000, head 5,005, put 1,200 in the last), all under 10,000; a reached non-member finding with absent bytes: member findings healed, edition stays failed FINDING_MISSING/build, no manifest (the named limit). Tick constants unchanged: editions 2, files 400 (now also the in-edition put bound), bytes 16 MiB. `g54-entry.mjs` gained `put_throws_once`/`put_throws_nth` fault modes and `CREATE TABLE IF NOT EXISTS` for its two stand-in tables (needed for the restart).

**Suites and checks.** `node --test test/m/ratification/`: 298 pass, 0 fail. Impact set (858 files, 45 modules): 7173 tests, 7160 pass, 11 fail, all inherited or environment: screens-publish `common` R24 and `g54-page` (rows.mjs), plane `release` R24, journey-check `pseudo` x7 (playwright-core not installed; identical on the unchanged tranche), plane `g41-shape` (a 200,000-row xlsx timing test, failed under 4-way concurrency, passes alone). `checks/run.mjs`: format 0, architecture 0, coverage 0 (6696 of 6696), channels 0, words 11 failures (inline 6, missingkey 5: the inherited K4710 (5) ones, in case-checker and installer-steps; none in ratification). Ownership: 1 failure, `build/plan/diagnosis-R6-g54-cause.md`, the accepted listing.

**Census.** No op's accepted keys change; `DECLARED_OPS` unchanged; `caseFileSweep`'s answer gains `healed` (additive). No service added; no word added.

**Proposed texts (BOB writes them).**
R57 amended: "...for each, copies the materials first (R39); then heals its member findings: each finding's bundle part (the `parts` entry whose `sha256` is the finding's `bundle_sha`, else `{bundle.md, bundle_sha}`) that the published bucket lacks is read from `record-core`'s `textAtSha` (its R60) and put, before the assembly runs; a part the record cannot answer is left to the assembly, which states `FINDING_MISSING` (never stopped); a bucket error reaches the assembly as `prior.copy_error` (R6), which then does not read the materials; the heal counts against the tick (each part examined adds a file, each byte copied a byte) and, inside an edition, stops before a put on puts and bytes only, never on heads, leaving the edition due; the answer carries `healed` and each healed edition writes one `casefile_heal` log line (no document text, no secret). Findings the case file reads that are no member of the edition are not healed by the sweep. Test: `g57-heal.test.mjs`, `g57-l.test.mjs`."
R6 amended at its end: "A finding's `bundle.md` that a copy did not store is converged by a re-sent `op=ratify` or by the sweep (R57); its other files, and a reached non-member finding's bytes, only by a re-sent `op=ratify`."
Uses: record-core's `textAtSha` now also R57; remove the parenthesis "*(`textAtSha` not yet provided: T8's record-core entry)*" at `ratification.md:116`.

**Deferred / found elsewhere.** None. The plane's G57 test is a CHANGE to PLANE after this merges, as the START says.

Size (session_01M5oCcG2xs2ePLykgVfVCvq): test runs 14, module lines 3964

## J13 · COMPLETE

COMPLETE · fix round 7, G62 (ratification side) and G59 (parity test), B12. Reading: B12, my requirements whole, `#publishAtOffer`/`caseRatifyPreflight`, publish-schedule's zone read (`schedule.mjs:48-75`), `retrieval.zone()` (`index.mjs:486-518`), `RecordCore.snapPath`, record-grammar `bundle.mjs:570-660`.

**What changed**
- `bio-plane/src/ratification/index.mjs` `#publishAtOffer` (R44, R58): asks `retrieval.zone({why: true})` (a plain answer is read as before); `publish_at` gains `source` (retrieval's `local-facts`/`profiles`; `profiles` when retrieval threw and the profiles answered; `none` when no zone) and, when not offered, `why` (retrieval's, or `UNREADABLE`); one `console.log` line `{event:"publish_at", offered, source, why}` per pre-flight (no zone text, no name, no secret).
- `build/requirements/ratification.md`: R44 amended, R58 and R59 new, each marked *(not yet met: T51)* (B4: written in the requirements file; the ownership check lists that one file, accepted at the merge).
- Tests: `r7-publish-at.test.mjs` (new, R58), `r7-snappath-parity.test.mjs` (new, R59); R44/R18 tests in `schedule.test.mjs` and `preflight.test.mjs` compare the offer without `source`/`why` (those two keys are R58's, asked in its own file).

**Decision for BOB (a detail of mine, P17): the plan's "best-reading fix" (fall back to the profiles when `retrieval.zone()` answers null) is NOT built.** Reading the code, it cannot help and could mislead: retrieval's null is (a) no `jurisdiction_profiles` setting, where the fallback reads the same empty setting; (b) two profiles governing different zones, a deliberate null (`retrieval/index.mjs:497-499`) that `publish-schedule` R1 also answers (`schedule.mjs:67-68`) and refuses `PUBLISH_AT_NO_ZONE`, so a fallback would offer "Publish at…" that the very next act refuses; (c) `combine` null, the fallback's own answer. R44's test "no zone there offers nothing, even with a profile zone" (T50, N1203) states this, and I did not change a stated meaning. Control test: `R58 control`. The cause of the live "isn't set" is still unknown (the plan says so); the new `source`/`why` and the log line are what names it on the redeploy (K4428). The screen's three-case change is screens-publish's.

**Tests, red then green**
- R58, five cases through the real `caseRatifyPreflight` over stand-in retrieval answers (offer with source; no zone with why; control: null stays final with a profile set; unreadable retrieval falls back to profiles; unreadable and none): each seen red on the tranche, green now.
- R58 real retrieval case (`R58 the real retrieval ...`): RED BY NAME until retrieval's G62 job merges `zone({why: true})` (the tranche's `zone()` ignores the argument, so `source` is null and `why` absent). Provider: RETRIEVAL.
- R59 parity (8 names + the all-together/control case): red now for the five dotless/subfolder/dotted-directory names (`snapshots/upload-<sha>`, `a/b/c`, `a.b/c`, `noext`, and the combined case) and green for dotted names; RED BY NAME until record-grammar's G59 job merges. Provider: RECORD-GRAMMAR. The test runs at `checkBundle`'s interface and needs no helper name.
- Suite: `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/ratification/` from `bio-plane/`: 309 pass, 1 fail before the parity file (the real-retrieval R58 case); with the parity file, the 6 red are the two providers' only. Both providers' branches have no code on the tranche yet (`git diff origin/tranche/T51...origin/job/T51/<m> -- bio-plane/src` empty at my start).

**Checks** (`checks/run.mjs /home/user/bio`): format 0 failures; architecture 0; coverage 1 failure (record-core R89, R90, not mine); words 11 (case-checker spec.mjs inline 6 and newgroup missingkey 5, both inherited by name, none in ratification). `checks/ownership.mjs`: 1 failure, `build/requirements/ratification.md`, accepted per B4.

**Census ops:** none change (`caseratify`'s accepted keys are unchanged; only the pre-flight's answer gains two keys). **Rows owed to UX-DESIGN:** none from this module (no new sentence; `source`/`why` are codes the screen maps).

**For BOB:** when retrieval's and record-grammar's G62/G59 are merged on the tranche, merge it into this branch and the six red tests turn green with no further change of mine; send a CHANGE if any stays red. Also: screens-publish should read `publish_at.source`/`why` (and `publish_at_stated` for the not-reached case, which is case-authoring's).

Size (session_011tm6afKMQNi7iG6sqa1TmS): test runs 8, module lines 3987

## J14 · QUESTION

QUESTION (G120, the phase entries `gate;dur`, `commit;dur`, `copy;dur`, `assemble;dur`, `reuse;dur`). The Worker half gets its `ctx` from `plane/door.mjs:116`, which hands no clock, and `phase-clock.mjs` accepts no module-stated entries yet (control-plane's job). My best reading, which I build now: `caseCeremony` calls an optional `ctx.stateTiming(name, ms)` once per phase, a no-op when absent (so nothing breaks before control-plane merges), and my r8-chain test asserts the five calls with a stub. For the entries to reach `Server-Timing`, plane/door.mjs must pass `stateTiming` into this ctx and the clock must take them. Please give control-plane (or plane) that provider with exactly this name and signature, or tell me the name you chose and I rename. I carry on meanwhile.

## Fix round 8 (RATIFICATION #34, session_01Aitu5ptyoRC1Hw82dyhsuk): G120

**(1) Cause.** `ratification/ops.mjs` `caseCeremony` awaited `casetestimony`, `caseapproval` and `casegate` one after the other (the store reads depend only on the document `casedocfacts` answered), and `copyMaterialsDetailed` copied one material at a time (head, get, put each awaited). **(2) Why missed:** no test counted depth or concurrency; Miniflare answers in ms. **(3) Failing-first** `r8-chain.test.mjs`, seen RED before the change: `AssertionError: peak concurrency of the bucket calls is 1`; `all three in flight at once` failed; the phases test failed (no stated phases). Green after: 5 of 5. **(4) Platform check:** L (counts, in the tests); P after the redeploy is BOB's: `caseratify;dur` with `gate;dur`, `commit;dur`, `copy;dur`, `assemble;dur`, `reuse;dur`.

Applied: the three reads issued together with `Promise.all`, their answers weighed in the old refusal order (R35 testimony, CASE_RATIFY_STALE, R49 approval, NO_SIGNERS, signature, then the gate); the gate read is now speculative before the signature check, a read only (nothing written by a refused act, tested). `copyMaterialsDetailed` copies in groups of `COPY_GROUP = 8`, counting outcomes in item order (answer unchanged). Each phase stated once through the optional `ctx.stateTiming(name, ms)` (no-op without it).

**Call budget (re-derived):** object chain today 21 calls; the three reads together save 2 → 19 sequential; case file (G121): 12 files in groups of 8 = 2 x (head, put) = 4; 2 `PUBLISHED.get` = 6 → 25; the material copy adds no depth beyond its group (one group of at most 8 beside the case file's). My module's part of the 21 is 15 → 13 sequential; the rest (session, reauthdue, recordcasefile, casefilefacts, recordcasemanifest, reusedparts x2) is the door's, public-read's and mine after the commit, unchanged. A figure below 25 at the door is explained by the member commits and reuse loops running sequentially only when a sitting has members.

**Edits to existing tests (declared, not weakened):** `approvals.test.mjs` R49 and `relays.test.mjs` R17 pinned "the gate was not asked after the approval refusal" / "the act's last fetch is the refusing op". With the three reads together the gate read is asked too; both now assert the true invariant (the commit and everything after is not asked, nothing written, the same refusal bytes). 

**Requirements:** R60 is amended in `build/requirements/ratification.md` by me (B4); the ownership check lists that one file.

**Provider owed (QUESTION J14):** `plane/door.mjs:116` must pass `stateTiming` into the ctx and `phase-clock.mjs` must carry module-stated entries (control-plane's). Until then the phases are not on `Server-Timing`; nothing breaks. The door count test (`r8-caseratify-calls`, depth at most 25) is control-plane's.

Nothing deferred. Nothing found in another module beyond the provider above.

Tests and checks: `node --test` ratification: tests 324, pass 324, fail 0. Plane/public-read/case-authoring/mk6 tests naming caseratify: 50 of 50. impact.mjs: 45 modules affected (transitive); the direct users run above. format 0 failures; architecture 0; coverage 59 of 59, 0; words 0 failures; ownership: 6 files, 1 failure = the requirements file B4 accepts.

Size (session_01Aitu5ptyoRC1Hw82dyhsuk): test runs 9, module lines 3711

## J15 · COMPLETE

COMPLETE · G120 done, record section 'Fix round 8' pushed on job/T51/ratification. R60 amended by me in build/requirements/ratification.md (the one file ownership lists). ratification tests 324/324; format, architecture, coverage (59/59), words 0 failures; ownership: only the requirements file listed. The three independent reads are together, the material copy in groups of 8, phases via ctx.stateTiming (B14). Call budget 25 re-derived in the record. Two existing tests (R49 approvals, R17 relays) pinned the old call order and now assert the invariant (commit not asked, nothing written, same bytes). Needs from others: the door count test and the stateTiming forwarding (PLANE #55, control-plane).

## CHANGE B15 (G120, the door's chain)

Cause: through control-plane's counting door the chain was 38, not from `copyMaterials` (already in groups of 8 and merged) but from the sitting's member work: each member's `prepareFinding` ran one after another (gatefacts, image, list, ratifygate), the members' `copyFinding` copied part by part, and the materials' copy and the members' copies ran one after another. Applied: `prepareFinding` asks image and list together; the members are prepared together, the first refusal in the sitting's order answered; `copyFinding` copies in groups of 8; the materials' copy and the members' copies run together. Failing-first, seen red: `sitting.test.mjs` "R60, R52: the members of a sitting are read together…" (`gatefacts of the members in flight together: 1`), `r8-chain.test.mjs` copyFinding (`peak 1`). Green after. Control-plane's `r8-caseratify-calls.test.mjs`, run here from its branch against this code (files removed after): was 38, now `longest chain 24`, case file heads/puts in flight 8, 2 of 2 pass. relays.test.mjs R17 now also allows image and list asked together.
Tests: ratification 326 of 326. Requirements: R60 reworded in `build/requirements/ratification.md`.
Size (session_01Aitu5ptyoRC1Hw82dyhsuk): test runs 14, module lines 3745

## J16 · COMPLETE

COMPLETE (CHANGE B15). copyMaterials was already concurrent (merged); the 38 came from the sitting's members: prepared one after another, copyFinding part by part, and the materials' copy then the members' copies in sequence. Now: image+list together, members prepared together (first refusal in sitting order), copyFinding in groups of 8, materials and member copies together. Red first (sitting.test.mjs: gatefacts in flight 1; r8-chain copyFinding: peak 1), green. Control-plane's r8-caseratify-calls.test.mjs run against this code from its branch: longest chain 24 (was 38), 2/2 pass. ratification 326/326; 198 tests of users naming caseratify pass; format, architecture, coverage 59/59, words, ownership 0 failures. R60 reworded in the requirements file; record section pushed.

Ring failed: BOB session_017crmqx6Y4AZnxrNGEDoExR is archived, so J16 (COMPLETE) is the message; BOB's backstop reads it (mechanics §13).

## Fix round 9 (RATIFICATION #35, session_01V7rHxcZteb1q3kLiGE9C2N): G120b

Entry applied: G120b (START B16, K4850). Re-read of `ops.mjs` (whole) agrees with the diagnosis: members were already prepared together (round 8), so what remained was (a) `list` (every bundle id, a read of the viewer alone) asked once per member, (b) each member's `gatefacts` then `image` one after the other (`image` does not depend on the facts), (c) the members' `reusedparts` checks in a `for` with `await` (`ops.mjs` reuse loop).

(1) **Cause, file:line (before the change).** `ops.mjs` `prepareFinding`: `gatefacts` awaited, then `image` + `list` together, then `ratifygate`: five object levels (`casedocfacts` -> three reads -> `gatefacts` -> `image`+`list` -> `ratifygate`), and `list` once for each of the sitting's members. `caseCeremony`'s reuse loop awaited `reuseCheck` member after member.
**Fix.** `gatefacts`, `image` and `list` are issued together and weighed in the old order (facts, signature, image, list), so the refusals' order and bytes are as before; a sitting asks `list` once, beside `casetestimony`/`caseapproval`/`casegate`, and every member's gate weighs that one answer (`prepareFinding`'s `list` option); the members' reuse checks run together (`Promise.all`), answered in the sitting's order. Gate phase: four object levels (`casedocfacts` -> four reads -> `gatefacts`+`image` -> `ratifygate`), was five.
**Not done, and why.** `gatefacts`, `image` and `ratifygate` are reads of *different* bundles (a different id, a different image per member): they are asked once per member, not once per act. Folding the members' reads into one object call is a batch route in plane/control-plane (their module, not this one); I have not changed it. Reported to BOB below.
(2) **Why the tests missed it.** Round 8's tests asserted the chain at most 25 and the independent reads together; none counted the sitting's calls per route or the gate's depth or the reuse checks' concurrency.
(3) **Failing-first, seen red** (`sitting.test.mjs`, a sitting of 7 through `caseRatifyOp` with a recording store whose every call waits): `list asked 7 times (red: 7)`; `the gate phase is 5 object levels deep (red: 5)`; `reusedparts of the members in flight together: 1 (red: 1)`. Green after. Counts, never a time (R-CLOCK).
Two tests pinned the old call order and now assert the invariant that stays (nothing committed or copied, the store's answer verbatim, the three reads asked together): `relays.test.mjs` R17 (`ratify/gatefacts`, `image`, `list` stop with all three asked) and `sitting.test.mjs` R60 (`image` of the members in flight together, `list` one read).
(4) **L (done), through the counting door** (`control-plane/r8-caseratify-calls.test.mjs`, run here, unchanged): longest chain **25 -> 23**, awaited calls 61 -> 60 (20 to the object, 40 to R2), case-file heads/puts in flight 8, 2 of 2 pass. The chain per phase (object levels): gate 5 -> 4; commit 1; copy and reuse unchanged in depth (reuse now one level for all members, was one per member). **P:** BOB's re-walk reads `caseratify;dur` and the phase entries; what remains over 2 s after this and public-read's assembly (G121b) is BOB's to measure.

**Finding in another module (for BOB).** A sitting still makes one `gatefacts`, one `image` and one `ratifygate` per member (3 object calls a member, concurrent but each carrying the whole record's image/registries). One batch route returning those for all members would cut the object's work; it belongs to plane/control-plane (`gatefacts`, `image`, `ratifygate` routes), not to ratification.

Tests: ratification 329/329; 41 files of users naming caseratify/ratification ops 389/389; `impact.mjs origin/tranche/T51 HEAD` (45 modules affected; users touched are those 41). Checks: format 1 failure not mine (`build/modules.json` office-readers path `bio-plane/src/office-xml.mjs`, unchanged by this job; same on the commit before); architecture 0; coverage 59 of 59, 0; words 0 (ratification); ownership 0 (4 files).
Size (session_01V7rHxcZteb1q3kLiGE9C2N): test runs 9, module lines 4040

## J17 · COMPLETE

COMPLETE (START B16, G120b). A sitting now reads the list of known ids once (not once a member); each member's gatefacts, image and list are asked together (gate phase 5 -> 4 object levels, refusal order unchanged); the members' reuse checks run together. Red first on a sitting of 7 (list 7 times, depth 5, reusedparts in flight 1), green after. Counting door (r8-caseratify-calls, unchanged): chain 25 -> 23, 61 -> 60 calls. ratification 329/329, 41 user files 389/389; architecture, coverage 59/59, words, ownership 0; format has one failure not mine (modules.json office-readers path office-xml.mjs, same before my change). Finding for BOB: gatefacts, image and ratifygate remain per member (different bundles); a batch route is plane/control-plane's. Two tests pinning the old call order restated as invariants. Record section 'Fix round 9' pushed.

## J18 · REPORT

REPORT (START B17, cause 27a): the lines that are other modules'.
1. **control-plane** (Wave B job): (a) fold `session` and `reauthdue` into one hop (the first two events of the door's chain; one saved). (b) the counting test `bio-plane/test/m/control-plane/r10-caseratify-chain.test.mjs` (ratification R60 names it) is control-plane's: its helpers (`r8-kit.mjs`, `wrap-entry.mjs`) are control-plane's and import screens modules, so this module cannot import them without an architecture edge. Text for it: the G59 case of `r8-caseratify-calls.test.mjs` through the counting door, `depth(events, worker) <= 10`, with controls `GOLDEN_KEYS`, `materials_copied`, `container` unchanged; the bar derived: 10 = 1 (admission, folded) + 6 (this module's own, below) + 3 (public-read's assembly, folded). Measured through the door today on this branch: 47 calls, longest chain 15 (the START says 18 before): session, reauthdue, the facts and the sitting's reads, the three reads and the gate, the commit, head, get, put, then the assembly's 5 (recordcasefile with casefilefacts, PUBLISHED.get, the puts, recordcasemanifest, recordcasefile).
2. **public-read** (the assembly, `publication/worker.mjs assembleCaseContainer`): its 5 sequential hops must be 3: fold `recordcasefile`, `casefilefacts` and the final `recordcasemanifest` + `recordcasefile` into fewer store hops, and issue the bucket gets and puts of the case file in one group of 8 with the heads. Until then the door's chain cannot reach 10, whatever this module does.
3. The counting test of this module (`r10-chain.test.mjs`) counts only its own calls (the assembly stand-in is no call): bar 6, and it is the same bar the door's test derives for this module's share.

## J19 · COMPLETE

COMPLETE (START B17, fix round 10, Wave A batch 3).

**Cause R27a (G5, E2, `caseratify` 2.8-3.5 s).**
- Root cause (`ratification/ops.mjs`, `caseCeremony` as the START cites: gate, commit, copy, assembly, reuse): the act's own chain was 10 awaited calls in series before the assembly: the case's facts (1), the three reads (2), then each member's gate facts (3) and gate (4), the commit (5), the copy's head and put (6-7, a get between for a capture), then the members' reuse checks after the assembly (reusedparts, capturelimit, recordreuseverdicts: 3 more). None of the member reads depended on the case's facts, and the reuse checks depend on neither the copy nor the assembly.
- Fix (ops.mjs): `readFinding` starts a sitting's member reads (gate facts, image, the shared list, and the store-half gate as soon as the three are in) at once, beside `casedocfacts`; `weighFinding` weighs them in the old order (R4's refusals, NO_SIGNERS, the signature, the image, the list, the gate), so every refusal keeps its place; `prepareFinding` (op=ratify) is `readFinding` then `weighFinding`, unchanged for its caller. The members' reuse checks start with the commit's answer and are awaited after the assembly; the phases are still stated once each, in order (`reuse;dur` now spans the overlap). Reads only run early; nothing is written by any of them. What the member is told is unchanged: the answer, its keys, `materials_copied`, `container`, each member's reuse report.
- Why the tests missed it: `r8-chain.test.mjs` proved that independent reads overlap, never counted a chain; `r8-caseratify-calls.test.mjs` (control-plane) bounds the chain at 25, a figure derived from that day's chain; nothing derived a bound from the 2 s bar.
- Failing-first test: `r10-chain.test.mjs` (new): a sitting (the case, two findings, one evidence document, a reused part to re-fetch) over a store and buckets that answer after a real wait; the longest chain of calls each beginning after the one before ended, counted by logical sequence, never by time. Bar 6, derived (10 less admission's 1 less the assembly's 3 folded). Seen red at 10 on the unchanged code, green at the bar after. Controls: the answer's golden keys, `materials_copied`, `container`, each member's reuse report and the phases in order; the refusals unchanged (a case that does not exist, a stale sha, a bad member signature, nothing committed, the commit hop never made); `op=publishat` within the same bar.
- Platform check P (for the redeploy): E2's own sequence on the copy, `Server-Timing` `object-calls;dur`: chain 10 or less, total under 2 s. It needs control-plane's fold and public-read's assembly cut (REPORT above); this module's share is 6.

**Fixtures published** (`bio-plane/test/m/ratification/fixtures.mjs`, made by the real code at test time; `fixtures.test.mjs` calls each and checks the real answer, with a control):
- `preflightRefusal`: R18's pre-flight for a signer with no attesting key (`NO_ATTESTING_KEY`), and the same pre-flight for the owner as the control.
- `noCaseDocument`: publication's real `caseDocument` read of an unsigned case document: a stranger, a wrong secret and a missing case alike `NO_CASE_DOCUMENT`; a member and a live grant holder read the document. One stand-in: review's grant (review is later in the order).

**Own fixture lines (19 in the START).** Done: contested.test.mjs:108 (contradiction `candidateReads`), converted-c.test.mjs:415 (capture `recordReuseVerdicts`; the record read back), fixture.mjs:145 (provenance `holdsRegister`), schedule.test.mjs:127 (publish-schedule `scheduleRefusals`), relays.test.mjs:118 (marker control-plane `unknown-op`, accepted). g54-entry.mjs:103 is accepted by a marker, not re-pointed: the entry is bundled into the Miniflare script and runs on workerd, where provenance's fixture (node SQLite worlds) cannot load; re-pointing it made g54-l and g57-l fail "Illegal constructor", so it was undone.
- `fixtures-own` markers (K5060): `g54-entry.mjs:98` (platform, the reason above).
- `fixtures-contract` markers (waiting for the provider's `fixtures-run`, `contract-no-run`): answer-envelope `door-helpers` at fixture.mjs:424, g54-entry.mjs:40, g54-paths.test.mjs:448, g57-heal.test.mjs:47; store-door `store-replies` at relays.test.mjs:119, :159, :163, :188; control-plane `unknown-op` at relays.test.mjs:118 (its run is merged: accepted). No `fixtures-generic` marker.
- Left, named: g54-paths.test.mjs:310, :455 and g57-heal.test.mjs:426 (public-read `assembleCaseContainerRefusal`, K5074: public-read merges after; arrive as a CHANGE); g54-entry.mjs:111 strength and :113 money (FIX-E, their providers merge after); and **g54-paths.test.mjs:109 and :114**: the START names publication's `caseFileLedger`, but those two lines are the stand-in assembly's own refusal answers (`{ok:false, reason: code, code}` for the build's `MATERIAL_MISSING` / `BUCKET_FAILED`), which `caseFileLedger`'s doc itself gives to public-read; the ledger half (owed, next-at, record) is the hand model beside them and re-pointing it to the real ledger would change the time rules these tests pin (grace 120 s, backoff 15 s doubling) in eight tests without removing the two lines. So they wait for public-read's `assembleCaseContainerRefusal` with the three above, and arrive as a CHANGE; BOB may rule otherwise.

**Tests and checks** (from the repository root unless said): ratification suite 335 of 335 green (`node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/ratification/*.test.mjs`); g54-l and g57-l (Miniflare) 17 of 17; control-plane `r8-caseratify-calls.test.mjs` 2 of 2 (chain 15 through the door); the tests of the other modules that name caseratify/ratify (case-authoring, public-read, publication, publish-schedule, plane, op-declarations, screens-publish, affordances, action-holds, case-inputs, screens-action): 496 of 499, the three reds (op-grades `owners`, screens-publish `common` R24, `g54-page` R22) are red at the tranche tip too (inherited, none mine). Process checks: format 178 modules 0 failures; architecture ratification 0 failures; coverage ratification 59 of 59 live ids named, 0 failures; ownership 0 failures (13 files changed); words: no finding in this module; `setup-words/build.mjs --check`: the stale-rows note only (control-plane's rows), no refusal naming this module; fixtures: 15 lines left in this module, all named above as waiting.

Size (session_0187Lt3bgcnMcXFPx6HVxqC5): test runs 14, module lines 4054

## J20 · COMPLETE

COMPLETE (START B18, fix round 10, follow-up 16: test files only). Commit `b2c066da8e` on `job/T51/ratification`, pushed.

**Entries applied.** Follow-up 16, the re-points:
- `g54-paths.test.mjs`: the ledger's refusal answers (`assemble`, the `next` path and the MATERIAL_MISSING / BUCKET_FAILED path, :109 and :114) now return public-read's real refusals from `assembleCaseContainerRefusal()` (`CASE_FILE_NOT_BUILT`, codes MATERIAL_MISSING and BUCKET_FAILED). Read whole first: its `materialMissing`, `bucketFailed` and `notAssembled` answers are the real ones; they replace the hand-built `{ok:false, reason: code, code}`. The fixture is called once, at import (`REFUSALS`).
- `g54-paths.test.mjs` :310 and :455 (the sitting refusal, `CASE_FILE_NOT_ASSEMBLED`) take the real `notAssembled` answer.
- `g57-heal.test.mjs:426` takes the same real `notAssembled` answer (the import is at module load, `NOT_ASSEMBLED`).
- `g54-entry.mjs:111` (strength) and `:113` (money): not re-pointed; see Deferred.

**Deferred, and why.** `g54-entry.mjs:111` and `:113` keep their stand-ins, marked `// fixtures-own: platform` (the marker is on :111, and covers :113 in the check). The entry is bundled into the Miniflare script and runs on workerd. strength's and money's published fixtures build node:sqlite worlds (`node:sqlite` imports), which cannot load there; the same reason as the existing marker at :98 (provenance). The stand-ins answer only the ok shape the sweep reads (testimony with no legs; a fact not found). Each of those two answers is a real provider's shape, so this is a REPORT, not a silent change: if BOB wants them on the fixtures, the entry needs a node-side variant, which is a change to g54-l's composition, not to this module's tests.

**Findings in another module.** None.

**Fixture markers (K5060).** Added: `g54-entry.mjs:111` (`fixtures-own: platform`, above, covering :111 and :113). No `fixtures-contract` or `fixtures-generic` marker added. No marker removed.

**Tests and checks** (from the repository root unless said):
- Two edited files: `g54-paths.test.mjs` and `g57-heal.test.mjs`: 33 of 33 green (`node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit <files>`).
- Ratification suite, all 33 files including g54-l and g57-l: 335 of 335 green, 0 fail, 0 skipped.
- `checks/fixtures.mjs /home/user/bio ratification --list`: 0 failures (12 accepted; the six that were failing are re-pointed or marked).
- format: 0 failures (178 modules). architecture: 0 failures. coverage: 59 of 59 live ids named, 0 failures. words: 0 failures. ownership (`tranche/T51`): 4 files changed by ratification (3 tests and this record), 0 failures.
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 1 of 178 (ratification only), affected test files 2 of 2815 (the two I changed, both green above).

**Requirements.** None changed; no requirement id struck. Note for BOB: follow-up 16's R60 point stands (not struck here; control-plane's fold owns it).

Size (session_01GJy1fny8QM6KzhgqNmKu8v): test runs 3, module lines 4054

## J21 · COMPLETE

**Follow-up 52 (B19), the walker's case through the door: done.** Entries applied: the new test file `bio-plane/test/m/ratification/t51-walker-observation.test.mjs` (commit 2e811302a8, on `job/T51/ratification` after the merge of `tranche/T51` at 4277811c00). Product code unchanged. Marked requirement met: **R2** (`op=caseratify`, the gate's `GATE_REFUSED` with `runCaseGate`'s findings; BOB strikes the mark). B18 (a START for RATIFICATION #37) is superseded by B19 and was not applied.

**Cause (one), with K4426's four fields.**
1. *Root cause, with evidence.* A member's own testified observation holds its bytes only inline in her image (`snapshots/observation-<sha>.txt`), not in the evidence bucket. `ratifyGate`'s `hasCapture` (`bio-plane/src/ratification/index.mjs:514-530`) heads only the bucket. On `ff7c96831e` the signing of the walker's case answered `409 GATE_REFUSED`, finding `PLANE_MISSING_BYTES` ("registered capture is absent from the working bucket") at `snapshots/observation-d8581ad3b21ad93a.txt`, member `INFO-2026-0001-observation`. The fix that makes the gate accept the inline bytes is promotion R28 (`bio-plane/src/gate.mjs`, the register-row probe, K5130), already merged on the tranche. The gate reads `image[r.path]` after `hasCapture`, so the signing passes on the tranche.
2. *Why the tests missed it.* The sitting fixture (`fixture.mjs`) stubs provenance with no register rows, and the observation case stubs the reach on a clean information document, so no test ever held a register row whose bytes lived in the image. Gap fixed: the new test drives the real plane under Miniflare (the seam kit `control-plane/r8-kit.mjs`): `testify` writes the bytes, a finding of a case draft reaches them, the owner prepares, the author chooses cover then name, and the owner signs with `caseratify` after the password again.
3. *The walker's exact case, seen failing, then passing.* Red on `ff7c96831e` (worktree of that commit, the new file copied in): both tests fail, the signing with `GATE_REFUSED` / `PLANE_MISSING_BYTES` as above. Green on the job branch (tranche merged): both pass.
4. *Platform check.* The walker's case runs on the Miniflare plane (the workerd entry `src/plane/index.mjs`, the in-process object and R2 bindings), at the shape the walker used. No live deployment was contacted. Whether the live R2 bucket answers the same way is the redeploy's check (K4428).

**R93 (6) owner-c, re-run.** The second test: owner-c (joined, publish capability, not an owner) signs with her own key after the password again. On the tranche: `CASE_SIGNER_NOT_AN_OWNER` at the commit (membership's `caseAuthority`, `ratification/index.mjs:1234`), as the code intends. On `ff7c96831e`: refused earlier, `GATE_REFUSED` `PLANE_MISSING_BYTES`, so the owner check was never reached. I did not re-run the walker's writer-b or admin-two rows.

**REPORT to BOB (not changed, per B19).** `hasCapture` still answers the bucket only, so for the observation it says `present: false` while the gate's own image probe (gate.mjs R28) says present. The signing is correct, but the two probes disagree. Should `hasCapture` also answer the image's bytes, so both agree? I lean yes, a small change in `ratifyGate`, but it is your ruling; I have not made it.

**Deferred.** None.

**Findings in other modules.** None new. Promotion R28 is the fix and is already merged.

**Process note.** `mail start` first failed: my local `job/T51/ratification` was 1467 commits behind origin, and its pull-rebase conflicted on the Status line of a local-only commit (`737251379e`, not on origin). I kept that commit on a local backup branch, `backup/ratification-start-local-737251379e` (not pushed), reset the job branch to origin, and re-ran `mail start` (027f14bdb6), which succeeded. The START's first-step instructions cover this case; I note it in case the local branch matters.

**Tests and checks** (absolute root `/home/user/bio`, from the process repository):
- New file, `t51-walker-observation.test.mjs`: 2 of 2 pass on the job branch; 2 of 2 fail on `ff7c96831e` (reasons above).
- Ratification suite, 34 files (`node --import ./bio-plane/test/platform-sqlite.mjs --test`): 337 of 337 pass, 0 fail, 0 skipped.
- `checks/format.mjs`: 0 failures (178 modules, 178 requirements files).
- `checks/architecture.mjs ratification`: 0 failures (46 product files, 248 relative imports).
- `checks/coverage.mjs ratification`: 59 of 59 live ids named by a test, 0 failures.
- `checks/words.mjs ratification`: 0 failures (inline 0, plain 0, testcopy 0, missingkey 0, handlist 0).
- `checks/ownership.mjs ratification tranche/T51`: 1 file changed by ratification, 0 failures.
- `checks/fixtures.mjs ratification --list`: 0 failures (12 accepted, no invented answer, no stub). No `fixtures-own`/`fixtures-generic`/`fixtures-contract` marker added.
- Product code unchanged, so `impact.mjs` was not needed.

Size (session_016UGXAT7b4bSBYAh8LnmNAf): test runs 5, module lines 0 (the new test file is 89 lines)

## J22 · COMPLETE

**CHANGE B20 done.** The walker-case test is removed from this branch (commit "ratification: remove the walker-case test", pushed); CONTROL-PLANE #60 adopts it with the red-then-green evidence from J21. No product or test change is left in ratification.

**Correction to J21.** I reported architecture at 0 failures, but the test file was already in the tree when I ran it. Re-run with the file present: 2 failures (imports of `screens-publish/parts.mjs` and control-plane's `r8-kit.mjs`), as B20 said. The file is gone now.

**Checks, after removal** (absolute root `/home/user/bio`):
- `checks/architecture.mjs ratification`: 0 failures (46 product files, 248 relative imports).
- `checks/ownership.mjs ratification tranche/T51`: 0 failures (1 file changed by ratification, the job record).
- `checks/format.mjs`: 0 failures (178 modules). `checks/coverage.mjs ratification`: 59 of 59 live ids named, 0 failures. `checks/words.mjs ratification`: 0 failures.

Size (session_016UGXAT7b4bSBYAh8LnmNAf): test runs 5, module lines 0

## J23 · BLOCKED

Cause: tests; needs Bob (the R21, R29, R32 naming ruling). R18 waits on case-catalogue R6.

**R61 is done and green. The job is blocked on tests, and one of the three remaining red groups needs Bob's ruling.** Commit `3f47220787` on `job/T51/ratification`.

**What changed**
- `bio-plane/src/ratification/index.mjs:1096` (`#memberBasisAtPins`): each member is now handed `{basis, references}` at its pinned bytes (references default to `[]`), as case-catalogue R6 asks. Its callers (`:660`, `:1004`) are unchanged.
- New `bio-plane/test/m/ratification/r61-member-basis.test.mjs` (4 tests, names R61). Failing-first: the three R61 tests were red on the old code (the gate was handed a bare array), and the absent-pin control was already green. All four are green now.

**Suite (ratification, 339 tests, 34 files)**
- Before the change: 333 pass, 6 fail (R21, R29, R32 and three R61).
- After the change: 335 pass, 4 fail.
- The 4 failures:
  1. **R18 (`preflight.test.mjs:199`)** is expected to stay red until case-catalogue's R6 lands. The test checks that the pinned member's testimony leg reaches C-2.8. case-catalogue at this tranche still reads only a bare array (`checks.mjs:920`), so the object is dropped. case-catalogue's job (`job/T51/case-catalogue`, just started, nothing pushed yet) owns the fix. I did not pass bare arrays to meet it.
  2. **R21, R29, R32 (`release.test.mjs`, `retire.test.mjs`)** were already red on the tranche before my change, so they are not caused by R61. The cause is a name mismatch. Retrieval answers `SELECTION_NOT_YOURS` (`bio-plane/src/retrieval/index.mjs:1419`, `:1439`, `:1536`; its R99). Ratification R21, R29 and R32 and their tests expect `NOT_YOURS`. Which name is right is a requirement question, so **this needs Bob's ruling**. My recommendation: keep `SELECTION_NOT_YOURS`, since it is retrieval's R99 contract, and amend ratification R21/R29/R32 and their tests to it.

**Other suites I ran**
- Caller tests (60 files in control-plane, plane, case-*, publication, promotion that exercise the case ceremony or gate): 388 of 391 pass.
  - `control-plane/r10-caseratify-chain.test.mjs`: the chain is 13 calls against a bar of 11. I ran it on the pre-change `index.mjs` and it fails the same way (13), so this predates R61.
  - Two money-ingest timing tests (R105 G61, G63) fail. They do not touch the case gate; I did not check them against the baseline.

**Checks** (absolute root `/home/user/bio`)
- `checks/format.mjs`: 0 failures (178 modules, 178 requirements files).
- `checks/architecture.mjs ratification`: 0 failures (46 product files, 248 relative imports).
- `checks/coverage.mjs ratification`: 60 of 60 live ids named by a test, 0 failures.
- `checks/ownership.mjs ratification tranche/T51`: 3 files changed by ratification (index.mjs, the new test, this record), 0 failures.
- `checks/fixtures.mjs ratification --list`: 0 failures. No `fixtures-own`, `fixtures-generic` or `fixtures-contract` marker added.
- `checks/run.mjs`: 16 words failures, all in other modules (store-assembly, screens-*, and so on); none in ratification's paths. My change adds no member-facing prose.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: 49 of 178 modules. The change is private and changes only the basis the case gate is handed, so I ran the caller tests above instead of all 1,094.

**Waiting on**
1. Bob: the `NOT_YOURS` / `SELECTION_NOT_YOURS` ruling (R21, R29, R32).
2. The case-catalogue job's R6 change to land, then the R18 test should pass and the chain test (case-authoring R31) can re-run.

Size (session_01BjXA2f1GgToabWomrTvi6L): test runs 9, module lines 4056
