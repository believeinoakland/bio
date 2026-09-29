# actions (T11)

**Status** · session_01QJraYCYw3CtTBeXsM2piAx · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings I am building now (step 3: I carry on while you answer).

**Q1 (N217, K275: `NO_REASON`).** `actionMove`'s `NO_REASON` (R13) is its own condition: a move of an action states no reason. It has no row today, and four other modules hold rows named `NO_REASON` for their own conditions (progressions, intent, escalation, consequences). My reading: rename it `ACTION_MOVE_NO_REASON`, with its own row C-117.4 in this module (`actionMove > is-move-reason`); R13's wording `NO_REASON` → `ACTION_MOVE_NO_REASON` is yours to change (K238: a code is interface detail). Actions mints no `NOT_A_PARTICIPANT`. Affordances' `reasoned` code list (`src/affordances.mjs` 453, 711) names `NO_REASON` for `actionmove`; that is a later module's (layer 11), and I will REPORT it.

**Q2 (the refusal-code guard, arm G).** `pendingClocks` answers `BAD_DATE` for a `before` that is not a date (R31 names no refusal), sharing C-33.6's code with `actionCorrespond`'s entry date: two conditions, one code. My reading: its own code `PENDING_CLOCKS_BAD_BEFORE`, row C-117.5. `monitoring` passes a refused read's `reason` through without testing it (`deadlineRecheck`), so nothing downstream breaks.

Not questions, for your record: N246's `NO_RULE` I resolve by R32's second arm (removed; an absent `rule` is answered `NO_SUCH_RULE` at that code's place). `BAD_RISK_TIER` (actionRiskTier and actionRiskPropose, one condition) and `ACTION_NO_DETERMINATION` (two sites in `#breachRefusal`) each go through one helper, as N297's `RECORDS_LAW_REFUSED` does.
