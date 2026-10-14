**Status** · Carried to L6's fold (K3198): N1026's thirty-day series, drafted for ai-accounts at L2's fold, moves to `ai-use` (T48-29) with a new id, re-worded for ai-use's own owners and tables (its R1, R2, R4, R12).

- **R34** (T48; N1026; DEC-215 (1); K3138, K1450) `accountUseOverTime({owner, viewer, at})` answers one account's use over time to that account's owners, with R15's owners and refusals and `owner` spelled as R14's. It answers `{owner, days, periods}`: *(not yet met: T48)*
  - `days`: the thirty days ending with the day of `at`, oldest first, each `{day, calls, dollars}` (`dollars` the estimated cost), a day with no use answered with zeros;
  - `periods`: one entry for each limit set on the account, `{scope, unit, period, period_start, used, limit}`, `used` the use in the limit's current period up to `at`; with no limit set, one entry for the month with `limit: null`.
  - Every figure is summed over every member the account serves and names no member (K1450). The days of a month sum to that month's total as the account's month table answers it.
  - When the use cannot be read it answers `unreadable: true`, never zeros. It writes nothing and never throws.
