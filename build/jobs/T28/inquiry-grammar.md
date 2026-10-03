# inquiry-grammar (T28)

**Status** · session_01PnLhSoHMj7KMjQmdKaYkP6 · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings of R11, building on them now; answer only if either is wrong.

1. **The other grade and part arms on a leg on a ref.** R11 names the arms that run unchanged (lead and theme first, role, grounds). Reading: for such a leg the grade-vocabulary, axis/source, hunch, testimony, earned, inherited and extent arms (C-2.8, C-21.2) stay silent, since every field they judge is already one C-21.3 departure (one complaint per broken field, the grammar's own discipline). The note-is-a-string check still runs. "Carries no X" reads `undefined`, `null` and `''` as absent; "extent" is any authored extent field (`content.legHasAuthoredExtent`); `target_edition` must be an integer > 0.
2. **basis-versions R3 needs R11's form check at its door.** It "passes C-25.14 when inquiry-grammar R11 judges its form", but R11's Provides names only the three spelling names. Reading: I also export the leg arm as `importedLegFindings(label, leg, findings, checkId = "C-21.3")` → true when the leg's target is a ref (pushing one finding per departure), false otherwise, so basis-versions consults it as it consults `leadLegFindings`. Proposed wording for Provides: "`importedLegFindings(label, leg, findings)`: R11's leg arm, answering whether the leg's target is a ref." The `references[]` refusal stays inside `checkInquiryBasis` (it is about the document, not a leg).
Also: `importedFindingRef(import, finding)` answers null when the two parts would not spell a ref `IMPORTED_FINDING_RE` matches (so it never spells one the grammar refuses).
