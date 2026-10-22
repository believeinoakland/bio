# roster-reader (T51)

**Status** · session_01JskisLomG4e5FjS7cp5cNH · depth 2 · WORKING · handled B3

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

## Completion again (T51, B3 CHANGE, K3962)

**Applied.** The test copies of product sentences are now compared with `localize(id, en[, vars])`, or with the exact value that `localize` gives, never with a sentence's text or a regular expression on it. The two copies the check named (`source.test.mjs`: the level text, and the no-column refusal) are converted, and so are the other copies of localized sentences in `roster-reader.test.mjs` and `source.test.mjs` that the same rule covers, including the regular-expression ones. Assertions now test exact strings (for example the `pairs_why` for a chart with no stated relation, the `dated events` and `contact point` refusals with their counts). In `source.mjs`, the held-table "no date" sentence (previously plain code text) is now a `localize` call, so its test compares with `localize` too.

Test titles and comments that mention a sentence's words are not copies a test asserts, and are unchanged.

**Deferred.** None.

**Reported earlier (B2 REPORT, still open).** `lines.mjs:24` (NOT_NAME_WORDS) and `lines.mjs:40` (UNIT_WORDS): recognition vocabulary, no member reads them; for the design's unkeyed list (K3944). They are the only words findings left in this module.

**Found in another module.** `node bio-plane/src/setup-words/build.mjs --check` exits 1 with one message: `jurisdictions.index.amount_is_amount_and_units holds a formatted argument ({name, …}); word and localize do not render these yet (R18)`. It names jurisdictions, not roster-reader; it is BOB's to settle.

**Checks run**
- `node --test roster-reader/test/`: `tests 22, pass 22, fail 0`.
- `node checks/words.mjs /home/user/bio roster-reader`: `961 string literals read … inline 2, plain 2, testcopy 0, … 2 failures` (the two REPORTed lists only).
- `node bio-plane/src/setup-words/build.mjs --check`: exit 1, the jurisdictions message above; nothing in roster-reader.
- `node checks/format.mjs /home/user/bio`: `174 modules, 173 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio roster-reader`: `15 product files, 39 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs /home/user/bio roster-reader`: `1 modules, 12 of 12 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio roster-reader tranche/T51 job/T51/roster-reader`: `0 files changed by roster-reader between tranche/T51 and job/T51/roster-reader; 0 failures` (run before this commit; the ownership count reads committed changes).

Size (session_01PVypQMNUHxqcGtP1kD7qN2): test runs 3, module lines 965

## J4 · COMPLETE

B3 done: test copies of product sentences compare with localize(id, en) or the exact localized value, not sentence text or a regex on it (the two testcopy findings, and the other copies of localized sentences in the module's tests). source.mjs's held-table no-date sentence is now localized so its test uses localize too. Module tests 22/22; words: testcopy 0, only the two REPORTed lists (J2) remain; format, architecture, coverage (12/12) pass; ownership passes. Outside this module: setup-words build.mjs --check exits 1 on jurisdictions.index.amount_is_amount_and_units (R18), not roster-reader's. Record: build/jobs/T51/roster-reader.md.
