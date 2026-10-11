# docket (T45)

**Status** · session_01WJkNJBh3kNMavvSr8hujuE · depth 2 · WORKING · handled B0

## J1 · QUESTION

Readings I am building on (carrying on meanwhile; none blocks me):
1. R6 outcome `summary`: a public `outcome` entry carries the summary *as filed* (the member's words, R1). `docketPrepare`'s `summary` is not read for an `outcome` entry (it stays the manager's words for every other kind, as today).
2. A record entry of kind `outcome` filed before T45 (no `outcome`/`summary`) and still pending: `docketPrepare` refuses it `DOCKET_OUTCOME_UNREADABLE` (R4 re-runs R1's checks on what it would sign, and R6 says a public `outcome` entry carries both); the member re-files it. Published pre-T45 `outcome` entries are untouched and read `outcome: null` in R14's `fields` (and in R3).
3. R28's row: docket holds no copy. It finds `COUNSEL_MATTER_NOT_PUBLISHED`'s row in publication's exported `*_CHECKS` table by code (whatever the export's name), and answers `{ok:false, reason, code, check, translation}` from it. Until publication (T45-17) merges, my R28 tests are red by that alone. R28 also covers `docketFile`'s take-back form (`takesBack`), being `docketFile`; `docketDecline` is not named and is untouched. In `docketPrepare` it sits right after `DOCKET_NOT_THE_MANAGER`, before `DOCKET_NO_GROUP_SLUG`.
4. R27: `docketPressureMarks` and `docketPressureOf` are services only, no new op (an op would move the pinned ops maps in affordances/plane/op-declarations). Success answers carry `ok: true` beside R27's fields; a mark's id `mark` is its row number, `after` a mark id.
5. `DOCKET_OUTCOME_UNREADABLE` is row C-129.29 (region `is-docket-form`); `DOCKET_VOCABULARIES` is unchanged (the outcome kinds exported as `OUTCOME_KINDS` only), so affordances' pinned vocabularies don't move.
