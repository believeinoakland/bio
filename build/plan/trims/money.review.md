# money: review of the rewrite against the original

Original: /home/user/civicsmith/build/requirements/money.md. Rewrite: scratchpad/trim/money.md. Both read whole.

## GAP 1: R37, the filter narrowed from "considers" to "counts"; items no longer filtered
- Original: "`neighbours({node, kinds, at, page, viewer})` considers only facts of the asked connection kinds ... that are not withdrawn, have both parties, are visible to the viewer, and are valid or undetermined at `at`." Test: "a fund with 1,001 facts of which 3 are valid at `at` answers 3 items, not a hub ...; a fact hidden from the viewer changes neither `set_size` nor the items."
- Rewrite: "`neighbours({node, kinds, at, page, viewer})` counts only facts of the asked connection kinds ..." The 1,001/3 case was moved to Suggestions, which bind nothing; the hidden-fact test was dropped.
- Effect: the rule now limits only the hub count. Nothing binding says the items answered are limited by `at`, `kinds`, both parties and sight.
- Restore: "`neighbours({node, kinds, at, page, viewer})` considers only facts of the asked connection kinds (all five when `kinds` is absent) that are not withdrawn, have both parties, are visible to the viewer and are valid or undetermined at `at`, both for the hub count and for the items it answers." Also restore the test: "a fund with 1,001 facts of which 3 are valid at `at` answers 3 items, not a hub; a fact hidden from the viewer changes neither `set_size` nor the items."

## GAP 2: R29, the census test dropped
- Original: "a census test finds that no money act answers `BAD_PERIOD`" and "Test: `recordfact` with `{fiscal: \"FY2025-26\", body}` answers `MONEY_BAD_PERIOD` with the reason in `detail`; control: a first day after a last day is refused as before and a valid fiscal key is accepted; the census finds no `BAD_PERIOD` from any money act."
- Rewrite: "No money act answers `BAD_PERIOD` for any period refusal (from, to, fiscal; K4438)". It requires no census test, and the control that a valid fiscal key is still accepted and an inverted range still refused is gone.
- Restore: append "A census test finds that no money act answers `BAD_PERIOD`. Control: a first day after a last day is still refused, and a valid fiscal key is accepted."

## GAP 3: R38, the control "`moneyOf` answers as before" dropped
- Original: "Control: a bad role is refused; `moneyOf` answers as before." (R38 is headed "amends R9".)
- Rewrite: no statement that `moneyOf` is unchanged. Only "facts merely concerning the entity are not answered (`moneyOf`'s)".
- Effect: because R38 still says "amends R9", nothing now says that R9's behaviour is untouched.
- Restore: append "`moneyOf` (R9) answers as before."

## GAP 4: R27, the three test cases dropped
- Original: "Test: `declaredOpHolds` for each, with only its requires, without each, and with a field outside its accepts (`declared-ops.test.mjs`)."
- Rewrite: "Each holds under `declaredOpHolds` (`declared-ops.test.mjs`)."
- Effect: the rewrite no longer requires the three cases: only the required fields, each required field missing, and a field outside the accepts.
- Restore: "Each holds under `declaredOpHolds` with only its requires, without each, and with a field outside its accepts (`declared-ops.test.mjs`)."

## Checked and not reported
- R2 now says "in order". This adds nothing, because R1 already places R2's refusals at the end of its ordered list.
- R37's "(per kind, never summed across kinds)" adds nothing. It states what the original's 900+900 test already required.
- R26 dropped its purpose clause ("so a member reads the one sentence every module gives for it"). The shared row still carries that obligation.
- Every cited ruling id is kept, sometimes moved into the requirement's header (K4369, K5517, K5786, K5806). Every Uses entry and every Satisfies citation is kept.
