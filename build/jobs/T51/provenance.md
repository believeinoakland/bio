# provenance (T51)

**Status** · session_01PGsKtVkrKE46i1fEEmd3sp · depth 2 · WORKING · handled B2

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
