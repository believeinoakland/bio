# budget-doctypes (T51)

**Status** · session_01RezKKmfnBViKhH5MtBRmm8 · depth 2 · COMPLETE · handled B2

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

## J2 · COMPLETE

CHANGE B2 (K3957): done. The twenty plain findings are judged and fixed; none is developer text, so there is no REPORT.

**Merged** tranche/T51 into job/T51/budget-doctypes and updated civicos-process to main at 27aa50e.

**Applied, each through `localize('budget-doctypes.<stem>.<slug>', en, vars)` with its English unchanged:**
- assess.mjs (5): no table or budget line read in either reading; the row fallback label; both "as it was" summaries.
- index.mjs (3): the no-table reason; the header-row signal; the no-header reason.
- lines.mjs (4): no sheet supplied; the sheet's typed-cells reason (a `+` chain made one literal); the no-fund-and-org, no-fund and no-org reasons; plus the no-header reason, a copy of index.mjs's, keyed too.
- tables.mjs (7): the chart-labels reason (a `+` chain made one literal); no label beside figures; no row with two figures; headers not read; no heading or caption; no fiscal-year form; the two pages-unread reasons (a `+` chain made one literal).

**Commits:** f3255dd8cc on job/T51/budget-doctypes (pushed). The earlier R1 test fix is 428bc86bdf.

**Checks (summary lines):**
- module tests `node --test budget-doctypes/test/`: 27 pass, 0 fail.
- `checks/format.mjs` (via run.mjs): 174 modules; 0 failures.
- `checks/architecture.mjs` (via run.mjs): 3,588 product files; 0 failures.
- `checks/coverage.mjs budget-doctypes`: 14 of 14 live requirement ids named by a test; 0 failures.
- `checks/words.mjs` (via run.mjs): no finding names budget-doctypes.
- `checks/ownership.mjs budget-doctypes tranche/T51 job/T51/budget-doctypes`: 4 files changed; 0 failures.

Tree-wide, run.mjs still reports words failures in other modules (4,647 in all after the tranche merge). They are not mine, and I did not touch them.

Size (session_01RezKKmfnBViKhH5MtBRmm8): test runs 9, module lines 1067

## J3 · COMPLETE

CHANGE B3 (K3962, K3965): done. The test copies are converted to localize, and the regex copies of keyed reasons too.

**Merged** tranche/T51 into job/T51/budget-doctypes; civicos-process at ea6cd83.

**Converted (test file only; English unchanged):**
- The flagged copy at line 313 (the row holds no org code) compares with `localize('budget-doctypes.lines.the_row_holds_no_org_code', ...)`; the test imports `localize`.
- Regex assertions that copy a keyed reason now compare with `localize` (18 sites), with their variables given: no header row (index), no fiscal-year form, the modal-share message (values 40, 5, 2, 85, from the fixture), headers not read, no text layer on a cover, chart labels, no OCR transcription, no form of the view's fund and project, the view holds no form, typed cells, no table read (both sites), failed read (the three pairs, now exact), no heading, no sheet.

**Not converted, for BOB to rule:**
- `budget-doctypes.test.mjs` around line 97: the R1 case table matches five regex reasons; three are plain `budget-doctypes` reasons, one is the unkeyed `not a CSV or workbook sheet` string in `index.mjs` (a member-facing sentence not yet keyed; the check does not flag it), and one (floor) needs the line count from the fixture. I left these as regexes.
- Line ~287: the code-form reason's column is not carried on the code object, so the variable cannot be given without reading the fixture's rows; left as a regex.

**Checks (summary lines):**
- module tests `node --test budget-doctypes/test/`: 27 pass, 0 fail.
- `checks/format.mjs` (via run.mjs): 174 modules; 0 failures.
- `checks/architecture.mjs` (via run.mjs): 3,592 product files; 0 failures.
- `checks/coverage.mjs budget-doctypes`: 14 of 14 live requirement ids named by a test; 0 failures.
- `checks/words.mjs` (via run.mjs): no finding names budget-doctypes.
- `bio-plane/src/setup-words/build.mjs --check`: exit 1, one line, about `jurisdictions.index.amount_is_amount_and_units` (a formatted argument that word/localize do not render yet, R18). Not this module's; a REPORT to BOB.
- `checks/ownership.mjs budget-doctypes tranche/T51 job/T51/budget-doctypes`: 1 file changed; 0 failures.

**Commits:** 51550c5447 on job/T51/budget-doctypes (pushed).

Size (session_01RezKKmfnBViKhH5MtBRmm8): test runs 15, module lines 1067
