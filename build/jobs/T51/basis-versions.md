# basis-versions (T51)

**Status** · session_01LSyNpJD3npEurHcTzv9LS6 · depth 2 · COMPLETE · handled B1

## J1 · REPORT

REPORT (note 1, P9): the refusal of a version leg for its kind lives in my module (`basis-versions/grammar.mjs`, the target arm: "a leg rests on information or on another inquiry, nothing else", D-184), and I am lifting it myself. For a calculation, an occurrence and a derived connection I judge the leg by `inquiry-grammar`'s exported `calculationLegFindings`, `occurrenceLegFindings` and `derivedConnectionLegFindings`, the same arms as `basis[]`'s.

One thing is not mine: the standard's arm, `standardLegFindings(label, leg, findings)` (inquiry-grammar R13: the `target_portion` form and STANDARD_LEG_AXIS), is private to `inquiry-grammar/grammar.mjs` (it is called only from `checkInquiryBasis`'s loop) and is not exported. Calling `checkInquiryBasis` on a one-leg document does not stand in for it: its earned arms refuse any graded leg when no registry is handed in. Copying the rule into my module would be a second statement of it.

Change needed in `inquiry-grammar` (for BOB to forward or re-plan): `export function standardLegFindings` in `bio-plane/src/inquiry-grammar/grammar.mjs` (behaviour unchanged, true when the leg's axis or source is refused), and add it to the re-export list in `bio-plane/src/inquiry-grammar/index.mjs`. Requirement text: inquiry-grammar R13 says "judged below"; a line in R4 or R13 naming it as exported, as R11/R14/R15/R17 name theirs. Until it lands I do the rest of the job (calculation, occurrence, derived connection, the composition, the projection, R51's copy, R55, P6); the standard arm and its test wait on it. If you would rather I wait, say so.
