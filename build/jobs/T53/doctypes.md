# doctypes (T53)

**Status** · session_018Bhcecc4twXKUaZ83a4k6m · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# doctypes · T53 R1 · report

## Entries applied
- T53-48 (K5565, English in tests): partly applied.
  - Literal sites: all 10 converted to `word(key)` (words check's missingkey arm passes after PR #20, K5582).
  - Prose regex sites: `policy` cleared; `no_outline` and `sections.unplaced` converted to word equality.
  - Left for a later pass: 6 regex sites (doctypes.test.mjs overdue/`carries no number` lines; regulation-sections.test.mjs structural regexes). Recorded at the ratchet, not hidden.
  - Not converted: the B site "Residential Rent Adjustment Board" (regulation-sections, `all.includes`), which is a test-corpus term, not yet checked for a key.

## Not done and why
- The 6 residual regex sites: each needs its key's placeholders filled from the test's own values; not yet done.

## Found in other modules
- None.

## Tests
- `node --test --test-force-exit doctypes/test/*.test.mjs`: 80 pass, 0 fail.
- `checks/words.mjs . doctypes`: 0 failures.

**Met** · none

Tests: 80/80. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcecc4twXKUaZ83a4k6m): test runs 1, module lines 27053

## Completion (2026-10-28)

# doctypes · T53 R1 · report (round 2)

## Entries applied
- T53-48 (K5565, English in tests): applied except 2 sites.
  - Literal sites: all 10 converted to `word(key)`.
  - Sentence regexes converted to key assertions: policy, sections.unplaced, sections.not_divided, regulation.section_gone, regulation.proposed_no_number, meeting-calendar.overdue, meeting-calendar.due_unknown with period_not_counted_here and civil-time.calendar.uncovered_office.
  - Left: regulation-sections.test.mjs lines 45 and 49 (`/section heading/` on detect signals). The signal is `doctypes.regulation.code_headings` ("{count} section heading(s) of {label}"); its count and label are not known to the test, so no key assertion is written.
  - Structural regexes (`/defin|except/`, URLs, `/^Adopt Bylaw No\. 2041/`) are data, kept as C.
  - "Residential Rent Adjustment Board" is a profile/corpus term (C), kept.
- Words baseline NOT lowered (ownership check; BOB prunes it). Current counts: regulation-sections 2, doctypes.test 0, policy 0.

## Tests
- `node --test --test-force-exit doctypes/test/*.test.mjs`: 80 pass, 0 fail.
- `checks/words.mjs . doctypes`: 0 failures.

**Met** · none

Tests: 80/80. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcecc4twXKUaZ83a4k6m): test runs 2, module lines 27053

## Completion (2026-10-28)

# doctypes · T53 R1 · report (round 3)

## Entries applied
- T53-48 (K5565, English in tests): applied in full.
  - Literal sites (10): `word(key)`.
  - Sentence regexes: converted to key assertions, including the two heading-signal sites (regulation-sections R9): `word("doctypes.regulation.code_headings", { count, label })` with count and label from `codeHeadingsIn(c.text, { view: CODE_VIEW })`. The no-forms case asserts the reader finds no heading (count 0).
  - Structural regexes and data (`/defin|except/`, URLs, `Adopt Bylaw No. 2041`, "Residential Rent Adjustment Board") stay as C.
- Words baseline not lowered: the file belongs to no module path; BOB prunes it. The current `--baseline` output for doctypes is empty (no English-in-test sites).

## Tests
- `node --test --test-force-exit doctypes/test/*.test.mjs`: 80 pass, 0 fail.
- `checks/words.mjs . doctypes`: 0 failures, testenglish 0.

**Met** · none

Tests: 80/80. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcecc4twXKUaZ83a4k6m): test runs 3, module lines 27055
