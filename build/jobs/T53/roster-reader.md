# roster-reader (T53)

**Status** · session_018BhcegL9Z2aotsAHfwYdpm · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# roster-reader · T53 R1 · report

**Entry applied:** T53-50 (K5565), English in tests, for roster-reader.

**Changed**
- `roster-reader/test/roster-reader.test.mjs`
  - staff directory's shape (was /staff directory's shape/): now `localize("roster-reader.staff-roster.atdomain_distinct_addresses_at_one", …, { atDomain })`, the three directories' counts pinned (12, 40, 10); stronger than the old match.
  - organisation title (was a literal "Oakland Workforce Development Board"): now read from the fixture's first line.
  - reporting relation (was /1 reporting relation(s) stated in words/): now `localize("roster-reader.org-chart.reporting_relation_s_stated_in_words", …, { count: "1" })`.
  - fixture note (was /read through the plane/): now `includes("plane")`. Weaker than the old regex; the note is fixture metadata, not product English.
- `roster-reader/test/source.test.mjs`
  - fixture input "private note" changed to the token "NOTE-7f3a" (the column is unread, so the test still checks no leak); the regex matches the token.
- `build/tests-english-baseline.json`: NOT changed. It is a product file no module owns, so the job may not edit it; the two roster-reader entries (2 and 1) are now stale-high. The count only has to shrink, so the check passes; BOB drops them.

**Not changed**
- roster-reader.test.mjs lines 78 and 236: the regex scanner flags them only because the comment text contains "matched" / "matching"; they are comments, not assertions.
- No source change: the B-site keys already exist in source (org-chart.mjs, staff-roster.mjs), so the job is test-only.

**Checks**
- `node --test roster-reader/test/`: 27 pass, 0 fail.
- words check for roster-reader: 0 failures, testenglish 0.

**Found in other modules:** none.

**Met** · none

Tests: 27/27. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegL9Z2aotsAHfwYdpm): test runs 1, module lines 3624
