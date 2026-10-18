# roster-reader (T51)

**Status** · session_01PVypQMNUHxqcGtP1kD7qN2 · depth 2 · COMPLETE · handled B1

## Completion (T51-172, B1 START)

**Applied.** T51-172, the two words findings from `build/plan/words-pass/roster-reader.md`, fixed by the words rule:
- `roster-reader/org-chart.mjs` (the unlabelled-line refusal in `detect`): the sentence built from a template literal is now one `localize("roster-reader.org-chart.labelled_line_s_name_a", …)` with named variables.
- `roster-reader/org-chart.mjs` (`parse` → `pairs_why`): the `{v1}` prefix stitched onto one sentence is replaced by two keyed sentences, one for a stated relation (`reporting_relation_s_stated_in_words`) and one for none (`no_reporting_relation_is_stated`). Both carry the same wording as before, so the existing assertions hold.

No requirement, public or private, changed. No test copies a sentence: the tests were not edited.

**Deferred.** None.

**Found in another module.** None in code. `checks/run.mjs` shows whole-repository words failures (`testcopy` in `wizard-scripts`, and other `inline`/`unkeyed` findings) outside roster-reader; none names roster-reader. Those are inherited reds, not this module's, and are left for BOB.

**Checks run**
- `node checks/run.mjs /home/user/bio` (civicos-process): `format: 174 modules, 173 requirements files; 0 failures`; `architecture: 3585 product files, 11860 relative imports …; 0 failures`; `coverage: 173 modules, 5914 of 6048 live requirement ids named by a test; 33 failures` (none in roster-reader); `words: … 2819 failures` (none in roster-reader; roster-reader's two findings now read zero).
- `node checks/format.mjs /home/user/bio`: `0 failures`.
- `node checks/architecture.mjs /home/user/bio roster-reader`: `15 product files, 37 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs /home/user/bio roster-reader`: `1 modules, 12 of 12 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio roster-reader tranche/T51 job/T51/roster-reader`: `1 files changed by roster-reader between tranche/T51 and job/T51/roster-reader; 0 failures`.
- `node --test roster-reader/test/` (module tests): `tests 22, pass 22, fail 0`.

Size (session_01PVypQMNUHxqcGtP1kD7qN2): test runs 1, module lines 963

## J1 · COMPLETE

T51-172 done. The two words findings in roster-reader/org-chart.mjs are fixed by keyed localize calls (the unlabelled-line refusal in detect; pairs_why split into two keys, same wording). Module tests 22/22 pass; format, architecture, coverage (12/12) and ownership pass for roster-reader; the words check shows no finding in roster-reader. Whole-repo words/coverage reds are outside this module and are not mine. Record: build/jobs/T51/roster-reader.md (commit 5937ed1f34). Note: I left out the Co-Authored-By model line from the commit, since the system rules bar model identifiers in commits.

## J2 · REPORT

B2 (K3957) plain findings: 38 judged. 36 are sentences a member reads (why-reasons, labels, level text) and are now localize('roster-reader.<stem>.<slug>', en) with the same wording; their tests still pass unchanged. Two are not sentences and no member reads them: roster-reader/lines.mjs:24 (NOT_NAME_WORDS, the closed list of function words and unit/office kinds that stop a name span) and roster-reader/lines.mjs:40 (UNIT_WORDS, the kinds of unit a line can name). Both are this module's own recognition vocabulary (place-free English, read as a set, never shown), so they belong on the design's unkeyed list (K3944), not in a localized row. Each remaining finding in the words check is one of those two.

## Completion again (T51, B2 CHANGE, K3957)

**Applied.** The 38 plain findings in `build/plan/words-pass/roster-reader.md` are judged. 36 are sentences a member reads (why-reasons, the staff-roster label, the level text) and each is now a `localize('roster-reader.<file stem>.<slug>', en[, vars])` call with its wording unchanged, in `columns.mjs`, `directory-refs.mjs`, `lines.mjs` (one line), `org-chart.mjs`, `source.mjs` and `staff-roster.mjs`. Tests compare the same text and were not edited.

**Reported (REPORT, B2).** `lines.mjs:24` (NOT_NAME_WORDS) and `lines.mjs:40` (UNIT_WORDS) are recognition vocabulary, not sentences; no member reads them. They go to BOB for the design's unkeyed list (K3944). They are the only findings the words check still shows for this module.

**Deferred.** None.

**Found in another module.** None. The repository-wide `checks/run.mjs` words failures are other modules' and are not changed here.

**Checks run (after the change, module tests and checks)**
- `node --test roster-reader/test/`: `tests 22, pass 22, fail 0`.
- `node checks/words.mjs /home/user/bio roster-reader`: `891 string literals read … inline 2, plain 2, testcopy 0, … 2 failures` (both are the two REPORTed vocabulary lists).
- `node checks/format.mjs /home/user/bio`: `174 modules, 173 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio roster-reader`: `15 product files, 38 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs /home/user/bio roster-reader`: `1 modules, 12 of 12 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio roster-reader tranche/T51 job/T51/roster-reader`: `6 files changed by roster-reader between tranche/T51 and job/T51/roster-reader; 0 failures`.
- `node checks/run.mjs /home/user/bio` (civicos-process 27aa50e): `format … 0 failures`; `architecture … 0 failures`; roster-reader appears only in the two REPORTed `words` lines; the repository-wide `coverage` (33) and `words` failures are other modules'.

Size (session_01PVypQMNUHxqcGtP1kD7qN2): test runs 2, module lines 965

## J3 · COMPLETE

B2 done: the 38 plain findings are judged (36 localized with the same wording; lines.mjs:24 and :40, the recognition vocabulary lists, REPORTed for the unkeyed list). Module tests 22/22; format, architecture, coverage (12/12) and ownership pass; the words check shows only the two REPORTed findings in roster-reader. Record: build/jobs/T51/roster-reader.md.
