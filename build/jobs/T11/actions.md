# actions (T11)

**Status** · session_01QJraYCYw3CtTBeXsM2piAx · depth 2 · WORKING · handled B3

## J1 · QUESTION

Two readings I am building now (step 3: I carry on while you answer).

**Q1 (N217, K275: `NO_REASON`).** `actionMove`'s `NO_REASON` (R13) is its own condition: a move of an action states no reason. It has no row today, and four other modules hold rows named `NO_REASON` for their own conditions (progressions, intent, escalation, consequences). My reading: rename it `ACTION_MOVE_NO_REASON`, with its own row C-117.4 in this module (`actionMove > is-move-reason`); R13's wording `NO_REASON` → `ACTION_MOVE_NO_REASON` is yours to change (K238: a code is interface detail). Actions mints no `NOT_A_PARTICIPANT`. Affordances' `reasoned` code list (`src/affordances.mjs` 453, 711) names `NO_REASON` for `actionmove`; that is a later module's (layer 11), and I will REPORT it.

**Q2 (the refusal-code guard, arm G).** `pendingClocks` answers `BAD_DATE` for a `before` that is not a date (R31 names no refusal), sharing C-33.6's code with `actionCorrespond`'s entry date: two conditions, one code. My reading: its own code `PENDING_CLOCKS_BAD_BEFORE`, row C-117.5. `monitoring` passes a refused read's `reason` through without testing it (`deadlineRecheck`), so nothing downstream breaks.

Not questions, for your record: N246's `NO_RULE` I resolve by R32's second arm (removed; an absent `rule` is answered `NO_SUCH_RULE` at that code's place). `BAD_RISK_TIER` (actionRiskTier and actionRiskPropose, one condition) and `ACTION_NO_DETERMINATION` (two sites in `#breachRefusal`) each go through one helper, as N297's `RECORDS_LAW_REFUSED` does.

## J2 · QUESTION

**Replaces J1** (same two readings; one new fact on Q1). Built as read below; the module's 37 tests are green.

**Q1 (N217, K275: `NO_REASON`).** `actionMove`'s `NO_REASON` (R13) is its own condition: a move of an action states no reason. It had no row, and four other modules hold rows named `NO_REASON` for their own conditions. Built: renamed `ACTION_MOVE_NO_REASON`, its own row C-117.4 (`actionMove > is-move-reason`). R13's wording is yours to change (K238). **New fact:** affordances' `JUSTIFICATION_REFUSALS` (`src/affordances.mjs` 453; `actionmove: "reasoned"` 711) lists `NO_REASON`, so `test/m/affordances` R19 ("every `reasoned` op … is refused with a code in JUSTIFICATION_REFUSALS") goes red (72/1; 73/0 without my change), and affordances has no job in T11. So either (a) the rename stands and affordances gains `ACTION_MOVE_NO_REASON` in that list (a one-line entry, T11 layer 11 or T12), or (b) I keep `NO_REASON` minted here, give it no row, and N217's `NO_REASON` share waits for affordances. My recommendation is (a), in T11's layer 11 if you can add it, since the break is one line in the list. Say which, and I conform.

**Q2 (the refusal-code guard, arm G).** `pendingClocks`' `BAD_DATE` (a `before` that is not a date; R31 names no refusal) shared C-33.6's code with `actionCorrespond`'s entry date. Built: its own code `PENDING_CLOCKS_BAD_BEFORE`, row C-117.5. `monitoring` passes a refused read's `reason` through untested.
