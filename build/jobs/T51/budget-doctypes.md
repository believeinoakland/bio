# budget-doctypes (T51)

**Status** · session_01RezKKmfnBViKhH5MtBRmm8 · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

T51-164 (words, layer 1): done.

**Entries applied.** T51-164: the one words finding, `budget-doctypes/test/budget-doctypes.test.mjs:90` (testcopy: the ACFR title, a copy of `screen.glossary.money.acfr`), fixed. The R1 not-a-PDF case (line 88) no longer carries a title, since that refusal fires before any title check. The floor case reads the test profile's own title ("Statement of Accounts") through the test view, so it still tests the floor. Commit 428bc86bdf on job/T51/budget-doctypes.

**Deferred.** None.

**Found in another module.** None in this job. The tree-wide words check (run from the process repo, `checks/run.mjs`) still reports 2,820 failures in other modules (for example case-disclosures, case-grammar, wizard-scripts, skills, legacy-ui). Those are outside this module's paths and were not touched.

**Checks and tests (summary lines):**
- module tests `node --test budget-doctypes/test/`: 27 pass, 0 fail.
- `checks/format.mjs` (via run.mjs): 174 modules, 173 requirements files; 0 failures.
- `checks/architecture.mjs` (via run.mjs): 3,585 product files, 11,860 relative imports; 0 failures.
- `checks/coverage.mjs budget-doctypes`: 14 of 14 live requirement ids named by a test; 0 failures.
- `checks/words.mjs` (via run.mjs): no finding names budget-doctypes.
- `checks/ownership.mjs budget-doctypes tranche/T51 job/T51/budget-doctypes`: 1 file changed; 0 failures.

Size (session_01RezKKmfnBViKhH5MtBRmm8): test runs 5, module lines 1069
