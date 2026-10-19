# leg-earning (T51)

**Status** · session_01RTtq97ZaJKFYsmuNFMRacD · depth 2 · WORKING · handled B0

## J1 · REPORT

One sentence for BOB to settle (not a finding in my module, not converted).

The words row `leg-earning.ceiling.grade_reachable_capture` in `docs/development/ux-substrate/screens/words.json` is a different sentence from the code's ceiling sentence. The code's sentence (`leg-earning.index.grade_unreachable_capture_grade_is`, and `_2` at the standard site) ends "...does not claim (CAPTURE-FIDELITY.md)." and fills `{UNREACHABLE_CAPTURE_GRADE}`; the design row ends "...does not claim." and uses `{unreachable_capture_grade}`. The rule (K3930 (d)) converts only a sentence equal to its row, so the code keeps its own localize text. Both code ids answer their code text while the row is not matched.

Decision for BOB: if the design's wording is the one to ship, the two localize sites become `word("leg-earning.ceiling.grade_reachable_capture", { unreachable_capture_grade: ... })` and the words test follows. If the code's wording stands, the design row is the one that should change. Until then the ceiling reads the code's text.
