# money (T52)

**Status** · session_018Bhcef9ixS7sA7mnPM5bZx · depth 2 · WAITING: BOB's users' suites run (proc tests --users) in progress; record stays COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# money T52 report

Entries applied: T52-17.
- R34 (C-K6): a fiscal year sent with no body never prints `*`; the refusal (MONEY_BAD_PERIOD) says no body was named. Named-body refusals are unchanged. Two new sentences are written at their use as `localize` (`money.index.no_body_named_for_fiscal`, `money.index.no_body_named_no_period`); the design's words row does not exist yet: REPORT for the design/word table. Where a team states its fiscal year is not built (Bob's ruling pending).
- R35 (C-K7): `neighbours` with a set id (`MSR-…`) answers the edges of the included facts whose payer and payee are entities or funds, a `nodes` list (payers, payees, and the source document named by its bundle title), and one edge set→document of a new kind `money_source` (word "source document", evidentiary). A set of as-written facts, an absent set or a set the viewer may not see answers no items and no nodes, no refusal. What an as-written name draws waits on Bob's ruling.
- Tests: `bio-plane/test/m/money/t52-w8.test.mjs`; money suite 122 pass.
Not done: the two waits above (Bob's rulings). Found in other modules: the words table (setup-words generated rows) is stale for the two new sentences; `proc merge` regenerates it. The `money_source` kind is new to connection-grammar's registry via money's owner registration.

**Met** · R34, R35

Tests: 122/122. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcef9ixS7sA7mnPM5bZx): test runs 1, module lines 1649
