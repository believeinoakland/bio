# ai-use (T48)

**Status** · session_01DzrGZm2nuzLBz5wLwMQe5d · depth 2 · WORKING · handled B0

## J1 · QUESTION

R14 (`accountUseOverTime`), three points the text leaves open. I am building on these readings; answer only if one is wrong.

1. **`per_member` limit's `used`.** "Every figure is summed over every member" would make a per-member limit's `used` the account's total, which is not what is counted against that limit (R3 counts one member's use). My reading: for `per_member`, `used` is the most any one member used in the period, naming none, exactly as R12's `aiLimits` answers it; every other figure (days, the use and overall limits, the no-limit month) is summed over all members.
2. **The no-limit entry's unit.** With no limit set, the one month entry needs a `unit`. My reading: `{scope: "overall", unit: "usd", period: "month", period_start, used, limit: null}`, `used` the month's summed estimated dollars, since DEC-215 (1) draws the bars and meter in dollars ("calls follow the dollars"); the overall limit's `used` excludes exclusive uses as R3 does (none exist when no limit is set, so it is the month's whole total).
3. **"up to `at`".** The counter is kept per local day, so `used` counts the period's days up to and including the local day of `at` (a row on a later day, which only a clock skew could write, is not counted). `limit` is in the limit's unit (`usd` in dollars, as R12 answers `amount`).
