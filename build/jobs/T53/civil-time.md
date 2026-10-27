# civil-time (T53)

**Status** · session_018BhcefMpVQvXKBiGcUYBvE · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# civil-time · T53 report

**Entries applied**
- T53-15 (A2): `fiscalPeriod` maps over a team-layer entry exactly as over a Civicsmith one and its answer (and each candidate of a two-year band) carries `from: {profile, origin}` as the entry gives them (omitted keys stay omitted; nothing is assumed). The undetermined reasons name the body asked; body `*`, empty or blank gives the new key `civil-time.missing.fiscal_year_no_body` ("no government was named"); no reason var holds `*`. Tests: R31 test in `recurrence.test.mjs` (team vs Civicsmith same mapping, origin, band candidates, absent/withheld naming the body, no `*`).
- T53-16 (K5565): the five English sites (recurrence 49; rules 174, 183, 235, 256) converted. B sites given keys in the module (`civil-time.rules.close_of_business_no_opening`, `..._no_hours`, `calendar_entry_status`, `calendar_entry_on_correction`, read through `reasonText`, so the words check's `missingkey` is satisfied without a design row); the "this instance|the plane" negative regex removed (a wording matter for the word table, K3810; the notes are asserted by key). Three further inline English copies in rules.test (corrected-calendar notes) converted to `word(...)`. Words check 0 failures; civil-time suite 71 pass, 0 fail.

**Not done / for BOB**
- The ownership check refuses a job touching `build/tests-english-baseline.json` or `setup-words/rows.mjs`, so neither is edited: BOB lowers the baseline (both civil-time test files now hold 0 English sites; `words.mjs --baseline` shows it) and the merge regenerates rows (5 new code-written civil-time rows; the tests read them through `reasonText`, which works before regeneration).
- `fiscalPeriod`'s new `from` field: money and calculations read only `label/start/end`; unaffected.

**Found in other modules:** none. (jurisdictions' `combine` does not yet tag entries with `origin`; R31 passes it through when present, R134/R115 is that module's.)

**Met** · R31

Tests: 52/53. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Inherited reds: ["NO RESULT bio-plane/test/m/civil-time/values.test.mjs"]
Heavy tests: bio-plane/test/m/civil-time/values.test.mjs 4111 MB
Size (session_018BhcefMpVQvXKBiGcUYBvE): test runs 1, module lines 1537
