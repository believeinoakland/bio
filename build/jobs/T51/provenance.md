# provenance (T51)

**Status** · session_013AJsWwtb6GMtSPg9NTJgff · depth 2 · COMPLETE · handled B9

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

## J8 · COMPLETE

B6 applied: captureGrades(shas), one read per batch, same answers as captureGrade. Requirement line R71 proposed in my record (J7). Provenance suite 155 pass; direct users pass; checks clean. See record.

## J9 · COMPLETE

R72 applied (F3, D1) on job/T51/provenance (commit 9e5f6cf7f1, tranche/T51 merged after it).

**Root cause** (audit F3): `screens-intake/capture.mjs:134-139` registers a multipart capture's parts only, so `register` held no row for the whole sha and `homeOf(whole)` (`provenance/index.mjs` homeOf) answered null for every caller keyed by the whole.

**Why tests missed it**: suites register one row per capture; none built the parts-only register the screen builds. Gap fix: `whole-identity.test.mjs` builds the capture as the screen does (blob parts, parts-only register list, provenance.json stating `parts` beside the whole sha) through the real `promote`.

**What changed**
- `schema.mjs`: `register.whole INTEGER NOT NULL DEFAULT 0` (create and additive migration; old rows 0).
- `index.mjs`: `wholesOf`/`wholesOfFiles` (read the promoted `data/provenance.json`: capture.sha256 beside non-empty `parts`, every part 64-hex; path = the document's `file`, bytes = stated size else parts' sum); `#project` writes the whole's row via `#putWhole` after the parts' rows (parts' rows unchanged; revision keeps `registered`, moves `last_registered`, as R1); `#testimonyFence` adds the whole sha to the one-home check (C-53.13); `migrate()` runs `#repairWholes` at every wake: for each bundle whose data/provenance.json states parts, inserts the missing whole row with the parts' first registration as its instants; never moves a row another existing bundle holds; replaces a row whose home is gone; idempotent.
- `register.test.mjs`: R1's exact row now includes `whole: 0`.

**Failing-first**: `test/m/provenance/whole-identity.test.mjs`, 8 tests, all 8 red before (main one: `homeOf(whole)` null after the real promotion; the rest `no such column: whole`), all 8 green after: the 20 MiB three-part fixture resolves by `homeOf` and by the register's whole row, parts' rows unchanged; verification unchanged (`partsNamed` identical, `registerAudit` sound, whole row `held_in_parts`, a missing part still named); single-part and malformed `parts` control: no whole row; revision; second record with the same whole refused CAPTURE_HELD_BY_ANOTHER_BUNDLE, nothing written; repair on a bundle promoted before (row deleted to simulate), second wake changes nothing; repair leaves a row held by another record; repair re-registers an orphaned row.

**Suites**: provenance 164 pass, 0 fail (with mk6). Direct users (64 modules using provenance), after merging tranche/T51: all pass except reds also on the tranche tip, unrelated to the register: file-safety R24 (rows table), plane R24 (words "this instance"), extraction R82 R22 seam (named-red, needs reading-pipeline R37), plane `migrate-released.test.mjs` (system test, timed out at ~20 min; not rerun). acquisition's wording test failed on my first run and passes after merging the tip. store-door R17 failed once and passes after the merge.
**Checks**: format 0; architecture provenance 0; coverage provenance 57 of 57, 0; words 0 in provenance (whole run: words count 0 failures); ownership 5 files, 0 failures. `checks/run.mjs` total reds are other modules' (tasks architecture import, ooxml R35, pdf-reader R42), none in provenance.

**Platform check (rule 4)**: not applicable: one SQL upsert per multipart document at promotion; the repair scans `files` rows of `data/provenance.json` containing `"parts"` once per wake (like the existing per-boot respell).

**Requirement lines for BOB to write**
- R72 met (drop "not yet met"): as written, plus: the row's `path` is the file the document names for the whole (the bundle does not hold it), `bytes` the document's stated size else the parts' sum, `registered`/`last_registered` the promotion's clock; the repair back-fills at every wake from the bundle's own data/provenance.json, taking the parts' first registration as its instants; one capture, one home also refuses a whole held by another existing record (C-53.13).
- R48: add `register.whole` to the read contract (1 = the whole of a capture held in parts; a reader wanting files at `path` skips `whole = 1` rows). Note `registeredFor(bundle)` (R11) and `capturesOf` now include the whole row.

**Seam note for the verification worker (after merge)**: readers of `registeredFor`/`register` by bundle (ratification `gateFacts`, corpus-export, case-carriage) now see a row whose `path` is not a file of the bundle; ratification's D-556 route already handles a whole-hash row held in parts. Their tests passed; the real-chain fixture should confirm.

Deferred: none. Open QUESTION: none.
Size (session_01WPxSEtH41UFFdxzG3nBaLz): test runs 14, module lines 3193

## J10 · COMPLETE

Fix round 9 (B9): G127a, G127c, G127d (`partsOf`), G127e. Commits on job/T51/provenance (tranche/T51 merged first, never rebased). R74-R79 and edited R41, R72, R73 are met by the tests below (BOB drops the "not yet met" marks). No file created outside my paths.

**(1) Root cause.** Before this change `screens-intake/capture.mjs` sent a part as a `register` row and `schema.mjs:13` made `register.capture_sha` the key of every row, so a part sat in a document's key space; the fence in `index.mjs` (`shas`, was :1719-1729) refused a part another bundle held, and `#project` (was :629-646) would have moved its row. **(2) Why tests missed it:** every fixture held one document per digest; none shared a part. Gap fixed by `parts-key.test.mjs` (two bundles sharing a part). **(4) Platform:** N (SQL only; one upsert per multipart document at promotion; the repair scans `files` once per wake, like R72's).

