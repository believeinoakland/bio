# case-authoring (T36)

**Status** · session_01LrhFoLsxK6BYPBNPHwMufT · depth 2 · WAITING ON BOB (J1) · handled B3

## Job record (CASE-AUTHORING #20)

**Entry** T36-28: R60, R61, R29's C-136.2 (K2129). Depends on case-grammar's (R22) and publication's (R75) merges into `tranche/T36`.

**Reading (mechanics §17, N739).** START's measure: 1,132 KB, over 300 KB. Read whole myself: `build/requirements/case-authoring.md`; `plan/current.md` T36-28 and "Rules at the opening"; K2129's line and `plan/draft-T36-L8-L10-reqs.md` (the case-grammar, publication and case-authoring sections, "The check catalogue", "Choices made", "For BOB", "BOB's review"); the services my Uses names for this entry: `case-checker` R21, R22 and `standards.mjs` whole, `publication` R72 (and its `#criteriaOf`), `content` R45, `case-grammar` R12, R17; the code my entry changes, whole: `index.mjs`, `document.mjs`, `checks.mjs`; the tests' `fixture.mjs`. A worker read whole the rest (`schema.mjs`, `searched.mjs`, the 20 other test files; 338,627 bytes) and wrote a 7 KB summary, each statement citing file and line: which tests pin document bytes or `case_roles` fields (none pins a whole row), R29's census (invariants.test.mjs:101), the raise's tests (members.test.mjs:182–217, preflight.test.mjs:425–449), the answer's key set (document.test.mjs:140). Nothing it left out mattered: its three open points (the fixture's `w.checks` is case-import's, not R21; ratification's and publication's readers of `case_roles`) are settled by the whole suite passing.

**Applied.**
- R60: `caseDocumentText` writes `subject_entity:` on each `case_roles:` row, after `edition:`, from `subjects`; `publishCase` hands it each member's subject as its pinned bytes state it (`subjectStated`: an `ENT-` id, else null), never inquiry's column, another member's, or a body field.
- R61: `#standardsUse` asks `case-checker.checkStandardsUse` (imported from its pure `standards.mjs`, the new edge) over the complete text, `publication.criteriaFor({members at the R13 pins, signer: the publisher, at: the act's instant})`'s rows each with `captures` (content's read contract, chunked), and the text's own `materials:` and `passages:` rows read back through case-grammar's `materialsOf`/`passagesOf`. `{ok: false}` refuses `STANDARDS_USE_REFUSED` with `refusals`, `unjudged` and a `detail` naming each refusal in a sentence; it is the act's last refusal, before the store. Not-held rows answer `unjudged` on a success (only when non-empty).
- R29: C-136.2 `STANDARDS_USE_REFUSED` in `PUBLISH_ACT_CHECKS`, translation K2129's word for word, region `is-standards-use`.
- Flaw fixed in my module: reevaluation's raise for a new member edition was made inside the member loop, before R11's and now R61's refusals, so a listener could hear of an edition a refusal rolled back. It is raised after the last refusal; the answer is unchanged.

**My reading (R61, pre-flight "else among blockers").** The refusal needs the complete text, so it is reached only when every earlier refusal passes, and it is then always `first`; it can never stand beside another `first` in `blockers`. The pre-flight answers it as `first` (DEC-8) and lists it nowhere else.

**Tests and checks (on my branch with a local, uncommitted stand-in for publication R75 as K2129 words it, `{rows: #criteriaOf(members, at, signer)}`; to re-run on the merged tranche).** case-authoring: 158 tests, 158 pass, 0 fail (new `standards.test.mjs`: R60, R61 ×5, R61 with R15). Users' tests: review 38/38; plane 130/130; affordances 206/208, control-plane 164/167 and answer-envelope 24/26, each failing exactly as without my change (inherited reds 11, 18, 19, 20, 22, 23, 24). Checks: format 0 failures; architecture 0 failures; coverage 45 of 45 live ids, 0 failures; ownership to re-run on the commit.

**B2 (CHANGE).** Merged `tranche/T36` (case-grammar K2144) into my branch, cleanly; R60's test now also reads the rows back through case-grammar's `memberSubjectOf` (R22). Read since: layer 8's row and its case-authoring section of `build/layers.md` (nothing bears on this entry). Re-run with the local R75 stand-in: 158/158.

**B3 (CHANGE).** Merged `tranche/T36` (publication R75 `criteriaFor`, public-read, case-checker; K2146), cleanly. Re-ran steps 5–6 against the real `criteriaFor`, no stand-in:
- case-authoring: tests 158, pass 158, fail 0.
- Users' tests: review 38/38; plane 128/130, control-plane 163/167, affordances 206/208, answer-envelope 24/26 (and `system/migrate-released` 1/1). Every red fails identically on `tranche/T36`'s tip without my work (checked in a worktree): affordances and control-plane's R53/R2 are inherited reds 19, 20, 22–24; answer-envelope's two are 11 and 18; plane's two R6 arms ("the body's secret wins…", "…reaches the store as its SHA-256") and control-plane's R30 reviewcopy convert arm arrive with publication's R73 merge, not mine (for BOB: that merge's accepted reds until T36-37 / T36-49).
- Checks: format 0 failures (135 modules); architecture 0 failures (27 product files, 147 imports); coverage 45 of 45 live ids, 0 failures; ownership 7 files, 0 failures.

**Deferred:** none. **Found in other modules:** none beyond the reds above. (My `statementack` still reads `secretSha` from its store request's address, `index.mjs` `caseAuthoringOps`; that is N761's, T37, by K2129 (3), not this entry.)

Size (session_01LrhFoLsxK6BYPBNPHwMufT): test runs 9, module lines 3446
