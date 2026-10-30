# people.md trim: notes

## Size
- Old: 35,941 bytes. New: 30,596 bytes (-5,345, -14.9%). The 25,000 target was not reached without losing content: what is left is mostly obligations (refusal lists, row shapes, the R40 key list, the R24 quoted sentence, service signatures, Uses and Satisfies citations), which the brief says to keep.

## Id sequence (checked by script: `grep -oE '^\s*- \*\*R[0-9]+\*\*'` on both files, diff empty)
Old: R1 R2 R3 R4 R5 R6 R7 R8 R9 R10 R11 R12 R13 R14 R15 R16 R17 R18 R19 R20 R21 R34 R22 R23 R24 R25 R35 R26 R27 R36 R37 R38 R39 R40 R41 R43 R44 R28 R29 R30 R31 R32 R33 R42 (44)
New: R1 R2 R3 R4 R5 R6 R7 R8 R9 R10 R11 R12 R13 R14 R15 R16 R17 R18 R19 R20 R21 R34 R22 R23 R24 R25 R35 R26 R27 R36 R37 R38 R39 R40 R41 R43 R44 R28 R29 R30 R31 R32 R33 R42 (44)
Identical.

## Not-yet-met marks
Old: none (`*(not yet met:` occurs 0 times). New: none. Identical.
(The old Status line said R36, the T48 and the T51 ids were "marked not yet met", but no mark is present in the file. Status kept as history only; no mark added.)

## Other script checks
- Headings (`^#` lines): identical, all service signatures unchanged.
- Backticked identifiers: all kept. The only one gone is the bare `claim_joins_two` from R40's test sentence, now written as the full key `people.why.claim_joins_two`.
- Ruling and decision ids: every id cited by a requirement is kept. Dropped only from the Status history: K1970, K3195, K4214, T36-17, T48-23, T51-38 (and FR-64, C7, `draft-T48-fold-n847.md`).
- R-references: same set.

## What changed
- Status reduced to the in-force line, its rulings and the tranches that changed the file. Purpose, Terms and every rule reworded tightly.
- Test sentences that only repeated their rule were removed (R9 org address, R37, R39, R40's controls, R41). Facts only in a test were moved into the rule: R37 "pages ... without skip or repeat"; R40's mappings (no validity -> `people.why.validity_stated`, `{}`; not_same_as -> `claim_joins_two` with `{apart}`) now stated as rule text.
- R12: the `PERSON_ITEM_NOT_HELD` sentence moved up beside the other refusals. The old text gave no order among R12's refusals and the new text gives none ("in order" is not added).
- Suggestions cut hard; the T35/T36/Tests points are merged into one Tests line.

## Statements left long, and why
- R9: refusal order, the found-extent rule and the `question` sight rule are separate obligations.
- R24: holds DEC-131's exact `detail` sentence and mark.
- R37, R41: row shape, filters, order and counts are all testable.
- R40: the 13 keys, the owner pass-through rule and the hub/hop exceptions.
- R1, R12, R33: refusal and table lists.
- R42: the row shape and the op list.

## Ambiguities (text kept as it was)
1. R42 lists door names `withdrawidentityclaim`, `recordpersonfact`, `declaretie`, `withdrawtie`, but Provides' op names are `identitywithdraw`, `personfact`, `membertie`, `membertiewithdraw`. Are these the same ops under other names, or other names entirely?
2. R42 sits under "## Open for Bob", after Suggestions, while that section says "None". Placement kept.
3. R38 covers "a row of an organisation kind", but its test uses an office (kind `office`, not an organisation kind; offices became rows only with R41). It is unclear whether `note_by`/`machine` apply to office rows. Test kept in the rule for that reason.
4. R9 originally cited "amends R9" for itself (T51 fix round 2); dropped as self-reference, K4303 kept.
5. R20's heading names four services but only three ops (`memberties` covers both reads?). `recordedBy` (R36), `peopleDirectory`'s op aside, and `onChecksChanged` (R35) appear in no service heading's op list. Kept.
6. R12: "an id that answers no person fact, claim, tie or link" — no order relative to the ground refusals is stated.
7. R40 "a hub answer (R26)": R26 says nothing of hubs; the term comes from `connection-grammar`. Kept.

No other module file was read.

## Review fixes (people.review.md, 5 gaps; all five judged real and applied)
1. R9: "(T51 fix round 2, C7; K4303; screens-investigate R53)" moved back onto the organisation-facts clause; the question clause again falls under the earlier T35 / DEC-164 citation, as in the original.
2. Suggestions, revolving door: restored "the ladders' \"as calculations with denominators\" is met by R22's denominator".
3. Suggestions, scheduler: restored "registers a consumer that calls `evaluateChecks` on the one alarm with a stated budget".
4. Suggestions, tests: R36's lost test restored ("a fact from a found extent named with its member"; hidden = neither answered nor counted).
5. Suggestions, tests: restored "R10 a machine address write refused".
Nothing else changed.

Re-run checks after the fixes:
- Id sequence (`grep -oE '^\s*- \*\*R[0-9]+\*\*'`, diff old vs new): identical, 44/44.
- Not-yet-met marks: 0 old, 0 new, identical.
- New size: 30,861 bytes (old 35,941).
