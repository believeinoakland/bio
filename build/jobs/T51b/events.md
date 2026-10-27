# events (T51b)

**Status** · session_01Ko31oRwx6KqRAKesZzHQ8g · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# events T51b report

Entries applied: T51b-1. Took `pass/zone-T51b`'s change to `events/index.mjs` (`zone()` is `jurisdictions.governingZone(profiles, team_time_zone)`, the view's zone only when that gives none). Brought the five reds to the requirement:
- R35 (pages): the zone is now a store read; `neighbours` reads it once per kept-store stamp (`kept.zone`, emptied with the kept answers on any write), so the walk is back within its statement bound.
- R23, R42, R53, R54: tests now state the zone as the requirement says. R23 states `team_time_zone` (the gold set's Pacific zone) over the profile's; the no-zone cases (R42, R53, R54) are stores with no profile (`profiles: false`) and no view zone; R42's "another zone" case states `team_time_zone` UTC.
No requirement sentence needs changing (no question to BOB).
Events suite 101/101; users' suites lines, standards, progressions, money, money-checks, duties, people, explore, retrieval-browse, answers, strength, contradiction, retrieval, calculations all green (affordances not run).
Other modules: none found.

**Met** · R23, R42

Tests: 101/101. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_01Ko31oRwx6KqRAKesZzHQ8g): test runs 1, module lines 2831
