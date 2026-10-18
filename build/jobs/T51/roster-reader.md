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
