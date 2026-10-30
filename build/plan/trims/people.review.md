# people.md trim review

Original: /home/user/civicsmith/build/requirements/people.md. Rewrite: scratchpad/trim/people.md. Both compared requirement by requirement. R1-R8, R10-R44 (except as below), Uses and Satisfies keep their meaning.

## GAP 1 — R9: the citations for an organisation's facts moved to the question clause

- Original: the question clause ends "... a fact recorded without one answers `question: null`." and the organisation clause opens "(T51 fix round 2, C7; K4303; amends R9; screens-investigate R53) **An organisation's facts.** For an entity of kind `institution`, ..." The Status line agrees: "fix round 2, C7, K4303: R9 serves organisations' name, address and contact facts".
- Rewrite: "... without one, `question: null` (K4303; screens-investigate R53). **Organisations.** For kind `institution`, `body` or `movement`: ..." The question clause now cites K4303 and screens-investigate R53, and the organisation clause cites nothing. (In the original the question clause came under the T35 / DEC-164 (5) citation.)
- Restore: "... without one, `question: null`. (T51 fix round 2, C7; K4303; screens-investigate R53) **Organisations.** For kind ..."

## GAP 2 — Suggestions, Revolving door: a point was lost

- Original: "Kept as a shipped check (R22) so it shares the gate and the hypothesis label; the ladders' \"as calculations with denominators\" is met by R22's denominator."
- Rewrite: "Revolving door is a shipped check (R22), so it shares gate and label."
- Restore: append "; the ladders' \"as calculations with denominators\" is met by R22's denominator."

## GAP 3 — Suggestions, Scheduler: the consumer and its stated budget were lost

- Original: "`scheduler` (T33-80) registers a consumer that calls `evaluateChecks` on the one alarm with a stated budget"
- Rewrite: "`scheduler` (T33-80) calls `evaluateChecks` on the one alarm"
- Restore: "`scheduler` (T33-80) registers a consumer that calls `evaluateChecks` on the one alarm with a stated budget"

## GAP 4 — Suggestions, T36 key tests for R36: one test was lost

- Original: "Key tests for R36: a person fact recorded from a found extent named with its member; a fact inside a hidden project neither answered nor counted; a source link held on the same extent absent from every answer; an expunged fact absent."
- Rewrite: "R36 (K2092) hidden, linked, expunged absent". The first test is gone, and R36's rule does not state "named with its member".
- Restore: "R36 (K2092): a fact from a found extent named with its member; hidden (neither answered nor counted), linked, expunged absent"

## GAP 5 — Suggestions, Tests: the R10 test was lost

- Original: "... R8 on a generated fixture ...; R10 a machine address write refused; R12 each ground; ..."
- Rewrite: "... R8 fixture of two Michael Houstons and a thousand others; R9 found extent, question withheld; R12 each ground; ..." There is no R10 item.
- Restore: insert "R10 a machine address write refused;" before "R12 each ground".

Not reported: the dropped Status history; dropped rationale sentences (R1 "Same organization?", R34 "instead of withholding ...", R38 "A screen can then tell ..."); tests that only restate their rule (R9, R37, R39, R40, R41); ruling ids the rewrite moved into a section heading (R36 N715, R37 K3104, R39 T48/N1032/K3145), into the body text (R24 DEC-131) or next to the clause (R40 K3865/K3992); and the cross-reference "(R29)" added to Purpose, which adds no obligation.

DONE people-review 5
