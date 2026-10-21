# provenance (T51)

**Status** · session_01PGsKtVkrKE46i1fEEmd3sp · depth 2 · WORKING · handled B5

## J1 · REPORT

Findings in other modules, seen while running `checks/run.mjs` on tranche T51 with my commit c9df90b413 (not fixed here: another module's to change, P9).

- provenance-routes (src and tests; the module is not mine): 14 `plain` findings in `bio-plane/src/provenance-routes/index.mjs` (:56–59, :382, :385, :462, :479, :526, :745, :749, :970). Its test copies of its own `localize` sentence: `bio-plane/test/m/provenance-routes/audit.test.mjs` :78–81 [code], `chain.test.mjs:162` and `rebuild.test.mjs:223` (the sentence "these bytes were received for upload:" from `provenance-routes/index.mjs:178`), `marked.test.mjs` :27–28 [part].
- strength: `bio-plane/test/m/strength/version.test.mjs:293` testcopy [code].
- case-carriage: `bio-plane/src/case-carriage/index.mjs:1190` plain. case-checker: `bio-plane/src/case-checker/check.mjs:537` plain.
- Inherited, not mine: the run's other arms (wizard-scripts, case-grammar, reading-guides and others) and coverage reds in other modules (affordances, installer, screens-*, and others). The `checks/run.mjs` total: 4115 failures, none in provenance.

Provenance's own words findings are all fixed (T51-184): none remains in `checks/words.mjs` for `provenance`.

## J2 · COMPLETE

T51-184 (words) applied. Commit c9df90b413 on job/T51/provenance (tranche/T51 merged at f92ccc779d, plan rules unchanged).

Entries applied:
- The 9 `testcopy` findings in `build/plan/words-pass/provenance.md`: register-checks.test.mjs (pulled-knock fixture asserts and bytes, the `bytes` in the R42/R51 write test), seam.test.mjs (RECEIPT_MALFORMED and RECEIPT_NO_KEY translations now compared with `word("refusal.…")`), upload.test.mjs (R51/R63 `why` compared whole with `word("provenance.why.bytes_fetched_address", …)`, the authority basis with `word("capture.authority_basis", …)`, the fixture's asserts reworded).
- The 1 `plain` finding: index.mjs capture-axis `why` is one `localize("provenance.index.capture_axis_authored", …)` with the same English.
- The 2 `code` test copies (K3962): register-checks and upload fixtures, fixed in this module's own tests.
- No sentence held in a test's text, no `rows.mjs` or `words-unreviewed.json` edited.

Deferred: none.

Found in another module (REPORT posted, not changed here): provenance-routes plain findings and test copies, plus strength, case-carriage, case-checker and the inherited reds. Details in the REPORT.

Tests:
- `node --test bio-plane/test/m/provenance/*.test.mjs`: 134 pass, 0 fail.
- `node --test bio-plane/test/mk6-bundle-names-no-author.test.mjs bio-plane/test/publishingproject.mjs bio-plane/test/adoptable-reading.mjs`: 3 pass, 0 fail.

Checks (from civicos-process):
- `format.mjs /home/user/bio`: 175 modules, 0 failures.
- `architecture.mjs /home/user/bio provenance`: 27 product files, 0 failures.
- `coverage.mjs /home/user/bio provenance`: 48 of 48 live ids named by a test, 0 failures.
- `ownership.mjs /home/user/bio provenance tranche/T51 job/T51/provenance`: 5 files, 0 failures.
- `run.mjs /home/user/bio`: format 0 and architecture 0; no words finding in provenance (the 4115 failures are all in other modules).
- `setup-words/build.mjs --check`: the stale-rows note names `provenance.index.capture_axis_authored` (expected; BOB regenerates rows.mjs at the layer close). No refusal naming provenance.

Size (session_01RpNUgdyt5VkXqp8Ksfx3zR): test runs 2, module lines 2819

## J3 · COMPLETE

CHANGE B2 (K3985) applied. Merged tranche/T51 (never rebased); commit on job/T51/provenance after c9df90b413.

- register-checks.test.mjs: the knock fixture's evidence is now `knock receipt <id>: digest and instant`; its capture.method is the neutral token `knock-received-fixture` (was the owner's sentence).
- upload.test.mjs: the upload fixture's evidence is `upload receipt <sha>: digest and instant`; the method assertion uses the same neutral token, so the refusal check still names the value.

Checks, run from civicos-process after this commit:
- `checks/words.mjs` on the whole product (`run.mjs`): no finding in provenance. The module-only words run reads 0 failures; the remaining findings are in other modules (strength, case-carriage, case-checker, provenance-routes, already reported in J1).
- Module tests `node --test bio-plane/test/m/provenance/*.test.mjs`: 134 pass, 0 fail. The three other listed tests: 3 pass, 0 fail.
- `format` 0 failures; `architecture` (module) 0; `coverage` provenance 48 of 48 live ids; `ownership` provenance: 2 files, 0 failures.
- `setup-words --check`: stale-rows note only (expected).

Deferred: none.

Size (session_01RpNUgdyt5VkXqp8Ksfx3zR): test runs 4, module lines 2819

## J4 · QUESTION

Q1 (requirements file). Your START says to write each NEW R64–R67 (and the DECLARED_OPS line) first in build/requirements/provenance.md, but ownership.mjs fails any job diff that touches a file outside the module's paths, tests and record (build/requirements/provenance.md is none of them), and JOB.md says BOB updates requirements first. My best reading, which I am carrying on with: I do NOT edit the requirements file. I take the ids R64 (declareorigin), R65–R67 (declareAuthority, authorityOf, AI only proposes; text from the draft §4.3), R68 (DECLARED_OPS: testify, declareorigin) and R69 (the K4202 census: testify) as numbered, name them in my tests, and put each line's text in my record for you to land on tranche/T51 (marked not yet met: T51). If you would rather I edit the file and accept an ownership failure on it, say so. Q2 (fyi, no answer needed unless you disagree): C-18.9 reads a decision through the resolver (containerResolver().authority), so ratification's withRegisterChecks calls (ratification/index.mjs:1393, ops.mjs:511) must pass provenance's containerResolver() for the ratify gate to see a decision; that is ratification's change, I will report it.

## J5 · COMPLETE

FR-10 (provenance, T51) complete on job/T51/provenance at 98ef98eab4 (tranche/T51 merged at the restart, 95a1be260b). Answers B3 (START) and B4 (ANSWER to J4): the requirement lines are written in `build/requirements/provenance.md` (the ownership check lists that one file, accepted per B4).

**Entries applied**
1. C23 · R64: `provenanceOps` serves `declareorigin {bundleId, system}` (body, else query; `author` and `viewer` the stamps). Refusals are R29's. Test: `ops.test.mjs` (R64, two tests).
2. C62 · R65–R67: `declareAuthority({bundle, capture, outcome, authority?, basis, by, viewer})` and `authorityOf(bundle, capture)` (table `authority_decisions`, dated, append-only, the latest standing; the register's acquisition-time value the first history entry). Five new refusal rows C-103.8 to C-103.12 (`AUTHORITY_NOT_A_MEMBER`, `_NOT_A_DOCUMENT`, `_NO_BASIS`, `_NO_ISSUER`, `_OUTCOME_UNKNOWN`), words by `localize`. `containerResolver().authority(sha)` carries the standing decision, and C-18.9 (R46) reads state, issuer and basis from it before the document's own. A machine/AI identity is refused by name and writes nothing. Tests: `authority.test.mjs` (9).
3. K4168 · R68: `DECLARED_OPS` in `provenance/ops.mjs`: `testify` and `declareorigin`. Test: `declared-ops.test.mjs` through test-support's `declaredOpHolds`.
4. K4202 · R69 (the census, `testify`): its row copies the existing hand rows (classes admin, member; mutating; weight reasoned; the NON_ACTS sentence); `accepts` words, observedAt, title; `requires` words, observedAt. A body naming an author is a claim refused `TESTIMONY_AUTHOR_SUPPLIED`, not a field (control in the same test).

Requirement lines: R64–R69 new, R53 (seven ops), R41 (`authority_decisions`) and R58 (C-103.8–.12) amended. R64–R69 are named by passing tests, so I removed their "not yet met: T51" marks; restore them if you want them held until the merge.

**Existing tests I changed (each only to state the new truth, none weakened):** `ops.test.mjs` R53 (seven arms; `DECLARED_OPS` among the exports), `register.test.mjs` R41 and `seam.test.mjs` R41/R58 (`PROVENANCE_TABLES` and the C-103 list gain the new table and rows).

**Deferred:** none.

**Hand rows that can now go (another module's, not edited):**
- `op-declarations`: the `testify` spec (index.mjs:1111; its entries in the act lists at :2292 and :2403 stay for the lists) once the plane registers provenance's `DECLARED_OPS`.
- `op-grades`: `testify` in RUNGS (:551) and its NON_ACTS sentence (:1026); the MARKS row `declareorigin` (marks.mjs:70), which is rungless only until `declareorigin` is declared.
- `declareorigin` has no hand row in either module, so its whole declaration (classes admin, member; mutating; `stamps` viewer, author; `needs` contribute; weight reversible per the kit mark; description by key `provenance.declared.declareorigin`) is mine. Choice made without a hand row: no `machineClasses` (as `testify`, the module refuses a machine by name rather than the door).

**Found in other modules (P9), to be done by their owners**
- `ratification`: its `withRegisterChecks` calls (ratification/index.mjs:1393, ops.mjs:511) pass no resolver, so the ratify gate reads a document's own authority, not a decision. They must pass `provenance.containerResolver()` for the gate to see a decision (J4 Q2; R66).
- `plane` / `control-plane`: `declareorigin` is served only once the composition registers provenance's `DECLARED_OPS` with `registerDeclaredOps` (op-declarations R80) so the door stamps `author` and `viewer` from `OP_STAMPS` and knows the op; I find no such registration for any owner yet in `src/plane` or `src/control-plane`.
- `case-disclosures` R4 and `tasks` (`taskdecide`, R20) are to ask `authorityOf` and call `declareAuthority`; C-18.1 (R42) keeps judging the document's own register shape, deliberately.
- Not mine, not caused here: test-time failures about `expertisewithdraw` in `op-declarations` R73/R21, `op-grades` R42 and R46 (member-roster's op, absent from the marks and the declared set).

**Tests and checks**
- `node --test bio-plane/test/m/provenance/*.test.mjs`: 149 pass, 0 fail (was 134 at the last job; 15 new).
- `node --test bio-plane/test/mk6-bundle-names-no-author.test.mjs bio-plane/test/publishingproject.mjs bio-plane/test/adoptable-reading.mjs`: 3 pass, 0 fail.
- New tests seen failing without the code (13 fail, 4 pass with `src/provenance` stashed), then pass with it.
- Wave-1 readers: `test/m/test-support`, `op-declarations`, `op-grades`: 438 of 441 pass; the 3 failures are the `expertisewithdraw` ones above. `interface-shell/declared.test.mjs`: 7 pass ("declared 180 of 299 ops").
- `checks/format.mjs /home/user/bio`: 175 modules, 0 failures. `checks/architecture.mjs /home/user/bio provenance`: 27 product files, 0 failures. `checks/coverage.mjs /home/user/bio provenance`: 54 of 54 live ids named by a test, 0 failures.
- `checks/run.mjs /home/user/bio`: format 0, architecture 0; words show 0 findings for provenance (inline 0, plain 0, testcopy 0 for my module; the 7 testcopy failures are in `op-grades`' tests); coverage failures are in other modules (agent-harness, agent-runner, citation, installer-steps, journey-check, link-sweep, monitoring).
- `checks/ownership.mjs /home/user/bio provenance tranche/T51 job/T51/provenance`: 12 files, 1 failure: `build/requirements/provenance.md`, the file B4 accepts.
- `setup-words/build.mjs --check`: the stale-rows note only (BOB regenerates `rows.mjs`); new ids: `provenance.checks.*` (5), `provenance.index.*` (5), `provenance.declared.testify`, `provenance.declared.declareorigin`.

Size (session_01QcdtgzU4W4MpK8weg47ZqT): test runs 12, module lines 2987

## Work log · CHANGE B5 (K4259), session_01SJghwe9gJrhumMZWa29ifY (restart; started at B5)

Applied: the read op `origins {bundleId}` (requirement R70, new; R53 and R68 amended in `build/requirements/provenance.md`, the one file outside my paths, accepted per B4 as in J5). `provenanceOps` serves `origins` through the new `originsOf({bundleId, viewer})`: every declaration `{seq, system, by, at}` in `seq` order, `origins: []` when none; refusals `NO_BUNDLE`, `NO_SUCH_BUNDLE` (absent and unseen alike, nothing of an unseen document read out), `ORIGIN_NOT_A_DOCUMENT`. `DECLARED_OPS.origins`: classes admin, member; mutating false; weight `read`; stamps `viewer`; needs null; accepts and requires `bundleId`.
Tests (written first, seen failing): `ops.test.mjs` R70 (two tests: two declarations read back in order, writes nothing; each refusal, the unseen-as-absent control, the member-reads control); `declared-ops.test.mjs` `declaredOpHolds` for `origins`; R53 and the declared-ops list updated to state the new truth (eight ops; three declared ops).
Flaw in another module (for BOB): `bio-plane/test/m/op-grades/t37.test.mjs:32` is a words `testcopy` (a sentence copied from a `translation-directed` description); it is op-grades', not changed here.
Stale generated artifact: setup-words' `rows.mjs` lacks `provenance.declared.origins` (expected; BOB regenerates at the layer close).

## J6 · COMPLETE

CHANGE B5 (K4259) applied on job/T51/provenance. Requirement lines for you (already written in build/requirements/provenance.md, the one file outside my paths, as accepted at B4; ownership.mjs lists only that file):
- NEW R70: the op `origins {bundleId}` lists a document's declared origins `{seq, system, by, at}` oldest first (standing one last), `origins: []` when none; gated by sight; refusals NO_BUNDLE, NO_SUCH_BUNDLE (absent and unseen alike), ORIGIN_NOT_A_DOCUMENT; writes nothing.
- R53 amended (eight ops) and R68 amended (`origins` in DECLARED_OPS: read, mutating false, stamps viewer, needs null, accepts/requires bundleId).
Tests: provenance suite 152 pass, 0 fail (ops.test.mjs R70 x2, declared-ops.test.mjs). Checks: format 0, architecture 0, coverage 55 of 55, words 0 in provenance, ownership 1 failure = requirements file (accepted, B4). run.mjs: one testcopy, in op-grades t37.test.mjs:32 (not mine; report to op-grades' owner). setup-words rows.mjs stale for provenance.declared.origins (expected, BOB regenerates).
Size (session_01SJghwe9gJrhumMZWa29ifY): test runs 3, module lines 2850

## Work log · START B6 (fix round 2, K4323; C14's bound), PROVENANCE #26 (session_01PGsKtVkrKE46i1fEEmd3sp, restart; cursor kept at B5)

Applied: `captureGrades(captureShas)` in `provenance/index.mjs`: one answer per digest asked, in order, each exactly what `captureGrade` answers. `#grade` now reads a capture's register flag and receipts through one shared statement (`#loadFacts`, `json_each` over the digests, `UNION ALL` of `register` and `captured_locators`), so a batch costs one read, plus one more per level of archive nesting when a digest is a file cut out of an archive whose rows were not asked (R59). `captureGrade` keeps its signature and answers (its old four statements are now one). A non-list answers `[]`; an unknown or malformed digest answers as `captureGrade` does.
Tests (`test/m/provenance/grade-batch.test.mjs`, written against a method that did not exist, so seen failing first): equal answers to per-capture calls over a mixed set (direct, archive, doorbell, upload, unruled, authored testimony, archive and its cut-out file, repeated and `sha256:`/upper-case spellings, unknown); read count 1 per batch (2 with an unasked archive; control: per-capture calls read at least once each); controls for unknown, malformed, empty and non-list input. They are named R71, the id proposed below.
Users run (they call `captureGrade`): acquisition 185, calculations 62, capture 218, case-disclosures 103, connections 146, consequences 69, events 93, filings 157, leg-earning 57, lines 36, money 79, people 79, sources 44, workbooks 29: all pass. `screens-inquiry`: 410 pass, 3 fail (R5/R10 act-label tests), identical with `provenance/index.mjs` as it was at the tranche, so inherited, not mine. The full impact set is 116 of 175 modules by layer position; I ran the direct callers.
Checks: format 0 failures; architecture 0; coverage 55 of 55 live ids; words 0 in provenance (dev 2, unkeyed 87 as before); ownership: see COMPLETE.
Deferred: none. Flaws in other modules: none new. `capture` adopting `captureGrades` is a later CHANGE (B6).

Size (session_01PGsKtVkrKE46i1fEEmd3sp): test runs 14, module lines 3051

## J7 · COMPLETE

B6 applied on job/T51/provenance. Requirement line for you to write (BOB writes `build/requirements/`):
- NEW R71 (T51; K4323, C14's bound): `captureGrades(captureShas)` answers, for each digest asked and in order, the grade `captureGrade` answers for it, reading the record once for the batch (one more read per level of archive nesting when a file cut out of an archive is asked without its archive); a digest the record does not hold, a malformed one, answers as `captureGrade` does; a value that is no list answers `[]`; writes nothing. Test: `grade-batch.test.mjs` (equal answers over a mixed set, one read per batch, controls).
`capture` can adopt `captureGrades` in its held-captures read now (CHANGE to capture when you choose).
Suite: provenance 155 pass, 0 fail. Direct users of `captureGrade` pass; `screens-inquiry` has 3 inherited failures, same without my change. Checks: format, architecture, coverage (55 of 55), words 0 in provenance.
Size (session_01PGsKtVkrKE46i1fEEmd3sp): test runs 14, module lines 3051