**What changed.** `schema.mjs`: table `register_parts(bundle_id, whole_sha, idx, part_sha, bytes, path)` with indexes. `index.mjs`: `foldRegister` folds a promotion's `register` to wholes (R75 `parts`; R77 old shape: a row whose digest is a file's `blobSha` and whose path is `<name>.partNNN` joins the whole row `<name>`, ordered by number; a digest the package's own provenance.json states as a capture's is a whole); `#check` refuses a part with no whole `REGISTER_PART_WITHOUT_WHOLE`, a malformed part digest `REGISTER_PART_MALFORMED`, a bad part size `REGISTER_BYTES_UNSTATED` naming the part (the first two carry no catalogue row, like `NO_SUCH_BUNDLE`; their sentences go through `localize`); the one-home fence is over wholes and answers `kind: "whole"`; `#project` writes wholes and replaces only its own bundle's `register_parts`; `partsOf(sha)` (R78); `repairParts()` `{moved, left}` run by `migrate()` at every wake (R79, subsumes R72's back-fill); `registeredFor` answers wholes with `parts` (`part_of` retired); `capturesOf` over wholes; `register_parts` declared to purge; `PROVENANCE_TABLES` gains it.

**Failing first.** `test/m/provenance/parts-key.test.mjs`, 9 tests (R74, R75 x2, R76, R77 x2, R78, R79 x2): first run `ℹ pass 0 ℹ fail 9`; after: `ℹ pass 9 ℹ fail 0`. Old tests rewritten to the new shape: whole-identity, whole-rows, register (R11, R41), seam (R41).

**Tests/checks.** provenance folder plus the three listed files: 181 pass, 0 fail. format 0 failures; architecture 0; coverage 64 of 64; words 0; ownership 8 files, 0 failures; setup-words --check: stale-rows note on a doc-clean id only. Users run on my branch: acquisition 276/0, capture 294/0, case-carriage 100/0, extraction 323/5 (G40/G41 reading pins, no register), retrieval-browse 57/4, case-authoring 254/2, corpus-export 31/4, case-disclosures 111/4, file-safety 2 failures (size-bound tests); ratification and content runs stopped unfinished. The extraction and file-safety failures were not compared against the tranche tip.

**Found in other modules (REPORT to BOB):** their fixtures build the old parts-only register, which R77 now refuses `REGISTER_PART_WITHOUT_WHOLE`, or read `part_of`: retrieval-browse `whole-rows.test.mjs` R19 (4), case-disclosures `whole-rows.test.mjs` R34 (4), case-authoring `whole-rows.test.mjs` R84 (2), corpus-export R13 (4). Each must send the whole row with `parts` (R75) and read `registeredFor`'s `parts`. extraction's `#wholeOfPart` and r81 (pins NO_HOME) and acquisition's `readRange` move to `partsOf`/`homeOf(whole)`. Control-plane's K4833 seam section turns green with screens-intake's change.

**For BOB's requirement text:** R48: add `register_parts` to the read contract; `registeredFor` rows carry `parts` on a whole, no `part_of`. `migrate()` still answers `{ok:true}`; the counts are `repairParts()`'s.

Deferred: none. Open QUESTION: none.
Size (session_01PLcYEHrnJ6MSU2YWXJwvkm): test runs 12, module lines 3279

## J11 · COMPLETE

B9 applied (G127a/c/d/e): register key is the whole; register_parts; partsOf; repairParts; R74-R79 met, 9 new tests red then green; provenance 181 pass; checks clean. Other modules' fixtures on the old parts-only register now fail (retrieval-browse, case-disclosures, case-authoring, corpus-export): see J10.

## Fix round 10, Wave A batch 1 (B10): work

**Published** in `bio-plane/test/m/provenance/fixtures.mjs` (new), each made by provenance's real code at test time, none stored, each called by `fixtures.test.mjs` (10 tests, all comparing the real answer): `heldParts(wholeSha, parts)` → `{provenance, partsOf}`; `holdsOf({sha, registered, acquired, bundle})` (and `holdsWorld(states)`); `holdsRegister({registered, acquired})` → `{provenance, registerHolds, registeredFor, containerResolver}`; `homeOf({capture, bundleId, registered})`; `homeOfEmpty()`; `homeOfHomed({sha: bundleId})`; `homeOfWorld({sha, bundleId})` → `{provenance:{homeOf}, calls(), real}`; `provenanceOver({host, record, membership, promotion, now})`; `registeredHomes(own?)` → `{provenance, register(sha, {bundleId,path,bytes,encoding}), many(bundleId, captures), promotion, world}` (takes the user's own `{host, record, membership, promotion, now}`); `versionChainNoSuchVersion({addressNorm, at, viewer})`.
**Marker added** (1): `testimony-slot.test.mjs:105` `// fixtures-generic: CONTENT_EXTENT_REFUSED` — the refusal is a stand-in row the test hands the slot to show the slot relays any refusal as it came; it is no answer of `content`.
**Lines**: provenance lines in `checks/fixtures.mjs . provenance --list` are zero (the one finding is now `accepted(generic)`). Wave B / waiting / stay lines: none.
**Tests/checks**: provenance folder + mk6: 189 pass, 0 fail. format 0 failures; architecture 0; coverage 64 of 64; ownership 1 file (the marker) + the new fixtures files within my tests path, 0 failures; setup-words --check clean; `impact.mjs origin/tranche/T51 HEAD`: 0 modules, 0 test files affected (new files and a comment only), so no users' tests to run.
Deferred: none. Open QUESTION: none.
Size (session_013AJsWwtb6GMtSPg9NTJgff): test runs 4, module lines 3280
